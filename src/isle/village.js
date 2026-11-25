/* ---------- the camp grows into a village (Leon's vision, 2026-11-24) ----------
   The home island is the heart of the game, and watching it come alive is the main reward. So every villager who moves in
   changes the camp where you can see it:
   - a friends board by the crate, from the start: a face for each villager found, a grey "?" for each still out there;
   - the first workshop built lays stone paths between the tent, the fire and the crate, and two lanterns;
   - each villager then adds their own corner: a path to their workshop, a lantern, a flower box;
   - with two or more, bunting goes up across the camp and flower beds bloom.
   Lanterns glow at night. Pieces pop in one by one, with sparkles, when they are earned. */
const VILLAGERS = [
  { id: 'smith', head: '#8a5a3a', ear: 'bear', badge: 'hammer' },
  { id: 'baker', head: '#e8b04a', ear: 'duck', badge: 'pie' },
  { id: 'mason', head: '#e07a3a', ear: 'fox', badge: 'chisel' },
  { id: 'knitter', head: '#f4ece2', ear: 'bunny', badge: 'yarn' },
  { id: 'miner', head: '#7fbf4a', ear: 'frog', badge: 'crystal' }
];
const housed = (id) => !!(state.isle.folk && state.isle.folk[id] >= 3);
const villageLv = () => VILLAGERS.filter((v) => housed(v.id)).length;
const VG = { parts: {}, lamps: [], pops: [], key: '' };
/* (position: see rules.js) */ /* behind the crate, clear of the bridge sign */

