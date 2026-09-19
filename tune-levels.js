// One-off tuning pass: gentler early levels and a checkpoint roughly every 25 tiles.
// Usage: node tune-levels.js   (rewrites the level maps inside game.js)
const fs = require('fs');
const FILE = __dirname + '/game.js';
let src = fs.readFileSync(FILE, 'utf8');
const LEVELS = eval(src.match(/const LEVELS = (\[[\s\S]*?\n\]);/)[1]);

const log = [];
function removeSome(g, ch, keep) {                     // keep only the entities at the given column list (nearest match)
  const found = [];
  for (let r = 0; r < g.length; r++) for (let c = 0; c < g[0].length; c++) if (g[r][c] === ch) found.push([c, r]);
  const keepSet = new Set(keep.map(k => found.reduce((best, f) => Math.abs(f[0] - k) < Math.abs(best[0] - k) ? f : best)).map(f => f.join(',')));
  let removed = 0;
  for (const [c, r] of found) if (!keepSet.has(c + ',' + r)) { g[r][c] = '.'; removed++; }
  return removed;
}
function fillPuddle(g, col) {                          // turn the puddle containing this column back into ground
  let n = 0;
  for (let r = 0; r < g.length; r++) {
    if (g[r][col] !== 'w') continue;
    let a = col; while (a > 0 && g[r][a - 1] === 'w') a--;
    let b = col; while (b < g[0].length - 1 && g[r][b + 1] === 'w') b++;
    for (let c = a; c <= b; c++) { g[r][c] = '#'; n++; }
  }
  return n;
}
function addCheckpoints(g, every = 25) {
  const R = g.length, C = g[0].length;
  const cols = []; for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (g[r][c] === 'C') cols.push(c);
  let added = 0;
  for (let target = every; target < C - 12; target += every) {
    if (cols.some(c => Math.abs(c - target) < 13)) continue;
    // find the nearest column with solid ground where the cell above is free
    for (let d = 0; d < 10; d++) for (const c of [target + d, target - d]) {
      if (c < 2 || c >= C - 2) continue;
      // walk up from the bottom through solid ground to its surface (skips ceilings and leaves)
      let r = R - 1; if (g[r][c] !== '#') continue; while (r > 0 && g[r - 1][c] === '#') r--;
      if (r < 2 || g[r - 1][c] !== '.' || (g[r - 2] && 'eS'.includes(g[r - 2][c]))) continue;
      g[r - 1][c] = 'C'; cols.push(c); added++; d = 99; break;
    }
  }
  return added;
}

for (const L of LEVELS) {
  const g = L.map.map(r => r.split(''));
  const notes = [];
  if (L.name === 'Morning Meadow') {
    notes.push(`frogs -${removeSome(g, 'e', [15, 60])}`, `toads -${removeSome(g, 'S', [])}`);
    notes.push(`puddles filled ${fillPuddle(g, 41) + fillPuddle(g, 86)} tiles`);
  }
  if (L.name === 'Dewy Garden') notes.push(`frogs -${removeSome(g, 'e', [14, 38, 68, 101])}`, `toads -${removeSome(g, 'S', [90])}`);
  if (L.name === 'Pond Shore') notes.push(`frogs -${removeSome(g, 'e', [13, 27, 42, 63, 80])}`, `toads -${removeSome(g, 'S', [70])}`);
  if (!L.boss) notes.push(`checkpoints +${addCheckpoints(g)}`);
  L.map = g.map(r => r.join(''));
  log.push(`${L.name.padEnd(16)} ${notes.join(' · ')}`);
}
for (const L of LEVELS) {
  const re = new RegExp("(name: '" + L.name.replace(/'/g, "\\'") + "'[\\s\\S]*?map: \\[\\n)([\\s\\S]*?)(\\n    \\],)");
  src = src.replace(re, (m, a, body, z) => a + L.map.map(r => '      "' + r + '",').join('\n') + z);
}
fs.writeFileSync(FILE, src);
console.log(log.join('\n'));
