/* ---------- the ways down to the mine (Leon, 2026-11-28: "they look a bit flat, the circle entrance is sometimes obscured
   by grass"; then: "if we are just planting something above, or applying a texture on top of the ground it won't work") ----------
   A TEST of two real 3D shapes, side by side in h3, both leading to the same mine (ENTR in rules.js says where):
     the stair cut   steps cut into the ground itself, between two stone walls that grow taller on the way down, to a dark
                     mouth in the end wall, below the grass line. Only a knee-high hump stands up, so nothing behind it is
                     hidden from the camera.
     the mound       a boulder taller than Pip with the mouth built into its south face, a timber frame, a lantern and rails.
   Neither has a mat to stand on: Pip walks in, and the screen fades when the mouth is reached (the torch is still needed).
   How the cut is real: the ground is one sheet of points. enCut pulls the points round the cut onto its outline and drops
   the ones inside, so the sheet has a true hole with upright sides; the stone lining stands in it. The sea lies under all
   land, so the sea's shader leaves a hole there (SEA.hole), and the paving round both (ISLAND.roads) keeps the tall grass off. */
const EN = { g: null, on: 0, hint: 0, sp: [], dogIn: 0 };
const enGlow = new T.MeshBasicMaterial({ color: '#ffd77a' }), enDark = new T.MeshBasicMaterial({ color: '#120e17', side: T.BackSide });
const enWarmTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, 'rgba(255,196,110,0.95)'); g.addColorStop(0.45, 'rgba(255,150,60,0.45)'); g.addColorStop(1, 'rgba(255,140,50,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c); })();
function enWarm(w, h) { return new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: enWarmTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); }
/* does a triangle (in x, z) touch a box? */
function enTriBox(ax, az, bx, bz, cx, cz, x0, x1, z0, z1) {
  if (Math.max(ax, bx, cx) <= x0 || Math.min(ax, bx, cx) >= x1 || Math.max(az, bz, cz) <= z0 || Math.min(az, bz, cz) >= z1) return false;
  const E = [[ax, az, bx, bz], [bx, bz, cx, cz], [cx, cz, ax, az]], C = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]], T3 = [[ax, az], [bx, bz], [cx, cz]];
  for (const e of E) { const nx = e[3] - e[1], nz = e[0] - e[2]; let t0 = 1e9, t1 = -1e9, b0 = 1e9, b1 = -1e9;
    T3.forEach((q) => { const d = q[0] * nx + q[1] * nz; t0 = Math.min(t0, d); t1 = Math.max(t1, d); }); C.forEach((q) => { const d = q[0] * nx + q[1] * nz; b0 = Math.min(b0, d); b1 = Math.max(b1, d); });
    if (t1 <= b0 + 1e-6 || b1 <= t0 + 1e-6) return false; }
  return true;
}
/* cut a box-shaped hole in the ground: the points just outside go onto its outline (staying at ground height), the points
   inside drop to yLow, and those next to the rim go onto the outline too, so the hole's sides stand upright. A triangle may
   not span a corner of the hole (it would roof it): one of its points goes to the corner. The dropped points are pinned,
   so a neighbour area rising later does not lift them again (riseArea). */
