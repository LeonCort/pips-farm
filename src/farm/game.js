(function () {
'use strict';
const $ = (id) => document.getElementById(id);
const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function hash(x, y, z) { const h = Math.sin(x * 127.1 + (y || 0) * 311.7 + (z || 0) * 74.7) * 43758.5453123; return h - Math.floor(h); }
function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
function smooth(a, b, x) { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
function fmt(n) { n = Math.floor(n); if (n < 10000) return String(n); if (n < 1e6) return (n / 1000).toFixed(n < 1e5 ? 1 : 0) + 'k'; return (n / 1e6).toFixed(1) + 'M'; }

/* the low-poly reference palette */
const PAL = { seaDeep: '#1f6a80', sea: '#2e8f9c', seaShallow: '#63bfb4', sand: '#ecd3a0', bed: '#c9b99a', grass: '#a5bf66', meadow: '#86ad5c', forest: '#5d9160', pine: '#3f7d62', leaf: '#74a857', ochre: '#e0a646', rock: '#a3929b', snow: '#fffbf4', trunk: '#7d5e4e', cloud: '#fff8ef', cloudBase: '#c8c4dc', paper: '#fff6e4', ink: '#22303c', accent: '#e9684a', blush: '#f0907a', haze: '#f8dcc0' };

/* ---------- rules ---------- */
const ITEMS = { egg: { value: 1 }, apple: { value: 2 }, milk: { value: 4 }, cake: { value: 8 } };
const SPOT = {
  hen: [[-3, -0.3], [-4.4, -0.3], [-3, 1.5], [-4.4, 1.5], [-5.8, -0.3], [-5.8, 1.5]],
  tree: [[-1.0, -3.4], [0.9, -3.7], [-2.9, -3.9]],
  cow: [[-6.4, -3.7], [-4.8, -4.3]],
  helper: [[2.3, 2.7], [4.9, 2.8]],
  sign: [[8.3, 0.6], [9.7, 0.6], [9.4, -4.3]]
};
const COUNTER = { x: 3.6, z: 0.4 }, DROP = { x: 3.6, z: 1.65 }, MONEY = { x: 1.5, z: 1.9 };
const BAKERY = { x: 6.6, z: -3.6 }, B_IN = { x: 5.6, z: -2.3 }, B_OUT = { x: 7.6, z: -2.3 };
const PADS = [
  { id: 'hen2', kind: 'hen', i: 1, cost: 8 }, { id: 'hen3', kind: 'hen', i: 2, cost: 20 }, { id: 'sign1', kind: 'sign', i: 0, cost: 30 },
  { id: 'tree1', kind: 'tree', i: 0, cost: 40 }, { id: 'stall-egg', kind: 'stall', t: 'egg', cost: 60 }, { id: 'hen4', kind: 'hen', i: 3, cost: 70 },
  { id: 'tree2', kind: 'tree', i: 1, cost: 110 }, { id: 'stock-egg', kind: 'stock', t: 'egg', cost: 160 }, { id: 'cow1', kind: 'cow', i: 0, cost: 200 },
  { id: 'sell-egg', kind: 'seller', t: 'egg', cost: 260 }, { id: 'stall-apple', kind: 'stall', t: 'apple', cost: 320 },
  { id: 'helper1', kind: 'helper', i: 0, cost: 380 }, { id: 'hen5', kind: 'hen', i: 4, cost: 450 }, { id: 'stock-apple', kind: 'stock', t: 'apple', cost: 520 },
  { id: 'sign2', kind: 'sign', i: 1, cost: 550 }, { id: 'cow2', kind: 'cow', i: 1, cost: 650 }, { id: 'sell-apple', kind: 'seller', t: 'apple', cost: 750 },
  { id: 'bakery', kind: 'bakery', cost: 900 }, { id: 'stall-milk', kind: 'stall', t: 'milk', cost: 1000 },
  { id: 'cashier', kind: 'cashier', cost: 1300 }, { id: 'stock-milk', kind: 'stock', t: 'milk', cost: 1500 }, { id: 'tree3', kind: 'tree', i: 2, cost: 1800 },
  { id: 'sell-milk', kind: 'seller', t: 'milk', cost: 1900 }, { id: 'sign3', kind: 'sign', i: 2, cost: 2000 },
  { id: 'hen6', kind: 'hen', i: 5, cost: 2400 }, { id: 'stall-cake', kind: 'stall', t: 'cake', cost: 2600 },
  { id: 'helper2', kind: 'helper', i: 1, cost: 3200 }, { id: 'stock-cake', kind: 'stock', t: 'cake', cost: 3600 }, { id: 'sell-cake', kind: 'seller', t: 'cake', cost: 4200 }
];
/* one stall per product: buy the stall, then a robot that stocks it, then a seller who takes the money */
const STALL_AT = { egg: [-4.2, 4.5], apple: [-1.1, 4.5], milk: [2.0, 4.5], cake: [7.3, 4.5] };
const stallDrop = (t) => [STALL_AT[t][0], STALL_AT[t][1] + 1.25];
const UPS = [
  { id: 'speed', base: 15, g: 1.8, max: 8 }, { id: 'bag', base: 20, g: 1.8, max: 8 },
  { id: 'farm', base: 30, g: 1.9, max: 8 }, { id: 'guests', base: 40, g: 1.9, max: 8 }
];
function padPos(p) {
  if (p.kind === 'bakery') return [BAKERY.x, BAKERY.z + 1.9];
  if (p.kind === 'cashier') return [5.7, 1.7];
  if (p.kind === 'sign') return SPOT.sign[p.i];
  if (p.kind === 'stall') return stallDrop(p.t);
  if (p.kind === 'stock') return [STALL_AT[p.t][0] - 1.3, STALL_AT[p.t][1] + 0.9];
  if (p.kind === 'seller') return [STALL_AT[p.t][0] + 1.3, STALL_AT[p.t][1] + 0.9];
  const s = SPOT[p.kind][p.i]; return p.kind === 'hen' || p.kind === 'helper' ? s : [s[0], s[1] + 1.2];
}
let state = null;
function fresh() { return { v: 1, coins: 0, total: 0, paid: {}, owned: { hen1: true }, lv: { speed: 0, bag: 0, farm: 0, guests: 0 }, sound: true, moved: false }; }
const own = (id) => !!state.owned[id];
const speed = () => 3.0 + 0.45 * state.lv.speed;
const cap = () => 4 + 2 * state.lv.bag;
const farm = () => 1 + 0.25 * state.lv.farm;
const upCost = (u) => Math.round(u.base * Math.pow(u.g, state.lv[u.id]));
function nextPad() { for (const p of PADS) if (!own(p.id)) return p; return null; }

/* ---------- sound: the supplied kit ---------- */
const Snd = {
  ctx: null, k: null, base: 0, out: null, until: 0, last: {},
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try { const A = window.AudioContext || window.webkitAudioContext; this.ctx = new A(); this.out = this.ctx.createGain(); this.out.gain.value = state.sound ? 1 : 0; this.out.connect(this.ctx.destination); this.k = window.SOUND.kit(this.ctx, { dest: this.out }); this.base = this.ctx.currentTime; } catch (e) { this.ctx = null; this.k = null; }
  },
  set(on) { if (this.out) this.out.gain.value = on ? 1 : 0; },
  /* recorded animal sounds (made with ElevenLabs, packed into the page), decoded the first time each one plays */
  buf: {}, busy: {},
  animal(name, o) {
    const src = window.PIPS_SFX && window.PIPS_SFX[name]; if (!this.ctx || !src) return; o = o || {};
    const n = performance.now(); if (o.gap && n - (this.last['a:' + name] || 0) < o.gap) return; this.last['a:' + name] = n;
    const go = (b) => { try { const s = this.ctx.createBufferSource(), g = this.ctx.createGain(); s.buffer = b; s.playbackRate.value = o.rate || 1; g.gain.value = o.gain == null ? 0.8 : o.gain; s.connect(g); g.connect(this.out); s.start(this.ctx.currentTime + 0.02 + (o.delay || 0)); } catch (e) {} };
    if (this.buf[name]) { go(this.buf[name]); return; }
    if (this.busy[name]) return; this.busy[name] = true;
    try { const bin = atob(src), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); this.ctx.decodeAudioData(u.buffer, (b) => { this.buf[name] = b; go(b); }, () => {}); } catch (e) {}
  },
  play(name, o, delay, gap) { if (!this.k) return; const n = performance.now(); if (gap && n - (this.last[name] || 0) < gap) return; this.last[name] = n; try { this.k.play(name, this.ctx.currentTime - this.base + 0.02 + (delay || 0), o || {}); } catch (e) {} },
  /* situational soundtrack: three looping tracks, one heard at a time.
     Each track has a level x (0..1) that walks toward 1 if it is the wanted track and toward 0 if not, over 1.5 s.
     Gain is sin(x * pi/2), so a crossfade keeps equal loudness; when the wanted track changes mid-fade, every level
     simply turns round from where it is, so nothing is left queued, stuck or doubled up. A track that reaches 0 is stopped. */
  MUSIC: { pastoral: ['audio/pastoral-loop.mp3', 111.70694], coin: ['audio/bouncing-coin.mp3', 150.04], relaxed: ['audio/relaxed-pulse.mp3', 146.74245] },
  FADE: 1.5, musVol: 0.55, musWant: null, mus: {}, pre: false, tracks: null,
  loadTrack(id) {
    const m = this.mus[id] = { st: 'loading', x: 0, buf: null, src: null, g: null, pos: 0, t0: 0, a: 0, len: 0 };
    fetch(this.MUSIC[id][0]).then((r) => { if (!r.ok) throw new Error('no music'); return r.arrayBuffer(); })
      .then((b) => new Promise((ok, bad) => this.ctx.decodeAudioData(b, ok, bad)))
      .then((buf) => {
        /* skip the few silent samples an mp3 encoder puts in front, then loop exactly one cycle of the track */
        const d = buf.getChannelData(0), sr = buf.sampleRate; let i0 = 0; while (i0 < 2048 && Math.abs(d[i0]) < 1e-3) i0++;
        m.a = i0 / sr; m.len = Math.min(this.MUSIC[id][1], buf.duration - m.a); m.buf = buf; m.st = 'ready';
      })
      .catch(() => { m.st = 'failed'; setTimeout(() => { if (this.mus[id] === m) delete this.mus[id]; }, 20000); }); /* try again later, e.g. after being offline */
  },
  startTrack(m) {
    try {
      const src = this.ctx.createBufferSource(), g = this.ctx.createGain(); src.buffer = m.buf; src.loop = true; src.loopStart = m.a; src.loopEnd = m.a + m.len;
      g.gain.value = 0; src.connect(g); g.connect(this.out); src.start(0, m.a + (m.pos % m.len)); m.src = src; m.g = g; m.t0 = this.ctx.currentTime - (m.pos % m.len);
    } catch (e) { m.st = 'failed'; }
  },
  stopTrack(m) {
    m.pos = (this.ctx.currentTime - m.t0) % m.len; /* remember where it was, so coming back carries on from there */
    try { m.src.stop(); m.src.disconnect(); m.g.disconnect(); } catch (e) {}
    m.src = null; m.g = null;
  },
  /* called every frame with the track the game wants right now ('pastoral', 'coin' or 'relaxed') */
  musicStep(dt, want) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.musWant = want;
    if (!this.mus[want]) this.loadTrack(want);
    /* once the first tune plays, quietly load the others this island uses, so later switches start straight away */
    if (!this.pre && this.mus[want].st === 'ready') { this.pre = true; setTimeout(() => (this.tracks || []).forEach((id) => { if (!this.mus[id]) this.loadTrack(id); }), 4000); }
    const step = Math.min(dt, 0.25) / this.FADE, now = this.ctx.currentTime;
    for (const id in this.mus) {
      const m = this.mus[id]; if (m.st !== 'ready') continue;
      const on = id === want;
      m.x = Math.max(0, Math.min(1, m.x + (on ? step : -step)));
      if (on && !m.src) this.startTrack(m);
      if (!m.src) continue;
      if (!on && m.x <= 0) { this.stopTrack(m); continue; }
      m.g.gain.setTargetAtTime(this.musVol * Math.sin(m.x * Math.PI / 2), now, 0.03);
    }
  }
};

/* ---------- world ---------- */
const T = window.THREE;
const wrap = $('scene'), canvas = $('gl');
if (!T) { $('nogl').hidden = false; return; }
let renderer; try { renderer = new T.WebGLRenderer({ canvas, antialias: true }); } catch (e) { $('nogl').hidden = false; return; }
/* battery: a lower pixel ratio and a frame cap the player picks in settings (20, 30 or 60 per second) */
const FPS_OPTS = [30, 60, 20]; let fpsCap = 30; try { const v = +localStorage.getItem('pips-fps'); if (FPS_OPTS.includes(v)) fpsCap = v; } catch (e) {}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, fpsCap === 20 ? 1 : 1.5)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
const sc = new T.Scene(); sc.background = new T.Color(PAL.haze); sc.fog = new T.Fog(PAL.haze, 28, 70);
const cam = new T.PerspectiveCamera(36, 1, 0.5, 300);
const HERE_T = typeof DIET !== 'undefined' ? 'farm' : 'shop';
const MAT = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 });
const _h = {};
function tone(hex, key, amt) { amt = amt == null ? 1 : amt; const c = new T.Color(hex); c.getHSL(_h); c.setHSL(_h.h + (hash(key, 1.3) - 0.5) * 0.03 * amt, clamp(_h.s * (1 + (hash(key, 7.7) - 0.5) * 0.22 * amt), 0, 1), clamp(_h.l * (1 + (hash(key, 13.1) - 0.5) * 0.15 * amt), 0, 1)); return c; }
function jit(geo, amt, seed) { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const k = Math.round(p.getX(i) * 500) * 0.731 + Math.round(p.getY(i) * 500) * 1.913 + Math.round(p.getZ(i) * 500) * 3.377 + (seed || 1) * 17.17; p.setXYZ(i, p.getX(i) + (hash(k, 1) - 0.5) * 2 * amt, p.getY(i) + (hash(k, 2) - 0.5) * 2 * amt, p.getZ(i) + (hash(k, 3) - 0.5) * 2 * amt); } return geo; }
function fac(src, paint, seed) {
  const g = src.index ? src.toNonIndexed() : src, p = g.attributes.position, n = p.count, col = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 3) { const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, cy = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3; const c = typeof paint === 'function' ? paint(cx, cy, cz, i / 3) : tone(paint, cx * 31.1 + cy * 53.3 + cz * 77.7 + (seed || 0)); for (let k = 0; k < 3; k++) { col[(i + k) * 3] = c.r; col[(i + k) * 3 + 1] = c.g; col[(i + k) * 3 + 2] = c.b; } }
  g.setAttribute('color', new T.BufferAttribute(col, 3)); g.computeVertexNormals(); return smoothGeo(g);
}
/* cozy look: soft shading. Corners sharper than about 62 degrees stay crisp (boxes, roofs); rounder shapes get smooth
   normals, and the colour of neighbouring faces is blended so the mosaic turns into soft gradients. Done once at build time. */
const CREASE = Math.cos(62 * Math.PI / 180);
function smoothGeo(g) {
  const p = g.attributes.position.array, nA = g.attributes.normal.array, cA = g.attributes.color ? g.attributes.color.array : null, n = p.length / 3;
  const fn = Float32Array.from(nA), oc = cA ? Float32Array.from(cA) : null, map = new Map();
  for (let i = 0; i < n; i++) { const k = Math.round(p[i * 3] * 1000) + ',' + Math.round(p[i * 3 + 1] * 1000) + ',' + Math.round(p[i * 3 + 2] * 1000); const L = map.get(k); if (L) L.push(i); else map.set(k, [i]); }
  for (const L of map.values()) { if (L.length < 2) continue;
    for (const i of L) { let nx = 0, ny = 0, nz = 0, r = 0, gg = 0, b = 0, c = 0; const a = i * 3;
      for (const j of L) { const q = j * 3; if (fn[a] * fn[q] + fn[a + 1] * fn[q + 1] + fn[a + 2] * fn[q + 2] < CREASE) continue; nx += fn[q]; ny += fn[q + 1]; nz += fn[q + 2]; if (oc) { r += oc[q]; gg += oc[q + 1]; b += oc[q + 2]; c++; } }
      const l = Math.hypot(nx, ny, nz); if (l > 0) { nA[a] = nx / l; nA[a + 1] = ny / l; nA[a + 2] = nz / l; } if (oc && c) { cA[a] = r / c; cA[a + 1] = gg / c; cA[a + 2] = b / c; } } }
  return g;
}
function part(geo, parent, x, y, z, noShadow) { const m = new T.Mesh(geo, MAT); m.position.set(x || 0, y || 0, z || 0); m.castShadow = !noShadow; m.receiveShadow = true; parent.add(m); return m; }
const ico = (r, d, seed, j) => jit(new T.IcosahedronGeometry(r, d), j == null ? r * 0.12 : j, seed);
const ink = new T.MeshBasicMaterial({ color: PAL.ink });

/* a smaller shadow map on the farm: blurrier, softer shadow edges (and cheaper) */
const HERE_SHADOW = HERE_T === 'farm' ? 640 : 1024;
sc.add(new T.HemisphereLight(0xc4d6f2, 0xa8a070, 0.6));
const sun = new T.DirectionalLight(0xffd6a0, 1.05); sun.position.set(-11, 9, 7.5); sun.castShadow = true; sun.shadow.mapSize.set(HERE_SHADOW, HERE_SHADOW);
Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 12, bottom: -12, near: 1, far: 50 }); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sc.add(sun); sc.add(sun.target);
const sky = new T.Mesh(new T.SphereGeometry(150, 32, 16), new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: new T.Color('#7db7dd') }, hor: { value: new T.Color('#ffe2c4') } }, vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: 'varying vec3 vD; uniform vec3 top; uniform vec3 hor; void main(){ float y = max(normalize(vD).y, 0.0); gl_FragColor = vec4(mix(hor, top, pow(y, 0.55)), 1.0); }' })); sc.add(sky);

/* ground: a flat farm plateau that drops to the sea at the edges */
/* the farm is a round town island (an ellipse with a wavy coast and a little point for the lighthouse); the shop is still the old block */
const ISL = { a: 24, b: 15 };
function isleD(x, z) { const u = x / ISL.a, v = z / ISL.b, th = Math.atan2(v, u), dth = th - 1.0;
  return Math.hypot(u, v) / (1 + 0.035 * Math.sin(3 * th + 1) + 0.025 * Math.sin(5 * th + 2.2) + 0.022 * Math.sin(8 * th + 0.4) + 0.07 * Math.exp(-dth * dth / 0.012)); }
function hAt(x, z) { if (HERE_T === 'farm') { const d = isleD(x, z); return d < 1 ? 0 : -Math.min(1.6, (d - 1) * 12); } const d = Math.max(Math.abs(x) / 11, Math.abs(z) / 7.6); return d < 1 ? 0 : -Math.min(1.6, (d - 1) * 7); }
/* roads: 0 grass, 1 dirt road, 2 cobbles */
function segD(x, z, x0, z0, x1, z1) { const dx = x1 - x0, dz = z1 - z0, t = clamp(((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz), 0, 1); return Math.hypot(x - x0 - dx * t, z - z0 - dz * t); }
const RING = { rx: 8, rz: 7.6 };
const ROADS = [ /* x0, z0, x1, z1, half width, kind */
  [-3.2, 0, -12.6, 0, 0.62, 1], [-12.6, -7.4, -12.6, 7.4, 0.68, 1], /* west to the farmyard, and the farm lane */
  [3.2, 0, 8, 0, 0.62, 1], [8, 0, 22.4, 0, 0.95, 2], /* east, then the cobbled market street */
  [0, 3.2, 0, 13.4, 0.62, 1], /* south to the harbour */
  [0, -7.6, 0, -9.0, 0.62, 1], /* north to the meadow */
  [-5.66, 5.37, -4.9, 8.7, 0.55, 1] /* south-west to the pond */
];
function roadKind(x, z) {
  if (HERE_T !== 'farm') return (Math.abs(z + 1.5) < 0.55 && x > 4.4) || (Math.abs(x - 3.6) < 0.5 && z > 1 && z < 7) ? 1 : 0;
  if (Math.hypot(x, z) < 3.5) return 2;
  let k = 0; for (const r of ROADS) if (segD(x, z, r[0], r[1], r[2], r[3]) < r[4]) { if (r[5] === 2) return 2; k = 1; }
  if (k) return k;
  const e = Math.hypot(x / RING.rx, z / RING.rz); if (Math.abs(e - 1) * 7.8 < 0.62) return 1;
  return 0;
}
const ROAD_COL = ['', PAL.sand, '#dcc7a2'], ROAD_AMT = [0.9, 0.6, 1.0];
/* keep a target point on the island */
function onIsle(v) { if (inHouse) { v.x = clamp(v.x, IN_B.x0, IN_B.x1); v.z = clamp(v.z, IN_B.z0, IN_B.z1); return v; }
  if (HERE_T !== 'farm') { v.x = clamp(v.x, ISLE.x0, ISLE.x1); v.z = clamp(v.z, ISLE.z0, ISLE.z1); return v; }
  if (Math.abs(v.x - DOCK.x) < 0.6 && v.z > DOCK.edge - 1 && v.z < DOCK.z1 + 1) { v.x = clamp(v.x, DOCK.x - 0.35, DOCK.x + 0.35); v.z = Math.min(v.z, DOCK.z1 - 0.3); return v; } /* out along the dock */
  const d = isleD(v.x, v.z), lim = 0.965; if (d > lim) { v.x *= lim / d; v.z *= lim / d; } return v; }
const tg = HERE_T === 'farm' ? new T.PlaneGeometry(58, 40, 112, 78) : new T.PlaneGeometry(36, 28, 48, 38); tg.rotateX(-Math.PI / 2);
{ const p = tg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + (hash(i, 1) - 0.5) * 0.3, z = p.getZ(i) + (hash(i, 2) - 0.5) * 0.3; p.setXYZ(i, x, hAt(x, z) + (hAt(x, z) === 0 ? hash(i, 5) * 0.04 : 0), z); } }
/* cozy ground (farm): soft grass gradients in the vertex colours, and the roads, pebbles, cobbles and painted grass strokes
   in two textures made once at start, so the paths get round, overgrown edges instead of triangle steps */
