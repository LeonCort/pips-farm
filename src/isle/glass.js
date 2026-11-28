/* ---------- the Glass Forest (ember island, area e5): a hidden world (secret.js says how they plug in) ----------
   Down the east edge of the ash fields runs the great lava river (rules.js EMBER.river), too wide for crystals to cool.
   Across it, through the heat, tall shapes glitter on black rocks out in the sea: trees of glass. A small fire bird
   sits on a rock on the near bank and looks across. The sign by the bank asks for frost flowers from the winter island.
   Pip throws them in: the lava sets from the near bank across into dark stepping stones, steam goes up, and the land
   behind rises: where lava once met sand everything turned to glass. Twisting trees of amber, rose, sea green and violet
   glass that throw moving patches of coloured light on the black sand, glass flowers that chime when Pip passes, pools
   of glass that is still warm. At night the whole forest glows.
     toy:    four great glass bells hang round the middle pool. The fire bird flies to one and makes it flash; Pip walks
             under that one, it rings and stays lit, and the bird flies on. A different bell only rings softly and the
             bird shows the right one again. When all four are lit they play their tune, their light meets over the
             pool and the golden heart of glass rises out of it.
     gift:   the golden heart of glass (goldGive('glass')), taken at the pool's edge.
     ride:   the glassblower's patchwork balloon, the fire bird on its burner. One ring in the forest, one by the bridge
             where Pip comes onto the island; it floats along the trails between them, both ways.
     after:  the fire bird follows Pip all over the ember island and lights the dark; glass flowers grow along every
             lava bank, and now and then one of them holds an ember.
   state.isle.glass = { cool: 1 the river is crossed, lit: 1 the four bells are lit, done: 1 the heart is found } */
const GL = { out: null, g: null, u: { value: 0.22 }, ub: { value: 0.5 }, solid: [], pat: null, bells: [], step: 0, fin: 0, show: 0, flw: [], pools: [], bird: null, bal: null, fly: null, rings: 0, cool: 0, thrown: [], stones: [], crust: null, aft: null, buds: [], ripe: -1, ripeT: 25, lamp: null, haze: [], pop: 0, sea: 0, beams: [], heart: null, tips: [], sparks: [] };
const glassS = () => state.isle.glass || (state.isle.glass = {});
const GLASS = { sign: [43.45, 39.85], rock: [43.75, 42.1], entry: { ring: [28.95, 23.6], park: [29.7, 22.8] }, wood: { ring: [53.8, 44.5], park: [55.0, 44.0] }, pool: [0.2, -0.4, 1.25], order: [1, 3, 0, 2],
  bells: [[-3.0, -1.4, 'G5'], [-1.2, -3.6, 'B5'], [2.0, -3.4, 'D6'], [3.4, -0.9, 'G6']],
  /* the balloon's way from the bridge to the forest: along the trails, where no tree stands */
  route: [[29.4, 25.2], [29.7, 27.6], [31.0, 29.6], [33.0, 30.2], [34.4, 31.5], [34.3, 33.6], [35.6, 35.3], [38.5, 36.0], [41.5, 37.4], [43.6, 39.7], [45.3, 41.0], [47.4, 41.3], [49.6, 42.4], [52.6, 43.7]],
  /* the trees that stand on black rocks in the sea before the forest rises: [dx, dz, height, colour] from the forest's middle */
  far: [[-4.6, -3.3, 4.6, 1], [-4.9, -0.7, 3.5, 2], [-5.0, 3.5, 2.5, 0], [-3.2, -4.9, 5.3, 3]],
  trees: [[-0.9, -5.2, 5.7, 0], [1.5, -5.0, 6.3, 1], [3.8, -5.0, 5.5, 2], [5.0, -3.4, 4.8, 3], [4.5, 0.9, 3.8, 0], [4.3, 2.9, 3.1, 1], [5.0, 4.7, 2.7, 2], [0.2, 4.9, 1.9, 3], [-3.4, 3.7, 2.3, 1], [-5.5, -4.9, 3.4, 0], [5.4, -1.4, 2.6, 1]],
  flowers: [[-4.3, 0.4, 0], [-3.6, 1.5, 3], [-2.0, -0.4, 1], [1.9, 0.7, 2], [-0.2, -2.4, 3], [0.9, 3.6, 0], [3.6, 2.1, 2], [-1.7, -2.1, 0], [4.0, -0.1, 1], [2.8, -2.2, 3]] };
const GL_COL = ['#ffa51f', '#ff5f95', '#22cfa2', '#9a66ff'], GL_W = new T.Color('#ffffff'), GL_UP = new T.Vector3(0, 1, 0), GL_V = new T.Vector3(), GL_Q = new T.Quaternion(), GL_M = new T.Matrix4();
const glTurn = (a, b) => GL_M.makeRotationFromQuaternion(GL_Q.setFromUnitVectors(a, b)); /* the turn that takes direction a to direction b */
/* black sand: the forest's own ground, darker than the ash fields; it fades in at the river and at the field to the north */
const GL_SAND = new T.Color('#100f17');
{ const t0 = ISLAND.tint; ISLAND.tint = (x, z, c) => { t0(x, z, c); if (x > 46 && z > 34 && x < 59.5 && z < 47.5) c.lerp(GL_SAND, (0.88 + hash(Math.round(x * 3), Math.round(z * 3)) * 0.09) * clamp((x - 46) / 0.9, 0, 1) * clamp((z - 34) / 0.9, 0, 1)); }; }
/* glass: one see-through material for all of it; every face also glows a little in its own colour (GL.u: more at night) */
function glGlow(m, u) { m.onBeforeCompile = (sh) => { sh.uniforms.uGlGlow = u; sh.fragmentShader = 'uniform float uGlGlow;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n\ttotalEmissiveRadiance += vColor.rgb * uGlGlow;'); }; m.userData = { noSnow: 1 }; return m; }
const glassMat = glGlow(new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.16, metalness: 0.08, transparent: true, opacity: 0.8 }), GL.u);
const glBirdMat = glGlow(new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 }), GL.ub);
ISLE_ICON.balloon = (x) => { const cols = ['#ffb238', '#ff7fa8', '#3fd6b0', '#a77bff', '#fff1cf'];
  x.save(); x.beginPath(); x.moveTo(-6, 6); x.bezierCurveTo(-26, -6, -18, -28, 0, -28); x.bezierCurveTo(18, -28, 26, -6, 6, 6); x.closePath(); x.fillStyle = cols[0]; x.fill(); x.clip();
  for (let k = 0; k < 5; k++) for (let j = 0; j < 4; j++) { x.fillStyle = cols[(k * 2 + j * 3) % 5]; x.fillRect(-22 + k * 9, -28 + j * 9, 9, 9); } x.restore();
  x.beginPath(); x.moveTo(-6, 6); x.bezierCurveTo(-26, -6, -18, -28, 0, -28); x.bezierCurveTo(18, -28, 26, -6, 6, 6); x.closePath(); x.stroke();
  x.lineWidth = 1.8; x.beginPath(); x.moveTo(-5, 7); x.lineTo(-6, 14); x.moveTo(5, 7); x.lineTo(6, 14); x.stroke(); x.lineWidth = 3; x.beginPath(); x.roundRect(-8, 14, 16, 11, 3); x.fillStyle = '#b8834c'; x.fill(); x.stroke(); };
/* the frost flower's picture, only until the winter island's own file brings the real one */
if (!ISLE_ICON.frost) ISLE_ICON.frost = (x) => { for (let k = 0; k < 6; k++) { x.save(); x.rotate(k * Math.PI / 3); x.beginPath(); x.moveTo(0, -3); x.quadraticCurveTo(8, -12, 0, -22); x.quadraticCurveTo(-8, -12, 0, -3); x.closePath(); x.fillStyle = k % 2 ? '#cfeeff' : '#e9f8ff'; x.fill(); x.stroke(); x.restore(); }
  x.beginPath(); x.arc(0, 0, 5, 0, 7); x.fillStyle = '#ffffff'; x.fill(); x.stroke(); x.fillStyle = '#8fd0f2'; x.beginPath(); x.arc(0, 0, 2, 0, 7); x.fill(); };
