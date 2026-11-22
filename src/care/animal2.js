/* ---------- farm animals, second pass: rounded, merged, felted and outlined like Pip ----------
   animalModel keeps its contract ({ g, body, h }, everything inside `body`), so pens, riding, the barn, babies and the
   see-through pad ghosts work unchanged. Each animal is now ONE merged mesh (plus its outline) instead of 8 to 20 parts. */
const AM2 = { list: [] };
function animalModel2(a, i, coat) {
  const g = new T.Group(), body = new T.Group(); g.add(body); const c = coat || coatOf(a, i), look = P2_LOOKS[PIP2.v] || P2_LOOKS[2], L = [], X = [], _c = new T.Color();
  PIP2.skin = null; PIP2.fd = 1;
  /* put a piece: paint (a colour or a coat painter) in the piece's own space with a soft bottom-to-top shade, then place it */
  const put = (geo, paint, x, y, z, o) => { o = o || {}; if (!geo.attributes.normal) geo.computeVertexNormals(); geo.computeBoundingBox(); const p = geo.attributes.position, y0 = geo.boundingBox.min.y, y1 = geo.boundingBox.max.y, col = new Float32Array(p.count * 3), lo = o.lo == null ? 0.8 : o.lo;
    for (let k = 0; k < p.count; k++) { const q = typeof paint === 'function' ? paint(p.getX(k), p.getY(k), p.getZ(k), 0) : _c.set(paint), s = lo + (1.06 - lo) * (y1 > y0 ? (p.getY(k) - y0) / (y1 - y0) : 1); col[k * 3] = q.r * s; col[k * 3 + 1] = q.g * s; col[k * 3 + 2] = q.b * s; }
    geo.setAttribute('color', new T.BufferAttribute(col, 3)); geo.userData.felt = o.felt == null ? 1 : o.felt; if (o.rx) geo.rotateX(o.rx); if (o.rz) geo.rotateZ(o.rz); geo.translate(x || 0, y || 0, z || 0); (o.x ? X : L).push(geo); return geo; };
  const ball = (r, sx, sy, sz, ws, hs) => p2Ball(r, sx, sy, sz, ws || 12, hs || 9);
  const eye = (x, y, z, r, col) => { put(ball(r, 1, 1.1, 0.7, 10, 8), col || '#22303c', x, y, z, { x: 1, felt: 0, lo: 1 }); put(ball(r * 0.34, 1, 1, 1, 6, 5), col ? '#22303c' : '#ffffff', x + r * 0.28, y + r * 0.36, z + r * 0.56, { x: 1, felt: 0, lo: 1 }); };
  const leg = (x, z, r, h, col, hoof) => { put(p2Lathe([[0, h + r * 0.4], [r * 0.85, h + r * 0.2], [r, h - r * 0.6], [r * 0.9, 0.08], [r * 0.95, 0.02], [0, 0.0]], 10, 10), (px, py) => _c.set(hoof && py < 0.07 ? hoof : col), x, 0, z); };
  const cone = (r, h) => p2Lathe([[0, 0], [r, 0.004], [r * 0.9, h * 0.18], [r * 0.45, h * 0.7], [0.004, h]], 8, 8);
  const dark = (hex, k) => '#' + new T.Color(hex).multiplyScalar(k).getHexString();
  let h;
  if (a === 'hen') {
    put(ball(0.24, 1.06, 0.92, 1.1, 18, 12), coatPaint(c, i, 9), 0, 0.3, 0);
    put(ball(0.11, 0.7, 1.05, 0.9), dark(c.b, 0.9), 0, 0.42, -0.25, { rx: -0.5 });
    [-1, 1].forEach((s) => put(ball(0.15, 0.28, 0.72, 0.95), dark(c.b, 0.9), s * 0.235, 0.31, -0.03));
    put(ball(0.128, 1, 1, 1, 14, 10), c.b, 0, 0.55, 0.17);
    [[0.2, 0.04], [0.155, 0.045], [0.11, 0.036]].forEach(([z, r]) => put(ball(r, 0.7, 1, 1, 8, 6), PAL.accent, 0, 0.675 + r * 0.4, z, { felt: 0.5 }));
    put(ball(0.028, 0.8, 1.2, 0.8, 8, 6), PAL.accent, 0, 0.495, 0.285, { x: 1, felt: 0.5 });
    put(cone(0.042, 0.1), PAL.ochre, 0, 0.555, 0.28, { rx: Math.PI / 2, x: 1, felt: 0.1, lo: 0.9 });
    [-0.07, 0.07].forEach((x) => { put(new T.CylinderGeometry(0.014, 0.014, 0.1, 6), PAL.ochre, x, 0.06, 0.02, { x: 1, felt: 0.1 }); put(ball(0.05, 1, 0.3, 1.35, 8, 6), PAL.ochre, x, 0.018, 0.045, { felt: 0.1 }); });
    eye(-0.058, 0.6, 0.27, 0.022); eye(0.058, 0.6, 0.27, 0.022); h = 0.95;
  } else if (a === 'pig') {
    put(ball(0.36, 1, 0.82, 1.25, 20, 14), coatPaint(c, i, 7), 0, 0.42, 0);
    put(p2Lathe([[0, -0.05], [0.1, -0.05], [0.118, -0.03], [0.12, 0.02], [0.105, 0.045], [0, 0.05]], 14, 0), '#e88f80', 0, 0.44, 0.46, { rx: Math.PI / 2, felt: 0.4, lo: 0.9 });
    [-0.045, 0.045].forEach((x) => put(ball(0.02, 1, 1.4, 0.5, 6, 5), '#a8574c', x, 0.445, 0.508, { x: 1, felt: 0, lo: 1 }));
    [-1, 1].forEach((s) => put(ball(0.085, 0.9, 1.1, 0.34, 10, 8), dark(c.b, 0.86), s * 0.16, 0.71, 0.24, { rx: 0.5, rz: -s * 0.35 }));
    [[-0.17, 0.22], [0.17, 0.22], [-0.17, -0.22], [0.17, -0.22]].forEach(([x, z]) => leg(x, z, 0.066, 0.2, c.b, dark(c.b, 0.6)));
    put(new T.TorusGeometry(0.06, 0.021, 6, 12, 4.5), c.b, 0, 0.5, -0.46, { x: 1 });
    eye(-0.105, 0.56, 0.415, 0.03); eye(0.105, 0.56, 0.415, 0.03); h = 1.15;
  } else if (a === 'sheep') {
    for (let k = 0; k < 7; k++) put(ball(0.2, 1, 1, 1, 12, 9), c.b, Math.cos(k * 0.9) * 0.2, 0.55 + (k % 2) * 0.12, -0.25 + k * 0.08, { lo: 0.74 });
    put(ball(0.09, 1, 0.8, 1, 10, 8), c.b, 0, 0.86, 0.36);
    put(ball(0.15, 0.9, 1, 1.2, 14, 10), c.h, 0, 0.72, 0.42);
    [-1, 1].forEach((s) => put(ball(0.07, 1, 0.3, 0.5, 8, 6), c.h, s * 0.17, 0.76, 0.38, { rz: s * 0.3 }));
    [[-0.13, 0.2], [0.13, 0.2], [-0.13, -0.2], [0.13, -0.2]].forEach(([x, z]) => leg(x, z, 0.044, 0.36, c.h));
    { const light = new T.Color(c.h).getHSL({}).l > 0.6; eye(-0.07, 0.78, 0.553, 0.026, light ? null : '#fffaf0'); eye(0.07, 0.78, 0.553, 0.026, light ? null : '#fffaf0'); } h = 1.0;
  } else if (a === 'duck') {
    /* a round little duck: plump body, tail flicked up, orange bill and feet (coat s = a green mallard head) */
    put(ball(0.2, 1.1, 0.82, 1.35, 16, 12), c.b, 0, 0.24, 0);
    put(cone(0.09, 0.16), c.b, 0, 0.3, -0.3, { rx: -2.2 });
    [-1, 1].forEach((s) => put(ball(0.13, 0.28, 0.6, 1.0), dark(c.b, 0.9), s * 0.2, 0.27, -0.03));
    put(ball(0.115, 1, 1.05, 1, 14, 10), c.s || c.b, 0, 0.5, 0.2);
    put(ball(1, 0.07, 0.024, 0.085, 10, 6), '#f2a03a', 0, 0.47, 0.33, { felt: 0.2, lo: 0.95 });
    [-0.06, 0.06].forEach((x) => put(ball(0.05, 1, 0.25, 1.3, 8, 6), '#f2a03a', x, 0.015, 0.06, { felt: 0.1 }));
    eye(-0.06, 0.53, 0.29, 0.02); eye(0.06, 0.53, 0.29, 0.02); h = 0.85;
  } else if (a === 'rabbit') {
    /* a rabbit: round back, round head, two long ears and a cotton tail */
    put(ball(0.2, 1, 0.92, 1.22, 16, 12), c.b, 0, 0.21, -0.03);
    put(ball(0.13, 1, 0.98, 1.05, 14, 10), c.b, 0, 0.36, 0.2);
    [-1, 1].forEach((s) => { put(ball(1, 0.045, 0.17, 0.03, 10, 8), c.b, s * 0.055, 0.58, 0.15, { rx: -0.25, rz: -s * 0.15 }); put(ball(1, 0.022, 0.12, 0.012, 8, 6), '#f0b2b6', s * 0.055, 0.585, 0.172, { x: 1, rx: -0.25, rz: -s * 0.15, felt: 0.3 }); });
    put(ball(0.065, 1, 1, 1, 10, 8), c.s || '#fbf8f1', 0, 0.26, -0.27);
    put(ball(0.022, 1.2, 0.9, 0.7, 6, 5), '#e98aa0', 0, 0.36, 0.33, { x: 1, felt: 0.2 });
    [-0.08, 0.08].forEach((x) => put(ball(0.05, 0.9, 0.5, 1.5, 8, 6), c.b, x, 0.04, 0.17));
    eye(-0.07, 0.41, 0.3, 0.022); eye(0.07, 0.41, 0.3, 0.022); h = 0.85;
  } else if (a === 'alpaca') {
    /* an alpaca: fluffy body, long woolly neck, a tuft on top, banana ears */
    put(ball(1, 0.21, 0.22, 0.34, 18, 12), c.b, 0, 0.8, 0, { lo: 0.78 });
    [[-0.12, 0.2], [0.12, 0.2], [-0.12, -0.2], [0.12, -0.2]].forEach(([x, z]) => leg(x, z, 0.05, 0.66, c.b, '#4a3d38'));
    put(ball(1, 0.09, 0.32, 0.095, 12, 10), c.b, 0, 1.16, 0.27, { rx: 0.18, lo: 0.85 });
    put(ball(1, 0.1, 0.105, 0.13, 14, 10), c.b, 0, 1.47, 0.34);
    put(ball(0.085, 1, 0.8, 1, 10, 8), c.b, 0, 1.58, 0.3, { lo: 0.9 });
    put(ball(1, 0.06, 0.055, 0.06, 10, 6), dark(c.b, 0.82), 0, 1.43, 0.47, { felt: 0.4 });
    [-1, 1].forEach((s) => { put(cone(0.035, 0.15), c.b, s * 0.06, 1.55, 0.33, { rz: -s * 0.2 }); eye(s * 0.07, 1.5, 0.44, 0.024); });
    put(ball(0.07, 1, 1.1, 1, 8, 6), c.b, 0, 0.84, -0.35); h = 1.85;
  } else if (a === 'donkey') {
    /* a grey donkey: horse-like but smaller, a pale muzzle and belly, long ears and a dark mane */
    put(ball(1, 0.24, 0.23, 0.42, 20, 14), c.b, 0, 0.66, 0);
    put(ball(1, 0.17, 0.08, 0.3, 12, 8), '#e8e2d8', 0, 0.5, 0, { lo: 0.9 });
    [[-0.14, 0.28], [0.14, 0.28], [-0.14, -0.28], [0.14, -0.28]].forEach(([x, z]) => leg(x, z, 0.055, 0.56, c.b, '#3a3433'));
    put(ball(1, 0.11, 0.26, 0.12, 12, 10), c.b, 0, 0.98, 0.4, { rx: 0.5 });
    put(ball(1, 0.1, 0.11, 0.2, 14, 10), c.b, 0, 1.17, 0.58);
    put(ball(1, 0.085, 0.08, 0.08, 10, 8), '#e8e2d8', 0, 1.13, 0.75, { felt: 0.5 });
    put(ball(1, 0.03, 0.22, 0.13, 10, 10), '#3a3433', 0, 1.1, 0.33, { rx: 0.5 });
    [-1, 1].forEach((s) => { put(cone(0.045, 0.28), c.b, s * 0.07, 1.25, 0.5, { rz: -s * 0.3, rx: -0.2 }); eye(s * 0.095, 1.22, 0.67, 0.024); });
    put(ball(1, 0.04, 0.22, 0.04, 8, 8), '#3a3433', 0, 0.6, -0.45, { rx: -0.4 }); h = 1.5;
  } else if (a === 'goat') {
    const hd = c.h || c.b;
    put(ball(1, 0.19, 0.18, 0.37, 18, 12), coatPaint(c, i, 6), 0, 0.6, 0);
    [[-0.11, 0.24, c.b], [0.11, 0.24, c.b], [-0.11, -0.24, hd], [0.11, -0.24, hd]].forEach(([x, z, col]) => leg(x, z, 0.038, 0.58, col, '#4a3d38'));
    put(ball(1, 0.085, 0.2, 0.095), c.b, 0, 0.86, 0.36, { rx: 0.45 });
    put(ball(1, 0.095, 0.105, 0.165, 14, 10), c.b, 0, 1.04, 0.5);
    put(ball(1, 0.068, 0.052, 0.045, 10, 6), PAL.blush, 0, 0.995, 0.645, { felt: 0.4, lo: 0.9 });
    put(cone(0.036, 0.14), hd, 0, 0.955, 0.6, { rx: Math.PI });
    [-1, 1].forEach((s) => { put(cone(0.03, 0.2), PAL.sand, s * 0.05, 1.12, 0.44, { rx: -0.75, felt: 0.15, lo: 0.9 }); put(ball(0.075, 1, 0.3, 0.5, 8, 6), c.b, s * 0.14, 1.07, 0.44, { rz: s * 0.35 }); eye(s * 0.072, 1.085, 0.6, 0.023); });
    put(ball(0.045, 0.8, 1.3, 0.8, 8, 6), hd, 0, 0.8, -0.37, { rx: -0.5 }); h = 1.3;
  } else {
    /* cow, horse and bull share a four-legged body */
    const col = c.b, long = a === 'horse', spot = coatPaint(c, i, 5), by = long ? 0.78 : 0.62;
    /* cow patches: a few soft blobs of the second colour, placed by the coat number */
    const patch = a === 'cow' && c.s ? (x, y, z) => { for (let k = 0; k < 5; k++) { const ax = (hash(k, i, 1) - 0.5) * 0.5, ay = 0.05 + hash(k, i, 2) * 0.2, az = (hash(k, i, 3) - 0.5) * 0.8, r = 0.13 + hash(k, i, 4) * 0.08; if (Math.hypot(x - ax, (y - ay) * 0.8, z - az) < r) return _c.set(c.s); } return _c.set(col); } : spot;
    put(ball(1, 0.275, 0.26, long ? 0.53 : 0.48, 24, 16), patch, 0, by, 0);
    [[-0.16, 0.34], [0.16, 0.34], [-0.16, -0.34], [0.16, -0.34]].forEach(([x, z]) => leg(x, z, 0.064, long ? 0.76 : 0.57, col, long ? '#3a3433' : '#4a3d38'));
    if (long) {
      put(ball(1, 0.125, 0.31, 0.135, 12, 10), spot, 0, 1.1, 0.5, { rx: 0.5 });
      put(ball(1, 0.118, 0.13, 0.225, 14, 10), col, 0, 1.36, 0.72);
      put(ball(1, 0.1, 0.095, 0.09, 10, 8), dark(col, 0.82), 0, 1.33, 0.9, { felt: 0.5 });
      put(ball(1, 0.04, 0.29, 0.17, 10, 10), c.m, 0, 1.22, 0.42, { rx: 0.5 }); put(ball(1, 0.06, 0.07, 0.09, 8, 6), c.m, 0, 1.48, 0.66);
      put(ball(1, 0.055, 0.25, 0.06, 8, 8), c.m, 0, 0.72, -0.58, { rx: -0.4 });
      [-1, 1].forEach((s) => { put(cone(0.042, 0.13), col, s * 0.07, 1.46, 0.6); eye(s * 0.108, 1.41, 0.79, 0.026); });
      h = 1.95;
    } else {
      put(ball(1, 0.17, 0.18, 0.19, 16, 12), col, 0, 0.8, 0.55);
      put(ball(1, 0.15, 0.085, 0.075, 12, 8), PAL.blush, 0, 0.72, 0.715, { felt: 0.4, lo: 0.9 });
      [-0.05, 0.05].forEach((x) => put(ball(0.018, 1, 1.3, 0.5, 6, 5), '#a8574c', x, 0.725, 0.788, { x: 1, felt: 0, lo: 1 }));
      [-1, 1].forEach((s) => { const bull = a === 'bull'; put(cone(bull ? 0.045 : 0.03, bull ? 0.22 : 0.12), PAL.sand, s * (bull ? 0.14 : 0.09), bull ? 0.95 : 0.96, 0.5, { rz: bull ? -s * 0.9 : -s * 0.15, felt: 0.15, lo: 0.9 });
        put(ball(0.085, 1, 0.42, 0.5, 8, 6), col, s * 0.215, 0.87, 0.5, { rz: s * 0.25 }); eye(s * 0.112, 0.875, 0.7, 0.027); });
      if (a === 'bull') put(new T.TorusGeometry(0.05, 0.015, 6, 12), PAL.ochre, 0, 0.66, 0.79, { x: 1, felt: 0 });
      if (a === 'cow') put(ball(0.1, 1, 0.8, 1.1, 10, 8), '#f0a9a0', 0, 0.4, -0.14, { felt: 0.3 });
      put(new T.CylinderGeometry(0.022, 0.018, 0.34, 6), col, 0, 0.6, -0.52, { rx: -0.3, x: 1 }); put(ball(0.045, 1, 1.3, 1, 8, 6), c.s || dark(col, 0.7), 0, 0.44, -0.575);
      h = 1.4;
    }
  }
  const m = p2Mesh(body, L, look.line * 0.9, null, X); m.userData.am2 = 1;
  return { g, body, h };
}
{ const am0 = animalModel; AM2.am0 = am0; animalModel = function (a, i, coat) { const m = PIP2.v ? animalModel2(a, i, coat) : am0(a, i, coat); AM2.list.push({ body: m.body, a, i, coat }); return m; }; }
/* the look switch in the test build: swap the meshes inside every animal's body group */
function am2Refresh() {
  AM2.list.forEach((e) => { const n = PIP2.v ? animalModel2(e.a, e.i, e.coat) : null; if (PIP2.v && e.body.children.some((c) => c.userData.am2)) { /* already new: rebuild for the outline width */ }
    e.body.children.filter((c) => c.isMesh).forEach((c) => { e.body.remove(c); if (c.geometry) c.geometry.dispose(); });
    if (!n) { AM2.off = true; const o = AM2.am0(e.a, e.i, e.coat); o.body.children.slice().forEach((c) => e.body.add(c)); AM2.off = false; }
    else n.body.children.slice().forEach((c) => e.body.add(c)); });
}
{ const s2 = pip2Set; pip2Set = function (v) { s2(v); am2Refresh(); }; }
if (window.__farmTest) window.__zoo = { make: (x, z) => { ['hen', 'pig', 'sheep', 'goat', 'cow', 'bull', 'horse'].forEach((a, k) => { const m = animalModel(a, a === 'cow' ? 1 : a === 'pig' ? 2 : 1); m.g.position.set(x + k * 1.25, 0, z); m.g.rotation.y = 0.5; sc.add(m.g); }); },
  shot: (x, z, d, w) => { const c = new T.PerspectiveCamera(30, 1, 0.1, 100); c.position.set(x, 1.6, z + d); c.lookAt(x, 0.7, z); const s = renderer.getSize(new T.Vector2()); c.aspect = s.x / s.y; c.updateProjectionMatrix(); const cs = CURVE.u.strength.value; CURVE.u.strength.value = 0; renderer.render(sc, c); CURVE.u.strength.value = cs; return canvas.toDataURL('image/png'); } };
