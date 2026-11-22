/* ---------- decorating the house: one decorate corner and one corner button, instead of a brush ring by every piece ----------
   In the bedroom, beside the mirror, stands a painter's easel with a ring in front of it. Standing on the ring opens the decorate book:
   one picture tab per room, and in the room every piece Pip has, each with the other pieces Pip owns for that place and its colours.
   Out in the rooms, when Pip walks up to a piece that can change, the round action button in the bottom-right corner shows that piece
   with a little brush; one tap opens the book on just that piece. Colours not bought yet show a coin and cost coins, as before. */
const DEC_AT = { x: 1.1, z: -5.35 - BED_D };
const decRing = mkRing(HX(DEC_AT.x), HZ(DEC_AT.z));
const DEC = { open: false, room: null, focus: null, latch: false, key: '' };
/* the easel: three legs, a canvas with paint on it, and a palette on the ledge */
const decEasel = painterGroup((Q) => {
  [[-0.3, 0.1, 0.12], [0.3, 0.1, -0.12]].forEach(([x, z, rz]) => Q(box(0.06, 1.55, 0.06).rotateZ(rz), CDK, 2751, x, 0.76, z));
  Q(box(0.06, 1.45, 0.06).rotateX(-0.32), CDK, 2752, 0, 0.7, -0.26);
  Q(box(0.82, 0.05, 0.14), CWD, 2753, 0, 0.66, 0.1);
  Q(box(0.74, 0.62, 0.04), '#fffaf0', 2754, 0, 1.02, 0.08);
  [['#e9684a', -0.18, 1.12], ['#5a7fb0', 0.12, 1.18], ['#74a857', 0.02, 0.9], ['#f2c14a', 0.2, 0.92]].forEach(([c, x, y], k) => Q(cy_(0.09, 0.09, 0.01, 12).rotateX(Math.PI / 2), c, 2755 + k, x, y, 0.105));
  Q(cy_(0.17, 0.17, 0.02, 14).scale(1.25, 1, 0.9), '#d9b27a', 2760, -0.1, 0.7, 0.14);
  [['#e9684a', -0.22], ['#74a857', -0.1], ['#5a9fc4', 0.02]].forEach(([c, x], k) => Q(new T.SphereGeometry(0.035, 6, 4).scale(1, 0.5, 1), c, 2761 + k, x, 0.72, 0.17));
});
decEasel.position.set(HX(1.15), 0, HZ(-6.55 - BED_D)); sc.add(decEasel);

