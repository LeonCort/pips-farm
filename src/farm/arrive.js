/* ---------- a new animal arrives: it floats down in a ribboned crate under a bunch of balloons ----------
   Leon (2026-11-22): a new animal should feel as special as a house being built or furniture being delivered, not just
   pop up. The crate sways down beside the pen, lands with a bump and wiggles, the sides fall open, the balloons float
   off, confetti and a little fanfare, and the animal hops out and walks into its pen with hearts. About five seconds,
   no text, and it never stops play: Pip can walk away and the animal still finds its pen. */
const ARR = [];
const ARR_TEST = /arrivetest/.test(location.hash);
const ARR_BAL = ['#e9684a', '#f2c14a', '#5a9fc4', '#74a857', '#f6b8c8', '#7b5ea7'];
const ARR_WOOD = '#cf9f66', ARR_DARK = '#9a6542', ARR_RIB = '#e9684a';
const ARR_UP = new T.Vector3(0, 1, 0);
function arrStick(g, a, b, r, col) { /* a thin rod from a to b (balloon strings) */
  const d = new T.Vector3().subVectors(b, a), L = d.length(), geo = new T.CylinderGeometry(r, r, L, 4); geo.translate(0, L / 2, 0);
  const m = part(fac(geo, col, 1801), g, a.x, a.y, a.z, true); m.quaternion.setFromUnitVectors(ARR_UP, d.normalize()); return m;
}
function arrCrate(s) {
  const g = new T.Group(), W = 1.05 * s, D = 0.95 * s, H = 0.5 * s, sides = [];
  part(fac(box(W + 0.06, 0.08, D + 0.06), ARR_DARK, 1802), g, 0, 0.04, 0);
  /* four slatted sides, each hinged at its foot so it can fall outward */
  [[0, D / 2, W, 0], [0, -D / 2, W, Math.PI], [W / 2, 0, D, Math.PI / 2], [-W / 2, 0, D, -Math.PI / 2]].forEach(([x, z, len, ry], i) => {
    const hinge = new T.Group(); hinge.position.set(x, 0.06, z); hinge.rotation.y = ry; g.add(hinge);
    const p = new T.Group(); hinge.add(p);
    [0.13, 0.36].forEach((y, k) => part(fac(jit(box(len, 0.13 * s, 0.05, 3, 1, 1), 0.01, 7 + i + k), ARR_WOOD, 1803 + i * 3 + k), p, 0, y * s + 0.02, 0));
    [-1, 1].forEach((e) => part(fac(box(0.08 * s, H, 0.07), ARR_DARK, 1820 + i), p, e * (len / 2 - 0.04 * s), H / 2, 0));
    if (i < 2) { /* a red ribbon down the middle of the front and back */
      part(fac(box(0.12 * s, H + 0.02, 0.07), ARR_RIB, 1830 + i), p, 0, H / 2, 0.012);
      if (i === 0) { /* and a bow on the front */
        [-1, 1].forEach((e) => { const b = new T.SphereGeometry(0.11 * s, 8, 6); b.scale(1.25, 0.8, 0.5); const m = part(fac(b, ARR_RIB, 1833), p, e * 0.11 * s, H + 0.04, 0.05); m.rotation.z = e * 0.45; });
        part(fac(new T.SphereGeometry(0.06 * s, 8, 6), '#c9503a', 1834), p, 0, H + 0.04, 0.07);
      }
    }
    sides.push(hinge);
  });
  /* balloons on strings from the four top corners, tied in a knot high above the crate */
  const ties = new T.Group(); g.add(ties);
  const knot = new T.Vector3(0, H + 0.95 * s, 0);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => arrStick(ties, new T.Vector3(x * W / 2, H + 0.06, z * D / 2), knot, 0.008, '#fff6e4'));
  const bal = new T.Group(); bal.position.copy(knot); g.add(bal);
  const n = s > 1.2 ? 6 : 5;
  for (let k = 0; k < n; k++) {
    const a = k / n * 6.283 + 0.4, r = (k % 2 ? 0.3 : 0.22) * (0.8 + s * 0.3), up = 0.75 + (k % 3) * 0.16;
    const at = new T.Vector3(Math.cos(a) * r, up, Math.sin(a) * r), geo = new T.SphereGeometry(0.21 * (0.85 + s * 0.15), 12, 9); geo.scale(1, 1.18, 1);
    const b = part(fac(geo, ARR_BAL[k % ARR_BAL.length], 1840 + k), bal, at.x, at.y, at.z);
    part(fac(new T.ConeGeometry(0.04, 0.06, 5), ARR_BAL[k % ARR_BAL.length], 1850 + k), b, 0, -0.26 * (0.85 + s * 0.15), 0, true).rotation.x = Math.PI;
    arrStick(bal, new T.Vector3(0, 0, 0), at.clone().add(new T.Vector3(0, -0.24, 0)), 0.006, '#fff6e4');
  }
  return { g, sides, ties, bal, H, W, D };
}
/* where the crate lands: beside the buyer's spot, on the side away from the pen, so Pip never hides it */
function arrSpot(an, from) {
  const b = penBox(an.a), sx = from[0] >= b.x ? 1 : -1;
  return [from[0] + sx * 1.6, from[1] - 0.5];
}
function arrive(an, from) {
  if (!an || an.arr) return;
  ARR.filter((o) => o.an.a === an.a).forEach(arrFinish); /* one crate per pen at a time */
  const s = clamp(an.h * 1.15, 0.75, 1.9), c = arrCrate(s), at = arrSpot(an, from || [pip.position.x, pip.position.z]);
  c.g.position.set(at[0], 9, at[1]); c.g.rotation.y = Math.atan2(PEN[an.a].x - at[0], PEN[an.a].z - at[1]); sc.add(c.g);
  const o = { an, c, at, t: 0, st: 'fall', to: [an.tx, an.tz], gone: 0, sway: hash(at[0], at[1]) * 6 };
  an.arr = o; an.want = null; an.sp.visible = false; an.g.position.set(at[0], 9, at[1]); an.g.rotation.y = c.g.rotation.y;
  ARR.push(o); Snd.init(); Snd.play('whoosh', { gain: 0.3 }); Snd.play('sparkle', { gain: 0.3, n: 5 }, 0.3);
}
function arrOpen(o) {
  const an = o.an, [x, z] = o.at; o.st = 'open'; o.t = 0;
  confetti(x, 1.0, z, 60, 5); fanfare(false); burst(x, an.h + 0.3, z, 8);
  Snd.animal(an.a, { gain: 0.7, rate: 1.05 }); an.hop = 1;
}
function arrFinish(o) {
  const an = o.an; if (o.c.g.parent) sc.remove(o.c.g);
  const i = ARR.indexOf(o); if (i >= 0) ARR.splice(i, 1);
  if (an.arr !== o) return; an.arr = null;
  if (o.st !== 'walk' && o.st !== 'done') an.g.position.set(o.to[0], 0, o.to[1]);
  an.g.position.y = 0; an.body.position.y = 0; an.tx = an.g.position.x; an.tz = an.g.position.z; an.cd = 6 + Math.random() * 6;
}
function arrStep(dt) {
  for (let i = ARR.length - 1; i >= 0; i--) {
    const o = ARR[i], an = o.an, c = o.c, g = c.g; o.t += dt;
    if (o.st === 'fall') { /* sway down: fast at first, gently at the end */
      const D = reduced ? 1.0 : 2.1, k = Math.min(1, o.t / D), e = 1 - Math.pow(1 - k, 3);
      g.position.y = 9 * (1 - e); g.rotation.z = reduced ? 0 : Math.sin(o.t * 2.6 + o.sway) * 0.14 * (1 - k); g.rotation.x = reduced ? 0 : Math.cos(o.t * 2.1 + o.sway) * 0.08 * (1 - k);
      g.position.x = o.at[0] + (reduced ? 0 : Math.sin(o.t * 1.7 + o.sway) * 0.5 * (1 - e));
      if (k >= 1) { o.st = 'land'; o.t = 0; g.position.x = o.at[0]; g.rotation.set(0, g.rotation.y, 0); Snd.play('tock', { gain: 0.5, f: 180 }); Snd.play('tock', { gain: 0.3, f: 260 }, 0.12); confetti(o.at[0], 0.15, o.at[1], 14, 1.6); }
    } else if (o.st === 'land') { /* bump and wiggle: someone is in there! */
      const sq = Math.max(0, 1 - o.t * 5); g.scale.set(1 + sq * 0.12, 1 - sq * 0.15, 1 + sq * 0.12);
      g.rotation.z = reduced ? 0 : Math.sin(o.t * 34) * 0.05 * Math.min(1, o.t * 4);
      an.body.position.y = reduced ? 0 : Math.abs(Math.sin(o.t * 9)) * 0.12;
      if (o.t > 0.25 && !o.peep) { o.peep = 1; Snd.animal(an.a, { gain: 0.4, rate: 1.15 }); }
      if (o.t >= 0.85) { g.scale.set(1, 1, 1); g.rotation.z = 0; arrOpen(o); }
    } else if (o.st === 'open') { /* the sides fall open and the balloons float away */
      const k = Math.min(1, o.t / 0.4), e = backOut(k) * 1.42; c.sides.forEach((h) => { h.children[0].rotation.x = e; });
      c.ties.visible = false; c.bal.position.y += dt * (1.2 + o.t * 2.2); c.bal.position.x += dt * 0.3; c.bal.rotation.y += dt * 0.6;
      if (an.hop > 0) an.hop = Math.max(0, an.hop - dt * 2.2); an.body.position.y = Math.sin(an.hop * Math.PI) * 0.35;
      if (o.t >= 0.5) { o.st = 'walk'; o.t = 0; }
    } else if (o.st === 'walk') { /* hop out and into the pen */
      c.bal.position.y += dt * 3.4; c.bal.position.x += dt * 0.3; c.bal.rotation.y += dt * 0.6; if (c.bal.position.y > 14) c.bal.visible = false;
      const moving = !walkTo(an.g, o.to[0], o.to[1], dt, 1.7);
      an.body.position.y = reduced ? 0 : moving ? Math.abs(Math.sin(o.t * 10)) * 0.16 : 0;
      if (!moving || o.t > 5) { o.st = 'done'; o.t = 0; an.hop = 1; burst(an.g.position.x, an.h + 0.2, an.g.position.z, 6); Snd.play('ding', { gain: 0.35, f: 'G6' }); Snd.play('sparkle', { gain: 0.3 }, 0.05); }
    } else if (o.st === 'done') { /* the empty crate shrinks away; the animal has a happy hop */
      if (an.hop > 0) an.hop = Math.max(0, an.hop - dt * 2.2); an.body.position.y = Math.sin(an.hop * Math.PI) * 0.35;
      c.bal.position.y += dt * 3.4; if (c.bal.position.y > 14) c.bal.visible = false;
      if (o.t > 0.5) { const k = Math.min(1, (o.t - 0.5) / 0.35); g.scale.setScalar(Math.max(0.001, 1 - k)); if (k >= 1) { pop(o.at); arrFinish(o); continue; } }
    }
    if (o.st === 'fall' || o.st === 'land' || o.st === 'open') { an.g.position.set(g.position.x, g.position.y + 0.08, o.at[1]); an.g.rotation.y = g.rotation.y; }
  }
}
/* while its crate is on the way, the new animal belongs to the crate and to nothing else */
{ const b0 = barnAnimal; barnAnimal = function (an, dt) { if (an.arr) return true; return b0(an, dt); }; }
{ const s0 = storeStep; storeStep = function (dt) { s0(dt); arrStep(dt); }; }
/* buying an animal pad sends the crate */
{ const u0 = unlock; unlock = function (p) {
  const n0 = animals.length; u0(p);
  if (p.kind === 'animal' && animals.length > n0) arrive(animals[animals.length - 1], padPos(p));
}; }

