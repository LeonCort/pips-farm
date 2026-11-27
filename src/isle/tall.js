/* ---------- tall grass (Leon, 2026-11-25: each island should differ in how Pip gets about, not only in looks) ----------
   The meadow's way of moving: belts of grass taller than Pip stand across it, three clumps deep, and Pip cuts a lane
   through by hand. A clump is a node that cannot be walked through; cut, it is gone for good (state.isle.cut), so a lane
   stays a lane. Now and then a coin was lying in it. Where the belts stand is set per area (rules.js: tall, as
   [x0, z0, x1, z1] boxes from the area's middle). */
YIELD.tall = ['coin', 0]; HITS.tall = 3; REGROW.tall = [1e9, 0]; LOW.tall = 0.05; NODE_R.tall = 0.62; TREASURE.tall = ['coin', 0]; XP_FOR.tall = 1; HP_H.tall = 1.75; EN_COST.tall = 1; HAND.tall = 1;
const TALL_SP = 1.4, TALL_ROW = 1.2; /* a clump is 1.5 m across: rows this close leave no way between */
const TALL_GEO = (() => { const L = [];
  for (let k = 0; k < 30; k++) { const a = hash(k, 1450) * 6.28, r = Math.sqrt(hash(k, 1451)) * 0.7, h = 1.05 + hash(k, 1452) * 0.6, q = new T.ConeGeometry(0.13, h, 3); q.translate(0, h / 2, 0); q.rotateZ((hash(k, 1453) - 0.5) * 0.45); q.rotateY(hash(k, 1454) * 6.28); q.translate(Math.cos(a) * r, 0, Math.sin(a) * r); L.push(q); }
  for (let k = 0; k < 5; k++) { const a = hash(k, 1460) * 6.28, r = hash(k, 1461) * 0.55, h = 1.5 + hash(k, 1462) * 0.25, q = new T.CylinderGeometry(0.015, 0.02, h, 3); q.translate(0, h / 2, 0); const s = ico(0.07, 0, 1463 + k); s.scale(0.8, 2.2, 0.8); s.translate(0, h, 0); [q, s].forEach((p) => { p.translate(Math.cos(a) * r, 0, Math.sin(a) * r); L.push(p.index ? p.toNonIndexed() : p); }); } /* seed heads */
  const g = fac(mergeGeos(L.map((q) => (q.index ? q.toNonIndexed() : q))), (cx, cy, cz, i) => (cy > 1.35 ? tone('#e9d27a', i, 0.4) : leafY('#9fcf52', cy, 0, 1.5, i, 0.5)), 1470);
  /* thin blades seen from above are all side: lit like that they go nearly black, so they take the ground's light instead */
  const N = g.attributes.normal; for (let i = 0; i < N.count; i++) N.setXYZ(i, N.getX(i) * 0.25, 0.95, N.getZ(i) * 0.25); N.needsUpdate = true; return g; })();
function tallCuts() { return state.isle.cut || (state.isle.cut = {}); }
/* the clumps of an area: a staggered grid inside each box */
function tallSpots(A) {
  const out = []; (A.tall || []).forEach(([x0, z0, x1, z1], b) => {
    const wide = x1 - x0 >= z1 - z0, a0 = wide ? x0 : z0, a1 = wide ? x1 : z1, c0 = wide ? z0 : x0, c1 = wide ? z1 : x1, n = Math.round((a1 - a0) / TALL_SP), st = (a1 - a0) / n; let row = 0;
    for (let c = c0; c <= c1 + 0.01; c += TALL_ROW, row++) for (let q = 0; q <= n - (row % 2); q++) { const a = a0 + (q + (row % 2 ? 0.5 : 0)) * st; out.push([A.cx + (wide ? a : c), A.cz + (wide ? c : a), b * 200 + out.length, wide ? st / 2 : TALL_ROW / 2, wide ? TALL_ROW / 2 : st / 2]); } });
  return out;
}
function tallFill(A, fresh) {
  if (mons().windmill) return; /* the windmill's wind has laid the meadow's tall grass flat (wonders.js) */
  const C = tallCuts(); tallSpots(A).forEach(([x, z, k, hx, hz]) => { const id = A.id + ':' + k; if (C[id]) return;
    const n = makeNode('tall', x, z, AREAS.indexOf(A) * 997 + 1200 + k); n.cut = id; n.box = [hx + 0.03, hz + 0.03]; if (fresh) { n.pop = 0.001; n.g.scale.setScalar(0.01); } });
}
/* each clump fills its cell of the belt: Pip is pushed out of the cell the short way, so the clumps make a wall with no
   way between them, and a cut clump leaves a lane exactly one cell wide */
function tallPush(n) {
  const pp = pip.position, dx = pp.x - n.x, dz = pp.z - n.z, ox = n.box[0] - Math.abs(dx), oz = n.box[1] - Math.abs(dz); if (ox <= 0 || oz <= 0) return;
  /* the short way out, unless that lands in the next clump: then the other way (so the seam between two clumps is shut too) */
  const nx = n.x + (dx < 0 ? -1 : 1) * n.box[0], nz = n.z + (dz < 0 ? -1 : 1) * n.box[1];
  const inOther = (x, z) => nodes.some((m) => m !== n && m.box && m.st === 'ready' && Math.abs(x - m.x) < m.box[0] - 0.001 && Math.abs(z - m.z) < m.box[1] - 0.001);
  if (ox < oz && !inOther(nx, pp.z)) pp.x = nx; else if (!inOther(pp.x, nz) || ox >= oz) pp.z = nz; else pp.x = nx;
  const tx = target.x - n.x, tz = target.z - n.z; if (Math.abs(tx) < n.box[0] && Math.abs(tz) < n.box[1] && !(work && work.n === n)) { target.x = pp.x; target.z = pp.z; }
}
/* nothing else grows in a belt */
const tallKeep = (a, x, z) => !!a.tall && a.tall.some(([x0, z0, x1, z1]) => x - a.cx > x0 - 0.8 && x - a.cx < x1 + 0.8 && z - a.cz > z0 - 0.8 && z - a.cz < z1 + 0.8);
/* cut down: gone for good, with a puff of straw, and sometimes a coin */
function tallCut(n) {
  tallCuts()[n.cut] = 1; n.dead = 1; n.st = 'gone'; if (work && work.n === n) work = null; xpGain(XP_FOR.tall);
  for (let k = 0; k < 6; k++) smokePuff(n.x + (Math.random() - 0.5) * 0.7, 0.4 + Math.random() * 0.8, n.z + (Math.random() - 0.5) * 0.7, k % 2 ? '#e9d27a' : '#a9cf62');
  if (Math.random() < 0.2) { const m = itemModel('coin'), a = Math.random() * 6.28; m.position.set(n.x, 0.6, n.z); sc.add(m); drops.push({ m, t: 'coin', vx: Math.cos(a) * 1.2, vz: Math.sin(a) * 1.2, vy: 3.2, land: 0, wait: 0.15 }); Snd.play('sparkle', { gain: 0.4 }); }
  save();
}
