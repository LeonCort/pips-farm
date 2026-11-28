/* ---------- the Sea Garden (coral island, area c5): a hidden world (secret.js says how they plug in) ----------
   On the north shore of the lagoon square (c3) stands a diver's stand with the bare frame of a brass helmet, and out in
   the water the top of a sunken mast sticks out of the sea, with bubbles and a glint of gold below. The helmet wants
   copper from the mine and crystals. Paid, Pip gets the diving helmet and the sea floor north of the lagoon opens: a
   garden under water, with a wreck in the middle. A sea turtle carries Pip there and back from the rope ring by the stand.
   The place is ordinary risen ground; what makes it read as the sea floor is all in this file: a sheet of water 4 m up
   that the camera looks down through, walls of water round the square between reef rocks, rippled pale sand with light
   patterns drifting over it, shafts of light, kelp that sways, fish in schools overhead and bubbles everywhere.
   The toy: bubble clams. Step beside one and it blows a bubble round Pip that floats up to the next ledge of the wreck:
   crates, a balcony, the deck, where the golden ship's bell hangs. The spotted clam by the bow is the joker: its bubble
   only bobs up, pops with a giggle and sets Pip down again. Walking off a ledge floats Pip back to the sand.
   After the bell: little turtles swim round the lagoon, fish jump in the bay, and every clam on the coral beaches
   gleams and gives one pearl more.
   state.isle.seagarden = { helm: 1 } once the helmet is paid; the bell is state.isle.gold.shipbell. */
const SGX = 52, SGZ = -4, SG_TOP = 4.0; /* the middle of c5, and how high the water stands over it */
const SG_AT = { stand: [54.9, 7.45], sign: [56.05, 7.3], ringOut: [53.6, 7.0], back: [53.9, 8.0], sea: [53.4, 5.0], rest: [51.4, -0.6], ringIn: [50.1, -0.3], land: [52.6, -0.9], mast: [51.5, -5.2], fore: [56.35, 1.0], bell: [54.3, -4.6], chest: [54.5, -3.9] };
const SG_HULL = { x0: 48.6, x1: 55.6, z: -4.6, hw: 1.3, deck: 1.8 };
const SG_BOX = [{ x: 52.1, z: -4.65, w: 7.2, d: 2.7 }, { x: 50.3, z: -2.8, w: 2.2, d: 1.0 }, { x: 52.7, z: -2.9, w: 2.0, d: 0.8 }]; /* what Pip walks round on the sand: the hull and the two ledges */
const SG_LEDGE = [{ x0: 49.2, x1: 51.4, z0: -3.2, z1: -2.35, h: 0.6 }, { x0: 51.7, x1: 53.7, z0: -3.25, z1: -2.55, h: 1.2 }, { x0: 50.5, x1: 54.9, z0: -5.3, z1: -3.8, h: 1.8 }];
/* the bubble clams: where each lies, the level it lies on (-1 the sand), and where its bubble sets Pip down */
/* a ledge is handed to the rock tables' own walking rules (mesa.js: MS.on) while Pip stands on it, so every other step of the frame sees Pip at that height */
SG_LEDGE.forEach((L) => { L.x = (L.x0 + L.x1) / 2; L.z = (L.z0 + L.z1) / 2; L.w = L.x1 - L.x0 + 0.34; L.d = L.z1 - L.z0 + 0.34; L.y0 = 0; L.lx = 0; L.par = null; L.sg = 1; });
const sgOn = (L) => { SG.on = L; MS.on = L; MS.want = null; };
const SG_CLAMS = [{ x: 48.4, z: -2.75, lv: -1, to: 0, at: [49.75, -2.8] }, { x: 50.9, z: -2.8, lv: 0, to: 1, at: [52.2, -2.9] }, { x: 53.25, z: -2.9, lv: 1, to: 2, at: [53.1, -4.5] }, { x: 56.2, z: -1.5, lv: -1, to: -1, joke: 1 }];
const SG_SOLID = [[48.4, -2.75, 0.5], [56.2, -1.5, 0.52], [49.4, 0.2, 0.62], [52.2, 0.3, 0.55]]; /* clams Pip walks round on the sand: [x, z, r] */
const SG = { g: null, pop: 0, out: null, on: null, bub: null, trip: null, clams: [], fish: [], t: 0, mats: [], uT: { value: 0 }, bellT: 0, bellArm: true, seen: {} };
const sgS = () => state.isle.seagarden || (state.isle.seagarden = {});
const sgBell = () => !!golds().shipbell;
const sgIn = (x, z) => Math.abs(x - SGX) < 5.3 && z > SGZ - 5.6 && z < SGZ + 5.3;
ISLE_KEEPS.push((a, x, z) => a.id === 'c3' && Math.hypot(x - 54.7, z - 7.4) < 2.5);
ISLE_KEYS.push({ id: 'seahelm', ok: () => !!HAS.c3 && !sgS().helm, x: SG_AT.sign[0], z: SG_AT.sign[1], cost: { copper: 4, crystal: 12 }, open: () => sgOpen() });
SECRET_FILL.c5 = (A, fresh) => sgFill(A, fresh);

/* ---- pictures ---- */
ISLE_ICON.seahelm = (x) => {
  x.beginPath(); x.roundRect(-17, 11, 34, 10, 4); x.fillStyle = '#c98a35'; x.fill(); x.stroke();
  x.beginPath(); x.arc(0, -3, 17, 0, 7); x.fillStyle = '#e9b04c'; x.fill(); x.stroke();
  x.beginPath(); x.roundRect(-4, -25, 8, 6, 2); x.fillStyle = '#c98a35'; x.fill(); x.stroke();
  x.beginPath(); x.arc(0, -2, 10.5, 0, 7); x.fillStyle = '#bfe9f5'; x.fill(); x.stroke();
  x.beginPath(); x.arc(-3, -5, 4, 3.4, 5.2); x.lineWidth = 2.5; x.strokeStyle = '#ffffff'; x.stroke();
  x.fillStyle = '#8a5a22'; [[-14, -9], [14, -9], [-12, 8], [12, 8]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 1.7, 0, 7); x.fill(); });
};
ISLE_ICON.seaturtle = (x) => {
  x.fillStyle = '#7fc46a'; [[-15, -11, -0.7], [15, -11, 0.7], [-13, 12, 0.6], [13, 12, -0.6]].forEach(([a, b, r]) => { x.save(); x.translate(a, b); x.rotate(r); x.beginPath(); x.ellipse(0, 0, 4.5, 9, 0, 0, 7); x.fill(); x.stroke(); x.restore(); });
  x.beginPath(); x.arc(0, -17, 6.5, 0, 7); x.fill(); x.stroke();
  x.beginPath(); x.ellipse(0, 1, 14, 16, 0, 0, 7); x.fillStyle = '#3f9a6a'; x.fill(); x.stroke();
  x.lineWidth = 1.8; x.strokeStyle = '#2c6f4c'; x.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283; x.lineTo(Math.cos(a) * 6.5, 1 + Math.sin(a) * 7.5); } x.closePath(); x.stroke();
  for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283; x.beginPath(); x.moveTo(Math.cos(a) * 6.5, 1 + Math.sin(a) * 7.5); x.lineTo(Math.cos(a) * 13, 1 + Math.sin(a) * 15); x.stroke(); }
  x.fillStyle = '#22303c'; x.beginPath(); x.arc(-2.5, -18.5, 1.3, 0, 7); x.arc(2.5, -18.5, 1.3, 0, 7); x.fill();
};

/* ---- small makers ---- */
const sgFlat = (L, parent, mat) => { const m = merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), mat || MAT, parent); return m; };
const sgPut = (L, q, col, seed, x, y, z) => { const g = fac(q, col, seed); g.translate(x || 0, y || 0, z || 0); L.push(g); return g; };
function sgBasic(o) { const m = new T.MeshBasicMaterial(Object.assign({ transparent: true, depthWrite: false }, o)); m.userData.c0 = m.color.clone(); m.userData.o0 = m.opacity; SG.mats.push(m); return m; }
/* the light patterns water throws on sand: bright seams between soft cells, made to tile */
function sgCaustic() {
  if (SG.cau) return SG.cau; const N = 128, c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d'), I = x.createImageData(N, N), P = [];
  for (let k = 0; k < 15; k++) P.push([hash(k, 7711) * N, hash(k, 7712) * N]);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { let a = 1e9, b = 1e9;
    for (const p of P) { let dx = Math.abs(i - p[0]), dy = Math.abs(j - p[1]); dx = Math.min(dx, N - dx); dy = Math.min(dy, N - dy); const d = Math.sqrt(dx * dx + dy * dy); if (d < a) { b = a; a = d; } else if (d < b) b = d; }
    const e = clamp(1 - (b - a) / 9, 0, 1), v = Math.round(255 * e * e * e), o = (j * N + i) * 4; I.data[o] = I.data[o + 1] = I.data[o + 2] = v; I.data[o + 3] = 255; }
  x.putImageData(I, 0, 0); const t = SG.cau = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; return t;
}
function sgGrad(stops, w) { const c = document.createElement('canvas'); c.width = w || 8; c.height = 128; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 128); stops.forEach((s) => g.addColorStop(s[0], s[1])); x.fillStyle = g; x.fillRect(0, 0, c.width, 128);
  if (w) { x.globalCompositeOperation = 'destination-in'; const h = x.createLinearGradient(0, 0, w, 0); h.addColorStop(0, 'rgba(0,0,0,0)'); h.addColorStop(0.5, 'rgba(0,0,0,1)'); h.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = h; x.fillRect(0, 0, w, 128); }
  return new T.CanvasTexture(c); }
function sgStar() { if (SG.star) return SG.star; const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.translate(32, 32); const g = x.createRadialGradient(0, 0, 1, 0, 0, 30); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,240,170,0.7)'); g.addColorStop(1, 'rgba(255,220,120,0)'); x.fillStyle = g;
  for (let k = 0; k < 4; k++) { x.rotate(Math.PI / 4); x.beginPath(); x.ellipse(0, 0, k % 2 ? 30 : 16, 3.2, 0, 0, 7); x.fill(); } x.beginPath(); x.arc(0, 0, 8, 0, 7); x.fill(); SG.star = new T.CanvasTexture(c); return SG.star; }
/* the material of everything that sways in the current: kelp, anemones, soft corals */
function sgSwayMat() {
  const m = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0, side: T.DoubleSide });
  m.onBeforeCompile = function (sh, r) { if (typeof MAT.onBeforeCompile === 'function') MAT.onBeforeCompile.call(MAT, sh, r); sh.uniforms.uSgT = SG.uT;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uSgT;').replace('#include <begin_vertex>', '#include <begin_vertex>\nfloat sgH = max(0.0, position.y - 0.05);\ntransformed.x += (sin(uSgT * 1.15 + position.x * 0.9 + position.z * 1.7 + position.y * 1.3) * 0.07 + sin(uSgT * 0.5 + position.z * 0.6) * 0.04) * sgH;\ntransformed.z += cos(uSgT * 0.9 + position.x * 1.3 + position.y * 1.1) * 0.045 * sgH;'); };
  return m;
}

