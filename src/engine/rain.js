/* ---------- rain look: painted mud puddles with ripples, wet ground, splashes, roof drips, slanted streaks, and Pip's rain gear ----------
   Cost budget (iPad): five extra draw calls in rain and no per-frame texture uploads.
   The puddle shapes are painted once into a small canvas atlas (16 organic blobs as soft "depth" fields); one merged
   mesh draws every puddle, and its few-line shader only adds the moving bits: the water line rising with `wet`, a dark
   mud rim, sky-tinted water and expanding ripple rings. The ground darkens and turns glossy through one uniform. */
const RS = { n: 0, gw: 0, dripE: null, dripT: 0 };

/* --- puddle atlas: each cell holds an irregular blob whose brightness rises toward its (off-centre) deepest point --- */
const PUD_TEX = (() => {
  const W = 512, C = 128, c = document.createElement('canvas'); c.width = c.height = W; const x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, W, W);
  for (let cell = 0; cell < 16; cell++) {
    const ox = (cell % 4) * C + C / 2, oy = Math.floor(cell / 4) * C + C / 2, h = (k) => hash(cell * 7.3 + k, 41.7, k * 0.37);
    const a1 = h(1) * 6.28, a2 = h(2) * 6.28, a3 = h(3) * 6.28, a4 = h(4) * 6.28, dx = (h(5) - 0.5) * 14, dy = (h(6) - 0.5) * 12, L = 22;
    for (let k = 0; k < L; k++) {
      const t = k / L, sc0 = 1 - t * 0.9, v = Math.round(255 * (k + 1) / L), wob = 1 - t * 0.5;
      x.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; x.beginPath();
      for (let i = 0; i <= 48; i++) { const th = i / 48 * 6.2832, r = 54 * sc0 * (1 + wob * (0.16 * Math.sin(2 * th + a1) + 0.1 * Math.sin(3 * th + a2) + 0.06 * Math.sin(5 * th + a3) + 0.035 * Math.sin(8 * th + a4 + t * 2)));
        const px = ox + dx * t + Math.cos(th) * r, py = oy + dy * t + Math.sin(th) * r * 0.92; if (i) x.lineTo(px, py); else x.moveTo(px, py); }
      x.closePath(); x.fill();
    }
  }
  const t = new T.CanvasTexture(c); t.anisotropy = 2; return t;
})();
/* where puddles lie: mostly on the dirt roads (long side along the road) and a few in grass hollows; [x, z, radius, angle] */
const PUD_AT = [[0, 5.3, 0.95, 1.57], [-5.4, 0, 1.05, 0.1], [5.6, 0.1, 0.9, -0.15], [-12.6, 3.0, 1.0, 1.5], [-12.6, -3.2, 0.85, 1.7], [0.1, -8.3, 0.8, 1.4],
  [4.2, 6.5, 0.75, 0.6], [-6.6, -5.1, 0.85, -0.6], [-7.6, -2.4, 0.7, 1.2], [6.9, -3.8, 0.9, -1.0], [-2.7, 7.1, 0.8, 0.35], [0.2, 10.2, 0.9, 1.6], [-9.3, 0.1, 0.75, 0.0], [12.2, 0.3, 0.7, 0.2], [2.6, -6.6, 0.6, 0.9], [-3.4, -10.0, 0.7, 0.4]];
