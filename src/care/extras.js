/* ---------- extras: the farm dog, fishing from the dock and the vegetable patch (weather is in weather.js) ---------- */
function toastIcon(t, text) {
  const el = $('toast'); if (!el) return;
  el.innerHTML = '<img alt="" src="' + actIcon(t) + '" style="width:60px;height:60px"><b>' + text + '</b>'; el.hidden = false; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  clearTimeout(toastIcon.t); toastIcon.t = setTimeout(() => { el.hidden = true; }, 2600);
}
const dropGeo = new T.SphereGeometry(0.045, 5, 4), dropMat = new T.MeshBasicMaterial({ color: '#bfe3f0' });
function splash(x, y, z, n) { for (let k = 0; k < n; k++) { const m = new T.Mesh(dropGeo, dropMat); m.position.set(x, y, z); const a = k / n * 6.283 + Math.random(); m.userData = { v: new T.Vector3(Math.cos(a) * 1.1, 2.2 + Math.random() * 1.4, Math.sin(a) * 1.1), t: 0.45 }; sc.add(m); pops.push(m); } }
function ripple(x, z) {
  const m = new T.Mesh(new T.RingGeometry(0.12, 0.18, 24), new T.MeshBasicMaterial({ color: PAL.paper, transparent: true, opacity: 0.8 }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, -0.36, z); sc.add(m); ripples.push({ m, t: 0 });
}
const ripples = [];

/* ---------- the dog: follows Pip around, barks now and then, sleeps in its kennel at night ---------- */
const KENNEL = { x: -1.9, z: 8.4 };
{
  const g = new T.Group(); g.position.set(KENNEL.x, 0, KENNEL.z); sc.add(g);
  let q = new T.BoxGeometry(1.0, 0.62, 0.9); q.translate(0, 0.31, 0); part(fac(jit(q, 0.015, 411), (cx, cy, cz, i) => wallY(PAL.accent, cy, 0.62, i)), g);
  [-1, 1].forEach((s) => { q = new T.BoxGeometry(0.66, 0.07, 1.04); q.translate(0, 0, 0); const m = part(fac(q, PAL.trunk, 412), g, s * 0.27, 0.8, 0); m.rotation.z = -s * 0.62; });
  q = new T.CircleGeometry(0.2, 12); const door = part(fac(q, PAL.ink, 413), g, 0, 0.26, 0.452); door.scale.y = 1.25;
  q = new T.CylinderGeometry(0.2, 0.2, 0.06, 12); part(fac(q, '#d8d0c0', 414), g, 0.42, 0.03, 0.72);
}
let dog = (() => {
  /* a fluffy golden retriever: round soft shapes, floppy ears, a feathery tail and a red collar with a tag */
  const g = new T.Group(), body = new T.Group(); g.add(body); sc.add(g);
  const C = '#dba65c', D = '#b9783c', L = '#f3d39c', fur = (hex, lo, hi) => (cx, cy, cz, i) => shadeY(hex, cy, lo, hi, i, 0.5);
  let q = ico(0.2, 2, 401, 0.012); q.scale(0.92, 0.82, 1.45); part(fac(q, fur(C, -0.2, 0.2)), body, 0, 0.38, -0.02);
  q = ico(0.15, 2, 409, 0.012); q.scale(1, 1.05, 0.9); part(fac(q, fur(L, -0.15, 0.15)), body, 0, 0.42, 0.2);
  const head = new T.Group(); head.position.set(0, 0.6, 0.3); body.add(head);
  q = ico(0.165, 2, 402, 0.008); q.scale(1, 0.95, 1); part(fac(q, fur(C, -0.16, 0.16)), head, 0, 0, 0);
  q = ico(0.1, 2, 403, 0.004); q.scale(0.85, 0.65, 1); part(fac(q, L), head, 0, -0.045, 0.13);
  part(fac(ico(0.032, 1, 404, 0.002).scale(1.2, 0.85, 1), '#2a2220'), head, 0, -0.01, 0.225);
  [-1, 1].forEach((s) => {
    const e = new T.Mesh(new T.SphereGeometry(0.026, 10, 8), ink); e.position.set(s * 0.07, 0.035, 0.14); head.add(e);
    const hl = new T.Mesh(new T.SphereGeometry(0.009, 6, 4), new T.MeshBasicMaterial({ color: '#ffffff' })); hl.position.set(0.008, 0.01, 0.02); e.add(hl);
    q = ico(0.075, 1, 406 + s, 0.004); q.scale(0.45, 1.25, 0.85); const ear = part(fac(q, fur(D, -0.1, 0.1)), head, s * 0.15, -0.04, -0.02); ear.rotation.z = s * 0.28;
  });
  q = new T.TorusGeometry(0.135, 0.025, 6, 16); q.rotateX(Math.PI / 2); part(fac(q, '#d8423a'), head, 0, -0.13, -0.04); head.children[head.children.length - 1].rotation.x = 0.25;
  part(fac(new T.CylinderGeometry(0.03, 0.03, 0.012, 10).rotateX(Math.PI / 2), '#f2c14a'), head, 0, -0.2, 0.09);
  const tail = new T.Group(); tail.position.set(0, 0.46, -0.28); body.add(tail);
  for (let k = 0; k < 4; k++) { q = ico(0.055 - k * 0.006, 1, 408 + k, 0.006); q.scale(0.8, 0.8, 1.3); part(fac(q, fur(k > 1 ? L : C, -0.05, 0.05)), tail, 0, k * 0.035, -0.05 - k * 0.075); }
  tail.rotation.x = -0.55;
  const legs = [[-0.1, 0.17], [0.1, 0.17], [-0.1, -0.2], [0.1, -0.2]].map(([x, z]) => { const l = new T.Group(); l.position.set(x, 0.3, z); body.add(l); const b = new T.CylinderGeometry(0.045, 0.04, 0.27, 8); b.translate(0, -0.14, 0); part(fac(b, C), l); part(fac(ico(0.048, 1, 410).scale(1, 0.6, 1.3), L), l, 0, -0.28, 0.015); return l; });
  g.position.set(KENNEL.x - 0.6, 0, KENNEL.z + 0.9);
  return { g, body, head, tail, legs, h: 0.72, chase: false, wanderT: 0, tx: KENNEL.x, tz: KENNEL.z + 1, barkT: 12, hop: 0, petT: -99, away: false, asleep: false };
})();
function bark(gain) { dog.hop = 1; petVoice(dog.kind || 'dog', gain); }
function petDog() { petPet(nearPet() || dog); }
function dogStep(dt) {
  const d = dog, p = d.g.position, pp = pip.position, home = inHouse && !inBarn && !inStore, away = (inHouse && !home) || !!trip;
  if (home !== !!d.inH) { d.inH = home; PTRAIL.length = 0; d.chase = false; if (home) { const q = typeof homeIn === 'function' ? homeIn() : null; if (q) p.set(q[0] + 0.35, 0, q[1] + 0.6); else p.set(HO.x + 0.35, 0, HO.z + 4.4); d.g.rotation.y = Math.PI; } else { p.set(HDOOR.x + 0.6, 0, HDOOR.z + 0.9); } }
  let tx, tz, sp = 1.1;
  if (d.away && !away && !isNight) { d.chase = true; bark(0.5); }
  d.away = away;
  if (home) { [tx, tz] = petTrailGoal(0.95); sp = Math.max(2.6, speed() * 1.05); }
  else if (isNight) { tx = KENNEL.x; tz = KENNEL.z + 0.75; sp = 2.2; }
  else if (inHouse) { tx = inStore ? SDOOR.x + 1.3 : inBarn ? BARN.x + 1.3 : HDOOR.x + 1.0; tz = inStore ? SDOOR.z + 0.6 : inBarn ? BARN.z + 2.2 : HDOOR.z + 0.1; sp = 2.6; }
  else if (trip) { tx = DOCK.x + 0.95; tz = DOCK.z0 - 0.9; sp = 2.6; }
  else {
    const dd = Math.hypot(pp.x - p.x, pp.z - p.z);
    if (dd > 24) { p.set(pp.x - 1.2, 0, pp.z - 0.8); }
    if (dd > 1.9) d.chase = true;
    if (d.chase) {
      const a = pip.rotation.y; tx = pp.x - Math.sin(a) * 0.95 + Math.cos(a) * 0.55; tz = pp.z - Math.cos(a) * 0.95 - Math.sin(a) * 0.55; sp = Math.max(2.8, speed() * 1.08);
      if (dd < 1.2) { d.chase = false; d.wanderT = 1 + Math.random() * 2; d.tx = p.x; d.tz = p.z; }
    } else {
      d.wanderT -= dt; if (d.wanderT <= 0) { d.wanderT = 2.5 + Math.random() * 4; d.tx = clamp(pp.x + (Math.random() - 0.5) * 2.6, ISLE.x0 + 1, ISLE.x1 - 1); d.tz = clamp(pp.z + (Math.random() - 0.5) * 2.6, ISLE.z0 + 1, ISLE.z1 - 1); }
      tx = d.tx; tz = d.tz;
    }
    d.barkT -= dt; if (d.barkT <= 0) { d.barkT = 16 + Math.random() * 26; if (dd < 7) bark(0.45); }
  }
  const moving = !walkTo(d.g, tx, tz, dt, sp);
  d.asleep = isNight && !moving && !home;
  if (d.kind !== 'dog') { petAnim(d, moving, sp, dt, away ? null : pp); zzz(d, d.asleep, dt); return; }
  const run = moving ? (sp > 2 ? 16 : 10) : 0;
  d.legs.forEach((l, i) => { l.rotation.x = run && !reduced ? Math.sin(time * run + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.7 : 0; });
  d.tail.rotation.y = reduced || d.asleep ? 0 : Math.sin(time * (moving ? 18 : 10)) * 0.6;
  if (d.hop > 0) d.hop = Math.max(0, d.hop - dt * 3);
  d.body.position.y = Math.sin(d.hop * Math.PI) * 0.18 + (run && !reduced ? Math.abs(Math.sin(time * run)) * 0.04 : 0);
  /* idle: look up at Pip with a little head tilt; asleep: head down */
  let hy = 0, hx = d.asleep ? 0.35 : 0, hz = 0;
  if (!moving && !d.asleep && !away) { const want = Math.atan2(pp.x - p.x, pp.z - p.z); let df = want - d.g.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); hy = clamp(df, -0.9, 0.9); hx = Math.hypot(pp.x - p.x, pp.z - p.z) < 2.2 ? -0.38 : -0.1; hz = reduced ? 0 : Math.sin(time * 1.3) * 0.12; }
  d.head.rotation.y += (hy - d.head.rotation.y) * Math.min(1, dt * 6); d.head.rotation.x += (hx - d.head.rotation.x) * Math.min(1, dt * 6); d.head.rotation.z += (hz - d.head.rotation.z) * Math.min(1, dt * 4);
  zzz(d, d.asleep, dt);
}

/* ---------- fishing from the end of the dock ---------- */
const FISHSPOT = { x: DOCK.x, z: DOCK.z1 - 0.45 };
const fishRing = new T.Mesh(new T.RingGeometry(0.36, 0.46, 28), new T.MeshBasicMaterial({ color: PAL.paper, transparent: true, opacity: 0.8 }));
fishRing.rotation.x = -Math.PI / 2; fishRing.position.set(FISHSPOT.x, 0.16, FISHSPOT.z); sc.add(fishRing);
const fishSign = new T.Sprite(new T.SpriteMaterial({ map: bubble('rod'), depthTest: false })); fishSign.renderOrder = 4; fishSign.scale.set(0.8, 0.8, 1); fishSign.position.set(FISHSPOT.x - 0.75, 1.15, FISHSPOT.z); sc.add(fishSign);
const rod = new T.Group(); { const q = new T.CylinderGeometry(0.014, 0.026, 1.5, 5); q.translate(0, 0.75, 0); part(fac(q, PAL.trunk, 421), rod); } rod.position.set(0.16, 0.6, 0.1); rod.rotation.x = 0.95;
const bob = new T.Group(); { let q = new T.SphereGeometry(0.075, 8, 6); part(fac(q, PAL.paper, 422), bob); q = new T.SphereGeometry(0.076, 8, 3, 0, 6.283, 0, 1.4); part(fac(q, PAL.accent, 423), bob); } bob.visible = false; sc.add(bob);
const fishLine = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(), new T.Vector3()]), new T.LineBasicMaterial({ color: PAL.ink })); fishLine.visible = false; fishLine.frustumCulled = false; sc.add(fishLine);
let fishing = null;
function fishModel(f) {
  const g = new T.Group(), L = f.len;
  let q = new T.SphereGeometry(0.5, 10, 7); q.scale(L, 0.34, 0.16); part(fac(q, f.c, 431), g);
  q = new T.SphereGeometry(0.5, 10, 4, 0, 6.283, 0, 0.9); q.scale(L * 0.9, 0.3, 0.17); part(fac(q, f.s, 432), g, 0, 0.02, 0);
  q = new T.ConeGeometry(0.13, 0.2, 4); q.rotateZ(Math.PI / 2); part(fac(q, f.f, 433), g, -L / 2 - 0.07, 0, 0);
  [-1, 1].forEach((s) => { q = new T.SphereGeometry(0.025, 5, 4); part(fac(q, PAL.ink, 434), g, L * 0.36, 0.04, s * 0.075); });
  return g;
}
function pickFish() { const tot = FISH.reduce((s, f) => s + f.w, 0); let r = Math.random() * tot; for (const f of FISH) { r -= f.w; if (r <= 0) return f; } return FISH[0]; }
function startFishing() { if (fishing) return; fishing = { st: 'cast', t: 0, wait: 2 + Math.random() * 4 }; target.copy(pip.position); pip.rotation.y = Math.PI / 2; pip.add(rod); Snd.play('whoosh', { gain: 0.4 }); renderActs(); }
function stopFishing() { if (!fishing) return; if (fishing.m) sc.remove(fishing.m); fishing = null; pip.remove(rod); bob.visible = false; fishLine.visible = false; renderActs(); }
function catchFish(f) {
  state.fish[f.id] = (state.fish[f.id] || 0) + 1; const first = state.fish[f.id] === 1;
  const n = Math.max(1, Math.round(f.hearts * heartMult())); earn(n); coinToHud(pip.position.x, 1.9, pip.position.z, Math.min(6, n)); burst(pip.position.x, 2.0, pip.position.z, 6);
  Snd.play('success', { gain: 0.5, f: 'E6' }); Snd.play('sparkle', { gain: 0.5 }, 0.1); toastIcon('fish:' + f.id, f.sv + '!');
  if (first) flashAlbum(); if (Math.hypot(dog.g.position.x - pip.position.x, dog.g.position.z - pip.position.z) < 6) bark(0.5);
}
const fishTip = new T.Vector3(), fishWater = new T.Vector3();
function fishStep(dt) {
  fishRing.visible = fishSign.visible = !inHouse;
  if (!fishing) return;
  const f = fishing;
  if (Math.hypot(pip.position.x - FISHSPOT.x, pip.position.z - FISHSPOT.z) > 0.8 || mount || trip || inHouse) { stopFishing(); return; }
  f.t += dt; if (Math.hypot(target.x - pip.position.x, target.z - pip.position.z) < 0.05) pip.rotation.y = Math.PI / 2;
  pip.updateMatrixWorld(); rod.localToWorld(fishTip.set(0, 1.5, 0)); fishWater.set(FISHSPOT.x + 2.5, -0.42, FISHSPOT.z + 0.15);
  if (f.st === 'cast') {
    const q = Math.min(1, f.t / 0.5); bob.visible = true; bob.position.lerpVectors(fishTip, fishWater, q); bob.position.y += Math.sin(q * Math.PI) * 0.8;
    if (q >= 1) { f.st = 'wait'; f.t = 0; ripple(fishWater.x, fishWater.z); Snd.play('pop', { gain: 0.3, f: 300 }); }
  } else if (f.st === 'wait') {
    bob.position.copy(fishWater); bob.position.y += reduced ? 0 : Math.sin(time * 3) * 0.02;
    if (f.t > f.wait) { f.st = 'bite'; f.t = 0; ripple(fishWater.x, fishWater.z); Snd.play('blip', { gain: 0.4, f: 900 }); }
  } else if (f.st === 'bite') {
    bob.position.copy(fishWater); bob.position.y -= 0.06 + Math.abs(Math.sin(f.t * 22)) * 0.07;
    if (f.t > 0.7) { f.fish = pickFish(); f.m = fishModel(f.fish); sc.add(f.m); f.st = 'reel'; f.t = 0; ripple(fishWater.x, fishWater.z); splash(fishWater.x, -0.3, fishWater.z, 8); Snd.play('swish', { gain: 0.5 }); Snd.play('pop', { gain: 0.45, f: 220 }); }
  } else if (f.st === 'reel') {
    const q = Math.min(1, f.t / 0.7), top = tmpV.set(pip.position.x, pip.position.y + 2.0, pip.position.z);
    f.m.position.lerpVectors(fishWater, top, q); f.m.position.y += Math.sin(q * Math.PI) * 1.2; f.m.rotation.z = q * 6.283; bob.position.copy(f.m.position);
    if (q >= 1) { f.st = 'show'; f.t = 0; bob.visible = false; catchFish(f.fish); }
  } else if (f.st === 'show') {
    f.m.position.set(pip.position.x, pip.position.y + 2.0 + (reduced ? 0 : Math.sin(f.t * 6) * 0.05), pip.position.z); f.m.rotation.set(0, f.t * 2.5, 0);
    if (f.t > 1.6) stopFishing();
  }
  fishLine.visible = bob.visible; if (bob.visible) { const a = fishLine.geometry.attributes.position; a.setXYZ(0, fishTip.x, fishTip.y, fishTip.z); a.setXYZ(1, bob.position.x, bob.position.y + 0.06, bob.position.z); a.needsUpdate = true; }
}
const fishPics = {};
function fishPic(id) { if (fishPics[id]) return fishPics[id]; const c = document.createElement('canvas'); c.width = c.height = 128; drawIcon(c.getContext('2d'), 'fish:' + id, 60, 64, 1.25); return (fishPics[id] = c.toDataURL()); }