/* ---- how glass is made here: flat, hard faces (no softening), each with its own shade ---- */
function glPaint(q, fn) {
  const g = q.index ? q.toNonIndexed() : q, p = g.attributes.position, n = p.count, col = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 3) { const c = fn((p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3, i / 3); for (let k = 0; k < 3; k++) { col[(i + k) * 3] = c.r; col[(i + k) * 3 + 1] = c.g; col[(i + k) * 3 + 2] = c.b; } }
  g.setAttribute('color', new T.BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
}
const glC = (hex, l, k) => { const c = tone(hex, k || 0, 0.5); return l >= 0 ? c.lerp(GL_W, Math.min(0.8, l)) : c.multiplyScalar(1 + l); };
/* a tube along a soft curve that thins toward its tip and twists as it goes */
function glTube(P, r0, r1, sides, tw) {
  const c = new T.CatmullRomCurve3(P.map((p) => new T.Vector3(p[0], p[1], p[2]))), n = Math.max(5, (P.length - 1) * 4), R = [], pos = []; let N = new T.Vector3(0.83, 0.1, 0.55);
  for (let i = 0; i <= n; i++) { const t = i / n, p = c.getPoint(t), tg = c.getTangent(t).normalize(); N = N.clone().addScaledVector(tg, -N.dot(tg)).normalize(); const B = new T.Vector3().crossVectors(tg, N), r = r0 + (r1 - r0) * t, ring = [];
    for (let s = 0; s < sides; s++) { const a = s / sides * 6.2832 + t * (tw || 0); ring.push(p.clone().addScaledVector(N, Math.cos(a) * r).addScaledVector(B, Math.sin(a) * r)); } R.push(ring); }
  const tri = (a, b, d) => pos.push(a.x, a.y, a.z, b.x, b.y, b.z, d.x, d.y, d.z);
  for (let i = 0; i < n; i++) for (let s = 0; s < sides; s++) { const a = R[i][s], b = R[i][(s + 1) % sides], d = R[i + 1][(s + 1) % sides], e = R[i + 1][s]; tri(a, b, d); tri(a, d, e); }
  const tip = c.getPoint(1).addScaledVector(c.getTangent(1).normalize(), r1 * 2.2); for (let s = 0; s < sides; s++) tri(R[n][s], R[n][(s + 1) % sides], tip);
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); return g;
}
/* a long splinter of glass pointing along d from p */
function glShard(L, p, d, len, w, col, k, l0) { const q = new T.OctahedronGeometry(1, 0); q.scale(w, len * 0.5, w * 0.62); q.translate(0, len * 0.42, 0); q.applyMatrix4(glTurn(GL_UP, GL_V.set(d[0], d[1], d[2]).normalize())); q.translate(p[0], p[1], p[2]);
  L.push(glPaint(q, (cx, cy, cz, i) => glC(col, (l0 == null ? 0 : l0) + (i % 4) * 0.075, k + i))); }
/* a crown: splinters standing out from a branch's tip like a frozen spark */
function glCrown(L, p, s, col, sd, n) { n = n || 6; GL.tips.push([p[0], p[1] + s * 0.9, p[2], col]); for (let k = 0; k < n; k++) { const a = k / n * 6.283 + hash(sd, k) * 0.8, el = 0.15 + hash(sd, 20 + k) * 0.9; glShard(L, p, [Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)], s * (0.7 + hash(sd, 40 + k) * 0.55), s * 0.14, col, sd + k * 7); }
  glShard(L, p, [(hash(sd, 60) - 0.5) * 0.4, 1, (hash(sd, 61) - 0.5) * 0.4], s * 1.15, s * 0.15, col, sd + 99, 0.3); }
/* a tree of glass: a trunk that winds up like blown glass, a few boughs that curl, a crown at every tip, a drop or two hanging */
function glTree(L, x, z, h, col, sd, y0) {
  y0 = y0 || 0; const a0 = hash(sd, 1) * 6.283, lean = 0.07 + hash(sd, 2) * 0.07, sp = [], tw = (hash(sd, 3) > 0.5 ? 1 : -1) * (2.4 + hash(sd, 4) * 1.6);
  for (let k = 0; k <= 5; k++) { const t = k / 5, a = a0 + t * tw, r = h * lean * Math.sin(t * Math.PI * 0.85); sp.push([x + Math.cos(a) * r, y0 + h * t, z + Math.sin(a) * r]); }
  const r0 = 0.09 + h * 0.026, c = new T.CatmullRomCurve3(sp.map((p) => new T.Vector3(p[0], p[1], p[2])));
  L.push(glPaint(glTube(sp, r0, 0.04, 6, tw * 1.6), (cx, cy, cz, i) => glC(col, -0.36 + 0.5 * clamp((cy - y0) / h, 0, 1) + (i % 2) * 0.09, sd + i)));
  for (let k = 0; k < 4; k++) { const a = a0 + k * 1.57 + 0.4; glShard(L, [x + Math.cos(a) * r0 * 0.7, y0 - 0.02, z + Math.sin(a) * r0 * 0.7], [Math.cos(a), 0.5, Math.sin(a)], 0.3 + h * 0.07, 0.07 + h * 0.012, col, sd + 200 + k, -0.3); } /* roots */
  const nb = h < 2.6 ? 2 : 3 + Math.floor(hash(sd, 5) * 1.99);
  for (let b = 0; b < nb; b++) { const t = 0.42 + b / nb * 0.48, p = c.getPoint(t), a = a0 + 1.3 + b * 2.4 + hash(sd, 10 + b), len = h * (0.32 - b * 0.035), up = 0.45 + hash(sd, 20 + b) * 0.4, e = [p.x + Math.cos(a + 0.9) * len * 0.9, p.y + len * (up * 0.75 + 0.32), p.z + Math.sin(a + 0.9) * len * 0.9];
    L.push(glPaint(glTube([[p.x, p.y, p.z], [p.x + Math.cos(a) * len * 0.45, p.y + len * up * 0.3, p.z + Math.sin(a) * len * 0.45], [p.x + Math.cos(a + 0.5) * len * 0.85, p.y + len * up * 0.72, p.z + Math.sin(a + 0.5) * len * 0.85], e], r0 * (1 - t) * 0.8 + 0.03, 0.025, 5, tw), (cx, cy, cz, i) => glC(col, -0.12 + (i % 2) * 0.1, sd + b * 31 + i)));
    glCrown(L, e, 0.34 + h * 0.075, col, sd + 300 + b * 17, 5);
    if (h > 3) { const m = [p.x + Math.cos(a + 0.5) * len * 0.85, p.y + len * up * 0.72, p.z + Math.sin(a + 0.5) * len * 0.85], dl = 0.3 + hash(sd, 70 + b) * 0.3; let q = new T.CylinderGeometry(0.008, 0.008, dl, 3); q.translate(m[0], m[1] - dl / 2, m[2]); L.push(glPaint(q, () => glC(col, 0.5, 1)));
      q = new T.OctahedronGeometry(0.09 + h * 0.008, 1); q.scale(1, 1.35, 1); q.translate(m[0], m[1] - dl - 0.08, m[2]); L.push(glPaint(q, (cx, cy, cz, i) => glC(GL_COL[(GL_COL.indexOf(col) + 1 + b) % 4], 0.25 + (i % 3) * 0.15, sd + i))); } }
  const tp = c.getPoint(1); glCrown(L, [tp.x, tp.y, tp.z], 0.42 + h * 0.09, col, sd + 500, 7);
}
/* glints: small stars of light on the crowns that flash and go out, each in its own time */
function glSparks(parent) { const tips = GL.tips.splice(0), n = tips.length; if (!n) return; const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), geo = new T.BufferGeometry(); tips.forEach((t, k) => { pos.set([t[0], t[1], t[2]], k * 3); });
  geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('color', new T.BufferAttribute(col, 3)); const m = new T.Points(geo, new T.PointsMaterial({ map: glBlobTex(), size: 0.62, vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); m.frustumCulled = false; parent.add(m);
  GL.sparks.push({ m, c: tips.map((t) => new T.Color(t[3]).lerp(GL_W, 0.55)) }); }
/* a small glass flower: a bent stem, a cup of five petals, a bright bead */
function glFlower(L, x, z, h, col, sd) { const a = hash(sd, 1) * 6.283, tx = x + Math.cos(a) * h * 0.22, tz = z + Math.sin(a) * h * 0.22;
  L.push(glPaint(glTube([[x, 0, z], [x + Math.cos(a) * h * 0.05, h * 0.55, z + Math.sin(a) * h * 0.05], [tx, h, tz]], 0.028, 0.018, 4, 2), (cx, cy, cz, i) => glC(col, -0.25 + (i % 2) * 0.1, sd + i)));
  for (let k = 0; k < 5; k++) { const b = k / 5 * 6.283 + a; glShard(L, [tx, h - 0.02, tz], [Math.cos(b) * 0.8, 0.75, Math.sin(b) * 0.8], h * 0.42, h * 0.11, col, sd + k * 5, 0.18); }
  const q = new T.OctahedronGeometry(h * 0.085, 1); q.translate(tx, h + h * 0.1, tz); L.push(glPaint(q, (cx, cy, cz, i) => glC('#fff0b0', (i % 3) * 0.2, sd + i)));
  for (let k = 0; k < 2; k++) glShard(L, [x, 0, z], [Math.cos(a + 2 + k * 2.2), 0.45, Math.sin(a + 2 + k * 2.2)], h * 0.4, h * 0.07, col, sd + 50 + k, -0.15); }
/* black volcano glass: a rock with a few faces that catch a violet light */
function glRock(L, x, z, r, sd, hy) { const q = ico(r, 1, sd, r * 0.16); q.scale(1.15, hy || 0.75, 1); q.rotateY(hash(sd, 9) * 6); q.translate(x, r * 0.22, z); L.push(fac(q, (cx, cy, cz, i) => tone(i % 7 === 0 ? '#5a4f7a' : i % 5 === 0 ? '#3a3350' : '#221f2a', i, 0.4), sd)); }
const glassTex = {};
function glBlobTex() { if (glassTex.blob) return glassTex.blob; const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return (glassTex.blob = new T.CanvasTexture(c)); }
/* warm glass, still glowing: pale gold in the middle, rose at the rim, slow swirls */
function glPoolTex() { if (glassTex.pool) return glassTex.pool; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 4, 64, 64, 64); g.addColorStop(0, '#fff6cf'); g.addColorStop(0.35, '#ffd27a'); g.addColorStop(0.7, '#ff9a5a'); g.addColorStop(1, '#f0627a'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  x.lineCap = 'round'; for (let k = 0; k < 9; k++) { x.strokeStyle = k % 2 ? 'rgba(255,250,220,0.55)' : 'rgba(255,140,120,0.45)'; x.lineWidth = 2 + hash(k, 11601) * 4; x.beginPath(); const r = 12 + k * 5.5, a = hash(k, 11602) * 6.283; x.arc(64 + Math.cos(a) * 6, 64 + Math.sin(a) * 6, r, a, a + 1.2 + hash(k, 11603) * 1.6); x.stroke(); } return (glassTex.pool = new T.CanvasTexture(c)); }
/* the river where it has set: dark stone, the cracks still glowing; it fades into the lava on both sides */
function glCrustTex() { const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#2b2624'; x.fillRect(0, 0, 128, 128);
  for (let k = 0; k < 40; k++) { x.fillStyle = ['#342e2b', '#241f1e', '#3d3632'][k % 3]; x.beginPath(); x.ellipse(hash(k, 11611) * 128, hash(k, 11612) * 128, 6 + hash(k, 11613) * 12, 5 + hash(k, 11614) * 9, hash(k, 11615) * 3, 0, 7); x.fill(); }
  x.lineCap = 'round'; x.lineJoin = 'round'; [['#ff7a1c', 3.4], ['#ffd76a', 1.3]].forEach(([col, w]) => { x.strokeStyle = col; x.lineWidth = w; for (let k = 0; k < 13; k++) { let px = hash(k, 11621) * 128, py = hash(k, 11622) * 128; x.beginPath(); x.moveTo(px, py); for (let j = 0; j < 4; j++) { px += (hash(k, 11630 + j) - 0.5) * 44; py += (hash(k, 11640 + j) - 0.5) * 44; x.lineTo(px, py); } x.stroke(); } });
  const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.2, 'rgba(0,0,0,0)'); g.addColorStop(0.8, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c); }
