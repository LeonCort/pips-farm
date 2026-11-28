/* ---------- springs (Leon's idea list, 2026-11-23: "fountains coming up") ----------
   Now and then a spring of water bursts up out of the ground somewhere near Pip and splashes for a while. Running into
   it gives a big drink (energy) and a few coins jump out of the water. Then it sinks back. The guide arrow points to it. */
const SPRING_EVERY = [55, 85]; /* seconds between springs */
let springT = 25, spring = null;
const springMat = new T.MeshStandardMaterial({ color: '#8fd6f0', transparent: true, opacity: 0.75, roughness: 0.15, metalness: 0, emissive: new T.Color('#2f7fa8'), emissiveIntensity: 0.25, depthWrite: false });
function springMake(x, z) {
  const g = new T.Group(); g.position.set(x, 0, z); sc.add(g);
  const pool = new T.Mesh(new T.CircleGeometry(0.75, 28), new T.MeshBasicMaterial({ color: '#7cc8e6', transparent: true, opacity: 0.85 })); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.04; g.add(pool);
  const rim = new T.Mesh(new T.RingGeometry(0.72, 0.86, 28), new T.MeshBasicMaterial({ color: '#e6f6fb', transparent: true, opacity: 0.9 })); rim.rotation.x = -Math.PI / 2; rim.position.y = 0.045; g.add(rim);
  const col = new T.Mesh(new T.CylinderGeometry(0.12, 0.3, 1, 12, 1, true), springMat); col.position.y = 0.5; g.add(col);
  const top = new T.Mesh(new T.SphereGeometry(0.28, 12, 8), springMat); g.add(top);
  const stones = []; for (let k = 0; k < 7; k++) { const a = k / 7 * 6.28, q = ico(0.1 + hash(k, 2) * 0.06, 0, 2600 + k); q.scale(1.2, 0.6, 1); q.translate(Math.cos(a) * 0.9, 0.04, Math.sin(a) * 0.9); stones.push(fac(q, tone('#a9b2bb', k, 0.6), 2600 + k)); }
  merged(stones.map((q) => (q.index ? q.toNonIndexed() : q)), MAT, g);
  g.scale.setScalar(0.01);
  return { x, z, g, pool, rim, col, top, t: 0, life: 28, used: false, h: 0 };
}
/* a clear spot on Pip's land, 3 to 6 steps away, not on a tree or a sign */
function springSpot() {
  for (let k = 0; k < 80; k++) {
    const a = Math.random() * 6.28, r = 2.5 + Math.random() * 4.5, x = pip.position.x + Math.cos(a) * r, z = pip.position.z + Math.sin(a) * r;
    if (walkSdf(x, z) > -1.1) continue; const A = areaAt(x, z); if (!A || !HAS[A.id] || A.cave) continue;
    if (nodes.some((n) => Math.hypot(n.x - x, n.z - z) < 1.3) || signs.some((s) => Math.hypot(s.x - x, s.z - z) < 1.5) || chests.some((c) => Math.hypot(c.x - x, c.z - z) < 1.5)) continue;
    if (Math.hypot(x - STORE.x, z - STORE.z) < 1.6 || Math.hypot(x - TENT_RING.x, z - TENT_RING.z) < 1.6 || campNear(x, z, 1.6) || roadKind(x, z)) continue;
    if (A.secret || ISLE_KEEPS.some((f) => f(A, x, z))) continue; /* not inside a hidden world's laid pieces */
    if (ruins.some((R) => Math.hypot(R.x - x, R.z - z) < 2.2) || (stairsDown && Math.hypot(stairsDown.x - x, stairsDown.z - z) < 2)) continue;
    return [x, z];
  }
  return null;
}
function springStep(dt) {
  if (!spring) {
    springT -= dt; if (springT > 0 || inCave || enSleep || caveT || rising) return;
    const p = springSpot(); springT = p ? SPRING_EVERY[0] + Math.random() * (SPRING_EVERY[1] - SPRING_EVERY[0]) : 1.5; if (!p) return;
    spring = springMake(p[0], p[1]); Snd.play('whoosh', { gain: 0.35 }); Snd.play('pop', { gain: 0.3, f: 300 }, 0.2); return;
  }
  const S = spring; S.t += dt;
  const grow = Math.min(1, S.t / 0.5), sink = S.used ? Math.max(0, 1 - (S.t - S.usedAt) / 1.2) : Math.min(1, Math.max(0, (S.life - S.t) / 1.5));
  S.g.scale.setScalar(Math.max(0.01, grow * (S.used ? 1 : Math.max(0.01, sink))));
  /* the water column jumps up and down; drops fly off it */
  const hgt = (S.used ? sink : 1) * (1.1 + (reduced ? 0 : 0.35 * Math.sin(S.t * 5) + 0.15 * Math.sin(S.t * 13)));
  S.col.scale.set(1, Math.max(0.01, hgt), 1); S.col.position.y = hgt / 2; S.top.position.y = hgt; S.top.scale.setScalar(0.8 + 0.25 * Math.sin(S.t * 9));
  S.rim.scale.setScalar(1 + 0.06 * Math.sin(S.t * 6));
  if (!reduced && (S.h -= dt) <= 0) { S.h = 0.35; splash(S.x, hgt + 0.1, S.z, 3); }
  const d = Math.hypot(pip.position.x - S.x, pip.position.z - S.z);
  if (!S.used && d < 0.85) {
    S.used = true; S.usedAt = S.t;
    state.isle.en = Math.min(enMax(), state.isle.en + 30); enShow = -1; xpGain(4);
    Snd.play('sparkle', { gain: 0.5 }); Snd.play('success', { gain: 0.4, f: 'E6' }, 0.1); splash(S.x, 1.2, S.z, 10);
    const n = 1 + Math.floor(Math.random() * 3); for (let k = 0; k < n; k++) springCoin(S, k);
    if (ENB.el) { ENB.el.classList.remove('wig'); void ENB.el.offsetWidth; ENB.el.classList.add('wig'); }
  }
  if ((S.used && S.t - S.usedAt > 1.2) || S.t > S.life) { sc.remove(S.g); spring = null; }
}
function springCoin(S, k) {
  const m = itemModel('coin'), a = Math.random() * 6.28; m.position.set(S.x, 1.2, S.z); sc.add(m);
  drops.push({ m, t: 'coin', vx: Math.cos(a) * 1.3, vz: Math.sin(a) * 1.3, vy: 4 + Math.random() + k * 0.3, land: 0, wait: 0.25 });
}
