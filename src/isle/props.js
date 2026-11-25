/* ---------- props rebuilt for the highest graphics level (Leon, 2026-11-25): the chest, the boat, the old cottage
   and the two tents. They were a handful of flat boxes; now they are made of boards, stones, cloth panels and shingles
   like the hut and the forge. Only functions in this file: the files before it in the list call them. ---------- */
function prBox(L, w, h, d, x, y, z, col, seed, o) {
  o = o || {}; const q = new T.BoxGeometry(w, h, d); if (o.j) jit(q, o.j, seed);
  if (o.rx) q.rotateX(o.rx); if (o.rz) q.rotateZ(o.rz); if (o.ry) q.rotateY(o.ry); q.translate(x, y, z);
  const c0 = typeof col === 'function' ? null : tone(col, seed, o.t == null ? 0.35 : o.t);
  L.push(fac(q, c0 ? (cx, cy) => (o.sh ? c0.clone().multiplyScalar(0.8 + 0.3 * clamp((cy - o.sh[0]) / (o.sh[1] - o.sh[0]), 0, 1)) : c0) : col, seed)); return q;
}
/* a sheet of triangles through fn(a, b) (a, b from 0 to 1), every triangle turned to face dir */
function prGrid(L, fn, na, nb, dir, col, seed) {
  const pos = [], V = (i, j) => fn(i / na, j / nb);
  const tri = (a, b, c) => { const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const d = (uy * vz - uz * vy) * dir[0] + (uz * vx - ux * vz) * dir[1] + (ux * vy - uy * vx) * dir[2]; (d >= 0 ? [a, b, c] : [a, c, b]).forEach((p) => pos.push(p[0], p[1], p[2])); };
  for (let i = 0; i < na; i++) for (let j = 0; j < nb; j++) { const a = V(i, j), b = V(i + 1, j), c = V(i, j + 1), d = V(i + 1, j + 1); tri(a, b, c); tri(b, d, c); }
  const q = new T.BufferGeometry(); q.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); q.computeVertexNormals(); L.push(fac(q, col, seed)); return q;
}
function prCol(hex) { return () => new T.Color(hex); }

/* ----- the treasure chest: plank sides, corner posts, iron straps, a gold lock, ring handles, a lid of curved staves ----- */
function propChest(g, lid) {
  const L = [], W = 0.7, H = 0.42, D = 0.48, wood = ['#b07a48', '#a36f40', '#bd8650', '#aa7444'], iron = '#4b5360', dk = '#6d4628', gold = '#f2c23c';
  prBox(L, W + 0.05, 0.05, D + 0.05, 0, 0.025, 0, dk, 1400);
  prBox(L, W - 0.08, H - 0.06, D - 0.08, 0, H / 2 - 0.01, 0, prCol('#4a2f1e'), 1401);
  prBox(L, W - 0.1, 0.02, D - 0.1, 0, H - 0.035, 0, '#a8433a', 1402, { t: 0.1 }); /* red cloth inside, seen when the lid is up */
  const bh = (H - 0.05) / 4;
  for (let r = 0; r < 4; r++) { const y = 0.05 + bh * (r + 0.5);
    [-1, 1].forEach((s) => { prBox(L, W - 0.02, bh - 0.008, 0.035, 0, y, s * (D / 2 - 0.0175), wood[(r + (s > 0 ? 0 : 2)) % 4], 1410 + r * 4 + s, { sh: [0, H] });
      prBox(L, 0.035, bh - 0.008, D - 0.02, s * (W / 2 - 0.0175), y, 0, wood[(r + (s > 0 ? 1 : 3)) % 4], 1430 + r * 4 + s, { sh: [0, H] }); }); }
  [-1, 1].forEach((sx) => { [-1, 1].forEach((sz) => { prBox(L, 0.065, H, 0.065, sx * (W / 2 - 0.02), H / 2, sz * (D / 2 - 0.02), dk, 1450 + sx * 2 + sz, { sh: [0, H] });
    prBox(L, 0.055, H - 0.04, 0.012, sx * 0.2, H / 2 + 0.02, sz * (D / 2 + 0.006), iron, 1460 + sx * 2 + sz, { t: 0.15 }); });
    [0.11, 0.33].forEach((y, j) => prBox(L, 0.022, 0.022, 0.012, sx * 0.2, y, D / 2 + 0.016, '#c9ced6', 1470 + j + sx, { t: 0.1 }));
    const q = new T.TorusGeometry(0.055, 0.013, 5, 12); q.rotateY(Math.PI / 2); q.translate(sx * (W / 2 + 0.014), 0.2, 0); L.push(fac(q, prCol(iron), 1480 + sx));
    prBox(L, 0.014, 0.05, 0.1, sx * (W / 2 + 0.007), 0.25, 0, iron, 1484 + sx, { t: 0.15 }); });
  prBox(L, 0.13, 0.15, 0.03, 0, 0.33, D / 2 + 0.015, gold, 1490, { t: 0.15 }); prBox(L, 0.03, 0.055, 0.01, 0, 0.32, D / 2 + 0.033, prCol('#3a2a1a'), 1491);
  merged(L, MAT, g);
  /* the lid: its hinge is the back edge, so everything is drawn from z 0 (back) to D (front) */
  const M = [], RZ = D / 2 + 0.005, RY = 0.165, N = 7;
  let q = new T.CylinderGeometry(1, 1, W - 0.03, 12, 1, false, 0, Math.PI); q.rotateZ(Math.PI / 2); q.scale(1, RY - 0.012, RZ - 0.012); q.translate(0, 0, D / 2);
  M.push(fac(q, (cx, cy, cz, i) => (Math.abs(cx) > W / 2 - 0.03 ? shadeY('#a36f40', cy, -0.1, 0.25, 3, 0.3) : new T.Color('#4a2f1e')), 1500));
  for (let k = 0; k < N; k++) { const a0 = k / N * Math.PI, a1 = (k + 1) / N * Math.PI, z0 = D / 2 - RZ * Math.cos(a0), y0 = RY * Math.sin(a0), z1 = D / 2 - RZ * Math.cos(a1), y1 = RY * Math.sin(a1);
    const cl = Math.hypot(z1 - z0, y1 - y0), th = Math.atan2(-(y1 - y0), z1 - z0), my = (y0 + y1) / 2, mz = (z0 + z1) / 2, ny = Math.cos(th), nz = Math.sin(th);
    prBox(M, W, 0.03, cl + 0.004, 0, my, mz, wood[k % 4], 1510 + k, { rx: th, sh: [-0.1, 0.2] });
    [-1, 1].forEach((s) => prBox(M, 0.055, 0.012, cl + 0.012, s * 0.2, my + ny * 0.02, mz + nz * 0.02, iron, 1520 + k * 2 + s, { rx: th, t: 0.15 })); }
  prBox(M, W + 0.012, 0.04, 0.03, 0, 0.012, D + 0.004, dk, 1540); prBox(M, 0.09, 0.09, 0.02, 0, 0.0, D + 0.026, gold, 1541, { t: 0.15 });
  merged(M, MAT, lid);
}