function glHazeTex() { const c = document.createElement('canvas'); c.width = 32; c.height = 128; const x = c.getContext('2d'), g = x.createLinearGradient(0, 128, 0, 0); g.addColorStop(0, 'rgba(255,190,120,0.9)'); g.addColorStop(0.5, 'rgba(255,225,190,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 128);
  const h = x.createLinearGradient(0, 0, 32, 0); h.addColorStop(0, 'rgba(0,0,0,1)'); h.addColorStop(0.5, 'rgba(0,0,0,0)'); h.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = h; x.fillRect(0, 0, 32, 128); return new T.CanvasTexture(c); }
/* ---- the fire bird: small and round, a crest and a long tail of flame feathers ---- */
function glBird() {
  const g = new T.Group(), L = []; let q; const C = (h) => new T.Color(h);
  q = ico(0.15, 1, 11500, 0.03); q.scale(0.92, 0.95, 1.22); L.push(fac(q, (cx, cy, cz, i) => (cy < -0.02 && cz > -0.08 ? tone('#ffcf4a', i, 0.3) : tone('#ee5a26', i, 0.3)), 11500));
  q = ico(0.118, 1, 11501, 0.02); q.translate(0, 0.15, 0.13); L.push(fac(q, (cx, cy, cz, i) => tone('#f6782a', i, 0.25), 11501));
  [-1, 1].forEach((s) => { q = ico(0.024, 1, 11502); q.translate(s * 0.068, 0.172, 0.222); L.push(fac(q, () => C('#2a1a12'), 11502)); });
  q = new T.ConeGeometry(0.032, 0.1, 5); q.rotateX(Math.PI / 2); q.translate(0, 0.135, 0.27); L.push(fac(q, () => C('#ffe07a'), 11503));
  [[-0.4, 0.15], [0, 0.23], [0.4, 0.14]].forEach(([r, len], k) => { q = new T.ConeGeometry(0.034, len, 4); q.translate(0, len / 2, 0); q.rotateX(-0.55); q.rotateZ(-r); q.translate(0, 0.24, 0.1); L.push(fac(q, (cx, cy) => C(cy > 0.33 ? '#ffe07a' : '#ff9a2a'), 11504 + k)); });
  [-0.42, 0, 0.42].forEach((r, k) => { const len = k === 1 ? 0.56 : 0.42; q = ico(0.5, 1, 11510 + k, 0.02); q.scale(0.11, 0.04, len); q.translate(0, 0, -len * 0.5); q.rotateX(0.32); q.rotateY(r); q.translate(0, 0.01, -0.13); L.push(fac(q, (cx, cy, cz, i) => { const d = Math.hypot(cx, cz); return tone(d > 0.42 ? '#ffe07a' : d > 0.27 ? '#ff9a2a' : '#e8481f', i, 0.2); }, 11510 + k)); });
  const m = merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), glBirdMat, g); m.receiveShadow = false; g.userData.w = [];
  [-1, 1].forEach((s) => { const w = new T.Group(); q = ico(0.5, 1, 11520, 0.02); q.scale(0.3, 0.03, 0.2); q.translate(0.14, 0, -0.02); const wm = new T.Mesh(fac(q, (cx, cy, cz, i) => tone(cx > 0.2 ? '#ffd24a' : cx > 0.1 ? '#ff9a2a' : '#e8481f', i, 0.2), 11520), glBirdMat); wm.castShadow = true; w.add(wm); w.position.set(s * 0.1, 0.06, 0.02); w.scale.x = s; g.add(w); g.userData.w.push(w); });
  const gl = new T.Sprite(new T.SpriteMaterial({ map: glBlobTex(), color: '#ffb040', transparent: true, opacity: 0.4, depthWrite: false, blending: T.AdditiveBlending })); gl.scale.setScalar(0.9); gl.position.y = 0.08; g.add(gl); g.userData.glow = gl;
  g.scale.setScalar(1.08); return g;
}
/* ---- the glassblower's balloon: patches of every glass colour, a basket, a burner for the bird to sit on ---- */
function glBalloon() {
  const g = new T.Group(), L = []; let q; const nq = (p) => (p.index ? p.toNonIndexed() : p), wick = (cx, cy, cz, i) => tone(Math.floor(cy * 16) % 2 ? '#b8834c' : '#9c6c3a', i, 0.4);
  q = new T.CylinderGeometry(0.45, 0.37, 0.46, 10, 3, true); q.translate(0, 0.35, 0); L.push(fac(q, wick, 11700));
  q = new T.CylinderGeometry(0.41, 0.34, 0.44, 10, 1, true); q.scale(-1, 1, 1); q.translate(0, 0.35, 0); L.push(fac(q, (cx, cy, cz, i) => tone('#7d5530', i, 0.3), 11701));
  q = new T.CylinderGeometry(0.37, 0.37, 0.07, 10); q.translate(0, 0.1, 0); L.push(fac(q, (cx, cy, cz, i) => tone('#8d6238', i, 0.3), 11702));
  q = new T.TorusGeometry(0.44, 0.05, 5, 12); q.rotateX(Math.PI / 2); q.translate(0, 0.59, 0); L.push(fac(q, (cx, cy, cz, i) => tone('#8a5a30', i, 0.3), 11703));
  for (let k = 0; k < 4; k++) { const a = k / 4 * 6.283 + 0.785, x0 = Math.cos(a) * 0.42, z0 = Math.sin(a) * 0.42, x1 = Math.cos(a) * 0.3, z1 = Math.sin(a) * 0.3, len = Math.hypot(x1 - x0, 1.0, z1 - z0); q = new T.CylinderGeometry(0.014, 0.014, len, 4); q.translate(0, len / 2, 0); q.applyMatrix4(glTurn(GL_UP, GL_V.set(x1 - x0, 1.0, z1 - z0).normalize())); q.translate(x0, 0.6, z0); L.push(fac(nq(q), () => new T.Color('#e9d6a8'), 11704)); }
  q = new T.TorusGeometry(0.2, 0.03, 5, 10); q.rotateX(Math.PI / 2); q.translate(0, 1.42, 0); L.push(fac(q, () => new T.Color('#4a3a2e'), 11705)); q = new T.CylinderGeometry(0.08, 0.11, 0.12, 7); q.translate(0, 1.4, 0); L.push(fac(q, (cx, cy, cz, i) => tone('#6a5a50', i, 0.3), 11706));
  for (let k = 0; k < 3; k++) { const a = k / 3 * 6.283; q = new T.CylinderGeometry(0.012, 0.012, 0.22, 3); q.rotateZ(Math.PI / 2); q.rotateY(a); q.translate(Math.cos(a) * 0.1, 1.42, -Math.sin(a) * 0.1); L.push(fac(nq(q), () => new T.Color('#4a3a2e'), 11707)); }
  q = new T.CylinderGeometry(0.31, 0.25, 0.2, 10, 1, true); q.translate(0, 1.66, 0); L.push(glPaint(nq(q), (cx, cy, cz, i) => tone(i % 4 < 2 ? '#fff1cf' : '#f2683c', i, 0.2)));
  q = new T.SphereGeometry(0.84, 10, 7); { const A = q.attributes.position; for (let i = 0; i < A.count; i++) { const y = A.getY(i); if (y < 0) { const k = 1 - (-y / 0.84) * 0.62; A.setX(i, A.getX(i) * k); A.setZ(i, A.getZ(i) * k); A.setY(i, y * 1.12); } } } q.translate(0, 2.52, 0);
  { const pal = ['#ffb238', '#ff7fa8', '#3fd6b0', '#a77bff', '#fff1cf', '#f2683c', '#7fc4ef']; L.push(glPaint(q, (cx, cy, cz) => { const s = Math.floor((Math.atan2(cz, cx) + Math.PI) / 6.2832 * 10 - 0.001), r = Math.floor((cy - 1.5) / 0.27); return tone(pal[Math.floor(hash(s * 7.3 + r * 13.1, 11710) * pal.length)], s + r * 10, 0.25); })); }
  const m = merged(L.map(nq), MAT, g); m.castShadow = true; g.userData.flame = kitFlame(g, 0, 1.46, 0, 0.85); return g;
}
/* ---- the river, the far trees and the bird's rock: there as soon as the ash field is Pip's ---- */
function glassOut() {
  if (GL.out || !EM.lavaTex) return; const g = GL.out = new T.Group(); sc.add(g); const L = [], G = [], R = EMBER.river, A = AREA_BY.e5, nq = (p) => (p.index ? p.toNonIndexed() : p); let q;
  const lm = new T.MeshBasicMaterial({ map: EM.lavaTex, side: T.DoubleSide }); lm.userData = { noSnow: 1 };
  const pts = emberPath(R.pts), pos = [], uv = [], idx = [];
  pts.forEach((p, k) => { const a = pts[Math.max(0, k - 1)], b = pts[Math.min(pts.length - 1, k + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / l, nz = (b[0] - a[0]) / l, w = R.w * (0.96 + Math.sin(k * 0.45) * 0.06), y = p[1] > 46.3 ? 0.075 - (p[1] - 46.3) * 2.3 : 0.075;
    pos.push(p[0] + nx * w, y, p[1] + nz * w, p[0] - nx * w, y, p[1] - nz * w); uv.push(0, k * 0.1, 1, k * 0.1); if (k) { const o = k * 2; idx.push(o - 2, o - 1, o, o, o - 1, o + 1); }
    if (k % 2 === 0 && p[1] < 46.25) [1, -1].forEach((sd, j) => { if (Math.abs(p[1] - 41) < 0.75) return; const r = 0.18 + hash(k, 11020 + j) * 0.15, e = ico(r, 0, 11030 + k + j * 100); e.scale(1.3, 0.7, 1.1); e.translate(p[0] + nx * sd * (w + 0.12), 0.04, p[1] + nz * sd * (w + 0.12)); L.push(fac(e, (cx, cy, cz, i) => tone(i % 5 === 0 ? '#7a3a22' : '#3a322e', i + k, 0.4), 11030 + k)); }); });
  { const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals(); g.add(new T.Mesh(geo, lm)); }
  /* where it wells up: a round pool among bigger rocks */
  { const [sx, sz] = R.pts[0], s = new T.Mesh(new T.CircleGeometry(1.0, 14), lm); s.rotation.x = -Math.PI / 2; s.position.set(sx, 0.08, sz + 0.25); g.add(s);
    for (let k = 0; k < 9; k++) { const a = -0.5 - k / 8 * 5.3 + 1.57, r = 0.28 + hash(k, 11060) * 0.26; q = ico(r, 1, 11061 + k, 0.05); q.scale(1.2, 0.8 + hash(k, 11062) * 0.5, 1); q.translate(sx + Math.cos(a) * 1.12, r * 0.25, sz + 0.25 + Math.sin(a) * 1.12); L.push(fac(q, (cx, cy, cz, i) => tone(i % 6 === 0 ? '#7a3a22' : '#3d3531', i, 0.4), 11061 + k)); } }
  pts.forEach((p, k) => { if (k % 4 === 0 && p[1] < 46) lookFoot(p[0], p[1], 1.0, 1.0); if (k % 8 === 0 && p[1] < 46.2) nightLamp(p[0], p[1], 3.6); });
  /* the stepping stones and the set stone under them (hidden until the frost flowers go in) */
  { const cool = !!(glassS().cool || HAS.e5); R.cool = cool ? 1 : 0; const w = R.b[0] - R.a[0] - 0.1, cg = new T.PlaneGeometry(w, 1.7); cg.rotateX(-Math.PI / 2); cg.translate(w / 2, 0, 0);
    GL.crust = new T.Mesh(cg, new T.MeshBasicMaterial({ map: glCrustTex(), transparent: true, depthWrite: false })); GL.crust.material.userData = { noSnow: 1 }; GL.crust.position.set(R.a[0] + 0.05, 0.085, 41); GL.crust.visible = cool; g.add(GL.crust);
    for (let k = 0; k < 5; k++) { const s = new T.Group(), x = 44.4 + k * 0.425, z = 41 + (k % 2 ? 0.17 : -0.17); q = new T.CylinderGeometry(0.35, 0.4, 0.15, 8); jit(q, 0.025, 11080 + k); q.rotateY(hash(k, 11081) * 6);
      const sm = new T.Mesh(fac(q, (cx, cy, cz, i) => tone(cy > 0.04 ? (i % 4 === 0 ? '#5d5753' : '#4a4441') : '#2c2725', i + k, 0.3), 11080 + k), MAT); sm.castShadow = true; sm.receiveShadow = true; sm.position.y = 0.1; s.add(sm);
      const gm = new T.Mesh(new T.CircleGeometry(0.47, 8), new T.MeshBasicMaterial({ color: '#ff8a2a' })); gm.rotation.x = -Math.PI / 2; gm.position.y = 0.092; s.add(gm); s.position.set(x, 0, z); s.visible = cool; g.add(s); GL.stones.push(s); } }
  /* the fire bird's rock on the near bank */
  glRock(L, GLASS.rock[0], GLASS.rock[1], 0.42, 11090, 0.95); lookFoot(GLASS.rock[0], GLASS.rock[1], 0.5, 0.5); GL.solid.push([GLASS.rock[0], GLASS.rock[1], 0.34]);
  /* black rocks out in the sea, a tree of glass on each: all that can be seen of the forest until it rises */
  GLASS.far.forEach(([dx, dz, h, ci], k) => { const x = A.cx + dx, z = A.cz + dz; q = new T.CylinderGeometry(0.5, 0.95, 2.9, 7, 3); jit(q, 0.1, 11100 + k); q.translate(x, -1.12, z); L.push(fac(nq(q), (cx, cy, cz, i) => tone(i % 7 === 0 ? '#5a4f7a' : i % 4 === 0 ? '#3a3350' : '#221f2a', i, 0.4), 11100 + k));
    glTree(G, x, z, h, GL_COL[ci], 11120 + k * 40, 0.28); GL.solid.push([x, z, 0.5]); });
  const m = merged(L.map(nq), MAT, g); m.castShadow = true; m.receiveShadow = true; const gm = merged(G, glassMat, g); gm.castShadow = false; gm.receiveShadow = false; glSparks(g);
  /* the heat over the river */
  { const tex = glHazeTex(); for (let k = 0; k < 7; k++) { const p = pts[4 + k * 5], sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, opacity: 0.14, depthWrite: false, blending: T.AdditiveBlending })); sp.center.set(0.5, 0); sp.position.set(p[0] + (k % 2 ? 0.25 : -0.2), 0.1, p[1]); g.add(sp); GL.haze.push(sp); } }
}
/* ---- the forest itself: every piece set by hand; tall at the back, low in front so we can see in ---- */
SECRET_FILL.e5 = (A, fresh) => {
  if (GL.g) return; glassOut(); const g = GL.g = new T.Group(); sc.add(g); const L = [], G = [], X = A.cx, Z = A.cz, nq = (p) => (p.index ? p.toNonIndexed() : p), P = []; let q;
  GLASS.far.forEach(([dx, dz, h, ci]) => P.push([X + dx, Z + dz, h, ci]));
  GLASS.trees.forEach(([dx, dz, h, ci], k) => { const x = X + dx, z = Z + dz; if (landSdf(x, z) > -0.3) return; glTree(G, x, z, h, GL_COL[ci], 11200 + k * 40); GL.solid.push([x, z, 0.2 + h * 0.03]); lookFoot(x, z, 0.5, 0.5, 0.3); P.push([x, z, h, ci]); });
  /* the pools of warm glass, each in a rim of black rock */
  [[GLASS.pool[0], GLASS.pool[1], GLASS.pool[2]], [-3.1, -3.3, 0.5], [1.7, 2.3, 0.62]].forEach(([dx, dz, r], k) => { const x = X + dx, z = Z + dz, m = new T.Mesh(new T.CircleGeometry(r, 22), new T.MeshBasicMaterial({ map: glPoolTex() })); m.material.userData = { noSnow: 1 }; m.rotation.x = -Math.PI / 2; m.position.set(x, 0.06, z); g.add(m); GL.pools.push({ m, x, z, r });
    const n = Math.round(r * 13); for (let j = 0; j < n; j++) { const a = j / n * 6.283 + hash(j, 11300 + k), rr = 0.11 + hash(j, 11310 + k) * 0.1; q = ico(rr, 0, 11320 + j + k * 40); q.scale(1.4, 0.6, 1); q.rotateY(-a); q.translate(x + Math.cos(a) * (r + 0.05), 0.03, z + Math.sin(a) * (r + 0.05)); L.push(fac(q, (cx, cy, cz, i) => tone(i % 5 === 0 ? '#4a4266' : '#262230', i + j, 0.4), 11320 + j)); }
    GL.solid.push([x, z, r - 0.02]); nightLamp(x, z, r * 3 + 2.5); });
  /* black rocks, big and small, and splinters of glass in the sand */
  [[-5.3, -2.1, 0.5], [2.7, -5.6, 0.55], [5.5, -2.4, 0.4], [-1.9, -4.9, 0.36], [4.9, 2.0, 0.34], [-4.2, 4.2, 0.4], [1.2, 5.5, 0.3], [-5.6, 2.2, 0.3]].forEach(([dx, dz, r], k) => { const x = X + dx, z = Z + dz; if (landSdf(x, z) > -0.35) return; glRock(L, x, z, r, 11400 + k); GL.solid.push([x, z, r * 0.85]); lookFoot(x, z, r + 0.1, r + 0.1, 0.3); });
  for (let k = 0; k < 70; k++) { const x = X + (hash(k, 11450) - 0.5) * 11.2, z = Z + (hash(k, 11451) - 0.5) * 11.2; if (landSdf(x, z) > -0.3 || Math.hypot(x - X - GLASS.pool[0], z - Z - GLASS.pool[1]) < 1.6) continue;
    if (k % 3) { const r = 0.05 + hash(k, 11452) * 0.08; q = ico(r, 0, 11460 + k); q.scale(1.3, 0.55, 1); q.translate(x, r * 0.25, z); L.push(fac(q, (cx, cy, cz, i) => tone(i % 4 === 0 ? '#4a4266' : '#221f2a', i, 0.4), 11460 + k)); }
    else glShard(G, [x, -0.02, z], [(hash(k, 11453) - 0.5) * 0.9, 1, (hash(k, 11454) - 0.5) * 0.9], 0.16 + hash(k, 11455) * 0.22, 0.035, GL_COL[k % 4], 11470 + k, 0.2); }
  /* the four bells: each hangs from a crook of its own glass */
  GLASS.bells.forEach(([dx, dz, note], k) => { const x = X + dx, z = Z + dz, col = GL_COL[k], sx = k < 2 ? -0.75 : 0.75;
    G.push(glPaint(glTube([[x + sx, 0, z - 0.75], [x + sx * 1.12, 1.6, z - 0.8], [x + sx * 0.8, 2.75, z - 0.6], [x + sx * 0.2, 3.15, z - 0.15], [x, 2.84, z]], 0.1, 0.035, 6, 5), (cx, cy, cz, i) => glC(col, -0.3 + cy * 0.12 + (i % 2) * 0.08, 11500 + k * 9 + i)));
    for (let j = 0; j < 4; j++) { const a = j * 1.57 + k; glShard(G, [x + sx, -0.02, z - 0.75], [Math.cos(a), 0.55, Math.sin(a)], 0.45, 0.08, col, 11520 + j, -0.25); } GL.solid.push([x + sx, z - 0.75, 0.2]); lookFoot(x + sx, z - 0.75, 0.4, 0.4, 0.3);
    const b = new T.Group(); b.position.set(x, 2.84, z); g.add(b); const B = [], s = 1.12 - k * 0.09;
    q = new T.LatheGeometry([[0.05, -0.2], [0.16, -0.24], [0.25, -0.46], [0.3, -0.78], [0.41, -1.04], [0.5, -1.16]].map(([r, y]) => new T.Vector2(r * s, y * s - 0.02)), 9); B.push(glPaint(q, (cx, cy, cz, i) => glC(col, -0.05 + clamp(-cy - 0.2, 0, 1) * 0.3 + (i % 2) * 0.1, 11540 + i)));
    q = new T.CylinderGeometry(0.012, 0.012, 0.24, 3); q.translate(0, -0.1, 0); B.push(glPaint(nq(q), () => glC(col, 0.5, 1))); q = new T.CylinderGeometry(0.01, 0.01, 0.8 * s, 3); q.translate(0, -0.2 - 0.4 * s, 0); B.push(glPaint(nq(q), () => glC(col, 0.5, 1)));
    q = new T.OctahedronGeometry(0.085, 1); q.translate(0, -1.08 * s, 0); B.push(glPaint(q, (cx, cy, cz, i) => glC('#fff0b0', (i % 3) * 0.2, i)));
    const bm = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.15, metalness: 0.05, transparent: true, opacity: 0.9, side: T.DoubleSide, emissive: new T.Color(col), emissiveIntensity: 0.1 }); bm.userData = { noSnow: 1 }; const m = merged(B, bm, b); m.castShadow = false; m.receiveShadow = false;
    const bx = X + GLASS.pool[0], bz = Z + GLASS.pool[1], from = new T.Vector3(x, 1.75, z), to = new T.Vector3(bx, 1.3, bz), len = from.distanceTo(to); q = new T.CylinderGeometry(0.035, 0.06, 1, 5, 1, true); q.translate(0, 0.5, 0);
    const beam = new T.Mesh(q, new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.6, depthWrite: false, blending: T.AdditiveBlending })); beam.position.copy(from); beam.quaternion.setFromUnitVectors(GL_UP, to.clone().sub(from).normalize()); beam.visible = false; beam.userData.len = len; g.add(beam); GL.beams.push(beam);
    GL.bells.push({ b, m: bm, x, z, note, sw: 0, lit: 0, fl: 0, in: false }); });
  /* glass flowers that chime as Pip passes */
  GLASS.flowers.forEach(([dx, dz, ci], k) => { const x = X + dx, z = Z + dz; if (landSdf(x, z) > -0.3) return; const F = [], f = new T.Group(); glFlower(F, 0, 0, 0.5 + hash(k, 11560) * 0.22, GL_COL[ci], 11570 + k * 9); const m = merged(F, glassMat, f); m.castShadow = false; m.receiveShadow = false; f.position.set(x, 0, z); g.add(f); GL.flw.push({ f, x, z, sw: 0, in: false, note: ['G6', 'A6', 'B6', 'D7', 'E7'][k % 5] }); });
  const mesh = merged(L.map(nq), MAT, g); mesh.castShadow = true; mesh.receiveShadow = true; const gm = merged(G, glassMat, g); gm.castShadow = false; gm.receiveShadow = false; glSparks(g);
  /* the coloured light the trees throw on the sand: soft patches that drift and breathe (one mesh, moved by hand each frame) */
  { const list = []; P.forEach(([x, z, h, ci], k) => { for (let j = 0; j < 3; j++) { const a = 0.5 + j * 1.9 + hash(k, 11600 + j) * 1.2, d = 0.5 + h * (0.12 + j * 0.07), px = x + Math.cos(a) * d + 0.3, pz = z + Math.sin(a) * d * 0.8 + 0.35; if (landSdf(px, pz) > -0.25) continue; list.push({ x: px, z: pz, s: 0.38 + h * 0.07 + hash(k, 11610 + j) * 0.2, ph: hash(k, 11620 + j) * 6.283, c: new T.Color(GL_COL[(ci + (j === 2 ? 1 : 0)) % 4]) }); } });
    GLASS.bells.forEach(([dx, dz], k) => list.push({ x: X + dx + 0.1, z: Z + dz + 0.25, s: 0.6, ph: k * 1.3, c: new T.Color(GL_COL[k]), bell: k }));
    const n = list.length, pos = new Float32Array(n * 12), uv = new Float32Array(n * 8), col = new Float32Array(n * 12), idx = [];
    list.forEach((p, k) => { uv.set([0, 0, 1, 0, 1, 1, 0, 1], k * 8); for (let j = 0; j < 4; j++) col.set([p.c.r, p.c.g, p.c.b], k * 12 + j * 3); idx.push(k * 4, k * 4 + 2, k * 4 + 1, k * 4, k * 4 + 3, k * 4 + 2); });
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.BufferAttribute(uv, 2)); geo.setAttribute('color', new T.BufferAttribute(col, 3)); geo.setIndex(idx);
    const pm = new T.Mesh(geo, new T.MeshBasicMaterial({ map: glBlobTex(), vertexColors: true, transparent: true, opacity: 0.5, depthWrite: false, blending: T.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); pm.material.userData = { noSnow: 1 }; pm.frustumCulled = false; pm.renderOrder = 1; g.add(pm); GL.pat = { m: pm, list }; glassPatches(); }
  /* the golden heart, waiting under the middle pool */
  GL.heart = new T.Mesh(goldGeo('glass'), goldMat); GL.heart.scale.setScalar(1.35); GL.heart.position.set(X + GLASS.pool[0], -0.5, Z + GLASS.pool[1]); GL.heart.visible = false; g.add(GL.heart);
  nightLamp(X, Z, 8.5); [[-4, -4], [4, -4], [4.2, 3.6], [-4.2, 2.4]].forEach(([dx, dz]) => nightLamp(X + dx, Z + dz, 5));
  /* what can be gathered: cinder rocks for ember, crystals, and a chest among the roots */
  [['cinder', 4.2, -2.1], ['cinder', -0.6, 3.2], ['cinder', 3.0, 1.4], ['crystal', 0.3, -4.4], ['crystal', -0.9, 1.7]].forEach(([k, dx, dz], n) => { const nd = makeNode(k, X + dx, Z + dz, 11800 + n); if (fresh) { nd.pop = 0.001; nd.g.scale.setScalar(0.01); } });
  if (!state.isle.chests.glass) makeChest(X - 2.4, Z + 1.9, { coin: 60, ember: 3, crystal: 8 }, 'glass');
  if (fresh) { g.scale.set(1, 0.01, 1); GL.pop = 0.001; glassWeld(A); }
};
/* land that has just risen has hair-thin gaps between its triangles (every corner is given a height of its own); on
   black sand they show as pale lines until the next visit, so the corners that meet are set to one height here */
