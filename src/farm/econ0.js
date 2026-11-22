/* ---------- the animal economy, part 1 (read before the market is built) ----------
   Every animal feeds the economy: it gives hearts, and the ones in ANIMAL_GOODS also give something to sell.
   To add a new animal that makes a product, give it a line here (product, how many per meal, where it lands),
   an item model and icon for the product, and a place in MKT.stalls; the stall, its robot and its seller then come
   from the coin queue like the others. at: 'farm' = the farm crate the truck takes, 'pen' = its own basket by the pen. */
const ANIMAL_GOODS = {
  hen: { t: 'egg', n: 2, at: 'farm' },
  cow: { t: 'milk', n: 2, at: 'farm' },
  goat: { t: 'milk', n: 1, at: 'farm' },
  sheep: { t: 'wool', n: 1, at: 'pen' }
};
/* animals with nothing to sell give a lot more hearts instead (pig 3 -> 5, horse 6 -> 10, bull 9 -> 14) */
Object.keys(HEARTS).forEach((a) => { if (!ANIMAL_GOODS[a]) HEARTS[a] = Math.round(HEARTS[a] * 1.6); });
/* wool: a soft bundle of fleece tied with a pink ribbon */
{ const g = new T.Group();
  [[0, 0.1, 0, 0.1], [-0.085, 0.085, 0.03, 0.075], [0.085, 0.08, -0.02, 0.078], [0.01, 0.17, 0.02, 0.072], [-0.02, 0.08, -0.08, 0.07]].forEach(([x, y, z, r], k) => part(fac(ico(r, 1, 40 + k, 0.01), k % 2 ? '#f4efe4' : '#fbf8f1', 40 + k), g, x, y, z, true));
  const rb = new T.TorusGeometry(0.1, 0.018, 4, 12); rb.rotateY(Math.PI / 2); part(fac(rb, '#e98aa0', 46), g, 0, 0.1, 0, true);
  PROTO.wool = g; }
ITEM_H.wool = 0.22; GOODS.push('wool');
/* the wool stall: in the street's north row next to the apples (the apple stall moves a little west to make room) */
if (VARIANT === 'van') { MKT.stalls.apple.x = 12.1; MKT.stalls.wool = { x: 15.05, z: -2.6, f: -1 }; }
else MKT.stalls.wool = { x: 11.0, z: -2.6, f: -1 };
/* the wool picture: a fleece cloud with curls and a little pink bow */
{ const d0 = drawIcon; drawIcon = function (cx, t, x, y, s) {
  if (t !== 'wool') return d0(cx, t, x, y, s);
  cx.save(); cx.translate(x, y); cx.scale(s, s); cx.lineWidth = 4; cx.strokeStyle = PAL.ink; cx.lineJoin = 'round';
  const C = [[-17, 6, 13], [-6, -8, 14], [9, -9, 14], [19, 5, 13], [0, 13, 14]];
  cx.fillStyle = '#fbf8f1'; C.forEach(([a, b, r]) => { cx.beginPath(); cx.arc(a, b, r, 0, 7); cx.fill(); cx.stroke(); });
  C.forEach(([a, b, r]) => { cx.beginPath(); cx.arc(a, b, r - 2, 0, 7); cx.fill(); });
  cx.strokeStyle = '#cbbd9f'; cx.lineWidth = 2.5; [[-15, 6], [-4, -6], [10, -6], [17, 6], [1, 12]].forEach(([a, b]) => { cx.beginPath(); cx.arc(a, b, 5, 0.6, 4.4); cx.stroke(); });
  cx.strokeStyle = PAL.ink; cx.lineWidth = 3; cx.fillStyle = '#e98aa0';
  [-1, 1].forEach((q) => { cx.beginPath(); cx.moveTo(0, -22); cx.lineTo(q * 13, -30); cx.lineTo(q * 13, -15); cx.closePath(); cx.fill(); cx.stroke(); });
  cx.beginPath(); cx.arc(0, -22, 4.5, 0, 7); cx.fill(); cx.stroke();
  cx.restore(); }; }
