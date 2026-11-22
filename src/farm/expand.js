/* ---------- farm expansion, part 2: new animals, helper upgrades and the helper room ----------
   Data is in expand0.js. Everything here wraps existing functions (like robots.js does) so other files stay as they are.
   Helper upgrades are bought with hearts on 'xp' pads from the hearts queue (queue.js). Each one works by itself once
   bought, and each has a switch in the helper room in the house: a running robot is on, a sleeping robot is off.
   state.xp = { off: { key: true } for switched-off helpers, stock: { hay, grain } in the loft and the silo, honey: [..] } */
const XP_TEST = false; /* test build: a "Testa allt" button that unlocks all the new things at once */
function xpS() { if (!state.xp || typeof state.xp !== 'object') state.xp = {}; const s = state.xp; s.off = s.off || {}; s.stock = s.stock || { hay: 0, grain: 0 }; s.honey = s.honey || [0, 0]; return s; }
const xpOwn = (id) => !!state.owned[id];
const xpOn = (k) => !xpS().off[k];
const XP_STOCK_MAX = 24;

/* ---- coats, sounds and pictures for the new animals ---- */
Object.assign(COATS, {
  duck: [{ b: '#fbf8f1' }, { b: '#a8805a', s: '#3f7a52' }, { b: '#efe1c4' }, { b: '#8f8a86', s: '#3f7a52' }, { b: '#fbf8f1', s: '#e8c27a' }],
  rabbit: [{ b: '#f4efe4' }, { b: '#a8805a' }, { b: '#6b6560' }, { b: '#e8d6a8', s: '#fbf8f1' }, { b: '#3a3433', s: '#fbf8f1' }],
  alpaca: [{ b: '#f3ead8' }, { b: '#c9a27a' }, { b: '#8a6a52' }, { b: '#3f3a3a' }, { b: '#e8d6c0' }],
  donkey: [{ b: '#9a948c' }, { b: '#7a6a5c' }]
});
ANIMAL_GOODS.duck = { t: 'egg', n: 1, at: 'farm' };
ANIMAL_GOODS.alpaca = { t: 'wool', n: 1, at: 'pen' };
{ const a0 = Snd.animal.bind(Snd), AL = { duck: ['hen', 1.35], alpaca: ['sheep', 0.8], donkey: ['horse', 0.8], rabbit: ['pig', 1.7] };
  Snd.animal = function (name, o) { const q = AL[name]; if (!q) return a0(name, o); o = Object.assign({}, o || {}); o.rate = (o.rate || 1) * q[1]; o.gain = (o.gain == null ? 0.8 : o.gain) * (name === 'rabbit' ? 0.25 : 0.8); return a0(q[0], o); }; }
{ const d0 = drawIcon; drawIcon = function (cx, t, x, y, s) {
  const NEW = ['duck', 'rabbit', 'alpaca', 'donkey', 'wheat', 'stream', 'bee', 'can', 'mill', 'helproom'];
  if (!NEW.includes(t)) return d0(cx, t, x, y, s);
  cx.save(); cx.translate(x, y); cx.scale(s, s); cx.lineWidth = 4; cx.strokeStyle = PAL.ink; cx.lineJoin = 'round'; cx.lineCap = 'round';
  const E = (a, b, rx, ry, f, r) => { cx.fillStyle = f; cx.beginPath(); cx.ellipse(a, b, rx, ry, r || 0, 0, 7); cx.fill(); cx.stroke(); };
  const eye = (a, b) => { cx.fillStyle = PAL.ink; cx.beginPath(); cx.arc(a, b, 3.6, 0, 7); cx.fill(); cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(a + 1.2, b - 1.3, 1.3, 0, 7); cx.fill(); };
  if (t === 'duck') { E(-2, 10, 24, 15, '#fbf8f1'); E(12, -12, 13, 13, '#fbf8f1'); E(27, -9, 10, 5, '#f2a03a'); eye(14, -15); cx.beginPath(); cx.moveTo(-14, 8); cx.quadraticCurveTo(-2, 18, 8, 8); cx.stroke(); }
  else if (t === 'rabbit') { E(-9, -30, 6, 17, '#f4efe4', -0.15); E(9, -30, 6, 17, '#f4efe4', 0.15); E(-9, -30, 2.6, 11, '#f0b2b6', -0.15); E(9, -30, 2.6, 11, '#f0b2b6', 0.15); E(0, 2, 22, 20, '#f4efe4'); eye(-8, -2); eye(8, -2); E(0, 8, 4, 3, '#e98aa0'); }
  else if (t === 'alpaca') { E(-4, 16, 22, 13, '#f3ead8'); E(10, -8, 8, 18, '#f3ead8'); E(12, -24, 11, 10, '#f3ead8'); E(10, -34, 8, 6, '#f3ead8'); E(19, -20, 5, 4, '#c9a27a'); eye(13, -26); }
  else if (t === 'donkey') { E(-8, -26, 5, 15, '#9a948c', -0.35); E(8, -26, 5, 15, '#9a948c', 0.35); E(0, 2, 18, 22, '#9a948c'); E(0, 16, 13, 9, '#e8e2d8'); eye(-8, -2); eye(8, -2); cx.fillStyle = PAL.ink; [-4, 4].forEach((q) => { cx.beginPath(); cx.arc(q, 17, 1.8, 0, 7); cx.fill(); }); }
  else if (t === 'wheat') { cx.beginPath(); cx.moveTo(0, 32); cx.lineTo(0, -26); cx.stroke(); [[-1, -22], [1, -12], [-1, -2], [1, 8], [-1, 18]].forEach(([q, b]) => E(q * 9, b, 5.5, 9, '#f2c14e', q * 0.6)); E(0, -30, 5, 9, '#f2c14e'); }
  else if (t === 'stream') { cx.fillStyle = '#4a90c8'; cx.beginPath(); cx.moveTo(-30, -18); cx.bezierCurveTo(-6, -24, 10, -6, -6, 6); cx.bezierCurveTo(-20, 18, 10, 30, 30, 24); cx.lineTo(30, 32); cx.bezierCurveTo(4, 36, -30, 22, -14, 8); cx.bezierCurveTo(2, -4, -14, -12, -30, -8); cx.closePath(); cx.fill(); cx.stroke();
    E(16, -14, 8, 6, PAL.rock); E(-20, 22, 7, 5, PAL.rock); }
  else if (t === 'bee') { E(0, 4, 20, 14, '#f2c14e'); cx.save(); cx.beginPath(); cx.ellipse(0, 4, 20, 14, 0, 0, 7); cx.clip(); cx.fillStyle = PAL.ink; [-8, 4].forEach((q) => cx.fillRect(q, -12, 6, 32)); cx.restore(); cx.beginPath(); cx.ellipse(0, 4, 20, 14, 0, 0, 7); cx.stroke();
    E(-6, -14, 9, 12, 'rgba(255,255,255,0.85)', -0.4); E(8, -14, 9, 12, 'rgba(255,255,255,0.85)', 0.4); eye(14, 2); }
  else if (t === 'can') { cx.fillStyle = '#8bc46a'; cx.fillRect(-22, -6, 30, 30); cx.strokeRect(-22, -6, 30, 30); cx.beginPath(); cx.moveTo(8, 4); cx.lineTo(30, -16); cx.stroke(); cx.beginPath(); cx.arc(-7, -6, 13, Math.PI, 0); cx.stroke();
    cx.strokeStyle = '#4a90c8'; cx.lineWidth = 3; [[32, -10], [28, -4], [36, -4]].forEach(([a, b]) => { cx.beginPath(); cx.moveTo(a, b); cx.lineTo(a + 2, b + 8); cx.stroke(); }); }
  else if (t === 'mill') { cx.fillStyle = '#f3ead8'; cx.beginPath(); cx.moveTo(-12, 30); cx.lineTo(-8, -8); cx.lineTo(8, -8); cx.lineTo(12, 30); cx.closePath(); cx.fill(); cx.stroke(); cx.fillStyle = PAL.accent; cx.beginPath(); cx.moveTo(-11, -8); cx.lineTo(0, -20); cx.lineTo(11, -8); cx.closePath(); cx.fill(); cx.stroke();
    cx.save(); cx.translate(0, -12); cx.fillStyle = '#fff6e4'; for (let k = 0; k < 4; k++) { cx.rotate(Math.PI / 2 + 0.3); cx.fillRect(-4, -30, 8, 22); cx.strokeRect(-4, -30, 8, 22); } cx.restore();
    E(20, 26, 10, 6, '#4a90c8'); }
  else if (t === 'helproom') { cx.fillStyle = PAL.paper; cx.fillRect(-22, -20, 44, 34); cx.strokeRect(-22, -20, 44, 34); cx.fillStyle = PAL.ink; cx.fillRect(-15, -12, 30, 13); cx.fillStyle = '#8ff0ae'; cx.fillRect(-10, -9, 7, 7); cx.fillRect(3, -9, 7, 7);
    cx.beginPath(); cx.moveTo(0, -20); cx.lineTo(0, -30); cx.stroke(); E(0, -32, 4, 4, PAL.accent); cx.fillStyle = PAL.ink; cx.fillRect(-16, 14, 8, 12); cx.fillRect(8, 14, 8, 12); }
  cx.restore(); }; }

