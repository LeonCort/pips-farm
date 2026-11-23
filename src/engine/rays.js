/* ---------- high quality light (rays.js): god rays, bloom, sun shafts, dust motes, lamp halos, golden glow, sharper image ----------
   A third graphics tier above normal. Everything is off unless the quality is 'high', and each effect can be switched on its own.
   Post effects (rays, bloom, glow) render the scene into a multisampled target, then do cheap passes at a quarter of the size
   and one full-size composite. World effects (shafts, motes, halos) are one draw call each. Soft textures are built pixel by
   pixel (gradTex) because Safari turns canvas-gradient fades into colour speckles. */
const FX_KEYS = [
  ['rays', 'God rays', 'light streaks from the sun side, cut by trees and roofs'],
  ['bloom', 'Bloom', 'bright things (sky, lamps, windows, sunlit roofs) glow softly'],
  ['shafts', 'Sun shafts', 'soft slanted beams of light falling onto the island'],
  ['motes', 'Dust motes', 'tiny glinting specks drifting in the sunlight'],
  ['halos', 'Lamp halos', 'big warm halos around street lamps at dusk and night'],
  ['grade', 'Golden glow', 'warm sunrise and sunset tint, a touch more colour, soft vignette'],
  ['sharp', 'Sharper image', 'full retina resolution and crisper shadows'],
  ['clouds', 'Cloud shadows', 'soft cloud shade drifting across the island with the wind'],
  ['glints', 'Water glints', 'sparkles on the sea, the pond and the fountain'],
  ['evening', 'Evening details', 'window light on the ground, chimney smoke, little lights on the market stalls'],
  ['ao', 'Soft corner shade', 'darker where walls meet the ground and under roofs, painted in once at start'],
  ['ground', 'Ground variety', 'worn and mossy cobbles, damp patches and pebbles on the dirt, lighter and darker grass'],
  ['grass', '3D grass', 'real grass blades around Pip that sway in the wind and bend when walked through']
];
const FX_TEST = false; /* true in test builds: the sparkle panel is shown to everyone and high is the default */
/* the cheap ones (well under half a millisecond on an iPad) are on at normal quality too; the rest need high */
const FX_LOW = new Set(['shafts', 'motes', 'halos', 'glints', 'evening', 'ao', 'ground']);
const FX = { hi: FX_TEST, on: {}, k: {}, bench: null };
FX_KEYS.forEach(([k]) => { FX.on[k] = true; });
try { const q = localStorage.getItem('pips-q'); if (q) FX.hi = q === 'hi'; const s = JSON.parse(localStorage.getItem('pips-fx') || 'null'); if (s) FX_KEYS.forEach(([k]) => { if (typeof s[k] === 'boolean') FX.on[k] = s[k]; }); } catch (e) {}
const fxUse = (k) => FX.on[k] && (FX.hi || FX_LOW.has(k));
function fxSave() { try { localStorage.setItem('pips-q', FX.hi ? 'hi' : 'norm'); localStorage.setItem('pips-fx', JSON.stringify(FX.on)); } catch (e) {} }

/* ----- post processing: targets, a full-screen triangle pair, and the passes ----- */
const fxGL2 = renderer.capabilities.isWebGL2;
const fxScene = new T.Scene(), fxCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const fxQuad = new T.Mesh(new T.PlaneGeometry(2, 2), null); fxQuad.frustumCulled = false; fxScene.add(fxQuad);
const fxRT = (w, h, ms) => { const o = { minFilter: T.LinearFilter, magFilter: T.LinearFilter, format: T.RGBAFormat, depthBuffer: !!ms, stencilBuffer: false };
  const t = ms && fxGL2 && T.WebGLMultisampleRenderTarget ? new T.WebGLMultisampleRenderTarget(w, h, o) : new T.WebGLRenderTarget(w, h, o); if (t.isWebGLMultisampleRenderTarget) t.samples = 4; t.texture.generateMipmaps = false; return t; };
let fxMain = null, fxA = null, fxB = null, fxR = null, fxR2 = null; const fxSize = new T.Vector2(-1, -1), _fxs = new T.Vector2();
const FX_VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const fxMat = (fs, u) => new T.ShaderMaterial({ uniforms: u, vertexShader: FX_VS, fragmentShader: fs, depthTest: false, depthWrite: false, fog: false });
/* 1. quarter-size bright pass: rgb is what blooms, alpha is what can shine through as rays */
const fxBright = fxMat(`uniform sampler2D tS; uniform vec2 uPx; uniform float uThr, uKnee, uRThr; varying vec2 vUv;
  float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
  void main(){ vec3 c = 0.25 * (texture2D(tS, vUv + uPx * vec2(-1.0, -1.0)).rgb + texture2D(tS, vUv + uPx * vec2(1.0, -1.0)).rgb + texture2D(tS, vUv + uPx * vec2(-1.0, 1.0)).rgb + texture2D(tS, vUv + uPx * vec2(1.0, 1.0)).rgb);
    float l = lum(c); float s = clamp(l - uThr + uKnee, 0.0, 2.0 * uKnee); s = s * s / (4.0 * uKnee + 1e-4); float w = max(s, l - uThr) / max(l, 1e-4);
    gl_FragColor = vec4(c * w, smoothstep(uRThr, 0.95, l) * smoothstep(0.55, 0.85, vUv.y)); }`, { tS: { value: null }, uPx: { value: new T.Vector2() }, uThr: { value: 0.8 }, uKnee: { value: 0.12 }, uRThr: { value: 0.6 } });
/* 2. god rays: march from each pixel toward the light, adding up the bright mask with a decay */
const fxRays = fxMat(`uniform sampler2D tM; uniform vec2 uSrc; uniform float uDen, uDecay; varying vec2 vUv;
  void main(){ vec2 d = (vUv - uSrc) * (uDen / 40.0); float j = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))); vec2 p = vUv - d * j; float il = 1.0, a = 0.0;
    for (int i = 0; i < 40; i++) { p -= d; vec2 q = step(vec2(0.0), p) * step(p, vec2(1.0)); a += texture2D(tM, p).a * il * q.x * q.y; il *= uDecay; }
    gl_FragColor = vec4(vec3(a / 40.0), 1.0); }`, { tM: { value: null }, uSrc: { value: new T.Vector2(-0.2, 1.3) }, uDen: { value: 0.95 }, uDecay: { value: 0.965 } });
/* 3. blur: 9-tap gaussian done in 5 linear fetches, horizontal then vertical */
const fxBlur = fxMat(`uniform sampler2D tS; uniform vec2 uDir; varying vec2 vUv;
  void main(){ vec3 c = texture2D(tS, vUv).rgb * 0.227027; vec2 o1 = uDir * 1.3846153, o2 = uDir * 3.2307692;
    c += (texture2D(tS, vUv + o1).rgb + texture2D(tS, vUv - o1).rgb) * 0.3162162 + (texture2D(tS, vUv + o2).rgb + texture2D(tS, vUv - o2).rgb) * 0.0702703;
    gl_FragColor = vec4(c, 1.0); }`, { tS: { value: null }, uDir: { value: new T.Vector2() } });
/* 4. composite: scene + bloom + rays, then the golden-hour grade and a tiny dither against banding */
const fxComp = fxMat(`uniform sampler2D tS, tB, tR; uniform float uDbg, uBloom, uRays, uGrade, uGold, uAsp; uniform vec3 uRayCol, uGlowCol; uniform vec2 uSrc; varying vec2 vUv;
  float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
  void main(){ vec3 c = texture2D(tS, vUv).rgb;
    if (uBloom > 0.0) c += texture2D(tB, vUv).rgb * uBloom;
    if (uRays > 0.0) { vec2 pc = (vUv - vec2(0.5, 0.42)) * vec2(uAsp, 1.0);
      float fg = mix(0.25, 1.0, smoothstep(0.3, 0.8, vUv.y)) * (1.0 - 0.6 * exp(-dot(pc, pc) * 14.0)) * smoothstep(0.0, 0.08, min(vUv.x, 1.0 - vUv.x)) * smoothstep(0.0, 0.1, vUv.y);
      c += uRayCol * texture2D(tR, vUv).r * uRays * fg * (1.0 - 0.55 * lum(c)); }
    if (uGrade > 0.0) { float l = lum(c); c = mix(vec3(l), c, 1.0 + 0.1 * uGrade); c = (c - 0.5) * (1.0 + 0.05 * uGrade) + 0.5;
      c = mix(c, c * vec3(1.07, 0.98, 0.86) + vec3(0.03, 0.01, -0.01), uGold);
      float g = 1.0 - smoothstep(0.0, 1.5, distance(vUv * vec2(uAsp, 1.0), uSrc * vec2(uAsp, 1.0))); c += uGlowCol * g * g * (0.05 + 0.2 * uGold) * uGrade;
      vec2 v = (vUv - 0.5) * vec2(1.0, 0.85); c *= 1.0 - 0.28 * uGrade * smoothstep(0.25, 0.8, length(v)); }
    c += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
    if (uDbg > 0.5) c = texture2D(tR, vUv).rgb * 3.0;
    gl_FragColor = vec4(c, 1.0); }`, { uDbg: { value: 0 }, tS: { value: null }, tB: { value: null }, tR: { value: null }, uBloom: { value: 0 }, uRays: { value: 0 }, uGrade: { value: 0 }, uGold: { value: 0 }, uAsp: { value: 1 },
  uRayCol: { value: new T.Color('#ffe2a8') }, uGlowCol: { value: new T.Color('#ffb070') }, uSrc: fxRays.uniforms.uSrc });
