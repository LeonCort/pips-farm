/* ---------- the town: a square with a fountain, lamps, hedges, flowers, landmarks, and a picture map ---------- */
/* static pieces are painted once and merged into one mesh, so the whole town costs only a few draw calls */
const LAMPS = [], FLOWERS = [];
/* the market street layout (used by market.js): facilities on the south side face north (f 1), on the north side face south (f -1) */
const MKT = VARIANT === 'near' ? {
  /* 'near': every stall stands in front of what makes its goods: hens behind the eggs, cows behind the milk,
     apple trees behind the apples, the bakery behind the cakes; the counter sells a bit of everything at the west end */
  shop: { x: 10.2, z: 2.75 },
  stalls: { egg: { x: 13.8, z: 2.6, f: 1 }, cake: { x: 19.0, z: 2.6, f: 1 }, milk: { x: 15.6, z: -2.6, f: -1 }, apple: { x: 19.2, z: -2.6, f: -1 } },
  bakery: { x: 19.8, z: 6.0, f: 1 },
  trees: [[19.4, -6.2], [20.6, -7.2], [18.5, -7.9]],
  signs: [[8.9, -2.0], [21.6, -2.3], [21.6, 2.3]],
  helpers: [[9.0, 5.4], [10.2, 6.0]],
  entry: [23.0, -0.35], exit: [23.0, 0.35]
} : {
  /* 'van': the truck parks in a yard right behind the south stalls (egg, milk, cake) and the counter,
     so unloading is a few steps; the apple trees stand in a row below the stalls and the bakery behind the cake stall */
  shop: { x: 10.4, z: 2.75 },
  stalls: { egg: { x: 13.6, z: 2.6, f: 1 }, milk: { x: 16.4, z: 2.6, f: 1 }, cake: { x: 19.0, z: 2.6, f: 1 }, apple: { x: 13.6, z: -2.6, f: -1 } },
  bakery: { x: 19.6, z: 6.4, f: 1 },
  trees: [[11.9, 8.0], [13.8, 7.7], [15.7, 7.6]], /* in a row below the stalls, south of the truck's yard */
  signs: [[8.9, -2.0], [21.0, -2.3], [21.4, 2.3]],
  helpers: [[9.2, 5.2], [10.9, 5.75]],
  entry: [23.0, -0.35], exit: [23.0, 0.35]
};

/* the fountain in the middle of the square */
const fountain = (() => {
  const P = at(0, 0, 0), ST = '#cfc6bd';
  P(jit(cyl(1.08, 1.14, 0.42, 14, true), 0.015, 701), ST, 701, 0, 0.21, 0);
  P(jit(cyl(0.9, 0.92, 0.38, 14, true), 0.01, 702), ST, 702, 0, 0.2, 0);
  P(new T.RingGeometry(0.9, 1.08, 14, 1).rotateX(-Math.PI / 2), '#e2dad0', 703, 0, 0.42, 0);
  P(cyl(0.16, 0.22, 0.9, 8), ST, 704, 0, 0.6, 0);
  P(cyl(0.46, 0.3, 0.16, 10), ST, 705, 0, 1.08, 0);
  const water = new T.Mesh(new T.CircleGeometry(0.9, 18), new T.MeshStandardMaterial({ color: PAL.seaShallow, roughness: 0.25, metalness: 0 })); water.rotation.x = -Math.PI / 2; water.position.y = 0.34; water.receiveShadow = true; sc.add(water);
  const top = new T.Mesh(new T.CircleGeometry(0.42, 12), water.material); top.rotation.x = -Math.PI / 2; top.position.y = 1.17; sc.add(top);
  const dropMat = new T.MeshBasicMaterial({ color: '#d9f1f4' }), drops = [];
  for (let k = 0; k < 14; k++) { const m = new T.Mesh(new T.SphereGeometry(0.045, 5, 4), dropMat); m.userData = { a: k / 14 * 6.283, p: hash(k, 731) }; sc.add(m); drops.push(m); }
  solid(0, 0, 1.2);
  return { water, drops };
})();

/* the signpost: arrows to the four corners of the island, and the picture map on top */
const SIGN = { x: 2.45, z: -2.25 };
{
  const P = at(SIGN.x, SIGN.z, 0);
  P(cyl(0.07, 0.09, 2.0, 6), PAL.trunk, 711, 0, 1.0, 0);
  [[-1, 0, PAL.accent, 1.75], [1, 0, PAL.ochre, 1.5], [0, 1, PAL.sea, 1.25], [0, -1, PAL.leaf, 1.0]].forEach(([dx, dz, col, y], k) => {
    const ry = Math.atan2(-dz, dx), L = 0.72;
    const g = fac(box(L, 0.2, 0.05), col, 712 + k); g.translate(L / 2 + 0.06, y, 0); const tip = fac(new T.ConeGeometry(0.15, 0.2, 3).rotateZ(-Math.PI / 2), col, 716 + k); tip.translate(L + 0.15, y, 0);
    [g, tip].forEach((q) => { q.rotateY(ry); q.translate(SIGN.x, 0, SIGN.z); STATIC.push(q); });
  });
  solid(SIGN.x, SIGN.z, 0.3);
}
const signBubble = new T.Sprite(new T.SpriteMaterial({ map: bubble('map'), depthTest: false })); signBubble.renderOrder = 4; signBubble.scale.set(0.95, 0.95, 1); signBubble.position.set(SIGN.x, 2.55, SIGN.z); sc.add(signBubble);

/* benches facing the fountain, and a flower planter */
function bench(x, z) {
  const P = at(x, z, faceTo(x, z, 0, 0)), W = '#b9805a';
  P(box(1.2, 0.07, 0.38), W, 721, 0, 0.42, 0); P(box(1.2, 0.26, 0.06), W, 722, 0, 0.66, -0.2, { rx: -0.15 });
  [-0.5, 0.5].forEach((q) => { P(box(0.07, 0.42, 0.3), PAL.ink, 723, q, 0.21, 0); });
  deco(x, z, 0.9);
}
bench(2.75, 2.05); bench(-2.75, -2.05);
const PLANTER = { x: -2.35, z: 2.6 };
{ const P = at(PLANTER.x, PLANTER.z, faceTo(PLANTER.x, PLANTER.z, 0, 0)); P(jit(box(1.1, 0.36, 0.55), 0.01, 731), '#a8714d', 731, 0, 0.18, 0); P(box(1.0, 0.04, 0.45), '#6b4a3c', 732, 0, 0.37, 0); deco(PLANTER.x, PLANTER.z, 0.9); }