/* ---------- the book ---------- */
{ const st = document.createElement('style'); st.textContent = `
.dec{position:fixed;inset:0;z-index:45;background:rgba(58,40,28,.5);display:flex;align-items:center;justify-content:center;font-family:Fredoka,system-ui,sans-serif;color:#3a2e2a;-webkit-user-select:none;user-select:none}
.dec[hidden]{display:none}
.dec button{font-family:inherit;cursor:pointer;color:inherit;padding:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.dec .dp{width:min(96vw,980px);max-height:min(92vh,720px);box-sizing:border-box;background:#fff6e4;border:4px solid #3a2e2a;border-radius:28px;padding:14px 16px;display:flex;flex-direction:column;gap:12px;box-shadow:0 10px 0 rgba(0,0,0,.25);animation:decIn .28s cubic-bezier(.2,1.4,.4,1)}
.dec.one .dp{width:auto;max-width:96vw}
@keyframes decIn{from{transform:scale(.85);opacity:0}}
.dec .dh{display:flex;align-items:center;gap:10px}
.dec .tabs{flex:1;display:flex;gap:10px;overflow-x:auto;padding:4px 2px 8px;min-width:0}
.dec .tab{flex:none;width:76px;height:76px;border-radius:22px;border:4px solid #3a2e2a;background:#fffaf0;display:grid;place-items:center;box-shadow:0 4px 0 #3a2e2a}
.dec .tab img{width:62px;height:62px}
.dec .tab.on{background:#f2c14a;transform:translateY(2px);box-shadow:0 2px 0 #3a2e2a}
.dec .pill{flex:none;display:flex;align-items:center;gap:6px;background:#fffaf0;border:4px solid #3a2e2a;border-radius:999px;padding:4px 14px 4px 6px;font-size:26px;font-weight:700}
.dec .pill svg{width:30px;height:30px}
.dec .ok{flex:none;width:76px;height:76px;border-radius:50%;border:4px solid #1f4d3a;background:#3f9a62;display:grid;place-items:center;box-shadow:0 5px 0 #1f4d3a}
.dec .ok svg{width:44px;height:44px}
.dec .ok:active,.dec .tab:active{transform:translateY(3px)}
.dec .db{overflow-y:auto;min-height:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(400px,1fr));gap:12px;padding:2px}
.dec.one .db{grid-template-columns:1fr}
.dec .dc{display:flex;align-items:center;gap:12px;padding:10px;border:4px solid #3a2e2a;border-radius:20px;background:#fffaf0}
.dec .dc.flash{animation:decFl .5s}
@keyframes decFl{40%{background:#ecfae2;transform:scale(1.02)}}
.dec .dc.wait{opacity:.5}
.dec .big{flex:none;width:112px;height:112px;border-radius:16px;background:#f3e6cb;display:grid;place-items:center}
.dec .big img{width:104px;height:104px}
.dec .ch{display:flex;flex-direction:column;gap:10px;min-width:0}
.dec .row{display:flex;flex-wrap:wrap;gap:8px}
.dec .tp{width:72px;height:72px;border-radius:16px;border:4px solid #3a2e2a;background:#fffaf0;display:grid;place-items:center}
.dec .tp img{width:62px;height:62px}
.dec .tp.on{border-color:#3f7d62;box-shadow:0 0 0 4px #bfe6a8}
.dec .sw{position:relative;width:52px;height:52px;border-radius:50%;border:4px solid #3a2e2a}
.dec .sw.on{box-shadow:0 0 0 4px #bfe6a8}
.dec .sw.on::after{content:'';position:absolute;inset:10px;border-radius:50%;background:#fffaf0;opacity:.85}
.dec .sw.buy{opacity:.45;border-style:dashed}
.dec .sw.buy.ok{opacity:1;border-style:solid;box-shadow:0 0 0 4px #ffe28a}
.dec .sw.buy svg{position:absolute;right:-9px;top:-9px;width:26px;height:26px}
.dec .sw.no{animation:spNo .35s}
.dec.one .big{width:150px;height:150px}.dec.one .big img{width:140px;height:140px}
.dec.one .tp{width:88px;height:88px}.dec.one .tp img{width:76px;height:76px}.dec.one .sw{width:62px;height:62px}
@media (max-width:560px),(max-height:520px){.dec .db{grid-template-columns:1fr}.dec .big{width:84px;height:84px}.dec .big img{width:78px;height:78px}.dec .tp{width:60px;height:60px}.dec .tp img{width:52px;height:52px}.dec .sw{width:44px;height:44px}.dec .tab,.dec .ok{width:62px;height:62px}.dec .tab img{width:50px;height:50px}.dec .pill{font-size:20px}}
.act.deco{position:relative;background:#fff6dc;border-color:#c9862c;animation:pop .25s ease-out,decBob 1.6s ease-in-out .25s infinite}
.act.deco::after{content:'';position:absolute;right:-6px;top:-6px;width:40px;height:40px;border-radius:50%;background:#fff6e4 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M14 3 L21 10 L13 18 L6 11 Z' fill='%23f2c14a' stroke='%2322303c' stroke-width='2' stroke-linejoin='round'/%3E%3Cpath d='M6 11 Q2 14 3 21 Q10 22 13 18' fill='%23e9684a' stroke='%2322303c' stroke-width='2' stroke-linejoin='round'/%3E%3C/svg%3E") center/26px no-repeat;border:3px solid #22303c;box-sizing:border-box}
@keyframes decBob{50%{transform:translateY(-4px)}}
@media (prefers-reduced-motion:reduce){.act.deco,.dec .dp{animation:none}}
`; document.head.appendChild(st); }
const decEl = document.createElement('div'); decEl.className = 'dec'; decEl.hidden = true; document.body.appendChild(decEl);
['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'wheel'].forEach((ev) => decEl.addEventListener(ev, (e) => e.stopPropagation(), { passive: true }));
const OK_ICO = '<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M8 17 L14 23 L26 10" fill="none" stroke="#fffaf0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* the pieces Pip can change: owned, in a room that is built; a piece on its way from the store waits */
const decOwned = (s) => roomOpen(s.room) && !!catS().own[s.id] && !!catS().eq[s.id];
const decWait = (s) => stS().pend.includes('c:' + s.id);
const decRooms = () => CROOMS.filter((r) => roomOpen(r) && r.sp.some(decOwned));
function decCard(s) {
  const C = catS(), e = C.eq[s.id], o = C.own[s.id], wait = decWait(s), coins = shop().coins;
  const types = [0, 1, 2, 3].filter((t) => o[t]);
  const tp = types.length > 1 ? `<div class="row">${types.map((t) => `<button type="button" class="tp${e[0] === t ? ' on' : ''}" data-s="${s.id}" data-t="${t}" aria-label="Välj"><img src="${catThumb(s.fam, t, e[0] === t ? e[1] : o[t][0])}" alt=""></button>`).join('')}</div>` : '';
  const sw = `<div class="row">${CFAM[s.fam].cols.map((c, k) => o[e[0]].includes(k)
    ? `<button type="button" class="sw${e[1] === k ? ' on' : ''}" style="background:${c}" data-s="${s.id}" data-c="${k}" aria-label="Färg"></button>`
    : `<button type="button" class="sw buy${coins >= colCost(s, e[0]) ? ' ok' : ''}" style="background:${c}" data-s="${s.id}" data-b="${k}" aria-label="Köp färg">${ICO.coin}</button>`).join('')}</div>`;
  return `<div class="dc${wait ? ' wait' : ''}" data-card="${s.id}"><div class="big"><img src="${catThumb(s.fam, e[0], e[1])}" alt=""></div><div class="ch">${wait ? '' : tp + sw}</div></div>`;
}
function decRender() {
  if (!DEC.open) { decEl.hidden = true; return; }
  const one = DEC.focus ? CSPOT[DEC.focus] : null, rooms = decRooms();
  if (!one && (!DEC.room || !rooms.includes(DEC.room))) DEC.room = rooms[0] || null;
  const tabs = one ? '<div class="tabs"></div>' : `<div class="tabs">${rooms.map((r) => `<button type="button" class="tab${r === DEC.room ? ' on' : ''}" data-r="${r.id}" aria-label="Rum"><img src="${roomIcon(r)}" alt=""></button>`).join('')}</div>`;
  const list = one ? [one] : DEC.room ? DEC.room.sp.filter(decOwned) : [];
  decEl.classList.toggle('one', !!one);
  decEl.innerHTML = `<div class="dp"><div class="dh">${tabs}<span class="pill">${ICO.coin}${fmtC(shop().coins)}</span><button type="button" class="ok" data-x="1" aria-label="Klar">${OK_ICO}</button></div><div class="db">${list.map(decCard).join('')}</div></div>`;
  decEl.hidden = false; DEC.key = decKey();
}
const decKey = () => (DEC.open ? JSON.stringify(catS()) + stS().pend.join() + shop().coins + (DEC.room && DEC.room.id) + DEC.focus : '');
function decOpen(focus) {
  if (DEC.open || !stS()) return; DEC.open = true; DEC.focus = focus || null; if (focus) DEC.room = CSPOT[focus].room;
  target.copy(pip.position); Snd.play('pop', { gain: 0.4, f: 560 }); Snd.play('sparkle', { gain: 0.25, n: 4 }, 0.05); decRender();
}
function decClose() { if (!DEC.open) return; DEC.open = false; DEC.focus = null; decEl.hidden = true; Snd.play('pop', { gain: 0.3, f: 420 }); }
decEl.addEventListener('click', (ev) => {
  ev.stopPropagation(); Snd.init(); const b = ev.target.closest('button');
  if (!b) { if (ev.target === decEl) decClose(); return; }
  if (b.dataset.x) return decClose();
  if (b.dataset.r) { DEC.room = CROOMS.find((r) => r.id === b.dataset.r) || DEC.room; Snd.play('tick', { gain: 0.3, f: 700 }); return decRender(); }
  const id = b.dataset.s, C = catS(), o = id && C.own[id]; if (!o || decWait(CSPOT[id])) return;
  if (b.dataset.b != null) { if (!catBuy({ k: 'col', s: id, t: C.eq[id][0], c: +b.dataset.b })) { b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); } else decRender(); return; }
  if (b.dataset.t != null) { const t = +b.dataset.t; if (C.eq[id][0] === t) return; C.eq[id] = [t, o[t].includes(C.eq[id][1]) ? C.eq[id][1] : o[t][0]]; }
  else if (b.dataset.c != null) { const c = +b.dataset.c; if (C.eq[id][1] === c) return; C.eq[id] = [C.eq[id][0], c]; }
  const g = applySpot(id); if (g) { riseIn(g, 0, 0.45, true); const s = CSPOT[id]; confetti(HX(s.x), 0.8, HZ(s.z), 16, 2.6); }
  Snd.play('pop', { gain: 0.4, f: 720 }); Snd.play('sparkle', { gain: 0.3, n: 4 }, 0.04); save(); decRender();
  const card = decEl.querySelector(`[data-card="${id}"]`); if (card) card.classList.add('flash');
});

