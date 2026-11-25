/* ---------- the second person: the baker (Leon, 2026-11-24: "continue with the next villager and upgrade") ----------
   A duck in a chef's hat hides in the old cottage on the orchard island. Open the door and she wants berries; bring them
   and she moves to the camp, next to a dashed plot east of the campfire. Paying the plot builds her clay oven.
   The oven bakes on its own, and takes its time: each pie uses 4 berries from the counters and needs 45 seconds
   (a bubble over the oven fills up like a clock). Pies wait on the oven (up to five; no counter of their own). When Pip runs low on energy, Pip eats a pie
   on the spot (+60) instead of having to walk to the tent. Oven upgrades at her card: faster baking, then two pies at once
   (paid with coins and crystals).
   state.isle.folk.baker: 0 in the cottage, 1 found (wants berries), 2 at the camp (oven plot), 3 oven built. state.isle.bake: progress. */
const OVEN = { x: 3.3, z: -0.05 }, BAKER_AT = { x: 4.2, z: 0.25 }, OVEN_RING = { x: 3.3, z: 1.05 };
const BAKER_WANT = { berry: 10 }, OVEN_COST = { stone: 12, log: 10 };
const PIE_NEED = { berry: 4 }, PIE_MAX = 5, PIE_EN = 60, OVEN_IN = new T.Vector3(OVEN.x, 0.6, OVEN.z + 0.3);
const bakeTime = () => [0, 45, 28, 28][bldLv('oven')], bakeBatch = () => [0, 1, 1, 2][bldLv('oven')];
BLD.oven = { max: 3, cost: [null, null, { stone: 12, log: 12, coin: 8 }, { crystal: 6, log: 15, coin: 15 }], pic: [null, 'oven', 'oven', 'oven'] };
const ovenUp = () => !!(state.isle && state.isle.folk && state.isle.folk.baker >= 3);
const BK = { g: null, pop: 0, hop: 0, move: null, arr: 0, wait: 0 };
const bake = () => state.isle.bake || (state.isle.bake = { t: 0, on: 0, pies: 0 });
const pies = () => bake().pies || 0;

function bakeryIcon(x, t) {
  const blob = (f) => { x.fillStyle = f; x.fill(); x.stroke(); };
  if (t === 'pie') { x.beginPath(); x.moveTo(-21, 2); x.lineTo(21, 2); x.lineTo(16, 14); x.lineTo(-16, 14); x.closePath(); blob('#c9874a');
    x.beginPath(); x.ellipse(0, 2, 21, 9, 0, Math.PI, 0); x.closePath(); blob('#f0c070');
    x.lineWidth = 2.2; x.strokeStyle = '#b5562f'; x.beginPath(); [-10, 0, 10].forEach((q) => { x.moveTo(q - 3, -5); x.lineTo(q + 3, 1); }); x.stroke();
    x.fillStyle = '#d6406a'; [[-5, -3], [6, -4]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 2.4, 0, 7); x.fill(); }); }
  else if (t === 'oven') { x.beginPath(); x.rect(-20, 6, 40, 12); blob('#bdb3a0'); x.beginPath(); x.moveTo(-18, 6); x.quadraticCurveTo(-18, -20, 0, -20); x.quadraticCurveTo(18, -20, 18, 6); x.closePath(); blob('#d08a5a');
    x.beginPath(); x.moveTo(-7, 6); x.quadraticCurveTo(-7, -6, 0, -6); x.quadraticCurveTo(7, -6, 7, 6); x.closePath(); blob('#3a2418');
    x.fillStyle = '#ff9a3a'; x.beginPath(); x.ellipse(0, 4, 5, 2.4, 0, 0, 7); x.fill(); x.beginPath(); x.rect(8, -26, 6, 10); blob('#8a806e'); }
}
const PIE_GEO = (() => { const L = []; let q = new T.CylinderGeometry(0.17, 0.14, 0.07, 14); q.translate(0, 0.035, 0); L.push(fac(q, '#c9874a', 2960));
  q = new T.SphereGeometry(0.165, 14, 5, 0, Math.PI * 2, 0, Math.PI / 2); q.scale(1, 0.32, 1); q.translate(0, 0.07, 0); L.push(fac(q, (cx, cy, cz, i) => new T.Color(i % 7 === 0 ? '#d6406a' : '#f0c070'), 2961));
  return merged(L.map((g) => (g.index ? g.toNonIndexed() : g)), MAT, new T.Group()).geometry; })();

