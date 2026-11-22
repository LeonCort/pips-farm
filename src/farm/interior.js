/* ---------- the cozy house interior: plank floors, rugs, papered walls, and a purpose for every room ---------- */
/* study (speed), workshop (bag), kitchen (farm) and lounge (guests); more props appear as each upgrade levels up */
const INT = { extras: [], flames: [], lights: [[-4.6, 1.05, -3.75], [3.0, 1.1, -3.5], [3.6, 0.8, 0.95], [0, 1.4, 0.4]] };
{
  const X = (x) => HO.x + x, Z = (z) => HO.z + z;
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4; return t; };
  /* plank floor over the whole house */
  const plank = canvasTex(512, 512, (x, w, h) => { const B = ['#b87a4b', '#a96d42', '#c28655', '#b07446', '#9e653d']; for (let r = 0; r < 8; r++) { let px = -hash(r, 7) * 200; while (px < w) { const L = 140 + hash(r, px) * 220; x.fillStyle = B[Math.floor(hash(r * 3.1, px) * B.length)]; x.fillRect(px, r * 64, L, 64);
      x.fillStyle = 'rgba(255,230,190,0.08)'; x.fillRect(px, r * 64 + 6, L, 10); x.strokeStyle = 'rgba(60,35,20,0.55)'; x.lineWidth = 3; x.strokeRect(px, r * 64, L, 64);
      x.strokeStyle = 'rgba(80,45,25,0.18)'; x.lineWidth = 1.5; for (let k = 0; k < 4; k++) { const y = r * 64 + 12 + k * 12 + hash(px, k) * 6; x.beginPath(); x.moveTo(px + 4, y); x.bezierCurveTo(px + L * 0.3, y + 4, px + L * 0.6, y - 4, px + L - 4, y); x.stroke(); }
      if (hash(px, r) > 0.7) { x.fillStyle = 'rgba(70,40,20,0.4)'; x.beginPath(); x.ellipse(px + L * 0.5, r * 64 + 32, 7, 4, 0, 0, 6.283); x.fill(); } px += L; } } });
  plank.repeat.set(12 / 1.6, (11.5 + BED_D) / 1.6);
  const fl = new T.Mesh(new T.PlaneGeometry(12, 11.5 + BED_D), new T.MeshStandardMaterial({ map: plank, roughness: 0.85 })); fl.rotation.x = -Math.PI / 2; fl.position.set(X(0), 0.068, Z(-1.25 - BED_D / 2)); fl.receiveShadow = true; sc.add(fl);
  inG.children.forEach((m) => { if (m.isMesh && m.geometry.type === 'PlaneGeometry' && Math.abs(m.position.y - 0.065) < 0.002) m.visible = false; });
  /* the garden round the house goes dark and deep, so the warm rooms pop */
  const yard = inG.children[0]; if (yard && yard.geometry.attributes.color) repaintV(yard, (x, y, z, k) => tone('#24331f', k, 0.4).multiplyScalar(Math.max(0.35, 1 - Math.hypot(x / 14, (z + 1.25) / 12) * 0.6)));
  /* walls: cream wallpaper with little sprigs above a wooden wainscot */
  const paper = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#f3e3c4'; x.fillRect(0, 0, w, h); x.fillStyle = '#ead3ac'; for (let k = 0; k < 4; k++) x.fillRect(k * 32 + 12, 0, 8, h * 0.62);
    x.fillStyle = '#c98f74'; [[16, 20], [48, 44], [80, 20], [112, 44]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 3.5, 0, 6.283); x.fill(); });
    x.fillStyle = '#8a5a3a'; x.fillRect(0, h * 0.62, w, h * 0.38); x.fillStyle = '#6b4630'; x.fillRect(0, h * 0.62, w, 6); for (let k = 0; k < 4; k++) x.fillRect(k * 32, h * 0.62, 3, h * 0.38); });
  inG.children.forEach((m) => { if (!m.isMesh) return; m.geometry.computeBoundingBox(); const b = m.geometry.boundingBox, h = b.max.y - b.min.y; if (Math.abs(h - 0.7) > 0.03) return; const len = Math.max(b.max.x - b.min.x, b.max.z - b.min.z), t = paper.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(len / 0.9)), 1); m.material = new T.MeshStandardMaterial({ map: t, roughness: 0.95 }); });
  /* rugs */
  const rug = (cols, fr) => canvasTex(256, 128, (x, w, h) => { x.fillStyle = cols[0]; x.fillRect(8, 0, w - 16, h); for (let k = 0; k < 9; k++) { x.fillStyle = cols[1 + (k % (cols.length - 1))]; x.fillRect(8 + 6 + k * 27, 6, 14, h - 12); }
    x.strokeStyle = cols[1]; x.lineWidth = 5; x.strokeRect(12, 4, w - 24, h - 8); x.strokeStyle = fr || '#f3e3c4'; x.lineWidth = 2; for (let y = 4; y < h; y += 6) { x.beginPath(); x.moveTo(0, y); x.lineTo(8, y); x.moveTo(w - 8, y); x.lineTo(w, y); x.stroke(); } });
  const rugAt = (x, z, w, d, tex, ry) => { const m = new T.Mesh(new T.PlaneGeometry(w, d), new T.MeshStandardMaterial({ map: tex, roughness: 1 })); m.rotation.set(-Math.PI / 2, 0, ry || 0); m.position.set(X(x), 0.074, Z(z)); m.receiveShadow = true; sc.add(m); return m; };
  const RUGS = [rug(['#3f6b62', '#e6b45a', '#c45a3a', '#f3e3c4']), rug(['#7a3f3a', '#e6b45a', '#3f6b62', '#f3e3c4']), rug(['#c8734a', '#f3e3c4', '#5a7fb0', '#e6b45a']), rug(['#5a4a7a', '#f2c14a', '#e9684a', '#f3e3c4'])];
  rugAt(0, -0.2, 7.6, 1.1, RUGS[0], Math.PI / 2); rugAt(-3.5, -2.0, 2.6, 1.5, RUGS[1]); rugAt(-3.4, 2.6, 2.6, 1.5, RUGS[2]); rugAt(3.5, -1.6, 2.2, 1.3, RUGS[3]); rugAt(3.6, 2.0, 2.6, 1.6, RUGS[1]);
  rugAt(0, 4.05, 1.4, 0.5, RUGS[0]);

  const DK = '#6b4630', WD = '#9a6542', LW = '#b98552', IRON = '#3a3f48', ST = '#b8aa98';
  const L = [], P = (x, z, ry, list) => at(X(x), Z(z), ry || 0, list || L);
  const legs = (Q, w, d, h, c) => [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => Q(box(0.06, h, 0.06), c || DK, 1100, a * (w / 2 - 0.05), h / 2, b * (d / 2 - 0.05)));
  const table = (Q, w, d, h, c) => { Q(box(w, 0.06, d), c || WD, 1101, 0, h, 0); legs(Q, w, d, h - 0.03); };
  const chair = (x, z, ry, list) => { const Q = P(x, z, ry, list); Q(box(0.34, 0.05, 0.34), WD, 1102, 0, 0.32, 0); legs(Q, 0.34, 0.34, 0.31); Q(box(0.34, 0.34, 0.05), WD, 1103, 0, 0.52, -0.15); };
  const books = (Q, x0, y, z, w, seed, ry) => { let x = x0; const C = ['#c45a3a', '#3f6b62', '#e6b45a', '#5a7fb0', '#7a3f3a', '#f3e3c4']; while (x < x0 + w - 0.05) { const bw = 0.04 + hash(x, seed) * 0.04, bh = 0.14 + hash(seed, x) * 0.08; Q(box(bw, bh, 0.16), C[Math.floor(hash(x * 7, seed) * C.length)], seed, x + bw / 2, y + bh / 2, z, ry ? { rz: ry } : null); x += bw + 0.008; } };
  const candle = (Q, x, y, z, wx, wz) => { Q(new T.CylinderGeometry(0.03, 0.03, 0.12, 8), '#fff6e4', 1104, x, y + 0.06, z); Q(new T.CylinderGeometry(0.06, 0.07, 0.02, 10), '#c9a36c', 1105, x, y + 0.01, z);
    const f = new T.Sprite(glowMat.clone()); f.material.opacity = 0.9; f.scale.set(0.3, 0.3, 1); f.position.set(wx + x, y + 0.17, wz + z); sc.add(f); INT.flames.push({ s: f, b: 0.3, k: Math.random() * 6 }); };
  const barrel = (Q, x, z, s) => { s = s || 1; Q(new T.CylinderGeometry(0.22 * s, 0.22 * s, 0.55 * s, 12, 3), (cx, cy, cz, i) => tone(WD, i, 0.5).multiplyScalar(0.8 + 0.3 * clamp((cy + 0.28) / 0.55, 0, 1)), 1106, x, 0.275 * s, z); [0.12, 0.43].forEach((y) => Q(new T.TorusGeometry(0.222 * s, 0.018, 4, 14).rotateX(Math.PI / 2), IRON, 1107, x, y * s, z)); };
  const chest = (Q, x, z, ry) => { Q(box(0.7, 0.34, 0.44), LW, 1108, x, 0.17, z, { ry }); Q(new T.CylinderGeometry(0.22, 0.22, 0.7, 12, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).scale(1, 0.6, 1), WD, 1109, x, 0.34, z, { ry }); [-0.22, 0.22].forEach((a) => Q(box(0.05, 0.36, 0.46), '#c9a246', 1110, x + Math.cos(ry || 0) * a, 0.2, z - Math.sin(ry || 0) * a, { ry })); };
  const plant = (Q, x, z, s, seed) => { s = s || 1; Q(new T.CylinderGeometry(0.14 * s, 0.1 * s, 0.24 * s, 10), '#c8734a', seed, x, 0.12 * s, z); Q(fluff(0.17 * s, seed + 1, 5).scale(1, 1.3, 1), (cx, cy, cz, i) => leafY('#5d9160', cy, -0.15 * s, 0.2 * s, i), seed + 1, x, 0.38 * s, z); };

  /* the study (speed): an L-shaped desk with papers and candles, a chair, a bookshelf */
  { const Q = P(-4.6, -4.05); table(Q, 1.9, 0.6, 0.6); [[-0.6, 0.02, 0.4], [-0.2, -0.08, -0.3], [0.3, 0.05, 0.2], [0.55, -0.1, -0.5]].forEach(([x, z, r], k) => Q(box(0.22, 0.008, 0.28), '#fff6e4', 1111 + k, x, 0.636, z, { ry: r })); candle(Q, 0.8, 0.63, -0.15, X(-4.6), Z(-4.05)); candle(Q, -0.82, 0.63, -0.18, X(-4.6), Z(-4.05)); Q(new T.CylinderGeometry(0.05, 0.04, 0.12, 8), '#5a7fb0', 1115, 0.1, 0.69, -0.18); Q(box(0.012, 0.2, 0.012), '#fff6e4', 1116, 0.11, 0.78, -0.18, { rz: 0.3 }); }
  { const Q = P(-5.55, -3.2); table(Q, 0.6, 1.1, 0.6); books(Q, -0.2, 0.63, 0.25, 0.4, 1117); }
  chair(-4.5, -3.45, Math.PI);
  { const Q = P(-2.0, -4.2); Q(box(0.95, 1.15, 0.3), DK, 1118, 0, 0.575, 0); [0.08, 0.45, 0.82].forEach((y, k) => { Q(box(0.86, 0.035, 0.26), WD, 1119, 0, y, 0.02); books(Q, -0.4, y + 0.02, 0.04, 0.78 - k * 0.15, 1120 + k); }); }
  /* the workshop (bag): a workbench with a pegboard of tools, chests, barrels, crates */
  { const Q = P(-4.1, 0.5); table(Q, 1.6, 0.6, 0.62, LW); Q(box(1.6, 0.5, 0.05), '#c9a36c', 1130, 0, 0.98, -0.25); [-0.6, -0.3, 0, 0.3, 0.6].forEach((x) => Q(box(0.02, 0.02, 0.06), IRON, 1131, x, 1.1, -0.21));
    Q(box(0.05, 0.3, 0.03), WD, 1132, -0.6, 0.95, -0.2); Q(box(0.16, 0.07, 0.05), IRON, 1133, -0.6, 1.1, -0.2);
    Q(box(0.32, 0.14, 0.02), '#c9ced6', 1134, -0.25, 0.98, -0.2); Q(box(0.08, 0.1, 0.04), WD, 1135, -0.08, 1.0, -0.2);
    Q(box(0.04, 0.28, 0.03), '#8a8f98', 1136, 0.05, 0.96, -0.2); Q(new T.TorusGeometry(0.05, 0.015, 4, 10), '#8a8f98', 1137, 0.05, 1.12, -0.2);
    Q(box(0.04, 0.32, 0.03), WD, 1138, 0.35, 0.94, -0.2); Q(box(0.12, 0.08, 0.04), '#c45a3a', 1139, 0.35, 1.1, -0.2);
    Q(box(0.3, 0.06, 0.18), '#fff6e4', 1140, 0.4, 0.68, 0.05); Q(box(0.24, 0.1, 0.12), '#c45a3a', 1141, -0.45, 0.7, 0.08); }
  chest(P(0, 0), -5.45, 0.75, Math.PI / 2);
  { const Q = P(0, 0); barrel(Q, -5.55, 3.95); barrel(Q, -5.0, 4.15, 0.9); }
  { const Q = P(-3.3, 4.05); table(Q, 1.2, 0.5, 0.5, LW); Q(box(0.36, 0.1, 0.1), IRON, 1142, -0.2, 0.58, 0); Q(box(0.04, 0.2, 0.04), WD, 1143, 0.25, 0.6, 0.05, { rz: 1.2 }); Q(box(0.12, 0.08, 0.08), IRON, 1144, 0.34, 0.64, 0.05); }
  /* the kitchen (farm): an iron stove with a pot and a pipe, shelves of jars and plates, a counter, a little dining table */
  { const Q = P(3.0, -4.1); Q(box(0.8, 0.72, 0.56), IRON, 1150, 0, 0.36, 0); Q(box(0.84, 0.04, 0.6), '#555b66', 1151, 0, 0.74, 0); Q(box(0.42, 0.3, 0.02), '#2a2e35', 1152, 0, 0.32, 0.29); Q(box(0.3, 0.12, 0.02), '#e9884a', 1153, 0, 0.3, 0.3);
    Q(new T.CylinderGeometry(0.07, 0.07, 0.9, 8), IRON, 1154, 0.25, 1.2, -0.18); Q(new T.CylinderGeometry(0.15, 0.13, 0.16, 12), '#8a8f98', 1155, -0.15, 0.84, 0.05); Q(new T.CylinderGeometry(0.11, 0.11, 0.04, 12), '#555b66', 1156, 0.18, 0.78, 0.12); }
  { const Q = P(4.95, -4.2); Q(box(1.3, 1.1, 0.3), DK, 1157, 0, 0.55, 0); const JC = ['#e9684a', '#f2c14a', '#8fc0d4', '#74a857', '#f6b8c8'];
    [0.12, 0.5, 0.88].forEach((y, r) => { Q(box(1.22, 0.035, 0.26), WD, 1158, 0, y, 0.02); for (let k = 0; k < 6; k++) { if (r === 1) Q(new T.CylinderGeometry(0.075, 0.075, 0.02, 12).rotateX(Math.PI / 2), '#fff6e4', 1159, -0.5 + k * 0.2, y + 0.09, 0.06); else { Q(new T.CylinderGeometry(0.06, 0.06, 0.15, 8), JC[(k + r) % 5], 1160 + k, -0.5 + k * 0.2, y + 0.095, 0.04); Q(new T.CylinderGeometry(0.065, 0.065, 0.03, 8), '#c9a36c', 1166, -0.5 + k * 0.2, y + 0.18, 0.04); } } }); }
  { const Q = P(4.05, -4.15); Q(box(0.5, 0.6, 0.5), LW, 1170, 0, 0.3, 0); Q(box(0.54, 0.04, 0.54), '#e6dccb', 1171, 0, 0.62, 0); Q(ico(0.07, 1, 1172), '#e9684a', 1172, 0.1, 0.69, 0.05); Q(ico(0.06, 1, 1173), '#f2c14a', 1173, -0.08, 0.68, -0.05); }
  { const Q = P(4.7, -0.65); table(Q, 1.1, 0.6, 0.52); Q(new T.CylinderGeometry(0.09, 0.09, 0.015, 12), '#fff6e4', 1174, -0.3, 0.56, 0); Q(new T.CylinderGeometry(0.09, 0.09, 0.015, 12), '#fff6e4', 1175, 0.3, 0.56, 0); Q(box(0.5, 0.004, 0.2), '#c45a3a', 1176, 0, 0.555, 0); candle(Q, 0, 0.55, 0.05, X(4.7), Z(-0.65)); }
  chair(4.15, -0.65, Math.PI / 2); chair(5.25, -0.65, -Math.PI / 2);
  /* the lounge (guests): a stone fireplace with a fire, armchairs, books, a plant */
  { const Q = P(3.6, 0.32); Q(box(1.3, 0.85, 0.46), (cx, cy, cz, i) => tone(ST, i, 1.2).multiplyScalar(0.85 + 0.2 * hash(Math.round(cx * 8), Math.round(cy * 8))), 1180, 0, 0.425, 0); Q(box(1.45, 0.08, 0.54), '#8a8178', 1181, 0, 0.86, 0.02);
    Q(box(0.6, 0.45, 0.04), '#2a2420', 1182, 0, 0.3, 0.22); Q(box(0.5, 0.75, 0.36), ST, 1183, 0, 1.27, -0.04); Q(box(0.5, 0.06, 0.06), '#8a5a3a', 1184, 0, 0.1, 0.22);
    for (let k = 0; k < 3; k++) Q(new T.ConeGeometry(0.07 - k * 0.012, 0.22 + (k % 2) * 0.08, 6), k % 2 ? '#ffd27a' : '#e9884a', 1185 + k, -0.12 + k * 0.12, 0.24, 0.22);
    const f = new T.Sprite(glowMat.clone()); f.material.opacity = 0.9; f.scale.set(0.9, 0.9, 1); f.position.set(X(3.6), 0.35, Z(0.6)); sc.add(f); INT.flames.push({ s: f, b: 0.9, k: 1 });
    Q(new T.CylinderGeometry(0.05, 0.05, 0.4, 6).rotateZ(Math.PI / 2), WD, 1188, 0.85, 0.06, 0.25); Q(new T.CylinderGeometry(0.05, 0.05, 0.4, 6).rotateZ(Math.PI / 2), DK, 1189, 0.85, 0.15, 0.25); }
  const armchair = (x, z, ry, col, list) => { const Q = P(x, z, ry, list); Q(box(0.62, 0.28, 0.58), col, 1190, 0, 0.22, 0); Q(box(0.62, 0.48, 0.14), col, 1191, 0, 0.5, -0.24); [-1, 1].forEach((s) => Q(box(0.12, 0.38, 0.58), col, 1192, s * 0.31, 0.32, 0)); Q(box(0.46, 0.08, 0.42), '#f3e3c4', 1193, 0, 0.39, 0.04); };
  armchair(2.35, 1.0, Math.PI * 0.75, '#d9b27a');
  { const Q = P(5.6, 4.0); books(Q, -0.2, 0, 0, 0.42, 1194, 0); books(Q, -0.16, 0.22, 0, 0.3, 1195, 0); }
  plant(P(0, 0), 2.2, 4.1, 1.2, 1196);
  /* the hall and the bedroom strip: pots by the door, a little table with a candle, a dresser and a window */
  plant(P(0, 0), -0.7, 4.15, 1, 1197); plant(P(0, 0), 0.7, 4.15, 1, 1199);
  { const Q = P(-0.65, -3.9); table(Q, 0.4, 0.4, 0.55); candle(Q, 0, 0.58, 0, X(-0.65), Z(-3.9)); }
  { const Q = P(-5.3, -6.6 - BED_D); Q(box(0.9, 0.62, 0.4), LW, 1201, 0, 0.31, 0); [0.18, 0.42].forEach((y) => Q(box(0.82, 0.02, 0.02), DK, 1202, 0, y, 0.21)); plant(Q, 0.25, 0, 0.7, 1203); }
  /* warm glowing windows in the outer walls */
  const winMat = new T.MeshBasicMaterial({ color: '#ffd98a' });
  [[-6.09, -2.25, Math.PI / 2], [-6.09, 2.25, Math.PI / 2], [6.09, -2.25, -Math.PI / 2], [6.09, 2.25, -Math.PI / 2], [-1.6, -7.09 - BED_D, 0], [1.6, -7.09 - BED_D, 0]].forEach(([x, z, ry]) => {
    const Q = P(x, z, ry); Q(box(0.7, 0.44, 0.06), DK, 1205, 0, 0.42, 0); const w = new T.Mesh(new T.PlaneGeometry(0.56, 0.3), winMat); w.position.set(X(x) + Math.sin(ry) * 0.035, 0.42, Z(z) + Math.cos(ry) * 0.035); w.rotation.y = ry; sc.add(w);
    const g = new T.Sprite(glowMat); g.scale.set(1.2, 1.2, 1); g.position.copy(w.position); sc.add(g); });
  INT.staticMesh = merged(L);

  /* props that arrive with each upgrade level: two levels at a time */
  const extra = (id, lv, build) => { const E = []; build((x, z, ry) => at(X(x), Z(z), ry || 0, E), E); const m = merged(E); m.visible = false; INT.extras.push({ id, lv, m }); };
  extra('speed', 2, (A) => { const Q = A(-3.0, -4.35); Q(box(0.6, 0.42, 0.03), DK, 1210, 0, 0.5, 0); Q(box(0.52, 0.34, 0.02), '#e6d9b0', 1211, 0, 0.5, 0.02); Q(box(0.2, 0.12, 0.01), '#74a857', 1212, -0.1, 0.52, 0.035); Q(box(0.14, 0.1, 0.01), '#5a7fb0', 1213, 0.14, 0.46, 0.035); });
  extra('speed', 4, (A) => { const Q = A(-2.0, -4.2); Q(new T.CylinderGeometry(0.03, 0.06, 0.08, 8), '#c9a246', 1214, 0, 1.19, 0); Q(new T.SphereGeometry(0.12, 12, 8), '#5a9fc4', 1215, 0, 1.35, 0); });
  extra('speed', 6, (A) => { const Q = A(-5.6, -1.4); books(Q, -0.15, 0, 0, 0.32, 1216, 0); books(Q, -0.12, 0.2, 0, 0.26, 1217, 0); books(Q, -0.1, 0.4, 0, 0.2, 1218, 0); });
  extra('speed', 8, (A) => { const Q = A(-4.2, -4.05); Q(new T.CylinderGeometry(0.06, 0.03, 0.14, 10), '#e8b84a', 1219, 0, 0.72, 0); Q(new T.CylinderGeometry(0.05, 0.05, 0.03, 10), '#e8b84a', 1220, 0, 0.64, 0); });
  extra('bag', 2, (A) => { const Q = A(-5.55, 3.3); Q(new T.CylinderGeometry(0.22, 0.22, 0.55, 12, 3), WD, 1221, 0, 0.275, 0); [0.12, 0.43].forEach((y) => Q(new T.TorusGeometry(0.222, 0.018, 4, 14).rotateX(Math.PI / 2), IRON, 1222, 0, y, 0)); });
  extra('bag', 4, (A) => chest(A(0, 0), -5.45, 1.65, Math.PI / 2));
  extra('bag', 6, (A) => { const Q = A(-2.4, 4.1); [[0, 0], [0.32, 0.05], [0.16, 0.0]].forEach(([x, z], k) => Q(ico(0.17, 1, 1223 + k).scale(1, k === 2 ? 0.8 : 1.15, 0.9), '#d9c39a', 1223 + k, x, k === 2 ? 0.42 : 0.18, z)); });
  extra('bag', 8, (A) => { const Q = A(-4.1, 0.5); Q(box(0.3, 0.2, 0.2), '#e8b84a', 1226, 0.0, 0.75, 0.05); });
  extra('farm', 2, (A) => { const Q = A(4.7, -0.65); Q(new T.SphereGeometry(0.12, 10, 6, 0, 6.283, 0, 1.6), '#c9a36c', 1227, 0.3, 0.68, 0.0); [[0.27, 0.02], [0.34, -0.03], [0.3, 0.06]].forEach(([x, z], k) => Q(ico(0.05, 1, 1228 + k), ['#e9684a', '#f2c14a', '#74a857'][k], 1228 + k, x, 0.66, z)); });
  extra('farm', 4, (A) => { const Q = A(2.35, -4.35); [0, 0.2, 0.4].forEach((x, k) => Q(box(0.03, 0.26, 0.03), '#74a857', 1231 + k, x - 0.2, 0.55, 0, { rz: 0.15 * (k - 1) })); Q(box(0.6, 0.03, 0.03), DK, 1234, 0, 0.69, 0); });
  extra('farm', 6, (A) => { const Q = A(4.05, -4.15); Q(new T.CylinderGeometry(0.16, 0.12, 0.1, 12), '#c9a36c', 1235, 0, 0.69, 0); Q(ico(0.08, 1, 1236).scale(1.6, 0.8, 1), '#d9a35c', 1236, 0, 0.76, 0); });
  extra('farm', 8, (A) => { const Q = A(4.7, -0.65); Q(new T.CylinderGeometry(0.13, 0.13, 0.12, 14), '#fff6e4', 1237, -0.3, 0.64, 0); Q(new T.CylinderGeometry(0.135, 0.135, 0.03, 14), '#f6b8c8', 1238, -0.3, 0.71, 0); Q(ico(0.03, 0), '#e9684a', 1239, -0.3, 0.75, 0); });
  extra('guests', 2, (A) => { const Q = A(5.55, 0.8); Q(new T.CylinderGeometry(0.2, 0.2, 0.04, 12), WD, 1240, 0, 0.45, 0); Q(new T.CylinderGeometry(0.03, 0.03, 0.43, 6), DK, 1241, 0, 0.22, 0); Q(new T.CylinderGeometry(0.05, 0.04, 0.08, 8), '#fff6e4', 1242, 0.05, 0.51, 0); });
  extra('guests', 4, (A, E) => armchair(4.85, 0.95, -Math.PI * 0.75, '#9fb48a', E));
  extra('guests', 6, (A) => { const Q = A(5.78, 3.15, -Math.PI / 2); Q(box(0.85, 1.0, 0.3), DK, 1243, 0, 0.5, 0); [0.1, 0.45, 0.8].forEach((y, k) => { Q(box(0.78, 0.03, 0.26), WD, 1249, 0, y, 0.02); books(Q, -0.37, y + 0.015, 0.04, 0.72 - k * 0.12, 1244 + k); }); });
  extra('guests', 8, (A) => { const Q = A(3.0, 0.8); Q(ico(0.14, 1, 1247).scale(1.3, 0.7, 1), '#e6a650', 1247, 0, 0.1, 0); Q(ico(0.08, 1, 1248), '#e6a650', 1248, 0.16, 0.16, 0.05); });
}
function interiorStep(dt) {
  if (!inHouse) return;
  INT.extras.forEach((e) => { const on = typeof furnOn === 'function' ? furnOn(e) : (state.lv[e.id] || 0) >= e.lv; if (e.m.visible !== on) e.m.visible = on; });
  INT.flames.forEach((f) => { f.k += dt * (6 + Math.random() * 4); const q = 0.85 + 0.15 * Math.sin(f.k) * Math.sin(f.k * 1.7 + 1); f.s.scale.setScalar(f.b * q); f.s.material.opacity = 0.75 + 0.2 * q; });
}