/* ---------- the corner button: the piece Pip stands by ---------- */
const decHome = () => inHouse && !inBarn && !inStore && !isTent() && catReady && !!stS();
function decNear() {
  if (!decHome() || DEC.open || (typeof ED !== 'undefined' && ED.on) || BUILD) return null;
  const px = pip.position.x, pz = pip.position.z; let best = null, bd = 1e9;
  Object.values(CSPOT).forEach((s) => { if (!decOwned(s) || decWait(s)) return; const [rx, rz] = spotRing(s);
    const d = Math.min(Math.hypot(px - HX(s.x), pz - HZ(s.z)) - (s.fam === 'bed' || s.fam === 'rug' ? 0.9 : 0.5), Math.hypot(px - HX(rx), pz - HZ(rz)));
    if (d < 0.75 && d < bd) { bd = d; best = s; } });
  return best;
}
/* it goes first, so it sits in the corner spot; the helper-room button moves one step left */
{ const f0 = findActs; findActs = function () { const out = f0(), s = decNear(); if (!s) return out; const e = catS().eq[s.id];
  out.unshift({ icon: catThumb(s.fam, e[0], e[1]), label: 'Ändra ' + s.id + ':' + e.join(), deco: true, run: () => decOpen(s.id) }); return out.slice(0, 2); }; }