const GRASS_WARM = new T.Color('#d9c45a');
function vkey(x, y, z) { return Math.round(x * 8) * 7.31 + Math.round(z * 8) * 3.17 + Math.round(y * 8) * 1.13; }
function grassAt(x, z, base, key, warm) { const c = tone(base, key, 0.35); const n = 0.5 + 0.5 * Math.sin(x * 0.23 + Math.sin(z * 0.31) * 1.7) * Math.cos(z * 0.19 - x * 0.07), m = 0.5 + 0.5 * Math.sin(x * 0.61 + z * 0.47 + Math.sin(x * 0.2) * 2);
  c.lerp(GRASS_WARM, (warm == null ? 1 : warm) * (0.04 + 0.26 * n * n)); c.multiplyScalar(0.88 + 0.14 * m); return c; }
const WET_SAND = new T.Color('#b79a70');
/* the coast: grass softens into sand over a ragged band, and the sand darkens where the waves wet it */
function groundCol(x, y, z, key, grass, beach, warm) {
  if (y < -0.6) return tone(PAL.bed, key, 0.4);
  if (y < -0.05) { const c = tone(beach || PAL.sand, key, 0.4); return c.lerp(WET_SAND, 0.5 * clamp((-y - 0.08) / 0.3, 0, 1)); }
  const c = grassAt(x, z, grass || PAL.grass, key, warm); if (HERE_T !== 'farm') return c;
  const d = isleD(x, z) + 0.012 * Math.sin(x * 1.7 + z * 0.9) + 0.008 * Math.sin(x * 4.1 - z * 3.3), q = clamp((d - 0.925) / 0.05, 0, 1);
  return q > 0 ? c.lerp(tone(beach || PAL.sand, key, 0.4), q * q * (3 - 2 * q)) : c;
}
function repaintV(mesh, paint) { const p = mesh.geometry.attributes.position, col = mesh.geometry.attributes.color; if (!col) return; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), c = paint(x, y, z, vkey(x, y, z)); col.setXYZ(i, c.r, c.g, c.b); } col.needsUpdate = true; }
const GU = { path: { value: new T.Color(PAL.sand) }, cob: { value: new T.Color('#dcc7a2') }, mask: { value: null }, det: { value: null } };
let ground, GMASK = null; /* GMASK: road kind per mask pixel */
if (HERE_T === 'farm') {
  const gm = new T.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
  gm.onBeforeCompile = (sh) => {
    sh.uniforms.gMask = GU.mask; sh.uniforms.gDet = GU.det; sh.uniforms.pathCol = GU.path; sh.uniforms.cobCol = GU.cob;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vGuv;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvGuv = vec2((position.x + 29.0) / 58.0, (position.z + 20.0) / 40.0);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vGuv; uniform sampler2D gMask; uniform sampler2D gDet; uniform vec3 pathCol; uniform vec3 cobCol;')
      .replace('#include <color_fragment>', 'vec4 gmk = texture2D(gMask, vGuv); vec3 gdt = texture2D(gDet, vGuv).rgb; vec3 gcl = mix(vColor, pathCol, gmk.r); gcl = mix(gcl, cobCol, gmk.g); diffuseColor.rgb *= gcl * gdt * 1.02;');
  };
  ground = new T.Mesh(fac(tg, (cx, cy, cz, i) => groundCol(cx, cy, cz, i)), gm); ground.receiveShadow = true; sc.add(ground);
  repaintV(ground, (x, y, z, k) => groundCol(x, y, z, k));
  paintGroundTex();
} else { ground = part(fac(tg, (cx, cy, cz, i) => cy < -0.6 ? tone(PAL.bed, i) : cy < -0.05 ? tone(PAL.sand, i) : roadKind(cx, cz) ? tone(ROAD_COL[roadKind(cx, cz)], i, ROAD_AMT[roadKind(cx, cz)]) : tone(PAL.grass, i, 0.9)), sc); ground.castShadow = false; }
/* world (x, z) to texture pixels: the farm ground is 58 x 40 */
const GX = (x, W) => (x + 29) / 58 * W, GZ = (z, H) => (z + 20) / 40 * H;
function paintGroundTex() {
  const MW = 1024, MH = 512, mc = document.createElement('canvas'); mc.width = MW; mc.height = MH; const mx = mc.getContext('2d'), id = mx.createImageData(MW, MH), K = new Uint8Array(MW * MH);
  for (let py = 0; py < MH; py++) for (let px = 0; px < MW; px++) {
    const x = (px + 0.5) / MW * 58 - 29, z = (py + 0.5) / MH * 40 - 20;
    const wx = x + Math.sin(z * 2.3 + x * 0.7) * 0.09 + Math.sin(z * 5.1) * 0.04, wz = z + Math.sin(x * 2.1 - z * 0.5) * 0.09 + Math.sin(x * 4.7) * 0.04;
    const k = isleD(x, z) < 0.99 ? roadKind(wx, wz) : 0, o = (py * MW + px) * 4; K[py * MW + px] = k;
    id.data[o] = k === 1 ? 255 : 0; id.data[o + 1] = k === 2 ? 255 : 0; id.data[o + 3] = 255;
  }
  mx.putImageData(id, 0, 0); GMASK = { K, W: MW, H: MH };
  /* overgrown edges: grass blades reaching from the verge onto the dirt */
  mx.strokeStyle = '#000'; mx.lineWidth = 1.3; mx.lineCap = 'round'; mx.beginPath();
  for (let i = 0; i < 26000; i++) { const px = Math.floor(hash(i, 3.1) * MW), py = Math.floor(hash(i, 5.7) * MH), k = K[py * MW + px]; if (k !== 1) continue;
    let gx = 0, gy = 0; for (const [dx, dy] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) { const qx = px + dx, qy = py + dy; if (qx >= 0 && qy >= 0 && qx < MW && qy < MH && K[qy * MW + qx] === 0) { gx += dx; gy += dy; } }
    if (!gx && !gy) continue; const l = Math.hypot(gx, gy) || 1, L = 2 + hash(i, 9.1) * 3.5, a = (hash(i, 2.2) - 0.5) * 1.2, ux = -gx / l, uy = -gy / l, ca = Math.cos(a), sa = Math.sin(a);
    mx.moveTo(px + gx / l * 1.5, py + gy / l * 1.5); mx.lineTo(px + (ux * ca - uy * sa) * L, py + (ux * sa + uy * ca) * L); }
  mx.stroke();
  const mt = new T.CanvasTexture(mc); mt.flipY = false; mt.anisotropy = 4; GU.mask.value = mt;
  /* detail: a multiplier (white = unchanged) with painted grass strokes, pebbles, cobbles and fallen leaves */
  const DW = 2048, DH = 1024, dc = document.createElement('canvas'); dc.width = DW; dc.height = DH; const d = dc.getContext('2d');
  d.fillStyle = '#e8e8e8'; d.fillRect(0, 0, DW, DH);
  const kAt = (px, py) => K[Math.min(MH - 1, Math.max(0, Math.floor(py / DH * MH))) * MW + Math.min(MW - 1, Math.max(0, Math.floor(px / DW * MW)))];
  /* soft blotches so big lawns are not flat */
  for (let i = 0; i < 900; i++) { const x = hash(i, 11.1) * DW, y = hash(i, 12.3) * DH, r = 14 + hash(i, 13.7) * 40, v = hash(i, 14.9) > 0.5; const g = d.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, v ? 'rgba(255,255,240,0.35)' : 'rgba(150,160,120,0.22)'); g.addColorStop(1, 'rgba(232,232,232,0)'); d.fillStyle = g; d.fillRect(x - r, y - r, r * 2, r * 2); }
  /* grass strokes, batched by shade */
  const SH = ['rgba(255,255,236,0.7)', 'rgba(250,255,225,0.55)', 'rgba(185,198,150,0.45)', 'rgba(160,176,128,0.4)'];
  SH.forEach((c, si) => { d.strokeStyle = c; d.lineWidth = si < 2 ? 1.4 : 1.6; d.lineCap = 'round'; d.beginPath();
    for (let i = 0; i < 11000; i++) { const x = hash(i, 21.3 + si) * DW, y = hash(i, 22.9 + si) * DH; if (kAt(x, y)) continue; const L = 3 + hash(i, 23.1 + si) * 6, a = -1.57 + (hash(i, 24.7 + si) - 0.5) * 1.1; d.moveTo(x, y); d.quadraticCurveTo(x + Math.cos(a) * L * 0.5 + 1.5, y + Math.sin(a) * L * 0.5, x + Math.cos(a) * L, y + Math.sin(a) * L); }
    d.stroke(); });
  /* the verge: a little darker where grass meets the path (reads like ambient shade) */
  d.fillStyle = 'rgba(120,130,90,0.16)';
  for (let i = 0; i < 30000; i++) { const x = hash(i, 31.3) * DW, y = hash(i, 32.9) * DH; if (kAt(x, y)) continue; if (kAt(x + 7, y) || kAt(x - 7, y) || kAt(x, y + 7) || kAt(x, y - 7)) { d.beginPath(); d.arc(x, y, 3 + hash(i, 33.3) * 3, 0, 6.283); d.fill(); } }
  /* dirt: speckles and pebbles */
  for (let i = 0; i < 40000; i++) { const x = hash(i, 41.3) * DW, y = hash(i, 42.9) * DH; if (kAt(x, y) !== 1) continue; const big = hash(i, 43.3) > 0.93, r = big ? 1.4 + hash(i, 44.1) * 1.6 : 0.8 + hash(i, 44.1) * 1.2;
    if (big) { d.fillStyle = 'rgba(110,95,80,0.5)'; d.beginPath(); d.ellipse(x + 0.8, y + 1, r * 1.2, r, 0, 0, 6.283); d.fill(); d.fillStyle = hash(i, 45.1) > 0.5 ? '#f6f2ee' : '#d8d4d6'; d.beginPath(); d.ellipse(x, y, r * 1.2, r, hash(i, 46.2) * 3, 0, 6.283); d.fill(); }
    else { d.fillStyle = hash(i, 45.1) > 0.5 ? 'rgba(255,255,255,0.6)' : 'rgba(150,130,110,0.4)'; d.fillRect(x, y, r, r); } }
  /* cobbles: hand-laid stones of mixed sizes and shades, fanned in rings round the plaza and in staggered rows along the street,
     with dark joints, the odd sunken or missing stone (dirt or moss showing) and a light top edge on each */
  { const C = 0.21, gX = (x) => (x + 29) / 58 * DW, gZ = (z) => (z + 20) / 40 * DH;
    /* joints first: dark, a little brown in places and green in others */
    for (let py = 0; py < DH; py += 3) for (let px = 0; px < DW; px += 3) if (kAt(px, py) === 2) { const t = hash(Math.floor(px / 40), Math.floor(py / 40), 7);
      d.fillStyle = t > 0.8 ? 'rgba(124,136,96,0.55)' : t > 0.55 ? 'rgba(140,120,104,0.55)' : 'rgba(146,134,126,0.52)'; d.beginPath(); d.moveTo(px + 2.8, py); d.arc(px, py, 2.8, 0, 6.283); d.fill(); }
    const TONES = [[251, 246, 240], [240, 232, 224], [228, 220, 214], [246, 238, 226], [232, 234, 236], [214, 206, 198], [255, 250, 244]];
    const stone = (x, z, lx, lz, rot, i) => { if (kAt(gX(x), gZ(z)) !== 2) return; const h = hash(i, 3.3);
      if (h < 0.035) { d.fillStyle = hash(i, 4.4) > 0.5 ? 'rgba(96,112,64,0.7)' : 'rgba(118,96,78,0.7)'; ell(x, z, lx * 0.8, lz * 0.8, rot, i); return; } /* missing: moss or bare dirt */
      const tn = TONES[Math.floor(hash(i, 5.5) * TONES.length)], k = h < 0.09 ? 0.86 : 1; /* a few sunken, darker stones */
      d.fillStyle = 'rgb(' + Math.round(tn[0] * k) + ',' + Math.round(tn[1] * k) + ',' + Math.round(tn[2] * k) + ')'; ell(x, z, lx, lz, rot, i);
      d.fillStyle = 'rgba(255,255,255,0.4)'; ell(x - Math.cos(rot) * lx * 0.15, z - lz * 0.25, lx * 0.55, lz * 0.35, rot, i + 0.5);
      if (hash(i, 6.6) > 0.9) { d.fillStyle = 'rgba(120,150,80,0.5)'; ell(x + lx * 0.7, z + lz * 0.4, 0.035, 0.035, 0, i); } };
    /* a lumpy rounded outline: 7 points at uneven radii, smoothed through the midpoints */
    const ell = (x, z, lx, lz, rot, i) => { const P = []; for (let j = 0; j < 7; j++) { const a = j / 7 * 6.2832, r = 0.82 + hash(i, j, 8.8) * 0.3, u = Math.cos(a) * lx * r, v = Math.sin(a) * lz * r;
        P.push([gX(x + u * Math.cos(rot) - v * Math.sin(rot)), gZ(z + u * Math.sin(rot) + v * Math.cos(rot))]); }
      d.beginPath(); const m0 = [(P[6][0] + P[0][0]) / 2, (P[6][1] + P[0][1]) / 2]; d.moveTo(m0[0], m0[1]);
      for (let j = 0; j < 7; j++) { const q = P[j], n = P[(j + 1) % 7]; d.quadraticCurveTo(q[0], q[1], (q[0] + n[0]) / 2, (q[1] + n[1]) / 2); } d.fill(); };
    let id = 0;
    /* plaza: rings of stones round the fountain */
    for (let r = 0.5; r < 3.6; r += C * 1.05) { const n = Math.max(6, Math.round(6.2832 * r / (C * 1.1))), a0 = hash(r, 1.7) * 6.28, ws = []; let tot = 0;
      for (let j = 0; j < n; j++) { ws.push(0.6 + hash(id + j, 2.1) * 0.9); tot += ws[j]; } /* mixed lengths that still close the ring */
      let a = a0; for (let j = 0; j < n; j++) { id++; const da = ws[j] / tot * 6.2832, aa = a + da / 2, rr = r + (hash(id, 2.7) - 0.5) * 0.04; a += da;
        stone(Math.cos(aa) * rr, Math.sin(aa) * rr, da * r * 0.49, C * (0.43 + hash(id, 3.1) * 0.1), aa + 1.5708 + (hash(id, 3.7) - 0.5) * 0.25, id); } }
    /* the street and anywhere else: staggered rows of stones of mixed lengths, now and then a big flag across two rows */
    for (let z = -20 + C / 2, row = 0; z < 20; z += C, row++) { let x = -29 + hash(row, 4.1) * C;
      while (x < 29) { id++; const big = hash(id, 4.7) > 0.94, L = big ? C * (1.6 + hash(id, 4.9) * 0.5) : C * (0.6 + hash(id, 5.1) * 0.9), cx = x + L / 2, cz = z + (hash(id, 5.3) - 0.5) * C * 0.15;
        if (Math.hypot(cx, cz) > 3.45) stone(cx, cz, L * 0.48, (big ? C * 0.58 : C * 0.46) * (0.88 + hash(id, 5.7) * 0.22), (hash(id, 5.9) - 0.5) * 0.18, id);
        x += L + C * 0.05; } } }
  /* fallen leaves */
  const LV = ['#e8a050', '#d97a3a', '#e9c060', '#c8643a'];
  for (let i = 0; i < 700; i++) { const x = hash(i, 51.3) * DW, y = hash(i, 52.9) * DH; if (hash(i, 50.1) > 0.35 && !kAt(x, y)) continue; d.fillStyle = LV[i % 4]; d.save(); d.translate(x, y); d.rotate(hash(i, 53.3) * 6.283); d.beginPath(); d.ellipse(0, 0, 3.2, 1.6, 0, 0, 6.283); d.fill(); d.restore(); }
  const dt = new T.CanvasTexture(dc); dt.flipY = false; dt.anisotropy = 4; GU.det.value = dt; GU.detC = dc;
}
/* contact shade: soft dark pools painted under trees, houses and props once the world is built (a cheap stand-in for ambient occlusion) */
function groundShade(list) {
  if (!GU.detC) return; const d = GU.detC.getContext('2d'), W = GU.detC.width, H = GU.detC.height; d.save(); d.globalCompositeOperation = 'multiply';
  list.forEach(([x, z, rx, rz, k]) => { const px = GX(x, W), py = GZ(z, H), sx = rx / 58 * W, sz = rz / 40 * H, r = Math.max(sx, sz); if (r < 1) return;
    d.save(); d.translate(px, py); d.scale(sx / r, sz / r); const g = d.createRadialGradient(0, 0, r * 0.15, 0, 0, r); const a = k == null ? 0.42 : k; g.addColorStop(0, 'rgba(70,80,60,' + a + ')'); g.addColorStop(0.6, 'rgba(120,130,100,' + a * 0.45 + ')'); g.addColorStop(1, 'rgba(255,255,255,0)'); d.fillStyle = g; d.beginPath(); d.arc(0, 0, r, 0, 6.283); d.fill(); d.restore(); });
  d.restore(); GU.det.value.needsUpdate = true;
}
let wg = new T.PlaneGeometry(160, 160, 40, 40); wg.rotateX(-Math.PI / 2);
wg = fac(wg, (cx, cy, cz, i) => { const d = HERE_T === 'farm' ? Math.hypot(cx / 1.6, cz) * 0.8 : Math.max(Math.abs(cx) / 1.4, Math.abs(cz)); return tone(d < 13 ? PAL.seaShallow : d < 24 ? PAL.sea : PAL.seaDeep, i, 0.9); });
const water = new T.Mesh(wg, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.28, metalness: 0.05 })); water.position.y = -0.45; water.receiveShadow = true; sc.add(water);
const wp = wg.attributes.position, wn = wg.attributes.normal;

/* soft, layered foliage: a merged cluster of round blobs (one mesh per crown) */
function mergeGeos(list) { list = list.map((g) => g.index ? g.toNonIndexed() : g); let n = 0; list.forEach((g) => { n += g.attributes.position.count; }); const P = new Float32Array(n * 3); let o = 0; list.forEach((g) => { const a = (g.index ? g.toNonIndexed() : g).attributes.position.array; P.set(a, o); o += a.length; }); const m = new T.BufferGeometry(); m.setAttribute('position', new T.BufferAttribute(P, 3)); return m; }
function fluff(r, seed, n, flat) {
  n = n || 6; flat = flat || 1; const L = [ico(r * 0.8, 1, seed, r * 0.05).translate(0, 0, 0)];
  for (let k = 0; k < n; k++) { const a = k / n * 6.283 + hash(seed, k) * 0.8, rr = r * (0.5 + hash(k, seed) * 0.15), sz = r * (0.42 + hash(seed, k + 9) * 0.18); L.push(ico(sz, 1, seed + k, sz * 0.07).translate(Math.cos(a) * rr, (hash(k, seed + 3) - 0.55) * r * 0.45 * flat, Math.sin(a) * rr)); }
  L.push(ico(r * 0.5, 1, seed + 40, r * 0.04).translate(r * 0.12, r * 0.55 * flat, -r * 0.08)); L.push(ico(r * 0.38, 1, seed + 41, r * 0.04).translate(-r * 0.3, r * 0.42 * flat, r * 0.25));
  return mergeGeos(L);
}
const _sy = new T.Color('#ffe9a0');
function shadeY(hex, y, y0, y1, key, amt) { const c = tone(hex, key, amt == null ? 0.6 : amt), q = clamp((y - y0) / (y1 - y0), 0, 1); c.multiplyScalar(0.62 + 0.5 * q); c.lerp(_sy, 0.18 * q * q); return c; }
/* foliage: a stronger vertical gradient than shadeY, cool deep green at the bottom of a crown and sunny yellow-green on top, so a
   cluster of round blobs reads as layers of leaves instead of one smooth plastic ball */
