/* ---------- phones: the round buttons up top (shop, map, album, settings) go behind one button that opens a sheet from the bottom ----------
   On a narrow screen the four buttons crowded the hearts and coins. Now there is one button in the top right corner; it shows a dot
   when one of the four has news. The sheet holds the same four pictures, big, and a tap on one does what the old button did. */
{ const st = document.createElement('style'); st.textContent = `
.moreBtn { display: none; position: fixed; top: max(12px, env(safe-area-inset-top, 0px)); right: max(14px, env(safe-area-inset-right, 0px)); width: 62px; height: 62px; border-radius: 50%; padding: 0; z-index: 9;
  border: 4px solid #fff3dc; background: radial-gradient(circle at 34% 28%, #fff8ea, #f3e3c4 60%, #d9bf94); box-shadow: 0 0 0 3px #4a2e1a, 0 7px 0 3px rgba(60,34,16,0.45), 0 12px 16px rgba(60,34,16,0.25), inset 0 -8px 12px rgba(0,0,0,0.12), inset 0 6px 10px rgba(255,255,255,0.5); touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.moreBtn svg { width: 100%; height: 100%; display: block; pointer-events: none; }
.moreBtn:active { transform: translateY(4px); }
.moreBtn .dot { display: none; position: absolute; top: -6px; right: -6px; width: 22px; height: 22px; border-radius: 50%; background: #e9684a; border: 3px solid #22303c; }
.moreBtn.news .dot { display: block; } .moreBtn.buy .dot { background: #3f7d62; }
.moreBtn.news { animation: bmBounce 1.4s ease-in-out infinite; }
.moreLay { position: fixed; inset: 0; z-index: 40; background: rgba(34,24,14,0.35); opacity: 0; transition: opacity 0.22s; touch-action: none; }
.moreLay.open { opacity: 1; }
.moreLay[hidden] { display: none; }
.moreSheet { position: absolute; left: 0; right: 0; bottom: 0; padding: 14px max(18px, env(safe-area-inset-left, 0px)) calc(22px + env(safe-area-inset-bottom, 0px)); border-radius: 30px 30px 0 0; background: #fbf3e2; border-top: 4px solid #4a2e1a; box-shadow: 0 -8px 24px rgba(40,24,10,0.3); transform: translateY(105%); transition: transform 0.28s cubic-bezier(.2,1.2,.4,1); }
.moreLay.open .moreSheet { transform: none; }
.moreSheet .grab { width: 56px; height: 6px; border-radius: 3px; background: #d9c6a3; margin: 0 auto 14px; }
.moreGrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; max-width: 520px; margin: 0 auto; }
.moreTile { position: relative; aspect-ratio: 1; border-radius: 24px; border: 3px solid #22303c; padding: 12%; box-shadow: 0 5px 0 rgba(34,48,60,0.28); touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.moreTile:active { transform: translateY(3px); box-shadow: 0 2px 0 rgba(34,48,60,0.28); }
.moreTile > * { pointer-events: none; }
.moreTile img, .moreTile svg { width: 100%; height: 100%; display: block; filter: drop-shadow(0 3px 0 rgba(40,24,10,0.3)); }
.moreTile .dot, .moreTile .badge { display: none !important; }
.moreTile .ndot { display: none; position: absolute; top: -8px; right: -8px; width: 24px; height: 24px; border-radius: 50%; background: #e9684a; border: 3px solid #22303c; }
.moreTile.news .ndot { display: block; } .moreTile.t-shop.news .ndot { background: #3f7d62; }
.moreTile.t-shop { background: radial-gradient(circle at 34% 28%, #ffe7a0, #f2c14a 55%, #c98a2c); }
.moreTile.t-map { background: radial-gradient(circle at 34% 28%, #b6e08a, #6fb05a 55%, #3f7d46); }
.moreTile.t-album { background: radial-gradient(circle at 34% 28%, #9fd0f0, #4f97c9 55%, #2f6a99); }
.moreTile.t-menu { background: radial-gradient(circle at 34% 28%, #ffb9a4, #e9684a 55%, #a8432a); }
.moreTile.off { opacity: 0.45; }
@media (max-width: 600px) {
  .moreBtn { display: block; }
  .mapBtn, .albumBtn, #menuBtn, .bmBtn { display: none !important; }
  body.buyOn .moreBtn { visibility: hidden; }
}
@media (prefers-reduced-motion: reduce) { .moreBtn.news { animation: none; } .moreSheet { transition: none; } }
`; document.head.appendChild(st); }
const moreBtn = document.createElement('button'); moreBtn.type = 'button'; moreBtn.className = 'moreBtn'; moreBtn.setAttribute('aria-label', 'Mer'); moreBtn.setAttribute('aria-expanded', 'false');
moreBtn.innerHTML = '<svg viewBox="0 0 62 62" aria-hidden="true">' + [[21, 21, '#f2c14a'], [41, 21, '#6fb05a'], [21, 41, '#4f97c9'], [41, 41, '#e9684a']].map(([x, y, c]) => '<circle cx="' + (x - 2) + '" cy="' + (y - 2) + '" r="7.5" fill="' + c + '" stroke="#22303c" stroke-width="3"/>').join('') + '</svg><span class="dot"></span>';
document.body.appendChild(moreBtn);
const moreLay = document.createElement('div'); moreLay.className = 'moreLay'; moreLay.hidden = true;
moreLay.innerHTML = '<div class="moreSheet" role="dialog" aria-label="Meny"><div class="grab"></div><div class="moreGrid"></div></div>';
document.body.appendChild(moreLay);
const MORE = [
  { k: 'shop', el: () => bmBtn, news: (b) => b.classList.contains('ready'), label: 'Köp nya saker' },
  { k: 'map', el: () => document.querySelector('.mapBtn'), news: (b) => b.classList.contains('wait'), label: 'Karta' },
  { k: 'album', el: () => $('albumBtn'), news: (b) => b.classList.contains('new'), label: 'Album' },
  { k: 'menu', el: () => $('menuBtn'), news: (b) => b.classList.contains('ready'), label: 'Inställningar' }
];
const moreGrid = moreLay.querySelector('.moreGrid');
MORE.forEach((m) => { const t = document.createElement('button'); t.type = 'button'; t.className = 'moreTile t-' + m.k; t.setAttribute('aria-label', m.label); moreGrid.appendChild(t); m.tile = t;
  t.addEventListener('click', (e) => { e.stopPropagation(); const b = m.el(); moreClose(true); if (b && !b.hidden) setTimeout(() => b.click(), 60); }); });
