/* ---------- freed friends walk home (Leon, 2026-11-28: "when we free a villager they teleport, lets have them walk
   back to the settlement") ----------
   A friend Pip has helped used to do two happy hops, vanish in a puff and pop up at the camp. Now they set off on foot:
   over the owned squares and the bridges, the same way the pets find (isledog.js), wading through the marsh's raft
   channel and over a bridge the tide has covered. The stone island has no way home over land until the shortcut is
   built, so the mason goes the way Pip came: down the lift, through the mine, and up the stairs by the village green.
   The miner climbs the mine's stairs and comes out there too. A friend whose street is still under the sea walks to the
   fire and waits, and walks on to the house once Pip buys that corner.
   walkStart(g, x, z) plans the way for the model g (null: there is no way, so the old puff is used); walkStep(W, g, dt)
   moves g along it and says true once it is there. Nothing is saved: a friend who was on the way when the game closed
   is at home next time (their folk state was already set). */
const WALK_V = 3.0; /* a bit slower than Pip, so Pip can walk along */
const walkCaveCell = (i, j) => { const k = gIn(i, j) ? AREA_AT[gIdx(i, j)] : -1; return k >= 0 && !!AREAS[k].cave; };
/* the squares of owned areas left out as water (the marsh's raft channel): a friend wades through */
function walkHoles() { const H = new Set(); AREAS.forEach((a) => { if (a.holes && HAS[a.id]) a.holes.forEach((h) => H.add(gIdx(a.i + h[0], a.j + h[1]))); }); return H; }
const walkPass = (i, j, H) => gIn(i, j) && ((owned(i, j) && !walkCaveCell(i, j)) || H.has(gIdx(i, j)));
/* a point a friend may stand on: land Pip may walk on, a wading square, or out on a built bridge (under the tide too) */
function walkOk(x, z, H, BR) {
  const i = gCell(x), j = gCell(z); if (walkCaveCell(i, j)) return false;
  if (typeof MS !== 'undefined' && MS.list.some((m) => !m.par && !m.pop && Math.abs(x - m.x) < m.w / 2 + 0.2 && Math.abs(z - m.z) < m.d / 2 + 0.2)) return false; /* round the rock tables */
  if (walkSdf(x, z) < -0.1 || H.has(gIdx(i, j))) return true;
  return BR.some((B) => segD(x, z, B.b.x0, B.b.z0, B.b.x1, B.b.z1) < 0.7);
}
function walkLine(x0, z0, x1, z1, H, BR) { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(L / 0.4); for (let k = 1; k <= n; k++) { const u = k / n; if (!walkOk(x0 + (x1 - x0) * u, z0 + (z1 - z0) * u, H, BR)) return false; } return true; }
/* the square to start a search from: the point's own, or the nearest passable one round it */
function walkCell(x, z, H) {
  const i = gCell(x), j = gCell(z); if (walkPass(i, j, H)) return [i, j]; let best = null, bd = 1e9;
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (walkPass(i + a, j + b, H)) { const d = Math.hypot((i + a) * GS - x, (j + b) * GS - z); if (d < bd) { bd = d; best = [i + a, j + b]; } }
  return best;
}
/* the way over land from (x0, z0) to (x1, z1) as points (cell centres and bridge ends), or null */
function walkSurf(x0, z0, x1, z1) {
  const H = walkHoles(), BR = landBridges(), A = walkCell(x0, z0, H), B = walkCell(x1, z1, H); if (!A || !B) return null;
  const N = GWN * GWN, from = new Int32Array(N).fill(-2), via = new Array(N), Q = [A[0], A[1]]; from[gIdx(A[0], A[1])] = -1;
  const link = (i, j) => { const o = []; BR.forEach((R) => { if (R.a[0] === i && R.a[1] === j) o.push([R.c, R, 0]); else if (R.c[0] === i && R.c[1] === j) o.push([R.a, R, 1]); }); return o; };
  let hit = false;
  for (let h = 0; h < Q.length && !hit; h += 2) { const i = Q[h], j = Q[h + 1], me = gIdx(i, j);
    const go = (ni, nj, br) => { const n = gIdx(ni, nj); if (from[n] !== -2) return; from[n] = me; via[n] = br; Q.push(ni, nj); if (ni === B[0] && nj === B[1]) hit = true; };
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { if (walkPass(i + a, j + b, H)) go(i + a, j + b, null); });
    link(i, j).forEach(([c, R, back]) => go(c[0], c[1], back ? [[R.b.x1, R.b.z1], [R.b.x0, R.b.z0]] : [[R.b.x0, R.b.z0], [R.b.x1, R.b.z1]])); }
  if (from[gIdx(B[0], B[1])] === -2 && !(A[0] === B[0] && A[1] === B[1])) return null;
  const P = [[x1, z1]]; let n = gIdx(B[0], B[1]);
  while (from[n] >= 0) { const i = Math.floor(n / GWN) + GI0, j = (n % GWN) + GI0; if (via[n]) { P.push(via[n][1], via[n][0]); } else P.push([i * GS, j * GS]); n = from[n]; }
  P.reverse(); return { P, H, BR };
}
/* the whole trip: legs over land, and the mine in between when there is no way round above ground */
function walkStart(g, x1, z1) {
  const p = g.position, legs = [], out = typeof CAVE_OUT !== 'undefined' && stairsDown ? [CAVE_OUT.x, CAVE_OUT.z] : null;
  if (inCave && walkCaveCell(gCell(p.x), gCell(p.z))) { /* the miner: to the foot of the stairs, up, and on from the top */
    if (!out) return null; const S = walkSurf(out[0], out[1], x1, z1); if (!S) return null;
    legs.push({ cave: [CAVE_IN.x, CAVE_IN.z] }, { tun: out }, S); }
  else { const S = walkSurf(p.x, p.z, x1, z1);
    if (S) legs.push(S);
    else { if (!out || !LIFT.topOut) return null; const a = walkSurf(p.x, p.z, LIFT.topOut.x, LIFT.topOut.z), b = walkSurf(out[0], out[1], x1, z1); if (!a || !b) return null;
      legs.push(a, { tun: out, down: [LIFT.top.x, LIFT.top.z] }, b); } }
  return { legs, L: 0, k: 0, t: 0, look: 0, ph: Math.random() * 6, best: 1e9, stuck: 0, gone: 0, all: 0 };
}
const walkNear = (x, z, r) => Math.hypot(pip.position.x - x, pip.position.z - z) < (r || 14);
function walkStep(W, g, dt) {
  const p = g.position, Lg = W.legs[W.L]; W.all += dt; if (!Lg) return true;
  /* down into the lift, or into the stairs: shrink away, a while under the hill, then up out of the stairs by the green */
  if (Lg.tun) { W.t += dt;
    if (!W.gone) { const s = Math.max(0.01, 1 - W.t / 0.45); g.scale.setScalar(s); p.y = -0.25 * (1 - s); if (W.t >= 0.45) { W.gone = 1; g.visible = false; if (walkNear(p.x, p.z)) Snd.play('whoosh', { gain: 0.3, f: 260 }); } return false; }
    if (W.t < 4.5) return false;
    if (W.gone === 1) { W.gone = 2; p.set(Lg.tun[0], 0, Lg.tun[1]); g.visible = true; W.t = 4.5; if (walkNear(p.x, p.z)) { Snd.play('pop', { gain: 0.35, f: 560 }); burst(p.x, 0.8, p.z, 6); } }
    const u = Math.min(1, (W.t - 4.5) / 0.4); g.scale.setScalar(Math.max(0.01, u)); p.y = Math.sin(u * Math.PI) * 0.3; if (u >= 1) { g.scale.setScalar(1); p.y = 0; W.L++; W.t = 0; W.gone = 0; } return false; }
  /* where to head: in the mine straight for the stairs; above ground the furthest point of the way in plain sight */
  let tx, tz;
  if (Lg.cave) { [tx, tz] = Lg.cave; }
  else { const P = Lg.P; W.look -= dt;
    if (W.look <= 0) { W.look = 0.25; for (let j = Math.min(P.length - 1, W.k + 6); j > W.k; j--) if (walkLine(p.x, p.z, P[j][0], P[j][1], Lg.H, Lg.BR)) { if (j !== W.k) { W.k = j; W.best = 1e9; } break; } }
    [tx, tz] = P[W.k]; }
  const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz), last = Lg.cave || W.k >= Lg.P.length - 1;
  if (d < (last ? 0.12 : 0.5)) { if (!last) { W.k++; W.best = 1e9; return false; } W.L++; W.k = 0; W.best = 1e9; return W.L >= W.legs.length; }
  const st = Math.min(d, WALK_V * dt); p.x += dx / d * st; p.z += dz / d * st;
  if (Lg.cave) { if (typeof mineSdf === 'function') { const s = mineSdf(p.x, p.z); if (s > -0.3) { const e = 0.05, gx = mineSdf(p.x + e, p.z) - mineSdf(p.x - e, p.z), gz = mineSdf(p.x, p.z + e) - mineSdf(p.x, p.z - e), l = Math.hypot(gx, gz); if (l > 1e-5) { p.x -= gx / l * (s + 0.3); p.z -= gz / l * (s + 0.3); } } } }
  else if (typeof MS !== 'undefined') MS.list.forEach((m) => { if (!m.par && !m.pop) mesaOut(m, p, 0.25); });
  /* a little waddle, turned the way they go; knee-deep where there is water */
  W.ph += dt * 9; let yaw = Math.atan2(dx, dz) - g.rotation.y; yaw = Math.atan2(Math.sin(yaw), Math.cos(yaw)); g.rotation.y += yaw * Math.min(1, dt * 8);
  const wet = !Lg.cave && walkSdf(p.x, p.z) > -0.05;
  p.y = (Lg.cave ? MINE_Y : 0) + (wet ? -0.3 : 0) + Math.abs(Math.sin(W.ph)) * (wet ? 0.04 : 0.1); g.rotation.z = reduced ? 0 : Math.sin(W.ph) * 0.07;
  if (wet && !reduced && Math.random() < dt * 4) splash(p.x, 0.05, p.z, 2);
  /* stuck on a corner: a hop to the next point; a walk that takes ever so long ends there */
  if (d < W.best - 0.05) { W.best = d; W.stuck = 0; } else W.stuck += dt;
  if (W.stuck > 3) { W.stuck = 0; W.best = 1e9; p.x = tx; p.z = tz; burst(p.x, 0.8, p.z, 5); }
  if (W.all > 120) { W.L = W.legs.length; return true; }
  return false;
}
/* back on their feet where they stand still */
function walkEnd(g) { g.position.y = 0; g.rotation.z = 0; g.scale.setScalar(1); g.visible = true; }
