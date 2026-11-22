/* ---------- graphics: "light" for older or slower tablets, "ultra" for fast ones ----------
   A button in the settings sheet steps light -> full -> ultra. Ultra turns on every light effect and takes the
   draw-distance fog away: the whole island is drawn and weather (rain, snow, autumn, dawn) leaves only a thin haze.
   The curved horizon still fades softly into the sky. Light Light draws fewer pixels (pixel ratio 1),
   drops the sun's shadow pass and the ink outlines, draws less far, paints simpler clouds and leaves out pollen, butterflies, dust and mist.
   On the first run the game watches its own speed for a few seconds and picks light by itself when it struggles;
   after a tap on the button, the player's choice is kept. */
let gfxLv = 1, gfxLow = false, gfxPicked = false; /* gfxLv: 0 light, 1 full, 2 ultra */
const GFX_NAMES = ['low', 'full', 'ultra'], GFX_ULTRA = { detail: 400, fogNear: 150, fogFar: 300, wxFog: 0.28 };
try { const v = localStorage.getItem('pips-gfx'), i = GFX_NAMES.indexOf(v); if (i >= 0) { gfxLv = i; gfxLow = i === 0; gfxPicked = localStorage.getItem('pips-gfx-by') === 'hand'; } } catch (e) {}
const skyFrag = sky.material.fragmentShader;
function gfxApply() {
  const dpr = window.devicePixelRatio || 1;
  renderer.setPixelRatio(Math.min(dpr, gfxLow || fpsCap === 20 ? 1 : 1.5)); resize();
  if (sun.castShadow === gfxLow) { sun.castShadow = !gfxLow; sc.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => { m.needsUpdate = true; }); }); }
  if (typeof setDraw === 'function') setDraw(gfxLow ? 0 : drawLv0);
  if (gfxLv === 2) { CURVE.detail = GFX_ULTRA.detail; CURVE.fogNear = GFX_ULTRA.fogNear; CURVE.fogFar = GFX_ULTRA.fogFar; } /* past the island's edge: nothing is cut off */
  CURVE.wxFog = gfxLv === 2 ? GFX_ULTRA.wxFog : 1; CURVE.ultra = gfxLv === 2;
  if (typeof p2LineMat !== 'undefined') p2LineMat.visible = !gfxLow; /* the ink outlines on Pip, pets, animals and guests: one extra draw each */
  if (typeof FX !== 'undefined') { /* the light effects: high quality off, and the cheap ones the normal look uses are left out too */
    if (gfxLow) { if (!GFX_FX.saved) { GFX_FX.saved = [...FX_LOW]; GFX_FX.hi = FX.hi; } FX.hi = false; FX_LOW.clear(); }
    else if (GFX_FX.saved) { GFX_FX.saved.forEach((k) => FX_LOW.add(k)); FX.hi = GFX_FX.hi; GFX_FX.saved = null; }
    if (gfxLv === 2) { if (GFX_FX.hiU == null) GFX_FX.hiU = FX.hi; FX.hi = true; } /* ultra: every light effect on; back to full gives the player's own choice */
    else if (GFX_FX.hiU != null) { FX.hi = GFX_FX.hiU; GFX_FX.hiU = null; }
    if (typeof FX.sync === 'function') FX.sync(); }
  sky.material.fragmentShader = gfxLow ? skyFrag.replace('i < 5', 'i < 3') : skyFrag; sky.material.needsUpdate = true;
  const b = document.getElementById('gfxBtn'); if (b) { b.dataset.lv = gfxLv; b.setAttribute('aria-label', ['Grafik: lätt', 'Grafik: full', 'Grafik: ultra'][gfxLv]); }
}
const GFX_FX = { saved: null, hi: false, hiU: null };
let drawLv0 = typeof drawLv === 'number' ? drawLv : 2;
function gfxSet(lv, byHand) {
  if (lv === true) lv = 0; else if (lv === false) lv = 1; /* older callers: gfxSet(low) */
  if (lv !== 1 && gfxLv === 1 && typeof drawLv === 'number') drawLv0 = drawLv; /* back to full later: the draw distance the player had */
  gfxLv = lv; gfxLow = lv === 0; if (byHand) gfxPicked = true;
  try { localStorage.setItem('pips-gfx', GFX_NAMES[lv]); localStorage.setItem('pips-gfx-by', gfxPicked ? 'hand' : 'auto'); } catch (e) {}
  gfxApply();
}
/* the button: a plain hill (light), a mountain with a sun (full), or a wide clear view with far peaks and sparkles (ultra) */
{
  const fb = document.getElementById('fpsBtn'), row = fb ? fb.parentNode : document.querySelector('#menu .sheetTop');
  if (row) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'round gfxBtn'; b.id = 'gfxBtn';
    b.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="7" y="9" width="34" height="30" rx="6" fill="#bfe3ef" stroke="#22303c" stroke-width="3"/><path d="M9 36 L19 23 L25 30 L30 25 L39 36 Z" fill="#74a857" stroke="#22303c" stroke-width="2.5" stroke-linejoin="round"/>'
      + '<g class="rich"><circle cx="32" cy="17" r="4.5" fill="#f2c14a" stroke="#22303c" stroke-width="2"/><path d="M14 17 l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5 z" fill="#fffaf0" stroke="#22303c" stroke-width="1.5" stroke-linejoin="round"/></g>'
      + '<g class="lite"><path d="M27 11 q6 4 2 9 q6 -1 6 -7" fill="#74a857" stroke="#22303c" stroke-width="2" stroke-linejoin="round"/></g>'
      + '<g class="ultra"><path d="M9 25 L14 19 L18 23 L23 16 L28 22 L33 18 L39 25" fill="#9cc7dc" stroke="#22303c" stroke-width="2" stroke-linejoin="round"/><path d="M22 6 l1.6 3.2 3.2 1.6 -3.2 1.6 -1.6 3.2 -1.6 -3.2 -3.2 -1.6 3.2 -1.6 z" fill="#ffe27a" stroke="#22303c" stroke-width="1.5" stroke-linejoin="round"/><path d="M41 7 l1 2 2 1 -2 1 -1 2 -1 -2 -2 -1 2 -1 z" fill="#ffe27a" stroke="#22303c" stroke-width="1.2" stroke-linejoin="round"/></g></svg>';
    if (fb && fb.nextSibling) row.insertBefore(b, fb.nextSibling); else row.appendChild(b);
    b.addEventListener('click', (e) => { e.stopPropagation(); gfxSet((gfxLv + 1) % 3, true); Snd.play('pop', { gain: 0.4, f: [420, 760, 980][gfxLv] }); if (gfxLv) Snd.play('sparkle', { gain: 0.3 }, 0.05); if (gfxLv === 2) Snd.play('sparkle', { gain: 0.3, f: 1.3 }, 0.18); });
    const st = document.createElement('style'); st.textContent = '.gfxBtn .lite,.gfxBtn .ultra{display:none}.gfxBtn[data-lv="0"] .lite{display:inline}.gfxBtn[data-lv="0"] .rich{display:none}.gfxBtn[data-lv="0"]{background:#e3ecd9}.gfxBtn[data-lv="2"] .ultra{display:inline}.gfxBtn[data-lv="2"]{background:#fff1c9;box-shadow:0 0 0 3px #f2c14a inset}';
    document.head.appendChild(st);
  }
  if (fb) fb.addEventListener('click', () => gfxApply());
}
/* the first time: watch the speed for a while, and go light when frames come too slowly */
const GW = { t: 0, n: 0, sum: 0, done: gfxPicked || (() => { try { return localStorage.getItem('pips-gfx') != null; } catch (e) { return false; } })() };
function gfxStep(dt) {
  if (!gfxReady) { gfxReady = true; gfxHooks(); gfxApply(); }
  if (gfxLow) { if (typeof pollen !== 'undefined') { pollen.visible = false; BF.forEach((b) => { b.g.visible = false; }); } if (typeof DUST !== 'undefined') DUST.forEach((d) => { d.sp.visible = false; }); MIST.forEach((m) => { m.s.visible = false; }); }
  if (GW.done) return;
  GW.t += dt; if (GW.t < 4 || document.hidden) return; /* let loading settle */
  GW.n++; GW.sum += dt;
  if (GW.t > 12) { GW.done = true; const fps = GW.n / GW.sum; if (fps < fpsCap * 0.75) { gfxSet(true, false); } else { try { localStorage.setItem('pips-gfx', 'full'); localStorage.setItem('pips-gfx-by', 'auto'); } catch (e) {} } }
}
let gfxReady = false;
/* the light effects set the pixel ratio every frame; light mode keeps it at 1 */
if (typeof fxSharp === 'function') { const f0 = fxSharp; fxSharp = function (on) { if (!gfxLow) return f0(on); const pr = Math.min(window.devicePixelRatio || 1, 1); if (Math.abs(renderer.getPixelRatio() - pr) > 0.01) { renderer.setPixelRatio(pr); resize(); } }; }
function gfxHooks() { /* run on the first frame: the light-effects button is made by a later file */
{ const q = document.getElementById('fxQBtn'); if (q) q.addEventListener('click', () => { if (gfxLow && FX.hi) { GFX_FX.hi = true; gfxSet(1, true); } else if (gfxLv === 2 && !FX.hi) { GFX_FX.hiU = false; gfxSet(1, true); } }); }
/* the hills (draw distance) button while in ultra: the player wants a nearer view, so back to full at the level they just picked */
{ const d = document.getElementById('drawBtn'); if (d) d.addEventListener('click', () => { if (gfxLv === 2) { drawLv0 = drawLv; gfxSet(1, true); } }); }
}
{ const s0 = storeStep; storeStep = function (dt) { s0(dt); gfxStep(dt); }; }
if (window.__farmTest) window.FX_HI = () => (typeof FX !== 'undefined' ? FX.hi + ':' + [...FX_LOW].length : '-');
if (window.__farmTest) window.__gfx = () => ({ lv: gfxLv, low: gfxLow, fog: [Math.round(sc.fog.near), Math.round(sc.fog.far)], hi: typeof FX !== 'undefined' && FX.hi, picked: gfxPicked, pr: renderer.getPixelRatio(), shadow: sun.castShadow, draw: drawLv, calls: renderer.info.render.calls, set: (v) => gfxSet(v, true) });
