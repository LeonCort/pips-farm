/* ---------- camp props in the farm's handmade style (Leon, 2026-11-25: bring the island's look up to the farm's) ----------
   Small things that make the camp feel lived in: a chopping block with split logs, two barrels and a crate, and a
   wheelbarrow of flowers. One merged mesh; Pip walks round them. */
const LOOK = { solid: [] };
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
}
function lookStep() {
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