/* street lamps: dark posts, lamp heads that light up at dusk, and a soft glow */
[45, 135, 225, 315].forEach((a) => LAMP_AT.push([Math.cos(a * Math.PI / 180) * 4.1, Math.sin(a * Math.PI / 180) * 4.1]));
[30, 60, 120, 210, 240, 300].forEach((a) => LAMP_AT.push([Math.cos(a * Math.PI / 180) * RING.rx * 1.13, Math.sin(a * Math.PI / 180) * RING.rz * 1.13]));
LAMP_AT.push([9.4, 1.35], [9.4, -1.35], [22.2, 1.35], [22.2, -1.35], [1.15, 12.4], [-1.15, 12.4], [-11.6, -6.6], [-11.6, 6.6]);
LAMP_AT.forEach(([x, z], k) => {
  const P = at(x, z, 0);
  mlLamp(P); /* iron lamp with a stone foot and lantern (marketlook.js) */
  const g = new T.BoxGeometry(0.2, 0.22, 0.2); g.translate(x, 1.68, z); LAMPS.push(g);
  const sp = new T.Sprite(glowMat); sp.scale.set(1.5, 1.5, 1); sp.position.set(x, 1.68, z); sc.add(sp);
  deco(x, z, 0.45);
});

/* hedges along the harbour avenue */
[-1.5, 1.5].forEach((x) => [[4.3, 6.8], [8.4, 11.6]].forEach(([z0, z1], k) => {
  const L = z1 - z0, P = at(x, (z0 + z1) / 2, 0, SWAYL), B = [];
  for (let z = -L / 2 + 0.18; z <= L / 2 - 0.12; z += 0.2) { const r = 0.2 + hash(z, k + 3) * 0.06, sd = hash(z, k + 5) > 0.5 ? 1 : -1; B.push(ico(r, 1, 751 + z * 10, r * 0.1).translate(sd * 0.09, 0.24 + hash(k, z) * 0.06, z)); B.push(ico(r * 0.85, 1, 761 + z * 10, r * 0.1).translate(-sd * 0.1, 0.42 + hash(z, 9) * 0.08, z + 0.1)); if (hash(z, 11) > 0.5) B.push(ico(r * 0.7, 1, 771 + z * 10, r * 0.1).translate((hash(z, 13) - 0.5) * 0.12, 0.58, z)); }
  P(mergeGeos(B), (cx, cy, cz, i) => leafY(PAL.forest, cy, 0.0, 0.7, i), 751 + k, 0, 0, 0);
  for (let z = z0; z <= z1; z += 0.5) deco(x, z, 0.45);
}));

/* the kitchen garden: a low picket fence with a gate, beehives and a scarecrow */
{
  const W = '#f3ead8', P = at(0, 0, 0);
  const run = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 0.3)), ry = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i <= n; i++) { const t = i / n; P(box(0.07, 0.42, 0.05), W, 761, x0 + (x1 - x0) * t, 0.21, z0 + (z1 - z0) * t, { ry }); }
    [0.14, 0.3].forEach((y) => P(box(0.04, 0.05, L), W, 762, (x0 + x1) / 2, y, (z0 + z1) / 2, { ry })); };
  run(8.1, -6.1, 11.9, -6.1); run(11.9, -6.1, 11.9, -3.5); run(8.1, -6.1, 8.1, -5.2); run(8.1, -4.4, 8.1, -3.5); run(11.9, -3.5, 10.6, -3.5); run(9.4, -3.5, 8.1, -3.5);
  [[8.1, -5.2], [8.1, -4.4]].forEach(([x, z]) => P(box(0.1, 0.6, 0.1), PAL.trunk, 763, x, 0.3, z));
  for (let x = 8.1; x <= 11.95; x += 0.6) deco(x, -6.1, 0.5); for (let z = -6.1; z <= -3.45; z += 0.6) { deco(8.1, z, 0.5); deco(11.9, z, 0.5); } deco(10, -4.8, 2.0);
  (VARIANT === 'near' ? [[8.75, -6.95], [7.7, -6.4]] : [[8.75, -6.95], [11.25, -6.95]]).forEach(([x, z], k) => { const Q = at(x, z, Math.PI); Q(box(0.5, 0.12, 0.5), PAL.trunk, 764, 0, 0.3, 0); Q(jit(box(0.44, 0.22, 0.44), 0.01, 765 + k), '#f2c14a', 765 + k, 0, 0.47, 0); Q(jit(box(0.44, 0.2, 0.44), 0.01, 767 + k), '#e8b43a', 767 + k, 0, 0.68, 0); Q(box(0.54, 0.06, 0.54), PAL.paper, 769, 0, 0.82, 0); Q(box(0.12, 0.04, 0.02), PAL.ink, 770, 0, 0.42, 0.23); [0.24, 0.24].forEach((q, j) => Q(box(0.06, 0.3, 0.06), PAL.trunk, 771, j ? 0.18 : -0.18, 0.15, 0)); deco(x, z, 0.6); });
  const S = at(10.0, -6.85, 0); S(cyl(0.04, 0.05, 1.3, 5), PAL.trunk, 772, 0, 0.65, 0); S(box(0.95, 0.06, 0.06), PAL.trunk, 773, 0, 0.95, 0); S(jit(box(0.36, 0.42, 0.22), 0.02, 774), '#5a7fb0', 774, 0, 0.92, 0); S(ico(0.15, 1, 775), '#f0d6a8', 775, 0, 1.32, 0); S(cyl(0.0, 0.26, 0.18, 8), '#e0b04a', 776, 0, 1.5, 0); S(cyl(0.26, 0.26, 0.03, 10), '#e0b04a', 777, 0, 1.41, 0); [-1, 1].forEach((s) => S(box(0.1, 0.12, 0.08), '#e0b04a', 778, s * 0.5, 0.92, 0)); deco(10.0, -6.85, 0.6);
}

