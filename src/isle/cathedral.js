/* ---------- the Crystal Cathedral (area cave7): the mine's hidden world, under the lake (cave.js) ----------
   The lake room's dark water hides it; the sluice wheel on the marsh island drains the lake, and stairs wind down into a
   hall of crystals as tall as houses, pillars of light, a still mirror pool in the middle, and a soft hum in the air.
     toy:    four great light crystals round the pool, each its own colour and its own note. A wandering light waits by
             the one to touch next; touched in turn they stay lit. A different one only hums, and the light shows the
             right one again. When all four shine, their beams meet under the roof and the golden star heart comes
             down to the middle of the pool.
     gift:   the golden star heart (goldGive('starheart')), taken by wading out to it.
     ride:   the mine cart (cave.js), between the entry hall and the deep gallery.
     after:  every crystal in the mine sparkles, gives one more and is back in a moment; the great crystal in the entry
             hall wakes and lights the whole room (cave.js: mineLook2, caveStep).
   state.isle.cathedral = { n: how many crystals are lit, lit: 1 the heart has come down, done: 1 it is found, seen: 1 } */
const CATH = { x: 0, z: 56, in: { x: 0, z: 58.9 }, out: { x: 0, z: 47.05 }, pool: [0, 55.4, 2.15], order: [2, 1, 0, 3],
  cr: [[-3.35, 53.7, 'C5', '#ff8fb8', ['#ffd9ea', '#ff9cc4', '#ffffff']], [3.35, 53.7, 'E5', '#ffc24a', ['#fff0c0', '#ffd066', '#ffffff']], [-3.0, 58.2, 'G5', '#5fd8ff', ['#d8f6ff', '#7fdcff', '#ffffff']], [3.0, 58.2, 'C6', '#b08cff', ['#ece2ff', '#b89cff', '#ffffff']]] };
