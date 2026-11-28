/* ---------- Pips Island: the save, the rules, and the world of areas ----------
   A gathering game on the Pips engine. The world is one grid of squares (GS world units each), grouped into AREAS of
   3 by 3 squares. Each unlock raises a whole area out of the sea (Leon, 2026-11-23: every unlock is a big piece, not one square).
   Some areas grow the island Pip is on (a sign at the edge); some are across a strip of sea, another island, which Pip
   can see from the start and reaches by building a bridge. Each area has its own biome: what grows there and its colour.
   The engine draws the ground from ISLAND.d (how far a point is from the coast) and keeps Pip on land with ISLAND.clamp. */
const SHOW = /[?&]show=1\b/.test(location.search); /* the asset yard (show.js): its own save, everything built, an empty lawn on the meadow */
const SHOW_YARD = { m0: 1, m1: 1 };
const SHOW_T = { tier: 0 }; /* the asset yard asks for a tree or rock of a given tier */
const SAVE_KEY = SHOW ? 'pip-isle-show' : 'pip-isle-v2'; /* the island's own save; pips-avatar (how Pip looks) is shared with the farm */
const HERE = 'isle';
const MAP_V = 'areas-2'; /* the map's version: a save made for another map starts over */
const GS = 4; /* one square, in world units; an area is 3 by 3 squares (12 by 12) */
const GI0 = -15, GWN = 31; /* squares from -15 to 15 along x (i) and along z (j) (2026-11-27: was -9 to 9, the islands grew) */
const gIdx = (i, j) => (i - GI0) * GWN + (j - GI0);
const gIn = (i, j) => i >= GI0 && i < GI0 + GWN && j >= GI0 && j < GI0 + GWN;
const gCell = (x) => Math.round(x / GS);
/* the areas: i, j = the square at the low corner of the 3 by 3 block. start: land from the beginning. bridge: reached over a
   bridge from another area (x0, z0 to x1, z1), and drawn from the start so it can be seen across the water. chest: a tool inside. */
