/* ---------- Pips Island: gathering, signs and squares that rise out of the sea ----------
   Pip stands by a tree, rock or bush and works it on their own: chunks pop out and hop into the backpack.
   Each sea square next to the land has a sign; standing on its ring pours what Pip carries into it, and the price
   (a row of pictures) lights up piece by piece. A full sign lifts its square out of the sea with new things on it.
   Everything grows back, so a child can never get stuck. No reading needed: pictures and the guide arrow only. */
const FISH = []; /* no fish on this island yet (the engine's icon list asks) */
const NODE_R = { tree: 0.36, rock: 0.55, bush: 0.45 };
const YIELD = { tree: ['log', 2], rock: ['stone', 2], bush: ['berry', 3] };
const HITS = { tree: 6, rock: 8, bush: 3 }; /* Leon: slower, so each one feels like work */
const REGROW = { tree: [12, 30], rock: [8, 50], bush: [25, 0] }; /* seconds as a stump, then seconds growing */
const nodes = [], drops = [], signs = [], chests = [];
let rising = null, hitT = 0, giveT = 0, pickHintT = 0;

/* ---- pictures: drawn on a 2D canvas for the signs and bubbles ---- */
function isleIcon(x, t, cx, cy, s) {
  x.save(); x.translate(cx, cy); x.scale(s, s); x.lineWidth = 3; x.strokeStyle = PAL.ink; x.lineJoin = 'round'; x.lineCap = 'round';
  const blob = (f) => { x.fillStyle = f; x.fill(); x.stroke(); };
  if (t === 'log') { x.beginPath(); x.roundRect(-20, -9, 34, 18, 9); blob('#a8774f'); x.beginPath(); x.ellipse(14, 0, 6, 9, 0, 0, 7); blob('#e7c48f'); x.beginPath(); x.ellipse(14, 0, 2.2, 3.5, 0, 0, 7); x.strokeStyle = '#a8774f'; x.lineWidth = 1.6; x.stroke(); }
  else if (t === 'stone') { x.beginPath(); x.moveTo(-18, 8); x.quadraticCurveTo(-20, -8, -4, -12); x.quadraticCurveTo(14, -14, 19, 0); x.quadraticCurveTo(20, 12, 4, 12); x.quadraticCurveTo(-12, 14, -18, 8); x.closePath(); blob('#a9b2bb'); x.beginPath(); x.moveTo(-8, -5); x.quadraticCurveTo(0, -8, 6, -5); x.strokeStyle = '#e4e9ee'; x.lineWidth = 2.6; x.stroke(); }
  else if (t === 'berry') { x.beginPath(); x.arc(-6, 4, 9, 0, 7); blob('#d6406a'); x.beginPath(); x.arc(8, 6, 9, 0, 7); blob('#c3335c'); x.beginPath(); x.moveTo(1, -6); x.quadraticCurveTo(10, -16, 16, -10); x.quadraticCurveTo(9, -4, 1, -6); blob('#74a857'); x.fillStyle = '#f6b3c4'; x.beginPath(); x.arc(-9, 1, 2.4, 0, 7); x.fill(); }
  else if (t === 'gem') { x.beginPath(); x.moveTo(0, -20); x.lineTo(15, -6); x.lineTo(0, 20); x.lineTo(-15, -6); x.closePath(); blob('#7fd3ef'); x.beginPath(); x.moveTo(-15, -6); x.lineTo(15, -6); x.moveTo(0, -20); x.lineTo(-4, 20); x.lineWidth = 1.8; x.strokeStyle = '#3f9cc0'; x.stroke(); }
  else if (t === 'coin') { x.beginPath(); x.arc(0, 0, 17, 0, 7); blob('#f2c23c'); x.beginPath(); x.arc(0, 0, 11, 0, 7); x.lineWidth = 2.2; x.strokeStyle = '#c08a1a'; x.stroke(); x.fillStyle = '#fff2b0'; x.beginPath(); x.arc(-5, -6, 3, 0, 7); x.fill(); }
  else if (t === 'pick') { x.beginPath(); x.moveTo(-3, -10); x.lineTo(3, 20); x.lineWidth = 6; x.strokeStyle = PAL.ink; x.stroke(); x.lineWidth = 3.2; x.strokeStyle = '#a8774f'; x.stroke(); x.lineWidth = 3; x.strokeStyle = PAL.ink;
    x.beginPath(); x.moveTo(-22, -4); x.quadraticCurveTo(0, -22, 22, -4); x.quadraticCurveTo(0, -12, -22, -4); x.closePath(); blob('#c7ced6'); }
  else if (t === 'bag') { x.beginPath(); x.moveTo(-12, -6); x.quadraticCurveTo(0, -24, 12, -6); x.lineWidth = 4; x.strokeStyle = '#7d5e4e'; x.stroke(); x.lineWidth = 3; x.strokeStyle = PAL.ink; x.beginPath(); x.moveTo(-18, -6); x.lineTo(18, -6); x.lineTo(14, 16); x.lineTo(-14, 16); x.closePath(); blob('#d9a56b'); x.beginPath(); x.moveTo(-16, 4); x.lineTo(16, 4); x.lineWidth = 2; x.strokeStyle = '#a8743f'; x.stroke(); }
  x.restore();
}
function paperBox(x, w, h) { x.save(); x.shadowColor = 'rgba(70,40,18,0.35)'; x.shadowBlur = 8; x.shadowOffsetY = 4; x.beginPath(); x.roundRect(6, 6, w - 12, h - 14, 18); x.fillStyle = '#fff6e4'; x.fill(); x.restore(); x.beginPath(); x.roundRect(6, 6, w - 12, h - 14, 18); x.lineWidth = 4; x.strokeStyle = '#6e4426'; x.stroke(); }
/* a round picture bubble (used for the pickaxe a rock wants, and a tool coming out of a chest) */
const isleBub = {};
function isleBubble(t) {
  if (isleBub[t]) return isleBub[t];
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.beginPath(); x.arc(64, 60, 50, 0, 7); x.fillStyle = '#fff6e4'; x.fill(); x.lineWidth = 5; x.strokeStyle = '#6e4426'; x.stroke();
  isleIcon(x, t, 64, 62, 1.7);
  const tex = new T.CanvasTexture(c); isleBub[t] = tex; return tex;
}
function isleSprite(tex, s) { const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); sp.scale.set(s, s, 1); return sp; }

