/* ---------- warm-up: hide the slow first draws behind the loading screen ----------
   The first time a material is drawn, the browser builds its shader, and the first time a mesh is drawn its shape is sent
   to the graphics chip. On an iPad that took seconds: after the loading screen, after closing the wardrobe, after
   switching graphics. Now the loading screen stays up until the scenery is merged, then one frame is drawn with every
   hidden thing shown for a moment (interiors, night and weather pieces, everything off screen), so all of that work is
   done while the loading screen still covers the game. Switching graphics by hand shows a short cover and does the same. */
const WARM = { st: 0, t0: performance.now(), frames: 0 };
function warmScene() {
  const vis = [], cull = [], mats = [];
  if (typeof BATCH !== 'undefined') BATCH.pause = true;
  try {
    sc.traverse((o) => {
      if (o.isLight) return; /* lights keep their state: a different light count would build every shader a second time */
      if (!o.visible) { vis.push(o); o.visible = true; }
      if (o.frustumCulled && (o.isMesh || o.isPoints || o.isLine || o.isSprite)) { cull.push(o); o.frustumCulled = false; }
      if (o.material) [].concat(o.material).forEach((m) => { if (m && m.visible === false) { mats.push(m); m.visible = true; } });
    });
    if (typeof ED !== 'undefined' && ED.on) { renderer.setRenderTarget(null); renderer.render(sc, cam); } else fxFrame(1 / 60);
  } catch (e) { if (window.PipsLog) PipsLog.caught(e); }
  vis.forEach((o) => { o.visible = false; }); cull.forEach((o) => { o.frustumCulled = true; }); mats.forEach((m) => { m.visible = false; });
  if (typeof BATCH !== 'undefined') BATCH.pause = false;
}
/* called after every frame instead of telling the loading screen straight away */
function warmStep() {
  if (WARM.st >= 2) return;
  if (!window.PipsBoot) { WARM.st = 2; return; }
  const t = performance.now() - WARM.t0; WARM.frames++;
  if (WARM.st === 0) {
    const edOn = typeof ED !== 'undefined' && ED.on;
    const merged = typeof BATCH === 'undefined' || !BATCH.on || gfxLow || edOn || (BATCH.builds > 0 && BATCH.dirty.size === 0);
    if (WARM.frames >= 3 && (merged || t > 7000)) { const w0 = performance.now(); warmScene(); WARM.ms = Math.round(performance.now() - w0); WARM.st = 1; if (window.PipsLog && PipsLog.add) PipsLog.add('info', 'warm-up ' + WARM.ms + ' ms, ready after ' + (t / 1000).toFixed(1) + ' s'); }
    return;
  }
  WARM.st = 2; PipsBoot.frame(); PipsBoot.done();
}
/* switching graphics by hand: a soft cover first, so the pause looks like loading instead of a frozen game */
{
  const set0 = gfxSet;
  let cover = null;
  gfxSet = function (lv, byHand) {
    if (!byHand || WARM.st < 2) return set0(lv, byHand);
    if (!cover) {
      cover = document.createElement('div'); cover.id = 'warmCover';
      cover.innerHTML = '<span></span><span></span><span></span>';
      const st = document.createElement('style');
      st.textContent = '#warmCover{position:fixed;inset:0;z-index:8000;display:flex;align-items:center;justify-content:center;gap:14px;background:rgba(26,32,69,.45);opacity:0;transition:opacity .18s;pointer-events:none}'
        + '#warmCover.on{opacity:1;pointer-events:auto}#warmCover span{width:18px;height:18px;border-radius:50%;background:#fff6e4;animation:warmB .9s ease-in-out infinite}'
        + '#warmCover span:nth-child(2){animation-delay:.15s}#warmCover span:nth-child(3){animation-delay:.3s}@keyframes warmB{0%,100%{transform:translateY(0);opacity:.6}50%{transform:translateY(-12px);opacity:1}}';
      document.head.appendChild(st); document.body.appendChild(cover);
    }
    cover.classList.add('on');
    /* two frames so the cover is really on screen before the slow part starts */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      try { set0(lv, byHand); warmScene(); } catch (e) { if (window.PipsLog) PipsLog.caught(e); }
      setTimeout(() => { cover.classList.remove('on'); }, 120);
    }));
  };
}
if (window.__farmTest) window.__warm = () => ({ st: WARM.st, ms: WARM.ms, frames: WARM.frames });
