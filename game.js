// =====================================================================
//  HOP — a grasshopper platformer
//  Hop the grasshopper bounds through a meadow collecting bugs, dodging
//  (or squashing) frogs, avoiding puddles, and reaching the flower at the end.
//  All art is drawn in code; all sounds are synthesized. Nothing borrowed.
// =====================================================================

// ---------- 1. Settings ----------
const TILE = 32;
const W = 640, H = 360;
const GRAVITY      = 1700;
const RUN_SPEED    = 240;
const JUMP_SPEED   = 660;
const STOMP_BOUNCE = 400;
const COYOTE_TIME  = 0.10;     // still allowed to jump shortly after leaving a ledge
const JUMP_BUFFER  = 0.12;     // jump pressed slightly before landing still counts

// ---------- 2. Levels ----------
//  #  ground / leaf    o  bug (collect)    e  Frog (hops at you) f  Dragonfly (flies)
//  ^  brambles         P  player start     G  the flower (goal)  .  air     w  water (you sink!)
//  =  one-way ledge (jump up through it)   %  crumbling block   ~  bounce pad
//  M  moving platform (side to side)       V  moving platform (up and down)
//  C  checkpoint lantern (respawn here once lit)
//  S  Toad (poisonous - cannot be stomped, jump over it)
//  D  double-jump seed (lasts the level)  H  dew shield (absorbs one hit)
//  B  breakable block (jump into it from below - hides a bug)   K  the Bullfrog King (boss)
const LEVELS = [
  {
    name: 'Morning Meadow', track: 0,
    theme: { sky: ['#7ec8ff', '#e9f7ff'], sun: '#fff5b8', clouds: true, far: '#a8dba8', mid: '#7cc47a', ground: '#6b4a2e', groundTop: '#5cb85c', groundDots: '#553a24', orb: '#ff5252', hazard: '#6b4a2e', portal: '#ff7bb0', bug: 'ladybug', water: '#4fa8e8', flowers: ['#ff7bb0', '#ffd93d', '#c58cff', '#ff8a5c'], leaf: '#4caf50', leafDark: '#357a38' },
    map: [
      "...............................................................................................................",
      "...............................................................................................................",
      "...............................................................................................................",
      "...............................................................................................................",
      "....................................o.o......................o.o................o.o..f.........................",
      "....................................####f...........o.o.........................####..............o.o..........",
      "....................o.o.........o.o.................####....................o.o...........BB......####.........",
      "........o.o.o.......####.H..............====o..................................................................",
      ".............................e..###............e............e.~.......S....####.........o.o.o.o.o...e..........",
      "..P.......####.e............############wwww#######.......C.#####ww##################www....e.C..######.....G..",
      "###################www##################wwww#######...###########ww##################www#######################",
      "###################www#############################...#########################################################",
      "###################################################...#########################################################",
    ],
  },
  {
    name: 'Dewy Garden', track: 0,
    theme: { sky: ['#9fd8ff', '#f3fbff'], sun: '#fffbd6', clouds: true, far: '#b9e3b0', mid: '#86c67e', ground: '#5f4630', groundTop: '#66c46a', groundDots: '#4a3524', orb: '#ff5252', hazard: '#5f4630', portal: '#ffd93d', bug: 'ladybug', water: '#5bb5f0', flowers: ['#ffd93d', '#ffffff', '#ff9ecb', '#9ad0ff'], leaf: '#58b862', leafDark: '#3b8a44' },
    map: [
      "..........................................................................................................................",
      "..........................................................................................................................",
      "..........................................................................................................................",
      "..............................................o.o.o.o.....................................................................",
      "...........o.o............................o.of........................o.o...........................f.....................",
      "................o.o.BB.....o.o............####..M.........o.o.........####.f..................o.o.......o.o...............",
      "................####....e..====.........................H.####..V...........o.o........BB.....####......####..............",
      "......D................####...S..o.o................................e.......====..........................................",
      "..........~....e....############......e.C...................#####www#######...........o.o.S..........e......S.............",
      "..P.....####www#################wwwww######..........e...#%%%%###www###########....Ce....#####...########ww######G........",
      "############www#################wwwww##########....############################wwww###########...########ww###############",
      "###############################################....############################wwww###########...#########################",
      "###############################################....###########################################...#########################",
    ],
  },
  {
    name: 'Pond Shore', track: 1,
    theme: { sky: ['#8fd3ff', '#dff5ff'], sun: '#fff3a8', clouds: true, far: '#9fd49c', mid: '#6fb86b', ground: '#5a4a3a', groundTop: '#7cc36a', groundDots: '#43362a', orb: '#ff5252', hazard: '#5a4a3a', portal: '#ffffff', bug: 'ladybug', water: '#3f9fe0', flowers: ['#ffffff', '#ff9ecb', '#ffd93d'], leaf: '#4fae5c', leafDark: '#347a3f' },
    map: [
      "...............................................................................................................",
      "...............................................................................................................",
      "...............................................................................................................",
      "..................................................................o.o..........................................",
      "......................o.o.....................o.o...f.............####..............o.o........................",
      "....................f.####.....o.o.o.o........####..................................####f......................",
      "..........D....o.o.o..............M....................o.o.o............o.o.o.o............V........o.o........",
      ".........o.o...=====.......e..H.S......................=====...e....S...M...........................====.......",
      ".............e.............######.......Ce..................o.o######.........C..................e.............",
      "..P.........###wwwww####www######wwwwww###wwww..........####www######wwwwww####wwww............#####www.....G..",
      "########wwww###wwwww####www######wwwwww###wwww#####wwwww####www######wwwwww####wwww#######wwwww#####www########",
      "########wwww#######################################wwwww##################################wwwww################",
      "###############################################################################################################",
    ],
  },
  {
    name: 'Lily Pond', track: 1,
    theme: { sky: ['#1f3d2b', '#3f7a52'], stars: true, far: '#2b5a3a', mid: '#356b45', ground: '#3d3122', groundTop: '#4a9a55', groundDots: '#2c2318', orb: '#ffe066', hazard: '#3d3122', portal: '#e0b0ff', bug: 'firefly', water: '#2d6f9e', flowers: ['#e0b0ff', '#ffe066', '#ffffff'], leaf: '#3f8f4a', leafDark: '#2b6633', rays: true },
    map: [
      "##################################################################################################################",
      "..........................................................o.o.o.o.o.o.o.o.o.o.o.o.o.o.o.o.o.o.o.o.o...............",
      "..................................................................................................................",
      "........................................................########################....BB###############.............",
      "..........................................................o.o.o...................................................",
      "........................o.o.................o.o...........=====.............o.o...............o.o.................",
      "........................####....M...........====....o.o.o...................####..............====........o.o.o...",
      "..................o.o.o.............o.o.o...........#####.............o.o.o.......V.....o.o.o.............#####...",
      "..................#####.......f.....#####..............e......H.......#####.S...........#####.....f...............",
      "......D.............e..S..............e.C..............####....######wwwww########.......C..e.....................",
      "..P.................####www######....########wwww##########....######wwwww############www#########..........e...SG",
      "##########wwww##########www######....########wwww##########....#######################www#########################",
      "##########wwww###################....######################....###################################################",
      "#################################....######################....###################################################",
    ],
  },
  {
    name: 'Sunset Field', track: 2,
    theme: { sky: ['#ff9a6b', '#ffe0a8'], stars: true, sun: '#ffd36e', far: '#c98a5a', mid: '#8a6a3a', ground: '#5c3d2b', groundTop: '#b8a04a', groundDots: '#432c1f', orb: '#ffe066', hazard: '#4a3a2a', portal: '#ff5e8a', bug: 'firefly', water: '#6f8fc0', flowers: ['#ff5e8a', '#ffd36e', '#ff8a5c'], leaf: '#8fb04a', leafDark: '#5f7a2e' },
    map: [
      "...........................................................................................................................",
      "...........................................................................................................................",
      "...........................................................................................................................",
      ".............................................o.o.o.o.......................................................................",
      "......................f.............o.o...............................o.o.......f..................o.o....o.o..............",
      "..................o.o........o.o....####.......M..f...o.o.............####...........o.o............f.....####.............",
      "..................####..BB...====.....................####....o.o..........o.o.......####...V..............................",
      "......o.o....................e...S........................H...====................C........................................",
      "...........^^...e.....###....#######...C....e.^^..................S.......e...^^.###....e.......^^......~.....S............",
      "..P......####www#########....####%%%%###wwww######..........e.....####www################wwwww######....#######.....G......",
      "#############www#########....###########wwww###########.....##########www################wwwww######....###################",
      "#########################....##########################.....########################################....###################",
      "#########################....##########################.....########################################....###################",
    ],
  },
  {
    name: 'Tall Grass', track: 2,
    theme: { sky: ['#6fc3ff', '#f0fbff'], sun: '#fff7c2', clouds: true, far: '#a6dea1', mid: '#79c273', ground: '#5a4632', groundTop: '#5cb85c', groundDots: '#43341f', orb: '#ff5252', hazard: '#5a4632', portal: '#ffd93d', bug: 'ladybug', water: '#4fa8e8', flowers: ['#ffd93d', '#ff7bb0', '#ffffff'], leaf: '#4caf50', leafDark: '#357a38' },
    map: [
      "..........................................................................................",
      "............................................................o.o.o.o.......................",
      "....................................................................o.o.o.o...........G...",
      "............................................................M..........S.....V....########",
      "..............................................o.o.o.o.=====.........#######.......########",
      "....................................................................#######...............",
      "..............................................#######.....................................",
      "....................................o.o.o.o...#######.....................................",
      "......................................e..C................................................",
      "..............................f.....#######........................V......................",
      "..........................o.o.o.o...#######...............................................",
      "..........................................................o.o.o.o.o.......................",
      "....o.o.o.................#######.............................D...........................",
      "..P.......e.....S.........#######.........................#########.......................",
      "#####################.....................................#########.......................",
      "#####################.....................................................................",
    ],
  },
  {
    name: 'The Bullfrog King', track: 3, boss: true,
    theme: { sky: ['#ff8c6b', '#ffdca8'], stars: true, sun: '#ffd36e', far: '#b87a5a', mid: '#7a5a3a', ground: '#4e3a2a', groundTop: '#8fb04a', groundDots: '#3a2a1e', orb: '#ffe066', hazard: '#4a3a2a', portal: '#ff5e8a', bug: 'firefly', water: '#5a7fb0', flowers: ['#ff5e8a', '#ffd36e'], leaf: '#8fb04a', leafDark: '#5f7a2e' },
    map: [
      "#............................#",
      "#............................#",
      "#............................#",
      "#............................#",
      "#.....o.o............o.o.....#",
      "#............................#",
      "#....=====..........=====....#",
      "#....................K.......#",
      "#..P.........................#",
      "#############wwww#############",
      "#############wwww#############",
    ],
  },
];
// A level made in editor.html? (opened with ?custom=1) - play it on its own, without touching saved progress
const customMode = localStorage.getItem("hop-play-custom") === "1" && !!localStorage.getItem("hop-custom-level");
if (customMode) {
  LEVELS.length = 0;
  LEVELS.push({ name: "Custom Level", track: 0, custom: true,
    theme: { sky: ['#7ec8ff', '#e9f7ff'], sun: '#fff5b8', clouds: true, far: '#a8dba8', mid: '#7cc47a', ground: '#6b4a2e', groundTop: '#5cb85c', groundDots: '#553a24', orb: '#ff5252', hazard: '#6b4a2e', portal: '#ff7bb0', bug: 'ladybug', water: '#4fa8e8', flowers: ['#ff7bb0', '#ffd93d', '#c58cff', '#ff8a5c'], leaf: '#4caf50', leafDark: '#357a38' },
    map: JSON.parse(localStorage.getItem("hop-custom-level")) });
}
// put the levels in play order (world by world)
const ORDER = ['Morning Meadow', 'Dewy Garden', 'Pond Shore', 'Lily Pond', 'Sunset Field', 'Tall Grass', 'The Bullfrog King'];
if (!customMode) LEVELS.sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name));
// make every row the same length (pad with air)
for (const L of LEVELS) {
  const len = Math.max(...L.map.map(r => r.length));
  L.map = L.map.map(r => r.padEnd(len, '.'));
}

