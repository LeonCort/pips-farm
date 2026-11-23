/* ---------- stars: the child picks the next animal ----------
   The hearts path is cut into short stretches of gear, helpers and farm upgrades (today's order, the animals taken out).
   Each stretch ends in a star. A star opens a picker with a balloon crate for every animal kind the farm doesn't have yet,
   and the child chooses which one comes. A picked animal's house joins the next stretch. More of a kind you already have
   is never bought: every meal a pen gets fills a ring round its nest, and when the ring is full a little one arrives,
   grown by the next morning (one more meal is needed for each one after). The sandbox keeps the old list. */
const STAR_KINDS = ['duck', 'sheep', 'cow', 'rabbit', 'goat', 'horse', 'alpaca', 'bull'];
const STAR_SIZES = [2, 3, 4, 5, 5, 5, 5, 5];
const STAR_HOUSE = { pig: 'house-pig', sheep: 'house-sheep', cow: 'house-cow', horse: 'house-horse', bull: 'house-bull' };
const Q_H0 = QUEUE.h.slice();
const starAnimalId = (id) => { const p = PADS.find((q) => q.id === id) || BPADS.find((q) => q.id === id); return p && (p.kind === 'animal' || p.kind === 'goat') ? (p.a || 'goat') : null; };
const STAR_HOUSES = Object.values(STAR_HOUSE);
/* the base path: everything on the old hearts list that is not an animal or an animal's own house (the hen house stays) */
const STAR_BASE = Q_H0.filter(([id]) => !starAnimalId(id) && !STAR_HOUSES.includes(id));
const starFirst = (k) => k === 'goat' ? 'goat1' : k + '1';
const stS2 = () => { if (!state.stars) { /* a farm from before: the kinds it already has count as stars already picked */
  state.stars = STAR_KINDS.filter((k) => qOwned(starFirst(k))); } return state.stars; };
let starKey = null;
function starSync() {
  if (SANDBOX || typeof state === 'undefined' || !state) return;
  const picks = stS2(), k = picks.join(','); if (k === starKey) return; starKey = k;
  const out = [], base = STAR_BASE.slice();
  /* an animal's house costs about what the stretch it lands in costs, so the order the animals came in doesn't matter */
  const nice = (v) => v < 100 ? Math.round(v / 5) * 5 : v < 1000 ? Math.round(v / 10) * 10 : Math.round(v / 50) * 50;
  const house = (id, items) => { const ps = items.map(([, c]) => c).filter((c) => c > 0), c = nice(ps.reduce((a, b) => a + b, 0) / Math.max(1, ps.length));
    Q_PRICE[id] = c; const p = PADS.find((q) => q.id === id); if (p) p.cost = c; out.push([id, c]); };
  STAR_SIZES.forEach((n, i) => {
    const items = base.splice(0, n);
    if (i === 2) house('house-pig', items);
    const prev = picks[i - 1]; if (prev && STAR_HOUSE[prev]) house(STAR_HOUSE[prev], items);
    items.forEach((q) => out.push(q));
    out.push(['star:' + (i + 1), 0]);
    if (picks[i]) out.push([starFirst(picks[i]), 0]);
  });
  const last = picks[STAR_SIZES.length - 1]; if (last && STAR_HOUSE[last]) house(STAR_HOUSE[last], base.slice(0, 5));
  base.forEach((q) => out.push(q));
  QUEUE.h.length = 0; out.filter(Boolean).forEach((q) => QUEUE.h.push(q));
}
{ const o0 = qOwned; qOwned = function (id) { if (id.startsWith('star:')) return !!stS2()[+id.slice(5) - 1]; return o0(id); }; }
{ const h0 = qHead; qHead = function (tr) { if (tr === 'h') starSync(); return h0(tr); }; }
const starHead = () => { if (SANDBOX || tutOn()) return 0; const h = qHead('h'); return h && h.startsWith('star:') ? +h.slice(5) : 0; };
const starLeft = () => STAR_KINDS.filter((k) => !stS2().includes(k) && !qOwned(starFirst(k)));
const starPic = (k) => k === 'goat' ? bmBPadPic(BPADS.find((q) => q.id === 'goat1')) : bmPadPic(PADS.find((q) => q.id === k + '1'));
const STAR_SVG = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3 L25 14 L37 15 L28 23 L31 35 L20 29 L9 35 L12 23 L3 15 L15 14 Z" fill="#f2c14a" stroke="#22303c" stroke-width="2.5" stroke-linejoin="round"/></svg>';
const starIcon = () => bmIcon('star', (x) => { x.translate(64, 66); x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 24 : 54, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fillStyle = '#f2c14a'; x.fill(); x.lineWidth = 7; x.lineJoin = 'round'; x.strokeStyle = PAL.ink; x.stroke(); });

