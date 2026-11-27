/* ---------- Pip grows (Leon's idea list, 2026-11-23): every thing gathered gives stars (XP); a full star ring is a new
   level, and on each level the child picks one of three pictures: more energy (a longer bar), harder hits (things break
   sooner), or luck (now and then a clover: everything from that one comes twice).
   Leon, 2026-11-25: "a longer upgrade path". Two more pictures: quick feet (Pip walks faster) and a bigger backpack
   (two more places each time). Five pictures of five steps make 25 levels; each card still shows three, and which three
   turns with the level, so every picture keeps coming back until it is full. ---------- */
const XP_FOR = { crystal: 8, planks: 5, tree: 3, bush: 2, grass: 2, rock: 4, clay: 4, boulder: 8 };
const XP_PERK_MAX = 5;
const xpS = () => { const I = state.isle; if (!I.xp) I.xp = { n: 0, lv: 1, en: 0, hit: 0, luck: 0, pend: 0 }; return I.xp; };
const xpNeed = (lv) => 20 + 15 * (lv - 1);
function xpPow() { return 1 + 0.25 * xpS().hit; }
const xpLuck = () => 0.08 * xpS().luck;
const xpEn = () => 20 * xpS().en;
const xpRun = () => (state.isle && state.isle.xp && state.isle.xp.run) || 0, xpBag = () => (state.isle && state.isle.xp && state.isle.xp.bag) || 0;
const XP_PERKS = [['en', 'perkEn', 'Mer energi'], ['hit', 'perkHit', 'Hårdare slag'], ['luck', 'perkLuck', 'Tur'], ['run', 'perkRun', 'Snabbare fötter'], ['bag', 'perkBag', 'Större ryggsäck']];
function xpGain(v) {
  const X = xpS(); X.n += v;
  while (X.n >= xpNeed(X.lv)) { X.n -= xpNeed(X.lv); X.lv++; X.pend++; xpUpT = 0.6; }
  xpDraw();
}
let xpUpT = 0, xpLast = '';
/* the star badge in the energy pill: the level number in a star, and a gold ring round it that fills with each thing gathered */
const XPB = {};
function xpBuild() {
  if (XPB.el || !ENB.el) return;
  const st = document.createElement('style');
  st.textContent = '.xpb{position:relative;width:44px;height:44px;border-radius:50%;flex:none;margin-right:2px}.xpb canvas{position:absolute;inset:4px;width:36px;height:36px}'
    + '.xpb::after{content:"";position:absolute;inset:5px;border-radius:50%;background:var(--paper)}.xpb canvas{z-index:1}.xpb b{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;font:700 19px Fredoka,sans-serif;color:#fff6e4;padding-top:3px;-webkit-text-stroke:5px var(--ink);paint-order:stroke fill}.xpb.up{animation:invWig .5s ease-out}'
    + '.xpUp{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:rgba(34,48,60,.4);z-index:21;padding:16px}.xpUp[hidden]{display:none}'
    + '.xpUp .big{width:120px;height:120px;animation:xpSpin 1.2s ease-out}@keyframes xpSpin{0%{transform:scale(.2) rotate(-180deg)}70%{transform:scale(1.15) rotate(10deg)}100%{transform:none}}'
    + '.xpUp .row{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}'
    + '.xpUp button{width:140px;padding:10px 8px 12px;border-radius:24px;border:4px solid #6e4426;background:var(--paper);box-shadow:0 6px 0 rgba(34,48,60,.3);display:flex;flex-direction:column;align-items:center;gap:8px}'
    + '.xpUp button{animation:xpPick 1.6s ease-in-out infinite}.xpUp button:nth-child(2){animation-delay:.2s}.xpUp button:nth-child(3){animation-delay:.4s}@keyframes xpPick{0%,70%,100%{transform:none}80%{transform:translateY(-8px)}90%{transform:translateY(0)}}@media (prefers-reduced-motion: reduce){.xpUp button{animation:none}}'
    + '.xpUp button canvas{width:96px;height:96px}.xpUp button:active{transform:translateY(3px)}.xpUp button[disabled]{opacity:.45}'
    + '.xpUp .dots{display:flex;gap:4px}.xpUp .dots i{width:12px;height:12px;border-radius:50%;border:2.5px solid var(--ink);background:#e6d9bd}.xpUp .dots i.on{background:#f2c23c}'
    + '@media (max-width:520px){.xpUp button{width:104px}.xpUp button canvas{width:72px;height:72px}.xpb{width:36px;height:36px}.xpb canvas{inset:3px;width:30px;height:30px}.xpb b{font-size:14px}}';
  document.head.appendChild(st);
  const b = document.createElement('div'); b.className = 'xpb'; const c = document.createElement('canvas'); c.width = c.height = 64; isleIcon(c.getContext('2d'), 'star', 32, 32, 1.25);
  const n = document.createElement('b'); b.appendChild(c); b.appendChild(n); ENB.el.insertBefore(b, ENB.el.firstChild); XPB.el = b; XPB.n = n;
  ENB.el.style.paddingLeft = '3px';
  /* the level-up card */
  const m = document.createElement('div'); m.className = 'xpUp'; m.hidden = true; m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', 'Ny nivå');
  const big = document.createElement('canvas'); big.width = big.height = 160; big.className = 'big'; isleIcon(big.getContext('2d'), 'star', 80, 80, 3); m.appendChild(big); XPB.big = big;
  const row = document.createElement('div'); row.className = 'row'; m.appendChild(row); XPB.row = row;
  m.addEventListener('pointerdown', (e) => e.stopPropagation());
  document.body.appendChild(m); XPB.menu = m;
  xpDraw();
}
function xpDraw() {
  if (!XPB.el) return; const X = xpS(), f = X.n / xpNeed(X.lv), key = X.lv + ':' + Math.round(f * 40);
  if (key === xpLast) return; xpLast = key;
  XPB.n.textContent = String(X.lv);
  XPB.el.style.background = 'conic-gradient(#f2a13c ' + (f * 360).toFixed(0) + 'deg, #e6d9bd 0)';
}
function xpPicks() {
  const X = xpS(), row = XPB.row; row.textContent = '';
  const open = XP_PERKS.filter((q) => (X[q[0]] || 0) < XP_PERK_MAX), show = open.length <= 3 ? open : [0, 1, 2].map((q) => open[(X.lv + 3 + q) % open.length]);
  show.forEach(([k, ic, name]) => {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', name);
    const c = document.createElement('canvas'); c.width = c.height = 128; isleIcon(c.getContext('2d'), ic, 64, 64, 2.4); b.appendChild(c);
    const d = document.createElement('div'); d.className = 'dots'; for (let q = 0; q < XP_PERK_MAX; q++) { const i = document.createElement('i'); if (q < (X[k] || 0)) i.className = 'on'; d.appendChild(i); } b.appendChild(d);
    b.addEventListener('click', (e) => { e.stopPropagation(); xpPick(k); });
    row.appendChild(b);
  });
}
function xpPick(k) {
  const X = xpS(); if ((X[k] || 0) >= XP_PERK_MAX || X.pend <= 0) return;
  X[k] = (X[k] || 0) + 1; X.pend--; invDirty = true; if (k === 'en') { state.isle.en = Math.min(enMax(), state.isle.en + 20); enShow = -1; enBarW(); }
  save(); Snd.play('success', { gain: 0.45, f: 'E6' });
  if (X.pend > 0 && !xpFull()) xpPicks(); else { X.pend = 0; XPB.menu.hidden = true; }
}
/* every picture full (25 levels in): there is nothing left to pick, so a new level just fills the energy bar with a
   cheer instead of opening a card nobody can answer */
