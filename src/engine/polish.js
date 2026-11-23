/* ---------- polish: tinted soft shadows, rim light, contact shadows and a living fountain ---------- */
/* all cheap on an iPad: no post-processing, two extra draw calls for the contact shadows, the fountain is two small shaders */

/* shadows: where the sun is blocked a little cool blue-green light still gets through, so shade reads tinted instead of grey */
{
  const k = 'lights_fragment_begin', src = T.ShaderChunk[k];
  const a = 'directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;';
  if (src.indexOf(a) >= 0) T.ShaderChunk[k] = src.replace(a, 'directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? mix( vec3( 0.24, 0.33, 0.40 ), vec3( 1.0 ), getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) ) : vec3( 1.0 );');
}

/* rim light: a soft warm edge on round things (foliage, Pip, the animals), like the outline in the hand-drawn UI */
const RIM = { value: new T.Color('#ffe2b0') };
function rimify(sh) {
  sh.uniforms.rimCol = RIM;
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 rimCol;')
    .replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );', 'float rimF = 1.0 - saturate( dot( normal, normalize( vViewPosition ) ) ); float rim3 = rimF * rimF * rimF; outgoingLight += rimCol * ( 0.3 + diffuseColor.rgb ) * rim3 * rimF;\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );');
}
MAT.onBeforeCompile = rimify;
/* wind sway for merged hedges, bushes and flowers: a gentle sine wave in the vertex shader, more the higher a point is */
const SWAY = { t: { value: 0 }, wind: { value: new T.Vector3(1, 0, 0) } };
function swayMat(amp) {
  const m = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 });
  m.onBeforeCompile = (sh) => { rimify(sh); sh.uniforms.swT = SWAY.t; sh.uniforms.swW = SWAY.wind;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float swT; uniform vec3 swW;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nfloat swH = max(position.y - 0.04, 0.0); float swP = position.x * 0.9 + position.z * 0.6;\nfloat swA = (sin(swT * 1.8 + swP) + 0.4 * sin(swT * 3.1 + swP * 1.7)) * (' + amp.toFixed(3) + ' + swW.z * ' + (amp * 2.5).toFixed(3) + ') + swW.z * ' + (amp * 1.5).toFixed(3) + ';\ntransformed.x += swW.x * swA * swH; transformed.z += swW.y * swA * swH;'); };
  m.customProgramCacheKey = () => 'sway' + amp; return m;
}
if (SWAYL.length) { merged(SWAYL, swayMat(0.06)); SWAYL.length = 0; }
flowerMesh.material = swayMat(0.16);
sc.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => { m.needsUpdate = true; }); });

