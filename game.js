// =====================================================================
//  HOP: GLOWLANDS — a side-scrolling platformer
//  Hero "Pip" (a glowing blob) hops through twilight worlds gathering
//  orbs, squashing Grumps and reaching the portal at the end of each level.
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
//  #  solid ground     o  orb (collect)    e  Grump (walks)     f  Flit (flies)
//  ^  crystal spikes   P  player start     G  portal (goal)     .  air
//  =  one-way ledge (jump up through it)   %  crumbling block   ~  bounce pad
//  M  moving platform (side to side)       V  moving platform (up and down)
//  C  checkpoint lantern (respawn here once lit)
//  S  Thorn (spiky - cannot be stomped, jump over it)
//  D  double-jump orb (lasts the level)   H  shield (absorbs one hit)
//  B  breakable block (jump into it from below - hides an orb)   K  the Grump King (boss)
const LEVELS = [
  {
    name: 'Dusk Meadow',
    theme: {
      sky: ['#2a1b4e', '#ff8c6b'], stars: true, sun: '#ffd36e',
      far: '#3b2a6b', mid: '#2f4d5e', ground: '#3c3a55', groundTop: '#63c27a', groundDots: '#2e2c45',
      orb: '#ffd36e', hazard: '#d9e6ff', portal: '#8be9ff',
    },
    map: [
      "...............................................................................................................",
      "...............................................................................................................",
      ".............................................................................o.o...............................",
      ".......................o.o........................................o.o.o........................................",
      "......................#####......................................#######.......................................",
      "..........o.o..................o.o.o......................................................o.o.o................",
      ".........#####................#######...===.....o.o.o.....................o.o............#######...............",
      ".................................H.............#######..................#####..........................o.o.....",
      "..P.........e...............e................e.........C.....e................~......e......S........#####...G.",
      "###############....####################....########################....#########....##########################",
      "###############....####################....########################....#########....##########################",
    ],
  },
  {
    name: 'Crystal Caves',
    theme: {
      sky: ['#050a1c', '#0f2a4a'], stars: false, cave: true,
      far: '#0b1a33', mid: '#123457', ground: '#1e2f4d', groundTop: '#5fe0ff', groundDots: '#152540',
      orb: '#7df9ff', hazard: '#c6f3ff', portal: '#ff9de2',
    },
    map: [
      "###############################################################################################################",
      "...............................................................................................................",
      "...............................................................................................................",
      "...........................................f......o.o..........o.o.o.......................f...................",
      "...............o.o.........................................#######....................o.o......................",
      "..............#####................o.o.o........M.....................f.............#####........o.o.o.........",
      "......D...........................#######..................................######...............######.........",
      "..P.....................e........e.......S...e.........e..........e.............S.......e.............e........",
      "...................^^..............e..^^^..............^^...C...........e..^^^........................^^......G.",
      "#########%%%%##############....##################....##############%%%%##################....##################",
      "#########....##############....##################....##############....##################....##################",
    ],
  },
  {
    name: 'Dawn Islands',
    theme: {
      sky: ['#ff9a8b', '#ffe9c2'], stars: false, sun: '#fff3b0', clouds: true,
      far: '#f7b7a3', mid: '#d98a7a', ground: '#7a5c58', groundTop: '#8fdc7a', groundDots: '#5f4744',
      orb: '#ff6ea8', hazard: '#ffffff', portal: '#a58bff',
    },
    map: [
      "...............................................................................................................",
      "...............................................................................................................",
      "..................................o...................f....o.o.o.........................o.o.o.................",
      ".........................o.o.....###......................#####..................f.......#####.................",
      ".........o.o............#####..............o.o.o..........................o.o..................................",
      "........#####...............................#####.........................####.........................o.o.....",
      "..................f===......................................===.f.....................V.......f.......#####....",
      "......D........e.................S................H...........e.................e..............S........e......",
      "..P.~........o...^^..........e^^^............^^.C..........e.......^^^^.......^^.................^^......G...",
      "########.....########.....#############.....#########.....#############%%%%%#########.....####################",
      "########.....########.....#############.....#########.....#############.....####################################",
    ],
  },
{
    name: 'Twilight Hollow', track: 0,
    theme: {
      sky: ['#1a1238', '#c25a7a'], stars: true, sun: '#ffb56e',
      far: '#2a1d55', mid: '#243d4e', ground: '#33314b', groundTop: '#5bb372', groundDots: '#26243b',
      orb: '#ffd36e', hazard: '#d9e6ff', portal: '#8be9ff',
    },
    map: [
      "........................................................................................................................",
      "................................................o.o.o...................................................................",
      "........................................................o.o.o.o.o.....................o.o.o.............................",
      "........................o.o.o.............................#######.....................=====.........f...................",
      "........................#####.....................M.....................f...................o.o.o.o.....................",
      "..................o.o.o.......====....f.o.o.o.o.............BBB...........o.o.o.....V.......#######.........o.o.o.......",
      ".............D....#####...BB............#######...........................=====.............................#####.......",
      "....................................................................H...................................................",
      "..P.................e.....S.............C...e...........~...e...S...........e.............C....e..............e.S....G..",
      "############....###############....################%%%%############....############%%%%##############....###############",
      "############....###############....################....############....############....##############....###############",
    ],
  },
  {
    name: 'Deep Crystal', track: 1,
    theme: {
      sky: ['#0a0618', '#231447'], stars: false, cave: true,
      far: '#170e33', mid: '#2a1a55', ground: '#2b2250', groundTop: '#c77dff', groundDots: '#1e1740',
      orb: '#e0a6ff', hazard: '#f3d9ff', portal: '#7df9ff',
    },
    map: [
      "########################################################################################################################",
      "........................................................................................................................",
      "..........................................................o..o..o..o..o..o..o..o..o..o..o..o..o..o......................",
      "........................................................................................................................",
      "........................................................########################....BB###############...................",
      "..........................................................o.o.o.............o.o.........................................",
      "........................o.o.................o.o...........=====.............####..............o.o.......................",
      "........................####....M...........====....o.o.o.............f...........V...........====........o.o.o.........",
      "..................o.o.o.......f.....o.o.o...........#####.............o.o.o.............o.o.o.....f.......#####.........",
      "..................#####.............#####.............................#####.............#####...........................",
      "......D.......................................................H.........................................................",
      "..P.................e....S............e.C.^^...........e...........^^...e...S...........C...e...........^^..e...S....G..",
      "##########....###############....##############....##########%%%%################....############%%%%###################",
      "##########....###############....##############....##########....################....############....###################",
    ],
  },
  {
    name: 'Sky Reach', track: 2,
    theme: {
      sky: ['#5ab0ff', '#e8f6ff'], stars: false, sun: '#fff7c2', clouds: true,
      far: '#a9d4ff', mid: '#7fb6e8', ground: '#5d6d7e', groundTop: '#8fdc7a', groundDots: '#4a5868',
      orb: '#ffb3c6', hazard: '#ffffff', portal: '#ffd36e',
    },
    map: [
      "..........................................................................................",
      "............................................................o..o..o.......................",
      "....................................................................o.Ho..o...........G...",
      "............................................................M..........S.....V....########",
      "..............................................o.o.o.o.=====.........#######.......########",
      "....................................................................#######...............",
      "..............................................#######.....................................",
      "....................................o..o..o...#######.....................................",
      "......................................e..C................................................",
      "..............................f.....#######........................V......................",
      "..........................o..o..o...#######...............................................",
      "..........................................................o.o.o.o.o.......................",
      "....o.o.o.................#######.............................D...........................",
      "..P.......e.....S.........#######.........................#########.......................",
      "#####################.....................................#########.......................",
      "#####################.....................................................................",
    ],
  },
  {
    name: 'The Grump King', track: 3, boss: true,
    theme: {
      sky: ['#3a0f2e', '#ff5e62'], stars: true, sun: '#ff9e6e',
      far: '#4a1a3e', mid: '#3a2a4e', ground: '#3c2a45', groundTop: '#b06cff', groundDots: '#2a1c33',
      orb: '#ffd36e', hazard: '#d9e6ff', portal: '#8be9ff',
    },
    map: [
      "#............................#",
      "#............................#",
      "#............................#",
      "#............................#",
      "#.....o.o............o.o.....#",
      "#............................#",
      "#....=====..........=====....#",
      "#..................K.........#",
      "#..P.........................#",
      "##############################",
      "##############################",
    ],
  },
];
// A level made in editor.html? (opened with ?custom=1) - play it on its own, without touching saved progress
const customMode = localStorage.getItem("hop-play-custom") === "1" && !!localStorage.getItem("hop-custom-level");
if (customMode) {
  LEVELS.length = 0;
  LEVELS.push({ name: "Custom Level", track: 0, custom: true,
    theme: { sky: ["#2a1b4e", "#ff8c6b"], stars: true, sun: "#ffd36e", far: "#3b2a6b", mid: "#2f4d5e", ground: "#3c3a55", groundTop: "#63c27a", groundDots: "#2e2c45", orb: "#ffd36e", hazard: "#d9e6ff", portal: "#8be9ff" },
    map: JSON.parse(localStorage.getItem("hop-custom-level")) });
}
// put the levels in play order (world by world)
const ORDER = ['Dusk Meadow', 'Twilight Hollow', 'Crystal Caves', 'Deep Crystal', 'Dawn Islands', 'Sky Reach', 'The Grump King'];
if (!customMode) { LEVELS.sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name)); LEVELS[0].track = 0; LEVELS[2].track = 1; LEVELS[4].track = 2; }
// make every row the same length (pad with air)
for (const L of LEVELS) {
  const len = Math.max(...L.map.map(r => r.length));
  L.map = L.map.map(r => r.padEnd(len, '.'));
}