/* ---- things Pip carries: logs, stones and berries ---- */
const ITEM_GEO = {};
ITEM_H.gem = 0.2; ITEM_H.coin = 0.08;
function itemGeo(t) {
  if (ITEM_GEO[t]) return ITEM_GEO[t];
  let g;
  if (t === 'log') { const a = new T.CylinderGeometry(0.085, 0.085, 0.42, 9); a.rotateZ(Math.PI / 2); g = fac(a, (cx, cy, cz) => Math.abs(cx) > 0.2 ? new T.Color('#e7c48f') : tone('#9a6a3e', cy * 40 + cz * 13, 0.6), 1100); }
  else if (t === 'stone') { const a = ico(0.13, 1, 1101); a.scale(1.2, 0.85, 1); g = fac(a, (cx, cy, cz, i) => shadeY('#aab3bc', cy, -0.12, 0.12, i, 0.5), 1101); }
  else if (t === 'gem') { const a = new T.OctahedronGeometry(0.11, 0); a.scale(1, 1.4, 1); a.translate(0, 0.14, 0); g = fac(a, (cx, cy, cz, i) => new T.Color(i % 2 ? '#7fd3ef' : '#bdeaf8'), 1103); }
  else if (t === 'coin') { const a = new T.CylinderGeometry(0.12, 0.12, 0.05, 14); a.translate(0, 0.03, 0); g = fac(a, (cx, cy) => new T.Color(cy > 0.04 ? '#ffd75a' : '#d9a520'), 1104); }
  else { const L = [[-0.05, 0, 0.02], [0.06, 0.01, -0.02], [0.0, 0.07, 0.0], [0.02, -0.01, 0.07]].map(([x, y, z], k) => new T.SphereGeometry(0.06, 8, 6).translate(x, y + 0.06, z)); g = fac(mergeGeos(L), (cx, cy, cz, i) => tone('#d6406a', i, 0.7), 1102); }
  ITEM_GEO[t] = g; return g;
}
function itemModel(t) { const m = new T.Group(); const me = new T.Mesh(itemGeo(t), MAT); me.castShadow = true; m.add(me); m.userData.type = t; return m; }

/* ---- the ground: lift a square out of the sea ---- */
function isleGroundTo(idx, t) { /* move the listed ground points from their sea depth toward the land height, and recolour them */
  const p = ground.geometry.attributes.position, col = ground.geometry.attributes.color, R = rising;
  const e = t * t * (3 - 2 * t);
  for (let n = 0; n < idx.length; n++) { const i = idx[n], x = p.getX(i), z = p.getZ(i), y = R.y0[n] + (R.y1[n] - R.y0[n]) * e; p.setY(i, y); const c = groundCol(x, y, z, vkey(x, y, z)); col.setXYZ(i, c.r, c.g, c.b); }
  p.needsUpdate = true; col.needsUpdate = true;
}
function isleRise(i, j) {
  OWN[gIdx(i, j)] = 1; state.isle.own.push(gIdx(i, j));
  const p = ground.geometry.attributes.position, cx = i * GS, cz = j * GS, h = GS / 2 + 1.4, idx = [], y0 = [], y1 = [];
  for (let k = 0; k < p.count; k++) { const x = p.getX(k), z = p.getZ(k); if (Math.abs(x - cx) > h || Math.abs(z - cz) > h) continue; const ht = hAt(x, z); idx.push(k); y0.push(p.getY(k)); y1.push(ht === 0 ? 0.02 * hash(k, 5) : ht); }
  rising = { i, j, t: 0, idx, y0, y1, sp: 0 };
  Snd.play('riser', { gain: 0.5 }); Snd.play('whoosh', { gain: 0.4 });
  const b = ISLAND.box; b.x0 = Math.min(b.x0, cx - GS / 2 + 0.6); b.x1 = Math.max(b.x1, cx + GS / 2 - 0.6); b.z0 = Math.min(b.z0, cz - GS / 2 + 0.6); b.z1 = Math.max(b.z1, cz + GS / 2 - 0.6);
}
function isleRiseStep(dt) {
  const R = rising; if (!R) return;
  R.t = Math.min(1, R.t + dt / 1.6); isleGroundTo(R.idx, R.t);
  R.sp -= dt; if (R.sp <= 0 && R.t < 0.95) { R.sp = 0.12; const a = Math.random() * 4, s = (Math.random() - 0.5) * GS; const ex = R.i * GS + (a < 1 ? s : a < 2 ? GS / 2 : a < 3 ? s : -GS / 2), ez = R.j * GS + (a < 1 ? -GS / 2 : a < 2 ? s : a < 3 ? GS / 2 : s); splash(ex, -0.2, ez, 5); }
  if (R.t >= 1) {
    rising = null; ground.geometry.computeVertexNormals(); smoothGeo(ground.geometry); ground.geometry.attributes.normal.needsUpdate = true; ground.geometry.attributes.color.needsUpdate = true;
    pop([R.i * GS, R.j * GS]); Snd.play('success', { gain: 0.5 }); Snd.play('sparkle', { gain: 0.4 });
    isleFill(R.i, R.j, state.isle.got[gIdx(R.i, R.j)], true); isleSigns(); save();
  }
}

