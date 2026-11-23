/* ---------- Pips Island: the save, the rules, the home island's squares and the islands out at sea ----------
   A gathering game on the Pips engine. Home is a 5 by 5 grid of squares (GS world units each). The middle 3 by 3 is
   land from the start; the ring round it is sea until each square is bought with things Pip gathers (logs, stones, berries).
   Further out lie other islands, each bigger, with its own shape and its own things. They are always there to see;
   a bridge sign builds the bridge that lets Pip walk over (Leon, 2026-11-23: explore the world one island at a time).
   The engine draws the ground from ISLAND.d (how far a point is from the coast) and keeps Pip on land with ISLAND.clamp,
   so the coast follows whichever squares are owned. */
const SAVE_KEY = 'pip-isle-v2'; /* the island's own save; pips-avatar (how Pip looks) is shared with the farm */
const HERE = 'isle';
const GS = 5, GN = 2; /* square size, and how many squares out from the middle (5 by 5 in all) */
const GRID_W = GN * 2 + 1;
const gIdx = (i, j) => (i + GN) * GRID_W + (j + GN); /* square (i, j), i along x and j along z, -GN..GN */
const gIn = (i, j) => Math.abs(i) <= GN && Math.abs(j) <= GN;
const gCell = (x) => Math.round(x / GS);
/* which squares are land: read from the save right away, because the ground is drawn before the game starts */
const OWN = new Uint8Array(GRID_W * GRID_W);
/* ?new=1 starts a new island (for testing) */
try { if (/[?&]new=1/.test(location.search)) localStorage.removeItem(SAVE_KEY); } catch (e) {}
const OPEN = {}, EXT = {}; /* islands whose bridge is built, and bonus pieces bought (both read from the save before the ground is drawn) */
(function () {
  let I = null; try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s && s.v === 1 && s.isle) I = s.isle; } catch (e) {}
  if (I && Array.isArray(I.own) && I.own.length) I.own.forEach((k) => { if (k >= 0 && k < OWN.length) OWN[k] = 1; });
  else for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) OWN[gIdx(i, j)] = 1;
  if (I && I.open) Object.assign(OPEN, I.open); if (I && I.ext) Object.assign(EXT, I.ext);
})();
const owned = (i, j) => gIn(i, j) && OWN[gIdx(i, j)] === 1;
/* distance from a point to square (i, j) (0 inside it) */
function boxD(x, z, i, j) { const dx = Math.max(Math.abs(x - i * GS) - GS / 2, 0), dz = Math.max(Math.abs(z - j * GS) - GS / 2, 0); return Math.hypot(dx, dz); }
/* signed distance to the coast: below 0 on land (how far in), above 0 at sea (how far out) */
function gSdf(x, z) {
  const ci = gCell(x), cj = gCell(z); let d = 3;
  if (owned(ci, cj)) { for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if ((a || b) && !owned(ci + a, cj + b)) d = Math.min(d, boxD(x, z, ci + a, cj + b)); return -d; }
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (owned(ci + a, cj + b)) d = Math.min(d, boxD(x, z, ci + a, cj + b));
  return d;
}
/* keep a point on land: walk it into the nearest owned square, a little in from any side that faces the sea */
function gClamp(v) {
  if (gSdf(v.x, v.z) < -0.22) return v;
  let best = null, bd = 1e9;
  for (let i = -GN; i <= GN; i++) for (let j = -GN; j <= GN; j++) if (owned(i, j)) { const d = boxD(v.x, v.z, i, j); if (d < bd) { bd = d; best = [i, j]; } }
  if (!best) return v;
  const [i, j] = best, m = 0.25, cx = i * GS, cz = j * GS, h = GS / 2;
  const x0 = cx - h + (owned(i - 1, j) ? 0 : m), x1 = cx + h - (owned(i + 1, j) ? 0 : m), z0 = cz - h + (owned(i, j - 1) ? 0 : m), z1 = cz + h - (owned(i, j + 1) ? 0 : m);
  v.x = clamp(v.x, x0, x1); v.z = clamp(v.z, z0, z1);
  if (gSdf(v.x, v.z) > -0.2) { /* an inner corner: pull it toward the square's middle until it is on land */
    for (let k = 0; k < 8 && gSdf(v.x, v.z) > -0.2; k++) { v.x += (cx - v.x) * 0.15; v.z += (cz - v.z) * 0.15; } }
  return v;
}
/* ---- the islands out at sea: round parts joined together, holes (a pond), bonus pieces, and the bridge that leads there.
   bridge.a is a point on the land it starts from, bridge.b a point on the island; the ends are found where the land stops.
   need: what must be true before the bridge sign shows (a home square, or another island's bridge). ---- */
