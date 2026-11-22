/* ---------- the unlock map: the whole way ahead, like the sticker album ----------
   The shop bag opens a sheet with two paths of stickers: the hearts path (farm, barn, Pip's gear) and the coins path
   (market, house, island). Things already built are bright stickers with a green tick, the next thing on each path is a
   big sticker with its price and a jar that fills with what you have, and the things after it are dark shapes, so a child
   can see what comes next and in what order. Tapping a next sticker flies over the island to the spot where it goes and
   shows it in 3D with the buy button. Over the island (buy mode) only the next things show now, no grey shapes. */
{ const st = document.createElement('style'); st.textContent = `
.umap { z-index: 30; }
.umap .sheet { width: min(860px, 100%); height: 92vh; max-height: 92vh; display: flex; flex-direction: column; gap: 6px; }
.umap .sheetTop { align-items: center; margin-bottom: 2px; }
.umIsle { height: 60px; border-radius: 22px; border: 3px solid #22303c; background: #9fcf7f; padding: 4px 12px; display: flex; align-items: center; gap: 6px; margin-right: auto; box-shadow: 0 4px 0 rgba(34,48,60,0.25); touch-action: manipulation; }
.umIsle svg { width: 64px; height: 46px; display: block; }
.umIsle:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(34,48,60,0.25); }
.umHeads, .umCols { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.umHeads > div { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 6px; border-radius: 20px 20px 8px 8px; }
.umHeads .h { background: #fde8ee; border: 3px solid #e9a3b4; } .umHeads .c { background: #fff1c8; border: 3px solid #e6c46a; }
.umHeads .cur { width: 46px; height: 46px; border-radius: 50%; border: 3px solid #22303c; background: #fffaf0; display: grid; place-items: center; }
.umHeads .cur svg { width: 30px; height: 30px; } .umHeads img { width: 44px; height: 44px; }
.umScroll { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; scroll-behavior: smooth; padding-bottom: 10px; }
.umCol { display: flex; flex-direction: column; align-items: stretch; padding: 8px; border-radius: 8px 8px 20px 20px; }
.umCol.h { background: #fde8ee; border: 3px solid #e9a3b4; border-top: 0; } .umCol.c { background: #fff1c8; border: 3px solid #e6c46a; border-top: 0; }
.umCh { position: relative; display: flex; flex-direction: column; align-items: stretch; }
.umCh + .umCh { margin-top: 26px; }
.umCh + .umCh::before { content: ''; position: absolute; left: 50%; top: -26px; height: 26px; border-left: 6px dotted #b49a74; transform: translateX(-50%); }
.umCh.got + .umCh::before { border-left-style: solid; border-color: #3f7d62; }
.umGrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 12px 8px; justify-items: center; padding: 4px 2px 12px; }
.umStop { position: relative; display: flex; flex-direction: column; align-items: center; }
.umStk { width: 66px; height: 66px; border-radius: 18px; border: 3px dashed #c9b38c; background: #fbf3e2; display: grid; place-items: center; padding: 0; position: relative; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.umStk img { width: 50px; height: 50px; display: block; pointer-events: none; filter: brightness(0); opacity: 0.28; }
.umStop.done .umStk { border: 3px solid #22303c; background: #fffaf0; box-shadow: 0 3px 0 rgba(34,48,60,0.2); }
.umStop.done .umStk img { filter: none; opacity: 1; }
.umStop.done .umStk::after { content: ''; position: absolute; right: -8px; bottom: -8px; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #22303c; background: #3f7d62 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M5 10 L9 14 L15 6' fill='none' stroke='%23fffaf0' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/17px no-repeat; }
.umStop.big { grid-column: 1 / -1; flex-direction: row; justify-content: center; gap: 12px; padding: 4px 0; }
.umStop.big .side { display: flex; flex-direction: column; align-items: center; }
.umStop.big .umStk { width: 104px; height: 104px; border-radius: 28px; border: 4px solid #22303c; background: #fffaf0; box-shadow: 0 5px 0 rgba(34,48,60,0.3), inset 0 0 0 6px #f2c14a; }
.umStop.big .umStk img { width: 80px; height: 80px; filter: none; opacity: 1; }
.umStop.big.can .umStk { box-shadow: 0 5px 0 rgba(34,48,60,0.3), inset 0 0 0 6px #7cc36b; animation: umBob 1.3s ease-in-out infinite; }
.umStk .lock { position: absolute; left: -10px; top: -10px; width: 38px; height: 38px; border-radius: 50%; border: 3px solid #22303c; background: #fffaf0; display: grid; place-items: center; }
.umStk .lock svg { width: 26px; height: 26px; }
.umStk .go { position: absolute; right: -14px; top: -14px; width: 40px; height: 40px; border-radius: 50%; border: 3px solid #22303c; background: #f2c14a; display: grid; place-items: center; }
.umStk .go svg { width: 24px; height: 24px; }
.umStop.can .umStk .go { background: #7cc36b; }
.umPrice { display: flex; align-items: center; gap: 4px; padding: 3px 10px 3px 5px; border-radius: 99px; background: #b8aa98; border: 3px solid #22303c; color: #fffaf0; font: 800 20px/1 system-ui, sans-serif; white-space: nowrap; box-shadow: 0 3px 0 rgba(34,48,60,0.3); }
.umStop.can .umPrice { background: #3f7d62; }
.umPrice svg { width: 22px; height: 22px; display: block; }
.umJar { margin-top: 8px; width: 92px; height: 14px; border-radius: 8px; border: 3px solid #22303c; background: #fffaf0; overflow: hidden; }
.umJar i { display: block; height: 100%; background: #f2c14a; }
.umCol.h .umJar i { background: #ef7f8f; }
.umStk.no { animation: spNo 0.35s; }
/* the milestone at the end of each stretch: a big gold card */
.umMile { position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px 8px 10px; border-radius: 26px; border: 4px dashed #d9b45a; background: rgba(255,250,240,0.6); }
.umMile.done { border: 4px solid #22303c; background: linear-gradient(#fff3c4, #f7d977); box-shadow: 0 5px 0 rgba(34,48,60,0.28); }
.umMile.head { border: 4px solid #22303c; background: #fffaf0; box-shadow: 0 5px 0 rgba(34,48,60,0.28), inset 0 0 0 6px #f2c14a; }
.umMile.umStop .umStk, .umMile.umStop.done .umStk { width: 112px; height: 112px; border: 0; background: none; box-shadow: none; }
.umMile.umStop .umStk img { width: 100px; height: 100px; }
.umMile.done .umStk img, .umMile.head .umStk img { filter: none; opacity: 1; }
.umMile.umStop.done .umStk::after { content: ''; position: absolute; right: -4px; bottom: -2px; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #22303c; background: #3f7d62 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M5 10 L9 14 L15 6' fill='none' stroke='%23fffaf0' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/22px no-repeat; }
.umMile.head.can .umStk { animation: umBob 1.3s ease-in-out infinite; }
.umMile .star { position: absolute; top: -18px; width: 40px; height: 40px; }
.umMile .star.l { left: 8px; transform: rotate(-14deg); } .umMile .star.r { right: 8px; transform: rotate(14deg); }
.umMile:not(.done):not(.head) .star path { fill: #efe3c4; stroke: #c9b38c; }
.umDots { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; max-width: 160px; }
.umDots i { width: 12px; height: 12px; border-radius: 50%; border: 2px solid #b49a74; background: #fffaf0; }
.umDots i.on { background: #3f7d62; border-color: #22303c; }
@keyframes umBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@media (max-width: 600px) { .umCols, .umHeads { gap: 6px; } .umCol { padding: 6px 4px; } .umGrid { grid-template-columns: repeat(auto-fill, minmax(54px, 1fr)); gap: 10px 4px; } .umStk { width: 52px; height: 52px; border-radius: 14px; } .umStk img { width: 40px; height: 40px; }
  .umStop.big { flex-direction: column; gap: 8px; } .umStop.big .umStk { width: 86px; height: 86px; } .umStop.big .umStk img { width: 66px; height: 66px; } .umJar { width: 80px; margin-top: 6px; }
  .umMile.umStop .umStk, .umMile.umStop.done .umStk { width: 90px; height: 90px; } .umMile.umStop .umStk img { width: 80px; height: 80px; } .umMile .star { width: 30px; height: 30px; } .umHeads img { width: 34px; height: 34px; } }
@media (prefers-reduced-motion: reduce) { .umStop.big.can .umStk, .umMile.head.can .umStk { animation: none; } .umScroll { scroll-behavior: auto; } }
body.buyOn .umap { display: none; }
`; document.head.appendChild(st); }
const UM_HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21 C3 14 2 8 6 5 C9 3 11 5 12 7 C13 5 15 3 18 5 C22 8 21 14 12 21 Z" fill="#e9684a" stroke="#3a2e2a" stroke-width="2"/></svg>';
const UM_GO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12 H18 M12 6 L18 12 L12 18" fill="none" stroke="#22303c" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const UM_ISLE = '<svg viewBox="0 0 72 52" aria-hidden="true"><path d="M8 26 Q6 8 26 6 Q46 3 62 10 Q70 20 66 36 Q60 48 38 47 Q12 48 8 26 Z" fill="#cfe8b4" stroke="#22303c" stroke-width="3"/><circle cx="26" cy="22" r="6" fill="#e9684a" stroke="#22303c" stroke-width="2"/><circle cx="46" cy="32" r="6" fill="#f2c14a" stroke="#22303c" stroke-width="2"/><path d="M26 28 V36 M46 38 V44" stroke="#22303c" stroke-width="3" stroke-linecap="round"/></svg>';
const umap = document.createElement('div'); umap.className = 'menu umap'; umap.hidden = true;
umap.innerHTML = '<div class="sheet" role="dialog" aria-label="Vägen framåt"><div class="sheetTop"><button type="button" class="umIsle" aria-label="Se ön">' + UM_ISLE + '</button>'
  + '<button type="button" class="round" id="umClose" aria-label="Stäng"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M14 14 L34 34 M34 14 L14 34" stroke="#22303c" stroke-width="5" stroke-linecap="round"/></svg></button></div>'
  + '<div class="umHeads"><div class="h"><div class="cur">' + UM_HEART + '</div><img alt=""></div><div class="c"><div class="cur">' + ICO.coin + '</div><img alt=""></div></div>'
  + '<div class="umScroll"><div class="umCols"><div class="umCol h" role="group" aria-label="Hjärtan"></div><div class="umCol c" role="group" aria-label="Mynt"></div></div></div></div>';