const PUDDLES = (ISL.puddles || PUD_AT).map(([x, z, r, a], i) => ({ x, z, r: r * 0.8, a, cell: i % 16 }));
const pudU = { map: { value: PUD_TEX }, uWet: { value: 0 }, uRain: { value: 0 }, uT: { value: 0 }, uIce: { value: 0 }, uHor: { value: new T.Color() }, uTop: { value: new T.Color() }, uMud: { value: new T.Color('#3b2d22') }, uDeep: { value: new T.Color('#232c35') } };
const pudMat = new T.ShaderMaterial({
  uniforms: Object.assign(T.UniformsUtils.clone(T.UniformsLib.fog), pudU), fog: true, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2,
  vertexShader: CURVE_GLSL + `attribute vec3 pd; varying vec2 vUv; varying vec3 vPd; varying float fogDepth;
    void main(){ vUv = uv; vPd = pd; vec4 cw = modelMatrix * vec4(position, 1.0); cw.y -= worldCurveDrop(cw.xyz); vec4 mv = viewMatrix * cw; fogDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform sampler2D map; uniform float uWet; uniform float uRain; uniform float uT; uniform float uIce; uniform vec3 uHor; uniform vec3 uTop; uniform vec3 uMud; uniform vec3 uDeep;
    varying vec2 vUv; varying vec3 vPd;
    #include <fog_pars_fragment>
    float hh(float n){ return fract(sin(n) * 43758.5453); }
    void main(){
      float f = texture2D(map, (vPd.xy + vUv) * 0.25).r;
      float th = mix(1.02, 0.44, uWet);
      float water = smoothstep(th, th + 0.05, f);
      float mud = smoothstep(th - 0.4, th - 0.08, f) * smoothstep(0.0, 0.18, uWet);
      if (water + mud < 0.003) discard;
      /* ripples: a few rings per puddle, each born at a random spot and spreading out while it fades */
      float rip = 0.0;
      for (int i = 0; i < 6; i++) { float fi = float(i), ph = uT * (0.85 + 0.2 * hh(vPd.z + fi)) + fi * 0.2 + vPd.z * 3.0, n = floor(ph), a = fract(ph);
        vec2 c = vec2(hh(n * 1.31 + vPd.z * 17.0 + fi * 3.1), hh(n * 2.17 + vPd.z * 7.0 + fi * 5.3)) * 0.56 + 0.22;
        float d = length(vUv - c), r = 0.012 + a * 0.1; rip += (1.0 - a) * (smoothstep(0.012, 0.0, abs(d - r)) + 0.5 * smoothstep(0.01, 0.0, abs(d - r * 0.55))); }
      rip *= uRain * (1.0 - uIce);
      /* water: the overcast sky mirrored (horizon colour toward the far side), darker in the deep middle, a bright wet edge */
      float deep = smoothstep(th, 1.0, f);
      vec3 wcol = mix(mix(uHor, uTop, 0.3 + 0.5 * vUv.y) * 0.8, uDeep, 0.42 + 0.3 * deep);
      wcol = mix(wcol, vec3(0.86, 0.93, 0.97), uIce * 0.7);
      wcol += (uHor * 0.7 + 0.12) * rip * 0.75;
      float edge = smoothstep(0.07, 0.0, abs(f - th - 0.025)) * water;
      wcol = mix(wcol, uHor * 1.05 + 0.06, edge * 0.5);
      vec3 col = mix(uMud, wcol, water);
      float a = max(mud * 0.78, water * 0.95);
      gl_FragColor = vec4(col, a);
      #include <fog_fragment>
    }`
});
const pudMesh = (() => {
  const L = [];
  PUDDLES.forEach((p, i) => {
    const g = new T.PlaneGeometry(p.r * 3.0, p.r * 2.2, 4, 3); g.rotateX(-Math.PI / 2); g.rotateY(p.a); g.translate(p.x, 0.045 + i * 0.0004, p.z);
    const n = g.attributes.position.count, pd = new Float32Array(n * 3); for (let v = 0; v < n; v++) pd.set([p.cell % 4, Math.floor(p.cell / 4), hash(i, 9.1) * 10], v * 3);
    g.setAttribute('pd', new T.BufferAttribute(pd, 3)); L.push(g.index ? g.toNonIndexed() : g);
  });
  let n = 0; L.forEach((g) => { n += g.attributes.position.count; }); const P = new Float32Array(n * 3), U = new Float32Array(n * 2), D = new Float32Array(n * 3); let o = 0;
  L.forEach((g) => { const c = g.attributes.position.count; P.set(g.attributes.position.array, o * 3); U.set(g.attributes.uv.array, o * 2); D.set(g.attributes.pd.array, o * 3); o += c; });
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(P, 3)); g.setAttribute('uv', new T.BufferAttribute(U, 2)); g.setAttribute('pd', new T.BufferAttribute(D, 3));
  const m = new T.Mesh(g, pudMat); m.renderOrder = 2; m.frustumCulled = false; m.visible = false; sc.add(m); return m;
})();

