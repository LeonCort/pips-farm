/* ---------- gear against the islands' obstacles (Leon's vision for Pips Island, 2026-11-24) ----------
   No fighting: each obstacle has a piece of gear that gets Pip past it, bought in the build menu once Pip has met it.
     torch:      the cave stairs are pitch dark; spider webs cover the bridges to the stone island and the winter island;
                 angry bees guard the orchard cottage door. With the torch the dark is lit, webs burn away, the smoke calms the bees.
     raincoat:   rain makes every job cost twice the energy. With the coat on (the yellow slicker) rain costs nothing extra.
     snow boots: deep snow on the winter island slows Pip right down. Boots walk normally.
   When Pip meets an obstacle, a bubble shows the gear it needs, and from then on that gear has a card in the build menu. */
const GEAR = {
  torch: { cost: { honey: 3, log: 8, coin: 6 }, eff: ['web', 'bees', 'dark'] },
  coat: { cost: { berry: 14, log: 6, coin: 12 }, eff: ['rain'] },
  boots: { cost: { log: 16, stone: 10, coin: 18 }, eff: ['snowDeep'] }
};
Object.keys(GEAR).forEach((k) => { BLD[k] = { max: 2, cost: [null, null, GEAR[k].cost], pic: [null, k, k] }; });
const gearHas = (k) => bldLv(k) >= 2;
const gearKeys = () => Object.keys(GEAR).filter((k) => gearHas(k) || (state.isle.seen && state.isle.seen[k]));
const GE = { bub: null, cool: {}, webs: [], bees: null, light: null, flame: null, smoke: [] };
const WEB_AT = ['w0']; /* the bridges that start webbed */
const BEES_AT = 'm2'; /* the cottage the bees guard */

