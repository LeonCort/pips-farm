/* ---------- farm look: rope and stone rings, handmade pens, a corrugated silo, a soft beach with foam, and busy farmyard clutter ---------- */
/* Everything here is built once (or when a pen grows) and merged, so the whole file adds only a few draw calls.
   Helpers used from world.js run before this file's top level (market rings at load), so they keep their state in `var`. */
var FL; FL = FL || {};
function flHash(x, z, k) { return hash(x * 3.17 + k, z * 5.31 - k * 0.7, k * 1.13); }

/* rope rings on grass, rings of flat stones on paths: same job as the old white circles, but part of the island */
function flRopeGeo(r, gold) {
  FL = FL || {}; const key = (gold ? 'g' : 'r') + r.toFixed(2); FL.ropes = FL.ropes || {}; if (FL.ropes[key]) return FL.ropes[key];
  const L = [], seg = Math.max(40, Math.round(r * 72)), tube = gold ? 0.05 : 0.055;
  const tg = new T.TorusGeometry(r - tube, tube, 6, seg); tg.rotateX(Math.PI / 2);
  const g = tg.toNonIndexed(), p = g.attributes.position, col = new Float32Array(p.count * 3);
  const A = new T.Color(gold ? '#e8c27a' : '#d8b67c'), B = new T.Color(gold ? '#a8783e' : '#9c7648'), c = new T.Color();
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), phi = Math.atan2(z, x), rr = Math.hypot(x, z) - (r - tube), psi = Math.atan2(y, rr);
    /* a twisted rope: light and dark strands spiralling round the tube */
    const s = 0.5 + 0.5 * Math.sin(phi * seg * 0.5 + psi * 1.6), q = s * s * s; c.copy(B).lerp(A, q); c.multiplyScalar(0.8 + 0.28 * clamp(y / tube * 0.5 + 0.5, 0, 1)); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  g.setAttribute('color', new T.BufferAttribute(col, 3)); g.scale(1, 0.75, 1); g.translate(0, tube * 0.6, 0); g.computeVertexNormals(); L.push(g);
  /* wooden pegs holding the rope down */
  for (let k = 0; k < 4; k++) { const a = k / 4 * 6.283 + 0.4, pg = new T.CylinderGeometry(0.022, 0.03, 0.16, 5); pg.rotateZ(0.12); pg.translate(Math.cos(a) * r, 0.06, Math.sin(a) * r); L.push(fac(pg, '#7a5236', 300 + k)); }
  FL.ropes[key] = merged(L, MAT, new T.Group()).geometry; return FL.ropes[key];
}
function flStoneGeo(r) {
  FL = FL || {}; const key = 's' + r.toFixed(2); FL.ropes = FL.ropes || {}; if (FL.ropes[key]) return FL.ropes[key];
  const L = [], n = Math.round(r * 24);
  for (let k = 0; k < n; k++) { const a = k / n * 6.283 + (hash(k, r) - 0.5) * 0.08, s = 0.06 + hash(k, r * 7) * 0.065, g = ico(s, 1, 400 + k, s * 0.14), rr = r - 0.05 + (hash(k, r, 2) - 0.5) * 0.06; g.scale(1.2 + hash(k, 5) * 0.3, 0.28, 1); g.rotateY(a + (hash(k, 6) - 0.5) * 0.6); g.translate(Math.cos(a) * rr, -0.005, Math.sin(a) * rr);
    /* warm grey-tan, a little darker at the foot so they sit in the dirt */
    L.push(fac(g, (cx, cy, cz, i) => tone(['#b5a48c', '#a89880', '#c2b298', '#9c8e7a', '#ad9f8e'][Math.floor(hash(k, 9) * 5)], i, 0.5).multiplyScalar(0.78 + 0.22 * clamp(cy / 0.03, 0, 1)))); }
  FL.ropes[key] = merged(L, MAT, new T.Group()).geometry; return FL.ropes[key];
}
function flRing(x, z, r) {
  const stone = !!roadKind(x, z), m = new T.Mesh(stone ? flStoneGeo(r) : flRopeGeo(r), MAT);
  m.position.set(x, 0.02, z); m.rotation.y = hash(x, z) * 6.283; m.receiveShadow = true; m.castShadow = false; sc.add(m); return m;
}
/* the rim of a buy pad: a thick golden rope round the parchment */
function flPadEdge() { const m = new T.Mesh(flRopeGeo(0.86, true), MAT); m.position.y = -0.02; m.receiveShadow = true; return m; }

