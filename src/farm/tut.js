/* ---------- the first day: a guided start for a new farm ----------
   A new game walks through the basics one step at a time, in this order: feed the animals, take eggs to the market,
   pick apples and sell them, buy the first thing in the store with hearts, feed the animals again, lead them
   into the barn at dusk, sleep in the tent, fetch them out in the morning, and then a present: coins for the first little house, bought on the spot at the tent.
   A picture card at the top shows the job (what to fetch -> where it goes) with dots that fill up, and a trail of the
   whole day ending in the present. The guide arrow follows the current job. Until the present is opened nothing can be
   bought on pads or spots (the house at its own step), the store opens at its step, and the clock waits for the jobs (afternoon holds until the
   buying is done, dusk comes on cue). Farms saved before this never see it: only a brand-new save gets state.tut. */
const TUT = [
  { id: 'feed', n: 3, a: 'grain', b: 'hen' },
  { id: 'egg', n: 2, a: 'egg', b: 'market' },
  { id: 'apple', n: 3, a: 'apple', b: 'market' },
  { id: 'buy', n: 1, a: 'heart', b: 'bag' },
  { id: 'feed2', n: 3, a: 'carrot', b: 'pig' },
  { id: 'barn', n: 1, a: 'pig', b: 'barn', badge: 'moon' },
  { id: 'bed', n: 1, a: 'moon', b: 'bed' },
  { id: 'out', n: 1, a: 'barn', b: 'pig', badge: 'sun' },
  { id: 'gift', n: 1, a: 'gift', b: 'coin' },
  { id: 'house', n: 1, a: 'coin', b: 'house' }
];
const TUT_GEAR = 10; /* coins for the first thing in the store (Pip's speedy boots) */
const tutS = () => state && state.tut && !state.tut.done ? state.tut : null;
const tutOn = () => !!tutS();
const tutId = () => { const t = tutS(); return t ? TUT[t.s].id : null; };
const tutAt = (id) => { const t = tutS(); return !!t && TUT.findIndex((q) => q.id === id) <= t.s; };
/* a brand-new save starts the first day; it gets the first pig for free, so the barn has someone to tuck in */
function tutFresh(s) { s.tut = { s: 0, n: 0 }; s.owned.pig1 = true; s.store = { size: 0, seenIn: 0, furn: {}, deco: {}, paid: {}, pend: [] }; return s; }

/* ---------- pictures ---------- */
const tutPic = (() => { const cache = {}; return (name) => {
  if (cache[name]) return cache[name];
  if (name === 'gift') return (cache[name] = GIFT_IMG || actIcon('house'));
  if (name === 'bag') { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.translate(64, 68); bagIcon(x, 1.7); return (cache[name] = c.toDataURL()); }
  return (cache[name] = actIcon(name)); }; })();