/* ---- trees, rocks and bushes ---- */
const ROCK_GEO = (() => { const g = ico(0.55, 1, 1200, 0.09); g.scale(1.05, 0.72, 0.9); g.translate(0, 0.3, 0); return fac(g, (cx, cy, cz, i) => shadeY('#9da7b1', cy, 0, 0.7, i, 0.6), 1200); })();
const STUMP_GEO = (() => { const g = new T.CylinderGeometry(0.17, 0.21, 0.24, 9); g.translate(0, 0.12, 0); return fac(g, (cx, cy) => cy > 0.2 ? new T.Color('#e7c48f') : tone(PAL.trunk, cx * 40, 0.5), 1201); })();
const BUSH_GEO = (() => { const g = fluff(0.42, 1210, 6, 0.8); g.translate(0, 0.36, 0); return fac(g, (cx, cy, cz, i) => leafY('#4f9c48', cy, 0, 0.8, i), 1210); })();
const BERRY_GEO = new T.SphereGeometry(0.075, 8, 6);
const berryMat = new T.MeshStandardMaterial({ color: '#d6406a', roughness: 0.4 });
function makeNode(kind, x, z, seed) {
  const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = hash(seed, 3) * 6.28; sc.add(g);
  const n = { kind, x, z, g, st: 'ready', hp: HITS[kind], t: 0, grow: 1, shake: 0, fall: 0, pop: 0, seed };
  if (kind === 'tree') { n.main = tree(hash(seed, 2) > 0.7 ? 'pine' : 'tree', seed); n.main.scale.setScalar(1.05 + hash(seed, 9) * 0.25); n.full = n.main.scale.x; g.add(n.main);
    n.stump = new T.Mesh(STUMP_GEO, MAT); n.stump.castShadow = true; n.stump.receiveShadow = true; n.stump.visible = false; g.add(n.stump); }
  else if (kind === 'rock') { n.main = new T.Mesh(ROCK_GEO, MAT); n.main.castShadow = true; n.main.receiveShadow = true; n.full = 0.9 + hash(seed, 4) * 0.25; n.main.scale.setScalar(n.full); g.add(n.main); }
  else { n.main = new T.Mesh(BUSH_GEO, MAT); n.main.castShadow = true; n.main.receiveShadow = true; n.full = 1; g.add(n.main); n.berries = new T.Group(); g.add(n.berries);
    for (let k = 0; k < 7; k++) { const a = k / 7 * 6.28 + hash(seed, k), r = 0.32 + hash(k, seed) * 0.1, b = new T.Mesh(BERRY_GEO, berryMat); b.position.set(Math.cos(a) * r, 0.3 + hash(seed, k + 5) * 0.32, Math.sin(a) * r); n.berries.add(b); } }
  nodes.push(n); return n;
}
const SLOTS = [[-1.25, -1.1], [1.15, -1.25], [-1.0, 1.2], [1.3, 0.95], [0.1, 0.05]];
const START_FILL = { '-1,-1': ['tree', 'tree', 'bush'], '0,-1': ['rock', 'tree'], '1,-1': ['tree', 'tree'], '-1,0': ['bush', 'tree'], '0,0': [], '1,0': ['tree', 'tree', 'tree'], '-1,1': ['tree', 'rock'], '0,1': ['bush', 'tree'], '1,1': ['tree', 'tree'] };
const FILL_CYCLE = [['tree', 'rock', 'tree'], ['bush', 'tree', 'rock'], ['rock', 'tree', 'tree', 'bush'], ['tree', 'tree', 'rock'], ['rock', 'rock', 'tree'], ['tree', 'bush', 'tree', 'rock']];
const CHEST_AT = { 0: 'pick', 10: 'bag' }; /* the 1st bought square holds the pickaxe, the 11th a bigger backpack */
function isleFill(i, j, n, fresh) {
  const key = i + ',' + j, list = n == null ? START_FILL[key] || [] : n === 0 ? ['tree', 'tree'] : FILL_CYCLE[n % FILL_CYCLE.length];
  list.forEach((k, s) => { const sl = SLOTS[s], sd = gIdx(i, j) * 7 + s, nd = makeNode(k, i * GS + sl[0] + (hash(sd, 1) - 0.5) * 0.5, j * GS + sl[1] + (hash(sd, 2) - 0.5) * 0.5, sd);
    if (fresh) { nd.pop = 0.001; nd.g.scale.setScalar(0.01); } });
  const tool = n != null ? CHEST_AT[n] : null;
  if (tool && !state.isle.chests[gIdx(i, j)]) makeChest(i * GS + SLOTS[4][0], j * GS + SLOTS[4][1], tool, gIdx(i, j));
}
/* the camp in the middle square: a campfire and a little tent */
const campFlame = (() => {
  const g = new T.Group(); g.position.set(1.4, 0, 1.2); sc.add(g); const L = [];
  for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28, q = ico(0.11, 0, 1300 + k); q.scale(1.2, 0.7, 1); q.translate(Math.cos(a) * 0.36, 0.06, Math.sin(a) * 0.36); L.push(fac(q, tone('#a9b2bb', k, 0.6), 1300 + k)); }
  [0.6, 2.2].forEach((r, k) => { const q = new T.CylinderGeometry(0.05, 0.05, 0.5, 6); q.rotateZ(Math.PI / 2); q.rotateY(r); q.translate(0, 0.08 + k * 0.04, 0); L.push(fac(q, PAL.trunk, 1310 + k)); });
  merged(L, MAT, g);
  const f = new T.Mesh(new T.ConeGeometry(0.16, 0.42, 7), new T.MeshBasicMaterial({ color: '#f2a13c' })); f.position.y = 0.3; g.add(f);
  const f2 = new T.Mesh(new T.ConeGeometry(0.09, 0.26, 6), new T.MeshBasicMaterial({ color: '#ffe07a' })); f2.position.y = 0.26; g.add(f2);
  /* the tent */
  const t = new T.Group(); t.position.set(-1.1, 0, 1.0); t.rotation.y = 0.5; sc.add(t);
  let q = new T.ConeGeometry(0.85, 1.15, 4); q.rotateY(Math.PI / 4); q.translate(0, 0.575, 0); part(fac(q, (cx, cy, cz, i) => shadeY('#e9684a', cy, 0, 1.2, i, 0.4), 1320), t);
  q = new T.PlaneGeometry(0.42, 0.62); q.translate(0, 0.31, 0.62); part(fac(q, '#7a3a2a', 1321), t, 0, 0, 0, true);
  return { g, f, f2 };
})();

/* ---- chests: a tool inside ---- */
function makeChest(x, z, tool, idx) {
  const g = new T.Group(); g.position.set(x, 0, z); sc.add(g);
  let q = new T.BoxGeometry(0.7, 0.42, 0.48); q.translate(0, 0.21, 0); part(fac(q, (cx, cy, cz, i) => shadeY('#b07a48', cy, 0, 0.45, i, 0.5), 1400), g);
  q = new T.BoxGeometry(0.1, 0.16, 0.06); q.translate(0, 0.36, 0.26); part(fac(q, '#f2c23c', 1401), g, 0, 0, 0, true);
  const lid = new T.Group(); lid.position.set(0, 0.42, -0.24); g.add(lid);
  q = new T.CylinderGeometry(0.24, 0.24, 0.7, 10, 1, false, 0, Math.PI); q.rotateZ(Math.PI / 2); q.translate(0, 0, 0.24); part(fac(q, (cx, cy, cz, i) => shadeY('#c99158', cy, 0, 0.25, i, 0.5), 1402), lid);
  const sp = isleSprite(isleBubble(tool), 0.9); sp.position.y = 1.5; sp.visible = false; g.add(sp);
  const ring = new T.Mesh(new T.RingGeometry(0.62, 0.76, 28), ringMat); ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.035, z + 0.85); sc.add(ring);
  const c = { x, z, g, lid, sp, ring, tool, idx, open: 0, gone: 0, pop: 0.001 }; g.scale.setScalar(0.01); chests.push(c); return c;
}
function chestStep(c, dt) {
  if (c.pop > 0 && c.pop < 1) { c.pop = Math.min(1, c.pop + dt * 2.2); const s = c.pop < 0.7 ? c.pop / 0.7 * 1.15 : 1.15 - (c.pop - 0.7) / 0.3 * 0.15; c.g.scale.setScalar(s); }
  if (!c.open && Math.hypot(pip.position.x - c.x, pip.position.z - (c.z + 0.85)) < 0.9) {
    c.open = 0.001; state.isle.chests[c.idx] = 1; if (c.tool === 'pick') state.isle.tools.pick = 1; if (c.tool === 'bag') state.isle.tools.bag = 1;
    c.sp.visible = true; Snd.play('powerup', { gain: 0.5 }); burst(c.x, 1.0, c.z, 8); save();
  }
  if (c.open) {
    c.open += dt; c.lid.rotation.x = -Math.min(1.9, c.open * 5);
    c.sp.position.y = 0.9 + Math.min(1, c.open) * 1.1; c.sp.material.opacity = c.open < 2.5 ? 1 : Math.max(0, 1 - (c.open - 2.5) * 2);
    if (c.open > 3) { const s = Math.max(0.01, 1 - (c.open - 3) * 2.5); c.g.scale.setScalar(s); c.ring.visible = false; if (s <= 0.01) { sc.remove(c.g); sc.remove(c.ring); c.gone = 1; } }
  }
}

/* ---- signs: one per sea square that touches land ---- */
const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]];
const ghostTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = 'rgba(236,211,160,0.35)'; x.beginPath(); x.roundRect(8, 8, 112, 112, 16); x.fill(); x.setLineDash([12, 9]); x.lineWidth = 5; x.strokeStyle = 'rgba(255,246,228,0.95)'; x.stroke();
  return new T.CanvasTexture(c); })();
