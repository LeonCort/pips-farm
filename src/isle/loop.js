/* ---------- the island loop (Leon, 2026-11-25: "finish the game loop") ----------
   Every island has a friend to rescue, a monument that completes it, and a key that opens the next island:
   - home: the smith (h3 cottage) -> her forge gives a ROPE, which the bridge to the meadow needs; monument: the HARBOUR.
   - meadow: the baker (m2 cottage) -> her oven gives a MAP, which the bridge to the stone island needs; monument: the WINDMILL.
   - stone: the mason, a fox in the s1 cottage, wants stones -> his house gives an ICE PICK for the bridge to the winter island;
     monument: the LIGHTHOUSE.
   - winter: the knitter, a bunny in the w1 cottage, wants berries and crystals; monument: the STAR TOWER.
   - the cave: the miner, a frog with a helmet lamp, sits lost by a lantern down there and wants crystals.
   The three new friends move into houses on the street north of the village green once Pip pays their request; a dashed
   plot then takes logs and stones for the house. A monument's sign shows up once the island's friend has moved home and
   Pip owns the monument's square. Each finished monument has a travel mat: stand on it and pick a picture to hop to
   the camp or any other finished island (the camp's own mat stands by the fire). With every friend home and every
   monument up, the village throws a party: fireworks over the green, and a big gold star card. No words anywhere.
   state.isle.folk.<id>: 0 not found, 1 found (wants their request), 2 moved home (house plot), 3 house built.
   state.isle.mon.<id>: 1 built. state.isle.keys.<k>: 1 held, 2 used. state.isle.done: 1 after the party. */
const LP = { folk: {}, mon: {}, mats: [], lockSp: {}, keyEl: null, trv: null, fade: null, hop: null, fw: [], partyT: 0, armed: {} };
const LOOP_KEY = { m0: 'rope', s0: 'map', w0: 'icepick' }; /* the bridge that needs it */
const LOOP_FOLK = {
  mason: { kind: 'fox', ruin: 's1', want: { stone: 20, log: 10 }, house: { log: 22, stone: 16 }, key: 'icepick', roof: ['#6f7f94', '#62728a', '#7d8ca0', '#58677c'], badge: 'chisel' },
  knitter: { kind: 'bunny', ruin: 'w1', want: { berry: 16, crystal: 3 }, house: { log: 26, stone: 16 }, roof: ['#c9708a', '#b8617b', '#d68299', '#a85570'], badge: 'yarn' },
  miner: { kind: 'frog', cave: 1, want: { crystal: 8 }, house: { log: 26, stone: 20 }, roof: ['#6f8f4a', '#638240', '#7d9c56', '#577238'], badge: 'crystal' }
};
const LOOP_MON = {
  harbor: { isle: 'home', need: () => ['h0', 'h1', 'h2', 'h3'].every((a) => HAS[a]) && (folk().smith || 0) >= 3, area: 'h2', cost: { log: 30, stone: 20 } },
  windmill: { isle: 'meadow', need: () => HAS.m3 && (folk().baker || 0) >= 2, area: 'm3', cost: { log: 40, berry: 20, stone: 15 } },
  lighthouse: { isle: 'stone', need: () => HAS.s2 && (folk().mason || 0) >= 2, area: 's2', cost: { stone: 50, log: 20, crystal: 6 } },
  tower: { isle: 'winter', need: () => HAS.w1 && (folk().knitter || 0) >= 2, area: 'w1', cost: { crystal: 15, stone: 30, log: 30 } }
};
const ISLE_OF = (id) => (!id ? null : id === 'cave' ? 'cave' : { h: 'home', m: 'meadow', s: 'stone', w: 'winter' }[id[0]]);
const ISLE_PIC = { home: 'camp', meadow: 'windmill', stone: 'lighthouse', winter: 'tower' };
const ISLE_MON = { meadow: 'windmill', stone: 'lighthouse', winter: 'tower', home: 'harbor' };
const lkeys = () => state.isle.keys || (state.isle.keys = {});
const mons = () => state.isle.mon || (state.isle.mon = {});

