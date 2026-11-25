/* ---------- Pips Island: gathering, signs and squares that rise out of the sea ----------
   Pip stands by a tree, rock or bush and works it on their own: chunks pop out and hop into the backpack.
   Each sea square next to the land has a sign; standing on its ring pours what Pip carries into it, and the price
   (a row of pictures) lights up piece by piece. A full sign lifts its square out of the sea with new things on it.
   Everything grows back, so a child can never get stuck. No reading needed: pictures and the guide arrow only. */
const FISH = []; /* no fish on this island yet (the engine's icon list asks) */
/* what can be gathered (Leon's vision, 2026-11-24): four materials only, wood, stone, berries and crystals. Harder islands give
   bigger piles of the same four, and need a better tool (tiers.js). Tall grass and clay are gone. */
const NODE_R = { crystal: 0.42, planks: 0.4, tree: 0.36, rock: 0.55, bush: 0.45, boulder: 0.95 };
const YIELD = { crystal: ['crystal', 1], planks: ['log', 1], tree: ['log', 2], rock: ['stone', 2], bush: ['berry', 3], boulder: ['stone', 4] };
const HITS = { crystal: 6, planks: 5, tree: 6, rock: 8, bush: 3, boulder: 12 }; /* Leon: slower, so each one feels like work (more for higher tiers) */
const REGROW = { crystal: [25, 30], planks: [1e9, 0], tree: [8, 16], rock: [6, 25], bush: [10, 0], boulder: [10, 40] }; /* [gone, growing] seconds; "gone" now lasts until Pip sleeps (tiers.js) */
const LOW = { crystal: 0.3, rock: 0.35, boulder: 0.35 }; /* how small it shrinks while it grows back (trees fall, bushes lose their berries) */
const PICKY = { crystal: 1, rock: 1, boulder: 1 }; /* swung at with the pickaxe */
/* the pickaxe comes from the chest on the first rocks area; without it rocks bounce off, like a weak tool (tiers.js) */
const NEED = { crystal: 'pick', rock: 'pick', boulder: 'pick' };
const hasTool = (k) => !NEED[k] || !!(state.isle.tools && state.isle.tools[NEED[k]]);
const byHand = (k) => !!HAND[k] && k !== 'planks';
function hitPow(n) { return tierPow(n) * xpPow(); }
const KINDS = ['log', 'stone', 'berry', 'crystal']; /* building things, in counter order */
const nodes = [], drops = [], signs = [], chests = [];
let rising = null, hitT = 0, giveT = 0, pickHintT = 0;

/* ---- pictures: drawn on a 2D canvas for the signs and bubbles ---- */
function isleIcon(x, t, cx, cy, s) {
  x.save(); x.translate(cx, cy); x.scale(s, s); x.lineWidth = 3; x.strokeStyle = PAL.ink; x.lineJoin = 'round'; x.lineCap = 'round';
  const blob = (f) => { x.fillStyle = f; x.fill(); x.stroke(); };
  if (t === 'log') { x.beginPath(); x.roundRect(-20, -9, 34, 18, 9); blob('#a8774f'); x.beginPath(); x.ellipse(14, 0, 6, 9, 0, 0, 7); blob('#e7c48f'); x.beginPath(); x.ellipse(14, 0, 2.2, 3.5, 0, 0, 7); x.strokeStyle = '#a8774f'; x.lineWidth = 1.6; x.stroke(); }
  else if (t === 'stone') { x.beginPath(); x.moveTo(-18, 8); x.quadraticCurveTo(-20, -8, -4, -12); x.quadraticCurveTo(14, -14, 19, 0); x.quadraticCurveTo(20, 12, 4, 12); x.quadraticCurveTo(-12, 14, -18, 8); x.closePath(); blob('#a9b2bb'); x.beginPath(); x.moveTo(-8, -5); x.quadraticCurveTo(0, -8, 6, -5); x.strokeStyle = '#e4e9ee'; x.lineWidth = 2.6; x.stroke(); }
  else if (t === 'berry') { x.beginPath(); x.arc(-6, 4, 9, 0, 7); blob('#d6406a'); x.beginPath(); x.arc(8, 6, 9, 0, 7); blob('#c3335c'); x.beginPath(); x.moveTo(1, -6); x.quadraticCurveTo(10, -16, 16, -10); x.quadraticCurveTo(9, -4, 1, -6); blob('#74a857'); x.fillStyle = '#f6b3c4'; x.beginPath(); x.arc(-9, 1, 2.4, 0, 7); x.fill(); }
  else if (t === 'hay') { x.beginPath(); x.moveTo(-16, 14); x.quadraticCurveTo(-14, -6, -8, -16); x.lineTo(8, -16); x.quadraticCurveTo(14, -6, 16, 14); x.closePath(); blob('#e8c95a');
    x.lineWidth = 1.8; x.strokeStyle = '#b8963a'; x.beginPath(); [-8, -2, 4, 10].forEach((q) => { x.moveTo(q * 0.8, -12); x.lineTo(q, 12); }); x.stroke(); x.lineWidth = 3; x.strokeStyle = PAL.ink; x.beginPath(); x.roundRect(-14, -2, 28, 7, 3); blob('#b5562f'); }
  else if (t === 'clay') { x.beginPath(); x.moveTo(-19, 10); x.quadraticCurveTo(-18, -10, 0, -12); x.quadraticCurveTo(18, -10, 19, 10); x.closePath(); blob('#c9774a'); x.beginPath(); x.moveTo(-8, -4); x.quadraticCurveTo(0, -8, 8, -4); x.strokeStyle = '#f0b48c'; x.lineWidth = 2.6; x.stroke(); }
  else if (t === 'gem' || t === 'crystal') { x.beginPath(); x.moveTo(0, -20); x.lineTo(15, -6); x.lineTo(0, 20); x.lineTo(-15, -6); x.closePath(); blob('#7fd3ef'); x.beginPath(); x.moveTo(-15, -6); x.lineTo(15, -6); x.moveTo(0, -20); x.lineTo(-4, 20); x.lineWidth = 1.8; x.strokeStyle = '#3f9cc0'; x.stroke(); }
  else if (t === 'coin') { x.beginPath(); x.arc(0, 0, 17, 0, 7); blob('#f2c23c'); x.beginPath(); x.arc(0, 0, 11, 0, 7); x.lineWidth = 2.2; x.strokeStyle = '#c08a1a'; x.stroke(); x.fillStyle = '#fff2b0'; x.beginPath(); x.arc(-5, -6, 3, 0, 7); x.fill(); }
  else if (t === 'pick' || t === 'pick2' || t === 'pick3') { x.beginPath(); x.moveTo(-3, -10); x.lineTo(3, 20); x.lineWidth = 6; x.strokeStyle = PAL.ink; x.stroke(); x.lineWidth = 3.2; x.strokeStyle = '#a8774f'; x.stroke(); x.lineWidth = 3; x.strokeStyle = PAL.ink;
    x.beginPath(); x.moveTo(-22, -4); x.quadraticCurveTo(0, -22, 22, -4); x.quadraticCurveTo(0, t === 'pick' ? -12 : -3, -22, -4); x.closePath(); blob({ pick2: '#e0904f', pick3: '#7fd3ef' }[t] || '#c7ced6'); if (t === 'pick3') { x.fillStyle = '#e9fbff'; x.beginPath(); x.arc(-8, -11, 2.6, 0, 7); x.fill(); } }
  else if (t === 'bag') { x.beginPath(); x.moveTo(-12, -6); x.quadraticCurveTo(0, -24, 12, -6); x.lineWidth = 4; x.strokeStyle = '#7d5e4e'; x.stroke(); x.lineWidth = 3; x.strokeStyle = PAL.ink; x.beginPath(); x.moveTo(-18, -6); x.lineTo(18, -6); x.lineTo(14, 16); x.lineTo(-14, 16); x.closePath(); blob('#d9a56b'); x.beginPath(); x.moveTo(-16, 4); x.lineTo(16, 4); x.lineWidth = 2; x.strokeStyle = '#a8743f'; x.stroke(); }
  else if (t === 'bolt') { x.beginPath(); x.moveTo(4, -22); x.lineTo(-14, 4); x.lineTo(-1, 4); x.lineTo(-6, 22); x.lineTo(14, -4); x.lineTo(1, -4); x.closePath(); blob('#f7c948'); x.fillStyle = '#fff2b0'; x.beginPath(); x.moveTo(2, -15); x.lineTo(-7, -1); x.lineTo(-3, -1); x.closePath(); x.fill(); }
  else if (t === 'shovel') { x.beginPath(); x.moveTo(0, -22); x.lineTo(0, 6); x.lineWidth = 7; x.strokeStyle = PAL.ink; x.stroke(); x.lineWidth = 3.6; x.strokeStyle = '#a8774f'; x.stroke(); x.lineWidth = 3; x.strokeStyle = PAL.ink;
    x.beginPath(); x.moveTo(-7, -22); x.lineTo(7, -22); x.stroke(); x.beginPath(); x.moveTo(-10, 4); x.lineTo(10, 4); x.lineTo(9, 14); x.quadraticCurveTo(0, 24, -9, 14); x.closePath(); blob('#c7ced6'); }
  else if (t === 'sickle') { x.beginPath(); x.moveTo(-14, 20); x.lineTo(-6, 6); x.lineWidth = 7; x.strokeStyle = PAL.ink; x.stroke(); x.lineWidth = 3.6; x.strokeStyle = '#a8774f'; x.stroke(); x.lineWidth = 3; x.strokeStyle = PAL.ink;
    x.beginPath(); x.moveTo(-6, 6); x.quadraticCurveTo(-8, -20, 14, -18); x.quadraticCurveTo(-1, -12, -1, 6); x.closePath(); blob('#c7ced6'); }
  else if (t === 'stairsDown' || t === 'stairsUp') { const up = t === 'stairsUp'; x.beginPath(); x.moveTo(-20, 16); [[-20, 6], [-8, 6], [-8, -4], [4, -4], [4, -14], [16, -14], [16, 16]].forEach(([a, b]) => x.lineTo(a, b)); x.closePath(); blob(up ? '#c9b98f' : '#a69c8a');
    x.beginPath(); if (up) { x.moveTo(-6, -24); x.lineTo(6, -24); x.moveTo(0, -30); x.lineTo(-6, -24); x.lineTo(0, -18); } else { x.moveTo(-22, -22); x.lineTo(-10, -10); x.moveTo(-10, -18); x.lineTo(-10, -10); x.lineTo(-18, -10); } x.lineWidth = 4.5; x.strokeStyle = up ? '#3f8a3a' : '#f4d76a'; x.stroke(); }
  else if (t === 'star') { x.beginPath(); for (let q = 0; q < 10; q++) { const r = q % 2 ? 10 : 22, a = q / 10 * Math.PI * 2 - Math.PI / 2; x.lineTo(Math.cos(a) * r, Math.sin(a) * r + 1); } x.closePath(); blob('#f7c948'); }
  else if (t === 'clover') { x.fillStyle = '#5fae4a'; [[-8, -8], [8, -8], [-8, 8], [8, 8]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 9, 0, 7); x.fill(); x.stroke(); }); x.beginPath(); x.moveTo(2, 4); x.quadraticCurveTo(8, 16, 16, 22); x.stroke(); x.fillStyle = '#9ad67e'; x.beginPath(); x.arc(-10, -10, 3, 0, 7); x.fill(); }
  else if (t === 'perkEn') { isleIcon(x, 'bolt', -10, 0, 1); x.lineWidth = 3; x.strokeStyle = PAL.ink; for (let q = 0; q < 3; q++) { x.beginPath(); x.roundRect(6, 10 - q * 11, 18, 8, 3); x.fillStyle = '#7cc85a'; x.fill(); x.stroke(); } x.beginPath(); x.moveTo(15, -30); x.lineTo(15, -18); x.moveTo(9, -24); x.lineTo(21, -24); x.lineWidth = 4; x.strokeStyle = '#3f8a3a'; x.stroke(); }
  else if (t === 'perkHit') { isleIcon(x, 'pick', -4, 4, 0.9); x.lineWidth = 3.5; x.strokeStyle = '#f2a13c'; x.beginPath(); [[14, -18, 22, -26], [18, -8, 28, -10], [8, -22, 10, -32]].forEach(([a, b, c, d]) => { x.moveTo(a, b); x.lineTo(c, d); }); x.stroke(); }
  else if (t === 'perkLuck') { isleIcon(x, 'clover', -4, -2, 0.95); x.font = '700 14px Fredoka, sans-serif'; x.lineWidth = 4; x.strokeStyle = PAL.ink; x.fillStyle = '#fff6e4'; x.strokeText('x2', 8, 24); x.fillText('x2', 8, 24); }
  else if (t === 'fire') { x.fillStyle = '#a9b2bb'; [[-14, 14], [-5, 17], [5, 17], [14, 14]].forEach(([a, b]) => { x.beginPath(); x.ellipse(a, b, 6, 4, 0, 0, 7); x.fill(); x.stroke(); });
    x.beginPath(); x.moveTo(0, -22); x.quadraticCurveTo(16, -4, 10, 12); x.lineTo(-10, 12); x.quadraticCurveTo(-16, -4, 0, -22); x.closePath(); blob('#f2a13c'); x.beginPath(); x.moveTo(0, -6); x.quadraticCurveTo(8, 4, 4, 12); x.lineTo(-4, 12); x.quadraticCurveTo(-8, 4, 0, -6); x.closePath(); x.fillStyle = '#ffe07a'; x.fill(); }
  else if (t === 'hut') { x.beginPath(); x.rect(-17, -2, 34, 20); blob('#c99158'); x.beginPath(); x.moveTo(-23, 0); x.lineTo(0, -20); x.lineTo(23, 0); x.closePath(); blob('#b5562f'); x.beginPath(); x.rect(-5, 5, 10, 13); blob('#7a3a2a'); x.beginPath(); x.rect(8, 3, 6, 6); blob('#ffe07a'); }
  else if (t === 'hammer') { x.beginPath(); x.moveTo(-14, 18); x.lineTo(6, -6); x.lineWidth = 8; x.strokeStyle = PAL.ink; x.stroke(); x.lineWidth = 4.5; x.strokeStyle = '#a8774f'; x.stroke(); x.lineWidth = 3; x.strokeStyle = PAL.ink;
    x.save(); x.translate(8, -9); x.rotate(-0.7); x.beginPath(); x.roundRect(-15, -7, 30, 14, 3); blob('#8b939c'); x.restore(); }
  else if (t === 'tent') { x.beginPath(); x.moveTo(-22, 16); x.lineTo(0, -20); x.lineTo(22, 16); x.closePath(); blob('#e9684a'); x.beginPath(); x.moveTo(-7, 16); x.lineTo(0, 2); x.lineTo(7, 16); x.closePath(); blob('#7a3a2a');
    x.fillStyle = '#f4d76a'; const mn = new Path2D('M14 -24 A8 8 0 1 0 24 -12 A6 6 0 1 1 14 -24 Z'); x.fill(mn); x.lineWidth = 2; x.stroke(mn); }
  else if (t === 'ore') peopleIcon(x, t);
  else if (t === 'pie' || t === 'oven') bakeryIcon(x, t);
  else if (t === 'axe' || t === 'axe2' || t === 'axe3') tiersIcon(x, t);
  else if (t === 'dog' || t === 'fetch' || t === 'dig' || t === 'paw') dogIcon(x, t);
  else if (['torch', 'coat', 'boots', 'web', 'bees', 'dark', 'rain', 'snowDeep'].indexOf(t) >= 0) gearIcon(x, t);
  else loopIcon(x, t);
  x.restore();
}
function paperBox(x, w, h) { x.save(); x.shadowColor = 'rgba(70,40,18,0.35)'; x.shadowBlur = 8; x.shadowOffsetY = 4; x.beginPath(); x.roundRect(6, 6, w - 12, h - 14, 18); x.fillStyle = '#fff6e4'; x.fill(); x.restore(); x.beginPath(); x.roundRect(6, 6, w - 12, h - 14, 18); x.lineWidth = 4; x.strokeStyle = '#6e4426'; x.stroke(); }
/* a round picture bubble (used for the pickaxe a rock wants, and a tool coming out of a chest) */
const isleBub = {};
function isleBubble(t) {
  if (isleBub[t]) return isleBub[t];
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.beginPath(); x.arc(64, 60, 50, 0, 7); x.fillStyle = '#fff6e4'; x.fill(); x.lineWidth = 5; x.strokeStyle = '#6e4426'; x.stroke();
  isleIcon(x, t, 64, 62, 1.7);
  const tex = new T.CanvasTexture(c); isleBub[t] = tex; return tex;
}
/* a ring of rope lying on the grass, like the farm's, where Pip stands to pay or to use something */
function ropeRing(r0, r1) {
  const R = (r0 + r1) / 2, g = new T.TorusGeometry(R, 0.065, 6, 44); g.scale(1, 1, 0.5);
  const m = new T.Mesh(fac(g, (cx, cy, cz, i) => tone(Math.floor((Math.atan2(cy, cx) + 3.15) * R * 9) % 2 ? '#fff0c8' : '#e0bf86', i, 0.2), 1490), MAT); m.receiveShadow = true; m.add(new T.Mesh(new T.RingGeometry(r0 - 0.04, r1 + 0.04, 28), ringMat)); return m; /* the pale band under the rope keeps it easy to see */
}
function isleSprite(tex, s) { const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); sp.scale.set(s, s, 1); return sp; }

