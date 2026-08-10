"use client";

import { useMemo, useState } from "react";
import { WORD_LISTS_BY_LENGTH } from "@/lib/wordLists";
import { englishFor, hintFor, KEY_ROWS, KEY_ROWS_COLUMNS } from "@/lib/phonemeData";
import { generateWordleHtml } from "@/lib/generateWordleHtml";
import { downloadHtml } from "@/lib/downloadHtml";

function scoreGuess(guess, target) {
  const result = new Array(guess.length).fill("absent");
  const used = new Array(target.length).fill(false);
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === "correct") continue;
    for (let j = 0; j < target.length; j++) {
      if (!used[j] && guess[i] === target[j]) {
        result[i] = "present";
        used[j] = true;
        break;
      }
    }
  }
  return result;
}

// Real Wordle keyboards remember the best result seen so far for each key.
const STATE_RANK = { correct: 3, present: 2, absent: 1 };
function computeKeyStates(guesses) {
  const states = {};
  guesses.forEach((g) => {
    g.units.forEach((symbol, i) => {
      const state = g.result[i];
      const existing = states[symbol];
      if (!existing || STATE_RANK[state] > STATE_RANK[existing]) {
        states[symbol] = state;
      }
    });
  });
  return states;
}

export default function WordleBuilder() {
  const [length, setLength] = useState(3);
  const [wordIndex, setWordIndex] = useState(0);
  const [maxGuesses, setMaxGuesses] = useState(6);
  const [showHints, setShowHints] = useState(true);
  const [englishWordOverride, setEnglishWordOverride] = useState(null);

  const [currentGuess, setCurrentGuess] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");

  const wordList = WORD_LISTS_BY_LENGTH[length];
  const target = wordList[wordIndex % wordList.length];
  const autoEnglishWord = target.map(englishFor).join("");
  const englishWord = englishWordOverride ?? autoEnglishWord;

  function resetGame() {
    setCurrentGuess([]);
    setGuesses([]);
    setGameOver(false);
    setMessage("");
  }

  function handleLengthChange(e) {
    setLength(Number(e.target.value));
    setWordIndex(0);
    setEnglishWordOverride(null);
    resetGame();
  }

  function handleWordChange(e) {
    setWordIndex(Number(e.target.value));
    setEnglishWordOverride(null);
    resetGame();
  }

  function addPhoneme(symbol) {
    if (gameOver || currentGuess.length >= target.length) return;
    setCurrentGuess((g) => [...g, symbol]);
  }

  // Clicking a filled tile in the active row removes that phoneme
  // (replaces a separate Delete button, per the wireframe).
  function removeAt(index) {
    if (gameOver) return;
    setCurrentGuess((g) => g.filter((_, i) => i !== index));
  }

  function checkGuess() {
    if (gameOver) return;
    if (currentGuess.length !== target.length) {
      setMessage(`Add ${target.length - currentGuess.length} more phoneme(s) before checking.`);
      return;
    }
    const result = scoreGuess(currentGuess, target);
    const nextGuesses = [...guesses, { units: currentGuess, result }];
    setGuesses(nextGuesses);
    const won = result.every((r) => r === "correct");
    setCurrentGuess([]);
    if (won) {
      setGameOver(true);
      setMessage(`Correct! ${englishWord} (${target.join(" ")})`);
    } else if (nextGuesses.length >= maxGuesses) {
      setGameOver(true);
      setMessage(`Out of guesses. The word was ${englishWord} (${target.join(" ")}).`);
    } else {
      setMessage("");
    }
  }

  function handleGenerate() {
    const html = generateWordleHtml({
      targetUnits: target,
      englishWord,
      maxGuesses,
      showHints,
      title: "Phoneme'le",
    });
    downloadHtml("phoneme-wordle.html", html);
  }

  const wordOptions = useMemo(
    () => wordList.map((units, i) => ({ index: i, label: `${units.join(" ")}  →  ${units.map(englishFor).join("")}` })),
    [wordList]
  );

  const keyStates = useMemo(() => computeKeyStates(guesses), [guesses]);

  return (
    <div className="grid-2">
      <div className="card">
        <span className="eyebrow">Activity settings</span>
        <h2>Build your Wordle</h2>

        <label htmlFor="length">Phoneme length</label>
        <select id="length" value={length} onChange={handleLengthChange}>
          <option value={3}>3 phonemes</option>
          <option value={4}>4 phonemes</option>
          <option value={5}>5 phonemes</option>
        </select>

        <label htmlFor="word">Target word</label>
        <select id="word" value={wordIndex} onChange={handleWordChange}>
          {wordOptions.map((opt) => (
            <option key={opt.index} value={opt.index}>
              {opt.label}
            </option>
          ))}
        </select>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "-0.5rem" }}>
          Assessment 1 uses a single teacher-selected word. A rotating word list arrives in
          Assessment 2.
        </p>

        <div className="field-row-with-action">
          <div className="field-row-with-action-fields">
            <label htmlFor="phonemeWord">Phoneme Word</label>
            <input id="phonemeWord" type="text" value={target.join(" ")} readOnly />

            <label htmlFor="englishWord">English Word</label>
            <input
              id="englishWord"
              type="text"
              value={englishWord}
              onChange={(e) => setEnglishWordOverride(e.target.value)}
            />

            <label>Show hints</label>
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
              <span className="checkbox-row" style={{ padding: 0 }}>
                <input
                  type="radio"
                  id="hintsYes"
                  name="showHints"
                  checked={showHints === true}
                  onChange={() => setShowHints(true)}
                />
                <label htmlFor="hintsYes">Yes</label>
              </span>
              <span className="checkbox-row" style={{ padding: 0 }}>
                <input
                  type="radio"
                  id="hintsNo"
                  name="showHints"
                  checked={showHints === false}
                  onChange={() => setShowHints(false)}
                />
                <label htmlFor="hintsNo">No</label>
              </span>
            </div>

            <label htmlFor="guesses">Number of Guesses</label>
            <input
              id="guesses"
              type="number"
              min={3}
              max={10}
              value={maxGuesses}
              onChange={(e) => setMaxGuesses(Number(e.target.value))}
            />
          </div>

          <div className="field-row-with-action-button">
            <button type="button" className="btn btn-accent" onClick={handleGenerate}>
              Generate
            </button>
            <button type="button" className="btn btn-quiet" onClick={resetGame}>
              Reset preview
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <span className="eyebrow">Live preview</span>
        <h2>Phoneme&rsquo;le</h2>

        {message && (
          <div className={`result-banner ${gameOver ? (message.startsWith("Correct") ? "win" : "lose") : ""}`}>
            {message}
          </div>
        )}

        <div className="wordle-preview-layout">
          <div
            className="wordle-grid"
            style={{ justifyItems: "center" }}
          >
            {Array.from({ length: maxGuesses }).map((_, rowIndex) => {
              const submitted = guesses[rowIndex];
              const isActiveRow = !submitted && rowIndex === guesses.length && !gameOver;
              return (
                <div className="wordle-row" key={rowIndex}>
                  {Array.from({ length: target.length }).map((_, colIndex) => {
                    if (submitted) {
                      return (
                        <div
                          key={colIndex}
                          className="wordle-cell"
                          data-state={submitted.result[colIndex]}
                        >
                          {submitted.units[colIndex]}
                        </div>
                      );
                    }
                    const letter = isActiveRow ? currentGuess[colIndex] : "";
                    return (
                      <div
                        key={colIndex}
                        className="wordle-cell"
                        data-filled={Boolean(letter)}
                        onClick={isActiveRow && letter ? () => removeAt(colIndex) : undefined}
                        style={isActiveRow && letter ? { cursor: "pointer" } : undefined}
                        title={isActiveRow && letter ? "Click to remove" : undefined}
                      >
                        {letter || ""}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <table className="phoneme-table">
            <tbody>
              {KEY_ROWS.map((row, ri) => (
                <tr key={ri}>
                  {Array.from({ length: KEY_ROWS_COLUMNS }).map((_, ci) => {
                    const symbol = row[ci];
                    if (!symbol) return <td key={ci} className="phoneme-table-empty" />;
                    return (
                      <td
                        key={ci}
                        className="phoneme-table-key"
                        data-state={keyStates[symbol]}
                        data-hint={showHints ? hintFor(symbol) : undefined}
                        onClick={() => addPhoneme(symbol)}
                        role="button"
                        tabIndex={gameOver ? -1 : 0}
                        aria-label={showHints ? `Phoneme ${symbol}, ${hintFor(symbol)}` : `Phoneme ${symbol}`}
                      >
                        {symbol}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={checkGuess}
          disabled={gameOver}
          style={{ marginTop: "1rem" }}
        >
          Enter
        </button>
      </div>
    </div>
  );
}
