/* ---------- the walk-in barn: stalls for the bigger animals, goats, and leading animals in at night and out in the morning ---------- */
/* Pip walks into the barn through a doormat ring by its doors. Inside (built far out at sea, like the house) there are stalls.
   In the evening the bigger animals wait by their pen gate with a moon bubble: walk up to them and they follow Pip in a line,
   and walking into the barn puts them to bed in a stall. In the morning they wait in their stalls with a sun bubble: walk past
   them and they follow Pip out, and each one hops back into its own pen when Pip comes near it. Hens stay in their coop. */
const BI = { x: -200, z: 0 }; /* the inside */
const BARN_IN = { x0: BI.x - 4.3, x1: BI.x + 4.3, z0: BI.z - 2.0, z1: BI.z + 4.9 };
const HOUSE_IN = { x0: IN_B.x0, x1: IN_B.x1, z0: IN_B.z0, z1: IN_B.z1 };
const BARN_KINDS = ['pig', 'sheep', 'goat', 'cow', 'horse', 'bull'];
const BDOOR = { x: BARN.x, z: BARN.z + 2.0 };
const FOLLOW_MAX = 4;
const GAP = { pig: 0.8, sheep: 0.8, goat: 0.75, cow: 1.05, horse: 1.15, bull: 1.1 };
/* stalls: six along the back wall, three down each side; the middle ones open first */
const STALLS = [[-1, -3.45, 0], [1, -3.45, 0], [-3, -3.45, 0], [3, -3.45, 0], [-5, -3.45, 0], [5, -3.45, 0],
  [-5.1, -0.6, 1], [5.1, -0.6, -1], [-5.1, 1.2, 1], [5.1, 1.2, -1], [-5.1, 3.0, 1], [5.1, 3.0, -1]].map(([x, z, s], i) => ({ i, x: BI.x + x, z: BI.z + z, side: s, an: null }));
/* what can be bought inside the barn, one pad at a time: goats and more stalls */
const BPADS = [{ id: 'goat1', kind: 'goat', cost: 20 }, { id: 'stall6', kind: 'stall', n: 6, cost: 60 }, { id: 'goat2', kind: 'goat', cost: 90 },
  { id: 'stall8', kind: 'stall', n: 8, cost: 160 }, { id: 'goat3', kind: 'goat', cost: 240 }, { id: 'stall10', kind: 'stall', n: 10, cost: 340 }, { id: 'stall12', kind: 'stall', n: 12, cost: 480 }];
let inBarn = false, barnReady = false;
const barnS = () => { if (!state.barn) state.barn = { owned: {}, paid: {}, in: [] }; return state.barn; };
const openStalls = () => { let n = 4; BPADS.forEach((p) => { if (p.kind === 'stall' && barnS().owned[p.id]) n = Math.max(n, p.n); }); return n; };
const bedtime = () => { const f = dayFrac(); return f >= 0.56 && f < 0.97; };
const morning = () => dayFrac() < 0.45;
const followers = [];
const trail = [];
const sizeOf = (an) => GAP[an.a] || 0.9;
const keyOf = (an) => an.a + ':' + animals.filter((o) => o.a === an.a).indexOf(an);
const canBarn = (an) => BARN_KINDS.includes(an.a) && !an.baby;
function freeStall() { for (let i = 0; i < openStalls(); i++) if (!STALLS[i].an && !STALLS[i].held) return STALLS[i]; return null; }
/* the stalls in the order they stand side by side: down the left wall, along the back, up the right wall */
const STALL_ROW = [10, 8, 6, 4, 2, 0, 1, 3, 5, 7, 9, 11];
/* a free stall, next to one of the same kind when there is one, so a kind sleeps in a row */
function stallNear(kind) {
  const open = STALL_ROW.filter((i) => i < openStalls()).map((i) => STALLS[i]), who = (st) => (st.an || st.held || {}).a;
  const free = open.filter((st) => !st.an && !st.held);
  return free.find((st, k) => { const j = open.indexOf(st); return who(open[j - 1] || {}) === kind || who(open[j + 1] || {}) === kind; }) || free[0] || null;
}
/* put everyone sleeping (and everyone walking in) in rows by kind: pigs together, sheep together, and so on,
   so in the morning one walk along a row brings out a whole kind for one pen. Done while the screen is faded. */
function regroup() {
  const pool = STALL_ROW.filter((i) => i < openStalls()).map((i) => STALLS[i]).filter((st) => !(st.an && st.an.follow));
  const list = animals.filter((an) => (an.inBarn && an.stall && !an.follow) || an.walkIn);
  list.sort((a, b) => BARN_KINDS.indexOf(a.a) - BARN_KINDS.indexOf(b.a) || animals.indexOf(a) - animals.indexOf(b));
  pool.forEach((st) => { st.an = null; st.held = null; });
  list.forEach((an, k) => { const st = pool[k]; if (!st) return; an.stall = null;
    if (an.walkIn) { st.held = an; an.walkIn = st; } else putInStall(an, st, true); });
}
function roomLeft() { let n = 0; for (let i = 0; i < openStalls(); i++) if (!STALLS[i].an && !STALLS[i].held) n++; return n; }