/* ---------- the vegetable patch ---------- */
const beds = BEDS.map(([x, z, c], i) => {
  const g = new T.Group(); g.position.set(x, 0, z); sc.add(g);
  let q = new T.BoxGeometry(1.0, 0.12, 1.0, 2, 1, 2); q.translate(0, 0.06, 0); part(fac(jit(q, 0.012, 440 + i), '#7d5e4e', 440 + i), g);
  [-0.25, 0.25].forEach((dz) => { q = new T.BoxGeometry(0.86, 0.03, 0.12); part(fac(q, '#6a4d3f', 450), g, 0, 0.125, dz); });
  const wetM = new T.Mesh(new T.PlaneGeometry(0.98, 0.98), new T.MeshBasicMaterial({ color: '#2f2119', transparent: true, opacity: 0, depthWrite: false })); wetM.rotation.x = -Math.PI / 2; wetM.position.y = 0.122; g.add(wetM);
  const plants = new T.Group(); g.add(plants);
  const sp = new T.Sprite(new T.SpriteMaterial({ map: bubble('seed'), depthTest: false })); sp.renderOrder = 4; sp.scale.set(0.5, 0.5, 1); sp.position.set(x, 0.85, z); sc.add(sp);
  return { g, x, z, c, wetM, plants, sp, stage: '', icon: '' };
});
const SPOTS = [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]];
function cropModel(b, stage) { cropBuild(b, stage); b.plants.children.forEach((m) => { m.userData.rz = m.rotation.z; m.userData.rx = m.rotation.x; }); }
function cropBuild(b, stage) {
  const p = b.plants, c = b.c; while (p.children.length) p.remove(p.children[0]); if (stage === 'empty') return;
  const s = 400 + BEDS.indexOf(BEDS.find((q) => q[0] === b.x && q[1] === b.z)) * 7;
  SPOTS.forEach(([x, z], k) => {
    if (stage === 'sprout') { const q = new T.ConeGeometry(0.045, 0.16, 4); q.translate(0, 0.2, 0); part(fac(q, PAL.leaf, s + k), p, x, 0, z); return; }
    if (c === 'carrot') { for (let j = 0; j < 3; j++) { const q = new T.ConeGeometry(0.035, 0.34, 3); q.translate(0, 0.29, 0); const m = part(fac(q, j % 2 ? PAL.leaf : PAL.forest, s + k + j), p, x + (j - 1) * 0.05, 0, z); m.rotation.z = (j - 1) * 0.3; } if (stage === 'ripe') { const q = new T.ConeGeometry(0.07, 0.12, 6); q.rotateX(Math.PI); part(fac(q, '#ef8a2e', s + 9), p, x, 0.15, z); } }
    else if (c === 'strawberry') { part(fac(ico(0.14, 0, s + k), PAL.forest, s + k), p, x, 0.2, z); if (stage === 'ripe') [[0.08, 0.04], [-0.07, 0.09], [0.02, -0.1]].forEach(([a, e], j) => part(fac(ico(0.045, 0, s + j), '#e0453a', s + j), p, x + a, 0.24 + j * 0.02, z + e)); }
    else if (c === 'pumpkin') { if (k % 2) { const l = ico(0.16, 0, s + k); l.scale(1, 0.45, 1); part(fac(l, PAL.leaf, s + k), p, x, 0.17, z); } else if (stage === 'ripe') { const q = new T.SphereGeometry(0.2, 8, 6); q.scale(1, 0.72, 1); part(fac(q, '#ee8a2c', s + k), p, x, 0.26, z); const st = new T.CylinderGeometry(0.02, 0.025, 0.08, 4); part(fac(st, PAL.trunk, s), p, x, 0.43, z); } else { const l = ico(0.13, 0, s + k); l.scale(1, 0.5, 1); part(fac(l, PAL.forest, s + k), p, x, 0.16, z); } }
    else if (c === 'sunflower') { if (k === 1 || k === 2) { const h = stage === 'ripe' ? 1.0 : 0.55, q = new T.CylinderGeometry(0.02, 0.03, h, 4); q.translate(0, h / 2 + 0.12, 0); part(fac(q, PAL.leaf, s + k), p, x, 0, z); const l = ico(0.08, 0, s); l.scale(1.4, 0.3, 0.8); part(fac(l, PAL.forest, s), p, x + 0.06, 0.12 + h * 0.5, z); if (stage === 'ripe') { const d = new T.CylinderGeometry(0.17, 0.17, 0.04, 10); d.rotateX(Math.PI / 2 - 0.35); part(fac(d, '#f6c443', s + 1), p, x, 0.12 + h, z + 0.02); const e = new T.CylinderGeometry(0.08, 0.08, 0.05, 8); e.rotateX(Math.PI / 2 - 0.35); part(fac(e, '#6b4a3c', s + 2), p, x, 0.12 + h, z + 0.035); } } }
  });
}
function bedStage(st) { return st.s === 0 ? 'empty' : st.g >= 1 ? 'ripe' : st.g < 0.3 ? 'sprout' : 'young'; }
let gardenT = 0;
function gardenStep(dt) {
  const wetNow = raining();
  state.garden.forEach((st, i) => {
    if (st.s === 1 && st.g < 1) { if (wetNow) st.w = Math.max(st.w, 40); if (st.w > 0) { st.w -= dt; st.g = Math.min(1, st.g + dt / CROPS[BEDS[i][2]].grow * (season === 'winter' ? 0.5 : 1)); } }
    else if (wetNow) st.w = Math.max(st.w, 40);
  });
  gardenT -= dt; if (gardenT > 0) return; gardenT = 0.25;
  beds.forEach((b, i) => {
    const st = state.garden[i], stage = bedStage(st);
    if (stage !== b.stage) { b.stage = stage; cropModel(b, stage); }
    b.plants.scale.setScalar(stage === 'young' ? 0.55 + 0.45 * st.g : 1);
    b.wetM.material.opacity = st.w > 0 ? 0.35 : 0;
    const icon = stage === 'empty' ? 'seed' : stage === 'ripe' ? b.c : st.w <= 0 ? 'water' : '';
    if (icon !== b.icon) { b.icon = icon; if (icon) b.sp.material.map = bubble(icon); b.sp.material.needsUpdate = true; }
    b.sp.visible = !!icon && !inHouse && (typeof gardenOn !== 'function' || gardenOn()); b.sp.position.y = 0.85 + (reduced ? 0 : Math.sin(time * 2 + i) * 0.05);
  });
}
function nearBed() { if (typeof gardenOn === 'function' && !gardenOn()) return -1; let best = -1, bd = 0.85; BEDS.forEach((b, i) => { const d = Math.hypot(pip.position.x - b[0], pip.position.z - b[1]); if (d < bd) { bd = d; best = i; } }); return best; }
function plant(i) { const st = state.garden[i]; if (st.s) return; st.s = 1; st.g = 0; st.w = raining() ? 40 : 0; const b = beds[i]; burst(b.x, 0.4, b.z, 3); Snd.play('pop', { gain: 0.4, f: 520 }); Snd.play('tick', { gain: 0.3 }, 0.08); gardenT = 0; }
function waterBed(i) {
  const m = carry.take('water'); if (!m) return; const b = beds[i];
  fly(m, () => tmpV.set(b.x, 0.4, b.z), () => { sc.remove(m); splash(b.x, 0.25, b.z, 8); });
  state.garden[i].w = 90; Snd.play('swish', { gain: 0.45 }); Snd.play('sparkle', { gain: 0.3 }, 0.2); gardenT = 0;
}
function harvest(i) {
  const st = state.garden[i], b = beds[i], cr = CROPS[b.c]; if (st.g < 1) return;
  st.s = 0; st.g = 0; st.w = 0;
  const n = Math.max(1, Math.round(cr.hearts * heartMult())); earn(n); coinToHud(b.x, 0.8, b.z, Math.min(6, n)); burst(b.x, 0.6, b.z, 6);
  Snd.play('success', { gain: 0.45, f: 'C6' }); Snd.play('sparkle', { gain: 0.4 }, 0.08); toastIcon(b.c, cr.sv + '!'); gardenT = 0;
  const room = b.c === 'carrot' ? Math.min(2, cap() - carry.items.length) : 0;
  for (let k = 0; k < room; k++) {
    const m = mk('carrot'); m.position.set(b.x, 0.3, b.z); sc.add(m);
    fly(m, () => { carry.parent.updateMatrixWorld(); return pip.localToWorld(tmpV.set(0, 0.72 + carry.items.reduce((a, q) => a + ITEM_H[q.userData.type], 0), -0.32)); }, () => carry.add(m));
  }
}