document.body.appendChild(umap);
['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup'].forEach((ev) => umap.addEventListener(ev, (e) => { e.stopPropagation(); }, { passive: true }));
umap.querySelector('.umHeads .h img').src = bmIcon('um:farm', (x) => drawIcon(x, 'barn', 64, 66, 1.25));
umap.querySelector('.umHeads .c img').src = bmIcon('um:home', (x) => drawIcon(x, 'house', 64, 66, 1.25));
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
/* milestones: a new kind of animal on the hearts path, each new part of the house (and the lighthouse) on the coins path */
const UM_MILE = (s) => s.tr === 'h' ? /^(pig|duck|sheep|cow|rabbit|goat|horse|alpaca|bull)1$/.test(s.id) : s.house || s.id === 'isle:lighthouse-set';
/* each path cut into stretches that end in a milestone */
function umChapters(list) { const out = []; let cur = []; list.forEach((s) => { if (UM_MILE(s)) { out.push({ items: cur, mile: s }); cur = []; } else cur.push(s); }); if (cur.length) out.push({ items: cur, mile: null }); return out; }
const UM_STAR = '<svg class="star" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3 L25 14 L37 15 L28 23 L31 35 L20 29 L9 35 L12 23 L3 15 L15 14 Z" fill="#f2c14a" stroke="#22303c" stroke-width="2.5" stroke-linejoin="round"/></svg>';
function umStopHtml(s, tr, k) {
  const big = s.head && !s.done, can = big && umCan(s), lock = big && s.it && s.it.open && !s.it.open();
  const left = s.it ? s.it.left() : s.cost, fill = big ? Math.min(1, bmPurse(s.it || { tr }) / Math.max(1, left)) : 0;
  const btn = '<button type="button" class="umStk" aria-label="' + (s.done ? 'Klar' : big ? 'Nästa' : 'Senare') + '"><img alt="">' + (lock ? '<span class="lock">' + ICO.lock + '</span>' : big ? '<span class="go">' + UM_GO + '</span>' : '') + '</button>';
  const price = big ? '<div class="side"><div class="umPrice">' + (tr === 'h' ? UM_HEART : ICO.coin) + fmt(left) + '</div><div class="umJar"><i style="width:' + (fill * 100).toFixed(0) + '%"></i></div></div>' : '';
  return { big, can, btn, price, k };
}
function umRender(force) {
  const P = umPaths(), key = ['h', 'c'].map((tr) => P[tr].map((s) => (s.done ? 1 : s.head ? (umCan(s) ? 'C' : 'H') + (s.it ? s.it.left() : '') + ':' + Math.round(Math.min(1, bmPurse(s.it || { tr }) / Math.max(1, s.it ? s.it.left() : 1)) * 20) : 0)).join('')).join('|');
  if (!force && key === UM.key) return; const first = !UM.key || force; UM.key = key; UM.els = [];
  const box = umap.querySelector('.umScroll'), keep = box.scrollTop;
  ['h', 'c'].forEach((tr) => {
    const col = umap.querySelector('.umCol.' + tr); let html = '';
    umChapters(P[tr]).forEach((ch) => {
      const all = ch.items.concat(ch.mile ? [ch.mile] : []), got = all.every((s) => s.done);
      html += '<div class="umCh' + (got ? ' got' : '') + '">';
      if (ch.items.length) { html += '<div class="umGrid">'; ch.items.forEach((s) => { const i = P[tr].indexOf(s), h = umStopHtml(s, tr);
        html += '<div class="umStop' + (s.done ? ' done' : '') + (h.big ? ' big' : '') + (h.can ? ' can' : '') + '" data-i="' + i + '">' + h.btn + h.price + '</div>'; }); html += '</div>'; }
      if (ch.mile) { const s = ch.mile, i = P[tr].indexOf(s), h = umStopHtml(s, tr), n = ch.items.filter((q) => q.done).length;
        html += '<div class="umMile umStop' + (s.done ? ' done' : '') + (h.big ? ' head' : '') + (h.can ? ' can' : '') + '" data-i="' + i + '">' + UM_STAR.replace('class="star"', 'class="star l"') + UM_STAR.replace('class="star"', 'class="star r"') + h.btn
          + (h.big ? h.price : '') + (ch.items.length && !s.done ? '<div class="umDots" aria-hidden="true">' + ch.items.map((q) => '<i' + (q.done ? ' class="on"' : '') + '></i>').join('') + '</div>' : '') + '</div>'; }
      html += '</div>';
    });
    col.innerHTML = html;
    col.querySelectorAll('.umStop').forEach((el) => { const s = P[tr][+el.dataset.i]; el.querySelector('img').src = s.pic(); const b = el.querySelector('.umStk');
      b.addEventListener('click', (e) => { e.stopPropagation(); Snd.init(); umTap(b, s); }); });
  });
  /* both paths scroll together; on opening, the higher of the two next things sits near the top */
  if (first) { const tops = ['h', 'c'].map((tr) => { const el = umap.querySelector('.umCol.' + tr + ' .umStop:not(.done)'); return el ? el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop : 1e9; });
    const y = Math.min(tops[0], tops[1]); const b = box.style.scrollBehavior; box.style.scrollBehavior = 'auto'; box.scrollTop = y < 1e9 ? Math.max(0, y - 110) : 0; box.style.scrollBehavior = b; }
  else box.scrollTop = keep;
}
/* reaching a milestone is a bigger moment: a gold badge, a fanfare and confetti round Pip */
let umMiles = null, umMK = '';
function umMileCheck() {
  if (tutOn() || !stS()) return; const k = qHead('h') + '|' + qHead('c') + '|' + stS().size; if (k === umMK) return; umMK = k;
  const P = umPaths(), got = P.h.concat(P.c).filter((s) => s.done && UM_MILE(s)), ids = got.map((s) => s.id), fresh = umMiles ? got.filter((s) => !umMiles.includes(s.id)) : [];
  if (fresh.length) { const s = fresh[0]; setTimeout(() => { if (typeof badge === 'function') badge(s.pic()); fanfare(true); confetti(pip.position.x, 1.4, pip.position.z, 90, 5); }, 900); }
  umMiles = ids;
}
function umTap(b, s) {
  if (s.done) { Snd.play('pop', { gain: 0.3, f: 900 }); b.classList.remove('no'); void b.offsetWidth; return; }
  if (!s.head) { Snd.play('tock', { gain: 0.3, f: 300 }); b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); return; }
  /* the next thing: fly over the island to where it goes and show it there */
  Snd.play('pop', { gain: 0.35, f: 820 });
  const it = bmList().find((q) => q.id === s.id) || (s.it && Object.assign(s.it, { head: true, area: bmAreaOf(s.it.az != null ? s.it.az : s.it.z) }));
  const fly = () => { buyMode(true); if (!it || !buyOn) return; bmArea(it.area, true, it.x); bmSelect(it, true); };
  umClose(true); if (inStore) { goStore(false); setTimeout(fly, 900); } else fly();
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
umap.querySelector('.umIsle').addEventListener('click', (e) => { e.stopPropagation(); umClose(true); if (inStore) { goStore(false); setTimeout(() => buyMode(true), 900); } else buyMode(true); });
/* the bag opens the map (in the first-day tour it still goes straight to the island, where only the house is shown) */
function umBag() { if (buyOn) { buyMode(false); return; } if (tutOn()) { buyMode(true); return; } if (umap.hidden) umOpen(); else umClose(); }
/* over the island: a map button beside the tabs goes back to the paths */
const umBack = document.createElement('button'); umBack.type = 'button'; umBack.className = 'bmTab umTab'; umBack.setAttribute('aria-label', 'Vägen framåt');
umBack.innerHTML = '<svg viewBox="0 0 72 52" aria-hidden="true"><rect x="6" y="6" width="60" height="40" rx="8" fill="#fffaf0" stroke="#22303c" stroke-width="3"/><path d="M14 34 Q24 16 36 28 T58 18" fill="none" stroke="#b49a74" stroke-width="4" stroke-dasharray="2 6" stroke-linecap="round"/><circle cx="14" cy="34" r="5" fill="#3f7d62" stroke="#22303c" stroke-width="2"/><circle cx="36" cy="28" r="6" fill="#f2c14a" stroke="#22303c" stroke-width="2"/><circle cx="58" cy="18" r="4" fill="#c9b38c" stroke="#22303c" stroke-width="2"/></svg>';
bmBar.insertBefore(umBack, bmBar.firstChild);
umBack.addEventListener('click', (e) => { e.stopPropagation(); if (tutOn()) return; umOpen(); });
function umStep(dt) {
  UM.t -= dt; if (UM.t > 0) return; UM.t = 0.4;
  umBack.hidden = tutOn(); umMileCheck();
  if (!umap.hidden) { if ((inHouse && !inStore) || trip || dressing) umClose(true); else umRender(false); }
}
{ const s0 = storeStep; storeStep = function (dt) { s0(dt); umStep(dt); }; }
if (window.__farmTest) window.__umap = { open: () => umOpen(), close: () => umClose(), on: () => !umap.hidden,
  paths: () => { const P = umPaths(); return ['h', 'c'].map((tr) => P[tr].map((s) => s.id + (s.done ? '+' : s.head ? '*' : '')).join(' ')); },
  tap: (id) => { const el = [...umap.querySelectorAll('.umStop')].find((e) => { const tr = e.closest('.umCol').classList.contains('h') ? 'h' : 'c'; return umPaths()[tr][+e.dataset.i].id === id; }); if (!el) return 'none'; el.querySelector('.umStk').click(); return 'ok'; } };