/* ---- buy pads for the helper upgrades ---- */
{ const p0 = padPos; padPos = function (p) { if (p.kind === 'xp') { const q = XP[p.id].pad; return [q[0], q[1]]; } return p0(p); }; }
{ const t0 = padTex; padTex = function (p, left) {
  if (p.kind !== 'xp') return t0(p, left);
  const tex = t0({ kind: 'none', cost: p.cost }, left), c = tex.image, x = c.getContext('2d');
  drawIcon(x, XP[p.id].icon, 128, 86, 1.25); if (p.id !== 'xp-bees' && p.id !== 'xp-donkey' && p.id !== 'xp-stream' && p.id !== 'xp-wheat') drawIcon(x, 'helproom', 178, 112, 0.55);
  tex.needsUpdate = true; return tex; }; }
{ const b0 = build; build = function (p) { if (p.kind === 'xp') return xpBuild(p.id); return b0(p); }; }

/* ---- the stream and the lake ---- */
function edgeX(z, k) { let lo = -26, hi = 0; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (isleD(m, z) > k) lo = m; else hi = m; } return (lo + hi) / 2; }
const LAKE = { x: -15.6, z: 9.85, rx: 1.75, rz: 0.95 };
const WATER_MAT = new T.MeshStandardMaterial({ color: PAL.sea, roughness: 0.22, metalness: 0.05 });
function ribbon(pts, w, y) {
  const P = [], I = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b.x - a.x, dz = b.y - a.y, L = Math.hypot(dx, dz) || 1, nx = -dz / L, nz = dx / L, ww = typeof w === 'function' ? w(i / (pts.length - 1)) : w;
    P.push(pts[i].x + nx * ww / 2, y, pts[i].y + nz * ww / 2, pts[i].x - nx * ww / 2, y, pts[i].y - nz * ww / 2);
    if (i) { const k = i * 2; I.push(k - 2, k, k - 1, k - 1, k, k + 1); }
  }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals();
  const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0);
  return g;
}
const XPW = { stream: null, pts: [] };
function buildStream() {
  if (XPW.stream) return; const G = new T.Group(); sc.add(G); XPW.stream = G;
  const A = [-7.4, -5.2, -2.6, 0, 2.6, 5.0, 6.8].map((z) => new T.Vector2(edgeX(z, z < -6 ? 0.86 : 0.885), z));
  A.push(new T.Vector2(-18.25, 8.7), new T.Vector2(LAKE.x - LAKE.rx + 0.2, LAKE.z - 0.1));
  const B = [new T.Vector2(LAKE.x + LAKE.rx - 0.25, LAKE.z + 0.2), new T.Vector2(-12.7, 11.25), new T.Vector2(-10.4, 11.95), new T.Vector2(-8.0, 12.0), new T.Vector2(-6.3, 11.4)];
  const L = [];
  [A, B].forEach((C, j) => {
    const pts = new T.SplineCurve(C).getPoints(j ? 40 : 90); XPW.pts.push(...pts);
    const m = new T.Mesh(ribbon(pts, (u) => (j === 0 ? 0.3 + 0.25 * Math.min(1, u * 3) : 0.5), 0.045), WATER_MAT); m.receiveShadow = true; G.add(m);
    const bank = new T.Mesh(ribbon(pts, (u) => (j === 0 ? 0.55 + 0.3 * Math.min(1, u * 3) : 0.8), 0.03), new T.MeshStandardMaterial({ color: '#8f9c6a', roughness: 1 })); bank.receiveShadow = true; G.add(bank);
    const P = at(0, 0, 0, L);
    for (let i = 2; i < pts.length - 2; i += 3) { const a = pts[i - 1], b = pts[i + 1], dx = b.x - a.x, dz = b.y - a.y, l = Math.hypot(dx, dz) || 1, side = i % 2 ? 1 : -1, w = j ? 0.36 : 0.3;
      const r = 0.08 + hash(i, j * 7 + 3) * 0.07; P(ico(r, 0, 3100 + i), [PAL.rock, '#a9a59a', '#c9c1b6'][i % 3], 3100 + i, pts[i].x - dz / l * w * side, 0.05, pts[i].y + dx / l * w * side);
      if (hash(i, j + 11) > 0.6) P(cyl(0.015, 0.015, 0.45, 4), '#6f8f4a', 3200 + i, pts[i].x + dz / l * (w + 0.05) * side, 0.22, pts[i].y - dx / l * (w + 0.05) * side); }
  });
  /* the spring: a ring of mossy stones where the water bubbles up */
  const s0 = A[0], P = at(s0.x, s0.y, 0, L);
  for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283; P(ico(0.14 + hash(k, 77) * 0.06, 0, 3300 + k), k % 2 ? '#8f9c6a' : PAL.rock, 3300 + k, Math.cos(a) * 0.42, 0.06, Math.sin(a) * 0.42); }
  const pool = new T.Mesh(new T.CircleGeometry(0.36, 18), WATER_MAT); pool.rotation.x = -Math.PI / 2; pool.position.set(s0.x, 0.05, s0.y); G.add(pool);
  /* the lake, with stones round the edge and reeds at the back */
  const sh = new T.Shape(); for (let k = 0; k <= 32; k++) { const a = k / 32 * 6.283, r = 1 + 0.07 * Math.sin(a * 3 + 0.4); if (k) sh.lineTo(Math.cos(a) * LAKE.rx * r, Math.sin(a) * LAKE.rz * r); else sh.moveTo(Math.cos(a) * LAKE.rx * r, Math.sin(a) * LAKE.rz * r); }
  const lake = new T.Mesh(new T.ShapeGeometry(sh), WATER_MAT); lake.rotation.x = -Math.PI / 2; lake.position.set(LAKE.x, 0.06, LAKE.z); lake.receiveShadow = true; G.add(lake);
  const rim = new T.Mesh(new T.ShapeGeometry((() => { const s2 = new T.Shape(); for (let k = 0; k <= 32; k++) { const a = k / 32 * 6.283, r = 1.12 + 0.07 * Math.sin(a * 3 + 0.4); if (k) s2.lineTo(Math.cos(a) * LAKE.rx * r, Math.sin(a) * LAKE.rz * r); else s2.moveTo(Math.cos(a) * LAKE.rx * r, Math.sin(a) * LAKE.rz * r); } return s2; })()), new T.MeshStandardMaterial({ color: '#b9b08a', roughness: 1 }));
  rim.rotation.x = -Math.PI / 2; rim.position.set(LAKE.x, 0.05, LAKE.z); G.add(rim);
  const Q = at(LAKE.x, LAKE.z, 0, L);
  for (let k = 0; k < 18; k++) { const a = k / 18 * 6.283, r = 1.12 + 0.07 * Math.sin(a * 3 + 0.4); if (Math.abs(a - 0.2) < 0.4 || Math.abs(a - 3.3) < 0.35) continue; Q(ico(0.11 + hash(k, 91) * 0.07, 0, 3400 + k), [PAL.rock, '#a9a59a', '#c9c1b6'][k % 3], 3400 + k, Math.cos(a) * LAKE.rx * r, 0.06, Math.sin(a) * LAKE.rz * r); }
  for (let k = 0; k < 7; k++) { const a = 3.7 + k * 0.22; Q(cyl(0.018, 0.018, 0.6 + hash(k, 92) * 0.3, 4), '#6f8f4a', 3420 + k, Math.cos(a) * LAKE.rx * 1.02, 0.32, Math.sin(a) * LAKE.rz * 0.95); Q(cyl(0.04, 0.04, 0.15, 5), '#7d5e4e', 3430 + k, Math.cos(a) * LAKE.rx * 1.02, 0.66 + hash(k, 92) * 0.3, Math.sin(a) * LAKE.rz * 0.95); }
  [[0.6, 0.2], [-0.5, -0.3], [0.1, 0.45]].forEach(([a, b], k) => Q(cyl(0.16, 0.16, 0.02, 10), '#6a9a4c', 3440 + k, a, 0.075, b));
  merged(L, MAT, G);
  XPW.lake = lake;
}
function nearStream(x, z) { let best = null, bd = 1e9; XPW.pts.forEach((p) => { const d = Math.hypot(p.x - x, p.y - z); if (d < bd) { bd = d; best = p; } }); return best; }

