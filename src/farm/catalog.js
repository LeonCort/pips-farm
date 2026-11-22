/* ---------- the room catalog: pick a room in the store, buy pieces for its spots, pick piece and colour at home ----------
   Every room has fixed spots (a rug, a lamp, a seat; the bedroom has its bed). Each spot has four pieces, each piece four colours.
   Gates: the room must exist (house size), a piece needs the one before it in the same spot, and enough room stars
   (one star per piece or extra owned in that room). Colours open once the piece is owned. The old upgrade props are
   each room's "extras" column, bought one after the other. The yard tab sells decorations and house and roof paint. */
const CDK = '#6b4630', CWD = '#9a6542';
const starG = (r1, r2, d) => { const s = new T.Shape(); for (let k = 0; k < 10; k++) { const r = k % 2 ? r2 : r1, a = Math.PI / 2 + k * Math.PI / 5; if (k) s.lineTo(Math.cos(a) * r, Math.sin(a) * r); else s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } s.closePath(); return new T.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); };
const cy_ = (r0, r1, h, n) => new T.CylinderGeometry(r0, r1, h, n || 12);
const CFAM = {
  rug: { cols: ['#c45a3a', '#3f6b62', '#5a7fb0', '#e6b45a'], types: [
    (Q, c) => { Q(cy_(0.8, 0.8, 0.02, 28).scale(1.3, 1, 1), c, 1901, 0, 0.075, 0); Q(new T.TorusGeometry(0.68, 0.035, 4, 28).rotateX(Math.PI / 2).scale(1.3, 1, 1), '#fff6e4', 1902, 0, 0.086, 0); },
    (Q, c) => { Q(box(2.0, 0.02, 1.25), c, 1903, 0, 0.075, 0); [-0.6, -0.2, 0.2, 0.6].forEach((x) => Q(box(0.16, 0.022, 1.12), '#fff6e4', 1904, x, 0.078, 0)); [-1, 1].forEach((s) => Q(box(0.06, 0.016, 1.2), '#f3e3c4', 1905, s * 1.03, 0.075, 0)); },
    (Q, c) => { Q(starG(1.05, 0.52, 0.02).rotateX(-Math.PI / 2), c, 1906, 0, 0.066, 0); Q(starG(0.5, 0.25, 0.024).rotateX(-Math.PI / 2), '#fff6e4', 1907, 0, 0.067, 0); },
    (Q, c) => { Q(cy_(0.95, 0.95, 0.02, 30).scale(1.25, 1, 1), c, 1908, 0, 0.074, 0); Q(cy_(0.7, 0.7, 0.022, 30).scale(1.25, 1, 1), '#f2c14a', 1909, 0, 0.076, 0); Q(cy_(0.45, 0.45, 0.024, 30).scale(1.25, 1, 1), '#74a857', 1910, 0, 0.078, 0); Q(cy_(0.22, 0.22, 0.026, 24).scale(1.25, 1, 1), '#5a9fc4', 1911, 0, 0.08, 0); }
  ] },
  lamp: { cols: ['#f2c14a', '#e9684a', '#74a857', '#b58ad6'], glow: [0.97, 1.18, 0.62, 1.05], types: [
    (Q, c) => { Q(cy_(0.16, 0.2, 0.04), CDK, 1920, 0, 0.02, 0); Q(cy_(0.03, 0.03, 0.75, 8), CWD, 1921, 0, 0.4, 0); Q(cy_(0.13, 0.1, 0.04), c, 1922, 0, 0.79, 0); Q(cy_(0.035, 0.035, 0.14, 8), '#fff6e4', 1923, 0, 0.88, 0); Q(new T.IcosahedronGeometry(0.035, 0), '#ffd27a', 1924, 0, 0.97, 0); },
    (Q, c) => { Q(cy_(0.18, 0.2, 0.04), '#3a3f48', 1925, 0, 0.02, 0); Q(cy_(0.025, 0.025, 1.1, 8), '#3a3f48', 1926, 0, 0.57, 0); Q(cy_(0.14, 0.26, 0.3, 14), c, 1927, 0, 1.2, 0); },
    (Q, c) => { Q(cy_(0.09, 0.12, 0.45, 10), '#fff6e4', 1930, 0, 0.225, 0); Q(new T.SphereGeometry(0.3, 14, 8, 0, 6.283, 0, 1.57), c, 1931, 0, 0.42, 0); for (let k = 0; k < 5; k++) { const a = k * 1.2566; Q(new T.SphereGeometry(0.04, 6, 4), '#fffaf0', 1932, Math.cos(a) * 0.2, 0.64, Math.sin(a) * 0.2); } Q(new T.SphereGeometry(0.045, 6, 4), '#fffaf0', 1933, 0, 0.72, 0); },
    (Q, c) => { Q(cy_(0.16, 0.18, 0.04), '#3a3f48', 1934, 0, 0.02, 0); Q(cy_(0.025, 0.025, 0.82, 8), '#3a3f48', 1936, 0, 0.43, 0); Q(starG(0.24, 0.11, 0.08).translate(0, 0, -0.04), c, 1935, 0, 1.05, 0); }
  ] },
  seat: { cols: ['#d9b27a', '#9fb48a', '#5a7fb0', '#e9684a'], types: [
    (Q, c) => { Q(cy_(0.22, 0.22, 0.08, 14), c, 1940, 0, 0.42, 0); for (let k = 0; k < 3; k++) { const a = k * 2.094; Q(cy_(0.025, 0.025, 0.4, 6), CDK, 1941, Math.cos(a) * 0.14, 0.2, Math.sin(a) * 0.14); } },
    (Q, c) => { Q(box(0.62, 0.28, 0.58), c, 1942, 0, 0.22, 0); Q(box(0.62, 0.48, 0.14), c, 1943, 0, 0.5, -0.24); [-1, 1].forEach((s) => Q(box(0.12, 0.38, 0.58), c, 1944, s * 0.31, 0.32, 0)); Q(box(0.46, 0.08, 0.42), '#f3e3c4', 1945, 0, 0.39, 0.04); },
    (Q, c) => { Q(new T.IcosahedronGeometry(0.36, 2).scale(1.1, 0.62, 1.1), c, 1946, 0, 0.22, 0); Q(new T.IcosahedronGeometry(0.24, 1).scale(1.1, 0.8, 0.6), c, 1947, 0, 0.42, -0.2); },
    (Q, c) => { Q(box(1.3, 0.28, 0.6), c, 1948, 0, 0.22, 0); Q(box(1.3, 0.5, 0.14), c, 1949, 0, 0.5, -0.25); [-1, 1].forEach((s) => { Q(box(0.14, 0.4, 0.6), c, 1955, s * 0.65, 0.32, 0); Q(box(0.52, 0.08, 0.44), '#f3e3c4', 1956, s * 0.29, 0.39, 0.04); }); }
  ] },
  bed: { cols: ['#7b9fd6', '#e9684a', '#74a857', '#f6b8c8'], types: [
    (Q, c) => { Q(box(1.7, 0.3, 0.95), CWD, 1950, 0, 0.15, 0); Q(box(1.6, 0.14, 0.88), '#fffaf0', 1951, 0, 0.36, 0); Q(box(1.05, 0.08, 0.9), c, 1952, 0.25, 0.46, 0); Q(box(0.38, 0.12, 0.6), '#fffaf0', 1953, -0.55, 0.49, 0); Q(box(0.1, 0.75, 1.0), CWD, 1954, -0.85, 0.37, 0); },
    (Q, c) => { Q(box(1.7, 0.3, 0.95), CWD, 1957, 0, 0.15, 0); Q(box(1.6, 0.14, 0.88), '#fffaf0', 1958, 0, 0.36, 0); Q(box(1.05, 0.08, 0.9), c, 1959, 0.25, 0.46, 0); Q(box(0.38, 0.12, 0.6), '#fffaf0', 1960, -0.55, 0.49, 0);
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => Q(box(0.09, 1.75, 0.09), CWD, 1961, a * 0.84, 0.875, b * 0.45)); Q(box(1.7, 0.1, 0.95), CWD, 1962, 0, 1.2, 0); Q(box(1.6, 0.12, 0.88), '#fffaf0', 1963, 0, 1.31, 0); Q(box(1.05, 0.07, 0.9), c, 1964, 0.25, 1.4, 0); Q(box(0.36, 0.1, 0.58), '#fffaf0', 1965, -0.55, 1.42, 0);
      [-1, 1].forEach((s) => Q(box(1.7, 0.06, 0.05), CWD, 1966, 0, 1.6, s * 0.46)); [0.48, 0.78].forEach((x) => Q(box(0.05, 1.2, 0.05), CDK, 1967, x, 0.85, 0.52)); [0.4, 0.7, 1.0].forEach((y) => Q(box(0.34, 0.04, 0.05), CDK, 1968, 0.63, y, 0.52)); },
    (Q, c) => { Q(box(1.7, 0.3, 0.95), '#fff6e4', 1970, 0, 0.15, 0); Q(box(1.6, 0.14, 0.88), '#fffaf0', 1971, 0, 0.36, 0); Q(box(1.05, 0.08, 0.9), c, 1972, 0.25, 0.46, 0); Q(box(0.38, 0.12, 0.6), '#fffaf0', 1973, -0.55, 0.49, 0);
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => Q(cy_(0.04, 0.04, 1.85, 8), '#e8b84a', 1974, a * 0.84, 0.925, b * 0.45)); Q(box(1.8, 0.05, 1.02), c, 1975, 0, 1.86, 0); [-1, 1].forEach((s) => Q(box(0.04, 0.95, 0.3), c, 1976, -0.86, 1.38, s * 0.34)); Q(new T.ConeGeometry(0.12, 0.2, 8), '#e8b84a', 1977, 0, 1.98, 0); },
    (Q, c) => { Q(box(1.9, 0.42, 1.0), c, 1980, 0, 0.31, 0); Q(box(0.5, 0.22, 0.96), c, 1981, 0.74, 0.6, 0); Q(box(1.25, 0.12, 0.84), '#fffaf0', 1982, -0.22, 0.56, 0); Q(box(0.34, 0.12, 0.56), '#fffaf0', 1983, -0.62, 0.66, 0); Q(box(0.12, 0.55, 0.96), c, 1984, -0.92, 0.6, 0);
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => Q(cy_(0.18, 0.18, 0.1, 14).rotateX(Math.PI / 2), '#22303c', 1985, a * 0.6, 0.18, b * 0.52)); [-1, 1].forEach((s) => Q(cy_(0.07, 0.07, 0.04, 10).rotateZ(Math.PI / 2), '#ffd98a', 1986, 0.97, 0.38, s * 0.3)); Q(box(0.06, 0.24, 0.8), '#bfe3f2', 1987, 0.5, 0.82, 0); }
  ] }
};
const NEED_STARS = [0, 2, 4, 6], TYPE_BASE = [20, 60, 150, 320], BED_BASE = [0, 120, 400, 900], TIER_M = [0, 1, 2, 3.5, 6];
const r5 = (v) => Math.max(5, Math.round(v / 5) * 5);
/* the rooms: where they are (offsets from the house inside's centre), their spots [family, x, z, turn] and their extras */
const CROOMS = [
  { id: 'bed', need: 1, c: [0, -5.75], spots: [['bed', -3.4, -6.25, 0], ['rug', 2.1, -5.7, 0], ['lamp', -1.9, -6.65, 0]], ex: [] },
  { id: 'speed', need: 1, c: [-3.5, -2.25], spots: [['rug', -3.5, -1.9, 0], ['lamp', -1.45, -0.55, 0], ['seat', -4.9, -1.1, 0.6]], ex: FURN.filter((f) => f.room === 'speed') },
  { id: 'bag', need: 1, c: [-3.5, 2.25], spots: [['rug', -3.4, 2.5, 0], ['lamp', -1.45, 3.95, 0], ['seat', -2.1, 1.3, -0.5]], ex: FURN.filter((f) => f.room === 'bag') },
  { id: 'farm', need: 2, c: [3.5, -2.25], spots: [['rug', 2.9, -2.2, 0], ['lamp', 1.45, -3.9, 0], ['seat', 2.2, -0.9, 0.4]], ex: FURN.filter((f) => f.room === 'farm') },
  { id: 'guests', need: 2, c: [3.5, 2.25], spots: [['rug', 3.6, 2.2, 0], ['lamp', 1.45, 3.95, 0], ['seat', 4.0, 3.7, Math.PI]], ex: FURN.filter((f) => f.room === 'guests') },
  { id: 'play', need: 3, c: [8.7, -4.1], spots: [['rug', 8.7, -4.1, 0], ['lamp', 11.0, -6.6, 0], ['seat', 8.0, -2.3, Math.PI]], ex: FURN.filter((f) => f.id === 'toys' || f.id === 'horse') },
  { id: 'music', need: 3, c: [8.7, 1.65], spots: [['rug', 8.7, 1.7, 0], ['lamp', 6.45, 4.0, 0], ['seat', 8.3, 3.8, Math.PI]], ex: FURN.filter((f) => f.id === 'piano' || f.id === 'clock') },
  { id: 'garden', need: 4, c: [-8.7, -4.1], spots: [['rug', -8.7, -4.1, 0], ['lamp', -6.45, -6.6, 0], ['seat', -9.8, -2.2, 0.5]], ex: FURN.filter((f) => f.id === 'fish' || f.id === 'plants') },
  { id: 'bath', need: 4, c: [-8.7, 1.65], spots: [['rug', -8.4, 0.9, 0], ['lamp', -11.0, -0.7, 0], ['seat', -7.3, 3.8, Math.PI]], ex: FURN.filter((f) => f.id === 'tub' || f.id === 'duck') }
];
const CSPOT = {}; CROOMS.forEach((r) => { r.sp = r.spots.map(([fam, x, z, ry]) => { const s = { id: r.id + ':' + fam, room: r, fam, x, z, ry }; CSPOT[s.id] = s; return s; }); });
const WALLC = ['#9fc7d6', '#f3e3c4', '#f6b8c8', '#b9d98f', '#f2c14a'], ROOFC = [PAL.ochre, '#c0563a', '#3f7d62', '#5a7fb0', '#7b5ea7'];
const PAINT_COST = { w: 60, r: 80 };

