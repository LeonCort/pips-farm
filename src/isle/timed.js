/* ---------- things that only come at certain times (Leon's idea list, 2026-11-23) ----------
   At night, glowing moon mushrooms pop up near Pip: one pick each, coins (and now and then a gem). They are gone by morning.
   At dawn, a golden butterfly flutters by: catch it (walk into it) and it leaves a gem. One each morning. */
const shroomMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0, emissive: new T.Color('#3fb8e8'), emissiveIntensity: 0.9 });
const SHROOM_GEO = (() => {
  const L = [];
  [[0, 0, 1], [0.16, 0.1, 0.7], [-0.13, 0.12, 0.6]].forEach(([x, z, s], k) => {
    const st = new T.CylinderGeometry(0.035 * s, 0.05 * s, 0.26 * s, 6); st.translate(x, 0.13 * s, z); L.push(fac(st, '#eef4f2', 2700 + k));
    const cap = new T.SphereGeometry(0.13 * s, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2); cap.scale(1, 0.75, 1); cap.translate(x, 0.25 * s, z); L.push(fac(cap, (cx, cy, cz, i) => new T.Color(i % 5 === 0 ? '#e9fbff' : '#7fd8f5'), 2710 + k)); });
  return merged(L.map((q) => (q.index ? q.toNonIndexed() : q)), MAT, new T.Group()).geometry;
})();
NODE_R.shroom = 0.25; YIELD.shroom = ['coin', 2]; HITS.shroom = 1; REGROW.shroom = [1e9, 0]; LOW.shroom = 0.02; TREASURE.shroom = ['crystal', 0.2]; HP_H.shroom = 0.75; XP_FOR.shroom = 4;
let nightWas = null, flutter = null, flutterDay = -1;
function timedSpot(r0, r1) {
  for (let k = 0; k < 60; k++) {
    const a = Math.random() * 6.28, r = r0 + Math.random() * (r1 - r0), x = pip.position.x + Math.cos(a) * r, z = pip.position.z + Math.sin(a) * r;
    if (walkSdf(x, z) > -0.8) continue; const A = areaAt(x, z); if (!A || !HAS[A.id]) continue;
    if (nodes.some((n) => Math.hypot(n.x - x, n.z - z) < 1.0) || signs.some((s) => Math.hypot(s.x - x, s.z - z) < 1.3) || Math.hypot(x - STORE.x, z - STORE.z) < 1.4 || Math.hypot(x - TENT_RING.x, z - TENT_RING.z) < 1.2 || Math.hypot(x + 1.1, z - 1.0) < 1.4) continue;
    return [x, z];
  }
  return null;
}
function timedStep(dt) {
  if (isNight !== nightWas) {
    if (isNight && nightWas !== null) { /* nightfall: mushrooms */
      for (let k = 0; k < 5; k++) { const p = timedSpot(2, 8); if (!p) break; const n = makeNode('shroom', p[0], p[1], 2800 + Math.floor(Math.random() * 999)); n.pop = 0.001; n.g.scale.setScalar(0.01); }
      Snd.play('sparkle', { gain: 0.3 });
    }
    if (!isNight) for (let k = nodes.length - 1; k >= 0; k--) if (nodes[k].kind === 'shroom') { sc.remove(nodes[k].g); nodes.splice(k, 1); } /* morning: they are gone */
    nightWas = isNight;
  }
  /* the golden butterfly at dawn */
  const f = dayFrac(), day = Math.floor(state.clock / DAY);
  if (!flutter && f > 0.0 && f < 0.12 && day !== flutterDay && !inCave && !enSleep) { const p = timedSpot(3, 6); if (p) { flutterDay = day; flutter = flutterMake(p[0], p[1]); } }
  if (flutter) flutterStep(flutter, dt);
}
function flutterMake(x, z) {
  const g = new T.Group(); g.position.set(x, 1.1, z); sc.add(g);
  const wm = new T.MeshBasicMaterial({ color: '#ffd23a', side: T.DoubleSide }), wg = new T.CircleGeometry(0.16, 10); wg.scale(1, 1.3, 1); wg.translate(0.15, 0.05, 0);
  const L = new T.Mesh(wg, wm), R = new T.Mesh(wg, wm); R.rotation.y = Math.PI; g.add(L); g.add(R);
  const body = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, 0.24, 5), new T.MeshBasicMaterial({ color: '#5a3a1a' })); body.rotation.x = Math.PI / 2; g.add(body);
  const halo = new T.Sprite(new T.SpriteMaterial({ map: softTex(32, 32), color: '#fff0a0', transparent: true, opacity: 0.55, depthWrite: false })); halo.scale.set(0.9, 0.9, 1); g.add(halo);
  g.scale.setScalar(1.7);
  return { x, z, g, L, R, t: 0, life: 45, caught: false };
}
function flutterStep(F, dt) {
  F.t += dt; const fl = Math.sin(F.t * 18) * 0.9; F.L.rotation.y = fl; F.R.rotation.y = Math.PI - fl;
  if (!F.caught) {
    const a = F.t * 0.7; F.g.position.set(F.x + Math.cos(a) * 1.2 + Math.sin(F.t * 2.3) * 0.3, 1.0 + Math.sin(F.t * 3.1) * 0.25, F.z + Math.sin(a * 1.3) * 0.9); F.g.rotation.y = -a;
    if (Math.hypot(pip.position.x - F.g.position.x, pip.position.z - F.g.position.z) < 0.75) {
      F.caught = true; F.ct = F.t; Snd.play('success', { gain: 0.5, f: 'G6' }); Snd.play('sparkle', { gain: 0.5 }, 0.1); burst(F.g.position.x, 1.2, F.g.position.z, 8); xpGain(6);
      const m = itemModel('crystal'); m.position.set(F.g.position.x, 1.0, F.g.position.z); sc.add(m); drops.push({ m, t: 'crystal', vx: 0.6, vz: 0.6, vy: 3.5, land: 0, wait: 0.2 });
    }
    if (F.t > F.life) F.caught = true, F.ct = F.t;
  } else { F.g.position.y += dt * 2.2; F.g.position.x += dt * 1.2; if (F.t - F.ct > 2) { sc.remove(F.g); flutter = null; } }
}
