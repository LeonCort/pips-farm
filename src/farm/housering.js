/* ---------- the house rings: beside the house door, two rings on the ground ----------
   The grow ring shows the next, bigger house. Standing on it, coins pour in and a green band fills round the ring; when it
   is full the house is built up right there, with scaffolding and a falling roof. No number, no button: the same as every
   other pad in the game. The paint ring (a cog with paint) opens a tray of little houses in every wall and roof colour;
   tapping one you own paints the house, tapping a new one buys it (it shows a coin, and glows when there's enough). */
const HRING = { x: HDOOR.x + 1.2, z: HDOOR.z + 1.0, w: 0, tick: 0, key: '', img: null, o: null };
const PRING = { x: HDOOR.x - 1.3, z: HDOOR.z + 1.0, on: false, key: '' };
const hrCv = document.createElement('canvas'); hrCv.width = hrCv.height = 256;
const hrMesh = (() => { const g = new T.Group(); g.position.set(HRING.x, 0.05, HRING.z); const m = new T.Mesh(new T.CircleGeometry(0.72, 40), new T.MeshBasicMaterial({ map: new T.CanvasTexture(hrCv), transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; g.add(m); const e = flPadEdge(); e.scale.setScalar(0.85); g.add(e); g.visible = false; sc.add(g); g.userData.disc = m; return g; })();
function hrDraw(o) {
  const S = stS(), paid = S.paid[o.id] || 0, f = Math.min(1, paid / o.cost), can = purse(o) >= o.cost - paid, key = o.id + ':' + Math.round(f * 60) + ':' + can + ':' + !!HRING.img;
  if (key === HRING.key) return; HRING.key = key;
  const x = hrCv.getContext('2d'); x.clearRect(0, 0, 256, 256);
  x.fillStyle = can ? 'rgba(236,250,226,0.96)' : 'rgba(255,246,228,0.92)'; x.beginPath(); x.arc(128, 128, 120, 0, 7); x.fill();
  x.lineWidth = 18; x.strokeStyle = 'rgba(120,100,70,0.25)'; x.beginPath(); x.arc(128, 128, 104, 0, 7); x.stroke();
  if (f > 0) { x.strokeStyle = '#3f7d62'; x.lineCap = 'round'; x.beginPath(); x.arc(128, 128, 104, -Math.PI / 2, -Math.PI / 2 + 6.2832 * f); x.stroke(); }
  if (can && f === 0) { x.strokeStyle = '#3f7d62'; x.lineWidth = 8; x.beginPath(); x.arc(128, 128, 116, 0, 7); x.stroke(); }
  if (HRING.img) x.drawImage(HRING.img, 38, 34, 180, 180);
  hrMesh.userData.disc.material.map.needsUpdate = true;
}
function houseOffer() {
  const S = stS(); if (!S || inHouse || BUILD || S.pend.some((p) => p.startsWith('size'))) return null;
  if (typeof tutOn === 'function' && tutOn() && tutId() !== 'house') return null;
  const o = offerOf({ kind: 'size', i: 0 }); return o && o.cost ? o : null;
}
function houseRingStep(dt) {
  const o = houseOffer(); hrMesh.visible = !!o; HRING.o = o; if (!o) { HRING.w = 0; return; }
  if (HRING.imgId !== o.id) { HRING.imgId = o.id; HRING.img = null; const im = new Image(); im.onload = () => { HRING.img = im; HRING.key = ''; }; im.src = thumbOf('h:' + o.size, o.make); }
  hrMesh.scale.setScalar(1 + (reduced ? 0 : Math.sin(time * 3) * 0.025));
  const S = stS(), left = o.cost - (S.paid[o.id] || 0), free = !riding() && !dressing && !trip && doorT <= 0;
  if (free && stillOn(HRING, dt, 0.7) && purse(o) > 0) {
    hrMesh.scale.setScalar(1.06);
    const amt = Math.min(purse(o), left, Math.max(1, Math.ceil(o.cost * dt / 2.2))); spend(o, amt); S.paid[o.id] = (S.paid[o.id] || 0) + amt;
    HRING.tick -= dt; if (HRING.tick <= 0) { HRING.tick = 0.09; const m = new T.Mesh(coinGeo, MAT); m.position.set(pip.position.x, 1.3, pip.position.z); sc.add(m); fly(m, () => tmpV.set(HRING.x, 0.1, HRING.z), () => sc.remove(m), 0.25); Snd.play('coin', { gain: 0.16 }, 0, 70); }
    if (S.paid[o.id] >= o.cost) { delete S.paid[o.id]; S.size = o.size; S.pend.push('size' + o.size); confetti(HRING.x, 1.0, HRING.z, 40); keeper.userData.hop = 1; save(); hrMesh.visible = false; return; }
  }
  hrDraw(o);
}
/* ---------- the paint ring and its tray ---------- */
const prCv = document.createElement('canvas'); prCv.width = prCv.height = 256;
{ const x = prCv.getContext('2d'); x.fillStyle = 'rgba(255,246,228,0.94)'; x.beginPath(); x.arc(128, 128, 120, 0, 7); x.fill(); x.lineWidth = 10; x.strokeStyle = '#e0a646'; x.stroke();
  /* a cog */
  x.save(); x.translate(118, 132); x.fillStyle = '#8a95a3'; x.strokeStyle = PAL.ink; x.lineWidth = 6; x.beginPath();
  for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8, r = k % 2 ? 50 : 66; x.lineTo(Math.cos(a - 0.12) * r, Math.sin(a - 0.12) * r); x.lineTo(Math.cos(a + 0.12) * r, Math.sin(a + 0.12) * r); }
  x.closePath(); x.fill(); x.stroke(); x.fillStyle = '#fff6e4'; x.beginPath(); x.arc(0, 0, 22, 0, 7); x.fill(); x.stroke(); x.restore();
  /* paint drops in house colours */
  [['#e9684a', 172, 70], ['#5a7fb0', 196, 112], ['#74a857', 184, 156]].forEach(([c, a, b]) => { x.fillStyle = c; x.strokeStyle = PAL.ink; x.lineWidth = 4; x.beginPath(); x.moveTo(a, b - 20); x.quadraticCurveTo(a + 16, b + 2, a, b + 14); x.quadraticCurveTo(a - 16, b + 2, a, b - 20); x.fill(); x.stroke(); }); }
const prMesh = (() => { const g = new T.Group(); g.position.set(PRING.x, 0.05, PRING.z); const m = new T.Mesh(new T.CircleGeometry(0.62, 40), new T.MeshBasicMaterial({ map: new T.CanvasTexture(prCv), transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; g.add(m); g.visible = false; sc.add(g); return g; })();
const paintEl = document.createElement('div'); paintEl.className = 'catTray paintTray'; paintEl.hidden = true; document.body.appendChild(paintEl);
['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'wheel'].forEach((ev) => paintEl.addEventListener(ev, (e) => e.stopPropagation(), { passive: true }));
{ const st = document.createElement('style'); st.textContent = `.paintTray .tp{position:relative}.paintTray .tp.buy{border-style:dashed;opacity:.6}.paintTray .tp.buy.ok{opacity:1;border-style:solid;box-shadow:0 0 0 4px #ffe28a}.paintTray .tp.buy svg{position:absolute;right:-9px;top:-9px;width:28px;height:28px}`; document.head.appendChild(st); }
function paintRender() {
  if (!PRING.on) { paintEl.hidden = true; return; }
  const P = catS().paint, coins = shop().coins;
  const row = (w) => (w ? WALLC : ROOFC).map((c, k) => { const own = (w ? P.ow : P.or).includes(k), cur = (w ? P.w : P.r) === k, cost = PAINT_COST[w ? 'w' : 'r'];
    const img = thumbOf('paint' + (w ? 'w' : 'r') + k + ':' + (w ? P.r : P.w), () => paintModel(w ? k : P.w, w ? P.r : k));
    return own ? `<button type="button" class="tp${cur ? ' on' : ''}" data-w="${w}" data-c="${k}" aria-label="Måla"><img src="${img}" alt=""></button>`
      : `<button type="button" class="tp buy${coins >= cost ? ' ok' : ''}" data-w="${w}" data-c="${k}" data-buy="1" aria-label="Köp färg"><img src="${img}" alt="">${ICO.coin}</button>`; }).join('');
  paintEl.innerHTML = `<div class="row">${row(1)}</div><div class="row">${row(0)}</div>`; paintEl.hidden = false;
}
paintEl.addEventListener('click', (ev) => {
  ev.stopPropagation(); Snd.init(); const b = ev.target.closest('button'); if (!b) return; const w = +b.dataset.w, c = +b.dataset.c, P = catS().paint;
  if (b.dataset.buy) { if (!catBuy({ k: 'paint', w: !!w, c })) { b.classList.remove('no'); void b.offsetWidth; } paintRender(); return; }
  if ((w ? P.w : P.r) === c) return; if (w) P.w = c; else P.r = c; paintHouse(false); save(); paintRender();
});
function paintRingStep(dt) {
  const S = stS(), show = !!S && !inHouse && S.size >= 1 && !isTent() && !(typeof tutOn === 'function' && tutOn()); prMesh.visible = show;
  const on = show && Math.hypot(pip.position.x - PRING.x, pip.position.z - PRING.z) < 0.6;
  if (show) prMesh.scale.setScalar(on ? 1.06 : 1 + (reduced ? 0 : Math.sin(time * 3 + 1) * 0.025));
  const key = on ? JSON.stringify(catS().paint) + ':' + shop().coins : '';
  if (on !== PRING.on) { PRING.on = on; if (on) Snd.play('pop', { gain: 0.3, f: 820 }); PRING.key = null; }
  if (key !== PRING.key) { PRING.key = key; paintRender(); }
}
{ const s0 = storeStep; storeStep = function (dt) { s0(dt); if (stS() && catReady) { houseRingStep(dt); paintRingStep(dt); } }; }
if (window.__farmTest) window.__hring = () => ({ h: [HRING.x, HRING.z], p: [PRING.x, PRING.z], o: HRING.o && HRING.o.id, vis: hrMesh.visible, pvis: prMesh.visible, tray: !paintEl.hidden });
/* the arrow: once the next house is paid for in full, it points to its ring */
{ const g0 = storeGoal; storeGoal = function () { const o = HRING.o; if (o && !inHouse && !inStore && !pendOut().length && !carriesGoods() && purse(o) >= o.cost - (stS().paid[o.id] || 0)) return [HRING.x, HRING.z]; return g0(); }; }
