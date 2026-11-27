/* ---------- the coral beach and its tide (Leon, 2026-11-25: each island should differ in how Pip gets about) ----------
   A sandy island east of the village green. Its way of moving is the tide: the second square is an islet across a strait,
   and the way there is a row of stepping stones. The tide goes out and comes in again all day: while it is out the stones
   are bare and Pip walks over; when it comes in they go under and the islet is cut off until the next ebb. A dial on a
   post by the stones shows where the tide is (yellow: walk, blue: water). Nobody is ever stuck: if the water comes while
   Pip is on the stones, a wave carries him to the nearer shore.
   Big clams lie on both squares: pearls, the beach's own find (finds.js).
   TIDE (rules.js) is read by the walking rules. */
const CR = { dial: null, hand: null, hop: null, warn: 0, was: true };
const TIDE_T = { all: 64, low: 38, turn: 4 }; /* seconds: bare for 38, going under 4, under for 18, coming up 4 */
const tideA = () => AREA_BY.c1;
const CORAL_STONE = [];
function coralStones(g, L) {
  if (!CORAL_STONE.length) for (let k = 0; k < 3; k++) { const q = new T.CylinderGeometry(0.47, 0.54, 0.62, 9); jit(q, 0.03, 6100 + k); q.translate(0, -0.27, 0);
    CORAL_STONE.push(fac(q, (cx, cy, cz, f) => (cy > 0.02 ? tone(f % 4 === 0 ? '#f0b9a8' : '#e9dcc0', f + k, 0.4) : shadeY('#b9a98c', cy, -0.6, 0, f, 0.4)), 6100 + k)); }
  const planks = [], n = Math.ceil(L / 0.6);
  for (let k = 0; k < n; k++) { const m = new T.Mesh(CORAL_STONE[k % 3], MAT); m.position.set((k % 2 ? 0.3 : -0.3) + (hash(k, 6103) - 0.5) * 0.1, 0, 0.3 + k * 0.6); m.rotation.y = hash(k, 6104) * 6.28; m.receiveShadow = true; m.castShadow = true; g.add(m); planks.push(m); }
  const rails = new T.Group(); g.add(rails); return { g, planks, rails };
}
function coralFill(A, fresh) {
  if (A.id !== 'c0' || CR.dial) return;
  /* the tide dial: a post by the stones, with a round face (yellow half: walk, blue half: water) and a hand */
  const B = tideA().bridge, x = B.x0 - 1.45, z = B.z0 + 0.5, L = []; let q = new T.CylinderGeometry(0.055, 0.07, 1.5, 7); q.translate(x, 0.75, z); L.push(fac(q, (cx, cy) => shadeY('#8a5f3c', cy, 0, 1.5, 2, 0.4), 6110));
  q = ico(0.2, 1, 6111); q.scale(1.2, 0.5, 1.1); q.translate(x, 0.04, z); L.push(fac(q, '#b9a98c', 6111)); merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT);
  const c = document.createElement('canvas'); c.width = c.height = 192; const X = c.getContext('2d'), lowA = TIDE_T.low / TIDE_T.all * Math.PI * 2; X.translate(96, 96); X.lineJoin = 'round'; X.lineCap = 'round';
  X.beginPath(); X.arc(0, 0, 84, 0, 7); X.fillStyle = '#4fa8d8'; X.fill(); X.beginPath(); X.moveTo(0, 0); X.arc(0, 0, 84, -Math.PI / 2, -Math.PI / 2 + lowA); X.closePath(); X.fillStyle = '#f7c948'; X.fill();
  X.strokeStyle = '#ffffff'; X.lineWidth = 6; [[-44, -12], [-50, 22]].forEach(([a, b]) => { X.beginPath(); X.moveTo(a, b); X.quadraticCurveTo(a + 9, b - 10, a + 18, b); X.quadraticCurveTo(a + 27, b + 10, a + 36, b); X.stroke(); });
  X.fillStyle = '#3a2a1e'; [[34, -10], [44, 16]].forEach(([a, b]) => { X.beginPath(); X.ellipse(a, b, 8, 12, 0.3, 0, 7); X.fill(); }); /* two footprints on the walking half */
  X.beginPath(); X.arc(0, 0, 84, 0, 7); X.lineWidth = 9; X.strokeStyle = '#6e4426'; X.stroke();
  CR.dial = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true })); CR.dial.scale.set(1.05, 1.05, 1); CR.dial.position.set(x, 1.95, z); sc.add(CR.dial);
  const h = document.createElement('canvas'); h.width = h.height = 192; const H = h.getContext('2d'); H.translate(96, 96); H.lineCap = 'round'; H.strokeStyle = '#3a2a1e'; H.lineWidth = 12; H.beginPath(); H.moveTo(0, 6); H.lineTo(0, -62); H.stroke(); H.strokeStyle = '#fff6e4'; H.lineWidth = 5; H.stroke(); H.fillStyle = '#3a2a1e'; H.beginPath(); H.arc(0, 0, 11, 0, 7); H.fill();
  CR.hand = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(h), transparent: true, depthTest: false })); CR.hand.scale.set(1.05, 1.05, 1); CR.hand.position.set(x, 1.95, z); CR.hand.renderOrder = 5; sc.add(CR.hand);
  lookFoot(x, z, 0.4, 0.4);
}
const coralKeep = (a, x, z) => a.id === 'c0' && Math.hypot(x - tideA().bridge.x0 + 1.45, z - tideA().bridge.z0 - 0.5) < 1.2;
/* what makes the beach look like itself: shells and starfish on the sand, coral in the shallows and along the shore */
function coralDecor(A, L, base) {
  const R = (k, n) => hash(k, n + base), ok = (x, z) => areaClear(x, z) && !nodes.some((q) => Math.abs(q.x - x) < 0.6 && Math.abs(q.z - z) < 0.6);
  const COL = ['#f29ab8', '#ff8a5c', '#b89cf0', '#f6d24a', '#ef6f6c'];
  for (let k = 0; k < 110; k++) { const x = A.cx + (R(k, 401) - 0.5) * 11.4, z = A.cz + (R(k, 402) - 0.5) * 11.4; if (drawSdf(x, z) > -0.25 || !ok(x, z)) continue;
    if (k % 3 === 0) { /* a starfish */ const col = COL[k % 5]; for (let j = 0; j < 5; j++) { const q = new T.ConeGeometry(0.045, 0.17, 4); q.rotateX(Math.PI / 2); q.translate(0, 0, 0.085); q.rotateY(j / 5 * 6.283 + R(k, 403)); q.scale(1, 0.45, 1); q.translate(x, 0.025, z); L.push(fac(q, (cx, cy, cz, i) => tone(col, i, 0.3), 6200 + k)); } }
    else { /* a shell */ const q = ico(0.06 + R(k, 404) * 0.04, 1, 6300 + k); q.scale(1.2, 0.45, 0.9); q.rotateY(R(k, 405) * 6); q.translate(x, 0.02, z); L.push(fac(q, (cx, cy, cz, i) => tone(k % 2 ? '#ffffff' : '#f9d3dd', i, 0.3), 6300 + k)); } }
  for (let k = 0; k < 170; k++) { const x = A.cx + (R(k, 411) - 0.5) * 13.6, z = A.cz + (R(k, 412) - 0.5) * 13.6, d = drawSdf(x, z); if (d < -0.75 || d > 0.95 || (d > -0.15 && d < 0.3)) continue; /* coral: on the shore's edge and out in the shallows */
    if (AREAS.some((a) => a.bridge && segD(x, z, a.bridge.x0, a.bridge.z0, a.bridge.x1, a.bridge.z1) < 1.5) || (d < 0 && !ok(x, z))) continue;
    const y0 = d > 0 ? -0.5 : 0, col = COL[Math.floor(R(k, 413) * 5)], s = 0.7 + R(k, 414) * 0.7;
    for (let j = 0; j < 4; j++) { const h = (0.24 + hash(k, j + 420) * 0.24) * s, q = new T.CylinderGeometry(0.045 * s, 0.065 * s, h, 5); q.translate(0, h / 2, 0); q.rotateZ((hash(k, j + 430) - 0.5) * 1.1); q.rotateX((hash(k, j + 440) - 0.5) * 1.1); q.translate(x, y0, z); L.push(fac(q, (cx, cy, cz, i) => tone(col, i, 0.25), 6400 + k));
      const t = ico(0.075 * s, 0, 6500 + k + j); t.translate(0, h, 0); t.rotateZ((hash(k, j + 430) - 0.5) * 1.1); t.rotateX((hash(k, j + 440) - 0.5) * 1.1); t.translate(x, y0, z); L.push(fac(t, () => tone(col, j, 0.3).lerp(new T.Color('#ffffff'), 0.25), 6500 + k)); } }
}
function tideStep(dt) {
  const A = tideA(), B = A.bridge, pp = pip.position, p = time % TIDE_T.all, T0 = TIDE_T;
  /* how far under the stones are: 0 bare, 1 under */
  const u = p < T0.low ? 0 : p < T0.low + T0.turn ? (p - T0.low) / T0.turn : p < T0.all - T0.turn ? 1 : (T0.all - p) / T0.turn;
  TIDE.u = u; TIDE.low = u < 0.3;
  if (A.bm) { A.bm.g.position.y = -0.7 * u * u * (3 - 2 * u); const soon = p > T0.low - 5 && p < T0.low; /* the stones tremble just before they go under */
    A.bm.planks.forEach((m, k) => { m.position.y = soon && !reduced ? Math.sin(time * 14 + k * 1.7) * 0.02 : 0; }); }
  if (CR.hand) { CR.hand.material.rotation = -p / T0.all * Math.PI * 2; if (CR.dial && !reduced) CR.dial.position.y = CR.hand.position.y = 1.95 + Math.sin(time * 2) * 0.04; }
  if (!HAS.c1 || inCave) { CR.was = TIDE.low; return; }
  if (CR.hop) { const H = CR.hop; H.t += dt; const q = Math.min(1, H.t / 0.7); pp.x = H.from[0] + (H.to[0] - H.from[0]) * q; pp.z = H.from[1] + (H.to[1] - H.from[1]) * q; pp.y = Math.sin(q * Math.PI) * 0.7; target.set(H.to[0], 0, H.to[1]); work = null;
    if (q >= 1) { pp.y = 0; CR.hop = null; Snd.play('pop', { gain: 0.4, f: 520 }); } }
  else if (CR.was && !TIDE.low) { /* the water is coming over the stones: a wave carries Pip to the nearer shore */
    const L = Math.hypot(B.x1 - B.x0, B.z1 - B.z0), ux = (B.x1 - B.x0) / L, uz = (B.z1 - B.z0) / L, s = (pp.x - B.x0) * ux + (pp.z - B.z0) * uz;
    if (segD(pp.x, pp.z, B.x0, B.z0, B.x1, B.z1) < 0.9 && s > 0.5 && s < L - 0.5) { const near = s < L / 2; CR.hop = { t: 0, from: [pp.x, pp.z], to: near ? [B.x0 - ux * 0.9, B.z0 - uz * 0.9] : [B.x1 + ux * 0.9, B.z1 + uz * 0.9] }; splash(pp.x, 0.1, pp.z, 8); Snd.play('whoosh', { gain: 0.4, f: 420 });
      if (typeof dog !== 'undefined' && dog && dog.g) dog.g.position.set(CR.hop.to[0] + 0.6, 0, CR.hop.to[1] + (near ? 0.5 : -0.5)); } }
  if (CR.was !== TIDE.low && Math.hypot(pp.x - B.x0, pp.z - B.z0) < 9) { splash(B.x0 + (B.x1 - B.x0) * 0.5, -0.3, B.z0 + (B.z1 - B.z0) * 0.5, 6); Snd.play(TIDE.low ? 'sparkle' : 'whoosh', { gain: 0.25, f: 300 }); }
  CR.was = TIDE.low;
}