/* ---------- inside: a warm, lantern-lit barn with stalls ---------- */
const barnL = [];
const barnSigns = [], barnBlocks = [], barnGlow = [];
const BLIGHTS = [[-2.0, 1.2, -2.3], [2.0, 1.2, -2.3], [-1.15, 1.75, 4.62], [1.15, 1.75, 4.62]];
{
  const X = (x) => BI.x + x, Z = (z) => BI.z + z, P = at(BI.x, BI.z, 0, barnL), DK = '#5a3a28', WD = '#9a6542', LW = '#b98552', RED = '#a8442f', HAY = '#e2c36b';
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; return t; };
  /* dark yard around it so the warm inside pops */
  let g = new T.PlaneGeometry(60, 44); g.rotateX(-Math.PI / 2); const yard = new T.Mesh(g, new T.MeshStandardMaterial({ color: '#1f2a1c', roughness: 1 })); yard.position.set(X(0), -0.01, Z(0)); sc.add(yard);
  /* floor: wide planks under scattered straw */
  const floorT = canvasTex(512, 512, (x, w, h) => { const B = ['#a8774a', '#9c6c42', '#b3814f', '#946540']; for (let r = 0; r < 8; r++) { let px = -hash(r, 3) * 160; while (px < w) { const L = 160 + hash(r, px) * 200; x.fillStyle = B[Math.floor(hash(r * 2.3, px) * B.length)]; x.fillRect(px, r * 64, L, 64); x.strokeStyle = 'rgba(50,30,15,0.5)'; x.lineWidth = 3; x.strokeRect(px, r * 64, L, 64); px += L; } }
    for (let k = 0; k < 900; k++) { const sx = hash(k, 1) * w, sy = hash(k, 2) * h, a = hash(k, 3) * 6.283, l = 8 + hash(k, 4) * 14; x.strokeStyle = ['#e8c873', '#d9b45a', '#f2d88c'][k % 3]; x.globalAlpha = 0.55; x.lineWidth = 2; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + Math.cos(a) * l, sy + Math.sin(a) * l); x.stroke(); } x.globalAlpha = 1; });
  floorT.repeat.set(12 / 2.2, 10 / 2.2);
  const fl = new T.Mesh(new T.PlaneGeometry(12.4, 10), new T.MeshStandardMaterial({ map: floorT, roughness: 0.9 })); fl.rotation.x = -Math.PI / 2; fl.position.set(X(0), 0.04, Z(0.2)); fl.receiveShadow = true; sc.add(fl);
  /* walls: vertical boards, red outside, warm wood inside; tall at the back, low at the sides and front so the camera sees in */
  const boards = canvasTex(256, 128, (x, w, h) => { for (let k = 0; k < 8; k++) { x.fillStyle = ['#a46a44', '#97603d', '#ad7349', '#8f5a38'][k % 4]; x.fillRect(k * 32, 0, 32, h); x.fillStyle = 'rgba(40,20,10,0.45)'; x.fillRect(k * 32, 0, 3, h); } x.fillStyle = 'rgba(255,230,190,0.08)'; x.fillRect(0, 0, w, 10); });
  const wall = (len, hgt, cx, cz, rot) => { const t = boards.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(len / 1.4)), 1); const m = new T.Mesh(new T.BoxGeometry(len, hgt, 0.18), new T.MeshStandardMaterial({ map: t, roughness: 0.9 })); m.position.set(X(cx), hgt / 2, Z(cz)); m.rotation.y = rot || 0; m.castShadow = m.receiveShadow = true; sc.add(m);
    P(box(len + 0.06, 0.08, 0.26), DK, 2201, cx, hgt + 0.02, cz, { ry: rot || 0 }); };
  wall(12.4, 2.0, 0, -4.8); wall(9.6, 0.8, -6.2, 0.0, Math.PI / 2); wall(9.6, 0.8, 6.2, 0.0, Math.PI / 2); wall(5.1, 0.45, -3.65, 4.8); wall(5.1, 0.45, 3.65, 4.8);
  /* the big door frame at the front and the beams along the back wall */
  [-1.15, 1.15].forEach((x) => { P(box(0.22, 1.6, 0.22), DK, 2202, x, 0.8, 4.8); P(box(0.1, 1.3, 0.75), RED, 2203, x + Math.sign(x) * 0.5, 0.65, 5.15, { ry: Math.sign(x) * 0.9 }); });
  [-6, -2, 2, 6].forEach((x) => P(box(0.24, 2.2, 0.24), DK, 2204, x, 1.1, -4.68));
  P(box(12.4, 0.2, 0.3), DK, 2205, 0, 2.1, -4.6);
  /* stalls: plank partitions with a dark top rail, straw beds, hay racks and water buckets */
  const part2 = (x0, z0, x1, z1) => { const l = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2; P(box(l, 0.85, 0.08), (cx, cy, cz, i) => tone(LW, i, 0.5).multiplyScalar(0.8 + 0.25 * clamp(cy / 0.85 + 0.5, 0, 1)), 2206, (x0 + x1) / 2, 0.43, (z0 + z1) / 2, { ry });
    P(box(l + 0.04, 0.07, 0.13), DK, 2207, (x0 + x1) / 2, 0.88, (z0 + z1) / 2, { ry }); P(box(0.14, 1.05, 0.14), DK, 2208, x1, 0.52, z1); };
  [-6, -4, -2, 0, 2, 4, 6].forEach((x) => part2(x, -4.7, x, -2.3));
  [-1, 1].forEach((s) => [-1.5, 0.3, 2.1, 3.9].forEach((z) => part2(s * 6.1, z, s * 4.2, z)));
  STALLS.forEach((st, k) => {
    const lx = st.x - BI.x, lz = st.z - BI.z, back = st.side === 0;
    P(new T.CylinderGeometry(0.72, 0.8, 0.06, 12).scale(1, 1, back ? 1.25 : 1).rotateY(hash(k, 2)), (cx, cy, cz, i) => tone(HAY, i, 0.8), 2210 + k, lx, 0.07, lz);
    for (let j = 0; j < 5; j++) P(new T.BoxGeometry(0.3, 0.02, 0.03).rotateY(hash(k, j) * 6), ['#f2d88c', '#d9b45a'][j % 2], 2230 + j, lx + (hash(k, j, 1) - 0.5) * 1.2, 0.11, lz + (hash(k, j, 2) - 0.5) * 1.1);
    /* hay rack against the back (or side) wall and a little water bucket */
    const rx = back ? lx : lx - st.side * 0.85, rz = back ? -4.55 : lz, ry = back ? 0 : Math.PI / 2;
    P(box(0.75, 0.32, 0.22), WD, 2240, rx, 0.95, rz, { ry }); P(ico(0.22, 1, 2241 + k).scale(1.5, 0.7, 0.6).rotateY(ry), HAY, 2241 + k, rx, 1.13, rz);
    const bx = back ? lx + 0.62 : lx - st.side * 0.55, bz = back ? -4.3 : lz + 0.6;
    P(new T.CylinderGeometry(0.13, 0.1, 0.2, 10), '#8f9aa6', 2260 + k, bx, 0.1, bz); P(new T.CylinderGeometry(0.115, 0.115, 0.02, 10), PAL.seaShallow, 2272, bx, 0.19, bz);
    /* a picture sign over the stall: who sleeps here */
    const sp = new T.Sprite(new T.SpriteMaterial({ map: bubble('stall'), depthTest: true, transparent: true })); sp.scale.set(0.58, 0.58, 1);
    sp.position.set(back ? st.x : st.x - st.side * 0.95, back ? 1.85 : 1.25, back ? BI.z - 4.5 : st.z); sc.add(sp); st.sign = sp; st.signK = null;
    /* a closed stall is stacked full of hay bales and crates until it is bought */
    const blk = new T.Group(); blk.position.set(st.x, 0, st.z); sc.add(blk); st.block = blk;
    for (let j = 0; j < 3; j++) { const b = new T.CylinderGeometry(0.3, 0.3, 0.62, 12); b.rotateZ(Math.PI / 2); if (!back) b.rotateY(Math.PI / 2); part(fac(jit(b, 0.012, j + k), (cx, cy, cz, i) => tone(Math.abs(back ? cx : cz) > 0.28 ? '#d7a84e' : PAL.ochre, i, 0.7)), blk, back ? (j - 1) * 0.66 : 0, 0.3, back ? 0.1 : (j - 1) * 0.6); }
    part(fac(box(0.55, 0.42, 0.45), PAL.trunk, 2290 + k), blk, back ? 0.3 : 0.1, 0.81, back ? 0.05 : -0.2);
  });
  /* corners: a ladder up to the hay loft, bales, a pitchfork and a sleeping cat on the bales */
  P(box(0.08, 2.0, 0.08), DK, 2300, -5.55, 1.0, -2.0, { rz: 0.12 }); P(box(0.08, 2.0, 0.08), DK, 2300, -5.05, 1.0, -2.0, { rz: 0.12 });
  for (let k = 0; k < 6; k++) P(box(0.52, 0.05, 0.06), WD, 2301, -5.3 + 0.12 * (k * 0.32 - 0.9) * 0.4, 0.2 + k * 0.32, -2.0);
  [[-2.6, 4.25], [-3.3, 4.25], [-2.95, 4.25, 0.55]].forEach(([x, z, y], k) => { const b = new T.CylinderGeometry(0.3, 0.3, 0.62, 12); b.rotateZ(Math.PI / 2); P(jit(b, 0.012, 9 + k), (cx, cy, cz, i) => tone(Math.abs(cx) > 0.28 ? '#d7a84e' : PAL.ochre, i, 0.7), 2302 + k, x, (y || 0) + 0.3, z); });
  P(ico(0.13, 1, 2310).scale(1.3, 0.6, 1), '#e6a650', 2310, -2.95, 1.17, 4.25); P(ico(0.08, 1, 2311), '#e6a650', 2311, -2.8, 1.22, 4.3);
  P(box(0.04, 1.3, 0.04), WD, 2312, 3.6, 0.62, 4.5, { rz: 0.25 }); [-0.06, 0, 0.06].forEach((x) => P(box(0.015, 0.22, 0.015), '#8f9aa6', 2313, 3.45 + x, 1.32, 4.5, { rz: 0.25 }));
  P(box(0.7, 0.5, 0.5), PAL.trunk, 2314, 4.4, 0.25, 4.3); P(new T.CylinderGeometry(0.22, 0.22, 0.55, 12), WD, 2315, 5.1, 0.28, 4.25);
  /* lanterns on the posts; their glow and the four lamp lights come inside with Pip */
  BLIGHTS.forEach(([x, y, z], k) => { P(box(0.16, 0.22, 0.16), '#3a3f48', 2316, x, y, z); const s = new T.Sprite(glowMat); s.scale.set(1.6, 1.6, 1); s.position.set(X(x), y, Z(z)); sc.add(s); barnGlow.push(s);
    P(box(0.12, 0.16, 0.12), '#ffd98a', 2317, x, y, z + 0.01); P(box(0.03, 0.14, 0.03), DK, 2318, x, y + 0.17, z); });
  /* a lantern hanging from the big back beam */
  P(box(0.03, 0.5, 0.03), DK, 2319, 0, 1.75, -4.45); P(box(0.18, 0.24, 0.18), '#3a3f48', 2316, 0, 1.4, -4.45); P(box(0.13, 0.18, 0.13), '#ffd98a', 2317, 0, 1.4, -4.44);
  { const s = new T.Sprite(glowMat); s.scale.set(1.8, 1.8, 1); s.position.set(X(0), 1.4, Z(-4.3)); sc.add(s); barnGlow.push(s); }
  merged(barnL); barnL.length = 0;
}