function moreFill() {
  MORE.forEach((m) => { const b = m.el(); if (!b) return; if (!m.filled) { const img = b.querySelector('img, svg'); if (img) { m.tile.innerHTML = ''; m.tile.appendChild(img.cloneNode(true)); m.tile.insertAdjacentHTML('beforeend', '<span class="ndot"></span>'); m.filled = true; } }
    m.tile.classList.toggle('news', m.news(b)); m.tile.classList.toggle('off', !!b.hidden); });
}
function moreOpen() {
  if (buyOn) return; Snd.init(); Snd.play('pop', { gain: 0.35, f: 700 }); moreFill(); moreLay.hidden = false; void moreLay.offsetWidth; moreLay.classList.add('open'); moreBtn.setAttribute('aria-expanded', 'true');
  target.copy(pip.position);
}
function moreClose(quiet) {
  if (moreLay.hidden) return; if (!quiet) Snd.play('swish', { gain: 0.25 }); moreLay.classList.remove('open'); moreBtn.setAttribute('aria-expanded', 'false');
  setTimeout(() => { if (!moreLay.classList.contains('open')) moreLay.hidden = true; }, 260);
}
[moreBtn, moreLay].forEach((el) => ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup'].forEach((ev) => el.addEventListener(ev, (e) => { e.stopPropagation(); }, { passive: true })));
moreBtn.addEventListener('click', (e) => { e.stopPropagation(); if (moreLay.hidden) moreOpen(); else moreClose(); });
moreLay.addEventListener('click', (e) => { e.stopPropagation(); if (e.target === moreLay) moreClose(); });
/* swipe the sheet down to close it */
{ let y0 = null; const sh = moreLay.querySelector('.moreSheet'); sh.addEventListener('pointerdown', (e) => { y0 = e.clientY; }); sh.addEventListener('pointerup', (e) => { if (y0 != null && e.clientY - y0 > 50) moreClose(); y0 = null; }); }
/* the corner button's dot: green when something can be bought, red for other news */
let moreT = 0;
function moreStep(dt) {
  moreT -= dt; if (moreT > 0) return; moreT = 0.5;
  let news = false, buy = false; MORE.forEach((m) => { const b = m.el(); if (b && !b.hidden && m.news(b)) { news = true; if (m.k === 'shop') buy = true; } });
  moreBtn.classList.toggle('news', news); moreBtn.classList.toggle('buy', buy && news);
  if (!moreLay.hidden) moreFill();
}
{ const s0 = storeStep; storeStep = function (dt) { s0(dt); moreStep(dt); }; }
if (window.__farmTest) window.__more = { open: () => moreOpen(), close: () => moreClose(), tap: (k) => { const m = MORE.find((q) => q.k === k); m.tile.click(); }, state: () => ({ shown: getComputedStyle(moreBtn).display, open: !moreLay.hidden, news: moreBtn.className }) };
