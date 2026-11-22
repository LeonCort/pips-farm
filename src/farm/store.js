/* ---------- the store: Pip's gear, furniture, decorations and a bigger house, all bought with coins ----------
   The old upgrade rooms in the house become plain rooms; the four upgrades are now gear Pip buys here and wears.
   Furniture and decorations ride home and are unpacked when Pip gets there; a bigger house is built up with scaffolding.
   Every buy (here, and on the farm and market pads) gets a little celebration. */
window.PIPS_STORE = true;
const STORE = { x: 18.4, z: -4.4 }; /* outside, in the market street's north-east corner; the front faces the street (+z) */
const SDOOR = { x: STORE.x, z: STORE.z + 1.75 };
const SI = { x: 0, z: -200 }; /* the inside, far out where nothing else is */
const STORE_IN = { x0: SI.x - 5.5, x1: SI.x + 5.5, z0: SI.z - 3.5, z1: SI.z + 4.9 }; /* reaches past the door line, so walking out through it works */
let inStore = false;
const TIER = ['#a0703f', '#74a857', '#5a9fc4', '#7b5ea7', '#e9684a', '#c9ced6', '#e8b84a', '#f08fb8'];
const tierCol = (lv) => TIER[clamp(lv - 1, 0, TIER.length - 1)];
const stS = () => state.store;
/* furniture: the old upgrade props, now bought one by one; left rooms open from the start, the right ones with the wing, the hall with the second floor */
const FURN = [
  ['speed', 2, 25], ['bag', 2, 40], ['speed', 4, 60], ['bag', 4, 90], ['speed', 6, 130], ['bag', 6, 180], ['speed', 8, 240], ['bag', 8, 320],
  ['farm', 2, 260], ['guests', 2, 300], ['farm', 4, 360], ['guests', 4, 420], ['farm', 6, 500], ['guests', 6, 580], ['farm', 8, 680], ['guests', 8, 800]
].map(([r, lv, cost]) => ({ id: r + lv, room: r, lv, cost, need: r === 'speed' || r === 'bag' ? 1 : 2 }))
  .concat([['toys', 700, 3], ['horse', 850, 3], ['piano', 1000, 3], ['clock', 1150, 3], ['fish', 1500, 4], ['plants', 1700, 4], ['tub', 1900, 4], ['duck', 2100, 4]].map(([id, cost, need]) => ({ id, room: 'hall', cost, need })));
const DECO_L = [['lights', 15], ['lanterns', 35], ['bench', 70], ['mailbox', 110], ['birdbath', 160], ['gnome', 230], ['vane', 320]].map(([id, cost]) => ({ id, cost }));
const SIZES = [null, null, { cost: 250 }, { cost: 1200 }, { cost: 3000 }];
const GEAR = ['speed', 'bag', 'farm', 'guests'];

/* ---------- save data, and a fair start for farms that were played before the store ---------- */
function storeInit() {
  if (state.store && typeof state.store === 'object') { const s = state.store; ['furn', 'deco', 'paid'].forEach((k) => { if (!s[k]) s[k] = {}; }); if (!Array.isArray(s.pend)) s.pend = []; if (!(s.size >= 0)) s.size = 0; if (!(s.seenIn >= 0)) s.seenIn = s.size; return; }
  const played = GEAR.some((k) => state.lv[k] > 0) || (state.total || 0) > 0 || Object.keys(state.owned || {}).length > 0;
  const s = state.store = { size: played ? 2 : 0, seenIn: played ? 1 : 0, furn: {}, deco: {}, paid: {}, pend: [] };
  /* what the old upgrade levels already showed stays in the house */
  FURN.forEach((f) => { if (f.lv && f.need <= s.size && (state.lv[f.room] || 0) >= f.lv) s.furn[f.id] = 1; });
  /* a played farm gets its wing built the first time Pip walks by: a gift */
  if (played) s.pend.push('size2');
  save();
}