// ---------- 3. Tiny synthesized sound effects ----------
const Sfx = {
  ctx: null, bus: null, noise: null, comboT: 0, combo: 0,
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.bus = this.ctx.createGain(); this.bus.gain.value = 1; this.bus.connect(this.ctx.destination);   // everything goes through here
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
    const d = buf.getChannelData(0); for (let j = 0; j < d.length; j++) d[j] = Math.random() * 2 - 1;
    this.noise = buf;
  },
  ready() { return this.ctx && !Music.muted; },
  vary(v, amt = 0.08) { return v * (1 + (Math.random() * 2 - 1) * amt); },     // small random pitch variation so repeats do not sound robotic
  tone(freqFrom, freqTo, dur, type = 'square', vol = 0.15, delay = 0) {
    if (!this.ready()) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqFrom, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqTo), t + dur);
    gain.gain.setValueAtTime(0.0001, t); gain.gain.linearRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(this.bus);
    osc.start(t); osc.stop(t + dur + 0.02);
  },
  hiss(dur, vol = 0.1, hp = 2000, lp = 8000, delay = 0) {                  // filtered noise burst (sprays, thuds, rustles)
    if (!this.ready()) return;
    const t = this.ctx.currentTime + delay, src = this.ctx.createBufferSource(), g = this.ctx.createGain();
    const h = this.ctx.createBiquadFilter(), l = this.ctx.createBiquadFilter();
    src.buffer = this.noise; h.type = 'highpass'; h.frequency.value = hp; l.type = 'lowpass'; l.frequency.value = lp;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(h).connect(l).connect(g).connect(this.bus); src.start(t); src.stop(t + dur + 0.02);
  },
  jump()   { const f = this.vary(300, 0.12); this.tone(f, f * 2.3, 0.14, 'square', 0.07); this.hiss(0.06, 0.03, 3000, 9000); },
  pickup() {                                                              // each bug caught quickly after another plays a higher note
    this.combo = (performance.now() - this.comboT < 1500) ? Math.min(this.combo + 1, 7) : 0; this.comboT = performance.now();
    const f = 660 * Math.pow(2, [0, 2, 4, 7, 9, 12, 14, 16][this.combo] / 12);
    this.tone(f, f * 1.5, 0.12, 'sine', 0.12); this.tone(f * 2, f * 2.5, 0.08, 'triangle', 0.04, 0.03);
  },
  stomp()  { this.tone(this.vary(220), 50, 0.2, 'triangle', 0.2); this.hiss(0.12, 0.12, 400, 2500); Music.duck(0.5, 0.4); },
  hurt()   { this.tone(this.vary(240), 40, 0.45, 'sawtooth', 0.14); this.hiss(0.2, 0.08, 200, 1500); Music.duck(0.3, 0.8); },
  win()    { [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, f, 0.3, 'triangle', 0.14, i * 0.11)); [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f / 2, f / 2, 0.35, 'sine', 0.08, i * 0.11)); Music.duck(0.4, 1.2); },
  splash() { this.tone(160, 40, 0.35, 'sine', 0.25); this.hiss(0.35, 0.2, 1500, 7000, 0.02); this.hiss(0.5, 0.08, 300, 1200, 0.1); Music.duck(0.5, 0.6); },
  croak()  { const f = this.vary(110, 0.15); this.tone(f, f * 0.8, 0.12, 'sawtooth', 0.05); this.tone(f * 1.1, f * 0.9, 0.16, 'sawtooth', 0.05, 0.13); },
  bounce() { const f = this.vary(200); this.tone(f, f * 4.5, 0.22, 'sine', 0.15); this.tone(f * 2, f * 6, 0.15, 'triangle', 0.05, 0.02); },
  crumble(){ this.tone(120, 50, 0.3, 'sawtooth', 0.07); this.hiss(0.35, 0.08, 150, 900); },
  power()  { [660, 880, 1320].forEach((f, i) => this.tone(f, f * 1.2, 0.14, 'sine', 0.12, i * 0.07)); this.hiss(0.3, 0.03, 4000, 12000); },
  shieldPop() { this.tone(900, 200, 0.25, 'triangle', 0.15); this.hiss(0.15, 0.08, 2000, 8000); },
  checkpoint() { this.tone(660, 660, 0.1, 'triangle', 0.12); this.tone(990, 990, 0.2, 'triangle', 0.12, 0.1); this.tone(1320, 1320, 0.25, 'sine', 0.06, 0.2); },
  chirp(kind) {                                                           // ambient one-shots
    if (!this.ready()) return;
    if (kind === 'bird') { const f = 1800 + Math.random() * 1600, n = 2 + Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) this.tone(f * (1 + Math.random() * 0.3), f * (0.8 + Math.random() * 0.5), 0.09, 'sine', 0.035, i * 0.13); }
    if (kind === 'cricket') { const f = 4200 + Math.random() * 600; for (let i = 0; i < 3; i++) this.tone(f, f, 0.04, 'square', 0.012, i * 0.07); }
    if (kind === 'drip') { const f = 700 + Math.random() * 900; this.tone(f, f * 0.6, 0.18, 'sine', 0.05); }
    if (kind === 'frog') { const f = 90 + Math.random() * 40; this.tone(f, f * 0.85, 0.2, 'sawtooth', 0.02); }
    if (kind === 'rustle') { this.hiss(0.6, 0.02, 500, 3000); }
  },
};

// ---------- ambient beds: a wind/water loop plus random one-shots per world ----------
const Ambient = {
  wind: null, gain: null, timer: null, kind: null,
  start(kind) {
    this.stop(); if (!Sfx.ctx) return;
    this.kind = kind;
    const ctxA = Sfx.ctx;
    this.gain = ctxA.createGain(); this.gain.gain.value = Music.muted ? 0 : 1; this.gain.connect(Sfx.bus);
    // (no continuous wind bed - it was distracting; only occasional one-shots below)
    this.wind = null;
    const plan = { meadow: [['bird', 2, 6], ['rustle', 5, 12]], pond: [['drip', 1, 3], ['frog', 4, 9]], sunset: [['cricket', 0.8, 1.8], ['rustle', 6, 12]], boss: [['cricket', 1, 2.5], ['frog', 3, 6]] }[kind] || [];
    const schedule = (name, min, max) => { const t = setTimeout(() => { if (this.kind !== kind) return; Sfx.chirp(name); schedule(name, min, max); }, (min + Math.random() * (max - min)) * 1000); this.timers.push(t); };
    this.timers = []; for (const [name, min, max] of plan) schedule(name, min, max);
  },
  stop() { if (this.wind) { try { this.wind.src.stop(); this.wind.lfo.stop(); } catch (e) {} this.wind = null; } (this.timers || []).forEach(clearTimeout); this.timers = []; this.kind = null; },
  setMuted(m) { if (this.gain) this.gain.gain.value = m ? 0 : 1; },
};


// ---------- 3b. Procedural music (a small step sequencer) ----------
// Notes are MIDI numbers (60 = middle C). null = rest. 32 steps = 2 bars of 16ths.
const TRACKS = [
  { // Dusk Meadow - warm and bouncy
    bpm: 120, wave: "triangle", bassWave: "square", filter: 2200,
    bass:   [45,45,45,45, 41,41,41,41, 48,48,48,48, 43,43,43,43, 45,45,45,45, 41,41,41,41, 48,48,48,48, 43,43,43,43],
    melody: [69,null,72,null, 74,null,76,null, 74,null,72,null, 69,null,null,null, 72,null,74,null, 76,null,79,null, 76,null,74,null, 72,null,null,null],
  },
  { // Crystal Caves - slow and mysterious
    bpm: 96, wave: "sine", bassWave: "triangle", filter: 1200,
    bass:   [38,38,38,38, 41,41,41,41, 36,36,36,36, 43,43,43,43, 38,38,38,38, 41,41,41,41, 36,36,36,36, 45,45,45,45],
    melody: [62,null,null,65, null,null,69,null, null,null,67,null, null,null,65,null, 62,null,null,65, null,null,72,null, null,null,70,null, 67,null,65,null],
  },
  { // Dawn Islands - bright and quick
    bpm: 132, wave: "square", bassWave: "triangle", filter: 3000,
    bass:   [36,36,36,36, 40,40,40,40, 45,45,45,45, 43,43,43,43, 36,36,36,36, 40,40,40,40, 45,45,45,45, 43,43,43,43],
    melody: [72,null,76,null, 79,null,76,null, 74,null,77,null, 81,null,77,null, 76,null,79,null, 84,null,79,null, 77,null,76,null, 74,null,72,null],
  },
  { // Boss - fast and tense
    bpm: 150, wave: "sawtooth", bassWave: "square", filter: 1800,
    bass:   [40,40,40,40, 40,40,40,40, 43,43,43,43, 46,46,46,46, 40,40,40,40, 40,40,40,40, 38,38,38,38, 39,39,39,39],
    melody: [64,null,64,67, null,64,null,70, 67,null,64,null, 62,null,64,null, 64,null,64,67, null,64,null,70, 71,null,70,null, 67,null,64,null],
  },
];
const midiToHz = n => 440 * Math.pow(2, (n - 69) / 12);

