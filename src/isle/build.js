/* ---------- the build menu (Leon's idea list, 2026-11-23): make the camp better ----------
   A hammer button opens two picture cards: the tent (a bigger tent, then a little hut: more energy) and the campfire
   (benches, then a cooking pot: energy comes back faster). Each card shows the next look, what it does, and what it
   costs; the hammer on the card goes green when the counters hold enough. Paid from the counters, like the signs. */
const BLD = {
  tent: { max: 3, cost: [null, null, { log: 12, berry: 5 }, { log: 20, stone: 10, berry: 10 }], pic: [null, 'tent', 'tent', 'hut'] },
  fire: { max: 3, cost: [null, null, { log: 6, stone: 4 }, { log: 12, stone: 12, crystal: 2 }], pic: [null, 'fire', 'fire', 'fire'] },
  /* the axe and the pickaxe cards at the smith's anvil only sharpen now (Leon 2026-11-28): five levels, cheap at first. The
     tier, the tool itself, comes from a friend's forging card (tool2 to tool4, tiers.js TOOL_FORGE). Pictures: toolPics(). */
  axe: { max: 5, cost: [null, null, { log: 5, coin: 2 }, { log: 12, stone: 4, coin: 5 }, { log: 24, crystal: 3, coin: 12 }, { log: 40, crystal: 8, coin: 24 }], pic: [null, 'axe', 'axe', 'axe', 'axe', 'axe'] },
  pick: { max: 5, cost: [null, null, { stone: 5, coin: 2 }, { stone: 12, log: 4, coin: 5 }, { stone: 24, crystal: 3, coin: 12 }, { stone: 40, crystal: 8, coin: 24 }], pic: [null, 'pick', 'pick', 'pick', 'pick', 'pick'] },
  tool2: { max: 2, cost: [null, null, { copper: 3, log: 10, coin: 6 }], pic: [null, 'axe', 'forge2'] },
  tool3: { max: 2, cost: [null, null, { iron: 4, stone: 20, coin: 16 }], pic: [null, 'forge2', 'forge3'] },
  tool4: { max: 2, cost: [null, null, { glow: 2, crystal: 8, coin: 30 }], pic: [null, 'forge3', 'forge4'] }
};
const bldKeys = () => ['tent', 'fire', 'dog'].concat(forgeUp() ? toolKeys() : [], forgeKeys(), ovenUp() ? ['oven', 'sweet'] : [], gearKeys(), Object.keys(HAM_KEY).filter((k) => mons()[HAM_KEY[k]]));
const bldLv = (k) => (state.isle && state.isle.bld && state.isle.bld[k]) || 1;
const enMax = () => [0, 100, 130, 160][bldLv('tent')] + xpEn() + (state.isle.folk && state.isle.folk.knitter >= 3 ? 25 : 0); /* the knitter's quilt */
const enRegen = () => [0, 0.2, 0.33, 0.5][bldLv('fire')];
const bldCan = (k) => { const c = BLD[k].cost[bldLv(k) + 1]; return !!c && Object.keys(c).every((t) => haveN(t) >= c[t]); };
let bldPop = null;