/* ---------- little helpers: pictures, confetti, rising things, a badge ---------- */
const SC = { thumbs: {}, rt: null, scene: null, cam: null };
function thumbOf(key, make) {
  if (SC.thumbs[key]) return SC.thumbs[key];
  if (!SC.rt) { SC.rt = new T.WebGLRenderTarget(160, 160); SC.scene = new T.Scene(); SC.cam = new T.PerspectiveCamera(30, 1, 0.05, 50); SC.scene.add(new T.HemisphereLight(0xffffff, 0xb0a890, 0.9)); const d = new T.DirectionalLight(0xfff0dd, 0.75); d.position.set(3, 5, 4); SC.scene.add(d); }
  const o = make(); SC.scene.add(o); o.updateMatrixWorld(true);
  const bb = new T.Box3().setFromObject(o), c = bb.getCenter(new T.Vector3()), r = Math.max(0.05, bb.getSize(new T.Vector3()).length() * 0.5);
  const d = r / Math.sin(15 * Math.PI / 180) * 1.02; SC.cam.position.set(c.x + d * 0.35, c.y + d * 0.42, c.z + d * 0.84); SC.cam.lookAt(c);
  const old = renderer.getClearColor(new T.Color()).getHex(), oldA = renderer.getClearAlpha(), cs0 = CURVE.u.strength.value; CURVE.u.strength.value = 0;
  renderer.setRenderTarget(SC.rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(SC.scene, SC.cam);
  const px = new Uint8Array(160 * 160 * 4); renderer.readRenderTargetPixels(SC.rt, 0, 0, 160, 160, px); renderer.setRenderTarget(null); renderer.setClearColor(old, oldA); CURVE.u.strength.value = cs0;
  SC.scene.remove(o);
  const cv = document.createElement('canvas'); cv.width = cv.height = 160; const x = cv.getContext('2d'), img = x.createImageData(160, 160);
  for (let y = 0; y < 160; y++) img.data.set(px.subarray((159 - y) * 640, (160 - y) * 640), y * 640);
  x.putImageData(img, 0, 0); return (SC.thumbs[key] = cv.toDataURL());
}
/* confetti: one instanced mesh per burst, placed at the burst so the curved world bends it right */
const CONF_GEO = new T.PlaneGeometry(0.09, 0.13), CONF_MAT = new T.MeshBasicMaterial({ side: T.DoubleSide, transparent: true }), CONF_COL = ['#e9684a', '#f2c14a', '#74a857', '#5a9fc4', '#f6b8c8', '#fff6e4', '#7b5ea7'];
const BURSTS = [];
function confetti(x, y, z, n, up) {
  n = Math.min(64, n || 36); const m = new T.InstancedMesh(CONF_GEO, CONF_MAT, n); m.position.set(x, y, z); m.frustumCulled = false; const col = new T.Color(), P = [];
  for (let k = 0; k < n; k++) { col.set(CONF_COL[k % CONF_COL.length]); m.setColorAt(k, col); const a = hash(k, n) * 6.283, s = 1.2 + hash(n, k) * 2.2; P.push({ p: new T.Vector3((hash(k, 3) - 0.5) * 0.3, 0, (hash(k, 4) - 0.5) * 0.3), v: new T.Vector3(Math.cos(a) * s, (up || 4.2) + hash(k, 9) * 2.6, Math.sin(a) * s), r: new T.Euler(hash(k, 5) * 6, hash(k, 6) * 6, 0), w: 4 + hash(k, 7) * 8 }); }
  if (m.instanceColor) m.instanceColor.needsUpdate = true; sc.add(m); BURSTS.push({ m, P, t: 0 });
}
const _q = new T.Quaternion(), _mx = new T.Matrix4(), _one = new T.Vector3(1, 1, 1);
function burstStep(dt) {
  for (let i = BURSTS.length - 1; i >= 0; i--) { const b = BURSTS[i]; b.t += dt;
    b.P.forEach((q, k) => { q.v.y -= 7 * dt; q.v.multiplyScalar(1 - dt * 1.6); if (q.v.y < -1.1) q.v.y = -1.1; q.p.addScaledVector(q.v, dt); if (q.p.y + b.m.position.y < 0.05) { q.p.y = 0.05 - b.m.position.y; q.v.set(0, 0, 0); } q.r.x += q.w * dt; q.r.y += q.w * 0.7 * dt; _q.setFromEuler(q.r); _mx.compose(q.p, _q, _one); b.m.setMatrixAt(k, _mx); });
    b.m.instanceMatrix.needsUpdate = true; b.m.material.opacity = 1;
    if (b.t > 2.6) { sc.remove(b.m); b.m.dispose && b.m.dispose(); BURSTS.splice(i, 1); } }
}
/* things that rise out of the ground (or pop up) with a bounce */
const RISE = [];
const backOut = (k) => { const s = 1.9; k -= 1; return 1 + k * k * ((s + 1) * k + s); };
function riseIn(o, delay, dur, all) { if (o.userData.rise) return; const s0 = o.scale.clone(); o.userData.rise = 1; o.scale.set(all ? 0.001 : s0.x, 0.001, all ? 0.001 : s0.z); RISE.push({ o, s0, t: -(delay || 0), d: dur || 0.8, all: !!all }); }
function riseStep(dt) {
  for (let i = RISE.length - 1; i >= 0; i--) { const r = RISE[i]; r.t += dt; if (r.t < 0) continue; const k = Math.min(1, r.t / r.d), e = Math.max(0.001, backOut(k));
    r.o.scale.set(r.all ? r.s0.x * e : r.s0.x, r.s0.y * e, r.all ? r.s0.z * e : r.s0.z); if (k >= 1) { r.o.scale.copy(r.s0); r.o.userData.rise = 0; RISE.splice(i, 1); } }
}
function fanfare(big) {
  Snd.init(); ['C6', 'E6', 'G6'].forEach((f, i) => Snd.play('ding', { gain: 0.42, f }, i * 0.11)); Snd.play('success', { gain: 0.55, f: 'C7' }, 0.36); Snd.play('sparkle', { gain: 0.5, n: big ? 10 : 6 }, 0.42);
  if (big) { Snd.play('powerup', { gain: 0.3 }, 0.05); Snd.play('ding', { gain: 0.35, f: 'G6' }, 0.7); Snd.play('success', { gain: 0.5, f: 'E6' }, 0.85); }
}
/* the badge: a big picture of what was just bought, popping up in the middle with rays behind it */
{ const st = document.createElement('style'); st.textContent = `
.stBadge { position: fixed; left: 50%; top: 22%; width: 190px; height: 190px; margin-left: -95px; pointer-events: none; z-index: 30; display: grid; place-items: center; }
.stBadge[hidden] { display: none; }
.stBadge .ray { position: absolute; inset: -40px; border-radius: 50%; background: repeating-conic-gradient(rgba(255,214,110,0.55) 0 10deg, rgba(255,214,110,0) 10deg 20deg); animation: stSpin 4s linear infinite; -webkit-mask: radial-gradient(circle, #000 35%, transparent 70%); mask: radial-gradient(circle, #000 35%, transparent 70%); }
.stBadge .disc { position: relative; width: 170px; height: 170px; border-radius: 50%; background: #fffaf0; border: 6px solid #22303c; box-shadow: 0 8px 0 rgba(34,48,60,0.3), inset 0 0 0 8px #f2c14a; display: grid; place-items: center; animation: stPop 0.5s cubic-bezier(.2,1.6,.4,1); }
.stBadge img { width: 150px; height: 150px; display: block; }
.stBadge .stars { position: absolute; inset: 0; }
.stBadge .stars i { position: absolute; width: 26px; height: 26px; background: #f2c14a; clip-path: polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%); animation: stTw 1s ease-in-out infinite alternate; }
.stBadge.out .disc { animation: stOut 0.35s ease-in forwards; } .stBadge.out .ray { opacity: 0; transition: opacity 0.3s; }
@keyframes stSpin { to { transform: rotate(360deg); } } @keyframes stPop { from { transform: scale(0.2) rotate(-20deg); } }
@keyframes stOut { to { transform: scale(0.3) translateY(-60px); opacity: 0; } } @keyframes stTw { to { transform: scale(0.6) rotate(30deg); } }
.stWish { position: fixed; width: 70px; height: 70px; border-radius: 50%; border: 3px solid #22303c; background: #fffaf0; box-shadow: 0 4px 0 rgba(34,48,60,0.28); padding: 0; z-index: 6; }
.stWish[hidden] { display: none; }
.stWish img { position: absolute; left: 7px; top: 7px; width: 50px; height: 50px; pointer-events: none; }
.stWish svg { position: absolute; inset: -3px; width: 70px; height: 70px; pointer-events: none; transform: rotate(-90deg); }
.stWish.ready { animation: stBounce 1.1s ease-in-out infinite; border-color: #3f7d62; }
.stWish .bag { position: absolute; right: -8px; bottom: -6px; width: 30px; height: 30px; pointer-events: none; }
@keyframes stBounce { 0%,100% { transform: translateY(0); } 40% { transform: translateY(-8px) scale(1.06); } 60% { transform: translateY(0) scale(0.98); } }
@media (prefers-reduced-motion: reduce) { .stBadge .ray, .stBadge .stars i, .stWish.ready { animation: none; } }
`; document.head.appendChild(st); }
const badgeEl = document.createElement('div'); badgeEl.className = 'stBadge'; badgeEl.hidden = true; badgeEl.setAttribute('aria-hidden', 'true');
badgeEl.innerHTML = '<div class="ray"></div><div class="disc"><img alt=""></div><div class="stars">' + [[8, 18], [160, 30], [20, 150], [150, 160], [86, -14]].map(([l, t]) => '<i style="left:' + l + 'px;top:' + t + 'px"></i>').join('') + '</div>';
document.body.appendChild(badgeEl);
let badgeT = 0;
function badge(src) { badgeEl.querySelector('img').src = src; badgeEl.hidden = false; badgeEl.classList.remove('out'); const d = badgeEl.querySelector('.disc'); d.style.animation = 'none'; void d.offsetWidth; d.style.animation = ''; badgeT = 2.1; }

/* ---------- models: gear, decorations, hall furniture and the house additions ---------- */
function gearModel(id, lv) {
  const g = new T.Group(), c = tierCol(Math.max(1, lv)); let geo;
  if (id === 'speed') {
    geo = new T.BoxGeometry(0.34, 0.18, 0.52, 2, 1, 2); part(fac(jit(geo, 0.008, 2), c, 150), g, 0, 0.14, 0);
    geo = new T.BoxGeometry(0.36, 0.06, 0.56); part(fac(geo, PAL.paper, 151), g, 0, 0.03, 0.01);
    geo = new T.BoxGeometry(0.3, 0.16, 0.2); part(fac(geo, c, 152), g, 0, 0.28, -0.13);
    geo = new T.BoxGeometry(0.35, 0.04, 0.12); part(fac(geo, PAL.paper, 153), g, 0, 0.24, 0.12);
    [-1, 1].forEach((s) => { geo = new T.BoxGeometry(0.03, 0.12, 0.26); geo.translate(0, 0.06, -0.1); const w = part(fac(geo, '#fffaf0', 154), g, s * 0.19, 0.26, -0.12); w.rotation.set(0.5, 0, s * 0.35); geo = new T.BoxGeometry(0.03, 0.09, 0.18); geo.translate(0, 0.05, -0.08); const w2 = part(fac(geo, '#fffaf0', 155), g, s * 0.19, 0.2, -0.14); w2.rotation.set(0.9, 0, s * 0.35); });
  } else if (id === 'bag') {
    geo = new T.BoxGeometry(0.6, 0.34, 0.42, 3, 2, 3); part(fac(jit(geo, 0.01, 3), (cx, cy, cz, i) => tone(Math.round((cy + 0.2) * 14) % 2 ? '#c9a36c' : '#b48650', i, 0.5)), g, 0, 0.17, 0);
    geo = new T.BoxGeometry(0.64, 0.07, 0.46); part(fac(geo, c, 156), g, 0, 0.36, 0);
    geo = new T.TorusGeometry(0.24, 0.025, 5, 14, Math.PI); part(fac(geo, '#8a5a3a', 157), g, 0, 0.38, 0);
    [-0.2, 0.2].forEach((x) => { geo = new T.BoxGeometry(0.05, 0.36, 0.03); part(fac(geo, c, 158), g, x, 0.2, -0.23); });
  } else if (id === 'farm') {
    [-1, 1].forEach((s) => { const h = new T.Group(); h.position.set(s * 0.17, 0.02, 0); h.rotation.set(-1.2, s * 0.3, 0); g.add(h);
      geo = ico(0.13, 1, 160 + s, 0.006); geo.scale(1, 1.25, 0.55); part(fac(geo, c, 160), h, 0, 0.13, 0);
      for (let k = 0; k < 4; k++) { geo = new T.CylinderGeometry(0.03, 0.03, 0.14, 6); part(fac(geo, c, 161), h, -0.075 + k * 0.05, 0.3, 0); }
      geo = new T.CylinderGeometry(0.032, 0.032, 0.11, 6); const th = part(fac(geo, c, 162), h, s * -0.12, 0.15, 0); th.rotation.z = s * 0.9;
      geo = new T.CylinderGeometry(0.115, 0.12, 0.08, 10); geo.scale(1, 1, 0.6); part(fac(geo, '#fff6e4', 163), h, 0, -0.01, 0); });
  } else if (id === 'guests') {
    geo = new T.CylinderGeometry(0.11, 0.11, 0.34, 12); geo.rotateZ(Math.PI / 2); part(fac(geo, c, 165), g, 0, 0.14, 0);
    geo = new T.BoxGeometry(0.16, 0.06, 0.12); part(fac(geo, c, 166), g, 0.24, 0.12, 0);
    geo = new T.CylinderGeometry(0.06, 0.06, 0.02, 10); part(fac(geo, '#22303c', 167), g, -0.04, 0.255, 0);
    geo = new T.TorusGeometry(0.09, 0.02, 6, 12); part(fac(geo, '#fff6e4', 168), g, -0.2, 0.24, 0);
    geo = new T.TorusGeometry(0.26, 0.012, 4, 24); geo.rotateX(Math.PI / 2); part(fac(geo, '#e9684a', 169), g, -0.38, 0.03, 0.05);
  }
  return g;
}
/* Pip wears the gear: winged shoes, a big basket, gloves and a whistle on a cord */
function gearOn() {
  const lv = state && state.lv; if (!lv) return;
  limbs.forEach((L) => {
    if (!L.arm && lv.speed > 0) { const c = tierCol(lv.speed); let g = new T.BoxGeometry(0.178, 0.035, 0.07); part(fac(g, c, 170), L.g, 0, -0.545, 0.15, true);
      [-1, 1].forEach((s) => { g = new T.BoxGeometry(0.02, 0.09, 0.15); g.translate(0, 0.045, -0.06); const w = part(fac(g, '#fffaf0', 171), L.g, s * 0.095, -0.6, -0.04, true); w.rotation.set(0.55, 0, s * 0.45); }); }
    if (L.arm && lv.farm > 0) { const c = tierCol(lv.farm); part(fac(ico(0.085, 1, 172, 0.004), c, 172), L.g, 0, -0.42, 0, true); const g = new T.CylinderGeometry(0.078, 0.078, 0.05, 10); part(fac(g, '#fff6e4', 173), L.g, 0, -0.36, 0, true); }
  });
  if (lv.bag > 0) { const c = tierCol(lv.bag), h = 0.06 + 0.012 * lv.bag;
    [[0, -0.15, 0.48, 0.03], [0, 0.15, 0.48, 0.03], [-0.235, 0, 0.03, 0.3], [0.235, 0, 0.03, 0.3]].forEach(([x, z, w, d]) => { const g = new T.BoxGeometry(w, h, d); part(fac(g, '#b48650', 174), pb, x, 0.86 + h / 2 - 0.02, -0.34 + z, true); });
    const g = new T.BoxGeometry(0.5, 0.035, 0.035); part(fac(g, c, 175), pb, 0, 0.87 + h, -0.19, true); }
  if (lv.guests > 0) { const c = tierCol(lv.guests); let g = new T.TorusGeometry(0.155, 0.01, 4, 18); g.rotateX(Math.PI / 2 + 0.35); part(fac(g, '#e9684a', 176), pb, 0, 1.08, 0.03, true);
    g = new T.CylinderGeometry(0.035, 0.035, 0.1, 8); g.rotateZ(Math.PI / 2); part(fac(g, c, 177), pb, 0, 0.98, 0.19, true); }
}
{ const b0 = buildAvatar; buildAvatar = function () { b0(); gearOn(); }; }
/* decorations round the house: each is drawn by a painter Q in its own space */
const DECO_B = {
  lights: (Q) => { for (let k = 0; k < 9; k++) { const x = -1.15 + k * 0.29, y = 1.5 - Math.sin(k / 8 * Math.PI) * 0.12; Q(new T.SphereGeometry(0.045, 6, 4), ['#ffd27a', '#f6b8c8', '#8fd0e8', '#b6e08a'][k % 4], 1300 + k, x, y, 0); } Q(new T.CylinderGeometry(0.006, 0.006, 2.4, 3).rotateZ(Math.PI / 2), '#3a3f48', 1310, 0, 1.53, 0); },
  lanterns: (Q) => [-1.6, 1.6].forEach((x) => { Q(box(0.08, 1.15, 0.08), '#3a3f48', 1311, x, 0.58, 0); Q(box(0.2, 0.26, 0.2), '#3a3f48', 1312, x, 1.25, 0); Q(box(0.15, 0.2, 0.15), '#ffd98a', 1313, x, 1.25, 0); Q(new T.ConeGeometry(0.17, 0.12, 4).rotateY(Math.PI / 4), '#3a3f48', 1314, x, 1.44, 0); }),
  bench: (Q) => { Q(box(1.0, 0.07, 0.36), '#9a6542', 1315, 0, 0.36, 0); Q(box(1.0, 0.3, 0.06), '#9a6542', 1316, 0, 0.58, -0.16, { rx: -0.15 }); [-0.42, 0.42].forEach((x) => { Q(box(0.06, 0.36, 0.3), '#3a3f48', 1317, x, 0.18, 0); }); Q(new T.CylinderGeometry(0.1, 0.08, 0.16, 8), '#c8734a', 1318, 0.62, 0.08, 0.05); Q(fluff(0.12, 1319, 4).scale(1, 1.2, 1), (cx, cy, cz, i) => leafY('#5d9160', cy, -0.1, 0.14, i), 1319, 0.62, 0.24, 0.05); },
  mailbox: (Q) => { Q(box(0.07, 0.9, 0.07), '#9a6542', 1320, 0, 0.45, 0); Q(box(0.26, 0.22, 0.38), '#5a9fc4', 1321, 0, 0.96, 0); Q(new T.CylinderGeometry(0.13, 0.13, 0.38, 10, 1, false, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI / 2), '#5a9fc4', 1322, 0, 1.07, 0); Q(box(0.03, 0.18, 0.05), '#e9684a', 1323, 0.15, 1.12, -0.08); Q(box(0.03, 0.08, 0.12), '#e9684a', 1324, 0.15, 1.2, -0.02); },
  birdbath: (Q) => { Q(new T.CylinderGeometry(0.1, 0.16, 0.6, 10), '#b8aa98', 1325, 0, 0.3, 0); Q(new T.CylinderGeometry(0.34, 0.2, 0.12, 14), '#b8aa98', 1326, 0, 0.64, 0); Q(new T.CylinderGeometry(0.29, 0.29, 0.02, 14), '#8fd0e8', 1327, 0, 0.7, 0); Q(ico(0.06, 1, 1328).scale(1.3, 1, 1), '#e9684a', 1328, 0.2, 0.78, 0.05); Q(ico(0.04, 0, 1329), '#e9684a', 1329, 0.27, 0.83, 0.05); Q(new T.ConeGeometry(0.02, 0.05, 4).rotateZ(-Math.PI / 2), '#f2c14a', 1330, 0.32, 0.83, 0.05); },
  gnome: (Q) => { Q(new T.CylinderGeometry(0.12, 0.17, 0.3, 10), '#3f7d62', 1331, 0, 0.15, 0); Q(ico(0.11, 1, 1332), '#f6d3b8', 1332, 0, 0.38, 0.02); Q(ico(0.1, 1, 1333).scale(1, 1.3, 0.8), '#fff6e4', 1333, 0, 0.3, 0.08); Q(new T.ConeGeometry(0.13, 0.32, 10), '#e9684a', 1334, 0, 0.6, 0); Q(ico(0.03, 0, 1335), '#e9684a', 1335, 0, 0.4, 0.12); },
  vane: (Q) => { Q(box(0.04, 0.6, 0.04), '#3a3f48', 1336, 0, 0.3, 0); Q(box(0.5, 0.02, 0.02), '#3a3f48', 1337, 0, 0.45, 0); Q(box(0.02, 0.02, 0.5), '#3a3f48', 1338, 0, 0.45, 0); Q(ico(0.08, 1, 1339).scale(1.6, 1, 0.5), '#e8b84a', 1339, 0, 0.72, 0); Q(new T.ConeGeometry(0.05, 0.12, 4).rotateZ(-Math.PI / 2), '#e9684a', 1340, 0.17, 0.72, 0); Q(box(0.08, 0.12, 0.02), '#e8b84a', 1341, -0.14, 0.78, 0); }
};
/* where each decoration stands round the house (offsets from the house centre, turn, height) */
const DECO_AT = { lights: [0, 1.06, 0], lanterns: [0, 1.25, 0], bench: [-2.65, 1.25, 0.35], mailbox: [2.25, 1.45, 0], birdbath: [-3.45, 0.1, 0], gnome: [3.3, 1.0, -0.5], vane: [0, 0, 0, 2.48] };
/* the hall furniture for the biggest house (offsets from the house inside's centre) */
/* furniture for the new wings (offsets from the house inside's centre): east wing = playroom (north) and music room (south), west wing = garden room and bathroom */
const HALL_B = {
  toys: { at: [7.2, -6.55, 0], b: (Q) => { Q(box(0.62, 0.32, 0.38), '#e9684a', 1380, 0, 0.16, 0); Q(box(0.66, 0.05, 0.42), '#c45a3a', 1381, 0, 0.34, 0); Q(ico(0.1, 1, 1382), '#5a9fc4', 1382, -0.15, 0.45, 0.02); Q(ico(0.11, 1, 1383).scale(1, 1.15, 1), '#c98b62', 1383, 0.13, 0.46, 0); Q(ico(0.06, 1, 1384), '#c98b62', 1384, 0.13, 0.62, 0.02); [-1, 1].forEach((s) => Q(ico(0.035, 0, 1385), '#c98b62', 1385, 0.13 + s * 0.06, 0.68, 0)); Q(box(0.12, 0.12, 0.12), '#f2c14a', 1386, 0.36, 0.06, 0.25); Q(box(0.12, 0.12, 0.12), '#74a857', 1387, 0.5, 0.06, 0.1); } },
  horse: { at: [10.3, -3.4, -0.6], b: (Q) => { Q(new T.TorusGeometry(0.45, 0.04, 4, 16, Math.PI).rotateZ(Math.PI), '#9a6542', 1390, 0, 0.45, -0.15); Q(new T.TorusGeometry(0.45, 0.04, 4, 16, Math.PI).rotateZ(Math.PI), '#9a6542', 1390, 0, 0.45, 0.15); Q(box(0.55, 0.26, 0.24), '#fff6e4', 1391, 0, 0.42, 0); Q(box(0.16, 0.32, 0.16), '#fff6e4', 1392, 0.28, 0.62, 0, { rz: -0.3 }); Q(box(0.26, 0.14, 0.16), '#fff6e4', 1393, 0.38, 0.78, 0); Q(box(0.06, 0.32, 0.18), '#e9684a', 1394, 0.2, 0.68, 0, { rz: -0.3 }); Q(box(0.1, 0.06, 0.26), '#e9684a', 1395, -0.05, 0.57, 0); Q(ico(0.02, 0, 1396), '#22303c', 1396, 0.44, 0.82, 0.08); } },
  piano: { at: [10.95, 1.6, -Math.PI / 2], b: (Q) => { Q(box(1.0, 0.95, 0.34), '#4a2f22', 1370, 0, 0.48, 0); Q(box(0.92, 0.05, 0.2), '#fffaf0', 1371, 0, 0.62, 0.2); for (let k = 0; k < 6; k++) Q(box(0.05, 0.03, 0.1), '#22303c', 1372, -0.38 + k * 0.15, 0.65, 0.18); Q(box(1.0, 0.04, 0.24), '#4a2f22', 1373, 0, 0.58, 0.18); Q(box(0.3, 0.2, 0.02), '#fff6e4', 1374, 0, 0.88, 0.18, { rx: -0.2 }); Q(box(0.5, 0.06, 0.28), '#9a6542', 1375, 0, 0.36, 0.55); [-0.2, 0.2].forEach((x) => Q(box(0.05, 0.34, 0.05), '#6b4630', 1376, x, 0.17, 0.55)); } },
  clock: { at: [7.0, -0.95, 0], b: (Q) => { Q(box(0.42, 1.55, 0.26), '#6b4630', 1350, 0, 0.78, 0); Q(new T.CylinderGeometry(0.15, 0.15, 0.03, 16).rotateX(Math.PI / 2), '#fff6e4', 1351, 0, 1.3, 0.14); Q(box(0.015, 0.1, 0.01), '#22303c', 1352, 0, 1.33, 0.16); Q(box(0.07, 0.015, 0.01), '#22303c', 1353, 0.03, 1.3, 0.16); Q(box(0.22, 0.5, 0.02), '#c9a36c', 1354, 0, 0.6, 0.135); Q(new T.CylinderGeometry(0.07, 0.07, 0.02, 12).rotateX(Math.PI / 2), '#e8b84a', 1355, 0, 0.45, 0.15); Q(box(0.5, 0.1, 0.3), '#5a3a28', 1356, 0, 1.6, 0); } },
  fish: { at: [-10.95, -3.6, Math.PI / 2], b: (Q) => { Q(box(0.9, 0.5, 0.36), '#6b4630', 1360, 0, 0.25, 0); Q(box(0.92, 0.42, 0.36), '#8fd0e8', 1361, 0, 0.71, 0); Q(box(0.94, 0.04, 0.38), '#3a3f48', 1362, 0, 0.94, 0); Q(box(0.9, 0.06, 0.34), '#d9c39a', 1363, 0, 0.53, 0); [[-0.2, 0.72, '#f2b134'], [0.18, 0.64, '#e9684a'], [0.02, 0.8, '#f2b134']].forEach(([x, y, c], k) => { Q(ico(0.045, 0, 1364 + k).scale(1.5, 1, 0.6), c, 1364 + k, x, y, 0.19); Q(new T.ConeGeometry(0.03, 0.05, 3).rotateZ(Math.PI / 2), c, 1367, x - 0.08, y, 0.19); }); Q(new T.ConeGeometry(0.05, 0.22, 5), '#5d9160', 1368, 0.32, 0.66, 0.05); } },
  plants: { at: [-7.3, -6.55, 0], b: (Q) => { Q(box(1.2, 0.05, 0.36), '#9a6542', 1397, 0, 0.5, 0); Q(box(1.2, 0.05, 0.36), '#9a6542', 1397, 0, 0.95, 0); [-0.55, 0.55].forEach((x) => Q(box(0.05, 1.0, 0.34), '#6b4630', 1398, x, 0.5, 0)); [[-0.3, 0.52], [0.05, 0.52], [0.35, 0.52], [-0.2, 0.97], [0.25, 0.97]].forEach(([x, y], k) => { Q(new T.CylinderGeometry(0.09, 0.07, 0.14, 8), '#c8734a', 1399, x, y + 0.07, 0); Q(fluff(0.11, 1400 + k, 4).scale(1, 1.3, 1), (cx, cy, cz, i) => leafY('#5d9160', cy, -0.1, 0.14, i), 1400 + k, x, y + 0.24, 0); }); Q(new T.CylinderGeometry(0.16, 0.12, 0.3, 10), '#c8734a', 1406, 0.9, 0.15, 0.1); Q(fluff(0.26, 1407, 5).scale(1, 1.6, 1), (cx, cy, cz, i) => leafY('#4f8a58', cy, -0.2, 0.3, i), 1407, 0.9, 0.6, 0.1); } },
  tub: { at: [-9.4, 3.5, 0], b: (Q) => { Q(box(1.3, 0.5, 0.66), '#fffaf0', 1410, 0, 0.3, 0); Q(box(1.14, 0.04, 0.5), '#8fd0e8', 1411, 0, 0.52, 0); [[-0.55, -0.25], [-0.55, 0.25], [0.55, -0.25], [0.55, 0.25]].forEach(([x, z]) => Q(ico(0.06, 0, 1412), '#e8b84a', 1412, x, 0.04, z)); Q(box(0.05, 0.3, 0.05), '#c9ced6', 1413, -0.62, 0.7, 0); Q(box(0.16, 0.05, 0.05), '#c9ced6', 1414, -0.55, 0.84, 0); for (let k = 0; k < 5; k++) Q(ico(0.05, 0, 1415 + k), '#ffffff', 1415 + k, -0.2 + k * 0.1, 0.57, (k % 2) * 0.1 - 0.05); } },
  duck: { at: [-6.6, 1.2, Math.PI / 2], b: (Q) => { [-0.35, 0.35].forEach((x) => Q(box(0.05, 0.9, 0.05), '#c9ced6', 1420, x, 0.45, 0)); Q(box(0.76, 0.04, 0.04), '#c9ced6', 1421, 0, 0.86, 0); Q(box(0.3, 0.5, 0.03), '#f6b8c8', 1422, -0.15, 0.62, 0.03); Q(box(0.3, 0.45, 0.03), '#8fd0e8', 1423, 0.18, 0.64, 0.03); Q(box(0.5, 0.06, 0.3), '#9a6542', 1424, 0, 0.3, 0.1); Q(ico(0.09, 1, 1425).scale(1.2, 0.9, 1), '#f2c14a', 1425, 0, 0.42, 0.1); Q(ico(0.06, 1, 1426), '#f2c14a', 1426, 0.07, 0.53, 0.1); Q(new T.ConeGeometry(0.025, 0.06, 4).rotateZ(-Math.PI / 2), '#e9684a', 1427, 0.15, 0.53, 0.1); } }
};
function painterGroup(build) { const L = [], P = at(0, 0, 0, L); build(P); ATREC.pop(); const g = new T.Group(); merged(L, MAT, g); return g; }

/* ---------- the store outside: a cozy shop with a big window, a striped awning and a bag sign ---------- */
const stripeTex = (a, b) => { const c = document.createElement('canvas'); c.width = 128; c.height = 32; const x = c.getContext('2d'); for (let k = 0; k < 8; k++) { x.fillStyle = k % 2 ? b : a; x.fillRect(k * 16, 0, 16, 32); } x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(0, 26, 128, 6); const t = new T.CanvasTexture(c); t.wrapS = T.RepeatWrapping; return t; };
function bagIcon(x, s) {
  x.save(); x.scale(s, s); x.lineWidth = 4; x.strokeStyle = PAL.ink; x.lineJoin = 'round';
  x.fillStyle = '#e9684a'; x.beginPath(); x.moveTo(-22, -8); x.lineTo(22, -8); x.lineTo(26, 26); x.lineTo(-26, 26); x.closePath(); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(-11, -8); x.bezierCurveTo(-11, -30, 11, -30, 11, -8); x.stroke();
  x.fillStyle = '#f2c14a'; x.beginPath(); x.arc(0, 9, 8, 0, 7); x.fill(); x.stroke(); x.restore();
}
const storeG = new T.Group(); storeG.position.set(STORE.x, 0, STORE.z); sc.add(storeG);
{
  const L = [], P = at(STORE.x, STORE.z, 0, L), WD = '#9a6542', DK = '#6b4630', CR = '#f6e7c8', FZ = 1.1;
  P(box(3.3, 0.16, 2.5), '#b8aa98', 1400, 0, 0.08, 0);
  P(box(3.0, 1.75, 2.2, 3, 2, 2), (cx, cy, cz, i) => tone(cy < 0.62 ? '#a8774a' : CR, i, 0.5), 1401, 0, 0.95, 0);
  [-1.5, 1.5].forEach((x) => [-1.1, 1.1].forEach((z) => P(box(0.14, 1.8, 0.14), DK, 1402, x, 0.95, z)));
  P(box(3.1, 0.12, 2.3), DK, 1403, 0, 1.86, 0);
  /* a gabled roof in two slopes, a ridge and a little chimney */
  [-1, 1].forEach((s) => P(box(3.4, 0.12, 1.45), '#3f7d62', 1404, 0, 2.25, s * 0.62, { rx: s * 0.62 }));
  P(box(3.45, 0.1, 0.16), '#2f5f4a', 1405, 0, 2.62, 0); P(box(0.3, 0.6, 0.3), '#b8aa98', 1406, 1.0, 2.6, -0.4);
  /* gable ends */
  [-1, 1].forEach((s) => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute([0, 1.92, -1.1, 0, 1.92, 1.1, 0, 2.6, 0], 3)); g.computeVertexNormals(); P(g.toNonIndexed ? g : g, CR, 1407, s * 1.49, 0, 0, { ry: 0 }); });
  /* front: a door, two big windows with goods inside, a step and flower boxes */
  P(box(0.74, 1.2, 0.06), DK, 1408, 0, 0.66, FZ + 0.02); P(box(0.62, 1.1, 0.05), '#5a9fc4', 1409, 0, 0.62, FZ + 0.05); P(box(0.4, 0.4, 0.02), '#cfe8f2', 1410, 0, 0.88, FZ + 0.08); P(ico(0.035, 1, 1411), '#e8b84a', 1411, 0.22, 0.6, FZ + 0.1);
  P(box(1.0, 0.06, 0.4), '#b8aa98', 1412, 0, 0.03, FZ + 0.25);
  [-0.95, 0.95].forEach((x, k) => { P(box(0.9, 0.7, 0.06), DK, 1413, x, 1.0, FZ + 0.02); P(box(0.78, 0.58, 0.02), '#ffe9b0', 1414, x, 1.0, FZ + 0.06);
    P(box(0.06, 0.58, 0.03), DK, 1415, x, 1.0, FZ + 0.08); P(box(0.95, 0.12, 0.18), WD, 1416, x, 0.6, FZ + 0.12);
    P(fluff(0.09, 1417 + k, 4).scale(2.6, 0.7, 0.8), (cx, cy, cz, i) => leafY('#5d9160', cy, -0.05, 0.08, i), 1417 + k, x, 0.7, FZ + 0.12);
    for (let j = 0; j < 5; j++) P(ico(0.04, 0, 1420 + j), ['#f6b8c8', '#e9684a', '#fffbf4', '#f2c14a'][(j + k) % 4], 1420 + j, x - 0.3 + j * 0.15, 0.76, FZ + 0.13 + (j % 2) * 0.03);
    /* goods in the window: a shoe, a basket, a little lamp */
    P(box(0.16, 0.1, 0.22), k ? '#5a9fc4' : '#e9684a', 1425, x - 0.2, 0.78, FZ - 0.05); P(box(0.2, 0.14, 0.16), '#c9a36c', 1426, x + 0.15, 0.8, FZ - 0.05); P(new T.CylinderGeometry(0.05, 0.08, 0.12, 8), '#f2c14a', 1427, x + 0.02, 1.05, FZ - 0.05); });
  /* crates and a barrel by the door, a bench */
  P(box(0.4, 0.34, 0.4), WD, 1430, 1.85, 0.17, 0.75); P(box(0.32, 0.28, 0.32), '#c9a36c', 1431, 1.82, 0.48, 0.72, { ry: 0.3 }); P(new T.CylinderGeometry(0.2, 0.2, 0.5, 12), WD, 1432, -1.85, 0.25, 0.8);
  const m = merged(L);
  /* the striped awning over the front */
  const aw = new T.Mesh(new T.PlaneGeometry(3.1, 0.9, 1, 1), new T.MeshStandardMaterial({ map: stripeTex('#e9684a', '#fff6e4'), roughness: 0.9, side: T.DoubleSide })); aw.material.map.repeat.set(4, 1);
  aw.position.set(STORE.x, 1.62, STORE.z + FZ + 0.36); aw.rotation.x = -1.0; aw.castShadow = true; sc.add(aw);
  const val = new T.Mesh(new T.PlaneGeometry(3.1, 0.18), aw.material); val.position.set(STORE.x, 1.24, STORE.z + FZ + 0.74); sc.add(val);
  /* the sign board: a shopping bag on a wooden plank */
  const c = document.createElement('canvas'); c.width = 256; c.height = 96; const x = c.getContext('2d'); x.fillStyle = '#c9a36c'; x.fillRect(0, 0, 256, 96); x.strokeStyle = '#6b4630'; x.lineWidth = 8; x.strokeRect(4, 4, 248, 88);
  x.save(); x.translate(128, 50); bagIcon(x, 1.1); x.restore(); [[52, 48], [204, 48]].forEach(([a, b]) => { x.fillStyle = '#f2c14a'; x.beginPath(); x.arc(a, b, 12, 0, 7); x.fill(); x.strokeStyle = PAL.ink; x.lineWidth = 4; x.stroke(); });
  const sign = new T.Mesh(new T.PlaneGeometry(1.4, 0.52), new T.MeshStandardMaterial({ map: new T.CanvasTexture(c), roughness: 0.9 })); sign.position.set(STORE.x, 2.1, STORE.z + FZ + 0.16); sign.rotation.x = -0.2; sc.add(sign);
  solid(STORE.x - 0.85, STORE.z - 0.1, 1.15); solid(STORE.x + 0.85, STORE.z - 0.1, 1.15);
}
const storeRing = mkRing(SDOOR.x, SDOOR.z);
const storeSign = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#fff6e4'; x.strokeStyle = PAL.ink; x.lineWidth = 6; x.beginPath(); x.arc(64, 64, 56, 0, 7); x.fill(); x.stroke(); x.save(); x.translate(64, 68); bagIcon(x, 1.15); x.restore();
  const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false })); sp.renderOrder = 5; sp.scale.set(1.0, 1.0, 1); sp.position.set(STORE.x, 3.4, STORE.z + 0.8); sc.add(sp); sp.visible = false; return sp; })();
