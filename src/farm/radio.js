/* ---------- the house radio: pick the day song, or let it change by itself every day ----------
   A small wooden radio stands on the chest of drawers in the cottage's bedroom, beside the bed, with a ring in front of it. Standing on the ring
   opens the radio card: one big picture button per station, so a child who cannot read can still pick:
     Blandat (auto, the default): a different day song every in-game day, never the same as yesterday's
     one button per day song: that song plays outdoors every day
     Av: no music at all (the sound effects stay on)
   Picking a station in the house plays it at once (a short tuning crackle, then a 1.2 s crossfade), and it keeps playing
   until Pip goes out; outside the place rules still win: the market street has the coin tune, the night and the other
   indoor places have the calm tune. The choice is kept in localStorage 'pips-radio', apart from the game save, so a new game
   keeps it. When music is on, a little note floats up from the radio now and then, so children notice it. */
const RADIO_KEY = 'pips-radio';
/* the radio's picture, for the mat and the card */
function RAD_ME_SVG(card) { return '<svg ' + (card ? 'class="me" aria-hidden="true" ' : 'xmlns="http://www.w3.org/2000/svg" ') + 'viewBox="0 0 64 64"><path d="M40 10 L50 22" stroke="#4a4a52" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="10" r="3" fill="#e9684a"/><rect x="6" y="22" width="52" height="34" rx="10" fill="#b8794a" stroke="#22303c" stroke-width="3.5"/><circle cx="22" cy="39" r="10" fill="#e8d2a6" stroke="#4a2e1c" stroke-width="3"/><rect x="36" y="30" width="16" height="10" rx="3" fill="#ffd77a" stroke="#4a2e1c" stroke-width="2.5"/><circle cx="40" cy="48" r="3" fill="#6b4630"/><circle cx="49" cy="48" r="3" fill="#6b4630"/></svg>'; }
const RAD = { mode: 'auto', day: -1, track: null, prev: null, preview: false, open: false, latch: false, noteT: 1.5 };
try { const s = JSON.parse(localStorage.getItem(RADIO_KEY) || 'null'); if (s) {
  if (s.mode === 'auto' || s.mode === 'off' || Snd.DAY.includes(s.mode)) RAD.mode = s.mode;
  if (Snd.DAY.includes(s.track)) RAD.track = s.track; if (Snd.DAY.includes(s.prev)) RAD.prev = s.prev; if (typeof s.day === 'number') RAD.day = s.day; } } catch (e) {}
function radioSave() { try { localStorage.setItem(RADIO_KEY, JSON.stringify({ mode: RAD.mode, day: RAD.day, track: RAD.track, prev: RAD.prev })); } catch (e) {} }
const radioDayNo = () => Math.floor((state.clock || 0) / DAY);
/* today's song in auto: a new in-game day draws one of the others (not yesterday's); the very first one is the old pastoral */
function radioToday() {
  const d = radioDayNo();
  if (d !== RAD.day || !RAD.track) {
    const last = RAD.track, pick = Snd.DAY.filter((id) => id !== last);
    RAD.prev = last; RAD.track = last ? pick[Math.floor(Math.random() * pick.length)] : 'pastoral'; RAD.day = d; radioSave();
    if (window.PipsLog && last) try { PipsLog.add('radio: new day ' + d + ', auto song ' + RAD.track); } catch (e) {}
  }
  return RAD.track;
}
const radioSong = () => (RAD.mode === 'off' ? null : RAD.mode === 'auto' ? radioToday() : RAD.mode);
const radioHome = () => inHouse && !inBarn && !inStore && !isTent();
/* loop.js asks this every frame with what the place wants; 'pastoral' stands for "the day song" */
function radioMood(m) {
  if (RAD.mode === 'off') return null;
  if (RAD.preview && radioHome()) return radioSong();
  return m === 'pastoral' ? radioSong() : m;
}
Snd.keep = []; /* today's song stays in memory while it is quiet (night, market), the others are let go */