/* ---------- the picker: a balloon crate per animal kind still to come ---------- */
{ const st = document.createElement('style'); st.textContent = `
.stPick { z-index: 32; align-items: center; }
.stPick .sheet { width: min(900px, 100%); display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 18px 18px 26px; background: #fff1c8; border: 4px solid #e6c46a; }
.stPick .sheetTop { width: 100%; justify-content: space-between; align-items: center; }
.stPick .bigStar { width: 76px; height: 76px; animation: stSpin 2.4s ease-in-out infinite; }
.stCrates { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px 18px; }
.stCrate { display: flex; flex-direction: column; align-items: center; background: none; border: 0; padding: 0; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.stCrate .bal { width: 52px; height: 72px; margin-bottom: -6px; animation: stBob 1.6s ease-in-out infinite; }
.stCrate .box { width: 132px; height: 120px; border-radius: 18px; border: 4px solid #22303c; background: #d29b5c; display: grid; place-items: center; box-shadow: 0 6px 0 rgba(34,48,60,0.25), inset 0 0 0 6px #b87d3f; position: relative; }
.stCrate .box::before { content: ''; position: absolute; left: 50%; top: -4px; bottom: -4px; width: 12px; transform: translateX(-50%); background: #e9684a; border-left: 3px solid #22303c; border-right: 3px solid #22303c; }
.stCrate .box i { position: relative; width: 96px; height: 96px; border-radius: 50%; background: #fffaf0; border: 3px solid #22303c; display: grid; place-items: center; }
.stCrate .box img { width: 78px; height: 78px; pointer-events: none; }
.stCrate:active .box { transform: translateY(4px); box-shadow: 0 2px 0 rgba(34,48,60,0.25); }
.stCrate:nth-child(2n) .bal { animation-delay: -0.6s; } .stCrate:nth-child(3n) .bal { animation-delay: -1.1s; }
.stBtn { position: fixed; top: max(14px, env(safe-area-inset-top, 0px)); right: calc(max(16px, env(safe-area-inset-right, 0px)) + 336px); width: 68px; height: 68px; border-radius: 50%; padding: 8px; z-index: 9; background: #fff7d6; border: 4px solid #22303c; box-shadow: 0 0 0 6px rgba(242,193,74,0.45); animation: stSpin 2.4s ease-in-out infinite; }
.stBtn[hidden] { display: none; } .stBtn svg { width: 100%; height: 100%; display: block; pointer-events: none; }
@keyframes stBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
@keyframes stSpin { 0%, 100% { transform: rotate(-8deg) scale(1); } 50% { transform: rotate(8deg) scale(1.08); } }
@media (max-width: 600px) { .stCrate .box { width: 104px; height: 96px; } .stCrate .box i { width: 76px; height: 76px; } .stCrate .box img { width: 60px; height: 60px; } .stBtn { right: calc(max(12px, env(safe-area-inset-right, 0px)) + 250px); width: 56px; height: 56px; } }
@media (prefers-reduced-motion: reduce) { .stCrate .bal, .stPick .bigStar, .stBtn { animation: none; } }
body.buyOn .stPick, body.buyOn .stBtn { display: none; }
`; document.head.appendChild(st); }
const STAR_BAL = ['#e9748f', '#7cc3e8', '#f2c14a', '#7cc36b', '#c79ae0', '#f39a5a', '#e9748f', '#7cc3e8'];
const starBal = (c) => '<svg class="bal" viewBox="0 0 70 96" aria-hidden="true"><ellipse cx="35" cy="32" rx="28" ry="31" fill="' + c + '" stroke="#22303c" stroke-width="3.5"/><path d="M30 62 L40 62 L35 68 Z" fill="#22303c"/><path d="M35 68 C30 78 40 84 35 96" fill="none" stroke="#22303c" stroke-width="2.5"/></svg>';
const stPick = document.createElement('div'); stPick.className = 'menu stPick'; stPick.hidden = true;
stPick.innerHTML = '<div class="sheet" role="dialog" aria-label="Välj ett nytt djur"><div class="sheetTop"><span style="width:60px"></span><div class="bigStar">' + STAR_SVG + '</div>'
  + '<button type="button" class="round" id="stClose" aria-label="Stäng"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M14 14 L34 34 M34 14 L14 34" stroke="#22303c" stroke-width="5" stroke-linecap="round"/></svg></button></div><div class="stCrates"></div></div>';
