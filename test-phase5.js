// Phase 5 tests: presentation, platform & tooling. Run in the game page:
//   eval(await (await fetch('test-phase5.js')).text()); phase5()          - scaling, touch, install button
//   await phase5async()                                                     - performance, service worker, cache, manifest
//   ...set hop-custom-level + hop-play-custom, reload, then: phase5custom() - custom-level mode
//   in editor.html: phase5editor()                                          - editor round-trip
window.phase5 = function () {
  const step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) update(dt); };
  const results = [];
  const rec = (area, feature, pass, detail) => results.push({ level: area, feature, pass, detail });
  const begin = (li) => { journey = null; ending = null; startLevel(li); cancelAnimationFrame(frameReq); Music.stop(); step(130); };
  const vw = innerWidth, vh = innerHeight, tag = `${vw}x${vh}`;

  // ================= 31 scaling =================
  {
    const r = canvas.getBoundingClientRect();
    const ratio = r.width / r.height, fits = r.width <= vw + 1 && r.height <= vh + 1, maxed = Math.abs(r.width - vw) < 2 || Math.abs(r.height - vh) < 2;
    const centred = Math.abs((vw - r.width) / 2 - r.left) < 2 && Math.abs((vh - r.height) / 2 - r.top) < 2;
    const se = document.scrollingElement, noScroll = se.scrollWidth <= vw + 1 && se.scrollHeight <= vh + 1;
    rec('Scaling ' + tag, '31 canvas is 16:9, as large as the screen allows, centred, no page scroll', Math.abs(ratio - 16 / 9) < 0.01 && fits && maxed && centred && noScroll, `canvas ${Math.round(r.width)}x${Math.round(r.height)} at (${Math.round(r.left)},${Math.round(r.top)}) ratio ${ratio.toFixed(3)} scroll ${se.scrollWidth}x${se.scrollHeight}`);
    const c = document.querySelector('.card'); const cr = c.getBoundingClientRect(); const br = ovBtn.getBoundingClientRect();
    const cardOk = overlay.classList.contains('hidden') || (cr.height <= vh + 1 && br.bottom <= vh + 1 && br.top >= 0);
    rec('Scaling ' + tag, '31 title card fits the screen and Play is reachable', cardOk, `card ${Math.round(cr.width)}x${Math.round(cr.height)} play button bottom ${Math.round(br.bottom)} of ${vh}${overlay.classList.contains('hidden') ? ' (overlay hidden)' : ''}`);
  }

  // ================= 32 touch controls + rotate prompt =================
  {
    const coarse = matchMedia('(pointer: coarse)').matches, portrait = matchMedia('(orientation: portrait)').matches;
    const padsShown = getComputedStyle(document.querySelector('.touch.left')).display !== 'none';
    rec('Touch ' + tag, `32 on-screen pads ${coarse ? 'shown on a touch screen' : 'hidden with a mouse'}`, padsShown === coarse, `pointer coarse=${coarse}, pads display=${getComputedStyle(document.querySelector('.touch.left')).display}, isTouch flag=${isTouch}`);
    const rot = getComputedStyle(document.getElementById('rotate')).display !== 'none';
    rec('Touch ' + tag, `32 rotate prompt ${coarse && portrait ? 'shown when a phone is held upright' : 'hidden'}`, rot === (coarse && portrait), `portrait=${portrait}, rotate display=${getComputedStyle(document.getElementById('rotate')).display}`);
    if (coarse) {
      const hintTouch = HINTS.move.includes('▶'); rec('Touch ' + tag, '32 move tip uses the touch wording', hintTouch, HINTS.move);
      const l = document.querySelector('.touch.left').getBoundingClientRect(), rgt = document.querySelector('.touch.right').getBoundingClientRect();
      rec('Touch ' + tag, '32 pads sit inside the screen at the bottom corners', l.left >= 0 && rgt.right <= vw + 1 && l.bottom <= vh + 1 && rgt.bottom <= vh + 1 && l.bottom > vh * 0.6, `left pads ${Math.round(l.left)}-${Math.round(l.right)}, jump ${Math.round(rgt.left)}-${Math.round(rgt.right)}, bottom ${Math.round(l.bottom)} of ${vh}`);
      const pad = document.querySelector('.pad.jump').getBoundingClientRect();
      rec('Touch ' + tag, '32 buttons are big enough for a thumb (>= 44 px)', pad.width >= 44 && pad.height >= 44, `jump pad ${Math.round(pad.width)}x${Math.round(pad.height)}`);
    }
    // pads drive the grasshopper (works whether or not the pads are visible)
    begin(0); const p = player; p.x = p.startX; p.y = p.startY; p.vx = 0; p.vy = 0; step(5);
    const pd = (sel, type) => document.querySelector(sel).dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 1, pointerType: 'touch', isPrimary: true }));
    pd('.pad[data-key="right"]', 'pointerdown'); const kr = keys.right; step(30); const moved = p.vx > 100; pd('.pad[data-key="right"]', 'pointerup'); const kr2 = keys.right; step(30); const stopped = Math.abs(p.vx) < 5;
    rec('Touch ' + tag, '32 right pad runs right, releasing stops', kr && moved && !kr2 && stopped, `key on=${kr}, peak>100=${moved}, vx after release=${Math.round(p.vx)}`);
    const y0 = p.y; pd('.pad.jump', 'pointerdown'); step(10); const air = !p.onGround && p.y < y0 - 20; const rose = y0 - p.y; pd('.pad.jump', 'pointerup'); step(60);
    rec('Touch ' + tag, '32 jump pad hops', air, `rose ${Math.round(rose)} px in 10 frames`);
    pd('.pad[data-key="left"]', 'pointerdown'); step(30); const left = p.vx < -100 && p.facing === -1; pd('.pad[data-key="left"]', 'pointercancel'); const rel = !keys.left;
    rec('Touch ' + tag, '32 left pad runs left, pointercancel releases', left && rel, `vx=${Math.round(p.vx)}, facing=${p.facing}, released=${rel}`);
    // left-handed + big buttons move/resize the real pads
    const was = { l: settings.lefty, b: settings.bigButtons };
    settings.lefty = true; settings.bigButtons = false; applySettings();
    const L1 = document.querySelector('.touch.left').getBoundingClientRect(), R1 = document.querySelector('.touch.right').getBoundingClientRect();
    settings.lefty = false; applySettings(); const L0 = document.querySelector('.touch.left').getBoundingClientRect(), R0 = document.querySelector('.touch.right').getBoundingClientRect();
    settings.bigButtons = true; applySettings(); const big = document.querySelector('.pad.jump').getBoundingClientRect(); settings.bigButtons = false; applySettings(); const small = document.querySelector('.pad.jump').getBoundingClientRect();
    settings.lefty = was.l; settings.bigButtons = was.b; applySettings();
    if (coarse) {
      rec('Touch ' + tag, '32 left-handed swaps the pads to the other corners', L0.left < R0.left && L1.left > R1.left, `normal: move ${Math.round(L0.left)} jump ${Math.round(R0.left)} - lefty: move ${Math.round(L1.left)} jump ${Math.round(R1.left)}`);
      rec('Touch ' + tag, '32 large buttons really are larger', big.width >= small.width * 1.1, `jump pad ${Math.round(small.width)} -> ${Math.round(big.width)} px`);
    }
    canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); // tapping the canvas must never throw
    keys.left = keys.right = keys.jump = false;
  }

  // ================= 34 PWA + install =================
  {
    const manifest = document.querySelector('link[rel="manifest"]'); rec('PWA', '34 manifest is linked', !!manifest, manifest && manifest.href);
    const theme = document.querySelector('meta[name="theme-color"]'), vp = document.querySelector('meta[name="viewport"]');
    rec('PWA', '34 viewport locks scale & covers the notch; theme colour set', !!vp && /user-scalable=no/.test(vp.content) && /viewport-fit=cover/.test(vp.content) && !!theme, `viewport="${vp && vp.content}" theme=${theme && theme.content}`);
    const btn = document.getElementById('install-btn');
    const hidden0 = getComputedStyle(btn).display === 'none';
    let prompted = 0; const ev = new Event('beforeinstallprompt'); ev.prompt = () => { prompted++; return Promise.resolve(); }; ev.userChoice = Promise.resolve({ outcome: 'accepted' });
    window.dispatchEvent(ev); const shown = getComputedStyle(btn).display !== 'none';
    btn.click();
    rec('PWA', '34 install button hidden until the browser offers install, then shows and prompts', hidden0 && shown && prompted === 1, `hidden at start=${hidden0}, shown after beforeinstallprompt=${shown}, prompt() calls=${prompted}`);
    window.dispatchEvent(new Event('appinstalled')); rec('PWA', '34 install button hides once installed', getComputedStyle(btn).display === 'none', 'appinstalled -> display ' + getComputedStyle(btn).display);
    rec('PWA', '34 apple touch icon linked', !!document.querySelector('link[rel="apple-touch-icon"]'), 'apple-touch-icon=' + (document.querySelector('link[rel="apple-touch-icon"]') || {}).href);
  }
  return results;
};