function gearIcon(x, t) {
  const blob = (f) => { x.fillStyle = f; x.fill(); x.stroke(); };
  if (t === 'torch') {
    x.beginPath(); x.moveTo(-6, 22); x.lineTo(4, -2); x.lineWidth = 8; x.strokeStyle = PAL.ink; x.stroke(); x.lineWidth = 4.5; x.strokeStyle = '#a8774f'; x.stroke(); x.lineWidth = 3; x.strokeStyle = PAL.ink;
    x.beginPath(); x.roundRect(-1, -6, 12, 8, 2); blob('#7d5e4e');
    x.beginPath(); x.moveTo(6, -28); x.quadraticCurveTo(20, -12, 12, -4); x.lineTo(0, -4); x.quadraticCurveTo(-6, -14, 6, -28); x.closePath(); blob('#f2a13c');
    x.beginPath(); x.moveTo(6, -18); x.quadraticCurveTo(12, -10, 9, -6); x.lineTo(3, -6); x.quadraticCurveTo(1, -12, 6, -18); x.fillStyle = '#ffe07a'; x.fill();
  } else if (t === 'coat') {
    x.beginPath(); x.moveTo(-10, -18); x.lineTo(10, -18); x.lineTo(22, -8); x.lineTo(17, 0); x.lineTo(12, -4); x.lineTo(14, 20); x.lineTo(-14, 20); x.lineTo(-12, -4); x.lineTo(-17, 0); x.lineTo(-22, -8); x.closePath(); blob('#f5c22e');
    x.beginPath(); x.moveTo(0, -16); x.lineTo(0, 20); x.lineWidth = 2.4; x.strokeStyle = '#c08a1a'; x.stroke(); x.fillStyle = '#3a2a1e'; [-8, 0, 8].forEach((y) => { x.beginPath(); x.arc(3.5, y, 1.8, 0, 7); x.fill(); });
  } else if (t === 'boots') {
    [[-11, 0], [9, 3]].forEach(([a, b]) => { x.beginPath(); x.moveTo(a - 6, b - 18); x.lineTo(a + 4, b - 18); x.lineTo(a + 4, b + 4); x.lineTo(a + 13, b + 8); x.quadraticCurveTo(a + 15, b + 15, a + 8, b + 15); x.lineTo(a - 6, b + 15); x.closePath(); blob('#5b88b8');
      x.beginPath(); x.roundRect(a - 8, b - 22, 14, 7, 3); blob('#f4f8fb'); });
  } else if (t === 'web') {
    x.lineWidth = 2.2; x.strokeStyle = '#6e7c88'; x.beginPath(); for (let q = 0; q < 8; q++) { const a = q / 8 * 6.283; x.moveTo(0, 0); x.lineTo(Math.cos(a) * 22, Math.sin(a) * 22); } x.stroke();
    [7, 14, 21].forEach((r) => { x.beginPath(); for (let q = 0; q <= 8; q++) { const a = q / 8 * 6.283; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.stroke(); });
    x.lineWidth = 3; x.strokeStyle = PAL.ink; x.beginPath(); x.arc(6, 4, 5, 0, 7); blob('#3a3340');
  } else if (t === 'bees') {
    [[-10, 4], [8, -8], [10, 12]].forEach(([a, b]) => { x.beginPath(); x.ellipse(a, b, 8, 6, 0, 0, 7); blob('#f2c23c'); x.beginPath(); x.moveTo(a - 2, b - 6); x.lineTo(a - 2, b + 6); x.moveTo(a + 3, b - 5); x.lineTo(a + 3, b + 5); x.stroke();
      x.beginPath(); x.ellipse(a - 1, b - 9, 4, 3, 0.4, 0, 7); x.fillStyle = 'rgba(255,255,255,.85)'; x.fill(); x.stroke(); });
  } else if (t === 'dark') {
    x.beginPath(); x.roundRect(-20, -20, 40, 40, 10); blob('#2c2438'); x.fillStyle = '#f4d76a'; const mn = new Path2D('M-2 -12 A10 10 0 1 0 10 4 A8 8 0 1 1 -2 -12 Z'); x.fill(mn);
  } else if (t === 'rain') {
    x.beginPath(); x.arc(-8, -4, 9, 0, 7); x.arc(4, -9, 11, 0, 7); x.arc(14, -2, 8, 0, 7); blob('#a9b9c9'); x.strokeStyle = '#3f8fd0'; x.lineWidth = 3.5; [-10, 0, 10].forEach((a) => { x.beginPath(); x.moveTo(a, 10); x.lineTo(a - 3, 18); x.stroke(); });
  } else if (t === 'snowDeep') {
    x.beginPath(); x.moveTo(-22, 16); x.quadraticCurveTo(-12, 2, 0, 10); x.quadraticCurveTo(12, 0, 22, 14); x.lineTo(22, 20); x.lineTo(-22, 20); x.closePath(); blob('#f4f8fb');
    x.strokeStyle = '#7fb3dc'; x.lineWidth = 2.6; x.beginPath(); for (let q = 0; q < 3; q++) { const a = q / 3 * Math.PI; x.moveTo(Math.cos(a) * -10, -12 + Math.sin(a) * -10); x.lineTo(Math.cos(a) * 10, -12 + Math.sin(a) * 10); } x.stroke();
  }
}
/* the card's effect picture: the obstacles this gear beats */
function gearEff(x, k) {
  const e = GEAR[k].eff;
  if (e.length === 1) isleIcon(x, e[0], 48, 48, 1.4);
  else { isleIcon(x, e[0], 32, 30, 1.0); isleIcon(x, e[1], 70, 42, 0.85); isleIcon(x, e[2], 36, 74, 0.75); }
}

/* a bubble over Pip with the gear the obstacle needs */
function gearHint(k, x, z) {
  const I = state.isle; I.seen = I.seen || {}; if (!I.seen[k]) { I.seen[k] = 1; save(); bldBadge(); }
  if ((GE.cool[k] || 0) > 0) return; GE.cool[k] = 5;
  if (GE.bub) sc.remove(GE.bub); GE.bub = isleSprite(isleBubble(k), 0.85); GE.bub.t = 2.4; GE.bub.at = x == null ? null : [x, z]; sc.add(GE.bub);
  Snd.play('blip', { gain: 0.25, f: 420 });
}

/* ---- spider webs over the bridges ---- */
let webTex = null;
function webModel() {
  if (!webTex) { /* a big round web drawn on a canvas, thick enough to read from far up */
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), R = 118, sp = (r, q) => r * (0.92 + 0.08 * Math.sin(q * 2.3 + r));
    x.translate(128, 128); x.lineCap = 'round';
    [[9, 'rgba(60,70,84,.55)'], [4.5, '#f6f8fb']].forEach(([w, col]) => { x.lineWidth = w; x.strokeStyle = col; x.beginPath();
      for (let q = 0; q < 10; q++) { const a = q / 10 * 6.283 + 0.1; x.moveTo(0, 0); x.lineTo(Math.cos(a) * R, Math.sin(a) * R); }
      [30, 55, 80, 105].forEach((r) => { for (let q = 0; q <= 10; q++) { const a = q / 10 * 6.283 + 0.1; if (q) x.lineTo(Math.cos(a) * sp(r, q), Math.sin(a) * sp(r, q)); else x.moveTo(Math.cos(a) * sp(r, q), Math.sin(a) * sp(r, q)); } });
      x.stroke(); });
    x.beginPath(); x.moveTo(30, -60); x.lineTo(30, -12); x.lineWidth = 2.5; x.strokeStyle = '#f6f8fb'; x.stroke();
    x.beginPath(); x.arc(30, 0, 13, 0, 7); x.fillStyle = '#3a3340'; x.fill(); x.lineWidth = 3; x.strokeStyle = '#1f1a24'; x.stroke();
    x.fillStyle = '#fff'; [-5, 5].forEach((d) => { x.beginPath(); x.arc(30 + d, -3, 3.5, 0, 7); x.fill(); }); x.fillStyle = '#1f1a24'; [-5, 5].forEach((d) => { x.beginPath(); x.arc(30 + d, -2, 1.7, 0, 7); x.fill(); });
    webTex = new T.CanvasTexture(c);
  }
  const o = new T.Group(), sp = new T.Sprite(new T.SpriteMaterial({ map: webTex, transparent: true, depthWrite: false })); sp.scale.set(2.0, 2.0, 1); sp.position.y = 1.0; o.add(sp); o.userData.spider = sp;
  [-1, 1].forEach((s) => { const p = new T.Mesh(new T.CylinderGeometry(0.04, 0.05, 1.9, 6), MAT_POST); p.position.set(s * 0.92, 0.95, 0); o.add(p); });
  return o;
}
const MAT_POST = new T.MeshLambertMaterial({ color: '#8a6a4a' });
function webSync() {
  const I = state.isle;
  WEB_AT.forEach((id) => {
    const A = AREA_BY[id], on = !HAS[id] && !I.webs[id], W = GE.webs.find((w) => w.id === id);
    if (on && !W) { const B = A.bridge, L = Math.hypot(B.x1 - B.x0, B.z1 - B.z0), ux = (B.x1 - B.x0) / L, uz = (B.z1 - B.z0) / L, g = webModel();
      const x = B.x0 + ux * 0.55, z = B.z0 + uz * 0.55; g.position.set(x, 0, z); g.rotation.y = Math.atan2(ux, uz); sc.add(g); GE.webs.push({ id, g, x, z, burn: 0 }); }
    else if (!on && W && !W.burn) { sc.remove(W.g); GE.webs.splice(GE.webs.indexOf(W), 1); }
  });
}
/* a bridge sign stays shut while its web is up (isle.js signStep asks) */
function gearSignShut(s) {
  if (s.kind !== 'bridge') return false; const W = GE.webs.find((w) => w.id === s.A.id); if (!W) return false;
  if (gearHas('torch')) { webBurn(W); return true; }
  gearHint('torch'); return true;
}
function webBurn(W) {
  if (W.burn) return; W.burn = 0.001; state.isle.webs[W.id] = 1; save();
  Snd.play('whoosh', { gain: 0.4, f: 500 }); Snd.play('sparkle', { gain: 0.35 }, 0.3);
  for (let k = 0; k < 10; k++) smokePuff(W.x + (Math.random() - 0.5) * 1.4, 0.3 + Math.random() * 1.4, W.z + (Math.random() - 0.5) * 0.4, '#f2a13c');
}