/* ---- buildings for the helper upgrades: one little model each, made like the rest of the farm ---- */
const XB = {};
function shedRoof(P, w, d, h, col, seed) { [-1, 1].forEach((k) => P(box(w / 2 + 0.12, 0.06, d + 0.2), col, seed, k * w / 4, h + 0.18, 0, { rz: -k * 0.42 })); }
function xpBuild(id) {
  if (XB[id]) return; const L = [];
  if (id === 'xp-stream') { buildStream(); XB[id] = true; return; }
  if (id === 'xp-loft') {
    const [x, z] = XP[id].pad, g = new T.Group(); g.position.set(x, 0, z); sc.add(g); const P = at(x, z, 0, L);
    [[-0.75, -0.5], [0.75, -0.5], [-0.75, 0.5], [0.75, 0.5]].forEach(([a, b], k) => P(box(0.1, 1.5, 0.1), PAL.trunk, 3500 + k, a, 0.75, b));
    P(box(1.7, 0.08, 1.2), '#9a6542', 3505, 0, 0.12, 0); shedRoof(P, 1.9, 1.3, 1.5, PAL.accent, 3506);
    P(box(0.06, 0.6, 0.06), PAL.trunk, 3507, 0.6, 1.85, 0.55); P(box(0.5, 0.05, 0.05), PAL.trunk, 3508, 0.4, 2.12, 0.55);
    XB[id] = { g, pile: new Pile(g, (k) => [-0.45 + (k % 3) * 0.45, 0.2 + Math.floor(k / 6) * ITEM_H.hay, -0.22 + (Math.floor(k / 3) % 2) * 0.44]) };
    solid(x, z, 0.85);
  } else if (id === 'xp-silo') {
    const [x, z] = XP[id].pad, g = new T.Group(); g.position.set(x, 0, z); sc.add(g); const P = at(x, z, 0, L);
    P(cyl(0.55, 0.55, 2.2, 14), (cx, cy) => tone(Math.floor(cy * 4) % 2 ? '#d9d4cc' : '#c9c1b6', Math.floor(cy * 4), 0.3), 3510, 0, 1.1, -0.2);
    P(new T.ConeGeometry(0.62, 0.5, 14), PAL.accent, 3511, 0, 2.45, -0.2); P(box(0.14, 0.9, 0.14), '#8f8a86', 3512, 0.42, 0.75, 0.35, { rz: -0.5 });
    P(box(1.1, 0.06, 0.6), '#9a6542', 3513, 0, 0.05, 0.62);
    XB[id] = { g, pile: new Pile(g, (k) => [-0.35 + (k % 4) * 0.23, 0.12 + Math.floor(k / 8) * ITEM_H.grain, 0.5 + (Math.floor(k / 4) % 2) * 0.2]) };
    solid(x, z - 0.2, 0.7);
  } else if (id === 'xp-pump') {
    const x = 6.95, z = -12.85, g = new T.Group(); g.position.set(x, 0, z); sc.add(g); const P = at(x, z, 0, L);
    P(box(0.9, 0.3, 0.7), PAL.rock, 3520, 0, 0.15, 0); P(box(0.6, 0.6, 0.5), '#9a6542', 3521, 0, 0.6, 0); shedRoof(P, 0.75, 0.6, 0.85, PAL.accent, 3522);
    P(cyl(0.06, 0.06, 1.6, 6), '#4a90c8', 3523, -0.75, 0.25, 0.1, { rz: Math.PI / 2 }); P(cyl(0.05, 0.05, 0.5, 6), '#4a90c8', 3524, -1.5, 0.45, 0.1);
    XB[id] = { g, at: [x - 0.3, z + 0.6] }; solid(x, z, 0.6);
  } else if (id === 'xp-sprink') {
    const x = 8.2, z = -4.8, g = new T.Group(); g.position.set(x, 0, z); sc.add(g); const P = at(x, z, 0, L);
    P(cyl(0.04, 0.05, 0.6, 6), '#8f8a86', 3530, 0, 0.3, 0); P(cyl(0.14, 0.18, 0.06, 10), '#5d9160', 3531, 0, 0.03, 0);
    const arm = new T.Group(); arm.position.y = 0.62; g.add(arm); part(fac(box(0.7, 0.04, 0.04), '#4a90c8', 3532), arm, 0, 0, 0);
    const drops = []; for (let k = 0; k < 14; k++) { const m = new T.Mesh(new T.SphereGeometry(0.025, 5, 4), new T.MeshBasicMaterial({ color: '#bfe6f5', transparent: true, opacity: 0.85 })); g.add(m); drops.push(m); }
    XB[id] = { g, arm, drops };
  } else if (id === 'xp-bees') {
    const hives = [[11.15, 10.15], [12.25, 9.95]];
    hives.forEach(([x, z], k) => { const P = at(x, z, 0.2 * k, L);
      P(box(0.6, 0.12, 0.5), '#9a6542', 3540 + k, 0, 0.32, 0); [0, 1, 2].forEach((j) => P(box(0.52 - j * 0.04, 0.18, 0.42 - j * 0.03), j % 2 ? '#f2c14e' : '#f6d27a', 3542 + j, 0, 0.47 + j * 0.18, 0));
      P(box(0.6, 0.06, 0.5), PAL.accent, 3546, 0, 1.0, 0); [[-0.22, -0.18], [0.22, -0.18], [-0.22, 0.18], [0.22, 0.18]].forEach(([a, b], q) => P(box(0.05, 0.28, 0.05), PAL.trunk, 3547 + q, a, 0.14, b)); solid(x, z, 0.45); });
    const bees = []; for (let k = 0; k < 8; k++) { const b = new T.Group(); sc.add(b); part(fac(new T.SphereGeometry(0.045, 6, 4), '#f2c14e', 3560), b, 0, 0, 0, true); bees.push({ g: b, h: hives[k % 2], p: k * 1.7 }); }
    const jars = hives.map(([x, z]) => { const s = new T.Sprite(new T.SpriteMaterial({ map: bubble('bee'), depthTest: false })); s.scale.set(0.62, 0.62, 1); s.position.set(x, 1.65, z); s.renderOrder = 5; s.visible = false; sc.add(s); return s; });
    XB[id] = { hives, bees, jars };
  } else if (id === 'xp-donkey') {
    const [x, z] = XP[id].pad, P = at(x, z, 0, L);
    const wd = (cx, cy, cz, i) => tone('#9a6542', i, 0.5).multiplyScalar(0.82 + 0.25 * clamp(cy + 0.5, 0, 1));
    [[-0.85, 0.45], [0.85, 0.45]].forEach(([a, b], k) => P(box(0.11, 1.05, 0.11), PAL.trunk, 3570 + k, a, 0.52, b));
    P(box(1.8, 1.05, 0.08), wd, 3576, 0, 0.52, -0.5); [-1, 1].forEach((s2) => P(box(0.08, 1.05, 1.0), wd, 3578, s2 * 0.88, 0.52, -0.02));
    [-1, 1].forEach((s2) => P(box(1.0, 0.07, 1.4), (cx, cy, cz, i) => tone(PAL.accent, i, 0.6), 3575, s2 * 0.44, 1.32, -0.02, { rz: -s2 * 0.5 }));
    P(new T.CylinderGeometry(0.05, 0.05, 1.45, 6).rotateX(Math.PI / 2), PAL.trunk, 3579, 0, 1.56, -0.02);
    P(box(0.6, 0.3, 0.32), '#c9a46a', 3577, 0.45, 0.16, -0.25); P(ico(0.22, 1, 3580).scale(1.6, 0.6, 1), '#e2c36b', 3581, -0.4, 0.12, -0.2);
    solid(x, z - 0.35, 0.5); xpCart(x, z);
    XB[id] = true;
  } else XB[id] = true;
  if (L.length) merged(L, MAT);
}

