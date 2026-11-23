/* ---------- the build menu (Leon's idea list, 2026-11-23): make the camp better ----------
   A hammer button opens two picture cards: the tent (a bigger tent, then a little hut: more energy) and the campfire
   (benches, then a cooking pot: energy comes back faster). Each card shows the next look, what it does, and what it
   costs; the hammer on the card goes green when the counters hold enough. Paid from the counters, like the signs. */
const BLD = {
  tent: { max: 3, cost: [null, null, { log: 12, berry: 5 }, { log: 20, stone: 10, hay: 6 }], pic: [null, 'tent', 'tent', 'hut'] },
  fire: { max: 3, cost: [null, null, { log: 6, stone: 4 }, { log: 10, stone: 10, clay: 4 }], pic: [null, 'fire', 'fire', 'fire'] }
};
const bldLv = (k) => (state.isle && state.isle.bld && state.isle.bld[k]) || 1;
const enMax = () => [0, 100, 130, 160][bldLv('tent')];
const enRegen = () => [0, 0.2, 0.33, 0.5][bldLv('fire')];
const bldCan = (k) => { const c = BLD[k].cost[bldLv(k) + 1]; return !!c && Object.keys(c).every((t) => storeN(t) >= c[t]); };
let bldPop = null;

/* ---- how the tent and the campfire look at each level ---- */
function tentShape(lv) {
  const t = campFlame.t; while (t.children.length) t.remove(t.children[0]);
  let q;
  if (lv <= 1) {
    q = new T.ConeGeometry(0.85, 1.15, 4); q.rotateY(Math.PI / 4); q.translate(0, 0.575, 0); part(fac(q, (cx, cy, cz, i) => shadeY('#e9684a', cy, 0, 1.2, i, 0.4), 1320), t);
    q = new T.PlaneGeometry(0.42, 0.62); q.translate(0, 0.31, 0.62); part(fac(q, '#7a3a2a', 1321), t, 0, 0, 0, true);
  } else if (lv === 2) {
    /* a bigger striped tent with a flag on top */
    q = new T.ConeGeometry(1.05, 1.45, 8); q.rotateY(Math.PI / 8); q.translate(0, 0.725, 0);
    part(fac(q, (cx, cy, cz, i) => shadeY(Math.floor((Math.atan2(cz, cx) + 3.15) / 0.785) % 2 ? '#e9684a' : '#fff0d8', cy, 0, 1.5, i, 0.4), 1322), t);
    q = new T.PlaneGeometry(0.5, 0.72); q.translate(0, 0.36, 0.9); part(fac(q, '#7a3a2a', 1323), t, 0, 0, 0, true);
    q = new T.CylinderGeometry(0.025, 0.025, 0.5, 5); q.translate(0, 1.6, 0); part(fac(q, PAL.trunk, 1324), t);
    q = new T.BufferGeometry(); q.setAttribute('position', new T.Float32BufferAttribute([0, 1.82, 0, 0.36, 1.74, 0, 0, 1.64, 0], 3)); q.computeVertexNormals(); const fm = new T.Mesh(q, new T.MeshBasicMaterial({ color: '#f2c23c', side: T.DoubleSide })); t.add(fm); t.userData.flag = fm;
  } else {
    /* a little wooden hut: plank walls, a red roof, a lit window and a chimney */
    q = new T.BoxGeometry(1.6, 0.95, 1.3); q.translate(0, 0.475, 0); part(fac(q, (cx, cy, cz, i) => shadeY(Math.floor((cy + 0.02) / 0.19) % 2 ? '#c99158' : '#b9824c', cy, 0, 1, i, 0.4), 1325), t);
    q = new T.CylinderGeometry(1.08, 1.08, 1.6, 3, 1); q.rotateX(-Math.PI / 2); q.translate(0, 1.48, 0); part(fac(q, (cx, cy, cz, i) => shadeY('#b5562f', cy, 0.9, 2.5, i, 0.35), 1326), t);
    q = new T.PlaneGeometry(0.44, 0.7); q.translate(0, 0.35, 0.66); part(fac(q, '#7a3a2a', 1327), t, 0, 0, 0, true);
    q = new T.PlaneGeometry(0.3, 0.28); q.translate(0.5, 0.58, 0.66); const w = new T.Mesh(q, new T.MeshBasicMaterial({ color: '#ffe07a' })); t.add(w);
    q = new T.BoxGeometry(0.22, 0.5, 0.22); q.translate(-0.45, 1.75, -0.25); part(fac(q, '#8b939c', 1328), t);
  }
}
const fireX = new T.Group(); campFlame.g.add(fireX);
function fireShape(lv) {
  while (fireX.children.length) fireX.remove(fireX.children[0]);
  const L = [];
  if (lv >= 2) [[0.95, 0.25, 0.3], [-0.2, 0.95, 1.75]].forEach(([x, z, r], k) => { /* log benches to sit on */
    const q = new T.CylinderGeometry(0.13, 0.13, 0.85, 8); q.rotateZ(Math.PI / 2); q.rotateY(r); q.translate(x, 0.13, z); L.push(fac(q, (cx, cy, cz, i) => tone('#9a6a3e', i, 0.5), 1330 + k)); });
  if (lv >= 3) { /* a tripod with a cooking pot */
    [0, 2.1, 4.2].forEach((a, k) => { const q = new T.CylinderGeometry(0.02, 0.02, 1.0, 4); q.rotateX(0.32); q.rotateY(a); q.translate(Math.sin(a) * 0.16, 0.46, Math.cos(a) * 0.16); L.push(fac(q, PAL.trunk, 1335 + k)); });
    const p = new T.SphereGeometry(0.16, 10, 6, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65); p.translate(0, 0.62, 0); L.push(fac(p, '#4a5560', 1338)); }
  if (L.length) merged(L, MAT, fireX);
  campFlame.f.position.y = lv >= 3 ? 0.24 : 0.3; campFlame.f.userData.s = lv >= 2 ? 1.2 : 1;
}
function bldInit() {
  const I = state.isle; I.bld = I.bld || { tent: 1, fire: 1 };
  tentShape(bldLv('tent')); fireShape(bldLv('fire')); bldBuild(); bldBadge();
}
function bldStep(dt) {
  if (bldPop) { bldPop.t += dt; const u = Math.min(1, bldPop.t / 0.5), s = u < 1 ? 1 + Math.sin(u * Math.PI) * 0.25 - (1 - u) * 0.3 : 1; bldPop.g.scale.setScalar(s); if (u >= 1) bldPop = null; }
  const fl = campFlame.t.userData.flag; if (fl && !reduced) fl.rotation.y = Math.sin(time * 3) * 0.25;
  const s = campFlame.f.userData.s || 1; campFlame.f.scale.x = campFlame.f.scale.z = s;
  /* Pip walks round the tent, not through it */
  if (!enSleep) { const r = [0, 0.7, 0.92, 0.95][bldLv('tent')], dx = pip.position.x + 1.1, dz = pip.position.z - 1.0, d = Math.hypot(dx, dz); if (d < r && d > 1e-4) { pip.position.x = -1.1 + dx / d * r; pip.position.z = 1.0 + dz / d * r; } }
  bldT -= dt; if (bldT <= 0) { bldT = 0.5; bldBadge(); }
}
let bldT = 0;