/* ---- things Pip carries: logs, stones and berries ---- */
const ITEM_GEO = {};
ITEM_H.gem = 0.2; ITEM_H.crystal = 0.2; ITEM_H.coin = 0.08;
function itemGeo(t) {
  if (ITEM_GEO[t]) return ITEM_GEO[t];
  let g;
  if (t === 'log') g = propLogGeo();
  else if (t === 'stone') g = propStoneGeo();
  else if (t === 'hay') { const a = new T.CylinderGeometry(0.11, 0.13, 0.3, 9); a.rotateZ(Math.PI / 2); g = fac(a, (cx, cy, cz, i) => Math.abs(cx) < 0.03 ? new T.Color('#b5562f') : tone('#e8c95a', i, 0.6), 1105); }
  else if (t === 'clay') { const a = ico(0.13, 1, 1106); a.scale(1.25, 0.7, 1.05); g = fac(a, (cx, cy, cz, i) => shadeY('#c9774a', cy, -0.1, 0.1, i, 0.4), 1106); }
  else if (t === 'gem' || t === 'crystal') { const a = new T.OctahedronGeometry(0.11, 0); a.scale(1, 1.4, 1); a.translate(0, 0.14, 0); g = fac(a, (cx, cy, cz, i) => new T.Color(i % 2 ? '#7fd3ef' : '#bdeaf8'), 1103); }
  else if (t === 'coin') { const a = new T.CylinderGeometry(0.12, 0.12, 0.05, 14); a.translate(0, 0.03, 0); g = fac(a, (cx, cy) => new T.Color(cy > 0.04 ? '#ffd75a' : '#d9a520'), 1104); }
  else if (t === 'ore') g = oreItemGeo();
  else { const L = [[-0.05, 0, 0.02], [0.06, 0.01, -0.02], [0.0, 0.07, 0.0], [0.02, -0.01, 0.07]].map(([x, y, z], k) => new T.SphereGeometry(0.06, 8, 6).translate(x, y + 0.06, z)); g = fac(mergeGeos(L), (cx, cy, cz, i) => tone('#d6406a', i, 0.7), 1102); }
  ITEM_GEO[t] = g; return g;
}
function itemModel(t) { const m = new T.Group(); const me = new T.Mesh(itemGeo(t), MAT); me.castShadow = true; m.add(me); m.userData.type = t; return m; }

/* ---- the ground: lift a square out of the sea ---- */
function isleGroundTo(idx, t) { /* move the listed ground points from their sea depth toward the land height, and recolour them */
  const p = ground.geometry.attributes.position, col = ground.geometry.attributes.color, R = rising;
  const e = t * t * (3 - 2 * t);
  for (let n = 0; n < idx.length; n++) { const i = idx[n], x = p.getX(i), z = p.getZ(i), y = R.y0[n] + (R.y1[n] - R.y0[n]) * e; p.setY(i, y); const c = groundCol(x, y, z, vkey(x, y, z)); col.setXYZ(i, c.r, c.g, c.b); }
  p.needsUpdate = true; col.needsUpdate = true;
}
/* lift the ground in a box round (cx, cz) to what hAt now says (call after the land has changed); done runs when it is up */
function riseArea(cx, cz, hx, hz, done) {
  const p = ground.geometry.attributes.position, idx = [], y0 = [], y1 = [];
  for (let k = 0; k < p.count; k++) { const x = p.getX(k), z = p.getZ(k); if (Math.abs(x - cx) > hx || Math.abs(z - cz) > hz) continue; const ht = hAt(x, z); if (Math.abs(ht - p.getY(k)) < 0.05 && ht !== 0) continue; idx.push(k); y0.push(p.getY(k)); y1.push(ht === 0 ? 0.02 * hash(k, 5) : ht); }
  rising = { cx, cz, hx: hx - 1.4, hz: hz - 1.4, t: 0, idx, y0, y1, sp: 0, done };
  Snd.play('riser', { gain: 0.5 }); Snd.play('whoosh', { gain: 0.4 });
}
/* raise a whole area (3 by 3 squares) out of the sea, then fill it with what grows there */
function areaRise(A) {
  areaMark(A); state.isle.areas[A.id] = 1; xpGain(10);
  riseArea(A.cx, A.cz, GS * 1.5 + 1.4, GS * 1.5 + 1.4, () => areaFill(A, true));
  rising.area = A.id;
}
function isleRiseStep(dt) {
  const R = rising; if (!R) return;
  R.t = Math.min(1, R.t + dt / 1.6); isleGroundTo(R.idx, R.t);
  R.sp -= dt; if (R.sp <= 0 && R.t < 0.95) { R.sp = 0.12; const a = Math.random() * 4, sx = (Math.random() - 0.5) * 2 * R.hx, sz = (Math.random() - 0.5) * 2 * R.hz; const ex = R.cx + (a < 1 ? sx : a < 2 ? R.hx : a < 3 ? sx : -R.hx), ez = R.cz + (a < 1 ? -R.hz : a < 2 ? sz : a < 3 ? R.hz : sz); splash(ex, -0.2, ez, 5); }
  if (R.t >= 1) {
    rising = null; ground.geometry.computeVertexNormals(); smoothGeo(ground.geometry); ground.geometry.attributes.normal.needsUpdate = true; ground.geometry.attributes.color.needsUpdate = true;
    pop([R.cx, R.cz]); Snd.play('success', { gain: 0.5 }); Snd.play('sparkle', { gain: 0.4 });
    if (R.done) R.done(); if (/^h/.test(R.area || '')) lookRepaint(); isleSigns(); save();
  }
}

/* ---- trees, rocks and bushes ---- */
/* a rock is a few smooth lumps grown together, lighter on top, darker and mossy at the foot, with small stones round it (the farm's look) */
function rockLumps(parts, seed, top, cols, moss) {
  const L = parts.map(([r, x, y, z, sx, sy, sz], k) => { const g = ico(r, 2, seed + k * 7, r * 0.07); g.scale(sx, sy, sz); g.rotateY(hash(seed, k) * 6.28); g.translate(x, y, z); return g; });
  return fac(mergeGeos(L.map((g) => (g.index ? g.toNonIndexed() : g))), (cx, cy, cz, i) => {
    const n = hash(Math.round(cx * 7), Math.round(cz * 7), seed), c = shadeY(cols[n > 0.6 ? 1 : 0], cy, -0.05, top, i, 0.35);
    if (moss && cy > top * 0.74 && hash(Math.round(cx * 3), Math.round(cz * 3), seed + 3) > 0.5) return tone(moss, i, 0.4);
    if (cy < 0.1) c.multiplyScalar(0.8); return c; }, seed);
}
const ROCK_GEOS = [0, 1, 2].map(propRockGeo);
const STUMP_GEO = propStumpGeo();
const BUSH_GEO = (() => { const g = fluff(0.42, 1210, 6, 0.8); g.translate(0, 0.36, 0); return fac(g, (cx, cy, cz, i) => leafY('#4f9c48', cy, 0, 0.8, i), 1210); })();
const GRASS_GEO = (() => { const L = []; for (let k = 0; k < 18; k++) { const a = k / 18 * 6.28 + hash(k, 1400) * 0.5, h = 0.55 + hash(k, 1401) * 0.5, q = new T.ConeGeometry(0.075, h, 4); q.translate(0, h / 2, 0); q.rotateZ(0.18 + hash(k, 1402) * 0.25); q.rotateY(a); q.translate(Math.cos(a) * 0.1, 0, -Math.sin(a) * 0.1); L.push(q); }
  return fac(mergeGeos(L), (cx, cy, cz, i) => cy > 0.7 ? tone('#f0dc7a', i, 0.4) : leafY('#b9cf58', cy, 0, 0.9, i, 0.5), 1405); })();
const CLAY_GEO = (() => { const g = ico(0.5, 1, 1410, 0.06); g.scale(1.0, 0.62, 0.9); g.translate(0, 0.16, 0); return fac(g, (cx, cy, cz, i) => cy > 0.42 ? tone('#c47a52', i, 0.5) : shadeY('#9c5534', cy, -0.1, 0.45, i, 0.6), 1410); })();
const BOULDER_GEOS = [0, 1].map(propBoulderGeo);
const BERRY_GEO = new T.SphereGeometry(0.075, 8, 6);
const berryMat = new T.MeshStandardMaterial({ color: '#d6406a', roughness: 0.4 });
function makeNode(kind, x, z, seed) {
  const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = hash(seed, 3) * 6.28; sc.add(g);
  const n = { kind, x, z, g, st: 'ready', hp: HITS[kind], t: 0, grow: 1, shake: 0, fall: 0, pop: 0, seed };
  if (kind === 'shroom') { n.main = new T.Mesh(SHROOM_GEO, shroomMat); n.full = 1; g.add(n.main); }
  else if (kind === 'crystal') { n.main = new T.Mesh(CRYSTAL_GEO, crystalMat); n.full = 0.9 + hash(seed, 4) * 0.3; n.main.scale.setScalar(n.full); g.add(n.main); }
  else if (kind === 'planks') { n.main = new T.Mesh(RUIN_BOARDS, MAT); n.main.castShadow = true; n.full = 1; g.add(n.main); }
  else if (kind === 'tree') { n.main = propTree(hash(seed, 2) > 0.7 || (areaAt(x, z) && areaAt(x, z).biome === 'snow') ? 'pine' : 'tree', seed, SHOW_T.tier || nodeTier('tree', x, z)); n.main.scale.setScalar(1.05 + hash(seed, 9) * 0.25); n.full = n.main.scale.x; g.add(n.main);
    n.stump = new T.Mesh(STUMP_GEO, MAT); n.stump.castShadow = true; n.stump.receiveShadow = true; n.stump.visible = false; g.add(n.stump); }
  else if (kind === 'rock' || kind === 'ore' || kind === 'boulder' || kind === 'clay' || kind === 'grass') { n.main = new T.Mesh(kind === 'ore' ? ORE_GEO : kind === 'rock' ? ROCK_GEOS[seed % 3] : kind === 'boulder' ? BOULDER_GEOS[seed % 2] : kind === 'clay' ? CLAY_GEO : GRASS_GEO, MAT); n.main.castShadow = kind !== 'clay'; n.main.receiveShadow = true;
    n.full = kind === 'grass' ? 0.9 + hash(seed, 4) * 0.3 : 0.9 + hash(seed, 4) * 0.25; n.main.scale.setScalar(n.full); g.add(n.main); }
  else { n.main = new T.Mesh(BUSH_GEO, MAT); n.main.castShadow = true; n.main.receiveShadow = true; n.full = 1; g.add(n.main); n.berries = new T.Group(); g.add(n.berries);
    for (let k = 0; k < 7; k++) { const a = k / 7 * 6.28 + hash(seed, k), r = 0.32 + hash(k, seed) * 0.1, b = new T.Mesh(BERRY_GEO, berryMat); b.position.set(Math.cos(a) * r, 0.3 + hash(seed, k + 5) * 0.32, Math.sin(a) * r); n.berries.add(b); } }
  tierInit(n); nodes.push(n); return n;
}
/* ---- what grows in each area: things are placed on a loose grid, and a wavy pattern picks what grows where, so a biome
   gets patches (an orchard, a grass field, a boulder field) instead of an even mix. ---- */
