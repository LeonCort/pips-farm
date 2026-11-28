/* ---------- the mine (Leon, 2026-11-23: "stairs go down into a cave with rare crystals"; 2026-11-25: "a full mine that
   takes you to another island"; 2026-11-28: "expand the size of the mines to fit the new size of the game", a mini
   adventure with a place that opens only on a return visit) ----------
   The stairs stand in h3. Standing on the mat in front of them, the screen goes dark and Pip comes out in the mine. From
   outside the mine is a rocky hill range out at sea, south of h3; inside, the top is lifted off and it is dark: only what
   glows, the lanterns and Pip's own torch (or lantern) cut circles out of the dark (mineDarkStep).
   Six rooms, laid by hand as one place (the areas have secret: 1, so nothing random grows in them):
        deep gallery (cave3)  <- rail tunnel ->  ore gallery (cave2)  <- heap g1 ->  entry hall (cave)   <- stairs from h3
              | heap g2 (copper pickaxe)               |
        glow cavern (cave6)   <------------->    lake room (cave5)    <---------->   crystal grotto (cave4), a dead end
                                                       | (stairs under the lake)
                                                 Crystal Cathedral (cave7, cathedral.js)
   The long way goes hall, ore gallery, lake room, glow cavern, deep gallery, where the lift runs up to the stone island.
   Once Pip has walked it, the mine cart runs between the hall and the deep gallery through its own tunnel, both ways.
   The lake: dark water with something huge glittering under it. When the sluice wheel stands on the marsh island
   (mons().sluice), the lake drains the next time Pip comes by, and stairs lead down to the Crystal Cathedral.
   state.isle.mine: g1 / g2: 1 once that heap is broken through; cart: 1 once Pip has reached the deep gallery;
   lake: 1 once the lake has drained. */
const crystalMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.25, metalness: 0.1, emissive: new T.Color('#5a3fa0'), emissiveIntensity: 0.55 });
const CRYSTAL_GEO = (() => {
  const L = [];
  [[0, 0, 0.62, 0, 0], [0.2, 0.1, 0.42, 0.4, 0.25], [-0.2, 0.06, 0.48, -0.35, -0.2], [0.05, -0.22, 0.36, 0.15, -0.45], [-0.12, 0.22, 0.3, -0.2, 0.5]].forEach(([x, z, h, rz, rx], k) => {
    const q = new T.OctahedronGeometry(0.13, 0); q.scale(1, h / 0.13 * 0.5, 1); q.translate(0, h * 0.45, 0); q.rotateZ(rz); q.rotateX(rx); q.translate(x, 0, z);
    L.push(fac(q, (cx, cy, cz, i) => new T.Color(i % 3 === 0 ? '#e7dbff' : k % 2 ? '#9f7ff0' : '#7fd3ef'), 1600 + k)); });
  const b = ico(0.22, 0, 1610); b.scale(1.3, 0.5, 1.2); b.translate(0, 0.05, 0); L.push(fac(b, '#6a625a', 1610));
  return merged(L.map((q) => (q.index ? q.toNonIndexed() : q)), MAT, new T.Group()).geometry;
})();
const RUBBLE_GEO = (() => {
  const L = []; let q;
  for (let k = 0; k < 22; k++) { const row = k < 10 ? 0 : k < 17 ? 1 : k < 21 ? 2 : 3, cnt = [10, 7, 4, 1][row], j = k - [0, 10, 17, 21][row], r = 0.3 - row * 0.02 + hash(k, 2650) * 0.1;
    q = ico(r, 0, 2650 + k, 0.12); q.scale(1.1, 0.8, 1); q.translate((hash(k, 2651) - 0.5) * (0.7 - row * 0.15), 0.2 + row * 0.38, ((j + 0.5) / cnt - 0.5) * (3.1 - row * 0.75) + (hash(k, 2652) - 0.5) * 0.15);
    L.push(fac(q, (cx, cy, cz, i) => tone(['#cdbfa8', '#b8a78e', '#d9cdb8', '#a89880'][k % 4], i, 0.35), 2650 + k)); }
  [[-0.5, 0.55], [0.5, -0.5]].forEach(([rx, side], k) => { [-1, 1].forEach((f) => { q = new T.BoxGeometry(0.09, 0.2, 2.5); q.rotateX(rx * f * 0.8); q.translate(side * 0.62, 0.85, 0); L.push(fac(q, (cx, cy, cz, i) => tone(f > 0 ? '#c99f6c' : '#b08454', i, 0.3), 2680 + k * 2 + (f > 0 ? 1 : 0))); }); });
  return merged(L.map((g) => (g.index ? g.toNonIndexed() : g)), MAT, new T.Group()).geometry;
})();
let inCave = false, caveT = null, caveA = null;
const caveRoofs = [];
const MINE_GATES = [{ id: 'g1', x: 6, z: 32, tier: 1, ry: 0 }, { id: 'g2', x: -12, z: 38, tier: 2, ry: Math.PI / 2 }];
const LIFT = { low: { x: -15.2, z: 31.7 }, lowOut: { x: -13.8, z: 33.1 }, top: null, topOut: null, lowMat: null, topMat: null };
function mineS() { return state.isle.mine || (state.isle.mine = {}); }
/* the rooms: a rounded box round each area's middle (hx, hz: half its size, r: how round its corners are), and round
   nooks added to it (more). The doors: a passage from a to b; one with a gate opens when that heap is broken. */
const MINE_ROOM = { cave: { hx: 4.9, hz: 4.9, r: 1.8 }, cave2: { hx: 4.9, hz: 3.7, r: 1.2 }, cave3: { hx: 4.9, hz: 4.9, r: 1.6 }, cave4: { hx: 4.6, hz: 4.6, r: 4.0 },
  cave5: { hx: 4.9, hz: 4.9, r: 3.0 }, cave6: { hx: 4.9, hz: 4.7, r: 2.4, more: [[-16.2, 48.0, 1.5]] }, cave7: { hx: 5.0, hz: 5.0, r: 3.6 } };
