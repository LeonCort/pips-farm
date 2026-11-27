/* a pile is a list of item meshes placed by a layout function */
function Pile(parent, layout) { this.items = []; this.parent = parent; this.layout = layout; }
Pile.prototype.add = function (m) { this.parent.add(m); this.items.push(m); this.place(); };
Pile.prototype.take = function (type) { for (let i = this.items.length - 1; i >= 0; i--) if (!type || this.items[i].userData.type === type) { const m = this.items.splice(i, 1)[0]; this.place(); return m; } return null; };
Pile.prototype.count = function (type) { return type ? this.items.filter((m) => m.userData.type === type).length : this.items.length; };
Pile.prototype.place = function () { this.items.forEach((m, i) => { const p = this.layout(i, m); m.position.set(p[0], p[1], p[2]); m.rotation.set(0, p[3] || 0, 0); }); };

/* flying items: a mesh arcs from one place to another, then a callback lands it */
const flyers = [];
function fly(m, toFn, done, dur) { const from = new T.Vector3(); m.getWorldPosition(from); sc.add(m); m.position.copy(from); m.rotation.set(0, 0, 0); flyers.push({ m, from, toFn, done, t: 0, dur: dur || 0.28 }); }
const tmpV = new T.Vector3();

/* ---------- Pip: a person the child dresses up (shared by both games) ---------- */
const pip = new T.Group(); pip.position.set(0.5, 0, 2.2); sc.add(pip);
const pb = new T.Group(); pip.add(pb); pb.scale.setScalar(0.8);
const AVO = {
  skin: ['#f6d3b8', '#e8b48f', '#c98b62', '#9a6440', '#6b4430'],
  hs: ['kort', 'lang', 'tofsar', 'knut', 'lockar', 'keps', 'mossa'],
  hc: ['#3a2a22', '#7a4a2a', '#e0b45a', '#c4562e', '#22232a', '#d9d4cc', '#e889b5', '#6aa0e0'],
  ts: ['jacka', 'randig', 'luva'],
  sh: ['#e9684a', '#1f6a80', '#e0a646', '#3f7d62', '#f0907a', '#7b5ea7', '#fff6e4', '#22303c'],
  bs: ['byxor', 'shorts', 'kjol'],
  bc: ['#2e4a7a', '#7d5e4e', '#22303c', '#3f7d62', '#e889b5', '#e0a646', '#d9443a'],
  ss: ['skor', 'stovlar', 'sandaler'],
  sc: ['#3a3433', '#e9684a', '#1f6a80', '#f2c14a', '#3f7d62', '#e889b5', '#fff6e4']
};
const AV_KEY = 'pips-avatar';
let av = null, avNew = false;
try { av = JSON.parse(localStorage.getItem(AV_KEY) || 'null'); } catch (e) {}
if (!av || typeof av !== 'object') { av = { skin: 1, hs: 6, hc: 1, sh: 0, bs: 0, bc: 0, ss: 0, sc: 0 }; avNew = true; }
for (const k in AVO) if (!(av[k] >= 0 && av[k] < AVO[k].length)) av[k] = 0;
const eyes = [], limbs = [];
const riding = () => typeof mount !== 'undefined' && !!mount;
function buildAvatar() {
  while (pb.children.length) pb.remove(pb.children[0]); eyes.length = 0; limbs.length = 0;
  const ts = AVO.ts[av.ts], shoe = AVO.sc[av.sc], ss = AVO.ss[av.ss], skin = AVO.skin[av.skin], hc = AVO.hc[av.hc], sh = AVO.sh[av.sh], bc = AVO.bc[av.bc], bs = AVO.bs[av.bs], hs = AVO.hs[av.hs];
  let g;
  /* legs swing from the hip */
  [-0.11, 0.11].forEach((x, k) => {
    const leg = new T.Group(); leg.position.set(x, 0.64, 0); pb.add(leg); limbs.push({ g: leg, s: k ? 1 : -1 });
    g = new T.CylinderGeometry(0.08, 0.075, 0.3, 10); g.translate(0, -0.15, 0); part(fac(g, bs === 'kjol' ? skin : bc, 20 + k), leg);
    g = new T.CylinderGeometry(0.074, 0.07, 0.26, 10); g.translate(0, -0.43, 0); part(fac(g, bs === 'byxor' ? bc : skin, 22 + k), leg);
    if (ss === 'stovlar') { g = new T.BoxGeometry(0.17, 0.24, 0.19); g.translate(0, -0.48, 0); part(fac(g, shoe, 24 + k), leg); }
    if (ss === 'sandaler') { g = new T.BoxGeometry(0.17, 0.04, 0.25); g.translate(0, -0.615, 0.04); part(fac(g, shoe, 24 + k), leg); g = new T.BoxGeometry(0.175, 0.03, 0.05); g.translate(0, -0.57, 0.08); part(fac(g, shoe, 26 + k), leg); g = new T.BoxGeometry(0.15, 0.05, 0.2); g.translate(0, -0.575, 0.05); part(fac(g, skin, 28 + k), leg); }
    else { g = new T.BoxGeometry(0.17, 0.09, 0.25); g.translate(0, -0.59, 0.04); part(fac(g, shoe, 24 + k), leg); g = new T.BoxGeometry(0.175, 0.02, 0.26); g.translate(0, -0.635, 0.04); part(fac(g, ss === 'skor' ? PAL.paper : '#2a2626', 30 + k), leg); }
  });
  if (bs === 'kjol') { g = new T.CylinderGeometry(0.2, 0.34, 0.34, 8); part(fac(jit(g, 0.01, 5), bc, 26), pb, 0, 0.62, 0); }
  else { g = new T.BoxGeometry(0.42, 0.14, 0.26); part(fac(g, bc, 26), pb, 0, 0.68, 0); }
  /* a soft padded jacket: round body, collar, zip and a hem band */
  g = new T.CylinderGeometry(0.2, 0.235, 0.46, 14, 3); g.scale(1, 1, 0.72); part(fac(jit(g, 0.006, 3), (cx, cy, cz, i) => shadeY(sh, cy, -0.3, 0.25, i, 0.3)), pb, 0, 0.92, 0);
  g = new T.TorusGeometry(0.15, 0.045, 8, 16); g.rotateX(Math.PI / 2); g.scale(1, 1, 0.8); part(fac(g, (cx, cy, cz, i) => tone(sh, i, 0.3).multiplyScalar(0.8)), pb, 0, 1.15, 0);
  g = new T.CylinderGeometry(0.24, 0.24, 0.07, 14); g.scale(1, 1, 0.74); part(fac(g, (cx, cy, cz, i) => tone(sh, i, 0.3).multiplyScalar(0.82)), pb, 0, 0.71, 0);
  if (ts === 'jacka') { g = new T.BoxGeometry(0.025, 0.4, 0.02); part(fac(g, '#e8e2d8'), pb, 0, 0.93, 0.172, true); }
  /* a striped jumper: light bands hug the round body */
  const band = new T.Color(sh).lerp(new T.Color('#fff6e4'), 0.72).getStyle();
  if (ts === 'randig') [0.8, 0.92, 1.04].forEach((y, k) => { const r = 0.2 + 0.035 * (0.23 - (y - 0.92)) / 0.46 + 0.012; g = new T.CylinderGeometry(r - 0.004, r + 0.004, 0.055, 14); g.scale(1, 1, 0.74); part(fac(g, (cx, cy, cz, i) => tone(band, i, 0.2)), pb, 0, y, 0, true); });
  /* a hoodie: a soft hood behind the neck, a front pocket and two strings */
  if (ts === 'luva') {
    g = new T.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6); g.scale(1.05, 0.8, 0.75); const m = part(fac(g, (cx, cy, cz, i) => shadeY(sh, cy, -0.1, 0.15, i, 0.3)), pb, 0, 1.12, -0.12); m.rotation.x = -1.9;
    g = new T.BoxGeometry(0.26, 0.11, 0.03); part(fac(g, (cx, cy, cz, i) => tone(sh, i, 0.3).multiplyScalar(0.86)), pb, 0, 0.8, 0.165, true);
    [-0.05, 0.05].forEach((x) => { g = new T.CylinderGeometry(0.008, 0.008, 0.13, 4); part(fac(g, '#fff6e4'), pb, x, 1.04, 0.17, true); });
  }
  /* arms swing from the shoulder */
  [-0.3, 0.3].forEach((x, k) => {
    const arm = new T.Group(); arm.position.set(x, 1.08, 0); pb.add(arm); limbs.push({ g: arm, s: k ? -1 : 1, arm: true });
    g = new T.CylinderGeometry(0.072, 0.064, 0.38, 10); g.translate(0, -0.17, 0); part(fac(g, (cx, cy, cz, i) => shadeY(sh, cy, -0.4, 0.05, i, 0.3)), arm);
    if (ts === 'randig') [-0.1, -0.22].forEach((y) => { g = new T.CylinderGeometry(0.076, 0.073, 0.045, 10); part(fac(g, (cx, cy, cz, i) => tone(band, i, 0.2)), arm, 0, y, 0, true); }); g = new T.CylinderGeometry(0.07, 0.07, 0.05, 10); part(fac(g, (cx, cy, cz, i) => tone(sh, i, 0.3).multiplyScalar(0.8)), arm, 0, -0.35, 0);
    part(fac(ico(0.075, 0, 30 + k, 0.005), skin, 30 + k), arm, 0, -0.41, 0);
  });
  /* head and face: a big round head (scaled up as a group) */
  const h0 = pb.children.length;
  g = ico(0.27, 2, 4, 0.004); g.scale(1, 1.0, 0.95); part(fac(g, skin, 32), pb, 0, 1.38, 0);
  part(fac(ico(0.045, 0, 6, 0.003), skin, 33), pb, 0, 1.35, 0.265);
  [-0.1, 0.1].forEach((x) => {
    const e = new T.Mesh(new T.SphereGeometry(0.04, 10, 8), ink); e.scale.set(0.9, 1.15, 0.7); e.position.set(x, 1.41, 0.235); pb.add(e); eyes.push(e);
    const hl = new T.Mesh(new T.SphereGeometry(0.013, 6, 4), new T.MeshBasicMaterial({ color: '#ffffff' })); hl.position.set(0.013, 0.014, 0.03); e.add(hl);
    const c = new T.Mesh(new T.SphereGeometry(0.05, 8, 6), new T.MeshBasicMaterial({ color: PAL.blush, transparent: true, opacity: 0.6 })); c.scale.set(1, 0.6, 0.3); c.position.set(x * 1.7, 1.31, 0.21); pb.add(c);
  });
  const mouth = new T.Mesh(new T.TorusGeometry(0.045, 0.012, 4, 10, Math.PI), ink); mouth.rotation.z = Math.PI; mouth.position.set(0, 1.29, 0.245); pb.add(mouth);
  /* hair: a cap of hair tipped back, plus the style's extra pieces */
  const cap = (col, tilt) => { const s = new T.SphereGeometry(0.295, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.52); const m = part(fac(jit(s, 0.01, 7), col, 34), pb, 0, 1.39, -0.01); m.rotation.x = -tilt; return m; };
  if (hs === 'keps') {
    cap(hc, 0.5);
    g = new T.SphereGeometry(0.305, 10, 5, 0, Math.PI * 2, 0, Math.PI * 0.42); const m = part(fac(g, sh === '#e9684a' ? PAL.sea : PAL.accent, 35), pb, 0, 1.43, 0); m.rotation.x = -0.15;
    g = new T.BoxGeometry(0.36, 0.035, 0.2); part(fac(g, sh === '#e9684a' ? PAL.sea : PAL.accent, 36), pb, 0, 1.55, 0.27);
  } else if (hs === 'mossa') {
    /* a cozy knitted beanie with a folded brim and a pompom */
    cap(hc, 0.55); const bc0 = sh === '#e9684a' ? '#e0a646' : '#e9763a';
    g = new T.SphereGeometry(0.3, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5); g.scale(1, 1.15, 1); let m = part(fac(jit(g, 0.004, 51), (cx, cy, cz, i) => shadeY(bc0, cy, 0, 0.34, i, 0.4)), pb, 0, 1.45, -0.01); m.rotation.x = -0.18;
    g = new T.TorusGeometry(0.288, 0.042, 8, 24); g.rotateX(Math.PI / 2); g.scale(1, 1.7, 1); m = part(fac(g, (cx, cy, cz, i) => tone(bc0, i, 0.4).multiplyScalar(0.86)), pb, 0, 1.47, -0.01); m.rotation.x = -0.18;
    part(fac(ico(0.08, 1, 52, 0.012), '#fff6e4'), pb, 0, 1.83, -0.09);
  } else cap(hc, hs === 'lockar' ? 0.25 : 0.4);
  if (hs === 'lang') { g = new T.BoxGeometry(0.54, 0.5, 0.14); part(fac(jit(g, 0.012, 8), hc, 37), pb, 0, 1.2, -0.19); }
  if (hs === 'tofsar') [-1, 1].forEach((s) => { part(fac(ico(0.11, 1, 9 + s), hc, 38), pb, s * 0.31, 1.36, -0.06); part(fac(new T.BoxGeometry(0.06, 0.06, 0.06), PAL.accent, 39), pb, s * 0.25, 1.4, -0.05); });
  if (hs === 'knut') part(fac(ico(0.13, 1, 11), hc, 40), pb, 0, 1.7, -0.1);
  if (hs === 'lockar') for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; part(fac(ico(0.1, 0, 12 + k), hc, 41 + k), pb, Math.cos(a) * 0.24, 1.6 + Math.sin(k * 1.7) * 0.03, Math.sin(a) * 0.2 - 0.04); }
  { const hg = new T.Group(); hg.position.set(0, 1.3, 0); hg.scale.setScalar(1.16); const L = pb.children.slice(h0); L.forEach((m) => { pb.remove(m); m.position.y -= 1.3; hg.add(m); }); pb.add(hg); }
  /* the basket on Pip's back, where carried things stack */
  if (typeof NO_BASKET === 'undefined') {
    g = new T.BoxGeometry(0.44, 0.08, 0.3); part(fac(g, PAL.trunk, 8), pb, 0, 0.82, -0.34);
    [-0.17, 0.17].forEach((x) => { const s = new T.BoxGeometry(0.04, 0.4, 0.04); part(fac(s, PAL.trunk, 9), pb, x, 0.98, -0.17); }); }
}
buildAvatar();
const carry = new Pile(pip, (i, m) => { let y = 0.72; for (let k = 0; k < i; k++) y += ITEM_H[carry.items[k].userData.type]; return [0, y, -0.32]; });
const target = new T.Vector3().copy(pip.position);
let pipWalk = 0, dressT = 0;
/* the wardrobe: pick a look; the camera moves close so Pip is the preview */
let dressing = false;
const HS_ICON = {
  kort: '<path d="M10 24 C10 8 38 8 38 24 C34 16 14 16 10 24 Z"/>',
  lang: '<path d="M8 40 C4 6 44 6 40 40 L36 40 C38 22 34 16 24 16 C14 16 10 22 12 40 Z"/>',
  tofsar: '<path d="M10 24 C10 8 38 8 38 24 C34 16 14 16 10 24 Z"/><circle cx="7" cy="26" r="6"/><circle cx="41" cy="26" r="6"/>',
  knut: '<path d="M10 24 C10 8 38 8 38 24 C34 16 14 16 10 24 Z"/><circle cx="24" cy="6" r="6"/>',
  lockar: '<circle cx="12" cy="18" r="6"/><circle cx="20" cy="12" r="6"/><circle cx="28" cy="12" r="6"/><circle cx="36" cy="18" r="6"/><circle cx="24" cy="16" r="5"/>',
  keps: '<path d="M10 22 C10 6 38 6 38 22 Z" fill="#e9684a"/><path d="M30 20 H46 V24 H30 Z" fill="#e9684a"/>',
  mossa: '<path d="M9 28 C9 8 39 8 39 28 Z" fill="#e9763a"/><rect x="7" y="26" width="34" height="8" rx="4" fill="#c95f2a"/><circle cx="24" cy="7" r="5" fill="#fff6e4"/>'
};
const BS_ICON = {
  byxor: '<path d="M14 8 H34 L36 42 H27 L24 20 L21 42 H12 Z"/>',
  shorts: '<path d="M14 8 H34 L36 26 H27 L24 18 L21 26 H12 Z"/>',
  kjol: '<path d="M16 8 H32 L40 38 H8 Z"/>'
};
const SS_ICON = {
  skor: '<path d="M8 30 C8 24 12 22 18 22 L24 22 C28 26 34 27 40 28 C42 29 42 34 40 35 H8 Z"/><path d="M8 35 H41" stroke-width="4" stroke="#fff6e4"/>',
  stovlar: '<path d="M14 6 H26 V26 C30 28 36 28 40 30 C42 31 42 37 40 38 H14 Z"/>',
  sandaler: '<path d="M8 34 H40 V38 H8 Z"/><path d="M14 34 L22 24 L30 34" fill="none" stroke-width="4"/>'
};
const AV_ROWS = [
  { k: 'skin', label: 'Hudfärg', icon: '<circle cx="24" cy="24" r="14" fill="#e8b48f" stroke="#22303c" stroke-width="3"/>' },
  { k: 'hs', label: 'Frisyr' }, { k: 'hc', label: 'Hårfärg' }, { k: 'sh', label: 'Tröja' }, { k: 'bs', label: 'Byxor eller kjol' }, { k: 'bc', label: 'Byxfärg' }, { k: 'ss', label: 'Skor' }, { k: 'sc', label: 'Skofärg' }
];
function avSwatch(k, i) {
  if (k === 'hs') return '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="27" r="14" fill="#f6d3b8" stroke="#22303c" stroke-width="2.5"/><g fill="' + AVO.hc[av.hc] + '" stroke="#22303c" stroke-width="2.5" stroke-linejoin="round">' + HS_ICON[AVO.hs[i]] + '</g></svg>';
  if (k === 'ss') return '<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="' + AVO.sc[av.sc] + '" stroke="#22303c" stroke-width="2.5" stroke-linejoin="round">' + SS_ICON[AVO.ss[i]] + '</g></svg>';
  if (k === 'bs') return '<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="' + AVO.bc[av.bc] + '" stroke="#22303c" stroke-width="2.5" stroke-linejoin="round">' + BS_ICON[AVO.bs[i]] + '</g></svg>';
  return '<i style="background:' + AVO[k][i] + '"></i>';
}
const AV_NAMES = { ts: ['Jacka', 'Randig tröja', 'Luvtröja'], hs: ['Kort hår', 'Långt hår', 'Tofsar', 'Knut', 'Lockar', 'Keps'], bs: ['Byxor', 'Shorts', 'Kjol'], ss: ['Skor', 'Stövlar', 'Sandaler'] };
function renderWardrobe() {
  if (typeof edRows === 'function') return edRows();
  const box = $('wardRows'); if (!box) return;
  box.innerHTML = AV_ROWS.map((r) => '<div class="wrow" role="radiogroup" aria-label="' + r.label + '">' + AVO[r.k].map((v, i) =>
    '<button type="button" class="sw' + (av[r.k] === i ? ' on' : '') + '" role="radio" aria-checked="' + (av[r.k] === i) + '" aria-label="' + r.label + ' ' + (AV_NAMES[r.k] ? AV_NAMES[r.k][i] : i + 1) + '" data-k="' + r.k + '" data-i="' + i + '">' + avSwatch(r.k, i) + '</button>').join('') + '</div>').join('');
}
function openWardrobe(auto) { if (typeof closeMenu === 'function') closeMenu(); if (typeof edOpen === 'function') edOpen(); dressing = true; $('ward').hidden = false; $('hint').hidden = true; renderWardrobe(); if (auto !== true) { Snd.init(); Snd.play('pop', { gain: 0.4, f: 700 }); } }
function closeWardrobe() { if ($('ward').hidden) return; if (typeof edClose === 'function' && !edClose()) return; $('ward').hidden = true; dressing = false; $('hint').hidden = !!(state && state.moved); avNew = false; try { localStorage.setItem(AV_KEY, JSON.stringify(av)); } catch (e) {} Snd.play('success', { gain: 0.5, f: 'E6' }); }
if ($('ward')) {
  $('wardRows').addEventListener('click', (e) => { const b = e.target.closest('.sw'); if (!b) return; e.stopPropagation(); av[b.dataset.k] = +b.dataset.i; buildAvatar(); renderWardrobe(); Snd.play('pop', { gain: 0.35, f: 500 + 60 * (+b.dataset.i) }); try { localStorage.setItem(AV_KEY, JSON.stringify(av)); } catch (er) {} });
  $('wardDone').addEventListener('click', () => { Snd.init(); closeWardrobe(); });
  if ($('wardBtn')) $('wardBtn').addEventListener('click', () => openWardrobe());
}

