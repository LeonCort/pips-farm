/* ---------- the Garden of Giant Flowers (meadow, area m5): a hidden world (secret.js says how they plug in) ----------
   Behind the Bee Queen's walled garden a round hedge door is set in the north wall, a golden bee on it. The first time
   Pip takes honey from the Queen's own hive she thanks him: her bees fly to the door, it opens, and a garden rises from
   the sea where everything is giant and Pip is as small as a bee: daisies as tall as trees, toadstools to walk under,
   a snail as big as a cart, grass like a forest at the rim, and in the middle a sunflower fast asleep.
     toy:    three bell flowers. The bees hover by the one to ring next; Pip rings a bell by walking under it. Three in
             the bees' order wake the sunflower: it lifts its head and opens, and the golden comb lies in its middle.
             A wrong bell only hushes them, and the bees show the way again.
     gift:   the golden comb (goldGive('comb')), taken at the sunflower's foot.
     ride:   the bumblebee. One ring by the door, one by the windmill; she carries Pip over the meadow, both ways.
     after:  giant daisies come up all over the meadow, for good.
   state.isle.giant = { woke: 1 the sunflower is open, done: 1 the comb is found } */
const GI = { g: null, bells: [], step: 0, hush: 0, sun: null, bud: null, pet: [], comb: null, wake: 0, snail: null, lady: null, bees: [], drops: [], rings: 0, out: null, outPop: 0, call: 0, door: null };
const giantS = () => state.isle.giant || (state.isle.giant = {});
const GIANT = { A: 'm5', door: GARDEN.door, sun: [0.4, -1.7], bells: [[-3.1, 1.2, 'C6'], [3.0, -0.3, 'E6'], [1.5, 2.9, 'G6']], chest: [3.7, -2.7], ring: [2.6, 4.6], mill: [1.1, -27.3] };
const giQ = (q) => (q.index ? q.toNonIndexed() : q);
ISLE_ICON.bee = (x) => { const b = (f) => { x.fillStyle = f; x.fill(); x.stroke(); };
  x.beginPath(); x.ellipse(-7, -12, 9, 6, -0.5, 0, 7); b('#e9f6ff'); x.beginPath(); x.ellipse(7, -12, 9, 6, 0.5, 0, 7); b('#e9f6ff');
  x.beginPath(); x.ellipse(0, 2, 15, 12, 0, 0, 7); b('#f6c63c'); x.save(); x.beginPath(); x.ellipse(0, 2, 15, 12, 0, 0, 7); x.clip(); x.fillStyle = '#3a2414'; x.fillRect(-5, -12, 5, 28); x.fillRect(5, -12, 5, 28); x.restore();
  x.beginPath(); x.ellipse(0, 2, 15, 12, 0, 0, 7); x.stroke(); x.fillStyle = '#3a2414'; x.beginPath(); x.arc(-10, 0, 1.8, 0, 7); x.fill(); };
/* a stalk that bends: a tube through a few points */
function giStalk(L, pts, r, col, sd) { const c = new T.CatmullRomCurve3(pts.map((p) => new T.Vector3(p[0], p[1], p[2]))); L.push(fac(giQ(new T.TubeGeometry(c, 10, r, 6, false)), (cx, cy, cz, i) => tone(col, i, 0.25), sd)); }
function giLeaf(L, x, y, z, len, ry, sd, col) { const q = ico(0.5, 1, sd, 0.06); q.scale(len, 0.07, len * 0.42); q.translate(len * 0.5, 0, 0); q.rotateZ(0.35); q.rotateY(ry); q.translate(x, y, z); L.push(fac(q, (cx, cy, cz, i) => tone(col || '#5f9a46', i, 0.3), sd)); }
/* a flower head that looks up at us: a domed middle and a ring of petals */
function giHead(L, x, y, z, r, n, pc, cc, sd, tilt) {
  const M = new T.Matrix4().makeRotationX(tilt == null ? -0.95 : tilt), put = (q) => { q.applyMatrix4(M); q.translate(x, y, z); return q; }; let q;
  for (let k = 0; k < n; k++) { q = ico(0.5, 1, sd + k, 0.05); q.scale(r * 0.78, r * 0.3, 0.09); q.translate(r * 0.62, 0, 0); q.rotateZ(k / n * 6.283); L.push(fac(put(q), (cx, cy, cz, i) => tone(pc, i + k, 0.16), sd + k)); }
  q = ico(r * 0.36, 1, sd + 40, 0.05); q.scale(1, 1, 0.5); q.translate(0, 0, 0.06); L.push(fac(put(q), (cx, cy, cz, i) => tone(cc, i, 0.3), sd + 40));
}
function giDaisy(L, x, z, h, r, sd, pc, cc) { const lx = (hash(sd, 1) - 0.5) * 0.9, lz = 0.25 + hash(sd, 2) * 0.3; giStalk(L, [[x, 0, z], [x + lx * 0.3, h * 0.45, z + lz * 0.2], [x + lx, h, z + lz]], 0.06 + r * 0.05, '#5d8a48', sd); giHead(L, x + lx, h + 0.04, z + lz + 0.05, r, 13, pc || '#fffaf0', cc || '#f2b632', sd + 5);
  giLeaf(L, x, h * 0.28, z, r * 1.5, hash(sd, 3) * 6.28, sd + 60); giLeaf(L, x, h * 0.16, z, r * 1.2, hash(sd, 4) * 6.28 + 2.4, sd + 61); }