/* ---- pieces of the garden (all in the garden's own space: 0, 0 is the middle of the square) ---- */
const SG_ROCK = ['#3b6670', '#467a80', '#34595f', '#52878a'], SG_CORAL = ['#ff7f8f', '#ff9a4d', '#c79cf5', '#ffd84d', '#ff6f9f', '#5fd6c9', '#f36f5c'];
function sgRock(L, x, z, r, h, sd) {
  const q = ico(r, 1, sd, r * 0.2); q.scale(1, h / (1.6 * r), 1); q.rotateY(hash(sd, 2) * 6);
  sgPut(L, q, (cx, cy, cz, i) => { const k = hash(i, sd), up = clamp(cy / Math.max(0.6, h * 0.62) * 0.5 + 0.5, 0, 1); const c = tone(SG_ROCK[(i + sd) % 4], i, 0.5).multiplyScalar(0.62 + 0.6 * up);
    if (k > 0.9) c.lerp(new T.Color(SG_CORAL[(i + sd) % 7]), 0.6); else if (k < 0.12) c.lerp(new T.Color('#6fae7c'), 0.5); return c; }, sd, x, h * 0.3, z);
}
function sgBranch(L, x, y, z, s, col, sd) { /* a branching coral: stubby arms with pale tips */
  for (let j = 0; j < 6; j++) { const h = (0.3 + hash(sd, j + 20) * 0.34) * s, rz = (hash(sd, j + 30) - 0.5) * 1.3, rx = (hash(sd, j + 40) - 0.5) * 1.3;
    let q = new T.CylinderGeometry(0.05 * s, 0.085 * s, h, 5); q.translate(0, h / 2, 0); q.rotateZ(rz); q.rotateX(rx); sgPut(L, q, (cx, cy, cz, i) => tone(col, i, 0.3).multiplyScalar(0.8 + 0.25 * clamp(cy / h, 0, 1)), sd + j, x, y, z);
    q = ico(0.09 * s, 0, sd + j + 50); q.translate(0, h, 0); q.rotateZ(rz); q.rotateX(rx); sgPut(L, q, () => tone(col, j, 0.3).lerp(new T.Color('#ffffff'), 0.35), sd + j, x, y, z); }
}
function sgBrain(L, x, y, z, r, col, sd) { const q = ico(r, 1, sd, r * 0.1); q.scale(1.15, 0.72, 1.05); sgPut(L, q, (cx, cy, cz, i) => tone(col, i, 0.4).multiplyScalar(i % 3 ? 1 : 0.86).multiplyScalar(0.75 + 0.35 * clamp(cy / r + 0.5, 0, 1)), sd, x, y + r * 0.45, z); }
function sgFan(L, x, y, z, r, ry, col, sd) { /* a sea fan: a flat ribbed disc on a short stem */
  let q = new T.CylinderGeometry(r, r * 0.25, r * 1.5, 7, 3, true, -1.25, 2.5); q.scale(1, 1, 0.12); q.translate(0, r * 0.95, 0); q.rotateY(ry);
  const g = fac(q, (cx, cy, cz, i) => tone(col, i, 0.3).multiplyScalar((i >> 1) % 2 ? 1 : 0.8), sd); g.translate(x, y, z); L.push(g);
  const b = g.clone(); { const P = b.attributes.position, Nn = b.attributes.normal; for (let i = 0; i < P.count; i += 3) { const a = [P.getX(i), P.getY(i), P.getZ(i)], c = [P.getX(i + 2), P.getY(i + 2), P.getZ(i + 2)]; P.setXYZ(i, c[0], c[1], c[2]); P.setXYZ(i + 2, a[0], a[1], a[2]); } for (let i = 0; i < Nn.count; i++) Nn.setXYZ(i, -Nn.getX(i), -Nn.getY(i), -Nn.getZ(i)); } L.push(b);
  q = new T.CylinderGeometry(0.04, 0.06, r * 0.4, 5); sgPut(L, q, col, sd + 1, x, y + r * 0.2, z);
}
function sgTubes(L, x, y, z, s, col, sd) { for (let j = 0; j < 4; j++) { const h = (0.35 + hash(sd, j) * 0.4) * s, a = j * 1.7 + hash(sd, 9), q = new T.CylinderGeometry(0.1 * s, 0.07 * s, h, 7, 1, true); q.translate(Math.cos(a) * 0.13 * s, h / 2, Math.sin(a) * 0.13 * s); q.rotateZ((hash(sd, j + 4) - 0.5) * 0.4);
  const g = fac(q, (cx, cy, cz, i) => tone(col, i, 0.3).multiplyScalar(0.72 + 0.4 * clamp(cy / h, 0, 1)), sd + j); g.translate(x, y, z); L.push(g); const b = new T.CylinderGeometry(0.085 * s, 0.085 * s, 0.02, 7); b.translate(Math.cos(a) * 0.13 * s, h * 0.86, Math.sin(a) * 0.13 * s); sgPut(L, b, '#3a2c3c', sd, x, y, z); } }
function sgAnemone(L, S, x, y, z, s, col, tip, sd) { /* a stubby foot (still) and a crown of arms (they sway) */
  let q = new T.CylinderGeometry(0.2 * s, 0.26 * s, 0.24 * s, 9); sgPut(L, q, (cx, cy, cz, i) => tone(col, i, 0.3).multiplyScalar(0.7), sd, x, y + 0.12 * s, z);
  for (let j = 0; j < 14; j++) { const a = j / 14 * 6.283 + hash(sd, j) * 0.3, rr = (j % 2 ? 0.17 : 0.09) * s, h = (0.3 + hash(sd, j + 20) * 0.16) * s; q = new T.CylinderGeometry(0.018 * s, 0.04 * s, h, 4); q.translate(0, h / 2, 0); q.rotateZ(-(j % 2 ? 0.55 : 0.2)); q.rotateY(-a); q.translate(Math.cos(a) * rr, 0.22 * s, Math.sin(a) * rr);
    const g = fac(q, (cx, cy, cz, i) => tone(col, i, 0.25).lerp(new T.Color(tip), clamp((cy - 0.22 * s) / h, 0, 1) * 0.9), sd + j); g.translate(x, y, z); S.push(g); }
}
function sgKelp(S, x, z, h, sd) { /* one stalk with blades to both sides; the sway comes from the material */
  const n = Math.max(4, Math.round(h / 0.36)), st = h / n, lean = (hash(sd, 1) - 0.5) * 0.25;
  for (let k = 0; k < n; k++) { const y = k * st, u = k / n, ox = lean * y; let q = new T.CylinderGeometry(0.028, 0.034, st * 1.04, 4); q.translate(ox, y + st / 2, 0);
    S.push((() => { const g = fac(q, (cx, cy, cz, i) => tone('#55803c', i, 0.3).multiplyScalar(0.75 + 0.4 * u), sd + k); g.translate(x, 0, z); return g; })());
    const side = k % 2 ? 1 : -1, len = (0.5 + hash(sd, k + 10) * 0.28) * (1 - u * 0.35); q = new T.ConeGeometry(0.1, len, 4); q.scale(1, 1, 0.22); q.translate(0, len / 2, 0); q.rotateZ(-side * (0.75 + hash(sd, k + 30) * 0.4)); q.rotateY(hash(sd, k + 50) * 1.2 - 0.6); q.translate(ox, y + st * 0.6, 0);
    const col = u > 0.6 ? '#a9c44f' : u > 0.3 ? '#7fae45' : '#5c9440'; S.push((() => { const g = fac(q, (cx, cy, cz, i) => tone(col, i + k, 0.35), sd + k + 70); g.translate(x, 0, z); return g; })()); }
  const q = ico(0.07, 0, sd + 99); q.scale(1, 1.5, 1); q.translate(lean * h, h + 0.05, 0); S.push((() => { const g = fac(q, '#d9d36a', sd); g.translate(x, 0, z); return g; })());
}
/* a giant clam: the bowl lies still, the lid is its own mesh so it can open */
function sgClamGeo(col, lip, spots) {
  const half = (top) => { const q = new T.SphereGeometry(0.5, 24, 5, 0, 6.283, top ? 0 : Math.PI / 2, Math.PI / 2); const P = q.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i), a = Math.atan2(z, x), rim = 1 - Math.abs(y) / 0.5, w = 1 + Math.sin(a * 6) * 0.13 * rim; P.setXYZ(i, x * w * 1.2, y * (top ? 0.5 : 0.62) + Math.sin(a * 6) * 0.07 * rim * rim, z * w * 0.95); } return q; };
  const paint = (top) => (cx, cy, cz, i) => { const edge = Math.abs(cy) < 0.07; if (edge) return tone(lip, i, 0.2); const c = tone(col, i, 0.3).multiplyScalar(Math.sin(Math.atan2(cz, cx) * 6) > 0 ? 1.06 : 0.8); if (spots && hash(i, 77) > 0.7) c.lerp(new T.Color('#fff6e4'), 0.75); return c; };
  const base = [fac(half(false), paint(false), 3101)]; base[0].translate(0, 0.33, 0);
  let q = new T.CylinderGeometry(0.5, 0.42, 0.06, 12); q.scale(1.1, 1, 0.86); base.push(sgPut([], q, (cx, cy, cz, i) => tone('#4fd6d0', i, 0.5), 3102, 0, 0.3, 0)); /* the soft mantle inside */
  q = new T.SphereGeometry(0.15, 10, 7); base.push(sgPut([], q, (cx, cy) => new T.Color(cy > 0.03 ? '#ffffff' : '#dfe9f7'), 3103, 0, 0.4, 0.06));
  const lid = fac(half(true), paint(true), 3104); lid.translate(0, 0, 0.47); /* hinged at the back: its own space starts at the hinge */
  return { base: sgFlat(base, new T.Group()).geometry, lid };
}
function sgClam(par, x, y, z, s, ry, kind) {
  const G = SG.clamGeo || (SG.clamGeo = { a: sgClamGeo('#9a86e6', '#ffd75a'), b: sgClamGeo('#ff8fb0', '#fff0c8'), j: sgClamGeo('#5fc9e6', '#ffd75a', 1) }), K = G[kind || 'a'];
  const g = new T.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; g.scale.setScalar(s); const b = new T.Mesh(K.base, MAT); b.castShadow = b.receiveShadow = true; g.add(b);
  const h = new T.Group(); h.position.set(0, 0.36, -0.47); const l = new T.Mesh(K.lid, sgTwo()); l.castShadow = true; h.add(l); g.add(h); par.add(g); return { g, lid: h, x, z, open: 0.3, want: 0.3 };
}
/* the top of the mast with its tattered flag: seen sticking out of the sea before the garden opens, and over the water after */
function sgMastTop(L, x, y, z) {
  let q = new T.CylinderGeometry(0.07, 0.1, 2.3, 7); sgPut(L, q, (cx, cy, cz, i) => shadeY('#8a6a4c', cy, -1.2, 1.2, i, 0.4), 3201, x, y - 1.15, z);
  q = new T.CylinderGeometry(0.3, 0.24, 0.26, 8, 1, true); sgPut(L, q, (cx, cy, cz, i) => tone(i % 2 ? '#a8855e' : '#8f6f4c', i, 0.3), 3202, x, y - 1.25, z); q = new T.CylinderGeometry(0.24, 0.24, 0.04, 8); sgPut(L, q, '#7a5c40', 3203, x, y - 1.37, z);
  q = new T.CylinderGeometry(0.035, 0.045, 1.7, 5); q.rotateZ(1.32); sgPut(L, q, '#7a5c40', 3204, x + 0.1, y - 0.78, z);
  q = ico(0.085, 0, 3205); sgPut(L, q, '#f2c23c', 3205, x, y + 0.06, z);
  [[0.34, -0.9, 0.5, 0.14], [-0.5, -0.95, 0.42, -0.1], [0.62, -1.02, 0.3, 0.2]].forEach(([dx, dy, h, r], k) => { q = new T.BoxGeometry(0.3, h, 0.02); q.rotateZ(r); sgPut(L, q, (cx, cy, cz, i) => tone('#e9dcc0', i + k, 0.4).multiplyScalar(0.8 + 0.2 * hash(i, k)), 3206 + k, x + dx, y + dy - h / 2, z + 0.02); }); /* scraps of sail */
}
function sgFlagGeo() { const L = []; for (let k = 0; k < 4; k++) { const w = 0.2, h = 0.42 - k * 0.07 - (k === 3 ? 0.1 : 0), q = new T.BoxGeometry(w, h, 0.02); q.translate(0.1 + k * w, (k % 2 ? -0.03 : 0.02) - (0.42 - h) / 4, 0); L.push(fac(q, (cx, cy, cz, i) => tone(k % 2 ? '#fff6e4' : '#e0503c', i, 0.25), 3210 + k)); } return sgFlat(L, new T.Group()).geometry; }
/* the broken-off fore mast, standing in the sand at the south rim: its top is what shows over the sea before the garden opens */
function sgFore() { const g = new T.Group(), L = []; const q = new T.CylinderGeometry(0.1, 0.16, 4.3, 8); sgPut(L, q, (cx, cy, cz, i) => shadeY('#8a6a4c', cy, -2.2, 2.2, i, 0.4).lerp(new T.Color('#4f9a86'), cy < -1 ? 0.3 : 0), 3215, 0, 2.1, 0); sgMastTop(L, 0, 6.3, 0); sgFlat(L, g).castShadow = true; g.userData.flag = sgFlag(g, 0.02, 6.1, 0); g.rotation.set(-0.05, 0, 0.07); return g; }
function sgFlag(par, x, y, z) { const m = new T.Mesh(SG.flagGeo || (SG.flagGeo = sgFlagGeo()), sgTwo()); m.position.set(x, y, z); m.castShadow = true; par.add(m); return m; }