/* a parcel over the house when something waits there */
let GIFT_IMG = '';
const giftSign = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#fff6e4'; x.strokeStyle = PAL.ink; x.lineWidth = 6; x.beginPath(); x.arc(64, 64, 56, 0, 7); x.fill(); x.stroke();
  x.lineWidth = 4; x.fillStyle = '#5a9fc4'; x.fillRect(34, 52, 60, 44); x.strokeRect(34, 52, 60, 44); x.fillStyle = '#7fb8d8'; x.fillRect(30, 40, 68, 14); x.strokeRect(30, 40, 68, 14); x.fillStyle = '#f2c14a'; x.fillRect(58, 40, 12, 56); x.strokeRect(58, 40, 12, 56);
  x.beginPath(); x.ellipse(54, 34, 11, 7, -0.5, 0, 7); x.ellipse(74, 34, 11, 7, 0.5, 0, 7); x.fillStyle = '#e9684a'; x.fill(); x.stroke();
  const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false })); sp.renderOrder = 5; sp.scale.set(1.0, 1.0, 1); sc.add(sp); sp.visible = false; GIFT_IMG = c.toDataURL(); return sp; })();

/* ---------- the store inside ---------- */
const SL = [];
{
  const X = (x) => SI.x + x, Z = (z) => SI.z + z, P = at(SI.x, SI.z, 0, SL), DK = '#6b4630', WD = '#9a6542', LW = '#b98552';
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; return t; };
  let g = new T.PlaneGeometry(60, 44); g.rotateX(-Math.PI / 2); const yard = new T.Mesh(g, new T.MeshStandardMaterial({ color: '#22301f', roughness: 1 })); yard.position.set(X(0), -0.01, Z(0)); sc.add(yard);
  const floorT = canvasTex(256, 256, (x, w, h) => { for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { x.fillStyle = (r + c) % 2 ? '#d8c6a4' : '#c4ac84'; x.fillRect(c * 32, r * 32, 32, 32); } x.strokeStyle = 'rgba(80,55,30,0.25)'; x.lineWidth = 2; for (let k = 0; k <= 8; k++) { x.beginPath(); x.moveTo(k * 32, 0); x.lineTo(k * 32, h); x.moveTo(0, k * 32); x.lineTo(w, k * 32); x.stroke(); } });
  floorT.repeat.set(12 / 3, 8.8 / 3);
  const fl = new T.Mesh(new T.PlaneGeometry(12, 8.8), new T.MeshStandardMaterial({ map: floorT, roughness: 0.85 })); fl.rotation.x = -Math.PI / 2; fl.position.set(X(0), 0.03, Z(0.2)); fl.receiveShadow = true; sc.add(fl);
  const paper = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#f6e7c8'; x.fillRect(0, 0, w, h); x.fillStyle = '#efd9b0'; for (let k = 0; k < 8; k++) x.fillRect(k * 16, 0, 7, h * 0.6); x.fillStyle = '#7b5e4e'; x.fillRect(0, h * 0.6, w, h * 0.4); x.fillStyle = '#5a4030'; x.fillRect(0, h * 0.6, w, 6); for (let k = 0; k < 4; k++) x.fillRect(k * 32, h * 0.6, 3, h * 0.4); });
  const wall = (len, hgt, cx, cz, rot) => { const t = paper.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(len / 1.2)), 1); const m = new T.Mesh(new T.BoxGeometry(len, hgt, 0.18), new T.MeshStandardMaterial({ map: t, roughness: 0.95 })); m.position.set(X(cx), hgt / 2, Z(cz)); m.rotation.y = rot || 0; m.castShadow = m.receiveShadow = true; sc.add(m); P(box(len + 0.06, 0.08, 0.26), DK, 1500, cx, hgt + 0.02, cz, { ry: rot || 0 }); };
  wall(12.2, 2.2, 0, -4.2); wall(8.8, 0.9, -6.0, 0.2, Math.PI / 2); wall(8.8, 0.9, 6.0, 0.2, Math.PI / 2); wall(5.0, 0.45, -3.5, 4.6); wall(5.0, 0.45, 3.5, 4.6);
  [-1.0, 1.0].forEach((x) => P(box(0.2, 1.4, 0.2), DK, 1501, x, 0.7, 4.6)); P(box(2.2, 0.16, 0.24), DK, 1502, 0, 1.45, 4.6);
  /* back wall: shelves full of goods, a clock and two warm lamps */
  [-4.3, -2.4, 2.4, 4.3].forEach((x, k) => { P(box(1.6, 1.8, 0.36), WD, 1503, x, 0.9, -3.95); [0.35, 0.85, 1.35].forEach((y, r) => { P(box(1.5, 0.04, 0.32), LW, 1504, x, y, -3.92);
    for (let j = 0; j < 5; j++) { const c = ['#e9684a', '#5a9fc4', '#f2c14a', '#74a857', '#f6b8c8', '#fff6e4', '#7b5ea7'][(j + r * 2 + k) % 7]; if ((j + r + k) % 3 === 0) P(new T.CylinderGeometry(0.08, 0.08, 0.2, 8), c, 1505 + j, x - 0.58 + j * 0.29, y + 0.12, -3.9); else P(box(0.2, 0.16 + 0.04 * (j % 2), 0.2), c, 1510 + j, x - 0.58 + j * 0.29, y + 0.1, -3.9); } }); });
  /* a rug down the middle, plants in the corners, a counter with a till */
  const rugT = canvasTex(256, 128, (x, w, h) => { x.fillStyle = '#7a3f3a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e6b45a'; x.lineWidth = 8; x.strokeRect(10, 10, w - 20, h - 20); x.fillStyle = '#e6b45a'; for (let k = 0; k < 7; k++) { x.beginPath(); x.arc(32 + k * 32, 64, 9, 0, 7); x.fill(); } });
  const rug = new T.Mesh(new T.PlaneGeometry(2.2, 5.4), new T.MeshStandardMaterial({ map: rugT, roughness: 1 })); rug.rotation.set(-Math.PI / 2, 0, Math.PI / 2); rug.position.set(X(0), 0.035, Z(1.3)); rug.rotation.z = Math.PI / 2; rug.receiveShadow = true; sc.add(rug);
  [[-5.5, 4.0], [5.5, 4.0], [-5.5, -3.4], [5.5, -3.4]].forEach(([x, z], k) => { P(new T.CylinderGeometry(0.2, 0.15, 0.34, 10), '#c8734a', 1520, x, 0.17, z); P(fluff(0.24, 1521 + k, 5).scale(1, 1.4, 1), (cx, cy, cz, i) => leafY('#5d9160', cy, -0.2, 0.3, i), 1521 + k, x, 0.55, z); });
  P(box(1.4, 0.8, 0.5), WD, 1530, 0, 0.4, -3.2); P(box(1.5, 0.06, 0.6), LW, 1531, 0, 0.82, -3.2); P(box(0.36, 0.22, 0.3), '#3a3f48', 1532, 0.35, 0.96, -3.2); P(box(0.3, 0.06, 0.24), '#e8b84a', 1533, 0.35, 1.1, -3.2); P(box(0.2, 0.12, 0.2), '#c9a36c', 1534, -0.35, 0.92, -3.2);
  /* lamps hanging from nowhere are odd, so the light comes from lanterns on the back shelves */
  [-3.35, 3.35].forEach((x) => { P(box(0.18, 0.24, 0.18), '#3a3f48', 1537, x, 1.6, -3.9); P(box(0.13, 0.18, 0.13), '#ffd98a', 1538, x, 1.6, -3.89); });
  merged(SL);
}
/* the shopkeeper: a bunny behind the counter, who hops when something is sold */
const keeper = guestModel('bunny'); keeper.position.set(SI.x, 0, SI.z - 3.75); sc.add(keeper);
{ const apron = new T.CylinderGeometry(0.2, 0.26, 0.3, 10); part(fac(apron, '#5a9fc4', 7), keeper, 0, 0.33, 0.02); }
const SGLOW = [[-3.35, 1.6, -3.7], [3.35, 1.6, -3.7], [-3.6, 1.4, 1.2], [3.6, 1.4, 1.2]].map(([x, y, z]) => { const s = new T.Sprite(glowMat); s.scale.set(1.6, 1.6, 1); s.position.set(SI.x + x, y, SI.z + z); s.visible = false; sc.add(s); return { s, x, y, z }; });