/* ---------- pens ---------- */
/* pen floor: dirt, straw and (for pigs) mud, painted once per pen size; the edge is ragged so dirt spills a little past the fence */
function flFloorTex(a, w, d) {
  const W = 256, H = Math.max(96, Math.round(256 * d / w)), c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const grassy = !(a === 'pig' || a === 'hen'), s = (k) => hash(k, w * 3.1 + d, a.length);
  x.fillStyle = a === 'pig' ? '#a58262' : a === 'hen' ? '#d4b88a' : '#8fb066'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { const px = s(i) * W, py = s(i + 99) * H, r = 8 + s(i + 7) * 26, g = x.createRadialGradient(px, py, 0, px, py, r), light = s(i + 3) > 0.5;
    g.addColorStop(0, grassy ? (light ? 'rgba(200,220,140,0.35)' : 'rgba(150,120,80,0.32)') : (light ? 'rgba(255,240,210,0.3)' : 'rgba(110,80,55,0.28)')); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - r, py - r, r * 2, r * 2); }
  if (grassy) { /* trodden earth near the trough side, grass strokes elsewhere */
    const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(160,125,85,0)'); g.addColorStop(1, 'rgba(160,125,85,0.0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 18; i++) { const px = s(i + 300) * W, py = s(i + 301) * H, r = 10 + s(i + 302) * 22, gg = x.createRadialGradient(px, py, 0, px, py, r); gg.addColorStop(0, 'rgba(170,135,90,0.55)'); gg.addColorStop(1, 'rgba(170,135,90,0)'); x.fillStyle = gg; x.fillRect(px - r, py - r, r * 2, r * 2); }
    x.lineCap = 'round'; for (let i = 0; i < 700; i++) { const px = s(i + 500) * W, py = s(i + 501) * H; x.strokeStyle = s(i + 502) > 0.5 ? 'rgba(210,230,150,0.5)' : 'rgba(80,110,50,0.4)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (s(i + 503) - 0.5) * 3, py - 3 - s(i + 504) * 4); x.stroke(); }
  }
  if (a === 'pig') for (let i = 0; i < 3; i++) { const px = W * (0.25 + s(i + 40) * 0.5), py = H * (0.3 + s(i + 41) * 0.45), rx = 20 + s(i + 42) * 26, ry = rx * (0.5 + s(i + 43) * 0.3);
    x.fillStyle = 'rgba(110,78,52,0.35)'; x.beginPath(); x.ellipse(px, py, rx * 1.25, ry * 1.3, s(i + 44), 0, 6.283); x.fill();
    x.fillStyle = 'rgba(96,64,42,0.5)'; x.beginPath(); x.ellipse(px, py, rx * 0.8, ry * 0.8, s(i + 44), 0, 6.283); x.fill(); }
  /* pebbles, seeds and footprints */
  for (let i = 0; i < 160; i++) { const px = s(i + 600) * W, py = s(i + 601) * H, r = 0.8 + s(i + 602) * 1.8; x.fillStyle = s(i + 603) > 0.5 ? 'rgba(255,250,235,0.7)' : 'rgba(90,70,50,0.45)'; x.beginPath(); x.arc(px, py, r, 0, 6.283); x.fill(); }
  /* straw */
  x.lineCap = 'round'; for (let i = 0; i < (grassy ? 60 : 140); i++) { const px = s(i + 700) * W, py = s(i + 701) * H, L = 2.5 + s(i + 702) * 4.5, an = s(i + 703) * 6.283;
    x.strokeStyle = ['#f2d27a', '#e0b55a', '#f7e2a0', '#c9963f'][i % 4]; x.lineWidth = 0.9 + s(i + 704) * 0.6; x.globalAlpha = 0.75; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(an) * L, py + Math.sin(an) * L); x.stroke(); }
  x.globalAlpha = 1;
  /* ragged edge: keep a rounded inner rectangle, feathered */
  x.globalCompositeOperation = 'destination-in'; const m = 14, g2 = x.createLinearGradient(0, 0, 0, 1);
  x.fillStyle = '#000'; x.beginPath(); const N = 64;
  for (let k = 0; k <= N * 4; k++) { const t = k / N, side = Math.floor(t) % 4, f = t - Math.floor(t), j = (hash(k, w * 7 + d) - 0.5) * 7;
    const pt = side === 0 ? [m + f * (W - 2 * m), m + j] : side === 1 ? [W - m + j, m + f * (H - 2 * m)] : side === 2 ? [W - m - f * (W - 2 * m), H - m + j] : [m + j, H - m - f * (H - 2 * m)];
    if (!k) x.moveTo(pt[0], pt[1]); else x.lineTo(pt[0], pt[1]); }
  x.closePath(); x.shadowColor = '#000'; x.shadowBlur = 8; x.fill(); void g2;
  const t = new T.CanvasTexture(c); t.anisotropy = 4; return t;
}
/* rough-hewn post-and-rail fence, merged into one mesh; plus straw, a hay heap, a water trough and (pigs) shiny mud */
function flPen(a, fg, b) {
  /* the floor first: sky.js tints fence.children[0] for snow */
  const pw = b.w + 0.5, pd = b.d + 0.5, geo = new T.PlaneGeometry(pw, pd, Math.ceil(pw), Math.ceil(pd)); geo.rotateX(-Math.PI / 2);
  const floor = new T.Mesh(geo, new T.MeshStandardMaterial({ color: '#ffffff', map: flFloorTex(a, pw, pd), roughness: 1, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }));
  floor.position.y = 0.05; floor.receiveShadow = true; floor.renderOrder = 1; fg.add(floor);
  const L = [], P = at(0, 0, 0, L), CL = [], C = at(0, 0, 0, CL), seed = a.length * 31 + Math.round(b.w * 10);
  const corners = [[-b.w / 2, -b.d / 2], [b.w / 2, -b.d / 2], [b.w / 2, b.d / 2], [-b.w / 2, b.d / 2]], posts = [];
  corners.forEach((c0, s) => { const c1 = corners[(s + 1) % 4], len = Math.hypot(c1[0] - c0[0], c1[1] - c0[1]), n = Math.max(2, Math.round(len / 0.62));
    for (let k = 0; k < n; k++) { const t = k / n; posts.push([c0[0] + (c1[0] - c0[0]) * t + (k ? (hash(k, s, seed) - 0.5) * 0.06 : 0), c0[1] + (c1[1] - c0[1]) * t, k === 0]); } });
  const wood = (base) => (cx, cy, cz, i) => tone(base, i, 0.9).multiplyScalar(0.72 + 0.4 * clamp(cy / 0.5, 0, 1));
  posts.forEach(([x, z, corner], k) => { const h = (corner ? 0.58 : 0.5) + hash(k, seed, 2) * 0.08, w = corner ? 0.11 : 0.085 + hash(k, seed, 3) * 0.02;
    P(jit(box(w, h, w, 1, 3, 1), 0.008, k + seed), wood(k % 3 ? '#7a5438' : '#8a6444'), seed + k, x, h / 2, z, { rz: (hash(k, seed, 4) - 0.5) * 0.09, rx: (hash(k, seed, 5) - 0.5) * 0.09 });
    P(new T.ConeGeometry(w * 0.75, 0.05, 4).rotateY(Math.PI / 4), '#5e3f2a', seed + k + 50, x, h + 0.02, z);
    /* ivy on some posts */
    if (hash(k, seed, 6) > 0.72) for (let j = 0; j < 4; j++) P(ico(0.04 + hash(j, k) * 0.02, 0, j + k), (cx, cy, cz, i) => tone(j % 2 ? '#5d9160' : '#74a857', i, 0.6), seed + j, x + (hash(j, k, 1) - 0.5) * 0.12, 0.1 + j * 0.1, z + (hash(j, k, 2) - 0.5) * 0.12); });
  for (let k = 0; k < posts.length; k++) { const p0 = posts[k], p1 = posts[(k + 1) % posts.length], dx = p1[0] - p0[0], dz = p1[1] - p0[1], len = Math.hypot(dx, dz), ry = -Math.atan2(dz, dx);
    [0.2, 0.38].forEach((y, j) => { const sag = (hash(k, j, seed) - 0.5) * 0.04, tilt = (hash(k, j + 4, seed) - 0.5) * 0.06;
      P(jit(box(len + 0.06, 0.06 + hash(k, j, 8) * 0.015, 0.045, 3, 1, 1), 0.007, k * 3 + j), wood(j ? '#9a6c46' : '#8c6040'), seed + 200 + k * 2 + j, (p0[0] + p1[0]) / 2, y + sag, (p0[1] + p1[1]) / 2, { rz: tilt, ry }); }); }
  const fm = merged(L, MAT, fg); fm.castShadow = true;
  /* inside: straw tufts, a hay heap away from the house, a water trough on the front fence */
  const sx = penSide(a), hx = -sx * (b.w / 2 - 0.45), hz = b.d / 2 - 0.42;
  for (let i = 0; i < 14; i++) { const x = (hash(i, seed, 11) - 0.5) * (b.w - 0.4), z = (hash(i, seed, 12) - 0.5) * (b.d - 0.4), an = hash(i, seed, 13) * 3.14;
    for (let j = 0; j < 3; j++) C(box(0.16, 0.012, 0.016), ['#f2d27a', '#e0b55a', '#c9963f'][j], seed + i * 3 + j, x + (j - 1) * 0.03, 0.065 + j * 0.006, z, { ry: an + j * 0.5, rz: (hash(i, j) - 0.5) * 0.3 }); }
  C(fluff(0.3, seed + 7, 6, 0.5).scale(1.15, 0.55, 1), (cx, cy, cz, i) => tone(hash(i, 2) > 0.6 ? '#f2d27a' : '#e0b55a', i, 0.6).multiplyScalar(0.8 + 0.3 * clamp((cy + 0.1) / 0.3, 0, 1)), seed + 9, hx, 0.12, hz);
  for (let j = 0; j < 7; j++) C(box(0.22, 0.012, 0.018), '#e8c36a', seed + 30 + j, hx + (hash(j, seed, 21) - 0.5) * 0.7, 0.07, hz + (hash(j, seed, 22) - 0.5) * 0.5, { ry: hash(j, seed, 23) * 3 });
  const tx = sx * (b.w / 2 - 0.85), tz = b.d / 2 - 0.2;
  /* (the old water trough on the front fence is gone: water has its own spot by the feeding fence now, stock.js) */
  if (a === 'hen') for (let j = 0; j < 5; j++) C(ico(0.022, 0, j), '#fffaf0', seed + 60 + j, (hash(j, seed, 31) - 0.5) * b.w * 0.7, 0.07, (hash(j, seed, 32) - 0.5) * b.d * 0.6); /* feathers */
  const cm = merged(CL, MAT, fg); cm.castShadow = false;
  /* pigs: glossy puddles on top of the painted mud */
  if (a === 'pig') { const ML = [];
    for (let i = 0; i < 3; i++) { const g = new T.CircleGeometry(0.17 + hash(i, seed) * 0.1, 18); const p = g.attributes.position; for (let v = 1; v < p.count; v++) { const q = 0.82 + hash(v, i, seed) * 0.3; p.setXY(v, p.getX(v) * q * 1.3, p.getY(v) * q); }
      g.rotateX(-Math.PI / 2); g.translate((hash(i, seed, 41) - 0.5) * (b.w - 1.4), 0.068 + i * 0.001, (hash(i, seed, 42) - 0.3) * (b.d - 1.2)); ML.push(g); }
    const mg = mergeGeos(ML); mg.computeVertexNormals(); FL.mud = FL.mud || new T.MeshStandardMaterial({ color: '#7a5436', roughness: 0.3, metalness: 0.05 });
    const mud = new T.Mesh(mg, FL.mud); mud.receiveShadow = true; fg.add(mud); }
}