const ghostGeo = (() => { const g = new T.PlaneGeometry(GS - 0.5, GS - 0.5, 8, 8); g.rotateX(-Math.PI / 2); return g; })();
const POST_GEO = (() => { const q = new T.BoxGeometry(0.12, 1.0, 0.12); q.translate(0, 0.5, 0); return fac(q, PAL.trunk, 1500); })();
const BOARD_GEO = (() => { const q = new T.BoxGeometry(0.7, 0.42, 0.08); q.translate(0, 0.98, 0); return fac(q, '#e7c48f', 1501); })();
const signCost = () => priceOf(state.isle.k);
function signPaid(s) { return state.isle.paid[s.idx] || (state.isle.paid[s.idx] = { log: 0, stone: 0, berry: 0 }); }
function drawSign(s) {
  const cost = signCost(), paid = signPaid(s), rows = ['log', 'stone', 'berry'].filter((t) => cost[t] > 0), W = 256, H = rows.length * 54 + 26;
  if (!s.cv || s.cv.height !== H) { s.cv = document.createElement('canvas'); s.cv.width = W; s.cv.height = H; if (s.tex) s.tex.dispose(); s.tex = new T.CanvasTexture(s.cv); s.sp.material.map = s.tex; }
  const x = s.cv.getContext('2d'); x.clearRect(0, 0, W, H); paperBox(x, W, H);
  rows.forEach((t, r) => { const n = cost[t], got = Math.min(n, paid[t]), y = 38 + r * 54;
    if (n <= 6) for (let k = 0; k < n; k++) { x.globalAlpha = k < got ? 1 : 0.35; isleIcon(x, t, 36 + k * 37, y, 0.85); x.globalAlpha = 1; }
    else { isleIcon(x, t, 36, y, 0.9); x.beginPath(); x.roundRect(66, y - 11, 166, 22, 11); x.fillStyle = '#e6d9c0'; x.fill(); x.lineWidth = 3; x.strokeStyle = '#6e4426'; x.stroke();
      if (got) { x.beginPath(); x.roundRect(68, y - 9, 162 * got / n, 18, 9); x.fillStyle = '#74a857'; x.fill(); } } });
  s.tex.needsUpdate = true; s.sp.scale.set(2.6, 2.6 * H / W, 1);
}
function isleSigns() {
  const want = new Map();
  for (let i = -GN; i <= GN; i++) for (let j = -GN; j <= GN; j++) {
    if (owned(i, j) || (rising && rising.i === i && rising.j === j)) continue;
    const d = DIRS.slice().sort((a, b) => (Math.abs(i - a[0]) + Math.abs(j - a[1])) - (Math.abs(i - b[0]) + Math.abs(j - b[1]))).find(([a, b]) => owned(i - a, j - b));
    if (d) want.set(gIdx(i, j), [i, j, d]);
  }
  for (let k = signs.length - 1; k >= 0; k--) { const s = signs[k]; if (!want.has(s.idx)) { [s.g, s.ring, s.ghost].forEach((m) => sc.remove(m)); signs.splice(k, 1); } else want.delete(s.idx); }
  want.forEach(([i, j, [a, b]], idx) => {
    const ni = i - a, nj = j - b, x = ni * GS + a * (GS / 2 - 0.85), z = nj * GS + b * (GS / 2 - 0.85);
    const g = new T.Group(); g.position.set(x, 0, z); sc.add(g); part(POST_GEO, g); part(BOARD_GEO, g);
    const sp = isleSprite(null, 1); sp.position.y = 2.2; g.add(sp);
    const ring = new T.Mesh(new T.RingGeometry(0.55, 0.7, 28), ringMat); ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.035, z); sc.add(ring);
    const ghost = new T.Mesh(ghostGeo, new T.MeshBasicMaterial({ map: ghostTex, transparent: true, depthWrite: false })); ghost.position.set(i * GS, -0.3, j * GS); sc.add(ghost);
    signs.push({ idx, i, j, x, z, g, sp, ring, ghost, fly: { log: 0, stone: 0, berry: 0 }, bump: 0 });
  });
  signs.forEach(drawSign);
}
function signNeed(s, t) { return signCost()[t] - signPaid(s)[t] - s.fly[t]; }
function signFull(s) { const c = signCost(), p = signPaid(s); return ['log', 'stone', 'berry'].every((t) => p[t] >= c[t]); }
function signStep(s, dt) {
  s.bump = Math.max(0, s.bump - dt * 4); s.sp.position.y = 2.2 + (reduced ? 0 : Math.sin(time * 2 + s.idx) * 0.04) + s.bump * 0.15;
  s.ghost.material.opacity = 0.55 + (reduced ? 0 : Math.sin(time * 2.4 + s.idx) * 0.25);
  if (rising || giveT > 0 || Math.hypot(pip.position.x - s.x, pip.position.z - s.z) > 0.85) return;
  let t = ['log', 'stone', 'berry'].find((q) => carry.count(q) && signNeed(s, q) > 0), m;
  if (t) m = carry.take(t);
  else { t = ['log', 'stone', 'berry'].find((q) => storeN(q) > 0 && signNeed(s, q) > 0); if (!t) return;
    /* from the storage crate: the piece appears over Pip's head and flies on to the sign */
    state.isle.store[t]--; m = itemModel(t); m.position.set(pip.position.x, 1.9, pip.position.z); sc.add(m); }
  giveT = 0.13; s.fly[t]++; invDirty = true;
  fly(m, () => s.g.localToWorld(tmpV.set(0, 2.1, 0)), () => { sc.remove(m); s.fly[t]--; signPaid(s)[t]++; s.bump = 1; drawSign(s); Snd.play('tock', { gain: 0.4, f: 500 + signPaid(s)[t] * 40 });
    if (signFull(s) && !rising) isleBuy(s); }, 0.3);
}
function isleBuy(s) {
  const n = state.isle.k; state.isle.k++; state.isle.got[s.idx] = n; delete state.isle.paid[s.idx];
  [s.g, s.ring, s.ghost].forEach((m) => sc.remove(m)); signs.splice(signs.indexOf(s), 1);
  isleRise(s.i, s.j); signs.forEach(drawSign); save();
}