// ---------- 3. Tiny synthesized sound effects ----------
const Sfx = {
  ctx: null,
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
  tone(freqFrom, freqTo, dur, type = 'square', vol = 0.15) {
    if (!this.ctx || Music.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqFrom, t);
    osc.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t); osc.stop(t + dur);
  },
  jump()   { this.tone(300, 700, 0.15, 'square', 0.08); },
  pickup() { this.tone(880, 1600, 0.12, 'sine', 0.12); },
  stomp()  { this.tone(240, 60, 0.18, 'triangle', 0.2); },
  hurt()   { this.tone(220, 40, 0.4, 'sawtooth', 0.15); },
  win()    { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, f, 0.25, 'triangle', 0.15), i * 110)); },
  bounce() { this.tone(200, 900, 0.2, 'sine', 0.15); },
  crumble(){ this.tone(120, 50, 0.3, 'sawtooth', 0.08); },
  power()  { [660, 880, 1320].forEach((f, i) => setTimeout(() => this.tone(f, f * 1.2, 0.12, 'sine', 0.12), i * 70)); },
  shieldPop() { this.tone(900, 200, 0.25, 'triangle', 0.15); },
  checkpoint() { this.tone(660, 660, 0.1, 'triangle', 0.12); setTimeout(() => this.tone(990, 990, 0.18, 'triangle', 0.12), 100); },
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
  timer: null, step: 0, nextTime: 0, track: null, noise: null,
  muted: localStorage.getItem("hop-muted") === "1",
  start(i) {
    this.stop();
    if (!Sfx.ctx) return;
    this.track = TRACKS[(LEVELS[i].track ?? i) % TRACKS.length];
    this.step = 0; this.nextTime = Sfx.ctx.currentTime + 0.05;
    if (!this.noise) {                                   // one second of white noise for the hi-hat
      const buf = Sfx.ctx.createBuffer(1, Sfx.ctx.sampleRate, Sfx.ctx.sampleRate);
      const d = buf.getChannelData(0); for (let j = 0; j < d.length; j++) d[j] = Math.random() * 2 - 1;
      this.noise = buf;
    }
    this.timer = setInterval(() => this.schedule(), 25);
  },
  stop() { clearInterval(this.timer); this.timer = null; },
  toggle() {
    this.muted = !this.muted; localStorage.setItem("hop-muted", this.muted ? "1" : "0");
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
    osc.connect(f).connect(g).connect(ctxA.destination); osc.start(when); osc.stop(when + dur + 0.05);
  },
  kick(when) {
    const ctxA = Sfx.ctx, osc = ctxA.createOscillator(), g = ctxA.createGain();
    osc.frequency.setValueAtTime(150, when); osc.frequency.exponentialRampToValueAtTime(40, when + 0.12);
    g.gain.setValueAtTime(0.25, when); g.gain.exponentialRampToValueAtTime(0.001, when + 0.15);
    osc.connect(g).connect(ctxA.destination); osc.start(when); osc.stop(when + 0.16);
  },
  hat(when) {
    const ctxA = Sfx.ctx, src = ctxA.createBufferSource(), g = ctxA.createGain(), f = ctxA.createBiquadFilter();
    src.buffer = this.noise; f.type = "highpass"; f.frequency.value = 6000;
    g.gain.setValueAtTime(0.06, when); g.gain.exponentialRampToValueAtTime(0.001, when + 0.05);
    src.connect(f).connect(g).connect(ctxA.destination); src.start(when); src.stop(when + 0.06);
  },
};