/* ---- the button and the cards ---- */
const BM = {};
function bldPic(t, sz) { const c = document.createElement('canvas'); c.width = c.height = sz; isleIcon(c.getContext('2d'), t, sz / 2, sz / 2, sz / 64 * 1.25); return c; }
function bldBuild() {
  if (BM.btn) return bldFill();
  const st = document.createElement('style');
  st.textContent = '.bldBtn{position:fixed;top:calc(max(10px,env(safe-area-inset-top,0px)) + 92px);right:max(22px,env(safe-area-inset-right,0px));width:64px;height:64px;border-radius:50%;border:3px solid var(--ink);background:var(--paper);box-shadow:0 5px 0 rgba(34,48,60,.3);padding:6px;z-index:5}'
    + '.bldBtn canvas{width:100%;height:100%;display:block}.bldBtn:active{transform:translateY(3px);box-shadow:0 2px 0 rgba(34,48,60,.3)}.bldBtn i{position:absolute;top:-4px;right:-4px;width:22px;height:22px;border-radius:50%;background:#74a857;border:3px solid var(--ink);display:none}'
    + '.bldBtn.can i{display:block}.bldBtn.can{animation:ready 1.4s ease-in-out infinite}'
    + '.bldMenu{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(34,48,60,.35);z-index:20;padding:16px}.bldMenu[hidden]{display:none}'
    + '.bldMenu .row{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;max-width:100%}'
    + '.bldCard{background:var(--paper);border:4px solid #6e4426;border-radius:24px;box-shadow:0 6px 0 rgba(34,48,60,.3);padding:12px 14px 14px;display:flex;flex-direction:column;align-items:center;gap:8px;width:220px}'
    + '.bldCard .pic{display:flex;align-items:center;gap:6px}.bldCard .pic canvas{width:110px;height:110px}.bldCard .eff canvas{width:56px;height:56px}'
    + '.bldCard .dots{display:flex;gap:6px}.bldCard .dots b{width:16px;height:16px;border-radius:50%;border:3px solid var(--ink);background:#e6d9bd}.bldCard .dots b.on{background:#f2c23c}'
    + '.bldCard .cost{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}.bldCard .cost span{display:flex;align-items:center;gap:2px;padding:2px 8px 2px 2px;border-radius:999px;border:2px solid var(--ink);font:700 20px Fredoka,sans-serif;background:#fff}'
    + '.bldCard .cost span.ok{color:#3f8a3a}.bldCard .cost img{width:28px;height:28px}'
    + '.bldCard .go{width:100%;height:64px;border-radius:18px;border:3px solid var(--ink);background:#cfc6b4;box-shadow:0 4px 0 rgba(34,48,60,.3);padding:4px;opacity:.6}.bldCard .go canvas{height:100%}'
    + '.bldCard .go.can{background:#74a857;opacity:1;animation:ready 1.4s ease-in-out infinite}.bldCard .go:active{transform:translateY(3px)}.bldCard .done{font-size:44px;line-height:64px}'
    + '.bldMenu{flex-direction:column;gap:16px}.bldMenu .x{width:64px;height:64px;border-radius:50%;border:3px solid var(--ink);background:var(--paper);font:700 34px Fredoka,sans-serif}'
    + '.bldCard.shake{animation:invWig .32s ease-out}@media (prefers-reduced-motion: reduce){.bldBtn.can,.bldCard .go.can{animation:none}}';
  document.head.appendChild(st);
  const b = document.createElement('button'); b.type = 'button'; b.className = 'bldBtn'; b.setAttribute('aria-label', 'Bygg'); b.appendChild(bldPic('hammer', 96)); b.appendChild(document.createElement('i')); document.body.appendChild(b); BM.btn = b;
  const m = document.createElement('div'); m.className = 'bldMenu'; m.hidden = true; m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', 'Bygg');
  const row = document.createElement('div'); row.className = 'row'; m.appendChild(row); BM.row = row;
  const x = document.createElement('button'); x.type = 'button'; x.className = 'x'; x.setAttribute('aria-label', 'Stäng'); x.textContent = '✕'; m.appendChild(x);
  document.body.appendChild(m); BM.menu = m;
  const close = () => { m.hidden = true; Snd.play('tock', { gain: 0.25, f: 380 }); };
  b.addEventListener('click', (e) => { e.stopPropagation(); Snd.init(); bldFill(); m.hidden = false; Snd.play('pop', { gain: 0.3, f: 520 }); });
  x.addEventListener('click', (e) => { e.stopPropagation(); close(); });
  m.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (e.target === m) close(); });
  bldFill();
}
const bldImg = {};
function bldIco(t) { if (!bldImg[t]) bldImg[t] = bldPic(t, 64).toDataURL(); const i = document.createElement('img'); i.alt = ''; i.src = bldImg[t]; return i; }
/* what an upgrade does, as a picture: a longer energy bar (tent), faster energy (fire) */
function bldEff(k, lv) {
  const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d');
  isleIcon(x, 'bolt', 30, 48, 1.1);
  x.lineWidth = 4; x.strokeStyle = PAL.ink;
  if (k === 'tent') { for (let q = 0; q < 3; q++) { x.beginPath(); x.roundRect(54, 70 - q * 22, 32, 16, 5); x.fillStyle = q < lv ? '#7cc85a' : '#e6d9bd'; x.fill(); x.stroke(); } }
  else { for (let q = 0; q < 3; q++) { x.beginPath(); x.moveTo(54 + q * 12, 30); x.lineTo(66 + q * 12, 48); x.lineTo(54 + q * 12, 66); x.strokeStyle = q < lv ? '#f2a13c' : '#d8cdb5'; x.lineWidth = 7; x.stroke(); } }
  return c;
}
function bldFill() {
  const row = BM.row; if (!row) return; row.textContent = '';
  ['tent', 'fire'].forEach((k) => {
    const B = BLD[k], lv = bldLv(k), next = Math.min(B.max, lv + 1), c = B.cost[lv + 1];
    const card = document.createElement('div'); card.className = 'bldCard'; BM[k] = card;
    const pic = document.createElement('div'); pic.className = 'pic'; pic.appendChild(bldPic(B.pic[next], 128)); const eff = document.createElement('div'); eff.className = 'eff'; eff.appendChild(bldEff(k, next)); pic.appendChild(eff); card.appendChild(pic);
    const dots = document.createElement('div'); dots.className = 'dots'; for (let q = 1; q <= B.max; q++) { const d = document.createElement('b'); if (q <= lv) d.className = 'on'; dots.appendChild(d); } card.appendChild(dots);
    if (c) {
      const cost = document.createElement('div'); cost.className = 'cost'; Object.keys(c).forEach((t) => { const s = document.createElement('span'); if (storeN(t) >= c[t]) s.className = 'ok'; s.appendChild(bldIco(t)); s.appendChild(document.createTextNode(String(c[t]))); cost.appendChild(s); }); card.appendChild(cost);
      const go = document.createElement('button'); go.type = 'button'; go.className = 'go' + (bldCan(k) ? ' can' : ''); go.setAttribute('aria-label', 'Bygg'); go.appendChild(bldPic('hammer', 96));
      go.addEventListener('click', (e) => { e.stopPropagation(); bldUp(k); }); card.appendChild(go);
    } else { const d = document.createElement('div'); d.className = 'done'; d.textContent = '⭐'; card.appendChild(d); }
    row.appendChild(card);
  });
}
function bldUp(k) {
  const c = BLD[k].cost[bldLv(k) + 1]; if (!c) return;
  if (!bldCan(k)) { const card = BM[k]; card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); Snd.play('blip', { gain: 0.2, f: 260 }); return; }
  Object.keys(c).forEach((t) => { state.isle.store[t] -= c[t]; });
  state.isle.bld[k] = bldLv(k) + 1; save();
  if (k === 'tent') { tentShape(bldLv('tent')); bldPop = { g: campFlame.t, t: 0 }; burst(-1.1, 1.2, 1.0, 10); state.isle.en = Math.min(enMax(), state.isle.en + 30); }
  else { fireShape(bldLv('fire')); bldPop = { g: campFlame.g, t: 0 }; burst(1.4, 0.8, 1.2, 10); }
  enShow = -1; enBarW();
  Snd.play('success', { gain: 0.5, f: 'C6' }); Snd.play('sparkle', { gain: 0.4 }, 0.1);
  BM.menu.hidden = true; bldBadge(); camFocus.set(k === 'tent' ? -1.1 : 1.4, 0, k === 'tent' ? 1.0 : 1.2);
}
/* the energy bar grows with the tent */
function enBarW() { const b = ENB.el && ENB.el.querySelector('.bar'); if (b) b.style.width = (120 * enMax() / 100) + 'px'; }
function bldBadge() { if (BM.btn) BM.btn.classList.toggle('can', bldCan('tent') || bldCan('fire')); if (BM.menu && !BM.menu.hidden) { const key = ['tent', 'fire'].map((k) => bldLv(k) + (bldCan(k) ? 'y' : 'n')).join(); if (key !== BM.key) { BM.key = key; bldFill(); } } }
