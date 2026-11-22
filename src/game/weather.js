/* ---------- weather: clear, windy, rain (light or heavy), mist, and snow in winter ---------- */
/* one spell at a time, each 40 to 120 seconds; clear is the most common, and everything fades in and out */
const WX_KINDS = ['clear', 'windy', 'rain', 'heavy', 'mist', 'snow'];
const WX_TOAST = { windy: ['wind', 'Det blåser!'], rain: ['rain', 'Det regnar!'], heavy: ['rain', 'Det ösregnar!'], mist: ['mist', 'Dimma!'], snow: ['snow', 'Det snöar!'] };
const WX_WIND = { clear: 0.12, windy: 1, rain: 0.42, heavy: 0.78, mist: 0, snow: 0.22 }; /* storms sway the trees and hedges harder */
const raining = () => state.wx.k === 'rain' || state.wx.k === 'heavy';
const seasonNow = () => SEASONS[Math.floor(state.clock / DAY) % 4]; /* the season variable only catches up in the next skyStep */
function wxWeights() {
  const f = dayFrac(), morn = f < 0.16 || f > 0.95, k = state.wx.k;
  const s = seasonNow(), w = s === 'winter' ? { clear: 3, windy: 1.3, snow: 3, mist: 0.8 } : s === 'autumn' ? { clear: 3, windy: 2, rain: 1.8, heavy: 0.9, mist: 1.6 } : s === 'summer' ? { clear: 5, windy: 1.2, rain: 1.1, heavy: 0.7, mist: 0.3 } : { clear: 4, windy: 1.4, rain: 1.8, heavy: 0.5, mist: 0.8 };
  if (morn) w.mist *= 3;
  if (k !== 'clear') { w.clear *= 2.5; w[k] = 0; if (k === 'rain' || k === 'heavy') w.rain = w.heavy = 0; }
  return w;
}
function wxPick() { const w = wxWeights(); let tot = 0; for (const k in w) tot += w[k]; let r = Math.random() * tot; for (const k in w) { r -= w[k]; if (r <= 0) return k; } return 'clear'; }
const wxLen = (k) => k === 'clear' ? 60 + Math.random() * 60 : k === 'heavy' ? 40 + Math.random() * 30 : 40 + Math.random() * 60;
function wxSet(k, len, quiet) {
  const wx = state.wx, was = wx.k, s = seasonNow(); if (s === 'winter' && (k === 'rain' || k === 'heavy')) k = 'snow'; if (s !== 'winter' && k === 'snow') k = 'rain';
  wx.k = k; wx.t = len == null ? wxLen(k) : len;
  if (k !== 'clear' && k !== was) wx.dir = (Math.random() < 0.5 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.6;
  wx.rain = raining() ? wx.t : 0; wx.next = raining() ? 999 : wx.t; /* older builds read these */
  if (quiet || k === was) return;
  const day = !isNight && !inHouse && !sleep;
  if ((was === 'rain' || was === 'heavy') && k !== 'rain' && k !== 'heavy' && !isNight && s !== 'winter') { rainbowT = 30; toastIcon('heart', 'Regnbåge!'); Snd.play('sparkle', { gain: 0.5 }); return; }
  if (WX_TOAST[k] && !inHouse && !sleep) { toastIcon(WX_TOAST[k][0], WX_TOAST[k][1]); if (k === 'snow') Snd.play('sparkle', { gain: 0.3 }); }
  else if (k === 'clear' && day && (was === 'mist' || was === 'snow' || was === 'windy')) toastIcon('sun', 'Solen skiner!');
}
function wxInit() {
  if (!state.wx || typeof state.wx !== 'object') state.wx = { rain: 0, next: 150 };
  const wx = state.wx;
  /* saves from before the weather system only have { rain, next } */
  if (WX_KINDS.indexOf(wx.k) < 0) { wx.k = wx.rain > 0 ? 'rain' : 'clear'; wx.t = wx.rain > 0 ? wx.rain : Math.min(120, Math.max(20, wx.next || 60)); }
  if (typeof wx.t !== 'number' || !(wx.t >= 0)) wx.t = 60;
  if (typeof wx.dir !== 'number') wx.dir = 0;
  if (typeof wx.cover !== 'number') wx.cover = 0;
  wxAng = wx.dir;
}

/* rain: the streaks, puddles, splashes and drips live in rain.js */
/* the rainbow: one soft arc standing far out behind the horizon. It is part of the world (depth-tested and bent with the
   curved world), so the island, trees and the horizon line hide its feet and only the top rises into the sky strip. The bands
   are a smooth spectrum with soft edges, the feet melt into the haze, and it draws itself across the sky from one foot. */
const RBOW = { ri: 3.0, ro: 4.1, grow: 0 };
/* Drawn in the sky pass (right after the dome, before the world, no depth test), so everything on the island simply paints over
   it. Depth-testing it against the bent ground 25 units away speckled the whole view with rainbow confetti in Safari. */
const rainbowMat = applyWorldCurve(new T.ShaderMaterial({ transparent: false, blending: T.CustomBlending, blendSrc: T.SrcAlphaFactor, blendDst: T.OneMinusSrcAlphaFactor, depthTest: false, depthWrite: false, side: T.DoubleSide, uniforms: { uAmt: { value: 0 }, uGrow: { value: 0 }, uRi: { value: RBOW.ri }, uRo: { value: RBOW.ro } },
  vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'varying vec2 vP; uniform float uAmt; uniform float uGrow; uniform float uRi; uniform float uRo;\nvec3 band(float t){ vec3 c = mix(vec3(0.55, 0.40, 0.86), vec3(0.32, 0.60, 0.92), smoothstep(0.0, 0.2, t)); c = mix(c, vec3(0.45, 0.80, 0.45), smoothstep(0.2, 0.42, t)); c = mix(c, vec3(1.0, 0.86, 0.36), smoothstep(0.42, 0.62, t)); c = mix(c, vec3(0.98, 0.62, 0.26), smoothstep(0.62, 0.8, t)); return mix(c, vec3(0.93, 0.36, 0.30), smoothstep(0.8, 1.0, t)); }\nvoid main(){ float r = length(vP), t = (r - uRi) / (uRo - uRi); if (t < 0.0 || t > 1.0) discard; float ang = atan(vP.y, -vP.x) / 3.14159265; float a = pow(max(sin(t * 3.14159265), 0.0), 0.7) * smoothstep(0.02, 0.5, vP.y / uRo) * (1.0 - smoothstep(uGrow * 1.25 - 0.25, uGrow * 1.25, ang)); gl_FragColor = vec4(band(t) * 1.08, a * uAmt * 0.62); }' }));
const rainbow = new T.Mesh(new T.RingGeometry(RBOW.ri, RBOW.ro, 56, 1, 0, Math.PI), rainbowMat); rainbow.visible = false; rainbow.frustumCulled = false; rainbow.renderOrder = -1; sky.renderOrder = -2; sc.add(rainbow);
if (window.__farmTest) window.__bow = (t) => { rainbowT = t == null ? 30 : t; };
/* snow: soft round flakes that drift with the wind */
const softTex = (w, h) => gradTex(w, h, [[0, 255, 255, 255, 1], [0.45, 255, 255, 255, 0.75], [1, 255, 255, 255, 0]]);
const SNOW_N = 300, snowPos = new Float32Array(SNOW_N * 3).fill(-99);
const snowGeo = new T.BufferGeometry(); snowGeo.setAttribute('position', new T.BufferAttribute(snowPos, 3)); snowGeo.setDrawRange(0, 0);
const snowMat = new T.PointsMaterial({ color: '#ffffff', size: 0.24, map: softTex(32, 32), transparent: true, depthWrite: false, opacity: 0.95 });
const snowPts = new T.Points(snowGeo, snowMat); snowPts.frustumCulled = false; snowPts.visible = false; sc.add(snowPts);
/* mist: a few big soft banks low over the ground */
const mistMat = new T.SpriteMaterial({ map: softTex(128, 64), color: '#f3f6f6', transparent: true, depthWrite: false, opacity: 0, fog: false });
const MIST = []; for (let i = 0; i < 10; i++) { const s = new T.Sprite(mistMat.clone()); s.scale.set(6 + hash(i, 71) * 3, 1.8 + hash(i, 73) * 0.6, 1); s.visible = false; sc.add(s); MIST.push({ s, x: (hash(i, 75) - 0.5) * 28, z: (hash(i, 77) - 0.5) * 18 - 2, y: 0.75 + hash(i, 79) * 0.35 }); }
/* wind: a few white swooshes that draw themselves across the farm while it blows */
const GUST_SEG = 40, gustAttr = (() => {
  const P = []; for (let i = 0; i <= GUST_SEG; i++) { const s = i / GUST_SEG; if (s < 0.7) { const u = s / 0.7; P.push([u * 2.8, Math.sin(u * Math.PI * 1.5) * 0.12]); } else { const a = -Math.PI / 2 + (s - 0.7) / 0.3 * Math.PI * 1.6; P.push([2.8 + Math.cos(a) * 0.28, -0.12 + 0.28 + Math.sin(a) * 0.28]); } }
  const v = new Float32Array(GUST_SEG * 18), E = (i, side) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(GUST_SEG, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1, w = 0.08 * (0.35 + 0.65 * Math.sin(Math.PI * i / GUST_SEG)) * side; return [P[i][0] - ty / l * w, P[i][1] + tx / l * w, 0]; };
  for (let i = 0; i < GUST_SEG; i++) { [E(i, 1), E(i, -1), E(i + 1, 1), E(i + 1, 1), E(i, -1), E(i + 1, -1)].forEach((q, k) => { v.set(q, (i * 6 + k) * 3); }); }
  return new T.BufferAttribute(v, 3);
})();
const GUSTS = []; for (let i = 0; i < 6; i++) { const g = new T.BufferGeometry(); g.setAttribute('position', gustAttr); g.setDrawRange(0, 0); const m = new T.Mesh(g, new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false, fog: false })); m.frustumCulled = false; m.visible = false; sc.add(m); GUSTS.push({ m, t: 0, L: 1 }); }
let gustT = 0;
function gustStep(dt, on) {
  gustT -= dt;
  if (on && gustT <= 0) { gustT = (0.45 + Math.random() * 0.9) / windAmt; const q = GUSTS.find((o) => !o.m.visible); if (q) { q.t = 0; q.L = 1.6 + Math.random() * 0.8; q.m.visible = true; q.m.position.set(camFocus.x + (Math.random() - 0.5) * 16 - WIND.x * 3, 0.7 + Math.random() * 1.6, camFocus.z + (Math.random() - 0.65) * 10); q.m.rotation.y = -Math.atan2(WIND.z, WIND.x); } }
  for (let i = 0; i < GUSTS.length; i++) {
    const q = GUSTS[i]; if (!q.m.visible) continue; q.t += dt; const u = q.t / q.L;
    if (u >= 1 || !on && u < 0.05) { q.m.visible = false; continue; }
    const sp = 3 + 3 * WIND.g; q.m.position.x += WIND.x * sp * dt; q.m.position.z += WIND.z * sp * dt;
    const a = Math.floor(Math.max(0, u * 1.5 - 0.6) * GUST_SEG), b = Math.floor(Math.min(1, u * 1.5) * GUST_SEG); q.m.geometry.setDrawRange(a * 6, (b - a) * 6);
    q.m.material.opacity = 0.9 * Math.min(1, windAmt * 1.3) * Math.min(1, (1 - u) * 4);
  }
}
/* snow on the roofs: one shared material, so every cap whitens together */
const capMat = MAT.clone(); capMat.transparent = true; capMat.opacity = 0; capMat.visible = false;
function snowCap(parent, geo, x, y, z) { const m = new T.Mesh(fac(geo, PAL.snow, 9), capMat); m.position.set(x || 0, y || 0, z || 0); m.receiveShadow = true; parent.add(m); return m; }
{ /* the upgrade house and the kennel */
  let g = new T.CylinderGeometry(0.01, 1.95, 1.06, 4, 1, true); g.rotateY(Math.PI / 4); g.scale(1, 1, 0.82); g.translate(0, 2.04, 0); snowCap(houseG, g);
  [-1, 1].forEach((s) => { g = new T.BoxGeometry(0.62, 0.035, 1.08); const m = snowCap(sc, g, KENNEL.x + s * (0.27 + 0.055 * 0.581), 0.8 + 0.055 * 0.814, KENNEL.z); m.rotation.z = -s * 0.62; });
}
/* a snowman turns up once enough snow has fallen, and stays for the rest of the winter */
const snowman = new T.Group(); snowman.position.set(-2.9, 0, 0.6); snowman.visible = false; snowman.scale.setScalar(0.001); sc.add(snowman);
{
  [[0.42, 0.36], [0.31, 0.95], [0.22, 1.38]].forEach(([r, y], k) => { const q = ico(r, 1, 500 + k, r * 0.05); part(fac(q, PAL.snow, 500 + k), snowman, 0, y, 0); });
  [-0.08, 0.08].forEach((x) => { const e = new T.Mesh(new T.SphereGeometry(0.03, 6, 4), ink); e.position.set(x, 1.45, 0.19); snowman.add(e); });
  [0.86, 1.0, 1.14].forEach((y) => { const e = new T.Mesh(new T.SphereGeometry(0.028, 6, 4), ink); e.position.set(0, y, 0.3 - Math.abs(y - 1.0) * 0.25); snowman.add(e); });
  let q = new T.ConeGeometry(0.04, 0.2, 6); q.rotateX(Math.PI / 2); part(fac(q, '#ef8a2e', 504), snowman, 0, 1.38, 0.3, true);
  q = new T.CylinderGeometry(0.25, 0.27, 0.08, 10); part(fac(q, PAL.accent, 505), snowman, 0, 1.19, 0);
  q = new T.BoxGeometry(0.08, 0.26, 0.03); part(fac(q, PAL.accent, 506), snowman, 0.14, 1.06, 0.22).rotation.z = 0.3;
  [-1, 1].forEach((s) => { q = new T.CylinderGeometry(0.015, 0.02, 0.5, 4); q.translate(0, 0.25, 0); const m = part(fac(q, PAL.trunk, 507), snowman, s * 0.26, 0.98, 0); m.rotation.z = -s * 1.0; });
}
/* footprints behind Pip in deep snow: a small pool, reused */
const printGeo = new T.CircleGeometry(0.075, 8), printMat = new T.MeshBasicMaterial({ color: '#b4c2cc', transparent: true, opacity: 0.75, depthWrite: false });
const PRINTS = []; for (let i = 0; i < 28; i++) { const m = new T.Mesh(printGeo, printMat); m.rotation.x = -Math.PI / 2; m.visible = false; sc.add(m); PRINTS.push({ m, t: 0 }); }
let printI = 0, printSide = 1; const printLast = new T.Vector3();