// ---------- 4. Game state ----------
let levelIndex = 0, map, ROWS, COLS, LEVEL_W, LEVEL_H, theme, camY = 0, boss = null;
let player, enemies, orbs, spikes, portal, particles;
let pads, movers, checkpoints, crumbles;      // new tile types (phase 2)
let powerups;                                 // phase 3
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
  { name: 'Pip',   body: '#43d17a', dark: '#2e9d5a', face: '#1b4d2e', glow: '120,255,170', cost: 0 },
  { name: 'Ember', body: '#ff7a59', dark: '#c9503a', face: '#4a1a10', glow: '255,160,110', cost: 40 },
  { name: 'Frost', body: '#7df9ff', dark: '#3fb8c9', face: '#0e3a44', glow: '150,240,255', cost: 100 },
  { name: 'Berry', body: '#ff6ea8', dark: '#c9457f', face: '#4a1030', glow: '255,150,200', cost: 180 },
  { name: 'Gold',  body: '#ffd36e', dark: '#d4a03a', face: '#4a3200', glow: '255,220,130', cost: 300 },
];
let totalOrbsEver = Number(localStorage.getItem('hop-orbs-total') || 0);
let skinIndex = Math.min(SKINS.length - 1, Number(localStorage.getItem('hop-skin') || 0));
const skin = () => SKINS[skinIndex];
const settings = { lefty: localStorage.getItem('hop-lefty') === '1', bigButtons: localStorage.getItem('hop-bigbtn') === '1' };
function applySettings() {
  document.querySelector('.stage').classList.toggle('lefty', settings.lefty);
  document.querySelector('.stage').classList.toggle('bigbtn', settings.bigButtons);
  document.getElementById('opt-lefty').textContent = settings.lefty ? 'Left-handed' : 'Right-handed';
  document.getElementById('opt-size').textContent = settings.bigButtons ? 'Large buttons' : 'Normal buttons';
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
  pads = []; movers = []; checkpoints = []; crumbles = {}; powerups = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const ch = map[r][c], x = c * TILE, y = r * TILE;
    if (ch === 'P') spawnPlayer(x + 3, y);
    if (ch === 'S') enemies.push({ type: 'thorn', x: x + 3, y: y + 6, w: 26, h: 26, vx: -70, vy: 0, alive: true, squash: 0, seed: Math.random() * 6, spin: 0 });
    if (ch === 'D') powerups.push({ type: 'double', x: x + 6, y: y + 6, w: 20, h: 20, taken: false, seed: Math.random() * 6 });
    if (ch === 'H') powerups.push({ type: 'shield', x: x + 6, y: y + 6, w: 20, h: 20, taken: false, seed: Math.random() * 6 });
    if (ch === '~') pads.push({ x, y: y + 18, w: TILE, h: 14, anim: 0 });
    if (ch === 'C') checkpoints.push({ x: x + 8, y, w: 16, h: TILE, lit: false });
    if (ch === '%') crumbles[c + ',' + r] = { state: 'solid', t: 0 };
    if (ch === 'M') movers.push({ ox: x, oy: y, x, y, px: x, py: y, w: TILE * 3, h: 14, axis: 'x', range: TILE * 3, speed: 1.2, seed: c });
    if (ch === 'V') movers.push({ ox: x, oy: y, x, y, px: x, py: y, w: TILE * 2, h: 14, axis: 'y', range: TILE * 2.5, speed: 1.0, seed: c });
    if (ch === 'o') orbs.push({ x: x + 8, y: y + 8, w: 16, h: 16, taken: false, seed: Math.random() * 6 });
    if (ch === 'e') enemies.push({ type: 'grump', x, y: y + 8, w: 28, h: 24, vx: -60, vy: 0, alive: true, squash: 0, seed: Math.random() * 6 });
    if (ch === 'f') enemies.push({ type: 'flit', x, y, baseY: y, w: 26, h: 20, vx: -80, vy: 0, alive: true, squash: 0, seed: Math.random() * 6 });
    if (ch === 'G') portal = { x: x + 4, y: y - TILE + 4, w: 24, h: TILE * 2 - 8 };
    if (ch === 'K') boss = { x, y: y - 24, w: 64, h: 56, vx: 0, vy: 0, hp: 3, state: 'idle', t: 1.5, dir: -1, alive: true, jumpT: 3, flash: 0 };
    if (ch === '^') spikes.push({ x: x + 4, y: y + 14, w: TILE - 8, h: 18 });
  }
  totalOrbs = orbs.length + map.flat().filter(ch => ch === 'B').length; collected = 0;   // hidden orbs count too
  camX = Math.max(0, player.x - W / 2); camY = Math.max(0, Math.min(LEVEL_H - H, player.y - H / 2));
  banner = 2.2; fade = 1; finishing = 0; time = 0; levelTime = 0; shake = 0; timeScale = 1;
}