/* the job is Pip's own thought: a little cloud above Pip's head with the pictures (what to fetch -> where it goes) and dots
   that fill up, joined to the head by three small puffs. It follows Pip around the screen, so it stays small and never
   covers the top of the screen. */
{ const st = document.createElement('style'); st.textContent = `
.tut { position: fixed; left: 0; top: 0; width: 0; height: 0; z-index: 6; pointer-events: none; touch-action: none; user-select: none; -webkit-user-select: none; --s: 1; }
.tut[hidden] { display: none; }
.tut .bb { position: absolute; left: 0; bottom: 0; transform: translate(-50%, 0) scale(var(--s)); transform-origin: 50% 100%; pointer-events: auto; width: max-content; white-space: nowrap; transition: opacity 0.25s; }
.tut .cl { position: relative; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 7px 16px 8px; }
.tut .cl > b { position: absolute; display: block; border-radius: 999px; background: var(--paper, #fff6e4); }
.tut .cl > b.k { box-shadow: 0 0 0 3px var(--ink, #22303c); }
.tut .cl > b.k.p { box-shadow: 0 0 0 3px var(--ink, #22303c), 0 6px 0 1px rgba(34,48,60,0.22); }
.tut .cl > b.p { inset: 0; }
.tut .cl > b.a { width: 46px; height: 46px; left: 16px; top: -14px; }
.tut .cl > b.c { width: 36px; height: 36px; right: 22px; top: -11px; }
.tut .cl > .job, .tut .cl > .dots { position: relative; }
.tut .job { flex: none; display: flex; align-items: center; gap: 0; height: 58px; position: relative; }
.tut .job img { width: 64px; height: 64px; margin: -3px; display: block; flex: none; }
.tut .job .to { width: 22px; height: 22px; margin: 0 1px; flex: none; }
.tut .job .bd { position: absolute; right: -12px; top: -8px; width: 28px; height: 28px; border-radius: 50%; background: #fffaf0; border: 3px solid #22303c; box-sizing: border-box; padding: 2px; }
.tut .job .bd img { width: 100%; height: 100%; margin: 0; }
.tut .dots { display: flex; gap: 5px; height: 12px; align-items: center; }
.tut .dots:empty { display: none; }
.tut .dots i { width: 12px; height: 12px; border-radius: 50%; border: 2px solid #c9b38c; background: #fbf3e2; box-sizing: border-box; }
.tut .dots i.on { border-color: #22303c; background: #e0a646; animation: tutDot 0.4s cubic-bezier(.2,1.8,.4,1); }
.tut .tl { position: absolute; left: 0; top: 0; pointer-events: none; }
.tut .tl i { position: absolute; border-radius: 50%; background: var(--paper, #fff6e4); border: 3px solid var(--ink, #22303c); box-sizing: border-box; box-shadow: 0 2px 0 rgba(34,48,60,0.18); transition: opacity 0.25s; }
.tut .tl i:nth-child(1) { width: 10px; height: 10px; margin: -5px 0 0 -5px; }
.tut .tl i:nth-child(2) { width: 15px; height: 15px; margin: -7.5px 0 0 -7.5px; }
.tut .tl i:nth-child(3) { width: 21px; height: 21px; margin: -10.5px 0 0 -10.5px; }
.tut.dim .bb, .tut.dim .tl i { opacity: 0.15; }
.tut .bb { animation: tutBob 2.4s ease-in-out infinite; }
.tut.pop .cl { animation: tutPop 0.6s cubic-bezier(.2,1.6,.4,1); }
.tut.in .cl { animation: tutIn 0.45s cubic-bezier(.2,1.6,.4,1); }
.tut.bye .bb { animation: tutBye 0.7s ease-in forwards; } .tut.bye .tl { opacity: 0; transition: opacity 0.2s; }
.tutGift { position: fixed; inset: 0; z-index: 9; display: grid; place-items: center; background: rgba(255,246,228,0.0); pointer-events: none; }
.tutGift[hidden] { display: none; }
.tutGift .g { width: 220px; height: 220px; border-radius: 50%; background: #fffaf0; border: 5px solid #22303c; box-shadow: 0 8px 0 rgba(34,48,60,0.3), 0 0 0 18px rgba(242,193,74,0.35); display: grid; place-items: center; animation: tutGiftIn 2.6s ease-in-out forwards; }
.tutGift .g img { width: 160px; height: 160px; }
@keyframes tutDot { from { transform: scale(0.3); } }
@keyframes tutBob { 50% { margin-bottom: 4px; } }
@keyframes tutPop { 0% { transform: scale(1); } 35% { transform: scale(1.22); } 100% { transform: scale(1); } }
@keyframes tutIn { from { transform: scale(0.3); opacity: 0; } }
@keyframes tutBye { to { margin-bottom: 120px; opacity: 0; } }
@keyframes tutGiftIn { 0% { transform: scale(0.2) rotate(-12deg); opacity: 0; } 18% { transform: scale(1.1) rotate(4deg); opacity: 1; } 28% { transform: scale(1) rotate(0); } 80% { transform: scale(1); opacity: 1; } 100% { transform: scale(0.4) translateY(200px); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .tut .bb, .tut.pop .cl, .tut.in .cl, .tut .dots i.on, .tutGift .g { animation: none; } }
body.tutOn .stWish { display: none !important; }
body.tutOn.tutShop .stWish { display: block !important; }
`; document.head.appendChild(st); }
const tutEl = document.createElement('div'); tutEl.className = 'tut'; tutEl.hidden = true; tutEl.setAttribute('role', 'status');
tutEl.innerHTML = '<div class="tl"><i></i><i></i><i></i></div><div class="bb"><div class="cl"><b class="k p"></b><b class="k a"></b><b class="k c"></b><b class="p"></b><b class="a"></b><b class="c"></b><div class="job"></div><div class="dots"></div></div></div>';
document.body.appendChild(tutEl);
const tutBB = tutEl.querySelector('.bb'), tutPuffs = [...tutEl.querySelectorAll('.tl i')];
const tutGiftEl = document.createElement('div'); tutGiftEl.className = 'tutGift'; tutGiftEl.hidden = true; tutGiftEl.innerHTML = '<div class="g"><img alt=""></div>'; document.body.appendChild(tutGiftEl);
const TO_SVG = '<svg class="to" viewBox="0 0 30 30" aria-hidden="true"><path d="M4 15 H22 M15 7 L23 15 L15 23" fill="none" stroke="#22303c" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
let tutShown = '';
function tutRender(force) {
  const t = tutS(); document.body.classList.toggle('tutOn', !!t); if (!t) { tutEl.hidden = true; return; }
  const q = TUT[t.s], have = tutHave(), key = t.s + ':' + have + ':' + (dressing ? 1 : 0);
  const hide = !!dressing || !!trip || document.body.classList.contains('buyOn'); if (hide !== tutEl.hidden) { tutEl.hidden = hide; if (!hide) { tutEl.classList.remove('in'); void tutEl.offsetWidth; tutEl.classList.add('in'); tutPlace(); } }
  document.body.classList.toggle('tutShop', q.id === 'coin' || q.id === 'buy');
  if (key === tutShown && !force) return; const stepChanged = !tutShown.startsWith(t.s + ':'); tutShown = key;
  if (stepChanged || force) {
    tutEl.querySelector('.job').innerHTML = '<img alt="" src="' + tutPic(q.a) + '">' + (q.b ? TO_SVG + '<img alt="" src="' + tutPic(q.b) + '">' : '') + (q.badge ? '<span class="bd"><img alt="" src="' + actIcon(q.badge) + '"></span>' : '');
    tutEl.setAttribute('aria-label', 'Steg ' + (t.s + 1) + ' av ' + TUT.length);
    tutEl.querySelector('.dots').innerHTML = q.n > 1 ? Array.from({ length: q.n }, () => '<i></i>').join('') : '';
  }
  tutEl.querySelectorAll('.dots i').forEach((el, i) => { const on = i < have; if (on !== el.classList.contains('on')) el.classList.toggle('on', on); });
}
/* where the cloud sits: the puffs start just above Pip's head (or the top of a tall stack on Pip's back) and lead up and a
   little to the side, to the cloud. It is kept inside the screen and clear of the buttons along the top. */
