/* ---------- pen stock: every food a pen needs has its own spot along the feeding fence (a grain bin, a water trough,
   a carrot basket, a hay rack), each with a picture sign and six marked places, so you can see at a glance what runs low ---------- */
const STOCK_LOOK = {
  grain: { wood: '#a77a4e', dark: '#6b4630', base: '#d9b77a' }, /* a pale wooden bin */
  water: { wood: '#5f8fa0', dark: '#3d6472', base: '#9fd3dc' }, /* a blue-painted trough */
  carrot: { wood: '#b98a52', dark: '#7a5534', base: '#e7c48c' }, /* a wicker basket */
  hay: { wood: '#8c6040', dark: '#5e3f2a', base: '#e0c06a' } /* a slatted hay rack */
};
/* where each food's spot sits in the pen's own space (the pen group sits at the pen's first centre) */
function stockSpots(a) {
  const p = PEN[a], foods = DIET[a], n = foods.length, sx = penSide(a), gap = Math.min(1.0, (p.d - 0.3) / n);
  return foods.map((t, i) => ({ t, x: sx * (p.w / 2 - 0.33), z: (i - (n - 1) / 2) * gap, gap }));
}
/* the six places on a spot: [toward the pen, along the fence, height, turn] */
function stockGrid(t, gap) {
  const out = [];
  if (t === 'hay') { for (let k = 0; k < 6; k++) out.push([0, ((k % 2) - 0.5) * 0.34, 0.1 + Math.floor(k / 2) * 0.19, Math.PI / 2]); return out; }
  const cols = gap >= 0.92 ? 3 : 2, cz = cols === 3 ? 0.23 : gap < 0.6 ? 0.2 : 0.22, h = ITEM_H[t] || 0.2;
  for (let k = 0; k < 6; k++) { const L = Math.floor(k / (cols * 2)), r = k % (cols * 2); out.push([(Math.floor(r / cols) - 0.5) * 0.22, ((r % cols) - (cols - 1) / 2) * cz, 0.1 + L * h, (hash(k, t.length) - 0.5) * 0.5]); }
  return out;
}
/* a wooden sign with the food's picture, shared by all spots of that food */
const stockSignMat = {};
function stockSign(t) {
  if (stockSignMat[t]) return stockSignMat[t];
  const c = document.createElement('canvas'); c.width = 128; c.height = 112; const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 0, 112); gr.addColorStop(0, '#f3e2bf'); gr.addColorStop(1, '#e2c796');
  x.fillStyle = '#6e4426'; x.beginPath(); x.roundRect ? x.roundRect(2, 2, 124, 108, 18) : x.rect(2, 2, 124, 108); x.fill();
  x.fillStyle = gr; x.beginPath(); x.roundRect ? x.roundRect(9, 9, 110, 94, 13) : x.rect(9, 9, 110, 94); x.fill();
  x.strokeStyle = 'rgba(150,105,60,0.35)'; x.lineWidth = 2; [38, 70].forEach((y) => { x.beginPath(); x.moveTo(12, y); x.lineTo(116, y); x.stroke(); }); /* plank seams */
  drawIcon(x, t, 64, 58, 1.2);
  const tex = new T.CanvasTexture(c); tex.anisotropy = 4;
  const m = new T.MeshStandardMaterial({ map: tex, roughness: 0.9 }); stockSignMat[t] = m; return m;
}
/* build one spot: the holder, the empty-place marks, a post and the picture sign above the fence */
function stockHolder(a, g, s, sx, L) {
  const lk = STOCK_LOOK[s.t] || STOCK_LOOK.grain, seed = a.length * 13 + s.t.length * 7;
  const add = (geo, col, k, x, y, z) => { const q = fac(geo, col, seed + k); q.translate(x, y, z); L.push(q); };
  const grid = stockGrid(s.t, s.gap), zs = grid.map((q) => q[1]), wz = Math.max(...zs) - Math.min(...zs) + (s.t === 'hay' ? 0.36 : 0.3);
  const dx = s.t === 'hay' ? 0.34 : 0.5, X = s.x, Z = s.z, wood = (base) => (cx, cy, cz, i) => tone(base, i, 0.8).multiplyScalar(0.78 + 0.35 * clamp(cy / 0.3, 0, 1));
  if (s.t === 'hay') {
    /* a pallet on the ground and a slatted rack leaning on the fence */
    add(jit(box(dx, 0.07, wz, 1, 1, 2), 0.01, 1), wood(lk.wood), 1, X, 0.04, Z);
    for (let k = 0; k < 4; k++) add(box(0.04, 0.62, 0.04), wood(lk.dark), 2 + k, X + sx * dx * 0.42, 0.33, Z + (k / 3 - 0.5) * (wz - 0.06));
    [0.32, 0.6].forEach((y, k) => add(box(0.04, 0.05, wz), wood(lk.wood), 8 + k, X + sx * dx * 0.42, y, Z));
  } else if (s.t === 'water') {
    /* a low trough: four planks around a floor, painted blue, with a strip of water showing along the inside */
    const h = 0.16; add(box(dx, 0.04, wz), wood(lk.dark), 1, X, 0.03, Z);
    [-1, 1].forEach((q, k) => { add(jit(box(0.05, h, wz + 0.05), 0.006, k), wood(lk.wood), 2 + k, X + q * (dx / 2), h / 2, Z); add(jit(box(dx, h, 0.05), 0.006, k + 4), wood(lk.wood), 4 + k, X, h / 2, Z + q * (wz / 2)); });
    [-1, 1].forEach((q, k) => add(box(0.06, 0.08, 0.06), '#5e3f2a', 7 + k, X, 0.04, Z + q * (wz / 2 - 0.06)));
  } else if (s.t === 'carrot') {
    /* a round-cornered wicker basket: woven bands in two tones */
    const h = 0.14; add(box(dx, 0.04, wz), wood(lk.dark), 1, X, 0.03, Z);
    for (let j = 0; j < 3; j++) { const col = j % 2 ? lk.wood : '#a2763f', y = 0.03 + j * 0.05;
      [-1, 1].forEach((q, k) => { add(box(0.045, 0.05, wz + 0.04), col, 10 + j * 4 + k, X + q * (dx / 2), y + 0.025, Z); add(box(dx + 0.04, 0.05, 0.045), col, 12 + j * 4 + k, X, y + 0.025, Z + q * (wz / 2)); }); }
    [-1, 1].forEach((q, k) => { const hd = new T.TorusGeometry(0.1, 0.014, 4, 10, Math.PI); add(hd, lk.dark, 30 + k, X, h + 0.02, Z + q * (wz / 2)); });
  } else {
    /* the grain bin: a sturdy open box with corner posts and a lid leaning on the fence */
    const h = 0.18; add(box(dx, 0.04, wz), wood(lk.dark), 1, X, 0.03, Z);
    [-1, 1].forEach((q, k) => { add(jit(box(0.05, h, wz + 0.05), 0.006, k), wood(lk.wood), 2 + k, X + q * (dx / 2), h / 2, Z); add(jit(box(dx, h, 0.05), 0.006, k + 4), wood(lk.wood), 4 + k, X, h / 2, Z + q * (wz / 2)); });
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([p, q], k) => add(box(0.07, h + 0.04, 0.07), wood(lk.dark), 8 + k, X + p * dx / 2, (h + 0.04) / 2, Z + q * wz / 2));
    const lid = box(0.04, 0.34, wz * 0.9); lid.rotateZ(sx * 0.28); add(lid, wood(lk.wood), 14, X + sx * (dx / 2 + 0.05), 0.2, Z);
  }
  /* a soft round mark for each place, so an empty place shows as a gap */
  grid.forEach((q, k) => { if (q[2] > 0.15) return; const d = new T.CylinderGeometry(0.075, 0.075, 0.012, 10); add(d, lk.base, 40 + k, X - sx * q[0], 0.06, Z + q[1]); });
  /* a picture label on the front of the holder, leaning back a little so it faces the camera */
  const fz = Z + wz / 2 + 0.05, fy = s.t === 'hay' ? 0.2 : 0.17, bk = new T.BoxGeometry(0.34, 0.3, 0.03); bk.translate(0, 0, -0.018); bk.rotateX(-0.42); add(bk, '#6e4426', 60, X, fy, fz);
  const sg = new T.Mesh(new T.PlaneGeometry(0.31, 0.27), stockSign(s.t)); sg.position.set(X, fy, fz); sg.rotation.x = -0.42; g.add(sg);
  s.sign = sg;
}
/* the food pile of a pen: each item sits in its own food's spot, in the first free place */
function stockPile(a, g) {
  const sx = penSide(a), spots = stockSpots(a), by = {}, L = []; spots.forEach((s) => { by[s.t] = s; stockHolder(a, g, s, sx, L); }); merged(L, MAT, g);
  const pile = new Pile(g, (i, m) => {
    const t = m.userData.type, s = by[t] || spots[0], k = pile.items.slice(0, i).filter((o) => o.userData.type === t).length, grid = stockGrid(s.t, s.gap), q = grid[k % 6], up = Math.floor(k / 6) * 0.2;
    return [s.x - sx * q[0], q[2] + up, s.z + q[1], q[3]];
  });
  pile.spots = by; return pile;
}
/* where food lands in a pen, and where an animal waits for a food */
function stockAt(pen, t) { const s = pen.food.spots && pen.food.spots[t]; return s ? [s.x, s.z] : [0, 0]; }
if (window.__farmTest) window.__stock = { fill: (a, t, n) => { const pen = pens[a] || buildPen(a); for (let k = 0; k < n; k++) pen.food.add(mk(t)); return pen.food.items.length; }, spots: (a) => stockSpots(a).map((s) => s.t + '@' + s.z.toFixed(2)).join(' ') };