/* ---------- now and then an animal nearby makes a sound ---------- */
let ambAnimalT = 6;
function animalAmbience(dt) {
  ambAnimalT -= dt; if (ambAnimalT > 0) return; ambAnimalT = 5 + Math.random() * 8;
  if (isNight || inHouse) return;
  const near = animals.concat(babies).filter((an) => !an.ridden && Math.hypot(an.g.position.x - pip.position.x, an.g.position.z - pip.position.z) < 10);
  if (!near.length) return; const an = near[Math.floor(Math.random() * near.length)], d = Math.hypot(an.g.position.x - pip.position.x, an.g.position.z - pip.position.z);
  Snd.animal(an.a, { gain: 0.15 + 0.4 * (1 - d / 10), rate: an.baby ? 1.35 : 0.94 + Math.random() * 0.12 });
}

/* ---------- action buttons for all of the above ---------- */
function extraActs(out) {
  if (fishing) { out.length = 0; return; }
  if (mount) return;
  const i = nearBed();
  if (i >= 0) { const st = state.garden[i], c = BEDS[i][2];
    if (st.s === 0) out.unshift({ icon: actIcon('seed'), label: 'Så ' + CROPS[c].sv, run: () => plant(i) });
    else if (st.g >= 1) out.unshift({ icon: actIcon(c), label: 'Skörda ' + CROPS[c].sv, run: () => harvest(i) });
    else if (st.w <= 0 && carry.count('water')) out.unshift({ icon: actIcon('water'), label: 'Vattna', run: () => waterBed(i) });
  }
  if (!trip && Math.hypot(pip.position.x - FISHSPOT.x, pip.position.z - FISHSPOT.z) < 0.6) out.unshift({ icon: actIcon('rod'), label: 'Fiska', run: startFishing });
  { const np = nearPet(); if (np) out.push({ icon: actIcon(np.kind), label: 'Klappa', run: () => petPet(np) }); }
  townActs(out);
}
function extrasInit() {
  if (!Array.isArray(state.garden) || state.garden.length !== BEDS.length) state.garden = BEDS.map(() => ({ s: 0, g: 0, w: 0 }));
  if (!state.fish) state.fish = {}; wxInit();
  dog.g.position.set(KENNEL.x - 0.6, 0, KENNEL.z + 0.9); petsInit();
  marketInit();
}
function extrasStep(dt) { dogStep(dt); fishStep(dt); weatherStep(dt); gardenStep(dt); animalAmbience(dt); townStep(dt); marketStep(dt); hoursStep(dt); cozyStep(dt); polishStep(dt); farmlookStep(dt); interiorStep(dt); barnStep(dt); petsStep(dt); storeStep(dt); }
function extrasTest() {
  return {
    dog: () => [dog.g.position.x, dog.g.position.z, dog.chase, dog.asleep], 
    garden: () => state.garden.map((g) => g.s + ':' + g.g.toFixed(2) + ':' + Math.round(g.w)).join(' '), grow: () => state.garden.forEach((g) => { if (g.s) g.g = 1; }),
    fish: () => JSON.stringify(state.fish), fishing: () => fishing && fishing.st, acts: () => findActs().map((a) => a.label), act: (l) => { const a = findActs().find((q) => q.label.indexOf(l) === 0); if (a) a.run(); return !!a; },
    spot: () => [FISHSPOT.x, FISHSPOT.z],
    give: (t, n) => { for (let k = 0; k < (n || 1); k++) carry.add(mk(t)); },
    ...weatherTest(), ...townTest(), ...marketTest()
  };
}