const Music = {
  timer: null, step: 0, nextTime: 0, track: null, noise: null, gain: null,
  muted: localStorage.getItem("hop-muted") === "1",
  start(i) {
    this.stop();
    if (!Sfx.ctx) return;
    this.track = TRACKS[(LEVELS[i].track ?? i) % TRACKS.length];
    this.step = 0; this.nextTime = Sfx.ctx.currentTime + 0.05;
    this.noise = Sfx.noise;
    if (!this.gain) { this.gain = Sfx.ctx.createGain(); this.gain.connect(Sfx.bus); }
    this.gain.gain.value = 1;
    this.timer = setInterval(() => this.schedule(), 25);
    Ambient.start(['meadow', 'pond', 'sunset', 'boss'][(LEVELS[i].track ?? i) % 4]);
  },
  stop() { clearInterval(this.timer); this.timer = null; Ambient.stop(); },
  duck(level, seconds) {                                                 // dip the music for a big moment, then swell back
    if (!this.gain) return; const t = Sfx.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(t); this.gain.gain.setValueAtTime(level, t); this.gain.gain.linearRampToValueAtTime(1, t + seconds);
  },
  toggle() {
    this.muted = !this.muted; localStorage.setItem("hop-muted", this.muted ? "1" : "0"); Ambient.setMuted(this.muted);
    document.getElementById("mute-btn").textContent = this.muted ? "🔇" : "🔊";
  },
  // Schedule every note that falls within the next 100 ms (standard Web Audio pattern)
  schedule() {
    const ctxA = Sfx.ctx, t = this.track, stepLen = 60 / t.bpm / 4;
    while (this.nextTime < ctxA.currentTime + 0.1) {
      if (!this.muted) this.playStep(this.step % 32, this.nextTime, stepLen);
      this.nextTime += stepLen; this.step++;
    }
  },
  playStep(i, when, stepLen) {
    const t = this.track, ctxA = Sfx.ctx;
    const bass = t.bass[i], mel = t.melody[i];
    if (i % 4 === 0 && bass !== null) this.note(midiToHz(bass), when, stepLen * 3.5, t.bassWave, 0.10, 600);
    if (mel !== null) this.note(midiToHz(mel), when, stepLen * 1.8, t.wave, 0.07, t.filter);
    if (i % 8 === 0) this.kick(when);
    if (i % 4 === 2) this.hat(when);
  },
  note(freq, when, dur, wave, vol, cutoff) {
    const ctxA = Sfx.ctx, osc = ctxA.createOscillator(), g = ctxA.createGain(), f = ctxA.createBiquadFilter();
    osc.type = wave; osc.frequency.value = freq;
    f.type = "lowpass"; f.frequency.value = cutoff;
    g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(vol, when + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(f).connect(g).connect(this.gain); osc.start(when); osc.stop(when + dur + 0.05);
  },
  kick(when) {
    const ctxA = Sfx.ctx, osc = ctxA.createOscillator(), g = ctxA.createGain();
    osc.frequency.setValueAtTime(150, when); osc.frequency.exponentialRampToValueAtTime(40, when + 0.12);
    g.gain.setValueAtTime(0.25, when); g.gain.exponentialRampToValueAtTime(0.001, when + 0.15);
    osc.connect(g).connect(this.gain); osc.start(when); osc.stop(when + 0.16);
  },
  hat(when) {
    const ctxA = Sfx.ctx, src = ctxA.createBufferSource(), g = ctxA.createGain(), f = ctxA.createBiquadFilter();
    src.buffer = this.noise; f.type = "highpass"; f.frequency.value = 6000;
    g.gain.setValueAtTime(0.06, when); g.gain.exponentialRampToValueAtTime(0.001, when + 0.05);
    src.connect(f).connect(g).connect(this.gain); src.start(when); src.stop(when + 0.06);
  },
};

// ---------- 4. Game state ----------
let levelIndex = 0, map, ROWS, COLS, LEVEL_W, LEVEL_H, theme, camY = 0, boss = null;
let player, enemies, orbs, spikes, portal, particles;
let pads, movers, checkpoints, crumbles;      // new tile types (phase 2)
let ripples = [], bugFlights = [], leafBounce = { x: -9999, t: 0 }, hudPop = 0;   // animation extras
let butterflies = [], petals = [], nextButterfly = 4, nextPetal = 0;                 // foreground life
// One-time tips shown in the world the first time something matters. Remembered in localStorage.
const hintsSeen = JSON.parse(localStorage.getItem('hop-hints') || '{}');
let hint = null, slowmo = 0;
const isTouch = matchMedia('(pointer: coarse)').matches;
const HINTS = {
  move:   isTouch ? 'Hold ▶ to run · tap ▲ to hop' : '← → to run · Space to hop',
  frog:   'Hop over it — or bounce on its head!',
  water:  'Don\'t land in the water!',
  toad:   'Toads are poisonous — jump over them',
  pad:    'A springy mushroom sends you high',
  crumble:'Quick — it crumbles!',
  checkpoint: 'Checkpoint! You\'ll restart here',
  double: 'Press hop again in the air!',
  shield: 'A dew shield takes one hit for you',
  ledge:  'You can hop up through leaves',
  seed:   'Hit seed pods from below',
};
function showHint(key, x, y, follow) {
  if (hintsSeen[key] || (hint && hint.key === key)) return;
  hint = { key, x, y, follow, t: 0, life: 4.2 };
}
function updateHints(dt) {
  const p = player;
  if (hint) {
    hint.t += dt;
    if (hint.follow) { const o = hint.follow(); if (o) { hint.x = o.x; hint.y = o.y; } }
    if (hint.t > 1.2 && !hintsSeen[hint.key]) { hintsSeen[hint.key] = 1; localStorage.setItem('hop-hints', JSON.stringify(hintsSeen)); }
    if (hint.t >= hint.life) hint = null;
  }
  if (p.dead > 0 || finishing > 0 || banner > 1.4) return;
  const head = () => ({ x: p.x + p.w / 2, y: p.y - 6 });
  if (!hintsSeen.move && levelTime < 8) { showHint('move', 0, 0, head); if (hint && hint.key === 'move' && (Math.abs(p.vx) > 50 && !p.onGround)) hint.life = Math.min(hint.life, hint.t + 0.6); }
  for (const e of enemies) {
    if (!e.alive || Math.abs(e.x - p.x) > 230) continue;
    if (e.type === 'frog' && e.crouch) showHint('frog', 0, 0, () => ({ x: e.x + e.w / 2, y: e.y - 8 }));
    if (e.type === 'toad') showHint('toad', 0, 0, () => ({ x: e.x + e.w / 2, y: e.y - 8 }));
  }
  for (const wt of water) if (wt.x > p.x && wt.x - p.x < 150 && Math.abs(wt.surface - (p.y + p.h)) < 80) { showHint('water', wt.x + TILE / 2, wt.surface - 10); break; }
  for (const pad of pads) if (Math.abs(pad.x - p.x) < 120) showHint('pad', pad.x + TILE / 2, pad.y - 14);
  for (let r = 0; r < ROWS; r++) for (let c = Math.max(0, Math.floor(p.x / TILE) - 5); c < Math.min(COLS, Math.floor(p.x / TILE) + 6); c++) {
    if (map[r][c] === 'B' && !hintsSeen.seed) showHint('seed', c * TILE + TILE / 2, r * TILE - 8);
    if (map[r][c] === '=' && !hintsSeen.ledge && p.onGround && r * TILE < p.y && p.y - r * TILE < 140) showHint('ledge', c * TILE + TILE / 2, r * TILE - 8);
  }
}
function drawHint() {
  if (!hint) return;
  const a = Math.min(1, hint.t * 4, (hint.life - hint.t) * 2);
  const sx = hint.x - camX, sy = hint.y - camY, text = HINTS[hint.key];
  ctx.save(); ctx.globalAlpha = a; ctx.font = 'bold 12px "Trebuchet MS", system-ui';
  const w = ctx.measureText(text).width + 20, h = 26, bx = Math.max(6, Math.min(W - w - 6, sx - w / 2)), by = Math.max(40, sy - h - 12);
  ctx.fillStyle = 'rgba(255,255,255,0.95)'; roundRect(bx, by, w, h, 9);
  ctx.beginPath(); ctx.moveTo(Math.max(bx + 10, Math.min(bx + w - 10, sx)) - 6, by + h); ctx.lineTo(Math.max(bx + 10, Math.min(bx + w - 10, sx)), by + h + 7); ctx.lineTo(Math.max(bx + 10, Math.min(bx + w - 10, sx)) + 6, by + h); ctx.fill();
  ctx.fillStyle = '#2b3a1e'; ctx.textAlign = 'center'; ctx.fillText(text, bx + w / 2, by + 17);
  ctx.restore();
}
let powerups, water;                          // phase 3 + water puddles
let lives, collected, totalOrbs, camX, time;
let running = false, paused = false, banner = 0, fade = 0, finishing = 0;
let levelTime = 0, shake = 0, timeScale = 1;
let unlocked = Number(localStorage.getItem('hop-unlocked') || 1);
// Saved progress: best time (seconds) and star rating (1-3) per level
const bestTimes = JSON.parse(localStorage.getItem('hop-best') || '{}');
const starsWon  = JSON.parse(localStorage.getItem('hop-stars') || '{}');
const fmtTime = s => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
let userTapped = false;
const buzz = pattern => { if (userTapped && navigator.vibrate) navigator.vibrate(pattern); };   // phone haptics
const keys = { left: false, right: false, jump: false };
let jumpHeld = false;

const canvas  = document.getElementById('game');
const ctx     = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const ovTitle = document.getElementById('ov-title');
const ovSub   = document.getElementById('ov-sub');
const ovText  = document.getElementById('ov-text');
const ovBtn   = document.getElementById('ov-btn');
const lvlSel  = document.getElementById('level-select');
const skinSel = document.getElementById('skin-select');

// ---------- 4b. Skins (unlocked with orbs collected across all levels) ----------
const SKINS = [
  { name: 'Grass',  body: '#6fcf3f', dark: '#3e8a22', face: '#1f4a12', glow: '160,255,120', cost: 0 },
  { name: 'Autumn', body: '#e0a040', dark: '#9a6420', face: '#4a2e0a', glow: '255,200,120', cost: 40 },
  { name: 'Sky',    body: '#5fc8e8', dark: '#2e88a8', face: '#0e3a4a', glow: '150,230,255', cost: 100 },
  { name: 'Berry',  body: '#e86fa8', dark: '#a8407a', face: '#4a1030', glow: '255,150,210', cost: 180 },
  { name: 'Gold',   body: '#ffd36e', dark: '#d4a03a', face: '#4a3200', glow: '255,220,130', cost: 300 },
];
let totalOrbsEver = Number(localStorage.getItem('hop-orbs-total') || 0);
let skinIndex = Math.min(SKINS.length - 1, Number(localStorage.getItem('hop-skin') || 0));
const skin = () => SKINS[skinIndex];
const settings = { lefty: localStorage.getItem('hop-lefty') === '1', bigButtons: localStorage.getItem('hop-bigbtn') === '1',
                   easy: localStorage.getItem('hop-easy') === '1', slow: localStorage.getItem('hop-slow') === '1', contrast: localStorage.getItem('hop-contrast') === '1' };
const maxLives = () => settings.easy ? 5 : 3;
const assistOn = () => settings.easy || settings.slow;          // times are not recorded with assists on
const baseSpeed = () => settings.slow ? 0.7 : 1;
function applySettings() {
  document.querySelector('.stage').classList.toggle('lefty', settings.lefty);
  document.querySelector('.stage').classList.toggle('bigbtn', settings.bigButtons);
  document.getElementById('opt-lefty').textContent = settings.lefty ? 'Left-handed' : 'Right-handed';
  document.getElementById('opt-size').textContent = settings.bigButtons ? 'Large buttons' : 'Normal buttons';
  document.getElementById('opt-easy').textContent = settings.easy ? 'Easy mode: on' : 'Easy mode: off';
  document.getElementById('opt-slow').textContent = settings.slow ? 'Slow motion: on' : 'Slow motion: off';
  document.getElementById('opt-contrast').textContent = settings.contrast ? 'High contrast: on' : 'High contrast: off';
  for (const id of ['opt-easy', 'opt-slow', 'opt-contrast']) document.getElementById(id).classList.toggle('on', settings[id.slice(4)]);
}

// ---------- 5. Level loading ----------
function isSolid(col, row) {
  if (col < 0 || col >= COLS) return true;
  if (row < 0 || row >= ROWS) return false;
  const ch = map[row][col];
  if (ch === '%') { const c = crumbles[col + ',' + row]; return c.state !== 'gone'; }
  return ch === '#' || ch === 'B';
}
const isOneWay = (col, row) => row >= 0 && row < ROWS && col >= 0 && col < COLS && map[row][col] === '=';
const standable = (col, row) => isSolid(col, row) || isOneWay(col, row);   // for enemies checking ledges

function loadLevel(i) {
  levelIndex = i;
  const L = LEVELS[i];
  map = L.map.map(r => r.split(''));  theme = L.theme;                  // copy so blocks can be broken
  ROWS = map.length; COLS = map[0].length; LEVEL_W = COLS * TILE; LEVEL_H = ROWS * TILE;
  portal = null; boss = null;
  enemies = []; orbs = []; spikes = []; particles = [];
  pads = []; movers = []; checkpoints = []; crumbles = {}; powerups = []; water = [];
  ripples = []; bugFlights = []; leafBounce = { x: -9999, t: 0 }; hudPop = 0; hint = null; slowmo = 0;
  butterflies = []; petals = []; nextButterfly = 3; nextPetal = 0;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const ch = map[r][c], x = c * TILE, y = r * TILE;
    if (ch === 'P') spawnPlayer(x + 3, y);
    if (ch === 'S') enemies.push({ type: 'toad', x: x + 2, y: y + 8, w: 30, h: 24, vx: -40, vy: 0, alive: true, squash: 0, seed: Math.random() * 6 });
    if (ch === 'w' && (r === 0 || map[r - 1][c] !== 'w')) water.push({ x, y: y + 6, w: TILE, h: TILE * 2 - 6, surface: y + 6 });
    if (ch === 'D') powerups.push({ type: 'double', x: x + 6, y: y + 6, w: 20, h: 20, taken: false, seed: Math.random() * 6 });
    if (ch === 'H') powerups.push({ type: 'shield', x: x + 6, y: y + 6, w: 20, h: 20, taken: false, seed: Math.random() * 6 });
    if (ch === '~') pads.push({ x, y: y + 18, w: TILE, h: 14, anim: 0 });
    if (ch === 'C') checkpoints.push({ x: x + 8, y, w: 16, h: TILE, lit: false });
    if (ch === '%') crumbles[c + ',' + r] = { state: 'solid', t: 0 };
    if (ch === 'M') movers.push({ ox: x, oy: y, x, y, px: x, py: y, w: TILE * 3, h: 14, axis: 'x', range: TILE * 3, speed: 1.2, seed: c });
    if (ch === 'V') movers.push({ ox: x, oy: y, x, y, px: x, py: y, w: TILE * 2, h: 14, axis: 'y', range: TILE * 2.5, speed: 1.0, seed: c });
    if (ch === 'o') orbs.push({ x: x + 8, y: y + 8, w: 16, h: 16, taken: false, seed: Math.random() * 6 });
    if (ch === 'e') enemies.push({ type: 'frog', x, y: y + 8, w: 30, h: 24, vx: 0, vy: 0, alive: true, squash: 0, seed: Math.random() * 6, sit: (1 + Math.random()) * (settings.easy ? 1.8 : 1), dir: -1 });
    if (ch === 'f') enemies.push({ type: 'dragonfly', x, y, baseY: y, w: 26, h: 20, vx: -80, vy: 0, alive: true, squash: 0, seed: Math.random() * 6 });
    if (ch === 'G') portal = { x: x + 4, y: y - TILE + 4, w: 24, h: TILE * 2 - 8 };
    if (ch === 'K') boss = { x, y: y - 24, w: 64, h: 56, vx: 0, vy: 0, hp: 3, state: 'idle', t: 1.5, dir: -1, alive: true, jumpT: 3, flash: 0 };
    if (ch === '^') spikes.push({ x: x + 4, y: y + 14, w: TILE - 8, h: 18 });
  }
  totalOrbs = orbs.length + map.flat().filter(ch => ch === 'B').length; collected = 0;   // hidden bugs count too
  // merge vertically stacked water tiles into puddles (one rect per column is fine for collision)
  camX = Math.max(0, player.x - W / 2); camY = Math.max(0, Math.min(LEVEL_H - H, player.y - H / 2));
  banner = 2.2; fade = 1; finishing = 0; time = 0; levelTime = 0; shake = 0; timeScale = baseSpeed();
}

function spawnPlayer(x, y) {
  player = { x, y, w: 26, h: 30, vx: 0, vy: 0, onGround: false, facing: 1, startX: x, startY: y,
             sx: 1, sy: 1, coyote: 0, jumpBuf: 0, dead: 0, invuln: 0, blink: 0, wasGround: false, run: 0,
             hasDouble: false, doubleReady: true, shield: false, sinking: 0, skid: 0, antLag: 0, wasVx: 0 };
}

function respawn() {
  const p = player;
  p.x = p.startX; p.y = p.startY; p.vx = 0; p.vy = 0; p.dead = 0; p.invuln = 1.5; p.sinking = 0;
  camX = Math.max(0, p.x - W / 2); camY = Math.max(0, Math.min(LEVEL_H - H, p.y - H / 2));
}

// ---------- 6. Physics ----------
function moveBox(b, dx, dy) {
  b.x += dx;
  if (dx !== 0) {
    const dir = dx > 0 ? 1 : -1;
    const col = Math.floor((dir > 0 ? b.x + b.w : b.x) / TILE);
    for (let row = Math.floor(b.y / TILE); row <= Math.floor((b.y + b.h - 1) / TILE); row++) {
      if (isSolid(col, row)) { b.x = dir > 0 ? col * TILE - b.w : (col + 1) * TILE; b.hitWall = true; break; }
    }
  }
  const prevBottom = b.y + b.h;
  b.y += dy;
  b.onGround = false;
  if (dy !== 0) {
    const dir = dy > 0 ? 1 : -1;
    const row = Math.floor((dir > 0 ? b.y + b.h : b.y) / TILE);
    for (let col = Math.floor(b.x / TILE); col <= Math.floor((b.x + b.w - 1) / TILE); col++) {
      // one-way ledges only catch you when falling onto them from above
      const oneWayCatch = dir > 0 && isOneWay(col, row) && prevBottom <= row * TILE + 1;
      if (isSolid(col, row) || oneWayCatch) {
        if (b === player && dir < 0 && map[row][col] === 'B') breakBlock(col, row);
        b.y = dir > 0 ? row * TILE - b.h : (row + 1) * TILE; if (dir > 0) b.onGround = true; b.vy = 0; break;
      }
    }
  }
}
function breakBlock(col, row) {
  map[row][col] = '.';
  const x = col * TILE, y = row * TILE;
  orbs.push({ x: x + 8, y: y + 8, w: 16, h: 16, taken: false, seed: Math.random() * 6 });   // the hidden orb pops out
  for (let i = 0; i < 10; i++) particles.push({ x: x + Math.random() * TILE, y: y + Math.random() * TILE, vx: (Math.random() - 0.5) * 200, vy: -Math.random() * 150, life: 0.7, max: 0.7, color: theme.ground, size: 5 });
  Sfx.crumble(); shake = 3; buzz(20);
}
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

// ---------- 7. Particles ----------
function burst(x, y, n, color, speed = 160, life = 0.6, size = 4) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = speed * (0.4 + Math.random() * 0.8);
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, life, max: life, color, size: size * (0.6 + Math.random() * 0.8) });
  }
}
function dust(x, y) {
  for (let i = 0; i < 6; i++) particles.push({ x: x + (Math.random() - 0.5) * 20, y, vx: (Math.random() - 0.5) * 80, vy: -Math.random() * 40, life: 0.4, max: 0.4, color: 'rgba(255,255,255,0.5)', size: 3, gravity: false });
}