const _lyLo = new T.Color('#2e5a50'), _lyHi = new T.Color('#dfe98a');
function leafY(hex, y, y0, y1, key, amt) { const c = tone(hex, key, amt == null ? 0.6 : amt), q = clamp((y - y0) / (y1 - y0), 0, 1); c.lerp(_lyLo, 0.32 * (1 - q) * (1 - q)); c.multiplyScalar(0.54 + 0.46 * q); c.lerp(_lyHi, 0.22 * q * q * q); return c; }
function tree(kind, s) {
  const g = new T.Group(); let geo; const LF = typeof leafs !== 'undefined' ? leafs : null;
  if (kind === 'pine') {
    geo = new T.CylinderGeometry(0.06, 0.1, 0.4, 7); geo.translate(0, 0.2, 0); part(fac(geo, PAL.trunk, s), g);
    const L = []; for (let i = 0; i < 4; i++) { const r = 0.58 - i * 0.115, h = 0.6 - i * 0.04, pts = [new T.Vector2(r * 0.62, 0), new T.Vector2(r * 0.92, 0.03), new T.Vector2(r, 0.09)];
      for (let k = 1; k <= 6; k++) { const t = k / 6; pts.push(new T.Vector2(r * Math.pow(1 - t, 0.85) * (1 - 0.06 * Math.sin(t * Math.PI)) + (k === 6 ? 0.0 : 0), 0.09 + (h - 0.09) * t)); }
      const c = new T.LatheGeometry(pts, 12); c.translate(0, 0.32 + i * 0.3, 0); L.push(jit(c, 0.018, s + i)); }
    const base = s % 2 ? PAL.pine : PAL.forest, y0 = 0.3, y1 = 1.85, m = part(fac(mergeGeos(L), (cx, cy, cz, i) => leafY(base, cy, y0, y1, i)), g);
    m.userData = { pine: 1, base, y0, y1 }; if (LF) LF.push(m);
  } else {
    geo = new T.CylinderGeometry(0.07, 0.13, 0.85, 7); geo.translate(0, 0.42, 0); part(fac(jit(geo, 0.012, s), PAL.trunk, s), g);
    geo = new T.CylinderGeometry(0.03, 0.05, 0.4, 5); geo.translate(0, 0.2, 0); geo.rotateZ(0.7); geo.translate(0.02, 0.6, 0); part(fac(geo, PAL.trunk, s + 1), g);
    const y0 = 0.7, y1 = 1.85, m = part(fac(fluff(0.62, s, 7), (cx, cy, cz, i) => leafY(PAL.forest, cy + 1.25, y0, y1, i)), g, 0, 1.25, 0);
    m.userData = { base: PAL.forest, y0: y0 - 1.25, y1: y1 - 1.25 }; if (LF) LF.push(m);
  }
  return g;
}
[[-10, -6, 'pine'], [-8.4, -6.6, 'pine'], [-10.2, -1.5, 'tree'], [-10, 3.5, 'pine'], [-7.5, 6.2, 'tree'], [9.8, -6.2, 'pine'], [10.2, 2.5, 'tree'], [9.9, 6.3, 'pine'], [2, -6.6, 'tree'], [-2.5, -6.8, 'pine'], [5.5, -6.6, 'pine'], [-6.3, 6.7, 'pine']].forEach((t, i) => { const m = tree(t[2], i * 7 + 3); m.position.set(t[0], hAt(t[0], t[1]), t[1]); m.rotation.y = hash(i, 4) * 6.28; m.scale.setScalar(0.85 + hash(i, 9) * 0.4); sc.add(m); });
/* coop fence around the hens */
for (let i = 0; i < 18; i++) { const a = i / 18, x = -6.6 + (a < 0.5 ? a * 2 * 4.4 : 4.4), z = a < 0.5 ? -1.2 : -1.2 + (a - 0.5) * 2 * 3.6; if (a >= 0.5 && z > 0.2 && z < 1.0) continue; const g = new T.CylinderGeometry(0.04, 0.05, 0.4, 4); g.translate(0, 0.2, 0); part(fac(g, PAL.trunk, i), sc, x, 0, z); }

/* ---------- items ---------- */
const PROTO = {};
{ let g = new T.Group(), geo = ico(0.11, 1, 1, 0.006); geo.scale(0.85, 1.1, 0.85); part(fac(geo, PAL.snow, 1), g, 0, 0.11, 0, true); PROTO.egg = g; }
{ const g = new T.Group(); part(fac(ico(0.12, 1, 2, 0.008), PAL.accent, 2), g, 0, 0.12, 0, true); const lf = new T.ConeGeometry(0.04, 0.1, 3); lf.rotateZ(0.8); part(fac(lf, PAL.leaf, 3), g, 0.04, 0.25, 0, true); PROTO.apple = g; }
{ const g = new T.Group(); let geo = new T.CylinderGeometry(0.075, 0.085, 0.2, 6); geo.translate(0, 0.1, 0); part(fac(geo, PAL.paper, 4), g, 0, 0, 0, true); geo = new T.CylinderGeometry(0.045, 0.06, 0.06, 6); part(fac(geo, PAL.sea, 5), g, 0, 0.22, 0, true); PROTO.milk = g; }
{ const g = new T.Group(); let geo = new T.CylinderGeometry(0.15, 0.15, 0.1, 8); geo.translate(0, 0.05, 0); part(fac(geo, PAL.sand, 6), g, 0, 0, 0, true); geo = new T.CylinderGeometry(0.155, 0.155, 0.04, 8); part(fac(geo, PAL.blush, 7), g, 0, 0.12, 0, true); part(fac(new T.IcosahedronGeometry(0.04, 0), PAL.accent, 8), g, 0, 0.16, 0, true); PROTO.cake = g; }
const ITEM_H = { egg: 0.2, apple: 0.22, milk: 0.27, cake: 0.15 };
const mk = (type) => { const m = PROTO[type].clone(); m.userData.type = type; return m; };

/* a pile is a list of item meshes placed by a layout function */
function Pile(parent, layout) { this.items = []; this.parent = parent; this.layout = layout; }
Pile.prototype.add = function (m) { this.parent.add(m); this.items.push(m); this.place(); };
Pile.prototype.take = function (type) { for (let i = this.items.length - 1; i >= 0; i--) if (!type || this.items[i].userData.type === type) { const m = this.items.splice(i, 1)[0]; this.place(); return m; } return null; };
Pile.prototype.count = function (type) { return type ? this.items.filter((m) => m.userData.type === type).length : this.items.length; };
Pile.prototype.place = function () { this.items.forEach((m, i) => { const p = this.layout(i, m); m.position.set(p[0], p[1], p[2]); m.rotation.set(0, p[3] || 0, 0); }); };

/* flying items: a mesh arcs from one place to another, then a callback lands it */
const flyers = [];
function fly(m, toFn, done, dur) { const from = new T.Vector3(); m.getWorldPosition(from); sc.add(m); m.position.copy(from); m.rotation.set(0, 0, 0); flyers.push({ m, from, toFn, done, t: 0, dur: dur || 0.28 }); }
const tmpV = new T.Vector3();

/* ---------- Pip: a person the child dresses up (shared by both games) ---------- */
const pip = new T.Group(); pip.position.set(0.5, 0, 2.2); sc.add(pip);
const pb = new T.Group(); pip.add(pb); pb.scale.setScalar(0.8);
const AVO = {
  skin: ['#f6d3b8', '#e8b48f', '#c98b62', '#9a6440', '#6b4430'],
  hs: ['kort', 'lang', 'tofsar', 'knut', 'lockar', 'keps', 'mossa'],
  hc: ['#3a2a22', '#7a4a2a', '#e0b45a', '#c4562e', '#22232a', '#d9d4cc', '#e889b5', '#6aa0e0'],
  ts: ['jacka', 'randig', 'luva'],
  sh: ['#e9684a', '#1f6a80', '#e0a646', '#3f7d62', '#f0907a', '#7b5ea7', '#fff6e4', '#22303c'],
  bs: ['byxor', 'shorts', 'kjol'],
  bc: ['#2e4a7a', '#7d5e4e', '#22303c', '#3f7d62', '#e889b5', '#e0a646', '#d9443a'],
  ss: ['skor', 'stovlar', 'sandaler'],
  sc: ['#3a3433', '#e9684a', '#1f6a80', '#f2c14a', '#3f7d62', '#e889b5', '#fff6e4']
};
const AV_KEY = 'pips-avatar';
let av = null, avNew = false;
try { av = JSON.parse(localStorage.getItem(AV_KEY) || 'null'); } catch (e) {}
if (!av || typeof av !== 'object') { av = { skin: 1, hs: 6, hc: 1, sh: 0, bs: 0, bc: 0, ss: 0, sc: 0 }; avNew = true; }
for (const k in AVO) if (!(av[k] >= 0 && av[k] < AVO[k].length)) av[k] = 0;
const eyes = [], limbs = [];
const riding = () => typeof mount !== 'undefined' && !!mount;
function buildAvatar() {
  while (pb.children.length) pb.remove(pb.children[0]); eyes.length = 0; limbs.length = 0;
  const ts = AVO.ts[av.ts], shoe = AVO.sc[av.sc], ss = AVO.ss[av.ss], skin = AVO.skin[av.skin], hc = AVO.hc[av.hc], sh = AVO.sh[av.sh], bc = AVO.bc[av.bc], bs = AVO.bs[av.bs], hs = AVO.hs[av.hs];
  let g;
  /* legs swing from the hip */
  [-0.11, 0.11].forEach((x, k) => {
    const leg = new T.Group(); leg.position.set(x, 0.64, 0); pb.add(leg); limbs.push({ g: leg, s: k ? 1 : -1 });
    g = new T.CylinderGeometry(0.08, 0.075, 0.3, 10); g.translate(0, -0.15, 0); part(fac(g, bs === 'kjol' ? skin : bc, 20 + k), leg);
    g = new T.CylinderGeometry(0.074, 0.07, 0.26, 10); g.translate(0, -0.43, 0); part(fac(g, bs === 'byxor' ? bc : skin, 22 + k), leg);
    if (ss === 'stovlar') { g = new T.BoxGeometry(0.17, 0.24, 0.19); g.translate(0, -0.48, 0); part(fac(g, shoe, 24 + k), leg); }
    if (ss === 'sandaler') { g = new T.BoxGeometry(0.17, 0.04, 0.25); g.translate(0, -0.615, 0.04); part(fac(g, shoe, 24 + k), leg); g = new T.BoxGeometry(0.175, 0.03, 0.05); g.translate(0, -0.57, 0.08); part(fac(g, shoe, 26 + k), leg); g = new T.BoxGeometry(0.15, 0.05, 0.2); g.translate(0, -0.575, 0.05); part(fac(g, skin, 28 + k), leg); }
    else { g = new T.BoxGeometry(0.17, 0.09, 0.25); g.translate(0, -0.59, 0.04); part(fac(g, shoe, 24 + k), leg); g = new T.BoxGeometry(0.175, 0.02, 0.26); g.translate(0, -0.635, 0.04); part(fac(g, ss === 'skor' ? PAL.paper : '#2a2626', 30 + k), leg); }
  });
  if (bs === 'kjol') { g = new T.CylinderGeometry(0.2, 0.34, 0.34, 8); part(fac(jit(g, 0.01, 5), bc, 26), pb, 0, 0.62, 0); }
  else { g = new T.BoxGeometry(0.42, 0.14, 0.26); part(fac(g, bc, 26), pb, 0, 0.68, 0); }
  /* a soft padded jacket: round body, collar, zip and a hem band */
  g = new T.CylinderGeometry(0.2, 0.235, 0.46, 14, 3); g.scale(1, 1, 0.72); part(fac(jit(g, 0.006, 3), (cx, cy, cz, i) => shadeY(sh, cy, -0.3, 0.25, i, 0.3)), pb, 0, 0.92, 0);
  g = new T.TorusGeometry(0.15, 0.045, 8, 16); g.rotateX(Math.PI / 2); g.scale(1, 1, 0.8); part(fac(g, (cx, cy, cz, i) => tone(sh, i, 0.3).multiplyScalar(0.8)), pb, 0, 1.15, 0);
  g = new T.CylinderGeometry(0.24, 0.24, 0.07, 14); g.scale(1, 1, 0.74); part(fac(g, (cx, cy, cz, i) => tone(sh, i, 0.3).multiplyScalar(0.82)), pb, 0, 0.71, 0);
  if (ts === 'jacka') { g = new T.BoxGeometry(0.025, 0.4, 0.02); part(fac(g, '#e8e2d8'), pb, 0, 0.93, 0.172, true); }
  /* a striped jumper: light bands hug the round body */
  const band = new T.Color(sh).lerp(new T.Color('#fff6e4'), 0.72).getStyle();
  if (ts === 'randig') [0.8, 0.92, 1.04].forEach((y, k) => { const r = 0.2 + 0.035 * (0.23 - (y - 0.92)) / 0.46 + 0.012; g = new T.CylinderGeometry(r - 0.004, r + 0.004, 0.055, 14); g.scale(1, 1, 0.74); part(fac(g, (cx, cy, cz, i) => tone(band, i, 0.2)), pb, 0, y, 0, true); });
  /* a hoodie: a soft hood behind the neck, a front pocket and two strings */
  if (ts === 'luva') {
    g = new T.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6); g.scale(1.05, 0.8, 0.75); const m = part(fac(g, (cx, cy, cz, i) => shadeY(sh, cy, -0.1, 0.15, i, 0.3)), pb, 0, 1.12, -0.12); m.rotation.x = -1.9;
    g = new T.BoxGeometry(0.26, 0.11, 0.03); part(fac(g, (cx, cy, cz, i) => tone(sh, i, 0.3).multiplyScalar(0.86)), pb, 0, 0.8, 0.165, true);
    [-0.05, 0.05].forEach((x) => { g = new T.CylinderGeometry(0.008, 0.008, 0.13, 4); part(fac(g, '#fff6e4'), pb, x, 1.04, 0.17, true); });
  }
  /* arms swing from the shoulder */
  [-0.3, 0.3].forEach((x, k) => {
    const arm = new T.Group(); arm.position.set(x, 1.08, 0); pb.add(arm); limbs.push({ g: arm, s: k ? -1 : 1, arm: true });
    g = new T.CylinderGeometry(0.072, 0.064, 0.38, 10); g.translate(0, -0.17, 0); part(fac(g, (cx, cy, cz, i) => shadeY(sh, cy, -0.4, 0.05, i, 0.3)), arm);
    if (ts === 'randig') [-0.1, -0.22].forEach((y) => { g = new T.CylinderGeometry(0.076, 0.073, 0.045, 10); part(fac(g, (cx, cy, cz, i) => tone(band, i, 0.2)), arm, 0, y, 0, true); }); g = new T.CylinderGeometry(0.07, 0.07, 0.05, 10); part(fac(g, (cx, cy, cz, i) => tone(sh, i, 0.3).multiplyScalar(0.8)), arm, 0, -0.35, 0);
    part(fac(ico(0.075, 0, 30 + k, 0.005), skin, 30 + k), arm, 0, -0.41, 0);
  });
  /* head and face: a big round head (scaled up as a group) */
  const h0 = pb.children.length;
  g = ico(0.27, 2, 4, 0.004); g.scale(1, 1.0, 0.95); part(fac(g, skin, 32), pb, 0, 1.38, 0);
  part(fac(ico(0.045, 0, 6, 0.003), skin, 33), pb, 0, 1.35, 0.265);
  [-0.1, 0.1].forEach((x) => {
    const e = new T.Mesh(new T.SphereGeometry(0.04, 10, 8), ink); e.scale.set(0.9, 1.15, 0.7); e.position.set(x, 1.41, 0.235); pb.add(e); eyes.push(e);
    const hl = new T.Mesh(new T.SphereGeometry(0.013, 6, 4), new T.MeshBasicMaterial({ color: '#ffffff' })); hl.position.set(0.013, 0.014, 0.03); e.add(hl);
    const c = new T.Mesh(new T.SphereGeometry(0.05, 8, 6), new T.MeshBasicMaterial({ color: PAL.blush, transparent: true, opacity: 0.6 })); c.scale.set(1, 0.6, 0.3); c.position.set(x * 1.7, 1.31, 0.21); pb.add(c);
  });
  const mouth = new T.Mesh(new T.TorusGeometry(0.045, 0.012, 4, 10, Math.PI), ink); mouth.rotation.z = Math.PI; mouth.position.set(0, 1.29, 0.245); pb.add(mouth);
  /* hair: a cap of hair tipped back, plus the style's extra pieces */
  const cap = (col, tilt) => { const s = new T.SphereGeometry(0.295, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.52); const m = part(fac(jit(s, 0.01, 7), col, 34), pb, 0, 1.39, -0.01); m.rotation.x = -tilt; return m; };
  if (hs === 'keps') {
    cap(hc, 0.5);
    g = new T.SphereGeometry(0.305, 10, 5, 0, Math.PI * 2, 0, Math.PI * 0.42); const m = part(fac(g, sh === '#e9684a' ? PAL.sea : PAL.accent, 35), pb, 0, 1.43, 0); m.rotation.x = -0.15;
    g = new T.BoxGeometry(0.36, 0.035, 0.2); part(fac(g, sh === '#e9684a' ? PAL.sea : PAL.accent, 36), pb, 0, 1.55, 0.27);
  } else if (hs === 'mossa') {
    /* a cozy knitted beanie with a folded brim and a pompom */
    cap(hc, 0.55); const bc0 = sh === '#e9684a' ? '#e0a646' : '#e9763a';
    g = new T.SphereGeometry(0.3, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5); g.scale(1, 1.15, 1); let m = part(fac(jit(g, 0.004, 51), (cx, cy, cz, i) => shadeY(bc0, cy, 0, 0.34, i, 0.4)), pb, 0, 1.45, -0.01); m.rotation.x = -0.18;
    g = new T.TorusGeometry(0.288, 0.042, 8, 24); g.rotateX(Math.PI / 2); g.scale(1, 1.7, 1); m = part(fac(g, (cx, cy, cz, i) => tone(bc0, i, 0.4).multiplyScalar(0.86)), pb, 0, 1.47, -0.01); m.rotation.x = -0.18;
    part(fac(ico(0.08, 1, 52, 0.012), '#fff6e4'), pb, 0, 1.83, -0.09);
  } else cap(hc, hs === 'lockar' ? 0.25 : 0.4);
  if (hs === 'lang') { g = new T.BoxGeometry(0.54, 0.5, 0.14); part(fac(jit(g, 0.012, 8), hc, 37), pb, 0, 1.2, -0.19); }
  if (hs === 'tofsar') [-1, 1].forEach((s) => { part(fac(ico(0.11, 1, 9 + s), hc, 38), pb, s * 0.31, 1.36, -0.06); part(fac(new T.BoxGeometry(0.06, 0.06, 0.06), PAL.accent, 39), pb, s * 0.25, 1.4, -0.05); });
  if (hs === 'knut') part(fac(ico(0.13, 1, 11), hc, 40), pb, 0, 1.7, -0.1);
  if (hs === 'lockar') for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; part(fac(ico(0.1, 0, 12 + k), hc, 41 + k), pb, Math.cos(a) * 0.24, 1.6 + Math.sin(k * 1.7) * 0.03, Math.sin(a) * 0.2 - 0.04); }
  { const hg = new T.Group(); hg.position.set(0, 1.3, 0); hg.scale.setScalar(1.16); const L = pb.children.slice(h0); L.forEach((m) => { pb.remove(m); m.position.y -= 1.3; hg.add(m); }); pb.add(hg); }
  /* the basket on Pip's back, where carried things stack */
  g = new T.BoxGeometry(0.44, 0.08, 0.3); part(fac(g, PAL.trunk, 8), pb, 0, 0.82, -0.34);
  [-0.17, 0.17].forEach((x) => { const s = new T.BoxGeometry(0.04, 0.4, 0.04); part(fac(s, PAL.trunk, 9), pb, x, 0.98, -0.17); });
}
buildAvatar();
const carry = new Pile(pip, (i, m) => { let y = 0.72; for (let k = 0; k < i; k++) y += ITEM_H[carry.items[k].userData.type]; return [0, y, -0.32]; });
const target = new T.Vector3().copy(pip.position);
let pipWalk = 0, dressT = 0;
/* the wardrobe: pick a look; the camera moves close so Pip is the preview */
let dressing = false;
const HS_ICON = {
  kort: '<path d="M10 24 C10 8 38 8 38 24 C34 16 14 16 10 24 Z"/>',
  lang: '<path d="M8 40 C4 6 44 6 40 40 L36 40 C38 22 34 16 24 16 C14 16 10 22 12 40 Z"/>',
  tofsar: '<path d="M10 24 C10 8 38 8 38 24 C34 16 14 16 10 24 Z"/><circle cx="7" cy="26" r="6"/><circle cx="41" cy="26" r="6"/>',
  knut: '<path d="M10 24 C10 8 38 8 38 24 C34 16 14 16 10 24 Z"/><circle cx="24" cy="6" r="6"/>',
  lockar: '<circle cx="12" cy="18" r="6"/><circle cx="20" cy="12" r="6"/><circle cx="28" cy="12" r="6"/><circle cx="36" cy="18" r="6"/><circle cx="24" cy="16" r="5"/>',
  keps: '<path d="M10 22 C10 6 38 6 38 22 Z" fill="#e9684a"/><path d="M30 20 H46 V24 H30 Z" fill="#e9684a"/>',
  mossa: '<path d="M9 28 C9 8 39 8 39 28 Z" fill="#e9763a"/><rect x="7" y="26" width="34" height="8" rx="4" fill="#c95f2a"/><circle cx="24" cy="7" r="5" fill="#fff6e4"/>'
};
const BS_ICON = {
  byxor: '<path d="M14 8 H34 L36 42 H27 L24 20 L21 42 H12 Z"/>',
  shorts: '<path d="M14 8 H34 L36 26 H27 L24 18 L21 26 H12 Z"/>',
  kjol: '<path d="M16 8 H32 L40 38 H8 Z"/>'
};
const SS_ICON = {
  skor: '<path d="M8 30 C8 24 12 22 18 22 L24 22 C28 26 34 27 40 28 C42 29 42 34 40 35 H8 Z"/><path d="M8 35 H41" stroke-width="4" stroke="#fff6e4"/>',
  stovlar: '<path d="M14 6 H26 V26 C30 28 36 28 40 30 C42 31 42 37 40 38 H14 Z"/>',
  sandaler: '<path d="M8 34 H40 V38 H8 Z"/><path d="M14 34 L22 24 L30 34" fill="none" stroke-width="4"/>'
};
const AV_ROWS = [
  { k: 'skin', label: 'Hudfärg', icon: '<circle cx="24" cy="24" r="14" fill="#e8b48f" stroke="#22303c" stroke-width="3"/>' },
  { k: 'hs', label: 'Frisyr' }, { k: 'hc', label: 'Hårfärg' }, { k: 'sh', label: 'Tröja' }, { k: 'bs', label: 'Byxor eller kjol' }, { k: 'bc', label: 'Byxfärg' }, { k: 'ss', label: 'Skor' }, { k: 'sc', label: 'Skofärg' }
];
function avSwatch(k, i) {
  if (k === 'hs') return '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="27" r="14" fill="#f6d3b8" stroke="#22303c" stroke-width="2.5"/><g fill="' + AVO.hc[av.hc] + '" stroke="#22303c" stroke-width="2.5" stroke-linejoin="round">' + HS_ICON[AVO.hs[i]] + '</g></svg>';
  if (k === 'ss') return '<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="' + AVO.sc[av.sc] + '" stroke="#22303c" stroke-width="2.5" stroke-linejoin="round">' + SS_ICON[AVO.ss[i]] + '</g></svg>';
  if (k === 'bs') return '<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="' + AVO.bc[av.bc] + '" stroke="#22303c" stroke-width="2.5" stroke-linejoin="round">' + BS_ICON[AVO.bs[i]] + '</g></svg>';
  return '<i style="background:' + AVO[k][i] + '"></i>';
}
const AV_NAMES = { ts: ['Jacka', 'Randig tröja', 'Luvtröja'], hs: ['Kort hår', 'Långt hår', 'Tofsar', 'Knut', 'Lockar', 'Keps'], bs: ['Byxor', 'Shorts', 'Kjol'], ss: ['Skor', 'Stövlar', 'Sandaler'] };
function renderWardrobe() {
  if (typeof edRows === 'function') return edRows();
  const box = $('wardRows'); if (!box) return;
  box.innerHTML = AV_ROWS.map((r) => '<div class="wrow" role="radiogroup" aria-label="' + r.label + '">' + AVO[r.k].map((v, i) =>
    '<button type="button" class="sw' + (av[r.k] === i ? ' on' : '') + '" role="radio" aria-checked="' + (av[r.k] === i) + '" aria-label="' + r.label + ' ' + (AV_NAMES[r.k] ? AV_NAMES[r.k][i] : i + 1) + '" data-k="' + r.k + '" data-i="' + i + '">' + avSwatch(r.k, i) + '</button>').join('') + '</div>').join('');
}
function openWardrobe(auto) { if (typeof closeMenu === 'function') closeMenu(); if (typeof edOpen === 'function') edOpen(); dressing = true; $('ward').hidden = false; $('hint').hidden = true; renderWardrobe(); if (auto !== true) { Snd.init(); Snd.play('pop', { gain: 0.4, f: 700 }); } }
function closeWardrobe() { if ($('ward').hidden) return; if (typeof edClose === 'function' && !edClose()) return; $('ward').hidden = true; dressing = false; $('hint').hidden = !!(state && state.moved); avNew = false; try { localStorage.setItem(AV_KEY, JSON.stringify(av)); } catch (e) {} Snd.play('success', { gain: 0.5, f: 'E6' }); }
if ($('ward')) {
  $('wardRows').addEventListener('click', (e) => { const b = e.target.closest('.sw'); if (!b) return; e.stopPropagation(); av[b.dataset.k] = +b.dataset.i; buildAvatar(); renderWardrobe(); Snd.play('pop', { gain: 0.35, f: 500 + 60 * (+b.dataset.i) }); try { localStorage.setItem(AV_KEY, JSON.stringify(av)); } catch (er) {} });
  $('wardDone').addEventListener('click', () => { Snd.init(); closeWardrobe(); });
  if ($('wardBtn')) $('wardBtn').addEventListener('click', () => openWardrobe());
}