function fxPass(m, out) { fxQuad.material = m; renderer.setRenderTarget(out); renderer.render(fxScene, fxCam); }
function fxTargets() {
  renderer.getDrawingBufferSize(_fxs); if (_fxs.equals(fxSize)) return; fxSize.copy(_fxs);
  [fxMain, fxA, fxB, fxR, fxR2].forEach((t) => t && t.dispose());
  const w = _fxs.x, h = _fxs.y, qw = Math.max(8, Math.round(w / 4)), qh = Math.max(8, Math.round(h / 4));
  fxMain = fxRT(w, h, true); fxA = fxRT(qw, qh); fxB = fxRT(qw, qh); fxR = fxRT(qw, qh); fxR2 = fxRT(qw, qh);
}

/* ----- the light of the moment: how sunny, how golden, which way the sun is on screen ----- */
const FX_CLEAR = { clear: 1, windy: 0.9, snow: 0.45, mist: 0.3, rain: 0.12, heavy: 0 };
const _fv1 = new T.Vector3(), _fv2 = new T.Vector3();
function fxLight(dt) {
  const f = dayFrac(), wk = state.wx && state.wx.k, clear = FX_CLEAR[wk] == null ? 1 : FX_CLEAR[wk];
  const inside = inHouse || inBarn || (typeof inStore !== 'undefined' && inStore);
  const gold = clamp((smoothstep(0.4, 0.58, f) * (1 - smoothstep(0.63, 0.69, f)) + (1 - smoothstep(0.02, 0.1, f)) + smoothstep(0.94, 0.99, f)), 0, 1);
  const sunK = clamp((1 - nightAmt * 1.25) * clear, 0, 1) * (inside ? 0 : 1);
  const ease = Math.min(1, dt * 1.5);
  FX.k.sun = FX.k.sun == null ? sunK : FX.k.sun + (sunK - FX.k.sun) * ease;
  FX.k.gold = FX.k.gold == null ? gold * clear : FX.k.gold + (gold * clear * (inside ? 0 : 1) - FX.k.gold) * ease;
  FX.k.night = inside ? 0 : clamp(nightAmt * 2.6, 0, 1);
}
function smoothstep(a, b, x) { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
/* where the rays come from: with the sun behind the camera the source sits off screen at the top, to the side of the sun.
   The sun moves now: when it is ahead of the camera the rays come from where it really is, and when it is ahead but high
   above the screen they fade out (the source far above smeared a soft bright column onto the sea) */
const _fv3 = new T.Vector3(); let fxRayK = 1;
function fxSource() {
  _fv1.copy(camFocus).project(cam); _fv2.copy(sun.position).sub(sun.target.position).normalize().multiplyScalar(2).add(camFocus).project(cam);
  let dx = _fv2.x - _fv1.x; dx = clamp(dx * 3, -1, 1);
  const sd = _fv3.copy(sun.position).sub(sun.target.position).normalize(), fw = cam.getWorldDirection(_fv2);
  const ahead = smoothstep(-0.1, 0.35, sd.x * fw.x + sd.z * fw.z);
  _fv2.copy(cam.position).addScaledVector(sd, 100).project(cam);
  const sx = clamp(0.5 + _fv2.x * 0.5, -0.3, 1.3), sy = 0.5 + _fv2.y * 0.5;
  const ok = _fv2.z < 1 ? 1 - smoothstep(1.15, 1.6, sy) : 0;
  fxRayK = (1 - ahead) + ahead * ok;
  fxRays.uniforms.uSrc.value.set((0.5 + dx * 0.75) * (1 - ahead) + sx * ahead, 1.3 * (1 - ahead) + Math.min(1.3, sy) * ahead);
}

/* ----- sun shafts: soft slanted beams anchored to the ground, picked from a world grid near Pip, one draw call ----- */
const SH_N = 26, SH_CELL = 3.6;
const shGeo = new T.BufferGeometry();
{ const pos = new Float32Array(SH_N * 4 * 3), aP = new Float32Array(SH_N * 4 * 2), idx = [];
  for (let i = 0; i < SH_N; i++) { [[0, 0], [1, 0], [1, 1], [0, 1]].forEach((p, j) => { aP[(i * 4 + j) * 2] = p[0]; aP[(i * 4 + j) * 2 + 1] = p[1]; }); idx.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3); }
  shGeo.setAttribute('position', new T.BufferAttribute(pos, 3)); shGeo.setAttribute('aP', new T.BufferAttribute(aP, 2));
  shGeo.setAttribute('aC', new T.BufferAttribute(new Float32Array(SH_N * 4 * 3), 3)); shGeo.setAttribute('aW', new T.BufferAttribute(new Float32Array(SH_N * 4 * 3), 3)); shGeo.setIndex(idx); }
const shMat = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false,
  uniforms: { uL: { value: new T.Vector3(-0.6, 0.6, 0.45) }, uFocus: { value: new T.Vector3() }, uT: { value: 0 }, uOp: { value: 0 }, uCol: { value: new T.Color('#ffe0a0') } },
  vertexShader: CURVE_GLSL + `uniform vec3 uL, uFocus; attribute vec2 aP; attribute vec3 aC, aW; varying vec2 vP; varying float vSeed, vFade;
    void main(){ vec3 w = aC + uL * aW.y * aP.y; vec3 mid = aC + uL * aW.y * 0.5; vec3 sd = normalize(cross(uL, normalize(cameraPosition - mid)));
      w += sd * (aP.x - 0.5) * aW.x; w.y -= worldCurveDrop(w); vP = aP; vSeed = aW.z;
      vFade = (1.0 - smoothstep(8.0, 14.0, length(aC.xz - uFocus.xz))) * smoothstep(2.5, 6.0, distance(w, cameraPosition));
      gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0); }`,
  fragmentShader: `uniform float uT, uOp; uniform vec3 uCol; varying vec2 vP; varying float vSeed, vFade;
    void main(){ float u = vP.x, v = vP.y;
      float across = smoothstep(0.0, 0.4, u) * (1.0 - smoothstep(0.6, 1.0, u));
      float streak = 0.7 + 0.3 * sin(u * 11.0 + vSeed * 17.0 + uT * 0.35) * sin(u * 5.0 - uT * 0.21 + vSeed * 3.0);
      float along = smoothstep(0.0, 0.12, v) * (1.0 - smoothstep(0.35, 1.0, v));
      float breathe = 0.75 + 0.25 * sin(uT * 0.4 + vSeed * 6.28);
      gl_FragColor = vec4(uCol * across * streak * along * breathe * vFade * uOp, 1.0); }` });
const shafts = new T.Mesh(shGeo, shMat); shafts.frustumCulled = false; shafts.renderOrder = 3; shafts.visible = false; sc.add(shafts);
let shCell = '';
function shPlace() {
  const cx = Math.round(camFocus.x / SH_CELL), cz = Math.round(camFocus.z / SH_CELL), key = cx + ',' + cz; if (key === shCell) return; shCell = key;
  const aC = shGeo.attributes.aC.array, aW = shGeo.attributes.aW.array; let n = 0;
  for (let dz = -5; dz <= 2 && n < SH_N; dz++) for (let dx = -4; dx <= 4 && n < SH_N; dx++) {
    const gx = cx + dx, gz = cz + dz, h = hash(gx * 13.1 + gz * 71.7, 5.3); if (h > 0.36) continue;
    const x = (gx + hash(gx, gz + 0.5) - 0.5) * SH_CELL, z = (gz + hash(gz, gx + 1.5) - 0.5) * SH_CELL; if (isleD(x, z) > 0.82) continue; /* well inland: beams by the shore lay soft patches on the sea */
    const wdt = 0.8 + hash(gx, gz + 7.1) * 1.3, len = 7 + hash(gx + 3.3, gz) * 5, seed = hash(gx + 9.9, gz + 2.2);
    for (let j = 0; j < 4; j++) { const o = (n * 4 + j) * 3; aC[o] = x; aC[o + 1] = 0; aC[o + 2] = z; aW[o] = wdt; aW[o + 1] = len; aW[o + 2] = seed; } n++;
  }
  for (let i = n; i < SH_N; i++) for (let j = 0; j < 4; j++) { const o = (i * 4 + j) * 3; aW[o] = 0; aW[o + 1] = 0; }
  shGeo.attributes.aC.needsUpdate = true; shGeo.attributes.aW.needsUpdate = true;
}