document.body.appendChild(stPick);
['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup'].forEach((ev) => stPick.addEventListener(ev, (e) => { e.stopPropagation(); }, { passive: true }));
const stBtn = document.createElement('button'); stBtn.type = 'button'; stBtn.className = 'stBtn'; stBtn.hidden = true; stBtn.setAttribute('aria-label', 'Välj ett nytt djur'); stBtn.innerHTML = STAR_SVG;
document.body.appendChild(stBtn);
stBtn.addEventListener('click', (e) => { e.stopPropagation(); starOpen(); });
function starOpen() {
  if (!starHead() || inHouse || trip || dressing || (typeof ED !== 'undefined' && ED.on)) return;
  if (buyOn) buyMode(false); if (typeof umClose === 'function') umClose(true); if (typeof closeMenu === 'function') closeMenu();
  const box = stPick.querySelector('.stCrates'); box.innerHTML = '';
  starLeft().forEach((k) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'stCrate'; b.setAttribute('aria-label', k);
    b.innerHTML = starBal(STAR_BAL[STAR_KINDS.indexOf(k)]) + '<div class="box"><i><img alt=""></i></div>'; b.querySelector('img').src = starPic(k);
    b.addEventListener('click', (e) => { e.stopPropagation(); starChoose(k); }); box.appendChild(b); });
  stPick.hidden = false; Snd.init(); Snd.play('whoosh', { gain: 0.3 }); Snd.play('sparkle', { gain: 0.4, n: 5 }, 0.15);
}
function starClose(quiet) { if (stPick.hidden) return; stPick.hidden = true; if (!quiet) Snd.play('swish', { gain: 0.3 }); }
stPick.addEventListener('click', (e) => { if (e.target === stPick) starClose(); });
stPick.querySelector('#stClose').addEventListener('click', (e) => { e.stopPropagation(); starClose(); });
function starChoose(k) {
  const n = starHead(); if (!n || !starLeft().includes(k)) return;
  stS2()[n - 1] = k; starKey = null; starSync(); starClose(true);
  const id = starFirst(k);
  if (k === 'goat') { const b = BPADS.find((q) => q.id === id); if (b && !barnS().owned[id]) buyBPad(b); }
  else { const p = PADS.find((q) => q.id === id); if (p && !state.owned[id]) unlock(p); }
  fanfare(true); confetti(pip.position.x, 1.4, pip.position.z, 80, 5);
  if (window.PipsLog) PipsLog.add('info', 'star ' + n + ': picked ' + k);
  save();
}
/* when a stretch is done the picker opens by itself (once); after that the star button waits at the top */
let starShown = 0, starT = 0;
function starStep(dt) {
  starT -= dt; if (starT > 0) return; starT = 0.4; starSync();
  const n = starHead(); stBtn.hidden = !n || inHouse || !!trip || buyOn;
  if (n && n !== starShown && !inHouse && !trip && !buyOn) { starShown = n; setTimeout(() => { fanfare(true); confetti(pip.position.x, 1.4, pip.position.z, 60, 4); starOpen(); }, 900); }
  if (!stPick.hidden && (!n || inHouse || trip)) starClose(true);
}

