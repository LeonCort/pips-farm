/* ---------- island villages (Leon, 2026-11-25: "the unlocked villages produce the material") ----------
   A finished monument does more than open the travel mat: a small village moves in beside it. Three cottages, two
   neighbours and a crate. Every night the village gathers what its island grows, and in the morning it is in the camp's
   crate: a picture with a number floats up there, one per material. No machines, no queues, nothing to place: the thing
   that makes material is a village of friends. Nothing new is saved; a village stands wherever state.isle.mon has its
   monument, and the morning gift is worked out from that.
   meadow (windmill): ducks, berries and logs. stone (lighthouse): bears, stone and a crystal. winter (star tower):
   bunnies, logs and crystals. */
const HAM = { v: {}, pops: [], gifts: [], t: 0 };
const HAM_DEF = {
  windmill: { kind: 'duck', give: { berry: 10, log: 6 }, roof: ['#e0a53c', '#d1962f', '#eab552', '#c48a28'], wall: null },
  lighthouse: { kind: 'bear', give: { stone: 14, crystal: 1 }, roof: ['#6f7f94', '#62728a', '#7d8ca0', '#58677c'], wall: ['#bdb3a0', '#a9a08d', '#c9c0ae', '#9f9684'] },
  tower: { kind: 'bunny', give: { log: 14, crystal: 2 }, roof: ['#c9708a', '#b8617b', '#d68299', '#a85570'], wall: null }
};
/* the village sizes: 3, 5 and 7 cottages, 2, 3 and 4 neighbours, and one, two and three times the morning gift. A village
   grows when Pip brings it a gift of things that do not grow on its own island (its card, at the ring by its crate). */
