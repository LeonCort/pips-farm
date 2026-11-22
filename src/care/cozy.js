/* ---------- cozy look: little props, soft contact shade, pollen in the sunlight, butterflies and warm lamp pools ---------- */
/* everything static is merged into one mesh; the moving bits are a handful of draw calls (no post-processing, iPad friendly) */
const COZY_PROPS = [];
const cozyFree = (x, z, r) => !blocked(x, z) && !blocked(x + r, z) && !blocked(x - r, z) && !blocked(x, z + r) && !blocked(x, z - r);
function cozyPick(list, r) { for (const [x, z] of list) if (cozyFree(x, z, r)) return [x, z]; return null; }
const MOSS = '#4a6a2c', STONE = '#c9c1b6', TERRA = '#c8734a', WOOD = '#a8714d';
/* moss and potted plants round the fountain */
{
  const P = at(0, 0, 0, COZY_PROPS);
  for (let k = 0; k < 6; k++) { const a = k * 1.05 + hash(k, 5) * 0.4, r = 1.08, s = 0.035 + hash(k, 7) * 0.03; P(ico(s, 1, 600 + k, s * 0.3).scale(1.6, 0.4, 1.1), (cx, cy, cz, i) => tone(MOSS, i, 0.6), 600 + k, Math.cos(a) * r, 0.42, Math.sin(a) * r); }
  for (let k = 0; k < 5; k++) { const a = k * 1.13 + 0.4, r = 1.15, s = 0.045 + hash(k, 9) * 0.035; P(ico(s, 1, 620 + k, s * 0.15).scale(1.4, 0.6, 1.4), MOSS, 620 + k, Math.cos(a) * r, 0.05, Math.sin(a) * r); }
  P(ico(0.06, 1, 640).scale(1.4, 0.5, 1.4), MOSS, 640, 0.12, 1.16, 0.2);
  [0.55, 2.2, 3.75, 5.4].forEach((a, k) => { const x = Math.cos(a) * 1.4, z = Math.sin(a) * 1.4, Q = at(x, z, 0, COZY_PROPS);
    Q(new T.CylinderGeometry(0.15, 0.11, 0.22, 10), TERRA, 650 + k, 0, 0.11, 0); Q(new T.CylinderGeometry(0.165, 0.165, 0.05, 10), '#b9653f', 655 + k, 0, 0.21, 0);
    Q(fluff(0.15, 660 + k, 5), (cx, cy, cz, i) => leafY(k % 2 ? '#6a9a4c' : '#5d9160', cy, 0.2, 0.5, i), 660 + k, 0, 0.34, 0);
    if (k % 2 === 0) for (let j = 0; j < 3; j++) Q(ico(0.04, 0, 670 + j), j ? '#f6b8c8' : '#f2c14a', 670 + j, Math.cos(j * 2.1) * 0.09, 0.45, Math.sin(j * 2.1) * 0.09);
    solid(x, z, 0.22); });
}
/* a wheelbarrow full of flowers on the lawn by the square */
const WHEEL = cozyPick([[-4.9, -2.4], [-5.2, -1.9], [-4.6, -3.0], [-4.4, 2.6]], 0.7);
if (WHEEL) {
  const P = at(WHEEL[0], WHEEL[1], 0.9, COZY_PROPS);
  P(new T.BoxGeometry(0.62, 0.24, 0.46), WOOD, 680, 0, 0.36, 0); P(new T.BoxGeometry(0.56, 0.04, 0.4), '#6b4a3c', 681, 0, 0.47, 0);
  P(new T.CylinderGeometry(0.14, 0.14, 0.06, 12), '#4a3a2e', 682, 0.38, 0.14, 0, { rx: Math.PI / 2 });
  [-0.15, 0.15].forEach((z, k) => { P(new T.BoxGeometry(0.62, 0.04, 0.04), '#8a5a3a', 683 + k, -0.42, 0.42, z, { rz: -0.25 }); P(new T.BoxGeometry(0.04, 0.24, 0.04), '#8a5a3a', 685 + k, -0.18, 0.12, z); });
  for (let j = 0; j < 9; j++) { const c = ['#f6b8c8', '#fffbf4', '#e9684a', '#f2c14a'][j % 4]; P(ico(0.06, 1, 690 + j), c, 690 + j, (j % 3 - 1) * 0.16, 0.55 + hash(j, 3) * 0.05, (Math.floor(j / 3) - 1) * 0.12); }
  P(fluff(0.14, 699, 4).scale(1.6, 0.6, 1.2), '#6a9a4c', 699, 0, 0.5, 0);
  solid(WHEEL[0], WHEEL[1], 0.45);
}
/* an old stone well with moss and a little trellis */
const WELL = cozyPick([[5.3, -2.3], [5.6, -1.8], [-5.3, 2.4], [5.0, 2.6], [-5.6, 1.9]], 0.85);
if (WELL) {
  const P = at(WELL[0], WELL[1], 0.3, COZY_PROPS);
  P(jit(new T.CylinderGeometry(0.46, 0.5, 0.5, 14, 2, true), 0.025, 701), (cx, cy, cz, i) => tone(STONE, i, 1.4), 701, 0, 0.25, 0);
  P(jit(new T.CylinderGeometry(0.4, 0.4, 0.5, 14, 1, true), 0.01, 702), '#8a8178', 702, 0, 0.25, 0);
  P(new T.RingGeometry(0.4, 0.5, 14, 1).rotateX(-Math.PI / 2), '#d6cec4', 703, 0, 0.5, 0);
  P(new T.CircleGeometry(0.4, 14).rotateX(-Math.PI / 2), '#3d5a66', 704, 0, 0.3, 0);
  for (let k = 0; k < 7; k++) { const a = k * 0.9, s = 0.07 + hash(k, 3) * 0.05; P(ico(s, 1, 710 + k, s * 0.15).scale(1.4, 0.5, 1.3), MOSS, 710 + k, Math.cos(a) * 0.46, 0.5, Math.sin(a) * 0.46); }
  [-0.52, 0.52].forEach((x, k) => P(new T.BoxGeometry(0.07, 1.25, 0.07), '#8a6648', 720 + k, x, 0.62, 0));
  P(new T.BoxGeometry(1.15, 0.06, 0.08), '#8a6648', 722, 0, 1.25, 0);
  for (let k = 0; k < 4; k++) P(new T.BoxGeometry(0.035, 0.6, 0.035), '#a07a58', 724 + k, -0.36 + k * 0.24, 0.95, 0);
  for (let k = 0; k < 3; k++) P(new T.BoxGeometry(1.0, 0.035, 0.035), '#a07a58', 728 + k, 0, 0.78 + k * 0.17, 0);
  for (let k = 0; k < 10; k++) P(ico(0.07 + hash(k, 5) * 0.04, 1, 740 + k), (cx, cy, cz, i) => tone(k % 3 ? '#6a9a4c' : '#5d9160', i, 0.8), 740 + k, -0.5 + hash(k, 7) * 1.0, 0.6 + hash(k, 9) * 0.65, 0.04);
  P(new T.CylinderGeometry(0.1, 0.08, 0.14, 10), '#9a7a58', 750, 0.12, 0.6, 0.0);
  solid(WELL[0], WELL[1], 0.6);
}
/* watering cans: one by the well, one by the planter */
function wateringCan(x, z, ry, col) {
  const P = at(x, z, ry, COZY_PROPS);
  P(new T.CylinderGeometry(0.09, 0.1, 0.17, 12), col, 760, 0, 0.085, 0); P(new T.CylinderGeometry(0.06, 0.09, 0.03, 12), col, 761, 0, 0.18, 0);
  P(new T.CylinderGeometry(0.012, 0.018, 0.2, 6), col, 762, 0.13, 0.15, 0, { rz: -0.9 }); P(new T.CylinderGeometry(0.03, 0.02, 0.03, 8), col, 763, 0.21, 0.21, 0, { rz: -0.9 });
  P(new T.TorusGeometry(0.07, 0.012, 5, 10, Math.PI), col, 764, -0.02, 0.18, 0);
  deco(x, z, 0.3);
}
if (WELL) wateringCan(WELL[0] + 0.75, WELL[1] + 0.45, 0.4, '#8fc0d4');
wateringCan(PLANTER.x + 0.75, PLANTER.z + 0.35, 2.2, '#e0a646');
/* round bushes in the lawns round the square */
[[-4.6, -4.4], [4.6, 4.4], [-4.3, 4.7], [4.5, -4.6], [-6.4, 0.9], [6.4, -0.9], [-3.4, -5.6], [3.4, 5.7]].forEach(([x, z], k) => {
  if (!cozyFree(x, z, 0.4)) return; const P = at(x, z, hash(k, 3) * 6, SWAYL), r = 0.3 + hash(k, 5) * 0.12;
  P(fluff(r, 800 + k, 6).scale(1.2, 0.85, 1.2), (cx, cy, cz, i) => leafY(k % 2 ? '#5d9160' : '#6a9a4c', cy, 0, r * 1.7, i), 800 + k, 0, r * 0.75, 0); deco(x, z, r + 0.2);
});
const cozyMesh = merged(COZY_PROPS); COZY_PROPS.length = 0;

