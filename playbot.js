// Play-test bot: runs inside the game page. Tries real moves from snapshots, reports where nothing works.
window.playLevel = function (li, budgetFrames = 5400) {
  if (!Music.muted) Music.toggle();
  const snap = () => { player.riding = null; return JSON.stringify({ player, enemies, crumbles, checkpoints, orbs, time, lives, deathsHere, camX, camY, finishing, collected }); };
  const restore = (s) => { const o = JSON.parse(s); Object.assign(player, o.player); enemies.length = 0; o.enemies.forEach(e => enemies.push(e)); for (const k in crumbles) delete crumbles[k]; Object.assign(crumbles, o.crumbles); checkpoints.forEach((c, i) => Object.assign(c, o.checkpoints[i])); orbs.length = 0; o.orbs.forEach(x => orbs.push(x)); time = o.time; lives = o.lives; deathsHere = o.deathsHere; camX = o.camX; camY = o.camY; finishing = o.finishing; collected = o.collected; };
  const goal = () => portal ? { x: portal.x + portal.w / 2, y: portal.y + portal.h } : { x: LEVEL_W, y: player.y };
  const dist = () => { const g = goal(); return Math.hypot(g.x - (player.x + player.w / 2), (g.y - (player.y + player.h)) * 0.6); };
  const frame = (right, jump, left) => { player.invuln = 2; keys.right = !!right; keys.left = !!left; keys.jump = !!jump; update(1 / 60); };
  const bad = () => player.dead > 0 || player.sinking > 0;
  // macro moves: arrays of [right, jump, left] per frame
  const M = {
    run:       Array.from({ length: 24 }, () => [1, 0, 0]),
    runJump:   Array.from({ length: 50 }, (_, i) => [1, i < 16, 0]),
    runHop:    Array.from({ length: 40 }, (_, i) => [1, i < 4, 0]),
    standJump: Array.from({ length: 50 }, (_, i) => [i > 4, i < 16, 0]),
    backLong:  Array.from({ length: 70 }, (_, i) => i < 18 ? [0, 0, 1] : [1, i >= 24 && i < 40, 0]),
    waitJump:  Array.from({ length: 110 }, (_, i) => i < 60 ? [0, 0, 0] : [1, i >= 62 && i < 78, 0]),
    upJump:    Array.from({ length: 50 }, (_, i) => [i > 20, i < 16, i <= 20 && i > 2]),
  };
  // dynamic macro: run until the ground ahead ends (edge), then jump and hold
  const edgeJump = (hold) => { let phase = 0, t = 0; return Array.from({ length: 90 }, () => () => {
    if (phase === 0) { const fr = Math.floor((player.y + player.h - 2) / TILE), cx = Math.floor((player.x + player.w) / TILE); const below = map[fr + 1] && map[fr + 1][cx + 1]; const wallAhead = isSolid(cx + 1, fr) || isSolid(cx + 1, fr - 1); if (!below || !'#%='.includes(below) || wallAhead || t > 40) phase = 1; t++; return [1, 0, 0]; }
    phase++; return [1, phase <= hold, 0]; }); };
  M.edgeJump = edgeJump(16); M.edgeHop = edgeJump(5); M.edgeWaitJump = (() => { const inner = edgeJump(16); return [...Array.from({ length: 70 }, () => [0, 0, 0]), ...inner]; })();
  const order = ['run', 'edgeJump', 'runJump', 'edgeHop', 'runHop', 'standJump', 'backLong', 'waitJump', 'edgeWaitJump', 'upJump'];
  startLevel(li); for (let i = 0; i < 130; i++) update(1 / 60); Music.stop();
  const report = { level: LEVELS[li].name, finished: false, stuck: [], waterDeaths: [], pitDeaths: [], frames: 0, lanterns: 0 };
  let frames = 0, lastProgressFrame = 0, bestDist = dist();
  while (frames < budgetFrames) {
    if (finishing > 0 || journey) { report.finished = true; break; }
    if (!player.onGround) { frame(1, 0, 0); frames++; if (bad()) { const col = Math.round(player.x / TILE); (player.sinking > 0 ? report.waterDeaths : report.pitDeaths).push(col); for (let k = 0; k < 80; k++) { update(1 / 60); frames++; } } continue; }
    const s0 = snap(), d0 = dist(), x0 = player.x;
    let best = null;
    for (const name of order) {
      restore(s0);
      let died = false, lit = false, fin = false;
      const litBefore = checkpoints.filter(c => c.lit).length;
      for (const stepDef of M[name]) { const [r, j, l] = typeof stepDef === 'function' ? stepDef() : stepDef; frame(r, j, l); if (bad()) { died = true; break; } if (finishing > 0 || journey) { fin = true; break; } }
      for (let k = 0; k < 120 && !died && !fin; k++) { frame(0, 0, 0); if (bad()) { died = true; break; } if (player.onGround && k > 4) break; if (finishing > 0 || journey) { fin = true; break; } }   // settle until landed
      lit = checkpoints.filter(c => c.lit).length > litBefore;
      const gain = fin ? 1e6 : died ? -1e6 : (d0 - dist()) + (lit ? 40 : 0) + (player.x - x0) * 0.2;
      if (!best || gain > best.gain) best = { name, gain, state: snap(), frames: M[name].length + 25 };
      if (fin) break;
    }
    restore(best.state); frames += best.frames;
    if (best.gain <= 2) {                                                // nothing helped: real trouble spot
      const col = Math.round(player.x / TILE), row = Math.round((player.y + player.h) / TILE);
      if (!report.stuck.some(s => Math.abs(s.col - col) < 3)) {
        const rows = []; for (let r = Math.max(0, row - 6); r <= Math.min(ROWS - 1, row + 1); r++) rows.push(String(r).padStart(2) + ' ' + map[r].slice(Math.max(0, col - 6), col + 12).join(''));
        report.stuck.push({ col, row, around: rows.join('\n') });
      }
      // teleport to the next standing spot to the right so we can keep looking
      let placed = false;
      for (let c = col + 3; c < COLS && !placed; c++) for (let r = 1; r < ROWS; r++) { if ('#=%'.includes(map[r][c]) && map[r - 1][c] === '.' && (r + 1 >= ROWS || map[r + 1][c] !== '.' || map[r][c] !== '#')) { player.x = c * TILE + 3; player.y = r * TILE - player.h; player.vy = 0; placed = true; break; } }
      if (!placed) break;
      frames += 60;
    }
  }
  report.frames = frames; report.lanterns = checkpoints.filter(c => c.lit).length + '/' + checkpoints.length;
  report.seconds = +(frames / 60).toFixed(0);
  keys.right = keys.left = keys.jump = false;
  return report;
};