/* the wreck: a lofted hull lying east-west, a hole in its side by the bow, a deck, a stern castle, a leaning mast */
function sgWreck(L, GL) {
  const H = SG_HULL, x0 = H.x0 - SGX, x1 = H.x1 - SGX, zc = H.z - SGZ, N = 16, rows = [[-0.12, 0.34], [0.55, 0.84], [1.15, 0.97], [H.deck, 1.0]];
  const hw = (t) => H.hw * (t < 0.1 ? 0.82 + 0.18 * t / 0.1 : t > 0.78 ? 1 - Math.pow((t - 0.78) / 0.22, 2) * 0.96 : 1), dy = (t) => (t > 0.9 ? (t - 0.9) / 0.1 * 0.45 : 0);
  const P = [], tri = (a, b, c) => { P.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); }, quad = (a, b, c, d, flip) => { if (flip) { tri(a, c, b); tri(a, d, c); } else { tri(a, b, c); tri(a, c, d); } };
  const hole = (xa, xb, r) => r < 2 && xa + SGX > 53.8 && xb + SGX < 55.25;
  for (let k = 0; k < N; k++) { const ta = k / N, tb = (k + 1) / N, xa = x0 + (x1 - x0) * ta, xb = x0 + (x1 - x0) * tb;
    for (const s of [1, -1]) for (let r = 0; r < 3; r++) { if (s > 0 && hole(xa, xb, r)) continue; const [ya, fa] = rows[r], [yb, fb] = rows[r + 1], top = r === 2 ? 1 : 0;
      quad([xa, ya, zc + s * (hw(ta) * fa + 0.04)], [xb, ya, zc + s * (hw(tb) * fa + 0.04)], [xb, yb + top * dy(tb), zc + s * hw(tb) * fb], [xa, yb + top * dy(ta), zc + s * hw(ta) * fb], s < 0); }
    for (let j = 0; j < 8; j++) { const fa = 1 - j / 4, fb = 1 - (j + 1) / 4; quad([xa, H.deck + dy(ta), zc + hw(ta) * fa], [xb, H.deck + dy(tb), zc + hw(tb) * fa], [xb, H.deck + dy(tb), zc + hw(tb) * fb], [xa, H.deck + dy(ta), zc + hw(ta) * fb], false); } /* the deck, in planks */ }
  for (let r = 0; r < 3; r++) { const [ya, fa] = rows[r], [yb, fb] = rows[r + 1], w = hw(0); quad([x0, ya, zc - w * fa], [x0, ya, zc + w * fa], [x0, yb, zc + w * fb], [x0, yb, zc - w * fb], false); } /* the flat stern */
  const hg = new T.BufferGeometry(); hg.setAttribute('position', new T.BufferAttribute(new Float32Array(P), 3)); hg.computeVertexNormals();
  const WOOD = ['#7d5e48', '#6c5040', '#8a6a50', '#745746'], DECK = ['#b79a74', '#a78a66', '#c2a680', '#9c8060'];
  L.push(fac(hg, (cx, cy, cz, i) => { if (cy > H.deck - 0.02) return tone(DECK[(Math.floor((cz - zc + 2) / 0.3) + Math.floor((cx + 9) / 1.3)) % 4], Math.floor(cx * 2.3) + Math.floor(cz * 4) * 7, 0.4);
    const row = cy < 0.4 ? 0 : cy < 0.95 ? 1 : 2, c = tone(WOOD[(row + Math.floor((cx + 9) / 0.9 + row * 0.5)) % 4], i, 0.4).multiplyScalar(0.7 + 0.2 * row); const k = hash(Math.floor(cx * 3), Math.floor(cy * 5) + 11);
    if (cy < 0.9 && k > 0.55) c.lerp(new T.Color('#4f9a86'), 0.45 * (1 - cy)); else if (k < 0.07) c.lerp(new T.Color('#e9dcc0'), 0.6); return c; }, 3300));
  let q;
  /* inside the hole: dark hold, a sand floor, broken plank ends round the opening */
  q = new T.BoxGeometry(1.5, 1.3, 0.05); sgPut(L, q, '#2a2430', 3310, 54.5 - SGX, 0.6, zc - 0.1); q = new T.BoxGeometry(0.05, 1.3, 1.2); sgPut(L, q, '#2f2834', 3311, 53.8 - SGX, 0.6, zc + 0.55); sgPut(L, q.clone(), '#2f2834', 3312, 55.2 - SGX, 0.6, zc + 0.4);
  q = new T.BoxGeometry(1.5, 0.05, 1.3); sgPut(L, q, '#3a3040', 3313, 54.5 - SGX, 1.2, zc + 0.55);
  [[53.86, 0.5, 0.5, 0.2], [54.05, 1.12, 0.36, 1.2], [55.12, 0.9, 0.42, -0.5], [54.8, 1.18, 0.3, 1.5], [55.18, 0.3, 0.4, 0.3]].forEach(([x, y, l, r], k) => { q = new T.BoxGeometry(0.12, l, 0.05); q.rotateZ(r); sgPut(L, q, (cx, cy, cz, i) => tone(WOOD[k % 4], i, 0.4), 3320 + k, x - SGX, y, zc + hw((x - H.x0) / (H.x1 - H.x0)) * 0.95); });
  for (let k = 0; k < 9; k++) { q = new T.CylinderGeometry(0.06, 0.06, 0.02, 8); q.rotateX(hash(k, 3330) * 0.5); sgPut(GL, q, () => new T.Color(k % 3 ? '#ffd75a' : '#ffe9a0'), 3330 + k, 54.5 - SGX + (hash(k, 3331) - 0.5) * 1.1, 0.07 + hash(k, 3333) * 0.03, zc + 1.05 + hash(k, 3332) * 0.7); } /* coins spilled out of the hole */
  /* sand banked against the keel */
  for (let k = 0; k < 9; k++) { q = ico(0.55 + hash(k, 3340) * 0.25, 1, 3341 + k, 0.06); q.scale(1.5, 0.3, 0.9); const x = x0 + 0.3 + k * 0.82; if (x + SGX > 53.6 && x + SGX < 55.4) continue; sgPut(L, q, (cx, cy, cz, i) => tone('#dfead2', i, 0.25), 3341 + k, x, 0.02, zc + H.hw - 0.05 + (k % 2) * 0.12); }
  /* the stern castle with two lit windows, a ship's wheel, rails along the far side, stubs along the near side */
  q = new T.BoxGeometry(1.5, 0.78, 2.5, 3, 1, 5); sgPut(L, q, (cx, cy, cz, i) => (cy > 0.38 ? tone(DECK[(i >> 1) % 4], i, 0.3) : tone(WOOD[(i >> 1) % 4], i, 0.4)), 3350, x0 + 0.72, H.deck + 0.39, zc);
  q = new T.BoxGeometry(1.62, 0.07, 2.62); sgPut(L, q, '#5f4636', 3351, x0 + 0.72, H.deck + 0.8, zc);
  [-0.4, 0.3].forEach((dx, k) => { q = new T.BoxGeometry(0.4, 0.36, 0.04); sgPut(L, q, '#4a3628', 3352 + k, x0 + 0.72 + dx, H.deck + 0.42, zc + 1.26); q = new T.PlaneGeometry(0.3, 0.26); sgPut(GL, q, () => new T.Color('#ffd98a'), 3354 + k, x0 + 0.72 + dx, H.deck + 0.42, zc + 1.285); });
  { const wx = x0 + 1.75, wy = H.deck + 0.55; q = new T.CylinderGeometry(0.05, 0.07, 0.5, 6); sgPut(L, q, '#6c5040', 3360, wx, H.deck + 0.25, zc - 0.5); q = new T.TorusGeometry(0.26, 0.035, 5, 12); q.rotateY(Math.PI / 2); sgPut(L, q, '#9a7450', 3361, wx + 0.06, wy, zc - 0.5);
    for (let k = 0; k < 4; k++) { q = new T.CylinderGeometry(0.02, 0.02, 0.72, 4); q.rotateX(k * Math.PI / 4); sgPut(L, q, '#8a6a4c', 3362 + k, wx + 0.06, wy, zc - 0.5); } }
  for (let k = 0; k < 9; k++) { const x = x0 + 1.7 + k * 0.56, t = (x - x0) / (x1 - x0), broke = k === 3 || k === 6; q = new T.BoxGeometry(0.08, broke ? 0.22 : 0.5, 0.08); sgPut(L, q, (cx, cy, cz, i) => tone(WOOD[k % 4], i, 0.4), 3370 + k, x, H.deck + (broke ? 0.11 : 0.25), zc - hw(t) + 0.1);
    if (!broke && k !== 2 && k !== 5 && k < 8) { q = new T.BoxGeometry(0.6, 0.06, 0.07); sgPut(L, q, '#8a6a50', 3380 + k, x + 0.28, H.deck + 0.5, zc - hw(t) + 0.1); } }
  [0.5, 3.2, 5.6].forEach((dx, k) => { q = new T.BoxGeometry(0.08, 0.16, 0.08); sgPut(L, q, '#6c5040', 3390 + k, x0 + 1.5 + dx, H.deck + 0.08, zc + hw((1.5 + dx) / (x1 - x0)) - 0.1); });
  q = new T.BoxGeometry(0.8, 0.05, 0.7); sgPut(L, q, (cx, cy, cz, i) => new T.Color(i % 2 ? '#3a2c26' : '#5f4636'), 3395, 52.2 - SGX, H.deck + 0.03, zc - 0.25); /* a hatch */
  /* the mast, leaning a little, with rope stays; its top stands out of the water */
  const mx = SG_AT.mast[0] - SGX, mz = SG_AT.mast[1] - SGZ; q = new T.CylinderGeometry(0.1, 0.15, 3.0, 8); sgPut(L, q, (cx, cy, cz, i) => shadeY('#8a6a4c', cy, -1.5, 1.5, i, 0.4), 3400, mx, H.deck + 1.5, mz);
  sgMastTop(L, mx, 6.3, mz);
  [[x1 - 0.5, H.deck + 0.45, 0], [x0 + 0.6, H.deck + 0.85, 0.5]].forEach(([tx, ty, tz], k) => { const ax = mx, ay = 4.9, az = mz, bx = tx, by = ty, bz = zc + tz, len = Math.hypot(bx - ax, by - ay, bz - az); q = new T.CylinderGeometry(0.018, 0.018, len, 4); q.rotateZ(Math.PI / 2 - Math.atan2(by - ay, bx - ax)); sgPut(L, q, '#4a3a30', 3410 + k, (ax + bx) / 2, (ay + by) / 2, (az + bz) / 2); });
  q = new T.CylinderGeometry(0.05, 0.08, 1.7, 6); q.rotateZ(-1.15); sgPut(L, q, '#7a5c40', 3420, x1 + 0.45, H.deck + 0.75, zc); /* the bowsprit */
  /* the belfry where the bell hangs */
  const bx = SG_AT.bell[0] - SGX, bz = SG_AT.bell[1] - SGZ; [-0.42, 0.42].forEach((dz, k) => { q = new T.BoxGeometry(0.1, 1.5, 0.1); sgPut(L, q, (cx, cy, cz, i) => tone('#8a6a50', i, 0.4), 3430 + k, bx + 0.25, H.deck + 0.75, bz + dz); });
  q = new T.BoxGeometry(0.14, 0.12, 1.1); sgPut(L, q, '#6c5040', 3432, bx + 0.25, H.deck + 1.52, bz); q = new T.CylinderGeometry(0.015, 0.015, 0.24, 4); sgPut(L, q, '#3a2c26', 3433, bx + 0.25, H.deck + 1.36, bz);
  /* the two ledges on the near side: a stack of crates and a barrel, then a plank balcony on posts */
  [[49.55, 0.6, 0.62], [50.25, 0.6, 0.66], [50.98, 0.6, 0.7]].forEach(([x, h, w], k) => { q = new T.BoxGeometry(w, h, 0.9, 2, 2, 2); jit(q, 0.012, 3440 + k); sgPut(L, q, (cx, cy, cz, i) => (cy > h / 2 - 0.02 ? tone(DECK[(i + k) % 4], i, 0.3) : tone(WOOD[(k + (i >> 2)) % 4], i, 0.4).multiplyScalar(Math.abs(cx) > w / 2 - 0.06 || Math.abs(cy) > h / 2 - 0.07 ? 0.78 : 1)), 3440 + k, x - SGX, h / 2, -2.78 - SGZ); });
  q = new T.CylinderGeometry(0.2, 0.2, 0.44, 9); q.rotateZ(Math.PI / 2); sgPut(L, q, (cx, cy, cz, i) => tone(Math.abs(Math.abs(cx) - 0.13) < 0.04 ? '#4b5360' : '#9a7450', i, 0.3), 3446, 48.95 - SGX, 0.2, -2.3 - SGZ);
  for (let k = 0; k < 7; k++) { q = new T.BoxGeometry(0.27, 0.07, 0.84); sgPut(L, q, (cx, cy, cz, i) => tone(DECK[k % 4], i, 0.35), 3450 + k, 51.84 - SGX + k * 0.29, 1.165, -2.9 - SGZ + (k % 3 === 1 ? 0.03 : 0)); }
  [51.8, 53.6].forEach((x, k) => { q = new T.BoxGeometry(0.1, 1.14, 0.1); sgPut(L, q, (cx, cy, cz, i) => tone(WOOD[k], i, 0.4), 3460 + k, x - SGX, 0.57, -2.6 - SGZ); q = new T.BoxGeometry(0.08, 0.08, 0.8); q.rotateX(0.6); sgPut(L, q, WOOD[2], 3462 + k, x - SGX, 0.85, -3.0 - SGZ); });
  /* an anchor leaning in the sand by the bow, and a lantern at the stern that still glows */
  { const ax = 56.25 - SGX, az = -3.3 - SGZ; q = new T.BoxGeometry(0.09, 1.1, 0.09); q.rotateZ(0.3); sgPut(L, q, '#4b5360', 3470, ax, 0.5, az); q = new T.TorusGeometry(0.32, 0.05, 5, 10, 3.3); q.rotateZ(Math.PI + 0.2); sgPut(L, q, '#5a6472', 3471, ax + 0.16, 0.34, az); q = new T.TorusGeometry(0.1, 0.03, 5, 9); sgPut(L, q, '#5a6472', 3472, ax - 0.17, 1.08, az); }
  q = new T.BoxGeometry(0.16, 0.22, 0.16); sgPut(L, q, '#4a4038', 3480, x0 + 0.1, H.deck + 1.05, zc + 1.15); q = new T.SphereGeometry(0.075, 8, 6); sgPut(GL, q, () => new T.Color('#ffd98a'), 3481, x0 + 0.1, H.deck + 1.05, zc + 1.15);
}

