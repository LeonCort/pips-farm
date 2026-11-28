/* ---------- the Summer Hollow (winter island, area w5): a hidden world (secret.js says how they plug in) ----------
   On the east shore of the far winter square (w3) stands a wall of blue ice with something warm and green frozen in
   its heart, and three cold stone braziers before it. A sign asks for embers, which only the volcano island has. Paid,
   the braziers catch one after the other, the ice melts in steam and a trickle of water, and the land behind it rises:
   a round hollow inside a rim of snowy rock and icicles where it is summer. Grass, flowers, butterflies, a warm pond,
   berry bushes and an apple tree, in the middle of the winter island.
     the toy    three ice mirrors on turning stones. Stepping on a mirror's plate turns it one step. The sunbeam that
                falls into the hollow is passed from mirror to mirror; a mirror that is not turned right just sends
                it off to the rim. When all three are right the beam lands on the frozen sun stone and melts it free.
     the gift   the golden sun stone (goldGive('sun')).
     the ride   a geyser: its ring shoots Pip in a high arc to a second vent by the winter bridge, and back.
     for good   once the sun stone is found the warmth spreads: the winter island's trails melt clear and green
                through the snow, a ring of flowers opens round the frozen lake, and the hollow glows at night.
   The area's biome stays 'snow'. The summer ground is made here: hollowWarm(x, z) says how warm a spot is (0 to 1);
   the ground's tint (ISLAND.tint, wrapped below) paints warm ground as grass, and the snow map (snowfx.js snxMap)
   leaves it bare. Frost flowers (the find 'frost': rules.js FIND_NODE.frostflower) get their model and picture here.
   state.isle.hollow = { open: the wall is paid, m: [the three mirrors' steps, 0 = right], melt: the sun stone is
   free, sun: the gift is found }. */
const HW = { cx: 52, cz: -32, R: 4.5, wall: { x: 45.25, z: -32, w: 1.5, d: 4.8 }, braz: [[42.4, -30.9], [44.0, -33.75], [44.0, -30.25]], sign: [43.15, -32.2],
  out: [25.2, -14.9], vent: [-2.1, 2.9], dais: [0.3, 0.2], mir: [[-2.8, -1.9], [2.7, -1.6], [1.2, 3.1]], k0: [4, 5, 3], src: [-0.22, -0.46],
  pond: [3.1, 0.7, 1.2], tree: [-1.3, -3.5], chest: [0.9, -3.75], bush: [[-2.7, -3.1], [3.7, -0.9], [2.6, 3.3]],
  frost: [[-4.05, -1.6], [-3.8, 1.8], [-5.0, -4.3], [-4.3, -5.2], [-5.1, 4.5], [-4.2, 5.3]] };
const HL = { g: null, out: null, wallG: null, seq: null, braz: [], mir: [], beams: [], rings: [], vents: [], flies: [], solid: [], thaw: 0, steam: 0, drip: 0, pop: 0, lit: -1 };
const hollowS = () => { const S = state.isle.hollow || (state.isle.hollow = {}); if (!S.m) S.m = HW.k0.slice(); return S; };
const HL_GREEN = new T.Color('#86c654');

/* ---- pictures: the frost flower (store, signs, the "found it" moment) and the geyser (its rings) ---- */
ISLE_ICON.frost = (x) => {
  for (let k = 0; k < 6; k++) { x.save(); x.rotate(k * Math.PI / 3); x.beginPath(); x.moveTo(0, -3); x.quadraticCurveTo(10, -13, 0, -23); x.quadraticCurveTo(-10, -13, 0, -3); x.closePath(); x.fillStyle = k % 2 ? '#bfe6fb' : '#e9f7ff'; x.fill(); x.stroke(); x.restore(); }
  x.beginPath(); x.arc(0, 0, 6, 0, 7); x.fillStyle = '#5fb6e6'; x.fill(); x.stroke(); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(-1.8, -1.8, 2, 0, 7); x.fill();
};
ISLE_ICON.geyser = (x) => {
  x.beginPath(); x.moveTo(-6, 12); x.quadraticCurveTo(-5, -8, -15, -14); x.quadraticCurveTo(-8, -24, 0, -18); x.quadraticCurveTo(8, -24, 15, -14); x.quadraticCurveTo(5, -8, 6, 12); x.closePath(); x.fillStyle = '#9fe0f2'; x.fill(); x.stroke();
  x.fillStyle = '#e9fbff'; x.beginPath(); x.ellipse(-1, -6, 2.4, 9, 0, 0, 7); x.fill();
  [[-19, -2], [19, -4], [0, -27]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 3, 0, 7); x.fillStyle = '#9fe0f2'; x.fill(); x.stroke(); });
  [[-12, 14, 8], [0, 16, 9], [12, 14, 8]].forEach(([a, b, r]) => { x.beginPath(); x.ellipse(a, b, r, 5.5, 0, 0, 7); x.fillStyle = '#a9b2bb'; x.fill(); x.stroke(); });
};

/* ---- the frost flower: a pale blue ice flower in the snow (finds.js findGeo and findNode ask for these) ---- */
function hollowFrostGeo(L, k) {
  const n0 = L.length; hollowFrostParts(L, k); for (let i = n0; i < L.length; i++) L[i].scale(1.5, 1.5, 1.5);
}
function hollowFrostParts(L, k) {
  let q;
  if (k === 'frostflowerBase') { /* what is left when it is picked: two frosted leaves on a pat of snow */
    q = ico(0.2, 1, 5601); q.scale(1.2, 0.3, 1.1); L.push(fac(q, (cx, cy, cz, i) => tone('#eef6ff', i, 0.2), 5601));
    [0.6, 3.6].forEach((a, i) => { q = new T.ConeGeometry(0.06, 0.26, 4); q.scale(1, 1, 0.35); q.translate(0, 0.13, 0); q.rotateZ(1.0); q.rotateY(a); q.translate(0, 0.05, 0); L.push(fac(q, (cx, cy, cz, f) => tone('#7fbfae', f + i, 0.3), 5603 + i)); });
    return;
  }
  q = new T.CylinderGeometry(0.016, 0.022, 0.3, 5); q.translate(0, 0.17, 0); L.push(fac(q, (cx, cy, cz, f) => tone('#8fcfc0', f, 0.3), 5610));
  for (let r = 0; r < 2; r++) for (let p = 0; p < 6; p++) { const a = p / 6 * 6.283 + r * 0.52, len = r ? 0.12 : 0.19; q = new T.OctahedronGeometry(1, 0); q.scale(0.05, 0.014, len / 2); q.translate(0, 0, len / 2 + 0.02); q.rotateX(r ? -0.95 : -0.42); q.rotateY(a); q.translate(0, 0.33, 0);
    L.push(fac(q, (cx, cy, cz, f) => new T.Color(r ? '#f4fbff' : (p + f) % 2 ? '#a9dcf7' : '#c9ebfc'), 5620 + p + r * 6)); }
  q = ico(0.045, 0, 5640); q.translate(0, 0.36, 0); L.push(fac(q, () => new T.Color('#4aa6e0'), 5640));
  [1.2, 4.1].forEach((a, i) => { q = new T.ConeGeometry(0.05, 0.22, 4); q.scale(1, 1, 0.35); q.translate(0, 0.11, 0); q.rotateZ(0.85); q.rotateY(a); q.translate(0, 0.06, 0); L.push(fac(q, (cx, cy, cz, f) => tone('#7fbfae', f + i, 0.3), 5650 + i)); });
}
function hollowFrostMat() { if (!HL.frostMat) { HL.frostMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.25, metalness: 0.05, emissive: new T.Color('#2f7fb8'), emissiveIntensity: 0.4 }); HL.frostMat.userData = { noSnow: 1 }; } return HL.frostMat; }

/* ---- where it is warm (0 to 1): the hollow and the gap in the wall, the far vent, and after the sun stone is found
   the winter trails and a ring round the frozen lake. The ground tint and the snow map both ask this. ---- */