/* --- wet ground: darker, cooler and glossier while it rains (dirt darkens most, cobbles shine) --- */
const WETU = { value: 0 };
if (typeof ground !== 'undefined' && ground && ground.material && ground.material.onBeforeCompile) {
  const prev = ground.material.onBeforeCompile;
  ground.material.onBeforeCompile = (sh, r) => {
    prev(sh, r); sh.uniforms.uWetG = WETU;
    sh.fragmentShader = sh.fragmentShader.replace('uniform vec3 cobCol;', 'uniform vec3 cobCol; uniform float uWetG;')
      .replace('diffuseColor.rgb *= gcl * gdt * 1.02;', 'diffuseColor.rgb *= gcl * gdt * 1.02;\n  { float wl = dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11)); vec3 wd = mix(diffuseColor.rgb, vec3(wl), 0.18) * mix(vec3(0.66, 0.7, 0.75), vec3(0.56, 0.56, 0.58), gmk.r); diffuseColor.rgb = mix(diffuseColor.rgb, wd, uWetG); }')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n  roughnessFactor = mix(roughnessFactor, 0.48 + 0.2 * (1.0 - gmk.g), uWetG * (0.45 + 0.55 * max(gmk.g, gmk.r * 0.6)));');
  };
  ground.material.needsUpdate = true;
}

/* --- slanted streaks: thin quads (visible on retina screens, unlike 1-px lines) with a fading tail --- */
const SN = 760, sPos = new Float32Array(SN * 12), sHead = new Float32Array(SN * 3).fill(-1);
const streakGeo = (() => { const g = new T.BufferGeometry(), uv = new Float32Array(SN * 8), idx = new Uint16Array(SN * 6);
  for (let k = 0; k < SN; k++) { uv.set([0, 1, 1, 1, 0, 0, 1, 0], k * 8); idx.set([k * 4, k * 4 + 2, k * 4 + 1, k * 4 + 1, k * 4 + 2, k * 4 + 3], k * 6); }
  g.setAttribute('position', new T.BufferAttribute(sPos, 3)); g.setAttribute('uv', new T.BufferAttribute(uv, 2)); g.setIndex(new T.BufferAttribute(idx, 1)); g.setDrawRange(0, 0); return g; })();
const streakTex = gradTex(4, 64, [[0, 255, 255, 255, 0.95], [0.25, 255, 255, 255, 0.6], [1, 255, 255, 255, 0]], true);
const streakMat = new T.MeshBasicMaterial({ map: streakTex, color: '#d3e2ec', transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide });
const streaks = new T.Mesh(streakGeo, streakMat); streaks.frustumCulled = false; streaks.visible = false; sc.add(streaks);

/* --- splash rings (additive, so they read as wet highlights) and the droplets they throw up --- */
const RN = 56, rPos = new Float32Array(RN * 12), rCol = new Float32Array(RN * 12), RINGS = [];
const ringGeo = (() => { const g = new T.BufferGeometry(), uv = new Float32Array(RN * 8), idx = new Uint16Array(RN * 6);
  for (let k = 0; k < RN; k++) { uv.set([0, 0, 1, 0, 0, 1, 1, 1], k * 8); idx.set([k * 4, k * 4 + 2, k * 4 + 1, k * 4 + 1, k * 4 + 2, k * 4 + 3], k * 6); RINGS.push({ t: 1, L: 1, x: 0, z: 0, y: 0, r: 0 }); }
  g.setAttribute('position', new T.BufferAttribute(rPos, 3)); g.setAttribute('color', new T.BufferAttribute(rCol, 3)); g.setAttribute('uv', new T.BufferAttribute(uv, 2)); g.setIndex(new T.BufferAttribute(idx, 1)); return g; })();