/* ---------- in the shop: a map board on an easel with a ring in front; stand on the ring and the map opens ---------- */
const UM_BOARD = { x: SI.x - 3.25, z: SI.z + 2.55 }, UM_RING = { x: SI.x - 2.05, z: SI.z + 3.0 };
{ const g = new T.Group(); g.position.set(UM_BOARD.x, 0, UM_BOARD.z); g.rotation.y = 0.2; sc.add(g);
  const wood = new T.MeshStandardMaterial({ color: '#8a5a3a', roughness: 0.8 });
  [[-0.5, 0.06], [0.5, 0.06], [0, -0.35]].forEach(([x, z], i) => { const l = new T.Mesh(new T.BoxGeometry(0.08, 1.9, 0.08), wood); l.position.set(x, 0.9, z); l.rotation.x = i === 2 ? -0.32 : 0.1; l.castShadow = true; g.add(l); });
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 320; const x = cv.getContext('2d');
  x.fillStyle = '#fffaf0'; x.fillRect(0, 0, 256, 320); x.lineWidth = 12; x.strokeStyle = '#6b4630'; x.strokeRect(6, 6, 244, 308);
  x.fillStyle = '#fde8ee'; x.fillRect(22, 22, 100, 276); x.fillStyle = '#fff1c8'; x.fillRect(134, 22, 100, 276);
  drawIcon(x, 'heart', 72, 52, 0.7); drawIcon(x, 'coin', 184, 52, 0.7);
  [[72, 0], [184, 1]].forEach(([cx, k]) => { x.setLineDash([4, 10]); x.lineCap = 'round'; x.lineWidth = 6; x.strokeStyle = '#b49a74'; x.beginPath(); x.moveTo(cx, 84); x.lineTo(cx, 290); x.stroke(); x.setLineDash([]);
    [[100, '#3f7d62'], [150, '#3f7d62'], [200 + k * 20, '#f2c14a'], [260, '#c9b38c']].forEach(([y, c]) => { x.fillStyle = c; x.strokeStyle = PAL.ink; x.lineWidth = 4; x.beginPath(); x.arc(cx, y, y === 260 ? 16 : 13, 0, 7); x.fill(); x.stroke(); });
    x.fillStyle = '#f2c14a'; x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 7 : 16, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(cx + Math.cos(a) * r, 260 + Math.sin(a) * r); } x.closePath(); x.fill(); x.stroke(); });
  const tex = new T.CanvasTexture(cv); if ('colorSpace' in tex) tex.colorSpace = T.SRGBColorSpace;
  const board = new T.Mesh(new T.BoxGeometry(1.1, 1.38, 0.06), [wood, wood, wood, wood, new T.MeshStandardMaterial({ map: tex, roughness: 0.9 }), wood]); board.position.set(0, 1.35, 0.14); board.rotation.x = -0.1; board.castShadow = true; g.add(board); }