{
  /* bunting: a string of flags along each side of the market street */
  const P = at(0, 0, 0), cols = [PAL.accent, '#f2c14a', PAL.sea, PAL.paper, PAL.leaf], X0 = 9.0, X1 = 21.4;
  (VARIANT === 'near' ? [[1.5, [X0, 12.4, 16.4, X1]], [-1.5, [X0, 12.2, 17.4, X1]]] : [[1.5, [X0, 11.95, 15.0, 17.7, X1]], [-1.5, [X0, 12.2, 15.4, 18.4, X1]]]).forEach(([z, posts], j) => {
    posts.forEach((x) => { P(cyl(0.05, 0.06, 2.4, 6), PAL.trunk, 795, x, 1.2, z); deco(x, z, 0.4); });
    const tri = new Float32Array([-0.11, 0, 0, 0.11, 0, 0, 0, -0.24, 0, 0.11, 0, 0, -0.11, 0, 0, 0, -0.24, 0]);
    for (let s = 0; s < posts.length - 1; s++) { const a = posts[s], b = posts[s + 1], L = b - a, n = Math.round(L / 0.3), y0 = 2.32;
      for (let k = 0; k < n; k++) { const u = (k + 0.5) / n, y = y0 - Math.sin(u * Math.PI) * 0.3; const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(tri.slice(), 3)); P(g, cols[(k + j * 2 + s) % 5], 796 + k, a + u * L, y - 0.02, z); }
      for (let k = 0; k < 8; k++) { const u0 = k / 8, u1 = (k + 1) / 8, ya = y0 - Math.sin(u0 * Math.PI) * 0.3, yb = y0 - Math.sin(u1 * Math.PI) * 0.3; P(box(L / 8 + 0.02, 0.025, 0.025), PAL.ink, 797, a + (u0 + u1) / 2 * L, (ya + yb) / 2, z, { rz: Math.atan2(yb - ya, L / 8) }); } }
  });
}

/* the windmill by the hay meadow; its sails turn faster when it is windy */
const MILL = { x: 5.7, z: -12.6 };
const millSails = (() => {
  const ry = faceTo(MILL.x, MILL.z, 0, 0), P = at(MILL.x, MILL.z, ry), cap = capAt(MILL.x, MILL.z, ry);
  P(jit(new T.CylinderGeometry(0.62, 0.95, 2.6, 14, 4), 0.015, 801), (cx, cy, cz, i) => wallY(PAL.paper, cy + 1.3, 2.6, i), 801, 0, 1.3, 0); P(cyl(0.98, 1.02, 0.2, 8), PAL.rock, 802, 0, 0.1, 0);
  P(new T.ConeGeometry(0.82, 0.9, 8), PAL.accent, 803, 0, 3.05, 0); snowCap(cap, new T.ConeGeometry(0.86, 0.94, 8, 1, true), 0, 3.07, 0);
  P(box(0.42, 0.62, 0.06), PAL.trunk, 804, 0, 0.31, 0.9); P(box(0.28, 0.28, 0.05), '#5a7fb0', 805, 0, 1.75, 0.76);
  const g = new T.Group(); g.position.set(MILL.x, 2.55, MILL.z); g.rotation.y = ry; sc.add(g);
  const s = new T.Group(); s.position.z = 0.88; g.add(s);
  part(fac(cyl(0.12, 0.12, 0.22, 8).rotateX(Math.PI / 2), PAL.trunk, 806), s);
  for (let k = 0; k < 4; k++) { const b = new T.Group(); b.rotation.z = k * Math.PI / 2; s.add(b); part(fac(box(0.06, 1.75, 0.04), PAL.trunk, 807), b, 0, 0.95, 0); part(fac(box(0.34, 1.35, 0.02), '#f3ead8', 808 + k), b, 0.2, 1.05, 0.02); }
  solid(MILL.x, MILL.z, 1.05);
  return s;
})();

/* the big barn at the end of the farm lane */
const BARN = { x: -13.4, z: -9.1 };
{
  const P = at(BARN.x, BARN.z, 0), cap = capAt(BARN.x, BARN.z, 0), R = '#c4553f';
  P(jit(box(3.0, 1.7, 2.4, 3, 2, 3), 0.02, 811), (cx, cy, cz, i) => wallY(R, cy + 0.85, 1.7, i), 811, 0, 0.85, 0);
  const gable = new T.BufferGeometry(); gable.setAttribute('position', new T.BufferAttribute(new Float32Array([-1.5, 0, 0, 1.5, 0, 0, 0, 1.0, 0]), 3));
  [1.2, -1.2].forEach((z, k) => { const g = gable.clone(); if (k) g.rotateY(Math.PI); P(g, R, 812, 0, 1.7, z); });
  [-1, 1].forEach((s) => { P(box(1.85, 0.08, 2.7), '#6b4a3c', 813, s * 0.78, 2.22, 0, { rz: -s * 0.58 }); snowCap(cap, box(1.9, 0.06, 2.75).rotateZ(-s * 0.58), s * 0.78, 2.28, 0); });
  P(box(1.2, 1.25, 0.06), PAL.paper, 814, 0, 0.63, 1.22); P(box(1.06, 1.1, 0.04), '#a8442f', 815, 0, 0.62, 1.25);
  [0.73, -0.73].forEach((r) => P(box(0.08, 1.5, 0.03), PAL.paper, 816, 0, 0.62, 1.28, { rz: r }));
  P(box(0.5, 0.42, 0.05), PAL.paper, 817, 0, 2.05, 1.22); P(box(0.38, 0.3, 0.04), PAL.trunk, 818, 0, 2.05, 1.25);
  for (let k = 0; k < 3; k++) P(jit(cyl(0.32, 0.32, 0.55, 8).rotateZ(Math.PI / 2), 0.02, 819 + k), PAL.ochre, 819 + k, 1.95, 0.32 + (k === 2 ? 0.55 : 0), 0.6 - (k % 2) * 0.62);
  solid(BARN.x, BARN.z, 1.55); solid(BARN.x - 0.9, BARN.z, 1.2); solid(BARN.x + 0.9, BARN.z, 1.2);
}

/* the fish hut by the harbour */
const HUT = { x: 2.9, z: 11.7 };
{
  const P = at(HUT.x, HUT.z, -Math.PI / 2), cap = capAt(HUT.x, HUT.z, -Math.PI / 2), B = '#5f8ea0';
  P(jit(box(1.5, 1.0, 1.2, 2, 2, 2), 0.015, 821), (cx, cy, cz, i) => wallY(B, cy + 0.5, 1.0, i), 821, 0, 0.5, 0);
  const gable = new T.BufferGeometry(); gable.setAttribute('position', new T.BufferAttribute(new Float32Array([-0.75, 0, 0, 0.75, 0, 0, 0, 0.55, 0]), 3));
  [0.6, -0.6].forEach((z, k) => { const g = gable.clone(); if (k) g.rotateY(Math.PI); P(g, B, 822, 0, 1.0, z); });
  [-1, 1].forEach((s) => { P(box(0.98, 0.06, 1.42), PAL.accent, 823, s * 0.4, 1.3, 0, { rz: -s * 0.62 }); snowCap(cap, box(1.0, 0.05, 1.45).rotateZ(-s * 0.62), s * 0.4, 1.35, 0); });
  P(box(0.42, 0.7, 0.05), PAL.trunk, 824, 0, 0.35, 0.62); P(box(0.3, 0.26, 0.04), PAL.paper, 825, 0.48, 0.62, 0.62);
  P(jit(cyl(0.2, 0.22, 0.48, 8), 0.01, 826), PAL.trunk, 826, -0.95, 0.24, 0.5); P(box(0.44, 0.28, 0.34), PAL.ochre, 827, 0.95, 0.14, 0.62);
  for (let k = 0; k < 3; k++) P(box(0.05, 0.05, 0.05), '#c9d6dc', 828, -0.4 + k * 0.4, 0.92, 0.64);
  solid(HUT.x, HUT.z, 0.95);
}