/* ---------- outside: a doormat ring at the barn doors and a picture over the barn when there is something to do ---------- */
const barnRing = mkRing(BDOOR.x, BDOOR.z);
const barnSign = new T.Sprite(new T.SpriteMaterial({ map: bubble('moon'), depthTest: false })); barnSign.renderOrder = 5; barnSign.scale.set(1.0, 1.0, 1); barnSign.visible = false; sc.add(barnSign);

/* ---------- the pad inside: pay hearts for a goat or more stalls ---------- */
const BPAD_AT = { x: BI.x + 2.6, z: BI.z + 2.4 };
const bpadC = document.createElement('canvas'); bpadC.width = bpadC.height = 256; const bpadT = new T.CanvasTexture(bpadC);
const bpad = new T.Mesh(new T.CircleGeometry(0.72, 32), new T.MeshBasicMaterial({ map: bpadT, transparent: true })); bpad.rotation.x = -Math.PI / 2; bpad.position.set(BPAD_AT.x, 0.09, BPAD_AT.z); sc.add(bpad);
const bpadEdge = new T.Mesh(new T.RingGeometry(0.72, 0.82, 32), new T.MeshBasicMaterial({ color: PAL.ochre })); bpadEdge.rotation.x = -Math.PI / 2; bpadEdge.position.set(BPAD_AT.x, 0.085, BPAD_AT.z); sc.add(bpadEdge);
let bpadShown = '', bpadTick = 0, bpadPoor = false, bpadGhost = null;
const nextBPad = () => tutOn() ? null : qPad('h', BPADS);
function drawBPad(p) {
  const left = p.cost - (barnS().paid[p.id] || 0), key = p.id + ':' + left; if (key === bpadShown) return; bpadShown = key;
  const x = bpadC.getContext('2d'); x.clearRect(0, 0, 256, 256);
  x.fillStyle = 'rgba(255,246,228,0.94)'; x.beginPath(); x.arc(128, 128, 120, 0, 7); x.fill();
  x.lineWidth = 10; x.strokeStyle = PAL.ochre; x.beginPath(); x.arc(128, 128, 112, -Math.PI / 2, -Math.PI / 2 + 6.2832 * (1 - left / p.cost)); x.stroke();
  drawIcon(x, p.kind === 'goat' ? 'goat' : 'stall', 128, 88, p.kind === 'goat' ? 1.2 : 1.25);
  drawIcon(x, 'heart', 76, 176, 0.75); x.fillStyle = PAL.ink; x.font = '700 58px Fredoka, sans-serif'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(fmt(left), 100, 178);
  bpadT.needsUpdate = true;
  /* a see-through goat stands next to a goat pad, so you can see what you get */
  if (bpadGhost) { sc.remove(bpadGhost); bpadGhost = null; }
  if (p.kind === 'goat') { const m = animalModel('goat', animals.filter((o) => o.a === 'goat').length + 1); bpadGhost = ghostOf(m.g); bpadGhost.position.set(BPAD_AT.x + 1.15, 0, BPAD_AT.z - 0.2); bpadGhost.rotation.y = -0.6; sc.add(bpadGhost); }
}
function buyBPad(p) {
  barnS().owned[p.id] = true; delete barnS().paid[p.id];
  Snd.play('success', { gain: 0.6, f: 'E6' }); Snd.play('sparkle', { gain: 0.6 }, 0.12); pop([BPAD_AT.x, BPAD_AT.z]);
  if (p.kind === 'goat') { const an = addAnimal('goat'), st = stallNear('goat') || STALLS[0]; putInStall(an, st, true); burst(st.x, 1, st.z, 8); Snd.animal('sheep', { gain: 0.6, rate: 1.25 }); }
  else syncStalls(true);
  bpadShown = ''; save();
}

