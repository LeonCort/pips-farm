/* ---------- camp props in the farm's handmade style (Leon, 2026-11-25: bring the island's look up to the farm's) ----------
   Small things that make the camp feel lived in: a chopping block with split logs, two barrels and a crate, and a
   wheelbarrow of flowers. One merged mesh; Pip walks round them. */
const LOOK = { solid: [], flames: [], feet: [] };
{
  const L = [], put = (g, col, seed, x, y, z, ry) => { if (ry) g.rotateY(ry); g.translate(x, y, z); L.push(fac(g, col, seed)); };
  const wood = (hex, y0, y1) => (cx, cy, cz, i) => shadeY(hex, cy, y0, y1, i, 0.4);
  /* the chopping block: a stump with rings, split logs stacked beside it */
  { const x = -1.9, z = 2.2;
    put(new T.CylinderGeometry(0.27, 0.31, 0.34, 12), wood('#8a5f3c', 0, 0.34), 2600, x, 0.17, z);
    put(new T.CylinderGeometry(0.235, 0.235, 0.012, 12), '#e7c48f', 2601, x, 0.345, z); put(new T.CylinderGeometry(0.11, 0.11, 0.014, 10), '#d3a66c', 2602, x + 0.02, 0.347, z);
    for (let k = 0; k < 6; k++) { const row = k < 3 ? 0 : 1, q = new T.CylinderGeometry(0.085, 0.085, 0.5, 8); q.rotateX(Math.PI / 2); put(q, wood(k % 2 ? '#a8774f' : '#96683f', -0.09, 0.09), 2610 + k, x + 0.5 + (k % 3) * 0.17 + row * 0.085, 0.085 + row * 0.15, z + 0.05, 0);
      const e = new T.CylinderGeometry(0.066, 0.066, 0.012, 8); e.rotateX(Math.PI / 2); put(e, '#e7c48f', 2620 + k, x + 0.5 + (k % 3) * 0.17 + row * 0.085, 0.085 + row * 0.15, z + 0.305, 0); if (k === 4) break; }
    LOOK.solid.push([x, z, 0.34], [x + 0.68, z + 0.05, 0.36]); }
  /* two barrels and a crate by the tent */
  { const x = TENT.x - 1.75, z = TENT.z - 0.4;
    [[0, 0, 0.26], [0.5, 0.18, 0.22]].forEach(([dx, dz, r], k) => { const pts = [[r * 0.82, 0], [r * 0.97, 0.12], [r, 0.3], [r * 0.97, 0.48], [r * 0.82, 0.6]].map(([a, b]) => new T.Vector2(a, b * (r / 0.26)));
      put(new T.LatheGeometry(pts, 14), (cx, cy, cz, i) => shadeY(Math.floor((Math.atan2(cz - z - dz, cx - x - dx) + 3.15) / 0.45) % 2 ? '#a8714d' : '#96623f', cy, 0, 0.6, i, 0.3), 2630 + k, x + dx, 0, z + dz);
      [0.13, 0.47].forEach((h, j) => put(new T.TorusGeometry(r * 0.955, 0.016, 5, 16).rotateX(Math.PI / 2), '#5a5f68', 2634 + k * 2 + j, x + dx, h * (r / 0.26), z + dz));
      put(new T.CylinderGeometry(r * 0.8, r * 0.8, 0.02, 14), '#b9824c', 2640 + k, x + dx, 0.595 * (r / 0.26), z + dz); });
    put(new T.BoxGeometry(0.42, 0.34, 0.4), wood('#b9824c', 0, 0.34), 2645, x + 0.12, 0.17, z + 0.56, 0.3);
    [-1, 1].forEach((s) => put(new T.BoxGeometry(0.44, 0.05, 0.42), '#8a5f3c', 2646 + s, x + 0.12, 0.17 + s * 0.13, z + 0.56, 0.3));
    [0, 1, 2].forEach((j) => put(ico(0.07, 1, 2650 + j), ['#d6406a', '#c3335c', '#e0556f'][j], 2650 + j, x + 0.06 + j * 0.07, 0.38, z + 0.52 + (j % 2) * 0.08));
    LOOK.solid.push([x, z, 0.33], [x + 0.5, z + 0.18, 0.3], [x + 0.12, z + 0.56, 0.32]); }
  /* a wheelbarrow of flowers */
  { const x = 4.4, z = -2.2, r = 0.9, g0 = L.length;
    const P = (g, col, seed, px, py, pz, rz) => { if (rz) g.rotateZ(rz); g.translate(px, py, pz); g.rotateY(r); g.translate(x, 0, z); L.push(fac(g, col, seed)); };
    P(new T.BoxGeometry(0.62, 0.24, 0.46), wood('#a8714d', 0.24, 0.48), 2660, 0, 0.36, 0); P(new T.BoxGeometry(0.56, 0.04, 0.4), '#6b4a3c', 2661, 0, 0.47, 0);
    P(new T.CylinderGeometry(0.14, 0.14, 0.06, 12).rotateX(Math.PI / 2), '#4a3a2e', 2662, 0.38, 0.14, 0);
    [-0.15, 0.15].forEach((dz, k) => { P(new T.BoxGeometry(0.62, 0.04, 0.04), '#8a5a3a', 2663 + k, -0.42, 0.42, dz, -0.25); P(new T.BoxGeometry(0.04, 0.24, 0.04), '#8a5a3a', 2665 + k, -0.18, 0.12, dz); });
    for (let j = 0; j < 9; j++) P(ico(0.06, 1, 2670 + j), ['#f6b8c8', '#fffbf4', '#e9684a', '#f2c14a'][j % 4], 2670 + j, (j % 3 - 1) * 0.16, 0.55 + hash(j, 3) * 0.05, (Math.floor(j / 3) - 1) * 0.12);
    P(fluff(0.14, 2699, 4).scale(1.6, 0.6, 1.2), '#6a9a4c', 2699, 0, 0.5, 0);
    LOOK.solid.push([x, z, 0.45]); }
  const m = merged(L.map((g) => (g.index ? g.toNonIndexed() : g)), MAT); m.castShadow = true; m.receiveShadow = true;
  LOOK.solid.forEach(([x, z, r]) => lookFoot(x, z, r));
  lookFoot(TENT.x, TENT.z, 1.15); lookFoot(KENNEL.x, KENNEL.z, 0.6); lookFoot(STORE.x, STORE.z, 0.75);
}
/* ---------- building kit (2026-11-25): walls of separate stones, plank boards and shingle rows, so buildings hold up
   at the highest graphics level instead of being flat boxes. Everything is plain geometry in the one merged mesh. ---------- */