const tutV = new T.Vector3();
function tutPlace() {
  if (tutEl.hidden || !tutS()) return;
  let top = 1.6; if (carry.items.length) { let y = 0.72; carry.items.forEach((m) => { y += ITEM_H[m.userData.type] || 0.3; }); top = Math.max(top, y * 0.6 + 0.9); }
  const px = pip.position.x, pz = pip.position.z;
  tutV.set(px, pip.position.y + top - (typeof curveDrop === 'function' ? curveDrop(px, pz) : 0), pz).project(cam);
  const r = wrap.getBoundingClientRect(), W = r.width, H = r.height, small = Math.min(W, H) < 560, s = H < 450 ? 0.7 : small ? 0.8 : 1;
  const hx = (tutV.x + 1) / 2 * W + r.left, hy = (1 - tutV.y) / 2 * H + r.top;
  const bw = 196 * s, bh = (82 + 16) * s, side = hx > r.left + W * 0.62 ? -1 : 1; /* the cloud leans away from the nearer edge */
  let bx = hx + side * 34 * s, by = hy - 40 * s; /* bx, by: the middle of the cloud's bottom edge */
  const topMin = r.top + (H < 450 ? 6 : small ? 74 : 86); /* (short screens: the cloud may sit between the buttons) */
  bx = Math.max(r.left + bw / 2 + 8, Math.min(r.left + W - bw / 2 - 8, bx)); by = Math.max(topMin + bh, Math.min(r.top + H - 10, by));
  tutEl.style.transform = 'translate(' + bx.toFixed(1) + 'px,' + by.toFixed(1) + 'px)'; tutEl.style.setProperty('--s', s);
  /* the three puffs, from the head (small) up to the cloud (bigger); they hide when the cloud had to move away from Pip */
  const far = Math.hypot(bx - hx, by - hy) > 90 * s, ex = bx - side * 30 * s, ey = by - 4 * s;
  tutPuffs.forEach((p, i) => { const k = [0.12, 0.42, 0.74][i], x = hx + (ex - hx) * k - bx, y = hy - 8 * s + (ey - hy + 8 * s) * k - by; p.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + s + ')'; p.style.visibility = far ? 'hidden' : ''; });
}
{ const f0 = fxFrame; fxFrame = function (dt) { f0(dt); tutPlace(); }; }
/* how far along the current step is (coins are counted from the purse, the rest from the events below) */
function tutHave() { const t = tutS(); if (!t) return 0; return TUT[t.s].id === 'coin' ? Math.min(shop().coins, TUT_GEAR) : t.n; }

