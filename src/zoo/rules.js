/* ---------- Pips Zoo: the save and the rules ----------
   The first zoo page: Pip on an island with the engine's sky, weather and light, and one penguin enclosure.
   Every name in src/engine/contract.txt has to exist in a game; this file and world.js give the zoo's answer
   for each one, most of them "nothing here yet". When the zoo needs a real one, it replaces the stub. */
const SAVE_KEY = 'pip-zoo-v1'; /* the zoo's own save; pips-avatar (how Pip looks) is shared with the farm */
const HERE = 'zoo';
/* the zoo's home island (scene.js draws it): rounder than the farm, with a point in the south where the gate and the ferry
   will be. One loop path goes round the middle; the enclosures sit outside it, the plaza inside. Roads: x0, z0, x1, z1, half width, kind. */
const ISLAND = { a: 22, b: 15, wob: [[2, 0.04, 0.5], [4, 0.03, 1.9], [7, 0.018, 3.1]], cape: [1.571, 0.06, 0.02], plaza: 3.0, walk: 2.0, ring: { rx: 9.5, rz: 7, w: 0.75 },
  box: { x0: -15, x1: 15, z0: -10, z1: 10 }, /* pets keep inside this */
  roads: [
    [0, 7, 0, 15.4, 0.75, 1], /* south from the loop to the gate */
    [2.9, 0, 9.5, 0, 0.6, 1], [-2.9, 0, -9.5, 0, 0.6, 1], [0, -2.9, 0, -7, 0.6, 1] /* from the plaza out to the loop */
  ] };
const KENNEL = { x: -4.5, z: -3.2 }; /* the pet's kennel, on the grass north-west of the plaza */
function fresh() { return { v: 1, coins: 0, total: 0, lv: { speed: 0, bag: 0 }, sound: true, moved: false, wx: { rain: 0, next: 150 }, zoo: { fed: 0 } }; }
const speed = () => 3.0 + 0.45 * state.lv.speed;
const cap = () => 4 + 1 * state.lv.bag;
const UPS = [{ id: 'speed', base: 10, g: 1.8, max: 8 }, { id: 'bag', base: 15, g: 1.8, max: 8 }];
const upCost = (u) => Math.round(u.base * Math.pow(u.g, state.lv[u.id]));
const ITEM_H = { fish: 0.16 }; /* height of each thing Pip carries in the basket */