function sgFill(A, fresh) {
  if (SG.g) return; const g = SG.g = new T.Group(); g.position.set(SGX, 0, SGZ); sc.add(g); const L = [], S = [], GL = []; let q;
  /* the floor: pale rippled sand over the whole square */
  q = new T.PlaneGeometry(11.9, 11.9, 44, 44); q.rotateX(-Math.PI / 2); { const P = q.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i); P.setY(i, 0.04 + Math.sin((z + Math.sin(x * 0.7) * 0.6) * 4.6) * 0.02 + Math.sin(x * 1.1 + z * 0.4) * 0.006); } }
  L.push(fac(q, (cx, cy, cz, i) => { const k = clamp((cy - 0.02) / 0.04, 0, 1), c = tone('#cfe6d6', i, 0.25).lerp(new T.Color('#f4f3de'), k); if (hash(i, 3001) > 0.965) c.lerp(new T.Color('#9fcfc4'), 0.5); return c; }, 3000));
  /* the rim: tall reef rocks behind and to the sides, low ones in front where the camera looks in */
  for (let k = 0; k < 11; k++) sgRock(L, -5.5 + k * 1.1 + (hash(k, 3010) - 0.5) * 0.3, -5.45 + (hash(k, 3011) - 0.5) * 0.3, 1.0 + hash(k, 3012) * 0.3, 3.3 + hash(k, 3013) * 1.5, 3014 + k);
  for (let k = 0; k < 9; k++) sgRock(L, -4.9 + k * 1.22 + (hash(k, 3030) - 0.5) * 0.5, -4.5 + (hash(k, 3031) - 0.5) * 0.4, 0.75 + hash(k, 3032) * 0.3, 1.3 + hash(k, 3033) * 1.5, 3034 + k);
  for (const s of [-1, 1]) for (let k = 0; k < 9; k++) { const u = k / 8; sgRock(L, s * (5.45 + (hash(k, 3050 + s) - 0.5) * 0.25), -4.5 + k * 1.13, 0.8 + hash(k, 3052 + s) * 0.3 - u * 0.15, 3.7 - u * 2.4 + hash(k, 3054 + s) * 0.7, 3056 + k + s * 20); }
  for (let k = 0; k < 10; k++) sgRock(L, -4.75 + k * 1.05 + (hash(k, 3080) - 0.5) * 0.3, 5.55 + (hash(k, 3081) - 0.5) * 0.15, 0.5 + hash(k, 3082) * 0.2, 0.45 + hash(k, 3083) * 0.45, 3084 + k);
  sgWreck(L, GL);
  /* the garden in front of the wreck and round its ends: corals, sponges, fans, anemones, every one set by hand */
  const C = SG_CORAL;
  [[-4.75, 4.3, 1.5, 0], [-3.6, 5.0, 1.1, 3], [-1.7, 5.0, 1.25, 1], [1.9, 4.95, 1.0, 4], [3.5, 5.0, 1.35, 2], [4.75, 4.4, 1.2, 5], [-4.8, 1.2, 1.7, 6], [4.8, 0.3, 1.6, 0], [4.8, -2.4, 2.0, 3], [-4.8, -2.3, 2.1, 1], [-3.2, -3.5, 2.2, 4], [3.6, -3.4, 2.3, 6], [0.2, -3.7, 2.4, 2]].forEach(([x, z, s, c], k) => sgBranch(L, x, 0.03, z, s, C[c], 3500 + k * 10));
  [[-2.7, 5.05, 0.36, 1], [1.0, 5.05, 0.3, 4], [2.7, 5.05, 0.38, 0], [-4.85, 2.9, 0.42, 3], [4.85, 2.2, 0.4, 6], [4.85, 3.6, 0.3, 5], [-0.6, 5.1, 0.26, 2]].forEach(([x, z, r, c], k) => sgBrain(L, x, 0.02, z, r, C[c], 3640 + k));
  [[-4.9, 0.0, 0.6, 1.2, 2], [4.9, -1.0, 0.65, -1.2, 4], [-4.2, 5.0, 0.42, 0.5, 2], [4.3, 5.0, 0.45, -0.5, 6], [-2.2, -3.9, 0.9, 0.3, 4], [2.2, -3.8, 0.95, -0.2, 0], [-4.4, -3.4, 0.8, 0.9, 5]].forEach(([x, z, r, ry, c], k) => sgFan(L, x, z < -3 ? 1.2 : 0.02, z, r, ry, C[c], 3660 + k));
  [[-4.85, 3.5, 1.0, 3], [0.2, 5.1, 0.8, 5], [4.85, 1.2, 1.2, 1], [-4.85, -1.0, 1.3, 3]].forEach(([x, z, s, c], k) => sgTubes(L, x, 0.02, z, s, C[c], 3680 + k * 9));
  [[-1.1, 5.0, 0.9, '#ff7fae', '#fff0a8'], [2.3, 5.0, 1.0, '#8f7fe6', '#bff3ff'], [-4.8, 2.05, 1.2, '#ff9a4d', '#fff6e4'], [4.8, 2.9, 0.9, '#5fd6c9', '#ffffff'], [3.0, 3.2, 0.8, '#ff6f9f', '#ffe9a0'], [-4.5, -4.0, 1.5, '#c79cf5', '#fff0a8'], [4.4, -3.9, 1.4, '#ff7f8f', '#fff6e4']].forEach(([x, z, s, c, t], k) => sgAnemone(L, S, x, 0.03, z, s, c, t, 3720 + k * 20));
  /* kelp: a forest behind the wreck, tall stalks up the sides, a few low ones in front */
  [[-4.6, -3.6, 3.7], [-3.7, -4.2, 3.3], [-2.9, -3.3, 3.8], [-1.9, -4.1, 3.5], [-1.0, -3.4, 3.9], [-0.2, -4.3, 3.4], [0.8, -3.5, 3.8], [1.6, -4.2, 3.6], [2.6, -3.3, 3.9], [3.3, -4.1, 3.4], [4.2, -3.5, 3.7], [4.8, -4.3, 3.2],
    [-4.9, -1.7, 3.2], [-4.85, 0.6, 2.7], [-4.95, 2.4, 2.1], [4.9, -1.6, 3.1], [4.95, 0.9, 2.6], [4.85, 2.7, 2.0], [-4.85, 3.8, 1.5], [4.9, 4.2, 1.3], [-2.4, 4.9, 0.9], [2.9, 5.0, 0.8]].forEach(([x, z, h], k) => sgKelp(S, x, z, h, 3900 + k * 7));
  /* small things on the sand: starfish, shells, sea urchins, and two great clams that only lie there and gleam */
  for (let k = 0; k < 26; k++) { const x = (hash(k, 4001) - 0.5) * 9.4, z = -0.4 + hash(k, 4002) * 5.0; if (SG_BOX.some((b) => Math.abs(x + SGX - b.x) < b.w / 2 + 0.2 && Math.abs(z + SGZ - b.z) < b.d / 2 + 0.2)) continue;
    if (k % 3 === 0) { for (let j = 0; j < 5; j++) { q = new T.ConeGeometry(0.055, 0.2, 4); q.rotateX(Math.PI / 2); q.translate(0, 0, 0.1); q.rotateY(j / 5 * 6.283 + hash(k, 4003)); q.scale(1, 0.45, 1); sgPut(L, q, (cx, cy, cz, i) => tone(C[k % 7], i, 0.3), 4010 + k, x, 0.075, z); } }
    else if (k % 3 === 1) { q = ico(0.07 + hash(k, 4004) * 0.04, 1, 4040 + k); q.scale(1.2, 0.5, 0.9); q.rotateY(hash(k, 4005) * 6); sgPut(L, q, (cx, cy, cz, i) => tone(k % 2 ? '#ffffff' : '#ffd3df', i, 0.3), 4040 + k, x, 0.07, z); }
    else { q = ico(0.1, 0, 4070 + k); sgPut(L, q, '#3a2c4a', 4070 + k, x, 0.12, z); for (let j = 0; j < 7; j++) { q = new T.ConeGeometry(0.014, 0.16, 3); q.translate(0, 0.14, 0); q.rotateZ((hash(k, j + 4080) - 0.5) * 2.2); q.rotateX((hash(k, j + 4090) - 0.5) * 2.2); sgPut(L, q, '#4f3c66', 4080 + k + j, x, 0.12, z); } } }
  sgFlat(L, g); const sm = sgFlat(S, g, SG.swayMat || (SG.swayMat = sgSwayMat())); sm.castShadow = false;
  const gm = sgFlat(GL, g, new T.MeshBasicMaterial({ vertexColors: true })); gm.castShadow = gm.receiveShadow = false;
  SG.deco = [sgClam(g, -2.6, 0.04, 4.2, 1.25, 0.4, 'b'), sgClam(g, 0.2, 0.04, 4.3, 1.1, -0.3, 'b')]; SG.deco.forEach((c) => { c.lid.rotation.x = -0.95; });
  /* the bubble clams */
  SG.clams = SG_CLAMS.map((D, k) => { const c = sgClam(g, D.x - SGX, D.lv < 0 ? 0.04 : SG_LEDGE[D.lv].h, D.z - SGZ, D.joke ? 0.95 : 0.8, k === 0 ? 0.5 : D.joke ? -0.7 : 0, D.joke ? 'j' : 'a'); c.D = D; c.x = D.x; c.z = D.z; c.arm = true; c.puff = k * 0.7; return c; });
  /* the bell: gold while it waits, plain bronze once the golden one is on its pedestal at home */
  { const b = SG.bell = new T.Group(); b.position.set(SG_AT.bell[0] - SGX + 0.25, SG_HULL.deck + 1.24, SG_AT.bell[1] - SGZ); const m = new T.Mesh(goldGeo('shipbell'), sgBell() ? sgBronze() : goldMat); m.scale.setScalar(1.25); m.position.y = -0.24; m.castShadow = true; b.add(m); b.userData.m = m; g.add(b);
    const sp = SG.bellSp = new T.Sprite(new T.SpriteMaterial({ map: sgStar(), transparent: true, depthWrite: false, blending: T.AdditiveBlending })); sp.position.set(SG_AT.bell[0] - SGX + 0.25, SG_HULL.deck + 1.0, SG_AT.bell[1] - SGZ + 0.2); sp.renderOrder = 4; g.add(sp); }
  SG.fore = sgFore(); SG.fore.position.set(SG_AT.fore[0] - SGX, 0, SG_AT.fore[1] - SGZ); g.add(SG.fore);
  /* the water: a sheet overhead with light running over it, walls of water round the square, light patterns on the sand, shafts of light */
  const cau = sgCaustic(), W = 11.76, top = new T.PlaneGeometry(W, W); top.rotateX(-Math.PI / 2);
  SG.surf = new T.Mesh(top, sgBasic({ color: '#39c6bd', opacity: 0.3, side: T.DoubleSide })); SG.surf.position.y = SG_TOP; SG.surf.renderOrder = 3; g.add(SG.surf);
  const mk = (rep, op, y, ro) => { const t = cau.clone(); t.needsUpdate = true; t.repeat.set(rep, rep); const m = new T.Mesh(top, sgBasic({ map: t, color: '#eafff6', opacity: op, blending: T.AdditiveBlending })); m.position.y = y; m.renderOrder = ro; g.add(m); return m; };
  SG.c1 = mk(3.1, 0.13, SG_TOP + 0.02, 3); SG.c2 = mk(2.2, 0.1, SG_TOP + 0.03, 3); SG.f1 = mk(3.0, 0.3, 0.1, 1); SG.f2 = mk(2.1, 0.26, 0.11, 1);
  const wt = sgGrad([[0, 'rgba(57,198,189,0.3)'], [0.12, 'rgba(57,198,189,0.3)'], [0.55, 'rgba(40,160,172,0.38)'], [1, 'rgba(20,100,128,0.55)']]), wm = sgBasic({ map: wt, color: '#ffffff', side: T.DoubleSide });
  [[0, W / 2, 0], [0, -W / 2, Math.PI], [W / 2, 0, Math.PI / 2], [-W / 2, 0, -Math.PI / 2]].forEach(([x, z, r]) => { const p = new T.Mesh(new T.PlaneGeometry(W, SG_TOP + 0.5), wm); p.position.set(x, (SG_TOP - 0.5) / 2, z); p.rotation.y = r; p.renderOrder = 3; g.add(p); });
  const st = sgGrad([[0, 'rgba(255,255,230,0.95)'], [0.6, 'rgba(210,255,240,0.4)'], [1, 'rgba(180,255,240,0)']], 64); SG.shafts = [[-3.4, -2.2, 1.5], [-0.8, -0.2, 1.1], [1.9, -2.6, 1.7], [3.7, 0.8, 1.2], [-2.3, 2.2, 1.0], [0.9, 3.0, 1.3]].map(([x, z, w], k) => { const m = new T.Mesh(new T.PlaneGeometry(w, SG_TOP + 0.3), sgBasic({ map: st, color: '#ffffff', opacity: 0.2, blending: T.AdditiveBlending, side: T.DoubleSide })); m.position.set(x, SG_TOP / 2, z); m.rotation.z = -0.22 + k * 0.03; m.renderOrder = 2; g.add(m); return m; });
  /* the chest in the hole in the hull, and clams to harvest */
  if (!state.isle.chests.seagarden) { const c = makeChest(SG_AT.chest[0], SG_AT.chest[1], { coin: 40, pearl: 3, crystal: 6 }, 'seagarden'); c.g.position.y = 0.04; c.ring.position.y = 0.09; }
  [[55.6, 0.2], [47.9, -1.3], [53.6, 0.25]].forEach(([x, z], k) => { const n = makeNode('clam', x, z, 4200 + k); n.g.position.y = 0.04; n.g.rotation.y = (k - 1) * 0.5; if (fresh) { n.pop = 0.001; n.g.scale.setScalar(0.01); } });
  sgLife();
  if (fresh) { g.scale.setScalar(0.01); SG.pop = 0.001; }
}
function sgTwo() { return SG.lidMat || (SG.lidMat = (() => { const m = MAT.clone(); m.side = T.DoubleSide; m.onBeforeCompile = function (sh, r) { if (typeof MAT.onBeforeCompile === 'function') MAT.onBeforeCompile.call(MAT, sh, r); }; return m; })()); }
function sgBronze() { return SG.bronze || (SG.bronze = new T.MeshStandardMaterial({ color: '#b8873c', roughness: 0.45, metalness: 0.4, side: T.DoubleSide })); }
/* the living things of the garden: schools of fish overhead and bubbles (instanced: a few draw calls for all of them) */
function sgFishGeo(a, b, sd) { const L = []; let q = new T.SphereGeometry(0.075, 7, 5); q.scale(0.55, 0.9, 1.5); L.push(fac(q, (cx, cy, cz, i) => (Math.abs(cz - 0.02) < 0.028 || cz < -0.07 ? new T.Color(b) : tone(a, i, 0.2)), sd)); q = new T.ConeGeometry(0.065, 0.1, 4); q.scale(0.3, 1, 1); q.rotateX(Math.PI / 2); q.translate(0, 0, -0.145); L.push(fac(q, b, sd + 1)); return sgFlat(L, new T.Group()).geometry; }
function sgLife() {
  if (SG.fish.length) return;
  const fm = SG.fishMat = sgBasic({ vertexColors: true, depthWrite: true }); /* drawn after the water, so their colours stay bright */
  [['#ff9a2e', '#ffffff', 10, 0], ['#ffe14d', '#2f6fe0', 9, 2.1], ['#6fd0ff', '#fff3a0', 11, 4.2], ['#ff6fae', '#fff6e4', 7, 1.2]].forEach(([a, b, n, ph], k) => { const m = new T.InstancedMesh(sgFishGeo(a, b, 4300 + k), fm, n); m.frustumCulled = false; m.castShadow = false; m.userData.noBatch = 1; m.renderOrder = 4; sc.add(m); SG.fish.push({ m, n, ph, k, low: k === 3 }); });
  const bm = SG.bubs = new T.InstancedMesh(new T.IcosahedronGeometry(0.05, 1), sgBasic({ color: '#e6fbff', opacity: 0.6, depthWrite: true }), 46); bm.frustumCulled = false; bm.userData.noBatch = 1; bm.renderOrder = 4; sc.add(bm);
  SG.bl = []; for (let k = 0; k < 46; k++) SG.bl.push({ t: hash(k, 4401) * 5, src: k });
}
/* where bubbles rise from: the clams, the wreck, the sand */
const SG_VENT = [[48.4, -2.6, 0.5], [50.9, -2.7, 1.1], [53.25, -2.8, 1.7], [56.2, -1.4, 0.5], [48.9, -0.7, 0.4], [55.4, -0.7, 0.4], [54.6, -3.6, 0.9], [49.3, -4.6, 2.6], [52.3, -4.9, 1.9], [47.4, 0.6, 0.1], [56.6, 0.4, 0.1], [51.0, 1.0, 0.1], [53.5, -6.6, 0.3], [49.5, -7.0, 0.3], [56.4, -4.6, 0.2], [47.5, -4.4, 0.2]];
const sgDummy = new T.Object3D();