/* ---------- the boat between the farm and the shop ---------- */
/* a dock at the south end of the path; stand on it and the boat sails to the other island */
const HERE = typeof DIET !== 'undefined' ? 'farm' : 'shop', THERE_PAGE = HERE === 'farm' ? 'butik.html' : 'bondgard.html';
const canSail = /github\.io$/.test(location.hostname) || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const DOCK = (() => { const X = HERE_T === 'farm' ? 0 : 3.6; let z = 0; while (hAt(X, z) > -0.02 && z < 30) z += 0.1; return { x: X, edge: z, z0: z - 0.9, z1: z + 2.6, boat: z + 3.75 }; })();
const dockG = new T.Group(); sc.add(dockG);
{
  const len = DOCK.z1 - DOCK.z0 + 0.3; let g = new T.BoxGeometry(1.1, 0.08, len, 1, 1, Math.round(len / 0.3)); g.translate(DOCK.x, 0.1, DOCK.z0 - 0.15 + len / 2);
  part(fac(jit(g, 0.01, 3), PAL.trunk, 61), dockG);
  for (let z = DOCK.edge; z <= DOCK.z1; z += 1.1) [-0.5, 0.5].forEach((dx, k) => { const p = new T.CylinderGeometry(0.06, 0.06, 1.4, 5); part(fac(p, '#5e463a', 62 + k), dockG, DOCK.x + dx, -0.6, z); });
}
/* the boat: a red hull, a white cabin and a little flag */
const boat = new T.Group(); boat.position.set(DOCK.x, -0.32, DOCK.boat); sc.add(boat);
{
  let g = new T.BoxGeometry(1.0, 0.36, 1.9, 1, 1, 2); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const z = p.getZ(i), y = p.getY(i); if (z > 0.5) p.setX(i, p.getX(i) * 0.45); if (y < 0) p.setX(i, p.getX(i) * 0.75); }
  part(fac(g, PAL.accent, 71), boat, 0, 0.18, 0);
  g = new T.BoxGeometry(0.84, 0.06, 1.2); part(fac(g, '#c8a27a', 72), boat, 0, 0.35, -0.2, true);
  g = new T.BoxGeometry(0.6, 0.4, 0.5); part(fac(g, PAL.paper, 73), boat, 0, 0.6, -0.55);
  g = new T.BoxGeometry(0.66, 0.06, 0.58); part(fac(g, PAL.sea, 74), boat, 0, 0.83, -0.55);
  g = new T.CylinderGeometry(0.02, 0.02, 0.6, 4); part(fac(g, PAL.ink, 75), boat, 0, 1.15, -0.55);
  g = new T.BoxGeometry(0.02, 0.16, 0.26); g.translate(0, 0, 0.13); part(fac(g, PAL.ochre, 76), boat, 0, 1.36, -0.55);
}
/* a sign at the dock shows where the boat goes */
const dockSign = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d');
  x.fillStyle = PAL.paper; x.strokeStyle = PAL.ink; x.lineWidth = 6; x.beginPath(); x.arc(80, 72, 62, 0, 7); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(64, 130); x.lineTo(80, 152); x.lineTo(96, 130); x.fill(); x.stroke();
  x.lineWidth = 4; x.lineJoin = 'round';
  if (THERE_PAGE === 'butik.html') { /* the shop: a striped awning over a counter */
    x.fillStyle = '#7d5e4e'; x.fillRect(46, 74, 68, 34); x.strokeRect(46, 74, 68, 34);
    for (let k = 0; k < 5; k++) { x.fillStyle = k % 2 ? PAL.paper : PAL.accent; x.beginPath(); x.moveTo(40 + k * 16, 48); x.lineTo(56 + k * 16, 48); x.lineTo(56 + k * 16, 70); x.quadraticCurveTo(48 + k * 16, 78, 40 + k * 16, 70); x.closePath(); x.fill(); x.stroke(); }
    x.fillStyle = PAL.snow; [62, 80, 98].forEach((q) => { x.beginPath(); x.ellipse(q, 70, 6, 8, 0, 0, 7); x.fill(); x.stroke(); });
  } else { /* the farm: a red barn */
    x.fillStyle = PAL.accent; x.beginPath(); x.moveTo(44, 64); x.lineTo(80, 36); x.lineTo(116, 64); x.lineTo(116, 108); x.lineTo(44, 108); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = PAL.paper; x.fillRect(68, 78, 24, 30); x.strokeRect(68, 78, 24, 30); x.beginPath(); x.moveTo(68, 78); x.lineTo(92, 108); x.moveTo(92, 78); x.lineTo(68, 108); x.stroke();
  }
  const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false })); sp.renderOrder = 4; sp.scale.set(1.0, 1.0, 1); sp.position.set(DOCK.x + 0.95, 1.5, DOCK.z0 + 0.2); sc.add(sp);
  const post = new T.CylinderGeometry(0.05, 0.05, 0.9, 5); post.translate(0, 0.45, 0); part(fac(post, PAL.trunk, 77), sc, DOCK.x + 0.95, 0, DOCK.z0 + 0.2);
  return sp;
})();
const dockRing = new T.Mesh(new T.RingGeometry(0.42, 0.55, 32), new T.MeshBasicMaterial({ color: PAL.paper, transparent: true, opacity: 0.8 })); dockRing.rotation.x = -Math.PI / 2; dockRing.position.set(DOCK.x, 0.16, DOCK.z0 + 0.2); sc.add(dockRing);
const dockFill = new T.Mesh(new T.CircleGeometry(0.42, 32), new T.MeshBasicMaterial({ color: PAL.accent, transparent: true, opacity: 0.85 })); dockFill.rotation.x = -Math.PI / 2; dockFill.position.set(DOCK.x, 0.17, DOCK.z0 + 0.2); dockFill.scale.setScalar(0.001); sc.add(dockFill);
/* the screen fades to and from the sea colour between islands */
const fadeEl = (() => { const d = document.createElement('div'); d.setAttribute('aria-hidden', 'true'); d.style.cssText = 'position:fixed;inset:0;background:#2e8f9c;opacity:0;pointer-events:none;transition:opacity 0.6s ease;z-index:50'; document.body.appendChild(d); return d; })();
let trip = null, dockWait = 0;
const arriving = /[?&]from=boat\b/.test(location.search);
if (arriving) { fadeEl.style.transition = 'none'; fadeEl.style.opacity = '1'; trip = { st: 'arrive', t: 0 }; boat.position.z = DOCK.boat + 7; pip.position.set(DOCK.x, 0, DOCK.boat + 7); target.copy(pip.position); try { history.replaceState(null, '', location.pathname); } catch (e) {} requestAnimationFrame(() => requestAnimationFrame(() => { fadeEl.style.transition = 'opacity 0.8s ease'; fadeEl.style.opacity = '0'; })); }
function seat() { return tmpV.set(boat.position.x, boat.position.y + 0.42, boat.position.z + 0.15); }
function boatStep(dt) {
  boat.position.y = -0.32 + (reduced ? 0 : Math.sin(time * 1.6) * 0.04); boat.rotation.z = reduced ? 0 : Math.sin(time * 1.2) * 0.03;
  dockFill.scale.setScalar(Math.max(0.001, dockWait));
  if (!trip) {
    const onDock = Math.hypot(pip.position.x - DOCK.x, pip.position.z - (DOCK.z0 + 0.2)) < 0.6 && !riding() && !dressing;
    const still = Math.hypot(target.x - pip.position.x, target.z - pip.position.z) < 0.15;
    dockWait = onDock && still ? Math.min(1, dockWait + dt / 0.9) : Math.max(0, dockWait - dt * 3);
    dockRing.scale.setScalar(1 + (reduced ? 0 : Math.sin(time * 3) * 0.05));
    if (dockWait >= 1) { dockWait = 0; trip = { st: 'board', t: 0, from: pip.position.clone() }; Snd.play('powerup', { gain: 0.4 }); }
    return;
  }
  trip.t += dt; target.copy(pip.position);
  if (trip.st === 'board') {
    const q = Math.min(1, trip.t / 0.7), s = seat(); pip.position.lerpVectors(trip.from, s, q); pip.position.y += Math.sin(q * Math.PI) * 0.6; pip.rotation.y = 0;
    if (q >= 1) { trip.st = 'sail'; trip.t = 0; trip.v = 0; }
  } else if (trip.st === 'sail') {
    trip.v = Math.min(4, trip.v + dt * 2.5); boat.position.z += trip.v * dt; pip.position.copy(seat()); pip.rotation.y = 0;
    if (trip.t > 1.2 && !trip.faded) { trip.faded = true; if (canSail) fadeEl.style.opacity = '1'; }
    if (trip.t > 2.0 && !trip.gone) { trip.gone = true; if (canSail) { try { save(); } catch (e) {} location.href = THERE_PAGE + '?from=boat'; } else { trip.st = 'return'; trip.t = 0; } }
  } else if (trip.st === 'return' || trip.st === 'arrive') {
    /* sail back in to the dock (without a second island, the boat just takes a round trip) */
    const dz = boat.position.z - DOCK.boat; boat.position.z -= Math.max(1.6, Math.min(4.5, dz * 1.6)) * dt; if (boat.position.z < DOCK.boat) boat.position.z = DOCK.boat; pip.position.copy(seat()); pip.rotation.y = Math.PI;
    if (boat.position.z <= DOCK.boat + 0.01) { trip = { st: 'land', t: 0, from: pip.position.clone() }; }
  } else if (trip.st === 'land') {
    const q = Math.min(1, trip.t / 0.7), to = tmpV.set(DOCK.x, 0, DOCK.z0 - 0.5); pip.position.lerpVectors(trip.from, to, q); pip.position.y += Math.sin(q * Math.PI) * 0.6; pip.rotation.y = Math.PI;
    if (q >= 1) { pip.position.y = 0; target.copy(pip.position); trip = null; Snd.play('pop', { gain: 0.4, f: 520 }); }
  }
}