/* ---------- save data ---------- */
function catS() {
  const S = stS(); if (!S) return null;
  if (!S.cat) S.cat = { own: {}, eq: {} };
  const C = S.cat; if (!C.own['bed:bed']) { C.own['bed:bed'] = { 0: [0] }; if (!C.eq['bed:bed']) C.eq['bed:bed'] = [0, 0]; }
  if (!C.paint) C.paint = { w: 0, r: 0, ow: [0], or: [0] };
  return C;
}
const typeCost = (s, t) => r5((s.fam === 'bed' ? BED_BASE[t] : TYPE_BASE[t]) * TIER_M[s.room.need]) * (s.fam === 'bed' && t === 0 ? 0 : 1);
const colCost = (s, t) => r5(Math.max(30, (s.fam === 'bed' ? BED_BASE[t] : TYPE_BASE[t]) * TIER_M[s.room.need]) * 0.3);
const roomOpen = (r) => r.need <= stS().size;
const owns = (s, t) => { const o = catS().own[s.id]; return !!(o && o[t]); };
function roomStars(r) { const C = catS(); let n = 0; r.sp.forEach((s) => { const o = C.own[s.id]; if (o) n += Object.keys(o).length; }); r.ex.forEach((f) => { if (stS().furn[f.id]) n++; }); return n; }
function typeState(s, t) {
  if (!roomOpen(s.room)) return 'room';
  if (owns(s, t)) return 'own';
  if (t > 0 && !owns(s, t - 1)) return 'prev';
  if (roomStars(s.room) < NEED_STARS[t]) return 'star';
  return 'buy';
}
function exState(r, k) { const f = r.ex[k]; if (!roomOpen(r)) return 'room'; if (stS().furn[f.id]) return 'own'; if (k > 0 && !stS().furn[r.ex[k - 1].id]) return 'prev'; return 'buy'; }
const decoNext = () => DECO_L.find((d) => !stS().deco[d.id]);
const catModel = (fam, t, c) => painterGroup((Q) => CFAM[fam].types[t](Q, CFAM[fam].cols[c]));
const catThumb = (fam, t, c) => thumbOf('cat:' + fam + t + ':' + c, () => catModel(fam, t, c));
const roomIcon = (r) => {
  if (r.id === 'bed') return catThumb('bed', 0, 0);
  if (r.id === 'speed') return thumbOf('room:speed', () => painterGroup((Q) => { Q(box(0.95, 1.15, 0.3), CDK, 1995, 0, 0.575, 0); const BC = ['#c45a3a', '#3f6b62', '#e6b45a', '#5a7fb0', '#7a3f3a']; [0.08, 0.45, 0.82].forEach((y, k) => { Q(box(0.86, 0.035, 0.26), CWD, 1996, 0, y, 0.02); for (let i = 0; i < 6; i++) Q(box(0.1, 0.24 + (i % 3) * 0.03, 0.18), BC[(i + k) % 5], 1997 + i, -0.34 + i * 0.135, y + 0.14, 0.04); }); }));
  if (r.id === 'farm') return thumbOf('room:farm', () => painterGroup((Q) => { Q(box(0.8, 0.72, 0.56), '#3a3f48', 1998, 0, 0.36, 0); Q(box(0.84, 0.04, 0.6), '#555b66', 1999, 0, 0.74, 0); Q(box(0.3, 0.12, 0.02), '#e9884a', 2000, 0, 0.3, 0.29); Q(cy_(0.17, 0.15, 0.2, 14), '#c45a3a', 2001, -0.12, 0.86, 0.05); Q(cy_(0.07, 0.07, 0.9, 8), '#3a3f48', 2002, 0.25, 1.2, -0.18); }));
  if (r.ex.length) return thumbOf('room:' + r.id, () => furnModel(r.ex[r.id === 'farm' || r.id === 'guests' ? 1 : 0]));
  return catThumb('seat', 1, 0);
};
/* everything that can be bought right now (pieces, extras, decorations): for the wish bubble and the guide arrow */
function catOffers() {
  if (!stS()) return []; const out = [];
  CROOMS.forEach((r) => { if (!roomOpen(r)) return;
    r.sp.forEach((s) => { for (let t = 0; t < 4; t++) { if (typeState(s, t) === 'buy') { out.push({ id: 'c:' + s.id + ':' + t, cost: typeCost(s, t), make: () => catModel(s.fam, t, 0), act: { k: 'type', s: s.id, t } }); break; } } });
    for (let k = 0; k < r.ex.length; k++) { if (exState(r, k) === 'buy') { const f = r.ex[k]; out.push({ id: 'f:' + f.id, cost: f.cost, make: () => furnModel(f), act: { k: 'ex', id: f.id } }); break; } } });
  { const l = isleNext(); if (l) out.push({ id: 'i:' + l.id, cost: l.cost, make: () => isleNextModel(l), act: { k: 'isle', id: l.id } }); }
  const d = decoNext(); if (d) out.push({ id: 'd:' + d.id, cost: d.cost, make: () => offerOf({ kind: 'deco' }).make(), act: { k: 'deco', id: d.id } });
  return out;
}