/* ---- outside: the diver's stand on the lagoon shore, the mast in the sea, the turtle ---- */
function sgHelmGeo(frame) { /* the helmet round 0,0,0 (its glass is a second mesh); frame: only the bare brass rings of one not yet finished */
  const L = []; let q; const brass = (cx, cy, cz, i) => tone('#e2a94a', i, 0.3).multiplyScalar(0.78 + 0.35 * clamp(cy / 0.4 + 0.5, 0, 1));
  if (!frame) { q = new T.SphereGeometry(0.4, 14, 10).toNonIndexed(); const P = q.attributes.position, keep = []; for (let i = 0; i < P.count; i += 3) { const cx = (P.getX(i) + P.getX(i + 1) + P.getX(i + 2)) / 3, cy = (P.getY(i) + P.getY(i + 1) + P.getY(i + 2)) / 3, cz = (P.getZ(i) + P.getZ(i + 1) + P.getZ(i + 2)) / 3; if (cz > 0.4 * 0.72 && Math.hypot(cx, cy) < 0.27) continue; if (cy < -0.33) continue; for (let j = 0; j < 9; j++) keep.push(P.array[i * 3 + j]); }
    const s = new T.BufferGeometry(); s.setAttribute('position', new T.BufferAttribute(new Float32Array(keep), 3)); s.computeVertexNormals(); L.push(fac(s, brass, 4500)); }
  else for (let k = 0; k < 4; k++) { q = new T.TorusGeometry(0.39, 0.022, 5, 14, Math.PI); q.rotateY(k * Math.PI / 4); L.push(fac(q, brass, 4501 + k)); }
  q = new T.TorusGeometry(0.265, 0.04, 6, 16); q.translate(0, 0, 0.3); L.push(fac(q, (cx, cy, cz, i) => tone('#c98a35', i, 0.3), 4510));
  q = new T.TorusGeometry(0.27, 0.065, 6, 16); q.rotateX(Math.PI / 2); q.translate(0, -0.33, 0); L.push(fac(q, (cx, cy, cz, i) => tone('#c98a35', i, 0.3), 4511));
  if (!frame) { [-1, 1].forEach((s, k) => { q = new T.TorusGeometry(0.1, 0.025, 5, 10); q.rotateY(Math.PI / 2); q.translate(s * 0.385, 0.02, 0); L.push(fac(q, '#c98a35', 4512 + k)); q = new T.CircleGeometry(0.09, 10); q.rotateY(s * Math.PI / 2); q.translate(s * 0.4, 0.02, 0); L.push(fac(q, '#8fd0e6', 4514 + k)); });
    q = new T.CylinderGeometry(0.06, 0.09, 0.1, 8); q.translate(0, 0.42, 0); L.push(fac(q, '#c98a35', 4516)); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; q = ico(0.028, 0, 4520 + k); q.translate(Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0.3); L.push(fac(q, '#8a5a22', 4520 + k)); } }
  return sgFlat(L, new T.Group()).geometry;
}
function sgHelmet() { /* the finished helmet as a group: brass and glass */
  const g = new T.Group(), m = new T.Mesh(SG.helmGeo || (SG.helmGeo = sgHelmGeo(false)), sgTwo()); m.castShadow = true; g.add(m);
  const q = new T.SphereGeometry(0.385, 12, 8, 0, 6.283, 0, 0.78); q.rotateX(Math.PI / 2); const gl = new T.Mesh(q, new T.MeshStandardMaterial({ color: '#bfeeff', transparent: true, opacity: 0.28, roughness: 0.1, metalness: 0.1, depthWrite: false })); gl.renderOrder = 1; g.add(gl); return g;
}
function sgTurtleMake(s) {
  const g = new T.Group(), L = []; let q = new T.SphereGeometry(0.5, 10, 6, 0, 6.283, 0, Math.PI / 2); q.scale(0.92, 0.62, 1.12);
  sgPut(L, q, (cx, cy, cz, i) => { const cell = Math.floor((Math.atan2(cz, cx) + 3.2) * 1.3) + Math.floor(cy * 5) * 3; return tone(cy > 0.24 ? (cell % 2 ? '#3f9a6a' : '#4fae78') : cell % 2 ? '#357f5a' : '#44906a', i, 0.25).multiplyScalar(0.85 + 0.3 * clamp(cy / 0.3, 0, 1)); }, 4600, 0, 0.1, 0);
  q = new T.CylinderGeometry(0.47, 0.4, 0.1, 10); q.scale(0.95, 1, 1.14); sgPut(L, q, (cx, cy, cz, i) => tone('#f0dfa0', i, 0.3), 4601, 0, 0.07, 0);
  q = new T.SphereGeometry(0.17, 9, 7); q.scale(0.9, 0.85, 1.15); sgPut(L, q, (cx, cy, cz, i) => tone('#8fd07a', i, 0.25), 4602, 0, 0.2, 0.68);
  q = new T.CylinderGeometry(0.1, 0.12, 0.2, 7); q.rotateX(Math.PI / 2); sgPut(L, q, '#84c670', 4603, 0, 0.16, 0.52);
  [-1, 1].forEach((sx, k) => { q = new T.SphereGeometry(0.035, 6, 5); sgPut(L, q, '#22303c', 4604 + k, sx * 0.105, 0.26, 0.78); q = new T.SphereGeometry(0.014, 5, 4); sgPut(L, q, '#ffffff', 4606 + k, sx * 0.115, 0.275, 0.805); });
  q = new T.ConeGeometry(0.06, 0.2, 4); q.rotateX(-Math.PI / 2); sgPut(L, q, '#84c670', 4608, 0, 0.1, -0.62);
  const body = sgFlat(L, g); body.castShadow = true; g.userData.fl = [];
  [[0.42, 0.34, 1, 0.5], [-0.42, 0.34, 1, 0.5], [0.36, -0.42, 0.6, -0.5], [-0.36, -0.42, 0.6, -0.5]].forEach(([x, z, sc2, ry], k) => { q = new T.SphereGeometry(0.2, 7, 5); q.scale(1.5, 0.22, 0.62); q.translate(0.26, 0, 0); const m = new T.Mesh(fac(q, (cx, cy, cz, i) => tone(i % 3 ? '#7fc46a' : '#9bd884', i, 0.25), 4610 + k), MAT); m.castShadow = true;
    const p = new T.Group(); p.position.set(x, 0.1, z); p.scale.set(x < 0 ? -sc2 : sc2, sc2, sc2); p.rotation.y = (x < 0 ? 1 : -1) * ry; p.add(m); g.add(p); g.userData.fl.push({ p, front: k < 2, s: x < 0 ? -1 : 1 }); });
  g.scale.setScalar(s); g.rotation.order = 'YXZ'; sc.add(g); return g;
}
function sgTurtleSwim(g, sp, ph) { g.userData.fl.forEach((f) => { f.p.rotation.z = (reduced ? 0 : Math.sin(time * sp + ph + (f.front ? 0 : 1.6)) * (f.front ? 0.5 : 0.25)) * f.s; }); }
function sgOutside() {
  if (SG.out) return; const o = SG.out = { g: new T.Group() }, [sx, sz] = SG_AT.stand, L = []; o.g.position.set(sx, 0, sz); sc.add(o.g); let q;
  /* the stand: a little jetty-plank floor, two posts with a bar, a wooden head for the helmet, a coil of air hose, flippers */
  for (let k = 0; k < 4; k++) { q = new T.BoxGeometry(0.3, 0.06, 1.3); sgPut(L, q, (cx, cy, cz, i) => tone(['#c0935f', '#b08454', '#c99f6c'][k % 3], i, 0.3), 4700 + k, -0.48 + k * 0.32, 0.04, 0); }
  [-0.5, 0.5].forEach((dx, k) => { q = new T.CylinderGeometry(0.055, 0.07, 1.75, 7); sgPut(L, q, (cx, cy, cz, i) => shadeY('#8a5f3c', cy, -0.9, 0.9, i, 0.4), 4710 + k, dx, 0.9, -0.35); });
  q = new T.BoxGeometry(1.25, 0.09, 0.09); sgPut(L, q, '#a8774f', 4712, 0, 1.72, -0.35); q = new T.BoxGeometry(1.1, 0.07, 0.07); sgPut(L, q, '#a8774f', 4713, 0, 0.55, -0.35);
  q = new T.CylinderGeometry(0.05, 0.06, 1.0, 6); sgPut(L, q, '#8a5f3c', 4714, 0, 0.55, 0.1); q = new T.SphereGeometry(0.2, 9, 7); q.scale(1, 1.1, 1); sgPut(L, q, (cx, cy, cz, i) => tone('#d9b98c', i, 0.3), 4715, 0, 1.13, 0.1);
  q = new T.TorusGeometry(0.2, 0.05, 6, 14); q.rotateY(0.3); sgPut(L, q, (cx, cy, cz, i) => tone(i % 4 < 2 ? '#e0503c' : '#c9432f', i, 0.3), 4716, -0.5, 1.2, -0.28); q = new T.TorusGeometry(0.15, 0.045, 6, 12); q.rotateY(0.3); sgPut(L, q, '#c9432f', 4717, -0.5, 1.2, -0.24);
  [0.3, 0.52].forEach((dx, k) => { q = new T.ConeGeometry(0.13, 0.5, 4); q.scale(1, 1, 0.25); q.rotateZ(Math.PI); sgPut(L, q, (cx, cy, cz, i) => tone('#3f8fc4', i, 0.3), 4718 + k, dx, 0.92, -0.3); });
  q = new T.BoxGeometry(0.34, 0.26, 0.26); sgPut(L, q, (cx, cy, cz, i) => tone('#b5713f', i, 0.3), 4720, -0.42, 0.2, 0.36); q = new T.BoxGeometry(0.36, 0.04, 0.28); sgPut(L, q, '#f2c23c', 4721, -0.42, 0.34, 0.36);
  const m = sgFlat(L, o.g); m.castShadow = true; lookFoot(sx, sz, 0.85, 0.8);
  o.frame = new T.Mesh(sgHelmGeo(true), sgTwo()); o.frame.position.set(0, 1.2, 0.12); o.frame.castShadow = true; o.g.add(o.frame);
  o.tag = isleSprite(isleBubble('seahelm'), 1.0); o.tag.position.set(0, 2.55, 0); o.g.add(o.tag);
  /* out in the water: the top of the mast, the glint of something gold, bubbles */
  o.mast = sgFore(); o.mast.position.set(SG_AT.fore[0], -SG_TOP - 0.5, SG_AT.fore[1]); sc.add(o.mast);
  o.glint = new T.Sprite(new T.SpriteMaterial({ map: sgStar(), transparent: true, depthWrite: false, blending: T.AdditiveBlending })); o.glint.position.set(SG_AT.fore[0] - 1.1, -0.36, SG_AT.fore[1] + 0.5); sc.add(o.glint);
  o.bub = []; for (let k = 0; k < 7; k++) { const b = new T.Mesh(SG.bubGeo || (SG.bubGeo = new T.IcosahedronGeometry(0.06, 1)), SG.bubMat || (SG.bubMat = sgBasic({ color: '#f2fdff', opacity: 0.75 }))); sc.add(b); o.bub.push(b); }
  /* the rope rings of the turtle ride */
  ringMake({ x: SG_AT.ringOut[0], z: SG_AT.ringOut[1], icon: 'seaturtle', ok: () => !!sgS().helm && !!HAS.c5 && !!SG.g && !SG.pop && !SG.trip, go: () => sgRide(true) });
  ringMake({ x: SG_AT.ringIn[0], z: SG_AT.ringIn[1], y: 0.05, icon: 'seaturtle', ok: () => !!HAS.c5 && !!SG.g && !SG.pop && !SG.on && !SG.trip, go: () => sgRide(false) });
}
/* the helmet is paid: Pip holds it up, and the sea floor north of the lagoon comes up */
function sgOpen() { sgS().helm = 1; foundIt('seahelm'); if (SG.out) burst(SG_AT.stand[0], 1.4, SG_AT.stand[1], 14); secretOpen('c5'); save(); }
/* the turtle ride: hop on from the ring, a dip under, a leap over the reef into the standing water, and down to the sand (and back the same way) */
function sgRide(inn) {
  const [ox, oz] = SG_AT.ringOut, [sx, sz] = SG_AT.sea, [rx, rz] = SG_AT.rest, [ix, iz] = SG_AT.ringIn, [lx, lz] = SG_AT.land, [bx, bz] = SG_AT.back, mid = [[sx - 0.1, -0.16, sz - 0.9], [sx - 0.2, -1.0, sz - 1.5], [sx - 0.35, 2.2, sz - 2.7], [sx - 0.7, 2.5, 1.2], [rx + 0.8, 1.45, rz + 0.9]];
  const pts = inn ? [[ox, 0, oz], [(ox + sx) / 2, 0.8, (oz + sz) / 2], [sx, -0.16, sz]].concat(mid, [[rx, 0.4, rz], [(rx + lx) / 2, 0.9, (rz + lz) / 2], [lx, 0.05, lz]])
    : [[ix, 0.05, iz], [(ix + rx) / 2, 0.95, (iz + rz) / 2], [rx, 0.4, rz]].concat(mid.slice().reverse(), [[sx, -0.16, sz], [(bx + sx) / 2, 0.8, (bz + sz) / 2 - 0.4], [bx, 0, bz]]);
  SG.trip = { inn, y0: 0, wet: null }; sgOn(null);
  if (!rideGo({ pts, speed: 3.0, snd: 'whoosh', endY: 0, each: sgRideEach, onEnd: () => { SG.trip = null; Snd.play('pop', { gain: 0.35, f: 520 }); } })) SG.trip = null;
}
function sgRideEach(R, dt) {
  const pp = pip.position, t = SG.turtle, on = R.d >= R.L[2] && R.d <= R.L[R.L.length - 3]; if (!t) return;
  if (on) { const vy = (pp.y - SG.trip.y0) / Math.max(0.001, dt * (R.v || 1)); t.position.set(pp.x, pp.y - 0.4, pp.z); t.rotation.y = pip.rotation.y; t.rotation.x += (clamp(-Math.atan(vy), -0.9, 0.9) - t.rotation.x) * Math.min(1, dt * 6); sgTurtleSwim(t, 9, 0);
    const wet = pp.z > SGZ + 5.9 ? pp.y < 0.05 : true; if (SG.trip.wet !== null && wet !== SG.trip.wet) { splash(pp.x, pp.z > SGZ + 5.9 ? -0.3 : pp.y + 0.3, pp.z, 9); Snd.play('pop', { gain: 0.3, f: 300 }); } SG.trip.wet = wet; }
  else sgTurtleRest(R.d < R.L[2] ? !SG.trip.inn : SG.trip.inn, dt);
  SG.trip.y0 = pp.y;
}
function sgTurtleRest(inside, dt) {
  const t = SG.turtle, [x, z] = inside ? SG_AT.rest : SG_AT.sea, y = inside ? 0.05 : -0.56, bob = reduced ? 0 : Math.sin(time * 1.6) * 0.03;
  t.position.set(x, y + bob, z); t.rotation.x += (0 - t.rotation.x) * Math.min(1, dt * 6); const want = inside ? 2.5 : Math.PI; let d = want - t.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); t.rotation.y += d * Math.min(1, dt * 4); sgTurtleSwim(t, 2.2, 0);
}
/* a bubble clam blows: the bubble closes round Pip, floats up and over, and pops where it sets Pip down */
function sgBlow(c) {
  const pp = pip.position, D = c.D, y0 = SG.on ? SG.on.h : 0.04; c.arm = false; c.want = 1; target.copy(pp); work = null;
  if (!SG.ball) { SG.ball = new T.Mesh(new T.SphereGeometry(1, 18, 12), sgBasic({ color: '#dff8ff', opacity: 0.3, depthWrite: false })); SG.ball.renderOrder = 2; SG.ball.userData.noBatch = 1; sc.add(SG.ball); SG.ballHi = new T.Sprite(new T.SpriteMaterial({ map: sgStar(), transparent: true, depthWrite: false, opacity: 0.8 })); SG.ball.add(SG.ballHi); SG.ballHi.position.set(-0.45, 0.5, 0.75); SG.ballHi.scale.setScalar(0.5); }
  Snd.play('pop', { gain: 0.35, f: 240 }); Snd.play('riser', { gain: 0.18 });
  SG.bub = { c, t: 0, go: false, y0, x: pp.x, z: pp.z, popped: false };
}
function sgPop(x, y, z, giggle) { Snd.play('pop', { gain: 0.45, f: 880 }); if (giggle) [0, 0.09, 0.18, 0.3].forEach((d, k) => Snd.play('blip', { gain: 0.22, f: [1250, 1480, 1320, 1660][k] }, d + 0.05)); splash(x, y, z, 7); if (SG.ball) SG.ball.visible = false;
  if (SG.bl) for (let k = 0; k < 8; k++) { const b = SG.bl[k]; b.t = 0; b.at = [x + (hash(k, time) - 0.5) * 0.7, y - 0.3 + hash(k, time + 1) * 0.6, z + (hash(k, time + 2) - 0.5) * 0.5]; } }
