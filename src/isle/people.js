/* ---------- people who rebuild the camp (Leon, 2026-11-24): first, the smith ----------
   A bear in a leather apron hides in the old cottage on the second rocks island. When Pip knocks the planks off, she
   steps out and shows a picture of what she needs (stones). Pip brings them from the counters and she moves to the camp,
   next to a dashed plot. Paying the plot builds her forge and anvil. At the anvil she makes better tools: copper, then
   crystal (paid with coins). Each level opens the next tier of trees, rocks and crystals (tiers.js): the orchard oaks,
   the stone islands and the cave need copper, the winter island crystal. A weaker tool just bounces off.
   state.isle.folk.smith: 0 in the cottage, 1 found (wants stones), 2 at the camp (forge plot), 3 forge built. */
const TIER_NEED = {}; /* (old: ore) */
const TIER_COL = [null, null, '#d9804a', '#62c8ee'];
function toolCol(hex) {
  let tr = 1; try { tr = toolTier(); } catch (e) {} /* the tools are first made before the game is loaded */
  const c = new T.Color(hex); if (tr < 2) return c;
  const l = (c.r + c.g + c.b) / 3; return new T.Color(TIER_COL[tr]).multiplyScalar(0.45 + l * 0.75);
}

function oreItemGeo() { const a = ico(0.13, 1, 2910); a.scale(1.15, 0.85, 1); return fac(a, (cx, cy, cz, i) => i % 4 === 0 ? tone('#d9773a', i, 0.5) : shadeY('#6a7078', cy, -0.12, 0.12, i, 0.5), 2910); }
function peopleIcon(x, t) {
  const blob = (f) => { x.fillStyle = f; x.fill(); x.stroke(); };
  if (t === 'ore') { x.beginPath(); x.moveTo(-18, 9); x.quadraticCurveTo(-21, -7, -6, -13); x.quadraticCurveTo(12, -16, 19, -2); x.quadraticCurveTo(21, 12, 5, 13); x.quadraticCurveTo(-11, 15, -18, 9); x.closePath(); blob('#6a7078');
    x.fillStyle = '#e08a3c'; [[-7, -3, 4], [6, 4, 3.4], [9, -7, 2.6]].forEach(([a, b, r]) => { x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); }); x.fillStyle = '#ffe28a'; x.beginPath(); x.arc(-2, 6, 2, 0, 7); x.fill(); }
}

/* ---- where things stand at the camp: the forge north-west of the tent, the anvil in front of it, the smith behind the anvil ---- */
/* (position: see rules.js) */ /* the smithy is in h1, east of the camp */ // /* the south-west corner of the settlement */ // /* far enough behind the tent that the camera sees over it */
const SMITH_WANT = { stone: 8 }, FORGE_COST = { stone: 12, log: 10 };
const SM = { g: null, hammer: null, pop: 0, hop: 0, move: null, swing: 0, arr: 0 };
const folk = () => state.isle.folk || (state.isle.folk = {});
const forgeUp = () => !!(state.isle && state.isle.folk && state.isle.folk.smith >= 3);

