/* ---------- Pips Zoo: the save and the rules ----------
   The first zoo page: Pip on an island with the engine's sky, weather and light, and one penguin enclosure.
   Every name in src/engine/contract.txt has to exist in a game; this file and world.js give the zoo's answer
   for each one, most of them "nothing here yet". When the zoo needs a real one, it replaces the stub. */
const SAVE_KEY = 'pip-zoo-v1'; /* the zoo's own save; pips-avatar (how Pip looks) is shared with the farm */
const HERE = 'zoo';
const DIET = {}; /* scene.js only asks whether DIET exists, to pick the farm-shaped island; the zoo borrows that island for now */
function fresh() { return { v: 1, coins: 0, total: 0, lv: { speed: 0, bag: 0 }, sound: true, moved: false, wx: { rain: 0, next: 150 }, zoo: { fed: 0 } }; }
const speed = () => 3.0 + 0.45 * state.lv.speed;
const cap = () => 4 + 1 * state.lv.bag;
const UPS = [{ id: 'speed', base: 10, g: 1.8, max: 8 }, { id: 'bag', base: 15, g: 1.8, max: 8 }];
const upCost = (u) => Math.round(u.base * Math.pow(u.g, state.lv[u.id]));
const ITEM_H = { fish: 0.16 }; /* height of each thing Pip carries in the basket */