/* ----- dust motes: specks in a box that stays put in the world and wraps around Pip ----- */
const MO_N = 260, moGeo = new T.BufferGeometry();
{ const p = new Float32Array(MO_N * 3), s = new Float32Array(MO_N); for (let i = 0; i < MO_N; i++) { p[i * 3] = hash(i, 61); p[i * 3 + 1] = hash(i, 67); p[i * 3 + 2] = hash(i, 71); s[i] = hash(i, 73); }
  moGeo.setAttribute('position', new T.BufferAttribute(p, 3)); moGeo.setAttribute('aS', new T.BufferAttribute(s, 1)); }
const moTex = gradTex(32, 32, [[0, 255, 255, 240, 1], [0.25, 255, 240, 200, 0.7], [0.6, 255, 225, 170, 0.15], [1, 255, 220, 160, 0]]);
const moMat = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false,
  uniforms: { uFocus: { value: new T.Vector3() }, uT: { value: 0 }, uOp: { value: 0 }, uScale: { value: 400 }, uTex: { value: moTex }, uCol: { value: new T.Color('#fff0c8') }, uWind: { value: new T.Vector2() } },
  vertexShader: CURVE_GLSL + `uniform vec3 uFocus; uniform float uT, uScale; uniform vec2 uWind; attribute float aS; varying float vA;
    void main(){ const vec3 B = vec3(22.0, 3.6, 18.0);
      vec3 d = position * B + vec3(sin(uT * 0.3 + aS * 30.0) * 0.6 + uWind.x, sin(uT * 0.21 + aS * 17.0) * 0.35 + uT * 0.04 * (aS - 0.3), cos(uT * 0.27 + aS * 23.0) * 0.6 + uWind.y);
      vec3 c = uFocus + vec3(0.0, 0.0, -2.5);
      vec3 w = vec3(c.x + (fract((d.x - c.x) / B.x + 0.5) - 0.5) * B.x, 0.25 + mod(d.y, B.y), c.z + (fract((d.z - c.z) / B.z + 0.5) - 0.5) * B.z);
      vec3 e = abs(w - c) / (B * 0.5); float edge = 1.0 - smoothstep(0.7, 1.0, max(e.x, e.z));
      w.y -= worldCurveDrop(w);
      vec4 mv = viewMatrix * vec4(w, 1.0);
      vA = edge * pow(0.5 + 0.5 * sin(uT * (0.8 + aS * 2.2) + aS * 40.0), 3.0) * (0.35 + 0.65 * fract(aS * 7.3));
      vA *= smoothstep(4.5, 8.5, -mv.z); /* dissolve before they get close to the lens */
      gl_PointSize = (0.06 + 0.075 * fract(aS * 3.7)) * uScale / -mv.z;
      gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform sampler2D uTex; uniform float uOp; uniform vec3 uCol; varying float vA;
    void main(){ gl_FragColor = vec4(uCol * texture2D(uTex, gl_PointCoord).a * vA * uOp, 1.0); }` });
const motes = new T.Points(moGeo, moMat); motes.frustumCulled = false; motes.renderOrder = 4; motes.visible = false; sc.add(motes);

/* ----- lamp halos: a wide warm haze around each street lamp that has been bought ----- */
const haloTex = gradTex(64, 64, [[0, 255, 226, 170, 0.5], [0.15, 255, 208, 130, 0.36], [0.4, 255, 190, 110, 0.14], [0.75, 255, 170, 90, 0.04], [1, 255, 160, 80, 0]]);
const haloMat = new T.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0, fog: false });
const halos = LAMP_AT.map(([x, z], i) => { const s = new T.Sprite(haloMat); s.scale.set(3.6, 3.6, 1); s.position.set(x, 1.68, z); s.visible = false; s.renderOrder = 5; s.userData.lot = i < 4 ? 'lampSq' : i < 10 ? 'lampRing' : 'lampSt'; sc.add(s); return s; });
let haloT = 0;

/* ----- sharper: the full retina pixel ratio and a bigger shadow map ----- */
const fxBaseShadow = sun.shadow.mapSize.x;
/* steady frame rate: when the device cannot keep up, draw a few less pixels (down to three quarters of the sharpness);
   when it has room again, go back up. Each step up waits longer if the last one did not hold. */
const DYN = { k: 1, t: 0, n: 0, sum: 0, hold: 0, upWait: 6, lastUp: false };
function dynStep(dt) {
  if (FX.bench || document.hidden || !(dt > 0)) return;
  DYN.hold -= dt; DYN.n++; DYN.sum += dt; DYN.t += dt; if (DYN.t < 2) return;
  const avg = DYN.sum / DYN.n, want = 1 / fpsCap; DYN.t = DYN.n = DYN.sum = 0; if (DYN.hold > 0) return;
  if (avg > want * 1.12 && DYN.k > 0.75) { DYN.k -= 0.125; DYN.hold = 3; if (DYN.lastUp) DYN.upWait = Math.min(60, DYN.upWait * 2); DYN.lastUp = false; }
  else if (avg < want * 1.03 && DYN.k < 1) { DYN.k += 0.125; DYN.hold = DYN.upWait; DYN.lastUp = true; }
}
function fxSharp(on) {
  const top = Math.min(window.devicePixelRatio || 1, on ? 2 : fpsCap === 20 ? 1 : 1.5), pr = Math.max(Math.min(1, top), Math.round(top * DYN.k * 8) / 8); if (Math.abs(renderer.getPixelRatio() - pr) > 0.01) { renderer.setPixelRatio(pr); resize(); }
  const sm = on ? Math.max(fxBaseShadow, 1280) : fxBaseShadow; if (sun.shadow.mapSize.x !== sm) { sun.shadow.mapSize.set(sm, sm); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
}

/* ----- cloud shadows: the sun's light on lit materials is dimmed by a tiling cloud texture that drifts with the wind ----- */
CLOUDU.uCamW.value = cam.matrixWorld;

/* ----- water glints: twinkling points on the sea, the pond and the fountain (each shown only when it is there) ----- */
const GL_N = 700, glGeo = new T.BufferGeometry();
{ const p = [], sd = [], gr = []; let i = 0, tries = 0;
  const fy = (() => { try { fountain.water.updateMatrixWorld(true); return new T.Vector3().setFromMatrixPosition(fountain.water.matrixWorld).y; } catch (e) { return 0.36; } })();
  while (i < GL_N && tries < 20000) { tries++; let x, y, z, g; const r = hash(tries, 91);
    if (r < 0.8) { x = (hash(tries, 93) - 0.5) * 70; z = (hash(tries, 95) - 0.5) * 50; const d = isleD(x, z); if (d < 1.12 || d > 2.4) continue; y = -0.39; g = 0; }
    else if (r < 0.93) { if (typeof POND === 'undefined') continue; const a = hash(tries, 97) * 6.283, q = Math.sqrt(hash(tries, 99)) * 0.85; x = POND.x + Math.cos(a) * POND.r * 1.2 * q; z = POND.z + Math.sin(a) * POND.r * q; y = 0.06; g = 1; }
    else { const a = hash(tries, 97) * 6.283, q = Math.sqrt(hash(tries, 99)) * 0.8; x = Math.cos(a) * q; z = Math.sin(a) * q; y = fy + 0.02; g = 2; }
    p.push(x, y, z); sd.push(hash(tries, 101)); gr.push(g); i++; }
  glGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(p), 3)); glGeo.setAttribute('aS', new T.BufferAttribute(new Float32Array(sd), 1)); glGeo.setAttribute('aG', new T.BufferAttribute(new Float32Array(gr), 1)); }
const glTex = gradTex(32, 32, [[0, 255, 255, 255, 1], [0.15, 255, 250, 235, 0.8], [0.45, 255, 240, 210, 0.18], [1, 255, 235, 200, 0]]);
const glMat = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false,
  uniforms: { uT: { value: 0 }, uOp: { value: 0 }, uScale: { value: 400 }, uTex: { value: glTex }, uCol: { value: new T.Color('#fff6dc') }, uG: { value: new T.Vector3(1, 1, 1) }, uFocus: { value: new T.Vector3() } },
  vertexShader: CURVE_GLSL + `uniform float uT, uScale; uniform vec3 uG, uFocus; attribute float aS, aG; varying float vA;
    void main(){ vec3 w = position; w.y -= worldCurveDrop(w); vec4 mv = viewMatrix * vec4(w, 1.0);
      float on = aG < 0.5 ? uG.x : aG < 1.5 ? uG.y : uG.z;
      float tw = pow(max(sin(uT * (1.6 + aS * 2.4) + aS * 60.0), 0.0), 14.0);
      vA = on * tw * (1.0 - smoothstep(22.0, 34.0, length(position.xz - uFocus.xz)));
      vA *= smoothstep(4.0, 8.0, -mv.z); gl_PointSize = (0.16 + 0.12 * fract(aS * 5.3)) * uScale / -mv.z * (0.5 + 0.5 * tw);
      gl_Position = vA > 0.001 ? projectionMatrix * mv : vec4(2.0, 2.0, 2.0, 1.0); }`,
  fragmentShader: `uniform sampler2D uTex; uniform float uOp; uniform vec3 uCol; varying float vA;
    void main(){ vec2 q = gl_PointCoord - 0.5; float star = texture2D(uTex, gl_PointCoord).a + 0.6 * max(0.0, 1.0 - abs(q.x) * 14.0) * (1.0 - abs(q.y) * 2.0) + 0.6 * max(0.0, 1.0 - abs(q.y) * 14.0) * (1.0 - abs(q.x) * 2.0);
      gl_FragColor = vec4(uCol * star * vA * uOp, 1.0); }` });
