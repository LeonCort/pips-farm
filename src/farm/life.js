/* ---------- the hay meadow: tall grass that Pip or the tractor can mow into bales ---------- */
const tufts = [];
{
  const geo = new T.ConeGeometry(0.085, 0.55, 6, 3); geo.translate(0, 0.27, 0);
  for (let x = MEADOW.x0; x <= MEADOW.x1; x += 0.62) for (let z = MEADOW.z0; z <= MEADOW.z1; z += 0.62) {
    const g = new T.Group(), jx = x + (hash(x, z) - 0.5) * 0.3, jz = z + (hash(z, x) - 0.5) * 0.3; g.position.set(jx, 0, jz); sc.add(g);
    for (let k = 0; k < 3; k++) { const m = part(fac(geo.clone(), (cx, cy, cz, i) => tone(k ? '#b9c75a' : '#a5b84e', i + k, 0.5).lerp(_lyLo, 0.35 * (1 - cy / 0.55)).lerp(_lyHi, 0.3 * Math.pow(cy / 0.55, 2))), g, (k - 1) * 0.1, 0, (k % 2) * 0.08 - 0.04, true); m.rotation.z = (k - 1) * 0.25; }
    tufts.push({ g, x: jx, z: jz, h: 1 });
  }
  /* a low fence along the meadow edge */
  for (let x = MEADOW.x0 - 0.5; x <= MEADOW.x1 + 0.5; x += 0.8) { const p = new T.BoxGeometry(0.07, 0.36, 0.07); p.translate(0, 0.18, 0); part(fac(p, PAL.trunk, Math.round(x * 5)), sc, x, 0, MEADOW.z0 - 0.5); }
}
let mown = 0;
const loose = []; /* hay bales lying in the meadow, waiting to be picked up */
function cutTuft(t) {
  t.h = 0.12; t.g.scale.y = t.h; mown++;
  if (mown % 4 === 0) { const m = mk('hay'); m.position.set(t.x, 0, t.z); m.rotation.y = hash(t.x, t.z) * 3; sc.add(m); loose.push(m); earn(1); coinToHud(t.x, 0.5, t.z, 1); Snd.play('pop', { gain: 0.4, f: 420 }, 0, 120); }
}

/* ---------- the tractor ---------- */
let tractor = null;
function addTractor() {
  if (tractor) return; const g = new T.Group(); g.position.set(TRACTOR_HOME[0], 0, TRACTOR_HOME[1]); sc.add(g);
  let geo = new T.BoxGeometry(0.62, 0.42, 1.2, 2, 1, 2); part(fac(jit(geo, 0.015, 1), PAL.accent, 81), g, 0, 0.58, 0.05);
  geo = new T.BoxGeometry(0.5, 0.36, 0.55); part(fac(geo, PAL.accent, 82), g, 0, 0.62, 0.72);
  geo = new T.BoxGeometry(0.4, 0.12, 0.34); part(fac(geo, PAL.ink, 83), g, 0, 0.84, -0.3);
  [-1, 1].forEach((s) => { let w = new T.CylinderGeometry(0.4, 0.4, 0.22, 10); w.rotateZ(Math.PI / 2); part(fac(w, PAL.ink, 84), g, s * 0.42, 0.4, -0.3); w = new T.CylinderGeometry(0.16, 0.16, 0.06, 8); w.rotateZ(Math.PI / 2); part(fac(w, PAL.ochre, 85), g, s * 0.54, 0.4, -0.3);
    w = new T.CylinderGeometry(0.22, 0.22, 0.16, 8); w.rotateZ(Math.PI / 2); part(fac(w, PAL.ink, 86), g, s * 0.36, 0.22, 0.75); });
  geo = new T.CylinderGeometry(0.04, 0.04, 0.5, 6); part(fac(geo, PAL.rock, 87), g, 0.16, 1.0, 0.8);
  /* the mower bar behind */
  geo = new T.BoxGeometry(1.7, 0.06, 0.22); part(fac(geo, PAL.rock, 88), g, 0, 0.12, -0.95);
  for (let k = 0; k < 6; k++) { const b = new T.ConeGeometry(0.06, 0.14, 3); b.rotateX(Math.PI / 2); part(fac(b, PAL.snow, 89), g, -0.7 + k * 0.28, 0.12, -1.1); }
  tractor = { g };
}

