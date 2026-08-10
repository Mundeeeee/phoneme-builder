import { PHONEME_MAP, KEY_ROWS, KEY_ROWS_COLUMNS } from "./phonemeData";

// config: { targetUnits: string[], englishWord: string, maxGuesses: number, showHints: boolean, title: string }
export function generateWordleHtml(config) {
  const {
    targetUnits,
    englishWord,
    maxGuesses = 6,
    showHints = true,
    title = "Phoneme'le",
  } = config;

  const phonemeMapJson = JSON.stringify(PHONEME_MAP);
  const keyRowsJson = JSON.stringify(KEY_ROWS);
  const targetJson = JSON.stringify(targetUnits);
  const englishWordJson = JSON.stringify(englishWord || targetUnits.map((u) => (PHONEME_MAP[u]?.label || u.toUpperCase())).join(""));
  const showHintsJson = JSON.stringify(Boolean(showHints));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<style>
  :root {
    --ink: #12261f; --bg: #eef1ec; --surface: #ffffff; --surface-2: #e4e9e2;
    --border: #cdd6c9; --primary: #1f6f5c; --primary-strong: #164f42;
    --accent: #d99a3c; --accent-strong: #b87a24; --good: #2f8f5b; --bad: #b5484a; --muted: #5c6d65;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--ink);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    display: flex; flex-direction: column; align-items: center; padding: 24px 16px 60px;
    min-height: 100vh;
  }
  h1 { font-size: 1.6rem; margin-bottom: 4px; letter-spacing: 0.02em; }
  p.subtitle { color: var(--muted); margin-top: 0; margin-bottom: 20px; text-align: center; max-width: 46ch; }
  .card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.06); width: 100%; max-width: 640px;
    margin-bottom: 18px;
  }
  .layout { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; align-items: flex-start; }
  #grid { display: grid; gap: 8px; justify-items: center; }
  .wordle-row { display: grid; grid-auto-flow: column; gap: 8px; justify-content: center; }
  .cell {
    width: 48px; height: 48px; border: 2px solid var(--border); border-radius: 8px;
    display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.05rem;
    font-family: "IBM Plex Mono", monospace; background: var(--surface); text-transform: uppercase;
  }
  .cell[data-filled="true"] { border-color: var(--muted); cursor: pointer; }
  .cell[data-state] { animation: pop 0.22s ease; }
  .cell[data-state="correct"] { background: var(--good); border-color: var(--good); color: #fff; }
  .cell[data-state="present"] { background: var(--accent); border-color: var(--accent-strong); color: #241705; }
  .cell[data-state="absent"] { background: var(--surface-2); border-color: var(--surface-2); color: var(--muted); }
  @keyframes pop { 0% { transform: scale(0.9); } 50% { transform: scale(1.06); } 100% { transform: scale(1); } }

  table.phoneme-table { border-collapse: collapse; margin: 0 auto; }
  table.phoneme-table td {
    border: 1px solid var(--border); width: 42px; height: 38px; text-align: center;
    font-family: "IBM Plex Mono", monospace; font-weight: 600; font-size: 0.9rem;
  }
  td.key { cursor: pointer; background: var(--surface); position: relative; }
  td.key:hover { background: var(--surface-2); }
  td.key[data-state="correct"] { background: var(--good); color: #fff; }
  td.key[data-state="present"] { background: var(--accent); color: #241705; }
  td.key[data-state="absent"] { opacity: 0.35; }
  td.empty { background: var(--surface-2); }
  td.key[data-hint]:hover::after {
    content: attr(data-hint); position: absolute; bottom: calc(100% + 4px); left: 50%; transform: translateX(-50%);
    background: var(--ink); color: var(--bg); font-family: -apple-system, sans-serif; font-weight: 600; font-size: 0.68rem;
    white-space: nowrap; padding: 4px 7px; border-radius: 6px; z-index: 10;
  }

  .controls { display: flex; gap: 10px; margin-top: 16px; width: 100%; max-width: 640px; }
  button.action {
    flex: 1; padding: 12px 14px; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;
    font-size: 1rem;
  }
  .btn-primary { background: var(--primary); color: #fff; }
  .btn-primary:disabled { opacity: 0.5; cursor: default; }
  .banner {
    border-radius: 8px; padding: 10px 14px; font-weight: 700; margin-bottom: 14px; text-align: center;
    width: 100%; max-width: 640px;
  }
  .banner.win { background: rgba(47,143,91,0.15); color: var(--good); }
  .banner.lose { background: rgba(181,72,74,0.15); color: var(--bad); }
</style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p class="subtitle">Click phoneme tiles to build each guess (click a filled tile to remove it), then press Enter.</p>

  <div id="banner"></div>

  <div class="card">
    <div class="layout">
      <div id="grid"></div>
      <table class="phoneme-table" id="keyboard"></table>
    </div>
  </div>

  <div class="controls">
    <button class="action btn-primary" id="enterBtn" type="button">Enter</button>
  </div>

<script>
  const PHONEME_MAP = ${phonemeMapJson};
  const KEY_ROWS = ${keyRowsJson};
  const KEY_ROWS_COLUMNS = ${JSON.stringify(KEY_ROWS_COLUMNS)};
  const TARGET = ${targetJson};
  const ENGLISH_WORD = ${englishWordJson};
  const SHOW_HINTS = ${showHintsJson};
  const MAX_GUESSES = ${maxGuesses};
  const STATE_RANK = { correct: 3, present: 2, absent: 1 };

  let currentGuess = [];
  let guesses = [];
  let gameOver = false;

  function hintFor(sym) {
    const e = PHONEME_MAP[sym];
    return e ? e.label + " (as in " + e.example + ")" : sym;
  }

  const keyboardEl = document.getElementById('keyboard');
  const keyElements = {};
  KEY_ROWS.forEach(row => {
    const tr = document.createElement('tr');
    for (let c = 0; c < KEY_ROWS_COLUMNS; c++) {
      const sym = row[c];
      const td = document.createElement('td');
      if (!sym) {
        td.className = 'empty';
      } else {
        td.className = 'key';
        td.textContent = sym;
        if (SHOW_HINTS) td.setAttribute('data-hint', hintFor(sym));
        td.setAttribute('tabindex', '0');
        td.setAttribute('role', 'button');
        td.addEventListener('click', () => addPhoneme(sym));
        keyElements[sym] = td;
      }
      tr.appendChild(td);
    }
    keyboardEl.appendChild(tr);
  });

  function addPhoneme(sym) {
    if (gameOver) return;
    if (currentGuess.length >= TARGET.length) return;
    currentGuess.push(sym);
    render();
  }

  function removeAt(index) {
    if (gameOver) return;
    currentGuess.splice(index, 1);
    render();
  }

  document.getElementById('enterBtn').addEventListener('click', () => {
    if (gameOver) return;
    if (currentGuess.length !== TARGET.length) {
      showBanner('Add ' + (TARGET.length - currentGuess.length) + ' more phoneme(s) before checking.', '');
      return;
    }
    submitGuess();
  });

  function submitGuess() {
    const result = scoreGuess(currentGuess, TARGET);
    guesses.push({ units: currentGuess.slice(), result });
    const won = result.every(r => r === 'correct');
    currentGuess = [];

    if (won) {
      gameOver = true;
      showBanner('Correct! The word is ' + ENGLISH_WORD + ' (' + TARGET.join(' ') + ').', 'win');
    } else if (guesses.length >= MAX_GUESSES) {
      gameOver = true;
      showBanner('Out of guesses. The word was ' + ENGLISH_WORD + ' (' + TARGET.join(' ') + ').', 'lose');
    }
    render();
  }

  function scoreGuess(guess, target) {
    const result = new Array(guess.length).fill('absent');
    const targetUsed = new Array(target.length).fill(false);
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === target[i]) { result[i] = 'correct'; targetUsed[i] = true; }
    }
    for (let i = 0; i < guess.length; i++) {
      if (result[i] === 'correct') continue;
      for (let j = 0; j < target.length; j++) {
        if (!targetUsed[j] && guess[i] === target[j]) {
          result[i] = 'present'; targetUsed[j] = true; break;
        }
      }
    }
    return result;
  }

  function showBanner(text, kind) {
    const b = document.getElementById('banner');
    b.innerHTML = '';
    if (!text) return;
    const div = document.createElement('div');
    div.className = 'banner' + (kind ? ' ' + kind : '');
    div.textContent = text;
    b.appendChild(div);
  }

  function updateKeyboardColors() {
    const best = {};
    guesses.forEach(g => {
      g.units.forEach((sym, i) => {
        const state = g.result[i];
        if (!best[sym] || STATE_RANK[state] > STATE_RANK[best[sym]]) best[sym] = state;
      });
    });
    Object.keys(keyElements).forEach(sym => {
      if (best[sym]) keyElements[sym].setAttribute('data-state', best[sym]);
      else keyElements[sym].removeAttribute('data-state');
    });
  }

  function render() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    for (let row = 0; row < MAX_GUESSES; row++) {
      const rowEl = document.createElement('div');
      rowEl.className = 'wordle-row';
      const submitted = guesses[row];
      const isActiveRow = !submitted && row === guesses.length && !gameOver;

      for (let col = 0; col < TARGET.length; col++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        if (submitted) {
          cell.setAttribute('data-state', submitted.result[col]);
          cell.textContent = submitted.units[col];
        } else {
          const letter = isActiveRow ? (currentGuess[col] || '') : '';
          if (letter) {
            cell.setAttribute('data-filled', 'true');
            cell.title = 'Click to remove';
            cell.addEventListener('click', () => removeAt(col));
          }
          cell.textContent = letter;
        }
        rowEl.appendChild(cell);
      }
      grid.appendChild(rowEl);
    }

    updateKeyboardColors();
    document.getElementById('enterBtn').disabled = gameOver;
  }

  showBanner('Guess the ' + TARGET.length + '-phoneme word in ' + MAX_GUESSES + ' tries.', '');
  render();
</script>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}