/* the lighthouse on the north-east point; at night its lamp turns and sweeps the sea */
const LIGHT = { x: 12.8, z: 12.4 };
const beam = (() => {
  const P = at(LIGHT.x, LIGHT.z, 0), cap = capAt(LIGHT.x, LIGHT.z, 0);
  P(jit(cyl(0.95, 1.15, 0.35, 9), 0.05, 831), PAL.rock, 831, 0, 0.17, 0);
  for (let k = 0; k < 5; k++) { const r0 = 0.72 - k * 0.05; P(cyl(r0 - 0.05, r0, 0.7, 12), k % 2 ? PAL.accent : PAL.paper, 832 + k, 0, 0.35 + 0.35 + k * 0.7, 0); }
  P(cyl(0.68, 0.68, 0.1, 12), '#3a3f48', 838, 0, 3.9, 0); P(cyl(0.1, 0.1, 0.12, 6), '#3a3f48', 839, 0, 4.05, 0);
  P(box(0.3, 0.5, 0.05), PAL.trunk, 840, 0, 0.6, 0.71);
  P(new T.ConeGeometry(0.55, 0.5, 12), PAL.accent, 841, 0, 4.73, 0); snowCap(cap, new T.ConeGeometry(0.58, 0.52, 12, 1, true), 0, 4.75, 0);
  const lamp = new T.CylinderGeometry(0.4, 0.4, 0.5, 10); lamp.translate(LIGHT.x, 4.23, LIGHT.z); LAMPS.push(lamp);
  const sp = new T.Sprite(glowMat); sp.scale.set(2.8, 2.8, 1); sp.position.set(LIGHT.x, 4.23, LIGHT.z); sc.add(sp);
  const g = new T.Group(); g.position.set(LIGHT.x, 4.23, LIGHT.z); sc.add(g);
  const mat = new T.MeshBasicMaterial({ color: '#fff1c4', transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, fog: false });
  [0, Math.PI].forEach((r) => { const c = new T.ConeGeometry(1.3, 12, 16, 1, true); c.translate(0, -6, 0); c.rotateZ(Math.PI / 2); const m = new T.Mesh(c, mat); m.rotation.y = r; g.add(m); });
  g.visible = false; solid(LIGHT.x, LIGHT.z, 1.0);
  return { g, mat };
})();

/* the duck pond by the woods; it freezes in winter */
const POND = { x: -4.4, z: 10.9, r: 1.6 };
const pond = (() => {
  const P = at(POND.x, POND.z, 0);
  const sh = new T.Shape(); for (let k = 0; k <= 24; k++) { const a = k / 24 * 6.283, r = POND.r * (1 + 0.08 * Math.sin(a * 3 + 1)); if (k) sh.lineTo(Math.cos(a) * r * 1.2, Math.sin(a) * r); else sh.moveTo(Math.cos(a) * r * 1.2, Math.sin(a) * r); }
  const water = new T.Mesh(new T.ShapeGeometry(sh), new T.MeshStandardMaterial({ color: PAL.sea, roughness: 0.25 })); water.rotation.x = -Math.PI / 2; water.position.set(POND.x, 0.03, POND.z); water.receiveShadow = true; sc.add(water);
  for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283, r = POND.r * (1 + 0.08 * Math.sin(a * 3 + 1)) + 0.12; P(ico(0.16 + hash(k, 841) * 0.08, 0, 842 + k), PAL.rock, 842 + k, Math.cos(a) * r * 1.2, 0.05, -Math.sin(a) * r); }
  for (let k = 0; k < 5; k++) { const a = 2.2 + k * 0.22; P(cyl(0.02, 0.02, 0.6 + hash(k, 850) * 0.3, 4), '#6f8f4a', 851, Math.cos(a) * POND.r * 1.05, 0.3, -Math.sin(a) * POND.r * 0.85); P(cyl(0.04, 0.04, 0.16, 5), '#7d5e4e', 852, Math.cos(a) * POND.r * 1.05, 0.62 + hash(k, 850) * 0.3, -Math.sin(a) * POND.r * 0.85); }
  const ducks = [0, 1, 2].map((i) => { const g = new T.Group(); sc.add(g); part(fac(ico(0.15, 1, 861 + i, 0.01).scale(1.1, 0.75, 1.4), i === 2 ? '#d9b07a' : PAL.paper, 861 + i), g, 0, 0.1, 0); part(fac(ico(0.09, 1, 864 + i, 0.005), i === 0 ? '#3f7d62' : i === 2 ? '#d9b07a' : PAL.paper, 864 + i), g, 0, 0.27, 0.14); const bk = new T.ConeGeometry(0.035, 0.1, 4); bk.rotateX(Math.PI / 2); part(fac(bk, PAL.ochre, 867), g, 0, 0.25, 0.26); return { g, r: 0.45 + i * 0.32, p: i * 2.1, s: (i % 2 ? -1 : 1) * (0.35 + i * 0.08) }; });
  solid(POND.x, POND.z, 1.55); solid(POND.x - 0.9, POND.z, 1.2); solid(POND.x + 0.9, POND.z, 1.2);
  return { water, ducks };
})();