/* ---------- every frame ---------- */
function decStep() {
  const home = decHome(); decRing.r.visible = home; decRing.f.visible = home; decEasel.visible = home;
  if (DEC.open) { if (!home) decClose(); else { target.copy(pip.position); if (decKey() !== DEC.key) decRender(); } }
  const on = home && Math.hypot(pip.position.x - decRing.x, pip.position.z - decRing.z) < 0.6, still = Math.hypot(target.x - pip.position.x, target.z - pip.position.z) < 0.15;
  decRing.f.scale.setScalar(DEC.open && !DEC.focus ? 1 : 0.001);
  if (on && still && !DEC.latch && !DEC.open && !(typeof ED !== 'undefined' && ED.on) && doorT <= 0) { DEC.latch = true; decOpen(null); }
  if (!on) DEC.latch = false;
  const a = $('actA'); if (a) a.classList.toggle('deco', !a.hidden && !!(acts[0] && acts[0].deco));
}
{ const s0 = storeStep; storeStep = function (dt) { s0(dt); decStep(dt); }; }
if (window.__farmTest) window.__dec = { open: (f) => decOpen(f), close: () => decClose(), ring: () => [decRing.x, decRing.z], near: () => { const s = decNear(); return s && s.id; }, state: () => ({ open: DEC.open, focus: DEC.focus, room: DEC.room && DEC.room.id, cards: decEl.querySelectorAll('.dc').length, tabs: decEl.querySelectorAll('.tab').length }), tap: (sel) => { const b = decEl.querySelector(sel); if (b) b.click(); return !!b; } };