function giTulip(L, x, z, h, sd, col) { giStalk(L, [[x, 0, z], [x + 0.1, h * 0.5, z + 0.05], [x, h, z + 0.1]], 0.085, '#5d8a48', sd); let q;
  for (let k = 0; k < 5; k++) { q = ico(0.5, 1, sd + k, 0.04); q.scale(0.5, 1.15, 0.2); q.translate(0, 0.5, 0.3); q.rotateX(-0.16); q.rotateY(k / 5 * 6.283); q.translate(x, h - 0.08, z + 0.1); L.push(fac(q, (cx, cy, cz, i) => shadeY(col, cy, h, h + 1.1, i + k, 0.2), sd + k)); }
  giLeaf(L, x, 0.25, z, 1.5, 0.4 + hash(sd, 9), sd + 20, '#4f8a40'); giLeaf(L, x, 0.2, z, 1.3, 3.4 + hash(sd, 8), sd + 21, '#4f8a40'); }
function giShroom(L, x, z, h, r, sd, col) { let q = new T.CylinderGeometry(r * 0.2, r * 0.3, h, 8); q.translate(x, h / 2, z); L.push(fac(giQ(q), (cx, cy, cz, i) => shadeY('#f4ecd8', cy, 0, h, i, 0.2), sd));
  q = new T.SphereGeometry(r, 12, 6, 0, 6.283, 0, 1.45); q.scale(1, 0.72, 1); q.translate(x, h - r * 0.12, z); L.push(fac(giQ(q), (cx, cy, cz, i) => tone(col || '#e2533f', i, 0.18), sd + 1));
  q = new T.CylinderGeometry(r * 0.96, r * 0.3, r * 0.2, 12); q.translate(x, h - r * 0.1, z); L.push(fac(giQ(q), (cx, cy, cz, i) => tone('#f1e2c6', i, 0.15), sd + 2));
  for (let k = 0; k < 7; k++) { const a = hash(sd, 20 + k) * 6.283, d = 0.25 + hash(sd, 30 + k) * 0.55, yy = Math.cos(d * 1.45) * r * 0.72; q = ico(r * (0.09 + hash(sd, 40 + k) * 0.06), 1, sd + 50 + k); q.scale(1, 0.4, 1); q.translate(x + Math.cos(a) * d * r, h - r * 0.12 + yy + 0.01, z + Math.sin(a) * d * r); L.push(fac(q, '#fff8ea', sd + 50)); } }