// ---------- 8. Update ----------
function update(dt) {
  time += dt;
  if (banner > 0) banner -= dt;
  if (fade > 0) fade = Math.max(0, fade - dt * 1.5);
  if (shake > 0) shake = Math.max(0, shake - dt * 25);
  const p = player;
  if (p.dead <= 0 && finishing <= 0 && banner < 1.6) levelTime += dt;   // timer runs while you're playing

  // ----- moving platforms (move first so the player can ride them) -----
  for (const m of movers) {
    m.px = m.x; m.py = m.y;
    const off = Math.sin(time * m.speed + m.seed) * m.range;
    if (m.axis === 'x') m.x = m.ox + off; else m.y = m.oy + off;
  }
  // ----- crumbling blocks: shake, fall away, come back -----
  for (const key in crumbles) {
    const c = crumbles[key];
    if (c.state === 'shaking') { c.t -= dt; if (c.t <= 0) { c.state = 'gone'; c.t = 3; } }
    else if (c.state === 'gone') { c.t -= dt; if (c.t <= 0) c.state = 'solid'; }
  }
  for (const pad of pads) if (pad.anim > 0) pad.anim -= dt;

  // ----- player -----
  if (p.dead > 0) {
    p.dead -= dt;
    if (p.dead <= 0) { if (lives > 0) respawn(); else gameOver(); }
  } else if (p.sinking > 0) {                                            // sinking in a puddle: no control, slow descent, bubbles
    p.sinking -= dt; p.y += 22 * dt; p.vx = 0; p.vy = 0;
    if (Math.random() < dt * 10) particles.push({ x: p.x + Math.random() * p.w, y: p.y + 4, vx: 0, vy: -30, life: 0.6, max: 0.6, color: 'rgba(255,255,255,0.7)', size: 2, gravity: false });
    if (p.sinking <= 0) hurt(true);
  } else if (finishing > 0) {
    finishing -= dt;
    p.sx += (0.2 - p.sx) * dt * 6; p.sy += (0.2 - p.sy) * dt * 6;       // shrink into the portal
    if (finishing <= 0) levelComplete();
  } else {
    let target = 0;
    if (keys.left)  { target = -RUN_SPEED; p.facing = -1; }
    if (keys.right) { target =  RUN_SPEED; p.facing =  1; }
    if (p.onGround && target !== 0 && Math.sign(target) !== Math.sign(p.vx) && Math.abs(p.vx) > 140 && p.skid <= 0) {   // turning around fast: skid
      p.skid = 0.18; dust(p.x + p.w / 2, p.y + p.h);
    }
    p.skid = Math.max(0, p.skid - dt);
    const accel = p.onGround ? 2800 : 1500;                              // quick to start/stop, a little floatier in the air
    p.vx = target > p.vx ? Math.min(target, p.vx + accel * dt) : Math.max(target, p.vx - accel * dt);
    if (target === 0 && Math.abs(p.vx) < 12) p.vx = 0;

    p.coyote  = p.onGround ? COYOTE_TIME : p.coyote - dt;
    p.jumpBuf = (keys.jump && !jumpHeld) ? JUMP_BUFFER : p.jumpBuf - dt;
    jumpHeld = keys.jump;
    if (p.jumpBuf > 0 && p.coyote > 0) {
      p.vy = -JUMP_SPEED; p.coyote = 0; p.jumpBuf = 0; p.jumping = true;
      p.sx = 0.7; p.sy = 1.35;                                           // stretch
      Sfx.jump();
    } else if (p.jumpBuf > 0 && p.hasDouble && p.doubleReady && !p.onGround && p.coyote <= 0) {
      p.vy = -JUMP_SPEED * 0.85; p.doubleReady = false; p.jumpBuf = 0; p.jumping = true;   // DOUBLE JUMP
      p.sx = 0.7; p.sy = 1.35; Sfx.tone(500, 1000, 0.15, 'square', 0.08);
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; particles.push({ x: p.x + p.w / 2 + Math.cos(a) * 12, y: p.y + p.h, vx: Math.cos(a) * 60, vy: 20, life: 0.35, max: 0.35, color: '#7df9ff', size: 3, gravity: false }); }
    }
    if (p.onGround) p.doubleReady = true;
    if (p.jumping && !keys.jump && p.vy < -220) p.vy = -220;             // release early = short hop (player jumps only)
    if (p.vy >= 0) p.jumping = false;

    p.vy += GRAVITY * dt;
    const prevBottom = p.y + p.h;
    moveBox(p, p.vx * dt, p.vy * dt);

    // riding a moving platform? (landing on it from above, then carried along)
    p.riding = null;
    for (const m of movers) {
      const withinX = p.x + p.w > m.x + 2 && p.x < m.x + m.w - 2;
      const landing = p.vy >= 0 && prevBottom <= m.py + 6 && p.y + p.h >= m.y - 2 && p.y + p.h <= m.y + m.h + 8;
      if (withinX && landing) {
        p.y = m.y - p.h; p.vy = 0; p.onGround = true; p.riding = m;
        p.x += m.x - m.px;                                              // carried sideways
      }
    }
    // standing on a crumbling block? start its countdown
    if (p.onGround) {
      const row = Math.floor((p.y + p.h + 1) / TILE);
      for (let col = Math.floor(p.x / TILE); col <= Math.floor((p.x + p.w - 1) / TILE); col++) {
        const c = crumbles[col + ',' + row];
        if (c && c.state === 'solid') { c.state = 'shaking'; c.t = 0.45; Sfx.crumble(); showHint('crumble', col * TILE + TILE / 2, row * TILE - 6); }
      }
    }
    // bounce pads
    for (const pad of pads) {
      if (p.vy > 0 && overlaps(p, pad)) {
        p.vy = -JUMP_SPEED * 1.3; p.jumping = false; p.sx = 0.6; p.sy = 1.5; pad.anim = 0.3; p.coyote = 0;
        Sfx.bounce(); dust(p.x + p.w / 2, pad.y); buzz(20);
      }
    }
    // checkpoints
    for (const c of checkpoints) {
      if (!c.lit && overlaps(p, c)) {
        c.lit = true; p.startX = c.x - 5; p.startY = c.y + TILE - p.h; showHint('checkpoint', c.x + 8, c.y - 6);
        Sfx.checkpoint(); burst(c.x + 8, c.y + 8, 14, theme.orb, 120, 0.7, 3);
      }
    }
    if (p.onGround && !p.wasGround) { p.sx = 1.3; p.sy = 0.7; dust(p.x + p.w / 2, p.y + p.h); leafBounce = { x: p.x + p.w / 2, y: p.y + p.h, t: 0.5 }; }   // land squash + leaf dip
    p.wasGround = p.onGround;
    p.run = Math.abs(p.vx) > 20 && p.onGround ? p.run + dt * (10 + Math.abs(p.vx) / 40) : 0;
    p.antLag += ((-p.vx / 40) - p.antLag) * Math.min(1, dt * 8);        // antennae trail behind the movement
    p.invuln = Math.max(0, p.invuln - dt);
    p.blink = p.blink > 0 ? p.blink - dt : (Math.random() < dt * 0.4 ? 0.12 : 0);

    if (p.y > LEVEL_H + 80) { hurt(true); }
    // landed in water?
    for (const wt of water) {
      if (p.x + p.w / 2 > wt.x && p.x + p.w / 2 < wt.x + wt.w && p.y + p.h > wt.surface + 6 && p.y < wt.y + wt.h) {
        if (settings.easy && p.invuln <= 0) {                             // easy mode: lose a heart and get tossed back onto the bank
          const leftBank = p.x + p.w / 2 - wt.x, rightBank = wt.x + wt.w - (p.x + p.w / 2);
          let bank = wt; for (const o of water) { if (o.surface !== wt.surface) continue; }   // (puddle columns share a surface)
          let bx = wt.x, cnt = 0; while (cnt++ < 12 && water.some(o => Math.abs(o.x - (bx - TILE)) < 1 && o.surface === wt.surface)) bx -= TILE;   // find the puddle's left edge
          let ex = wt.x + wt.w; cnt = 0; while (cnt++ < 12 && water.some(o => Math.abs(o.x - ex) < 1 && o.surface === wt.surface)) ex += TILE;  // and right edge
          const toLeft = (p.x + p.w / 2 - bx) < (ex - (p.x + p.w / 2));
          p.x = toLeft ? bx - p.w - 2 : ex + 2; p.y = wt.surface - p.h - 4; p.vy = -420; p.vx = 0; p.invuln = 1.5; lives--;
          Sfx.splash(); shake = 4; buzz(40); burst(p.x + p.w / 2, wt.surface, 10, theme.water, 120, 0.5, 3);
          if (lives <= 0) { p.dead = 0.9; }
          break;
        }
        p.sinking = 1.1; Sfx.splash(); shake = 3; buzz(40);
        for (let k = 0; k < 3; k++) ripples.push({ x: p.x + p.w / 2, y: wt.surface, t: -k * 0.15, max: 0.9 });
        for (let i = 0; i < 14; i++) particles.push({ x: p.x + p.w / 2 + (Math.random() - 0.5) * 30, y: wt.surface, vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 220, life: 0.6, max: 0.6, color: theme.water, size: 3 });
        break;
      }
    }

    for (const o of orbs) if (!o.taken && overlaps(p, o)) {
      o.taken = true; collected++; Sfx.pickup();
      bugFlights.push({ x: o.x + 8 - camX, y: o.y + 8 - camY, t: 0 });   // screen-space start point
      burst(o.x + 8, o.y + 8, 10, theme.orb, 120, 0.5, 3);
    }
    for (const u of powerups) if (!u.taken && overlaps(p, u)) {
      u.taken = true; Sfx.power(); burst(u.x + 10, u.y + 10, 14, u.type === 'double' ? '#7df9ff' : '#8fb7ff', 130, 0.6, 3);
      if (u.type === 'double') { p.hasDouble = true; showHint('double', 0, 0, () => ({ x: p.x + p.w / 2, y: p.y - 6 })); } else { p.shield = true; showHint('shield', 0, 0, () => ({ x: p.x + p.w / 2, y: p.y - 6 })); }
    }
    if (p.invuln <= 0) for (const s of spikes) if (overlaps(p, s)) { hurt(); break; }

    for (const e of enemies) {
      if (!e.alive || p.dead > 0) continue;
      if (overlaps(p, e)) {
        const stomping = e.type !== 'toad' && p.vy > 0 && prevBottom <= e.y + 10;
        if (stomping) {
          e.alive = false; p.vy = -STOMP_BOUNCE; p.jumping = false; p.sx = 0.8; p.sy = 1.25;
          Sfx.stomp(); burst(e.x + e.w / 2, e.y + e.h / 2, 12, '#7bc96f', 140, 0.5);
          if (!hintsSeen.firstStomp) { hintsSeen.firstStomp = 1; localStorage.setItem('hop-hints', JSON.stringify(hintsSeen)); slowmo = 0.55; }   // savour the first squash
          shake = 4; buzz(30);
        } else if (p.invuln <= 0) { hurt(); }
      }
    }

    if (boss && boss.alive) bossCollide(p, prevBottom);
    if (portal && overlaps(p, portal)) {
      finishing = 0.6; timeScale = 0.35 * baseSpeed(); p.vx = 0; Sfx.win(); buzz([30, 40, 30]);   // slow-motion finish
      burst(portal.x + portal.w / 2, portal.y + portal.h / 2, 30, theme.portal, 200, 0.9, 4);
    }
  }
  // squash/stretch eases back to normal
  p.sx += (1 - p.sx) * Math.min(1, dt * 10);
  p.sy += (1 - p.sy) * Math.min(1, dt * 10);

  // ----- enemies -----
  for (const e of enemies) {
    if (!e.alive) { e.squash += dt; continue; }
    e.hitWall = false;
    if (e.type === 'frog') {                                            // frog: sits, then hops toward you
      e.vy += GRAVITY * dt;
      const wasG = e.onGround;
      if (e.onGround) { e.sit -= dt; e.vx = 0; }
      const near = Math.abs(player.x - e.x) < 420;
      e.crouch = e.onGround && near && e.sit <= 0.22;                    // telegraph the hop
      if (e.onGround && e.sit <= 0 && near) {
        e.dir = player.x > e.x ? 1 : -1; e.vx = e.dir * 120; e.vy = -360; e.sit = (1.2 + Math.random() * 0.9) * (settings.easy ? 1.8 : 1); e.crouch = false;
        if (Math.abs(player.x - e.x) < 300) Sfx.croak();
      }
      moveBox(e, e.vx * dt, e.vy * dt);
      if (e.hitWall) e.vx = 0;
      if (e.onGround && !wasG) { e.land = 0.18; dust(e.x + e.w / 2, e.y + e.h); }
      e.land = Math.max(0, (e.land || 0) - dt);
      e.blink = e.blink > 0 ? e.blink - dt : (Math.random() < dt * 0.3 ? 0.12 : 0);
      e.tongue = e.tongue > 0 ? e.tongue - dt : (e.onGround && Math.random() < dt * 0.25 ? 0.22 : 0);
    } else if (e.type === 'toad') {                                      // toad: slow patrol, poisonous
      e.vy += GRAVITY * dt;
      moveBox(e, e.vx * dt, e.vy * dt);
      const aheadCol = Math.floor((e.vx > 0 ? e.x + e.w + 1 : e.x - 1) / TILE);
      const belowRow = Math.floor((e.y + e.h + 1) / TILE);
      if (e.hitWall || (e.onGround && !standable(aheadCol, belowRow))) e.vx = -e.vx;
    } else {                                                             // dragonfly: floats in a sine wave
      moveBox(e, e.vx * dt, 0);
      if (e.hitWall) e.vx = -e.vx;
      e.y = e.baseY + Math.sin(time * 2.5 + e.seed) * 22;
    }
  }

  updateHints(dt);

  // ----- foreground life: butterflies crossing, petals drifting -----
  nextButterfly -= dt;
  if (nextButterfly <= 0) {
    nextButterfly = 7 + Math.random() * 8;
    const dir = Math.random() < 0.5 ? 1 : -1;
    butterflies.push({ x: dir > 0 ? -60 : W + 60, y: 40 + Math.random() * (H * 0.5), dir, t: 0, col: theme.flowers[Math.floor(Math.random() * theme.flowers.length)], speed: 40 + Math.random() * 30, seed: Math.random() * 6 });
  }
  for (const b of butterflies) { b.t += dt; b.x += b.dir * b.speed * dt; b.y += Math.sin(b.t * 3 + b.seed) * 25 * dt; }
  butterflies = butterflies.filter(b => b.x > -80 && b.x < W + 80);
  if (theme.flowers && !theme.stars) {
    nextPetal -= dt;
    if (nextPetal <= 0) { nextPetal = 0.9 + Math.random() * 1.6; petals.push({ x: Math.random() * (W + 100) - 50, y: -10, vx: 10 + Math.random() * 20, vy: 22 + Math.random() * 14, rot: Math.random() * 6, spin: (Math.random() - 0.5) * 3, col: theme.flowers[Math.floor(Math.random() * theme.flowers.length)], seed: Math.random() * 6 }); }
    for (const p of petals) { p.x += (p.vx + Math.sin(time * 2 + p.seed) * 25) * dt; p.y += p.vy * dt; p.rot += p.spin * dt; }
    petals = petals.filter(p => p.y < H + 20);
  }

  // ----- little animation extras -----
  for (const rp of ripples) rp.t += dt;
  ripples = ripples.filter(rp => rp.t < rp.max);
  for (const bf of bugFlights) { bf.t += dt * 2.2; if (bf.t >= 1) hudPop = 0.35; }
  bugFlights = bugFlights.filter(bf => bf.t < 1);
  if (leafBounce.t > 0) leafBounce.t -= dt;
  if (hudPop > 0) hudPop -= dt;

  // ----- particles -----
  for (const q of particles) {
    q.life -= dt;
    if (q.gravity !== false) q.vy += 500 * dt;
    q.x += q.vx * dt; q.y += q.vy * dt;
  }
  particles = particles.filter(q => q.life > 0);

  // portal sparkle
  if (boss) updateBoss(dt);
  if (portal && Math.random() < dt * 12) particles.push({ x: portal.x + Math.random() * portal.w, y: portal.y + Math.random() * portal.h, vx: 0, vy: -30, life: 0.8, max: 0.8, color: theme.portal, size: 2, gravity: false });

  // ----- camera (smooth follow) -----
  const target = Math.max(0, Math.min(LEVEL_W - W, p.x - W / 2 + p.facing * 40));
  camX += (target - camX) * Math.min(1, dt * 5);
  const targetY = Math.max(0, Math.min(LEVEL_H - H, p.y + p.h / 2 - H * 0.55));
  camY += (targetY - camY) * Math.min(1, dt * 6);
}

