/* ---------- barn loft: up the ladder in the barn live the small animals (guinea pigs, chicks, kittens, hamsters) ----------
   Four corners, at most 3 animals each, bought with hearts on a pad in the middle of the loft. Each corner has its own
   bowl: stand by it and fill it (no carrying, the sack is right there). The small ones get hungry 3-4 times slower than the
   farm animals; a full bowl and a pat give hearts. The loft is built far out at LI, like the barn inside at BI. */
const LI = { x: -200, z: -40 };
const LOFT_IN = { x0: LI.x - 3.9, x1: LI.x + 3.9, z0: LI.z - 2.4, z1: LI.z + 2.9 };
const SMALL = {
  gpig: { food: 'carrot', at: [-2.6, -1.3], col: ['#c98a4e', '#f4efe4', '#3d2c22'], sv: 'Marsvin', h: 2 },
  chick: { food: 'grain', at: [2.6, -1.3], col: ['#ffd84a', '#ffe680', '#f2c14e'], sv: 'Kycklingar', h: 2 },
  kitten: { food: 'milk', at: [-2.6, 1.6], col: ['#e8a25a', '#9a948c', '#f4efe4'], sv: 'Kattungar', h: 3 },
  hamster: { food: 'grain', at: [2.6, 1.6], col: ['#e3b07a', '#f4efe4', '#c98a4e'], sv: 'Hamstrar', h: 3 }
};
const LPADS = [];
[['gpig', 120, 300, 600], ['chick', 160, 320, 600], ['hamster', 200, 400, 700], ['kitten', 240, 450, 800]].forEach(([a, ...c]) => c.forEach((cost, i) => LPADS.push({ id: a + (i + 1), a, cost, r: i })));
LPADS.sort((p, q) => p.r - q.r || p.cost - q.cost);
let inLoft = false;
const loftS = () => { if (!state.loft) state.loft = { owned: {}, paid: {}, bowl: { gpig: 3, chick: 3, kitten: 3, hamster: 3 } }; return state.loft; };
const smalls = []; /* { a, g, body, tx, tz, hop, pet, hungry, bub } */
const loftL = [];
const ladderDn = mkRing(BI.x - 3.7, BI.z - 1.35), ladderUp = mkRing(LI.x - 0.2, LI.z + 2.55);
const loftLights = [[-2.4, 1.6, -2.2], [2.4, 1.6, -2.2], [0, 1.9, 0.4], [0, 1.6, 2.6]];