/* the upgrade house entrance: a wooden door, a little shingled awning, pots of flowers, window boxes, corner beams and a hanging sign */
{
  const L = [], P = at(HOUSE.x, HOUSE.z, 0, L), WD = '#9a6542', DK = '#6b4630', FZ = 1.0;
  [-1.18, 1.18].forEach((x) => { P(box(0.12, 1.5, 0.12), DK, 900, x, 0.75, FZ - 0.02); P(box(0.12, 1.5, 0.12), DK, 901, x, 0.75, -FZ + 0.02); });
  P(box(2.5, 0.16, 2.1), '#b8aa98', 902, 0, 0.08, 0); /* a stone plinth */
  P(box(0.78, 1.08, 0.05), DK, 903, 0, 0.54, FZ + 0.02); /* door frame */
  P(box(0.62, 0.96, 0.05), WD, 904, 0, 0.5, FZ + 0.04);
  [-0.16, 0, 0.16].forEach((x, k) => P(box(0.02, 0.9, 0.02), DK, 905 + k, x + 0.08, 0.5, FZ + 0.07));
  P(ico(0.035, 1, 909), '#e8b84a', 909, 0.21, 0.5, FZ + 0.09);
  P(box(0.9, 0.06, 0.34), '#b8aa98', 910, 0, 0.03, FZ + 0.22); /* door step */
  /* awning: two slanted shingle boards on brackets */
  [-1, 1].forEach((s) => { P(box(0.55, 0.05, 0.62), '#c0563a', 911, s * 0.26, 1.33, FZ + 0.27, { rz: -s * 0.42 }); });
  P(box(0.06, 0.06, 0.66), DK, 913, 0, 1.45, FZ + 0.27);
  [-0.42, 0.42].forEach((x) => P(box(0.05, 0.3, 0.05), DK, 914, x, 1.12, FZ + 0.5, { rx: 0.6 }));
  /* window boxes with flowers */
  [-0.8, 0.8].forEach((x, k) => { P(box(0.5, 0.12, 0.16), WD, 916, x, 0.7, FZ + 0.09);
    P(fluff(0.09, 920 + k, 4).scale(2.2, 0.7, 0.8), (cx, cy, cz, i) => leafY('#5d9160', cy, -0.05, 0.08, i), 920 + k, x, 0.8, FZ + 0.09);
    for (let j = 0; j < 4; j++) P(ico(0.04, 0, 925 + j), ['#f6b8c8', '#e9684a', '#fffbf4', '#f2c14a'][(j + k) % 4], 925 + j, x - 0.18 + j * 0.12, 0.86, FZ + 0.1 + (j % 2) * 0.03); });
  /* pots of flowers flanking the door */
  [-0.6, 0.6].forEach((x, k) => { P(new T.CylinderGeometry(0.15, 0.11, 0.26, 10), TERRA, 930 + k, x, 0.13, FZ + 0.34); P(new T.CylinderGeometry(0.165, 0.165, 0.05, 10), '#b9653f', 932, x, 0.25, FZ + 0.34);
    P(fluff(0.17, 934 + k, 5).scale(1, 1.3, 1), (cx, cy, cz, i) => leafY('#5d9160', cy, -0.15, 0.2, i), 934 + k, x, 0.42, FZ + 0.34);
    for (let j = 0; j < 3; j++) P(ico(0.045, 0, 938 + j), j ? '#f6b8c8' : '#f2c14a', 938 + j, x + Math.cos(j * 2.1) * 0.1, 0.6, FZ + 0.34 + Math.sin(j * 2.1) * 0.1); });
  /* a hanging sign on a bracket at the corner */
  P(box(0.05, 0.05, 0.5), DK, 942, 1.2, 1.5, FZ + 0.22);
  [-0.12, 0.12].forEach((z) => P(box(0.012, 0.14, 0.012), '#3a3f48', 943, 1.2, 1.41, FZ + 0.22 + z));
  P(box(0.05, 0.36, 0.42), WD, 944, 1.2, 1.17, FZ + 0.22);
  const m = merged(L);
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  x.fillStyle = '#fff3dc'; x.beginPath(); x.arc(32, 32, 26, 0, 7); x.fill(); x.fillStyle = PAL.accent; x.beginPath(); x.moveTo(32, 48); x.bezierCurveTo(8, 32, 16, 12, 32, 24); x.bezierCurveTo(48, 12, 56, 32, 32, 48); x.fill();
  const sm = new T.MeshStandardMaterial({ map: new T.CanvasTexture(c), transparent: true, roughness: 0.9 });
  [1, -1].forEach((s) => { const q = new T.Mesh(new T.PlaneGeometry(0.3, 0.3), sm); q.rotation.y = s * Math.PI / 2; q.position.set(HOUSE.x + 1.2 + s * 0.027, 1.17, HOUSE.z + FZ + 0.22); sc.add(q); });
}
/* warm point lights in the four lamps round the square; they fade in with the lamps as the sun goes down */
const LAMP_LIGHTS = LAMP_AT.slice(0, 4).map(([x, z]) => { const l = new T.PointLight(0xffc27a, 0, 5, 2); l.position.set(x, 1.6, z); sc.add(l); return l; });

/* contact shadows: a soft dark spot right under each bush, tree, bench, pot, lamp and house, so nothing floats on the grass
   (the spot's material, blobMat, is in dog.js, which the pets share) */
{
  const L = [];
  ATREC.forEach((r) => { if (r.y0 > 0.3 || r.x1 < r.x0) return; const w = r.x1 - r.x0, d = r.z1 - r.z0; if (w > 3.4 || d > 3.4 || r.y1 - r.y0 < 0.12) return;
    const s = Math.min(1, 0.55 + (r.y1 - r.y0) * 0.25); L.push([(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2, Math.max(0.26, w * 0.5 * s + 0.1), Math.max(0.26, d * 0.5 * s + 0.1)]); });
  leafs.forEach((m) => { const g = m.parent; if (!g || g.parent !== sc) return; const s = g.scale.x, r = (m.userData.pine ? 0.55 : 0.62) * s; L.push([g.position.x, g.position.z, r, r]); });
  for (const a in pens) { const h = pens[a].house; if (h) L.push([h.position.x, h.position.z, 0.9, 0.8]); }
  const n = L.length, P = new Float32Array(n * 18), U = new Float32Array(n * 12);
  L.forEach(([x, z, rx, rz], i) => { const y = 0.05, q = [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]];
    q.forEach(([a, b], j) => { P.set([x + a * rx, y, z + b * rz], i * 18 + j * 3); U.set([(a + 1) / 2, (b + 1) / 2], i * 12 + j * 2); }); });
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(P, 3)); geo.setAttribute('uv', new T.BufferAttribute(U, 2)); geo.computeBoundingSphere();
  const m = new T.Mesh(geo, blobMat); m.renderOrder = 1; sc.add(m);
}
/* the same soft spot under Pip and the dog, following them */
const pipBlob = new T.Mesh(blobGeo, blobMat); pipBlob.scale.set(0.55, 1, 0.5); pipBlob.renderOrder = 1; sc.add(pipBlob);
const dogBlob = new T.Mesh(blobGeo, blobMat); dogBlob.scale.set(0.5, 1, 0.75); dogBlob.renderOrder = 1; sc.add(dogBlob);