function glassWeld(A) { const p = ground.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = p.getY(i); if (Math.abs(x - A.cx) < 7.6 && Math.abs(z - A.cz) < 7.6 && y >= 0 && y <= 0.0201) p.setY(i, 0.02 * hash(Math.round(x * 16), Math.round(z * 16))); } p.needsUpdate = true; }
/* move the light patches: each drifts a little round its place and swells and fades */
function glassPatches() { const P = GL.pat; if (!P) return; const A = P.m.geometry.attributes.position, t = reduced ? 0 : time;
  P.list.forEach((p, k) => { const lit = p.bell == null ? 1 : GL.bells[p.bell] ? GL.bells[p.bell].lit * 1.3 + GL.bells[p.bell].fl : 0, s = p.s * (0.82 + Math.sin(t * 0.9 + p.ph) * 0.2) * (p.bell == null ? 1 : Math.min(1.4, lit)), x = p.x + Math.sin(t * 0.5 + p.ph) * 0.16, z = p.z + Math.cos(t * 0.37 + p.ph * 1.7) * 0.12, a = p.ph + t * 0.12, cx = Math.cos(a) * s, sx = Math.sin(a) * s * 0.62, o = k * 12;
    A.array[o] = x - cx + sx; A.array[o + 1] = 0.05; A.array[o + 2] = z - sx * 1.6 - cx * 0.62; A.array[o + 3] = x + cx + sx; A.array[o + 4] = 0.05; A.array[o + 5] = z + sx * 1.6 - cx * 0.62;
    A.array[o + 6] = x + cx - sx; A.array[o + 7] = 0.05; A.array[o + 8] = z + sx * 1.6 + cx * 0.62; A.array[o + 9] = x - cx - sx; A.array[o + 10] = 0.05; A.array[o + 11] = z - sx * 1.6 + cx * 0.62; }); A.needsUpdate = true; }