/* ---- the loft room: planks, a low pitched roof seen from inside, straw, bales and four cosy corners ---- */
{
  const P = at(LI.x, LI.z, 0, loftL), DK = '#5a3a28', WD = '#9a6542', LW = '#b98552', HAY = '#e2c36b';
  let g = new T.PlaneGeometry(40, 30); g.rotateX(-Math.PI / 2); const yard = new T.Mesh(g, new T.MeshStandardMaterial({ color: '#1f2a1c', roughness: 1 })); yard.position.set(LI.x, -0.01, LI.z); sc.add(yard);
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'); const B = ['#b98552', '#a8774a', '#c38f5b', '#9c6c42'];
  for (let r = 0; r < 8; r++) { let px = -hash(r, 7) * 160; while (px < 512) { const L = 140 + hash(r, px, 2) * 180; x.fillStyle = B[Math.floor(hash(r * 1.7, px) * 4)]; x.fillRect(px, r * 64, L, 64); x.strokeStyle = 'rgba(50,30,15,0.45)'; x.lineWidth = 3; x.strokeRect(px, r * 64, L, 64); px += L; } }
  for (let k = 0; k < 500; k++) { const sx = hash(k, 11) * 512, sy = hash(k, 12) * 512, a = hash(k, 13) * 6.283, l = 8 + hash(k, 14) * 12; x.strokeStyle = ['#e8c873', '#f2d88c'][k % 2]; x.globalAlpha = 0.5; x.lineWidth = 2; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + Math.cos(a) * l, sy + Math.sin(a) * l); x.stroke(); } x.globalAlpha = 1;
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(4, 3);
  const fl = new T.Mesh(new T.PlaneGeometry(9.2, 6.6), new T.MeshStandardMaterial({ map: t, roughness: 0.9 })); fl.rotation.x = -Math.PI / 2; fl.position.set(LI.x, 0.04, LI.z + 0.2); fl.receiveShadow = true; sc.add(fl);
  /* the roof slopes down to both sides: low knee walls left and right, a gable wall with a round window at the back */
  const wood = (cx, cy, cz, i) => tone(WD, i, 0.5).multiplyScalar(0.85 + 0.2 * clamp(cy + 0.5, 0, 1));
  P(box(9.4, 2.4, 0.18), wood, 4400, 0, 1.2, -3.1); P(new T.CylinderGeometry(0.5, 0.5, 0.06, 20).rotateX(Math.PI / 2), '#cfe8f0', 4401, 0, 1.75, -3.0); P(new T.TorusGeometry(0.5, 0.07, 6, 20), DK, 4402, 0, 1.75, -2.98);
  [-1, 1].forEach((s) => { P(box(0.18, 0.6, 6.6), wood, 4403, s * 4.65, 0.3, 0.2); P(box(0.16, 0.16, 6.8), DK, 4404, s * 3.9, 2.05, 0.2, { rz: s * 0.62 });
    [-2.6, -0.4, 1.8].forEach((z) => P(box(0.14, 2.3, 0.14), DK, 4405, s * 3.85, 1.1, z, { rz: s * 0.62 })); });
  P(box(9.4, 0.2, 0.25), DK, 4406, 0, 2.45, -2.95);
  /* ladder hole at the front with its rails */
  P(box(1.0, 0.03, 0.8), '#3a2618', 4407, -0.2, 0.05, 2.75); [-0.62, 0.22].forEach((x2) => P(box(0.07, 0.9, 0.07), DK, 4408, x2, 0.45, 2.75));
  /* bales and loose hay along the walls */
  [[-0.9, -2.7], [0.9, -2.7], [0, -2.7, 0.55], [-4.1, 0.2], [4.1, 0.2]].forEach(([bx, bz, y], k) => { const b = new T.CylinderGeometry(0.3, 0.3, 0.62, 12); b.rotateZ(Math.PI / 2); P(jit(b, 0.012, 20 + k), (cx, cy, cz, i) => tone(Math.abs(cx) > 0.28 ? '#d7a84e' : PAL.ochre, i, 0.7), 4410 + k, bx, (y || 0) + 0.3, bz); });
  /* the four corners: a hutch, a nursery box under a warm lamp, a basket and a cage with a wheel */
  Object.keys(SMALL).forEach((a, k) => { const [cx0, cz0] = SMALL[a].at;
    P(new T.CylinderGeometry(1.05, 1.1, 0.05, 16), (cx, cy, cz, i) => tone(HAY, i, 0.8), 4420 + k, cx0, 0.07, cz0);
    P(box(0.08, 0.32, 2.2), LW, 4425, cx0 + (cx0 < 0 ? 1.15 : -1.15), 0.18, cz0); P(box(2.2, 0.32, 0.08), LW, 4426, cx0, 0.18, cz0 + (cz0 < 0 ? 1.15 : -1.15));
    if (a === 'gpig') { P(box(0.7, 0.45, 0.55), WD, 4430, cx0 - 0.55, 0.25, cz0 - 0.45); P(box(0.8, 0.06, 0.65), DK, 4431, cx0 - 0.55, 0.5, cz0 - 0.45, { rz: 0.12 }); P(box(0.25, 0.25, 0.02), '#3a2618', 4432, cx0 - 0.55, 0.17, cz0 - 0.17); }
    if (a === 'chick') { P(box(1.2, 0.25, 0.9), '#c99a64', 4433, cx0 + 0.2, 0.15, cz0 - 0.3); P(box(0.05, 0.7, 0.05), DK, 4434, cx0 + 0.6, 0.6, cz0 - 0.75); P(new T.ConeGeometry(0.2, 0.2, 10, 1, true), '#c0392b', 4435, cx0 + 0.4, 0.9, cz0 - 0.55);
      const s = new T.Sprite(glowMat); s.scale.set(1.3, 1.3, 1); s.position.set(LI.x + cx0 + 0.4, 0.75, LI.z + cz0 - 0.55); s.material = glowMat; sc.add(s); }
    if (a === 'kitten') { P(new T.CylinderGeometry(0.55, 0.45, 0.25, 16, 1, true), '#c99a64', 4436, cx0 - 0.3, 0.16, cz0 + 0.2); P(new T.CylinderGeometry(0.45, 0.45, 0.04, 16), '#e98aa0', 4437, cx0 - 0.3, 0.08, cz0 + 0.2); P(ico(0.06, 1, 4438), '#4a90c8', 4438, cx0 + 0.5, 0.12, cz0 + 0.6); }
    if (a === 'hamster') { P(new T.TorusGeometry(0.28, 0.04, 6, 16), '#8f9aa6', 4439, cx0 + 0.55, 0.32, cz0 + 0.3, { ry: Math.PI / 2 }); P(box(0.06, 0.32, 0.06), '#8f9aa6', 4440, cx0 + 0.55, 0.16, cz0 + 0.3); P(box(0.5, 0.3, 0.4), '#e2c36b', 4441, cx0 - 0.4, 0.17, cz0 + 0.55); }
    /* the bowl and the little food sack beside it */
    P(new T.CylinderGeometry(0.2, 0.15, 0.1, 12), '#8f9aa6', 4442, cx0 + (cx0 < 0 ? 0.8 : -0.8), 0.08, cz0 + (cz0 < 0 ? 0.8 : -0.8));
    P(ico(0.18, 1, 4443 + k).scale(1, 1.3, 1), '#d9c9a3', 4443, cx0 + (cx0 < 0 ? 0.8 : -0.8) + (cx0 < 0 ? 0.32 : -0.32), 0.2, cz0 + (cz0 < 0 ? 0.8 : -0.8));
  });
  /* lanterns */
  loftLights.forEach(([lx, ly, lz]) => { P(box(0.16, 0.22, 0.16), '#3a3f48', 4450, lx, ly, lz); P(box(0.12, 0.16, 0.12), '#ffd98a', 4451, lx, ly, lz + 0.01); P(box(0.03, 0.4, 0.03), DK, 4452, lx, ly + 0.3, lz); });
  merged(loftL); loftL.length = 0;
}
/* bowls: a sprite showing what is in it, and a ring to stand on */
const loftBowls = {};
Object.keys(SMALL).forEach((a) => { const [cx0, cz0] = SMALL[a].at, bx = LI.x + cx0 + (cx0 < 0 ? 0.8 : -0.8), bz = LI.z + cz0 + (cz0 < 0 ? 0.8 : -0.8);
  const food = new T.Group(); food.position.set(bx, 0.14, bz); sc.add(food);
  for (let k = 0; k < 3; k++) { const m = new T.Mesh(fac(ico(0.07, 1, 4460 + k), SMALL[a].food === 'carrot' ? '#f08a2c' : SMALL[a].food === 'milk' ? '#fbf8f1' : '#f2c14e', 4460 + k), MAT); m.position.set((k - 1) * 0.08, 0, (k % 2) * 0.06 - 0.03); food.add(m); }
  const sp = new T.Sprite(new T.SpriteMaterial({ map: bubble(SMALL[a].food), depthTest: false })); sp.renderOrder = 5; sp.scale.set(0.55, 0.55, 1); sp.position.set(bx, 0.85, bz); sc.add(sp);
  loftBowls[a] = { x: bx, z: bz, food, sp }; });