/* ---- drops: chunks that pop out and wait to be picked up ---- */
function dropOut(n) {
  const [t, k] = YIELD[n.kind];
  const out = Array(k).fill(t), tr = TREASURE[n.kind]; if (Math.random() < tr[1]) out.push(tr[0]);
  out.forEach((t) => { const m = itemModel(t), a = Math.random() * 6.28; m.position.set(n.x, 0.6, n.z); sc.add(m); drops.push({ m, t, vx: Math.cos(a) * 1.4, vz: Math.sin(a) * 1.4, vy: 3.2 + Math.random(), land: 0, wait: 0.15 });
    if (VALUABLE[t]) { Snd.play('sparkle', { gain: 0.45 }); burst(n.x, 1.0, n.z, 5); } });
}
/* treasure: now and then something valuable pops out too. Valuables go in the backpack; building things go straight to the counter. */
const TREASURE = { tree: ['coin', 0.06], rock: ['gem', 0.15], bush: ['coin', 0.06] };
const VALUABLE = { gem: 1, coin: 1 };
function dropStep(d, dt) {
  if (d.land === 0) { d.vy -= 14 * dt; d.m.position.x += d.vx * dt; d.m.position.z += d.vz * dt; d.m.position.y += d.vy * dt; d.m.rotation.y += dt * 6;
    if (d.m.position.y <= 0.06) { d.m.position.y = 0.06; d.land = 1; const v = tmpV.set(d.m.position.x, 0, d.m.position.z); gClamp(v); d.m.position.x = v.x; d.m.position.z = v.z; } return false; }
  d.wait -= dt; d.m.position.y = 0.06 + (reduced ? 0 : Math.abs(Math.sin(time * 3 + d.vx)) * 0.06);
  if (d.wait > 0 || Math.hypot(pip.position.x - d.m.position.x, pip.position.z - d.m.position.z) > 2.2) return false;
  const m = d.m;
  if (!VALUABLE[d.t]) { /* logs, stones and berries: up over Pip's head and into the counter */
    invFly(d.t, m.position); sc.remove(m); return true; }
  if (carry.count() + isleIncoming >= cap()) return false;
  isleIncoming++;
  fly(m, () => { carry.parent.updateMatrixWorld(); return pip.localToWorld(tmpV.set(0, 0.72 + carry.items.reduce((a, b) => a + ITEM_H[b.userData.type], 0), -0.32)); }, () => { isleIncoming--; carry.add(m); }, 0.25);
  Snd.play('pop', { gain: 0.4, f: 520 + carry.items.length * 55 }); return true;
}
let isleIncoming = 0;

/* ---- working a tree, rock or bush ---- */
function nodeStep(n, dt) {
  if (n.pop > 0 && n.pop < 1) { n.pop = Math.min(1, n.pop + dt * 2); const s = n.pop < 0.7 ? n.pop / 0.7 * 1.12 : 1.12 - (n.pop - 0.7) / 0.3 * 0.12; n.g.scale.setScalar(s); }
  if (n.shake > 0) { n.shake = Math.max(0, n.shake - dt); const w = Math.sin(n.shake * 60) * n.shake * 0.5; n.main.rotation.z = w; n.main.rotation.x = w * 0.5; } else if (n.st === 'ready') { n.main.rotation.z = 0; n.main.rotation.x = 0; }
  if (n.st === 'fall') { n.fall += dt * 2.2; n.main.rotation.z = Math.min(1.5, n.fall * n.fall * 1.5); n.main.position.y = -Math.max(0, n.fall - 0.8) * 1.2;
    if (n.fall > 1.4) { n.st = 'gone'; n.main.visible = false; n.main.rotation.z = 0; n.main.position.y = 0; } return; }
  if (n.st === 'gone') { n.t -= dt; if (n.t <= 0) { n.st = 'grow'; n.grow = 0.2; n.main.visible = true;
      if (n.kind === 'tree') { n.stump.visible = false; } if (n.kind === 'bush') n.berries.visible = true; } }
  if (n.st === 'grow') { const tg = REGROW[n.kind][1]; n.grow = tg ? Math.min(1, n.grow + dt / tg) : 1; n.main.scale.setScalar(n.full * (n.kind === 'rock' ? 0.35 + 0.65 * n.grow : n.grow));
    if (n.kind === 'bush') { n.main.scale.setScalar(1); n.berries.children.forEach((b, k) => { b.scale.setScalar(Math.min(1, n.grow * 1.3)); }); }
    if (n.grow >= 1) { n.st = 'ready'; n.hp = HITS[n.kind]; } }
}
function nodeHit(n) {
  n.hp--; n.shake = 0.28; hpShow(n);
  const sx = n.x + (pip.position.x - n.x) * 0.4, sz = n.z + (pip.position.z - n.z) * 0.4;
  if (n.kind === 'tree') Snd.play('tock', { gain: 0.55, f: 240 + Math.random() * 40 }); else if (n.kind === 'rock') Snd.play('impact', { gain: 0.35 }); else Snd.play('swish', { gain: 0.4 });
  if (n.kind !== 'bush') splash(sx, 0.6, sz, 3);
  if (n.hp > 0) return;
  dropOut(n); n.t = REGROW[n.kind][0];
  if (n.kind === 'tree') { n.st = 'fall'; n.fall = 0; n.stump.visible = true; Snd.play('thud', { gain: 0.5 }); }
  else if (n.kind === 'rock') { n.st = 'gone'; n.main.scale.setScalar(n.full * 0.35); Snd.play('stamp', { gain: 0.4 }); }
  else { n.st = 'gone'; n.berries.visible = false; }
}
function canWork(n) { return n.st === 'ready' && n.pop >= 0 && (n.pop === 0 || n.pop >= 1) && (n.kind !== 'rock' || state.isle.tools.pick); }

/* ---- the island's part of every frame ---- */
function isleStep(dt) {
  const px = pip.position.x, pz = pip.position.z;
  isleRiseStep(dt);
  /* keep Pip and the touch point on land, and out of trees and rocks */
  const v = tmpV.set(px, 0, pz); gClamp(v); pip.position.x = v.x; pip.position.z = v.z;
  nodes.forEach((n) => { const r = n.kind === 'tree' ? NODE_R.tree : n.st === 'ready' || n.st === 'grow' ? NODE_R[n.kind] * (n.kind === 'bush' ? 1 : n.main.scale.x / n.full) : 0.2;
    const dx = pip.position.x - n.x, dz = pip.position.z - n.z, d = Math.hypot(dx, dz); if (d < r && d > 1e-4) { pip.position.x = n.x + dx / d * r; pip.position.z = n.z + dz / d * r; }
    const tx = target.x - n.x, tz = target.z - n.z, td = Math.hypot(tx, tz); if (td < r) { const k = td > 1e-4 ? (r + 0.05) / td : 0; target.x = n.x + (k ? tx * k : r + 0.05); target.z = n.z + (k ? tz * k : 0); } });
  chests.forEach((c) => { if (c.gone) return; const dx = pip.position.x - c.x, dz = pip.position.z - c.z, d = Math.hypot(dx, dz); if (d < 0.5 && d > 1e-4) { pip.position.x = c.x + dx / d * 0.5; pip.position.z = c.z + dz / d * 0.5; } });
  /* work the nearest ready thing within reach */
  hitT -= dt; giveT -= dt; pickHintT -= dt;
  let best = null, bd = 9;
  nodes.forEach((n) => { if (n.st !== 'ready') return; const d = Math.hypot(pip.position.x - n.x, pip.position.z - n.z) - NODE_R[n.kind]; if (d < 0.75 && d < bd) { bd = d; best = n; } });
  if (best && best.kind === 'rock' && !state.isle.tools.pick) {
    if (pickHintT <= 0) { pickHintT = 2.5; isleHint(best); }
  } else if (best && canWork(best) && hitT <= 0) {
    hitT = best.kind === 'bush' ? 0.5 : 0.55; workStart(best);
  }
  workStep(dt);
  nodes.forEach((n) => nodeStep(n, dt));
  for (let k = drops.length - 1; k >= 0; k--) if (dropStep(drops[k], dt)) drops.splice(k, 1);
  signs.forEach((s) => signStep(s, dt)); hpStep(dt);
  storeStep2(dt); invFlyStep(dt); invStep();
  for (let k = chests.length - 1; k >= 0; k--) { chestStep(chests[k], dt); if (chests[k].gone) chests.splice(k, 1); }
  if (hintSp.visible) { hintSp.t -= dt; hintSp.material.opacity = Math.min(1, hintSp.t * 2); if (hintSp.t <= 0) hintSp.visible = false; }
  const fl = reduced ? 1 : 1 + Math.sin(time * 13) * 0.12 + Math.sin(time * 7.3) * 0.08; campFlame.f.scale.set(1, fl, 1); campFlame.f2.scale.set(1, 2 - fl, 1);
}
/* a picture over a rock that needs the pickaxe */
const hintSp = isleSprite(isleBubble('pick'), 0.8); hintSp.visible = false; sc.add(hintSp);
function isleHint(n) { hintSp.position.set(n.x, 1.6, n.z); hintSp.visible = true; hintSp.t = 1.8; Snd.play('blip', { gain: 0.2, f: 420 }); }