/* ---------- moving on ---------- */
let tutHold = 0; /* a short pause between steps so the tick and the pop can be seen */
function tutCount(id, k) { const t = tutS(); if (!t || TUT[t.s].id !== id || tutHold > 0) return; t.n = Math.min(TUT[t.s].n, t.n + (k || 1)); tutRender(); if (t.n >= TUT[t.s].n) tutNext(); }
function tutNext() {
  const t = tutS(); if (!t) return;
  tutHold = 1.1; tutRender(true);
  tutEl.classList.remove('pop'); void tutEl.offsetWidth; tutEl.classList.add('pop');
  Snd.init(); Snd.play('success', { gain: 0.45, f: 'G6' }); Snd.play('sparkle', { gain: 0.35, n: 5 }, 0.08);
  if (!inHouse) confetti(pip.position.x, 1.6, pip.position.z, 22);
  setTimeout(() => { const t2 = tutS(); if (!t2 || t2 !== t) return; if (t.s >= TUT.length - 1) { tutFinish(); return; } t.s++; t.n = 0; tutEnter(); tutRender(true); save(); }, 900);
}
/* things that happen as a step begins */
let tutDusk = null, tutStepT = 0;
function tutEnter() {
  const id = tutId(); tutStepT = 0;
  if (id === 'barn') { const f = dayFrac(), day = Math.floor(state.clock / DAY); if (f < 0.585) tutDusk = { from: state.clock, to: day * DAY + DAY * 0.585, t: 0 }; }
  if (id === 'gift' && !(state.tut && state.tut.gave)) tutGiftMake();
}
/* the coins step is skipped over at once when the purse already holds enough */
function tutAuto() { const id = tutId(); if (id === 'coin' && shop().coins >= TUT_GEAR && tutHold <= 0) tutNext(); }