function hollowLake() { if (HL.lake === undefined) { const A = AREA_BY.w0, D = A && A.ice; HL.lake = D ? [A.cx + D.dx, A.cz + D.dz, D.nx / 2, D.nz / 2] : null; } return HL.lake; }
function hollowTrails() { if (!HL.trails) { HL.trails = []; TRAILS.forEach((L) => { if (L[0][0] < 21 || L[0][1] > -13) return; for (let k = 0; k + 1 < L.length; k++) HL.trails.push([L[k][0], L[k][1], L[k + 1][0], L[k + 1][1]]); }); } return HL.trails; }
function hollowWarm(x, z) {
  if (x < 21 || z > -13 || !HAS.w5 || (rising && rising.area === 'w5')) return 0; /* it rises as snow, and turns green when the hollow stands */
  let w = 1 - sstep(4.75, 5.45, Math.hypot(x - HW.cx, z - HW.cz)); if (w >= 1) return 1;
  w = Math.max(w, 1 - sstep(0.85, 1.5, segD(x, z, 44.3, -32, 48, -32)), 1 - sstep(0.95, 1.6, Math.hypot(x - HW.out[0], z - HW.out[1])));
  const th = HL.thaw; if (th <= 0 || w >= 1) return w;
  let d = 9; for (const s of hollowTrails()) { if (x < Math.min(s[0], s[2]) - 2 || x > Math.max(s[0], s[2]) + 2 || z < Math.min(s[1], s[3]) - 2 || z > Math.max(s[1], s[3]) + 2) continue; d = Math.min(d, segD(x, z, s[0], s[1], s[2], s[3])); }
  w = Math.max(w, (1 - sstep(0.75 * th, 0.75 * th + 0.6, d)) * Math.min(1, th * 1.5));
  const K = hollowLake(); if (K) { const dr = Math.hypot(Math.max(Math.abs(x - K[0]) - K[2], 0), Math.max(Math.abs(z - K[1]) - K[3], 0)); w = Math.max(w, sstep(0.3, 0.55, dr) * (1 - sstep(1.25, 1.8, dr)) * th); }
  return w;
}
/* warm ground keeps the grass colour it had before the snow tint */
{ const t0 = ISLAND.tint; ISLAND.tint = (x, z, c) => { const w = hollowWarm(x, z); if (w <= 0) return t0(x, z, c); const g = c.clone().lerp(HL_GREEN, 0.4); t0(x, z, c); c.lerp(g, w); }; }
/* paint the winter island's ground again (when the hollow opens, on load, and as the thaw spreads) */
function hollowPaint() {
  const p = ground.geometry.attributes.position, col = ground.geometry.attributes.color;
  if (!HL.gi) { HL.gi = []; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); if (x > 21 && x < 59.5 && z < -13 && z > -47) HL.gi.push(i); } }
  for (const i of HL.gi) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), c = groundCol(x, y, z, vkey(x, y, z)); col.setXYZ(i, c.r, c.g, c.b); }
  col.needsUpdate = true; if (typeof GR !== 'undefined' && GR.tex) GR.t = Math.min(GR.t, 0.5);
}

/* ---- small helpers ---- */
function hollowMats() {
  if (HL.ice) return;
  HL.ice = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.12, metalness: 0.1, emissive: new T.Color('#2f6f8c'), emissiveIntensity: 0.4, transparent: true, opacity: 0.82 }); HL.ice.userData = { noSnow: 1 };
  HL.iceWall = HL.ice.clone(); HL.iceWall.userData = { noSnow: 1 }; HL.iceWall.opacity = 0.66; HL.iceWall.emissiveIntensity = 0.22; HL.iceWall.depthWrite = false; /* the glow in its heart shows through */
  HL.water = new T.MeshStandardMaterial({ color: '#63cbd6', roughness: 0.08, metalness: 0.25, emissive: new T.Color('#1f8f9c'), emissiveIntensity: 0.4, transparent: true, opacity: 0.9 }); HL.water.userData = { noSnow: 1 };
  HL.glass = new T.MeshStandardMaterial({ color: '#f2fdff', roughness: 0.05, metalness: 0.45, emissive: new T.Color('#7fd6f6'), emissiveIntensity: 0.3 }); HL.glass.userData = { noSnow: 1 };
  HL.beam = new T.MeshBasicMaterial({ color: '#fff6c8', transparent: true, opacity: 0.95, depthWrite: false, blending: T.AdditiveBlending });
  HL.halo = new T.MeshBasicMaterial({ color: '#ffd76a', transparent: true, opacity: 0.3, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide });
  HL.jet = new T.MeshBasicMaterial({ color: '#e4fbff', transparent: true, opacity: 0.8, depthWrite: false });
}
function hollowGlowTex(c0, c1) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 2, 64, 64, 62);
  g.addColorStop(0, c0); g.addColorStop(0.4, c1); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c);
}
function hollowGlow(tex, s, op) { const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: op })); sp.scale.set(s, s, 1); return sp; }
const hollowPut = (L, par, mat) => { const m = merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), mat || MAT, par); m.castShadow = true; m.receiveShadow = true; return m; };
function hollowPush(p, x, z, r) { const dx = p.x - x, dz = p.z - z, d = Math.hypot(dx, dz); if (d >= r || d < 1e-4) return; p.x = x + dx / d * r; p.z = z + dz / d * r; }
/* a flower: a stem, a flat head of petals and a heart */
function hollowFlower(L, x, z, col, h, sd) {
  let q = new T.CylinderGeometry(0.012, 0.016, h, 3); q.translate(x, h / 2, z); L.push(fac(q, '#5d9a3a', sd));
  q = ico(0.075 + hash(sd, 3) * 0.035, 1, sd + 1); q.scale(1, 0.34, 1); q.rotateX(0.35); q.translate(x, h, z); L.push(fac(q, col, sd + 1));
  q = ico(0.032, 0, sd + 2); q.translate(x, h + 0.028, z + 0.014); L.push(fac(q, col === '#f6d24a' ? '#e58a2c' : '#f6d24a', sd + 2));
}
const HL_COLS = ['#ffffff', '#f6d24a', '#f29ab8', '#b89cf0', '#ff8a5c', '#ef6f6c', '#8fd0f0'];

