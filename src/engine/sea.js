/* The sea's look (Leon, 2026-11-27: "too plain; foam, the illusion of movement, and on better graphics even waves").
   The sea is still one sheet, and the shader on it now does four things:
   1. Swell: the sheet rises and falls in the vertex shader (it used to be moved by hand ten times a second). The light
      level keeps the old gentle swell on the old coarse sheet; full and ultra get a finer sheet, a higher swell and a
      short chop on top of it.
   2. Shallows: toward a shore the water turns pale turquoise.
   3. Foam: a white, wobbling line where the water meets the land, and broken lines of foam that roll in toward it.
   4. Ripples: thin bright lines that drift over the open water, in patches.
   2 and 3 need to know how far each point is from a shore: seaShore() paints that into a small texture from isleD (so it
   follows whatever coast the game has), and paints it again when the land changes (seaShoreDirty, the island's squares). */
const SEA = { t: { value: 0 }, amp: { value: 1 }, chop: { value: 0 }, shore: { value: null }, foam: { value: 1 }, N: 384, far: 8, lo: wg, hi: null, low: null, dirty: 1, wait: 0 };
function seaShoreDirty() { try { SEA.dirty = 1; } catch (e) {} } /* may be called while the page is still loading: the first paint comes anyway */
function seaShore() {
  const N = SEA.N, K = 6, /* the island game's coast: isleD is 1 + metres / 6; an oval coast is measured by its slope */ c = SEA.cv || (SEA.cv = document.createElement('canvas')); c.width = c.height = N;
  const x = c.getContext('2d'), im = x.createImageData(N, N), D = im.data;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const wx = ((i + 0.5) / N - 0.5) * 160, wz = ((j + 0.5) / N - 0.5) * 160, d0 = isleD(wx, wz), m = ISL.d ? (d0 - 1.0375) * K : (d0 - 1.0375) / Math.max(0.02, Math.hypot(isleD(wx + 0.5, wz) - d0, isleD(wx, wz + 0.5) - d0) * 2), o = (j * N + i) * 4; /* metres out from the water's edge */
    D[o] = D[o + 1] = D[o + 2] = Math.round(clamp(m / SEA.far, 0, 1) * 255); D[o + 3] = 255; }
  x.putImageData(im, 0, 0);
  if (SEA.shore.value) SEA.shore.value.needsUpdate = true; else { const t = new T.CanvasTexture(c); t.flipY = false; t.minFilter = t.magFilter = T.LinearFilter; t.generateMipmaps = false; SEA.shore.value = t; }
}
if (typeof water !== 'undefined' && water.material && water.material.isMeshStandardMaterial) {
  const prev = water.material.onBeforeCompile;
  water.material.onBeforeCompile = (sh, r) => { if (prev) prev(sh, r);
    sh.uniforms.uSeaT = SEA.t; sh.uniforms.uSeaAmp = SEA.amp; sh.uniforms.uSeaChop = SEA.chop; sh.uniforms.uShore = SEA.shore; sh.uniforms.uSeaFoam = SEA.foam;
    sh.vertexShader = `uniform float uSeaT; uniform float uSeaAmp; uniform float uSeaChop; varying vec2 vSeaW;
      float seaH(vec2 p) { return (sin(p.x * 0.5 + uSeaT * 0.9) + sin(p.y * 0.42 - uSeaT * 0.7)) * 0.06 * uSeaAmp
        + (sin(p.x * 1.25 + p.y * 0.8 + uSeaT * 1.6) * 0.03 + sin(p.y * 1.6 - p.x * 0.55 - uSeaT * 1.3) * 0.024) * uSeaChop; }
      ` + sh.vertexShader.replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
      { vec2 sp = position.xz; objectNormal = normalize(vec3(seaH(sp - vec2(0.3, 0.0)) - seaH(sp + vec2(0.3, 0.0)), 0.6, seaH(sp - vec2(0.0, 0.3)) - seaH(sp + vec2(0.0, 0.3)))); }`)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n\ttransformed.y += seaH(position.xz); vSeaW = position.xz;');
    sh.fragmentShader = `uniform float uSeaT; uniform sampler2D uShore; uniform float uSeaFoam; varying vec2 vSeaW;
      ` + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      { vec2 p = vSeaW; float d = texture2D(uShore, p / 160.0 + 0.5).r * ${SEA.far.toFixed(1)};
        float w1 = sin(p.x * 1.9 + uSeaT * 0.8 + sin(p.y * 1.3 - uSeaT * 0.5)), w2 = sin(p.y * 2.3 - uSeaT * 0.7 + sin(p.x * 1.1 + uSeaT * 0.4) * 1.3);
        /* shallows */
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.50, 0.86, 0.80), smoothstep(3.2, 0.0, d) * 0.38);
        /* ripples: thin bright lines where two slow wave fields cross, in drifting patches */
        float ptc = smoothstep(0.1, 0.9, sin(p.x * 0.21 + uSeaT * 0.11) * sin(p.y * 0.17 - uSeaT * 0.09) * 0.5 + 0.5);
        float q1 = sin(p.x * 1.15 + uSeaT * 0.55 + sin(p.y * 0.8 + uSeaT * 0.3) * 1.5), q2 = sin(p.y * 1.4 - uSeaT * 0.45 + sin(p.x * 0.9 - uSeaT * 0.25) * 1.6);
        float line = smoothstep(0.075, 0.0, abs(q1 * q2 - 0.25)) * ptc * smoothstep(0.6, 2.2, d);
        diffuseColor.rgb += vec3(0.20, 0.26, 0.24) * line * 0.8;
        /* foam: the line at the water's edge, and lines rolling in */
        float wob = w1 * w2 * 0.14, edge = smoothstep(0.4 + wob, 0.2 + wob, d);
        float roll = sin(d * 2.4 + uSeaT * 1.1 + w1 * 0.9), brk = smoothstep(-0.2, 0.5, w2 + sin(p.x * 0.6 + p.y * 0.5) * 0.6);
        float band = smoothstep(0.84, 0.97, roll) * brk * smoothstep(3.0, 1.2, d) * smoothstep(0.35, 0.8, d);
        float foam = clamp(max(edge, band * 0.6), 0.0, 1.0) * uSeaFoam * step(0.001, d + 1.0);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.97, 0.99, 0.96), foam * 0.9); }`); };
  water.material.customProgramCacheKey = () => 'pipsSeaLook2'; water.material.needsUpdate = true;
}
function seaStep(dt) {
  if (!reduced) SEA.t.value += dt;
  if (SEA.dirty) { SEA.wait -= dt; if (SEA.wait <= 0) { SEA.dirty = 0; SEA.wait = 1.2; seaShore(); } } /* at most one repaint in a while: the land rises over a second or two */
  if (SEA.low !== gfxLow || SEA.lv !== gfxLv) { SEA.low = gfxLow; SEA.lv = gfxLv;
    if (!gfxLow && !SEA.hi) { let g = new T.PlaneGeometry(160, 160, 128, 128); g.rotateX(-Math.PI / 2);
      SEA.hi = fac(g, (cx, cy, cz, i) => { const d = ISL.d ? 16 * clamp((ISL.d(cx, cz) - 1) / 1.3, 0, 2) : Math.hypot(cx / 1.6, cz) * 0.8; return tone(d < 16 ? PAL.seaShallow : d < 28 ? PAL.sea : PAL.seaDeep, i, 0.9); }); }
    water.geometry = gfxLow ? SEA.lo : SEA.hi; SEA.amp.value = gfxLow ? 1 : gfxLv === 2 ? 1.7 : 1.4; SEA.chop.value = gfxLow ? 0 : gfxLv === 2 ? 1 : 0.7; }
}