const MINE_DOOR = [{ a: [7.3, 32], b: [4.7, 32], gate: 'g1' }, { a: [0, 35.5], b: [0, 39.4] }, { a: [-4.6, 44], b: [-7.4, 44] }, { a: [4.6, 44], b: [7.8, 44] }, { a: [-12, 39.6], b: [-12, 36.7], gate: 'g2' }];
/* each room's own stone: [wall, floor] */
const MINE_LOOK = { cave: ['#8a7d6f', '#6f6357'], cave2: ['#94735a', '#75604f'], cave3: ['#767b8a', '#5b606d'], cave4: ['#81769c', '#5f5876'], cave5: ['#62788e', '#4d5e70'], cave6: ['#5b7b70', '#445b52'], cave7: ['#6d6aa0', '#565683'] };
const mineLook = (x, z) => { const A = areaAt(x, z); return (A && MINE_LOOK[A.id]) || MINE_LOOK.cave; };
/* the rail: from the hall's station through the ore gallery to the deep gallery, in a long S */
const MINE_RAIL = [[10.2, 34.9], [9.3, 34.9], [7.0, 34.9], [5.0, 34.7], [3.2, 34.1], [0.8, 32.6], [-1.6, 30.6], [-3.6, 29.6], [-5.0, 29.4], [-7.0, 29.4], [-8.6, 29.5], [-10.3, 29.5]];
const MINE_CART = { a: [9.3, 34.9], b: [-9.4, 29.5], ringA: [9.3, 33.55], ringB: [-9.4, 30.85] };
const MINE_LAKE = { x: 0, z: 44.4, r: 2.5, mat: [0, 45.75] };
const MINE_Y = 0.045; /* the mine's stone floor lies this far over the ground; mats, rings and Pip stand on it */
const CV = { g: null, lights: [], spots: [], solid: [], mats: [], da: 0, dim: 1, lamp: null, rail: null, drain: 0, clat: 0, heading: 0, lean: 0, hum: 0, twk: null, gain: [] };
const cvQ = (q) => (q.index ? q.toNonIndexed() : q);
/* how far a point is inside the mine's floor (below 0: on it). all: every door counts as open (for building the walls) */
function mineSdf(x, z, all) {
  let d = 9; const S = all ? null : mineS();
  for (const id in MINE_ROOM) { const R = MINE_ROOM[id], A = AREA_BY[id], qx = Math.abs(x - A.cx) - R.hx + R.r, qz = Math.abs(z - A.cz) - R.hz + R.r;
    d = Math.min(d, Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0) - R.r); if (R.more) for (const m of R.more) d = Math.min(d, Math.hypot(x - m[0], z - m[1]) - m[2]); }
  for (const D of MINE_DOOR) if (all || !D.gate || S[D.gate]) d = Math.min(d, segD(x, z, D.a[0], D.a[1], D.b[0], D.b[1]) - 0.95);
  return d;
}
const mineRailD = (x, z) => { let d = 9; for (let k = 0; k + 1 < MINE_RAIL.length; k++) d = Math.min(d, segD(x, z, MINE_RAIL[k][0], MINE_RAIL[k][1], MINE_RAIL[k + 1][0], MINE_RAIL[k + 1][1])); return d; };
/* nothing is set out by seed in the mine any more; isle.js still asks */
function mineKeep() { return false; }
function caveDecor() {}
/* can Pip get to this thing in the mine yet? (the playthrough test asks) */
function mineReach(n) {
  const A = areaAt(n.x, n.z), S = mineS(); if (!A || !A.cave || !HAS.h3 || !gearHas('torch')) return false;
  if (n.gate) return n.gate === 'g1' || !!S.g1; if (A.id === 'cave') return true; if (A.id === 'cave3') return !!S.g1 && !!S.g2; if (A.id === 'cave7') return !!S.lake; return !!S.g1;
}
function mineGateOpen(n) {
  mineS()[n.gate] = 1; if (n.tag) { n.g.remove(n.tag); n.tag = null; } n.dead = 1; n.st = 'gone'; if (work && work.n === n) work = null;
  burst(n.x, 1.2, n.z, 12); Snd.play('thud', { gain: 0.6 }); Snd.play('secret', { gain: 0.55 }, 0.25); xpGain(10); isleSigns(); save();
}
/* a mine lift: four posts, a cross beam with a wheel and a rope, and a plank floor */
function liftModel(x, z, seed) {
  const g = new T.Group(); g.position.set(x, 0, z); sc.add(g); const L = []; let q;
  [[-0.62, -0.5], [0.62, -0.5], [-0.62, 0.5], [0.62, 0.5]].forEach(([px, pz], k) => { q = new T.BoxGeometry(0.14, 2.3, 0.14); q.translate(px, 1.15, pz); L.push(fac(q, (cx, cy, cz, i) => shadeY('#8a5f3c', cy, 0, 2.3, i + k, 0.45), seed + k)); });
  [-0.5, 0.5].forEach((pz, k) => { q = new T.BoxGeometry(1.5, 0.14, 0.14); q.translate(0, 2.3, pz); L.push(fac(q, (cx, cy, cz, i) => tone('#7a5230', i, 0.3), seed + 6 + k)); });
  q = new T.BoxGeometry(0.14, 0.14, 1.14); q.translate(0, 2.38, 0); L.push(fac(q, () => new T.Color('#6e4426'), seed + 9));
  q = new T.CylinderGeometry(0.26, 0.26, 0.1, 14); q.rotateZ(Math.PI / 2); q.translate(0, 2.62, 0); L.push(fac(q, (cx, cy, cz, i) => tone('#4a4f57', i, 0.3), seed + 10));
  q = new T.CylinderGeometry(0.025, 0.025, 2.2, 5); q.translate(0, 1.4, 0.12); L.push(fac(q, () => new T.Color('#e0bf86'), seed + 11));
  for (let k = 0; k < 4; k++) { q = new T.BoxGeometry(0.27, 0.07, 1.0); q.translate(-0.42 + k * 0.28, 0.2, 0); L.push(fac(q, (cx, cy, cz, i) => tone(['#c0935f', '#b08454', '#c99f6c'][k % 3], i, 0.25), seed + 12 + k)); }
  [-0.5, 0.5].forEach((pz, k) => { q = new T.BoxGeometry(1.2, 0.06, 0.06); q.translate(0, 0.8, pz); L.push(fac(q, () => new T.Color('#8a5f3c'), seed + 18 + k)); });
  merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g);
  const hole = new T.Mesh(new T.PlaneGeometry(1.1, 0.9), new T.MeshBasicMaterial({ color: '#1d1824' })); hole.rotation.x = -Math.PI / 2; hole.position.y = 0.04; g.add(hole);
  return g;
}
/* the lift's head on the stone island: the same frame, and a mat that takes Pip back down */
function liftTopBuild(A, fresh) {
  if (LIFT.top) return; const x = A.cx + A.lift[0], z = A.cz + A.lift[1];
  LIFT.top = { x, z, g: liftModel(x, z - 0.35, 2700) }; LIFT.topOut = { x: x - 1.5, z: z + 0.9 };
  const M = LIFT.topMat = stairMat('down', x, z + 0.95); M.ok = () => !inCave && !!HAS[A.id] && gearDark(); M.to = () => LIFT.lowOut; M.cave = true;
  lookFoot(x, z - 0.35, 0.95, 0.8);
}
function liftOwn(A) {
  areaMark(A); state.isle.areas[A.id] = 1; xpGain(10); burst(LIFT.low.x, 1.6, LIFT.low.z, 14);
  Snd.play('success', { gain: 0.5 }); Snd.play('sparkle', { gain: 0.4 }); isleSigns(); save();
}
const CAVE_IN = { x: 0, z: 0 }, CAVE_OUT = { x: 0, z: 0 };
/* ---- small makers for the mine's rooms. L: pieces for the one stone-and-wood mesh, GL: pieces that glow by themselves
   (drawn unlit), C: pieces of crystal ---- */