/* ---- the bees at the orchard cottage ---- */
const beeGeo = new T.SphereGeometry(0.1, 8, 6), beeMat = new T.MeshLambertMaterial({ color: '#f2c23c' }), beeWing = new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7 });
function beesMake(R) {
  const g = new T.Group(); sc.add(g); const list = [];
  for (let k = 0; k < 10; k++) { const b = new T.Mesh(beeGeo, beeMat); b.scale.set(1, 0.85, 1.3); const w = new T.Mesh(new T.CircleGeometry(0.08, 8), beeWing); w.position.set(0, 0.05, 0); w.rotation.x = -1.2; b.add(w);
    const st = new T.Mesh(new T.TorusGeometry(0.085, 0.024, 4, 10), new T.MeshLambertMaterial({ color: '#2c2438' })); st.scale.set(1, 1, 1); b.add(st); g.add(b); list.push({ m: b, a: k / 10 * 6.283, r: 0.35 + (k % 3) * 0.18, h: 0.7 + (k % 4) * 0.22, sp: 2.5 + (k % 3) }); }
  /* a hive hanging by the door */
  const hv = new T.Mesh(new T.SphereGeometry(0.22, 10, 8), new T.MeshLambertMaterial({ color: '#e0a83c' })); hv.scale.set(1, 1.3, 1); const c = Math.cos(R.rot), s = Math.sin(R.rot);
  hv.position.set(R.x + s * 1.0 + c * 0.75, 1.25, R.z + c * 1.0 - s * 0.75); sc.add(hv);
  GE.bees = { R, g, list, hv, calm: 0, x: R.x + s * 1.35, z: R.z + c * 1.35 };
}
function beesOn() { const B = GE.bees; return !!B && !B.calm; }
/* the planks on the bee cottage cannot be knocked off while the bees buzz (tiers.js gated asks) */
const gearGate = (n) => !!(n.ruin && GE.bees && GE.bees.R === n.ruin && beesOn());
function beesStep(dt) {
  const I = state.isle;
  if (!GE.bees) { const R = ruins.find((r) => r.A.id === BEES_AT); if (R && !R.open && !I.calm[BEES_AT]) beesMake(R); return; }
  const B = GE.bees, pp = pip.position, d = Math.hypot(pp.x - B.x, pp.z - B.z);
  if (!B.calm) {
    if (d < 2.6 && gearHas('torch')) { B.calm = 0.001; I.calm[BEES_AT] = 1; save(); Snd.play('sparkle', { gain: 0.35 }); for (let k = 0; k < 8; k++) smokePuff(B.x + (Math.random() - 0.5), 0.6 + Math.random(), B.z + (Math.random() - 0.5), '#d8d8d8'); }
    else if (d < 2.2) { gearHint('torch'); if (d < 1.5 && d > 1e-3) { pp.x = B.x + (pp.x - B.x) / d * 1.5; pp.z = B.z + (pp.z - B.z) / d * 1.5; target.copy(pp); } }
    if (d < 6 && !reduced && Math.random() < dt * 2) Snd.play('tock', { gain: 0.05, f: 900 + Math.random() * 200 });
  } else B.calm = Math.min(1, B.calm + dt * 0.5);
  B.list.forEach((b, k) => {
    b.a += dt * b.sp * (B.calm ? 0.4 : 1);
    const hx = B.hv.position.x, hz = B.hv.position.z, ox = B.x + Math.cos(b.a) * b.r * (B.calm ? 0.4 : 1.6), oz = B.z + Math.sin(b.a) * b.r * (B.calm ? 0.4 : 1.2), u = B.calm;
    b.m.position.set(ox + (hx - ox) * u + (u ? Math.cos(b.a) * 0.3 : 0), b.h + Math.sin(time * 7 + k) * 0.08 + (1.25 - b.h) * u, oz + (hz - oz) * u + (u ? Math.sin(b.a) * 0.3 : 0));
    b.m.rotation.y = -b.a; b.m.children[0].rotation.z = Math.sin(time * 60 + k) * 0.6;
  });
}