/* flowers: along the roads and round the square, wild in the grass, never on paths, pens, pads or buildings */
function blocked(x, z) {
  if (isleD(x, z) > 0.93 || roadKind(x, z)) return true;
  for (const a in PEN) { const p = penMax(a); if (Math.abs(x - p.x) < p.w / 2 + 1.3 && Math.abs(z - p.z) < p.d / 2 + 0.9) return true; }
  for (const t in SRC) if (Math.hypot(x - SRC[t].x, z - SRC[t].z) < 1.5) return true;
  for (const p of PADS) { const q = padPos(p); if (Math.hypot(x - q[0], z - q[1]) < 0.9) return true; }
  if (Math.abs(x - HOUSE.x) < 2.3 && z > HOUSE.z - 2.2 && z < HOUSE.z + 2.3) return true;
  if (x > MEADOW.x0 - 0.6 && x < MEADOW.x1 + 0.6 && z > MEADOW.z0 - 0.6 && z < MEADOW.z1 + 0.6) return true;
  if (Math.hypot(x - TRACTOR_HOME[0], z - TRACTOR_HOME[1]) < 2.2 || Math.hypot(x - SHIP_AT[0], z - SHIP_AT[1]) < 1.3 || Math.hypot(x - KENNEL.x, z - KENNEL.z) < 1.6) return true;
  if (Math.abs(x - DOCK.x) < 1.4 && z > DOCK.edge - 1.8) return true;
  if (x > 8.6 && z > -4.6 && z < 5.8) return true; /* the market street */
  if (x > 11 && z > -10 && z < 9.5) return true; /* pens, yard, trees and bakery around the market */
  if (VARIANT === 'van' && x > 5.3 && z > 4.4 && z < 7.4) return true; /* the truck's lane into the yard */
  for (const [tx, tz] of MKT.trees) if (Math.hypot(x - tx, z - tz) < 1.6) return true;
  for (const k in MKT.stalls) if (Math.hypot(x - MKT.stalls[k].x, z - MKT.stalls[k].z) < 2.5) return true;
  for (const d of DECO) if (Math.hypot(x - d.x, z - d.z) < d.r) return true;
  return false;
}
const FLOWER_COL = ['#f6b8c8', '#f2c14a', '#e9684a', '#fffbf4', '#b9a2e0', '#f29a3a'];
let flowerN = 0;
function flower(x, z, k, col) {
  if (blocked(x, z)) return false;
  const h = 0.12 + hash(k, 871) * 0.1, c = col || FLOWER_COL[Math.floor(hash(k, 872) * FLOWER_COL.length)];
  const st = fac(box(0.025, h, 0.025), '#5d8a4a', k); st.translate(x, h / 2, z); FLOWERS.push(st);
  const pe = fac(ico(0.075, 0, k, 0.01).scale(1, 0.55, 1), c, k); pe.translate(x, h + 0.02, z); FLOWERS.push(pe);
  const ce = fac(new T.BoxGeometry(0.05, 0.03, 0.05), '#f6d27a', k); ce.translate(x, h + 0.06, z); FLOWERS.push(ce);
  flowerN++; return true;
}
function clump(x, z, k, n) { const c = FLOWER_COL[Math.floor(hash(k, 873) * FLOWER_COL.length)]; for (let j = 0; j < n; j++) { const a = hash(k, j + 1) * 6.283, r = j ? 0.1 + hash(j, k) * 0.12 : 0; flower(x + Math.cos(a) * r, z + Math.sin(a) * r, k * 7 + j, hash(k, j + 9) > 0.8 ? null : c); } }
{
  let k = 1;
  /* road edges */
  ROADS.forEach((r) => { if (r[5] === 2) return; const L = Math.hypot(r[2] - r[0], r[3] - r[1]), nx = -(r[3] - r[1]) / L, nz = (r[2] - r[0]) / L, off = r[4] + 0.3;
    for (let s = 0.4; s < L; s += 0.85) [-1, 1].forEach((side) => { k++; if (hash(k, 881) < 0.5) clump(r[0] + (r[2] - r[0]) * s / L + nx * off * side, r[1] + (r[3] - r[1]) * s / L + nz * off * side, k, 2 + Math.floor(hash(k, 882) * 2)); }); });
  for (let a = 0; a < 6.283; a += 0.11) [-1, 1].forEach((side) => { k++; if (hash(k, 883) < 0.45) { const e = 1 + side * 0.92 / 7.8; clump(Math.cos(a) * RING.rx * e, Math.sin(a) * RING.rz * e, k, 2 + Math.floor(hash(k, 884) * 2)); } });
  /* round the square, in four beds between the roads */
  for (let a = 0; a < 6.283; a += 0.13) { const q = ((a + 0.3927) % 1.5708) - 0.3927; if (Math.abs(q) < 0.32) continue; k++; clump(Math.cos(a) * 3.8, Math.sin(a) * 3.8, k, 3); }
  /* the planter on the square */
  for (let j = 0; j < 8; j++) { const x = PLANTER.x + (j % 4 - 1.5) * 0.24, z = PLANTER.z + (j < 4 ? -0.1 : 0.1); const ry = faceTo(PLANTER.x, PLANTER.z, 0, 0), dx = x - PLANTER.x, dz = z - PLANTER.z, c = Math.cos(ry), s = Math.sin(ry);
    const h = 0.18, st = fac(box(0.025, h, 0.025), '#5d8a4a', j); st.translate(PLANTER.x + dx * c + dz * s, 0.38 + h / 2, PLANTER.z - dx * s + dz * c); FLOWERS.push(st);
    const pe = fac(ico(0.08, 0, j, 0.01).scale(1, 0.55, 1), FLOWER_COL[j % 3 ? 0 : 2], j); pe.translate(PLANTER.x + dx * c + dz * s, 0.38 + h + 0.02, PLANTER.z - dx * s + dz * c); FLOWERS.push(pe); }
  /* wild flowers in the grass */
  for (let x = -19; x <= 19; x += 1.25) for (let z = -13; z <= 13; z += 1.25) { k++; if (hash(k, 885) < 0.16) clump(x + (hash(k, 886) - 0.5) * 1.0, z + (hash(k, 887) - 0.5) * 1.0, k, 1 + Math.floor(hash(k, 888) * 3)); }
}
const staticMesh = merged(STATIC);
const lampMesh = merged(LAMPS, lampMat); lampMesh.castShadow = false;
const flowerMesh = merged(FLOWERS); flowerMesh.castShadow = false;
STATIC.length = LAMPS.length = FLOWERS.length = 0;