/* ---------- the counters: four little stalls, each showing only the next one or two things, with a jar beside each ----------
   Kids can't read, so nothing here has a number. A jar fills as far as your coins (or hearts, for Pip's gear) reach; a full
   jar sparkles and its ring glows green, and standing on a green ring buys it while coins hop into the jar. Things that
   can't be bought yet are not shown at all, and an empty spot gets a cloth over it. The picture on the awning says where
   the things go: Pip's gear, the house, the rooms, the yard and island. */
const STATIONS_S = [];
const CTRS = [
  { id: 'gear', col: '#d9573e', sign: 'pip', x: -4.75, z: 0.3, ry: Math.PI / 2, n: 1 },
  { id: 'house', col: '#5a7fb0', sign: 'house', x: -2.45, z: -2.45, ry: 0, n: 2 },
  { id: 'rooms', col: '#74a857', sign: 'bed', x: 2.45, z: -2.45, ry: 0, n: 2 },
  { id: 'yard', col: '#e6a93a', sign: 'tree', x: 4.75, z: 0.3, ry: -Math.PI / 2, n: 2 }
];
const CTR_TOP = 0.92, JAR_H = 0.38;
const ctrW = (c) => (c.n === 1 ? 1.7 : 2.8);
/* from a counter's own space (x along it, z towards the shopper) to the world */
const ctrPt = (c, lx, lz) => { const cs = Math.cos(c.ry), sn = Math.sin(c.ry); return [SI.x + c.x + lx * cs + lz * sn, SI.z + c.z - lx * sn + lz * cs]; };
function ctrSign(kind, col) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d');
  x.fillStyle = '#fffaf0'; x.beginPath(); x.arc(128, 128, 118, 0, 7); x.fill(); x.lineWidth = 16; x.strokeStyle = col; x.stroke();
  if (kind === 'pip') { x.fillStyle = '#c0563a'; x.beginPath(); x.roundRect(88, 136, 80, 78, 30); x.fill(); x.fillStyle = '#f3c9a4'; x.beginPath(); x.arc(128, 118, 40, 0, 7); x.fill();
    x.fillStyle = '#e0a84a'; x.beginPath(); x.ellipse(128, 92, 66, 18, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(128, 76, 36, 24, 0, 0, 7); x.fill(); x.fillStyle = PAL.ink; x.beginPath(); x.arc(114, 124, 5, 0, 7); x.arc(142, 124, 5, 0, 7); x.fill(); }
  else if (kind === 'tree') { x.fillStyle = '#8a5a3a'; x.fillRect(116, 140, 24, 70); x.fillStyle = '#74a857'; x.beginPath(); x.arc(128, 112, 62, 0, 7); x.fill(); x.fillStyle = '#e9684a'; [[100, 96], [150, 122], [126, 74], [104, 138]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 12, 0, 7); x.fill(); }); x.fillStyle = '#3f7d62'; x.fillRect(60, 206, 136, 10); }
  else drawIcon(x, kind, 128, 132, 2.6);
  const t = new T.CanvasTexture(cv); if ('colorSpace' in t) t.colorSpace = T.SRGBColorSpace; return t;
}
const STAR_TEX = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d'); x.fillStyle = '#ffe066'; x.strokeStyle = '#b07a1e'; x.lineWidth = 3; x.beginPath();
  for (let k = 0; k < 8; k++) { const r = k % 2 ? 11 : 28, a = -Math.PI / 2 + k * Math.PI / 4; x.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } x.closePath(); x.fill(); x.stroke(); return new T.CanvasTexture(cv); })();