/* the hidden worlds plug in here (secret.js says how) */
const ISLE_STEPS = [], ISLE_KEEPS = [], ISLE_KEYS = [], ISLE_GATE = {}, SECRET_FILL = {}, ISLE_ICON = {};
const NO_BASKET = true; /* nothing is carried on the island: Pip has no carrying frame on the back (engine/pip2.js) */
const AREAS = [
  { id: 'h0', i: -1, j: -1, biome: 'home', start: 1 },
  { id: 'h1', i: 2, j: -1, biome: 'rocks', cost: { log: 8, berry: 3 }, chest: 'pick' },
  { id: 'h2', i: -1, j: 2, biome: 'berry', cost: { log: 10, stone: 4, berry: 4 } },
  { id: 'h3', i: 2, j: 2, biome: 'rocks', cost: { log: 14, stone: 8, berry: 5 }, chest: 'bag', ruin: [2.3, 1.0, -0.25], stairs: [-2.6, 2.2] },
  { id: 'm0', chest: { coin: 8, berry: 6 }, i: -1, j: -5, biome: 'meadow', cost: { log: 18, stone: 10, berry: 6 }, finds: [['hive', -3.6, -2.0], ['hive', 3.7, -3.5], ['hive', 4.3, 4.9]], tall: [[-5.4, 1.5, 5.4, 3.9]], bridge: { from: 'h0', x0: 0, z0: -5.4, x1: 0, z1: -10.6 } },
  { id: 'm1', chest: { coin: 10, berry: 8, gear: 'coat' }, chestAt: [-0.4, 3.4], i: -4, j: -5, biome: 'meadow', cost: { log: 16, stone: 8, berry: 10 }, finds: [['hive', -2.0, -3.4], ['hive', -3.0, 2.6]], tall: [[1.5, -5.4, 3.9, 5.4]] },
  { id: 'm2', i: 2, j: -6, biome: 'orchard', cost: { log: 20, berry: 12, stone: 10 }, ruin: [0.4, 0, 0.2] },
  { id: 'm3', i: -1, j: -8, biome: 'meadow', cost: { log: 24, stone: 10, berry: 14 }, tall: [[-5.4, 1.5, 5.4, 3.9]] },
  { id: 'm4', chest: { coin: 15, honey: 2 }, chestAt: [3.2, 2.6], i: -4, j: -8, biome: 'meadow', cost: { log: 30, berry: 20, stone: 14 }, finds: [['hive', 3.4, -3.6], ['hive', -3.8, 3.2]], tall: [[3.4, -5.4, 5.4, -1.6]], ponds: [[-1.6, 0.6, 2.0]] },
  /* the stone island has no bridge: the only way there is the mine's tunnel under the sea, and the lift at its end (cave.js) */
  { id: 's0', i: -8, j: -5, biome: 'stone', cost: { log: 28, berry: 14, stone: 16 }, lift: [3.4, 0], mesas: [{ id: 's0a', dx: -2.8, dz: -2.6, w: 4.6, d: 4.0, h: 1.3, finds: [['iron', -0.8, -0.3], ['iron', 0.9, 0.1]] }] },
  { id: 's1', i: -8, j: -8, biome: 'stone', cost: { stone: 30, log: 20, crystal: 4 }, ruin: [0.8, -0.8, 0.3], mesas: [{ id: 's1a', dx: -2.7, dz: 2.6, w: 5.0, d: 4.6, h: 1.3, lx: 1.4, finds: [['iron', 1.2, 0.5]] }, { id: 's1b', par: 's1a', dx: -3.7, dz: 1.9, w: 2.8, d: 2.9, h: 1.2, finds: [['iron', 0, -0.1]] }] },
  { id: 's2', i: -8, j: -2, biome: 'clay', cost: { stone: 30, log: 20, berry: 12 }, finds: [['iron', -3.2, -2.2]] },
  /* the islands grew (Leon, 2026-11-27: every island at least five squares): the stone island runs on west */
  { id: 's3', chest: { coin: 18, iron: 2 }, chestAt: [-2.6, -0.6], i: -11, j: -5, biome: 'stone', cost: { stone: 40, log: 26, berry: 16 }, mesas: [{ id: 's3a', dx: 2.4, dz: 2.6, w: 4.8, d: 4.2, h: 1.3, finds: [['iron', -0.9, 0.2], ['iron', 1.0, -0.3]] }], finds: [['iron', -3.6, -3.4]] },
  { id: 's4', chest: { coin: 22, crystal: 5 }, chestAt: [3.6, 2.4], i: -11, j: -8, biome: 'clay', cost: { stone: 50, log: 30, crystal: 6 }, finds: [['iron', 3.0, -2.6], ['iron', -3.4, 2.8]], ponds: [[0.6, 0.8, 1.7]],
    /* the High Table (mesa.js): the tallest rock on the island, its ladder broken. A rope ladder of marsh reed opens it: the island's sealed place, for the visit after the marsh */
    mesas: [{ id: 's4a', dx: -2.9, dz: -2.7, w: 4.8, d: 4.0, h: 2.3, seal: { reed: 6, log: 14 }, chest: [{ coin: 40, iron: 4 }, -1.3, -0.9], finds: [['iron', 1.2, -0.6], ['iron', 0.3, 0.9], ['iron', -1.2, 0.8]] }] },
  /* the winter island, east of the orchard, over a bridge */
  { id: 'w0', i: 6, j: -6, biome: 'snow', cost: { log: 34, berry: 16, stone: 20 }, bridge: { from: 'm2', x0: 17.4, z0: -16, x1: 22.6, z1: -16 },
    ice: { dx: 0.5, dz: -0.4, nx: 7, nz: 6, stop: [[0, 2], [6, 2], [3, 0], [3, 5], [0, 3], [1, 4], [4, 3]], gem: [[3, 2]] } },
  { id: 'w1', i: 6, j: -9, biome: 'snow', cost: { log: 40, stone: 30, crystal: 8 }, ruin: [-2.5, 1.5, 0], finds: [['frostflower', -4.6, -0.4]] },
  { id: 'w2', chest: { coin: 20, crystal: 6 }, i: 9, j: -6, biome: 'snow', cost: { log: 44, stone: 34, berry: 20 }, finds: [['frostflower', -4.2, -3.8], ['frostflower', 1.0, -2.2]] },
  { id: 'w3', chest: { coin: 25, crystal: 8 }, i: 9, j: -9, biome: 'snow', cost: { log: 50, stone: 40, crystal: 10 }, finds: [['frostflower', -4.2, 2.6], ['frostflower', 3.8, -3.8]] },
  { id: 'w4', chest: { coin: 35, crystal: 12 }, i: 9, j: -12, biome: 'snow', cost: { log: 60, stone: 44, crystal: 12 }, finds: [['frostflower', -4.2, 3.8], ['frostflower', 2.4, -0.6]] },
  /* the marsh island, west of the bakery over a bridge (marsh.js). holes: squares of the block that stay water. A channel
     runs through the first square from north to south: the only way over is the pole raft. The second has a pond. */
  { id: 'r0', i: -5, j: 2, biome: 'marsh', cost: { log: 30, stone: 18, berry: 14 }, holes: [[1, 0], [1, 1], [1, 2]], finds: [['reeds', -4.7, -3.4], ['reeds', -3.1, -0.4], ['reeds', -4.8, 1.6]], bridge: { from: 'h2', x0: -5.4, z0: 16.6, x1: -10.6, z1: 16.6 } },
  { id: 'r1', i: -8, j: 2, biome: 'marsh', cost: { log: 36, stone: 24, crystal: 4 }, holes: [[1, 1]], ruin: [4.3, -3.0, 0.1], finds: [['reeds', -2.7, -1.6], ['reeds', 2.8, 1.2], ['reeds', 0.8, 3.0], ['reeds', -1.2, -3.1]] },
  { id: 'r2', chest: { coin: 18, reed: 3, gear: 'boots' }, chestAt: [3.6, -3.6], i: -8, j: 5, biome: 'marsh', cost: { log: 40, stone: 26, berry: 18 }, holes: [[1, 1]], finds: [['reeds', -2.6, 0.4], ['reeds', 2.7, -0.6], ['reeds', 0.3, 2.8]] },
  { id: 'r3', chest: { coin: 22, crystal: 4 }, chestAt: [2.8, 0.2], i: -11, j: 2, biome: 'marsh', cost: { log: 46, stone: 30, crystal: 6 }, holes: [[0, 1]], finds: [['reeds', -1.4, -1.8], ['reeds', -1.2, 2.2]] },
  { id: 'r4', chest: { coin: 28, reed: 4 }, chestAt: [-3.4, -3.4], i: -11, j: 5, biome: 'marsh', cost: { log: 52, stone: 34, reed: 4 }, holes: [[1, 1], [2, 2]], finds: [['reeds', -2.7, 0.2], ['reeds', 0.2, -2.7], ['reeds', 2.6, 1.4], ['reeds', 1.0, 2.8]] },
  /* the coral beach, east of the village green over a bridge (coral.js). Its second square is an islet across a strait:
     the way there is a row of stepping stones that the tide covers and bares again (bridge.tide) */
  { id: 'c0', i: 6, j: 2, biome: 'coral', cost: { log: 44, stone: 30, crystal: 6 }, finds: [['clam', 3.6, 3.8], ['clam', -3.8, 2.6]], bridge: { from: 'h3', x0: 17.4, z0: 7.5, x1: 22.6, z1: 7.5 } },
  { id: 'c1', i: 6, j: -2, biome: 'coral', cost: { stone: 40, log: 30, crystal: 10 }, ruin: [2.8, 0.6, -0.2], finds: [['clam', -3.5, -3.0], ['clam', 3.4, -2.2], ['clam', 0.5, -4.2], ['clam', -2.6, 1.8]], bridge: { from: 'c0', x0: 28, z0: 6.6, x1: 28, z1: 1.4, tide: 1 } },
  { id: 'c2', chest: { coin: 24, pearl: 1 }, i: 9, j: 2, biome: 'coral', cost: { log: 50, stone: 36, crystal: 8 }, finds: [['clam', 3.9, -3.6], ['clam', -2.4, 4.0]] },
  { id: 'c3', chest: { coin: 30, pearl: 2 }, chestAt: [-3.4, -0.4], i: 12, j: 2, biome: 'coral', cost: { stone: 50, log: 40, crystal: 12 }, finds: [['clam', 4.2, 0.4], ['clam', 3.0, 4.0], ['clam', -1.0, -4.2]], ponds: [[0.2, 0.4, 2.3]] },
  { id: 'c4', chest: { coin: 36, crystal: 8 }, i: 9, j: -2, biome: 'coral', cost: { stone: 56, log: 44, pearl: 2 }, finds: [['clam', 4.0, -3.4], ['clam', 0.6, 4.2], ['clam', 4.2, 2.2]] },
  /* the ember island, south of the coral beach over a bridge that costs pearls (ember.js): one square under a volcano,
     cut in three by two streams of lava (EMBER below) */
  { id: 'e0', i: 6, j: 6, biome: 'ember', cost: { pearl: 4, log: 50, stone: 40 }, ruin: [-3.8, 4.2, 0.2], finds: [['cinder', 4.6, 0.6], ['cinder', 4.9, 3.4], ['cinder', 3.6, 5.0]], bridge: { from: 'c0', x0: 28, z0: 17.4, x1: 28, z1: 22.6 } },
  /* the rest of the ember island: ash fields round the volcano's foot (biome 'ash': set out by seed like any other land) */
  { id: 'e1', chest: { coin: 30, ember: 1, gear: 'lantern' }, i: 9, j: 6, biome: 'ash', cost: { log: 56, stone: 46, crystal: 10 }, finds: [['cinder', 3.2, -3.4], ['cinder', -3.0, 3.6]] },
  { id: 'e2', chest: { coin: 34, crystal: 10 }, i: 6, j: 9, biome: 'ash', cost: { stone: 60, log: 50, crystal: 12 }, finds: [['cinder', -3.6, 3.0], ['cinder', 2.6, 3.8]] },
  { id: 'e3', chest: { coin: 40, ember: 2 }, chestAt: [-3.2, 2.6], i: 9, j: 9, biome: 'ash', cost: { stone: 64, log: 54, ember: 2 }, finds: [['cinder', 3.4, 3.2], ['cinder', -3.4, -2.6], ['cinder', 0.4, 4.2]], ponds: [[0.4, 0, 1.8]] },
  { id: 'e4', chest: { coin: 50, ember: 2, pearl: 2 }, i: 12, j: 6, biome: 'ash', cost: { stone: 70, log: 60, ember: 3 }, finds: [['cinder', 3.8, -2.8], ['cinder', 2.4, 3.6], ['cinder', -3.0, -3.6]] },
  /* the cave under the hill: not bought, reached down the stairs in h3 (cave.js); from outside it is a rocky hill out at sea */
  { id: 'cave', i: 2, j: 7, biome: 'cave', cave: 1 },
  /* the mine runs on west under the sea: a gallery behind rubble, then the lift room behind a rockfall */
  { id: 'cave2', i: -1, j: 7, biome: 'cave', cave: 1, finds: [['copper', -3.5, -3.4], ['copper', -1.0, -4.0], ['copper', 2.6, -3.3], ['copper', 3.4, 3.3], ['copper', -3.2, 3.5]] },
  { id: 'cave3', i: -4, j: 7, biome: 'cave', cave: 1, finds: [['glow', 2.6, -3.6], ['glow', -0.8, -4.1], ['glow', 3.5, 3.4]] },
  /* the hidden worlds (Leon, 2026-11-28; secret.js): no sign, not on the map, each rises from the sea when its island's sealed
     place is opened with something from another island. ALWAYS add new areas at the end: every area's random layout hangs on its place in this list. */
  { id: 'm5', i: -4, j: -11, biome: 'meadow', secret: 1 }, /* the Garden of Giant Flowers, behind the Bee Queen's garden (giant.js) */
  { id: 's5', i: -14, j: -8, biome: 'stone', secret: 1 }, /* the Giant's Sky Garden, west of the High Table (sky.js) */
  { id: 'w5', i: 12, j: -9, biome: 'snow', secret: 1 }, /* the Summer Hollow, behind the ice wall (hollow.js) */
  { id: 'r5', i: -8, j: 8, biome: 'marsh', secret: 1 }, /* Heron Isle and the Firefly Tree, across Lily Lake (heron.js) */
  { id: 'c5', i: 12, j: -2, biome: 'coral', secret: 1 }, /* the Sea Garden, under the lagoon (seagarden.js) */
  { id: 'e5', i: 12, j: 9, biome: 'ash', secret: 1 } /* the Glass Forest, past the great lava river (glass.js) */
];
/* shortcuts (Leon, 2026-11-27): the first way to a far place may be long, but once Pip has reached it a short way back
   opens by itself. Each is a plank bridge between two areas that builds itself, free, when both are owned (isle.js).
   The stone island: the mine and its lift are the first way there; after that a bridge runs to the west meadow. */
