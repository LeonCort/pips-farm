/* ---------- Heron Isle and the Firefly Tree (marsh, area r5): a hidden world (secret.js says how they plug in) ----------
   At the south shore of the marsh a great grey heron stands on one leg beside a closed giant lily bud on the water, and
   a sign beside it asks for pearls (the coral island's find) and reeds. Paid, the bud opens, the heron bows, and Heron
   Isle rises across Lily Lake: a horseshoe of marsh round a bay of giant lily pads, and in the middle an old willow hung
   with hundreds of firefly lights. The lake cannot be walked: the heron carries Pip over and back, the long way round
   the tree. In the bay sit five frogs, big to small, each on its own pad and each with its own note. The fireflies show
   an order; stepping on the pads in that order makes the whole choir sing, the fireflies swirl up the willow and the
   golden moon lily at its roots opens (the marsh's golden gift). A wrong step only makes the frogs hop, and the
   fireflies show the order again. From then on moon lilies bloom on every water of the marsh, and fireflies dance over
   them at night.
   state.isle.heron: { open: 1 once the bud is paid, choir: 1 once the tune is sung }. HERON (rules.js) holds the places. */
const HR = { shore: null, g: null, bird: null, at: 0, fly: 0, rot: 0, bow: 0, busy: null, openT: 0, pan: 0, frogs: [], prog: 0, demo: null, idle: 0, sing: null, on: -1, flies: null, sect: [], rip: [], lil: {}, lilNew: false, lilT: 0, lamps: 0, padT: 0 };
const heronS = () => state.isle.heron || (state.isle.heron = {});
const HERON_NOTE = [261.6, 329.6, 392, 440, 523.3], HERON_ORDER = [0, 2, 1, 3, 4], HERON_TUNE = [0, 2, 4, 2, 3, 4, 3, 1, 0, 2, 4];
const HERON_FROG = [[2.0, '#4f9a3c'], [1.7, '#86c44a'], [1.45, '#3fae8c'], [1.2, '#c9d44a'], [1.0, '#e9903c']];
const HERON_BAY = [-27.7, 39.9], HERON_Y = -0.33; /* the middle of the frogs' bay; how high a giant pad's top lies */
const heronSide = (x, z) => (z > 30.4 && z < 44 && x > -35 && x < -21 ? 1 : 0); /* 1: on the isle's side of the lake */
ISLE_ICON.heron = (x) => { const blob = (f) => { x.fillStyle = f; x.fill(); x.stroke(); };
  x.beginPath(); x.moveTo(-5, 8); x.lineTo(-5, 22); x.moveTo(1, 8); x.lineTo(2, 22); x.lineWidth = 2.6; x.stroke(); x.lineWidth = 3;
  x.beginPath(); x.ellipse(-4, 2, 14, 8.5, -0.3, 0, 7); blob('#8d9fb2');
  x.beginPath(); x.moveTo(5, -1); x.quadraticCurveTo(15, -6, 6, -12); x.quadraticCurveTo(0, -16, 6, -20); x.lineWidth = 9; x.stroke(); x.lineWidth = 4.5; x.strokeStyle = '#dbe4ec'; x.stroke(); x.strokeStyle = '#3a2414'; x.lineWidth = 3;
  x.beginPath(); x.moveTo(9, -22); x.lineTo(23, -19); x.lineTo(9, -17); x.closePath(); blob('#f0b23a');
  x.beginPath(); x.arc(6, -20, 5.5, 0, 7); blob('#eef3f7'); x.fillStyle = '#22303c'; x.beginPath(); x.arc(7.5, -21, 1.5, 0, 7); x.fill();
  x.beginPath(); x.moveTo(2, -23); x.lineTo(-8, -20); x.lineWidth = 2.6; x.stroke(); };

