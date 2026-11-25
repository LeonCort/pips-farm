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
const GI0 = -9, GWN = 19; /* squares from -9 to 9 along x (i) and along z (j) */
const gIdx = (i, j) => (i - GI0) * GWN + (j - GI0);
const gIn = (i, j) => i >= GI0 && i < GI0 + GWN && j >= GI0 && j < GI0 + GWN;
const gCell = (x) => Math.round(x / GS);
/* the areas: i, j = the square at the low corner of the 3 by 3 block. start: land from the beginning. bridge: reached over a
   bridge from another area (x0, z0 to x1, z1), and drawn from the start so it can be seen across the water. chest: a tool inside. */
const AREAS = [
  { id: 'h0', i: -1, j: -1, biome: 'home', start: 1 },
  { id: 'h1', i: 2, j: -1, biome: 'rocks', cost: { log: 8, berry: 3 }, chest: 'pick' },
  { id: 'h2', i: -1, j: 2, biome: 'berry', cost: { log: 10, stone: 4, berry: 4 } },
  { id: 'h3', i: 2, j: 2, biome: 'rocks', cost: { log: 14, stone: 8, berry: 5 }, chest: 'bag', ruin: [2.3, 1.0, -0.25], stairs: [-2.6, 2.2] },
  { id: 'm0', i: -1, j: -5, biome: 'meadow', cost: { log: 18, stone: 10, berry: 6 }, bridge: { from: 'h0', x0: 0, z0: -5.4, x1: 0, z1: -10.6 } },
  { id: 'm1', i: -4, j: -5, biome: 'meadow', cost: { log: 16, stone: 8, berry: 10 } },
  { id: 'm2', i: 2, j: -6, biome: 'orchard', cost: { log: 20, berry: 12, stone: 10 }, ruin: [0.4, 0, 0.2] },
  { id: 'm3', i: -1, j: -8, biome: 'meadow', cost: { log: 24, stone: 10, berry: 14 } },
  { id: 's0', i: -8, j: -5, biome: 'stone', cost: { log: 28, berry: 14, stone: 16 }, bridge: { from: 'm1', x0: -17.4, z0: -16, x1: -22.6, z1: -16 } },
  { id: 's1', i: -8, j: -8, biome: 'stone', cost: { stone: 30, log: 20, crystal: 4 }, ruin: [0.8, -0.8, 0.3] },
  { id: 's2', i: -8, j: -2, biome: 'clay', cost: { stone: 30, log: 20, berry: 12 } },
  /* the winter island, east of the orchard, over a bridge */
  { id: 'w0', i: 6, j: -6, biome: 'snow', cost: { log: 34, berry: 16, stone: 20 }, bridge: { from: 'm2', x0: 17.4, z0: -16, x1: 22.6, z1: -16 } },
  { id: 'w1', i: 6, j: -9, biome: 'snow', cost: { log: 40, stone: 30, crystal: 8 }, ruin: [-2.5, 1.5, 0] },
  /* the cave under the hill: not bought, reached down the stairs in h3 (cave.js); from outside it is a rocky hill out at sea */
  { id: 'cave', i: 2, j: 7, biome: 'cave', cave: 1 }
];
const AREA_BY = {}; AREAS.forEach((a) => { AREA_BY[a.id] = a; a.cx = (a.i + 1) * GS; a.cz = (a.j + 1) * GS; });
/* what each biome looks like: a tint over the grass */
const BIOME_BEACH = { snow: '#c9dcf2', stone: '#a9a79c', clay: '#b9906e', cave: '#5d5249' }; /* the rim and the cliff under each island */
const BIOME_TINT = { home: null, rocks: ['#c9c58f', 0.18], berry: ['#7fbf5a', 0.15], meadow: ['#b4e05e', 0.24], orchard: ['#d7e07a', 0.2], stone: ['#9fa592', 0.5], clay: ['#c9a27a', 0.38], cave: ['#5d5249', 0.82], snow: ['#cfe0f6', 1] };
/* the land: WALK = squares Pip may walk on (areas owned), LAND = squares drawn as land (owned, plus each island's first area
   so it can be seen across the sea). Both are read from the save right away, because the ground is drawn before the game starts. */