// ---------- 8b. The Grump King ----------
function updateBoss(dt) {
  const b = boss, p = player;
  if (!b.alive) { b.t += dt; return; }
  b.flash = Math.max(0, b.flash - dt);
  b.t -= dt;
  if (b.state === 'idle' && b.t <= 0) { b.state = 'charge'; b.dir = p.x > b.x ? 1 : -1; b.t = 99; }
  if (b.state === 'hurt' && b.t <= 0) { b.state = 'idle'; b.t = 0.6; }
  const speed = 110 + (3 - b.hp) * 55;
  b.vx = b.state === 'charge' ? b.dir * speed : 0;
  b.hitWall = false;
  b.vy += GRAVITY * dt;
  const wasGround = b.onGround;
  moveBox(b, b.vx * dt, b.vy * dt);
  if (b.state === 'charge') {
    if (b.hitWall) { b.dir = -b.dir; shake = Math.max(shake, 3); }
    b.jumpT -= dt;
    if (b.jumpT <= 0 && b.onGround) { b.vy = -520; b.jumpT = 2.5 + Math.random(); }
  }
  if (b.onGround && !wasGround) { shake = Math.max(shake, 6); buzz(30); dust(b.x + 10, b.y + b.h); dust(b.x + b.w - 10, b.y + b.h); }
}
function bossCollide(p, prevBottom) {
  const b = boss;
  if (!overlaps(p, b)) return;
  const stomping = p.vy > 0 && prevBottom <= b.y + 14;
  if (stomping && b.state !== 'hurt') {
    b.hp--; b.state = 'hurt'; b.t = 1.2; b.flash = 1.2;
    p.vy = -STOMP_BOUNCE * 1.2; p.jumping = false; p.sx = 0.8; p.sy = 1.25;
    Sfx.stomp(); shake = 8; buzz(50); burst(b.x + b.w / 2, b.y + 10, 16, '#c98bff', 160, 0.6);
    if (b.hp <= 0) {
      b.alive = false; b.t = 0; Sfx.win(); shake = 12;
      burst(b.x + b.w / 2, b.y + b.h / 2, 60, '#c98bff', 260, 1.2, 5);
      portal = { x: b.x + b.w / 2 - 12, y: 7 * TILE + 4, w: 24, h: TILE * 2 - 8 };   // the way out appears
    }
  } else if (stomping) {
    p.vy = -STOMP_BOUNCE; p.jumping = false;                             // bounce off while he is dazed
  } else if (p.invuln <= 0) { hurt(); }
}

function hurt(fell = false) {
  const p = player;
  if (p.dead > 0) return;
  if (p.shield && !fell) {                                               // shield takes the hit instead
    p.shield = false; p.invuln = 1.5; shake = 5; Sfx.shieldPop(); buzz(40);
    burst(p.x + p.w / 2, p.y + p.h / 2, 16, '#8fb7ff', 160, 0.6, 3);
    return;
  }
  lives--;
  p.dead = 0.9; p.vx = 0;
  Sfx.hurt(); shake = 9; buzz(80);
  if (!fell) burst(p.x + p.w / 2, p.y + p.h / 2, 18, skin().body, 180, 0.7);
  p.sinking = 0;
}

// ---------- 9. Drawing ----------
function draw() {
  drawBackground();
  ctx.save();
  const sx = shake > 0 ? (Math.random() - 0.5) * shake * 2 : 0, sy = shake > 0 ? (Math.random() - 0.5) * shake * 2 : 0;
  ctx.translate(-Math.round(camX) + sx, -Math.round(camY) + sy);
  drawTiles();
  for (const m of movers) drawMover(m);
  for (const s of spikes) drawSpike(s);
  for (const pad of pads) drawPad(pad);
  for (const c of checkpoints) drawLantern(c);
  drawShadows();
  if (portal) drawPortal();
  if (boss) drawBoss();
  for (const o of orbs) if (!o.taken) drawOrb(o);
  for (const u of powerups) if (!u.taken) drawPowerup(u);
  for (const e of enemies) drawEnemy(e);
  if (player.dead <= 0) drawPlayer();
  drawWater();
  for (const q of particles) {
    ctx.globalAlpha = Math.max(0, q.life / q.max);
    ctx.fillStyle = q.color; ctx.beginPath(); ctx.arc(q.x, q.y, q.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  drawForeground();
  ctx.fillStyle = vignette; ctx.fillRect(0, 0, W, H);                   // darkens the edges, focuses the eye
  drawHint();
  drawHUD();
  if (fade > 0) { ctx.fillStyle = `rgba(20,40,20,${fade})`; ctx.fillRect(0, 0, W, H); }
  if (paused) {
    ctx.fillStyle = 'rgba(4,6,24,0.6)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffd36e'; ctx.textAlign = 'center'; ctx.font = 'bold 34px "Trebuchet MS", system-ui';
    ctx.fillText('PAUSED', W / 2, H / 2 - 6);
    ctx.fillStyle = '#fff'; ctx.font = '15px "Trebuchet MS", system-ui';
    ctx.fillText('Tap or press P to continue', W / 2, H / 2 + 24);
  }
}

// soft vignette, built once
const vignette = (() => { const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.95); g.addColorStop(0, 'rgba(10,20,5,0)'); g.addColorStop(1, 'rgba(10,20,5,0.38)'); return g; })();

// y of the first surface below a point (ground, leaf, water or a moving platform), or null
function surfaceBelow(x, fromY) {
  const col = Math.floor(x / TILE);
  let best = null;
  for (let row = Math.max(0, Math.floor(fromY / TILE)); row < ROWS; row++) {
    const ch = map[row][col];
    if ('#%=B'.includes(ch)) { best = row * TILE; break; }
    if (ch === 'w') { best = row * TILE + 6; break; }
  }
  for (const m of movers) if (x > m.x && x < m.x + m.w && m.y >= fromY - 2 && (best === null || m.y < best)) best = m.y;
  return best;
}
function drawShadow(cx, footY, width, strength = 0.28) {
  const gy = surfaceBelow(cx, footY - 1);
  if (gy === null) return;
  const h = Math.max(0, gy - footY); if (h > 240) return;
  const k = 1 - h / 240;
  ctx.fillStyle = `rgba(20,30,10,${strength * k})`;
  ctx.beginPath(); ctx.ellipse(cx, gy + 2, width / 2 * (0.55 + 0.45 * k), 3.5 * (0.6 + 0.4 * k), 0, 0, Math.PI * 2); ctx.fill();
}
// high-contrast helper: a dark ring with a bright inner ring so shapes read against any background
function outline(cx, cy, rx, ry, col) {
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.75)'; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 2; ctx.strokeStyle = col; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
}
function drawShadows() {
  const p = player;
  if (p.dead <= 0 && p.sinking <= 0) drawShadow(p.x + p.w / 2, p.y + p.h, p.w + 10);
  for (const e of enemies) if (e.alive) drawShadow(e.x + e.w / 2, e.y + e.h, e.w, e.type === 'dragonfly' ? 0.15 : 0.28);
  if (boss && boss.alive) drawShadow(boss.x + boss.w / 2, boss.y + boss.h, boss.w, 0.35);
}