/* ---- a small animal: a round body, a head, ears and a face; each kind a little different ---- */
function smallModel(a, i) {
  const g = new T.Group(), body = new T.Group(); g.add(body); const C = SMALL[a].col, col = C[i % 2 === 1 ? 1 : 0], ink = '#2a1d17';
  const S = (r, c, x, y, z, sx, sy, sz, seed) => { const m = part(fac(ico(r, 2, seed || 1, r * 0.04).scale(sx || 1, sy || 1, sz || 1), c, seed || 1), body, x, y, z); return m; };
  if (a === 'gpig') { S(0.2, col, 0, 0.16, 0, 1, 0.8, 1.35, 4470); S(0.08, i % 3 === 2 ? C[2] : C[1], 0.06, 0.24, 0.05, 1.4, 0.8, 1.6, 4471); [-1, 1].forEach((s) => S(0.04, '#e98aa0', s * 0.1, 0.3, 0.12, 1, 1, 0.5, 4472)); }
  else if (a === 'chick') { S(0.13, C[0], 0, 0.14, 0, 1, 1, 1.1, 4473); S(0.09, C[0], 0, 0.3, 0.07, 1, 1, 1, 4474); const bk = part(fac(new T.ConeGeometry(0.03, 0.07, 6).rotateX(Math.PI / 2), '#f08a2c', 4475), body, 0, 0.29, 0.17); [-1, 1].forEach((s) => S(0.05, C[2], s * 0.12, 0.15, 0, 0.5, 1, 1.4, 4476)); }
  else if (a === 'kitten') { S(0.15, col, 0, 0.17, -0.04, 1, 0.9, 1.4, 4477); S(0.12, col, 0, 0.32, 0.15, 1, 0.95, 1, 4478); [-1, 1].forEach((s) => part(fac(new T.ConeGeometry(0.05, 0.1, 4), col, 4479), body, s * 0.07, 0.45, 0.14)); const tl = part(fac(new T.CylinderGeometry(0.025, 0.02, 0.3, 6), col, 4480), body, 0, 0.3, -0.27); tl.rotation.x = -0.5; S(0.05, C[2], 0, 0.27, 0.24, 1.2, 0.8, 0.6, 4481); }
  else { S(0.14, col, 0, 0.13, 0, 1.15, 0.9, 1.1, 4482); S(0.08, C[1], 0, 0.11, 0.1, 1.3, 0.8, 0.8, 4483); [-1, 1].forEach((s) => S(0.035, '#e98aa0', s * 0.08, 0.25, 0.06, 1, 1, 0.5, 4484)); }
  /* eyes and a nose, shared by everyone */
  const fy = a === 'gpig' ? 0.22 : a === 'chick' ? 0.32 : a === 'kitten' ? 0.35 : 0.19, fz = a === 'gpig' ? 0.26 : a === 'chick' ? 0.15 : a === 'kitten' ? 0.26 : 0.15, fx = a === 'chick' ? 0.04 : 0.06;
  [-1, 1].forEach((s) => S(0.022, ink, s * fx, fy, fz, 1, 1, 1, 4485));
  if (a !== 'chick') S(0.018, '#e98aa0', 0, fy - 0.04, fz + 0.02, 1, 1, 1, 4486);
  return { g, body };
}
function addSmall(a, quiet) {
  const n = smalls.filter((s) => s.a === a).length, m = smallModel(a, n), [cx0, cz0] = SMALL[a].at;
  m.g.position.set(LI.x + cx0 + (hash(n, 3) - 0.5) * 0.8, 0, LI.z + cz0 + (hash(n, 4) - 0.5) * 0.6); m.g.rotation.y = hash(n, 5) * 6.283; sc.add(m.g);
  const bub = new T.Sprite(new T.SpriteMaterial({ map: bubble('heart'), depthTest: false })); bub.renderOrder = 5; bub.scale.set(0.42, 0.42, 1); bub.visible = false; sc.add(bub);
  const s = { a, g: m.g, body: m.body, tx: m.g.position.x, tz: m.g.position.z, hop: 0, pet: 0, wait: hash(n, 9) * 3, bub }; smalls.push(s);
  if (!quiet) { burst(m.g.position.x, 0.5, m.g.position.z, 8); Snd.play('sparkle', { gain: 0.5 }); }
  return s;
}