const WALK = new Uint8Array(GWN * GWN), LAND = new Uint8Array(GWN * GWN), AREA_AT = new Int16Array(GWN * GWN).fill(-1);
const HAS = {}; /* areas owned */
/* ?new=1 starts a new island (for testing) */
try { if (/[?&]new=1/.test(location.search)) localStorage.removeItem(SAVE_KEY); } catch (e) {}
function areaSquares(a, f) { for (let i = a.i; i < a.i + 3; i++) for (let j = a.j; j < a.j + 3; j++) f(i, j); }
function areaMark(a) { HAS[a.id] = 1; areaSquares(a, (i, j) => { WALK[gIdx(i, j)] = 1; LAND[gIdx(i, j)] = 1; }); }
AREAS.forEach((a, k) => { areaSquares(a, (i, j) => { AREA_AT[gIdx(i, j)] = k; if (a.bridge || a.cave) LAND[gIdx(i, j)] = 1; }); });
(function () {
  let I = null; try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s && s.v === 1 && s.isle && s.isle.map === MAP_V) I = s.isle; } catch (e) {}
  AREAS.forEach((a) => { if (a.start || a.cave || (I && I.areas && I.areas[a.id])) areaMark(a); });
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
const ISLAND = { a: 20, b: 18, wob: [], cape: null, plaza: 1.95, walk: 1.5, maskW: 1536, maskH: 1536, detW: 2560, detH: 2560, detN: 3, ring: { rx: 3, rz: 3, w: 0 }, /* no ring road: w 0 (pets still wander round it) */ roads: [[0, -1.9, 0, -5.9, 0.5, 1], [-1.9, 0, -3.1, -1.5, 0.38, 1], [1.4, -1.4, 2.7, -1.7, 0.36, 1],
    /* the settlement fills the whole first island (Leon, 2026-11-25): an east street to the smithy (h1), a south street to the bakery (h2), two cross streets that meet at the village green (h3) */
    [1.9, 0, 6, 0, 0.5, 1], [6, 0, 8.4, 2.2, 0.5, 1], [8.4, 2.2, 16.2, 2.2, 0.5, 1], [0, 1.9, 0, 6, 0.5, 1], [0, 6, 1.2, 8, 0.5, 1], [1.2, 8, 1.2, 16.2, 0.5, 1],
    [7.5, 1.5, 7.5, 11, 0.45, 1], [1.0, 7.5, 16.2, 7.5, 0.45, 1], [7.5, 7.5, 7.51, 7.5, 1.7, 2], [15.3, 2.2, 15.3, -0.7, 0.36, 1], [1.2, 15.1, -1.2, 15.1, 0.36, 1]],
  roadOk: (x, z) => { const i = gCell(x), j = gCell(z); return !!WALK[gIdx(i, j)]; }, /* a road shows only on land that is owned */ trees: [],
  box: { x0: -5.4, x1: 5.4, z0: -5.4, z1: 5.4 }, /* pets keep inside this (the area Pip is in) */
  d: (x, z) => 1 + drawSdf(x, z) / 6, clamp: wClamp,
  gw: 76, gh: 76, gx: 0, gz: 0, /* the ground covers the whole world, the cave hill too */
  puddles: [[-2.2, 3.0, 0.9, 0.4], [2.8, -3.2, 0.8, 1.2], [2.9, 3.4, 0.7, 0.2], [-3.3, -0.9, 0.8, 1.5], [0.4, -3.6, 0.6, 0.9]], /* rain puddles in the start area (the farm's lie on its roads) */
  beachAt: (x, z) => { let a = areaAt(x, z); for (let k = 0; !a && k < 4; k++) a = areaAt(x + [1.5, -1.5, 0, 0][k], z + [0, 0, 1.5, -1.5][k]); return a ? BIOME_BEACH[a.biome] : null; },
  tint: (x, z, c) => { const a = areaAt(x, z), t = a && BIOME_TINT[a.biome]; if (t) c.lerp(new T.Color(t[0]), t[1]); } };
/* the settlement fills the whole first area (Leon, 2026-11-25): a cobbled plaza round the campfire in the middle, dirt roads to
   the bridge and to the two neighbour areas, and a home in each corner */
const FIRE = { x: 0, z: 0 }, TENT = { x: -3.3, z: -2.9 };
/* where the settlement's buildings stand (here, because the land is filled before the files that build them are read) */
const FORGE = { x: 14.0, z: -2.6 }, ANVIL = { x: 15.3, z: -2.1 }, SMITH_AT = { x: 15.3, z: -2.62 }, ANVIL_RING = { x: 15.3, z: -1.35 };
const OVEN = { x: -2.0, z: 14.0 }, BAKER_AT = { x: -1.1, z: 14.3 }, OVEN_RING = { x: -2.0, z: 15.1 };
const WELL = { x: 7.5, z: 7.5 };
const BOARD = { x: 3.3, z: -4.75 };
/* the island loop (loop.js): the new friends' houses on the street north of the village green, the monuments (sx/sz: where
   their sign stands, mx/mz: their travel mat), the camp's travel mat by the fire, and where the miner sits in the cave */
const HOUSES = { mason: { x: 11, z: 4.9 }, knitter: { x: 14, z: 4.9 }, miner: { x: 17, z: 4.9 } };
const LOOP_SITES = { harbor: { x: -4.4, z: 9.4, sx: 1.7, sz: 1.3, mx: 1.6, mz: 2.6 }, windmill: { x: 2.6, z: -30, sx: -1.7, sz: 1.5, mx: -2.2, mz: 2.2 },
  lighthouse: { x: -31.4, z: -2.2, sx: 1.8, sz: 1.3, mx: 2.4, mz: -1.0 }, tower: { x: 30.6, z: -34, sx: -1.7, sz: 1.5, mx: -2.0, mz: -1.2 } };
const TRAVEL_HOME = { x: 2.7, z: 2.6 }, CAVE_FRIEND = { x: 8.8, z: 29.2 };
const KENNEL = { x: -1.3, z: -3.7 }; /* the pet's kennel, by the camp in the start area */
function fresh() { return { v: 1, coins: 0, total: 0, lv: { speed: 0, bag: 0 }, sound: true, moved: false, wx: { rain: 0, next: 150 },
  isle: { map: MAP_V, areas: { h0: 1 }, paid: {}, tools: { pick: 0, bag: 0, sickle: 0, shovel: 0 }, chests: {}, ruins: {}, store: { log: 0, stone: 0, berry: 0 } } }; }
const speed = () => (3.2 + 0.45 * state.lv.speed) * gearSlow(); /* deep snow without boots (gear.js) */
const cap = () => (state.isle && state.isle.tools.bag ? 10 : 6) + (state.isle ? dogBags() : 0); /* + the dog's saddlebags (isledog.js) */
const UPS = [{ id: 'speed', base: 10, g: 1.8, max: 8 }, { id: 'bag', base: 15, g: 1.8, max: 8 }];
const upCost = (u) => Math.round(u.base * Math.pow(u.g, state.lv[u.id]));
const ITEM_H = { log: 0.17, stone: 0.15, berry: 0.13, hay: 0.16, clay: 0.14 }; /* height of each thing Pip carries in the basket */