/* the Bee Queen's walled garden in the far corner of the meadow (garden.js): the wall's box, the gate's place along the east wall, the hive and the chest inside */
const GARDEN = { A: 'm4', x0: -16.9, x1: -11.3, z0: -32.9, z1: -29.5, gate: -31.2, hive: [-15.6, -31.2], chest: [-13.2, -32.3] };
const SHORTS = [{ id: 'sm', need: ['s0', 'm1'], bridge: { x0: -22.6, z0: -12.2, x1: -17.4, z1: -12.2 } }];
/* the special finds (finds.js): what each find node gives, how many, and the tool level it needs */
const FINDS = ['honey', 'copper', 'iron', 'glow', 'reed', 'pearl', 'ember', 'frost'];
const FIND_NODE = { hive: { t: 'honey', n: 1, tier: 1 }, copper: { t: 'copper', n: 2, tier: 1 }, iron: { t: 'iron', n: 2, tier: 2 }, glow: { t: 'glow', n: 1, tier: 3 }, reeds: { t: 'reed', n: 2, tier: 1, hand: 1 }, clam: { t: 'pearl', n: 1, tier: 1, hand: 1 }, cinder: { t: 'ember', n: 1, tier: 3 } };
/* the ember island (ember.js): the volcano in its corner, the two lava streams (the points each runs through), and where
   each can be cooled into a crossing (a, b: the ends of the slab; ring: where Pip stands to cool it; n: crystals it takes) */