const LAYOUT = {
  home: (x, z, h, n) => (n > 0.4 ? (h > 0.3 ? 'tree' : null) : n < -0.9 ? (h > 0.35 ? 'bush' : null) : h > 0.86 ? 'rock' : h > 0.55 ? 'tree' : null),
  rocks: (x, z, h, n) => (n > 0.5 ? (h > 0.35 ? 'rock' : null) : n < -0.8 ? (h > 0.4 ? 'bush' : null) : h > 0.55 ? 'tree' : h > 0.4 ? 'rock' : null),
  berry: (x, z, h, n) => (n > 0.3 ? (h > 0.3 ? 'bush' : null) : h > 0.75 ? 'rock' : h > 0.45 ? 'tree' : null),
  meadow: (x, z, h, n) => (n > 1.0 ? (h > 0.35 ? 'tree' : null) : n < -0.9 ? (h > 0.4 ? 'bush' : null) : h > 0.74 ? 'bush' : h > 0.62 ? 'rock' : null),
  orchard: (x, z, h, n) => (n > 0 ? (h > 0.3 ? 'tree' : null) : h > 0.6 ? 'bush' : h > 0.48 ? 'rock' : null),
  stone: (x, z, h, n) => (n > 0.8 ? (h > 0.45 ? 'boulder' : null) : n < -0.9 ? (h > 0.4 ? 'rock' : null) : h > 0.83 ? 'boulder' : h > 0.76 ? 'tree' : h > 0.5 ? 'rock' : null),
  snow: (x, z, h, n) => (n > 0.5 ? (h > 0.3 ? 'tree' : null) : n < -0.9 ? (h > 0.45 ? 'crystal' : null) : h > 0.7 ? 'rock' : h > 0.55 ? 'boulder' : h > 0.42 ? 'tree' : null),
  cave: (x, z, h, n) => (n > 0.6 ? (h > 0.4 ? 'crystal' : null) : n < -0.8 ? (h > 0.5 ? 'boulder' : null) : h > 0.62 ? 'rock' : h > 0.5 ? 'crystal' : null),
  clay: (x, z, h, n) => (n > 0.2 ? (h > 0.35 ? (h > 0.72 ? 'boulder' : 'rock') : null) : h > 0.9 ? 'crystal' : h > 0.75 ? 'boulder' : h > 0.5 ? 'rock' : h > 0.4 ? 'tree' : null)
};
/* spots that must stay clear: the camp, each chest, both ends of each bridge, and where signs stand */
function areaClear(x, z) {
  if (Math.hypot(x, z - 0.2) < 3.3) return false; /* the camp */
  if (roadKind(x, z) || roadKind(x + 0.9, z) || roadKind(x - 0.9, z) || roadKind(x, z + 0.9) || roadKind(x, z - 0.9) || campNear(x, z, 1.5) || Math.hypot(x - FORGE.x + 0.4, z - FORGE.z) < 2.6 || Math.hypot(x - OVEN.x + 0.3, z - OVEN.z) < 2.5 || Math.hypot(x - WELL.x, z - WELL.z) < 2.4) return false; /* the settlement's streets and plots */
  for (const a of AREAS) { if (a.chest && Math.hypot(x - a.cx, z - a.cz) < 1.4) return false;
    if (a.stairs && Math.hypot(x - a.cx - a.stairs[0], z - a.cz - a.stairs[1]) < 2.2) return false;
    if (a.cave && Math.hypot(x - a.cx, z - a.cz - 4.0) < 2.4) return false;
    if (a.ruin && Math.hypot(x - a.cx - a.ruin[0], z - a.cz - a.ruin[1]) < 2.6) return false;
    if (a.bridge) { const b = a.bridge; if (Math.hypot(x - b.x0, z - b.z0) < 2.4 || Math.hypot(x - b.x1, z - b.z1) < 2.4) return false; } }
  if (Math.max(Math.abs(x), Math.abs(z)) < 6 && Math.max(Math.abs(x), Math.abs(z)) > 4.6) return false; /* the start area's shore, where its signs stand */
  return true;
}
/* the start area is laid out by hand round the camp, so there is plenty to gather from the first minute (Leon, 2026-11-23) */
const START_NODES = [['tree', -4.9, -4.9], ['tree', 4.9, -4.9], ['tree', -3.7, 5.1], ['tree', 4.9, 4.9], ['tree', 5.0, -1.5], ['tree', -5.0, 0.3], ['tree', 2.1, 5.1], ['tree', -1.7, -5.2],
  ['bush', 5.1, -3.3], ['bush', 5.2, 2.0], ['bush', -5.1, -1.2], ['bush', -1.5, 4.9], ['bush', -5.2, 3.7], ['rock', 3.3, 5.1], ['rock', -3.2, -5.1]]; /* round the rim: the middle is the settlement */
function areaFill(A, fresh) {
  if (SHOW && SHOW_YARD[A.id]) return; /* the asset yard keeps these two areas as an empty lawn */
  if (A.start) { START_NODES.forEach(([k, x, z], q) => makeNode(k, x, z, 50 + q)); areaDecor(A); return; }
  const SP = 2.05, base = AREAS.indexOf(A) * 997; let c = 0;
  for (let gx = A.cx - 5.2; gx <= A.cx + 5.3; gx += SP) for (let gz = A.cz - 5.2; gz <= A.cz + 5.3; gz += SP) {
    const sd = base + c++, x = gx + (hash(sd, 1) - 0.5) * SP * 0.75, z = gz + (hash(sd, 2) - 0.5) * SP * 0.75;
    if (Math.abs(x - A.cx) > 5.0 || Math.abs(z - A.cz) > 5.0 || !areaClear(x, z)) continue;
    const n = Math.sin(x * 0.45 + base * 0.13) + Math.cos(z * 0.41 - base * 0.07), k = LAYOUT[A.biome](x, z, hash(sd, 3), n); if (!k) continue;
    const nd = makeNode(k, x, z, sd); if (fresh) { nd.pop = 0.001; nd.g.scale.setScalar(0.01); }
  }
  if (A.chest && !state.isle.chests[A.id]) makeChest(A.cx, A.cz - 0.4, A.chest, A.id);
  if (A.ruin) makeRuin(A, fresh);
  if (A.stairs) stairsBuild(A, fresh);
  if (A.cave) caveBuild(A);
  areaDecor(A);
}
/* little things that make each biome look like itself (one mesh per area, nothing to gather): flowers on grass, pebbles on stone */
function areaDecor(A) {
  const L = [], b = A.biome, base = AREAS.indexOf(A) * 131;
  const spot = (k, n, w) => { const x = A.cx + (hash(k, n + base) - 0.5) * w, z = A.cz + (hash(k, n + 1 + base) - 0.5) * w; if (walkSdfArea(A, x, z)) return null; if (nodes.some((q) => Math.abs(q.x - x) < 0.55 && Math.abs(q.z - z) < 0.55)) return null; if (roadKind(x, z) || campNear(x, z, 1.5)) return null; return [x, z]; };
  const green = b === 'home' || b === 'meadow' || b === 'orchard' || b === 'berry';
  if (green) {
    /* flowers with petals, in little groups */
    const COLS = ['#ffffff', '#f6d24a', '#f29ab8', '#b89cf0', '#ff8a5c'], nF = { home: 26, berry: 40, meadow: 90, orchard: 70 }[b];
    for (let k = 0; k < nF; k++) { const p = spot(k, 61, 11); if (!p) continue; const col = COLS[Math.floor(hash(k, 66 + base) * 5)];
      for (let j = 0; j < 1 + Math.floor(hash(k, 67) * 3); j++) { const x = p[0] + (hash(k, j + 3) - 0.5) * 0.45, z = p[1] + (hash(k, j + 9) - 0.5) * 0.45, h = 0.11 + hash(k, j) * 0.09;
        const st = new T.CylinderGeometry(0.011, 0.014, h, 3); st.translate(x, h / 2, z); L.push(fac(st, '#5d8a3a', 1950));
        const pe = ico(0.075, 1, 1900 + k); pe.scale(1, 0.32, 1); pe.rotateX(0.35); pe.translate(x, h, z); L.push(fac(pe, col, 1900 + k));
        const ce = ico(0.03, 0, 1901 + k); ce.translate(x, h + 0.025, z + 0.012); L.push(fac(ce, col === '#f6d24a' ? '#e58a2c' : '#f6d24a', 1902)); } }
    /* tufts of longer grass */
    const nT = { home: 46, berry: 60, meadow: 80, orchard: 60 }[b], gcol = b === 'meadow' ? '#9bcf52' : b === 'orchard' ? '#a9c85a' : '#6fae4c';
    for (let k = 0; k < nT; k++) { const p = spot(k, 71, 11.3); if (!p) continue;
      for (let j = 0; j < 4; j++) { const h = 0.16 + hash(k, j + 20) * 0.14, q = new T.ConeGeometry(0.035, h, 3); q.translate(0, h / 2, 0); q.rotateZ((hash(k, j + 30) - 0.5) * 0.9); q.rotateY(j * 1.6); q.translate(p[0] + (j - 1.5) * 0.04, 0, p[1] + (hash(k, j + 40) - 0.5) * 0.08); L.push(fac(q, (cx, cy, cz, i) => shadeY(gcol, cy, 0, 0.3, i, 0.3), 2100 + k)); } }
    /* a few clover-dark patches of low leaves */
    for (let k = 0; k < 14; k++) { const p = spot(k, 75, 11); if (!p) continue; for (let j = 0; j < 5; j++) { const q = ico(0.09, 0, 2200 + k + j); q.scale(1, 0.25, 1); q.translate(p[0] + (hash(k, j + 50) - 0.5) * 0.5, 0.03, p[1] + (hash(k, j + 60) - 0.5) * 0.5); L.push(fac(q, tone('#4f9a48', j, 0.5), 2200 + k)); } }
  }
  if (b === 'stone' || b === 'clay' || b === 'rocks' || b === 'home') {
    const nP = { rocks: 40, home: 10, stone: 90, clay: 90 }[b];
    for (let k = 0; k < nP; k++) { const p = spot(k, 81, 11.4); if (!p) continue; const r = 0.06 + hash(k, 83) * 0.1, q = ico(r, 1, 2000 + k, r * 0.08); q.scale(1.25, 0.6, 1); q.rotateY(hash(k, 84) * 6); q.translate(p[0], r * 0.3, p[1]); L.push(fac(q, (cx, cy, cz, i) => shadeY(b === 'clay' ? '#b98a6a' : '#a9b2bb', cy, 0, 0.12, i + k, 0.5), 2000 + k)); }
    if (b === 'stone' || b === 'clay') for (let k = 0; k < 30; k++) { const p = spot(k, 91, 11); if (!p) continue; /* dry autumn tufts and fallen leaves */
      for (let j = 0; j < 3; j++) { const h = 0.14 + hash(k, j + 20) * 0.1, q = new T.ConeGeometry(0.03, h, 3); q.translate(0, h / 2, 0); q.rotateZ((hash(k, j + 30) - 0.5) * 1.0); q.rotateY(j * 2.1); q.translate(p[0], 0, p[1]); L.push(fac(q, '#c9a24e', 2300 + k)); }
      const lf = ico(0.07, 0, 2350 + k); lf.scale(1.2, 0.12, 0.8); lf.translate(p[0] + 0.3, 0.02, p[1] + 0.2); L.push(fac(lf, ['#d9742c', '#e0a030', '#b5562f'][k % 3], 2350 + k)); }
  }
  if (b === 'snow') {
    /* soft drifts of snow, and a few icy stones */
    for (let k = 0; k < 34; k++) { const p = spot(k, 95, 11); if (!p) continue; const r = 0.3 + hash(k, 96) * 0.45, q = ico(r, 2, 2400 + k, 0.01); q.scale(1.3, 0.28, 1); q.translate(p[0], 0.0, p[1]); L.push(fac(q, (cx, cy, cz, i) => tone(cy > 0.06 ? '#e4eefc' : '#c4d6ee', i, 0.06), 2400 + k)); }
    for (let k = 0; k < 24; k++) { const p = spot(k, 98, 11.4); if (!p) continue; const r = 0.07 + hash(k, 99) * 0.08, q = ico(r, 1, 2450 + k); q.scale(1.2, 0.6, 1); q.translate(p[0], r * 0.3, p[1]); L.push(fac(q, '#b9c7d6', 2450 + k)); }
  }
  if (b === 'cave') caveDecor(A, L, base);
  if (L.length) { const m = merged(L.map((g) => (g.index ? g.toNonIndexed() : g)), MAT); m.castShadow = false; m.receiveShadow = true; }
}
const campNear = (x, z, r) => [TENT, KENNEL, STORE, FORGE, ANVIL, ANVIL_RING, OVEN, OVEN_RING, BOARD, TENT_RING, WELL, FERRY].some((o) => Math.hypot(o.x - x, o.z - z) < r) || loopNear(x, z, r); /* the camp's buildings, the friends' houses, the monuments */
const walkSdfArea = (A, x, z) => Math.abs(x - A.cx) > 5.55 || Math.abs(z - A.cz) > 5.55; /* keep the dressing off the cliff edge */
/* the camp in the start area: a campfire and a little tent */
const campFlame = (() => {
  const g = new T.Group(); g.position.set(FIRE.x, 0, FIRE.z); sc.add(g); const L = [];
  propFire(g);
  const f = new T.Mesh(new T.ConeGeometry(0.16, 0.42, 7), new T.MeshBasicMaterial({ color: '#f2a13c' })); f.position.y = 0.3; g.add(f);
  const f2 = new T.Mesh(new T.ConeGeometry(0.09, 0.26, 6), new T.MeshBasicMaterial({ color: '#ffe07a' })); f2.position.y = 0.26; g.add(f2);
  /* the tent */
  const t = new T.Group(); t.position.set(TENT.x, 0, TENT.z); t.rotation.y = 0.5; sc.add(t);
  let q = new T.ConeGeometry(0.85, 1.15, 4); q.rotateY(Math.PI / 4); q.translate(0, 0.575, 0); part(fac(q, (cx, cy, cz, i) => shadeY('#e9684a', cy, 0, 1.2, i, 0.4), 1320), t);
  q = new T.PlaneGeometry(0.42, 0.62); q.translate(0, 0.31, 0.62); part(fac(q, '#7a3a2a', 1321), t, 0, 0, 0, true);
  return { g, f, f2, t };
})();