BLD.ham_windmill = { max: 3, cost: [null, null, { stone: 24, copper: 4 }, { iron: 4, reed: 6, crystal: 6 }], pic: [null, 'hut', 'hut', 'hut'] };
BLD.ham_lighthouse = { max: 3, cost: [null, null, { honey: 4, berry: 30 }, { reed: 6, pearl: 3, log: 40 }], pic: [null, 'hut', 'hut', 'hut'] };
BLD.ham_tower = { max: 3, cost: [null, null, { reed: 6, berry: 30 }, { pearl: 4, ember: 2, stone: 40 }], pic: [null, 'hut', 'hut', 'hut'] };
const hamLv = (id) => bldLv('ham_' + id);
const hamHouses = (lv) => 1 + lv * 2, hamFolkN = (lv) => 1 + lv;
function hamNear(x, z, r) {
  return Object.keys(HAMLET_AT).some((id) => { const A = HAMLET_AT[id];
    return A.h.some((h) => Math.hypot(h[0] - x, h[1] - z) < r + 0.75) || Math.hypot(A.crate[0] - x, A.crate[1] - z) < r + 0.35; });
}
/* a small cottage: stone footing, board walls, a shingle roof in the village's colour, a door and a lit window */
function hamHouse(id, k) {
  const D = HAM_DEF[id], [x, z, rot] = HAMLET_AT[id].h[k], L = [], W = 1.45, Dp = 1.1, h = 0.78, y0 = 0.12, zf = Dp / 2, seed = 5200 + Object.keys(HAM_DEF).indexOf(id) * 300 + k * 90, look = k % 3;
  const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = rot; sc.add(g); let q;
  kitStone(L, W + 0.1, y0, Dp + 0.1, 0, 0, 0, seed, { ch: 0.12, bl: 0.28 });
  kitPlanks(L, W, h, Dp, y0, seed + 10, { cols: D.wall || undefined });
  kitRoof(L, W + 0.36, Dp + 0.46, y0 + h - 0.05, 0.7, seed + 20, { cols: D.roof });
  [-1, 0, 1].forEach((j) => { q = new T.BoxGeometry(0.12, 0.54, 0.04); q.translate(-0.32 + j * 0.126, y0 + 0.29, zf + 0.035); L.push(fac(q, (cx, cy) => shadeY('#8a4a32', cy, 0, 1.0, j, 0.5), seed + 40 + j)); });
  q = new T.BoxGeometry(0.46, 0.05, 0.07); q.translate(-0.32, y0 + 0.59, zf + 0.04); L.push(fac(q, () => new T.Color('#6e4426'), seed + 44));
  [[0.36, 0.62, 0.4, 0.05], [0.36, 0.32, 0.4, 0.05], [0.18, 0.47, 0.05, 0.34], [0.54, 0.47, 0.05, 0.34]].forEach(([wx, wy, ww, wh], j) => { q = new T.BoxGeometry(ww, wh, 0.05); q.translate(wx, y0 + wy, zf + 0.04); L.push(fac(q, () => new T.Color('#f4ecd8'), seed + 50 + j)); });
  /* a chimney on one, a wood pile or a barrel by the others, so the three do not look stamped */
  if (look === 0) { q = new T.BoxGeometry(0.22, 0.5, 0.22); q.translate(0.42, y0 + h + 0.5, -0.12); L.push(fac(q, (cx, cy, cz, i) => tone('#a9a08d', i, 0.4), seed + 60)); }
  if (look === 1) for (let j = 0; j < 4; j++) { q = new T.CylinderGeometry(0.08, 0.08, 0.5, 7); q.rotateZ(Math.PI / 2); q.translate(0.95, 0.09 + (j > 1 ? 0.15 : 0), zf - 0.2 - (j % 2) * 0.17 - (j > 1 ? 0.08 : 0)); L.push(fac(q, (cx, cy, cz, i) => tone('#a8774f', i + j, 0.4), seed + 62 + j)); }
  if (look === 2) { q = new T.CylinderGeometry(0.17, 0.15, 0.36, 10); q.translate(-0.95, 0.18, zf - 0.1); L.push(fac(q, (cx, cy, cz, i) => tone('#a8714d', i, 0.4), seed + 70)); }
  merged(L, MAT, g);
  const w = new T.Mesh(new T.PlaneGeometry(0.34, 0.26), new T.MeshBasicMaterial({ color: '#ffe07a' })); w.position.set(0.36, y0 + 0.47, zf + 0.03); g.add(w);
  lookFoot(x, z, 0.85, 0.7); return g;
}
/* the village crate: a wide box with what the village gathers piled on top, and the pictures floating over it */
function hamCrate(id) {
  const D = HAM_DEF[id], [x, z] = HAMLET_AT[id].crate, g = new T.Group(), L = []; g.position.set(x, 0, z); sc.add(g); let q;
  q = new T.BoxGeometry(0.72, 0.36, 0.52); q.translate(0, 0.18, 0); L.push(fac(q, (cx, cy, cz, i) => shadeY(tone('#b9824c', i, 0.25).getStyle(), cy, 0, 0.4, i, 0.35), 5900));
  [[-0.3, 0.26], [0.3, 0.26], [-0.3, -0.26], [0.3, -0.26]].forEach(([dx, dz], j) => { q = new T.BoxGeometry(0.07, 0.42, 0.07); q.translate(dx + Math.sign(dx) * 0.04, 0.21, dz); L.push(fac(q, () => new T.Color('#8a5f3c'), 5901 + j)); });
  merged(L, MAT, g);
  const kinds = Object.keys(D.give); let n = 0;
  kinds.forEach((t, ti) => { for (let j = 0; j < (ti ? 2 : 4); j++) { const m = itemModel(t); m.position.set(-0.22 + (n % 3) * 0.22, 0.42 + Math.floor(n / 3) * 0.13, (n % 2 ? 0.1 : -0.1)); m.rotation.y = n * 1.3; g.add(m); n++; } });
  const pics = kinds.map((t, ti) => { const sp = isleSprite(isleBubble(t), 0.62); sp.position.set(x + (ti - (kinds.length - 1) / 2) * 0.66, 1.55, z); sc.add(sp); return sp; });
  lookFoot(x, z, 0.55, 0.45); return { g, pics };
}
function hamFolk(id, k) {
  const D = HAM_DEF[id], A = HAMLET_AT[id], V = HAM.v[id], g = new T.Group(), b = guestModel2(D.kind); b.scale.setScalar(1.15); g.add(b); sc.add(g);
  const h = A.h[[0, 1, 3, 5][k]], door = [h[0] + Math.sin(h[2]) * 1.05, h[1] + Math.cos(h[2]) * 1.05], by = [A.crate[0] + [-0.75, 0.75, 0.2, -0.3][k], A.crate[1] + [0.35, 0.35, -0.75, -0.8][k]];
  V.folk.push({ g, a: k ? door : by, b: by, u: k ? 0 : 1, dir: 1, rest: k ? k * 1.7 : 1e9, k }); g.position.set(k ? door[0] : by[0], 0, k ? door[1] : by[1]); return g;
}
/* a lantern post, and for the biggest village a flag in the roof colour: what a bigger village has besides more houses */
function hamLamp(x, z, seed) {
  const g = new T.Group(); g.position.set(x, 0, z); sc.add(g); const L = []; let q; nightLamp(x, z, 3.4);
  q = new T.CylinderGeometry(0.045, 0.06, 1.25, 6); q.translate(0, 0.62, 0); L.push(fac(q, (cx, cy, cz, i) => tone('#6e4426', i, 0.3), seed));
  q = new T.BoxGeometry(0.3, 0.05, 0.3); q.translate(0, 1.27, 0); L.push(fac(q, () => new T.Color('#4a4f57'), seed + 1));
  q = new T.ConeGeometry(0.22, 0.16, 4); q.rotateY(Math.PI / 4); q.translate(0, 1.6, 0); L.push(fac(q, () => new T.Color('#4a4f57'), seed + 2));
  merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g);
  const w = new T.Mesh(new T.BoxGeometry(0.2, 0.24, 0.2), new T.MeshBasicMaterial({ color: '#ffe07a' })); w.position.y = 1.41; g.add(w); return g;
}
function hamFlag(id, x, z) {
  const g = new T.Group(); g.position.set(x, 0, z); sc.add(g); const L = [], D = HAM_DEF[id]; let q;
  q = new T.CylinderGeometry(0.04, 0.055, 2.6, 6); q.translate(0, 1.3, 0); L.push(fac(q, (cx, cy, cz, i) => tone('#8a5f3c', i, 0.3), 5990));
  q = new T.SphereGeometry(0.08, 8, 6); q.translate(0, 2.64, 0); L.push(fac(q, () => new T.Color('#f4c542'), 5991));
  q = new T.BoxGeometry(0.72, 0.42, 0.03); q.translate(0.4, 2.3, 0); L.push(fac(q, (cx) => new T.Color(cx > 0.4 ? D.roof[2] : D.roof[0]), 5992));
  merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g); return g;
}
function hamExtras(id, lv) {
  const A = HAMLET_AT[id], V = HAM.v[id], c = A.crate, made = [], have = V.extras.length;
  const want = lv >= 3 ? 5 : lv >= 2 ? 2 : 0, at = [[-1.25, 0.2], [1.25, 0.2], [-1.3, 1.9], [1.3, 1.9]];
  for (let k = have; k < Math.min(want, 4); k++) { const g = hamLamp(c[0] + at[k][0], c[1] + at[k][1], 5950 + k * 5); V.extras.push(g); made.push(g); }
  if (want >= 5 && have < 5) { const g = hamFlag(id, c[0], c[1] - 0.75); V.extras.push(g); made.push(g); }
  return made;
}
/* the village got its gift: the new cottages, a new neighbour, lanterns (and the flag) pop up one by one */
function hamGrow(id) {
  const V = HAM.v[id]; if (!V) return; const lv = hamLv(id), parts = [];
  for (let k = V.houses.length; k < hamHouses(lv); k++) { const g = hamHouse(id, k); V.houses.push(g); parts.push(g); }
  for (let k = V.folk.length; k < hamFolkN(lv); k++) parts.push(hamFolk(id, k));
  hamExtras(id, lv).forEach((g) => parts.push(g));
  parts.forEach((g, n) => { g.visible = false; HAM.pops.push({ g, t: -0.5 - n * 0.5, id, last: false }); });
  const c = HAMLET_AT[id].crate; burst(c[0], 1.0, c[1], 12); save();
}
/* the card's "now -> then": the morning gift before and after */
function hamHow(id, lv, next) {
  const c = document.createElement('canvas'); c.width = 400; c.height = 128; const x = c.getContext('2d'); x.lineJoin = x.lineCap = 'round';
  x.beginPath(); x.moveTo(178, 64); x.lineTo(214, 64); x.moveTo(202, 50); x.lineTo(218, 64); x.lineTo(202, 78); x.lineWidth = 9; x.strokeStyle = '#6e4426'; x.stroke();
  const G = HAM_DEF[id].give; x.font = '700 40px Fredoka, sans-serif'; x.textAlign = 'left'; x.textBaseline = 'middle';
  Object.keys(G).forEach((t, k) => { const y = 36 + k * 56; isleIcon(x, t, 40, y, 1.15); x.fillStyle = '#22303c'; x.fillText('+' + G[t] * lv, 70, y + 2); isleIcon(x, t, 262, y, 1.15); x.fillStyle = '#3f8a3a'; x.fillText('+' + G[t] * next, 292, y + 2); });
  return c;
}
function hamMake(id, anim) {
  if (HAM.v[id]) return; const D = HAM_DEF[id], A = HAMLET_AT[id], V = HAM.v[id] = { id, houses: [], folk: [] };
  const lv = hamLv(id); V.extras = [];
  for (let k = 0; k < hamHouses(lv); k++) V.houses.push(hamHouse(id, k));
  V.crate = hamCrate(id);
  /* the neighbours: one keeps the crate, the others walk between a door and the crate */
  for (let k = 0; k < hamFolkN(lv); k++) hamFolk(id, k);
  hamExtras(id, lv);
  if (anim) { const parts = V.houses.concat([V.crate.g], V.folk.map((f) => f.g), V.extras); V.crate.pics.forEach((p) => { p.visible = false; });
    parts.forEach((g, n) => { g.visible = false; HAM.pops.push({ g, t: -1.6 - n * 0.55, id, last: n === parts.length - 1 }); }); }
}
function hamSync(anim) { Object.keys(HAM_DEF).forEach((id) => { if (mons()[id] && !HAM.v[id]) hamMake(id, anim); }); }
/* the morning gift: straight into the camp's crate, with a picture and a number floating up beside it */
function hamGiftTex(t, n) {
  const c = document.createElement('canvas'); c.width = 224; c.height = 112; const x = c.getContext('2d');
  x.beginPath(); x.roundRect(5, 9, 214, 92, 46); x.fillStyle = '#fff6e4'; x.fill(); x.lineWidth = 6; x.strokeStyle = '#6e4426'; x.stroke();
  isleIcon(x, t, 56, 55, 1.5);
  x.font = '700 50px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#22303c'; x.fillText('+' + n, 146, 58);
  return new T.CanvasTexture(c);
}
/* the morning gift now comes as a present box by the camp (gifts.js) */
function hamWake() {}
function hamStep(dt) {
  HAM.t -= dt; if (HAM.t <= 0) { HAM.t = 0.6; hamSync(true); }
  for (let k = HAM.pops.length - 1; k >= 0; k--) { const p = HAM.pops[k]; p.t += dt; if (p.t < 0) continue;
    if (!p.g.visible) { p.g.visible = true; burst(p.g.position.x, 1.2, p.g.position.z, 8); Snd.play('pop', { gain: 0.4, f: 520 + k * 40 }); if (p.last) { Snd.play('success', { gain: 0.4, f: 'E6' }); spotSync(); HAM.v[p.id].crate.pics.forEach((q) => { q.visible = true; }); } }
    const u = Math.min(1, p.t / 0.5), s = u < 0.7 ? u / 0.7 * 1.1 : 1.1 - (u - 0.7) / 0.3 * 0.1; p.g.scale.setScalar(Math.max(0.01, s)); if (u >= 1) { p.g.scale.setScalar(1); HAM.pops.splice(k, 1); } }
  for (let k = HAM.gifts.length - 1; k >= 0; k--) { const G = HAM.gifts[k]; G.t += dt; if (G.t < 0) continue;
    if (!G.sp.visible) { G.sp.visible = true; Snd.play('pop', { gain: 0.35, f: 700 }); burst(STORE.x, 0.9, STORE.z, 4); }
    G.sp.position.y = 1.9 + Math.min(1, G.t / 0.5) * 0.7 + G.t * 0.12; G.sp.material.opacity = G.t > 2.2 ? Math.max(0, 1 - (G.t - 2.2) * 2.5) : 1;
    if (G.t > 2.6) { sc.remove(G.sp); G.sp.material.map.dispose(); HAM.gifts.splice(k, 1); } }
  const pp = pip.position;
  Object.keys(HAM.v).forEach((id) => { const V = HAM.v[id], A = HAMLET_AT[id];
    V.crate.pics.forEach((sp, k) => { sp.position.y = 1.55 + (reduced ? 0 : Math.sin(time * 2 + k * 1.7) * 0.06); });
    V.folk.forEach((F) => { const g = F.g; if (!g.visible) return;
      const d = Math.hypot(pp.x - g.position.x, pp.z - g.position.z); let face;
      if (F.rest > 0) { F.rest -= dt; face = d < 3.5 ? Math.atan2(pp.x - g.position.x, pp.z - g.position.z) : (F.k ? null : 0); g.position.y = 0; }
      else { F.u += F.dir * dt / 7; if (F.u >= 1 || F.u <= 0) { F.u = Math.max(0, Math.min(1, F.u)); F.dir = -F.dir; F.rest = 3 + (F.u ? 2 : 0); }
        const x = F.a[0] + (F.b[0] - F.a[0]) * F.u, z = F.a[1] + (F.b[1] - F.a[1]) * F.u; face = Math.atan2((F.b[0] - F.a[0]) * F.dir, (F.b[1] - F.a[1]) * F.dir);
        g.position.set(x, reduced ? 0 : Math.abs(Math.sin(time * 7)) * 0.05, z); }
      if (face != null) { let df = face - g.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); g.rotation.y += df * Math.min(1, dt * 5); }
      if (d < 0.45 && d > 1e-4) { pp.x = g.position.x + (pp.x - g.position.x) / d * 0.45; pp.z = g.position.z + (pp.z - g.position.z) / d * 0.45; } });
    /* cottages and the crate are solid */
    A.h.slice(0, V.houses.length).forEach((h) => { const dx = pp.x - h[0], dz = pp.z - h[1], d = Math.hypot(dx, dz); if (d < 0.95 && d > 1e-4) { pp.x = h[0] + dx / d * 0.95; pp.z = h[1] + dz / d * 0.95; } });
    const dx = pp.x - A.crate[0], dz = pp.z - A.crate[1], d = Math.hypot(dx, dz); if (d < 0.55 && d > 1e-4) { pp.x = A.crate[0] + dx / d * 0.55; pp.z = A.crate[1] + dz / d * 0.55; } });
}