function spawnPlayer(x, y) {
  player = { x, y, w: 26, h: 30, vx: 0, vy: 0, onGround: false, facing: 1, startX: x, startY: y,
             sx: 1, sy: 1, coyote: 0, jumpBuf: 0, dead: 0, invuln: 0, blink: 0, wasGround: false, run: 0,
             hasDouble: false, doubleReady: true, shield: false };
}

function respawn() {
  const p = player;
  p.x = p.startX; p.y = p.startY; p.vx = 0; p.vy = 0; p.dead = 0; p.invuln = 1.5;
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
  } else if (finishing > 0) {
    finishing -= dt;
    p.sx += (0.2 - p.sx) * dt * 6; p.sy += (0.2 - p.sy) * dt * 6;       // shrink into the portal
    if (finishing <= 0) levelComplete();
  } else {
    p.vx = 0;
    if (keys.left)  { p.vx = -RUN_SPEED; p.facing = -1; }
    if (keys.right) { p.vx =  RUN_SPEED; p.facing =  1; }

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
        if (c && c.state === 'solid') { c.state = 'shaking'; c.t = 0.45; Sfx.crumble(); }
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
        c.lit = true; p.startX = c.x - 5; p.startY = c.y + TILE - p.h;
        Sfx.checkpoint(); burst(c.x + 8, c.y + 8, 14, theme.orb, 120, 0.7, 3);
      }
    }
    if (p.onGround && !p.wasGround) { p.sx = 1.3; p.sy = 0.7; dust(p.x + p.w / 2, p.y + p.h); }   // land squash
    p.wasGround = p.onGround;
    p.run = p.vx !== 0 && p.onGround ? p.run + dt * 14 : 0;
    p.invuln = Math.max(0, p.invuln - dt);
    p.blink = p.blink > 0 ? p.blink - dt : (Math.random() < dt * 0.4 ? 0.12 : 0);

    if (p.y > LEVEL_H + 80) { hurt(true); }

    for (const o of orbs) if (!o.taken && overlaps(p, o)) {
      o.taken = true; collected++; Sfx.pickup();
      burst(o.x + 8, o.y + 8, 10, theme.orb, 120, 0.5, 3);
    }
    for (const u of powerups) if (!u.taken && overlaps(p, u)) {
      u.taken = true; Sfx.power(); burst(u.x + 10, u.y + 10, 14, u.type === 'double' ? '#7df9ff' : '#8fb7ff', 130, 0.6, 3);
      if (u.type === 'double') p.hasDouble = true; else p.shield = true;
    }
    if (p.invuln <= 0) for (const s of spikes) if (overlaps(p, s)) { hurt(); break; }

    for (const e of enemies) {
      if (!e.alive || p.dead > 0) continue;
      if (overlaps(p, e)) {
        const stomping = e.type !== 'thorn' && p.vy > 0 && prevBottom <= e.y + 10;
        if (stomping) {
          e.alive = false; p.vy = -STOMP_BOUNCE; p.jumping = false; p.sx = 0.8; p.sy = 1.25;
          Sfx.stomp(); burst(e.x + e.w / 2, e.y + e.h / 2, 12, '#c98bff', 140, 0.5);
          shake = 4; buzz(30);
        } else if (p.invuln <= 0) { hurt(); }
      }
    }

    if (boss && boss.alive) bossCollide(p, prevBottom);
    if (portal && overlaps(p, portal)) {
      finishing = 0.6; timeScale = 0.35; p.vx = 0; Sfx.win(); buzz([30, 40, 30]);   // slow-motion finish
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
    if (e.type === 'grump' || e.type === 'thorn') {
      e.spin = (e.spin || 0) + e.vx * dt / 12;
      e.vy += GRAVITY * dt;
      moveBox(e, e.vx * dt, e.vy * dt);
      const aheadCol = Math.floor((e.vx > 0 ? e.x + e.w + 1 : e.x - 1) / TILE);
      const belowRow = Math.floor((e.y + e.h + 1) / TILE);
      if (e.hitWall || (e.onGround && !standable(aheadCol, belowRow))) e.vx = -e.vx;
    } else {                                                             // flit: floats in a sine wave
      moveBox(e, e.vx * dt, 0);
      if (e.hitWall) e.vx = -e.vx;
      e.y = e.baseY + Math.sin(time * 2.5 + e.seed) * 22;
    }
  }

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
  if (portal) drawPortal();
  if (boss) drawBoss();
  for (const o of orbs) if (!o.taken) drawOrb(o);
  for (const u of powerups) if (!u.taken) drawPowerup(u);
  for (const e of enemies) drawEnemy(e);
  if (player.dead <= 0) drawPlayer();
  for (const q of particles) {
    ctx.globalAlpha = Math.max(0, q.life / q.max);
    ctx.fillStyle = q.color; ctx.beginPath(); ctx.arc(q.x, q.y, q.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  drawHUD();
  if (fade > 0) { ctx.fillStyle = `rgba(4,6,24,${fade})`; ctx.fillRect(0, 0, W, H); }
  if (paused) {
    ctx.fillStyle = 'rgba(4,6,24,0.6)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffd36e'; ctx.textAlign = 'center'; ctx.font = 'bold 34px "Trebuchet MS", system-ui';
    ctx.fillText('PAUSED', W / 2, H / 2 - 6);
    ctx.fillStyle = '#fff'; ctx.font = '15px "Trebuchet MS", system-ui';
    ctx.fillText('Tap or press P to continue', W / 2, H / 2 + 24);
  }
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, theme.sky[0]); g.addColorStop(1, theme.sky[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  if (theme.stars) {
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 40; i++) {
      const x = (i * 97 + 13) % W, y = (i * 53 + 7) % (H * 0.6);
      ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(time * 1.5 + i));
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;
  }
  if (theme.sun) {
    const sx = 520 - camX * 0.05, sy = 90;
    const rg = ctx.createRadialGradient(sx, sy, 10, sx, sy, 90);
    rg.addColorStop(0, theme.sun); rg.addColorStop(0.3, theme.sun + '99'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rg; ctx.fillRect(sx - 100, sy - 100, 200, 200);
  }
  if (theme.clouds) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let i = 0; i < 8; i++) {
      const cx = ((i * 210 - camX * 0.15 + time * 8) % (W + 300) + W + 300) % (W + 300) - 150, cy = 50 + (i * 37) % 120;
      ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2); ctx.arc(cx + 24, cy - 8, 26, 0, Math.PI * 2); ctx.arc(cx + 50, cy, 20, 0, Math.PI * 2); ctx.fill();
    }
  }
  // far layer
  ctx.fillStyle = theme.far;
  if (theme.cave) {
    for (let i = 0; i < 14; i++) {                                       // hanging crystals
      const x = ((i * 120 - camX * 0.2) % (W + 200) + W + 200) % (W + 200) - 100;
      ctx.beginPath(); ctx.moveTo(x - 18, 0); ctx.lineTo(x + 18, 0); ctx.lineTo(x, 70 + (i * 29) % 60); ctx.fill();
    }
  } else {
    for (let i = 0; i < 7; i++) {                                        // rolling hills
      const x = ((i * 300 - camX * 0.2) % (W + 600) + W + 600) % (W + 600) - 300;
      ctx.beginPath(); ctx.arc(x, H + 20, 170, Math.PI, 0); ctx.fill();
    }
  }
  // mid layer
  ctx.fillStyle = theme.mid;
  for (let i = 0; i < 9; i++) {
    const x = ((i * 190 - camX * 0.45) % (W + 400) + W + 400) % (W + 400) - 200;
    if (theme.cave) { ctx.beginPath(); ctx.moveTo(x - 30, H); ctx.lineTo(x, H - 90 - (i * 41) % 70); ctx.lineTo(x + 30, H); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(x, H + 40, 110, Math.PI, 0); ctx.fill(); }
  }
}

