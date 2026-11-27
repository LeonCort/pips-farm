/* ---------- snow drawn by shaders (Leon, 2026-11-25: "snow on the floor instead of grass ... deform when you walk ...
   shaders to affect even the assets we have") ----------
   Three parts, all cheap:
   1. A snow map: one small texture over the whole world that says where snow lies (the winter island). Its soft edges
      are the edge of the snow.
   2. Snow on everything: the standard material's shader is patched once, so every surface that faces up inside the
      snow map turns white (roofs, boughs, rock tops, the ground), with a noisy edge. Nothing is repainted or rebuilt.
   3. Deep snow: one sheet of 16,000 triangles follows Pip and is lifted into a soft blanket with drifts. A second small
      texture remembers where Pip, the dog and the friends have walked; the sheet sinks there, so they plough trails.
      The trails slowly fill in again. Tall grass does not grow where the snow lies. */
const SNX = { W: 256, TW: 256, TS: 32, box: new T.Vector4(0, 0, 1, 1), map: null, tex: null, trail: null, ttex: null, dirty: false, live: false, lx: null, lz: null, fillT: 0, mapT: 0, key: '', mesh: null, H: 0.2,
  u: { uSnow: { value: 0 }, uSnowMap: { value: null }, uSnowBox: { value: null } }, u0: { uSnow: { value: 0 }, uSnowMap: { value: null }, uSnowBox: { value: null } } };
