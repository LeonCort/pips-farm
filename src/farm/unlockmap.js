/* ---------- the unlock map: the whole way ahead, like the sticker album ----------
   The shop bag opens a sheet with two paths of stickers: the hearts path (farm, barn, Pip's gear) and the coins path
   (market, house, island). Things already built are bright stickers with a green tick, the next thing on each path is a
   big sticker with its price and a jar that fills with what you have, and the things after it are dark shapes, so a child
   can see what comes next and in what order. Tapping a next sticker flies over the island to the spot where it goes and
   shows it in 3D with the buy button. Over the island (buy mode) only the next things show now, no grey shapes. */
{ const st = document.createElement('style'); st.textContent = `
.umap { z-index: 30; }
.umap .sheet { width: min(860px, 100%); max-height: 92vh; display: flex; flex-direction: column; gap: 6px; }
.umap .sheetTop { align-items: center; margin-bottom: 2px; }
.umIsle { height: 60px; border-radius: 22px; border: 3px solid #22303c; background: #9fcf7f; padding: 4px 12px; display: flex; align-items: center; gap: 6px; margin-right: auto; box-shadow: 0 4px 0 rgba(34,48,60,0.25); touch-action: manipulation; }
.umIsle svg { width: 64px; height: 46px; display: block; }
.umIsle:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(34,48,60,0.25); }
.umLane { display: flex; align-items: stretch; gap: 8px; border-radius: 22px; padding: 6px 0 6px 6px; }
.umLane.h { background: #fde8ee; border: 3px solid #e9a3b4; } .umLane.c { background: #fff1c8; border: 3px solid #e6c46a; }
.umHead { flex: none; width: 58px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
.umHead .cur { width: 52px; height: 52px; border-radius: 50%; border: 3px solid #22303c; background: #fffaf0; display: grid; place-items: center; }
.umHead .cur svg { width: 34px; height: 34px; }
.umHead img { width: 40px; height: 40px; }
.umRow { flex: 1; overflow-x: auto; overflow-y: hidden; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; scrollbar-width: thin; }
.umTrack { display: flex; align-items: center; gap: 0; padding: 8px 16px 8px 6px; width: max-content; min-height: 176px; }
.umStop { position: relative; flex: none; display: flex; flex-direction: column; align-items: center; }
.umStop + .umStop::before { content: ''; position: absolute; right: 100%; top: 50%; width: 18px; border-top: 5px dotted #b49a74; transform: translateY(-50%); }
.umStop + .umStop { margin-left: 18px; }
.umStop.done + .umStop::before { border-top-style: solid; border-color: #3f7d62; }
.umStk { width: 70px; height: 70px; border-radius: 18px; border: 3px dashed #c9b38c; background: #fbf3e2; display: grid; place-items: center; padding: 0; position: relative; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.umStk img { width: 54px; height: 54px; display: block; pointer-events: none; filter: brightness(0); opacity: 0.28; }
.umStop.done .umStk { border: 3px solid #22303c; background: #fffaf0; box-shadow: 0 3px 0 rgba(34,48,60,0.2); }
.umStop.done .umStk img { filter: none; opacity: 1; }
.umStop.done .umStk::after { content: ''; position: absolute; right: -8px; bottom: -8px; width: 26px; height: 26px; border-radius: 50%; border: 3px solid #22303c; background: #3f7d62 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M5 10 L9 14 L15 6' fill='none' stroke='%23fffaf0' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/18px no-repeat; }
.umStop.big .umStk { width: 112px; height: 112px; border-radius: 28px; border: 4px solid #22303c; background: #fffaf0; box-shadow: 0 5px 0 rgba(34,48,60,0.3), inset 0 0 0 6px #f2c14a; }
.umStop.big .umStk img { width: 86px; height: 86px; filter: none; opacity: 1; }
.umStop.big.can .umStk { box-shadow: 0 5px 0 rgba(34,48,60,0.3), inset 0 0 0 6px #7cc36b; animation: umBob 1.3s ease-in-out infinite; }
.umStop.big .umStk .lock { position: absolute; left: -10px; top: -10px; width: 38px; height: 38px; border-radius: 50%; border: 3px solid #22303c; background: #fffaf0; display: grid; place-items: center; }
.umStop.big .umStk .lock svg { width: 26px; height: 26px; }
.umStop.big .umStk .go { position: absolute; right: -14px; top: -14px; width: 40px; height: 40px; border-radius: 50%; border: 3px solid #22303c; background: #f2c14a; display: grid; place-items: center; }
.umStop.big .umStk .go svg { width: 24px; height: 24px; }
.umStop.big.can .umStk .go { background: #7cc36b; }
.umPrice { margin-top: 8px; display: flex; align-items: center; gap: 4px; padding: 3px 10px 3px 5px; border-radius: 99px; background: #b8aa98; border: 3px solid #22303c; color: #fffaf0; font: 800 20px/1 system-ui, sans-serif; white-space: nowrap; box-shadow: 0 3px 0 rgba(34,48,60,0.3); }
.umStop.can .umPrice { background: #3f7d62; }
.umPrice svg { width: 22px; height: 22px; display: block; }
.umJar { margin-top: 6px; width: 96px; height: 14px; border-radius: 8px; border: 3px solid #22303c; background: #fffaf0; overflow: hidden; }
.umJar i { display: block; height: 100%; background: #f2c14a; }
.umLane.h .umJar i { background: #ef7f8f; }
.umStk.no { animation: spNo 0.35s; }
.umStop.house .umStk { border-radius: 50% 50% 18px 18px; }
@keyframes umBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@media (max-width: 600px) { .umTrack { min-height: 150px; } .umStk { width: 58px; height: 58px; } .umStk img { width: 44px; height: 44px; } .umStop.big .umStk { width: 92px; height: 92px; } .umStop.big .umStk img { width: 70px; height: 70px; } .umHead { width: 44px; } .umHead .cur { width: 42px; height: 42px; } .umHead img { width: 30px; height: 30px; } }
@media (prefers-reduced-motion: reduce) { .umStop.big.can .umStk { animation: none; } .umRow { scroll-behavior: auto; } }
body.buyOn .umap { display: none; }
`; document.head.appendChild(st); }
const UM_HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21 C3 14 2 8 6 5 C9 3 11 5 12 7 C13 5 15 3 18 5 C22 8 21 14 12 21 Z" fill="#e9684a" stroke="#3a2e2a" stroke-width="2"/></svg>';
const UM_GO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12 H18 M12 6 L18 12 L12 18" fill="none" stroke="#22303c" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const UM_ISLE = '<svg viewBox="0 0 72 52" aria-hidden="true"><path d="M8 26 Q6 8 26 6 Q46 3 62 10 Q70 20 66 36 Q60 48 38 47 Q12 48 8 26 Z" fill="#cfe8b4" stroke="#22303c" stroke-width="3"/><circle cx="26" cy="22" r="6" fill="#e9684a" stroke="#22303c" stroke-width="2"/><circle cx="46" cy="32" r="6" fill="#f2c14a" stroke="#22303c" stroke-width="2"/><path d="M26 28 V36 M46 38 V44" stroke="#22303c" stroke-width="3" stroke-linecap="round"/></svg>';
const umap = document.createElement('div'); umap.className = 'menu umap'; umap.hidden = true;
umap.innerHTML = '<div class="sheet" role="dialog" aria-label="Vägen framåt"><div class="sheetTop"><button type="button" class="umIsle" aria-label="Se ön">' + UM_ISLE + '</button>'
  + '<button type="button" class="round" id="umClose" aria-label="Stäng"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M14 14 L34 34 M34 14 L14 34" stroke="#22303c" stroke-width="5" stroke-linecap="round"/></svg></button></div>'
  + '<div class="umLane h" role="group" aria-label="Hjärtan"><div class="umHead"><div class="cur">' + UM_HEART + '</div><img alt=""></div><div class="umRow"><div class="umTrack"></div></div></div>'
  + '<div class="umLane c" role="group" aria-label="Mynt"><div class="umHead"><div class="cur">' + ICO.coin + '</div><img alt=""></div><div class="umRow"><div class="umTrack"></div></div></div></div>';
