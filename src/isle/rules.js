/* ---------- Pips Island: the save, the rules, and the world of areas ----------
   A gathering game on the Pips engine. The world is one grid of squares (GS world units each), grouped into AREAS of
   3 by 3 squares. Each unlock raises a whole area out of the sea (Leon, 2026-11-23: every unlock is a big piece, not one square).
   Some areas grow the island Pip is on (a sign at the edge); some are across a strip of sea, another island, which Pip
   can see from the start and reaches by building a bridge. Each area has its own biome: what grows there and its colour.
   The engine draws the ground from ISLAND.d (how far a point is from the coast) and keeps Pip on land with ISLAND.clamp. */
const SAVE_KEY = 'pip-isle-v2'; /* the island's own save; pips-avatar (how Pip looks) is shared with the farm */
const HERE = 'isle';
const MAP_V = 'areas-1'; /* the map's version: a save made for another map starts over */
const GS = 4; /* one square, in world units; an area is 3 by 3 squares (12 by 12) */
const GI0 = -9, GWN = 15; /* squares from -9 to 5 along x (i) and along z (j) */
const gIdx = (i, j) => (i - GI0) * GWN + (j - GI0);
const gIn = (i, j) => i >= GI0 && i < GI0 + GWN && j >= GI0 && j < GI0 + GWN;
const gCell = (x) => Math.round(x / GS);
/* the areas: i, j = the square at the low corner of the 3 by 3 block. start: land from the beginning. bridge: reached over a
   bridge from another area (x0, z0 to x1, z1), and drawn from the start so it can be seen across the water. chest: a tool inside. */
const AREAS = [
  { id: 'h0', i: -1, j: -1, biome: 'home', start: 1 },
  { id: 'h1', i: 2, j: -1, biome: 'rocks', cost: { log: 12, berry: 4 }, chest: 'pick' },
  { id: 'h2', i: -1, j: 2, biome: 'berry', cost: { log: 14, stone: 6, berry: 4 } },
  { id: 'h3', i: 2, j: 2, biome: 'rocks', cost: { log: 18, stone: 10, berry: 6 }, chest: 'bag' },
  { id: 'm0', i: -1, j: -5, biome: 'meadow', cost: { log: 22, stone: 12, berry: 6 }, bridge: { from: 'h0', x0: 0, z0: -5.4, x1: 0, z1: -10.6 } },
  { id: 'm1', i: -4, j: -5, biome: 'meadow', cost: { log: 16, hay: 10, berry: 6 } },
  { id: 'm2', i: 2, j: -6, biome: 'orchard', cost: { log: 20, hay: 14, stone: 8 } },
  { id: 'm3', i: -1, j: -8, biome: 'meadow', cost: { log: 20, hay: 20, berry: 10 } },
  { id: 's0', i: -8, j: -5, biome: 'stone', cost: { log: 28, hay: 16, stone: 14 }, bridge: { from: 'm1', x0: -17.4, z0: -16, x1: -22.6, z1: -16 } },
  { id: 's1', i: -8, j: -8, biome: 'stone', cost: { stone: 24, clay: 10, log: 16 } },
  { id: 's2', i: -8, j: -2, biome: 'clay', cost: { stone: 26, clay: 14, hay: 12 } }
];
const AREA_BY = {}; AREAS.forEach((a) => { AREA_BY[a.id] = a; a.cx = (a.i + 1) * GS; a.cz = (a.j + 1) * GS; });
/* what each biome looks like: a tint over the grass */
const BIOME_TINT = { home: null, rocks: ['#c9c58f', 0.18], berry: ['#7fbf5a', 0.15], meadow: ['#b4e05e', 0.24], orchard: ['#d7e07a', 0.2], stone: ['#9fa592', 0.5], clay: ['#c9a27a', 0.38] };
/* the land: WALK = squares Pip may walk on (areas owned), LAND = squares drawn as land (owned, plus each island's first area
   so it can be seen across the sea). Both are read from the save right away, because the ground is drawn before the game starts. */
