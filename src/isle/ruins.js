/* ---------- abandoned houses (Leon's idea list, 2026-11-23) ----------
   An old stone cottage stands in some areas, its door boarded up with planks. Pip knocks the planks off with the axe,
   the door swings open, light comes out and treasure rolls out to Pip: coins and gems for the backpack. Once open it stays open. */
const RUIN_BOARDS = (() => {
  const L = [];
  [[0.5, 0.1], [-0.55, -0.05], [0.05, 0.02]].forEach(([r, y], k) => { const q = new T.BoxGeometry(0.86, 0.13, 0.05); q.rotateZ(r); q.translate(0, 0.42 + y + k * 0.1, 0.03); L.push(fac(q, (cx, cy, cz, i) => tone('#9a6a3e', i + k * 7, 0.6), 1500 + k)); });
  return merged(L.map((q) => (q.index ? q.toNonIndexed() : q)), MAT, new T.Group()).geometry;
})();
const ruins = [];
const RUIN_LOOT = [['coin', 'coin', 'coin', 'gem'], ['coin', 'coin', 'gem', 'gem'], ['coin', 'coin', 'coin', 'gem', 'gem', 'gem']];
function makeRuin(A, fresh) {
  const [ox, oz, turn] = A.ruin, x = A.cx + ox, z = A.cz + oz, idx = AREAS.indexOf(A);
  const rot = turn; /* the door faces the camera (south, +z), so the child sees the planks and the light coming out */
  const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = rot; sc.add(g);
  const L = [], wall = (w, h, d, px, py, pz, k) => { const q = new T.BoxGeometry(w, h, d, Math.max(1, Math.round(w * 3)), Math.max(1, Math.round(h * 3)), 1); jit(q, 0.025, 1510 + k); q.translate(px, py, pz);
    L.push(fac(q, (cx, cy, cz, i) => (cy > py + h / 2 - 0.12 && hash(i, k) > 0.35 ? new T.Color('#6f9a4a') : shadeY(hash(i, k + 3) > 0.8 ? '#a69c8a' : '#bdb4a2', cy, 0, 1.4, i, 0.45)), 1510 + k)); };
  wall(2.3, 1.35, 0.18, 0, 0.675, -0.95, 0); /* back */
  wall(0.18, 1.2, 1.9, -1.06, 0.6, 0, 1); /* left */
  wall(0.18, 0.8, 1.2, 1.06, 0.4, -0.35, 2); /* right, broken down at the front */
  wall(0.78, 1.35, 0.18, -0.76, 0.675, 0.95, 3); wall(0.55, 1.0, 0.18, 0.86, 0.5, 0.95, 4); /* front, either side of the door */
  wall(0.8, 0.26, 0.2, 0, 1.22, 0.95, 5); /* over the door */
  /* half a roof, sagging, with holes */
  let q = new T.BoxGeometry(2.5, 0.09, 1.25, 6, 1, 3); jit(q, 0.03, 1520); q.rotateX(0.42); q.translate(-0.05, 1.5, -0.42); L.push(fac(q, (cx, cy, cz, i) => tone(hash(i, 4) > 0.75 ? '#6e5a44' : '#8a6a4a', i, 0.5), 1520));
  q = new T.BoxGeometry(1.2, 0.09, 0.9, 3, 1, 2); jit(q, 0.03, 1521); q.rotateX(-0.3); q.rotateZ(0.2); q.translate(-0.55, 1.28, 0.48); L.push(fac(q, (cx, cy, cz, i) => tone('#7d6046', i, 0.5), 1521));
  /* ivy and fallen stones */
  for (let k = 0; k < 7; k++) { const a = hash(k, idx + 30), b = ico(0.12 + hash(k, idx) * 0.1, 0, 1530 + k); b.translate((a - 0.5) * 2.2, 0.15 + hash(k, 9) * 1.1, -0.98 + (k % 2) * 0.02); L.push(fac(b, tone('#5f8f40', k, 0.7), 1530 + k)); }
  for (let k = 0; k < 5; k++) { const b = ico(0.09 + hash(k, idx + 2) * 0.08, 0, 1540 + k); b.scale(1.2, 0.7, 1); b.translate(1.35 + hash(k, 3) * 0.4, 0.05, 0.2 + (hash(k, 4) - 0.5) * 1.4); L.push(fac(b, tone('#b5ac9a', k, 0.6), 1540 + k)); }
  /* the doorway: dark until it opens */
  q = new T.PlaneGeometry(0.62, 1.08); q.translate(0, 0.54, 0.86);
  const dark = new T.Mesh(q, new T.MeshBasicMaterial({ color: '#2a2420' })); g.add(dark);
  merged(L.map((q) => (q.index ? q.toNonIndexed() : q)), MAT, g);
  /* a warm glow inside, seen through the door once it is open */
  const glow = new T.Mesh(new T.PlaneGeometry(0.62, 1.08), new T.MeshBasicMaterial({ color: '#ffd77a', transparent: true, opacity: 0, depthWrite: false })); glow.position.set(0, 0.54, 0.87); g.add(glow);
  const c = Math.cos(rot), s = Math.sin(rot), dx = x + s * 1.25, dz = z + c * 1.25;
  const R = { A, g, x, z, rot, dx, dz, dark, glow, open: !!state.isle.ruins[A.id], loot: RUIN_LOOT[ruins.length % RUIN_LOOT.length], t: 0, planks: null };
  if (!R.open) { const n = makeNode('planks', x + s * 0.98, z + c * 0.98, 1550 + idx); n.g.rotation.y = rot; n.ruin = R; R.planks = n; if (fresh) { n.pop = 0.001; n.g.scale.setScalar(0.01); } }
  else { glow.material.opacity = 0.35; R.t = 9; }
  if (fresh) { g.scale.setScalar(0.01); R.pop = 0.001; }
  ruins.push(R); return R;
}
function ruinOpen(R) {
  if (!R || R.open) return; R.open = true; R.t = 0; state.isle.ruins[R.A.id] = 1; save();
  Snd.play('whoosh', { gain: 0.35 }); Snd.play('sparkle', { gain: 0.5 }, 0.5); Snd.play('success', { gain: 0.45, f: 'G5' }, 0.9);
  xpGain(15);
}
function ruinStep(dt) {
  ruins.forEach((R) => {
    if (R.pop) { R.pop = Math.min(1, R.pop + dt * 1.5); R.g.scale.setScalar(R.pop < 0.7 ? R.pop / 0.7 * 1.08 : 1.08 - (R.pop - 0.7) / 0.3 * 0.08); if (R.pop >= 1) { R.pop = 0; R.g.scale.setScalar(1); } }
    /* Pip walks round the walls; only the doorway is open */
    const lx = pip.position.x - R.x, lz = pip.position.z - R.z, c = Math.cos(R.rot), s = Math.sin(R.rot), u = lx * c - lz * s, v = lx * s + lz * c;
    if (Math.abs(u) < 1.3 && v > -1.2 && v < 1.15) { const push = [1.3 - u, u + 1.3, v + 1.2, 1.15 - v], k = push.indexOf(Math.min(...push)); let nu = u, nv = v;
      if (k === 0) nu = 1.3; else if (k === 1) nu = -1.3; else if (k === 2) nv = -1.2; else nv = 1.15;
      pip.position.x = R.x + nu * c + nv * s; pip.position.z = R.z - nu * s + nv * c; }
    if (!R.open) return;
    R.t += dt;
    R.glow.material.opacity = Math.min(0.55, R.t * 0.8) * (reduced ? 1 : 0.85 + 0.15 * Math.sin(time * 2.4));
    /* the treasure rolls out of the door one by one, towards Pip */
    if (R.loot && R.t > 0.6) { const k = Math.floor((R.t - 0.6) / 0.22); while ((R.sent || 0) <= k && (R.sent || 0) < R.loot.length) { ruinDrop(R, R.loot[R.sent || 0]); R.sent = (R.sent || 0) + 1; } if (R.sent >= R.loot.length) R.loot = null; }
  });
}
function ruinDrop(R, t) {
  const m = itemModel(t), c = Math.cos(R.rot), s = Math.sin(R.rot), a = R.rot + (Math.random() - 0.5) * 1.2;
  m.position.set(R.x + s * 0.7, 0.5, R.z + c * 0.7); sc.add(m);
  drops.push({ m, t, vx: Math.sin(a) * 1.8, vz: Math.cos(a) * 1.8, vy: 3.4 + Math.random(), land: 0, wait: 0.2 });
  Snd.play('sparkle', { gain: 0.35 }); burst(R.x + s * 0.9, 1.0, R.z + c * 0.9, 3);
}