/* ---- chests: a tool inside ---- */
function makeChest(x, z, tool, idx) {
  const g = new T.Group(); g.position.set(x, 0, z); sc.add(g);
  const lid = new T.Group(); lid.position.set(0, 0.42, -0.24); g.add(lid); propChest(g, lid);
  const sp = isleSprite(isleBubble(tool), 0.9); sp.position.y = 1.5; sp.visible = false; g.add(sp);
  const ring = ropeRing(0.62, 0.76); ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.035, z + 0.85); sc.add(ring);
  const c = { x, z, g, lid, sp, ring, tool, idx, open: 0, gone: 0, pop: 0.001 }; g.scale.setScalar(0.01); chests.push(c); return c;
}
function chestStep(c, dt) {
  if (c.pop > 0 && c.pop < 1) { c.pop = Math.min(1, c.pop + dt * 2.2); const s = c.pop < 0.7 ? c.pop / 0.7 * 1.15 : 1.15 - (c.pop - 0.7) / 0.3 * 0.15; c.g.scale.setScalar(s); }
  if (!c.open && Math.hypot(pip.position.x - c.x, pip.position.z - (c.z + 0.85)) < 0.9) {
    c.open = 0.001; state.isle.chests[c.idx] = 1; state.isle.tools[c.tool] = 1;
    c.sp.visible = true; Snd.play('powerup', { gain: 0.5 }); burst(c.x, 1.0, c.z, 8); save();
  }
  if (c.open) {
    c.open += dt; c.lid.rotation.x = -Math.min(1.9, c.open * 5);
    c.sp.position.y = 0.9 + Math.min(1, c.open) * 1.1; c.sp.material.opacity = c.open < 2.5 ? 1 : Math.max(0, 1 - (c.open - 2.5) * 2);
    if (c.open > 3) { const s = Math.max(0.01, 1 - (c.open - 3) * 2.5); c.g.scale.setScalar(s); c.ring.visible = false; if (s <= 0.01) { sc.remove(c.g); sc.remove(c.ring); c.gone = 1; } }
  }
}

/* ---- signs: one per sea square that touches land ---- */
const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]];
const ghostTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = 'rgba(236,211,160,0.35)'; x.beginPath(); x.roundRect(8, 8, 112, 112, 16); x.fill(); x.setLineDash([12, 9]); x.lineWidth = 5; x.strokeStyle = 'rgba(255,246,228,0.95)'; x.stroke();
  return new T.CanvasTexture(c); })();
const ghostGeo = (() => { const g = new T.PlaneGeometry(GS - 0.5, GS - 0.5, 8, 8); g.rotateX(-Math.PI / 2); return g; })();
/* a hand-made sign: a round post with a rope wrap and stones at its foot, and a board of two planks nailed on a little crooked */
const POST_GEO = (() => { const L = [];
  let q = new T.CylinderGeometry(0.055, 0.075, 1.22, 8, 4); jit(q, 0.008, 1500); q.translate(0, 0.61, 0); L.push(q);
  q = new T.ConeGeometry(0.06, 0.07, 8); q.translate(0, 1.255, 0); L.push(q);
  [0.74, 0.79, 0.84].forEach((y) => { const r = new T.TorusGeometry(0.068, 0.016, 5, 10); r.rotateX(Math.PI / 2); r.translate(0, y, 0); L.push(r); });
  [[0.13, 0.05, 0.085], [-0.1, 0.09, 0.07], [-0.04, -0.12, 0.075], [0.1, -0.08, 0.05]].forEach(([x, z, r], k) => { const b = ico(r, 1, 1503 + k, r * 0.1); b.scale(1.2, 0.7, 1); b.translate(x, r * 0.4, z); L.push(b); });
  for (let k = 0; k < 4; k++) { const b = new T.ConeGeometry(0.022, 0.2, 3); b.translate(0, 0.1, 0); b.rotateZ((k - 1.5) * 0.3); b.rotateY(k * 1.7); b.translate(-0.15 + k * 0.02, 0, 0.12); L.push(b); }
  return fac(mergeGeos(L), (cx, cy, cz, i) => { const d = Math.hypot(cx, cz);
    if (cy < 0.2 && d > 0.085) return cy > 0.11 && cx < -0.08 && cz > 0.06 ? tone('#6fae4c', i, 0.4) : shadeY('#b3b9bf', cy, 0, 0.12, i, 0.4);
    if (cy > 0.72 && cy < 0.86 && d > 0.06) return tone('#ead9b0', i, 0.3);
    return shadeY(PAL.trunk, cy, 0, 1.3, i, 0.4); }, 1500); })();
const BOARD_GEO = (() => { const L = [];
  [[1.09, 0.02, 0.03], [0.87, -0.015, -0.04]].forEach(([y, x, rz], k) => { const q = new T.BoxGeometry(0.74, 0.2, 0.06, 4, 1, 1); jit(q, 0.008, 1501 + k); q.rotateZ(rz); q.translate(x, y, 0.07); L.push(q);
    [-0.29, 0.29].forEach((nx) => { const n = new T.CylinderGeometry(0.018, 0.018, 0.02, 6); n.rotateX(Math.PI / 2); n.translate(x + nx, y, 0.105); L.push(n); }); });
  const b = new T.BoxGeometry(0.07, 0.46, 0.035); b.translate(0, 0.98, 0.03); L.push(b);
  return fac(mergeGeos(L), (cx, cy, cz, i) => cz > 0.1 ? new T.Color('#4a4038') : cz < 0.05 ? tone('#8a6a4a', i, 0.3) : shadeY(cy > 0.98 ? '#ecca94' : '#e0b87c', cy, 0.7, 1.25, i, 0.25), 1501); })();
/* a sign's price: a home square costs by how many squares are bought; a bridge or a bonus piece has its own price */
const signCost = (s) => s.cost;
const costKinds = (s) => KINDS.filter((t) => signCost(s)[t] > 0);
function signPaid(s) { return state.isle.paid[s.key] || (state.isle.paid[s.key] = {}); }
const paidN = (s, t) => signPaid(s)[t] || 0;
function drawSign(s) {
  const cost = signCost(s), rows = costKinds(s), W = 256, H = rows.length * 54 + 26;
  if (!s.cv || s.cv.height !== H) { s.cv = document.createElement('canvas'); s.cv.width = W; s.cv.height = H; if (s.tex) s.tex.dispose(); s.tex = new T.CanvasTexture(s.cv); s.sp.material.map = s.tex; }
  const x = s.cv.getContext('2d'); x.clearRect(0, 0, W, H); paperBox(x, W, H);
  rows.forEach((t, r) => { const n = cost[t], got = Math.min(n, paidN(s, t)), y = 38 + r * 54;
    if (n <= 6) for (let k = 0; k < n; k++) { x.globalAlpha = k < got ? 1 : 0.35; isleIcon(x, t, 36 + k * 37, y, 0.85); x.globalAlpha = 1; }
    else { isleIcon(x, t, 36, y, 0.9); x.beginPath(); x.roundRect(66, y - 11, 166, 22, 11); x.fillStyle = '#e6d9c0'; x.fill(); x.lineWidth = 3; x.strokeStyle = '#6e4426'; x.stroke();
      if (got) { x.beginPath(); x.roundRect(68, y - 9, 162 * got / n, 18, 9); x.fillStyle = '#74a857'; x.fill(); } } });
  s.tex.needsUpdate = true; s.fullW = 1.9; s.fullH = 1.9 * H / W;
  drawSmall(s);
}
/* the small sign (Leon: the big one takes too much room): one chip per thing still needed, a picture and how many are left.
   The number turns green once the counter has enough of it. The big picture sign only opens while Pip is paying. */
function drawSmall(s) {
  const cost = signCost(s), rows = costKinds(s).filter((t) => cost[t] - paidN(s, t) > 0), CW = 112, H = 72, W = 16 + Math.max(1, rows.length) * CW;
  if (!s.cv2 || s.cv2.width !== W) { s.cv2 = document.createElement('canvas'); s.cv2.width = W; s.cv2.height = H; if (s.tex2) s.tex2.dispose(); s.tex2 = new T.CanvasTexture(s.cv2); s.sm.material.map = s.tex2; s.sm.material.needsUpdate = true; }
  const x = s.cv2.getContext('2d'); x.clearRect(0, 0, W, H); paperBox(x, W, H + 6);
  x.font = '800 36px "Baloo 2", system-ui, sans-serif'; x.textBaseline = 'middle'; x.lineJoin = 'round';
  rows.forEach((t, r) => { const left = cost[t] - paidN(s, t), cx = 14 + r * CW; isleIcon(x, t, cx + 26, 34, 0.82);
    x.fillStyle = haveN(t) >= left ? '#3f8a3a' : PAL.ink; x.fillText(String(left), cx + 52, 36); });
  s.tex2.needsUpdate = true; s.smKey = signSmallKey(s); const h = 0.42; s.sm.scale.set(h * W / H, h, 1);
}
const signSmallKey = (s) => costKinds(s).map((t) => (signCost(s)[t] - paidN(s, t)) + (haveN(t) >= signCost(s)[t] - paidN(s, t) ? 'y' : 'n')).join(',');
/* the ghost of what a sign will make: a dashed square, a dashed bridge, or a dashed round piece of island */
const ghostRound = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = 'rgba(236,211,160,0.35)'; x.beginPath(); x.arc(64, 64, 56, 0, 7); x.fill(); x.setLineDash([12, 9]); x.lineWidth = 5; x.strokeStyle = 'rgba(255,246,228,0.95)'; x.stroke();
  return new T.CanvasTexture(c); })();
function signMake(o) {
  const g = new T.Group(); g.position.set(o.x, 0, o.z); sc.add(g); part(POST_GEO, g); part(BOARD_GEO, g);
  g.scale.setScalar(1.3);
  const sp = isleSprite(null, 1); sp.position.y = 2.2; sp.material.opacity = 0; sp.visible = false; g.add(sp);
  const sm = isleSprite(null, 1); sm.position.y = 1.62; g.add(sm);
  const ring = ropeRing(0.55, 0.7); ring.rotation.x = -Math.PI / 2; ring.position.set(o.x, 0.035, o.z); sc.add(ring);
  const ghost = new T.Mesh(o.ghostGeo, new T.MeshBasicMaterial({ map: o.ghostTex, transparent: true, depthWrite: false })); ghost.position.set(o.gx, o.gy == null ? -0.3 : o.gy, o.gz); if (o.gr) ghost.rotation.y = o.gr; sc.add(ghost);
  const sg = Object.assign(o, { g, sp, sm, ring, ghost, fly: {}, bump: 0, seed: signs.length * 1.7, open: 0, payT: 0 }); signs.push(sg); return sg;
}
/* which signs there should be: an area next to owned land gets a sign at the edge (the whole 3 by 3 block shows dashed in
   the sea), and an area across the water gets a bridge sign once the area its bridge starts from is owned */
function signWants() {
  const want = new Map(), used = new Set();
  AREAS.forEach((A) => {
    if (HAS[A.id] || (rising && rising.area === A.id) || (building && building.A === A)) return;
    if (A.bridge) { if (HAS[A.bridge.from]) want.set('b:' + A.id, { kind: 'bridge', A }); return; }
    /* the owned square touching this area that is nearest its middle: the sign stands there, by the shared edge */
    let best = null, bd = 1e9;
    areaSquares(A, (i, j) => DIRS.forEach(([a, b]) => { const ni = i - a, nj = j - b; if (!owned(ni, nj) || used.has(ni + ',' + nj)) return; const d = Math.hypot(ni * GS - A.cx, nj * GS - A.cz); if (d < bd - 0.01) { bd = d; best = [ni, nj, a, b]; } }));
    if (best) { used.add(best[0] + ',' + best[1]); want.set('a:' + A.id, { kind: 'area', A, at: best }); }
  });
  peopleWants(want);
  return want;
}
const areaGhostGeo = (() => { const g = new T.PlaneGeometry(GS * 3 - 0.6, GS * 3 - 0.6, 12, 12); g.rotateX(-Math.PI / 2); return g; })();
function isleSigns() {
  const want = signWants();
  for (let k = signs.length - 1; k >= 0; k--) { const s = signs[k]; if (!want.has(s.key)) { [s.g, s.ring, s.ghost, s.pic].forEach((m) => m && sc.remove(m)); signs.splice(k, 1); } else want.delete(s.key); }
  want.forEach((w, key) => {
    const A = w.A;
    if (w.kind === 'area') { const [ni, nj, a, b] = w.at, x = ni * GS + a * (GS / 2 - 0.85) + (b ? 0.9 : 0), z = nj * GS + b * (GS / 2 - 0.85) + (a ? 0.9 : 0);
      signMake({ key, kind: 'area', A, cost: A.cost, x, z, ghostGeo: areaGhostGeo, ghostTex, gx: A.cx, gz: A.cz }); }
    else if (!peopleSignMake(w, key)) { const B = A.bridge, L = Math.hypot(B.x1 - B.x0, B.z1 - B.z0), ux = (B.x1 - B.x0) / L, uz = (B.z1 - B.z0) / L, q = new T.PlaneGeometry(1.7, L, 2, 8); q.rotateX(-Math.PI / 2);
      signMake({ key, kind: 'bridge', A, cost: A.cost, x: B.x0 - ux * 0.6 - uz * 1.5, z: B.z0 - uz * 0.6 + ux * 1.5, ghostGeo: q, ghostTex, gx: (B.x0 + B.x1) / 2, gz: (B.z0 + B.z1) / 2, gy: -0.15, gr: Math.atan2(ux, uz) }); }
  });
  signs.forEach(drawSign);
}
function signNeed(s, t) { return (signCost(s)[t] || 0) - paidN(s, t) - (s.fly[t] || 0); }
function signFull(s) { const c = signCost(s); return KINDS.every((t) => paidN(s, t) >= (c[t] || 0)); }
function signStep(s, dt) {
  s.bump = Math.max(0, s.bump - dt * 4); s.payT -= dt;
  /* open (big, with the progress) while pieces are flying in, small again a moment after */
  s.open += ((s.payT > 0 ? 1 : 0) - s.open) * Math.min(1, dt * 7); const o = s.open, e = o * o * (3 - 2 * o);
  s.sp.visible = o > 0.02; s.sp.material.opacity = e; s.sp.scale.set(s.fullW * (0.55 + 0.45 * e), s.fullH * (0.55 + 0.45 * e), 1); s.sp.position.y = 1.7 + 0.5 * e + s.bump * 0.12;
  s.sm.material.opacity = 1 - e; s.sm.visible = o < 0.98; s.sm.position.y = 1.62 + (reduced ? 0 : Math.sin(time * 2 + s.seed) * 0.03);
  if (signSmallKey(s) !== s.smKey) drawSmall(s);
  s.ghost.material.opacity = 0.55 + (reduced ? 0 : Math.sin(time * 2.4 + s.seed) * 0.25);
  if (rising || building || giveT > 0 || Math.hypot(pip.position.x - s.x, pip.position.z - s.z) > 0.85) return;
  if (loopSignShut(s)) return; /* the bridge needs its key first (loop.js) */
  if (gearSignShut(s)) return; /* a spider web over the bridge (gear.js) */
  const t = KINDS.concat(['coin']).find((q) => haveN(q) > 0 && signNeed(s, q) > 0); if (!t) return;
  /* from the counter: the piece appears over Pip's head and flies on to the sign */
  invWig(t); const m = spendN(t, 1)[0] || itemModel(t); if (!m.parent || m.parent === pip) { m.position.set(pip.position.x, 1.9, pip.position.z); } sc.add(m);
  giveT = 0.08; s.fly[t] = (s.fly[t] || 0) + 1; s.payT = 1.2;
  fly(m, () => s.g.localToWorld(tmpV.set(0, 1.9, 0)), () => { sc.remove(m); s.fly[t]--; signPaid(s)[t] = paidN(s, t) + 1; s.bump = 1; drawSign(s); Snd.play('tock', { gain: 0.4, f: 500 + (paidN(s, t) % 12) * 40 });
    if (signFull(s) && !rising && !building && signs.includes(s)) isleBuy(s); }, 0.3);
}
function isleBuy(s) {
  delete state.isle.paid[s.key]; [s.g, s.ring, s.ghost].forEach((m) => sc.remove(m)); signs.splice(signs.indexOf(s), 1);
  if (s.kind === 'area') areaRise(s.A); else if (!peopleBuy(s)) bridgeBuild(s.A, false);
  signs.forEach(drawSign); save();
}

