/* ---------- market opening hours ---------- */
/* the market is open from mid-morning to late afternoon (the gold arc on the day dial); the early morning and the evening
   are for getting the farm ready. No words: a stall badge by the coins, a sign over the market street, a chime and a bounce. */
const MKT_HOURS = [0.1, 0.5]; /* parts of the day (0 is sunrise, 0.62 sunset): about two hours closed at each end of the day */
const marketOpen = () => { const f = dayFrac(); return f >= MKT_HOURS[0] && f < MKT_HOURS[1]; };
let mktWasOpen = null;
{ const st = document.createElement('style'); st.textContent = `
.mktBadge { position: fixed; width: 58px; height: 58px; border-radius: 50%; border: 3px solid var(--ink); background: var(--paper); box-shadow: 0 4px 0 rgba(34,48,60,0.25); pointer-events: none; padding: 5px; transition: background 0.4s; }
.mktBadge svg { width: 100%; height: 100%; display: block; }
.mktBadge .shut { display: none; } .mktBadge.closed { background: #e6dccb; } .mktBadge.closed .shut { display: inline; } .mktBadge.closed .awn { opacity: 0.45; }
.mktBadge .ring { fill: none; stroke: #e0a646; stroke-width: 5; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 24px 24px; }
.mktBadge.bump { animation: mktBump 0.9s ease-out 2; }
@keyframes mktBump { 30% { transform: scale(1.35); } 60% { transform: scale(0.92); } }
@media (prefers-reduced-motion: reduce) { .mktBadge.bump { animation: none; } }`; document.head.appendChild(st); }
const mktBadge = document.createElement('div'); mktBadge.className = 'mktBadge'; mktBadge.setAttribute('role', 'status');
/* a little stall with a striped awning; a red "closed" bar across it when shut; a gold ring that empties as opening time runs out (or fills up to opening) */
mktBadge.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle class="ring" cx="24" cy="24" r="21" pathLength="100" stroke-dasharray="100 100"/>'
  + '<g class="awn"><rect x="12" y="22" width="24" height="14" rx="2" fill="#c9a36c" stroke="#22303c" stroke-width="2.5"/><path d="M10 22 L13 13 H35 L38 22 Z" fill="#fff6e4" stroke="#22303c" stroke-width="2.5" stroke-linejoin="round"/>'
  + '<path d="M17 13 L15.5 22 M24 13 V22 M31 13 L32.5 22" stroke="#e9684a" stroke-width="4"/><circle cx="24" cy="29" r="4" fill="#e0a646" stroke="#22303c" stroke-width="2"/></g>'
  + '<g class="shut"><circle cx="24" cy="24" r="15" fill="none" stroke="#c4473a" stroke-width="4.5"/><path d="M13.5 34.5 L34.5 13.5" stroke="#c4473a" stroke-width="4.5" stroke-linecap="round"/></g></svg>';
document.body.appendChild(mktBadge);
const mktRing = mktBadge.querySelector('.ring');
function placeMktBadge() { const r = coinPill.getBoundingClientRect(); if (!r.width) return; mktBadge.style.left = Math.round(r.right + 8) + 'px'; mktBadge.style.top = Math.round(r.top + r.height / 2 - 31) + 'px'; }
/* the sign over the market street: an open stall or a closed one, painted like the speech bubbles */
function hoursSignTex(open) { const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d');
  x.fillStyle = open ? '#fff6e4' : '#e6dccb'; x.strokeStyle = PAL.ink; x.lineWidth = 7; x.beginPath(); x.arc(64, 64, 56, 0, 7); x.fill(); x.stroke();
  x.globalAlpha = open ? 1 : 0.5; x.lineWidth = 5; x.lineJoin = 'round';
  x.fillStyle = '#c9a36c'; x.fillRect(34, 60, 60, 34); x.strokeRect(34, 60, 60, 34);
  x.fillStyle = '#fff6e4'; x.beginPath(); x.moveTo(28, 60); x.lineTo(36, 36); x.lineTo(92, 36); x.lineTo(100, 60); x.closePath(); x.fill(); x.stroke();
  x.strokeStyle = PAL.accent; x.lineWidth = 9; [[48, 44], [64, 64], [80, 84]].forEach(([a, b]) => { x.beginPath(); x.moveTo(a, 39); x.lineTo(a + (a - 64) * 0.12, 57); x.stroke(); });
  x.fillStyle = '#e0a646'; x.strokeStyle = PAL.ink; x.lineWidth = 4; x.beginPath(); x.arc(64, 77, 10, 0, 7); x.fill(); x.stroke(); x.globalAlpha = 1;
  if (!open) { x.strokeStyle = '#c4473a'; x.lineWidth = 11; x.beginPath(); x.arc(64, 64, 42, 0, 7); x.stroke(); x.beginPath(); x.moveTo(35, 93); x.lineTo(93, 35); x.stroke(); }
  return new T.CanvasTexture(c); }
const HOURS_TEX = [hoursSignTex(false), hoursSignTex(true)];
const hoursSign = new T.Sprite(new T.SpriteMaterial({ map: HOURS_TEX[1] })); hoursSign.scale.set(1.15, 1.15, 1); hoursSign.position.set(8.4, 2.75, 0); sc.add(hoursSign);
{ const P = at(8.4, 0, 0, STATIC); /* a post either side of the street with a beam the sign hangs from */
  [-1.15, 1.15].forEach((z) => P(cyl(0.07, 0.09, 3.2, 6), PAL.trunk, 950, 0, 1.6, z)); P(box(0.12, 0.12, 2.5), PAL.trunk, 951, 0, 3.25, 0);
  merged(STATIC); STATIC.length = 0; solid(8.4, 1.15, 0.2); solid(8.4, -1.15, 0.2); }
function hoursStep(dt) {
  const open = marketOpen(), f = dayFrac();
  if (open !== mktWasOpen) {
    if (mktWasOpen !== null) { mktBadge.classList.remove('bump'); void mktBadge.offsetWidth; mktBadge.classList.add('bump'); if (open) { Snd.play('bell', { gain: 0.45 }); Snd.play('sparkle', { gain: 0.4 }, 0, 120); } else Snd.play('tock', { gain: 0.4, f: 260 }); }
    mktWasOpen = open; mktBadge.classList.toggle('closed', !open); hoursSign.material.map = HOURS_TEX[open ? 1 : 0];
    mktBadge.setAttribute('aria-label', open ? 'Marknaden är öppen' : 'Marknaden är stängd');
  }
  /* the ring shows the time left while open, and the time until opening while closed */
  const len = MKT_HOURS[1] - MKT_HOURS[0], q = open ? 1 - (f - MKT_HOURS[0]) / len : 1 - (((MKT_HOURS[0] - f) % 1 + 1) % 1) / (1 - len);
  mktRing.setAttribute('stroke-dasharray', (q * 100).toFixed(1) + ' 100'); mktRing.style.stroke = open ? '#e0a646' : '#9fb4c8';
  mktBadge.hidden = inHouse; placeMktBadge();
  hoursSign.position.y = 2.75 + (reduced ? 0 : Math.sin(time * 2) * 0.04); hoursSign.visible = !inHouse;
}