/* animal house roofs: a painted shingle texture (rows of rounded terracotta tiles) on the two roof boards, an eave trim and shutters */
function flShingleMat() {
  if (FL.shMat) return FL.shMat; const W = 256, c = document.createElement('canvas'); c.width = c.height = W; const x = c.getContext('2d');
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, W); const rows = 8, rh = W / rows;
  for (let r = 0; r < rows; r++) { const n = 7, tw = W / n, off = r % 2 ? tw / 2 : 0;
    for (let k = -1; k <= n; k++) { const x0 = k * tw + off, v = 0.86 + hash(k, r) * 0.18; x.fillStyle = 'rgb(' + Math.round(255 * v) + ',' + Math.round(250 * v) + ',' + Math.round(245 * v) + ')';
      x.beginPath(); x.moveTo(x0 + 2, r * rh); x.lineTo(x0 + tw - 2, r * rh); x.lineTo(x0 + tw - 2, r * rh + rh * 0.7); x.quadraticCurveTo(x0 + tw / 2, r * rh + rh * 1.08, x0 + 2, r * rh + rh * 0.7); x.closePath(); x.fill();
      const g = x.createLinearGradient(0, r * rh, 0, r * rh + rh); g.addColorStop(0, 'rgba(60,30,20,0.32)'); g.addColorStop(0.35, 'rgba(60,30,20,0)'); g.addColorStop(0.85, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(60,30,20,0.25)'); x.fillStyle = g; x.fill();
      x.strokeStyle = 'rgba(70,35,25,0.45)'; x.lineWidth = 2; x.stroke(); } }
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4;
  FL.shMat = new T.MeshStandardMaterial({ vertexColors: true, map: t, roughness: 0.85, metalness: 0 }); return FL.shMat;
}
function flHouseRoof(g, s, W, H, D, RH, OV, roof, big) {
  const span = W / 2 + OV, ang = Math.atan2(RH, span), L = Math.hypot(span, RH) + 0.02, mat = flShingleMat();
  [-1, 1].forEach((k) => { const geo = new T.BoxGeometry(L, 0.07 * s, D + 0.2 * s); const uv = geo.attributes.uv;
    /* tile the shingles: about 3 rows per roof board and tiles across the depth; rows run down the slope */
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 1.5 * s, uv.getY(i) * 1.2 * s);
    geo.rotateZ(-k * ang); const fg = fac(geo, (cx, cy, cz, i) => tone(roof, i, 0.4).multiplyScalar(0.9 + 0.16 * clamp((cy + 0.2 * s) / (0.4 * s), 0, 1)));
    if (k > 0) { const u2 = fg.attributes.uv; for (let i = 0; i < u2.count; i++) u2.setX(i, -u2.getX(i)); }
    const m = new T.Mesh(fg, mat); m.position.set(k * span / 2, H + RH / 2 + 0.04 * s, 0); m.castShadow = true; m.receiveShadow = true; g.add(m); });
  /* pale eave boards under the roof edge */
  [-1, 1].forEach((k) => { const geo = new T.BoxGeometry(0.03 * s, 0.07 * s, D + 0.22 * s); part(fac(geo, '#f1e2c4', 90), g, k * (span - 0.01), H + 0.005, 0); });
  /* shutters beside the two front windows */
  [-0.3, 0.3].forEach((x) => [-1, 1].forEach((q) => { const geo = new T.BoxGeometry(0.06 * s, 0.17 * s, 0.02); part(fac(geo, big ? '#4f7a6a' : '#5f8a7a', 91), g, (x + q * 0.12) * s, 0.4 * s, D / 2 + 0.02); }));
}

