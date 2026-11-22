/* ---------- curved world ("rolling log" horizon) ----------
   A vertex-only effect: every outdoor vertex is pushed down by its squared distance from Pip, so the island bends away
   like a log rolling under her feet and the sea dips below the sky at the top of the screen. Gameplay never sees it:
   movement, collision, paths and pads all stay on the flat XZ plane. Indoors and in the dressing room the bend is 0.
   How it reaches every material: the built-in three.js shader chunks are patched once here (before anything compiles),
   and Material.onBuild hands every program the same two shared uniforms. So new meshes made later (guests, pops,
   pets) curve automatically, and existing onBeforeCompile hooks (rim light, sway, ground texture) are untouched.
   Hand-written ShaderMaterials go through applyWorldCurve(material). */
const CURVE_DEF = { strength: 0.0135, side: 0, pitch: 37, dist: 12, ahead: 1, shopPitch: 60, shopDist: 14, shopAhead: 0.8, awnFade: 0.55, on: true }; /* Leon's picks, 2026-11-21 */
const CURVE = Object.assign({}, CURVE_DEF, { fogNear: 50, fogFar: 88, detail: 49, wxFog: 1, ultra: false, shopW: 0, u: { origin: { value: new T.Vector3() }, strength: { value: 0 }, side: { value: CURVE_DEF.side }, horD: { value: 1e6 } } });
/* dev mode (settings menu): shows the tuning panel and the fps counter; tweaks are saved on this device only and apply only while dev mode is on */
let devOn = false; try { devOn = localStorage.getItem('pips-dev') === '1'; } catch (e) {}
function curveLoadDev() { Object.assign(CURVE, CURVE_DEF); if (!devOn) return; try { const s = JSON.parse(localStorage.getItem('pips-curve2') || 'null'); if (s) Object.keys(CURVE_DEF).forEach((k) => { if (typeof s[k] === typeof CURVE_DEF[k]) CURVE[k] = s[k]; }); } catch (e) {} }
curveLoadDev();
const CURVE_GLSL = '\nuniform vec3 uCurveOrigin; uniform float uCurveStrength; uniform float uCurveSide;\nfloat worldCurveDrop(vec3 w) { float dz = w.z - uCurveOrigin.z; float dx = w.x - uCurveOrigin.x; return (dz * dz + dx * dx * uCurveSide) * uCurveStrength; }\n/* world up in view space without viewMatrix (three only sets that for some materials): V = MV * inverse(M) */\nvec3 curveUpView() { vec3 a0 = modelMatrix[0].xyz, a1 = modelMatrix[1].xyz, a2 = modelMatrix[2].xyz; vec3 c12 = cross(a1, a2); vec3 x = vec3(c12.y, cross(a2, a0).y, cross(a0, a1).y) / dot(a0, c12); return mat3(modelViewMatrix) * x; }\n';
{
  const SC = T.ShaderChunk, put = (name, from, to) => { if (SC[name].indexOf(from) < 0) { console.warn('curve: chunk changed', name); return; } SC[name] = SC[name].replace(from, to); };
  /* vertex-only chunk that every built-in vertex shader includes (basic, lambert, standard, depth, distance, sprite, points) */
  SC.logdepthbuf_pars_vertex = CURVE_GLSL + SC.logdepthbuf_pars_vertex;
  /* the projected position: model -> world, bend, world -> view */
  put('project_vertex', 'mvPosition = modelViewMatrix * mvPosition;', 'vec3 cwP = ( modelMatrix * mvPosition ).xyz;\nmvPosition = modelViewMatrix * mvPosition;\nif ( uCurveStrength > 0.0 ) mvPosition.xyz -= curveUpView() * worldCurveDrop( cwP );');
  /* the world position used for shadow lookups, so curved receivers read the curved shadow map */
  put('worldpos_vertex', 'worldPosition = modelMatrix * worldPosition;', 'worldPosition = modelMatrix * worldPosition;\n\tworldPosition.y -= worldCurveDrop( worldPosition.xyz );');
  /* sprites (speech bubbles, icons, zz) keep their own vertex shader */
  const SP = 'vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );', SPC = 'vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );\n\tif ( uCurveStrength > 0.0 ) mvPosition.xyz -= curveUpView() * worldCurveDrop( modelMatrix[3].xyz );';
  if (T.ShaderLib.sprite.vertexShader.indexOf(SP) >= 0) T.ShaderLib.sprite.vertexShader = T.ShaderLib.sprite.vertexShader.replace(SP, SPC); else console.warn('curve: sprite shader changed');
  /* horizon haze: whatever sits near the visible (bent) horizon fades into the fog colour, so the sea edge never
     cuts hard against the sky even when the fog itself starts far away */
  if (SC.fog_pars_fragment.indexOf('uniform float fogNear;') >= 0) {
    SC.fog_pars_fragment = SC.fog_pars_fragment.replace('uniform float fogNear;', 'uniform float fogNear; uniform float uHorD;');
    SC.fog_fragment = SC.fog_fragment.replace('gl_FragColor.rgb = mix(', 'fogFactor = max( fogFactor, smoothstep( uHorD * 0.66, uHorD * 0.94, fogDepth ) );\n\tgl_FragColor.rgb = mix(');
  } else console.warn('curve: fog chunk changed');
  /* every program gets the same uniform objects, so one write per frame moves them all */
  T.Material.prototype.onBuild = function (p) { p.uniforms.uCurveOrigin = CURVE.u.origin; p.uniforms.uCurveStrength = CURVE.u.strength; p.uniforms.uCurveSide = CURVE.u.side; p.uniforms.uHorD = CURVE.u.horD; };
  /* frustum culling uses the flat positions; test the bent ones so far trees do not pop at the horizon */
  const fSphere = T.Frustum.prototype.intersectsSphere, cs = new T.Sphere();
  T.Frustum.prototype.intersectsSphere = function (s) {
    if (!CURVE.u.strength.value) return fSphere.call(this, s);
    /* past the fog end everything is fog-coloured anyway: skip it (the sky dome contains the camera, so it stays) */
    const cd = s.center.distanceTo(cam.position) - s.radius; if (cd > CURVE.fogFar || cd > CURVE.detail + s.radius * 8) return false; /* small things fade out sooner */
    const o = CURVE.u.origin.value, dx = s.center.x - o.x, dz = s.center.z - o.z, d = Math.sqrt(dz * dz + dx * dx * CURVE.u.side.value), near = Math.max(0, d - s.radius);
    cs.center.copy(s.center); cs.center.y -= near * near * CURVE.u.strength.value; cs.radius = s.radius; return fSphere.call(this, cs);
  };
}
/* for hand-written ShaderMaterials: declare the uniforms and bend the usual `projectionMatrix * modelViewMatrix * vec4(position, 1.0)` */
function applyWorldCurve(material) {
  if (!material.isShaderMaterial || material.__curved) return material; /* built-in materials are already curved by the chunk patch */
  const vs = material.vertexShader, re = /projectionMatrix\s*\*\s*modelViewMatrix\s*\*\s*vec4\(\s*position\s*,\s*1\.0\s*\)/;
  if (!re.test(vs)) { console.warn('curve: shader not recognised'); return material; }
  material.vertexShader = CURVE_GLSL + vs.replace(re, 'projectionMatrix * viewMatrix * (modelMatrix * vec4(position, 1.0) - vec4(0.0, worldCurveDrop((modelMatrix * vec4(position, 1.0)).xyz), 0.0, 0.0))');
  material.__curved = true; material.needsUpdate = true; return material;
}
/* the same drop on the CPU, for anything placed or projected by hand (fly-up coins, lamp lights) */
