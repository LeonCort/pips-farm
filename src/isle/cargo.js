/* ---------- the shipping lane (Leon, 2026-11-28: "a shipping lane where they continuously send us goods to the main
   settlement ... other islands' communities send through the dock") ----------
   A village that has moved in beside its island's wonder (hamlets.js) no longer leaves a present on the lawn each morning.
   Three times a day it loads its boat: one of its neighbours (a duck, a bear or a bunny) sails it in from the west, across
   the bay, and noses in at the end of the cargo quay on the camp's west shore. The crates hop off one by one onto the quay
   and the boat backs out, turns, and sails home. Pip walks into the stack: the crates burst and what was in them goes into
   the crate. Presents (gifts.js) are now only for the friends who live in the settlement.
   One boat at the quay at a time; while the stack is full (two days' worth) the boats wait at home.
   Saved: state.isle.cargo = { day, sent: { village: boats today }, pile: { thing: n }, n: crates on the quay }. A boat still
   at sea when the game is closed sails again later (its crates count only once they are on the quay). */
const CG = { quay: null, boat: null, crates: [], pics: [], pileN: -1, picKey: '', hop: [], lane: null };
const CARGO_AT = [0.06, 0.24, 0.42]; /* when in the day (dayFrac, all in daylight) each village's boat sets out */
const CARGO_MAX = 12; /* crates on the quay; two to a boat */
const cargo = () => state.isle.cargo || (state.isle.cargo = { day: -1, sent: {}, pile: {}, n: 0 });
/* one boat's load: a third of what the village used to give each morning (HAM_DEF.give, times its size) */
function cargoLoad(id) { const G = HAM_DEF[id].give, lv = hamLv(id), o = {}; Object.keys(G).forEach((t) => { o[t] = Math.ceil(G[t] * lv / 3); }); return o; }
const cargoNear = () => Math.hypot(pip.position.x - CARGO.pile.x, pip.position.z - CARGO.pile.z) < 16 && !inCave;
/* the quay's picture: a boat with a crate aboard, on a wave */
ISLE_ICON.cargo = (x) => {
  const f = (c) => { x.fillStyle = c; x.fill(); x.stroke(); };
  x.beginPath(); x.rect(-9, -20, 18, 15); f('#c08a52'); x.beginPath(); x.moveTo(-9, -13); x.lineTo(9, -13); x.stroke();
  x.beginPath(); x.moveTo(-22, -5); x.lineTo(22, -5); x.quadraticCurveTo(18, 10, 10, 10); x.lineTo(-12, 10); x.quadraticCurveTo(-20, 8, -22, -5); x.closePath(); f('#d9573f');
  x.beginPath(); x.moveTo(-20, 1); x.lineTo(20, 1); x.lineWidth = 2.4; x.strokeStyle = '#fbf3e4'; x.stroke(); x.lineWidth = 3; x.strokeStyle = '#3a2414';
  x.beginPath(); x.moveTo(-22, 17); x.quadraticCurveTo(-16, 13, -10, 17); x.quadraticCurveTo(-4, 21, 2, 17); x.quadraticCurveTo(8, 13, 14, 17); x.quadraticCurveTo(18, 20, 22, 17); x.strokeStyle = '#3d8fb8'; x.stroke();
};
/* a wooden crate with a band and a lid (a merged mesh in its own group, so it can hop) */
function cargoCrate(seed, col) {
  const g = new T.Group(), L = []; let q = new T.BoxGeometry(0.34, 0.3, 0.34); q.translate(0, 0.15, 0); L.push(fac(q, (cx, cy, cz, i) => shadeY(tone('#c08a52', i + seed, 0.25).getStyle(), cy, 0, 0.3, i, 0.35), 9100 + seed % 7));
  q = new T.BoxGeometry(0.36, 0.05, 0.36); q.translate(0, 0.3, 0); L.push(fac(q, (cx, cy, cz, i) => tone('#a8714d', i, 0.2), 9110));
  q = new T.BoxGeometry(0.352, 0.07, 0.352); q.translate(0, 0.13, 0); L.push(fac(q, () => new T.Color(col || '#8a5f3c'), 9111));
  merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g).castShadow = true; return g;
}
/* the quay: planks from the shore out over the water, two posts with a rope between them at the end, and a little crane */
function cargoQuay() {
  if (CG.quay) return; CARGO.on = 1; const g = new T.Group(), L = [], len = CARGO.x0 - CARGO.x1, n = Math.ceil(len / 0.37); let q; g.position.set(CARGO.x0, 0, CARGO.z); sc.add(g);
  for (let k = 0; k < n; k++) { q = new T.BoxGeometry(0.36, 0.08, 1.25); q.translate(-0.18 - k * 0.37, 0.12, 0); L.push(fac(q, () => tone(['#c0935f', '#b08454', '#c99f6c'][k % 3], k + 40, 0.3), 9200 + k % 9)); }
  for (let k = 0; k < 3; k++) [-0.58, 0.58].forEach((dz, j) => { q = new T.CylinderGeometry(0.075, 0.085, 1.4, 7); q.translate(-0.55 - k * 1.05, -0.25 + (k === 2 ? 0.3 : 0), dz); L.push(fac(q, (cx, cy) => shadeY(PAL.trunk, cy, -1, 0.6, k + j, 0.4), 9220 + k * 2 + j)); });
  q = new T.TorusGeometry(0.1, 0.03, 5, 10); q.rotateX(Math.PI / 2); q.translate(-len + 0.25, 0.47, -0.58); L.push(fac(q.toNonIndexed(), () => new T.Color('#e6d3a8'), 9230));
  /* the crane: a post, an arm out over the berth, a rope and a hook */
  q = new T.CylinderGeometry(0.07, 0.09, 1.7, 7); q.translate(-len + 0.55, 0.95, 0.5); L.push(fac(q, (cx, cy) => shadeY('#8a5f3c', cy, 0, 1.8, 3, 0.4), 9231));
  q = new T.BoxGeometry(1.15, 0.08, 0.08); q.translate(-len + 0.1, 1.76, 0.5); L.push(fac(q, () => new T.Color('#8a5f3c'), 9232));
  q = new T.BoxGeometry(0.06, 0.62, 0.06); q.rotateZ(0.75); q.translate(-len + 0.34, 1.52, 0.5); L.push(fac(q, () => new T.Color('#7a4e2c'), 9233));
  q = new T.CylinderGeometry(0.012, 0.012, 0.5, 4); q.translate(-len - 0.4, 1.5, 0.5); L.push(fac(q, () => new T.Color('#e6d3a8'), 9234));
  q = new T.TorusGeometry(0.06, 0.018, 4, 8, 4.4); q.translate(-len - 0.4, 1.2, 0.5); L.push(fac(q.toNonIndexed(), () => new T.Color('#5d6670'), 9235));
  merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g);
  /* a post with the crate picture on the shore: goods come in here */
  const sp = isleSprite(isleBubble('cargo'), 0.85); sp.position.set(CARGO.x0 + 0.35, 1.7, CARGO.z - 0.75); sc.add(sp);
  CG.quay = { g, sp }; CG.lane = laneMake([CARGO.berth].concat(CARGO.lane));
  lookFoot(CARGO.x0 + 0.2, CARGO.z, 0.7, 0.6);
}
/* the stack on the quay follows the save: two crates a boat, in rows of three, two high */
function cargoPile() {
  const C = cargo(), n = Math.min(C.n, CARGO_MAX); if (CG.pileN === n) return; CG.pileN = n;
  while (CG.crates.length > n) sc.remove(CG.crates.pop());
  while (CG.crates.length < n) { const k = CG.crates.length, c = cargoCrate(k, null), p = cargoSlot(k); c.position.set(p[0], p[1], p[2]); c.rotation.y = (hash(k, 9301) - 0.5) * 0.5; sc.add(c); CG.crates.push(c); }
  cargoPics();
}
const cargoSlot = (k) => { const l = k % 6, h = Math.floor(k / 6); return [CARGO.pile.x - (l % 3) * 0.38 + h * 0.19, 0.16 + h * 0.31, CARGO.z + (l < 3 ? -0.2 : 0.2)]; };
/* the pictures over the stack: what is in it, with numbers */
function cargoPics() {
  const C = cargo(), ks = Object.keys(C.pile).filter((t) => C.pile[t] > 0), key = C.n ? ks.map((t) => t + C.pile[t]).join() : '';
  if (key === CG.picKey) return; CG.picKey = key; CG.pics.forEach((s) => { sc.remove(s); s.material.map.dispose(); }); CG.pics = [];
  if (!C.n) return;
  ks.forEach((t, k) => { const sp = new T.Sprite(new T.SpriteMaterial({ map: hamGiftTex(t, C.pile[t]), transparent: true, depthWrite: false })); sp.scale.set(1.2, 0.6, 1); sp.position.set(CARGO.pile.x - 0.35, 1.45 + k * 0.62, CARGO.z); sp.userData.y = 1.45 + k * 0.62; sc.add(sp); CG.pics.push(sp); });
}
/* a village's boat: the island boat with two crates aboard and one of the village's neighbours at the stern */
function cargoBoat(id) {
  const boat = new T.Group(); propBoat(boat); const roof = HAM_DEF[id].roof[0], c = [cargoCrate(1, roof), cargoCrate(2, roof)];
  c[0].position.set(-0.42, 0.02, 0); c[1].position.set(-0.1, 0.02, 0.05); c[1].rotation.y = 0.4; c.forEach((q) => boat.add(q));
  const f = guestModel2(HAM_DEF[id].kind); f.scale.setScalar(0.5); f.position.set(0.5, -0.05, 0); f.rotation.y = -Math.PI / 2; boat.add(f);
  const s = CG.lane.L; laneAt(CG.lane, s, LANE_P); boat.position.set(LANE_P.x, -0.08, LANE_P.z); boat.rotation.y = boatYaw(-LANE_P.dx, -LANE_P.dz); boat.scale.setScalar(0.01); sc.add(boat);
  CG.boat = { id, boat, c, f, s, t: 0, st: 'in', load: cargoLoad(id), hop: [] };
}
function cargoOpen() {
  const C = cargo(), x = CARGO.pile.x, z = CARGO.z; let k = 0;
  Object.keys(C.pile).forEach((t) => { const n = C.pile[t]; if (!(n > 0)) return; state.isle.store[t] = (state.isle.store[t] || 0) + n;
    const sp = new T.Sprite(new T.SpriteMaterial({ map: hamGiftTex(t, n), transparent: true, depthWrite: false })); sp.scale.set(1.5, 0.75, 1); sp.position.set(x, 1.5 + k * 0.8, z); sc.add(sp); FD.floats.push({ sp, t: 0, y: k * 0.8 }); k++; });
  CG.crates.forEach((c) => burst(c.position.x, c.position.y + 0.2, c.position.z, 3));
  C.pile = {}; C.n = 0; invDirty = true; Snd.play('success', { gain: 0.45 }); Snd.play('sparkle', { gain: 0.45 }); bldBadge(); save(); cargoPile();
}
function cargoStep(dt) {
  if (!state.isle || !CG.quay && !Object.keys(HAM_DEF).some((id) => mons()[id])) return;
  cargoQuay(); const C = cargo(), day = Math.floor(state.clock / DAY), pp = pip.position; if (C.day !== day) { C.day = day; C.sent = {}; }
  cargoPile();
  CG.pics.forEach((s, k) => { s.position.y = s.userData.y + (reduced ? 0 : Math.sin(time * 2.2 + k) * 0.05); });
  CG.quay.sp.position.y = 1.7 + (reduced ? 0 : Math.sin(time * 2) * 0.05);
  /* Pip walks into the stack */
  if (C.n && !enSleep && !inCave && Math.hypot(pp.x - (CARGO.pile.x - 0.38), pp.z - CARGO.z) < 0.75) cargoOpen();
  /* a boat sets out when one is due and the quay is free */
  if (!CG.boat) {
    if (enSleep || C.n + 2 > CARGO_MAX) return; const due = CARGO_AT.filter((f) => dayFrac() >= f).length;
    const ids = Object.keys(HAM_DEF).filter((id) => mons()[id] && (C.sent[id] || 0) < due).sort((a, b) => (C.sent[a] || 0) - (C.sent[b] || 0));
    if (ids.length) cargoBoat(ids[0]); return;
  }
  const B = CG.boat, boat = B.boat; B.t += dt; boat.position.y = -0.08 + (reduced ? 0 : Math.sin(time * 1.6) * 0.04); boat.rotation.x = reduced ? 0 : Math.sin(time * 1.2) * 0.03;
  if (B.st === 'in') { /* in along the lane from the west, slowing at the quay */
    boat.scale.setScalar(Math.min(1, 0.01 + B.t / 0.9)); const st = Math.min(B.s, Math.max(0.9, Math.min(3, B.s * 1.1)) * dt); B.s -= st; laneAt(CG.lane, B.s, LANE_P); boat.position.x = LANE_P.x; boat.position.z = LANE_P.z; boatTurn(boat, -LANE_P.dx, -LANE_P.dz, dt, 2.4);
    if (B.s <= 0.001) { B.st = 'unload'; B.t = 0; B.n = 0; if (cargoNear()) Snd.play('pop', { gain: 0.3, f: 420 }); } }
  else if (B.st === 'unload') { /* the crates hop off onto the stack, one by one */
    if (B.n < 2 && B.t > 0.5 + B.n * 0.55) { const c = B.c[B.n], w = c.getWorldPosition(new T.Vector3()); boat.remove(c); c.position.copy(w); c.rotation.y = 0; sc.add(c); B.hop.push({ c, a: w.clone(), b: new T.Vector3().fromArray(cargoSlot(Math.min(C.n + B.n, CARGO_MAX - 1))), t: 0 }); B.n++; }
    B.hop.forEach((H) => { if (H.t >= 1) return; H.t = Math.min(1, H.t + dt / 0.5); H.c.position.lerpVectors(H.a, H.b, H.t); H.c.position.y += Math.sin(H.t * Math.PI) * 0.9; H.c.rotation.y = H.t * 1.6;
      if (H.t >= 1 && cargoNear()) Snd.play('pop', { gain: 0.35, f: 520 + B.n * 60 }); });
    if (B.n >= 2 && B.hop.every((H) => H.t >= 1)) { /* on the quay: they count now */
      B.hop.forEach((H) => sc.remove(H.c)); B.hop = []; Object.keys(B.load).forEach((t) => { C.pile[t] = (C.pile[t] || 0) + B.load[t]; }); C.n = Math.min(CARGO_MAX, C.n + 2); C.sent[B.id] = (C.sent[B.id] || 0) + 1;
      save(); cargoPile(); if (cargoNear()) Snd.play('sparkle', { gain: 0.3 }); B.st = 'back'; B.t = 0; B.s = 0; } }
  else if (B.st === 'back') { /* backs out from the quay */
    B.s = Math.min(1.8, B.s + dt * 1.1); laneAt(CG.lane, B.s, LANE_P); boat.position.x = LANE_P.x; boat.position.z = LANE_P.z; if (B.s >= 1.8) { B.st = 'out'; B.t = 0; B.v = 0.4; } }
  else if (B.st === 'out') { /* turns round and sails home, fading into the sea at the end of the lane */
    const r = boat.rotation.y, al = Math.max(0, -Math.cos(r) * LANE_P.dx + Math.sin(r) * LANE_P.dz); B.v = Math.min(3, B.v + dt * 1.6 * (0.2 + 0.8 * al)); B.s += B.v * dt;
    laneAt(CG.lane, B.s, LANE_P); boat.position.x = LANE_P.x; boat.position.z = LANE_P.z; boatTurn(boat, LANE_P.dx, LANE_P.dz, dt, 2.0);
    boat.scale.setScalar(Math.max(0.01, Math.min(1, (CG.lane.L - B.s) / 2.5)));
    if (B.s >= CG.lane.L) { sc.remove(boat); CG.boat = null; } }
}
ISLE_STEPS.push(cargoStep);