/* ---- the buy pad in the middle of the loft ---- */
const LPAD_AT = { x: LI.x + 0, z: LI.z + 0.3 };
const lpadC = document.createElement('canvas'); lpadC.width = lpadC.height = 256; const lpadT = new T.CanvasTexture(lpadC);
const lpad = new T.Mesh(new T.CircleGeometry(0.72, 32), new T.MeshBasicMaterial({ map: lpadT, transparent: true })); lpad.rotation.x = -Math.PI / 2; lpad.position.set(LPAD_AT.x, 0.09, LPAD_AT.z); sc.add(lpad);
let lpadShown = '', lpadTick = 0;
const nextLPad = () => LPADS.find((p) => !loftS().owned[p.id]) || null;
function drawLPad(p) { const left = p.cost - (loftS().paid[p.id] || 0), key = p.id + ':' + left; if (key === lpadShown) return; lpadShown = key;
  const x = lpadC.getContext('2d'); x.clearRect(0, 0, 256, 256); const t = padTex({ kind: 'none', cost: p.cost }, left); x.drawImage(t.image, 0, 0); drawIcon(x, p.a, 128, 86, 1.3); lpadT.needsUpdate = true; }
function buyLPad(p) { const S = loftS(); S.owned[p.id] = true; delete S.paid[p.id]; addSmall(p.a); Snd.play('success', { gain: 0.6, f: 'E6' }); pop([LPAD_AT.x, LPAD_AT.z]); lpadShown = ''; save(); }