function enCut(x0, x1, z0, z1, yLow) {
  const p = ground.geometry.attributes.position, n = p.count, pin = ground.userData.pin || (ground.userData.pin = new Set()), pad = 2;
  const kOf = (i) => Math.round(p.getX(i) * 1000) + ',' + Math.round(p.getZ(i) * 1000), ins = (x, z) => x > x0 && x < x1 && z > z0 && z < z1;
  const tris = [], keys = new Map(), S = new Map(); /* S: key -> { x, z, low } */
  for (let i = 0; i < n; i += 3) { const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
    if (cx < x0 - pad || cx > x1 + pad || cz < z0 - pad || cz > z1 + pad) continue; tris.push(i); for (let k = 0; k < 3; k++) keys.set(i + k, kOf(i + k)); }
  const put = (i, x, z, low) => { const k = keys.get(i), o = S.get(k); if (o && o.corner) return; S.set(k, { x, z, low }); };
  const corner = (x, z) => [Math.abs(x - x0) < Math.abs(x - x1) ? x0 : x1, Math.abs(z - z0) < Math.abs(z - z1) ? z0 : z1];
  const hit = [];
  for (const i of tris) { const X = [p.getX(i), p.getX(i + 1), p.getX(i + 2)], Z = [p.getZ(i), p.getZ(i + 1), p.getZ(i + 2)];
    if (!enTriBox(X[0], Z[0], X[1], Z[1], X[2], Z[2], x0, x1, z0, z1)) continue; hit.push(i);
    const I = [0, 1, 2].map((k) => ins(X[k], Z[k])), c = I.filter(Boolean).length;
    if (c === 0) { const q = corner((X[0] + X[1] + X[2]) / 3, (Z[0] + Z[1] + Z[2]) / 3); for (let k = 0; k < 3; k++) S.set(keys.get(i + k), { x: q[0], z: q[1], low: false, corner: 1 }); continue; }
    for (let k = 0; k < 3; k++) { const x = X[k], z = Z[k];
      if (!I[k]) put(i + k, clamp(x, x0, x1), clamp(z, z0, z1), false);
      else if (c < 3) { const d = [x - x0, x1 - x, z - z0, z1 - z], m = d.indexOf(Math.min(...d)); put(i + k, m === 0 ? x0 : m === 1 ? x1 : x, m === 2 ? z0 : m === 3 ? z1 : z, true); }
      else if (!S.has(keys.get(i + k))) S.set(keys.get(i + k), { x, z, low: true, free: 1 }); } }
  /* no triangle may run from one side of the hole to the next across a corner */
  const side = (o) => (Math.abs(o.x - x0) < 1e-4 ? 1 : 0) | (Math.abs(o.x - x1) < 1e-4 ? 2 : 0) | (Math.abs(o.z - z0) < 1e-4 ? 4 : 0) | (Math.abs(o.z - z1) < 1e-4 ? 8 : 0);
  for (let pass = 0; pass < 6; pass++) { let ch = 0;
    for (const i of hit) for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) { const A = S.get(keys.get(i + a)), B = S.get(keys.get(i + b)); if (!A || !B || A.free || B.free) continue;
      const sa = side(A), sb = side(B); if (!sa || !sb || (sa & sb)) continue;
      const cx = (sa & 3) ? A.x : B.x, cz = (sa & 12) ? A.z : B.z, da = Math.hypot(A.x - cx, A.z - cz), db = Math.hypot(B.x - cx, B.z - cz), M = da < db ? A : B; M.x = cx; M.z = cz; ch++; }
    if (!ch) break; }
  keys.forEach((k, i) => { const o = S.get(k); if (!o) return; p.setXYZ(i, o.x, o.low ? yLow : p.getY(i), o.z); if (o.low) pin.add(i); });
  p.needsUpdate = true; ground.geometry.computeVertexNormals(); smoothGeo(ground.geometry); ground.geometry.attributes.normal.needsUpdate = true; ground.geometry.attributes.color.needsUpdate = true; ground.geometry.computeBoundingSphere();
}
/* a wall of stone blocks in courses: along x (ax 'x') or along z, from a to b, between y0 and y1, its back on the plane c
   and its face toward n (+1 or -1). skip(u0, u1, y) leaves a block out (the mouth). The stones darken with depth. */