const RAIN_HEMI = new T.Color('#9fb4c8'), RAIN_HEMI_G = new T.Color('#6f7a6c');
const GREY = new T.Color('#6e7c8a'), GREY_TOP = new T.Color('#4e5c6b'), PALE = new T.Color('#dfe5e8'), PALE_TOP = new T.Color('#c7d2da'), _wc = new T.Color();
let rainAmt = 0, fogAmt = 0, rainbowT = 0, rainbowAmt = 0, rainUntil = 0, windUntil = 0, splashT = 0, wet = 0, snowAmt = 0, mistAmt = 0, windAmt = 0.12, wxAng = 0, snowN = 0, manAmt = 0, coverT = 0, coverShown = -1;
let swayers = null, puddleIce = false;
function swaySetup() {
  swayers = { trees: [], tufts };
  leafs.forEach((m) => { const g = m.parent; if (g && swayers.trees.indexOf(g) < 0) { g.rotation.order = 'ZXY'; g.userData.ph = hash(g.position.x, g.position.z) * 6.28; swayers.trees.push(g); } });
}
function sway() {
  if (!swayers) swaySetup();
  const g = WIND.g, wx = WIND.x, wz = WIND.z;
  for (let i = 0; i < swayers.trees.length; i++) { const t = swayers.trees[i], a = g * 0.05 + (Math.sin(time * 1.6 + t.userData.ph) + 0.5 * Math.sin(time * 0.7 + t.userData.ph * 1.7)) * (0.018 + g * 0.03); t.rotation.z = -a * wx; t.rotation.x = a * wz; }
  for (let i = 0; i < tufts.length; i++) { const t = tufts[i], a = g * 0.22 + Math.sin(time * 2.6 - (t.x * wx + t.z * wz) * 0.55) * (0.02 + g * 0.13); t.g.rotation.z = -a * wx; t.g.rotation.x = a * wz; }
  for (let i = 0; i < beds.length; i++) { const ch = beds[i].plants.children; for (let j = 0; j < ch.length; j++) { const m = ch[j], a = g * 0.1 + Math.sin(time * 3.1 + i + j * 0.7) * (0.015 + g * 0.09); m.rotation.z = (m.userData.rz || 0) - a * wx; m.rotation.x = (m.userData.rx || 0) + a * wz; } }
}
function weatherStep(dt) {
  const wx = state.wx, out = !inHouse;
  /* the season can turn rain to snow and back */
  if (season === 'winter' && raining()) wxSet('snow', wx.t, true); else if (season !== 'winter' && wx.k === 'snow') wxSet('rain', wx.t, true);
  wx.t -= dt; wx.rain = raining() ? wx.t : 0; wx.next = raining() ? 999 : wx.t;
  if (wx.t <= 0) { const nx = wx.nx; delete wx.nx; wxSet(nx || wxPick()); }
  const k = wx.k;
  rainAmt += ((k === 'heavy' ? 1 : k === 'rain' ? 0.55 : 0) - rainAmt) * Math.min(1, dt * 0.5);
  snowAmt += ((k === 'snow' ? 1 : 0) - snowAmt) * Math.min(1, dt * 0.3);
  mistAmt += ((k === 'mist' ? 1 : 0) - mistAmt) * Math.min(1, dt * 0.25);
  windAmt += (WX_WIND[k] - windAmt) * Math.min(1, dt * 0.35);
  /* wind: a slowly turning direction and soft gusts */
  let da = wx.dir - wxAng; da = Math.atan2(Math.sin(da), Math.cos(da)); wxAng += da * Math.min(1, dt * 0.25);
  WIND.x = Math.cos(wxAng); WIND.z = Math.sin(wxAng) * 0.6; WIND.amt = windAmt;
  WIND.g = windAmt * (0.7 + 0.3 * Math.sin(time * 0.63) * Math.sin(time * 1.7 + 1));
  if (!reduced && out) sway();
  gustStep(dt, windAmt > 0.45 && out && !reduced && !raining());
  /* light: grey under rain, pale and soft in snow and mist, never brighter than the night */
  const nf = 1 - 0.65 * nightAmt;
  if (rainAmt > 0.005) {
    /* overcast: a dark, cool grey-blue sky; the sun goes dim and the ambient light turns cool */
    const q = Math.min(1, rainAmt * 0.88); _wc.copy(GREY).multiplyScalar(nf); sc.background.lerp(_wc, q); sky.material.uniforms.hor.value.lerp(_wc, q);
    _wc.copy(GREY_TOP).multiplyScalar(nf); sky.material.uniforms.top.value.lerp(_wc, q);
    sun.intensity *= 1 - 0.62 * rainAmt; if (hemi) { hemi.intensity *= 1 - 0.18 * rainAmt; hemi.color.lerp(RAIN_HEMI, 0.6 * rainAmt); hemi.groundColor.lerp(RAIN_HEMI_G, 0.5 * rainAmt); }
  }
  const pale = Math.max(snowAmt * 0.5, mistAmt * 0.55);
  if (pale > 0.005) {
    const q = pale * (1 - 0.85 * nightAmt); sc.background.lerp(PALE, q); sky.material.uniforms.hor.value.lerp(PALE, q); sky.material.uniforms.top.value.lerp(PALE_TOP, q);
    sun.intensity *= 1 - 0.3 * Math.max(snowAmt, mistAmt);
  }
  sc.fog.color.copy(sc.background);
  /* fog: autumn, early mornings, rain, snow and mist */
  const f = dayFrac(), fogT = clamp((season === 'autumn' ? 0.55 : 0) + (f < 0.12 ? 0.3 : 0) + rainAmt * 0.85 + (out ? mistAmt * 0.4 + snowAmt * 0.3 : 0), 0, 1);
  fogAmt += (fogT - fogAmt) * Math.min(1, dt * 0.3); { const fN = curveLive() ? CURVE.fogNear : 28, fF = curveLive() ? Math.max(CURVE.fogFar, fN + 4) : 70; sc.fog.near = fN * (1 - 0.714 * fogAmt); sc.fog.far = fF * (1 - 0.6 * fogAmt); }
  rainStep(dt, out); /* streaks, puddles, splashes, drips, wet ground, Pip's rain gear (rain.js) */
  /* the falling snow */
  const sn = out ? Math.round(SNOW_N * snowAmt * (reduced ? 0.35 : 1)) : 0;
  for (let k = sn; k < snowN; k++) snowPos[k * 3 + 1] = -99;
  snowN = sn; snowPts.visible = sn > 0;
  if (sn > 0) {
    const sp = reduced ? 0.5 : 1, dx = WIND.x * WIND.g * 2.4, dz = WIND.z * WIND.g * 2.4;
    for (let k = 0; k < sn; k++) {
      let x = snowPos[k * 3], y = snowPos[k * 3 + 1], z = snowPos[k * 3 + 2];
      if (y < -50) { y = Math.random() * 9; x = camFocus.x + (Math.random() - 0.5) * 26; z = camFocus.z + (Math.random() - 0.5) * 20; }
      y -= dt * sp * (0.7 + hash(k, 5) * 0.5); x += dt * sp * (dx + Math.sin(time * 1.1 + k) * 0.35); z += dt * sp * dz;
      if (y < 0) { y = 7.5 + Math.random() * 2; x = camFocus.x + (Math.random() - 0.5) * 26; z = camFocus.z + (Math.random() - 0.5) * 20; }
      if (x - camFocus.x > 13) x -= 26; else if (x - camFocus.x < -13) x += 26;
      if (z - camFocus.z > 10) z -= 20; else if (z - camFocus.z < -10) z += 20;
      snowPos[k * 3] = x; snowPos[k * 3 + 1] = y; snowPos[k * 3 + 2] = z;
    }
    snowGeo.setDrawRange(0, sn); snowGeo.attributes.position.needsUpdate = true;
  }
  /* mist banks drift slowly along with the wind */
  const mAmt = Math.max(mistAmt, rainAmt * 0.6), mv = mAmt > 0.01 && out;
  /* the banks take the fog's own colour (a touch lighter by day), so mist, fog and sky read as one haze at dawn, dusk, night and in rain */
  if (mv) { MIST[0].s.material.color.copy(sc.fog.color).lerp(_wc.set('#ffffff'), 0.22 * (1 - nightAmt) * (1 - 0.6 * clamp(rainAmt / Math.max(0.01, mAmt), 0, 1))); for (let i = 1; i < MIST.length; i++) MIST[i].s.material.color.copy(MIST[0].s.material.color); }
  for (let i = 0; i < MIST.length; i++) {
    const m = MIST[i]; m.s.visible = mv; if (!mv) continue;
    m.x += dt * (reduced ? 0.05 : 0.3) * (WIND.x >= 0 ? 1 : -1) * (0.6 + hash(i, 81) * 0.6);
    if (m.x - camFocus.x > 15) m.x -= 30; else if (m.x - camFocus.x < -15) m.x += 30;
    if (m.z - camFocus.z > 10) m.z -= 20; else if (m.z - camFocus.z < -10) m.z += 20;
    m.s.position.set(m.x, m.y, m.z);
    /* a bank thins out over Pip, so the child never loses sight of them */
    m.s.material.opacity = mAmt * 0.6 * clamp(Math.hypot((m.x - pip.position.x) / (m.s.scale.x * 0.45), (m.z - pip.position.z - 0.8) / 1.8) - 0.4, 0.2, 1);
  }
  /* snow settles on the ground, the trees and the roofs while it snows, and slowly thaws back to a light frost */
  if (season === 'winter') { wx.cover = snowAmt > 0.3 ? Math.min(1, Math.max(wx.cover, 0.35) + dt * snowAmt / 55) : Math.max(0.35, wx.cover - dt / 300); if (wx.cover > 0.65) wx.man = 1; }
  else { wx.cover = 0; wx.man = 0; }
  coverT -= dt; if (coverT <= 0) { coverT = 0.75; if (season === 'winter' && Math.abs(wx.cover - coverShown) > 0.03) { coverShown = wx.cover; snowPaint(wx.cover); } else if (season !== 'winter') coverShown = -1; }
  capMat.opacity = season === 'winter' ? clamp((wx.cover - 0.25) / 0.6, 0, 1) : 0; capMat.visible = capMat.opacity > 0.01;
  manAmt += ((wx.man && season === 'winter' ? 1 : 0) - manAmt) * Math.min(1, dt * 0.5);
  snowman.visible = manAmt > 0.01; snowman.scale.setScalar(Math.max(0.001, manAmt));
  /* footprints */
  const pp = pip.position;
  if (season === 'winter' && wx.cover > 0.55 && out && !mount && pp.y < 0.05 && hAt(pp.x, pp.z) > -0.05) {
    const d = Math.hypot(pp.x - printLast.x, pp.z - printLast.z);
    if (d > 0.32) { if (d < 1) { const p = PRINTS[printI], a = pip.rotation.y; printI = (printI + 1) % PRINTS.length; printSide = -printSide; p.t = 14; p.m.visible = true; p.m.position.set(pp.x + Math.cos(a) * 0.09 * printSide, 0.06, pp.z - Math.sin(a) * 0.09 * printSide); p.m.rotation.z = a; p.m.scale.set(1, 1.5, 1); } printLast.copy(pp); }
  } else printLast.copy(pp);
  for (let i = 0; i < PRINTS.length; i++) { const p = PRINTS[i]; if (p.t <= 0) continue; p.t -= dt; if (p.t <= 0 || season !== 'winter') { p.t = 0; p.m.visible = false; } else if (p.t < 3) p.m.scale.set(p.t / 3, 1.5 * p.t / 3, 1); }
  /* sounds: rain in six-second beds, and a soft gusty whoosh for the wind */
  if (Snd.k && rainAmt > 0.05) { const now = Snd.ctx.currentTime - Snd.base; if (now > rainUntil - 1) { const t0 = Math.max(now + 0.05, rainUntil - 0.4); try { Snd.k.bed('rain', t0, t0 + 6, { gain: (inHouse ? 0.35 : 0.9) * rainAmt + 0.2 }); } catch (e) {} rainUntil = t0 + 6; } }
  if (Snd.k && windAmt > 0.3) { const now = Snd.ctx.currentTime - Snd.base; if (now > windUntil - 1.5) { const t0 = Math.max(now + 0.05, windUntil - 1.5), d = 6, top = 560 + Math.random() * 300; try { Snd.k.noise(t0, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 300], [d * 0.45, top], [d, 340]], q: 0.8, gain: 0.07 * windAmt * (inHouse ? 0.3 : 1), a: 2.4, hold: 0.8, bus: 'amb', pan: WIND.x * 0.3 }); } catch (e) {} windUntil = t0 + 3.6; } }
  /* the rainbow */
  if (rainbowT > 0) rainbowT -= dt;
  { const want = rainbowT > 0 && !isNight && season !== 'winter' && k !== 'mist' && !raining() ? 1 : 0; rainbowAmt += (want - rainbowAmt) * Math.min(1, dt * 0.35); RBOW.grow = want ? Math.min(1, RBOW.grow + dt / 6) : rainbowAmt < 0.02 ? 0 : RBOW.grow; }
  rainbow.visible = rainbowAmt > 0.01 && !inHouse;
  /* far out past the horizon and a little to one side; it follows the view like a real rainbow does */
  if (rainbow.visible) { const kk = aspect < 1 ? 0.55 : 1; rainbow.position.set(camFocus.x + 5.6 * kk, 0, camFocus.z - 24.5); rainbow.scale.setScalar(0.9); rainbowMat.uniforms.uAmt.value = rainbowAmt; rainbowMat.uniforms.uGrow.value = RBOW.grow; }
  for (let i = ripples.length - 1; i >= 0; i--) { const r = ripples[i]; r.t += dt; r.m.scale.setScalar(1 + r.t * 5); r.m.material.opacity = 0.8 * (1 - r.t / 0.9); if (r.t > 0.9) { sc.remove(r.m); ripples.splice(i, 1); } }
}
