/* the sandbox (start page, bondgard.html?sandbox=1: everything unlocked, nothing to buy) keeps its own save, see sandbox.js */
const SANDBOX = /[?&]sandbox=1\b/.test(location.search);
const SAVE_KEY = SANDBOX ? 'pip-farm-sandbox-v1' : 'pip-farm-care-v1'; /* the farm's save in localStorage */
/* the island (scene.js draws it): a round town island with a wavy coast, a little point for the lighthouse,
   a cobbled plaza (walk: the path round the fountain), the ring road round the town, straight roads (x0, z0, x1, z1, half width,
   kind 1 dirt / 2 cobbles), and the box pets and helpers keep inside */
const ISLAND = { a: 24, b: 15, wob: [[3, 0.035, 1], [5, 0.025, 2.2], [8, 0.022, 0.4]], cape: [1.0, 0.07, 0.012], plaza: 3.5, walk: 2.3, ring: { rx: 8, rz: 7.6, w: 0.62 },
  box: { x0: -16.3, x1: 16.3, z0: -10.9, z1: 10.9 },
  roads: [
    [-3.2, 0, -12.6, 0, 0.62, 1], [-12.6, -7.4, -12.6, 7.4, 0.68, 1], /* west to the farmyard, and the farm lane */
    [3.2, 0, 8, 0, 0.62, 1], [8, 0, 22.4, 0, 0.95, 2], /* east, then the cobbled market street */
    [0, 3.2, 0, 13.4, 0.62, 1], /* south to the harbour */
    [0, -7.6, 0, -9.0, 0.62, 1], /* north to the meadow */
    [-5.66, 5.37, -4.9, 8.7, 0.55, 1] /* south-west to the pond */
  ] };
const KENNEL = { x: -1.9, z: 8.4 }; /* the dog's kennel, south of the plaza */
/* ---------- rules ---------- */
/* which test layout this build is: 'near' puts the hens and cows right behind their market stalls,
   'van' keeps the farmyard and lets a little flatbed truck drive the eggs and milk to the market */
const VARIANT = 'van';
/* what each animal likes to eat, and how many hearts a happy animal gives */
const DIET = { hen: ['grain', 'water'], pig: ['grain', 'carrot', 'water'], cow: ['hay', 'water'], horse: ['hay', 'carrot', 'water'], bull: ['hay', 'water'], sheep: ['hay', 'water'], goat: ['grain', 'carrot', 'water'] };
const HEARTS = { hen: 2, pig: 3, cow: 5, horse: 6, bull: 9, sheep: 4, goat: 4 };
/* pens: centre, size, and how many animals fit */
const PEN = {
  /* the farmyard: three pens west of the farm lane, food sheds on its east side */
  cow: { x: -15.2, z: -5.2, w: 3.6, d: 2.6, n: 3 },
  hen: { x: -15.2, z: 0, w: 3.4, d: 2.6, n: 4 },
  pig: { x: -15.2, z: 5.2, w: 3.4, d: 2.4, n: 3 },
  /* paddocks by the meadow and down by the woods */
  /* the big animals get roomier paddocks that grow more with every animal (g: extra width, depth per animal),
     up to a cap (mw, md) so they never run into the barn, the meadow or the beach; zs 1 grows south only */
  horse: { x: -8.3, z: -10.3, w: 4.2, d: 3.2, n: 2, g: [0.9, 0.6], mw: 4.9, md: 3.9 },
  sheep: { x: 8.6, z: -9.9, w: 3.8, d: 2.8, n: 3, g: [1.0, 0.35], mw: 6.0, md: 3.6, zs: 1 },
  bull: { x: -9.5, z: 10.0, w: 3.4, d: 2.4, n: 1 },
  /* the goats live in the barn and spend the day in a little paddock next to it (bought inside the barn) */
  goat: { x: -8.9, z: -7.3, w: 2.6, d: 1.9, n: 3, fix: 1 }
};
/* 'near': the hen house sits right behind the egg stall and the cows right behind the milk stall, each with a feed station next to it.
   These pens have room for all their animals from the start (fix), so they never grow into the street. */
