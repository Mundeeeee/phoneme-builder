"use client";

import { useEffect, useMemo, useState } from "react";
import { englishFor } from "@/lib/phonemeData";
import { generateWordSearchHtml } from "@/lib/generateWordSearchHtml";
import { downloadHtml } from "@/lib/downloadHtml";
import { useWordLists } from "@/hooks/useWordLists";

const DIRECTIONS = [
  { dr: 0, dc: 1 }, { dr: 0, dc: -1 }, { dr: 1, dc: 0 }, { dr: -1, dc: 0 },
  { dr: 1, dc: 1 }, { dr: 1, dc: -1 }, { dr: -1, dc: 1 }, { dr: -1, dc: -1 },
];

function key(units) {
  return units.join("");
}

function wordToUnits(word) {
  return word.phonemes.map((p) => p.symbol);
}

function buildPuzzle(words, rows, cols) {
  const matrix = Array.from({ length: rows }, () => new Array(cols).fill(null));
  const solutions = [];
  const pool = Array.from(new Set(words.flat()));

  words.forEach((units) => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 300) {
      attempts++;
      const d = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      const endR = r + d.dr * (units.length - 1);
      const endC = c + d.dc * (units.length - 1);
      if (endR < 0 || endR >= rows || endC < 0 || endC >= cols) continue;

      let fits = true;
      for (let i = 0; i < units.length; i++) {
        const rr = r + d.dr * i;
        const cc = c + d.dc * i;
        if (matrix[rr][cc] && matrix[rr][cc] !== units[i]) {
          fits = false;
          break;
        }
      }
      if (!fits) continue;

      const coords = [];
      for (let i = 0; i < units.length; i++) {
        const rr = r + d.dr * i;
        const cc = c + d.dc * i;
        matrix[rr][cc] = units[i];
        coords.push({ r: rr, c: cc });
      }
      solutions.push({ display: key(units), coords });
      placed = true;
    }
  });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!matrix[r][c]) matrix[r][c] = pool[Math.floor(Math.random() * pool.length)] || "?";
    }
  }
  return { matrix, solutions };
}

function getPath(r1, c1, r2, c2) {
  const dr = r2 - r1;
  const dc = c2 - c1;
  if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    const stepR = dr === 0 ? 0 : dr / steps;
    const stepC = dc === 0 ? 0 : dc / steps;
    const path = [];
    for (let i = 0; i <= steps; i++) path.push({ r: r1 + stepR * i, c: c1 + stepC * i });
    return path;
  }
  return null;
}

