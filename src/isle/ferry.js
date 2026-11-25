/* ---------- the boat to Pips farm (Leon, 2026-11-25: "a connected game mode") ----------
   A little dock on the west shore of the camp. Stand on the round pad and it fills; Pip hops into the boat, it sails
   off west, the screen fades to the sea and the farm opens (bondgard.html?from=isle). Coming from the farm
   (isle.html?from=farm) the boat sails in and Pip hops out onto the pad. The farm has the same boat back (boat-house.js).
   If the farm page is not there (a single test page), the boat just sails a round trip. */
const FB = { trip: null, wait: 0, page: 'bondgard.html' };
const FERRY_DOCK = { x0: FERRY.x - 0.55, x1: FERRY.x - 3.3, boat: FERRY.x - 4.1 };
const ferryBoat = new T.Group();
{
  const L = [], z = FERRY.z; let q;
  for (let k = 0; k < 8; k++) { q = new T.BoxGeometry(0.36, 0.08, 1.15); q.translate(FERRY_DOCK.x0 - 0.18 - k * 0.37, 0.12, z); L.push(fac(q, () => tone(['#c0935f', '#b08454', '#c99f6c'][k % 3], k, 0.3), 5000 + k)); }
  for (let k = 0; k < 3; k++) [-0.52, 0.52].forEach((dz, j) => { q = new T.CylinderGeometry(0.07, 0.08, 1.3, 7); q.translate(FERRY_DOCK.x0 - 0.5 - k * 1.1, -0.3, z + dz); L.push(fac(q, (cx, cy) => shadeY(PAL.trunk, cy, -1, 0.4, k + j, 0.4), 5010 + k * 2 + j)); });
  /* a post with a barn picture: this boat goes to the farm */
  q = new T.CylinderGeometry(0.05, 0.06, 1.25, 6); q.translate(FERRY.x + 0.6, 0.62, z - 0.75); L.push(fac(q, (cx, cy) => shadeY('#8a5f3c', cy, 0, 1.3, 2, 0.4), 5020));
  merged(L, MAT);
  const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d');
  x.fillStyle = '#fff6e4'; x.strokeStyle = PAL.ink; x.lineWidth = 6; x.beginPath(); x.arc(80, 72, 62, 0, 7); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(64, 130); x.lineTo(80, 152); x.lineTo(96, 130); x.fill(); x.stroke(); x.lineWidth = 4; x.lineJoin = 'round';
  x.fillStyle = '#d9573f'; x.beginPath(); x.moveTo(44, 64); x.lineTo(80, 36); x.lineTo(116, 64); x.lineTo(116, 108); x.lineTo(44, 108); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = '#fff6e4'; x.fillRect(68, 78, 24, 30); x.strokeRect(68, 78, 24, 30); x.beginPath(); x.moveTo(68, 78); x.lineTo(92, 108); x.moveTo(92, 78); x.lineTo(68, 108); x.stroke();
  const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true })); sp.scale.set(0.95, 0.95, 1); sp.position.set(FERRY.x + 0.6, 1.75, z - 0.75); sc.add(sp); FB.sign = sp;
  /* the boat: red hull, white cabin, a flag */
  const B = []; q = new T.SphereGeometry(0.55, 14, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2); q.scale(0.75, 0.6, 1.7); q.rotateY(Math.PI / 2); B.push(fac(q, (cx, cy) => new T.Color(cy > -0.08 ? '#fbf3e4' : '#d9573f'), 5030));
  q = new T.BoxGeometry(0.55, 0.38, 0.5); q.translate(0.25, 0.19, 0); B.push(fac(q, (cx, cy, cz, i) => tone('#fbf3e4', i, 0.2), 5031));
  q = new T.BoxGeometry(0.62, 0.06, 0.58); q.translate(0.25, 0.41, 0); B.push(fac(q, () => new T.Color('#5aa7d6'), 5032));
  q = new T.CylinderGeometry(0.02, 0.02, 0.55, 5); q.translate(0.25, 0.7, 0); B.push(fac(q, () => new T.Color('#5a3a22'), 5033));
  q = new T.BoxGeometry(0.24, 0.15, 0.02); q.translate(0.37, 0.9, 0); B.push(fac(q, () => new T.Color('#f2c23c'), 5034));
  merged(B, MAT, ferryBoat); ferryBoat.position.set(FERRY_DOCK.boat, -0.08, z); sc.add(ferryBoat);
}
const ferryRing = ropeRing(0.45, 0.6); ferryRing.rotation.x = -Math.PI / 2; ferryRing.position.set(FERRY.x, 0.035, FERRY.z); sc.add(ferryRing);
const ferryFill = new T.Mesh(new T.CircleGeometry(0.42, 32), new T.MeshBasicMaterial({ color: '#f4b23a', transparent: true, opacity: 0.85 })); ferryFill.rotation.x = -Math.PI / 2; ferryFill.position.set(FERRY.x, 0.045, FERRY.z); ferryFill.scale.setScalar(0.001); sc.add(ferryFill);
const ferryFade = (() => { const d = document.createElement('div'); d.setAttribute('aria-hidden', 'true'); d.style.cssText = 'position:fixed;inset:0;background:#2e8f9c;opacity:0;pointer-events:none;transition:opacity 0.6s ease;z-index:50'; document.body.appendChild(d); return d; })();
const ferrySeat = () => tmpV.set(ferryBoat.position.x - 0.25, ferryBoat.position.y + 0.32, ferryBoat.position.z);
/* is the farm page there to sail to? (a single test page has no farm: then the boat comes straight back) */
let ferryOk = null;
try { fetch(FB.page, { method: 'HEAD' }).then((r) => (r.ok || r.status !== 405 ? r : fetch(FB.page))).then((r) => { ferryOk = r.ok; }).catch(() => { ferryOk = false; }); } catch (e) { ferryOk = false; }
function ferryArrive() {
  if (!/[?&]from=farm\b/.test(location.search)) return;
  try { history.replaceState(null, '', location.pathname); } catch (e) {}
  ferryFade.style.transition = 'none'; ferryFade.style.opacity = '1'; ferryBoat.position.x = FERRY_DOCK.boat - 7; FB.trip = { st: 'arrive', t: 0 };
  pip.position.copy(ferrySeat()); target.copy(pip.position); camFocus.set(FERRY.x, 0, FERRY.z);
  requestAnimationFrame(() => requestAnimationFrame(() => { ferryFade.style.transition = 'opacity 0.8s ease'; ferryFade.style.opacity = '0'; }));
}
function ferryStep(dt) {
  if (!FB.arrived) { FB.arrived = 1; ferryArrive(); }
  ferryBoat.position.y = -0.08 + (reduced ? 0 : Math.sin(time * 1.6) * 0.04); ferryBoat.rotation.x = reduced ? 0 : Math.sin(time * 1.2) * 0.03;
  ferryFill.scale.setScalar(Math.max(0.001, FB.wait)); if (FB.sign) FB.sign.position.y = 1.75 + (reduced ? 0 : Math.sin(time * 2) * 0.05);
  const pp = pip.position, T0 = FB.trip;
  if (!T0) {
    const on = Math.hypot(pp.x - FERRY.x, pp.z - FERRY.z) < 0.5 && !enSleep && !inCave && !rising && Math.hypot(target.x - pp.x, target.z - pp.z) < 0.15;
    FB.wait = on ? Math.min(1, FB.wait + dt / 0.9) : Math.max(0, FB.wait - dt * 3);
    if (FB.wait >= 1) { FB.wait = 0; FB.trip = { st: 'board', t: 0, from: pp.clone() }; work = null; Snd.play('powerup', { gain: 0.4 }); }
    return;
  }
  T0.t += dt; target.copy(pp);
  if (T0.st === 'board') { const q = Math.min(1, T0.t / 0.7); pp.lerpVectors(T0.from, ferrySeat(), q); pp.y += Math.sin(q * Math.PI) * 0.6; pip.rotation.y = -Math.PI / 2; if (q >= 1) { T0.st = 'sail'; T0.t = 0; T0.v = 0; } }
  else if (T0.st === 'sail') { T0.v = Math.min(4, T0.v + dt * 2.5); ferryBoat.position.x -= T0.v * dt; pp.copy(ferrySeat()); pip.rotation.y = -Math.PI / 2;
    if (T0.t > 1.2 && !T0.faded) { T0.faded = true; if (ferryOk) ferryFade.style.opacity = '1'; }
    if (T0.t > 2.0 && !T0.gone) { T0.gone = true; if (ferryOk) { try { save(); } catch (e) {} location.href = FB.page + '?from=boat'; } else { T0.st = 'arrive'; T0.t = 0; } } }
  else if (T0.st === 'arrive') { const dx = FERRY_DOCK.boat - ferryBoat.position.x; ferryBoat.position.x += Math.max(1.6, Math.min(4.5, dx * 1.6)) * dt; if (ferryBoat.position.x > FERRY_DOCK.boat) ferryBoat.position.x = FERRY_DOCK.boat; pp.copy(ferrySeat()); pip.rotation.y = Math.PI / 2;
    if (ferryBoat.position.x >= FERRY_DOCK.boat - 0.01) FB.trip = { st: 'land', t: 0, from: pp.clone() }; }
  else if (T0.st === 'land') { const q = Math.min(1, T0.t / 0.7); pp.lerpVectors(T0.from, tmpV.set(FERRY.x + 0.7, 0, FERRY.z), q); pp.y += Math.sin(q * Math.PI) * 0.6; pip.rotation.y = Math.PI / 2;
    if (q >= 1) { pp.y = 0; target.copy(pp); FB.trip = null; Snd.play('pop', { gain: 0.4, f: 520 }); } }
}
const ferryBusy = () => !!FB.trip;