function bakerModel() {
  const g = new T.Group(), body = guestModel2('duck'); body.scale.setScalar(1.3); g.add(body);
  const L = [];
  let q = new T.CylinderGeometry(0.2, 0.25, 0.4, 12, 1, true, -1.1, 2.2); q.translate(0, 0.37, 0.03); L.push(fac(q, (cx, cy, cz, i) => shadeY('#fbf3e4', cy, 0.15, 0.6, i, 0.25), 2950)); /* a white apron */
  q = new T.CylinderGeometry(0.13, 0.12, 0.16, 12); q.translate(0, 1.11, -0.01); L.push(fac(q, '#fbf8f0', 2951)); /* the chef's hat */
  q = new T.SphereGeometry(0.17, 12, 8); q.scale(1, 0.62, 1); q.translate(0, 1.23, -0.01); L.push(fac(q, (cx, cy, cz, i) => tone('#ffffff', i, 0.2), 2952));
  const ap = new T.Group(); ap.scale.setScalar(1.3); merged(L.map((g) => (g.index ? g.toNonIndexed() : g)), MAT, ap); g.add(ap);
  const pie = new T.Mesh(PIE_GEO, MAT); pie.position.set(0.0, 0.72, 0.42); g.add(pie); BK.pie = pie; /* she holds out a pie */
  sc.add(g); return g;
}
function bakerSpot() {
  if (folk().baker === 1) { const R = ruins.find((r) => r.A.id === 'm2'); if (R) { const c = Math.cos(R.rot), s = Math.sin(R.rot), P = [1, -1].map((k) => [R.x + s * 1.75 + c * 0.95 * k, R.z + c * 1.75 - s * 0.95 * k]);
    const busy = ([x, z]) => nodes.filter((n) => n.kind !== 'planks' && (Math.hypot(n.x - x, n.z - z) < 1.3 || (Math.abs(n.x - x) < 1.2 && n.z > z && n.z - z < 3))).length; return busy(P[0]) <= busy(P[1]) ? P[0] : P[1]; } }
  return [BAKER_AT.x, BAKER_AT.z];
}
function bakerPlace() { const [x, z] = bakerSpot(); BK.g.position.set(x, 0, z); BK.g.rotation.y = 0; }