function sgBubStep(dt) {
  const B = SG.bub, pp = pip.position; if (!B) return; B.t += dt; const D = B.c.D, s = Math.min(1, B.t / 0.45), e = s * s * (3 - 2 * s);
  if (!B.popped) { SG.ball.visible = true; SG.ball.position.set(pp.x, pp.y + 0.85, pp.z); SG.ball.scale.set(1.05 * e * (1 + (reduced ? 0 : Math.sin(time * 9) * 0.03)), 1.12 * e * (1 + (reduced ? 0 : Math.cos(time * 8) * 0.03)), 1.05 * e); }
  if (!B.go) { target.copy(pp); work = null; if (B.t < 0.45 || SC.ride) return; B.go = true; const L = D.to >= 0 ? SG_LEDGE[D.to] : null;
    const pts = D.joke ? [[B.x, B.y0, B.z], [B.x, B.y0 + 1.5, B.z + 0.001], [B.x, B.y0, B.z + 0.002]] : [[B.x, B.y0, B.z], [(B.x + D.at[0]) / 2, Math.max(B.y0, L.h) + 0.95, (B.z + D.at[1]) / 2], [D.at[0], L.h, D.at[1]]];
    sgOn(null); SG.fly = true;
    rideGo({ pts, speed: 1.9, endY: D.joke ? 0 : L.h, each: (R) => { if (D.joke && !B.popped && R.d > R.L[1]) { B.popped = true; sgPop(pp.x, pp.y + 1, pp.z, true); } },
      onEnd: () => { if (!B.popped) sgPop(pp.x, pp.y + 0.9, pp.z, false); sgOn(D.joke ? null : L); SG.fly = false; SG.bub = null; B.c.want = 0.3; } }); }
}
/* off a ledge: Pip floats down to the sand in front of it */
function sgDown(L) { const pp = pip.position, x = clamp(pp.x, 47.4, 56.6), z = Math.max(-1.85, L.z1 + 0.9); sgOn(null); SG.fly = true; Snd.play('swish', { gain: 0.3 });
  if (!rideGo({ pts: [[pp.x, L.h, pp.z], [(pp.x + x) / 2, L.h + 0.3, (pp.z + z) / 2], [x, 0.04, z]], speed: 2.4, endY: 0, onEnd: () => { SG.fly = false; Snd.play('pop', { gain: 0.3, f: 460 }); } })) { SG.fly = false; sgOn(L); } }