/* ---- the wheat field: the east half of the meadow grows wheat instead of grass once it is bought ---- */
let wheatOn = false, wheatCut = 0;
function makeWheat() {
  if (wheatOn) return; wheatOn = true;
  const stalk = new T.CylinderGeometry(0.012, 0.016, 0.62, 4); stalk.translate(0, 0.31, 0);
  const ear = new T.SphereGeometry(0.045, 6, 4); ear.scale(1, 2.2, 1); ear.translate(0, 0.66, 0);
  tufts.forEach((t) => { if (t.x < 0.3) return; sc.remove(t.g); const g = new T.Group(); g.position.set(t.x, 0, t.z); sc.add(g);
    for (let k = 0; k < 4; k++) { const s = part(fac(stalk.clone(), '#c9b25a', 3600 + k), g, (k % 2 - 0.5) * 0.14, 0, (Math.floor(k / 2) - 0.5) * 0.14, true); s.rotation.z = (k - 1.5) * 0.08; part(fac(ear.clone(), (cx, cy) => tone(cy > 0.7 ? '#f2c14e' : '#e3b24a', k, 0.4), 3610 + k), s, 0, 0, 0, true); }
    g.scale.y = t.h; t.g = g; t.w = true; });
  /* a sign with an ear of wheat at the field's edge */
  const L = [], P = at(0.4, MEADOW.z1 + 0.7, 0, L); P(box(0.07, 0.8, 0.07), PAL.trunk, 3620, 0, 0.4, 0); merged(L, MAT);
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#fff6e4'; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.fill(); x.lineWidth = 6; x.strokeStyle = PAL.ink; x.stroke(); drawIcon(x, 'wheat', 64, 66, 1.3);
  const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c) })); sp.scale.set(0.6, 0.6, 1); sp.position.set(0.4, 1.05, MEADOW.z1 + 0.7); sc.add(sp);
}
/* cutting: grass gives hay as before (to the hay loft when it is on); wheat gives grain (to the silo when it is on) */
{ const c0 = cutTuft; cutTuft = function (t) {
  if (t.w) { t.h = 0.12; t.g.scale.y = t.h; wheatCut++;
    if (wheatCut % 3 === 0) { earn(1); coinToHud(t.x, 0.5, t.z, 1); Snd.play('pop', { gain: 0.4, f: 520 }, 0, 120);
      if (xpOwn('xp-silo') && xpOn('x:silo') && xpS().stock.grain < XP_STOCK_MAX) xpToStore('grain', t.x, t.z);
      else { const m = mk('grain'); m.position.set(t.x, 0, t.z); sc.add(m); loose.push(m); } }
    return; }
  const n = loose.length; c0(t);
  if (loose.length > n && xpOwn('xp-loft') && xpOn('x:loft') && xpS().stock.hay < XP_STOCK_MAX) { const m = loose.pop(); sc.remove(m); xpToStore('hay', t.x, t.z); }
}; }
function xpToStore(t, x, z) {
  const S = xpS(); S.stock[t] = (S.stock[t] || 0) + 1; const st = XB[t === 'hay' ? 'xp-loft' : 'xp-silo'];
  if (!st || !st.pile) return; const m = mk(t); m.position.set(x, 0.3, z); sc.add(m);
  fly(m, () => st.g.localToWorld(tmpV.set(0, 1.0, 0)), () => { sc.remove(m); xpShowStock(); }, 1.1);
}
function xpShowStock() {
  ['hay', 'grain'].forEach((t) => { const st = XB[t === 'hay' ? 'xp-loft' : 'xp-silo']; if (!st || !st.pile) return; const want = Math.min(t === 'hay' ? 12 : 16, xpS().stock[t] || 0);
    while (st.pile.items.length < want) st.pile.add(mk(t)); while (st.pile.items.length > want) { const m = st.pile.take(); if (m && m.parent) m.parent.remove(m); } });
}

