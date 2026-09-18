const fs = require('fs'); const s = fs.readFileSync(__dirname + '/game.js', 'utf8');
// ---------- validate all maps + rough reachability ----------
const LEVELS = eval(s.match(/const LEVELS = (\[[\s\S]*?\n\]);/)[1]);
for (const L of LEVELS) {
  const len = Math.max(...L.map.map(r => r.length)); const map = L.map.map(r => r.padEnd(len, '.'));
  const R = map.length, C = len;
  const at = (c, r) => (r >= 0 && r < R && c >= 0 && c < C) ? map[r][c] : (c < 0 || c >= C ? '#' : '.');
  const stand = (c, r) => '#%=B'.includes(at(c, r));
  const groundBelow = (c, r) => { for (let rr = r + 1; rr < R; rr++) if (stand(c, rr)) return true; return false; };
  const problems = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    const ch = map[r][c];
    if ('ePC~SK'.includes(ch) && !groundBelow(c, r)) problems.push(`${ch} col ${c} row ${r} over a pit`);
    if ('G^'.includes(ch) && !stand(c, r + 1)) problems.push(`${ch} col ${c} row ${r} floating`);
  }
  // reachability: standing spots = air cell with standable cell below; movers add spots along their range
  const spots = new Set(); const key = (c, r) => c + ',' + r;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (!stand(c, r) && at(c, r) !== '^' && stand(c, r + 1)) spots.add(key(c, r));
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if (map[r][c] === 'M') for (let dc = -3; dc <= 5; dc++) spots.add(key(c + dc, r - 1));
    if (map[r][c] === 'V') for (let dr = -3; dr <= 3; dr++) { spots.add(key(c, r + dr - 1)); spots.add(key(c + 1, r + dr - 1)); }
  }
  let start; for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (map[r][c] === 'P') start = key(c, r);
  const seen = new Set([start]); const q = [start];
  const pads = new Set(); for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (map[r][c] === '~') pads.add(key(c, r));
  while (q.length) {
    const [c, r] = q.shift().split(',').map(Number);
    const up = pads.has(key(c, r)) ? 7 : 3;
    for (const sp of spots) {
      if (seen.has(sp)) continue;
      const [c2, r2] = sp.split(',').map(Number);
      if (Math.abs(c2 - c) <= 6 && (r - r2) <= up) { seen.add(sp); q.push(sp); }
    }
  }
  let goal = null; for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (map[r][c] === 'G' || map[r][c] === 'K') goal = key(c, r);
  const goalOk = !goal || seen.has(goal) || [...seen].some(sp => { const [c2, r2] = sp.split(',').map(Number); const [gc, gr] = goal.split(',').map(Number); return Math.abs(gc - c2) <= 6 && Math.abs(gr - r2) <= 3; });
  let orbsTotal = 0, orbsFar = 0;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (map[r][c] === 'o') { orbsTotal++; const near = [...seen].some(sp => { const [c2, r2] = sp.split(',').map(Number); return Math.abs(c - c2) <= 5 && (r2 - r) <= 4 && (r2 - r) >= -1; }); if (!near) orbsFar++; }
  console.log(`${L.name.padEnd(16)} ${R}x${C} | goal reachable: ${goalOk} | orbs: ${orbsTotal} (${orbsFar} maybe unreachable) | problems: ${problems.length ? problems.join('; ') : 'none'}`);
}