/* ---- outside: the ice wall on w3's east shore, its braziers and the far vent's keep ---- */
ISLE_KEEPS.push((a, x, z) => (a.id === 'w3' && x > 41.2 && z > -35.2 && z < -26.4) || (a.id === 'w0' && Math.hypot(x - HW.out[0], z - HW.out[1]) < 1.7));
ISLE_KEYS.push({ id: 'hollow', ok: () => !!HAS.w3 && !!HL.out && !hollowS().open, x: HW.sign[0], z: HW.sign[1], cost: { ember: 3, log: 20 }, open: () => hollowPay() });
function hollowOutside(anim) {
  hollowMats(); const S = hollowS(), g = HL.out = new T.Group(); sc.add(g); const L = [], IC2 = [], W = HW.wall; let q;
  /* the braziers: a stone bowl on a short pillar, dark coals in it; cold, each wears a cap of snow */
  HW.braz.forEach(([x, z], k) => {
    q = new T.CylinderGeometry(0.3, 0.36, 0.16, 8); jit(q, 0.012, 5700 + k); q.translate(x, 0.08, z); L.push(fac(q, (cx, cy, cz, i) => tone('#8f8a86', i, 0.35), 5700 + k));
    q = new T.CylinderGeometry(0.15, 0.2, 0.56, 7); q.translate(x, 0.44, z); L.push(fac(q, (cx, cy, cz, i) => shadeY(i % 3 ? '#a39c94' : '#b3aca4', cy, 0, 0.8, i, 0.35), 5710 + k));
    q = new T.CylinderGeometry(0.46, 0.2, 0.3, 8); jit(q, 0.012, 5720 + k); q.translate(x, 0.86, z); L.push(fac(q, (cx, cy, cz, i) => (cy > 0.97 ? tone('#4a4038', i, 0.3) : shadeY('#a8a199', cy, 0.6, 1.05, i, 0.35)), 5720 + k));
    for (let j = 0; j < 5; j++) { q = ico(0.1, 0, 5730 + k * 9 + j); q.translate(x + Math.cos(j * 1.3) * 0.2, 1.02, z + Math.sin(j * 1.3) * 0.2); L.push(fac(q, (cx, cy, cz, i) => tone(i % 3 ? '#3a322e' : '#5a3a2a', i, 0.3), 5730 + j)); }
    const cap = ico(0.3, 1, 5760 + k); cap.scale(1.05, 0.5, 1.05); cap.translate(x, 1.07, z); const cm = new T.Mesh(fac(cap, (cx, cy, cz, i) => tone('#f4f9ff', i, 0.2), 5760 + k), MAT); cm.castShadow = true; g.add(cm);
    const fl = kitFlame(g, x, 1.02, z, 1.25); fl.visible = false; const gl = hollowGlow(HL.warmTex || (HL.warmTex = hollowGlowTex('rgba(255,214,120,0.95)', 'rgba(255,150,60,0.35)')), 1.7, 0); gl.position.set(x, 1.2, z); g.add(gl);
    HL.braz.push({ x, z, cap: cm, fl, gl, on: false }); HL.solid.push([x, z, 0.5]); lookFoot(x, z, 0.5, 0.5);
  });
  /* the two ice stumps that stay as gate posts, with snow on their shoulders */
  [-1, 1].forEach((s, k) => { const z = W.z + s * 2.3;
    for (let j = 0; j < 3; j++) { const h = 1.0 - j * 0.25; q = new T.CylinderGeometry(0.16, 0.34 - j * 0.04, h, 5, 2); jit(q, 0.04, 5800 + k * 5 + j); q.rotateY(j * 1.1); q.translate(W.x + (j - 1) * 0.3, h / 2, z + s * (j === 1 ? 0.12 : -0.05));
      IC2.push(fac(q, (cx, cy, cz, i) => (cy > h * 0.8 ? tone('#f1faff', i, 0.2) : tone(['#8fcdea', '#a9dcf2', '#c2e8f7'][i % 3], i, 0.3)), 5800 + k * 5 + j)); }
    q = ico(0.4, 1, 5820 + k); q.scale(1.5, 0.4, 1.2); q.translate(W.x, 0.1, z + s * 0.35); L.push(fac(q, (cx, cy, cz, i) => tone('#f4f9ff', i, 0.2), 5820 + k)); HL.solid.push([W.x, z, 0.62]); });
  hollowPut(L, g); hollowPut(IC2, g, HL.ice).renderOrder = 2; lookFoot(W.x, W.z, 0.9, 2.6, 0);
  if (S.open) HL.braz.forEach((B, k) => hollowLight(k, false)); else hollowWall();
  if (anim && HL.wallG) { HL.wallG.scale.setScalar(0.01); HL.outPop = 0.001; }
}
/* the wall: a thick stand of blue ice shards, tallest in the middle, a warm green glow frozen in its heart */
function hollowWall() {
  const W = HW.wall, g = HL.wallG = new T.Group(); g.position.set(W.x, 0, W.z); sc.add(g); const L = [], S = [], C = []; let q;
  const shard = (x, z, h, r, sd) => { q = new T.CylinderGeometry(r * 0.42, r, h, 5, 3); jit(q, 0.05, sd); q.rotateY(hash(sd, 1) * 6); q.rotateZ((hash(sd, 2) - 0.5) * 0.2); q.rotateX((hash(sd, 3) - 0.5) * 0.2 + z * 0.03); q.translate(x, h / 2 - 0.05, z);
    L.push(fac(q, (cx, cy, cz, i) => (cy > h * 0.84 ? tone('#f1faff', i, 0.2) : tone(['#8fcdea', '#a9dcf2', '#7fc0e2', '#c2e8f7'][(i + sd) % 4], i, 0.3)), sd)); };
  for (let k = 0; k < 11; k++) { const z = -2.0 + k * 0.4 + (hash(k, 5851) - 0.5) * 0.14, u = 1 - Math.abs(z) / 2.3; shard((hash(k, 5852) - 0.5) * 0.3, z, 1.9 + 1.25 * Math.pow(Math.max(0, u), 0.7) + hash(k, 5853) * 0.45, 0.46 + hash(k, 5854) * 0.1, 5860 + k); }
  for (let k = 0; k < 14; k++) { const z = -1.95 + (k >> 1) * 0.65 + (hash(k, 5881) - 0.5) * 0.2, sx = k % 2 ? 1 : -1; shard(sx * (0.5 + hash(k, 5882) * 0.12), z, 0.9 + hash(k, 5883) * 0.95, 0.3 + hash(k, 5884) * 0.1, 5890 + k); }
  const wm = hollowPut(L, g, HL.iceWall); wm.castShadow = true; wm.renderOrder = 2;
  /* snow at its foot and on its shoulders */
  for (let k = 0; k < 12; k++) { const z = -2.2 + k * 0.4, sx = k % 2 ? 1 : -1; q = ico(0.3 + hash(k, 5901) * 0.14, 1, 5902 + k); q.scale(1.3, 0.42, 1.2); q.translate(sx * (0.82 + hash(k, 5903) * 0.1), 0.06, z); S.push(fac(q, (cx, cy, cz, i) => tone('#f4f9ff', i, 0.2), 5902 + k)); }
  hollowPut(S, g);
  /* what is frozen in it: a sprig of green with a flower or two, seen dimly, and a warm light that breathes */
  [[-0.9, 0.9], [0, 1.25], [0.85, 0.85], [-0.35, 0.55], [0.4, 0.5]].forEach(([z, y], k) => { q = new T.CylinderGeometry(0.02, 0.03, y, 4); q.translate(0, y / 2, z); C.push(fac(q, '#4f9a3a', 5920 + k));
    for (let j = 0; j < 3; j++) { q = new T.ConeGeometry(0.1, 0.34, 4); q.scale(1, 1, 0.4); q.translate(0, 0.17, 0); q.rotateZ(0.9 * (j % 2 ? 1 : -1)); q.rotateY(1.57 + j); q.translate(0, y * (0.4 + j * 0.2), z); C.push(fac(q, (cx, cy, cz, i) => tone(j % 2 ? '#5fae4a' : '#7cc85a', i, 0.3), 5930 + k * 3 + j)); }
    q = ico(0.13, 1, 5950 + k); q.scale(1, 0.6, 1); q.translate(0, y + 0.05, z); C.push(fac(q, HL_COLS[1 + (k % 4)], 5950 + k)); });
  const cm = hollowPut(C, g); cm.castShadow = false;
  HL.core = []; const tex = HL.coreTex || (HL.coreTex = hollowGlowTex('rgba(255,232,140,0.9)', 'rgba(110,200,80,0.42)'));
  [[-1.0, 0.95, 1.5], [0, 1.25, 2.0], [0.95, 0.95, 1.5]].forEach(([z, y, s]) => { const sp = hollowGlow(tex, s, 0.3); sp.position.set(0, y, z); sp.renderOrder = 3; sp.userData.s = s; g.add(sp); HL.core.push(sp); });
}
function hollowLight(k, snd) {
  const B = HL.braz[k]; if (!B || B.on) return; B.on = true; B.cap.visible = false; B.fl.visible = true; B.gl.material.opacity = 0.55; HL.lit = Math.max(HL.lit, k);
  if (snd) { Snd.play('whoosh', { gain: 0.45, f: 420 + k * 80 }); Snd.play('ding', { gain: 0.35, f: 520 + k * 130 }); for (let j = 0; j < 4; j++) smokePuff(B.x + (Math.random() - 0.5) * 0.4, 1.2 + Math.random() * 0.4, B.z + (Math.random() - 0.5) * 0.4, '#ffffff'); burst(B.x, 1.3, B.z, 5); }
}
/* the embers are paid: the braziers catch, the wall melts, and then the land behind it rises (hollowStep runs it) */
function hollowPay() {
  const S = hollowS(); S.open = 1; HL.seq = { t: 0, lit: 0, st: 0 }; xpGain(25); save();
  const q = new T.CircleGeometry(1, 18); q.rotateX(-Math.PI / 2); HL.puddle = new T.Mesh(q, new T.MeshBasicMaterial({ color: '#bfeaf2', transparent: true, opacity: 0.5, depthWrite: false })); HL.puddle.position.set(HW.wall.x - 0.9, 0.055, HW.wall.z); HL.puddle.scale.set(0.01, 1, 0.01); sc.add(HL.puddle);
}