/* the guide arrow: to a chest, to a sign once the backpack is full, and to a tree right at the start */
function isleGoal() {
  const pp = pip.position, by = (L, f) => { let b = null, bd = 1e9; L.forEach((o) => { const d = Math.hypot(pp.x - o.x, pp.z - o.z); if ((!f || f(o)) && d < bd) { bd = d; b = o; } }); return b; };
  const c = by(chests, (o) => !o.open && o.pop >= 1); if (c) return [c.x, c.z + 0.85];
  if (rising || hpBar.sp.visible) return null; /* no arrow over the thing Pip is busy with */
  const full = carry.count() >= cap(), some = carry.count() > 0;
  /* a sign that what Pip has (backpack and crate together) can fill right now */
  const can = by(signs, (o) => ['log', 'stone', 'berry'].every((t) => signNeed(o, t) <= carry.count(t) + storeN(t)));
  if (can && (full || some)) return [can.x, can.z];
  if (full) return [STORE.x, STORE.z + 0.95];
  if (state.isle.k === 0 && !some && !drops.length) { const n = by(nodes, (o) => o.kind === 'tree' && o.st === 'ready'); if (n) return [n.x, n.z + 0.7]; }
  return null;
}
function isleInit() {
  if (nodes.length) return;
  if (!state.isle) state.isle = fresh().isle;
  const I = state.isle; I.paid = I.paid || {}; I.chests = I.chests || {}; I.got = I.got || {}; I.tools = I.tools || { pick: 0, bag: 0 };
  for (let i = -GN; i <= GN; i++) for (let j = -GN; j <= GN; j++) if (owned(i, j)) {
    const b = ISLAND.box; b.x0 = Math.min(b.x0, i * GS - GS / 2 + 0.6); b.x1 = Math.max(b.x1, i * GS + GS / 2 - 0.6); b.z0 = Math.min(b.z0, j * GS - GS / 2 + 0.6); b.z1 = Math.max(b.z1, j * GS + GS / 2 - 0.6);
    isleFill(i, j, Math.abs(i) <= 1 && Math.abs(j) <= 1 ? null : I.got[gIdx(i, j)], false);
  }
  nodes.forEach((n) => { n.pop = 0; n.g.scale.setScalar(1); });
  chests.forEach((c) => { c.pop = 1; c.g.scale.setScalar(1); });
  I.store = I.store || { log: 0, stone: 0, berry: 0 }; invBuild();
  isleSigns();
  pip.position.set(0, 0, 0.4); target.copy(pip.position); camFocus.copy(pip.position);
  dog.g.position.set(-1.2, 0, -0.6); petsInit();
}
function isleTest() {
  return { work: work ? [work.kind, +work.t.toFixed(2)] : null, arms: limbs.filter((l) => l.arm).map((l) => [+l.g.position.x.toFixed(2), +l.g.rotation.x.toFixed(2)]), tool: [TOOL.axe.visible, !!TOOL.axe.parent], store: Object.assign({}, state.isle.store), inv: INV.el ? INV.el.textContent : '', own: state.isle.own.length, k: state.isle.k, tools: state.isle.tools, signs: signs.length, nodes: nodes.map((n) => n.kind[0] + (n.st === 'ready' ? '' : '-')).join(''), drops: drops.length, rising: !!rising,
    give: (t, n) => { for (let q = 0; q < n && carry.count() < cap(); q++) carry.add(itemModel(t)); },
    signs: () => signs.map((s) => ({ i: s.i, j: s.j, x: s.x, z: s.z, paid: signPaid(s) })), price: () => signCost(),
    nodesAt: () => nodes.map((n) => ({ kind: n.kind, x: n.x, z: n.z, st: n.st })) };
}