/* ---------- the clock waits for the jobs ---------- */
function tutClock(dt) {
  const id = tutId(); if (!id) return;
  const day = Math.floor(state.clock / DAY), f = dayFrac();
  if (tutDusk) { tutDusk.t += dt; const q = Math.min(1, tutDusk.t / 4.5), e = q * q * (3 - 2 * q); state.clock = tutDusk.from + (tutDusk.to - tutDusk.from) * e; if (q >= 1) tutDusk = null; return; }
  /* daytime jobs: the afternoon waits (the market stays open); evening jobs: dusk waits; morning jobs: the morning waits */
  const cap = tutAt('barn') ? (id === 'out' || id === 'gift' ? 0.4 : 0.66) : 0.42;
  if (f > cap && !sleep) state.clock = day * DAY + DAY * cap;
}

/* ---------- the present: a wrapped box by the tent; walking up to it opens it, and the little house is built ---------- */
let tutGift = null;
function tutGiftMake() {
  if (tutGift) return; const g = new T.Group(), x = HDOOR.x + 2.2, z = HDOOR.z + 2.0; g.position.set(x, 0, z); sc.add(g);
  part(fac(new T.BoxGeometry(0.9, 0.7, 0.9, 2, 2, 2), '#e9684a', 7101), g, 0, 0.35, 0);
  part(fac(new T.BoxGeometry(1.0, 0.18, 1.0), '#c4473a', 7102), g, 0, 0.78, 0);
  part(fac(new T.BoxGeometry(0.16, 0.74, 0.94), '#f2c14a', 7103), g, 0, 0.36, 0);
  part(fac(new T.BoxGeometry(0.94, 0.74, 0.16), '#f2c14a', 7104), g, 0, 0.36, 0);
  part(fac(new T.BoxGeometry(0.17, 0.2, 1.04), '#f2c14a', 7105), g, 0, 0.78, 0);
  [-1, 1].forEach((s) => { const b = new T.TorusGeometry(0.16, 0.05, 6, 12); b.rotateY(Math.PI / 2); b.rotateX(s * 0.6); part(fac(b, '#f2c14a', 7106), g, 0, 0.98, s * 0.14); });
  tutGift = { g, x, z, t: 0, open: false }; riseIn(g, 0.1, 0.8, true);
}
function tutGiftStep(dt) {
  const G = tutGift; if (!G) return; G.t += dt;
  if (!G.open) {
    G.g.rotation.y = reduced ? 0 : Math.sin(G.t * 2) * 0.15; G.g.position.y = reduced ? 0 : Math.abs(Math.sin(G.t * 3)) * 0.12;
    if (!inHouse && Math.hypot(pip.position.x - G.x, pip.position.z - G.z) < 1.25) {
      G.open = true; G.ot = 0; confetti(G.x, 1.0, G.z, 60); fanfare(true);
      tutGiftEl.querySelector('img').src = actIcon('coin'); tutGiftEl.hidden = false; setTimeout(() => { tutGiftEl.hidden = true; }, 2700);
      /* the present is a pile of coins: enough for the first little house, which Pip then buys at the tent like anything else */
      const gift = Math.max(60, SIZES[1].cost - shop().coins); if (state.tut) state.tut.gave = 1; earnCoins(gift); coinPill && flash(coinPill, 'bump');
      for (let k = 0; k < 12; k++) setTimeout(() => Snd.play('coin', { gain: 0.3 }, 0, 40), 120 + k * 90);
      save();
    }
  } else {
    G.ot += dt; const k = Math.min(1, G.ot / 0.5); G.g.scale.setScalar(Math.max(0.001, 1 + k * 0.4 - k * k * 1.4)); G.g.rotation.y += dt * 12;
    if (k >= 1 && G.g.parent) sc.remove(G.g);
    if (G.ot > 1.4) { tutGift = null; tutCount('gift'); }
  }
}
function tutFinish() {
  const t = state.tut; if (!t) return; t.done = true; t.s = TUT.length;
  tutEl.classList.add('bye'); setTimeout(() => { tutEl.hidden = true; tutEl.classList.remove('bye'); }, 750);
  document.body.classList.remove('tutOn', 'tutShop');
  /* everything opens up: pads come back */
  showPad(); showSPad(); save();
}

