/* ---------- extras: the farm dog, fishing from the dock and the vegetable patch (weather is in weather.js) ---------- */
function ripple(x, z) {
  const m = new T.Mesh(new T.RingGeometry(0.12, 0.18, 24), new T.MeshBasicMaterial({ color: PAL.paper, transparent: true, opacity: 0.8 }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, -0.36, z); sc.add(m); ripples.push({ m, t: 0 });
}
const ripples = [];

/* where the dog goes (engine/dog.js asks): inside the house it follows Pip; in the barn or the store, or out on the boat,
   it waits outside the door or on the dock */
function petPlace() {
  const home = inHouse && !inBarn && !inStore;
  return { home, away: (inHouse && !home) || !!trip,
    goal: inHouse ? [inStore ? SDOOR.x + 1.3 : inBarn ? BARN.x + 1.3 : HDOOR.x + 1.0, inStore ? SDOOR.z + 0.6 : inBarn ? BARN.z + 2.2 : HDOOR.z + 0.1, 2.6] : trip ? [DOCK.x + 0.95, DOCK.z0 - 0.9, 2.6] : null,
    door: (inside) => { if (!inside) return [HDOOR.x + 0.6, HDOOR.z + 0.9]; const q = typeof homeIn === 'function' ? homeIn() : null; return q ? [q[0] + 0.35, q[1] + 0.6] : [HO.x + 0.35, HO.z + 4.4]; } };
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
function extrasStep(dt) { dogStep(dt); fishStep(dt); weatherStep(dt); gardenStep(dt); animalAmbience(dt); townStep(dt); marketStep(dt); hoursStep(dt); cozyStep(dt); polishStep(dt); rainLate(); farmlookStep(dt); interiorStep(dt); barnStep(dt); petsStep(dt); storeStep(dt); }
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