/* ---------- the pieces in the house ---------- */
const SPOTM = {};
let catReady = false, origBed = null;
function spotRing(s) { const r = s.room, dx = r.c[0] - s.x, dz = r.c[1] - s.z, d = Math.hypot(dx, dz); if (s.fam === 'bed') return [s.x + 0.35, s.z + 1.35]; if (d < 0.95) return [s.x, s.z + 0.95]; return [s.x + dx / d * 0.95, s.z + dz / d * 0.95]; }
function applySpot(id) {
  const s = CSPOT[id], C = catS(), e = C.eq[id], old = SPOTM[id];
  if (old) { sc.remove(old); SPOTM[id] = null; }
  if (!e) return null;
  const g = catModel(s.fam, e[0], e[1]); g.position.set(HX(s.x), 0, HZ(s.z)); g.rotation.y = s.ry; sc.add(g);
  if (s.fam === 'lamp') { const gl = new T.Sprite(glowMat); gl.scale.set(0.9, 0.9, 1); gl.position.set(0, CFAM.lamp.glow[e[0]], 0); g.add(gl); }
  g.visible = roomOpen(s.room); SPOTM[id] = g; return g;
}
function catInit() {
  catReady = true; catS();
  /* the old bed and the four room rugs make way for the ones from the catalog */
  sc.children.forEach((g) => { if (g.isGroup && Math.abs(g.position.x - BED.x) < 0.01 && Math.abs(g.position.z - BED.z) < 0.01 && g.children.length >= 5) origBed = g; });
  if (origBed) origBed.visible = false;
  const RUGP = [[-3.5, -2.0], [-3.4, 2.6], [3.5, -1.6], [3.6, 2.0]];
  sc.children.forEach((m) => { if (m.isMesh && m.material && m.material.map && m.geometry.type === 'PlaneGeometry' && Math.abs(m.position.y - 0.074) < 0.002 && RUGP.some(([x, z]) => Math.abs(m.position.x - HX(x)) < 0.01 && Math.abs(m.position.z - HZ(z)) < 0.01)) m.visible = false; });
  Object.keys(CSPOT).forEach((id) => { if (!stS().pend.includes('c:' + id)) applySpot(id); });
  paintHouse(true);
}
function catSync() { Object.keys(SPOTM).forEach((id) => { const g = SPOTM[id]; if (g && !(BUILD && BUILD.what === 'c:' + id)) g.visible = roomOpen(CSPOT[id].room); }); }
/* house and roof paint */
function paintHouse(quiet) {
  const P = catS().paint, w = houseG.children[0], r = houseG.children[1];
  if (w && w.geometry.attributes.color) repaintV(w, (x, y, z, k) => tone(WALLC[P.w], k, 0.5));
  if (r && r.geometry.attributes.color) repaintV(r, (x, y, z, k) => tone(ROOFC[P.r], k, 0.5));
  [2, 3].forEach((n) => { const g = HOUSE_ADD[n], wall = g.children.find((c) => c.userData.part === 'wall'); if (wall) repaintV(wall, (x, y, z, k) => tone(y < (n === 2 ? -0.25 : -0.9) ? '#b8aa98' : WALLC[P.w], k, 0.5)); });
  if (!quiet) { confetti(HOUSE.x, 2.6, HOUSE.z + 0.5, 50, 5); fanfare(false); }
}

