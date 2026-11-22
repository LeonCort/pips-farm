/* ---------- buy mode: a shop button lifts the camera over one part of the island and shows what can be bought there ----------
   Three views: the top (north: the house, barn, meadow, store), the middle (the square, the farmyard, the market street) and
   the bottom (south: the pig pen, the pond, the bull, the bakery). The next thing in each queue shows in colour with its price;
   the things after it show as dark silhouettes, so a child can see what is coming. One tap on a coloured one buys it right there.
   Out in normal play the floating "+" markers are gone; the ground pads and the store still work as before. */
var buyOn = false;
const BM = { pan: 0, p: 62 * Math.PI / 180, sel: null, prev: null, pt: 0, k: 0, area: 1, cx: 2, cz: 0, D: 40, els: [], key: '', t: 0, fogN: 0, fogF: 0 };
const BM_AREAS = [
  { id: 'top', x0: -17, x1: 21, z0: -12.5, z1: -3.6, cz: -7.2 },
  { id: 'mid', x0: -17, x1: 23, z0: -3.6, z1: 4.6, cz: 0.6 },
  { id: 'bot', x0: -17, x1: 21, z0: 4.6, z1: 13, cz: 7.4 }
];
const bmAreaOf = (z) => z < BM_AREAS[0].z1 ? 0 : z < BM_AREAS[1].z1 ? 1 : 2;
const BM_PITCH = 62 * Math.PI / 180;
/* the pictures */
const BM_PIC = {};
function bmIcon(key, draw) { if (BM_PIC[key]) return BM_PIC[key]; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); draw(x); return (BM_PIC[key] = c.toDataURL()); }
function bmPadPic(p) { return bmIcon('p:' + p.id, (x) => {
  if (p.kind === 'animal') drawIcon(x, p.a, 64, 66, 1.35);
  else if (p.kind === 'tractor') drawIcon(x, 'tractor', 64, 66, 1.25);
  else if (p.kind === 'house') { drawIcon(x, 'house', 56, 64, 1.3); drawIcon(x, p.a, 98, 90, 0.62); }
  else if (p.kind === 'source') drawIcon(x, p.t, 64, 64, 1.35);
  else if (p.kind === 'helper') { drawIcon(x, 'robot', 56, 62, 1.2); drawIcon(x, p.t, 98, 90, 0.7); } }); }
function bmBPadPic(p) { return bmIcon('b:' + p.id, (x) => { if (p.kind === 'goat') drawIcon(x, 'goat', 64, 66, 1.35); else { drawIcon(x, 'barn', 60, 64, 1.25); drawIcon(x, 'stall', 98, 92, 0.6); } }); }
function bmSPadPic(p) { return bmIcon('s:' + p.id, (x) => {
  const icon = { tree: 'apple', bakery: 'cake', helper: 'robot', cashier: 'coin', sign: 'guest', stall: p.t, stock: 'robot', seller: 'guest' }[p.kind];
  drawIcon(x, icon, 64, 64, 1.3);
  if (p.kind === 'stock' || p.kind === 'seller') drawIcon(x, p.t, 100, 92, 0.66);
  if (p.kind === 'stall') { x.fillStyle = STALL_COL[p.t]; x.strokeStyle = PAL.ink; x.lineWidth = 4; x.fillRect(22, 14, 84, 14); x.strokeRect(22, 14, 84, 14); } }); }