const EMBER = { cone: [32.2, 23.8, 2.4], lava: [[[30.6, 25.6], [27.2, 27.2], [24, 27.6], [21.4, 29.8]], [[32.0, 26.2], [30.2, 29.5], [29.6, 34.6]]],
  cross: [{ id: 'a', a: [25.6, 26.3], b: [25.6, 28.5], ring: [25.6, 25.75], n: 6 }, { id: 'b', a: [28.9, 31.4], b: [31.1, 31.7], ring: [28.3, 31.35], n: 10 }], cool: {} };
/* how far a point is from the nearest lava (below 0: in it), not counting where a cooled slab lies */
function emberLava(x, z) {
  for (const c of EMBER.cross) if (EMBER.cool[c.id] && segD(x, z, c.a[0], c.a[1], c.b[0], c.b[1]) < 0.8) return 1;
  let d = 9; for (const L of EMBER.lava) for (let k = 0; k + 1 < L.length; k++) d = Math.min(d, segD(x, z, L[k][0], L[k][1], L[k + 1][0], L[k + 1][1]) - 0.75);
  return d;
}
const TIDE = { low: true, u: 0 }; /* the coral beach's tide (coral.js): low = the stepping stones are bare */
FIND_NODE.hive.hand = 1;
FIND_NODE.frostflower = { t: 'frost', n: 1, tier: 1, hand: 1 }; /* frost flowers in the winter island's snow (hollow.js) */
/* the marsh raft (marsh.js): where it lies at the east bank and at the west bank, and where it is now (on: lying still, so Pip may step on) */
const RAFT = { e: [-14.95, 7.6], w: [-17.05, 16.4], x: -14.95, z: 7.6, on: true };
/* a square's chest: a tool (a word) or a treasure (what is inside). Every square holds something worth the price (Leon,
   2026-11-27): a friend, a wonder, a way on, or at least a treasure chest. It stands in the middle unless chestAt says where. */
const chestAt = (a) => (a.chestAt ? [a.cx + a.chestAt[0], a.cz + a.chestAt[1]] : [a.cx, a.cz - 0.4]);
const AREA_BY = {}; AREAS.forEach((a) => { AREA_BY[a.id] = a; a.cx = (a.i + 1) * GS; a.cz = (a.j + 1) * GS; });
/* what each biome looks like: a tint over the grass */
const BIOME_BEACH = { ember: '#4a403a', ash: '#4a403a', coral: '#f6e7bd', marsh: '#8f8259', snow: '#c9dcf2', stone: '#a9a79c', clay: '#b9906e', cave: '#5d5249' }; /* the rim and the cliff under each island */
const BIOME_TINT = { home: null, rocks: ['#c9c58f', 0.18], berry: ['#7fbf5a', 0.15], meadow: ['#b4e05e', 0.24], orchard: ['#d7e07a', 0.2], stone: ['#9fa592', 0.5], clay: ['#c9a27a', 0.38], cave: ['#5d5249', 0.82], snow: ['#cfe0f6', 1], marsh: ['#5f8f4c', 0.5], coral: ['#f1dfae', 0.92], ember: ['#403936', 0.93], ash: ['#4d4440', 0.9] };
/* the land: WALK = squares Pip may walk on (areas owned), LAND = squares drawn as land (owned, plus each island's first area
   so it can be seen across the sea). Both are read from the save right away, because the ground is drawn before the game starts. */
const WALK = new Uint8Array(GWN * GWN), LAND = new Uint8Array(GWN * GWN), AREA_AT = new Int16Array(GWN * GWN).fill(-1);
const HAS = {}; /* areas owned */
/* ?new=1 starts a new island (for testing) */
try { if (/[?&]new=1/.test(location.search)) localStorage.removeItem(SAVE_KEY); } catch (e) {}
function areaSquares(a, f) { for (let i = a.i; i < a.i + 3; i++) for (let j = a.j; j < a.j + 3; j++) { if (a.holes && a.holes.some((h) => h[0] === i - a.i && h[1] === j - a.j)) continue; f(i, j); } }
function areaMark(a) { HAS[a.id] = 1; areaSquares(a, (i, j) => { WALK[gIdx(i, j)] = 1; LAND[gIdx(i, j)] = 1; }); if (typeof seaShoreDirty === 'function') seaShoreDirty(); }
AREAS.forEach((a, k) => { areaSquares(a, (i, j) => { AREA_AT[gIdx(i, j)] = k; if (a.bridge || a.cave || a.lift) LAND[gIdx(i, j)] = 1; }); });
if (SHOW) try { const s = fresh(), I = s.isle; AREAS.forEach((a) => { if (!a.cave) I.areas[a.id] = 1; }); I.ruins = { h3: 1, s1: 1, w1: 1 }; I.folk = { smith: 3, baker: 3, mason: 3, knitter: 3, miner: 3 };
  I.mon = { harbor: 1, windmill: 1, lighthouse: 1, tower: 1 }; I.keys = { rope: 2, map: 2, icepick: 2 }; I.done = 1; I.bld = { tent: 1, fire: 1, tool: 3, dog: 2, torch: 1, coat: 1, boots: 1 }; I.tools.pick = 1; I.seen = { torch: 1, coat: 1, boots: 1 };
  localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) {}
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
function gSdfBox(on, x, z) {
  const ci = gCell(x), cj = gCell(z); let d = 3;
  if (on(ci, cj)) { for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if ((a || b) && !on(ci + a, cj + b)) d = Math.min(d, boxD(x, z, ci + a, cj + b)); return -d; }
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (on(ci + a, cj + b)) d = Math.min(d, boxD(x, z, ci + a, cj + b));
  return d;
}
/* ---------- a coast that is not a ruler line (Leon, 2026-11-27) ----------
   The land is still bought in squares, but where a square's edge faces open sea the coast now wanders: coves cut in (up to
   1.8 m), small capes reach out (up to 0.9 m), and a square may hold a pond (area.ponds: [dx, dz, r]). It is one fixed
   field over the world (COAST.F, a value every half metre, made once): metres to add to the square coast's distance.
   The field is 0 where the coast must stay as it was: next to another area (a square bought later must meet this one in a
   straight line, and its sign stands there), in the mine, and round everything that stands near a shore (COAST.keep). */