/* ----- the boat to the farm: a planked hull (red below, cream and blue above), floor boards, two benches, a mast with a
   striped sail and a pennant, a rudder and a bow lantern. The bow points west (-x); Pip stands just ahead of the mast. ----- */
function propBoat(parent) {
  const L = [], LEN = 1.8, XO = -0.12, B = 0.46, NU = 14, NV = 5, H2 = Math.PI / 2;
  const bw = (u) => B * Math.pow(Math.sin(H2 * Math.min(1, u / 0.6)), 0.9) * (1 - 0.22 * Math.pow(Math.max(0, (u - 0.6) / 0.4), 2));
  const gy = (u) => 0.1 + 0.2 * Math.pow(1 - u, 2.6) + 0.05 * u * u * u, ky = (u) => -0.3 + 0.26 * Math.pow(1 - u, 3.2);
  const P = (u, v, s, bs, kd, dy) => { const f = v * H2, k = ky(u) + kd, g0 = gy(u); return [XO + (u - 0.5) * LEN - 0.22 * Math.pow(1 - u, 3) * v, k + (g0 - k) * (1 - Math.cos(f)) + dy, s * bw(u) * bs * Math.pow(Math.sin(f), 0.8)]; };
  const wAt = (u, y) => { const k = ky(u) + 0.035, c = clamp((y - k) / (gy(u) - k), 0, 1); return bw(u) * 0.9 * Math.pow(Math.sin(Math.acos(1 - c)), 0.8); };
  const strake = ['#d9573f', '#cf4f39', '#d9573f', '#fbf3e4', '#4f9fd0'], dk = '#7a4e2c', wood = ['#c99f6c', '#b98a58', '#d4aa78'];
  [-1, 1].forEach((s) => {
    for (let j = 0; j < NV; j++) { const c = tone(strake[j], 5030 + j, 0.2);
      prGrid(L, (a, b) => P(a, (j + b) / NV, s, b ? 1 : 1.035, 0, 0), NU, 1, [0, -0.35, s], (cx, cy) => c.clone().multiplyScalar(0.86 + 0.5 * clamp(cy + 0.3, 0, 0.4)), 5030 + j);
      prGrid(L, (a, b) => P(a, (j + b) / NV, s, 0.9, 0.035, 0), NU, 1, [0, 0.35, -s], (cx, cy) => shadeY(wood[j % 3], cy, -0.4, 0.4, j, 0.3), 5040 + j); }
    /* the rail on top of the side */
    prGrid(L, (a, b) => P(a, 1, s, b ? 0.86 : 1.07, 0, 0.022), NU, 1, [0, 1, 0], prCol('#fbf3e4'), 5050);
    prGrid(L, (a, b) => P(a, 1, s, 1.07, 0, b ? 0.022 : -0.03), NU, 1, [0, 0, s], prCol('#4f9fd0'), 5051);
  });
  /* the flat stern */
  const xs = XO + LEN / 2;
  prGrid(L, (a, b) => { const p = P(1, b, a < 0.5 ? -1 : 1, a === 0.5 ? 0 : 1, 0, 0); return [xs, p[1], p[2]]; }, 2, NV, [1, 0, 0], (cx, cy) => new T.Color(cy > gy(1) - 0.09 ? '#4f9fd0' : cy > -0.02 ? '#fbf3e4' : '#d9573f'), 5055);
  prGrid(L, (a, b) => { const p = P(1, b, a < 0.5 ? -1 : 1, a === 0.5 ? 0 : 0.9, 0.035, 0); return [xs - 0.045, p[1], p[2]]; }, 2, NV, [-1, 0, 0], prCol(wood[1]), 5056);
  prBox(L, 0.075, 0.05, bw(1) * 2.1, xs - 0.02, gy(1) + 0.0, 0, dk, 5057);
  /* floor boards, two benches */
  for (let k = 0; k < 9; k++) { const u = 0.3 + k * 0.075, w = wAt(u, -0.14); prBox(L, 0.125, 0.025, w * 2, XO + (u - 0.5) * LEN, -0.14, 0, wood[k % 3], 5060 + k); }
  [0.56, 0.9].forEach((u, k) => prBox(L, 0.17, 0.03, wAt(u, 0.03) * 2 + 0.03, XO + (u - 0.5) * LEN, 0.03, 0, wood[2], 5070 + k));
  /* the bow post and its lantern */
  const bx = XO - LEN / 2 - 0.22; prBox(L, 0.06, 0.2, 0.06, bx + 0.02, gy(0) + 0.07, 0, dk, 5075);
  prBox(L, 0.11, 0.025, 0.11, bx + 0.02, gy(0) + 0.3, 0, '#3a3f48', 5076, { t: 0.1 });
  const lm = new T.Mesh(new T.BoxGeometry(0.085, 0.11, 0.085), new T.MeshBasicMaterial({ color: '#ffe07a' })); lm.position.set(bx + 0.02, gy(0) + 0.23, 0); parent.add(lm);
  /* mast, boom, sail (both faces), pennant */
  const mx = XO + 0.25 * LEN, top = 1.95; let q = new T.CylinderGeometry(0.022, 0.034, top + 0.14, 7); q.translate(mx, top / 2 - 0.07, 0); L.push(fac(q, (cx, cy) => shadeY('#8a5f3c', cy, -0.2, 1.6, 4, 0.3), 5080));
  q = new T.CylinderGeometry(0.018, 0.022, 0.96, 6); q.rotateZ(Math.PI / 2); q.translate(mx + 0.46, 0.3, 0); L.push(fac(q, prCol('#7a5232'), 5081));
  prBox(L, 0.3, 0.025, 0.025, xs - 0.17, 0.2, 0, dk, 5082); prBox(L, 0.04, 0.34, 0.03, xs + 0.02, -0.06, 0, dk, 5083);
  const sail = (a, b) => { const w = 0.9 * (1 - b); return [mx + 0.03 + w * a, 0.34 + 1.5 * b + 0.03 * a * (1 - b), 0.1 * Math.sin(Math.PI * a) * Math.sin(Math.PI * (0.15 + 0.85 * b)) * (1 - b * 0.5)]; };
  const sc0 = (cx, cy) => tone(Math.floor((cy - 0.34) / 0.25) % 2 ? '#ee7a5a' : '#fff6e4', Math.floor(cy / 0.21), 0.15);
  prGrid(L, sail, 5, 10, [0, 0, 1], sc0, 5085); prGrid(L, sail, 5, 10, [0, 0, -1], sc0, 5086);
  const pen = (a, b) => [mx + 0.02 + 0.3 * a, top - 0.02 + (b - 0.5) * 0.15 * (1 - a), 0.02 * Math.sin(a * 5)];
  prGrid(L, pen, 3, 1, [0, 0, 1], prCol('#f2c23c'), 5088); prGrid(L, pen, 3, 1, [0, 0, -1], prCol('#f2c23c'), 5089);
  return merged(L, MAT, parent);
}