/* ---- how the tent and the campfire look at each level ---- */
function tentShape(lv) {
  const t = campFlame.t; while (t.children.length) t.remove(t.children[0]);
  let q;
  if (lv <= 2) {
    /* a ridge tent like the one on the farm: striped canvas, tied-back flaps, guy ropes and pegs; level 2 is bigger, with a flag and a lantern */
    const big = lv === 2, r = big ? 1.18 : 0.98, sy = 0.8, len = big ? 1.7 : 1.4, top = r * sy * 1.5, zf = len / 2;
    propTent(t, r, sy, len, big);
    [-1, 1].forEach((s) => [-zf * 0.6, zf * 0.6].forEach((z) => { const a = new T.Vector3(s * r * 0.48, top * 0.4, z), b = new T.Vector3(s * (r + 0.32), 0.03, z), L = a.distanceTo(b), g = new T.CylinderGeometry(0.011, 0.011, L, 4); g.rotateZ(Math.atan2(b.x - a.x, a.y - b.y));
      part(fac(g, '#fff6e4', 1324), t, (a.x + b.x) / 2, (a.y + b.y) / 2, z, true); part(fac(new T.CylinderGeometry(0.028, 0.018, 0.15, 5), '#6b4630', 1325), t, b.x, 0.06, z, true); }));
    /* a rolled blanket and a little mat at the door */
    q = new T.CylinderGeometry(0.09, 0.09, 0.42, 10); q.rotateZ(Math.PI / 2); part(fac(q, (cx, cy, cz, i) => shadeY(Math.floor((cx + 1) / 0.07) % 2 ? '#5b88b8' : '#f4f8fb', cy, -0.1, 0.1, i, 0.3), 1326), t, -r * 0.62, 0.09, zf + 0.22);
    if (big) {
      q = new T.CylinderGeometry(0.022, 0.022, 0.55, 5); part(fac(q, PAL.trunk, 1327), t, 0, top + 0.27, zf + 0.08);
      q = new T.BufferGeometry(); q.setAttribute('position', new T.Float32BufferAttribute([0, 0.09, 0, 0.36, 0.01, 0, 0, -0.09, 0], 3)); q.computeVertexNormals(); const fm = new T.Mesh(q, new T.MeshBasicMaterial({ color: '#74a857', side: T.DoubleSide })); fm.position.set(0, top + 0.45, zf + 0.08); t.add(fm); t.userData.flag = fm;
      part(fac(new T.CylinderGeometry(0.026, 0.026, 0.9, 6), '#6b4630', 1328), t, r * 0.72, 0.45, zf + 0.3);
      const lm = new T.Mesh(new T.BoxGeometry(0.14, 0.18, 0.14), new T.MeshBasicMaterial({ color: '#ffe07a' })); lm.position.set(r * 0.72, 0.96, zf + 0.3); t.add(lm);
      part(fac(new T.ConeGeometry(0.12, 0.09, 4).rotateY(Math.PI / 4), '#3a3f48', 1329), t, r * 0.72, 1.1, zf + 0.3, true);
    } else t.userData.flag = null;
  } else {
    /* a wooden hut: stone footing, board walls, a shingle roof, a door, a lit window with shutters, a stone chimney */
    const L = [], W = 1.9, D = 1.4, H = 0.95, y0 = 0.15, zf = D / 2;
    kitStone(L, W + 0.14, y0, D + 0.14, 0, 0, 0, 1340, { ch: 0.15, bl: 0.3 });
    kitPlanks(L, W, H, D, y0, 1350);
    kitRoof(L, W + 0.42, D + 0.56, y0 + H - 0.05, 0.86, 1360);
    kitStone(L, 0.36, 1.0, 0.36, 0.55, 1.3, -0.32, 1500, { ch: 0.14, bl: 0.18, th: 0.08, cols: ['#a99f8c', '#9a917f', '#b5ab98'] });
    q = new T.BoxGeometry(0.46, 0.07, 0.46); q.translate(0.55, 2.33, -0.32); L.push(fac(q, () => new T.Color('#8a806e'), 1540));
    /* the door */
    [-1, 0, 1].forEach((k) => { q = new T.BoxGeometry(0.14, 0.68, 0.04); q.translate(-0.42 + k * 0.146, y0 + 0.36, zf + 0.035); L.push(fac(q, (cx, cy) => shadeY('#8a4a32', cy, 0, 1.2, k, 0.5), 1550 + k)); });
    [[-0.67, 0.37, 0.07, 0.78], [-0.17, 0.37, 0.07, 0.78], [-0.42, 0.76, 0.57, 0.07]].forEach(([x, y, w, h], k) => { q = new T.BoxGeometry(w, h, 0.07); q.translate(x, y0 + y, zf + 0.04); L.push(fac(q, () => tone('#6e4426', k, 0.5), 1555 + k)); });
    [0.18, 0.56].forEach((y, k) => { q = new T.BoxGeometry(0.44, 0.045, 0.02); q.translate(-0.42, y0 + y, zf + 0.062); L.push(fac(q, () => new T.Color('#4a4f57'), 1560 + k)); });
    q = ico(0.028, 1, 1563); q.translate(-0.28, y0 + 0.36, zf + 0.075); L.push(fac(q, () => new T.Color('#f2c23c'), 1563));
    q = ico(0.3, 1, 1564, 0.02); q.scale(1, 0.12, 0.7); q.translate(-0.42, 0.03, zf + 0.42); L.push(fac(q, () => new T.Color('#b3b9bf'), 1564)); /* a doorstep stone */
    /* the window: frame, cross, shutters, a flower box */
    [[0.5, 0.78, 0.5, 0.05], [0.5, 0.4, 0.5, 0.05], [0.27, 0.59, 0.05, 0.43], [0.73, 0.59, 0.05, 0.43], [0.5, 0.59, 0.03, 0.36], [0.5, 0.59, 0.42, 0.03]].forEach(([x, y, w, h], k) => { q = new T.BoxGeometry(w, h, 0.05); q.translate(x, y0 + y, zf + 0.04); L.push(fac(q, () => tone('#f4ecd8', k, 0.3), 1570 + k)); });
    [-1, 1].forEach((s) => [0, 1].forEach((k) => { q = new T.BoxGeometry(0.085, 0.4, 0.03); q.translate(0.5 + s * (0.3 + k * 0.09), y0 + 0.59, zf + 0.035); L.push(fac(q, () => tone('#5d8a5a', s + k, 0.6), 1580 + s + k * 3)); }));
    q = new T.BoxGeometry(0.56, 0.1, 0.13); q.translate(0.5, y0 + 0.3, zf + 0.09); L.push(fac(q, () => new T.Color('#8a5f3c'), 1590));
    for (let k = 0; k < 6; k++) { q = ico(0.045, 0, 1591 + k); q.translate(0.28 + k * 0.088, y0 + 0.39 + hash(k, 2) * 0.03, zf + 0.1); L.push(fac(q, () => new T.Color(['#ffffff', '#f6d24a', '#f29ab8', '#e9684a'][k % 4]), 1591 + k));
      q = ico(0.05, 0, 1600 + k); q.translate(0.26 + k * 0.094, y0 + 0.35, zf + 0.09); L.push(fac(q, () => new T.Color('#5d8a3a'), 1600 + k)); }
    /* a lantern on a bracket by the door */
    q = new T.BoxGeometry(0.03, 0.03, 0.2); q.translate(-0.82, y0 + 0.82, zf + 0.1); L.push(fac(q, () => new T.Color('#3e454d'), 1610));
    q = new T.ConeGeometry(0.07, 0.06, 4); q.rotateY(Math.PI / 4); q.translate(-0.82, y0 + 0.79, zf + 0.18); L.push(fac(q, () => new T.Color('#3e454d'), 1611));
    merged(L, MAT, t);
    const w = new T.Mesh(new T.PlaneGeometry(0.42, 0.34), new T.MeshBasicMaterial({ color: '#ffe07a' })); w.position.set(0.5, y0 + 0.59, zf + 0.03); t.add(w);
    const lm = new T.Mesh(new T.BoxGeometry(0.07, 0.1, 0.07), new T.MeshBasicMaterial({ color: '#ffe6a8' })); lm.position.set(-0.82, y0 + 0.71, zf + 0.18); t.add(lm);
    t.userData.flag = null;
  }
}
const fireX = new T.Group(); campFlame.g.add(fireX);
function fireShape(lv) {
  while (fireX.children.length) fireX.remove(fireX.children[0]);
  const L = [];
  propFireMore(L, lv);
  if (L.length) merged(L, MAT, fireX);
  campFlame.f.position.y = lv >= 3 ? 0.24 : 0.3; campFlame.f.userData.s = lv >= 2 ? 1.2 : 1;
}
function bldInit() {
  const I = state.isle; I.bld = I.bld || { tent: 1, fire: 1 };
  tentShape(bldLv('tent')); fireShape(bldLv('fire')); bldBuild(); bldBadge(); enBarW();
}
function bldStep(dt) {
  if (bldPop) { bldPop.t += dt; const u = Math.min(1, bldPop.t / 0.5), s = u < 1 ? 1 + Math.sin(u * Math.PI) * 0.25 - (1 - u) * 0.3 : 1; bldPop.g.scale.setScalar(s); if (u >= 1) bldPop = null; }
  const fl = campFlame.t.userData.flag; if (fl && !reduced) fl.rotation.y = Math.sin(time * 3) * 0.25;
  const s = campFlame.f.userData.s || 1; campFlame.f.scale.x = campFlame.f.scale.z = s;
  /* Pip walks round the tent, not through it */
  if (!enSleep) { const r = [0, 0.7, 0.92, 1.05][bldLv('tent')], dx = pip.position.x - TENT.x, dz = pip.position.z - TENT.z, d = Math.hypot(dx, dz); if (d < r && d > 1e-4) { pip.position.x = TENT.x + dx / d * r; pip.position.z = TENT.z + dz / d * r; } }
  bldT -= dt; if (bldT <= 0) { bldT = 0.5; bldBadge(); }
  /* cards opened at a spot (anvil, oven, bench, rings) close by themselves when Pip walks away from it (Leon, 2026-11-28) */
  if (BM.at && BM.menu && !BM.menu.hidden && Math.hypot(pip.position.x - BM.at.x, pip.position.z - BM.at.z) > BM.at.r) { BM.menu.hidden = true; BM.at = null; Snd.play('tock', { gain: 0.25, f: 380 }); }
}
let bldT = 0;