/* every thing on the queues, where it stands and how it is bought */
function bmItem(tr, id, cost) { const it = bmItem0(tr, id, cost); if (it) it.model = () => bmModel(id, it); return it; }
function bmItem0(tr, id, cost) {
  const S = stS();
  const p = PADS.find((q) => q.id === id); if (p) { const at = padPos(p); return { id, tr, az: p.a ? PEN[p.a].z : p.t ? SRC[p.t].z : at[1], x: at[0], z: at[1], pic: () => bmPadPic(p), left: () => cost - ((state.paid || {})[id] || 0), buy: () => { state.coins -= cost - ((state.paid || {})[id] || 0); unlock(p); return [at[0], at[1]]; } }; }
  const b = BPADS.find((q) => q.id === id); if (b) return { id, tr, x: BARN.x + (b.kind === 'goat' ? 1.6 : -1.6), z: BARN.z + 1.2, pic: () => bmBPadPic(b), left: () => cost - (barnS().paid[id] || 0), buy: () => { state.coins -= cost - (barnS().paid[id] || 0); buyBPad(b); return [BDOOR.x, BDOOR.z]; } };
  if (id.startsWith('gear:')) { const m = id.slice(5).match(/^([a-z]+)(\d+)$/), g = m[1], lv = +m[2], k = GEAR.indexOf(g);
    return { id, tr, x: STORE.x - 1.6 + k * 1.05, z: STORE.z + 0.6, az: STORE.z, pic: () => thumbOf('g:' + g + lv, () => gearModel(g, lv)), left: () => cost,
      buy: () => { const s = { kind: 'gear', i: GEAR.indexOf(g), x: STORE.x, z: STORE.z }, o = offerOf(s); if (!o || !o.gear) return null; spend(o, o.cost - (S.paid[o.id] || 0)); storeBuy(s, o); return [STORE.x, STORE.z]; } }; }
  const sp = SPADS.find((q) => q.id === id); if (sp) { const at = sPadPos(sp); return { id, tr, az: sp.t ? STL[sp.t].z : sp.kind === 'bakery' ? BAKE.z : at[1], x: at[0], z: at[1], pic: () => bmSPadPic(sp), left: () => cost - (shop().paid[id] || 0), buy: () => { shop().coins -= cost - (shop().paid[id] || 0); sUnlock(sp); return [at[0], at[1]]; } }; }
  if (Q_SIZE[id]) { const n = Q_SIZE[id]; return { id, tr, x: HOUSE.x + 0.01 * n, z: HOUSE.z, pic: () => thumbOf('h:' + n, () => miniHouse(n - 1, n)), left: () => cost - (S.paid['h:' + n] || 0), buy: () => catBuy({ k: 'size', n }) ? [HOUSE.x, HOUSE.z] : null }; }
  if (Q_ISLE[id]) { const k = Q_ISLE[id], t = ISET_BY[k], pk = !t && IPACKS.find((q) => q.id === k); if (!t && !pk) return null;
    const c = t ? ISLE_BY[t.lots.includes('fountain') ? 'fountain' : t.lots[0]].c : [-2.35 + (pk.sty - 1) * 1.2, 2.6];
    return { id, tr, x: c[0], z: c[1], pic: () => t ? setThumb(t) : packThumb(pk), left: () => cost, open: () => t ? t.tier <= S.size : packOpen(pk), buy: () => catBuy({ k: 'isle', id: k }) ? [c[0], c[1]] : null }; }
  return null;
}
/* what each view shows: the queue heads in colour, the rest as silhouettes (one per spot) */
function bmList() {
  const out = [], S = stS(); if (!S) return out;
  const cottage = S.size < 1 && SIZES[1] ? { id: 'house:cottage', tr: 'c', x: HOUSE.x, z: HOUSE.z, pic: () => thumbOf('h:1', () => miniHouse(0, 1)), left: () => SIZES[1].cost - (S.paid['h:1'] || 0), buy: () => catBuy({ k: 'size', n: 1 }) ? [HOUSE.x, HOUSE.z] : null, head: true } : null;
  if (cottage) { cottage.area = bmAreaOf(cottage.z); cottage.model = () => bmModel('house:cottage', cottage); }
  if (tutOn()) return cottage && tutId() === 'house' ? [cottage] : out;
  if (cottage) out.push(cottage);
  ['h', 'c'].forEach((tr) => { const h = qHead(tr); QUEUE[tr].forEach(([id, cost]) => { if (qOwned(id)) return; const it = bmItem(tr, id, cost); if (!it) return; it.head = id === h; out.push(it); }); });
  /* one per spot: the soonest thing there wins */
  const keep = [];
  out.forEach((it) => { const o = keep.find((q) => Math.hypot(q.x - it.x, q.z - it.z) < 1.7); if (!o) keep.push(it); else if (it.head && !o.head) keep[keep.indexOf(o)] = it; });
  keep.forEach((it) => { it.area = bmAreaOf(it.az != null ? it.az : it.z); });
  return keep;
}
const bmPurse = (it) => it.tr === 'h' ? state.coins : shop().coins;
/* ---------- the screen ---------- */
{ const st = document.createElement('style'); st.textContent = `
.bmBtn { position: fixed; top: max(14px, env(safe-area-inset-top, 0px)); right: calc(max(16px, env(safe-area-inset-right, 0px)) + 258px); width: 68px; height: 68px; border-radius: 50%; padding: 6px; z-index: 9;
  border: 4px solid #fff3dc; background: radial-gradient(circle at 34% 28%, #ffe7a0, #f2c14a 55%, #c98a2c); box-shadow: 0 0 0 3px #4a2e1a, 0 7px 0 3px rgba(60,34,16,0.45), 0 12px 16px rgba(60,34,16,0.25), inset 0 -8px 12px rgba(0,0,0,0.18), inset 0 6px 10px rgba(255,255,255,0.45); touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.bmBtn[hidden] { display: none; }
.bmBtn img { width: 100%; height: 100%; display: block; pointer-events: none; filter: drop-shadow(0 3px 0 rgba(40,24,10,0.35)); }
.bmBtn:active { transform: translateY(4px); }
.bmBtn .dot { display: none; position: absolute; top: -6px; right: -6px; width: 24px; height: 24px; border-radius: 50%; background: #3f7d62; border: 3px solid #22303c; }
.bmBtn.ready .dot { display: block; } .bmBtn.ready { animation: bmBounce 1.2s ease-in-out infinite; }
.bmBtn.on { background: radial-gradient(circle at 34% 28%, #ffb9a4, #e9684a 55%, #a8432a); animation: none; }
.bmBtn.on .dot { display: none; }
@keyframes bmBounce { 0%,100% { transform: translateY(0); } 40% { transform: translateY(-7px) scale(1.06); } 60% { transform: translateY(0) scale(0.98); } }
@media (max-width: 480px) { .bmBtn { width: 60px; height: 60px; right: calc(max(16px, env(safe-area-inset-right, 0px)) + 230px); } }
.bmLay { position: fixed; inset: 0; z-index: 8; touch-action: none; }
.bmLay[hidden] { display: none; }
.bmIt { position: absolute; left: 0; top: 0; padding: 0; border: 0; background: none; touch-action: manipulation; -webkit-tap-highlight-color: transparent; width: 92px; height: 112px; margin: -112px 0 0 -46px; }
.bmIt .d { position: absolute; left: 4px; top: 0; width: 84px; height: 84px; border-radius: 50%; background: #fffaf0; border: 4px solid #22303c; box-sizing: border-box; display: grid; place-items: center; box-shadow: 0 5px 0 rgba(34,48,60,0.3), inset 0 0 0 5px #f2c14a; }
.bmIt .d img { width: 64px; height: 64px; display: block; pointer-events: none; }
.bmIt .p { position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); display: flex; align-items: center; gap: 4px; padding: 3px 10px 3px 5px; border-radius: 99px; background: #3f7d62; border: 3px solid #22303c; color: #fffaf0; font: 800 19px/1 system-ui, sans-serif; white-space: nowrap; box-shadow: 0 3px 0 rgba(34,48,60,0.3); }
.bmIt .p svg { width: 22px; height: 22px; display: block; }
.bmIt.can .d { animation: spIn 0.35s cubic-bezier(.2,1.6,.4,1), spBob 1.4s ease-in-out 0.35s infinite; box-shadow: 0 5px 0 rgba(34,48,60,0.3), inset 0 0 0 5px #7cc36b; }
.bmIt.poor .p { background: #b8aa98; }
.bmIt.head { z-index: 2; }
.bmIt.sil { width: 60px; height: 60px; margin: -60px 0 0 -30px; }
.bmIt.sil .d { left: 0; width: 56px; height: 56px; border-width: 3px; background: rgba(255,250,240,0.75); box-shadow: 0 3px 0 rgba(34,48,60,0.25); }
.bmIt.sil .d img { width: 44px; height: 44px; filter: brightness(0); opacity: 0.42; }
.bmIt.sil .p { display: none; }
.bmIt.no { animation: spNo 0.35s; }
.bmIt.tr-c.head .d { border-color: #22303c; } .bmIt .ring { display: none; }
.bmBar { position: fixed; left: 50%; bottom: max(14px, env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); display: flex; gap: 12px; padding: 10px 12px; border-radius: 30px; background: #fbf3e2; border: 3px solid #22303c; box-shadow: 0 5px 0 rgba(34,48,60,0.28); z-index: 9; }
.bmBar[hidden] { display: none; }
.bmTab { position: relative; width: 78px; height: 60px; border-radius: 18px; border: 3px solid #22303c; background: #fffaf0; padding: 3px; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.bmTab svg { width: 100%; height: 100%; display: block; pointer-events: none; }
.bmTab.on { background: #f2c14a; transform: translateY(-3px); box-shadow: 0 3px 0 rgba(34,48,60,0.3); }
.bmTab .dot { display: none; position: absolute; top: -8px; right: -8px; width: 22px; height: 22px; border-radius: 50%; background: #3f7d62; border: 3px solid #22303c; }
.bmTab.ready .dot { display: block; }
.bmX { width: 60px; height: 60px; border-radius: 50%; border: 3px solid #22303c; background: #e9684a; padding: 12px; touch-action: manipulation; }
.bmX svg { width: 100%; height: 100%; display: block; pointer-events: none; }
body.buyOn .stWish, body.buyOn .spBuy, body.buyOn .tut, body.buyOn .mapBtn, body.buyOn .albumBtn, body.buyOn #menuBtn, body.buyOn .acts, body.buyOn .actBar, body.buyOn #dial, body.buyOn .stick { visibility: hidden !important; }
@media (prefers-reduced-motion: reduce) { .bmIt .d, .bmBtn.ready { animation: none !important; } }
`; document.head.appendChild(st); }
const bmBtn = document.createElement('button'); bmBtn.type = 'button'; bmBtn.className = 'bmBtn'; bmBtn.setAttribute('aria-label', 'Köp nya saker');
bmBtn.innerHTML = '<img alt=""><span class="dot"></span>';
bmBtn.querySelector('img').src = bmIcon('btn', (x) => { x.translate(64, 70); bagIcon(x, 1.55); });
document.body.appendChild(bmBtn);
const bmLay = document.createElement('div'); bmLay.className = 'bmLay'; bmLay.hidden = true; document.body.appendChild(bmLay);
const bmBar = document.createElement('div'); bmBar.className = 'bmBar'; bmBar.hidden = true; document.body.appendChild(bmBar);
/* each tab is a little island with its own band picked out */
const bmTabSvg = (i) => '<svg viewBox="0 0 72 52" aria-hidden="true"><path d="M8 26 Q6 8 26 6 Q46 3 62 10 Q70 20 66 36 Q60 48 38 47 Q12 48 8 26 Z" fill="#9fcf7f" stroke="#22303c" stroke-width="3"/>'
  + '<clipPath id="bmc' + i + '"><path d="M8 26 Q6 8 26 6 Q46 3 62 10 Q70 20 66 36 Q60 48 38 47 Q12 48 8 26 Z"/></clipPath>'
  + '<rect x="0" y="' + [0, 18, 34][i] + '" width="72" height="' + [18, 16, 18][i] + '" fill="#e9684a" opacity="0.85" clip-path="url(#bmc' + i + ')"/>'
  + '<path d="M8 26 Q6 8 26 6 Q46 3 62 10 Q70 20 66 36 Q60 48 38 47 Q12 48 8 26 Z" fill="none" stroke="#22303c" stroke-width="3"/><circle cx="36" cy="26" r="3.5" fill="#fffaf0" stroke="#22303c" stroke-width="2"/></svg>';