/* ---- bridges: planks laid one by one from the shore to the next island; once built, its area is Pip's ---- */
let building = null;
/* the bridges: worn planks of three kinds, round posts with caps and a rope wrap, and rope rails that sag between them */
const PLANK_GEOS = [0, 1, 2].map((k) => { const q = new T.BoxGeometry(1.66 + k * 0.04, 0.08, 0.36 + (k - 1) * 0.02, 6, 1, 1);
  return fac(q, (cx, cy, cz, i) => { const c = tone(['#c0935f', '#b08454', '#c99f6c'][k], Math.round(cx * 9), 0.25); if (cy < 0) c.multiplyScalar(0.7); if (Math.abs(cx) > 0.74 && cy > 0 && hash(Math.round(cz * 30), k) > 0.5) c.multiplyScalar(0.8); return c; }, 1800 + k); });
const PLANK_GEO = PLANK_GEOS[0];
const RAIL_GEO = (() => { const L = []; for (let k = 0; k < 8; k++) { const t0 = k / 8, t1 = (k + 1) / 8, y0 = -0.16 * Math.sin(t0 * Math.PI), y1 = -0.16 * Math.sin(t1 * Math.PI), len = Math.hypot(0.125, y1 - y0);
    const q = new T.CylinderGeometry(0.024, 0.024, len + 0.012, 5); q.rotateX(Math.PI / 2 - Math.atan2(y1 - y0, 0.125)); q.translate(0, (y0 + y1) / 2, (t0 + t1) / 2); L.push(q); }
  return fac(mergeGeos(L), (cx, cy, cz, i) => tone(Math.floor(cz * 40) % 2 ? '#ead9b0' : '#cdb07e', i, 0.2), 1801); })(); /* one sagging span of rope, 1 long: scaled per gap */
const BPOST_GEO = (() => { const L = []; let q = new T.CylinderGeometry(0.075, 0.095, 1.5, 8, 3); jit(q, 0.008, 1802); q.translate(0, -0.35, 0); L.push(q);
  q = new T.SphereGeometry(0.095, 8, 6); q.scale(1, 0.75, 1); q.translate(0, 0.42, 0); L.push(q);
  [0.2, 0.25].forEach((y) => { const r = new T.TorusGeometry(0.09, 0.018, 5, 10); r.rotateX(Math.PI / 2); r.translate(0, y, 0); L.push(r); });
  return fac(mergeGeos(L), (cx, cy, cz, i) => cy > 0.17 && cy < 0.28 && Math.hypot(cx, cz) > 0.08 ? tone('#ead9b0', i, 0.3) : shadeY(PAL.trunk, cy, -1.1, 0.5, i, 0.4), 1802); })();
function bridgeMesh(A) {
  const B = A.bridge, L = Math.hypot(B.x1 - B.x0, B.z1 - B.z0), ux = (B.x1 - B.x0) / L, uz = (B.z1 - B.z0) / L, g = new T.Group(); g.position.set(B.x0, 0, B.z0); g.rotation.y = Math.atan2(ux, uz); sc.add(g);
  const n = Math.ceil(L / 0.42), planks = [];
  for (let k = 0; k < n; k++) { const m = new T.Mesh(PLANK_GEOS[Math.floor(hash(k, 7) * 3)], MAT); m.position.set((hash(k, 3) - 0.5) * 0.06, 0.04, 0.21 + k * 0.42); m.rotation.y = (hash(k, 4) - 0.5) * 0.05; m.receiveShadow = true; m.castShadow = true; g.add(m); planks.push(m); }
  const rails = new T.Group(); g.add(rails);
  const zs = []; for (let k = 0; k <= Math.floor(L / 1.6); k++) zs.push(Math.min(L - 0.2, 0.2 + k * 1.6));
  zs.forEach((z) => [-0.85, 0.85].forEach((x) => { const p = new T.Mesh(BPOST_GEO, MAT); p.position.set(x, 0.59, z); p.castShadow = true; rails.add(p); }));
  for (let k = 0; k + 1 < zs.length; k++) if (zs[k + 1] - zs[k] > 0.2) [-0.85, 0.85].forEach((x) => { const r = new T.Mesh(RAIL_GEO, MAT); r.scale.z = zs[k + 1] - zs[k]; r.position.set(x, 0.82, zs[k]); rails.add(r); });
  return { g, planks, rails };
}
function bridgeBuild(A, now) {
  const b = bridgeMesh(A);
  if (now) return;
  b.planks.forEach((m) => { m.visible = false; }); b.rails.visible = false;
  building = { A, b, t: 0, k: 0 }; Snd.play('whoosh', { gain: 0.4 });
}
function bridgeStep(dt) {
  const B = building; if (!B) return;
  B.t += dt; const n = B.b.planks.length, want = Math.min(n, Math.floor(B.t / 0.09));
  for (; B.k < want; B.k++) { const m = B.b.planks[B.k]; m.visible = true; m.scale.setScalar(0.01); m.userData.p = 0.001; const w = B.b.g.localToWorld(tmpV.copy(m.position)); if (B.k % 2 === 0) { splash(w.x, -0.2, w.z, 3); Snd.play('tock', { gain: 0.3, f: 300 + B.k * 9 }); } }
  B.b.planks.forEach((m) => { if (m.userData.p > 0 && m.userData.p < 1) { m.userData.p = Math.min(1, m.userData.p + dt * 5); m.scale.setScalar(m.userData.p < 0.7 ? m.userData.p / 0.7 * 1.15 : 1.15 - (m.userData.p - 0.7) / 0.3 * 0.15); } });
  if (B.k >= n && B.t > n * 0.09 + 0.4) {
    B.b.rails.visible = true; building = null; areaMark(B.A); state.isle.areas[B.A.id] = 1;
    pop([B.A.bridge.x1, B.A.bridge.z1]); Snd.play('success', { gain: 0.5 }); Snd.play('sparkle', { gain: 0.4 }); isleSigns(); save();
  }
}

/* ---- drops: chunks that pop out and wait to be picked up ---- */
function dropOut(n) {
  const [t, k] = YIELD[n.kind];
  const kk = tierYield(n), lucky = xpLucky(n), out = Array(lucky ? kk * 2 : kk).fill(t), tr = TREASURE[n.kind]; xpGain(XP_FOR[n.kind] || 2); if (Math.random() < tr[1]) out.push(tr[0]);
  out.forEach((t) => { const m = itemModel(t), a = Math.random() * 6.28; m.position.set(n.x, 0.6, n.z); sc.add(m); drops.push({ m, t, vx: Math.cos(a) * 1.4, vz: Math.sin(a) * 1.4, vy: 3.2 + Math.random(), land: 0, wait: 0.15 });
    if (VALUABLE[t]) { Snd.play('sparkle', { gain: 0.45 }); burst(n.x, 1.0, n.z, 5); } });
}
/* treasure: now and then something valuable pops out too. Valuables go in the backpack; building things go straight to the counter. */
const TREASURE = { crystal: ['coin', 0.35], planks: ['coin', 0], tree: ['coin', 0.1], rock: ['coin', 0.15], bush: ['coin', 0.08], boulder: ['coin', 0.3] }; /* coins buy the smith's and the baker's upgrades */
const VALUABLE = { coin: 1 };
function dropStep(d, dt) {
  if (d.land === 0) { d.vy -= 14 * dt; d.m.position.x += d.vx * dt; d.m.position.z += d.vz * dt; d.m.position.y += d.vy * dt; d.m.rotation.y += dt * 6;
    if (d.m.position.y <= 0.06) { d.m.position.y = 0.06; d.land = 1; const v = tmpV.set(d.m.position.x, 0, d.m.position.z); wClamp(v); d.m.position.x = v.x; d.m.position.z = v.z; } return false; }
  d.wait -= dt; d.m.position.y = 0.06 + (reduced ? 0 : Math.abs(Math.sin(time * 3 + d.vx)) * 0.06);
  if (d.wait > 0 || Math.hypot(pip.position.x - d.m.position.x, pip.position.z - d.m.position.z) > dropReach()) return false; /* better tools pull drops in from further */
  const m = d.m;
  if (!VALUABLE[d.t]) { /* logs, stones and berries: up over Pip's head and into the counter */
    invFly(d.t, m.position); sc.remove(m); return true; }
  if (carry.count() + isleIncoming >= cap()) return false;
  isleIncoming++;
  fly(m, () => { carry.parent.updateMatrixWorld(); return pip.localToWorld(tmpV.set(0, 0.72 + carry.items.reduce((a, b) => a + ITEM_H[b.userData.type], 0), -0.32)); }, () => { isleIncoming--; carry.add(m); }, 0.25);
  Snd.play('pop', { gain: 0.4, f: 520 + carry.items.length * 55 }); return true;
}
let isleIncoming = 0;

/* ---- working a tree, rock or bush ---- */
function nodeStep(n, dt) {
  if (n.pop > 0 && n.pop < 1) { n.pop = Math.min(1, n.pop + dt * 2); const s = n.pop < 0.7 ? n.pop / 0.7 * 1.12 : 1.12 - (n.pop - 0.7) / 0.3 * 0.12; n.g.scale.setScalar(s); }
  if (n.shake > 0) { n.shake = Math.max(0, n.shake - dt); const w = Math.sin(n.shake * 60) * n.shake * 0.5; n.main.rotation.z = w; n.main.rotation.x = w * 0.5; } else if (n.st === 'ready') { n.main.rotation.z = 0; n.main.rotation.x = 0; }
  if (n.st === 'fall') { n.fall += dt * 2.2; n.main.rotation.z = Math.min(1.5, n.fall * n.fall * 1.5); n.main.position.y = -Math.max(0, n.fall - 0.8) * 1.2;
    if (n.fall > 1.4) { n.st = 'gone'; n.main.visible = false; n.main.rotation.z = 0; n.main.position.y = 0; } return; }
  if (n.st === 'gone') { n.t -= dt; if (n.t <= 0) { n.st = 'grow'; n.grow = 0.2; n.main.visible = true;
      if (n.kind === 'tree') { n.stump.visible = false; } if (n.kind === 'bush') n.berries.visible = true; } }
  if (n.st === 'grow') { const tg = REGROW[n.kind][1], lo = LOW[n.kind]; n.grow = tg ? Math.min(1, n.grow + dt / tg) : 1; n.main.scale.setScalar(n.full * (lo ? lo + (1 - lo) * n.grow : n.grow));
    if (n.kind === 'bush') { n.main.scale.setScalar(1); n.berries.children.forEach((b, k) => { b.scale.setScalar(Math.min(1, n.grow * 1.3)); }); }
    if (n.grow >= 1) { n.st = 'ready'; n.hp = nodeHits(n); } }
}
function nodeHit(n, side) {
  n.hp -= hitPow(n); if (!side && toolTier() >= 3 && toolKind(n.kind)) wideHit(n); n.shake = byHand(n.kind) ? 0.12 : 0.28; hpShow(n);
  const sx = n.x + (pip.position.x - n.x) * 0.4, sz = n.z + (pip.position.z - n.z) * 0.4;
  if (n.kind === 'tree' || n.kind === 'planks') Snd.play('tock', { gain: 0.55, f: 240 + Math.random() * 40 }); else if (PICKY[n.kind]) Snd.play(n.kind === 'clay' ? 'stamp' : 'impact', { gain: 0.35 }); else Snd.play('swish', { gain: 0.4 });
  if (n.kind !== 'bush' && n.kind !== 'grass') splash(sx, 0.6, sz, 3);
  if (n.hp > 0.01) return;
  dropOut(n); n.t = sleepRegrow(n);
  if (n.kind === 'planks') { n.st = 'gone'; n.main.visible = false; Snd.play('thud', { gain: 0.5 }); ruinOpen(n.ruin); return; }
  if (n.kind === 'tree') { n.st = 'fall'; n.fall = 0; n.stump.visible = true; Snd.play('thud', { gain: 0.5 }); }
  else if (LOW[n.kind]) { n.st = 'gone'; n.main.scale.setScalar(n.full * LOW[n.kind]); Snd.play(n.kind === 'grass' ? 'swish' : 'stamp', { gain: 0.4 }); }
  else { n.st = 'gone'; n.berries.visible = false; }
}
function canWork(n) { return n.st === 'ready' && n.pop >= 0 && (n.pop === 0 || n.pop >= 1) }