/* ---- going up and down the ladder ---- */
function goLoft(to) {
  if (doorT > 0) return; doorT = 1; fadeEl.style.opacity = '1'; Snd.play('pop', { gain: 0.4, f: to ? 520 : 380 }); Snd.play('tock', { gain: 0.25, f: 260 }, 0.1);
  setTimeout(() => {
    inLoft = to; const B = to ? LOFT_IN : BARN_IN; IN_B.x0 = B.x0; IN_B.x1 = B.x1; IN_B.z0 = B.z0; IN_B.z1 = B.z1;
    if (to) { pip.position.set(LI.x - 0.2, 0, LI.z + 1.7); pip.rotation.y = Math.PI; } else { pip.position.set(BI.x - 3.2, 0, BI.z - 0.6); pip.rotation.y = 0.6; }
    followers.slice().forEach((an) => unfollow(an));
    target.copy(pip.position); camFocus.copy(pip.position); lastP.copy(pip.position); ladderDn.w = ladderUp.w = 0;
    setTimeout(() => { fadeEl.style.opacity = '0'; doorT = 0; }, 120);
  }, 420);
}

/* ---- every frame ---- */
let loftReady = false, loftEat = 0;
const LOFT_MEAL = 75; /* seconds between meals for each corner (the farm animals want food about every 20 s) */
function loftStep(dt) {
  if (!loftReady) { loftReady = true; const S = loftS(); LPADS.forEach((p) => { if (S.owned[p.id]) addSmall(p.a, true); }); }
  const S = loftS(), freeHands = !riding() && !dressing && !trip && doorT <= 0;
  /* the ladder rings: one in the barn by the ladder, one at the top */
  ladderDn.r.visible = ladderDn.f.visible = inBarn && !inLoft; ladderUp.r.visible = ladderUp.f.visible = inLoft;
  if (inBarn && !inLoft) { const ok = freeHands && stillOn(ladderDn, dt); ladderDn.w = ok ? Math.min(1, ladderDn.w + dt / 0.5) : Math.max(0, ladderDn.w - dt * 3); ladderDn.f.scale.setScalar(Math.max(0.001, ladderDn.w)); if (ladderDn.w >= 1) goLoft(true); }
  if (inLoft) { const ok = freeHands && stillOn(ladderUp, dt); ladderUp.w = ok ? Math.min(1, ladderUp.w + dt / 0.5) : Math.max(0, ladderUp.w - dt * 3); ladderUp.f.scale.setScalar(Math.max(0.001, ladderUp.w)); if (ladderUp.w >= 1) goLoft(false); }
  if (!inBarn && inLoft) inLoft = false;
  /* meals: each corner with animals eats one portion now and then, in the loft or not */
  loftEat += dt; if (loftEat > 1) { loftEat = 0; Object.keys(SMALL).forEach((a) => { const n = smalls.filter((s) => s.a === a).length; if (!n) return; S.ate = S.ate || {}; S.ate[a] = (S.ate[a] || 0) + 1;
    if (S.ate[a] >= LOFT_MEAL / Math.sqrt(n)) { S.ate[a] = 0; if (S.bowl[a] > 0) { S.bowl[a]--; if (inLoft) { const s = smalls.find((q) => q.a === a); if (s) { s.hop = 1; s.tx = loftBowls[a].x; s.tz = loftBowls[a].z - 0.1; } } } } }); }
  Object.keys(loftBowls).forEach((a) => { const B = loftBowls[a], have = smalls.some((s) => s.a === a); B.food.children.forEach((m, k) => { m.visible = S.bowl[a] > k; });
    B.sp.visible = inLoft && have && S.bowl[a] <= 0; B.sp.position.y = 0.85 + (reduced ? 0 : Math.sin(time * 3) * 0.05); });
  /* the little ones potter about in their corner, hop when happy, peep when the bowl is empty */
  smalls.forEach((s, k) => { const [cx0, cz0] = SMALL[s.a].at, cx = LI.x + cx0, cz = LI.z + cz0;
    s.wait -= dt; if (s.wait <= 0) { s.wait = 1.5 + hash(k, time | 0) * 3; s.tx = cx + (hash(k, time * 3 | 0, 1) - 0.5) * 1.5; s.tz = cz + (hash(k, time * 3 | 0, 2) - 0.5) * 1.3; }
    walkTo(s.g, s.tx, s.tz, dt, s.a === 'hamster' ? 0.9 : 0.5); s.hop = Math.max(0, s.hop - dt * 2); s.pet = Math.max(0, s.pet - dt);
    s.body.position.y = Math.abs(Math.sin(s.hop * Math.PI * 2)) * 0.12 + (s.a === 'chick' ? Math.abs(Math.sin(time * 9 + k)) * 0.02 : 0);
    s.bub.visible = inLoft && s.pet > 0; s.bub.position.set(s.g.position.x, 0.75 + (1 - s.pet / 1.2) * 0.3, s.g.position.z); });
  if (!inLoft) { lpad.visible = false; return; }
  /* inside: lanterns, the pad */
  LAMP_LIGHTS.forEach((l, i) => { const p = loftLights[i]; l.position.set(LI.x + p[0], p[1] - 0.2, LI.z + p[2] + 0.25); l.intensity = 2.2 * (0.9 + 0.1 * Math.sin(time * 8 + i * 2)); l.distance = 6.5; });
  barnGlow.forEach((s) => { s.visible = false; });
  const p = nextLPad(); lpad.visible = !!p;
  if (p) { drawLPad(p);
    const on = Math.hypot(pip.position.x - LPAD_AT.x, pip.position.z - LPAD_AT.z) < 0.7, still = Math.hypot(target.x - pip.position.x, target.z - pip.position.z) < 0.15;
    if (on && still && state.coins > 0) { const left = p.cost - (S.paid[p.id] || 0), amt = Math.min(state.coins, left, Math.max(1, Math.ceil(p.cost * dt / 1.4)));
      state.coins -= amt; bump(); S.paid[p.id] = (S.paid[p.id] || 0) + amt; lpadTick -= dt; if (lpadTick <= 0) { lpadTick = 0.08; Snd.play('tick', { gain: 0.3, f: 1200 }, 0, 70); }
      if (S.paid[p.id] >= p.cost) buyLPad(p); }
    lpad.scale.setScalar(on ? 1.08 : 1 + (reduced ? 0 : Math.sin(time * 3) * 0.03)); }
}
{ const e0 = extrasStep; extrasStep = function (dt) { e0(dt); loftStep(dt); }; }