/* ---- the storage crate at the camp: a full backpack empties into it, and signs take from it too ---- */
const STORE = { x: 1.7, z: -1.5 };
const storeN = (t) => (state.isle && state.isle.store ? state.isle.store[t] || 0 : 0);
const storeG = (() => {
  const g = new T.Group(); g.position.set(STORE.x, 0, STORE.z); sc.add(g); const L = [];
  let q = new T.BoxGeometry(1.3, 0.12, 0.9); q.translate(0, 0.06, 0); L.push(fac(q, '#8a6a4e', 1600));
  [[0, 0.45, 1.3, 0.1], [0, -0.45, 1.3, 0.1], [0.65, 0, 0.1, 0.9], [-0.65, 0, 0.1, 0.9]].forEach(([x, z, w, d], k) => { for (let r = 0; r < 3; r++) { q = new T.BoxGeometry(w, 0.15, d); q.translate(x, 0.14 + r * 0.17, z); L.push(fac(q, tone('#c99158', k * 3 + r, 0.8), 1601 + k * 3 + r)); } });
  [[-0.62, -0.42], [0.62, -0.42], [-0.62, 0.42], [0.62, 0.42]].forEach(([x, z], k) => { q = new T.BoxGeometry(0.12, 0.62, 0.12); q.translate(x, 0.31, z); L.push(fac(q, '#7d5e4e', 1620 + k)); });
  merged(L, MAT, g);
  /* what is inside: a few logs, stones and berries show once there are some */
  const fill = { log: [], stone: [], berry: [] };
  [['log', [[-0.3, -0.15], [-0.3, 0.12], [-0.05, -0.02]]], ['stone', [[0.25, -0.2], [0.42, 0.05], [0.2, 0.15]]], ['berry', [[0.0, 0.25], [0.15, 0.3], [-0.15, 0.3]]]].forEach(([t, P]) => P.forEach(([x, z], k) => {
    const m = itemModel(t); m.position.set(x, 0.42, z); m.rotation.y = k; m.visible = false; g.add(m); fill[t].push(m); }));
  /* a picture board: the crate with a log, a stone and berries on it, so a child knows what it is */
  const c = document.createElement('canvas'); c.width = 256; c.height = 96; const x = c.getContext('2d'); paperBox(x, 256, 96);
  ['log', 'stone', 'berry'].forEach((t, k) => isleIcon(x, t, 60 + k * 68, 46, 1.0));
  const sp = isleSprite(new T.CanvasTexture(c), 1); sp.scale.set(1.5, 0.56, 1); sp.position.set(0, 1.35, 0); g.add(sp);
  const ring = new T.Mesh(new T.RingGeometry(0.62, 0.78, 28), ringMat); ring.rotation.x = -Math.PI / 2; ring.position.set(STORE.x, 0.035, STORE.z + 0.95); sc.add(ring);
  return { g, fill, sp };
})();
let storeT = 0;
function storeStep2(dt) {
  /* Pip can't walk through the crate */
  const dx = pip.position.x - STORE.x, dz = pip.position.z - STORE.z;
  if (Math.abs(dx) < 0.85 && Math.abs(dz) < 0.65) { if (0.85 - Math.abs(dx) < 0.65 - Math.abs(dz)) pip.position.x = STORE.x + Math.sign(dx || 1) * 0.85; else pip.position.z = STORE.z + Math.sign(dz || 1) * 0.65; }
  storeT -= dt;
  if (storeT <= 0 && carry.count() && Math.hypot(pip.position.x - STORE.x, pip.position.z - (STORE.z + 0.95)) < 0.8) {
    storeT = 0.12; const m = carry.take(); const t = m.userData.type;
    fly(m, () => storeG.g.localToWorld(tmpV.set(0, 0.5, 0)), () => { sc.remove(m); state.isle.store[t] = storeN(t) + 1; invDirty = true; invWig(t); Snd.play('tock', { gain: 0.35, f: 380 + (storeN(t) % 8) * 30 }); }, 0.26);
  }
  ['log', 'stone', 'berry'].forEach((t) => storeG.fill[t].forEach((m, k) => { m.visible = storeN(t) > k * 4; }));
}

/* ---- the counter at the top: how many of each Pip has (crate and backpack together), pictures and numbers ---- */
let invDirty = true, invLast = '';
const INV = {};
function invBuild() {
  if (INV.el) return;
  const el = document.createElement('div'); el.className = 'inv'; el.setAttribute('role', 'status'); el.setAttribute('aria-label', 'What Pip has');
  const st = document.createElement('style');
  st.textContent = '.inv{position:fixed;top:max(12px,env(safe-area-inset-top,0px));left:max(16px,env(safe-area-inset-left,0px));display:flex;gap:8px;pointer-events:none;z-index:5}'
    + '.inv .it{display:flex;align-items:center;gap:4px;padding:4px 14px 4px 6px;border-radius:999px;background:var(--paper);border:3px solid var(--ink);box-shadow:0 4px 0 rgba(34,48,60,.25)}'
    + '.inv img{width:40px;height:40px}.inv b{font-size:28px;font-weight:700;font-variant-numeric:tabular-nums;min-width:1.4ch;text-align:center}'
    + '.inv b.bump{animation:bump .25s ease-out}.inv .it.wig{animation:invWig .32s ease-out}'
    + '@keyframes invWig{0%{transform:none}25%{transform:rotate(-9deg) scale(1.16)}55%{transform:rotate(7deg) scale(1.08)}80%{transform:rotate(-3deg) scale(1.03)}100%{transform:none}}'
    + '.invfly{position:fixed;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;pointer-events:none;z-index:6;will-change:transform;filter:drop-shadow(0 3px 0 rgba(34,48,60,.25))}@media (max-width:520px){.inv img{width:30px;height:30px}.inv b{font-size:22px}.inv .it{padding:3px 10px 3px 4px}}';
  document.head.appendChild(st);
  ['log', 'stone', 'berry', 'gem', 'coin'].forEach((t) => { const c = document.createElement('canvas'); c.width = c.height = 64; isleIcon(c.getContext('2d'), t, 32, 32, 1.25);
    const it = document.createElement('div'); it.className = 'it'; INV['p' + t] = it; const img = document.createElement('img'); img.alt = ''; img.src = c.toDataURL(); INV['i' + t] = img.src; INV['m' + t] = img; const b = document.createElement('b'); b.textContent = '0';
    it.appendChild(img); it.appendChild(b); el.appendChild(it); INV[t] = b; });
  document.body.appendChild(el); INV.el = el;
}
/* a gathered piece flies from where it landed up to its counter; the counter wiggles as each one arrives (Leon) */
const invFlies = [];
function invFly(t, wp) {
  if (!INV.el) { state.isle.store[t] = storeN(t) + 1; return; }
  const r = canvas.getBoundingClientRect(), v = tmpV.set(wp.x, wp.y + 0.3, wp.z).project(cam);
  const el = document.createElement('img'); el.className = 'invfly'; el.alt = ''; el.src = INV['i' + t]; document.body.appendChild(el);
  const f = { t, el, x0: r.left + (v.x + 1) / 2 * r.width, y0: r.top + (1 - v.y) / 2 * r.height, u: -invFlies.length * 0.06, D: 0.6 + Math.random() * 0.12, side: (Math.random() - 0.5) * 120 };
  el.style.transform = 'translate(' + f.x0 + 'px,' + f.y0 + 'px) scale(0.6)'; el.style.opacity = '0';
  invFlies.push(f); Snd.play('pop', { gain: 0.3, f: 480 + (storeN(t) % 8) * 40 });
}
function invFlyStep(dt) {
  for (let k = invFlies.length - 1; k >= 0; k--) { const f = invFlies[k]; f.u += dt / f.D; if (f.u < 0) continue;
    const u = Math.min(1, f.u), e = u * u * (3 - 2 * u), q = INV['m' + f.t].getBoundingClientRect(), x1 = q.left + q.width / 2, y1 = q.top + q.height / 2;
    const x = f.x0 + (x1 - f.x0) * e + f.side * Math.sin(u * Math.PI) * (1 - u), y = f.y0 + (y1 - f.y0) * e - 90 * Math.sin(u * Math.PI), s = 0.6 + 0.7 * Math.sin(u * Math.PI) + 0.35 * u;
    f.el.style.opacity = String(Math.min(1, u * 6)); f.el.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + (u > 0.85 ? s * (1 - (u - 0.85) * 3) : s) + ') rotate(' + (u * 360 * (f.side > 0 ? 1 : -1)) + 'deg)';
    if (u >= 1) { f.el.remove(); invFlies.splice(k, 1); state.isle.store[f.t] = storeN(f.t) + 1; invWig(f.t); Snd.play('tock', { gain: 0.3, f: 560 + (storeN(f.t) % 8) * 35 }); } }
}
function invWig(t) { const it = INV['p' + t]; if (!it) return; it.classList.remove('wig'); void it.offsetWidth; it.classList.add('wig'); }
function invStep() {
  if (!INV.el) return;
  const K = ['log', 'stone', 'berry', 'gem', 'coin'], v = K.map((t) => storeN(t) + carry.count(t)), key = v.join(',');
  if (key === invLast) return; invLast = key;
  K.forEach((t, k) => { if (VALUABLE[t]) INV['p' + t].style.display = v[k] ? '' : 'none'; const b = INV[t]; if (b.textContent !== String(v[k])) { b.textContent = v[k]; b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); } });
}