/* ---- pictures ---- */
function loopIcon(x, t) {
  const blob = (f) => { x.fillStyle = f; x.fill(); x.stroke(); };
  if (t === 'rope') { x.lineWidth = 7; x.strokeStyle = PAL.ink; for (let k = 0; k < 3; k++) { x.beginPath(); x.ellipse(0, 4 - k * 6, 18 - k * 2, 9 - k, 0, 0, 7); x.stroke(); }
    x.lineWidth = 4; x.strokeStyle = '#e0bf86'; for (let k = 0; k < 3; k++) { x.beginPath(); x.ellipse(0, 4 - k * 6, 18 - k * 2, 9 - k, 0, 0, 7); x.stroke(); }
    x.lineWidth = 3; x.strokeStyle = PAL.ink; x.beginPath(); x.moveTo(16, 4); x.quadraticCurveTo(24, 14, 18, 20); x.stroke(); }
  else if (t === 'map') { x.beginPath(); x.moveTo(-20, -14); x.lineTo(-7, -18); x.lineTo(7, -14); x.lineTo(20, -18); x.lineTo(20, 14); x.lineTo(7, 18); x.lineTo(-7, 14); x.lineTo(-20, 18); x.closePath(); blob('#f3e2b8');
    x.lineWidth = 2; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(-14, 10); x.quadraticCurveTo(-4, -6, 8, 2); x.stroke(); x.setLineDash([]);
    x.lineWidth = 3.5; x.strokeStyle = '#d6406a'; x.beginPath(); x.moveTo(8, -8); x.lineTo(16, 0); x.moveTo(16, -8); x.lineTo(8, 0); x.stroke(); }
  else if (t === 'icepick') { x.beginPath(); x.roundRect(-3, -6, 6, 28, 3); blob('#a8774f'); x.beginPath(); x.moveTo(-22, -12); x.quadraticCurveTo(0, -24, 22, -12); x.lineTo(18, -8); x.quadraticCurveTo(0, -16, -18, -8); x.closePath(); blob('#7fd3ef');
    x.fillStyle = '#e9fbff'; x.beginPath(); x.arc(-8, -14, 2.4, 0, 7); x.fill(); }
  else if (t === 'chisel') { x.beginPath(); x.roundRect(-4, -20, 8, 20, 3); blob('#a8774f'); x.beginPath(); x.moveTo(-5, 0); x.lineTo(5, 0); x.lineTo(3, 18); x.lineTo(-3, 18); x.closePath(); blob('#a9b2bb'); }
  else if (t === 'yarn') { x.beginPath(); x.arc(0, 0, 17, 0, 7); blob('#e9849e'); x.lineWidth = 2; x.strokeStyle = '#b8617b'; [-8, 0, 8].forEach((q) => { x.beginPath(); x.ellipse(q * 0.5, 0, 6, 15, q * 0.06, 0, 7); x.stroke(); });
    x.lineWidth = 3; x.strokeStyle = PAL.ink; x.beginPath(); x.moveTo(14, 8); x.quadraticCurveTo(24, 18, 16, 22); x.stroke(); }
  else if (t === 'windmill') { x.beginPath(); x.moveTo(-10, 20); x.lineTo(-7, -6); x.lineTo(7, -6); x.lineTo(10, 20); x.closePath(); blob('#e7d3ae'); x.beginPath(); x.moveTo(-10, -6); x.lineTo(0, -15); x.lineTo(10, -6); x.closePath(); blob('#b5562f');
    x.save(); x.translate(0, -8); [0.4, 2.0, 3.55, 5.1].forEach((a) => { x.save(); x.rotate(a); x.beginPath(); x.rect(2, -3.5, 19, 7); blob('#fff6e4'); x.restore(); }); x.beginPath(); x.arc(0, 0, 3, 0, 7); blob('#6e4426'); x.restore(); }
  else if (t === 'lighthouse') { x.beginPath(); x.moveTo(-9, 21); x.lineTo(-6, -8); x.lineTo(6, -8); x.lineTo(9, 21); x.closePath(); blob('#fff6e4');
    x.fillStyle = '#d9573f'; [[-8.3, 12, 16.6], [-7.2, 2, 14.4]].forEach(([a, b, w]) => { x.fillRect(a, b, w, 5); }); x.beginPath(); x.rect(-7, -16, 14, 8); blob('#ffe07a'); x.beginPath(); x.moveTo(-9, -16); x.lineTo(0, -23); x.lineTo(9, -16); x.closePath(); blob('#d9573f'); }
  else if (t === 'tower') { x.beginPath(); x.rect(-7, -4, 14, 24); blob('#c9d6e6'); x.beginPath(); x.moveTo(0, -24); x.lineTo(5, -14); x.lineTo(15, -12); x.lineTo(7, -5); x.lineTo(9, 5); x.lineTo(0, 0); x.lineTo(-9, 5); x.lineTo(-7, -5); x.lineTo(-15, -12); x.lineTo(-5, -14); x.closePath(); blob('#7fd3ef'); }
  else if (t === 'harbor') { x.beginPath(); x.rect(-22, 4, 30, 6); blob('#b9824c'); [-18, -6, 4].forEach((q) => { x.beginPath(); x.rect(q, 10, 4, 10); blob('#8a5f3c'); });
    x.beginPath(); x.moveTo(6, 8); x.quadraticCurveTo(15, 18, 24, 8); x.closePath(); blob('#d9573f'); x.beginPath(); x.moveTo(14, 7); x.lineTo(14, -18); x.lineTo(24, 4); x.closePath(); blob('#fff6e4'); x.beginPath(); x.moveTo(-26, 20); x.quadraticCurveTo(0, 14, 26, 20); x.strokeStyle = '#5aa7d6'; x.stroke(); }
  else if (t === 'camp') { x.beginPath(); x.moveTo(-20, 16); x.lineTo(-4, -16); x.lineTo(12, 16); x.closePath(); blob('#ee7a5a'); x.beginPath(); x.moveTo(-8, 16); x.lineTo(-4, 4); x.lineTo(0, 16); x.closePath(); blob('#4a3326');
    x.beginPath(); x.moveTo(13, 16); x.quadraticCurveTo(17, 2, 20, 8); x.quadraticCurveTo(24, 0, 25, 16); x.closePath(); blob('#ffb23c'); }
  else if (t === 'travel') { x.beginPath(); x.moveTo(-20, 4); x.quadraticCurveTo(0, 22, 20, 4); x.closePath(); blob('#d9573f'); x.beginPath(); x.moveTo(0, 2); x.lineTo(0, -22); x.lineTo(16, 0); x.closePath(); blob('#fff6e4');
    x.lineWidth = 2.5; x.strokeStyle = '#5aa7d6'; x.beginPath(); x.moveTo(-24, 16); x.quadraticCurveTo(-12, 10, 0, 16); x.quadraticCurveTo(12, 22, 24, 16); x.stroke(); }
  else if (t === 'lock') { x.beginPath(); x.roundRect(-14, -2, 28, 22, 5); blob('#b9b0a0'); x.lineWidth = 5; x.beginPath(); x.arc(0, -4, 9, Math.PI, 0); x.stroke(); x.lineWidth = 3; x.fillStyle = PAL.ink; x.beginPath(); x.arc(0, 8, 3.4, 0, 7); x.fill(); }
  else if (t === 'star') { x.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 9 : 21; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); blob('#f6d24a'); }
  else return false;
  return true;
}
/* a bubble with a padlock in the corner: "you need this first" */
const lockBub = {};
function loopLockBubble(k) {
  if (lockBub[k]) return lockBub[k];
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.beginPath(); x.arc(64, 60, 50, 0, 7); x.fillStyle = '#fff6e4'; x.fill(); x.lineWidth = 5; x.strokeStyle = '#6e4426'; x.stroke();
  x.beginPath(); x.moveTo(52, 106); x.lineTo(64, 122); x.lineTo(76, 106); x.fillStyle = '#fff6e4'; x.fill();
  isleIcon(x, k, 60, 58, 1.5); isleIcon(x, 'lock', 96, 92, 0.85);
  return (lockBub[k] = new T.CanvasTexture(c));
}