ISLE_KEYS.push({ id: 'glass', ok: () => !!HAS.e3 && !HAS.e5 && !glassS().cool, x: GLASS.sign[0], z: GLASS.sign[1], cost: { frost: 5, stone: 30 }, open: () => glassCool() });
ISLE_KEEPS.push((a, x, z) => (a.id === 'e3' && (x > 43.4 && emberLava(x, z) < 0.75 || Math.hypot(x - GLASS.sign[0], z - GLASS.sign[1]) < 1.4 || Math.hypot(x - GLASS.rock[0], z - GLASS.rock[1]) < 1.0 || Math.hypot(x - 43.7, z - 41) < 1.2)) || (a.id === 'e0' && x > 27.3 && x < 31.3 && z < 27.3) || (a.id === 'e5' && GL.solid.some((q) => Math.hypot(x - q[0], z - q[1]) < q[2] + 1.0)) /* no tree between the balloon's landing place and us */);
/* the frost flowers go in: they fly out over the river one after another, and it sets where each one lands */
function glassCool() { const S = glassS(); if (S.cool) return; S.cool = 1; GL.cool = 0.001; const pp = pip.position; Snd.play('swish', { gain: 0.4 });
  for (let k = 0; k < 5; k++) { const sp = isleSprite(isleBubbleFree('frost'), 0.5); sp.position.set(pp.x, 1.7, pp.z); sp.visible = false; sc.add(sp); GL.thrown.push({ sp, t: -k * 0.16, x0: pp.x, z0: pp.z, x1: GL.stones[k].position.x, z1: GL.stones[k].position.z, k }); } save(); }
