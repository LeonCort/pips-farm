/* Pips Island: what Pip and the pet have earned is worn where it can be seen (Leon, 2026-11-27: "every upgrade must be
   visible; the dog's upgrades too").
     Pip:  the backpack from the chest, fur boots, a lantern on the hip that glows at night, a burning torch in the mine
     pet:  trick 2 (fetch) a red neckerchief, trick 3 (dig) a little spade strapped on its back, trick 4 (double coins)
           a gold medal on its chest; trick 5 is the saddlebags (isledog.js)
   Each piece is made once and hung on the figure; the figure is rebuilt when Pip is dressed or the pet is changed, so
   every step checks that the pieces still hang on the figure that is on screen now. */
const WEAR = { pip: {}, pet: {}, flame: null, glow: null };
function wearPart(build) { const g = new T.Group(), L = []; build(L, g); if (L.length) merged(L.map((q) => (q.index ? q.toNonIndexed() : q)), MAT, g); return g; }
function wearPip() {
  const W = WEAR.pip;
  if (!W.bag) {
    W.bag = wearPart((L) => { let q = new T.BoxGeometry(0.3, 0.34, 0.16, 2, 2, 2); jit(q, 0.008, 9101); q.translate(0, 1.0, -0.2); L.push(fac(q, (cx, cy, cz, i) => shadeY('#b5713f', cy, 0.8, 1.2, i, 0.3), 9101));
      q = new T.BoxGeometry(0.31, 0.12, 0.17); q.translate(0, 1.13, -0.2); L.push(fac(q, '#8f5630', 9102)); q = new T.BoxGeometry(0.2, 0.14, 0.05); q.translate(0, 0.93, -0.3); L.push(fac(q, '#c98850', 9103));
      q = new T.BoxGeometry(0.06, 0.05, 0.02); q.translate(0, 1.07, -0.29); L.push(fac(q, '#f2c23c', 9104));
      q = ico(0.07, 1, 9105); q.scale(1.6, 0.8, 0.9); q.translate(0, 1.22, -0.2); L.push(fac(q, '#e3d0a8', 9105)); /* a bedroll on top */ });
    W.lamp = wearPart((L, g) => { let q = new T.CylinderGeometry(0.05, 0.06, 0.03, 8); q.translate(0, 0.07, 0); L.push(fac(q, '#4a4038', 9110)); q = new T.CylinderGeometry(0.03, 0.05, 0.03, 8); q.translate(0, -0.07, 0); L.push(fac(q, '#4a4038', 9111));
      q = new T.TorusGeometry(0.035, 0.008, 4, 10); q.translate(0, 0.115, 0); L.push(fac(q, '#4a4038', 9112));
      [0, 1, 2, 3].forEach((k) => { const a = k * Math.PI / 2 + 0.78; q = new T.BoxGeometry(0.012, 0.12, 0.012); q.translate(Math.cos(a) * 0.05, 0, Math.sin(a) * 0.05); L.push(fac(q, '#4a4038', 9113 + k)); });
      const m = new T.Mesh(new T.SphereGeometry(0.042, 8, 6), new T.MeshBasicMaterial({ color: '#ffd98a' })); m.userData.noBatch = 1; g.add(m); WEAR.glow = m; g.position.set(0.25, 0.74, 0.06); });
    W.torch = wearPart((L, g) => { const q = new T.CylinderGeometry(0.022, 0.028, 0.5, 6); q.translate(0, 0, 0); L.push(fac(q, '#8a5f3c', 9120)); const c = new T.CylinderGeometry(0.04, 0.03, 0.08, 7); c.translate(0, 0.27, 0); L.push(fac(c, '#4a4038', 9121));
      const f = new T.Mesh(new T.ConeGeometry(0.06, 0.2, 7), new T.MeshBasicMaterial({ color: '#ffb23a' })); f.position.y = 0.41; f.userData.noBatch = 1; g.add(f); WEAR.flame = f; g.position.set(-0.3, 1.08, 0.16); g.rotation.z = 0.25; });
    W.boots = [0, 1].map((k) => wearPart((L) => { let q = new T.CylinderGeometry(0.112, 0.118, 0.17, 10); q.translate(0, -0.5, 0); L.push(fac(q, (cx, cy, cz, i) => shadeY('#8a5a3a', cy, -0.6, -0.4, i, 0.3), 9130 + k));
      q = new T.SphereGeometry(0.115, 10, 6); q.scale(1, 0.62, 1.45); q.translate(0, -0.575, 0.06); L.push(fac(q, (cx, cy, cz, i) => shadeY('#7a4e31', cy, -0.65, -0.5, i, 0.3), 9132 + k));
      q = new T.TorusGeometry(0.11, 0.04, 6, 12); q.rotateX(Math.PI / 2); q.translate(0, -0.41, 0); L.push(fac(q, (cx, cy, cz, i) => tone('#fff6e4', i, 0.3), 9134 + k)); }));
  }
  const legs = limbs.filter((l) => !l.arm), hang = (g, on, par) => { if (on && par && g.parent !== par) par.add(g); g.visible = !!on; };
  hang(W.bag, state.isle.tools && state.isle.tools.bag, pb); hang(W.lamp, gearHas('lantern'), pb); hang(W.torch, gearHas('torch') && inCave, pb);
  W.boots.forEach((g, k) => hang(g, gearHas('boots') && legs[k], legs[k] && legs[k].g));
  if (WEAR.glow) { const n = typeof nightAmt === 'number' ? nightAmt : 0; WEAR.glow.material.color.set(n > 0.3 || inCave ? '#ffd98a' : '#b8ae96'); WEAR.glow.scale.setScalar(n > 0.3 && !reduced ? 1 + Math.sin(time * 9) * 0.06 : 1); }
  if (WEAR.flame && W.torch.visible) { WEAR.flame.scale.set(1 + Math.sin(time * 17) * 0.12, 1 + Math.sin(time * 13) * 0.18, 1 + Math.cos(time * 15) * 0.12); WEAR.flame.rotation.y = time * 3; }
}
/* the scooter (gear.js): Pip hops on after a few steps of walking and rolls, half as fast again, and faster still along a
   trail or a street. It is put away in the mine, in deep snow without boots, and whenever Pip stops to work. */