function enWall(L, ax, a, b, c, n, y0, y1, seed, skip) {
  const rows = Math.max(1, Math.round((y1 - y0) / 0.29)), rh = (y1 - y0) / rows, cols = ['#b3aa98', '#a39a88', '#bfb6a4', '#978e7d'];
  for (let r = 0; r < rows; r++) { const nb = Math.max(1, Math.round((b - a) / 0.5)), bl = (b - a) / nb, off = r % 2 ? bl / 2 : 0;
    for (let k = -1; k < nb; k++) { const u0 = Math.max(a, a + k * bl + off), u1 = Math.min(b, a + (k + 1) * bl + off); if (u1 - u0 < 0.06) continue;
      const yc = y0 + (r + 0.5) * rh, uc = (u0 + u1) / 2; if (skip && skip(u0, u1, yc)) continue;
      const sd = seed + r * 37 + k * 3, th = 0.09 + hash(sd, 3) * 0.05, q = ax === 'x' ? new T.BoxGeometry(u1 - u0 - 0.022, rh - 0.022, th) : new T.BoxGeometry(th, rh - 0.022, u1 - u0 - 0.022);
      if (ax === 'x') q.translate(uc, yc, c + n * th / 2); else q.translate(c + n * th / 2, yc, uc);
      const base = tone(cols[Math.floor(hash(sd, 5) * 4)], sd, 0.6).multiplyScalar(0.5 + 0.5 * clamp((yc + 1.5) / 1.5, 0, 1));
      L.push(fac(q, (cx, cy, cz, i) => base.clone().multiplyScalar(0.95 + 0.1 * hash(i, sd)), sd)); } }
}
function enBack(L, ax, a, b, c, n, y0, y1) { /* the dark stone behind the blocks, so no gap shows the earth */
  const q = ax === 'x' ? new T.BoxGeometry(b - a, y1 - y0, 0.05) : new T.BoxGeometry(0.05, y1 - y0, b - a); if (ax === 'x') q.translate((a + b) / 2, (y0 + y1) / 2, c + n * 0.025); else q.translate(c + n * 0.025, (y0 + y1) / 2, (a + b) / 2);
  L.push(fac(q, () => new T.Color('#4d463d'), 1));
}
/* how deep the steps are at z: seven steps of 0.2 from the rim, then the landing */
function enStepY(z) { const P = ENTR.pit, u = (P.z1 - z) / 0.36; if (u <= 0) return 0; const f = Math.floor(u); return -0.2 * Math.min(P.D / 0.2, f + smooth(0, 0.35, u - f)); }
function enBubble(x, y, z) { const sp = isleSprite(isleBubble('stairsDown'), 0.95); sp.position.set(x, y, z); sc.add(sp); EN.sp.push({ sp, y, ph: EN.sp.length * 1.9 }); return sp; }
function enPit() {
  const P = ENTR.pit, x = P.x, x0 = x - P.hw, x1 = x + P.hw, z0 = P.z0, z1 = P.z1, D = P.D, L = [], g = EN.g; let q;
  enCut(x0, x1, z0 - 1.5, z1, -D - 0.45); /* the tunnel behind the mouth is cut too: it lies under the hump */
  if (typeof SEA !== 'undefined' && SEA.hole) SEA.hole.value.set(x, (z0 - 1.5 + z1) / 2, P.hw + 0.25, (z1 - z0 + 1.5) / 2 + 0.25);
  /* the steps, each a block down to the floor, a little darker and warmer on the way down */
  for (let k = 0; k < 7; k++) { const za = k < 6 ? z1 - 0.36 * (k + 1) : z0 - 1.5, zb = z1 - 0.36 * k, top = -0.2 * (k + 1), h = D + 0.4 + top; q = new T.BoxGeometry(P.hw * 2, h, zb - za); q.translate(x, top - h / 2, (za + zb) / 2);
    const c = new T.Color('#c9c0ae').multiplyScalar(1 - k * 0.075).lerp(new T.Color('#c98a4a'), k > 3 ? (k - 3) * 0.06 : 0); L.push(fac(q, (cx, cy, cz, i) => c.clone().multiplyScalar(cy > top - 0.02 ? 1 : 0.72).multiplyScalar(0.96 + 0.08 * hash(i, 2700 + k)), 2700 + k)); }
  /* the lining: side walls, and the end wall with the mouth in it. The end wall stands 0.42 over the grass: the hump's face */
  const top = 0.42, mw = 0.56, mt = 0.08; /* the mouth: half as wide as mw says, its top at mt */
  enBack(L, 'z', z0, z1, x0, 1, -D - 0.3, 0); enWall(L, 'z', z0, z1, x0, 1, -D - 0.16, 0, 2720);
  enBack(L, 'z', z0, z1, x1, -1, -D - 0.3, 0); enWall(L, 'z', z0, z1, x1, -1, -D - 0.16, 0, 2760);
  enBack(L, 'x', x0, x - mw, z0, 1, -D - 0.3, top); enBack(L, 'x', x + mw, x1, z0, 1, -D - 0.3, top); enBack(L, 'x', x - mw, x + mw, z0, 1, mt, top);
  enWall(L, 'x', x0, x1, z0, 1, -D - 0.03, top, 2800, (u0, u1, y) => u1 > x - mw + 0.04 && u0 < x + mw - 0.04 && y < mt + 0.1);
  /* the back of the hump's face, and a cap of flat stones along the grass line */
  q = new T.BoxGeometry(P.hw * 2 + 0.1, top, 0.3); q.translate(x, top / 2, z0 - 0.15); L.push(fac(q, (cx, cy, cz, i) => tone('#8f8674', i, 0.5), 2840));
  for (let k = 0; k < 4; k++) { const w = (P.hw * 2 + 0.5) / 4; q = new T.BoxGeometry(w - 0.03, 0.13, 0.5); jit(q, 0.012, 2850 + k); q.translate(x0 - 0.25 + w * (k + 0.5), top + 0.065, z0 - 0.13); L.push(fac(q, (cx, cy, cz, i) => tone(k % 2 ? '#d2c9b8' : '#c4bba9', i + k * 9, 0.5), 2850 + k)); }
  /* kerb stones along the two long edges, standing over the grass and stepping up toward the hump */
  [x0 - 0.16, x1 + 0.16].forEach((kx, s) => { for (let k = 0; k < 6; k++) { const t = 1 - k / 5, h = 0.2 + 0.2 * t * t, l = (z1 - z0) / 6; q = new T.BoxGeometry(0.3, h, l - 0.03); jit(q, 0.015, 2860 + s * 10 + k); q.translate(kx, h / 2, z1 - l * (k + 0.5));
    L.push(fac(q, (cx, cy, cz, i) => tone(['#c4bba9', '#b3aa98', '#cfc6b5'][(k + s) % 3], i + k * 5, 0.5).multiplyScalar(cy > h - 0.03 ? 1.04 : 0.8), 2860 + s * 10 + k)); } });
  /* the hump: a low mossy rock over the tunnel, its moss the lawn's own green a shade darker, with a few stones round it */
  q = ico(1, 1, 2880, 0.09); q.scale(1.5, 0.5, 1.05); q.translate(x, 0.06, z0 - 1.0); L.push(fac(q, (cx, cy, cz, i) => (hash(i, 2880) > 0.3 ? groundCol(cx, 0, cz, i).multiplyScalar(0.62 + 0.22 * hash(i, 7)) : tone('#a9a090', i, 0.6).multiplyScalar(0.9)), 2880));
  [[-1.2, -0.5, 0.26], [1.15, -0.7, 0.22], [0.4, -1.75, 0.2], [-0.7, -1.7, 0.17]].forEach(([dx, dz, r], k) => { q = ico(r, 0, 2890 + k); q.scale(1.2, 0.7, 1); q.translate(x + dx, r * 0.3, z0 + dz); L.push(fac(q, (cx, cy, cz, i) => tone('#a9a090', i + k, 0.6), 2890 + k)); });
  /* the mouth's timber: two posts and a beam */
  [-1, 1].forEach((s, k) => { q = new T.BoxGeometry(0.13, D + mt + 0.02, 0.14); jit(q, 0.008, 2900 + k); q.translate(x + s * (mw - 0.02), (mt - D) / 2, z0 + 0.2); L.push(fac(q, (cx, cy, cz, i) => tone('#8a5f3c', i, 0.5).multiplyScalar(0.6 + 0.4 * clamp((cy + D) / D, 0, 1)), 2900 + k)); });
  q = new T.BoxGeometry(mw * 2 + 0.34, 0.15, 0.18); jit(q, 0.008, 2902); q.translate(x, mt + 0.05, z0 + 0.2); L.push(fac(q, (cx, cy, cz, i) => tone('#a9774a', i, 0.5), 2902));
  const lamps = [lanternMake(x0 - 0.42, z1 + 0.28, L), lanternMake(x1 + 0.42, z1 + 0.28, L)]; lamps.forEach((l) => l.forEach((m) => g.add(m)));
  merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g);
  /* the tunnel: a dark box behind the mouth, and warm light coming out of it over the landing */
  const tun = new T.Mesh(new T.BoxGeometry(mw * 2 + 0.1, D + mt + 0.22, 1.45), enDark); tun.position.set(x, (mt - D - 0.18) / 2, z0 - 0.72); g.add(tun);
  let w = enWarm(1.0, 1.3); w.position.set(x, -D + 0.62, z0 - 0.5); g.add(w);
  w = enWarm(1.7, 1.5); w.rotation.x = -Math.PI / 2; w.position.set(x, -D + 0.02, z0 + 0.45); w.material.opacity = 0.7; g.add(w);
  enBubble(x, 1.75, z0 - 0.35);
}
function enMound() {
  const M = ENTR.mound, s = M.s, L = [], g = EN.g, at = (q, x, y, z) => { q.scale(s, s, s); q.translate(M.x + x * s, y * s, M.z + z * s); return q; }; let q;
  const rock = (q, seed) => L.push(fac(q, (cx, cy, cz, i) => { const up = cy > 1.9 * s && hash(i, seed) > 0.35; return up ? groundCol(cx, 0, cz, i).multiplyScalar(0.6 + 0.25 * hash(i, 7)) : shadeY(['#a9a090', '#9a9184', '#b6ad9d'][i % 3], cy, 0, 2.6 * s, i + seed, 0.5); }, seed));
  /* the boulder: two shoulders, a back and a cap, set round the tunnel so it stays free */
  q = ico(1, 1, 2910, 0.1); q.scale(0.76, 1.35, 1.25); rock(at(q, -1.4, 0.8, -0.05), 2910);
  q = ico(1, 1, 2911, 0.1); q.scale(0.8, 1.25, 1.2); rock(at(q, 1.45, 0.76, 0), 2911);
  q = ico(1, 1, 2912, 0.1); q.scale(1.6, 1.45, 0.82); rock(at(q, 0, 1.0, -1.05), 2912);
  q = ico(1, 1, 2913, 0.09); q.scale(1.65, 0.56, 1.2); rock(at(q, 0, 2.3, -0.3), 2913);
  [[-1.75, 0.2, 0.95, 0.42], [1.85, 0.18, 0.85, 0.4], [-0.6, 2.7, -0.7, 0.46], [1.0, 2.55, -0.8, 0.4], [-2.1, 0.2, -0.6, 0.45], [2.1, 0.2, -0.8, 0.42]].forEach(([x, y, z, r], k) => { q = ico(r, 0, 2920 + k); q.scale(1.15, 0.85, 1); rock(at(q, x, y, z), 2920 + k); });
  /* the timber frame in the mouth */
  [-1, 1].forEach((sd, k) => { q = new T.BoxGeometry(0.15, 1.8, 0.17); jit(q, 0.01, 2940 + k); at(q, sd * 0.7, 0.9, 1.12); L.push(fac(q, (cx, cy, cz, i) => tone(sd < 0 ? '#7d5534' : '#8a5f3c', i, 0.5), 2940 + k)); });
  q = new T.BoxGeometry(1.78, 0.17, 0.21); jit(q, 0.01, 2942); at(q, 0, 1.86, 1.12); L.push(fac(q, (cx, cy, cz, i) => tone('#a9774a', i, 0.5), 2942));
  [-1, 1].forEach((sd, k) => { q = new T.BoxGeometry(0.07, 0.5, 0.08); q.rotateZ(sd * 0.78); at(q, sd * 0.52, 1.62, 1.13); L.push(fac(q, '#7d5534', 2944 + k)); });
  /* rails and sleepers running out of the mouth */
  for (let k = 0; k < 7; k++) { q = new T.BoxGeometry(0.86, 0.045, 0.13); at(q, 0, 0.03, -0.1 + k * 0.42); L.push(fac(q, (cx, cy, cz, i) => tone('#7d5534', i + k, 0.6), 2950 + k)); }
  [-0.3, 0.3].forEach((rx, k) => { q = new T.BoxGeometry(0.05, 0.05, 3.0); at(q, rx, 0.075, 1.1); L.push(fac(q, '#6a625a', 2960 + k)); });
  /* the lantern under the beam */
  q = new T.BoxGeometry(0.03, 0.14, 0.03); at(q, 0, 1.7, 1.14); L.push(fac(q, '#3b3348', 2970)); q = new T.BoxGeometry(0.2, 0.05, 0.2); at(q, 0, 1.62, 1.14); L.push(fac(q, '#3b3348', 2971));
  merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g);
  const lan = new T.Mesh(new T.BoxGeometry(0.15 * s, 0.17 * s, 0.15 * s), enGlow); lan.position.set(M.x, 1.51 * s, M.z + 1.14 * s); g.add(lan); nightLamp(M.x, M.z + 1.5 * s, 3.8);
  /* the tunnel, and its light */
  const tun = new T.Mesh(new T.BoxGeometry(1.28 * s, 1.8 * s, 1.5 * s), enDark); tun.position.set(M.x, 0.89 * s, M.z + 0.4 * s); g.add(tun);
  let w = enWarm(1.1 * s, 1.3 * s); w.position.set(M.x, 0.7 * s, M.z - 0.2 * s); g.add(w);
  w = enWarm(1.9 * s, 1.8 * s); w.rotation.x = -Math.PI / 2; w.position.set(M.x, 0.09, M.z + 1.25 * s); w.material.opacity = 0.55; g.add(w);
  /* crystals at its foot say what is inside */
  [[-2.0, 1.05, 0.62, 0.4], [2.05, 0.75, 0.5, 2.1]].forEach(([x, z, sc2, ry]) => { const c = new T.Mesh(CRYSTAL_GEO, crystalMat); c.scale.setScalar(sc2 * s); c.rotation.y = ry; c.position.set(M.x + x * s, 0, M.z + z * s); c.castShadow = true; g.add(c); });
  enBubble(M.x, 3.6 * s, M.z + 0.3 * s);
}
/* cave.js calls this where the stairs used to be built */
function entrBuild(A, fresh) {
  if (EN.g) return; EN.g = new T.Group(); sc.add(EN.g);
  enPit(); enMound();
  const P = ENTR.pit; CAVE_OUT.x = P.x; CAVE_OUT.z = P.z1 + 0.9;
  /* what the rest of the game knows as "the stairs": the top of the stair cut (the map's badge, the dog's lead) */
  stairsDown = { x: P.x, z: P.z1 + 0.5, R: 0, w: 0, pop: 0, g: EN.g, fg: { setDrawRange() {} }, ok: () => false, to: () => CAVE_IN, cave: true };
  if (typeof GR !== 'undefined' && GR.tex) GR.t = Math.min(GR.t, 0.5);
}
function enGo(ox, oz) {
  if (!gearHas('torch')) { if (EN.hint <= 0) { EN.hint = 2.6; gearHint('torch'); } return; } /* down needs the torch (gear.js): its picture shows instead */
  CAVE_OUT.x = ox; CAVE_OUT.z = oz; caveGo({ to: () => CAVE_IN, cave: true });
}
function entrStep(dt) {
  if (!EN.g) return; const pp = pip.position, P = ENTR.pit, M = ENTR.mound, s = M.s; EN.hint = Math.max(0, EN.hint - dt);
  EN.sp.forEach((b) => { b.sp.visible = !inCave; b.sp.position.y = b.y + (reduced ? 0 : Math.sin(time * 2 + b.ph) * 0.05); });
  if (inCave) { EN.on = 0; return; }
  const moved = caveT && caveT.moved;
  /* the stair cut: a hole to walk round, open only at its south end; inside, Pip keeps between the walls and sinks step by step */
  if (!moved) { const dx = pp.x - P.x, inZ = pp.z > P.z0 - 0.2 && pp.z < P.z1 + 0.05;
    if (EN.on && (Math.abs(dx) > P.hw + 0.3 || !inZ)) { EN.on = 0; if (pp.y < 0) pp.y = 0; }
    if (!EN.on) { if (Math.abs(dx) < P.hw - 0.22 && pp.z > P.z1 - 0.5 && pp.z < P.z1 + 0.3) { if (pp.z < P.z1) EN.on = 1; } else mesaOut({ x: P.x, z: (P.z0 + P.z1) / 2 - 0.85, w: P.hw * 2 + 0.3, d: P.z1 - P.z0 + 1.7 }, pp, 0.22); }
    if (EN.on) { pp.x = clamp(pp.x, P.x - P.hw + 0.3, P.x + P.hw - 0.3); pp.z = Math.max(pp.z, P.z0 + 0.42); pp.y = enStepY(pp.z);
      if (pp.z < P.z0 + 0.7 && !caveT) enGo(P.x, P.z1 + 0.9); } }
  /* the mound: solid, but for the lane into its mouth */
  if (!caveT) { const mx = (pp.x - M.x) / s, mz = (pp.z - M.z) / s;
    if (Math.abs(mx) < 0.55 && mz > 0.3 && mz < 1.6) { if (mz < 1.25) pp.x = clamp(pp.x, M.x - 0.3 * s, M.x + 0.3 * s); if (mz < 0.8) { pp.z = Math.max(pp.z, M.z + 0.62 * s); enGo(M.x, M.z + 2.3 * s); } }
    else mesaOut({ x: M.x, z: M.z - 0.3 * s, w: 4.3 * s, d: 3.0 * s }, pp, 0.2); }
  /* the dog goes down the steps too */
  if (typeof dog !== 'undefined' && dog.g) { const d = dog.g.position, inP = Math.abs(d.x - P.x) < P.hw && d.z > P.z0 && d.z < P.z1; if (inP) { d.y = enStepY(d.z); EN.dogIn = 1; } else if (EN.dogIn) { EN.dogIn = 0; d.y = 0; } }
}
ISLE_STEPS.push(entrStep);