/* ---------- the upgrade house: walk in, visit a room, stand on its pad to buy ---------- */
const ISLE = HERE === 'farm' ? { x0: -16.3, x1: 16.3, z0: -10.9, z1: 10.9 } : { x0: -10.3, x1: 10.3, z0: -6.9, z1: 6.9 };
const HO = { x: 200, z: 0 }; /* the inside is built far out to sea, where nothing else is */
const IN_B = { x0: HO.x - 5.7, x1: HO.x + 5.7, z0: HO.z - 6.7, z1: HO.z + 5.4 };
let inHouse = false, houseReady = false;
const BND = () => inHouse ? IN_B : ISLE;
const HOUSE = HERE === 'farm' ? { x: 0, z: -5.3 } : { x: -8.2, z: 2.4 };
const HDOOR = { x: HOUSE.x, z: HOUSE.z + 1.55 };
const CUR_ICON = HERE === 'farm' ? 'heart' : 'coin';
const lampMatH = new T.MeshBasicMaterial({ color: '#ffe6a8' });
/* outside: a tall house with a big up-arrow over the door */
const houseG = new T.Group(); houseG.position.set(HOUSE.x, 0, HOUSE.z); sc.add(houseG);
{
  let g = new T.BoxGeometry(2.4, 1.5, 2.0, 2, 2, 2); g.translate(0, 0.75, 0); part(fac(jit(g, 0.02, 5), '#9fc7d6', 111), houseG);
  g = new T.CylinderGeometry(0.01, 1.85, 1.0, 4, 1); g.rotateY(Math.PI / 4); g.scale(1, 1, 0.82); g.translate(0, 2.0, 0); part(fac(g, PAL.ochre, 112), houseG);
  const door = new T.Mesh(new T.BoxGeometry(0.62, 0.95, 0.04), ink); door.position.set(0, 0.48, 1.01); houseG.add(door);
  [-0.8, 0.8].forEach((x) => { const w = new T.Mesh(new T.BoxGeometry(0.36, 0.36, 0.03), lampMatH); w.position.set(x, 0.95, 1.01); houseG.add(w); });
  g = new T.BoxGeometry(2.6, 0.08, 0.5); part(fac(g, PAL.trunk, 113), houseG, 0, 1.06, 1.2);
}
const upSign = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = PAL.accent; x.strokeStyle = PAL.ink; x.lineWidth = 6; x.beginPath(); x.arc(64, 64, 56, 0, 7); x.fill(); x.stroke();
  x.fillStyle = PAL.paper; x.beginPath(); x.moveTo(64, 22); x.lineTo(98, 62); x.lineTo(78, 62); x.lineTo(78, 100); x.lineTo(50, 100); x.lineTo(50, 62); x.lineTo(30, 62); x.closePath(); x.fill(); x.lineWidth = 5; x.stroke();
  const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false })); sp.renderOrder = 4; sp.scale.set(1.1, 1.1, 1); sp.position.set(HOUSE.x, 3.1, HOUSE.z + 0.4); sc.add(sp); return sp;
})();
const plusSign = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  x.fillStyle = '#74a857'; x.strokeStyle = PAL.ink; x.lineWidth = 5; x.beginPath(); x.arc(32, 32, 26, 0, 7); x.fill(); x.stroke();
  x.fillStyle = PAL.paper; x.fillRect(27, 16, 10, 32); x.fillRect(16, 27, 32, 10);
  const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false })); sp.renderOrder = 5; sp.scale.set(0.5, 0.5, 1); sc.add(sp); sp.visible = false; return sp;
})();
function mkRing(x, z) {
  const r = new T.Mesh(new T.RingGeometry(0.42, 0.55, 32), new T.MeshBasicMaterial({ color: PAL.paper, transparent: true, opacity: 0.85 })); r.rotation.x = -Math.PI / 2; r.position.set(x, 0.06, z); sc.add(r);
  const f = new T.Mesh(new T.CircleGeometry(0.42, 32), new T.MeshBasicMaterial({ color: PAL.accent, transparent: true, opacity: 0.85 })); f.rotation.x = -Math.PI / 2; f.position.set(x, 0.07, z); f.scale.setScalar(0.001); sc.add(f);
  return { r, f, x, z, w: 0 };
}
const doorRing = mkRing(HDOOR.x, HDOOR.z);
/* inside: a floor in the middle of a garden, low walls so the camera sees into every room */
const ROOMS = [
  { id: 'speed', x: -3.5, z: -2.25, floor: '#cfe6ef', side: -1 },
  { id: 'bag', x: -3.5, z: 2.25, floor: '#f3dfb0', side: -1 },
  { id: 'farm', x: 3.5, z: -2.25, floor: '#f7d3d3', side: 1 },
  { id: 'guests', x: 3.5, z: 2.25, floor: '#d8ecd0', side: 1 }
];
const WALLS = [
  { v: 0, z: 4.5, a: -6, b: 6, gaps: [[-1, 1]] }, { v: 0, z: -7, a: -6, b: 6, gaps: [] },
  { v: 1, x: -6, a: -7, b: 4.5, gaps: [] }, { v: 1, x: 6, a: -7, b: 4.5, gaps: [] },
  { v: 0, z: -4.5, a: -6, b: 6, gaps: [[-0.85, 0.85]] },
  { v: 1, x: -1, a: -4.5, b: 4.5, gaps: [[-2.95, -1.55], [1.55, 2.95]] }, { v: 1, x: 1, a: -4.5, b: 4.5, gaps: [[-2.95, -1.55], [1.55, 2.95]] },
  { v: 0, z: 0, a: -6, b: -1, gaps: [] }, { v: 0, z: 0, a: 1, b: 6, gaps: [] }
];
const inG = new T.Group(); inG.position.set(HO.x, 0, HO.z); sc.add(inG);
{
  let g = new T.PlaneGeometry(48, 40, 24, 20); g.rotateX(-Math.PI / 2); const yard = part(fac(g, (cx, cy, cz, i) => tone(Math.abs(cx) < 1.1 && cz > 4.5 ? PAL.sand : PAL.grass, i, 0.9)), inG); yard.castShadow = false;
  g = new T.BoxGeometry(12, 0.06, 11.5); part(fac(g, '#d9bf94', 114), inG, 0, 0.03, -1.25, true);
  ROOMS.concat([{ x: 0, z: -5.75, w: 12, d: 2.5, floor: '#e6dcf2' }]).forEach((r, k) => { const f = new T.Mesh(new T.PlaneGeometry(r.w || 4.9, r.d || 4.4), new T.MeshStandardMaterial({ color: r.floor, roughness: 1 })); f.rotation.x = -Math.PI / 2; f.position.set(r.x, 0.065, r.z); f.receiveShadow = true; inG.add(f); });
  WALLS.forEach((w, k) => {
    let s = w.a; const cuts = w.gaps.concat([[w.b, w.b]]);
    cuts.forEach(([g0, g1]) => { const len = g0 - s; if (len > 0.05) { const geo = w.v ? new T.BoxGeometry(0.16, 0.7, len) : new T.BoxGeometry(len, 0.7, 0.16); const m = part(fac(geo, PAL.paper, 120 + k), inG, w.v ? w.x : s + len / 2, 0.35, w.v ? s + len / 2 : w.z); const t = w.v ? new T.BoxGeometry(0.22, 0.06, len) : new T.BoxGeometry(len, 0.06, 0.22); part(fac(t, PAL.trunk, 130 + k), inG, m.position.x, 0.72, m.position.z, true); } s = g1; });
  });
  /* a doormat at the way out */
  g = new T.BoxGeometry(1.6, 0.03, 0.6); part(fac(g, PAL.accent, 140), inG, 0, 0.07, 4.9, true);
}
/* the menu's own pictures go on the room signs, so the rooms match what the child already knows */
function iconImg(id, cb) { const el = $('up-' + id), svg = el && el.querySelector('svg'); if (!svg) return; let s = svg.outerHTML; if (!/xmlns=/.test(s)) s = s.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'); const img = new Image(); img.onload = () => cb(img); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); }
const UP_BY = {}; UPS.forEach((u) => { UP_BY[u.id] = u; });
const ghostMat = new T.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.38, roughness: 1, depthWrite: false });
function ghostOf(obj) { const g = obj.clone(true); g.traverse((m) => { if (m.isMesh) m.material = ghostMat; }); return g; }
function runnerShoe() { const g = new T.Group(); let geo = new T.BoxGeometry(0.34, 0.18, 0.5); part(fac(geo, PAL.accent, 150), g, 0, 0.14, 0); geo = new T.BoxGeometry(0.36, 0.06, 0.54); part(fac(geo, PAL.paper, 151), g, 0, 0.03, 0.01); geo = new T.BoxGeometry(0.3, 0.14, 0.2); part(fac(geo, PAL.accent, 152), g, 0, 0.27, -0.12); return g; }
function crate() { const g = new T.Group(), geo = new T.BoxGeometry(0.42, 0.22, 0.32); part(fac(jit(geo, 0.01, 2), PAL.ochre, 153), g, 0, 0.11, 0); return g; }
function miniHen() { const g = new T.Group(); let geo = ico(0.24, 1, 3, 0.02); geo.scale(1.1, 0.9, 1); part(fac(geo, PAL.paper, 154), g, 0, 0.3, 0); part(fac(ico(0.13, 0, 4), PAL.paper, 155), g, 0, 0.55, 0.17); part(fac(new T.BoxGeometry(0.04, 0.09, 0.12), PAL.accent, 156), g, 0, 0.7, 0.16); geo = new T.ConeGeometry(0.04, 0.09, 4); geo.rotateX(Math.PI / 2); part(fac(geo, PAL.ochre, 157), g, 0, 0.55, 0.33); return g; }
function miniGuest(col) { const g = new T.Group(); let geo = new T.CylinderGeometry(0.14, 0.18, 0.5, 6); part(fac(geo, col, 158), g, 0, 0.25, 0); part(fac(ico(0.15, 1, 5), '#e8b48f', 159), g, 0, 0.65, 0); return g; }
function miniBot() { const g = new T.Group(); let geo = new T.BoxGeometry(0.34, 0.3, 0.3); part(fac(geo, PAL.paper, 160), g, 0, 0.32, 0); const v = new T.Mesh(new T.BoxGeometry(0.26, 0.1, 0.02), ink); v.position.set(0, 0.36, 0.16); g.add(v); geo = new T.CylinderGeometry(0.12, 0.12, 0.08, 8); part(fac(geo, PAL.sea, 161), g, 0, 0.1, 0); return g; }
const rooms = ROOMS.map((r) => {
  const u = UP_BY[r.id], cx = HO.x + r.x, cz = HO.z + r.z, padX = cx - r.side * 1.15, showX = cx + r.side * 1.0;
  const ring = mkRing(padX, cz);
  /* the pad shows the price and how much is already paid */
  const c = document.createElement('canvas'); c.width = c.height = 192; const tex = new T.CanvasTexture(c);
  const pad = new T.Mesh(new T.CircleGeometry(0.62, 32), new T.MeshBasicMaterial({ map: tex, transparent: true })); pad.rotation.x = -Math.PI / 2; pad.position.set(padX, 0.08, cz); sc.add(pad);
  ring.r.visible = false; ring.f.visible = false;
  /* the sign on the back wall: the picture and one dot per level */
  const sc2 = document.createElement('canvas'); sc2.width = 256; sc2.height = 200; const stex = new T.CanvasTexture(sc2);
  const sign = new T.Sprite(new T.SpriteMaterial({ map: stex, depthTest: false })); sign.renderOrder = 4; sign.scale.set(1.7, 1.33, 1); sign.position.set(cx + r.side * 1.6, 1.7, cz - 1.25); sc.add(sign);
  const room = { r, u, cx, cz, padX, showX, pad, tex, c, sign, stex, sc2, img: null, shown: '', demo: new T.Group(), t: 0, bits: [] };
  room.demo.position.set(showX, 0, cz); sc.add(room.demo);
  iconImg(r.id, (img) => { room.img = img; room.shown = ''; });
  buildDemo(room);
  return room;
});
function drawRoom(room) {
  const u = room.u, lv = state.lv[u.id], maxed = lv >= u.max, cost = upCost(u), paid = (state.upPaid && state.upPaid[u.id]) || 0, key = lv + ':' + paid + ':' + (state.coins >= cost - paid) + ':' + !!room.img;
  if (key === room.shown) return; room.shown = key;
  let x = room.c.getContext('2d'); x.clearRect(0, 0, 192, 192);
  x.fillStyle = maxed ? '#fff2c2' : 'rgba(255,246,228,0.95)'; x.beginPath(); x.arc(96, 96, 90, 0, 7); x.fill();
  if (!maxed) { x.lineWidth = 10; x.strokeStyle = PAL.ochre; x.beginPath(); x.arc(96, 96, 84, -Math.PI / 2, -Math.PI / 2 + 6.2832 * paid / cost); x.stroke(); }
  if (maxed) { x.fillStyle = PAL.ochre; x.font = '700 90px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('★', 96, 100); }
  else { drawIcon(x, CUR_ICON, 52, 98, 0.75); x.fillStyle = PAL.ink; x.font = '700 54px Fredoka, sans-serif'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(fmt(cost - paid), 76, 102); }
  room.tex.needsUpdate = true;
  x = room.sc2.getContext('2d'); x.clearRect(0, 0, 256, 200);
  x.fillStyle = PAL.paper; x.strokeStyle = PAL.ink; x.lineWidth = 6; x.beginPath(); x.roundRect ? x.roundRect(8, 8, 240, 184, 28) : x.rect(8, 8, 240, 184); x.fill(); x.stroke();
  if (room.img) x.drawImage(room.img, 78, 18, 100, 100);
  const n = u.max, w = 22, gap = 6, x0 = 128 - (n * w + (n - 1) * gap) / 2;
  for (let i = 0; i < n; i++) { x.fillStyle = i < lv ? '#74a857' : '#e6d9bd'; x.strokeStyle = PAL.ink; x.lineWidth = 3; x.beginPath(); x.arc(x0 + i * (w + gap) + w / 2, 150, w / 2, 0, 7); x.fill(); x.stroke(); }
  room.stex.needsUpdate = true;
}
/* each room shows what its upgrade does: now (solid) and after buying (see-through) */
function buildDemo(room) {
  const d = room.demo, id = room.r.id;
  if (id === 'speed') {
    const tr = new T.Mesh(new T.TorusGeometry(1.0, 0.06, 4, 32), new T.MeshStandardMaterial({ color: PAL.paper, roughness: 1 })); tr.rotation.x = Math.PI / 2; tr.scale.set(1, 0.7, 1); tr.position.y = 0.08; d.add(tr);
    room.a = runnerShoe(); room.b = ghostOf(room.a); d.add(room.a, room.b); room.pa = 0; room.pb = 0;
  } else if (id === 'bag' || (id === 'guests' && HERE === 'shop') || (id === 'farm' && HERE === 'shop')) {
    room.stack = new T.Group(); d.add(room.stack);
    if (id === 'bag') { const basket = new T.BoxGeometry(0.7, 0.12, 0.5); part(fac(basket, PAL.trunk, 162), d, 0, 0.06, 0); }
    if (id === 'farm') { room.hen = miniHen(); room.hen.position.set(-0.3, 0, -0.3); room.hen.rotation.y = 0.6; d.add(room.hen); }
    if (id === 'guests') { const ct = new T.BoxGeometry(0.9, 0.5, 0.4); part(fac(ct, '#7d5e4e', 163), d, 0, 0.25, -1.3); }
  } else if (id === 'farm') {
    room.hen = miniHen(); room.hen.scale.setScalar(1.4); d.add(room.hen); room.stack = new T.Group(); d.add(room.stack);
  } else if (id === 'guests') {
    const tr = new T.Mesh(new T.TorusGeometry(1.0, 0.06, 4, 32), new T.MeshStandardMaterial({ color: PAL.paper, roughness: 1 })); tr.rotation.x = Math.PI / 2; tr.scale.set(1, 0.7, 1); tr.position.y = 0.08; d.add(tr);
    room.a = miniBot(); room.b = ghostOf(room.a); d.add(room.a, room.b); room.pa = 0; room.pb = 0;
  }
  room.lvBuilt = -1;
}
function syncDemo(room) {
  const id = room.r.id, lv = state.lv[room.u.id], maxed = lv >= room.u.max; if (room.lvBuilt === lv) return; room.lvBuilt = lv;
  if (room.b) room.b.visible = !maxed;
  if (!room.stack) return;
  while (room.stack.children.length) room.stack.remove(room.stack.children[0]);
  if (id === 'bag') { const n = Math.min(14, 4 + 2 * lv), nn = maxed ? n : Math.min(16, n + 2); for (let k = 0; k < nn; k++) { const m = k < n ? crate() : ghostOf(crate()); m.position.set(0, 0.12 + k * 0.23, 0); m.rotation.y = (k % 2) * 0.2; room.stack.add(m); } }
  if (id === 'guests') { const n = 1 + lv, cols = [PAL.sea, PAL.accent, '#7b5ea7', '#3f7d62', PAL.ochre]; for (let k = 0; k < n + (maxed ? 0 : 1); k++) { const m = k < n ? miniGuest(cols[k % 5]) : ghostOf(miniGuest(PAL.paper)); m.position.set(((k % 3) - 1) * 0.55, 0, -0.7 + Math.floor(k / 3) * 0.6); m.rotation.y = Math.PI; room.stack.add(m); } }
}
/* the egg or heart demo pops more with each level */
function popDemo(room, dt) {
  const lv = state.lv[room.u.id]; room.t -= dt;
  if (room.t <= 0) {
    room.t = HERE === 'shop' ? 2.4 / (1 + 0.25 * lv) : 1.8;
    const n = HERE === 'shop' ? 1 : Math.max(1, Math.round(1 + 0.25 * lv * 4) ); room.hen.userData.hop = 1;
    for (let k = 0; k < Math.min(n, 9); k++) { const m = HERE === 'shop' ? mk('egg') : new T.Mesh(heartGeo, heartMat); m.position.set(room.hen.position.x + room.demo.position.x, 0.8, room.hen.position.z + room.demo.position.z); const a = k / Math.max(1, n) * 6.28 + Math.random(); m.userData = Object.assign(m.userData || {}, { dv: new T.Vector3(Math.cos(a) * 0.9, 2.6 + Math.random(), Math.sin(a) * 0.9), dt: 0 }); sc.add(m); room.bits.push(m); }
  }
  for (let i = room.bits.length - 1; i >= 0; i--) { const m = room.bits[i], u = m.userData; u.dt += dt; u.dv.y -= 9 * dt; m.position.addScaledVector(u.dv, dt); if (m.position.y < 0.1) { m.position.y = 0.1; u.dv.set(0, 0, 0); } if (u.dt > 1.4) { sc.remove(m); room.bits.splice(i, 1); } }
  const h = room.hen.userData.hop || 0; room.hen.position.y = Math.sin(h * Math.PI) * 0.25; room.hen.userData.hop = Math.max(0, h - dt * 3);
}
/* the wardrobe room: a mirror and a clothes rail; stand in front of the mirror to change */
const wardRing = mkRing(HO.x, HO.z - 6.15);
{
  const fr = new T.BoxGeometry(1.2, 1.8, 0.12); part(fac(fr, PAL.trunk, 170), inG, 0, 0.95, -6.8);
  const gl = new T.Mesh(new T.PlaneGeometry(0.95, 1.55), new T.MeshStandardMaterial({ color: '#cfe8f2', roughness: 0.15, metalness: 0.3 })); gl.position.set(0, 0.95, -6.73); inG.add(gl);
  /* the farm game has the bed on the left, so all the clothes hang on one long rail on the right */
  if (HERE_T === 'farm') { const pole = new T.CylinderGeometry(0.04, 0.04, 1.4, 6); part(fac(pole, PAL.ink, 171), inG, 1.9, 0.7, -6.2); part(fac(pole, PAL.ink, 171), inG, 5.7, 0.7, -6.2); const bar = new T.CylinderGeometry(0.03, 0.03, 3.8, 6); bar.rotateZ(Math.PI / 2); part(fac(bar, PAL.ink, 172), inG, 3.8, 1.38, -6.2);
    AVO.sh.slice(0, 8).forEach((col, k) => { const t = new T.BoxGeometry(0.36, 0.5, 0.08); part(fac(t, col, 173 + k), inG, 2.25 + k * 0.45, 1.05, -6.2); }); }
  else [-1, 1].forEach((s) => { const pole = new T.CylinderGeometry(0.04, 0.04, 1.4, 6); part(fac(pole, PAL.ink, 171), inG, s * 3.0, 0.7, -6.2); part(fac(pole, PAL.ink, 171), inG, s * 5.0, 0.7, -6.2); const bar = new T.CylinderGeometry(0.03, 0.03, 2.0, 6); bar.rotateZ(Math.PI / 2); part(fac(bar, PAL.ink, 172), inG, s * 4.0, 1.38, -6.2);
    AVO.sh.slice(s < 0 ? 0 : 4, s < 0 ? 4 : 8).forEach((col, k) => { const t = new T.BoxGeometry(0.36, 0.5, 0.08); part(fac(t, col, 173 + k), inG, s * (3.3 + k * 0.45), 1.05, -6.2); }); });
}
let wardLatch = false, doorT = 0;
function goInside(to) {
  if (doorT > 0) return; doorT = 1; fadeEl.style.opacity = '1'; Snd.play('pop', { gain: 0.4, f: to ? 420 : 620 });
  setTimeout(() => {
    inHouse = to;
    if (to) { pip.position.set(HO.x, 0, HO.z + 3.7); pip.rotation.y = Math.PI; } else { pip.position.set(HDOOR.x, 0, HDOOR.z + 0.7); pip.rotation.y = 0; }
    target.copy(pip.position); camFocus.copy(pip.position); lastP.copy(pip.position); doorRing.w = 0;
    setTimeout(() => { fadeEl.style.opacity = '0'; doorT = 0; }, 120);
  }, 420);
}
const lastP = new T.Vector3().copy(pip.position);
function stillOn(ring, dt, r) { const on = Math.hypot(pip.position.x - ring.x, pip.position.z - ring.z) < (r || 0.6), still = Math.hypot(target.x - pip.position.x, target.z - pip.position.z) < 0.15; return on && still; }
function houseStep(dt) {
  /* outside: the doormat takes you in */
  houseReady = !window.PIPS_STORE && UPS.some((u) => state.lv[u.id] < u.max && state.coins >= upCost(u) - ((state.upPaid && state.upPaid[u.id]) || 0));
  plusSign.visible = houseReady && !inHouse; plusSign.position.set(HOUSE.x + 0.7, 3.5 + (reduced ? 0 : Math.abs(Math.sin(time * 3)) * 0.15), HOUSE.z + 0.4);
  upSign.position.y = 3.1 + (reduced ? 0 : Math.sin(time * 2) * 0.06);
  if (!inHouse) {
    /* the house is solid from outside */
    { const dx = pip.position.x - HOUSE.x, dz = pip.position.z - HOUSE.z, hx = 1.45, hz = 1.25; if (Math.abs(dx) < hx && Math.abs(dz) < hz) { if (hx - Math.abs(dx) < hz - Math.abs(dz)) pip.position.x = HOUSE.x + Math.sign(dx || 1) * hx; else pip.position.z = HOUSE.z + Math.sign(dz || 1) * hz; } }
    const ok = !riding() && !dressing && !trip && doorT <= 0 && stillOn(doorRing, dt);
    doorRing.w = ok ? Math.min(1, doorRing.w + dt / 0.5) : Math.max(0, doorRing.w - dt * 3); doorRing.f.scale.setScalar(Math.max(0.001, doorRing.w));
    if (doorRing.w >= 1) goInside(true);
    lastP.copy(pip.position); return;
  }
  /* walls: Pip cannot walk through them, only through the doorways */
  const lx0 = lastP.x - HO.x, lz0 = lastP.z - HO.z, lx1 = pip.position.x - HO.x, lz1 = pip.position.z - HO.z;
  for (const w of WALLS) {
    if (w.v) { if ((lx0 - w.x) * (lx1 - w.x) < 0 || Math.abs(lx1 - w.x) < 0.18) { const z = lz1; if (z > w.a - 0.1 && z < w.b + 0.1 && !w.gaps.some(([g0, g1]) => z > g0 + 0.2 && z < g1 - 0.2)) { pip.position.x = lastP.x; if (Math.abs(lx0 - w.x) < 0.18) pip.position.x = HO.x + w.x + Math.sign(lx0 - w.x || 1) * 0.19; } } }
    else if ((lz0 - w.z) * (lz1 - w.z) < 0 || Math.abs(lz1 - w.z) < 0.18) { const x = lx1; if (x > w.a - 0.1 && x < w.b + 0.1 && !w.gaps.some(([g0, g1]) => x > g0 + 0.2 && x < g1 - 0.2)) { if (w.z === 4.5 && Math.abs(x) < 1) continue; pip.position.z = lastP.z; if (Math.abs(lz0 - w.z) < 0.18) pip.position.z = HO.z + w.z + Math.sign(lz0 - w.z || 1) * 0.19; } }
  }
  lastP.copy(pip.position);
  /* out through the front door */
  if (pip.position.z > HO.z + 5.0 && doorT <= 0) goInside(false);
  /* rooms: stand on the pad to pay a little at a time, like the pads outside */
  if (!state.upPaid) state.upPaid = {};
  rooms.forEach((room) => {
    if (window.PIPS_STORE) { if (!room.hid) { room.hid = 1; room.pad.visible = room.sign.visible = room.demo.visible = false; room.bits.forEach((m) => sc.remove(m)); room.bits.length = 0; } return; }
    const u = room.u, lv = state.lv[u.id], maxed = lv >= u.max, cost = upCost(u);
    const on = Math.hypot(pip.position.x - room.padX, pip.position.z - room.cz) < 0.62, still = Math.hypot(target.x - pip.position.x, target.z - pip.position.z) < 0.15;
    if (on && still && !maxed && state.coins > 0) {
      const left = cost - (state.upPaid[u.id] || 0), amt = Math.min(state.coins, left, Math.max(1, Math.ceil(cost * dt / 1.4)));
      state.coins -= amt; state.upPaid[u.id] = (state.upPaid[u.id] || 0) + amt; room.tick = (room.tick || 0) - dt; if (room.tick <= 0) { room.tick = 0.08; Snd.play('tick', { gain: 0.3, f: 1200 }, 0, 70); }
      if (state.upPaid[u.id] >= cost) { state.upPaid[u.id] = 0; state.lv[u.id]++; Snd.play('powerup', { gain: 0.55 }); Snd.play('sparkle', { gain: 0.4 }, 0.1); room.sign.scale.set(2.1, 1.65, 1); save(); }
    }
    if (on && still && !maxed && state.coins <= 0 && !room.poor) { room.poor = true; Snd.play('tock', { gain: 0.3, f: 300 }); flash($('coins').parentNode, 'no'); }
    if (!on) room.poor = false;
    room.sign.scale.lerp(tmpV.set(1.7, 1.33, 1), Math.min(1, dt * 6));
    room.pad.scale.setScalar(on && !maxed ? 1.08 : 1 + (reduced || maxed ? 0 : Math.sin(time * 3) * 0.03));
    drawRoom(room); syncDemo(room);
    const sp = (base) => base * (reduced ? 0.4 : 1);
    if (room.r.id === 'speed') { const s0 = speed() / 3.0, s1 = (3.0 + 0.45 * Math.min(u.max, lv + 1)) / 3.0 * (HERE === 'farm' ? 1 : 1); room.pa += dt * sp(1.6) * s0; room.pb += dt * sp(1.6) * s1; [[room.a, room.pa], [room.b, room.pb]].forEach(([m, p]) => { m.position.set(Math.cos(p), 0.1, Math.sin(p) * 0.7); m.rotation.y = -p; }); }
    if (room.r.id === 'guests' && HERE === 'farm') { const s0 = helpSpeed(), s1 = 2.2 * (1 + 0.15 * Math.min(u.max, lv + 1)); room.pa += dt * sp(0.7) * s0; room.pb += dt * sp(0.7) * s1; [[room.a, room.pa], [room.b, room.pb]].forEach(([m, p]) => { m.position.set(Math.cos(p), 0, Math.sin(p) * 0.7); m.rotation.y = -p; }); }
    if (room.r.id === 'farm') popDemo(room, dt);
  });
  /* the mirror opens the wardrobe once each time you step up to it */
  const atMirror = stillOn(wardRing, dt, 0.7);
  wardRing.f.scale.setScalar(dressing ? 1 : 0.001);
  if (atMirror && !wardLatch && !dressing) { wardLatch = true; openWardrobe(); }
  if (Math.hypot(pip.position.x - wardRing.x, pip.position.z - wardRing.z) > 0.9) wardLatch = false;
}

/* ---------- producers ---------- */
const producers = [];
/* each hen and cow gets its own coat */
const HEN_COAT = [PAL.paper, '#c9773f', '#3a3433', '#e8c27a', '#9a948c', '#f3e3c8'];
const COW_COAT = [[PAL.paper, PAL.ink], ['#8a5a3c', PAL.paper], ['#b07a4f', '#efe1c4'], ['#3a3433', PAL.paper]];
function hen(i) {
  const s = SPOT.hen[i], g = new T.Group(); g.position.set(s[0], 0, s[1]); sc.add(g);
  const nest = new T.TorusGeometry(0.34, 0.12, 4, 9); nest.rotateX(Math.PI / 2); part(fac(jit(nest, 0.02, i), PAL.ochre, i), g, 0, 0.1, 0.35, true);
  const body = new T.Group(); body.position.set(0, 0, -0.2); g.add(body);
  let geo = ico(0.24, 1, i, 0.02); geo.scale(1.1, 0.9, 1); part(fac(geo, HEN_COAT[i % HEN_COAT.length], i), body, 0, 0.3, 0);
  part(fac(ico(0.13, 0, i + 1), HEN_COAT[i % HEN_COAT.length], i + 1), body, 0, 0.55, 0.17); part(fac(new T.BoxGeometry(0.04, 0.09, 0.1), PAL.accent, 1), body, 0, 0.68, 0.17);
  geo = new T.ConeGeometry(0.04, 0.09, 4); geo.rotateX(Math.PI / 2); part(fac(geo, PAL.ochre, 2), body, 0, 0.55, 0.32);
  [-0.05, 0.05].forEach((x) => { const e = new T.Mesh(new T.SphereGeometry(0.02, 6, 4), ink); e.position.set(x, 0.58, 0.28); body.add(e); });
  const pile = new Pile(g, (k) => [Math.cos(k * 1.57 + 0.4) * 0.17, 0.08 + Math.floor(k / 4) * 0.14, 0.35 + Math.sin(k * 1.57 + 0.4) * 0.12]);
  producers.push({ kind: 'hen', type: 'egg', g, body, pile, x: s[0], z: s[1] + 0.35, every: 3.5, max: 4, t: 0, r: 0.95 });
}
function appleTree(i) {
  const s = SPOT.tree[i], g = new T.Group(); g.position.set(s[0], 0, s[1]); sc.add(g);
  let geo = new T.CylinderGeometry(0.1, 0.14, 0.8, 5); geo.translate(0, 0.4, 0); part(fac(geo, PAL.trunk, i), g);
  part(fac(ico(0.7, 1, i + 10), PAL.leaf, i + 10), g, 0, 1.35, 0);
  for (let k = 0; k < 6; k++) part(fac(new T.IcosahedronGeometry(0.08, 0), PAL.accent, k), g, Math.cos(k * 1.05) * 0.6, 1.1 + hash(k, i) * 0.4, Math.sin(k * 1.05) * 0.6, true);
  geo = new T.BoxGeometry(0.7, 0.18, 0.45); geo.translate(0, 0.09, 0); part(fac(geo, PAL.trunk, i + 3), g, 0, 0, 1.0);
  const pile = new Pile(g, (k) => [-0.2 + (k % 3) * 0.2, 0.16 + Math.floor(k / 6) * 0.2, 0.92 + (Math.floor(k / 3) % 2) * 0.17]);
  producers.push({ kind: 'tree', type: 'apple', g, body: null, pile, x: s[0], z: s[1] + 1.0, every: 5, max: 6, t: 0, r: 1.0 });
}
function cow(i) {
  const s = SPOT.cow[i], g = new T.Group(); g.position.set(s[0], 0, s[1]); sc.add(g);
  const body = new T.Group(); g.add(body); const [cb, cs] = COW_COAT[i % COW_COAT.length];
  let geo = new T.BoxGeometry(0.9, 0.5, 0.5, 2, 2, 2); part(fac(jit(geo, 0.03, i), cb, i), body, 0, 0.62, 0);
  for (let k = 0; k < 3; k++) part(fac(new T.BoxGeometry(0.22, 0.2, 0.02), cs, k), body, -0.25 + k * 0.25, 0.68 + hash(k, i) * 0.08, 0.26, true);
  for (let k = 0; k < 4; k++) { geo = new T.CylinderGeometry(0.06, 0.06, 0.4, 5); geo.translate(0, 0.2, 0); part(fac(geo, cb, k), body, k % 2 ? 0.32 : -0.32, 0, k < 2 ? 0.16 : -0.16); }
  geo = new T.BoxGeometry(0.34, 0.32, 0.3); part(fac(geo, cb, 5), body, 0.55, 0.8, 0); part(fac(new T.BoxGeometry(0.1, 0.14, 0.26), PAL.blush, 6), body, 0.74, 0.74, 0);
  [-0.09, 0.09].forEach((z) => { const h = new T.ConeGeometry(0.03, 0.12, 4); part(fac(h, PAL.sand, 7), body, 0.5, 1.02, z); const e = new T.Mesh(new T.SphereGeometry(0.025, 6, 4), ink); e.position.set(0.7, 0.86, z * 1.2); body.add(e); });
  body.rotation.y = -0.5;
  geo = new T.BoxGeometry(0.62, 0.16, 0.4); geo.translate(0, 0.08, 0); part(fac(geo, PAL.sea, i + 3), g, 0, 0, 1.2);
  const pile = new Pile(g, (k) => [-0.2 + (k % 3) * 0.2, 0.14 + Math.floor(k / 6) * 0.27, 1.12 + (Math.floor(k / 3) % 2) * 0.16]);
  producers.push({ kind: 'cow', type: 'milk', g, body, pile, x: s[0], z: s[1] + 1.2, every: 7, max: 6, t: 0, r: 1.0 });
}
let bakery = null;
function makeBakery() {
  const g = new T.Group(); g.position.set(BAKERY.x, 0, BAKERY.z); sc.add(g);
  let geo = new T.BoxGeometry(2.2, 1.3, 1.5, 3, 2, 2); geo.translate(0, 0.65, 0); part(fac(jit(geo, 0.02, 3), PAL.paper, 3), g);
  geo = new T.ConeGeometry(1.7, 0.8, 4); geo.rotateY(Math.PI / 4); geo.scale(1, 1, 0.75); geo.translate(0, 1.7, 0); part(fac(geo, PAL.accent, 4), g);
  geo = new T.BoxGeometry(0.25, 0.6, 0.25); part(fac(geo, PAL.rock, 5), g, 0.6, 1.9, -0.2);
  const door = new T.Mesh(new T.BoxGeometry(0.45, 0.7, 0.02), ink); door.position.set(0, 0.35, 0.76); g.add(door);
  [B_IN, B_OUT].forEach((b, k) => { const t2 = new T.BoxGeometry(0.75, 0.12, 0.6); part(fac(t2, k ? PAL.ochre : PAL.trunk, 6 + k), sc, b.x, 0.06, b.z); });
  const smoke = []; for (let k = 0; k < 4; k++) { const m = part(fac(ico(0.16, 0, k), PAL.cloud, k), g, 0.6, 2.3, -0.2, true); m.userData.ph = k / 4; smoke.push(m); }
  bakery = { g, smoke, inp: new Pile(sc, (k) => [B_IN.x - 0.22 + (k % 3) * 0.22, 0.12 + Math.floor(k / 6) * 0.2, B_IN.z - 0.12 + (Math.floor(k / 3) % 2) * 0.24]), out: new Pile(sc, (k) => [B_OUT.x - 0.2 + (k % 3) * 0.2, 0.12 + Math.floor(k / 6) * 0.15, B_OUT.z - 0.12 + (Math.floor(k / 3) % 2) * 0.26]), t: 0, every: 2.2, work: 0 };
  producers.push({ kind: 'bakery', type: 'cake', pile: bakery.out, x: B_OUT.x, z: B_OUT.z, every: 0, max: 12, t: 0, r: 0.9 });
}

/* ---------- the shop counter ---------- */
const counterG = new T.Group(); counterG.position.set(COUNTER.x, 0, COUNTER.z); sc.add(counterG);
{
  let geo = new T.BoxGeometry(2.8, 0.75, 0.8, 3, 1, 1); geo.translate(0, 0.375, 0); part(fac(jit(geo, 0.02, 1), PAL.trunk, 1), counterG);
  geo = new T.BoxGeometry(2.95, 0.07, 0.9); part(fac(geo, PAL.sand, 2), counterG, 0, 0.78, 0);
  [-1.35, 1.35].forEach((x) => { const p = new T.CylinderGeometry(0.04, 0.04, 1.7, 5); p.translate(0, 0.85, 0); part(fac(p, PAL.trunk, 3), counterG, x, 0, -0.35); });
  for (let k = 0; k < 7; k++) { const a = new T.BoxGeometry(0.44, 0.06, 1.0); a.rotateX(0.35); part(fac(a, k % 2 ? PAL.paper : PAL.accent, k), counterG, -1.32 + k * 0.44, 1.75, -0.05); }
}
const SHELF_X = { egg: -0.95, apple: -0.32, milk: 0.32, cake: 0.95 };
const shelf = {}; Object.keys(SHELF_X).forEach((t) => { shelf[t] = new Pile(counterG, (k) => [SHELF_X[t] - 0.12 + (k % 2) * 0.24, 0.82 + Math.floor(k / 4) * ITEM_H[t], -0.12 + (Math.floor(k / 2) % 2) * 0.24]); });
const SHELF_MAX = 16;
/* back-stock crate beside the counter: when a shelf is full, extra goods go here and refill the shelf by themselves */
const BACK = { x: 1.75, z: 0.3 }, BACK_MAX = 80;
const backG = new T.Group(); backG.position.set(BACK.x, 0, BACK.z); sc.add(backG);
{
  const base = new T.BoxGeometry(1.2, 0.08, 1.0); part(fac(base, PAL.trunk, 11), backG, 0, 0.04, 0);
  [[0, 0.45], [0, -0.45]].forEach(([x, z], k) => { const w = new T.BoxGeometry(1.2, 0.36, 0.08); part(fac(jit(w, 0.01, k), PAL.ochre, 12 + k), backG, x, 0.22, z); });
  [[0.56, 0], [-0.56, 0]].forEach(([x, z], k) => { const w = new T.BoxGeometry(0.08, 0.36, 1.0); part(fac(jit(w, 0.01, k + 3), PAL.ochre, 14 + k), backG, x, 0.22, z); });
}
const back = new Pile(backG, (k) => [-0.38 + (k % 4) * 0.25, 0.14 + Math.floor(k / 12) * 0.2, -0.27 + (Math.floor(k / 4) % 3) * 0.27]);
/* put one item on its shelf, or in the crate if the shelf is full; false when both are full */
function stock(m) {
  const t = m.userData.type;
  if (shelf[t].items.length < SHELF_MAX) { fly(m, () => counterG.localToWorld(tmpV.set(SHELF_X[t], 1.0, 0)), () => shelf[t].add(m)); return true; }
  if (back.items.length < BACK_MAX) { fly(m, () => backG.localToWorld(tmpV.set(0, 0.4, 0)), () => back.add(m)); return true; }
  return false;
}
let backT = 0, farmT = 1;
/* deliveries from the farm game on the same device: eggs and milk land in the crate */
const EGG_SVG = '<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="26" rx="13" ry="16" fill="#fffbf4" stroke="#22303c" stroke-width="3"/></svg>', MILK_SVG = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M17 16 H31 V40 C31 42 29 43 27 43 H21 C19 43 17 42 17 40 Z" fill="#fff6e4" stroke="#22303c" stroke-width="3" stroke-linejoin="round"/><rect x="19" y="7" width="10" height="9" fill="#1f6a80" stroke="#22303c" stroke-width="3"/></svg>';
function farmDelivery() {
  let s; try { s = JSON.parse(localStorage.getItem('pips-delivery') || 'null'); } catch (e) { return; }
  if (!s || !((s.egg | 0) > 0 || (s.milk | 0) > 0)) return;
  let room = BACK_MAX - back.items.length; if (room <= 0) return;
  const got = { egg: 0, milk: 0 };
  ['egg', 'milk'].forEach((t) => { const n = Math.min(s[t] | 0, room); for (let k = 0; k < n; k++) { const m = mk(t); m.position.set(BACK.x + (k % 5 - 2) * 0.3, 4, BACK.z + 7); sc.add(m); m.updateMatrixWorld(); fly(m, () => backG.localToWorld(tmpV.set(0, 0.4, 0)), () => back.add(m), 0.6 + k * 0.05); } got[t] = n; room -= n; s[t] = (s[t] | 0) - n; });
  try { localStorage.setItem('pips-delivery', JSON.stringify(s)); } catch (e) {}
  if (got.egg + got.milk) {
    Snd.play('success', { gain: 0.5, f: 'C6' });
    const el = $('toast'); if (el) { el.innerHTML = (got.egg ? EGG_SVG + '<b>' + got.egg + '</b>' : '') + (got.milk ? MILK_SVG + '<b>' + got.milk + '</b>' : ''); el.setAttribute('aria-label', 'Från bondgården: ' + got.egg + ' ägg och ' + got.milk + ' mjölk'); el.hidden = false; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); clearTimeout(farmDelivery.t); farmDelivery.t = setTimeout(() => { el.hidden = true; }, 3200); }
  }
}
/* money pile in front of the shop */
const coinGeo = fac(new T.CylinderGeometry(0.13, 0.13, 0.05, 8), PAL.ochre, 3);
function makeMoney(x, z) {
  const o = { n: 0, meshes: [], g: new T.Group(), x, z }; o.g.position.set(x, 0, z); sc.add(o.g);
  const mat = new T.Mesh(new T.CylinderGeometry(0.55, 0.55, 0.02, 10), new T.MeshBasicMaterial({ color: PAL.sand })); mat.position.y = 0.01; o.g.add(mat);
  o.show = function () { const money = this; moneyShowFor(money); }; piles.push(o); return o;
}
const piles = [];
const money = makeMoney(MONEY.x, MONEY.z);
function moneyShow() { moneyShowFor(money); }
function moneyShowFor(money) { const show = Math.min(48, Math.ceil(money.n / Math.max(1, Math.ceil(money.n / 48)))); while (money.meshes.length < show) { const k = money.meshes.length, m = new T.Mesh(coinGeo, MAT); m.castShadow = true; m.position.set(-0.24 + (k % 3) * 0.24, 0.04 + Math.floor(k / 9) * 0.055, -0.24 + (Math.floor(k / 3) % 3) * 0.24); money.g.add(m); money.meshes.push(m); } while (money.meshes.length > show) money.g.remove(money.meshes.pop()); }