/* the well by the sheds: a base of mortared stones, a shingle roof like the animal houses, a crank and a bucket */
function flStoneMat() {
  if (FL.stMat) return FL.stMat; const W = 256, c = document.createElement('canvas'); c.width = c.height = W; const x = c.getContext('2d');
  x.fillStyle = '#8a8178'; x.fillRect(0, 0, W, W); const rows = 4, rh = W / rows;
  for (let r = 0; r < rows; r++) { let x0 = r % 2 ? -20 : 0; while (x0 < W) { const w = 44 + hash(x0, r) * 30, v = 0.82 + hash(x0, r, 3) * 0.3, cl = 'rgb(' + Math.round(208 * v) + ',' + Math.round(198 * v) + ',' + Math.round(182 * v) + ')';
      x.fillStyle = cl; x.beginPath(); x.roundRect ? x.roundRect(x0 + 3, r * rh + 3, w - 6, rh - 6, 10) : x.rect(x0 + 3, r * rh + 3, w - 6, rh - 6); x.fill();
      const g = x.createLinearGradient(0, r * rh, 0, r * rh + rh); g.addColorStop(0, 'rgba(255,255,255,0.22)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(40,30,20,0.25)'); x.fillStyle = g; x.fill();
      if (hash(x0, r, 5) > 0.6) { x.fillStyle = 'rgba(90,130,60,0.45)'; x.beginPath(); x.ellipse(x0 + w * 0.3, r * rh + rh - 8, 9, 4, 0, 0, 6.283); x.fill(); }
      x0 += w; } }
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4;
  FL.stMat = new T.MeshStandardMaterial({ map: t, roughness: 0.95, metalness: 0 }); return FL.stMat;
}
function flPlankMat() {
  FL = FL || {}; if (FL.plMat) return FL.plMat; const W = 256, c = document.createElement('canvas'); c.width = c.height = W; const x = c.getContext('2d'), n = 4, h = W / n;
  for (let k = 0; k < n; k++) { const v = 0.86 + hash(k, 2) * 0.16; x.fillStyle = 'rgb(' + Math.round(255 * v) + ',' + Math.round(250 * v) + ',' + Math.round(242 * v) + ')'; x.fillRect(0, k * h, W, h);
    x.strokeStyle = 'rgba(120,80,40,0.18)'; x.lineWidth = 1.4; for (let j = 0; j < 7; j++) { const y = k * h + 6 + hash(j, k) * (h - 12); x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(W * 0.3, y + (hash(j, k, 1) - 0.5) * 8, W * 0.6, y - (hash(j, k, 2) - 0.5) * 8, W, y); x.stroke(); }
    x.fillStyle = 'rgba(70,40,20,0.6)'; x.fillRect(0, k * h, W, 7); x.fillStyle = 'rgba(255,255,255,0.3)'; x.fillRect(0, k * h + 7, W, 3); x.fillStyle = 'rgba(70,40,20,0.15)'; x.fillRect(0, k * h + h - 8, W, 8);
    [14, W - 14].forEach((nx) => { x.fillStyle = 'rgba(60,50,45,0.7)'; x.beginPath(); x.arc(nx, k * h + h / 2, 3, 0, 6.283); x.fill(); }); }
  /* worn paint on the edges */
  x.fillStyle = 'rgba(150,100,60,0.35)'; for (let i = 0; i < 40; i++) { const ex = hash(i, 7) > 0.5 ? hash(i, 8) * 18 : W - hash(i, 8) * 18; x.beginPath(); x.ellipse(ex, hash(i, 9) * W, 4, 9, 0, 0, 6.283); x.fill(); }
  const t = new T.CanvasTexture(c); t.anisotropy = 4; FL.plMat = new T.MeshStandardMaterial({ vertexColors: true, map: t, roughness: 0.9, metalness: 0 }); return FL.plMat;
}
function flWell(g) {
  const st = new T.CylinderGeometry(0.5, 0.56, 0.52, 16, 1, true), uv = st.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 3, uv.getY(i) * 0.55);
  st.translate(0, 0.26, 0); let m = new T.Mesh(st, flStoneMat()); m.castShadow = m.receiveShadow = true; g.add(m);
  const inner = new T.CylinderGeometry(0.42, 0.42, 0.5, 16, 1, true); inner.scale(-1, 1, -1); inner.translate(0, 0.26, 0); m = new T.Mesh(inner, flStoneMat()); g.add(m);
  part(fac(new T.TorusGeometry(0.47, 0.06, 5, 18).rotateX(Math.PI / 2), (cx, cy, cz, i) => tone('#b8ac9a', i, 0.6), 33), g, 0, 0.53, 0);
  part(fac(new T.CylinderGeometry(0.42, 0.42, 0.04, 16), '#3f8fa0', 34), g, 0, 0.36, 0);
  [-0.45, 0.45].forEach((x) => { const p = new T.BoxGeometry(0.09, 1.15, 0.09); p.translate(0, 0.58, 0); part(fac(jit(p, 0.01, 2), (cx, cy, cz, i) => tone('#7a5438', i, 0.8).multiplyScalar(0.75 + 0.35 * clamp(cy / 1.15, 0, 1)), 35), g, x, 0, 0); });
  part(fac(new T.CylinderGeometry(0.035, 0.035, 1.0, 6).rotateZ(Math.PI / 2), '#8a6444', 36), g, 0, 0.9, 0);
  part(fac(new T.BoxGeometry(0.03, 0.18, 0.03), '#5e3f2a', 37), g, 0.53, 0.83, 0); part(fac(new T.CylinderGeometry(0.008, 0.008, 0.36, 4), '#c9a46a', 38), g, 0.05, 0.72, 0);
  part(fac(new T.CylinderGeometry(0.07, 0.06, 0.1, 8), '#9a6542', 39), g, 0.05, 0.5, 0);
  /* shingle roof on a little gable */
  const roofG = new T.Group(); roofG.position.y = 1.05; g.add(roofG); flHouseRoof(roofG, 1.1, 0.9, 0.04, 0.8, 0.36, 0.12, PAL.accent, false);
  roofG.children.filter((c) => c.material !== FL.shMat).forEach((c) => roofG.remove(c));
  const cap = new T.BoxGeometry(0.07, 0.07, 1.0); part(fac(cap, '#6b4630', 40), roofG, 0, 0.04 + 0.36 * 1.1 + 0.06, 0);
  /* snow on the roof in winter */
  const span = 0.45 * 1.1 + 0.12 * 1.1, ang = Math.atan2(0.36 * 1.1, span), L = Math.hypot(span, 0.36 * 1.1) + 0.02;
  [-1, 1].forEach((k) => { const sc2 = new T.BoxGeometry(L, 0.05, 1.12); sc2.rotateZ(-k * ang); snowCap(roofG, sc2, k * span / 2, 0.04 + 0.36 * 1.1 / 2 + 0.09, 0); });
}
/* the egg-and-milk crate and the market back-stock crate: painted planks instead of smooth yellow boxes */
function flPlankify(group) { if (!group) return; group.children.forEach((c) => { if (c.isMesh && c.material === MAT && c.geometry.attributes.uv && c.geometry.attributes.position.count <= 36 && c.position.y < 0.5) { c.material = flPlankMat(); } }); }

