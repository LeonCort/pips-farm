/* ---------- the bed in the upgrade house: sleep through the night ---------- */
const BED = { x: HO.x - 3.4, z: HO.z - 6.25 };
/* a big round bed mat in front of the bed: night-blue with a bed and moon, a gold rim that pulses at bedtime,
   and a gold arc that fills round the edge while Pip stands on it */
const bedRing = (() => {
  const x = HO.x - 1.7, z = HO.z - 5.7, R = 0.75;
  const c = document.createElement('canvas'); c.width = c.height = 256; const q = c.getContext('2d');
  q.fillStyle = '#2b3560'; q.beginPath(); q.arc(128, 128, 124, 0, 7); q.fill();
  q.fillStyle = '#f4ecc8'; [[48, 70], [208, 86], [70, 196], [196, 186], [128, 34]].forEach(([a, b]) => { q.beginPath(); q.arc(a, b, 4.5, 0, 7); q.fill(); });
  drawIcon(q, 'bed', 128, 136, 2.0);
  const pad = new T.Mesh(new T.CircleGeometry(R, 48), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true }));
  pad.rotation.x = -Math.PI / 2; pad.position.set(x, 0.08, z); sc.add(pad);
  const r = new T.Mesh(new T.RingGeometry(R, R + 0.12, 48), new T.MeshBasicMaterial({ color: PAL.paper, transparent: true, opacity: 0.95 }));
  r.rotation.x = -Math.PI / 2; r.position.set(x, 0.085, z); sc.add(r);
  const glow = new T.Mesh(new T.RingGeometry(R + 0.12, R + 0.34, 48), new T.MeshBasicMaterial({ color: '#f4d76a', transparent: true, opacity: 0.6, depthWrite: false }));
  glow.rotation.x = -Math.PI / 2; glow.position.set(x, 0.075, z); sc.add(glow);
  const fg = new T.RingGeometry(R - 0.02, R + 0.14, 48, 1, Math.PI / 2, -Math.PI * 2);
  const f = new T.Mesh(fg, new T.MeshBasicMaterial({ color: '#f4b23a', side: T.DoubleSide })); f.rotation.x = -Math.PI / 2; f.position.set(x, 0.09, z); sc.add(f);
  fg.setDrawRange(0, 0);
  return { r, f, x, z, w: 0, pad, glow, fg };
})();
{
  const g = new T.Group(); g.position.set(BED.x, 0, BED.z); sc.add(g);
  let geo = new T.BoxGeometry(1.7, 0.3, 0.95); part(fac(geo, PAL.trunk, 180), g, 0, 0.15, 0);
  geo = new T.BoxGeometry(1.6, 0.14, 0.88); part(fac(geo, PAL.paper, 181), g, 0, 0.36, 0);
  geo = new T.BoxGeometry(1.05, 0.08, 0.9); part(fac(jit(geo, 0.01, 4), '#7b9fd6', 182), g, 0.25, 0.46, 0);
  geo = new T.BoxGeometry(0.38, 0.12, 0.6); part(fac(jit(geo, 0.015, 5), PAL.snow, 183), g, -0.55, 0.49, 0);
  geo = new T.BoxGeometry(0.1, 0.75, 1.0); part(fac(geo, PAL.trunk, 184), g, -0.85, 0.37, 0);
  /* a little moon picture over the bed */
  const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d'); x.fillStyle = '#2b3560'; x.strokeStyle = PAL.ink; x.lineWidth = 5; x.beginPath(); x.arc(48, 48, 42, 0, 7); x.fill(); x.stroke(); x.fillStyle = '#f4ecc8'; x.beginPath(); x.arc(56, 42, 22, 0, 7); x.fill(); x.fillStyle = '#2b3560'; x.beginPath(); x.arc(66, 34, 18, 0, 7); x.fill();
  const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false })); sp.renderOrder = 4; sp.scale.set(0.7, 0.7, 1); sp.position.set(BED.x, 1.35, BED.z - 0.2); sc.add(sp); bedRing.sign = sp;
}
let sleep = null;
const sleepy = () => { const f = dayFrac(); return f > 0.55 || f < 0.03; };
function bedStep(dt) {
  const ok = sleepy(); bedRing.sign.visible = true; bedRing.sign.material.opacity = ok ? 1 : 0.45;
  bedRing.pad.material.opacity = ok ? 1 : 0.5; bedRing.r.material.opacity = ok ? 0.95 : 0.4;
  bedRing.glow.visible = ok; if (ok) { const p = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(time * 3.2); bedRing.glow.material.opacity = 0.3 + 0.45 * p; bedRing.glow.scale.setScalar(1 + 0.05 * p); }
  if (!sleep) {
    const can = ok && inHouse && !dressing && doorT <= 0 && stillOn(bedRing, dt, 0.8);
    bedRing.w = can ? Math.min(1, bedRing.w + dt / 0.6) : Math.max(0, bedRing.w - dt * 3); bedRing.fg.setDrawRange(0, 6 * Math.round(48 * bedRing.w));
    if (bedRing.w >= 1) { bedRing.w = 0; const day = Math.floor(state.clock / DAY) + (dayFrac() > 0.5 ? 1 : 0); sleep = { t: 0, from: state.clock, to: day * DAY + DAY * 0.04 }; Snd.play('pop', { gain: 0.35, f: 380 }); }
    return;
  }
  /* lie down, let the night run by fast, then hop up in the morning */
  sleep.t += dt; const q = Math.min(1, sleep.t / 3.2), e = q * q * (3 - 2 * q);
  state.clock = sleep.from + (sleep.to - sleep.from) * e - dt; /* skyStep adds dt back */
  pip.position.set(BED.x + 0.8, BED.y || 0.46, BED.z); pip.rotation.y = Math.PI / 2; /* feet at the foot end, head on the pillow */ pb.rotation.x = -Math.PI / 2 * Math.min(1, sleep.t * 3); target.copy(pip.position);
  if (!sleep.z) { sleep.z = new T.Sprite(new T.SpriteMaterial({ map: zTex, transparent: true, depthTest: false })); sleep.z.renderOrder = 6; sleep.z.scale.set(0.7, 0.46, 1); sc.add(sleep.z); }
  sleep.z.position.set(BED.x + 0.2, 1.3 + Math.sin(sleep.t * 2) * 0.1, BED.z); sleep.z.visible = q < 0.95;
  if (q >= 1 && sleep.t > 3.6) {
    sc.remove(sleep.z); pb.rotation.x = 0; pip.position.set(BED.x, 0, BED.z + 1.05); pip.rotation.y = 0; target.copy(pip.position); lastP.copy(pip.position); sleep = null;
    Snd.play('success', { gain: 0.5, f: 'C6' }); Snd.play('sparkle', { gain: 0.4 }, 0.1);
    const el = $('toast'); if (el) { el.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true">' + SUN_SVG + '</svg><b>God morgon!</b>'; el.hidden = false; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); clearTimeout(seasonToast.t); seasonToast.t = setTimeout(() => { el.hidden = true; }, 3200); }
  }
}