let ovenG = null, ovenFire = null, ovenGlow = null, ovenRing = null; const ovenPies = [];
const pieSp = isleSprite(null, 0.85); pieSp.visible = false; sc.add(pieSp);
const pieCv = document.createElement('canvas'); pieCv.width = pieCv.height = 128; const pieTex = new T.CanvasTexture(pieCv); pieSp.material.map = pieTex;
function pieDraw(f, ok) { /* a pie in a bubble, with a ring that fills while it bakes; faded when the counters lack berries or hay */
  const x = pieCv.getContext('2d'); x.clearRect(0, 0, 128, 128);
  x.beginPath(); x.arc(64, 60, 50, 0, 7); x.fillStyle = '#fff6e4'; x.fill(); x.lineWidth = 5; x.strokeStyle = '#6e4426'; x.stroke();
  if (f > 0) { x.beginPath(); x.arc(64, 60, 50, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); x.lineWidth = 9; x.strokeStyle = '#74a857'; x.stroke(); }
  x.globalAlpha = ok ? 1 : 0.4; isleIcon(x, 'pie', 64, 62, 1.6); x.globalAlpha = 1;
  if (!ok) isleIcon(x, 'berry', 64, 100, 0.6);
  pieTex.needsUpdate = true;
}
function ovenBuild(anim) {
  if (ovenG) return;
  const g = new T.Group(); g.position.set(OVEN.x, 0, OVEN.z); sc.add(g); const L = [];
  let q = new T.BoxGeometry(1.25, 0.5, 1.25, 4, 2, 4); jit(q, 0.02, 2970); q.translate(0, 0.25, 0); L.push(fac(q, (cx, cy, cz, i) => shadeY(hash(i, 3) > 0.8 ? '#a39883' : '#bdb3a0', cy, 0, 0.9, i, 0.45), 2970)); /* stone base */
  q = new T.SphereGeometry(0.55, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2); q.scale(1, 0.9, 1); q.translate(0, 0.5, -0.18); L.push(fac(q, (cx, cy, cz, i) => shadeY(hash(i, 5) > 0.85 ? '#b8703f' : '#d08a5a', cy, 0.5, 1.1, i, 0.4), 2971)); /* clay dome */
  q = new T.CylinderGeometry(0.08, 0.09, 0.4, 8); q.translate(0.22, 1.05, -0.35); L.push(fac(q, '#8a806e', 2972)); /* little chimney */
  q = new T.BoxGeometry(0.5, 0.08, 0.3); q.translate(-0.95, 0.6, 0.15); L.push(fac(q, (cx, cy, cz, i) => tone('#a8774f', i, 0.5), 2973)); /* a side shelf with a peel leaning on it */
  [[-1.15, 0.0], [-0.75, 0.0], [-1.15, 0.3], [-0.75, 0.3]].forEach(([x, z], k) => { const l = new T.BoxGeometry(0.05, 0.6, 0.05); l.translate(x, 0.3, z); L.push(fac(l, '#8a6a4e', 2974 + k)); });
  q = new T.CylinderGeometry(0.02, 0.02, 0.9, 5); q.rotateZ(0.35); q.translate(-0.55, 0.45, 0.42); L.push(fac(q, '#c99158', 2978));
  q = new T.BoxGeometry(0.22, 0.02, 0.22); q.rotateZ(0.35); q.translate(-0.72, 0.03, 0.42); L.push(fac(q, '#c99158', 2979));
  merged(L.map((q) => (q.index ? q.toNonIndexed() : q)), MAT, g);
  /* the mouth: dark, with fire */
  const mouth = new T.Mesh(new T.CircleGeometry(0.2, 14, 0, Math.PI), new T.MeshBasicMaterial({ color: '#2a1a12' })); mouth.position.set(0, 0.5, 0.36); g.add(mouth);
  const mm = new T.Mesh(new T.PlaneGeometry(0.4, 0.04), new T.MeshBasicMaterial({ color: '#2a1a12' })); mm.position.set(0, 0.5, 0.36); g.add(mm);
  ovenFire = new T.Mesh(new T.CircleGeometry(0.13, 12, 0, Math.PI), new T.MeshBasicMaterial({ color: '#ff8a3a' })); ovenFire.position.set(0, 0.5, 0.365); g.add(ovenFire);
  ovenGlow = new T.Sprite(new T.SpriteMaterial({ map: softTex(32, 32), color: '#ffb060', transparent: true, opacity: 0.4, depthWrite: false })); ovenGlow.position.set(0, 0.6, 0.6); ovenGlow.scale.set(1.1, 0.9, 1); g.add(ovenGlow);
  /* finished pies wait on the front of the base and on the shelf (up to five shown) */
  [[-0.32, 0.51, 0.42], [0.32, 0.51, 0.42], [-1.08, 0.64, 0.15], [-0.84, 0.64, 0.15], [0.0, 0.51, 0.47]].forEach(([x, y, z]) => { const m = new T.Mesh(PIE_GEO, MAT); m.position.set(x, y, z); m.visible = false; g.add(m); ovenPies.push(m); });
  ovenG = g;
  ovenRing = ropeRing(0.45, 0.6); ovenRing.rotation.x = -Math.PI / 2; ovenRing.position.set(OVEN_RING.x, 0.035, OVEN_RING.z); sc.add(ovenRing);
  if (anim) { g.scale.setScalar(0.01); bldPop = { g, t: 0 }; burst(OVEN.x, 1.2, OVEN.z, 12); }
}