export default function WordSearchBuilder() {
  const { wordLists, loading, error } = useWordLists();

  const [selectedListId, setSelectedListId] = useState(null);
  const [selectedWordIds, setSelectedWordIds] = useState([]);
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [activityTitle, setActivityTitle] = useState("Phoneme Word Search");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [saveMessage, setSaveMessage] = useState("");

  // Once word lists load, default to the first non-empty list and select
  // up to its first five words.
  useEffect(() => {
    if (wordLists.length === 0) return;
    if (selectedListId && wordLists.some((l) => l.id === selectedListId)) return;
    const firstList = wordLists.find((l) => l.words.length > 0) || wordLists[0];
    setSelectedListId(firstList.id);
    setSelectedWordIds(firstList.words.slice(0, 5).map((w) => w.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordLists]);

  const selectedList = wordLists.find((l) => l.id === selectedListId);
  const listWords = selectedList?.words || [];
  const activeWords = useMemo(
    () => listWords.filter((w) => selectedWordIds.includes(w.id)).map(wordToUnits),
    [listWords, selectedWordIds]
  );

  const [puzzle, setPuzzle] = useState({ matrix: [], solutions: [] });
  const [found, setFound] = useState({});
  const [selecting, setSelecting] = useState(false);
  const [start, setStart] = useState(null);
  const [highlighted, setHighlighted] = useState([]);

  // Rebuild the puzzle whenever the word selection or grid size changes.
  useEffect(() => {
    if (activeWords.length === 0) {
      setPuzzle({ matrix: [], solutions: [] });
      return;
    }
    setPuzzle(buildPuzzle(activeWords, rows, cols));
    setFound({});
    setHighlighted([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWordIds.join(","), rows, cols]);

  function handleListChange(e) {
    const listId = e.target.value;
    setSelectedListId(listId);
    const list = wordLists.find((l) => l.id === listId);
    setSelectedWordIds((list?.words || []).slice(0, 5).map((w) => w.id));
  }

  function toggleWord(wordId) {
    setSelectedWordIds((prev) =>
      prev.includes(wordId) ? prev.filter((id) => id !== wordId) : [...prev, wordId]
    );
  }

  function regenerate() {
    if (activeWords.length === 0) return;
    setPuzzle(buildPuzzle(activeWords, rows, cols));
    setFound({});
    setHighlighted([]);
  }

  function cellMouseDown(r, c) {
    setSelecting(true);
    setStart({ r, c });
    setHighlighted([{ r, c }]);
  }

  function cellEnter(r, c) {
    if (!selecting || !start) return;
    const path = getPath(start.r, start.c, r, c);
    if (path) setHighlighted(path);
  }

  function endSelection() {
    if (!selecting) return;
    setSelecting(false);
    if (highlighted.length > 0 && puzzle.matrix.length > 0) {
      const first = highlighted[0];
      const last = highlighted[highlighted.length - 1];
      const path = getPath(first.r, first.c, last.r, last.c) || highlighted;
      let s1 = "";
      let s2 = "";
      path.forEach((p) => (s1 += puzzle.matrix[p.r][p.c]));
      for (let i = path.length - 1; i >= 0; i--) s2 += puzzle.matrix[path[i].r][path[i].c];

      const match = puzzle.solutions.find((s) => s.display === s1 || s.display === s2);
      if (match && !found[match.display]) {
        setFound((f) => ({ ...f, [match.display]: match.coords }));
      }
    }
    setHighlighted([]);
  }

  function isHighlighted(r, c) {
    return highlighted.some((p) => p.r === r && p.c === c);
  }

  function foundCoordSet() {
    const s = new Set();
    Object.values(found).forEach((coords) => coords.forEach((p) => s.add(`${p.r}-${p.c}`)));
    return s;
  }
  const foundSet = foundCoordSet();

  function handleGenerate() {
    if (activeWords.length === 0) return;
    const html = generateWordSearchHtml({
      words: activeWords,
      rows,
      cols,
      title: activityTitle,
    });
    downloadHtml("phoneme-word-search.html", html);
  }

  async function handleSaveConfig() {
    if (!selectedListId) return;
    setSaveMessage("Saving...");
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "WORD_SEARCH",
          title: activityTitle,
          difficulty,
          showHints: true,
          gridRows: rows,
          gridCols: cols,
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

  if (wordLists.length === 0) {
    return (
      <div className="card">
        <p>
          No word lists yet. Go to <a href="/word-lists">Word Lists</a> to create one with at
          least one word before building a Word Search.
        </p>
      </div>
    );
  }

  return (
    <div className="grid-2">
      <div className="card">
        <span className="eyebrow">Activity settings</span>
        <h2>Build your Word Search</h2>

        <label htmlFor="wordList">Word list</label>
        <select id="wordList" value={selectedListId || ""} onChange={handleListChange}>
          {wordLists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name} ({list.words.length} word{list.words.length === 1 ? "" : "s"})
            </option>
          ))}
        </select>

        <label>Words to include</label>
        {listWords.length === 0 && (
          <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            This list has no words yet. Add some on the <a href="/word-lists">Word Lists</a> page.
          </p>
        )}
        {listWords.map((w) => (
          <div className="checkbox-row" key={w.id}>
            <input
              type="checkbox"
              id={`w-${w.id}`}
              checked={selectedWordIds.includes(w.id)}
              onChange={() => toggleWord(w.id)}
            />
            <label htmlFor={`w-${w.id}`} style={{ fontFamily: "var(--font-mono)" }}>
              {wordToUnits(w).join(" ")}{" "}
              <span style={{ color: "var(--muted)" }}>({w.englishWord})</span>
            </label>
          </div>
        ))}

        <div className="field-row" style={{ marginTop: "0.75rem" }}>
          <div>
            <label htmlFor="rows">Rows</label>
            <input id="rows" type="number" min={6} max={16} value={rows} onChange={(e) => setRows(Number(e.target.value))} />
          </div>
          <div>
            <label htmlFor="cols">Columns</label>
            <input id="cols" type="number" min={6} max={16} value={cols} onChange={(e) => setCols(Number(e.target.value))} />
          </div>
        </div>

        <label htmlFor="title">Activity title</label>
        <input id="title" type="text" value={activityTitle} onChange={(e) => setActivityTitle(e.target.value)} />

        <label htmlFor="difficulty">Difficulty</label>
        <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        <button type="button" className="btn btn-quiet" onClick={regenerate} style={{ marginBottom: "0.75rem" }}>
          Shuffle preview
        </button>
        <button type="button" className="btn btn-accent" onClick={handleGenerate} style={{ marginBottom: "0.75rem" }}>
          Generate &amp; download HTML
        </button>
        <button type="button" className="btn btn-quiet" onClick={handleSaveConfig}>
          Save activity
        </button>
        {saveMessage && (
          <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{saveMessage}</p>
        )}
      </div>

      <div className="card">
        <span className="eyebrow">Live preview</span>
        <h2>{activityTitle}</h2>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          Click a starting cell, then drag or click an ending cell to select a word.
        </p>

        {activeWords.length === 0 || puzzle.matrix.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>Select at least one word to preview the puzzle.</p>
        ) : (
          <>
            <div
              className="wordsearch-grid"
              style={{
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
              }}
              onMouseLeave={() => selecting && endSelection()}
              onMouseUp={endSelection}
            >
              {puzzle.matrix.map((row, r) =>
                row.map((letter, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`ws-cell ${isHighlighted(r, c) ? "highlighted" : ""} ${
                      foundSet.has(`${r}-${c}`) ? "found" : ""
                    }`}
                    title={englishFor(letter)}
                    onMouseDown={() => cellMouseDown(r, c)}
                    onMouseEnter={() => cellEnter(r, c)}
                  >
                    {letter}
                  </div>
                ))
              )}
            </div>

            <div className="word-chip-list">
              {activeWords.map((units) => {
                const k = key(units);
                return (
                  <div key={k} className={`word-chip ${found[k] ? "found" : ""}`}>
                    {units.join(" ")}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
