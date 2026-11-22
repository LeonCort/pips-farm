/* ---------- buying on the spot: walk up to the house, a landmark's place or an empty corner of a room, and buy it right there ----------
   A little bobbing marker shows where something can be built. When Pip stands close, a round bubble pops up over the spot
   with a picture of the thing and its price; one tap buys it and it is built at once, in front of Pip. The shop still lists everything. */
const SPOT_ON = true;
const spotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d');
  x.fillStyle = 'rgba(34,48,60,0.25)'; x.beginPath(); x.arc(48, 52, 38, 0, 7); x.fill();
  x.fillStyle = '#fffaf0'; x.strokeStyle = '#22303c'; x.lineWidth = 6; x.beginPath(); x.arc(48, 46, 36, 0, 7); x.fill(); x.stroke();
  x.fillStyle = '#f2c14a'; x.beginPath(); x.arc(48, 46, 25, 0, 7); x.fill(); x.lineWidth = 4; x.stroke();
  x.strokeStyle = '#22303c'; x.lineWidth = 8; x.lineCap = 'round'; x.beginPath(); x.moveTo(48, 32); x.lineTo(48, 60); x.moveTo(34, 46); x.lineTo(62, 46); x.stroke();
  const t = new T.CanvasTexture(c); return t; })();
const spotMat = new T.SpriteMaterial({ map: spotTex, transparent: true, depthWrite: false });
const SPOT_MK = [];
const spotMarker = (i) => { while (SPOT_MK.length <= i) { const s = new T.Sprite(spotMat); s.scale.set(0.62, 0.62, 1); s.renderOrder = 5; s.visible = false; sc.add(s); SPOT_MK.push(s); } return SPOT_MK[i]; };
/* the bubble */
{ const st = document.createElement('style'); st.textContent = `
.spBuy { position: fixed; left: 0; top: 0; width: 104px; height: 128px; margin: -128px 0 0 -52px; padding: 0; border: 0; background: none; z-index: 7; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.spBuy[hidden] { display: none; }
.spBuy .d { position: absolute; left: 4px; top: 0; width: 96px; height: 96px; border-radius: 50%; background: #fffaf0; border: 4px solid #22303c; box-shadow: 0 5px 0 rgba(34,48,60,0.3), inset 0 0 0 5px #f2c14a; box-sizing: border-box; display: grid; place-items: center; }
.spBuy .d img { width: 74px; height: 74px; display: block; }
.spBuy .p { position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); display: flex; align-items: center; gap: 4px; padding: 3px 10px 3px 5px; border-radius: 99px; background: #3f7d62; border: 3px solid #22303c; color: #fffaf0; font: 800 20px/1 system-ui, sans-serif; white-space: nowrap; box-shadow: 0 3px 0 rgba(34,48,60,0.3); }
.spBuy .p svg { width: 22px; height: 22px; }
.spBuy .up { position: absolute; right: -4px; top: -6px; width: 34px; height: 34px; border-radius: 50%; background: #e9684a; border: 3px solid #22303c; box-sizing: border-box; display: grid; place-items: center; }
.spBuy .up svg { width: 20px; height: 20px; }
.spBuy.poor .p { background: #b8aa98; } .spBuy.poor .d img { opacity: 0.75; }
.spBuy.lock .p { background: #fffaf0; color: #22303c; padding: 3px 8px; } .spBuy.lock .d img { opacity: 0.45; filter: grayscale(0.6); }
.spBuy.lock .p svg { width: 24px; height: 24px; }
.spBuy.in .d { animation: spIn 0.35s cubic-bezier(.2,1.6,.4,1); } .spBuy:not(.poor):not(.lock) .d { animation: spIn 0.35s cubic-bezier(.2,1.6,.4,1), spBob 1.4s ease-in-out 0.35s infinite; }
.spBuy.no { animation: spNo 0.35s; }
@keyframes spIn { from { transform: scale(0.2); } } @keyframes spBob { 50% { transform: translateY(-5px) scale(1.04); } }
@keyframes spNo { 25% { transform: translateX(-8px); } 50% { transform: translateX(7px); } 75% { transform: translateX(-4px); } }
@media (prefers-reduced-motion: reduce) { .spBuy .d { animation: none !important; } }
`; document.head.appendChild(st); }
const spBtn = document.createElement('button'); spBtn.type = 'button'; spBtn.className = 'spBuy'; spBtn.hidden = true; spBtn.setAttribute('aria-label', 'Köp');
spBtn.innerHTML = '<div class="d"><img alt=""></div><div class="p"></div>';
document.body.appendChild(spBtn);
const UP_ICO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 L20 13 H15 V20 H9 V13 H4 Z" fill="#fffaf0" stroke="#22303c" stroke-width="2.5" stroke-linejoin="round"/></svg>';
const BRUSH_ICO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3 L21 10 L13 18 L6 11 Z" fill="#f2c14a" stroke="#22303c" stroke-width="2" stroke-linejoin="round"/><path d="M6 11 Q2 14 3 21 Q10 22 13 18" fill="#e9684a" stroke="#22303c" stroke-width="2" stroke-linejoin="round"/></svg>';
let spCur = null, spKey = '';
['pointerdown', 'touchstart'].forEach((ev) => spBtn.addEventListener(ev, (e) => { e.stopPropagation(); }, { passive: true }));
spBtn.addEventListener('click', (e) => {
  e.stopPropagation(); Snd.init(); const o = spCur; if (!o) return;
  const nope = () => { spBtn.classList.remove('no'); void spBtn.offsetWidth; spBtn.classList.add('no'); };
  if (o.lock) { Snd.play('tock', { gain: 0.3, f: 300 }); return nope(); }
  if (o.brush) { isleRestyle(o.act.kind, o.act.st); Snd.play('swish', { gain: 0.4 }); Snd.play('sparkle', { gain: 0.35 }, 0.1); confetti(o.x, 1.2, o.z, 24, 2); save(); spKey = ''; return; }
  if (!catBuy(o.act)) return nope();
  target.copy(pip.position); spKey = ''; spCur = null; spBtn.hidden = true;
});
/* everything that can be bought where Pip is now: [world x, y, z, distance from Pip, offer] */
function spotOffers() {
  const S = stS(), C = catS(), out = [], px = pip.position.x, pz = pip.position.z;
  if (!S || BUILD) return out;
  const home = inHouse && !inBarn && !inStore;
  if (!inHouse) {
    /* the house grows from the ring beside its door now (housering.js), not from a bubble */
    /* landmarks round the island: a whole set at a time; by things already built, a new look */
    ILOTS.forEach((l) => { let d = 1e9, at = l.at[0];
      l.at.forEach((g) => { const dd = g.length === 3 ? Math.hypot(px - g[0], pz - g[1]) - g[2] : Math.max(Math.abs(px - g[0]) - g[2], Math.abs(pz - g[1]) - g[3]); if (dd < d) { d = dd; at = g; } });
      const y = l.id === 'bunting' ? 3.0 : l.id === 'mill' ? 3.4 : l.id === 'light' ? 3.6 : 1.7;
      if (!isleOwn(l)) { const t = l.set, open = t.tier <= S.size;
        out.push({ x: at[0], y, z: at[1], d, key: 'i' + t.id, mark: open, lock: !open, act: { k: 'isle', id: t.id }, cost: t.cost, pic: () => setThumb(t) }); return; }
      if (!l.kind || !l.shown) return;
      const have = stylesOf(), cur = styOf(l.kind);
      if (have.length > 1) { const nx = have[(have.indexOf(cur) + 1) % have.length];
        out.push({ x: at[0], y: 1.9, z: at[1], d: d + 0.3, key: 's' + l.kind + nx, brush: true, act: { k: 'sty', kind: l.kind, st: nx }, cost: 0, pic: () => styThumb(l.kind, nx) }); return; }
      const p = IPACKS.find((q) => !isleX().pk[q.id]); if (!p || !packOpen(p)) return;
      out.push({ x: at[0], y: 1.9, z: at[1], d: d + 0.3, key: 'p' + p.id, up: true, act: { k: 'isle', id: p.id }, cost: p.cost, pic: () => packThumb(p) }); });
  } else if (home && !isTent()) {
    /* pieces for the rooms: the first one for an empty spot, then the next, better one */
    CROOMS.forEach((r) => { if (!roomOpen(r)) return; r.sp.forEach((s) => { if (S.pend.includes('c:' + s.id)) return; const own = C.own[s.id] || {}; let t = 0; while (t < 4 && own[t]) t++; if (t >= 4) return;
      const st = typeState(s, t); if (st !== 'buy' && st !== 'star') return; const ring = spotRing(s), wx = HX(s.x), wz = HZ(s.z);
      out.push({ x: wx, y: s.fam === 'lamp' ? 2.1 : 1.5, z: wz, d: Math.min(Math.hypot(px - wx, pz - wz) - 0.6, Math.hypot(px - HX(ring[0]), pz - HZ(ring[1]))), key: 'c' + s.id + t, up: t > 0, mark: !own[0] && st === 'buy', lock: st !== 'buy', star: st === 'star' ? NEED_STARS[t] : 0,
        act: { k: 'type', s: s.id, t }, cost: typeCost(s, t), pic: () => catThumb(s.fam, t, 0) }); }); });
  }
  return out;
}
const spV = new T.Vector3();
function spotStep() {
  if (!SPOT_ON || !stS() || !catReady || !isleReady) return;
  const list = (CV && CV.open) || (typeof ED !== 'undefined' && ED.on) ? [] : spotOffers();
  /* markers where something can be built */
  let k = 0;
  list.forEach((o) => { if (!o.mark || o.d > 16 || o.d < 1.4) return; const m = spotMarker(k++); m.visible = true; m.position.set(o.x, o.y + (reduced ? 0 : Math.sin(time * 2.6 + o.x) * 0.12), o.z); });
  for (; k < SPOT_MK.length; k++) SPOT_MK[k].visible = false;
  /* the bubble over the closest one Pip stands by */
  let best = null; list.forEach((o) => { if (o.d < (o.lock ? 0.7 : 1.4) && (!best || (best.lock && !o.lock) || (!!best.lock === !!o.lock && o.d < best.d))) best = o; });
  if (!best) { if (!spBtn.hidden) spBtn.hidden = true; spCur = null; spKey = ''; return; }
  spCur = best; const poor = !best.lock && !best.brush && shop().coins < best.cost, key = best.key + (poor ? 'p' : '') + (best.lock ? 'l' : '');
  if (key !== spKey) {
    const fresh = !spKey; spKey = key; spBtn.querySelector('img').src = best.pic();
    spBtn.querySelector('.p').innerHTML = best.brush ? BRUSH_ICO : best.lock ? ICO.lock + (best.star ? ICO.star + best.star : ICO.house) : ICO.coin + best.cost;
    spBtn.classList.toggle('poor', poor); spBtn.classList.toggle('lock', !!best.lock);
    const up = spBtn.querySelector('.up'); if (best.up && !up) spBtn.insertAdjacentHTML('beforeend', '<span class="up">' + UP_ICO + '</span>'); if (!best.up && up) up.remove();
    if (fresh) { spBtn.classList.remove('in'); void spBtn.offsetWidth; spBtn.classList.add('in'); Snd.play('pop', { gain: 0.3, f: 760 }); }
    spBtn.hidden = false;
  }
  spV.set(best.x, best.y - (typeof curveDrop === 'function' ? curveDrop(best.x, best.z) : 0), best.z).project(cam);
  const r = wrap.getBoundingClientRect(); let sx = (spV.x + 1) / 2 * r.width + r.left, sy = (1 - spV.y) / 2 * r.height + r.top;
  sx = Math.max(r.left + 60, Math.min(r.right - 60, sx)); sy = Math.max(r.top + 210, Math.min(r.bottom - 20, sy));
  spBtn.style.transform = `translate(${sx.toFixed(0)}px,${sy.toFixed(0)}px)`;
}
{ const s0 = storeStep; storeStep = function (dt) { s0(dt); spotStep(); }; }
if (window.__farmTest) window.__spot = () => ({ cur: spCur && { key: spCur.key, cost: spCur.cost, lock: !!spCur.lock, d: +spCur.d.toFixed(2) }, marks: SPOT_MK.filter((m) => m.visible).length, tap: () => spBtn.click(), door: [HDOOR.x, HDOOR.z], pos: () => [pip.position.x, pip.position.z].map((v) => +v.toFixed(2)), offers: () => spotOffers().map((o) => o.key + ':' + o.d.toFixed(1)).join(' ') });