/* ---------- where the arrow points ---------- */
function tutGoal() {
  const id = tutId(); if (!id) return null;
  const outOf = () => inStore ? [SI.x, SI.z + 4.7] : inBarn ? [BI.x, BI.z + 5.2] : inHouse ? homeExit() : null;
  const crateEggs = CRATES[0].pile.count('egg'), vanGoods = van && van.pile.items.length;
  const anyFood = () => goal() || foodSpot(animals.find((an) => an.want) ? animals.find((an) => an.want).want : 'grain', animals.find((an) => an.want) ? animals.find((an) => an.want).a : 'hen');
  if (id === 'feed' || id === 'feed2') return outOf() || anyFood();
  if (id === 'egg') {
    if (outOf()) return outOf();
    if (carry.count('egg')) return stalls.egg ? sDrop('egg') : [SDROP.x, SDROP.z];
    if (van && van.st === 'there' && vanGoods && van.prod) return [van.prod.x, van.prod.z];
    if (crateEggs || (van && van.st !== 'home')) return van && van.st === 'home' ? [CRATES[0].x, CRATES[0].z + 1.2] : [SDROP.x, SDROP.z + 1.6];
    if (carry.items.some((m) => SRC[m.userData.type])) return goal() || anyFood();
    return animals.some((an) => an.a === 'hen' && an.want) ? anyFood() : [SDROP.x, SDROP.z + 1.6];
  }
  if (id === 'apple') {
    if (outOf()) return outOf(); const tr = trees.find(Boolean);
    if (carry.count('apple') && (carry.items.length >= cap() || !tr || !tr.pile.items.length)) return stalls.apple ? sDrop('apple') : [SDROP.x, SDROP.z];
    return tr ? [tr.x, tr.z] : [SDROP.x, SDROP.z];
  }
  if (id === 'coin') { if (outOf()) return outOf(); const mp = mPiles.filter((o) => o.n > 0).sort((a, b) => b.n - a.n)[0]; if (mp) return [mp.x, mp.z]; if (carriesGoods()) return [SDROP.x, SDROP.z]; const tr = trees.find((q) => q && q.pile.items.length); return tr ? [tr.x, tr.z] : [SDROP.x, SDROP.z + 1.6]; }
  if (id === 'buy') { const hp = Q_PRICE[qHead('h')] || 10; if (!inStore && state.coins < hp) return outOf() || anyFood(); if (inStore) { const c = cheapest(true); return c ? [c.s.padX, c.s.padZ] : [SI.x, SI.z + 4.7]; } return outOf() || [SDOOR.x, SDOOR.z]; }
  if (id === 'barn' || id === 'out') { if (inStore) return [SI.x, SI.z + 4.7]; if (inHouse && !inBarn) return homeExit(); return barnGoal() || (id === 'out' ? [BDOOR.x, BDOOR.z] : null); }
  if (id === 'bed') { if (inHouse && !inBarn && !inStore) return [bedRing.x, bedRing.z]; return outOf() || [HDOOR.x, HDOOR.z]; }
  if (id === 'gift') { if (outOf()) return outOf(); return tutGift && !tutGift.open ? [tutGift.x, tutGift.z] : null; }
  if (id === 'house') { if (outOf()) return outOf(); return [HRING.x, HRING.z]; }
  return null;
}
/* the arrow normally hides inside the house; during the first day it still shows the way (to the bed, or out again) */
const tutArrowIn = () => tutOn() && !!tutGoal();

