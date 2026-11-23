/* ---------- Pips Island: what the engine asks a game for (src/engine/contract.txt) ----------
   The island has no house, barn, store, boat, bed or market yet, so most answers are "none" or "nothing to do".
   Names the engine only reaches through `typeof X !== 'undefined'` (the fountain pond, the store, the meadow,
   the food sheds, the market) are left out on purpose. */

/* where Pip is: always outside for now */
let inHouse = false, inBarn = false, inStore = false;
let trip = null, sleep = null; /* no boat trips, no sleeping in bed */
function inMarketTown() { return false; }
function goInside() {}
const IN_B = { x0: -1, x1: 1, z0: -1, z1: 1 }; /* the inside of a house, when there is one */
const BI = { x: -200, z: 0 }, SI = { x: 0, z: -200 }; /* inside the barn and the store: none yet */
/* no house yet: an empty, hidden group so the snow caps and the light effects have something to look at */
const HOUSE = { x: 0, z: -400 }, houseG = new T.Group(); houseG.visible = false;
const lampMatH = new T.MeshBasicMaterial({ color: '#ffe6a8' });
const HO = { x: 200, z: 0 }, HDOOR = { x: 0, z: -400 }; /* where a house's inside is built, and its door: none yet */

/* steps the loop calls */
function houseStep() {}
function boatStep() {}
function bedStep() {}
function storeStep() {} /* the engine hangs its own per-frame work on this one (gfx.js) */
function buyCam() { return false; }
function routeStop() {}
/* the pet is always outside with Pip on the island (engine/dog.js asks) */
function petPlace() { return { home: false, away: false, goal: null, door: () => [pip.position.x - 1, pip.position.z - 0.8] }; }
function guideGoal() { return isleGoal(); }
function barnGoal() { return null; }
const tutArrowIn = () => false;

/* farm things the light, weather and shade look at */
const pens = {}, animals = [];
const PEN = {}; /* no pens on the island */
let tractor = null;
const fountain = null, pond = null;
const beds = [], tufts = [], ripples = [];
const DOCK = { x: 0, edge: 99, z0: 99, z1: 99 }; /* no dock */