/* ---- the three new friends ---- */
function loopFolkModel(id) {
  const D = LOOP_FOLK[id], g = new T.Group(), body = guestModel2(D.kind); body.scale.setScalar(1.3); g.add(body); const L = [];
  let q;
  if (id === 'mason') { q = new T.CylinderGeometry(0.2, 0.25, 0.42, 12, 1, true, -1.1, 2.2); q.translate(0, 0.38, 0.03); L.push(fac(q, (cx, cy, cz, i) => shadeY('#7d8791', cy, 0.15, 0.6, i, 0.4), 4100));
    q = new T.CylinderGeometry(0.15, 0.15, 0.05, 12); q.translate(0, 1.08, 0); L.push(fac(q, () => new T.Color('#e8dcc0'), 4101)); q = new T.SphereGeometry(0.13, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2); q.translate(0, 1.08, 0); L.push(fac(q, () => new T.Color('#e8dcc0'), 4102)); }
  if (id === 'knitter') { q = new T.TorusGeometry(0.15, 0.05, 6, 14); q.rotateX(Math.PI / 2); q.translate(0, 0.62, 0); L.push(fac(q, (cx, cy, cz, i) => new T.Color(i % 4 < 2 ? '#e9849e' : '#fff6e4'), 4110));
    q = new T.BoxGeometry(0.08, 0.22, 0.04); q.translate(0.1, 0.5, 0.17); L.push(fac(q, (cx, cy, cz, i) => new T.Color(i % 4 < 2 ? '#e9849e' : '#fff6e4'), 4111)); }
  if (id === 'miner') { q = new T.SphereGeometry(0.2, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2); q.scale(1, 0.7, 1); q.translate(0, 0.86, 0); L.push(fac(q, () => new T.Color('#f2c23c'), 4120));
    q = new T.CylinderGeometry(0.24, 0.24, 0.025, 16); q.translate(0, 0.86, 0); L.push(fac(q, () => new T.Color('#d9a520'), 4121)); }
  const ap = new T.Group(); ap.scale.setScalar(1.3); if (L.length) merged(L, MAT, ap); g.add(ap);
  if (id === 'miner') { const lamp = new T.Mesh(new T.SphereGeometry(0.05, 8, 6), new T.MeshBasicMaterial({ color: '#fff3c4' })); lamp.position.set(0, 1.2, 0.2); g.add(lamp); }
  sc.add(g); return g;
}
const loopF = (id) => folk()[id] || 0;
function loopSpot(id) {
  const D = LOOP_FOLK[id], F = loopF(id), H = HOUSES[id];
  if (F <= 1) { if (D.cave) return [CAVE_FRIEND.x, CAVE_FRIEND.z];
    const R = ruins.find((r) => r.A.id === D.ruin); if (R) { const c = Math.cos(R.rot), s = Math.sin(R.rot); return [R.x + s * 1.75 + c * 0.95, R.z + c * 1.75 - s * 0.95]; } return [0, 0]; }
  if (!HAS.h1) { LP.folk[id].away = 1; return [-1.2 + Object.keys(LOOP_FOLK).indexOf(id) * 0.7, 1.9]; } /* the street is still under the sea: wait by the fire */
  LP.folk[id].away = 0; return [H.x + 0.95, H.z + 1.45];
}
function loopPlace(id) { const P = LP.folk[id], [x, z] = loopSpot(id); P.g.position.set(x, 0, z); P.g.rotation.y = 0; }
/* a friend's own house: board walls, a shingle roof in their colour, a door, a window with flowers */
function loopHouse(id, anim) {
  const P = LP.folk[id]; if (P.house) return; const D = LOOP_FOLK[id], H = HOUSES[id], L = [], W = 1.8, Dp = 1.3, h = 0.9, y0 = 0.14, zf = Dp / 2, seed = 4200 + Object.keys(LOOP_FOLK).indexOf(id) * 100;
  const g = new T.Group(); g.position.set(H.x, 0, H.z); sc.add(g); let q;
  kitStone(L, W + 0.12, y0, Dp + 0.12, 0, 0, 0, seed, { ch: 0.14, bl: 0.3 });
  kitPlanks(L, W, h, Dp, y0, seed + 10, { cols: id === 'mason' ? ['#bdb3a0', '#a9a08d', '#c9c0ae', '#9f9684'] : undefined });
  kitRoof(L, W + 0.4, Dp + 0.5, y0 + h - 0.05, 0.8, seed + 20, { cols: D.roof });
  [-1, 0, 1].forEach((k) => { q = new T.BoxGeometry(0.13, 0.62, 0.04); q.translate(-0.4 + k * 0.136, y0 + 0.33, zf + 0.035); L.push(fac(q, (cx, cy) => shadeY('#8a4a32', cy, 0, 1.1, k, 0.5), seed + 40 + k)); });
  q = new T.BoxGeometry(0.5, 0.06, 0.07); q.translate(-0.4, y0 + 0.68, zf + 0.04); L.push(fac(q, () => new T.Color('#6e4426'), seed + 44));
  [[0.45, 0.74, 0.46, 0.05], [0.45, 0.38, 0.46, 0.05], [0.24, 0.56, 0.05, 0.4], [0.66, 0.56, 0.05, 0.4], [0.45, 0.56, 0.03, 0.34]].forEach(([x, y, w, hh], k) => { q = new T.BoxGeometry(w, hh, 0.05); q.translate(x, y0 + y, zf + 0.04); L.push(fac(q, () => new T.Color('#f4ecd8'), seed + 50 + k)); });
  q = new T.BoxGeometry(0.52, 0.1, 0.12); q.translate(0.45, y0 + 0.29, zf + 0.09); L.push(fac(q, () => new T.Color('#8a5f3c'), seed + 60));
  for (let k = 0; k < 5; k++) { q = ico(0.045, 0, seed + 61 + k); q.translate(0.27 + k * 0.09, y0 + 0.38, zf + 0.1); L.push(fac(q, () => new T.Color(['#ffffff', '#f6d24a', '#f29ab8', '#e9684a'][k % 4]), seed + 61 + k)); }
  q = ico(0.28, 1, seed + 70, 0.02); q.scale(1, 0.12, 0.7); q.translate(-0.4, 0.03, zf + 0.4); L.push(fac(q, () => new T.Color('#b3b9bf'), seed + 70));
  /* what they do, out front: a stone block with a chisel, a basket of yarn, a cart of crystals */
  if (id === 'mason') { q = new T.BoxGeometry(0.42, 0.34, 0.36); q.translate(-1.25, 0.17, 0.5); L.push(fac(q, (cx, cy) => shadeY('#bdb3a0', cy, 0, 0.5, 3, 0.4), seed + 80)); q = new T.BoxGeometry(0.3, 0.2, 0.3); q.rotateY(0.4); q.translate(-1.2, 0.44, 0.52); L.push(fac(q, () => new T.Color('#c9c0ae'), seed + 81)); }
  if (id === 'knitter') { q = new T.CylinderGeometry(0.22, 0.17, 0.2, 12); q.translate(-1.2, 0.1, 0.55); L.push(fac(q, (cx, cy, cz, i) => tone('#c99158', i, 0.4), seed + 80)); [[-1.27, 0.55, '#e9849e'], [-1.12, 0.5, '#7fbfe0'], [-1.2, 0.64, '#f6d24a']].forEach(([x, z, c], k) => { q = ico(0.09, 1, seed + 82 + k); q.translate(x, 0.24, z); L.push(fac(q, () => new T.Color(c), seed + 82 + k)); }); }
  if (id === 'miner') { q = new T.BoxGeometry(0.5, 0.22, 0.36); q.translate(-1.25, 0.24, 0.5); L.push(fac(q, (cx, cy, cz, i) => tone('#8a5f3c', i, 0.4), seed + 80)); [-0.18, 0.18].forEach((dx, k) => { q = new T.CylinderGeometry(0.11, 0.11, 0.05, 10); q.rotateX(Math.PI / 2); q.translate(-1.25 + dx, 0.11, 0.7); L.push(fac(q, () => new T.Color('#4a3a2e'), seed + 84 + k)); });
    for (let k = 0; k < 4; k++) { q = new T.OctahedronGeometry(0.08, 0); q.scale(1, 1.6, 1); q.translate(-1.4 + k * 0.1, 0.44, 0.5); L.push(fac(q, () => new T.Color(k % 2 ? '#9f7ff0' : '#7fd3ef'), seed + 86 + k)); } }
  merged(L, MAT, g);
  const w = new T.Mesh(new T.PlaneGeometry(0.4, 0.32), new T.MeshBasicMaterial({ color: '#ffe07a' })); w.position.set(0.45, y0 + 0.56, zf + 0.03); g.add(w);
  P.house = g; lookFoot(H.x, H.z, 1.0, 0.75); if (anim) { g.scale.setScalar(0.01); P.pop2 = 0.001; burst(H.x, 1.3, H.z, 12); }
}