/* ---------- hooks into the game ---------- */
{ const g0 = guideGoal; guideGoal = function () { if (tutOn()) return tutGoal(); return g0(); }; }
{ const f0 = feed; feed = function (an, m) { const was = !!(an && an.want); f0(an, m); if (was && !an.want) { tutCount('feed'); tutCount('feed2'); } }; }
{ const p0 = pipMarket; pipMarket = function (dt) { const e = carry.count('egg'), a = carry.count('apple'); p0(dt); if (!tutOn()) return; const de = e - carry.count('egg'), da = a - carry.count('apple'); if (de > 0 && inMarketTown()) tutCount('egg', de); if (da > 0 && inMarketTown()) tutCount('apple', da); }; }
{ const b0 = storeBuy; storeBuy = function (s, o) { b0(s, o); tutCount('buy'); }; }
{ const c0 = catBuy; catBuy = function (a) { const r = c0(a); if (r) tutCount('buy'); return r; }; }
/* nothing is bought on the spot (house, landmarks, room corners) until the first day is over */
{ const s0 = spotOffers; spotOffers = function () { if (!tutOn()) return s0(); return tutId() === 'house' ? s0().filter((o) => o.act && o.act.k === 'size') : []; }; }
/* the farm's heart pads wait too */
{ const n0 = nextPad; nextPad = function () { return tutOn() ? null : n0(); }; }
let tutSleptAt = -1, tutWasSleep = false, tutSkipT = 0;
function tutStep(dt) {
  if (!state.tut) return;
  const t = tutS(); if (!t) { if (!tutEl.hidden && !tutEl.classList.contains('bye')) tutEl.hidden = true; return; }
  tutStepT += dt; if (tutHold > 0) tutHold -= dt;
  tutClock(dt); tutAuto(); tutGiftStep(dt);
  const id = tutId();
  /* bedtime: everyone who sleeps in the barn is in; morning: everyone is back out */
  if (id === 'barn') { const big = animals.filter((an) => canBarn(an)); if (big.length && big.every((an) => an.inBarn) && !followers.length) tutCount('barn'); if (!big.length) tutCount('barn'); }
  if (sleep) tutWasSleep = true; else if (tutWasSleep) { tutWasSleep = false; tutCount('bed'); }
  if (id === 'out' && morning() && !animals.some((an) => an.inBarn) && !followers.length && !inBarn) tutCount('out');
  if (id === 'gift' && !tutGift && !t.gave) tutGiftMake();
  if (id === 'house' && stS() && stS().size >= 1 && !stS().pend.includes('size1') && !BUILD) tutCount('house');
  /* the coins step: if the market runs dry, the bunny at the counter tips the last few coins */
  if (id === 'coin' && tutStepT > 45 && tutHold <= 0 && !mPiles.some((o) => o.n > 0)) { tutStepT = 42; earnCoins(1); Snd.play('coin', { gain: 0.35 }); }
  tutRender(); tutEl.classList.toggle('dim', !spBtn.hidden); /* the buy bubble pops up near the top: the card steps back */
}
/* skip the first day: the cottage is given, the present is taken away, and everything opens up */
function tutSkip(quiet) { const t = tutS(); if (!t) return; const S = stS(); if (S && S.size < 1) { S.size = 1; S.pend.push('size1'); } if (tutGift) { sc.remove(tutGift.g); tutGift = null; } tutFinish(); if (!quiet) Snd.play('whoosh', { gain: 0.35 }); }
/* developer mode: a settings row 'Hoppa över första dagen'. When on, a running first day ends at once and new farms start without it. */
let tutOff = false; try { tutOff = localStorage.getItem('pips-notut') === '1'; } catch (e) {}
const tutOffBtn = (() => { const top = document.querySelector('#menu .sheetTop'); if (!top) return null;
  const b = document.createElement('button'); b.type = 'button'; b.className = 'round tutOffBtn'; b.id = 'tutOffBtn'; b.setAttribute('aria-label', 'Hoppa över första dagen'); b.setAttribute('aria-pressed', String(tutOff));
  b.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 12 L24 24 L9 36 Z M24 12 L39 24 L24 36 Z" fill="#fff6e4" stroke="#22303c" stroke-width="3" stroke-linejoin="round"/><path d="M41 11 V37" stroke="#22303c" stroke-width="4" stroke-linecap="round"/></svg>';
  const dev = document.getElementById('devBtn'); if (dev) top.insertBefore(b, dev.nextSibling); else top.appendChild(b);
  const st = document.createElement('style'); st.textContent = '#menu #tutOffBtn { order: 24; } #menu .sheetTop > #tutOffBtn::after { content: \'Hoppa över första dagen: av\'; } #menu .sheetTop > #tutOffBtn.on::after { content: \'Hoppa över första dagen: på\'; } #tutOffBtn.on { background: #e9f5df; }'; document.head.appendChild(st);
  b.addEventListener('click', (e) => { e.stopPropagation(); tutOff = !tutOff; try { localStorage.setItem('pips-notut', tutOff ? '1' : '0'); } catch (er) {} tutOffSync(); Snd.play('pop', { gain: 0.4, f: tutOff ? 900 : 500 }); if (tutOff) tutSkip(); });
  return b; })();