function kitStone(L, w, h, d, x, y0, z, seed, o) { /* courses of stones round a dark core; o.hole = [x0, x1, y0, y1] leaves a gap in the front */
  o = o || {}; const n = Math.max(1, Math.round(h / (o.ch || 0.2))), hh = h / n, th = o.th || 0.1, cols = o.cols || ['#bdb3a0', '#a9a08d', '#c9c0ae', '#9f9684'];
  let q = new T.BoxGeometry(w - th * 1.3, h - 0.012, d - th * 1.3); q.translate(x, y0 + h / 2, z); L.push(fac(q, () => new T.Color(o.core || '#5f584d'), seed));
  for (let r = 0; r < n; r++) { const yl = hh * (r + 0.5), odd = (r % 2) && !(o.hole && yl < o.hole[3]);
    [[w, 0], [d - th * 2, 1]].forEach(([len, side]) => { const m = Math.max(1, Math.round(len / (o.bl || 0.32))), bw = len / m;
      for (let k = 0; k < m + (odd ? 1 : 0); k++) { let c = -len / 2 + bw * (k + 0.5) - (odd ? bw / 2 : 0), ww = bw; if (odd) { if (k === 0) { ww = bw / 2; c = -len / 2 + bw / 4; } else if (k === m) { ww = bw / 2; c = len / 2 - bw / 4; } }
        [-1, 1].forEach((s) => { if (!side && s > 0 && o.hole && c > o.hole[0] && c < o.hole[1] && yl > o.hole[2] && yl < o.hole[3]) return;
          const sd = seed + r * 97 + k * 13 + side * 7 + (s > 0 ? 3 : 0), out = hash(sd, 3) * 0.025, col = cols[Math.floor(hash(sd, 5) * cols.length)];
          const b = new T.BoxGeometry((side ? th + out : ww - 0.022), hh - 0.022, (side ? ww - 0.022 : th + out));
          b.translate(side ? x + s * (w / 2 - th / 2) : x + c, y0 + yl, side ? z + c : z + s * (d / 2 - th / 2));
          L.push(fac(b, (cx, cy) => shadeY(col, cy, y0 - 0.1, y0 + h + 0.9, sd, 0.55), sd)); }); } }); }
}
function kitPlanks(L, w, h, d, y0, seed, o) { /* walls of upright boards with corner posts and beams */
  o = o || {}; const cols = o.cols || ['#c99158', '#b9824c', '#d4a06a', '#b07a48'], th = 0.04;
  let q = new T.BoxGeometry(w - 0.03, h, d - 0.03); q.translate(0, y0 + h / 2, 0); L.push(fac(q, () => new T.Color('#5e4028'), seed));
  [[w, d / 2, 0], [d, w / 2, 1]].forEach(([len, off, side]) => { const m = Math.round(len / 0.17), bw = len / m;
    for (let k = 0; k < m; k++) [-1, 1].forEach((s) => { const sd = seed + k * 11 + side * 300 + (s > 0 ? 150 : 0), c = -len / 2 + bw * (k + 0.5), col = cols[Math.floor(hash(sd, 6) * cols.length)];
      const b = new T.BoxGeometry(side ? th : bw - 0.016, h, side ? bw - 0.016 : th); b.translate(side ? s * off : c, y0 + h / 2, side ? c : s * off);
      L.push(fac(b, (cx, cy) => shadeY(col, cy, y0 - 0.2, y0 + h * 1.5, sd, 0.5), sd)); }); });
  [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => { const sd = seed + 900 + sx * 2 + sz; q = new T.BoxGeometry(0.11, h + 0.02, 0.11); q.translate(sx * w / 2, y0 + h / 2, sz * d / 2); L.push(fac(q, (cx, cy) => shadeY('#8a5f3c', cy, y0 - 0.2, y0 + h * 1.4, sd, 0.4), sd)); }));
  [0.04, h - 0.04].forEach((y, j) => { [-1, 1].forEach((s) => { q = new T.BoxGeometry(w + 0.04, 0.07, 0.06); q.translate(0, y0 + y, s * (d / 2 + 0.015)); L.push(fac(q, () => tone('#8a5f3c', seed + j + s, 0.5), seed + 950 + j));
    q = new T.BoxGeometry(0.06, 0.07, d + 0.04); q.translate(s * (w / 2 + 0.015), y0 + y, 0); L.push(fac(q, () => tone('#8a5f3c', seed + j + s + 9, 0.5), seed + 960 + j)); }); });
}
function kitRoof(L, len, span, y0, rise, seed, o) { /* rows of overlapping shingles on a solid roof, ridge along x; o.one = one slope only (high side at -z); o.x, o.z, o.ry place it */
  o = o || {}; const G = [], cols = o.cols || ['#b5562f', '#a84c2a', '#c4673a', '#9c4527'], sides = o.one ? [1] : [-1, 1], half = o.one ? span : span / 2, zr = o.one ? -span / 2 : 0;
  const sl = Math.hypot(half, rise), a = Math.atan2(rise, half), n = Math.max(2, Math.round(sl / 0.2)), m = Math.max(2, Math.round(len / 0.25)), sw = len / m;
  sides.forEach((s) => { for (let r = 0; r < n; r++) { const u = (r + 0.5) / n, odd = r % 2;
    for (let k = 0; k < m + odd; k++) { let c = -len / 2 + sw * (k + 0.5) - odd * sw / 2, ww = sw; if (odd) { if (k === 0) { ww = sw / 2; c = -len / 2 + sw / 4; } else if (k === m) { ww = sw / 2; c = len / 2 - sw / 4; } }
      const sd = seed + r * 31 + k * 7 + (s > 0 ? 500 : 0), col = tone(cols[Math.floor(hash(sd, 5) * cols.length)], sd, 0.6).multiplyScalar(0.84 + 0.22 * u);
      const q = new T.BoxGeometry(ww - 0.014, 0.036, sl / n * 1.32); q.rotateX(s * (a + 0.07)); q.translate(c, y0 + rise * u + 0.04 + hash(sd, 2) * 0.012, zr + s * half * (1 - u));
      G.push(fac(q, () => col, sd)); } } });
  const sh = new T.Shape(); if (o.one) { sh.moveTo(-span / 2, y0); sh.lineTo(span / 2, y0); sh.lineTo(-span / 2, y0 + rise); } else { sh.moveTo(-half, y0); sh.lineTo(half, y0); sh.lineTo(0, y0 + rise); } sh.closePath();
  const D = len - 0.16, core = new T.ExtrudeGeometry(sh, { depth: D, bevelEnabled: false }); core.rotateY(-Math.PI / 2); core.translate(D / 2, -0.02, 0); /* shape x is now z */
  G.push(fac(core, (cx, cy, cz) => Math.abs(cx) > D / 2 - 0.01 ? shadeY(Math.floor((cz + 9) / 0.17) % 2 ? (o.gable || '#c99158') : '#b9824c', cy, y0 - 0.6, y0 + rise + 0.4, Math.floor((cz + 9) / 0.17), 0.4) : new T.Color('#4a3020'), seed + 990));
  if (!o.one) { const q = new T.BoxGeometry(len + 0.05, 0.06, 0.12); q.translate(0, y0 + rise + 0.06, 0); G.push(fac(q, () => new T.Color('#8a3d22'), seed + 991)); }
  G.forEach((g) => { if (o.ry) g.rotateY(o.ry); g.translate(o.x || 0, 0, o.z || 0); L.push(g); });
}
/* a small living flame: three nested cones that flicker (lookStep) */
function kitFlame(parent, x, y, z, s) {
  const g = new T.Group(); g.position.set(x, y, z);
  [['#ff7a2a', 0.11, 0.34, 0], ['#ffb23c', 0.075, 0.26, 0.01], ['#ffe9a0', 0.04, 0.16, 0.02]].forEach(([c, r, h, dz]) => { const q = new T.ConeGeometry(r * s, h * s, 7); q.translate(0, h * s / 2, dz); g.add(new T.Mesh(q, new T.MeshBasicMaterial({ color: c }))); });
  parent.add(g); LOOK.flames.push(g); return g;
}
/* soft shade on the ground under things, and no tall grass through their floors */
function lookFoot(x, z, rx, rz, k) { LOOK.feet.push([x, z, rx, rz == null ? rx : rz, k]); }
function lookGround() {
  if (typeof GU === 'undefined' || !GU.detC) return;
  if (!LOOK.rings) { LOOK.rings = 1; [[TENT_RING.x, TENT_RING.z, 0.72], [STORE.x, STORE.z + 0.95, 0.85], [ANVIL_RING.x, ANVIL_RING.z, 0.68], [OVEN_RING.x, OVEN_RING.z, 0.68]].forEach(([x, z, r]) => lookFoot(x, z, r, r, 0)); } /* no tall grass through the mats and rings */
  nodes.forEach((n) => { if (n.shade || n.kind === 'shroom') return; n.shade = 1; const r = { tree: 0.95, rock: 0.6, boulder: 0.9, bush: 0.6, crystal: 0.6 }[n.kind]; if (r) LOOK.feet.push([n.x, n.z, r, r, 0.3, 1]); });
  if (!LOOK.feet.length) return;
  groundShade(LOOK.feet.filter((f) => f[4] !== 0).map(([x, z, rx, rz, k]) => [x, z, rx + 0.35, rz + 0.35, k == null ? 0.42 : k]));
  let grass = false; LOOK.feet.forEach(([x, z, rx, rz, k, soft]) => { if (!soft) { deco(x, z, Math.min(rx, rz)); grass = true; } });
  LOOK.feet.length = 0; if (grass && typeof grMask === 'function' && typeof GR !== 'undefined' && GR.tex) grMask();
}
function lookStep() {
  LOOK.t = (LOOK.t || 0) - 1; if (LOOK.t <= 0) { LOOK.t = 90; lookGround(); }
  if (!reduced) LOOK.flames.forEach((f, k) => { const a = 1 + Math.sin(time * 11 + k * 2) * 0.12 + Math.sin(time * 23 + k) * 0.08; f.scale.set(1 + Math.sin(time * 7 + k) * 0.08, a, 1); f.rotation.y = time * 2 + k; });
  if (enSleep) return; const p = pip.position;
  LOOK.solid.forEach(([x, z, r]) => { const dx = p.x - x, dz = p.z - z, d = Math.hypot(dx, dz), R = r + 0.22; if (d < R && d > 1e-4) { p.x = x + dx / d * R; p.z = z + dz / d * R; } });
}
/* the season dial, the toast and the settings sheet in the same parchment and wood as the counters */
{
  const WOOD = 'linear-gradient(165deg,#c4935f,#7a4c2a 50%,#a8723f) border-box', st = document.createElement('style');
  st.textContent = '.clock{border:5px solid transparent!important;background:linear-gradient(#fdf3dc,#f0dcb2) padding-box,' + WOOD + '!important;box-shadow:0 5px 0 rgba(70,40,18,.4),0 9px 14px rgba(70,40,18,.22),inset 0 -4px 8px rgba(160,110,50,.22)!important;color:#3a2414}'
    + '.toast{border:5px solid transparent!important;background:linear-gradient(#fdf3dc,#f0dcb2) padding-box,' + WOOD + '!important;box-shadow:0 6px 0 rgba(70,40,18,.4),0 12px 18px rgba(70,40,18,.25)!important;color:#3a2414}'
    + '.sheet{border:6px solid transparent!important;border-bottom:0!important;background:linear-gradient(#fdf3dc,#f3e2bf) padding-box,linear-gradient(165deg,#c4935f,#6e4426 55%,#a8723f) border-box!important}'
    + '.menuBtn{border:4px solid #fff3dc!important;box-shadow:0 0 0 3px #4a2e1a,0 6px 0 3px rgba(60,34,16,.4),0 10px 14px rgba(60,34,16,.22)!important}'
    + '.xpUp>div,.xpCard{border-color:#6e4426}';
  document.head.appendChild(st);
}