/* ---------- moving animals in and out ---------- */
function putInStall(an, st, quiet) {
  st.an = an; st.held = null; an.inBarn = true; an.stall = st; an.follow = null; an.want = null; an.incoming = 0;
  an.g.position.set(st.x + (st.side ? st.side * 0.1 : 0), 0, st.z + (st.side ? 0 : 0.15));
  an.g.rotation.y = st.side === 0 ? 0 : st.side > 0 ? Math.PI / 2 : -Math.PI / 2;
  an.tx = an.g.position.x; an.tz = an.g.position.z; an.sp.visible = false; saveBarn();
}
function leaveStall(an) { if (an.stall) { an.stall.an = null; an.stall = null; } an.inBarn = false; saveBarn(); }
function saveBarn() { barnS().in = animals.filter((an) => an.inBarn).map(keyOf); }
function reward(an, big) {
  const n = Math.max(1, Math.round(HEARTS[an.a] * (big ? 1 : 0.5) * heartMult())), p = an.g.position;
  earn(n); coinToHud(p.x, an.h, p.z, Math.min(5, n)); burst(p.x, an.h, p.z, 5); an.hop = 1;
  Snd.animal(an.a === 'goat' ? 'sheep' : an.a, { gain: 0.5, gap: 900, rate: an.a === 'goat' ? 1.25 : 1 }); Snd.play('sparkle', { gain: 0.35 }, 0.05, 150);
}
function join(an, mode) {
  an.follow = { mode, st: null }; an.want = null; an.incoming = 0; an.sp.material.map = bubble('heart'); an.sp.visible = true; an.joinT = 1.2; an.hop = 1; an.asleep = false;
  if (mode === 'in') { const st = freeStall(); if (st) { st.held = an; an.follow.st = st; } }
  followers.push(an); Snd.animal(an.a === 'goat' ? 'sheep' : an.a, { gain: 0.45, gap: 600, rate: an.a === 'goat' ? 1.25 : 1 }); Snd.play('pop', { gain: 0.35, f: 600 + followers.length * 80 });
}
function unfollow(an) { const i = followers.indexOf(an); if (i >= 0) followers.splice(i, 1); if (an.follow && an.follow.st && an.follow.st.held === an) an.follow.st.held = null; an.follow = null; an.sp.visible = false; }
/* a spot on Pip's trail a given distance behind Pip */
function trailAt(d) {
  let px = pip.position.x, pz = pip.position.z;
  for (let i = trail.length - 1; i >= 0; i--) { const q = trail[i], l = Math.hypot(q.x - px, q.z - pz); if (l >= d) { const f = d / l; return [px + (q.x - px) * f, pz + (q.z - pz) * f]; } d -= l; px = q.x; pz = q.z; }
  return [px, pz];
}
function resetTrail(x, z, dx, dz) { trail.length = 0; for (let k = 8; k >= 1; k--) trail.push({ x: x + dx * k * 0.6, z: z + dz * k * 0.6 }); }
function lineUpBehind(x, z, dx, dz) { let d = 0.7; followers.forEach((an) => { d += sizeOf(an) / 2; an.g.position.set(x + dx * d, 0, z + dz * d); an.g.rotation.y = Math.atan2(-dx, -dz); d += sizeOf(an) / 2 + 0.15; }); }
function goBarn(to) {
  if (doorT > 0) return; doorT = 1; fadeEl.style.opacity = '1'; Snd.play('pop', { gain: 0.4, f: to ? 400 : 600 }); Snd.play('tock', { gain: 0.25, f: 220 }, 0.1);
  setTimeout(() => {
    inHouse = inBarn = to; const B = to ? BARN_IN : HOUSE_IN; IN_B.x0 = B.x0; IN_B.x1 = B.x1; IN_B.z0 = B.z0; IN_B.z1 = B.z1;
    if (to) { pip.position.set(BI.x, 0, BI.z + 3.6); pip.rotation.y = Math.PI; resetTrail(BI.x, BI.z + 3.6, 0, 1); lineUpBehind(BI.x, BI.z + 3.6, 0, 1); }
    else { pip.position.set(BDOOR.x + 0.4, 0, BDOOR.z + 1.6); pip.rotation.y = 0; resetTrail(BDOOR.x + 0.4, BDOOR.z + 1.6, -0.25, -0.97); lineUpBehind(BDOOR.x + 0.4, BDOOR.z + 1.6, -0.25, -0.97); }
    target.copy(pip.position); camFocus.copy(pip.position); lastP.copy(pip.position); barnRing.w = 0; doorRing.w = 0;
    /* everyone who followed Pip in heads for their stall */
    if (to) followers.slice().forEach((an) => { if (an.follow.mode === 'in') { const st = an.follow.st || freeStall(); unfollow(an); if (st) { st.held = an; an.walkIn = st; } } });
    if (to) regroup();
    setTimeout(() => { fadeEl.style.opacity = '0'; doorT = 0; }, 120);
  }, 420);
}
/* called for every grown-up animal at the top of the animal loop; returns true when the barn is in charge of it this frame */
function barnAnimal(an, dt) {
  if (an.hop > 0) an.hop = Math.max(0, an.hop - dt * 2.2);
  if (an.walkIn) { /* just came in with Pip: walk to the stall and settle */
    const st = an.walkIn, moving = !walkTo(an.g, st.x, st.z + (st.side ? 0 : 0.15), dt, 2.6);
    an.body.position.y = reduced ? 0 : Math.abs(Math.sin(time * 9)) * 0.05; an.sp.visible = false;
    if (!moving) { an.walkIn = null; putInStall(an, st); reward(an, true); tuckCheck(); }
    return true;
  }
  if (an.follow) {
    const f = an.follow; if (an.joinT > 0) { an.joinT -= dt; if (an.joinT <= 0) an.sp.visible = false; }
    if (f.mode === 'out' && bedtime()) { f.mode = 'in'; const st = freeStall(); if (st) { st.held = an; f.st = st; } }
    if (f.mode === 'in' && !bedtime()) { unfollow(an); leaveStall(an); return false; }
    /* out in the morning: home to the pen as soon as Pip brings it close */
    if (f.mode === 'out' && !inHouse) { const b = penBox(an.a); if (Math.abs(an.g.position.x - b.x) < b.w / 2 + 1.0 && Math.abs(an.g.position.z - b.z) < b.d / 2 + 1.0) { unfollow(an); leaveStall(an); an.tx = b.x + (Math.random() - 0.5) * (b.w - 1.2); an.tz = b.z + (Math.random() - 0.5) * (b.d - 1.0); an.cd = 6 + Math.random() * 8; reward(an, true); return false; } }
    let d = 0.55; for (const o of followers) { d += sizeOf(o) / 2; if (o === an) break; d += sizeOf(o) / 2 + 0.12; }
    const waiting = (inHouse && !inBarn) || !!trip, [tx, tz] = trailAt(d), far = Math.hypot(tx - an.g.position.x, tz - an.g.position.z);
    const moving = !waiting && far > 0.06 && !walkTo(an.g, tx, tz, dt, Math.max(1.6, speed() * (far > 1 ? 1.35 : 1.05)));
    an.body.position.y = Math.sin(an.hop * Math.PI) * 0.3 + (reduced ? 0 : moving ? Math.abs(Math.sin(time * 10 + an.tx)) * 0.05 : 0); zzz(an, false, dt);
    if (an.sp.visible) an.sp.position.y = an.h + 0.35;
    return true;
  }
  if (an.inBarn) {
    const st = an.stall, f = dayFrac(), asleep = isNight || f >= 0.95;
    if (st) { walkTo(an.g, st.x + (st.side ? st.side * 0.1 : 0), st.z + (st.side ? 0 : 0.15), dt, 1); an.g.rotation.y = st.side === 0 ? 0 : st.side > 0 ? Math.PI / 2 : -Math.PI / 2; }
    an.asleep = asleep; zzz(an, asleep, dt); an.want = null;
    const wantOut = !asleep && morning();
    if (wantOut) { if (an.sp.material.map !== bubble('sun')) an.sp.material.map = bubble('sun'); an.sp.visible = true; an.sp.position.y = an.h + 0.35 + (reduced ? 0 : Math.sin(time * 3 + st.i) * 0.05); }
    else an.sp.visible = false;
    an.body.position.y = Math.sin(an.hop * Math.PI) * 0.3 + (reduced || asleep ? 0 : Math.max(0, Math.sin(time * 1.3 + st.i * 1.7)) * 0.02);
    /* forgotten in the barn: they let themselves out around midday */
    if (!wantOut && !asleep && f >= 0.45 && f < 0.56 && !inBarn) { leaveStall(an); const b = penBox(an.a); an.g.position.set(b.x, 0, b.z); an.tx = b.x; an.tz = b.z; }
    return true;
  }
  /* evening: the bigger animals gather at the pen gate with a moon bubble (only while there is a stall free) */
  if (canBarn(an) && bedtime() && !an.ridden && roomLeft() > 0 && !inHouse) {
    const f = dayFrac();
    if (an.want) an.want = null; if (an.cd < 3) an.cd = 3;
    if (an.sp.material.map !== bubble('moon')) an.sp.material.map = bubble('moon'); an.sp.visible = true;
    an.sp.position.y = an.h + 0.35 + (reduced ? 0 : Math.sin(time * 3 + an.tx) * 0.05);
    if (f < 0.8) {
      const p = penBox(an.a), gap = 0.85, idx = animals.filter((o) => o.a === an.a && !o.inBarn).indexOf(an);
      an.tx = an.pen.trough[0]; an.tz = p.z + ((idx % 3) - 1) * gap;
      const moving = !walkTo(an.g, an.tx, an.tz, dt, 1.2); an.asleep = false; zzz(an, false, dt);
      if (!moving) an.g.rotation.y += (Math.atan2(penSide(an.a), 0) - an.g.rotation.y) * Math.min(1, dt * 4);
      an.body.position.y = Math.sin(an.hop * Math.PI) * 0.3 + (reduced ? 0 : moving ? Math.abs(Math.sin(time * 9 + an.tx)) * 0.04 : 0);
      return true;
    }
    return false; /* late at night they doze off in their pen house; they still come along if Pip fetches them */
  }
  if (an.sp.material.map === bubble('moon')) { an.sp.material.map = bubble(an.want || 'heart'); an.sp.visible = !!an.want; }
  return false;
}
let tuckedTonight = 0;
function tuckCheck() {
  tuckedTonight++;
  const outside = animals.filter((an) => canBarn(an) && !an.inBarn && !an.walkIn).length;
  if (!outside || !roomLeft()) { toastIcon('moon', 'Godnatt!'); Snd.play('success', { gain: 0.5, f: 'C6' }, 0.3); }
}
function syncStalls(pop) {
  const n = openStalls();
  STALLS.forEach((st, i) => { const open = i < n; if (st.block.visible === open) { st.block.visible = !open; if (open && pop) burst(st.x, 0.8, st.z, 5); }
    const k = !open ? '' : st.an ? st.an.a : 'empty'; if (k !== st.signK) { st.signK = k; st.sign.visible = open && k !== 'empty'; if (st.sign.visible) st.sign.material.map = bubble(k); } });
}
function barnInit() {
  const s = barnS(); s.owned = s.owned || {}; s.paid = s.paid || {};
  BPADS.forEach((p) => { if (p.kind === 'goat' && s.owned[p.id]) addAnimal('goat'); });
  (s.in || []).forEach((k) => { const [a, i] = k.split(':'), an = animals.filter((o) => o.a === a)[+i]; const st = freeStall(); if (an && st) putInStall(an, st, true); });
  regroup(); syncStalls(false);
}