/* zone rings on the ground so a small child can see where to stand */
const ringMat = new T.MeshBasicMaterial({ color: PAL.paper, transparent: true, opacity: 0.55 });
function ring(x, z, r) { const m = new T.Mesh(new T.RingGeometry(r - 0.07, r, 28), ringMat); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.03, z); sc.add(m); return m; }
ring(DROP.x, DROP.z, 0.9);

/* ---------- customers ---------- */
const SLOTS = [[COUNTER.x - 0.95, COUNTER.z - 1.75], [COUNTER.x, COUNTER.z - 1.75], [COUNTER.x + 0.95, COUNTER.z - 1.75],
  [COUNTER.x - 0.95, COUNTER.z - 2.75], [COUNTER.x, COUNTER.z - 2.75], [COUNTER.x + 0.95, COUNTER.z - 2.75]];
const STALL_T = ['egg', 'apple', 'milk', 'cake'];
STALL_T.forEach((t) => { const a = STALL_AT[t]; SLOTS.push([a[0] - 0.5, a[1] - 1.5], [a[0] + 0.5, a[1] - 1.5]); });
const slotStall = (i) => (i >= 6 ? STALL_T[(i - 6) >> 1] : null);
const VIA = [9.5, 2.6]; /* stall guests walk round the shop, not through it */
/* each sign out on the road brings guests sooner, faster, and opens one more place in the queue */
const signs = () => ['sign1', 'sign2', 'sign3'].filter(own).length;
const guestEvery = () => (2.6 + Math.random() * 1.4) / (1 + 0.6 * signs() + 0.3 * state.lv.guests + 0.45 * Object.keys(stalls).length);
const guestWalk = () => 2.6 + 0.5 * signs();
const ENTRY = [12, -1.4], EXIT = [12, -2.6];
const ANIMALS = ['bunny', 'bear', 'fox', 'frog', 'duck'];
function animal(kind) {
  const g = new T.Group(), col = { bunny: PAL.paper, bear: PAL.trunk, fox: PAL.accent, frog: PAL.leaf, duck: PAL.ochre }[kind];
  let geo = ico(0.26, 1, 3, 0.02); geo.scale(1, 1.15, 0.9); part(fac(geo, col, 3), g, 0, 0.36, 0);
  part(fac(ico(0.22, 1, 4, 0.015), col, 4), g, 0, 0.78, 0.02);
  if (kind === 'bunny') [-0.08, 0.08].forEach((x) => { const e = new T.CylinderGeometry(0.04, 0.05, 0.32, 5); e.translate(0, 0.16, 0); part(fac(e, col, 5), g, x, 0.92, 0); });
  if (kind === 'bear') [-0.15, 0.15].forEach((x) => part(fac(new T.IcosahedronGeometry(0.07, 0), col, 6), g, x, 0.96, 0));
  if (kind === 'fox') [-0.11, 0.11].forEach((x) => part(fac(new T.ConeGeometry(0.07, 0.16, 3), col, 7), g, x, 1.0, 0));
  if (kind === 'duck') { const b = new T.ConeGeometry(0.06, 0.16, 4); b.rotateX(Math.PI / 2); part(fac(b, PAL.accent, 8), g, 0, 0.75, 0.25); }
  if (kind === 'frog') [-0.09, 0.09].forEach((x) => part(fac(new T.IcosahedronGeometry(0.07, 0), col, 9), g, x, 0.95, 0.06));
  part(fac(new T.IcosahedronGeometry(0.08, 0), kind === 'fox' ? PAL.paper : PAL.blush, 10), g, 0, 0.73, 0.2, true);
  [-0.08, 0.08].forEach((x) => { const e = new T.Mesh(new T.SphereGeometry(0.03, 6, 4), ink); e.position.set(x, 0.84, 0.2); g.add(e); });
  return g;
}
/* thought bubbles: drawn once per item and count */
const bubbleTex = {};
function drawIcon(cx, t, x, y, s) {
  cx.save(); cx.translate(x, y); cx.scale(s, s); cx.lineWidth = 4; cx.strokeStyle = PAL.ink;
  if (t === 'egg') { cx.fillStyle = PAL.snow; cx.beginPath(); cx.ellipse(0, 2, 20, 26, 0, 0, 7); cx.fill(); cx.stroke(); }
  else if (t === 'apple') { cx.fillStyle = PAL.accent; cx.beginPath(); cx.arc(0, 4, 23, 0, 7); cx.fill(); cx.stroke(); cx.fillStyle = PAL.leaf; cx.beginPath(); cx.ellipse(10, -24, 10, 5, -0.6, 0, 7); cx.fill(); cx.stroke(); }
  else if (t === 'milk') { cx.fillStyle = PAL.paper; cx.beginPath(); cx.roundRect ? cx.roundRect(-16, -14, 32, 42, 6) : cx.rect(-16, -14, 32, 42); cx.fill(); cx.stroke(); cx.fillStyle = PAL.sea; cx.fillRect(-9, -28, 18, 14); cx.strokeRect(-9, -28, 18, 14); }
  else if (t === 'cake') { cx.fillStyle = PAL.sand; cx.fillRect(-26, -2, 52, 24); cx.strokeRect(-26, -2, 52, 24); cx.fillStyle = PAL.blush; cx.fillRect(-26, -12, 52, 10); cx.strokeRect(-26, -12, 52, 10); cx.fillStyle = PAL.accent; cx.beginPath(); cx.arc(0, -18, 7, 0, 7); cx.fill(); cx.stroke(); }
  else if (t === 'coin') { cx.fillStyle = PAL.ochre; cx.beginPath(); cx.arc(0, 0, 22, 0, 7); cx.fill(); cx.stroke(); cx.strokeStyle = '#b9822a'; cx.beginPath(); cx.arc(0, 0, 13, 0, 7); cx.stroke(); }
  else if (t === 'heart') { cx.fillStyle = PAL.accent; cx.beginPath(); cx.moveTo(0, 22); cx.bezierCurveTo(-34, -2, -18, -30, 0, -12); cx.bezierCurveTo(18, -30, 34, -2, 0, 22); cx.fill(); cx.stroke(); }
  cx.restore();
}
function bubble(type, n) {
  const key = type + n; if (bubbleTex[key]) return bubbleTex[key];
  const c = document.createElement('canvas'); c.width = 256; c.height = 160; const x = c.getContext('2d');
  x.fillStyle = PAL.paper; x.strokeStyle = PAL.ink; x.lineWidth = 6; x.beginPath(); x.roundRect ? x.roundRect(8, 8, 240, 124, 40) : x.rect(8, 8, 240, 124); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(110, 130); x.lineTo(128, 154); x.lineTo(146, 130); x.fill(); x.stroke(); x.fillStyle = PAL.paper; x.fillRect(112, 124, 32, 10);
  if (type === 'heart') drawIcon(x, 'heart', 128, 72, 1.4);
  else { drawIcon(x, type, 86, 72, 1.3); x.fillStyle = PAL.ink; x.font = '700 64px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('×' + n, 172, 76); }
  const tex = new T.CanvasTexture(c); bubbleTex[key] = tex; return tex;
}
const customers = [];
let spawnT = 1;
function wants() {
  const kinds = ['egg']; if (producers.some((p) => p.type === 'apple')) kinds.push('apple'); if (producers.some((p) => p.type === 'milk') || shelf.milk.items.length + back.count('milk') > 0) kinds.push('milk'); if (bakery) kinds.push('cake');
  const have = (k) => shelf[k].items.length + back.count(k), anyStock = kinds.some((k) => have(k) > 0);
  /* guests mostly ask for what is actually in the shop, so one missing item cannot block the counter */
  const w = kinds.map((k, i) => (1 + i * 0.8) * (!anyStock || have(k) > 0 ? 1 : 0.08) * (1 + Math.min(3, have(k) / 8))), sum = w.reduce((a, b) => a + b, 0); let r = Math.random() * sum;
  for (let i = 0; i < kinds.length; i++) { r -= w[i]; if (r <= 0) return kinds[i]; } return kinds[0];
}
function spawnCustomer() {
  const taken = (i) => customers.some((c) => c.slot === i);
  const counterFree = SLOTS.findIndex((s, i) => i < 3 + signs() && !taken(i));
  /* stalls that have goods and a free place get guests first, so nothing piles up unsold */
  const opts = []; STALL_T.forEach((t, k) => { if (!stalls[t]) return; [6 + 2 * k, 7 + 2 * k].forEach((i) => { if (!taken(i)) opts.push({ i, w: stalls[t].shelf.items.length > 0 ? 3 : 0.4 }); }); });
  if (counterFree >= 0) opts.push({ i: counterFree, w: 2 });
  if (!opts.length) return; let r = Math.random() * opts.reduce((a, o) => a + o.w, 0), free = opts[0].i; for (const o of opts) { r -= o.w; if (r <= 0) { free = o.i; break; } }
  const kind = ANIMALS[Math.floor(Math.random() * ANIMALS.length)], g = animal(kind); g.position.set(ENTRY[0], 0, ENTRY[1]); sc.add(g);
  const type = slotStall(free) || wants(), n = 1 + Math.floor(Math.random() * Math.min(4, 1 + Math.floor(Object.keys(state.owned).length / 4) + Math.floor(state.lv.guests / 3)));
  const sp = new T.Sprite(new T.SpriteMaterial({ map: bubble(type, n), depthTest: false })); sp.scale.set(0.9, 0.56, 1); sp.position.y = 1.55; sp.renderOrder = 5; sp.visible = false; g.add(sp);
  const hold = new Pile(g, (k) => [0.3 * (k % 2 ? 1 : -1) * 0, 0.25 + k * 0.12, 0.3]);
  customers.push({ g, kind, type, n, got: 0, slot: free, st: 'in', sp, hold, t: 0, bob: Math.random() * 6, via: free >= 6, wait: 0, stall: slotStall(free) });
}
function walkTo(o, x, z, dt, sp) { const dx = x - o.position.x, dz = z - o.position.z, d = Math.hypot(dx, dz); if (d < 0.04) return true; const st = Math.min(d, dt * sp); o.position.x += dx / d * st; o.position.z += dz / d * st; o.rotation.y = Math.atan2(dx, dz); return false; }

/* ---------- helpers ---------- */
const helpers = [];
function robot(hat) {
  const grp = new T.Group(), g = new T.BoxGeometry(0.4, 0.3, 0.34, 2, 2, 2); part(fac(jit(g, 0.015, 2), PAL.paper, 2), grp, 0, 0.36, 0);
  const v = new T.Mesh(new T.BoxGeometry(0.28, 0.11, 0.02), ink); v.position.set(0, 0.38, 0.18); grp.add(v);
  part(fac(new T.CylinderGeometry(0.11, 0.13, 0.09, 6), hat, 3), grp, 0, 0.56, 0);
  const w = new T.CylinderGeometry(0.08, 0.08, 0.07, 6); w.rotateZ(Math.PI / 2); part(fac(w, PAL.ink, 4), grp, -0.16, 0.1, 0); part(fac(w.clone(), PAL.ink, 5), grp, 0.16, 0.1, 0);
  return grp;
}
function addHelper(i) {
  const s = SPOT.helper[i], g = robot(i ? PAL.sea : PAL.leaf); g.position.set(s[0], 0, s[1]); sc.add(g);
  const h = { g, st: 'idle', src: null, t: 0 }; h.pile = new Pile(g, (k) => { let y = 0.52; for (let q = 0; q < k; q++) y += ITEM_H[h.pile.items[q].userData.type]; return [0, y, -0.28]; }); helpers.push(h);
}
function addSign(i) {
  const s = SPOT.sign[i], g = new T.Group(); g.position.set(s[0], 0, s[1]); g.rotation.y = -0.5; sc.add(g);
  const post = new T.CylinderGeometry(0.06, 0.07, 1.4, 5); post.translate(0, 0.7, 0); part(fac(post, PAL.trunk, 2), g, 0, 0, 0);
  const board = new T.BoxGeometry(1.1, 0.7, 0.08); part(fac(board, [PAL.accent, PAL.sea, PAL.ochre][i], 3), g, 0, 1.35, 0);
  const c = document.createElement('canvas'); c.width = 256; c.height = 160; const x = c.getContext('2d'); x.fillStyle = PAL.paper; x.fillRect(0, 0, 256, 160);
  drawIcon(x, ['egg', 'apple', 'cake'][i], 80, 80, 1.5); drawIcon(x, 'heart', 176, 80, 1.3);
  const face = new T.Mesh(new T.PlaneGeometry(0.9, 0.56), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c) })); face.position.set(0, 1.35, 0.05); g.add(face);
  const back = face.clone(); back.rotation.y = Math.PI; back.position.z = -0.05; g.add(back);
}
const stalls = {};
const STALL_COL = { egg: PAL.ochre, apple: PAL.accent, milk: PAL.sea, cake: PAL.blush };
function addStall(t) {
  const a = STALL_AT[t], g = new T.Group(); g.position.set(a[0], 0, a[1]); sc.add(g);
  let geo = new T.BoxGeometry(1.6, 0.7, 0.7, 2, 1, 1); geo.translate(0, 0.35, 0); part(fac(jit(geo, 0.02, 4), PAL.trunk, 21), g);
  geo = new T.BoxGeometry(1.7, 0.06, 0.8); part(fac(geo, PAL.sand, 22), g, 0, 0.73, 0);
  [-0.78, 0.78].forEach((x) => { const p = new T.CylinderGeometry(0.035, 0.035, 1.5, 5); p.translate(0, 0.75, 0); part(fac(p, PAL.trunk, 23), g, x, 0, 0.3); });
  for (let k = 0; k < 4; k++) { const aw = new T.BoxGeometry(0.43, 0.05, 0.9); aw.rotateX(-0.35); part(fac(aw, k % 2 ? PAL.paper : STALL_COL[t], 24 + k), g, -0.64 + k * 0.43, 1.55, 0.05); }
  const c = document.createElement('canvas'); c.width = 256; c.height = 160; const x = c.getContext('2d'); x.fillStyle = PAL.paper; x.strokeStyle = PAL.ink; x.lineWidth = 6; x.beginPath(); x.roundRect ? x.roundRect(8, 8, 240, 144, 40) : x.rect(8, 8, 240, 144); x.fill(); x.stroke(); drawIcon(x, t, 128, 80, 1.5);
  const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false })); sp.scale.set(0.7, 0.44, 1); sp.position.set(0, 2.1, 0); sp.renderOrder = 4; g.add(sp);
  const d = stallDrop(t); ring(d[0], d[1], 0.8);
  stalls[t] = { t, g, shelf: new Pile(g, (k) => [-0.54 + (k % 4) * 0.36, 0.78 + Math.floor(k / 8) * ITEM_H[t], -0.14 + (Math.floor(k / 4) % 2) * 0.28]), money: makeMoney(a[0] + 1.35, a[1] + 1.35), stocker: null, seller: null };
}
function addStocker(t) {
  const s = stalls[t], home = [STALL_AT[t][0] - 1.3, STALL_AT[t][1] + 0.9], g = robot(STALL_COL[t]); g.position.set(home[0], 0, home[1]); sc.add(g);
  const h = { g, t, home, st: 'idle', src: null, t2: 0 }; h.pile = new Pile(g, (k) => { let y = 0.52; for (let q = 0; q < k; q++) y += ITEM_H[t]; return [0, y, -0.28]; }); s.stocker = h;
}
function addSeller(t) {
  const s = stalls[t], kinds = { egg: 'duck', apple: 'fox', milk: 'frog', cake: 'bunny' }, g = animal(kinds[t]); g.position.set(STALL_AT[t][0] + 1.1, 0, STALL_AT[t][1] - 0.1); g.rotation.y = Math.PI + 0.5; sc.add(g);
  const hat = new T.CylinderGeometry(0.16, 0.2, 0.12, 8); part(fac(hat, STALL_COL[t], 3), g, 0, 1.0, 0.02); s.seller = g;
  if (s.money.n) { earn(s.money.n); s.money.n = 0; s.money.show(); }
}
/* a stocking robot fetches only its own product and keeps its stall full */
function runStocker(h, dt) {
  const s = stalls[h.t], drop = stallDrop(h.t), p = h.g.position;
  if (h.st === 'idle') { const q = producers.filter((q) => q.type === h.t && q.pile.items.length).sort((a, b) => b.pile.items.length - a.pile.items.length)[0]; h.feed = false;
    /* the cake robot also feeds eggs to the bakery when there is no cake to fetch */
    const hq = !q && h.t === 'cake' && bakery && bakery.inp.items.length < 6 ? producers.filter((q2) => q2.type === 'egg' && q2.pile.items.length).sort((a, b) => b.pile.items.length - a.pile.items.length)[0] : null;
    if (q && s.shelf.items.length < SHELF_MAX - 2) { h.src = q; h.st = 'go'; } else if (hq && s.shelf.items.length < SHELF_MAX - 2) { h.src = hq; h.feed = true; h.st = 'go'; } else walkTo(h.g, h.home[0], h.home[1], dt, 2); }
  else if (h.st === 'go') { if (walkTo(h.g, h.src.x + 0.5, h.src.z + 0.3, dt, 2.6)) { h.st = 'load'; h.t2 = 0; } }
  else if (h.st === 'load') { h.t2 -= dt; if (h.t2 <= 0) { h.t2 = 0.15; if (h.src.pile.items.length && h.pile.items.length < 8) { const m = h.src.pile.take(); fly(m, () => h.g.localToWorld(tmpV.set(0, 0.6 + h.pile.items.length * 0.18, -0.28)), () => h.pile.add(m)); } else { h.st = h.pile.items.length ? 'ret' : 'idle'; h.src = null; } } }
  else if (h.st === 'ret') { const to = h.feed ? [B_IN.x - 0.5, B_IN.z + 0.5] : [drop[0] - 0.5, drop[1]]; if (walkTo(h.g, to[0], to[1], dt, 2.6)) { h.st = 'drop'; h.t2 = 0; } }
  else if (h.st === 'drop') { h.t2 -= dt; if (h.t2 <= 0) { h.t2 = 0.12; if (!h.pile.items.length) h.st = 'idle'; else if (h.feed) { if (bakery.inp.items.length < 12) { const m = h.pile.take(); fly(m, () => tmpV.set(B_IN.x, 0.2, B_IN.z), () => bakery.inp.add(m)); } else h.t2 = 0.5; } else if (s.shelf.items.length < SHELF_MAX) { const m = h.pile.take(); fly(m, () => s.g.localToWorld(tmpV.set(0, 1.0, 0)), () => s.shelf.add(m)); } else h.t2 = 0.5; } }
  p.y = h.st === 'go' || h.st === 'ret' ? Math.abs(Math.sin(time * 12 + 3)) * 0.04 : 0;
}
let cashier = null;
function addCashier() { const g = animal('bear'); g.position.set(COUNTER.x + 1.75, 0, COUNTER.z - 0.2); g.rotation.y = -0.6; sc.add(g); const hat = new T.CylinderGeometry(0.16, 0.2, 0.12, 8); part(fac(hat, PAL.sea, 3), g, 0, 1.0, 0.02); cashier = g; }