/* ---------- the radio: one merged mesh for the wood, one small picture for the speaker and the dial ---------- */
const RAD_AT = { x: -5.47, z: -8.1, ring: [-5.0, -7.1] }; /* on the bedroom chest of drawers (interior.js), left of its plant, beside the bed */
/* the floor mat in front of it, like the bed's: parchment with a stitched edge and a radio picture; a gold rim while the card is open */
const radRing = (() => {
  const x = HX(RAD_AT.ring[0]), z = HZ(RAD_AT.ring[1]), R = 0.6;
  const c = document.createElement('canvas'); c.width = c.height = 256; const q = c.getContext('2d'), tex = new T.CanvasTexture(c);
  q.fillStyle = '#fff6e4'; q.beginPath(); q.arc(128, 128, 124, 0, 7); q.fill();
  q.strokeStyle = '#b98a55'; q.lineWidth = 6; q.setLineDash([14, 10]); q.beginPath(); q.arc(128, 128, 106, 0, 7); q.stroke(); q.setLineDash([]);
  const im = new Image(); im.onload = () => { q.drawImage(im, 52, 46, 152, 152); tex.needsUpdate = true; };
  im.src = 'data:image/svg+xml,' + encodeURIComponent(RAD_ME_SVG());
  const pad = new T.Mesh(new T.CircleGeometry(R, 40), new T.MeshBasicMaterial({ map: tex, transparent: true }));
  pad.rotation.x = -Math.PI / 2; pad.position.set(x, 0.08, z); sc.add(pad);
  const r = new T.Mesh(new T.RingGeometry(R, R + 0.08, 40), new T.MeshBasicMaterial({ color: '#7a4a2c', transparent: true, opacity: 0.9 }));
  r.rotation.x = -Math.PI / 2; r.position.set(x, 0.085, z); sc.add(r);
  const f = new T.Mesh(new T.RingGeometry(R + 0.08, R + 0.26, 40), new T.MeshBasicMaterial({ color: '#f4d76a', transparent: true, opacity: 0.75, depthWrite: false }));
  f.rotation.x = -Math.PI / 2; f.position.set(x, 0.082, z); sc.add(f);
  return { r: pad, rim: r, f, x, z };
})();
const RAD_TOP = 0.62; /* the chest's top */
const radioG = painterGroup((Q) => {
  /* the radio: a wooden box with a rounded top, a darker base, two knobs and an antenna */
  const y0 = 0, W = 0.62, H = 0.36, D = 0.28;
  Q(box(W + 0.04, 0.05, D + 0.03), CDK, 2810, 0, y0 + 0.025, 0);
  Q(box(W, H, D), '#b8794a', 2811, 0, y0 + 0.05 + H / 2, 0);
  Q(cy_(W / 2, W / 2, D, 16).rotateX(Math.PI / 2).scale(1, 0.34, 1), '#b8794a', 2812, 0, y0 + 0.05 + H, 0);
  Q(box(W + 0.02, 0.03, D + 0.02), CDK, 2813, 0, y0 + 0.05 + H - 0.005, 0);
  [[-0.2, '#6b4630'], [0.2, '#6b4630']].forEach(([x, c], k) => { Q(cy_(0.045, 0.05, 0.05, 12).rotateX(Math.PI / 2), c, 2814 + k, x, y0 + 0.11, D / 2 + 0.025); Q(box(0.012, 0.04, 0.01), '#f2e2c0', 2816 + k, x, y0 + 0.125, D / 2 + 0.052); });
  Q(cy_(0.008, 0.012, 0.62, 5).rotateZ(-0.42), '#4a4a52', 2818, 0.16 + 0.13, y0 + 0.05 + H + 0.08 + 0.28, -0.06);
  Q(new T.SphereGeometry(0.025, 6, 4), '#e9684a', 2819, 0.16 + 0.26, y0 + 0.05 + H + 0.08 + 0.57, -0.06);
});
radioG.position.set(HX(RAD_AT.x), RAD_TOP, HZ(RAD_AT.z)); radioG.rotation.y = 0.2; radioG.scale.setScalar(0.9); /* faces the room and the camera, turned a little toward the ring */ sc.add(radioG);
/* the front picture: cloth speaker on the left, the tuning dial on the right with its needle on the station */
const radCv = document.createElement('canvas'); radCv.width = 256; radCv.height = 128;
const radTex = new T.CanvasTexture(radCv);
const radFace = new T.Mesh(new T.PlaneGeometry(0.56, 0.28), new T.MeshBasicMaterial({ map: radTex, toneMapped: false }));
radFace.position.set(0, 0.05 + 0.2, 0.141); radioG.add(radFace);
function radDraw() {
  const x = radCv.getContext('2d'), on = RAD.mode !== 'off', k = RAD.mode === 'auto' ? 0 : on ? 1 + Snd.DAY.indexOf(RAD.mode) : -1;
  x.fillStyle = '#7a4a2c'; x.fillRect(0, 0, 256, 128);
  /* speaker cloth with a woven look */
  x.fillStyle = '#e8d2a6'; x.beginPath(); x.arc(64, 64, 52, 0, 7); x.fill();
  x.strokeStyle = 'rgba(120,80,48,.35)'; x.lineWidth = 2; for (let i = 16; i < 116; i += 7) { x.beginPath(); x.moveTo(12, i); x.lineTo(116, i); x.stroke(); }
  x.strokeStyle = '#4a2e1c'; x.lineWidth = 5; x.beginPath(); x.arc(64, 64, 52, 0, 7); x.stroke();
  for (let i = -1; i <= 1; i++) { x.strokeStyle = '#8a5a36'; x.lineWidth = 4; x.beginPath(); x.moveTo(64 + i * 22, 18); x.lineTo(64 + i * 22, 110); x.stroke(); }
  /* the dial: warm glow when on */
  const g = x.createLinearGradient(0, 30, 0, 98); g.addColorStop(0, on ? '#ffe7a0' : '#8f8572'); g.addColorStop(1, on ? '#f6b54a' : '#6c6456');
  x.fillStyle = g; x.beginPath(); x.roundRect ? x.roundRect(132, 30, 112, 60, 12) : x.rect(132, 30, 112, 60); x.fill();
  x.strokeStyle = '#4a2e1c'; x.lineWidth = 5; x.stroke();
  x.strokeStyle = on ? '#7a4a2c' : '#4f4a40'; x.lineWidth = 3; for (let i = 0; i < 6; i++) { const tx = 142 + i * 18.4; x.beginPath(); x.moveTo(tx, 36); x.lineTo(tx, i % 2 ? 46 : 52); x.stroke(); }
  if (k >= 0) { const nx = 146 + k * (84 / (Snd.DAY.length)); x.strokeStyle = '#d33a2a'; x.lineWidth = 5; x.beginPath(); x.moveTo(nx, 34); x.lineTo(nx, 86); x.stroke(); }
  /* a small lamp under the dial */
  x.fillStyle = on ? '#9fe07a' : '#4f4a40'; x.beginPath(); x.arc(188, 108, 8, 0, 7); x.fill(); x.strokeStyle = '#4a2e1c'; x.lineWidth = 3; x.stroke();
  radTex.needsUpdate = true;
}
radDraw();
/* floating notes: three sprites reused, one rises every few seconds while music is on */
const radNoteTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  x.fillStyle = '#fff6e4'; x.strokeStyle = '#22303c'; x.lineWidth = 4; x.lineJoin = 'round';
  x.beginPath(); x.ellipse(22, 46, 11, 8, -0.4, 0, 7); x.fill(); x.stroke(); x.fillStyle = '#22303c'; x.fillRect(30, 12, 5, 34);
  x.beginPath(); x.moveTo(30, 12); x.quadraticCurveTo(46, 14, 50, 28); x.quadraticCurveTo(44, 22, 33, 22); x.closePath(); x.fill();
  return new T.CanvasTexture(c); })();