const JAR_GLASS = new T.MeshStandardMaterial({ color: '#e4f5fc', transparent: true, opacity: 0.35, roughness: 0.08, depthWrite: false, side: T.DoubleSide });
const JAR_COIN = new T.MeshStandardMaterial({ color: '#f2c14a', roughness: 0.45, emissive: '#5a3a00', emissiveIntensity: 0.3 });
const JAR_HEART = new T.MeshStandardMaterial({ color: '#ef7f8f', roughness: 0.5, emissive: '#5a1820', emissiveIntensity: 0.3 });
function jarModel() {
  const g = new T.Group(), fg = new T.CylinderGeometry(0.135, 0.135, 1, 18); fg.translate(0, 0.5, 0);
  const fill = new T.Mesh(fg, JAR_COIN); fill.position.y = 0.035; fill.scale.y = 0.001; g.add(fill);
  const glass = new T.Mesh(new T.CylinderGeometry(0.165, 0.155, 0.44, 20, 1, true), JAR_GLASS); glass.position.y = 0.22; glass.renderOrder = 2; g.add(glass);
  part(fac(new T.CylinderGeometry(0.155, 0.155, 0.03, 18), '#cfe6ef', 1661), g, 0, 0.015, 0, true);
  part(fac(new T.CylinderGeometry(0.15, 0.15, 0.06, 16), '#c9a37a', 1660), g, 0, 0.47, 0, true);
  const glow = new T.Sprite(glowMat.clone()); glow.scale.set(1.0, 1.0, 1); glow.position.y = 0.24; glow.material.opacity = 0; g.add(glow);
  const star = new T.Sprite(new T.SpriteMaterial({ map: STAR_TEX, transparent: true, depthWrite: false })); star.scale.set(0.2, 0.2, 1); star.position.set(0.16, 0.6, 0); star.visible = false; g.add(star);
  return { g, fill, glow, star, lv: 0 };
}
const CLOTH_GEO = (() => { const g = new T.SphereGeometry(0.34, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(1.25, 0.55, 1); return fac(g, '#e3cfae', 1662); })();
{
  const DK = '#6b4630', WD = '#9a6542', LW = '#b98552';
  CTRS.forEach((c) => {
    const L = [], [cx, cz] = ctrPt(c, 0, 0), P = at(cx, cz, c.ry, L), w = ctrW(c);
    P(box(w, 0.84, 0.7), WD, 1640, 0, 0.42, 0); P(box(w + 0.12, 0.08, 0.8), LW, 1641, 0, 0.88, 0.02); P(box(w + 0.02, 0.16, 0.04), c.col, 1642, 0, 0.62, 0.36);
    [-1, 1].forEach((s) => P(box(0.08, 1.25, 0.08), DK, 1643, s * (w / 2 - 0.06), 1.5, -0.3));
    const n = Math.round(w / 0.3), sw = w / n; for (let i = 0; i < n; i++) P(box(sw + 0.002, 0.05, 0.5), i % 2 ? '#fff6e4' : c.col, 1644 + (i % 2), -w / 2 + sw * (i + 0.5), 2.16, -0.22, { rx: 0.3 });
    for (let i = 0; i < n; i++) P(box(sw * 0.9, 0.14, 0.03), i % 2 ? '#fff6e4' : c.col, 1646 + (i % 2), -w / 2 + sw * (i + 0.5), 2.0, 0.03);
    merged(L);
    const sg = new T.Sprite(new T.SpriteMaterial({ map: ctrSign(c.sign, c.col), transparent: true })); sg.scale.set(0.8, 0.8, 1);
    const [sx, sz] = ctrPt(c, 0, -0.2); sg.position.set(sx, 2.75, sz); sc.add(sg);
    for (let k = 0; k < c.n; k++) {
      const off = c.n === 1 ? 0 : (k ? 0.68 : -0.68), [x, z] = ctrPt(c, off - 0.14, 0.02), [jx, jz] = ctrPt(c, off + 0.42, 0.12), [padX, padZ] = ctrPt(c, off, 1.22);
      const cv = document.createElement('canvas'); cv.width = cv.height = 192; const tex = new T.CanvasTexture(cv);
      const pad = new T.Mesh(new T.CircleGeometry(0.56, 32), new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })); pad.rotation.x = -Math.PI / 2; pad.position.set(padX, 0.05, padZ); sc.add(pad);
      const hold = new T.Group(); hold.position.set(x, CTR_TOP, z); sc.add(hold);
      const jar = jarModel(); jar.g.position.set(jx, CTR_TOP, jz); jar.g.scale.setScalar(1.35); sc.add(jar.g);
      const tcv = document.createElement('canvas'); tcv.width = 256; tcv.height = 96; const ttex = new T.CanvasTexture(tcv); if ('colorSpace' in ttex) ttex.colorSpace = T.SRGBColorSpace;
      const tag = new T.Sprite(new T.SpriteMaterial({ map: ttex, transparent: true, depthWrite: false })); tag.scale.set(1.12, 0.42, 1); { const [tx, tz] = ctrPt(c, off + 0.36, 0.5); tag.position.set(tx, CTR_TOP - 0.22, tz); } tag.renderOrder = 3; tag.visible = false; sc.add(tag);
      const cloth = new T.Mesh(CLOTH_GEO, MAT); cloth.position.set(x + 0, CTR_TOP, z); cloth.rotation.y = c.ry; cloth.castShadow = true; sc.add(cloth);
      STATIONS_S.push({ kind: 'slot', ctr: c, i: k, x, z, jx, jz, padX, padZ, pad, cv, tex, hold, jar, cloth, tag, tcv, ttex, tagK: '', item: null, key: '', shown: '', tick: 0, pay: 0, poor: false, spin: hash(k + 3, c.x) * 6 });
    }
  });
}
/* what each station offers right now: { id, cost, paid key, make() for the picture } */
const furnOpen = (f) => f.need <= stS().size;
function offerOf(s) {
  const S = stS();
  if (s.kind === 'gear') { const id = GEAR[s.i], u = UP_BY[id], lv = state.lv[id]; if (lv >= u.max) return { id: 'g:' + id, max: true, make: () => gearModel(id, u.max) }; return { id: 'g:' + id, gear: id, cost: upCost(u), lv: lv + 1, make: () => gearModel(id, lv + 1) }; }
  if (s.kind === 'furn') { const list = FURN.filter((f) => !S.furn[f.id] && furnOpen(f)); const f = list[s.i]; if (!f) return null; return { id: 'f:' + f.id, furn: f, cost: f.cost, make: () => furnModel(f) }; }
  if (s.kind === 'deco') { const d = DECO_L.find((q) => !S.deco[q.id]); if (!d) return null; return { id: 'd:' + d.id, deco: d, cost: d.cost, make: () => { const g = painterGroup(DECO_B[d.id]); if (d.id === 'lights' || d.id === 'lanterns') g.children[0].position.y = d.id === 'lights' ? -1.0 : 0; g.scale.setScalar(d.id === 'lights' ? 0.55 : d.id === 'lanterns' ? 0.5 : 0.8); return g; } }; }
  if (s.kind === 'size') { const n = S.size + 1, z = SIZES[n]; if (!z) return { id: 'h:max', max: true, make: () => miniHouse(S.size, 0) }; return { id: 'h:' + n, size: n, cost: z.cost, make: () => miniHouse(S.size, n) }; }
  return null;
}
/* a furniture prop, taken from the house and set on the pedestal at a size that fits */
function furnModel(f) {
  const g = new T.Group();
  if (f.room === 'hall') { const h = painterGroup(HALL_B[f.id].b); g.add(h); }
  else { const e = INT.extras.find((q) => q.id === f.room && q.lv === f.lv); if (!e) return g; const m = new T.Mesh(e.m.geometry, MAT); g.add(m); m.geometry.computeBoundingBox(); const b = m.geometry.boundingBox; m.position.set(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2); }
  const bb = new T.Box3().setFromObject(g), sz = bb.getSize(new T.Vector3()), k = Math.min(2.4, 0.9 / Math.max(sz.x, sz.y, sz.z, 0.05)); g.scale.setScalar(k);
  const w = new T.Group(); w.add(g); return w;
}
/* the model house: what it is now (solid) and what it grows into (bright) */
function miniHouse(size, next) {
  const g = new T.Group(), k = 1;
  const add = (geo, col, x, y, z, glow) => { const m = part(fac(geo, col, 1700), g, x * k, y * k, z * k, true); if (glow) m.userData.glow = 1; return m; };
  if (size < 1) { const t = new T.CylinderGeometry(1.5, 1.5, 2.2, 3); t.rotateX(-Math.PI / 2); t.scale(1, 0.76, 1); add(t, '#e9684a', next === 1 ? -2.2 : 0, 0.57, 0); }
  if (size >= 1 || next === 1) { const n = size < 1; add(new T.BoxGeometry(2.4, 1.5, 2.0), n ? '#fff2c2' : '#f3e3c4', 0, 0.75, 0, n); { const r = new T.CylinderGeometry(0.01, 1.85, 1.0, 4, 1); r.rotateY(Math.PI / 4); r.scale(1, 1, 0.82); add(r, n ? '#f2c14a' : '#c0563a', 0, 2.0, 0, n); }
    add(new T.BoxGeometry(0.6, 0.95, 0.05), '#6b4630', 0, 0.48, 1.02); }
  const wing = (n) => { add(new T.BoxGeometry(1.6, 1.15, 1.6), n ? '#fff2c2' : '#f3e3c4', 2.05, 0.58, -0.2, n); const r = new T.CylinderGeometry(0.01, 1.3, 0.75, 4, 1); r.rotateY(Math.PI / 4); r.scale(1, 1, 0.9); add(r, n ? '#f2c14a' : '#c0563a', 2.05, 1.53, -0.2, n); };
  const tower = (n) => { add(new T.CylinderGeometry(0.62, 0.66, 2.4, 8), n ? '#fff2c2' : '#f3e3c4', -1.85, 1.2, -0.15, n); add(new T.ConeGeometry(0.82, 1.0, 8), n ? '#f2c14a' : '#3f7d62', -1.85, 2.9, -0.15, n); };
  if (size >= 2) wing(false); else if (next === 2) wing(true);
  if (size >= 3) tower(false); else if (next === 3) tower(true);
  const dormer = (n) => { add(new T.BoxGeometry(0.8, 0.55, 0.7), n ? '#fff2c2' : '#f3e3c4', 0, 1.95, 0.5, n); const r = new T.CylinderGeometry(0.01, 0.62, 0.42, 4, 1); r.rotateY(Math.PI / 4); add(r, n ? '#f2c14a' : '#3f7d62', 0, 2.43, 0.5, n); add(new T.BoxGeometry(0.28, 0.7, 0.28), n ? '#fff2c2' : '#b8aa98', 0.62, 2.35, -0.35, n); };
  if (size >= 4) dormer(false); else if (next === 4) dormer(true);
  g.scale.setScalar(0.27); g.position.x = -0.05; const w = new T.Group(); w.add(g); return w;
}
/* what each counter offers right now: only the next things, cheapest first */
function ctrOffers(c, cat) {
  if (c.id === 'gear') { for (let k = 0; k < GEAR.length; k++) { const o = offerOf({ kind: 'gear', i: k }); if (o && o.cost) return [o]; } return []; }
  if (c.id === 'house') return cat.filter((q) => q.act.k === 'ex').slice(0, 2); /* the house itself grows from the ring by its door */
  if (c.id === 'rooms') return cat.filter((q) => q.act.k === 'type').slice(0, 2);
  return cat.filter((q) => q.act.k === 'isle' || q.act.k === 'deco').slice(0, 2);
}
/* a model sized to stand on the counter */
function fitModel(m, size) {
  const w = new T.Group(); w.add(m); m.updateMatrixWorld(true);
  let bb = new T.Box3().setFromObject(m); const sz = bb.getSize(new T.Vector3()), k = Math.min(1.8, size / Math.max(sz.x, sz.y, sz.z, 0.05)); m.scale.multiplyScalar(k); m.updateMatrixWorld(true);
  bb = new T.Box3().setFromObject(m); const c = bb.getCenter(new T.Vector3()); m.position.x -= c.x; m.position.z -= c.z; m.position.y -= bb.min.y; return w;
}
const slotLeft = (o) => o.cost - (stS().paid[o.id] || 0);
/* the price tag over each jar: a heart or a coin and how many are still needed (green once you have enough) */
function drawTag(s, o, can) {
  if (!s.tag) return; s.tag.visible = !!o && !!o.cost; if (!s.tag.visible) return;
  const left = Math.max(0, slotLeft(o)), k = (o.gear ? 'h' : 'c') + left + ':' + can; if (k === s.tagK) return; s.tagK = k;
  const x = s.tcv.getContext('2d'), t = fmt(left); x.clearRect(0, 0, 256, 96); x.font = '800 54px system-ui, sans-serif';
  const w = Math.min(244, 96 + x.measureText(t).width + 18), x0 = (256 - w) / 2;
  x.fillStyle = can ? '#3f7d62' : '#fffaf0'; x.strokeStyle = PAL.ink; x.lineWidth = 7; x.beginPath(); x.roundRect(x0, 10, w, 76, 38); x.fill(); x.stroke();
  drawIcon(x, o.gear ? 'heart' : 'coin', x0 + 44, 48, 0.95); x.fillStyle = can ? '#fffaf0' : PAL.ink; x.textBaseline = 'middle'; x.fillText(t, x0 + 82, 51);
  s.ttex.needsUpdate = true;
}
function drawPad(s, o) {
  const can = !!o && purse(o) >= slotLeft(o), key = (o ? o.id : '-') + ':' + can + ':' + (o ? slotLeft(o) : 0); drawTag(s, o, can);
  if (key === s.shown) return; s.shown = key;
  const x = s.cv.getContext('2d'); x.clearRect(0, 0, 192, 192); s.pad.visible = !!o; if (!o) return;
  if (can) { x.fillStyle = 'rgba(236,250,226,0.96)'; x.beginPath(); x.arc(96, 96, 86, 0, 7); x.fill(); x.lineWidth = 12; x.strokeStyle = '#3f7d62'; x.stroke(); drawIcon(x, o.gear ? 'heart' : 'coin', 96, 98, 1.25); }
  else { x.fillStyle = 'rgba(255,246,228,0.35)'; x.beginPath(); x.arc(96, 96, 80, 0, 7); x.fill(); x.setLineDash([18, 14]); x.lineWidth = 8; x.strokeStyle = '#b49a74'; x.stroke(); x.setLineDash([]); }
  s.tex.needsUpdate = true;
}
function syncStation(s, o) {
  const id = o ? o.id + (o.lv || '') + (o.size || '') : '';
  if (id !== s.key) { const had = !!s.key; s.key = id; while (s.hold.children.length) s.hold.remove(s.hold.children[0]);
    if (o) { const m = fitModel(o.make(), o.size ? 1.0 : s.ctr.id === 'gear' ? 0.62 : 0.8); s.hold.add(m); if (had) riseIn(m, 0.35, 0.7, true); }
    s.jar.fill.material = o && o.gear ? JAR_HEART : JAR_COIN; s.shown = ''; }
  s.item = o; s.jar.g.visible = !!o; s.cloth.visible = !o; drawPad(s, o); return o;
}
/* all counters at once, so the shop's list is worked out one time per frame */
function syncSlots() {
  if (!stS()) return; const cat = catOffers().filter((q) => q.act).sort((a, b) => a.cost - b.cost);
  CTRS.forEach((c) => { const L = ctrOffers(c, cat); STATIONS_S.forEach((s) => { if (s.ctr === c) syncStation(s, L[s.i] || null); }); });
}
/* the cheapest thing that can be bought right now, and the cheapest thing at all (for the wish bubble) */
function storeOffers() { return STATIONS_S.filter((s) => s.item && s.item.cost).map((s) => ({ s, o: s.item })); }
function cheapest(onlyAfford) { let best = null; storeOffers().forEach((q) => { const left = slotLeft(q.o); if (onlyAfford && purse(q.o) < left) return; if (!best || left < best.left) best = { s: q.s, o: q.o, left }; }); return best; }

