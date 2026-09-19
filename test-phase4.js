// Phase 4 tests: hints, options, pause/mute, audio. Run in the game page:
//   eval(await (await fetch('test-phase4.js')).text()); phase4()
window.phase4 = function () {
  const step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) update(dt); };
  const P = () => player;
  const put = (x, y, vy = 0) => { const p = P(); p.x = x; p.y = y; p.vx = 0; p.vy = vy; p.dead = 0; p.sinking = 0; p.invuln = 0; p.knock = 0; p.riding = null; keys.left = keys.right = keys.jump = false; };
  const results = [];
  const rec = (area, feature, pass, detail) => results.push({ level: area, feature, pass, detail });
  const begin = (li) => { journey = null; ending = null; settings.easy = false; settings.slow = false; startLevel(li); step(130); Music.stop(); if (portal) portal.x = -9999; for (const e of enemies) { e.alive = false; e.squash = 9; } if (boss) boss.alive = false; };
  const clearHints = () => { for (const k in hintsSeen) delete hintsSeen[k]; localStorage.removeItem('hop-hints'); hint = null; };
  const findIn = (pred) => { for (let li = 0; li < LEVELS.length; li++) { begin(li); const r = pred(); if (r) return { li, ...r }; } return null; };

  // ================= 27 hints =================
  const HINT_TRIGGERS = {
    move:   () => { begin(0); put(P().startX, P().startY); step(5); return LEVELS[0].name; },
    frog:   () => { const f = findIn(() => { const f = enemies.find(e => e.type === 'frog'); return f ? { f } : null; }); const f0 = f.f; f0.alive = true; f0.squash = 0; f0.sit = 0.3; hintsSeen.move = 1; put(f0.x - 150, f0.y); for (let k = 0; k < 480 && !(hint && hint.key === 'frog'); k++) { P().x = f0.x - 150; P().y = f0.y; P().vy = 0; P().invuln = 2; update(1 / 60); } f0.alive = false; f0.squash = 9; return LEVELS[f.li].name; },
    water:  () => { const w = findIn(() => water.length ? { w: water.reduce((a, b) => a.x < b.x ? a : b) } : null); hintsSeen.move = 1; put(w.w.x - 100, w.w.surface - P().h - 2); step(4); return LEVELS[w.li].name; },
    toad:   () => { const t = findIn(() => { const t = enemies.find(e => e.type === 'toad'); return t ? { t } : null; }); t.t.alive = true; t.t.squash = 0; hintsSeen.move = 1; put(t.t.x - 150, t.t.y); for (let k = 0; k < 6; k++) { P().x = t.t.x - 150; P().y = t.t.y; P().vy = 0; P().invuln = 2; update(1 / 60); } t.t.alive = false; t.t.squash = 9; return LEVELS[t.li].name; },
    pad:    () => { const p = findIn(() => pads.length ? { pad: pads[0] } : null); hintsSeen.move = 1; put(p.pad.x - 60, p.pad.y - P().h - 40); step(4); return LEVELS[p.li].name; },
    crumble:() => { const c = findIn(() => { for (const k in crumbles) return { key: k }; return null; }); const [cc, rr] = c.key.split(',').map(Number); hintsSeen.move = 1; put(cc * TILE + 3, rr * TILE - P().h); step(3); return LEVELS[c.li].name; },
    checkpoint: () => { const c = findIn(() => checkpoints.length ? { c: checkpoints[0] } : null); hintsSeen.move = 1; c.c.lit = false; put(c.c.x + 4, c.c.gy - 90); step(3); return LEVELS[c.li].name; },
    double: () => { const u = findIn(() => { const u = powerups.find(x => x.type === 'double'); return u ? { u } : null; }); hintsSeen.move = 1; u.u.taken = false; put(u.u.x - 3, u.u.y - 5); step(3); return LEVELS[u.li].name; },
    shield: () => { const u = findIn(() => { const u = powerups.find(x => x.type === 'shield'); return u ? { u } : null; }); hintsSeen.move = 1; u.u.taken = false; put(u.u.x - 3, u.u.y - 5); step(3); return LEVELS[u.li].name; },
    ledge:  () => { const l = findIn(() => { for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (map[r][c] === '=') { const g = surfaceBelow(c * TILE + 16, (r + 1) * TILE); if (g !== null && g - r * TILE < 140 && map[Math.floor(g / TILE)][c] === '#') return { c, r, g }; } return null; }); hintsSeen.move = 1; put(l.c * TILE + 3, l.g - P().h); step(4); return LEVELS[l.li].name; },
    seed:   () => { const b = findIn(() => { for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (map[r][c] === 'B') { const g = surfaceBelow(c * TILE + 16, (r + 1) * TILE); if (g !== null) return { c, r, g }; } return null; }); hintsSeen.move = 1; put(b.c * TILE + 3, b.g - P().h); step(4); return LEVELS[b.li].name; },
  };
  for (const key of Object.keys(HINT_TRIGGERS)) {
    clearHints(); let where = ''; try { where = HINT_TRIGGERS[key](); } catch (e) { rec('Hints', `27 hint "${key}"`, false, 'trigger error: ' + e.message); continue; }
    const shown = hint && hint.key === key;
    step(80);                                                            // 1.3 s: now remembered
    const remembered = !!hintsSeen[key] && (JSON.parse(localStorage.getItem('hop-hints') || '{}'))[key] === 1;
    step(200); const gone = hint === null || hint.key !== key;          // life is 4.2 s
    // re-trigger with the hint marked seen: must not show
    hint = null; hintsSeen[key] = 1; try { HINT_TRIGGERS[key](); } catch (e) {} const shownAgain = hint && hint.key === key;
    rec('Hints', `27 hint "${key}" (${where})`, shown && remembered && gone && !shownAgain, `shown=${shown}, remembered after 1.3 s=${remembered}, gone after ~4.6 s=${gone}, repeats=${!!shownAgain}`);
  }
  // one at a time + move hint clears after running and hopping
  { clearHints(); begin(0); hint = null; delete hintsSeen.move; put(P().startX, P().startY); step(1); const first = hint && hint.key; const w = water.reduce((a, b) => a.x < b.x ? a : b); put(w.x - 100, w.surface - P().h - 2); step(4); const still = hint && hint.key;
    rec('Hints', '27 a fresh hint is not replaced by another for 1.2 s', first === 'move' && still === 'move', `showing "${first}" then near water still "${still}"`);
    put(P().startX, P().startY); step(5); keys.right = true; step(10); keys.jump = true; step(12); keys.jump = false; step(50); keys.right = false; const cleared = hint === null || hint.key !== 'move';
    rec('Hints', '27 move hint disappears once you run and hop', cleared, `hint now ${hint && hint.key}`); }
  // first stomp slow-mo, once
  { clearHints(); begin(0); const f = enemies.find(e => e.type === 'frog'); const stomp = () => { f.alive = true; f.squash = 0; f.sit = 9; f.vy = 0; put(f.x + f.w / 2 - P().w / 2, f.y - P().h - 30); for (let k = 0; k < 40 && f.alive; k++) update(1 / 60); };
    stomp(); const s1 = slowmo; slowmo = 0; stomp(); const s2 = slowmo;
    rec('Hints', '27 first stomp slow-motion happens once', s1 > 0 && s2 === 0 && hintsSeen.firstStomp === 1, `first=${s1.toFixed(2)}, second=${s2}`); }
  clearHints();

  // ================= 28 options =================
  {
    const opt = (id) => document.getElementById(id);
    const stage = document.querySelector('.stage');
    // reset all off
    for (const k of ['lefty', 'bigButtons', 'easy', 'slow', 'contrast']) settings[k] = false; applySettings();
    opt('opt-lefty').click(); const l1 = { on: settings.lefty, label: opt('opt-lefty').textContent, cls: stage.classList.contains('lefty'), saved: localStorage.getItem('hop-lefty') };
    const leftRight = getComputedStyle(document.querySelector('.touch.left')).right, rightLeft = getComputedStyle(document.querySelector('.touch.right')).left;
    opt('opt-lefty').click(); const l2 = { on: settings.lefty, cls: stage.classList.contains('lefty') };
    rec('Options', '28 left-handed layout toggles, swaps sides, persists', l1.on && l1.label === 'Left-handed' && l1.cls && l1.saved === '1' && leftRight === '14px' && rightLeft === '14px' && !l2.on && !l2.cls, `on: ${JSON.stringify(l1)}, css right/left=${leftRight}/${rightLeft}, off again=${!l2.on}`);
    opt('opt-size').click(); const b1 = { on: settings.bigButtons, cls: stage.classList.contains('bigbtn'), saved: localStorage.getItem('hop-bigbtn'), w: getComputedStyle(document.querySelector('.pad.jump')).width }; opt('opt-size').click();
    rec('Options', '28 large buttons toggles, applies, persists', b1.on && b1.cls && b1.saved === '1' && parseInt(b1.w) >= 116 && !settings.bigButtons, `${JSON.stringify(b1)}`);
    opt('opt-easy').click(); const e1 = { on: settings.easy, label: opt('opt-easy').textContent, saved: localStorage.getItem('hop-easy'), hearts: maxLives(), lit: opt('opt-easy').classList.contains('on') }; opt('opt-easy').click();
    rec('Options', '28 easy mode toggles, 5 hearts, persists, highlights', e1.on && e1.label === 'Easy mode: on' && e1.saved === '1' && e1.hearts === 5 && e1.lit && !settings.easy && maxLives() === 3, `${JSON.stringify(e1)}`);
    begin(0); opt('opt-slow').click(); startLevel(0); step(5); Music.stop(); const s1 = { on: settings.slow, base: baseSpeed(), scale: timeScale, saved: localStorage.getItem('hop-slow') }; opt('opt-slow').click(); startLevel(0); step(5); Music.stop(); const s2 = timeScale;
    rec('Options', '28 slow motion toggles to 70% and back', s1.on && s1.base === 0.7 && s1.scale === 0.7 && s1.saved === '1' && s2 === 1, `${JSON.stringify(s1)}, back to ${s2}`);
    opt('opt-contrast').click(); let drawOk = true; try { begin(0); draw(); } catch (e) { drawOk = false; } const c1 = { on: settings.contrast, saved: localStorage.getItem('hop-contrast'), drawOk }; opt('opt-contrast').click();
    rec('Options', '28 high contrast toggles, draws without error, persists', c1.on && c1.saved === '1' && c1.drawOk && !settings.contrast, `${JSON.stringify(c1)}`);
    for (const k of ['lefty', 'bigButtons', 'easy', 'slow', 'contrast']) settings[k] = false; applySettings();
  }

  // ================= 29 pause & mute =================
  {
    begin(0); running = true; paused = false;
    const key = (k) => document.dispatchEvent(new KeyboardEvent('keydown', { key: k }));
    key('p'); const p1 = { paused, icon: document.getElementById('pause-btn').textContent, audio: Sfx.ctx.state };
    const t0 = time; lastTime = performance.now() - 16; loop(performance.now()); const frozen = time === t0;   // the loop must not advance while paused
    key('p'); const p2 = { paused, icon: document.getElementById('pause-btn').textContent };
    key('Escape'); const p3 = paused; canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); const p4 = paused;
    document.getElementById('pause-btn').click(); const p5 = paused; document.getElementById('pause-btn').click(); const p6 = paused;
    rec('Pause', '29 P / Esc / button pause; tap or button resumes; loop frozen; audio suspended', p1.paused && p1.icon === '▶' && p1.audio === 'suspended' && frozen && !p2.paused && p2.icon === '⏸' && p3 && !p4 && p5 && !p6, `P:${p1.paused} icon ${p1.icon} audio ${p1.audio} frozen ${frozen}; P again:${p2.paused}; Esc:${p3} tap:${p4}; btn:${p5}/${p6}`);
    const hiddenDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); const auto = paused;
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); const stillPaused = paused; setPaused(false);
    delete document.hidden;
    rec('Pause', '29 auto-pauses when the tab is hidden and stays paused on return', auto && stillPaused, `hidden -> paused ${auto}; visible again -> still paused ${stillPaused}`);
    // mute
    const wasMuted = Music.muted; if (Music.muted) Music.toggle();
    let osc = 0; const origCreate = Sfx.ctx.createOscillator.bind(Sfx.ctx); Sfx.ctx.createOscillator = () => { osc++; return origCreate(); };
    Sfx.jump(); const unmutedOsc = osc; key('m'); const m1 = { muted: Music.muted, icon: document.getElementById('mute-btn').textContent, saved: localStorage.getItem('hop-muted'), ambientGain: Ambient.gain ? Ambient.gain.gain.value : 'n/a' };
    osc = 0; Sfx.jump(); Sfx.pickup(); const mutedOsc = osc; document.getElementById('mute-btn').click(); const m2 = { muted: Music.muted, icon: document.getElementById('mute-btn').textContent, saved: localStorage.getItem('hop-muted') };
    Sfx.ctx.createOscillator = origCreate;
    rec('Mute', '29 M key / button toggle mute, icon + saved, effects silenced while muted', unmutedOsc > 0 && m1.muted && m1.icon === '🔇' && m1.saved === '1' && mutedOsc === 0 && !m2.muted && m2.icon === '🔊' && m2.saved === '0', `oscillators unmuted=${unmutedOsc} muted=${mutedOsc}; ${JSON.stringify(m1)} -> ${JSON.stringify(m2)}`);
    if (wasMuted && !Music.muted) Music.toggle();
  }

  // ================= 30 audio =================
  {
    const wasMuted = Music.muted; if (Music.muted) Music.toggle();
    const bpms = [], beds = []; for (let li = 0; li < LEVELS.length; li++) { journey = null; startLevel(li); bpms.push(Music.track.bpm); beds.push(Ambient.kind); Music.stop(); }
    rec('Audio', '30 a different music track for every level, ambient bed per world', JSON.stringify(bpms) === JSON.stringify([118, 100, 112, 88, 100, 140, 150]) && new Set(LEVELS.map(L => TRACKS[L.track].name)).size === 7 && JSON.stringify(beds) === JSON.stringify(['meadow', 'meadow', 'pond', 'pond', 'sunset', 'sunset', 'boss']), `bpm ${bpms.join(',')} | beds ${beds.join(',')}`);
    startLevel(0); const running1 = !!Music.timer && Ambient.timers.length > 0; step(130); orbs.forEach(o => o.taken = true); collected = totalOrbs; put(portal.x, portal.y + 10); step(150, 1 / 60 * 0.35); const journeyMusic = !!Music.timer; journey = null; Music.stop(); const stopped = Music.timer === null && Ambient.timers.length === 0;
    rec('Audio', '30 music + ambience start with a level, continue into the journey, stop on request', running1 && journeyMusic && stopped, `running=${running1}, in journey=${journeyMusic}, stopped=${stopped}`);
    const freqs = []; const origTone = Sfx.tone; Sfx.tone = function (a, ...rest) { freqs.push(Math.round(a)); return origTone.call(this, a, ...rest); };
    Sfx.jump(); Sfx.jump(); Sfx.jump(); const jumps = freqs.slice(); freqs.length = 0;
    Sfx.combo = 0; Sfx.comboT = 0; Sfx.pickup(); Sfx.pickup(); Sfx.pickup(); const pick = freqs.filter((_, i) => i % 2 === 0); Sfx.tone = origTone;
    rec('Audio', '30 effects vary in pitch; bug combo rises', new Set(jumps).size >= 2 && pick[0] < pick[1] && pick[1] < pick[2], `jump base freqs ${jumps.join(',')} | combo pitches ${pick.join(',')}`);
    let ducked = true; try { Music.start(0); Music.duck(0.4, 0.6); } catch (e) { ducked = false; } Music.stop();
    rec('Audio', '30 ducking runs without error; mute state persists across reload key', ducked && localStorage.getItem('hop-muted') !== null, `duck ok=${ducked}, saved mute=${localStorage.getItem('hop-muted')}`);
    if (wasMuted && !Music.muted) Music.toggle();
  }
  running = false; keys.left = keys.right = keys.jump = false;
  return results;
};