/* ---- a health bar over the thing Pip is working on: it drains with each hit ---- */
const HP_H = { tree: 2.55, rock: 1.25, bush: 1.2 };
const hpBar = (() => { const c = document.createElement('canvas'); c.width = 160; c.height = 40; const tex = new T.CanvasTexture(c);
  const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false })); sp.scale.set(1.2, 0.3, 1); sp.renderOrder = 10; sp.visible = false; sc.add(sp);
  return { c, tex, sp, n: null, t: 0, shown: 1 }; })();
function hpDraw(f) {
  const x = hpBar.c.getContext('2d'); x.clearRect(0, 0, 160, 40);
  x.beginPath(); x.roundRect(4, 6, 152, 28, 14); x.fillStyle = '#22303c'; x.fill();
  x.beginPath(); x.roundRect(9, 11, 142, 18, 9); x.fillStyle = '#5a4a40'; x.fill();
  if (f > 0) { x.beginPath(); x.roundRect(9, 11, Math.max(18, 142 * f), 18, 9); x.fillStyle = f > 0.5 ? '#7cc85a' : f > 0.25 ? '#f2c23c' : '#e9684a'; x.fill();
    x.beginPath(); x.roundRect(13, 13, Math.max(10, 142 * f - 8), 5, 3); x.fillStyle = 'rgba(255,255,255,0.45)'; x.fill(); }
  hpBar.tex.needsUpdate = true;
}
function hpShow(n) { if (hpBar.n !== n) hpBar.shown = 1; hpBar.n = n; hpBar.t = 2.2; hpBar.sp.visible = true; hpBar.goal = Math.max(0, n.hp / HITS[n.kind]); }
function hpStep(dt) {
  const b = hpBar; if (!b.sp.visible || !b.n) return;
  b.t -= dt; b.shown += (b.goal - b.shown) * Math.min(1, dt * 10); hpDraw(b.shown);
  b.sp.position.set(b.n.x, HP_H[b.n.kind] * (b.n.kind === 'tree' ? b.n.full : 1), b.n.z);
  b.sp.material.opacity = Math.min(1, b.t * 3);
  if (b.t <= 0 || (b.n.st !== 'ready' && b.shown < 0.02 && b.t < 1.6)) { b.sp.visible = false; b.n = null; }
}

/* ---- Pip's tools and the work animation: a two-handed overhead swing with the axe (trees) or the pickaxe (rocks);
   the hit lands when the tool comes down. Bushes: both hands reach in and pick. ---- */
const TOOL = (() => {
  const mk = (kind) => { const g = new T.Group(), L = [];
    let q = new T.CylinderGeometry(0.028, 0.032, 0.56, 7); q.translate(0, -0.6, 0); L.push(fac(q, '#a8774f', 1700));
    q = new T.CylinderGeometry(0.036, 0.036, 0.08, 7); q.translate(0, -0.36, 0); L.push(fac(q, '#6e4426', 1701)); /* grip */
    if (kind === 'axe') { q = new T.BoxGeometry(0.06, 0.12, 0.13); q.translate(0, -0.84, 0.06); L.push(fac(q, '#8b939c', 1702));
      q = new T.BoxGeometry(0.05, 0.22, 0.1); q.translate(0, -0.84, 0.16); L.push(fac(q, (cx, cy, cz) => cz > 0.19 ? new T.Color('#eef2f5') : new T.Color('#b9c1c9'), 1703)); }
    else { q = new T.CylinderGeometry(0.035, 0.035, 0.08, 7); q.translate(0, -0.86, 0); L.push(fac(q, '#6e7680', 1704));
      [1, -1].forEach((k) => { const c = new T.ConeGeometry(0.045, 0.26, 6); c.rotateX(k * Math.PI / 2 + k * 0.25); c.translate(0, -0.85 + 0.03, k * 0.14); L.push(fac(c, '#b9c1c9', 1705 + k)); }); }
    merged(L, MAT, g); g.scale.setScalar(1.35); g.position.y = 0.12; g.visible = false; return g; };
  return { axe: mk('axe'), pick: mk('pick') };
})();
let work = null, toolHold = 0;
function workStart(n) { work = { n, t: 0, hit: false, kind: n.kind }; }
const ease = (u) => u * u * (3 - 2 * u);
function workStep(dt) {
  const R = limbs.filter((l) => l.arm), arm = R.find((l) => l.g.position.x < 0) || R[0], other = R.find((l) => l !== arm);
  if (arm) [TOOL.axe, TOOL.pick].forEach((t) => { if (t.parent !== arm.g) arm.g.add(t); });
  toolHold = Math.max(0, toolHold - dt);
  if (!work) { TOOL.axe.visible = TOOL.pick.visible = false; pb.rotation.x *= Math.max(0, 1 - dt * 8); return; }
  const w = work, n = w.n, D = w.kind === 'bush' ? 0.48 : 0.5;
  w.t += dt / D; const u = Math.min(1, w.t);
  pip.rotation.y = Math.atan2(n.x - pip.position.x, n.z - pip.position.z);
  TOOL.axe.visible = w.kind === 'tree'; TOOL.pick.visible = w.kind === 'rock';
  let a, b, lean;
  if (w.kind === 'bush') { const s = Math.sin(u * Math.PI * 2); a = -1.25 + s * 0.35; b = -1.25 - s * 0.35; lean = 0.18 * Math.sin(u * Math.PI); if (!w.hit && u > 0.5) { w.hit = true; if (n.st === 'ready') nodeHit(n); } }
  else {
    if (u < 0.55) { const e = ease(u / 0.55); a = -0.35 - 2.55 * e; lean = -0.12 * e; }
    else if (u < 0.72) { const e = (u - 0.55) / 0.17; a = -2.9 + 2.0 * e * e; lean = -0.12 + 0.42 * e; }
    else { const e = ease((u - 0.72) / 0.28); a = -0.9 + 0.5 * e; lean = 0.3 * (1 - e); }
    b = a; if (!w.hit && u >= 0.72) { w.hit = true; if (n.st === 'ready') nodeHit(n); }
  }
  if (!reduced) { if (arm) arm.g.rotation.x = a; if (other) other.g.rotation.x = b; pb.rotation.x = lean; }
  if (u >= 1) { work = null; toolHold = 0.4; }
}

/* the island's own camera (Leon's picks, 2026-11-23): a little higher and further back than the farm, with a slight side bend.
   Changing CURVE_DEF here also makes the dev panel's Reset come back to these. */
Object.assign(CURVE_DEF, { strength: 0.011, side: 0.1, pitch: 47, dist: 15.5, ahead: 1.1 }); curveLoadDev();
