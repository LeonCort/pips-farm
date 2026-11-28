/* ---------- the Ember Isle's craft: carrying the fire (Leon 2026-11-28: each island gets a new fun way of gathering,
   played a lot on its own island and now and then later, so the time there is play and not grinding) ----------
   Embers are the Ember Isle's own material. On every Ember square Pip owns there is a little bubbling fire vent and three
   cold stone urns further off. Walking over the vent, Pip lifts a pot of glowing fire over its head. The pot slowly
   cools on the way (it shrinks and dims), so Pip must hurry to an urn: walking past one lights it. If the pot goes
   out, the vent fills it again (never a fail). With all three urns burning, they shoot sparks together and a glowing
   ember lump lands at the vent: three embers. Each square once a day.
   Saved: state.isle.urns = { day, done: { area id: 1 } }. Which urns burn and the pot are not saved. */
const UF = { sq: {}, pot: null, heat: 0, from: null };
const URN_ISLE = (A) => A && !A.secret && A.id[0] === 'e';
const urnS = () => state.isle.urns || (state.isle.urns = { day: -1, done: {} });
const URN_COOL = 14; /* seconds a full pot stays hot */
function urnFree(A, x, z, r) {
  if (areaAt(x, z) !== A || walkSdf(x, z) > -0.8 || campNear(x, z, 1.5)) return false;
  return !nodes.some((n) => n.st !== 'gone' && Math.hypot(n.x - x, n.z - z) < r + (n.kind === 'tree' ? 0.8 : 0));
}
function urnPick(A, salt, keep) {
  for (let k = 0; k < 160; k++) { const x = A.cx + (hash(k, 8400 + salt + A.i * 13 + A.j) - 0.5) * 8.6, z = A.cz + (hash(k, 8401 + salt + A.i * 7 - A.j) - 0.5) * 8.6;
    if (urnFree(A, x, z, 0.9) && keep.every((p) => Math.hypot(x - p[0], z - p[1]) > 2.6)) return [x, z]; }
  return null;
}
function urnFlame() {
  const g = new T.Group(), m1 = new T.Mesh(new T.ConeGeometry(0.16, 0.42, 7), new T.MeshBasicMaterial({ color: '#ffb23c', transparent: true, opacity: 0.9 })), m2 = new T.Mesh(new T.ConeGeometry(0.09, 0.26, 6), new T.MeshBasicMaterial({ color: '#fff1a8' }));
  m1.position.y = 0.21; m2.position.y = 0.14; g.add(m1, m2); return g;
}
function urnMake(A) {
  const v = urnPick(A, 0, []); if (!v) return null; const at = [v];
  for (let k = 0; k < 3; k++) { const u = urnPick(A, 40 + k * 17, at); if (!u) return null; at.push(u); }
  /* the vent: a ring of dark rocks round a glowing pool */
  const g = new T.Group(); g.position.set(v[0], 0, v[1]); sc.add(g); const L = [];
  for (let k = 0; k < 7; k++) { const a = k / 7 * 6.28, q = new T.DodecahedronGeometry(0.17 + hash(k, 8410) * 0.06, 0); q.translate(Math.cos(a) * 0.5, 0.1, Math.sin(a) * 0.5); L.push(fac(q, () => new T.Color('#3d3434'), 8411 + k)); }
  merged(L, MAT, g);
  const pool = new T.Mesh(new T.CircleGeometry(0.42, 16), new T.MeshBasicMaterial({ color: '#ff7a1e' })); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.05; g.add(pool);
  lookFoot(v[0], v[1], 0.7, 0.7);
  const urns = at.slice(1).map(([x, z], k) => { const u = new T.Group(); u.position.set(x, 0, z); sc.add(u); const M = [];
    let q = new T.CylinderGeometry(0.26, 0.18, 0.5, 9); q.translate(0, 0.25, 0); M.push(fac(q, () => new T.Color('#7d6f66'), 8420 + k));
    q = new T.TorusGeometry(0.26, 0.05, 5, 12); q.rotateX(Math.PI / 2); q.translate(0, 0.5, 0); M.push(fac(q, () => new T.Color('#5b4f49'), 8423 + k));
    merged(M.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, u); const f = urnFlame(); f.position.y = 0.48; f.visible = false; u.add(f); lookFoot(x, z, 0.4, 0.4);
    return { g: u, f, x, z, lit: 0 }; });
  return { id: A.id, vx: v[0], vz: v[1], g, pool, urns };
}
/* the pot over Pip's head */
function urnPot() {
  const g = new T.Group(), b = new T.Mesh(new T.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new T.MeshStandardMaterial({ color: '#4a3a33', roughness: 0.8, side: T.DoubleSide }));
  const e = new T.Mesh(new T.SphereGeometry(0.15, 10, 8), new T.MeshBasicMaterial({ color: '#ff8a2a' })); e.position.y = 0.02; const f = urnFlame(); f.position.y = 0.05; f.scale.setScalar(0.8);
  g.add(b, e, f); g.userData = { e, f }; g.visible = false; sc.add(g); return g;
}
function urnStep(dt) {
  if (!state.isle || inCave) return; const S = urnS(), day = Math.floor(state.clock / DAY), pp = pip.position;
  if (S.day !== day) { S.day = day; S.done = {}; Object.values(UF.sq).forEach((Q) => { if (Q) Q.urns.forEach((u) => { u.lit = 0; }); }); }
  AREAS.forEach((A) => { if (URN_ISLE(A) && HAS[A.id] && UF.sq[A.id] === undefined) UF.sq[A.id] = urnMake(A); });
  if (!UF.pot) UF.pot = urnPot();
  Object.values(UF.sq).forEach((Q) => { if (!Q) return; const done = !!S.done[Q.id];
    Q.pool.material.color.setHSL(0.07, 1, done ? 0.25 : 0.52 + Math.sin(time * 3 + Q.vx) * 0.06);
    Q.urns.forEach((u, k) => { u.f.visible = done || !!u.lit; if (u.f.visible) { const s = 1 + Math.sin(time * 11 + k * 2) * 0.12; u.f.scale.set(s, 1 + Math.sin(time * 9 + k) * 0.18, s); } }); });
  /* lifting fire at a vent */
  const A = areaAt(pp.x, pp.z), Q = A && UF.sq[A.id];
  if (Q && !S.done[Q.id] && !enSleep && Math.hypot(pp.x - Q.vx, pp.z - Q.vz) < 0.75 && (UF.heat < 0.6 || UF.from !== Q)) { if (UF.heat <= 0) Snd.play('whoosh', { gain: 0.25, f: 260 }); UF.heat = 1; UF.from = Q; }
  const P = UF.pot, F = UF.from; P.visible = UF.heat > 0 && !!F;
  if (!P.visible) return;
  UF.heat -= dt / URN_COOL; if (UF.heat <= 0 || (A && UF.from && A !== areaAt(F.vx, F.vz) && !URN_ISLE(A))) { UF.heat = 0; Snd.play('swish', { gain: 0.15, f: 200 }); burst(pp.x, 2, pp.z, 3); return; } /* the pot goes out */
  const h = UF.heat; P.position.set(pp.x, 1.95 + (pp.y || 0) + Math.sin(time * 6) * 0.03, pp.z);
  P.userData.e.material.color.setHSL(0.06, 1, 0.2 + h * 0.38); P.userData.e.scale.setScalar(0.5 + h * 0.5); P.userData.f.scale.setScalar(0.25 + h * 0.75); P.userData.f.visible = h > 0.12;
  /* lighting the urns of the square the fire came from */
  F.urns.forEach((u) => { if (!u.lit && Math.hypot(pp.x - u.x, pp.z - u.z) < 0.85) { u.lit = 1; Snd.play('pop', { gain: 0.35, f: 380 }); Snd.play('whoosh', { gain: 0.2 }); burst(u.x, 0.8, u.z, 6); } });
  if (F.urns.every((u) => u.lit) && !S.done[F.id]) { /* all three burn: sparks, and the ember lump lands at the vent */
    S.done[F.id] = 1; UF.heat = 0; state.isle.store.ember = (state.isle.store.ember || 0) + 3; invDirty = true; xpGain(XP_FOR.cinder || 4); bldBadge(); save();
    F.urns.forEach((u) => burst(u.x, 1.0, u.z, 10)); burst(F.vx, 0.6, F.vz, 14);
    const sp = new T.Sprite(new T.SpriteMaterial({ map: hamGiftTex('ember', 3), transparent: true, depthWrite: false })); sp.scale.set(1.5, 0.75, 1); sp.position.set(F.vx, 1.6, F.vz); sc.add(sp); FD.floats.push({ sp, t: 0, y: 0.1 });
    Snd.play('success', { gain: 0.45 }); Snd.play('sparkle', { gain: 0.4 });
  }
}
ISLE_STEPS.push(urnStep);
