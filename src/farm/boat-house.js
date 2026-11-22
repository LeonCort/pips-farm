/* ---------- the boat between the farm and the shop ---------- */
/* a dock at the south end of the path; stand on it and the boat sails to the other island */
const HERE = typeof DIET !== 'undefined' ? 'farm' : 'shop', THERE_PAGE = HERE === 'farm' ? 'butik.html' : 'bondgard.html';
const canSail = /github\.io$/.test(location.hostname) || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const DOCK = (() => { const X = 0; let z = 0; while (hAt(X, z) > -0.02 && z < 30) z += 0.1; return { x: X, edge: z, z0: z - 0.9, z1: z + 2.6, boat: z + 3.75 }; })();
const dockG = new T.Group(); sc.add(dockG);
{
  const len = DOCK.z1 - DOCK.z0 + 0.3; let g = new T.BoxGeometry(1.1, 0.08, len, 1, 1, Math.round(len / 0.3)); g.translate(DOCK.x, 0.1, DOCK.z0 - 0.15 + len / 2);
  part(fac(jit(g, 0.01, 3), PAL.trunk, 61), dockG);
  for (let z = DOCK.edge; z <= DOCK.z1; z += 1.1) [-0.5, 0.5].forEach((dx, k) => { const p = new T.CylinderGeometry(0.06, 0.06, 1.4, 5); part(fac(p, '#5e463a', 62 + k), dockG, DOCK.x + dx, -0.6, z); });
}
/* the boat: a red hull, a white cabin and a little flag */
const boat = new T.Group(); boat.position.set(DOCK.x, -0.32, DOCK.boat); sc.add(boat);
{
  let g = new T.BoxGeometry(1.0, 0.36, 1.9, 1, 1, 2); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const z = p.getZ(i), y = p.getY(i); if (z > 0.5) p.setX(i, p.getX(i) * 0.45); if (y < 0) p.setX(i, p.getX(i) * 0.75); }
  part(fac(g, PAL.accent, 71), boat, 0, 0.18, 0);
  g = new T.BoxGeometry(0.84, 0.06, 1.2); part(fac(g, '#c8a27a', 72), boat, 0, 0.35, -0.2, true);
  g = new T.BoxGeometry(0.6, 0.4, 0.5); part(fac(g, PAL.paper, 73), boat, 0, 0.6, -0.55);
  g = new T.BoxGeometry(0.66, 0.06, 0.58); part(fac(g, PAL.sea, 74), boat, 0, 0.83, -0.55);
  g = new T.CylinderGeometry(0.02, 0.02, 0.6, 4); part(fac(g, PAL.ink, 75), boat, 0, 1.15, -0.55);
  g = new T.BoxGeometry(0.02, 0.16, 0.26); g.translate(0, 0, 0.13); part(fac(g, PAL.ochre, 76), boat, 0, 1.36, -0.55);
}
/* a sign at the dock shows where the boat goes */
const dockSign = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d');
  x.fillStyle = PAL.paper; x.strokeStyle = PAL.ink; x.lineWidth = 6; x.beginPath(); x.arc(80, 72, 62, 0, 7); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(64, 130); x.lineTo(80, 152); x.lineTo(96, 130); x.fill(); x.stroke();
  x.lineWidth = 4; x.lineJoin = 'round';
  if (THERE_PAGE === 'butik.html') { /* the shop: a striped awning over a counter */
    x.fillStyle = '#7d5e4e'; x.fillRect(46, 74, 68, 34); x.strokeRect(46, 74, 68, 34);
    for (let k = 0; k < 5; k++) { x.fillStyle = k % 2 ? PAL.paper : PAL.accent; x.beginPath(); x.moveTo(40 + k * 16, 48); x.lineTo(56 + k * 16, 48); x.lineTo(56 + k * 16, 70); x.quadraticCurveTo(48 + k * 16, 78, 40 + k * 16, 70); x.closePath(); x.fill(); x.stroke(); }
    x.fillStyle = PAL.snow; [62, 80, 98].forEach((q) => { x.beginPath(); x.ellipse(q, 70, 6, 8, 0, 0, 7); x.fill(); x.stroke(); });
  } else { /* the farm: a red barn */
    x.fillStyle = PAL.accent; x.beginPath(); x.moveTo(44, 64); x.lineTo(80, 36); x.lineTo(116, 64); x.lineTo(116, 108); x.lineTo(44, 108); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = PAL.paper; x.fillRect(68, 78, 24, 30); x.strokeRect(68, 78, 24, 30); x.beginPath(); x.moveTo(68, 78); x.lineTo(92, 108); x.moveTo(92, 78); x.lineTo(68, 108); x.stroke();
  }
  const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false })); sp.renderOrder = 4; sp.scale.set(1.0, 1.0, 1); sp.position.set(DOCK.x + 0.95, 1.5, DOCK.z0 + 0.2); sc.add(sp);
  const post = new T.CylinderGeometry(0.05, 0.05, 0.9, 5); post.translate(0, 0.45, 0); part(fac(post, PAL.trunk, 77), sc, DOCK.x + 0.95, 0, DOCK.z0 + 0.2);
  return sp;
})();
const dockRing = new T.Mesh(new T.RingGeometry(0.42, 0.55, 32), new T.MeshBasicMaterial({ color: PAL.paper, transparent: true, opacity: 0.8 })); dockRing.rotation.x = -Math.PI / 2; dockRing.position.set(DOCK.x, 0.16, DOCK.z0 + 0.2); sc.add(dockRing);
const dockFill = new T.Mesh(new T.CircleGeometry(0.42, 32), new T.MeshBasicMaterial({ color: PAL.accent, transparent: true, opacity: 0.85 })); dockFill.rotation.x = -Math.PI / 2; dockFill.position.set(DOCK.x, 0.17, DOCK.z0 + 0.2); dockFill.scale.setScalar(0.001); sc.add(dockFill);
/* the screen fades to and from the sea colour between islands */
const fadeEl = (() => { const d = document.createElement('div'); d.setAttribute('aria-hidden', 'true'); d.style.cssText = 'position:fixed;inset:0;background:#2e8f9c;opacity:0;pointer-events:none;transition:opacity 0.6s ease;z-index:50'; document.body.appendChild(d); return d; })();
let trip = null, dockWait = 0;
const arriving = /[?&]from=boat\b/.test(location.search);
if (arriving) { fadeEl.style.transition = 'none'; fadeEl.style.opacity = '1'; trip = { st: 'arrive', t: 0 }; boat.position.z = DOCK.boat + 7; pip.position.set(DOCK.x, 0, DOCK.boat + 7); target.copy(pip.position); try { history.replaceState(null, '', location.pathname); } catch (e) {} requestAnimationFrame(() => requestAnimationFrame(() => { fadeEl.style.transition = 'opacity 0.8s ease'; fadeEl.style.opacity = '0'; })); }
function seat() { return tmpV.set(boat.position.x, boat.position.y + 0.42, boat.position.z + 0.15); }
function boatStep(dt) {
  boat.position.y = -0.32 + (reduced ? 0 : Math.sin(time * 1.6) * 0.04); boat.rotation.z = reduced ? 0 : Math.sin(time * 1.2) * 0.03;
  dockFill.scale.setScalar(Math.max(0.001, dockWait));
  if (!trip) {
    const onDock = Math.hypot(pip.position.x - DOCK.x, pip.position.z - (DOCK.z0 + 0.2)) < 0.6 && !riding() && !dressing;
    const still = Math.hypot(target.x - pip.position.x, target.z - pip.position.z) < 0.15;
    dockWait = onDock && still ? Math.min(1, dockWait + dt / 0.9) : Math.max(0, dockWait - dt * 3);
    dockRing.scale.setScalar(1 + (reduced ? 0 : Math.sin(time * 3) * 0.05));
    if (dockWait >= 1) { dockWait = 0; trip = { st: 'board', t: 0, from: pip.position.clone() }; Snd.play('powerup', { gain: 0.4 }); }
    return;
  }
  trip.t += dt; target.copy(pip.position);
  if (trip.st === 'board') {
    const q = Math.min(1, trip.t / 0.7), s = seat(); pip.position.lerpVectors(trip.from, s, q); pip.position.y += Math.sin(q * Math.PI) * 0.6; pip.rotation.y = 0;
    if (q >= 1) { trip.st = 'sail'; trip.t = 0; trip.v = 0; }
  } else if (trip.st === 'sail') {
    trip.v = Math.min(4, trip.v + dt * 2.5); boat.position.z += trip.v * dt; pip.position.copy(seat()); pip.rotation.y = 0;
    if (trip.t > 1.2 && !trip.faded) { trip.faded = true; if (canSail) fadeEl.style.opacity = '1'; }
    if (trip.t > 2.0 && !trip.gone) { trip.gone = true; if (canSail) { try { save(); } catch (e) {} location.href = THERE_PAGE + '?from=boat'; } else { trip.st = 'return'; trip.t = 0; } }
  } else if (trip.st === 'return' || trip.st === 'arrive') {
    /* sail back in to the dock (without a second island, the boat just takes a round trip) */
    const dz = boat.position.z - DOCK.boat; boat.position.z -= Math.max(1.6, Math.min(4.5, dz * 1.6)) * dt; if (boat.position.z < DOCK.boat) boat.position.z = DOCK.boat; pip.position.copy(seat()); pip.rotation.y = Math.PI;
    if (boat.position.z <= DOCK.boat + 0.01) { trip = { st: 'land', t: 0, from: pip.position.clone() }; }
  } else if (trip.st === 'land') {
    const q = Math.min(1, trip.t / 0.7), to = tmpV.set(DOCK.x, 0, DOCK.z0 - 0.5); pip.position.lerpVectors(trip.from, to, q); pip.position.y += Math.sin(q * Math.PI) * 0.6; pip.rotation.y = Math.PI;
    if (q >= 1) { pip.position.y = 0; target.copy(pip.position); trip = null; Snd.play('pop', { gain: 0.4, f: 520 }); }
  }
}