function giBumble(s) { const g = new T.Group(), L = []; let q;
  [['#f6c63c', 0.34, -0.36], ['#3a2c1c', 0.4, -0.12], ['#f6c63c', 0.42, 0.14], ['#3a2c1c', 0.36, 0.42]].forEach(([c, r, z], k) => { q = ico(r, 1, 9700 + k, 0.1); q.scale(1, 0.92, 0.75); q.translate(0, 0, z); L.push(fac(q, (cx, cy, cz, i) => tone(c, i, 0.2), 9700 + k)); });
  q = ico(0.26, 1, 9710, 0.06); q.translate(0, 0.02, 0.66); L.push(fac(q, (cx, cy, cz, i) => tone('#4a3826', i, 0.2), 9710));
  [[-0.11, 0.1, 0.86], [0.11, 0.1, 0.86]].forEach(([x, y, z], k) => { q = ico(0.05, 1, 9712 + k); q.translate(x, y, z); L.push(fac(q, '#fffdf4', 9712)); });
  const m = merged(L, MAT, g); m.castShadow = true; const wm = new T.MeshBasicMaterial({ color: '#eaf6ff', transparent: true, opacity: 0.6, side: T.DoubleSide, depthWrite: false }); g.userData.w = [];
  [-1, 1].forEach((sd) => { const w = new T.Mesh(new T.CircleGeometry(0.42, 10), wm); w.geometry.scale(1, 0.55, 1); w.geometry.translate(0.4, 0, 0); w.rotation.x = -Math.PI / 2; const p = new T.Group(); p.position.set(sd * 0.12, 0.34, 0.02); p.scale.x = sd; p.add(w); g.add(p); g.userData.w.push(p); });
  g.scale.setScalar(s || 1); return g; }