function drawTiles() {
  const c0 = Math.max(0, Math.floor(camX / TILE)), c1 = Math.min(COLS - 1, c0 + W / TILE + 1);
  const r0 = Math.max(0, Math.floor(camY / TILE)), r1 = Math.min(ROWS - 1, r0 + H / TILE + 1);
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    const ch = map[r][c];
    let x = c * TILE, y = r * TILE;
    if (ch === '=') {                                                    // thin one-way ledge
      ctx.fillStyle = theme.groundTop; roundRect(x, y, TILE, 8, 3);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 2, y + 6, TILE - 4, 3);
      continue;
    }
    if (ch === '%') {                                                    // crumbling block
      const cr = crumbles[c + ',' + r];
      if (cr.state === 'gone') { ctx.globalAlpha = Math.max(0, 1 - cr.t / 0.4); if (cr.t > 0.4) { ctx.globalAlpha = 1; continue; } }
      if (cr.state === 'shaking') { x += (Math.random() - 0.5) * 3; y += (Math.random() - 0.5) * 3; }
      ctx.fillStyle = theme.ground; ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = theme.groundTop; ctx.fillRect(x, y, TILE, 5);
      ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 1.5; ctx.beginPath();   // cracks
      ctx.moveTo(x + 6, y + 8); ctx.lineTo(x + 14, y + 16); ctx.lineTo(x + 10, y + 26);
      ctx.moveTo(x + 24, y + 6); ctx.lineTo(x + 19, y + 15); ctx.lineTo(x + 26, y + 24); ctx.stroke();
      ctx.globalAlpha = 1;
      continue;
    }
    if (ch === 'B') {                                                    // breakable block: hit it from below
      ctx.fillStyle = theme.ground; roundRect(x + 1, y + 1, TILE - 2, TILE - 2, 5);
      ctx.strokeStyle = theme.orb + 'aa'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.strokeRect(x + 5, y + 5, TILE - 10, TILE - 10); ctx.setLineDash([]);
      ctx.fillStyle = theme.orb; ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(time * 3 + c)); ctx.beginPath(); ctx.arc(x + TILE / 2, y + TILE / 2, 3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      continue;
    }
    if (ch !== '#') continue;
    const top = r > 0 && !isSolid(c, r - 1), bottom = !isSolid(c, r + 1), left = !isSolid(c - 1, r), right = !isSolid(c + 1, r);
    ctx.fillStyle = theme.ground; ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = theme.groundDots;                                    // stone speckles
    if ((c * 7 + r * 13) % 3 === 0) ctx.fillRect(x + 6, y + 14, 6, 4);
    if ((c * 5 + r * 11) % 4 === 1) ctx.fillRect(x + 20, y + 22, 5, 5);
    if (top) {                                                           // mossy top with rounded ends
      ctx.fillStyle = theme.groundTop;
      ctx.beginPath();
      ctx.moveTo(x, y + 7); ctx.lineTo(x, y + (left ? 4 : 0)); ctx.quadraticCurveTo(x, y, x + (left ? 4 : 0), y);
      ctx.lineTo(x + TILE - (right ? 4 : 0), y); ctx.quadraticCurveTo(x + TILE, y, x + TILE, y + (right ? 4 : 0));
      ctx.lineTo(x + TILE, y + 7); ctx.lineTo(x + TILE - 8, y + 10); ctx.lineTo(x + 8, y + 8); ctx.closePath(); ctx.fill();
    }
    if (bottom) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x, y + TILE - 5, TILE, 5); }
    if (left)   { ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(x, y, 3, TILE); }
    if (right)  { ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(x + TILE - 3, y, 3, TILE); }
  }
}