const COAST = { st: 0.5, x0: (GI0 - 0.5) * GS - 2, n: 0, F: null,
  /* things set by hand near a shore that the lists below do not know: [x, z, r] */
  keep: [[0, 0, 3.4]] };
for (let k = 0; k < 8; k++) COAST.keep.push([52 + Math.cos(k * 0.7854) * 5.2, -32 + Math.sin(k * 0.7854) * 5.2, 1.5]); COAST.keep.push([47.2, -37, 1.4], [47.2, -27, 1.4]); /* the Summer Hollow's rim and its two west corners (hollow.js) */
const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function coastMake() {
  const st = COAST.st, n = COAST.n = Math.ceil((GWN * GS + 4) / st) + 1, F = COAST.F = new Float32Array(n * n), K = COAST.keep.slice();
  AREAS.forEach((a) => { const P = (dx, dz, r) => K.push([a.cx + dx, a.cz + dz, r]);
    if (a.bridge) { const b = a.bridge; K.push([b.x0, b.z0, 3], [b.x1, b.z1, 3]); }
    (a.finds || []).forEach((f) => P(f[1], f[2], 1.9)); if (a.ruin) P(a.ruin[0], a.ruin[1], 2.8); if (a.lift) P(a.lift[0], a.lift[1], 3.2); if (a.stairs) P(a.stairs[0], a.stairs[1], 2.6); if (a.chest) { const c = chestAt(a); K.push([c[0], c[1], 1.8]); }
    (a.mesas || []).forEach((m) => { if (!m.par) P(m.dx, m.dz, Math.hypot(m.w, m.d) / 2 + 0.8); }); if (a.ice) P(a.ice.dx, a.ice.dz, Math.hypot(a.ice.nx, a.ice.nz) / 2 + 1.2); });
  SHORTS.forEach((S) => { const b = S.bridge; K.push([b.x0, b.z0, 3], [b.x1, b.z1, 3]); });
  K.push([FERRY.x - 1.5, FERRY.z, 4], [TENT.x, TENT.z, 2.2], [RAFT.e[0], RAFT.e[1], 3.4], [RAFT.w[0], RAFT.w[1], 3.4], [EMBER.cone[0], EMBER.cone[1], EMBER.cone[2] + 2]); EMBER.lava.forEach((L) => L.forEach((q) => K.push([q[0], q[1], 2.2]))); EMBER.cross.forEach((c) => K.push([c.ring[0], c.ring[1], 2]));
  Object.values(DOCKS).forEach((D) => K.push([D.x, D.z, 2.6]));
  for (let k = 0; k <= 4; k++) K.push([GARDEN.x0 + (GARDEN.x1 - GARDEN.x0) * k / 4, GARDEN.z0, 2.2], [GARDEN.x0, GARDEN.z0 + (GARDEN.z1 - GARDEN.z0) * k / 4, 2.2]);
  Object.values(LOOP_SITES).forEach((m) => K.push([m.x, m.z, 2.6], [m.x + m.sx, m.z + m.sz, 1.2], [m.x + m.mx, m.z + m.mz, 1.4])); Object.values(HAMLET_AT).forEach((H) => { H.h.forEach((h) => K.push([h[0], h[1], 1.7])); K.push([H.crate[0], H.crate[1], 2]); });
  TRAILS.forEach((L) => { for (let k = 0; k + 1 < L.length; k++) { const m = Math.max(1, Math.ceil(Math.hypot(L[k + 1][0] - L[k][0], L[k + 1][1] - L[k][1]) / 1.2)); for (let j = 0; j <= m; j++) K.push([L[k][0] + (L[k + 1][0] - L[k][0]) * j / m, L[k][1] + (L[k + 1][1] - L[k][1]) * j / m, 1.1]); } });
  const at = (i, j) => (gIn(i, j) ? AREA_AT[gIdx(i, j)] : -1);
  for (let q = 0; q < n; q++) for (let p = 0; p < n; p++) {
    const x = COAST.x0 + p * st, z = COAST.x0 + q * st, ci = gCell(x), cj = gCell(z); let A0 = -1, d0 = 9;
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const k = at(ci + a, cj + b); if (k < 0) continue; const d = boxD(x, z, ci + a, cj + b); if (d < d0) { d0 = d; A0 = k; } }
    if (A0 < 0 || AREAS[A0].cave) continue;
    let dO = 9; for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) { const k = at(ci + a, cj + b); if (k >= 0 && k !== A0) dO = Math.min(dO, boxD(x, z, ci + a, cj + b)); }
    let amp = sstep(0.8, 3.2, dO); if (amp <= 0) continue;
    for (const [kx, kz, r] of K) { const d = Math.hypot(x - kx, z - kz); if (d < r + 1.8) { amp *= sstep(r, r + 1.8, d); if (amp <= 0) break; } }
    if (amp <= 0) continue;
    const w = Math.sin(x * 0.55 + Math.sin(z * 0.31) * 1.9 + 1.3) * Math.cos(z * 0.47 - Math.sin(x * 0.23) * 1.6) * 1.25 + Math.sin(x * 1.3 - z * 0.9 + 0.7) * 0.3 + Math.sin(z * 1.7 + x * 0.4) * 0.22, v = clamp(w, -1, 1);
    F[q * n + p] = (v > 0 ? v * 1.8 : v * 0.9) * amp;
  }
}
function coastW(x, z) {
  if (!COAST.F) coastMake();
  const n = COAST.n, fx = (x - COAST.x0) / COAST.st, fz = (z - COAST.x0) / COAST.st, i = Math.floor(fx), j = Math.floor(fz); if (i < 0 || j < 0 || i >= n - 1 || j >= n - 1) return 0;
  const u = fx - i, v = fz - j, F = COAST.F, o = j * n + i; return (F[o] * (1 - u) + F[o + 1] * u) * (1 - v) + (F[o + n] * (1 - u) + F[o + n + 1] * u) * v;
}
function gSdfOf(on, x, z) {
  let d = gSdfBox(on, x, z) + coastW(x, z);
  if (d < 0) { const ci = gCell(x), cj = gCell(z), k = gIn(ci, cj) ? AREA_AT[gIdx(ci, cj)] : -1, A = k >= 0 ? AREAS[k] : null;
    if (A && A.ponds) for (const [dx, dz, r] of A.ponds) { const ox = x - A.cx - dx, oz = z - A.cz - dz; d = Math.max(d, r + 0.28 * Math.sin(Math.atan2(oz, ox) * 3 + dx) - Math.hypot(ox, oz)); } }
  return d;
}
/* how far a point is inside the land there can ever be (every area bought): what grows or stands by seed asks this, so
   nothing lands in a cove or a pond */
