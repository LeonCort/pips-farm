/* ---------- Pip's backpack (Leon, 2026-11-28: "a character inventory screen where you can see all the things that the
   player has unlocked and also tease up things that can be unlocked later on") ----------
   A round backpack button under the map opens a wooden shelf board. Pictures only, one shelf each:
     axes      hand axe, double axe, bow saw, great saw (the tool families, tiers.js)
     picks     hand pick, mattock, rock drill, chime hammer
     gear      backpack, torch, raincoat, snow boots, lantern, scooter, and the three keys (rope, map, ice pick)
     finds     honey, copper, iron, star crystal, reeds, pearls, ember, frost flower (the first one found, finds.js)
     gifts     the seven golden gifts from the hidden worlds (gold.js)
   What Pip has is in full colour; what is still out there is a dark shape on a dashed slot, so it can be guessed but not
   seen. The tool Pip holds now has a gold ring and its sharpness as dots; the next tool of each family twinkles.
   Tapping a thing wiggles it with a little sound; tapping a find opens the map with where it is found.
   Drawn when it opens: it costs nothing while shut. */
const PK = { btn: null, el: null, board: null, img: {} };
const PK_GOLD = { comb: 'gold_comb', hammer: 'gold_hammer', lily: 'gold_lily', sun: 'gold_sun', glass: 'gold_glass', shipbell: 'gold_shipbell', starheart: 'gold_starheart' };
/* ---- the golden gifts as pictures, in the same gold as on their pedestals ---- */
{
  const G = '#f6c63c', D = '#c9901f', H = '#fff2b0';
  const fill = (x, c) => { x.fillStyle = c; x.fill(); x.stroke(); };
  const shine = (x, a, b, r) => { x.fillStyle = H; x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); };
  const hex = (x, a, b, r) => { x.beginPath(); for (let q = 0; q < 6; q++) { const an = q / 6 * Math.PI * 2 + Math.PI / 6; x.lineTo(a + Math.cos(an) * r, b + Math.sin(an) * r); } x.closePath(); };
  ISLE_ICON.gold_comb = (x) => { [[0, -15], [-11, -8], [11, -8], [0, -1], [-11, 6], [11, 6], [0, 13]].forEach(([a, b], k) => { hex(x, a, b, 7.4); fill(x, k % 2 ? D : G); }); shine(x, -3, -17, 2.4); };
  ISLE_ICON.gold_hammer = (x) => { x.beginPath(); x.roundRect(-4, -4, 8, 26, 3); fill(x, D); x.beginPath(); x.roundRect(-19, -20, 38, 18, 4); fill(x, G); x.beginPath(); x.moveTo(-15, -15); x.lineTo(6, -15); x.lineWidth = 3; x.strokeStyle = H; x.stroke(); x.strokeStyle = '#3a2414'; };
  ISLE_ICON.gold_lily = (x) => { for (let k = 0; k < 6; k++) { x.save(); x.rotate(k / 6 * Math.PI * 2); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-8, -10, 0, -21); x.quadraticCurveTo(8, -10, 0, 0); fill(x, k % 2 ? D : G); x.restore(); } x.beginPath(); x.arc(0, 0, 5.5, 0, 7); fill(x, H); };
  ISLE_ICON.gold_sun = (x) => { for (let k = 0; k < 8; k++) { x.save(); x.rotate(k / 8 * Math.PI * 2); x.beginPath(); x.moveTo(-5, -13); x.lineTo(0, -23); x.lineTo(5, -13); x.closePath(); fill(x, D); x.restore(); } x.beginPath(); x.arc(0, 0, 13, 0, 7); fill(x, G); shine(x, -4, -5, 3.4); };
  ISLE_ICON.gold_glass = (x) => { x.beginPath(); x.moveTo(-5, -21); x.lineTo(5, -21); x.lineTo(5, -10); x.quadraticCurveTo(17, -4, 16, 8); x.quadraticCurveTo(14, 20, 0, 20); x.quadraticCurveTo(-14, 20, -16, 8); x.quadraticCurveTo(-17, -4, -5, -10); x.closePath(); fill(x, G);
    x.beginPath(); x.roundRect(-7, -24, 14, 5, 2); fill(x, D); x.beginPath(); x.moveTo(-9, 2); x.quadraticCurveTo(-9, -4, -4, -6); x.lineWidth = 3; x.strokeStyle = H; x.stroke(); x.strokeStyle = '#3a2414'; };
  ISLE_ICON.gold_shipbell = (x) => { x.beginPath(); x.roundRect(-4, -24, 8, 7, 3); fill(x, D); x.beginPath(); x.moveTo(-9, -17); x.quadraticCurveTo(-11, 4, -20, 12); x.lineTo(20, 12); x.quadraticCurveTo(11, 4, 9, -17); x.closePath(); fill(x, G);
    x.beginPath(); x.roundRect(-21, 10, 42, 6, 3); fill(x, D); x.beginPath(); x.arc(0, 19, 4, 0, 7); fill(x, D); x.beginPath(); x.moveTo(-5, -12); x.quadraticCurveTo(-7, 0, -12, 6); x.lineWidth = 3; x.strokeStyle = H; x.stroke(); x.strokeStyle = '#3a2414'; };
  ISLE_ICON.gold_starheart = (x) => { [0, 1, 2, 3].forEach((k) => { x.save(); x.rotate(k * Math.PI / 2 + Math.PI / 4); x.beginPath(); x.moveTo(0, -24); x.lineTo(4, -14); x.lineTo(0, -10); x.lineTo(-4, -14); x.closePath(); fill(x, D); x.restore(); });
    x.beginPath(); x.moveTo(0, -20); x.lineTo(11, 0); x.lineTo(0, 20); x.lineTo(-11, 0); x.closePath(); fill(x, G); x.beginPath(); x.moveTo(0, -20); x.lineTo(0, 20); x.moveTo(-11, 0); x.lineTo(11, 0); x.lineWidth = 1.8; x.strokeStyle = D; x.stroke(); x.strokeStyle = '#3a2414'; shine(x, -3, -7, 2.6); };
  /* the button: a backpack with a strap and a buckle */
  ISLE_ICON.packBtn = (x) => { x.beginPath(); x.moveTo(-9, -14); x.quadraticCurveTo(0, -27, 9, -14); x.lineWidth = 5; x.stroke(); x.lineWidth = 3;
    x.beginPath(); x.roundRect(-18, -15, 36, 37, 11); fill(x, '#d9734a'); x.beginPath(); x.roundRect(-12, 2, 24, 15, 5); fill(x, '#c25e38');
    x.beginPath(); x.moveTo(-18, -4); x.quadraticCurveTo(0, 4, 18, -4); x.lineTo(18, -10); x.quadraticCurveTo(0, -2, -18, -10); x.closePath(); fill(x, '#e9906a');
    x.beginPath(); x.roundRect(-4, -4, 8, 8, 2); fill(x, '#f2c23c'); x.fillStyle = '#f6b08e'; x.beginPath(); x.arc(-11, -11, 2.4, 0, 7); x.fill(); };
}
/* the shelves: [picture, has it, the next one to get (twinkles), the one in hand (gold ring + sharpness), what a tap does] */
function packRows() {
  const I = state.isle, T0 = toolTierNow(), pick = !!(I.tools && I.tools.pick), F1 = I.first || {}, K = lkeys(), G = golds();
  const tool = (fam, ok) => [1, 2, 3, 4].map((t) => { const has = ok && T0 >= t; return { t: fam + (t > 1 ? t : ''), has, next: ok ? t === T0 + 1 : t === 1, hand: has && t === T0 ? bldLv(fam) : 0 }; });
  const gear = [{ t: 'bag', has: !!(I.tools && I.tools.bag) }].concat(['torch', 'coat', 'boots', 'lantern', 'scooter'].map((k) => ({ t: k, has: gearHas(k) })), ['rope', 'map', 'icepick'].map((k) => ({ t: k, has: (K[k] || 0) >= 1 })));
  return [
    tool('axe', true),
    tool('pick', pick),
    gear,
    FINDS.map((t) => ({ t, has: !!F1[t] || (I.store[t] || 0) > 0, find: 1 })),
    GOLD.map((g) => ({ t: PK_GOLD[g.id], has: !!G[g.id], gold: 1 }))
  ];
}
/* one picture in full colour, or a dark shape of it */
function packPic(t, dark) {
  const key = t + (dark ? '-d' : ''); if (PK.img[key]) return PK.img[key];
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); isleIcon(x, t, 64, 66, 2.3);
  if (dark) { x.globalCompositeOperation = 'source-in'; x.fillStyle = '#5b4636'; x.fillRect(0, 0, 128, 128); }
  return (PK.img[key] = c.toDataURL());
}
function packDraw() {
  const B = PK.board; B.textContent = '';
  packRows().forEach((row, r) => {
    const sh = document.createElement('div'); sh.className = 'pkShelf' + (r === 4 ? ' gold' : ''); B.appendChild(sh);
    row.forEach((it, k) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'pkSlot' + (it.has ? ' has' : ' no') + (it.next && !it.has ? ' next' : '') + (it.hand ? ' hand' : '') + (it.gold && it.has ? ' gold' : '');
      b.setAttribute('aria-label', it.has ? 'Har' : 'Inte än'); b.style.animationDelay = (r * 0.06 + k * 0.025) + 's';
      const im = document.createElement('img'); im.alt = ''; im.src = packPic(it.t, !it.has); b.appendChild(im);
      if (it.hand) { const d = document.createElement('span'); d.className = 'pkDots'; for (let q = 0; q < 5; q++) { const i = document.createElement('i'); if (q < it.hand) i.className = 'on'; d.appendChild(i); } b.appendChild(d); }
      if (it.next && !it.has) { const s = document.createElement('span'); s.className = 'pkTw'; s.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 1 L14.6 9.4 L23 12 L14.6 14.6 L12 23 L9.4 14.6 L1 12 L9.4 9.4 Z" fill="#f4b23a" stroke="#6e4426" stroke-width="2" stroke-linejoin="round"/></svg>'; b.appendChild(s); }
      b.addEventListener('click', (e) => { e.stopPropagation();
        b.classList.remove('wig'); void b.offsetWidth; b.classList.add('wig');
        if (it.find) { packShut(true); mapOpen(it.t); return; } /* where to find it */
        if (it.has) Snd.play(it.gold ? 'sparkle' : 'pop', { gain: 0.4, f: 560 + k * 60 }); else Snd.play('tock', { gain: 0.3, f: 220 }); });
      sh.appendChild(b);
    });
  });
}
function packOpen() {
  if (!PK.el || !PK.el.hidden || enSleep || rising || dockBusy()) return;
  if (BM.menu && !BM.menu.hidden) BM.menu.hidden = true; if (MP.el && !MP.el.hidden) MP.el.hidden = true;
  packDraw(); PK.el.hidden = false; work = null; target.copy(pip.position); Snd.play('pop', { gain: 0.3, f: 600 });
}
function packShut(quiet) { if (PK.el.hidden) return; PK.el.hidden = true; if (!quiet) Snd.play('pop', { gain: 0.25, f: 380 }); }
function packInit() {
  if (PK.btn || SHOW) return;
  const st = document.createElement('style');
  st.textContent = '.bldBtn.packBtn{top:calc(max(10px,env(safe-area-inset-top,0px)) + 244px);animation:none}'
    + '.pkMenu{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;gap:14px;background:rgba(58,36,20,.5);z-index:22;padding:12px}.pkMenu[hidden]{display:none}'
    + '.pkBoard{box-sizing:border-box;display:flex;flex-direction:column;gap:6px;max-height:calc(100vh - 24px);overflow:auto;padding:14px 16px 16px;border:7px solid #8a5a32;border-radius:26px;background:#f6e7c8;box-shadow:0 8px 0 rgba(70,40,18,.4),inset 0 0 0 3px #e6cfa2}'
    + '.pkShelf{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;padding:6px 8px 12px;border-bottom:9px solid #a8774f;border-radius:0 0 6px 6px;box-shadow:0 3px 0 #6e4426}'
    + '.pkShelf.gold{border-bottom-color:#d6a53a;box-shadow:0 3px 0 #8a6420}'
    + '.pkSlot{position:relative;width:min(76px,10vw,13vh);height:min(76px,10vw,13vh);min-width:48px;min-height:48px;padding:4px;border-radius:18px;border:3px solid #6e4426;background:#fff6e4;box-shadow:0 4px 0 rgba(70,40,18,.3);animation:pkIn .35s ease-out backwards}'
    + '.pkSlot img{width:100%;height:100%;display:block;pointer-events:none}'
    + '.pkSlot.no{background:rgba(255,246,228,.45);border-style:dashed;border-color:#a8774f;box-shadow:none}.pkSlot.no img{opacity:.5}'
    + '.pkSlot.next{border-color:#f4b23a;background:rgba(255,242,190,.7)}.pkSlot.next img{opacity:.7}'
    + '.pkSlot.hand{border-color:#f4b23a;box-shadow:0 0 0 4px #f4b23a,0 4px 0 4px rgba(70,40,18,.3)}'
    + '.pkSlot.gold{background:radial-gradient(circle,#fff8d8 30%,#f9e3a0 100%);border-color:#c9901f}'
    + '.pkDots{position:absolute;left:50%;bottom:-11px;transform:translateX(-50%);display:flex;gap:2px;padding:2px 4px;border-radius:9px;background:#6e4426}.pkDots i{width:8px;height:8px;border-radius:50%;background:#d8cdb5}.pkDots i.on{background:#f4b23a}'
    + '.pkTw{position:absolute;top:-11px;right:-11px;width:28px;height:28px;pointer-events:none;animation:pkTw 1.6s ease-in-out infinite}.pkTw svg{width:100%;height:100%;display:block}'
    + '.pkSlot.wig{animation:pkWig .4s ease-out}'
    + '@keyframes pkIn{from{transform:scale(.4);opacity:0}}@keyframes pkWig{30%{transform:rotate(-9deg) scale(1.12)}65%{transform:rotate(7deg) scale(1.06)}}@keyframes pkTw{50%{transform:scale(.55) rotate(45deg);opacity:.5}}'
    + '@media (prefers-reduced-motion: reduce){.pkSlot,.pkSlot.wig,.pkTw{animation:none}}'
    + '.pkMenu .x{flex:none;width:64px;height:64px;border-radius:50%;border:3px solid var(--ink);background:var(--paper);font:700 34px Fredoka,sans-serif;align-self:flex-start}';
  document.head.appendChild(st);
  const b = document.createElement('button'); b.type = 'button'; b.className = 'bldBtn packBtn'; b.setAttribute('aria-label', 'Ryggsäck'); b.appendChild(bldPic('packBtn', 96)); document.body.appendChild(b); PK.btn = b;
  const m = document.createElement('div'); m.className = 'pkMenu'; m.hidden = true; m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', 'Ryggsäck');
  const board = document.createElement('div'); board.className = 'pkBoard'; m.appendChild(board); PK.board = board;
  const x = document.createElement('button'); x.type = 'button'; x.className = 'x'; x.setAttribute('aria-label', 'Stäng'); x.textContent = '✕'; m.appendChild(x);
  document.body.appendChild(m); PK.el = m;
  b.addEventListener('click', (e) => { e.stopPropagation(); Snd.init(); packOpen(); });
  board.addEventListener('click', (e) => e.stopPropagation()); /* only the dark edge or the cross closes it */
  m.addEventListener('click', (e) => { e.stopPropagation(); packShut(); });
  ['pointerdown', 'pointerup', 'touchstart'].forEach((ev) => m.addEventListener(ev, (e) => e.stopPropagation()));
}