/* ---- the monuments ---- */
function monMake(id, anim) {
  if (LP.mon[id]) return; const S = LOOP_SITES[id], g = new T.Group(); g.position.set(S.x, 0, S.z); sc.add(g); const L = []; let q;
  const M = { g, id, spin: null, beam: null };
  if (id === 'windmill') {
    kitStone(L, 1.9, 0.5, 1.9, 0, 0, 0, 4400, { ch: 0.17, bl: 0.32 });
    q = new T.CylinderGeometry(0.72, 0.95, 2.6, 8, 4); q.translate(0, 1.8, 0); L.push(fac(q, (cx, cy, cz, i) => shadeY(Math.floor((Math.atan2(cz, cx) + 3.2) / 0.785) % 2 ? '#e7d3ae' : '#d9c39a', cy, 0.3, 3.4, i, 0.35), 4401));
    for (let k = 0; k < 5; k++) { q = new T.TorusGeometry(0.97 - k * 0.055, 0.03, 4, 8); q.rotateX(Math.PI / 2); q.rotateY(Math.PI / 8); q.translate(0, 0.55 + k * 0.62, 0); L.push(fac(q, () => new T.Color('#8a5f3c'), 4402 + k)); }
    q = new T.ConeGeometry(0.98, 1.0, 8); q.rotateY(Math.PI / 8); q.translate(0, 3.6, 0); L.push(fac(q, (cx, cy, cz, i) => shadeY(i % 3 ? '#b5562f' : '#a84c2a', cy, 3.1, 4.1, i, 0.35), 4410));
    q = new T.BoxGeometry(0.42, 0.7, 0.08); q.translate(0, 0.85, 0.93); L.push(fac(q, (cx, cy) => shadeY('#8a4a32', cy, 0.5, 1.3, 2, 0.4), 4411));
    [[0, 2.1], [0, 2.9]].forEach(([x, y], k) => { q = new T.BoxGeometry(0.26, 0.3, 0.06); q.translate(x, y, 0.8 - k * 0.04); L.push(fac(q, () => new T.Color('#f4ecd8'), 4412 + k)); });
    q = new T.CylinderGeometry(0.08, 0.08, 0.5, 8); q.rotateX(Math.PI / 2); q.translate(0, 3.15, 0.95); L.push(fac(q, () => new T.Color('#6e4426'), 4415));
    const sp = new T.Group(); sp.position.set(0, 3.15, 1.2); const SP = [];
    for (let a = 0; a < 4; a++) { const arm = new T.BoxGeometry(0.1, 1.9, 0.06); arm.translate(0, 1.0, 0); arm.rotateZ(a * Math.PI / 2); SP.push(fac(arm, () => new T.Color('#8a5f3c'), 4420 + a));
      for (let r = 0; r < 5; r++) { const sl = new T.BoxGeometry(0.46, 0.3, 0.02); sl.translate(0.3, 0.45 + r * 0.32, 0.03); sl.rotateZ(a * Math.PI / 2); SP.push(fac(sl, () => tone(r % 2 ? '#fff6e4' : '#f3e6cc', a + r, 0.2), 4430 + a * 5 + r)); } }
    q = new T.CylinderGeometry(0.16, 0.16, 0.14, 12); q.rotateX(Math.PI / 2); SP.push(fac(q, () => new T.Color('#5a3a22'), 4460));
    merged(SP, MAT, sp); g.add(sp); M.spin = sp;
  }
  if (id === 'lighthouse') {
    kitStone(L, 2.1, 0.55, 2.1, 0, 0, 0, 4500, { ch: 0.18, bl: 0.35 });
    q = new T.CylinderGeometry(0.62, 0.9, 3.6, 16, 6); q.translate(0, 2.35, 0); L.push(fac(q, (cx, cy, cz, i) => shadeY(Math.floor((cy - 0.55) / 0.6) % 2 ? '#d9573f' : '#fbf3e4', cy, 0.5, 4.5, i, 0.25), 4501));
    q = new T.CylinderGeometry(0.95, 0.95, 0.12, 16); q.translate(0, 4.2, 0); L.push(fac(q, () => new T.Color('#3e454d'), 4502));
    for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283; q = new T.BoxGeometry(0.035, 0.36, 0.035); q.translate(Math.cos(a) * 0.9, 4.42, Math.sin(a) * 0.9); L.push(fac(q, () => new T.Color('#3e454d'), 4503)); }
    q = new T.TorusGeometry(0.9, 0.025, 4, 24); q.rotateX(Math.PI / 2); q.translate(0, 4.6, 0); L.push(fac(q, () => new T.Color('#3e454d'), 4504));
    for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283; q = new T.BoxGeometry(0.05, 0.7, 0.05); q.translate(Math.cos(a) * 0.5, 4.62, Math.sin(a) * 0.5); L.push(fac(q, () => new T.Color('#3e454d'), 4505)); }
    q = new T.ConeGeometry(0.66, 0.6, 16); q.translate(0, 5.25, 0); L.push(fac(q, (cx, cy, cz, i) => shadeY('#d9573f', cy, 4.9, 5.6, i, 0.3), 4506));
    q = new T.SphereGeometry(0.09, 8, 6); q.translate(0, 5.6, 0); L.push(fac(q, () => new T.Color('#f2c23c'), 4507));
    q = new T.BoxGeometry(0.42, 0.72, 0.1); q.translate(0, 0.9, 0.86); L.push(fac(q, (cx, cy) => shadeY('#5a3a22', cy, 0.5, 1.3, 3, 0.4), 4508));
    const glass = new T.Mesh(new T.CylinderGeometry(0.46, 0.46, 0.62, 12), new T.MeshBasicMaterial({ color: '#fff0b0', transparent: true, opacity: 0.85 })); glass.position.y = 4.6; g.add(glass);
    const beam = new T.Mesh(new T.ConeGeometry(0.9, 7, 16, 1, true), new T.MeshBasicMaterial({ color: '#fff3c4', transparent: true, opacity: 0.0, depthWrite: false, side: T.DoubleSide }));
    beam.geometry.translate(0, -3.5, 0); beam.rotation.z = Math.PI / 2; const bp = new T.Group(); bp.position.y = 4.6; bp.add(beam); g.add(bp); M.beam = bp; M.beamM = beam;
  }
  if (id === 'tower') {
    kitStone(L, 1.7, 2.3, 1.7, 0, 0, 0, 4600, { ch: 0.23, bl: 0.34, cols: ['#c9d6e6', '#b5c4d8', '#d8e3f0', '#a9b9cf'] });
    kitStone(L, 2.0, 0.14, 2.0, 0, 2.3, 0, 4650, { ch: 0.14, bl: 0.4, cols: ['#9fb0c8', '#8fa2bd'] });
    q = new T.BoxGeometry(0.44, 0.8, 0.08); q.translate(0, 0.4, 0.84); L.push(fac(q, () => new T.Color('#5a6f8c'), 4660));
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; q = new T.BoxGeometry(0.12, 0.9, 0.12); q.translate(Math.cos(a) * 0.8, 2.9, Math.sin(a) * 0.8); L.push(fac(q, () => new T.Color('#9fb0c8'), 4661 + k)); }
    q = new T.ConeGeometry(1.25, 0.7, 4); q.rotateY(Math.PI / 4); q.translate(0, 3.7, 0); L.push(fac(q, (cx, cy, cz, i) => shadeY('#f4f8fb', cy, 3.4, 4.1, i, 0.25), 4665));
    const star = new T.Group(); star.position.y = 4.55; const SG = [];
    for (let k = 0; k < 6; k++) { const o = new T.OctahedronGeometry(0.16, 0); o.scale(1, 3.2, 1); o.translate(0, 0.42, 0); o.rotateZ(k * Math.PI / 3); SG.push(o); }
    const st = new T.Mesh(fac(mergeGeos(SG), (cx, cy, cz, i) => new T.Color(i % 3 === 0 ? '#e9fbff' : '#7fd3ef'), 4670), crystalMat); star.add(st); g.add(star); M.spin = star; M.star = 1;
    const glow = new T.Sprite(new T.SpriteMaterial({ map: softTex(32, 32), color: '#9fe6ff', transparent: true, opacity: 0.5, depthWrite: false })); glow.scale.set(2.6, 2.6, 1); glow.position.y = 4.55; g.add(glow);
  }
  if (id === 'harbor') { /* a pier out into the sea, a rowing boat with a sail, a lamp post and a boat house on the shore */
    for (let k = 0; k < 11; k++) { q = new T.BoxGeometry(0.36, 0.08, 1.5); q.translate(-0.9 - k * 0.38, 0.12, 0); L.push(fac(q, () => tone(['#c0935f', '#b08454', '#c99f6c'][k % 3], k, 0.3), 4700 + k)); }
    for (let k = 0; k < 4; k++) [-0.7, 0.7].forEach((z, j) => { q = new T.CylinderGeometry(0.08, 0.09, 1.3, 8); q.translate(-1.0 - k * 1.25, -0.3, z); L.push(fac(q, (cx, cy) => shadeY(PAL.trunk, cy, -1, 0.4, k + j, 0.4), 4720 + k * 2 + j)); });
    kitPlanks(L, 1.5, 0.9, 1.2, 0.12, 4740, {}); kitRoof(L, 1.8, 1.6, 0.97, 0.7, 4760, { cols: ['#5aa7d6', '#4f96c4', '#69b4e0', '#468bb8'] });
    q = new T.BoxGeometry(0.5, 0.62, 0.04); q.translate(0, 0.45, 0.63); L.push(fac(q, () => new T.Color('#8a4a32'), 4790));
    q = new T.CylinderGeometry(0.05, 0.06, 1.7, 7); q.translate(-4.6, 0.95, 0.62); L.push(fac(q, () => new T.Color('#3e454d'), 4791));
    q = new T.ConeGeometry(0.16, 0.12, 4); q.rotateY(Math.PI / 4); q.translate(-4.6, 1.9, 0.62); L.push(fac(q, () => new T.Color('#3e454d'), 4792));
    for (let k = 0; k < 3; k++) { q = new T.CylinderGeometry(0.14, 0.14, 0.3, 10); q.translate(-1.2 + k * 0.3, 0.32, 0.55 - (k % 2) * 0.25); L.push(fac(q, (cx, cy, cz, i) => tone('#a8714d', i, 0.4), 4793 + k)); }
    const boat = new T.Group(); boat.position.set(-3.4, -0.2, 1.35); const BG = [];
    q = new T.SphereGeometry(0.55, 14, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2); q.scale(1.7, 0.6, 0.75); BG.push(fac(q, (cx, cy) => new T.Color(cy > -0.08 ? '#fbf3e4' : '#d9573f'), 4800));
    q = new T.CylinderGeometry(0.03, 0.03, 1.5, 6); q.translate(0, 0.72, 0); BG.push(fac(q, () => new T.Color('#8a5f3c'), 4801));
    q = new T.BufferGeometry(); q.setAttribute('position', new T.Float32BufferAttribute([0, 1.4, 0.02, 0, 0.15, 0.02, 0.75, 0.15, 0.02, 0, 1.4, -0.02, 0.75, 0.15, -0.02, 0, 0.15, -0.02], 3)); q.computeVertexNormals(); BG.push(fac(q, () => new T.Color('#fff6e4'), 4802));
    merged(BG, MAT, boat); g.add(boat); M.boat = boat;
    const lm = new T.Mesh(new T.BoxGeometry(0.14, 0.18, 0.14), new T.MeshBasicMaterial({ color: '#ffe6a8' })); lm.position.set(-4.6, 1.78, 0.62); g.add(lm);
  }
  /* a pennant on top once it stands: the island is finished */
  const top = { windmill: 4.15, lighthouse: 5.75, tower: 5.4, harbor: 2.0 }[id];
  q = new T.CylinderGeometry(0.02, 0.02, 0.7, 5); q.translate(id === 'harbor' ? 0.5 : 0, top + 0.35, id === 'harbor' ? -0.2 : 0); L.push(fac(q, () => new T.Color('#5a3a22'), 4890));
  merged(L, MAT, g);
  const fq = new T.BufferGeometry(); fq.setAttribute('position', new T.Float32BufferAttribute([0, 0.12, 0, 0.5, 0, 0, 0, -0.12, 0], 3)); fq.computeVertexNormals();
  const flag = new T.Mesh(fq, new T.MeshBasicMaterial({ color: '#f2c23c', side: T.DoubleSide })); flag.position.set(id === 'harbor' ? 0.5 : 0, top + 0.6, id === 'harbor' ? -0.2 : 0); g.add(flag); M.flag = flag;
  lookFoot(S.x, S.z, id === 'harbor' ? 0.9 : 1.15);
  LP.mon[id] = M; if (anim) { g.scale.setScalar(0.01); M.pop = 0.001; burst(S.x, 2, S.z, 16); }
  matMake(id);
}
/* ---- travel mats: a round mat with a boat; standing on it fills a gold ring, then the island pictures open ---- */
function matMake(id) {
  if (LP.mats.find((m) => m.id === id)) return; const P = id === 'camp' ? TRAVEL_HOME : { x: LOOP_SITES[id].x + LOOP_SITES[id].mx, z: LOOP_SITES[id].z + LOOP_SITES[id].mz };
  const R = 0.6, c = document.createElement('canvas'); c.width = c.height = 256; const q = c.getContext('2d');
  q.fillStyle = '#2f6f96'; q.beginPath(); q.arc(128, 128, 124, 0, 7); q.fill(); q.lineWidth = 8; q.strokeStyle = '#e8f4fb'; q.setLineDash([18, 14]); q.beginPath(); q.arc(128, 128, 108, 0, 7); q.stroke(); q.setLineDash([]);
  isleIcon(q, 'travel', 128, 128, 3.2);
  const pad = new T.Mesh(new T.CircleGeometry(R, 40), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true })); pad.rotation.x = -Math.PI / 2; pad.position.set(P.x, 0.05, P.z); sc.add(pad);
  const fg = new T.RingGeometry(R - 0.02, R + 0.1, 40, 1, Math.PI / 2, -Math.PI * 2), f = new T.Mesh(fg, new T.MeshBasicMaterial({ color: '#f4b23a', side: T.DoubleSide })); f.rotation.x = -Math.PI / 2; f.position.set(P.x, 0.06, P.z); sc.add(f); fg.setDrawRange(0, 0);
  /* a little post with a boat flag, so it can be found from afar */
  const L = []; let g2 = new T.CylinderGeometry(0.04, 0.05, 1.3, 6); g2.translate(P.x + 0.7, 0.65, P.z - 0.3); L.push(fac(g2, (cx, cy) => shadeY('#8a5f3c', cy, 0, 1.4, 1, 0.4), 4900));
  g2 = new T.BoxGeometry(0.46, 0.3, 0.04); g2.translate(P.x + 0.95, 1.15, P.z - 0.3); L.push(fac(g2, () => new T.Color('#5aa7d6'), 4901)); const post = merged(L, MAT);
  const fl = new T.Sprite(new T.SpriteMaterial({ map: isleBubble('travel'), transparent: true, depthWrite: false })); fl.scale.set(0.5, 0.5, 1); fl.position.set(P.x + 0.95, 1.16, P.z - 0.27); sc.add(fl);
  LP.mats.push({ id, x: P.x, z: P.z, pad, f, fg, t: 0, post, fl }); LP.armed[id] = Math.hypot(pip.position.x - P.x, pip.position.z - P.z) > 1.0;
}
const travelTo = () => { const L = [{ id: 'camp', isle: 'home', pic: 'camp' }]; Object.keys(LOOP_MON).forEach((m) => { if (mons()[m] && m !== 'harbor') L.push({ id: m, isle: LOOP_MON[m].isle, pic: m }); }); return L; };
function travelOpen(fromId) {
  if (LP.trv && !LP.trv.hidden) return false; const xu = document.querySelector('.xpUp'); if ((xu && !xu.hidden) || document.querySelector('.party')) return false; /* a new star's card first */
  const here = ISLE_OF((areaAt(pip.position.x, pip.position.z) || {}).id), list = travelTo().filter((d) => d.isle !== here); if (!list.length) return false;
  if (!LP.trv) { const m = document.createElement('div'); m.className = 'trvMenu'; m.hidden = true; document.body.appendChild(m); LP.trv = m; m.addEventListener('click', (e) => { if (e.target === m) { m.hidden = true; } }); }
  const m = LP.trv; m.innerHTML = ''; const row = document.createElement('div'); row.className = 'row'; m.appendChild(row);
  list.forEach((d) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'trvBtn'; const cv = document.createElement('canvas'); cv.width = cv.height = 220; const x = cv.getContext('2d');
    x.fillStyle = { home: '#cfe8b4', meadow: '#e6f0a8', stone: '#d8d4c8', winter: '#e4eef8' }[d.isle]; x.beginPath(); x.arc(110, 110, 104, 0, 7); x.fill(); isleIcon(x, d.pic, 110, 112, 3.4);
    b.appendChild(cv); b.addEventListener('click', (e) => { e.stopPropagation(); m.hidden = true; travelGo(d.id); }); row.appendChild(b); });
  const x = document.createElement('button'); x.type = 'button'; x.className = 'x'; x.textContent = '✕'; x.addEventListener('click', (e) => { e.stopPropagation(); m.hidden = true; }); m.appendChild(x);
  m.hidden = false; Snd.play('pop', { gain: 0.3, f: 560 }); return true;
}
function travelGo(id) {
  const P = id === 'camp' ? TRAVEL_HOME : { x: LOOP_SITES[id].x + LOOP_SITES[id].mx, z: LOOP_SITES[id].z + LOOP_SITES[id].mz };
  LP.hop = { t: 0, x: P.x, z: P.z + 1.1, moved: false, id }; work = null; Snd.play('whoosh', { gain: 0.45, f: 360 });
  if (!LP.fade) { const f = document.createElement('div'); f.style.cssText = 'position:fixed;inset:0;background:#e8f4fb;opacity:0;pointer-events:none;transition:opacity .35s;z-index:30'; document.body.appendChild(f); LP.fade = f; }
  LP.fade.style.opacity = '1';
}