/* the feed silo: rust-streaked corrugated metal, a red dome, sacks on a pallet and clutter at its foot */
function flSilo(g) {
  const R = 0.53, Hs = 1.42, cg = new T.CylinderGeometry(R, R, Hs, 40, 8, true), p = cg.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), q = 1 + 0.025 * Math.cos(a * 20); p.setX(i, x * q); p.setZ(i, z * q); }
  cg.translate(0, Hs / 2, 0);
  part(fac(cg, (cx, cy, cz, i) => { const a = Math.atan2(cz, cx), col = Math.floor((a + 3.1416) / 6.2832 * 20), rib = 0.5 + 0.5 * Math.cos(a * 20);
    const c = tone('#c9ccd0', i, 0.4).multiplyScalar(0.78 + 0.2 * rib + 0.1 * cy / Hs);
    /* rust: streaks running down from some seams, and a warm band near the ground */
    const streak = hash(col, 17) > 0.62 ? clamp(1 - Math.abs(cy - 1.0) * 0.9, 0, 1) * 0.7 : 0, foot = clamp(1 - cy / 0.4, 0, 1) * 0.55;
    return c.lerp(new T.Color('#a8582e'), Math.min(0.75, streak + foot) * (0.6 + 0.4 * hash(col, i % 7))); }), g);
  const dome = new T.SphereGeometry(R * 1.08, 20, 8, 0, 6.2832, 0, Math.PI / 2); dome.scale(1, 0.62, 1); dome.translate(0, Hs, 0);
  part(fac(dome, (cx, cy, cz, i) => { const a = Math.atan2(cz, cx); return tone('#c4523a', i, 0.5).multiplyScalar(0.78 + 0.25 * (0.5 + 0.5 * Math.cos(a * 12)) + 0.15 * (cy - Hs) / 0.35); }), g);
  part(fac(new T.CylinderGeometry(0.06, 0.08, 0.1, 8), '#8a8f98', 9), g, 0, Hs + 0.36, 0);
  part(fac(new T.TorusGeometry(R * 1.08, 0.03, 4, 24).rotateX(Math.PI / 2), '#7a3a2a', 10), g, 0, Hs + 0.01, 0);
  const capGeo = new T.SphereGeometry(R * 1.12, 16, 6, 0, 6.2832, 0, Math.PI / 2); capGeo.scale(1, 0.64, 1); snowCap(g, capGeo, 0, Hs + 0.02, 0);
  /* clutter at the foot (kept clear of the front, where Pip picks up grain) */
  const L = [], P = at(g.position.x, g.position.z, 0, L), burlap = (cx, cy, cz, i) => tone('#d6b98a', i, 0.6).multiplyScalar(0.8 + 0.3 * clamp(cy / 0.4, 0, 1));
  const sack = (x, z, y, ry, sd) => { P(ico(0.17, 1, sd, 0.015).scale(1, 1.25, 0.8), burlap, sd, x, y + 0.2, z, { ry }); P(new T.ConeGeometry(0.06, 0.1, 6), '#c8a06a', sd + 1, x, y + 0.42, z); P(new T.TorusGeometry(0.05, 0.012, 4, 8).rotateX(Math.PI / 2), '#7a5236', sd + 2, x, y + 0.38, z); };
  /* a pallet behind the silo with two sacks on it */
  for (let k = 0; k < 4; k++) P(box(0.11, 0.03, 0.7), '#b08a5e', 1100 + k, -0.95 + k * 0.17 - 0.25, 0.1, -0.55);
  [-0.25, 0.25].forEach((z) => P(box(0.62, 0.07, 0.08), '#8a6444', 1105, -1.2, 0.035, -0.55 + z));
  sack(-1.32, -0.6, 0.12, 0.3, 1110); sack(-1.05, -0.45, 0.12, -0.4, 1113); sack(0.78, -0.35, 0, 0.8, 1116); sack(0.9, 0.05, 0, -0.2, 1119);
  /* a barrel and spilled grain */
  P(new T.CylinderGeometry(0.18, 0.18, 0.44, 12, 3), (cx, cy, cz, i) => tone('#9a6542', i, 0.5).multiplyScalar(0.8 + 0.25 * clamp((cy + 0.22) / 0.44, 0, 1)), 1122, 0.5, 0.22, -0.75);
  [0.08, 0.36].forEach((y) => P(new T.TorusGeometry(0.185, 0.015, 4, 14).rotateX(Math.PI / 2), '#3a3f48', 1123, 0.5, y, -0.75));
  for (let k = 0; k < 18; k++) { const an = hash(k, 1124) * 6.283, r = 0.6 + hash(k, 1125) * 0.5; P(ico(0.025, 0, k), '#e8c36a', 1126 + k, Math.cos(an) * r, 0.02, Math.sin(an) * r * 0.8 - 0.2); }
  const m = merged(L); return m;
}

