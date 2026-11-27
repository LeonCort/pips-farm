/* ---------- the ember island and its lava (Leon, 2026-11-25: each island should differ in how Pip gets about) ----------
   The last island: one square of black rock under a small volcano. Two streams of lava run from the crater to the sea
   and cut the square in three; lava is no ground to walk on. The way on is to cool it: at each stream a rope ring lies
   on the near bank with a picture of the crystals it takes. Stand in it with enough crystals and they are thrown in,
   the lava there hisses and sets into a slab of dark stone, and Pip can cross from then on (state.isle.cool).
   The middle part is the richest ground in the game (level 4). The far part holds the ember rocks: the island's own
   find (finds.js), for the lantern. The shape of it all is in rules.js (EMBER), because the walking rules need it. */
const EM = { g: null, lava: [], slabs: {}, rings: {}, tex: {}, smoke: 0, hot: 0, hold: 0 };
const emberCool = () => state.isle.cool || (state.isle.cool = {});
function emberTex(n, can) {
  const key = n + (can ? '!' : ''); if (EM.tex[key]) return EM.tex[key];
  const c = document.createElement('canvas'); c.width = 224; c.height = 128; const x = c.getContext('2d');
  x.beginPath(); x.roundRect(6, 6, 212, 92, 30); x.fillStyle = can ? '#f3ffe6' : '#fff6e4'; x.fill(); x.lineWidth = can ? 7 : 5; x.strokeStyle = can ? '#4f8a3a' : '#6e4426'; x.stroke();
  x.beginPath(); x.moveTo(98, 96); x.lineTo(112, 122); x.lineTo(126, 96); x.fillStyle = can ? '#f3ffe6' : '#fff6e4'; x.fill();
  isleIcon(x, 'crystal', 62, 52, 1.5); x.font = '800 58px "Baloo 2", system-ui, sans-serif'; x.textBaseline = 'middle'; x.fillStyle = can ? '#3f8a3a' : PAL.ink; x.fillText(String(n), 108, 56);
  return (EM.tex[key] = new T.CanvasTexture(c));
}
/* points along a stream, every third of a metre (cut fine so the ribbon bends with the curved world) */
function emberPath(P) { const out = []; for (let k = 0; k + 1 < P.length; k++) { const L = Math.hypot(P[k + 1][0] - P[k][0], P[k + 1][1] - P[k][1]), n = Math.ceil(L / 0.33); for (let q = k ? 1 : 0; q <= n; q++) out.push([P[k][0] + (P[k + 1][0] - P[k][0]) * q / n, P[k][1] + (P[k + 1][1] - P[k][1]) * q / n]); } return out; }
function emberFill(A, fresh) {
  if (A.id !== 'e0' || EM.g) return;
  Object.assign(EMBER.cool, emberCool());
  /* what grows here is set out by hand: a little by the bridge, the rich ground between the two streams */
  [['crystal', 23.4, 24.4], ['rock', 25.4, 23.3], ['rock', 23.0, 26.2], ['crystal', 23.2, 31.5], ['crystal', 24.8, 30.0], ['boulder', 26.7, 29.7], ['crystal', 25.0, 32.6], ['crystal', 27.2, 32.4], ['rock', 23.0, 33.3], ['boulder', 26.4, 33.5], ['crystal', 28.6, 29.2]]
    .forEach(([k, x, z], q) => { const n = makeNode(k, x, z, 7400 + q); if (fresh) { n.pop = 0.001; n.g.scale.setScalar(0.01); } });
  const g = EM.g = new T.Group(); sc.add(g); const L = []; let q;
  /* the lava: a glowing ribbon down each stream, its picture sliding slowly toward the sea */
  const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#ff7a1c'; x.fillRect(0, 0, 64, 256);
  for (let k = 0; k < 60; k++) { x.fillStyle = ['#ffb23a', '#ffd76a', '#e8520f', '#ff9a2a'][k % 4]; x.globalAlpha = 0.75; x.beginPath(); x.ellipse(hash(k, 7001) * 64, hash(k, 7002) * 256, 4 + hash(k, 7003) * 9, 8 + hash(k, 7004) * 22, 0, 0, 7); x.fill(); }
  x.globalAlpha = 0.55; x.fillStyle = '#5a2412'; for (let k = 0; k < 16; k++) { x.beginPath(); x.ellipse(hash(k, 7011) * 64, hash(k, 7012) * 256, 3 + hash(k, 7013) * 5, 5 + hash(k, 7014) * 10, 0, 0, 7); x.fill(); }
  const tex = new T.CanvasTexture(c); tex.wrapS = tex.wrapT = T.RepeatWrapping; EM.lavaTex = tex; const lm = new T.MeshBasicMaterial({ map: tex, side: T.DoubleSide }); lm.userData = { noSnow: 1 };
  EMBER.lava.forEach((P, s) => { const pts = emberPath(P), pos = [], uv = [], idx = [];
    pts.forEach((p, k) => { const a = pts[Math.max(0, k - 1)], b = pts[Math.min(pts.length - 1, k + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / l, nz = (b[0] - a[0]) / l, w = 0.62 + Math.sin(k * 0.7 + s) * 0.07;
      pos.push(p[0] + nx * w, 0.075, p[1] + nz * w, p[0] - nx * w, 0.075, p[1] - nz * w); uv.push(0, k * 0.11, 1, k * 0.11); if (k) { const o = k * 2; idx.push(o - 2, o - 1, o, o, o - 1, o + 1); }
      /* a crust of dark rock along both banks */
      if (k % 2 === 0) [1, -1].forEach((sd, j) => { const r = 0.16 + hash(k, 7020 + s + j) * 0.12, e = ico(r, 0, 7030 + k + j * 100 + s * 300); e.scale(1.3, 0.7, 1.1); e.translate(p[0] + nx * sd * (w + 0.1), 0.03, p[1] + nz * sd * (w + 0.1)); L.push(fac(e, (cx, cy, cz, i) => tone(i % 5 === 0 ? '#7a3a22' : '#3a322e', i + k, 0.4), 7030 + k)); }); });
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = new T.Mesh(geo, lm); g.add(m); EM.lava.push(m); pts.forEach((p, k) => { if (k % 3 === 0) lookFoot(p[0], p[1], 0.9, 0.9); }); });
  /* the volcano: a blunt cone of dark rock with a glowing crater */
  const [vx, vz, vr] = EMBER.cone;
  q = new T.CylinderGeometry(0.95, vr + 0.15, 2.7, 11, 3); jit(q, 0.16, 7100); q.translate(vx, 1.3, vz); L.push(fac(q, (cx, cy, cz, i) => (cy > 2.3 ? tone('#7a3a22', i, 0.4) : shadeY(i % 7 === 0 ? '#5a4038' : '#3d3531', cy, 0, 2.7, i, 0.4)), 7100));
  for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283, r = ico(0.35 + hash(k, 7110) * 0.3, 1, 7111 + k); r.scale(1.2, 0.8, 1); r.translate(vx + Math.cos(a) * (vr - 0.1), 0.15, vz + Math.sin(a) * (vr - 0.1)); L.push(fac(r, (cx, cy, cz, i) => shadeY('#453c37', cy, 0, 0.6, i, 0.4), 7111 + k)); }
  const cr = new T.Mesh(new T.CircleGeometry(0.86, 14), lm); cr.rotation.x = -Math.PI / 2; cr.position.set(vx, 2.6, vz); g.add(cr);
  lookFoot(vx, vz, vr + 0.4, vr + 0.4);
  const bm = merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g); if (bm && bm.isMesh) { bm.castShadow = true; bm.receiveShadow = true; }
  /* each crossing: the slab that the lava sets into, and the ring to stand in while it is still hot */
  EMBER.cross.forEach((C, s) => { const S = [], dx = C.b[0] - C.a[0], dz = C.b[1] - C.a[1];
    for (let k = 0; k < 6; k++) { const u = (k + 0.5) / 6, e = new T.CylinderGeometry(0.5, 0.56, 0.16, 8); jit(e, 0.03, 7200 + k + s * 10); e.rotateY(hash(k, 7201 + s) * 6); e.translate(C.a[0] + dx * u + (k % 2 ? 0.28 : -0.28) * (dz / Math.hypot(dx, dz)), 0.05, C.a[1] + dz * u - (k % 2 ? 0.28 : -0.28) * (dx / Math.hypot(dx, dz))); S.push(fac(e, (cx, cy, cz, i) => tone(cy > 0.1 ? (i % 4 === 0 ? '#6a6460' : '#58524e') : '#3a3431', i + k, 0.3), 7200 + k)); }
    const sg = new T.Group(); g.add(sg); const sm = merged(S.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, sg); if (sm && sm.isMesh) { sm.castShadow = true; sm.receiveShadow = true; } sg.visible = !!EMBER.cool[C.id]; EM.slabs[C.id] = sg;
    if (!EMBER.cool[C.id]) { const ring = ropeRing(0.42, 0.56); ring.rotation.x = -Math.PI / 2; ring.position.set(C.ring[0], 0.035, C.ring[1]); sc.add(ring); const sp = isleSprite(emberTex(C.n, false), 1); sp.scale.set(1.3, 0.74, 1); sp.position.set(C.ring[0], 1.75, C.ring[1]); sc.add(sp); EM.rings[C.id] = { ring, sp, can: false }; lookFoot(C.ring[0], C.ring[1], 0.7, 0.7); } });
}
const emberKeep = (a, x, z) => a.id === 'e0' && (emberLava(x, z) < 0.3 || Math.hypot(x - EMBER.cone[0], z - EMBER.cone[1]) < EMBER.cone[2] + 0.5 || EMBER.cross.some((C) => Math.hypot(x - C.ring[0], z - C.ring[1]) < 1.1 || segD(x, z, C.a[0], C.a[1], C.b[0], C.b[1]) < 1.25));
/* black pebbles and cinders, and a few that still glow */
function emberDecor(A, L, base) {
  for (let k = 0; k < 150; k++) { const x = A.cx + (hash(k, 501 + base) - 0.5) * 11.4, z = A.cz + (hash(k, 502 + base) - 0.5) * 11.4; if (emberLava(x, z) < 0.2 || Math.hypot(x - EMBER.cone[0], z - EMBER.cone[1]) < EMBER.cone[2] + 0.2 || nodes.some((q) => Math.abs(q.x - x) < 0.55 && Math.abs(q.z - z) < 0.55)) continue;
    const r = 0.05 + hash(k, 503) * 0.1, q = ico(r, 1, 7300 + k, r * 0.1); q.scale(1.25, 0.6, 1); q.rotateY(hash(k, 504) * 6); q.translate(x, r * 0.3, z); L.push(fac(q, (cx, cy, cz, i) => (k % 9 === 0 ? tone('#e8641f', i, 0.5) : shadeY('#2f2a27', cy, 0, 0.12, i + k, 0.5)), 7300 + k)); }
}
function emberStep(dt) {
  if (!EM.g) return; const pp = pip.position;
  if (EM.lavaTex && !reduced) EM.lavaTex.offset.y = -time * 0.07;
  if (!reduced) { EM.smoke -= dt; if (EM.smoke <= 0 && Math.hypot(pp.x - EMBER.cone[0], pp.z - EMBER.cone[1]) < 22) { EM.smoke = 0.55; smokePuff(EMBER.cone[0] + (Math.random() - 0.5) * 0.6, 2.8, EMBER.cone[1] + (Math.random() - 0.5) * 0.6, '#5d5651'); } }
  if (!HAS.e0 || inCave) return;
  /* too hot to step on: a puff where Pip's feet meet the lava */
  if (!reduced && emberLava(pp.x, pp.z) < 0.28 && Math.hypot(target.x - pp.x, target.z - pp.z) > 0.15) { EM.hot -= dt; if (EM.hot <= 0) { EM.hot = 0.3; smokePuff(pp.x + (Math.random() - 0.5) * 0.3, 0.15, pp.z + (Math.random() - 0.5) * 0.3, '#ffffff'); } }
  let inRing = false;
  EMBER.cross.forEach((C) => { const R = EM.rings[C.id]; if (!R) return; const can = haveN('crystal') >= C.n;
    if (can !== R.can) { R.can = can; R.sp.material.map = emberTex(C.n, can); }
    R.sp.position.y = 1.75 + (reduced ? 0 : Math.sin(time * (can ? 4 : 2)) * (can ? 0.09 : 0.04));
    if (Math.hypot(pp.x - C.ring[0], pp.z - C.ring[1]) > 0.55 || enSleep) return; inRing = true;
    if (!can) { if (EM.hold <= 0) { EM.hold = 1.5; Snd.play('blip', { gain: 0.2, f: 300 }); } return; }
    EM.hold += dt; if (EM.hold < 0.5) return; EM.hold = 0;
    /* the crystals go in, the lava hisses and sets */
    spendN('crystal', C.n).forEach((m) => { if (m.parent) m.parent.remove(m); }); emberCool()[C.id] = 1; EMBER.cool[C.id] = 1; sc.remove(R.ring); sc.remove(R.sp); delete EM.rings[C.id];
    const S = EM.slabs[C.id]; S.visible = true; S.scale.y = 0.01; S.userData.p = 0.001; const mx = (C.a[0] + C.b[0]) / 2, mz = (C.a[1] + C.b[1]) / 2;
    for (let k = 0; k < 9; k++) smokePuff(C.a[0] + (C.b[0] - C.a[0]) * Math.random() + (Math.random() - 0.5) * 0.8, 0.2 + Math.random() * 0.5, C.a[1] + (C.b[1] - C.a[1]) * Math.random() + (Math.random() - 0.5) * 0.8, '#ffffff');
    splash(mx, 0.2, mz, 10); burst(mx, 1.0, mz, 8); Snd.play('whoosh', { gain: 0.5, f: 200 }); Snd.play('success', { gain: 0.45 }); xpGain(12); bldBadge(); save(); });
  if (!inRing) EM.hold = Math.max(0, EM.hold - dt);
  Object.keys(EM.slabs).forEach((k) => { const S = EM.slabs[k]; if (S.userData.p > 0 && S.userData.p < 1) { S.userData.p = Math.min(1, S.userData.p + dt * 2.5); S.scale.y = S.userData.p; } });
}