const landSdf = (x, z) => gSdfOf((i, j) => gIn(i, j) && AREA_AT[gIdx(i, j)] >= 0, x, z);
const gSdf = (x, z) => gSdfOf(owned, x, z);
const drawSdf = (x, z) => gSdfOf(drawn, x, z);
/* where Pip may walk: owned areas, and the bridges built to them */
function walkSdf(x, z) {
  let d = gSdf(x, z);
  d = Math.min(d, segD(x, z, FERRY.x, FERRY.z, FERRY.x - 3.0, FERRY.z) - 0.55); /* the farm boat's dock: its pad is out on the planks (ferry.js) */
  for (const a of AREAS) if (a.bridge && HAS[a.id] && (!a.bridge.tide || TIDE.low)) { const b = a.bridge; d = Math.min(d, segD(x, z, b.x0, b.z0, b.x1, b.z1) - 0.72); }
  for (const S of SHORTS) if (S.on) { const b = S.bridge; d = Math.min(d, segD(x, z, b.x0, b.z0, b.x1, b.z1) - 0.72); }
  for (const k in DOCK_ON) { const D = DOCKS[k]; d = Math.min(d, segD(x, z, D.x - D.out[0] * 0.5, D.z - D.out[1] * 0.5, D.x + D.out[0] * 1.55, D.z + D.out[1] * 1.55) - 0.5); } /* out along a dock's planks */
  if (HAS.r0) { d = Math.min(d, segD(x, z, RAFT.e[0] + 1.5, RAFT.e[1], RAFT.e[0] + 0.5, RAFT.e[1]) - 0.6, segD(x, z, RAFT.w[0] - 1.5, RAFT.w[1], RAFT.w[0] - 0.5, RAFT.w[1]) - 0.6); /* the raft's two jetties, and the raft while it lies still */
    if (RAFT.on) d = Math.min(d, Math.hypot(x - RAFT.x, z - RAFT.z) - 0.85); }
  if (HAS.e0 && x > 21 && z > 21) d = Math.max(d, -emberLava(x, z) - 0.2, EMBER.cone[2] - Math.hypot(x - EMBER.cone[0], z - EMBER.cone[1]) - 0.2); /* lava and the volcano are no ground to walk on */
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
const ISLAND = { a: 20, b: 18, wob: [], cape: null, plaza: 1.95, walk: 1.5, maskW: 2048, maskH: 2048, detW: 3072, detH: 3072, detN: 5, sea: 232, maskSoft: 1, ring: { rx: 3, rz: 3, w: 0 }, /* no ring road: w 0 (pets still wander round it) */ roads: [[0, -1.9, 0, -5.9, 0.5, 1], [-1.9, 0, -3.1, -1.5, 0.38, 1], [1.4, -1.4, 2.7, -1.7, 0.36, 1],
    /* the settlement fills the whole first island (Leon, 2026-11-25): an east street to the smithy (h1), a south street to the bakery (h2), two cross streets that meet at the village green (h3) */
    [1.9, 0, 6, 0, 0.5, 1], [6, 0, 8.4, 2.2, 0.5, 1], [8.4, 2.2, 16.2, 2.2, 0.5, 1], [0, 1.9, 0, 6, 0.5, 1], [0, 6, 1.2, 8, 0.5, 1], [1.2, 8, 1.2, 16.2, 0.5, 1],
    [7.5, 1.5, 7.5, 11, 0.45, 1], [1.0, 7.5, 16.2, 7.5, 0.45, 1], [7.5, 7.5, 7.51, 7.5, 1.7, 2], [15.3, 2.2, 15.3, -0.7, 0.36, 1], [1.2, 15.1, -1.2, 15.1, 0.36, 1]],
  roadOk: (x, z) => { const i = gCell(x), j = gCell(z); return !!WALK[gIdx(i, j)]; },
  /* the settlement's streets show on owned land; an island's trails show on any of its land, risen or not (what has not risen lies under the sea), so nothing needs painting again when a square rises */
  roadShow: (x, z) => { const A = areaAt(x, z); return A && !A.cave && A.id[0] !== 'h' ? landSdf(x, z) < -0.06 : isleD(x, z) < 0.99 && !!WALK[gIdx(gCell(x), gCell(z))]; }, /* a road shows only on land that is owned */ trees: [],
  box: { x0: -5.4, x1: 5.4, z0: -5.4, z1: 5.4 }, /* pets keep inside this (the area Pip is in) */
  d: (x, z) => 1 + drawSdf(x, z) / 6, clamp: wClamp,
  gw: 124, gh: 124, gx: 0, gz: 0, /* the ground covers the whole world, the cave hill too */
  puddles: [[-2.2, 3.0, 0.9, 0.4], [2.8, -3.2, 0.8, 1.2], [2.9, 3.4, 0.7, 0.2], [-3.3, -0.9, 0.8, 1.5], [0.4, -3.6, 0.6, 0.9]], /* rain puddles in the start area (the farm's lie on its roads) */
  beachAt: (x, z) => { let a = areaAt(x, z); for (let k = 0; !a && k < 4; k++) a = areaAt(x + [1.5, -1.5, 0, 0][k], z + [0, 0, 1.5, -1.5][k]); return a ? BIOME_BEACH[a.biome] : null; },
  tint: (x, z, c) => { let a = areaAt(x, z); for (let k = 0; !a && k < 4; k++) a = areaAt(x + [1.2, -1.2, 0, 0][k], z + [0, 0, 1.2, -1.2][k]); /* a cape reaches past its square */ const t = a && BIOME_TINT[a.biome]; if (t) c.lerp(new T.Color(t[0]), t[1]); } };
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
const HOUSES = { mason: { x: 11, z: 4.9 }, knitter: { x: 14, z: 4.9 }, miner: { x: 17, z: 4.9 },
  fisher: { x: 4.2, z: 9.6, area: 'h2' }, diver: { x: 4.2, z: 12.4, area: 'h2' }, glass: { x: 4.2, z: 15.2, area: 'h2' } }; /* the three from the far islands live on the bakery's lane (Leon 2026-11-27: every island holds a friend the ending needs) */
const LOOP_SITES = { harbor: { x: -4.4, z: 9.4, sx: 1.7, sz: 1.3, mx: 1.6, mz: 2.6 }, windmill: { x: 2.6, z: -30, sx: -1.7, sz: 1.5, mx: -2.2, mz: 2.2 },
  lighthouse: { x: -31.4, z: -2.2, sx: 1.8, sz: 1.3, mx: 2.4, mz: -1.0 }, tower: { x: 30.6, z: -34, sx: -1.7, sz: 1.5, mx: -2.0, mz: -1.2 },
  /* the far islands' wonders (Leon 2026-11-27): a sluice wheel on the marsh channel, a tide bell on the coral beach, a great hearth by the volcano */
  sluice: { x: -12.5, z: 10.0, sx: 0.9, sz: 1.8, mx: 0.9, mz: -2.0 }, bell: { x: 30.4, z: 12.9, sx: -1.7, sz: 0.9, mx: 0.2, mz: -2.0 }, hearth: { x: 27.6, z: 32.7, sx: -1.7, sz: 0.3, mx: -1.4, mz: -1.8 },
  belfry: { x: 13.0, z: 9.7, sx: -1.9, sz: 1.0, mx: 0, mz: 0 } }; /* the bell tower on the village green: the last wonder, made of one find from every island */
/* the island villages (hamlets.js): once an island's monument stands, a few houses and neighbours move in beside it.
   Each house is [x, z, turn]; the crate is where the village stacks what it gathers. Nothing grows on these plots. */
const HAMLET_AT = {
  windmill: { h: [[-3.8, -31.0], [2.8, -24.4], [3.6, -21.8]], crate: [-1.7, -29.7], more: [[-5.6, -24.6], [10.2, -16.2], [-13.6, -22.6], [-8.8, -32.4]] },
  lighthouse: { h: [[-24.4, -8.8], [-30.6, -8.6], [-23.8, -6.2]], crate: [-26.6, -5.5], more: [[-29.4, -14.8], [-23.6, -24.2], [-36.6, -21], [-43.6, -22.8]] },
  tower: { h: [[31.6, -26.6], [25.4, -34.4], [28.6, -26.4]], crate: [29.4, -30.9], more: [[41.6, -17], [40.4, -28.6], [36, -36.4], [41.6, -41]] }
};
/* ---------- trails (Leon, 2026-11-27: "creating paths and making it more interesting and explorationable") ----------
   Every island has dirt trails that wind from where Pip arrives, past its wonder, out to its far squares. The village's
   cottages stand along them, spread over the whole island: the first three near the wonder, the later ones a square or
   two further out each time the village grows. Each trail is a row of points; it is drawn on any land of its island
   that has risen (ISLAND.roadShow), so a trail that runs off into the sea says: there is more land that way. */
const TRAILS = [
  /* meadow: the main street from the bridge to the windmill, west to the stone shortcut, east to the winter bridge, a loop through the pond square */
  [[0, -10.8], [1.4, -13.5], [1.6, -18], [0.4, -22.5], [-1, -26], [-0.5, -27.6]],
  [[1.2, -19.6], [-3, -20.6], [-7, -19.4], [-11.5, -17.6], [-15, -16], [-16.8, -13]],
  [[1.6, -18.4], [5.6, -17.4], [9, -18.6], [13, -17.4], [17.2, -16]],
  [[-1, -26], [-5.5, -26.9], [-8.2, -28.2], [-9.8, -30.4], [-10.9, -31.2]],
  [[-11.5, -17.6], [-11.6, -21], [-10.9, -24], [-10.7, -26.6], [-8.2, -28.2]],
  [[-0.5, -27.6], [0.2, -31], [0.4, -33.6]],
  /* stone: from the lift south to the lighthouse, north to the ruin, west round the mesas to the far squares */
  [[-25.9, -16], [-26, -11.8], [-27.4, -7.6], [-29.4, -4.6]],
  [[-25.9, -16.4], [-26, -21], [-25.4, -25.6], [-25.6, -30.6]],
  [[-26, -12], [-30.5, -11.6], [-33.6, -13.4], [-35, -17.4], [-38.6, -18.2], [-40.8, -21.4], [-41.6, -24.2], [-42.8, -27.5]], /* ends at the foot of the High Table's ladder */
  [[-29.4, -4.6], [-29.2, -1], [-31, 0.6], [-33.6, 0.5]],
  /* winter: round the frozen lake to the tower, along the south shore to the far squares, and a link between the two */
  [[23.2, -16.2], [23.4, -21], [23.8, -25.6], [26.4, -28.2], [29.4, -28.2], [32.2, -29.8], [34.5, -31.2], [37.6, -32.2]], [[27.8, -28.2], [27.4, -31.6], [27.6, -33.8], [28.8, -36.4], [29.4, -37.6]],
  [[23.2, -16.2], [27, -15.3], [32, -15.5], [36, -17], [38.4, -18.8], [37.6, -23], [38, -28], [37.6, -32.2], [38.4, -38.5], [39, -43]],
  [[37.6, -32.2], [39.4, -33.8], [41.8, -33.5], [43.2, -32.3], [46.6, -32], [49.6, -32]], /* to the ice wall, and on into the Summer Hollow behind it (hollow.js) */
  /* marsh: the east bank down to the raft, the west bank past the ruin, and on round the ponds */
  [[-10.8, 16.4], [-10.8, 13], [-10.8, 9.6], [-12.2, 7.5], [-13.3, 7.6]], [[-11.4, 8.4], [-11.6, 6.4]],
  [[-18.7, 16.4], [-20, 16.9], [-21.8, 15.6], [-22.2, 12], [-21.9, 9.4], [-23, 7.2], [-28, 7.4], [-32, 8], [-34.5, 8.4], [-39, 7.8], [-43, 7.8]],
  [[-32, 8], [-32.6, 13], [-32.4, 19], [-32.6, 24], [-31, 28], [-27, 28.6], [-24, 27.5]],
  [[-34.5, 8.4], [-35, 14], [-36.4, 17], [-36.6, 20.5], [-40, 19.6], [-42, 19.6]],
  /* coral: from the bridge to the stepping stones and the ember bridge, east past the bell to the lagoon; the islet's own trail */
  [[22.8, 7.5], [25, 8.2], [27.6, 8], [27.2, 12], [27.8, 16.8]],
  [[31.6, 8.4], [31.8, 6.4]], [[27.6, 8], [32, 8.4], [36, 9.4], [40, 8.8], [42.4, 9.8], [45, 12.6], [47.5, 14.6], [50, 16], [53.2, 16.2]],
  [[28, 1], [27.4, -2.4], [28.6, -5]], [[27.8, -0.4], [32, -0.8], [36, -1.6], [37.8, -3.2], [37.4, -7], [40, -8.4]],
  /* ember: to the first lava ring; between the two streams; then the ash fields behind the second */
  [[28, 22.8], [26.4, 24.4], [25.6, 25.5]], [[25.6, 29], [26.4, 30.8], [27.9, 31.3]],
  [[31.4, 31.7], [32.2, 30], [34.4, 29.6], [37, 30], [41, 30.4], [45, 29.4], [48.5, 28.6], [50.4, 28]],
  [[34.4, 29.8], [34.2, 33], [32.8, 35.4], [31, 37.6], [30.2, 38.4]], [[32.8, 35.4], [36, 35.2], [39.6, 36.2], [43, 38.6], [43.6, 41]]
];
TRAILS.forEach((L) => { for (let k = 0; k + 1 < L.length; k++) ISLAND.roads.push([L[k][0], L[k][1], L[k + 1][0], L[k + 1][1], 0.4, 1, 1]); });
/* how far a point is from the nearest trail, and the nearest point on one */
function trailNear(x, z) { let bd = 1e9, bp = null; for (const L of TRAILS) for (let k = 0; k + 1 < L.length; k++) { const ax = L[k][0], az = L[k][1], dx = L[k + 1][0] - ax, dz = L[k + 1][1] - az, t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz), 0, 1), px = ax + dx * t, pz = az + dz * t, d = Math.hypot(x - px, z - pz); if (d < bd) { bd = d; bp = [px, pz, dx, dz]; } } return { d: bd, p: bp }; }
/* each cottage turns its door to the trail it stands by */
Object.values(HAMLET_AT).forEach((A) => A.h.concat(A.more).forEach((h) => { const q = trailNear(h[0], h[1]).p; h[2] = Math.atan2(q[0] - h[0], q[1] - h[1]); }));
/* a village grows in three sizes (Leon's list, 2026-11-27): `more` holds the plots of the four later cottages, two per size,
   each on a square further from the wonder. The village's own upgrade ring lies in front of its crate. */
