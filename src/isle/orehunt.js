/* ---------- the Stone Isle's craft: the ore hunt (Leon 2026-11-28: each island gets a new fun way of gathering, played a
   lot on its own island and now and then later, so the time there is play and not grinding) ----------
   Iron is the Stone Isle's own material: its later parts and the lighthouse ask for it. Every Stone square Pip owns hides
   one ore vein a day under the ground. On a square with a hidden vein, a glow ring circles Pip's feet: blue and slow far
   away, orange, fast and ticking close by (warmer, colder: no reading). Right on top, the ground cracks and the vein pushes
   up. Pip breaks it for three iron.
   Saved: state.isle.ore = { day, done: { area id: 1 } }. A vein that has come up is not saved: it is there until Pip
   breaks it or leaves the game. */
const OH = { ring: null, tick: 0, vein: {} };
const ORE_ISLE = (A) => A && !A.secret && A.id[0] === 's' && A.id[1] !== 'k';
const oreS = () => state.isle.ore || (state.isle.ore = { day: -1, done: {} });
const oreOffMesa = (A, x, z) => !(A.mesas || []).some((m) => Math.abs(x - A.cx - m.dx) < m.w / 2 + 0.8 && Math.abs(z - A.cz - m.dz) < m.d / 2 + 0.8) && !(A.lift && Math.hypot(x - A.cx - A.lift[0], z - A.cz - A.lift[1]) < 2.4); /* and clear of the lift */
/* where today's vein lies in a square: open ground, off roads and mesas, away from what stands there, the same all day */
function oreSpot(A) {
  const day = Math.floor(state.clock / DAY);
  for (let k = 0; k < 60; k++) {
    const x = A.cx + (hash(k + day * 5, 7800 + A.i * 13 + A.j) - 0.5) * 8.6, z = A.cz + (hash(k + day * 7, 7801 + A.i * 7 - A.j) - 0.5) * 8.6;
    if (areaAt(x, z) !== A || walkSdf(x, z) > -1.1 || campNear(x, z, 1.5) || !oreOffMesa(A, x, z)) continue;
    if (nodes.some((n) => n.st !== 'gone' && Math.hypot(n.x - x, n.z - z) < 1.5)) continue;
    return [x, z];
  }
  return null;
}
/* the glow ring at Pip's feet */
function oreRing() {
  const m = new T.Mesh(new T.RingGeometry(0.55, 0.72, 32), new T.MeshBasicMaterial({ color: '#7fc8ff', transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = 3; sc.add(m); return m;
}
const ORE_COLD = new T.Color('#7fc8ff'), ORE_HOT = new T.Color('#ff8a2a');
function oreStep(dt) {
  if (!state.isle || inCave) return; const S = oreS(), day = Math.floor(state.clock / DAY), pp = pip.position;
  if (S.day !== day) { S.day = day; S.done = {}; OH.spot = {}; }
  OH.spot = OH.spot || {};
  if (!OH.ring) OH.ring = oreRing();
  const A = areaAt(pp.x, pp.z), R = OH.ring;
  let warm = -1;
  if (ORE_ISLE(A) && HAS[A.id] && !S.done[A.id] && !enSleep && !rising) {
    if (OH.spot[A.id] === undefined) OH.spot[A.id] = oreSpot(A);
    const at = OH.spot[A.id];
    if (at) {
      const d = Math.hypot(pp.x - at[0], pp.z - at[1]); warm = Math.max(0, Math.min(1, 1 - (d - 0.9) / 7));
      if (d < 0.9) { /* found: the ground cracks and the vein comes up */
        S.done[A.id] = 1; save();
        const n = makeNode('iron', at[0], at[1], 7900 + day % 97); n.vein = 1; n.pop = 0.001; n.g.scale.setScalar(0.01);
        Snd.play('secret', { gain: 0.4 }); Snd.play('impact', { gain: 0.3 }); burst(at[0], 0.5, at[1], 12); warm = -1;
      }
    }
  }
  /* the ring: blue and slow when cold, orange and quick when warm, with a tick that speeds up */
  const on = warm >= 0; R.material.opacity += ((on ? 0.75 : 0) - R.material.opacity) * Math.min(1, dt * 5); R.visible = R.material.opacity > 0.02;
  if (!R.visible) return;
  R.position.set(pp.x, 0.06 + (pp.y || 0), pp.z);
  if (on) {
    R.material.color.copy(ORE_COLD).lerp(ORE_HOT, warm);
    const rate = 0.9 + warm * 5; OH.ph = ((OH.ph || 0) + dt * rate) % 1; R.scale.setScalar(0.9 + OH.ph * 0.9 * (1 - warm * 0.4));
    R.material.opacity = 0.75 * (1 - OH.ph * 0.7);
    if ((OH.tick += dt) > 1 / rate) { OH.tick = 0; Snd.play('tick', { gain: 0.12 + warm * 0.2, f: 500 + warm * 900 }); }
  }
}
ISLE_STEPS.push(oreStep);
