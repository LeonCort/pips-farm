/* ---------- Pips Island: the save, the rules and the island's squares ----------
   A gathering game on the Pips engine. The island is a 7 by 7 grid of squares (GS world units each). The middle 3 by 3 is
   land from the start; every other square is sea until it is bought with things Pip gathers (logs, stones, berries).
   The engine draws the ground from ISLAND.d (how far a point is from the coast) and keeps Pip on land with ISLAND.clamp,
   so the coast follows whichever squares are owned. */
const SAVE_KEY = 'pip-isle-v1'; /* the island's own save; pips-avatar (how Pip looks) is shared with the farm */
const HERE = 'isle';
const GS = 5, GN = 3; /* square size, and how many squares out from the middle (7 by 7 in all) */
const GRID_W = GN * 2 + 1;
const gIdx = (i, j) => (i + GN) * GRID_W + (j + GN); /* square (i, j), i along x and j along z, -GN..GN */
const gIn = (i, j) => Math.abs(i) <= GN && Math.abs(j) <= GN;
const gCell = (x) => Math.round(x / GS);
/* which squares are land: read from the save right away, because the ground is drawn before the game starts */
const OWN = new Uint8Array(GRID_W * GRID_W);
/* ?new=1 starts a new island (for testing) */
try { if (/[?&]new=1/.test(location.search)) localStorage.removeItem(SAVE_KEY); } catch (e) {}
(function () {
  let list = null; try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s && s.v === 1 && s.isle && Array.isArray(s.isle.own)) list = s.isle.own; } catch (e) {}
  if (list && list.length) list.forEach((k) => { if (k >= 0 && k < OWN.length) OWN[k] = 1; });
  else for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) OWN[gIdx(i, j)] = 1;
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
const ISLAND = { a: 20, b: 18, wob: [], cape: null, plaza: 0, walk: 1.5, ring: { rx: 3, rz: 3, w: 0 }, /* no ring road: w 0 (pets still wander round it) */ roads: [], trees: [],
  box: { x0: -GS * 1.5, x1: GS * 1.5, z0: -GS * 1.5, z1: GS * 1.5 }, /* pets keep inside this (grows with the island) */
  d: (x, z) => 1 + gSdf(x, z) / 6, clamp: gClamp };
const KENNEL = { x: -1.6, z: -1.5 }; /* the pet's kennel, by the camp in the middle square */
function fresh() { return { v: 1, coins: 0, total: 0, lv: { speed: 0, bag: 0 }, sound: true, moved: false, wx: { rain: 0, next: 150 },
  isle: { own: Array.from(OWN.keys()).filter((k) => OWN[k]), k: 0, paid: {}, tools: { pick: 0, bag: 0 }, chests: {}, got: {} } }; }
const speed = () => 3.2 + 0.45 * state.lv.speed;
const cap = () => (state.isle && state.isle.tools.bag ? 10 : 6);
const UPS = [{ id: 'speed', base: 10, g: 1.8, max: 8 }, { id: 'bag', base: 15, g: 1.8, max: 8 }];
const upCost = (u) => Math.round(u.base * Math.pow(u.g, state.lv[u.id]));
const ITEM_H = { log: 0.17, stone: 0.15, berry: 0.13 }; /* height of each thing Pip carries in the basket */
/* what the n-th bought square costs (n from 0): logs, stones, berries. Prices go by how many squares are bought, not by where. */
const PRICES = [[3, 0, 0], [4, 0, 0], [4, 2, 0], [5, 2, 0], [5, 3, 0], [6, 3, 0], [6, 3, 2], [7, 4, 0], [8, 4, 0], [8, 5, 0], [9, 5, 0], [10, 5, 3], [10, 6, 0], [11, 6, 0], [12, 6, 0], [12, 7, 4]];
function priceOf(n) { const p = PRICES[n] || [12 + Math.ceil((n - 15) * 0.7), 7 + Math.ceil((n - 15) * 0.4), n % 4 === 0 ? 5 : 0]; return { log: p[0], stone: p[1], berry: p[2] }; }