/* ---- the donkey cart: a donkey pulls a little cart of hay, carrots and grain out to the pens that are running low ---- */
let cart = null;
function xpCart(x, z) {
  if (cart) return; const g = new T.Group(); g.position.set(x + 1.3, 0, z); sc.add(g);
  const d = animalModel('donkey', 1); d.g.scale.setScalar(0.72); d.g.position.set(0, 0, 0.55); g.add(d.g);
  const c = new T.Group(); c.position.set(0, 0, -0.55); g.add(c);
  part(fac(box(0.8, 0.22, 0.75), '#9a6542', 3580), c, 0, 0.42, 0); part(fac(box(0.84, 0.06, 0.8), '#7a4f34', 3581), c, 0, 0.3, 0);
  [-1, 1].forEach((s) => { const w = new T.CylinderGeometry(0.2, 0.2, 0.06, 10); w.rotateZ(Math.PI / 2); part(fac(w, PAL.ink, 3582), c, s * 0.46, 0.2, 0); part(fac(box(0.04, 0.04, 0.7), PAL.trunk, 3583), c, s * 0.18, 0.4, 0.55); });
  cart = { g, donkey: d, c, home: [x + 1.3, z], st: 'idle', k: 0, t: null, pen: null, cool: 0 };
  cart.pile = new Pile(c, (k) => [-0.2 + (k % 2) * 0.4, 0.55 + Math.floor(k / 2) * 0.18, -0.15 + (Math.floor(k / 2) % 2) * 0.3]);
}
function cartJob() {
  let best = null, bs = 0;
  for (const a in pens) { const pen = pens[a], f = feedPos(a), far = Math.hypot(f[0] - SRC.hay.x, f[1] - SRC.hay.z);
    for (const t of ['hay', 'carrot', 'grain']) { if (!DIET[a].includes(t) || !sources[t]) continue; const have = boxCount(pen, t); if (have >= BOX_MAX - 2) continue;
      if (helpers.some((h) => h.t === t && h.target === pen)) continue;
      const s = (BOX_MAX - have) + (far > 7 ? 3 : 0) + animals.filter((an) => an.a === a && an.want === t).length * 4; if (s > bs) { bs = s; best = { pen, t }; } } }
  return best;
}
function cartStep(dt) {
  if (!cart) return; const p = cart.g.position, sp = 1.9;
  const on = xpOn('x:cart');
  cart.donkey.body.position.y = cart.st !== 'idle' && cart.st !== 'home' ? Math.abs(Math.sin(time * 9)) * 0.03 : 0;
  if (!on && cart.st !== 'home') { cart.st = 'home'; }
  if (cart.st === 'home') { if (walkTo(cart.g, cart.home[0], cart.home[1], dt, sp)) { cart.g.rotation.y = 0; if (on) cart.st = 'idle'; } return; }
  if (cart.st === 'idle') { cart.cool -= dt; if (cart.cool > 0) return; cart.cool = 2; const j = cartJob(); if (!j) return; cart.pen = j.pen; cart.t = j.t; cart.st = cart.pile.items.length ? 'go' : 'get'; return; }
  if (cart.st === 'get') { const s = SRC[cart.t]; if (walkTo(cart.g, s.x + 1.1, s.z + 0.2, dt, sp)) { cart.k -= dt; if (cart.k > 0) return; cart.k = 0.2;
      if (cart.pile.items.length < 4) { const S = xpS(), from = (cart.t === 'hay' && S.stock.hay > 0) ? 'hay' : (cart.t === 'grain' && S.stock.grain > 0) ? 'grain' : null; if (from) { S.stock[from]--; xpShowStock(); }
        const m = mk(cart.t); m.position.set(s.x, 0.5, s.z); sc.add(m); fly(m, () => cart.c.localToWorld(tmpV.set(0, 0.7, 0)), () => cart.pile.add(m)); }
      else cart.st = 'go'; } return; }
  if (cart.st === 'go') { const f = feedPos(cart.pen.a); if (walkTo(cart.g, f[0] + 0.5, f[1] + 0.9, dt, sp)) { cart.st = 'feed'; cart.k = 0; } return; }
  if (cart.st === 'feed') { cart.k -= dt; if (cart.k > 0) return; cart.k = 0.35;
    if (cart.pile.items.length && boxCount(cart.pen, cart.t) < BOX_MAX) { const m = cart.pile.take(); boxIn(cart.pen, m, 0.5); }
    else { cart.pile.items.slice().forEach((m) => { cart.pile.take(); if (m.parent) m.parent.remove(m); }); cart.pen = null; cart.st = 'idle'; } }
}

/* ---- the tractor drives itself: when nobody is driving, it mows the meadow in rows and comes back home ---- */
const AUTO = { st: 'home', i: 0, wp: [], cool: 8 };
function autoRoute() {
  const out = [[TRACTOR_HOME[0] - 0.4, -12.0], [7.6, -12.0], [MEADOW.x1 + 0.4, -11.3]];
  let dir = -1; for (let z = MEADOW.z0 + 0.5; z <= MEADOW.z1 - 0.3; z += 1.5) { dir = -dir; out.push(dir < 0 ? [MEADOW.x1 - 0.3, z] : [MEADOW.x0 + 0.3, z]); out.push(dir < 0 ? [MEADOW.x0 + 0.3, z] : [MEADOW.x1 - 0.3, z]); }
  out.push([MEADOW.x1 + 0.4, -11.3], [7.6, -12.0], [TRACTOR_HOME[0] - 0.4, -12.0], [TRACTOR_HOME[0], TRACTOR_HOME[1]]);
  return out;
}
function autoStep(dt) {
  if (!tractor || !xpOwn('xp-auto')) return; const driving = mount && mount.kind === 'tractor';
  if (driving) { AUTO.st = 'home'; AUTO.cool = 6; return; }
  const g = tractor.g, on = xpOn('x:auto');
  if (AUTO.st === 'home') { if (!on) return; AUTO.cool -= dt; if (AUTO.cool > 0) return; AUTO.cool = 6;
    if (isNight) return; const ready = tufts.filter((t) => t.h > 0.85).length; if (ready < tufts.length * 0.3) return;
    AUTO.wp = autoRoute(); AUTO.i = 0; AUTO.st = 'drive'; return; }
  if (!on && AUTO.i < AUTO.wp.length - 4) AUTO.i = AUTO.wp.length - 4;
  const w = AUTO.wp[AUTO.i]; if (!w) { AUTO.st = 'home'; return; }
  const ox = g.position.x, oz = g.position.z;
  if (walkTo(g, w[0], w[1], dt, 2.6)) { AUTO.i++; if (AUTO.i >= AUTO.wp.length) { AUTO.st = 'home'; g.rotation.y = 0; AUTO.cool = 25; } }
  else g.rotation.y = Math.atan2(g.position.x - ox, g.position.z - oz) || g.rotation.y;
  const px = g.position.x, pz = g.position.z;
  if (px > MEADOW.x0 - 1 && px < MEADOW.x1 + 1 && pz > MEADOW.z0 - 1 && pz < MEADOW.z1 + 1) tufts.forEach((t) => { if (t.h > 0.8 && Math.hypot(t.x - px, t.z - pz) < 1.0) cutTuft(t); });
}

