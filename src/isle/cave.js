/* ---------- the cave (Leon's idea list, 2026-11-23): stairs go down into a cave with rare crystals ----------
   The stairs stand in h3 (the second rocks area). Standing on the mat in front of them, the screen goes dark and Pip
   comes out in the cave: a rocky room with glowing crystals (gems, with the pickaxe) and the usual rocks and boulders.
   The cave is really a hill out at sea, south of h3: from outside it has a grassy rocky top; inside, the top is
   lifted off, the ground is dark and the edges of the screen go dim. Stairs up lead back out. */
const crystalMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.25, metalness: 0.1, emissive: new T.Color('#5a3fa0'), emissiveIntensity: 0.55 });
const CRYSTAL_GEO = (() => {
  const L = [];
  [[0, 0, 0.62, 0, 0], [0.2, 0.1, 0.42, 0.4, 0.25], [-0.2, 0.06, 0.48, -0.35, -0.2], [0.05, -0.22, 0.36, 0.15, -0.45], [-0.12, 0.22, 0.3, -0.2, 0.5]].forEach(([x, z, h, rz, rx], k) => {
    const q = new T.OctahedronGeometry(0.13, 0); q.scale(1, h / 0.13 * 0.5, 1); q.translate(0, h * 0.45, 0); q.rotateZ(rz); q.rotateX(rx); q.translate(x, 0, z);
    L.push(fac(q, (cx, cy, cz, i) => new T.Color(i % 3 === 0 ? '#e7dbff' : k % 2 ? '#9f7ff0' : '#7fd3ef'), 1600 + k)); });
  const b = ico(0.22, 0, 1610); b.scale(1.3, 0.5, 1.2); b.translate(0, 0.05, 0); L.push(fac(b, '#6a625a', 1610));
  return merged(L.map((q) => (q.index ? q.toNonIndexed() : q)), MAT, new T.Group()).geometry;
})();
let inCave = false, caveT = null, caveRoof = null, caveA = null;
const CAVE_IN = { x: 0, z: 0 }, CAVE_OUT = { x: 0, z: 0 };
/* little glowing mushrooms and dark pebbles on the cave floor */
function caveDecor(A, L, base) {
  for (let k = 0; k < 26; k++) { const x = A.cx + (hash(k, 91 + base) - 0.5) * 11, z = A.cz + (hash(k, 92 + base) - 0.5) * 11; if (!areaClear(x, z)) continue;
    const st = new T.CylinderGeometry(0.025, 0.03, 0.12, 5); st.translate(x, 0.06, z); L.push(fac(st, '#e8e0d0', 2100 + k));
    const cap = new T.SphereGeometry(0.075, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2); cap.translate(x, 0.11, z); L.push(fac(cap, k % 3 ? '#7fd3ef' : '#c59cf2', 2130 + k)); }
}
/* the cave's walls, the hill top seen from outside, and the stairs back up */
function caveBuild(A) {
  caveA = A; const L = [], R = [];
  const ring = (x, z, k) => { const h = 1.7 + hash(k, 5) * 1.5, r = 0.75 + hash(k, 6) * 0.35, q = ico(r, 1, 2200 + k); q.scale(1, h / r * 0.62, 1); jit(q, 0.06, 2200 + k); q.translate(x, h * 0.42, z);
    L.push(fac(q, (cx, cy, cz, i) => shadeY(hash(i, k) > 0.85 ? '#6f665c' : '#857a6e', cy, 0, h, i, 0.5), 2200 + k)); };
  let k = 0; const E = 5.7;
  for (let t = -E; t <= E + 0.01; t += 0.95) { ring(A.cx + t, A.cz - E, k++); ring(A.cx - E, A.cz + t, k++); ring(A.cx + E, A.cz + t, k++); if (Math.abs(t) > 1.4) ring(A.cx + t, A.cz + E, k++); }
  merged(L.map((q) => (q.index ? q.toNonIndexed() : q)), MAT);
  /* the stairs up: steps rising to the south, under a hole of daylight */
  const sx = A.cx, sz = A.cz + 4.6;
  for (let s = 0; s < 6; s++) { const q = new T.BoxGeometry(1.4, 0.18 + s * 0.18, 0.32); q.translate(sx, (0.18 + s * 0.18) / 2, sz + s * 0.3); R.push(fac(q, (cx, cy, cz, i) => tone('#a69c8a', i + s, 0.5), 2300 + s)); }
  merged(R.map((q) => (q.index ? q.toNonIndexed() : q)), MAT);
  const shaft = new T.Mesh(new T.CylinderGeometry(0.55, 0.95, 2.6, 14, 1, true), new T.MeshBasicMaterial({ color: '#fff3c4', transparent: true, opacity: 0.12, depthWrite: false, side: T.DoubleSide })); shaft.position.set(sx, 1.9, sz + 1.1); sc.add(shaft);
  CAVE_IN.x = sx; CAVE_IN.z = sz - 2.1; /* where Pip comes out in the cave */
  caveA.mat = stairMat('up', sx, sz - 0.9);
  /* the hill top, seen from outside */
  const H = []; const top = new T.SphereGeometry(7.4, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2); top.scale(1, 0.42, 1); jit(top, 0.22, 2400); top.translate(A.cx, 0, A.cz);
  H.push(fac(top, (cx, cy, cz, i) => (cy > 2.0 ? tone('#8fbf5a', i, 0.6) : shadeY('#9a8f80', cy, 0, 2.2, i, 0.5)), 2400));
  for (let q = 0; q < 6; q++) { const a = q / 6 * 6.28 + 0.4, b = ico(1.0 + hash(q, 2) * 0.6, 1, 2410 + q); b.scale(1, 0.8, 1); jit(b, 0.08, 2410 + q); b.translate(A.cx + Math.cos(a) * 5.6, 0.5, A.cz + Math.sin(a) * 5.6); H.push(fac(b, (cx, cy, cz, i) => shadeY('#8a8074', cy, 0, 1.6, i, 0.5), 2410 + q)); }
  caveRoof = merged(H.map((q) => (q.index ? q.toNonIndexed() : q)), MAT);
}
/* a round mat with a stairs picture: 'down' into the cave, 'up' out of it; a gold arc fills while Pip stands on it */
function stairMat(dir, x, z) {
  const R = 0.6, c = document.createElement('canvas'); c.width = c.height = 256; const q = c.getContext('2d');
  q.fillStyle = dir === 'down' ? '#3b3348' : '#f4e3b0'; q.beginPath(); q.arc(128, 128, 124, 0, 7); q.fill();
  isleIcon(q, dir === 'down' ? 'stairsDown' : 'stairsUp', 128, 132, 3.4);
  const pad = new T.Mesh(new T.CircleGeometry(R, 40), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true })); pad.rotation.x = -Math.PI / 2; pad.position.set(x, 0.05, z); sc.add(pad);
  const fg = new T.RingGeometry(R - 0.02, R + 0.1, 40, 1, Math.PI / 2, -Math.PI * 2);
  const f = new T.Mesh(fg, new T.MeshBasicMaterial({ color: '#f4b23a', side: T.DoubleSide })); f.rotation.x = -Math.PI / 2; f.position.set(x, 0.06, z); sc.add(f); fg.setDrawRange(0, 0);
  return { x, z, R, pad, fg, w: 0, dir };
}
/* the way down, in h3: a stone frame round a dark hole with steps going down */
let stairsDown = null;
function stairsBuild(A, fresh) {
  const x = A.cx + A.stairs[0], z = A.cz + A.stairs[1], g = new T.Group(); g.position.set(x, 0, z); sc.add(g); const L = [];
  const hole = new T.Mesh(new T.PlaneGeometry(1.25, 1.5), new T.MeshBasicMaterial({ color: '#1d1824' })); hole.rotation.x = -Math.PI / 2; hole.position.set(0, 0.03, -0.15); g.add(hole);
  for (let s = 0; s < 4; s++) { const q = new T.PlaneGeometry(1.15, 0.26); q.rotateX(-Math.PI / 2); q.translate(0, 0.035, 0.42 - s * 0.3); const m = new T.Mesh(q, new T.MeshBasicMaterial({ color: new T.Color('#8a8074').multiplyScalar(1 - s * 0.22) })); g.add(m); }
  [-0.78, 0.78].forEach((px, k) => { const q = new T.BoxGeometry(0.28, 1.25, 0.32); jit(q, 0.02, 2500 + k); q.translate(px, 0.62, -0.9); L.push(fac(q, (cx, cy, cz, i) => shadeY('#9a9184', cy, 0, 1.3, i, 0.5), 2500 + k)); });
  let q = new T.BoxGeometry(1.9, 0.3, 0.38); jit(q, 0.02, 2502); q.translate(0, 1.36, -0.9); L.push(fac(q, (cx, cy, cz, i) => (cy > 1.45 && hash(i, 3) > 0.4 ? new T.Color('#6f9a4a') : shadeY('#a39a8c', cy, 1.2, 1.5, i, 0.5)), 2502));
  for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28, b = ico(0.16 + hash(k, 8) * 0.1, 0, 2510 + k); b.scale(1.2, 0.6, 1); b.translate(Math.cos(a) * 0.95, 0.06, Math.sin(a) * 1.0 - 0.15); L.push(fac(b, tone('#a9a090', k, 0.6), 2510 + k)); }
  merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g);
  stairsDown = stairMat('down', x, z + 1.15); stairsDown.g = g; CAVE_OUT.x = x; CAVE_OUT.z = z + 2.25;
  if (fresh) { g.scale.setScalar(0.01); stairsDown.pop = 0.001; }
}
/* the dark edges of the screen in the cave, and the black fade on the way through */
const caveDark = (() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2;opacity:0;transition:opacity .6s;background:radial-gradient(ellipse 62% 58% at 50% 52%,rgba(20,14,30,0) 35%,rgba(20,14,30,.55) 75%,rgba(12,8,20,.85) 100%)'; document.body.appendChild(d); return d; })();
const caveFade = (() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:30;opacity:0;background:#0d0a12'; document.body.appendChild(d); return d; })();
function caveGo(down) {
  caveT = { t: 0, down, moved: false }; Snd.play(down ? 'whoosh' : 'pop', { gain: 0.35, f: down ? 300 : 520 }); work = null;
}
function caveStep(dt) {
  if (stairsDown && stairsDown.pop) { stairsDown.pop = Math.min(1, stairsDown.pop + dt * 1.5); stairsDown.g.scale.setScalar(stairsDown.pop); if (stairsDown.pop >= 1) stairsDown.pop = 0; }
  if (caveRoof) caveRoof.visible = !inCave;
  if (inCave) { streaks.visible = ringMesh.visible = dropPts.visible = pudMesh.visible = false; } /* no rain under the hill */
  if (caveT) {
    const C = caveT; C.t += dt; caveFade.style.opacity = String(C.t < 0.45 ? C.t / 0.45 : Math.max(0, 1 - (C.t - 0.65) / 0.45));
    target.copy(pip.position);
    if (!C.moved && C.t >= 0.5) { C.moved = true; inCave = C.down; const p = inCave ? CAVE_IN : CAVE_OUT;
      pip.position.set(p.x, 0, p.z); target.copy(pip.position); camFocus.copy(pip.position); if (typeof lastP !== 'undefined') lastP.copy(pip.position);
      if (typeof dog !== 'undefined' && dog.g) dog.g.position.set(p.x - 0.8, 0, p.z + 0.4);
      caveDark.style.opacity = inCave ? '1' : '0'; if (!inCave) isleBoxStep(); }
    if (C.t > 1.15) { caveFade.style.opacity = '0'; caveT = null; }
    return;
  }
  /* inside, Pip stays off the walls */
  if (inCave && caveA) { pip.position.x = clamp(pip.position.x, caveA.cx - 4.9, caveA.cx + 4.9); pip.position.z = clamp(pip.position.z, caveA.cz - 4.9, caveA.cz + 4.2); }
  [stairsDown, caveA && caveA.mat].forEach((M) => {
    if (!M) return; const d = Math.hypot(pip.position.x - M.x, pip.position.z - M.z), still = Math.hypot(target.x - pip.position.x, target.z - pip.position.z) < 0.3;
    const on = d < M.R && still && !enSleep && (M.dir === 'down' ? !inCave : inCave);
    M.w = on ? Math.min(1, M.w + dt / 0.6) : Math.max(0, M.w - dt * 3); M.fg.setDrawRange(0, 6 * Math.round(40 * M.w));
    if (M.w >= 1) { M.w = 0; M.fg.setDrawRange(0, 0); caveGo(M.dir === 'down'); }
  });
}