const glints = new T.Points(glGeo, glMat); glints.frustumCulled = false; glints.renderOrder = 4; glints.visible = false; sc.add(glints);

/* ----- evening details: window light pools, chimney smoke, stall lights ----- */
const EV = { pools: null, poolKey: '', t: 0, bulbs: null, bulbKey: '', smoke: null, chim: null, chimTry: 0 };
const poolTex = gradTex(64, 64, [[0, 255, 214, 150, 0.85], [0.35, 255, 196, 120, 0.45], [0.7, 255, 180, 100, 0.12], [1, 255, 170, 90, 0]]);
const poolMatW = new T.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
const _ev = new T.Vector3(), _ev2 = new T.Vector3(), _evq = new T.Quaternion();
const visChain = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
/* windows: the lit window panes (lampMat on the animal houses, lampMatH on the house); a pool lies on the ground in front of each */
function evPools() {
  const W = []; sc.traverse((o) => { if (o.isMesh && (o.material === lampMat || o.material === lampMatH) && visChain(o)) W.push(o); });
  const key = W.map((o) => o.id).join(','); if (key === EV.poolKey) return; EV.poolKey = key;
  const G = []; W.forEach((o) => { o.updateMatrixWorld(); o.getWorldPosition(_ev); o.getWorldQuaternion(_evq); _ev2.set(0, 0, 1).applyQuaternion(_evq); _ev2.y = 0; if (_ev2.lengthSq() < 0.01) return; _ev2.normalize();
    const big = o.material === lampMatH ? 1.35 : 1, g = new T.PlaneGeometry(1.5 * big, 1.9 * big).rotateX(-Math.PI / 2).rotateY(Math.atan2(_ev2.x, _ev2.z)); g.translate(_ev.x + _ev2.x * 0.95 * big, 0.045, _ev.z + _ev2.z * 0.95 * big); G.push(g); });
  if (EV.pools) { sc.remove(EV.pools); EV.pools.geometry.dispose(); EV.pools = null; }
  if (G.length) { EV.pools = new T.Mesh(mergeUV(G), poolMatW); EV.pools.renderOrder = 2; EV.pools.frustumCulled = false; sc.add(EV.pools); }
}
function mergeUV(L) { let n = 0; L.forEach((g) => { n += g.index ? g.index.count : g.attributes.position.count; }); const P = new Float32Array(n * 3), U = new Float32Array(n * 2); let o = 0;
  L.forEach((g) => { const h = g.index ? g.toNonIndexed() : g, p = h.attributes.position.array, u = h.attributes.uv.array; P.set(p, o * 3); U.set(u, o * 2); o += p.length / 3; });
  const m = new T.BufferGeometry(); m.setAttribute('position', new T.BufferAttribute(P, 3)); m.setAttribute('uv', new T.BufferAttribute(U, 2)); return m; }
/* stall lights: small warm bulbs along the lower edges of every striped awning */
const bulbTex = gradTex(32, 32, [[0, 255, 250, 225, 1], [0.2, 255, 220, 150, 0.85], [0.5, 255, 190, 110, 0.25], [1, 255, 170, 90, 0]]);
const bulbMat = new T.PointsMaterial({ map: bulbTex, size: 0.32, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0, color: '#ffffff' });
function evBulbs() {
  const awn = typeof FL !== 'undefined' && FL && FL.awn ? Object.values(FL.awn) : []; if (!awn.length) return;
  sc.updateMatrixWorld(); const A = []; sc.traverse((o) => { if (o.isMesh && awn.includes(o.material) && visChain(o)) { o.updateMatrixWorld(); if (Math.abs(o.matrixWorld.determinant()) > 1e-4) A.push(o); } });
  const key = A.map((o) => o.id).join(','); if (key === EV.bulbKey) return; EV.bulbKey = key;
  const P = [], bx = new T.Box3();
  A.forEach((o) => { bx.setFromObject(o); const sx = bx.max.x - bx.min.x, sz = bx.max.z - bx.min.z, y = bx.min.y - 0.04; if (sx > 6 || sz > 6) return;
    const along = sx >= sz, L = along ? sx : sz, n = Math.max(3, Math.round(L / 0.32));
    for (let i = 0; i <= n; i++) { const t = i / n, sag = Math.sin(t * Math.PI * 3) * 0.04; [0, 1].forEach((side) => { if (along) P.push(bx.min.x + sx * t, y - Math.abs(sag), side ? bx.max.z : bx.min.z); else P.push(side ? bx.max.x : bx.min.x, y - Math.abs(sag), bx.min.z + sz * t); }); } });
  if (EV.bulbs) { sc.remove(EV.bulbs); EV.bulbs.geometry.dispose(); EV.bulbs = null; }
  if (P.length) { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); EV.bulbs = new T.Points(g, bulbMat); EV.bulbs.frustumCulled = false; EV.bulbs.renderOrder = 5; sc.add(EV.bulbs); }
}
/* smoke: a little stone chimney on the house roof (found by dropping a ray onto the roof), plus the shop's own chimney */
const SM_N = 14, smTex = gradTex(32, 32, [[0, 255, 255, 255, 0.85], [0.5, 255, 255, 255, 0.4], [1, 255, 255, 255, 0]]);
const smMat = new T.ShaderMaterial({ transparent: true, depthWrite: false, fog: false, uniforms: { uTex: { value: smTex }, uCol: { value: new T.Color('#e8e4dc') }, uScale: { value: 400 } },
  vertexShader: CURVE_GLSL + `attribute float aA, aSz; uniform float uScale; varying float vA;
    void main(){ vec3 w = position; w.y -= worldCurveDrop(w); vec4 mv = viewMatrix * vec4(w, 1.0); vA = aA * smoothstep(3.0, 6.0, -mv.z); gl_PointSize = aSz * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform sampler2D uTex; uniform vec3 uCol; varying float vA; void main(){ float a = texture2D(uTex, gl_PointCoord).a * vA; if (a < 0.01) discard; gl_FragColor = vec4(uCol, a); }` });
function evChimney() {
  const src = []; try { if (typeof STORE !== 'undefined') src.push([STORE.x + 1.0, 2.95, STORE.z - 0.4]); } catch (e) {}
  if (houseG && houseG.visible) {
    if (!EV.chim) { houseG.updateMatrixWorld(true); const lx = 0.55, lz = -0.3, from = houseG.localToWorld(new T.Vector3(lx, 8, lz)), rc = new T.Raycaster(from, new T.Vector3(0, -1, 0), 0, 12);
      const hit = rc.intersectObjects(houseG.children, true).find((h) => h.object.material !== ink); if (hit) { const g = new T.Group(); const m = new T.Mesh(fac(jit(new T.BoxGeometry(0.26, 0.7, 0.26), 0.01, 7), '#b8aa98', 1777), MAT); m.position.y = 0.2; m.castShadow = true; g.add(m);
        const cap = new T.Mesh(fac(new T.BoxGeometry(0.34, 0.07, 0.34), '#8f8374', 1778), MAT); cap.position.y = 0.58; g.add(cap); g.position.copy(hit.point); sc.add(g); EV.chim = g; } }
    if (EV.chim) { EV.chim.visible = true; src.push([EV.chim.position.x, EV.chim.position.y + 0.66, EV.chim.position.z]); } }
  else if (EV.chim) EV.chim.visible = false;
  return src;
}
function evSmoke(dt, src, night) {
  const N = SM_N * 2; if (!EV.smoke) { const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(N * 3), 3)); g.setAttribute('aA', new T.BufferAttribute(new Float32Array(N), 1)); g.setAttribute('aSz', new T.BufferAttribute(new Float32Array(N), 1));
    EV.smoke = new T.Points(g, smMat); EV.smoke.frustumCulled = false; EV.smoke.renderOrder = 6; sc.add(EV.smoke); }
  const g = EV.smoke.geometry, P = g.attributes.position.array, A = g.attributes.aA.array, S = g.attributes.aSz.array, wx = typeof WIND !== 'undefined' ? WIND.x * (0.4 + WIND.g) : 0.4, wz = typeof WIND !== 'undefined' ? WIND.z * (0.4 + WIND.g) : -0.2;
  for (let c = 0; c < 2; c++) for (let i = 0; i < SM_N; i++) { const k = c * SM_N + i, s = src[c]; if (!s) { A[k] = 0; continue; }
    const q = ((reduced ? 0.3 : time) * 0.16 + i / SM_N) % 1, sw = Math.sin(time * 0.9 + i * 1.7) * 0.12 * q;
    P[k * 3] = s[0] + (wx + 0.25) * q * 1.0 + sw; P[k * 3 + 1] = s[1] + q * 1.3; P[k * 3 + 2] = s[2] + wz * q * 1.2;
    A[k] = 0.85 * smoothstep(0, 0.1, q) * (1 - smoothstep(0.4, 1, q)); S[k] = 0.4 + q * 0.8; }
  g.attributes.position.needsUpdate = true; g.attributes.aA.needsUpdate = true; g.attributes.aSz.needsUpdate = true;
  smMat.uniforms.uCol.value.set('#a9a49c').lerp(sc.fog.color, 0.15 + 0.3 * night);
}

