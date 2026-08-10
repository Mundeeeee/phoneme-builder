"use client";

import { useEffect, useMemo, useState } from "react";
import { WORDS_3, WORD_SEARCH_DEFAULT } from "@/lib/wordLists";
import { englishFor } from "@/lib/phonemeData";
import { generateWordSearchHtml } from "@/lib/generateWordSearchHtml";
import { downloadHtml } from "@/lib/downloadHtml";

const DIRECTIONS = [
  { dr: 0, dc: 1 }, { dr: 0, dc: -1 }, { dr: 1, dc: 0 }, { dr: -1, dc: 0 },
  { dr: 1, dc: 1 }, { dr: 1, dc: -1 }, { dr: -1, dc: 1 }, { dr: -1, dc: -1 },
];

// A small curated pool a teacher can pick from (kept fixed for Assessment 1).
const WORD_POOL = [...WORD_SEARCH_DEFAULT, WORDS_3[0], WORDS_3[6], WORDS_3[9], WORDS_3[13]];

function key(units) {
  return units.join("");
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
  const [selected, setSelected] = useState(WORD_POOL.slice(0, 5).map(key));
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [activityTitle, setActivityTitle] = useState("Phoneme Word Search");

  const activeWords = useMemo(
    () => WORD_POOL.filter((w) => selected.includes(key(w))),
    [selected]
  );

  const [puzzle, setPuzzle] = useState(() => buildPuzzle(activeWords, rows, cols));
  const [found, setFound] = useState({});
  const [selecting, setSelecting] = useState(false);
  const [start, setStart] = useState(null);
  const [highlighted, setHighlighted] = useState([]);

  // Rebuild the puzzle whenever the word selection or grid size changes.
  useEffect(() => {
    setPuzzle(buildPuzzle(activeWords, rows, cols));
    setFound({});
    setHighlighted([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.join(","), rows, cols]);

  function toggleWord(units) {
    const k = key(units);
    setSelected((prev) =>
      prev.includes(k) ? prev.filter((w) => w !== k) : [...prev, k]
    );
  }

  function regenerate() {
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
    if (highlighted.length > 0) {
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
    const html = generateWordSearchHtml({
      words: activeWords,
      rows,
      cols,
      title: activityTitle,
    });
    downloadHtml("phoneme-word-search.html", html);
  }

  return (
    <div className="grid-2">
      <div className="card">
        <span className="eyebrow">Activity settings</span>
        <h2>Build your Word Search</h2>

        <label>Words to include (fixed pool for Assessment 1)</label>
        {WORD_POOL.map((units) => {
          const k = key(units);
          return (
            <div className="checkbox-row" key={k}>
              <input
                type="checkbox"
                id={`w-${k}`}
                checked={selected.includes(k)}
                onChange={() => toggleWord(units)}
              />
              <label htmlFor={`w-${k}`} style={{ fontFamily: "var(--font-mono)" }}>
                {units.join(" ")} <span style={{ color: "var(--muted)" }}>({units.map(englishFor).join("")})</span>
              </label>
            </div>
          );
        })}

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

        <button type="button" className="btn btn-quiet" onClick={regenerate} style={{ marginBottom: "0.75rem" }}>
          Shuffle preview
        </button>
        <button type="button" className="btn btn-accent" onClick={handleGenerate}>
          Generate &amp; download HTML
        </button>
      </div>

      <div className="card">
        <span className="eyebrow">Live preview</span>
        <h2>{activityTitle}</h2>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          Click a starting cell, then drag or click an ending cell to select a word.
        </p>

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
      </div>
    </div>
  );
}