/* ---- actions in the loft: fill a bowl, pat a little one ---- */
function nearBowl() { let best = null; for (const a in loftBowls) { const B = loftBowls[a]; if (smalls.some((s) => s.a === a) && Math.hypot(pip.position.x - B.x, pip.position.z - B.z) < 1.0 && loftS().bowl[a] < 3) best = a; } return best; }
function nearSmall() { let best = null, bd = 0.9; smalls.forEach((s) => { const d = Math.hypot(s.g.position.x - pip.position.x, s.g.position.z - pip.position.z); if (d < bd && s.pet <= 0) { bd = d; best = s; } }); return best; }
function fillBowl(a) { const S = loftS(), was = S.bowl[a]; S.bowl[a] = 3; const B = loftBowls[a]; Snd.play('pop', { gain: 0.45, f: 700 }); burst(B.x, 0.4, B.z, 4);
  const n = Math.max(1, Math.round((3 - was) * SMALL[a].h * heartMult())); earn(n); coinToHud(B.x, 0.4, B.z, Math.min(4, n)); smalls.forEach((s) => { if (s.a === a) { s.hop = 1; s.tx = B.x + (Math.random() - 0.5) * 0.4; s.tz = B.z + (Math.random() - 0.5) * 0.4; } }); save(); }
function patSmall(s) { s.pet = 1.2; s.hop = 1; const full = loftS().bowl[s.a] > 0, n = Math.max(1, Math.round(SMALL[s.a].h * (full ? 1 : 0.4) * heartMult())); earn(n); coinToHud(s.g.position.x, 0.4, s.g.position.z, Math.min(3, n)); burst(s.g.position.x, 0.4, s.g.position.z, 3);
  Snd.play('sparkle', { gain: 0.35 }, 0.03, 150); Snd.play('pop', { gain: 0.3, f: s.a === 'chick' ? 1400 : s.a === 'kitten' ? 900 : 1100 }); }
{ const f0 = findActs; findActs = function () {
  if (!inLoft) return f0(); const out = [];
  const a = nearBowl(); if (a) out.push({ icon: actIcon(SMALL[a].food), label: 'Fyll skålen', run: () => fillBowl(a) });
  const s = nearSmall(); if (s) out.push({ icon: actIcon('heart', s.a), label: 'Klappa', run: () => patSmall(s) });
  return out.slice(0, 2); }; }