function smithModel() {
  const g = new T.Group(), body = guestModel2('bear'); body.scale.setScalar(1.3); g.add(body);
  const L = [];
  let q = new T.CylinderGeometry(0.2, 0.25, 0.42, 12, 1, true, -1.1, 2.2); q.translate(0, 0.38, 0.03); L.push(fac(q, (cx, cy, cz, i) => shadeY('#7a4a2a', cy, 0.15, 0.6, i, 0.4), 2920)); /* the apron */
  q = new T.BoxGeometry(0.3, 0.035, 0.03); q.translate(0, 0.58, 0.23); L.push(fac(q, '#5a3a22', 2921));
  q = new T.BoxGeometry(0.11, 0.08, 0.02); q.translate(0.06, 0.35, 0.27); L.push(fac(q, '#a8774f', 2922)); /* a pocket */
  const ap = new T.Group(); ap.scale.setScalar(1.3); merged(L, MAT, ap); g.add(ap);
  /* her hammer, in the right paw: it swings at the anvil once the forge is built */
  const h = new T.Group(); h.position.set(0.36, 0.56, 0.1); const H = [];
  q = new T.CylinderGeometry(0.028, 0.03, 0.42, 6); q.translate(0, 0.0, 0); q.rotateX(Math.PI / 2); q.translate(0, 0, 0.18); H.push(fac(q, '#a8774f', 2925));
  q = new T.BoxGeometry(0.11, 0.11, 0.22); q.rotateY(Math.PI / 2); q.translate(0, 0, 0.4); H.push(fac(q, '#4b535c', 2926));
  merged(H, MAT, h); h.rotation.x = -0.7; g.add(h); SM.hammer = h;
  sc.add(g); return g;
}
/* where the smith stands now: by the cottage door (a step to the side, so the treasure can roll out), or at the camp */
function smithSpot() {
  if (folk().smith === 1) { const R = ruins.find((r) => r.A.id === 'h3'); if (R) { const c = Math.cos(R.rot), s = Math.sin(R.rot), P = [1, -1].map((k) => [R.x + s * 1.75 + c * 0.95 * k, R.z + c * 1.75 - s * 0.95 * k]);
    const busy = ([x, z]) => nodes.filter((n) => n.kind !== 'planks' && (Math.hypot(n.x - x, n.z - z) < 1.3 || (Math.abs(n.x - x) < 1.2 && n.z > z && n.z - z < 3))).length; return busy(P[0]) <= busy(P[1]) ? P[0] : P[1]; } } /* the side of the door with fewer trees in the way */
  if (!HAS.h1) { SM.away = 1; return [1.5, 1.0]; } /* her corner of the island is still under the sea: she waits by the fire */
  SM.away = 0; return [SMITH_AT.x, SMITH_AT.z];
}
function smithPlace() { const [x, z] = smithSpot(); SM.g.position.set(x, 0, z); SM.g.rotation.y = 0; }

