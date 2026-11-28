/* ---------- shared pieces for the hidden worlds (Leon, 2026-11-28: every island keeps a sealed place that opens into "a
   unique, wonderful section, a bit bespoke", with "joy, exploration, and awe") ----------
   Each hidden world lives in its own file and plugs in through the lists in rules.js, so no file needs a line in another:
     ISLE_STEPS.push((dt) => ...)            runs every frame, after everything else (rides may place Pip)
     ISLE_KEEPS.push((a, x, z) => bool)      true keeps random trees, rocks and decor off a spot
     ISLE_GATE.<name> = (n) => ...           a node made with n.gate = '<name>' calls this when it breaks
     ISLE_KEYS.push({ id, ok, x, z, cost, open })   a sign that stands at x, z while ok() is true; paying it calls open()
     SECRET_FILL.<area id> = (A, fresh) => ...       builds an area that has secret: 1 in AREAS (nothing random is put there)
   An area with secret: 1 has no sign and is not on the map until secretOpen('<id>') makes it rise from the sea.
   ringMake({ x, z, icon, ok, go })  a rope ring with a picture over it: standing still on it for a moment calls go()
   rideGo({ pts, speed, mesh, seat, snd, onEnd })  carries Pip along a path (a bee line, a kite, a heron, a cart)
   foundIt(picture) and goldGive(id) (gold.js) are the two "found it!" moments. */
const SC = { rings: [], ride: null };
function secretOpen(id) { const A = AREAS.find((a) => a.id === id); if (!A || HAS[A.id] || rising) return false; Snd.play('secret', { gain: 0.65 }); areaRise(A); isleSigns(); save(); return true; }
function ringMake(o) {
  const r = { o, w: 0, armed: false, ph: SC.rings.length * 1.7 }, y = o.y || 0;
  r.ring = ropeRing(0.5, 0.62); r.ring.position.set(o.x, y + 0.035, o.z); sc.add(r.ring);
  const q = new T.CircleGeometry(0.5, 24); q.rotateX(-Math.PI / 2); r.fill = new T.Mesh(q, new T.MeshBasicMaterial({ color: '#ffe9a6', transparent: true, opacity: 0.75, depthWrite: false })); r.fill.position.set(o.x, y + 0.045, o.z); r.fill.scale.setScalar(0.001); sc.add(r.fill);
  r.sp = isleSprite(isleBubble(o.icon || 'star'), 0.85); r.sp.position.set(o.x, y + 1.75, o.z); sc.add(r.sp); SC.rings.push(r); return r;
}
function ringDrop(r) { [r.ring, r.fill, r.sp].forEach((m) => sc.remove(m)); const k = SC.rings.indexOf(r); if (k >= 0) SC.rings.splice(k, 1); }
/* the path is walked at an even pace; between points the height and place are eased, so a few points make a soft curve */
function rideGo(o) {
  if (SC.ride) return false; const P = o.pts.map((p) => new T.Vector3(p[0], p[1], p[2])), L = [0]; for (let k = 1; k < P.length; k++) L.push(L[k - 1] + P[k].distanceTo(P[k - 1]));
  SC.ride = { o, P, L, d: 0, v: 0, len: L[L.length - 1] }; if (o.mesh) sc.add(o.mesh); if (o.snd) Snd.play(o.snd, { gain: 0.4 }); return true;
}
const riding2 = () => !!SC.ride;
function secretStep(dt) {
  const pp = pip.position, R = SC.ride;
  SC.rings.forEach((r) => { const o = r.o, show = !o.ok || o.ok(); r.ring.visible = r.fill.visible = r.sp.visible = !!show && inCave === !!o.cave; if (!r.ring.visible) { r.w = 0; return; }
    r.sp.position.y = (o.y || 0) + 1.75 + (reduced ? 0 : Math.sin(time * 2 + r.ph) * 0.05); const d = Math.hypot(pp.x - o.x, pp.z - o.z); if (d > 1.0) r.armed = true;
    const on = d < 0.45 && r.armed && !R && !enSleep && !rising && Math.abs(pp.y - (o.y || 0)) < 0.6 && Math.hypot(target.x - pp.x, target.z - pp.z) < 0.15;
    r.w = on ? Math.min(1, r.w + dt / 0.9) : Math.max(0, r.w - dt * 3); r.fill.scale.setScalar(Math.max(0.001, r.w));
    if (r.w >= 1) { r.w = 0; r.armed = false; o.go(r); } });
  if (!R) return; const o = R.o; R.v = Math.min(o.speed || 5, R.v + dt * (o.speed || 5) * 1.2); R.d = Math.min(R.len, R.d + R.v * dt * (R.len - R.d < 1.2 ? Math.max(0.25, (R.len - R.d) / 1.2) : 1));
  let k = 1; while (k < R.L.length - 1 && R.L[k] < R.d) k++; const f = (R.d - R.L[k - 1]) / Math.max(0.001, R.L[k] - R.L[k - 1]), a = R.P[k - 1], b = R.P[k];
  const y = a.y + (b.y - a.y) * (f * f * (3 - 2 * f)); pp.set(a.x + (b.x - a.x) * f, y + (o.seat || 0), a.z + (b.z - a.z) * f); target.copy(pp); work = null;
  if (b.x !== a.x || b.z !== a.z) pip.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
  if (o.mesh) { o.mesh.position.set(pp.x, y, pp.z); o.mesh.rotation.y = pip.rotation.y; } if (o.each) o.each(R, dt);
  if (R.d >= R.len - 0.01) { SC.ride = null; if (o.mesh && !o.keep) sc.remove(o.mesh); pp.y = o.endY != null ? o.endY : b.y; target.copy(pp); if (o.onEnd) o.onEnd(); }
}
ISLE_STEPS.push(secretStep);
