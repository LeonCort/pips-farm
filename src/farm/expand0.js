/* ---------- farm expansion, part 1: data for the new animals and the helper upgrades (read before anything is built) ----------
   Design canvas: https://claude.ai/artifact/255kpRtj5QSYstDKpTgpJ2 . New animals: ducks on a new lake, rabbits by the dock,
   alpacas on the hill by the harbour. Helper upgrades (bought with hearts, kind 'xp'): a stream and lake that keep the
   farmyard pens' water full, a windmill pump for the paddocks up north, a hay loft and a grain silo that fill the feed boxes,
   a wheat field in the meadow, a tractor that can drive itself, a donkey with a feed cart, a garden sprinkler and bee hives.
   Every helper has a switch in the helper room in the house (expand.js). */
Object.assign(DIET, { duck: ['grain', 'water'], rabbit: ['carrot', 'hay', 'water'], alpaca: ['hay', 'water'] });
Object.assign(HEARTS, { duck: 2, rabbit: 3, alpaca: 4 });
/* duck pond pen: the new lake south-west of the pig pen (the pen fence goes round the lake, the ducks swim in it);
   rabbits: a hutch run east of the dock road; alpacas: the grassy hill between the dock and the lighthouse */
Object.assign(PEN, {
  duck: { x: -15.6, z: 9.7, w: 4.6, d: 2.8, n: 4, s: 1, fix: 1 },
  rabbit: { x: 6.5, z: 8.5, w: 3.8, d: 1.8, n: 3, s: 1, fix: 1 },
  alpaca: { x: 7.7, z: 11.2, w: 4.8, d: 2.4, n: 3, s: 1, fix: 1 }
});
Object.assign(RIDE, { alpaca: 1.3 });
/* the helper upgrades: where their buy pad sits and which picture it shows */
const XP = {
  'xp-stream': { pad: [-13.9, 7.9], icon: 'stream', sv: 'Bäcken' },
  'xp-loft': { pad: [-8.9, -5.4], icon: 'hay', sv: 'Höloftet' },
  'xp-auto': { pad: [15.7, -7.5], icon: 'tractor', sv: 'Traktorn kör själv' },
  'xp-wheat': { pad: [2.6, -8.5], icon: 'wheat', sv: 'Vetefältet' },
  'xp-silo': { pad: [-8.9, -2.6], icon: 'grain', sv: 'Silon' },
  'xp-bees': { pad: [11.6, 10.6], icon: 'bee', sv: 'Bikuporna' },
  'xp-sprink': { pad: [7.5, -6.3], icon: 'can', sv: 'Vattenspridaren' },
  'xp-pump': { pad: [7.4, -12.5], icon: 'mill', sv: 'Kvarnpumpen' },
  'xp-donkey': { pad: [-9.0, 7.7], icon: 'donkey', sv: 'Åsnan och vagnen' }
};
PADS.push(
  { id: 'duck1', kind: 'animal', a: 'duck', cost: 150 }, { id: 'duck2', kind: 'animal', a: 'duck', cost: 950 }, { id: 'duck3', kind: 'animal', a: 'duck', cost: 2600 },
  { id: 'rabbit1', kind: 'animal', a: 'rabbit', cost: 210 }, { id: 'rabbit2', kind: 'animal', a: 'rabbit', cost: 1900 },
  { id: 'alpaca1', kind: 'animal', a: 'alpaca', cost: 3600 }, { id: 'alpaca2', kind: 'animal', a: 'alpaca', cost: 5300 }
);
Object.keys(XP).forEach((id) => PADS.push({ id, kind: 'xp', cost: 100 }));