/* ---------- buy pads ---------- */
let pad = null;
function padTex(p, left) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d');
  x.fillStyle = 'rgba(255,246,228,0.92)'; x.beginPath(); x.arc(128, 128, 120, 0, 7); x.fill();
  x.lineWidth = 10; x.strokeStyle = PAL.ochre; x.beginPath(); x.arc(128, 128, 112, -Math.PI / 2, -Math.PI / 2 + 6.2832 * (1 - left / p.cost)); x.stroke();
  const icon = { hen: 'egg', tree: 'apple', cow: 'milk', bakery: 'cake', helper: 'helper', cashier: 'coin', sign: 'guest', stall: p.t, stock: 'helper', seller: 'coin' }[p.kind];
  if (icon === 'helper') { x.fillStyle = PAL.paper; x.strokeStyle = PAL.ink; x.lineWidth = 5; x.fillRect(96, 54, 64, 50); x.strokeRect(96, 54, 64, 50); x.fillStyle = PAL.ink; x.fillRect(106, 68, 44, 16); x.fillStyle = PAL.seaShallow; x.beginPath(); x.arc(118, 76, 5, 0, 7); x.arc(138, 76, 5, 0, 7); x.fill(); }
  else if (icon === 'guest') { x.lineWidth = 5; x.strokeStyle = PAL.ink; x.fillStyle = PAL.paper; [[110, 40], [134, 40]].forEach(([ex, ey]) => { x.beginPath(); x.ellipse(ex, ey, 8, 20, 0, 0, 7); x.fill(); x.stroke(); }); x.beginPath(); x.arc(122, 88, 30, 0, 7); x.fill(); x.stroke(); x.fillStyle = PAL.ink; x.beginPath(); x.arc(111, 84, 4, 0, 7); x.arc(133, 84, 4, 0, 7); x.fill(); x.fillStyle = PAL.blush; x.beginPath(); x.arc(122, 97, 5, 0, 7); x.fill(); x.fillStyle = PAL.leaf; x.beginPath(); x.arc(168, 104, 18, 0, 7); x.fill(); x.stroke(); x.strokeStyle = PAL.paper; x.lineWidth = 6; x.beginPath(); x.moveTo(168, 94); x.lineTo(168, 114); x.moveTo(158, 104); x.lineTo(178, 104); x.stroke(); }
  else drawIcon(x, icon, 128, 82, 1.25);
  if (p.kind === 'stock' || p.kind === 'seller') drawIcon(x, p.t, 178, 104, 0.75);
  if (p.kind === 'stall') { x.fillStyle = STALL_COL[p.t]; x.strokeStyle = PAL.ink; x.lineWidth = 4; x.fillRect(78, 28, 100, 16); x.strokeRect(78, 28, 100, 16); }
  drawIcon(x, 'coin', 76, 172, 0.8);
  x.fillStyle = PAL.ink; x.font = '700 58px Fredoka, sans-serif'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(fmt(left), 100, 176);
  return new T.CanvasTexture(c);
}
function showPad() {
  if (pad) { sc.remove(pad.g); pad = null; }
  const p = nextPad(); if (!p) return;
  const pos = padPos(p), g = new T.Group(); g.position.set(pos[0], 0.04, pos[1]); sc.add(g);
  const disc = new T.Mesh(new T.CircleGeometry(0.75, 32), new T.MeshBasicMaterial({ map: padTex(p, p.cost - (state.paid[p.id] || 0)), transparent: true })); disc.rotation.x = -Math.PI / 2; g.add(disc);
  const edge = new T.Mesh(new T.RingGeometry(0.75, 0.85, 32), new T.MeshBasicMaterial({ color: PAL.ochre })); edge.rotation.x = -Math.PI / 2; edge.position.y = 0.005; g.add(edge);
  pad = { p, g, disc, shown: -1, coinT: 0 };
}
function unlock(p) {
  state.owned[p.id] = true; delete state.paid[p.id];
  if (p.kind === 'hen') hen(p.i); else if (p.kind === 'tree') appleTree(p.i); else if (p.kind === 'cow') cow(p.i); else if (p.kind === 'bakery') makeBakery(); else if (p.kind === 'helper') addHelper(p.i); else if (p.kind === 'cashier') addCashier(); else if (p.kind === 'stall') addStall(p.t); else if (p.kind === 'stock') addStocker(p.t); else if (p.kind === 'seller') addSeller(p.t); else if (p.kind === 'sign') addSign(p.i);
  Snd.init(); Snd.play('success', { gain: 0.6, f: 'E6' }); Snd.play('sparkle', { gain: 0.6 }, 0.12);
  pop(padPos(p)); showPad(); save();
}
const pops = [];
function pop(pos) { for (let k = 0; k < 10; k++) { const m = new T.Mesh(new T.OctahedronGeometry(0.09, 0), new T.MeshBasicMaterial({ color: [PAL.ochre, PAL.accent, PAL.seaShallow][k % 3] })); m.position.set(pos[0], 0.5, pos[1]); const a = k / 10 * 6.283; m.userData = { v: new T.Vector3(Math.cos(a) * 2.2, 4 + hash(k, 3) * 2, Math.sin(a) * 2.2), t: 0 }; sc.add(m); pops.push(m); } }

/* guide arrow for children who cannot read */
const arrow = new T.Group(); sc.add(arrow);
{ const c = new T.ConeGeometry(0.3, 0.6, 8); c.rotateX(Math.PI); part(fac(c, PAL.accent, 3), arrow, 0, 0, 0, true); const b = new T.CylinderGeometry(0.13, 0.13, 0.4, 8); part(fac(b, PAL.accent, 4), arrow, 0, 0.45, 0, true); }
const goalRing = new T.Mesh(new T.RingGeometry(0.75, 0.95, 32), new T.MeshBasicMaterial({ color: PAL.accent, transparent: true })); goalRing.rotation.x = -Math.PI / 2; sc.add(goalRing);
const chevron = new T.Mesh(new T.ConeGeometry(0.16, 0.38, 3), new T.MeshBasicMaterial({ color: PAL.accent, transparent: true, opacity: 0.85 })); chevron.rotation.x = Math.PI / 2; const chevG = new T.Group(); chevG.add(chevron); sc.add(chevG);
function goal() {
  const p = nextPad();
  if (p && state.coins >= p.cost - (state.paid[p.id] || 0)) return padPos(p);
  const mp = piles.filter((o) => o.n > 0).sort((a, b) => b.n - a.n)[0];
  if (mp && carry.items.length === 0) return [mp.x, mp.z];
  if (carry.items.length >= cap() || (carry.items.length > 0 && !producers.some((q) => q.pile.items.length > 0 && q.type !== 'cake'))) {
    if (bakery && carry.items.every((m) => m.userData.type === 'egg') && shelf.cake.items.length < 3 && bakery.inp.items.length < 4) return [B_IN.x, B_IN.z];
    return [DROP.x, DROP.z];
  }
  let best = null, bn = 0; producers.forEach((q) => { if (q.pile.items.length > bn) { bn = q.pile.items.length; best = q; } });
  if (best) return [best.x, best.z];
  if (carry.items.length) return [DROP.x, DROP.z];
  if (mp) return [mp.x, mp.z];
  return null;
}

/* ---------- camera and input ---------- */
let aspect = 1;
function resize() { const w = Math.max(1, wrap.clientWidth), h = Math.max(1, wrap.clientHeight); renderer.setSize(w, h, false); cam.aspect = aspect = w / h; cam.updateProjectionMatrix(); }
if (window.ResizeObserver) new ResizeObserver(resize).observe(wrap); else window.addEventListener('resize', resize);
resize();
const camFocus = new T.Vector3().copy(pip.position);
const ray = new T.Raycaster(), ndc = new T.Vector2(), groundPlane = new T.Plane(new T.Vector3(0, 1, 0), 0);
let holding = false, keys = {}, joy = null;
/* two ways to steer: drag like a joystick (Pip walks while the finger is down, stops when it lifts), or tap where Pip should go */
const dragMode = () => state.ctrl !== 'tap';
const joyEl = $('joy'), JOY_R = 56;
function joyShow() { if (!joyEl) return; joyEl.hidden = false; joyEl.style.left = joy.x0 + 'px'; joyEl.style.top = joy.y0 + 'px'; joyKnob(); }
function joyKnob() { if (!joyEl) return; const l = Math.hypot(joy.dx, joy.dy), k = l > JOY_R ? JOY_R / l : 1; joyEl.firstElementChild.style.transform = 'translate(' + joy.dx * k + 'px,' + joy.dy * k + 'px)'; }
function aim(e) { const r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, cam); if (ray.ray.intersectPlane(groundPlane, tmpV)) { target.set(tmpV.x, 0, tmpV.z); onIsle(target); if (typeof routeStop === 'function') routeStop(); } }
wrap.addEventListener('pointerdown', (e) => { if (e.button && e.button !== 0) return; closeMenu(); Snd.init(); holding = true; try { wrap.setPointerCapture(e.pointerId); } catch (er) {} if (dragMode()) { joy = { x0: e.clientX, y0: e.clientY, dx: 0, dy: 0 }; joyShow(); } else aim(e); if (!state.moved) { state.moved = true; $('hint').hidden = true; } });
wrap.addEventListener('pointermove', (e) => { if (!holding) return; if (joy) { joy.dx = e.clientX - joy.x0; joy.dy = e.clientY - joy.y0; /* the stick stays where the finger first touched; lift and touch again to move it */ joyKnob(); } else aim(e); });
['pointerup', 'pointercancel'].forEach((ev) => wrap.addEventListener(ev, () => { holding = false; if (joy) { joy = null; if (joyEl) joyEl.hidden = true; target.copy(pip.position); } }));
window.addEventListener('keydown', (e) => { const k = e.key.toLowerCase(); if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) { keys[k] = true; e.preventDefault(); Snd.init(); if (!state.moved) { state.moved = true; $('hint').hidden = true; } } if (k === 'escape') closeMenu(); });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
wrap.addEventListener('contextmenu', (e) => e.preventDefault());

