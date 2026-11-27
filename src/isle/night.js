/* ---------- dark nights and the lantern (Leon's list, 2026-11-25: "nights darker with short view, lights and the lamp help") ----------
   At night the island goes dark blue and Pip only sees a small circle around himself. Everything that glows cuts its own
   circle out of the dark: the campfire, the street lanterns, the forge and the oven, the village lanterns, the lighthouse,
   the star tower and the lava. So a grown camp is bright at night, and the far islands are not. Nothing fails in the dark:
   Pip can still walk and work, it is only harder to see. The torch widens Pip's circle a little; the lantern (gear bench,
   made with ember from the volcano island) widens it a lot. The first dark night shows the lantern in a bubble over Pip.
   The dark is one small canvas over the picture (a quarter of the screen's size), painted each frame while it is night. */
const NT = { cv: null, x: null, a: 0, lamps: [], seen: {}, v: new T.Vector3(), was: false };
const NIGHT_R = () => (gearHas('lantern') ? 8.5 : gearHas('torch') ? 4.2 : 2.6);
function nightLamp(x, z, r) { const k = Math.round(x * 10) + ',' + Math.round(z * 10); if (NT.seen[k]) return; NT.seen[k] = 1; NT.lamps.push([x, 1.2, z, r]); }
function nightLights() {
  const p = pip.position, L = [[p.x, 0.8, p.z, NIGHT_R() * (reduced ? 1 : 1 + Math.sin(time * 3.1) * 0.015)], [FIRE.x, 0.4, FIRE.z, 5.6 * (reduced ? 1 : 1 + Math.sin(time * 7) * 0.03 + Math.sin(time * 17) * 0.015)]];
  NT.lamps.forEach((q) => L.push(q));
  if (forgeUp() && HAS.h1) L.push([FORGE.x, 0.8, FORGE.z, 3.4]); if (ovenUp() && HAS.h2) L.push([OVEN.x, 0.8, OVEN.z, 3.4]);
  const M = mons(); if (M.lighthouse) L.push([LOOP_SITES.lighthouse.x, 1.5, LOOP_SITES.lighthouse.z, 10]); if (M.tower) L.push([LOOP_SITES.tower.x, 1.5, LOOP_SITES.tower.z, 7.5]);
  if (M.windmill) L.push([LOOP_SITES.windmill.x, 1.2, LOOP_SITES.windmill.z, 4]); if (M.harbor) L.push([LOOP_SITES.harbor.x, 1.2, LOOP_SITES.harbor.z, 4.5]);
  Object.keys(HAM.v).forEach((id) => { const c = HAMLET_AT[id].crate; L.push([c[0], 0.8, c[1], 4.2]); });
  if (HAS.e0) EMBER.lava.forEach((line) => line.forEach((q) => L.push([q[0], 0.2, q[1], 3.6])));
  return L;
}
function nightStep(dt) {
  const want = inCave || SHOW ? 0 : Math.max(0, Math.min(1, ((typeof nightAmt === 'number' ? nightAmt : isNight ? 1 : 0) - 0.25) / 0.6));
  NT.a += (want - NT.a) * Math.min(1, dt * 1.5);
  if (isNight !== NT.was) { NT.was = isNight; if (isNight && !inCave && !gearHas('lantern') && !enSleep) gearHint('lantern'); } /* nightfall: this is what would help */
  if (NT.a < 0.02) { if (NT.cv && NT.cv.style.display !== 'none') NT.cv.style.display = 'none'; return; }
  if (!NT.cv) { const c = document.createElement('canvas'); c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2'; c.setAttribute('aria-hidden', 'true'); document.body.appendChild(c); NT.cv = c; NT.x = c.getContext('2d'); }
  const c = NT.cv, x = NT.x, W = Math.max(64, Math.round(innerWidth / 4)), H = Math.max(64, Math.round(innerHeight / 4)); if (c.width !== W || c.height !== H) { c.width = W; c.height = H; } c.style.display = '';
  x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, W, H); x.fillStyle = 'rgba(9,13,38,' + (0.74 * NT.a).toFixed(3) + ')'; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'destination-out'; const tf = Math.tan(cam.fov * Math.PI / 360), v = NT.v;
  nightLights().forEach((q) => { v.set(q[0], q[1], q[2]); const d = cam.position.distanceTo(v); v.project(cam); if (v.z > 1 || Math.abs(v.x) > 1.6 || Math.abs(v.y) > 1.6) return;
    const R = q[3] / (d * tf) * (H / 2), sx = (v.x * 0.5 + 0.5) * W, sy = (-v.y * 0.5 + 0.5) * H;
    x.save(); x.translate(sx, sy); x.scale(1, 0.72); const g = x.createRadialGradient(0, 0, R * 0.3, 0, 0, R); g.addColorStop(0, 'rgba(0,0,0,0.92)'); g.addColorStop(0.6, 'rgba(0,0,0,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, R, 0, 7); x.fill(); x.restore(); });
  x.globalCompositeOperation = 'source-over';
}