/* ---------- buying ---------- */
function catCelebrate(pic, big) { confetti(pip.position.x, 1.3, pip.position.z, 44); keeper.userData.hop = 1; fanfare(!!big); badge(pic); save(); }
function catBuy(a) {
  const S = stS(), C = catS(); let cost = 0, pic = null, go = null;
  if (a.k === 'type') { const s = CSPOT[a.s]; if (typeState(s, a.t) !== 'buy') return false; cost = typeCost(s, a.t); pic = catThumb(s.fam, a.t, 0);
    go = () => { if (!C.own[s.id]) C.own[s.id] = {}; C.own[s.id][a.t] = [0]; C.eq[s.id] = [a.t, 0]; if (!S.pend.includes('c:' + s.id)) S.pend.push('c:' + s.id); }; }
  else if (a.k === 'col') { const s = CSPOT[a.s], o = C.own[s.id] && C.own[s.id][a.t]; if (!o || o.includes(a.c)) return false; cost = colCost(s, a.t); pic = catThumb(s.fam, a.t, a.c);
    go = () => { o.push(a.c); C.eq[s.id] = [a.t, a.c]; if (!S.pend.includes('c:' + s.id)) S.pend.push('c:' + s.id); }; }
  else if (a.k === 'ex') { const f = FURN.find((q) => q.id === a.id), r = CROOMS.find((q) => q.ex.includes(f)); if (!r || exState(r, r.ex.indexOf(f)) !== 'buy') return false; cost = f.cost; pic = thumbOf('f:' + f.id, () => furnModel(f));
    go = () => { S.furn[f.id] = 1; S.pend.push('f:' + f.id); }; }
  else if (a.k === 'deco') { const d = decoNext(); if (!d || d.id !== a.id) return false; cost = d.cost; pic = thumbOf('d:' + d.id, () => offerOf({ kind: 'deco' }).make());
    go = () => { S.deco[d.id] = 1; S.pend.push('d:' + d.id); }; }
  else if (a.k === 'paint') { const own = a.w ? C.paint.ow : C.paint.or; if (own.includes(a.c)) return false; cost = PAINT_COST[a.w ? 'w' : 'r']; pic = thumbOf('paint' + (a.w ? 'w' : 'r') + a.c, () => paintModel(a.w ? a.c : C.paint.w, a.w ? C.paint.r : a.c));
    go = () => { own.push(a.c); if (a.w) C.paint.w = a.c; else C.paint.r = a.c; if (!S.pend.includes('p:house')) S.pend.push('p:house'); }; }
  else if (a.k === 'size') { const z = SIZES[a.n]; if (!z || a.n !== S.size + 1) return false; cost = z.cost - (S.paid['h:' + a.n] || 0); pic = thumbOf('h:' + a.n, () => miniHouse(S.size, a.n));
    go = () => { delete S.paid['h:' + a.n]; S.size = a.n; S.pend.push('size' + a.n); }; }
  else if (a.k === 'isle') { const q = islePrep(a); if (!q) return false; cost = q.cost; pic = q.pic; go = q.go; }
  if (!go) return false;
  if (shop().coins < cost) { Snd.play('tock', { gain: 0.3, f: 300 }); flash(coinPill, 'no'); return false; }
  shop().coins -= cost; go(); Snd.play('coin', { gain: 0.4 }); catCelebrate(pic, a.k === 'size' || a.k === 'type'); return true;
}
function paintModel(w, r) { const g = new T.Group(); let geo = new T.BoxGeometry(2.4, 1.5, 2.0); geo.translate(0, 0.75, 0); part(fac(geo, WALLC[w], 1990), g); geo = new T.CylinderGeometry(0.01, 1.85, 1.0, 4, 1); geo.rotateY(Math.PI / 4); geo.scale(1, 1, 0.82); geo.translate(0, 2.0, 0); part(fac(geo, ROOFC[r], 1991), g); const d = new T.Mesh(new T.BoxGeometry(0.62, 0.95, 0.04), new T.MeshStandardMaterial({ color: '#3a2e2a' })); d.position.set(0, 0.48, 1.01); g.add(d); return g; }