/* ----- the old cottage: walls of single stones with broken, mossy tops, a timber door frame, a window with a hanging
   shutter, a gable roof that has half fallen in (shingles, bare rafters), a chimney, ivy and rubble.
   Same footprint and doorway as before (door in the middle of the front, +z). Returns the door leaf, hinged on the right. ----- */
function propRuin(L, g, idx) {
  const S0 = 1600 + idx * 53, stone = ['#bdb4a2', '#a69c8a', '#c8bfae', '#9c9382', '#b3a996'], timber = '#6e5238', moss = ['#6f9a4a', '#5f8f40', '#7aa655'];
  const sm = (x, a, b) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const run = (ax, az, bx, bz, hF, sd, holes) => {
    const len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len, ry = Math.atan2(-uz, ux), ch = 0.17, th = 0.2, m = Math.round(len / 0.3), bwd = len / m;
    for (let r = 0; r < 12; r++) { const y = ch * (r + 0.5), odd = r % 2, Q = [];
      for (let k = 0; k < m + odd; k++) { let lo = bwd * k - odd * bwd / 2, hi = lo + bwd; lo = Math.max(0, lo); hi = Math.min(len, hi);
        let P = [[lo, hi]]; (holes || []).forEach((h) => { if (y < h[2] || y > h[3]) return; const N = []; P.forEach(([a, b]) => { if (h[1] <= a || h[0] >= b) { N.push([a, b]); return; } if (h[0] - a > 0.06) N.push([a, h[0]]); if (b - h[1] > 0.06) N.push([h[1], b]); }); P = N; });
        P.forEach(([a, b]) => { const c = (a + b) / 2, px = ax + ux * c, pz = az + uz * c, topH = hF(c, px, pz, hash(Math.floor((lo + 0.01) / 0.3), sd) - 0.5);
          if (y + ch * 0.3 >= topH) return; Q.push([a, b]);
          const k2 = sd + r * 97 + k * 13 + Math.round(a * 50), col = stone[Math.floor(hash(k2, 5) * stone.length)], out = hash(k2, 3) * 0.03;
          prBox(L, b - a - 0.02, ch - 0.02, th + out, px, y, pz, (cx, cy) => { const q = shadeY(col, cy, -0.1, 2.4, k2, 0.55); return cy < 0.2 ? q.lerp(new T.Color('#7f9060'), 0.3) : q; }, k2, { ry, j: 0.012 });
          if (y + ch * 1.3 >= topH && hash(k2, 9) > 0.4) prBox(L, (b - a) * 0.8, 0.04, th * 0.9, px, y + ch / 2 + 0.008, pz, moss[k2 % 3], k2 + 1, { ry, j: 0.012 }); }); }
      /* a dark core behind each unbroken stretch of stones, so no daylight shows through the joints */
      let r0 = null, e0 = 0; Q.concat([[1e9, 1e9]]).forEach(([a, b]) => { if (r0 != null && a - e0 > 0.03) { const c = (r0 + e0) / 2; prBox(L, e0 - r0 - 0.012, ch + 0.004, th - 0.07, ax + ux * c, y, az + uz * c, prCol('#5a5348'), sd, { ry }); r0 = null; } if (r0 == null) r0 = a; e0 = b; }); } };
  prBox(L, 2.0, 0.04, 1.75, 0, 0.02, 0, '#6a5a49', S0, { t: 0.2 });
  for (let k = 0; k < 6; k++) prBox(L, 0.3 + hash(k, S0) * 0.2, 0.03, 0.26 + hash(k, 2) * 0.16, -0.7 + (k % 3) * 0.62 + hash(k, 4) * 0.1, 0.045, -0.4 + Math.floor(k / 3) * 0.75, stone[k % 5], S0 + 2 + k, { j: 0.01, ry: hash(k, 6) * 0.5 });
  run(-1.15, -0.95, 1.15, -0.95, (c, px, pz, n) => 1.36 - 0.55 * sm(px, 0.55, 1.15) + n * 0.1, S0 + 10);
  run(-1.06, -0.85, -1.06, 0.85, (c, px, pz, n) => 1.36 + 0.62 * (1 - Math.abs(pz) / 0.95) + n * 0.03, S0 + 20);
  run(1.06, -0.85, 1.06, 0.85, (c, px, pz, n) => 0.92 - 0.55 * (c / 1.7) + n * 0.22, S0 + 30);
  run(-1.15, 0.95, 1.15, 0.95, (c, px, pz, n) => (px < 0.42 ? 1.36 + n * 0.05 : 1.08 - 0.62 * (px - 0.42) / 0.73 + n * 0.16), S0 + 40, [[0.74, 1.56, 0, 1.24], [0.2, 0.56, 0.5, 0.86]]);
  /* timber: the door frame and the window */
  [-1, 1].forEach((s) => prBox(L, 0.085, 1.12, 0.24, s * 0.365, 0.56, 0.95, timber, S0 + 50 + s, { sh: [0, 1.2] }));
  prBox(L, 0.98, 0.13, 0.27, 0, 1.165, 0.95, timber, S0 + 53, { j: 0.008 });
  prBox(L, 0.44, 0.04, 0.27, -0.77, 0.49, 0.95, timber, S0 + 54); prBox(L, 0.42, 0.04, 0.24, -0.77, 0.875, 0.95, timber, S0 + 55);
  prBox(L, 0.025, 0.36, 0.025, -0.77, 0.68, 0.95, timber, S0 + 56);
  [0, 1, 2].forEach((k) => prBox(L, 0.075, 0.36, 0.022, -0.5 + k * 0.082, 0.6 - k * 0.012, 1.075, ['#6f9a94', '#62897f', '#7aa39b'][k], S0 + 57 + k, { rz: 0.16 }));
  /* the roof: ridge along x, whole at the left end, fallen in towards the right */
  const yE = 1.25, rise = 0.75, half = 1.15, sl = Math.hypot(half, rise), a = Math.atan2(rise, half), nr = 7, sw = 0.25, cols = ['#8a6a4a', '#7d6046', '#96744f', '#6e5a44', '#84704a'];
  [-1, 1].forEach((s) => { const edge = s < 0 ? 0.3 : -0.4, x0 = -1.3;
    let q = new T.BoxGeometry(edge - 0.12 - x0 - 0.06, 0.03, sl - 0.06); q.rotateX(s * a); q.translate((edge - 0.12 + x0 + 0.06) / 2, yE + rise / 2 - 0.005, s * half / 2); L.push(fac(q, prCol('#4a3626'), S0 + 60));
    (s < 0 ? [-0.95, -0.45, 0.05, 0.55] : [-0.95, -0.45, 0.05]).forEach((x, k) => { q = new T.BoxGeometry(0.07, 0.08, sl - 0.1); q.rotateX(s * a); q.translate(x, yE + rise / 2 - 0.06, s * half / 2); L.push(fac(q, (cx, cy) => shadeY(timber, cy, 0.8, 2.2, k + s, 0.4), S0 + 62 + k)); });
    for (let r = 0; r < nr; r++) { const u = (r + 0.5) / nr, odd = r % 2, er = edge + (hash(r, S0 + s) - 0.5) * 0.5 + (s > 0 ? u * 0.25 : 0);
      for (let k = 0; k < 9; k++) { const c = x0 + sw * (k + 0.5) - odd * sw / 2, sd = S0 + 70 + r * 31 + k * 7 + (s > 0 ? 500 : 0); if (c > er || (c > er - 0.55 && hash(sd, 8) > 0.82)) continue;
        const loose = c > er - 0.3 ? (hash(sd, 4) - 0.3) * 0.35 : 0, col = tone(cols[Math.floor(hash(sd, 5) * cols.length)], sd, 0.6).multiplyScalar(0.84 + 0.22 * u);
        q = new T.BoxGeometry(sw - 0.014, 0.036, sl / nr * 1.32); q.rotateZ(loose); q.rotateX(s * (a + 0.07)); q.translate(c, yE + rise * u + 0.045 + hash(sd, 2) * 0.014, s * half * (1 - u));
        L.push(fac(q, () => (hash(sd, 11) > 0.86 ? col.clone().lerp(new T.Color('#6f9a4a'), 0.5) : col), sd)); } } });
  prBox(L, 1.95, 0.09, 0.09, -0.32, yE + rise + 0.03, 0, timber, S0 + 66, { rz: -0.035 });
  prBox(L, 0.07, 0.07, 1.35, 0.6, 0.36, 0.1, timber, S0 + 67, { rx: 0.5, ry: 0.5 });
  [[0.75, 0.3], [0.4, -0.35], [1.45, 0.75]].forEach(([x, z], k) => prBox(L, 0.22, 0.03, 0.24, x, 0.06, z, cols[k], S0 + 68 + k, { ry: k * 0.9, rz: 0.12 }));
  /* the chimney at the back, a stone knocked loose on top */
  kitStone(L, 0.4, 2.1, 0.32, -0.55, 0, -1.07, S0 + 100, { ch: 0.17, bl: 0.2, th: 0.08, cols: ['#a99f8c', '#9a917f', '#b5ab98'] });
  prBox(L, 0.2, 0.13, 0.18, -0.62, 2.17, -1.07, stone[1], S0 + 190, { rz: 0.22, ry: 0.4, j: 0.012 });
  /* rubble where the right wall came down, and a few stones inside */
  for (let k = 0; k < 13; k++) { const ins = k > 8, w = 0.16 + hash(k, S0 + 2) * 0.14, x = ins ? 0.35 + hash(k, 3) * 0.55 : 1.22 + hash(k, 3) * 0.5, z = ins ? -0.5 + hash(k, 4) * 1.0 : -0.3 + hash(k, 4) * 1.5;
    prBox(L, w, 0.13, w * 0.8, x, 0.065 + (k % 4 === 0 ? 0.11 : 0), z, stone[k % 5], S0 + 200 + k, { j: 0.02, ry: hash(k, 7) * 3, rz: (hash(k, 8) - 0.5) * 0.4 }); }
  /* ivy: leaves climbing the front wall, over the broken corner and down the inside of the back wall */
  const leaf = (x, y, z, k, flat) => { const q = new T.OctahedronGeometry(0.06 + hash(k, 2) * 0.035); if (flat) q.scale(0.4, 1, 1); else q.scale(1, 1, 0.4); q.rotateX(hash(k, 3) * 3); q.translate(x, y, z); L.push(fac(q, prCol(moss[k % 3]), S0 + 300 + k)); };
  for (let k = 0; k < 16; k++) leaf(-1.08 + Math.sin(k * 1.3) * 0.09 + k * 0.012, 0.08 + k * 0.085, 1.075, k, 0);
  for (let k = 0; k < 12; k++) leaf(0.55 + k * 0.045 + Math.sin(k * 1.7) * 0.07, 0.95 - k * 0.07 + Math.sin(k) * 0.04, -0.83, 20 + k, 0);
  for (let k = 0; k < 12; k++) leaf(1.18, 0.75 - Math.abs(k - 5) * 0.085 + Math.sin(k * 2.1) * 0.05, -0.75 + k * 0.1, 40 + k, 1);
  /* the door leaf: old blue-green boards, hinged on the right post */
  const door = new T.Group(), D = []; door.position.set(0.31, 0.03, 0.9); g.add(door);
  for (let k = 0; k < 4; k++) prBox(D, 0.147, 1.04, 0.035, -0.0775 - k * 0.155, 0.52, 0, ['#6f9a94', '#62897f', '#7aa39b', '#5d8279'][k], S0 + 400 + k, { sh: [0, 1.1] });
  [0.2, 0.82].forEach((y, k) => prBox(D, 0.6, 0.075, 0.02, -0.31, y, 0.026, '#4f7068', S0 + 410 + k));
  prBox(D, 0.035, 0.1, 0.03, -0.53, 0.52, 0.03, '#3a3f48', S0 + 412, { t: 0.1 });
  merged(D, MAT, door); return door;
}