function bakerInit() {
  const F = folk(); F.baker = F.baker || 0; bake();
  if (!F.baker && state.isle.ruins.m2) F.baker = 1;
  if (!BK.g) BK.g = bakerModel();
  BK.g.visible = F.baker >= 1 && (F.baker > 1 || HAS.m2); if (BK.g.visible) bakerPlace();
  if (F.baker >= 3) ovenBuild(false);
  pieDraw(0, true);
}
function bakerRuinOpen(R) { if (R.A.id === 'm2' && !folk().baker) { folk().baker = 1; BK.wait = 2.2; } }
function bakerWants(want) {
  const F = state.isle.folk; if (!F || !BK.g) return;
  if (F.baker === 1 && BK.g.visible && !BK.wait && !BK.move) want.set('p:baker', { kind: 'person', who: 'baker' });
  if (F.baker === 2 && !BK.move) want.set('f:oven', { kind: 'plot', who: 'oven' });
}
const ovenGhostGeo = (() => { const g = new T.PlaneGeometry(2.6, 1.8, 6, 4); g.rotateX(-Math.PI / 2); return g; })();
function bakerSignMake(w, key) {
  if (w.who === 'baker') { const [x, z] = bakerSpot(), s = signMake({ key, kind: 'person', who: 'baker', A: null, cost: BAKER_WANT, x, z, ghostGeo: tinyGeo, ghostTex, gx: x, gz: z, gy: -5 });
    s.g.children.forEach((m) => { if (m.isMesh) m.visible = false; }); s.ghost.visible = false; s.ring.scale.setScalar(1.35); return true; }
  if (w.who === 'oven') { signMake({ key, kind: 'plot', who: 'oven', A: null, cost: OVEN_COST, x: OVEN_RING.x, z: OVEN_RING.z + 0.1, ghostGeo: ovenGhostGeo, ghostTex, gx: OVEN.x + 0.0, gz: OVEN.z + 0.1, gy: 0.04 }); return true; }
  return false;
}
function bakerBuy(s) {
  if (s.who === 'baker') { folk().baker = 2; BK.move = { t: 0 }; Snd.play('success', { gain: 0.5, f: 'E6' }); burst(BK.g.position.x, 1.5, BK.g.position.z, 10); xpGain(10); return true; }
  if (s.who === 'oven') { folk().baker = 3; ovenBuild(true); ovenIn = true; /* step off and back on to open her card */ Snd.play('success', { gain: 0.5, f: 'C6' }); Snd.play('sparkle', { gain: 0.4 }, 0.15); xpGain(15); bldBadge(); BK.hop = 1; return true; }
  return false;
}
function ovenLevelUp() { BK.hop = 1; burst(OVEN.x, 1.3, OVEN.z, 10); bldPop = { g: ovenG, t: 0 }; }
function ovenOpen() { if (!ovenUp() || !BM.menu) return; const xu = document.querySelector('.xpUp'); if (xu && !xu.hidden) return; BM.keys = ['oven']; bldFill(); BM.menu.hidden = false; Snd.play('pop', { gain: 0.3, f: 520 }); }
function bakerGoal() {
  const F = state.isle.folk; if (!F || !BK.g) return null; const pp = pip.position;
  if (F.baker === 2 && BK.arr > 0 && Math.hypot(pp.x - BAKER_AT.x, pp.z - BAKER_AT.z) > 4) return [OVEN_RING.x, OVEN_RING.z];
  if (F.baker === 3 && bldLv('oven') < 3 && bldCan('oven') && Math.hypot(pp.x, pp.z) < 14 && carry.count() < cap()) return [OVEN_RING.x, OVEN_RING.z];
  return null;
}
/* Pip eats a pie when the energy runs low (and is not asleep) */
const eatSp = isleSprite(isleBubble('pie'), 0.85); eatSp.visible = false; sc.add(eatSp);
function pieEat() {
  const I = state.isle; if (!pies() || enSleep || I.en >= enMax() * 0.12) return false;
  bake().pies--; I.en = Math.min(enMax(), I.en + PIE_EN); enShow = -1;
  eatSp.visible = true; eatSp.t = 1.6; Snd.play('success', { gain: 0.4, f: 'A5' }); burst(pip.position.x, 1.6, pip.position.z, 5); return true;
}