function cvPaint(geo, f) {
  const g = cvQ(geo), p = g.attributes.position, n = p.count, col = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 3) { const c = f((p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3, i / 3);
    for (let k = 0; k < 3; k++) { col[(i + k) * 3] = c.r; col[(i + k) * 3 + 1] = c.g; col[(i + k) * 3 + 2] = c.b; } }
  g.setAttribute('color', new T.BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
}
function cvRock(L, x, z, r, h, col, sd) { const q = ico(r, 1, sd, r * 0.1); q.scale(1, h / r, 1); q.rotateY(hash(sd, 2) * 6); q.translate(x, h * 0.3, z); L.push(fac(q, (cx, cy, cz, i) => shadeY(col, cy, 0, h, i + sd, 0.5), sd)); }
function cvStalag(L, x, z, h, r, col, sd) { const q = new T.ConeGeometry(r, h, 6, 2); jit(q, r * 0.12, sd); q.translate(x, h / 2 - 0.03, z); L.push(fac(cvQ(q), (cx, cy, cz, i) => shadeY(col, cy, 0, h, i + sd, 0.5), sd)); }
/* a timber frame: two posts w apart with a beam over them and two braces; ry turns it */
function cvFrame(L, x, z, ry, w, h, sd) {
  const M = (q) => { q.rotateY(ry); q.translate(x, 0, z); return q; }; let q;
  [-1, 1].forEach((s, k) => { q = new T.BoxGeometry(0.17, h, 0.17); q.translate(s * w / 2, h / 2, 0); L.push(fac(M(q), (cx, cy, cz, i) => shadeY('#8a5f3c', cy, 0, h, i + k, 0.45), sd + k));
    q = new T.BoxGeometry(0.1, 0.6, 0.1); q.rotateZ(s * 0.78); q.translate(s * (w / 2 - 0.22), h - 0.2, 0); L.push(fac(M(q), (cx, cy, cz, i) => tone('#7a5230', i + k, 0.3), sd + 4 + k)); });
  q = new T.BoxGeometry(w + 0.5, 0.18, 0.22); q.translate(0, h + 0.09, 0); L.push(fac(M(q), (cx, cy, cz, i) => tone('#7a5230', i, 0.3), sd + 8));
}
/* a lantern: a dark cap and foot, and a glass that glows; it cuts its own circle out of the dark */
function cvLantern(L, GL, x, y, z, sd, r) {
  [[0.17, 0.22, 0.05], [-0.15, 0.2, 0.04]].forEach(([dy, w, h], k) => { const q = new T.BoxGeometry(w, h, w); q.translate(x, y + dy, z); L.push(fac(q, '#3c342c', sd + k)); });
  let q = new T.BoxGeometry(0.16, 0.27, 0.16); q.translate(x, y, z); GL.push(cvPaint(q, (cx, cy) => new T.Color(cy > y ? '#fff0b8' : '#ffc45a')));
  CV.lights.push({ x, y, z, r: r || 3.4, fl: sd }); CV.spots.push({ x, y: y + 0.3, z, c: '#ffb85a', i: 1.1 });
}
function cvLamp(L, GL, x, z, dx, dz, sd) {
  let q = new T.BoxGeometry(0.13, 1.75, 0.13); q.translate(x, 0.87, z); L.push(fac(q, (cx, cy, cz, i) => shadeY('#8a5f3c', cy, 0, 1.75, i, 0.45), sd));
  q = new T.BoxGeometry(Math.abs(dx) + 0.1, 0.08, Math.abs(dz) + 0.1); q.translate(x + dx / 2, 1.72, z + dz / 2); L.push(fac(q, '#7a5230', sd + 1));
  cvLantern(L, GL, x + dx, 1.45, z + dz, sd + 2); CV.solid.push([x, z, 0.22]);
}
/* one six-sided crystal: h tall, r thick, leaning by tilt toward the direction dir */
function cvCrystal(C, x, y, z, h, r, tilt, dir, cols, sd) {
  const q = new T.CylinderGeometry(r * 0.7, r, h * 0.72, 6), t = new T.ConeGeometry(r * 0.7, h * 0.28, 6); q.translate(0, h * 0.36, 0); t.translate(0, h * 0.86, 0);
  [q, t].forEach((p, k) => { p.rotateY(hash(sd, 5) * 1.05); p.rotateZ(-tilt); p.rotateY(-dir); p.translate(x, y, z); C.push(cvPaint(p, (cx, cy, cz, i) => tone(cols[(i + k + sd) % cols.length], i + sd, 0.6))); });
}
function cvCluster(C, x, z, h, cols, sd, n) {
  cvCrystal(C, x, -0.05, z, h, h * 0.17, 0.06, hash(sd, 1) * 6, cols, sd);
  for (let k = 0; k < (n || 4); k++) { const a = k * 6.283 / (n || 4) + hash(sd, k + 2) * 0.8, hh = h * (0.4 + hash(sd, k + 9) * 0.3); cvCrystal(C, x + Math.cos(a) * h * 0.13, -0.05, z + Math.sin(a) * h * 0.13, hh, hh * 0.19, 0.42 + hash(sd, k + 4) * 0.3, a, cols, sd + k + 1); }
}
/* a mushroom that glows: a pale stem, a cap that is light itself, lighter spots on it */
function cvShroom(L, GL, x, z, h, r, col, sd) {
  let q = new T.CylinderGeometry(r * 0.16, r * 0.26, h, 7); q.translate(x, h / 2, z); L.push(fac(cvQ(q), (cx, cy, cz, i) => shadeY('#d9e6dc', cy, 0, h, i, 0.2), sd));
  q = new T.SphereGeometry(r, 10, 5, 0, 6.283, 0, 1.5); q.scale(1, 0.62, 1); q.translate(x, h - r * 0.08, z); const c0 = new T.Color(col);
  GL.push(cvPaint(q, (cx, cy, cz, i) => { const k = clamp((cy - h) / (r * 0.6), 0, 1), c = c0.clone().multiplyScalar(0.62 + 0.38 * k); if (hash(i, sd) > 0.82) c.lerp(new T.Color('#f4fff8'), 0.6); return c; }));
  q = new T.CylinderGeometry(r * 0.95, r * 0.25, r * 0.16, 10); q.translate(x, h - r * 0.1, z); GL.push(cvPaint(q, () => c0.clone().multiplyScalar(0.45)));
  CV.lights.push({ x, y: h, z, r: 1.4 + r * 2.2 });
}
/* the rock a room is cut out of: boulders along every wall (L), dark flat-topped slabs behind them (F). South of a floor
   they stay low, so we look over them into the room. skip(x, z): leave this spot free */
function mineRocks(L, F, x0, x1, z0, z1, skip) {
  let k = Math.round(x0 * 7 + z0 * 13), q;
  for (let gx = x0; gx <= x1; gx += 0.95) for (let gz = z0; gz <= z1; gz += 0.95) { k++;
    const x = gx + (hash(k, 11) - 0.5) * 0.5, z = gz + (hash(k, 12) - 0.5) * 0.5, s = mineSdf(x, z, true); if (s < 0.42 || skip(x, z)) continue;
    let dn = 9; for (let t = 0.3; t < 4.6; t += 0.43) if (mineSdf(x, z - t, true) < 0) { dn = t; break; }
    const hmax = 0.42 + (dn - 0.3) * 0.95, col = mineLook(x, z)[0];
    if (s < 1.5) { const h = Math.min(hmax, 1.8 + hash(k, 5) * 1.5), r = 0.74 + hash(k, 6) * 0.3; q = ico(r, 1, 2200 + k); q.scale(1, Math.max(0.45, h / r * 0.62), 1); jit(q, 0.06, 2200 + k); q.translate(x, h * 0.42, z);
      L.push(fac(q, (cx, cy, cz, i) => shadeY(hash(i, k) > 0.85 ? '#5f574f' : col, cy, 0, Math.max(1, h), i, 0.5), 2200 + k)); }
    else { const h = Math.min(hmax, 2.4 + hash(k, 5) * 0.8), top = tone('#3a3431', k, 0.6).lerp(new T.Color(col), 0.14); q = ico(0.98, 0, 2200 + k, 0.12); q.scale(1, Math.max(0.4, h * 0.6), 1); q.rotateY(hash(k, 7) * 3); q.translate(x, h * 0.42, z);
      F.push(cvPaint(q, (cx, cy, cz, i) => top.clone().multiplyScalar(0.62 + 0.38 * clamp(cy / Math.max(0.6, h), 0, 1) + (hash(i, k) - 0.5) * 0.1))); } }
}
/* something the mine grows, set by hand; tier 3 things (the iron pickaxe) stand in the deep rooms and give far more */
function mineNode(kind, x, z, sd, tier) {
  const n = makeNode(kind, x, z, sd); n.mine = 1;
  if (tier && tier !== n.tier) { const s = tier > n.tier ? 1.18 : 0.87; n.tier = tier; n.hp = nodeHits(n); n.full *= s; n.main.scale.setScalar(n.full); }
  return n;
}
function mineChest(x, z, loot, idx) { const c = makeChest(x, z, loot, idx); c.ring.position.y = MINE_Y + 0.035; c.g.position.y = MINE_Y; return c; }
/* the cart: an iron-bound wooden tub on four wheels, a lantern on a pole at its front (+z) */
function mineCartMesh() {
  const g = new T.Group(), L = [], GL = []; let q;
  q = new T.BoxGeometry(0.8, 0.44, 1.08); { const P = q.attributes.position; for (let i = 0; i < P.count; i++) if (P.getY(i) < 0) P.setXYZ(i, P.getX(i) * 0.78, P.getY(i), P.getZ(i) * 0.84); } q.translate(0, 0.5, 0);
  L.push(fac(q, (cx, cy, cz, i) => (cy > 0.71 ? new T.Color('#2c2620') : shadeY(Math.abs(cz) > 0.5 ? '#8a5f3c' : '#a06f45', cy, 0.25, 0.75, i, 0.4)), 2900));
  [[0.86, 0.07, 1.14, 0.72], [0.7, 0.05, 0.98, 0.42]].forEach(([w, h, d, y], k) => { q = new T.BoxGeometry(w, h, d); q.translate(0, y, 0); L.push(fac(q, (cx, cy, cz, i) => tone('#4a4f57', i, 0.3), 2901 + k)); });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b], k) => { q = new T.CylinderGeometry(0.17, 0.17, 0.08, 10); q.rotateZ(Math.PI / 2); q.translate(a * 0.35, 0.19, b * 0.33); L.push(fac(cvQ(q), (cx, cy, cz, i) => tone(i % 3 ? '#4a4f57' : '#6c737d', i, 0.3), 2905 + k)); });
  q = new T.BoxGeometry(0.05, 0.62, 0.05); q.translate(0.33, 1.0, 0.5); L.push(fac(q, '#6e4426', 2910)); q = new T.BoxGeometry(0.26, 0.05, 0.05); q.translate(0.22, 1.3, 0.5); L.push(fac(q, '#6e4426', 2911));
  q = new T.BoxGeometry(0.15, 0.22, 0.15); q.translate(0.12, 1.16, 0.5); GL.push(cvPaint(q, () => new T.Color('#ffd27a')));
  merged(L.map(cvQ), MAT, g); const gm = merged(GL, CV.glowMat, g); gm.castShadow = false; return g;
}
ISLE_ICON.cart = (x) => { const b = (f) => { x.fillStyle = f; x.fill(); x.stroke(); };
  x.beginPath(); x.moveTo(-24, 17); x.lineTo(24, 17); x.lineWidth = 4; x.strokeStyle = '#8b939c'; x.stroke(); x.lineWidth = 3; x.strokeStyle = '#3a2414';
  x.beginPath(); x.moveTo(-20, -12); x.lineTo(20, -12); x.lineTo(15, 8); x.lineTo(-15, 8); x.closePath(); b('#a06f45'); x.beginPath(); x.roundRect(-22, -15, 44, 6, 2); b('#6c737d');
  [-10, 10].forEach((a) => { x.beginPath(); x.arc(a, 11, 6, 0, 7); b('#4a4f57'); }); };
/* the picture over the lake: the sluice wheel, and the water going down */
ISLE_ICON.drain = (x) => { isleIcon(x, 'sluice', -5, -5, 0.8); x.lineWidth = 3; x.strokeStyle = '#3a2414';
  x.beginPath(); x.moveTo(14, 2); x.quadraticCurveTo(22, 12, 14, 20); x.quadraticCurveTo(6, 12, 14, 2); x.closePath(); x.fillStyle = '#6fc3ee'; x.fill(); x.stroke();
  x.beginPath(); x.moveTo(-20, 16); x.lineTo(-20, 24); x.moveTo(-24, 20); x.lineTo(-20, 24); x.lineTo(-16, 20); x.lineWidth = 3.5; x.strokeStyle = '#3f8ac0'; x.stroke(); };