/* ---- the island's part of every frame ---- */
function isleStep(dt) {
  const px = pip.position.x, pz = pip.position.z;
  isleRiseStep(dt); bridgeStep(dt); isleBoxStep();
  /* keep Pip and the touch point on land, and out of trees and rocks */
  const v = tmpV.set(px, 0, pz); wClamp(v); pip.position.x = v.x; pip.position.z = v.z;
  nodes.forEach((n) => { if (Math.abs(n.x - pip.position.x) > 3 || Math.abs(n.z - pip.position.z) > 3) return; const r = n.kind === 'tree' ? NODE_R.tree : n.kind === 'grass' ? 0.2 : n.st === 'ready' || n.st === 'grow' ? NODE_R[n.kind] * (n.kind === 'bush' ? 1 : n.main.scale.x / n.full) : 0.2;
    const dx = pip.position.x - n.x, dz = pip.position.z - n.z, d = Math.hypot(dx, dz); if (d < r && d > 1e-4) { pip.position.x = n.x + dx / d * r; pip.position.z = n.z + dz / d * r; }
    const tx = target.x - n.x, tz = target.z - n.z, td = Math.hypot(tx, tz); if (td < r) { const k = td > 1e-4 ? (r + 0.05) / td : 0; target.x = n.x + (k ? tx * k : r + 0.05); target.z = n.z + (k ? tz * k : 0); } });
  chests.forEach((c) => { if (c.gone) return; const dx = pip.position.x - c.x, dz = pip.position.z - c.z, d = Math.hypot(dx, dz); if (d < 0.5 && d > 1e-4) { pip.position.x = c.x + dx / d * 0.5; pip.position.z = c.z + dz / d * 0.5; } });
  /* work the nearest ready thing within reach */
  hitT -= dt; giveT -= dt; pickHintT -= dt;
  let best = null, bd = 9;
  nodes.forEach((n) => { if (n.st !== 'ready') return; const d = Math.hypot(pip.position.x - n.x, pip.position.z - n.z) - NODE_R[n.kind]; if (d < 0.75 && d < bd) { bd = d; best = n; } });
  if (best && gated(best)) { if (pickHintT <= 0 && hitT <= 0) { pickHintT = 2.5; tierBounce(best); } best = null; } /* too weak a tool: it bounces off, and shows the tool it needs */
  if (best && canWork(best) && hitT <= 0 && !enSleep) {
    if (enHas(best.kind)) { hitT = best.kind === 'bush' || best.kind === 'grass' || best.kind === 'shroom' ? 0.5 : 0.55; workStart(best); enUse(best.kind); }
    else if (pickHintT <= 0) { pickHintT = 2.5; enTired(); }
  }
  workStep(dt);
  nodes.forEach((n) => nodeStep(n, dt));
  for (let k = drops.length - 1; k >= 0; k--) if (dropStep(drops[k], dt)) drops.splice(k, 1);
  signs.forEach((s) => signStep(s, dt)); hpStep(dt); enStep(dt);
  storeStep2(dt); invFlyStep(dt); invStep();
  for (let k = chests.length - 1; k >= 0; k--) { chestStep(chests[k], dt); if (chests[k].gone) chests.splice(k, 1); }
  if (hintSp.visible) { hintSp.t -= dt; hintSp.material.opacity = Math.min(1, hintSp.t * 2); if (hintSp.t <= 0) hintSp.visible = false; }
  const fl = reduced ? 1 : 1 + Math.sin(time * 13) * 0.12 + Math.sin(time * 7.3) * 0.08; campFlame.f.scale.set(1, fl, 1); campFlame.f2.scale.set(1, 2 - fl, 1); bldStep(dt); xpStep(dt); luckStep(dt); ruinStep(dt); caveStep(dt); springStep(dt); zoneStep(dt); timedStep(dt); peopleStep(dt);
}
/* the pets keep inside the box of the land Pip is on: home, or an island once Pip is there */
function isleBoxStep() { const A = areaAt(pip.position.x, pip.position.z); if (A && HAS[A.id] && !A.cave) { const b = ISLAND.box; b.x0 = A.cx - 5.4; b.x1 = A.cx + 5.4; b.z0 = A.cz - 5.4; b.z1 = A.cz + 5.4; } }
/* a picture over a rock that needs the pickaxe */
const hintSp = isleSprite(isleBubble('pick'), 0.8); hintSp.visible = false; sc.add(hintSp);
function isleHint(n) { hintSp.material.map = isleBubble(gateIcon(n)); hintSp.position.set(n.x, (HP_H[n.kind] || 1.2) + 0.75, n.z); hintSp.visible = true; hintSp.t = 1.8; Snd.play('blip', { gain: 0.2, f: 420 }); }

/* the guide arrow: to a chest, to a sign once the backpack is full, and to a tree right at the start */
function isleGoal() {
  const pp = pip.position, by = (L, f) => { let b = null, bd = 1e9; L.forEach((o) => { const d = Math.hypot(pp.x - o.x, pp.z - o.z); if ((!f || f(o)) && d < bd) { bd = d; b = o; } }); return b; };
  if (spring && !spring.used && !inCave) return [spring.x, spring.z]; /* a spring is splashing: run into it */
  const c = by(chests, (o) => !o.open && o.pop >= 1 && HAS[o.idx]); if (c) return [c.x, c.z + 0.85]; /* only on land Pip can reach */
  const ru = by(ruins, (o) => !o.open && HAS[o.A.id] && Math.hypot(pp.x - o.x, pp.z - o.z) < 8); if (ru && !enLow()) return [ru.dx, ru.dz];
  if (enSleep) return null;
  if (flutter && !flutter.caught && !inCave) return [flutter.g.position.x, flutter.g.position.z]; /* the golden butterfly */
  if (enLow()) return [TENT_RING.x, TENT_RING.z]; /* too tired to work: off to the tent */
  if (rising || hpBar.sp.visible) return null; /* no arrow over the thing Pip is busy with */
  const full = carry.count() >= cap(), some = carry.count() > 0;
  /* a sign that what Pip has (backpack and crate together) can fill right now */
  const pg = peopleGoal(); if (pg) return pg;
  const can = by(signs, (o) => KINDS.concat(['coin']).every((t) => signNeed(o, t) <= haveN(t)));
  if (can && (full || some || KINDS.some((t) => haveN(t) >= 3))) return [can.x, can.z];
  if (full) return [STORE.x, STORE.z + 0.95];
  if (Object.keys(state.isle.areas).length === 1 && !some && !drops.length) { const n = by(nodes, (o) => o.kind === 'tree' && o.st === 'ready'); if (n) return [n.x, n.z + 0.7]; }
  return null;
}
function isleInit() {
  if (nodes.length) return;
  if (!state.isle || state.isle.map !== MAP_V) state.isle = fresh().isle; /* a save made for another map starts over */
  const I = state.isle; I.paid = I.paid || {}; I.chests = I.chests || {}; I.ruins = I.ruins || {}; I.bld = I.bld || { tent: 1, fire: 1 }; I.tools = I.tools || { pick: 0, bag: 0 }; I.areas = I.areas || { h0: 1 }; I.folk = I.folk || {}; I.dug = I.dug || {};
  AREAS.forEach((A) => { if (HAS[A.id] && A.bridge) bridgeBuild(A, true); if (HAS[A.id] || drawn(A.i, A.j)) areaFill(A, false); });
  nodes.forEach((n) => { n.pop = 0; n.g.scale.setScalar(1); });
  chests.forEach((c) => { c.pop = 1; c.g.scale.setScalar(1); });
  I.store = I.store || { log: 0, stone: 0, berry: 0 }; tierMigrate(I); if (typeof I.en !== 'number') I.en = enMax(); invBuild(); enBuild(); bldInit(); xpBuild(); peopleInit(); gearInit();
  isleSigns();
  pip.position.set(0, 0, 0.4); target.copy(pip.position); camFocus.copy(pip.position);
  dog.g.position.set(-1.2, 0, -0.6); petsInit();
}
function isleTest() {
  return { work: work ? [work.kind, +work.t.toFixed(2)] : null, arms: limbs.filter((l) => l.arm).map((l) => [+l.g.position.x.toFixed(2), +l.g.rotation.x.toFixed(2)]), tool: [TOOL.axe.visible, !!TOOL.axe.parent], store: Object.assign({}, state.isle.store), inv: INV.el ? INV.el.textContent : '', areas: Object.keys(state.isle.areas).join(','), tools: state.isle.tools, signs: signs.length, nodes: nodes.map((n) => n.kind[0] + (n.st === 'ready' ? '' : '-')).join(''), drops: drops.length, rising: !!rising,
    give: (t, n) => { for (let q = 0; q < n && carry.count() < cap(); q++) carry.add(itemModel(t)); },
    signs: () => signs.map((s) => ({ key: s.key, x: s.x, z: s.z, paid: signPaid(s) })),
    nodesAt: () => nodes.map((n) => ({ kind: n.kind, x: n.x, z: n.z, st: n.st })),
    fill: (o) => { Object.keys(o).forEach((t) => { state.isle.store[t] = (state.isle.store[t] || 0) + o[t]; }); },
    own: (ids) => { ids.split(',').forEach((id) => { state.isle.areas[id] = 1; }); save(); },
    tp: (x, z) => { pip.position.set(x, 0, z); target.set(x, 0, z); camFocus.set(x, 0, z); }, building: !!building,
    en: () => +state.isle.en.toFixed(1), setEn: (v) => { state.isle.en = v; }, sleeping: !!enSleep, clock: state.clock, ring: [TENT_RING.x, TENT_RING.z], bld: Object.assign({}, state.isle.bld), cave: inCave, spring: spring ? [spring.x, spring.z, spring.used] : null, springNow: () => { springT = 0; }, flutter: flutter ? flutter.caught : null, dayAt: (f) => { state.clock = Math.floor(state.clock / DAY) * DAY + f * DAY; }, down: stairsDown ? [stairsDown.x, stairsDown.z] : null, upMat: caveA && caveA.mat ? [caveA.mat.x, caveA.mat.z] : null, xp: Object.assign({}, xpS()), gain: (v) => xpGain(v), max: enMax(), up: (k) => bldUp(k), tired: enLow(), pipVis: pip.visible, goal: isleGoal(),
    walk: (x, z) => +walkSdf(x, z).toFixed(2), folk: Object.assign({}, state.isle.folk), tier: toolTier(), smith: SM.g ? [+SM.g.position.x.toFixed(2), +SM.g.position.z.toFixed(2), SM.g.visible] : null, anvil: () => anvilOpen(), baker: BK.g ? [+BK.g.position.x.toFixed(2), +BK.g.position.z.toFixed(2), BK.g.visible] : null, bake: Object.assign({}, state.isle.bake), oven: () => ovenOpen(), village: VG.key, dog: () => dogTest(), gear: () => gearTest(), run: (src) => eval(src), dogLv: (n) => { state.isle.bld.dog = n; dogBagSync(); }, store: Object.assign({}, state.isle.store), counts: () => { const c = {}; nodes.forEach((n) => { c[n.kind] = (c[n.kind] || 0) + 1; }); return c; } };
}

/* ---- the storage crate at the camp: a full backpack empties into it, and signs take from it too ---- */
const STORE = { x: 3.0, z: -2.7 };
const storeN = (t) => (state.isle && state.isle.store ? state.isle.store[t] || 0 : 0);
/* what Pip can pay with: the crate AND the backpack (Leon 2026-11-25: coins in the bag must count, no trip to the crate first) */
const haveN = (t) => storeN(t) + carry.count(t);
/* pay n of a kind: from the backpack first, then the crate; returns the meshes taken off Pip's back (the caller may fly them) */
function spendN(t, n) { const out = []; for (let k = 0; k < n; k++) { const m = carry.take(t); if (m) out.push(m); else state.isle.store[t] = storeN(t) - 1; } invDirty = true; return out; }
const storeG = (() => {
  const g = new T.Group(); g.position.set(STORE.x, 0, STORE.z); sc.add(g); const L = [];
  /* a sturdy plank crate: uneven boards with gaps, corner posts with caps, iron straps, rope handles, and two sacks leaning on it */
  let q = new T.BoxGeometry(1.3, 0.12, 0.9); q.translate(0, 0.06, 0); L.push(fac(q, '#6f5038', 1600));
  [[0, 0.45, 1.3, 0.08, 0], [0, -0.45, 1.3, 0.08, 0], [0.65, 0, 0.9, 0.08, 1], [-0.65, 0, 0.9, 0.08, 1]].forEach(([x, z, w, d, side], k) => { for (let r = 0; r < 3; r++) {
    q = new T.BoxGeometry(w - 0.02, 0.15, d, 5, 1, 1); jit(q, 0.008, 1601 + k * 3 + r); if (side) q.rotateY(Math.PI / 2); q.rotateZ((hash(k, r) - 0.5) * 0.03); q.translate(x, 0.15 + r * 0.175, z);
    const base = ['#cf9a60', '#c08a52', '#d6a56c'][(k + r) % 3]; L.push(fac(q, (cx, cy, cz, i) => shadeY(base, cy, 0, 0.62, Math.round((side ? cz : cx) * 7) + r, 0.3), 1601 + k * 3 + r)); } });
  [[-0.64, -0.44], [0.64, -0.44], [-0.64, 0.44], [0.64, 0.44]].forEach(([x, z], k) => { q = new T.BoxGeometry(0.13, 0.66, 0.13, 1, 3, 1); jit(q, 0.006, 1620 + k); q.translate(x, 0.33, z); L.push(fac(q, (cx, cy, cz, i) => shadeY('#7d5e4e', cy, 0, 0.7, i, 0.35), 1620 + k));
    q = new T.BoxGeometry(0.17, 0.04, 0.17); q.translate(x, 0.675, z); L.push(fac(q, '#5a4336', 1624 + k)); });
  [-0.35, 0.35].forEach((x, k) => { q = new T.BoxGeometry(0.07, 0.56, 0.02); q.translate(x, 0.33, 0.495); L.push(fac(q, '#555c66', 1630 + k)); [0.12, 0.5].forEach((y, j) => { const n = new T.SphereGeometry(0.018, 6, 4); n.translate(x, y, 0.51); L.push(fac(n, '#2f343b', 1632 + k * 2 + j)); }); });
  [-1, 1].forEach((s2, k) => { q = new T.TorusGeometry(0.1, 0.018, 5, 10, Math.PI); q.rotateZ(Math.PI); q.rotateY(Math.PI / 2); q.translate(s2 * 0.7, 0.44, 0); L.push(fac(q, '#ead9b0', 1640 + k)); });
  [[-0.92, 0.2, 0.2], [-0.86, -0.2, 0.17]].forEach(([x, z, r], k) => { q = ico(r, 2, 1650 + k, 0.012); q.scale(1, 1.25, 0.9); q.translate(x, r * 1.1, z); L.push(fac(q, (cx, cy, cz, i) => shadeY(k ? '#d9c39a' : '#e3d0a8', cy, 0, 0.5, i, 0.2), 1650 + k));
    q = new T.TorusGeometry(r * 0.42, 0.016, 5, 10); q.rotateX(Math.PI / 2); q.translate(x, r * 2.2, z); L.push(fac(q, '#a8743f', 1654 + k)); q = ico(r * 0.4, 1, 1656 + k); q.scale(1, 0.7, 1); q.translate(x, r * 2.35, z); L.push(fac(q, '#d9c39a', 1656 + k)); });
  L.forEach((g2, k) => { if (g2.index) L[k] = g2.toNonIndexed(); });
  merged(L, MAT, g);
  /* what is inside: a few logs, stones and berries show once there are some */
  const fill = { log: [], stone: [], berry: [] };
  [['log', [[-0.3, -0.15], [-0.3, 0.12], [-0.05, -0.02]]], ['stone', [[0.25, -0.2], [0.42, 0.05], [0.2, 0.15]]], ['berry', [[0.0, 0.25], [0.15, 0.3], [-0.15, 0.3]]]].forEach(([t, P]) => P.forEach(([x, z], k) => {
    const m = itemModel(t); m.position.set(x, 0.42, z); m.rotation.y = k; m.visible = false; g.add(m); fill[t].push(m); }));
  /* a picture board: the crate with a log, a stone and berries on it, so a child knows what it is */
  const c = document.createElement('canvas'); c.width = 256; c.height = 96; const x = c.getContext('2d'); paperBox(x, 256, 96);
  ['log', 'stone', 'berry'].forEach((t, k) => isleIcon(x, t, 60 + k * 68, 46, 1.0));
  const sp = isleSprite(new T.CanvasTexture(c), 1); sp.scale.set(1.5, 0.56, 1); sp.position.set(0, 1.35, 0); g.add(sp);
  const ring = ropeRing(0.62, 0.78); ring.rotation.x = -Math.PI / 2; ring.position.set(STORE.x, 0.035, STORE.z + 0.95); sc.add(ring);
  return { g, fill, sp };
})();
let storeT = 0;
function storeStep2(dt) {
  /* Pip can't walk through the crate */
  const dx = pip.position.x - STORE.x, dz = pip.position.z - STORE.z;
  if (Math.abs(dx) < 0.85 && Math.abs(dz) < 0.65) { if (0.85 - Math.abs(dx) < 0.65 - Math.abs(dz)) pip.position.x = STORE.x + Math.sign(dx || 1) * 0.85; else pip.position.z = STORE.z + Math.sign(dz || 1) * 0.65; }
  storeT -= dt;
  if (storeT <= 0 && carry.count() && Math.hypot(pip.position.x - STORE.x, pip.position.z - (STORE.z + 0.95)) < 0.8) {
    storeT = 0.12; const m = carry.take(); const t = m.userData.type;
    fly(m, () => storeG.g.localToWorld(tmpV.set(0, 0.5, 0)), () => { sc.remove(m); state.isle.store[t] = storeN(t) + 1; invDirty = true; invWig(t); Snd.play('tock', { gain: 0.35, f: 380 + (storeN(t) % 8) * 30 }); }, 0.26);
  }
  ['log', 'stone', 'berry'].forEach((t) => storeG.fill[t].forEach((m, k) => { m.visible = storeN(t) > k * 4; }));
}

