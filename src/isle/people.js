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
const FORGE = { x: -2.9, z: -2.45 }, ANVIL = { x: -1.6, z: -1.95 }, SMITH_AT = { x: -1.6, z: -2.47 }, ANVIL_RING = { x: -1.6, z: -1.2 }; /* far enough behind the tent that the camera sees over it */
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
  return [SMITH_AT.x, SMITH_AT.z];
}
function smithPlace() { const [x, z] = smithSpot(); SM.g.position.set(x, 0, z); SM.g.rotation.y = 0; }

/* ---- the forge and the anvil ---- */
let forgeG = null, forgeGlow = null, forgeCoal = null, anvilRing = null;
const tierSp = isleSprite(isleBubble('pick2'), 0.8); tierSp.visible = false; sc.add(tierSp);
function forgeBuild(anim) {
  if (forgeG) return;
  const g = new T.Group(); g.position.set(FORGE.x, 0, FORGE.z); sc.add(g); const L = [];
  const stone = (w, h, d, x, y, z, k, base) => { const q = new T.BoxGeometry(w, h, d, Math.max(1, Math.round(w * 3)), Math.max(1, Math.round(h * 3)), Math.max(1, Math.round(d * 3))); jit(q, 0.02, 2930 + k); q.translate(x, y, z);
    L.push(fac(q, (cx, cy, cz, i) => shadeY(hash(i, k + 2) > 0.82 ? '#a39883' : base || '#bdb3a0', cy, 0, 1.6, i, 0.45), 2930 + k)); };
  stone(1.35, 0.78, 1.0, 0, 0.39, 0, 0); /* the hearth */
  stone(1.48, 0.12, 1.1, 0, 0.84, 0, 1, '#958b78');
  stone(0.5, 1.45, 0.5, -0.36, 1.6, -0.22, 2, '#a99f8c'); /* the chimney */
  stone(0.62, 0.1, 0.62, -0.36, 2.36, -0.22, 3, '#8a806e');
  /* the anvil on a log, in front and to the side */
  const ax = ANVIL.x - FORGE.x, az = ANVIL.z - FORGE.z;
  let q = new T.CylinderGeometry(0.22, 0.26, 0.4, 10); q.translate(ax, 0.2, az); L.push(fac(q, (cx, cy, cz, i) => cy > 0.38 ? new T.Color('#e7c48f') : tone('#9a6a3e', i, 0.6), 2940));
  q = new T.BoxGeometry(0.2, 0.12, 0.14); q.translate(ax, 0.46, az); L.push(fac(q, '#3e454d', 2941));
  q = new T.BoxGeometry(0.46, 0.13, 0.22); q.translate(ax, 0.58, az); L.push(fac(q, (cx, cy) => new T.Color(cy > 0.62 ? '#7d8791' : '#4b535c'), 2942));
  q = new T.ConeGeometry(0.075, 0.24, 7); q.rotateZ(-Math.PI / 2); q.translate(ax + 0.34, 0.6, az); L.push(fac(q, '#4b535c', 2943));
  /* a water bucket by the hearth */
  q = new T.CylinderGeometry(0.17, 0.14, 0.3, 10); q.translate(0.95, 0.15, -0.25); L.push(fac(q, (cx, cy, cz, i) => tone(Math.abs(cy - 0.15) < 0.05 ? '#5a3a22' : '#a8774f', i, 0.5), 2944));
  merged(L.map((q) => (q.index ? q.toNonIndexed() : q)), MAT, g);
  /* the mouth of the hearth: dark, with glowing coals; a glow on top too */
  q = new T.PlaneGeometry(0.62, 0.4); q.translate(0.18, 0.4, 0.505); g.add(new T.Mesh(q, new T.MeshBasicMaterial({ color: '#2a2018' })));
  forgeCoal = new T.Mesh(new T.PlaneGeometry(0.52, 0.18), new T.MeshBasicMaterial({ color: '#ff8a3a' })); forgeCoal.position.set(0.18, 0.3, 0.51); g.add(forgeCoal);
  const bed = new T.Mesh(new T.BoxGeometry(0.62, 0.05, 0.5), new T.MeshBasicMaterial({ color: '#ff7a2a' })); bed.position.set(0.25, 0.92, 0.08); g.add(bed);
  forgeGlow = new T.Sprite(new T.SpriteMaterial({ map: softTex(32, 32), color: '#ffb060', transparent: true, opacity: 0.5, depthWrite: false })); forgeGlow.position.set(0.22, 0.75, 0.7); forgeGlow.scale.set(1.5, 1.2, 1); g.add(forgeGlow);
  forgeG = g;
  anvilRing = new T.Mesh(new T.RingGeometry(0.45, 0.6, 28), ringMat); anvilRing.rotation.x = -Math.PI / 2; anvilRing.position.set(ANVIL_RING.x, 0.035, ANVIL_RING.z); sc.add(anvilRing);
  if (anim) { g.scale.setScalar(0.01); bldPop = { g, t: 0 }; burst(FORGE.x, 1.2, FORGE.z, 12); burst(ANVIL.x, 0.9, ANVIL.z, 6); }
}