window.phase5async = async function () {
  const out = [];
  const rec = (area, feature, pass, detail) => out.push({ level: area, feature, pass, detail });
  // ================= 33 performance =================
  // Frames are paced like real play (one per timer tick): a tight synchronous draw loop saturates the GPU queue
  // and shows 200 ms stalls that never happen at 60 fps.
  {
    const step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) update(dt); };
    const begin = (li) => { journey = null; ending = null; startLevel(li); cancelAnimationFrame(frameReq); Music.stop(); step(130); };
    const perf = [];
    for (let li = 0; li < LEVELS.length; li++) {
      const L = LEVELS[li]; begin(li); keys.right = true; step(60); keys.right = false;        // get some particles / enemies / water on screen
      const t = []; for (let i = 0; i < 180; i++) { await new Promise(r => setTimeout(r, 8)); const t0 = performance.now(); update(1 / 60); draw(); t.push(performance.now() - t0); }
      t.sort((a, b) => a - b); const med = t[Math.floor(t.length / 2)], p95 = t[Math.floor(t.length * 0.95)], max = t[t.length - 1];
      perf.push({ name: L.name, med }); rec(L.name, '33 frame cost (update + draw) on this machine', med < 8 && p95 < 16, `median ${med.toFixed(2)} ms, p95 ${p95.toFixed(2)} ms, worst ${max.toFixed(1)} ms (budget 16.7 ms at 60 fps)`);
    }
    const worst = perf.reduce((a, b) => a.med > b.med ? a : b);
    rec('All levels', '33 every level leaves headroom for 60 fps', worst.med < 8, `slowest is ${worst.name} at ${worst.med.toFixed(2)} ms median`);
    running = false;
  }
  const regs = await navigator.serviceWorker.getRegistrations(); const reg = regs[0];
  rec('PWA', '34 service worker registered and active', !!reg && !!reg.active && reg.active.state === 'activated', reg ? `scope ${reg.scope}, state ${reg.active && reg.active.state}` : 'no registration');
  const names = await caches.keys(); const ver = (await (await fetch('sw.js?x=' + Date.now())).text()).match(/CACHE_VERSION = '([^']+)'/)[1];
  rec('PWA', '34 exactly one cache, named after the current version (old ones removed)', names.length === 1 && names[0] === ver, `caches=${JSON.stringify(names)}, sw.js says ${ver}`);
  const files = ['./', 'index.html', 'style.css', 'game.js', 'editor.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];
  const c = await caches.open(ver); const missing = []; for (const f of files) { const r = await c.match(new URL(f, location.href).href); if (!r || !r.ok) missing.push(f); }
  rec('PWA', '34 every game file is in the offline cache', missing.length === 0, missing.length ? 'missing: ' + missing.join(', ') : files.length + ' files cached');
  const font = (await c.keys()).some(r => /fonts\.g/.test(r.url));
  rec('PWA', '34 web font cached at runtime for offline play', font, font ? 'Google Fonts entries present in cache' : 'font not cached (offline falls back to system font)');
  const m = await (await fetch('manifest.json')).json();
  rec('PWA', '34 manifest: landscape, fullscreen, icons 192 & 512 maskable, start_url in scope', m.orientation === 'landscape' && m.display === 'fullscreen' && m.icons.length === 2 && m.icons.every(i => /maskable/.test(i.purpose)) && m.start_url.startsWith(m.scope), JSON.stringify({ name: m.name, display: m.display, orientation: m.orientation, icons: m.icons.map(i => i.sizes) }));
  const ok = []; for (const i of m.icons) { const r = await fetch(i.src); ok.push(r.ok && (r.headers.get('content-type') || '').includes('png')); }
  rec('PWA', '34 icon files load as PNG', ok.every(Boolean), ok.join(','));
  return out;
};

