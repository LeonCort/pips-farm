
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
  const cc = typeof camCut === 'function' && camCut(), co = cc || pip.position; CURVE.u.origin.value.set(co.x, 0, co.z); /* the world bends round what the camera shows */
  if (inHouse || window.__camTop) return;
  /* at the counter and the stalls the guests stand behind the awning: ease up to a higher view there so they and their orders show */
  let wNear = 0; if (typeof SHOP !== 'undefined') { const pp = pip.position, at = (x, z) => { const d = Math.hypot(pp.x - x, pp.z - z); wNear = Math.max(wNear, clamp((4.2 - d) / 1.6, 0, 1)); };
    at(SHOP.x, SHOP.z); STALL_T.forEach((t) => { if (stalls[t]) at(STL[t].x, STL[t].z); }); }
  CURVE.shopW += (wNear - CURVE.shopW) * Math.min(1, (dt0 || 0.033) * 3);
  const sw = CURVE.shopW * CURVE.shopW * (3 - 2 * CURVE.shopW);
  /* the striped awnings turn see-through while Pip serves, so the guests behind them show */
  if (typeof FL !== 'undefined' && FL && FL.awn) for (const k in FL.awn) { const m = FL.awn[k]; if (!m.__fade) { m.__fade = true; m.transparent = true; m.alphaTest = 0.15; m.needsUpdate = true; } m.opacity = 1 - CURVE.awnFade * sw; m.depthWrite = m.opacity > 0.98; }
  const D = (CURVE.dist + (CURVE.shopDist - CURVE.dist) * sw) * aspectK * (cc && cc.zoom || 1), p = (CURVE.pitch + (CURVE.shopPitch - CURVE.pitch) * sw) * Math.PI / 180, tx = camFocus.x, ty = 0.4, tz = camFocus.z - (CURVE.ahead + (CURVE.shopAhead - CURVE.ahead) * sw);
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
/* the camera switch in the settings menu: the game's own view, or the second view (CURVE_ALT) */
function setCam(m) { camMode = m ? 1 : 0; try { localStorage.setItem('pips-cam', String(camMode)); } catch (e) {} curveLoadDev();
  const b = document.getElementById('camBtn'); if (b) { b.dataset.m = camMode; b.setAttribute('aria-pressed', String(!!camMode)); } }
{ const b = document.getElementById('camBtn'); if (b) { b.dataset.m = camMode; b.setAttribute('aria-pressed', String(!!camMode)); b.addEventListener('click', () => { setCam(!camMode); Snd.play('pop', { gain: 0.4, f: camMode ? 760 : 520 }); }); }
  const st = document.createElement('style'); st.textContent = '.camBtn{position:relative}.camBtn b{position:absolute;left:0;right:0;bottom:3px;font:800 13px/1 system-ui,sans-serif;color:var(--ink);text-align:center}.camBtn[data-m="0"] b::before{content:"1"}.camBtn[data-m="1"] b::before{content:"2"}'; document.head.appendChild(st); }
/* the dev switch in the settings menu */
function setDev(on) { devOn = on; try { localStorage.setItem('pips-dev', on ? '1' : '0'); } catch (e) {} curveLoadDev();
  const b = document.getElementById('devBtn'); if (b) { b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }
  document.getElementById('curveBtn').hidden = !on; if (!on) document.getElementById('curvePan').hidden = true; fpsEl.hidden = !(fpsShow && on); }
setDev(devOn);
{ const b = document.getElementById('devBtn'); if (b) b.addEventListener('click', () => { setDev(!devOn); Snd.play('pop', { gain: 0.4, f: devOn ? 900 : 500 }); });
  const st = document.createElement('style'); st.textContent = '.devBtn{opacity:.55}.devBtn.on{opacity:1;background:#e9f5df}'; document.head.appendChild(st); }