/* ---------- buying ---------- */
let spinT = 0;
function storeBuy(s, o) {
  const S = stS(); delete S.paid[o.id];
  const pic = thumbOf(o.id + (o.lv || ''), o.make);
  if (o.gear) { state.lv[o.gear]++; buildAvatar(); spinT = 1; confetti(pip.position.x, 1.2, pip.position.z, 48); }
  else if (o.furn) { S.furn[o.furn.id] = 1; S.pend.push('f:' + o.furn.id); confetti(s.x, 1.2, s.z, 36); }
  else if (o.deco) { S.deco[o.deco.id] = 1; S.pend.push('d:' + o.deco.id); confetti(s.x, 1.2, s.z, 36); }
  else if (o.size) { S.size = o.size; S.pend.push('size' + o.size); confetti(s.x, 1.3, s.z, 60); }
  keeper.userData.hop = 1; fanfare(!!o.size || !!o.gear); badge(pic); save();
}
/* stand on a green ring: coins hop into the jar, and after a moment it's yours. Stepping off before then costs nothing. */
const PAY_T = 1.0;
function slotBuy(s, o) {
  if (o.act) { if (!catBuy(o.act)) return false; keeper.userData.hop = 1; return true; }
  spend(o, slotLeft(o)); storeBuy(s, o); return true;
}
function payStation(s, dt) {
  const o = s.item; s.pad.scale.setScalar(1 + (reduced ? 0 : Math.sin(time * 3 + s.spin) * 0.03));
  if (!o || !o.cost) { s.pay = 0; return; }
  const on = Math.hypot(pip.position.x - s.padX, pip.position.z - s.padZ) < 0.56, still = Math.hypot(target.x - pip.position.x, target.z - pip.position.z) < 0.15, can = purse(o) >= slotLeft(o);
  if (on) s.pad.scale.setScalar(1.08);
  if (!on) s.done = false;
  if (on && still && can && !s.done) {
    s.pay += dt; s.tick -= dt;
    if (s.tick <= 0) { s.tick = 0.09; const m = new T.Mesh(o.gear ? heartGeo : coinGeo, o.gear ? heartMat : MAT); m.position.set(pip.position.x, 1.3, pip.position.z); sc.add(m);
      fly(m, () => tmpV.set(s.jx, CTR_TOP + 0.7, s.jz), () => sc.remove(m), 0.3); Snd.play('coin', { gain: 0.16 }, 0, 70); }
    if (s.pay >= PAY_T) { s.pay = 0; s.shown = ''; s.done = true; slotBuy(s, o); }
  } else s.pay = 0;
  if (on && still && !can && !s.poor && !s.done) { s.poor = true; Snd.play('tock', { gain: 0.3, f: 300 }); flash(o.gear ? ($('coins').parentNode || $('coins')) : coinPill, 'no'); }
  if (!on) s.poor = false;
}
/* the jars: filled as far as the purse reaches; a full one glows, and a star bobs over it */
function jarStep(s, dt) {
  const o = s.item; if (!o) return; const left = Math.max(1, slotLeft(o)), lv = Math.min(1, purse(o) / left), J = s.jar;
  J.lv += (lv - J.lv) * Math.min(1, dt * 4); J.fill.scale.y = Math.max(0.001, J.lv * JAR_H);
  const full = lv >= 1; J.star.visible = full; J.glow.material.opacity = full ? 0.55 + (reduced ? 0 : Math.sin(time * 4 + s.spin) * 0.2) : 0;
  if (full) { J.star.position.y = 0.62 + (reduced ? 0 : Math.abs(Math.sin(time * 3 + s.spin)) * 0.12); J.star.material.rotation = reduced ? 0 : time * 1.5; }
  J.g.rotation.z = s.pay > 0 && !reduced ? Math.sin(time * 30) * 0.05 : 0;
}
function slotsFrame(dt, freeHands) {
  STATIONS_S.forEach((s) => { if (freeHands) payStation(s, dt); jarStep(s, dt); s.hold.rotation.y += dt * (reduced ? 0.15 : 0.5); s.hold.position.y = CTR_TOP + (reduced ? 0 : Math.sin(time * 2 + s.spin) * 0.025); });
}

/* ---------- the house: closed rooms, the wing and the tower, decorations, unpacking ---------- */
const HX = (x) => HO.x + x, HZ = (z) => HO.z + z;
/* the right half of the house (kitchen and lounge) waits for the wing: its furniture is split off, the doorways boarded up */
const RIGHT = { static: null, flames: [] };
{
  const inRight = (x, z) => x > HO.x + 1.05 && x < HO.x + 6.4 && z > HO.z - 4.45 && z < HO.z + 4.45;
  const keep = INT.staticMesh ? [INT.staticMesh] : [];
  keep.forEach((m) => {
    const p = m.geometry.attributes.position, nn = m.geometry.attributes.normal, c = m.geometry.attributes.color, A = [[], [], []], B = [[], [], []];
    for (let i = 0; i < p.count; i += 3) { const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3, D = inRight(x, z) ? B : A;
      for (let j = i; j < i + 3; j++) { D[0].push(p.getX(j), p.getY(j), p.getZ(j)); D[1].push(nn.getX(j), nn.getY(j), nn.getZ(j)); D[2].push(c.getX(j), c.getY(j), c.getZ(j)); } }
    if (!B[0].length) return;
    const mk = (D) => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(D[0], 3)); g.setAttribute('normal', new T.Float32BufferAttribute(D[1], 3)); g.setAttribute('color', new T.Float32BufferAttribute(D[2], 3)); g.computeBoundingSphere(); return g; };
    m.geometry = mk(A); const r = new T.Mesh(mk(B), MAT); r.castShadow = r.receiveShadow = true; sc.add(r); RIGHT.static = r;
  });
  INT.flames.forEach((f) => { if (inRight(f.s.position.x, f.s.position.z)) RIGHT.flames.push(f); });
}
const lockSigns = [[1.0, -2.25, 2], [1.0, 2.25, 2], [5.75, -5.25, 3], [-5.75, -5.25, 4]].map(([lx, z, need]) => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#fff6e4'; x.strokeStyle = PAL.ink; x.lineWidth = 6; x.beginPath(); x.arc(64, 64, 56, 0, 7); x.fill(); x.stroke(); x.save(); x.translate(64, 60); x.scale(0.62, 0.62); drawIcon(x, 'house', 0, 0, 1.4); x.restore(); drawIcon(x, 'coin', 92, 92, 0.42);
  const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false })); sp.renderOrder = 4; sp.scale.set(0.6, 0.6, 1); sp.position.set(HX(lx), 1.1, HZ(z)); sp.userData.need = need; sc.add(sp); return sp; });
/* the hall furniture (biggest house) */
const HALL_M = {};
/* ---------- the house grows: size 1 is the cottage (left rooms), 2 adds the kitchen and lounge, 3 the east wing, 4 the west wing ---------- */
const ROOMSET = { 2: new T.Group(), 3: new T.Group(), 4: new T.Group() }; Object.values(ROOMSET).forEach((g) => sc.add(g));
let wallK = 0;
function wallSeg(v, at, a, b, parent) {
  const len = b - a; if (len < 0.05) return; wallK++;
  const m = part(fac(v ? new T.BoxGeometry(0.16, 0.7, len) : new T.BoxGeometry(len, 0.7, 0.16), PAL.paper, 1880 + wallK), parent, HX(v ? at : a + len / 2), 0.35, HZ(v ? a + len / 2 : at));
  part(fac(v ? new T.BoxGeometry(0.22, 0.06, len) : new T.BoxGeometry(len, 0.06, 0.22), PAL.trunk, 1940 + wallK), parent, m.position.x, 0.72, m.position.z, true); return m;
}
/* the original outer walls on the right and left (and the right front, the middle wall of the right rooms) are swapped for pieces that can open */
const HIDE_W = []; inG.children.forEach((c) => { if (!c.isMesh) return; const x = c.position.x, z = c.position.z; if ((Math.abs(Math.abs(x) - 6) < 0.01 && Math.abs(z + 1.25) < 0.01) || (Math.abs(x - 3.5) < 0.01 && (Math.abs(z - 4.5) < 0.01 || Math.abs(z) < 0.01))) HIDE_W.push(c); });
HIDE_W.forEach((c) => { c.visible = false; });
const WPC = { always: new T.Group(), closedE: new T.Group(), closedW: new T.Group(), plugs: new T.Group() }; Object.values(WPC).forEach((g) => sc.add(g));
[1, -1].forEach((s) => { wallSeg(1, s * 6, -7, -5.9, WPC.always); wallSeg(1, s * 6, -5.9, -4.6, s > 0 ? WPC.closedE : WPC.closedW); });
wallSeg(1, -6, -4.6, 4.5, WPC.always);
wallSeg(1, 6, -4.6, 4.5, ROOMSET[2]); wallSeg(0, 4.5, 1, 6, ROOMSET[2]); wallSeg(0, 0, 1, 6, ROOMSET[2]);
[[-2.95, -1.55], [1.55, 2.95]].forEach(([a, b]) => wallSeg(1, 1, a, b, WPC.plugs));
/* size 1: where the kitchen and lounge will be is still garden */
{ const g = new T.Mesh(new T.PlaneGeometry(5.3, 9.3, 10, 18), new T.MeshStandardMaterial({ color: '#2c3d26', roughness: 1 })); g.rotation.x = -Math.PI / 2; g.position.set(HX(3.65), 0.09, HZ(0)); g.receiveShadow = true; RIGHT.garden = g; sc.add(g);
  const L = [], P = at(HO.x, HO.z, 0, L); for (let k = 0; k < 14; k++) P(fluff(0.18 + hash(k, 2) * 0.12, 1860 + k, 4), (cx, cy, cz, i) => leafY('#3f6b46', cy, -0.1, 0.2, i), 1860 + k, 1.6 + hash(k, 3) * 4.0, 0.1, -4.0 + hash(k, 4) * 8.3); ATREC.pop(); const bushes = merged(L); RIGHT.bushes = bushes; }
/* a wing: floor, outer walls, a middle wall with a doorway, warm windows and two rugs */
function buildWing(s, group) {
  const x0 = s > 0 ? 6 : -11.4, x1 = s > 0 ? 11.4 : -6, cx = (x0 + x1) / 2;
  part(fac(new T.BoxGeometry(x1 - x0, 0.06, 11.5), '#d9bf94', 1876), group, HX(cx), 0.03, HZ(-1.25), true);
  { let pm = null; sc.children.forEach((c) => { if (!pm && c.isMesh && c.material && c.material.map && c.geometry.type === 'PlaneGeometry' && Math.abs(c.position.x - HX(0)) < 0.01 && Math.abs(c.position.z - HZ(-1.25)) < 0.01) pm = c.material; });
    const mat = pm ? pm.clone() : new T.MeshStandardMaterial({ color: '#b87a4b', roughness: 0.85 }); if (pm) { mat.map = pm.map.clone(); mat.map.needsUpdate = true; mat.map.repeat.set((x1 - x0) / 1.6, 11.5 / 1.6); }
    const f = new T.Mesh(new T.PlaneGeometry(x1 - x0, 11.5), mat); f.rotation.x = -Math.PI / 2; f.position.set(HX(cx), 0.068, HZ(-1.25)); f.receiveShadow = true; group.add(f); }
  wallSeg(1, s > 0 ? 11.4 : -11.4, -7, 4.5, group); wallSeg(0, -7, x0, x1, group); wallSeg(0, 4.5, x0, x1, group);
  wallSeg(0, -1.2, x0, cx - 0.7, group); wallSeg(0, -1.2, cx + 0.7, x1, group);
  const L = [], P = at(HO.x, HO.z, 0, L), wx = s > 0 ? 11.49 : -11.49;
  [-4.1, 1.6].forEach((z) => { P(box(0.06, 0.44, 0.7), '#6b4630', 1870, wx, 0.42, z); const w = new T.Mesh(new T.PlaneGeometry(0.56, 0.3), new T.MeshBasicMaterial({ color: '#ffd98a' })); w.position.set(HX(wx - s * 0.04), 0.42, HZ(z)); w.rotation.y = -s * Math.PI / 2; group.add(w); });
  ATREC.pop(); merged(L, MAT, group);
}
buildWing(1, ROOMSET[3]); buildWing(-1, ROOMSET[4]);
/* collision for the new walls: added to the house's wall list as they open */
const WING_W = { 3: [{ v: 1, x: 11.4, a: -7, b: 4.5, gaps: [] }, { v: 0, z: -7, a: 6, b: 11.4, gaps: [] }, { v: 0, z: 4.5, a: 6, b: 11.4, gaps: [] }, { v: 0, z: -1.2, a: 6, b: 11.4, gaps: [[8.0, 9.4]] }],
  4: [{ v: 1, x: -11.4, a: -7, b: 4.5, gaps: [] }, { v: 0, z: -7, a: -11.4, b: -6, gaps: [] }, { v: 0, z: 4.5, a: -11.4, b: -6, gaps: [] }, { v: 0, z: -1.2, a: -11.4, b: -6, gaps: [[-9.4, -8.0]] }] };
