/* ---------- the Coral Isle's craft: shells in the waves (Leon 2026-11-28: each island gets a new fun way of gathering,
   played a lot on its own island and now and then later, so the time there is play and not grinding) ----------
   Pearls are the Coral Isle's own material. On every Coral square Pip owns, the waves wash glittering shells up on the
   sand near the water. Each set of three stays only a short while, then the next wave takes them back with a splash and
   brings new ones somewhere else (never a fail, the waves keep coming). Five shells over Pip's head make a string: it
   shines and turns into two pearls. Each square gives one string a day.
   Saved: state.isle.shells = { day, done: { area id: 1 } }. Shells on the sand and a half-made string are not saved. */
const SW = { shells: [], beads: null, n: 0, wave: 0, area: null, geo: null };
const SHELL_ISLE = (A) => A && !A.secret && A.id[0] === 'c';
const shellS = () => state.isle.shells || (state.isle.shells = { day: -1, done: {} });
const SHELL_STAY = 6.5, SHELL_GAP = 1.6, SHELL_NEED = 5;
/* a sand spot by the water on this square, off roads and away from what stands there */
function shellSpot(A, k0) {
  for (let k = 0; k < 80; k++) {
    const x = A.cx + (hash(k0 + k, 8200 + A.i * 13 + A.j) - 0.5) * 9.4, z = A.cz + (hash(k0 + k, 8201 + A.i * 7 - A.j) - 0.5) * 9.4, w = walkSdf(x, z);
    if (areaAt(x, z) !== A || w > -0.35 || w < -1.6 || campNear(x, z, 1.2)) continue;
    if (nodes.some((n) => n.st !== 'gone' && Math.hypot(n.x - x, n.z - z) < 1.0) || SW.shells.some((s) => Math.hypot(s.x - x, s.z - z) < 1.2)) continue;
    return [x, z];
  }
  return null;
}
function shellMake(x, z, k) {
  if (!SW.geo) { const q = new T.SphereGeometry(0.25, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2); q.scale(1, 0.6, 1.1); SW.geo = q; }
  const col = ['#ffd2dc', '#fff1c9', '#cfe8ff'][k % 3], g = new T.Group();
  const m = new T.Mesh(SW.geo, new T.MeshStandardMaterial({ color: col, roughness: 0.35, metalness: 0.1, emissive: col, emissiveIntensity: 0.35 })); m.castShadow = true; g.add(m);
  for (let r = 0; r < 5; r++) { const s = new T.Mesh(new T.BoxGeometry(0.018, 0.05, 0.46), new T.MeshBasicMaterial({ color: '#c99a8a' })); s.rotation.y = (r - 2) * 0.32; s.position.y = 0.08; g.add(s); } /* the ribs */
  g.position.set(x, 0.04, z); g.rotation.y = hash(k, 8210) * 6.28; g.scale.setScalar(0.01); sc.add(g);
  return { g, x, z, t: 0, got: 0 };
}
/* the string over Pip's head: five beads, lit one by one */
function shellBeads() {
  const g = new T.Group(), L = [];
  for (let k = 0; k < SHELL_NEED; k++) { const a = (k / (SHELL_NEED - 1) - 0.5) * 2.2, b = new T.Mesh(new T.SphereGeometry(0.075, 10, 8), new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.25, transparent: true, opacity: 0.3, emissive: '#fff4e0', emissiveIntensity: 0 }));
    b.position.set(Math.sin(a) * 0.42, Math.cos(a) * 0.2, 0); g.add(b); L.push(b); }
  g.userData.b = L; g.visible = false; sc.add(g); return g;
}
function shellClear(splash) { SW.shells.forEach((s) => { if (splash && !s.got) burst(s.x, 0.2, s.z, 3); sc.remove(s.g); }); SW.shells = []; }
function shellStep(dt) {
  if (!state.isle || inCave) return; const S = shellS(), day = Math.floor(state.clock / DAY), pp = pip.position;
  if (S.day !== day) { S.day = day; S.done = {}; }
  if (!SW.beads) SW.beads = shellBeads();
  const A = areaAt(pp.x, pp.z), here = SHELL_ISLE(A) && HAS[A.id] && !S.done[A.id] && !enSleep && !rising ? A : null;
  if (here !== SW.area) { shellClear(false); SW.area = here; SW.n = 0; SW.wave = 0.8; }
  const B = SW.beads; B.visible = !!here && SW.n > 0; B.position.set(pp.x, 2.05 + (pp.y || 0), pp.z); B.quaternion.copy(cam.quaternion);
  B.userData.b.forEach((b, k) => { const on = k < SW.n; b.material.opacity = on ? 1 : 0.3; b.material.emissiveIntensity = on ? 0.6 + Math.sin(time * 6 + k) * 0.2 : 0; });
  if (!here) return;
  /* the waves: a set of shells, then a splash, then the next set somewhere else */
  if (!SW.shells.length) { SW.wave -= dt; if (SW.wave <= 0) {
    for (let k = 0; k < 3; k++) { const at = shellSpot(here, Math.floor(time * 7) + k * 31); if (at) SW.shells.push(shellMake(at[0], at[1], k)); }
    if (SW.shells.length) { Snd.play('whoosh', { gain: 0.22 }); SW.shells.forEach((s) => burst(s.x, 0.15, s.z, 3)); } SW.wave = SHELL_GAP; } return; }
  let left = 0;
  SW.shells.forEach((s) => { s.t += dt; if (s.got) return; left++;
    const grow = Math.min(1, s.t / 0.35), sink = s.t > SHELL_STAY - 0.8 ? Math.max(0, (SHELL_STAY - s.t) / 0.8) : 1; s.g.scale.setScalar(Math.max(0.01, grow * sink * (1 + Math.sin(time * 5 + s.x) * 0.06)));
    if (Math.hypot(pp.x - s.x, pp.z - s.z) < 0.7) { s.got = 1; sc.remove(s.g); SW.n++; Snd.play('ding', { gain: 0.3, f: ['C6', 'D6', 'E6', 'G6', 'A6'][Math.min(4, SW.n - 1)] }); burst(s.x, 0.4, s.z, 4); }
  });
  if (SW.n >= SHELL_NEED) { /* a full string: it shines and turns into two pearls */
    S.done[here.id] = 1; state.isle.store.pearl = (state.isle.store.pearl || 0) + 2; invDirty = true; xpGain(XP_FOR.clam || 1); bldBadge(); save();
    const sp = new T.Sprite(new T.SpriteMaterial({ map: hamGiftTex('pearl', 2), transparent: true, depthWrite: false })); sp.scale.set(1.5, 0.75, 1); sp.position.set(pp.x, 2.2, pp.z); sc.add(sp); FD.floats.push({ sp, t: 0, y: 0.7 });
    Snd.play('success', { gain: 0.4 }); burst(pp.x, 2.1, pp.z, 12); shellClear(true); SW.n = 0; SW.area = null; return;
  }
  if (!left || SW.shells[0].t > SHELL_STAY) { if (left) Snd.play('whoosh', { gain: 0.18, f: 300 }); shellClear(true); SW.wave = SHELL_GAP; } /* the wave takes the rest back */
}
ISLE_STEPS.push(shellStep);
