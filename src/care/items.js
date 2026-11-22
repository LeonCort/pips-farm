/* ---------- items: food Pip carries ---------- */
const PROTO = {};
{ const g = new T.Group(), b = new T.BoxGeometry(0.32, 0.18, 0.22, 2, 1, 1); b.translate(0, 0.09, 0); part(fac(jit(b, 0.012, 1), PAL.ochre, 1), g, 0, 0, 0, true);
  [-0.08, 0.08].forEach((x) => { const s = new T.BoxGeometry(0.025, 0.19, 0.23); s.translate(0, 0.09, 0); part(fac(s, PAL.trunk, 2), g, x, 0, 0, true); }); PROTO.hay = g; }
{ const g = new T.Group(), s = ico(0.13, 1, 3, 0.01); s.scale(1, 0.85, 0.8); s.translate(0, 0.11, 0); part(fac(s, PAL.sand, 3), g, 0, 0, 0, true);
  const t = new T.CylinderGeometry(0.04, 0.06, 0.06, 5); part(fac(t, PAL.trunk, 4), g, 0, 0.23, 0, true); PROTO.grain = g; }
{ const g = new T.Group(), c = new T.ConeGeometry(0.06, 0.24, 6); c.rotateZ(Math.PI / 2); c.translate(0, 0.07, 0); part(fac(c, '#ef8a2e', 5), g, 0, 0, 0, true);
  [-0.3, 0, 0.3].forEach((a, k) => { const l = new T.ConeGeometry(0.025, 0.12, 4); l.translate(0, 0.06, 0); const m = part(fac(l, PAL.leaf, 6 + k), g, 0.13, 0.07, 0, true); m.rotation.z = -Math.PI / 2 + a; }); PROTO.carrot = g; }
{ const g = new T.Group(), b = new T.CylinderGeometry(0.12, 0.09, 0.18, 8, 1, true); b.translate(0, 0.09, 0); part(fac(b, PAL.rock, 7), g, 0, 0, 0, true);
  const w = new T.CylinderGeometry(0.11, 0.11, 0.02, 8); part(fac(w, PAL.seaShallow, 8), g, 0, 0.16, 0, true); const bt = new T.CylinderGeometry(0.09, 0.09, 0.02, 8); part(fac(bt, PAL.rock, 9), g, 0, 0.01, 0, true); PROTO.water = g; }
/* market goods: eggs and milk from the animals, apples from the orchard, cake from the bakery */
{ const g = new T.Group(), geo = ico(0.11, 1, 1, 0.006); geo.scale(0.85, 1.1, 0.85); part(fac(geo, PAL.snow, 11), g, 0, 0.11, 0, true); PROTO.egg = g; }
{ const g = new T.Group(); part(fac(ico(0.12, 1, 2, 0.008), PAL.accent, 12), g, 0, 0.12, 0, true); const lf = new T.ConeGeometry(0.04, 0.1, 3); lf.rotateZ(0.8); part(fac(lf, PAL.leaf, 13), g, 0.04, 0.25, 0, true); PROTO.apple = g; }
{ const g = new T.Group(); let geo = new T.CylinderGeometry(0.075, 0.085, 0.2, 6); geo.translate(0, 0.1, 0); part(fac(geo, PAL.paper, 14), g, 0, 0, 0, true); geo = new T.CylinderGeometry(0.045, 0.06, 0.06, 6); part(fac(geo, PAL.sea, 15), g, 0, 0.22, 0, true); PROTO.milk = g; }
{ const g = new T.Group(); let geo = new T.CylinderGeometry(0.15, 0.15, 0.1, 8); geo.translate(0, 0.05, 0); part(fac(geo, PAL.sand, 16), g, 0, 0, 0, true); geo = new T.CylinderGeometry(0.155, 0.155, 0.04, 8); part(fac(geo, PAL.blush, 17), g, 0, 0.12, 0, true); part(fac(new T.IcosahedronGeometry(0.04, 0), PAL.accent, 18), g, 0, 0.16, 0, true); PROTO.cake = g; }
const ITEM_H = { hay: 0.19, grain: 0.22, carrot: 0.14, water: 0.2, egg: 0.2, apple: 0.22, milk: 0.27, cake: 0.15 };
const GOODS = ['egg', 'apple', 'milk', 'cake'];
const mk = (type) => { const m = PROTO[type].clone(); m.userData.type = type; return m; };