/* ---- water, grain and hay that fill the feed boxes by themselves ---- */
const STREAM_PENS = ['cow', 'hen', 'pig', 'bull', 'duck'], PUMP_PENS = ['horse', 'goat', 'sheep', 'rabbit', 'alpaca'];
let feedT = 0;
function feedStep(dt) {
  feedT -= dt; if (feedT > 0) return; feedT = 1.6;
  const give = (a, t, from) => { const pen = pens[a]; if (!pen || !DIET[a].includes(t) || boxCount(pen, t) >= BOX_MAX) return false; const m = mk(t); m.position.set(from[0], 0.3, from[1]); sc.add(m); boxIn(pen, m, 0.9); return true; };
  if (xpOwn('xp-stream') && xpOn('x:stream')) STREAM_PENS.forEach((a) => { const pen = pens[a]; if (!pen) return; const q = nearStream(pen.g.position.x, pen.g.position.z); if (q) give(a, 'water', [q.x, q.y]); });
  if (xpOwn('xp-pump') && xpOn('x:pump') && XB['xp-pump']) PUMP_PENS.forEach((a) => give(a, 'water', XB['xp-pump'].at));
  const S = xpS();
  [['hay', 'xp-loft', 'x:loft'], ['grain', 'xp-silo', 'x:silo']].forEach(([t, id, k]) => {
    if (!xpOwn(id) || !xpOn(k) || !XB[id] || !XB[id].pile) return;
    for (const a in pens) { if (S.stock[t] <= 0) break; if (DIET[a].includes(t) && boxCount(pens[a], t) < BOX_MAX - 1) { const p = XB[id].g.position; if (give(a, t, [p.x, p.z])) { S.stock[t]--; xpShowStock(); break; } } } });
}

/* ---- bees: they buzz round the hives, make honey to collect, and help the apple trees grow ---- */
let honeyT = 0;
function beeStep(dt) {
  const B = XB['xp-bees']; if (!B || !B.bees) return; const S = xpS();
  B.bees.forEach((b, k) => { const a = time * (1.2 + (k % 3) * 0.3) + b.p, r = 0.6 + Math.sin(time * 0.7 + k) * 0.25; b.g.position.set(b.h[0] + Math.cos(a) * r, 0.9 + Math.sin(a * 2.3) * 0.25, b.h[1] + Math.sin(a) * r * 0.8); b.g.visible = !isNight; });
  honeyT += dt; if (honeyT > 40) { honeyT = 0; S.honey = S.honey.map((n) => Math.min(3, n + 1)); }
  B.jars.forEach((s, i) => { s.visible = S.honey[i] > 0 && !inHouse; s.position.y = 1.65 + (reduced ? 0 : Math.sin(time * 2 + i) * 0.05); });
  if (typeof trees !== 'undefined') trees.forEach((q) => { if (q && q.pile.items.length < q.max) q.t += dt * 0.5 * (season === 'winter' ? 0.5 : 1); });
}
function nearHive() { const B = XB['xp-bees']; if (!B || !B.hives) return -1; let best = -1; B.hives.forEach(([x, z], i) => { if (xpS().honey[i] > 0 && Math.hypot(pip.position.x - x, pip.position.z - z) < 1.3) best = i; }); return best; }
function takeHoney(i) { const S = xpS(), n = S.honey[i]; if (!n) return; S.honey[i] = 0; const [x, z] = XB['xp-bees'].hives[i], h = n * 6; earn(h); coinToHud(x, 1.2, z, Math.min(6, h)); burst(x, 1.2, z, 5); Snd.play('sparkle', { gain: 0.5 }); save(); }

/* ---- the sprinkler waters the garden beds that need it ---- */
let sprT = 0;
function sprinkStep(dt) {
  const B = XB['xp-sprink']; if (!B || !B.arm) return; const on = xpOn('x:sprink') && (typeof gardenOn !== 'function' || gardenOn());
  const busy = on && state.garden && state.garden.some((st) => st.s === 1 && st.g < 1);
  if (busy) B.arm.rotation.y += dt * 2.2;
  B.drops.forEach((m, k) => { m.visible = busy && !reduced; if (!m.visible) return; const q = (time * 0.9 + k / B.drops.length) % 1, a = B.arm.rotation.y + (k % 2 ? 0 : Math.PI); m.position.set(Math.cos(a) * (0.35 + q * 1.6), 0.62 + Math.sin(q * Math.PI) * 0.5, -Math.sin(a) * (0.35 + q * 1.6)); });
  sprT -= dt; if (sprT > 0 || !on) return; sprT = 2;
  if (state.garden) state.garden.forEach((st) => { if (st.s === 1 && st.g < 1) st.w = Math.max(st.w, 30); });
}

/* ---- ducks bob on the lake ---- */
function duckStep() {
  animals.concat(typeof babies !== 'undefined' ? babies : []).forEach((an) => { if (an.a !== 'duck') return; const p = an.g.position, u = (p.x - LAKE.x) / LAKE.rx, v = (p.z - LAKE.z) / LAKE.rz, wet = XPW.lake && u * u + v * v < 0.85;
    an.body.position.y = wet ? -0.08 + (reduced ? 0 : Math.sin(time * 2 + p.x) * 0.02) : 0; });
}