const W6 = { 1: WALLS.find((w) => w.v && w.x === 6), '-1': WALLS.find((w) => w.v && w.x === -6) };
let roomsAt = 0;
function roomsSync(size) {
  if (size === roomsAt) return; roomsAt = size;
  [3, 4].forEach((n) => { if (size >= n && !WING_W[n].added) { WING_W[n].added = 1; WING_W[n].forEach((w) => WALLS.push(w)); const e = W6[n === 3 ? 1 : '-1']; if (e) e.gaps.push([-5.9, -4.6]); } });
  HOUSE_IN.x1 = HO.x + (size >= 3 ? 11.1 : 5.7); HOUSE_IN.x0 = HO.x - (size >= 4 ? 11.1 : 5.7);
  if (inHouse && !inBarn && !inStore) { IN_B.x0 = HOUSE_IN.x0; IN_B.x1 = HOUSE_IN.x1; }
}
Object.keys(HALL_B).forEach((id) => { const h = HALL_B[id], L = [], P = at(HX(h.at[0]), HZ(h.at[1]), h.at[2], L); h.b(P); ATREC.pop(); const m = merged(L); m.visible = false; HALL_M[id] = m; });
/* outside: the wing, the tower and the decorations; each is a group so it can be built up piece by piece */
const HOUSE_ADD = { 2: new T.Group(), 3: new T.Group(), 4: new T.Group() };
{
  const W = HOUSE_ADD[2]; W.position.set(HOUSE.x + 2.05, 0, HOUSE.z - 0.2); sc.add(W);
  const wall = part(fac(jit(new T.BoxGeometry(1.6, 1.15, 1.6, 2, 2, 2), 0.015, 3), (cx, cy, cz, i) => tone(cy < -0.25 ? '#b8aa98' : '#f3e3c4', i, 0.5)), W, 0, 0.58, 0); wall.userData.part = 'wall';
  const rg = new T.CylinderGeometry(0.01, 1.3, 0.75, 4, 1); rg.rotateY(Math.PI / 4); rg.scale(1, 1, 0.9); const roof = part(fac(rg, '#c0563a', 1820), W, 0, 1.53, 0); roof.userData.part = 'roof';
  const det = new T.Group(); det.userData.part = 'det'; W.add(det);
  [-0.35, 0.35].forEach((x) => { const w = new T.Mesh(new T.BoxGeometry(0.34, 0.34, 0.03), lampMatH); w.position.set(x, 0.72, 0.81); det.add(w); part(fac(new T.BoxGeometry(0.42, 0.42, 0.04), '#6b4630', 1821), det, x, 0.72, 0.795); part(fac(new T.BoxGeometry(0.46, 0.08, 0.12), '#9a6542', 1822), det, x, 0.5, 0.85); });
  [-0.8, 0.8].forEach((x) => part(fac(new T.BoxGeometry(0.1, 1.15, 0.1), '#6b4630', 1823), det, x, 0.58, 0.8));
  const T3 = HOUSE_ADD[3]; T3.position.set(HOUSE.x - 1.85, 0, HOUSE.z - 0.15); sc.add(T3);
  const tw = part(fac(jit(new T.CylinderGeometry(0.62, 0.66, 2.4, 10, 3), 0.01, 4), (cx, cy, cz, i) => tone(cy < -0.9 ? '#b8aa98' : '#f3e3c4', i, 0.5)), T3, 0, 1.2, 0); tw.userData.part = 'wall';
  const tr = part(fac(new T.ConeGeometry(0.85, 1.0, 10), '#3f7d62', 1830), T3, 0, 2.9, 0); tr.userData.part = 'roof';
  const td = new T.Group(); td.userData.part = 'det'; T3.add(td);
  [0.75, 1.75].forEach((y) => { const w = new T.Mesh(new T.CircleGeometry(0.15, 12), lampMatH); w.position.set(0, y, 0.655); td.add(w); part(fac(new T.TorusGeometry(0.16, 0.03, 4, 14), '#6b4630', 1831), td, 0, y, 0.66); });
  part(fac(new T.ConeGeometry(0.03, 0.4, 4), '#3a3f48', 1832), td, 0, 3.55, 0); part(fac(new T.BoxGeometry(0.28, 0.16, 0.02), '#e9684a', 1833), td, 0.15, 3.6, 0);
  part(fac(new T.TorusGeometry(0.67, 0.035, 4, 20).rotateX(Math.PI / 2), '#6b4630', 1834), td, 0, 2.42, 0);
  const D4 = HOUSE_ADD[4]; D4.position.set(HOUSE.x, 0, HOUSE.z); sc.add(D4);
  const dw = part(fac(jit(new T.BoxGeometry(0.8, 0.55, 0.7, 2, 2, 2), 0.01, 3), '#f3e3c4', 1835), D4, 0, 1.95, 0.5); dw.userData.part = 'wall';
  const dg = new T.CylinderGeometry(0.01, 0.62, 0.42, 4, 1); dg.rotateY(Math.PI / 4); dg.scale(1, 1, 0.95); const dr = part(fac(dg, '#3f7d62', 1836), D4, 0, 2.43, 0.5); dr.userData.part = 'roof';
  const dd = new T.Group(); dd.userData.part = 'det'; D4.add(dd);
  { const w = new T.Mesh(new T.CircleGeometry(0.16, 14), lampMatH); w.position.set(0, 1.97, 0.86); dd.add(w); part(fac(new T.TorusGeometry(0.17, 0.035, 4, 16), '#6b4630', 1837), dd, 0, 1.97, 0.865); part(fac(new T.BoxGeometry(0.34, 0.03, 0.03), '#6b4630', 1838), dd, 0, 1.97, 0.87); }
  part(fac(jit(new T.BoxGeometry(0.28, 0.7, 0.28, 1, 2, 1), 0.01, 5), '#b8aa98', 1839), dd, 0.62, 2.35, -0.35); part(fac(new T.BoxGeometry(0.34, 0.07, 0.34), '#6b4630', 1843), dd, 0.62, 2.72, -0.35);
  [W, T3, D4].forEach((g) => { g.visible = false; });
}
const DECO_M = {};
DECO_L.forEach((d) => { const a = DECO_AT[d.id], g = painterGroup(DECO_B[d.id]); g.position.set(HOUSE.x + a[0], a[3] || 0, HOUSE.z + a[1]); g.rotation.y = a[2]; g.visible = false; sc.add(g); DECO_M[d.id] = g; });
const HOUSE_SOLID = { 2: [HOUSE.x + 2.05, HOUSE.z - 0.2, 1.05], 3: [HOUSE.x - 1.85, HOUSE.z - 0.15, 0.85] };
let solidsDone = {};
/* scaffolding for the build: poles and planks round a box, put up and taken down */
function scaffold(w, d, h) {
  const g = new T.Group(), L = [], P = at(0, 0, 0, L);
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => P(box(0.07, h, 0.07), '#9a6542', 1840, a * (w / 2 + 0.15), h / 2, b * (d / 2 + 0.15)));
  [0.5, 1.1, 1.7].filter((y) => y < h).forEach((y) => { [-1, 1].forEach((b) => P(box(w + 0.4, 0.05, 0.22), '#d9b27a', 1841, 0, y, b * (d / 2 + 0.2))); [-1, 1].forEach((a) => P(box(0.22, 0.05, d + 0.4), '#d9b27a', 1842, a * (w / 2 + 0.2), y, 0)); });
  ATREC.pop(); merged(L, MAT, g); return g;
}
/* one build at a time: furniture inside, decorations and house parts outside */
let BUILD = null;
function buildStart(what) {
  const S = stS();
  if (what.startsWith('f:')) { const id = what.slice(2), f = FURN.find((q) => q.id === id); const m = f.room === 'hall' ? HALL_M[id] : (INT.extras.find((q) => q.id === f.room && q.lv === f.lv) || {}).m; BUILD = { what, t: 0, d: 1.0, m }; if (m) { m.visible = true; riseIn(m, 0.05, 0.75); m.geometry.computeBoundingSphere(); const c = m.geometry.boundingSphere.center; BUILD.at = [c.x, c.z]; } return; }
  if (what.startsWith('c:')) { const id = what.slice(2), sp = CSPOT[id], g = applySpot(id); BUILD = { what, t: 0, d: 1.0, at: [HX(sp.x), HZ(sp.z)] }; if (g) { g.visible = true; riseIn(g, 0.05, 0.75, true); } return; }
  if (what === 'p:house') { BUILD = { what, t: 0, d: 0.6 }; paintHouse(false); return; }
  if (what.startsWith('d:')) { const g = DECO_M[what.slice(2)]; g.visible = true; riseIn(g, 0.05, 0.7, true); BUILD = { what, t: 0, d: 1.0, at: [g.position.x, g.position.z], y: g.position.y }; return; }
  if (what.startsWith('size')) { const n = +what.slice(4), g = HOUSE_ADD[n]; g.visible = true; const sz = n === 1 ? [2.6, 2.2, 2.4] : n === 2 ? [1.6, 1.6, 2.0] : n === 3 ? [1.4, 1.4, 2.9] : [2.4, 2.0, 2.6]; const sf = scaffold(sz[0], sz[1], sz[2]); sf.position.copy(g.position); sc.add(sf); riseIn(sf, 0, 0.5);
    g.children.forEach((c) => { c.visible = false; }); BUILD = { what, t: 0, d: 3.4, g, sf, n, at: [g.position.x, g.position.z + (n === 4 ? 0.6 : 0)], hit: 0 }; return; }
}
function buildStep(dt) {
  const b = BUILD; if (!b) return; b.t += dt;
  if (b.what.startsWith('size')) {
    const parts = b.g.children, wall = parts.find((c) => c.userData.part === 'wall'), roof = parts.find((c) => c.userData.part === 'roof'), det = parts.find((c) => c.userData.part === 'det');
    if (b.t > 0.45 && !wall.visible) { wall.visible = true; riseIn(wall, 0, 1.3); }
    if (b.t > 0.45 && b.t < 2.1) { b.hit -= dt; if (b.hit <= 0) { b.hit = 0.26; Snd.play('tock', { gain: 0.35, f: 380 + Math.random() * 200 }); confetti(b.at[0] + (Math.random() - 0.5) * 1.6, 0.2, b.at[1] + 0.9, 6, 1.6); } }
    if (b.t > 1.8 && !roof.visible) { roof.visible = true; roof.userData.y0 = roof.position.y; roof.position.y += 2.2; roof.userData.drop = 1; Snd.play('whoosh', { gain: 0.3 }); }
    if (roof.userData.drop) { roof.position.y = Math.max(roof.userData.y0, roof.position.y - dt * 7); if (roof.position.y <= roof.userData.y0) { roof.userData.drop = 0; Snd.play('thud', { gain: 0.5 }); } }
    if (b.t > 2.4 && !det.visible) { det.visible = true; riseIn(det, 0, 0.5, false); }
    if (b.t > 2.7 && b.sf) { b.sf.position.y -= dt * 6; if (b.sf.position.y < -3) { sc.remove(b.sf); b.sf = null; } }
    if (b.t >= b.d) { confetti(b.at[0], 2.4, b.at[1], 64, 5.5); fanfare(true); badge(thumbOf('h:' + b.n + 'done', () => miniHouse(b.n, 0))); finishBuild(); }
    return;
  }
  if (b.t > 0.35 && !b.popped && b.at) { b.popped = 1; confetti(b.at[0], (b.y || 0) + 0.8, b.at[1], 30); Snd.play('ding', { gain: 0.4, f: 'G6' }); Snd.play('sparkle', { gain: 0.35 }, 0.05); }
  if (b.t >= b.d) finishBuild();
}
function finishBuild() { const S = stS(), i = S.pend.indexOf(BUILD.what); if (i >= 0) S.pend.splice(i, 1); BUILD = null; save(); }
const pendIn = () => stS().pend.filter((p) => p.startsWith('f:') || p.startsWith('c:'));
const pendOut = () => stS().pend.filter((p) => !p.startsWith('f:') && !p.startsWith('c:') && !p.startsWith('i:'));
let revealT = 0;
function houseSync() {
  const S = stS(), open2 = S.size >= 2, building = (n) => BUILD && BUILD.what === 'size' + n, home = inHouse && !inBarn && !inStore;
  roomsSync(S.size);
  if (RIGHT.static) RIGHT.static.visible = open2; ROOMSET[2].visible = open2; RIGHT.garden.visible = RIGHT.bushes.visible = WPC.plugs.visible = !open2;
  ROOMSET[3].visible = S.size >= 3; ROOMSET[4].visible = S.size >= 4; WPC.closedE.visible = S.size < 3; WPC.closedW.visible = S.size < 4;
  lockSigns.forEach((s) => { s.visible = S.size < s.userData.need && home; });
  RIGHT.flames.forEach((f) => { if (!open2) f.s.visible = false; else if (!f.s.visible) f.s.visible = true; });
  [2, 3, 4].forEach((n) => { const done = S.size >= n && !S.pend.includes('size' + n); if (!building(n)) HOUSE_ADD[n].visible = done; if (done && !solidsDone[n] && HOUSE_SOLID[n]) { solidsDone[n] = 1; const q = HOUSE_SOLID[n]; solid(q[0], q[1], q[2]); } });
  DECO_L.forEach((d) => { const g = DECO_M[d.id]; if (BUILD && BUILD.what === 'd:' + d.id) return; g.visible = !!S.deco[d.id] && !S.pend.includes('d:' + d.id); });
  Object.keys(HALL_M).forEach((id) => { if (BUILD && BUILD.what === 'f:' + id) return; HALL_M[id].visible = !!S.furn[id] && !S.pend.includes('f:' + id) && (FURN.find((f) => f.id === id) || { need: 0 }).need <= S.size; });
  /* the first time Pip comes in after a bigger house: the new rooms grow up out of the floor */
  if (home && doorT <= 0 && (S.seenIn == null ? 1 : S.seenIn) < S.size && !isTent()) {
    const from = S.seenIn == null ? 1 : S.seenIn; S.seenIn = S.size; save(); revealT = 0;
    for (let n = from + 1; n <= S.size; n++) {
      const d = (n - from - 1) * 0.5, list = n === 1 ? [INT.staticMesh, HOME_G[1]] : n === 2 ? [ROOMSET[2], RIGHT.static] : [ROOMSET[n]];
      list.forEach((o) => { if (o) riseIn(o, 0.25 + d, 1.0); });
      const at = n === 1 ? [-3.5, -2.0] : n === 2 ? [3.5, 0] : n === 3 ? [8.7, -1.2] : [-8.7, -1.2];
      setTimeout(() => { confetti(HX(at[0]), 1.0, HZ(at[1]), 60, 4.5); fanfare(true); }, (0.9 + d) * 1000);
    }
  }
}
/* interior.js asks this whether an old upgrade prop should show */
function furnOn(e) { const S = state.store; if (!S) return false; const id = e.id + e.lv; if (BUILD && BUILD.what === 'f:' + id) return true; return !!S.furn[id] && !S.pend.includes('f:' + id) && (e.id === 'speed' || e.id === 'bag' || S.size >= 2); }

