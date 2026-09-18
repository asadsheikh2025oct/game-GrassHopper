// Lowers any floating leaf cluster the grasshopper cannot comfortably reach (a standing spot within
// 5 tiles sideways and at most 3 tiles below its top) until it can, moving the bugs above it too.
// Usage: node fix-platforms.js        (rewrites the level maps inside game.js)
const fs = require('fs');
const FILE = __dirname + '/game.js';
let src = fs.readFileSync(FILE, 'utf8');
const LEVELS = eval(src.match(/const LEVELS = (\[[\s\S]*?\n\]);/)[1]);
// a jump arc: 6 tiles across when rising 2 or less, only 4 across when rising the full 3
const canJump = (dx, up) => up <= 0 ? dx <= 6 : up <= 2 ? dx <= 6 : up === 3 ? dx <= 4 : false;

function reachableSpots(g) {
  const R = g.length, C = g[0].length;
  const at = (c, r) => (r >= 0 && r < R && c >= 0 && c < C) ? g[r][c] : (c < 0 || c >= C ? '#' : '.');
  const stand = (c, r) => '#%=B'.includes(at(c, r));
  const key = (c, r) => c + ',' + r, spots = new Set();
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (!stand(c, r) && at(c, r) !== '^' && stand(c, r + 1)) spots.add(key(c, r));
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if (g[r][c] === 'M') for (let dc = -3; dc <= 5; dc++) spots.add(key(c + dc, r - 1));
    if (g[r][c] === 'V') for (let dr = -3; dr <= 3; dr++) { spots.add(key(c, r + dr - 1)); spots.add(key(c + 1, r + dr - 1)); }
  }
  const pads = new Set(); for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (g[r][c] === '~') pads.add(key(c, r));
  let start; for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (g[r][c] === 'P') start = key(c, r);
  const seen = new Set([start]), q = [start];
  while (q.length) {
    const [c, r] = q.shift().split(',').map(Number), padHere = pads.has(key(c, r));
    for (const sp of spots) { if (seen.has(sp)) continue; const [c2, r2] = sp.split(',').map(Number); const dx = Math.abs(c2 - c), up = r - r2; if (padHere ? (dx <= 6 && up <= 7) : canJump(dx, up)) { seen.add(sp); q.push(sp); } }
  }
  return seen;
}

// connected clusters of '#' that do not touch the top row, the bottom two rows, or the side walls
function floatingClusters(g) {
  const R = g.length, C = g[0].length, id = g.map(r => r.map(() => -1)), clusters = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if (g[r][c] !== '#' || id[r][c] >= 0) continue;
    const cells = [], q = [[c, r]]; id[r][c] = clusters.length; let grounded = false;
    while (q.length) {
      const [x, y] = q.pop(); cells.push([x, y]);
      if (y === 0 || y >= R - 2 || x === 0 || x === C - 1) grounded = true;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < C && ny < R && g[ny][nx] === '#' && id[ny][nx] < 0) { id[ny][nx] = clusters.length; q.push([nx, ny]); } }
    }
    clusters.push({ cells, grounded });
  }
  return clusters.filter(k => !k.grounded);
}

let changed = 0;
for (const L of LEVELS) {
  const g = L.map.map(r => r.split(''));
  const R = g.length;
  for (let pass = 0; pass < 8; pass++) {
    const seen = reachableSpots(g);
    let movedAny = false;
    for (const k of floatingClusters(g)) {
      const tops = k.cells.filter(([x, y]) => g[y - 1] && g[y - 1][x] !== '#');
      // fine if some top spot can be jumped to from a reachable spot that is not beyond the cluster's right edge
      const maxCol = Math.max(...k.cells.map(c => c[0]));
      const ok = tops.some(([x, y]) => [...seen].some(sp => { const [c2, r2] = sp.split(',').map(Number); return c2 <= maxCol + 1 && canJump(Math.abs(c2 - x), r2 - (y - 1)) && r2 >= y - 1 - 3; }));
      if (ok) continue;
      const bottoms = k.cells.filter(([x, y]) => !g[y + 1] || g[y + 1][x] !== '#');
      if (bottoms.some(([x, y]) => y + 1 >= R - 1 || !'.o'.includes(g[y + 1][x]))) continue;   // no room below
      // move every cell down one row (bottom-up), carrying bugs directly above the top edge
      const sorted = [...k.cells].sort((a, b) => b[1] - a[1]);
      for (const [x, y] of sorted) { g[y + 1][x] = '#'; g[y][x] = '.'; }
      for (const [x, y] of tops) for (let up = 1; up <= 2; up++) if (g[y - up] && g[y - up][x] === 'o' && g[y - up + 1][x] === '.') { g[y - up + 1][x] = 'o'; g[y - up][x] = '.'; }
      const cols = k.cells.map(c => c[0]), rows = k.cells.map(c => c[1]);
      console.log(`${L.name}: lowered leaf cluster cols ${Math.min(...cols)}-${Math.max(...cols)} (rows ${Math.min(...rows)}-${Math.max(...rows)}) by one`);
      movedAny = true; changed++;
    }
    if (!movedAny) break;
  }
  L.map = g.map(r => r.join(''));
}

for (const L of LEVELS) {
  const re = new RegExp("(name: '" + L.name.replace(/'/g, "\\'") + "'[\\s\\S]*?map: \\[\\n)([\\s\\S]*?)(\\n    \\],)");
  src = src.replace(re, (m, a, body, z) => a + L.map.map(r => '      "' + r + '",').join('\n') + z);
}
fs.writeFileSync(FILE, src);
console.log(changed ? `${changed} move(s) made` : 'nothing to fix');