const SCO = { g: null, on: 0, wh: [] };
const scootFast = () => (SCO.on > 0.5 ? (roadKind(pip.position.x, pip.position.z) ? 1.8 : 1.45) : 1);
function scootStep() {
  const ride = gearHas('scooter') && !inCave && !enSleep && !work && pipWalk > 0.7 && !gearSnow() && !ferryBusy() && !inHouse;
  SCO.on = ride ? Math.min(1, SCO.on + 0.06) : Math.max(0, SCO.on - 0.12);
  if (!SCO.g) { if (!ride) return;
    SCO.g = wearPart((L, g) => { let q = new T.BoxGeometry(0.24, 0.045, 0.78, 1, 1, 3); q.translate(0, 0.1, -0.04); L.push(fac(q, (cx, cy, cz, i) => tone('#e0503c', i, 0.25), 9301));
      q = new T.BoxGeometry(0.18, 0.012, 0.4); q.translate(0, 0.128, -0.1); L.push(fac(q, '#4a4038', 9302)); /* the grip tape */
      q = new T.CylinderGeometry(0.03, 0.03, 0.78, 6); q.rotateX(0.16); q.translate(0, 0.47, 0.33); L.push(fac(q, '#b9c1c9', 9303));
      q = new T.CylinderGeometry(0.032, 0.032, 0.62, 6); q.rotateZ(Math.PI / 2); q.translate(0, 0.86, 0.39); L.push(fac(q, '#4a4f57', 9304));
      [-0.26, 0.26].forEach((dx, k) => { q = new T.CylinderGeometry(0.045, 0.045, 0.11, 6); q.rotateZ(Math.PI / 2); q.translate(dx * 1.02, 0.86, 0.39); L.push(fac(q, '#e0503c', 9305 + k)); });
      /* a pennant on a tall whip at the back, so the scooter shows from every side and over the grass */
      q = new T.CylinderGeometry(0.016, 0.022, 2.1, 5); q.rotateX(-0.12); q.translate(0, 1.15, -0.44); L.push(fac(q, '#e6d9c0', 9320));
      q = new T.ConeGeometry(0.17, 0.44, 3); q.rotateZ(-Math.PI / 2); q.scale(1, 1, 0.15); q.translate(0.22, 2.05, -0.56); L.push(fac(q.toNonIndexed(), '#f29a2e', 9321));
      [0.3, -0.4].forEach((dz, k) => { const w = new T.CylinderGeometry(0.1, 0.1, 0.07, 12); w.rotateZ(Math.PI / 2); const m = new T.Mesh(fac(w.toNonIndexed(), (cx, cy, cz, i) => (Math.hypot(cy, cz) < 0.05 ? new T.Color('#e0503c') : tone(i % 4 < 2 ? '#fff6e4' : '#e6d9c0', i, 0.2)), 9310 + k), MAT); m.position.set(0, 0.1, dz); m.userData.noBatch = 1; m.castShadow = true; g.add(m); SCO.wh.push(m); }); }); }
  if (SCO.g.parent !== pip) pip.add(SCO.g);
  const s = SCO.on * SCO.on * (3 - 2 * SCO.on); SCO.g.visible = s > 0.02; SCO.g.scale.setScalar(Math.max(0.01, s)); SCO.g.position.y = (1 - s) * 0.5;
  if (SCO.g.visible) SCO.wh.forEach((w) => { w.rotation.x += speed() * 0.016 / 0.1; });
}
/* Pip behind a tree or a house (Leon, 2026-11-27: "if the player is hidden from the camera we should show a silhouette so
   the player always knows where they are"): a pale cut-out of Pip that is drawn only where something stands in front. It
   is a picture held a little toward the camera from Pip, tested against what is already drawn the other way round
   (drawn where it is BEHIND something), so Pip's own body never sets it off. */
