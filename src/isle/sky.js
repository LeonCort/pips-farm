/* ---------- the Giant's Sky Garden (stone island, area s5): a hidden world (secret.js says how they plug in) ----------
   The High Table (mesa.js, s4a) is the first step: a rope ladder of marsh reed opens it. A great kite is tied to a stone
   on its top and can be seen tugging in the wind long before the ladder hangs there. Standing on the rope ring beside it,
   Pip is carried up and over a bank of cloud, and a garden rises out of the clouds: a stone giant asleep on his back,
   his table and chair, giant vegetables, and four wind stones (stone hoops that sing a note when Pip walks through).
   A little wind wisp flies the hoops in the right order; played so, the giant wakes, yawns and opens his hand, and in it
   lies the golden hammer (gold.js, goldGive('hammer')). A wrong hoop only makes him snore, and the wisp shows it again.
   From then on a second kite sails over the whole stone island, and every rock table grows a little garden with an
   iron-flower that gives a piece of iron each time it blooms.
   The garden lies west of the High Table behind a bank of cloud: the only way in and out is the kite.
   state.isle.sky = { won: 1 } once the giant is awake; state.isle.areas.s5 once the garden has risen. */
const SKG = { g: null, pop: 0, k: 0, seq: [0, 2, 1, 3], hoops: [], solid: [], boxes: [], wake: 0, pend: 0, kite: null, rT: null, rG: null, cl: [], drift: [], streaks: [], hist: [], beads: [], w: { mode: 'wait', i: 0, t: 5, hold: 0 }, wrong: 0, snT: 0, tabs: [], kite2: null, v: new T.Vector3(), v2: new T.Vector3() };
const SKG_NOTE = [523.25, 659.25, 783.99, 1046.5], SKG_COL = ['#ff7a6b', '#ffd24a', '#5cc4f4', '#b78cf0'];
const SKG_HOOP = [[-2.6, 0.6], [-1.3, 3.2], [1.3, 3.2], [2.6, 0.6]], SKG_MID = [0, 1.3], SKG_HAND = [-1.1, -0.8], SKG_RING = [-4.2, 3.6], SKG_TIE = [-5.0, 4.6];
const SKG_TAB = { tie: [-1.95, -1.45], ring: [-1.5, -0.15] }; /* on the High Table, from its middle */
const SKG_WIND = [-0.8, 0.6]; /* the way the wind blows up here */
const skgS = () => state.isle.sky || (state.isle.sky = {});
const skgWon = () => !!skgS().won;
const skgCloudMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, emissive: new T.Color('#dbe6f2'), emissiveIntensity: 0.32 });
const skgKiteMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, side: T.DoubleSide, emissive: new T.Color('#5a3a30'), emissiveIntensity: 0.35 });
const skgIronMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.55, emissive: new T.Color('#5d6c7e'), emissiveIntensity: 0.25 });
ISLE_ICON.kite = (x) => {
  x.beginPath(); x.moveTo(0, 13); x.quadraticCurveTo(9, 15, 6, 21); x.quadraticCurveTo(4, 25, 11, 25); x.lineWidth = 2.4; x.stroke(); x.lineWidth = 3;
  [[7, 17, '#5cc4f4'], [6, 24, '#ffd24a']].forEach(([a, b, c]) => { x.beginPath(); x.moveTo(a - 4, b - 3); x.lineTo(a + 4, b + 3); x.lineTo(a + 4, b - 3); x.lineTo(a - 4, b + 3); x.closePath(); x.fillStyle = c; x.fill(); x.lineWidth = 1.6; x.stroke(); x.lineWidth = 3; });
  x.beginPath(); x.moveTo(0, -23); x.lineTo(15, -6); x.lineTo(0, 13); x.lineTo(-15, -6); x.closePath(); x.fillStyle = '#f2604f'; x.fill();
  x.beginPath(); x.moveTo(0, -23); x.lineTo(15, -6); x.lineTo(0, -6); x.closePath(); x.fillStyle = '#fff3d6'; x.fill(); x.beginPath(); x.moveTo(-15, -6); x.lineTo(0, -6); x.lineTo(0, 13); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(0, -23); x.lineTo(15, -6); x.lineTo(0, 13); x.lineTo(-15, -6); x.closePath(); x.stroke(); x.beginPath(); x.moveTo(0, -23); x.lineTo(0, 13); x.moveTo(-15, -6); x.lineTo(15, -6); x.lineWidth = 1.8; x.stroke();
};
/* a limb of stone from a to b */
function skgLimb(a, b, r0, r1, n) {
  const d = new T.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), len = d.length(), q = new T.CylinderGeometry(r1, r0, len, n || 7);
  q.applyMatrix4(new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()))); q.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); return q;
}
const skgRock = (base, sd, moss) => (cx, cy, cz, i) => (moss && hash(i, sd) > moss ? tone(hash(i, sd + 2) > 0.5 ? '#8fae6a' : '#7c9c5c', i, 0.4) : tone(hash(i, sd + 1) > 0.55 ? base : '#d3ccbc', i, 0.45));
const skgFlat = (L, mat, g) => { const m = merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), mat || MAT, g); return m; };
/* ---- the kite: a red and cream diamond with a tail of bows; its handle is the group's middle ---- */
function skgKiteMake(c0, c1) {
  const g = new T.Group(), sail = new T.Group(), tail = new T.Group(); let q, L = [];
  const V = { t: [0, 1.0, 0], b: [0, -1.25, 0], l: [-0.8, 0.2, 0], r: [0.8, 0.2, 0], c: [0, 0.2, -0.16] }, P = [], C = [];
  [['t', 'l', 'c', c0], ['t', 'c', 'r', c1], ['l', 'b', 'c', c1], ['c', 'b', 'r', c0]].forEach(([a, b, c, col]) => { const k = new T.Color(col); [a, b, c].forEach((n) => { P.push(V[n][0], V[n][1], V[n][2]); C.push(k.r, k.g, k.b); }); });
  q = new T.BufferGeometry(); q.setAttribute('position', new T.Float32BufferAttribute(P, 3)); q.setAttribute('color', new T.Float32BufferAttribute(C, 3)); q.computeVertexNormals();
  const sm = new T.Mesh(q, skgKiteMat); sm.castShadow = true; sail.add(sm);
  q = new T.BoxGeometry(0.04, 2.25, 0.04); q.translate(0, -0.125, 0.03); L.push(fac(q, '#8a5f3c', 9701)); q = new T.BoxGeometry(1.6, 0.04, 0.04); q.translate(0, 0.2, 0.03); L.push(fac(q, '#8a5f3c', 9702));
  skgFlat(L, MAT, sail); L = [];
  for (let k = 0; k < 5; k++) { const y = -0.3 - k * 0.3, x = Math.sin(k * 1.1) * 0.1;
    q = new T.CylinderGeometry(0.012, 0.012, 0.32, 4); q.translate(x * 0.5, y + 0.16, 0); L.push(fac(q, '#fff3d6', 9710 + k));
    [-1, 1].forEach((s) => { q = new T.ConeGeometry(0.09, 0.17, 4); q.rotateZ(s * Math.PI / 2); q.translate(x + s * 0.085, y, 0); L.push(fac(q, () => new T.Color([c0, '#5cc4f4', '#ffd24a'][k % 3]), 9720 + k)); }); }
  tail.position.set(0, -1.25, 0); skgFlat(L, skgKiteMat, tail); sail.add(tail); sail.rotation.order = 'YXZ'; g.add(sail);
  const line = new T.Mesh(new T.CylinderGeometry(0.014, 0.014, 1, 4).translate(0, 0.5, 0), new T.MeshBasicMaterial({ color: '#fff6e4' })); g.add(line);
  L = []; q = new T.BoxGeometry(0.5, 0.055, 0.055); L.push(fac(q, '#8a5f3c', 9730)); skgFlat(L, MAT, g);
  g.userData = { sail, tail, line, up: 2.7, fwd: 1.3 }; return g;
}
/* place the sail over the handle: up and ahead (along the group's own +z), always showing its face to us */
function skgKitePose(g, up, fwd, ph) {
  const U = g.userData, w = reduced ? 0 : 1; U.up += (up - U.up) * 0.08; U.fwd += (fwd - U.fwd) * 0.08;
  const y = U.up + w * Math.sin(time * 2.3 + ph) * 0.12, z = U.fwd + w * Math.sin(time * 1.7 + ph * 2) * 0.1, x = w * Math.sin(time * 1.3 + ph) * 0.14;
  U.sail.position.set(x, y, z); U.sail.rotation.set(-0.5 + w * Math.sin(time * 2.1 + ph) * 0.07, -g.rotation.y + w * Math.sin(time * 1.5 + ph) * 0.22, w * Math.sin(time * 2.7 + ph) * 0.1);
  U.tail.rotation.z = w * Math.sin(time * 3.1 + ph) * 0.3; U.tail.rotation.x = 0.25 + w * Math.sin(time * 2.4 + ph) * 0.12;
  const by = y - 1.25 * 0.88, bz = z + 0.2 * 0.48, len = Math.hypot(x, by, bz); U.line.scale.y = len; U.line.rotation.set(Math.atan2(bz, by), 0, -Math.atan2(x, Math.hypot(by, bz)));
}
/* a stone with an iron ring, to tie a kite to */
function skgTieGeo(L, x, y, z, sd) {
  let q = ico(0.34, 1, sd, 0.05); q.scale(1, 0.85, 1); q.translate(x, y + 0.2, z); L.push(fac(q, skgRock('#b9b2a2', sd, 0.8), sd));
  q = new T.TorusGeometry(0.13, 0.035, 5, 10); q.translate(x, y + 0.56, z); L.push(fac(q, () => tone('#5d6c7e', sd, 0.2), sd + 1));
}
/* ---- on the High Table: the tether stone, the kite and its rope ring ---- */
function skgTableMake(m) {
  const top = mesaTop(m), L = [], g = new T.Group(); sc.add(g); SKG.tg = g;
  skgTieGeo(L, m.x + SKG_TAB.tie[0], top, m.z + SKG_TAB.tie[1], 9740); skgFlat(L, MAT, g);
  SKG.tie = [m.x + SKG_TAB.tie[0], top + 0.56, m.z + SKG_TAB.tie[1]]; SKG.T = [m.x + SKG_TAB.ring[0], top, m.z + SKG_TAB.ring[1]]; SKG.m = m;
  SKG.kite = skgKiteMake('#f2604f', '#fff3d6'); sc.add(SKG.kite);
  SKG.rT = ringMake({ x: SKG.T[0], z: SKG.T[2], y: top, icon: 'kite', ok: () => !m.locked && !m.pop && !SKG.pend && MS.on === m, go: (r) => {
    if (HAS.s5) { if (SKG.g) skgFly(true); else r.armed = true; return; }
    if (secretOpen('s5')) { SKG.pend = 0.001; Snd.play('whoosh', { gain: 0.4, dur: 1.2 }); } else r.armed = true; } });
  SKG.rT.ring.rotation.x = -Math.PI / 2;
  /* before the garden has risen a lone bank of cloud lies on the sea west of the table, and the kite pulls toward it */
  if (!HAS.s5) { const A = AREA_BY.s5, V = []; for (let k = 0; k < 22; k++) { const a = hash(k, 10250) * 6.283, r = Math.sqrt(hash(k, 10251)) * 4.6, q = skgPuff(0.9 + hash(k, 10252) * 0.9, 10253 + k, 1.3, 0.5, 1.1); q.translate(Math.cos(a) * r, 0.25 + hash(k, 10254) * 0.5 + (r < 2 ? 0.5 : 0), Math.sin(a) * r); V.push(q); }
    const v = SKG.veil = skgFlat(V, skgCloudMat, sc); v.position.set(A.cx, 0, A.cz); v.castShadow = false; v.receiveShadow = false; }
}
/* ---- the ride: up from the table, over the cloud bank and the garden, down by the kite stone; and back ---- */
function skgFly(out) {
  if (riding2() || !SKG.T || !SKG.G) return; const Tp = SKG.T, Gp = SKG.G, A = AREA_BY.s5;
  const P = [[Tp[0], Tp[1], Tp[2]], [Tp[0] - 1.7, Tp[1] + 1.5, Tp[2] + 0.5], [A.cx + 3.4, 4.2, A.cz - 1.0], [A.cx + 0.4, 4.0, A.cz + 0.9], [A.cx - 2.3, 2.5, A.cz + 2.5], [Gp[0], 0, Gp[2]]]; if (!out) P.reverse();
  SKG.fly = 1; Snd.play('whoosh', { gain: 0.45, dur: 1.4 }); Snd.play('jump', { gain: 0.3 });
  rideGo({ pts: P, speed: 4.0, mesh: SKG.kite, keep: 1, snd: 'powerup',
    each: () => { SKG.kite.position.y += 1.5; limbs.forEach((l) => { if (l.arm) { l.g.rotation.x = -2.85; } }); skgKitePose(SKG.kite, 1.9, 1.1, 0); },
    onEnd: () => { SKG.fly = 0; const pp = pip.position; Snd.play('pop', { gain: 0.4, f: 520 }); Snd.play('sparkle', { gain: 0.3 });
      if (out) { SKG.rG.armed = false; if (!skgWon()) { SKG.w.mode = 'demo'; SKG.w.i = 0; SKG.w.t = -1.2; SKG.w.hold = 0; } if (typeof dog !== 'undefined' && dog && dog.g) dog.g.position.set(pp.x + 0.9, 0, pp.z + 0.5); }
      else { SKG.rT.armed = false; MS.on = SKG.m; pp.y = mesaTop(SKG.m); target.copy(pp); if (typeof dog !== 'undefined' && dog && dog.g) dog.g.position.set(SKG.m.x + SKG.m.lx + 0.8, 0, SKG.m.z + SKG.m.d / 2 + 1.2); } } });
}
/* ---- the cloud bank round the rim ---- */
function skgPuff(r, sd, sx, sy, sz) { const q = ico(r, 1, sd, r * 0.07); q.scale(sx, sy, sz); return fac(q, (cx, cy, cz, i) => new T.Color('#ffffff').lerp(new T.Color('#cfdcec'), clamp(0.5 - cy / (r * sy) * 0.6, 0, 1) * 0.75 + hash(i, sd) * 0.06), sd); }
function skgClouds(g) {
  const sq = (t, R) => { const p = t * 4, s = Math.floor(p) % 4, u = (p - Math.floor(p)) * 2 - 1; return s === 0 ? [u * R, -R] : s === 1 ? [R, u * R] : s === 2 ? [-u * R, R] : [-R, -u * R]; };
  const Ls = [[], [], [], []]; let n = 0;
  const row = (N, R, dR, r0, r1, y0, y1, sy, sd) => { for (let k = 0; k < N; k++) { let [x, z] = sq((k + hash(k, sd) * 0.6) / N, R + (hash(k, sd + 1) - 0.5) * dR); let r = r0 + hash(k, sd + 2) * (r1 - r0);
    if (x > 5.2) { if (R > 6.6) continue; x = Math.min(x, 5.95); r = Math.min(r, 0.78); } /* the east side is the stone island: only a narrow bank */
    if (R > 6.6 && x > 6.2 - r) continue;
    const q = skgPuff(r, sd + 10 + k, 1.25, sy, 1.05); q.rotateY(hash(k, sd + 3) * 6.28); q.translate(x, y0 + hash(k, sd + 4) * (y1 - y0), z); Ls[n++ % 4].push(q); } };
  row(66, 6.05, 0.7, 0.62, 1.05, 0.12, 0.42, 0.62, 9800); row(30, 5.6, 0.3, 0.4, 0.62, 0.05, 0.2, 0.6, 9900); row(44, 7.4, 0.7, 1.0, 1.5, 0.0, 0.25, 0.5, 10000); row(34, 9.0, 0.8, 1.4, 2.0, -0.1, 0.12, 0.36, 10100); row(30, 11.0, 0.9, 1.9, 2.6, -0.15, 0.1, 0.3, 10150); row(28, 13.2, 1.0, 2.3, 3.1, -0.2, 0.05, 0.26, 10180);
  /* piled high in the corners, so the square reads as round */
  [[-5.7, -5.7], [5.5, -5.8], [-5.8, 5.6], [5.4, 5.7]].forEach(([x, z], k) => { for (let j = 0; j < 4; j++) { const q = skgPuff(0.7 + hash(k, j + 60) * 0.5, 10200 + k * 5 + j, 1.2, 0.7, 1.1); q.translate(Math.min(5.9, x + (hash(k, j + 70) - 0.5) * 1.6), 0.3 + j * 0.28, z + (hash(k, j + 80) - 0.5) * 1.6); Ls[(k + j) % 4].push(q); } });
  Ls.forEach((L, k) => { const m = skgFlat(L, skgCloudMat, g); m.castShadow = false; m.receiveShadow = false; SKG.cl.push({ m, ph: k * 1.7 }); });
  /* little clouds that drift through the garden at Pip's feet */
  for (let k = 0; k < 4; k++) { const m = new T.Mesh(skgPuff(0.34 + k * 0.05, 10300 + k, 1.4, 0.55, 1), skgCloudMat); g.add(m); SKG.drift.push({ m, u: k / 4, z: -4 + k * 2.6 }); }
}
/* ---- the giant: asleep on his back along the north side, his head to the west, one hand out on the lawn ---- */
function skgGiant(g, L) {
  let q; const Z = -3.7, st = skgRock('#bdb6a6', 9500, 0.86);
  q = ico(0.8, 1, 9501, 0.06); q.scale(1.15, 0.35, 1.35); q.translate(-4.3, 0.2, Z); L.push(fac(q, skgRock('#a9a393', 9501, 0.9), 9501)); /* his pillow */
  [-4.22, -3.2].forEach((z, k) => { q = new T.CylinderGeometry(0.42, 0.36, 2.6, 8, 3); jit(q, 0.03, 9503 + k); q.rotateZ(Math.PI / 2); q.translate(1.7, 0.42, z); L.push(fac(q, skgRock('#b5ae9e', 9503 + k, 0.8), 9503 + k));
    q = ico(0.5, 1, 9506 + k, 0.04); q.scale(0.6, 1.05, 0.72); q.translate(3.3, 0.72, z); L.push(fac(q, st, 9506 + k));
    for (let j = 0; j < 4; j++) { q = ico(0.12 - j * 0.012, 1, 9510 + k * 4 + j); q.translate(3.36, 1.28 - j * 0.02, z + (k ? 1 : -1) * (0.26 - j * 0.17)); L.push(fac(q, st, 9510 + k)); } });
  q = ico(0.45, 1, 9520, 0.04); q.scale(2.3, 0.7, 0.8); q.translate(-1.5, 0.3, -4.95); L.push(fac(q, st, 9520)); /* the far arm */
  const S = [-2.75, 0.8, -2.9], E = [-2.1, 0.34, -1.8], W = [-1.42, 0.3, -1.12];
  L.push(fac(skgLimb(S, E, 0.4, 0.34), st, 9522), fac(skgLimb(E, W, 0.33, 0.27), st, 9523)); q = ico(0.42, 1, 9524, 0.04); q.translate(S[0], S[1], S[2]); L.push(fac(q, st, 9524)); q = ico(0.36, 1, 9525, 0.03); q.translate(E[0], E[1], E[2]); L.push(fac(q, st, 9525));
  /* the body breathes: chest and belly are one piece that swells; moss, flowers and a small bird ride on it */
  const tor = SKG.tor = new T.Group(); tor.position.set(-1.4, 0, Z); g.add(tor); let P = [];
  q = ico(1.1, 2, 9530, 0.04); q.scale(1.3, 0.86, 1.1); q.translate(-0.95, 0.74, 0); P.push(fac(q, (cx, cy, cz, i) => (cy > 1.25 && hash(i, 9531) > 0.45 ? tone('#8fae6a', i, 0.4) : st(cx, cy, cz, i)), 9530));
  q = ico(1.15, 2, 9532, 0.04); q.scale(1.25, 0.9, 1.12); q.translate(0.8, 0.78, 0); P.push(fac(q, (cx, cy, cz, i) => (cy > 1.35 && hash(i, 9533) > 0.3 ? tone(hash(i, 3) > 0.5 ? '#8fae6a' : '#9cc071', i, 0.4) : st(cx, cy, cz, i)), 9532));
  for (let k = 0; k < 9; k++) { const x = -0.2 + hash(k, 9540) * 1.9, z = (hash(k, 9541) - 0.3) * 1.0; q = ico(0.07, 0, 9542 + k); q.translate(x, 1.8 - Math.abs(x - 0.8) * 0.12 - z * z * 0.25, z); P.push(fac(q, () => new T.Color(['#ffffff', '#ffd24a', '#f6c1d0'][k % 3]), 9542 + k)); }
  q = ico(0.14, 1, 9552); q.scale(1.2, 1, 1); q.translate(0.2, 1.93, 0.25); P.push(fac(q, () => new T.Color('#e8704a'), 9552)); q = ico(0.09, 1, 9553); q.translate(0.34, 2.05, 0.25); P.push(fac(q, () => new T.Color('#6a4a3a'), 9553)); q = new T.ConeGeometry(0.03, 0.09, 4); q.rotateZ(-Math.PI / 2); q.translate(0.46, 2.05, 0.25); P.push(fac(q, () => new T.Color('#f2c23c'), 9554));
  skgFlat(P, MAT, tor);
  /* the head lies on its side on the pillow, the face turned to us */
  const hd = SKG.head = new T.Group(); hd.position.set(-4.05, 0.98, Z + 0.1); hd.rotation.set(-0.62, 0, Math.PI / 2); g.add(hd); P = [];
  q = ico(0.85, 2, 9560, 0.035); q.scale(1, 1.06, 0.95); P.push(fac(q, (cx, cy, cz, i) => (cy > 0.42 + hash(i, 9561) * 0.2 ? tone(hash(i, 5) > 0.5 ? '#8fae6a' : '#7c9c5c', i, 0.4) : st(cx, cy, cz, i)), 9560));
  q = ico(0.21, 1, 9562); q.scale(0.9, 1.15, 1); q.translate(0, -0.06, 0.84); P.push(fac(q, () => tone('#c9c2b2', 1, 0.2), 9562));
  [-1, 1].forEach((s) => { q = ico(0.2, 1, 9563 + s); q.scale(0.5, 1, 0.8); q.translate(s * 0.86, 0, 0); P.push(fac(q, st, 9563 + s));
    q = new T.BoxGeometry(0.34, 0.075, 0.1); q.rotateZ(-s * 0.18); q.translate(s * 0.33, 0.36, 0.76); P.push(fac(q, () => tone('#6f8d50', s, 0.3), 9566 + s));
    q = ico(0.15, 1, 9568 + s); q.scale(1, 0.8, 0.3); q.translate(s * 0.52, -0.2, 0.7); P.push(fac(q, () => new T.Color('#e3b9a8'), 9568 + s)); });
  for (let k = 0; k < 9; k++) { const a = -1.3 + k * 0.325; q = ico(0.2 + hash(k, 9570) * 0.07, 1, 9571 + k, 0.03); q.translate(Math.sin(a) * 0.62, -0.5 - Math.cos(a) * 0.3, 0.5 + Math.cos(a) * 0.12); P.push(fac(q, (cx, cy, cz, i) => tone(k % 2 ? '#8fae6a' : '#7c9c5c', i + k, 0.4), 9571 + k)); }
  [[-0.3, 0.86, 0.2, '#ffd24a'], [0.2, 0.9, 0.1, '#ffffff'], [0.45, 0.76, 0.3, '#f6c1d0'], [-0.5, 0.7, 0.35, '#ffffff'], [-0.3, -0.92, 0.5, '#ffffff'], [0.25, -0.95, 0.55, '#ffd24a']].forEach(([x, y, z, c], k) => { q = ico(0.075, 0, 9590 + k); q.translate(x, y, z); P.push(fac(q, () => new T.Color(c), 9590 + k)); });
  skgFlat(P, MAT, hd);
  P = []; [-1, 1].forEach((s) => { q = new T.TorusGeometry(0.13, 0.032, 4, 8, Math.PI); q.rotateZ(Math.PI); q.translate(s * 0.33, 0.2, 0.8); P.push(fac(q, () => new T.Color('#4a4238'), 9600)); }); SKG.eyeC = skgFlat(P, MAT, hd); SKG.eyeC.castShadow = false;
  P = []; [-1, 1].forEach((s) => { q = new T.SphereGeometry(0.125, 10, 8); q.scale(1, 1.1, 0.5); q.translate(s * 0.33, 0.14, 0.78); P.push(fac(q, () => new T.Color('#ffffff'), 9601)); q = new T.SphereGeometry(0.065, 8, 6); q.scale(1, 1, 0.5); q.translate(s * 0.33 + 0.02, 0.12, 0.84); P.push(fac(q, () => new T.Color('#3a2c24'), 9602)); }); SKG.eyeO = skgFlat(P, MAT, hd); SKG.eyeO.castShadow = false;
  P = []; q = new T.TorusGeometry(0.2, 0.032, 4, 9, Math.PI); q.rotateZ(Math.PI); q.translate(0, -0.34, 0.8); P.push(fac(q, () => new T.Color('#4a4238'), 9603)); SKG.mouC = skgFlat(P, MAT, hd); SKG.mouC.castShadow = false;
  P = []; q = new T.SphereGeometry(0.2, 10, 8); q.scale(1, 1.15, 0.4); P.push(fac(q, () => new T.Color('#5a3b34'), 9604)); q = new T.SphereGeometry(0.11, 8, 6); q.scale(1.1, 0.6, 0.4); q.translate(0, -0.12, 0.04); P.push(fac(q, () => new T.Color('#e88a8a'), 9605)); SKG.mouO = skgFlat(P, MAT, hd); SKG.mouO.position.set(0, -0.44, 0.78); SKG.mouO.castShadow = false;
  /* the hand: palm up on the lawn, four fingers and a thumb curled over what he holds */
  const h = SKG.hand = new T.Group(); h.position.set(SKG_HAND[0], 0, SKG_HAND[1]); h.rotation.y = -Math.PI / 4; g.add(h); P = [];
  q = ico(0.6, 1, 9610, 0.04); q.scale(1, 0.32, 0.9); q.translate(0, 0.2, 0); P.push(fac(q, st, 9610)); q = skgLimb([-0.75, 0.28, 0], [-0.3, 0.22, 0], 0.27, 0.3); P.push(fac(q, st, 9611)); skgFlat(P, MAT, h);
  SKG.fing = []; [-0.39, -0.13, 0.13, 0.39].forEach((z, k) => { const a = new T.Group(), b = new T.Group(), len = k === 0 || k === 3 ? 0.36 : 0.42; a.position.set(0.44, 0.3, z); b.position.set(len, 0, 0); h.add(a); a.add(b);
    let R = []; q = new T.CylinderGeometry(0.125, 0.135, len, 7); q.rotateZ(-Math.PI / 2); q.translate(len / 2, 0, 0); R.push(fac(q, st, 9620 + k)); q = ico(0.14, 1, 9624 + k); R.push(fac(q, st, 9624 + k)); skgFlat(R, MAT, a);
    R = []; q = new T.CylinderGeometry(0.105, 0.12, 0.34, 7); q.rotateZ(-Math.PI / 2); q.translate(0.17, 0, 0); R.push(fac(q, st, 9630 + k)); q = ico(0.125, 1, 9634 + k); R.push(fac(q, st, 9634 + k)); q = ico(0.115, 1, 9638 + k); q.translate(0.34, 0, 0); R.push(fac(q, st, 9638 + k)); skgFlat(R, MAT, b);
    SKG.fing.push({ a, b }); });
  { const a = SKG.thumb = new T.Group(); a.position.set(-0.05, 0.3, 0.5); h.add(a); const R = []; q = new T.CylinderGeometry(0.115, 0.14, 0.42, 7); q.rotateZ(-Math.PI / 2); q.translate(0.21, 0, 0); R.push(fac(q, st, 9645)); q = ico(0.15, 1, 9646); R.push(fac(q, st, 9646)); q = ico(0.125, 1, 9647); q.translate(0.42, 0, 0); R.push(fac(q, st, 9647)); skgFlat(R, MAT, a); }
  SKG.gold = new T.Mesh(goldGeo('hammer'), goldMat); SKG.gold.position.set(0.02, 0.62, 0); SKG.gold.scale.setScalar(0.85); h.add(SKG.gold);
  /* his snores: three small puffs of cloud */
  SKG.zz = []; for (let k = 0; k < 3; k++) { const m = new T.Mesh(skgPuff(0.3, 9650 + k, 1.2, 0.8, 1), skgCloudMat); m.visible = false; g.add(m); SKG.zz.push(m); }
  SKG.boxes.push({ x: -0.45, z: Z - 0.1, w: 9.3, d: 2.5 }); SKG.solid.push([S[0] + 0.2, S[2] + 0.5, 0.55], [E[0], E[2], 0.5], [(E[0] + W[0]) / 2, (E[2] + W[2]) / 2, 0.42], [SKG_HAND[0], SKG_HAND[1], 0.62]);
}
/* ---- a wind stone: a stone hoop standing in the lawn, a coloured crystal on its crown and a ribbon in the wind ---- */
function skgHoop(g, L, k) {
  const [x, z] = SKG_HOOP[k], dx = x - SKG_MID[0], dz = z - SKG_MID[1], d = Math.hypot(dx, dz), nx = dx / d, nz = dz / d, ry = Math.atan2(nx, nz), sd = 9660 + k * 9, col = SKG_COL[k]; let q;
  const put = (q2, paint, s) => { q2.rotateY(ry); q2.translate(x, 0, z); L.push(fac(q2, paint, s)); };
  q = new T.TorusGeometry(0.8, 0.2, 6, 16); jit(q, 0.025, sd); q.translate(0, 0.72, 0); put(q, (cx, cy, cz, i) => (cy > 1.25 && hash(i, sd) > 0.6 ? tone('#8fae6a', i, 0.4) : shadeY(hash(i, sd + 1) > 0.5 ? '#c4bdac' : '#d6cfbf', cy, -0.2, 1.7, i, 0.35)), sd);
  [-1, 1].forEach((s) => { q = ico(0.3, 1, sd + 2 + s, 0.05); q.scale(1.1, 0.7, 1.2); q.translate(s * 0.86, 0.1, 0); put(q, skgRock('#a9a393', sd + 2, 0.75), sd + 2 + s); });
  for (let j = 0; j < 7; j++) [-1, 1].forEach((s) => { const a = 0.35 + j * 0.41; q = ico(0.055, 0, sd + 4 + j); q.translate(Math.cos(a) * 0.8, 0.72 + Math.sin(a) * 0.8, s * 0.2); put(q, () => new T.Color(col), sd + 4 + j); });
  const mat = new T.MeshStandardMaterial({ color: col, roughness: 0.3, emissive: new T.Color(col), emissiveIntensity: 0.15 }), gem = new T.Mesh(new T.OctahedronGeometry(0.17, 0), mat); gem.scale.set(1, 1.35, 1); gem.position.set(x, 1.86, z); gem.castShadow = true; g.add(gem);
  const rg = new T.PlaneGeometry(0.8, 0.11, 6, 1); rg.translate(0.4, 0, 0); const rib = new T.Mesh(rg, new T.MeshStandardMaterial({ color: col, roughness: 0.7, side: T.DoubleSide, emissive: new T.Color(col), emissiveIntensity: 0.25 })); rib.position.set(x, 1.6, z); rib.rotation.y = -Math.atan2(SKG_WIND[1], SKG_WIND[0]); g.add(rib);
  SKG.hoops.push({ k, x, z, nx, nz, gem, mat, rib, lit: 0, fl: 0, armed: true }); SKG.solid.push([x + nz * 0.86, z - nx * 0.86, 0.3], [x - nz * 0.86, z + nx * 0.86, 0.3]);
}
/* ---- the garden itself (SECRET_FILL: called when it has risen, and when a save that owns it loads) ---- */
function skgFill(A, fresh) {
  if (SKG.g) return; const g = SKG.g = new T.Group(); g.position.set(A.cx, 0, A.cz); sc.add(g); const L = []; let q; SKG.A = A;
  /* a lawn of its own: bright, soft green up here above the grey island */
  q = new T.PlaneGeometry(11.4, 11.4, 13, 13); q.rotateX(-Math.PI / 2); { const P = q.attributes.position; for (let i = 0; i < P.count; i++) { let x = P.getX(i), z = P.getZ(i); const e = Math.max(Math.abs(x), Math.abs(z)) > 5.6; if (!e) { x += (hash(i, 9401) - 0.5) * 0.4; z += (hash(i, 9402) - 0.5) * 0.4; }
    const r = Math.pow(Math.pow(Math.abs(x / 5.7), 4) + Math.pow(Math.abs(z / 5.7), 4), 0.25); if (r > 1) { x /= r; z /= r; } P.setXYZ(i, x, 0.05 + hash(i, 9403) * 0.004, z); } }
  L.push(fac(q.toNonIndexed(), (cx, cy, cz, i) => tone(['#9ccb6b', '#8fc465', '#a9d577', '#96c868'][Math.floor(hash(i, 9404) * 4)], i, 0.35), 9404));
  lookFoot(A.cx, A.cz, 5.7, 5.7, 0); /* no tall island grass through the lawn */
  for (let k = 0; k < 46; k++) { const x = (hash(k, 9405) - 0.5) * 10.4, z = (hash(k, 9406) - 0.5) * 10.4; if (Math.hypot(x - SKG_MID[0], z - SKG_MID[1]) < 2.3 || z < -2.2 && x < 4.2) continue; for (let j = 0; j < 4; j++) { const h = 0.14 + hash(k * 4 + j, 9407) * 0.14; q = new T.ConeGeometry(0.035, h, 3); q.translate(0, h / 2, 0); q.rotateZ((hash(k * 4 + j, 9408) - 0.5) * 0.7); q.rotateY(j * 1.7 + k); q.translate(x + (j % 2 ? 0.06 : -0.05), 0.045, z + (j > 1 ? 0.05 : -0.05)); L.push(fac(q, () => tone(k % 3 ? '#86c263' : '#b3dc80', k + j, 0.3), 9409 + k)); } }
  /* flagstones: a round place in the middle, and paths to the kite, the giant's hand and his table */
  const flag = (x, z, r, k) => { q = new T.CylinderGeometry(r, r * 1.06, 0.05, 6 + (k % 2)); q.rotateY(hash(k, 9410) * 3); q.translate(x, 0.066, z); L.push(fac(q, (cx, cy, cz, i) => tone(['#d9d2c2', '#c9c2b1', '#e2dccd'][k % 3], i + k, 0.3), 9411 + k)); };
  flag(SKG_MID[0], SKG_MID[1], 0.62, 0); for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283; flag(SKG_MID[0] + Math.cos(a) * 1.05, SKG_MID[1] + Math.sin(a) * 1.05, 0.34 + hash(k, 9420) * 0.08, 1 + k); }
  for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283 + 0.2; flag(SKG_MID[0] + Math.cos(a) * 1.82, SKG_MID[1] + Math.sin(a) * 1.82, 0.3 + hash(k, 9421) * 0.1, 10 + k); }
  let fk = 30; [[[-3.3, 3.3], [-2.4, 2.6]], [[-0.3, -0.5], [-0.55, 0.05]], [[2.2, 1.45], [3.2, 1.5]], [[-3.6, 1.2], [-2.7, 1.9]]].forEach((Pth) => { const [a, b] = Pth, n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.66)); for (let j = 0; j <= n; j++) flag(a[0] + (b[0] - a[0]) * j / n + (hash(fk, 3) - 0.5) * 0.14, a[1] + (b[1] - a[1]) * j / n + (hash(fk, 4) - 0.5) * 0.14, 0.27 + hash(fk, 5) * 0.08, fk++); });
  /* flowers: daisies and bluebells in drifts, and cloud-cotton (white puffs on stalks) toward the rim */
  [[-3.4, 2.3, 6], [-1.9, -0.2, 5], [0.9, -0.9, 6], [3.4, 2.9, 5], [1.0, 4.3, 4], [-2.9, -1.6, 4], [-0.2, 4.2, 4], [3.3, -1.1, 5], [-3.6, 4.9, 4], [2.2, 2.2, 3]].forEach(([fx, fz, n], c) => { for (let k = 0; k < n; k++) { const x = fx + (hash(k, 9430 + c) - 0.5) * 1.1, z = fz + (hash(k, 9450 + c) - 0.5) * 1.1, h = 0.16 + hash(k, 9470 + c) * 0.16;
    q = new T.CylinderGeometry(0.014, 0.018, h, 4); q.translate(x, h / 2, z); L.push(fac(q, '#5d8a48', 9480)); q = ico(0.065 + hash(k, 9481 + c) * 0.03, 0, 9482 + k + c * 9); q.scale(1, 0.6, 1); q.translate(x, h + 0.02, z); L.push(fac(q, () => new T.Color(['#ffffff', '#ffe27a', '#8fc6f2', '#ffffff', '#f6c1d0'][(k + c) % 5]), 9482 + k)); } });
  [[-5.2, -2.6], [-5.3, 2.4], [5.1, -2.9], [-3.1, 5.2], [3.5, 5.2], [5.0, 0.4], [-2.4, 5.1], [5.2, 4.9], [-5.3, -0.2], [1.9, 5.3]].forEach(([x, z], k) => { const h = 0.45 + hash(k, 9490) * 0.4; q = new T.CylinderGeometry(0.02, 0.028, h, 5); q.translate(x, h / 2, z); L.push(fac(q, '#6f9a55', 9491)); q = ico(0.15 + hash(k, 9492) * 0.06, 1, 9493 + k, 0.02); q.translate(x, h + 0.1, z); L.push(fac(q, (cx, cy, cz, i) => new T.Color(i % 3 ? '#ffffff' : '#e6eef8'), 9493 + k)); });
  /* two beanstalks behind the giant */
  [[-5.15, -5.25, 3.3], [5.0, -5.2, 2.7]].forEach(([x, z, H], k) => { for (let j = 0; j < 9; j++) { const y0 = j * H / 9, a = j * 0.9 + k; q = skgLimb([x + Math.cos(a) * 0.14, y0, z + Math.sin(a) * 0.14], [x + Math.cos(a + 0.9) * 0.14, y0 + H / 9 + 0.03, z + Math.sin(a + 0.9) * 0.14], 0.17 - j * 0.012, 0.16 - j * 0.012, 6); L.push(fac(q, (cx, cy, cz, i) => tone(j % 2 ? '#5f9a45' : '#6ba850', i, 0.3), 9700 + j));
      if (j > 1) { const la = a + 1.6, r = 0.5 - j * 0.02; q = ico(0.3 - j * 0.012, 1, 9720 + j + k * 9, 0.03); q.scale(1.3, 0.14, 0.9); q.rotateZ(0.35); q.rotateY(-la); q.translate(x + Math.cos(la) * r, y0 + 0.1, z + Math.sin(la) * r); L.push(fac(q, (cx, cy, cz, i) => tone(j % 2 ? '#74b257' : '#86c263', i, 0.35), 9720 + j));
        if (j % 3 === 0) { q = ico(0.1, 1, 9740 + j); q.scale(0.7, 2.3, 0.7); q.translate(x + Math.cos(la + 2.2) * 0.26, y0 - 0.12, z + Math.sin(la + 2.2) * 0.26); L.push(fac(q, () => tone('#a6d46a', j, 0.3), 9740 + j)); } } }
    q = ico(0.22, 1, 9750 + k); q.scale(1, 0.7, 1); q.translate(x + 0.1, H + 0.1, z); L.push(fac(q, () => tone('#86c263', k, 0.3), 9750 + k)); SKG.solid.push([x, z, 0.42]); });
  /* giant vegetables: a pumpkin by his head, carrots in a stone trough, cabbages and a radish in another */
  { const x = -4.7, z = -1.35; q = ico(0.74, 2, 9760, 0.02); q.scale(1, 0.74, 1); { const P = q.attributes.position; for (let i = 0; i < P.count; i++) { const a = Math.atan2(P.getZ(i), P.getX(i)), s = 1 - 0.07 * Math.pow(Math.abs(Math.sin(a * 4.5)), 0.6) * -1 - 0.07; P.setX(i, P.getX(i) * s); P.setZ(i, P.getZ(i) * s); } }
    q.translate(x, 0.52, z); L.push(fac(q, (cx, cy, cz, i) => shadeY(Math.floor((Math.atan2(cz - z, cx - x) + 3.2) * 9 / 6.283) % 2 ? '#f08a2e' : '#f7a13c', cy, -0.2, 1.1, i, 0.25), 9760));
    q = new T.CylinderGeometry(0.07, 0.11, 0.3, 6); q.rotateZ(0.3); q.translate(x - 0.03, 1.18, z); L.push(fac(q, '#6f8d50', 9761));
    [[0.75, 0.5, 0.4], [-0.3, 0.85, 2.2], [0.55, -0.6, 5.2]].forEach(([dx, dz, r], k) => { q = ico(0.34, 1, 9762 + k, 0.03); q.scale(1.2, 0.12, 0.95); q.rotateY(r); q.translate(x + dx, 0.14 + k * 0.03, z + dz); L.push(fac(q, (cx, cy, cz, i) => tone('#6ba850', i + k, 0.35), 9762 + k)); });
    q = new T.TorusGeometry(0.16, 0.025, 4, 10, 4.6); q.rotateX(Math.PI / 2); q.translate(x + 0.5, 0.2, z + 0.75); L.push(fac(q, '#5f9a45', 9766)); SKG.solid.push([x, z, 0.86]); }
  const trough = (x, z, w, d, sd) => { q = new T.BoxGeometry(w, 0.46, d, 3, 1, 3); jit(q, 0.035, sd); q.translate(x, 0.23, z); L.push(fac(q, (cx, cy, cz, i) => shadeY(hash(i, sd) > 0.5 ? '#c4bdac' : '#b1aa9a', cy, 0, 0.5, i, 0.4), sd));
    q = new T.BoxGeometry(w - 0.24, 0.06, d - 0.24); q.translate(x, 0.47, z); L.push(fac(q, (cx, cy, cz, i) => tone('#6b5340', i, 0.3), sd + 1)); SKG.boxes.push({ x, z, w, d }); };
  trough(-4.8, 0.55, 1.0, 1.9, 9770);
  [-0.6, 0, 0.6].forEach((dz, k) => { const x = -4.8 + (k % 2 ? 0.08 : -0.05), z = 0.55 + dz; q = new T.CylinderGeometry(0.17, 0.21, 0.24, 8); q.translate(x, 0.6, z); L.push(fac(q, (cx, cy, cz, i) => tone(cy > 0.7 ? '#f7a13c' : '#f08a2e', i, 0.25), 9772 + k));
    for (let j = 0; j < 6; j++) { const a = j / 6 * 6.283 + k, h = 0.6 + hash(j, 9775 + k) * 0.35; q = new T.ConeGeometry(0.1, h, 4); q.scale(1, 1, 0.45); q.translate(0, h / 2, 0); q.rotateZ(0.42); q.rotateY(a); q.translate(x, 0.7, z); L.push(fac(q, (cx, cy, cz, i) => shadeY(j % 2 ? '#5fa648' : '#74b957', cy, 0.6, 1.6, i, 0.3), 9776 + j)); } });
  trough(0, 4.95, 2.0, 0.9, 9790);
  [-0.6, 0.62].forEach((dx, k) => { const x = dx, z = 4.95; q = ico(0.33, 1, 9792 + k, 0.03); q.translate(x, 0.74, z); L.push(fac(q, (cx, cy, cz, i) => tone(i % 2 ? '#bfe08a' : '#a9d577', i, 0.3), 9792 + k));
    for (let j = 0; j < 6; j++) { const a = j / 6 * 6.283 + k * 0.5; q = ico(0.3, 1, 9794 + j + k * 7, 0.03); q.scale(1, 0.75, 0.16); q.rotateX(-0.45); q.rotateY(a); q.translate(x + Math.sin(a) * 0.3, 0.7, z + Math.cos(a) * 0.3); L.push(fac(q, (cx, cy, cz, i) => tone(j % 2 ? '#7fbf5a' : '#93cc6a', i, 0.35), 9794 + j)); } });
  q = ico(0.21, 1, 9810); q.scale(1, 1.15, 1); q.translate(0.02, 0.62, 4.95); L.push(fac(q, (cx, cy, cz, i) => new T.Color(cy > 0.62 ? '#e8588a' : '#fbe6ec'), 9810)); for (let j = 0; j < 4; j++) { q = new T.ConeGeometry(0.07, 0.42, 4); q.scale(1, 1, 0.4); q.translate(0, 0.21, 0); q.rotateZ(0.3); q.rotateY(j * 1.6); q.translate(0.02, 0.8, 4.95); L.push(fac(q, '#74b957', 9811 + j)); }
  /* his table (a mug, a plate with a wedge of cheese, a spoon) and his chair with a moss cushion */
  { const x = 4.4, z = 1.5; [-0.66, 0.66].forEach((s, k) => { q = new T.BoxGeometry(0.4, 1.3, 1.15, 1, 3, 2); jit(q, 0.03, 9820 + k); q.translate(x + s, 0.65, z); L.push(fac(q, (cx, cy, cz, i) => shadeY(hash(i, 9820) > 0.5 ? '#b9b2a2' : '#cfc8b8', cy, 0, 1.4, i, 0.4), 9820 + k)); });
    q = new T.BoxGeometry(2.0, 0.22, 1.5, 4, 1, 3); jit(q, 0.025, 9823); q.translate(x, 1.41, z); L.push(fac(q, (cx, cy, cz, i) => (cy > 1.5 ? tone(hash(i, 9824) > 0.8 ? '#a3ad92' : '#d3ccbc', i, 0.3) : shadeY('#bdb6a6', cy, 1.2, 1.6, i, 0.4)), 9823));
    q = new T.CylinderGeometry(0.27, 0.24, 0.5, 10); q.translate(x - 0.5, 1.77, z + 0.2); L.push(fac(q, (cx, cy, cz, i) => (cy > 1.78 && cy < 1.9 ? tone('#5cc4f4', i, 0.2) : cy > 2.01 ? new T.Color('#8a5f3c') : tone('#f1eada', i, 0.2)), 9825));
    q = new T.TorusGeometry(0.15, 0.04, 5, 10, Math.PI); q.rotateZ(-Math.PI / 2); q.translate(x - 0.24, 1.77, z + 0.2); L.push(fac(q, () => tone('#f1eada', 2, 0.2), 9826));
    q = new T.CylinderGeometry(0.42, 0.34, 0.06, 12); q.translate(x + 0.4, 1.55, z - 0.1); L.push(fac(q, (cx, cy, cz, i) => tone('#e9e1cf', i, 0.2), 9827));
    q = new T.CylinderGeometry(0.3, 0.3, 0.24, 3); q.scale(1, 1, 0.75); q.rotateY(0.5); q.translate(x + 0.42, 1.7, z - 0.1); L.push(fac(q, (cx, cy, cz, i) => tone(cy > 1.8 ? '#ffe27a' : '#f7c948', i, 0.2), 9828));
    q = new T.BoxGeometry(0.07, 0.04, 0.6); q.rotateY(0.3); q.translate(x - 0.1, 1.54, z - 0.42); L.push(fac(q, '#8a94a2', 9829)); q = ico(0.12, 1, 9830); q.scale(1, 0.35, 1.3); q.rotateY(0.3); q.translate(x - 0.2, 1.55, z - 0.74); L.push(fac(q, '#9aa4b2', 9830));
    SKG.boxes.push({ x, z, w: 2.0, d: 1.4 });
    const cz = -0.45; q = new T.BoxGeometry(1.0, 0.85, 0.95, 2, 2, 2); jit(q, 0.03, 9832); q.translate(x, 0.425, cz); L.push(fac(q, (cx, cy, cz2, i) => shadeY(hash(i, 9832) > 0.5 ? '#b9b2a2' : '#cfc8b8', cy, 0, 1, i, 0.4), 9832));
    q = new T.BoxGeometry(1.0, 1.75, 0.24, 2, 4, 1); jit(q, 0.03, 9833); q.translate(x, 0.875, cz - 0.42); L.push(fac(q, (cx, cy, cz2, i) => shadeY(hash(i, 9833) > 0.5 ? '#c4bdac' : '#d3ccbc', cy, 0, 1.9, i, 0.4), 9833));
    q = ico(0.2, 1, 9834); q.translate(x - 0.42, 1.8, cz - 0.42); L.push(fac(q, skgRock('#b9b2a2', 9834, 0.7), 9834)); q = ico(0.2, 1, 9835); q.translate(x + 0.42, 1.8, cz - 0.42); L.push(fac(q, skgRock('#b9b2a2', 9835, 0.7), 9835));
    q = ico(0.44, 1, 9836, 0.03); q.scale(1, 0.25, 0.95); q.translate(x, 0.9, cz + 0.05); L.push(fac(q, (cx, cy, cz2, i) => tone(i % 2 ? '#8fae6a' : '#9cc071', i, 0.3), 9836)); SKG.boxes.push({ x, z: cz - 0.1, w: 1.0, d: 1.2 }); }
  /* the kite's stone and rope ring in the garden */
  skgTieGeo(L, SKG_TIE[0], 0, SKG_TIE[1], 9840); SKG.solid.push([SKG_TIE[0], SKG_TIE[1], 0.42]);
  SKG.tieG = [A.cx + SKG_TIE[0], 0.56, A.cz + SKG_TIE[1]]; SKG.G = [A.cx + SKG_RING[0], 0, A.cz + SKG_RING[1]];
  skgGiant(g, L); for (let k = 0; k < 4; k++) skgHoop(g, L, k);
  const mesh = skgFlat(L, MAT, g); mesh.castShadow = true; mesh.receiveShadow = true;
  skgClouds(g);
  /* streaks of wind, and the wisp that knows the tune: a head and a tail of pale beads */
  for (let k = 0; k < 5; k++) { q = new T.PlaneGeometry(1.7, 0.045, 10, 1); { const P = q.attributes.position; for (let i = 0; i < P.count; i++) P.setY(i, P.getY(i) + Math.sin(P.getX(i) * 3.2 + k) * 0.09); }
    const m = new T.Mesh(q, new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false })); m.rotation.y = -Math.atan2(SKG_WIND[1], SKG_WIND[0]); g.add(m); SKG.streaks.push({ m, u: k / 5, z: 0, y: 1 }); }
  for (let k = 0; k < 7; k++) { const m = new T.Mesh(new T.SphereGeometry(0.1 - k * 0.011, 8, 6), new T.MeshBasicMaterial({ color: k ? '#d8f0ff' : '#ffffff', transparent: true, opacity: 0.95 - k * 0.1, depthWrite: false })); sc.add(m); SKG.beads.push(m); }
  SKG.wp = new T.Vector3(A.cx + SKG_MID[0], 1.2, A.cz + SKG_MID[1]);
  SKG.rG = ringMake({ x: SKG.G[0], z: SKG.G[2], y: 0.03, icon: 'kite', ok: () => HAS.s5 && !SKG.pop && !SKG.pend, go: () => skgFly(false) }); SKG.rG.ring.rotation.x = -Math.PI / 2;
  /* a chest by the table, iron and crystal to gather */
  if (!state.isle.chests.s5) { const c = makeChest(A.cx + 4.5, A.cz + 3.8, { coin: 60, crystal: 6, iron: 3 }, 's5'); c.ring.position.y = 0.066; }
  [['iron', 2.9, 4.7], ['iron', -2.6, 4.8], ['crystal', 2.4, -1.75], ['crystal', 0.6, -1.9]].forEach(([k, x, z], n) => { const nd = makeNode(k, A.cx + x, A.cz + z, AREAS.indexOf(A) * 997 + 1500 + n); if (fresh) { nd.pop = 0.001; nd.g.scale.setScalar(0.01); } });
  if (skgWon()) { SKG.wake = 99; SKG.k = 4; SKG.hoops.forEach((h) => { h.lit = 1; }); SKG.w.mode = 'free'; }
  if (golds().hammer) SKG.gold.visible = false;
  if (fresh) { g.scale.setScalar(0.01); SKG.pop = 0.001; }
}
SECRET_FILL.s5 = skgFill;
/* ---- the wind stones' game ---- */
function skgNote(k, gain) { Snd.play('ding', { gain: gain, f: SKG_NOTE[k] }); Snd.play('ding', { gain: gain * 0.5, f: SKG_NOTE[k] / 2 }); Snd.play('swish', { gain: gain * 0.5, dur: 0.3 }); }
function skgHoopHit(h) {
  const A = SKG.A, W = SKG.w; h.fl = 1; skgNote(h.k, 0.6);
  if (skgWon() || SKG.wake) return;
  if (h.k === SKG.seq[SKG.k]) { h.lit = 1; SKG.k++; burst(A.cx + h.x, 1.9, A.cz + h.z, 5); W.mode = 'wait'; W.t = 0;
    if (SKG.k >= SKG.seq.length) { skgS().won = 1; SKG.wake = 0.001; xpGain(30); save(); SKG.seq.forEach((k, j) => { Snd.play('ding', { gain: 0.45, f: SKG_NOTE[k] }, 0.5 + j * 0.16); }); Snd.play('success', { gain: 0.5 }, 1.25); W.mode = 'free'; } return; }
  if (h.lit) return; /* one already sung: no harm */
  /* a wrong one: the giant snores, the lights go out, and the wisp shows the tune again */
  SKG.k = 0; SKG.hoops.forEach((o) => { o.lit = 0; }); SKG.wrong = 1; Snd.play('buzz', { gain: 0.5, f: 66, dur: 0.9 }, 0.25); Snd.play('whoosh', { gain: 0.35, dur: 1.1, top: 700 }, 0.25);
  W.mode = 'demo'; W.i = 0; W.t = -1.6; W.hold = 0;
}
/* where the wisp wants to be */
function skgWispAim(dt, out) {
  const A = SKG.A, W = SKG.w, H = SKG.hoops, mid = (h, y) => out.set(A.cx + h.x, y == null ? 0.78 : y, A.cz + h.z);
  const loop = (h, a) => out.set(A.cx + h.x + h.nx * Math.cos(a) * 0.7, 1.5 - Math.sin(a) * 0.72, A.cz + h.z + h.nz * Math.cos(a) * 0.7); /* round the crown of a hoop and through its hole */
  W.t += dt;
  if (W.mode === 'demo') {
    if (W.t < 0) { out.set(A.cx + SKG_MID[0], 1.5, A.cz + SKG_MID[1]); return; }
    const h = H[SKG.seq[W.i]];
    if (!W.hold) { mid(h, 0.78); out.x -= h.nx * 0.5; out.z -= h.nz * 0.5; if (W.t > 0.3 && SKG.wp.distanceTo(out) < 0.45) { W.hold = 0.001; h.fl = 1; if (SKG.in) skgNote(h.k, 0.32); } else if (W.t > 4) W.hold = 0.001; }
    else { W.hold += dt; loop(h, Math.PI / 2 + W.hold * 7); if (W.hold > 0.9) { W.hold = 0; W.i++; W.t = 0.01; if (W.i >= SKG.seq.length) { W.mode = 'wait'; W.t = 0; } } }
  } else if (W.mode === 'wait') { loop(H[SKG.seq[Math.min(SKG.k, 3)]], time * 3.2); if (SKG.k === 0 && W.t > 9 && SKG.in) { W.mode = 'demo'; W.i = 0; W.t = 0; W.hold = 0; } }
  else { const a = time * 0.7; out.set(A.cx - 0.6 + Math.cos(a) * 3.6, 1.7 + Math.sin(a * 2.3) * 0.5, A.cz - 0.6 + Math.sin(a) * 2.6); }
}
/* ---- the gardens on the rock tables (the lasting change): flowers along the rim, vines over the edge, an iron-flower ---- */
function skgTableGarden(m) {
  const top = mesaTop(m), g = new T.Group(), L = [], sd = 10400 + SKG.tabs.length * 60; g.position.set(m.x, top, m.z); sc.add(g); let q;
  const hx = m.w / 2, hz = m.d / 2;
  for (let k = 0; k < 16; k++) { const s = k % 4, t = (hash(k, sd) - 0.5) * 0.92, x = s === 0 ? -hx + 0.16 : s === 1 ? hx - 0.16 : t * m.w, z = s < 2 ? t * m.d : s === 2 ? -hz + 0.16 : hz - 0.16; if (s === 3 && Math.abs(x - m.lx) < 0.75) continue;
    const h = 0.14 + hash(k, sd + 1) * 0.14; q = new T.CylinderGeometry(0.013, 0.017, h, 4); q.translate(x, h / 2, z); L.push(fac(q, '#5d8a48', sd + 2)); q = ico(0.06 + hash(k, sd + 3) * 0.025, 0, sd + 4 + k); q.scale(1, 0.6, 1); q.translate(x, h + 0.02, z); L.push(fac(q, () => new T.Color(['#ffffff', '#8fc6f2', '#ffe27a', '#f6c1d0'][k % 4]), sd + 4 + k));
    q = ico(0.13, 0, sd + 24 + k); q.scale(1.4, 0.3, 1.1); q.translate(x, 0.02, z); L.push(fac(q, (cx, cy, cz, i) => tone('#8fc465', i + k, 0.35), sd + 24 + k)); }
  /* vines down the south face (the side we see), each with a few leaves and a blossom */
  for (let k = 0; k < 5; k++) { const x = (k / 4 - 0.5) * (m.w - 0.7) + (hash(k, sd + 40) - 0.5) * 0.3; if (Math.abs(x - m.lx) < 0.7) continue; const len = Math.min(m.h - 0.15, 0.45 + hash(k, sd + 41) * 0.55), z = hz + 0.3;
    q = new T.BoxGeometry(0.03, len, 0.03); q.translate(x, -len / 2 + 0.03, z); L.push(fac(q, '#5f9a45', sd + 42 + k)); q = ico(0.16, 0, sd + 46 + k); q.scale(1.3, 0.4, 1.2); q.translate(x, 0.04, z - 0.14); L.push(fac(q, (cx, cy, cz, i) => tone('#74b257', i, 0.35), sd + 46 + k));
    for (let j = 0; j < 5; j++) { q = ico(0.085, 0, sd + 50 + k * 3 + j); q.scale(1.3, 0.75, 0.5); q.translate(x + (j % 2 ? 0.08 : -0.08), -len * (j + 0.5) / 5.2, z + 0.03); L.push(fac(q, (cx, cy, cz, i) => tone('#86c263', i + j, 0.35), sd + 50 + j)); }
    q = ico(0.065, 0, sd + 70 + k); q.translate(x, -len + 0.02, z + 0.04); L.push(fac(q, () => new T.Color(k % 2 ? '#ffffff' : '#8fc6f2'), sd + 70 + k)); }
  const fx = (m.lx > 0 ? -1 : 1) * (hx - 0.5), fz = hz - 0.5;
  q = new T.CylinderGeometry(0.03, 0.04, 0.34, 5); q.translate(fx, 0.17, fz); L.push(fac(q, '#4f7a40', sd + 80)); [0.8, 3.9].forEach((a, k) => { q = ico(0.13, 0, sd + 81 + k); q.scale(1.5, 0.2, 0.8); q.rotateY(a); q.translate(fx + Math.cos(a) * 0.14, 0.06, fz - Math.sin(a) * 0.14); L.push(fac(q, '#5f9a45', sd + 81 + k)); });
  const mesh = skgFlat(L, MAT, g); mesh.castShadow = true; mesh.receiveShadow = true;
  const F = []; for (let k = 0; k < 6; k++) { q = new T.ConeGeometry(0.075, 0.24, 4); q.scale(1, 1, 0.35); q.translate(0, 0.12, 0); q.rotateX(1.05); q.rotateY(k / 6 * 6.283); F.push(fac(q, (cx, cy, cz, i) => new T.Color(i % 2 ? '#dfe7ef' : '#b9c6d4'), sd + 90 + k)); }
  q = ico(0.085, 0, sd + 97); F.push(fac(q, (cx, cy, cz, i) => new T.Color(i % 2 ? '#8fa0b4' : '#5d6c7e'), sd + 97)); const fl = skgFlat(F, skgIronMat, g); fl.position.set(fx, 0.4, fz); fl.castShadow = true;
  const T2 = { m, g, fl, x: m.x + fx, z: m.z + fz, t: 0, s: 1 }; SKG.tabs.push(T2); m.skg = T2;
}
function skgAfter(dt) {
  if (!golds().hammer || inCave) return; const pp = pip.position;
  MS.list.forEach((m) => { if (!m.skg && !m.pop && !m.locked) skgTableGarden(m); });
  SKG.tabs.forEach((Q) => { Q.g.visible = !Q.m.pop;
    if (Q.t > 0) { Q.t -= dt; Q.s = Q.t <= 0 ? 0.01 : 0; } Q.s = Math.min(1, Q.s + dt * 1.5); Q.fl.visible = Q.t <= 0; Q.fl.scale.setScalar(Math.max(0.01, Q.s)); Q.fl.rotation.y = time * 0.8;
    if (Q.t <= 0 && Q.s >= 1 && MS.on === Q.m && !MS.climb && Math.hypot(pp.x - Q.x, pp.z - Q.z) < 0.6) { /* picked: a piece of iron, and it blooms again in a while */
      Q.t = 150; state.isle.store.iron = (state.isle.store.iron || 0) + 1; invDirty = true; const sp = new T.Sprite(new T.SpriteMaterial({ map: hamGiftTex('iron', 1), transparent: true, depthWrite: false })); sp.scale.set(1.5, 0.75, 1); sp.position.set(Q.x, pp.y + 1.5, Q.z); sc.add(sp); FD.floats.push({ sp, t: 0, y: pp.y });
      Snd.play('ding', { gain: 0.4, f: 880 }); Snd.play('sparkle', { gain: 0.4 }); burst(Q.x, pp.y + 0.8, Q.z, 6); if (typeof bldBadge === 'function') bldBadge(); save(); } });
  /* the second kite: free now, it sails a long figure of eight over the stone island */
  if (!SKG.kite2) { SKG.kite2 = skgKiteMake('#f6c63c', '#5cc4f4'); SKG.kite2.scale.setScalar(1.25); sc.add(SKG.kite2); }
  const a = time * 0.16, K = SKG.kite2, x = -32 + Math.sin(a) * 9.5, z = -17 + Math.sin(a * 2) * 11, vx = Math.cos(a) * 9.5, vz = Math.cos(a * 2) * 22;
  K.position.set(x, 3.4 + Math.sin(a * 3) * 0.5, z); K.rotation.y = Math.atan2(vx, vz); K.userData.line.visible = false; skgKitePose(K, 1.4, 0.2, 2);
}
function skgStep(dt) {
  const pp = pip.position, m = SKG.m || MS.list.find((q) => q.id === 's4a');
  if (!SKG.kite && m && HAS.s4) skgTableMake(m);
  skgAfter(dt);
  if (!SKG.kite) return; const A = AREA_BY.s5, K = SKG.kite, ride = riding2();
  SKG.in = !!SKG.g && pp.x < A.cx + 6 && Math.abs(pp.z - A.cz) < 6.6 && pp.x > A.cx - 7;
  K.visible = SKG.tg.visible = !inCave && !m.pop;
  /* the first time: the garden rises out of the cloud, then the kite lifts Pip */
  if (SKG.pend) { target.copy(pp); target.y = 0; work = null; pip.rotation.y = -Math.PI / 2; if (SKG.g && !rising && !SKG.pop) { SKG.pend += dt; if (SKG.pend > 1.1) { SKG.pend = 0; skgFly(true); } } }
  /* the view draws back while the garden rises and while Pip flies, so the whole flight is seen (CURVE: the camera's own numbers) */
  { const want = SKG.fly ? 1 : SKG.pend ? 0.6 : 0; if (want && !SKG.cam) SKG.cam = { d: CURVE.dist, a: CURVE.ahead, e: 0 };
    if (SKG.cam) { const C = SKG.cam; C.e += (want - C.e) * Math.min(1, dt * 1.5); CURVE.dist = C.d + 5.5 * C.e; CURVE.ahead = C.a + 1.8 * C.e; if (!want && C.e < 0.01) { CURVE.dist = C.d; CURVE.ahead = C.a; SKG.cam = null; } } }
  /* the kite waits at whichever end Pip is */
  if (!SKG.fly) { const at = SKG.in ? SKG.tieG : SKG.tie; K.position.set(at[0], at[1], at[2]); K.rotation.set(0, SKG.in ? Math.atan2(SKG_WIND[0], SKG_WIND[1]) : -0.62, 0); K.userData.line.visible = true; skgKitePose(K, SKG.in ? 2.5 : 1.5, SKG.in ? 1.5 : 2.7, 1); }
  if (SKG.veil) { const v = SKG.veil; v.visible = !inCave; v.position.y = reduced ? 0 : Math.sin(time * 0.5) * 0.08; v.rotation.y = reduced ? 0 : time * 0.03; if (HAS.s5) { v.scale.multiplyScalar(Math.max(0, 1 - dt * 1.6)); v.scale.y = v.scale.x; if (v.scale.x < 0.03) { sc.remove(v); SKG.veil = null; } } }
  if (!SKG.g) return; const g = SKG.g, W = SKG.w;
  if (SKG.pop) { SKG.pop = Math.min(1, SKG.pop + dt * 1.3); const s = SKG.pop; g.scale.setScalar(s < 0.75 ? s / 0.75 * 1.06 : 1.06 - (s - 0.75) / 0.25 * 0.06); if (SKG.pop >= 1) { SKG.pop = 0; g.scale.setScalar(1); } }
  g.visible = !inCave; SKG.beads.forEach((b) => { b.visible = !inCave && !SKG.pop; }); if (inCave) return;
  /* the cloud bank is a wall: the garden is only reached through the air */
  if (!ride && !MS.climb && !enSleep) {
    if (SKG.in) { pp.x = clamp(pp.x, A.cx - 5.55, A.cx + 5.35); pp.z = clamp(pp.z, A.cz - 5.5, A.cz + 5.5);
      SKG.boxes.forEach((b) => { mesaOut({ x: A.cx + b.x, z: A.cz + b.z, w: b.w, d: b.d }, pp, 0.3); });
      SKG.solid.forEach(([x, z, r]) => { const dx = pp.x - A.cx - x, dz = pp.z - A.cz - z, d = Math.hypot(dx, dz); if (d < r + 0.25 && d > 1e-4) { pp.x += dx / d * (r + 0.25 - d); pp.z += dz / d * (r + 0.25 - d); } }); }
    else if (!MS.on && pp.x < A.cx + 6.45 && Math.abs(pp.z - A.cz) < 6.4 && pp.x > A.cx + 4) pp.x = A.cx + 6.45;
  }
  const quiet = reduced ? 0 : 1;
  SKG.cl.forEach((c) => { c.m.position.y = quiet * Math.sin(time * 0.55 + c.ph) * 0.07; c.m.position.x = quiet * Math.sin(time * 0.31 + c.ph * 2) * 0.09; });
  skgCloudMat.emissiveIntensity = 0.32 * (1 - 0.8 * (typeof nightAmt === 'number' ? nightAmt : 0));
  SKG.drift.forEach((d, k) => { d.u = (d.u + dt * 0.035 * quiet) % 1; const s = Math.sin(d.u * Math.PI); d.m.position.set(6 - d.u * 12, 0.2 + s * 0.1, d.z + d.u * 5 - 2.5); d.m.scale.setScalar(Math.max(0.01, Math.min(1, s * 3))); });
  SKG.streaks.forEach((S, k) => { S.u += dt * 0.42; if (S.u >= 1) { S.u = 0; S.z = (hash(k, Math.floor(time * 7)) - 0.5) * 9; S.y = 0.6 + hash(k + 3, Math.floor(time * 5)) * 1.7; }
    const d = (S.u - 0.5) * 9; S.m.position.set(SKG_WIND[0] * d - SKG_WIND[1] * S.z * 0.6, S.y, SKG_WIND[1] * d + SKG_WIND[0] * S.z * -0.6 + 0.5); S.m.material.opacity = reduced ? 0 : Math.sin(S.u * Math.PI) * 0.55; });
  /* the giant: asleep he breathes slowly and snores small clouds; awake he looks about, blinks and smiles */
  const br = time * 1.5, b = Math.sin(br);
  if (SKG.wake) SKG.wake += dt; const t = SKG.wake, yawn = t > 1 && t < 3.6 ? Math.sin((t - 1) / 2.6 * Math.PI) : 0, open = clamp((t - 3.6) / 1.5, 0, 1), oe = open * open * (3 - 2 * open);
  if (SKG.wrong) { SKG.wrong += dt * 0.9; if (SKG.wrong > 2) SKG.wrong = 0; } const jolt = SKG.wrong ? Math.sin(Math.min(1, (SKG.wrong - 1) / 0.8 < 0 ? 0 : (SKG.wrong - 1) / 0.8) * Math.PI) : 0;
  SKG.tor.scale.y = 1 + (reduced ? 0 : b * (t ? 0.035 : 0.06)) + yawn * 0.13 + jolt * 0.1;
  const awake = t > 0.7, blink = awake && t > 6 && (time % 4.3) < 0.13;
  SKG.eyeO.visible = awake && !blink; SKG.eyeC.visible = !SKG.eyeO.visible; SKG.mouO.visible = yawn > 0.08 || jolt > 0.2; SKG.mouC.visible = !SKG.mouO.visible; SKG.mouO.scale.set(1, 0.35 + Math.max(yawn, jolt * 0.7) * 1.1, 1);
  SKG.mouC.scale.set(awake ? 1.25 : 0.8, awake ? 1.2 : 0.5, 1);
  SKG.head.rotation.x = -0.62 - yawn * 0.28 + (awake && !reduced ? Math.sin(time * 0.6) * 0.04 : 0) + (reduced ? 0 : b * 0.012); SKG.head.rotation.y = awake ? clamp((pp.x - A.cx + 4) * 0.05, -0.2, 0.3) : 0;
  SKG.zz.forEach((z, k) => { const p = ((br / 6.283) + k / 3) % 1, on = !t && !reduced && !SKG.pop; z.visible = on; if (!on) return; SKG.head.localToWorld(SKG.v.set(0, -0.4, 0.95)); g.worldToLocal(SKG.v);
    const big = 1 + jolt * 1.2; z.position.set(SKG.v.x + p * 0.5 + Math.sin(p * 9 + k) * 0.08, SKG.v.y + 0.15 + p * 1.7, SKG.v.z + p * 0.35); z.scale.setScalar(Math.max(0.01, Math.sin(Math.min(1, p * 1.15) * Math.PI) * (0.35 + p * 0.5) * big)); });
  if (!t && SKG.in) { SKG.snT -= dt; if (SKG.snT <= 0 && b > 0.9) { SKG.snT = 3; Snd.play('whoosh', { gain: 0.1, dur: 1.5, top: 520 }); } }
  if (t && !SKG.y1 && t > 1) { SKG.y1 = 1; Snd.play('riser', { gain: 0.35, dur: 1.5 }); Snd.play('whoosh', { gain: 0.3, dur: 2.2, top: 900 }, 0.9); }
  if (t && !SKG.y2 && t > 3.6) { SKG.y2 = 1; if (t < 50) { Snd.play('secret', { gain: 0.55 }); const hw = SKG.hand.position; burst(A.cx + hw.x, 0.9, A.cz + hw.z, 12); } }
  SKG.fing.forEach((F, k) => { F.a.rotation.z = 1.22 - oe * 1.32 + (k % 2 ? 0.05 : 0); F.b.rotation.z = 1.3 - oe * 1.12; });
  SKG.thumb.rotation.set(0, 1.05 - oe * 1.5, 0.75 - oe * 0.7);
  if (SKG.gold.visible) { SKG.gold.position.y = 0.6 + oe * 0.45 + (oe >= 1 && !reduced ? Math.sin(time * 2) * 0.05 : 0); SKG.gold.rotation.y = oe >= 1 ? time * 1.4 : 0.6; SKG.gold.scale.setScalar(0.85 + oe * 0.35);
    if (oe >= 1 && !golds().hammer && !ride && SKG.in && Math.hypot(pp.x - A.cx - SKG_HAND[0], pp.z - A.cz - SKG_HAND[1]) < 1.35) { SKG.gold.visible = false; goldGive('hammer'); } }
  /* the wind stones: walk through one and it sings */
  SKG.hoops.forEach((h) => { const d = Math.hypot(pp.x - A.cx - h.x, pp.z - A.cz - h.z); if (d > 0.95) h.armed = true; else if (d < 0.5 && h.armed && !ride && !SKG.pop) { h.armed = false; skgHoopHit(h); }
    h.fl = Math.max(0, h.fl - dt * 1.4); const glow = Math.max(h.fl, h.lit ? 0.55 + (reduced ? 0 : Math.sin(time * 3 + h.k) * 0.15) : 0); h.mat.emissiveIntensity = 0.12 + glow * 1.5; h.gem.scale.set(1 + glow * 0.3, 1.35 * (1 + glow * 0.3), 1 + glow * 0.3); h.gem.rotation.y = time * (0.6 + glow * 2) + h.k;
    h.gem.position.y = 1.86 + (reduced ? 0 : Math.sin(time * 2 + h.k) * 0.03) + h.fl * 0.12; h.rib.rotation.z = reduced ? -0.15 : Math.sin(time * 6.5 + h.k * 1.3) * 0.22 - 0.1; h.rib.rotation.x = reduced ? 0 : Math.sin(time * 4.3 + h.k) * 0.3; });
  /* the wisp */
  skgWispAim(dt, SKG.v2); SKG.wp.lerp(SKG.v2, 1 - Math.exp(-dt * (W.mode === 'free' ? 2.2 : 5.5))); SKG.hist.unshift(SKG.wp.x, SKG.wp.y, SKG.wp.z); if (SKG.hist.length > 3 * 22) SKG.hist.length = 3 * 22;
  SKG.beads.forEach((bd, k) => { const o = Math.min(k * 3, SKG.hist.length / 3 - 1) * 3; bd.position.set(SKG.hist[o], SKG.hist[o + 1] + (reduced ? 0 : Math.sin(time * 9 + k) * 0.02), SKG.hist[o + 2]); });
}
ISLE_STEPS.push(skgStep);