const WALK = new Uint8Array(GWN * GWN), LAND = new Uint8Array(GWN * GWN), AREA_AT = new Int16Array(GWN * GWN).fill(-1);
const HAS = {}; /* areas owned */
/* ?new=1 starts a new island (for testing) */
try { if (/[?&]new=1/.test(location.search)) localStorage.removeItem(SAVE_KEY); } catch (e) {}
function areaSquares(a, f) { for (let i = a.i; i < a.i + 3; i++) for (let j = a.j; j < a.j + 3; j++) f(i, j); }
function areaMark(a) { HAS[a.id] = 1; areaSquares(a, (i, j) => { WALK[gIdx(i, j)] = 1; LAND[gIdx(i, j)] = 1; }); }
AREAS.forEach((a, k) => { areaSquares(a, (i, j) => { AREA_AT[gIdx(i, j)] = k; if (a.bridge) LAND[gIdx(i, j)] = 1; }); });
(function () {
  let I = null; try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s && s.v === 1 && s.isle && s.isle.map === MAP_V) I = s.isle; } catch (e) {}
  AREAS.forEach((a) => { if (a.start || (I && I.areas && I.areas[a.id])) areaMark(a); });
})();
const owned = (i, j) => gIn(i, j) && WALK[gIdx(i, j)] === 1;
const drawn = (i, j) => gIn(i, j) && LAND[gIdx(i, j)] === 1;
const areaAt = (x, z) => { const i = gCell(x), j = gCell(z); return gIn(i, j) && AREA_AT[gIdx(i, j)] >= 0 ? AREAS[AREA_AT[gIdx(i, j)]] : null; };
/* distance from a point to square (i, j) (0 inside it) */
function boxD(x, z, i, j) { const dx = Math.max(Math.abs(x - i * GS) - GS / 2, 0), dz = Math.max(Math.abs(z - j * GS) - GS / 2, 0); return Math.hypot(dx, dz); }
/* signed distance to the coast of a set of squares: below 0 on land (how far in), above 0 at sea (how far out) */
function gSdfOf(on, x, z) {
  const ci = gCell(x), cj = gCell(z); let d = 3;
  if (on(ci, cj)) { for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if ((a || b) && !on(ci + a, cj + b)) d = Math.min(d, boxD(x, z, ci + a, cj + b)); return -d; }
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (on(ci + a, cj + b)) d = Math.min(d, boxD(x, z, ci + a, cj + b));
  return d;
}
const gSdf = (x, z) => gSdfOf(owned, x, z);
const drawSdf = (x, z) => gSdfOf(drawn, x, z);
/* where Pip may walk: owned areas, and the bridges built to them */
function walkSdf(x, z) {
  let d = gSdf(x, z);
  for (const a of AREAS) if (a.bridge && HAS[a.id]) { const b = a.bridge; d = Math.min(d, segD(x, z, b.x0, b.z0, b.x1, b.z1) - 0.72); }
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
  box: { x0: -5.4, x1: 5.4, z0: -5.4, z1: 5.4 }, /* pets keep inside this (the area Pip is in) */
  d: (x, z) => 1 + drawSdf(x, z) / 6, clamp: wClamp,
  gw: 60, gh: 60, gx: -8, gz: -8, /* the ground covers the whole world */
  tint: (x, z, c) => { const a = areaAt(x, z), t = a && BIOME_TINT[a.biome]; if (t) c.lerp(new T.Color(t[0]), t[1]); } };
const KENNEL = { x: -1.6, z: -1.5 }; /* the pet's kennel, by the camp in the start area */
function fresh() { return { v: 1, coins: 0, total: 0, lv: { speed: 0, bag: 0 }, sound: true, moved: false, wx: { rain: 0, next: 150 },
  isle: { map: MAP_V, areas: { h0: 1 }, paid: {}, tools: { pick: 0, bag: 0 }, chests: {}, store: { log: 0, stone: 0, berry: 0 } } }; }
const speed = () => 3.2 + 0.45 * state.lv.speed;
const cap = () => (state.isle && state.isle.tools.bag ? 10 : 6);
const UPS = [{ id: 'speed', base: 10, g: 1.8, max: 8 }, { id: 'bag', base: 15, g: 1.8, max: 8 }];
const upCost = (u) => Math.round(u.base * Math.pow(u.g, state.lv[u.id]));
const ITEM_H = { log: 0.17, stone: 0.15, berry: 0.13, hay: 0.16, clay: 0.14 }; /* height of each thing Pip carries in the basket */