/* ---- the button and the cards ---- */
const BM = {};
/* open the cards; at = [x, z] of the spot that opened them, or nothing for the hammer button. Spot cards let taps through
   to the world, so a child can simply walk Pip away, and they close once Pip is out of reach of the spot. */
function bldOpen(keys, at) { BM.keys = keys; BM.at = at ? { x: at[0], z: at[1], r: 1.2 } : null; BM.menu.classList.toggle('walk', !!at); bldFill(); BM.menu.hidden = false; Snd.play('pop', { gain: 0.3, f: 520 }); }
function bldPic(t, sz) { const c = document.createElement('canvas'); c.width = c.height = sz; isleIcon(c.getContext('2d'), t, sz / 2, sz / 2, sz / 64 * 1.25); return c; }
function bldBuild() {
  if (BM.btn) return bldFill();
  const st = document.createElement('style');
  st.textContent = '.bldBtn{position:fixed;top:calc(max(10px,env(safe-area-inset-top,0px)) + 92px);right:max(22px,env(safe-area-inset-right,0px));width:64px;height:64px;border-radius:50%;border:3px solid var(--ink);background:var(--paper);box-shadow:0 5px 0 rgba(34,48,60,.3);padding:6px;z-index:5}'
    + '.bldBtn canvas{width:100%;height:100%;display:block}.bldBtn:active{transform:translateY(3px);box-shadow:0 2px 0 rgba(34,48,60,.3)}.bldBtn i{position:absolute;top:-4px;right:-4px;width:22px;height:22px;border-radius:50%;background:#74a857;border:3px solid var(--ink);display:none}'
    + '.bldBtn.can i{display:block}.bldBtn.can{animation:ready 1.4s ease-in-out infinite}'
    + '.bldMenu{position:fixed;inset:0;display:flex;align-items:center;justify-content:safe center;overflow:auto;background:rgba(34,48,60,.35);z-index:20;padding:16px}.bldMenu[hidden]{display:none}'
    + '.bldMenu .row{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;max-width:100%}'
    + '.bldCard{background:var(--paper);border:4px solid #6e4426;border-radius:24px;box-shadow:0 6px 0 rgba(34,48,60,.3);padding:12px 14px 14px;display:flex;flex-direction:column;align-items:center;gap:8px;width:220px}'
    + '.bldCard .pic{display:flex;align-items:center;gap:6px}.bldCard .pic canvas{width:110px;height:110px}.bldCard .eff canvas{width:56px;height:56px}'
    + '.bldCard .how{width:200px;height:64px;background:#fffaf0;border:2px solid #c9b38a;border-radius:14px}'
    + '.bldCard .dots.many{gap:3px;align-items:center}.bldCard .dots.many b{width:7px;height:7px;border-width:2.5px}.bldCard .dots.many b.big{width:13px;height:13px}'
    + '.bldCard .dots{display:flex;gap:6px}.bldCard .dots b{width:16px;height:16px;border-radius:50%;border:3px solid var(--ink);background:#e6d9bd}.bldCard .dots b.on{background:#f2c23c}'
    + '.bldCard .cost{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}.bldCard .cost span{display:flex;align-items:center;gap:2px;padding:2px 8px 2px 2px;border-radius:999px;border:2px solid var(--ink);font:700 20px Fredoka,sans-serif;background:#fff}'
    + '.bldCard .cost span i{font-style:normal;color:#c2543a}.bldCard .cost span.ok,.bldCard .cost span.ok i{color:#3f8a3a}.bldCard .cost span.tap{cursor:pointer;box-shadow:0 0 0 3px #f4b23a;animation:costTap 1.4s ease-in-out infinite}@keyframes costTap{50%{box-shadow:0 0 0 6px rgba(244,178,58,.35)}}.bldCard .cost img{width:28px;height:28px}'
    + '.bldCard .go{width:100%;height:64px;border-radius:18px;border:3px solid var(--ink);background:#cfc6b4;box-shadow:0 4px 0 rgba(34,48,60,.3);padding:4px;opacity:.6}.bldCard .go canvas{height:100%}'
    + '.bldCard .go.can{background:#74a857;opacity:1;animation:ready 1.4s ease-in-out infinite}.bldCard .go:active{transform:translateY(3px)}.bldCard .done{font-size:44px;line-height:64px}'
    + '.bldMenu{flex-direction:column;gap:16px}.bldMenu .x{width:64px;height:64px;border-radius:50%;border:3px solid var(--ink);background:var(--paper);font:700 34px Fredoka,sans-serif}'
    + '.bldCard.shake{animation:invWig .32s ease-out}@media (prefers-reduced-motion: reduce){.bldBtn.can,.bldCard .go.can{animation:none}}';
  /* the farm's parchment-and-wood look for everything on screen */
  const WOOD = 'linear-gradient(165deg,#c4935f,#7a4c2a 50%,#a8723f) border-box', PARCH = 'linear-gradient(#fdf3dc,#f0dcb2) padding-box', SH = '0 5px 0 rgba(70,40,18,.4),0 9px 14px rgba(70,40,18,.22),inset 0 -4px 8px rgba(160,110,50,.22)';
  st.textContent += '.inv .it,.enb,.bldBtn,.bldMenu .x{border:4px solid transparent!important;background:' + PARCH + ',' + WOOD + '!important;box-shadow:' + SH + '!important;color:#3a2414;position:relative}'
    + '.bldBtn,.bldMenu .x{position:fixed}.bldMenu .x{position:relative}'
    + '.inv .it::after,.enb::after{content:"";position:absolute;inset:2px;border-radius:999px;border:2px dashed rgba(150,105,60,.5);pointer-events:none}'
    + '.inv b{text-shadow:0 1px 0 rgba(255,255,255,.7)}.enb{position:fixed}.enb .bar{border-color:#4a2e1a;background:#5a4030}'
    + '.bldCard{border:6px solid transparent;background:linear-gradient(#fdf3dc,#f3e2bf) padding-box,linear-gradient(165deg,#c4935f,#6e4426 55%,#a8723f) border-box;box-shadow:0 7px 0 rgba(70,40,18,.4),0 14px 22px rgba(70,40,18,.3);color:#3a2414;position:relative}'
    + '.bldCard::after{content:"";position:absolute;inset:4px;border-radius:16px;border:2px dashed rgba(150,105,60,.45);pointer-events:none}'
    + '.bldCard .cost span{border-color:#6e4426;background:#fffaf0}.bldCard .dots b{border-color:#6e4426}.bldCard .go{border-color:#4a2e1a;position:relative;z-index:1}.bldCard .go.can{background:linear-gradient(#8cc46a,#5f9a48);box-shadow:0 4px 0 #3f6a30}'
    + '.bldMenu{background:rgba(58,36,20,.45)}'
    + '.bldMenu.walk{background:none;pointer-events:none}.bldMenu.walk .row{pointer-events:none}.bldMenu.walk .bldCard,.bldMenu.walk .x{pointer-events:auto}';
  document.head.appendChild(st);
  const b = document.createElement('button'); b.type = 'button'; b.className = 'bldBtn'; b.setAttribute('aria-label', 'Bygg'); b.appendChild(bldPic('hammer', 96)); b.appendChild(document.createElement('i')); document.body.appendChild(b); BM.btn = b;
  const m = document.createElement('div'); m.className = 'bldMenu'; m.hidden = true; m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', 'Bygg');
  const row = document.createElement('div'); row.className = 'row'; m.appendChild(row); BM.row = row;
  const x = document.createElement('button'); x.type = 'button'; x.className = 'x'; x.setAttribute('aria-label', 'Stäng'); x.textContent = '✕'; m.appendChild(x);
  document.body.appendChild(m); BM.menu = m;
  const close = () => { m.hidden = true; BM.at = null; Snd.play('tock', { gain: 0.25, f: 380 }); };
  b.addEventListener('click', (e) => { e.stopPropagation(); Snd.init(); bldOpen(null); });
  x.addEventListener('click', (e) => { e.stopPropagation(); close(); });
  m.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (e.target === m) close(); });
  bldFill();
}
const bldImg = {};
function bldIco(t) { if (!bldImg[t]) bldImg[t] = bldPic(t, 64).toDataURL(); const i = document.createElement('img'); i.alt = ''; i.src = bldImg[t]; return i; }
/* what an upgrade does, as a picture: a longer energy bar (tent), faster energy (fire) */
function bldEff(k, lv) {
  const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d');
  if (k === 'dog') { dogEff(x, lv); return c; }
  if (GEAR[k]) { gearEff(x, k); return c; }
  if (TOOL_FORGE[k]) { forgeEff(x, k); return c; }
  if (k === 'oven' || k === 'sweet') { pieEff(x, k, lv); return c; }
  isleIcon(x, k === 'axe' || k === 'pick' ? 'perkHit' : 'bolt', 30, 48, 1.1);
  x.lineWidth = 4; x.strokeStyle = PAL.ink;
  if (k === 'axe' || k === 'pick') { /* four arrows: how sharp the tool is (levels 2 to 5) */ for (let q = 0; q < 4; q++) { x.beginPath(); x.moveTo(48 + q * 11, 26); x.lineTo(58 + q * 11, 42); x.lineTo(48 + q * 11, 58); x.strokeStyle = q < lv - 1 ? '#f2a13c' : '#d8cdb5'; x.lineWidth = 6.5; x.stroke(); } isleIcon(x, BLD[k].pic[Math.min(lv, BLD[k].max)], 70, 76, 0.62); }
  else if (k === 'tent') { for (let q = 0; q < 3; q++) { x.beginPath(); x.roundRect(54, 70 - q * 22, 32, 16, 5); x.fillStyle = q < lv ? '#7cc85a' : '#e6d9bd'; x.fill(); x.stroke(); } }
  else { for (let q = 0; q < 3; q++) { x.beginPath(); x.moveTo(54 + q * 12, 30); x.lineTo(66 + q * 12, 48); x.lineTo(54 + q * 12, 66); x.strokeStyle = q < lv ? '#f2a13c' : '#d8cdb5'; x.lineWidth = 7; x.stroke(); } }
  return c;
}
/* what the next level changes, as "now -> then" in pictures (Leon 2026-11-25, playtest: it was not clear what the tent,
   the fire and the raincoat do). Tent: a longer energy bar. Fire: energy comes back faster while resting. Gear: the
   trouble with a tired Pip, then the gear with a happy Pip. */