/* the guide arrow: up here it points at an empty bowl, else at the pad when the hearts are there, else down the ladder */
if (typeof guideGoal === 'function') { const g0 = guideGoal; guideGoal = function () { if (!inLoft) { const r = g0(); return r; }
  const a = Object.keys(loftBowls).find((k) => smalls.some((s) => s.a === k) && loftS().bowl[k] <= 0); if (a) return [loftBowls[a].x, loftBowls[a].z];
  const p = nextLPad(); if (p && state.coins >= p.cost - (loftS().paid[p.id] || 0)) return [LPAD_AT.x, LPAD_AT.z]; return null; }; }

/* ---- pictures for the small animals (pad, action buttons) ---- */
{ const d0 = drawIcon; drawIcon = function (cx, t, x, y, s) {
  if (!SMALL[t]) return d0(cx, t, x, y, s);
  cx.save(); cx.translate(x, y); cx.scale(s, s); cx.lineWidth = 4; cx.strokeStyle = PAL.ink; cx.lineJoin = 'round';
  const E = (a, b, rx, ry, f, r) => { cx.fillStyle = f; cx.beginPath(); cx.ellipse(a, b, rx, ry, r || 0, 0, 7); cx.fill(); cx.stroke(); };
  const eye = (a, b) => { cx.fillStyle = PAL.ink; cx.beginPath(); cx.arc(a, b, 3.4, 0, 7); cx.fill(); cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(a + 1.1, b - 1.2, 1.2, 0, 7); cx.fill(); };
  const C = SMALL[t].col;
  if (t === 'gpig') { E(0, 6, 28, 18, C[0]); E(10, 0, 12, 10, C[1]); E(-14, -10, 6, 5, '#e98aa0'); E(14, -10, 6, 5, '#e98aa0'); eye(-8, 2); eye(8, 2); E(0, 12, 4, 3, '#e98aa0'); }
  else if (t === 'chick') { E(0, 10, 20, 18, C[0]); E(0, -14, 15, 14, C[0]); eye(-5, -16); eye(7, -16); cx.fillStyle = '#f08a2c'; cx.beginPath(); cx.moveTo(-4, -9); cx.lineTo(4, -9); cx.lineTo(0, -3); cx.closePath(); cx.fill(); cx.stroke(); }
  else if (t === 'kitten') { [-1, 1].forEach((q) => { cx.fillStyle = C[0]; cx.beginPath(); cx.moveTo(q * 20, -6); cx.lineTo(q * 16, -28); cx.lineTo(q * 4, -14); cx.closePath(); cx.fill(); cx.stroke(); }); E(0, 2, 22, 19, C[0]); eye(-8, 0); eye(8, 0); E(0, 8, 3.5, 2.5, '#e98aa0');
    cx.lineWidth = 2; [-1, 1].forEach((q) => { cx.beginPath(); cx.moveTo(q * 8, 10); cx.lineTo(q * 26, 8); cx.stroke(); }); }
  else { E(0, 6, 25, 20, C[0]); E(0, 12, 14, 10, C[1]); E(-15, -12, 6, 6, '#e98aa0'); E(15, -12, 6, 6, '#e98aa0'); eye(-8, 0); eye(8, 0); E(0, 7, 3, 2.5, '#e98aa0'); }
  cx.restore(); }; }
if (window.__farmTest) window.__loft = { go: goLoft, S: () => loftS(), n: () => smalls.map((s) => s.a).join(','), buy: (id) => { const p = LPADS.find((q) => q.id === id); if (p && !loftS().owned[p.id]) buyLPad(p); }, inLoft: () => inLoft, acts: () => findActs().map((a) => a.label).join(',') };
if (typeof xpUnlockAll === 'function') { const u0 = xpUnlockAll; xpUnlockAll = function () { u0(); ['gpig1', 'chick1', 'hamster1', 'kitten1'].forEach((id) => { const p = LPADS.find((q) => q.id === id); if (p && !loftS().owned[id]) { loftS().owned[id] = true; addSmall(p.a, true); } }); save(); }; }