/* ---- the helper room: in the house, a board of switches, one per helper. Pictures, not words: the children are 4 and 5 ---- */
const HR_CSS = `
.hrWrap { position: fixed; inset: 0; z-index: 45; background: rgba(34,48,60,0.45); display: grid; place-items: center; padding: 12px; font-family: Fredoka, sans-serif; }
.hrWrap[hidden] { display: none; }
.hrSheet { position: relative; width: min(1080px, 100%); max-height: calc(100vh - 24px); overflow: auto; background: #fff6e4; border: 4px solid #22303c; border-radius: 28px; box-shadow: 0 8px 0 rgba(34,48,60,0.3); padding: 16px; box-sizing: border-box; animation: pop 0.22s ease-out; }
.hrTop { display: flex; gap: 12px; align-items: center; justify-content: center; margin: 0 56px 12px; }
.hrTop button { height: 58px; padding: 0 16px; border-radius: 29px; border: 3px solid #22303c; box-shadow: 0 4px 0 rgba(34,48,60,0.3); display: flex; align-items: center; gap: 6px; }
.hrTop button svg { width: 50px; height: 50px; }
.hrAll1 { background: #bfe3b0; } .hrAll0 { background: #d3dcea; }
.hrGrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; }
.hrGrp { border: 3px solid #22303c; border-radius: 22px; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.hrHead { display: flex; justify-content: center; } .hrHead img { width: 60px; height: 60px; background: #fff; border: 3px solid #22303c; border-radius: 16px; }
.hrRow { display: flex; align-items: center; gap: 10px; }
.hrPic { width: 66px; height: 66px; flex: none; background: #fff; border: 3px solid #22303c; border-radius: 18px; box-sizing: border-box; }
.hrRow.lock .hrPic { opacity: 0.45; }
.hrSw { position: relative; flex: 1; min-width: 120px; height: 66px; border-radius: 33px; border: 3px solid #22303c; box-shadow: 0 4px 0 rgba(34,48,60,0.25); padding: 0; background: #aeb9ca; cursor: pointer; }
.hrSw.on { background: #7cc46b; }
.hrKnob { position: absolute; top: 3px; left: 4px; width: 54px; height: 54px; border-radius: 27px; background: #fff; border: 2px solid #22303c; box-sizing: border-box; display: grid; place-items: center; transition: left 0.2s ease; }
.hrSw.on .hrKnob { left: calc(100% - 58px); }
.hrKnob svg { width: 48px; height: 48px; }
.hrLock { flex: 1; min-width: 120px; height: 66px; border-radius: 33px; border: 3px dashed #7a8490; display: grid; place-items: center; box-sizing: border-box; }
.hrLock svg { width: 30px; height: 30px; }
.hrClose { position: absolute; top: 10px; right: 10px; width: 58px; height: 58px; border-radius: 50%; border: 3px solid #22303c; background: #fff6e4; box-shadow: 0 4px 0 rgba(34,48,60,0.3); display: grid; place-items: center; padding: 0; }
@keyframes hrBob { 50% { transform: translateY(-2px); } } @keyframes hrLegA { 50% { transform: translateY(-4px); } } @keyframes hrLegB { 0%, 100% { transform: translateY(-4px); } 50% { transform: translateY(0); } }
@keyframes hrZ { 0% { opacity: 0; transform: translate(0, 0); } 40% { opacity: 1; } 100% { opacity: 0; transform: translate(5px, -9px); } }
.hrRun { animation: hrBob .36s ease-in-out infinite; } .hrLA { animation: hrLegA .36s ease-in-out infinite; } .hrLB { animation: hrLegB .36s ease-in-out infinite; }
.hrZ1 { animation: hrZ 2.2s ease-in-out infinite; } .hrZ2 { animation: hrZ 2.2s ease-in-out .9s infinite; }
@media (prefers-reduced-motion: reduce) { .hrRun, .hrLA, .hrLB, .hrZ1, .hrZ2 { animation: none; } }
.xpTest { position: fixed; left: max(16px, env(safe-area-inset-left, 0px)); top: 96px; z-index: 30; height: 48px; padding: 0 16px; border-radius: 24px; border: 3px solid #22303c; background: #f2c14e; font: 600 18px Fredoka, sans-serif; color: #22303c; box-shadow: 0 4px 0 rgba(34,48,60,0.3); }
`;
{ const st = document.createElement('style'); st.textContent = HR_CSS; document.head.appendChild(st); }
const HR_AWAKE = '<svg viewBox="0 0 50 50" aria-hidden="true"><g class="hrRun"><line x1="25" y1="10" x2="25" y2="5" stroke="#22303c" stroke-width="2.5"/><circle cx="25" cy="4" r="2.5" fill="#e9684a" stroke="#22303c" stroke-width="1.5"/><rect x="13" y="10" width="24" height="17" rx="6" fill="#fff6e4" stroke="#22303c" stroke-width="2.5"/><circle cx="20" cy="18" r="2.6" fill="#22303c"/><circle cx="30" cy="18" r="2.6" fill="#22303c"/><path d="M21 23 Q25 26 29 23" fill="none" stroke="#22303c" stroke-width="2" stroke-linecap="round"/><rect x="15" y="28" width="20" height="11" rx="4" fill="#8fcfc4" stroke="#22303c" stroke-width="2.5"/></g><rect class="hrLA" x="18" y="39" width="5" height="8" rx="2" fill="#22303c"/><rect class="hrLB" x="27" y="39" width="5" height="8" rx="2" fill="#22303c"/></svg>';
const HR_ASLEEP = '<svg viewBox="0 0 50 50" aria-hidden="true"><rect x="10" y="22" width="26" height="17" rx="6" fill="#e6e9ee" stroke="#22303c" stroke-width="2.5"/><path d="M15 30 Q18 32 21 30 M25 30 Q28 32 31 30" fill="none" stroke="#22303c" stroke-width="2" stroke-linecap="round"/><rect x="8" y="39" width="32" height="7" rx="3" fill="#b7c2d2" stroke="#22303c" stroke-width="2.5"/><text class="hrZ1" x="36" y="18" font-family="Fredoka, sans-serif" font-weight="600" font-size="11" fill="#4a5560">z</text><text class="hrZ2" x="41" y="12" font-family="Fredoka, sans-serif" font-weight="600" font-size="9" fill="#4a5560">z</text></svg>';
const HR_LOCK = '<svg viewBox="0 0 22 22" aria-hidden="true" fill="#fff" stroke="#4a5560" stroke-width="2.2"><rect x="4" y="10" width="14" height="10" rx="2"/><path d="M7 10 V7 a4 4 0 0 1 8 0 V10" fill="none"/></svg>';
const HR_PIC = {};
function hrPic(a, b) { const k = a + (b || ''); if (HR_PIC[k]) return HR_PIC[k]; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); if (b) { drawIcon(x, a, 56, 68, 1.05); drawIcon(x, b, 96, 34, 0.6); } else drawIcon(x, a, 64, 66, 1.3); return (HR_PIC[k] = c.toDataURL()); }
/* every switch: what it is (key), its picture, whether it is bought, whether it is on, and how to flip it */
function hrRows() {
  const X = (k, id, ic, sub, sv) => ({ k, ic, sub, sv, own: xpOwn(id), on: () => xpOn(k), flip: () => { const s = xpS(); if (xpOn(k)) s.off[k] = true; else delete s.off[k]; } });
  const bots = allBots(), B = (key, ic, sub, sv) => { const h = bots.find((q) => (q.key || (q.key = botKey(q))) === key); return { k: key, ic, sub, sv, own: !!h, on: () => !!h && botOn(h), flip: () => h && toggleBot(h) }; };
  const prod = Object.keys(stalls || {}).filter((t) => stalls[t] && stalls[t].stocker);
  return [
    { ic: 'tractor', sv: 'Traktorn', rows: [X('x:auto', 'xp-auto', 'tractor', null, 'Traktorn kör själv'), X('x:loft', 'xp-loft', 'hay', null, 'Höloftet fyller hö'), X('x:silo', 'xp-silo', 'grain', null, 'Silon fyller korn')] },
    { ic: 'paw', sv: 'Djuren', rows: [X('x:stream', 'xp-stream', 'stream', null, 'Bäcken ger vatten'), X('x:pump', 'xp-pump', 'mill', 'water', 'Kvarnen pumpar vatten'), X('x:cart', 'xp-donkey', 'donkey', null, 'Åsnevagnen'),
      B('f:water', 'robot', 'water', 'Robot: vatten'), B('f:grain', 'robot', 'grain', 'Robot: korn'), B('f:hay', 'robot', 'hay', 'Robot: hö'), B('f:carrot', 'robot', 'carrot', 'Robot: morötter')] },
    { ic: 'coin', sv: 'Marknaden', rows: prod.map((t) => B('s:' + t, 'robot', t, 'Robot: ' + t)).concat(mHelpers.filter(Boolean).map((h) => B('m:' + h.i, 'robot', 'coin', 'Bärrobot'))) },
    { ic: 'carrot', sv: 'Trädgården', rows: [X('x:sprink', 'xp-sprink', 'can', null, 'Vattenspridaren')] }
  ].filter((g) => g.rows.length);
}
const hrEl = document.createElement('div'); hrEl.className = 'hrWrap'; hrEl.hidden = true; hrEl.setAttribute('role', 'dialog'); hrEl.setAttribute('aria-label', 'Hjälparrummet'); document.body.appendChild(hrEl);
let hrList = [];
function hrRender() {
  const G = hrRows(); hrList = [];
  const grp = G.map((g) => '<div class="hrGrp" style="background:' + ({ Traktorn: '#fbe7b5', Djuren: '#d8ebcb', Marknaden: '#e3daf3', 'Trädgården': '#dcefd9' }[g.sv]) + '"><div class="hrHead"><img alt="' + g.sv + '" src="' + hrPic(g.ic) + '"></div>'
    + g.rows.map((r) => { const i = hrList.push(r) - 1, on = r.own && r.on();
      return '<div class="hrRow' + (r.own ? '' : ' lock') + '"><img class="hrPic" alt="' + r.sv + '" title="' + r.sv + '" src="' + hrPic(r.ic, r.sub) + '">'
        + (r.own ? '<button type="button" class="hrSw' + (on ? ' on' : '') + '" data-i="' + i + '" aria-pressed="' + on + '" aria-label="' + r.sv + '"><span class="hrKnob">' + (on ? HR_AWAKE : HR_ASLEEP) + '</span></button>' : '<div class="hrLock" role="img" aria-label="' + r.sv + ': inte köpt än">' + HR_LOCK + '</div>') + '</div>'; }).join('') + '</div>').join('');
  hrEl.innerHTML = '<div class="hrSheet"><div class="hrTop"><button type="button" class="hrAll1" data-all="1" aria-label="Alla vaknar">' + HR_AWAKE + HR_AWAKE + '</button><button type="button" class="hrAll0" data-all="0" aria-label="Alla sover">' + HR_ASLEEP + HR_ASLEEP + '</button></div><div class="hrGrid">' + grp + '</div>'
    + '<button type="button" class="hrClose" aria-label="Stäng"><svg viewBox="0 0 30 30" width="30" height="30" aria-hidden="true"><path d="M7 7 L23 23 M23 7 L7 23" stroke="#22303c" stroke-width="4.5" stroke-linecap="round"/></svg></button></div>';
}
hrEl.addEventListener('click', (e) => {
  e.stopPropagation(); const t = e.target.closest('button');
  if (!t) { if (e.target === hrEl) hrClose(); return; }
  if (t.classList.contains('hrClose')) { hrClose(); return; }
  if (t.dataset.all) { const want = t.dataset.all === '1'; hrList.forEach((r) => { if (r.own && r.on() !== want) r.flip(); }); Snd.play(want ? 'powerup' : 'pop', { gain: 0.4, f: want ? 520 : 260 }); save(); hrRender(); return; }
  const r = hrList[+t.dataset.i]; if (!r) return; const was = r.on(); r.flip(); if (!r.k.startsWith('f:') && !r.k.startsWith('s:') && !r.k.startsWith('m:')) Snd.play(was ? 'pop' : 'powerup', { gain: 0.4, f: was ? 260 : 520 }); save(); hrRender();
});
['pointerdown', 'touchstart', 'mousedown'].forEach((ev) => hrEl.addEventListener(ev, (e) => e.stopPropagation()));
function hrOpen() { hrRender(); hrEl.hidden = false; Snd.play('whoosh', { gain: 0.3 }); }
function hrClose() { hrEl.hidden = true; }
const atHome = () => inHouse && !inBarn && !inStore;
{ const f0 = findActs; findActs = function () {
  const out = f0(); if (!hrEl.hidden) return [];
  if (atHome()) out.unshift({ icon: actIcon('helproom'), label: 'Hjälparrummet', run: hrOpen });
  else { const i = nearHive(); if (i >= 0) out.unshift({ icon: actIcon('bee'), label: 'Ta honung', run: () => takeHoney(i) }); }
  return out.slice(0, 2); }; }