/* ---- the forge and the anvil ---- */
let forgeG = null, forgeGlow = null, forgeCoal = null, anvilRing = null;
const tierSp = isleSprite(isleBubble('pick2'), 0.8); tierSp.visible = false; sc.add(tierSp);
function forgeBuild(anim) {
  if (forgeG) return;
  const g = new T.Group(); g.position.set(FORGE.x, 0, FORGE.z); sc.add(g); const L = [];
  kitStone(L, 1.4, 0.8, 1.05, 0, 0, 0, 2930, { hole: [-0.3, 0.3, 0, 0.4], th: 0.16 }); /* the hearth, with its mouth */
  kitStone(L, 1.54, 0.1, 1.17, 0, 0.8, 0, 3300, { ch: 0.1, bl: 0.42, cols: ['#958b78', '#8a806e', '#a0957f'] });
  let q = new T.BoxGeometry(0.86, 0.13, 0.2); q.translate(0, 0.47, 0.5); L.push(fac(q, (cx, cy) => shadeY('#8f8674', cy, 0, 1.4, 5, 0.4), 3310)); /* the lintel */
  kitStone(L, 0.58, 1.5, 0.58, -0.38, 0.9, -0.22, 3320, { ch: 0.19, bl: 0.29, cols: ['#a99f8c', '#9a917f', '#b5ab98', '#8f8674'] }); /* the chimney */
  kitStone(L, 0.7, 0.1, 0.7, -0.38, 2.4, -0.22, 3400, { ch: 0.1, bl: 0.35, cols: ['#8a806e', '#7d7464'] });
  q = new T.BoxGeometry(0.4, 0.06, 0.4); q.translate(-0.38, 2.5, -0.22); L.push(fac(q, () => new T.Color('#2e2a26'), 3410));
  for (let k = 0; k < 9; k++) { const c = ico(0.07 + hash(k, 4) * 0.03, 0, 3420 + k); c.scale(1, 0.6, 1); c.translate(0.3 + Math.cos(k * 0.7) * 0.3, 0.92, 0.05 + Math.sin(k * 0.7) * 0.25); L.push(fac(c, () => tone('#6f675a', k, 0.6), 3420 + k)); } /* a ring of stones round the coal bed */
  /* a tool shed on the side: posts, a shingle roof, split logs, a hammer and tongs on the rail */
  [[-0.92, -0.5, 1.66], [-0.92, 0.42, 1.66], [-1.8, -0.5, 1.32], [-1.8, 0.42, 1.32]].forEach(([x, z, h], k) => { q = new T.BoxGeometry(0.09, h, 0.09); q.translate(x, h / 2, z); L.push(fac(q, (cx, cy) => shadeY('#8a5f3c', cy, 0, 1.9, k, 0.4), 3430 + k)); });
  kitRoof(L, 1.2, 1.15, 1.3, 0.4, 3440, { one: true, x: -1.36, z: -0.04, ry: -Math.PI / 2, cols: ['#7d6a56', '#6f5d4b', '#8a7660', '#655443'] });
  for (let k = 0; k < 9; k++) { const row = k < 4 ? 0 : k < 7 ? 1 : 2, i = k - [0, 4, 7][row], lx = -1.68 + i * 0.19 + row * 0.095, ly = 0.09 + row * 0.16;
    q = new T.CylinderGeometry(0.088, 0.088, 0.62, 8); q.rotateX(Math.PI / 2); q.translate(lx, ly, -0.12); L.push(fac(q, () => tone(k % 2 ? '#a8774f' : '#96683f', k, 0.6), 3460 + k));
    q = new T.CylinderGeometry(0.068, 0.068, 0.012, 8); q.rotateX(Math.PI / 2); q.translate(lx, ly, 0.195); L.push(fac(q, () => tone('#e7c48f', k, 0.4), 3470 + k)); }
  q = new T.BoxGeometry(0.92, 0.06, 0.06); q.translate(-1.36, 1.12, 0.42); L.push(fac(q, () => new T.Color('#7a5436'), 3480));
  q = new T.CylinderGeometry(0.02, 0.02, 0.42, 5); q.translate(-1.5, 0.88, 0.47); L.push(fac(q, () => new T.Color('#c99158'), 3481)); q = new T.BoxGeometry(0.2, 0.1, 0.1); q.translate(-1.5, 0.68, 0.47); L.push(fac(q, () => new T.Color('#4b535c'), 3482));
  [-0.03, 0.03].forEach((dx, k) => { q = new T.BoxGeometry(0.02, 0.5, 0.02); q.rotateZ(dx * 2.5); q.translate(-1.2 + dx, 0.85, 0.47); L.push(fac(q, () => new T.Color('#3e454d'), 3483 + k)); });
  /* the anvil on a log, in front and to the side */
  const ax = ANVIL.x - FORGE.x, az = ANVIL.z - FORGE.z;
  q = new T.CylinderGeometry(0.22, 0.26, 0.4, 12); q.translate(ax, 0.2, az); L.push(fac(q, (cx, cy, cz, i) => cy > 0.38 ? new T.Color('#e7c48f') : shadeY(Math.floor((Math.atan2(cz - az, cx - ax) + 3.15) / 0.5) % 2 ? '#9a6a3e' : '#8a5c34', cy, 0, 0.5, i, 0.3), 2940));
  q = new T.BoxGeometry(0.26, 0.05, 0.2); q.translate(ax, 0.425, az); L.push(fac(q, () => new T.Color('#353b42'), 2945));
  q = new T.BoxGeometry(0.16, 0.12, 0.13); q.translate(ax, 0.5, az); L.push(fac(q, () => new T.Color('#3e454d'), 2941));
  q = new T.BoxGeometry(0.48, 0.13, 0.22); q.translate(ax, 0.62, az); L.push(fac(q, (cx, cy) => new T.Color(cy > 0.66 ? '#8c96a0' : '#4b535c'), 2942));
  q = new T.ConeGeometry(0.075, 0.26, 8); q.rotateZ(-Math.PI / 2); q.translate(ax + 0.36, 0.64, az); L.push(fac(q, () => new T.Color('#4b535c'), 2943));
  /* a quench bucket by the hearth */
  q = new T.CylinderGeometry(0.19, 0.15, 0.32, 12); q.translate(1.0, 0.16, -0.25); L.push(fac(q, (cx, cy, cz, i) => Math.abs(cy - 0.08) < 0.03 || Math.abs(cy - 0.25) < 0.03 ? new T.Color('#4a4f57') : shadeY(Math.floor((Math.atan2(cz + 0.25, cx - 1.0) + 3.15) / 0.52) % 2 ? '#a8774f' : '#96683f', cy, 0, 0.4, i, 0.3), 2944));
  q = new T.CylinderGeometry(0.16, 0.16, 0.01, 12); q.translate(1.0, 0.3, -0.25); L.push(fac(q, () => new T.Color('#4f8fae'), 2946));
  merged(L, MAT, g);
  /* the mouth of the hearth: dark, deep, with glowing coals; a coal bed with a flame on top */
  q = new T.PlaneGeometry(0.72, 0.42); q.translate(0, 0.2, 0.33); g.add(new T.Mesh(q, new T.MeshBasicMaterial({ color: '#1f1712' })));
  { const C = []; for (let k = 0; k < 8; k++) { const c = ico(0.05 + hash(k, 8) * 0.03, 0, 3500 + k); c.translate(-0.24 + k * 0.07, 0.05 + hash(k, 2) * 0.03, 0.38 + hash(k, 5) * 0.08); C.push(c); }
    for (let k = 0; k < 10; k++) { const c = ico(0.045 + hash(k, 9) * 0.03, 0, 3520 + k); c.translate(0.3 + Math.cos(k * 2.4) * 0.17 * hash(k, 1), 0.94, 0.05 + Math.sin(k * 2.4) * 0.15 * hash(k, 3)); C.push(c); }
    forgeCoal = new T.Mesh(mergeGeos(C), new T.MeshBasicMaterial({ color: '#ff8a3a' })); g.add(forgeCoal); }
  kitFlame(g, 0.3, 0.95, 0.05, 1.1); kitFlame(g, -0.05, 0.05, 0.4, 0.7);
  forgeGlow = new T.Sprite(new T.SpriteMaterial({ map: softTex(32, 32), color: '#ffb060', transparent: true, opacity: 0.5, depthWrite: false })); forgeGlow.position.set(0.1, 0.75, 0.7); forgeGlow.scale.set(1.5, 1.2, 1); g.add(forgeGlow);
  lookFoot(FORGE.x, FORGE.z, 0.85, 0.7); lookFoot(FORGE.x - 1.36, FORGE.z - 0.04, 0.6); lookFoot(ANVIL.x, ANVIL.z, 0.35);
  forgeG = g;
  anvilRing = ropeRing(0.45, 0.6); anvilRing.rotation.x = -Math.PI / 2; anvilRing.position.set(ANVIL_RING.x, 0.035, ANVIL_RING.z); sc.add(anvilRing);
  if (anim) { g.scale.setScalar(0.01); bldPop = { g, t: 0 }; burst(FORGE.x, 1.2, FORGE.z, 12); burst(ANVIL.x, 0.9, ANVIL.z, 6); }
}