/* test shortcut: #arrivetest in the URL. A balloon button (bottom left) buys the next animal for free, or, once all are
   bought, sends one more of a random kind. */
function arrTestPrep() {
  if (typeof closeWardrobe === 'function' && dressing) closeWardrobe();
  if (typeof tutFinish === 'function' && state.tut && !state.tut.done) tutFinish();
}
function arrTestNext() {
  arrTestPrep();
  const p = PADS.find((q) => q.kind === 'animal' && !own(q.id));
  const stand = (q) => { pip.position.set(q[0], 0, q[1]); target.copy(pip.position); };
  if (p) { stand(padPos(p)); unlock(p); return p.id; }
  const kinds = Object.keys(pens), a = kinds[Math.floor(Math.random() * kinds.length)], f = feedPos(a); stand([f[0], f[1] + 1.35]);
  const an = addAnimal(a); arrive(an); return a;
}
if (ARR_TEST) {
  const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Nytt djur');
  b.style.cssText = 'position:fixed;left:14px;bottom:110px;z-index:40;width:64px;height:64px;border-radius:50%;border:3px solid #22303c;background:#fffaf0;box-shadow:0 4px 0 rgba(34,48,60,.28);padding:0;font-size:34px;line-height:58px;';
  b.textContent = '\u{1F388}';
  ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup'].forEach((ev) => b.addEventListener(ev, (e) => e.stopPropagation(), { passive: true }));
  b.addEventListener('click', (e) => { e.stopPropagation(); Snd.init(); console.log('[arrive]', arrTestNext()); });
  document.body.appendChild(b); setTimeout(arrTestPrep, 1200);
}
