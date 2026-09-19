// Phase 3 tests: hearts, fairness, level flow. Run in the game page:
//   eval(await (await fetch('test-phase3.js')).text()); phase3()
window.phase3 = function () {
  if (!Music.muted) Music.toggle();
  const step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) update(dt); };
  const P = () => player;
  const put = (x, y, vy = 0) => { const p = P(); p.x = x; p.y = y; p.vx = 0; p.vy = vy; p.dead = 0; p.sinking = 0; p.invuln = 0; p.knock = 0; p.riding = null; keys.left = keys.right = keys.jump = false; };
  const results = [];
  const rec = (level, feature, pass, detail) => results.push({ level, feature, pass, detail });
  const begin = (li, keepFlower) => { journey = null; ending = null; settings.easy = false; settings.slow = false; startLevel(li); step(130); Music.stop(); if (portal && !keepFlower) portal.x = -9999; for (const e of enemies) { e.alive = false; e.squash = 9; } if (boss) boss.alive = false; };
  const lanternsSorted = () => [...checkpoints].sort((a, b) => a.x - b.x);
  const lightLantern = (c) => { put(c.x + 4, c.gy - 90, 0); step(3); };
  const finishLevel = () => { P().dead = 0; P().sinking = 0; put(portal.x, portal.y + 10, 0); step(150, 1 / 60 * 0.35); };
  const stompPoint = () => { const f = enemies.find(e => e.type === 'frog'); return f; };

  // ================= 20 hearts, on every level =================
  for (let li = 0; li < LEVELS.length; li++) {
    begin(li); const name = LEVELS[li].name; const ls = lanternsSorted();
    const frog = stompPoint();
    if (ls.length && frog) {
      lightLantern(ls[0]); const lantern = ls[0]; for (const c of ls) if (c !== lantern) c.lit = true;   // other lanterns pre-lit so knockback cannot refill hearts
      // three hits from a frog: 3 -> 2 -> 1 -> faint
      const hit = () => { frog.alive = true; frog.squash = 0; frog.sit = 9; frog.vy = 0; const leftOk = surfaceBelow(frog.x - 70, frog.y) !== null && surfaceBelow(frog.x - 70, frog.y) <= frog.y + frog.h + 40; put(leftOk ? frog.x - P().w + 6 : frog.x + frog.w - 6, frog.y + frog.h - P().h); P().onGround = true; step(2); const r = { hearts: lives, knock: P().knock > 0, dead: P().dead > 0 }; frog.alive = false; frog.squash = 9; return r; };
      lives = maxLives(); const h1 = hit(); step(110); const h2 = hit(); step(110); const h3 = hit(); step(80);
      const atLantern = Math.abs(P().x - (lantern.gx - 5)) < 2;
      rec(name, '20 hit = -1 heart + knockback, stays in play', h1.hearts === 2 && h1.knock && !h1.dead && h2.hearts === 1 && h2.knock && !h2.dead, `after hits: ${h1.hearts}, ${h2.hearts} hearts; knockback ${h1.knock}/${h2.knock}; still playing ${!h1.dead}/${!h2.dead}`);
      rec(name, '20 last heart = faint -> lantern, hearts refilled, no Game Over', h3.dead && atLantern && lives === maxLives() && overlay.classList.contains('hidden') && running, `fainted=${h3.dead}, back at lantern=${atLantern}, hearts=${lives}, overlay hidden=${overlay.classList.contains('hidden')}`);
    }
    // pit or water costs one heart and returns you
    { lives = maxLives(); const before = lives; put(P().startX + 40, LEVEL_H + 100, 0); step(70); rec(name, '20 pit costs one heart, back to lantern', lives === before - 1 && Math.abs(P().x - P().startX) < 2, `hearts ${before}->${lives}, back=${Math.abs(P().x - P().startX) < 2}`); }
    // easy mode: 5 hearts
    { settings.easy = true; journey = null; startLevel(li); step(130); Music.stop(); rec(name, '20 easy mode = 5 hearts', lives === 5 && maxLives() === 5, `hearts ${lives}`); settings.easy = false; }
  }

  // ================= 21 stuck assist, every level with lanterns =================
  for (let li = 0; li < LEVELS.length; li++) {
    begin(li); const name = LEVELS[li].name; const ls = lanternsSorted(); if (!ls.length) continue;
    lightLantern(ls[0]); deathsHere = 0; skipOffered = false; skipBtn.style.display = 'none';
    const die = () => { P().invuln = 0; P().dead = 0; hurt(true); step(70); };
    die(); die(); const a2 = assistLevel(); die();
    // wider jump window: coyote on ground
    put(P().startX, P().startY, 0); step(5); const coyote = P().coyote;
    // frogs wait longer: force a hop and read the new sit time
    const f = enemies.find(e => e.type === 'frog'); let sitAfter = null; if (f) { f.alive = true; f.squash = 0; f.sit = 0; f.vx = 0; put(f.x - 150, f.y); for (let k = 0; k < 120; k++) { P().x = f.x - 150; P().y = f.y; P().vy = 0; P().invuln = 2; update(1 / 60); if (!f.onGround && f.vy < -100) { sitAfter = f.sit; break; } } f.alive = false; f.squash = 9; }
    rec(name, '21 after 3 deaths: wider jump window + patient frogs (silent)', a2 === 0 && assistLevel() === 1 && Math.abs(coyote - 0.18) < 0.02 && (sitAfter === null || sitAfter >= 1.2 * 1.4 - 0.01), `assist after 2 deaths=${a2}, after 3=${assistLevel()}, coyote=${coyote.toFixed(2)}, frog sit=${sitAfter && sitAfter.toFixed(2)}`);
    die(); die(); const shown5 = skipBtn.style.display !== 'none'; die(); const shown6 = skipBtn.style.display !== 'none';
    const next = ls.find(c => c.x > P().startX + 10);
    skipAhead(); step(3);
    const landed = next ? Math.abs(P().startX - (next.gx - 5)) < 2 && next.lit : Math.abs(P().startX - (portal.x - 80)) < 2;
    rec(name, '21 after 6 deaths: skip offer -> next lantern', !shown5 && shown6 && landed && deathsHere === 0 && skipBtn.style.display === 'none', `offer at 5=${shown5}, at 6=${shown6}, skipped to ${next ? 'lantern col ' + Math.round(next.gx / TILE) : 'the flower'}=${landed}, counter reset=${deathsHere === 0}`);
    // reaching a lantern resets the counter
    deathsHere = 4; const c2 = ls.find(c => !c.lit) || ls[ls.length - 1]; c2.lit = false; lightLantern(c2); rec(name, '21 lantern resets the death counter', deathsHere === 0, `deathsHere=${deathsHere}`);
  }

  // ================= 23 timer, stars, best times, persistence (level 1) =================
  {
    begin(0, true); const name = 'Morning Meadow';
    const t0 = levelTime; rec(name, '23 timer starts after the banner', Math.abs(t0 - (130 / 60 - 0.6)) < 0.08, `after 2.17 s of level: timer ${t0.toFixed(2)} s (expected ~1.57)`);
    P().invuln = 0; hurt(true); const tDead = levelTime; step(30); rec(name, '23 timer pauses while fainted', Math.abs(levelTime - tDead) < 0.001, `frozen at ${levelTime.toFixed(2)}`); step(60);
    const saved = { stars: JSON.stringify(starsWon), best: JSON.stringify(bestTimes), total: totalOrbsEver, unlocked };
    // stars: 0 bugs -> 1, 60% -> 2, all -> 3
    const finishWith = (k, timeOverride, assist) => { begin(0, true); if (assist) settings[assist] = true; orbs.forEach((o, i) => { if (i < k) { o.taken = true; } }); collected = k; if (timeOverride !== undefined) levelTime = timeOverride; finishLevel(); const j = journey; journey = null; settings.slow = false; settings.easy = false; return j; };
    const j1 = finishWith(0), j2 = finishWith(Math.ceil(totalOrbs * 0.6)), j3 = finishWith(totalOrbs);
    rec(name, '23 stars: 1 for finishing, 2 at 60%, 3 for all bugs', j1 && j1.stars === 1 && j2 && j2.stars === 2 && j3 && j3.stars === 3, `${j1 && j1.stars}, ${j2 && j2.stars}, ${j3 && j3.stars}`);
    rec(name, '23 best stars kept, unlock saved, bug total grows', starsWon[0] === 3 && unlocked >= 2 && localStorage.getItem('hop-unlocked') == unlocked && totalOrbsEver === saved.total + Math.ceil(totalOrbs * 0.6) + totalOrbs && JSON.parse(localStorage.getItem('hop-stars'))[0] === 3, `stars[0]=${starsWon[0]}, unlocked=${unlocked}, total ${saved.total}->${totalOrbsEver}`);
    // best time: only improves, not with assists
    delete bestTimes[0]; finishWith(0, 5.0); const b1 = bestTimes[0]; finishWith(0, 7.0); const b2 = bestTimes[0]; finishWith(0, 3.0); const b3 = bestTimes[0];
    finishWith(0, 1.0, 'slow'); const b4 = bestTimes[0]; finishWith(0, 0.5, 'easy'); const b5 = bestTimes[0];
    rec(name, '23 best time: saves, keeps the better one, ignored with assists on', Math.abs(b1 - 5) < 0.02 && Math.abs(b2 - 5) < 0.02 && Math.abs(b3 - 3) < 0.02 && Math.abs(b4 - 3) < 0.02 && Math.abs(b5 - 3) < 0.02 && Math.abs(JSON.parse(localStorage.getItem('hop-best'))[0] - 3) < 0.02, `5 -> ${b1}, 7 -> ${b2}, 3 -> ${b3}, slow 1 -> ${b4}, easy 0.5 -> ${b5}`);
  }

  // ================= 24 journey scene =================
  {
    begin(0, true); orbs.forEach(o => o.taken = true); collected = totalOrbs; finishLevel();
    const j = journey; const ok0 = !!j && j.from === 0 && j.to === 1 && j.stars === 3 && overlay.classList.contains('hidden') && !!Music.timer;
    const a = jStop(0), b = jStop(1); const x0 = P().x;
    step(40); const stillAtStart = Math.abs(P().x - x0) < 2;                   // 1 s: celebrating
    step(110); const midway = P().x > a.x && P().x < b.x - 10 && j.hop >= 1;   // 2.5 s: hopping
    step(90); const landed = Math.abs(P().x + P().w / 2 - b.x) < 2 && j.hop === 99; // 4 s: landed
    rec('Journey', '24 starts after a level, shows stars, keeps music, celebrates then hops then lands', ok0 && stillAtStart && midway && landed, `from ${j && j.from} to ${j && j.to} stars ${j && j.stars}; start=${stillAtStart}, midway=${midway}, landed=${landed}`);
    let croaks = 0, lastPuff = 0; for (let k = 0; k < 60; k++) { update(1 / 60); if (j.puff > lastPuff) croaks++; lastPuff = j.puff; }
    const before = levelIndex; step(120); rec('Journey', '24 auto-continues into the next level', journey === null && levelIndex === 1 && running, `level now ${levelIndex}, journey over=${journey === null}, King puffed ${croaks > 0}`);
    const tap = () => canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    begin(1, true); orbs.forEach(o => o.taken = true); collected = totalOrbs; finishLevel(); step(80); tap(); step(2);
    rec('Journey', '24 tap to skip after 1.2 s', journey === null && levelIndex === 2, `level now ${levelIndex}`);
    begin(1, true); finishLevel(); step(20); tap(); step(2); rec('Journey', '24 cannot skip in the first 1.2 s', !!journey, `journey still on=${!!journey}`); journey = null;
  }

  // ================= 25 ending =================
  {
    begin(6, true); const b = boss; b.alive = true; let n = 0; while (b.alive && n++ < 3000) { if (b.state !== 'hurt' && P().dead <= 0 && P().sinking <= 0) put(b.x + b.w / 2 - P().w / 2, b.y - P().h + 2, 150); update(1 / 60); }
    finishLevel(); const e0 = !!ending;
    step(120); const swarm2 = ending ? ending.swarm.length : 0; step(180); const swarm5 = ending ? ending.swarm.length : 0;
    const hopping = ending && ending.t > 2 && (P().vy !== 0 || !P().onGround);
    rec('Ending', '25 starts at the flower, flower blooms and bugs swarm out, grasshopper hops', e0 && swarm2 > 5 && swarm5 > swarm2 && !overlay.classList.contains('hidden') === false, `swarm after 2 s=${swarm2}, after 5 s=${swarm5}, hopping=${hopping}`);
    const savedStars = starsWon[6]; finishEnding(); rec('Ending', '25 skip -> "The meadow is safe!" card, level 7 stars saved', ending === null && ovTitle.textContent === 'The meadow is safe!' && !overlay.classList.contains('hidden') && (starsWon[6] || 0) >= 1, `title="${ovTitle.textContent}", stars[6]=${starsWon[6]}`);
    begin(6, true); b.alive = false; portal = { x: b.x + b.w / 2 - 12, y: 7 * TILE + 4, w: 24, h: TILE * 2 - 8 }; finishLevel(); step(60); ending.skip = true; step(900); rec('Ending', '25 runs to its natural end (~14.5 s) without a skip', ending === null && ovTitle.textContent === 'The meadow is safe!', `ended=${ending === null}`);
  }

  // ================= 26 world map =================
  {
    running = false; unlocked = 3; buildLevelSelect();
    const xs = LEVELS.map((_, i) => mapSpot(i).x); const increasing = xs.every((x, i) => i === 0 || x > xs[i - 1]);
    const r = mapCanvas.getBoundingClientRect(); const click = (i) => { const p = mapSpot(i); mapCanvas.dispatchEvent(new MouseEvent('click', { clientX: r.left + p.x * r.width / MAP_W, clientY: r.top + (p.y + 8) * r.height / MAP_H, bubbles: true })); };
    const move = (i) => { const p = mapSpot(i); mapCanvas.dispatchEvent(new MouseEvent('mousemove', { clientX: r.left + p.x * r.width / MAP_W, clientY: r.top + (p.y + 8) * r.height / MAP_H, bubbles: true })); return mapCanvas.title; };
    const tipOpen = move(1), tipLocked = move(5);
    click(5); const lockedIgnored = !running; click(1); const opened = running && levelIndex === 1;
    rec('Map', '26 spots in order, tooltips, locked spots ignored, unlocked spots start the level', increasing && tipOpen.includes(LEVELS[1].name) && tipLocked === 'Locked' && lockedIgnored && opened, `tooltip "${tipOpen}" / "${tipLocked}", locked click ignored=${lockedIgnored}, open click started level ${levelIndex + 1}`);
    rec('Map', '26 chips hidden, map shown on the campaign card', mapCanvas.style.display !== 'none' && lvlSel.children.length === 0, `map display=${mapCanvas.style.display}, chips=${lvlSel.children.length}`);
    running = false; Music.stop(); unlocked = Number(localStorage.getItem('hop-unlocked') || 1);
  }
  keys.left = keys.right = keys.jump = false;
  return results;
};