/* ----- soft corner shade: vertex colours darkened near the ground and under overhangs, once per geometry ----- */
const AO = { on: false, done: new WeakSet(), list: [], t: 0 };
function aoScan() {
  sc.updateMatrixWorld();
  sc.traverse((o) => { if (!o.isMesh || !o.geometry || AO.done.has(o.geometry)) return; const g = o.geometry, c = g.attributes.color, p = g.attributes.position, n = g.attributes.normal;
    AO.done.add(g); if (!c || !p || !n || c.itemSize !== 3 || o === water || o.material === poolMatW) return;
    if (!g.boundingBox) g.computeBoundingBox(); { const B = g.boundingBox, hy = B.max.y - B.min.y, hx = Math.max(B.max.x - B.min.x, B.max.z - B.min.z); if (hy < 0.08 || (hx > 3 && hy < 0.6) || hx > 30) return; } /* ground, paths, floors, terrain */
    o.updateMatrixWorld(); const e = o.matrixWorld.elements, base = new Float32Array(c.array), ao = new Float32Array(c.count);
    for (let i = 0; i < c.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), wy = e[1] * x + e[5] * y + e[9] * z + e[13];
      const nyw = e[1] * n.getX(i) + e[5] * n.getY(i) + e[9] * n.getZ(i), sy = Math.hypot(e[1], e[5], e[9]) || 1;
      ao[i] = (0.52 + 0.48 * smoothstep(-0.02, 0.55, wy)) * (1 - 0.35 * Math.max(0, -nyw / sy)); }
    AO.list.push({ c, base, ao }); if (AO.on) aoApply(AO.list[AO.list.length - 1], true); });
}
function aoApply(r, on) { const a = r.c.array; if (on) for (let i = 0; i < r.ao.length; i++) { const k = r.ao[i]; a[i * 3] = r.base[i * 3] * k; a[i * 3 + 1] = r.base[i * 3 + 1] * k; a[i * 3 + 2] = r.base[i * 3 + 2] * k; } else a.set(r.base); r.c.needsUpdate = true; }

/* ----- 3D grass: one instanced draw of blade clumps in a square that wraps around Pip, fading into the painted ground.
   Colour and where it may grow come from a small texture built from the ground's own colours, the road mask and the
   pens, houses and props; wind waves and bending happen in the vertex shader. ----- */
/* grass patch size (test switch in the settings, 2026-11-22): side of the square and where it fades out around Pip */
const GR_SIZES = { 17: [5.2, 7.8], 24: [8, 11], 34: [12, 16] };
let grSize = 34; try { const v = +localStorage.getItem('pips-grass2'); /* Leon 2026-11-23: 34 in ultra, no noticeable cost */ if (GR_SIZES[v]) grSize = v; } catch (e) {}
const GR = { L: grSize, N: 0, mesh: null, t: 0, tex: null, W: 116, H: 80, push: [] };
for (let i = 0; i < 8; i++) GR.push.push(new T.Vector4(0, 0, 0, 0));
function grClump() {
  const P = [], C = [], N = [], I = [];
  for (let b = 0; b < 3; b++) { const a = b * 2.1 + 0.4, ca = Math.cos(a), sa = Math.sin(a), ox = Math.cos(b * 2.4) * 0.06, oz = Math.sin(b * 2.4) * 0.06, w = 0.028, hk = 1 - b * 0.18, o = P.length / 3;
    [[-w, 0], [w, 0], [-w * 0.6, 0.5], [w * 0.6, 0.5], [0, 1]].forEach(([x, t]) => { P.push(ox + x * ca, t * hk, oz + x * sa); const c = 0.82 + 0.3 * t; C.push(c, c, c); N.push(0, 1, 0); });
    I.push(o, o + 1, o + 2, o + 1, o + 3, o + 2, o + 2, o + 3, o + 4); }
  const g = new T.InstancedBufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setAttribute('color', new T.Float32BufferAttribute(C, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(N, 3)); g.setIndex(I); return g; }
function grBuild(dens) {
  const L = GR.L, n = Math.round(L * L * dens), g = grClump(), a = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) { a[i * 4] = hash(i, 201) * L; a[i * 4 + 1] = hash(i, 203) * L; a[i * 4 + 2] = hash(i, 207); a[i * 4 + 3] = 0.65 + 0.7 * hash(i, 209); }
  g.setAttribute('aI', new T.InstancedBufferAttribute(a, 4)); g.instanceCount = n; GR.N = n;
  const d = new Uint8Array(GR.W * GR.H * 4); GR.tex = new T.DataTexture(d, GR.W, GR.H, T.RGBAFormat); GR.tex.magFilter = GR.tex.minFilter = T.LinearFilter; GR.tex.needsUpdate = true;
  const m = new T.MeshLambertMaterial({ vertexColors: true, side: T.DoubleSide });
  GR.u = { uGFocus: { value: new T.Vector3() }, uGL: { value: L }, uGT: { value: 0 }, uGWind: { value: new T.Vector2() }, uGPush: { value: GR.push }, uGTex: { value: GR.tex }, uGH: { value: 0.42 }, uGFade: { value: new T.Vector2(GR_SIZES[GR.L][0], GR_SIZES[GR.L][1]) } };
  m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, GR.u); sh.uniforms.gMask = GU.mask; sh.uniforms.gDet = GU.det;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 aI; uniform vec3 uGFocus; uniform float uGL, uGT, uGH; uniform vec2 uGWind, uGFade; uniform vec4 uGPush[8]; uniform sampler2D uGTex, gMask, gDet;')
      .replace('#include <color_vertex>', `#include <color_vertex>
        vec2 gc = uGFocus.xz, groot = gc + (fract((aI.xy - gc) / uGL + 0.5) - 0.5) * uGL;
        vec2 guv = vec2((groot.x + 29.0) / 58.0, (groot.y + 20.0) / 40.0);
        vec4 gtx = texture2D(uGTex, guv); vec4 gmk = texture2D(gMask, guv);
        float gd = gtx.a * (1.0 - smoothstep(0.15, 0.6, gmk.r + gmk.g));
        float gh = uGH * aI.w * smoothstep(0.2, 0.7, gd) * (1.0 - smoothstep(uGFade.x, uGFade.y, length(groot - gc)));
        vColor.rgb *= gtx.rgb * texture2D(gDet, guv).rgb * 1.02;`)
      .replace('#include <begin_vertex>', `float ga = aI.z * 6.2832; mat2 gr = mat2(cos(ga), -sin(ga), sin(ga), cos(ga)); vec2 gp = gr * position.xz * (0.8 + 0.5 * aI.w); float gt = position.y;
        vec2 gw = normalize(uGWind + vec2(1e-4)); vec2 gb = uGWind * (0.45 + 0.55 * sin(dot(groot, gw) * 0.75 - uGT * 2.3 + aI.z * 1.5)) + vec2(sin(uGT * 1.4 + aI.z * 20.0), cos(uGT * 1.1 + aI.z * 13.0)) * 0.06;
        for (int i = 0; i < 8; i++) { vec2 dd = groot - uGPush[i].xy; float k = (1.0 - smoothstep(0.0, uGPush[i].z + 1e-3, length(dd))) * uGPush[i].w; gb += normalize(dd + vec2(1e-4)) * k * 1.4; }
        float gbl = length(gb); if (gbl > 1.3) gb *= 1.3 / gbl;
        vec3 transformed = vec3(groot.x + gp.x + gb.x * gt * gt * gh, gt * gh * (1.0 - 0.35 * min(gbl, 1.0) * gt), groot.y + gp.y + gb.y * gt * gt * gh);`);
    sh.fragmentShader = sh.fragmentShader.split('gl_FrontFacing').join('true').replace('* getShadowMask();', '* mix( vec3( 0.24, 0.33, 0.40 ), vec3( 1.0 ), getShadowMask() );'); };
  m.customProgramCacheKey = () => 'pipsgrass';
  GR.mesh = new T.Mesh(g, m); GR.mesh.frustumCulled = false; GR.mesh.receiveShadow = true; GR.mesh.castShadow = false; GR.mesh.visible = false; sc.add(GR.mesh);
}
/* where grass grows and its colour: the ground's own vertex colours averaged per texel; none on the sea, in pens, under props */
function grMask() {
  if (!ground) return; const W = GR.W, H = GR.H, d = GR.tex.image.data, acc = new Float32Array(W * H * 4);
  const p = ground.geometry.attributes.position, c = ground.geometry.attributes.color;
  for (let i = 0; i < p.count; i++) { const tx = Math.round((p.getX(i) + 29) / 58 * W - 0.5), tz = Math.round((p.getZ(i) + 20) / 40 * H - 0.5); if (tx < 0 || tz < 0 || tx >= W || tz >= H) continue; const o = (tz * W + tx) * 4; acc[o] += c.getX(i); acc[o + 1] += c.getY(i); acc[o + 2] += c.getZ(i); acc[o + 3]++; }
  const pens = typeof PEN !== 'undefined' ? Object.values(PEN) : [], deco = typeof DECO !== 'undefined' ? DECO : [];
  for (let tz = 0; tz < H; tz++) for (let tx = 0; tx < W; tx++) { const o = (tz * W + tx) * 4, x = (tx + 0.5) / W * 58 - 29, z = (tz + 0.5) / H * 40 - 20;
    let k = 1 - smoothstep(0.84, 0.9, isleD(x, z));
    if (k > 0 && typeof MEADOW !== 'undefined' && x > MEADOW.x0 - 0.3 && x < MEADOW.x1 + 0.3 && z > MEADOW.z0 - 0.3 && z < MEADOW.z1 + 0.3) k = 0;
    if (k > 0) for (const q of pens) if (Math.abs(x - q.x) < q.w / 2 + 0.35 && Math.abs(z - q.z) < q.d / 2 + 0.35) { k = 0; break; }
    if (k > 0 && Math.abs(x - HOUSE.x) < 1.9 && z > HOUSE.z - 1.8 && z < HOUSE.z + 1.9) k = 0;
    if (k > 0) for (const q of deco) { const r = q.r * 0.85; if (Math.abs(x - q.x) < r && Math.abs(z - q.z) < r && Math.hypot(x - q.x, z - q.z) < r) { k = 0; break; } }
    if (k > 0 && typeof SRC !== 'undefined') for (const t in SRC) if (Math.hypot(x - SRC[t].x, z - SRC[t].z) < 1.1) { k = 0; break; }
    const n = acc[o + 3] || 1, cr = acc[o + 3] ? acc[o] / n : 0.55, cg = acc[o + 3] ? acc[o + 1] / n : 0.7, cb = acc[o + 3] ? acc[o + 2] / n : 0.35;
    d[o] = Math.round(clamp(cr, 0, 1) * 255); d[o + 1] = Math.round(clamp(cg, 0, 1) * 255); d[o + 2] = Math.round(clamp(cb, 0, 1) * 255); d[o + 3] = Math.round(k * 255); }
  GR.tex.needsUpdate = true;
}
function grPushers() {
  const L = []; const add = (o, r) => { if (o && o.visible !== false) L.push([o.position.x, o.position.z, r]); };
  add(pip, 0.55); if (typeof PETS !== 'undefined') Object.values(PETS).forEach((p) => p && p.g && p.g.visible && add(p.g, 0.45));
  if (typeof animals !== 'undefined') animals.forEach((an) => an.g && add(an.g, an.a === 'cow' || an.a === 'horse' ? 0.8 : 0.5));
  if (typeof mount !== 'undefined' && mount && mount.g) add(mount.g, 1.0);
  L.sort((a, b) => Math.hypot(a[0] - camFocus.x, a[1] - camFocus.z) - Math.hypot(b[0] - camFocus.x, b[1] - camFocus.z));
  for (let i = 0; i < 8; i++) { const q = L[i]; if (q) GR.push[i].set(q[0], q[1], q[2], 1); else GR.push[i].set(0, 0, 0, 0); }
}