const xpFull = () => { const X = xpS(); return XP_PERKS.every((q) => (X[q[0]] || 0) >= XP_PERK_MAX); };
function xpTreat() {
  const X = xpS(); X.pend = 0; XPB.menu.hidden = true; xpUpT = 0;
  state.isle.en = enMax(); enShow = -1; enBarW(); save();
  XPB.el.classList.remove('up'); void XPB.el.offsetWidth; XPB.el.classList.add('up');
  Snd.play('success', { gain: 0.5, f: 'C6' }); Snd.play('sparkle', { gain: 0.45 }, 0.15); burst(pip.position.x, 1.4, pip.position.z, 12);
}
function xpStep(dt) {
  if (!XPB.el) return;
  const X = xpS();
  if (X.pend > 0 && xpFull()) { xpTreat(); return; }
  if (xpUpT > 0) { xpUpT -= dt; if (xpUpT <= 0 && X.pend > 0) xpShow(); }
  else if (X.pend > 0 && XPB.menu.hidden && !enSleep && !rising && (!BM.menu || BM.menu.hidden)) xpShow();
}
function xpShow() {
  if (enSleep || rising) { xpUpT = 1; return; }
  XPB.el.classList.remove('up'); void XPB.el.offsetWidth; XPB.el.classList.add('up');
  xpPicks(); XPB.menu.hidden = false; XPB.big.style.animation = 'none'; void XPB.big.offsetWidth; XPB.big.style.animation = '';
  Snd.play('success', { gain: 0.5, f: 'C6' }); Snd.play('sparkle', { gain: 0.45 }, 0.15); burst(pip.position.x, 1.4, pip.position.z, 12);
}
/* a lucky one: a clover pops over the thing and everything from it comes twice */
const luckSp = isleSprite(isleBubble('clover'), 0.85); luckSp.visible = false; sc.add(luckSp);
function xpLucky(n) {
  if (Math.random() >= xpLuck()) return false;
  luckSp.position.set(n.x, (HP_H[n.kind] || 1.2) + 0.6, n.z); luckSp.visible = true; luckSp.t = 1.6; Snd.play('sparkle', { gain: 0.5 }); return true;
}
function luckStep(dt) { if (!luckSp.visible) return; luckSp.t -= dt; luckSp.position.y += dt * 0.4; luckSp.material.opacity = Math.min(1, luckSp.t * 2); if (luckSp.t <= 0) luckSp.visible = false; }