const umRing = (() => { const g = new T.Group(); g.position.set(UM_RING.x, 0.05, UM_RING.z); sc.add(g);
  const c = document.createElement('canvas'); c.width = c.height = 192; const x = c.getContext('2d');
  x.fillStyle = 'rgba(255,246,228,0.95)'; x.beginPath(); x.arc(96, 96, 86, 0, 7); x.fill(); x.lineWidth = 10; x.strokeStyle = '#f2c14a'; x.stroke(); drawIcon(x, 'map', 96, 98, 1.2);
  const d = new T.Mesh(new T.CircleGeometry(0.56, 32), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true, depthWrite: false })); d.rotation.x = -Math.PI / 2; g.add(d); return g; })();
let umRingDone = false;
function umRingFrame() {
  umRing.scale.setScalar(1 + (reduced ? 0 : Math.sin(time * 3) * 0.03));
  const on = inStore && Math.hypot(pip.position.x - UM_RING.x, pip.position.z - UM_RING.z) < 0.56;
  if (!on) { umRingDone = false; return; }
  if (!umRingDone && stillOn(UM_RING, 0, 0.56) && umap.hidden) { umRingDone = true; umOpenIn(); }
}
/* inside the shop the map may open (normally it waits until Pip is outdoors) */
function umOpenIn() { if (typeof closeMenu === 'function') closeMenu(); umap.hidden = false; Snd.init(); Snd.play('whoosh', { gain: 0.3 }); umRender(true); }
{ const s0 = storeStep; storeStep = function (dt) { s0(dt); umRingFrame(); }; }
