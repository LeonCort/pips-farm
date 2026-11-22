/* ---------- loop ---------- */
/* which music fits where Pip is: the house (and night on the farm) is calm, the shop's market area has the coin tune,
   everywhere else is the pastoral day music */
let inMkt = false;
function inMarket() {
  if (HERE !== 'shop') return false;
  const x = pip.position.x, z = pip.position.z, m = inMkt ? 0.4 : 0; /* a small margin, so standing on the edge does not flip back and forth */
  inMkt = (x > 0.9 - m && x < 8.6 + m && z > -4.8 - m && z < 2.5 + m) || z > 2.7 - m;
  return inMkt;
}
function musicMood() {
  if (inHouse) return 'relaxed';
  if (HERE === 'farm') return isNight ? 'relaxed' : typeof inMarketTown === 'function' && inMarketTown() ? 'coin' : 'pastoral';
  return inMarket() ? 'coin' : 'pastoral';
}
Snd.tracks = HERE === 'farm' ? ['pastoral', 'relaxed', 'coin'] : ['pastoral', 'coin', 'relaxed'];
if (window.__farmTest) { window.__snd = Snd; window.__pip = pip; }
let actT = 0, menuT = 0, time = 0, xferT = 0, lastT = 0, saveT = 0, waterT = 0;
function step(dt) {
  time += dt;
  /* Pip moves toward the touch point, or by keys */
  let kx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0), kz = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);
  if (joy) { if (Math.hypot(joy.dx, joy.dy) > 10) { kx = joy.dx; kz = joy.dy; } else target.copy(pip.position); }
  if (kx || kz) { const l = Math.hypot(kx, kz); target.set(pip.position.x + kx / l * 0.6, 0, pip.position.z + kz / l * 0.6); onIsle(target); if (typeof routeStop === 'function') routeStop(); }
  const moving = !walkTo(pip, target.x, target.z, dt, speed());
  pipWalk = moving ? pipWalk + dt : 0;
  pb.position.y = reduced ? 0 : moving ? Math.abs(Math.sin(pipWalk * 11)) * 0.07 : Math.sin(time * 2.1) * 0.03;
  pb.rotation.z = moving && !reduced ? Math.sin(pipWalk * 11) * 0.05 : 0;
  limbs.forEach((l) => { l.g.rotation.x = moving && !reduced && !riding() ? Math.sin(pipWalk * 11) * (l.arm ? 0.45 : 0.6) * l.s : l.arm || !riding() ? 0 : -1.2; });
  if (dressing) { pip.rotation.y += (0 - pip.rotation.y) * Math.min(1, dt * 6); }
  eyes.forEach((e) => { e.scale.y = (time % 3.7) < 0.12 ? 0.15 : 1.15; });
  boatStep(dt); houseStep(dt);
  const near = (x, z, r) => Math.hypot(pip.position.x - x, pip.position.z - z) < r;