const HAM_KEY = {};
Object.keys(HAMLET_AT).forEach((id) => { const A = HAMLET_AT[id]; A.more.forEach((m) => { A.h.push(m); }); HAM_KEY['ham_' + id] = id; });
const FERRY = { x: -5.15, z: 3.05, pad: -2.45 }; /* the dock where the boat to the farm leaves (ferry.js) */
/* the docks the island boat sails between (docks.js): where the planks leave the shore, the way they run (out), and the
   way the boat sails off (go: along the shore, the channels between the islands are narrow) */
const DOCKS = { camp: { x: -6, z: -4.4, out: [-1, 0], go: [0, -1] }, windmill: { x: 0.4, z: -34, out: [0, -1], go: [1, 0] }, lighthouse: { x: -34, z: 0.5, out: [-1, 0], go: [0, -1] }, tower: { x: 29.4, z: -38, out: [0, -1], go: [-1, 0] },
  sluice: { x: -11.6, z: 6, out: [0, -1], go: [-1, 0] }, bell: { x: 31.8, z: 6, out: [0, -1], go: [1, 0] }, hearth: { x: 22, z: 33.0, out: [-1, 0], go: [0, 1] } }, DOCK_ON = {};
const TRAVEL_HOME = { x: 2.7, z: 2.6 }, CAVE_FRIEND = { x: 8.8, z: 29.2 };
const SPOT_AT = { tent: [-4.5, -1.5], fire: [-1.75, 0.75], dog: [-0.75, -2.7], gear: [-2.9, 2.9] }; /* gear has its bench in the start square: rain comes before the smithy does (Leon 2026-11-25, playtest) */ /* the upgrade rings in the camp (spots.js) */
Object.keys(HAMLET_AT).forEach((id) => { const c = HAMLET_AT[id].crate; SPOT_AT['ham_' + id] = [c[0], c[1] + 1.3]; });
const KENNEL = { x: -1.3, z: -3.7 }; /* the pet's kennel, by the camp in the start area */
function fresh() { return { v: 1, coins: 0, total: 0, lv: { speed: 0, bag: 0 }, sound: true, moved: false, wx: { rain: 0, next: 150 },
  isle: { map: MAP_V, areas: { h0: 1 }, paid: {}, tools: { pick: 0, bag: 0, sickle: 0, shovel: 0 }, chests: {}, ruins: {}, store: { log: 0, stone: 0, berry: 0 } } }; }
const speed = () => (3.2 + 0.45 * state.lv.speed + 0.2 * xpRun()) * gearSlow() * scootFast(); /* deep snow without boots (gear.js) */
const cap = () => (state.isle && state.isle.tools.bag ? 10 : 6) + (state.isle ? dogBags() + 2 * xpBag() : 0); /* + the dog's saddlebags (isledog.js) */
const UPS = [{ id: 'speed', base: 10, g: 1.8, max: 8 }, { id: 'bag', base: 15, g: 1.8, max: 8 }];
const upCost = (u) => Math.round(u.base * Math.pow(u.g, state.lv[u.id]));
const ITEM_H = { log: 0.17, stone: 0.15, berry: 0.13, hay: 0.16, clay: 0.14 }; /* height of each thing Pip carries in the basket */