/* ---------- the unlock map: stretches end in stars; the stretch's things show in colour ---------- */
{ const st = document.createElement('style'); st.textContent = `
.umStop:not(.done) .umStk img { filter: none; opacity: 0.55; }
.umMile.stM .umStk { background: #fff7d6; }
.umMile.stM .umStk img { filter: none !important; opacity: 1 !important; }
.umMile .stPz { width: 96px; height: 92px; display: block; margin: 4px auto 0; }
`; document.head.appendChild(st); }
{ const p0 = umPaths; umPaths = function () { const P = p0(); if (SANDBOX) return P; starSync();
  const by = {}; P.h.forEach((s) => { by[s.id] = s; }); const h = qHead('h'), out = [];
  QUEUE.h.forEach(([id, cost]) => { if (by[id]) { out.push(by[id]); return; }
    if (!id.startsWith('star:')) return; const n = +id.slice(5), k = stS2()[n - 1];
    out.push({ id, tr: 'h', cost: 0, done: !!k, head: id === h, star: n, pick: k, pic: () => k ? starPic(k) : starIcon() }); });
  P.h = out; return P; }; }
{ const c0 = umChapters; umChapters = function (list) { if (SANDBOX || !list.some((s) => s.star)) return c0(list);
  const out = []; let cur = []; list.forEach((s) => { if (s.star) { out.push({ items: cur, mile: s }); cur = []; } else if (!starAnimalId(s.id) || !stS2().includes(starAnimalId(s.id))) cur.push(s); });
  if (cur.length) out.push({ items: cur, mile: null }); return out; }; }
/* the star card: a star cut in as many pieces as the stretch has things; each thing bought lays a piece */
function starPuzzle(n, got) {
  const cx = 48, cy = 48, pts = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 19 : 44, a = -Math.PI / 2 + i * Math.PI / 5; pts.push((cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + 4 + Math.sin(a) * r).toFixed(1)); }
  const star = 'M' + pts.join(' L') + ' Z', id = 'stc' + Math.random().toString(36).slice(2, 7); let w = '';
  for (let i = 0; i < n; i++) { const a0 = -Math.PI / 2 + i * 6.2832 / n, a1 = a0 + 6.2832 / n, R = 70;
    w += '<path d="M' + cx + ' ' + (cy + 4) + ' L' + (cx + Math.cos(a0) * R).toFixed(1) + ' ' + (cy + 4 + Math.sin(a0) * R).toFixed(1) + ' A' + R + ' ' + R + ' 0 0 1 ' + (cx + Math.cos(a1) * R).toFixed(1) + ' ' + (cy + 4 + Math.sin(a1) * R).toFixed(1) + ' Z" fill="' + (i < got ? '#f2c14a' : '#fbf3e2') + '" stroke="#c9b38c" stroke-width="2"/>'; }
  return '<svg class="stPz" viewBox="0 0 96 96" aria-hidden="true"><defs><clipPath id="' + id + '"><path d="' + star + '"/></clipPath></defs><g clip-path="url(#' + id + ')">' + w + '</g><path d="' + star + '" fill="none" stroke="#22303c" stroke-width="3.5" stroke-linejoin="round"/></svg>';
}
{ const r0 = umRender; umRender = function (force) { const k0 = UM.key; r0(force); if (SANDBOX || (UM.key === k0 && !force)) return;
  const P = umPaths(); umap.querySelectorAll('.umCol.h .umMile').forEach((el) => { const s = P.h[+el.dataset.i]; if (!s || !s.star) return; el.classList.add('stM');
    const ch = umChapters(P.h).find((c) => c.mile === s); const dots = el.querySelector('.umDots'), price = el.querySelector('.side');
    if (price && !s.done) price.remove();
    if (dots && ch) dots.outerHTML = starPuzzle(ch.items.length, ch.items.filter((q) => q.done).length); }); }; }
{ const t0 = umTap; umTap = function (b, s) { if (!s.star) return t0(b, s);
  if (s.head && !s.done) { Snd.play('pop', { gain: 0.35, f: 820 }); umClose(true); starOpen(); return; }
  Snd.play(s.done ? 'pop' : 'tock', { gain: 0.3, f: s.done ? 900 : 300 }); }; }

