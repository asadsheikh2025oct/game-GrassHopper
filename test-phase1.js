// Phase 1 tests: movement & tiles, every instance on every level. Run in the game page:
//   eval(await (await fetch('test-phase1.js')).text()); phase1()
window.phase1 = function () {
  if (!Music.muted) Music.toggle();
  const step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) update(dt); };
  const P = () => player;
  const put = (x, y, vy = 0) => { const p = P(); p.x = x; p.y = y; p.vx = 0; p.vy = vy; p.dead = 0; p.sinking = 0; p.invuln = 0; p.knock = 0; p.riding = null; keys.left = keys.right = keys.jump = false; };
  const bottom = () => P().y + P().h;
  const results = [];
  const rec = (level, feature, pass, detail) => results.push({ level, feature, pass, detail });
  const begin = (li) => { journey = null; ending = null; startLevel(li); step(130); Music.stop(); settings.easy = false; };
  const floatingClusters = () => {                                      // leaf clusters: '#' not connected to ground/edges
    const id = map.map(r => r.map(() => -1)), out = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (map[r][c] !== '#' || id[r][c] >= 0) continue;
      const cells = [], q = [[c, r]]; id[r][c] = out.length; let grounded = false;
      while (q.length) { const [x, y] = q.pop(); cells.push([x, y]); if (y === 0 || y >= ROWS - 2 || x === 0 || x === COLS - 1) grounded = true; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < COLS && ny < ROWS && map[ny][nx] === '#' && id[ny][nx] < 0) { id[ny][nx] = out.length; q.push([nx, ny]); } } }
      out.push({ cells, grounded });
    }
    return out.filter(k => !k.grounded);
  };
  const runs = (ch) => { const out = []; for (let r = 0; r < ROWS; r++) { let c = 0; while (c < COLS) { if (map[r][c] === ch) { let e = c; while (e + 1 < COLS && map[r][e + 1] === ch) e++; out.push({ r, c0: c, c1: e }); c = e + 1; } else c++; } } return out; };

  // ================= MOVEMENT (level 1) =================
  begin(0);
  {
    const surf = (c) => { let r = 0; while (r < ROWS && map[r][c] !== '#') r++; return r; };
    const gRow = surf(4);
    const ground = () => { put(4 * TILE, gRow * TILE - P().h); step(5); };
    ground(); keys.right = true; const v = []; for (let i = 0; i < 8; i++) { update(1 / 60); v.push(Math.round(P().vx)); } keys.right = false; const d = []; for (let i = 0; i < 8; i++) { update(1 / 60); d.push(Math.round(P().vx)); }
    rec('Morning Meadow', '1 run accel/decel', v[0] > 0 && v[0] < RUN_SPEED && v[6] === RUN_SPEED && d[5] === 0, `ramp ${v.join(',')} | stop ${d.join(',')}`);
    ground(); keys.right = true; step(20); keys.right = false; keys.left = true; step(2); keys.left = false; rec('Morning Meadow', '1 skid on reverse', P().skid > 0, `skid=${P().skid.toFixed(2)}`);
    ground(); keys.jump = true; update(1 / 60); keys.jump = false; let hop = 999; for (let i = 0; i < 60; i++) { update(1 / 60); hop = Math.min(hop, bottom()); } const shortRise = (gRow * TILE - hop) / TILE;
    ground(); keys.jump = true; let full = 999; for (let i = 0; i < 60; i++) { update(1 / 60); full = Math.min(full, bottom()); } keys.jump = false; const fullRise = (gRow * TILE - full) / TILE;
    rec('Morning Meadow', '2 variable jump height', shortRise < 1.5 && fullRise > 3.8 && fullRise < 4.6, `short ${shortRise.toFixed(2)} tiles, full ${fullRise.toFixed(2)} tiles`);
    // coyote: walk off the first leaf cluster's right end, jump 3 frames later
    const leaf = floatingClusters()[0]; const right = Math.max(...leaf.cells.map(c => c[0])), top = Math.min(...leaf.cells.filter(c => c[0] === right).map(c => c[1]));
    put(right * TILE + 4, top * TILE - P().h); step(5); keys.right = true; let air = 0, coyoteJump = null; for (let i = 0; i < 40; i++) { update(1 / 60); if (!P().onGround) air++; if (air === 3) { keys.jump = true; update(1 / 60); coyoteJump = P().vy; keys.jump = false; break; } } keys.right = false;
    rec('Morning Meadow', '2 coyote time', coyoteJump !== null && coyoteJump < -500, `vy after jump 3 frames past the edge = ${coyoteJump && Math.round(coyoteJump)}`);
    // jump buffer: press jump 4 frames before landing
    put(4 * TILE, gRow * TILE - P().h - 60, 300); let pressed = false, buffered = null; for (let i = 0; i < 40; i++) { if (!pressed && bottom() > gRow * TILE - 22) { keys.jump = true; pressed = true; } update(1 / 60); if (pressed && P().onGround) { update(1 / 60); buffered = P().vy; break; } } keys.jump = false;
    rec('Morning Meadow', '2 jump buffer', buffered !== null && buffered < -500, `vy right after landing = ${buffered && Math.round(buffered)}`);
    ground(); keys.jump = true; step(2); const stretch = P().sy > 1.1 && P().sx < 0.9; keys.jump = false; let minSy = 9; for (let i = 0; i < 60; i++) { update(1 / 60); if (P().onGround) minSy = Math.min(minSy, P().sy); } const land = minSy < 0.95; rec('Morning Meadow', '3 squash & stretch', stretch && land, `stretch on jump=${stretch}, squash on land=${land}`);
    put(30 * TILE, surf(30) * TILE - P().h); P().facing = 1; step(60); const aheadR = camX; P().facing = -1; step(60); const aheadL = camX; rec('Morning Meadow', '4 camera look-ahead', aheadR > aheadL + 30, `camX facing right ${Math.round(aheadR)} vs left ${Math.round(aheadL)}`);
  }
  begin(3); { put(60 * TILE, 7 * TILE, 0); let a = 0; for (let i = 0; i < 40; i++) { P().y = 7 * TILE; P().vy = 0; update(1 / 60); a = camY; } let b = 0; for (let i = 0; i < 40; i++) { P().y = 7 * TILE; P().vy = 700; update(1 / 60); b = camY; } rec('Lily Pond', '4 camera looks down when falling', b > a + 10, `camY hovering ${Math.round(a)} → falling ${Math.round(b)}`); }
  begin(5); { put(2 * TILE, 13 * TILE); step(60); const low = camY; put(86 * TILE, 2 * TILE); step(90); const high = camY; rec('Tall Grass', '4 vertical camera scroll', low > high + 100, `camY at the bottom ${Math.round(low)}, at the top ${Math.round(high)}`); }

  // ================= TILES, every level =================
  for (let li = 0; li < LEVELS.length; li++) {
    begin(li); const name = LEVELS[li].name; P().invuln = 0;
    for (const e of enemies) { e.alive = false; e.squash = 9; } if (boss) boss.alive = false;
    // 5 leaf platforms: drop onto every floating cluster
    { const cl = floatingClusters(); let ok = 0, fails = []; for (const k of cl) { const top = Math.min(...k.cells.map(c => c[1])); const cx = k.cells.filter(c => c[1] === top)[0][0]; put(cx * TILE + 3, top * TILE - P().h - 40); let landed = false; for (let i = 0; i < 60; i++) { update(1 / 60); if (P().onGround) { landed = Math.abs(bottom() - top * TILE) < 1; break; } } if (landed) ok++; else fails.push(`col ${cx} row ${top}`); }
      if (cl.length) rec(name, '5 leaf platforms (land on top)', fails.length === 0, `${ok}/${cl.length}` + (fails.length ? ' FAIL: ' + fails.join(', ') : '')); }
    // 6 one-way ledges: jump up through, then land on top
    { const rs = runs('='); let ok = 0, fails = []; for (const g of rs) { const c = g.c0, r = g.r; put(c * TILE + 3, (r + 1) * TILE + 20, -JUMP_SPEED); P().jumping = true; keys.jump = true; let passed = false, landed = false; for (let i = 0; i < 90; i++) { update(1 / 60); if (i === 16) keys.jump = false; if (bottom() <= r * TILE) passed = true; if (passed && P().onGround && Math.abs(bottom() - r * TILE) < 1) { landed = true; break; } } keys.jump = false; if (passed && landed) ok++; else fails.push(`col ${c} row ${r} (through=${passed}, landed=${landed})`); }
      if (rs.length) rec(name, '6 one-way ledges (jump through + land)', fails.length === 0, `${ok}/${rs.length}` + (fails.length ? ' FAIL: ' + fails.join('; ') : '')); }
    // 7 crumbling clods: stand → shaking → gone (fall) → back
    { const rs = runs('%'); let ok = 0, fails = []; for (const g of rs) { const c = g.c0, r = g.r, key = c + ',' + r; put(c * TILE + 3, r * TILE - P().h); step(3); const s1 = crumbles[key].state; step(30); const s2 = crumbles[key].state, fell = !P().onGround || bottom() > r * TILE + 2; step(200); const s3 = crumbles[key].state; if (s1 === 'shaking' && s2 === 'gone' && fell && s3 === 'solid') ok++; else fails.push(`col ${c} row ${r} (${s1}/${s2}/fell=${fell}/${s3})`); P().dead = 0; P().sinking = 0; }
      if (rs.length) rec(name, '7 crumbling clods', fails.length === 0, `${ok}/${rs.length}` + (fails.length ? ' FAIL: ' + fails.join('; ') : '')); }
    // 8 bounce mushrooms: drop on, measure rise
    { let ok = 0, fails = []; for (const pad of pads) { put(pad.x + 3, pad.y - P().h - 30, 0); let top = 999; for (let i = 0; i < 80; i++) { update(1 / 60); top = Math.min(top, bottom()); } const rise = (pad.y - top) / TILE; if (rise > 4.5) ok++; else fails.push(`col ${Math.round(pad.x / TILE)} rise ${rise.toFixed(1)}`); }
      if (pads.length) rec(name, '8 bounce mushrooms', fails.length === 0, `${ok}/${pads.length}` + (fails.length ? ' FAIL: ' + fails.join('; ') : '')); }
    // 9 moving lily pads: ride and be carried
    { let ok = 0, fails = []; for (const m of movers) { put(m.x + 10, m.y - P().h - 2, 0); step(20); const px = P().x, py = P().y, mx = m.x, my = m.y; step(40); const carriedX = Math.abs((P().x - px) - (m.x - mx)) < 1, carriedY = m.axis === 'y' ? Math.abs((P().y - py) - (m.y - my)) < 1 : true; if (P().riding === m && carriedX && carriedY) ok++; else fails.push(`${m.axis} pad col ${Math.round(m.ox / TILE)} (riding=${P().riding === m}, x=${carriedX}, y=${carriedY})`); }
      if (movers.length) rec(name, '9 moving lily pads (carry)', fails.length === 0, `${ok}/${movers.length}` + (fails.length ? ' FAIL: ' + fails.join('; ') : '')); }
    // 10 seed pods: hit from below
    { const pods = []; for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (map[r][c] === 'B') pods.push([c, r]); let ok = 0, fails = [];
      for (const [c, r] of pods) { const before = orbs.length; put(c * TILE + 3, (r + 2) * TILE + 4, -JUMP_SPEED); P().jumping = true; keys.jump = true; step(15); keys.jump = false; if (map[r][c] === '.' && orbs.length === before + 1) ok++; else fails.push(`col ${c} row ${r} (tile=${map[r][c]})`); }
      if (pods.length) rec(name, '10 seed pods (break from below)', fails.length === 0, `${ok}/${pods.length}` + (fails.length ? ' FAIL: ' + fails.join('; ') : '')); }
    // 11 water: every puddle sinks you (normal) — and tosses you out (easy)
    { const puddles = []; for (const wt of [...water].sort((a, b) => a.x - b.x)) { const last = puddles[puddles.length - 1]; if (last && Math.abs(last.x1 + TILE - wt.x) < 1 && last.surface === wt.surface) last.x1 = wt.x; else puddles.push({ x0: wt.x, x1: wt.x, surface: wt.surface }); }
      let ok = 0, fails = []; for (const pd of puddles) { const l0 = lives; put((pd.x0 + pd.x1 + TILE) / 2 - P().w / 2, pd.surface - P().h + 10, 200); step(6); const sank = P().sinking > 0; step(140); const back = Math.abs(P().x - P().startX) < 2; const lost = lives === l0 - 1 || (l0 === 1 && lives === maxLives()); if (sank && back && lost) ok++; else fails.push(`puddle col ${Math.round(pd.x0 / TILE)} (sank=${sank}, back=${back}, heart=${lost})`); lives = maxLives(); }
      if (puddles.length) rec(name, '11 water sinks (normal)', fails.length === 0, `${ok}/${puddles.length}` + (fails.length ? ' FAIL: ' + fails.join('; ') : ''));
      if (puddles.length) { settings.easy = true; const pd = puddles[0], l0 = lives; put((pd.x0 + pd.x1 + TILE) / 2 - P().w / 2, pd.surface - P().h + 10, 200); step(6); const tossed = P().sinking <= 0 && P().vy < 0 && (P().x + P().w <= pd.x0 || P().x >= pd.x1 + TILE); rec(name, '11 water tosses out (easy mode)', tossed && lives === l0 - 1, `sinking=${P().sinking > 0}, on bank=${tossed}, hearts ${l0}→${lives}`); settings.easy = false; lives = maxLives(); step(30); } }
    // 12 brambles: touch → heart lost + knockback away
    { let ok = 0, fails = []; for (const s of spikes) { lives = maxLives(); put(s.x - P().w + 8, s.y + s.h - P().h, 0); P().onGround = true; step(2); const hit = lives === maxLives() - 1, away = Math.abs(P().vx) > 100; if (hit && away) ok++; else fails.push(`col ${Math.round(s.x / TILE)} (heart=${hit}, knockback=${away})`); step(40); }
      if (spikes.length) rec(name, '12 brambles (hurt + knockback)', fails.length === 0, `${ok}/${spikes.length}` + (fails.length ? ' FAIL: ' + fails.join('; ') : '')); lives = maxLives(); }
    // 13 lanterns: hopping over the column lights it and moves the respawn point; hearts refill
    { let ok = 0, fails = []; for (const c of checkpoints) { c.lit = false; lives = 1; put(c.x + 4, c.gy - 90, 0); let refilled = false; for (let i = 0; i < 6; i++) { update(1 / 60); if (c.lit) { refilled = lives === maxLives(); break; } } const lit = c.lit, start = Math.abs(P().startX - (c.gx - 5)) < 1; if (lit && start && refilled) ok++; else fails.push(`col ${Math.round(c.gx / TILE)} (lit=${lit}, respawn=${start}, refill=${refilled})`); }
      rec(name, '13 lanterns (tall trigger, respawn, refill)', fails.length === 0, `${ok}/${checkpoints.length}` + (fails.length ? ' FAIL: ' + fails.join('; ') : '')); }
  }
  keys.left = keys.right = keys.jump = false;
  return results;
};