/* the fountain: rippling water with foam rings round the pillar, and streams falling from the top basin */
const FU = { t: { value: 0 }, light: { value: new T.Color(1, 1, 1) }, ice: { value: 0 } };
const waterVS = CURVE_GLSL + 'varying vec2 vUv; void main(){ vUv = uv; vec4 cw = modelMatrix * vec4(position, 1.0); cw.y -= worldCurveDrop(cw.xyz); gl_Position = projectionMatrix * viewMatrix * cw; }';
function fPoolMat(inner, foamAt) {
  return new T.ShaderMaterial({ uniforms: { t: FU.t, light: FU.light, ice: FU.ice }, vertexShader: waterVS, fragmentShader: `
    varying vec2 vUv; uniform float t; uniform vec3 light; uniform float ice;
    void main(){
      vec2 p = (vUv - 0.5) * 2.0; float r = length(p), a = atan(p.y, p.x);
      vec3 deep = vec3(0.20, 0.58, 0.62), shal = vec3(0.50, 0.82, 0.78);
      vec3 col = mix(deep, shal, smoothstep(1.0, 0.2, r) * 0.5 + 0.25);
      float wob = sin(a * 5.0 + t * 0.7) * 0.35 + sin(a * 3.0 - t * 0.5) * 0.25;
      float rip = sin(r * 17.0 - t * 2.2 + wob * 1.6) * 0.5 + 0.5;
      float glint = sin(p.x * 17.0 + t * 1.1 + sin(p.y * 9.0 + t)) * sin(p.y * 15.0 - t * 0.9);
      col += vec3(0.55, 0.75, 0.72) * smoothstep(0.78, 1.05, rip * 0.8 + glint * 0.3) * 0.3;
      col -= vec3(0.03, 0.04, 0.03) * smoothstep(0.3, 0.0, rip);
      float foam = 0.0;
      for (int k = 0; k < 3; k++) { float ph = fract(t * 0.32 + float(k) / 3.0), rr = ${inner.toFixed(3)} + ph * 0.62;
        foam += smoothstep(0.045, 0.0, abs(r - rr)) * (1.0 - ph) * (0.55 + 0.45 * sin(a * 11.0 + float(k) * 2.1 + t)); }
      foam += smoothstep(0.09, 0.0, r - ${inner.toFixed(3)}) * (0.7 + 0.3 * sin(a * 13.0 - t * 3.0));
      ${foamAt > 0 ? `foam += smoothstep(0.07, 0.0, abs(r - ${foamAt.toFixed(3)})) * (0.55 + 0.45 * sin(a * 23.0 + t * 5.0));` : ''}
      foam += smoothstep(0.9, 1.0, r) * 0.6;
      col = mix(col, vec3(0.97, 1.0, 1.0), clamp(foam, 0.0, 1.0) * 0.85);
      col = mix(col, vec3(0.86, 0.93, 0.96) + vec3(0.05) * rip, ice);
      gl_FragColor = vec4(col * light, 1.0);
    }` });
}
fountain.water.material = fPoolMat(0.24, 0.55);
{ const top = sc.children.find((o) => o.isMesh && o.geometry.type === 'CircleGeometry' && Math.abs(o.position.y - 1.17) < 0.01 && Math.hypot(o.position.x, o.position.z) < 0.01); if (top) top.material = fPoolMat(0.05, 0); }
const streamMat = new T.ShaderMaterial({ uniforms: { t: FU.t, light: FU.light }, transparent: true, depthWrite: false, side: T.DoubleSide, vertexShader: waterVS, fragmentShader: `
  varying vec2 vUv; uniform float t; uniform vec3 light;
  void main(){
    float cols = 14.0, c = floor(vUv.x * cols), h = fract(sin(c * 12.9898) * 43758.5453);
    float s = smoothstep(0.42, 0.08, abs(fract(vUv.x * cols) - 0.5));
    float fall = fract(vUv.y * 2.2 + t * (1.4 + h * 0.6) + h);
    float a = s * (0.55 + 0.45 * smoothstep(0.0, 0.5, fall)) * smoothstep(0.0, 0.12, vUv.y) * (0.6 + 0.4 * h);
    gl_FragColor = vec4(mix(vec3(0.8, 0.95, 0.97), vec3(1.0), fall * 0.6) * light * 1.15, a);
  }` });
