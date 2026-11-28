/* ---------- docks and the island boat (Leon, 2026-11-27: "for each wonder we build a dock ... an island boaty feel
   rather than just teleporting") ----------
   Every finished wonder builds a small dock on its island's shore, with a sailing boat moored at it; the camp gets its
   own dock with the first wonder. Walk out to the rope ring at the end of the planks: it fills, and the pictures of the
   other docks open (the same round pictures as before). Pick one and Pip hops into the boat, it sails off along the
   shore, the screen turns to sea for a moment, and the boat sails in to the other dock, where Pip hops out.
   These replace the travel mats. Where each dock lies is in rules.js (DOCKS: x, z on the shore, out: the way the planks
   run, go: the way the boat sails off). Nothing new is saved: a dock stands wherever its wonder does. */
const DK = { d: {}, trip: null, at: null, fade: null, L: 1.7 };
const dockBusy = () => !!DK.trip;
const dockSeat = (d) => { const r = d.boat.rotation.y; return tmpV.set(d.boat.position.x - Math.cos(r) * 0.25, d.boat.position.y - 0.12, d.boat.position.z + Math.sin(r) * 0.25); };
/* ---------- sailing a lane (Leon, 2026-11-28: "the boat doesn't go into any other objects") ----------
   A boat no longer sails straight off along go and back in from behind its dock (the camp's boat came in through the farm
   boat). Each dock has a lane: points from its mooring out to open water (DOCKS[id].lane, or straight out along go). The
   boat sails out along it, and a boat coming in sails the same lane backwards, so it always comes from open sea. The bow
   turns smoothly toward where it is going. The cargo boats (cargo.js) sail their lane the same way. */