SECRET_FILL.m5 = (A, fresh) => {
  if (GI.g) return; const g = GI.g = new T.Group(); sc.add(g); const L = [], X = A.cx, Z = A.cz; let q;
  /* the rim: grass like a forest on three sides, low in front so we can see in */
  for (let k = 0; k < 190; k++) { const t = hash(k, 9500) * 4, s = Math.floor(t), f = (t - s) * 11.4 - 5.7, d = 5.25 + hash(k, 9501) * 0.6, x = s === 0 ? f : s === 1 ? d : s === 2 ? f : -d, z = s === 0 ? -d : s === 2 ? d : f; if (s === 2 && (Math.abs(x + 2.4) < 1.3 || k % 3)) continue; if (landSdf(X + x, Z + z) > -0.15) continue;
    const h = s === 2 ? 0.5 + hash(k, 9502) * 0.5 : 1.9 + hash(k, 9502) * 1.9; q = new T.ConeGeometry(0.2, h, 3); q.scale(1, 1, 0.3); q.translate(0, h / 2, 0); q.rotateZ((hash(k, 9503) - 0.5) * 0.45); q.rotateY(hash(k, 9504) * 3.14); q.translate(X + x, 0, Z + z); q = fac(giQ(q), (cx, cy, cz, i) => shadeY(['#6fa64c', '#5f9a46', '#7fb457'][k % 3], cy, 0, h, i, 0.2), 9505 + k); { const N = q.attributes.normal; for (let i = 0; i < N.count; i++) N.setXYZ(i, N.getX(i) * 0.25, 0.95, N.getZ(i) * 0.25 + 0.2); } L.push(q); } /* blades take the light like the lawn does, whichever way they face */
  /* petal stepping stones from the door to the sunflower */
  [[-2.4, 5.2], [-2.1, 4.2], [-1.6, 3.3], [-1.1, 2.4], [-0.6, 1.5], [-0.2, 0.6], [0.2, -0.3]].forEach(([x, z], k) => { q = ico(0.5, 1, 9560 + k, 0.05); q.scale(0.95, 0.07, 0.62); q.rotateY(0.9 + (k % 2 ? 0.5 : -0.4)); q.translate(X + x, 0.04, Z + z); L.push(fac(q, (cx, cy, cz, i) => tone(['#f6c1d0', '#fff6e4', '#f7dc8a'][k % 3], i, 0.14), 9560 + k)); });
  /* the tall ones stand at the back, the low ones in front */
  giDaisy(L, X - 3.9, Z - 4.1, 4.2, 1.15, 9600); giDaisy(L, X - 1.7, Z - 4.7, 5.0, 1.3, 9620, '#fde0ea', '#f29a2e'); giDaisy(L, X + 2.6, Z - 4.5, 4.6, 1.25, 9640); giDaisy(L, X + 4.5, Z - 2.9, 3.6, 1.0, 9660, '#e5d8ff', '#f2b632'); giDaisy(L, X - 5.0, Z - 2.0, 3.2, 0.9, 9680, '#fff3c4', '#e58a2c');
  giTulip(L, X - 4.7, Z + 0.1, 2.3, 9700, '#e8546a'); giTulip(L, X + 4.8, Z + 1.0, 2.6, 9720, '#f29a2e'); giTulip(L, X + 4.2, Z - 0.6, 2.0, 9740, '#b48be0'); giTulip(L, X - 4.1, Z - 0.9, 1.8, 9760, '#f7c948');
  giShroom(L, X - 4.3, Z + 3.1, 1.75, 1.15, 9780); giShroom(L, X - 3.3, Z + 4.2, 0.95, 0.62, 9800, '#ef7d4f'); giShroom(L, X + 4.7, Z + 3.0, 1.45, 0.95, 9820); giShroom(L, X + 5.0, Z + 4.2, 0.8, 0.5, 9840, '#ef7d4f');
  /* clover and small flowers on the ground, big pebbles */
  for (let k = 0; k < 46; k++) { const x = (hash(k, 9860) - 0.5) * 10.2, z = (hash(k, 9861) - 0.5) * 10.2; if (Math.hypot(x - GIANT.sun[0], z - GIANT.sun[1]) < 1.2 || landSdf(X + x, Z + z) > -0.4) continue;
    for (let j = 0; j < 3; j++) { q = ico(0.16, 1, 9870 + k); q.scale(1, 0.12, 1); const a = j / 3 * 6.283 + k; q.translate(X + x + Math.cos(a) * 0.13, 0.05, Z + z + Math.sin(a) * 0.13); L.push(fac(q, (cx, cy, cz, i) => tone(k % 4 ? '#6fb04c' : '#8cc462', i, 0.15), 9870 + k)); } }
  [[-0.9, 4.6, 0.42], [3.4, 1.2, 0.36], [-2.6, -1.6, 0.5], [1.9, -0.9, 0.3]].forEach(([x, z, r], k) => { q = ico(r, 1, 9930 + k, 0.12); q.scale(1.2, 0.62, 1); q.translate(X + x, r * 0.3, Z + z); L.push(fac(q, (cx, cy, cz, i) => tone(['#d9d2c2', '#c5bdac'][k % 2], i, 0.2), 9930 + k)); });
  /* the sleeping sunflower: its stalk and leaves stand still, the head moves (below) */
  const sx = X + GIANT.sun[0], sz = Z + GIANT.sun[1]; giStalk(L, [[sx, 0, sz], [sx - 0.15, 2.0, sz], [sx, 4.3, sz + 0.25]], 0.17, '#5d8a48', 9940); giLeaf(L, sx, 1.3, sz, 2.2, 0.3, 9941, '#4f8a40'); giLeaf(L, sx, 2.1, sz, 2.0, 3.3, 9942, '#4f8a40'); giLeaf(L, sx, 2.9, sz, 1.6, 1.4, 9943, '#5f9a46');
  /* the bell flowers' arched stalks */
  GIANT.bells.forEach(([bx, bz], k) => { const x = X + bx, z = Z + bz; giStalk(L, [[x - 0.9, 0, z - 0.5], [x - 0.8, 1.8, z - 0.45], [x - 0.35, 2.75, z - 0.2], [x, 2.6, z]], 0.07, '#5d8a48', 9950 + k); giLeaf(L, x - 0.9, 0.5, z - 0.5, 1.2, 2.6 + k, 9955 + k); });
  const mesh = merged(L.map(giQ), MAT, g); mesh.castShadow = true; mesh.receiveShadow = true;
  [[-3.9, -4.1, 1.2], [-1.7, -4.7, 1.3], [2.6, -4.5, 1.3], [-4.3, 3.1, 1.2], [4.7, 3.0, 1.0], [GIANT.sun[0], GIANT.sun[1], 1.6]].forEach(([x, z, r]) => lookFoot(X + x, Z + z, r, r));
  /* the sunflower's head: a wide seed disc, two rings of petals, and a green bud cap that falls away when it wakes */
  { const h = GI.sun = new T.Group(); h.position.set(sx, 4.3, sz + 0.3); g.add(h); const P = [];
    q = new T.CylinderGeometry(1.0, 1.0, 0.24, 20); q.rotateX(Math.PI / 2); P.push(fac(giQ(q), (cx, cy, cz, i) => tone(Math.hypot(cx, cy) < 0.55 ? '#6a4324' : '#8a5a2e', i, 0.3), 9960));
    for (let k = 0; k < 40; k++) { const a = k * 2.4, d = Math.sqrt(k / 40) * 0.9; q = ico(0.07, 0, 9961 + k); q.translate(Math.cos(a) * d, Math.sin(a) * d, 0.13); P.push(fac(q, k % 3 ? '#5a3a1e' : '#a87238', 9961)); }
    q = new T.CylinderGeometry(1.12, 0.5, 0.3, 14); q.rotateX(Math.PI / 2); q.translate(0, 0, -0.22); P.push(fac(giQ(q), (cx, cy, cz, i) => tone('#5d8a48', i, 0.25), 9962));
    const m = merged(P, MAT, h); m.castShadow = true;
    for (let k = 0; k < 22; k++) { const p = new T.Group(), a = k / 22 * 6.283 + (k % 2 ? 0.14 : 0); q = ico(0.5, 1, 9970 + k, 0.04); q.scale(0.95, 0.34, 0.08); q.translate(0.45, 0, 0); const pm = new T.Mesh(fac(q, (cx, cy, cz, i) => tone(k % 2 ? '#f7c21c' : '#fbd64a', i, 0.14), 9970 + k), MAT); pm.castShadow = true; p.add(pm); p.rotation.z = a; p.position.set(Math.cos(a) * 0.95, Math.sin(a) * 0.95, k % 2 ? -0.04 : 0.02); h.add(p); GI.pet.push(p); }
    q = new T.SphereGeometry(1.2, 12, 8, 0, 6.283, 0, 1.75); q.rotateX(Math.PI / 2); q.scale(1, 1, 0.85); GI.bud = new T.Mesh(fac(giQ(q), (cx, cy, cz, i) => tone(['#5d8a48', '#4f8a40', '#6a9a50'][i % 3], i, 0.2), 9990), MAT); GI.bud.position.z = 0.1; GI.bud.castShadow = true; h.add(GI.bud);
    GI.comb = new T.Mesh(goldGeo('comb'), goldMat); GI.comb.position.set(0, 0, 0.5); GI.comb.scale.setScalar(1.25); GI.comb.visible = false; h.add(GI.comb); }
  /* the three bells */
  GIANT.bells.forEach(([bx, bz, note], k) => { const b = new T.Group(); b.position.set(X + bx, 2.6, Z + bz); g.add(b); const P = [], col = ['#7d8ff0', '#b48be0', '#6fc3ee'][k];
    q = new T.CylinderGeometry(0.16, 0.62, 0.85, 10, 2, true); { const A2 = q.attributes.position; for (let i = 0; i < A2.count; i++) if (A2.getY(i) < -0.3) { const a = Math.atan2(A2.getZ(i), A2.getX(i)); A2.setY(i, A2.getY(i) - Math.abs(Math.cos(a * 2.5)) * 0.14); } } q.translate(0, -0.5, 0); P.push(fac(giQ(q), (cx, cy, cz, i) => shadeY(col, cy, -1, 0, i, 0.2), 10000 + k));
    q = new T.SphereGeometry(0.17, 8, 5, 0, 6.283, 0, 1.6); q.translate(0, -0.08, 0); P.push(fac(giQ(q), (cx, cy, cz, i) => tone('#5d8a48', i, 0.2), 10010 + k)); q = ico(0.11, 1, 10020 + k); q.translate(0, -0.98, 0); P.push(fac(q, '#f7dc8a', 10020));
    const bm = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, side: T.DoubleSide, emissive: new T.Color(col), emissiveIntensity: 0 }), m = merged(P, bm, b); m.castShadow = true; GI.bells.push({ b, m: bm, x: X + bx, z: Z + bz, note, sw: 0, lit: 0, in: false }); });
  /* a snail as big as a cart, a ladybird, dew on the leaves */
  { const s = GI.snail = new T.Group(), P = []; q = ico(0.5, 2, 10040, 0.04); q.scale(1.7, 0.42, 0.6); q.translate(0.1, 0.2, 0); P.push(fac(q, (cx, cy, cz, i) => tone('#e9d2a6', i, 0.14), 10040));
    q = new T.TorusGeometry(0.34, 0.2, 7, 14); q.translate(-0.15, 0.72, 0); P.push(fac(giQ(q), (cx, cy, cz, i) => tone(i % 5 < 2 ? '#c9774a' : '#e09a62', i, 0.15), 10041)); q = ico(0.2, 1, 10042); q.scale(1, 1, 0.9); q.translate(-0.15, 0.72, 0); P.push(fac(q, '#a85f3a', 10042));
    [-0.12, 0.12].forEach((z, k) => { q = new T.CylinderGeometry(0.025, 0.03, 0.42, 5); q.rotateZ(-0.5); q.translate(0.92, 0.55, z); P.push(fac(giQ(q), '#e9d2a6', 10043)); q = ico(0.06, 1, 10044 + k); q.translate(1.03, 0.75, z); P.push(fac(q, '#3a2c1c', 10044)); });
    const m = merged(P, MAT, s); m.castShadow = true; g.add(s);
    const l = GI.lady = new T.Group(), Q = []; q = new T.SphereGeometry(0.2, 10, 6, 0, 6.283, 0, 1.5); q.scale(1.15, 0.8, 1); Q.push(fac(giQ(q), (cx, cy, cz, i) => tone('#e2463a', i, 0.12), 10050)); q = ico(0.1, 1, 10051); q.translate(0.2, 0.04, 0); Q.push(fac(q, '#2c2018', 10051));
    [[-0.05, 0.1], [0.07, -0.09], [-0.12, -0.06], [0.03, 0.02]].forEach(([x, z], k) => { q = ico(0.04, 0, 10052 + k); q.scale(1, 0.4, 1); q.translate(x, 0.15 - Math.hypot(x, z) * 0.25, z); Q.push(fac(q, '#2c2018', 10052)); }); merged(Q, MAT, l); g.add(l);
    const dm = new T.MeshStandardMaterial({ color: '#cfeeff', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.72, emissive: new T.Color('#9fd8ff'), emissiveIntensity: 0.35 });
    [[-3.6, 1.25, -3.6, 0.2], [-1.2, 0.95, -4.3, 0.15], [3.2, 1.35, -4.1, 0.22], [-4.9, 0.6, 0.6, 0.16], [4.4, 0.72, 1.5, 0.18], [1.0, 1.42, -1.5, 0.17], [-0.9, 2.2, -1.9, 0.14]].forEach(([x, y, z, r]) => { const d = new T.Mesh(new T.SphereGeometry(r, 10, 8), dm); d.position.set(X + x, y, Z + z); g.add(d); GI.drops.push(d); }); }
  /* what grows here: berries the size of Pip's head, a wild hive, and a chest under a leaf */
  [['bush', -1.9, -2.9], ['bush', 2.2, -3.2], ['bush', -3.0, 2.2], ['hive', 3.7, 2.0]].forEach(([k, x, z], n) => { const nd = makeNode(k, X + x, Z + z, 10100 + n); if (k === 'bush') nd.g.scale.setScalar(1.35); if (fresh) { nd.pop = 0.001; nd.g.scale.setScalar(0.01); } });
  if (!state.isle.chests.giant) makeChest(X + GIANT.chest[0], Z + GIANT.chest[1], { coin: 40, honey: 4 }, 'giant');
  /* the bumblebee's two rings */
  if (!GI.rings) { GI.rings = 1; const a = [X + GIANT.ring[0], Z + GIANT.ring[1]], b = GIANT.mill;
    ringMake({ x: a[0], z: a[1], icon: 'bee', ok: () => !!HAS.m5 && !GI.pop, go: () => giantFly(a, b) }); ringMake({ x: b[0], z: b[1], icon: 'bee', ok: () => !!HAS.m5, go: () => giantFly(b, a) }); }
  giantLook(); if (fresh) { g.scale.setScalar(0.01); GI.pop = 0.001; }
};
function giantFly(a, b) { if (!GI.bee) GI.bee = giBumble(1.25); const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
  rideGo({ pts: [[a[0], 0.5, a[1]], [a[0] + (mx - a[0]) * 0.3, 2.2, a[1] + (mz - a[1]) * 0.3], [mx, 2.7, mz], [b[0] + (mx - b[0]) * 0.3, 2.2, b[1] + (mz - b[1]) * 0.3], [b[0], 0.5, b[1]]], speed: 6.5, mesh: GI.bee, seat: 0.42, endY: 0, snd: 'whoosh',
    each: (R) => { GI.bee.userData.w.forEach((w, k) => { w.rotation.z = Math.sin(time * 48) * 0.7 * (k ? -1 : 1); }); GI.bee.position.y += reduced ? 0 : Math.sin(time * 7) * 0.05; } }); }