/* ---- the hollow itself (SECRET_FILL: when the land has risen, and on load) ---- */
function hollowVent(x, z, sd) {
  const g = new T.Group(); g.position.set(x, 0, z); sc.add(g); const L = []; let q;
  for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283 + hash(k, sd) * 0.3, r = 0.17 + hash(k, sd + 1) * 0.09; q = ico(r, 1, sd + 2 + k, r * 0.1); q.scale(1.25, 0.7, 1); q.rotateY(a); q.translate(Math.cos(a) * 0.82, r * 0.3, Math.sin(a) * 0.82); L.push(fac(q, (cx, cy, cz, i) => shadeY(i % 4 ? '#a8a199' : '#c2bbb2', cy, 0, 0.3, i + k, 0.35), sd + 2 + k)); }
  q = new T.CylinderGeometry(0.74, 0.8, 0.05, 14); q.translate(0, 0.02, 0); L.push(fac(q, (cx, cy, cz, i) => tone('#d9d2c6', i, 0.25), sd + 20));
  hollowPut(L, g); q = new T.CircleGeometry(0.66, 16); q.rotateX(-Math.PI / 2); const w = new T.Mesh(q, HL.water); w.position.y = 0.052; g.add(w);
  q = new T.CylinderGeometry(0.2, 0.3, 1, 9, 6, true); q.translate(0, 0.5, 0); const col = new T.Mesh(q, HL.jet); col.visible = false; g.add(col);
  q = new T.CylinderGeometry(0.34, 0.42, 1, 9, 6, true); q.translate(0, 0.5, 0); const mist = new T.Mesh(q, HL.jet.clone()); mist.material.opacity = 0.28; mist.visible = false; g.add(mist);
  lookFoot(x, z, 0.95, 0.95, 0); return { g, x, z, col, mist, h: 0, jet: 0, top: 0, idle: 3 + (sd % 5) };
}
function hollowFill(A, fresh) {
  if (HL.g) return; hollowMats(); const S = hollowS(), g = HL.g = new T.Group(); g.position.set(HW.cx, 0, HW.cz); sc.add(g); const L = [], I = []; let q;
  const wx = (dx) => HW.cx + dx, wz = (dz) => HW.cz + dz, R0 = 5.3;
  S.open = 1; if (S.sun) HL.thaw = 1;
  /* the rim: a ring of rock, low on the south side so the hollow can be looked into, tall on the north with snow on its
     shoulders and icicles hanging in; mossy on the inside, where it is warm */
  const N = 27; for (let k = 0; k < N; k++) { const a = k / N * 6.283 + (hash(k, 6001) - 0.5) * 0.08; if (Math.abs(Math.atan2(Math.sin(a), -Math.cos(a))) < 0.29) continue; /* the gap in the west, where the wall stood */
    const tall = (1 - Math.sin(a)) / 2, gate = Math.abs(Math.atan2(Math.sin(a), -Math.cos(a))) < 0.5, r = 0.48 + 0.3 * tall + hash(k, 6002) * 0.14, sy = 0.8 + 1.2 * tall + hash(k, 6003) * 0.3 + (gate && Math.sin(a) < 0 ? 0.45 : 0), cy = r * sy * 0.42, top = cy + r * sy, x = Math.cos(a) * R0, z = Math.sin(a) * R0;
    q = ico(r, 1, 6010 + k, r * 0.1); q.scale(1.2, sy, 1.05); q.rotateY(-a + 1.57); q.translate(x, cy, z);
    L.push(fac(q, (cx, cy2, cz, i) => (Math.hypot(cx, cz) < R0 - 0.12 && cy2 < 0.2 + top * 0.35 && hash(i, k) > 0.35 ? tone('#6f9a55', i, 0.4) : shadeY(i % 5 === 0 ? '#b3aca4' : '#8e8880', cy2, 0, top, i, 0.4)), 6010 + k));
    q = ico(r * (0.72 + 0.2 * tall), 1, 6040 + k); q.scale(1.25, 0.36, 1.1); q.rotateY(-a + 1.57); q.translate(Math.cos(a) * (R0 + 0.12), top - 0.1, Math.sin(a) * (R0 + 0.12)); L.push(fac(q, (cx, cy2, cz, i) => tone('#f4f9ff', i, 0.2), 6040 + k));
    if (tall > 0.45) for (let j = 0; j < 3; j++) { const len = 0.28 + hash(k * 3 + j, 6070) * 0.42, aa = a + (j - 1) * 0.085, rr = R0 - r * 0.92 - 0.02 + hash(k + j, 6071) * 0.1; q = new T.ConeGeometry(0.035 + hash(k + j, 6072) * 0.025, len, 5); q.rotateX(Math.PI); q.translate(Math.cos(aa) * rr, top - 0.2 - len / 2, Math.sin(aa) * rr); I.push(q); }
    if (k % 2) { const pr = 0.15 + hash(k, 6080) * 0.1; q = ico(pr, 0, 6081 + k); q.scale(1.2, 0.7, 1); q.translate(Math.cos(a + 0.1) * (R0 - r - 0.25), pr * 0.3, Math.sin(a + 0.1) * (R0 - r - 0.25)); L.push(fac(q, (cx, cy2, cz, i) => tone(i % 2 ? '#7f9a66' : '#9a948b', i, 0.4), 6081 + k)); } }
  /* crags behind the rim in the two north corners, and pines beyond: only where there is land for them */
  [[-0.72, 6.5, 1.25], [-0.98, 6.9, 1.0], [-2.42, 6.5, 1.2], [-2.16, 6.9, 1.05]].forEach(([a, rr, s], k) => { const x = Math.cos(a) * rr, z = Math.sin(a) * rr; if (landSdf(wx(x), wz(z)) > -0.7) return;
    q = ico(0.8 * s, 1, 6100 + k, 0.09); q.scale(1.05, 2.0, 1.0); q.translate(x, 1.0 * s, z); L.push(fac(q, (cx, cy2, cz, i) => shadeY(i % 5 === 0 ? '#b3aca4' : '#8e8880', cy2, 0, 2.6 * s, i, 0.4), 6100 + k));
    q = ico(0.66 * s, 1, 6110 + k); q.scale(1.2, 0.34, 1.15); q.translate(x, 2.5 * s, z); L.push(fac(q, (cx, cy2, cz, i) => tone('#f4f9ff', i, 0.2), 6110 + k)); });
  [[5.2, -5.1, 1.5], [5.3, 5.1, 1.25], [4.1, 5.6, 1.0]].forEach(([x, z, s], k) => { if (landSdf(wx(x), wz(z)) > -0.6) return; const t = propTree('pine', 6130 + k, 3); t.position.set(x, 0, z); t.scale.setScalar(s); g.add(t); });
  /* the flagstone path from the gap to the middle */
  for (let k = 0; k < 9; k++) { const t = k / 8; q = new T.CylinderGeometry(0.27 + hash(k, 6150) * 0.07, 0.3 + hash(k, 6150) * 0.07, 0.05, 6); q.rotateY(hash(k, 6151) * 3); q.translate(-5.5 + t * 4.4, 0.035, Math.sin(t * 3.4) * 0.22 + 0.05); L.push(fac(q, (cx, cy2, cz, i) => tone(k % 2 ? '#d6cebd' : '#c2b9a6', i, 0.25), 6152 + k)); }
  /* the warm pond: stones round it, lily pads and one lily on it */
  { const [px, pz, pr] = HW.pond; for (let k = 0; k < 15; k++) { const a = k / 15 * 6.283 + hash(k, 6170) * 0.2, r = 0.16 + hash(k, 6171) * 0.12; q = ico(r, 1, 6172 + k, r * 0.1); q.scale(1.3, 0.6, 1); q.rotateY(a); q.translate(px + Math.cos(a) * (pr + 0.06), r * 0.22, pz + Math.sin(a) * (pr + 0.06)); L.push(fac(q, (cx, cy2, cz, i) => (hash(i, k) > 0.7 ? tone('#7f9a66', i, 0.4) : shadeY(i % 3 ? '#b3aca4' : '#cfc8be', cy2, 0, 0.3, i + k, 0.35)), 6172 + k)); }
    [[0.45, -0.3, 0.2], [-0.4, 0.35, 0.17], [0.1, 0.6, 0.14], [-0.55, -0.4, 0.13]].forEach(([dx, dz, r], k) => { q = new T.CylinderGeometry(r, r, 0.015, 9, 1, false, 0.5, 5.6); q.rotateY(k * 1.7); q.translate(px + dx, 0.075, pz + dz); L.push(fac(q, (cx, cy2, cz, i) => tone('#4f9a48', i + k, 0.3), 6190 + k)); });
    for (let k = 0; k < 6; k++) { q = new T.ConeGeometry(0.045, 0.15, 4); q.translate(0, 0.075, 0); q.rotateZ(0.75); q.rotateY(k / 6 * 6.283); q.translate(px - 0.4, 0.09, pz + 0.35); L.push(fac(q, k % 2 ? '#f6c1d0' : '#fff6fa', 6200 + k)); }
    q = new T.CircleGeometry(pr, 22); q.rotateX(-Math.PI / 2); const w = new T.Mesh(q, HL.water); w.position.set(px, 0.06, pz); w.receiveShadow = true; g.add(w); HL.solid.push([wx(px), wz(pz), pr + 0.25]); lookFoot(wx(px), wz(pz), pr + 0.25, pr + 0.25, 0); }
  /* the apple tree */
  { const t = propTree('tree', 6210, 2); t.position.set(HW.tree[0], 0, HW.tree[1]); t.scale.setScalar(1.6); g.add(t); HL.solid.push([wx(HW.tree[0]), wz(HW.tree[1]), 0.42]); lookFoot(wx(HW.tree[0]), wz(HW.tree[1]), 0.8, 0.8);
    for (let k = 0; k < 4; k++) { const a = 0.6 + k * 1.5, r = 0.5 + hash(k, 6212) * 0.5; q = ico(0.075, 1, 6213 + k); q.translate(HW.tree[0] + Math.cos(a) * r, 0.07, HW.tree[1] + Math.sin(a) * r); L.push(fac(q, (cx, cy2, cz, i) => tone('#d6403a', i, 0.3), 6213 + k)); } } /* windfalls */
  /* the dais of the sun stone, a ring of rays cut into it */
  { const [dx, dz] = HW.dais; q = new T.CylinderGeometry(0.92, 1.0, 0.12, 12); q.translate(dx, 0.06, dz); L.push(fac(q, (cx, cy2, cz, i) => tone(i % 3 ? '#cfc6b3' : '#bdb3a0', i, 0.3), 6230));
    q = new T.CylinderGeometry(0.6, 0.68, 0.16, 12); q.translate(dx, 0.2, dz); L.push(fac(q, (cx, cy2, cz, i) => tone('#d6cebd', i, 0.3), 6231));
    for (let k = 0; k < 8; k++) { q = new T.BoxGeometry(0.09, 0.03, 0.22); q.translate(0, 0.127, 0.8); q.rotateY(k / 8 * 6.283); q.translate(dx, 0, dz); L.push(fac(q, (cx, cy2, cz, i) => tone('#e8c860', i, 0.2), 6232 + k)); }
    HL.solid.push([wx(dx), wz(dz), 0.95]); lookFoot(wx(dx), wz(dz), 1.0, 1.0);
    HL.stone = new T.Mesh(goldGeo('sun'), goldMat); HL.stone.position.set(dx, 0.95, dz); HL.stone.scale.setScalar(1.25); HL.stone.castShadow = true; HL.stone.visible = !S.sun; g.add(HL.stone);
    HL.rays = new T.Sprite(new T.SpriteMaterial({ map: foundRays(), transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.8 })); HL.rays.position.set(dx, 0.95, dz - 0.05); HL.rays.scale.setScalar(1.9); HL.rays.visible = !!S.melt && !S.sun; g.add(HL.rays);
    HL.sunGlow = hollowGlow(HL.warmTex || (HL.warmTex = hollowGlowTex('rgba(255,214,120,0.95)', 'rgba(255,150,60,0.35)')), 1.9, 0.6); HL.sunGlow.position.set(dx, 0.6, dz); HL.sunGlow.visible = !!S.sun; g.add(HL.sunGlow);
    if (!S.melt) { q = ico(0.62, 1, 6240, 0.09); q.scale(1, 1.3, 1); HL.block = new T.Mesh(fac(q, (cx, cy2, cz, i) => (cy2 > 0.5 ? tone('#f1faff', i, 0.2) : tone(['#8fcdea', '#a9dcf2', '#c2e8f7'][i % 3], i, 0.3)), 6240), HL.ice); HL.block.position.set(dx, 0.98, dz); HL.block.castShadow = true; HL.block.renderOrder = 2; g.add(HL.block); } }
  /* the three mirrors: a turning stone, a post, a six-sided pane of clear ice in a golden frame; and each one's plate */
  HW.mir.forEach(([mx, mz], k) => { const [tx, tz] = k < 2 ? HW.mir[k + 1] : HW.dais, [sx, sz] = k ? HW.mir[k - 1] : [mx + HW.src[0], mz + HW.src[1]], dl = Math.hypot(HW.dais[0] - mx, HW.dais[1] - mz), px = mx + (HW.dais[0] - mx) / dl * 1.05, pz = mz + (HW.dais[1] - mz) / dl * 1.05;
    q = new T.CylinderGeometry(0.46, 0.54, 0.14, 8); jit(q, 0.012, 6260 + k); q.translate(mx, 0.07, mz); L.push(fac(q, (cx, cy2, cz, i) => tone(i % 3 ? '#a8a199' : '#bdb6ad', i, 0.3), 6260 + k));
    q = new T.CylinderGeometry(0.47, 0.52, 0.07, 8); q.rotateY(0.4); q.translate(px, 0.035, pz); L.push(fac(q, (cx, cy2, cz, i) => tone('#8f8a86', i, 0.3), 6270 + k)); /* the plate's seat */
    const tg = new T.Group(); tg.position.set(mx, 0, mz); g.add(tg); const P = [];
    q = new T.CylinderGeometry(0.3, 0.36, 0.2, 8); q.translate(0, 0.24, 0); P.push(fac(q, (cx, cy2, cz, i) => tone(i % 2 ? '#cfc6b3' : '#bdb3a0', i, 0.3), 6280 + k));
    q = new T.CylinderGeometry(0.055, 0.075, 0.42, 6); q.translate(0, 0.52, 0); P.push(fac(q, (cx, cy2, cz, i) => tone('#b5ab98', i, 0.3), 6290 + k));
    q = new T.CylinderGeometry(0.5, 0.5, 0.09, 6); q.rotateX(Math.PI / 2); q.translate(0, 1.12, 0); P.push(fac(q, (cx, cy2, cz, i) => tone(i % 2 ? '#e8c860' : '#d8b24a', i, 0.25), 6300 + k));
    hollowPut(P, tg); const fm = HL.glass.clone(); fm.userData = { noSnow: 1 }; q = new T.CylinderGeometry(0.41, 0.41, 0.12, 6); q.rotateX(Math.PI / 2); const face = new T.Mesh(q, fm); face.position.y = 1.12; tg.add(face);
    const pm = new T.CylinderGeometry(0.4, 0.43, 0.07, 8); pm.rotateY(0.4); const plate = new T.Mesh(fac(pm, (cx, cy2, cz, i) => (cy2 > 0.03 ? tone('#e8d9a0', i, 0.2) : tone('#b5ab98', i, 0.3)), 6310 + k), MAT); plate.position.set(px, 0.075, pz); plate.receiveShadow = true; g.add(plate);
    const ar = new T.Mesh(new T.PlaneGeometry(0.62, 0.62), new T.MeshBasicMaterial({ map: hollowTurnTex(), transparent: true, depthWrite: false })); ar.rotation.x = -Math.PI / 2; ar.position.y = 0.04; plate.add(ar);
    HL.mir.push({ g: tg, face, plate, x: mx, z: mz, px: wx(px), pz: wz(pz), base: Math.atan2(tz - mz, tx - mx), src: [sx - mx, sz - mz], to: [tx, tz], yaw: null, armed: true, lit: false });
    HL.solid.push([wx(mx), wz(mz), 0.58]); lookFoot(wx(mx), wz(mz), 0.6, 0.6); lookFoot(wx(px), wz(pz), 0.5, 0.5, 0); });
  /* the sunbeam: a shaft of light that falls through the snow clouds onto the first mirror, and the beams between */
  { const M = HL.mir[0], d = new T.Vector3(HW.src[0], 0.86, HW.src[1]).normalize(), up = new T.Vector3(0, 1, 0), qt = new T.Quaternion().setFromUnitVectors(up, d);
    [[1.05, 0.34, 0.5], [0.16, 0.09, 1.6]].forEach(([r1, r0, op]) => { q = new T.CylinderGeometry(r1, r0, 10, 10, 12, true); q.translate(0, 5, 0); const m = new T.Mesh(q, HL.halo.clone()); m.material.opacity = 0.3 * op; m.quaternion.copy(qt); m.position.set(M.x, 1.12, M.z); m.renderOrder = 4; g.add(m); (HL.shaft = HL.shaft || []).push(m); });
    for (let k = 0; k < 3; k++) { const b = new T.Group(); q = new T.CylinderGeometry(0.035, 0.035, 1, 6, 8, true); q.rotateX(Math.PI / 2); q.translate(0, 0, 0.5); const c1 = new T.Mesh(q, HL.beam); c1.renderOrder = 5; b.add(c1);
      q = new T.CylinderGeometry(0.12, 0.12, 1, 8, 8, true); q.rotateX(Math.PI / 2); q.translate(0, 0, 0.5); const c2 = new T.Mesh(q, HL.halo); c2.renderOrder = 4; b.add(c2); b.visible = false; g.add(b);
      const hit = hollowGlow(HL.warmTex, 0.9, 0.85); hit.visible = false; g.add(hit); HL.beams.push({ b, hit }); } }
  /* flowers and tufts of grass all over, clear of everything that stands or is walked on */
  { const taken = (x, z) => HL.solid.some((s) => Math.hypot(wx(x) - s[0], wz(z) - s[1]) < s[2] + 0.12) || HL.mir.some((M) => Math.hypot(wx(x) - M.px, wz(z) - M.pz) < 0.62) || Math.hypot(x - HW.vent[0], z - HW.vent[1]) < 1.15 || Math.hypot(x - HW.chest[0], z - HW.chest[1] - 0.4) < 1.0 || HW.bush.some((b) => Math.hypot(x - b[0], z - b[1]) < 0.7) || HW.frost.some((b) => Math.hypot(x - b[0], z - b[1]) < 0.5) || segD(x, z, -5.6, 0.05, -0.9, 0.1) < 0.5;
    for (let k = 0; k < 150; k++) { const a = hash(k, 6401) * 6.283, r = Math.sqrt(hash(k, 6402)) * 4.45, x = Math.cos(a) * r, z = Math.sin(a) * r; if (taken(x, z)) continue; hollowFlower(L, x, z, HL_COLS[Math.floor(hash(k, 6403) * HL_COLS.length)], 0.14 + hash(k, 6404) * 0.2, 6410 + k * 3); }
    for (let k = 0; k < 44; k++) { const a = hash(k, 6901) * 6.283, r = Math.sqrt(hash(k, 6902)) * 4.5, x = Math.cos(a) * r, z = Math.sin(a) * r; if (taken(x, z)) continue;
      for (let j = 0; j < 4; j++) { const h = 0.16 + hash(k * 4 + j, 6903) * 0.16; q = new T.ConeGeometry(0.035, h, 3); q.translate(0, h / 2, 0); q.rotateZ((hash(k + j, 6904) - 0.5) * 0.7); q.rotateY(j * 1.6); q.translate(x + (hash(k + j, 6905) - 0.5) * 0.14, 0, z + (hash(k + j, 6906) - 0.5) * 0.14); L.push(fac(q, (cx, cy2, cz, i) => shadeY(j % 2 ? '#5f9a45' : '#74b04f', cy2, 0, 0.3, i + k, 0.4), 6910 + k * 4 + j)); } } }
  const mesh = hollowPut(L, g); mesh.castShadow = true;
  if (I.length) { const ig = mergeGeos(I); ig.computeVertexNormals(); const im = new T.Mesh(ig, HL.icicle || (HL.icicle = new T.MeshStandardMaterial({ color: '#dff4ff', roughness: 0.1, metalness: 0.1, emissive: new T.Color('#4aa3d0'), emissiveIntensity: 0.45, transparent: true, opacity: 0.88 }))); HL.icicle.userData = { noSnow: 1 }; g.add(im); }
  /* what can be gathered: berry bushes in the warm, frost flowers in the shade of the rim and in the snow outside it,
     two pines in the west corners; and a chest under the apple tree */
  const pop = (n) => { if (fresh) { n.pop = 0.001; n.g.scale.setScalar(0.01); } };
  HW.bush.forEach(([x, z], k) => pop(makeNode('bush', wx(x), wz(z), 6950 + k)));
  HW.frost.forEach(([x, z], k) => { if (landSdf(wx(x), wz(z)) < -0.5) pop(makeNode('frostflower', wx(x), wz(z), 6960 + k)); });
  [[-5.35, -5.3], [-5.3, 5.35]].forEach(([x, z], k) => { if (landSdf(wx(x), wz(z)) < -0.5) pop(makeNode('tree', wx(x), wz(z), 6970 + k)); });
  if (!state.isle.chests.hollow) makeChest(wx(HW.chest[0]), wz(HW.chest[1]), { coin: 40, crystal: 8, berry: 12 }, 'hollow');
  /* the geyser, and its twin by the winter bridge; a ring on each */
  HL.vents = [hollowVent(wx(HW.vent[0]), wz(HW.vent[1]), 7000), hollowVent(HW.out[0], HW.out[1], 7040)];
  HL.vents.forEach((V, k) => HL.rings.push(ringMake({ x: V.x, z: V.z, y: 0.03, icon: 'geyser', ok: () => !!HAS.w5 && !HL.pop && !rising, go: () => hollowRide(k) })));
  /* butterflies */
  if (!reduced) for (let k = 0; k < 7; k++) { const b = new T.Group(), col = ['#f6d24a', '#ff8a5c', '#8fd0f0', '#f29ab8', '#ffffff', '#b89cf0', '#f6d24a'][k], wm = new T.MeshBasicMaterial({ color: col, side: T.DoubleSide }), W = [];
    [-1, 1].forEach((s) => { const wg = new T.BufferGeometry(); wg.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0.05, s * 0.13, 0, 0.1, s * 0.11, 0, -0.02, 0, 0, 0.05, s * 0.11, 0, -0.02, s * 0.07, 0, -0.1, 0, 0, 0.05, s * 0.07, 0, -0.1, 0, 0, -0.05], 3)); const w = new T.Mesh(wg, wm); b.add(w); W.push(w); });
    const bd = new T.Mesh(new T.BoxGeometry(0.02, 0.02, 0.12), new T.MeshBasicMaterial({ color: '#3a2c1c' })); b.add(bd); g.add(b);
    HL.flies.push({ b, W, hx: Math.cos(k * 0.9 + 0.4) * (1.2 + (k % 3) * 1.0), hz: Math.sin(k * 0.9 + 0.4) * (1.2 + (k % 3) * 1.0), ph: k * 1.9, sp: 0.5 + (k % 4) * 0.13 }); }
  /* a warm light in the hollow, and the glow that is seen from afar at night once the sun stone is found */
  HL.lamp = new T.PointLight('#ffdca0', 0, 11, 1.4); HL.lamp.position.set(0, 2.4, 0); g.add(HL.lamp);
  HL.night = hollowGlow(HL.warmTex, 13, 0); HL.night.position.set(0, 2.2, 0); g.add(HL.night);
  hollowBeams(false); hollowPaint(); SNX.key = ''; if (S.sun) hollowBloom(false);
  if (fresh) { g.scale.setScalar(0.01); HL.pop = 0.001; Snd.play('sparkle', { gain: 0.4 }, 0.3); }
}
SECRET_FILL.w5 = hollowFill;
/* the picture on a mirror's plate: an arrow that goes round */
function hollowTurnTex() {
  if (HL.turnTex) return HL.turnTex; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.translate(64, 64); x.lineCap = x.lineJoin = 'round';
  x.strokeStyle = '#8a5a2c'; x.lineWidth = 11; x.beginPath(); x.arc(0, 0, 34, -2.2, 2.4); x.stroke(); x.fillStyle = '#8a5a2c'; x.save(); x.rotate(2.4); x.translate(34, 0); x.beginPath(); x.moveTo(-17, -4); x.lineTo(17, -4); x.lineTo(0, 22); x.closePath(); x.fill(); x.restore();
  return (HL.turnTex = new T.CanvasTexture(c));
}
/* where each beam goes: a mirror that the light reaches sends it on, to the next one when it is turned right (step 0),
   else off to the rim. All three right: the light is on the sun stone. */