/* ---------- the catalog screen ---------- */
const ICO = {
  coin: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#f2c14a" stroke="#3a2e2a" stroke-width="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="#b07a1e" stroke-width="2"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 L15 9 L22 9.5 L16.5 14 L18.5 21.5 L12 17.5 L5.5 21.5 L7.5 14 L2 9.5 L9 9 Z" fill="#f2c14a" stroke="#3a2e2a" stroke-width="2" stroke-linejoin="round"/></svg>',
  lock: '<svg viewBox="0 0 34 34" aria-hidden="true"><rect x="6" y="15" width="22" height="16" rx="4" fill="#e0a646" stroke="#3a2e2a" stroke-width="3"/><path d="M11 15 V10 Q11 4 17 4 Q23 4 23 10 V15" fill="none" stroke="#3a2e2a" stroke-width="3"/></svg>',
  house: '<svg viewBox="0 0 40 34" aria-hidden="true"><path d="M5 16 L20 4 L35 16" fill="none" stroke="#3a2e2a" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/><rect x="9" y="15" width="22" height="16" rx="2" fill="#f2c14a" stroke="#3a2e2a" stroke-width="3"/></svg>',
  check: '<svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="15" fill="#3f7d62" stroke="#3a2e2a" stroke-width="3"/><path d="M10 17 L15 22 L24 12" fill="none" stroke="#fffaf0" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  back: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M17 5 L8 14 L17 23" fill="none" stroke="#3a2e2a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  x: '<svg viewBox="0 0 26 26" aria-hidden="true"><path d="M5 5 L21 21 M21 5 L5 21" stroke="#3a2e2a" stroke-width="4" stroke-linecap="round"/></svg>',
  prev: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M24 14 H6 M12 7 L5 14 L12 21" fill="none" stroke="#3a2e2a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  tabHouse: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 19 L20 7 L34 19" fill="none" stroke="#3a2e2a" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/><rect x="10" y="18" width="20" height="15" rx="2" fill="#fff6e4" stroke="#3a2e2a" stroke-width="3"/><rect x="17" y="23" width="6" height="10" fill="#c0563a"/></svg>',
  tabIsle: '<svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="29" rx="17" ry="7" fill="#8fd0e8" stroke="#3a2e2a" stroke-width="2.5"/><ellipse cx="20" cy="27" rx="11" ry="4.5" fill="#f2d48a"/><path d="M12 27 Q14 20 20 22 Q26 20 28 27 Z" fill="#74a857" stroke="#3a2e2a" stroke-width="2"/><rect x="22" y="9" width="5" height="15" fill="#fff6e4" stroke="#3a2e2a" stroke-width="2"/><rect x="22" y="13" width="5" height="3.5" fill="#e9684a"/><path d="M21 9 L24.5 4 L28 9 Z" fill="#e9684a" stroke="#3a2e2a" stroke-width="2" stroke-linejoin="round"/></svg>',
  tabYard: '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="18" y="22" width="4" height="13" fill="#6b4630"/><circle cx="20" cy="16" r="11" fill="#74a857" stroke="#3a2e2a" stroke-width="3"/><rect x="4" y="33" width="32" height="3" rx="1.5" fill="#3a2e2a"/></svg>',
  spark: '<svg class="spk" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2 L24 16 L38 20 L24 24 L20 38 L16 24 L2 20 L16 16 Z" fill="#ffe28a" stroke="#3a2e2a" stroke-width="2.5" stroke-linejoin="round"/></svg>'
};
{ const st = document.createElement('style'); st.textContent = `
.cat{position:fixed;inset:0;z-index:45;background:rgba(58,40,28,.55);display:flex;align-items:center;justify-content:center;font-family:Fredoka,system-ui,sans-serif;color:#3a2e2a;-webkit-user-select:none;user-select:none}
.cat[hidden]{display:none}
.cat .cp{width:min(96vw,1000px);height:min(92vh,720px);box-sizing:border-box;background:#fff6e4;border:4px solid #3a2e2a;border-radius:28px;padding:16px 20px;display:flex;flex-direction:column;gap:12px;box-shadow:0 10px 0 rgba(0,0,0,.25)}
.cat .ch{display:flex;align-items:center;justify-content:space-between;gap:12px}
.cat .row{display:flex;align-items:center;gap:10px}
.cat button{font-family:inherit;cursor:pointer;color:inherit;padding:0}
.cat .tab{width:64px;height:64px;border-radius:20px;border:4px solid #3a2e2a;background:#fffaf0;display:flex;align-items:center;justify-content:center}
.cat .tab.on{background:#f2c14a;box-shadow:0 4px 0 #3a2e2a}
.cat .tab svg{width:38px;height:38px}
.cat .rb{width:56px;height:56px;border-radius:50%;border:4px solid #3a2e2a;background:#fffaf0;display:flex;align-items:center;justify-content:center}
.cat .rb svg{width:26px;height:26px}
.cat .pill{display:flex;align-items:center;gap:6px;background:#fffaf0;border:4px solid #3a2e2a;border-radius:999px;padding:4px 16px 4px 6px;font-size:28px;font-weight:700}
.cat .pill svg{width:32px;height:32px}
.cat .cb{flex:1;min-height:0;overflow:auto}
.cat .house{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:repeat(3,minmax(0,1fr));gap:10px;height:100%;background:#e6d2ae;border:4px solid #3a2e2a;border-radius:18px;padding:10px;box-sizing:border-box}
.cat .rt{position:relative;border:4px solid #3a2e2a;border-radius:16px;background:#fffaf0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;box-shadow:0 4px 0 #3a2e2a;min-height:0}
.cat .rt img{width:min(96px,60%);aspect-ratio:1;object-fit:contain;min-height:0;flex:0 1 auto}
.cat .rt.shut{background:#cdbb98;border-style:dashed;border-color:#8a7454;box-shadow:none}
.cat .rt.shut img{opacity:.45;filter:grayscale(.6)}
.cat .cneed{flex:none;max-width:calc(100% - 8px);box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:2px 4px;font-size:18px;line-height:1.1;font-weight:700;background:#fffaf0;border:3px solid #3a2e2a;border-radius:12px;padding:2px 8px}
.cat .cneed svg{width:22px;height:22px;flex:none}
.cat .cneed .pr{display:flex;align-items:center;gap:2px;flex:none}
.cat .rt.shut img{width:min(72px,42%)}
.cat .cneed.next{box-shadow:0 0 0 5px #ffe28a}
.cat .stars{display:flex;align-items:center;gap:3px;font-size:22px;font-weight:700}
.cat .stars svg{width:24px;height:24px}
.cat .spk{position:absolute;top:-12px;right:-10px;width:34px;height:34px;animation:catSpk 1.4s ease-in-out infinite}
@keyframes catSpk{50%{transform:scale(1.2) rotate(20deg)}}
.cat .cols{display:grid;gap:12px;height:100%;min-height:0}
.cat .col{background:#efe0c2;border-radius:18px;padding:8px;display:flex;flex-direction:column;gap:8px;min-height:0;overflow:auto}
.cat .cc{position:relative;display:flex;align-items:center;gap:8px;padding:6px;border-radius:16px;border:4px solid #3a2e2a;background:#fffaf0;min-height:92px;box-sizing:border-box}
.cat .cc img{width:72px;height:72px;flex-shrink:0;border-radius:12px;background:#f3e6cb}
.cat .cc .ci{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0}
.cat .cc.buy{border-color:#3f7d62;box-shadow:0 4px 0 #3f7d62}
.cat .cc.eq{box-shadow:0 0 0 5px #bfe6a8}
.cat .cc.lock{background:#e3d5b8;border-style:dashed;border-color:#a8946f}
.cat .cc.lock img{opacity:.4;filter:grayscale(1)}
.cat .price{display:flex;align-items:center;gap:3px;border:3px solid #a8946f;background:#fff6e4;border-radius:999px;padding:1px 9px 1px 3px;font-size:20px;font-weight:700}
.cat .price.ok{border-color:#3f7d62;background:#ecfae2}
.cat .price svg{width:22px;height:22px}
.cat .lk{display:flex;align-items:center;gap:3px;font-size:20px;font-weight:700;color:#5d4c3e}
.cat .lk svg{width:22px;height:22px}
.cat .ck svg{width:30px;height:30px}
.cat .dots{display:flex;flex-wrap:wrap;justify-content:center;gap:5px}
.cat .dot{width:28px;height:28px;border-radius:50%;border:3px solid #3a2e2a;position:relative}
.cat .dot.no{opacity:.4}
.cat .dot.on{box-shadow:0 0 0 3px #3f7d62}
.cat .dot b{position:absolute;left:50%;top:100%;transform:translateX(-50%);font-size:12px;line-height:1;margin-top:2px;white-space:nowrap}
.cat .dots.w{row-gap:16px}
.catTray{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:42;background:#fff6e4;border:4px solid #3a2e2a;border-radius:24px;padding:10px 16px;display:flex;flex-direction:column;gap:10px;font-family:Fredoka,system-ui,sans-serif;box-shadow:0 6px 0 rgba(0,0,0,.25)}
.catTray[hidden]{display:none}
.catTray .row{display:flex;gap:10px;justify-content:center}
.catTray button{padding:0;cursor:pointer;font-family:inherit}
.catTray .tp{width:84px;height:84px;border-radius:16px;border:4px solid #3a2e2a;background:#fffaf0;display:flex;align-items:center;justify-content:center}
.catTray .tp img{width:72px;height:72px}
.catTray .tp.on{border-color:#3f7d62;box-shadow:0 0 0 4px #bfe6a8}
.catTray .tp.no{background:#e3d5b8;border-style:dashed;border-color:#a8946f;opacity:.7}
.catTray .tp.no img{filter:grayscale(1);opacity:.5}
.catTray .sw{width:52px;height:52px;border-radius:50%;border:4px solid #3a2e2a}
.catTray .sw.on{box-shadow:0 0 0 4px #bfe6a8}
.catTray .sw.no{opacity:.3}
.stBadge{z-index:60}
@media (max-width:700px){.cat .cp{padding:10px;border-radius:20px}.cat .tab{width:52px;height:52px}.cat .cc img{width:54px;height:54px}}
`; document.head.appendChild(st); }
const catEl = document.createElement('div'); catEl.className = 'cat'; catEl.hidden = true; document.body.appendChild(catEl);
const trayEl = document.createElement('div'); trayEl.className = 'catTray'; trayEl.hidden = true; document.body.appendChild(trayEl);
['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'wheel'].forEach((ev) => { catEl.addEventListener(ev, (e) => e.stopPropagation(), { passive: true }); trayEl.addEventListener(ev, (e) => e.stopPropagation(), { passive: true }); });
const CV = { open: false, tab: 'house', room: null, wait: false, tray: null };
const fmtC = (n) => (typeof fmt === 'function' ? fmt(n) : String(n));
const priceH = (cost) => `<span class="price${shop().coins >= cost ? ' ok' : ''}">${ICO.coin}${fmtC(cost)}</span>`;
function catOpen() { if (CV.open) return; CV.open = true; CV.tab = 'house'; CV.room = null; catEl.hidden = false; Snd.play('pop', { gain: 0.4, f: 560 }); Snd.play('sparkle', { gain: 0.25, n: 4 }, 0.05); catRender(); }
function catClose() { CV.open = false; CV.wait = true; catEl.hidden = true; Snd.play('pop', { gain: 0.3, f: 420 }); }
function catWish() { const w = cheapest(false); return w && w.o.act ? w.o.act : null; }
const sameAct = (a, b) => a && b && a.k === b.k && a.s === b.s && a.t === b.t && a.id === b.id;
function catRender() {
  if (!CV.open) return;
  const S = stS(), wish = catWish(), head = `<div class="ch"><div class="row">${CV.room ? `<button type="button" class="rb" data-act="back" aria-label="Tillbaka">${ICO.back}</button>` : ''}
    <button type="button" class="tab${CV.tab === 'house' ? ' on' : ''}" data-act="tab" data-v="house" aria-label="Huset">${ICO.tabHouse}</button>
    <button type="button" class="tab${CV.tab === 'yard' ? ' on' : ''}" data-act="tab" data-v="yard" aria-label="Gården">${ICO.tabYard}</button>
    <button type="button" class="tab${CV.tab === 'isle' ? ' on' : ''}" data-act="tab" data-v="isle" aria-label="Ön">${ICO.tabIsle}</button>
    ${CV.room ? `<span class="pill"><img src="${roomIcon(CV.room)}" alt="" style="width:40px;height:40px">${ICO.star}${roomStars(CV.room)}</span>` : ''}</div>
    <div class="row"><span class="pill">${ICO.coin}${fmtC(shop().coins)}</span><button type="button" class="rb" data-act="close" aria-label="Stäng">${ICO.x}</button></div></div>`;
  let body = '';
  if (CV.tab === 'yard') body = yardHTML(wish);
  else if (CV.tab === 'isle') body = isleHTML(wish);
  else if (CV.room) body = roomHTML(CV.room, wish);
  else body = housePlanHTML(wish);
  catEl.innerHTML = `<div class="cp">${head}<div class="cb">${body}</div></div>`;
}
function housePlanHTML(wish) {
  const S = stS(), AREA = { garden: '1 / 1 / 3 / 2', bath: '3 / 1 / 4 / 2', bed: '1 / 2 / 2 / 4', speed: '2 / 2 / 3 / 3', bag: '3 / 2 / 4 / 3', farm: '2 / 3 / 3 / 4', guests: '3 / 3 / 4 / 4', play: '1 / 4 / 3 / 5', music: '3 / 4 / 4 / 5' };
  let shown = {};
  return `<div class="house">${CROOMS.map((r) => {
    const open = roomOpen(r), hasWish = wish && ((wish.s && CSPOT[wish.s].room === r) || (wish.k === 'ex' && r.ex.some((f) => f.id === wish.id)));
    if (open) return `<button type="button" class="rt" style="grid-area:${AREA[r.id]}" data-act="room" data-v="${r.id}" aria-label="Rum"><img src="${roomIcon(r)}" alt=""><span class="stars">${ICO.star}${roomStars(r)}</span>${hasWish ? ICO.spark : ''}</button>`;
    const next = r.need === S.size + 1, cost = next ? SIZES[r.need].cost - (S.paid['h:' + r.need] || 0) : 0, first = next && !shown[r.need]; shown[r.need] = 1;
    return `<button type="button" class="rt shut" style="grid-area:${AREA[r.id]}" data-act="${next ? 'size' : 'none'}" data-v="${r.need}" aria-label="Större hus"><img src="${roomIcon(r)}" alt=""><span class="cneed${next ? ' next' : ''}">${ICO.lock}${ICO.house}${next ? `<span class="pr">${ICO.coin}${fmtC(cost)}</span>` : ''}</span>${first && cheapestSize() ? ICO.spark : ''}</button>`;
  }).join('')}</div>`;
}
function cheapestSize() { const w = cheapest(false); return w && w.o.size; }
function lockH(st, t) { return st === 'star' ? `<span class="lk">${ICO.lock}${ICO.star}${NEED_STARS[t]}</span>` : st === 'prev' ? `<span class="lk">${ICO.lock}${ICO.prev}</span>` : `<span class="lk">${ICO.lock}${ICO.house}</span>`; }
function roomHTML(r, wish) {
  const C = catS(), cols = r.sp.map((s) => {
    const e = C.eq[s.id];
    return `<div class="col">${[0, 1, 2, 3].map((t) => {
      const st = typeState(s, t), img = catThumb(s.fam, t, st === 'own' ? (e && e[0] === t ? e[1] : C.own[s.id][t][0]) : 0), w = sameAct(wish, { k: 'type', s: s.id, t }) ? ICO.spark : '';
      if (st === 'own') { const o = C.own[s.id][t], on = e && e[0] === t;
        return `<div class="cc${on ? ' eq' : ''}"><button type="button" data-act="eq" data-s="${s.id}" data-t="${t}" aria-label="Välj" style="border:0;background:none"><img src="${img}" alt=""></button><div class="ci"><span class="ck">${ICO.check}</span><div class="dots w">${CFAM[s.fam].cols.map((c, k) => `<button type="button" class="dot${o.includes(k) ? '' : ' no'}${on && e[1] === k ? ' on' : ''}" style="background:${c}" data-act="${o.includes(k) ? 'eqc' : 'col'}" data-s="${s.id}" data-t="${t}" data-c="${k}" aria-label="Färg">${o.includes(k) ? '' : `<b>${fmtC(colCost(s, t))}</b>`}</button>`).join('')}</div></div></div>`; }
      if (st === 'buy') return `<button type="button" class="cc buy" data-act="type" data-s="${s.id}" data-t="${t}" aria-label="Köp"><img src="${img}" alt=""><div class="ci">${priceH(typeCost(s, t))}</div>${w}</button>`;
      return `<div class="cc lock"><img src="${img}" alt=""><div class="ci">${lockH(st, t)}</div></div>`;
    }).join('')}</div>`;
  });
  if (r.ex.length) cols.push(`<div class="col">${r.ex.map((f, k) => { const st = exState(r, k), img = thumbOf('f:' + f.id, () => furnModel(f)), w = sameAct(wish, { k: 'ex', id: f.id }) ? ICO.spark : '';
    if (st === 'own') return `<div class="cc"><img src="${img}" alt=""><div class="ci"><span class="ck">${ICO.check}</span></div></div>`;
    if (st === 'buy') return `<button type="button" class="cc buy" data-act="ex" data-id="${f.id}" aria-label="Köp"><img src="${img}" alt=""><div class="ci">${priceH(f.cost)}</div>${w}</button>`;
    return `<div class="cc lock"><img src="${img}" alt=""><div class="ci">${lockH(st)}</div></div>`; }).join('')}</div>`);
  return `<div class="cols" style="grid-template-columns:repeat(${cols.length},minmax(0,1fr))">${cols.join('')}</div>`;
}
function yardHTML(wish) {
  const S = stS(), C = catS();
  const deco = `<div class="col">${DECO_L.map((d, k) => { const own = !!S.deco[d.id], nx = decoNext(), img = thumbOf('d:' + d.id, () => { const g = painterGroup(DECO_B[d.id]); if (d.id === 'lights' || d.id === 'lanterns') g.children[0].position.y = d.id === 'lights' ? -1.0 : 0; return g; }), w = sameAct(wish, { k: 'deco', id: d.id }) ? ICO.spark : '';
    if (own) return `<div class="cc"><img src="${img}" alt=""><div class="ci"><span class="ck">${ICO.check}</span></div></div>`;
    if (nx && nx.id === d.id) return `<button type="button" class="cc buy" data-act="deco" data-id="${d.id}" aria-label="Köp"><img src="${img}" alt=""><div class="ci">${priceH(d.cost)}</div>${w}</button>`;
    return `<div class="cc lock"><img src="${img}" alt=""><div class="ci">${lockH('prev')}</div></div>`; }).join('')}</div>`;
  const paintCol = (isW) => { const P = C.paint, own = isW ? P.ow : P.or, cur = isW ? P.w : P.r, list = isW ? WALLC : ROOFC;
    return `<div class="col">${list.map((c, k) => { const img = thumbOf('paint' + (isW ? 'w' : 'r') + k + ':' + (isW ? P.r : P.w), () => paintModel(isW ? k : P.w, isW ? P.r : k));
      if (own.includes(k)) return `<button type="button" class="cc${cur === k ? ' eq' : ''}" data-act="peq" data-w="${isW ? 1 : 0}" data-c="${k}" aria-label="Välj"><img src="${img}" alt=""><div class="ci"><span class="ck">${ICO.check}</span></div></button>`;
      return `<button type="button" class="cc buy" data-act="paint" data-w="${isW ? 1 : 0}" data-c="${k}" aria-label="Köp"><img src="${img}" alt=""><div class="ci">${priceH(PAINT_COST[isW ? 'w' : 'r'])}</div></button>`; }).join('')}</div>`; };
  return `<div class="cols" style="grid-template-columns:repeat(3,minmax(0,1fr))">${deco}${paintCol(true)}${paintCol(false)}</div>`;
}
catEl.addEventListener('click', (e) => {
  e.stopPropagation(); Snd.init(); const b = e.target.closest('[data-act]'); if (!b) return; const d = b.dataset, C = catS(), act = d.act;
  if (act === 'close') return catClose();
  if (act === 'tab') { CV.tab = d.v; CV.room = null; Snd.play('pop', { gain: 0.3, f: 640 }); return catRender(); }
  if (act === 'back') { CV.room = null; Snd.play('pop', { gain: 0.3, f: 520 }); return catRender(); }
  if (act === 'room') { CV.room = CROOMS.find((r) => r.id === d.v); Snd.play('pop', { gain: 0.35, f: 700 }); return catRender(); }
  if (act === 'size') { catBuy({ k: 'size', n: +d.v }); return catRender(); }
  if (act === 'type') { catBuy({ k: 'type', s: d.s, t: +d.t }); return catRender(); }
  if (act === 'col') { catBuy({ k: 'col', s: d.s, t: +d.t, c: +d.c }); return catRender(); }
  if (act === 'ex') { catBuy({ k: 'ex', id: d.id }); return catRender(); }
  if (act === 'deco') { catBuy({ k: 'deco', id: d.id }); return catRender(); }
  if (act === 'isle') { catBuy({ k: 'isle', id: d.id }); return catRender(); }
  if (act === 'isty') { if (styOf(d.k) !== +d.v) { isleRestyle(d.k, +d.v); Snd.play('pop', { gain: 0.4, f: 700 }); save(); } return catRender(); }
  if (act === 'paint') { catBuy({ k: 'paint', w: d.w === '1', c: +d.c }); return catRender(); }
  if (act === 'eq' || act === 'eqc') { const o = C.own[d.s][+d.t], c = act === 'eqc' ? +d.c : o[o.length - 1]; C.eq[d.s] = [+d.t, c]; if (!stS().pend.includes('c:' + d.s)) applySpot(d.s); Snd.play('pop', { gain: 0.35, f: 760 }); save(); return catRender(); }
  if (act === 'peq') { const P = C.paint; if (d.w === '1') P.w = +d.c; else P.r = +d.c; if (!stS().pend.includes('p:house')) stS().pend.push('p:house'); Snd.play('pop', { gain: 0.35, f: 760 }); save(); return catRender(); }
});

/* ---------- at home: a brush ring by each spot with a choice; standing on it shows the tray ---------- */
const brushTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = 'rgba(255,246,228,0.92)'; x.strokeStyle = '#e0a646'; x.lineWidth = 8; x.beginPath(); x.arc(64, 64, 56, 0, 7); x.fill(); x.stroke();
  x.save(); x.translate(64, 64); x.rotate(-0.8); x.fillStyle = '#9a6542'; x.fillRect(-7, -6, 14, 46); x.fillStyle = '#c9ced6'; x.fillRect(-9, -18, 18, 14); x.fillStyle = '#e9684a'; x.beginPath(); x.moveTo(-10, -18); x.quadraticCurveTo(0, -48, 10, -18); x.fill(); x.restore(); return new T.CanvasTexture(c); })();