/* ----- the first two tents: cloth panels that sag between the poles (one sewn strip per stripe), crossed poles at each
   end with the ridge pole lying in them, rolled-back door flaps with ties, a door mat, a patch on the small one. ----- */
function propTent(t, r, sy, len, big) {
  const L = [], hw = r * 0.866, top = r * sy * 1.5, zf = len / 2, nb = big ? 6 : 4, cA = '#ee7a5a', cB = '#f6cf62', nl = Math.hypot(top, hw), nx = top / nl, ny = hw / nl;
  const sideP = (s, z, b, off) => { const w = Math.sin(Math.PI * (z + zf) / len), sag = -0.075 * Math.sin(Math.PI * b) * w + (off || 0), fl = b < 0.12 ? 0.05 * (1 - b / 0.12) * (0.3 + 0.7 * w) : 0; return [s * (hw * (1 - b) + nx * sag + fl), top * b + ny * sag, z]; };
  [-1, 1].forEach((s) => { for (let k = 0; k < nb; k++) { const z0 = -zf + k * len / nb, c = tone(k % 2 ? cB : cA, 1320 + k, 0.25);
    prGrid(L, (a, b) => sideP(s, z0 + a * len / nb, b), 2, 7, [s * nx, ny, 0], (cx, cy) => c.clone().multiplyScalar((cy < top * 0.1 ? 0.8 : 0.88) + 0.18 * cy / top), 1320 + k * 2 + s); }
    /* the crossed poles at each end */
    [-1, 1].forEach((e) => { const Lp = nl * 1.2, dx = -s * hw / nl, dy = top / nl, q = new T.CylinderGeometry(0.026, 0.034, Lp, 6); q.rotateZ(Math.atan2(-dx, dy)); q.translate(s * (hw + 0.045) + dx * Lp / 2, dy * Lp / 2, e * (zf + 0.035) + s * e * 0.028); L.push(fac(q, (cx, cy) => shadeY('#8a5f3c', cy, -0.2, top + 0.6, s + e, 0.4), 1340 + s * 2 + e)); });
    /* the front, either side of the door, and the rolled-back flap */
    const dw = hw * 0.44, dh = top * 0.74;
    prGrid(L, (a, b) => [s * (hw * (1 - b) * (1 - a) + dw * (1 - b) * a), (top * (1 - a) + dh * a) * b, zf], 2, 4, [0, 0, 1], (cx, cy) => tone(cB, 3 + s, 0.2).multiplyScalar(0.84 + 0.2 * cy / top), 1350 + s);
    const el = Math.hypot(dw, dh), ex = -s * dw / el, ey = dh / el, th = Math.atan2(-ex, ey); let q = new T.CylinderGeometry(0.034, 0.06, el * 0.78, 9); q.rotateZ(th); q.translate(s * dw + ex * el * 0.43 + s * 0.05, ey * el * 0.43, zf + 0.055);
    L.push(fac(q, (cx, cy, cz, i) => shadeY('#fff2c2', cy, -0.3, top, i % 3, 0.25), 1354 + s));
    prBox(L, 0.17, 0.04, 0.17, s * dw + ex * el * 0.43 + s * 0.05, ey * el * 0.43, zf + 0.055, '#8a5f3c', 1356 + s, { rz: th });
  });
  /* the back, the dark doorway, the ridge pole and its lashings, the mat */
  prGrid(L, (a, b) => [(-hw + 2 * hw * a) * (1 - b), top * b, -zf], 4, 4, [0, 0, -1], (cx, cy) => tone(Math.floor((cx + hw) / (hw / 2)) % 2 ? cB : cA, 7, 0.2).multiplyScalar(0.8 + 0.2 * cy / top), 1360);
  prGrid(L, (a, b) => [(-hw + 2 * hw * a) * 0.5 * (1 - b), top * 0.78 * b, zf - 0.03], 2, 2, [0, 0, 1], prCol('#33241b'), 1361);
  let q = new T.CylinderGeometry(0.03, 0.03, len + 0.4, 7); q.rotateX(Math.PI / 2); q.translate(0, top + 0.055, 0); L.push(fac(q, (cx, cy, cz, i) => tone('#7a5232', i % 2, 0.3), 1362));
  [-1, 1].forEach((e) => prBox(L, 0.1, 0.1, 0.11, 0, top + 0.035, e * (zf + 0.035), '#fff2c2', 1363 + e, { t: 0.15, j: 0.008 }));
  prBox(L, hw * 0.8, 0.022, 0.34, 0, 0.012, zf + 0.2, '#74a857', 1366, { t: 0.2 }); prBox(L, hw * 0.8 + 0.01, 0.024, 0.06, 0, 0.012, zf + 0.2, '#fff2c2', 1367, { t: 0.1 });
  if (!big) { prGrid(L, (a, b) => sideP(1, -0.12 + a * 0.26, 0.42 + b * 0.17, 0.012), 2, 2, [nx, ny, 0], prCol('#7fb4d6'), 1368);
    prGrid(L, (a, b) => sideP(-1, 0.2 + a * 0.2, 0.25 + b * 0.14, 0.012), 2, 2, [-nx, ny, 0], prCol('#fff2c2'), 1369); }
  merged(L, MAT, t);
}