const streams = new T.Mesh(new T.CylinderGeometry(0.47, 0.6, 0.8, 28, 1, true), streamMat); streams.position.set(0, 0.75, 0); streams.renderOrder = 2; sc.add(streams);

/* dust puffs: little soft clouds kicked up behind Pip's feet when running on the ground */
const dustMat = new T.SpriteMaterial({ map: blobTex, color: '#d9c09a', transparent: true, depthWrite: false, opacity: 0 });
const DUST = []; for (let i = 0; i < 14; i++) { const sp = new T.Sprite(dustMat.clone()); sp.visible = false; sp.renderOrder = 2; sc.add(sp); DUST.push({ sp, t: 1 }); }
if (window.__farmTest) window.__dust = DUST;
let dustT = 0, dustI = 0; const dustLast = new T.Vector3();
function dustStep(dt) {
  const sp = Math.hypot(pip.position.x - dustLast.x, pip.position.z - dustLast.z) / Math.max(dt, 1e-3), dx = pip.position.x - dustLast.x, dz = pip.position.z - dustLast.z; dustLast.copy(pip.position);
  dustT -= dt;
  if (!inHouse && !trip && !reduced && sp > 2.2 && sp < 30 && pip.position.y < 0.2 && season !== 'winter' && dustT <= 0) { dustT = 0.09; const d = DUST[dustI++ % DUST.length], l = Math.hypot(dx, dz) || 1;
    d.t = 0; d.sp.visible = true; d.x = pip.position.x - dx / l * 0.25 + (Math.random() - 0.5) * 0.15; d.z = pip.position.z - dz / l * 0.25 + (Math.random() - 0.5) * 0.15; d.sp.material.color.set(roadKind(pip.position.x, pip.position.z) ? '#ead6b0' : '#eef0d8'); }
  DUST.forEach((d) => { if (!d.sp.visible) return; d.t += dt / 0.55; if (d.t >= 1) { d.sp.visible = false; return; }
    const q = d.t; d.sp.position.set(d.x, 0.08 + q * 0.22, d.z); d.sp.scale.setScalar(0.16 + q * 0.4); d.sp.material.opacity = 0.75 * (1 - q) * Math.min(1, q * 6) * (1 - 0.6 * nightAmt); });
}
const _fl = new T.Color();
function polishStep(dt) {
  const frozen = season === 'winter';
  if (!reduced) SWAY.t.value += dt; SWAY.wind.value.set(WIND.x, WIND.z, WIND.g); dustStep(dt);
  if (!frozen && !reduced) FU.t.value += dt;
  FU.ice.value += ((frozen ? 1 : 0) - FU.ice.value) * Math.min(1, dt * 2);
  streams.visible = !frozen && !inHouse && !streams.userData.off;
  /* the water and rim follow the light of the day */
  FU.light.value.copy(sun.color).multiplyScalar(sun.intensity * 0.55); if (hemi) { _fl.copy(hemi.color).multiplyScalar(hemi.intensity * 0.55); FU.light.value.add(_fl); }
  RIM.value.copy(sun.color).multiplyScalar(0.3 * sun.intensity * (1 - 0.6 * nightAmt));
  /* outside, the four lights sit in the square's lamps; inside the house they become the desk candles, the stove, the fire and the hall */
  if (inHouse) { LAMP_LIGHTS.forEach((l, i) => { const p = INT.lights[i]; l.position.set(HO.x + p[0], p[1], HO.z + p[2]); l.intensity = 2.2 * (0.9 + 0.1 * Math.sin(time * 9 + i * 2)); l.distance = 5.5; }); sun.intensity *= 0.6; if (hemi) hemi.intensity *= 0.75; }
  else { const k = clamp(nightAmt * 2.6, 0, 1); LAMP_LIGHTS.forEach((l, i) => { l.position.set(LAMP_AT[i][0], 1.6 - curveDrop(LAMP_AT[i][0], LAMP_AT[i][1]), LAMP_AT[i][1]); l.intensity = 2.4 * k; l.distance = 5; }); }
  pipBlob.position.set(pip.position.x, pip.position.y + 0.05, pip.position.z); pipBlob.visible = !inHouse;
  dogBlob.position.set(dog.g.position.x, dog.g.position.y + 0.05, dog.g.position.z); dogBlob.rotation.y = dog.g.rotation.y; dogBlob.visible = dog.g.visible && !inHouse && state.pet !== 'none';
}