/* ---- after the bell: what stays changed on the coral island ---- */
function sgAfterMake() {
  const a = SG.after = { babies: [], fish: [], pts: null }; for (let k = 0; k < 3; k++) a.babies.push(sgTurtleMake(0.56 - k * 0.06));
  [['#ff8a3c', '#ffffff'], ['#ffd84d', '#3a6fd0'], ['#4fb6ff', '#fff0a8'], ['#ff6f9f', '#fff6e4']].forEach(([c, d], k) => { const m = new T.Mesh(sgFishGeo(c, d, 4800 + k), MAT); m.scale.setScalar(2.1); m.userData.noBatch = 1; sc.add(m); a.fish.push({ m, x: [50.2, 56.2, 44.6, 60.2][k], z: [4.2, 3.6, 4.6, 12.5][k], t: k * 1.7, T: 5 + k * 1.3, dir: k * 1.9 }); });
  const N = 24, P = new Float32Array(N * 3); a.geo = new T.BufferGeometry(); a.geo.setAttribute('position', new T.BufferAttribute(P, 3)); a.pts = new T.Points(a.geo, new T.PointsMaterial({ map: sgStar(), size: 1.5, transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: '#fff3c0' })); a.pts.frustumCulled = false; a.pts.userData.noBatch = 1; sc.add(a.pts); a.n = -1;
}
function sgAfterStep(dt) {
  if (!SG.after) sgAfterMake(); const a = SG.after, pp = pip.position, near = Math.hypot(pp.x - 46, pp.z - 6) < 34 && !inCave;
  a.babies.forEach((b) => { b.visible = near && !!HAS.c3; }); a.fish.forEach((f) => { f.m.visible = false; }); a.pts.visible = near; if (!near) return;
  /* three little turtles follow each other round the lagoon */
  const A3 = AREA_BY.c3, P0 = A3.ponds[0], cx = A3.cx + P0[0], cz = A3.cz + P0[1];
  a.babies.forEach((b, k) => { const an = time * 0.42 - k * 0.75, r = 1.25 + Math.sin(time * 0.3 + k) * 0.25; b.position.set(cx + Math.cos(an) * r, -0.52 + (reduced ? 0 : Math.sin(time * 2 + k) * 0.02), cz + Math.sin(an) * r * 0.9); b.rotation.y = Math.atan2(-Math.sin(an), Math.cos(an) * 0.9); sgTurtleSwim(b, 6, k); });
  /* coloured fish jump in the bay */
  a.fish.forEach((f, k) => { f.t += dt; if (f.t > f.T) { f.t = 0; f.dir = hash(k, time) * 6.283; f.sp = true; } const u = f.t / 1.1; if (u >= 1 || reduced) return; const y = -0.5 + Math.sin(u * Math.PI) * 1.15, dx = Math.cos(f.dir), dz = Math.sin(f.dir), q = u - 0.5;
    f.m.visible = y > -0.5; f.m.position.set(f.x + dx * q * 1.5, y, f.z + dz * q * 1.5); f.m.rotation.set(0, 0, 0); f.m.rotation.order = 'YXZ'; f.m.rotation.y = Math.atan2(dx, dz); f.m.rotation.x = -Math.cos(u * Math.PI) * 1.1;
    if (f.sp && u > 0.02) { f.sp = false; splash(f.m.position.x, -0.4, f.m.position.z, 4); } if (!f.sp2 && u > 0.93) { f.sp2 = true; splash(f.m.position.x, -0.4, f.m.position.z, 4); } if (u < 0.5) f.sp2 = false; });
  /* every clam on the coral beaches gleams, and gives one pearl more when it is opened */
  let n = 0; const P = a.geo.attributes.position;
  nodes.forEach((q) => { if (q.kind !== 'clam') return; const rdy = q.st === 'ready' && !q.pop; if (q.sgWas && q.st !== 'ready') sgPearl(q); q.sgWas = q.st === 'ready';
    if (rdy && n < 24 && (reduced || Math.sin(time * 2.3 + q.seed) > -0.5)) { P.setXYZ(n++, q.x + Math.sin(time * 1.7 + q.seed) * 0.12, q.g.position.y + 0.62 + Math.sin(time * 2.9 + q.seed) * 0.08, q.z + 0.12); } });
  for (let k = n; k < 24; k++) P.setXYZ(k, 0, -50, 0); P.needsUpdate = true; a.pts.material.opacity = 0.75 + (reduced ? 0 : Math.sin(time * 5) * 0.2);
}
function sgPearl(n) { state.isle.store.pearl = (state.isle.store.pearl || 0) + 1; const sp = new T.Sprite(new T.SpriteMaterial({ map: hamGiftTex('pearl', 1), transparent: true, depthWrite: false })); sp.scale.set(1.2, 0.6, 1); sp.position.set(n.x + 0.5, n.g.position.y + 1.1, n.z); sc.add(sp); FD.floats.push({ sp, t: -0.25, y: n.g.position.y - 0.45 }); invDirty = true; Snd.play('sparkle', { gain: 0.3, f: 1400 }, 0.2); save(); }

