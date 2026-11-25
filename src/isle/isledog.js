/* ---------- the dog helps (Leon's vision for Pips Island, 2026-11-24) ----------
   The dog house card in the build menu teaches the dog new tricks, one per level, paid with materials and coins:
     2  fetch: things left lying on the ground run back to Pip in the dog's mouth
     3  sniff: every island area hides one buried treasure; the dog smells it, barks, digs, and coins (and sometimes a
        crystal) pop out. A new one is buried each time Pip sleeps.
     4  saddlebags: two little bags on the dog's back, so Pip can carry 6 more coins (cap() in rules.js)
   No faster travel (Leon said to skip that). The dog engine (engine/dog.js) asks petPlace() for a goal; dogGoal() gives it. */
BLD.dog = { max: 4, cost: [null, null, { log: 10, berry: 8, coin: 5 }, { stone: 14, berry: 12, coin: 12 }, { log: 18, stone: 14, crystal: 4, coin: 20 }], pic: [null, 'dog', 'dog', 'dog', 'dog'] };
const dogLv = () => bldLv('dog');
const dogBags = () => (dogLv() >= 4 ? 6 : 0);
const DG = { mode: null, d: null, t: 0, cool: 3, spot: null, bub: null, holes: [], dirt: [] };
const DIG = {}; /* area id -> { x, z } of today's buried treasure */

function dogIcon(x, t) {
  const blob = (f) => { x.fillStyle = f; x.fill(); x.stroke(); };
  if (t === 'dog') {
    [-1, 1].forEach((s) => { x.beginPath(); x.ellipse(s * 15, 2, 7, 13, s * 0.3, 0, 7); blob('#b9783c'); });
    x.beginPath(); x.arc(0, -2, 16, 0, 7); blob('#dba65c');
    x.beginPath(); x.ellipse(0, 7, 9, 7, 0, 0, 7); blob('#f3d39c');
    x.fillStyle = PAL.ink; x.beginPath(); x.ellipse(0, 3, 4, 3, 0, 0, 7); x.fill(); [-6, 6].forEach((a) => { x.beginPath(); x.arc(a, -7, 2.6, 0, 7); x.fill(); });
    x.beginPath(); x.moveTo(-12, 16); x.quadraticCurveTo(0, 22, 12, 16); x.lineWidth = 5; x.strokeStyle = '#d8423a'; x.stroke(); x.lineWidth = 3; x.strokeStyle = PAL.ink;
    x.beginPath(); x.arc(0, 21, 3, 0, 7); blob('#f2c14a');
  } else if (t === 'fetch') { /* a log on the ground and an arrow curving back */
    isleIcon(x, 'log', -4, 10, 0.7);
    x.beginPath(); x.moveTo(14, 4); x.quadraticCurveTo(16, -18, -10, -16); x.lineWidth = 5; x.strokeStyle = '#f2a13c'; x.stroke();
    x.beginPath(); x.moveTo(-4, -23); x.lineTo(-13, -16); x.lineTo(-4, -9); x.stroke(); x.lineWidth = 3; x.strokeStyle = PAL.ink;
  } else if (t === 'dig') { /* a dug hole with a coin and a sparkle */
    x.beginPath(); x.ellipse(0, 12, 20, 8, 0, 0, 7); blob('#8a5a34'); x.beginPath(); x.ellipse(0, 12, 12, 4, 0, 0, 7); x.fillStyle = '#4f3220'; x.fill();
    isleIcon(x, 'coin', -2, -6, 0.7);
    x.fillStyle = '#fff2b0'; x.beginPath(); for (let q = 0; q < 8; q++) { const r = q % 2 ? 2 : 7, a = q / 8 * 6.283; x.lineTo(14 + Math.cos(a) * r, -16 + Math.sin(a) * r); } x.closePath(); x.fill();
  } else if (t === 'paw') {
    x.fillStyle = '#6e4426'; x.beginPath(); x.ellipse(0, 6, 10, 8, 0, 0, 7); x.fill();
    [[-11, -6], [-4, -12], [4, -12], [11, -6]].forEach(([a, b]) => { x.beginPath(); x.ellipse(a, b, 4, 5, 0, 0, 7); x.fill(); });
  }
}