if (VARIANT === 'near') {
  PEN.hen = { x: 13.8, z: 6.5, w: 4.4, d: 2.6, n: 4, s: 1, fix: 1 };
  PEN.cow = { x: 15.3, z: -6.7, w: 4.6, d: 3.0, n: 3, s: -1, fix: 1 };
  PEN.pig = { x: -15.2, z: 0, w: 3.4, d: 2.4, n: 3 };
}
/* feed stations by the market pens: they hand out the foods that pen eats (hay only once the hay barn is bought) */
const STATIONS = VARIANT === 'near' ? [{ a: 'hen', x: 17.3, z: 3.9, foods: ['grain', 'water'], i: 0 }, { a: 'cow', x: 12.6, z: -9.2, foods: ['hay', 'water'], i: 0 }] : [];
/* which side of a pen the trough and feed box are on: toward the middle of the island (x) */
const penSide = (a) => PEN[a].s || -Math.sign(PEN[a].x);
/* a pen's size for n animals (babies count as half): it grows outward from the feeding fence, which stays put */
function penSize(a, n) {
  const p = PEN[a], g = p.g || [0.75, 0.3], k = Math.max(0, n - 1), sx = penSide(a), inner = p.x + sx * p.w / 2;
  const w = p.fix ? p.w : Math.min(p.mw || 99, p.w + g[0] * k), d = p.fix ? p.d : Math.min(p.md || 99, p.d + g[1] * k);
  return { x: inner - sx * w / 2, z: p.z + (p.zs || 0) * (d - p.d) / 2, w, d };
}
/* the biggest a pen can get: decorations keep clear of it from the start */
const penMax = (a) => penSize(a, PEN[a].n * 1.5);
/* the bigger farm: a hay meadow to mow and a tractor shed */
const MEADOW = { x0: -4.2, x1: 4.4, z0: -12.6, z1: -9.2 }, TRACTOR_HOME = [14.0, -9.0]; /* east of the sheep paddock, clear of it when it is fully grown */
const RIDE = { horse: 1.9, pig: 1.35, sheep: 1.35, bull: 1.6 };
/* fish you can catch from the end of the dock: common ones often, the golden one rarely */
const FISH = [
  { id: 'abborre', sv: 'Abborre', c: '#8fae4e', s: '#3f5a2a', f: '#e0703c', len: 0.42, w: 34, hearts: 3 },
  { id: 'mort', sv: 'Mört', c: '#c9d6dc', s: '#8a9ba6', f: '#d2483a', len: 0.36, w: 32, hearts: 2 },
  { id: 'gadda', sv: 'Gädda', c: '#7a9a50', s: '#d9e2a8', f: '#9c7b3e', len: 0.7, w: 12, hearts: 6 },
  { id: 'lax', sv: 'Lax', c: '#c7cfd6', s: '#e89a8c', f: '#8a9ba6', len: 0.56, w: 15, hearts: 6 },
  { id: 'guld', sv: 'Guldfisk', c: '#f2b134', s: '#e9684a', f: '#f6d27a', len: 0.34, w: 7, hearts: 15 }
];
/* the vegetable patch: each bed always grows the same thing, so there is something different in each */
const CROPS = {
  carrot: { sv: 'Morötter', grow: 70, hearts: 3 }, strawberry: { sv: 'Jordgubbar', grow: 80, hearts: 5 },
  pumpkin: { sv: 'Pumpa', grow: 120, hearts: 10 }, sunflower: { sv: 'Solros', grow: 100, hearts: 7 }
};
const BEDS = [[8.8, -5.4, 'carrot'], [10.0, -5.4, 'strawberry'], [11.2, -5.4, 'pumpkin'], [8.8, -4.2, 'sunflower'], [10.0, -4.2, 'carrot'], [11.2, -4.2, 'strawberry']];
/* food sources in the middle of the farm; Pip can take as much as fits in the basket */
const SRC = { grain: { x: -10.4, z: -2.4 }, water: { x: -10.4, z: 2.4 }, carrot: { x: -10.4, z: 5.4 }, hay: { x: -10.4, z: -5.6 } }; /* carrots by the pig pen, hay by the cow pen */
const PADS = [
  { id: 'hen3', kind: 'animal', a: 'hen', cost: 8 }, { id: 'pig1', kind: 'animal', a: 'pig', cost: 12 }, { id: 'pig2', kind: 'animal', a: 'pig', cost: 20 },
  { id: 'house-hen', kind: 'house', a: 'hen', cost: 25 }, { id: 'tractor', kind: 'tractor', cost: 35 },
  { id: 'help-water', kind: 'helper', t: 'water', cost: 45 }, { id: 'hay', kind: 'source', t: 'hay', cost: 60 },
  { id: 'sheep1', kind: 'animal', a: 'sheep', cost: 70 }, { id: 'cow1', kind: 'animal', a: 'cow', cost: 85 },
  { id: 'sheep2', kind: 'animal', a: 'sheep', cost: 110 }, { id: 'cow2', kind: 'animal', a: 'cow', cost: 130 },
  { id: 'house-pig', kind: 'house', a: 'pig', cost: 160 }, { id: 'hen4', kind: 'animal', a: 'hen', cost: 180 },
  { id: 'help-grain', kind: 'helper', t: 'grain', cost: 220 }, { id: 'horse1', kind: 'animal', a: 'horse', cost: 260 },
  { id: 'house-sheep', kind: 'house', a: 'sheep', cost: 300 }, { id: 'house-cow', kind: 'house', a: 'cow', cost: 340 },
  { id: 'pig3', kind: 'animal', a: 'pig', cost: 380 }, { id: 'horse2', kind: 'animal', a: 'horse', cost: 440 },
  { id: 'sheep3', kind: 'animal', a: 'sheep', cost: 480 }, { id: 'help-hay', kind: 'helper', t: 'hay', cost: 520 },
  { id: 'bull1', kind: 'animal', a: 'bull', cost: 620 }, { id: 'house-horse', kind: 'house', a: 'horse', cost: 720 },
  { id: 'cow3', kind: 'animal', a: 'cow', cost: 820 }, { id: 'help-carrot', kind: 'helper', t: 'carrot', cost: 900 },
  { id: 'house-bull', kind: 'house', a: 'bull', cost: 1100 }
];
/* each pen has a feed box; it holds up to this many of each food, so you can fill it before the animals get hungry */
const BOX_MAX = 6;
const UPS = [
  { id: 'speed', base: 10, g: 1.8, max: 8 }, { id: 'bag', base: 15, g: 1.8, max: 8 },
  { id: 'farm', base: 25, g: 1.9, max: 8 }, { id: 'guests', base: 40, g: 1.9, max: 8 }
];
/* where to fetch food t for pen a: its feed station when it has one that hands out t, otherwise the shed */
const stationFor = (a, t) => STATIONS.find((s) => (s.a === a || (s.also && s.also.includes(a))) && s.foods.includes(t) && sources[t]);
function foodSpot(t, a) { const s = a && stationFor(a, t); return s ? [s.x, s.z] : sources[t] ? [sources[t].x, sources[t].z] : [SRC[t].x, SRC[t].z + 1.0]; }
const feedPos = (a) => { const p = PEN[a], vx = penSide(a), vz = 0; return [p.x + vx * (p.w / 2 + 0.75), p.z + vz]; };
const housePos = (a) => { const p = penBox(a); return [p.x - penSide(a) * (p.w / 2 - 0.75), p.z - p.d / 2 + 0.7]; };
function padPos(p) {
  if (p.kind === 'animal') { const f = feedPos(p.a); return [f[0], f[1] + 1.35]; }
  if (p.kind === 'house') { const f = feedPos(p.a); return [f[0], f[1] - 1.35]; }
  if (p.kind === 'source') return [SRC[p.t].x, SRC[p.t].z + 1.0];
  if (p.kind === 'tractor') return [TRACTOR_HOME[0], TRACTOR_HOME[1] + 1.8];
  if (p.kind === 'helper') return [SRC[p.t].x, SRC[p.t].z - 1.25];
  return [0, 0];
}
function fresh() { return { v: 1, coins: 0, total: 0, paid: {}, owned: {}, lv: { speed: 0, bag: 0, farm: 0, guests: 0 }, sound: true, moved: false, fish: {}, garden: BEDS.map(() => ({ s: 0, g: 0, w: 0 })), wx: { rain: 0, next: 150 }, shop: { coins: 0, total: 0, owned: { tree1: true }, paid: {} } }; }
const own = (id) => !!state.owned[id];
/* a walk picked on the picture map: the road points still to go */
const ROUTE = { pts: null, i: 0, dest: null };
const speed = () => (3.0 + 0.45 * state.lv.speed) * (!mount ? 1 : mount.kind === 'tractor' ? 1.8 : RIDE[mount.an.a]) * (ROUTE.pts ? 1.4 : 1);
const cap = () => 4 + 1 * state.lv.bag;
const heartMult = () => 1 + 0.25 * state.lv.farm;
const helpSpeed = () => 2.2 * (1 + 0.15 * state.lv.guests);
const upCost = (u) => qGearCost(u) || Math.round(u.base * Math.pow(u.g, state.lv[u.id]));
function nextPad() { for (const p of PADS) if (!own(p.id)) return p; return null; }