const bmTabs = [0, 1, 2].map((i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'bmTab'; b.setAttribute('aria-label', ['Norra delen', 'Mitten', 'Södra delen'][i]); b.innerHTML = bmTabSvg(i) + '<span class="dot"></span>'; bmBar.appendChild(b);
  b.addEventListener('click', (e) => { e.stopPropagation(); Snd.play('pop', { gain: 0.3, f: 620 + i * 80 }); bmArea(i, false, BM.cx); }); return b; });
const bmX = document.createElement('button'); bmX.type = 'button'; bmX.className = 'bmX'; bmX.setAttribute('aria-label', 'Tillbaka');
bmX.innerHTML = '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M7 7 L23 23 M23 7 L7 23" stroke="#fffaf0" stroke-width="5" stroke-linecap="round"/></svg>'; bmBar.appendChild(bmX);
[bmBtn, bmLay, bmBar].forEach((el) => ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup'].forEach((ev) => el.addEventListener(ev, (e) => { e.stopPropagation(); }, { passive: true })));
bmBtn.addEventListener('click', (e) => { e.stopPropagation(); Snd.init(); buyMode(!buyOn); });
bmX.addEventListener('click', (e) => { e.stopPropagation(); buyMode(false); });
/* swipe up or down on the map to go to the next part */
/* on a tall phone screen the view is narrower than the island: drag sideways to look along it */
{ let y0 = null, x0 = 0, p0 = 0; bmLay.addEventListener('pointerdown', (e) => { y0 = e.clientY; x0 = e.clientX; p0 = BM.pan; });
  bmLay.addEventListener('pointermove', (e) => { if (y0 == null) return; const r = wrap.getBoundingClientRect(), vw = bmHalfW() * 2; BM.pan = clamp(p0 - (e.clientX - x0) * vw / r.width, -bmPanMax(), bmPanMax()); });
  bmLay.addEventListener('pointerup', (e) => { if (y0 == null) return; const dy = e.clientY - y0, dx = e.clientX - x0; y0 = null; if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.5) bmArea(clamp(BM.area + (dy > 0 ? -1 : 1), 0, 2), false, BM.cx); });
  bmLay.addEventListener('pointercancel', () => { y0 = null; }); }