/* ---- every frame ---- */
function sgStep(dt) {
  const pp = pip.position, S = sgS(); SG.uT.value = reduced ? 0 : time;
  if (!HAS.c3 && !HAS.c5) return; if (!SG.out) sgOutside(); const o = SG.out, nt = typeof nightAmt === 'number' ? clamp(nightAmt, 0, 1) : 0, far = inCave || Math.hypot(pp.x - SGX, pp.z - 1) > 38;
  if (S.helm && !HAS.c5 && !rising) secretOpen('c5'); /* paid, but the rise was cut short (the game was closed): it comes up now */
  if (sgBell()) sgAfterStep(dt);
  /* outside: the stand, the mast in the sea */
  const open = !!HAS.c5 && !!SG.g, show = !inCave;
  o.g.visible = show; o.frame.visible = !S.helm; o.tag.visible = !S.helm; o.tag.position.y = 2.55 + (reduced ? 0 : Math.sin(time * 2) * 0.05);
  o.mast.visible = show && !HAS.c5; o.glint.visible = o.mast.visible; if (o.mast.visible) { o.mast.position.y = -SG_TOP - 0.5 + (reduced ? 0 : Math.sin(time * 1.1) * 0.04); o.mast.userData.flag.rotation.y = reduced ? 0 : Math.sin(time * 2.2) * 0.35; const tw = reduced ? 0.6 : Math.max(0, Math.sin(time * 2.6)) * Math.max(0, Math.sin(time * 0.9 + 1)); o.glint.scale.setScalar(0.5 + tw * 1.3); o.glint.material.opacity = 0.35 + tw * 0.65; o.glint.material.rotation = time * 0.6; }
  o.bub.forEach((b, k) => { b.visible = o.mast.visible && !reduced; const u = (time * 0.5 + k * 0.37) % 1; b.position.set(SG_AT.fore[0] - 1.1 + Math.sin(k * 2.4) * 0.8 + Math.sin(time * 3 + k) * 0.04, -0.5 + u * 0.75, SG_AT.fore[1] + 0.5 + Math.cos(k * 1.7) * 0.6); b.scale.setScalar((0.6 + (k % 3) * 0.3) * Math.sin(u * Math.PI)); });
  /* the helmet on Pip: in the garden and on the turtle */
  const inside = open && !SG.pop && sgIn(pp.x, pp.z), wear = !!S.helm && (inside || !!SG.trip) && !inCave;
  { const hd = typeof pb !== 'undefined' && pb && pb.userData.head; if (wear && hd) { if (!SG.helm) { SG.helm = sgHelmet(); SG.helm.position.set(0, 0.03, 0.02); SG.helm.scale.setScalar(1.02); } if (SG.helm.parent !== hd) hd.add(SG.helm); } if (SG.helm) SG.helm.visible = wear; }
  /* the turtle */
  if (S.helm && !SG.turtle) { SG.turtle = sgTurtleMake(1); sgTurtleRest(inside, 1); splash(SG_AT.sea[0], -0.3, SG_AT.sea[1], 10); }
  if (SG.turtle) { SG.turtle.visible = show; if (!SG.trip) sgTurtleRest(inside, dt); }
  if (!SG.g) return; const g = SG.g;
  if (SG.pop) { SG.pop = Math.min(1, SG.pop + dt * 1.1); const e = SG.pop * SG.pop * (3 - 2 * SG.pop); g.scale.set(0.3 + 0.7 * e, Math.max(0.01, e), 0.3 + 0.7 * e); if (SG.pop >= 1) { SG.pop = 0; g.scale.setScalar(1); burst(SGX, 4.4, SGZ + 3, 18); } }
  g.visible = show; SG.fish.forEach((F) => { F.m.visible = show && !SG.pop && !far; }); SG.bubs.visible = show && !SG.pop && !far;
  /* walls: nobody walks into the standing water from the beach; inside, Pip keeps to the sand in front of the wreck and round its ends */
  if (!inCave && !SC.ride && !enSleep) {
    if (SG.on && MS.on !== SG.on) SG.on = null; /* carried off some other way */
    if (SG.on && MS.want && MS.want[1] < SG.on.z0 - 0.1) { const c = SG.clams.find((q) => q.D.lv === SG_LEDGE.indexOf(SG.on)); if (c) { target.set(c.x - 0.55, 0, c.z); MS.want = null; } } /* a tap further up the wreck: on to this ledge's clam */
    if (SG.on) { const L = SG.on, hx = L.w / 2 - 0.32, hz = L.d / 2 - 0.32, tx = clamp(target.x, L.x - hx, L.x + hx), tz = clamp(target.z, L.z - hz, L.z + hz), out = Math.hypot(target.x - tx, target.z - tz), down = MS.want || out > 0.3;
      if (down && Math.hypot(pp.x - tx, pp.z - tz) < 0.14 && !SG.bub && !GO.hold) { SG.offT = (SG.offT || 0) + dt; if (SG.offT > 0.22) { SG.offT = 0; sgDown(L); } } else SG.offT = 0; }
    else if (inside && state.ctrl === 'tap' && target.z < -3.3 && target.x > 48.3 && target.x < 53.7 && Math.hypot(target.x - pp.x, target.z - pp.z) > 0.3) target.set(SG_CLAMS[0].x + 0.5, 0, SG_CLAMS[0].z + 0.35); /* a tap on the wreck: to the first bubble clam */
    if (SG.on) {}     else if (inside) { pp.x = clamp(pp.x, SGX - 4.45, SGX + 4.45); pp.z = clamp(pp.z, SGZ - 2.15, SGZ + 4.55); target.x = clamp(target.x, SGX - 4.85, SGX + 4.85); target.z = clamp(target.z, SGZ - 2.5, SGZ + 4.95); SG_BOX.forEach((b) => mesaOut(b, pp, 0.3));
      SG_SOLID.forEach(([x, z, r]) => { const dx = pp.x - x, dz = pp.z - z, d = Math.hypot(dx, dz); if (d < r && d > 0.001) { pp.x = x + dx / d * r; pp.z = z + dz / d * r; } }); pp.y = 0.04; }
    else if (HAS.c5) mesaOut({ x: SGX, z: SGZ, w: 11.8, d: 11.8 }, pp, 0.25);
  }
  if (far) return;
  /* day and night on everything that makes its own light */
  SG.mats.forEach((m) => { m.color.copy(m.userData.c0).multiplyScalar(1 - 0.6 * nt); });
  /* the water: light running over the top and over the sand, shafts that breathe, the flag */
  const tt = reduced ? 0 : time; SG.c1.material.map.offset.set(tt * 0.021, tt * 0.013); SG.c2.material.map.offset.set(-tt * 0.016, tt * 0.019 + 0.3); SG.f1.material.map.offset.set(tt * 0.03, -tt * 0.018); SG.f2.material.map.offset.set(-tt * 0.022, -tt * 0.027 + 0.5);
  SG.shafts.forEach((m, k) => { m.material.opacity = (0.2 + 0.1 * Math.sin(tt * 0.6 + k * 1.9)) * (1 - 0.7 * nt); m.position.x += reduced ? 0 : Math.sin(tt * 0.25 + k) * dt * 0.05; });
  SG.fore.userData.flag.rotation.y = reduced ? 0 : Math.sin(time * 2.2) * 0.4;
  /* the bell: it glints while it waits; Pip on the deck beside it gets it; afterwards it rings */
  const bd = Math.hypot(pp.x - SG_AT.bell[0], pp.z - SG_AT.bell[1]), onDeck = SG.on === SG_LEDGE[2]; SG.bellT = Math.max(0, SG.bellT - dt); SG.bell.rotation.x = Math.sin(SG.bellT * 9) * SG.bellT * 0.35;
  SG.bellSp.visible = !sgBell(); if (SG.bellSp.visible) { const tw = reduced ? 0.7 : 0.6 + 0.4 * Math.sin(time * 3.1); SG.bellSp.scale.setScalar(0.9 * tw + 0.5); SG.bellSp.material.rotation = time * 0.5; }
  if (bd > 1.3) SG.bellArm = true;
  if (onDeck && bd < 0.8 && SG.bellArm && !SC.ride && !GO.hold) { SG.bellArm = false; SG.bellT = 1.6; Snd.play('bell', { gain: 0.5, f: 'E6' }); Snd.play('bell', { gain: 0.4, f: 'A5' }, 0.28);
    if (!sgBell()) { goldGive('shipbell'); SG.bell.userData.m.material = sgBronze(); nodes.forEach((q) => { if (q.kind === 'clam') q.sgWas = q.st === 'ready'; }); } }
  /* the bubble clams */
  sgBubStep(dt); const lv = SG.on ? SG_LEDGE.indexOf(SG.on) : -1;
  SG.clams.forEach((c, k) => { const d = Math.hypot(pp.x - c.x, pp.z - c.z); if (d > 1.05) c.arm = true; c.open += (c.want - c.open) * Math.min(1, dt * 7); c.lid.rotation.x = -c.open * 1.05 - (reduced ? 0 : Math.max(0, Math.sin(time * 2.4 + k * 1.3)) * 0.1);
    if (inside && !SG.bub && !SC.ride && !SG.fly && c.arm && d < 0.75 && c.D.lv === lv && !GO.hold && !enSleep) sgBlow(c); });
  /* fish: each school follows a slow loop over the garden, one after the other like beads on a string */
  SG.fish.forEach((F) => { const sp = reduced ? 0.25 : 1, at = (s, out) => { if (F.low) return out.set(SGX + 1.2 + Math.sin(s * 0.9) * 2.6, 0.95 + Math.sin(s * 1.7) * 0.3, SGZ + 3.3 + Math.sin(s * 1.8 + 1) * 1.0);
      return out.set(SGX + Math.sin(s * 0.55 + F.ph) * 4.1, 2.75 + F.k * 0.28 + Math.sin(s * 0.9 + F.ph * 2) * 0.3, SGZ - 0.6 + Math.sin(s * 0.38 + F.ph * 1.7) * 3.6); };
    for (let i = 0; i < F.n; i++) { const s = time * 0.5 * sp + F.ph * 3 - i * 0.1 - hash(i, F.k + 4) * 0.12, a = at(s, tmpV), ox = (hash(i, F.k + 5) - 0.5) * 0.9, oy = (hash(i, F.k + 6) - 0.5) * 0.5, x0 = a.x, y0 = a.y, z0 = a.z, b = at(s + 0.05, tmpV);
      sgDummy.position.set(x0 + ox, y0 + oy + Math.sin(time * 3 + i) * 0.03, z0 + ox * 0.6); sgDummy.rotation.set(0, Math.atan2(b.x - x0, b.z - z0) + Math.sin(time * 9 + i * 2) * 0.18, 0); sgDummy.scale.setScalar(0.8 + hash(i, F.k) * 0.5); sgDummy.updateMatrix(); F.m.setMatrixAt(i, sgDummy.matrix); }
    F.m.instanceMatrix.needsUpdate = true; });
  /* bubbles: up from the clams, the wreck and the sand, to the top of the water */
  SG.bl.forEach((b, k) => { let x, y, z, sz; b.t += dt;
    if (b.at) { y = b.at[1] + b.t * 1.5; x = b.at[0]; z = b.at[2]; sz = 0.9; if (y > SG_TOP) b.at = null; }
    else { const v = SG_VENT[k % SG_VENT.length], u = (time * (0.11 + (k % 5) * 0.017) + k * 0.37) % 1; y = v[2] + u * 4.6; x = v[0]; z = v[1]; sz = (0.45 + (k % 4) * 0.3) * Math.min(1, u * 8) * (reduced ? 0 : 1); }
    if (y > SG_TOP - 0.03) sz = 0.001; sgDummy.position.set(x + Math.sin(time * 2.2 + k * 1.3) * 0.07, Math.min(y, SG_TOP), z + Math.cos(time * 1.9 + k) * 0.05); sgDummy.rotation.set(0, 0, 0); sgDummy.scale.setScalar(Math.max(0.001, sz)); sgDummy.updateMatrix(); SG.bubs.setMatrixAt(k, sgDummy.matrix); });
  SG.bubs.instanceMatrix.needsUpdate = true;
}
ISLE_STEPS.push(sgStep);