/* coins fly up to the counter in the corner */
function coinToHud(wx, wy, wz, n) {
  tmpV.set(wx, wy, wz).project(cam); const r = wrap.getBoundingClientRect(), hud = $('coinIcon').getBoundingClientRect();
  const sx = (tmpV.x * 0.5 + 0.5) * r.width + r.left, sy = (-tmpV.y * 0.5 + 0.5) * r.height + r.top;
  for (let k = 0; k < Math.min(n, 6); k++) {
    const d = document.createElement('span'); d.className = 'flycoin'; d.style.left = sx + 'px'; d.style.top = sy + 'px'; document.body.appendChild(d);
    const dx = hud.left + hud.width / 2 - sx, dy = hud.top + hud.height / 2 - sy;
    requestAnimationFrame(() => { d.style.transitionDelay = (k * 0.05) + 's'; d.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(0.7)'; d.style.opacity = '0.2'; });
    setTimeout(() => d.remove(), 900);
  }
}
function earn(n) { state.coins += n; state.total += n; bump(); }
function bump() { const el = $('coins'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }

/* ---------- menu ---------- */
function openMenu() { $('menu').hidden = false; $('menuBtn').setAttribute('aria-expanded', 'true'); Snd.init(); Snd.play('pop', { gain: 0.4, f: 700 }); renderMenu(); }
function closeMenu() { if ($('menu').hidden) return; $('menu').hidden = true; $('menuBtn').setAttribute('aria-expanded', 'false'); }
$('menuBtn').addEventListener('click', () => { if ($('menu').hidden) openMenu(); else closeMenu(); });
$('menuClose').addEventListener('click', closeMenu);
$('menu').addEventListener('pointerdown', (e) => { if (e.target === $('menu')) closeMenu(); });
function flash(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
UPS.forEach((u) => {
  const b = $('up-' + u.id), need = document.createElement('span'); need.className = 'need'; need.innerHTML = '<b></b>'; b.appendChild(need);
  b.addEventListener('click', () => {
    const c = upCost(u);
    if (state.lv[u.id] >= u.max) { Snd.play('tock', { gain: 0.3, f: 300 }); return; }
    if (state.coins < c) { Snd.play('tock', { gain: 0.3, f: 300 }); flash(b, 'shake'); flash($('coins').parentNode, 'no'); return; } /* not enough coins: shake, and point at the coin counter */
    state.coins -= c; state.lv[u.id]++; Snd.play('powerup', { gain: 0.5 }); flash(b, 'got'); renderMenu(); const d = b.querySelectorAll('.dots i')[state.lv[u.id] - 1]; if (d) flash(d, 'pop'); save();
  });
});
$('soundBtn').addEventListener('click', () => { state.sound = !state.sound; Snd.init(); Snd.set(state.sound); renderMenu(); });
if ($('fpsBtn')) $('fpsBtn').addEventListener('click', () => { fpsCap = FPS_OPTS[(FPS_OPTS.indexOf(fpsCap) + 1) % FPS_OPTS.length]; try { localStorage.setItem('pips-fps', fpsCap); } catch (e) {} renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, fpsCap === 20 ? 1 : 1.5)); resize(); Snd.play('pop', { gain: 0.4, f: 400 + fpsCap * 8 }); renderMenu(); });
if ($('ctrlBtn')) $('ctrlBtn').addEventListener('click', () => { state.ctrl = dragMode() ? 'tap' : 'drag'; Snd.play('pop', { gain: 0.4, f: dragMode() ? 800 : 600 }); renderMenu(); save(); });
function renderMenu() {
  UPS.forEach((u) => {
    const b = $('up-' + u.id), lv = state.lv[u.id], c = upCost(u), maxed = lv >= u.max;
    b.querySelector('.dots').innerHTML = Array.from({ length: u.max }, (_, i) => '<i class="' + (i < lv ? 'on' : '') + '"></i>').join('');
    b.querySelector('.price b').textContent = maxed ? '★' : fmt(c);
    b.classList.toggle('poor', !maxed && state.coins < c); b.classList.toggle('can', !maxed && state.coins >= c); b.classList.toggle('maxed', maxed);
    b.querySelector('.need b').style.width = Math.min(100, state.coins / c * 100) + '%';
  });
  if ($('fpsBtn')) { $('fpsBtn').querySelector('b').textContent = fpsCap; $('fpsBtn').setAttribute('aria-label', 'Frame rate: ' + fpsCap + ' per second' + (fpsCap === 20 ? ', battery saver' : '')); $('fpsBtn').classList.toggle('eco', fpsCap < 60); }
  if ($('ctrlBtn')) { $('ctrlBtn').classList.toggle('tap', !dragMode()); $('ctrlBtn').setAttribute('aria-label', dragMode() ? 'Steering: drag with your finger' : 'Steering: tap where to go'); }
  $('soundBtn').setAttribute('aria-pressed', String(state.sound)); $('soundBtn').classList.toggle('off', !state.sound);
}

/* ---------- save ---------- */
const KEY = 'pip-farm-shop-v1';
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
function load() { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (!s || s.v !== 1 || typeof s.coins !== 'number') return null; const b = fresh(); for (const k in b) if (!(k in s)) s[k] = b[k]; return s; } catch (e) { return null; } }

/* ---------- loop ---------- */
/* which music fits where Pip is: the house (and night on the farm) is calm, the shop's market area has the coin tune,
   everywhere else is the pastoral day music */
let inMkt = false;
function inMarket() {
  if (HERE !== 'shop') return false;
  const x = pip.position.x, z = pip.position.z, m = inMkt ? 0.4 : 0; /* a small margin, so standing on the edge does not flip back and forth */
  inMkt = (x > 0.9 - m && x < 8.6 + m && z > -4.8 - m && z < 2.5 + m) || z > 2.7 - m;
  return inMkt;
}
function musicMood() {
  if (inHouse) return 'relaxed';
  if (HERE === 'farm') return isNight ? 'relaxed' : typeof inMarketTown === 'function' && inMarketTown() ? 'coin' : 'pastoral';
  return inMarket() ? 'coin' : 'pastoral';
}
Snd.tracks = HERE === 'farm' ? ['pastoral', 'relaxed', 'coin'] : ['pastoral', 'coin', 'relaxed'];
if (window.__farmTest) { window.__snd = Snd; window.__pip = pip; }
let menuT = 0, time = 0, xferT = 0, lastT = 0, saveT = 0, waterT = 0;
function step(dt) {
  time += dt;
  /* Pip moves toward the touch point, or by keys */
  let kx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0), kz = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);
  if (joy) { if (Math.hypot(joy.dx, joy.dy) > 10) { kx = joy.dx; kz = joy.dy; } else target.copy(pip.position); }
  if (kx || kz) { const l = Math.hypot(kx, kz); target.set(pip.position.x + kx / l * 0.6, 0, pip.position.z + kz / l * 0.6); onIsle(target); if (typeof routeStop === 'function') routeStop(); }
  const moving = !walkTo(pip, target.x, target.z, dt, speed());
  pipWalk = moving ? pipWalk + dt : 0;
  pb.position.y = reduced ? 0 : moving ? Math.abs(Math.sin(pipWalk * 11)) * 0.07 : Math.sin(time * 2.1) * 0.03;
  pb.rotation.z = moving && !reduced ? Math.sin(pipWalk * 11) * 0.05 : 0;
  limbs.forEach((l) => { l.g.rotation.x = moving && !reduced && !riding() ? Math.sin(pipWalk * 11) * (l.arm ? 0.45 : 0.6) * l.s : l.arm || !riding() ? 0 : -1.2; });
  if (dressing) { pip.rotation.y += (0 - pip.rotation.y) * Math.min(1, dt * 6); }
  eyes.forEach((e) => { e.scale.y = (time % 3.7) < 0.12 ? 0.15 : 1.15; });
  boatStep(dt); houseStep(dt);
  const near = (x, z, r) => Math.hypot(pip.position.x - x, pip.position.z - z) < r;

  /* production */
  producers.forEach((q) => {
    if (q.kind === 'bakery') return;
    if (q.pile.items.length >= q.max) { q.t = 0; return; }
    q.t += dt * farm(); if (q.t >= q.every) { q.t = 0; q.pile.add(mk(q.type)); if (q.body) q.body.userData.hop = 1; }
    if (q.body && q.body.userData.hop > 0) { q.body.userData.hop = Math.max(0, q.body.userData.hop - dt * 3); q.body.position.y = Math.sin(q.body.userData.hop * Math.PI) * 0.12; }
  });
  if (bakery) {
    if (bakery.inp.items.length && bakery.out.items.length < 12) { bakery.work += dt * farm(); if (bakery.work >= bakery.every) { bakery.work = 0; const e = bakery.inp.take(); bakery.inp.parent.remove(e); bakery.out.add(mk('cake')); Snd.play('ding', { gain: 0.15, f: 'G6' }, 0, 300); } }
    bakery.smoke.forEach((m) => { const q = (time * 0.4 + m.userData.ph) % 1, on = bakery.inp.items.length > 0; m.visible = on; m.position.y = 2.3 + q * 1.4; m.scale.setScalar(0.6 + q); });
  }

  /* Pip picks up, drops off, collects coins and pays pads (one item at a time so it reads as a little stream) */
  xferT -= dt;
  if (xferT <= 0) {
    let did = false;
    if (carry.items.length < cap()) for (const q of producers) { if (q.pile.items.length && near(q.x, q.z, q.r)) { const m = q.pile.take(); fly(m, () => { carry.parent.updateMatrixWorld(); return pip.localToWorld(tmpV.set(0, 0.72 + carry.items.reduce((a, b) => a + ITEM_H[b.userData.type], 0), -0.32)); }, () => carry.add(m)); Snd.play('pop', { gain: 0.45, f: 500 + carry.items.length * 60 }); did = true; break; } }
    if (!did && bakery && near(B_IN.x, B_IN.z, 0.95) && carry.count('egg') && bakery.inp.items.length < 12) { const m = carry.take('egg'); fly(m, () => tmpV.set(B_IN.x, 0.2, B_IN.z), () => bakery.inp.add(m)); Snd.play('tick', { gain: 0.4 }); did = true; }
    if (!did) for (const t in stalls) { const d = stallDrop(t), s = stalls[t]; if (near(d[0], d[1], 0.9) && carry.count(t) && s.shelf.items.length < SHELF_MAX) { const m = carry.take(t); fly(m, () => s.g.localToWorld(tmpV.set(0, 1.0, 0)), () => s.shelf.add(m)); Snd.play('tick', { gain: 0.45, f: 900 }); did = true; break; } }
    if (!did && near(DROP.x, DROP.z, 1.0) && carry.items.length && (back.items.length < BACK_MAX || carry.items.some((q) => shelf[q.userData.type].items.length < SHELF_MAX))) { const top = carry.items[carry.items.length - 1], t = shelf[top.userData.type].items.length < SHELF_MAX || back.items.length < BACK_MAX ? top.userData.type : carry.items.find((q) => shelf[q.userData.type].items.length < SHELF_MAX).userData.type; const m = carry.take(t); stock(m); Snd.play('tick', { gain: 0.45, f: 900 }); did = true; }
    if (did) xferT = 0.09;
  }
  piles.forEach((o) => { if (o.n > 0 && near(o.x, o.z, 0.85)) { const n = o.n; o.n = 0; o.show(); earn(n); coinToHud(o.x, 0.3, o.z, Math.ceil(n / 3)); Snd.play('coin', { gain: 0.6 }); } });
  if (pad) {
    const pos = padPos(pad.p), left = pad.p.cost - (state.paid[pad.p.id] || 0);
    if (near(pos[0], pos[1], 0.85) && state.coins > 0 && !moving) {
      const amt = Math.min(state.coins, left, Math.max(1, Math.ceil(pad.p.cost * dt / 1.2)));
      state.coins -= amt; state.paid[pad.p.id] = (state.paid[pad.p.id] || 0) + amt; pad.coinT -= dt;
      if (pad.coinT <= 0) { pad.coinT = 0.08; const m = new T.Mesh(coinGeo, MAT); m.position.set(pip.position.x, 1.4, pip.position.z); sc.add(m); fly(m, () => tmpV.set(pos[0], 0.1, pos[1]), () => sc.remove(m), 0.25); Snd.play('tick', { gain: 0.3, f: 1200 }, 0, 70); }
      if (state.paid[pad.p.id] >= pad.p.cost) unlock(pad.p);
    }
    if (pad) { const l2 = pad.p.cost - (state.paid[pad.p.id] || 0); if (l2 !== pad.shown) { pad.shown = l2; pad.disc.material.map.dispose(); pad.disc.material.map = padTex(pad.p, l2); } pad.g.scale.setScalar(1 + (reduced ? 0 : Math.sin(time * 3) * 0.03)); }
  }

  /* the crate refills shelves that have room */
  farmT -= dt; if (farmT <= 0) { farmT = 1.5; farmDelivery(); }
  backT -= dt; if (backT <= 0 && back.items.length) { backT = 0.15;
    const low = Object.values(stalls).find((s) => s.shelf.items.length < 4 && back.count(s.t));
    if (low) { const m = back.take(low.t); fly(m, () => low.g.localToWorld(tmpV.set(0, 1.0, 0)), () => low.shelf.add(m), 0.6); } else for (const t in shelf) if (shelf[t].items.length < SHELF_MAX - 2 && back.count(t)) { const m = back.take(t); fly(m, () => counterG.localToWorld(tmpV.set(SHELF_X[t], 1.0, 0)), () => shelf[t].add(m)); break; } }

  for (const t in stalls) if (stalls[t].stocker) runStocker(stalls[t].stocker, dt);
  /* customers */
  if (!customers.length) spawnT = Math.min(spawnT, 0.5);
  spawnT -= dt; if (spawnT <= 0) { spawnT = guestEvery(); spawnCustomer(); }
  for (let i = customers.length - 1; i >= 0; i--) {
    const c = customers[i], s = SLOTS[c.slot];
    c.g.children[0].position.y = 0.36 + (reduced ? 0 : Math.abs(Math.sin(time * 8 + c.bob)) * 0.03);
    if (c.slot >= 3 && c.slot < 6 && !customers.some((o) => o.slot === c.slot - 3)) c.slot -= 3; /* step up to the counter */
    if (c.st === 'in' && c.via) { if (walkTo(c.g, VIA[0], VIA[1], dt, guestWalk())) c.via = false; }
    else if (c.st === 'in') { const q = SLOTS[c.slot]; if (walkTo(c.g, q[0], q[1], dt, guestWalk()) && (c.slot < 3 || c.slot >= 6)) { c.st = 'wait'; c.wait = 0; c.g.rotation.y = 0; c.sp.visible = true; } else if (c.slot >= 3) { c.sp.visible = true; } }
    else if (c.st === 'wait') {
      c.t -= dt; c.sp.position.y = 1.55 + (reduced ? 0 : Math.sin(time * 3 + c.bob) * 0.04);
      const src = c.stall ? stalls[c.stall].shelf : shelf[c.type];
      /* a counter guest who waits long for something that is not there picks something that is */
      if (!c.stall && !src.items.length && c.got === 0) { c.wait += dt; if (c.wait > 8) { const alt = Object.keys(shelf).filter((t) => shelf[t].items.length > 0); if (alt.length) { c.type = alt[Math.floor(Math.random() * alt.length)]; c.n = Math.min(c.n, Math.max(1, shelf[c.type].items.length)); c.sp.material.map = bubble(c.type, c.n); c.wait = 0; Snd.play('pop', { gain: 0.3, f: 600 }); } } }
      if (c.t <= 0 && src.items.length) { c.t = 0.3; const m = src.take(); fly(m, () => c.g.localToWorld(tmpV.set(0, 0.3 + c.got * 0.12, 0.3)), () => { c.hold.add(m); }); c.got++; Snd.play('blip', { gain: 0.25 }, 0, 80); if (c.got >= c.n) { c.st = 'pay'; c.t = 0.4; } }
    } else if (c.st === 'pay') {
      c.t -= dt; if (c.t <= 0) {
        const v = ITEMS[c.type].value * c.n;
        const st = c.stall && stalls[c.stall];
        if (st && !st.seller) { st.money.n += v; st.money.show(); Snd.play('coin', { gain: 0.3 }, 0, 120); }
        else if (st || cashier) { earn(v); coinToHud(c.g.position.x, 1, c.g.position.z, 3); Snd.play('coin', { gain: 0.35 }, 0, 120); }
        else { money.n += v; moneyShow(); Snd.play('coin', { gain: 0.3 }, 0, 120); }
        c.sp.material.map = bubble('heart', 0); c.st = 'out'; c.t = 1.2; c.slot = -1; c.via = !!c.stall; c.slot = -1; /* free the place for the next guest */
      }
    } else if (c.st === 'out') {
      c.t -= dt; if (c.t <= 0) c.sp.visible = false;
      if (c.via) { if (walkTo(c.g, VIA[0], VIA[1], dt, guestWalk())) c.via = false; }
      else if (walkTo(c.g, EXIT[0], EXIT[1], dt, guestWalk())) { sc.remove(c.g); customers.splice(i, 1); }
    }
  }

  /* helper robots carry from the fullest producer to the shop */
  helpers.forEach((h, n) => {
    const p = h.g.position;
    if (h.st === 'idle') { let best = null, bn = 0; producers.forEach((q) => { const k = q.pile.items.length; if (k > bn && !helpers.some((o) => o !== h && o.src === q)) { bn = k; best = q; } }); if (best) { h.src = best; h.st = 'go'; } else walkTo(h.g, SPOT.helper[n][0], SPOT.helper[n][1], dt, 2); }
    else if (h.st === 'go') { if (walkTo(h.g, h.src.x + 0.5, h.src.z + 0.3, dt, 2.4)) { h.st = 'load'; h.t = 0; } }
    else if (h.st === 'load') { h.t -= dt; if (h.t <= 0) { h.t = 0.15; if (h.src.pile.items.length && h.pile.items.length < 6) { const m = h.src.pile.take(); fly(m, () => h.g.localToWorld(tmpV.set(0, 0.6 + h.pile.items.length * 0.18, -0.28)), () => h.pile.add(m)); } else { h.st = h.pile.items.length ? 'ret' : 'idle'; h.src = null; } } }
    else if (h.st === 'ret') { if (walkTo(h.g, DROP.x + (n ? 0.6 : -0.6), DROP.z + 0.2, dt, 2.4)) { h.st = 'drop'; h.t = 0; } }
    else if (h.st === 'drop') { h.t -= dt; if (h.t <= 0) { h.t = 0.12; const m = h.pile.items.length ? h.pile.items[h.pile.items.length - 1] : null; if (m && (shelf[m.userData.type].items.length < SHELF_MAX || back.items.length < BACK_MAX)) { h.pile.take(m.userData.type); stock(m); } else h.st = 'idle'; } }
    p.y = h.st === 'go' || h.st === 'ret' ? Math.abs(Math.sin(time * 12 + n)) * 0.04 : 0;
  });

  /* flying items */
  for (let i = flyers.length - 1; i >= 0; i--) { const f = flyers[i]; f.t += dt / f.dur; const to = f.toFn().clone(), q = Math.min(1, f.t); f.m.position.lerpVectors(f.from, to, q); f.m.position.y += Math.sin(q * Math.PI) * 0.7; if (f.t >= 1) { flyers.splice(i, 1); f.done(); } }
  for (let i = pops.length - 1; i >= 0; i--) { const m = pops[i], u = m.userData; u.t += dt; u.v.y -= 12 * dt; m.position.addScaledVector(u.v, dt); m.rotation.y += dt * 8; if (u.t > 1.2) { sc.remove(m); pops.splice(i, 1); } }

  /* guidance */
  const g = inHouse ? null : goal();
  arrow.visible = !!g; chevG.visible = !!g; goalRing.visible = !!g;
  if (g) {
    arrow.position.set(g[0], 2.0 + (reduced ? 0 : Math.abs(Math.sin(time * 3)) * 0.35), g[1]); arrow.rotation.y += dt * 2; const rq = reduced ? 0.5 : (time * 0.8) % 1; goalRing.position.set(g[0], 0.05, g[1]); goalRing.scale.setScalar(0.7 + rq * 0.5); goalRing.material.opacity = 0.9 * (1 - rq);
    const dx = g[0] - pip.position.x, dz = g[1] - pip.position.z, d = Math.hypot(dx, dz);
    chevG.visible = d > 2; chevG.position.set(pip.position.x + dx / d * 1.0, 0.08, pip.position.z + dz / d * 1.0); chevG.rotation.y = Math.atan2(dx, dz);
  }

  /* water and camera */
  waterT -= dt; if (waterT <= 0) { waterT = 0.1; for (let i = 0; i < wp.count; i++) { const x = wp.getX(i), z = wp.getZ(i); wp.setY(i, Math.sin(x * 0.5 + time * 0.9) * 0.06 + Math.sin(z * 0.42 - time * 0.7) * 0.06); const ax = -Math.cos(x * 0.5 + time * 0.9) * 0.18, az = -Math.cos(z * 0.42 - time * 0.7) * 0.15, l = Math.hypot(ax, 1, az); wn.setXYZ(i, ax / l, 1 / l, az / l); } wp.needsUpdate = true; wn.needsUpdate = true; }
  camFocus.lerp(pip.position, 1 - Math.exp(-dt * 4));
  dressT += ((dressing ? 1 : 0) - dressT) * Math.min(1, dt * 5); const k = (aspect < 1 ? 1.5 : 1.15) * (1 - 0.7 * dressT); cam.position.set(camFocus.x, 9.5 * k, camFocus.z + 8.5 * k); cam.lookAt(camFocus.x + (aspect < 1 ? 0 : 0.75) * dressT, 0.55 * dressT, camFocus.z + 0.3 + (aspect < 1 ? 0.55 : -0.1) * dressT);
  sun.position.set(camFocus.x - 10, 10, camFocus.z + 7.5); sun.target.position.copy(camFocus);
  if (window.__camTop) { const c = window.__camTop; cam.position.set(c[0], c[2], c[1] + (c[3] || 0)); cam.lookAt(c[0], 0, c[1]); cam.far = 300; }
  renderer.render(sc, cam);
  $('coins').textContent = fmt(state.coins);
  menuT -= dt; if (menuT <= 0) { menuT = 0.25; const any = UPS.some((u) => state.lv[u.id] < u.max && state.coins >= upCost(u)); $('menuBtn').classList.toggle('ready', false); if (!$('menu').hidden) renderMenu(); }
  Snd.musicStep(dt, musicMood());
}
function frame(now) { if (now - lastT < 1000 / fpsCap - 3) { requestAnimationFrame(frame); return; } let dt = (now - lastT) / 1000; lastT = now; if (dt > 0.1) dt = 0.1; if (dt > 0) step(dt); saveT += dt; if (saveT > 5) { saveT = 0; save(); } requestAnimationFrame(frame); }

if (window.__farmTest) window.__farmTest = { go: (x, z) => target.set(x, 0, z), pip: () => [pip.position.x, pip.position.z], st: () => state, money: () => money.n, carry: () => carry.items.length, fillShelf: (t) => { while (shelf[t].items.length < SHELF_MAX) shelf[t].add(mk(t)); }, stalls: () => Object.fromEntries(Object.keys(stalls).map((t) => [t, { shelf: stalls[t].shelf.items.length, money: stalls[t].money.n, robot: stalls[t].stocker && stalls[t].stocker.st }])), guests: () => customers.map((c) => c.slot + ':' + c.type + ':' + c.st).join(' '), stock: () => ({ shelf: Object.fromEntries(Object.keys(shelf).map((t) => [t, shelf[t].items.length])), back: back.items.length }) };
let started = false;
function start(data) {
  if (started) return; started = true;
  const hot = data && data.state && data.state.v === 1 ? data.state : null;
  state = hot || load() || fresh();
  state.owned.hen1 = true;
  hen(0);
  PADS.forEach((p) => { if (own(p.id)) { if (p.kind === 'hen') hen(p.i); else if (p.kind === 'tree') appleTree(p.i); else if (p.kind === 'cow') cow(p.i); else if (p.kind === 'bakery') makeBakery(); else if (p.kind === 'helper') addHelper(p.i); else if (p.kind === 'cashier') addCashier(); else if (p.kind === 'stall') addStall(p.t); else if (p.kind === 'stock') addStocker(p.t); else if (p.kind === 'seller') addSeller(p.t); else if (p.kind === 'sign') addSign(p.i); } });
  showPad(); $('hint').hidden = !!state.moved; if (avNew) openWardrobe(true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  window.addEventListener('pagehide', save);
  lastT = performance.now(); requestAnimationFrame(frame);
}
const hotApi = window.claude && window.claude.hot;
if (hotApi && hotApi.snapshot) { try { hotApi.snapshot(() => ({ state })); } catch (e) {} }
if (hotApi && hotApi.ready) { try { hotApi.ready((d) => start(d || hotApi.data || {})); } catch (e) {} setTimeout(() => start({}), 1500); } else start((hotApi && hotApi.data) || {});
})();