/* how much of the island's width shows, and how far the view may slide */
const bmHalfW = () => BM.D * Math.tan(cam.fov * Math.PI / 360) * cam.aspect;
function bmPanMax() { const a = BM_AREAS[BM.area]; return Math.max(0, (a.x1 - a.x0) / 2 + 1.5 - bmHalfW()); }
function buyMode(on) {
  if (on === buyOn) return;
  if (on && (inHouse || trip || dressing || (typeof ED !== 'undefined' && ED.on))) return;
  bmSelect(null, true); buyOn = on; document.body.classList.toggle('buyOn', on); bmBtn.classList.toggle('on', on); bmLay.hidden = !on; bmBar.hidden = !on;
  Snd.play(on ? 'whoosh' : 'swish', { gain: 0.35 });
  if (on) { target.copy(pip.position); if (typeof routeStop === 'function') routeStop();
    const L = bmList(), h = L.find((it) => it.head && bmPurse(it) >= it.left()); bmArea(h ? h.area : bmAreaOf(pip.position.z), true, h ? h.x : pip.position.x); }
  BM.key = '';
}
function bmArea(i, snap, fx) {
  BM.area = i; bmTabs.forEach((b, k) => b.classList.toggle('on', k === i)); BM.key = '';
  const a = BM_AREAS[i]; if (snap) BM.D = bmDist(a); BM.pan = clamp((fx == null ? pip.position.x : fx) - (a.x0 + a.x1) / 2, -bmPanMax(), bmPanMax()); if (snap) { BM.cx = (a.x0 + a.x1) / 2 + BM.pan; BM.cz = a.cz; }
}
function bmDist(a) {
  const t = Math.tan(cam.fov * Math.PI / 360), w = Math.min((a.x1 - a.x0) / 2 + 1.5, cam.aspect < 1 ? 12 : 99), d = (a.z1 - a.z0) / 2 + 2.5;
  return Math.max(w / (t * cam.aspect), d * Math.sin(BM_PITCH) / t * 1.25, 14);
}
function bmTap(el, it) {
  if (!it.head) { Snd.play('tock', { gain: 0.3, f: 300 }); el.classList.remove('no'); void el.offsetWidth; el.classList.add('no'); return; }
  if ((it.open && !it.open()) || bmPurse(it) < it.left()) { Snd.play('tock', { gain: 0.3, f: 300 }); flash(it.tr === 'h' ? $('coins').parentNode || $('coins') : coinPill, 'no'); el.classList.remove('no'); void el.offsetWidth; el.classList.add('no'); return; }
  const at = it.buy(); if (!at) { el.classList.add('no'); return; }
  if (typeof bump === 'function' && it.tr === 'h') bump();
  confetti(at[0], 1.0, at[1], 50); Snd.play('success', { gain: 0.5 }); save(); BM.key = ''; BM.t = 0;
}
const bmV = new T.Vector3(), bmP = new T.Vector3(), bmQ = new T.Quaternion(), bmM = new T.Matrix4(), bmUp = new T.Vector3(0, 1, 0);
function bmRender() {
  const L = bmList().filter((it) => it.area === BM.area), key = L.map((it) => it.id + (it.head ? 'h' + (bmPurse(it) >= it.left() ? 1 : 0) + it.left() : '')).join(',');
  if (key !== BM.key) {
    BM.key = key; bmLay.innerHTML = ''; BM.els = [];
    L.forEach((it) => { const b = document.createElement('button'); b.type = 'button'; const can = it.head && bmPurse(it) >= it.left() && (!it.open || it.open());
      b.className = 'bmIt tr-' + it.tr + (it.head ? ' head' : ' sil') + (it.head ? (can ? ' can' : ' poor') : '');
      b.innerHTML = '<div class="d"><img alt=""></div><div class="p">' + (it.tr === 'h' ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21 C3 14 2 8 6 5 C9 3 11 5 12 7 C13 5 15 3 18 5 C22 8 21 14 12 21 Z" fill="#e9684a" stroke="#3a2e2a" stroke-width="2"/></svg>' : ICO.coin) + fmt(it.left()) + '</div>';
      b.querySelector('img').src = it.pic(); b.setAttribute('aria-label', it.head ? 'Köp' : 'Kommer senare');
      b.addEventListener('click', (e) => { e.stopPropagation(); Snd.init(); bmSelect(it); });
      bmLay.appendChild(b); BM.els.push([b, it]); });
    /* a dot on the tabs that have something to buy now */
    const all = bmList(); bmTabs.forEach((t, k) => t.classList.toggle('ready', all.some((it) => it.area === k && it.head && bmPurse(it) >= it.left() && (!it.open || it.open()))));
  }
  const r = wrap.getBoundingClientRect();
  BM.els.forEach(([b, it]) => { bmV.set(it.x, it.head ? 1.2 : 0.8, it.z).project(cam); const sx = (bmV.x + 1) / 2 * r.width + r.left, sy = (1 - bmV.y) / 2 * r.height + r.top; b.style.transform = 'translate(' + sx.toFixed(0) + 'px,' + sy.toFixed(0) + 'px)'; });
}
/* the shop button bounces when something can be bought */
let bmT = 0;
function bmStep(dt) {
  bmT -= dt; if (bmT > 0) return; bmT = 0.5;
  const tutHide = tutOn() && tutId() !== 'house';
  bmBtn.hidden = tutHide || (!buyOn && (inHouse || !!trip || dressing));
  if (bmBtn.hidden) return;
  const L = bmList(); bmBtn.classList.toggle('ready', !buyOn && L.some((it) => it.head && bmPurse(it) >= it.left() && (!it.open || it.open())));
}
/* called once a frame right before the picture is drawn: eases the camera between Pip and the view from above */
function buyCam(dt) {
  BM.k += ((buyOn ? 1 : 0) - BM.k) * Math.min(1, dt * 4.5); if (!buyOn && BM.k < 0.002) BM.k = 0;
  if (buyOn && (inHouse || trip)) buyMode(false);
  if (!BM.k) return false;
  const a = BM_AREAS[BM.area], f = Math.min(1, dt * 5);
  const fo = BM.sel, tx = fo ? fo.fx : (a.x0 + a.x1) / 2 + BM.pan, tz = fo ? fo.fz : a.cz, tD = fo ? fo.fD : bmDist(a);
  BM.cx += (tx - BM.cx) * f; BM.cz += (tz - BM.cz) * f; BM.D += (tD - BM.D) * f; BM.p += ((fo ? 48 : 62) * Math.PI / 180 - BM.p) * f;
  if (BM.prev) { BM.pt += dt; const q = BM.prev.userData; BM.prev.position.y = q.y0 + (reduced ? 0 : Math.sin(BM.pt * 2.4) * 0.06); if (q.spin) BM.prev.rotation.y += dt * 0.9; if (q.ghost) ghostMat.opacity = 0.32 + (reduced ? 0 : Math.sin(BM.pt * 3) * 0.08); }
  const k = BM.k * BM.k * (3 - 2 * BM.k);
  bmP.set(BM.cx, BM.D * Math.sin(BM.p), BM.cz + BM.D * Math.cos(BM.p));
  bmM.lookAt(bmP, bmV.set(BM.cx, 0, BM.cz), bmUp); bmQ.setFromRotationMatrix(bmM);
  cam.position.lerp(bmP, k); cam.quaternion.slerp(bmQ, k); cam.far = Math.max(cam.far, 300); cam.updateMatrixWorld();
  CURVE.u.strength.value *= 1 - k;
  CURVE.u.horD.value += (1e6 - CURVE.u.horD.value) * k; sc.fog.near += (400 - sc.fog.near) * k; sc.fog.far += (600 - sc.fog.far) * k;
  if (k > 0.3) { arrow.visible = chevG.visible = goalRing.visible = false; if (BM.prev && BM.prev.userData.tent) TENT_OUT.visible = false; }
  if (k > 0.5) { sun.position.set(BM.cx - 10, 10, BM.cz + 7.5); sun.target.position.set(BM.cx, 0, BM.cz); }
  if (buyOn && !BM.sel) bmRender(); if (BM.sel) bmPanel();
  return true;
}
/* out in normal play: no floating "+" markers, and no buy bubbles outdoors (that is what the shop button is for);
   the first house in the first-day tour is still bought by the tent */
{ const s0 = spotOffers; spotOffers = function () { const L = s0(); if (inHouse) return L.map((o) => Object.assign(o, { mark: false }));
  return L.filter((o) => o.brush || (tutOn() && tutId() === 'house' && o.act && o.act.k === 'size')).map((o) => Object.assign(o, { mark: false })); }; }
if (window.__farmTest) window.__buy = { open: (i) => { buyMode(true); if (i != null) bmArea(i, true); }, close: () => buyMode(false), on: () => buyOn, k: () => BM.k,
  list: () => bmList().map((it) => [it.id, it.area, it.head ? 1 : 0, +it.x.toFixed(1), +it.z.toFixed(1)]),
  shown: () => BM.els.map(([b, it]) => it.id + (it.head ? '*' : '')).join(' '),
  dbg: () => { const m = BM.prev; if (!m) return 'none'; let n = 0, v = 0; m.traverse((o) => { if (o.isMesh) { n++; let q = o, vis = true; while (q) { if (!q.visible) vis = false; q = q.parent; } if (vis) v++; } }); const bb = new T.Box3().setFromObject(m); return JSON.stringify({ n, v, min: bb.min, max: bb.max, tent: !!m.userData.tent, sel: BM.sel && [BM.sel.fx, BM.sel.fz, BM.sel.fD], tentVis: TENT_OUT.visible }); },
  sel: (id) => { const it = bmList().find((q) => q.id === id); if (!it) return 'none'; if (!buyOn) buyMode(true); bmArea(it.area, true); bmSelect(it); return BM.prev ? 'model' : 'nomodel'; }, ok: () => { bmOk.click(); return BM.sel ? (BM.sel.done ? 'bought' : 'still') : 'none'; }, back: () => bmSelect(null),
  tap: (id) => { const e = BM.els.find(([b, it]) => it.id === id); if (!e) return 'none'; e[0].click(); return 'ok'; } };
{ const s0 = storeStep; storeStep = function (dt) { s0(dt); bmStep(dt); }; }

/* ---------- the close look: tap a thing on the map, the camera flies down to it and shows it in 3D, with buy and back ---------- */
/* a copy of something that is in the scene but hidden (the house's next part, an island landmark), where it stands */
function bmCopy(o) { const c = o.clone(true); o.updateWorldMatrix(true, true); o.matrixWorld.decompose(c.position, c.quaternion, c.scale); c.visible = true; return c; }
/* run a build function, keep what it added to the scene, and undo everything else it touched */
function bmSandbox(fn, undo) {
  const n0 = sc.children.length, arrs = [SOLIDS, DECO, mProd, leafs, mPiles, helpers, typeof swayers !== 'undefined' && swayers ? swayers.trees : []], L = arrs.map((a) => a.length);
  try { fn(); } catch (e) { console.warn('buy preview', e); }
  const add = sc.children.slice(n0); add.forEach((o) => sc.remove(o)); arrs.forEach((a, i) => { a.length = L[i]; }); if (undo) undo();
  if (!add.length) return null; const g = new T.Group(); add.forEach((o) => g.add(o)); return g;
}
function bmModel(id, it) {
  const p = PADS.find((q) => q.id === id);
  if (p) {
    if (p.kind === 'animal') { const n = animals.filter((o) => o.a === p.a).length + 1, m = animalModel(p.a, n).g; m.position.set(it.x, 0, it.z); m.scale.multiplyScalar(1.15); m.userData.spin = true; return m; }
    if (p.kind === 'house') { const pen = pens[p.a]; if (!pen) return null; const old = pen.house, big = pen.big; setHouse(p.a, true); const g = pen.house; sc.remove(g); pen.house = old; pen.big = big; if (old) sc.add(old); return g; }
    if (p.kind === 'tractor') { const k = tractor; tractor = null; return bmSandbox(addTractor, () => { tractor = k; }); }
    if (p.kind === 'source') return bmSandbox(() => addSource(p.t), () => { delete sources[p.t]; });
    if (p.kind === 'helper') { const g = robot(FOOD_COL[p.t]); g.position.set(SRC[p.t].x + 1.4, 0, SRC[p.t].z + 0.4); g.scale.multiplyScalar(1.3); g.userData.spin = true; return g; }
  }
  const b = BPADS.find((q) => q.id === id);
  if (b && b.kind === 'goat') { const m = animalModel('goat', animals.filter((o) => o.a === 'goat').length + 1).g; m.position.set(it.x, 0, it.z); m.scale.multiplyScalar(1.2); m.userData.spin = true; return m; }
  if (id.startsWith('gear:')) { const m = id.slice(5).match(/^([a-z]+)(\d+)$/), g = gearModel(m[1], +m[2]); g.scale.multiplyScalar(2.4); g.position.set(STORE.x, 0.2, STORE.z + 2.6); g.userData.spin = true; return g; }
  const sp = SPADS.find((q) => q.id === id);
  if (sp) { const len = (a) => a.length;
    if (sp.kind === 'tree') { const n = len(trees); return bmSandbox(() => appleTree(sp.i), () => { delete trees[sp.i]; if (sp.i >= n) trees.length = n; }); }
    if (sp.kind === 'bakery') return bmSandbox(makeBakery, () => { bakery = null; });
    if (sp.kind === 'stall') return bmSandbox(() => addStall(sp.t), () => { const st = stalls[sp.t]; if (st && st.money) { const i = mPiles.indexOf(st.money); if (i >= 0) mPiles.splice(i, 1); } delete stalls[sp.t]; });
    if (sp.kind === 'stock') { if (!stalls[sp.t]) return null; return bmSandbox(() => addStocker(sp.t), () => { stalls[sp.t].stocker = null; }); }
    if (sp.kind === 'seller') { if (!stalls[sp.t]) return null; return bmSandbox(() => addSeller(sp.t), () => { stalls[sp.t].seller = null; }); }
    if (sp.kind === 'helper') { const n = len(mHelpers); return bmSandbox(() => addShopHelper(sp.i), () => { delete mHelpers[sp.i]; if (sp.i >= n) mHelpers.length = n; }); }
    if (sp.kind === 'sign') { const n = len(signsUp); return bmSandbox(() => addSign(sp.i), () => { delete signsUp[sp.i]; if (sp.i >= n) signsUp.length = n; }); }
    if (sp.kind === 'cashier') return bmSandbox(addCashier, () => { cashier = null; });
  }
  if (id === 'house:cottage' || Q_SIZE[id]) { const n = id === 'house:cottage' ? 1 : Q_SIZE[id], h = HOUSE_ADD[n]; if (n === 1) { const g = new T.Group(); [houseG, HOUSE_DECO].forEach((o) => { const c = bmCopy(o); c.traverse((q) => { q.visible = true; }); g.add(c); }); g.userData.tent = true; return g; } if (!h) return null; const c = bmCopy(h); c.traverse((o) => { o.visible = true; }); return c; }
  if (Q_ISLE[id]) { const k = Q_ISLE[id], t = ISET_BY[k];
    if (t) { const g = new T.Group(); t.lots.forEach((lid) => { const l = ISLE_BY[lid]; l.meshes.concat(l.objs).forEach((m) => { if (m.material === blobMat) return; g.add(bmCopy(m)); }); }); return g.children.length ? g : null; }
    const pk = IPACKS.find((q) => q.id === k); if (pk) { const g = packModel(pk); g.position.set(it.x + 1.5, 0, it.z); g.userData.spin = false; return g; } }
  return null;
}
/* the panel at the bottom: back, and buy (or a lock when it comes later) */
{ const st = document.createElement('style'); st.textContent = `
.bmConf { position: fixed; left: 50%; bottom: max(14px, env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); display: flex; gap: 14px; align-items: center; padding: 10px 12px; border-radius: 34px; background: #fbf3e2; border: 3px solid #22303c; box-shadow: 0 5px 0 rgba(34,48,60,0.28); z-index: 9; }
.bmConf[hidden] { display: none; }
.bmConf button { height: 72px; border-radius: 26px; border: 3px solid #22303c; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 0 18px; font: 800 30px/1 system-ui, sans-serif; color: #fffaf0; touch-action: manipulation; -webkit-tap-highlight-color: transparent; box-shadow: 0 4px 0 rgba(34,48,60,0.3); }
.bmConf button:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(34,48,60,0.3); }
.bmConf .back { width: 84px; padding: 0; background: #fffaf0; }
.bmConf .back svg { width: 44px; height: 44px; }
.bmConf .ok { min-width: 170px; background: #3f7d62; }
.bmConf .ok svg { width: 34px; height: 34px; }
.bmConf .ok .chk { width: 40px; height: 40px; }
.bmConf .ok.poor { background: #b8aa98; }
.bmConf .ok.lock { background: #fffaf0; color: #22303c; }
.bmConf .ok.lock svg { width: 40px; height: 40px; }
.bmConf .ok.can { animation: bmPulse 1.3s ease-in-out infinite; }
.bmConf .ok.no { animation: spNo 0.35s; }
@keyframes bmPulse { 50% { transform: scale(1.06); } }
@media (prefers-reduced-motion: reduce) { .bmConf .ok.can { animation: none; } }
`; document.head.appendChild(st); }
const BM_HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21 C3 14 2 8 6 5 C9 3 11 5 12 7 C13 5 15 3 18 5 C22 8 21 14 12 21 Z" fill="#e9684a" stroke="#3a2e2a" stroke-width="2"/></svg>';
const bmConf = document.createElement('div'); bmConf.className = 'bmConf'; bmConf.hidden = true;
bmConf.innerHTML = '<button type="button" class="back" aria-label="Tillbaka"><svg viewBox="0 0 44 44" aria-hidden="true"><path d="M18 10 L7 21 L18 32 M8 21 H28 Q37 21 37 29 Q37 36 29 36" fill="none" stroke="#22303c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button type="button" class="ok" aria-label="Köp"></button>';
document.body.appendChild(bmConf);
['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup'].forEach((ev) => bmConf.addEventListener(ev, (e) => { e.stopPropagation(); }, { passive: true }));
const bmOk = bmConf.querySelector('.ok');
bmConf.querySelector('.back').addEventListener('click', (e) => { e.stopPropagation(); Snd.play('swish', { gain: 0.3 }); bmSelect(null); });
bmOk.addEventListener('click', (e) => { e.stopPropagation(); Snd.init(); const it = BM.sel; if (!it) return;
  const nope = () => { bmOk.classList.remove('no'); void bmOk.offsetWidth; bmOk.classList.add('no'); Snd.play('tock', { gain: 0.3, f: 300 }); };
  if (!it.head || (it.open && !it.open())) return nope();
  if (bmPurse(it) < it.left()) { flash(it.tr === 'h' ? ($('coins').parentNode || $('coins')) : coinPill, 'no'); return nope(); }
  bmDrop(); const at = it.buy(); if (!at) return nope();
  if (typeof bump === 'function' && it.tr === 'h') bump();
  confetti(at[0], 1.0, at[1], 60); Snd.play('success', { gain: 0.5 }); save(); BM.key = '';
  bmConf.hidden = true; BM.sel.done = true; setTimeout(() => { if (BM.sel && BM.sel.done) bmSelect(null); }, 1600); });
function bmDrop() { if (BM.prev) { sc.remove(BM.prev); BM.prev = null; } ghostMat.opacity = 0.38; }
let bmPK = '';
function bmPanel() {
  const it = BM.sel; if (it.done) return; const can = it.head && (!it.open || it.open()) && bmPurse(it) >= it.left(), lock = !it.head || (it.open && !it.open());
  const k = (lock ? 'l' : can ? 'c' : 'p') + it.left(); if (k === bmPK) return; bmPK = k;
  bmOk.className = 'ok' + (lock ? ' lock' : can ? ' can' : ' poor');
  bmOk.innerHTML = lock ? ICO.lock : (it.tr === 'h' ? BM_HEART : ICO.coin) + fmt(it.left()) + (can ? '<svg class="chk" viewBox="0 0 34 34" aria-hidden="true"><path d="M8 17 L15 24 L27 10" fill="none" stroke="#fffaf0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '');
  bmOk.setAttribute('aria-label', lock ? 'Kommer senare' : 'Köp');
}
function bmSelect(it, quiet) {
  bmDrop(); BM.sel = it; bmPK = ''; BM.key = '';
  bmLay.hidden = !buyOn || !!it; bmBar.hidden = !buyOn || !!it; bmConf.hidden = !it;
  if (!it) return;
  if (!quiet) Snd.play('pop', { gain: 0.35, f: 820 });
  const m = it.model && it.model(); BM.pt = 0;
  if (m) { if (!it.head) m.traverse((o) => { if (o.isMesh && o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.62; } }); m.userData.ghost = false; m.userData.y0 = m.position.y; sc.add(m); BM.prev = m;
    const bb = new T.Box3().setFromObject(m), c = bb.getCenter(new T.Vector3()), sz = bb.getSize(new T.Vector3());
    it.fx = c.x; it.fz = c.z; it.fD = clamp(Math.max(sz.x, sz.z, sz.y * 1.4) * 2.6, 6.5, 18); }
  else { it.fx = it.x; it.fz = it.z; it.fD = 8; }
  bmPanel();
}