const ISLES = [
  { id: 'meadow', tint: ['#b4e05e', 0.22], parts: [[0, -27, 7.5], [-7, -31, 6], [7, -32, 6.5], [-1, -37.5, 6], [9, -25.5, 4]], holes: [[1.5, -31, 2.0]],
    ext: [{ id: 'cove', parts: [[15, -35, 4.6]], cost: { log: 14, hay: 10, berry: 6 } }],
    bridge: { a: [0, -10], b: [0, -24], need: () => owned(0, -2), cost: { log: 20, stone: 10, berry: 6 } } },
  { id: 'stone', tint: ['#9fa592', 0.5], parts: [[-23.5, -31, 5.5], [-28, -37, 5], [-21.5, -39.5, 4.5], [-27, -28.5, 3.6]], holes: [],
    ext: [],
    bridge: { a: [-9, -31], b: [-23, -31], need: () => !!OPEN.meadow, cost: { log: 26, hay: 14, stone: 12 } } }
];
const ISLE_BY = {}; ISLES.forEach((s) => { ISLE_BY[s.id] = s; });
/* signed distance to an island's coast (below 0 on land), with a gentle wobble so it does not look drawn with a compass */
function isleSdf(s, x, z) {
  let d = 1e9; const w = 0.35 * Math.sin(x * 0.9 + z * 0.4) + 0.25 * Math.sin(z * 1.3 - x * 0.7);
  s.parts.forEach((p) => { d = Math.min(d, Math.hypot(x - p[0], z - p[1]) - p[2]); });
  s.ext.forEach((e) => { if (EXT[s.id + ':' + e.id]) e.parts.forEach((p) => { d = Math.min(d, Math.hypot(x - p[0], z - p[1]) - p[2]); }); });
  d += w; s.holes.forEach((h) => { d = Math.max(d, h[2] - Math.hypot(x - h[0], z - h[1])); });
  return d;
}
/* the coast that is drawn: home's squares and every island (built bridges or not) */
function drawSdf(x, z) { let d = gSdf(x, z); for (const s of ISLES) d = Math.min(d, isleSdf(s, x, z)); return d; }
/* where a bridge starts and ends: walk from a to b; it starts where the first land stops and ends where the island begins */
function bridgeEnds(s) {
  if (s.ends) return s.ends;
  const [ax, az] = s.bridge.a, [bx, bz] = s.bridge.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
  let t0 = 0, t1 = L, k = 0;
  for (; k <= L; k += 0.1) { const x = ax + ux * k, z = az + uz * k; if (walkSdf(x, z, s) > -0.05) { t0 = k - 0.5; break; } }
  for (; k <= L; k += 0.1) { const x = ax + ux * k, z = az + uz * k; if (isleSdf(s, x, z) < -0.05) { t1 = k + 0.5; break; } }
  return (s.ends = { x0: ax + ux * t0, z0: az + uz * t0, x1: ax + ux * t1, z1: az + uz * t1, ux, uz, L: t1 - t0 });
}
/* where Pip may walk: home's squares, islands with a built bridge, and the bridges themselves (skip: the island being measured from) */
function walkSdf(x, z, skip) {
  let d = gSdf(x, z);
  for (const s of ISLES) { if (s === skip || !OPEN[s.id]) continue; d = Math.min(d, isleSdf(s, x, z)); const e = s.ends; if (e) d = Math.min(d, segD(x, z, e.x0, e.z0, e.x1, e.z1) - 0.72); }
  return d;
}
/* keep a point where Pip may walk: slide it down the slope of walkSdf; if that finds nothing, pull it back toward Pip */
function wClamp(v) {
  let s = walkSdf(v.x, v.z); if (s < -0.2) return v;
  for (let k = 0; k < 10 && s >= -0.2; k++) { const e = 0.05, gx = walkSdf(v.x + e, v.z) - walkSdf(v.x - e, v.z), gz = walkSdf(v.x, v.z + e) - walkSdf(v.x, v.z - e), l = Math.hypot(gx, gz);
    if (l < 1e-5) break; const st = s + 0.24; v.x -= gx / l * st; v.z -= gz / l * st; s = walkSdf(v.x, v.z); }
  if (s >= -0.2 && typeof pip !== 'undefined' && pip) { const px = pip.position.x, pz = pip.position.z; for (let k = 0; k < 12 && s >= -0.2; k++) { v.x += (px - v.x) * 0.35; v.z += (pz - v.z) * 0.35; s = walkSdf(v.x, v.z); } }
  return v;
}
const ISLAND = { a: 20, b: 18, wob: [], cape: null, plaza: 0, walk: 1.5, ring: { rx: 3, rz: 3, w: 0 }, /* no ring road: w 0 (pets still wander round it) */ roads: [], trees: [],
  box: { x0: -GS * 1.5, x1: GS * 1.5, z0: -GS * 1.5, z1: GS * 1.5 }, /* pets keep inside this (grows with the island) */
  d: (x, z) => 1 + drawSdf(x, z) / 6, clamp: wClamp,
  gw: 58, gh: 62, gx: -7.5, gz: -15, /* the ground covers the whole world of islands */
  tint: (x, z, c) => { for (const s of ISLES) { const d = isleSdf(s, x, z); if (d < 1.5) { c.lerp(new T.Color(s.tint[0]), s.tint[1] * clamp(1 - d / 1.5, 0, 1)); return; } } } };