const BRUSHR = {};
Object.values(CSPOT).forEach((s) => { const [x, z] = spotRing(s), m = new T.Mesh(new T.CircleGeometry(0.36, 28), new T.MeshBasicMaterial({ map: brushTex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(HX(x), 0.09, HZ(z)); m.visible = false; sc.add(m); BRUSHR[s.id] = { m, x: HX(x), z: HZ(z) }; });
function choices(id) { const o = catS().own[id]; if (!o) return 0; let n = 0; Object.values(o).forEach((cs) => { n += cs.length; }); return n; }
function trayRender() {
  const id = CV.tray; if (!id) { trayEl.hidden = true; return; }
  const s = CSPOT[id], C = catS(), e = C.eq[id], o = C.own[id];
  trayEl.innerHTML = `<div class="row">${[0, 1, 2, 3].map((t) => o[t] ? `<button type="button" class="tp${e[0] === t ? ' on' : ''}" data-t="${t}" aria-label="Välj"><img src="${catThumb(s.fam, t, e[0] === t ? e[1] : o[t][0])}" alt=""></button>` : `<span class="tp no"><img src="${catThumb(s.fam, t, 0)}" alt=""></span>`).join('')}</div>
    <div class="row">${CFAM[s.fam].cols.map((c, k) => o[e[0]].includes(k) ? `<button type="button" class="sw${e[1] === k ? ' on' : ''}" style="background:${c}" data-c="${k}" aria-label="Färg"></button>` : `<span class="sw no" style="background:${c}"></span>`).join('')}</div>`;
  trayEl.hidden = false;
}
trayEl.addEventListener('click', (ev) => {
  ev.stopPropagation(); Snd.init(); const b = ev.target.closest('button'); if (!b || !CV.tray) return; const id = CV.tray, C = catS(), o = C.own[id];
  if (b.dataset.t != null) { const t = +b.dataset.t; C.eq[id] = [t, o[t].includes(C.eq[id][1]) ? C.eq[id][1] : o[t][0]]; } else if (b.dataset.c != null) C.eq[id] = [C.eq[id][0], +b.dataset.c];
  const g = applySpot(id); if (g) { riseIn(g, 0, 0.45, true); const s = CSPOT[id]; confetti(HX(s.x), 0.8, HZ(s.z), 16, 2.6); }
  Snd.play('pop', { gain: 0.4, f: 720 }); Snd.play('sparkle', { gain: 0.3, n: 4 }, 0.04); save(); trayRender();
});

/* ---------- every frame ---------- */
function catStep(dt) {
  if (!stS()) return; if (!catReady) catInit();
  catSync();
  const home = inHouse && !inBarn && !inStore;
  /* the catalog pad in the store */
  const cs = STATIONS_S.find((s) => s.kind === 'cat');
  if (inStore && cs) { const on = Math.hypot(pip.position.x - cs.padX, pip.position.z - cs.padZ) < 0.62, still = Math.hypot(target.x - pip.position.x, target.z - pip.position.z) < 0.15;
    if (!on) CV.wait = false; if (on && still && !CV.wait && !CV.open && doorT <= 0) catOpen(); }
  if (CV.open) { if (!inStore) catClose(); else { target.copy(pip.position); } }
  /* rings and the tray at home */
  let onId = null;
  Object.keys(BRUSHR).forEach((id) => { const R = BRUSHR[id], s = CSPOT[id], show = home && roomOpen(s.room) && choices(id) > 1 && !stS().pend.includes('c:' + id); R.m.visible = show;
    if (show) { R.m.scale.setScalar(1 + (reduced ? 0 : Math.sin(time * 3 + R.x) * 0.04)); if (Math.hypot(pip.position.x - R.x, pip.position.z - R.z) < 0.42) onId = id; } });
  if (onId !== CV.tray) { CV.tray = onId; if (onId) { Snd.play('pop', { gain: 0.3, f: 820 }); } trayRender(); }
}
const catTest = () => ({ open: () => catOpen(), close: () => catClose(), room: (id) => { CV.room = CROOMS.find((r) => r.id === id) || null; catRender(); }, tab: (v) => { CV.tab = v; CV.room = null; catRender(); }, buy: (a) => catBuy(a), offers: () => catOffers().map((o) => o.id + '@' + o.cost), stars: (id) => roomStars(CROOMS.find((r) => r.id === id)), cat: () => JSON.stringify(catS()), tray: () => CV.tray, rings: () => Object.keys(BRUSHR).filter((k) => BRUSHR[k].m.visible) });
if (window.__farmTest) window.__cat = catTest;

/* ---------- start over: a button in the settings sheet; hold it until the ring is full, then the farm starts fresh ----------
   Only the game's progress is wiped; how Pip looks and the device settings (sound, steering) stay. */
{
  const top = document.querySelector('#menu .sheetTop'), close = document.getElementById('menuClose');
  if (top) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'round'; b.id = 'restartBtn'; b.setAttribute('aria-label', 'Börja om från början (håll inne)');
    b.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="none" stroke="#e6d9bd" stroke-width="4"/><circle class="hold" cx="24" cy="24" r="21" fill="none" stroke="#e9684a" stroke-width="4" stroke-linecap="round" stroke-dasharray="0 999" transform="rotate(-90 24 24)"/><path d="M33 17 A11 11 0 1 0 35 26" fill="none" stroke="#22303c" stroke-width="4" stroke-linecap="round"/><path d="M28 12 L34 17 L27 21" fill="none" stroke="#22303c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    top.insertBefore(b, close || null);
    const arc = b.querySelector('.hold'), L = 2 * Math.PI * 21, HOLD = 2.0; let t0 = 0, raf = 0, done = false;
    const draw = (f) => arc.setAttribute('stroke-dasharray', (f * L).toFixed(1) + ' 999');
    const stop = () => { if (done) return; cancelAnimationFrame(raf); t0 = 0; draw(0); };
    const tick = () => { if (!t0) return; const f = Math.min(1, (performance.now() - t0) / 1000 / HOLD); draw(f); if (f >= 1) return restart(); if (Math.round(f * 10) !== Math.round((f - 0.016) * 10)) Snd.play('tick', { gain: 0.25, f: 600 + f * 900 }); raf = requestAnimationFrame(tick); };
    const restart = () => {
      done = true; Snd.play('whoosh', { gain: 0.4 });
      /* the farm is wiped in place, so every later save (the page's own save on the way out included) writes the fresh farm */
      const keep = Object.assign(fresh(), { sound: state.sound, ctrl: state.ctrl });
      Object.keys(state).forEach((k) => { delete state[k]; }); Object.assign(state, keep); storeReady = true;
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
      fadeEl.style.opacity = '1'; setTimeout(() => location.reload(), 450);
    };
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); Snd.init(); if (done) return; t0 = performance.now(); raf = requestAnimationFrame(tick); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, stop));
    b.addEventListener('click', (e) => { e.stopPropagation(); if (!done && !t0) { Snd.play('tock', { gain: 0.3, f: 420 }); b.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(10deg)' }, { transform: 'rotate(0)' }], { duration: 300 }); } });
  }
}
/* the joystick also lets go when the browser takes the finger away (iPad gestures), so Pip never walks on by itself */
/* iPad: keep Safari from treating a swipe on the farm as a page scroll, which held back the finger moves until the scroll gesture ended */
{ const w = wrap; if (w) { const stopT = (e) => { if (e.cancelable) e.preventDefault(); }; w.addEventListener('touchstart', stopT, { passive: false }); w.addEventListener('touchmove', stopT, { passive: false }); }
  try { document.documentElement.style.overscrollBehavior = 'none'; document.body.style.overscrollBehavior = 'none'; } catch (e) {} }
{ const w = wrap; if (w) w.addEventListener('lostpointercapture', () => { if (joy) { joy = null; holding = false; if (joyEl) joyEl.hidden = true; target.copy(pip.position); } }); }
