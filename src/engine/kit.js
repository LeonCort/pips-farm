/* ---------- building kit: how every game paints its world ----------
   at(x, z, turn) gives a painter for one object; parts painted into STATIC are merged into one mesh
   (cheap to draw); solid() marks a circle Pip walks around, deco() a spot flowers keep clear of;
   LAMP_AT lists lamp spots, which the light effects use. Moved here from the farm's town.js. */
const STATIC = [], SWAYL = []; /* STATIC: pieces merged into one mesh; SWAYL: hedges and bushes, merged with a wind-swaying material (polish.js) */
function merged(list, mat, parent) {
  let n = 0; list.forEach((g) => { n += g.attributes.position.count; });
  const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3); let o = 0;
  list.forEach((g) => { const c = g.attributes.position.count; P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); if (g.attributes.color) C.set(g.attributes.color.array, o * 3); else C.fill(1, o * 3, (o + c) * 3); o += c; });
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(P, 3)); geo.setAttribute('normal', new T.BufferAttribute(N, 3)); geo.setAttribute('color', new T.BufferAttribute(C, 3)); geo.computeBoundingSphere();
  const m = new T.Mesh(geo, mat || MAT); m.castShadow = true; m.receiveShadow = true; (parent || sc).add(m); return m;
}
/* at(x, z, turn) gives a painter for one object: parts are placed in the object's own space, then turned and moved */
const ATREC = []; /* each object's footprint, for the soft contact shade painted on the ground (cozy.js) */
function at(ox, oz, ry, list) {
  list = list || STATIC; const rec = { x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9, y0: 1e9, y1: -1e9 }; ATREC.push(rec);
  return (geo, col, seed, x, y, z, o) => { const g = fac(geo, col, seed); o = o || {}; if (o.rx) g.rotateX(o.rx); if (o.rz) g.rotateZ(o.rz); if (o.ry) g.rotateY(o.ry); g.translate(x || 0, y || 0, z || 0); if (ry) g.rotateY(ry); g.translate(ox, 0, oz); list.push(g);
    g.computeBoundingBox(); const b = g.boundingBox; rec.x0 = Math.min(rec.x0, b.min.x); rec.x1 = Math.max(rec.x1, b.max.x); rec.z0 = Math.min(rec.z0, b.min.z); rec.z1 = Math.max(rec.z1, b.max.z); rec.y0 = Math.min(rec.y0, b.min.y); rec.y1 = Math.max(rec.y1, b.max.y); return g; };
}
function capAt(ox, oz, ry) { const g = new T.Group(); g.userData.cap = 1; g.position.set(ox, 0, oz); g.rotation.y = ry || 0; sc.add(g); return g; }
const box = (w, h, d, a, b, c) => new T.BoxGeometry(w, h, d, a || 1, b || 1, c || 1);
const cyl = (r0, r1, h, n, open) => new T.CylinderGeometry(r0, r1, h, n || 8, 1, !!open);
/* things Pip walks around (circles); flowers keep clear of these and of DECO */
const SOLIDS = [], DECO = [];
const solid = (x, z, r) => { SOLIDS.push({ x, z, r }); DECO.push({ x, z, r: r + 0.35 }); };
const deco = (x, z, r) => DECO.push({ x, z, r });
const faceTo = (x, z, tx, tz) => Math.atan2(tx - x, tz - z); /* a turn that points an object's front (+z) at a spot */
const LAMP_AT = [];