/* ---- the counter at the top: how many of each Pip has (crate and backpack together), pictures and numbers ---- */
let invDirty = true, invLast = '';
const INV = {};
function invBuild() {
  if (INV.el) return;
  const el = document.createElement('div'); el.className = 'inv'; el.setAttribute('role', 'status'); el.setAttribute('aria-label', 'What Pip has');
  const st = document.createElement('style');
  st.textContent = '.inv{position:fixed;top:max(12px,env(safe-area-inset-top,0px));left:max(16px,env(safe-area-inset-left,0px));display:flex;gap:8px;pointer-events:none;z-index:5}'
    + '.inv .it{display:flex;align-items:center;gap:4px;padding:4px 14px 4px 6px;border-radius:999px;background:var(--paper);border:3px solid var(--ink);box-shadow:0 4px 0 rgba(34,48,60,.25)}'
    + '.inv img{width:40px;height:40px}.inv b{font-size:28px;font-weight:700;font-variant-numeric:tabular-nums;min-width:1.4ch;text-align:center}'
    + '.inv b.bump{animation:bump .25s ease-out}.inv .it.wig{animation:invWig .32s ease-out}'
    + '@keyframes invWig{0%{transform:none}25%{transform:rotate(-9deg) scale(1.16)}55%{transform:rotate(7deg) scale(1.08)}80%{transform:rotate(-3deg) scale(1.03)}100%{transform:none}}'
    + '.invfly{position:fixed;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;pointer-events:none;z-index:6;will-change:transform;filter:drop-shadow(0 3px 0 rgba(34,48,60,.25))}@media (max-width:520px){.inv img{width:30px;height:30px}.inv b{font-size:22px}.inv .it{padding:3px 10px 3px 4px}}';
  document.head.appendChild(st);
  KINDS.concat(['coin']).forEach((t) => { const c = document.createElement('canvas'); c.width = c.height = 64; isleIcon(c.getContext('2d'), t, 32, 32, 1.25);
    const it = document.createElement('div'); it.className = 'it'; INV['p' + t] = it; const img = document.createElement('img'); img.alt = ''; img.src = c.toDataURL(); INV['i' + t] = img.src; INV['m' + t] = img; const b = document.createElement('b'); b.textContent = '0';
    it.appendChild(img); it.appendChild(b); el.appendChild(it); INV[t] = b; });
  document.body.appendChild(el); INV.el = el;
}
/* a gathered piece flies from where it landed up to its counter; the counter wiggles as each one arrives (Leon) */
const invFlies = [];
function invFly(t, wp) {
  if (!INV.el) { state.isle.store[t] = storeN(t) + 1; return; }
  const r = canvas.getBoundingClientRect(), v = tmpV.set(wp.x, wp.y + 0.3, wp.z).project(cam);
  const el = document.createElement('img'); el.className = 'invfly'; el.alt = ''; el.src = INV['i' + t]; document.body.appendChild(el);
  const f = { t, el, x0: r.left + (v.x + 1) / 2 * r.width, y0: r.top + (1 - v.y) / 2 * r.height, u: -invFlies.length * 0.06, D: 0.6 + Math.random() * 0.12, side: (Math.random() - 0.5) * 120 };
  el.style.transform = 'translate(' + f.x0 + 'px,' + f.y0 + 'px) scale(0.6)'; el.style.opacity = '0';
  invFlies.push(f); Snd.play('pop', { gain: 0.3, f: 480 + (storeN(t) % 8) * 40 });
}
function invFlyStep(dt) {
  for (let k = invFlies.length - 1; k >= 0; k--) { const f = invFlies[k]; f.u += dt / f.D; if (f.u < 0) continue;
    const u = Math.min(1, f.u), e = u * u * (3 - 2 * u), q = INV['m' + f.t].getBoundingClientRect(), x1 = q.left + q.width / 2, y1 = q.top + q.height / 2;
    const x = f.x0 + (x1 - f.x0) * e + f.side * Math.sin(u * Math.PI) * (1 - u), y = f.y0 + (y1 - f.y0) * e - 90 * Math.sin(u * Math.PI), s = 0.6 + 0.7 * Math.sin(u * Math.PI) + 0.35 * u;
    f.el.style.opacity = String(Math.min(1, u * 6)); f.el.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + (u > 0.85 ? s * (1 - (u - 0.85) * 3) : s) + ') rotate(' + (u * 360 * (f.side > 0 ? 1 : -1)) + 'deg)';
    if (u >= 1) { f.el.remove(); invFlies.splice(k, 1); state.isle.store[f.t] = storeN(f.t) + 1; invWig(f.t); Snd.play('tock', { gain: 0.3, f: 560 + (storeN(f.t) % 8) * 35 }); } }
}
function invWig(t) { const it = INV['p' + t]; if (!it) return; it.classList.remove('wig'); void it.offsetWidth; it.classList.add('wig'); }
function invStep() {
  if (!INV.el) return;
  const K = KINDS.concat(['coin']), v = K.map((t) => storeN(t) + carry.count(t) + invFlies.filter((f) => f.t === t).length * 0), key = v.join(',') + (state.isle.store.hay != null ? 'h' : '') + (state.isle.store.crystal != null ? 'c' : '') + invFlies.map((f) => f.t[0]).join('');
  if (key === invLast) return; invLast = key;
  K.forEach((t, k) => { if (VALUABLE[t]) INV['p' + t].style.display = v[k] ? '' : 'none'; else if (t === 'crystal') INV['p' + t].style.display = state.isle.store[t] != null || invFlies.some((f) => f.t === t) ? '' : 'none'; const b = INV[t]; if (b.textContent !== String(v[k])) { b.textContent = v[k]; b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); } });
}

/* ---- a health bar over the thing Pip is working on: it drains with each hit ---- */
const HP_H = { crystal: 1.5, planks: 1.45, tree: 2.55, rock: 1.25, bush: 1.2, grass: 1.25, clay: 0.95, boulder: 2.1 };
const hpBar = (() => { const c = document.createElement('canvas'); c.width = 160; c.height = 40; const tex = new T.CanvasTexture(c);
  const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false })); sp.scale.set(1.2, 0.3, 1); sp.renderOrder = 10; sp.visible = false; sc.add(sp);
  return { c, tex, sp, n: null, t: 0, shown: 1 }; })();
function hpDraw(f) {
  const x = hpBar.c.getContext('2d'); x.clearRect(0, 0, 160, 40);
  x.beginPath(); x.roundRect(4, 6, 152, 28, 14); x.fillStyle = '#22303c'; x.fill();
  x.beginPath(); x.roundRect(9, 11, 142, 18, 9); x.fillStyle = '#5a4a40'; x.fill();
  if (f > 0) { x.beginPath(); x.roundRect(9, 11, Math.max(18, 142 * f), 18, 9); x.fillStyle = f > 0.5 ? '#7cc85a' : f > 0.25 ? '#f2c23c' : '#e9684a'; x.fill();
    x.beginPath(); x.roundRect(13, 13, Math.max(10, 142 * f - 8), 5, 3); x.fillStyle = 'rgba(255,255,255,0.45)'; x.fill(); }
  hpBar.tex.needsUpdate = true;
}
function hpShow(n) { if (hpBar.n !== n) hpBar.shown = 1; hpBar.n = n; hpBar.t = 2.2; hpBar.sp.visible = true; hpBar.goal = Math.max(0, n.hp / nodeHits(n)); }
function hpStep(dt) {
  const b = hpBar; if (!b.sp.visible || !b.n) return;
  b.t -= dt; b.shown += (b.goal - b.shown) * Math.min(1, dt * 10); hpDraw(b.shown);
  b.sp.position.set(b.n.x, HP_H[b.n.kind] * (b.n.kind === 'tree' ? b.n.full : 1), b.n.z);
  b.sp.material.opacity = Math.min(1, b.t * 3);
  if (b.t <= 0 || (b.n.st !== 'ready' && b.shown < 0.02 && b.t < 1.6)) { b.sp.visible = false; b.n = null; }
}

/* ---- Pip's tools and the work animation: a two-handed overhead swing with the axe (trees) or the pickaxe (rocks);
   the hit lands when the tool comes down. Bushes: both hands reach in and pick. ---- */
const TOOL = (() => {
  const mk = (kind, g0) => { const g = g0 || new T.Group(), L = [], tc = toolCol;
    let q = new T.CylinderGeometry(0.028, 0.032, 0.56, 7); q.translate(0, -0.6, 0); L.push(fac(q, '#a8774f', 1700));
    q = new T.CylinderGeometry(0.036, 0.036, 0.08, 7); q.translate(0, -0.36, 0); L.push(fac(q, '#6e4426', 1701)); /* grip */
    if (kind === 'axe') { q = new T.BoxGeometry(0.06, 0.12, 0.13); q.translate(0, -0.84, 0.06); L.push(fac(q, () => tc('#8b939c'), 1702));
      q = new T.BoxGeometry(0.05, 0.22, 0.1); q.translate(0, -0.84, 0.16); L.push(fac(q, (cx, cy, cz) => cz > 0.19 ? tc('#eef2f5') : tc('#b9c1c9'), 1703)); }
    else if (kind === 'shovel') { q = new T.BoxGeometry(0.03, 0.2, 0.16); q.translate(0, -0.96, 0); L.push(fac(q, (cx, cy) => tc(cy < -1.02 ? '#eef2f5' : '#b9c1c9'), 1708)); }
    else if (kind === 'sickle') { const c = new T.TorusGeometry(0.13, 0.022, 5, 12, Math.PI * 1.2); c.rotateY(Math.PI / 2); c.translate(0, -0.9, 0.1); L.push(fac(c, () => tc('#d4dade'), 1709)); }
    else { q = new T.CylinderGeometry(0.035, 0.035, 0.08, 7); q.translate(0, -0.86, 0); L.push(fac(q, () => tc('#6e7680'), 1704));
      [1, -1].forEach((k) => { const c = new T.ConeGeometry(0.045, 0.26, 6); c.rotateX(k * Math.PI / 2 + k * 0.25); c.translate(0, -0.85 + 0.03, k * 0.14); L.push(fac(c, () => tc('#b9c1c9'), 1705 + k)); }); }
    merged(L, MAT, g); g.scale.setScalar(1.35); g.position.y = 0.12; g.visible = false; return g; };
  const o = { axe: mk('axe'), pick: mk('pick'), shovel: mk('shovel'), sickle: mk('sickle') };
  /* the smith's better tools: the same shapes with copper, then crystal heads */
  o.re = () => ['axe', 'pick', 'shovel', 'sickle'].forEach((k) => { const g = o[k], v = g.visible; while (g.children.length) g.remove(g.children[0]); mk(k, g); g.visible = v; });
  return o;
})();
let work = null, toolHold = 0;
function workStart(n) { work = { n, t: 0, hit: false, kind: n.kind }; }
const ease = (u) => u * u * (3 - 2 * u);
function workStep(dt) {
  const R = limbs.filter((l) => l.arm), arm = R.find((l) => l.g.position.x < 0) || R[0], other = R.find((l) => l !== arm);
  if (arm) [TOOL.axe, TOOL.pick, TOOL.shovel, TOOL.sickle].forEach((t) => { if (t.parent !== arm.g) arm.g.add(t); });
  toolHold = Math.max(0, toolHold - dt);
  if (!work) { TOOL.axe.visible = TOOL.pick.visible = TOOL.shovel.visible = TOOL.sickle.visible = false; pb.rotation.x *= Math.max(0, 1 - dt * 8); return; }
  const w = work, n = w.n, hand = w.kind === 'bush' || w.kind === 'grass' || w.kind === 'shroom' || byHand(w.kind), D = hand ? 0.48 : 0.5;
  w.t += dt / D; const u = Math.min(1, w.t);
  pip.rotation.y = Math.atan2(n.x - pip.position.x, n.z - pip.position.z);
  TOOL.axe.visible = w.kind === 'tree' || w.kind === 'planks'; TOOL.pick.visible = !byHand(w.kind) && NEED[w.kind] === 'pick'; TOOL.shovel.visible = !byHand(w.kind) && NEED[w.kind] === 'shovel'; TOOL.sickle.visible = !byHand(w.kind) && NEED[w.kind] === 'sickle';
  let a, b, lean;
  if (hand) { const s = Math.sin(u * Math.PI * 2); a = -1.25 + s * 0.35; b = -1.25 - s * 0.35; lean = 0.18 * Math.sin(u * Math.PI); if (!w.hit && u > 0.5) { w.hit = true; if (n.st === 'ready') nodeHit(n); } }
  else {
    if (u < 0.55) { const e = ease(u / 0.55); a = -0.35 - 2.55 * e; lean = -0.12 * e; }
    else if (u < 0.72) { const e = (u - 0.55) / 0.17; a = -2.9 + 2.0 * e * e; lean = -0.12 + 0.42 * e; }
    else { const e = ease((u - 0.72) / 0.28); a = -0.9 + 0.5 * e; lean = 0.3 * (1 - e); }
    b = a; if (!w.hit && u >= 0.72) { w.hit = true; if (n.st === 'ready') nodeHit(n); }
  }
  if (!reduced) { if (arm) arm.g.rotation.x = a; if (other) other.g.rotation.x = b; pb.rotation.x = lean; }
  if (u >= 1) { work = null; toolHold = 0.4; }
}