/* the places on the picture map: where Pip walks to, and where the picture sits on the map */
const PLACES = {
  farm: { x: -12.6, z: 0, mx: -13.6, mz: 0, sv: 'Gården' },
  meadow: { x: 0, z: -9.0, mx: 4.2, mz: -11.6, sv: 'Ängen' },
  garden: { x: 8.4, z: -4.8, mx: 9.8, mz: -6.2, sv: 'Trädgården' },
  market: { x: 14.4, z: 0, mx: 16.4, mz: 0, sv: 'Marknaden' },
  harbour: { x: FISHSPOT.x, z: FISHSPOT.z, mx: 0, mz: 13.2, sv: 'Bryggan' },
  woods: { x: -4.9, z: 8.6, mx: -5.4, mz: 10.2, sv: 'Dammen' },
  home: { x: HDOOR.x, z: HDOOR.z, mx: -1.8, mz: -4.8, sv: 'Huset' }
};
function routeTo(k) {
  const P = PLACES[k]; if (!P || inHouse || trip || dressing) return false;
  if (fishing) stopFishing();
  ROUTE.pts = roadPath(pip.position.x, pip.position.z, P.x, P.z); ROUTE.i = 0; ROUTE.dest = k;
  Snd.play('whoosh', { gain: 0.3 }); return true;
}
function routeStop() { if (ROUTE.pts) { ROUTE.pts = null; ROUTE.dest = null; } }

