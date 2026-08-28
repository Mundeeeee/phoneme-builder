"use client";

import { useEffect, useMemo, useState } from "react";
import { hintFor, KEY_ROWS, KEY_ROWS_COLUMNS } from "@/lib/phonemeData";
import { generateWordleHtml } from "@/lib/generateWordleHtml";
import { downloadHtml } from "@/lib/downloadHtml";
import { useWordLists } from "@/hooks/useWordLists";

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

function wordToUnits(word) {
  return word.phonemes.map((p) => p.symbol);
}

export default function WordleBuilder() {
  const { wordLists, loading, error } = useWordLists();

  const [selectedListId, setSelectedListId] = useState(null);
  const [selectedWordId, setSelectedWordId] = useState(null);
  const [maxGuesses, setMaxGuesses] = useState(6);
  const [showHints, setShowHints] = useState(true);
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [englishText, setEnglishText] = useState("");
  const [englishNotFound, setEnglishNotFound] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [currentGuess, setCurrentGuess] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");

  // Once word lists load, default to the first list and its first word.
  useEffect(() => {
    if (wordLists.length === 0) return;
    if (selectedListId && wordLists.some((l) => l.id === selectedListId)) return;
    const firstList = wordLists.find((l) => l.words.length > 0) || wordLists[0];
    setSelectedListId(firstList.id);
    const firstWord = firstList.words[0];
    setSelectedWordId(firstWord?.id ?? null);
    setEnglishText(firstWord?.englishWord ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordLists]);

  const selectedList = wordLists.find((l) => l.id === selectedListId);
  const words = selectedList?.words || [];
  const selectedWord = words.find((w) => w.id === selectedWordId) || words[0];
  const target = useMemo(() => (selectedWord ? wordToUnits(selectedWord) : []), [selectedWord]);

  function resetGame() {
    setCurrentGuess([]);
    setGuesses([]);
    setGameOver(false);
    setMessage("");
  }

  function handleListChange(e) {
    const listId = e.target.value;
    setSelectedListId(listId);
    const list = wordLists.find((l) => l.id === listId);
    const firstWord = list?.words[0];
    setSelectedWordId(firstWord?.id ?? null);
    setEnglishText(firstWord?.englishWord ?? "");
    setEnglishNotFound(false);
    resetGame();
  }

  function handleWordChange(e) {
    const wordId = e.target.value;
    setSelectedWordId(wordId);
    const word = words.find((w) => w.id === wordId);
    setEnglishText(word?.englishWord ?? "");
    setEnglishNotFound(false);
    resetGame();
  }

  // Typing an English word searches every loaded word list (case
  // insensitive) and jumps to the first match, driven by stored data
  // instead of the fixed lookup table used in Assessment 1.
  function handleEnglishTextChange(e) {
    const value = e.target.value;
    setEnglishText(value);
    const needle = value.trim().toLowerCase();
    if (!needle) {
      setEnglishNotFound(false);
      return;
    }
    for (const list of wordLists) {
      const match = list.words.find((w) => w.englishWord.toLowerCase() === needle);
      if (match) {
        setSelectedListId(list.id);
        setSelectedWordId(match.id);
        setEnglishNotFound(false);
        resetGame();
        return;
      }
    }
    setEnglishNotFound(true);
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
      setMessage(`Correct! ${englishText} (${target.join(" ")})`);
    } else if (nextGuesses.length >= maxGuesses) {
      setGameOver(true);
      setMessage(`Out of guesses. The word was ${englishText} (${target.join(" ")}).`);
    } else {
      setMessage("");
    }
  }

  function handleGenerate() {
    if (target.length === 0) return;
    const html = generateWordleHtml({
      targetUnits: target,
      englishWord: englishText,
      maxGuesses,
      showHints,
      title: "Phoneme'le",
    });
    downloadHtml("phoneme-wordle.html", html);
  }

  // Persists the current settings as a reusable ActivityConfig row, so a
  // teacher can come back to this exact configuration later (demonstrates
  // the backend "save activity settings" requirement).
  async function handleSaveConfig() {
    if (!selectedListId) return;
    setSaveMessage("Saving...");
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "WORDLE",
          title: `Phoneme'le - ${englishText || "untitled"}`,
          difficulty,
          showHints,
          maxGuesses,
          wordListId: selectedListId,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save activity.");
      }
      setSaveMessage("Saved!");
    } catch (err) {
      setSaveMessage(err.message || "Failed to save activity.");
    } finally {
      setTimeout(() => setSaveMessage(""), 3000);
    }
  }

  const keyStates = useMemo(() => computeKeyStates(guesses), [guesses]);

  if (loading) {
    return (
      <div className="card">
        <p>Loading word lists from the database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <p style={{ color: "var(--bad)" }}>{error}</p>
      </div>
    );
  }

  if (wordLists.length === 0 || !selectedWord) {
    return (
      <div className="card">
        <p>
          No word lists yet. Go to{" "}
          <a href="/word-lists">Word Lists</a> to create one with at least one word before
          building a Wordle activity.
        </p>
      </div>
    );
  }

  return (
    <div className="grid-2">
      <div className="card">
        <span className="eyebrow">Activity settings</span>
        <h2>Build your Wordle</h2>

        <div className="field-row-with-action">
          <div className="field-row-with-action-fields">
            <label htmlFor="englishWord">English Word</label>
            <input
              id="englishWord"
              type="text"
              value={englishText}
              onChange={handleEnglishTextChange}
              placeholder="Type a word, e.g. bed"
            />
            {englishNotFound && (
              <p style={{ fontSize: "0.8rem", color: "var(--bad)", marginTop: "-0.6rem" }}>
                Not in any saved word list yet. Add it on the{" "}
                <a href="/word-lists">Word Lists</a> page, or pick one below.
              </p>
            )}

            <label htmlFor="phonemeWord">Phoneme Word</label>
            <input id="phonemeWord" type="text" value={target.join(" ")} readOnly />

            <label htmlFor="wordList">Word list</label>
            <select id="wordList" value={selectedListId || ""} onChange={handleListChange}>
              {wordLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name} ({list.words.length} word{list.words.length === 1 ? "" : "s"})
                </option>
              ))}
            </select>

            <label htmlFor="word">Target word</label>
            <select id="word" value={selectedWordId || ""} onChange={handleWordChange}>
              {words.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.englishWord} ({wordToUnits(w).join(" ")})
                </option>
              ))}
            </select>

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

            <label htmlFor="difficulty">Difficulty</label>
            <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <div className="field-row-with-action-button">
            <button type="button" className="btn btn-accent" onClick={handleGenerate}>
              Generate
            </button>
            <button type="button" className="btn btn-quiet" onClick={handleSaveConfig}>
              Save activity
            </button>
            <button type="button" className="btn btn-quiet" onClick={resetGame}>
              Reset preview
            </button>
            {saveMessage && (
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0 }}>{saveMessage}</p>
            )}
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
          <div className="wordle-grid" style={{ justifyItems: "center" }}>
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