function peopleInit() {
  const F = folk(); F.smith = F.smith || 0;
  if (!F.smith && state.isle.ruins.h3) F.smith = 1; /* the cottage was opened before she lived there */
  if (!SM.g) SM.g = smithModel();
  SM.g.visible = F.smith >= 1 && (F.smith > 1 || HAS.h3); if (SM.g.visible) smithPlace();
  if (F.smith >= 3) forgeBuild(false);
  tierSp.material.map = isleBubble('pick' + Math.min(3, toolTier() + 1));
  TOOL.re(); bakerInit(); villageSync(false);
}
/* the cottage on h3 just opened: she steps out once the treasure has rolled out */
function peopleRuinOpen(R) { bakerRuinOpen(R); if (R.A.id === 'h3' && !folk().smith) { folk().smith = 1; SM.wait = 2.2; } }

function peopleWants(want) {
  const F = state.isle.folk; if (!F || !SM.g) return;
  if (F.smith === 1 && SM.g.visible && !SM.wait && !SM.move) want.set('p:smith', { kind: 'person', who: 'smith' });
  if (F.smith === 2 && !SM.move && HAS.h1) want.set('f:forge', { kind: 'plot', who: 'forge' });
  bakerWants(want);
}
const tinyGeo = new T.PlaneGeometry(0.01, 0.01);
const plotGhostGeo = (() => { const g = new T.PlaneGeometry(2.9, 1.9, 6, 4); g.rotateX(-Math.PI / 2); return g; })();
function peopleSignMake(w, key) {
  if (w.who === 'baker' || w.who === 'oven') return bakerSignMake(w, key);
  if (w.kind === 'person') {
    const [x, z] = smithSpot(), s = signMake({ key, kind: 'person', A: null, cost: SMITH_WANT, x, z, ghostGeo: tinyGeo, ghostTex, gx: x, gz: z, gy: -5 });
    s.g.children.forEach((m) => { if (m.isMesh) m.visible = false; }); s.ghost.visible = false; s.ring.scale.setScalar(1.35); return true;
  }
  if (w.kind === 'plot') { signMake({ key, kind: 'plot', A: null, cost: FORGE_COST, x: ANVIL_RING.x + 0.9, z: ANVIL_RING.z - 0.2, ghostGeo: plotGhostGeo, ghostTex, gx: FORGE.x + 0.45, gz: FORGE.z + 0.2, gy: 0.04 }); return true; }
  return false;
}
function peopleBuy(s) {
  if (s.who === 'baker' || s.who === 'oven') return bakerBuy(s);
  if (s.kind === 'person') { folk().smith = 2; SM.move = { t: 0, from: [SM.g.position.x, SM.g.position.z] }; Snd.play('success', { gain: 0.5, f: 'E6' }); burst(SM.g.position.x, 1.5, SM.g.position.z, 10); xpGain(10); return true; }
  if (s.kind === 'plot') { folk().smith = 3; forgeBuild(true); anvilIn = true; Snd.play('success', { gain: 0.5, f: 'C6' }); Snd.play('sparkle', { gain: 0.4 }, 0.15); xpGain(15); bldBadge(); SM.hop = 1; return true; }
  return false;
}
/* a new tool level: the tools are made again in the new colour, sparks fly off the anvil and she hops */
function toolUp() {
  TOOL.re(); SM.hop = 1; burst(ANVIL.x, 0.9, ANVIL.z, 10); splash(ANVIL.x, 0.7, ANVIL.z, 8);
  tierSp.material.map = isleBubble('pick' + Math.min(3, toolTier() + 1)); hintSp.visible = false;
  /* the new pick flies up out of the anvil to Pip */
  const sp = isleSprite(isleBubble('pick' + toolTier()), 0.9); sp.position.set(ANVIL.x, 1.0, ANVIL.z); sc.add(sp); SM.gift = { sp, t: 0 };
}
function anvilOpen() { if (!forgeUp() || !BM.menu) return; const xu = document.querySelector('.xpUp'); if (xu && !xu.hidden) return; /* a new star's card first */ BM.keys = ['tool']; bldFill(); BM.menu.hidden = false; Snd.play('pop', { gain: 0.3, f: 520 }); }