/* ---- smoke and fire puffs ---- */
const puffGeo = new T.SphereGeometry(0.12, 8, 6);
function smokePuff(x, y, z, col) { const m = new T.Mesh(puffGeo, new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8, depthWrite: false })); m.position.set(x, y, z); sc.add(m); GE.smoke.push({ m, t: 0, v: 0.6 + Math.random() * 0.6 }); }
function smokeStep(dt) { for (let k = GE.smoke.length - 1; k >= 0; k--) { const s = GE.smoke[k]; s.t += dt; s.m.position.y += s.v * dt; s.m.scale.setScalar(1 + s.t * 2.5); s.m.material.opacity = Math.max(0, 0.8 - s.t * 0.8); if (s.t > 1) { sc.remove(s.m); GE.smoke.splice(k, 1); } } }

/* ---- darkness: the cave stairs (cave.js asks before Pip goes down) ---- */
function gearDark() { if (gearHas('torch')) return true; gearHint('torch'); return false; }
function torchLight() {
  if (GE.light) return; GE.light = new T.PointLight('#ffb35a', 0, 7, 1.6); GE.light.position.set(0.3, 1.6, 0.2); pip.add(GE.light);
  GE.flame = isleSprite(isleBubble('torch'), 0.01); GE.flame.visible = false;
}