/* ---- small builders ---- */
const heronFlat = (L) => merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, new T.Group()).geometry;
function heronMesh(L, parent, shadow) { const m = new T.Mesh(heronFlat(L), MAT); m.castShadow = !!shadow; m.receiveShadow = true; parent.add(m); return m; }
function heronLimb(a, b, r0, r1, n) { const d = new T.Vector3().subVectors(b, a), len = d.length(), q = new T.CylinderGeometry(r1, r0, len, n || 6).toNonIndexed(); q.applyMatrix4(new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()))); q.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); return q; }
let heronGlowTex = null;
function heronGlow() { if (heronGlowTex) return heronGlowTex; const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 1, 32, 32, 31);
  g.addColorStop(0, 'rgba(255,255,235,1)'); g.addColorStop(0.22, 'rgba(255,240,150,0.85)'); g.addColorStop(0.55, 'rgba(220,255,120,0.25)'); g.addColorStop(1, 'rgba(200,255,120,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); heronGlowTex = new T.CanvasTexture(c); return heronGlowTex; }
function heronPoints(P, size) { const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(P), 3)); g.setAttribute('color', new T.BufferAttribute(new Float32Array(P.length).fill(1), 3));
  const m = new T.Points(g, new T.PointsMaterial({ map: heronGlow(), size, sizeAttenuation: true, vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); m.frustumCulled = false; m.renderOrder = 3; return m; }
const heronDusk = () => clamp((typeof nightAmt === 'number' ? nightAmt : 0) * 1.7, 0, 1);

/* ---- the great grey heron: it looks along +z; its feet are at 0 ---- */
function heronModel() {
  const g = new T.Group(), tilt = new T.Group(), V = (x, y, z) => new T.Vector3(x, y, z), GREY = '#8d9fb2', PALE = '#dde5ec', SLATE = '#5f7186', DARK = '#2c3644', LEG = '#c9a24e'; let q, L = [];
  tilt.position.set(0, 1.2, 0); g.add(tilt);
  q = ico(0.36, 1, 7101, 0.02); q.scale(0.78, 0.8, 1.5); q.rotateX(-0.22); q.translate(0, 0.08, 0.02); L.push(fac(q, (cx, cy, cz, i) => (cy < -0.04 ? tone(PALE, i, 0.3) : shadeY(GREY, cy, -0.3, 0.42, i, 0.35)), 7101));
  q = new T.ConeGeometry(0.17, 0.55, 5); q.rotateX(-Math.PI / 2 - 0.3); q.scale(1, 0.5, 1); q.translate(0, -0.03, -0.6); L.push(fac(q, (cx, cy, cz, i) => tone(cz < -0.72 ? DARK : SLATE, i, 0.3), 7102));
  [-0.09, -0.03, 0.04, 0.1].forEach((x, k) => { q = new T.ConeGeometry(0.035, 0.3 + (k % 2) * 0.08, 3); q.rotateX(Math.PI - 0.25); q.translate(x, -0.02, 0.47 - (k % 2) * 0.04); L.push(fac(q, (cx, cy, cz, i) => tone('#f4f7fa', i + k, 0.2), 7103 + k)); });
  heronMesh(L, tilt, true);
  L = []; [-1, 1].forEach((s) => { q = ico(0.3, 1, 7110 + s, 0.015); q.scale(0.22, 0.6, 1.35); q.rotateX(-0.3); q.translate(s * 0.27, 0.1, -0.1); L.push(fac(q, (cx, cy, cz, i) => tone(cz < -0.38 ? DARK : cz > 0.2 ? '#3d4a5c' : SLATE, i, 0.3), 7110 + s)); });
  const fold = heronMesh(L, tilt, true);
  /* the neck: an S of three pieces, and the head with its dagger of a beak and black crest */
  const neck = new T.Group(); neck.position.set(0, 0.3, 0.46); tilt.add(neck); L = [];
  const N = [V(0, -0.06, -0.04), V(0, 0.3, 0.2), V(0, 0.62, 0.05), V(0, 0.93, 0.14)], NR = [0.115, 0.08, 0.064, 0.056];
  for (let k = 0; k < 3; k++) { L.push(fac(heronLimb(N[k], N[k + 1], NR[k], NR[k + 1], 7), (cx, cy, cz, i) => tone(cz > N[k].z + 0.05 && i % 3 === 0 ? '#aab7c4' : PALE, i, 0.25), 7120 + k)); q = ico(NR[k + 1] * 1.04, 0, 7124 + k); q.translate(N[k + 1].x, N[k + 1].y, N[k + 1].z); L.push(fac(q, (cx, cy, cz, i) => tone(PALE, i, 0.2), 7124 + k)); }
  heronMesh(L, neck, true);
  const head = new T.Group(); head.position.copy(N[3]); neck.add(head); L = [];
  q = ico(0.115, 1, 7130); q.scale(0.86, 0.86, 1.3); q.translate(0, 0.04, 0.04); L.push(fac(q, (cx, cy, cz, i) => (cy > 0.075 && Math.abs(cx) > 0.025 && cz < 0.12 ? new T.Color(DARK) : tone('#f4f7fa', i, 0.15)), 7130));
  q = new T.ConeGeometry(0.03, 0.42, 3); q.rotateX(-Math.PI / 2 - 0.45); q.translate(0, 0.06, -0.28); L.push(fac(q, DARK, 7131));
  q = new T.ConeGeometry(0.052, 0.46, 5); q.rotateX(Math.PI / 2 + 0.06); q.translate(0, 0.02, 0.38); L.push(fac(q, (cx, cy, cz, i) => tone(cy > 0.03 ? '#e09a2c' : '#f6c04a', i, 0.2), 7132));
  [-1, 1].forEach((s) => { q = new T.SphereGeometry(0.024, 6, 5); q.translate(s * 0.086, 0.07, 0.11); L.push(fac(q, '#ffd94a', 7133)); q = new T.SphereGeometry(0.013, 5, 4); q.translate(s * 0.103, 0.07, 0.118); L.push(fac(q, () => new T.Color('#141a20'), 7134)); });
  heronMesh(L, head, true);
  /* the legs: one to stand on, the other tucked up under the body (in the air both trail behind) */
  const legs = new T.Group(); legs.position.set(0, 1.12, 0); g.add(legs);
  const leg = (x, L) => { L.push(fac(heronLimb(V(x, 0, 0), V(x, -0.52, 0.03), 0.036, 0.03, 5), LEG, 7140)); L.push(fac(heronLimb(V(x, -0.52, 0.03), V(x, -1.1, 0), 0.03, 0.026, 5), LEG, 7141)); q = ico(0.042, 0, 7142); q.translate(x, -0.52, 0.03); L.push(fac(q, LEG, 7142));
    [[0, 0.2], [0.09, 0.16], [-0.09, 0.16], [0, -0.1]].forEach(([dx, dz], k) => { L.push(fac(heronLimb(V(x, -1.1, 0), V(x + dx, -1.115, dz), 0.022, 0.012, 4), LEG, 7143 + k)); }); };
  L = []; leg(-0.09, L); heronMesh(L, legs, true); L = []; leg(0.09, L); const legB = heronMesh(L, legs, true);
  L = []; L.push(fac(heronLimb(V(0.1, -0.02, 0.02), V(0.1, -0.3, 0.2), 0.036, 0.03, 5), LEG, 7150)); L.push(fac(heronLimb(V(0.1, -0.3, 0.2), V(0.1, -0.2, -0.08), 0.03, 0.026, 5), LEG, 7151)); q = ico(0.05, 0, 7152); q.translate(0.1, -0.2, -0.1); L.push(fac(q, LEG, 7152));
  const tuck = heronMesh(L, tilt, true);
  /* the wings, spread: three panels with a row of dark flight feathers behind, and fingers at the tip */
  const wings = [-1, 1].map((s) => { const w = new T.Group(); w.position.set(s * 0.22, 0.3, 0.08); tilt.add(w); L = [];
    [[0.34, 0.66, 0.6, 0.06], [0.98, 0.66, 0.52, 0.045], [1.56, 0.54, 0.38, 0.035]].forEach(([cx0, len, ch, th], k) => { q = new T.BoxGeometry(len, th, ch); q.translate(s * cx0, -k * 0.012, -0.03 - k * 0.04); L.push(fac(q.toNonIndexed(), (cx, cy, cz, i) => tone(cz > 0 ? GREY : SLATE, i + k, 0.3), 7160 + k));
      for (let j = 0; j < 4; j++) { q = new T.ConeGeometry(0.085, 0.36 - k * 0.04, 3); q.rotateX(-Math.PI / 2); q.scale(1, 0.3, 1); q.translate(s * (cx0 - len / 2 + (j + 0.5) * len / 4), -k * 0.012, -0.03 - k * 0.04 - ch / 2 - 0.1); L.push(fac(q, (a, b, c, i) => tone(DARK, i + j, 0.3), 7170 + k * 4 + j)); } });
    for (let j = 0; j < 4; j++) { q = new T.ConeGeometry(0.06, 0.42, 3); q.rotateZ(-s * Math.PI / 2); q.scale(1, 0.3, 1); q.rotateY(s * (0.1 + j * 0.2)); q.translate(s * 1.86, -0.03, 0.02 - j * 0.1); L.push(fac(q, (a, b, c, i) => tone(DARK, i + j, 0.3), 7190 + j)); }
    heronMesh(L, w, true); w.scale.setScalar(0.001); return w; });
  return { g, tilt, neck, head, legs, legB, tuck, fold, wings };
}
/* how it holds itself: f = 0 standing on one leg, 1 in the air; bow: the neck sweeps down */
function heronPose(B, f, bow, dt) {
  const e = f * f * (3 - 2 * f), t = time;
  B.fold.scale.setScalar(Math.max(0.001, 1 - e)); B.tuck.visible = e < 0.5; B.legB.visible = e >= 0.5;
  B.wings.forEach((w, k) => { const s = k ? 1 : -1; w.scale.setScalar(Math.max(0.001, e)); w.rotation.z = s * (0.12 + (reduced ? 0.2 : Math.sin(t * 6.2) * 0.5) * e); w.rotation.y = s * -0.12; });
  B.legs.rotation.x = e * 1.42; B.tilt.rotation.x = bow * 0.42 + e * 0.1 + (reduced ? 0 : Math.sin(t * 6.2 + 1.2) * 0.03 * e);
  B.tilt.position.y = 1.2 + (reduced ? 0 : Math.sin(t * 6.2 + 0.6) * 0.05 * e + Math.sin(t * 1.3) * 0.008 * (1 - e));
  B.neck.rotation.x = bow * 1.0 + e * 0.55 + (reduced ? 0 : Math.sin(t * 0.9) * 0.03); B.head.rotation.x = -bow * 0.5 - e * 0.5;
}

/* ---- lily pads and blooms ---- */
/* a giant pad: a notched disc with pale ribs and an upturned rosy rim; (x, y, z) is the middle of its top */
function heronPad(L, x, z, r, sd, y) {
  const a0 = hash(sd, 1) * 6.28; let q = new T.CylinderGeometry(r, r * 0.95, 0.04, 20, 1, false, a0, 5.95); q.translate(x, y - 0.02, z);
  L.push(fac(q, (cx, cy, cz, i) => { const w = Math.floor((Math.atan2(cz - z, cx - x) + 3.1416) / 6.2832 * 20); return cy > y - 0.012 ? tone(w % 2 ? '#58a653' : '#69b65f', w + sd, 0.3) : new T.Color('#3c7a48'); }, sd));
  q = new T.TorusGeometry(r, 0.04, 5, 22, 5.95); q.rotateX(-Math.PI / 2); q.rotateY(a0 - Math.PI / 2); q.translate(x, y + 0.012, z); L.push(fac(q, (cx, cy, cz, i) => (cy > y + 0.02 ? tone('#9fd06a', i, 0.25) : tone('#c2607c', i, 0.3)), sd + 1));
  q = new T.CylinderGeometry(r * 0.09, r * 0.09, 0.012, 7); q.translate(x, y + 0.004, z); L.push(fac(q, '#b9dc80', sd + 2));
}
function heronSmallPad(L, x, z, r, sd) { const q = new T.CylinderGeometry(r, r, 0.02, 9, 1, false, 0.5, 5.7); q.rotateY(hash(sd, 2) * 6.28); q.translate(x, -0.415, z); L.push(fac(q, (cx, cy, cz, i) => tone('#5fae5a', i + sd, 0.5), sd)); }
/* a water lily: three rings of pointed petals. open 0 is a tight bud, 1 lies wide. kind: 'bud' (the giant rosy one on the
   lake), 'moon' (the golden moon lily), 'pink' and 'white' (the small ones on the water) */
function heronBloom(L, kind, open, s, x, y, z, sd) {
  const i0 = L.length, C = { bud: [['#9ad072', '#ffa9c8'], ['#ffbdd4', '#ffe1ea'], ['#ffe9f0', '#ffffff']], moon: [['#fff3c4', '#ffd75a'], ['#fffbe8', '#ffe9a0'], ['#ffffff', '#fff6d0']], pink: [['#f29ab8', '#f7bfd2'], ['#f7bfd2', '#ffe1ea'], ['#ffe9f0', '#ffffff']], white: [['#eef6ea', '#ffffff'], ['#ffffff', '#fff6e4'], ['#fff6e4', '#ffffff']] }[kind];
  [[8, 0.62, 0.19, -0.3 + open * 1.5, 0, 0.2], [7, 0.56, 0.17, -0.24 + open * 1.08, 0.39, 0.13], [5, 0.47, 0.14, -0.15 + open * 0.62, 0.2, 0.07]].forEach(([n, len, r, tilt, ph, rb], ring) => { for (let k = 0; k < n; k++) {
    let q = new T.OctahedronGeometry(1, 0); q.scale(r, len / 2, r * 0.42); q.translate(0, len / 2, 0); q.rotateX(tilt); q.translate(0, 0.02, rb); q.rotateY(k / n * 6.2832 + ph);
    L.push(fac(q, (cx, cy, cz, i) => new T.Color(C[ring][0]).lerp(new T.Color(C[ring][1]), clamp((Math.hypot(cx, cy, cz) - rb) / len * (kind === 'bud' && !ring ? 3.2 : 1.5) - 0.25, 0, 1)), sd + ring * 10 + k)); } });
  if (open > 0.25) { let q = ico(0.11, 1, sd + 40); q.scale(1, 0.55, 1); q.translate(0, 0.05, 0); L.push(fac(q, (cx, cy, cz, i) => tone('#f6c63c', i, 0.3), sd + 40));
    for (let k = 0; k < 7; k++) { q = new T.ConeGeometry(0.018, 0.16, 3); q.translate(0, 0.08, 0); q.rotateX(0.5); q.rotateY(k / 7 * 6.2832); q.translate(0, 0.05, 0); L.push(fac(q, '#ffe07a', sd + 41 + k)); } }
  for (let k = i0; k < L.length; k++) { L[k].scale(s, s, s); L[k].translate(x, y, z); }
}
/* cattails and sedge for dressing a shore (not for gathering) */
function heronCattail(L, x, z, sd, n) { for (let j = 0; j < n; j++) { const h = 0.6 + hash(sd, j + 50) * 0.55, px = x + (hash(sd, j + 60) - 0.5) * 0.36, pz = z + (hash(sd, j + 70) - 0.5) * 0.36, lean = (hash(sd, j + 80) - 0.5) * 0.32, y0 = Math.max(-0.45, Math.min(0, -gSdf(px, pz) * 2.4));
  let q = new T.CylinderGeometry(0.014, 0.019, h, 4); q.translate(0, h / 2, 0); q.rotateZ(lean); q.translate(px, y0, pz); L.push(fac(q, '#7fae4f', sd + j));
  q = new T.CylinderGeometry(0.042, 0.042, 0.19, 6); q.translate(0, h - 0.14, 0); q.rotateZ(lean); q.translate(px, y0, pz); L.push(fac(q, (cx, cy, cz, i) => tone('#8a5a34', i + sd, 0.4), sd + 9 + j));
  q = new T.ConeGeometry(0.045, h * 0.8, 3); q.scale(1, 1, 0.3); q.translate(0, h * 0.4, 0); q.rotateZ(0.4 + hash(sd, j + 90) * 0.3); q.rotateY(hash(sd, j + 95) * 6.28); q.translate(px, y0, pz); L.push(fac(q, (cx, cy, cz, i) => shadeY('#5f9a45', cy, y0, y0 + 0.8, i, 0.4), sd + 19 + j)); } }
function heronSedge(L, x, z, sd, col) { for (let j = 0; j < 5; j++) { const h = 0.22 + hash(sd, j + 20) * 0.24, q = new T.ConeGeometry(0.036, h, 3); q.translate(0, h / 2, 0); q.rotateZ((hash(sd, j + 30) - 0.5) * 0.9); q.rotateY(j * 1.6); q.translate(x + (j - 2) * 0.045, 0, z + (hash(sd, j + 40) - 0.5) * 0.1); L.push(fac(q, (cx, cy, cz, i) => shadeY(col || '#4f8a45', cy, 0, 0.45, i, 0.3), sd + j)); } }

/* ---- the marsh shore: the heron, the bud on its pad, and a trail of small pads leading out over the lake ---- */
function heronShoreBuild() {
  const g = HR.shore = new T.Group(); sc.add(g); const L = [], [bx, bz] = HERON.bud;
  heronPad(L, bx, bz, 0.95, 7300, -0.36);
  [[-0.9, 1.1, 0.26], [0.2, 1.9, 0.3], [-0.5, 2.7, 0.22], [0.9, 1.0, 0.2], [1.5, 0.3, 0.28], [-1.6, 0.2, 0.24], [0.7, 3.2, 0.18], [-1.4, 2.0, 0.17], [2.3, 1.3, 0.2], [-2.5, 0.9, 0.22]].forEach(([dx, dz, r], k) => { heronSmallPad(L, bx + dx, bz + dz, r, 7310 + k); if (k % 3 === 0) heronBloom(L, k % 2 ? 'white' : 'pink', 0.9, 0.22, bx + dx + 0.03, -0.4, bz + dz, 7330 + k * 60); });
  heronMesh(L, g, false);
  HR.budM = new T.Mesh(new T.BufferGeometry(), MAT); HR.budM.castShadow = true; HR.budM.receiveShadow = false; g.add(HR.budM); HR.budO = -1; heronBudSet(heronS().open ? 1 : 0);
  const B = HR.bird = heronModel(); sc.add(B.g); heronStand(0, true); heronPose(B, 0, 0, 0);
  lookFoot(HERON.shore[0], HERON.shore[1], 0.45, 0.45);
  HR.rings = [0, 1].map((k) => { const p = k ? HERON.ring1 : HERON.ring0, r = ringMake({ x: p[0], z: p[1], icon: 'heron', ok: () => HAS.r5 && !rising && HR.at === k && !HR.busy && !SC.ride && !HR.openT, go: () => heronRide(1 - k) }); r.ring.rotation.x = -Math.PI / 2; return r; });
  nightLamp(bx, bz, 3.2);
}
function heronBudSet(o) { if (Math.abs(o - HR.budO) < 0.004) return; HR.budO = o; const L = []; heronBloom(L, 'bud', o, 1.9 - o * 0.35, HERON.bud[0], -0.33, HERON.bud[1], 7400); const old = HR.budM.geometry; HR.budM.geometry = heronFlat(L); old.dispose(); }
const heronSpot = (k) => (k ? HERON.land : HERON.shore), heronFace = (k) => (k ? 1.05 : Math.atan2(HERON.bud[0] - HERON.shore[0], HERON.bud[1] - HERON.shore[1]));
function heronStand(k, snap) { const p = heronSpot(k), B = HR.bird; HR.at = k; B.g.position.set(p[0], 0, p[1]); if (snap) { HR.rot = heronFace(k); B.g.rotation.y = HR.rot; } }
/* the way over the lake: out from the marsh shore, east along the lake, round the isle and its tree, in over the west arm */
function heronPath(to) {
  const C = [[HERON.shore[0], 0, HERON.shore[1]], [-27.4, 0.5, 30.6], [-24.4, 1.2, 32.2], [-21.5, 1.5, 35.4], [-21.7, 1.35, 39.4], [-24.4, 1.1, 42.9], [-28, 0.95, 43.6], [-31.6, 1.05, 42.7], [-34.6, 1.2, 39.8], [-34.9, 1.0, 36.8], [-33.8, 0.45, 35.2], [HERON.land[0], 0, HERON.land[1]]].map((p) => new T.Vector3(p[0], p[1], p[2]));
  const P = new T.CatmullRomCurve3(C, false, 'centripetal').getSpacedPoints(64).map((v) => [v.x, Math.max(0, v.y), v.z]); P[0][1] = 0; P[P.length - 1][1] = 0; return to ? P : P.reverse();
}
const HERON_SEAT = 0.98;
/* Pip steps on the ring: a hop onto the heron's back, the flight, a hop off beside the other ring */
function heronRide(to) { if (HR.busy || SC.ride) return; const B = HR.bird, p = pip.position; const P = heronPath(to); HR.busy = { kind: 'up', t: 0, to, P, dir: Math.atan2(P[2][0] - P[0][0], P[2][2] - P[0][2]), from: [p.x, p.y, p.z] }; work = null; target.copy(p); Snd.play('pop', { gain: 0.35, f: 520 }); }
function heronFlown(to) { const B = HR.bird, p = pip.position, r = to ? HERON.ring1 : HERON.ring0; heronStand(to, false); HR.rot = B.g.rotation.y; HR.busy = { kind: 'down', t: 0, to, from: [p.x, HERON_SEAT, p.z], end: [r[0], 0, r[1]] }; Snd.play('thud', { gain: 0.25, f: 180 });
  if (typeof dog !== 'undefined' && dog && dog.g) dog.g.position.set(r[0] + (to ? 1.0 : -1.0), 0, r[1] + 0.7); }
function heronBusy(dt) {
  const U = HR.busy, B = HR.bird, p = pip.position; if (!U) return; U.t += dt;
  if (U.kind === 'up') { const u = Math.min(1, U.t / 0.5), e = u * u * (3 - 2 * u), bp = B.g.position; p.set(U.from[0] + (bp.x - U.from[0]) * e, U.from[1] + (HERON_SEAT - U.from[1]) * e + Math.sin(u * Math.PI) * 0.45, U.from[2] + (bp.z - U.from[2]) * e); target.copy(p); work = null; { const d = U.dir - HR.rot; HR.rot += Math.atan2(Math.sin(d), Math.cos(d)) * Math.min(1, dt * 7); } pip.rotation.y = B.g.rotation.y = HR.rot; HR.bow = Math.sin(u * Math.PI) * 0.5;
    if (u >= 1) { HR.busy = { kind: 'ride', to: U.to }; HR.bow = 0; Snd.play('whoosh', { gain: 0.45, f: 300 }); rideGo({ pts: U.P, speed: 5.2, mesh: B.g, keep: 1, seat: HERON_SEAT, endY: HERON_SEAT, each: (R) => { HR.fly = clamp(Math.min(R.d, R.len - R.d) / 1.6, 0, 1); HR.rot = B.g.rotation.y; }, onEnd: () => heronFlown(U.to) }); } }
  else if (U.kind === 'ride') { if (!SC.ride) HR.busy = null; }
  else if (U.kind === 'down') { const u = Math.min(1, U.t / 0.5), e = u * u * (3 - 2 * u); p.set(U.from[0] + (U.end[0] - U.from[0]) * e, U.from[1] * (1 - e) + Math.sin(u * Math.PI) * 0.35, U.from[2] + (U.end[2] - U.from[2]) * e); target.copy(p); work = null; HR.fly = 0; if (u >= 1) { p.y = 0; HR.busy = null; save(); } }
  else if (U.kind === 'solo') { /* the heron comes over by itself to the side Pip is on */
    U.d = Math.min(U.len, U.d + dt * 6.5); let k = 1; while (k < U.L.length - 1 && U.L[k] < U.d) k++; const f = (U.d - U.L[k - 1]) / Math.max(0.001, U.L[k] - U.L[k - 1]), a = U.P[k - 1], b = U.P[k];
    B.g.position.set(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f); HR.rot = B.g.rotation.y = Math.atan2(b[0] - a[0], b[2] - a[2]); HR.fly = clamp(Math.min(U.d, U.len - U.d) / 1.4, 0, 1);
    if (U.d >= U.len) { heronStand(U.to, false); HR.fly = 0; HR.busy = null; } }
  if (U.kind === 'ride' || U.kind === 'up') limbs.forEach((l) => { l.g.rotation.x = l.arm ? -0.55 : -1.25; });
}
function heronSolo(to) { const a = heronSpot(1 - to), b = heronSpot(to), P = [], L = [0]; for (let k = 0; k <= 16; k++) { const u = k / 16; P.push([a[0] + (b[0] - a[0]) * u - Math.sin(u * Math.PI) * 1.6, Math.sin(u * Math.PI) * 1.3, a[1] + (b[1] - a[1]) * u]); if (k) L.push(L[k - 1] + Math.hypot(P[k][0] - P[k - 1][0], P[k][1] - P[k - 1][1], P[k][2] - P[k - 1][2])); }
  HR.busy = { kind: 'solo', to, P, L, d: 0, len: L[L.length - 1] }; }
/* the bud is paid: it opens, the heron bows, and the isle comes up out of the lake */
function heronOpen() { heronS().open = 1; HR.openT = 0.001; burst(HERON.bud[0], 0.6, HERON.bud[1], 14); Snd.play('sparkle', { gain: 0.5 }); save(); }
ISLE_KEYS.push({ id: 'heron', ok: () => !!HAS.r2 && !HAS.r5 && !heronS().open, x: HERON.ring0[0], z: HERON.ring0[1], cost: { pearl: 3, reed: 8 }, open: heronOpen });
ISLE_KEEPS.push((a, x, z) => a.id === 'r2' && (Math.hypot(x - HERON.shore[0], z - HERON.shore[1]) < 1.3 || Math.hypot(x - HERON.ring0[0], z - HERON.ring0[1]) < 1.3));

/* ---- the Firefly Tree: an old willow, its curtains in six parts that sway, a firefly light at every joint ---- */
function heronWillow(g) {
  const V = (x, y, z) => new T.Vector3(x, y, z), L = [], BARK = '#7c6a58'; let q;
  const bark = (sd) => (cx, cy, cz, i) => (cy < 1.1 && hash(i, sd) > 0.8 ? tone('#6f8f4e', i, 0.4) : shadeY(hash(i, sd + 1) > 0.5 ? BARK : '#8a7663', cy, -0.2, 4.2, i, 0.4));
  for (let k = 0; k < 8; k++) { const a = k / 8 * 6.2832 + hash(k, 7501) * 0.5, l = 0.95 + hash(k, 7502) * 0.5; q = new T.CylinderGeometry(0.21, 0.05, l, 5); q.translate(0, -l / 2, 0); q.rotateZ(1.12 + hash(k, 7503) * 0.12); q.translate(0.3, 0.5, 0); q.rotateY(a); L.push(fac(q, bark(7504 + k), 7504 + k)); }
  const TR = [[0, 0, 0, 0.62], [0.05, 0.75, -0.03, 0.5], [0.1, 1.5, 0.03, 0.43], [0.04, 2.2, 0.08, 0.38], [0, 2.85, 0.02, 0.33]];
  for (let k = 0; k < 4; k++) { q = heronLimb(V(TR[k][0], TR[k][1], TR[k][2]), V(TR[k + 1][0], TR[k + 1][1], TR[k + 1][2]), TR[k][3], TR[k + 1][3], 8); jit(q, 0.035, 7520 + k); L.push(fac(q, bark(7520 + k), 7520 + k)); }
  q = ico(0.2, 0, 7530); q.scale(0.5, 1, 1); q.translate(0.42, 1.25, 0.2); L.push(fac(q, () => new T.Color('#3a2c22'), 7530)); /* an old knothole */
  const ends = [];
  for (let k = 0; k < 7; k++) { const a = k / 7 * 6.2832 + 0.3, c = Math.cos(a), s = Math.sin(a), r1 = 0.75 + hash(k, 7541) * 0.2, p0 = V(0, 2.6 + (k % 2) * 0.2, 0), p1 = V(c * r1, 3.4 + hash(k, 7542) * 0.3, s * r1), p2 = V(c * 1.65, 4.0 + hash(k, 7543) * 0.25, s * 1.65), p3 = V(c * 2.35, 4.05 + hash(k, 7544) * 0.2, s * 2.35);
    L.push(fac(heronLimb(p0, p1, 0.2, 0.14, 6), bark(7550 + k), 7550 + k)); L.push(fac(heronLimb(p1, p2, 0.14, 0.09, 5), bark(7560 + k), 7560 + k)); L.push(fac(heronLimb(p2, p3, 0.09, 0.05, 5), bark(7570 + k), 7570 + k)); ends.push(p2, p3); }
  heronMesh(L, g, true).name = 'trunk';
  /* the crown */
  const C = [], leaf = (sd, lo) => (cx, cy, cz, i) => leafY(['#8fbf5a', '#a3cc66', '#7fb052', '#b4d57a'][sd % 4], cy, lo, lo + 1.5, i, 0.5);
  [[0, 5.0, 0, 1.15], [0.8, 4.75, 0.3, 0.95], [-0.7, 4.7, 0.5, 0.95], [-0.3, 4.75, -0.8, 1.0], [0.6, 4.6, -0.7, 0.9]].forEach(([x, y, z, r], k) => { q = ico(r, 1, 7600 + k, 0.1); q.scale(1, 0.62, 1); q.translate(x, y, z); C.push(fac(q, leaf(k, y - 0.6), 7600 + k)); });
  for (let k = 0; k < 9; k++) { const a = k / 9 * 6.2832, r = 0.8 + hash(k, 7611) * 0.2; q = ico(r, 1, 7620 + k, 0.1); q.scale(1, 0.55, 1); q.translate(Math.cos(a) * 1.6, 4.3 + hash(k, 7612) * 0.25, Math.sin(a) * 1.6); C.push(fac(q, leaf(k + 1, 3.8), 7620 + k)); }
  heronMesh(C, g, true);
  /* the curtains: strands of long leaves, shorter to the south, where the bay and the golden lily are */
  const SL = [[], [], [], [], [], []], SP = [[], [], [], [], [], []], PY = 4.3;
  const strand = (a, r, y0, len, sd) => { const sec = Math.floor(((a % 6.2832) + 6.2832) % 6.2832 / 6.2832 * 6), n = Math.max(2, Math.round(len / 0.5)), seg = len / n; let x = Math.cos(a) * r, z = Math.sin(a) * r;
    for (let j = 0; j < n; j++) { const y = y0 - j * seg, w = 0.125 - j * 0.008; q = new T.ConeGeometry(w, seg * 1.25, 3); q.scale(1, 1, 0.45); q.rotateX(Math.PI); q.rotateY(a + hash(sd, j) * 2); q.translate(x, y - seg * 0.55 - PY, z);
      SL[sec].push(fac(q, (cx, cy, cz, i) => tone(['#8fbf5a', '#9cc862', '#aed26e', '#bfdc7c', '#cbe487', '#d5ea92'][Math.min(5, j + (sd % 2))], i + sd, 0.35), sd * 7 + j));
      if (j > 0 || hash(sd, 77) > 0.5) SP[sec].push(x + (hash(sd, j + 9) - 0.5) * 0.08, y - PY - (hash(sd, j + 19)) * seg * 0.6, z + (hash(sd, j + 29) - 0.5) * 0.08);
      x += (hash(sd, j + 40) - 0.5) * 0.07 - Math.cos(a) * 0.02; z += (hash(sd, j + 50) - 0.5) * 0.07 - Math.sin(a) * 0.02; } };
  for (let k = 0; k < 84; k++) { const a = k / 84 * 6.2832 + hash(k, 7701) * 0.06, south = Math.sin(a) > 0.35 ? 0.42 + 0.3 * (1 - Math.sin(a)) : 1; strand(a, 2.25 + hash(k, 7702) * 0.6, 4.2 + hash(k, 7703) * 0.3, (2.3 + hash(k, 7704) * 1.0) * south, 7710 + k); }
  for (let k = 0; k < 30; k++) { const a = k / 30 * 6.2832 + 0.1, south = Math.sin(a) > 0.2 ? 0.5 : 1; strand(a, 1.25 + hash(k, 7801) * 0.5, 4.35 + hash(k, 7802) * 0.3, (1.3 + hash(k, 7803) * 0.8) * south, 7810 + k); }
  HR.sect = SL.map((S, k) => { const s = new T.Group(); s.position.set(0, PY, 0); g.add(s); heronMesh(S, s, true); const pts = heronPoints(SP[k], 0.2); s.add(pts); return { g: s, pts, n: SP[k].length / 3 }; });
}
/* a frog: it looks along +z; made at the size of a small one and scaled up */
function heronFrog(k) {
  const [s, col] = HERON_FROG[k], g = new T.Group(), b = new T.Group(), L = [], sd = 7900 + k * 20; let q; g.add(b);
  q = ico(0.17, 1, sd); q.scale(1.08, 0.72, 1.25); q.translate(0, 0.13, 0); L.push(fac(q, (cx, cy, cz, i) => (cy < 0.085 ? tone('#eef0b8', i, 0.2) : hash(i, sd) > 0.84 ? tone(col, i, 0.3).multiplyScalar(0.72) : shadeY(col, cy, 0, 0.3, i, 0.3)), sd));
  q = ico(0.125, 1, sd + 1); q.scale(1.12, 0.72, 1); q.translate(0, 0.2, 0.15); L.push(fac(q, (cx, cy, cz, i) => (cy < 0.16 ? tone('#eef0b8', i, 0.2) : shadeY(col, cy, 0.1, 0.32, i, 0.3)), sd + 1));
  [-1, 1].forEach((e) => { q = new T.SphereGeometry(0.058, 7, 6); q.translate(e * 0.088, 0.295, 0.18); L.push(fac(q, (cx, cy, cz, i) => (cz > 0.2 ? new T.Color('#fff8d6') : tone(col, i, 0.2)), sd + 2)); q = new T.SphereGeometry(0.03, 6, 5); q.translate(e * 0.092, 0.3, 0.226); L.push(fac(q, () => new T.Color('#1a241c'), sd + 3));
    q = ico(0.1, 0, sd + 4); q.scale(0.8, 0.6, 1.5); q.rotateY(e * 0.5); q.translate(e * 0.17, 0.075, -0.09); L.push(fac(q, (cx, cy, cz, i) => shadeY(col, cy, 0, 0.2, i, 0.3), sd + 4));
    q = ico(0.06, 0, sd + 5); q.scale(1.1, 0.3, 1.7); q.rotateY(e * -0.5); q.translate(e * 0.23, 0.02, 0.03); L.push(fac(q, (cx, cy, cz, i) => tone(col, i, 0.3).multiplyScalar(0.85), sd + 5));
    q = new T.CylinderGeometry(0.03, 0.026, 0.14, 5); q.rotateZ(e * 0.3); q.translate(e * 0.115, 0.07, 0.2); L.push(fac(q, col, sd + 6)); q = ico(0.045, 0, sd + 7); q.scale(1.2, 0.3, 1.5); q.translate(e * 0.135, 0.015, 0.25); L.push(fac(q, (cx, cy, cz, i) => tone(col, i, 0.3).multiplyScalar(0.85), sd + 7)); });
  heronMesh(L, b, true); const sac = new T.Mesh(new T.SphereGeometry(0.09, 8, 6), new T.MeshStandardMaterial({ color: '#fff3b8', roughness: 0.6 })); sac.position.set(0, 0.115, 0.235); sac.scale.setScalar(0.4); b.add(sac);
  const glow = new T.Sprite(new T.SpriteMaterial({ map: heronGlow(), transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0 })); glow.position.set(0, 0.42, 0); glow.scale.setScalar(1.1); g.add(glow);
  g.scale.setScalar(s); return { g, b, sac, glow, s, croak: 0, hop: 0, lit: 0 };
}
/* ---- the isle itself: SECRET_FILL builds it when the land is up ---- */
SECRET_FILL.r5 = function heronFill(A, fresh) {
  if (HR.g) return; const g = HR.g = new T.Group(); sc.add(g); const L = [], W = [], [tx, tz] = HERON.tree, R = (k, n) => hash(k, n + 8100); let q;
  /* the walking pads: the frogs' five and the causeway over the mouth of the bay */
  HERON.pads.forEach((p, k) => { heronPad(W, p[0], p[1], k < 5 ? 0.74 + HERON_FROG[k][0] * 0.07 : 0.74 + R(k, 1) * 0.1, 8110 + k * 3, -0.345); });
  /* small pads and lilies on the lake and the bay, clear of the big ones */
  let n = 0; for (let k = 0; k < 500 && n < 74; k++) { const x = -35.6 + R(k, 2) * 15.2, z = 30.4 + R(k, 3) * 13.4, d = gSdf(x, z); if (d < 0.4 || d > 3.4) continue; if (HERON.pads.some((p) => Math.hypot(x - p[0], z - p[1]) < p[2] + 0.2) || Math.hypot(x - HERON.bud[0], z - HERON.bud[1]) < 3.4) continue; n++;
    const r = 0.17 + R(k, 4) * 0.17; heronSmallPad(W, x, z, r, 8200 + k); if (R(k, 5) > 0.52) heronBloom(W, R(k, 6) > 0.5 ? 'pink' : 'white', 0.75 + R(k, 7) * 0.25, 0.2 + R(k, 8) * 0.1, x + 0.03, -0.4, z, 8300 + k * 60); }
  heronMesh(W, g, false);
  /* the rim: cattails standing in the shallows and on the banks, sedge and little flowers on the grass, mossy stones */
  const clear = (x, z, r) => [HERON.ring1, HERON.land, [tx, tz + 1.1], [-23.3, 38.3], [-23.3, 39.15]].every((p) => Math.hypot(x - p[0], z - p[1]) > (r || 0.9)) && HERON.pads.every((p) => Math.hypot(x - p[0], z - p[1]) > p[2] + 0.35) && HERON_REEDS.every((p) => Math.hypot(x - p[0], z - p[1]) > 0.9);
  n = 0; for (let k = 0; k < 700 && n < 64; k++) { const x = -34.3 + R(k, 11) * 12.6, z = 32.4 + R(k, 12) * 10, d = gSdf(x, z); if (d > 0.22 || d < -0.5 || !clear(x, z)) continue; if (d > -0.12 && z < 34.4 && Math.abs(x - tx) < 1.6) continue; n++; heronCattail(L, x, z, 8500 + k * 3, 2 + Math.floor(R(k, 13) * 3)); }
  for (let k = 0; k < 150; k++) { const x = -34 + R(k, 21) * 12, z = 32.6 + R(k, 22) * 9.4; if (gSdf(x, z) > -0.3 || !clear(x, z, 0.6) || Math.hypot(x - tx, z - tz) < 1.5) continue; heronSedge(L, x, z, 8900 + k * 5, k % 4 ? '#4f8a45' : '#6aa04e');
    if (k % 5 === 0) { const h = 0.2 + R(k, 23) * 0.12; q = new T.CylinderGeometry(0.012, 0.015, h, 3); q.translate(x + 0.2, h / 2, z + 0.1); L.push(fac(q, '#5d8a48', 9000)); q = ico(0.06, 0, 9001 + k); q.scale(1, 0.55, 1); q.translate(x + 0.2, h + 0.02, z + 0.1); L.push(fac(q, () => new T.Color(['#fff6e4', '#f6c1d0', '#ffe07a'][k % 3]), 9001 + k)); } }
  [[-30.2, 35.3, 0.3], [-29.3, 35.75, 0.26], [-26.6, 35.9, 0.3], [-25.4, 35.2, 0.24], [-31.9, 36.6, 0.28], [-24.2, 36.9, 0.3], [-32.9, 36.2, 0.4], [-23.0, 36.4, 0.36], [-33.1, 39.6, 0.3], [-24.4, 40.1, 0.26], [-26.0, 34.0, 0.34], [-30.3, 33.9, 0.3]].forEach(([x, z, r], k) => { q = ico(r, 1, 9100 + k, r * 0.14); q.scale(1.25, 0.5, 1); q.rotateY(R(k, 31) * 6); q.translate(x, r * 0.12, z); L.push(fac(q, (cx, cy, cz, i) => (cy > r * 0.3 && hash(i, 9100 + k) > 0.45 ? tone('#7f9a5e', i, 0.4) : shadeY('#9a968a', cy, 0, r * 0.5, i + k, 0.4)), 9100 + k)); });
  /* glowing moon caps among the willow's roots */
  [[0.9, 0.5], [-0.95, 0.3], [-0.6, -0.9], [0.75, -0.75], [1.3, -0.1], [-1.25, -0.35]].forEach(([dx, dz], k) => { const h = 0.12 + R(k, 41) * 0.1; q = new T.CylinderGeometry(0.022, 0.03, h, 5); q.translate(tx + dx, h / 2, tz + dz); L.push(fac(q, '#f3ead8', 9200 + k)); q = ico(0.085, 1, 9210 + k); q.scale(1, 0.62, 1); q.translate(tx + dx, h + 0.03, tz + dz); L.push(fac(q, (cx, cy, cz, i) => new T.Color(i % 4 === 0 ? '#ffffff' : '#bfe9ff'), 9210 + k)); });
  heronMesh(L, g, true);
  /* the tree, and the golden moon lily at its roots (a bud until the choir has sung) */
  const tree = HR.tree = new T.Group(); tree.position.set(tx, 0, tz); g.add(tree); heronWillow(tree); LOOK.solid.push([tx, tz, 0.5]); lookFoot(tx, tz, 2.3, 2.3, 0.3);
  HR.lily = new T.Mesh(new T.BufferGeometry(), MAT); HR.lily.castShadow = true; HR.lily.receiveShadow = false; g.add(HR.lily); HR.lilyO = -1; heronLilySet(heronS().choir ? 1 : 0);
  { const P = []; [[-0.35, 0.25], [0.4, 0.2], [0.05, 0.5]].forEach(([dx, dz], k) => { q = new T.CylinderGeometry(0.3, 0.3, 0.025, 9, 1, false, k * 2, 5.6); q.translate(HERON_LILY[0] + dx, 0.03 + k * 0.012, HERON_LILY[1] + dz); P.push(fac(q, (cx, cy, cz, i) => tone('#5fae5a', i + k, 0.4), 9300 + k)); }); heronMesh(P, g, false); }
  HR.lilyGlow = new T.Sprite(new T.SpriteMaterial({ map: heronGlow(), transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0 })); HR.lilyGlow.position.set(HERON_LILY[0], 0.5, HERON_LILY[1]); HR.lilyGlow.scale.setScalar(2.4); g.add(HR.lilyGlow);
  /* the frogs, biggest in the west: each sits on the far side of its pad and looks out at us */
  HR.frogs = HERON_FROG.map((F, k) => { const f = heronFrog(k), p = HERON.pads[k], dx = HERON_BAY[0] - p[0], dz = HERON_BAY[1] - p[1], l = Math.hypot(dx, dz), o = 0.36 + F[0] * 0.07; f.x = p[0] + dx / l * o; f.z = p[1] + dz / l * o; f.g.position.set(f.x, HERON_Y, f.z); f.g.rotation.y = clamp((HERON_BAY[0] - f.x) * 0.22, -0.5, 0.5); f.r = 0.13 * F[0] + 0.1; g.add(f.g); return f; });
  /* loose fireflies: they wander round the tree, show the order over the frogs, and swirl up the willow when the choir sings */
  { const P = [], n = 54; HR.fl = []; for (let k = 0; k < n; k++) { HR.fl.push({ a: R(k, 51) * 6.28, r: 1.4 + R(k, 52) * 4.4, h: 0.5 + R(k, 53) * 3.2, w: (0.12 + R(k, 54) * 0.25) * (k % 2 ? 1 : -1), ph: R(k, 55) * 6.28 }); P.push(tx, 2, tz); } HR.flies = heronPoints(P, 0.26); sc.add(HR.flies); }
  for (let k = 0; k < 5; k++) { q = new T.RingGeometry(0.86, 1, 28); q.rotateX(-Math.PI / 2); const m = new T.Mesh(q, new T.MeshBasicMaterial({ color: '#f2fff6', transparent: true, opacity: 0, depthWrite: false })); m.visible = false; sc.add(m); HR.rip.push({ m, t: 9 }); }
  /* reeds to gather, and a chest on the east arm */
  HERON_REEDS.forEach(([x, z], k) => { const nd = makeNode('reeds', x, z, 9400 + k); if (fresh) { nd.pop = 0.001; nd.g.scale.setScalar(0.01); } });
  if (!state.isle.chests.r5) makeChest(-23.3, 38.3, { coin: 45, reed: 4, pearl: 1 }, 'r5');
  nightLamp(tx, tz + 1.5, 9.5); if (typeof grMask === 'function' && typeof GR !== 'undefined' && GR.tex) grMask();
  if (fresh) { tree.scale.setScalar(0.01); HR.grow = 0.001; HR.pan = Math.max(HR.pan, 0.001); HR.frogs.forEach((f) => { f.hop = 0.6 + f.s * 0.2; }); }
};
const HERON_REEDS = [[-32.7, 38.5], [-32.4, 40.5], [-23.2, 34.9], [-23.5, 40.9]], HERON_LILY = [HERON.tree[0] + 0.05, HERON.tree[1] + 1.0];
function heronLilySet(o) { if (Math.abs(o - HR.lilyO) < 0.004) return; HR.lilyO = o; const L = []; heronBloom(L, 'moon', o, 0.8, HERON_LILY[0], 0.06, HERON_LILY[1], 9320); if (o > 0.6) L.forEach((p) => { const c = p.attributes.color; for (let i = 0; i < c.count; i++) c.setXYZ(i, c.getX(i) * 1.0, c.getY(i) * 0.93, c.getZ(i) * 0.72); }); const old = HR.lily.geometry; HR.lily.geometry = heronFlat(L); old.dispose(); }
function heronRipple(x, z, s) { const r = HR.rip.find((q) => q.t > 1) || HR.rip[0]; if (!r) return; r.t = 0; r.s = s || 1; r.m.position.set(x, -0.33, z); r.m.visible = true; }
/* a frog sings its note: the croak, and a bell over it so the tune can be heard */
function heronCroak(k, soft) { const f = HR.frogs[k]; if (!f) return; f.croak = 1; Snd.play('buzz', { gain: soft ? 0.4 : 0.75, f: HERON_NOTE[k] / 2, dur: 0.26 }); Snd.play('ding', { gain: soft ? 0.3 : 0.55, f: HERON_NOTE[k] }); heronRipple(HERON.pads[k][0], HERON.pads[k][1], 1.1); }
function heronChoirStep(dt, near) {
  const S = heronS(), p = pip.position, F = HR.frogs;
  /* which pad Pip stands on: he has to be out on the pad itself, off the bank */
  let on = -1; if (near && !HR.busy && !SC.ride && p.y < -0.12) F.forEach((f, k) => { const q = HERON.pads[k]; if (Math.hypot(p.x - q[0], p.z - q[1]) < q[2]) on = k; });
  if (on !== HR.on) { HR.on = on; if (on >= 0 && !HR.sing) { heronCroak(on); HR.idle = 0; HR.demo = null;
    if (!S.choir) { if (on === HERON_ORDER[HR.prog]) { F[on].lit = 1; HR.prog++; if (HR.prog >= HERON_ORDER.length) { HR.sing = { t: -0.7, k: -1 }; HR.prog = 0; } }
      else { HR.prog = 0; F.forEach((f, k) => { f.lit = 0; f.hop = 0.001 - k * 0.07; }); Snd.play('pop', { gain: 0.3, f: 420 }, 0.2); Snd.play('pop', { gain: 0.3, f: 360 }, 0.32); HR.idle = 2.2; } } } }
  /* the fireflies show the order: one frog after the other, then a rest, for as long as Pip has not begun */
  if (!S.choir && !HR.sing && near) { HR.idle += dt; if (!HR.demo && HR.idle > (HR.prog ? 9 : 3.4)) { HR.demo = { k: 0, t: 0 }; HR.prog = 0; F.forEach((f) => { f.lit = 0; }); }
    const D = HR.demo; if (D) { D.t += dt; if (D.t > 0.45 && !D.sung) { D.sung = 1; heronCroak(HERON_ORDER[D.k], true); } if (D.t > 1.15) { D.k++; D.t = 0; D.sung = 0; if (D.k >= HERON_ORDER.length) { HR.demo = null; HR.idle = 0; } } } }
  else if (!near) { HR.demo = null; HR.idle = 2; }
  /* the whole choir sings: the tune, a last chord, the fireflies go up the willow, the golden lily opens */
  const G = HR.sing; if (G) { G.t += dt; const k = Math.floor(G.t / 0.27);
    if (G.t >= 0 && k !== G.k && k < HERON_TUNE.length) { G.k = k; const q = HERON_TUNE[k]; heronCroak(q, true); F[q].hop = 0.001; F.forEach((f) => { f.lit = 1; }); }
    if (k >= HERON_TUNE.length + 1 && !G.chord) { G.chord = 1; [0, 2, 4].forEach((q) => heronCroak(q)); F.forEach((f) => { f.hop = 0.001; }); Snd.play('sparkle', { gain: 0.5 }, 0.2); HR.swirl = 0.001; }
    if (G.chord && G.t > HERON_TUNE.length * 0.27 + 2.6 && !G.given) { G.given = 1; S.choir = 1; HR.lilNew = true; xpGain(40); goldGive('lily'); save(); }
    if (G.given && G.t > HERON_TUNE.length * 0.27 + 5) { HR.sing = null; F.forEach((f) => { f.lit = 0; }); } }
  if (HR.swirl) { HR.swirl += dt; heronLilySet(clamp((HR.swirl - 1.2) / 1.6, 0, 1)); if (HR.swirl > 6.5) HR.swirl = 0; }
  F.forEach((f, k) => { f.croak = Math.max(0, f.croak - dt * 2.6); const c = f.croak, puff = Math.sin(Math.min(1, c) * Math.PI); f.sac.scale.setScalar(0.45 + puff * 1.25 + (reduced ? 0 : Math.sin(time * 2.2 + k) * 0.05)); f.b.scale.set(1 + puff * 0.06, 1 - puff * 0.1, 1 + puff * 0.04);
    if (f.hop) { f.hop += dt; const u = f.hop / 0.5; f.g.position.y = HERON_Y + (u > 0 && u < 1 ? Math.sin(u * Math.PI) * 0.34 : 0); if (u >= 1) { f.hop = 0; heronRipple(f.x, f.z, 0.7); } }
    const D = HR.demo, want = (D && HERON_ORDER[D.k] === k && D.t > 0.3) || f.lit ? 1 : 0; f.glow.material.opacity += (want * (0.85 + (reduced ? 0 : Math.sin(time * 9 + k) * 0.12)) - f.glow.material.opacity) * Math.min(1, dt * 8); f.glow.visible = f.glow.material.opacity > 0.02;
    /* a frog is in the way like a stone */
    const dx = p.x - f.x, dz = p.z - f.z, d = Math.hypot(dx, dz), rr = f.r + 0.2; if (d < rr && d > 1e-4 && !HR.busy && !SC.ride) { p.x = f.x + dx / d * rr; p.z = f.z + dz / d * rr; } });
}
function heronFliesStep(dt, near) {
  const [tx, tz] = HERON.tree, dusk = heronDusk(), day = 0.42 + 0.58 * dusk, P = HR.flies.geometry.attributes.position, C = HR.flies.geometry.attributes.color, D = HR.demo, sw = HR.swirl || 0;
  HR.flies.material.size = 0.22 + 0.3 * dusk; HR.flies.visible = !inCave;
  HR.fl.forEach((f, k) => { let x, y, z; const t = reduced ? 0 : time;
    if (sw && sw < 6) { const u = ((sw / 3.2 + f.ph / 6.28) % 1), a = f.a + sw * 3.2 + u * 9, r = 2.6 - u * 1.5 + Math.sin(u * 20 + k) * 0.15; x = tx + Math.cos(a) * r; z = tz + Math.sin(a) * r; y = 0.2 + u * 5.6; }
    else if (D && k < 16) { const fr = HR.frogs[HERON_ORDER[D.k]], a = f.ph + t * 5; x = fr.x + Math.cos(a) * 0.28 * fr.s * 0.6; z = fr.z + Math.sin(a) * 0.28 * fr.s * 0.6; y = HERON_Y + 0.25 * fr.s + 0.25 + Math.sin(t * 7 + k) * 0.08; }
    else if (heronS().choir && k < 12) { const a = f.ph + t * 0.9; x = HERON_LILY[0] + Math.cos(a) * (0.5 + (k % 3) * 0.2); z = HERON_LILY[1] + Math.sin(a) * (0.5 + (k % 3) * 0.2); y = 0.5 + (k % 4) * 0.2 + Math.sin(t * 1.7 + k) * 0.12; }
    else { const a = f.a + t * f.w; x = tx + Math.cos(a) * f.r + Math.sin(t * 0.7 + f.ph) * 0.35; z = tz + 0.8 + Math.sin(a) * f.r * 0.85; y = f.h + Math.sin(t * 0.9 + f.ph) * 0.35; }
    const e = Math.min(1, dt * (sw ? 3.2 : 4.5)), o = k * 3; P.array[o] += (x - P.array[o]) * e; P.array[o + 1] += (y - P.array[o + 1]) * e; P.array[o + 2] += (z - P.array[o + 2]) * e;
    const b = day * (reduced ? 0.85 : 0.6 + 0.4 * Math.sin(time * (2 + (k % 5) * 0.6) + f.ph)); C.array[o] = b; C.array[o + 1] = b * 0.96; C.array[o + 2] = b * 0.5; });
  P.needsUpdate = true; C.needsUpdate = true;
  /* the lights in the willow twinkle, a wave running through them; the curtains sway */
  HR.sect.forEach((S, k) => { if (!reduced) { S.g.rotation.x = Math.sin(time * 0.8 + k * 1.1) * 0.022; S.g.rotation.z = Math.cos(time * 0.65 + k * 1.9) * 0.022; }
    const c = S.pts.geometry.attributes.color, up = sw && sw < 6 ? 0.5 : 0; for (let i = 0; i < S.n; i++) { const b = clamp(day * (0.62 + 0.38 * Math.sin(time * (1.3 + (i % 7) * 0.33) + i * 2.4 + k)) + up, 0, 1.3); c.array[i * 3] = b; c.array[i * 3 + 1] = b * 0.95; c.array[i * 3 + 2] = b * 0.45; } c.needsUpdate = true; S.pts.material.size = 0.18 + 0.26 * dusk; });
  HR.lilyGlow.material.opacity = heronS().choir || sw > 1.2 ? (0.3 + 0.4 * dusk) * (reduced ? 1 : 0.85 + Math.sin(time * 2.1) * 0.15) : 0.12 * dusk; HR.lilyGlow.visible = HR.lilyGlow.material.opacity > 0.02;
}

/* ---- the lasting change: moon lilies on every water of the marsh, sparkling by day, with fireflies over them at night ---- */
function heronMarshLilies(A, fresh) {
  const base = 9500 + AREAS.indexOf(A) * 61, L = [], P = [], spots = []; let n = 0;
  for (let k = 0; k < 520 && n < 12; k++) { const x = A.cx + (hash(k, base + 1) - 0.5) * 11.6, z = A.cz + (hash(k, base + 2) - 0.5) * 11.6, d = drawSdf(x, z); if (d < 0.75 || d > 2.4) continue; const B = areaAt(x, z); if (B && B !== A) continue;
    if (A.id === 'r0' && segD(x, z, RAFT.e[0], RAFT.e[1], RAFT.w[0], RAFT.w[1]) < 1.5) continue; if (A.id === 'r2' && Math.hypot(x - HERON.bud[0], z - HERON.bud[1]) < 4) continue; if (spots.some((q) => Math.hypot(q[0] - x, q[1] - z) < 1.25)) continue; n++; spots.push([x, z]);
    const s = 0.5 + hash(k, base + 3) * 0.22; [[0, 0, 0.5], [0.6, 0.25, 0.3], [-0.4, 0.5, 0.26]].forEach(([dx, dz, r], j) => heronSmallPad(L, x + dx, z + dz, r, base + k * 5 + j)); heronBloom(L, 'moon', 0.85 + hash(k, base + 4) * 0.15, s, x, -0.4, z, base + 3000 + k * 60);
    for (let j = 0; j < 4; j++) P.push(x + (hash(k, j + 5) - 0.5) * 1.5, 0.1 + hash(k, j + 6) * 1.1, z + (hash(k, j + 7) - 0.5) * 1.5); }
  if (!n) return { none: 1 };
  const g = new T.Group(); sc.add(g); heronMesh(L, g, false); const pts = heronPoints(P, 0.2); g.add(pts);
  spots.forEach((q, k) => { if (k % 3 === 0) nightLamp(q[0], q[1], 2.9); });
  if (fresh) { g.position.y = -0.6; burst(spots[0][0], 0.4, spots[0][1], 8); Snd.play('sparkle', { gain: 0.35 }, 0, 600); }
  return { g, pts, base: P.slice(), up: fresh ? 0.001 : 0 };
}
function heronMarshStep(dt) {
  if (!heronS().choir || inCave) return; const p = pip.position, dusk = heronDusk();
  HR.lilT -= dt; if (HR.lilT <= 0) { HR.lilT = 0.5; AREAS.forEach((A) => { if (A.biome !== 'marsh' || A.secret || !HAS[A.id] || HR.lil[A.id] || (rising && rising.area === A.id)) return; if (HR.lilNew && Math.hypot(p.x - A.cx, p.z - A.cz) > 13) return; HR.lil[A.id] = heronMarshLilies(A, HR.lilNew); }); }
  Object.keys(HR.lil).forEach((id, q) => { const M = HR.lil[id]; if (M.none) return; if (M.up) { M.up = Math.min(1, M.up + dt * 0.9); const e = M.up * M.up * (3 - 2 * M.up); M.g.position.y = -0.6 * (1 - e); if (M.up >= 1) M.up = 0; }
    const A = AREA_BY[id]; if (Math.hypot(p.x - A.cx, p.z - A.cz) > 26) return; const P = M.pts.geometry.attributes.position, C = M.pts.geometry.attributes.color, B = M.base, t = reduced ? 0 : time;
    for (let i = 0; i < B.length / 3; i++) { const o = i * 3; P.array[o] = B[o] + Math.sin(t * 0.6 + i * 1.7) * 0.5; P.array[o + 1] = B[o + 1] + Math.sin(t * 0.9 + i) * 0.25; P.array[o + 2] = B[o + 2] + Math.cos(t * 0.5 + i * 2.3) * 0.5;
      const b = (0.34 + 0.66 * dusk) * (reduced ? 0.8 : 0.5 + 0.5 * Math.sin(time * (1.6 + (i % 4) * 0.5) + i * 1.3)); C.array[o] = b; C.array[o + 1] = b * 0.96; C.array[o + 2] = b * 0.5; }
    P.needsUpdate = true; C.needsUpdate = true; M.pts.material.size = 0.2 + 0.26 * dusk; });
}

/* ---- every frame ---- */
function heronStep(dt) {
  if (!state.isle) return; const S = heronS(), p = pip.position;
  if (!HR.shore) { if (!HAS.r2) return; heronShoreBuild(); }
  const B = HR.bird; HR.shore.visible = B.g.visible = !inCave; if (inCave) return;
  /* the bud opens, the heron bows, the isle rises; the camera looks over the lake while it does */
  if (S.open && !HAS.r5 && !HR.openT) HR.openT = 1.5;
  if (HR.openT) { HR.openT += dt; heronBudSet(clamp(HR.openT / 1.4, 0, 1) * clamp(HR.openT / 1.4, 0, 1) * (3 - 2 * clamp(HR.openT / 1.4, 0, 1))); HR.bow = Math.sin(clamp((HR.openT - 0.2) / 1.5, 0, 1) * Math.PI);
    if (HR.openT > 0.2 && !HR.pan) HR.pan = 0.001; if (HR.openT > 1.7 && !HAS.r5 && !rising) secretOpen('r5'); if (HAS.r5 && HR.openT > 1.9) { HR.openT = 0; HR.bow = 0; } }
  if ((HR.pan || HR.openT || HR.sing) && xpUpT > 0) xpUpT = Math.max(xpUpT, 0.6); /* a new level waits until the moment is over */
  if (HR.pan) { HR.pan += dt; const u = HR.pan, k = clamp(u / 1.2, 0, 1) * clamp((9 - u) / 1.6, 0, 1), e = k * k * (3 - 2 * k); camFocus.set(p.x + (-28.4 - p.x) * e, p.y, p.z + (35.2 - p.z) * e); if (!HR.panT || u < 1.3) HR.panT = [target.x, target.z]; if (u > 9 || Math.hypot(target.x - HR.panT[0], target.z - HR.panT[1]) > 0.3 || SC.ride) { HR.pan = 0; HR.panT = null; } }
  if (HR.grow) { HR.grow = Math.min(1, HR.grow + dt * 0.55); const u = HR.grow, e = 1 - Math.pow(1 - u, 3); HR.tree.scale.set(e * (1 + Math.sin(u * Math.PI) * 0.06), e * (1 + Math.sin(u * Math.PI) * 0.12), e * (1 + Math.sin(u * Math.PI) * 0.06)); if (HR.grow >= 1) { HR.grow = 0; HR.tree.scale.setScalar(1); } }
  /* the heron: where it stands, how it turns its head, and its flights */
  heronBusy(dt);
  const side = heronSide(p.x, p.z);
  if (HAS.r5 && !HR.busy && !SC.ride && !rising && !HR.openT && side !== HR.at && !enSleep) heronSolo(side);
  if (!HR.busy) { const want = heronFace(HR.at); let d = want - HR.rot; d = Math.atan2(Math.sin(d), Math.cos(d)); HR.rot += d * Math.min(1, dt * 3); B.g.rotation.y = HR.rot; B.g.position.y = 0; HR.fly = Math.max(0, HR.fly - dt * 3);
    /* it looks at Pip when Pip comes near, then back at its bud */
    const dx = p.x - B.g.position.x, dz = p.z - B.g.position.z, nearB = Math.hypot(dx, dz) < 4.5, look = nearB && (S.open || Math.sin(time * 0.8) > -0.2) ? clamp(Math.atan2(Math.sin(Math.atan2(dx, dz) - HR.rot), Math.cos(Math.atan2(dx, dz) - HR.rot)), -1.3, 1.3) : (reduced ? 0 : Math.sin(time * 0.37) * 0.25);
    B.head.rotation.y += (look * 0.6 - B.head.rotation.y) * Math.min(1, dt * 4); B.neck.rotation.y += (look * 0.4 - B.neck.rotation.y) * Math.min(1, dt * 4); if (!HR.openT && !S.open && nearB) HR.bow += ((Math.sin(time * 0.8) < -0.4 ? 0.35 : 0) - HR.bow) * Math.min(1, dt * 3); else if (!HR.openT) HR.bow += (0 - HR.bow) * Math.min(1, dt * 4); }
  else { B.head.rotation.y *= 0.9; B.neck.rotation.y *= 0.9; }
  heronPose(B, HR.fly, HR.bow, dt);
  heronMarshStep(dt);
  if (!HAS.r5) return;
  /* the marsh's south bank ends in a drop now: not to its very edge */
  if (!SC.ride && !HR.busy && p.x > -34.2 && p.x < -21.8 && p.z > 29.76 && p.z <= 30.05) p.z = 29.76;
  if (!HR.g) return;
  const near = side === 1 || Math.hypot(p.x + 28, p.z - 36) < 16;
  /* out on a pad Pip stands lower, at the water */
  if (side && !SC.ride && !HR.busy) { const d = gSdf(p.x, p.z), y = HERON_Y * sstep(-0.12, 0.26, d); p.y = y; if (d > 0.2) { if (!HR.wet) { HR.wet = 1; heronRipple(p.x, p.z, 0.9); Snd.play('pop', { gain: 0.16, f: 300 }, 0, 250); } } else HR.wet = 0; }
  HR.rip.forEach((r) => { if (r.t > 1) { r.m.visible = false; return; } r.t += dt * 1.1; r.m.scale.setScalar(r.s * (0.5 + r.t * 1.1)); r.m.material.opacity = 0.5 * (1 - r.t); });
  if (near) { heronChoirStep(dt, side === 1); heronFliesStep(dt, near); }
}
ISLE_STEPS.push(heronStep);