/* ---------- nature and camp things rebuilt (Leon, 2026-11-25): trees with roots, branches and leaf clusters, an old oak
   for the second tier, pines with drooping boughs (snow on the winter ones), chiselled rocks and boulders with moss and
   grass at the foot, the log and stone Pip carries, the campfire and the doghouse. ---------- */
function prJoin(list) { /* painted pieces into one geometry */
  let n = 0; list.forEach((g) => { n += g.attributes.position.count; }); const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3); let o = 0;
  list.forEach((g) => { P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); C.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; });
  const q = new T.BufferGeometry(); q.setAttribute('position', new T.BufferAttribute(P, 3)); q.setAttribute('normal', new T.BufferAttribute(N, 3)); q.setAttribute('color', new T.BufferAttribute(C, 3)); q.computeBoundingSphere(); return q;
}
/* a ball cut by flat planes: a chiselled stone */
function prChisel(r, seed, sx, sy, sz, cuts, det) {
  const g = new T.IcosahedronGeometry(r, det == null ? 2 : det), p = g.attributes.position;
  for (let k = 0; k < (cuts || 9); k++) { const a = hash(seed, k) * 6.283, e = (hash(seed, k + 20) - 0.25) * 1.5, nx = Math.cos(a) * Math.cos(e), ny = Math.sin(e), nz = Math.sin(a) * Math.cos(e), d = r * (0.6 + hash(seed, k + 40) * 0.28);
    for (let i = 0; i < p.count; i++) { const t = p.getX(i) * nx + p.getY(i) * ny + p.getZ(i) * nz - d; if (t > 0) p.setXYZ(i, p.getX(i) - nx * t, p.getY(i) - ny * t, p.getZ(i) - nz * t); } }
  g.scale(sx || 1, sy || 1, sz || 1); return g;
}
/* hard facets, lit from above: tops lighter, undersides darker; moss on flat tops above mossY */
function prFacet(g, moss, mossY, seed) {
  g.computeVertexNormals(); const n = g.attributes.normal, c = g.attributes.color, p = g.attributes.position, mc = moss ? new T.Color(moss) : null;
  for (let i = 0; i < n.count; i += 3) { const ny = n.getY(i), k = 0.8 + 0.3 * Math.max(0, ny) - 0.15 * Math.max(0, -ny), y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, ms = mc && ny > 0.7 && y > mossY && hash(Math.round(p.getX(i) * 4), Math.round(p.getZ(i) * 4), seed) > 0.42;
    for (let j = i; j < i + 3; j++) { if (ms) { const t = tone(moss, i + seed, 0.4); c.setXYZ(j, t.r, t.g, t.b); } else c.setXYZ(j, c.getX(j) * k, c.getY(j) * k, c.getZ(j) * k); } }
  return g;
}
function prStones(lumps, seed, top, cols, moss, tufts) {
  const L = lumps.map(([r, x, y, z, sx, sy, sz, det], k) => { const g = prChisel(r, seed + k * 7, sx, sy, sz, det === 0 ? 5 : 9, det); g.rotateY(hash(seed, k) * 6.28); g.translate(x, y, z);
    return prFacet(fac(g, (cx, cy, cz, i) => { const c = shadeY(cols[(k + (hash(i, seed) > 0.8 ? 1 : 0)) % cols.length], cy, -0.05, top, i, 0.3); if (cy < 0.09) c.multiplyScalar(0.82); return c; }, seed + k), moss, top * 0.55, seed); });
  (tufts || []).forEach(([x, z], k) => { for (let j = 0; j < 3; j++) { const h = 0.16 + hash(k, j + seed) * 0.14, q = new T.ConeGeometry(0.035, h, 3); q.translate(0, h / 2, 0); q.rotateZ((j - 1) * 0.35); q.rotateY(hash(k, seed) * 6); q.translate(x + (j - 1) * 0.04, 0, z); L.push(fac(q, (cx, cy) => leafY('#7fae52', cy, 0, 0.3, k + j, 0.4), seed + 90 + k)); } });
  return prJoin(L);
}
function propRockGeo(v) {
  const s = 1200 + v * 31, a = v * 2.1, c = Math.cos(a), n = Math.sin(a);
  return prStones([[0.5, 0, 0.24, 0, 1.12, 0.74 + v * 0.06, 0.94, 2], [0.3, 0.42 * c, 0.15, 0.42 * n, 1, 0.8, 1, 1], [0.23, -0.4 * c + 0.1, 0.11, -0.36 * n + 0.2, 1.1, 0.75, 1, 1],
    [0.1, 0.55 * n, 0.04, 0.52 * c, 1.2, 0.7, 1, 0], [0.08, -0.6 * n, 0.03, -0.3 * c, 1.2, 0.7, 1, 0], [0.07, 0.2, 0.03, 0.66, 1.1, 0.7, 1, 0]], s, 0.68, ['#aab3bc', '#98a2ac', '#b9c1c9'], v === 2 ? '#7f9e5a' : null, [[0.58 * c, 0.5 * n + 0.2], [-0.5, 0.42], [0.1, -0.6]]);
}
function propBoulderGeo(v) {
  const s = 1420 + v * 37, f = v ? -1 : 1;
  return prStones([[0.85, 0, 0.46, 0, 1.08, 0.86, 0.95, 2], [0.55, 0.64 * f, 0.3, 0.2, 1, 0.85, 1, 2], [0.47, -0.6 * f, 0.26, -0.12, 1, 0.86, 1.05, 1], [0.36, 0.08, 0.98, 0.1 * f, 1.25, 0.5, 1.05, 1], [0.32, 0.1 * f, 0.18, 0.74, 1.2, 0.75, 1, 1],
    [0.14, 0.98 * f, 0.06, 0.62, 1.2, 0.7, 1, 0], [0.12, -0.98 * f, 0.05, 0.5, 1.2, 0.7, 1, 0], [0.1, 0.4, 0.04, -0.95, 1.2, 0.7, 1, 0]], s, 1.25, ['#959ea7', '#858f99', '#a3abb3'], '#7f9e5a', [[1.05 * f, 0.1], [-0.95 * f, 0.6], [0.3, 1.0], [-0.3, -0.95], [0.75, -0.6]]);
}
/* a trunk: wider at the foot with root toes, a slight lean */
function prTrunk(h, r0, r1, flare, seed, lean) {
  const q = new T.CylinderGeometry(1, 1, 1, 9, 5, true), p = q.attributes.position, ph = hash(seed, 5) * 6;
  for (let i = 0; i < p.count; i++) { const b = p.getY(i) + 0.5, th = Math.atan2(p.getZ(i), p.getX(i)), r = r1 + (r0 - r1) * Math.pow(1 - b, 1.6) + flare * Math.pow(1 - b, 4) * (0.45 + 0.55 * Math.max(0, Math.cos(4 * th + ph)));
    p.setXYZ(i, Math.cos(th) * r + (lean || 0) * b * b * Math.cos(ph), b * h, Math.sin(th) * r + (lean || 0) * b * b * Math.sin(ph)); }
  return fac(q, (cx, cy, cz, i) => shadeY(hash(Math.round(Math.atan2(cz, cx) * 2.2), seed) > 0.5 ? '#7a5232' : '#8f6340', cy, -0.1, h * 1.2, Math.round(Math.atan2(cz, cx) * 2.2), 0.35), seed);
}
function propStumpGeo() {
  const L = [prTrunk(0.24, 0.2, 0.165, 0.1, 1201)];
  [[0, 0.05, '#c79a62'], [0.05, 0.11, '#e7c48f'], [0.11, 0.165, '#d6b07a']].forEach(([a, b, c], k) => { const q = a ? new T.RingGeometry(a, b, 10) : new T.CircleGeometry(b, 10); q.rotateX(-Math.PI / 2); q.translate(0, 0.241, 0); L.push(fac(q, prCol(c), 1202 + k)); });
  return prJoin(L);
}
function propTree(kind, s, tier) {
  const g = new T.Group(), W = [], C = [], up = new T.Vector3(0, 1, 0), dv = new T.Vector3(), qt = new T.Quaternion(), mt = new T.Matrix4();
  let base, y0, y1, pine = 0;
  if (kind === 'pine') {
    pine = 1; const n = tier >= 2 ? 6 : 5, th = 0.5; W.push(prTrunk(th + 0.1, 0.11, 0.06, 0.05, s, 0.02));
    for (let i = 0; i < n; i++) { const R = 0.62 - i * (0.5 / n), yb = 0.36 + i * 0.3, h = 0.52, ph = hash(s, i) * 6, lob = (a) => 0.5 + 0.5 * Math.cos(7 * a * 6.2832 + ph);
      const fn = (r1, dy, r2) => (a, b0) => { const b = r1 + ((r2 || 1) - r1) * b0, t = a * 6.2832, l = lob(a), r = R * Math.pow(1 - b, 0.85) * (0.8 + 0.3 * l * (1 - b)); return [Math.cos(t) * r, yb + h * b - 0.13 * l * (1 - b) * (1 - b) + dy, Math.sin(t) * r]; };
      const q = prGrid([], fn(0, 0), 28, 3, [0, 1, 0], '#ffffff', s + i); C.push(q);
      if (tier >= 3 && !ISLAND.snowFx) prGrid(W, fn(0.04, 0.022, 0.5), 28, 1, [0, 1, 0], (cx, cy, cz, k) => tone('#f2f6f8', k, 0.2), s + 50 + i); }
    const q = new T.ConeGeometry(0.07, 0.3, 6); q.translate(0, 0.36 + (n - 1) * 0.3 + 0.52 + 0.08, 0); C.push(q);
    base = s % 2 ? PAL.pine : PAL.forest; y0 = 0.3; y1 = 0.36 + n * 0.3 + 0.4;
  } else {
    const oak = tier >= 2, h = oak ? 0.82 : 0.95, B = [], sq = oak ? 0.8 : 0.88, nr = oak ? 7 : 5, rr = oak ? 0.62 : 0.4, cy0 = oak ? 1.28 : 1.38;
    W.push(prTrunk(h, oak ? 0.2 : 0.12, oak ? 0.13 : 0.075, oak ? 0.16 : 0.09, s, oak ? 0.06 : 0.04));
    B.push([oak ? 0.52 : 0.46, 0, cy0, 0]);
    for (let k = 0; k < nr; k++) { const a = k / nr * 6.283 + hash(s, k) * 0.7, r = (oak ? 0.36 : 0.3) + hash(k, s) * 0.1; B.push([r, Math.cos(a) * rr, cy0 - 0.22 + hash(s, k + 9) * 0.32, Math.sin(a) * rr]); }
    B.push([oak ? 0.38 : 0.32, 0.1, cy0 + (oak ? 0.36 : 0.4), -0.06]); if (oak) B.push([0.34, -0.26, cy0 + 0.3, 0.2]); else B.push([0.22, Math.cos(s) * 0.34, 0.98, Math.sin(s) * 0.34]);
    B.forEach(([r, x, y, z], k) => { const q = ico(r, 1, s + k, r * 0.07); q.scale(1, sq, 1); q.translate(x, y, z); C.push(q); });
    /* limbs up into the leaves */
    for (let k = 0; k < 3; k++) { const b = B[1 + ((k * 2) % nr)], x0 = 0, yb = h * (0.62 + k * 0.1), len = Math.hypot(b[1], b[2] - yb, b[3]) * 0.9, q = new T.CylinderGeometry(oak ? 0.04 : 0.025, oak ? 0.075 : 0.045, len, 5); q.translate(0, len / 2, 0);
      dv.set(b[1], b[2] - yb, b[3]).normalize(); qt.setFromUnitVectors(up, dv); q.applyMatrix4(mt.makeRotationFromQuaternion(qt)); q.translate(x0, yb, 0); W.push(fac(q, (cx, cy) => shadeY('#7a5232', cy, 0, 1.6, k, 0.3), s + 20 + k)); }
    /* small leaf bumps break up the round outline */
    for (let k = 0; k < (oak ? 20 : 14); k++) { const b = B[k % B.length], a = hash(k, s) * 6.283, e = hash(k, s + 7) * 1.3 - 0.15, dx = Math.cos(a) * Math.cos(e), dy = Math.sin(e), dz = Math.sin(a) * Math.cos(e);
      const rr2 = b[0] * (0.3 + hash(k, 3) * 0.14), q = ico(rr2, 0, s + 60 + k, rr2 * 0.1); q.translate(b[1] + dx * b[0] * 0.8, b[2] + dy * b[0] * sq * 0.8, b[3] + dz * b[0] * 0.8); C.push(q); }
    if (oak) for (let k = 0; k < 7; k++) { const b = B[1 + (k % nr)], a = hash(k, s + 3) * 6.283, q = new T.IcosahedronGeometry(0.06, 0); q.translate(b[1] + Math.cos(a) * b[0] * 0.8, b[2] - b[0] * sq * 0.55, b[3] + Math.sin(a) * b[0] * 0.8); W.push(fac(q, (cx, cy, cz, i) => tone('#d6403a', i, 0.3), s + 40 + k)); }
    base = PAL.forest; y0 = 0.7; y1 = cy0 + 0.75;
  }
  part(prJoin(W), g);
  const m = part(fac(mergeGeos(C), (cx, cy, cz, i) => leafY(base, cy, y0, y1, i)), g); m.userData = { base, y0, y1 }; if (pine) m.userData.pine = 1; leafs.push(m);
  return g;
}
/* what Pip carries: a log with bark, cut ends and a twig stub; a chiselled stone */
function propLogGeo() {
  const L = []; let q = new T.CylinderGeometry(0.085, 0.085, 0.42, 10, 2, true); jit(q, 0.006, 1100); q.rotateZ(Math.PI / 2); L.push(fac(q, (cx, cy, cz) => tone(hash(Math.round(Math.atan2(cz, cy) * 1.6), 2) > 0.5 ? '#9a6a3e' : '#86592f', Math.round(Math.atan2(cz, cy) * 1.6), 0.4), 1100));
  [-1, 1].forEach((s) => [[0, 0.03, '#c79a62'], [0.03, 0.062, '#ecca96'], [0.062, 0.086, '#b98a58']].forEach(([a, b, c], k) => { q = a ? new T.RingGeometry(a, b, 10) : new T.CircleGeometry(b, 10); q.rotateY(s * Math.PI / 2); q.translate(s * 0.211, 0, 0); L.push(fac(q, prCol(c), 1102 + k)); }));
  q = new T.CylinderGeometry(0.018, 0.026, 0.07, 5); q.rotateZ(-0.5); q.translate(0.06, 0.1, 0.01); L.push(fac(q, prCol('#86592f'), 1106));
  return prJoin(L);
}
function propStoneGeo() { const g = prChisel(0.13, 1101, 1.2, 0.85, 1, 8, 1); return prFacet(fac(g, (cx, cy, cz, i) => shadeY(i % 5 === 0 ? '#98a2ac' : '#aab3bc', cy, -0.12, 0.12, i, 0.3), 1101)); }
/* the campfire: a ring of chiselled stones, ash, logs stood in a cone with charred tips, glowing embers */
function propFire(g) {
  const L = [];
  for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283 + hash(k, 2) * 0.2, r = 0.1 + hash(k, 1300) * 0.035, q = prChisel(r, 1300 + k, 1.25, 0.8, 1, 7, 1); q.rotateY(-a); q.translate(Math.cos(a) * 0.38, 0.05, Math.sin(a) * 0.38); L.push(prFacet(fac(q, (cx, cy, cz, i) => shadeY(k % 3 ? '#a9b2bb' : '#8f98a1', cy, -0.05, 0.16, i, 0.3), 1300 + k))); }
  let q = new T.CylinderGeometry(0.3, 0.33, 0.03, 12); q.translate(0, 0.015, 0); L.push(fac(q, (cx, cy, cz, i) => tone(Math.hypot(cx, cz) < 0.16 ? '#3a3531' : '#5a544d', i, 0.3), 1311));
  for (let k = 0; k < 5; k++) { const a = k / 5 * 6.283 + 0.3; q = new T.CylinderGeometry(0.034, 0.045, 0.44, 6); q.translate(0, 0.22, 0); q.rotateZ(0.62); q.rotateY(-a); q.translate(Math.cos(a) * 0.2, 0.02, Math.sin(a) * 0.2); L.push(fac(q, (cx, cy) => (cy > 0.24 ? tone('#2f2a26', k, 0.2) : shadeY('#86592f', cy, -0.1, 0.4, k, 0.4)), 1312 + k)); }
  merged(L, MAT, g);
  for (let k = 0; k < 5; k++) { const a = k * 1.9 + 0.5, e = new T.Mesh(new T.BoxGeometry(0.05, 0.03, 0.05), new T.MeshBasicMaterial({ color: k % 2 ? '#ff8a3c' : '#ffc45a' })); e.position.set(Math.cos(a) * 0.11, 0.04, Math.sin(a) * 0.11); e.rotation.y = a; g.add(e); }
}
/* what the bigger campfires add: split-log benches; then a tripod with a pot and a pile of firewood */
function propFireMore(L, lv) {
  let q; const rings = (x, y, z, ry, r, sd) => [[0, r * 0.45, '#d9b27c'], [r * 0.45, r, '#ecca96']].forEach(([a, b, c], k) => { const d = a ? new T.RingGeometry(a, b, 9) : new T.CircleGeometry(b, 9); d.rotateY(Math.PI / 2 + ry); d.translate(x, y, z); L.push(fac(d, prCol(c), sd + k)); });
  if (lv >= 2) [[1.0, 0.25, 0.3], [-0.2, 1.0, 1.75]].forEach(([x, z, r], k) => {
    q = new T.CylinderGeometry(0.14, 0.14, 0.9, 9); q.rotateZ(Math.PI / 2); q.scale(1, 0.8, 1); q.rotateY(r); q.translate(x, 0.24, z); L.push(fac(q, (cx, cy, cz, i) => tone(i % 3 ? '#86592f' : '#9a6a3e', i % 5, 0.4), 1330 + k));
    prBox(L, 0.86, 0.03, 0.2, x, 0.345, z, '#e2bf8a', 1326 + k, { ry: r, t: 0.2 });
    [-1, 1].forEach((s) => { q = new T.CylinderGeometry(0.075, 0.085, 0.16, 7); q.translate(x + Math.cos(r) * s * 0.3, 0.08, z - Math.sin(r) * s * 0.3); L.push(fac(q, (cx, cy, cz, i) => tone('#7a5232', i, 0.4), 1332 + k * 2 + s)); }); });
  if (lv >= 3) {
    [0, 2.1, 4.2].forEach((a, k) => { q = new T.CylinderGeometry(0.02, 0.028, 1.12, 5); q.translate(0, 0.56, 0); q.rotateX(-0.36); q.rotateY(a); q.translate(Math.sin(a) * 0.4, 0, Math.cos(a) * 0.4); L.push(fac(q, (cx, cy) => shadeY('#7a5232', cy, 0, 1.2, k, 0.3), 1335 + k)); });
    prBox(L, 0.07, 0.06, 0.07, 0, 1.03, 0, '#fff2c2', 1338, { t: 0.1 }); q = new T.CylinderGeometry(0.008, 0.008, 0.3, 4); q.translate(0, 0.86, 0); L.push(fac(q, prCol('#3a3f48'), 1339));
    q = new T.SphereGeometry(0.17, 12, 6, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.58); q.translate(0, 0.6, 0); L.push(fac(q, (cx, cy, cz, i) => shadeY('#4a5560', cy, 0.4, 0.7, i % 2, 0.2), 1340));
    q = new T.TorusGeometry(0.165, 0.02, 5, 12); q.rotateX(Math.PI / 2); q.translate(0, 0.645, 0); L.push(fac(q, prCol('#39424c'), 1341));
    q = new T.CircleGeometry(0.155, 12); q.rotateX(-Math.PI / 2); q.translate(0, 0.635, 0); L.push(fac(q, prCol('#e0a04a'), 1342));
    q = new T.TorusGeometry(0.15, 0.01, 4, 10, Math.PI); q.translate(0, 0.65, 0); L.push(fac(q, prCol('#39424c'), 1343));
    [[0, 0], [0.13, 0], [0.26, 0], [0.065, 0.11], [0.195, 0.11], [0.13, 0.22]].forEach(([dx, dy], k) => { q = new T.CylinderGeometry(0.06, 0.06, 0.4, 7); q.rotateX(Math.PI / 2); q.translate(-1.05 + dx, 0.06 + dy, -0.35); L.push(fac(q, (cx, cy, cz, i) => tone(k % 2 ? '#9a6a3e' : '#86592f', i % 3, 0.3), 1345 + k)); rings(-1.05 + dx, 0.06 + dy, -0.149, Math.PI / 2, 0.06, 1352 + k * 2); });
  }
}
/* the doghouse: red boards on a stone step, a shingle roof, an arched door with white trim, a bone over the door, a full bowl */
function propKennel(g) {
  const L = [], zf = 0.45;
  kitStone(L, 1.12, 0.1, 1.02, 0, 0, 0, 420, { ch: 0.1, bl: 0.26, th: 0.08 });
  kitPlanks(L, 1.0, 0.56, 0.9, 0.1, 430, { cols: ['#d9573f', '#cf4f39', '#e0634a', '#c94a34'] });
  kitRoof(L, 1.16, 1.3, 0.62, 0.5, 440, { ry: Math.PI / 2, gable: '#d9573f', cols: ['#6f7f8f', '#62717f', '#7c8c9b', '#596876'] });
  prBox(L, 0.36, 0.26, 0.02, 0, 0.23, zf + 0.03, prCol('#2a1f1a'), 450);
  let q = new T.CircleGeometry(0.18, 10, 0, Math.PI); q.translate(0, 0.36, zf + 0.041); L.push(fac(q, prCol('#2a1f1a'), 451));
  q = new T.TorusGeometry(0.2, 0.026, 5, 10, Math.PI); q.translate(0, 0.36, zf + 0.045); L.push(fac(q, prCol('#fbf3e4'), 452));
  [-1, 1].forEach((s) => prBox(L, 0.05, 0.27, 0.05, s * 0.2, 0.235, zf + 0.045, '#fbf3e4', 453 + s, { t: 0.1 }));
  prBox(L, 0.2, 0.045, 0.03, 0, 0.82, zf + 0.06, '#fbf3e4', 456, { t: 0.1 });
  [-1, 1].forEach((sx) => [-1, 1].forEach((sy) => { q = new T.IcosahedronGeometry(0.035, 1); q.translate(sx * 0.105, 0.82 + sy * 0.024, zf + 0.06); L.push(fac(q, prCol('#fbf3e4'), 457)); }));
  q = new T.CylinderGeometry(0.19, 0.15, 0.09, 12); q.translate(0.5, 0.045, 0.82); L.push(fac(q, (cx, cy, cz, i) => tone('#5aa7d6', i % 2, 0.2), 460));
  q = new T.CylinderGeometry(0.165, 0.165, 0.02, 12); q.translate(0.5, 0.086, 0.82); L.push(fac(q, (cx, cy, cz, i) => tone('#9a6a3e', i, 0.5), 461));
  prBox(L, 0.5, 0.02, 0.3, 0, 0.012, zf + 0.3, '#74a857', 462, { t: 0.2 });
  merged(L, MAT, g);
}