ISLAND.snowFx = true; ISLAND.paintSeason = (s) => (s === 'winter' ? 'summer' : s); /* the world is not repainted white any more: the shader does the snow */
{
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; AREAS.forEach((A) => { x0 = Math.min(x0, A.cx - 7); x1 = Math.max(x1, A.cx + 7); z0 = Math.min(z0, A.cz - 7); z1 = Math.max(z1, A.cz + 7); });
  SNX.box.set(x0, z0, x1 - x0, z1 - z0);
  SNX.map = new Uint8Array(SNX.W * SNX.W * 4); SNX.tex = new T.DataTexture(SNX.map, SNX.W, SNX.W, T.RGBAFormat); SNX.tex.magFilter = SNX.tex.minFilter = T.LinearFilter; SNX.tex.needsUpdate = true;
  SNX.trail = new Uint8Array(SNX.TW * SNX.TW); SNX.ttex = new T.DataTexture(SNX.trail, SNX.TW, SNX.TW, T.LuminanceFormat); SNX.ttex.magFilter = SNX.ttex.minFilter = T.LinearFilter; SNX.ttex.wrapS = SNX.ttex.wrapT = T.RepeatWrapping; SNX.ttex.needsUpdate = true;
  SNX.u.uSnowMap.value = SNX.u0.uSnowMap.value = SNX.tex; SNX.u.uSnowBox.value = SNX.u0.uSnowBox.value = SNX.box;
  /* part 2: every standard material */
  const SC = T.ShaderChunk;
  SC.normalmap_pars_fragment = '#ifdef STANDARD\nuniform float uSnow; uniform sampler2D uSnowMap; uniform vec4 uSnowBox;\nfloat snH(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\nfloat snNz(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(snH(i), snH(i + vec2(1.0, 0.0)), f.x), mix(snH(i + vec2(0.0, 1.0)), snH(i + vec2(1.0, 1.0)), f.x), f.y); }\n#endif\n' + SC.normalmap_pars_fragment;
  SC.normal_fragment_maps += `
#ifdef STANDARD
if (uSnow > 0.003) {
  vec3 snW = cameraPosition + (vec4(-vViewPosition, 0.0) * viewMatrix).xyz;
  float snZ = texture2D(uSnowMap, (snW.xz - uSnowBox.xy) / uSnowBox.zw).r * uSnow;
  if (snZ > 0.003) {
    vec3 snN = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
    float snA = snNz(snW.xz * 0.8), snB = snNz(snW.xz * 4.7 + 7.0);
    float snAmt = smoothstep(0.5, 0.82, snN.y + (snB - 0.5) * 0.3 + (snA - 0.5) * 0.16 + (snZ - 0.8) * 1.2) * smoothstep(0.0, 0.3, snZ);
    vec3 snC = mix(vec3(0.66, 0.75, 0.92), vec3(0.88, 0.91, 0.96), clamp(snA * 0.55 + snN.y * 0.5, 0.0, 1.0));
    snC += step(0.992, snH(floor(snW.xz * 55.0))) * 0.16 * (1.0 - smoothstep(5.0, 13.0, length(vViewPosition)));
    diffuseColor.rgb = mix(diffuseColor.rgb, snC, snAmt);
    roughnessFactor = mix(roughnessFactor, 0.82, snAmt);
  }
}
#endif
`;
  const ob = T.Material.prototype.onBuild; T.Material.prototype.onBuild = function (p, r) { if (ob) ob.call(this, p, r); Object.assign(p.uniforms, this.userData && this.userData.noSnow ? SNX.u0 : SNX.u); };
  /* part 3: the blanket of deep snow that follows Pip */
  const g = new T.PlaneGeometry(30, 30, 90, 90); g.rotateX(-Math.PI / 2);
  const m = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.86, metalness: 0 }); m.userData.noSnow = 1;
  SNX.lu = { uSlMap: SNX.u.uSnowMap, uSlBox: SNX.u.uSnowBox, uSlTrail: { value: SNX.ttex }, uSlC: { value: new T.Vector3() }, uSlH: { value: SNX.H } };
  const HGT = 'float slHt(vec2 p, float t) { return (0.55 + 0.9 * slNz(p * 0.45) + 0.25 * slNz(p * 1.9 + 3.0)) * (1.0 - 0.9 * t); }';
  m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, SNX.lu);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform sampler2D uSlMap, uSlTrail; uniform vec4 uSlBox; uniform vec3 uSlC; uniform float uSlH; varying vec3 vSlW; varying float vSlM;\nfloat slH1(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\nfloat slNz(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(slH1(i), slH1(i + vec2(1.0, 0.0)), f.x), mix(slH1(i + vec2(0.0, 1.0)), slH1(i + vec2(1.0, 1.0)), f.x), f.y); }\n' + HGT)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvec3 slW = (modelMatrix * vec4(transformed, 1.0)).xyz;\nfloat slM = texture2D(uSlMap, (slW.xz - uSlBox.xy) / uSlBox.zw).g * (1.0 - smoothstep(11.5, 14.0, length(slW.xz - uSlC.xz)));\ntransformed.y = uSlH * smoothstep(0.15, 0.7, slM) * slHt(slW.xz, texture2D(uSlTrail, slW.xz / 32.0).r) - 0.03;\nvSlW = slW; vSlM = slM;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uSlTrail; uniform float uSlH; varying vec3 vSlW; varying float vSlM;\n#define slNz snNz\n')
      .replace('void main() {', HGT + '\nvoid main() {')
      .replace('#include <color_fragment>', `#include <color_fragment>
        if (vSlM < 0.12) discard;
        vec2 slP = vSlW.xz; float slE = 0.11;
        float slT = texture2D(uSlTrail, slP / 32.0).r, slTx = texture2D(uSlTrail, (slP + vec2(slE, 0.0)) / 32.0).r, slTz = texture2D(uSlTrail, (slP + vec2(0.0, slE)) / 32.0).r;
        float slH0 = slHt(slP, slT), slHx = slHt(slP + vec2(slE, 0.0), slTx), slHz = slHt(slP + vec2(0.0, slE), slTz);
        vec3 slN = normalize(vec3(-(slHx - slH0) * uSlH / slE * 1.5, 1.0, -(slHz - slH0) * uSlH / slE * 1.5));
        vec3 slC = mix(vec3(0.68, 0.77, 0.93), vec3(0.89, 0.92, 0.965), smoothstep(0.7, 1.5, slH0 + 0.9 * slT));
        slC = mix(slC, vec3(0.66, 0.76, 0.94), slT * 0.7);
        slC += step(0.992, snH(floor(slP * 55.0))) * 0.16 * (1.0 - slT) * (1.0 - smoothstep(5.0, 13.0, length(vViewPosition)));
        diffuseColor.rgb = slC;`)
      .replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\nnormal = normalize((viewMatrix * vec4(slN, 0.0)).xyz);');
  };
  m.customProgramCacheKey = () => 'pipssnow';
  SNX.mesh = new T.Mesh(g, m); SNX.mesh.frustumCulled = false; SNX.mesh.receiveShadow = true; SNX.mesh.visible = false; sc.add(SNX.mesh);
}
/* where the snow lies (red: on everything; green: where the deep blanket may lie, kept off floors and doorsteps) */
function snxMap() {
  const W = SNX.W, d = SNX.map, b = SNX.box, feet = LOOK.all.concat(LOOK.feet).filter((f) => !f[5]);
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) { const x = b.x + (i + 0.5) / W * b.z, z = b.y + (j + 0.5) / W * b.w, A = areaAt(x, z), on = A && HAS[A.id] && A.biome === 'snow' && !A.cave, o = (j * W + i) * 4;
    let deep = on && !mons().tower; /* the star tower's warmth has melted the deep snow (wonders.js) */ if (deep) for (const f of feet) { const u = (x - f[0]) / (f[2] + 0.25), v = (z - f[1]) / (f[3] + 0.25); if (u * u + v * v < 1) { deep = false; break; } }
    d[o] = on ? 255 : 0; d[o + 1] = deep ? 255 : 0; d[o + 2] = 0; d[o + 3] = 255; }
  SNX.tex.needsUpdate = true; if (typeof grMask === 'function' && typeof GR !== 'undefined' && GR.tex) grMask();
}
function snxAt(x, z) { const b = SNX.box, W = SNX.W, i = Math.floor((x - b.x) / b.z * W), j = Math.floor((z - b.y) / b.w * W); return i >= 0 && j >= 0 && i < W && j < W && SNX.map[(j * W + i) * 4] > 127; }
function snxGrass(x, z) { const A = areaAt(x, z); return snxAt(x, z) || (A && (A.biome === 'coral' || A.biome === 'ember')) ? 0 : 1; } /* nor on the coral beach's sand */ /* no tall grass in the snow (engine rays.js asks) */
/* press the snow down at a spot */
function snxStamp(x, z, r, amt) {
  const W = SNX.TW, c = SNX.TS / W, n = Math.ceil(r / c), ix = Math.floor(x / c), iz = Math.floor(z / c), d = SNX.trail;
  for (let dz = -n; dz <= n; dz++) for (let dx = -n; dx <= n; dx++) { const q = 1 - Math.hypot((ix + dx + 0.5) * c - x, (iz + dz + 0.5) * c - z) / r; if (q <= 0) continue;
    const o = (((iz + dz) % W + W) % W) * W + ((ix + dx) % W + W) % W, qq = Math.min(1, q * 1.5), v = Math.round(255 * amt * qq * qq * (3 - 2 * qq)); if (v > d[o]) { d[o] = v; SNX.dirty = SNX.live = true; } }
}
/* Pip, the dog and the friends keep their own colours: they get a copy of the shared material that the snow leaves alone */
const SNX_MAT = MAT.clone(); SNX_MAT.userData = { noSnow: 1 }; SNX_MAT.onBeforeCompile = function (sh, r) { return MAT.onBeforeCompile.call(MAT, sh, r); };
function snxKeep(g) { if (g && !g.userData.snx) { g.userData.snx = 1; g.traverse((o) => { if (o.isMesh && o.material === MAT) o.material = SNX_MAT; else if (o.isMesh && o.material && o.material.isMeshStandardMaterial && !o.material.userData.noSnow) { o.material = o.material.clone(); o.material.userData = Object.assign({}, o.material.userData, { noSnow: 1 }); } }); } }
function snxStep(dt) {
  const pp = pip.position, W = SNX.TW, c = SNX.TS / W, d = SNX.trail;
  SNX.u.uSnow.value = inCave ? 0 : 1;
  SNX.mapT -= dt; if (SNX.mapT <= 0) { SNX.mapT = 1.5; const k = Object.keys(HAS).length + ':' + (LOOK.all.length + LOOK.feet.length) + (mons().tower ? 't' : ''); if (k !== SNX.key) { SNX.key = k; snxMap(); } }
  const near = !inCave && (snxAt(pp.x, pp.z) || snxAt(pp.x + 13, pp.z) || snxAt(pp.x - 13, pp.z) || snxAt(pp.x, pp.z + 13) || snxAt(pp.x, pp.z - 13) || snxAt(pp.x + 9, pp.z + 9) || snxAt(pp.x - 9, pp.z - 9) || snxAt(pp.x + 9, pp.z - 9) || snxAt(pp.x - 9, pp.z + 9));
  SNX.mesh.visible = near; if (!near) return;
  SNX.mesh.position.set(Math.round(pp.x * 3) / 3, 0, Math.round(pp.z * 3) / 3); SNX.lu.uSlC.value.copy(pp);
  /* the trail texture wraps round Pip: wipe the far column or row as it comes round again */
  const cx = Math.floor(pp.x / c), cz = Math.floor(pp.z / c);
  if (SNX.lx == null || Math.abs(cx - SNX.lx) > 64 || Math.abs(cz - SNX.lz) > 64) { d.fill(0); SNX.dirty = true; SNX.live = false; }
  else { for (let k = SNX.lx; k !== cx; k += Math.sign(cx - SNX.lx)) { const col = ((k + W / 2) % W + W) % W; for (let j = 0; j < W; j++) d[j * W + col] = 0; SNX.dirty = true; }
    for (let k = SNX.lz; k !== cz; k += Math.sign(cz - SNX.lz)) { const row = ((k + W / 2) % W + W) % W; d.fill(0, row * W, row * W + W); SNX.dirty = true; } }
  SNX.lx = cx; SNX.lz = cz;
  /* stamp along the whole step since last frame, so a slow frame still leaves an unbroken trail */
  const walk = (g, r, amt) => { snxKeep(g); if (!g || !g.visible || Math.abs(g.position.x - pp.x) > 14 || Math.abs(g.position.z - pp.z) > 14) { if (g) g.userData.snP = null; return; }
    const x = g.position.x, z = g.position.z, l = g.userData.snP, d0 = l ? Math.hypot(x - l[0], z - l[1]) : 0, n = l && d0 < 3 ? Math.max(1, Math.ceil(d0 / 0.1)) : 1;
    if (l && d0 < 0.01) return; for (let k = 1; k <= n; k++) snxStamp(l && n > 1 ? l[0] + (x - l[0]) * k / n : x, l && n > 1 ? l[1] + (z - l[1]) * k / n : z, r, amt); g.userData.snP = [x, z]; };
  if (!enSleep && pp.y < 0.3) walk(pip, 0.44, 1); else snxKeep(pip);
  if (typeof dog !== 'undefined' && dog) walk(dog.g, 0.24, 0.85); if (typeof SM !== 'undefined') walk(SM.g, 0.34, 0.85); if (typeof BK !== 'undefined') walk(BK.g, 0.34, 0.85); if (typeof LP !== 'undefined') Object.values(LP.folk).forEach((P) => walk(P.g, 0.34, 0.85));
  /* fresh snow fills the trails in again */
  SNX.fillT -= dt; if (SNX.fillT <= 0 && SNX.live) { SNX.fillT = 0.5; let any = false; for (let i = 0; i < d.length; i++) if (d[i]) { d[i] = d[i] > 2 ? d[i] - 2 : 0; any = true; } SNX.live = any; SNX.dirty = true; }
  if (SNX.dirty) { SNX.dirty = false; SNX.ttex.needsUpdate = true; }
}
