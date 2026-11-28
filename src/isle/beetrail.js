/* ---------- the Meadow's craft: bee trails (Leon 2026-11-28: each island gets a new fun way of gathering, played a lot
   on its own island, and now and then later, so the time there is play and not grinding) ----------
   Honey is the Meadow's own material: its later parts and the windmill ask for it. Every Meadow square Pip owns has a
   flower patch. When Pip walks up to it, a bee rises from the flowers and buzzes off across the island, leaving a glittering
   trail. It waits whenever Pip falls behind. Where it stops, a wild hive pops up by the grass: Pip takes the comb (two honey,
   four once the Bee Queen's garden is open), and the bee flies home. Each patch sends one bee a day.
   Saved: state.isle.bees = { day, done: { area id: 1 } }. A wild hive is not saved: it is there until Pip takes it or
   leaves the game. */
const BT = { patch: {}, bee: null, sparks: [], geo: null };
const BEE_ISLE = (A) => A && !A.secret && A.id[0] === 'm';
const beeS = () => state.isle.bees || (state.isle.bees = { day: -1, done: {} });
/* a free spot on owned Meadow ground: off roads, away from what stands there */
function beeFree(x, z, r) {
  const A = areaAt(x, z); if (!BEE_ISLE(A) || !HAS[A.id] || walkSdf(x, z) > -1.1 || campNear(x, z, 1.5) || tallKeep(A, x, z)) return false; /* out of the tall grass, so the hive is easy to see */
  return !nodes.some((n) => n.st !== 'gone' && Math.hypot(n.x - x, n.z - z) < r);
}
function beePatchAt(A) { for (let k = 0; k < 40; k++) { const x = A.cx + (hash(k, 7300 + A.i * 13 + A.j) - 0.5) * 8.5, z = A.cz + (hash(k, 7400 + A.i * 7 - A.j) - 0.5) * 8.5; if (beeFree(x, z, 1.3)) return [x, z]; } return null; }
/* the patch: a ring of bright flowers round one big golden one */
function beePatchMake(A) {
  const at = beePatchAt(A); if (!at) return null; const g = new T.Group(), L = []; g.position.set(at[0], 0, at[1]); sc.add(g); let q;
  for (let k = 0; k < 9; k++) { const a = k / 9 * 6.28 + hash(k, 7500) * 0.5, r = 0.35 + hash(k, 7501) * 0.25, h = 0.22 + hash(k, 7502) * 0.14, col = ['#f07aa8', '#ffd84a', '#b78af0', '#ffffff'][k % 4];
    q = new T.CylinderGeometry(0.012, 0.014, h, 4); q.translate(Math.cos(a) * r, h / 2, Math.sin(a) * r); L.push(fac(q, () => new T.Color('#4f8a3a'), 7510 + k));
    q = new T.SphereGeometry(0.06, 7, 5); q.scale(1, 0.55, 1); q.translate(Math.cos(a) * r, h + 0.02, Math.sin(a) * r); L.push(fac(q, () => new T.Color(col), 7520 + k)); }
  q = new T.CylinderGeometry(0.018, 0.02, 0.42, 5); q.translate(0, 0.21, 0); L.push(fac(q, () => new T.Color('#4f8a3a'), 7540));
  for (let k = 0; k < 6; k++) { q = new T.SphereGeometry(0.07, 6, 4); q.scale(1.4, 0.35, 0.8); q.translate(0.08, 0.44, 0); q.rotateY(k / 6 * 6.28); L.push(fac(q, () => new T.Color('#ffc21e'), 7541 + k)); }
  q = new T.SphereGeometry(0.055, 7, 5); q.translate(0, 0.46, 0); L.push(fac(q, () => new T.Color('#8a4a22'), 7550));
  merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g); lookFoot(at[0], at[1], 0.6, 0.6);
  return { id: A.id, x: at[0], z: at[1], g };
}
/* a bee: a striped body, a head, two wings that flap */
function beeModel() {
  const g = new T.Group(), L = []; let q = new T.SphereGeometry(0.11, 10, 8); q.scale(1.35, 1, 1); L.push(fac(q, (cx) => new T.Color(Math.floor((cx + 0.15) / 0.06) % 2 ? '#2b2420' : '#ffc21e'), 7560));
  q = new T.SphereGeometry(0.07, 8, 6); q.translate(0.15, 0.02, 0); L.push(fac(q, () => new T.Color('#2b2420'), 7561));
  merged(L, MAT, g); const wm = new T.MeshBasicMaterial({ color: '#eaf6ff', transparent: true, opacity: 0.8, side: T.DoubleSide }), W = [];
  [-1, 1].forEach((s) => { const w = new T.Mesh(new T.CircleGeometry(0.09, 8), wm); w.scale.set(1.3, 0.7, 1); w.rotation.x = Math.PI / 2; w.position.set(-0.02, 0.1, s * 0.08); g.add(w); W.push(w); });
  g.userData.w = W; g.scale.setScalar(1.25); sc.add(g); return g;
}
/* where today's bee goes from a patch: a spot on owned Meadow ground, some way off, the same all day */
function beeGoal(P) {
  const day = Math.floor(state.clock / DAY);
  for (let k = 0; k < 60; k++) { const a = hash(k + day * 3, 7600 + P.id.charCodeAt(1)) * 6.28, d = 6 + hash(k + day, 7601) * 8, x = P.x + Math.cos(a) * d, z = P.z + Math.sin(a) * d; if (beeFree(x, z, 1.4)) return [x, z]; }
  return null;
}
function beeStart(P) {
  const goal = beeGoal(P); if (!goal) return; const g = beeModel(); g.position.set(P.x, 0.5, P.z);
  BT.bee = { P, g, goal, st: 'go', t: 0, hive: null }; beeS().done[P.id] = 1; save();
  Snd.play('buzz', { gain: 0.35 }); Snd.play('pop', { gain: 0.3, f: 760 }); burst(P.x, 0.6, P.z, 4);
}
function beeSpark(x, y, z) {
  if (!BT.geo) BT.geo = new T.SphereGeometry(0.045, 5, 4);
  const m = new T.Mesh(BT.geo, new T.MeshBasicMaterial({ color: '#ffe27a', transparent: true, opacity: 0.95 })); m.position.set(x, y, z); sc.add(m); BT.sparks.push({ m, t: 0 });
}
function beeStep(dt) {
  if (!state.isle || inCave) return; const S = beeS(), day = Math.floor(state.clock / DAY), pp = pip.position;
  if (S.day !== day) { S.day = day; S.done = {}; }
  /* a patch for every owned Meadow square */
  AREAS.forEach((A) => { if (BEE_ISLE(A) && HAS[A.id] && BT.patch[A.id] === undefined) BT.patch[A.id] = beePatchMake(A); });
  /* the sparkles of the trail fade */
  for (let k = BT.sparks.length - 1; k >= 0; k--) { const s = BT.sparks[k]; s.t += dt; s.m.material.opacity = Math.max(0, 0.95 - s.t / 2.2); s.m.position.y -= dt * 0.05; if (s.t > 2.2) { sc.remove(s.m); s.m.material.dispose(); BT.sparks.splice(k, 1); } }
  /* walking up to a patch that has not sent its bee today */
  if (!BT.bee && !enSleep) Object.keys(BT.patch).forEach((id) => { const P = BT.patch[id]; if (!P || S.done[id] || BT.bee) return; if (Math.hypot(pp.x - P.x, pp.z - P.z) < 1.8) beeStart(P); });
  const B = BT.bee; if (!B) return; const g = B.g; B.t += dt;
  g.userData.w.forEach((w, k) => { w.rotation.y = Math.sin(time * 60 + k * Math.PI) * 0.6; });
  if (B.st === 'go') { /* off to the hive spot, waiting for Pip whenever Pip lags behind */
    const dx = B.goal[0] - g.position.x, dz = B.goal[1] - g.position.z, d = Math.hypot(dx, dz), lag = Math.hypot(pp.x - g.position.x, pp.z - g.position.z), v = lag > 3.6 ? 0 : Math.min(2.4, 0.6 + d);
    if (d > 0.05) { g.position.x += dx / d * Math.min(d, v * dt); g.position.z += dz / d * Math.min(d, v * dt); g.rotation.y = Math.atan2(-dz, dx); }
    if (v === 0) { g.rotation.y += Math.sin(time * 3) * dt * 2; } /* hovering, turned back toward Pip */
    g.position.y = 1.1 + Math.sin(time * 5) * 0.12 + Math.min(1, B.t) * 0.2;
    if ((B.sp = (B.sp || 0) + dt) > 0.12 && v > 0) { B.sp = 0; beeSpark(g.position.x, g.position.y - 0.05, g.position.z); }
    if (lag > 3.6 && (B.bz = (B.bz || 0) + dt) > 1.6) { B.bz = 0; Snd.play('buzz', { gain: 0.2 }); } /* come on! */
    if (d < 0.1) { /* the wild hive */
      const n = makeNode('hive', B.goal[0], B.goal[1], 7700 + day % 97); n.bee = 1; n.pop = 0.001; n.g.scale.setScalar(0.01); B.hive = n; B.st = 'wait'; B.t = 0;
      Snd.play('secret', { gain: 0.4 }); burst(B.goal[0], 0.8, B.goal[1], 10); }
  } else if (B.st === 'wait') { /* round and round the hive until Pip takes the comb */
    const a = time * 2.4; g.position.set(B.goal[0] + Math.cos(a) * 0.7, 1.0 + Math.sin(time * 4) * 0.1, B.goal[1] + Math.sin(a) * 0.7); g.rotation.y = -a - Math.PI / 2;
    if (B.hive.st !== 'ready') { B.st = 'home'; B.t = 0; B.hive.beeGone = 1; }
  } else { /* home to its patch, and the empty hive goes */
    const P = B.P, dx = P.x - g.position.x, dz = P.z - g.position.z, d = Math.hypot(dx, dz); g.position.x += dx / Math.max(d, 0.01) * Math.min(d, 3 * dt); g.position.z += dz / Math.max(d, 0.01) * Math.min(d, 3 * dt); g.position.y = 1.0 + B.t * 0.6; g.rotation.y = Math.atan2(-dz, dx);
    if (B.t > 1.6 && B.hive) { B.hive.dead = 1; B.hive = null; }
    if (d < 0.2 || B.t > 6) { sc.remove(g); BT.bee = null; }
  }
}
ISLE_STEPS.push(beeStep);