/* ---------- beach: soft sand, foam on the shoreline, pebbles, shrubs and driftwood ---------- */
/* foam: a ribbon round the island just past the waterline; bands of foam roll in toward the sand */
{
  const N = 420, d0 = 1.02, d1 = 1.085, pos = [], uv = [], idx = [];
  for (let i = 0; i <= N; i++) { const th = i / N * 6.2832, u = Math.cos(th), v = Math.sin(th), f = 1 / isleD(u * ISL.a, v * ISL.b);
    [d0, d1].forEach((d, j) => { pos.push(u * f * d * ISL.a, 0, v * f * d * ISL.b); uv.push(i / N * 64, j); }); if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  FL.foamU = { t: { value: 0 }, light: FU.light };
  const mat = new T.ShaderMaterial({ uniforms: FL.foamU, transparent: true, depthWrite: false, side: T.DoubleSide, vertexShader: waterVS, fragmentShader: `
varying vec2 vUv; uniform float t; uniform vec3 light;
void main(){ float x = vUv.x, y = vUv.y; float wob = sin(x * 7.0 + t * 0.6) * 0.05 + sin(x * 23.0 - t * 0.4) * 0.03;
  float lip = 1.0 - smoothstep(0.12, 0.34 + wob, y);
  float w = fract(y * 1.8 + t * 0.22 + wob * 2.0); float band = smoothstep(0.0, 0.07, w) * (1.0 - smoothstep(0.1, 0.24, w)) * (1.0 - y) * smoothstep(0.2, 0.36, y);
  float lace = 0.7 + 0.3 * sin(x * 140.0 + y * 30.0 + t);
  float a = max(lip * 0.95, band * 0.8 * lace);
  gl_FragColor = vec4(mix(vec3(1.0), light / max(max(light.r, light.g), 0.05), 0.25) * min(1.0, 0.35 + max(light.r, light.g)), a); }` });
  const foam = new T.Mesh(g, mat); foam.position.y = -0.31; foam.renderOrder = 2; foam.frustumCulled = false; sc.add(foam); FL.foam = foam;
}
/* sand detail painted into the ground's detail texture: no grass strokes, soft ripples, pebbles and shells */
if (GU.detC) {
  const d = GU.detC.getContext('2d'), W = GU.detC.width, H = GU.detC.height, ring = (dd) => { for (let i = 0; i <= 240; i++) { const th = i / 240 * 6.2832, u = Math.cos(th), v = Math.sin(th), f = dd / isleD(u * ISL.a, v * ISL.b); const px = GX(u * f * ISL.a, W), py = GZ(v * f * ISL.b, H); if (!i) d.moveTo(px, py); else d.lineTo(px, py); } d.closePath(); };
  d.save(); [0.935, 0.945, 0.955, 0.965].forEach((dd) => { d.fillStyle = 'rgba(232,232,232,0.35)'; d.beginPath(); d.rect(0, 0, W, H); ring(dd); d.fill('evenodd'); }); d.restore();
  for (let i = 0; i < 9000; i++) { const px = hash(i, 71.3) * W, py = hash(i, 72.9) * H, x = px / W * 58 - 29, z = py / H * 40 - 20, dd = isleD(x, z); if (dd < 0.955 || dd > 1.03) continue;
    const k = hash(i, 73.1); if (k < 0.55) { d.fillStyle = k < 0.3 ? 'rgba(255,255,250,0.5)' : 'rgba(170,150,120,0.35)'; d.fillRect(px, py, 1.4, 1.4); }
    else if (k < 0.8) { d.strokeStyle = 'rgba(200,180,150,0.35)'; d.lineWidth = 1; d.beginPath(); const a = Math.atan2(z / ISL.b, x / ISL.a) + 1.5708; d.moveTo(px - Math.cos(a) * 5, py - Math.sin(a) * 3); d.quadraticCurveTo(px, py + 1.5, px + Math.cos(a) * 5, py + Math.sin(a) * 3); d.stroke(); }
    else if (k < 0.95) { d.fillStyle = 'rgba(120,110,100,0.45)'; d.beginPath(); d.ellipse(px + 0.6, py + 0.8, 2.2, 1.6, 0, 0, 6.283); d.fill(); d.fillStyle = hash(i, 74) > 0.5 ? '#e4ddd6' : '#c8c2bc'; d.beginPath(); d.ellipse(px, py, 2.2, 1.6, hash(i, 75) * 3, 0, 6.283); d.fill(); }
    else { d.fillStyle = '#fff6ee'; d.beginPath(); d.arc(px, py, 1.8, Math.PI, 0); d.fill(); d.strokeStyle = 'rgba(230,170,150,0.6)'; d.lineWidth = 0.6; d.stroke(); } }
  GU.det.value.needsUpdate = true;
}
/* is a spot free of town objects, pens, roads and the dock (for scatter outside blocked()'s inner island) */
function flFree(x, z, r) {
  if (roadKind(x, z)) return false;
  for (const b of ATREC) if (x > b.x0 - r && x < b.x1 + r && z > b.z0 - r && z < b.z1 + r) return false;
  for (const a in PEN) { const p = penMax(a); if (Math.abs(x - p.x) < p.w / 2 + 1.6 && Math.abs(z - p.z) < p.d / 2 + 0.9) return false; }
  if (Math.abs(x - DOCK.x) < 1.6 && z > 0) return false;
  return true;
}
{
  const L = [], P = at(0, 0, 0, L), shade = [];
  /* pebbles on the sand and in the wash */
  for (let i = 0; i < 160; i++) { const th = hash(i, 81.1) * 6.2832, dd = 0.965 + hash(i, 81.7) * 0.055, u = Math.cos(th), v = Math.sin(th), f = dd / isleD(u * ISL.a, v * ISL.b), x = u * f * ISL.a, z = v * f * ISL.b;
    if (!flFree(x, z, 0.1)) continue; const s = 0.04 + hash(i, 82.3) * 0.07; P(ico(s, 1, i, s * 0.12).scale(1.3, 0.55, 1), (cx, cy, cz, k) => tone(['#c9c1b6', '#a9a59a', '#d9cfc0', '#8f8a86'][i % 4], k, 0.4).multiplyScalar(0.8 + 0.3 * clamp((cy - hAt(x, z)) / s, 0, 1)), 820 + i, x, hAt(x, z) + s * 0.2, z, { ry: hash(i, 83) * 6 }); }
  /* beach shrubs and tufts of dune grass along the top of the sand */
  let n = 0; for (let i = 0; i < 400 && n < 34; i++) { const th = hash(i, 91.1) * 6.2832, dd = 0.928 + hash(i, 91.7) * 0.03, u = Math.cos(th), v = Math.sin(th), f = dd / isleD(u * ISL.a, v * ISL.b), x = u * f * ISL.a, z = v * f * ISL.b;
    if (!flFree(x, z, 0.5)) continue; n++;
    if (hash(i, 92) > 0.45) { const s = 0.2 + hash(i, 93) * 0.14; P(fluff(s, 900 + i, 5, 0.8).scale(1.1, 0.7, 1.1), (cx, cy, cz, k) => leafY(hash(i, 94) > 0.5 ? '#6f9a52' : '#86a85a', cy, -s * 0.2, s * 0.9, k), 900 + i, x, s * 0.45, z); shade.push([x, z, s * 1.3, s * 1.3, 0.3]); }
    else for (let j = 0; j < 7; j++) { const an = j / 7 * 6.283; P(new T.ConeGeometry(0.025, 0.32 + hash(j, i) * 0.18, 3).translate(0, 0.16, 0).rotateZ(0.25 * Math.cos(an)).rotateX(0.25 * Math.sin(an)), (cx, cy, cz, k) => tone('#a9b86a', k, 0.6).lerp(new T.Color('#e4d08a'), clamp(cy / 0.45, 0, 1) * 0.6), 950 + j, x + Math.cos(an) * 0.05, 0, z + Math.sin(an) * 0.05); } }
  /* driftwood */
  [0.6, 2.6, 4.1].forEach((th, i) => { const u = Math.cos(th), v = Math.sin(th), f = 0.985 / isleD(u * ISL.a, v * ISL.b), x = u * f * ISL.a, z = v * f * ISL.b; if (!flFree(x, z, 0.6)) return;
    P(jit(new T.CylinderGeometry(0.05, 0.07, 0.9, 6, 3).rotateZ(Math.PI / 2), 0.02, i), '#b8a898', 970 + i, x, hAt(x, z) + 0.05, z, { ry: th + 0.6 }); P(new T.CylinderGeometry(0.02, 0.03, 0.3, 5).rotateZ(1.0), '#a89888', 973 + i, x + 0.2, hAt(x, z) + 0.1, z); });
  /* moss and a mushroom or two at the foot of every tree */
  leafs.forEach((m, i) => { if (!m.parent || m.userData.pine == null && !(m.userData.y1 > 0.5)) return; const w = new T.Vector3(); m.parent.getWorldPosition(w); if (Math.abs(w.y) > 0.2 || isleD(w.x, w.z) > 0.97 || w.x > 150) return;
    for (let j = 0; j < 7; j++) { const an = j / 7 * 6.283 + hash(i, j), r = 0.14 + hash(j, i, 1) * 0.12; P(ico(0.07 + hash(j, i, 2) * 0.05, 1, i * 7 + j).scale(1.2, 0.45, 1.2), (cx, cy, cz, k) => tone(j % 3 ? '#557a34' : '#6e9440', k, 0.6), 1200 + i * 7 + j, w.x + Math.cos(an) * r, 0.02, w.z + Math.sin(an) * r); }
    if (hash(i, 77) > 0.55) { const an = hash(i, 78) * 6.28, x = w.x + Math.cos(an) * 0.3, z = w.z + Math.sin(an) * 0.3; P(new T.CylinderGeometry(0.015, 0.02, 0.07, 5), '#f6ead6', 1300 + i, x, 0.035, z); P(new T.SphereGeometry(0.045, 8, 4, 0, 6.283, 0, 1.6).scale(1, 0.7, 1), '#d2553a', 1301 + i, x, 0.065, z); } });
  const m = merged(L); m.castShadow = false; groundShade(shade);
}

/* ---------- the open grass: clover, dandelions, worn dirt by the farmyard, and work clutter ---------- */
/* clover patches painted into the detail texture (darker leaves with a bright edge) */
if (GU.detC) {
  const d = GU.detC.getContext('2d'), W = GU.detC.width, H = GU.detC.height;
  for (let i = 0; i < 150; i++) { const x = (hash(i, 61.1) - 0.5) * 46, z = (hash(i, 61.7) - 0.5) * 29; if (blocked(x, z)) continue; const cx = GX(x, W), cy = GZ(z, H), n = 6 + Math.floor(hash(i, 62) * 10);
    for (let j = 0; j < n; j++) { const px = cx + (hash(j, i, 63) - 0.5) * 22, py = cy + (hash(j, i, 64) - 0.5) * 14; for (let l = 0; l < 3; l++) { const a = l * 2.094 + hash(j, i) * 2; d.fillStyle = 'rgba(80,120,55,0.16)'; d.beginPath(); d.arc(px + Math.cos(a) * 2.2, py + Math.sin(a) * 2.2, 2.1, 0, 6.283); d.fill(); d.fillStyle = 'rgba(240,255,220,0.35)'; d.beginPath(); d.arc(px + Math.cos(a) * 2.6, py + Math.sin(a) * 2.6 - 0.6, 0.9, 0, 6.283); d.fill(); } } }
  /* more fallen leaves under the trees */
  const LV = ['#e8a050', '#d97a3a', '#e9c060', '#c8643a'];
  leafs.forEach((m, i) => { if (!m.parent) return; const w = new T.Vector3(); m.parent.getWorldPosition(w); if (Math.abs(w.x) > 40) return;
    for (let j = 0; j < 14; j++) { const px = GX(w.x + (hash(j, i, 1) - 0.5) * 2.4, W), py = GZ(w.z + (hash(j, i, 2) - 0.5) * 2.4, H); d.fillStyle = LV[(i + j) % 4]; d.save(); d.translate(px, py); d.rotate(hash(j, i, 3) * 6.283); d.beginPath(); d.ellipse(0, 0, 3.2, 1.6, 0, 0, 6.283); d.fill(); d.restore(); } });
  GU.det.value.needsUpdate = true;
}
/* worn dirt round the pens and between the lane and the sheds, painted into the path mask so it takes the path colour (and the season) */
if (GU.mask.value && GU.mask.value.image) {
  const mc = GU.mask.value.image, mx = mc.getContext('2d'), W = mc.width, H = mc.height;
  const blob = (x, z, rx, rz, a) => { const px = GX(x, W), py = GZ(z, H), sx = rx / 58 * W, sz = rz / 40 * H, r = Math.max(sx, sz); mx.save(); mx.translate(px, py); mx.scale(sx / r, sz / r); const g = mx.createRadialGradient(0, 0, r * 0.2, 0, 0, r); g.addColorStop(0, 'rgba(255,0,0,' + a + ')'); g.addColorStop(1, 'rgba(255,0,0,0)'); mx.fillStyle = g; mx.beginPath(); mx.arc(0, 0, r, 0, 6.283); mx.fill(); mx.restore(); };
  ['cow', 'hen', 'pig'].forEach((a, ai) => { const p = PEN[a]; if (p.x > 0) return;
    for (let k = 0; k < 22; k++) { const t = hash(k, ai, 5), side = Math.floor(hash(k, ai, 6) * 4), x = side < 2 ? p.x + (t - 0.5) * (p.w + 1.8) : p.x + (side === 2 ? -1 : 1) * (p.w / 2 + 0.3 + hash(k, ai, 9) * 0.5), z = side < 2 ? p.z + (side ? 1 : -1) * (p.d / 2 + 0.25 + hash(k, ai, 7) * 0.45) : p.z + (t - 0.5) * (p.d + 1.2);
      blob(x, z, 0.35 + hash(k, ai, 8) * 0.5, 0.3 + hash(k, ai, 10) * 0.35, 0.55); }
    const f = feedPos(a); blob(f[0] + 0.2, f[1], 1.0, 0.7, 0.75); });
  for (const t in SRC) { const s = SRC[t]; blob(s.x - 0.4, s.z + 1.0, 1.1, 0.75, 0.7); blob(s.x - 1.2, s.z + 1.0, 0.9, 0.45, 0.6); }
  blob(BARN.x, BARN.z + 1.9, 1.6, 0.8, 0.7);
  GU.mask.value.needsUpdate = true;
}
/* dandelions, dandelion clocks and clover flowers dotted in the lawns */
{
  const L = [];
  for (let i = 0; i < 900; i++) { const x = (hash(i, 101.1) - 0.5) * 44, z = (hash(i, 101.7) - 0.5) * 27; if (blocked(x, z)) continue;
    const k = hash(i, 102), n = 1 + Math.floor(hash(i, 103) * 4);
    for (let j = 0; j < n; j++) { const px = x + (hash(j, i, 1) - 0.5) * 0.5, pz = z + (hash(j, i, 2) - 0.5) * 0.5, h = 0.06 + hash(j, i, 3) * 0.08;
      if (k < 0.5) { const g = new T.CylinderGeometry(0.008, 0.008, h, 3); g.translate(px, h / 2, pz); L.push(fac(g, '#6f9a4a', 5)); const f = ico(0.035, 0, i + j, 0.004).scale(1, 0.55, 1); f.translate(px, h, pz); L.push(fac(f, '#f6c93a', 6)); }
      else if (k < 0.7) { const g = new T.CylinderGeometry(0.007, 0.007, h + 0.06, 3); g.translate(px, (h + 0.06) / 2, pz); L.push(fac(g, '#7a9a5a', 7)); const f = ico(0.04, 1, i + j, 0.004); f.translate(px, h + 0.07, pz); L.push(fac(f, '#fbf8f0', 8)); }
      else { const f = ico(0.028, 0, i + j, 0.003).scale(1, 0.8, 1); f.translate(px, 0.045, pz); L.push(fac(f, hash(j, i, 4) > 0.5 ? '#f3d6e4' : '#fffaf0', 9)); }
    } }
  const m = merged(L); m.castShadow = false;
}
/* farm clutter: hay bale stacks, crates of vegetables, a wheelbarrow of hay, barrels and a pitchfork, wherever there is room */
{
  const L = [], shade = [], picks = [];
  const hayCol = (cx, cy, cz, i) => tone(hash(i, 3) > 0.7 ? '#f2d27a' : '#e2b85c', i, 0.8).multiplyScalar(0.82 + 0.25 * clamp(cy / 0.7, 0, 1));
  const bale = (P, x, y, z, ry, sd) => { P(jit(box(0.62, 0.32, 0.38, 4, 2, 2), 0.02, sd), hayCol, sd, x, y + 0.16, z, { ry }); [-0.16, 0.16].forEach((o) => P(box(0.02, 0.33, 0.39), '#8a5f3a', sd + 1, x + Math.cos(ry) * o, y + 0.16, z - Math.sin(ry) * o, { ry })); };
  const crate = (P, x, z, ry, sd, veg) => { P(box(0.42, 0.3, 0.32), '#b08a5e', sd, x, 0.15, z, { ry }); [0.06, 0.24].forEach((y) => P(box(0.44, 0.05, 0.34), '#8a6444', sd + 1, x, y, z, { ry }));
    if (veg) for (let j = 0; j < 6; j++) { const ox = ((j % 3) - 1) * 0.12, oz = (Math.floor(j / 3) - 0.5) * 0.12, c = Math.cos(ry), s = Math.sin(ry); P(veg === 'cab' ? ico(0.075, 1, j) : veg === 'car' ? new T.ConeGeometry(0.04, 0.16, 5).rotateZ(1.4) : ico(0.06, 1, j), veg === 'cab' ? '#7fb050' : veg === 'car' ? '#ee8a3a' : '#d9473a', sd + 2 + j, x + ox * c + oz * s, 0.33, z - ox * s + oz * c); } };
  const KINDS = [
    (P, x, z, sd) => { bale(P, x - 0.32, 0, z, 0, sd); bale(P, x + 0.32, 0, z, 0, sd + 3); bale(P, x, 0.32, z, 0.1, sd + 6); return 0.8; },
    (P, x, z, sd) => { crate(P, x, z, 0.3, sd, 'cab'); crate(P, x + 0.5, z + 0.15, -0.2, sd + 10, 'car'); crate(P, x + 0.22, z - 0.38, 0.1, sd + 20, 'app'); return 0.7; },
    (P, x, z, sd) => { /* wheelbarrow of hay */ const ry = hash(sd, 1) * 6; const c = Math.cos(ry), s = Math.sin(ry), W = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
      let q = W(0, 0); P(box(0.5, 0.18, 0.4).scale(1, 1, 1), '#5f8a7a', sd, q[0], 0.3, q[1], { ry }); P(fluff(0.22, sd, 5, 0.6).scale(1.1, 0.6, 0.9), hayCol, sd + 1, q[0], 0.42, q[1]);
      q = W(0.34, 0); P(new T.TorusGeometry(0.11, 0.03, 5, 12), '#3a3f48', sd + 2, q[0], 0.12, q[1], { ry });
      [-0.15, 0.15].forEach((lz) => { const h = W(-0.45, lz); P(box(0.5, 0.03, 0.03), '#8a6444', sd + 3, h[0], 0.3, h[1], { ry, rz: -0.2 }); const lg = W(-0.15, lz); P(box(0.03, 0.2, 0.03), '#8a6444', sd + 4, lg[0], 0.1, lg[1], { ry }); }); return 0.6; },
    (P, x, z, sd) => { [[0, 0], [0.38, 0.12], [0.15, -0.34]].forEach(([ox, oz], j) => { P(new T.CylinderGeometry(0.17, 0.17, 0.44, 12, 3), (cx, cy, cz, i) => tone('#9a6542', i, 0.5).multiplyScalar(0.8 + 0.25 * clamp(cy / 0.44, 0, 1)), sd + j, x + ox, 0.22, z + oz); [0.08, 0.36].forEach((y) => P(new T.TorusGeometry(0.175, 0.014, 4, 14).rotateX(Math.PI / 2), '#3a3f48', sd + 5, x + ox, y, z + oz)); }); return 0.6; },
    (P, x, z, sd) => { bale(P, x, 0, z, 0.6, sd); P(box(0.03, 1.0, 0.03), '#a8714d', sd + 5, x + 0.3, 0.5, z + 0.15, { rz: 0.35 }); [-0.04, 0, 0.04].forEach((o) => P(box(0.012, 0.16, 0.012), '#8a8f98', sd + 6, x + 0.48 + o, 1.0, z + 0.15, { rz: 0.35 })); return 0.6; }
  ];
  const cands = [];
  for (let i = 0; i < 1400; i++) { const x = -21 + hash(i, 111.1) * 19, z = -13 + hash(i, 111.7) * 26; cands.push([x, z, hash(i, 112)]); }
  for (let i = 0; i < 500; i++) { const x = -8 + hash(i, 113.1) * 18, z = -13 + hash(i, 113.7) * 26; cands.push([x, z, hash(i, 114) + 0.4]); }
  cands.sort((a, b) => a[2] - b[2]);
  for (const [x, z] of cands) { if (picks.length >= 11) break; if (!cozyFree(x, z, 0.8) || isleD(x, z) > 0.9) continue; if (picks.some((p) => Math.hypot(p[0] - x, p[1] - z) < 3.2)) continue;
    const k = picks.length % KINDS.length, P = at(x, z, 0, L), r = KINDS[k](P, 0, 0, 1400 + picks.length * 30); picks.push([x, z]); shade.push([x, z, r * 1.1, r, 0.32]); solid(x, z, r * 0.7); }
  if (L.length) merged(L); groundShade(shade); FL.clutter = picks;
}
if (typeof CRATES !== 'undefined') CRATES.forEach((c) => flPlankify(c.g || (c.pile && c.pile.g)));
if (typeof backG !== 'undefined') flPlankify(backG);
/* the door ring of the house on the square becomes a ring of stones */
if (typeof doorRing !== 'undefined') { doorRing.r.visible = false; flRing(doorRing.x, doorRing.z, 0.55); }

/* ---------- tactile bubbles and parchment HUD bits ---------- */
{
  const css = `
.mktBadge { border: 4px solid #fff3dc !important; background: radial-gradient(circle at 40% 32%, #fffaf0, #f0dcb2) !important; box-shadow: 0 0 0 3px #4a2e1a, 0 6px 0 3px rgba(60,34,16,0.4), 0 10px 14px rgba(60,34,16,0.22) !important; }
.toast { border: 5px solid transparent !important; background: linear-gradient(#fdf3dc, #f0dcb2) padding-box, linear-gradient(165deg, #c4935f, #7a4c2a 50%, #a8723f) border-box !important; box-shadow: 0 6px 0 rgba(70,40,18,0.4), 0 12px 18px rgba(70,40,18,0.25) !important; color: #3a2414; }
.toast::after { content: ''; position: absolute; inset: 4px; border-radius: 999px; border: 2px dashed rgba(150,105,60,0.55); pointer-events: none; }
.act::after { content: ''; position: absolute; inset: 4px; border-radius: 50%; border: 2px dashed rgba(150,105,60,0.5); pointer-events: none; }
.act { position: relative; }
.sheet { border: 6px solid transparent !important; background: linear-gradient(#fdf3dc, #f3e2bf) padding-box, linear-gradient(165deg, #c4935f, #6e4426 55%, #a8723f) border-box !important; }
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
}
if (window.__farmTest) { window.__FL = FL; window.__CR = () => CRATES.map((c) => (c.g || c.pile.g).children.map((m) => (m.material && m.material.map ? 'T' : 'n') + (m.geometry ? m.geometry.attributes.position.count : '-')).join(' ')); }
function farmlookStep(dt) { if (FL.foamU) FL.foamU.t.value += reduced ? 0 : dt; }