/* ---- keys: a picture in the corner while held; the bridge that needs one shows it in a locked bubble ---- */
function keyGive(k, x, z) {
  if (lkeys()[k]) return; lkeys()[k] = 1; save(); keyHud();
  const sp = isleSprite(isleBubble(k), 0.9); sp.position.set(x, 1.6, z); sc.add(sp); LP.gift = { sp, t: 0 };
  Snd.play('success', { gain: 0.5, f: 'G5' }); Snd.play('sparkle', { gain: 0.45 }, 0.2);
}
function keyHud() {
  if (!LP.keyEl) { const e = document.createElement('div'); e.className = 'keyHud'; document.body.appendChild(e); LP.keyEl = e; }
  const held = Object.keys(lkeys()).filter((k) => lkeys()[k] === 1), key = held.join();
  if (key === LP.keyKey) return; LP.keyKey = key; LP.keyEl.innerHTML = '';
  held.forEach((k) => { const c = document.createElement('canvas'); c.width = c.height = 96; isleIcon(c.getContext('2d'), k, 48, 48, 1.6); const d = document.createElement('div'); d.className = 'k'; d.appendChild(c); LP.keyEl.appendChild(d); });
  LP.keyEl.hidden = !held.length;
}
/* the bridge sign waits for its key: the bubble shows what is missing */
function loopSignShut(s) {
  if (s.kind !== 'bridge' || !LOOP_KEY[s.A.id]) return false; const k = LOOP_KEY[s.A.id];
  if (lkeys()[k]) return false;
  gearHint(k); return true;
}