/* contact shade on the ground: under every town object, tree and animal house */
const COZY_SHADE = [];
{
  const L = [];
  ATREC.forEach((r) => { if (r.y0 > 0.3 || r.x1 < r.x0) return; const w = r.x1 - r.x0, d = r.z1 - r.z0; if (w > 6 || d > 6 || r.y1 - r.y0 < 0.12) return; L.push([(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2, w / 2 + 0.3, d / 2 + 0.3, 0.38]); });
  leafs.forEach((m) => { const g = m.parent; if (!g || g.parent !== sc) return; const s = g.scale.x; L.push([g.position.x, g.position.z, (m.userData.pine ? 0.75 : 0.95) * s, (m.userData.pine ? 0.75 : 0.95) * s, 0.5]); });
  for (const a in pens) { const h = pens[a].house; if (h) L.push([h.position.x, h.position.z, 1.1, 1.0, 0.4]); }
  L.push([0, 0, 1.6, 1.6, 0.3]);
  COZY_SHADE.push(...L); /* painted by island.js once it knows which landmarks are built */
}

/* pollen: tiny warm specks drifting in the sunlight round Pip */
const POL_N = 70, polPos = new Float32Array(POL_N * 3), polS = [];
for (let i = 0; i < POL_N; i++) polS.push({ x: (hash(i, 71) - 0.5) * 18, z: (hash(i, 73) - 0.5) * 13, y: 0.25 + hash(i, 79) * 2.4, a: hash(i, 83) * 6.28, s: 0.25 + hash(i, 89) * 0.5 });
const polGeo = new T.BufferGeometry(); polGeo.setAttribute('position', new T.BufferAttribute(polPos, 3));
const polMat = new T.PointsMaterial({ color: '#fff0b8', size: 0.085, map: glowTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0 });
const pollen = new T.Points(polGeo, polMat); pollen.frustumCulled = false; sc.add(pollen);
/* warm light pools under the street lamps at dusk and at night */
const poolMat = new T.MeshBasicMaterial({ map: glowTex, color: '#ffc870', transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0 });
{ const G = LAMP_AT.map(([x, z]) => new T.PlaneGeometry(2.6, 2.6).rotateX(-Math.PI / 2).translate(x, 0.03, z)); const m = new T.Mesh(mergeGeos(G), poolMat); m.renderOrder = 1; sc.add(m); }
/* butterflies: two painted wings that flap, fluttering round flowers near Pip */
const BF = [];
{
  const COLS = [['#fffbf4', '#f2c14a'], ['#f2c14a', '#e9684a'], ['#8fc0e8', '#2e5a8a'], ['#f6b8c8', '#e9684a'], ['#f29a3a', '#5a3a2a'], ['#fffbf4', '#b9a2e0']];
  COLS.forEach(([a, b], k) => {
    /* both wings and the body in one little texture: one draw call per butterfly; flapping squeezes it sideways */
    const c = document.createElement('canvas'); c.width = 128; c.height = 64; const x = c.getContext('2d');
    x.fillStyle = a; x.strokeStyle = b; x.lineWidth = 4;
    [-1, 1].forEach((q) => { x.save(); x.translate(64, 0); x.scale(q, 1); x.beginPath(); x.ellipse(30, 22, 26, 18, -0.3, 0, 6.283); x.fill(); x.stroke(); x.beginPath(); x.ellipse(22, 46, 17, 14, 0.4, 0, 6.283); x.fill(); x.stroke(); x.fillStyle = b; x.beginPath(); x.arc(36, 18, 5, 0, 6.283); x.fill(); x.fillStyle = a; x.restore(); });
    x.fillStyle = PAL.ink; x.beginPath(); x.ellipse(64, 32, 4, 24, 0, 0, 6.283); x.fill();
    const mat = new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true, alphaTest: 0.4, side: T.DoubleSide });
    const pg = new T.PlaneGeometry(0.32, 0.16); pg.rotateX(-Math.PI / 2); const m = new T.Mesh(pg, mat), g = new T.Group(); g.add(m); const wings = [m];
    g.visible = false; sc.add(g);
    BF.push({ g, wings, hx: 0, hz: 0, t: hash(k, 3) * 10, sp: 0.8 + hash(k, 5) * 0.5, set: false });
  });
}
function bfHome(b) { for (let n = 0; n < 12; n++) { const a = Math.random() * 6.283, r = 2 + Math.random() * 5, x = pip.position.x + Math.cos(a) * r, z = pip.position.z + Math.sin(a) * r; if (isleD(x, z) < 0.92 && !roadKind(x, z)) { b.hx = x; b.hz = z; b.set = true; return; } } }
let cozyT = 0;
function cozyStep(dt) {
  cozyT += dt;
  const day = 1 - nightAmt, wet = typeof rainAmt !== 'undefined' ? rainAmt : 0, warm = day * (1 - wet) * (season === 'winter' ? 0.3 : 1);
  /* lamps glow a little even in the golden afternoon */
  glowMat.opacity = Math.max(glowMat.opacity, 0.2 * day); lampMat.color.lerp(lampOn, 0.3 * day);
  poolMat.opacity = clamp(nightAmt * 2.6, 0, 1) * 0.5;
  /* pollen */
  polMat.opacity = warm * 0.75; pollen.visible = warm > 0.02 && !inHouse;
  if (pollen.visible) { const cx = camFocus.x, cz = camFocus.z, wx = (WIND.x || 0) * (0.3 + WIND.g), wz = (WIND.z || 0) * (0.3 + WIND.g);
    for (let i = 0; i < POL_N; i++) { const p = polS[i]; p.x += (wx * 0.6 + Math.sin(cozyT * p.s + p.a) * 0.12) * dt; p.z += (wz * 0.6 + Math.cos(cozyT * p.s * 0.8 + p.a) * 0.1) * dt;
      let x = ((p.x % 18) + 27) % 18 - 9, z = ((p.z % 13) + 19.5) % 13 - 6.5; polPos[i * 3] = cx + x; polPos[i * 3 + 1] = p.y + Math.sin(cozyT * 0.7 * p.s + p.a * 2) * 0.25; polPos[i * 3 + 2] = cz + z; }
    polGeo.attributes.position.needsUpdate = true; }
  /* butterflies: out on warm days, not in rain, at night or in winter */
  const bOut = warm > 0.4 && season !== 'winter' && !inHouse;
  BF.forEach((b, k) => {
    b.g.visible = bOut; if (!bOut) { b.set = false; return; }
    if (!b.set || Math.hypot(b.hx - pip.position.x, b.hz - pip.position.z) > 9) bfHome(b);
    b.t += dt * b.sp; const t = b.t, x = b.hx + Math.sin(t * 0.9) * 0.9 + Math.sin(t * 2.3) * 0.25, z = b.hz + Math.cos(t * 0.7) * 0.8 + Math.sin(t * 1.9 + 1) * 0.25, y = 0.45 + Math.abs(Math.sin(t * 1.3)) * 0.5 + Math.sin(t * 7) * 0.04;
    const g = b.g; g.rotation.y = Math.atan2(x - g.position.x, z - g.position.z) || g.rotation.y; g.position.set(x, y, z);
    b.wings[0].scale.x = reduced ? 0.8 : 0.2 + 0.8 * Math.abs(Math.cos(cozyT * 11 + k));
  });
}

