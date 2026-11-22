/* ---------- the animal economy, part 2: products, pen baskets, feed portions, the wool stall ---------- */
/* the wool stall, its stocking robot and its seller: bought with coins, placed in the coin queue (queue.js) */
SPADS.push({ id: 'stall-wool', kind: 'stall', t: 'wool', cost: 380 }, { id: 'stock-wool', kind: 'stock', t: 'wool', cost: 1300 }, { id: 'sell-wool', kind: 'seller', t: 'wool', cost: 1600 });

/* ---- a basket by the pen for animals whose product is collected right there (sheep: wool) ----
   It stands just outside the pen's fence on the side facing the farm lane, where it stays when the pen grows.
   Pip picks the goods up by walking past it, and the wool stall's robot fetches from it once bought. */
const PEN_BASKETS = {}, BASKET_MAX = 12;
function basketPos(a) {
  /* two animal corners (corners.js): the wool basket stands at the foot of the wool lane, on the way to the market */
  if (typeof CORNERS !== 'undefined' && a === 'sheep') return [12.45, -7.75];
  /* outside the pen at its biggest (penMax once pens grow to fixed sizes; otherwise the old growth rule) */
  const p = PEN[a], sx = penSide(a), inner = p.x + sx * p.w / 2;
  if (typeof penMax === 'function') { const b = penMax(a); return [inner - sx * 0.95, b.z + b.d / 2 + 0.8]; }
  const d = p.fix ? p.d : p.d + 0.3 * (p.n - 1);
  return [inner - sx * 0.95, p.z + d / 2 + 0.8];
}
function penBasket(a) {
  if (PEN_BASKETS[a]) return PEN_BASKETS[a];
  /* sheep and alpacas share one wool basket in the wool corner */
  if (typeof CORNERS !== 'undefined' && a === 'alpaca') return (PEN_BASKETS.alpaca = penBasket('sheep'));
  const G = ANIMAL_GOODS[a], [x, z] = basketPos(a), g = new T.Group(); g.position.set(x, 0, z); sc.add(g);
  const L = [], P = at(x, z, 0, L);
  /* a round wicker basket: woven rings in two straw tones, a darker rim and two rope handles */
  P(new T.CylinderGeometry(0.42, 0.34, 0.36, 16, 3, true), (cx, cy, cz, i) => tone(hash(Math.floor((Math.atan2(cz, cx) + 4) * 5), Math.floor(cy * 18)) > 0.5 ? '#c9a46a' : '#a8804a', i, 0.3), 1800, 0, 0.18, 0);
  P(new T.CylinderGeometry(0.34, 0.34, 0.03, 16), '#8a6444', 1801, 0, 0.02, 0);
  P(new T.TorusGeometry(0.42, 0.035, 5, 20).rotateX(Math.PI / 2), '#7a5438', 1802, 0, 0.36, 0);
  [-1, 1].forEach((q) => P(new T.TorusGeometry(0.09, 0.022, 4, 8, Math.PI).rotateY(Math.PI / 2), '#7a5438', 1803, q * 0.42, 0.36, 0));
  /* a little picture sign on a post behind it */
  P(box(0.07, 1.0, 0.07), PAL.trunk, 1805, 0, 0.5, -0.5);
  const merge = merged(L, MAT); merge.castShadow = true;
  const c = document.createElement('canvas'); c.width = 256; c.height = 160; const cx = c.getContext('2d'); void cx;
  const sg = new T.Mesh(new T.PlaneGeometry(0.62, 0.39), new T.MeshBasicMaterial({ map: mlSignTex(G.t), transparent: true })); sg.position.set(0, 1.05, -0.46); sg.rotation.x = -0.25; g.add(sg);
  const pile = new Pile(g, (k) => { const L2 = Math.floor(k / 6), r = k % 6, a2 = r / 6 * 6.283 + L2 * 0.5, rr = r === 5 ? 0 : 0.19; return [Math.cos(a2) * rr, 0.08 + L2 * 0.17, Math.sin(a2) * rr, a2]; });
  ring(x, z + 0.75, 0.75); solid(x, z, 0.42);
  const b = { a, t: G.t, g, pile, x, z, max: BASKET_MAX, inbound: 0 };
  /* Pip picks up from the front of the basket; robots and helpers fetch from it like from an apple tree */
  b.prod = { kind: 'basket', pile, x, z: z + 0.75, r: 0.9 }; mProd.push(b.prod);
  PEN_BASKETS[a] = b; return b;
}

/* ---- what a fed animal gives: its product flies to the farm crate (for the truck) or to its own pen basket ---- */
produce = function (an) {
  const G = ANIMAL_GOODS[an.a]; if (!G) return;
  const cr = G.at === 'pen' ? penBasket(an.a) : crateFor(G.t), max = G.at === 'pen' ? BASKET_MAX : SHIP_MAX;
  for (let k = 0; k < G.n; k++) {
    if (cr.pile.items.length + cr.inbound >= max) return;
    const m = mk(G.t), p = an.g.position; m.position.set(p.x, an.h * 0.5, p.z); sc.add(m); cr.inbound++;
    fly(m, () => cr.g.localToWorld(tmpV.set(0, 0.5, 0)), () => { cr.inbound--; cr.pile.add(m); }, 0.9 + k * 0.15);
  }
};
/* the basket is there as soon as its animal lives on the farm */
{ const a0 = addAnimal; addAnimal = function (a) { const an = a0(a); if (ANIMAL_GOODS[a] && ANIMAL_GOODS[a].at === 'pen') penBasket(a); return an; }; }

/* ---- feed portions: one scoop of food in a pen's box feeds an animal three times ----
   The scoop shrinks a little with each meal and is gone after the third, so a box filled in the morning
   lasts about three times as long and the hens keep laying while Pip does other things. */
const PORTIONS = 3;
{ const s0 = stockPile; stockPile = function (a, g) {
  const pile = s0(a, g), take0 = pile.take;
  pile.take = function (t) {
    if (!t) return take0.call(this, t);
    const mine = this.items.filter((o) => o.userData.type === t); if (!mine.length) return null;
    const top = mine.find((o) => o.userData.bites) || mine[mine.length - 1], b = (top.userData.bites || 0) + 1;
    if (b < PORTIONS) { top.userData.bites = b; top.scale.setScalar(1 - 0.2 * b); const m = mk(t); top.getWorldPosition(m.position); m.scale.setScalar(0.55); sc.add(m); return m; }
    this.items.splice(this.items.indexOf(top), 1); this.place(); top.userData.bites = 0; top.scale.setScalar(1); return top;
  };
  return pile; }; }

if (window.__farmTest) {
  window.__ev = (s) => eval(s);
  window.__econ = () => ({ baskets: Object.keys(PEN_BASKETS).map((a) => a + ':' + PEN_BASKETS[a].pile.items.length).join(' '), crate: CRATES[0].pile.items.length, hearts: JSON.stringify(HEARTS) });
}