/* ---------- the upgrade house: walk in, visit a room, stand on its pad to buy ---------- */
const ISLE = ISLAND.box;
const HO = { x: 200, z: 0 }; /* the inside is built far out to sea, where nothing else is */
const IN_B = { x0: HO.x - 5.7, x1: HO.x + 5.7, z0: HO.z - 6.7, z1: HO.z + 5.4 };
let inHouse = false, houseReady = false;
const BND = () => inHouse ? IN_B : ISLE;
const HOUSE = HERE === 'farm' ? { x: 0, z: -5.3 } : { x: -8.2, z: 2.4 };
const HDOOR = { x: HOUSE.x, z: HOUSE.z + 1.55 };
const CUR_ICON = HERE === 'farm' ? 'heart' : 'coin';
const lampMatH = new T.MeshBasicMaterial({ color: '#ffe6a8' });
/* outside: a tall house with a big up-arrow over the door */
const houseG = new T.Group(); houseG.position.set(HOUSE.x, 0, HOUSE.z); sc.add(houseG);
{
  let g = new T.BoxGeometry(2.4, 1.5, 2.0, 2, 2, 2); g.translate(0, 0.75, 0); part(fac(jit(g, 0.02, 5), '#9fc7d6', 111), houseG);
  g = new T.CylinderGeometry(0.01, 1.85, 1.0, 4, 1); g.rotateY(Math.PI / 4); g.scale(1, 1, 0.82); g.translate(0, 2.0, 0); part(fac(g, PAL.ochre, 112), houseG);
  const door = new T.Mesh(new T.BoxGeometry(0.62, 0.95, 0.04), ink); door.position.set(0, 0.48, 1.01); houseG.add(door);
  [-0.8, 0.8].forEach((x) => { const w = new T.Mesh(new T.BoxGeometry(0.36, 0.36, 0.03), lampMatH); w.position.set(x, 0.95, 1.01); houseG.add(w); });
  g = new T.BoxGeometry(2.6, 0.08, 0.5); part(fac(g, PAL.trunk, 113), houseG, 0, 1.06, 1.2);
}
const upSign = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = PAL.accent; x.strokeStyle = PAL.ink; x.lineWidth = 6; x.beginPath(); x.arc(64, 64, 56, 0, 7); x.fill(); x.stroke();
  x.fillStyle = PAL.paper; x.beginPath(); x.moveTo(64, 22); x.lineTo(98, 62); x.lineTo(78, 62); x.lineTo(78, 100); x.lineTo(50, 100); x.lineTo(50, 62); x.lineTo(30, 62); x.closePath(); x.fill(); x.lineWidth = 5; x.stroke();
  const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false })); sp.renderOrder = 4; sp.scale.set(1.1, 1.1, 1); sp.position.set(HOUSE.x, 3.1, HOUSE.z + 0.4); sc.add(sp); return sp;
})();
const plusSign = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  x.fillStyle = '#74a857'; x.strokeStyle = PAL.ink; x.lineWidth = 5; x.beginPath(); x.arc(32, 32, 26, 0, 7); x.fill(); x.stroke();
  x.fillStyle = PAL.paper; x.fillRect(27, 16, 10, 32); x.fillRect(16, 27, 32, 10);
  const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false })); sp.renderOrder = 5; sp.scale.set(0.5, 0.5, 1); sc.add(sp); sp.visible = false; return sp;
})();
function mkRing(x, z) {
  const r = new T.Mesh(new T.RingGeometry(0.42, 0.55, 32), new T.MeshBasicMaterial({ color: PAL.paper, transparent: true, opacity: 0.85 })); r.rotation.x = -Math.PI / 2; r.position.set(x, 0.06, z); sc.add(r);
  const f = new T.Mesh(new T.CircleGeometry(0.42, 32), new T.MeshBasicMaterial({ color: PAL.accent, transparent: true, opacity: 0.85 })); f.rotation.x = -Math.PI / 2; f.position.set(x, 0.07, z); f.scale.setScalar(0.001); sc.add(f);
  return { r, f, x, z, w: 0 };
}
const doorRing = mkRing(HDOOR.x, HDOOR.z);
/* inside: a floor in the middle of a garden, low walls so the camera sees into every room */
const ROOMS = [
  { id: 'speed', x: -3.5, z: -2.25, floor: '#cfe6ef', side: -1 },
  { id: 'bag', x: -3.5, z: 2.25, floor: '#f3dfb0', side: -1 },
  { id: 'farm', x: 3.5, z: -2.25, floor: '#f7d3d3', side: 1 },
  { id: 'guests', x: 3.5, z: 2.25, floor: '#d8ecd0', side: 1 }
];
const WALLS = [
  { v: 0, z: 4.5, a: -6, b: 6, gaps: [[-1, 1]] }, { v: 0, z: -7, a: -6, b: 6, gaps: [] },
  { v: 1, x: -6, a: -7, b: 4.5, gaps: [] }, { v: 1, x: 6, a: -7, b: 4.5, gaps: [] },
  { v: 0, z: -4.5, a: -6, b: 6, gaps: [[-0.85, 0.85]] },
  { v: 1, x: -1, a: -4.5, b: 4.5, gaps: [[-2.95, -1.55], [1.55, 2.95]] }, { v: 1, x: 1, a: -4.5, b: 4.5, gaps: [[-2.95, -1.55], [1.55, 2.95]] },
  { v: 0, z: 0, a: -6, b: -1, gaps: [] }, { v: 0, z: 0, a: 1, b: 6, gaps: [] }
];
const inG = new T.Group(); inG.position.set(HO.x, 0, HO.z); sc.add(inG);
{
  let g = new T.PlaneGeometry(48, 40, 24, 20); g.rotateX(-Math.PI / 2); const yard = part(fac(g, (cx, cy, cz, i) => tone(Math.abs(cx) < 1.1 && cz > 4.5 ? PAL.sand : PAL.grass, i, 0.9)), inG); yard.castShadow = false;
  g = new T.BoxGeometry(12, 0.06, 11.5); part(fac(g, '#d9bf94', 114), inG, 0, 0.03, -1.25, true);
  ROOMS.concat([{ x: 0, z: -5.75, w: 12, d: 2.5, floor: '#e6dcf2' }]).forEach((r, k) => { const f = new T.Mesh(new T.PlaneGeometry(r.w || 4.9, r.d || 4.4), new T.MeshStandardMaterial({ color: r.floor, roughness: 1 })); f.rotation.x = -Math.PI / 2; f.position.set(r.x, 0.065, r.z); f.receiveShadow = true; inG.add(f); });
  WALLS.forEach((w, k) => {
    let s = w.a; const cuts = w.gaps.concat([[w.b, w.b]]);
    cuts.forEach(([g0, g1]) => { const len = g0 - s; if (len > 0.05) { const geo = w.v ? new T.BoxGeometry(0.16, 0.7, len) : new T.BoxGeometry(len, 0.7, 0.16); const m = part(fac(geo, PAL.paper, 120 + k), inG, w.v ? w.x : s + len / 2, 0.35, w.v ? s + len / 2 : w.z); const t = w.v ? new T.BoxGeometry(0.22, 0.06, len) : new T.BoxGeometry(len, 0.06, 0.22); part(fac(t, PAL.trunk, 130 + k), inG, m.position.x, 0.72, m.position.z, true); } s = g1; });
  });
  /* a doormat at the way out */
  g = new T.BoxGeometry(1.6, 0.03, 0.6); part(fac(g, PAL.accent, 140), inG, 0, 0.07, 4.9, true);
}
/* the menu's own pictures go on the room signs, so the rooms match what the child already knows */
function iconImg(id, cb) { const el = $('up-' + id), svg = el && el.querySelector('svg'); if (!svg) return; let s = svg.outerHTML; if (!/xmlns=/.test(s)) s = s.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'); const img = new Image(); img.onload = () => cb(img); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); }
const UP_BY = {}; UPS.forEach((u) => { UP_BY[u.id] = u; });
const ghostMat = new T.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.38, roughness: 1, depthWrite: false });
function ghostOf(obj) { const g = obj.clone(true); g.traverse((m) => { if (m.isMesh) m.material = ghostMat; }); return g; }
function runnerShoe() { const g = new T.Group(); let geo = new T.BoxGeometry(0.34, 0.18, 0.5); part(fac(geo, PAL.accent, 150), g, 0, 0.14, 0); geo = new T.BoxGeometry(0.36, 0.06, 0.54); part(fac(geo, PAL.paper, 151), g, 0, 0.03, 0.01); geo = new T.BoxGeometry(0.3, 0.14, 0.2); part(fac(geo, PAL.accent, 152), g, 0, 0.27, -0.12); return g; }
function crate() { const g = new T.Group(), geo = new T.BoxGeometry(0.42, 0.22, 0.32); part(fac(jit(geo, 0.01, 2), PAL.ochre, 153), g, 0, 0.11, 0); return g; }
function miniHen() { const g = new T.Group(); let geo = ico(0.24, 1, 3, 0.02); geo.scale(1.1, 0.9, 1); part(fac(geo, PAL.paper, 154), g, 0, 0.3, 0); part(fac(ico(0.13, 0, 4), PAL.paper, 155), g, 0, 0.55, 0.17); part(fac(new T.BoxGeometry(0.04, 0.09, 0.12), PAL.accent, 156), g, 0, 0.7, 0.16); geo = new T.ConeGeometry(0.04, 0.09, 4); geo.rotateX(Math.PI / 2); part(fac(geo, PAL.ochre, 157), g, 0, 0.55, 0.33); return g; }
function miniGuest(col) { const g = new T.Group(); let geo = new T.CylinderGeometry(0.14, 0.18, 0.5, 6); part(fac(geo, col, 158), g, 0, 0.25, 0); part(fac(ico(0.15, 1, 5), '#e8b48f', 159), g, 0, 0.65, 0); return g; }
function miniBot() { const g = new T.Group(); let geo = new T.BoxGeometry(0.34, 0.3, 0.3); part(fac(geo, PAL.paper, 160), g, 0, 0.32, 0); const v = new T.Mesh(new T.BoxGeometry(0.26, 0.1, 0.02), ink); v.position.set(0, 0.36, 0.16); g.add(v); geo = new T.CylinderGeometry(0.12, 0.12, 0.08, 8); part(fac(geo, PAL.sea, 161), g, 0, 0.1, 0); return g; }
const rooms = ROOMS.map((r) => {
  const u = UP_BY[r.id], cx = HO.x + r.x, cz = HO.z + r.z, padX = cx - r.side * 1.15, showX = cx + r.side * 1.0;
  const ring = mkRing(padX, cz);
  /* the pad shows the price and how much is already paid */
  const c = document.createElement('canvas'); c.width = c.height = 192; const tex = new T.CanvasTexture(c);
  const pad = new T.Mesh(new T.CircleGeometry(0.62, 32), new T.MeshBasicMaterial({ map: tex, transparent: true })); pad.rotation.x = -Math.PI / 2; pad.position.set(padX, 0.08, cz); sc.add(pad);
  ring.r.visible = false; ring.f.visible = false;
  /* the sign on the back wall: the picture and one dot per level */
  const sc2 = document.createElement('canvas'); sc2.width = 256; sc2.height = 200; const stex = new T.CanvasTexture(sc2);
  const sign = new T.Sprite(new T.SpriteMaterial({ map: stex, depthTest: false })); sign.renderOrder = 4; sign.scale.set(1.7, 1.33, 1); sign.position.set(cx + r.side * 1.6, 1.7, cz - 1.25); sc.add(sign);
  const room = { r, u, cx, cz, padX, showX, pad, tex, c, sign, stex, sc2, img: null, shown: '', demo: new T.Group(), t: 0, bits: [] };
  room.demo.position.set(showX, 0, cz); sc.add(room.demo);
  iconImg(r.id, (img) => { room.img = img; room.shown = ''; });
  buildDemo(room);
  return room;
});
function drawRoom(room) {
  const u = room.u, lv = state.lv[u.id], maxed = lv >= u.max, cost = upCost(u), paid = (state.upPaid && state.upPaid[u.id]) || 0, key = lv + ':' + paid + ':' + (state.coins >= cost - paid) + ':' + !!room.img;
  if (key === room.shown) return; room.shown = key;
  let x = room.c.getContext('2d'); x.clearRect(0, 0, 192, 192);
  x.fillStyle = maxed ? '#fff2c2' : 'rgba(255,246,228,0.95)'; x.beginPath(); x.arc(96, 96, 90, 0, 7); x.fill();
  if (!maxed) { x.lineWidth = 10; x.strokeStyle = PAL.ochre; x.beginPath(); x.arc(96, 96, 84, -Math.PI / 2, -Math.PI / 2 + 6.2832 * paid / cost); x.stroke(); }
  if (maxed) { x.fillStyle = PAL.ochre; x.font = '700 90px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('★', 96, 100); }
  else { drawIcon(x, CUR_ICON, 52, 98, 0.75); x.fillStyle = PAL.ink; x.font = '700 54px Fredoka, sans-serif'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(fmt(cost - paid), 76, 102); }
  room.tex.needsUpdate = true;
  x = room.sc2.getContext('2d'); x.clearRect(0, 0, 256, 200);
  x.fillStyle = PAL.paper; x.strokeStyle = PAL.ink; x.lineWidth = 6; x.beginPath(); x.roundRect ? x.roundRect(8, 8, 240, 184, 28) : x.rect(8, 8, 240, 184); x.fill(); x.stroke();
  if (room.img) x.drawImage(room.img, 78, 18, 100, 100);
  const n = u.max, w = 22, gap = 6, x0 = 128 - (n * w + (n - 1) * gap) / 2;
  for (let i = 0; i < n; i++) { x.fillStyle = i < lv ? '#74a857' : '#e6d9bd'; x.strokeStyle = PAL.ink; x.lineWidth = 3; x.beginPath(); x.arc(x0 + i * (w + gap) + w / 2, 150, w / 2, 0, 7); x.fill(); x.stroke(); }
  room.stex.needsUpdate = true;
}
/* each room shows what its upgrade does: now (solid) and after buying (see-through) */
function buildDemo(room) {
  const d = room.demo, id = room.r.id;
  if (id === 'speed') {
    const tr = new T.Mesh(new T.TorusGeometry(1.0, 0.06, 4, 32), new T.MeshStandardMaterial({ color: PAL.paper, roughness: 1 })); tr.rotation.x = Math.PI / 2; tr.scale.set(1, 0.7, 1); tr.position.y = 0.08; d.add(tr);
    room.a = runnerShoe(); room.b = ghostOf(room.a); d.add(room.a, room.b); room.pa = 0; room.pb = 0;
  } else if (id === 'bag' || (id === 'guests' && HERE === 'shop') || (id === 'farm' && HERE === 'shop')) {
    room.stack = new T.Group(); d.add(room.stack);
    if (id === 'bag') { const basket = new T.BoxGeometry(0.7, 0.12, 0.5); part(fac(basket, PAL.trunk, 162), d, 0, 0.06, 0); }
    if (id === 'farm') { room.hen = miniHen(); room.hen.position.set(-0.3, 0, -0.3); room.hen.rotation.y = 0.6; d.add(room.hen); }
    if (id === 'guests') { const ct = new T.BoxGeometry(0.9, 0.5, 0.4); part(fac(ct, '#7d5e4e', 163), d, 0, 0.25, -1.3); }
  } else if (id === 'farm') {
    room.hen = miniHen(); room.hen.scale.setScalar(1.4); d.add(room.hen); room.stack = new T.Group(); d.add(room.stack);
  } else if (id === 'guests') {
    const tr = new T.Mesh(new T.TorusGeometry(1.0, 0.06, 4, 32), new T.MeshStandardMaterial({ color: PAL.paper, roughness: 1 })); tr.rotation.x = Math.PI / 2; tr.scale.set(1, 0.7, 1); tr.position.y = 0.08; d.add(tr);
    room.a = miniBot(); room.b = ghostOf(room.a); d.add(room.a, room.b); room.pa = 0; room.pb = 0;
  }
  room.lvBuilt = -1;
}
function syncDemo(room) {
  const id = room.r.id, lv = state.lv[room.u.id], maxed = lv >= room.u.max; if (room.lvBuilt === lv) return; room.lvBuilt = lv;
  if (room.b) room.b.visible = !maxed;
  if (!room.stack) return;
  while (room.stack.children.length) room.stack.remove(room.stack.children[0]);
  if (id === 'bag') { const n = Math.min(14, 4 + 2 * lv), nn = maxed ? n : Math.min(16, n + 2); for (let k = 0; k < nn; k++) { const m = k < n ? crate() : ghostOf(crate()); m.position.set(0, 0.12 + k * 0.23, 0); m.rotation.y = (k % 2) * 0.2; room.stack.add(m); } }
  if (id === 'guests') { const n = 1 + lv, cols = [PAL.sea, PAL.accent, '#7b5ea7', '#3f7d62', PAL.ochre]; for (let k = 0; k < n + (maxed ? 0 : 1); k++) { const m = k < n ? miniGuest(cols[k % 5]) : ghostOf(miniGuest(PAL.paper)); m.position.set(((k % 3) - 1) * 0.55, 0, -0.7 + Math.floor(k / 3) * 0.6); m.rotation.y = Math.PI; room.stack.add(m); } }
}
/* the egg or heart demo pops more with each level */
function popDemo(room, dt) {
  const lv = state.lv[room.u.id]; room.t -= dt;
  if (room.t <= 0) {
    room.t = HERE === 'shop' ? 2.4 / (1 + 0.25 * lv) : 1.8;
    const n = HERE === 'shop' ? 1 : Math.max(1, Math.round(1 + 0.25 * lv * 4) ); room.hen.userData.hop = 1;
    for (let k = 0; k < Math.min(n, 9); k++) { const m = HERE === 'shop' ? mk('egg') : new T.Mesh(heartGeo, heartMat); m.position.set(room.hen.position.x + room.demo.position.x, 0.8, room.hen.position.z + room.demo.position.z); const a = k / Math.max(1, n) * 6.28 + Math.random(); m.userData = Object.assign(m.userData || {}, { dv: new T.Vector3(Math.cos(a) * 0.9, 2.6 + Math.random(), Math.sin(a) * 0.9), dt: 0 }); sc.add(m); room.bits.push(m); }
  }
  for (let i = room.bits.length - 1; i >= 0; i--) { const m = room.bits[i], u = m.userData; u.dt += dt; u.dv.y -= 9 * dt; m.position.addScaledVector(u.dv, dt); if (m.position.y < 0.1) { m.position.y = 0.1; u.dv.set(0, 0, 0); } if (u.dt > 1.4) { sc.remove(m); room.bits.splice(i, 1); } }
  const h = room.hen.userData.hop || 0; room.hen.position.y = Math.sin(h * Math.PI) * 0.25; room.hen.userData.hop = Math.max(0, h - dt * 3);
}
/* the wardrobe room: a mirror and a clothes rail; stand in front of the mirror to change */
const wardRing = mkRing(HO.x, HO.z - 6.15);
{
  const fr = new T.BoxGeometry(1.2, 1.8, 0.12); part(fac(fr, PAL.trunk, 170), inG, 0, 0.95, -6.8);
  const gl = new T.Mesh(new T.PlaneGeometry(0.95, 1.55), new T.MeshStandardMaterial({ color: '#cfe8f2', roughness: 0.15, metalness: 0.3 })); gl.position.set(0, 0.95, -6.73); inG.add(gl);
  /* the farm game has the bed on the left, so all the clothes hang on one long rail on the right */
  { const pole = new T.CylinderGeometry(0.04, 0.04, 1.4, 6); part(fac(pole, PAL.ink, 171), inG, 1.9, 0.7, -6.2); part(fac(pole, PAL.ink, 171), inG, 5.7, 0.7, -6.2); const bar = new T.CylinderGeometry(0.03, 0.03, 3.8, 6); bar.rotateZ(Math.PI / 2); part(fac(bar, PAL.ink, 172), inG, 3.8, 1.38, -6.2);
    AVO.sh.slice(0, 8).forEach((col, k) => { const t = new T.BoxGeometry(0.36, 0.5, 0.08); part(fac(t, col, 173 + k), inG, 2.25 + k * 0.45, 1.05, -6.2); }); }
}
let wardLatch = false, doorT = 0;
function goInside(to) {
  if (doorT > 0) return; doorT = 1; fadeEl.style.opacity = '1'; Snd.play('pop', { gain: 0.4, f: to ? 420 : 620 });
  setTimeout(() => {
    inHouse = to;
    if (to) { pip.position.set(HO.x, 0, HO.z + 3.7); pip.rotation.y = Math.PI; } else { pip.position.set(HDOOR.x, 0, HDOOR.z + 0.7); pip.rotation.y = 0; }
    target.copy(pip.position); camFocus.copy(pip.position); lastP.copy(pip.position); doorRing.w = 0;
    setTimeout(() => { fadeEl.style.opacity = '0'; doorT = 0; }, 120);
  }, 420);
}
const lastP = new T.Vector3().copy(pip.position);
function stillOn(ring, dt, r) { const on = Math.hypot(pip.position.x - ring.x, pip.position.z - ring.z) < (r || 0.6), still = Math.hypot(target.x - pip.position.x, target.z - pip.position.z) < 0.15; return on && still; }
function houseStep(dt) {
  if (inBarn) { lastP.copy(pip.position); return; }
  /* outside: the doormat takes you in */
  houseReady = !window.PIPS_STORE && UPS.some((u) => state.lv[u.id] < u.max && state.coins >= upCost(u) - ((state.upPaid && state.upPaid[u.id]) || 0));
  plusSign.visible = houseReady && !inHouse; plusSign.position.set(HOUSE.x + 0.7, 3.5 + (reduced ? 0 : Math.abs(Math.sin(time * 3)) * 0.15), HOUSE.z + 0.4);
  upSign.position.y = 3.1 + (reduced ? 0 : Math.sin(time * 2) * 0.06);
  if (!inHouse) {
    /* the house is solid from outside */
    { const dx = pip.position.x - HOUSE.x, dz = pip.position.z - HOUSE.z, hx = 1.45, hz = 1.25; if (Math.abs(dx) < hx && Math.abs(dz) < hz) { if (hx - Math.abs(dx) < hz - Math.abs(dz)) pip.position.x = HOUSE.x + Math.sign(dx || 1) * hx; else pip.position.z = HOUSE.z + Math.sign(dz || 1) * hz; } }
    const ok = !riding() && !dressing && !trip && doorT <= 0 && stillOn(doorRing, dt);
    doorRing.w = ok ? Math.min(1, doorRing.w + dt / 0.5) : Math.max(0, doorRing.w - dt * 3); doorRing.f.scale.setScalar(Math.max(0.001, doorRing.w));
    if (doorRing.w >= 1) goInside(true);
    lastP.copy(pip.position); return;
  }
  /* walls: Pip cannot walk through them, only through the doorways */
  const lx0 = lastP.x - HO.x, lz0 = lastP.z - HO.z, lx1 = pip.position.x - HO.x, lz1 = pip.position.z - HO.z;
  for (const w of WALLS) {
    if (w.v) { if ((lx0 - w.x) * (lx1 - w.x) < 0 || Math.abs(lx1 - w.x) < 0.18) { const z = lz1; if (z > w.a - 0.1 && z < w.b + 0.1 && !w.gaps.some(([g0, g1]) => z > g0 + 0.2 && z < g1 - 0.2)) { pip.position.x = lastP.x; if (Math.abs(lx0 - w.x) < 0.18) pip.position.x = HO.x + w.x + Math.sign(lx0 - w.x || 1) * 0.19; } } }
    else if ((lz0 - w.z) * (lz1 - w.z) < 0 || Math.abs(lz1 - w.z) < 0.18) { const x = lx1; if (x > w.a - 0.1 && x < w.b + 0.1 && !w.gaps.some(([g0, g1]) => x > g0 + 0.2 && x < g1 - 0.2)) { if (w.z === 4.5 && Math.abs(x) < 1) continue; pip.position.z = lastP.z; if (Math.abs(lz0 - w.z) < 0.18) pip.position.z = HO.z + w.z + Math.sign(lz0 - w.z || 1) * 0.19; } }
  }
  lastP.copy(pip.position);
  /* out through the front door */
  if (pip.position.z > HO.z + 5.0 && doorT <= 0) goInside(false);
  /* rooms: stand on the pad to pay a little at a time, like the pads outside */
  if (!state.upPaid) state.upPaid = {};
  rooms.forEach((room) => {
    if (window.PIPS_STORE) { if (!room.hid) { room.hid = 1; room.pad.visible = room.sign.visible = room.demo.visible = false; room.bits.forEach((m) => sc.remove(m)); room.bits.length = 0; } return; }
    const u = room.u, lv = state.lv[u.id], maxed = lv >= u.max, cost = upCost(u);
    const on = Math.hypot(pip.position.x - room.padX, pip.position.z - room.cz) < 0.62, still = Math.hypot(target.x - pip.position.x, target.z - pip.position.z) < 0.15;
    if (on && still && !maxed && state.coins > 0) {
      const left = cost - (state.upPaid[u.id] || 0), amt = Math.min(state.coins, left, Math.max(1, Math.ceil(cost * dt / 1.4)));
      state.coins -= amt; state.upPaid[u.id] = (state.upPaid[u.id] || 0) + amt; room.tick = (room.tick || 0) - dt; if (room.tick <= 0) { room.tick = 0.08; Snd.play('tick', { gain: 0.3, f: 1200 }, 0, 70); }
      if (state.upPaid[u.id] >= cost) { state.upPaid[u.id] = 0; state.lv[u.id]++; Snd.play('powerup', { gain: 0.55 }); Snd.play('sparkle', { gain: 0.4 }, 0.1); room.sign.scale.set(2.1, 1.65, 1); save(); }
    }
    if (on && still && !maxed && state.coins <= 0 && !room.poor) { room.poor = true; Snd.play('tock', { gain: 0.3, f: 300 }); flash($('coins').parentNode, 'no'); }
    if (!on) room.poor = false;
    room.sign.scale.lerp(tmpV.set(1.7, 1.33, 1), Math.min(1, dt * 6));
    room.pad.scale.setScalar(on && !maxed ? 1.08 : 1 + (reduced || maxed ? 0 : Math.sin(time * 3) * 0.03));
    drawRoom(room); syncDemo(room);
    const sp = (base) => base * (reduced ? 0.4 : 1);
    if (room.r.id === 'speed') { const s0 = speed() / 3.0, s1 = (3.0 + 0.45 * Math.min(u.max, lv + 1)) / 3.0 * (HERE === 'farm' ? 1 : 1); room.pa += dt * sp(1.6) * s0; room.pb += dt * sp(1.6) * s1; [[room.a, room.pa], [room.b, room.pb]].forEach(([m, p]) => { m.position.set(Math.cos(p), 0.1, Math.sin(p) * 0.7); m.rotation.y = -p; }); }
    if (room.r.id === 'guests' && HERE === 'farm') { const s0 = helpSpeed(), s1 = 2.2 * (1 + 0.15 * Math.min(u.max, lv + 1)); room.pa += dt * sp(0.7) * s0; room.pb += dt * sp(0.7) * s1; [[room.a, room.pa], [room.b, room.pb]].forEach(([m, p]) => { m.position.set(Math.cos(p), 0, Math.sin(p) * 0.7); m.rotation.y = -p; }); }
    if (room.r.id === 'farm') popDemo(room, dt);
  });
  /* the mirror opens the wardrobe once each time you step up to it */
  const atMirror = stillOn(wardRing, dt, 0.7);
  wardRing.f.scale.setScalar(dressing ? 1 : 0.001);
  if (atMirror && !wardLatch && !dressing) { wardLatch = true; openWardrobe(); }
  if (Math.hypot(pip.position.x - wardRing.x, pip.position.z - wardRing.z) > 0.9) wardLatch = false;
}