// ---- custom-level mode (run after reloading with the flag set) ----
window.phase5custom = function (before) {
  const out = []; const rec = (area, feature, pass, detail) => out.push({ level: area, feature, pass, detail });
  const step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) update(dt); };
  rec('Custom level', '35 game boots into the editor level only', customMode && LEVELS.length === 1 && LEVELS[0].custom === true && LEVELS[0].name === 'Custom Level', `customMode=${customMode}, levels=${LEVELS.map(l => l.name)}`);
  rec('Custom level', '35 title card says so and shows the exit link; world map hidden', ovSub.textContent.includes('Custom') && document.getElementById('exit-custom').style.display === 'inline' && mapCanvas.style.display === 'none', `sub="${ovSub.textContent}", exit=${document.getElementById('exit-custom').style.display}, map=${mapCanvas.style.display}`);
  startLevel(0); cancelAnimationFrame(frameReq); Music.stop(); step(130);
  keys.right = true; let done = false; for (let i = 0; i < 60 * 30 && !done; i++) { keys.jump = (i % 40) < 16; update(1 / 60); if (!running) done = true; } keys.right = keys.jump = false;
  rec('Custom level', '35 the level plays and can be finished', done && ovTitle.textContent === 'Level Clear!' && ovBtn.textContent === 'Play Again', `title="${ovTitle.textContent}", button="${ovBtn.textContent}", bugs ${collected}/${totalOrbs}`);
  const after = { unlocked: localStorage.getItem('hop-unlocked'), best: localStorage.getItem('hop-best'), stars: localStorage.getItem('hop-stars'), orbs: localStorage.getItem('hop-orbs-total') };
  rec('Custom level', '35 finishing a custom level does not touch saved progress', JSON.stringify(after) === JSON.stringify(before), `before ${JSON.stringify(before)} after ${JSON.stringify(after)}`);
  return out;
};