/* ---------- the picture map ---------- */
const MAP_CSS = `
.mapBtn { position: fixed; top: max(14px, env(safe-area-inset-top, 0px)); right: calc(max(16px, env(safe-area-inset-right, 0px)) + 172px); width: 68px; height: 68px; border-radius: 50%; border: 3px solid #22303c; background: #fff6e4; box-shadow: 0 5px 0 rgba(34,48,60,0.3); padding: 5px; }
.mapBtn img { width: 100%; height: 100%; display: block; pointer-events: none; }
.mapBtn:active { transform: translateY(3px); box-shadow: 0 2px 0 rgba(34,48,60,0.3); }
.mapBtn .dot { display: none; position: absolute; top: -4px; right: -4px; width: 22px; height: 22px; border-radius: 50%; background: #e9684a; border: 3px solid #22303c; }
.mapBtn.wait .dot { display: block; }
.townMap { position: fixed; inset: 0; z-index: 40; background: rgba(34,48,60,0.45); display: grid; place-items: center; padding: 14px; }
.townMap[hidden] { display: none; }
.tmSheet { position: relative; width: min(1000px, 100%, calc(84vh * 53 / 35 + 28px)); background: #fff6e4; border: 4px solid #22303c; border-radius: 28px; padding: 10px; box-shadow: 0 8px 0 rgba(34,48,60,0.3); animation: pop 0.22s ease-out; }
.tmSheet svg { width: 100%; height: auto; max-height: 84vh; display: block; border-radius: 20px; touch-action: manipulation; }
.tmClose { position: absolute; top: -20px; right: -14px; width: 62px; height: 62px; border-radius: 50%; border: 3px solid #22303c; background: #fff6e4; box-shadow: 0 4px 0 rgba(34,48,60,0.3); display: grid; place-items: center; padding: 0; }
.tmClose svg { width: 30px; height: 30px; }
.tmPl { cursor: pointer; }
.tmPl:active .tmBg { fill: #ffe7b0; }
.tmBd { animation: tmBob 1.3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.tmPip { animation: tmBob 1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes tmBob { 50% { transform: scale(1.14); } }
@media (max-width: 480px) { .mapBtn { width: 60px; height: 60px; right: calc(max(16px, env(safe-area-inset-right, 0px)) + 158px); } }
@media (prefers-reduced-motion: reduce) { .tmBd, .tmPip, .tmSheet { animation: none; } }
`;
{ const st = document.createElement('style'); st.textContent = MAP_CSS; document.head.appendChild(st); }
/* little pictures for the places, drawn like the other icons */
const PLACE_PIC = {};
function placePic(k) {
  if (PLACE_PIC[k]) return PLACE_PIC[k];
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.translate(64, 66); x.scale(1.35, 1.35); x.lineWidth = 4; x.strokeStyle = PAL.ink; x.lineJoin = 'round';
  const poly = (pts, fill) => { x.fillStyle = fill; x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.fill(); x.stroke(); };
  if (k === 'farm') { poly([[-26, 26], [-26, -6], [0, -28], [26, -6], [26, 26]], '#c4553f'); x.fillStyle = PAL.paper; x.fillRect(-11, 4, 22, 22); x.strokeRect(-11, 4, 22, 22); x.beginPath(); x.moveTo(-11, 4); x.lineTo(11, 26); x.moveTo(11, 4); x.lineTo(-11, 26); x.stroke(); x.fillRect(-6, -14, 12, 9); x.strokeRect(-6, -14, 12, 9); }
  else if (k === 'meadow') { poly([[-12, 26], [-8, -10], [8, -10], [12, 26]], PAL.paper); poly([[-12, -10], [0, -22], [12, -10]], PAL.accent); x.save(); x.translate(0, -12); for (let i = 0; i < 4; i++) { x.rotate(Math.PI / 2); x.fillStyle = '#f3ead8'; x.fillRect(-5, -32, 10, 26); x.strokeRect(-5, -32, 10, 26); } x.fillStyle = PAL.trunk; x.beginPath(); x.arc(0, 0, 4, 0, 7); x.fill(); x.stroke(); x.restore(); }
  else if (k === 'garden') drawIcon(x, 'carrot', 0, 0, 1);
  else if (k === 'market') { x.fillStyle = '#c99a6b'; x.fillRect(-24, 2, 48, 22); x.strokeRect(-24, 2, 48, 22); x.lineWidth = 3; [-22, 22].forEach((q) => { x.beginPath(); x.moveTo(q, 2); x.lineTo(q, -18); x.stroke(); }); for (let i = 0; i < 5; i++) { x.fillStyle = i % 2 ? PAL.paper : PAL.accent; x.fillRect(-28 + i * 11.2, -28, 11.2, 12); } x.lineWidth = 4; x.strokeRect(-28, -28, 56, 12); x.fillStyle = '#d8402f'; [-12, 0, 12].forEach((q) => { x.beginPath(); x.arc(q, -2, 5, 0, 7); x.fill(); x.stroke(); }); }
  else if (k === 'harbour') { x.fillStyle = PAL.seaShallow; x.beginPath(); x.ellipse(0, 18, 30, 8, 0, 0, 7); x.fill(); poly([[-24, 4], [24, 4], [16, 18], [-16, 18]], PAL.accent); x.lineWidth = 3; x.beginPath(); x.moveTo(0, 4); x.lineTo(0, -26); x.stroke(); poly([[2, -24], [20, 0], [2, 0]], PAL.paper); }
  else if (k === 'woods') { x.fillStyle = PAL.sea; x.beginPath(); x.ellipse(4, 16, 26, 11, 0, 0, 7); x.fill(); x.stroke(); x.fillStyle = PAL.trunk; x.fillRect(-20, -6, 6, 18); poly([[-30, -2], [-17, -30], [-4, -2]], PAL.pine); x.fillStyle = PAL.paper; x.beginPath(); x.ellipse(10, 12, 9, 6, 0, 0, 7); x.fill(); x.stroke(); x.beginPath(); x.arc(16, 4, 5, 0, 7); x.fill(); x.stroke(); x.fillStyle = PAL.ochre; x.beginPath(); x.moveTo(20, 3); x.lineTo(27, 5); x.lineTo(20, 7); x.fill(); }
  else if (k === 'home') drawIcon(x, 'house', 0, 0, 1);
  return (PLACE_PIC[k] = c.toDataURL());
}
const MAP_ICON = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; drawIcon(c.getContext('2d'), 'map', 64, 64, 1.6); return c.toDataURL(); })();
const mapBtn = document.createElement('button'); mapBtn.type = 'button'; mapBtn.className = 'mapBtn'; mapBtn.setAttribute('aria-label', 'Karta'); mapBtn.innerHTML = '<img alt="" src="' + MAP_ICON + '"><span class="dot" aria-hidden="true"></span>'; document.body.appendChild(mapBtn);
const mapEl = document.createElement('div'); mapEl.className = 'townMap'; mapEl.hidden = true; mapEl.setAttribute('role', 'dialog'); mapEl.setAttribute('aria-label', 'Karta över ön'); document.body.appendChild(mapEl);
const SVGNS = 'http://www.w3.org/2000/svg';
function mapSvg() {
  const pts = []; for (let i = 0; i < 120; i++) { const a = i / 120 * 6.283, ux = Math.cos(a) * ISL.a, uz = Math.sin(a) * ISL.b, s = 1 / isleD(ux, uz); pts.push((ux * s).toFixed(2) + ',' + (uz * s).toFixed(2)); }
  const roads = ROADS.map((r) => '<line x1="' + r[0] + '" y1="' + r[1] + '" x2="' + r[2] + '" y2="' + r[3] + '" stroke="' + (r[5] === 2 ? '#dcc7a2' : '#ecd3a0') + '" stroke-width="' + (r[4] * 2.2).toFixed(2) + '" stroke-linecap="round"/>').join('');
  const pens = Object.keys(PEN).map((a) => { const p = PEN[a]; return '<rect x="' + (p.x - p.w / 2) + '" y="' + (p.z - p.d / 2) + '" width="' + p.w + '" height="' + p.d + '" rx="0.4" fill="#c9b07e" stroke="#7d5e4e" stroke-width="0.25"/>'; }).join('');
  const places = Object.keys(PLACES).map((k) => { const P = PLACES[k]; return '<g class="tmPl" data-k="' + k + '" transform="translate(' + P.mx + ' ' + P.mz + ')" role="button" aria-label="' + P.sv + '"><circle class="tmBg" r="2.55" fill="#fff6e4" stroke="#22303c" stroke-width="0.32"/><image href="' + placePic(k) + '" x="-2.05" y="-2.1" width="4.1" height="4.1"/><text y="3.75" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="600" font-size="1.25" fill="#22303c" stroke="#fff6e4" stroke-width="0.35" paint-order="stroke">' + P.sv + '</text><g transform="translate(2.0 -2.0)"><g class="tmBd" data-b="' + k + '" visibility="hidden"><circle r="1.35" fill="#e9684a" stroke="#22303c" stroke-width="0.25"/><image x="-1.05" y="-1.05" width="2.1" height="2.1"/></g></g></g>'; }).join('');
  return '<svg viewBox="-26.5 -16.6 53 35" xmlns="' + SVGNS + '"><rect x="-26.5" y="-16.6" width="53" height="35" fill="#63bfb4"/>'
    + '<polygon points="' + pts.join(' ') + '" fill="#a5bf66" stroke="#ecd3a0" stroke-width="1.1" stroke-linejoin="round"/>'
    + '<rect x="' + MEADOW.x0 + '" y="' + MEADOW.z0 + '" width="' + (MEADOW.x1 - MEADOW.x0) + '" height="' + (MEADOW.z1 - MEADOW.z0) + '" rx="0.6" fill="#86ad5c"/>'
    + '<ellipse cx="0" cy="0" rx="' + RING.rx + '" ry="' + RING.rz + '" fill="none" stroke="#ecd3a0" stroke-width="1.36"/>' + roads
    + '<circle r="3.5" fill="#dcc7a2"/><circle r="1.1" fill="#63bfb4" stroke="#cfc6bd" stroke-width="0.3"/>'
    + '<rect x="' + (DOCK.x - 0.55) + '" y="' + DOCK.z0 + '" width="1.1" height="' + (DOCK.z1 - DOCK.z0) + '" fill="#a8714d"/>'
    + '<ellipse cx="' + POND.x + '" cy="' + POND.z + '" rx="' + POND.r * 1.2 + '" ry="' + POND.r + '" fill="#2e8f9c"/>' + pens
    + '<rect x="8.1" y="-6.1" width="3.8" height="2.6" rx="0.3" fill="#9c7a5a"/>'
    + places + '<g class="tmPip"><circle id="tmPip" r="0.85" fill="#e9684a" stroke="#fff6e4" stroke-width="0.35"/></g></svg>';
}
mapEl.innerHTML = '<div class="tmSheet">' + mapSvg() + '<button type="button" class="tmClose" aria-label="Stäng"><svg viewBox="0 0 30 30" aria-hidden="true"><path d="M7 7 L23 23 M23 7 L7 23" stroke="#22303c" stroke-width="4.5" stroke-linecap="round"/></svg></button></div>';
const mapPip = mapEl.querySelector('#tmPip');
/* what is waiting where: hungry animals, a garden bed to see to, fish that have not been caught for a while, the upgrade house */
let harbourIdle = 0;
function placeNeeds() {
  const n = {}, area = { cow: VARIANT === 'near' ? 'market' : 'farm', hen: VARIANT === 'near' ? 'market' : 'farm', pig: 'farm', horse: 'meadow', sheep: 'meadow', bull: 'woods', goat: 'farm' };
  animals.forEach((an) => { const k = area[an.a]; if (an.want && k && !n[k]) n[k] = actIcon(an.a); });
  if (state.garden && (typeof gardenOn !== 'function' || gardenOn())) { let best = null, rank = 0; state.garden.forEach((st, i) => { const c = BEDS[i][2]; if (st.s && st.g >= 1 && rank < 3) { best = actIcon(c); rank = 3; } else if (st.s && st.w <= 0 && rank < 2) { best = actIcon('water'); rank = 2; } else if (!st.s && rank < 1) { best = actIcon('seed'); rank = 1; } }); if (best) n.garden = best; }
  if (harbourIdle > 90) n.harbour = actIcon('fish');
  const mn = marketNeed(); if (mn) n.market = mn;
  if (sleepy()) n.home = actIcon('bed'); else if (houseReady) n.home = actIcon('heart');
  return n;
}
function renderMap() {
  const n = placeNeeds();
  mapEl.querySelectorAll('.tmBd').forEach((g) => { const k = g.getAttribute('data-b'); g.setAttribute('visibility', n[k] ? 'visible' : 'hidden'); if (n[k]) g.querySelector('image').setAttribute('href', n[k]); });
  mapPip.setAttribute('cx', pip.position.x.toFixed(2)); mapPip.setAttribute('cy', pip.position.z.toFixed(2));
}
function openMap() { if (inHouse || trip) return; if (typeof closeMenu === 'function') closeMenu(); if (typeof closeAlbum === 'function') closeAlbum(); Snd.init(); Snd.play('pop', { gain: 0.4, f: 660 }); renderMap(); mapEl.hidden = false; }
function closeMap() { mapEl.hidden = true; }
mapBtn.addEventListener('click', (e) => { e.stopPropagation(); if (mapEl.hidden) openMap(); else closeMap(); });
mapEl.querySelector('.tmClose').addEventListener('click', (e) => { e.stopPropagation(); closeMap(); });
mapEl.addEventListener('click', (e) => { e.stopPropagation(); const g = e.target.closest && e.target.closest('.tmPl'); if (g) { closeMap(); routeTo(g.getAttribute('data-k')); } else if (e.target === mapEl) closeMap(); });
['pointerdown', 'touchstart', 'mousedown'].forEach((t) => { mapEl.addEventListener(t, (e) => e.stopPropagation()); mapBtn.addEventListener(t, (e) => e.stopPropagation()); });