const KENNEL = { x: -1.6, z: -1.5 }; /* the pet's kennel, by the camp in the middle square */
function fresh() { return { v: 1, coins: 0, total: 0, lv: { speed: 0, bag: 0 }, sound: true, moved: false, wx: { rain: 0, next: 150 },
  isle: { own: Array.from(OWN.keys()).filter((k) => OWN[k]), k: 0, paid: {}, tools: { pick: 0, bag: 0 }, chests: {}, got: {}, store: { log: 0, stone: 0, berry: 0 }, open: {}, ext: {} } }; }
const speed = () => 3.2 + 0.45 * state.lv.speed;
const cap = () => (state.isle && state.isle.tools.bag ? 10 : 6);
const UPS = [{ id: 'speed', base: 10, g: 1.8, max: 8 }, { id: 'bag', base: 15, g: 1.8, max: 8 }];
const upCost = (u) => Math.round(u.base * Math.pow(u.g, state.lv[u.id]));
const ITEM_H = { log: 0.17, stone: 0.15, berry: 0.13, hay: 0.16, clay: 0.14 }; /* height of each thing Pip carries in the basket */
/* what the n-th bought square costs (n from 0): logs, stones, berries. Prices go by how many squares are bought, not by where. */
const PRICES = [[3, 0, 0], [4, 0, 0], [4, 2, 0], [5, 2, 0], [5, 3, 0], [6, 3, 0], [6, 3, 2], [7, 4, 0], [8, 4, 0], [8, 5, 0], [9, 5, 0], [10, 5, 3], [10, 6, 0], [11, 6, 0], [12, 6, 0], [12, 7, 4]];
function priceOf(n) { const p = PRICES[n] || [12 + Math.ceil((n - 15) * 0.7), 7 + Math.ceil((n - 15) * 0.4), n % 4 === 0 ? 5 : 0]; return { log: p[0], stone: p[1], berry: p[2] }; }