function drawSpike(s) {
  ctx.fillStyle = theme.hazard;
  for (let i = 0; i < 3; i++) {
    const bx = s.x + i * 8;
    ctx.beginPath(); ctx.moveTo(bx, s.y + s.h); ctx.lineTo(bx + 4, s.y - 2); ctx.lineTo(bx + 8, s.y + s.h); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  for (let i = 0; i < 3; i++) { const bx = s.x + i * 8; ctx.beginPath(); ctx.moveTo(bx + 4, s.y - 2); ctx.lineTo(bx + 8, s.y + s.h); ctx.lineTo(bx + 4, s.y + s.h); ctx.fill(); }
}

function drawMover(m) {
  ctx.fillStyle = theme.ground; roundRect(m.x, m.y, m.w, m.h, 6);
  ctx.fillStyle = theme.groundTop; roundRect(m.x, m.y, m.w, 6, 3);
  ctx.fillStyle = theme.orb + '88';                                      // little glowing thrusters underneath
  for (let i = 0; i < m.w / TILE; i++) { ctx.beginPath(); ctx.arc(m.x + TILE * i + TILE / 2, m.y + m.h + 2 + Math.sin(time * 10 + i) * 1.5, 3, 0, Math.PI * 2); ctx.fill(); }
}

function drawPad(pad) {
  const squish = pad.anim > 0 ? 0.5 + pad.anim : 1;                     // squashes when used
  const cx = pad.x + TILE / 2, base = pad.y + pad.h;
  ctx.strokeStyle = '#c9d2ff'; ctx.lineWidth = 2; ctx.beginPath();     // spring coil
  for (let i = 0; i < 3; i++) { const yy = base - 3 - i * 4 * squish; ctx.moveTo(cx - 8, yy); ctx.lineTo(cx + 8, yy - 2 * squish); }
  ctx.stroke();
  ctx.fillStyle = theme.orb; roundRect(cx - 13, base - 14 * squish - 4, 26, 6, 3);   // pad top
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(cx - 9, base - 14 * squish - 3, 10, 2);
}

function drawLantern(c) {
  const cx = c.x + 8, top = c.y + 4;
  ctx.fillStyle = '#5a4a6a'; ctx.fillRect(cx - 2, top + 10, 4, TILE - 14);          // post
  ctx.fillStyle = '#7a6a8a'; ctx.fillRect(cx - 7, c.y + TILE - 4, 14, 4);            // base
  ctx.fillStyle = c.lit ? theme.orb : 'rgba(255,255,255,0.15)';
  if (c.lit) {
    const g = ctx.createRadialGradient(cx, top + 6, 2, cx, top + 6, 26);
    g.addColorStop(0, theme.orb + 'aa'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - 26, top - 20, 52, 52);
    ctx.fillStyle = theme.orb;
  }
  roundRect(cx - 6, top, 12, 14, 4);                                                  // glass
  ctx.fillStyle = c.lit ? '#fff' : 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(cx, top + 7 + (c.lit ? Math.sin(time * 6) : 0), 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5a4a6a'; ctx.fillRect(cx - 7, top - 3, 14, 3);                     // cap
}

function drawOrb(o) {
  const cx = o.x + 8, cy = o.y + 8 + Math.sin(time * 3 + o.seed) * 3;
  const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 16);
  g.addColorStop(0, theme.orb); g.addColorStop(0.4, theme.orb + '66'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(cx - 16, cy - 16, 32, 32);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = theme.orb; ctx.beginPath(); ctx.arc(cx, cy, 3.2, 0, Math.PI * 2); ctx.fill();
}

function drawPortal() {
  const cx = portal.x + portal.w / 2, cy = portal.y + portal.h / 2;
  const g = ctx.createRadialGradient(cx, cy, 5, cx, cy, 50);
  g.addColorStop(0, theme.portal + 'aa'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(cx - 50, cy - 50, 100, 100);
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = i === 0 ? '#fff' : theme.portal; ctx.lineWidth = 3 - i * 0.5;
    ctx.beginPath(); ctx.ellipse(cx, cy, 10 + i * 5, 24 + i * 5, Math.sin(time * 1.5 + i) * 0.25, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = theme.portal + '55'; ctx.beginPath(); ctx.ellipse(cx, cy, 8, 20, 0, 0, Math.PI * 2); ctx.fill();
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

function drawBoss() {
  const b = boss;
  if (!b.alive && b.t > 0.6) return;
  if (b.flash > 0 && Math.floor(b.flash * 14) % 2 === 0) return;         // flicker when hit
  const wob = b.state === 'charge' ? Math.sin(time * 14) * 0.05 : 0;
  const h = b.alive ? b.h * (1 + wob) : 16, w = b.w * (1 - wob);
  const x = b.x + (b.w - w) / 2, y = b.y + b.h - h;
  ctx.fillStyle = '#7d3fd6';
  ctx.beginPath(); ctx.moveTo(x, y + h); ctx.quadraticCurveTo(x, y, x + w / 2, y); ctx.quadraticCurveTo(x + w, y, x + w, y + h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.ellipse(x + w * 0.3, y + h * 0.25, 10, 5, -0.4, 0, Math.PI * 2); ctx.fill();
  if (b.alive) {
    const look = b.dir * 3;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + w * 0.35, y + h * 0.45, 8, 0, Math.PI * 2); ctx.arc(x + w * 0.65, y + h * 0.45, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a1050'; ctx.beginPath(); ctx.arc(x + w * 0.35 + look, y + h * 0.45, 4, 0, Math.PI * 2); ctx.arc(x + w * 0.65 + look, y + h * 0.45, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2a1050'; ctx.lineWidth = 3; ctx.beginPath();
    ctx.moveTo(x + w * 0.22, y + h * 0.28); ctx.lineTo(x + w * 0.44, y + h * 0.36); ctx.moveTo(x + w * 0.78, y + h * 0.28); ctx.lineTo(x + w * 0.56, y + h * 0.36); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w * 0.35, y + h * 0.72); ctx.lineTo(x + w * 0.65, y + h * 0.72); ctx.stroke();   // grumpy mouth
    ctx.fillStyle = '#fff'; for (let i = 0; i < 3; i++) ctx.fillRect(x + w * 0.4 + i * 6, y + h * 0.72, 4, 5);          // teeth
    // crown
    ctx.fillStyle = '#ffd36e'; ctx.beginPath();
    ctx.moveTo(x + w * 0.3, y + 4); ctx.lineTo(x + w * 0.3, y - 14); ctx.lineTo(x + w * 0.4, y - 4); ctx.lineTo(x + w * 0.5, y - 18);
    ctx.lineTo(x + w * 0.6, y - 4); ctx.lineTo(x + w * 0.7, y - 14); ctx.lineTo(x + w * 0.7, y + 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff5f7a'; ctx.beginPath(); ctx.arc(x + w * 0.5, y - 6, 3, 0, Math.PI * 2); ctx.fill();
    // health hearts
    for (let i = 0; i < 3; i++) drawHeart(x + w / 2 - 20 + i * 20, y - 32, i < b.hp ? '#ff5f7a' : 'rgba(255,255,255,0.25)');
  }
}

function drawEnemy(e) {
  if (!e.alive && e.squash > 0.4) return;
  if (e.type === 'thorn') {                                              // rolling spike ball
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(e.spin);
    ctx.fillStyle = '#3b2a4a';
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a - 0.25) * 9, Math.sin(a - 0.25) * 9); ctx.lineTo(Math.cos(a) * 17, Math.sin(a) * 17); ctx.lineTo(Math.cos(a + 0.25) * 9, Math.sin(a + 0.25) * 9); ctx.fill(); }
    ctx.fillStyle = '#6b3fa0'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#ffd36e'; ctx.beginPath(); ctx.arc(cx - 3, cy - 1, 2.5, 0, Math.PI * 2); ctx.arc(cx + 3, cy - 1, 2.5, 0, Math.PI * 2); ctx.fill();
    return;
  }
  if (e.type === 'grump') {
    const wob = e.alive ? Math.sin(time * 8 + e.seed) * 0.08 : 0;
    const h = e.alive ? e.h * (1 + wob) : 7, w = e.w * (1 - wob);
    const x = e.x + (e.w - w) / 2, y = e.y + e.h - h;
    ctx.fillStyle = '#9b5cff';
    ctx.beginPath(); ctx.moveTo(x, y + h); ctx.quadraticCurveTo(x, y, x + w / 2, y); ctx.quadraticCurveTo(x + w, y, x + w, y + h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(x + w * 0.35, y + h * 0.3, 5, 3, -0.4, 0, Math.PI * 2); ctx.fill();
    if (e.alive) {
      const look = e.vx > 0 ? 2 : -2;
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + w * 0.35, y + h * 0.5, 4, 0, Math.PI * 2); ctx.arc(x + w * 0.65, y + h * 0.5, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2a1050'; ctx.beginPath(); ctx.arc(x + w * 0.35 + look, y + h * 0.5, 2, 0, Math.PI * 2); ctx.arc(x + w * 0.65 + look, y + h * 0.5, 2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#2a1050'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + w * 0.25, y + h * 0.35); ctx.lineTo(x + w * 0.42, y + h * 0.42); ctx.moveTo(x + w * 0.75, y + h * 0.35); ctx.lineTo(x + w * 0.58, y + h * 0.42); ctx.stroke();  // angry brows
    }
  } else {
    const flap = Math.sin(time * 18 + e.seed) * 8;
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.moveTo(cx - 6, cy); ctx.lineTo(cx - 22, cy - 8 + flap); ctx.lineTo(cx - 10, cy + 6); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + 6, cy); ctx.lineTo(cx + 22, cy - 8 + flap); ctx.lineTo(cx + 10, cy + 6); ctx.fill();
    ctx.fillStyle = '#ff7a59'; ctx.beginPath(); ctx.ellipse(cx, cy, 11, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx + (e.vx > 0 ? 4 : -4), cy - 1, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#301020'; ctx.beginPath(); ctx.arc(cx + (e.vx > 0 ? 5.5 : -5.5), cy - 1, 2, 0, Math.PI * 2); ctx.fill();
  }
}

function drawPlayer() {
  const p = player;
  if (p.invuln > 0 && Math.floor(p.invuln * 12) % 2 === 0) return;     // flicker while invulnerable
  const cx = p.x + p.w / 2, bottom = p.y + p.h;
  ctx.save();
  ctx.translate(cx, bottom);
  ctx.scale(p.sx, p.sy);
  const bob = p.run ? Math.abs(Math.sin(p.run)) * 2 : 0;
  // glow
  const g = ctx.createRadialGradient(0, -p.h / 2, 4, 0, -p.h / 2, 34);
  const sk = skin();
  g.addColorStop(0, `rgba(${sk.glow},0.35)`); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(-40, -p.h - 20, 80, 80);
  // feet
  ctx.fillStyle = sk.dark;
  const step = p.run ? Math.sin(p.run) * 5 : 0;
  ctx.fillRect(-10 + step, -4, 8, 4); ctx.fillRect(2 - step, -4, 8, 4);
  // body
  const breathe = p.run || !p.onGround ? 0 : Math.sin(time * 3) * 0.6;
  ctx.fillStyle = sk.body;
  roundRect(-p.w / 2, -p.h + bob + breathe, p.w, p.h - bob - 2 - breathe, 11);
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.ellipse(-5, -p.h + 9 + bob, 6, 3, -0.5, 0, Math.PI * 2); ctx.fill();
  // antenna with glowing tip
  ctx.strokeStyle = sk.dark; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(2, -p.h + bob); ctx.quadraticCurveTo(4 + p.facing * 3, -p.h - 8, 6 * p.facing, -p.h - 10 + bob); ctx.stroke();
  ctx.fillStyle = '#ffd36e'; ctx.beginPath(); ctx.arc(6 * p.facing, -p.h - 11 + bob, 3.5, 0, Math.PI * 2); ctx.fill();
  // eyes
  const ex = p.facing * 5;
  if (p.blink > 0) {
    ctx.strokeStyle = sk.face; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ex - 6, -p.h + 12 + bob); ctx.lineTo(ex - 1, -p.h + 12 + bob); ctx.moveTo(ex + 2, -p.h + 12 + bob); ctx.lineTo(ex + 7, -p.h + 12 + bob); ctx.stroke();
  } else {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex - 3, -p.h + 12 + bob, 4, 0, Math.PI * 2); ctx.arc(ex + 5, -p.h + 12 + bob, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = sk.face; ctx.beginPath(); ctx.arc(ex - 3 + p.facing, -p.h + 12 + bob, 2, 0, Math.PI * 2); ctx.arc(ex + 5 + p.facing, -p.h + 12 + bob, 2, 0, Math.PI * 2); ctx.fill();
  }
  // smile
  ctx.strokeStyle = sk.face; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ex + 1, -p.h + 18 + bob, 3.5, 0.2, Math.PI - 0.2); ctx.stroke();
  if (p.shield) {                                                        // shield bubble
    ctx.strokeStyle = 'rgba(143,183,255,0.8)'; ctx.lineWidth = 2; ctx.fillStyle = 'rgba(143,183,255,0.15)';
    ctx.beginPath(); ctx.ellipse(0, -p.h / 2, p.w / 2 + 8, p.h / 2 + 8 + Math.sin(time * 5) * 1.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function drawHUD() {
  ctx.font = 'bold 15px "Trebuchet MS", system-ui';
  // lives pill
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; roundRect(10, 10, 96, 28, 14);
  for (let i = 0; i < 3; i++) drawHeart(30 + i * 24, 24, i < lives ? '#ff5f7a' : 'rgba(255,255,255,0.2)');
  // orbs pill
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; roundRect(W - 116, 10, 106, 28, 14);
  ctx.fillStyle = theme.orb; ctx.beginPath(); ctx.arc(W - 98, 24, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText(`${collected} / ${totalOrbs}`, W - 86, 29);
  // power-up icons next to the hearts
  let ix = 118;
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
  if (!paused) update(dt * timeScale);
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
  lives = 3;
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
  if (customMode) { showOverlay('Level Clear!', 'Custom level', `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}   Orbs ${collected} / ${totalOrbs}
Time ${fmtTime(levelTime)}`, 'Play Again', () => startLevel(0)); return; }
  starsWon[levelIndex] = Math.max(starsWon[levelIndex] || 0, stars);
  totalOrbsEver += collected; localStorage.setItem('hop-orbs-total', totalOrbsEver);
  localStorage.setItem('hop-stars', JSON.stringify(starsWon));
  const prevBest = bestTimes[levelIndex];
  const newBest = !prevBest || levelTime < prevBest;
  if (newBest) { bestTimes[levelIndex] = levelTime; localStorage.setItem('hop-best', JSON.stringify(bestTimes)); }
  const summary = `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}   Orbs ${collected} / ${totalOrbs}\nTime ${fmtTime(levelTime)}${newBest ? '  ✨ New best!' : `  (best ${fmtTime(prevBest)})`}`;
  if (next < LEVELS.length) {
    unlocked = Math.max(unlocked, next + 1); localStorage.setItem('hop-unlocked', unlocked);
    showOverlay('Level Clear!', LEVELS[levelIndex].name, summary, 'Next Level', () => startLevel(next));
  } else {
    showOverlay('You did it!', 'All levels complete', summary, 'Play Again', () => startLevel(0));
  }
}
function gameOver() {
  running = false; Music.stop();
  showOverlay('Game Over', LEVELS[levelIndex].name, `Orbs: ${collected} / ${totalOrbs}`, 'Try Again', () => startLevel(levelIndex));
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
    b.title = locked ? `${sk.name}: collect ${sk.cost} orbs in total to unlock` : sk.name;
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
    player.x = camX + 60; player.y = 8 * TILE + 2; player.onGround = true;              // Pip idles at the left of the screen
    player.blink = player.blink > 0 ? player.blink - dt : (Math.random() < dt * 0.4 ? 0.12 : 0);
    for (const e of enemies) if (e.alive && e.type !== 'flit') { e.vy += GRAVITY * dt; moveBox(e, e.vx * dt, e.vy * dt); const ahead = Math.floor((e.vx > 0 ? e.x + e.w + 1 : e.x - 1) / TILE); if (e.hitWall || (e.onGround && !standable(ahead, Math.floor((e.y + e.h + 1) / TILE)))) e.vx = -e.vx; e.hitWall = false; }
    draw();
  }
  requestAnimationFrame(idleLoop);
}
requestAnimationFrame(idleLoop);