/* ---------- more of a kind: feed them and the family grows ---------- */
const FAM_MORE = {}; [...PADS, ...BPADS].forEach((p) => { const k = p.kind === 'animal' ? p.a : p.kind === 'goat' ? 'goat' : null; if (!k || p.id === starFirst(k)) return; (FAM_MORE[k] = FAM_MORE[k] || []).push(p); });
const famOwn = (p) => p.kind === 'goat' ? !!barnS().owned[p.id] : !!state.owned[p.id];
const famNext = (k) => animals.some((an) => an.a === k) ? (FAM_MORE[k] || []).find((p) => !famOwn(p)) || null : null;
const famNeed = (k) => 10 + 5 * (FAM_MORE[k] || []).filter(famOwn).length;
const famS = () => { if (!state.fam) state.fam = {}; return state.fam; };
const FAM_SP = {};
function famTex(k) { /* small and quiet: a thin ring that fills round a tiny nest */
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), n = famS()[k] || 0, need = famNeed(k);
  x.fillStyle = 'rgba(255,246,228,0.55)'; x.beginPath(); x.arc(64, 64, 52, 0, 7); x.fill();
  x.lineCap = 'round'; x.lineWidth = 9; x.strokeStyle = 'rgba(255,250,240,0.85)'; x.beginPath(); x.arc(64, 64, 52, 0, 7); x.stroke();
  if (n > 0) { x.strokeStyle = '#f2c14a'; x.beginPath(); x.arc(64, 64, 52, -Math.PI / 2, -Math.PI / 2 + 6.2832 * Math.min(1, n / need)); x.stroke(); }
  x.lineWidth = 2.5; x.strokeStyle = 'rgba(34,48,60,0.55)'; x.beginPath(); x.arc(64, 64, 57, 0, 7); x.stroke();
  x.fillStyle = '#c9965a'; x.strokeStyle = 'rgba(34,48,60,0.8)'; x.lineWidth = 3; x.beginPath(); x.ellipse(64, 78, 24, 8, 0, 0, 7); x.fill(); x.stroke();
  if (k === 'hen' || k === 'duck') { x.fillStyle = '#fffaf0'; x.beginPath(); x.ellipse(64, 63, 11, 14, 0, 0, 7); x.fill(); x.stroke(); }
  else drawIcon(x, k, 64, 60, 0.34);
  return new T.CanvasTexture(c);
}
/* it floats over the pen's little house (the goats': over the barn door) */
function famPos(k) { if (k === 'goat') return [BDOOR.x, BDOOR.z + 0.3, 2.9]; const h = housePos(k), pen = pens[k]; return [h[0], h[1], (pen && pen.big ? 1.4 : 0.95) + 0.55]; }
function famDraw(k) {
  const nx = famNext(k); let o = FAM_SP[k];
  if (!nx || tutOn() || SANDBOX) { if (o) o.sp.visible = false; return; }
  if (!o) { const sp = new T.Sprite(new T.SpriteMaterial({ map: famTex(k), depthWrite: false, transparent: true, opacity: 0.9 })); sp.scale.set(0.55, 0.55, 1); sp.renderOrder = 4; sc.add(sp); o = FAM_SP[k] = { sp, key: '' }; }
  const p = famPos(k); o.sp.position.set(p[0], p[2] + (reduced ? 0 : Math.sin(time * 1.5) * 0.03), p[1]); o.sp.visible = true;
  const key = (famS()[k] || 0) + '/' + famNeed(k); if (key !== o.key) { o.key = key; o.sp.material.map.dispose(); o.sp.material.map = famTex(k); }
}
function famMeal(k) {
  if (SANDBOX || tutOn()) return; const nx = famNext(k); if (!nx) return;
  const F = famS(); F[k] = (F[k] || 0) + 1; famDraw(k);
  if (F[k] >= famNeed(k)) { F[k] = 0; famBirth(k, nx); }
}
function famBirth(k, p) {
  const before = animals.filter((an) => an.a === k).length;
  if (p.kind === 'goat') buyBPad(p); else { state.owned[p.id] = true; delete state.paid[p.id]; build(p); }
  const mine = animals.filter((an) => an.a === k), an = mine[mine.length - 1]; if (!an || mine.length <= before) { save(); return; }
  if (!state.grow) state.grow = []; state.grow.push({ a: k, k: mine.length - 1, night: 0 });
  an.g.scale.setScalar(0.55); an.hop = 1;
  const w = famPos(k); confetti(w[0], w[2], w[1], 50, 3); burst(an.g.position.x, an.h, an.g.position.z, 10);
  Snd.play('success', { gain: 0.6, f: 'G6' }); Snd.play('sparkle', { gain: 0.5 }, 0.1); Snd.animal(k === 'goat' ? 'sheep' : k, { gain: 0.5, rate: 1.3 });
  if (window.PipsLog) PipsLog.add('info', 'family: a new ' + k + ' (' + p.id + ')');
  famDraw(k); save();
}
{ const f0 = feed; feed = function (an, m) { const fed = !!an.want; f0(an, m); if (fed) famMeal(an.a); }; }
/* little ones stay small until the next morning */
let famT = 0;
function famStep(dt) {
  famT -= dt; if (famT > 0) return; famT = 0.5; if (SANDBOX) return;
  const G = state.grow || []; let ch = false;
  for (let i = G.length - 1; i >= 0; i--) { const b = G[i], an = animals.filter((o) => o.a === b.a)[b.k]; if (!an) { G.splice(i, 1); ch = true; continue; }
    if (!morning()) { if (!b.night) { b.night = 1; ch = true; } }
    else if (b.night) { G.splice(i, 1); ch = true; an.g.scale.setScalar(1); an.hop = 1; burst(an.g.position.x, an.h, an.g.position.z, 6); continue; }
    if (!an.arr) an.g.scale.setScalar(0.55); }
  if (ch) save();
  Object.keys(FAM_MORE).forEach(famDraw);
}
{ const s0 = storeStep; storeStep = function (dt) { s0(dt); starStep(dt); famStep(dt); }; }
if (window.__farmTest) window.__stars = { head: () => starHead(), picks: () => stS2().slice(), left: () => starLeft(), open: () => starOpen(), on: () => !stPick.hidden, pick: (k) => starChoose(k),
  q: () => (starSync(), QUEUE.h).map(([id]) => id + (qOwned(id) ? '+' : '')).join(' '), fam: () => JSON.stringify(famS()), need: (k) => famNeed(k), next: (k) => (famNext(k) || {}).id || null, meal: (k, n) => { for (let i = 0; i < (n || 1); i++) famMeal(k); return JSON.stringify(famS()); }, grow: () => JSON.stringify(state.grow || []) };