/* standing at the signpost offers the map as a big button too */
function townActs(out) { if (Math.hypot(pip.position.x - SIGN.x, pip.position.z - SIGN.z) < 1.3) out.push({ icon: actIcon('map'), label: 'Karta', run: openMap });
  if (carry.items.length && !inHouse) out.push({ icon: actIcon('dump'), label: 'Töm korgen', run: dumpBasket }); }

let townSeason = null, mapT = 0;
/* at bedtime a moon-and-bed bubble floats over the upgrade house, so it is clear where to go to sleep */
const bedSign = new T.Sprite(new T.SpriteMaterial({ map: bubble('bed'), depthTest: false })); bedSign.renderOrder = 5; bedSign.scale.set(1.0, 1.0, 1); bedSign.visible = false; sc.add(bedSign);
function townStep(dt) {
  /* follow the road, one point at a time; any tap or key takes over again */
  if (ROUTE.pts && (joy || holding)) routeStop();
  if (ROUTE.pts) { const p = ROUTE.pts[ROUTE.i], last = ROUTE.i === ROUTE.pts.length - 1; target.set(p[0], 0, p[1]);
    if (Math.hypot(pip.position.x - p[0], pip.position.z - p[1]) < (last ? 0.05 : 0.5)) { ROUTE.i++; if (ROUTE.i >= ROUTE.pts.length) routeStop(); } }
  /* Pip walks round the fountain, stalls and buildings */
  if (!inHouse) for (const s of SOLIDS) { const dx = pip.position.x - s.x, dz = pip.position.z - s.z, d = Math.hypot(dx, dz); if (d < s.r && d > 1e-4) { pip.position.x = s.x + dx / d * s.r; pip.position.z = s.z + dz / d * s.r; } }
  /* the fountain splashes (it freezes in winter), the windmill turns with the wind, the lighthouse sweeps at night */
  const frozen = season === 'winter';
  fountain.drops.forEach((m) => { m.visible = !frozen && !reduced; if (!m.visible) return; const u = (time * 0.9 + m.userData.p) % 1, r = 0.1 + u * 0.55; m.position.set(Math.cos(m.userData.a) * r, 1.35 + u * 0.5 - u * u * 1.4, Math.sin(m.userData.a) * r); });
  millSails.rotation.z -= dt * (reduced ? 0.2 : 0.45 + windAmt * 3.2);
  beam.g.visible = nightAmt > 0.05; if (beam.g.visible) { beam.mat.opacity = nightAmt * 0.22; beam.g.rotation.y += dt * 0.6; }
  pond.ducks.forEach((d) => { d.g.visible = !frozen; if (frozen) return; const a = time * d.s + d.p; d.g.position.set(POND.x + Math.cos(a) * d.r * 1.2, 0.02 + (reduced ? 0 : Math.sin(time * 2 + d.p) * 0.02), POND.z + Math.sin(a) * d.r); d.g.rotation.y = Math.atan2(-Math.sin(a) * d.s * 1.2, Math.cos(a) * d.s); });
  if (season !== townSeason) { townSeason = season; flowerMesh.visible = season !== 'winter';
    if (fountain.water.material.color) fountain.water.material.color.set(frozen ? '#d9ecf2' : PAL.seaShallow); pond.water.material.color.set(frozen ? '#d9ecf2' : PAL.sea); }
  harbourIdle = fishing ? 0 : harbourIdle + dt;
  bedSign.visible = !inHouse && sleepy(); if (bedSign.visible) bedSign.position.set(HOUSE.x - 0.8, 3.2 + (reduced ? 0 : Math.sin(time * 2.4) * 0.12), HOUSE.z + 0.4);
  mapBtn.hidden = inHouse || !!trip;
  mapT -= dt; if (mapT <= 0) { mapT = 1; const n = placeNeeds(); mapBtn.classList.toggle('wait', Object.keys(n).length > 0); if (!mapEl.hidden) renderMap(); }
}
function townTest() {
  return { route: (k) => routeTo(k), routing: () => ROUTE.pts ? ROUTE.dest + ' ' + ROUTE.i + '/' + ROUTE.pts.length : null, path: (k) => roadPath(pip.position.x, pip.position.z, PLACES[k].x, PLACES[k].z), places: () => Object.keys(PLACES), needs: () => Object.keys(placeNeeds()), openMap, closeMap, flowers: () => flowerN, nodes: () => RG.n.length };
}