/* ---- the saddlebags on the dog's back ---- */
let dogBagG = null;
function dogBagSync() {
  if (!dogBagG) {
    dogBagG = new T.Group(); const L = [];
    [-1, 1].forEach((s) => { const q = new T.BoxGeometry(0.1, 0.17, 0.22); q.translate(s * 0.2, 0.36, -0.06); L.push(fac(q, '#b5562f', 1501)); const f = new T.BoxGeometry(0.11, 0.06, 0.23); f.translate(s * 0.2, 0.44, -0.06); L.push(fac(f, '#8a3f22', 1502)); });
    const st = new T.BoxGeometry(0.42, 0.03, 0.06); st.translate(0, 0.585, -0.06); L.push(fac(st, '#8a3f22', 1503));
    merged(L, MAT, dogBagG);
  }
  const want = dogLv() >= 4 && state.pet !== 'none';
  if (want && dogBagG.parent !== (dog.body || dog.g)) (dog.body || dog.g).add(dogBagG);
  dogBagG.visible = want;
}

/* ---- buried treasure: one in each area Pip owns, new after each sleep ---- */
function digPlace(A) {
  for (let k = 0; k < 40; k++) {
    const x = A.cx + (Math.random() - 0.5) * 9, z = A.cz + (Math.random() - 0.5) * 9;
    if (walkSdf(x, z) > -0.9) continue;
    if (nodes.some((n) => Math.hypot(n.x - x, n.z - z) < 1.0) || signs.some((s) => s.x != null && Math.hypot(s.x - x, s.z - z) < 1.4)) continue;
    if (roadKind(x, z) || campNear(x, z, 1.8)) continue; /* not on a road or by a building */
    return { x, z };
  }
  return null;
}
function digInit() { const I = state.isle; I.dug = I.dug || {}; }
function digSpot(A) {
  if (!A || A.cave || state.isle.dug[A.id]) return null;
  if (!DIG[A.id]) DIG[A.id] = digPlace(A) || { none: 1 };
  return DIG[A.id].none ? null : DIG[A.id];
}
/* sleeping fills the holes and buries new treasure */
function dogWake() { state.isle.dug = {}; Object.keys(DIG).forEach((k) => { delete DIG[k]; }); DG.holes.forEach((h) => sc.remove(h)); DG.holes.length = 0; }
function digLoot(A) {
  const t = BIOME_TIER[A.biome] || 1, out = [];
  for (let k = 0; k < 1 + t * 2; k++) out.push('coin');
  if (t >= 3 || Math.random() < (t >= 2 ? 0.6 : 0.3)) out.push('crystal');
  return out;
}