function hollowBeams(snd) {
  const S = hollowS(); let lit = true, n = 0;
  HL.mir.forEach((M, k) => { const st = S.m[k] || 0, a = M.base + st * Math.PI / 3, ux = Math.cos(a), uz = Math.sin(a), sl = Math.hypot(M.src[0], M.src[1]), nx = M.src[0] / sl + ux, nz = M.src[1] / sl + uz;
    M.want = Math.hypot(nx, nz) < 0.08 ? Math.atan2(ux, uz) : Math.atan2(nx, nz); if (M.yaw == null) M.yaw = M.want;
    const B = HL.beams[k]; B.b.visible = lit; B.hit.visible = lit; M.lit = lit; if (lit) n++;
    if (lit) { let ex, ez; if (st === 0) { ex = M.to[0]; ez = M.to[1]; } else { const b = M.x * ux + M.z * uz, c = M.x * M.x + M.z * M.z - 4.72 * 4.72, t = -b + Math.sqrt(Math.max(0, b * b - c)); ex = M.x + ux * t; ez = M.z + uz * t; }
      const len = Math.hypot(ex - M.x, ez - M.z); B.b.position.set(M.x, 1.12, M.z); B.b.rotation.y = Math.atan2(ex - M.x, ez - M.z); B.b.scale.set(1, 1, len); B.hit.position.set(ex - ux * 0.1, st === 0 && k === 2 ? 0.98 : 1.12, ez - uz * 0.1); B.hit.scale.setScalar(st === 0 ? 1.3 : 0.75); }
    lit = lit && st === 0; });
  if (lit) n++; if (snd && n > (HL.nLit || 0)) Snd.play('ding', { gain: 0.45, f: 560 + n * 150 }); HL.nLit = n;
  if (lit && !S.melt && !HL.melt && HL.block) { HL.melt = { t: 0 }; Snd.play('sparkle', { gain: 0.5 }, 0.2); Snd.play('secret', { gain: 0.55 }, 0.5); }
}
/* the geyser throws Pip over the island: from vent k to the other one */
function hollowRide(k) {
  const A = HL.vents[k], B = HL.vents[1 - k]; HL.rings.forEach((r) => { r.armed = false; r.w = 0; }); A.jet = 1.5; A.top = 3.4; let sp = 0;
  Snd.play('whoosh', { gain: 0.6, f: 240 }); Snd.play('riser', { gain: 0.35 }); splash(A.x, 0.4, A.z, 12); for (let j = 0; j < 5; j++) smokePuff(A.x + (Math.random() - 0.5) * 0.8, 0.4 + Math.random(), A.z + (Math.random() - 0.5) * 0.8, '#ffffff');
  rideGo({ pts: [[A.x, 0, A.z], [(A.x + B.x) / 2, 4.7, (A.z + B.z) / 2], [B.x, 0, B.z]], speed: 12.5,
    each: (R, dt) => { sp -= dt; if (sp <= 0 && !reduced) { sp = 0.09; splash(pip.position.x, pip.position.y - 0.1, pip.position.z, 2); } if (!R.near && R.len - R.d < 5) { R.near = 1; B.jet = 1.3; B.top = 1.6; } },
    onEnd: () => { HL.rings.forEach((r) => { r.armed = false; r.w = 0; }); B.jet = Math.max(B.jet, 0.5); splash(B.x, 0.4, B.z, 14); Snd.play('thud', { gain: 0.35 }); Snd.play('sparkle', { gain: 0.4 }); for (let j = 0; j < 4; j++) smokePuff(B.x + (Math.random() - 0.5) * 0.8, 0.3 + Math.random() * 0.6, B.z + (Math.random() - 0.5) * 0.8, '#ffffff'); } });
}
/* for good, once the sun stone is found: flowers in a ring round the frozen lake (the trails thaw through hollowWarm) */
function hollowBloom(anim) {
  const K = hollowLake(); if (!K || HL.bloom) return; const L = [], per = 2 * (K[2] + K[3]) * 2, n = Math.round(per / 0.19); let q;
  for (let k = 0; k < n; k++) { let t = (k + hash(k, 7101) * 0.6) / n * per, x, z; const off = 0.5 + hash(k, 7102) * 0.72, w = K[2] * 2, d = K[3] * 2;
    if (t < w) { x = K[0] - K[2] + t; z = K[1] - K[3] - off; } else if ((t -= w) < d) { x = K[0] + K[2] + off; z = K[1] - K[3] + t; } else if ((t -= d) < w) { x = K[0] + K[2] - t; z = K[1] + K[3] + off; } else { x = K[0] - K[2] - off; z = K[1] - K[3] + (t - w); }
    if (walkSdf(x, z) > -0.35 || roadKind(x, z) || Math.hypot(x - HW.out[0], z - HW.out[1]) < 1.2 || nodes.some((nd) => Math.abs(nd.x - x) < 0.5 && Math.abs(nd.z - z) < 0.5) || signs.some((s) => Math.hypot(s.x - x, s.z - z) < 0.6)) continue;
    if (k % 4 === 3) { for (let j = 0; j < 3; j++) { const h = 0.14 + hash(k + j, 7103) * 0.14; q = new T.ConeGeometry(0.035, h, 3); q.translate(0, h / 2, 0); q.rotateZ((hash(k + j, 7104) - 0.5) * 0.7); q.rotateY(j * 2.1); q.translate(x + (j - 1) * 0.06, 0, z); L.push(fac(q, (cx, cy, cz, i) => shadeY('#6aa84a', cy, 0, 0.3, i + k, 0.4), 7110 + k * 3 + j)); } }
    else hollowFlower(L, x, z, HL_COLS[Math.floor(hash(k, 7105) * HL_COLS.length)], 0.13 + hash(k, 7106) * 0.17, 7200 + k * 3); }
  if (!L.length) return; const g = HL.bloom = new T.Group(); sc.add(g); const m = hollowPut(L, g); m.castShadow = false; if (anim) { g.scale.y = 0.01; HL.bloomP = 0.001; }
}
function hollowStep(dt) {
  if (!state.isle) return; const S = hollowS(), pp = pip.position, out = !inCave;
  if (!HL.out && HAS.w3 && !(rising && rising.area === 'w3')) { hollowOutside(HL.seen); isleSigns(); } HL.seen = 1;
  if (!HL.out) return;
  HL.out.visible = out; if (HL.wallG) HL.wallG.visible = out; if (HL.g) HL.g.visible = out; if (HL.bloom) HL.bloom.visible = out; HL.vents.forEach((V) => { V.g.visible = out; });
  if (HL.outPop) { HL.outPop = Math.min(1, HL.outPop + dt * 1.5); if (HL.wallG) HL.wallG.scale.setScalar(HL.outPop); if (HL.outPop >= 1) HL.outPop = 0; }
  if (S.open && !HAS.w5 && !HL.seq && !rising) { if (HL.wallG) { sc.remove(HL.wallG); HL.wallG = null; } secretOpen('w5'); } /* paid, but the game was closed before the land rose */
  /* the wall's heart breathes; the braziers flicker */
  if (HL.core && HL.wallG && !HL.seq) HL.core.forEach((sp, k) => { const b = reduced ? 0.42 : 0.38 + 0.14 * Math.sin(time * 1.3 + k * 1.7); sp.material.opacity = b; sp.scale.setScalar(sp.userData.s * (0.95 + b * 0.2)); });
  HL.braz.forEach((B, k) => { if (B.on) B.gl.material.opacity = reduced ? 0.5 : 0.45 + 0.12 * Math.sin(time * 9 + k * 2); });
  /* paid: one brazier after the other, then the melt, then the land */
  if (HL.seq) { const Q = HL.seq; Q.t += dt;
    while (Q.lit < 3 && Q.t > 0.4 + Q.lit * 0.85) hollowLight(Q.lit++, true);
    if (Q.t > 3.1 && HL.wallG) { const u = Math.min(1, (Q.t - 3.1) / 4.4), e = u * u * (3 - 2 * u), W = HW.wall; HL.wallG.scale.set(1 - 0.4 * e, Math.max(0.02, 1 - e), 1 - 0.12 * e);
      HL.core.forEach((sp) => { sp.material.opacity = 0.5 + 0.5 * Math.sin(Math.min(1, u * 1.4) * Math.PI); sp.scale.setScalar(sp.userData.s * (1 + e * 1.2)); });
      if (HL.puddle) HL.puddle.scale.set(0.3 + e * 1.5, 1, 0.5 + e * 2.3);
      Q.st -= dt; if (Q.st <= 0) { Q.st = 0.11; if (!Q.snd) { Q.snd = 1; Snd.play('whoosh', { gain: 0.4, f: 160 }); } smokePuff(W.x + (Math.random() - 0.5) * 1.2, 0.3 + Math.random() * 2.4 * (1 - e), W.z + (Math.random() - 0.5) * 4.4, '#ffffff'); if (Math.random() < 0.5) splash(W.x - 0.8, 0.2 + Math.random() * 1.5 * (1 - e), W.z + (Math.random() - 0.5) * 4, 2); }
      if (u >= 1) { sc.remove(HL.wallG); HL.wallG = null; HL.core = null; Snd.play('success', { gain: 0.4 }); } }
    if (!HL.wallG && Q.t > 3.1) { if (HAS.w5 || secretOpen('w5')) { HL.seq = null; HL.pudT = 5; } } }
  if (HL.pudT > 0 && HL.puddle) { HL.pudT -= dt; const s = Math.max(0.01, HL.pudT / 5); HL.puddle.scale.set(1.8 * s, 1, 2.8 * s); if (HL.pudT <= 0) { sc.remove(HL.puddle); HL.puddle = null; } }
  /* warm ground is no deep snow: where gear.js halves Pip's pace for the snow, the step is made up here */
  { const L0 = HL.lp || (HL.lp = pp.clone()), mx = pp.x - L0.x, mz = pp.z - L0.z, m = Math.hypot(mx, mz), sl = gearSlow();
    if (sl < 1 && m > 1e-4 && m < 0.4 && out && !riding2() && !enSleep && pp.y < 0.3 && hollowWarm(pp.x, pp.z) > 0.5) { const left = Math.hypot(target.x - pp.x, target.z - pp.z), k = Math.min(1 / sl - 1, left / m); if (k > 0) { pp.x += mx * k; pp.z += mz * k; wClamp(pp); } }
    L0.copy(pp); }
  /* what stands in the way */
  if (out && !riding2()) { if (HL.wallG) mesaOut(HW.wall, pp, 0.3); HL.solid.forEach((s) => hollowPush(pp, s[0], s[1], s[2]));
    if (HL.g) { const dx = pp.x - HW.cx, dz = pp.z - HW.cz, r = Math.hypot(dx, dz); if (r > HW.R && r < 5.98 && !(dx < 0 && Math.abs(dz) < 0.85)) { const to = r < 5.25 ? HW.R : 5.98; pp.x = HW.cx + dx / r * to; pp.z = HW.cz + dz / r * to; } } }
  if (!HL.g) return;
  if (HL.pop) { HL.pop = Math.min(1, HL.pop + dt * 1.1); const s = HL.pop * HL.pop * (3 - 2 * HL.pop); HL.g.scale.set(s, s, s); if (HL.pop >= 1) HL.pop = 0; }
  const near = out && Math.hypot(pp.x - HW.cx, pp.z - HW.cz) < 22;
  /* the mirrors: a plate that Pip steps on turns its mirror one step */
  HL.mir.forEach((M, k) => { const d = Math.hypot(pp.x - M.px, pp.z - M.pz), on = d < 0.46 && pp.y < 0.5; if (d > 0.8) M.armed = true;
    M.plate.position.y += ((on ? 0.045 : 0.075) - M.plate.position.y) * Math.min(1, dt * 12);
    if (on && M.armed && !S.melt && !HL.melt && !riding2() && !HL.pop) { M.armed = false; S.m[k] = ((S.m[k] || 0) + 1) % 6; Snd.play('tock', { gain: 0.45, f: 380 + S.m[k] * 40 }); Snd.play('swish', { gain: 0.25 }); hollowBeams(true); save(); }
    let da = M.want - M.yaw; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; M.yaw += da * Math.min(1, dt * 7); M.g.rotation.y = M.yaw;
    M.face.material.emissiveIntensity += ((M.lit ? 1.15 : 0.3) - M.face.material.emissiveIntensity) * Math.min(1, dt * 5); });
  if (!reduced) { const p = 0.8 + 0.2 * Math.sin(time * 5); HL.beam.opacity = 0.75 + 0.2 * p; HL.halo.opacity = 0.22 + 0.1 * p; HL.beams.forEach((B, k) => { if (B.hit.visible) B.hit.material.rotation = time * 0.8 + k; }); HL.shaft[0].material.opacity = 0.13 + 0.03 * Math.sin(time * 0.9); }
  /* all three right: the ice round the sun stone melts away */
  if (HL.melt) { const Q = HL.melt; Q.t += dt; const u = Math.min(1, Q.t / 3.4), e = u * u * (3 - 2 * u), dx = HW.cx + HW.dais[0], dz = HW.cz + HW.dais[1];
    if (HL.block) { HL.block.scale.set(1 - 0.75 * e, Math.max(0.02, 1 - e), 1 - 0.75 * e); HL.block.position.y = 0.3 + 0.68 * (1 - e); }
    HL.drip -= dt; if (HL.drip <= 0) { HL.drip = 0.13; smokePuff(dx + (Math.random() - 0.5) * 0.8, 0.5 + Math.random() * 0.9, dz + (Math.random() - 0.5) * 0.8, '#ffffff'); if (Math.random() < 0.6) splash(dx, 0.5, dz, 2); }
    if (u >= 1) { if (HL.block) { HL.g.remove(HL.block); HL.block = null; } HL.melt = null; S.melt = 1; HL.free = 1.6; HL.rays.visible = true; burst(dx, 1.3, dz, 12); Snd.play('success', { gain: 0.45 }); xpGain(15); save(); } }
  if (HL.stone.visible) { HL.stone.rotation.y = time * 0.9; HL.stone.position.y = 0.95 + (S.melt && !reduced ? Math.sin(time * 1.6) * 0.05 + 0.08 : 0); HL.rays.position.y = HL.stone.position.y; HL.rays.material.rotation = time * 0.5; }
  /* and Pip takes it: the golden gift, and the warmth begins to spread over the island */
  if (HL.free > 0) HL.free -= dt;
  if (S.melt && !S.sun && !HL.melt && !(HL.free > 0) && !GO.hold && !riding2() && out && Math.hypot(pp.x - HW.cx - HW.dais[0], pp.z - HW.cz - HW.dais[1]) < 2.7) { S.sun = 1; HL.stone.visible = false; HL.rays.visible = false; HL.sunGlow.visible = true; goldGive('sun'); xpGain(40); HL.thawQ = { t: 0, k: 0 }; save(); }
  if (HL.thawQ) { const Q = HL.thawQ; Q.t += dt; if (Q.t > 4.4 + Q.k * 1.4 && !GO.hold) { Q.k++; HL.thaw = Q.k / 3; snxMap(); hollowPaint(); if (Q.k === 1) { hollowBloom(true); Snd.play('secret', { gain: 0.5 }); } if (Q.k >= 3) HL.thawQ = null; } }
  if (HL.bloomP) { HL.bloomP = Math.min(1, HL.bloomP + dt * 0.5); HL.bloom.scale.y = HL.bloomP * HL.bloomP * (3 - 2 * HL.bloomP); if (HL.bloomP >= 1) HL.bloomP = 0; }
  /* the geysers: a little spout now and then, a great one under Pip */
  HL.vents.forEach((V, k) => { V.jet -= dt; if (V.jet <= 0) { V.top = 0; V.idle -= dt; if (V.idle <= 0 && !riding2()) { V.idle = 7 + k * 2.5 + Math.random() * 3; if (out && Math.hypot(pp.x - V.x, pp.z - V.z) < 18 && !reduced) { V.jet = 1.1; V.top = 1.3; splash(V.x, 0.3, V.z, 5); if (Math.hypot(pp.x - V.x, pp.z - V.z) < 8) Snd.play('swish', { gain: 0.2, f: 300 }); } } }
    V.h += (V.top - V.h) * Math.min(1, dt * (V.top > V.h ? 9 : 3.5)); const vis = V.h > 0.04; V.col.visible = V.mist.visible = vis;
    if (vis) { const w = reduced ? 1 : 1 + Math.sin(time * 31) * 0.08; V.col.scale.set(w, V.h, w); V.mist.scale.set(2 - w, V.h * 0.85, 2 - w); if (!reduced && Math.random() < dt * 14) splash(V.x, V.h, V.z, 1); } });
  if (!near) return;
  /* life: steam over the pond and the vents, butterflies, the light */
  if (!reduced) { HL.steam -= dt; if (HL.steam <= 0) { HL.steam = 0.4; const [px, pz, pr] = HW.pond, a = Math.random() * 6.283, r = Math.random() * pr * 0.8; smokePuff(HW.cx + px + Math.cos(a) * r, 0.15, HW.cz + pz + Math.sin(a) * r, '#ffffff'); if (Math.random() < 0.5) { const V = HL.vents[0]; smokePuff(V.x + (Math.random() - 0.5) * 0.5, 0.15, V.z + (Math.random() - 0.5) * 0.5, '#ffffff'); } } }
  HL.flies.forEach((F) => { const t = time * F.sp + F.ph, x = F.hx + Math.sin(t * 1.3) * 0.9 + Math.sin(t * 0.37) * 0.6, z = F.hz + Math.cos(t * 1.1) * 0.9 + Math.cos(t * 0.29) * 0.6, r = Math.hypot(x, z), k = r > 4.1 ? 4.1 / r : 1;
    F.b.rotation.y = Math.atan2(x * k - F.b.position.x, z * k - F.b.position.z); F.b.position.set(x * k, 0.55 + Math.sin(t * 2.3) * 0.25 + Math.sin(t * 0.7) * 0.2, z * k); const fl = Math.sin(time * 17 + F.ph) * 1.05; F.W[0].rotation.z = fl; F.W[1].rotation.z = -fl; });
  HL.lamp.intensity = 0.3 + 1.4 * nightAmt; HL.night.material.opacity = S.sun ? 0.1 + 0.55 * nightAmt : 0.2 * nightAmt;
}
ISLE_STEPS.push(hollowStep);