function isleBubbleFree(t) { if (glassTex[t]) return glassTex[t]; const c = document.createElement('canvas'); c.width = c.height = 96; isleIcon(c.getContext('2d'), t, 48, 48, 1.7); return (glassTex[t] = new T.CanvasTexture(c)); }
/* ---- the balloon's ride: Pip hops into the basket, it lifts and drifts along the trails, sets down, Pip hops out ---- */
function glassFly(to) {
  if (SC.ride) return; const A = to ? GLASS.entry : GLASS.wood, B = to ? GLASS.wood : GLASS.entry, mid = to ? GLASS.route : GLASS.route.slice().reverse();
  const c = new T.CatmullRomCurve3([A.park].concat(mid, [B.park]).map(([x, z]) => new T.Vector3(x, 0, z))), n = 44, pts = [[A.ring[0], 0, A.ring[1]], [A.park[0], 0, A.park[1]]];
  for (let i = 1; i < n; i++) { const p = c.getPoint(i / n); pts.push([p.x, 0, p.z]); } pts.push([B.park[0], 0, B.park[1]], [B.ring[0], 0, B.ring[1]]);
  const d0 = Math.hypot(A.ring[0] - A.park[0], A.ring[1] - A.park[1]), d1 = Math.hypot(B.ring[0] - B.park[0], B.ring[1] - B.park[1]); GL.fly = { A, B };
  rideGo({ pts, speed: 4.4, endY: 0, snd: 'whoosh', onEnd: () => { GL.fly = null; GL.bal.position.set(B.park[0], 0, B.park[1]); GL.bal.rotation.set(0, 0, 0); Snd.play('thud', { gain: 0.25 }); },
    each: (R) => { const pp = pip.position, u = R.d, L = R.len, bal = GL.bal, sm = (v) => { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); };
      if (u < d0) { pp.y = 0.13 * sm(u / d0) + Math.sin(Math.PI * u / d0) * 0.5; bal.position.set(A.park[0], 0, A.park[1]); }
      else if (u > L - d1) { const f = (u - (L - d1)) / d1; pp.y = 0.13 * (1 - sm(f)) + Math.sin(Math.PI * f) * 0.5; bal.position.set(B.park[0], 0, B.park[1]); bal.rotation.z = 0; }
      else { const e = sm(Math.min(u - d0, L - d1 - u) / 3.4); pp.y = 0.13 + e * (1.72 + (reduced ? 0 : Math.sin(time * 1.3) * 0.07)); bal.position.set(pp.x, pp.y - 0.13, pp.z); bal.rotation.z = reduced ? 0 : Math.sin(time * 1.1) * 0.04 * e; bal.rotation.x = reduced ? 0 : Math.cos(time * 0.9) * 0.03 * e; GL.fly.up = e; }
      target.copy(pp); } }); }
