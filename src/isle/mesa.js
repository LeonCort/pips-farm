/* ---------- rock tables and ladders (Leon, 2026-11-25: each island should differ in how Pip gets about) ----------
   The stone island's way of moving is up: flat-topped rock tables stand on it, some with a second table on top, and a
   ladder leans on the south face of each. Pip climbs by walking into the ladder, and comes down the same way. The iron
   veins are on the tables, so iron is something Pip climbs for. From the ground a table is a wall; on top, its rim keeps
   Pip in. Tables are set per area (rules.js: mesas, as { id, dx, dz, w, d, h, par, finds }; par = the table it stands on). */
const MS = { list: [], on: null, climb: null, cool: 0, want: null };
const mesaTop = (m) => m.y0 + m.h;
const mesaIn = (m, x, z, pad) => Math.abs(x - m.x) < m.w / 2 + pad && Math.abs(z - m.z) < m.d / 2 + pad;
function mesaModel(m, fresh) {
  const g = new T.Group(); g.position.set(m.x, m.y0, m.z); sc.add(g); const L = [], sd = m.sd || (m.sd = 3400 + MS.list.length * 40); let q;
  /* the table: a block with a rough rim, banded sides and a pale flat top */
  q = new T.BoxGeometry(m.w, m.h, m.d, Math.max(2, Math.round(m.w / 0.9)), 2, Math.max(2, Math.round(m.d / 0.9))); q.translate(0, m.h / 2, 0);
  { const P = q.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i), k = hash(Math.round(x * 7) + Math.round(z * 13) * 31, sd + Math.round(y * 5)); if (y < m.h - 0.01) { const out = 0.1 + k * 0.16 * (y < 0.01 ? 1.6 : 1); if (Math.abs(Math.abs(x) - m.w / 2) < 0.01) P.setX(i, x + Math.sign(x) * out); if (Math.abs(Math.abs(z) - m.d / 2) < 0.01) P.setZ(i, z + Math.sign(z) * out); } } }
  L.push(fac(q, (cx, cy, cz, i) => (cy > m.h - 0.02 ? tone(hash(i, sd) > 0.75 ? '#a3ad92' : '#aeab9b', i, 0.4) : shadeY(Math.floor(cy / 0.32 + hash(i, 3) * 0.6) % 2 ? '#b9b2a2' : '#cfc8b8', cy, -0.4, m.h, i, 0.4)), sd));
  /* on top: a pale rim of slabs, pebbles and patches of moss, so it is not a bare lid */
  for (let k = 0; k < 14; k++) { const ex = k % 2, t = (hash(k, sd + 30) - 0.5), px = ex ? Math.sign(hash(k, sd + 31) - 0.5) * (m.w / 2 - 0.14) : t * m.w * 0.94, pz = ex ? t * m.d * 0.94 : Math.sign(hash(k, sd + 32) - 0.5) * (m.d / 2 - 0.14);
    if (pz > 0 && Math.abs(px - m.lx) < 0.6) continue; q = ico(0.2 + hash(k, sd + 33) * 0.14, 0, sd + 34 + k); q.scale(1.3, 0.35, 1.1); q.translate(px, m.h + 0.03, pz); L.push(fac(q, (cx, cy, cz, i) => tone('#c9c3b2', i + k, 0.4), sd + 34 + k)); }
  for (let k = 0; k < 7; k++) { const px = (hash(k, sd + 50) - 0.5) * (m.w - 0.9), pz = (hash(k, sd + 51) - 0.5) * (m.d - 0.9); q = new T.CylinderGeometry(0.3 + hash(k, sd + 52) * 0.3, 0.34 + hash(k, sd + 52) * 0.3, 0.025, 7); q.translate(px, m.h + 0.012, pz); L.push(fac(q, (cx, cy, cz, i) => tone(k % 3 ? '#93a67c' : '#a09c8c', i, 0.3), sd + 53 + k)); }
  for (let k = 0; k < 9; k++) { const a = hash(k, sd + 1) * 6.28, ex = Math.abs(Math.cos(a)) > Math.abs(Math.sin(a)), px = ex ? Math.sign(Math.cos(a)) * (m.w / 2 + 0.25) : (hash(k, sd + 2) - 0.5) * m.w, pz = ex ? (hash(k, sd + 3) - 0.5) * m.d : Math.sign(Math.sin(a)) * (m.d / 2 + 0.25);
    if (!ex && pz > 0 && Math.abs(px - m.lx) < 0.9) continue; /* not at the ladder's foot */
    q = ico(0.22 + hash(k, sd + 4) * 0.2, 0, sd + 5 + k); q.scale(1.2, 0.7, 1); q.translate(px, 0.1, pz); L.push(fac(q, (cx, cy, cz, i) => tone('#8a8478', i + k, 0.5), sd + 5 + k)); }
  /* the ladder on the south face */
  const lz = m.d / 2 + 0.34, top = m.h + 0.35, len = Math.hypot(top, 0.32);
  if (m.locked) { /* a sealed table (the High Table): only the top of its ladder still hangs there, the rest lies broken at the foot */
    [-0.26, 0.26].forEach((s, k) => { q = new T.BoxGeometry(0.075, 0.7, 0.075); q.translate(m.lx + s, top - 0.3, lz - 0.3); L.push(fac(q, (cx, cy, cz, i) => tone('#8a6a4c', i, 0.3), sd + 20 + k)); });
    [top - 0.5, top - 0.2].forEach((y, k) => { q = new T.BoxGeometry(0.6, 0.06, 0.07); q.rotateZ(k ? 0 : 0.25); q.translate(m.lx, y, lz - 0.3); L.push(fac(q, (cx, cy, cz, i) => tone('#a88660', i, 0.3), sd + 24 + k)); });
    [[0.5, 0.5, 0.4], [-0.45, 0.75, -0.9], [0.1, 1.0, 1.9]].forEach(([dx, dz, r], k) => { q = new T.BoxGeometry(0.075, 0.075, 0.9 - k * 0.2); q.rotateY(r); q.translate(m.lx + dx, 0.05, lz + dz); L.push(fac(q, (cx, cy, cz, i) => tone('#8a6a4c', i, 0.3), sd + 27 + k)); });
  } else {
  [-0.26, 0.26].forEach((s, k) => { q = new T.BoxGeometry(0.075, len, 0.075); q.rotateX(Math.atan2(0.32, top)); q.translate(m.lx + s, top / 2, lz - 0.16); L.push(fac(q, (cx, cy, cz, i) => tone(m.seal ? '#e0bf86' : '#a8774f', i, 0.3), sd + 20 + k)); });
  for (let y = 0.28; y < m.h + 0.1; y += 0.3) { q = new T.BoxGeometry(0.6, 0.06, 0.07); q.translate(m.lx, y, lz - 0.32 * (y / top)); L.push(fac(q, (cx, cy, cz, i) => tone('#c0935f', i, 0.3), sd + 24)); } }
  const mesh = merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g); if (mesh && mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true; }
  if (!m.par) lookFoot(m.x, m.z, m.w / 2 + 0.5, m.d / 2 + 0.5);
  if (fresh) { g.scale.setScalar(0.01); m.pop = 0.001; } m.g = g;
}
function mesaFill(A, fresh) {
  (A.mesas || []).forEach((D) => { const par = D.par ? MS.list.find((q) => q.id === D.par) : null;
    const m = { id: D.id, A, x: A.cx + D.dx, z: A.cz + D.dz, w: D.w, d: D.d, h: D.h, y0: par ? mesaTop(par) : 0, par, lx: D.lx || 0, pop: 0, seal: D.seal || null, locked: !!D.seal && !sealS()[D.id] }; mesaModel(m, fresh); MS.list.push(m);
    if (D.chest && !state.isle.chests[D.id]) { const c = makeChest(m.x + D.chest[1], m.z + D.chest[2], D.chest[0], D.id); c.mesa = m; c.g.position.y = mesaTop(m); c.ring.position.y = mesaTop(m) + 0.035; }
    (D.finds || []).forEach(([k, ox, oz], q) => { const n = makeNode(k, m.x + ox, m.z + oz, AREAS.indexOf(A) * 997 + 1500 + MS.list.length * 10 + q); n.mesa = m; n.g.position.y = mesaTop(m); if (fresh) { n.pop = 0.001; n.g.scale.setScalar(0.01); } }); });
}
const mesaKeep = (a, x, z) => !!a.mesas && a.mesas.some((D) => !D.par && Math.abs(x - a.cx - D.dx) < D.w / 2 + 1.1 && z - a.cz - D.dz > -D.d / 2 - 1.1 && z - a.cz - D.dz < D.d / 2 + 2.0);
const mesaLevel = (n) => (n.mesa || null) === MS.on; /* only things on Pip's own level can be worked or bumped into */
/* push a point out of a box the short way */
function mesaOut(m, p, pad) {
  const dx = p.x - m.x, dz = p.z - m.z, ox = m.w / 2 + pad - Math.abs(dx), oz = m.d / 2 + pad - Math.abs(dz); if (ox <= 0 || oz <= 0) return false;
  if (ox < oz) p.x = m.x + (dx < 0 ? -1 : 1) * (m.w / 2 + pad); else p.z = m.z + (dz < 0 ? -1 : 1) * (m.d / 2 + pad); return true;
}
/* sealed tables: state.isle.seals[id] = 1 once the rope ladder is paid for at the sign by its foot (isle.js signWants) */
function sealS() { return state.isle.seals || (state.isle.seals = {}); }
function sealWants(want) { MS.list.forEach((m) => { if (m.locked && HAS[m.A.id] && !m.pop) want.set('k:' + m.id, { kind: 'seal', m }); }); }
function sealOpen(m) {
  sealS()[m.id] = 1; m.locked = false; sc.remove(m.g); mesaModel(m, false); burst(m.x + m.lx, 1.2, m.z + m.d / 2 + 0.5, 16);
  Snd.play('secret', { gain: 0.6 }, 0.1); xpGain(25); isleSigns(); save();
}
function mesaStep(dt) {
  if (!MS.list.length) return; const pp = pip.position;
  MS.list.forEach((m) => { if (m.pop) { m.pop = Math.min(1, m.pop + dt * 1.5); m.g.scale.setScalar(m.pop); if (m.pop >= 1) m.pop = 0; } });
  MS.cool = Math.max(0, MS.cool - dt);
  if (MS.climb) { /* on the ladder: up or down in a little under a second */
    const C = MS.climb, m = C.m; C.t = Math.min(1, C.t + dt / 0.8); const u = C.up ? C.t : 1 - C.t, e = u * u * (3 - 2 * u);
    pp.set(m.x + m.lx, m.y0 + m.h * e, m.z + m.d / 2 + 0.55 - e * 1.05); pip.rotation.y = Math.PI; target.copy(pp); target.y = 0;
    if (Math.floor(C.t * 5) !== C.k) { C.k = Math.floor(C.t * 5); Snd.play('tock', { gain: 0.25, f: 420 + C.k * 30 }); }
    if (C.t >= 1) { MS.on = C.up ? m : m.par; MS.climb = null; MS.cool = 0.5; pp.y = MS.on ? mesaTop(MS.on) : 0; if (MS.want) { target.set(MS.want[0], 0, MS.want[1]); MS.want = null; } }
    return;
  }
  /* carried off (sleep, a travel mat, the lift): back on the ground */
  if (MS.on && !mesaIn(MS.on, pp.x, pp.z, 1.2)) { MS.on = null; pp.y = 0; }
  const on = MS.on, tx = target.x - pp.x, tz = target.z - pp.z, going = Math.hypot(tx, tz) > 0.12, ok = !MS.cool && !enSleep && !rising && going;
  /* the ladders of this level: walk into the foot to go up, walk off the top at the ladder to go down */
  for (const m of MS.list) { if (m.pop || m.locked) continue; const fx = m.x + m.lx, fz = m.z + m.d / 2;
    if (m.par === on && ok && tz < -0.05 && Math.abs(pp.x - fx) < 0.42 && pp.z - fz > 0 && pp.z - fz < 0.62) { MS.climb = { m, t: 0, up: true, k: -1 }; work = null; return; }
    if (m === on && ok && tz > 0.05 && Math.abs(pp.x - fx) < 0.42 && fz - pp.z < 0.5) { MS.climb = { m, t: 0, up: false, k: -1 }; work = null; return; } }
  /* a tap on a table from below walks to its ladder first, then on to the spot; a tap off the table from on top, to the ladder down */
  if (state.ctrl === 'tap' && going) { const up = MS.list.find((m) => m.par === on && mesaIn(m, target.x, target.z, 0));
    if (up) { MS.want = [clamp(target.x, up.x - up.w / 2 + 0.5, up.x + up.w / 2 - 0.5), clamp(target.z, up.z - up.d / 2 + 0.5, up.z + up.d / 2 - 0.5)]; target.set(up.x + up.lx, 0, up.z + up.d / 2 + 0.3); }
    else if (on && !mesaIn(on, target.x, target.z, 0)) { MS.want = [target.x, target.z]; target.set(on.x + on.lx, 0, on.z + on.d / 2 - 0.2); } }
  /* walls: the tables standing on this level; and the rim of the one Pip is on */
  MS.list.forEach((m) => { if (m.par !== on || m.pop) return; mesaOut(m, pp, 0.3); if (state.ctrl !== 'tap') mesaOut(m, target, 0.05); });
  if (on) { const hx = on.w / 2 - 0.32, hz = on.d / 2 - 0.32; pp.x = clamp(pp.x, on.x - hx, on.x + hx); pp.z = clamp(pp.z, on.z - hz, on.z + hz); target.x = clamp(target.x, on.x - hx - 0.4, on.x + hx + 0.4); target.z = clamp(target.z, on.z - hz - 0.4, on.z + hz + 0.4); pp.y = mesaTop(on); }
  else if (pp.y !== 0 && !inCave) pp.y = 0;
}