/* ---- signs: requests, house plots and monuments ---- */
function loopWants(want) {
  Object.keys(LOOP_FOLK).forEach((id) => { const P = LP.folk[id], F = loopF(id); if (!P) return;
    if (F === 1 && P.g.visible && !P.wait && !P.move) want.set('p:' + id, { kind: 'person', who: id });
    if (F === 2 && !P.move && HAS.h1) want.set('f:' + id, { kind: 'plot', who: id }); });
  Object.keys(LOOP_MON).forEach((id) => { if (!mons()[id] && LOOP_MON[id].need()) want.set('m:' + id, { kind: 'mon', who: id }); });
}
const loopGhost = {};
function loopSignMake(w, key) {
  const id = w.who;
  if (LOOP_FOLK[id] && w.kind === 'person') { const [x, z] = loopSpot(id), s = signMake({ key, kind: 'person', who: id, A: null, cost: LOOP_FOLK[id].want, x, z, ghostGeo: tinyGeo, ghostTex, gx: x, gz: z, gy: -5 });
    s.g.children.forEach((m) => { if (m.isMesh) m.visible = false; }); s.ghost.visible = false; s.ring.scale.setScalar(1.35); return true; }
  if (LOOP_FOLK[id] && w.kind === 'plot') { const H = HOUSES[id], g = loopGhost.h || (loopGhost.h = (() => { const q = new T.PlaneGeometry(2.3, 1.7, 6, 4); q.rotateX(-Math.PI / 2); return q; })());
    signMake({ key, kind: 'plot', who: id, A: null, cost: LOOP_FOLK[id].house, x: H.x - 0.9, z: H.z + 1.55, ghostGeo: g, ghostTex, gx: H.x, gz: H.z, gy: 0.04 }); return true; }
  if (w.kind === 'mon') { const S = LOOP_SITES[id], g = loopGhost[id] || (loopGhost[id] = (() => { const q = new T.CircleGeometry(1.3, 24); q.rotateX(-Math.PI / 2); return q; })());
    const s = signMake({ key, kind: 'mon', who: id, A: null, cost: LOOP_MON[id].cost, x: S.x + S.sx, z: S.z + S.sz, ghostGeo: g, ghostTex: ghostRound, gx: S.x, gz: S.z, gy: 0.05 });
    const pic = isleSprite(isleBubble(id), 1.1); pic.position.set(S.x, 1.6, S.z); sc.add(pic); s.pic = pic; return true; }
  return false;
}
function loopBuy(s) {
  const id = s.who;
  if (s.pic) sc.remove(s.pic);
  if (s.kind === 'bridge') { const k = LOOP_KEY[s.A.id]; if (k && lkeys()[k] === 1) { lkeys()[k] = 2; keyHud(); } return false; }
  if (LOOP_FOLK[id] && s.kind === 'person') { folk()[id] = 2; LP.folk[id].move = { t: 0 }; Snd.play('success', { gain: 0.5, f: 'E6' }); burst(LP.folk[id].g.position.x, 1.5, LP.folk[id].g.position.z, 10); xpGain(10); return true; }
  if (LOOP_FOLK[id] && s.kind === 'plot') { folk()[id] = 3; loopHouse(id, true); LP.folk[id].hop = 1; Snd.play('success', { gain: 0.5, f: 'C6' }); Snd.play('sparkle', { gain: 0.4 }, 0.15); xpGain(20);
    if (LOOP_FOLK[id].key) keyGive(LOOP_FOLK[id].key, HOUSES[id].x, HOUSES[id].z + 1.4); villageSync(true); return true; }
  if (s.kind === 'mon') { mons()[id] = 1; monMake(id, true); matMake('camp'); xpGain(40); Snd.play('success', { gain: 0.55, f: 'C6' }); Snd.play('sparkle', { gain: 0.5 }, 0.2); Snd.play('success', { gain: 0.45, f: 'G6' }, 0.5); save(); return true; }
  return false;
}
function loopGoal() {
  const pp = pip.position;
  for (const id of Object.keys(LOOP_FOLK)) { const P = LP.folk[id]; if (P && loopF(id) === 2 && P.arr > 0 && !P.away) { const H = HOUSES[id]; if (Math.hypot(pp.x - H.x, pp.z - H.z) > 4) return [H.x - 0.9, H.z + 1.55]; } }
  if (LP.gift) return null;
  return null;
}
function loopRuinOpen(R) { Object.keys(LOOP_FOLK).forEach((id) => { if (LOOP_FOLK[id].ruin === R.A.id && !loopF(id)) { folk()[id] = 1; LP.folk[id].wait = 2.2; } }); }
/* the friends' houses and the monuments keep Pip outside */
function loopNear(x, z, r) { return Object.keys(HOUSES).some((k) => Math.hypot(HOUSES[k].x - x, HOUSES[k].z - z) < r + 0.6) || Object.keys(LOOP_SITES).some((k) => Math.hypot(LOOP_SITES[k].x - x, LOOP_SITES[k].z - z) < r + 0.9) || Math.hypot(TRAVEL_HOME.x - x, TRAVEL_HOME.z - z) < r; }

