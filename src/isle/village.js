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
  { id: '?3' }, { id: '?4' }, { id: '?5' } /* still out on the islands */
];
const housed = (id) => !!(state.isle.folk && state.isle.folk[id] >= 3);
const villageLv = () => VILLAGERS.filter((v) => housed(v.id)).length;
const VG = { parts: {}, lamps: [], pops: [], key: '' };
const BOARD = { x: 2.95, z: -3.05 };

/* ---- the friends board ---- */
const boardCv = document.createElement('canvas'); boardCv.width = 512; boardCv.height = 224; const boardTex = new T.CanvasTexture(boardCv);
function boardDraw() {
  const x = boardCv.getContext('2d'); x.clearRect(0, 0, 512, 224);
  x.fillStyle = '#c99158'; x.beginPath(); x.roundRect(4, 4, 504, 216, 22); x.fill(); x.lineWidth = 8; x.strokeStyle = '#6e4426'; x.stroke();
  x.fillStyle = '#e7c48f'; x.beginPath(); x.roundRect(20, 20, 472, 184, 14); x.fill();
  VILLAGERS.forEach((v, k) => {
    const cx = 64 + k * 96, cy = 100, f = state.isle && state.isle.folk ? state.isle.folk[v.id] || 0 : 0;
    x.lineWidth = 5; x.strokeStyle = PAL.ink;
    if (!f) { /* not found yet: a grey face with a question mark */
      x.fillStyle = '#b9b0a0'; x.beginPath(); x.arc(cx, cy, 36, 0, 7); x.fill(); x.stroke();
      x.fillStyle = '#fff6e4'; x.font = '800 44px "Baloo 2", system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('?', cx, cy + 3);
    } else {
      if (v.ear === 'bear') [-1, 1].forEach((s) => { x.fillStyle = v.head; x.beginPath(); x.arc(cx + s * 26, cy - 28, 12, 0, 7); x.fill(); x.stroke(); });
      x.fillStyle = v.head; x.beginPath(); x.arc(cx, cy, 36, 0, 7); x.fill(); x.stroke();
      if (v.ear === 'duck') { x.fillStyle = '#f2a13c'; x.beginPath(); x.ellipse(cx, cy + 12, 16, 8, 0, 0, 7); x.fill(); x.stroke(); x.fillStyle = '#fbf8f0'; x.beginPath(); x.ellipse(cx, cy - 40, 24, 13, 0, 0, 7); x.fill(); x.stroke(); }
      else { x.fillStyle = '#f0d6b0'; x.beginPath(); x.ellipse(cx, cy + 12, 15, 11, 0, 0, 7); x.fill(); x.fillStyle = PAL.ink; x.beginPath(); x.arc(cx, cy + 8, 5, 0, 7); x.fill(); }
      x.fillStyle = PAL.ink; [-1, 1].forEach((s) => { x.beginPath(); x.arc(cx + s * 13, cy - 6, 5, 0, 7); x.fill(); });
      if (f >= 3) { x.fillStyle = '#fff6e4'; x.beginPath(); x.arc(cx + 26, cy + 34, 20, 0, 7); x.fill(); x.lineWidth = 4; x.stroke(); isleIcon(x, v.badge, cx + 26, cy + 34, 0.6); } /* moved in: what they make */
      else { x.fillStyle = '#f2c23c'; x.beginPath(); x.arc(cx + 26, cy + 34, 13, 0, 7); x.fill(); x.lineWidth = 4; x.stroke(); } /* found, not moved in yet */
    }
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
  base: { ok: () => villageLv() >= 1, make: (g, L) => {
    L.push(...pathGeo([[TENT_RING.x, TENT_RING.z], [0.5, 1.9], [1.4, 1.2]], 3200));
    L.push(...pathGeo([[1.4, 1.2], [1.6, 0.3], [STORE.x, STORE.z + 0.95]], 3250));
    L.push(...pathGeo([[STORE.x, STORE.z + 0.95], [0.6, -1.6], [0.3, -3.2], [0.1, -4.9]], 3300));
    lanternMake(0.75, -3.5, L).forEach((m) => g.add(m)); lanternMake(-0.75, 1.0, L).forEach((m) => g.add(m)); }, at: [0.4, -1.5] },
  smith: { ok: () => housed('smith'), make: (g, L) => {
    L.push(...pathGeo([[TENT_RING.x, TENT_RING.z], [-0.9, 0.3], [-1.6, -0.4], [ANVIL_RING.x, ANVIL_RING.z]], 3400));
    lanternMake(-3.0, -0.75, L).forEach((m) => g.add(m)); flowerBox(-3.6, -1.15, 0.2, L, 3450); }, at: [FORGE.x, FORGE.z] },
  baker: { ok: () => housed('baker'), make: (g, L) => {
    L.push(...pathGeo([[1.4, 1.2], [2.4, 1.0], [OVEN_RING.x, OVEN_RING.z]], 3500));
    lanternMake(4.15, 1.4, L).forEach((m) => g.add(m)); flowerBox(4.5, -0.85, -0.3, L, 3550); }, at: [OVEN.x, OVEN.z] },
  fest: { ok: () => villageLv() >= 2, make: (g, L) => {
    L.push(...buntingGeo([1.05, -3.5], [4.45, 1.4], 3600)); L.push(...buntingGeo([-0.45, 1.0], [-2.7, -0.75], 3650));
    flowerBox(-2.4, 2.0, 0.5, L, 3700); flowerBox(2.6, 2.55, -0.2, L, 3720); }, at: [1.0, 0.5] }
};
function villageSync(anim) {
  const key = Object.keys(VILLAGE).filter((k) => VILLAGE[k].ok()).join(',') + '|' + VILLAGERS.map((v) => (state.isle.folk || {})[v.id] || 0).join('');
  if (key === VG.key) return; VG.key = key; boardDraw();
  let n = 0;
  Object.keys(VILLAGE).forEach((k) => {
    const P = VILLAGE[k]; if (VG.parts[k] || !P.ok()) return;
    const g = new T.Group(); sc.add(g); const L = []; P.make(g, L); if (L.length) { const m = merged(L.map((q) => (q.index ? q.toNonIndexed() : q)), MAT, g); m.castShadow = false; }
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
  /* Pip walks round the board's posts */
  const dx = pip.position.x - BOARD.x, dz = pip.position.z - BOARD.z; if (Math.abs(dx) < 1.15 && Math.abs(dz) < 0.3) pip.position.z = BOARD.z + Math.sign(dz || 1) * 0.3;
}
