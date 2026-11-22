/* ---------- market guests, sellers and the shopkeeper, second pass: the same animal friends, rounded, felted and outlined ----------
   guestModel still returns one group, so queues, sellers' hats and the shopkeeper's apron attach as before. One merged mesh each. */
const G2 = { list: [] };
function guestModel2(kind) {
  const g = new T.Group(), col = { bunny: PAL.paper, bear: PAL.trunk, fox: PAL.accent, frog: PAL.leaf, duck: PAL.ochre }[kind], look = P2_LOOKS[PIP2.v] || P2_LOOKS[2], L = [], X = [], _c = new T.Color();
  PIP2.skin = null; PIP2.fd = 1;
  const lite = '#' + p2Mix(col, '#fff6e4', kind === 'bunny' ? 0 : 0.55).getHexString(), dark = '#' + new T.Color(col).multiplyScalar(0.8).getHexString();
  const put = (geo, paint, x, y, z, o) => { o = o || {}; geo.computeBoundingBox(); const p = geo.attributes.position, y0 = geo.boundingBox.min.y, y1 = geo.boundingBox.max.y, a = new Float32Array(p.count * 3), lo = o.lo == null ? 0.8 : o.lo; _c.set(paint);
    for (let k = 0; k < p.count; k++) { const s = lo + (1.06 - lo) * (y1 > y0 ? (p.getY(k) - y0) / (y1 - y0) : 1); a[k * 3] = _c.r * s; a[k * 3 + 1] = _c.g * s; a[k * 3 + 2] = _c.b * s; }
    geo.setAttribute('color', new T.BufferAttribute(a, 3)); geo.userData.felt = o.felt == null ? 1 : o.felt; if (o.rx) geo.rotateX(o.rx); if (o.rz) geo.rotateZ(o.rz); geo.translate(x || 0, y || 0, z || 0); (o.x ? X : L).push(geo); };
  const eye = (x, y, z, r) => { put(p2Ball(r, 1, 1.12, 0.7, 10, 8), '#22303c', x, y, z, { x: 1, felt: 0, lo: 1 }); put(p2Ball(r * 0.34, 1, 1, 1, 6, 5), '#ffffff', x + r * 0.28, y + r * 0.36, z + r * 0.56, { x: 1, felt: 0, lo: 1 }); };
  put(p2Ball(0.26, 1, 1.15, 0.9, 18, 12), col, 0, 0.36, 0);
  put(p2Ball(1, 0.17, 0.2, 0.08, 12, 8), lite, 0, 0.34, 0.172, { x: 1, lo: 0.9 });
  put(p2Ball(0.225, 1, 1, 1, 18, 14), col, 0, 0.78, 0.02);
  [-1, 1].forEach((s) => { put(p2Ball(1, 0.085, 0.045, 0.115, 10, 6), dark, s * 0.11, 0.035, 0.07); put(p2Ball(1, 0.06, 0.13, 0.065, 10, 8), col, s * 0.25, 0.42, 0.03, { rz: s * 0.35 }); });
  if (kind === 'bunny') { [-1, 1].forEach((s) => { put(p2Ball(1, 0.05, 0.18, 0.035, 10, 10), col, s * 0.085, 1.07, 0, { rz: -s * 0.12 }); put(p2Ball(1, 0.026, 0.13, 0.012, 8, 8), '#f5a3a8', s * 0.085, 1.07, 0.03, { rz: -s * 0.12, x: 1, lo: 0.95 }); }); put(p2Ball(0.07, 1, 1, 1, 10, 8), col, 0, 0.26, -0.24); }
  if (kind === 'bear') [-1, 1].forEach((s) => { put(p2Ball(0.078, 1, 1, 0.6, 10, 8), col, s * 0.155, 0.955, 0); put(p2Ball(0.042, 1, 1, 0.4, 8, 6), lite, s * 0.155, 0.955, 0.035, { x: 1, lo: 0.95 }); });
  if (kind === 'fox') { [-1, 1].forEach((s) => { put(p2Lathe([[0, 0], [0.072, 0.004], [0.062, 0.03], [0.03, 0.12], [0.004, 0.17]], 8, 8), col, s * 0.115, 0.93, 0, { rz: -s * 0.2 }); }); put(p2Ball(1, 0.07, 0.07, 0.16, 10, 8), col, 0, 0.3, -0.3, { rx: -0.5 }); put(p2Ball(0.055, 1, 1, 1, 8, 6), '#fff6e4', 0, 0.39, -0.42); }
  if (kind === 'frog') [-1, 1].forEach((s) => put(p2Ball(0.078, 1, 1, 1, 10, 8), col, s * 0.095, 0.955, 0.06));
  if (kind === 'duck') { put(p2Ball(1, 0.075, 0.032, 0.1, 10, 6), PAL.accent, 0, 0.755, 0.235, { felt: 0.2, lo: 0.9 }); put(p2Ball(0.06, 0.6, 1, 1.2, 8, 6), col, 0, 1.0, -0.02, { rx: -0.4 }); put(p2Ball(0.09, 0.7, 0.7, 1.1, 8, 6), col, 0, 0.42, -0.26, { rx: -0.6 }); }
  else { put(p2Ball(0.085, 1, 0.78, 0.7, 12, 8), kind === 'fox' ? PAL.paper : kind === 'bunny' ? '#fbe6e2' : kind === 'frog' ? lite : PAL.blush, 0, 0.73, 0.2, { lo: 0.9 });
    if (kind !== 'frog') put(p2Ball(0.026, 1.25, 0.85, 0.8, 8, 6), kind === 'bunny' ? '#f08a96' : '#2a2220', 0, 0.755, 0.262, { x: 1, felt: 0.1, lo: 1 }); }
  if (kind === 'frog') { eye(-0.095, 0.975, 0.118, 0.032); eye(0.095, 0.975, 0.118, 0.032); } else { eye(-0.085, 0.845, 0.203, 0.031); eye(0.085, 0.845, 0.203, 0.031); }
  p2Mesh(g, L, look.line * 0.9, null, X);
  return g;
}
{ const gm0 = guestModel; G2.gm0 = gm0; guestModel = function (kind) { const g = PIP2.v ? guestModel2(kind) : gm0(kind); G2.list.push({ g, kind, own: g.children.slice() }); return g; }; }
function g2Refresh() { G2.list = G2.list.filter((e) => e.g.parent); G2.list.forEach((e) => { e.own.forEach((c) => { e.g.remove(c); if (c.geometry) c.geometry.dispose(); }); const n = PIP2.v ? guestModel2(e.kind) : G2.gm0(e.kind); e.own = n.children.slice(); e.own.forEach((c) => e.g.add(c)); }); }
{ const s3 = pip2Set; pip2Set = function (v) { s3(v); g2Refresh(); }; }
if (window.__farmTest) window.__g2 = { make: (x, z) => { ['bunny', 'bear', 'fox', 'frog', 'duck'].forEach((k, n) => { const m = guestModel(k); m.position.set(x + n * 0.9, 0, z); m.rotation.y = 0.35; sc.add(m); }); } };