// ---- editor round-trip (run inside editor.html) ----
window.phase5editor = function () {
  const out = []; const rec = (area, feature, pass, detail) => out.push({ level: area, feature, pass, detail });
  const rowsIn = ['..........', '.o.o.o....', '.P......G.', '##########', '##########'];
  const dlg = document.getElementById('dlg'), txt = document.getElementById('dlg-text');
  document.getElementById('import').click(); txt.value = rowsIn.join('\n'); document.getElementById('dlg-load').click();
  const g = grid.map(r => r.join(''));
  rec('Editor', '36 import text loads the grid', g.join('|') === rowsIn.join('|') && cols === 10 && rows === 5, `${cols}x${rows}: ${g.join(' / ')}`);
  document.getElementById('export').click(); const exported = txt.value; dlg.close();
  const backIn = exported.split('\n').map(l => l.trim().replace(/^"|",?$/g, '')).filter(Boolean);
  rec('Editor', '36 export gives game.js-ready rows that import back unchanged', /^ *"\.{10}",$/m.test(exported) && backIn.join('|') === rowsIn.join('|'), exported.replace(/\n/g, ' / '));
  const saved = JSON.parse(localStorage.getItem('hop-editor') || '[]');
  rec('Editor', '36 editor autosaves to localStorage', saved.join('|') === rowsIn.join('|'), saved.join(' / '));
  // paint with the mouse: pick water from the palette and click a grid cell
  const tiles = [...document.querySelectorAll('.tile')]; const wTile = tiles.find(t => t.dataset.ch === 'w' || t.textContent.trim().startsWith('w') || (t.title || '').toLowerCase().includes('water'));
  let painted = 'n/a'; if (wTile) { wTile.click(); const gc = document.getElementById('grid'); const r = gc.getBoundingClientRect(); const cw = r.width / cols, ch = r.height / rows; gc.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.left + cw * 4.5, clientY: r.top + ch * 3.5, button: 0, buttons: 1 })); gc.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); painted = grid[3][4]; }
  rec('Editor', '36 painting a tile with the pointer', painted === 'w', `palette water tile found=${!!wTile}, cell(4,3)=${painted}`);
  const realOpen = window.open; let opened = null; window.open = (u) => { opened = u; return {}; };
  document.getElementById('test').click(); window.open = realOpen;
  const lvl = JSON.parse(localStorage.getItem('hop-custom-level') || '[]'), flag = localStorage.getItem('hop-play-custom');
  rec('Editor', '36 "Test in game" hands the map to the game and opens it', opened === 'index.html' && flag === '1' && lvl.length === rows && lvl[2].includes('P') && lvl[2].includes('G'), `opened=${opened}, flag=${flag}, rows=${lvl.length}`);
  return out;
};