/* ---------- start over: a button in the settings sheet; hold it until the ring is full, then the island starts fresh (copied from the farm's catalog.js) ----------
   Only the game's progress is wiped; how Pip looks and the device settings (sound, steering) stay. */
{
  const top = document.querySelector('#menu .sheetTop'), close = document.getElementById('menuClose');
  if (top) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'round'; b.id = 'restartBtn'; b.setAttribute('aria-label', 'Börja om från början (håll inne)');
    b.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="none" stroke="#e6d9bd" stroke-width="4"/><circle class="hold" cx="24" cy="24" r="21" fill="none" stroke="#e9684a" stroke-width="4" stroke-linecap="round" stroke-dasharray="0 999" transform="rotate(-90 24 24)"/><path d="M33 17 A11 11 0 1 0 35 26" fill="none" stroke="#22303c" stroke-width="4" stroke-linecap="round"/><path d="M28 12 L34 17 L27 21" fill="none" stroke="#22303c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    top.insertBefore(b, close || null);
    const arc = b.querySelector('.hold'), L = 2 * Math.PI * 21, HOLD = 2.0; let t0 = 0, raf = 0, done = false;
    const draw = (f) => arc.setAttribute('stroke-dasharray', (f * L).toFixed(1) + ' 999');
    const stop = () => { if (done) return; cancelAnimationFrame(raf); t0 = 0; draw(0); };
    const tick = () => { if (!t0) return; const f = Math.min(1, (performance.now() - t0) / 1000 / HOLD); draw(f); if (f >= 1) return restart(); if (Math.round(f * 10) !== Math.round((f - 0.016) * 10)) Snd.play('tick', { gain: 0.25, f: 600 + f * 900 }); raf = requestAnimationFrame(tick); };
    const restart = () => {
      done = true; Snd.play('whoosh', { gain: 0.4 });
      /* the island is wiped in place, so every later save (the page's own save on the way out included) writes the fresh island */
      const keep = Object.assign(fresh(), { sound: state.sound, ctrl: state.ctrl });
      Object.keys(state).forEach((k) => { delete state[k]; }); Object.assign(state, keep);
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
      const f = document.getElementById('fade'); if (f) f.style.opacity = '1'; setTimeout(() => location.replace(location.pathname + location.search.replace(/[?&]new=1/, '')), 450);
    };
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); Snd.init(); if (done) return; t0 = performance.now(); raf = requestAnimationFrame(tick); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, stop));
    b.addEventListener('click', (e) => { e.stopPropagation(); if (!done && !t0) { Snd.play('tock', { gain: 0.3, f: 420 }); b.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(10deg)' }, { transform: 'rotate(0)' }], { duration: 300 }); } });
  }
}
/* the island's own camera (Leon's picks, 2026-11-23): a little higher and further back than the farm, with a slight side bend.
   Changing CURVE_DEF here also makes the dev panel's Reset come back to these. */
Object.assign(CURVE_DEF, { strength: 0.011, side: 0.1, pitch: 47, dist: 15.5, ahead: 1.1 }); curveLoadDev();

/* ---------- energy (Leon's idea list, 2026-11-23): each hit costs a little, mining costs more than picking berries.
   When Pip is too tired to work, the guide arrow points to the tent; standing on the mat in front of it, Pip crawls in,
   sleeps till morning (a short nap in the daytime) and comes out full again. A slow trickle comes back on its own too,
   so a child is never stuck. ---------- */
const EN_COST = { crystal: 2, planks: 1, bush: 1, grass: 1, tree: 1, rock: 2, clay: 2, boulder: 2 }; /* the most energy and how fast it comes back: from the tent's and the campfire's level (build.js) */
let enSleep = null, enShow = -1, enNapT = 0;
const enCost = (k) => (byHand(k) ? 1 : EN_COST[k] || 1) * gearEnMul(); /* light scratching by hand: cheaper per go, but it takes three times as many */
const enHas = (k) => state.isle.en >= enCost(k);
function enUse(k) { state.isle.en = Math.max(0, state.isle.en - enCost(k)); }
/* tired: not enough for the cheapest thing nearby (or under a tenth left) */
function enLow() { return state.isle && typeof state.isle.en === 'number' && state.isle.en < 3; }
/* a bubble over Pip: a sleepy tent, so the child knows where to go */
const enHint = isleSprite(isleBubble('tent'), 0.85); enHint.visible = false; sc.add(enHint);
function enTired() { enHint.visible = true; enHint.t = 2; Snd.play('blip', { gain: 0.2, f: 300 }); const b = ENB.el; if (b) { b.classList.remove('wig'); void b.offsetWidth; b.classList.add('wig'); } }
/* the mat in front of the tent: night-blue with a tent and moon, a gold arc fills while Pip stands on it */
const TENT_RING = (() => {
  const x = TENT.x + Math.sin(0.5) * 1.45, z = TENT.z + Math.cos(0.5) * 1.45, R = 0.6;
  const c = document.createElement('canvas'); c.width = c.height = 256; const q = c.getContext('2d');
  q.fillStyle = '#2b3560'; q.beginPath(); q.arc(128, 128, 124, 0, 7); q.fill();
  q.fillStyle = '#f4ecc8'; [[48, 70], [208, 86], [70, 196], [196, 186], [128, 34]].forEach(([a, b]) => { q.beginPath(); q.arc(a, b, 4.5, 0, 7); q.fill(); });
  isleIcon(q, 'tent', 128, 140, 3.2);
  const pad = new T.Mesh(new T.CircleGeometry(R, 40), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true }));
  pad.rotation.x = -Math.PI / 2; pad.position.set(x, 0.05, z); sc.add(pad);
  const glow = new T.Mesh(new T.RingGeometry(R + 0.06, R + 0.26, 40), new T.MeshBasicMaterial({ color: '#f4d76a', transparent: true, opacity: 0, depthWrite: false }));
  glow.rotation.x = -Math.PI / 2; glow.position.set(x, 0.045, z); sc.add(glow);
  const fg = new T.RingGeometry(R - 0.02, R + 0.1, 40, 1, Math.PI / 2, -Math.PI * 2);
  const f = new T.Mesh(fg, new T.MeshBasicMaterial({ color: '#f4b23a', side: T.DoubleSide })); f.rotation.x = -Math.PI / 2; f.position.set(x, 0.06, z); sc.add(f); fg.setDrawRange(0, 0);
  return { x, z, R, pad, glow, fg, w: 0 };
})();
/* the energy bar under the counters: a bolt and a bar that goes green, yellow, red, and pulses when nearly empty */
const ENB = {};
function enBuild() {
  if (ENB.el) return;
  const st = document.createElement('style');
  st.textContent = '.enb{position:fixed;top:calc(max(12px,env(safe-area-inset-top,0px)) + 62px);left:max(16px,env(safe-area-inset-left,0px));display:flex;align-items:center;gap:6px;padding:4px 10px 4px 4px;border-radius:999px;background:var(--paper);border:3px solid var(--ink);box-shadow:0 4px 0 rgba(34,48,60,.25);pointer-events:none;z-index:5}'
    + '.enb img{width:36px;height:36px}.enb .bar{width:120px;height:18px;border-radius:9px;background:#5a4a40;border:2px solid var(--ink);overflow:hidden}.enb .bar i{display:block;height:100%;width:100%;border-radius:7px;background:#7cc85a;box-shadow:inset 0 4px 0 rgba(255,255,255,.4);transition:width .25s ease-out,background-color .3s}'
    + '.enb.low{animation:enLow 1s ease-in-out infinite}.enb.wig{animation:invWig .32s ease-out}@keyframes enLow{50%{transform:scale(1.07)}}'
    + '@media (max-width:520px){.enb{top:calc(max(12px,env(safe-area-inset-top,0px)) + 50px)}.enb img{width:28px;height:28px}.enb .bar{width:90px;height:14px}}';
  document.head.appendChild(st);
  const el = document.createElement('div'); el.className = 'enb'; el.setAttribute('role', 'meter'); el.setAttribute('aria-label', 'Energi'); el.setAttribute('aria-valuemin', '0'); el.setAttribute('aria-valuemax', String(enMax()));
  const c = document.createElement('canvas'); c.width = c.height = 64; isleIcon(c.getContext('2d'), 'bolt', 32, 32, 1.25); const img = document.createElement('img'); img.alt = ''; img.src = c.toDataURL();
  const bar = document.createElement('div'); bar.className = 'bar'; const fill = document.createElement('i'); bar.appendChild(fill);
  el.appendChild(img); el.appendChild(bar); document.body.appendChild(el); ENB.el = el; ENB.fill = fill;
}
function enDraw() {
  if (!ENB.el) return; const v = Math.round(state.isle.en); if (v === enShow) return; enShow = v;
  const f = v / enMax(); ENB.fill.style.width = Math.max(4, f * 100) + '%'; ENB.fill.style.backgroundColor = f > 0.5 ? '#7cc85a' : f > 0.2 ? '#f2c23c' : '#e9684a';
  ENB.el.classList.toggle('low', f <= 0.2); ENB.el.setAttribute('aria-valuenow', String(v));
}
function enStep(dt) {
  const I = state.isle; if (typeof I.en !== 'number') I.en = enMax();
  if (enHint.visible) { enHint.t -= dt; enHint.position.set(pip.position.x, 2.1 + Math.sin(time * 4) * 0.05, pip.position.z); enHint.material.opacity = Math.min(1, enHint.t * 2); if (enHint.t <= 0) enHint.visible = false; }
  const R = TENT_RING, low = I.en < enMax() * 0.35;
  R.glow.material.opacity = low ? 0.3 + (reduced ? 0.2 : 0.3 * (0.5 + 0.5 * Math.sin(time * 3.2))) : 0;
  if (!enSleep) {
    if (!work) I.en = Math.min(enMax(), I.en + dt * enRegen() * (Math.hypot(pip.position.x - FIRE.x, pip.position.z - FIRE.z) < 2.6 ? 2 : 1) /* twice as fast by the fire */);
    const d = Math.hypot(pip.position.x - R.x, pip.position.z - R.z), still = Math.hypot(target.x - pip.position.x, target.z - pip.position.z) < 0.3;
    const on = d < R.R && still && I.en < enMax() - 1 && !rising;
    R.w = on ? Math.min(1, R.w + dt / 0.7) : Math.max(0, R.w - dt * 3); R.fg.setDrawRange(0, 6 * Math.round(40 * R.w));
    if (R.w >= 1) { R.w = 0; R.fg.setDrawRange(0, 0); enSleepStart(); }
    enDraw(); return;
  }
  /* asleep in the tent: the night runs by fast and the bar fills; then Pip crawls out in the morning */
  const S = enSleep; S.t += dt; const q = Math.min(1, Math.max(0, (S.t - 0.6) / 3.0)), e = q * q * (3 - 2 * q);
  if (S.t > 0.6) { state.clock = S.from + (S.to - S.from) * e; clockPinned = true; }
  I.en = S.en0 + (enMax() - S.en0) * e;
  const u = Math.min(1, S.t / 0.6); /* walk into the door, shrinking */
  pip.position.set(R.x + (S.dx - R.x) * u, 0, R.z + (S.dz - R.z) * u); pip.scale.setScalar(Math.max(0.01, 1 - u * 0.9)); pip.visible = u < 1; target.copy(pip.position);
  if (!S.z) { S.z = new T.Sprite(new T.SpriteMaterial({ map: zTex, transparent: true, depthTest: false })); S.z.renderOrder = 6; S.z.scale.set(0.7, 0.46, 1); sc.add(S.z); }
  S.z.visible = S.t > 0.6 && q < 0.97; S.z.position.set(TENT.x + 0.15, 1.6 + Math.sin(S.t * 2.2) * 0.12, TENT.z);
  enDraw();
  if (q >= 1 && S.t > 4.0) {
    sc.remove(S.z); pip.visible = true; pip.scale.setScalar(1); pip.position.set(R.x, 0, R.z); target.copy(pip.position); pip.rotation.y = 0.5; enSleep = null; I.en = enMax(); tierWake(); save();
    Snd.play('success', { gain: 0.5, f: 'C6' }); Snd.play('sparkle', { gain: 0.4 }, 0.1);
    const el = $('toast'); if (el) { el.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true">' + SUN_SVG + '</svg><b>God morgon!</b>'; el.hidden = false; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); clearTimeout(enNapT); enNapT = setTimeout(() => { el.hidden = true; }, 3200); }
  }
}
function enSleepStart() {
  /* at night (or late afternoon), sleep to the next morning; in the daytime, a short nap */
  const f = dayFrac(), day = Math.floor(state.clock / DAY);
  const to = f > 0.5 ? (day + 1) * DAY + DAY * 0.03 : f < 0.03 ? day * DAY + DAY * 0.03 : state.clock + DAY * 0.12;
  enSleep = { t: 0, from: state.clock, to, en0: state.isle.en, dx: TENT.x + Math.sin(0.5) * 0.5, dz: TENT.z + Math.cos(0.5) * 0.5, z: null };
  work = null; Snd.play('pop', { gain: 0.35, f: 380 });
}