const SIL = { sp: null };
function silStep() {
  if (!SIL.sp) { const c = document.createElement('canvas'); c.width = 128; c.height = 176; const x = c.getContext('2d'); x.lineJoin = 'round'; x.lineWidth = 7; x.strokeStyle = 'rgba(34,48,60,.9)'; x.fillStyle = 'rgba(255,246,228,.9)';
    x.beginPath(); x.roundRect(36, 86, 56, 62, 20); x.fill(); x.stroke(); x.beginPath(); x.roundRect(42, 140, 18, 28, 8); x.fill(); x.stroke(); x.beginPath(); x.roundRect(68, 140, 18, 28, 8); x.fill(); x.stroke();
    x.beginPath(); x.arc(64, 56, 36, 0, 7); x.fill(); x.stroke(); x.beginPath(); x.arc(64, 50, 36, Math.PI, 0); x.closePath(); x.fillStyle = 'rgba(242,154,46,.9)'; x.fill(); x.stroke();
    const m = new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true, opacity: 0.85, depthFunc: T.GreaterDepth, depthWrite: false, fog: false });
    SIL.sp = new T.Sprite(m); SIL.sp.scale.set(0.95, 1.3, 1); SIL.sp.renderOrder = 999; sc.add(SIL.sp); }
  const p = pip.position, dx = cam.position.x - p.x, dy = cam.position.y - (p.y + 0.72), dz = cam.position.z - p.z, l = Math.hypot(dx, dy, dz) || 1, k = 0.75;
  SIL.sp.visible = !inHouse && !enSleep && pip.visible; SIL.sp.position.set(p.x + dx / l * k, p.y + 0.72 + dy / l * k, p.z + dz / l * k);
}
function wearPet() {
  const W = WEAR.pet; if (!dog || !dog.g) return;
  if (!W.scarf) {
    W.scarf = wearPart((L) => { let q = new T.TorusGeometry(0.135, 0.035, 6, 12); q.rotateX(Math.PI / 2 - 0.5); q.translate(0, 0.5, 0.2); L.push(fac(q, '#e0503c', 9201));
      q = new T.ConeGeometry(0.1, 0.16, 3); q.rotateX(Math.PI); q.scale(1, 1, 0.35); q.translate(0, 0.39, 0.3); L.push(fac(q, (cx, cy, cz, i) => (i % 3 ? new T.Color('#e0503c') : new T.Color('#fff6e4')), 9202)); });
    W.spade = wearPart((L) => { let q = new T.CylinderGeometry(0.014, 0.014, 0.3, 6); q.rotateX(Math.PI / 2); q.translate(0.07, 0.61, -0.02); L.push(fac(q, '#a8774f', 9210));
      q = new T.BoxGeometry(0.1, 0.02, 0.12); q.translate(0.07, 0.61, -0.22); L.push(fac(q, '#b9c1c9', 9211)); q = new T.BoxGeometry(0.07, 0.022, 0.03); q.translate(0.07, 0.61, 0.14); L.push(fac(q, '#6e4426', 9212));
      q = new T.BoxGeometry(0.3, 0.025, 0.04); q.translate(0, 0.59, -0.02); L.push(fac(q, '#8a3f22', 9213)); });
    W.medal = wearPart((L) => { let q = new T.CylinderGeometry(0.055, 0.055, 0.018, 12); q.rotateX(Math.PI / 2 - 0.35); q.translate(0, 0.33, 0.33); L.push(fac(q, (cx, cy, cz, i) => new T.Color(i % 2 ? '#ffd75a' : '#f2c23c'), 9220));
      q = new T.BoxGeometry(0.03, 0.09, 0.012); q.rotateX(-0.35); q.translate(0, 0.4, 0.3); L.push(fac(q, '#3f78c8', 9221)); });
  }
  const lv = dogLv(), on = state.pet !== 'none', par = dog.body || dog.g;
  [['scarf', 2], ['spade', 3], ['medal', 4]].forEach(([k, need]) => { const g = W[k], want = on && lv >= need; if (want && g.parent !== par) par.add(g); g.visible = want; });
}
function wearStep() { wearPip(); wearPet(); scootStep(); silStep(); }