function loopInit() {
  const I = state.isle; I.mon = I.mon || {}; I.keys = I.keys || {}; const F = folk();
  Object.keys(LOOP_FOLK).forEach((id) => { const D = LOOP_FOLK[id]; F[id] = F[id] || 0; if (!F[id] && D.ruin && I.ruins[D.ruin]) F[id] = 1;
    const P = LP.folk[id] = LP.folk[id] || { g: loopFolkModel(id), pop: 0, hop: 0, move: null, arr: 0, wait: 0 };
    P.g.visible = D.cave ? F[id] !== 0 || true : F[id] >= 1 && (F[id] > 1 || HAS[D.ruin]); if (P.g.visible) loopPlace(id);
    if (F[id] >= 3) loopHouse(id, false); });
  /* keys from friends who already had their workshop before keys existed */
  if ((F.smith || 0) >= 3 && !I.keys.rope) I.keys.rope = I.areas.m0 ? 2 : 1;
  if ((F.baker || 0) >= 3 && !I.keys.map) I.keys.map = I.areas.s0 ? 2 : 1;
  if ((F.mason || 0) >= 3 && !I.keys.icepick) I.keys.icepick = I.areas.w0 ? 2 : 1;
  Object.keys(LOOP_KEY).forEach((a) => { const k = LOOP_KEY[a]; if (I.areas[a] && I.keys[k] === 1) I.keys[k] = 2; });
  Object.keys(LOOP_MON).forEach((id) => { if (I.mon[id]) monMake(id, false); });
  if (Object.keys(I.mon).length) matMake('camp');
  keyHud(); loopCss();
}
function loopCss() {
  if (LP.css) return; LP.css = 1; const st = document.createElement('style');
  st.textContent = '.keyHud{position:fixed;top:calc(max(12px,env(safe-area-inset-top,0px)) + 124px);left:max(16px,env(safe-area-inset-left,0px));display:flex;gap:6px;z-index:6;pointer-events:none}.keyHud[hidden]{display:none}'
    + '.keyHud .k{width:56px;height:56px;border-radius:50%;background:linear-gradient(#fdf3dc,#f0dcb2);border:4px solid #8a5a32;box-shadow:0 4px 0 rgba(70,40,18,.35);display:flex;align-items:center;justify-content:center}.keyHud canvas{width:44px;height:44px}'
    + '.trvMenu{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:rgba(34,48,60,.35);z-index:20;padding:16px}.trvMenu[hidden]{display:none}'
    + '.trvMenu .row{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;max-width:100%}.trvBtn{width:132px;height:132px;border-radius:50%;border:6px solid #8a5a32;background:#fff6e4;box-shadow:0 6px 0 rgba(70,40,18,.4);padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer}'
    + '.trvBtn canvas{width:112px;height:112px}.trvBtn:active{transform:translateY(3px)}.trvMenu .x{width:64px;height:64px;border-radius:50%;border:3px solid var(--ink);background:var(--paper);font:700 34px Fredoka,sans-serif}'
    + '.party{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(34,48,60,.3);z-index:25;padding:16px}.party[hidden]{display:none}.party canvas{width:min(560px,92vw);height:auto;border-radius:28px;box-shadow:0 10px 0 rgba(70,40,18,.35)}';
  document.head.appendChild(st);
}