const ringTex = gradTex(64, 64, [[0, 255, 255, 255, 0], [0.62, 255, 255, 255, 0], [0.8, 255, 255, 255, 1], [0.9, 255, 255, 255, 0.4], [1, 255, 255, 255, 0]]);
const ringMesh = new T.Mesh(ringGeo, new T.MeshBasicMaterial({ map: ringTex, vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -3 }));
ringMesh.frustumCulled = false; ringMesh.visible = false; ringMesh.renderOrder = 3; sc.add(ringMesh);
let ringI = 0;
function rainRing(x, z, big, y) { const q = RINGS[ringI]; ringI = (ringI + 1) % RN; q.t = 0; q.L = big ? 0.6 : 0.38 + Math.random() * 0.12; q.x = x; q.z = z; q.y = y || 0.06; q.r = (big ? 0.34 : 0.13 + Math.random() * 0.1); }
const DN = 120, dPos = new Float32Array(DN * 3).fill(-99), DROPS = []; for (let i = 0; i < DN; i++) DROPS.push({ vx: 0, vy: 0, vz: 0, t: 0 });
const dropGeo2 = new T.BufferGeometry(); dropGeo2.setAttribute('position', new T.BufferAttribute(dPos, 3));
const dropPts = new T.Points(dropGeo2, new T.PointsMaterial({ color: '#e4eef5', size: 0.055, map: softTex(16, 16), transparent: true, depthWrite: false, opacity: 0.9 }));
dropPts.frustumCulled = false; dropPts.visible = false; sc.add(dropPts);
let dropI = 0;
function rainPop(x, z, n, y, fall) { for (let k = 0; k < n; k++) { const i = dropI; dropI = (dropI + 1) % DN; const d = DROPS[i], a = Math.random() * 6.283, s = 0.5 + Math.random() * 0.6;
  d.vx = Math.cos(a) * s; d.vz = Math.sin(a) * s; d.vy = fall ? 0 : 1.3 + Math.random() * 1.1; d.t = fall ? 9 : 0.5; d.fall = !!fall; dPos[i * 3] = x; dPos[i * 3 + 1] = y || 0.05; dPos[i * 3 + 2] = z; if (fall) { d.vx = d.vz = 0; } } }

/* --- drips off the eaves: roofs (the snow-cap shapes sit exactly on them) and the market awnings --- */
function dripSetup() {
  const E = [], box = new T.Box3(), awn = typeof FL !== 'undefined' && FL && FL.awn ? Object.values(FL.awn) : [];
  sc.updateMatrixWorld(true);
  sc.traverse((o) => { if (!o.isMesh || !(o.material === capMat || awn.indexOf(o.material) >= 0)) return; box.setFromObject(o); if (!isFinite(box.min.x)) return;
    const w = box.max.x - box.min.x, d = box.max.z - box.min.z; if (w > 8 || d > 8 || box.min.y < 0.3) return;
    const n = Math.max(1, Math.round(w / 0.42)); for (let k = 0; k < n; k++) { const x = box.min.x + (k + 0.5) / n * w + (Math.random() - 0.5) * 0.12;
      E.push({ x, y: box.min.y + 0.02, z: box.max.z - 0.03, t: Math.random() * 2 }); if (d > 0.6 && Math.random() < 0.5) E.push({ x, y: box.min.y + 0.02, z: box.min.z + 0.03, t: Math.random() * 2 }); } });
  RS.dripE = E;
}