function tutOffSync() { if (!tutOffBtn) return; tutOffBtn.hidden = !devOn; tutOffBtn.classList.toggle('on', tutOff); tutOffBtn.setAttribute('aria-pressed', String(tutOff)); }
tutOffSync();
{ const d0 = setDev; setDev = function (on) { d0(on); tutOffSync(); }; }
/* grown-ups: press and hold the card for three seconds to skip the first day */
{ let hold = 0; const end = () => { clearTimeout(hold); hold = 0; };
  tutEl.addEventListener('pointerdown', (e) => { e.stopPropagation(); end(); hold = setTimeout(tutSkip, 3000); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => tutEl.addEventListener(ev, end));
  tutEl.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true }); }
{ const e0 = extrasStep; extrasStep = function (dt) { e0(dt); tutStep(dt); }; }
/* a saved first day picks up where it was left (the present comes back if it was not opened yet) */
function tutInit() { const t = tutS(); if (!t) return; if (tutOff && devOn) { tutSkip(true); return; } tutEnter(); tutRender(true); if (sPad) { sc.remove(sPad.g); sPad = null; } }
if (window.__farmTest) window.__tut = () => ({ s: tutS() ? tutS().s : -1, id: tutId(), n: tutS() ? tutS().n : 0, have: tutHave(), goal: tutGoal(), f: +dayFrac().toFixed(3), size: stS() && stS().size, pend: stS() && stS().pend.join(','),
  jump: (s) => { const t = tutS(); if (t) { t.s = s; t.n = 0; tutEnter(); tutRender(true); } }, next: () => tutNext(), gift: () => tutGift && [tutGift.x, tutGift.z], done: () => !!(state.tut && state.tut.done) });
/* test only: an autopilot goal for measuring a normal day (guide arrow by day, bed at night) and a snapshot of the purse and unlocks */
if (window.__farmTest) window.__auto = () => {
  let g = null;
  if (sleepy() && !barnGoal() && !sleep) g = inHouse && !inBarn && !inStore ? [bedRing.x, bedRing.z] : inStore ? [SI.x, SI.z + 4.7] : inBarn ? [BI.x, BI.z + 5.2] : [HDOOR.x, HDOOR.z];
  else g = (inHouse && !inBarn && !inStore && !barnGoal()) ? (guideGoal() || homeExit()) : guideGoal();
  return { g, clock: state.clock, hearts: state.coins, hTot: state.total, coins: shop().coins, cTot: shop().total, owned: Object.keys(state.owned), sOwned: Object.keys(shop().owned), lv: state.lv, size: stS() && stS().size, furn: stS() && Object.keys(stS().furn).length, deco: stS() && Object.keys(stS().deco).length, isle: stS() && Object.keys(stS().isle || {}), barn: Object.keys(barnS().owned), cat: stS() && stS().cat ? Object.keys(stS().cat.own).length : 0, n: animals.length };
};
if (window.__farmTest) window.__autoCat = () => { const c = cheapest(true); if (c && c.o.act) catBuy(c.o.act); if (typeof catClose === 'function') catClose(); return c && c.o.id; };
