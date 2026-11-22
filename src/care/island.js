/* ---------- the island grows too: its landmarks and pretty things are bought in the shop's island tab ----------
   A new game starts with a bare square, the market counter and a basic farm. The landmarks come in sets (ISETS), each bought
   at once, in four tiers that open with the house: tier 0 at once, tier 1 with the cottage, tier 2 with the kitchen, tier 3
   with the east wing. The kitchen garden is its own buy. Style packs (IPACKS) unlock new looks for benches, lamps, hedges
   and the planter; Pip picks the look for each kind in the shop or by the thing itself.
   Nothing is rebuilt: at load every merged mesh is split so each landmark's triangles sit in their own mesh. */
const ILOTS = [
  /* lamps first: they stand close to other pieces, and a spot belongs to the first lot that covers it */
  { id: 'lampSq', tier: 0, cost: 60, at: LAMP_AT.slice(0, 4).map(([x, z]) => [x, z, 0.5]) },
  { id: 'lampRing', tier: 1, cost: 90, at: LAMP_AT.slice(4, 10).map(([x, z]) => [x, z, 0.5]) },
  { id: 'lampSt', tier: 2, cost: 160, at: LAMP_AT.slice(10, 18).map(([x, z]) => [x, z, 0.5]) },
  { id: 'bench', tier: 0, cost: 25, at: [[2.75, 2.05, 0.85], [-2.75, -2.05, 0.85]] },
  { id: 'planter', tier: 0, cost: 35, at: [[-2.35, 2.6, 0.8]] },
  { id: 'fountain', tier: 1, cost: 150, at: [[0, 0, 1.75]], obj: () => [fountain.water].concat(fountain.drops) },
  { id: 'hedge', tier: 1, cost: 110, at: [[-1.5, 5.55, 0.32, 1.3], [1.5, 5.55, 0.32, 1.3], [-1.5, 10.0, 0.32, 1.65], [1.5, 10.0, 0.32, 1.65]] },
  { id: 'hives', tier: 1, cost: 140, at: [[8.75, -6.95, 0.55], [11.25, -6.95, 0.55], [10.0, -6.85, 0.6]] },
  { id: 'garden', tier: 0, cost: 60, at: [[10.0, -4.8, 2.0, 1.42]], obj: () => beds.map((b) => b.g).concat(beds.map((b) => b.sp)) },
  { id: 'pond', tier: 2, cost: 300, at: [[-4.4, 10.9, 2.45]], obj: () => [pond.water].concat(pond.ducks) },
  { id: 'mill', tier: 2, cost: 400, at: [[5.7, -12.6, 1.5]] },
  { id: 'bunting', tier: 2, cost: 220, at: [[15.2, 1.5, 6.4, 0.22], [15.2, -1.5, 6.4, 0.22]], minY: 0.3 },
  { id: 'hut', tier: 3, cost: 500, at: [[2.9, 11.7, 1.25]] },
  { id: 'light', tier: 3, cost: 900, at: [[12.8, 12.4, 1.45]], obj: () => [beam.g] }
];
/* what is bought together */
const ISETS = [
  { id: 's1', tier: 0, cost: 120, lots: ['bench', 'planter', 'lampSq'] },
  { id: 'sg', tier: 0, cost: 60, lots: ['garden'] },
  { id: 's2', tier: 1, cost: 450, lots: ['fountain', 'hedge', 'lampRing', 'hives'] },
  { id: 's3', tier: 2, cost: 1000, lots: ['pond', 'mill', 'lampSt', 'bunting'] },
  { id: 's4', tier: 3, cost: 1300, lots: ['light', 'hut'] }
];
/* new looks: each pack opens one more style for every kind */
const IPACKS = [{ id: 'p1', tier: 1, cost: 250, sty: 1 }, { id: 'p2', tier: 2, cost: 600, sty: 2 }];
const IKINDS = { bench: ['bench'], lamp: ['lampSq', 'lampRing', 'lampSt'], hedge: ['hedge'], planter: ['planter'] };
const ISLE_BY = {}; ILOTS.forEach((l) => { ISLE_BY[l.id] = l; l.meshes = []; l.objs = []; l.solids = []; l.styM = []; l.c = [l.at[0][0], l.at[0][1]]; });
const ISET_BY = {}; ISETS.forEach((t) => { ISET_BY[t.id] = t; t.lots.forEach((id) => { ISLE_BY[id].set = t; }); });
Object.keys(IKINDS).forEach((k) => IKINDS[k].forEach((id) => { ISLE_BY[id].kind = k; }));
const ISLE_KEEP = [[KENNEL.x, KENNEL.z, 0.9]]; /* never cut into these */
/* a region is [x, z, r] (a circle) or [x, z, hw, hd] (a box) */
const inReg = (g, x, z) => g.length === 3 ? Math.hypot(x - g[0], z - g[1]) < g[2] : Math.abs(x - g[0]) < g[2] && Math.abs(z - g[1]) < g[3];
function lotAt(x, y, z, flat) {
  if (ISLE_KEEP.some(([a, b, r]) => Math.hypot(x - a, z - b) < r)) return null;
  for (const l of ILOTS) { if (!flat && y < (l.minY || 0.06)) continue; for (let k = 0; k < l.at.length; k++) if (inReg(l.at[k], x, z)) return [l, k]; }
  return null;
}
const isleS = () => { const S = stS(); if (!S) return null; if (!S.isle) { const old = S.size >= 2 || (state.total || 0) > 300; S.isle = {}; if (old) ILOTS.forEach((l) => { S.isle[l.id] = 1; }); } return S.isle; };
const isleOpen = (l) => l.tier <= (stS() ? stS().size : 0);
const isleX = () => { const S = stS(); if (!S) return { pk: {}, sty: {} }; if (!S.isleX) S.isleX = { pk: {}, sty: {} }; return S.isleX; };
const setOwn = (t) => t.lots.every((id) => isleOwn(ISLE_BY[id]));
const stylesOf = () => [0].concat(IPACKS.filter((p) => isleX().pk[p.id]).map((p) => p.sty));
const styOf = (k) => isleX().sty[k] || 0;
const gardenOn = () => { const l = ISLE_BY.garden; return !l || !stS() || (isleOwn(l) && !stS().pend.includes('i:garden')); };
const isleOwn = (l) => !!(isleS() || {})[l.id];
function isleSplit() {
  sc.children.slice().forEach((m) => {
    if (!m.isMesh || m.position.lengthSq() > 1e-6 || m.geometry.index) return;
    const at = Object.keys(m.geometry.attributes).sort().join(','), blob = typeof blobMat !== 'undefined' && m.material === blobMat; if (at !== 'color,normal,position' && !(blob && at === 'position,uv')) return;
    const A = blob ? ['position', 'uv'] : ['position', 'normal', 'color'], S = A.map((k) => m.geometry.attributes[k]), p = S[0], keep = A.map(() => []), cut = new Map(); let any = false;
    for (let i = 0; i < p.count; i += 3) {
      const hit = lotAt((p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3, blob);
      let D = keep; if (hit) { any = true; const key = hit[0].id + ':' + hit[1]; if (!cut.has(key)) cut.set(key, { l: hit[0], k: hit[1], D: A.map(() => []) }); D = cut.get(key).D; }
      for (let j = i; j < i + 3; j++) S.forEach((s, q) => { for (let e = 0; e < s.itemSize; e++) D[q].push(s.array[j * s.itemSize + e]); });
    }
    if (!any) return;
    const mk = (D) => { const g = new T.BufferGeometry(); A.forEach((k, q) => g.setAttribute(k, new T.Float32BufferAttribute(D[q], S[q].itemSize))); g.computeBoundingSphere(); return g; };
    m.geometry = mk(keep);
    cut.forEach(({ l, k, D }) => { const r = new T.Mesh(mk(D), m.material); r.castShadow = m.castShadow; r.receiveShadow = m.receiveShadow; r.renderOrder = m.renderOrder; r.userData.reg = k; sc.add(r); l.meshes.push(r); });
  });
  /* separate pieces standing in a lot: sails, caps, glows, the fountain top */
  sc.children.forEach((o) => { if (o.position.lengthSq() < 1e-6 || o === pip || o.isLight) return; if (!o.isSprite && !o.userData.cap && o.position.y < 0.25) return; const h = lotAt(o.position.x, o.userData.cap ? 1 : o.position.y, o.position.z); if (h && !h[0].objs.includes(o)) { o.userData.reg = h[1]; h[0].objs.push(o); } });
  /* ground shade: painted now for everything outside the lots, and for each lot once it is built */
  ILOTS.forEach((l) => { l.shade = []; });
  groundShade(COZY_SHADE.filter((e) => { const h = lotAt(e[0], 1, e[1]); if (h) h[0].shade.push(e); return !h; }));
  ILOTS.forEach((l) => { if (l.obj) l.obj().map((o) => (o && !o.isObject3D && o.g ? o.g : o)).filter((o) => { if (!o) console.error('isle: missing piece in ' + l.id); return !!o; }).forEach((o) => { if (!l.objs.includes(o)) { o.userData.reg = 0; l.objs.push(o); } }); });
  /* what Pip bumps into */
  for (let i = SOLIDS.length - 1; i >= 0; i--) { const s = SOLIDS[i], h = lotAt(s.x, 1, s.z); if (h) h[0].solids.push(s); }
}
function isleShow(l, on) {
  if (on && !l.shaded && l.shade) { l.shaded = true; groundShade(l.shade); }
  const st = l.kind ? styOf(l.kind) : 0, orig = (o) => on && (st === 0 || o.isSprite || o.material === blobMat);
  l.shown = on; l.meshes.forEach((m) => { m.visible = orig(m); }); l.objs.forEach((o) => { o.visible = orig(o); o.userData.off = !o.visible; });
  l.styM.forEach((m) => { m.visible = on; });
  l.solids.forEach((s) => { const i = SOLIDS.indexOf(s); if (on && i < 0) SOLIDS.push(s); if (!on && i >= 0) SOLIDS.splice(i, 1); });
}
/* ---------- the other looks ---------- */
const STY = {
  bench: [null, (P) => { const ST = '#c9c2b4'; P(jit(box(1.25, 0.13, 0.46), 0.015, 2101), ST, 2101, 0, 0.42, 0); [-0.42, 0.42].forEach((x, k) => P(jit(box(0.24, 0.36, 0.4), 0.015, 2102 + k), '#a9a294', 2102 + k, x, 0.18, 0));
      P(jit(box(1.2, 0.34, 0.1), 0.015, 2104), ST, 2104, 0, 0.66, -0.2, { rx: -0.12 }); [[-0.5, 0.5], [0.45, 0.72]].forEach(([x, y], k) => P(ico(0.09, 0, 2105 + k), '#6a9a4c', 2105 + k, x, y, -0.16)); },
    (P) => { const WD = '#a8714d', END = '#e3c08e'; P(cyl(0.19, 0.19, 1.3, 10), WD, 2110, 0, 0.4, 0, { rz: Math.PI / 2 }); [-1, 1].forEach((q) => P(cyl(0.17, 0.17, 0.02, 10), END, 2111, q * 0.66, 0.4, 0, { rz: Math.PI / 2 }));
      [-0.42, 0.42].forEach((x, k) => P(cyl(0.15, 0.18, 0.26, 8), '#7a5236', 2112 + k, x, 0.13, 0)); P(cyl(0.11, 0.11, 1.2, 8), WD, 2114, 0, 0.78, -0.2, { rz: Math.PI / 2 }); [-0.42, 0.42].forEach((x) => P(box(0.08, 0.4, 0.08), '#7a5236', 2115, x, 0.6, -0.2)); }],
  lamp: [null, (P) => { P(cyl(0.2, 0.24, 0.16, 8), '#b8ac9a', 2120, 0, 0.08, 0); P(box(0.13, 1.75, 0.13), '#7a5236', 2121, 0, 0.95, 0); P(box(0.55, 0.09, 0.09), '#7a5236', 2122, 0.22, 1.76, 0);
      P(box(0.03, 0.14, 0.03), '#3a3f48', 2123, 0.42, 1.66, 0); P(box(0.24, 0.3, 0.24), '#ffd98a', 2124, 0.42, 1.44, 0); P(cyl(0.0, 0.2, 0.14, 4), '#3a3f48', 2125, 0.42, 1.65, 0, { ry: Math.PI / 4 }); P(box(0.27, 0.04, 0.27), '#3a3f48', 2126, 0.42, 1.28, 0); },
    (P) => { P(cyl(0.12, 0.18, 1.25, 10), '#f6ecd6', 2130, 0, 0.62, 0); P(new T.SphereGeometry(0.5, 16, 8, 0, 6.283, 0, 1.57).scale(1, 0.7, 1), '#e0453a', 2131, 0, 1.2, 0); P(cyl(0.46, 0.46, 0.04, 16), '#ffe6a0', 2132, 0, 1.2, 0);
      for (let k = 0; k < 7; k++) { const a = k * 0.9, r = k ? 0.33 : 0, y = k ? 1.38 : 1.55; P(new T.SphereGeometry(k ? 0.06 : 0.08, 6, 4), '#fffaf0', 2133, Math.cos(a) * r, y, Math.sin(a) * r); } }],
  hedge: [null, (P, g) => { const L = g[3] * 2, n = Math.max(2, Math.round(L / 0.62)); for (let i = 0; i < n; i++) { const z = -L / 2 + (i + 0.5) * L / n; P(cyl(0.2, 0.16, 0.26, 8), '#c8734a', 2140, 0, 0.13, z); P(ico(0.27, 1, 2141 + i), '#4f8a4e', 2141 + i, 0, 0.5, z); } },
    (P, g) => { const L = g[3] * 2, C = ['#f6b8c8', '#f2c14a', '#fffbf4', '#e9684a', '#b58ad6']; P(jit(box(0.58, 0.55, L, 2, 2, Math.max(2, Math.round(L * 3))), 0.03, 2150), '#5d9160', 2150, 0, 0.28, 0);
      for (let i = 0, n = Math.round(L * 7); i < n; i++) { const z = -L / 2 + 0.1 + hash(i, 2151) * (L - 0.2), sd = hash(i, 2152) < 0.5 ? -1 : 1, top = hash(i, 2153) < 0.45; P(ico(0.06, 0, 2154 + i), C[i % 5], 2154, top ? (hash(i, 2155) - 0.5) * 0.45 : sd * 0.3, top ? 0.57 : 0.15 + hash(i, 2156) * 0.35, z); } }],
  planter: [null, (P) => { [[-0.36, 0.0, 1], [0.0, 0.06, 1.25], [0.36, 0.0, 0.9]].forEach(([x, z, s], k) => { P(cyl(0.2 * s, 0.14 * s, 0.34 * s, 10), '#c8734a', 2160 + k, x, 0.17 * s, z); P(cyl(0.21 * s, 0.21 * s, 0.05, 10), '#b9653f', 2163, x, 0.34 * s, z);
      P(ico(0.18 * s, 1, 2164 + k), '#5d9160', 2164 + k, x, 0.42 * s + 0.08, z); for (let j = 0; j < 4; j++) P(ico(0.05, 0, 2167 + j), ['#f6b8c8', '#e9684a', '#f2c14a', '#fffbf4'][(j + k) % 4], 2167, x + Math.cos(j * 1.6) * 0.12 * s, 0.5 * s + 0.12, z + Math.sin(j * 1.6) * 0.12 * s); }); },
    (P) => { P(cyl(0.22, 0.26, 0.12, 10), '#b8ac9a', 2170, 0, 0.06, 0); P(cyl(0.08, 0.14, 0.3, 10), '#c9c2b4', 2171, 0, 0.27, 0); P(cyl(0.34, 0.16, 0.3, 12), '#c9c2b4', 2172, 0, 0.55, 0);
      P(ico(0.4, 1, 2173), '#f6b8c8', 2173, 0, 0.92, 0); for (let j = 0; j < 9; j++) P(ico(0.06, 0, 2174 + j), j % 2 ? '#fffbf4' : '#e9684a', 2174, Math.cos(j * 0.7) * 0.36, 0.9 + Math.sin(j * 1.3) * 0.2, Math.sin(j * 0.7) * 0.36); }]
};
function styModel(k, st, g) { const f = STY[k][st]; return painterGroup((P) => f(P, g)); }
function isleStyle(l, anim) {
  l.styM.forEach((m) => sc.remove(m)); l.styM = [];
  const st = styOf(l.kind);
  if (st > 0) l.at.forEach((g) => { const m = styModel(l.kind, st, g); m.position.set(g[0], 0, g[1]); if (l.kind === 'bench' || l.kind === 'planter') m.rotation.y = faceTo(g[0], g[1], 0, 0); sc.add(m); l.styM.push(m); });
  isleShow(l, !!l.shown);
  if (anim && l.shown) (st ? l.styM : l.meshes.filter((m) => m.material !== blobMat)).forEach((m, k) => riseIn(m, 0.05 + k * 0.06, 0.6));
}
function isleRestyle(kind, st) { isleX().sty[kind] = st; IKINDS[kind].forEach((id) => isleStyle(ISLE_BY[id], true)); }
/* the shop picture: the first spot of the lot, with its pieces */
function isleModel(l) {
  const g = new T.Group(), c = l.at[0];
  l.meshes.filter((m) => m.userData.reg === 0).forEach((m) => { const q = new T.Mesh(m.geometry.clone().translate(-c[0], 0, -c[1]), MAT); g.add(q); });
  l.objs.filter((o) => o.userData.reg === 0 && (o.isMesh || o.isGroup) && o !== beam.g && !(pond.ducks || []).some((d) => d === o || d.g === o) && !(fountain.drops || []).includes(o)).forEach((o) => { const q = o.clone(true); q.visible = true; q.position.x -= c[0]; q.position.z -= c[1]; g.add(q); });
  return g;
}
const isleThumb = (l) => thumbOf('i:' + l.id, () => isleModel(l));
/* a set's picture: its pieces side by side */
function setModel(t) { const g = new T.Group(); let x = 0; t.lots.forEach((id, k) => { const m = isleModel(ISLE_BY[id]); const b = new T.Box3().setFromObject(m), ok = isFinite(b.min.x) && isFinite(b.max.x), w = ok ? Math.max(0.8, b.max.x - b.min.x) : 1.5; m.position.x = x - (ok ? b.min.x : -0.75); x += w + 0.4; g.add(m); }); g.children.forEach((m) => { m.position.x -= x / 2; }); return g; }
const setThumb = (t) => thumbOf('is:' + t.id, () => setModel(t));
const kindModel = (k, st) => { if (!st) return isleModel(ISLE_BY[IKINDS[k][0]]); const l = ISLE_BY[IKINDS[k][0]]; return styModel(k, st, l.at[0]); };
const styThumb = (k, st) => thumbOf('ik:' + k + st, () => kindModel(k, st));
function packModel(p) { const g = new T.Group(); ['bench', 'lamp', 'hedge', 'planter'].forEach((k, i) => { const m = kindModel(k, p.sty); m.position.set((i - 1.5) * 1.3, 0, 0); g.add(m); }); return g; }
const packThumb = (p) => thumbOf('ip:' + p.id, () => packModel(p));
/* buying: through the catalog (catBuy kind 'isle') */
const packOpen = (p) => p.tier <= (stS() ? stS().size : 0);
function isleNext() { let best = null; ISETS.forEach((t) => { if (!setOwn(t) && t.tier <= stS().size && (!best || t.cost < best.cost)) best = t; });
  IPACKS.forEach((p) => { if (!isleX().pk[p.id] && packOpen(p) && (!best || p.cost < best.cost)) best = p; }); return best; }
const isleNextModel = (o) => (o.sty ? packModel(o) : setModel(o));
function islePrep(a) {
  const S = stS(), t = ISET_BY[a.id], p = IPACKS.find((q) => q.id === a.id);
  if (t) { if (setOwn(t) || t.tier > S.size) return null;
    return { cost: t.cost, pic: setThumb(t), go: () => { t.lots.forEach((id) => { if (!isleS()[id]) { isleS()[id] = 1; S.pend.push('i:' + id); } }); } }; }
  if (p) { if (isleX().pk[p.id] || !packOpen(p)) return null;
    return { cost: p.cost, pic: packThumb(p), go: () => { isleX().pk[p.id] = 1; Object.keys(IKINDS).forEach((k) => isleRestyle(k, p.sty)); } }; }
  return null;
}
function isleGoal() {
  if (inHouse) return null; const p = stS() && stS().pend.find((q) => q.startsWith('i:')); if (!p) return null;
  const l = ISLE_BY[p.slice(2)]; return l ? [l.c[0], l.c[1] + (l.at[0][2] || 1) + 0.6] : null;
}
/* the catalog page: four columns, one per tier (sets, the garden and style packs), and the looks to pick below */
function isleHTML(wish) {
  const S = stS(), X = isleX(), tile = (id, img, own, open, cost) => {
    const w = wish && wish.k === 'isle' && wish.id === id ? ICO.spark : '';
    if (own) return `<div class="cc"><img src="${img}" alt=""><div class="ci"><span class="ck">${ICO.check}</span></div></div>`;
    if (open) return `<button type="button" class="cc buy" data-act="isle" data-id="${id}" aria-label="Köp"><img src="${img}" alt=""><div class="ci">${priceH(cost)}</div>${w}</button>`;
    return `<div class="cc lock"><img src="${img}" alt=""><div class="ci">${lockH('house')}</div></div>`; };
  const cols = [0, 1, 2, 3].map((tr) => `<div class="col">${ISETS.filter((t) => t.tier === tr).map((t) => tile(t.id, setThumb(t), setOwn(t), t.tier <= S.size, t.cost)).join('')}${IPACKS.filter((p) => p.tier === tr).map((p) => tile(p.id, packThumb(p), !!X.pk[p.id], packOpen(p), p.cost)).join('')}</div>`);
  const have = stylesOf(), looks = Object.keys(IKINDS).map((k) => `<div class="col" style="flex-direction:row;flex-wrap:nowrap;justify-content:center;gap:4px;overflow:visible">${[0, 1, 2].map((st) => {
    const img = styThumb(k, st), cur = styOf(k) === st;
    if (have.includes(st)) return `<button type="button" class="cc${cur ? ' eq' : ''}" data-act="isty" data-k="${k}" data-v="${st}" aria-label="Välj" style="min-height:0;padding:3px;border-width:3px"><img src="${img}" alt="" style="width:40px;height:40px"></button>`;
    return `<div class="cc lock" style="min-height:0;padding:3px;border-width:3px"><img src="${img}" alt="" style="width:40px;height:40px"></div>`; }).join('')}</div>`);
  return `<div style="display:flex;flex-direction:column;gap:12px;height:100%;min-height:0"><div class="cols" style="grid-template-columns:repeat(4,minmax(0,1fr));flex:1;min-height:0">${cols.join('')}</div>
    <div class="cols" style="grid-template-columns:repeat(4,minmax(0,1fr));height:auto;flex:none">${looks.join('')}</div></div>`;
}
/* every frame (after the town has moved its windmill, lighthouse and ducks) */
let isleReady = false;
function isleLate() {
  const S = stS(), own = isleS(); if (!S || !own) return;
  if (!isleReady) { isleReady = true; isleSplit(); ILOTS.forEach((l) => { if (l.kind && styOf(l.kind)) isleStyle(l); }); ILOTS.forEach((l) => isleShow(l, !!own[l.id] && !S.pend.includes('i:' + l.id))); }
  ILOTS.forEach((l) => {
    const pend = S.pend.includes('i:' + l.id), want = !!own[l.id] && !pend;
    if (pend && !inHouse && !BUILD && Math.hypot(pip.position.x - l.c[0], pip.position.z - l.c[1]) < 9) {
      S.pend.splice(S.pend.indexOf('i:' + l.id), 1); isleShow(l, true);
      l.meshes.concat(l.objs.filter((o) => o.isMesh || o.isGroup), l.styM).forEach((m, k) => riseIn(m, 0.1 + (m.userData.reg || 0) * 0.15, 0.9));
      l.at.forEach((g, k) => setTimeout(() => confetti(g[0], 1.0, g[1], 40, 3), 350 + k * 150)); setTimeout(() => fanfare(l.tier >= 2), 500); save(); return;
    }
    if (l.shown !== want) isleShow(l, want);
    if (!want) l.objs.forEach((o) => { if (o.visible) o.visible = false; });
  });
}
{ const t0 = townStep; townStep = function (dt) { t0(dt); isleLate(); }; }
if (window.__farmTest) window.__isle = () => ({ sc, own: JSON.stringify(isleS()), lots: ILOTS.map((l) => l.id + ':' + l.meshes.length + '/' + l.objs.length + '/' + l.solids.length + (l.shown ? '+' : '-')).join(' '), goal: isleGoal(), buy: (id) => catBuy({ k: 'isle', id }), x: () => JSON.stringify(isleX()), fth: (id) => thumbOf('dbg' + Math.random(), () => setModel(ISET_BY[id])).length, sb: (id) => { const g = setModel(ISET_BY[id]); const b = new T.Box3().setFromObject(g); return [b.min.x, b.max.x, b.min.y, b.max.y, b.min.z, b.max.z].map((v) => v.toFixed(1)).join(',') + ' ' + g.children.map((m) => m.position.x.toFixed(1)).join(','); }, tl: () => ILOTS.map((l) => l.id + ':' + isleThumb(l).length).join(' ') + ' | ' + ISETS.map((t) => t.id + ':' + setThumb(t).length).join(' '), bb: () => ILOTS.map((l) => { const b = new T.Box3().setFromObject(isleModel(l)); return l.id + ':' + [b.min.x, b.max.x, b.min.y, b.max.y].map((v) => v.toFixed(1)).join(','); }).join(' '), sty: (k, v) => isleRestyle(k, v) });