/* ---------- going in and out of the store ---------- */
function goStore(to) {
  if (doorT > 0) return; doorT = 1; fadeEl.style.opacity = '1'; Snd.play('pop', { gain: 0.4, f: to ? 440 : 620 }); Snd.play('ding', { gain: 0.25, f: 'A6' }, 0.1);
  setTimeout(() => {
    inHouse = inStore = to; const B = to ? STORE_IN : HOUSE_IN; IN_B.x0 = B.x0; IN_B.x1 = B.x1; IN_B.z0 = B.z0; IN_B.z1 = B.z1;
    if (to) { pip.position.set(SI.x, 0, SI.z + 3.7); pip.rotation.y = Math.PI; } else { pip.position.set(SDOOR.x, 0, SDOOR.z + 0.9); pip.rotation.y = 0; }
    target.copy(pip.position); camFocus.copy(pip.position); lastP.copy(pip.position); storeRing.w = 0;
    if (typeof routeStop === 'function') routeStop();
    setTimeout(() => { fadeEl.style.opacity = '0'; doorT = 0; }, 120);
  }, 420);
}

/* ---------- the wish bubble: the next thing to save for, with a ring that fills as coins come in ---------- */
const wishEl = document.createElement('button'); wishEl.type = 'button'; wishEl.className = 'stWish'; wishEl.hidden = true; wishEl.setAttribute('aria-label', 'Affären');
wishEl.innerHTML = '<img alt=""><svg viewBox="0 0 70 70" aria-hidden="true"><circle cx="35" cy="35" r="31" fill="none" stroke="#e6d9bd" stroke-width="6"/><circle class="arc" cx="35" cy="35" r="31" fill="none" stroke="#e0a646" stroke-width="6" stroke-linecap="round" stroke-dasharray="0 999"/></svg>';
{ const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.translate(32, 34); bagIcon(x, 0.85); const i = new Image(); i.className = 'bag'; i.alt = ''; i.src = c.toDataURL(); wishEl.appendChild(i); }
document.body.appendChild(wishEl);
wishEl.addEventListener('click', (e) => { e.stopPropagation(); Snd.init(); if (inHouse || trip) return; if (typeof routeTo === 'function' && routeTo('store')) Snd.play('pop', { gain: 0.35, f: 700 }); });
let wishT = 0, wishK = '';
function wishStep(dt) {
  wishT -= dt; if (wishT > 0) return; wishT = 0.4;
  const c = cheapest(false), hide = !c || dressing || !!trip || (inHouse && !inStore);
  wishEl.hidden = hide; if (hide) return;
  const r = coinPill.getBoundingClientRect(); wishEl.style.left = Math.round(r.left + r.width / 2 - 35) + 'px'; wishEl.style.top = Math.round(r.bottom + 10) + 'px';
  if (wishK !== c.o.id + (c.o.lv || '')) { wishK = c.o.id + (c.o.lv || ''); wishEl.querySelector('img').src = thumbOf(wishK, c.o.make); }
  const f = clamp(purse(c.o) / Math.max(1, c.left), 0, 1), L = 2 * Math.PI * 31; wishEl.querySelector('.arc').setAttribute('stroke-dasharray', (f * L).toFixed(1) + ' 999'); wishEl.querySelector('.arc').setAttribute('stroke', f >= 1 ? '#3f7d62' : '#e0a646');
  wishEl.classList.toggle('ready', f >= 1);
}

/* ---------- where the guide arrow points for the store (called from guideGoal) ---------- */
function storeGoal() {
  if (!state.store) return null;
  if (inStore) { const c = cheapest(true); if (c) return [c.s.padX, c.s.padZ]; return [SI.x, SI.z + 4.7]; }
  if (inHouse) return null;
  { const ig = isleGoal(); if (ig) return ig; }
  if (pendOut().length) return [HOUSE.x + (BUILD ? 0 : 0), HOUSE.z + 2.2];
  if (pendIn().length) return [HDOOR.x, HDOOR.z];
  if (cheapest(true) && !carriesGoods()) return [SDOOR.x, SDOOR.z];
  return null;
}

/* ---------- celebrations for the farm, market and barn pads too ---------- */
function celebrateNew(n0, pos, skip) {
  const fresh = sc.children.slice(n0).filter((o) => !pops.includes(o) && !skip.includes(o) && !animals.some((an) => an.g === o) && !(o.isSprite));
  fresh.forEach((o, k) => riseIn(o, k * 0.06, 0.8));
  confetti(pos[0], 0.8, pos[1], 40); fanfare(false);
}
{ const u0 = unlock; unlock = function (p) { const n0 = sc.children.length; u0(p); celebrateNew(n0, padPos(p), [pad && pad.g].filter(Boolean)); }; }
{ const u0 = sUnlock; sUnlock = function (p) { const n0 = sc.children.length; u0(p); celebrateNew(n0, sPadPos(p), [sPad && sPad.g].filter(Boolean)); }; }
{ const u0 = buyBPad; buyBPad = function (p) { u0(p); confetti(BPAD_AT.x, 0.8, BPAD_AT.z, 40); fanfare(false); }; }

/* ---------- the picture map: the store is a place too ---------- */
PLACES.store = { x: SDOOR.x, z: SDOOR.z + 0.4, mx: 20.2, mz: -6.4, sv: 'Affären' };
{ const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.translate(64, 68); bagIcon(x, 1.35); PLACE_PIC.store = c.toDataURL(); }
{ const p0 = placeNeeds; placeNeeds = function () { const n = p0(); if (state.store) { if (pendOut().length || pendIn().length) n.home = GIFT_IMG; else if (cheapest(true)) n.store = actIcon('coin'); } return n; }; }

/* ---------- every frame ---------- */
let storeReady = false;
/* ---------- the delivery: a bunny with a parcel hops by road from the shop to the house door and waits there, so kids
   see where their things went; inside, a warm glow marks the spot while the new thing rises ---------- */
const COURIER = (() => { const g = new T.Group(); g.add(guestModel('bunny')); part(fac(box(0.4, 0.3, 0.34), '#e9684a', 1670), g, 0, 0.62, 0.34); part(fac(box(0.08, 0.31, 0.35), '#f2c14a', 1671), g, 0, 0.62, 0.34); part(fac(box(0.41, 0.31, 0.08), '#f2c14a', 1672), g, 0, 0.62, 0.34);
  g.visible = false; sc.add(g); return { g, on: false, path: [], t: 0 }; })();
function courierStep(dt) {
  const C = COURIER, home = inHouse && !inBarn && !inStore, want = !!stS() && (pendIn().length > 0 || pendOut().length > 0) && !inStore && !home && !(tutOn() && !tutAt('house'));
  if (!want) { if (C.on) { C.on = false; C.g.visible = false; } return; }
  if (!C.on) { C.on = true; C.g.visible = true; C.t = 0; C.g.position.set(SDOOR.x, 0, SDOOR.z + 0.7); const tx = HDOOR.x + 1.0, tz = HDOOR.z + 0.5; C.path = typeof roadPath === 'function' ? roadPath(C.g.position.x, C.g.position.z, tx, tz) : [[tx, tz]]; }
  C.t += dt; const p = C.path[0];
  if (p) { const dx = p[0] - C.g.position.x, dz = p[1] - C.g.position.z, d = Math.hypot(dx, dz);
    if (d < 0.08) C.path.shift(); else { const v = Math.min(d, dt * 2.6); C.g.position.x += dx / d * v; C.g.position.z += dz / d * v; C.g.rotation.y = Math.atan2(dx, dz); }
    C.g.position.y = reduced ? 0 : Math.abs(Math.sin(C.t * 8)) * 0.22; }
  else { C.g.position.y = reduced ? 0 : Math.abs(Math.sin(C.t * 3)) * 0.06; C.g.rotation.y = Math.atan2(pip.position.x - C.g.position.x, pip.position.z - C.g.position.z); }
}
const SPOT_GLOW = (() => { const s = new T.Sprite(glowMat.clone()); s.scale.set(2.2, 2.2, 1); s.visible = false; s.renderOrder = 3; sc.add(s); return s; })();
function spotGlowStep() {
  const b = BUILD, on = !!(b && b.at && (b.what.startsWith('c:') || b.what.startsWith('f:') || b.what.startsWith('d:')));
  SPOT_GLOW.visible = on; if (!on) return; SPOT_GLOW.position.set(b.at[0], 0.6, b.at[1]); SPOT_GLOW.material.opacity = 0.75 * Math.sin(Math.min(1, b.t / Math.max(0.2, b.d)) * Math.PI) + 0.15;
}
function storeStep(dt) {
  if (!storeReady) { storeReady = true; storeInit(); buildAvatar(); }
  burstStep(dt); riseStep(dt); buildStep(dt); houseSync(); catStep(dt); homeStep(dt);
  if (badgeT > 0) { badgeT -= dt; if (badgeT < 0.35 && !badgeEl.classList.contains('out')) badgeEl.classList.add('out'); if (badgeT <= 0) badgeEl.hidden = true; }
  if (spinT > 0) { spinT = Math.max(0, spinT - dt * 1.15); pb.rotation.y = (1 - spinT) * Math.PI * 2 * (spinT > 0 ? 1 : 0); pb.position.y = Math.sin((1 - spinT) * Math.PI) * 0.25; if (spinT === 0) { pb.rotation.y = 0; pb.position.y = 0; } }
  wishStep(dt); courierStep(dt); spotGlowStep();
  const freeHands = !riding() && !dressing && !trip && doorT <= 0;
  /* the old upgrade house: no pads or signs any more, only home */
  upSign.visible = false;
  syncSlots(); const S = stS(), affordable = cheapest(true);
  if (!inStore) {
    storeSign.visible = !inHouse && !!affordable; storeSign.position.y = 3.4 + (reduced ? 0 : Math.abs(Math.sin(time * 3)) * 0.18);
    giftSign.visible = !inHouse && (pendOut().length > 0 || pendIn().length > 0); giftSign.position.set(HOUSE.x + 0.7, 3.4 + (reduced ? 0 : Math.abs(Math.sin(time * 3.2)) * 0.18), HOUSE.z + 0.4);
    const ok = !inHouse && freeHands && !(tutOn() && !tutAt('buy')) && stillOn(storeRing, dt);
    storeRing.w = ok ? Math.min(1, storeRing.w + dt / 0.5) : Math.max(0, storeRing.w - dt * 3); storeRing.f.scale.setScalar(Math.max(0.001, storeRing.w));
    if (storeRing.w >= 1) goStore(true);
    SGLOW.forEach((g) => { g.s.visible = false; });
    /* outside builds start when Pip is close enough to see them; furniture is unpacked when Pip walks into the house */
    if (!BUILD) {
      const home = inHouse && !inBarn, near = !inHouse && Math.hypot(pip.position.x - HOUSE.x, pip.position.z - HOUSE.z) < 7.5;
      if (home && pendIn().length) buildStart(pendIn()[0]);
      else if (near && pendOut().length) buildStart(pendOut()[0]);
    }
    /* the closed right rooms: Pip cannot get past the planks */
    if (inHouse && !inBarn && S.size < 2 && !isTent()) { const lx = pip.position.x - HO.x, lz = pip.position.z - HO.z; if (lz > -4.4 && lz < 4.6 && lx > 0.8) { pip.position.x = HO.x + 0.8; target.x = Math.min(target.x, HO.x + 0.8); } }
  } else {
    storeSign.visible = giftSign.visible = false;
    LAMP_LIGHTS.forEach((l, i) => { const g = SGLOW[i]; l.position.set(SI.x + g.x, g.y - 0.1, SI.z + g.z + 0.3); l.intensity = 2.3 * (0.92 + 0.08 * Math.sin(time * 7 + i * 2)); l.distance = 7; });
    SGLOW.forEach((g) => { g.s.visible = true; g.s.material.opacity = 0.55; });
    if (pip.position.z > SI.z + 4.35 && Math.abs(pip.position.x - SI.x) < 1.0 && doorT <= 0) goStore(false);
    if (Math.abs(pip.position.x - SI.x) >= 1.0) pip.position.z = Math.min(pip.position.z, SI.z + 4.2);
    slotsFrame(dt, freeHands);
    const h = keeper.userData.hop || 0; keeper.position.y = Math.sin(h * Math.PI) * 0.35; keeper.userData.hop = Math.max(0, h - dt * 2.2); keeper.rotation.y = Math.atan2(pip.position.x - keeper.position.x, pip.position.z - keeper.position.z) * 0.5;
  }
}
const storeTest = () => ({ store: () => JSON.stringify(state.store), go: (to) => goStore(to), inStore: () => inStore, offers: () => STATIONS_S.map((s) => s.ctr.id + s.i + ':' + (s.item ? s.item.id + '@' + s.item.cost : '-')), pads: () => STATIONS_S.map((s) => [s.ctr.id + s.i, +s.padX.toFixed(2), +s.padZ.toFixed(2)]), goal: () => storeGoal(), build: () => BUILD && BUILD.what, buy: (k) => { const s = STATIONS_S[k], o = s && s.item; if (!o) return false; if (o.gear) state.coins += slotLeft(o); else shop().coins += slotLeft(o); return slotBuy(s, o); }, jars: () => STATIONS_S.map((s) => +s.jar.lv.toFixed(2)), confetti: (x, z) => confetti(x, 1, z, 40), unlockNext: () => { const p = nextPad(); const q = padPos(p); unlock(p); return q; }, sUnlockNext: () => { const p = nextSPad(); const q = sPadPos(p); sUnlock(p); return q; } });
if (window.__farmTest) window.__store = storeTest;
/* dev panel: a button that gives 10,000 hearts and 10,000 coins, for trying things out */
{ const row = document.querySelector('#curvePan .row'); if (row) { const b = document.createElement('button'); b.type = 'button'; b.textContent = '+10k'; b.setAttribute('aria-label', '10000 hjärtan och mynt'); b.style.cssText = 'flex:1;font:600 16px Fredoka,sans-serif;border:2px solid #22303c;border-radius:12px;background:#fff6e4;padding:6px';
  b.addEventListener('click', (e) => { e.stopPropagation(); state.coins += 10000; shop().coins += 10000; save(); Snd.play('coin', { gain: 0.5 }); }); row.appendChild(b); } }