/* the head as it is: asleep it hangs and hides in its bud; awake it looks up at us, petals wide */
function giantLook() { if (!GI.sun) return; const w = giantS().woke ? 1 : GI.wake, e = w * w * (3 - 2 * w); GI.sun.rotation.x = 1.15 - e * 1.95; GI.bud.scale.setScalar(Math.max(0.001, 1 - e * 1.4)); GI.bud.visible = e < 0.7;
  GI.pet.forEach((p) => { p.scale.setScalar(0.25 + e * 0.75); }); GI.comb.visible = e > 0.6 && !giantS().done && !golds().comb; }
const giantKeep = (a, x, z) => a.id === 'm4' && Math.abs(x - GIANT.door) < 1.3 && z < GARDEN.z0 + 0.2; /* the strip between the garden wall and the hidden door stays clear */
ISLE_KEEPS.push(giantKeep);
/* giant daisies come up all over the meadow once the comb is found */
function giantSprout(anim) {
  if (GI.out) return; const g = GI.out = new T.Group(); sc.add(g); const L = [], near = (x, z) => nodes.some((n) => Math.hypot(n.x - x, n.z - z) < 1.3) || chests.some((c) => Math.hypot(c.x - x, c.z - z) < 1.4) || signs.some((s) => Math.hypot(s.x - x, s.z - z) < 1.4); let n = 0;
  ['m0', 'm1', 'm2', 'm3', 'm4'].forEach((id, ai) => { const A = AREA_BY[id]; if (!HAS[id]) return; let got = 0;
    for (let k = 0; k < 40 && got < 4; k++) { const x = A.cx + (hash(k, 10200 + ai) - 0.5) * 10.4, z = A.cz + (hash(k, 10210 + ai) - 0.5) * 10.4; if (walkSdf(x, z) > -0.8 || !areaClear(x, z) || trailNear(x, z).d < 1.1 || near(x, z)) continue;
      giDaisy(L, x, z, 1.5 + hash(k, 10220 + ai) * 1.2, 0.5 + hash(k, 10230 + ai) * 0.22, 10240 + ai * 50 + k, ['#fffaf0', '#fde0ea', '#e5d8ff', '#fff3c4'][(k + ai) % 4]); lookFoot(x, z, 0.5, 0.5); got++; n++; } });
  if (n) { const m = merged(L.map(giQ), MAT, g); m.castShadow = true; } if (anim) { g.scale.set(1, 0.01, 1); GI.outPop = 0.001; }
}
function giantStep(dt) {
  const pp = pip.position, S = giantS();
  /* the Queen's thanks: the first honey from her own hive opens the hidden door */
  if (!HAS.m5 && GD.hive && gardenOpen() && GD.hive.st !== 'ready' && !rising && !GI.call && HAS.m4) { GI.call = 0.001; Snd.play('bell', { gain: 0.4, f: 'E6' }); }
  if (GI.call && !HAS.m5) { GI.call += dt; if (GI.call > 2.2 && !rising) { if (secretOpen('m5')) { burst(GIANT.door, 1.2, GARDEN.z0, 18); gardenDoor(); } } }
  if (!GI.g) return; const A = AREA_BY.m5, X = A.cx, Z = A.cz;
  if (GI.pop) { GI.pop = Math.min(1, GI.pop + dt * 0.9); const e = GI.pop, s = e < 0.8 ? e / 0.8 * 1.06 : 1.06 - (e - 0.8) / 0.2 * 0.06; GI.g.scale.set(1, s, 1); if (GI.pop >= 1) { GI.pop = 0; GI.g.scale.setScalar(1); } }
  GI.g.visible = !inCave; if (inCave) return;
  mesaOut({ x: X + GIANT.sun[0], z: Z + GIANT.sun[1], w: 0.5, d: 0.5 }, pp, 0.25);
  /* bells: walk under one to ring it */
  const lit = S.woke ? 3 : GI.step; GI.hush = Math.max(0, GI.hush - dt);
  GI.bells.forEach((B, k) => { const inn = Math.hypot(pp.x - B.x, pp.z - B.z) < 0.75 && pp.y < 0.5;
    if (inn && !B.in && !GI.pop) { B.sw = 1; Snd.play('bell', { gain: 0.5, f: B.note });
      if (!S.woke) { if (k === GI.step) { GI.step++; burst(B.x, 1.7, B.z, 8); if (GI.step === 3) { GI.wake = 0.001; Snd.play('success', { gain: 0.5, f: 'C6' }, 0.5); Snd.play('secret', { gain: 0.55 }, 1.1); } }
        else if (k > GI.step) { GI.step = 0; GI.hush = 1.2; Snd.play('blip', { gain: 0.2, f: 300 }, 0.25); } } }
    B.in = inn; B.sw = Math.max(0, B.sw - dt * 0.6); B.b.rotation.z = reduced ? 0 : Math.sin(time * 9 + k) * 0.32 * B.sw + Math.sin(time * 0.9 + k * 2) * 0.04; B.b.rotation.x = reduced ? 0 : Math.cos(time * 7 + k) * 0.18 * B.sw;
    B.lit += ((k < lit ? 1 : 0) - B.lit) * Math.min(1, dt * 4); B.m.emissiveIntensity = B.lit * (0.55 + (reduced ? 0 : Math.sin(time * 3 + k) * 0.15)) + B.sw * 0.5; });
  /* the bees hover by the bell to ring next; once the sunflower is awake they circle its head */
  if (!GI.bees.length) for (let k = 0; k < 6; k++) { const b = new T.Mesh(new T.SphereGeometry(0.06, 6, 5), new T.MeshBasicMaterial({ color: k % 2 ? '#ffd75a' : '#3a2c1c' })); GI.g.add(b); GI.bees.push(b); }
  { const done = S.woke || GI.wake, nb = GI.bells[Math.min(2, GI.step)], tx = done ? X + GIANT.sun[0] : nb.x, tz = done ? Z + GIANT.sun[1] + 0.6 : nb.z, ty = done ? 3.6 : 1.5;
    GI.bx = GI.bx == null ? tx : GI.bx + (tx - GI.bx) * Math.min(1, dt * 1.6); GI.bz = GI.bz == null ? tz : GI.bz + (tz - GI.bz) * Math.min(1, dt * 1.6); GI.by = GI.by == null ? ty : GI.by + (ty - GI.by) * Math.min(1, dt * 1.6);
    GI.bees.forEach((b, k) => { const a = time * (2.0 + k * 0.23) + k * 1.05, r = (done ? 1.3 : 0.75) + GI.hush * 1.5; b.position.set(GI.bx + Math.cos(a) * r, GI.by + Math.sin(time * 2.6 + k) * 0.3, GI.bz + Math.sin(a) * r * 0.7); b.visible = !reduced || k < 2; }); }
  /* the sunflower wakes */
  if (GI.wake && !S.woke) { GI.wake = Math.min(1, GI.wake + dt / 3.2); giantLook(); if (GI.wake >= 1) { S.woke = 1; GI.wake = 0; save(); giantLook(); } }
  if (S.woke && !S.done && !golds().comb && Math.hypot(pp.x - (X + GIANT.sun[0]), pp.z - (Z + GIANT.sun[1] + 0.9)) < 1.0) { S.done = 1; GI.comb.visible = false; goldGive('comb'); giantSprout(true); }
  if (S.woke && !reduced) GI.sun.rotation.z = Math.sin(time * 0.6) * 0.05; if (GI.comb.visible) GI.comb.rotation.y = time * 1.4;
  /* slow life */
  { const a = time * 0.035, s = GI.snail; s.position.set(X + Math.cos(a) * 3.2 - 0.6, 0, Z + Math.sin(a) * 1.3 + 1.2); s.rotation.y = -a - Math.PI / 2; s.scale.y = 1 + (reduced ? 0 : Math.sin(time * 1.5) * 0.03);
    const b = time * 0.22, l = GI.lady; l.position.set(X - 4.3 + Math.cos(b) * 0.7, 1.75 + 0.62, Z + 3.1 + Math.sin(b) * 0.7); l.rotation.y = -b - Math.PI / 2; l.rotation.z = Math.cos(b) * 0.5; l.rotation.x = -Math.sin(b) * 0.5;
    GI.drops.forEach((d, k) => { d.scale.setScalar(1 + (reduced ? 0 : Math.sin(time * 1.3 + k * 1.7) * 0.06)); }); }
  if ((S.done || golds().comb) && !GI.out && !rising) giantSprout(false);
  if (GI.outPop) { GI.outPop = Math.min(1, GI.outPop + dt / 2.5); const e = GI.outPop; GI.out.scale.set(1, e < 0.85 ? e / 0.85 * 1.08 : 1.08 - (e - 0.85) / 0.15 * 0.08, 1); if (GI.outPop >= 1) GI.outPop = 0; }
}
ISLE_STEPS.push(giantStep);