/* ---- after the heart is found: glass flowers along every lava bank; now and then one holds an ember ---- */
function glassAfter(anim) {
  if (GL.aft || !HAS.e0) return; const g = GL.aft = new T.Group(); sc.add(g); const G = [], spots = [], R = EMBER.river;
  const near = (x, z) => nodes.some((n) => Math.hypot(n.x - x, n.z - z) < 0.95) || chests.some((c) => Math.hypot(c.x - x, c.z - z) < 1.3) || signs.some((s) => Math.hypot(s.x - x, s.z - z) < 1.1) || SC.rings.some((r) => Math.hypot(r.o.x - x, r.o.z - z) < 1.0) || spots.some((s) => Math.hypot(s[0] - x, s[1] - z) < 1.05) || EMBER.cross.some((C) => segD(x, z, C.a[0], C.a[1], C.b[0], C.b[1]) < 1.3 || Math.hypot(x - C.ring[0], z - C.ring[1]) < 1.0) || segD(x, z, R.a[0] - 0.6, R.a[1], R.b[0] + 0.6, R.b[1]) < 1.2 || Math.hypot(x - GLASS.rock[0], z - GLASS.rock[1]) < 0.8 || Math.hypot(x - R.pts[0][0], z - R.pts[0][1]) < 1.9;
  EMBER.lava.map((P) => [P, 0.75]).concat([[R.pts, R.w + 0.13]]).forEach(([P, w], s) => { const pts = emberPath(P); pts.forEach((p, k) => { if (k % 3 !== 1) return; const a = pts[Math.max(0, k - 1)], b = pts[Math.min(pts.length - 1, k + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / l, nz = (b[0] - a[0]) / l;
    [1, -1].forEach((sd) => { if (hash(k, 11900 + s + sd) < 0.15) return; const d = w + 0.42 + hash(k, 11910 + s + sd) * 0.3, x = p[0] + nx * sd * d, z = p[1] + nz * sd * d; if (walkSdf(x, z) > -0.2 || trailNear(x, z).d < 0.75 || near(x, z)) return; spots.push([x, z]); glFlower(G, x, z, 0.5 + hash(k, 11920 + s + sd) * 0.3, GL_COL[(k + s + (sd > 0 ? 1 : 0)) % 4], 11930 + k * 3 + s * 500 + sd); }); }); });
  if (spots.length) { const m = merged(G, glassMat, g); m.castShadow = false; m.receiveShadow = false; } GL.buds = spots;
  const bud = GL.bud = new T.Group(), bm = new T.Mesh(new T.OctahedronGeometry(0.085, 1), new T.MeshBasicMaterial({ color: '#ff9a3c' })); bud.add(bm); const sp = new T.Sprite(new T.SpriteMaterial({ map: glBlobTex(), color: '#ffb040', transparent: true, opacity: 0.7, depthWrite: false, blending: T.AdditiveBlending })); sp.scale.setScalar(0.8); bud.add(sp); bud.visible = false; g.add(bud);
  if (anim) { g.scale.set(1, 0.01, 1); GL.aftPop = 0.001; }
}
function glassStep(dt) {
  const pp = pip.position, S = glassS(), R = EMBER.river;
  if (!GL.out) { if (HAS.e3 && EM.g && !rising) glassOut(); if (!GL.out) return; }
  const nt = typeof nightAmt === 'number' ? nightAmt : 0, X = AREA_BY.e5.cx, Z = AREA_BY.e5.cz, near = Math.abs(pp.x - 44) < 34 && Math.abs(pp.z - 34) < 30;
  GL.out.visible = !inCave; if (GL.g) GL.g.visible = !inCave; if (GL.aft) GL.aft.visible = !inCave; if (GL.bal) GL.bal.visible = !inCave && !!HAS.e5 && !GL.pop;
  GL.u.value = 0.3 + nt * 0.7 + (GL.fin ? Math.min(0.5, GL.fin * 0.25) : 0);
  if (!inCave && near) GL.haze.forEach((h, k) => { const u = ((reduced ? 0.3 : time * 0.22) + k * 0.37) % 1; h.scale.set(0.9 + Math.sin(k * 2.1) * 0.25, 1.5 + u * 1.9, 1); h.material.opacity = (0.36 - nt * 0.14) * Math.sin(u * Math.PI); });
  if (!inCave && near) GL.sparks.forEach((P) => { const A = P.m.geometry.attributes.color; P.c.forEach((c, k) => { const v = reduced ? 0.25 : Math.pow(Math.max(0, Math.sin(time * (1.1 + (k % 5) * 0.23) + k * 2.4)), 10) * (0.9 + nt * 0.5); A.array[k * 3] = c.r * v; A.array[k * 3 + 1] = c.g * v; A.array[k * 3 + 2] = c.b * v; }); A.needsUpdate = true; });
  /* the river pours into the sea: steam where it meets the water */
  if (!reduced && !inCave && Math.hypot(pp.x - 45.2, pp.z - 46) < 16) { GL.sea -= dt; if (GL.sea <= 0) { GL.sea = 0.5; smokePuff(45.2 + (Math.random() - 0.5) * 1.1, -0.4 + Math.random() * 0.3, 46.75 + Math.random() * 0.3, '#ffffff'); } }
  /* ---- cooling the river ---- */
  if (GL.cool > 0 && GL.cool < 1) { GL.cool = Math.min(1, GL.cool + dt / 3.6); const t = GL.cool * 3.6;
    for (let k = GL.thrown.length - 1; k >= 0; k--) { const F = GL.thrown[k]; F.t += dt; if (F.t < 0) continue; const u = Math.min(1, F.t / 0.6); F.sp.visible = true; F.sp.position.set(F.x0 + (F.x1 - F.x0) * u, 1.7 * (1 - u) + 0.15 + Math.sin(u * Math.PI) * 1.4, F.z0 + (F.z1 - F.z0) * u); F.sp.material.rotation = u * 5;
      if (u >= 1) { sc.remove(F.sp); F.sp.material.dispose(); GL.thrown.splice(k, 1); const s = GL.stones[F.k]; s.visible = true; s.scale.setScalar(0.01); s.userData.p = 0.001; splash(F.x1, 0.2, F.z1, 6); for (let j = 0; j < 3; j++) smokePuff(F.x1 + (Math.random() - 0.5) * 0.5, 0.2 + Math.random() * 0.4, F.z1 + (Math.random() - 0.5) * 0.7, '#ffffff'); Snd.play('whoosh', { gain: 0.3, f: 180 + F.k * 25 }); Snd.play('tock', { gain: 0.4, f: 420 + F.k * 70 }); } }
    GL.crust.visible = t > 0.6; GL.crust.scale.x = Math.max(0.01, clamp((t - 0.6) / 1.5, 0, 1));
    if (GL.cool >= 1) { R.cool = 1; Snd.play('success', { gain: 0.45 }); burst((R.a[0] + R.b[0]) / 2, 1.0, 41, 10); } }
  GL.stones.forEach((s) => { if (s.userData.p > 0 && s.userData.p < 1) { s.userData.p = Math.min(1, s.userData.p + dt * 3); const e = s.userData.p; s.scale.setScalar(e < 0.7 ? e / 0.7 * 1.15 : 1.15 - (e - 0.7) / 0.3 * 0.15); } s.children[1].material.color.setRGB(1, 0.5 + (reduced ? 0 : Math.sin(time * 2 + s.position.x * 5) * 0.08), 0.16); });
  if ((S.cool || HAS.e5) && !(GL.cool > 0 && GL.cool < 1)) { if (!R.cool) { R.cool = 1; GL.crust.visible = true; GL.stones.forEach((s) => { s.visible = true; }); } if (!HAS.e5 && !rising) secretOpen('e5'); }
  /* things Pip walks round */
  if (!inCave && !SC.ride && pp.x > 42) GL.solid.forEach(([x, z, r]) => { const dx = pp.x - x, dz = pp.z - z, d = Math.hypot(dx, dz), q = r + 0.2; if (d < q && d > 1e-4 && (HAS.e5 || x < 46)) { pp.x = x + dx / d * q; pp.z = z + dz / d * q; } });
  glassBird(dt, nt);
  if (!GL.g) return;
  if (GL.pop) { GL.pop = Math.min(1, GL.pop + dt * 0.8); const e = GL.pop, s = e < 0.8 ? e / 0.8 * 1.06 : 1.06 - (e - 0.8) / 0.2 * 0.06; GL.g.scale.set(1, s, 1); if (GL.pop >= 1) { GL.pop = 0; GL.g.scale.setScalar(1); } }
  /* the balloon and its two rings */
  if (!GL.rings && !GL.pop) { GL.rings = 1; GL.bal = glBalloon(); sc.add(GL.bal); const W = GLASS.wood, E = GLASS.entry; GL.bal.position.set(W.park[0], 0, W.park[1]);
    ringMake({ x: W.ring[0], z: W.ring[1], icon: 'balloon', ok: () => !!HAS.e5 && !GL.pop, go: () => glassFly(0) }); ringMake({ x: E.ring[0], z: E.ring[1], icon: 'balloon', ok: () => !!HAS.e5, go: () => glassFly(1) }); lookFoot(W.park[0], W.park[1], 0.6, 0.6); lookFoot(E.park[0], E.park[1], 0.6, 0.6); }
  if (GL.bal) { const W = GLASS.wood, E = GLASS.entry, bal = GL.bal;
    if (!GL.fly) { const P = Math.hypot(pp.x - W.ring[0], pp.z - W.ring[1]) <= Math.hypot(pp.x - E.ring[0], pp.z - E.ring[1]) ? W.park : E.park; bal.position.set(P[0], 0, P[1]); bal.rotation.z = reduced ? 0 : Math.sin(time * 0.8) * 0.012; const dx = pp.x - P[0], dz = pp.z - P[1], d = Math.hypot(dx, dz); if (d < 0.72 && d > 1e-4 && !SC.ride) { pp.x = P[0] + dx / d * 0.72; pp.z = P[1] + dz / d * 0.72; } }
    bal.userData.flame.visible = true; const fs = GL.fly ? 1 + (GL.fly.up || 0) * 0.5 : 0.55; bal.userData.flame.scale.multiplyScalar(fs); }
  if (inCave || !near) return;
  /* the pools breathe; the light patches drift */
  GL.pools.forEach((P, k) => { P.m.rotation.z = reduced ? 0 : time * 0.07 * (k % 2 ? -1 : 1); const v = 0.9 + (reduced ? 0 : Math.sin(time * 1.1 + k * 2) * 0.06) + (k === 0 ? Math.min(0.5, GL.fin * 0.2) : 0); P.m.material.color.setRGB(v, v, v); });
  GL.pat.m.material.opacity = 0.5 - nt * 0.12; glassPatches();
  /* the flowers chime */
  GL.flw.forEach((F, k) => { const inn = Math.hypot(pp.x - F.x, pp.z - F.z) < 0.6 && pp.y < 0.5; if (inn && !F.in && !GL.pop) { F.sw = 1; Snd.play('bell', { gain: 0.16, f: F.note }); } F.in = inn; F.sw = Math.max(0, F.sw - dt * 0.8); F.f.rotation.z = reduced ? 0 : Math.sin(time * 11 + k) * 0.22 * F.sw + Math.sin(time * 0.8 + k * 2) * 0.03; F.f.rotation.x = reduced ? 0 : Math.cos(time * 9 + k) * 0.16 * F.sw; });
  /* ---- the four bells ---- */
  const all = !!(S.lit || S.done || GL.fin), want = GLASS.order[Math.min(3, GL.step)];
  GL.bells.forEach((B, k) => { const inn = Math.hypot(pp.x - B.x, pp.z - B.z) < 0.8 && pp.y < 0.5;
    if (inn && !B.in && !GL.pop) { B.sw = 1;
      if (all) Snd.play('bell', { gain: 0.45, f: B.note });
      else if (k === want) { Snd.play('bell', { gain: 0.55, f: B.note }); GL.step++; B.fl = 1; burst(B.x, 1.6, B.z, 8); Snd.play('sparkle', { gain: 0.25 }, 0.15); if (GL.step === 4) { GL.fin = 0.001; ['G5', 'B5', 'D6', 'G6', 'D6', 'B5', 'D6', 'G6'].forEach((n, i) => Snd.play('bell', { gain: 0.4, f: n }, 0.7 + i * 0.21)); ['G5', 'B5', 'D6', 'G6'].forEach((n) => Snd.play('bell', { gain: 0.3, f: n }, 2.6)); Snd.play('secret', { gain: 0.55 }, 3.0); } }
      else { Snd.play('bell', { gain: 0.18, f: B.note }); GL.show = 0; } }
    B.in = inn; B.sw = Math.max(0, B.sw - dt * 0.55); B.fl = Math.max(0, B.fl - dt * 1.6); const on = all || GLASS.order.indexOf(k) < GL.step;
    B.b.rotation.z = reduced ? 0 : Math.sin(time * 8 + k) * 0.26 * B.sw + Math.sin(time * 0.8 + k * 2) * 0.035; B.b.rotation.x = reduced ? 0 : Math.cos(time * 6.3 + k) * 0.16 * B.sw;
    B.lit += ((on ? 1 : 0) - B.lit) * Math.min(1, dt * 4); B.m.emissiveIntensity = 0.1 + nt * 0.25 + B.lit * (0.62 + (reduced ? 0 : Math.sin(time * 3 + k) * 0.12)) + B.fl * 1.1 + B.sw * 0.25; });
  /* all four lit: the tune, the light meets over the pool, the heart rises */
  const hx = X + GLASS.pool[0], hz = Z + GLASS.pool[1];
  if (GL.fin) { GL.fin += dt; if (GL.fin > 3.0 && !GL.finB) { GL.finB = 1; burst(hx, 0.6, hz, 14); splash(hx, 0.2, hz, 10); } if (GL.fin >= 6.2) { GL.fin = 0; GL.finB = 0; S.lit = 1; save(); } }
  { const show = !!(GL.fin > 0 || (S.lit && !S.done && !golds().glass)); GL.beams.forEach((b, k) => { const gr = GL.fin ? clamp((GL.fin - 0.8 - k * 0.3) / 0.7, 0, 1) : 1; b.visible = show && gr > 0; b.scale.set(1, Math.max(0.01, b.userData.len * gr), 1); b.material.opacity = 0.45 + (reduced ? 0 : Math.sin(time * 5 + k * 1.6) * 0.15); });
    const up = GL.fin ? clamp((GL.fin - 3.0) / 2.6, 0, 1) : 1, e = up * up * (3 - 2 * up); GL.heart.visible = show && (!GL.fin || GL.fin > 3.0); GL.heart.position.y = -0.45 + e * 1.75 + (reduced ? 0 : Math.sin(time * 1.8) * 0.05); GL.heart.rotation.y = time * 1.3; }
  if (S.lit && !S.done && !GL.fin && !golds().glass && Math.hypot(pp.x - hx, pp.z - hz) < GLASS.pool[2] + 0.8) { S.done = 1; GL.heart.visible = false; save(); goldGive('glass'); glassAfter(true); }
  /* ---- afterwards: the flowers by the lava ---- */
  if ((S.done || golds().glass) && !GL.aft && !rising) glassAfter(false);
  if (GL.aftPop) { GL.aftPop = Math.min(1, GL.aftPop + dt / 2.2); const e = GL.aftPop; GL.aft.scale.set(1, e < 0.85 ? e / 0.85 * 1.08 : 1.08 - (e - 0.85) / 0.15 * 0.08, 1); if (GL.aftPop >= 1) GL.aftPop = 0; }
  if (GL.aft && GL.buds.length) { const bud = GL.bud;
    if (GL.ripe < 0) { GL.ripeT -= dt; if (GL.ripeT <= 0) { let best = -1, bd = 0; GL.buds.forEach((s, k) => { const d = Math.hypot(pp.x - s[0], pp.z - s[1]) + hash(k, Math.floor(time)) * 6; if (d > 5 && d > bd) { bd = d; best = k; } }); if (best >= 0) { GL.ripe = best; bud.position.set(GL.buds[best][0], 0.95, GL.buds[best][1]); bud.visible = true; } else GL.ripeT = 5; } }
    else { const s = GL.buds[GL.ripe]; bud.position.y = 0.95 + (reduced ? 0 : Math.sin(time * 2.4) * 0.05); bud.children[0].rotation.y = time * 2; bud.children[1].scale.setScalar(0.8 + (reduced ? 0 : Math.sin(time * 3) * 0.12));
      if (Math.hypot(pp.x - s[0], pp.z - s[1]) < 0.75 && !SC.ride) { state.isle.store.ember = storeN('ember') + 1; invDirty = true; { const sp = new T.Sprite(new T.SpriteMaterial({ map: hamGiftTex('ember', 1), transparent: true, depthWrite: false })); sp.scale.set(1.5, 0.75, 1); sp.position.set(s[0], 1.5, s[1]); sc.add(sp); FD.floats.push({ sp, t: 0, y: 0 }); } save(); Snd.play('bell', { gain: 0.3, f: 'D7' }); burst(s[0], 0.9, s[1], 5); bud.visible = false; GL.ripe = -1; GL.ripeT = 80; } } }
}
/* the fire bird: where it wants to be depends on how far the story has come */
function glassBird(dt, nt) {
  const pp = pip.position, S = glassS(), X = AREA_BY.e5.cx, Z = AREA_BY.e5.cz;
  if (!GL.bird) { const g = glBird(); sc.add(g); GL.bird = { g, x: GLASS.rock[0], y: 0.62, z: GLASS.rock[1], ry: 1.57, fl: 0, peck: 0 }; }
  if (!GL.lamp && typeof NT !== 'undefined') { GL.lamp = [0, 1.2, 0, 0.01]; NT.lamps.push(GL.lamp); }
  const B = GL.bird, done = !!(S.done || golds().glass), A = areaAt(pp.x, pp.z), onE = !!A && A.id[0] === 'e' && !A.cave; let gx, gy, gz, perch = false, face = null, fast = 3.2;
  if (GL.fly && GL.bal) { gx = GL.bal.position.x + 0.19; gy = GL.bal.position.y + 1.5; gz = GL.bal.position.z + 0.05; perch = true; face = pip.rotation.y; fast = 30; }
  else if (done) { if (onE) { const a = reduced ? 0.8 : time * 0.7; gx = pp.x + 0.55 + Math.cos(a) * 0.18; gy = pp.y + 1.55 + (reduced ? 0 : Math.sin(time * 2.1) * 0.08); gz = pp.z - 0.15 + Math.sin(a) * 0.18; fast = 5.5; } else { gx = GLASS.rock[0]; gy = 0.62; gz = GLASS.rock[1]; perch = true; face = -1.2; } }
  else if (HAS.e5 && GL.g && !GL.pop) {
    if (S.lit || GL.fin) { const a = reduced ? 1 : time * 1.2; gx = X + GLASS.pool[0] + Math.cos(a) * 1.0; gy = 2.3 + Math.sin(a * 0.7) * 0.2; gz = Z + GLASS.pool[1] + Math.sin(a) * 0.8; }
    else { const k = GLASS.order[Math.min(3, GL.step)], Q = GL.bells[k], a = reduced ? 1 : time * 1.6; gx = Q.x + Math.cos(a) * 0.62; gy = 1.95 + Math.sin(a * 1.3) * 0.12; gz = Q.z + 0.3 + Math.sin(a) * 0.3;
      if (Math.hypot(B.x - Q.x, B.z - Q.z) < 1.2) { GL.show -= dt; if (GL.show <= 0) { GL.show = 2.1; Q.fl = 1; Q.sw = Math.max(Q.sw, 0.35); if (Math.hypot(pp.x - Q.x, pp.z - Q.z) < 11) Snd.play('ding', { gain: 0.12, f: Q.note }); } } } }
  else { gx = GLASS.rock[0]; gy = 0.62; gz = GLASS.rock[1]; perch = true; face = 1.45 + (reduced ? 0 : Math.sin(time * 0.6) * 0.25); /* it looks across the river */
    if (Math.hypot(pp.x - gx, pp.z - gz) < 3 && !S.cool && !reduced && Math.sin(time * 0.5) > 0.6) gy += Math.abs(Math.sin(time * 9)) * 0.12; }
  const dx = gx - B.x, dy = gy - B.y, dz = gz - B.z, d = Math.hypot(dx, dy, dz);
  if (d > 40 || fast > 20) { B.x = gx; B.y = gy; B.z = gz; } else if (d > 1e-3) { const st = Math.min(d, Math.max(0.6, d * 2.2) * fast * 0.5 * dt); B.x += dx / d * st; B.y += dy / d * st; B.z += dz / d * st; }
  const fly = !perch || d > 0.08; B.fl += ((fly ? 1 : 0) - B.fl) * Math.min(1, dt * 6);
  if (fly && Math.hypot(dx, dz) > 0.05) { let t = Math.atan2(dx, dz) - B.ry; t = Math.atan2(Math.sin(t), Math.cos(t)); B.ry += t * Math.min(1, dt * 7); } else if (face != null) { let t = face - B.ry; t = Math.atan2(Math.sin(t), Math.cos(t)); B.ry += t * Math.min(1, dt * 4); }
  B.g.position.set(B.x, B.y + (fly && !reduced ? Math.sin(time * 6) * 0.03 : 0), B.z); B.g.rotation.y = B.ry; B.g.rotation.x = -0.25 * B.fl;
  B.g.userData.w.forEach((w, k) => { w.rotation.z = (k ? 1 : -1) * ((1 - B.fl) * 1.2 - B.fl * (reduced ? 0.2 : Math.sin(time * 26) * 0.85)); });
  B.g.visible = !inCave && (!!HAS.e3 || !!HAS.e5); B.g.userData.glow.material.opacity = 0.3 + nt * 0.4; GL.ub.value = 0.45 + nt * 0.5;
  if (GL.lamp) { const on = B.g.visible && done && onE; GL.lamp[0] = on ? B.x : 0; GL.lamp[2] = on ? B.z : 0; GL.lamp[3] = on ? 6.5 : 0.01; if (!on) GL.lamp[1] = -500; else GL.lamp[1] = 1.2; }
}
ISLE_STEPS.push(glassStep);