/* ---- the party: all friends home, all monuments up ---- */
const loopAllDone = () => Object.keys(LOOP_FOLK).concat(['smith', 'baker']).every((id) => (folk()[id] || 0) >= 3) && Object.keys(LOOP_MON).every((m) => mons()[m]);
function partyCard() {
  const W = 560, H = 400, c = document.createElement('canvas'); c.width = W * 2; c.height = H * 2; const x = c.getContext('2d'); x.scale(2, 2); paperBox(x, W, H + 8);
  isleIcon(x, 'star', W / 2, 96, 3.6);
  VILLAGERS.forEach((v, k) => { boardFace(x, v, 70 + k * 105, 228, 0.9); });
  ['harbor', 'windmill', 'lighthouse', 'tower'].forEach((m, k) => isleIcon(x, m, 120 + k * 107, 330, 1.6));
  const d = document.createElement('div'); d.className = 'party'; d.appendChild(c); document.body.appendChild(d); d.addEventListener('click', () => d.remove());
}
function fwShoot(x, z) {
  const COLS = ['#ff6b6b', '#f6d24a', '#7fd3ef', '#b89cf0', '#74d68a', '#ff9ad5'], col = COLS[Math.floor(Math.random() * COLS.length)], y = 6 + Math.random() * 2;
  for (let k = 0; k < 26; k++) { const sp = new T.Sprite(new T.SpriteMaterial({ map: softTex(32, 32), color: col, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); sp.scale.set(0.5, 0.5, 1); sp.position.set(x, y, z); sc.add(sp);
    const a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1), v = 3 + Math.random() * 1.5; LP.fw.push({ sp, vx: Math.sin(b) * Math.cos(a) * v, vy: Math.cos(b) * v, vz: Math.sin(b) * Math.sin(a) * v, t: 0 }); }
  Snd.play('pop', { gain: 0.35, f: 300 + Math.random() * 300 });
}

function loopStep(dt) {
  const pp = pip.position, I = state.isle;
  /* the friends */
  Object.keys(LOOP_FOLK).forEach((id) => { const P = LP.folk[id], D = LOOP_FOLK[id], g = P.g, F = loopF(id); if (!P) return;
    if (D.cave && !F && inCave && Math.hypot(pp.x - g.position.x, pp.z - g.position.z) < 4) { folk()[id] = 1; P.hop = 1; Snd.play('success', { gain: 0.45, f: 'A5' }); isleSigns(); save(); }
    if (P.wait) { P.wait -= dt; if (P.wait <= 0) { P.wait = 0; loopPlace(id); g.visible = true; P.pop = 0.001; g.scale.setScalar(0.01); Snd.play('success', { gain: 0.45, f: 'A5' }); burst(g.position.x, 1.4, g.position.z, 8); isleSigns(); } }
    if (P.pop) { P.pop = Math.min(1, P.pop + dt * 2); g.scale.setScalar(P.pop < 0.7 ? P.pop / 0.7 * 1.1 : 1.1 - (P.pop - 0.7) / 0.3 * 0.1); if (P.pop >= 1) { P.pop = 0; g.scale.setScalar(1); } }
    if (P.pop2 && P.house) { P.pop2 = Math.min(1, P.pop2 + dt * 1.6); P.house.scale.setScalar(P.pop2 < 0.7 ? P.pop2 / 0.7 * 1.08 : 1.08 - (P.pop2 - 0.7) / 0.3 * 0.08); if (P.pop2 >= 1) { P.pop2 = 0; P.house.scale.setScalar(1); } }
    if (P.move) { const M = P.move; M.t += dt;
      if (M.t < 1.0) g.position.y = Math.abs(Math.sin(M.t * Math.PI * 2)) * 0.35;
      else if (M.t < 1.35) { g.scale.setScalar(Math.max(0.01, 1 - (M.t - 1.0) / 0.35)); if (!M.puff) { M.puff = 1; Snd.play('whoosh', { gain: 0.4 }); burst(g.position.x, 0.8, g.position.z, 6); } }
      else { P.move = null; g.position.y = 0; loopPlace(id); P.pop = 0.001; g.scale.setScalar(0.01); P.arr = 25; Snd.play('pop', { gain: 0.4, f: 640 }); burst(g.position.x, 1.2, g.position.z, 8); isleSigns(); save(); } }
    if (P.away && HAS.h1 && F >= 2 && !P.move && !rising) { loopPlace(id); P.pop = 0.001; g.scale.setScalar(0.01); P.arr = 25; isleSigns(); }
    P.arr = Math.max(0, P.arr - dt);
    if (!g.visible || P.move) return;
    P.hop = Math.max(0, P.hop - dt * 1.6); g.position.y = P.hop > 0 ? Math.abs(Math.sin(P.hop * Math.PI * 3)) * 0.3 : (LP.partyT > 0 && F >= 3 ? Math.abs(Math.sin(time * 6 + id.length)) * 0.25 : 0);
    const d = Math.hypot(pp.x - g.position.x, pp.z - g.position.z), face = d < 4 ? Math.atan2(pp.x - g.position.x, pp.z - g.position.z) : 0;
    let df = face - g.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); g.rotation.y += df * Math.min(1, dt * 5);
    if (d < 0.5 && d > 1e-4) { pp.x = g.position.x + (pp.x - g.position.x) / d * 0.5; pp.z = g.position.z + (pp.z - g.position.z) / d * 0.5; }
  });
  /* houses and monuments are solid */
  Object.keys(LP.folk).forEach((id) => { if (!LP.folk[id].house) return; const H = HOUSES[id], bx = pp.x - H.x, bz = pp.z - H.z; if (Math.abs(bx) < 1.15 && Math.abs(bz) < 0.9) { if (1.15 - Math.abs(bx) < 0.9 - Math.abs(bz)) pp.x = H.x + Math.sign(bx || 1) * 1.15; else pp.z = H.z + Math.sign(bz || 1) * 0.9; } });
  Object.keys(LP.mon).forEach((id) => { const M = LP.mon[id], S = LOOP_SITES[id], r = id === 'harbor' ? 0.95 : 1.25, dx = pp.x - S.x, dz = pp.z - S.z, d = Math.hypot(dx, dz);
    if (d < r && d > 1e-4) { pp.x = S.x + dx / d * r; pp.z = S.z + dz / d * r; }
    if (M.pop) { M.pop = Math.min(1, M.pop + dt * 1.2); M.g.scale.setScalar(M.pop < 0.7 ? M.pop / 0.7 * 1.08 : 1.08 - (M.pop - 0.7) / 0.3 * 0.08); if (M.pop >= 1) M.pop = 0; }
    if (M.spin && !reduced) { if (M.star) M.spin.rotation.y += dt * 0.8; else M.spin.rotation.z -= dt * 0.9; }
    if (M.beam) { M.beam.rotation.y += dt * 0.9; M.beamM.material.opacity = (typeof nightAmt === 'number' ? nightAmt : isNight ? 1 : 0) * 0.28; }
    if (M.boat && !reduced) { M.boat.position.y = -0.2 + Math.sin(time * 1.6) * 0.04; M.boat.rotation.z = Math.sin(time * 1.2) * 0.05; }
    if (M.flag && !reduced) M.flag.rotation.y = Math.sin(time * 3 + S.x) * 0.3; });
  /* monument signs carry a picture of what they build */
  signs.forEach((s) => { if (s.pic) s.pic.position.y = 2.0 + (reduced ? 0 : Math.sin(time * 2 + s.seed) * 0.08); });
  /* the key that a bridge needs, floating over its sign while missing */
  signs.forEach((s) => { if (s.kind !== 'bridge') return; const k = LOOP_KEY[s.A.id], need = k && !lkeys()[k]; let sp = LP.lockSp[s.key];
    if (need && !sp) { sp = LP.lockSp[s.key] = isleSprite(loopLockBubble(k), 0.95); sc.add(sp); }
    if (sp) { sp.visible = need; sp.position.set(s.x, 3.25 + (reduced ? 0 : Math.sin(time * 2 + s.seed) * 0.06), s.z); s.sm.visible = s.sm.visible && !need; } });
  Object.keys(LP.lockSp).forEach((k) => { if (!signs.some((s) => s.key === k)) { sc.remove(LP.lockSp[k]); delete LP.lockSp[k]; } });
  /* a gift flying up out of a new house: the key */
  if (LP.gift) { const G = LP.gift; G.t += dt; const u = Math.min(1, G.t / 1.1); G.sp.position.lerp(tmpV.set(pp.x, 2.3 + Math.sin(u * Math.PI) * 1.2, pp.z), Math.min(1, dt * 4)); G.sp.material.opacity = G.t > 1.8 ? Math.max(0, 1 - (G.t - 1.8) * 3) : 1; if (G.t > 2.2) { sc.remove(G.sp); LP.gift = null; } }
  /* travel mats */
  LP.mats.forEach((M) => { const d = Math.hypot(pp.x - M.x, pp.z - M.z);
    if (d > 1.0) LP.armed[M.id] = true;
    const on = d < 0.55 && LP.armed[M.id] && !LP.hop && !enSleep && travelTo().filter((q) => q.isle !== ISLE_OF((areaAt(pp.x, pp.z) || {}).id)).length > 0;
    M.t = on ? M.t + dt : 0; M.fg.setDrawRange(0, Math.floor(Math.min(1, M.t / 0.9) * 240) * 6);
    if (M.t >= 0.9) { M.t = 0; if (travelOpen(M.id)) LP.armed[M.id] = false; } });
  if (LP.hop) { const H = LP.hop; H.t += dt;
    if (H.t > 0.4 && !H.moved) { H.moved = true; pp.set(H.x, 0, H.z); target.set(H.x, 0, H.z); camFocus.set(H.x, 0, H.z); if (typeof dog !== 'undefined' && dog && dog.g) dog.g.position.set(H.x - 0.8, 0, H.z + 0.4); Object.keys(LP.armed).forEach((k) => { LP.armed[k] = false; }); }
    if (H.t > 0.55 && LP.fade) LP.fade.style.opacity = '0';
    if (H.t > 1.0) { LP.hop = null; Snd.play('sparkle', { gain: 0.35 }); burst(pp.x, 1.2, pp.z, 6); } }
  /* the party */
  if (!I.done && loopAllDone() && !LP.partyWait) { LP.partyWait = 2.5; }
  if (LP.partyWait) { LP.partyWait -= dt; if (LP.partyWait <= 0) { LP.partyWait = 0; I.done = 1; save(); LP.partyT = 22; partyCard(); Snd.play('success', { gain: 0.55, f: 'C6' }); Snd.play('success', { gain: 0.5, f: 'E6' }, 0.25); Snd.play('success', { gain: 0.5, f: 'G6' }, 0.5); } }
  if (I.done && isNight && LP.partyT <= 0 && !LP.nightParty) { LP.nightParty = 1; LP.partyT = 14; } if (!isNight) LP.nightParty = 0; /* fireworks every night after */
  if (LP.partyT > 0) { LP.partyT -= dt; LP.fwT = (LP.fwT || 0) - dt; if (LP.fwT <= 0) { LP.fwT = 0.7 + Math.random() * 0.6; fwShoot(WELL.x + (Math.random() - 0.5) * 8, WELL.z + (Math.random() - 0.5) * 6 - 2); } }
  for (let k = LP.fw.length - 1; k >= 0; k--) { const f = LP.fw[k]; f.t += dt; f.vy -= 3.5 * dt; f.vx *= 0.985; f.vz *= 0.985; f.sp.position.x += f.vx * dt; f.sp.position.y += f.vy * dt; f.sp.position.z += f.vz * dt; f.sp.material.opacity = Math.max(0, 1 - f.t / 1.6); if (f.t > 1.6) { sc.remove(f.sp); LP.fw.splice(k, 1); } }
  /* a monument's sign shows up as soon as its island is ready (friend home, square owned) */
  LP.needT = (LP.needT || 0) - dt; if (LP.needT <= 0 && !rising && !building) { LP.needT = 1.2; const k = Object.keys(LOOP_MON).map((m) => (!mons()[m] && LOOP_MON[m].need() ? 1 : 0)).join('');
    if (LP.needKey != null && k !== LP.needKey) isleSigns(); LP.needKey = k; }
  keyHud();
}
