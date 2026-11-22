/* ---------- graphics: "light" for older or slower tablets ----------
   A button in the settings sheet switches between full and light graphics. Light draws fewer pixels (pixel ratio 1),
   drops the sun's shadow pass and the ink outlines, draws less far, paints simpler clouds and leaves out pollen, butterflies, dust and mist.
   On the first run the game watches its own speed for a few seconds and picks light by itself when it struggles;
   after a tap on the button, the player's choice is kept. */
let gfxLow = false, gfxPicked = false;
try { const v = localStorage.getItem('pips-gfx'); if (v === 'low' || v === 'full') { gfxLow = v === 'low'; gfxPicked = localStorage.getItem('pips-gfx-by') === 'hand'; } } catch (e) {}
const skyFrag = sky.material.fragmentShader;
function gfxApply() {
  const dpr = window.devicePixelRatio || 1;
  renderer.setPixelRatio(Math.min(dpr, gfxLow || fpsCap === 20 ? 1 : 1.5)); resize();
  if (sun.castShadow === gfxLow) { sun.castShadow = !gfxLow; sc.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => { m.needsUpdate = true; }); }); }
  if (typeof setDraw === 'function') setDraw(gfxLow ? 0 : drawLv0);
  if (typeof p2LineMat !== 'undefined') p2LineMat.visible = !gfxLow; /* the ink outlines on Pip, pets, animals and guests: one extra draw each */
  if (typeof FX !== 'undefined') { /* the light effects: high quality off, and the cheap ones the normal look uses are left out too */
    if (gfxLow) { if (!GFX_FX.saved) { GFX_FX.saved = [...FX_LOW]; GFX_FX.hi = FX.hi; } FX.hi = false; FX_LOW.clear(); }
    else if (GFX_FX.saved) { GFX_FX.saved.forEach((k) => FX_LOW.add(k)); FX.hi = GFX_FX.hi; GFX_FX.saved = null; } }
  sky.material.fragmentShader = gfxLow ? skyFrag.replace('i < 5', 'i < 3') : skyFrag; sky.material.needsUpdate = true;
  const b = document.getElementById('gfxBtn'); if (b) { b.dataset.lv = gfxLow ? 0 : 1; b.setAttribute('aria-label', gfxLow ? 'Grafik: lätt' : 'Grafik: full'); }
}
const GFX_FX = { saved: null, hi: false };
let drawLv0 = typeof drawLv === 'number' ? drawLv : 2;
function gfxSet(low, byHand) {
  if (low && !gfxLow && typeof drawLv === 'number') drawLv0 = drawLv; /* back to full later: the draw distance the player had */
  gfxLow = low; if (byHand) gfxPicked = true;
  try { localStorage.setItem('pips-gfx', low ? 'low' : 'full'); localStorage.setItem('pips-gfx-by', gfxPicked ? 'hand' : 'auto'); } catch (e) {}
  gfxApply();
}
/* the button: a mountain with a sun (full) or a plain hill (light) */
{
  const fb = document.getElementById('fpsBtn'), row = fb ? fb.parentNode : document.querySelector('#menu .sheetTop');
  if (row) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'round gfxBtn'; b.id = 'gfxBtn';
    b.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="7" y="9" width="34" height="30" rx="6" fill="#bfe3ef" stroke="#22303c" stroke-width="3"/><path d="M9 36 L19 23 L25 30 L30 25 L39 36 Z" fill="#74a857" stroke="#22303c" stroke-width="2.5" stroke-linejoin="round"/>'
      + '<g class="rich"><circle cx="32" cy="17" r="4.5" fill="#f2c14a" stroke="#22303c" stroke-width="2"/><path d="M14 17 l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5 z" fill="#fffaf0" stroke="#22303c" stroke-width="1.5" stroke-linejoin="round"/></g>'
      + '<g class="lite"><path d="M27 11 q6 4 2 9 q6 -1 6 -7" fill="#74a857" stroke="#22303c" stroke-width="2" stroke-linejoin="round"/></g></svg>';
    if (fb && fb.nextSibling) row.insertBefore(b, fb.nextSibling); else row.appendChild(b);
    b.addEventListener('click', (e) => { e.stopPropagation(); gfxSet(!gfxLow, true); Snd.play('pop', { gain: 0.4, f: gfxLow ? 420 : 760 }); if (!gfxLow) Snd.play('sparkle', { gain: 0.3 }, 0.05); });
    const st = document.createElement('style'); st.textContent = '.gfxBtn .lite{display:none}.gfxBtn[data-lv="0"] .lite{display:inline}.gfxBtn[data-lv="0"] .rich{display:none}.gfxBtn[data-lv="0"]{background:#e3ecd9}';
    document.head.appendChild(st);
  }
  if (fb) fb.addEventListener('click', () => gfxApply());
}
/* the first time: watch the speed for a while, and go light when frames come too slowly */
const GW = { t: 0, n: 0, sum: 0, done: gfxPicked || (() => { try { return localStorage.getItem('pips-gfx') != null; } catch (e) { return false; } })() };
function gfxStep(dt) {
  if (!gfxReady) { gfxReady = true; gfxApply(); }
  if (gfxLow) { if (typeof pollen !== 'undefined') { pollen.visible = false; BF.forEach((b) => { b.g.visible = false; }); } if (typeof DUST !== 'undefined') DUST.forEach((d) => { d.sp.visible = false; }); MIST.forEach((m) => { m.s.visible = false; }); }
  if (GW.done) return;
  GW.t += dt; if (GW.t < 4 || document.hidden) return; /* let loading settle */
  GW.n++; GW.sum += dt;
  if (GW.t > 12) { GW.done = true; const fps = GW.n / GW.sum; if (fps < fpsCap * 0.75) { gfxSet(true, false); } else { try { localStorage.setItem('pips-gfx', 'full'); localStorage.setItem('pips-gfx-by', 'auto'); } catch (e) {} } }
}
let gfxReady = false;
/* the light effects set the pixel ratio every frame; light mode keeps it at 1 */
if (typeof fxSharp === 'function') { const f0 = fxSharp; fxSharp = function (on) { if (!gfxLow) return f0(on); const pr = Math.min(window.devicePixelRatio || 1, 1); if (Math.abs(renderer.getPixelRatio() - pr) > 0.01) { renderer.setPixelRatio(pr); resize(); } }; }
{ const q = document.getElementById('fxQBtn'); if (q) q.addEventListener('click', () => { if (gfxLow && FX.hi) { GFX_FX.hi = true; gfxSet(false, true); } }); }
{ const s0 = storeStep; storeStep = function (dt) { s0(dt); gfxStep(dt); }; }
if (window.__farmTest) window.FX_HI = () => (typeof FX !== 'undefined' ? FX.hi + ':' + [...FX_LOW].length : '-');
if (window.__farmTest) window.__gfx = () => ({ low: gfxLow, picked: gfxPicked, pr: renderer.getPixelRatio(), shadow: sun.castShadow, draw: drawLv, calls: renderer.info.render.calls, set: (v) => gfxSet(v, true) });