function peopleGoal() {
  const bg = bakerGoal(); if (bg) return bg;
  const F = state.isle.folk; if (!F || !SM.g) return null; const pp = pip.position;
  if (F.smith === 2 && SM.arr > 0 && !SM.away && Math.hypot(pp.x - SMITH_AT.x, pp.z - SMITH_AT.z) > 4) return [ANVIL_RING.x, ANVIL_RING.z]; /* she moved: show where to */
  if (F.smith === 3 && toolTier() < 3 && bldCan('tool') && Math.hypot(pp.x, pp.z) < 14 && carry.count() < cap()) return [ANVIL_RING.x, ANVIL_RING.z];
  return null;
}

let anvilIn = false, hamT = 0;
function peopleStep(dt) {
  bakerStep(dt); villageStep(dt); dogStepIsle(dt); gearStep(dt); lookStep();
  if (!SM.g) return;
  const F = folk(), g = SM.g, pp = pip.position;
  /* she steps out of the cottage */
  if (SM.wait) { SM.wait -= dt; if (SM.wait <= 0) { SM.wait = 0; smithPlace(); g.visible = true; SM.pop = 0.001; g.scale.setScalar(0.01); Snd.play('success', { gain: 0.45, f: 'A5' }); burst(g.position.x, 1.4, g.position.z, 8); isleSigns(); } }
  if (SM.pop) { SM.pop = Math.min(1, SM.pop + dt * 2); g.scale.setScalar(SM.pop < 0.7 ? SM.pop / 0.7 * 1.1 : 1.1 - (SM.pop - 0.7) / 0.3 * 0.1); if (SM.pop >= 1) { SM.pop = 0; g.scale.setScalar(1); } }
  /* moving to the camp: two happy hops, a puff, and she pops up by the camp (where the guide arrow then points) */
  if (SM.move) { const M = SM.move; M.t += dt;
    if (M.t < 1.0) { g.position.y = Math.abs(Math.sin(M.t * Math.PI * 2)) * 0.35; }
    else if (M.t < 1.35) { g.scale.setScalar(Math.max(0.01, 1 - (M.t - 1.0) / 0.35)); if (!M.puff) { M.puff = 1; Snd.play('whoosh', { gain: 0.4 }); burst(g.position.x, 0.8, g.position.z, 6); } }
    else { SM.move = null; g.position.y = 0; smithPlace(); SM.pop = 0.001; g.scale.setScalar(0.01); SM.arr = 25; Snd.play('pop', { gain: 0.4, f: 640 }); burst(g.position.x, 1.2, g.position.z, 8); isleSigns(); save(); } }
  if (SM.away && HAS.h1 && F.smith >= 2 && !SM.move && !rising) { smithPlace(); SM.pop = 0.001; g.scale.setScalar(0.01); SM.arr = 25; burst(g.position.x, 1.2, g.position.z, 8); isleSigns(); }
  SM.arr = Math.max(0, SM.arr - dt);
  if (!g.visible) return;
  /* standing about: a little bob, turned to Pip when Pip is close */
  if (!SM.move) {
    SM.hop = Math.max(0, SM.hop - dt * 1.6); g.position.y = SM.hop > 0 ? Math.abs(Math.sin(SM.hop * Math.PI * 3)) * 0.3 : 0;
    const d = Math.hypot(pp.x - g.position.x, pp.z - g.position.z), face = d < 4 && F.smith < 3 ? Math.atan2(pp.x - g.position.x, pp.z - g.position.z) : 0;
    let df = face - g.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); g.rotation.y += df * Math.min(1, dt * 5);
    g.children[0].scale.y = 1.3 * (1 + (reduced ? 0 : Math.sin(time * 2.2) * 0.02));
    if (d < 0.5 && d > 1e-4) { pp.x = g.position.x + (pp.x - g.position.x) / d * 0.5; pp.z = g.position.z + (pp.z - g.position.z) / d * 0.5; }
  }
  /* at the forge: she taps the anvil, the coals flicker; sparks and a soft ting when Pip is near */
  if (F.smith >= 3 && forgeG) {
    SM.swing += dt; const u = (SM.swing % 1.3) / 1.3, a = u < 0.6 ? -0.7 - 1.0 * Math.sin(u / 0.6 * Math.PI / 2) : -1.7 + 1.9 * Math.min(1, (u - 0.6) / 0.12);
    SM.hammer.rotation.x = reduced ? -0.7 : Math.min(0.2, a);
    hamT -= dt; if (u > 0.72 && hamT <= 0) { hamT = 1.0; const d = Math.hypot(pp.x - ANVIL.x, pp.z - ANVIL.z); if (d < 7 && !reduced) splash(ANVIL.x, 0.68, ANVIL.z, 3); if (d < 4.5) Snd.play('tock', { gain: 0.12, f: 1500 + Math.random() * 200 }); }
    const fl = reduced ? 1 : 0.85 + Math.sin(time * 9) * 0.1 + Math.sin(time * 23) * 0.05; forgeCoal.material.color.setRGB(1, 0.5 * fl, 0.2 * fl); forgeGlow.material.opacity = (isNight ? 0.75 : 0.4) * fl;
    /* Pip walks round the hearth and the anvil */
    const fx = FORGE.x - 0.45, bx = pp.x - fx, bz = pp.z - FORGE.z; if (Math.abs(bx) < 1.5 && Math.abs(bz) < 0.8) { if (1.5 - Math.abs(bx) < 0.8 - Math.abs(bz)) pp.x = fx + Math.sign(bx || 1) * 1.5; else pp.z = FORGE.z + Math.sign(bz || 1) * 0.8; }
    const ad = Math.hypot(pp.x - ANVIL.x, pp.z - ANVIL.z); if (ad < 0.45 && ad > 1e-4) { pp.x = ANVIL.x + (pp.x - ANVIL.x) / ad * 0.45; pp.z = ANVIL.z + (pp.z - ANVIL.z) / ad * 0.45; }
    /* the mat in front of the anvil opens her card */
    const inR = Math.hypot(pp.x - ANVIL_RING.x, pp.z - ANVIL_RING.z) < 0.55; if (!inR) anvilIn = false; else if (!anvilIn && BM.menu && BM.menu.hidden) { anvilOpen(); anvilIn = !BM.menu.hidden; } /* once per visit; waits for a new star's card */
    anvilRing.material.opacity = 0.55;
    /* over her head: the next tool she can make */
    tierSp.visible = toolTier() < 3 && !SM.gift; if (tierSp.visible) { const can = bldCan('tool'); tierSp.position.set(g.position.x, 2.15 + (reduced ? 0 : Math.sin(time * 2) * 0.05), g.position.z); tierSp.scale.setScalar(0.8 * (can && !reduced ? 1 + Math.sin(time * 5) * 0.08 : 1)); tierSp.material.opacity = can ? 1 : 0.7; }
  }
  if (SM.gift) { const G = SM.gift; G.t += dt; G.sp.position.y = 1.0 + G.t * 1.6; G.sp.material.opacity = Math.max(0, 1 - Math.max(0, G.t - 0.9) * 2); if (G.t > 1.5) { sc.remove(G.sp); SM.gift = null; } }
}