function bldHow(k, lv, next) {
  if (HAM_KEY[k]) return lv >= BLD[k].max ? null : hamHow(HAM_KEY[k], lv, next);
  if (k === 'oven' || k === 'sweet') return lv >= BLD[k].max ? null : pieHow(k, lv, next);
  if (k !== 'tent' && k !== 'fire' && !GEAR[k]) return null; if (lv >= BLD[k].max) return null;
  const c = document.createElement('canvas'); c.width = 400; c.height = 128; const x = c.getContext('2d'); x.lineJoin = x.lineCap = 'round';
  const arrow = () => { x.beginPath(); x.moveTo(178, 64); x.lineTo(214, 64); x.moveTo(202, 50); x.lineTo(218, 64); x.lineTo(202, 78); x.lineWidth = 9; x.strokeStyle = '#6e4426'; x.stroke(); };
  const bar = (x0, w, full) => { x.beginPath(); x.roundRect(x0, 46, w, 36, 12); x.fillStyle = '#7cc85a'; x.fill(); x.lineWidth = 5; x.strokeStyle = PAL.ink; x.stroke(); if (full < w) { x.beginPath(); x.roundRect(x0 + full, 49, w - full, 30, 9); x.fillStyle = '#b9ee96'; x.fill(); } };
  const face = (cx, glad) => { x.beginPath(); x.arc(cx, 70, 30, 0, 7); x.fillStyle = '#f6d3b0'; x.fill(); x.lineWidth = 5; x.strokeStyle = PAL.ink; x.stroke();
    x.beginPath(); x.arc(cx, 62, 31, Math.PI, 0); x.closePath(); x.fillStyle = '#f2a13c'; x.fill(); x.stroke(); x.beginPath(); x.arc(cx, 28, 7, 0, 7); x.fill(); x.stroke(); /* Pip's orange hat */
    x.fillStyle = PAL.ink; [-11, 11].forEach((d) => { x.beginPath(); x.arc(cx + d, 72, 3.6, 0, 7); x.fill(); });
    x.beginPath(); if (glad) x.arc(cx, 78, 12, 0.15 * Math.PI, 0.85 * Math.PI); else x.arc(cx, 96, 10, 1.2 * Math.PI, 1.8 * Math.PI); x.lineWidth = 4.5; x.stroke();
    if (!glad) { x.beginPath(); x.moveTo(cx + 30, 52); x.quadraticCurveTo(cx + 42, 70, cx + 32, 74); x.quadraticCurveTo(cx + 22, 70, cx + 30, 52); x.fillStyle = '#7fd3ef'; x.fill(); x.lineWidth = 3; x.stroke(); } };
  arrow();
  if (k === 'tent') { const E = [0, 100, 130, 160], w0 = E[lv] * 0.66, w1 = E[next] * 0.66; isleIcon(x, 'bolt', 30, 64, 1.5); bar(56, w0, w0); isleIcon(x, 'bolt', 254, 64, 1.5); bar(280, w1, w0); }
  else if (k === 'fire') { const ups = (x0, n) => { for (let q = 0; q < 3; q++) { x.beginPath(); x.moveTo(x0 + q * 26, 78); x.lineTo(x0 + 11 + q * 26, 50); x.lineTo(x0 + 22 + q * 26, 78); x.lineWidth = 8; x.strokeStyle = q < n ? '#4f9a3a' : '#e0d6c0'; x.stroke(); } };
    isleIcon(x, 'fire', 34, 62, 1.25); isleIcon(x, 'bolt', 76, 64, 1.1); ups(98, lv); isleIcon(x, 'fire', 256, 62, 1.25); isleIcon(x, 'bolt', 298, 64, 1.1); ups(320, next); }
  else { const e = GEAR[k].eff; isleIcon(x, e[e.length - 1], 44, 64, 1.5); face(124, false); isleIcon(x, k, 270, 64, 1.5); face(346, true); }
  return c;
}
function bldFill() {
  const row = BM.row; if (!row) return; row.textContent = '';
  (BM.keys || bldKeys()).forEach((k) => {
    const B = BLD[k], lv = bldLv(k), next = Math.min(B.max, lv + 1), c = B.cost[lv + 1];
    const card = document.createElement('div'); card.className = 'bldCard'; BM[k] = card;
    const pic = document.createElement('div'); pic.className = 'pic'; pic.appendChild(bldPic(B.pic[next], 128)); const eff = document.createElement('div'); eff.className = 'eff'; eff.appendChild(bldEff(k, next)); if (!HAM_KEY[k]) pic.appendChild(eff); /* a village's card says what it gives in the strip below */ card.appendChild(pic); const how = bldHow(k, lv, next); if (how) { how.className = 'how'; card.appendChild(how); }
    const dots = document.createElement('div'); dots.className = 'dots' + (B.max > 6 ? ' many' : ''); for (let q = 1; q <= B.max; q++) { const d = document.createElement('b'); d.className = (q <= lv ? 'on' : '') + (B.max > 6 && q % 3 === 1 ? ' big' : ''); dots.appendChild(d); } /* a long row: small dots, a bigger one for each new metal */ card.appendChild(dots);
    if (c) {
      const cost = document.createElement('div'); cost.className = 'cost'; Object.keys(c).forEach((t) => { const s = document.createElement('span'), ok = haveN(t) >= c[t]; s.className = ok ? 'ok' : 'lack'; s.appendChild(bldIco(t));
        /* Leon, 2026-11-27: show how many Pip has of each, not only green or not; a missing one opens the map where it is found */
        const h = document.createElement('i'); h.textContent = String(Math.min(haveN(t), c[t])); s.appendChild(h); s.appendChild(document.createTextNode('/' + c[t]));
        if (!ok && mapHintSpots(t).length) { s.classList.add('tap'); s.addEventListener('click', (e) => { e.stopPropagation(); mapOpen(t); }); }
        cost.appendChild(s); }); card.appendChild(cost);
      const go = document.createElement('button'); go.type = 'button'; go.className = 'go' + (bldCan(k) ? ' can' : ''); go.setAttribute('aria-label', 'Bygg'); go.appendChild(bldPic('hammer', 96));
      go.addEventListener('click', (e) => { e.stopPropagation(); bldUp(k); }); card.appendChild(go);
    } else { const d = document.createElement('div'); d.className = 'done'; d.textContent = '⭐'; card.appendChild(d); }
    row.appendChild(card);
  });
}
function bldUp(k) {
  const c = BLD[k].cost[bldLv(k) + 1]; if (!c) return;
  if (!bldCan(k)) { const card = BM[k]; card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); Snd.play('blip', { gain: 0.2, f: 260 });
    const miss = Object.keys(c).filter((t) => haveN(t) < c[t] && mapHintSpots(t).length); miss.sort((a, b) => (FINDS.indexOf(b) >= 0) - (FINDS.indexOf(a) >= 0)); /* the grey hammer shows the way to what is missing, the special find first */
    if (miss.length) setTimeout(() => mapOpen(miss[0]), 420); return; }
  Object.keys(c).forEach((t) => { spendN(t, c[t]).forEach((m) => { fly(m, () => pip.localToWorld(tmpV.set(0, 2.2, 0)), () => sc.remove(m), 0.3); }); });
  state.isle.bld[k] = bldLv(k) + 1; save();
  if (GEAR[k] && BLD[k].pic[bldLv(k)] !== BLD[k].pic[bldLv(k) - 1]) foundIt(BLD[k].pic[bldLv(k)]); /* a new tool or piece of gear is held up */
  if (k === 'tent') { tentShape(bldLv('tent')); bldPop = { g: campFlame.t, t: 0 }; burst(TENT.x, 1.2, TENT.z, 10); state.isle.en = Math.min(enMax(), state.isle.en + 30); }
  else if (k === 'axe' || k === 'pick') toolUp(k);
  else if (TOOL_FORGE[k]) toolForged(k);
  else if (k === 'oven' || k === 'sweet') ovenLevelUp();
  else if (k === 'dog') dogUp();
  else if (GEAR[k]) gearGot(k);
  else if (HAM_KEY[k]) hamGrow(HAM_KEY[k]);
  else { fireShape(bldLv('fire')); bldPop = { g: campFlame.g, t: 0 }; burst(FIRE.x, 0.8, FIRE.z, 10); }
  enShow = -1; enBarW();
  Snd.play('success', { gain: 0.5, f: 'C6' }); Snd.play('sparkle', { gain: 0.4 }, 0.1);
  BM.menu.hidden = true; BM.at = null; bldBadge(); /* the camera stays on Pip: jumping it to the tent or fire and gliding back shook the screen (Leon, 2026-11-28) */
}
/* the energy bar grows with the tent */
function enBarW() { const b = ENB.el && ENB.el.querySelector('.bar'); if (b) b.style.width = Math.min(220, 120 * enMax() / 100) + 'px'; }
function bldBadge() { if (BM.btn) BM.btn.classList.toggle('can', bldKeys().some(bldCan)); if (BM.menu && !BM.menu.hidden) { const key = (BM.keys || bldKeys()).map((k) => bldLv(k) + (bldCan(k) ? 'y' : 'n')).join(); if (key !== BM.key) { BM.key = key; bldFill(); } } }