document.body.appendChild(umap);
['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup'].forEach((ev) => umap.addEventListener(ev, (e) => { e.stopPropagation(); }, { passive: true }));
umap.querySelector('.umLane.h .umHead img').src = bmIcon('um:farm', (x) => drawIcon(x, 'barn', 64, 66, 1.25));
umap.querySelector('.umLane.c .umHead img').src = bmIcon('um:home', (x) => drawIcon(x, 'house', 64, 66, 1.25));
const UM = { key: '', t: 0, els: [] };
/* the two paths, in buying order: { id, tr, cost, done, head, it (the buy-mode thing: picture, place, price left) } */
function umPaths() {
  const S = stS(), out = { h: [], c: [] };
  if (S && SIZES[1]) { const done = S.size >= 1, it = bmList().find((q) => q.id === 'house:cottage');
    out.c.push({ id: 'house:cottage', tr: 'c', cost: SIZES[1].cost, done, head: !done, house: true, it, pic: () => thumbOf('h:1', () => miniHouse(0, 1)) }); }
  ['h', 'c'].forEach((tr) => { const h = qHead(tr); QUEUE[tr].forEach(([id, cost]) => {
    const it = bmItem(tr, id, cost); if (!it) return; const done = qOwned(id);
    out[tr].push({ id, tr, cost, done, head: id === h, house: !!Q_SIZE[id], it, pic: it.pic }); }); });
  return out;
}
const umCan = (s) => s.it && (!s.it.open || s.it.open()) && bmPurse(s.it) >= s.it.left();
function umRender(force) {
  const P = umPaths(), key = ['h', 'c'].map((tr) => P[tr].map((s) => (s.done ? 1 : s.head ? (umCan(s) ? 'C' : 'H') + (s.it ? s.it.left() : '') + ':' + Math.round(Math.min(1, bmPurse(s.it || { tr }) / Math.max(1, s.it ? s.it.left() : 1)) * 20) : 0)).join('')).join('|');
  if (!force && key === UM.key) return; const first = !UM.key || force; UM.key = key; UM.els = [];
  ['h', 'c'].forEach((tr) => {
    const track = umap.querySelector('.umLane.' + tr + ' .umTrack'); let html = '';
    P[tr].forEach((s, i) => {
      const big = s.head && !s.done, can = big && umCan(s), lock = big && s.it && s.it.open && !s.it.open();
      const left = s.it ? s.it.left() : s.cost, fill = big ? Math.min(1, bmPurse(s.it || { tr }) / Math.max(1, left)) : 0;
      html += '<div class="umStop' + (s.done ? ' done' : '') + (big ? ' big' : '') + (can ? ' can' : '') + (s.house ? ' house' : '') + '" data-i="' + i + '">'
        + '<button type="button" class="umStk" aria-label="' + (s.done ? 'Klar' : big ? 'Nästa' : 'Senare') + '"><img alt="">' + (lock ? '<span class="lock">' + ICO.lock + '</span>' : big ? '<span class="go">' + UM_GO + '</span>' : '') + '</button>'
        + (big ? '<div class="umPrice">' + (tr === 'h' ? UM_HEART : ICO.coin) + fmt(left) + '</div><div class="umJar"><i style="width:' + (fill * 100).toFixed(0) + '%"></i></div>' : '') + '</div>';
    });
    track.innerHTML = html;
    track.querySelectorAll('.umStop').forEach((el) => { const s = P[tr][+el.dataset.i]; el.querySelector('img').src = s.pic(); const b = el.querySelector('.umStk');
      b.addEventListener('click', (e) => { e.stopPropagation(); Snd.init(); umTap(b, s); }); });
    if (first) { const row = track.parentNode, i = P[tr].findIndex((s) => !s.done), el = track.querySelectorAll('.umStop')[Math.max(0, i)];
      if (el) { const b = row.style.scrollBehavior; row.style.scrollBehavior = 'auto'; row.scrollLeft = Math.max(0, el.offsetLeft - row.clientWidth * 0.3); row.style.scrollBehavior = b; } }
  });
}
function umTap(b, s) {
  if (s.done) { Snd.play('pop', { gain: 0.3, f: 900 }); b.classList.remove('no'); void b.offsetWidth; return; }
  if (!s.head) { Snd.play('tock', { gain: 0.3, f: 300 }); b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); return; }
  /* the next thing: fly over the island to where it goes and show it there */
  Snd.play('pop', { gain: 0.35, f: 820 });
  const it = bmList().find((q) => q.id === s.id) || (s.it && Object.assign(s.it, { head: true, area: bmAreaOf(s.it.az != null ? s.it.az : s.it.z) }));
  umClose(true); buyMode(true); if (!it) return; bmArea(it.area, true, it.x); bmSelect(it, true);
}
function umOpen() {
  if (buyOn) buyMode(false);
  if (inHouse || trip || dressing || (typeof ED !== 'undefined' && ED.on)) return;
  if (typeof closeMenu === 'function') closeMenu(); if (typeof closeAlbum === 'function') closeAlbum();
  umap.hidden = false; Snd.init(); Snd.play('whoosh', { gain: 0.3 }); umRender(true);
}
function umClose(quiet) { if (umap.hidden) return; umap.hidden = true; if (!quiet) Snd.play('swish', { gain: 0.3 }); }
umap.addEventListener('click', (e) => { if (e.target === umap) umClose(); });
umap.querySelector('#umClose').addEventListener('click', (e) => { e.stopPropagation(); umClose(); });
umap.querySelector('.umIsle').addEventListener('click', (e) => { e.stopPropagation(); umClose(true); buyMode(true); });
/* the bag opens the map (in the first-day tour it still goes straight to the island, where only the house is shown) */
function umBag() { if (buyOn) { buyMode(false); return; } if (tutOn()) { buyMode(true); return; } if (umap.hidden) umOpen(); else umClose(); }
/* over the island: a map button beside the tabs goes back to the paths */
const umBack = document.createElement('button'); umBack.type = 'button'; umBack.className = 'bmTab umTab'; umBack.setAttribute('aria-label', 'Vägen framåt');
umBack.innerHTML = '<svg viewBox="0 0 72 52" aria-hidden="true"><rect x="6" y="6" width="60" height="40" rx="8" fill="#fffaf0" stroke="#22303c" stroke-width="3"/><path d="M14 34 Q24 16 36 28 T58 18" fill="none" stroke="#b49a74" stroke-width="4" stroke-dasharray="2 6" stroke-linecap="round"/><circle cx="14" cy="34" r="5" fill="#3f7d62" stroke="#22303c" stroke-width="2"/><circle cx="36" cy="28" r="6" fill="#f2c14a" stroke="#22303c" stroke-width="2"/><circle cx="58" cy="18" r="4" fill="#c9b38c" stroke="#22303c" stroke-width="2"/></svg>';
bmBar.insertBefore(umBack, bmBar.firstChild);
umBack.addEventListener('click', (e) => { e.stopPropagation(); if (tutOn()) return; umOpen(); });
function umStep(dt) {
  UM.t -= dt; if (UM.t > 0) return; UM.t = 0.4;
  umBack.hidden = tutOn();
  if (!umap.hidden) { if (inHouse || trip || dressing) umClose(true); else umRender(false); }
}
{ const s0 = storeStep; storeStep = function (dt) { s0(dt); umStep(dt); }; }
if (window.__farmTest) window.__umap = { open: () => umOpen(), close: () => umClose(), on: () => !umap.hidden,
  paths: () => { const P = umPaths(); return ['h', 'c'].map((tr) => P[tr].map((s) => s.id + (s.done ? '+' : s.head ? '*' : '')).join(' ')); },
  tap: (id) => { const el = [...umap.querySelectorAll('.umStop')].find((e) => { const tr = e.closest('.umLane').classList.contains('h') ? 'h' : 'c'; return umPaths()[tr][+e.dataset.i].id === id; }); if (!el) return 'none'; el.querySelector('.umStk').click(); return 'ok'; } };