/* ---- rain and snow ---- */
const gearWet = () => raining() && !inCave && !gearHas('coat');
const gearEnMul = () => (gearWet() ? 2 : 1); /* rain without a coat: every job costs twice (isle.js enUse) */
const gearRain = () => gearHas('coat'); /* the yellow slicker only shows once Pip owns the coat (rain.js) */
const gearSnow = () => !inCave && zoneSeason === 'winter' && !gearHas('boots') && (() => { const A = areaAt(pip.position.x, pip.position.z); return !!A && A.biome === 'snow'; })();
const gearSlow = () => (state.isle && GE.ready && gearSnow() ? 0.5 : 1); /* deep snow: half speed without boots (rules.js speed) */
function gearInit() { const I = state.isle; I.seen = I.seen || {}; I.webs = I.webs || {}; I.calm = I.calm || {}; GE.ready = 1; webSync(); torchLight(); }
function gearStep(dt) {
  Object.keys(GE.cool).forEach((k) => { GE.cool[k] -= dt; });
  if (GE.bub) { GE.bub.t -= dt; const p = pip.position; GE.bub.position.set(p.x, 2.35 + Math.sin(time * 4) * 0.05, p.z); GE.bub.material.opacity = Math.min(1, GE.bub.t * 3); if (GE.bub.t <= 0) { sc.remove(GE.bub); GE.bub = null; } }
  webSync();
  GE.webs.forEach((W) => {
    if (W.burn) { W.burn += dt; W.g.scale.setScalar(Math.max(0.01, 1 - W.burn * 1.4)); if (W.burn > 0.75) { sc.remove(W.g); GE.webs.splice(GE.webs.indexOf(W), 1); } return; }
    W.g.userData.spider.position.y = 1.0 + Math.sin(time * 1.5) * 0.04;
    const d = Math.hypot(pip.position.x - W.x, pip.position.z - W.z); if (d < 2.3 && gearHas('torch')) webBurn(W); else if (d < 1.6) gearHint('torch');
  });
  beesStep(dt); smokeStep(dt);
  if (GE.light) GE.light.intensity = inCave && gearHas('torch') ? 1.6 + (reduced ? 0 : Math.sin(time * 13) * 0.15) : 0;
  /* the hints for rain and snow, while Pip is out in it */
  const moving = Math.hypot(target.x - pip.position.x, target.z - pip.position.z) > 0.3;
  if (gearWet() && (work || moving) && !enSleep) gearHint('coat');
  if (gearSnow() && moving) { gearHint('boots'); if (!reduced && Math.random() < dt * 6) smokePuff(pip.position.x + (Math.random() - 0.5) * 0.4, 0.1, pip.position.z + (Math.random() - 0.5) * 0.4, '#ffffff'); }
}
function gearGot(k) {
  const p = pip.position; burst(p.x, 1.6, p.z, 8); GE.cool[k] = 0;
  if (GE.bub) { sc.remove(GE.bub); GE.bub = null; }
}
const gearTest = () => ({ torch: gearHas('torch'), coat: gearHas('coat'), boots: gearHas('boots'), seen: Object.assign({}, state.isle.seen), webs: GE.webs.map((w) => w.id), bees: GE.bees ? (GE.bees.calm ? 'calm' : 'angry') : null, slow: gearSlow(), en: gearEnMul(), keys: bldKeys() });
