/* ---------- curved world ("rolling log" horizon) ----------
   A vertex-only effect: every outdoor vertex is pushed down by its squared distance from Pip, so the island bends away
   like a log rolling under her feet and the sea dips below the sky at the top of the screen. Gameplay never sees it:
   movement, collision, paths and pads all stay on the flat XZ plane. Indoors and in the dressing room the bend is 0.
   How it reaches every material: the built-in three.js shader chunks are patched once here (before anything compiles),
   and Material.onBuild hands every program the same two shared uniforms. So new meshes made later (guests, pops,
   pets) curve automatically, and existing onBeforeCompile hooks (rim light, sway, ground texture) are untouched.
   Hand-written ShaderMaterials go through applyWorldCurve(material). */
const CURVE_DEF = { strength: 0.0135, side: 0, pitch: 37, dist: 12, ahead: 1, shopPitch: 60, shopDist: 14, shopAhead: 0.8, awnFade: 0.55, on: true }; /* Leon's picks, 2026-11-21 */
const CURVE = Object.assign({}, CURVE_DEF, { fogNear: 50, fogFar: 88, detail: 49, shopW: 0, u: { origin: { value: new T.Vector3() }, strength: { value: 0 }, side: { value: CURVE_DEF.side }, horD: { value: 1e6 } } });
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
function curveDrop(x, z) { const s = CURVE.u.strength.value; if (!s) return 0; const o = CURVE.u.origin.value, dx = x - o.x, dz = z - o.z; return (dz * dz + dx * dx * CURVE.u.side.value) * s; }
/* a tap ray against the bent ground y = -drop(x, z): a quadratic in the ray parameter */
function curveHit(r, out) {
  const s = CURVE.u.strength.value, o = r.origin, d = r.direction;
  if (!s) return r.intersectPlane(groundPlane, out);
  const c0 = CURVE.u.origin.value, k = CURVE.u.side.value, ox = o.x - c0.x, oz = o.z - c0.z;
  const A = s * (k * d.x * d.x + d.z * d.z), B = d.y + 2 * s * (k * ox * d.x + oz * d.z), C = o.y + s * (k * ox * ox + oz * oz);
  let t; if (A < 1e-9) t = -C / B; else { const D = B * B - 4 * A * C; if (D < 0) return null; t = (-B - Math.sqrt(D)) / (2 * A); if (t < 0) t = (-B + Math.sqrt(D)) / (2 * A); }
  if (!(t > 0)) return null; return out.copy(d).multiplyScalar(t).add(o);
}
const curveLive = () => CURVE.on && !inHouse && !(typeof ED !== 'undefined' && ED.on);
/* called once a frame after the stock camera: bend origin, outdoor camera, shadow box nudged forward */
function curveFrame(aspectK, dt0) {
  fpsTick();
  CURVE.u.strength.value = curveLive() ? CURVE.strength : 0; CURVE.u.side.value = CURVE.side;
  CURVE.u.origin.value.set(pip.position.x, 0, pip.position.z);
  if (inHouse || window.__camTop) return;
  /* at the counter and the stalls the guests stand behind the awning: ease up to a higher view there so they and their orders show */
  let wNear = 0; if (typeof SHOP !== 'undefined') { const pp = pip.position, at = (x, z) => { const d = Math.hypot(pp.x - x, pp.z - z); wNear = Math.max(wNear, clamp((4.2 - d) / 1.6, 0, 1)); };
    at(SHOP.x, SHOP.z); STALL_T.forEach((t) => { if (stalls[t]) at(STL[t].x, STL[t].z); }); }
  CURVE.shopW += (wNear - CURVE.shopW) * Math.min(1, (dt0 || 0.033) * 3);
  const sw = CURVE.shopW * CURVE.shopW * (3 - 2 * CURVE.shopW);
  /* the striped awnings turn see-through while Pip serves, so the guests behind them show */
  if (typeof FL !== 'undefined' && FL && FL.awn) for (const k in FL.awn) { const m = FL.awn[k]; if (!m.__fade) { m.__fade = true; m.transparent = true; m.alphaTest = 0.15; m.needsUpdate = true; } m.opacity = 1 - CURVE.awnFade * sw; m.depthWrite = m.opacity > 0.98; }
  const D = (CURVE.dist + (CURVE.shopDist - CURVE.dist) * sw) * aspectK, p = (CURVE.pitch + (CURVE.shopPitch - CURVE.pitch) * sw) * Math.PI / 180, tx = camFocus.x, ty = 0.4, tz = camFocus.z - (CURVE.ahead + (CURVE.shopAhead - CURVE.ahead) * sw);
  cam.position.set(tx, ty + D * Math.sin(p), tz + D * Math.cos(p)); cam.lookAt(tx, ty, tz);
  sun.position.z -= 3; sun.target.position.z -= 3;
}
/* the dev panel: a small globe button on the left (dev mode only); sliders for bend and camera */
function curveSave() { try { const o = {}; Object.keys(CURVE_DEF).forEach((k) => { o[k] = CURVE[k]; }); localStorage.setItem('pips-curve2', JSON.stringify(o)); } catch (e) {} }
{
  const css = document.createElement('style');
  css.textContent = '#curveBtn{position:fixed;left:max(12px,env(safe-area-inset-left,0px));top:50%;width:48px;height:48px;margin-top:-24px;border-radius:50%;border:3px solid #22303c;background:#fffaf0;font-size:24px;line-height:1;box-shadow:0 4px 0 rgba(34,48,60,.25);z-index:30;padding:0}'
    + '#curvePan{position:fixed;left:max(70px,calc(env(safe-area-inset-left,0px) + 70px));top:50%;transform:translateY(-50%);width:min(300px,calc(100vw - 90px));padding:12px 14px;border-radius:18px;border:3px solid #22303c;background:#fbf3e2;font:600 14px Fredoka,system-ui,sans-serif;color:#22303c;z-index:30;box-shadow:0 5px 0 rgba(34,48,60,.25)}'
    + '#curvePan label{display:block;margin:6px 0 2px}#curvePan label b{float:right;font-weight:700}#curvePan input[type=range]{width:100%;accent-color:#c8643a;height:28px}#curvePan .row{display:flex;gap:8px;margin-top:8px;align-items:center}#curvePan .row label{white-space:nowrap}#curvePan button{flex:1;padding:8px;border-radius:12px;border:2px solid #22303c;background:#fffaf0;font:inherit}';
  document.head.appendChild(css);
  const btn = document.createElement('button'); btn.id = 'curveBtn'; btn.hidden = !devOn; btn.type = 'button'; btn.textContent = '\u{1F30D}'; btn.setAttribute('aria-label', 'Curve settings');
  const pan = document.createElement('div'); pan.id = 'curvePan'; pan.hidden = true;
  const S = [['strength', 'Bend (uCurveStrength)', 0, 0.03, 0.0005, 4], ['side', 'Side bend (x factor)', 0, 1, 0.05, 2], ['pitch', 'Camera pitch (deg)', 15, 60, 1, 0], ['dist', 'Camera distance', 8, 26, 0.5, 1], ['ahead', 'Look ahead', -2, 5, 0.1, 1], ['shopPitch', 'Pitch at counter/stalls', 15, 70, 1, 0], ['shopDist', 'Distance at counter/stalls', 8, 26, 0.5, 1], ['shopAhead', 'Look ahead at counter/stalls', -2, 5, 0.1, 1], ['awnFade', 'Awning see-through at stalls', 0, 1, 0.05, 2]];
  pan.innerHTML = S.map(([k, l, a, b, st]) => '<label>' + l + ' <b data-v="' + k + '"></b></label><input type="range" data-k="' + k + '" min="' + a + '" max="' + b + '" step="' + st + '">').join('')
    + '<div class="row"><label style="margin:0;flex:1"><input type="checkbox" data-on> Curve on</label><button type="button" data-reset>Reset</button><button type="button" data-close>Close</button></div>';
  const sync = () => { S.forEach(([k, , , , , dp]) => { pan.querySelector('[data-k="' + k + '"]').value = CURVE[k]; pan.querySelector('[data-v="' + k + '"]').textContent = (+CURVE[k]).toFixed(dp); }); pan.querySelector('[data-on]').checked = CURVE.on; };
  pan.addEventListener('input', (e) => { const k = e.target.dataset.k; if (k) CURVE[k] = +e.target.value; else if (e.target.hasAttribute('data-on')) CURVE.on = e.target.checked; sync(); curveSave(); });
  pan.addEventListener('click', (e) => { if (e.target.hasAttribute('data-reset')) { Object.assign(CURVE, CURVE_DEF); sync(); curveSave(); } if (e.target.hasAttribute('data-close')) pan.hidden = true; });
  btn.addEventListener('click', () => { pan.hidden = !pan.hidden; if (!pan.hidden) sync(); });
  ['pointerdown', 'keydown'].forEach((ev) => pan.addEventListener(ev, (e) => e.stopPropagation()));
  document.body.appendChild(btn); document.body.appendChild(pan);
  window.CURVE = CURVE;
}
if (window.__farmTest) window.__curve = { scr: (x, y, z) => { const v = new T.Vector3(x, y - curveDrop(x, z), z).project(cam), r = canvas.getBoundingClientRect(); return [(v.x + 1) / 2 * r.width + r.left, (1 - v.y) / 2 * r.height + r.top]; }, inside: (to) => goInside(to), hit: (sx, sy) => { const r = canvas.getBoundingClientRect(); ndc.set((sx - r.left) / r.width * 2 - 1, -(sy - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, cam); const h = curveHit(ray.ray, new T.Vector3()); return h && [h.x, h.z]; }, diag: () => { let n = 0, nc = 0, big = 0; sc.traverseVisible((o) => { if (!o.isMesh && !o.isSprite && !o.isPoints) return; n++; if (!o.frustumCulled) nc++; else if (o.geometry && o.geometry.boundingSphere && o.geometry.boundingSphere.radius > 15) big++; }); return { n, nc, big, shadowCast: sun.castShadow }; }, st: () => ({ s: CURVE.u.strength.value, inHouse, ed: typeof ED !== 'undefined' && ED.on }) };
/* graphics setting in the menu: low / medium / far draw distance (fog and the small-prop cut-off move together) */
const DRAW_OPTS = [{ name: 'low', detail: 18, fogNear: 22, fogFar: 48 }, { name: 'medium', detail: 30, fogNear: 34, fogFar: 66 }, { name: 'far', detail: 49, fogNear: 50, fogFar: 88 }];
let drawLv = 2; try { const v = localStorage.getItem('pips-draw'); if (v != null && DRAW_OPTS[+v]) drawLv = +v; } catch (e) {}
function setDraw(i) { drawLv = i; const o = DRAW_OPTS[i]; CURVE.detail = o.detail; CURVE.fogNear = o.fogNear; CURVE.fogFar = o.fogFar;
  const b = document.getElementById('drawBtn'); if (b) { b.querySelector('b').textContent = i + 1; b.dataset.lv = i; b.setAttribute('aria-label', 'Draw distance: ' + o.name); } }
setDraw(drawLv);
{ const b = document.getElementById('drawBtn'); if (b) b.addEventListener('click', () => { setDraw((drawLv + 1) % DRAW_OPTS.length); try { localStorage.setItem('pips-draw', drawLv); } catch (e) {} Snd.play('pop', { gain: 0.4, f: 500 + drawLv * 160 }); }); }
{ const st = document.createElement('style'); st.textContent = '.drawBtn{position:relative}.drawBtn b{position:absolute;left:0;right:0;bottom:3px;font:800 13px/1 system-ui,sans-serif;color:var(--ink);text-align:center}.drawBtn .h2,.drawBtn .h3{transition:opacity .2s}.drawBtn[data-lv="0"] .h2,.drawBtn[data-lv="0"] .h3{opacity:.15}.drawBtn[data-lv="1"] .h3{opacity:.15}'; document.head.appendChild(st); }
/* fps counter: frames actually drawn per second (after the frame cap), plus draw calls and triangles of the last frame */
let fpsShow = true; try { fpsShow = localStorage.getItem('pips-fpsmeter') !== '0'; } catch (e) {}
const fpsEl = document.createElement('div'); fpsEl.id = 'fpsMeter'; fpsEl.setAttribute('aria-hidden', 'true'); fpsEl.hidden = !(fpsShow && devOn); document.body.appendChild(fpsEl);
{ const st = document.createElement('style'); st.textContent = '#fpsMeter{position:fixed;left:50%;transform:translateX(-50%);top:max(14px,env(safe-area-inset-top,0px));padding:4px 8px;border-radius:10px;background:rgba(34,48,60,.78);color:#fffaf0;font:700 12px/1.35 ui-monospace,Menlo,monospace;z-index:30;pointer-events:none;white-space:pre}#fpsMeter.bad{background:rgba(184,64,31,.85)}'; document.head.appendChild(st); }
let fpsN = 0, fpsT0 = performance.now(), fpsMin = 1e9, fpsLast = 0;
function fpsTick() {
  const now = performance.now(); if (fpsLast) fpsMin = Math.min(fpsMin, 1000 / Math.max(1, now - fpsLast)); fpsLast = now; fpsN++;
  if (now - fpsT0 < 500) return; const fps = fpsN * 1000 / (now - fpsT0); fpsN = 0; fpsT0 = now;
  if (fpsShow && devOn) { const ri = renderer.info.render; fpsEl.textContent = Math.round(fps) + ' fps  (low ' + Math.round(fpsMin) + ')  cap ' + fpsCap + '\n' + ri.calls + ' draws  ' + Math.round(ri.triangles / 1000) + 'k tris'; fpsEl.classList.toggle('bad', fps < fpsCap * 0.8); }
  fpsMin = 1e9;
}
{ const row = document.querySelector('#curvePan .row'); if (row) { const l = document.createElement('label'); l.style.cssText = 'margin:0;flex:1'; l.innerHTML = '<input type="checkbox" data-fps> FPS'; row.insertBefore(l, row.children[1]); const c = l.querySelector('input'); c.checked = fpsShow; c.addEventListener('change', () => { fpsShow = c.checked; fpsEl.hidden = !(fpsShow && devOn); try { localStorage.setItem('pips-fpsmeter', fpsShow ? '1' : '0'); } catch (e) {} }); } }
/* the dev switch in the settings menu */
function setDev(on) { devOn = on; try { localStorage.setItem('pips-dev', on ? '1' : '0'); } catch (e) {} curveLoadDev();
  const b = document.getElementById('devBtn'); if (b) { b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }
  document.getElementById('curveBtn').hidden = !on; if (!on) document.getElementById('curvePan').hidden = true; fpsEl.hidden = !(fpsShow && on); }
setDev(devOn);
{ const b = document.getElementById('devBtn'); if (b) b.addEventListener('click', () => { setDev(!devOn); Snd.play('pop', { gain: 0.4, f: devOn ? 900 : 500 }); });
  const st = document.createElement('style'); st.textContent = '.devBtn{opacity:.55}.devBtn.on{opacity:1;background:#e9f5df}'; document.head.appendChild(st); }

