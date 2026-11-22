/* ---------- two animal corners (test): the farmyard on the west side and a wool corner in the north-east ----------
   Leon wants the animals together instead of spread out by the market, so carrying food and goods is short:
   - the rabbits leave the dock and get a hutch run in the farmyard, right by the carrot shed;
   - the alpacas leave the harbour hill and move in next to the sheep: both give wool, both eat hay and water;
   - sheep and alpacas share a feed lane with a hay and water station, and one wool basket for both;
   - the tractor parks west of the sheep, on the edge of the meadow it mows.
   Runs right after expand0.js, before anything is built. */
const CORNERS = true;
/* the wool corner: sheep feed on their east side now (s 1) and grow west toward the meadow; the alpacas feed on their west side,
   across a little lane from the sheep */
Object.assign(PEN.sheep, { x: 9.3, z: -10.6, s: 1, mw: 4.6 });
Object.assign(PEN.alpaca, { x: 15.2, z: -8.55, w: 2.8, d: 2.0, s: -1 });
/* the rabbits: a hutch run between the carrot shed and the pond road, feeding side east (on the road) */
Object.assign(PEN.rabbit, { x: -6.9, z: 7.0, w: 2.8, d: 1.6, s: 1 });
/* the feed station in the wool lane: hay and water for both pens (hay only once the hay barn is bought) */
STATIONS.push({ a: 'sheep', also: ['alpaca'], x: 12.5, z: -11.5, foods: ['hay', 'water'], i: 0 });
/* the tractor and its self-driving sign move to the meadow's east edge */
TRACTOR_HOME[0] = 5.55; TRACTOR_HOME[1] = -10.6;
XP['xp-auto'].pad = [5.55, -7.4];
/* the donkey's stable moves up a little so the rabbit run fits */
XP['xp-donkey'].pad = [-8.4, 4.3];