let ovenIn = false, pieT = 0;
function bakerStep(dt) {
  if (!BK.g) return;
  const F = folk(), g = BK.g, pp = pip.position;
  if (BK.wait) { BK.wait -= dt; if (BK.wait <= 0) { BK.wait = 0; bakerPlace(); g.visible = true; BK.pop = 0.001; g.scale.setScalar(0.01); Snd.play('success', { gain: 0.45, f: 'A5' }); burst(g.position.x, 1.4, g.position.z, 8); isleSigns(); } }
  if (BK.pop) { BK.pop = Math.min(1, BK.pop + dt * 2); g.scale.setScalar(BK.pop < 0.7 ? BK.pop / 0.7 * 1.1 : 1.1 - (BK.pop - 0.7) / 0.3 * 0.1); if (BK.pop >= 1) { BK.pop = 0; g.scale.setScalar(1); } }
  if (BK.move) { const M = BK.move; M.t += dt;
    if (M.t < 1.0) g.position.y = Math.abs(Math.sin(M.t * Math.PI * 2)) * 0.35;
    else if (M.t < 1.35) { g.scale.setScalar(Math.max(0.01, 1 - (M.t - 1.0) / 0.35)); if (!M.puff) { M.puff = 1; Snd.play('whoosh', { gain: 0.4 }); burst(g.position.x, 0.8, g.position.z, 6); } }
    else { BK.move = null; g.position.y = 0; bakerPlace(); BK.pop = 0.001; g.scale.setScalar(0.01); BK.arr = 25; Snd.play('pop', { gain: 0.4, f: 640 }); burst(g.position.x, 1.2, g.position.z, 8); isleSigns(); save(); } }
  BK.arr = Math.max(0, BK.arr - dt);
  if (eatSp.visible) { eatSp.t -= dt; eatSp.position.set(pp.x, 2.2 + (1.6 - eatSp.t) * 0.3, pp.z); eatSp.material.opacity = Math.min(1, eatSp.t * 2); if (eatSp.t <= 0) eatSp.visible = false; }
  pieT -= dt; if (pieT <= 0) { pieT = 0.5; pieEat(); }
  if (!g.visible) return;
  if (!BK.move) {
    BK.hop = Math.max(0, BK.hop - dt * 1.6); g.position.y = BK.hop > 0 ? Math.abs(Math.sin(BK.hop * Math.PI * 3)) * 0.3 : 0;
    const d = Math.hypot(pp.x - g.position.x, pp.z - g.position.z), face = d < 4 ? Math.atan2(pp.x - g.position.x, pp.z - g.position.z) : (F.baker >= 3 ? -0.9 : 0);
    let df = face - g.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); g.rotation.y += df * Math.min(1, dt * 5);
    g.children[0].scale.y = 1.3 * (1 + (reduced ? 0 : Math.sin(time * 2.4 + 1) * 0.02));
    BK.pie.visible = F.baker === 1 || (F.baker >= 3 && pies() > 0);
    if (d < 0.5 && d > 1e-4) { pp.x = g.position.x + (pp.x - g.position.x) / d * 0.5; pp.z = g.position.z + (pp.z - g.position.z) / d * 0.5; }
  }
  if (F.baker >= 3 && ovenG) {
    const B = bake(), I = state.isle;
    /* start a pie when the counters hold its berries and hay: they fly from the crate into the oven */
    if (!B.on && pies() < PIE_MAX && Object.keys(PIE_NEED).every((t) => storeN(t) >= PIE_NEED[t])) {
      Object.keys(PIE_NEED).forEach((t) => { I.store[t] -= PIE_NEED[t]; invWig(t); if (Math.hypot(pp.x - OVEN.x, pp.z - OVEN.z) < 9) for (let k = 0; k < PIE_NEED[t]; k++) { const m = itemModel(t); m.position.set(STORE.x, 0.7, STORE.z); sc.add(m); fly(m, () => OVEN_IN, () => sc.remove(m), 0.5 + k * 0.1); } });
      B.on = 1; B.t = 0; save();
    }
    if (B.on) { B.t += dt; if (B.t >= bakeTime()) { B.on = 0; B.t = 0; B.pies = Math.min(PIE_MAX, pies() + bakeBatch()); BK.hop = 0.6; if (Math.hypot(pp.x - OVEN.x, pp.z - OVEN.z) < 9) { Snd.play('success', { gain: 0.35, f: 'G5' }); burst(OVEN.x, 1.0, OVEN.z + 0.4, 5); } save(); } }
    const f = B.on ? B.t / bakeTime() : pies() >= PIE_MAX ? 1 : 0, ok = B.on || pies() >= PIE_MAX || Object.keys(PIE_NEED).every((t) => storeN(t) >= PIE_NEED[t]), key = Math.round(f * 24) + (ok ? 'y' : 'n');
    if (key !== pieSp.key) { pieSp.key = key; pieDraw(f, ok); }
    pieSp.visible = true; pieSp.position.set(OVEN.x, 1.75 + (reduced ? 0 : Math.sin(time * 2 + 1) * 0.05), OVEN.z - 0.1);
    ovenPies.forEach((m, k) => { m.visible = k < pies(); });
    const fl = reduced ? 1 : 0.8 + Math.sin(time * 8) * 0.12 + Math.sin(time * 19) * 0.06, hot = B.on ? 1 : 0.45; ovenFire.material.color.setRGB(1, 0.55 * fl * hot + 0.2, 0.2 * fl); ovenGlow.material.opacity = (isNight ? 0.7 : 0.35) * fl * hot;
    /* Pip walks round the oven */
    const bx = pp.x - OVEN.x, bz = pp.z - OVEN.z; if (Math.abs(bx) < 0.85 && Math.abs(bz) < 0.85) { if (0.85 - Math.abs(bx) < 0.85 - Math.abs(bz)) pp.x = OVEN.x + Math.sign(bx || 1) * 0.85; else pp.z = OVEN.z + Math.sign(bz || 1) * 0.85; }
    const inR = Math.hypot(pp.x - OVEN_RING.x, pp.z - OVEN_RING.z) < 0.55; if (!inR) ovenIn = false; else if (!ovenIn && BM.menu && BM.menu.hidden) { ovenOpen(); ovenIn = !BM.menu.hidden; }
  }
}