/* --- Pip's rain gear: a yellow slicker and sou'wester, rebuilt along with the avatar, shown while it rains outside --- */
const RGEAR = { on: false, show: 0, parts: [], hair: [] };
function rainGearBuild() {
  RGEAR.parts = []; RGEAR.hair = []; if (typeof pip2Rain === 'function' && pip2Rain(RGEAR)) { rainGearShow(RGEAR.on); return; }
  const Y = '#f5c22e', YD = '#d99a16', add = (m) => { RGEAR.parts.push(m); m.visible = RGEAR.on; return m; };
  let g = new T.CylinderGeometry(0.214, 0.27, 0.52, 16, 3); g.scale(1, 1, 0.76); add(part(fac(jit(g, 0.004, 61), (cx, cy, cz, i) => shadeY(Y, cy, -0.3, 0.26, i, 0.3)), pb, 0, 0.9, 0));
  g = new T.TorusGeometry(0.155, 0.05, 8, 16); g.rotateX(Math.PI / 2); g.scale(1, 1, 0.82); add(part(fac(g, (cx, cy, cz, i) => tone(YD, i, 0.3)), pb, 0, 1.16, 0));
  g = new T.BoxGeometry(0.035, 0.48, 0.02); add(part(fac(g, YD), pb, 0, 0.9, 0.198, true));
  [1.06, 0.92, 0.78].forEach((y, k) => { g = new T.SphereGeometry(0.02, 6, 4); add(part(fac(g, '#3a2a1e', 62 + k), pb, 0.045, y, 0.205 + (1.06 - y) * 0.04, true)); });
  limbs.filter((l) => l.arm).forEach((l, k) => { g = new T.CylinderGeometry(0.083, 0.078, 0.32, 10); g.translate(0, -0.15, 0); add(part(fac(g, (cx, cy, cz, i) => shadeY(Y, cy, -0.35, 0.05, i, 0.3)), l.g));
    g = new T.CylinderGeometry(0.084, 0.084, 0.045, 10); add(part(fac(g, YD, 64 + k), l.g, 0, -0.31, 0, true)); });
  const hg = pb.userData.head || pb.children.find((c) => c.isGroup && Math.abs(c.position.y - 1.3) < 1e-3);
  if (hg) {
    const mi = hg.children.findIndex((c) => c.material === ink && c.geometry && c.geometry.type === 'TorusGeometry');
    hg.children.forEach((c, i) => { if (mi >= 0 && i > mi && c.position.y > 0.085) RGEAR.hair.push(c); });
    const hat = new T.Group(); hat.position.set(0, 0.13, -0.01); hat.rotation.x = -0.2; hg.add(hat); add(hat);
    g = new T.SphereGeometry(0.305, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(1, 1.12, 1.02); part(fac(g, (cx, cy, cz, i) => shadeY(Y, cy, 0, 0.3, i, 0.35)), hat);
    g = new T.CylinderGeometry(0.33, 0.41, 0.05, 22); g.scale(1, 1, 1.12); g.translate(0, 0.01, -0.06); part(fac(g, (cx, cy, cz, i) => tone(cz < -0.1 ? YD : Y, i, 0.3)), hat);
    g = new T.TorusGeometry(0.312, 0.018, 4, 22); g.rotateX(Math.PI / 2); part(fac(g, YD, 66), hat, 0, 0.03, 0, true);
  }
  rainGearShow(RGEAR.on);
}
function rainGearShow(on) { RGEAR.on = on; RGEAR.parts.forEach((m) => { m.visible = on; }); RGEAR.hair.forEach((m) => { m.visible = !on; }); }
{ const base = buildAvatar; buildAvatar = function () { base.apply(this, arguments); try { rainGearBuild(); } catch (e) { console.warn('rain gear', e); } }; rainGearBuild(); }

/* --- per frame (called from weatherStep) --- */
function rainStep(dt, out) {
  const k = state.wx.k, ice = season === 'winter', rainOn = raining();
  wxBtn.hidden = !devOn;
  /* puddles fill while it rains and dry slowly after; the ground darkens fast and dries over a minute */
  wet = rainOn ? Math.min(1, wet + dt * 0.04 * (k === 'heavy' ? 1.6 : 1)) : Math.max(0, wet - dt / 100);
  RS.gw = rainOn ? Math.min(1, RS.gw + dt * 0.12 * (0.5 + rainAmt)) : Math.max(0, RS.gw - dt / 60);
  WETU.value = ice ? 0 : RS.gw * (out ? 1 : 0);
  pudMesh.visible = wet > 0.02 && out; pudU.uWet.value = wet; pudU.uRain.value = Math.min(1, rainAmt * 1.6); pudU.uIce.value = ice ? 1 : 0;
  if (pudMesh.visible) { pudU.uT.value = reduced ? time * 0.4 : time; pudU.uHor.value.copy(sky.material.uniforms.hor.value); pudU.uTop.value.copy(sky.material.uniforms.top.value); }
  /* splashing through a puddle */
  splashT -= dt;
  if (wet > 0.3 && !ice && splashT <= 0 && !inHouse && !mount && Math.hypot(target.x - pip.position.x, target.z - pip.position.z) > 0.2) {
    const p = PUDDLES.find((q) => Math.hypot(pip.position.x - q.x, pip.position.z - q.z) < q.r * (0.5 + 0.7 * wet));
    if (p) { splashT = 0.35; splash(pip.position.x, 0.08, pip.position.z, 6); rainRing(pip.position.x, pip.position.z, true); Snd.play('swish', { gain: 0.3 }); Snd.play('pop', { gain: 0.25, f: 260 + Math.random() * 80 }); }
  }
  /* streaks: they follow the camera, slant with the wind (always a little), and each landing may leave a ring and a pop */
  const rn = out ? Math.round(SN * Math.min(1, rainAmt) * (reduced ? 0.35 : 1)) : 0; RS.n = rn;
  streaks.visible = rn > 2; streakMat.opacity = 0.26 + rainAmt * 0.26;
  let rings = 0;
  if (streaks.visible) {
    const fall = (11 + 5 * rainAmt) * (reduced ? 0.6 : 1), sx = WIND.x >= 0 ? 1 : -1, vx = WIND.x * WIND.g * 5 + sx * (1.4 + 1.6 * rainAmt), vz = WIND.z * WIND.g * 5, sl = 0.055, cx = camFocus.x, cz = camFocus.z;
    const vl = Math.hypot(vx, fall), px = fall / vl, py = vx / vl, ringP = (reduced ? 0.12 : 0.3) * (0.6 + rainAmt);
    for (let i = 0; i < rn; i++) {
      let x = sHead[i * 3] + vx * dt, y = sHead[i * 3 + 1] - fall * dt, z = sHead[i * 3 + 2] + vz * dt;
      if (y < 0) {
        if (y > -1 && rings < 6 && Math.random() < ringP && Math.abs(x - cx) < 9 && z - cz > -9 && z - cz < 6 && isleD(x, z) < 0.96) { rings++; rainRing(x, z); if (Math.random() < 0.45) rainPop(x, z, 2); }
        y = 6 + Math.random() * 7; x = cx + (Math.random() - 0.5) * 28 - vx * y / fall; z = cz - 15 + Math.random() * 21 - vz * y / fall;
      }
      sHead[i * 3] = x; sHead[i * 3 + 1] = y; sHead[i * 3 + 2] = z;
      const w = 0.011 + (i % 3) * 0.004, L = sl * (0.8 + (i % 5) * 0.12), tx = x - vx * L, ty = y + fall * L, tz = z - vz * L, o = i * 12;
      sPos[o] = x - px * w; sPos[o + 1] = y + py * w; sPos[o + 2] = z; sPos[o + 3] = x + px * w; sPos[o + 4] = y - py * w; sPos[o + 5] = z;
      sPos[o + 6] = tx - px * w; sPos[o + 7] = ty + py * w; sPos[o + 8] = tz; sPos[o + 9] = tx + px * w; sPos[o + 10] = ty - py * w; sPos[o + 11] = tz;
    }
    streakGeo.setDrawRange(0, rn * 6); streakGeo.attributes.position.needsUpdate = true;
  }
  /* drips running off the roofs and awnings: they keep going a little after the rain stops */
  const dripAmt = out && !ice ? Math.max(rainAmt, RS.gw * 0.6) : 0;
  if (dripAmt > 0.05) {
    if (!RS.dripE) dripSetup();
    const cx = camFocus.x, cz = camFocus.z;
    for (let i = 0; i < RS.dripE.length; i++) { const e = RS.dripE[i]; e.t -= dt * dripAmt; if (e.t > 0) continue; e.t = 0.5 + Math.random() * 1.6;
      if (Math.abs(e.x - cx) < 11 && e.z - cz > -10 && e.z - cz < 7) rainPop(e.x, e.z, 1, e.y, true); }
  }
  /* rings and droplets */
  let anyR = false;
  for (let i = 0; i < RN; i++) { const q = RINGS[i], o = i * 12; let s = 0, c = 0;
    if (q.t < q.L) { q.t += dt; const u = Math.min(1, q.t / q.L); s = q.r * (0.25 + 0.75 * Math.sqrt(u)); c = (1 - u) * (1 - u) * 0.55; anyR = true; }
    const y = q.y; rPos.set([q.x - s, y, q.z - s, q.x + s, y, q.z - s, q.x - s, y, q.z + s, q.x + s, y, q.z + s], o);
    const cr = c * 0.8, cg = c * 0.9, cb = c; for (let v = 0; v < 4; v++) { rCol[o + v * 3] = cr; rCol[o + v * 3 + 1] = cg; rCol[o + v * 3 + 2] = cb; } }
  ringMesh.visible = anyR && out; if (anyR) { ringGeo.attributes.position.needsUpdate = true; ringGeo.attributes.color.needsUpdate = true; }
  let anyD = false;
  for (let i = 0; i < DN; i++) { const d = DROPS[i]; if (dPos[i * 3 + 1] < -50) continue; anyD = true;
    d.t -= dt; d.vy -= 9.8 * dt; dPos[i * 3] += d.vx * dt; dPos[i * 3 + 1] += d.vy * dt; dPos[i * 3 + 2] += d.vz * dt;
    if (dPos[i * 3 + 1] < 0.03 || d.t <= 0) { if (d.fall && dPos[i * 3 + 1] < 0.05) { rainRing(dPos[i * 3], dPos[i * 3 + 2], false); RINGS[(ringI + RN - 1) % RN].r *= 0.8; } dPos[i * 3 + 1] = -99; } }
  dropPts.visible = anyD && out; if (anyD) dropGeo2.attributes.position.needsUpdate = true;
  /* the rain gear goes on with the rain (outside) and comes off when it stops or Pip goes in */
  const gear = rainOn && rainAmt > 0.12 && !inHouse && !(typeof ED !== 'undefined' && ED.on) && !dressing && season !== 'winter';
  if (gear !== RGEAR.on) { rainGearShow(gear); if (gear && out && !sleep) { Snd.play('pop', { gain: 0.3, f: 520 }); splash(pip.position.x, 1.2, pip.position.z, 5); } }
}
/* after the lamps are set for the time of day: a dark rainy day lights the street lamps, their pools and the windows */
function rainLate() {
  if (inHouse) return; const k = clamp(rainAmt * 1.5, 0, 1) * (season === 'winter' ? 0 : 1), n = clamp(nightAmt * 2.6, 0, 1); if (k <= n + 0.01) return;
  lampMat.color.copy(lampOff).lerp(lampOn, k); glowMat.opacity = Math.max(glowMat.opacity, 0.62 * k); if (typeof poolMat !== 'undefined') poolMat.opacity = Math.max(poolMat.opacity, 0.42 * k);
  if (typeof LAMP_LIGHTS !== 'undefined') LAMP_LIGHTS.forEach((l) => { l.intensity = Math.max(l.intensity, 1.3 * k); });
}
/* dev mode only: a cloud button under the globe that cycles the weather, so a rainy day can be tested without waiting for one */
const wxBtn = (() => { const b = document.createElement('button'); b.id = 'wxBtn'; b.type = 'button'; b.textContent = '🌧'; b.setAttribute('aria-label', 'Byt väder');
  b.style.cssText = 'position:fixed;left:max(12px,env(safe-area-inset-left,0px));top:calc(50% + 92px);width:48px;height:48px;border-radius:50%;border:3px solid #22303c;background:#fffaf0;font-size:22px;line-height:1;box-shadow:0 4px 0 rgba(34,48,60,.25);z-index:30;padding:0';
  const order = ['clear', 'rain', 'heavy', 'mist', 'windy'];
  b.addEventListener('click', (e) => { e.stopPropagation(); const i = order.indexOf(state.wx.k), k = order[(i + 1) % order.length]; wxSet(k, k === 'clear' ? 120 : 90); delete state.wx.nx; /* dev testing: jump straight to the new weather instead of a slow fade */ rainAmt = k === 'heavy' ? 1 : k === 'rain' ? 0.55 : 0; mistAmt = k === 'mist' ? 1 : 0; windAmt = WX_WIND[k]; fogAmt = clamp((k === 'mist' ? 0.4 : 0) + rainAmt * 0.85, 0, 1); if (raining()) { wet = Math.max(wet, 0.8); RS.gw = 1; } b.textContent = { clear: '🌧', rain: '⛈', heavy: '🌫', mist: '💨', windy: '☀️' }[k]; });
  ['pointerdown', 'touchstart'].forEach((ev) => b.addEventListener(ev, (e) => e.stopPropagation(), { passive: true }));
  b.hidden = true; document.body.appendChild(b); return b; })();
