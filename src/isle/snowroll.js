/* ---------- the Winter Isle's craft: the big snowball (Leon 2026-11-28: each island gets a new fun way of gathering,
   played a lot on its own island and now and then later, so the time there is play and not grinding) ----------
   Crystals are what the Winter Isle gives. On every Winter square Pip owns, crystals sit frozen inside a block of ice, and
   a little snowball lies somewhere else on the square. Pip walks into the ball to push it; it rolls ahead and grows
   bigger the further it rolls over the snow. Rolled into the ice when it is big enough, it smashes the block and the
   crystals tumble out (four). Too small, it just bumps off and the ice wobbles (never a fail: roll some more).
   Saved: state.isle.snow = { day, done: { area id: 1 } }. The ball's size and place are not saved. */
const SR = { sq: {} };
const SNOW_ISLE = (A) => A && !A.secret && A.id[0] === 'w';
const snowS = () => state.isle.snow || (state.isle.snow = { day: -1, done: {} });
const SNOW_R0 = 0.22, SNOW_BIG = 0.62, SNOW_GROW = 0.035; /* radius at start, radius that breaks the ice, growth per metre */
function snowFree(A, x, z, r) {
  if (areaAt(x, z) !== A || walkSdf(x, z) > -1.4 || campNear(x, z, 1.6)) return false;
  return !nodes.some((n) => n.st !== 'gone' && Math.hypot(n.x - x, n.z - z) < r + (n.kind === 'tree' ? 0.8 : 0));
}
function snowPick(A, salt, far) {
  for (let k = 0; k < 80; k++) { const x = A.cx + (hash(k, 8300 + salt + A.i * 13 + A.j) - 0.5) * 8.4, z = A.cz + (hash(k, 8301 + salt + A.i * 7 - A.j) - 0.5) * 8.4;
    if (snowFree(A, x, z, 1.3) && (!far || Math.hypot(x - far[0], z - far[1]) > 5)) return [x, z]; }
  return null;
}
/* the ice block: a clear blue box with crystals inside */
function snowIce(x, z) {
  const g = new T.Group(); g.position.set(x, 0, z); sc.add(g);
  const ice = new T.Mesh(new T.BoxGeometry(1.1, 0.95, 1.1), new T.MeshStandardMaterial({ color: '#bfe6ff', roughness: 0.15, metalness: 0.05, transparent: true, opacity: 0.55 }));
  ice.position.y = 0.48; ice.rotation.y = 0.3; g.add(ice);
  const L = []; for (let k = 0; k < 4; k++) { const q = new T.OctahedronGeometry(0.16 + hash(k, 8310) * 0.06, 0); q.scale(0.7, 1.6, 0.7); q.rotateZ((hash(k, 8311) - 0.5) * 0.6); q.translate((hash(k, 8312) - 0.5) * 0.5, 0.36, (hash(k, 8313) - 0.5) * 0.5); L.push(fac(q, () => new T.Color('#8fd8ff'), 8314 + k)); }
  merged(L, crystalMat, g); lookFoot(x, z, 0.7, 0.7);
  return { g, ice, x, z, wob: 0 };
}
function snowBall(x, z) {
  const m = new T.Mesh(new T.SphereGeometry(1, 16, 12), new T.MeshStandardMaterial({ color: '#f7fbff', roughness: 0.9 })); m.castShadow = true; m.receiveShadow = true; sc.add(m);
  return { m, x, z, r: SNOW_R0, vx: 0, vz: 0, spin: new T.Quaternion() };
}
function snowMake(A) {
  const ia = snowPick(A, 0, null); if (!ia) return null; const ba = snowPick(A, 50, ia); if (!ba) return null;
  return { id: A.id, I: snowIce(ia[0], ia[1]), B: snowBall(ba[0], ba[1]), home: ba };
}
const SNOW_AX = new T.Vector3(), SNOW_Q = new T.Quaternion();
function snowStep(dt) {
  if (!state.isle || inCave) return; const S = snowS(), day = Math.floor(state.clock / DAY), pp = pip.position;
  if (S.day !== day) { S.day = day; S.done = {}; }
  AREAS.forEach((A) => { if (SNOW_ISLE(A) && HAS[A.id] && SR.sq[A.id] === undefined) SR.sq[A.id] = snowMake(A); });
  Object.values(SR.sq).forEach((Q) => { if (!Q) return; const I = Q.I, B = Q.B, done = !!S.done[Q.id];
    I.g.visible = !done; B.m.visible = !done; if (done) { if (!Q.wasDone) { Q.wasDone = 1; } return; }
    if (Q.wasDone) { Q.wasDone = 0; B.x = Q.home[0]; B.z = Q.home[1]; B.r = SNOW_R0; B.vx = B.vz = 0; } /* a new day: a new little ball and a fresh block */
    /* Pip pushes: walking into the ball sends it rolling ahead */
    const dx = B.x - pp.x, dz = B.z - pp.z, d = Math.hypot(dx, dz), reach = B.r + 0.35;
    if (d < reach && d > 1e-3 && !enSleep) { const push = Math.min(1, (reach - d) / 0.35); B.vx += dx / d * push * 14 * dt; B.vz += dz / d * push * 14 * dt; }
    const sp = Math.hypot(B.vx, B.vz); if (sp > 3.2) { B.vx *= 3.2 / sp; B.vz *= 3.2 / sp; }
    let nx = B.x + B.vx * dt, nz = B.z + B.vz * dt;
    if (walkSdf(nx, nz) > -B.r * 0.6 || !HAS[(areaAt(nx, nz) || {}).id]) { B.vx *= -0.3; B.vz *= -0.3; nx = B.x; nz = B.z; } /* the ball stops at the shore and at land not owned */
    const moved = Math.hypot(nx - B.x, nz - B.z); B.x = nx; B.z = nz; B.vx *= Math.max(0, 1 - dt * 2.4); B.vz *= Math.max(0, 1 - dt * 2.4);
    if (moved > 0) { B.r = Math.min(0.9, B.r + moved * SNOW_GROW); SNOW_AX.set(B.vz, 0, -B.vx).normalize(); SNOW_Q.setFromAxisAngle(SNOW_AX, moved / B.r); B.m.quaternion.premultiply(SNOW_Q);
      if ((Q.crunch = (Q.crunch || 0) + moved) > 0.9) { Q.crunch = 0; Snd.play('swish', { gain: 0.12, f: 380 }); } }
    B.m.position.set(B.x, B.r, B.z); B.m.scale.setScalar(B.r);
    /* into the ice */
    I.wob = Math.max(0, I.wob - dt * 2.5); I.ice.rotation.z = Math.sin(I.wob * 30) * 0.06 * I.wob;
    const ix = B.x - I.x, iz = B.z - I.z, id = Math.hypot(ix, iz);
    if (id < B.r + 0.6) {
      if (B.r >= SNOW_BIG && Math.hypot(B.vx, B.vz) > 0.15) { /* smash: the crystals tumble out */
        S.done[Q.id] = 1; state.isle.store.crystal = (state.isle.store.crystal || 0) + 4; invDirty = true; xpGain(XP_FOR.crystal || 4); bldBadge(); save();
        const sp2 = new T.Sprite(new T.SpriteMaterial({ map: hamGiftTex('crystal', 4), transparent: true, depthWrite: false })); sp2.scale.set(1.5, 0.75, 1); sp2.position.set(I.x, 1.6, I.z); sc.add(sp2); FD.floats.push({ sp: sp2, t: 0, y: 0.1 });
        Snd.play('impact', { gain: 0.4 }); Snd.play('sparkle', { gain: 0.45 }); burst(I.x, 0.6, I.z, 16); burst(B.x, B.r, B.z, 10);
      } else { /* too small: it bumps off and the ice wobbles */
        B.vx = ix / id * 1.6; B.vz = iz / id * 1.6; B.x = I.x + ix / id * (B.r + 0.62); B.z = I.z + iz / id * (B.r + 0.62);
        if (I.wob < 0.3) { I.wob = 1; Snd.play('thud', { gain: 0.25 }); } }
    }
  });
}
ISLE_STEPS.push(snowStep);