/* ---- the test button: unlock all the new things at once (test build only) ---- */
function xpUnlockAll() {
  ['tractor', 'hay', 'help-water', 'help-grain', 'help-hay', 'help-carrot'].concat(PADS.filter((p) => p.kind === 'xp' || ['duck', 'rabbit', 'alpaca'].includes(p.a)).map((p) => p.id)).forEach((id) => {
    const p = PADS.find((q) => q.id === id); if (!p || state.owned[id]) return; state.owned[id] = true; delete state.paid[id]; build(p); });
  if (state.garden && typeof gardenOn === 'function' && !gardenOn()) { /* the garden stays as bought */ }
  { const S = xpS(); S.stock.hay = Math.max(S.stock.hay || 0, 8); S.stock.grain = Math.max(S.stock.grain || 0, 8); xpShowStock(); }
  state.coins += 500; bump(); showPad(); save(); Snd.play('success', { gain: 0.6, f: 'E6' });
}
if (XP_TEST) { const b = document.createElement('button'); b.type = 'button'; b.className = 'xpTest'; b.textContent = 'Testa allt'; document.body.appendChild(b);
  b.addEventListener('click', (e) => { e.stopPropagation(); xpUnlockAll(); b.hidden = true; });
  ['pointerdown', 'touchstart', 'mousedown'].forEach((ev) => b.addEventListener(ev, (e) => e.stopPropagation()));
  setInterval(() => { if (state && PADS.filter((p) => p.kind === 'xp').every((p) => state.owned[p.id])) b.hidden = true; }, 1500); }

/* a new hay loft or silo comes with a starter load, so it works before the first harvest */
{ const u0 = unlock; unlock = function (p) { if (p && (p.id === 'xp-loft' || p.id === 'xp-silo')) { const S = xpS(), t = p.id === 'xp-loft' ? 'hay' : 'grain'; S.stock[t] = Math.max(S.stock[t] || 0, 8); } u0(p); if (p && (p.id === 'xp-loft' || p.id === 'xp-silo')) xpShowStock(); }; }

/* ---- every frame ---- */
let xpReady = false;
{ const e0 = extrasStep; extrasStep = function (dt) { e0(dt);
  if (!xpReady) { xpReady = true; xpS(); if (xpOwn('xp-wheat')) makeWheat(); xpShowStock(); }
  if (xpOwn('xp-wheat') && !wheatOn) makeWheat();
  autoStep(dt); feedStep(dt); cartStep(dt); beeStep(dt); sprinkStep(dt); duckStep(); }; }
{ const x0 = xpBuild; xpBuild = function (id) { x0(id); if (id === 'xp-wheat' && typeof tufts !== 'undefined') makeWheat(); }; }
if (window.__farmTest) window.__xp = { S: () => xpS(), own: xpOwn, all: xpUnlockAll, open: hrOpen, close: hrClose, rows: () => hrRows().map((g) => g.sv + ':' + g.rows.map((r) => r.k + (r.own ? (r.on() ? '+' : '-') : '#')).join(',')).join(' | '), cart: () => cart && { st: cart.st, t: cart.t, pen: cart.pen && cart.pen.a, at: [cart.g.position.x, cart.g.position.z] }, auto: () => ({ st: AUTO.st, i: AUTO.i, n: AUTO.wp.length, at: tractor && [tractor.g.position.x, tractor.g.position.z] }) };