const CA = { g: null, cr: [], wisp: null, wx: null, heart: null, fin: 0, beams: [], rip: [], ripT: 0, hum: 2, motes: null, pillar: null, in: false };
const cathS = () => state.isle.cathedral || (state.isle.cathedral = {});
function cathGlowTex(a, b) { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 1, 32, 32, 31); g.addColorStop(0, a); g.addColorStop(0.35, b); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c); }
const cathShaft = (x, z, r, h, col, op) => { const m = new T.Mesh(new T.CylinderGeometry(r * 0.55, r, h, 14, 1, true), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending })); m.position.set(x, h / 2, z); m.renderOrder = 3; return m; };
SECRET_FILL.cave7 = (A) => {
  mineBuild(); if (CA.g) return; const g = CA.g = new T.Group(); CV.g.add(g); const L = [], F = [], GL = [], X = CATH.x, Z = CATH.z, S = cathS(); let q;
  /* the floor: dark polished stone, a star of pale bands round the pool */
  { q = new T.PlaneGeometry(12, 11.6, 48, 46); q.rotateX(-Math.PI / 2); q.translate(X, 0, Z + 0.2); const P = q.attributes.position; for (let i = 0; i < P.count; i++) P.setY(i, 0.014 + hash(Math.round(P.getX(i) * 4), Math.round(P.getZ(i) * 4), 78) * 0.012);
    const pale = new T.Color('#9a9ad8'), deep = new T.Color('#34315c'); const m = new T.Mesh(cvPaint(q, (x, y, z, i) => { const dx = x - CATH.pool[0], dz = z - CATH.pool[1], d = Math.hypot(dx, dz), a = Math.atan2(dz, dx), c = tone('#565683', i, 0.5);
      const ray = Math.abs(Math.sin(a * 4)) < 0.16 && d > 2.5 && d < 4.6, ring = Math.abs(d - 2.75) < 0.2 || Math.abs(d - 4.6) < 0.14; if (ray || ring) c.lerp(pale, 0.55); else if (d < 2.4) c.lerp(deep, 0.7);
      const s = mineSdf(x, z, true); if (s > -0.9) c.multiplyScalar(0.7 + 0.3 * clamp(-s / 0.9, 0, 1)); return c; }), MAT); m.receiveShadow = true; g.add(m); }
  /* the rim: dark rock, and out of it the giant crystals: as tall as houses at the back, lower to the sides, small in front where we look in */
  mineRocks(L, F, -6.2, 6.3, 51.0, 61.9, (x, z) => Math.abs(x - X) < 1.3 && z > 60.4);
  const RA = [], RB = [], PA = ['#b9c8ff', '#7f96f0', '#9fb4ff', '#e6ecff'], PB = ['#ffc4e0', '#e88cc0', '#d8b0f4', '#fff0f8'];
  [[-5.2, 54.6, 4.4, 0], [-4.6, 52.3, 5.6, 1], [-3.0, 51.2, 6.4, 0], [-1.0, 50.9, 5.2, 1], [1.2, 50.8, 6.8, 0], [3.2, 51.3, 5.4, 1], [4.8, 52.5, 6.0, 0], [5.3, 54.9, 4.2, 1], [-5.4, 57.2, 3.0, 1], [5.4, 57.4, 3.2, 0], [-4.9, 59.6, 1.7, 0], [4.9, 59.7, 1.8, 1], [-3.2, 60.9, 0.9, 1], [3.3, 60.9, 1.0, 0]].forEach(([x, z, h, m], k) => {
    cvCluster(m ? RB : RA, x, z, h, m ? PB : PA, 5000 + k * 10, h > 4 ? 5 : 4); CV.lights.push({ x, y: Math.min(2.4, h * 0.5), z, r: 2.2 + h * 0.55 }); if (mineSdf(x, z, true) < 0.1) CV.solid.push([x, z, 0.35 + h * 0.13]); });
  CA.matA = crystalMat.clone(); CA.matA.emissive = new T.Color('#4a66e0'); CA.matA.emissiveIntensity = 0.3; CA.matB = crystalMat.clone(); CA.matB.emissive = new T.Color('#c35f9e'); CA.matB.emissiveIntensity = 0.26;
  merged(RA, CA.matA, g).castShadow = false; merged(RB, CA.matB, g).castShadow = false;
  /* the stairs back up, under their own light */
  for (let s = 0; s < 6; s++) { q = new T.BoxGeometry(1.4, 0.18 + s * 0.18, 0.32); q.translate(X, (0.18 + s * 0.18) / 2, Z + 4.95 + s * 0.3); L.push(fac(q, (cx, cy, cz, i) => tone('#8f8fc0', i + s, 0.5), 5200 + s)); }
  g.add(cathShaft(X, Z + 5.9, 0.95, 4.4, '#cfe0ff', 0.12));
  const M = CA.mat = stairMat('up', X, Z + 4.25); M.ok = () => inCave && !GO.hold && !CA.fin; M.to = () => CATH.out; M.cave = true; CV.mats.push(M);
  /* the mirror pool: still, dark, with the hall's lights lying in it; a low ring of pale stone round it */
  { const [px, pz, pr] = CATH.pool, c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), gr = x.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, '#3c5c9c'); gr.addColorStop(0.5, '#1c2a5c'); gr.addColorStop(1, '#0e1436'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
    [[70, 40, '#ffd9ea'], [186, 40, '#fff0c0'], [78, 196, '#d8f6ff'], [180, 196, '#ece2ff'], [112, 22, '#dfe6ff'], [146, 18, '#ffffff'], [128, 128, '#ffffff']].forEach(([a, b, col], k) => { const g2 = x.createRadialGradient(a, b, 1, a, b, k === 6 ? 46 : 30); g2.addColorStop(0, col); g2.addColorStop(1, 'rgba(255,255,255,0)'); x.globalAlpha = k === 6 ? 0.35 : 0.5; x.fillStyle = g2; x.beginPath(); x.ellipse(a, b, k === 6 ? 46 : 12, k === 6 ? 46 : 30, 0, 0, 7); x.fill(); });
    x.globalAlpha = 0.8; x.fillStyle = '#ffffff'; for (let k = 0; k < 40; k++) x.fillRect(128 + (hash(k, 5300) - 0.5) * 220, 128 + (hash(k, 5301) - 0.5) * 220, 1.6, 1.6);
    q = new T.CircleGeometry(pr, 40); q.rotateX(-Math.PI / 2); CA.pool = new T.Mesh(q, new T.MeshStandardMaterial({ map: new T.CanvasTexture(c), roughness: 0.1, metalness: 0.25, emissive: new T.Color('#2a3c7a'), emissiveIntensity: 0.5 })); CA.pool.position.set(px, 0.05, pz); g.add(CA.pool);
    q = new T.TorusGeometry(pr + 0.08, 0.13, 5, 36); q.rotateX(Math.PI / 2); q.scale(1, 0.45, 1); q.translate(px, 0.05, pz); L.push(fac(cvQ(q), (cx, cy, cz, i) => tone(i % 5 ? '#c9c9ee' : '#e6e6ff', i, 0.4), 5310));
    for (let k = 0; k < 3; k++) { q = new T.RingGeometry(0.2, 0.26, 24); q.rotateX(-Math.PI / 2); const m = new T.Mesh(q, new T.MeshBasicMaterial({ color: '#dff0ff', transparent: true, opacity: 0, depthWrite: false })); m.position.y = 0.07; g.add(m); CA.rip.push({ m, t: 9 }); }
    CA.pillar = cathShaft(px, pz, 1.5, 7.5, '#dfe9ff', 0.07); g.add(CA.pillar); g.add(cathShaft(-2.2, 51.9, 0.8, 7, '#cfd8ff', 0.06)); g.add(cathShaft(2.6, 52.1, 0.7, 7, '#ffe0f0', 0.05));
    CV.lights.push({ x: px, y: 0.3, z: pz, r: 6.5 }, { x: X, y: 0.5, z: Z + 4.6, r: 3.6 }); CV.spots.push({ x: px, y: 3.2, z: pz, c: '#c8d6ff', i: 1.7 }); }
  /* the four light crystals: one tall spire each on a foot of pale stone; dim until it is touched in its turn */
  CATH.cr.forEach(([x, z, note, col, pal], k) => { const P = [], mat = crystalMat.clone(); mat.emissive = new T.Color(col);
    cvCrystal(P, x, 0.25, z, 3.0 + (k % 2) * 0.3, 0.44, 0.05, k * 1.3, pal, 5400 + k * 10); for (let j = 0; j < 3; j++) { const a = j * 2.1 + k; cvCrystal(P, x + Math.cos(a) * 0.38, 0.2, z + Math.sin(a) * 0.38, 1.0 + j * 0.25, 0.2, 0.4, a, pal, 5403 + k * 10 + j); }
    const m = merged(P, mat, g); m.castShadow = true; q = new T.CylinderGeometry(0.72, 0.86, 0.3, 8); q.translate(x, 0.15, z); L.push(fac(cvQ(q), (cx, cy, cz, i) => shadeY('#b9b9e0', cy, 0, 0.3, i + k, 0.4), 5450 + k));
    const sh = cathShaft(x, z, 0.7, 7, col, 0); g.add(sh); const B = { x, z, note, mat, sh, lit: 0, hum: 0, in: false, k }; CA.cr.push(B); CV.solid.push([x, z, 0.82]);
    CV.lights.push({ x, y: 1.4, z, r: 2.6 }, { x, y: 1.4, z, r: 4.6, on: () => B.lit > 0.5 });
    const bm = new T.Mesh(new T.CylinderGeometry(0.035, 0.07, 1, 6, 1, true), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85, depthWrite: false, blending: T.AdditiveBlending })); bm.geometry.translate(0, 0.5, 0); bm.geometry.rotateX(Math.PI / 2); bm.position.set(x, 3.3, z); bm.lookAt(CATH.pool[0], 7.2, CATH.pool[1]); bm.visible = false; g.add(bm); CA.beams.push(bm); });
  /* the wandering light, the dust in the pillars, the star heart waiting under the roof */
  CA.wisp = new T.Sprite(new T.SpriteMaterial({ map: cathGlowTex('rgba(255,255,255,1)', 'rgba(255,240,170,0.55)'), transparent: true, depthWrite: false, blending: T.AdditiveBlending })); CA.wisp.scale.setScalar(0.85); CA.wisp.renderOrder = 6; g.add(CA.wisp);
  { const W = new T.BufferGeometry(), P = new Float32Array(48 * 3); W.setAttribute('position', new T.BufferAttribute(P, 3)); CA.motes = new T.Points(W, new T.PointsMaterial({ color: '#eef2ff', size: 0.085, transparent: true, opacity: 0.8, depthWrite: false, blending: T.AdditiveBlending })); CA.motes.frustumCulled = false; g.add(CA.motes); }
  CA.heart = new T.Mesh(goldGeo('starheart'), goldMat); CA.heart.scale.setScalar(1.5); CA.heart.visible = false; g.add(CA.heart);
  CA.halo = new T.Sprite(new T.SpriteMaterial({ map: cathGlowTex('rgba(255,250,210,0.95)', 'rgba(255,214,110,0.4)'), transparent: true, depthWrite: false, blending: T.AdditiveBlending })); CA.halo.visible = false; CA.halo.renderOrder = 5; g.add(CA.halo);
  /* what grows here: the mine's best crystals, two star crystals, and a chest between the back crystals */
  [['crystal', -4.3, 56.0, 3], ['crystal', 4.4, 56.2, 3], ['crystal', 1.9, 52.3, 3], ['crystal', -2.0, 52.2, 3], ['glow', -4.1, 58.9], ['glow', 4.0, 59.2]].forEach(([k, x, z, t], n) => mineNode(k, x, z, 5500 + n, t));
  if (!state.isle.chests.cath) makeChest(0, 51.9, { coin: 60, glow: 2, crystal: 10 }, 'cath');
  const m = merged(L.map(cvQ), MAT, g); m.castShadow = true; m.receiveShadow = true; if (F.length) merged(F, MAT, g).castShadow = false;
  CA.n = S.lit ? 4 : Math.min(4, S.n || 0);
};
function cathStep(dt) {
  if (!CA.g || !inCave) { CA.in = false; return; } const pp = pip.position, S = cathS(), here = pp.z > 50.6 && !caveT, [px, pz, pr] = CATH.pool;
  if (!here) { CA.in = false; return; }
  if (!CA.in) { CA.in = true; CA.hum = 1.5; if (!S.seen) { S.seen = 1; ['C5', 'G5', 'E6'].forEach((f, k) => Snd.play('bell', { gain: 0.3, f }, 0.5 + k * 0.45)); Snd.play('sparkle', { gain: 0.3 }, 1.9); save(); } }
  /* the hall's own soft hum */
  CA.hum -= dt; if (CA.hum <= 0) { CA.hum = 5.5 + Math.random() * 2; Snd.play('bell', { gain: 0.07, f: 'C4' }); Snd.play('bell', { gain: 0.05, f: 'G4' }, 1.4); }
  /* the light crystals: walk up to one to touch it */
  const next = CA.n < 4 ? CA.cr[CATH.order[CA.n]] : null; if (CA.n === 4 && !S.lit && !CA.fin) CA.fin = 0.001; /* closed in the middle of the great moment: it plays again */
  CA.cr.forEach((B) => { const inn = Math.hypot(pp.x - B.x, pp.z - B.z) < 1.3, on = CATH.order.indexOf(B.k) < CA.n;
    if (inn && !B.in && !CA.fin && !GO.hold) { B.hum = 1; Snd.play('bell', { gain: 0.5, f: B.note });
      if (B === next) { CA.n++; S.n = CA.n; burst(B.x, 2.2, B.z, 10); Snd.play('sparkle', { gain: 0.4 }, 0.15); if (CA.n === 4) { CA.fin = 0.001; Snd.play('secret', { gain: 0.6 }, 0.5); } save(); }
      else if (!on) { CA.lost = 1.2; Snd.play('blip', { gain: 0.15, f: 300 }, 0.3); } }
    B.in = inn; B.hum = Math.max(0, B.hum - dt * 0.7); B.lit += ((on ? 1 : 0) - B.lit) * Math.min(1, dt * 3);
    B.mat.emissiveIntensity = 0.16 + B.lit * (0.95 + (reduced ? 0 : Math.sin(time * 2.2 + B.k * 1.7) * 0.15)) + B.hum * 0.7; B.sh.material.opacity = B.lit * 0.13 + B.hum * 0.06; });
  /* the wandering light: it circles the crystal to touch next; after a wrong touch it swings out over the pool and comes back */
  { CA.lost = Math.max(0, (CA.lost || 0) - dt); const t = next || { x: px, z: pz }, a = time * 1.5, r = next ? 1.0 + CA.lost * 1.6 : 0.5, tx = t.x + Math.cos(a) * r + (px - t.x) * CA.lost * 0.5, tz = t.z + Math.sin(a) * r * 0.8 + (pz - t.z) * CA.lost * 0.5, ty = next ? 1.7 + Math.sin(time * 2.3) * 0.35 : 2.4;
    if (CA.wx == null) { CA.wx = tx; CA.wz = tz; CA.wy = ty; } const e = Math.min(1, dt * 2.2); CA.wx += (tx - CA.wx) * e; CA.wz += (tz - CA.wz) * e; CA.wy += (ty - CA.wy) * e;
    CA.wisp.position.set(CA.wx, CA.wy, CA.wz); CA.wisp.scale.setScalar(0.8 + (reduced ? 0 : Math.sin(time * 6) * 0.1)); CA.wisp.visible = !!next; }
  /* all four shine: the beams meet under the roof, and the star heart comes down to the middle of the pool */
  const hy = 1.25 + (reduced ? 0 : Math.sin(time * 1.6) * 0.06);
  if (CA.fin) { CA.fin += dt; const f = CA.fin; target.copy(pp); CA.beams.forEach((b, k) => { b.visible = true; b.scale.set(1, 1, Math.min(1, Math.max(0.01, (f - 0.3 - k * 0.15) / 0.8)) * Math.hypot(b.position.x - px, 3.9, b.position.z - pz)); });
    if (f > 1.0 && f - dt <= 1.0) ['C5', 'E5', 'G5', 'C6'].forEach((n, k) => Snd.play('bell', { gain: 0.35, f: n }, k * 0.22));
    const d = clamp((f - 1.6) / 3.2, 0, 1), e = d * d * (3 - 2 * d); CA.heart.visible = CA.halo.visible = f > 1.6; CA.heart.position.set(px, 7.0 - (7.0 - hy) * e, pz); if (f > 5.2) { CA.fin = 0; S.lit = 1; burst(px, 1.4, pz, 14); Snd.play('sparkle', { gain: 0.45 }); save(); } }
  else { const show = !!S.lit && !S.done && !golds().starheart; CA.heart.visible = CA.halo.visible = show; if (show) CA.heart.position.set(px, hy, pz); CA.beams.forEach((b, k) => { b.visible = !!S.lit; if (S.lit) b.scale.set(1, 1, Math.hypot(b.position.x - px, 3.9, b.position.z - pz)); b.material.opacity = 0.6 + (reduced ? 0 : Math.sin(time * 3 + k) * 0.2); }); }
  if (CA.heart.visible) { CA.heart.rotation.y = time * 1.3; CA.halo.position.copy(CA.heart.position); CA.halo.scale.setScalar(1.7 + (reduced ? 0 : Math.sin(time * 4) * 0.2)); }
  CA.pillar.material.opacity = (S.lit || CA.fin > 1 ? 0.16 : 0.06) + (reduced ? 0 : Math.sin(time * 0.9) * 0.015);
  /* the gift: wade out to it */
  if (S.lit && !S.done && !CA.fin && !golds().starheart && !GO.hold && Math.hypot(pp.x - px, pp.z - pz) < 0.8) { S.done = 1; CA.heart.visible = CA.halo.visible = false; goldGive('starheart'); mineLook2(); }
  /* rings on the mirror where Pip wades, dust drifting up through the light */
  { const inPool = Math.hypot(pp.x - px, pp.z - pz) < pr - 0.1, moving = Math.hypot(target.x - pp.x, target.z - pp.z) > 0.2; CA.ripT -= dt;
    if (inPool && moving && CA.ripT <= 0) { CA.ripT = 0.34; const R = CA.rip.reduce((a, b) => (b.t > a.t ? b : a)); R.t = 0; R.m.position.set(pp.x, 0.07, pp.z); if (Math.random() < 0.5) Snd.play('pop', { gain: 0.06, f: 700 + Math.random() * 200 }); }
    CA.rip.forEach((R) => { R.t += dt; const k = R.t / 1.1; R.m.visible = k < 1; if (k < 1) { R.m.scale.setScalar(1 + k * 4); R.m.material.opacity = 0.7 * (1 - k); } });
    const P = CA.motes.geometry.attributes.position; for (let k = 0; k < 48; k++) { const u = (time * (0.05 + (k % 5) * 0.012) + hash(k, 5600)) % 1, a = k * 2.4 + time * 0.05, r = k % 3 ? 0.4 + hash(k, 5601) * 4.6 : hash(k, 5601) * 1.4; P.setXYZ(k, px + Math.cos(a) * r, 0.2 + u * 5.5, pz + 0.3 + Math.sin(a) * r * 0.85); } P.needsUpdate = true; }
}
ISLE_STEPS.push(cathStep);