const radNotes = [0, 1, 2].map(() => { const s = new T.Sprite(new T.SpriteMaterial({ map: radNoteTex, transparent: true, depthWrite: false, color: '#ffe28a' })); s.scale.set(0.26, 0.26, 1); s.visible = false; s.userData.t = 0; sc.add(s); return s; });
const RAD_NOTE_COL = ['#ffe28a', '#bfe6a8', '#f6c3d4', '#b9dcf2'];

/* ---------- the radio card ---------- */
const RAD_ICO = {
  auto: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#f2c14a"/><path d="M14 22 H24 L38 42 H50 M14 42 H24 L38 22 H50" fill="none" stroke="#22303c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M45 15 L52 22 L45 29 M45 35 L52 42 L45 49" fill="none" stroke="#22303c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  pastoral: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#bfe3f2"/><circle cx="42" cy="22" r="8" fill="#f2c14a" stroke="#22303c" stroke-width="3"/><path d="M2 44 Q18 28 34 40 Q46 30 62 40 V62 H2 Z" fill="#86ad5c" stroke="#22303c" stroke-width="3" stroke-linejoin="round"/><path d="M14 50 l3 -6 l3 6 M40 52 l3 -6 l3 6" fill="none" stroke="#3f7d62" stroke-width="3" stroke-linecap="round"/></svg>',
  whistle: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#d8ecd0"/><path d="M10 40 Q12 24 28 22 Q38 22 42 30 Q48 28 54 31 Q48 34 44 36 Q40 46 26 46 Q16 46 10 40 Z" fill="#e9684a" stroke="#22303c" stroke-width="3" stroke-linejoin="round"/><path d="M22 34 Q28 28 36 34" fill="#f0907a" stroke="#22303c" stroke-width="2.5"/><circle cx="36" cy="28" r="2.6" fill="#22303c"/><path d="M48 14 v10 M48 14 l6 -2 v8" fill="none" stroke="#22303c" stroke-width="3" stroke-linecap="round"/><circle cx="46" cy="25" r="3" fill="#22303c"/><circle cx="52" cy="22" r="3" fill="#22303c"/></svg>',
  sway: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#9fd6e0"/><path d="M4 46 Q12 42 20 46 T36 46 T52 46 T64 46 V62 H4 Z" fill="#2e8f9c"/><path d="M18 46 Q32 36 46 46 Z" fill="#ecd3a0" stroke="#22303c" stroke-width="3" stroke-linejoin="round"/><path d="M32 42 Q30 28 34 18" fill="none" stroke="#7d5e4e" stroke-width="4" stroke-linecap="round"/><path d="M34 18 Q24 12 16 18 M34 18 Q44 10 52 16 M34 18 Q28 22 24 30 M34 18 Q42 22 46 28" fill="none" stroke="#3f7d62" stroke-width="5" stroke-linecap="round"/></svg>',
  warm: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#f6d9b0"/><path d="M12 52 V26 Q32 10 52 26 V52 Z" fill="#a0703f" stroke="#22303c" stroke-width="3" stroke-linejoin="round"/><path d="M20 52 V34 Q32 26 44 34 V52 Z" fill="#3a2e2a"/><path d="M26 52 Q22 44 28 38 Q28 44 32 42 Q30 36 36 32 Q34 40 40 44 Q40 50 38 52 Z" fill="#f2a03a" stroke="#22303c" stroke-width="2" stroke-linejoin="round"/><path d="M30 52 Q28 47 32 44 Q35 48 34 52 Z" fill="#ffe28a"/><rect x="8" y="50" width="48" height="5" rx="2" fill="#6b4630" stroke="#22303c" stroke-width="2.5"/></svg>',
  off: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#d9d2c6"/><path d="M14 26 H22 L32 18 V46 L22 38 H14 Z" fill="#fff6e4" stroke="#22303c" stroke-width="3.5" stroke-linejoin="round"/><path d="M40 24 L52 40 M52 24 L40 40" stroke="#d33a2a" stroke-width="5" stroke-linecap="round"/></svg>'
};
{ const st = document.createElement('style'); st.textContent = `
.rad{position:fixed;inset:0;z-index:45;background:rgba(58,40,28,.5);display:flex;align-items:center;justify-content:center;font-family:Fredoka,system-ui,sans-serif;color:#3a2e2a;-webkit-user-select:none;user-select:none}
.rad[hidden]{display:none}
.rad button{font-family:inherit;cursor:pointer;color:inherit;padding:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.rad .rp{position:relative;max-width:96vw;box-sizing:border-box;background:#fff6e4;border:4px solid #3a2e2a;border-radius:28px;padding:14px 16px 16px;box-shadow:0 10px 0 rgba(0,0,0,.25),inset 0 0 0 6px #fff6e4,inset 0 0 0 8px #d9b27a;animation:radIn .28s cubic-bezier(.2,1.4,.4,1)}
.rad .rp::before{content:'';position:absolute;inset:9px;border:3px dashed #c9a06a;border-radius:20px;pointer-events:none}
@keyframes radIn{from{transform:scale(.85);opacity:0}}
.rad .rh{display:flex;align-items:center;gap:12px;margin-bottom:12px;position:relative}
.rad .rh .me{width:64px;height:64px;flex:none}
.rad .rh b{flex:1;font-size:28px}
.rad .ok{flex:none;width:72px;height:72px;border-radius:50%;border:4px solid #1f4d3a;background:#3f9a62;display:grid;place-items:center;box-shadow:0 5px 0 #1f4d3a}
.rad .ok svg{width:42px;height:42px}
.rad .st{display:grid;grid-template-columns:repeat(6,auto);gap:12px;position:relative}
.rad .sb{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;width:112px;padding:8px 4px 10px;border-radius:22px;border:4px solid #3a2e2a;background:#fffaf0;box-shadow:0 5px 0 #3a2e2a;font-size:15px;font-weight:600;line-height:1.1;text-align:center}
.rad .sb svg{width:84px;height:84px}
.rad .sb.on{background:#ecfae2;border-color:#3f7d62;box-shadow:0 2px 0 #3f7d62,0 0 0 5px #bfe6a8;transform:translateY(3px)}
.rad .sb.on::after{content:'';position:absolute;top:-14px;right:-10px;width:38px;height:38px;border-radius:50%;border:3px solid #22303c;background:#ffe28a url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cellipse cx='9' cy='17' rx='4' ry='3' fill='%2322303c'/%3E%3Cpath d='M12 17 V5 Q17 6 19 10' fill='none' stroke='%2322303c' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E") center/24px no-repeat;animation:radBob 1s ease-in-out infinite}
.rad .sb.today::before{content:'';position:absolute;left:8px;top:8px;width:14px;height:14px;border-radius:50%;background:#f2c14a;border:2px solid #22303c}
.rad .sb:active{transform:translateY(4px);box-shadow:0 1px 0 #3a2e2a}
@keyframes radBob{50%{transform:translateY(-4px) rotate(-8deg)}}
@media (max-width:820px){.rad .st{grid-template-columns:repeat(3,auto)}}
@media (max-width:420px),(max-height:460px){.rad .sb{width:92px}.rad .sb svg{width:64px;height:64px}.rad .rh .me{width:48px;height:48px}.rad .ok{width:60px;height:60px}}
@media (max-height:460px) and (min-width:600px){.rad .st{grid-template-columns:repeat(6,auto)}}
@media (prefers-reduced-motion:reduce){.rad .rp,.rad .sb.on::after{animation:none}}
`; document.head.appendChild(st); }
const radEl = document.createElement('div'); radEl.className = 'rad'; radEl.hidden = true; document.body.appendChild(radEl);
['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'wheel'].forEach((ev) => radEl.addEventListener(ev, (e) => e.stopPropagation(), { passive: true }));
const RAD_ME = RAD_ME_SVG(true);
const RAD_STATIONS = () => [{ id: 'auto', label: 'Blandat' }].concat(Snd.DAY.map((id) => ({ id, label: Snd.MUSIC[id].label })), [{ id: 'off', label: 'Av' }]);
function radRender() {
  if (!RAD.open) { radEl.hidden = true; return; }
  const today = RAD.mode === 'auto' ? radioToday() : null;
  radEl.innerHTML = `<div class="rp" role="dialog" aria-label="Radio"><div class="rh">${RAD_ME}<b>Radio</b><button type="button" class="ok" data-x="1" aria-label="Klar">${OK_ICO}</button></div><div class="st" role="radiogroup" aria-label="Kanal">${RAD_STATIONS().map((s) =>
    `<button type="button" class="sb${RAD.mode === s.id ? ' on' : ''}${today === s.id ? ' today' : ''}" role="radio" aria-checked="${RAD.mode === s.id}" data-m="${s.id}" aria-label="${s.label}">${RAD_ICO[s.id]}<span>${s.label}</span></button>`).join('')}</div></div>`;
  radEl.hidden = false;
}
function radOpen() { if (RAD.open) return; RAD.open = true; target.copy(pip.position); Snd.init(); Snd.play('pop', { gain: 0.4, f: 600 }); radRender(); }
function radClose() { if (!RAD.open) return; RAD.open = false; radEl.hidden = true; Snd.play('pop', { gain: 0.3, f: 420 }); }
function radSet(mode) {
  if (!(mode === 'auto' || mode === 'off' || Snd.DAY.includes(mode))) return;
  const was = RAD.mode; RAD.mode = mode; RAD.preview = true; radioSave(); radDraw();
  Snd.init(); Snd.tune(1800 + 300 * RAD_STATIONS().findIndex((s) => s.id === mode));
  if (window.PipsLog) try { PipsLog.add('radio: ' + was + ' -> ' + mode); } catch (e) {}
  if (mode !== 'off') radNoteT(0.2);
  radRender();
}
const radNoteT = (t) => { RAD.noteT = Math.min(RAD.noteT, t); };
radEl.addEventListener('click', (ev) => {
  ev.stopPropagation(); const b = ev.target.closest('button');
  if (!b) { if (ev.target === radEl) radClose(); return; }
  if (b.dataset.x) return radClose();
  if (b.dataset.m) radSet(b.dataset.m);
});

/* ---------- every frame ---------- */
function radioStep(dt) {
  const home = radioHome();
  radioG.visible = home; radRing.r.visible = radRing.rim.visible = home; radRing.f.visible = home && RAD.open;
  if (!home) RAD.preview = false; /* going out: the place rules take over again (the station still plays outdoors by day) */
  Snd.keep = RAD.mode === 'auto' ? [RAD.track] : RAD.mode === 'off' ? [] : [RAD.mode];
  if (RAD.open) { if (!home) radClose(); else target.copy(pip.position); }
  const on = home && Math.hypot(pip.position.x - radRing.x, pip.position.z - radRing.z) < 0.6, still = Math.hypot(target.x - pip.position.x, target.z - pip.position.z) < 0.15;
  if (on && still && !RAD.latch && !RAD.open && !(typeof DEC !== 'undefined' && DEC.open) && !(typeof ED !== 'undefined' && ED.on) && doorT <= 0) { RAD.latch = true; radOpen(); }
  if (!on) RAD.latch = false;
  /* the notes */
  const play = home && RAD.mode !== 'off' && !reduced;
  if (play) { RAD.noteT -= dt; if (RAD.noteT <= 0) { RAD.noteT = 2.2 + Math.random() * 1.6; const n = radNotes.find((s) => !s.visible); if (n) { n.visible = true; n.userData.t = 0; n.userData.dx = (Math.random() - 0.5) * 0.5; n.material.color.set(RAD_NOTE_COL[Math.floor(Math.random() * RAD_NOTE_COL.length)]); } } }
  radNotes.forEach((n) => { if (!n.visible) return; if (!home) { n.visible = false; return; }
    const t = n.userData.t += dt / 2.4; if (t >= 1) { n.visible = false; return; }
    n.position.set(radioG.position.x + n.userData.dx * t + Math.sin(t * 9) * 0.06, RAD_TOP + 0.5 + t * 0.9, radioG.position.z + 0.1);
    n.material.opacity = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85; n.material.rotation = Math.sin(t * 7) * 0.3; });
}
{ const s0 = storeStep; storeStep = function (dt) { s0(dt); radioStep(dt); }; }
if (window.__farmTest) window.__radio = { open: () => radOpen(), close: () => radClose(), set: (m) => radSet(m), ring: () => [radRing.x, radRing.z], home: () => radioHome(),
  state: () => ({ mode: RAD.mode, day: RAD.day, track: RAD.track, prev: RAD.prev, preview: RAD.preview, open: RAD.open, want: Snd.musWant, eff: Snd.musEff, fade: Snd.fade, loaded: Object.keys(Snd.mus).map((k) => k + ':' + Snd.mus[k].st + ':' + Snd.mus[k].x.toFixed(2)).join(' '), btns: radEl.querySelectorAll('.sb').length, on: (radEl.querySelector('.sb.on') || {}).dataset ? radEl.querySelector('.sb.on').dataset.m : null }),
  goIn: () => goInside(true), goOut: () => goInside(false), tap: (m) => { const b = radEl.querySelector('[data-m="' + m + '"]'); if (b) b.click(); return !!b; } };