/* morning: a kind Pip is already leading out comes first; another kind only joins once that kind's row is empty */
function sameTrip(an) {
  const kinds = new Set(followers.filter((o) => o.follow.mode === 'out').map((o) => o.a));
  if (!kinds.size || kinds.has(an.a)) return true;
  return !animals.some((o) => kinds.has(o.a) && o.inBarn && o.stall && !o.follow);
}
/* ---------- every frame ---------- */
function barnStep(dt) {
  if (!barnReady) { barnReady = true; barnInit(); }
  /* Pip's trail, for the animals walking behind */
  const lp = trail[trail.length - 1]; if (!lp || Math.hypot(pip.position.x - lp.x, pip.position.z - lp.z) > 0.15) { trail.push({ x: pip.position.x, z: pip.position.z }); if (trail.length > 90) trail.shift(); }
  const freeHands = !riding() && !dressing && !trip && doorT <= 0;
  if (!inBarn) {
    /* the barn is solid; its doormat takes Pip in */
    const ok = !inHouse && freeHands && stillOn(barnRing, dt);
    barnRing.w = ok ? Math.min(1, barnRing.w + dt / 0.5) : Math.max(0, barnRing.w - dt * 3); barnRing.f.scale.setScalar(Math.max(0.001, barnRing.w));
    if (barnRing.w >= 1) goBarn(true);
    /* evening: pick up waiting animals as Pip walks past */
    if (!inHouse && freeHands && bedtime() && followers.length < FOLLOW_MAX)
      for (const an of animals) { if (followers.length >= FOLLOW_MAX || roomLeft() <= followers.filter((o) => o.follow.mode === 'in' && !o.follow.st).length) break;
        if (!canBarn(an) || an.inBarn || an.follow || an.walkIn || an.ridden) continue;
        if (Math.hypot(an.g.position.x - pip.position.x, an.g.position.z - pip.position.z) < 2.0) join(an, 'in'); }
    /* the picture over the barn: a moon when animals are waiting to come in, a sun when animals inside want out */
    const waitIn = bedtime() && roomLeft() > 0 && animals.some((an) => canBarn(an) && !an.inBarn);
    const waitOut = morning() && animals.some((an) => an.inBarn && !an.follow);
    const icon = followers.some((o) => o.follow.mode === 'in') || waitIn ? 'moon' : waitOut ? 'sun' : null;
    barnSign.visible = !!icon && !inHouse; if (icon && barnSign.material.map !== bubble(icon)) barnSign.material.map = bubble(icon);
    barnSign.position.set(BARN.x, 3.55 + (reduced ? 0 : Math.sin(time * 2.4) * 0.12), BARN.z + 0.9);
    barnGlow.forEach((s) => { s.visible = false; });
  } else {
    barnSign.visible = false;
    /* inside: lanterns, the pad, stalls; out through the door */
    LAMP_LIGHTS.forEach((l, i) => { const p = BLIGHTS[i]; l.position.set(BI.x + p[0], p[1] - 0.2, BI.z + p[2] + 0.25); l.intensity = 2.4 * (0.9 + 0.1 * Math.sin(time * 8 + i * 2)); l.distance = 6.5; });
    barnGlow.forEach((s, i) => { s.visible = true; s.material.opacity = 0.55; });
    if (pip.position.z > BI.z + 4.6 && Math.abs(pip.position.x - BI.x) < 1.2 && doorT <= 0) goBarn(false);
    if (Math.abs(pip.position.x - BI.x) >= 1.2) pip.position.z = Math.min(pip.position.z, BI.z + 4.45);
    /* morning: animals in their stalls come along when Pip walks by */
    if (freeHands && morning()) for (const an of animals) { if (followers.length >= FOLLOW_MAX) break; if (!an.inBarn || an.follow || isNight) continue;
      if (!sameTrip(an)) continue;
      const st = an.stall; if (st && Math.hypot(st.x - pip.position.x, st.z - pip.position.z) < 2.4) join(an, 'out'); }
    const p = nextBPad();
    bpad.visible = bpadEdge.visible = !!p; if (bpadGhost) bpadGhost.visible = !!p;
    if (p) {
      drawBPad(p);
      const on = Math.hypot(pip.position.x - BPAD_AT.x, pip.position.z - BPAD_AT.z) < 0.7, still = Math.hypot(target.x - pip.position.x, target.z - pip.position.z) < 0.15;
      if (on && still && state.coins > 0) { const left = p.cost - (barnS().paid[p.id] || 0), amt = Math.min(state.coins, left, Math.max(1, Math.ceil(p.cost * dt / 1.4)));
        state.coins -= amt; barnS().paid[p.id] = (barnS().paid[p.id] || 0) + amt; bpadTick -= dt; if (bpadTick <= 0) { bpadTick = 0.08; Snd.play('tick', { gain: 0.3, f: 1200 }, 0, 70); }
        if (barnS().paid[p.id] >= p.cost) buyBPad(p); }
      if (on && still && state.coins <= 0 && !bpadPoor) { bpadPoor = true; Snd.play('tock', { gain: 0.3, f: 300 }); flash($('coins').parentNode, 'no'); }
      if (!on) bpadPoor = false;
      bpad.scale.setScalar(on ? 1.08 : 1 + (reduced ? 0 : Math.sin(time * 3) * 0.03));
    }
  }
  syncStalls(true);
}
/* where the guide arrow points while barn work is waiting */
function barnGoal() {
  if (inBarn) {
    const p = nextBPad();
    if (followers.some((o) => o.follow.mode === 'out')) return [BI.x, BI.z + 5.2];
    if (morning() && followers.length < FOLLOW_MAX) { const an = animals.find((o) => o.inBarn && !o.follow && o.stall && followers.some((f) => f.a === o.a)) || animals.find((o) => o.inBarn && !o.follow && o.stall && sameTrip(o)); if (an) return [an.stall.x + (an.stall.side ? -an.stall.side * 1.6 : 0), an.stall.z + (an.stall.side ? 0 : 1.6)]; }
    if (p && state.coins >= p.cost - (barnS().paid[p.id] || 0)) return [BPAD_AT.x, BPAD_AT.z];
    return [BI.x, BI.z + 5.2];
  }
  const inF = followers.filter((o) => o.follow.mode === 'in'), outF = followers.filter((o) => o.follow.mode === 'out');
  if (outF.length) { const b = penBox(outF[0].a); return [b.x, b.z]; }
  if (inF.length >= FOLLOW_MAX || (inF.length && (roomLeft() <= inF.length || !animals.some((an) => canBarn(an) && !an.inBarn && !an.follow)))) return [BDOOR.x, BDOOR.z];
  if (bedtime() && roomLeft() > inF.length) {
    let best = null, bd = 1e9; animals.forEach((an) => { if (!canBarn(an) || an.inBarn || an.follow || an.walkIn) return; const d = Math.hypot(an.g.position.x - pip.position.x, an.g.position.z - pip.position.z); if (d < bd) { bd = d; best = an; } });
    if (best) return feedPos(best.a);
    if (inF.length) return [BDOOR.x, BDOOR.z];
  }
  if (morning() && animals.some((an) => an.inBarn)) return [BDOOR.x, BDOOR.z];
  return null;
}
const barnTest = () => ({ barn: () => ({ inBarn, stalls: openStalls(), in: animals.filter((an) => an.inBarn).map(keyOf), fol: followers.map((an) => an.a + ':' + an.follow.mode + '@' + an.g.position.x.toFixed(1) + ',' + an.g.position.z.toFixed(1)), f: dayFrac().toFixed(2) }), goBarn, barnGoal: () => barnGoal() });