/* ---------- cozy craft UI: wooden frames with stitched parchment, little vines, and glossy round buttons ---------- */
{
  const leafSvg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 36"><path d="M6 30 C10 20 18 14 30 12" fill="none" stroke="#5d7a3a" stroke-width="2.5" stroke-linecap="round"/><path d="M14 22 C6 22 2 14 6 8 C14 8 18 16 14 22 Z" fill="#7fae52" stroke="#3f6a32" stroke-width="2"/><path d="M24 15 C24 7 32 2 40 4 C40 12 32 17 24 15 Z" fill="#94c060" stroke="#3f6a32" stroke-width="2"/><path d="M30 12 C34 14 36 20 32 24" fill="none" stroke="#5d7a3a" stroke-width="2" stroke-linecap="round"/></svg>');
  const css = `
.vig { background: radial-gradient(ellipse at 14% 4%, rgba(255,212,140,0.32), rgba(255,212,140,0) 46%), radial-gradient(ellipse at 50% 46%, rgba(70,40,20,0) 56%, rgba(70,40,20,0.34) 100%); }
.coins, .clock { border: 5px solid transparent; background: linear-gradient(#fdf3dc, #f0dcb2) padding-box, linear-gradient(165deg, #c4935f, #7a4c2a 50%, #a8723f) border-box; box-shadow: 0 5px 0 rgba(70,40,18,0.4), 0 9px 14px rgba(70,40,18,0.22), inset 0 -4px 8px rgba(160,110,50,0.22); color: #3a2414; }
.coins::after, .clock::after { content: ''; position: absolute; inset: 3px; border-radius: 999px; border: 2px dashed rgba(150,105,60,0.55); pointer-events: none; }
.coins::before, .clock::before { content: ''; position: absolute; left: -14px; top: -15px; width: 44px; height: 36px; background: url("data:image/svg+xml,${leafSvg}") no-repeat center / contain; pointer-events: none; }
.coins.gold::before { left: auto; right: -16px; top: auto; bottom: -14px; transform: scaleX(-1) rotate(160deg); }
.clock::before { left: auto; right: -16px; top: -12px; transform: scaleX(-1); }
.coins span { text-shadow: 0 1px 0 rgba(255,255,255,0.7); }
.coins svg, .clock svg { filter: drop-shadow(0 2px 0 rgba(70,40,18,0.3)); }
.mapBtn, .albumBtn, .menuBtn { border: 4px solid #fff3dc !important; box-shadow: 0 0 0 3px #4a2e1a, 0 7px 0 3px rgba(60,34,16,0.45), 0 12px 16px rgba(60,34,16,0.25), inset 0 -8px 12px rgba(0,0,0,0.22), inset 0 6px 10px rgba(255,255,255,0.45) !important; }
.mapBtn { background: radial-gradient(circle at 34% 28%, #b6e08a, #6fb05a 55%, #3f7d46) !important; }
.albumBtn { background: radial-gradient(circle at 34% 28%, #a8e0f4, #4ea6d4 55%, #236e9e) !important; }
.menuBtn { background: radial-gradient(circle at 34% 28%, #ffb08a, #e9684a 55%, #a83a24) !important; }
.mapBtn img, .albumBtn svg, .menuBtn svg { filter: drop-shadow(0 3px 0 rgba(40,24,10,0.35)); }
.mapBtn:active, .albumBtn:active, .menuBtn:active { transform: translateY(4px); }
.act { border: 6px solid transparent !important; background: radial-gradient(circle at 40% 32%, #fffaf0, #f3e2bf) padding-box, linear-gradient(165deg, #c4935f, #6e4426 55%, #a8723f) border-box !important; box-shadow: 0 6px 0 rgba(60,34,16,0.45), 0 12px 18px rgba(60,34,16,0.28), inset 0 -5px 10px rgba(160,110,50,0.25) !important; }
.act.ride { background: radial-gradient(circle at 40% 32%, #f6ffe8, #dcefc4) padding-box, linear-gradient(165deg, #c4935f, #6e4426 55%, #a8723f) border-box !important; }
.sheet { background: linear-gradient(#fdf3dc, #f3e2bf); border-color: #6e4426; box-shadow: inset 0 0 0 3px rgba(255,255,255,0.45); }
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
}