/* ---- the whole mine is built in one go, the first time one of its areas is filled ---- */
function mineBuild() {
  if (CV.g) return; const g = CV.g = new T.Group(); sc.add(g); caveA = AREA_BY.cave; const L = [], GL = [], C = [], S = mineS(); let q;
  CV.glowMat = new T.MeshBasicMaterial({ vertexColors: true });
  const WALL = (x, z) => mineLook(x, z)[0];
  /* the floor: one sheet of stone over all six rooms, each room in its own colour; darker under the walls, gravel under the rail, wet round the lake */
  { q = new T.PlaneGeometry(37.6, 26.4, 75, 53); q.rotateX(-Math.PI / 2); q.translate(0, 0, 38); const P = q.attributes.position; for (let i = 0; i < P.count; i++) P.setY(i, 0.05 + hash(Math.round(P.getX(i) * 4), Math.round(P.getZ(i) * 4), 77) * 0.016); /* the ground under it rolls up to 0.04 */
    const gr = new T.Color('#4f4a46'), wet = new T.Color('#2f4658'), bed = new T.Color('#27394a'), lk = MINE_LAKE;
    const m = new T.Mesh(cvPaint(q, (x, y, z, i) => { const c = tone(mineLook(x, z)[1], i, 0.6), s = mineSdf(x, z, true), dl = Math.hypot(x - lk.x, z - lk.z);
      if (s > -1.0) c.multiplyScalar(0.72 + 0.28 * clamp(-s, 0, 1)); if (mineRailD(x, z) < 0.6) c.lerp(gr, 0.6);
      if (dl < lk.r) c.lerp(bed, 0.85); else if (dl < lk.r + 1.4) c.lerp(wet, 0.55 * (lk.r + 1.4 - dl) / 1.4);
      if (hash(i, 31) > 0.92) c.multiplyScalar(1.13); else if (hash(i, 32) > 0.94) c.multiplyScalar(0.86); return c; }), MAT); m.receiveShadow = true; g.add(m); }
  /* the rock the rooms are cut out of */
  { const F = []; mineRocks(L, F, -18.5, 18.6, 25.3, 50.7, (x, z) => mineRailD(x, z) < 0.85 || (Math.abs(x - 12) < 1.3 && z > 36.3 && z < 38.35)); const m = merged(F, MAT, g); m.castShadow = false; }

  /* ---- the entry hall: the stairs up under a hole of daylight, the cart's first station, the great crystal ---- */
  { const A = AREA_BY.cave, sx = A.cx, sz = A.cz + 4.6;
    for (let s = 0; s < 6; s++) { q = new T.BoxGeometry(1.4, 0.18 + s * 0.18, 0.32); q.translate(sx, (0.18 + s * 0.18) / 2, sz + s * 0.3); L.push(fac(q, (cx, cy, cz, i) => tone('#a69c8a', i + s, 0.5), 2300 + s)); }
    const shaft = new T.Mesh(new T.CylinderGeometry(0.55, 0.95, 2.6, 14, 1, true), new T.MeshBasicMaterial({ color: '#fff3c4', transparent: true, opacity: 0.12, depthWrite: false, side: T.DoubleSide })); shaft.position.set(sx, 1.9, sz + 1.1); g.add(shaft);
    CAVE_IN.x = sx; CAVE_IN.z = sz - 2.1; CV.lights.push({ x: sx, y: 0.6, z: sz + 0.2, r: 3.6 });
    const M = A.mat = stairMat('up', sx, sz - 0.9, MINE_Y); M.ok = () => inCave; M.to = () => CAVE_OUT; M.cave = false; CV.mats.push(M);
    cvLamp(L, GL, 7.75, 30.55, 0.3, 0.2, 3000); cvLamp(L, GL, 10.6, 36.2, -0.3, -0.15, 3010); cvFrame(L, 7.2, 32, Math.PI / 2, 2.0, 2.05, 3020);
    cvStalag(L, 16.3, 27.9, 1.5, 0.42, WALL(16, 28), 3030); cvStalag(L, 15.6, 27.5, 0.9, 0.3, WALL(16, 28), 3031); cvStalag(L, 8.0, 36.0, 0.8, 0.3, WALL(8, 36), 3032);
    cvRock(L, 11.2, 34.9, 0.3, 0.34, '#8a8074', 3035); q = new T.BoxGeometry(0.16, 0.42, 0.9); q.translate(10.55, 0.21, 34.9); L.push(fac(q, '#6e4a2c', 3036)); /* the buffer at the rail's end */
    /* the great crystal: dull and asleep until the star heart is found, then it lights the whole hall */
    const gc = [15.2, 29.1]; cvRock(L, gc[0], gc[1], 0.95, 0.5, '#7a7066', 3040); const G2 = []; cvCluster(G2, gc[0], gc[1] - 0.05, 2.7, ['#fff6d8', '#ffe39a', '#d9c4ff', '#ffffff'], 3041, 5);
    CV.greatMat = crystalMat.clone(); const gm = merged(G2, CV.greatMat, g); gm.position.y = 0.3; gm.castShadow = true; CV.solid.push([gc[0], gc[1], 0.95]);
    CV.lights.push({ x: gc[0], y: 1.6, z: gc[1], r: 12.5, on: () => !!golds().starheart }, { x: gc[0] - 2, y: 0.6, z: gc[1] + 4, r: 9, on: () => !!golds().starheart }); CV.spots.push({ x: gc[0], y: 2.6, z: gc[1] + 0.6, c: '#ffe6a8', i: 1.5, on: () => !!golds().starheart });
    [['crystal', 15.7, 33.2, 2], ['crystal', 16.1, 31.3, 2], ['crystal', 11.4, 28.0, 2], ['rock', 13.3, 27.9], ['rock', 16.0, 35.7], ['boulder', 14.1, 36.0]].forEach(([k, x, z, t], n) => mineNode(k, x, z, 3100 + n, t)); }

  /* ---- the ore gallery: timbered, copper in the walls, the rail running through ---- */
  { const A = AREA_BY.cave2; findFill(A, false);
    [-4.2, -1.5, 1.5, 4.2].forEach((x, k) => { q = new T.BoxGeometry(0.17, 2.1, 0.17); q.translate(x, 1.05, 28.25); L.push(fac(q, (cx, cy, cz, i) => shadeY('#8a5f3c', cy, 0, 2.1, i + k, 0.45), 3200 + k)); });
    q = new T.BoxGeometry(9.2, 0.18, 0.2); q.translate(0, 2.15, 28.25); L.push(fac(q, (cx, cy, cz, i) => tone('#7a5230', i, 0.3), 3205));
    cvLantern(L, GL, -1.5, 1.6, 28.45, 3210); cvLantern(L, GL, 3.9, 1.6, 28.45, 3212, 2.6); cvFrame(L, 0, 35.9, 0, 2.0, 2.05, 3220); cvLamp(L, GL, 1.3, 35.3, 0.25, -0.2, 3230);
    /* crates, a barrel, a pick and a shovel left leaning */
    [[-4.4, 31.3, 0.5, 0], [-4.35, 31.25, 0.36, 0.5], [-3.7, 31.75, 0.4, 0]].forEach(([x, z, s, y], k) => { q = new T.BoxGeometry(s, s, s); q.rotateY(k * 0.5); q.translate(x, y + s / 2, z); L.push(fac(q, (cx, cy, cz, i) => tone(i % 4 < 2 ? '#b08454' : '#c99f6c', i + k, 0.4), 3240 + k)); });
    q = new T.CylinderGeometry(0.24, 0.24, 0.55, 10); q.translate(4.4, 0.28, 33.3); L.push(fac(cvQ(q), (cx, cy, cz, i) => (Math.abs(cy - 0.28) > 0.15 && Math.abs(cy - 0.28) < 0.24 ? new T.Color('#4a4f57') : tone('#a06f45', i, 0.4)), 3250)); CV.solid.push([-4.3, 31.4, 0.6], [4.4, 33.3, 0.3]);
    [['crystal', 4.2, 29.0, 2], ['rock', 2.0, 35.0], ['rock', -1.2, 33.9]].forEach(([k, x, z, t], n) => mineNode(k, x, z, 3260 + n, t)); }

  /* ---- the rail, the two tunnels through the rock, the two parked carts ---- */
  { const cur = new T.CatmullRomCurve3(MINE_RAIL.map((p) => new T.Vector3(p[0], 0, p[1])), false, 'catmullrom', 0.5), P = cur.getSpacedPoints(96), R = [];
    CV.rail = P.map((p) => [p.x, MINE_Y + 0.02, p.z]);
    for (let k = 0; k + 1 < P.length; k++) { const a = P[k], b = P[k + 1], dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz), ang = Math.atan2(dz, dx), nx = -dz / len, nz = dx / len;
      [-0.27, 0.27].forEach((o) => { q = new T.BoxGeometry(len + 0.03, 0.07, 0.06); q.rotateY(-ang); q.translate((a.x + b.x) / 2 + nx * o, 0.125, (a.z + b.z) / 2 + nz * o); R.push(cvPaint(q, (cx, cy) => new T.Color(cy > 0.14 ? '#aab2bb' : '#6c737d'))); });
      if (k % 2 === 0) { q = new T.BoxGeometry(0.13, 0.05, 0.86); q.rotateY(-ang); q.translate(a.x, 0.085, a.z); R.push(cvPaint(q, (cx, cy, cz, i) => tone('#6e4a2c', k + i, 0.6))); } }
    const rm = merged(R, MAT, g); rm.castShadow = false;
    CV.planks = new T.Group(); g.add(CV.planks); const PL = [];
    [[6.0, 34.85, 7.3], [-6.0, 29.4, -7.3]].forEach(([x, z, mx], k) => { q = new T.BoxGeometry(2.7, 0.5, 2.3); jit(q, 0.06, 3300 + k); q.translate(x, 1.85, z); L.push(fac(q, (cx, cy, cz, i) => tone('#3d3733', i, 0.6), 3300 + k));
      cvFrame(L, x + 1.25, z, Math.PI / 2, 1.5, 1.5, 3310 + k * 20); cvFrame(L, x - 1.25, z, Math.PI / 2, 1.5, 1.5, 3320 + k * 20);
      [-0.6, 0.6].forEach((rz, j) => { q = new T.BoxGeometry(0.07, 0.2, 1.9); q.rotateX(rz); q.translate(mx, 0.8, z); PL.push(fac(q, (cx, cy, cz, i) => tone(j ? '#c99f6c' : '#b08454', i, 0.3), 3350 + k * 2 + j)); }); });
    merged(PL.map(cvQ), MAT, CV.planks);
    CV.cartA = mineCartMesh(); CV.cartA.position.set(MINE_CART.a[0], MINE_Y + 0.02, MINE_CART.a[1]); CV.cartA.rotation.y = -Math.PI / 2; g.add(CV.cartA);
    CV.cartB = mineCartMesh(); CV.cartB.position.set(MINE_CART.b[0], MINE_Y + 0.02, MINE_CART.b[1]); CV.cartB.rotation.y = Math.PI / 2; g.add(CV.cartB);
    CV.lights.push({ x: MINE_CART.a[0], y: 1.1, z: MINE_CART.a[1], r: 2.4, fl: 5 }, { x: MINE_CART.b[0], y: 1.1, z: MINE_CART.b[1], r: 2.4, fl: 6 });
    const A = MINE_CART; ringMake({ x: A.ringA[0], z: A.ringA[1], y: MINE_Y, icon: 'cart', cave: 1, ok: () => !!mineS().cart, go: () => mineRide(false) }); ringMake({ x: A.ringB[0], z: A.ringB[1], y: MINE_Y, icon: 'cart', cave: 1, ok: () => !!mineS().cart, go: () => mineRide(true) }); }

  /* ---- the lake room: dark water, something huge glittering under it; a little jetty; the picture of what would drain it ---- */
  { const K = MINE_LAKE, wl = WALL(0, 44);
    for (let k = 0; k < 26; k++) { const a = k / 26 * 6.283 + hash(k, 3400) * 0.12, r = K.r + 0.12 + hash(k, 3401) * 0.22; if (Math.abs(a - 4.71) < 0.22) continue; cvRock(L, K.x + Math.cos(a) * r, K.z + Math.sin(a) * r, 0.22 + hash(k, 3402) * 0.16, 0.2 + hash(k, 3403) * 0.16, k % 3 ? '#57697a' : '#6f8294', 3404 + k); }
    [[-4.2, 40.2, 1.5, 0.42], [-3.6, 39.9, 0.8, 0.28], [4.3, 47.9, 0.7, 0.3], [-4.4, 48.0, 0.6, 0.26], [4.0, 40.0, 1.2, 0.36]].forEach(([x, z, h, r], k) => cvStalag(L, x, z, h, r, wl, 3440 + k));
    for (let k = 0; k < 4; k++) { q = new T.BoxGeometry(0.9, 0.07, 0.24); q.rotateY((hash(k, 3450) - 0.5) * 0.12); q.translate(0, 0.2, 41.75 + k * 0.27); L.push(fac(q, (cx, cy, cz, i) => tone(['#c0935f', '#b08454', '#c99f6c'][k % 3], i, 0.25), 3450 + k)); }
    [[-0.38, 42.55], [0.38, 42.55]].forEach(([x, z], k) => { q = new T.BoxGeometry(0.1, 0.5, 0.1); q.translate(x, 0.15, z); L.push(fac(q, '#7a5230', 3456 + k)); }); cvLamp(L, GL, 0.75, 41.55, -0.05, 0.3, 3460);
    cvFrame(L, -4.75, 44, Math.PI / 2, 2.0, 2.05, 3470); cvFrame(L, 4.75, 44, Math.PI / 2, 2.0, 2.05, 3480);
    /* what lies under the water: the tips of giant crystals, flat and bright while the lake is full; they stand up as it drains */
    CV.spireMat = crystalMat.clone(); CV.spireMat.emissive = new T.Color('#3fa0d8'); CV.spireMat.emissiveIntensity = 0.75; const SP = [];
    [[-1.75, -1.15, 1.9, 0], [-0.65, -1.9, 2.6, 1], [0.85, -1.8, 2.1, 2], [1.9, -0.85, 1.5, 3], [-2.1, 0.15, 1.2, 1], [2.1, 0.5, 1.0, 0], [-1.3, 1.6, 0.7, 2], [1.4, 1.5, 0.6, 3]].forEach(([dx, dz, h, c], k) => {
      cvCluster(SP, dx, dz, h, [['#ffd9ec', '#f29ac0', '#ffffff'], ['#d8f6ff', '#7fd3ef', '#ffffff'], ['#fff0c0', '#f7c948', '#ffffff'], ['#e7dbff', '#9f7ff0', '#ffffff']][c], 3500 + k * 10, 3); CV.solid.push([K.x + dx, K.z + dz, 0.2 + h * 0.2, () => !!mineS().lake]); });
    CV.spires = merged(SP, CV.spireMat, g); CV.spires.position.set(K.x, 0.06, K.z); CV.spires.castShadow = false;
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(190,240,255,0.95)'); gr.addColorStop(0.4, 'rgba(110,200,255,0.4)'); gr.addColorStop(1, 'rgba(80,160,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
    for (let k = 0; k < 10; k++) { x.save(); x.translate(64, 64); x.rotate(k * 0.628 + 0.2); x.fillStyle = 'rgba(230,250,255,' + (k % 2 ? 0.5 : 0.28) + ')'; x.beginPath(); x.moveTo(0, -5); x.lineTo(k % 2 ? 58 : 44, 0); x.lineTo(0, 5); x.closePath(); x.fill(); x.restore(); }
    q = new T.CircleGeometry(K.r * 0.95, 32); q.rotateX(-Math.PI / 2); CV.glint = new T.Mesh(q, new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true, depthWrite: false, blending: T.AdditiveBlending })); CV.glint.position.set(K.x, 0.13, K.z); g.add(CV.glint);
    q = new T.CircleGeometry(1, 40); q.rotateX(-Math.PI / 2); { const P = q.attributes.position; for (let i = 1; i < P.count; i++) { const a = Math.atan2(P.getZ(i), P.getX(i)), r = K.r + 0.1 + Math.sin(a * 3 + 1) * 0.07 + Math.sin(a * 7) * 0.04; P.setXYZ(i, Math.cos(a) * r, 0, Math.sin(a) * r); } }
    CV.water = new T.Mesh(q, new T.MeshStandardMaterial({ color: '#0e2a3d', roughness: 0.12, metalness: 0.35, transparent: true, opacity: 0.78, depthWrite: false })); CV.water.position.set(K.x, 0.18, K.z); CV.water.renderOrder = 2; g.add(CV.water);
    CV.hint = isleSprite(isleBubble('drain'), 1.2); CV.hint.position.set(K.x, 2.0, K.z - 0.4); g.add(CV.hint);
    /* the way down, bare once the water is gone: a round shaft with a stair winding into it, light coming up */
    const pit = CV.pit = new T.Group(); pit.position.set(K.x, 0.09, K.z); g.add(pit);
    q = new T.CircleGeometry(0.98, 28); q.rotateX(-Math.PI / 2); pit.add(new T.Mesh(q, new T.MeshBasicMaterial({ color: '#0c1420' })));
    for (let s = 0; s < 8; s++) { q = new T.RingGeometry(0.3, 0.96, 4, 1, 1.2 - s * 0.72, 0.66); q.rotateX(-Math.PI / 2); const m = new T.Mesh(q, new T.MeshBasicMaterial({ color: new T.Color('#9fb6c8').multiplyScalar(1 - s * 0.115) })); m.position.y = 0.006; pit.add(m); }
    const PR = []; for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; cvRock(PR, Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0.2 + hash(k, 3600) * 0.08, 0.2, '#6f8294', 3601 + k); } merged(PR.map(cvQ), MAT, pit);
    const sh = new T.Mesh(new T.CylinderGeometry(1.25, 0.8, 3.2, 16, 1, true), new T.MeshBasicMaterial({ color: '#9fe4ff', transparent: true, opacity: 0.13, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending })); sh.position.y = 1.6; pit.add(sh); CV.pitSh = sh;
    const M = CV.lakeMat = stairMat('down', K.mat[0], K.mat[1], MINE_Y); M.ok = () => inCave && !!mineS().lake && !CV.drain && !!CATH.in; M.to = () => CATH.in; M.cave = true; CV.mats.push(M);
    CV.solid.push([K.x, K.z, K.r + 0.3, () => !mineS().lake], [K.x, K.z, 1.2, () => !!mineS().lake]);
    CV.lights.push({ x: K.x, y: 0.2, z: K.z, r: 3.4 }, { x: K.x, y: 0.4, z: K.z, r: 5.2, on: () => !!mineS().lake }); CV.spots.push({ x: K.x, y: 1.5, z: K.z, c: '#6fd0ff', i: 1.3 });
    [['crystal', 3.7, 47.3, 2], ['crystal', -3.8, 47.2, 2], ['crystal', 3.3, 40.6, 2], ['rock', -2.6, 40.3]].forEach(([k, x, z, t], n) => mineNode(k, x, z, 3620 + n, t)); mineLake(); }

  /* ---- the crystal grotto, a dead end: crystal on every wall, and a chest ---- */
  { const V = ['#e7dbff', '#9f7ff0', '#7fd3ef', '#c9b4ff'];
    [[12.0, 39.75, 2.3], [15.75, 41.3, 1.9], [16.5, 44.9, 2.5], [8.7, 40.9, 1.6], [9.0, 47.6, 1.0], [15.2, 47.8, 1.1], [13.6, 39.9, 1.2]].forEach(([x, z, h], k) => { cvCluster(C, x, z, h, V, 3700 + k * 10); CV.solid.push([x, z, 0.3 + h * 0.14]); CV.lights.push({ x, y: h * 0.6, z, r: 1.6 + h * 0.9 }); });
    CV.spots.push({ x: 12.4, y: 2.2, z: 43.6, c: '#b48cff', i: 1.4 });
    [[9.7, 41.9], [11.5, 41.0], [14.1, 41.5], [15.4, 46.4], [13.5, 47.4], [11.3, 47.6], [9.3, 45.9], [12.2, 44.4]].forEach(([x, z], n) => mineNode('crystal', x, z, 3780 + n, 2));
    if (!state.isle.chests.mine1) mineChest(15.1, 43.3, { coin: 30, crystal: 8 }, 'mine1'); }

  /* ---- the glow cavern: mushrooms that are their own light, glow-worms drifting, star crystals; a chest in the nook behind the biggest mushroom ---- */
  { const wl = WALL(-12, 44);
    [[-15.7, 40.5, 2.0, 1.05, '#4fe0c4'], [-14.5, 41.2, 1.05, 0.6, '#8fd6ff'], [-8.3, 40.3, 1.6, 0.85, '#5fe6b0'], [-16.3, 45.9, 1.45, 0.8, '#c59cf2'], [-14.9, 47.2, 1.0, 0.72, '#4fe0c4'], [-8.6, 47.9, 0.95, 0.6, '#8fd6ff'], [-10.9, 40.0, 0.7, 0.42, '#c59cf2']].forEach(([x, z, h, r, col], k) => { cvShroom(L, GL, x, z, h, r, col, 3800 + k * 5); CV.solid.push([x, z, r * 0.32 + 0.12]); });
    for (let k = 0; k < 46; k++) { const x = -12 + (hash(k, 3850) - 0.5) * 10, z = 44 + (hash(k, 3851) - 0.5) * 9.4; if (mineSdf(x, z, true) > -0.15) continue; const h = 0.1 + hash(k, 3852) * 0.12;
      q = new T.CylinderGeometry(0.02, 0.028, h, 5); q.translate(x, h / 2, z); L.push(fac(cvQ(q), '#d9e6dc', 3853 + k)); q = new T.SphereGeometry(0.07, 7, 4, 0, 6.283, 0, 1.57); q.translate(x, h, z); const col = new T.Color(['#4fe0c4', '#8fd6ff', '#c59cf2'][k % 3]); GL.push(cvPaint(q, () => col)); }
    cvStalag(L, -7.7, 47.3, 1.0, 0.34, wl, 3900); cvStalag(L, -16.4, 42.6, 0.9, 0.3, wl, 3901); cvFrame(L, -12, 39.4, 0, 2.0, 2.05, 3910); cvFrame(L, -7.25, 44, Math.PI / 2, 2.0, 2.05, 3920);
    CV.spots.push({ x: -12.6, y: 2.0, z: 43.4, c: '#58e6c0', i: 1.3 });
    const W = new T.BufferGeometry(), P = new Float32Array(36 * 3); W.setAttribute('position', new T.BufferAttribute(P, 3)); CV.worms = new T.Points(W, new T.PointsMaterial({ color: '#b8ffe0', size: 0.11, transparent: true, opacity: 0.9, depthWrite: false, blending: T.AdditiveBlending })); CV.worms.frustumCulled = false; g.add(CV.worms);
    [['glow', -15.3, 43.9], ['glow', -10.4, 47.3], ['crystal', -13.4, 47.6, 3], ['crystal', -9.6, 41.4, 3], ['crystal', -12.9, 41.0, 3]].forEach(([k, x, z, t], n) => mineNode(k, x, z, 3930 + n, t));
    if (!state.isle.chests.mine2) mineChest(-16.25, 47.55, { coin: 40, copper: 4, crystal: 6 }, 'mine2'); }

  /* ---- the deep gallery: the lift up to the stone island, the cart's far station, star crystals ---- */
  { const A = AREA_BY.cave3; findFill(A, false);
    LIFT.g = liftModel(LIFT.low.x, LIFT.low.z, 2650); g.add(LIFT.g); const Q = LIFT.lowMat = stairMat('up', LIFT.low.x, LIFT.low.z + 1.3, MINE_Y); LIFT.g.position.y = MINE_Y; Q.ok = () => inCave && !!HAS.s0; Q.to = () => LIFT.topOut; Q.cave = false; CV.mats.push(Q); CV.solid.push([LIFT.low.x, LIFT.low.z, 0.95]);
    cvLantern(L, GL, LIFT.low.x - 0.62, 2.05, LIFT.low.z + 0.62, 4000); cvLamp(L, GL, -8.0, 31.0, -0.3, 0.1, 4010); cvLamp(L, GL, -16.2, 34.2, 0.3, -0.1, 4020); cvFrame(L, -12, 36.75, 0, 2.0, 2.05, 4030);
    q = new T.BoxGeometry(0.16, 0.42, 0.9); q.translate(-10.65, 0.21, 29.5); L.push(fac(q, '#6e4a2c', 4040)); cvStalag(L, -16.3, 27.8, 1.3, 0.4, WALL(-16, 28), 4041); cvStalag(L, -7.9, 36.1, 0.9, 0.3, WALL(-8, 36), 4042);
    [['crystal', -14.3, 35.9, 3], ['crystal', -8.0, 33.0, 3], ['crystal', -10.6, 35.0, 3], ['rock', -10.6, 32.4], ['rock', -8.6, 27.8]].forEach(([k, x, z, t], n) => mineNode(k, x, z, 4050 + n, t)); }

  /* the heaps that shut the two doorways, until Pip breaks through: loose stones behind a plank barrier, the pickaxe that opens it floating over it */
  MINE_GATES.forEach((G, k) => { if (S[G.id]) return; const n = makeNode('boulder', G.x, G.z, 2600 + k); n.gate = G.id; n.tier = G.tier; n.mine = 1; n.g.rotation.y = G.ry;
    n.main.geometry = RUBBLE_GEO; n.full = 1; n.main.scale.setScalar(1); n.hp = nodeHits(n) * (G.tier > 1 ? 1.5 : 1); n.hpMax = n.hp; /* the bar's full length (isle.js hpShow) */
    n.tag = isleSprite(isleBubble('pick' + (G.tier > 1 ? G.tier : '')), 0.95); n.tag.position.set(0, 2.55, 0); n.g.add(n.tag); CV.lights.push({ x: G.x, y: 1.6, z: G.z, r: 2.0, on: () => !mineS()[G.id] }); });
  nodes.forEach((n) => { const A = areaAt(n.x, n.z); if (A && A.cave) n.mine = 1; });

  const m = merged(L.map(cvQ), MAT, g); m.castShadow = true; m.receiveShadow = true; const gm = merged(GL, CV.glowMat, g); gm.castShadow = false; const cm = merged(C, crystalMat, g); cm.castShadow = false;
  CV.lamp = new T.PointLight('#ffb85a', 0, 9, 1.7); CV.lamp.position.set(0, -20, 0); sc.add(CV.lamp); CV.lv = new T.Vector3(); CV.lc = new T.Color();
  /* the sparkles over the mine's crystals, once the star heart is found */
  { const W = new T.BufferGeometry(); W.setAttribute('position', new T.BufferAttribute(new Float32Array(30 * 3), 3)); CV.twk = new T.Points(W, new T.PointsMaterial({ color: '#fff6c8', size: 0.14, transparent: true, opacity: 0.9, depthWrite: false, blending: T.AdditiveBlending })); CV.twk.frustumCulled = false; g.add(CV.twk); }
  /* the hill range, seen from outside: one rocky top over every room */
  { const H = []; ['cave', 'cave2', 'cave3', 'cave4', 'cave5', 'cave6', 'cave7'].forEach((id, n) => { const A = AREA_BY[id], top = new T.SphereGeometry(7.4, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2); top.scale(1 + hash(n, 61) * 0.08, 0.42 + (n === 4 ? 0.2 : hash(n, 62) * 0.12), 1.04); jit(top, 0.22, 2400 + n); top.translate(A.cx, 0, A.cz);
      H.push(fac(top, (cx, cy, cz, i) => (cy > 2.0 ? tone('#8fbf5a', i, 0.6) : shadeY('#9a8f80', cy, 0, 2.2, i, 0.5)), 2400 + n));
      for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28 + 0.4 + n, b = ico(1.0 + hash(k, 2 + n) * 0.6, 1, 2410 + k + n * 7); b.scale(1, 0.8, 1); jit(b, 0.08, 2410 + k); b.translate(A.cx + Math.cos(a) * 5.6, 0.5, A.cz + Math.sin(a) * 5.6); H.push(fac(b, (cx, cy, cz, i) => shadeY('#8a8074', cy, 0, 1.6, i, 0.5), 2410 + k)); } });
    caveRoofs.push(merged(H.map(cvQ), MAT)); }
  /* no grass under the hill: the floor is bare stone */
  ['cave', 'cave2', 'cave3', 'cave4', 'cave5', 'cave6', 'cave7'].forEach((id) => lookFoot(AREA_BY[id].cx, AREA_BY[id].cz, 8.4, 8.4, 0));
  mineLook2();
}
function caveBuild() { mineBuild(); }
['cave', 'cave2', 'cave3', 'cave4', 'cave5', 'cave6'].forEach((id) => { SECRET_FILL[id] = () => mineBuild(); });
/* the lake as it is: full (0) or drained (1), or somewhere between while it runs out */
function mineLake() {
  const e = mineS().lake ? 1 : CV.drain, s = e * e * (3 - 2 * e), K = MINE_LAKE; if (!CV.water) return;
  CV.water.visible = e < 1; CV.water.position.y = 0.18 - s * 0.1; CV.water.scale.setScalar(Math.max(0.05, 1 - s * 0.82)); CV.water.material.opacity = 0.78 * (1 - s * s);
  CV.spires.scale.set(1, 0.035 + 0.965 * s, 1); CV.hint.visible = e === 0; CV.pit.visible = e > 0.55; CV.pit.scale.setScalar(Math.min(1, Math.max(0.01, (e - 0.55) / 0.3)));
  CV.glint.scale.setScalar(1 - s * 0.45);
}
/* the great crystal and the cart's planks as they are */
function mineLook2() {
  const lit = !!golds().starheart, M = CV.greatMat; if (!M) return;
  M.color.set(lit ? '#ffffff' : '#7d7888'); M.emissive.set(lit ? '#e2b65a' : '#3a3350'); M.emissiveIntensity = lit ? 0.85 : 0.18; CV.planks.visible = !mineS().cart; CV.lit = lit;
}
/* the cart ride: the parked cart rolls off along the rail, clattering, leaning into the bends, its lantern lit */
function mineRide(back) {
  if (!CV.ride) CV.ride = mineCartMesh(); const pts = back ? CV.rail.slice().reverse() : CV.rail, a = back ? MINE_CART.b : MINE_CART.a, k0 = pts.findIndex((p) => Math.hypot(p[0] - a[0], p[2] - a[1]) < 0.35), b = back ? MINE_CART.a : MINE_CART.b;
  let k1 = pts.length - 1; while (k1 > 0 && Math.hypot(pts[k1][0] - b[0], pts[k1][2] - b[1]) > 0.35) k1--;
  CV.cartA.visible = CV.cartB.visible = false; CV.clat = 0; CV.heading = null; CV.lean = 0; CV.riding = 1; Snd.play('thud', { gain: 0.3 });
  rideGo({ pts: pts.slice(Math.max(0, k0), k1 + 1), speed: 6.2, mesh: CV.ride, seat: 0.34, endY: MINE_Y, snd: 'whoosh',
    each: (R, dt) => { const m = CV.ride, h = pip.rotation.y; if (CV.heading == null) CV.heading = h; let dh = h - CV.heading; while (dh > Math.PI) dh -= 6.283; while (dh < -Math.PI) dh += 6.283; CV.heading = h;
      CV.lean += (clamp(-dh / Math.max(dt, 0.005) * 0.22, -0.3, 0.3) * Math.min(1, R.v / 4) - CV.lean) * Math.min(1, dt * 5); m.rotation.z = reduced ? 0 : CV.lean; m.position.y += reduced ? 0 : Math.abs(Math.sin(R.d * 5.7)) * 0.018;
      pip.rotation.z = reduced ? 0 : CV.lean * 0.8; if (R.d - CV.clat > 0.62) { CV.clat = R.d; Snd.play('tock', { gain: 0.16, f: 150 + (Math.round(R.d) % 2) * 40 }); if (!reduced && R.v > 4) splash(m.position.x, 0.12, m.position.z, 1); } },
    onEnd: () => { CV.cartA.visible = CV.cartB.visible = true; CV.riding = 0; pip.rotation.z = 0; const r = back ? MINE_CART.ringA : MINE_CART.ringB; pip.position.set(r[0], MINE_Y, r[1]); target.copy(pip.position); SC.rings.forEach((q) => { if (q.o.icon === 'cart') { q.armed = false; q.w = 0; } }); Snd.play('thud', { gain: 0.35 }); Snd.play('ding', { gain: 0.3 }, 0.1); } });
}
/* a round mat with a stairs picture: 'down' into the cave, 'up' out of it; a gold arc fills while Pip stands on it */
function stairMat(dir, x, z, y) {
  const R = 0.6, c = document.createElement('canvas'); c.width = c.height = 256; const q = c.getContext('2d');
  q.fillStyle = dir === 'down' ? '#3b3348' : '#f4e3b0'; q.beginPath(); q.arc(128, 128, 124, 0, 7); q.fill();
  isleIcon(q, dir === 'down' ? 'stairsDown' : 'stairsUp', 128, 132, 3.4);
  const pad = new T.Mesh(new T.CircleGeometry(R, 40), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true })); pad.rotation.x = -Math.PI / 2; pad.position.set(x, 0.05 + (y || 0), z); sc.add(pad);
  const fg = new T.RingGeometry(R - 0.02, R + 0.1, 40, 1, Math.PI / 2, -Math.PI * 2);
  const f = new T.Mesh(fg, new T.MeshBasicMaterial({ color: '#f4b23a', side: T.DoubleSide })); f.rotation.x = -Math.PI / 2; f.position.set(x, 0.06 + (y || 0), z); sc.add(f); fg.setDrawRange(0, 0);
  return { x, z, R, pad, fg, w: 0, dir };
}
/* the way down, in h3: a stone frame round a dark hole with steps going down */
let stairsDown = null;
function stairsBuild(A, fresh) {
  const x = A.cx + A.stairs[0], z = A.cz + A.stairs[1], g = new T.Group(); g.position.set(x, 0, z); sc.add(g); const L = [];
  const hole = new T.Mesh(new T.PlaneGeometry(1.25, 1.5), new T.MeshBasicMaterial({ color: '#1d1824' })); hole.rotation.x = -Math.PI / 2; hole.position.set(0, 0.03, -0.15); g.add(hole);
  for (let s = 0; s < 4; s++) { const q = new T.PlaneGeometry(1.15, 0.26); q.rotateX(-Math.PI / 2); q.translate(0, 0.035, 0.42 - s * 0.3); const m = new T.Mesh(q, new T.MeshBasicMaterial({ color: new T.Color('#8a8074').multiplyScalar(1 - s * 0.22) })); g.add(m); }
  [-0.78, 0.78].forEach((px, k) => { const q = new T.BoxGeometry(0.28, 1.25, 0.32); jit(q, 0.02, 2500 + k); q.translate(px, 0.62, -0.9); L.push(fac(q, (cx, cy, cz, i) => shadeY('#9a9184', cy, 0, 1.3, i, 0.5), 2500 + k)); });
  let q = new T.BoxGeometry(1.9, 0.3, 0.38); jit(q, 0.02, 2502); q.translate(0, 1.36, -0.9); L.push(fac(q, (cx, cy, cz, i) => (cy > 1.45 && hash(i, 3) > 0.4 ? new T.Color('#6f9a4a') : shadeY('#a39a8c', cy, 1.2, 1.5, i, 0.5)), 2502));
  for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28, b = ico(0.16 + hash(k, 8) * 0.1, 0, 2510 + k); b.scale(1.2, 0.6, 1); b.translate(Math.cos(a) * 0.95, 0.06, Math.sin(a) * 1.0 - 0.15); L.push(fac(b, tone('#a9a090', k, 0.6), 2510 + k)); }
  merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g);
  stairsDown = stairMat('down', x, z + 1.15); stairsDown.g = g; CAVE_OUT.x = x; CAVE_OUT.z = z + 2.25;
  stairsDown.ok = () => !inCave && gearDark(); stairsDown.to = () => CAVE_IN; stairsDown.cave = true; /* down needs the torch (gear.js) */
  if (fresh) { g.scale.setScalar(0.01); stairsDown.pop = 0.001; }
}
/* ---- the dark. One small canvas over the picture (a quarter of the screen's size, like the night's: night.js), painted
   each frame while Pip is in the mine: dark all over, and every light cuts its own soft circle out of it: Pip's torch (the
   lantern reaches twice as far), the lanterns on their posts, crystals and star crystals that are ready to mine, the
   mushrooms, the daylight down the stairs, the glitter in the lake. A crystal that has been mined goes dark with it. ---- */
