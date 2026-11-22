/* ---------- restyle: older buildings get the cozy house's details (plinths, corner beams, frames, flower boxes, props) ---------- */
{
  const L = [], DK = '#6b4630', WD = '#9a6542', ST = '#b8aa98', POT = '#c8734a';
  const flowers = (P, x, y, z, n, w, seed) => { for (let j = 0; j < n; j++) P(ico(0.045, 0, seed + j), ['#f6b8c8', '#e9684a', '#fffbf4', '#f2c14a'][(j + seed) % 4], seed + j, x - w / 2 + (j + 0.5) * w / n, y, z + (j % 2) * 0.03); };
  const pot = (P, x, z, seed, s) => { s = s || 1; P(new T.CylinderGeometry(0.15 * s, 0.11 * s, 0.24 * s, 10), POT, seed, x, 0.12 * s, z); P(fluff(0.15 * s, seed + 1, 5).scale(1, 1.2, 1), (cx, cy, cz, i) => leafY('#5d9160', cy, -0.12 * s, 0.18 * s, i), seed + 1, x, 0.36 * s, z); flowers(P, x, 0.52 * s, z - 0.04, 3, 0.18 * s, seed + 2); };
  const barrel = (P, x, z, seed) => { P(new T.CylinderGeometry(0.2, 0.2, 0.5, 12, 3).scale(1, 1, 1), (cx, cy, cz, i) => tone(WD, i, 0.5).multiplyScalar(0.8 + 0.25 * clamp((cy + 0.25) / 0.5, 0, 1)), seed, x, 0.25, z);
    [0.1, 0.4].forEach((y) => P(new T.TorusGeometry(0.205, 0.018, 4, 14).rotateX(Math.PI / 2), '#3a3f48', seed + 1, x, y, z)); };
  /* the barn: stone plinth, white corner trim, a ridge beam, a lantern over the doors, barrels and pots */
  { const P = at(BARN.x, BARN.z, 0, L);
    P(box(3.14, 0.14, 2.54), ST, 960, 0, 0.07, 0);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([x, z]) => P(box(0.12, 1.72, 0.12), PAL.paper, 961, x * 1.5, 0.86, z * 1.2));
    P(box(3.1, 0.1, 0.1), PAL.paper, 962, 0, 1.68, 1.22); P(box(0.16, 0.16, 2.9), DK, 963, 0, 2.76, 0);
    P(box(0.14, 0.2, 0.14), '#3a3f48', 964, 0, 1.42, 1.32); P(box(0.1, 0.14, 0.1), '#ffd27a', 965, 0, 1.42, 1.32);
    barrel(P, -1.85, 0.95, 966); barrel(P, -1.95, 0.4, 968); pot(P, 0.85, 1.6, 970); pot(P, -0.85, 1.6, 975); }
  /* the fish hut: plinth, corner beams, a flower box, a life ring and a crate of fish */
  { const P = at(HUT.x, HUT.z, -Math.PI / 2, L);
    P(box(1.6, 0.1, 1.3), ST, 980, 0, 0.05, 0);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([x, z]) => P(box(0.07, 1.0, 0.07), DK, 981, x * 0.75, 0.5, z * 0.6));
    P(box(0.38, 0.06, 0.12), WD, 982, 0.48, 0.47, 0.66); flowers(P, 0.48, 0.53, 0.66, 4, 0.32, 983);
    P(new T.TorusGeometry(0.15, 0.04, 6, 14), '#fff6e4', 987, -0.42, 0.62, 0.63); [0, 1, 2, 3].forEach((k) => P(box(0.05, 0.05, 0.05), PAL.accent, 988, -0.42 + Math.cos(k * 1.571) * 0.15, 0.62 + Math.sin(k * 1.571) * 0.15, 0.66));
    P(box(0.24, 0.42, 0.06), DK, 989, 0, 0.38, 0.64); }
  /* the dog kennel: a plinth, a name board with a paw and a ridge */
  { const P = at(KENNEL.x, KENNEL.z, 0, L);
    P(box(1.08, 0.06, 0.98), ST, 990, 0, 0.03, 0); P(box(0.07, 0.07, 1.1), DK, 991, 0, 1.0, 0);
    P(box(0.42, 0.14, 0.03), '#fff6e4', 992, 0, 0.55, 0.465); [[-0.1, 0], [0, 0.02], [0.1, 0]].forEach(([x, y], k) => P(ico(0.025, 0), '#6b4630', 993 + k, x, 0.55 + y, 0.485)); }
  /* the lighthouse: a balcony railing, framed windows and a door frame */
  { const P = at(LIGHT.x, LIGHT.z, 0, L);
    P(new T.TorusGeometry(0.74, 0.025, 4, 24).rotateX(Math.PI / 2), '#3a3f48', 1000, 0, 4.12, 0);
    for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; P(box(0.03, 0.24, 0.03), '#3a3f48', 1001, Math.cos(a) * 0.74, 4.0, Math.sin(a) * 0.74); }
    [1.6, 2.7].forEach((y, k) => { const a = k ? 2.2 : 0.9, r = 0.7 - y * 0.07; P(box(0.2, 0.26, 0.06), DK, 1002, Math.cos(a) * r, y, Math.sin(a) * r, { ry: Math.PI / 2 - a }); P(box(0.14, 0.2, 0.06), '#3d5a66', 1003, Math.cos(a) * (r + 0.01), y, Math.sin(a) * (r + 0.01), { ry: Math.PI / 2 - a }); });
    P(box(0.4, 0.6, 0.04), DK, 1004, 0, 0.62, 0.69); pot(P, 0.45, 0.95, 1005, 0.8); }
  /* the windmill: stone foot ring, a door and window frame, pots by the door */
  { const ry = faceTo(MILL.x, MILL.z, 0, 0), P = at(MILL.x, MILL.z, ry, L);
    P(box(0.54, 0.74, 0.05), DK, 1010, 0, 0.37, 0.925); P(box(0.38, 0.38, 0.05), DK, 1011, 0, 1.75, 0.74);
    pot(P, -0.55, 1.15, 1012, 0.9); pot(P, 0.55, 1.15, 1016, 0.9); }
  /* the grain silo: metal bands and a little ladder */
  { const s = SRC.grain, P = at(s.x, s.z, 0, L);
    [0.3, 0.75, 1.15].forEach((y, k) => P(new T.TorusGeometry(0.58 - y * 0.04, 0.025, 4, 20).rotateX(Math.PI / 2), '#8a8f98', 1020 + k, 0, y, 0));
    [-0.1, 0.1].forEach((x) => P(box(0.03, 1.25, 0.03), '#6b6f78', 1024, x, 0.63, -0.58)); for (let k = 0; k < 5; k++) P(box(0.22, 0.025, 0.025), '#6b6f78', 1025, 0, 0.2 + k * 0.24, -0.58); }
  if (L.length) merged(L);
}