// front layer: big grass, flower stems, petals and butterflies scrolling faster than the ground
function drawForeground() {
  const par = camX * 1.35, span = W + 80;
  ctx.lineCap = 'round';
  for (let i = 0; i < 34; i++) {
    const x = ((i * 27 - par) % span + span) % span - 40;
    const hgt = 22 + (i * 37) % 30, sway = Math.sin(time * 1.3 + i * 0.7) * 5, wide = 3 + (i % 3);
    ctx.strokeStyle = i % 4 === 0 ? theme.leaf + 'cc' : theme.leafDark + 'd0'; ctx.lineWidth = wide;
    ctx.beginPath(); ctx.moveTo(x, H + 4); ctx.quadraticCurveTo(x + sway, H - hgt * 0.55, x + sway * 2.2, H - hgt); ctx.stroke();
    if (i % 9 === 4 && theme.flowers) {                                  // a tall flower in front
      const fx = x + sway * 2.2, fy = H - hgt - 12, col = theme.flowers[i % theme.flowers.length];
      ctx.strokeStyle = theme.leafDark + 'd0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, H + 4); ctx.quadraticCurveTo(x + sway, H - hgt * 0.6, fx, fy + 6); ctx.stroke();
      ctx.fillStyle = col + 'e0'; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + time * 0.2; ctx.beginPath(); ctx.arc(fx + Math.cos(a) * 7, fy + Math.sin(a) * 7, 5, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#ffd93d'; ctx.beginPath(); ctx.arc(fx, fy, 4, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.lineCap = 'butt';
  for (const p of petals) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.col + 'cc';
    ctx.beginPath(); ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  for (const b of butterflies) {
    const flap = Math.abs(Math.sin(b.t * 14)), d = b.dir;
    ctx.save(); ctx.translate(b.x, b.y); ctx.scale(d, 1);
    ctx.fillStyle = b.col;
    ctx.beginPath(); ctx.ellipse(-6, -3, 7 * (0.35 + 0.65 * flap), 6, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(6, -3, 7 * (0.35 + 0.65 * flap), 6, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(-6, -3, 2, 0, Math.PI * 2); ctx.arc(6, -3, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a2a2a'; ctx.beginPath(); ctx.ellipse(0, 0, 1.6, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3a2a2a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(3, -11); ctx.moveTo(0, -6); ctx.lineTo(-3, -11); ctx.stroke();
    ctx.restore();
  }
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, theme.sky[0]); g.addColorStop(1, theme.sky[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (theme.stars) {
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 30; i++) { ctx.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(time * 1.5 + i)); ctx.fillRect((i * 97 + 13) % W, (i * 53 + 7) % (H * 0.5), 2, 2); }
    ctx.globalAlpha = 1;
  }
  if (theme.sun) {
    const sx = 520 - camX * 0.05, sy = 80;
    const rg = ctx.createRadialGradient(sx, sy, 10, sx, sy, 110);
    rg.addColorStop(0, theme.sun); rg.addColorStop(0.25, theme.sun + '88'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rg; ctx.fillRect(sx - 120, sy - 120, 240, 240);
  }
  if (theme.clouds) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 7; i++) {
      const cx = ((i * 230 - camX * 0.12 + time * 6) % (W + 300) + W + 300) % (W + 300) - 150, cy = 40 + (i * 37) % 100;
      ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.arc(cx + 24, cy - 10, 26, 0, Math.PI * 2); ctx.arc(cx + 52, cy, 18, 0, Math.PI * 2); ctx.fill();
    }
  }
  // far hills
  ctx.fillStyle = theme.far;
  for (let i = 0; i < 7; i++) { const x = ((i * 300 - camX * 0.2) % (W + 600) + W + 600) % (W + 600) - 300; ctx.beginPath(); ctx.arc(x, H + 40, 190, Math.PI, 0); ctx.fill(); }
  // mid: bushes and tall grass blades
  ctx.fillStyle = theme.mid;
  for (let i = 0; i < 9; i++) { const x = ((i * 190 - camX * 0.45) % (W + 400) + W + 400) % (W + 400) - 200; ctx.beginPath(); ctx.arc(x, H + 30, 100, Math.PI, 0); ctx.fill(); }
  ctx.strokeStyle = theme.mid; ctx.lineWidth = 3;
  for (let i = 0; i < 40; i++) {
    const x = ((i * 47 - camX * 0.5) % (W + 100) + W + 100) % (W + 100) - 50, hgt = 40 + (i * 29) % 50, sway = Math.sin(time * 1.5 + i) * 6;
    ctx.beginPath(); ctx.moveTo(x, H); ctx.quadraticCurveTo(x + sway, H - hgt / 2, x + sway * 2, H - hgt); ctx.stroke();
  }
  // light beams and dappled light in the shady pond
  if (theme.rays) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const bx = ((i * 190 - camX * 0.15) % (W + 300) + W + 300) % (W + 300) - 150, a = 0.05 + 0.04 * Math.abs(Math.sin(time * 0.5 + i));
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(255,240,180,${a * 2})`); g.addColorStop(1, 'rgba(255,240,180,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx + 70, 0); ctx.lineTo(bx + 220, H); ctx.lineTo(bx + 60, H); ctx.closePath(); ctx.fill();
    }
    for (let i = 0; i < 14; i++) {
      const dx = ((i * 97 - camX * 0.3 + Math.sin(time * 0.7 + i) * 12) % (W + 80) + W + 80) % (W + 80) - 40, dy = (i * 53) % H;
      const g = ctx.createRadialGradient(dx, dy, 2, dx, dy, 26 + (i % 3) * 8); g.addColorStop(0, `rgba(255,240,180,${0.08 + 0.05 * Math.sin(time + i)})`); g.addColorStop(1, 'rgba(255,240,180,0)');
      ctx.fillStyle = g; ctx.fillRect(dx - 40, dy - 40, 80, 80);
    }
    ctx.restore();
  }
  // drifting pollen
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 12; i++) { const x = ((i * 131 + time * 12 - camX * 0.3) % (W + 40) + W + 40) % (W + 40) - 20, y = ((i * 71 + Math.sin(time + i) * 20) % H + H) % H; ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill(); }
}
function drawTiles() {
  const c0 = Math.max(0, Math.floor(camX / TILE)), c1 = Math.min(COLS - 1, c0 + W / TILE + 1);
  const r0 = Math.max(0, Math.floor(camY / TILE)), r1 = Math.min(ROWS - 1, r0 + H / TILE + 1);
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    const ch = map[r][c];
    let x = c * TILE, y = r * TILE;
    if (ch === '=') {                                                    // thin leaf ledge
      ctx.fillStyle = theme.leaf; ctx.beginPath(); ctx.ellipse(x + TILE / 2, y + 4, TILE / 2 + 2, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = theme.leafDark; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 1, y + 4); ctx.lineTo(x + TILE + 1, y + 4); ctx.stroke();
      continue;
    }
    if (ch === '%') {                                                    // crumbling dry clod
      const cr = crumbles[c + ',' + r];
      if (cr.state === 'gone') { ctx.globalAlpha = Math.max(0, 1 - cr.t / 0.4); if (cr.t > 0.4) { ctx.globalAlpha = 1; continue; } }
      if (cr.state === 'shaking') { x += (Math.random() - 0.5) * 3; y += (Math.random() - 0.5) * 3; }
      ctx.fillStyle = '#8a7048'; roundRect(x + 1, y + 1, TILE - 2, TILE - 2, 6);
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(x + 6, y + 8); ctx.lineTo(x + 14, y + 16); ctx.lineTo(x + 10, y + 26); ctx.moveTo(x + 24, y + 6); ctx.lineTo(x + 19, y + 15); ctx.lineTo(x + 26, y + 24); ctx.stroke();
      ctx.globalAlpha = 1;
      continue;
    }
    if (ch === 'B') {                                                    // breakable seed pod
      ctx.fillStyle = '#a67c52'; roundRect(x + 3, y + 3, TILE - 6, TILE - 6, 10);
      ctx.strokeStyle = '#6b4a2e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + TILE / 2, y + 6); ctx.lineTo(x + TILE / 2, y + TILE - 6); ctx.stroke();
      ctx.fillStyle = theme.orb; ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(time * 3 + c)); ctx.beginPath(); ctx.arc(x + TILE / 2, y + TILE / 2, 3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      continue;
    }
    if (ch !== '#') continue;
    const top = r > 0 && !isSolid(c, r - 1) && map[r - 1][c] !== 'w', bottom = !isSolid(c, r + 1), left = !isSolid(c - 1, r), right = !isSolid(c + 1, r);
    const floating = bottom && r + 1 < ROWS && !'#%Bw'.includes(map[r + 1][c]);     // nothing solid or wet underneath -> a leaf
    if (floating) {                                                      // a leaf platform
      const leftEnd = left, rightEnd = right;
      if (leafBounce.t > 0 && Math.abs(x + TILE / 2 - leafBounce.x) < TILE * 2.5 && Math.abs(y - leafBounce.y) < 6) {
        y += Math.sin((0.5 - leafBounce.t) * 18) * 4 * (leafBounce.t / 0.5);   // springy dip
      }
      ctx.fillStyle = theme.leaf;
      ctx.beginPath();
      ctx.moveTo(x + (leftEnd ? 6 : 0), y + 6);
      ctx.quadraticCurveTo(x + TILE / 2, y - 2, x + TILE - (rightEnd ? 6 : 0), y + 6);
      ctx.lineTo(x + TILE - (rightEnd ? 2 : 0), y + 22);
      ctx.quadraticCurveTo(x + TILE / 2, y + 30, x + (leftEnd ? 2 : 0), y + 22);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = theme.leafDark; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y + 15); ctx.lineTo(x + TILE, y + 15); ctx.stroke();
      if ((c + r) % 2 === 0) { ctx.beginPath(); ctx.moveTo(x + 10, y + 15); ctx.lineTo(x + 4, y + 9); ctx.moveTo(x + 22, y + 15); ctx.lineTo(x + 28, y + 9); ctx.stroke(); }
      continue;
    }
    // soil with pebbles, roots and an occasional stone
    const hsh = ((c * 73856093) ^ (r * 19349663)) >>> 0, rnd = k => ((hsh >> (k * 3)) & 255) / 255;
    ctx.fillStyle = theme.ground; ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = theme.groundDots;
    if (rnd(0) < 0.5) { ctx.beginPath(); ctx.ellipse(x + 6 + rnd(1) * 20, y + 8 + rnd(2) * 18, 2 + rnd(3) * 2.5, 1.5 + rnd(4) * 1.5, rnd(5) * 3, 0, Math.PI * 2); ctx.fill(); }
    if (rnd(6) < 0.35) { ctx.beginPath(); ctx.ellipse(x + 6 + rnd(7) * 20, y + 8 + rnd(0) * 18, 1.5 + rnd(1) * 2, 1 + rnd(2), rnd(3) * 3, 0, Math.PI * 2); ctx.fill(); }
    if (rnd(4) < 0.18) {                                                 // a pale stone with a highlight
      const px = x + 8 + rnd(5) * 14, py = y + 10 + rnd(6) * 14;
      ctx.fillStyle = 'rgba(180,170,150,0.55)'; ctx.beginPath(); ctx.ellipse(px, py, 4.5, 3.2, rnd(7) * 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(px - 1.5, py - 1.2, 1.8, 1, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (rnd(2) < 0.22 && !top) {                                         // a wandering root
      ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(x + rnd(3) * TILE, y); ctx.bezierCurveTo(x + rnd(4) * TILE, y + 12, x + rnd(5) * TILE, y + 20, x + rnd(6) * TILE, y + TILE); ctx.stroke();
    }
    if (top) {                                                           // grass with an uneven edge, moss, blades, flowers, mushrooms
      ctx.fillStyle = theme.groundTop; ctx.beginPath(); ctx.moveTo(x - 1, y + 8);
      for (let k = 0; k <= 4; k++) { const bx = x - 1 + k * (TILE + 2) / 4; ctx.quadraticCurveTo(bx - 4, y - 3 - rnd(k) * 3, bx, y - 1 - rnd(k + 1) * 2); }
      ctx.lineTo(x + TILE + 1, y + 8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x, y + 7, TILE, 3);                 // shadow under the turf
      if (rnd(5) < 0.3) { ctx.fillStyle = theme.leaf + '99'; ctx.beginPath(); ctx.ellipse(x + 8 + rnd(6) * 16, y + 12 + rnd(7) * 6, 6, 3, 0, 0, Math.PI * 2); ctx.fill(); }   // moss patch
      ctx.strokeStyle = theme.groundTop; ctx.lineWidth = 2;
      const pcx = player.x + player.w / 2, nearGround = Math.abs(player.y + player.h - y) < 14;
      for (let i = 0; i < 4; i++) {
        const bx = x + 4 + i * 8; let sway = Math.sin(time * 2 + c + i) * 2;
        if (nearGround) { const dx = bx - pcx; if (Math.abs(dx) < 42) sway += Math.sign(dx || 1) * (1 - Math.abs(dx) / 42) * 9; }   // blades bend away from the grasshopper
        ctx.beginPath(); ctx.moveTo(bx, y); ctx.quadraticCurveTo(bx + sway, y - 6, bx + sway * 2, y - 10 - (i % 2) * 4); ctx.stroke();
      }
      const deco = (c * 31 + r * 7) % 9;
      if (deco === 0 || deco === 4) {                                    // flower
        const col = theme.flowers[c % theme.flowers.length], fx = x + 10 + (c % 3) * 5, fy = y - 14 - (c % 2) * 4;
        ctx.strokeStyle = theme.leafDark; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx, fy + 4); ctx.stroke();
        ctx.fillStyle = col; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + time * 0.3; ctx.beginPath(); ctx.arc(fx + Math.cos(a) * 5, fy + Math.sin(a) * 5, 3.5, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = '#ffd93d'; ctx.beginPath(); ctx.arc(fx, fy, 2.5, 0, Math.PI * 2); ctx.fill();
      } else if (deco === 7) {                                           // mushroom
        const mx = x + 20;
        ctx.fillStyle = '#f3e6cf'; ctx.fillRect(mx - 3, y - 8, 6, 8);
        ctx.fillStyle = '#e0524f'; ctx.beginPath(); ctx.arc(mx, y - 8, 8, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mx - 3, y - 11, 1.5, 0, Math.PI * 2); ctx.arc(mx + 3, y - 10, 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (left)  { const g = ctx.createLinearGradient(x, 0, x + 8, 0); g.addColorStop(0, 'rgba(0,0,0,0.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, 8, TILE); }
    if (right) { const g = ctx.createLinearGradient(x + TILE, 0, x + TILE - 8, 0); g.addColorStop(0, 'rgba(0,0,0,0.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x + TILE - 8, y, 8, TILE); }
  }
}
function drawWater() {
  for (const rp of ripples) {
    if (rp.t < 0) continue;
    const k = rp.t / rp.max;
    ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - k)})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(rp.x, rp.y, 6 + k * 34, 2 + k * 9, 0, 0, Math.PI * 2); ctx.stroke();
  }
  for (const wt of water) {
    if (wt.x + wt.w < camX - TILE || wt.x > camX + W + TILE) continue;
    const g = ctx.createLinearGradient(0, wt.surface, 0, wt.surface + wt.h);
    g.addColorStop(0, theme.sky[1] + 'aa'); g.addColorStop(0.25, theme.water + 'cc'); g.addColorStop(1, theme.water + 'ee');
    ctx.fillStyle = g; ctx.fillRect(wt.x, wt.surface, wt.w, wt.h);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 1.5;   // caustic light lines under the surface
    for (let k = 0; k < 2; k++) { const yy = wt.surface + 14 + k * 16 + Math.sin(time * 1.5 + wt.x / 20 + k) * 3; ctx.beginPath(); ctx.moveTo(wt.x + 2, yy); ctx.quadraticCurveTo(wt.x + TILE / 2, yy + Math.sin(time * 2 + wt.x + k) * 4, wt.x + TILE - 2, yy); ctx.stroke(); }
    if (settings.contrast) { ctx.strokeStyle = '#ff3b3b'; ctx.lineWidth = 3; ctx.strokeRect(wt.x + 1.5, wt.surface + 1.5, wt.w - 3, wt.h - 3); }
    // rippling surface
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 8; i++) { const px = wt.x + i * (wt.w / 8); const py = wt.surface + Math.sin(time * 3 + px / 14) * 1.5; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(wt.x + 6, wt.surface + 10 + Math.sin(time * 2 + wt.x) * 2, 10, 2); ctx.fillRect(wt.x + 18, wt.surface + 22 + Math.cos(time * 2 + wt.x) * 2, 8, 2);
  }
}

function drawSpike(s) {                                                  // bramble thorns
  ctx.strokeStyle = '#5a3a2a'; ctx.lineWidth = 3; ctx.beginPath();
  ctx.moveTo(s.x - 2, s.y + s.h); ctx.quadraticCurveTo(s.x + 8, s.y + 2, s.x + s.w + 2, s.y + s.h - 4); ctx.stroke();
  ctx.fillStyle = '#e8e0d0';
  for (let i = 0; i < 4; i++) { const bx = s.x + 2 + i * 6, by = s.y + s.h - 6 - (i % 2) * 4; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 3, by - 9); ctx.lineTo(bx + 6, by); ctx.fill(); }
}
function drawMover(m) {                                                  // floating lily pad
  ctx.fillStyle = theme.leaf; ctx.beginPath(); ctx.ellipse(m.x + m.w / 2, m.y + 7, m.w / 2, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = theme.leafDark; ctx.beginPath(); ctx.moveTo(m.x + m.w / 2, m.y + 7); ctx.lineTo(m.x + m.w - 4, m.y + 1); ctx.lineTo(m.x + m.w - 4, m.y + 13); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffb3d1'; ctx.beginPath(); ctx.arc(m.x + 14, m.y + 4, 4, 0, Math.PI * 2); ctx.fill();
}
function drawPad(pad) {                                                  // springy mushroom cap
  const squish = pad.anim > 0 ? 0.6 + pad.anim : 1, cx = pad.x + TILE / 2, base = pad.y + pad.h;
  ctx.fillStyle = '#f3e6cf'; ctx.fillRect(cx - 4, base - 10 * squish, 8, 10 * squish);
  ctx.fillStyle = theme.orb; ctx.beginPath(); ctx.ellipse(cx, base - 10 * squish, 14, 7 * squish, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx - 5, base - 13 * squish, 2, 0, Math.PI * 2); ctx.arc(cx + 5, base - 12 * squish, 2, 0, Math.PI * 2); ctx.fill();
}
function drawLantern(c) {                                                // checkpoint: a dandelion that lights up
  const cx = c.x + 8, top = c.y + 6;
  ctx.strokeStyle = theme.leafDark; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, c.y + TILE); ctx.lineTo(cx, top + 6); ctx.stroke();
  if (c.lit) { const g = ctx.createRadialGradient(cx, top, 2, cx, top, 26); g.addColorStop(0, theme.orb + 'aa'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(cx - 26, top - 26, 52, 52); }
  ctx.strokeStyle = c.lit ? '#fff' : 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + (c.lit ? time : 0); ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx + Math.cos(a) * 9, top + Math.sin(a) * 9); ctx.stroke(); }
  ctx.fillStyle = c.lit ? theme.orb : '#ddd'; ctx.beginPath(); ctx.arc(cx, top, 3, 0, Math.PI * 2); ctx.fill();
}
function drawOrb(o) {
  const cx = o.x + 8, cy = o.y + 8 + Math.sin(time * 3 + o.seed) * 3;
  if (settings.contrast) outline(cx, cy, 11, 10, '#ffffff');
  if (theme.bug === 'firefly') {
    const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 16);
    g.addColorStop(0, theme.orb); g.addColorStop(0.4, theme.orb + '66'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - 16, cy - 16, 32, 32);
    ctx.fillStyle = '#4a4a4a'; ctx.beginPath(); ctx.ellipse(cx, cy - 2, 3, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = theme.orb; ctx.beginPath(); ctx.arc(cx, cy + 3, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1; const f = Math.sin(time * 20 + o.seed) * 4;
    ctx.beginPath(); ctx.moveTo(cx, cy - 3); ctx.lineTo(cx - 7, cy - 6 - f); ctx.moveTo(cx, cy - 3); ctx.lineTo(cx + 7, cy - 6 - f); ctx.stroke();
  } else {                                                               // ladybug
    ctx.fillStyle = '#2a2a2a'; ctx.beginPath(); ctx.arc(cx - 5, cy, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = theme.orb; ctx.beginPath(); ctx.ellipse(cx + 1, cy, 6.5, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + 1, cy - 5.5); ctx.lineTo(cx + 1, cy + 5.5); ctx.stroke();
    ctx.fillStyle = '#2a2a2a'; ctx.beginPath(); ctx.arc(cx - 1, cy - 2, 1.3, 0, Math.PI * 2); ctx.arc(cx + 4, cy + 2, 1.3, 0, Math.PI * 2); ctx.arc(cx + 3, cy - 2.5, 1.1, 0, Math.PI * 2); ctx.fill();
  }
}
function drawPortal() {                                                  // the goal: a big blooming flower
  const cx = portal.x + portal.w / 2, base = portal.y + portal.h, cy = portal.y + 14;
  const g = ctx.createRadialGradient(cx, cy, 5, cx, cy, 50);
  g.addColorStop(0, theme.portal + '66'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(cx - 50, cy - 50, 100, 100);
  ctx.strokeStyle = theme.leafDark; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, base); ctx.quadraticCurveTo(cx + 4, base - 20, cx, cy + 10); ctx.stroke();
  ctx.fillStyle = theme.leaf; ctx.beginPath(); ctx.ellipse(cx - 10, base - 18, 10, 4, -0.6, 0, Math.PI * 2); ctx.ellipse(cx + 10, base - 28, 10, 4, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = theme.portal;
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + time * 0.6, r = 13 + Math.sin(time * 3 + i) * 1.5; ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 8, 5, a, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#ffd93d'; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e0a020'; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 4, cy + Math.sin(a) * 4, 1.3, 0, Math.PI * 2); ctx.fill(); }
}
function drawPowerup(u) {
  const cx = u.x + 10, cy = u.y + 10 + Math.sin(time * 3 + u.seed) * 3, col = u.type === 'double' ? '#7df9ff' : '#8fb7ff';
  const g = ctx.createRadialGradient(cx, cy, 3, cx, cy, 22);
  g.addColorStop(0, col + '99'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(cx - 22, cy - 22, 44, 44);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath();
  if (u.type === 'double') { ctx.moveTo(cx - 4, cy + 1); ctx.lineTo(cx, cy - 4); ctx.lineTo(cx + 4, cy + 1); ctx.moveTo(cx - 4, cy + 5); ctx.lineTo(cx, cy); ctx.lineTo(cx + 4, cy + 5); }
  else { ctx.arc(cx, cy, 5, 0, Math.PI * 2); }
  ctx.stroke();
}

function drawBoss() {                                                    // the Bullfrog King
  const b = boss;
  if (!b.alive && b.t > 0.6) return;
  if (b.flash > 0 && Math.floor(b.flash * 14) % 2 === 0) return;
  const wob = b.state === 'charge' ? Math.sin(time * 14) * 0.05 : 0;
  const h = b.alive ? b.h * (1 + wob) : 16, w = b.w * (1 - wob);
  const x = b.x + (b.w - w) / 2, y = b.y + b.h - h;
  drawFrogBody(x, y, w, h, '#4f8f3a', '#2f6a22', b.alive, b.dir, true);
  if (b.alive) {
    ctx.fillStyle = '#ffd36e'; ctx.beginPath();                          // crown
    ctx.moveTo(x + w * 0.32, y + 2); ctx.lineTo(x + w * 0.32, y - 14); ctx.lineTo(x + w * 0.41, y - 4); ctx.lineTo(x + w * 0.5, y - 18);
    ctx.lineTo(x + w * 0.59, y - 4); ctx.lineTo(x + w * 0.68, y - 14); ctx.lineTo(x + w * 0.68, y + 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff5f7a'; ctx.beginPath(); ctx.arc(x + w * 0.5, y - 6, 3, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 3; i++) drawHeart(x + w / 2 - 20 + i * 20, y - 32, i < b.hp ? '#ff5f7a' : 'rgba(255,255,255,0.25)');
  }
}

// shared frog drawing: body, eyes on top, legs
function drawFrogBody(x, y, w, h, col, dark, alive, dir, big) {
  ctx.fillStyle = dark;                                                  // back legs
  ctx.beginPath(); ctx.ellipse(x + w * 0.15, y + h * 0.85, w * 0.22, h * 0.22, -0.5, 0, Math.PI * 2); ctx.ellipse(x + w * 0.85, y + h * 0.85, w * 0.22, h * 0.22, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = col;                                                   // body
  ctx.beginPath(); ctx.moveTo(x + w * 0.05, y + h); ctx.quadraticCurveTo(x, y + h * 0.3, x + w * 0.3, y + h * 0.15); ctx.quadraticCurveTo(x + w * 0.5, y, x + w * 0.7, y + h * 0.15); ctx.quadraticCurveTo(x + w, y + h * 0.3, x + w * 0.95, y + h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(x + w * 0.5, y + h * 0.75, w * 0.3, h * 0.18, 0, 0, Math.PI * 2); ctx.fill();   // pale belly
  if (!alive) return;
  const er = big ? 9 : 5, ey = y + h * 0.12, look = dir * (big ? 3 : 1.5);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + w * 0.3, ey, er + 2, 0, Math.PI * 2); ctx.arc(x + w * 0.7, ey, er + 2, 0, Math.PI * 2); ctx.fill();   // eye bumps
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + w * 0.3, ey, er, 0, Math.PI * 2); ctx.arc(x + w * 0.7, ey, er, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.ellipse(x + w * 0.3 + look, ey, er * 0.35, er * 0.7, 0, 0, Math.PI * 2); ctx.ellipse(x + w * 0.7 + look, ey, er * 0.35, er * 0.7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = dark; ctx.lineWidth = big ? 3 : 1.5; ctx.beginPath(); ctx.moveTo(x + w * 0.3, y + h * 0.5); ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.62, x + w * 0.7, y + h * 0.5); ctx.stroke();   // mouth
}
function drawEnemy(e) {
  if (!e.alive && e.squash > 0.4) return;
  if (settings.contrast && e.alive) outline(e.x + e.w / 2, e.y + e.h / 2, e.w / 2 + 5, e.h / 2 + 5, e.type === 'toad' ? '#ff3b3b' : '#ffffff');
  if (e.type === 'frog' || e.type === 'toad') {
    let hs = 1, ws = 1;
    if (e.type === 'frog' && e.alive) {
      if (!e.onGround) { hs = e.vy < 0 ? 1.25 : 1.08; ws = e.vy < 0 ? 0.82 : 0.95; }   // stretched going up, settling coming down
      else if (e.crouch) { hs = 0.72; ws = 1.18; }                                       // coiled before the hop
      else if (e.land > 0) { const k = e.land / 0.18; hs = 1 - 0.25 * k; ws = 1 + 0.2 * k; }   // splat on landing
      else { hs = 1 + Math.sin(time * 4 + e.seed) * 0.03; }                              // breathing
    }
    if (!e.alive) { const k = Math.min(1, e.squash / 0.4); hs = 1 - 0.75 * k; ws = 1 + 0.3 * k; ctx.globalAlpha = 1 - k * 0.7; }
    const h = e.h * hs, w = e.w * ws;
    const x = e.x + (e.w - w) / 2, y = e.y + e.h - h;
    if (e.type === 'frog') {
      drawFrogBody(x, y, w, h, '#6bbf4e', '#3f8a2e', e.alive, e.dir, false);
      if (e.alive && e.blink > 0) { ctx.fillStyle = '#5aa842'; ctx.beginPath(); ctx.arc(x + w * 0.3, y + h * 0.12, 6, 0, Math.PI * 2); ctx.arc(x + w * 0.7, y + h * 0.12, 6, 0, Math.PI * 2); ctx.fill(); }   // eyelids
      if (e.alive && e.tongue > 0) { const len = Math.sin(e.tongue / 0.22 * Math.PI) * 22; ctx.strokeStyle = '#ff6b8a'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + w * 0.5, y + h * 0.55); ctx.lineTo(x + w * 0.5 + e.dir * len, y + h * 0.5 - 4); ctx.stroke(); ctx.lineCap = 'butt'; }
      if (!e.alive) { ctx.fillStyle = '#ffd93d'; for (let i = 0; i < 3; i++) { const a = time * 6 + i * 2.1; ctx.beginPath(); ctx.arc(x + w / 2 + Math.cos(a) * 14, y - 6 + Math.sin(a) * 4, 2, 0, Math.PI * 2); ctx.fill(); } }   // dizzy stars
      ctx.globalAlpha = 1;
      return;
    }
    else {
      drawFrogBody(x, y, w, h, '#a5763f', '#6b4a22', e.alive, e.vx > 0 ? 1 : -1, false);
      if (e.alive) { ctx.fillStyle = '#7a5528'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(x + 6 + ((i * 7 + 3) % (w - 8)), y + 8 + (i * 5) % 9, 1.8, 0, Math.PI * 2); ctx.fill(); }   // warts
        ctx.fillStyle = '#ff4040'; ctx.beginPath(); ctx.arc(x + w * 0.3 + (e.vx > 0 ? 1.5 : -1.5), y + h * 0.12, 1.5, 0, Math.PI * 2); ctx.arc(x + w * 0.7 + (e.vx > 0 ? 1.5 : -1.5), y + h * 0.12, 1.5, 0, Math.PI * 2); ctx.fill(); }   // red eyes
    }
    return;
  }
  // dragonfly
  const flap = Math.sin(time * 22 + e.seed) * 7, cx = e.x + e.w / 2, cy = e.y + e.h / 2, d = e.vx > 0 ? 1 : -1;
  ctx.fillStyle = 'rgba(200,240,255,0.65)';
  for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx - d * 2, cy - 3 + sgn * flap * 0.3, 14, 4, sgn * 0.5 + (flap / 20), 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = '#2f7fb8'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx + d * 4, cy); ctx.lineTo(cx - d * 16, cy + 2); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.fillStyle = '#3aa0e0'; ctx.beginPath(); ctx.arc(cx + d * 6, cy, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#123'; ctx.beginPath(); ctx.arc(cx + d * 8, cy - 1, 2.2, 0, Math.PI * 2); ctx.fill();
}
function drawPlayer() {                                                  // Hop the grasshopper
  const p = player;
  if (p.invuln > 0 && Math.floor(p.invuln * 12) % 2 === 0) return;
  if (settings.contrast) outline(p.x + p.w / 2, p.y + p.h / 2 - 4, p.w / 2 + 8, p.h / 2 + 4, '#ffffff');
  const sk = skin();
  const cx = p.x + p.w / 2, bottom = p.y + p.h, d = p.facing;
  const air = !p.onGround, moving = Math.abs(p.vx) > 20;
  ctx.save();
  ctx.translate(cx, bottom - (air ? 4 : 0));
  ctx.scale(p.sx * d, p.sy);                                             // flip with facing
  const tilt = air ? Math.max(-0.35, Math.min(0.35, p.vy / 1100)) : (moving ? -0.06 : 0);   // nose up when rising, down when falling, lean into a run
  ctx.rotate(tilt);
  const ph = p.run, bob = ph ? Math.abs(Math.sin(ph)) * 1.5 : 0;
  const bodyY = -14 - bob;
  ctx.lineCap = 'round';
  // wings flutter in the air
  if (air) {
    const f = Math.sin(time * 45) * 0.5 + 0.5;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.ellipse(-2, bodyY - 8 - f * 6, 12, 4 + f * 3, -0.5 - f * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-4, bodyY - 6 - f * 4, 11, 3 + f * 2, -0.9 - f * 0.3, 0, Math.PI * 2); ctx.fill();
  }
  // hind legs: folded when standing, kicking alternately when running, stretched back in the air
  ctx.strokeStyle = sk.dark; ctx.lineWidth = 3;
  for (const side of [0, 1]) {
    const k = ph ? Math.sin(ph + side * Math.PI) : 0;                    // alternate
    let kneeX = -12 + k * 3, kneeY = -22 + bob, footX = -18 - k * 6, footY = 0 - Math.max(0, k) * 5;
    if (air) { kneeX = -16; kneeY = -4; footX = -26 + side * 3; footY = 6; }
    else if (p.skid > 0) { kneeX = -8; kneeY = -18; footX = 4; footY = 0; }
    ctx.beginPath(); ctx.moveTo(-4 - side * 2, bodyY + 4 + side * 2); ctx.lineTo(kneeX - side * 2, kneeY + side * 3); ctx.lineTo(footX - side * 3, footY); ctx.stroke();
  }
  // front legs
  ctx.lineWidth = 2;
  for (const side of [0, 1]) {
    const k = ph ? Math.sin(ph + side * Math.PI + Math.PI / 2) : 0;
    const kx = (side ? 4 : 9) + k * 4, ky = air ? -2 : -6 + Math.max(0, -k) * 3, fx = (side ? 7 : 12) + k * 5, fy = air ? 3 : 0;
    ctx.beginPath(); ctx.moveTo(side ? 2 : 6, bodyY + 5); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
  }
  // abdomen + thorax
  ctx.fillStyle = sk.body;
  ctx.beginPath(); ctx.ellipse(-4, bodyY + 1, 15, 6.5, -0.05, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = sk.dark; for (let i = 0; i < 4; i++) ctx.fillRect(-16 + i * 4, bodyY - 1, 1.5, 5);
  ctx.fillStyle = sk.body; ctx.beginPath(); ctx.ellipse(8, bodyY - 1, 8, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.ellipse(-3, bodyY - 3, 13, 3.5, -0.1, 0, Math.PI * 2); ctx.fill();
  // head + eye (pupil looks where you're going)
  ctx.fillStyle = sk.body; ctx.beginPath(); ctx.ellipse(15, bodyY - 3, 6, 6.5, 0, 0, Math.PI * 2); ctx.fill();
  const look = moving ? 1 : 0, lookY = air ? (p.vy < 0 ? -1 : 1) : 0;
  if (p.blink > 0) { ctx.strokeStyle = sk.face; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(14, bodyY - 5); ctx.lineTo(19, bodyY - 5); ctx.stroke(); }
  else { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(16.5, bodyY - 5, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = sk.face; ctx.beginPath(); ctx.arc(17 + look, bodyY - 5 + lookY, 2, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = sk.face; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(17, bodyY, 2.5, 0.3, Math.PI - 0.6); ctx.stroke();
  // antennae trail behind movement and wag when idle
  ctx.strokeStyle = sk.dark; ctx.lineWidth = 1.5;
  const wag = Math.sin(time * 6) * 2, lag = p.antLag * d;
  ctx.beginPath(); ctx.moveTo(17, bodyY - 8); ctx.quadraticCurveTo(24 + lag, bodyY - 20, 30 + wag + lag * 1.6, bodyY - 22 + Math.abs(lag) * 0.5);
  ctx.moveTo(15, bodyY - 8); ctx.quadraticCurveTo(20 + lag, bodyY - 22, 24 + wag + lag * 1.6, bodyY - 26 + Math.abs(lag) * 0.5); ctx.stroke();
  ctx.lineCap = 'butt';
  if (p.shield) {
    ctx.strokeStyle = 'rgba(143,183,255,0.8)'; ctx.lineWidth = 2; ctx.fillStyle = 'rgba(143,183,255,0.15)';
    ctx.beginPath(); ctx.ellipse(2, -14, 24, 20 + Math.sin(time * 5) * 1.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}
function drawHUD() {
  ctx.font = 'bold 15px "Trebuchet MS", system-ui';
  // lives pill
  const nHearts = maxLives();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; roundRect(10, 10, 24 + nHearts * 24, 28, 14);
  for (let i = 0; i < nHearts; i++) drawHeart(30 + i * 24, 24, i < lives ? '#ff5f7a' : 'rgba(255,255,255,0.2)');
  // orbs pill
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; roundRect(W - 116, 10, 106, 28, 14);
  ctx.fillStyle = theme.orb; ctx.beginPath(); ctx.ellipse(W - 97, 24, 7, 5.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2a2a2a'; ctx.beginPath(); ctx.arc(W - 103, 24, 3, 0, Math.PI * 2); ctx.arc(W - 96, 22, 1.3, 0, Math.PI * 2); ctx.arc(W - 93, 26, 1.3, 0, Math.PI * 2); ctx.fill();
  const pop = hudPop > 0 ? 1 + Math.sin(hudPop / 0.35 * Math.PI) * 0.35 : 1;
  ctx.save(); ctx.translate(W - 86, 29); ctx.scale(pop, pop);
  ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText(`${collected} / ${totalOrbs}`, 0, 0);
  ctx.restore();
  for (const bf of bugFlights) {                                         // caught bugs fly up into the counter
    const k = bf.t, e = 1 - Math.pow(1 - k, 3);
    const x = bf.x + (W - 97 - bf.x) * e, y = bf.y + (24 - bf.y) * e - Math.sin(k * Math.PI) * 60;
    ctx.fillStyle = theme.orb; ctx.beginPath(); ctx.ellipse(x, y, 6 * (1 - k * 0.4), 5 * (1 - k * 0.4), 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a2a2a'; ctx.beginPath(); ctx.arc(x - 5 * (1 - k * 0.4), y, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  // power-up icons next to the hearts
  let ix = 46 + maxLives() * 24;
  if (player.hasDouble) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; roundRect(ix, 10, 28, 28, 14); ctx.strokeStyle = '#7df9ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ix + 9, 22); ctx.lineTo(ix + 14, 16); ctx.lineTo(ix + 19, 22); ctx.moveTo(ix + 9, 29); ctx.lineTo(ix + 14, 23); ctx.lineTo(ix + 19, 29); ctx.stroke(); ix += 32; }
  if (player.shield)    { ctx.fillStyle = 'rgba(0,0,0,0.35)'; roundRect(ix, 10, 28, 28, 14); ctx.strokeStyle = '#8fb7ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ix + 14, 24, 7, 0, Math.PI * 2); ctx.stroke(); }
  // timer (bottom centre so it stays clear of the pause/mute buttons at the top)
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; roundRect(W / 2 - 40, H - 30, 80, 22, 11);
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.textAlign = 'center'; ctx.font = 'bold 13px "Trebuchet MS", system-ui';
  ctx.fillText(fmtTime(levelTime), W / 2, H - 14);
  // level banner
  if (banner > 0) {
    const a = Math.min(1, banner, (2.2 - banner) * 2);
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; roundRect(W / 2 - 150, H / 2 - 36, 300, 64, 18);
    ctx.fillStyle = '#ffd36e'; ctx.textAlign = 'center'; ctx.font = 'bold 13px "Trebuchet MS", system-ui';
    ctx.fillText(`LEVEL ${levelIndex + 1}`, W / 2, H / 2 - 12);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 24px "Trebuchet MS", system-ui';
    ctx.fillText(LEVELS[levelIndex].name, W / 2, H / 2 + 16);
    ctx.globalAlpha = 1;
  }
}

function drawHeart(x, y, color) {
  ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(x, y + 6); ctx.bezierCurveTo(x - 9, y - 2, x - 4, y - 9, x, y - 4); ctx.bezierCurveTo(x + 4, y - 9, x + 9, y - 2, x, y + 6); ctx.fill();
}
function roundRect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fill();
}

// ---------- 10. Game loop ----------
let lastTime = 0, frameReq = 0;
function loop(now) {
  if (!running) return;
  const dt = Math.min((now - lastTime) / 1000, 1 / 30);
  lastTime = now;
  if (!paused) {
    if (slowmo > 0) { slowmo -= dt; timeScale = 0.4 * baseSpeed(); if (slowmo <= 0 && finishing <= 0) timeScale = baseSpeed(); }
    else if (finishing <= 0) timeScale = baseSpeed();
    update(dt * timeScale);
  }
  draw();
  frameReq = requestAnimationFrame(loop);
}

function setPaused(on) {
  if (!running || paused === on) return;
  paused = on;
  document.getElementById('pause-btn').textContent = on ? '▶' : '⏸';
  if (Sfx.ctx) on ? Sfx.ctx.suspend() : Sfx.ctx.resume();
  if (!on) { lastTime = performance.now(); keys.left = keys.right = keys.jump = false; }
}

// ---------- 11. Screens & flow ----------
function startLevel(i) {
  Sfx.init();
  lives = maxLives();
  loadLevel(i);
  overlay.classList.add('hidden');
  Music.start(i);
  cancelAnimationFrame(frameReq);                                       // never run two loops at once
  paused = false; document.getElementById('pause-btn').textContent = '⏸';
  running = true; lastTime = performance.now();
  frameReq = requestAnimationFrame(loop);
}

function levelComplete() {
  running = false; Music.stop();
  const next = levelIndex + 1;
  // stars: 3 for every orb, 2 for 60%+, 1 for finishing
  const ratio = totalOrbs ? collected / totalOrbs : 1;
  const stars = ratio >= 1 ? 3 : ratio >= 0.6 ? 2 : 1;
  if (customMode) { showOverlay('Level Clear!', 'Custom level', `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}   Bugs ${collected} / ${totalOrbs}
Time ${fmtTime(levelTime)}`, 'Play Again', () => startLevel(0)); return; }
  starsWon[levelIndex] = Math.max(starsWon[levelIndex] || 0, stars);
  totalOrbsEver += collected; localStorage.setItem('hop-orbs-total', totalOrbsEver);
  localStorage.setItem('hop-stars', JSON.stringify(starsWon));
  const prevBest = bestTimes[levelIndex];
  const newBest = !assistOn() && (!prevBest || levelTime < prevBest);
  if (newBest) { bestTimes[levelIndex] = levelTime; localStorage.setItem('hop-best', JSON.stringify(bestTimes)); }
  const summary = `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}   Bugs ${collected} / ${totalOrbs}\nTime ${fmtTime(levelTime)}${assistOn() ? '  (assists on: time not saved)' : newBest ? '  ✨ New best!' : prevBest ? `  (best ${fmtTime(prevBest)})` : ''}`;
  if (next < LEVELS.length) {
    unlocked = Math.max(unlocked, next + 1); localStorage.setItem('hop-unlocked', unlocked);
    showOverlay('Level Clear!', LEVELS[levelIndex].name, summary, 'Next Level', () => startLevel(next));
  } else {
    showOverlay('You did it!', 'All levels complete', summary, 'Play Again', () => startLevel(0));
  }
}
function gameOver() {
  running = false; Music.stop();
  showOverlay('Game Over', LEVELS[levelIndex].name, `Bugs: ${collected} / ${totalOrbs}`, 'Try Again', () => startLevel(levelIndex));
}
function showOverlay(title, sub, text, btn, onClick) {
  ovTitle.textContent = title; ovSub.textContent = sub; ovText.textContent = text; ovBtn.textContent = btn;
  ovBtn.onclick = onClick;
  buildLevelSelect();
  overlay.classList.remove('hidden');
}
function buildSkinSelect() {
  skinSel.innerHTML = '';
  SKINS.forEach((sk, i) => {
    const b = document.createElement('button');
    const locked = totalOrbsEver < sk.cost;
    b.className = 'skin' + (locked ? ' locked' : '') + (i === skinIndex ? ' active' : '');
    b.style.setProperty('--c', sk.body);
    b.innerHTML = locked ? `<span class="dot"></span><small>${sk.cost}</small>` : `<span class="dot"></span><small>${sk.name}</small>`;
    b.title = locked ? `${sk.name}: collect ${sk.cost} bugs in total to unlock` : sk.name;
    if (!locked) b.onclick = () => { skinIndex = i; localStorage.setItem('hop-skin', i); buildSkinSelect(); };
    skinSel.appendChild(b);
  });
  document.getElementById('orb-total').textContent = totalOrbsEver;
}
function buildLevelSelect() {
  buildSkinSelect();
  lvlSel.innerHTML = '';
  LEVELS.forEach((L, i) => {
    const b = document.createElement('button');
    b.className = 'lvl' + (i + 1 > unlocked ? ' locked' : '') + (i === levelIndex ? ' active' : '');
    const s = starsWon[i] || 0;
    b.innerHTML = `<span>${i + 1}</span><small>${'★'.repeat(s)}${'☆'.repeat(3 - s)}</small>`;
    b.title = L.name + (bestTimes[i] ? ` · best ${fmtTime(bestTimes[i])}` : '');
    if (i + 1 <= unlocked) b.onclick = () => startLevel(i);
    lvlSel.appendChild(b);
  });
}

// ---------- 12. Input ----------
const KEYMAP = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump' };
document.addEventListener('keydown', e => { if (KEYMAP[e.key]) { keys[KEYMAP[e.key]] = true;  e.preventDefault(); } });
document.addEventListener('keyup',   e => { if (KEYMAP[e.key]) { keys[KEYMAP[e.key]] = false; e.preventDefault(); } });
document.querySelectorAll('.pad').forEach(btn => {
  const k = btn.dataset.key;
  const press   = e => { keys[k] = true;  btn.classList.add('down');    e.preventDefault(); };
  const release = e => { keys[k] = false; btn.classList.remove('down'); e.preventDefault(); };
  btn.addEventListener('pointerdown', press);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => btn.addEventListener(ev, release));
});

document.getElementById("mute-btn").textContent = Music.muted ? "🔇" : "🔊";
document.getElementById("mute-btn").addEventListener("click", () => { Sfx.init(); Music.toggle(); });
document.addEventListener("keydown", e => {
  if (e.key === "m" || e.key === "M") Music.toggle();
  if (e.key === "p" || e.key === "P" || e.key === "Escape") setPaused(!paused);
});
document.getElementById('pause-btn').addEventListener('click', () => setPaused(!paused));
document.addEventListener('pointerdown', () => { userTapped = true; }, { once: true });
canvas.addEventListener('pointerdown', () => { if (paused) setPaused(false); });          // tap anywhere to resume
document.addEventListener("visibilitychange", () => {                                    // auto-pause when the app goes to the background
  if (document.hidden) setPaused(true);
  else if (Sfx.ctx && !paused) Sfx.ctx.resume();
});

document.getElementById('opt-lefty').addEventListener('click', () => { settings.lefty = !settings.lefty; localStorage.setItem('hop-lefty', settings.lefty ? '1' : '0'); applySettings(); });
document.getElementById('opt-size').addEventListener('click', () => { settings.bigButtons = !settings.bigButtons; localStorage.setItem('hop-bigbtn', settings.bigButtons ? '1' : '0'); applySettings(); });
for (const k of ['easy', 'slow', 'contrast']) document.getElementById('opt-' + k).addEventListener('click', () => { settings[k] = !settings[k]; localStorage.setItem('hop-' + k, settings[k] ? '1' : '0'); applySettings(); });

if (customMode) { ovSub.textContent = 'Custom level from the editor'; const ex = document.getElementById('exit-custom'); ex.style.display = 'inline'; ex.onclick = () => { localStorage.removeItem('hop-play-custom'); location.reload(); }; }

// Title screen: level 1 slowly scrolls behind the card while Pip idles
ovBtn.onclick = () => startLevel(0);
buildLevelSelect(); applySettings();
loadLevel(0); lives = 3; fade = 0; banner = 0; draw();
let idleLast = performance.now();
function idleLoop(now) {
  const dt = Math.min((now - idleLast) / 1000, 0.05); idleLast = now;
  if (!running) {
    time += dt;
    camX = (camX + 25 * dt) % Math.max(1, LEVEL_W - W);
    player.x = camX + 60; player.onGround = true;                                       // the grasshopper idles at the left of the screen
    const ic = Math.floor((player.x + player.w / 2) / TILE); let ir = 0; while (ir < ROWS && map[ir][ic] !== '#') ir++; player.y = ir * TILE - player.h;
    player.facing = 1;
    player.blink = player.blink > 0 ? player.blink - dt : (Math.random() < dt * 0.4 ? 0.12 : 0);
    for (const e of enemies) if (e.alive && e.type !== 'flit') { e.vy += GRAVITY * dt; moveBox(e, e.vx * dt, e.vy * dt); const ahead = Math.floor((e.vx > 0 ? e.x + e.w + 1 : e.x - 1) / TILE); if (e.hitWall || (e.onGround && !standable(ahead, Math.floor((e.y + e.h + 1) / TILE)))) e.vx = -e.vx; e.hitWall = false; }
    draw();
  }
  requestAnimationFrame(idleLoop);
}
requestAnimationFrame(idleLoop);