function peopleInit() {
  const F = folk(); F.smith = F.smith || 0;
  if (!F.smith && state.isle.ruins.h3) F.smith = 1; /* the cottage was opened before she lived there */
  if (!SM.g) SM.g = smithModel();
  SM.g.visible = F.smith >= 1 && (F.smith > 1 || HAS.h3); if (SM.g.visible) smithPlace();
  if (F.smith >= 3) forgeBuild(false);
  tierSp.material.map = isleBubble('pick' + Math.min(3, toolTier() + 1));
  TOOL.re(); bakerInit();
}
/* the cottage on h3 just opened: she steps out once the treasure has rolled out */
function peopleRuinOpen(R) { bakerRuinOpen(R); if (R.A.id === 'h3' && !folk().smith) { folk().smith = 1; SM.wait = 2.2; } }

function peopleWants(want) {
  const F = state.isle.folk; if (!F || !SM.g) return;
  if (F.smith === 1 && SM.g.visible && !SM.wait && !SM.move) want.set('p:smith', { kind: 'person', who: 'smith' });
  if (F.smith === 2 && !SM.move) want.set('f:forge', { kind: 'plot', who: 'forge' });
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
  if (w.kind === 'plot') { signMake({ key, kind: 'plot', A: null, cost: FORGE_COST, x: -0.5, z: -1.4, ghostGeo: plotGhostGeo, ghostTex, gx: FORGE.x + 0.45, gz: FORGE.z + 0.2, gy: 0.04 }); return true; }
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
  if (F.smith === 2 && SM.arr > 0 && Math.hypot(pp.x - SMITH_AT.x, pp.z - SMITH_AT.z) > 4) return [ANVIL_RING.x, ANVIL_RING.z]; /* she moved: show where to */
  if (F.smith === 3 && toolTier() < 3 && bldCan('tool') && Math.hypot(pp.x, pp.z) < 14 && carry.count() < cap()) return [ANVIL_RING.x, ANVIL_RING.z];
  return null;
}

let anvilIn = false, hamT = 0;
function peopleStep(dt) {
  bakerStep(dt);
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
    const bx = pp.x - FORGE.x, bz = pp.z - FORGE.z; if (Math.abs(bx) < 1.0 && Math.abs(bz) < 0.8) { if (1.0 - Math.abs(bx) < 0.8 - Math.abs(bz)) pp.x = FORGE.x + Math.sign(bx || 1) * 1.0; else pp.z = FORGE.z + Math.sign(bz || 1) * 0.8; }
    const ad = Math.hypot(pp.x - ANVIL.x, pp.z - ANVIL.z); if (ad < 0.45 && ad > 1e-4) { pp.x = ANVIL.x + (pp.x - ANVIL.x) / ad * 0.45; pp.z = ANVIL.z + (pp.z - ANVIL.z) / ad * 0.45; }
    /* the mat in front of the anvil opens her card */
    const inR = Math.hypot(pp.x - ANVIL_RING.x, pp.z - ANVIL_RING.z) < 0.55; if (!inR) anvilIn = false; else if (!anvilIn && BM.menu && BM.menu.hidden) { anvilOpen(); anvilIn = !BM.menu.hidden; } /* once per visit; waits for a new star's card */
    anvilRing.material.opacity = 0.55;
    /* over her head: the next tool she can make */
    tierSp.visible = toolTier() < 3 && !SM.gift; if (tierSp.visible) { const can = bldCan('tool'); tierSp.position.set(g.position.x, 2.15 + (reduced ? 0 : Math.sin(time * 2) * 0.05), g.position.z); tierSp.scale.setScalar(0.8 * (can && !reduced ? 1 + Math.sin(time * 5) * 0.08 : 1)); tierSp.material.opacity = can ? 1 : 0.7; }
  }
  if (SM.gift) { const G = SM.gift; G.t += dt; G.sp.position.y = 1.0 + G.t * 1.6; G.sp.material.opacity = Math.max(0, 1 - Math.max(0, G.t - 0.9) * 2); if (G.t > 1.5) { sc.remove(G.sp); SM.gift = null; } }
}