/* ----- ground variety: patchy noise on the ground shader, cobbles (mask g), dirt (mask r) and grass each in their own way ----- */
const GVU = { uGV: { value: 0 } };
if (ground && ground.material) { const gm = ground.material, ob = gm.onBeforeCompile;
  gm.onBeforeCompile = (sh, r) => { ob.call(gm, sh, r); sh.uniforms.uGV = GVU.uGV;
    const a = 'diffuseColor.rgb *= gcl * gdt * 1.02;'; if (sh.fragmentShader.indexOf(a) < 0) { console.warn('fx: ground shader changed'); return; }
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vGw;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvGw = position.xz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec2 vGw; uniform float uGV;
      float gvH(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float gvN(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(gvH(i), gvH(i + vec2(1.0, 0.0)), f.x), mix(gvH(i + vec2(0.0, 1.0)), gvH(i + vec2(1.0, 1.0)), f.x), f.y); }
      float gvF(vec2 p) { return 0.55 * gvN(p) + 0.3 * gvN(p * 2.1 + 3.1) + 0.15 * gvN(p * 4.3 + 7.7); }`)
      .replace(a, a + `
      if (uGV > 0.0) {
        float n1 = gvF(vGw * 0.32), n2 = gvF(vGw * 1.15 + 11.0), n3 = gvN(vGw * 7.0);
        vec3 c0 = diffuseColor.rgb, c = c0;
        /* cobbles: big worn light patches, grimy dark patches, warm and cool stones, moss creeping in from the edges */
        float cob = gmk.g;
        vec3 cc = c * mix(0.8, 1.12, n1) * mix(vec3(0.94, 0.97, 1.02), vec3(1.06, 0.99, 0.9), n2);
        cc *= 1.0 - 0.22 * smoothstep(0.62, 0.8, n2) * (0.5 + 0.5 * n3);
        float moss = smoothstep(0.55, 0.85, n2 + (1.0 - smoothstep(0.35, 0.95, cob)) * 0.45) * smoothstep(0.15, 0.4, cob);
        cc = mix(cc, cc * vec3(0.78, 0.96, 0.6), moss * 0.45);
        /* dirt: damp dark patches, dusty light ones, scattered pebbles */
        float dirt = gmk.r * (1.0 - cob);
        vec3 dc = c * mix(0.78, 1.1, n1) * mix(vec3(0.9, 0.86, 0.82), vec3(1.05, 1.02, 0.95), n2);
        float peb = step(0.93, gvH(floor(vGw * 6.0))) * smoothstep(0.35, 0.1, length(fract(vGw * 6.0) - 0.5));
        dc = mix(dc, dc * mix(0.62, 1.25, gvH(floor(vGw * 6.0) + 3.0)), peb);
        dc *= 1.0 - 0.15 * (1.0 - smoothstep(0.2, 0.6, gmk.r)); /* darker where the path meets the grass */
        /* grass: lighter and darker swathes, a little dry yellow here and there */
        float gr = (1.0 - gmk.r) * (1.0 - cob);
        vec3 gc = c * mix(0.86, 1.1, n1); gc = mix(gc, gc * vec3(1.12, 1.06, 0.78), smoothstep(0.68, 0.9, n2) * 0.5);
        c = cc * cob + dc * dirt + gc * gr;
        diffuseColor.rgb = mix(c0, c, uGV);
      }`); };
  gm.needsUpdate = true; }

/* ----- every frame ----- */
function fxWorld(dt) {
  const k = FX.k, out = !inHouse && !inBarn && !(typeof inStore !== 'undefined' && inStore), top = cam.position.y > 22;
  /* shafts */
  /* the beams only read as beams when the sun is behind or beside the camera; with the sun ahead (it moves now) they are
     seen end-on as soft bright blobs, and by moonlight they are not wanted at all */
  const shSd = _fv1.copy(sun.position).sub(sun.target.position).setY(0).normalize(), shFw = cam.getWorldDirection(_fv2).setY(0).normalize();
  const shK = k.sun * smoothstep(0.55, 0.9, k.sun) * (1 - smoothstep(-0.25, 0.3, shSd.dot(shFw)));
  const shOn = fxUse('shafts') && out && !top && shK > 0.02; shafts.visible = shOn;
  if (shOn) { shPlace(); const u = shMat.uniforms; u.uL.value.copy(sun.position).sub(sun.target.position).normalize(); u.uFocus.value.copy(camFocus); u.uT.value = reduced ? 0 : time;
    u.uOp.value = shK * (0.18 + 0.12 * k.gold); u.uCol.value.copy(sun.color).lerp(_fxc.set('#ffd9a0'), 0.4); }
  /* motes */
  const moOn = fxUse('motes') && out && !top && k.sun > 0.55; /* not by moonlight: lone bright specks at night */ motes.visible = moOn;
  if (moOn) { const u = moMat.uniforms; u.uFocus.value.copy(camFocus); u.uT.value = reduced ? 0 : time; u.uOp.value = k.sun * smoothstep(0.55, 0.9, k.sun) * (1.1 + 0.6 * k.gold); u.uScale.value = fxSize.y > 0 ? fxSize.y * 0.5 / Math.tan(cam.fov * Math.PI / 360) : 400;
    u.uCol.value.set('#fff3d2').lerp(_fxc.set('#ffc88a'), k.gold); if (typeof WIND !== 'undefined' && !reduced) { u.uWind.value.x += WIND.x * WIND.g * dt * 0.8; u.uWind.value.y += WIND.z * WIND.g * dt * 0.8; } }
  /* cloud shadows: more cover, more shade; none on grey days (everything is in the shade then) or indoors */
  const clK = fxUse('clouds') && out ? k.sun : 0; CLOUDU.uCloudK.value = clK * 0.5;
  if (clK > 0) { const cv = typeof skyCover === 'number' ? skyCover : 0.35; CLOUDU.uCloudThr.value = 0.66 - cv * 0.32; const w = 0.004 + 0.012 * (typeof windAmt === 'number' ? windAmt : 0), ang = typeof wxAng === 'number' ? wxAng : 0.6;
    if (!reduced) { CLOUDU.uCloudOff.value.x -= Math.cos(ang) * w * dt; CLOUDU.uCloudOff.value.y -= Math.sin(ang) * w * dt; } }
  /* glints */
  const glOn = fxUse('glints') && out && !top && k.sun > 0.3; glints.visible = glOn;
  if (glOn) { const u = glMat.uniforms; u.uT.value = reduced ? 0 : time; u.uOp.value = k.sun * (0.9 + 0.5 * k.gold); u.uScale.value = moMat.uniforms.uScale.value || 400; if (!moOn) u.uScale.value = fxSize.y > 0 ? fxSize.y * 0.5 / Math.tan(cam.fov * Math.PI / 360) : 400; u.uFocus.value.copy(camFocus);
    u.uG.value.set(1, pond && pond.water && pond.water.visible ? 1 : 0, fountain && fountain.water && fountain.water.visible ? 1 : 0); u.uCol.value.set('#fff8e6').lerp(_fxc.set('#ffd29a'), k.gold); }
  /* evening details: from late afternoon to morning */
  const evOn = fxUse('evening'), dusk = Math.max(k.night, k.gold * 0.6);
  if (evOn) { EV.t -= dt; if (EV.t <= 0) { EV.t = 2; if (dusk > 0.05 && out) { evPools(); evBulbs(); } }
    if (EV.pools) { EV.pools.visible = out && dusk > 0.02; poolMatW.opacity = dusk * 0.55; }
    if (EV.bulbs) { EV.bulbs.visible = out && dusk > 0.02; bulbMat.opacity = Math.min(1, dusk * 1.4) * (reduced ? 1 : 0.9 + 0.1 * Math.sin(time * 5.1)); }
    const src = out && !top ? evChimney() : []; if (src.length) { evSmoke(dt, src, k.night); EV.smoke.visible = true; smMat.uniforms.uScale.value = fxSize.y > 0 ? fxSize.y * 0.5 / Math.tan(cam.fov * Math.PI / 360) : 400; } else if (EV.smoke) EV.smoke.visible = false; }
  else { if (EV.pools) EV.pools.visible = false; if (EV.bulbs) EV.bulbs.visible = false; if (EV.smoke) EV.smoke.visible = false; if (EV.chim) EV.chim.visible = false; }
  /* ground variety */
  GVU.uGV.value = fxUse('ground') ? 1 : 0;
  /* 3D grass */
  const grOn = fxUse('grass') && out && !top;
  if (grOn) { if (!GR.mesh) { grBuild(32); grMask(); } GR.t -= dt; if (GR.t <= 0) { GR.t = 10; grMask(); }
    const u = GR.u; u.uGFocus.value.set(camFocus.x, 0, camFocus.z - 1.2); u.uGT.value = reduced ? 0 : time;
    const wg = typeof WIND !== 'undefined' ? 0.25 + 0.75 * WIND.g : 0.3; u.uGWind.value.set(typeof WIND !== 'undefined' ? WIND.x : 0.7, typeof WIND !== 'undefined' ? WIND.z : -0.4).normalize().multiplyScalar(0.25 + 0.55 * wg);
    u.uGH.value = season === 'winter' ? 0.12 : 0.32; grPushers(); }
  if (GR.mesh) GR.mesh.visible = grOn;
  /* soft corner shade */
  const aoOn = fxUse('ao'); AO.t -= dt; if (aoOn && AO.t <= 0) { AO.t = 3; aoScan(); }
  if (aoOn !== AO.on) { AO.on = aoOn; AO.list.forEach((r) => aoApply(r, aoOn)); }
  /* halos */
  const hOn = fxUse('halos') && out && k.night > 0.01;
  if (hOn) { haloT -= dt; if (haloT <= 0) { haloT = 1; halos.forEach((s) => { const l = typeof ISLE_BY !== 'undefined' && ISLE_BY[s.userData.lot]; s.visible = !l || !l.meshes || !l.meshes.length || l.meshes.some((m) => m.visible); }); }
    haloMat.opacity = k.night * 0.5 * (reduced ? 1 : 0.94 + 0.06 * Math.sin(time * 7.3)); } else if (halos.length && halos[0].visible) { halos.forEach((s) => { s.visible = false; }); haloT = 0; }
}
const _fxc = new T.Color();
function fxRender(dt) {
  dynStep(dt); fxLight(dt); fxSharp(fxUse('sharp')); fxWorld(dt);
  renderer.info.autoReset = false; renderer.info.reset();
  const post = fxUse('rays') || fxUse('bloom') || fxUse('grade');
  if (!post) { renderer.setRenderTarget(null); renderer.render(sc, cam); return; }
  fxTargets(); renderer.setRenderTarget(fxMain); renderer.render(sc, cam);
  const k = FX.k, rays = fxUse('rays') && k.sun > 0.02, bloom = fxUse('bloom'), qw = fxA.width, qh = fxA.height;
  if (rays || bloom) { const b = fxBright.uniforms; b.tS.value = fxMain.texture; b.uPx.value.set(1 / fxSize.x, 1 / fxSize.y); b.uThr.value = 0.84 + 0.1 * k.night; /* the bright sky no longer blooms into a white wash */ fxPass(fxBright, fxA); }
  if (rays) { fxSource(); fxRays.uniforms.tM.value = fxA.texture; fxPass(fxRays, fxR); const u = fxBlur.uniforms; u.tS.value = fxR.texture; u.uDir.value.set(1.5 / qw, 0); fxPass(fxBlur, fxR2); u.tS.value = fxR2.texture; u.uDir.value.set(0, 1.5 / qh); fxPass(fxBlur, fxR); }
  if (bloom) { const u = fxBlur.uniforms; for (let i = 0; i < 2; i++) { const s = 1 + i * 1.6; u.tS.value = fxA.texture; u.uDir.value.set(s / qw, 0); fxPass(fxBlur, fxB); u.tS.value = fxB.texture; u.uDir.value.set(0, s / qh); fxPass(fxBlur, fxA); } }
  const c = fxComp.uniforms; c.tS.value = fxMain.texture; c.tB.value = fxA.texture; c.tR.value = fxR.texture;
  c.uBloom.value = bloom ? (0.8 + 0.1 * k.night + 0.25 * k.gold) * 0.6 : 0; c.uRays.value = rays ? k.sun * smoothstep(0.4, 0.8, k.sun) * fxRayK * (2.2 + 0.8 * k.gold) * 0.55 : 0;
  c.uRayCol.value.copy(sun.color).lerp(_fxc.set('#fff0d0'), 0.35);
  c.uGrade.value = fxUse('grade') ? 1 : 0; c.uGold.value = fxUse('grade') ? k.gold * 0.55 : 0; c.uAsp.value = fxSize.x / fxSize.y;
  if (!rays) fxSource();
  fxPass(fxComp, null);
}

/* ----- settings: a sparkle button in the settings sheet switches high on and off; the test panel has one switch per effect ----- */
{
  const css = document.createElement('style');
  css.textContent = '.fxQBtn{position:relative}.fxQBtn b{position:absolute;left:0;right:0;bottom:2px;font:800 11px/1 system-ui,sans-serif;color:var(--ink);text-align:center}.fxQBtn{opacity:.6}.fxQBtn.on{opacity:1;background:#fff1c9}'
    + '#fxBtn{position:fixed;left:max(12px,env(safe-area-inset-left,0px));top:calc(50% + 34px);width:48px;height:48px;border-radius:50%;border:3px solid #22303c;background:#fffaf0;font-size:24px;line-height:1;box-shadow:0 4px 0 rgba(34,48,60,.25);z-index:30;padding:0}#fxBtn.on{background:#fff1c9}'
    + '#fxPan{position:fixed;left:max(70px,calc(env(safe-area-inset-left,0px) + 70px));top:50%;transform:translateY(-50%);width:min(330px,calc(100vw - 90px));max-height:calc(100vh - 40px);overflow:auto;padding:12px 14px;border-radius:18px;border:3px solid #22303c;background:#fbf3e2;font:600 14px Fredoka,system-ui,sans-serif;color:#22303c;z-index:31;box-shadow:0 5px 0 rgba(34,48,60,.25)}'
    + '#fxPan h3{margin:0 0 6px;font-size:17px}#fxPan label{display:flex;gap:8px;align-items:flex-start;margin:7px 0;line-height:1.2}#fxPan label input{width:20px;height:20px;flex:none;accent-color:#c8643a;margin:0}#fxPan label small{display:block;font-weight:500;opacity:.7;font-size:12px}#fxPan label em{margin-left:auto;font-style:normal;font-weight:700;white-space:nowrap;font-size:12px}'
    + '#fxPan .row{display:flex;gap:8px;margin-top:10px}#fxPan button{flex:1;padding:8px;border-radius:12px;border:2px solid #22303c;background:#fffaf0;font:inherit}#fxPan .note{font-size:12px;font-weight:500;opacity:.75;margin-top:8px;white-space:pre-wrap}#fxPan .hi{background:#fff1c9;border-radius:12px;padding:6px 8px;margin-bottom:4px}';
  document.head.appendChild(css);
  /* settings sheet button, next to draw distance */
  const db = document.getElementById('drawBtn');
  const qb = document.createElement('button'); qb.type = 'button'; qb.className = 'round fxQBtn'; qb.id = 'fxQBtn';
  qb.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 6 L28 19 L41 23 L28 27 L24 40 L20 27 L7 23 L20 19 Z" fill="#ffd66a" stroke="#22303c" stroke-width="3" stroke-linejoin="round"/><circle cx="38" cy="10" r="3" fill="#ffd66a" stroke="#22303c" stroke-width="2"/></svg><b></b>';
  if (db && db.parentNode) db.parentNode.insertBefore(qb, db.nextSibling);
  /* grass size: 17, 24 or 34 units around Pip (only seen with high quality on, as in ultra) */
  const gb = document.createElement('button'); gb.type = 'button'; gb.className = 'round grassBtn'; gb.id = 'grassBtn';
  gb.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 38 Q12 24 8 14 Q16 24 17 38 M19 38 Q22 20 24 8 Q26 20 29 38 M31 38 Q32 24 40 14 Q36 24 38 38" fill="#8fc163" stroke="#22303c" stroke-width="2.5" stroke-linejoin="round"/></svg><b></b>';
  if (qb.parentNode) qb.parentNode.insertBefore(gb, qb.nextSibling);
  const gsync = () => { gb.querySelector('b').textContent = grSize; gb.setAttribute('aria-label', 'Grass size ' + grSize); gb.style.opacity = FX.hi && FX.on.grass ? 1 : 0.5; };
  gb.addEventListener('click', (e) => { e.stopPropagation(); const k = [17, 24, 34]; grSize = k[(k.indexOf(grSize) + 1) % 3]; try { localStorage.setItem('pips-grass2', grSize); } catch (er) {}
    if (GR.mesh) { sc.remove(GR.mesh); GR.mesh.geometry.dispose(); GR.mesh.material.dispose(); GR.mesh = null; } GR.L = grSize; gsync(); Snd.play('pop', { gain: 0.4, f: 400 + grSize * 12 }); });
  FX.gsync = gsync;
  const btn = document.createElement('button'); btn.id = 'fxBtn'; btn.type = 'button'; btn.textContent = '✨'; btn.setAttribute('aria-label', 'Light effects'); btn.hidden = !FX_TEST && !devOn;
  const pan = document.createElement('div'); pan.id = 'fxPan'; pan.hidden = true;
  pan.innerHTML = '<h3>Light effects</h3><label class="hi"><input type="checkbox" data-hi><span>High quality<small>off = the normal game look</small></span></label>'
    + FX_KEYS.map(([k, n, d]) => '<label><input type="checkbox" data-k="' + k + '"><span>' + n + '<small>' + d + '</small></span><em data-ms="' + k + '"></em></label>').join('')
    + '<div class="row"><button type="button" data-bench>Measure cost</button><button type="button" data-close>Close</button></div><div class="note" data-note>Measure switches each effect on alone for a moment and times the frame (about 15 s). Stand still while it runs.</div>';
  const sync = () => { if (FX.gsync) FX.gsync(); qb.classList.toggle('on', FX.hi); qb.querySelector('b').textContent = FX.hi ? 'HIGH' : ''; qb.setAttribute('aria-label', 'Graphics quality: ' + (FX.hi ? 'high' : 'normal')); qb.setAttribute('aria-pressed', String(FX.hi)); btn.classList.toggle('on', FX.hi);
    pan.querySelector('[data-hi]').checked = FX.hi; FX_KEYS.forEach(([k]) => { const c = pan.querySelector('[data-k="' + k + '"]'); c.checked = FX.on[k]; c.disabled = !FX.hi && !FX_LOW.has(k); }); };
  FX.sync = sync;
  qb.addEventListener('click', () => { FX.hi = !FX.hi; fxSave(); sync(); Snd.play('sparkle', { gain: 0.35 }); });
  pan.addEventListener('change', (e) => { const k = e.target.dataset.k; if (k) FX.on[k] = e.target.checked; else if (e.target.hasAttribute('data-hi')) FX.hi = e.target.checked; fxSave(); sync(); });
  pan.addEventListener('click', (e) => { if (e.target.hasAttribute('data-close')) pan.hidden = true; if (e.target.hasAttribute('data-bench')) fxBenchStart(); });
  btn.addEventListener('click', () => { pan.hidden = !pan.hidden; if (!pan.hidden) sync(); });
  ['pointerdown', 'keydown', 'click'].forEach((ev) => pan.addEventListener(ev, (e) => e.stopPropagation()));
  document.body.appendChild(btn); document.body.appendChild(pan); sync();
  FX.pan = pan;
}

/* ----- measuring: each setting for ~1.5 s, time from the start of the render to a 1-pixel read (which waits for the GPU) ----- */
const fxPix = new Uint8Array(4);
function fxBenchStart() {
  if (FX.bench) return;
  const keep = { hi: FX.hi, on: Object.assign({}, FX.on), cap: fpsCap };
  const only = (k) => { const o = {}; FX_KEYS.forEach(([kk]) => { o[kk] = kk === k; }); return o; };
  const runs = [['base', false, only('')]].concat(FX_KEYS.map(([k]) => [k, true, only(k)]), [['all', true, Object.fromEntries(FX_KEYS.map(([k]) => [k, true]))]]);
  FX.bench = { runs, i: 0, n: 0, t: [], res: {}, keep }; fpsCap = 60;
  const note = FX.pan.querySelector('[data-note]'); note.textContent = 'Measuring…';
  FX.pan.querySelectorAll('[data-ms]').forEach((e) => { e.textContent = ''; });
  fxBenchApply();
}
function fxBenchApply() { const b = FX.bench, r = b.runs[b.i]; FX.hi = r[1]; FX.on = Object.assign({}, r[2]); b.n = 0; b.t = []; FX.sync(); }
function fxBenchFrame(t0) {
  const b = FX.bench; if (!b) return; const gl = renderer.getContext(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, fxPix);
  b.n++; if (b.n > 20) b.t.push(performance.now() - t0);
  if (b.t.length < 45) return;
  const s = b.t.slice().sort((x, y) => x - y), med = s[Math.floor(s.length / 2)]; b.res[b.runs[b.i][0]] = med;
  if (++b.i < b.runs.length) { fxBenchApply(); return; }
  FX.hi = b.keep.hi; FX.on = b.keep.on; fpsCap = b.keep.cap; FX.bench = null; FX.sync(); fxSave();
  const base = b.res.base, note = FX.pan.querySelector('[data-note]');
  FX_KEYS.forEach(([k]) => { const e = FX.pan.querySelector('[data-ms="' + k + '"]'); e.textContent = '+' + Math.max(0, b.res[k] - base).toFixed(1) + ' ms'; });
  const px = fxSize.x + '×' + fxSize.y;
  note.textContent = 'Normal frame ' + base.toFixed(1) + ' ms, everything on ' + b.res.all.toFixed(1) + ' ms (+' + (b.res.all - base).toFixed(1) + ').\nAt 60 fps a frame has 16.7 ms, at 30 fps 33 ms. Canvas ' + px + ' px.';
  window.__fxBench = b.res; console.log('fx bench', JSON.stringify(b.res));
}
function fxFrame(dt) { const t0 = performance.now(); fxRender(dt); if (FX.bench) fxBenchFrame(t0); }
if (window.__farmTest) { window.__dyn = DYN; window.__fx = FX; FX.u = fxComp.uniforms; FX.r = fxRays.uniforms; FX.cl = CLOUDU; FX.ren = renderer; FX.EV = EV; FX.AO = AO; FX.GR = GR; FX.awnInfo = () => { const awn = Object.values(FL.awn), out = [], v = new T.Vector3(); sc.traverse((o) => { if (o.isMesh && awn.includes(o.material)) { o.getWorldPosition(v); let ch = []; for (let p = o; p; p = p.parent) ch.push((p.type[0]) + (p.visible ? "" : "!") + (p.frustumCulled ? "" : "f") + (p.layers.mask !== 1 ? "L" : "")); out.push(v.toArray().map((q) => q.toFixed(1)).join(",") + " " + ch.join(">") + " det" + o.matrixWorld.determinant().toFixed(3)); } }); return out; }; }
