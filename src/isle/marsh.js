/* ---------- the marsh island and its pole raft (Leon, 2026-11-25: each island should differ in how Pip gets about) ----------
   The marsh is low, wet land west of the bakery. Its way of moving is the raft: a channel of water cuts the first square
   in two, and the only way over is to step onto the log raft. As soon as Pip stands on it, it poles itself across to the
   other bank, the long way down the channel. If the raft lies at the far bank, walking out on the near jetty calls it over.
   Cattails grow on the far bank: reeds, the marsh's own find (finds.js), which the snow boots are woven from.
   Where the raft lies is in rules.js (RAFT), because the walking rules need it before this file is read. */
const RF = { g: null, pole: null, at: 0, trip: null, armed: true, rip: 0 };
const raftEnd = (k) => (k ? RAFT.w : RAFT.e);
const raftJetty = (k) => (k ? [RAFT.w[0] - 1.0, RAFT.w[1]] : [RAFT.e[0] + 1.0, RAFT.e[1]]);
function marshFill(A, fresh) {
  if (A.id !== 'r0' || RF.g) return;
  const L = []; let q;
  /* the two jetties: a few planks out from each bank, on short posts */
  [0, 1].forEach((k) => { const [jx, jz] = raftJetty(k), s = k ? 1 : -1;
    for (let p = 0; p < 4; p++) { q = new T.BoxGeometry(0.34, 0.07, 1.25); q.translate(jx - s * (0.7 - p * 0.36), 0.03 - p * 0.012, jz); L.push(fac(q, () => tone(['#b08454', '#c0935f', '#a87a4c'][p % 3], p + k * 4, 0.3), 5300 + p + k * 4)); }
    [-0.56, 0.56].forEach((dz, j) => { q = new T.CylinderGeometry(0.07, 0.08, 1.0, 7); q.translate(jx + s * 0.45, -0.25, jz + dz); L.push(fac(q, (cx, cy) => shadeY(PAL.trunk, cy, -0.8, 0.3, k + j, 0.4), 5310 + k * 2 + j)); });
    lookFoot(jx - s * 1.0, jz, 0.7, 0.7); });
  merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT);
  /* the raft: seven logs lashed together, a lantern post at one corner, and the pole */
  const g = RF.g = new T.Group(), R = [];
  for (let k = 0; k < 7; k++) { q = new T.CylinderGeometry(0.125, 0.135, 1.7 + hash(k, 5321) * 0.16, 8); q.rotateX(Math.PI / 2); q.translate(-0.75 + k * 0.25, -0.145, (hash(k, 5322) - 0.5) * 0.1);
    R.push(fac(q, (cx, cy, cz, f) => (Math.abs(cz) > 0.8 ? tone('#e7c48f', f, 0.3) : shadeY(k % 2 ? '#9a6b43' : '#8a5f3c', cy, -0.3, 0, f, 0.4)), 5320 + k)); }
  [-0.55, 0.55].forEach((dz, k) => { q = new T.BoxGeometry(1.75, 0.045, 0.16); q.translate(0, -0.012, dz); R.push(fac(q, () => tone('#c9a871', k, 0.3), 5330 + k)); });
  q = new T.CylinderGeometry(0.035, 0.04, 0.95, 6); q.translate(0.72, 0.45, -0.72); R.push(fac(q, (cx, cy) => shadeY('#7d5e4e', cy, 0, 1, 3, 0.4), 5333));
  q = new T.BoxGeometry(0.16, 0.2, 0.16); q.translate(0.72, 1.0, -0.72); R.push(fac(q, '#3a2a1e', 5334));
  merged(R.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g);
  const lamp = new T.Mesh(new T.SphereGeometry(0.075, 10, 8), new T.MeshBasicMaterial({ color: '#ffe07a' })); lamp.position.set(0.72, 1.0, -0.72); g.add(lamp);
  const pole = RF.pole = new T.Group(); q = new T.CylinderGeometry(0.028, 0.034, 2.9, 6); q.translate(0, 0.75, 0); merged([fac(q, (cx, cy) => shadeY('#b98a5a', cy, -0.7, 2.2, 5, 0.4), 5335).toNonIndexed()], MAT, pole); pole.position.set(-0.7, 0, 0.6); pole.rotation.x = 0.12; g.add(pole);
  g.position.set(RAFT.x, 0, RAFT.z); sc.add(g);
  if (fresh) { g.scale.setScalar(0.01); RF.pop = 0.001; }
}
/* nothing grows on the paths to the jetties */
const marshKeep = (a, x, z) => a.id === 'r0' && [0, 1].some((k) => { const [jx, jz] = raftJetty(k); return Math.hypot(x - jx + (k ? 1 : -1) * 1.2, z - jz) < 1.9; });
/* what makes the marsh look like itself: dark sedge, cattails along the water, lily pads on it, a few toadstools */
function marshDecor(A, L, base) {
  const R = (k, n) => hash(k, n + base), ok = (x, z) => !marshKeep(A, x, z) && !nodes.some((q) => Math.abs(q.x - x) < 0.6 && Math.abs(q.z - z) < 0.6);
  for (let k = 0; k < 150; k++) { const x = A.cx + (R(k, 301) - 0.5) * 11.4, z = A.cz + (R(k, 302) - 0.5) * 11.4, d = drawSdf(x, z); if (d > -0.3 || !ok(x, z)) continue; /* sedge: tufts of dark grass */
    for (let j = 0; j < 4; j++) { const h = 0.2 + hash(k, j + 20) * 0.2, q = new T.ConeGeometry(0.035, h, 3); q.translate(0, h / 2, 0); q.rotateZ((hash(k, j + 30) - 0.5) * 0.9); q.rotateY(j * 1.6); q.translate(x + (j - 1.5) * 0.045, 0, z + (hash(k, j + 40) - 0.5) * 0.09); L.push(fac(q, (cx, cy, cz, i) => shadeY('#4f8a45', cy, 0, 0.4, i, 0.3), 5400 + k)); } }
  for (let k = 0; k < 260; k++) { const x = A.cx + (R(k, 311) - 0.5) * 12, z = A.cz + (R(k, 312) - 0.5) * 12, d = drawSdf(x, z); if (d > -0.12 || d < -0.75 || !ok(x, z) || !areaClear(x, z)) continue; /* cattails along every shore */
    for (let j = 0; j < 3; j++) { const h = 0.55 + hash(k, j + 50) * 0.45, px = x + (hash(k, j + 60) - 0.5) * 0.3, pz = z + (hash(k, j + 70) - 0.5) * 0.3, lean = (hash(k, j + 80) - 0.5) * 0.3;
      let q = new T.CylinderGeometry(0.014, 0.018, h, 4); q.translate(0, h / 2, 0); q.rotateZ(lean); q.translate(px, 0, pz); L.push(fac(q, '#7fae4f', 5500 + k));
      q = new T.CylinderGeometry(0.04, 0.04, 0.18, 6); q.translate(0, h - 0.14, 0); q.rotateZ(lean); q.translate(px, 0, pz); L.push(fac(q, (cx, cy, cz, i) => tone('#8a5a34', i + k, 0.4), 5600 + k)); } }
  let pads = 0; for (let k = 0; k < 400 && pads < 26; k++) { const x = A.cx + (R(k, 321) - 0.5) * 11, z = A.cz + (R(k, 322) - 0.5) * 11, d = drawSdf(x, z); if (d < 0.75) continue; /* lily pads out on the water, clear of the raft's way */
    if (A.id === 'r0' && segD(x, z, RAFT.e[0], RAFT.e[1], RAFT.w[0], RAFT.w[1]) < 1.35) continue; pads++;
    const r = 0.16 + R(k, 323) * 0.14, q = new T.CylinderGeometry(r, r, 0.02, 9, 1, false, 0.5, 5.7); q.rotateY(R(k, 324) * 6.28); q.translate(x, -0.415, z); L.push(fac(q, (cx, cy, cz, i) => tone('#5fae5a', i + k, 0.5), 5700 + k));
    if (R(k, 325) > 0.6) { const f = ico(0.07, 0, 5800 + k); f.scale(1, 0.7, 1); f.translate(x + 0.04, -0.37, z); L.push(fac(f, (cx, cy, cz, i) => new T.Color(i % 2 ? '#ffffff' : '#f6a8c8'), 5800 + k)); } }
  for (let k = 0; k < 40; k++) { const x = A.cx + (R(k, 331) - 0.5) * 10.6, z = A.cz + (R(k, 332) - 0.5) * 10.6; if (drawSdf(x, z) > -0.5 || !ok(x, z)) continue; if (R(k, 333) > 0.45) continue; /* toadstools */
    let q = new T.CylinderGeometry(0.025, 0.035, 0.12, 6); q.translate(x, 0.06, z); L.push(fac(q, '#f3ead8', 5900 + k)); q = ico(0.085, 1, 5950 + k); q.scale(1, 0.6, 1); q.translate(x, 0.13, z); L.push(fac(q, (cx, cy, cz, i) => new T.Color(i % 5 === 0 ? '#fff6e4' : '#d9573f'), 5950 + k)); }
}
function raftStep(dt) {
  const g = RF.g; if (!g) return; const pp = pip.position;
  if (RF.pop) { RF.pop = Math.min(1, RF.pop + dt * 1.5); g.scale.setScalar(RF.pop); if (RF.pop >= 1) RF.pop = 0; }
  g.position.set(RAFT.x, reduced ? 0 : Math.sin(time * 1.7) * 0.018, RAFT.z); if (!reduced) { g.rotation.x = Math.sin(time * 1.3) * 0.012; g.rotation.z = Math.cos(time * 1.1) * 0.012; }
  if (!HAS.r0 || inCave) return;
  const T0 = RF.trip;
  if (T0) { /* poling across */
    T0.t += dt; const u = Math.min(1, T0.t / T0.dur), e = u * u * (3 - 2 * u), a = T0.from, b = T0.to; RAFT.x = a[0] + (b[0] - a[0]) * e; RAFT.z = a[1] + (b[1] - a[1]) * e;
    RF.pole.rotation.x = 0.12 + Math.sin(T0.t * 3.2) * 0.3 * Math.sign(b[1] - a[1]);
    RF.rip -= dt; if (RF.rip <= 0 && !reduced) { RF.rip = 0.32; splash(RAFT.x - 0.7, -0.35, RAFT.z, 2); }
    if (T0.ride) { pp.x = RAFT.x; pp.z = RAFT.z; target.set(pp.x, 0, pp.z); pip.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]); work = null;
      if (typeof dog !== 'undefined' && dog && dog.g) dog.g.position.set(RAFT.x + 0.4, 0, RAFT.z - Math.sign(b[1] - a[1]) * 0.55); }
    if (u >= 1) { RF.at = T0.dest; RF.trip = null; RAFT.on = true; RF.armed = !T0.ride; RF.pole.rotation.x = 0.12; Snd.play('tock', { gain: 0.4, f: 260 });
      if (T0.ride && typeof dog !== 'undefined' && dog && dog.g) { const [jx, jz] = raftJetty(RF.at); dog.g.position.set(jx + (RF.at ? -1.4 : 1.4), 0, jz + 0.5); } }
    return;
  }
  if (enSleep || rising) return;
  const d = Math.hypot(pp.x - RAFT.x, pp.z - RAFT.z);
  if (d > 1.15) RF.armed = true;
  if (RF.armed && d < 0.5) { const to = raftEnd(1 - RF.at); RF.trip = { t: 0, dur: Math.hypot(to[0] - RAFT.x, to[1] - RAFT.z) / 2.4, from: [RAFT.x, RAFT.z], to, dest: 1 - RF.at, ride: true }; RAFT.on = false; work = null; Snd.play('whoosh', { gain: 0.3, f: 300 }); return; }
  /* the raft is at the other bank: walking out on this jetty brings it over */
  const far = 1 - RF.at, to = raftEnd(far), jx = to[0] + (far ? -0.75 : 0.75);
  if (Math.hypot(pp.x - jx, pp.z - to[1]) < 0.7) { RF.trip = { t: 0, dur: Math.hypot(to[0] - RAFT.x, to[1] - RAFT.z) / 3.2, from: [RAFT.x, RAFT.z], to, dest: far, ride: false }; RAFT.on = false; Snd.play('whoosh', { gain: 0.25, f: 260 }); }
}