/* ---- what the dog wants to do ---- */
const dogFree = () => state.pet !== 'none' && !isNight && !enSleep;
function dogGoal() {
  if (!DG.mode || !dogFree()) return null;
  const pp = pip.position, sp = Math.max(3.2, speed() * 1.2);
  if (DG.mode === 'fetch') return [DG.d.m.position.x, DG.d.m.position.z, sp];
  if (DG.mode === 'back') { const a = pip.rotation.y; return [pp.x + Math.sin(a) * 0.7, pp.z + Math.cos(a) * 0.7, sp]; }
  if (DG.mode === 'sniff' || DG.mode === 'dig') return [DG.spot.x, DG.spot.z + 0.45, 2.4];
  return null;
}
function dogMouth() { return dog.head || dog.g; }
function dogDrop() { /* put back what is in its mouth, where the dog stands */
  const D = DG.d; if (!D) return; const m = D.m; m.parent.remove(m); sc.add(m); m.scale.setScalar(1);
  m.position.set(dog.g.position.x, 0.06, dog.g.position.z); D.land = 1; D.wait = 0; drops.push(D); DG.d = null;
}
function dogFind() {
  const pp = pip.position, dp = dog.g.position, full = carry.count() + isleIncoming >= cap(); let best = null, bd = 1e9;
  drops.forEach((d) => {
    if (d.land !== 1 || d.wait > -1.2) return; if (VALUABLE[d.t] && full) return;
    const dx = d.m.position.x - pp.x, dz = d.m.position.z - pp.z, dist = Math.hypot(dx, dz); if (dist < dropReach() + 0.4 || dist > 16) return;
    const dd = Math.hypot(d.m.position.x - dp.x, d.m.position.z - dp.z); if (dd < bd) { bd = dd; best = d; }
  });
  return best;
}
function dogStepIsle(dt) {
  if (!dog || !dog.g) return;
  dogBagSync();
  const lv = dogLv(), dp = dog.g.position, pp = pip.position;
  if (DG.bub) { DG.bub.t -= dt; DG.bub.position.set(dp.x, 1.45 + Math.sin(time * 4) * 0.04, dp.z); if (DG.bub.t <= 0) { sc.remove(DG.bub); DG.bub = null; } }
  dirtStep(dt);
  if (!dogFree()) { if (DG.mode === 'back') dogDrop(); DG.mode = null; DG.d = null; return; }
  DG.cool -= dt;
  if (!DG.mode && DG.cool <= 0) {
    const d = lv >= 2 ? dogFind() : null;
    if (d) { DG.mode = 'fetch'; DG.d = d; bark(0.4); }
    else if (lv >= 3) { const A = areaAt(pp.x, pp.z), s = digSpot(A); if (s && Math.hypot(s.x - dp.x, s.z - dp.z) < 8 && Math.hypot(s.x - pp.x, s.z - pp.z) < 9) { DG.mode = 'sniff'; DG.spot = s; DG.area = A; DG.t = 0; } }
    if (!DG.mode) DG.cool = 0.5;
  }
  if (DG.mode === 'fetch') {
    const D = DG.d; if (drops.indexOf(D) < 0) { DG.mode = null; DG.d = null; return; } /* Pip got it first */
    if (Math.hypot(D.m.position.x - dp.x, D.m.position.z - dp.z) < 0.45) {
      drops.splice(drops.indexOf(D), 1); sc.remove(D.m); const mo = dogMouth(); mo.add(D.m);
      if (mo === dog.head) D.m.position.set(0, -0.1, 0.24); else D.m.position.set(0, 0.55, 0.42);
      D.m.rotation.set(0, Math.PI / 2, 0); D.m.scale.setScalar(0.75); DG.mode = 'back'; Snd.play('pop', { gain: 0.35, f: 620 });
    }
  } else if (DG.mode === 'back') {
    if (Math.hypot(pp.x - dp.x, pp.z - dp.z) < 1.1) {
      const D = DG.d, m = D.m; m.updateMatrixWorld(); const w = m.getWorldPosition(new T.Vector3()); m.parent.remove(m); m.scale.setScalar(1);
      if (!VALUABLE[D.t]) invFly(D.t, w);
      else { sc.add(m); m.position.set(pp.x, 0.06, pp.z); m.rotation.set(0, 0, 0); D.land = 1; D.wait = 0; drops.push(D); }
      DG.d = null; DG.mode = null; DG.cool = 0.4; dog.hop = 1; Snd.play('blip', { gain: 0.3, f: 700 });
    }
  } else if (DG.mode === 'sniff') {
    const s = DG.spot, at = Math.hypot(s.x - dp.x, s.z + 0.45 - dp.z) < 0.15;
    if (at) {
      DG.t += dt; dog.g.rotation.y = Math.PI; if (dog.head) { dog.head.rotation.x = 0.55; dog.head.rotation.y = Math.sin(time * 9) * 0.35; }
      if (DG.t > 1.3) { DG.mode = 'dig'; DG.t = 0; bark(0.55); dogBubble('paw'); }
    }
  } else if (DG.mode === 'dig') {
    DG.t += dt; dog.g.rotation.y = Math.PI;
    if (dog.legs && !reduced) { dog.legs[0].rotation.x = -0.9 + Math.sin(time * 26) * 0.6; dog.legs[1].rotation.x = -0.9 + Math.sin(time * 26 + Math.PI) * 0.6; }
    if (dog.head) dog.head.rotation.x = 0.5;
    if (Math.floor(DG.t * 10) !== Math.floor((DG.t - dt) * 10)) dirtPuff(DG.spot.x, DG.spot.z);
    if (DG.t > 1.8) digDone();
  }
}
function digDone() {
  const s = DG.spot, A = DG.area; state.isle.dug[A.id] = 1; save();
  DG.mode = null; DG.spot = null; DG.cool = 2;
  const h = new T.Mesh(new T.CircleGeometry(0.32, 14), new T.MeshLambertMaterial({ color: '#5a3a22' })); h.rotation.x = -Math.PI / 2; h.position.set(s.x, 0.025, s.z); h.scale.y = 0.75; sc.add(h); DG.holes.push(h);
  digLoot(A).forEach((t, k) => { const m = itemModel(t), a = Math.random() * 6.28; m.position.set(s.x, 0.4, s.z); sc.add(m); drops.push({ m, t, vx: Math.cos(a) * 1.3, vz: Math.sin(a) * 1.3, vy: 3.8 + k * 0.25 + Math.random(), land: 0, wait: 0.3 }); });
  Snd.play('sparkle', { gain: 0.5 }); Snd.play('success', { gain: 0.4, f: 'E5' }, 0.15); burst(s.x, 0.9, s.z, 5); dog.hop = 1; xpGain(4);
}
function dogBubble(t) { if (DG.bub) sc.remove(DG.bub); DG.bub = isleSprite(isleBubble(t), 0.7); DG.bub.t = 2.2; sc.add(DG.bub); }
/* little clods of earth thrown up behind the dog */
const dirtGeo = new T.IcosahedronGeometry(0.05, 0), dirtMat = new T.MeshLambertMaterial({ color: '#7a5030' });
function dirtPuff(x, z) {
  for (let k = 0; k < 3; k++) { const m = new T.Mesh(dirtGeo, dirtMat); m.position.set(x + (Math.random() - 0.5) * 0.2, 0.1, z + 0.1); m.userData.v = new T.Vector3((Math.random() - 0.5) * 1.6, 2 + Math.random() * 1.5, 1 + Math.random() * 1.2); sc.add(m); DG.dirt.push(m); }
  Snd.play('tock', { gain: 0.12, f: 180 + Math.random() * 60 });
}
function dirtStep(dt) {
  for (let k = DG.dirt.length - 1; k >= 0; k--) { const m = DG.dirt[k], v = m.userData.v; v.y -= 12 * dt; m.position.addScaledVector(v, dt); if (m.position.y < 0.02) { sc.remove(m); DG.dirt.splice(k, 1); } }
}
/* the dog card's effect picture: what the next trick is */
function dogEff(x, lv) {
  if (lv <= 2) isleIcon(x, 'fetch', 48, 48, 1.4);
  else if (lv === 3) isleIcon(x, 'dig', 48, 50, 1.4);
  else { isleIcon(x, 'bag', 36, 48, 1.1); x.font = '700 26px Fredoka, sans-serif'; x.lineWidth = 5; x.strokeStyle = PAL.ink; x.fillStyle = '#7cc85a'; x.strokeText('+6', 58, 60); x.fillText('+6', 58, 60); }
}
function dogUp() { dogBagSync(); const p = dog.g.position; burst(p.x, 1.0, p.z, 8); dog.hop = 1; bark(0.6); camFocus.set(p.x, 0, p.z); DG.cool = 1; }
const dogTest = () => ({ lv: dogLv(), mode: DG.mode, cap: cap(), dug: Object.assign({}, state.isle.dug), spots: Object.keys(DIG).length, holes: DG.holes.length, pos: [+dog.g.position.x.toFixed(2), +dog.g.position.z.toFixed(2)], bags: !!(dogBagG && dogBagG.visible) });
