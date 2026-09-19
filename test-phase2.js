// Phase 2 tests: enemies, boss, bugs, power-ups — every instance on every level. Run in the game page:
//   eval(await (await fetch('test-phase2.js')).text()); phase2()
window.phase2 = function () {
  if (!Music.muted) Music.toggle();
  const step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) update(dt); };
  const P = () => player;
  const put = (x, y, vy = 0) => { const p = P(); p.x = x; p.y = y; p.vx = 0; p.vy = vy; p.dead = 0; p.sinking = 0; p.invuln = 0; p.knock = 0; p.riding = null; keys.left = keys.right = keys.jump = false; };
  const results = [];
  const rec = (level, feature, pass, detail) => results.push({ level, feature, pass, detail });
  const begin = (li, keepFlower) => { journey = null; ending = null; startLevel(li); step(130); Music.stop(); settings.easy = false; if (portal && !keepFlower) { portal.x = -9999; } };
  const groundUnder = (x, fromY) => surfaceBelow(x, fromY);
  const parkPlayerFar = () => { put(-500, -500); camX = -2000; };      // out of everyone's way (camera clamps but frogs check camX)

  for (let li = 0; li < LEVELS.length; li++) {
    begin(li); const name = LEVELS[li].name;
    for (const e of enemies) e.spawn = { x: e.x, y: e.y };
    const reset = (e) => { e.x = e.spawn.x; e.y = e.spawn.y; e.vx = e.type === 'toad' ? -40 : e.type === 'dragonfly' ? -80 : 0; e.vy = 0; e.alive = true; e.squash = 0; if (e.type === 'frog') { e.sit = 0.3; e.crouch = false; } };
    const frogs = enemies.filter(e => e.type === 'frog'), toads = enemies.filter(e => e.type === 'toad'), flies = enemies.filter(e => e.type === 'dragonfly');

    // ---------- 14 frogs ----------
    if (frogs.length) {
      let asleep = 0, woke = 0, crouched = 0, toward = 0, stomped = 0, sideHit = 0, fails = [];
      for (const f of frogs) {
        // fresh frog each time, back at its spawn point
        for (const e of enemies) { e.alive = false; e.squash = 9; } reset(f); parkPlayerFar(); step(20);
        const fx0 = f.x;
        // (a) asleep when off screen: stand 560px to the side, camera follows
        const side = f.x > 600 ? -1 : 1; put(f.x + side * 560, f.y); P().invuln = 2; for (let k = 0; k < 20; k++) { P().x = f.x + side * 560; P().y = f.y; P().vy = 0; P().vx = 0; update(1 / 60); camX = Math.max(0, Math.min(LEVEL_W - W, P().x - W / 2)); }
        let hopped = false; for (let k = 0; k < 120; k++) { P().x = f.x + side * 560; P().y = f.y; P().vy = 0; P().vx = 0; P().invuln = 2; update(1 / 60); camX = Math.max(0, Math.min(LEVEL_W - W, P().x - W / 2)); if (!f.onGround && f.vy < -100) hopped = true; }
        if (!hopped) asleep++; else fails.push(`frog col ${Math.round(fx0 / TILE)} hopped while off screen`);
        // (b) wakes, crouches, hops toward the player when on screen and near
        const px = f.x - side * 200; put(px, f.y); f.sit = 0.5; let sawCrouch = false, sawHop = false, dirOk = false;
        for (let k = 0; k < 240 && !sawHop; k++) { P().x = px; P().vx = 0; P().y = f.y; P().vy = 0; P().invuln = 2; update(1 / 60); if (f.crouch) sawCrouch = true; if (!f.onGround && f.vy < -100) { sawHop = true; dirOk = Math.sign(f.vx) === Math.sign(px - f.x) || f.vx === 0; } }
        if (sawHop) woke++; else fails.push(`frog col ${Math.round(fx0 / TILE)} never hopped when near`);
        if (sawCrouch) crouched++; else fails.push(`frog col ${Math.round(fx0 / TILE)} did not crouch first`);
        if (dirOk) toward++; else fails.push(`frog col ${Math.round(fx0 / TILE)} hopped away`);
        // (c) stomp
        reset(f); f.sit = 9; parkPlayerFar(); step(30);          // back at spawn, settled
        put(f.x + f.w / 2 - P().w / 2, f.y - P().h - 30, 0); let bounced = false; for (let k = 0; k < 40; k++) { update(1 / 60); if (!f.alive) { bounced = P().vy < -200; break; } }
        if (!f.alive && bounced) stomped++; else fails.push(`frog col ${Math.round(fx0 / TILE)} stomp failed (alive=${f.alive}, bounce=${bounced})`);
        // (d) side contact: heart + knockback
        reset(f); f.sit = 9; parkPlayerFar(); step(20); lives = maxLives(); put(f.x - P().w + 6, f.y + f.h - P().h); P().onGround = true; step(2);
        if (lives === maxLives() - 1 && P().knock > 0) sideHit++; else fails.push(`frog col ${Math.round(fx0 / TILE)} side hit (hearts ${lives}, knock ${P().knock.toFixed(2)})`);
        f.alive = false; f.squash = 9; step(40); lives = maxLives();
      }
      rec(name, '14 frogs asleep off screen', asleep === frogs.length, `${asleep}/${frogs.length}`);
      rec(name, '14 frogs wake + crouch + hop toward you', woke === frogs.length && crouched === frogs.length && toward === frogs.length, `woke ${woke}, crouched ${crouched}, toward ${toward} of ${frogs.length}`);
      rec(name, '14 frogs stompable', stomped === frogs.length, `${stomped}/${frogs.length}`);
      rec(name, '14 frogs side hit = heart + knockback', sideHit === frogs.length, `${sideHit}/${frogs.length}` + (fails.length ? ' | ' + fails.join('; ') : ''));
    }
    // ---------- 15 toads ----------
    if (toads.length) {
      let patrol = 0, safe = 0, unstomp = 0, fails = [];
      for (const t of toads) {
        for (const e of enemies) { e.alive = false; e.squash = 9; } reset(t); parkPlayerFar(); const x0 = t.x, y0 = t.y; let minX = t.x, maxX = t.x, fell = false, turned = false, lastVx = t.vx;
        for (let k = 0; k < 360; k++) { P().invuln = 2; update(1 / 60); minX = Math.min(minX, t.x); maxX = Math.max(maxX, t.x); if (t.y > y0 + 6) fell = true; if (Math.sign(t.vx) !== Math.sign(lastVx)) turned = true; lastVx = t.vx; }
        if (maxX - minX > 40) patrol++; else fails.push(`toad col ${Math.round(x0 / TILE)} barely moved`);
        if (!fell) safe++; else fails.push(`toad col ${Math.round(x0 / TILE)} fell off its ledge`);
        lives = maxLives(); const tx = t.x + t.w / 2 - P().w / 2; put(tx, t.y - P().h - 30, 0); for (let k = 0; k < 30; k++) { P().x = t.x + t.w / 2 - P().w / 2; update(1 / 60); if (lives < maxLives()) break; }
        if (t.alive && lives === maxLives() - 1) unstomp++; else fails.push(`toad col ${Math.round(x0 / TILE)} stomp: alive=${t.alive}, hearts=${lives}`);
        step(40); lives = maxLives();
      }
      rec(name, '15 toads patrol without falling', patrol === toads.length && safe === toads.length, `patrol ${patrol}, safe ${safe} of ${toads.length}`);
      rec(name, '15 toads cannot be stomped (hurts you)', unstomp === toads.length, `${unstomp}/${toads.length}` + (fails.length ? ' | ' + fails.join('; ') : ''));
    }
    // ---------- 16 dragonflies ----------
    if (flies.length) {
      let flying = 0, hurts = 0, fails = [];
      for (const d of flies) {
        for (const e of enemies) { e.alive = false; e.squash = 9; } reset(d); parkPlayerFar(); let minY = d.y, maxY = d.y, minX = d.x, maxX = d.x; for (let k = 0; k < 240; k++) { P().invuln = 2; update(1 / 60); minY = Math.min(minY, d.y); maxY = Math.max(maxY, d.y); minX = Math.min(minX, d.x); maxX = Math.max(maxX, d.x); }
        if (maxY - minY > 20 && maxX - minX > 40) flying++; else fails.push(`dragonfly col ${Math.round(d.baseY ? d.x / TILE : 0)} y-range ${Math.round(maxY - minY)} x-range ${Math.round(maxX - minX)}`);
        lives = maxLives(); put(d.x + 2, d.y - 2); for (let k = 0; k < 6; k++) { P().x = d.x + 2; P().y = d.y - 2; P().vy = 0; update(1 / 60); if (lives < maxLives()) break; } if (lives === maxLives() - 1) hurts++; else fails.push(`dragonfly col ${Math.round(d.x / TILE)} contact did not hurt`);
        step(40); lives = maxLives();
      }
      rec(name, '16 dragonflies fly (sine) and hurt on contact', flying === flies.length && hurts === flies.length, `fly ${flying}, hurt ${hurts} of ${flies.length}` + (fails.length ? ' | ' + fails.join('; ') : ''));
    }
    // ---------- 18 bugs & pods ----------
    {
      for (const e of enemies) { e.alive = false; e.squash = 9; } if (boss) boss.alive = false;
      const pods = []; for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (map[r][c] === 'B') pods.push([c, r]);
      const total = totalOrbs, plain = orbs.length;
      rec(name, '18 bug total = bugs + pods', total === plain + pods.length, `${total} = ${plain} + ${pods.length}`);
      let got = 0; Sfx.combo = 0; Sfx.comboT = 0; let comboMax = 0;
      for (const o of orbs.slice()) { if (o.taken) continue; put(o.x - 5, o.y - 8, 0); step(2); if (o.taken) got++; comboMax = Math.max(comboMax, Sfx.combo); }
      for (const [c, r] of pods) { put(c * TILE + 3, (r + 2) * TILE + 4, -JUMP_SPEED); P().jumping = true; keys.jump = true; step(15); keys.jump = false; const spawned = orbs[orbs.length - 1]; if (map[r][c] === '.' && spawned && !spawned.taken) { put(spawned.x - 5, spawned.y - 8, 0); step(2); if (spawned.taken) got++; } }
      rec(name, '18 every bug collectable, jar reaches total', collected === total, `collected ${collected}/${total}, flights spawned=${bugFlights.length >= 0}, combo reached ${comboMax}`);
    }
    // ---------- 19 power-ups ----------
    {
      const seeds = powerups.filter(u => u.type === 'double'), shields = powerups.filter(u => u.type === 'shield');
      for (const u of seeds) { u.taken = false; P().hasDouble = false; put(u.x - 3, u.y - 5, 0); step(2); const picked = P().hasDouble;
        // jump, then press again in the air
        let gc = Math.floor(u.x / TILE), gr = null; for (let d = 0; d < 8 && gr === null; d++) for (const cc of [gc + d, gc - d]) { let r = Math.floor(u.y / TILE) + 1; while (r < ROWS && map[r][cc] !== '#' && map[r][cc] !== 'w') r++; if (r < ROWS && map[r][cc] === '#' && map[r - 1][cc] === '.') { gr = r; gc = cc; break; } }
        put(gc * TILE + 3, gr * TILE - P().h, 0); step(5); keys.jump = true; step(12); keys.jump = false; step(20); const vBefore = P().vy; keys.jump = true; step(2); keys.jump = false; const dj = P().vy < -300 && vBefore > 0; step(12); const v2 = P().vy; keys.jump = true; step(2); keys.jump = false; const noTriple = P().vy >= v2 - 5;
        rec(name, '19 double-jump seed', picked && dj && noTriple, `picked=${picked}, double jump=${dj}, no triple=${noTriple}`); P().hasDouble = false; }
      for (const u of shields) { u.taken = false; P().shield = false; put(u.x - 3, u.y - 5, 0); step(2); const picked = P().shield; lives = maxLives();
        const target = spikes[0] || frogs[0]; let absorbed = false; if (target) { if (target.alive !== undefined) { target.alive = true; target.squash = 0; target.sit = 9; } put(target.x - P().w + 6, target.y + (target.h || 0) - P().h); P().onGround = true; P().invuln = 0; step(2); absorbed = !P().shield && lives === maxLives() && P().invuln > 0; if (target.alive !== undefined) { target.alive = false; target.squash = 9; } }
        rec(name, '19 dew shield absorbs one hit', picked && (target ? absorbed : true), `picked=${picked}, absorbed=${absorbed}, hearts ${lives}`); }
    }
    // ---------- 17 the King ----------
    if (boss) {
      begin(li, true); const b = boss; b.state = 'idle'; b.t = 1.0; b.vx = 0; const st0 = b.state; step(150); const charging = b.state === 'charge';
      // stays on the pond
      b.dir = -1; b.state = 'charge'; let maxFeet = 0, overPond = false; for (let k = 0; k < 400; k++) { P().invuln = 2; P().x = 3 * TILE; P().y = 8 * TILE; P().vy = 0; update(1 / 60); if (b.x + b.w / 2 > 13 * TILE && b.x + b.w / 2 < 17 * TILE) { overPond = true; maxFeet = Math.max(maxFeet, b.y + b.h); } }
      rec(name, '17 King idles then charges; walks on the pond', st0 !== 'charge' && charging && overPond && maxFeet <= 9 * TILE + 7, `start=${st0}, charging=${charging}, crossed pond=${overPond}, lowest feet row ${(maxFeet / TILE).toFixed(2)}`);
      // hops now and then
      let hops = 0, wasG = b.onGround; for (let k = 0; k < 600; k++) { P().invuln = 2; P().x = 3 * TILE; update(1 / 60); if (!b.onGround && wasG && b.vy < -300) hops++; wasG = b.onGround; }
      rec(name, '17 King hops periodically', hops >= 2, `${hops} hops in 10 s`);
      // stomp: damage, dazed, no double damage while dazed, bounce; side hit hurts; 3 stomps win; flower appears
      lives = maxLives(); const stomp = () => { put(b.x + b.w / 2 - P().w / 2, b.y - P().h + 2, 150); update(1 / 60); };
      let n = 0; while (b.state === 'hurt' && n++ < 200) update(1 / 60);
      stomp(); const hp1 = b.hp, dazed = b.state === 'hurt', bounce1 = P().vy < -300; stomp(); const hp1b = b.hp, bounce2 = P().vy < -200;
      rec(name, '17 King: stomp = damage + daze + bounce; no damage while dazed', hp1 === 2 && dazed && bounce1 && hp1b === 2 && bounce2, `hp after stomp ${hp1}, dazed=${dazed}, bounce=${bounce1}, hp after dazed stomp ${hp1b}, bounced=${bounce2}`);
      n = 0; while (b.state === 'hurt' && n++ < 200) update(1 / 60); lives = maxLives(); put(b.x - P().w + 4, b.y + 20, 0); P().invuln = 0; step(2); rec(name, '17 King side hit hurts', lives === maxLives() - 1 && P().knock > 0, `hearts ${lives}, knockback=${P().knock > 0}`);
      step(60); n = 0; while (b.alive && n++ < 3000) { if (b.state !== 'hurt' && P().dead <= 0 && P().sinking <= 0) { put(b.x + b.w / 2 - P().w / 2, b.y - P().h + 2, 150); } update(1 / 60); }
      rec(name, '17 King beaten in 3 stomps, flower appears', !b.alive && !!portal, `alive=${b.alive}, flower=${!!portal}`);
      put(portal.x, portal.y + 10, 0); step(150, 1 / 60 * 0.35); rec(name, '17 entering the flower starts the ending', !!ending, `ending=${!!ending}`); ending = null; running = false;
    }
  }
  keys.left = keys.right = keys.jump = false;
  return results;
};