const boatYaw = (dx, dz) => Math.atan2(dz, -dx); /* a boat's rotation.y when its bow points along (dx, dz) */
function laneMake(pts) { const P = pts.map((p) => [p[0], p[1]]), S = [0]; for (let k = 1; k < P.length; k++) S.push(S[k - 1] + Math.hypot(P[k][0] - P[k - 1][0], P[k][1] - P[k - 1][1])); return { P, S, L: S[S.length - 1] }; }
/* the point s along a lane (past either end it runs straight on), and the way the lane runs there */
function laneAt(ln, s, out) {
  const P = ln.P, S = ln.S; let k = 1; while (k < P.length - 1 && S[k] < s) k++;
  const a = P[k - 1], b = P[k], l = S[k] - S[k - 1] || 1, u = (s - S[k - 1]) / l, dx = (b[0] - a[0]) / l, dz = (b[1] - a[1]) / l;
  out.x = a[0] + (b[0] - a[0]) * u; out.z = a[1] + (b[1] - a[1]) * u; out.dx = dx; out.dz = dz; return out;
}
/* turn a boat's bow toward (dx, dz), at most rate radians a second */
function boatTurn(boat, dx, dz, dt, rate) { let d = boatYaw(dx, dz) - boat.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); boat.rotation.y += Math.sign(d) * Math.min(Math.abs(d), rate * dt); }
const LANE_P = { x: 0, z: 0, dx: 0, dz: 0 };
function dockMake(id) {
  if (DK.d[id] || !DOCKS[id]) return; const D = DOCKS[id], [ox, oz] = D.out, [gx, gz] = D.go, L = [], g = new T.Group(); let q;
  g.position.set(D.x, 0, D.z); g.rotation.y = Math.atan2(oz, -ox); sc.add(g); /* in the group the planks run toward -x, like the farm boat's dock */
  for (let k = 0; k < 6; k++) { q = new T.BoxGeometry(0.36, 0.08, 1.15); q.translate(0.3 - k * 0.37, 0.12, 0); L.push(fac(q, () => tone(['#c0935f', '#b08454', '#c99f6c'][k % 3], k, 0.3), 5300 + k)); }
  for (let k = 0; k < 2; k++) [-0.52, 0.52].forEach((dz, j) => { q = new T.CylinderGeometry(0.07, 0.08, 1.3, 7); q.translate(-0.35 - k * 1.1, -0.3, dz); L.push(fac(q, (cx, cy) => shadeY(PAL.trunk, cy, -1, 0.4, k + j, 0.4), 5310 + k * 2 + j)); });
  /* a mooring post with a rope coil at the end, and a sign post with the boat picture on the shore */
  q = new T.CylinderGeometry(0.09, 0.1, 0.5, 8); q.translate(-1.5, 0.4, -0.45); L.push(fac(q, (cx, cy) => shadeY('#8a5f3c', cy, 0.1, 0.7, 3, 0.4), 5320));
  q = new T.TorusGeometry(0.12, 0.035, 5, 10); q.rotateX(Math.PI / 2); q.translate(-1.5, 0.42, -0.45); L.push(fac(q.toNonIndexed(), () => new T.Color('#e6d3a8'), 5321));
  q = new T.CylinderGeometry(0.05, 0.06, 1.25, 6); q.translate(0.75, 0.62, -0.8); L.push(fac(q, (cx, cy) => shadeY('#8a5f3c', cy, 0, 1.3, 2, 0.4), 5322));
  merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g);
  const W = (l, s) => [D.x + ox * l - oz * s, D.z + oz * l + ox * s];
  const sgn = new T.Sprite(new T.SpriteMaterial({ map: isleBubble('travel'), transparent: true })); sgn.scale.set(0.95, 0.95, 1); { const p = W(-0.75, 0.8); sgn.position.set(p[0], 1.75, p[1]); } sc.add(sgn);
  const rp = W(DK.L - 0.6, 0), ring = ropeRing(0.4, 0.54); ring.rotation.x = -Math.PI / 2; ring.position.set(rp[0], 0.175, rp[1]); sc.add(ring);
  const fill = new T.Mesh(new T.CircleGeometry(0.38, 32), new T.MeshBasicMaterial({ color: '#f4b23a', transparent: true, opacity: 0.85 })); fill.rotation.x = -Math.PI / 2; fill.position.set(rp[0], 0.185, rp[1]); fill.scale.setScalar(0.001); sc.add(fill);
  const boat = new T.Group(), mp = W(DK.L + 0.6, 0); propBoat(boat); boat.position.set(mp[0], -0.08, mp[1]); boat.rotation.y = Math.atan2(gz, -gx); sc.add(boat);
  const land = W(-0.9, 0);
  const lane = laneMake([[mp[0], mp[1]]].concat(D.lane || [[mp[0] + gx * 9, mp[1] + gz * 9]]));
  DK.d[id] = { id, D, g, sgn, ring, fill, boat, lane, rx: rp[0], rz: rp[1], mx: mp[0], mz: mp[1], lx: land[0], lz: land[1], go: D.go, w: 0, armed: Math.hypot(pip.position.x - rp[0], pip.position.z - rp[1]) > 1.0, ph: Object.keys(DK.d).length * 1.3 };
  DOCK_ON[id] = 1;
}
/* off to another dock (the travel pictures call this) */
function dockGo(id) {
  const a = DK.d[DK.at], b = DK.d[id]; if (!a || !b || a === b) return;
  DK.trip = { st: 'board', t: 0, from: pip.position.clone(), a, b, v: 0 }; work = null; Snd.play('powerup', { gain: 0.4 });
  if (!DK.fade) { const f = document.createElement('div'); f.setAttribute('aria-hidden', 'true'); f.style.cssText = 'position:fixed;inset:0;background:#2e8f9c;opacity:0;pointer-events:none;transition:opacity .5s ease;z-index:30'; document.body.appendChild(f); DK.fade = f; }
}
function dockStep(dt) {
  const pp = pip.position, T0 = DK.trip;
  Object.keys(DK.d).forEach((k) => { const d = DK.d[k]; d.boat.position.y = -0.08 + (reduced ? 0 : Math.sin(time * 1.6 + d.ph) * 0.04); d.boat.rotation.x = reduced ? 0 : Math.sin(time * 1.2 + d.ph) * 0.03; d.sgn.position.y = 1.75 + (reduced ? 0 : Math.sin(time * 2 + d.ph) * 0.05); d.fill.scale.setScalar(Math.max(0.001, d.w)); });
  if (!T0) {
    Object.keys(DK.d).forEach((k) => { const d = DK.d[k], r = Math.hypot(pp.x - d.rx, pp.z - d.rz); if (r > 1.0) d.armed = true;
      const on = r < 0.45 && d.armed && !enSleep && !inCave && !rising && Math.hypot(target.x - pp.x, target.z - pp.z) < 0.15 && Object.keys(DK.d).length > 1;
      d.w = on ? Math.min(1, d.w + dt / 0.9) : Math.max(0, d.w - dt * 3);
      if (d.w >= 1) { d.w = 0; DK.at = k; if (travelOpen(k)) d.armed = false; } });
    return;
  }
  const a = T0.a, b = T0.b; T0.t += dt; target.copy(pp); work = null;
  const face = (d) => { const r = d.boat.rotation.y; pip.rotation.y = Math.atan2(-Math.cos(r), Math.sin(r)); };
  if (T0.st === 'board') { const q = Math.min(1, T0.t / 0.7); pp.lerpVectors(T0.from, dockSeat(a), q); pp.y += Math.sin(q * Math.PI) * 0.6; face(a); if (q >= 1) { T0.st = 'sail'; T0.t = 0; T0.s = 0; Snd.play('whoosh', { gain: 0.35, f: 300 }); } }
  else if (T0.st === 'sail') { /* out along the lane; a boat that came in bow first turns round as it goes */
    const P = laneAt(a.lane, T0.s, LANE_P), r = a.boat.rotation.y, al = Math.max(0, -Math.cos(r) * P.dx + Math.sin(r) * P.dz);
    T0.v = Math.min(4, T0.v + dt * 2.5 * (0.25 + 0.75 * al)); T0.s += T0.v * dt; laneAt(a.lane, T0.s, LANE_P); a.boat.position.x = LANE_P.x; a.boat.position.z = LANE_P.z; boatTurn(a.boat, LANE_P.dx, LANE_P.dz, dt, 3.2); pp.copy(dockSeat(a)); face(a);
    if (T0.t > 1.0 + (1 - al) * 0.6) DK.fade.style.opacity = '1';
    if (T0.t > 1.75 + (1 - al) * 0.6) { /* out of sight: the boat is back at its dock, and the other dock's boat sails in along its lane with Pip in it */
      a.boat.position.set(a.mx, -0.08, a.mz); a.boat.rotation.y = boatYaw(a.go[0], a.go[1]);
      T0.s = Math.min(b.lane.L, 7.5); laneAt(b.lane, T0.s, LANE_P); b.boat.position.set(LANE_P.x, -0.08, LANE_P.z); b.boat.rotation.y = boatYaw(-LANE_P.dx, -LANE_P.dz); pp.copy(dockSeat(b)); camFocus.set(b.rx, 0, b.rz);
      if (typeof dog !== 'undefined' && dog && dog.g) dog.g.position.set(b.lx, 0, b.lz); Object.keys(DK.d).forEach((k) => { DK.d[k].armed = false; });
      T0.st = 'arrive'; T0.t = 0; } }
  else if (T0.st === 'arrive') { if (T0.t > 0.25) DK.fade.style.opacity = '0';
    const r = T0.s, st = Math.min(r, Math.max(1.6, Math.min(4.5, r * 1.6)) * dt); T0.s -= st; laneAt(b.lane, T0.s, LANE_P); b.boat.position.x = LANE_P.x; b.boat.position.z = LANE_P.z; boatTurn(b.boat, -LANE_P.dx, -LANE_P.dz, dt, 3.2); pp.copy(dockSeat(b)); face(b);
    if (r - st < 0.01) { T0.st = 'land'; T0.t = 0; T0.from = pp.clone(); } }
  else if (T0.st === 'land') { const q = Math.min(1, T0.t / 0.7); pp.lerpVectors(T0.from, tmpV.set(b.rx, 0.16, b.rz), q); pp.y += Math.sin(q * Math.PI) * 0.6;
    if (q >= 1) { target.copy(pp); DK.trip = null; Snd.play('pop', { gain: 0.4, f: 520 }); Snd.play('sparkle', { gain: 0.3 }); } }
}