/* ---- the friends board ---- */
const boardCv = document.createElement('canvas'); boardCv.width = 512; boardCv.height = 224; const boardTex = new T.CanvasTexture(boardCv);
/* one friend's face: grey with a ? until found, a gold dot while found, their work's picture once moved in */
function boardFace(x, v, cx, cy, sc0, f) {
  if (f == null) f = 3; x.save(); x.translate(cx, cy); x.scale(sc0, sc0); x.lineWidth = 5; x.strokeStyle = PAL.ink; x.lineJoin = 'round';
  const blob = (c) => { x.fillStyle = c; x.fill(); x.stroke(); };
  if (!f) { x.beginPath(); x.arc(0, 0, 36, 0, 7); blob('#b9b0a0');
    x.fillStyle = '#fff6e4'; x.font = '800 44px "Baloo 2", system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('?', 0, 3); x.restore(); return; }
  if (v.ear === 'bear') [-1, 1].forEach((s) => { x.beginPath(); x.arc(s * 26, -28, 12, 0, 7); blob(v.head); });
  if (v.ear === 'fox') [-1, 1].forEach((s) => { x.beginPath(); x.moveTo(s * 12, -30); x.lineTo(s * 32, -50); x.lineTo(s * 32, -16); x.closePath(); blob(v.head); });
  if (v.ear === 'bunny') [-1, 1].forEach((s) => { x.beginPath(); x.ellipse(s * 14, -46, 9, 24, s * 0.15, 0, 7); blob(v.head); x.fillStyle = '#f2a8b8'; x.beginPath(); x.ellipse(s * 14, -46, 4, 15, s * 0.15, 0, 7); x.fill(); });
  if (v.ear === 'frog') [-1, 1].forEach((s) => { x.beginPath(); x.arc(s * 17, -30, 13, 0, 7); blob(v.head); x.fillStyle = '#fff6e4'; x.beginPath(); x.arc(s * 17, -31, 7, 0, 7); x.fill(); x.fillStyle = PAL.ink; x.beginPath(); x.arc(s * 17, -30, 3.6, 0, 7); x.fill(); });
  x.beginPath(); x.arc(0, 0, 36, 0, 7); blob(v.head);
  if (v.ear === 'fox') { x.fillStyle = '#fbf3e4'; x.beginPath(); x.moveTo(-30, 8); x.quadraticCurveTo(0, 44, 30, 8); x.quadraticCurveTo(0, 22, -30, 8); x.fill(); }
  if (v.ear === 'duck') { x.beginPath(); x.ellipse(0, 12, 16, 8, 0, 0, 7); blob('#f2a13c'); x.beginPath(); x.ellipse(0, -40, 24, 13, 0, 0, 7); blob('#fbf8f0'); }
  else if (v.ear === 'frog') { x.lineWidth = 3.5; x.beginPath(); x.arc(0, 6, 16, 0.25, Math.PI - 0.25); x.stroke(); x.lineWidth = 5; x.beginPath(); x.ellipse(0, -30, 22, 9, 0, Math.PI, 0); blob('#f2c23c'); }
  else { x.fillStyle = '#f0d6b0'; x.beginPath(); x.ellipse(0, 12, 15, 11, 0, 0, 7); x.fill(); x.fillStyle = v.ear === 'bunny' ? '#e98aa0' : PAL.ink; x.beginPath(); x.arc(0, 8, 5, 0, 7); x.fill(); }
  if (v.ear !== 'frog') { x.fillStyle = PAL.ink; [-1, 1].forEach((s) => { x.beginPath(); x.arc(s * 13, -6, 5, 0, 7); x.fill(); }); }
  x.lineWidth = 4;
  if (f >= 3) { x.beginPath(); x.arc(26, 34, 20, 0, 7); blob('#fff6e4'); isleIcon(x, v.badge, 26, 34, 0.6); } /* moved in: what they make */
  else { x.beginPath(); x.arc(26, 34, 13, 0, 7); blob('#f2c23c'); } /* found, not moved in yet */
  x.restore();
}
function boardDraw() {
  const x = boardCv.getContext('2d'); x.clearRect(0, 0, 512, 224);
  x.fillStyle = '#c99158'; x.beginPath(); x.roundRect(4, 4, 504, 216, 22); x.fill(); x.lineWidth = 8; x.strokeStyle = '#6e4426'; x.stroke();
  x.fillStyle = '#e7c48f'; x.beginPath(); x.roundRect(20, 20, 472, 184, 14); x.fill();
  VILLAGERS.forEach((v, k) => {
    const cx = 64 + k * 96, cy = 100, f = state.isle && state.isle.folk ? state.isle.folk[v.id] || 0 : 0;
    boardFace(x, v, cx, cy, 1, f);
  });
  boardTex.needsUpdate = true;
}
const boardG = (() => {
  const g = new T.Group(); g.position.set(BOARD.x, 0, BOARD.z); g.rotation.y = -0.25; sc.add(g); const L = [];
  [-1, 1].forEach((s, k) => { const q = new T.CylinderGeometry(0.06, 0.07, 1.5, 7); q.translate(s * 0.95, 0.75, 0); L.push(fac(q, PAL.trunk, 3000 + k)); });
  let q = new T.BoxGeometry(2.1, 0.12, 0.2); q.translate(0, 1.58, 0); L.push(fac(q, '#b5562f', 3002)); /* a little roof */
  merged(L, MAT, g);
  const face = new T.Mesh(new T.PlaneGeometry(1.8, 0.79), new T.MeshBasicMaterial({ map: boardTex, transparent: true })); face.position.set(0, 1.05, 0.05); g.add(face);
  return g;
})();

/* ---- pieces: stone paths, lanterns, bunting, flowers ---- */
function pathGeo(P, seed) { /* stepping stones along a line of points, leaving the rings at both ends clear */
  const L = []; let c = 0;
  for (let k = 0; k < P.length - 1; k++) { const [x0, z0] = P[k], [x1, z1] = P[k + 1], len = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / len, uz = (z1 - z0) / len;
    for (let d = 0.2; d < len; d += 0.42) { if ((k === 0 && d < 0.65) || (k === P.length - 2 && len - d < 0.65)) continue;
      const sd = seed + c++, j = (hash(sd, 1) - 0.5) * 0.24, x = x0 + ux * d - uz * j, z = z0 + uz * d + ux * j, r = 0.15 + hash(sd, 2) * 0.07;
      const q = ico(r, 0, sd); q.scale(1, 0.2, 0.85); q.rotateY(hash(sd, 3) * 3); q.translate(x, 0.015, z); L.push(fac(q, tone('#d8cfbd', sd, 0.8), sd)); } }
  return L;
}
function lanternMake(x, z, L) {
  let q = new T.CylinderGeometry(0.045, 0.06, 1.5, 7); q.translate(x, 0.75, z); L.push(fac(q, '#5a4636', 3100));
  q = new T.BoxGeometry(0.34, 0.06, 0.06); q.translate(x + 0.15, 1.48, z); L.push(fac(q, '#5a4636', 3101));
  q = new T.ConeGeometry(0.17, 0.14, 4); q.rotateY(Math.PI / 4); q.translate(x + 0.3, 1.45, z); L.push(fac(q, '#3e454d', 3102));
  const lamp = new T.Mesh(new T.BoxGeometry(0.16, 0.2, 0.16), new T.MeshBasicMaterial({ color: '#ffe6a8' })); lamp.position.set(x + 0.3, 1.3, z);
  const glow = new T.Sprite(new T.SpriteMaterial({ map: softTex(32, 32), color: '#ffd27a', transparent: true, opacity: 0, depthWrite: false })); glow.position.set(x + 0.3, 1.3, z); glow.scale.set(1.3, 1.3, 1);
  VG.lamps.push({ lamp, glow }); return [lamp, glow];
}
function buntingGeo(a, b, seed) { /* a sagging string with little flags between two lantern tops */
  const L = [], COLS = ['#e9684a', '#f2c23c', '#74a857', '#5aa7d6', '#f29ab8'], n = 9;
  for (let k = 0; k < n; k++) { const t = (k + 0.5) / n, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t, y = 1.5 - Math.sin(t * Math.PI) * 0.35;
    const q = new T.BufferGeometry(), w = 0.13, ux = (b[0] - a[0]) / n * 0.4, uz = (b[1] - a[1]) / n * 0.4;
    q.setAttribute('position', new T.Float32BufferAttribute([x - ux, y, z - uz, x + ux, y, z + uz, x, y - w * 1.6, z, x + ux, y, z + uz, x - ux, y, z - uz, x, y - w * 1.6, z], 3)); L.push(fac(q, COLS[k % 5], seed + k)); }
  for (let k = 0; k < 12; k++) { const t0 = k / 12, t1 = (k + 1) / 12, P = [t0, t1].map((t) => [a[0] + (b[0] - a[0]) * t, 1.5 - Math.sin(t * Math.PI) * 0.35 + 0.01, a[1] + (b[1] - a[1]) * t]);
    const q = new T.CylinderGeometry(0.012, 0.012, Math.hypot(P[1][0] - P[0][0], P[1][1] - P[0][1], P[1][2] - P[0][2]), 4); q.rotateZ(Math.PI / 2);
    q.rotateZ(Math.atan2(P[1][1] - P[0][1], Math.hypot(P[1][0] - P[0][0], P[1][2] - P[0][2]))); q.rotateY(-Math.atan2(P[1][2] - P[0][2], P[1][0] - P[0][0])); q.translate((P[0][0] + P[1][0]) / 2, (P[0][1] + P[1][1]) / 2, (P[0][2] + P[1][2]) / 2); L.push(fac(q, '#f4ecd8', seed + 50 + k)); }
  return L;
}
function flowerBox(x, z, r, L, seed) {
  let q = new T.BoxGeometry(0.9, 0.22, 0.4); q.rotateY(r); q.translate(x, 0.11, z); L.push(fac(q, (cx, cy, cz, i) => tone('#a8774f', i, 0.5), seed));
  const COLS = ['#ffffff', '#f6d24a', '#f29ab8', '#b89cf0', '#e9684a'];
  for (let k = 0; k < 7; k++) { const t = (k / 6 - 0.5) * 0.75, fx = x + Math.cos(r) * t, fz = z - Math.sin(r) * t, h = 0.3 + hash(seed, k) * 0.15;
    const st = new T.CylinderGeometry(0.012, 0.012, h, 3); st.translate(fx, 0.2 + h / 2, fz); L.push(fac(st, '#5d8a3a', seed + 10 + k));
    const b = ico(0.07, 0, seed + 20 + k); b.translate(fx, 0.22 + h, fz); L.push(fac(b, COLS[k % 5], seed + 20 + k)); }
}
/* which pieces the camp has earned, and how each is made */
const VILLAGE = {
  /* from the first day: a signpost where the road leaves for the bridge */
  start: { ok: () => true, make: (g, L) => { signpost(0.85, -2.5, L, 3200, 0.4); }, at: [0.85, -2.5] },
  /* the first friend: lanterns at the plaza's corners */
  base: { ok: () => villageLv() >= 1, make: (g, L) => {
    [[1.75, -1.75], [-1.75, 1.75]].forEach(([x, z]) => lanternMake(x, z, L).forEach((m) => g.add(m)));
    flowerBox(STORE.x - 1.25, STORE.z - 0.1, 1.2, L, 3250); }, at: [0.4, -1.5] },
  /* each corner of the island joins the village once it is bought: street lanterns and a signpost; the green in h3 has the well */
  east: { ok: () => villageLv() >= 1 && !!HAS.h1, make: (g, L) => {
    [[6.7, -0.75], [10.4, 3.0], [14.4, 3.0]].forEach(([x, z]) => lanternMake(x, z, L).forEach((m) => g.add(m))); signpost(8.6, 3.3, L, 3270, 1.2); flowerBox(12.6, 3.05, 0, L, 3280); }, at: [10, 1.2] },
  south: { ok: () => villageLv() >= 1 && !!HAS.h2, make: (g, L) => {
    [[-0.75, 6.7], [2.0, 10.6], [2.0, 14.4]].forEach(([x, z]) => lanternMake(x, z, L).forEach((m) => g.add(m))); signpost(2.3, 8.5, L, 3290, 2.6); flowerBox(2.05, 12.6, 1.57, L, 3300); }, at: [1.2, 10] },
  green: { ok: () => villageLv() >= 1 && !!HAS.h3, make: (g, L) => {
    wellMake(WELL.x, WELL.z, L, 3260); lookFoot(WELL.x, WELL.z, 0.6);
    [[5.7, 5.9], [9.3, 9.1]].forEach(([x, z]) => lanternMake(x, z, L).forEach((m) => g.add(m)));
    [[9.2, 6.0, 0.8], [5.8, 9.0, 0.8]].forEach(([x, z, r], k) => flowerBox(x, z, r, L, 3310 + k * 30));
    benchMake(6.0, 6.9, 1.0, L, 3370); benchMake(9.0, 8.2, -2.1, L, 3380); signpost(9.4, 5.6, L, 3390, 0.3); }, at: [WELL.x, WELL.z] },
  smith: { ok: () => housed('smith'), make: (g, L) => {
    lanternMake(ANVIL_RING.x + 1.1, ANVIL_RING.z + 0.5, L).forEach((m) => g.add(m)); flowerBox(FORGE.x - 1.35, FORGE.z + 1.0, 0.1, L, 3450); fenceRun(FORGE.x - 1.9, FORGE.z - 1.0, FORGE.x + 1.7, FORGE.z - 1.0, L, 3460); }, at: [FORGE.x, FORGE.z] },
  baker: { ok: () => housed('baker'), make: (g, L) => {
    lanternMake(OVEN_RING.x - 1.2, OVEN_RING.z + 0.4, L).forEach((m) => g.add(m)); flowerBox(OVEN.x + 1.5, OVEN.z - 0.9, -0.3, L, 3550); fenceRun(OVEN.x - 1.0, OVEN.z - 1.1, OVEN.x + 1.6, OVEN.z - 1.1, L, 3560); }, at: [OVEN.x, OVEN.z] },
  /* two friends: bunting across the plaza, more lanterns down the roads, flower beds */
  fest: { ok: () => villageLv() >= 2, make: (g, L) => {
    [[-1.75, -1.75], [1.75, 1.75], [0.85, -4.0], [4.2, -0.85], [-0.85, 4.2]].forEach(([x, z]) => lanternMake(x, z, L).forEach((m) => g.add(m)));
    L.push(...buntingGeo([2.05, -1.75], [-1.45, 1.75], 3600)); L.push(...buntingGeo([-1.45, -1.75], [2.05, 1.75], 3650));
    flowerBox(-1.0, -2.9, 1.57, L, 3700); flowerBox(2.75, 0.95, 0, L, 3720); flowerBox(-2.9, 0.9, 0.2, L, 3740); }, at: [0, 0] }
};
/* a signpost with pointing boards, like the farm's */
/* (position: see rules.js) */ /* in the middle of the village green */
/* a plank bench */
function benchMake(x, z, r, L, seed) {
  const put = (q, col, k) => { q.rotateY(r); q.translate(x, 0, z); L.push(fac(q, () => tone(col, seed + k, 0.5), seed + k)); };
  [0, 1].forEach((k) => { const q = new T.BoxGeometry(0.95, 0.045, 0.15); q.translate(0, 0.3, -0.08 + k * 0.16); put(q, k ? '#b9824c' : '#a8774f', k); });
  [0, 1].forEach((k) => { const q = new T.BoxGeometry(0.95, 0.12, 0.04); q.translate(0, 0.46 + k * 0.15, -0.2); put(q, k ? '#a8774f' : '#b9824c', 2 + k); });
  [-0.4, 0.4].forEach((dx, k) => { let q = new T.BoxGeometry(0.06, 0.3, 0.3); q.translate(dx, 0.15, 0); put(q, '#8a5f3c', 4 + k); q = new T.BoxGeometry(0.05, 0.4, 0.05); q.translate(dx, 0.5, -0.2); put(q, '#8a5f3c', 6 + k); });
}
/* a stone well with a little shingle roof and a bucket */
function wellMake(x, z, L, seed) {
  for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) { const a = (k + r * 0.5) / 9 * 6.283, q = new T.BoxGeometry(0.3, 0.17, 0.2, 2, 1, 1); jit(q, 0.02, seed + r * 9 + k); q.rotateY(-a + Math.PI / 2); q.translate(x + Math.cos(a) * 0.46, 0.09 + r * 0.17, z + Math.sin(a) * 0.46); L.push(fac(q, (cx, cy, cz, i) => tone(['#b9b3a6', '#a7a297', '#c6c0b2'][(k + r) % 3], i + k, 0.5), seed + r * 9 + k)); }
  let q = new T.CylinderGeometry(0.4, 0.4, 0.04, 12); q.translate(x, 0.3, z); L.push(fac(q, '#3f7f9c', seed + 40)); /* water */
  [-1, 1].forEach((s, k) => { q = new T.BoxGeometry(0.09, 1.25, 0.09); q.translate(x + s * 0.5, 0.95, z); L.push(fac(q, (cx, cy, cz, i) => shadeY('#8a6a4a', cy, 0.3, 1.6, i, 0.4), seed + 41 + k)); });
  q = new T.CylinderGeometry(0.045, 0.045, 1.1, 6); q.rotateZ(Math.PI / 2); q.translate(x, 1.3, z); L.push(fac(q, '#6e4c30', seed + 44));
  kitRoof(L, 1.3, 0.95, 1.52, 0.42, seed + 50, { x, z });
  q = new T.CylinderGeometry(0.008, 0.008, 0.55, 3); q.translate(x + 0.1, 1.02, z); L.push(fac(q, '#e8dcc0', seed + 60));
  q = new T.CylinderGeometry(0.11, 0.085, 0.17, 8); q.translate(x + 0.1, 0.68, z); L.push(fac(q, (cx, cy, cz, i) => tone('#a8774f', i, 0.5), seed + 61));
}
function signpost(x, z, L, seed, turn) { turn = turn || 0;
  let q = new T.CylinderGeometry(0.05, 0.07, 1.9, 7, 3); jit(q, 0.008, seed); q.translate(x, 0.95, z); L.push(fac(q, (cx, cy, cz, i) => shadeY(PAL.trunk, cy, 0, 1.9, i, 0.4), seed));
  [['#e9684a', 1.62, 0.2, 1], ['#f2c23c', 1.36, 1.75, -1], ['#49b6b0', 1.1, -1.2, 1]].forEach(([col, y, r, s2], k) => { const sh = new T.Shape(); sh.moveTo(0, -0.1); sh.lineTo(0.62, -0.1); sh.lineTo(0.8, 0); sh.lineTo(0.62, 0.1); sh.lineTo(0, 0.1); sh.closePath();
    q = new T.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: false }); q.translate(-0.12, 0, -0.02); if (s2 < 0) q.rotateY(Math.PI); q.rotateY(r + turn); q.translate(x, y, z); L.push(fac(q, (cx, cy, cz, i) => tone(col, i, 0.35), seed + 5 + k)); });
  for (let k = 0; k < 4; k++) { const b = ico(0.07 + hash(seed, k) * 0.04, 1, seed + 20 + k); b.scale(1.2, 0.7, 1); b.translate(x + Math.cos(k * 1.7) * 0.14, 0.04, z + Math.sin(k * 1.7) * 0.14); L.push(fac(b, '#b3b9bf', seed + 20 + k)); }
}
/* a low rough fence: posts and two rails */
function fenceRun(x0, z0, x1, z1, L, seed) {
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, z1 - z0) / 0.9)), ry = -Math.atan2(z1 - z0, x1 - x0), len = Math.hypot(x1 - x0, z1 - z0) / n;
  for (let k = 0; k <= n; k++) { const t = k / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, h = 0.62 + hash(seed, k) * 0.1; let q = new T.CylinderGeometry(0.045, 0.055, h, 6); q.translate(x, h / 2, z); L.push(fac(q, (cx, cy, cz, i) => shadeY('#8a6a4a', cy, 0, 0.7, i, 0.4), seed + k));
    if (k < n) [0.26, 0.48].forEach((y, j) => { q = new T.BoxGeometry(len + 0.08, 0.06, 0.035); q.rotateZ((hash(seed + j, k) - 0.5) * 0.08); q.rotateY(ry); q.translate(x + (x1 - x0) / n / 2, y, z + (z1 - z0) / n / 2); L.push(fac(q, tone('#a8805a', k + j, 0.6), seed + 30 + k * 2 + j)); }); }
}
function villageSync(anim) {
  const key = Object.keys(VILLAGE).filter((k) => VILLAGE[k].ok()).join(',') + '|' + VILLAGERS.map((v) => (state.isle.folk || {})[v.id] || 0).join('');
  if (key === VG.key) return; VG.key = key; boardDraw();
  let n = 0;
  Object.keys(VILLAGE).forEach((k) => {
    const P = VILLAGE[k]; if (VG.parts[k] || !P.ok()) return;
    const g = new T.Group(); sc.add(g); const L = []; P.make(g, L); if (L.length) { merged(L.map((q) => (q.index ? q.toNonIndexed() : q)), MAT, g); }
    VG.parts[k] = g;
    if (anim) { g.visible = false; VG.pops.push({ g, t: -0.9 * n++, at: P.at }); }
  });
}
function villageStep(dt) {
  VG.t = (VG.t || 0) - dt; if (VG.t <= 0) { VG.t = 0.5; villageSync(true); }
  for (let k = VG.pops.length - 1; k >= 0; k--) { const p = VG.pops[k]; p.t += dt; if (p.t < 0) continue;
    if (!p.g.visible) { p.g.visible = true; burst(p.at[0], 1.2, p.at[1], 10); Snd.play('sparkle', { gain: 0.45 }); Snd.play('success', { gain: 0.35, f: 'E6' }, 0.15); }
    const u = Math.min(1, p.t / 0.6); p.g.scale.set(1, u < 1 ? Math.max(0.01, u * 1.15 - Math.max(0, u - 0.8) * 0.75) : 1, 1); if (u >= 1) VG.pops.splice(k, 1); }
  const nt = typeof nightAmt === 'number' ? nightAmt : isNight ? 1 : 0;
  VG.lamps.forEach((l, k) => { l.glow.material.opacity = nt * (reduced ? 0.8 : 0.72 + Math.sin(time * 3 + k) * 0.08); l.lamp.material.color.setRGB(1, 0.85 + 0.1 * nt, 0.55 + 0.1 * (1 - nt)); });
  if (VG.parts.green) { const dx = pip.position.x - WELL.x, dz = pip.position.z - WELL.z, d = Math.hypot(dx, dz); if (d < 0.82 && d > 1e-4) { pip.position.x = WELL.x + dx / d * 0.82; pip.position.z = WELL.z + dz / d * 0.82; } }
  /* Pip walks round the board's posts */
  const dx = pip.position.x - BOARD.x, dz = pip.position.z - BOARD.z; if (Math.abs(dx) < 1.15 && Math.abs(dz) < 0.3) pip.position.z = BOARD.z + Math.sign(dz || 1) * 0.3;
}
