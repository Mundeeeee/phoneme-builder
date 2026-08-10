import { PHONEME_MAP } from "./phonemeData";

// config: { words: string[][], rows: number, cols: number, title: string }
export function generateWordSearchHtml(config) {
  const { words, rows = 10, cols = 10, title = "Phoneme Word Search" } = config;

  const wordsJson = JSON.stringify(words);
  const phonemeMapJson = JSON.stringify(PHONEME_MAP);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<style>
  :root {
    --ink: #12261f; --bg: #eef1ec; --surface: #ffffff; --surface-2: #e4e9e2;
    --border: #cdd6c9; --primary: #1f6f5c; --accent: #d99a3c; --good: #2f8f5b; --muted: #5c6d65;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
  body { background: var(--bg); color: var(--ink); padding: 24px 16px 60px; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
  h1 { font-size: 1.5rem; margin-bottom: 4px; color: var(--primary); }
  p.subtitle { color: var(--muted); margin-bottom: 20px; text-align: center; max-width: 46ch; }
  .container { display: grid; gap: 20px; width: 100%; max-width: 720px; justify-items: center; }
  .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 18px; box-shadow: 0 4px 10px rgba(0,0,0,0.06); width: 100%; }
  .grid { display: grid; gap: 2px; background: var(--border); border: 1px solid var(--border); border-radius: 10px; padding: 8px; margin: 0 auto; width: fit-content; max-width: 100%; overflow: auto; }
  .cell {
    width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
    background: var(--surface); font-family: "IBM Plex Mono", monospace; font-weight: 600; font-size: 0.85rem;
    cursor: pointer; user-select: none; border-radius: 3px;
  }
  .cell.highlighted { background: var(--accent); color: #241705; }
  .cell.found { background: var(--good); color: #fff; }
  .word-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .chip { font-family: "IBM Plex Mono", monospace; background: var(--surface-2); border-radius: 6px; padding: 6px 10px; font-size: 0.85rem; }
  .chip.found { background: rgba(47,143,91,0.18); color: var(--good); text-decoration: line-through; }
  button.solve { margin-top: 12px; padding: 10px 14px; border: none; border-radius: 8px; background: var(--surface-2); color: var(--ink); font-weight: 700; cursor: pointer; }
</style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p class="subtitle">Click a starting cell then click an ending cell (or drag) to find each phoneme word.</p>

  <div class="container">
    <div class="panel">
      <div id="grid" class="grid"></div>
    </div>
    <div class="panel">
      <strong>Word list</strong>
      <div id="wordList" class="word-list"></div>
      <button class="solve" id="solveBtn" type="button">Show answers</button>
    </div>
  </div>

<script>
  const WORDS = ${wordsJson};
  const PHONEME_MAP = ${phonemeMapJson};
  const ROWS = ${rows};
  const COLS = ${cols};
  const DIRECTIONS = [
    {dr:0,dc:1},{dr:0,dc:-1},{dr:1,dc:0},{dr:-1,dc:0},
    {dr:1,dc:1},{dr:1,dc:-1},{dr:-1,dc:1},{dr:-1,dc:-1}
  ];

  let matrix = [];
  let solutions = [];
  let wordsData = WORDS.map(units => ({ display: units.join(''), clean: units.join(' '), units, found: false }));
  let pool = Array.from(new Set(WORDS.flat()));
  if (pool.length === 0) pool = ['a','b','d','i','p','s','t'];

  function build() {
    matrix = Array.from({length: ROWS}, () => new Array(COLS).fill(null));
    solutions = [];
    wordsData.forEach(w => {
      let placed = false, attempts = 0;
      while (!placed && attempts < 300) {
        attempts++;
        const d = DIRECTIONS[Math.floor(Math.random()*DIRECTIONS.length)];
        const r = Math.floor(Math.random()*ROWS);
        const c = Math.floor(Math.random()*COLS);
        if (canPlace(w.units, r, c, d)) {
          const coords = [];
          for (let i=0;i<w.units.length;i++) {
            const rr = r + d.dr*i, cc = c + d.dc*i;
            matrix[rr][cc] = w.units[i];
            coords.push({r:rr,c:cc});
          }
          solutions.push({display: w.display, coords});
          placed = true;
        }
      }
    });
    for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
      if (!matrix[r][c]) matrix[r][c] = pool[Math.floor(Math.random()*pool.length)];
    }
    render();
  }

  function canPlace(units, r, c, d) {
    const len = units.length;
    const endR = r + d.dr*(len-1), endC = c + d.dc*(len-1);
    if (endR<0||endR>=ROWS||endC<0||endC>=COLS) return false;
    for (let i=0;i<len;i++) {
      const rr=r+d.dr*i, cc=c+d.dc*i;
      if (matrix[rr][cc] && matrix[rr][cc]!==units[i]) return false;
    }
    return true;
  }

  const gridEl = document.getElementById('grid');
  let isSelecting = false, startCell = null;

  function render() {
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateRows = 'repeat(' + ROWS + ', 1fr)';
    gridEl.style.gridTemplateColumns = 'repeat(' + COLS + ', 1fr)';
    for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r; cell.dataset.col = c;
      cell.textContent = matrix[r][c];
      const entry = PHONEME_MAP[matrix[r][c]];
      if (entry) cell.title = entry.label + ' (as in ' + entry.example + ')';
      gridEl.appendChild(cell);
    }
    const list = document.getElementById('wordList');
    list.innerHTML = '';
    wordsData.forEach(w => {
      const chip = document.createElement('div');
      chip.className = 'chip' + (w.found ? ' found' : '');
      chip.id = 'chip-' + w.display;
      chip.textContent = w.clean;
      list.appendChild(chip);
    });
  }

  gridEl.addEventListener('mousedown', e => {
    if (e.target.classList.contains('cell')) {
      isSelecting = true; startCell = e.target; clearHighlights();
      e.target.classList.add('highlighted');
    }
  });
  gridEl.addEventListener('mouseover', e => {
    if (!isSelecting) return;
    if (e.target.classList.contains('cell')) { clearHighlights(); highlightPath(startCell, e.target); }
  });
  window.addEventListener('mouseup', () => {
    if (!isSelecting) return;
    isSelecting = false; checkSelection(); clearHighlights();
  });
  gridEl.addEventListener('touchstart', e => {
    const t = e.touches[0]; const cell = document.elementFromPoint(t.clientX, t.clientY);
    if (cell && cell.classList.contains('cell')) { isSelecting = true; startCell = cell; clearHighlights(); cell.classList.add('highlighted'); }
  });
  window.addEventListener('touchmove', e => {
    if (!isSelecting) return;
    const t = e.touches[0]; const cell = document.elementFromPoint(t.clientX, t.clientY);
    if (cell && cell.classList.contains('cell') && cell.parentNode === gridEl) { clearHighlights(); highlightPath(startCell, cell); }
  });
  window.addEventListener('touchend', () => { if (!isSelecting) return; isSelecting = false; checkSelection(); clearHighlights(); });

  function getPath(a, b) {
    const r1=+a.dataset.row, c1=+a.dataset.col, r2=+b.dataset.row, c2=+b.dataset.col;
    const dr=r2-r1, dc=c2-c1;
    if (dr===0 || dc===0 || Math.abs(dr)===Math.abs(dc)) {
      const steps = Math.max(Math.abs(dr), Math.abs(dc));
      const stepR = dr===0?0:dr/steps, stepC = dc===0?0:dc/steps;
      const path=[];
      for (let i=0;i<=steps;i++) path.push({r:r1+stepR*i, c:c1+stepC*i});
      return path;
    }
    return null;
  }
  function highlightPath(a,b) {
    const path = getPath(a,b); if (!path) return;
    path.forEach(p => {
      const cell = document.querySelector('[data-row="'+p.r+'"][data-col="'+p.c+'"]');
      if (cell) cell.classList.add('highlighted');
    });
  }
  function clearHighlights() { document.querySelectorAll('.cell.highlighted').forEach(c => c.classList.remove('highlighted')); }
  function checkSelection() {
    const highlighted = document.querySelectorAll('.cell.highlighted');
    if (highlighted.length===0) return;
    const cells = Array.from(highlighted);
    const path = getPath(startCell, cells[cells.length-1] || startCell);
    if (!path) return;
    let s1='', s2='';
    path.forEach(p => s1 += matrix[p.r][p.c]);
    for (let i=path.length-1;i>=0;i--) s2 += matrix[path[i].r][path[i].c];
    wordsData.forEach(w => {
      if (!w.found && (w.display===s1 || w.display===s2)) {
        w.found = true;
        path.forEach(p => {
          const cell = document.querySelector('[data-row="'+p.r+'"][data-col="'+p.c+'"]');
          if (cell) cell.classList.add('found');
        });
        const chip = document.getElementById('chip-'+w.display);
        if (chip) chip.classList.add('found');
      }
    });
  }

  let showSol = false;
  document.getElementById('solveBtn').addEventListener('click', () => {
    showSol = !showSol;
    solutions.forEach(s => s.coords.forEach(p => {
      const cell = document.querySelector('[data-row="'+p.r+'"][data-col="'+p.c+'"]');
      if (cell) cell.style.backgroundColor = showSol ? '#f0b84f' : '';
    }));
  });

  build();
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