/* ---------- actions: one or two big buttons show what Pip can do right here (actIcon is in engine/icons.js) ---------- */
let acts = [];
function nearestAnimal(r) { let best = null, bd = r; animals.concat(babies).forEach((an) => { if (an.ridden) return; const d = Math.hypot(an.g.position.x - pip.position.x, an.g.position.z - pip.position.z); if (d < bd) { bd = d; best = an; } }); return best; }
function findActs() {
  const out = [];
  if (mount) out.push({ icon: actIcon('down'), label: 'Hoppa av', run: dismount });
  else {
    if (tractor && Math.hypot(tractor.g.position.x - pip.position.x, tractor.g.position.z - pip.position.z) < 1.3) out.push({ icon: actIcon('tractor'), label: 'Kör traktorn', run: () => mountTractor() });
    const an = nearestAnimal(1.15);
    if (an && RIDE[an.a] && !an.baby) out.push({ icon: actIcon(an.a), label: 'Rid', ride: true, run: () => ride(an) });
    if (an) out.push({ icon: actIcon('hand'), label: 'Klappa', run: () => pet(an) });
    extraActs(out);
  }
  return out.slice(0, 2);
}
function renderActs() {
  const next = findActs(), key = next.map((a) => a.label).join('|');
  if (key !== acts.map((a) => a.label).join('|')) {
    ['actA', 'actB'].forEach((id, k) => { const b = $(id), a = next[k]; if (!b) return; b.hidden = !a; if (a) { b.querySelector('img').src = a.icon; b.setAttribute('aria-label', a.label); b.classList.toggle('ride', !!a.ride); } });
  }
  acts = next;
}
['actA', 'actB'].forEach((id, k) => { const b = $(id); if (b) b.addEventListener('click', (e) => { e.stopPropagation(); Snd.init(); const a = acts[k]; if (a) { a.run(); acts = []; renderActs(); } }); });
window.addEventListener('keydown', (e) => { const k = e.key.toLowerCase(); if ((k === 'e' || k === ' ') && acts[0]) { e.preventDefault(); acts[0].run(); acts = []; renderActs(); } else if (k === 'q' && acts[1]) { acts[1].run(); acts = []; renderActs(); } });
function pet(an) {
  an.hop = 1; const p = an.g.position; burst(p.x, an.h, p.z, 4); showName(an, 2.2); Snd.play('sparkle', { gain: 0.35 }, 0, 150); Snd.animal(an.a, { gain: 0.8, gap: 700, rate: an.baby ? 1.35 : 0.95 + Math.random() * 0.1 });
  if (time - (an.petT || -99) > 8) { an.petT = time; earn(1); coinToHud(p.x, an.h, p.z, 1); }
}
function ride(an) {
  mount = { kind: 'animal', an, t0: time }; an.ridden = true; an.sp.visible = false; target.copy(an.g.position); pip.position.set(an.g.position.x, 0, an.g.position.z);
  pip.rotation.y = an.g.rotation.y; Snd.play('powerup', { gain: 0.4 }); pet(an);
}
function mountTractor() { mount = { kind: 'tractor' }; pip.position.set(tractor.g.position.x, 0, tractor.g.position.z); pip.rotation.y = tractor.g.rotation.y; target.copy(pip.position); Snd.play('powerup', { gain: 0.4, f: 300 }); }
function dismount() {
  const m = mount; mount = null; pip.position.y = 0;
  if (m.kind === 'animal') {
    const an = m.an, p = penBox(an.a); an.ridden = false; an.sp.visible = !!an.want; an.tx = p.x + (Math.random() - 0.5) * (p.w - 1.2); an.tz = p.z + (Math.random() - 0.5) * (p.d - 1.0);
    const n = Math.min(6, 1 + Math.floor((time - m.t0) / 6)); earn(n); const q = an.g.position; coinToHud(q.x, an.h, q.z, n); burst(q.x, an.h, q.z, 5); an.hop = 1;
    pip.position.x += Math.cos(pip.rotation.y) * 0.7; pip.position.z -= Math.sin(pip.rotation.y) * 0.7;
  } else { pip.position.x += Math.cos(pip.rotation.y) * 0.9; pip.position.z -= Math.sin(pip.rotation.y) * 0.9; }
  target.copy(pip.position); Snd.play('pop', { gain: 0.4, f: 500 });
}