const caveFade = (() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:30;opacity:0;background:#0d0a12'; document.body.appendChild(d); return d; })();
const MINE_R = () => (gearHas('lantern') ? 7.6 : 4.4);
function mineDarkStep(dt) {
  CV.da += ((inCave ? 1 : 0) - CV.da) * Math.min(1, dt * 3); const pp = pip.position, inCath = inCave && pp.z > 50.4;
  CV.dim += ((inCath ? 0.5 : 1) - CV.dim) * Math.min(1, dt * 2);
  if (CV.da < 0.02) { if (CV.cv && CV.cv.style.display !== 'none') CV.cv.style.display = 'none'; return; }
  if (!CV.cv) { const c = document.createElement('canvas'); c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2'; c.setAttribute('aria-hidden', 'true'); document.body.appendChild(c); CV.cv = c; CV.x = c.getContext('2d'); CV.v = new T.Vector3(); }
  const c = CV.cv, x = CV.x, W = Math.max(64, Math.round(innerWidth / 4)), H = Math.max(64, Math.round(innerHeight / 4)); if (c.width !== W || c.height !== H) { c.width = W; c.height = H; } c.style.display = '';
  x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, W, H); x.fillStyle = 'rgba(10,7,22,' + (0.84 * CV.da * CV.dim).toFixed(3) + ')'; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'destination-out'; const tf = Math.tan(cam.fov * Math.PI / 360), v = CV.v, fx = camFocus.x, fz = camFocus.z;
  const hole = (px, py, pz, r, a) => { if (Math.abs(px - fx) > 16 + r || Math.abs(pz - fz) > 14 + r) return; v.set(px, py, pz); const d = cam.position.distanceTo(v); v.project(cam); if (v.z > 1) return;
    const R = r / (d * tf) * (H / 2), sx = (v.x * 0.5 + 0.5) * W, sy = (-v.y * 0.5 + 0.5) * H; x.save(); x.translate(sx, sy); x.scale(1, 0.74);
    const g = x.createRadialGradient(0, 0, R * 0.25, 0, 0, R); g.addColorStop(0, 'rgba(0,0,0,' + (a || 0.94) + ')'); g.addColorStop(0.55, 'rgba(0,0,0,' + (a || 0.94) * 0.55 + ')'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.beginPath(); x.arc(0, 0, R, 0, 7); x.fill(); x.restore(); };
  const tun = CV.riding && mineSdf(pp.x, pp.z, true) > 0.2 ? 0.55 : 1; /* in the cart's tunnel only the cart's own lantern is left */
  hole(pp.x, 0.8, pp.z, MINE_R() * tun * (reduced ? 1 : 1 + Math.sin(time * 9) * 0.012 + Math.sin(time * 3.1) * 0.015));
  CV.lights.forEach((q) => { if (q.on && !q.on()) return; hole(q.x, q.y, q.z, q.r * (q.fl && !reduced ? 1 + Math.sin(time * 6 + q.fl) * 0.03 : 1), q.a); });
  nodes.forEach((n) => { if (!n.mine || n.st !== 'ready' || n.gate) return; if (n.kind === 'crystal') hole(n.x, 0.5, n.z, 1.7, 0.8); else if (n.kind === 'glow') hole(n.x, 0.5, n.z, 2.3, 0.85); else if (n.kind === 'copper') hole(n.x, 0.4, n.z, 1.0, 0.5); });
  chests.forEach((q) => { if (q.idx === 'mine1' || q.idx === 'mine2' || q.idx === 'cath') hole(q.x, 0.5, q.z, 1.5, 0.7); });
  x.globalCompositeOperation = 'source-over';
}
function caveGo(M) {
  caveT = { t: 0, to: M.to(), cave: M.cave, moved: false }; Snd.play(M.cave ? 'whoosh' : 'pop', { gain: 0.35, f: M.cave ? 300 : 520 }); work = null;
}
function minePush(pp, x, z, r) { const dx = pp.x - x, dz = pp.z - z, d = Math.hypot(dx, dz); if (d < r && d > 1e-4) { pp.x = x + dx / d * r; pp.z = z + dz / d * r; } }
function caveStep(dt) {
  if (stairsDown && stairsDown.pop) { stairsDown.pop = Math.min(1, stairsDown.pop + dt * 1.5); stairsDown.g.scale.setScalar(stairsDown.pop); if (stairsDown.pop >= 1) stairsDown.pop = 0; }
  caveRoofs.forEach((r) => { r.visible = !inCave; }); if (CV.g) CV.g.visible = inCave || !!caveT; if (CV.lakeMat) CV.lakeMat.pad.visible = !!mineS().lake;
  for (let k = nodes.length - 1; k >= 0; k--) { const n = nodes[k]; if (n.dead) { sc.remove(n.g); nodes.splice(k, 1); } else if (n.mine) n.g.visible = inCave; } /* a heap broken through is gone for good; what grows in the mine stays under the hill */
  if (inCave) { streaks.visible = ringMesh.visible = dropPts.visible = pudMesh.visible = false; } /* no rain under the hill */
  mineDarkStep(dt);
  if (caveT) {
    const C = caveT; C.t += dt; caveFade.style.opacity = String(C.t < 0.45 ? C.t / 0.45 : Math.max(0, 1 - (C.t - 0.65) / 0.45));
    target.copy(pip.position);
    if (!C.moved && C.t >= 0.5) { C.moved = true; inCave = C.cave; const p = C.to;
      pip.position.set(p.x, 0, p.z); target.copy(pip.position); camFocus.copy(pip.position); if (typeof lastP !== 'undefined') lastP.copy(pip.position);
      if (typeof dog !== 'undefined' && dog.g) dog.g.position.set(p.x - 0.8, 0, p.z + 0.4);
      if (!inCave) isleBoxStep(); }
    if (C.t > 1.15) { caveFade.style.opacity = '0'; caveT = null; }
    return;
  }
  const pp = pip.position, S = mineS();
  if (inCave && CV.g) {
    /* Pip stays on the mine's floor, off the walls, and walks round what stands on it */
    if (!riding2()) { let s = mineSdf(pp.x, pp.z);
      for (let k = 0; k < 8 && s > -0.3; k++) { const e = 0.05, gx = mineSdf(pp.x + e, pp.z) - mineSdf(pp.x - e, pp.z), gz = mineSdf(pp.x, pp.z + e) - mineSdf(pp.x, pp.z - e), l = Math.hypot(gx, gz); if (l < 1e-5) break; const st = s + 0.32; pp.x -= gx / l * st; pp.z -= gz / l * st; s = mineSdf(pp.x, pp.z); }
      if (Math.abs(pp.x - 12) < 0.95 && pp.z > 36.15 && pp.z < 38) pp.z = 36.15; /* the foot of the stairs */
      CV.solid.forEach((q) => { if (!q[3] || q[3]()) minePush(pp, q[0], q[1], q[2]); }); if (!GO.hold) pp.y = MINE_Y; }
    signs.forEach((s) => { if (s.kind === 'lift' && s.ring.position.y < 0.05) { s.ring.position.y = MINE_Y + 0.035; s.ghost.position.y = MINE_Y + 0.05; s.g.position.y = MINE_Y; } });
    /* the cart is Pip's once the long way has been walked to the deep gallery */
    if (!S.cart && S.g2 && pp.x < -7.6 && pp.z < 36.2 && pp.z > 26) { S.cart = 1; mineLook2(); burst(-7.3, 0.9, 29.4, 10); burst(MINE_CART.ringB[0], 0.4, MINE_CART.ringB[1], 8); Snd.play('thud', { gain: 0.45 }); Snd.play('success', { gain: 0.45 }, 0.2); save(); }
    /* the sluice wheel on the marsh island has drawn the water off: the lake runs out before Pip's eyes, the first time Pip is back */
    const K = MINE_LAKE, dl = Math.hypot(pp.x - K.x, pp.z - K.z);
    if (!S.lake && !CV.drain && mons().sluice && dl < 5.4 && !GO.hold) { CV.drain = 0.001; Snd.play('secret', { gain: 0.65 }); Snd.play('whoosh', { gain: 0.3, f: 160 }, 0.3); }
    if (CV.drain) { const was = CV.drain; CV.drain = Math.min(1, CV.drain + dt / 5.5); mineLake();
      if (!reduced && Math.random() < dt * 9 && CV.drain < 0.8) { const a = Math.random() * 6.283, r = K.r * (1 - CV.drain * 0.8) * Math.random(); splash(K.x + Math.cos(a) * r, 0.2, K.z + Math.sin(a) * r, 2); }
      if (Math.floor(was * 7) !== Math.floor(CV.drain * 7)) Snd.play('pop', { gain: 0.22, f: 420 - CV.drain * 220 });
      if (CV.drain >= 1) { CV.drain = 0; S.lake = 1; mineLake(); burst(K.x, 1.0, K.z, 16); Snd.play('sparkle', { gain: 0.45 }); Snd.play('success', { gain: 0.4 }, 0.15); save(); } }
    if (CV.lit !== !!golds().starheart) mineLook2();
    /* small life: the water breathes, the glitter under it turns, glow-worms drift, the lantern light wanders to what is near */
    if (dl < 14) { CV.glint.rotation.y = time * 0.12; CV.glint.material.opacity = (S.lake ? 0.55 : 0.8) + (reduced ? 0 : Math.sin(time * 1.7) * 0.18); CV.spireMat.emissiveIntensity = 0.7 + (reduced ? 0 : Math.sin(time * 1.3) * 0.2); CV.hint.position.y = 2.0 + (reduced ? 0 : Math.sin(time * 2) * 0.06); CV.pitSh.material.opacity = 0.12 + (reduced ? 0 : Math.sin(time * 1.1) * 0.04); }
    if (pp.x < -4 && pp.z > 37) { const P = CV.worms.geometry.attributes.position; for (let k = 0; k < 36; k++) { const a = time * (0.08 + (k % 5) * 0.02) + k * 2.4, r = 1.2 + (k % 7) * 0.55; P.setXYZ(k, -12 + Math.cos(a) * r * 1.05 + Math.sin(time * 0.5 + k) * 0.3, 1.0 + (k % 4) * 0.45 + Math.sin(time * 0.9 + k * 1.3) * 0.25, 44 + Math.sin(a * 1.3 + k) * r * 0.9); } P.needsUpdate = true; CV.worms.material.opacity = 0.75 + (reduced ? 0 : Math.sin(time * 2.2) * 0.2); }
    { let best = null, bd = 81; CV.spots.forEach((q) => { if (q.on && !q.on()) return; const d = (q.x - pp.x) * (q.x - pp.x) + (q.z - pp.z) * (q.z - pp.z); if (d < bd) { bd = d; best = q; } }); const Lp = CV.lamp;
      if (best) { if (CV.spot !== best) { CV.spot = best; if (Lp.intensity < 0.1) Lp.position.set(best.x, best.y, best.z); } Lp.position.lerp(CV.lv.set(best.x, best.y, best.z), Math.min(1, dt * 3)); Lp.color.lerp(CV.lc.set(best.c), Math.min(1, dt * 3)); Lp.intensity += (best.i * (1 - Math.sqrt(bd) / 12) - Lp.intensity) * Math.min(1, dt * 3); }
      else Lp.intensity += (0 - Lp.intensity) * Math.min(1, dt * 3); }
    /* the star heart's gift to the mine: its crystals sparkle, give one more, and are back in a moment */
    if (CV.lit) { const P = CV.twk.geometry.attributes.position; let c = 0;
      nodes.forEach((n) => { if (!n.mine || n.kind !== 'crystal') return; if (n.cvWas && n.st !== 'ready') { state.isle.store.crystal = (state.isle.store.crystal || 0) + 1; const sp = new T.Sprite(new T.SpriteMaterial({ map: hamGiftTex('crystal', 1), transparent: true, depthWrite: false })); sp.scale.set(1.2, 0.6, 1); sp.position.set(n.x + 0.5, 1.1, n.z); sc.add(sp); FD.floats.push({ sp, t: -0.25, y: -0.45 }); invDirty = true; Snd.play('sparkle', { gain: 0.3, f: 1400 }, 0.2); save(); }
        n.cvWas = n.st === 'ready'; if (n.st === 'gone' && n.t > 40) n.t = 40;
        if (n.st === 'ready' && c < 30 && Math.abs(n.x - pp.x) < 13 && Math.abs(n.z - pp.z) < 11 && (reduced || Math.sin(time * 2.3 + n.seed) > -0.4)) P.setXYZ(c++, n.x + Math.sin(time * 1.7 + n.seed) * 0.22, 0.75 + Math.sin(time * 2.9 + n.seed) * 0.3 + (n.tier > 2 ? 0.2 : 0), n.z + Math.cos(time * 1.3 + n.seed) * 0.15); });
      for (let k = c; k < 30; k++) P.setXYZ(k, 0, -50, 0); P.needsUpdate = true; CV.twk.visible = true; } else if (CV.twk) CV.twk.visible = false;
  } else if (CV.lamp) CV.lamp.intensity = 0;
  if (!inCave && LIFT.top) minePush(pp, LIFT.top.x, LIFT.top.z - 0.35, 0.95);
  [stairsDown, LIFT.topMat].concat(CV.mats).forEach((M) => {
    if (!M) return; const d = Math.hypot(pp.x - M.x, pp.z - M.z), still = Math.hypot(target.x - pp.x, target.z - pp.z) < 0.3;
    const on = d < M.R && still && !enSleep && !riding2() && M.ok();
    M.w = on ? Math.min(1, M.w + dt / 0.6) : Math.max(0, M.w - dt * 3); M.fg.setDrawRange(0, 6 * Math.round(40 * M.w));
    if (M.w >= 1) { M.w = 0; M.fg.setDrawRange(0, 0); caveGo(M); }
  });
}
