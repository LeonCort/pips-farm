/* ---------- Pip, second pass: a smooth, merged figure ----------
   Same rig as before (pb, limbs[] at the hips and shoulders, eyes[] for the blink, the head group at y 1.3), so the walk,
   the bed, riding, the wardrobe, the store gear and the rain gear keep working. What changes is how the shapes are made:
   - every body part is a rounded lathe or ball with smooth normals instead of faceted cylinders and boxes
   - the pieces of one rig part are merged into ONE mesh, so Pip is about 14 draw calls instead of 40 to 60
   - shading is painted into vertex colours (soft top-to-bottom gradients, darker hems and cuffs, a hair highlight)
   - optional ink outline: an inverted hull per merged mesh (one extra draw each, no shadow pass, no post-processing)
   Looks: 0 = the old figure, 1 = smooth, 2 = smooth with outline, 3 = storybook (big head, brows, big blush, outline). */
const PIP2 = { v: 2, refs: null, felt: 1, fd: 1, skin: null };
/* the game always uses look 3 (smooth, outline, soft felt). Dev mode (the wrench in settings) shows chips to compare the looks. */
const P2_DEV = typeof devOn !== 'undefined' && !!devOn;
if (P2_DEV) try { const f = localStorage.getItem('pips-felt'); if (f !== null && f !== '') PIP2.felt = Math.max(0, Math.min(2, +f | 0)); } catch (e) {}
if (P2_DEV) try { const s = localStorage.getItem('pips-look'); if (s !== null && s !== '') PIP2.v = Math.max(0, Math.min(3, +s | 0)); } catch (e) {}
const P2_LOOKS = [null, { head: 1.1, line: 0, face: 0 }, { head: 1.1, line: 0.017, face: 0 }, { head: 1.3, line: 0.02, face: 1 }];
const p2LineMat = new T.MeshBasicMaterial({ color: '#3a2823', side: T.BackSide });
const p2White = new T.MeshBasicMaterial({ color: '#ffffff' });
let p2BlushMat = null;
function p2Blush() {
  if (p2BlushMat) return p2BlushMat; const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 2, 32, 32, 31);
  gr.addColorStop(0, 'rgba(238,112,104,1)'); gr.addColorStop(0.55, 'rgba(238,112,104,0.7)'); gr.addColorStop(1, 'rgba(238,112,104,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  p2BlushMat = new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true, depthWrite: false }); return p2BlushMat;
}
const p2S = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const p2Mix = (a, b, t) => new T.Color(a).lerp(new T.Color(b), t);
/* felt: a small tiling fibre texture, laid over the vertex colours from three sides (no UVs needed) in object space, so it
   sticks to each limb as it swings. One extra material for Pip, three texture reads per pixel she covers, nothing else.
   Each piece carries a 'felt' weight: cloth and hair 1, skin 0.12, the rain slicker close to 0 so it stays smooth and shiny. */
const P2_FELT = { value: [0, 1, 1.9][PIP2.felt] };
let p2FeltMat = null;
function p2Felt() {
  if (p2FeltMat) return p2FeltMat; const N = 256, c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d'); x.fillStyle = '#808080'; x.fillRect(0, 0, N, N); x.lineCap = 'round';
  for (let i = 0; i < 3400; i++) { const px = hash(i, 1) * N, py = hash(i, 2) * N, a = hash(i, 3) * 6.283, l = 5 + hash(i, 4) * 12, bend = (hash(i, 5) - 0.5) * 8; x.strokeStyle = (hash(i, 6) < 0.5 ? 'rgba(255,255,255,' : 'rgba(0,0,0,') + (0.1 + hash(i, 7) * 0.16) + ')'; x.lineWidth = 0.8 + hash(i, 8) * 1.1;
    for (let ox = -N; ox <= N; ox += N) for (let oy = -N; oy <= N; oy += N) { if (px + ox < -20 || px + ox > N + 20 || py + oy < -20 || py + oy > N + 20) continue; x.beginPath(); x.moveTo(px + ox, py + oy); x.quadraticCurveTo(px + ox + Math.cos(a) * l * 0.5 - Math.sin(a) * bend, py + oy + Math.sin(a) * l * 0.5 + Math.cos(a) * bend, px + ox + Math.cos(a) * l, py + oy + Math.sin(a) * l); x.stroke(); } }
  { const d = x.getImageData(0, 0, N, N), q = d.data; for (let i = 0; i < q.length; i += 4) { const k = (hash(i, 9) - 0.5) * 30; q[i] += k; q[i + 1] += k; q[i + 2] += k; } x.putImageData(d, 0, 0); }
  const tex = new T.CanvasTexture(c); tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.anisotropy = 2;
  const m = MAT.clone();
  m.onBeforeCompile = function (sh) {
    if (typeof MAT.onBeforeCompile === 'function') MAT.onBeforeCompile(sh); /* keeps the rim light */
    sh.uniforms.feltMap = { value: tex }; sh.uniforms.feltAmt = P2_FELT;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float felt; varying vec3 vFeltP; varying vec3 vFeltN; varying float vFeltA;').replace('#include <begin_vertex>', '#include <begin_vertex>\n\tvFeltP = position; vFeltN = normal; vFeltA = felt;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D feltMap; uniform float feltAmt; varying vec3 vFeltP; varying vec3 vFeltN; varying float vFeltA;')
      .replace('#include <color_fragment>', '#include <color_fragment>\n\t{ vec3 fw = abs( vFeltN ); fw /= ( fw.x + fw.y + fw.z ); vec3 fp = vFeltP * 5.0; float ft = texture2D( feltMap, fp.yz ).r * fw.x + texture2D( feltMap, fp.xz ).r * fw.y + texture2D( feltMap, fp.xy ).r * fw.z; diffuseColor.rgb *= 1.0 + ( ft - 0.5 ) * 0.95 * feltAmt * vFeltA; }');
  };
  p2FeltMat = m; return m;
}
/* a painter: the colour, darker at y0 and lighter at y1 */
function p2G(col, y0, y1, lo, hi) { const b = new T.Color(col), f = (x, y, z, c) => { const q = Math.max(0, Math.min(1, (y - y0) / (y1 - y0))); c.copy(b).multiplyScalar(lo + (hi - lo) * q); }; if (col === PIP2.skin) f.felt = 0.12; return f; }
function p2Paint(g, fn) { const p = g.attributes.position, a = new Float32Array(p.count * 3), c = new T.Color(); for (let i = 0; i < p.count; i++) { fn(p.getX(i), p.getY(i), p.getZ(i), c); a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } g.setAttribute('color', new T.BufferAttribute(a, 3)); g.userData.felt = fn.felt != null ? fn.felt : PIP2.fd; return g; }
function p2Ball(r, sx, sy, sz, ws, hs) { const g = new T.SphereGeometry(r, ws || 14, hs || 10); g.scale(sx, sy, sz); return g; }
/* a shape turned on a lathe from a few [radius, y] points; n > 0 rounds the profile with a spline first. Faces always point outward. */
function p2Lathe(P, seg, n, phi0, phiL) {
  let pts = P.map((q) => new T.Vector2(q[0], q[1])); if (n) pts = new T.SplineCurve(pts).getPoints(n); pts.forEach((q) => { if (q.x < 0.0005) q.x = 0.0005; });
  const g = new T.LatheGeometry(pts, seg || 16, phi0 || 0, phiL == null ? Math.PI * 2 : phiL), p = g.attributes.position, nn = g.attributes.normal; let d = 0;
  for (let i = 0; i < p.count; i++) d += nn.getX(i) * p.getX(i) + nn.getZ(i) * p.getZ(i);
  if (d < 0) { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } for (let i = 0; i < nn.count; i++) nn.setXYZ(i, -nn.getX(i), -nn.getY(i), -nn.getZ(i)); }
  return g;
}
/* extra rows in a [radius, y] profile at the given heights, so painted stripes get crisp edges */
function p2Rows(P, ys) { P = P.slice(); ys.forEach((y) => { for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1]; if ((y - a[1]) * (y - b[1]) < 0) { P.splice(i + 1, 0, [a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y]); break; } } }); return P; }
const p2Edges = (cs, hw) => { const o = []; cs.forEach((c) => { o.push(c - hw - 0.002, c - hw + 0.002, c + hw - 0.002, c + hw + 0.002); }); return o; };
function p2Merge(L) {
  L = L.map((g) => g.index ? g.toNonIndexed() : g); let n = 0; L.forEach((g) => { n += g.attributes.position.count; });
  const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3), Fe = new Float32Array(n); let o = 0;
  L.forEach((g) => { const k = g.attributes.position.count * 3; P.set(g.attributes.position.array, o); N.set(g.attributes.normal.array, o); if (g.attributes.color) C.set(g.attributes.color.array, o); else C.fill(1, o, o + k); Fe.fill(g.userData.felt != null ? g.userData.felt : PIP2.fd, o / 3, (o + k) / 3); o += k; });
  const m = new T.BufferGeometry(); m.setAttribute('position', new T.BufferAttribute(P, 3)); m.setAttribute('normal', new T.BufferAttribute(N, 3)); m.setAttribute('color', new T.BufferAttribute(C, 3)); m.setAttribute('felt', new T.BufferAttribute(Fe, 1)); return m;
}
/* the outline: the same shape pushed out along its (welded) normals, drawn inside-out in ink */
function p2Hull(g, w) {
  const p = g.attributes.position.array, nA = g.attributes.normal.array, n = p.length / 3, map = new Map(), key = new Array(n);
  for (let i = 0; i < n; i++) { const k = Math.round(p[i * 3] * 1500) + ',' + Math.round(p[i * 3 + 1] * 1500) + ',' + Math.round(p[i * 3 + 2] * 1500); key[i] = k; let a = map.get(k); if (!a) { a = [0, 0, 0]; map.set(k, a); } a[0] += nA[i * 3]; a[1] += nA[i * 3 + 1]; a[2] += nA[i * 3 + 2]; }
  const out = new Float32Array(p.length);
  for (let i = 0; i < n; i++) { const a = map.get(key[i]), l = Math.hypot(a[0], a[1], a[2]) || 1; out[i * 3] = p[i * 3] + a[0] / l * w; out[i * 3 + 1] = p[i * 3 + 1] + a[1] / l * w; out[i * 3 + 2] = p[i * 3 + 2] + a[2] / l * w; }
  const h = new T.BufferGeometry(); h.setAttribute('position', new T.BufferAttribute(out, 3)); return h;
}
/* X: small details (nose, thumbs, zips, buttons) that are part of the mesh but get no outline of their own */
function p2Mesh(parent, L, line, mat, X) {
  const g = p2Merge(X && X.length ? L.concat(X) : L), m = new T.Mesh(g, mat || p2Felt()); m.castShadow = !mat; m.receiveShadow = !mat; parent.add(m);
  if (line) { const h = new T.Mesh(p2Hull(X && X.length ? p2Merge(L) : g, line), p2LineMat); h.userData.hull = 1; m.add(h); }
  return m;
}
/* a body surface made on the lathe: knows its radius at a height, so zips, pockets and buttons can sit on it */
function p2Surf(P, zs) {
  const pts = new T.SplineCurve(P.map((q) => new T.Vector2(q[0], q[1]))).getPoints(44);
  const rAt = (y) => { for (let i = pts.length - 1; i > 0; i--) { const a = pts[i - 1], b = pts[i]; if ((y - a.y) * (y - b.y) <= 0 && a.y !== b.y) return a.x + (b.x - a.x) * (y - a.y) / (b.y - a.y); } return 0; };
  return { rAt, zs,
    geo: (seg, ys) => { let q = pts.filter((q, i) => i % 2 === 0 || i === pts.length - 1).map((q) => [q.x, q.y]); if (ys) q = p2Rows(q, ys); const g = p2Lathe(q, seg || 24); g.scale(1, 1, zs); return g; },
    z: (x, y, off) => zs * Math.sqrt(Math.max(0, Math.pow(rAt(y) + (off || 0), 2) - x * x)),
    /* a patch lying on the surface between two heights and two angles (0 is the front) */
    strip: (y0, y1, off, a0, a1, seg) => { const q = []; for (let k = 0; k <= 10; k++) { const y = y0 + (y1 - y0) * k / 10; q.push([rAt(y) + off, y]); } const g = p2Lathe(q, seg || 2, 0, a0, a1 - a0); g.scale(1, 1, zs); return g; } };
}
/* hair as a cap whose edge follows a hairline: line(az) is how far down (degrees from the crown) the hair reaches at each side */
function p2Cap(R, line, col) {
  const g = new T.SphereGeometry(R, 26, 10, 0, Math.PI * 2, 0, Math.PI / 2), p = g.attributes.position, nn = g.attributes.normal, a = new Float32Array(p.count * 3), b = new T.Color(col), c = new T.Color(), w = new T.Color('#fff4dc');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), t = Math.acos(Math.max(-1, Math.min(1, y / R))) / (Math.PI / 2), az = Math.atan2(x, z), ln = line(az);
    const th = ln * Math.PI / 180 * Math.min(1, t / 0.9), rr = t > 0.95 ? R - 0.024 : R, s = Math.sin(th), deg = th * 180 / Math.PI;
    p.setXYZ(i, rr * s * Math.sin(az), rr * Math.cos(th), rr * s * Math.cos(az)); nn.setXYZ(i, s * Math.sin(az), Math.cos(th), s * Math.cos(az));
    c.copy(b).multiplyScalar(1.04 - 0.26 * p2S(0.55, 1, deg / ln)).lerp(w, 0.2 * Math.exp(-Math.pow((deg - 36) / 10, 2)));
    a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new T.BufferAttribute(a, 3)); return g;
}
/* knitted ribs: every other column of a lathe shape is a touch wider and lighter */
function p2Rib(g, n, amt, colAmt) { const p = g.attributes.position, c = g.attributes.color; for (let i = 0; i < p.count; i++) { const k = Math.cos(Math.atan2(p.getX(i), p.getZ(i)) * n), f = 1 + amt * k; p.setX(i, p.getX(i) * f); p.setZ(i, p.getZ(i) * f); if (c) { const q = 1 + colAmt * k; c.setXYZ(i, c.getX(i) * q, c.getY(i) * q, c.getZ(i) * q); } } return g; }

const P2_TORSO = [[0, 0.655], [0.16, 0.657], [0.226, 0.668], [0.246, 0.7], [0.241, 0.738], [0.233, 0.752], [0.237, 0.79], [0.232, 0.9], [0.212, 1.02], [0.176, 1.1], [0.12, 1.155], [0.05, 1.18], [0, 1.186]];
const P2_COAT = [[0, 0.585], [0.2, 0.587], [0.27, 0.6], [0.284, 0.635], [0.272, 0.75], [0.252, 0.9], [0.224, 1.03], [0.182, 1.11], [0.12, 1.165], [0.05, 1.188], [0, 1.192]];
function p2Arm(L, sleeve, cuff, skin, wide, bands, side, X) {
  const r = wide || 0, AP = new T.SplineCurve([[0, 0.086], [0.05, 0.076], [0.082 + r, 0.03], [0.085 + r, -0.05], [0.079 + r, -0.2], [0.073 + r, -0.3], [0.073 + r, -0.306]].map((q) => new T.Vector2(q[0], q[1]))).getPoints(10).map((q) => [q.x, q.y]); let g = p2Lathe(bands ? p2Rows(AP, p2Edges([-0.1, -0.22], 0.024)) : AP, 12, 0);
  const base = p2G(sleeve, -0.35, 0.08, 0.8, 1.05); p2Paint(g, bands ? (x, y, z, c) => { base(x, y, z, c); if (Math.abs(y + 0.1) < 0.024 || Math.abs(y + 0.22) < 0.024) c.lerp(bands, 1).multiplyScalar(0.86 + 0.18 * p2S(-0.35, 0.08, y)); } : base); L.push(g);
  g = p2Lathe([[0.06, -0.298], [0.08 + r, -0.302], [0.083 + r, -0.33], [0.08 + r, -0.357], [0.06, -0.361]], 12, 6); p2Paint(g, p2G(cuff, -0.36, -0.3, 0.92, 1)); L.push(g);
  g = p2Ball(0.066, 1, 1.1, 0.86, 12, 10); g.translate(0, -0.412, 0); p2Paint(g, p2G(skin, -0.49, -0.34, 0.86, 1.02)); L.push(g);
  g = p2Ball(0.03, 1, 1.15, 1, 8, 6); g.translate(-(side || 0) * 0.026, -0.4, 0.046); p2Paint(g, p2G(skin, -0.44, -0.37, 0.9, 1.02)); (X || L).push(g);
}
function buildPip2() {
  const look = P2_LOOKS[PIP2.v] || P2_LOOKS[1], ln = look.line;
  pb.traverse((o) => { if (o.isMesh && o.geometry) o.geometry.dispose(); });
  while (pb.children.length) pb.remove(pb.children[0]); eyes.length = 0; limbs.length = 0;
  const ts = AVO.ts[av.ts], shoe = AVO.sc[av.sc], ss = AVO.ss[av.ss], skin = AVO.skin[av.skin], hc = AVO.hc[av.hc], sh = AVO.sh[av.sh], bc = AVO.bc[av.bc], bs = AVO.bs[av.bs], hs = AVO.hs[av.hs];
  PIP2.skin = skin; PIP2.fd = 1; const refs = PIP2.refs = { arms: [], armG: [], skin, look }; let g, L;
  /* ----- legs: trousers with a rolled cuff, or bare legs with a sock; rounded shoes with a sole ----- */
  [-0.1, 0.1].forEach((x, k) => {
    const leg = new T.Group(); leg.position.set(x, 0.64, 0); pb.add(leg); limbs.push({ g: leg, s: k ? 1 : -1 }); L = [];
    if (bs === 'byxor') {
      g = p2Lathe([[0, 0.03], [0.06, 0.026], [0.092, 0], [0.094, -0.12], [0.088, -0.3], [0.085, -0.43], [0.085, -0.446]], 12, 10); p2Paint(g, p2G(bc, -0.5, 0.05, 0.76, 1.04)); L.push(g);
      g = p2Lathe([[0.07, -0.434], [0.099, -0.44], [0.104, -0.47], [0.099, -0.5], [0.07, -0.506], [0, -0.506]], 12, 8); p2Paint(g, p2G(p2Mix(bc, '#e6edf5', 0.34), -0.51, -0.43, 0.86, 1.02)); L.push(g);
    } else {
      g = p2Lathe([[0, 0.02], [0.072, 0], [0.071, -0.25], [0.064, -0.45], [0.06, -0.53], [0, -0.535]], 12, 14); p2Paint(g, p2G(skin, -0.55, 0.02, 0.84, 1.02)); L.push(g);
      if (bs === 'shorts') { g = p2Lathe([[0, 0.03], [0.06, 0.026], [0.094, 0], [0.099, -0.14], [0.101, -0.2], [0.096, -0.214], [0.07, -0.214]], 14, 12); p2Paint(g, p2G(bc, -0.22, 0.05, 0.8, 1.04)); L.push(g); }
      if (ss !== 'sandaler') { g = p2Lathe([[0.06, -0.455], [0.074, -0.46], [0.075, -0.5], [0.074, -0.545], [0.06, -0.55]], 12, 8); p2Paint(g, p2G('#fff6e4', -0.55, -0.45, 0.88, 1)); L.push(g); }
    }
    const sole = (col, th) => { const s = p2Lathe([[0, -0.642], [0.084, -0.642], [0.095, -0.634], [0.096, -0.642 + th - 0.006], [0.086, -0.642 + th], [0, -0.642 + th]], 16, 0); s.scale(1, 1, 1.5); s.translate(0, 0, 0.04); p2Paint(s, p2G(col, -0.65, -0.6, 0.86, 1)); L.push(s); };
    if (ss === 'sandaler') {
      g = p2Ball(1, 0.072, 0.04, 0.125, 12, 8); g.translate(0, -0.595, 0.04); p2Paint(g, p2G(skin, -0.64, -0.55, 0.86, 1.02)); L.push(g); sole(shoe, 0.03);
      [0.085, -0.005].forEach((z) => { g = new T.TorusGeometry(0.074, 0.014, 6, 12, Math.PI); g.scale(1, 0.62, 1); g.translate(0, -0.612, z); p2Paint(g, p2G(shoe, -0.62, -0.55, 0.9, 1.05)); L.push(g); });
    } else {
      g = p2Ball(1, 0.089, 0.078, 0.137, 14, 10); { const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < -0.05) p.setY(i, -0.05); } g.translate(0, -0.575, 0.04); p2Paint(g, p2G(shoe, -0.63, -0.49, 0.78, 1.08)); L.push(g);
      if (ss === 'stovlar') { g = p2Lathe([[0.084, -0.6], [0.09, -0.52], [0.093, -0.44], [0.096, -0.422], [0.088, -0.412], [0.07, -0.414]], 14, 10); p2Paint(g, p2G(shoe, -0.6, -0.41, 0.84, 1.06)); L.push(g); sole('#3a2c28', 0.04); }
      else sole('#fff6e4', 0.034);
    }
    p2Mesh(leg, L, ln);
  });
  /* ----- hips (or a skirt) and the basket on the back: stays on under the raincoat ----- */
  L = [];
  if (bs === 'kjol') {
    g = p2Lathe([[0.12, 0.77], [0.19, 0.74], [0.25, 0.6], [0.3, 0.47], [0.305, 0.455], [0.28, 0.452]], 32, 14); p2Paint(g, p2G(bc, 0.45, 0.78, 0.78, 1.04));
    { const p = g.attributes.position, c = g.attributes.color; for (let i = 0; i < p.count; i++) { const t = Math.max(0, Math.min(1, (0.77 - p.getY(i)) / 0.3)), w = Math.cos(Math.atan2(p.getX(i), p.getZ(i)) * 8), f = 1 + 0.05 * t * w, q = 1 + 0.07 * t * w; p.setX(i, p.getX(i) * f); p.setZ(i, p.getZ(i) * f); c.setXYZ(i, c.getX(i) * q, c.getY(i) * q, c.getZ(i) * q); } }
    g.scale(1, 1, 0.86); L.push(g);
  } else { g = p2Ball(1, 0.205, 0.1, 0.152, 16, 8); g.translate(0, 0.665, 0); p2Paint(g, p2G(bc, 0.56, 0.76, 0.74, 0.98)); L.push(g); }
  g = new T.BoxGeometry(0.44, 0.08, 0.3); g.translate(0, 0.82, -0.34); p2Paint(g, p2G(PAL.trunk, 0.78, 0.86, 0.86, 1.06)); L.push(g);
  [-0.17, 0.17].forEach((x) => { g = new T.BoxGeometry(0.045, 0.4, 0.045); g.translate(x, 0.98, -0.17); p2Paint(g, p2G(PAL.trunk, 0.78, 1.18, 0.82, 1.04)); L.push(g); });
  p2Mesh(pb, L, ln);
  /* ----- the top: jacket (hood roll, zip, slanted pockets), striped jumper, or hoodie (hood, pouch pocket, strings) ----- */
  const S = p2Surf(P2_TORSO, 0.74), dark = new T.Color(sh).multiplyScalar(0.66), band = p2Mix(sh, '#fff6e4', 0.72); L = [];
  g = S.geo(22, ts === 'randig' ? p2Edges([0.8, 0.92, 1.04], 0.0275) : null);
  { const base = p2G(sh, 0.66, 1.18, 0.8, 1.06); p2Paint(g, (x, y, z, c) => { base(x, y, z, c); if (y < 0.748) c.multiplyScalar(0.86); if (Math.abs(x) > 0.17 && y < 1.02) c.multiplyScalar(0.93);
    if (ts === 'randig') { if (Math.abs(y - 0.8) < 0.0275 || Math.abs(y - 0.92) < 0.0275 || Math.abs(y - 1.04) < 0.0275) c.lerp(band, 1).multiplyScalar(0.84 + 0.2 * p2S(0.66, 1.18, y)); } }); }
  L.push(g);
  /* the neck: a soft roll that sits higher at the back */
  { const big = ts !== 'randig'; g = new T.TorusGeometry(big ? 0.128 : 0.118, big ? 0.052 : 0.03, 10, 22); g.rotateX(Math.PI / 2); g.scale(1.06, 1, 0.9); g.rotateX(big ? 0.24 : 0.1); g.translate(0, big ? 1.15 : 1.165, -0.012); p2Paint(g, p2G(sh, 1.08, 1.22, 0.74, 0.98)); L.push(g); }
  let X = [];
  if (ts !== 'randig') { g = p2Ball(1, 0.075, 0.05, 0.04, 10, 6); g.translate(0, 1.128, 0.088); p2Paint(g, p2G('#fff6e4', 1.08, 1.17, 0.9, 1)); X.push(g); }
  if (ts === 'jacka') {
    g = S.strip(0.69, 1.105, 0.004, -0.052, 0.052, 2); p2Paint(g, p2G(dark, 0.69, 1.1, 0.95, 1.05)); X.push(g);
    g = p2Ball(1, 0.016, 0.022, 0.012, 8, 6); g.translate(0, 1.098, S.z(0, 1.098, 0.008)); p2Paint(g, p2G('#e8e2d8', 1.07, 1.12, 0.9, 1)); X.push(g);
    [-1, 1].forEach((s) => { g = p2Ball(1, 0.013, 0.058, 0.008, 8, 6); g.rotateZ(-s * 0.5); g.translate(s * 0.125, 0.835, S.z(s * 0.125, 0.835, 0.003)); p2Paint(g, p2G(dark, 0.78, 0.89, 0.95, 1.05)); X.push(g); });
    g = p2Ball(1, 0.17, 0.12, 0.075, 14, 8); g.rotateX(0.3); g.translate(0, 1.09, -0.135); p2Paint(g, p2G(sh, 0.97, 1.2, 0.72, 0.98)); L.push(g);
  }
  if (ts === 'luva') {
    g = p2Ball(1, 0.2, 0.155, 0.09, 16, 10); g.rotateX(0.3); g.translate(0, 1.075, -0.14); p2Paint(g, p2G(sh, 0.93, 1.22, 0.7, 0.98)); L.push(g);
    g = S.strip(0.752, 0.88, 0.006, -0.6, 0.6, 8); p2Paint(g, p2G(sh, 0.75, 0.88, 0.8, 0.9)); X.push(g);
    [-0.05, 0.05].forEach((x) => { g = new T.CylinderGeometry(0.009, 0.009, 0.13, 6); g.translate(x, 1.03, S.z(x, 1.03, 0.007)); p2Paint(g, p2G('#fff6e4', 0.96, 1.1, 0.9, 1)); X.push(g); g = p2Ball(0.012, 1, 1.3, 1, 6, 5); g.translate(x, 0.962, S.z(x, 0.96, 0.008)); p2Paint(g, p2G('#fff6e4', 0.94, 0.98, 0.9, 1)); X.push(g); });
  }
  refs.torso = p2Mesh(pb, L, ln, null, X);
  /* ----- arms: a sleeve, a cuff and a mitten hand with a thumb; they hang slightly outward ----- */
  [-0.275, 0.275].forEach((x, k) => {
    const arm = new T.Group(); arm.position.set(x, 1.08, 0); arm.rotation.z = k ? 0.1 : -0.1; pb.add(arm); limbs.push({ g: arm, s: k ? -1 : 1, arm: true }); L = []; X = [];
    p2Arm(L, sh, ts === 'randig' ? sh : new T.Color(sh).multiplyScalar(0.84), skin, 0, ts === 'randig' ? band : null, k ? 1 : -1, X);
    refs.armG.push(arm); refs.arms.push(p2Mesh(arm, L, ln, null, X));
  });
  /* ----- head: one smooth ball with soft cheeks, ears and a nose; eyes stay separate so they can blink ----- */
  const hsz = look.head, hg = new T.Group(); hg.position.set(0, 1.3 + Math.max(0, hsz - 1.16) * 0.25, 0); hg.scale.setScalar(hsz); pb.add(hg); pb.userData.head = hg; refs.hg = hg; const lh = ln / hsz;
  L = []; g = new T.SphereGeometry(0.27, 24, 16);
  { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const yy = p.getY(i) / 0.27; if (yy < 0.2) p.setX(i, p.getX(i) * (1 + 0.07 * p2S(0.2, -0.5, yy) * (1 - yy * yy))); } }
  g.scale(1, 0.97, 0.96); g.translate(0, 0.08, 0); p2Paint(g, p2G(skin, -0.2, 0.36, 0.85, 1.04)); L.push(g);
  [-1, 1].forEach((s) => { g = p2Ball(0.056, 0.5, 1, 0.8, 8, 8); g.translate(s * 0.264, 0.055, -0.01); p2Paint(g, p2G(p2Mix(skin, '#c9603e', 0.14), 0, 0.11, 0.9, 1.02)); L.push(g); });
  g = look.face ? p2Ball(1, 0.04, 0.042, 0.05, 10, 8) : p2Ball(1, 0.027, 0.033, 0.046, 10, 8); g.translate(0, 0.056, 0.258); p2Paint(g, p2G(p2Mix(skin, '#d2683a', look.face ? 0.36 : 0.22), 0.01, 0.1, 0.94, 1.05));
  p2Mesh(hg, L, lh, null, [g]);
  const er = look.face ? 0.041 : 0.034;
  [-0.096, 0.096].forEach((x) => {
    const e = new T.Mesh(new T.SphereGeometry(er, 12, 10), ink); e.scale.set(0.86, 1.15, 0.5); e.position.set(x, 0.116, 0.236); e.rotation.y = x * 3.4; hg.add(e); eyes.push(e);
    const hl = new T.Mesh(new T.SphereGeometry(er * 0.3, 6, 5), p2White); hl.position.set(er * 0.3, er * 0.36, er * 0.86); e.add(hl);
    const c = new T.Mesh(new T.CircleGeometry(look.face ? 0.062 : 0.05, 14), p2Blush()); if (!look.face) { if (!PIP2.blushLo) { PIP2.blushLo = p2BlushMat.clone(); PIP2.blushLo.opacity = 0.62; } c.material = PIP2.blushLo; } c.scale.set(1, 0.68, 1); c.position.set(x * 1.76, 0.002, 0.198); c.rotation.set(0.26, x * 7.6, 0, 'YXZ'); c.renderOrder = 2; hg.add(c);
  });
  /* mouth (and brows in the storybook look): one small ink mesh */
  const MY = 0.004; L = []; g = new T.TorusGeometry(0.05, look.face ? 0.012 : 0.0105, 6, 14, Math.PI * 0.72); g.rotateZ(-Math.PI / 2 - Math.PI * 0.36); g.rotateX(0.22); g.translate(0, MY, 0.239); L.push(g);
  [-1, 1].forEach((s) => { g = p2Ball(look.face ? 0.012 : 0.0105, 1, 1, 1, 6, 5); g.translate(s * 0.05 * Math.sin(Math.PI * 0.36), -0.05 * Math.cos(Math.PI * 0.36), 0); g.rotateX(0.22); g.translate(0, MY, 0.239); L.push(g); });
  if (look.face) [-1, 1].forEach((s) => { g = p2Ball(1, 0.036, 0.0095, 0.008, 8, 5); g.rotateZ(s * 0.22); g.rotateY(s * 0.4); g.translate(s * 0.1, 0.192, 0.214); L.push(g); });
  p2Mesh(hg, L, 0, ink);
  /* ----- hair: a cap with a real hairline, plus the style's pieces; hats and buns come off under the rain hat ----- */
  const hat = hs === 'mossa' || hs === 'keps', top = []; L = [];
  const line = (az) => { const c = Math.cos(az); return 92 + (hs === 'lang' ? 34 : 26) * p2S(0.1, 0.9, -c) - (hat ? 23 : 32) * p2S(0.3, 0.8, c) + (hat ? 3.2 * Math.sin(az * 9) * p2S(0.2, 0.7, c) : 1.6 * Math.sin(az * 5) * p2S(0.3, 0.8, c)); };
  g = p2Cap(0.284, line, hc); g.scale(1, 0.97, 0.96); g.translate(0, 0.08, 0); L.push(g);
  const hp = (y0, y1) => p2G(hc, y0, y1, 0.74, 1.06);
  if (hs === 'lang') { g = p2Ball(1, 0.292, 0.25, 0.13, 18, 12); g.translate(0, -0.05, -0.125); p2Paint(g, hp(-0.3, 0.2)); L.push(g); }
  if (hs === 'tofsar') [-1, 1].forEach((s) => { g = p2Ball(0.1, 0.85, 1.3, 0.85, 12, 10); g.rotateZ(s * 0.25); g.translate(s * 0.325, -0.03, -0.05); p2Paint(g, hp(-0.16, 0.1)); L.push(g); g = p2Ball(0.04, 1, 1, 1, 8, 6); g.translate(s * 0.285, 0.085, -0.045); p2Paint(g, p2G(PAL.accent, 0.04, 0.13, 0.86, 1.06)); L.push(g); });
  if (hs === 'knut') { g = p2Ball(0.128, 1, 0.9, 1, 16, 12); g.translate(0, 0.385, -0.075); p2Paint(g, hp(0.27, 0.5)); top.push(g); }
  if (hs === 'lockar') { for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; g = p2Ball(0.1, 1, 1, 1, 10, 8); g.translate(Math.cos(a) * 0.235, 0.275 + Math.sin(k * 1.7) * 0.03, Math.sin(a) * 0.2 - 0.045); p2Paint(g, hp(0.16, 0.4)); top.push(g); }
    [[0, 0.385, -0.03], [-0.11, 0.37, -0.1], [0.11, 0.37, -0.1]].forEach((q) => { g = p2Ball(0.1, 1, 0.9, 1, 10, 8); g.translate(q[0], q[1], q[2]); p2Paint(g, hp(0.26, 0.48)); top.push(g); }); }
  if (hs === 'keps') { const cc = sh === '#e9684a' ? PAL.sea : PAL.accent;
    g = new T.SphereGeometry(0.297, 24, 8, 0, Math.PI * 2, 0, Math.PI * 0.44); p2Paint(g, p2G(cc, 0.05, 0.3, 0.78, 1.06)); g.rotateX(-0.14); g.translate(0, 0.1, -0.005); top.push(g);
    g = p2Lathe([[0, 0], [0.17, 0], [0.19, 0.008], [0.19, 0.02], [0.17, 0.03], [0, 0.03]], 20, 0); g.scale(1, 1, 1.05); p2Paint(g, p2G(cc, 0, 0.03, 0.8, 1)); g.rotateX(0.16); g.translate(0, 0.205, 0.2); top.push(g);
    g = p2Ball(0.03, 1, 0.6, 1, 8, 5); g.translate(0, 0.392, -0.045); p2Paint(g, p2G(cc, 0.37, 0.41, 0.8, 0.95)); top.push(g); }
  if (hs === 'mossa') { const bc0 = sh === '#e9684a' ? '#e0a646' : '#e9763a', B = [];
    g = p2Lathe([[0.283, 0.04], [0.288, 0.1], [0.272, 0.17], [0.222, 0.235], [0.13, 0.275], [0.045, 0.288], [0, 0.29]], 36, 10); p2Paint(g, p2G(bc0, 0.04, 0.29, 0.86, 1.1)); p2Rib(g, 18, 0.006, 0.045); B.push(g);
    g = p2Lathe([[0.268, -0.05], [0.299, -0.053], [0.314, -0.03], [0.316, 0.03], [0.305, 0.062], [0.28, 0.067]], 36, 8); p2Paint(g, p2G(bc0, -0.05, 0.07, 0.78, 0.96)); p2Rib(g, 18, 0.012, 0.08); B.push(g);
    B.forEach((q) => { q.rotateX(-0.2); q.translate(0, 0.222, -0.015); top.push(q); }); }
  p2Mesh(hg, L, lh); refs.top = top.length ? p2Mesh(hg, top, lh) : null;
  p2Count();
}
/* the rain gear for the new figure: a long A-line slicker with a placket and buttons, yellow sleeves and a sou'wester.
   It swaps with the jacket, the sleeves and the hat/bun instead of sitting on top of them, so nothing pokes through. */
function pip2Rain(R) {
  if (!PIP2.v || !PIP2.refs) return false; const refs = PIP2.refs, look = refs.look, ln = look.line, Y = '#f5c22e', YD = '#d99a16', S = p2Surf(P2_COAT, 0.76); let g, L = []; PIP2.fd = 0.12;
  const add = (m) => { R.parts.push(m); return m; }, hide = (m) => { if (m) R.hair.push(m); };
  g = S.geo(22); p2Paint(g, p2G(Y, 0.59, 1.18, 0.8, 1.06)); L.push(g);
  g = new T.TorusGeometry(0.135, 0.05, 10, 22); g.rotateX(Math.PI / 2); g.scale(1.06, 1, 0.9); g.rotateX(0.2); g.translate(0, 1.155, -0.012); p2Paint(g, p2G(YD, 1.08, 1.22, 0.86, 1.04)); L.push(g);
  const X = []; g = S.strip(0.6, 1.11, 0.004, -0.07, 0.07, 2); p2Paint(g, p2G(YD, 0.6, 1.1, 0.9, 1.05)); X.push(g);
  [1.05, 0.9, 0.75].forEach((y) => { g = p2Ball(0.021, 1, 1, 0.6, 8, 6); g.translate(0, y, S.z(0, y, 0.008)); p2Paint(g, p2G('#3a2a1e', y - 0.02, y + 0.02, 0.9, 1.3)); X.push(g); });
  add(p2Mesh(pb, L, ln, null, X)); hide(refs.torso);
  refs.armG.forEach((arm, k) => { L = []; const X2 = []; p2Arm(L, Y, YD, refs.skin, 0.006, null, k ? 1 : -1, X2); add(p2Mesh(arm, L, ln, null, X2)); hide(refs.arms[k]); });
  L = []; g = p2Lathe([[0.3, -0.012], [0.4, -0.04], [0.416, -0.03], [0.34, 0.012], [0.306, 0.04], [0.302, 0.1], [0.272, 0.2], [0.2, 0.28], [0.1, 0.325], [0, 0.336]], 24, 18);
  { const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getZ(i) < 0 && Math.hypot(p.getX(i), p.getZ(i)) > 0.31) p.setZ(i, p.getZ(i) * 1.22); }
  { const a = p2G(Y, 0, 0.33, 0.84, 1.08), b = p2G(YD, 0, 0.1, 0.92, 1.02); p2Paint(g, (x, y, z, c) => { if (y > 0.036 && y < 0.078) b(x, y, z, c); else { a(x, y, z, c); if (y < 0.03) c.multiplyScalar(0.9 + 0.1 * p2S(-0.3, 0.3, z)); } }); }
  g.rotateX(-0.2); g.translate(0, 0.165, -0.012); L.push(g); add(p2Mesh(refs.hg, L, ln / look.head)); hide(refs.top);
  PIP2.fd = 1; return true;
}
/* ----- the test switcher: four numbered chips (1 old, 2 smooth, 3 smooth + outline, 4 storybook) and a small cost read-out ----- */
const p2Bar = document.createElement('div');
p2Bar.id = 'lookBar'; p2Bar.style.cssText = 'visibility:visible !important;position:fixed;top:max(10px,env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);z-index:9999;display:flex;gap:8px;align-items:center;padding:6px 10px;border-radius:26px;background:rgba(255,246,228,0.92);border:3px solid #22303c;box-shadow:0 4px 0 rgba(34,48,60,0.25);font:700 18px Fredoka,system-ui,sans-serif;color:#22303c;touch-action:manipulation';
p2Bar.innerHTML = [1, 2, 3, 4].map((n, i) => '<button type="button" data-v="' + i + '" style="width:44px;height:44px;border-radius:50%;border:3px solid #22303c;background:#fffaf0;font:inherit;color:inherit;padding:0">' + n + '</button>').join('') + '<button type="button" data-f="1" aria-label="filt" style="width:44px;height:44px;border-radius:14px;border:3px solid #22303c;background:#fffaf0;font:inherit;color:inherit;padding:0;margin-left:6px">\u25a6</button><span id="lookCost" style="font-size:13px;font-weight:600;min-width:86px;line-height:1.15;white-space:pre"></span>';
if (P2_DEV) document.body.appendChild(p2Bar);
function p2Chips() { p2Bar.querySelectorAll('button').forEach((b) => { if (b.dataset.f) { b.style.background = ['#fffaf0', '#f0b48a', '#c4562e'][PIP2.felt]; b.style.color = PIP2.felt === 2 ? '#fff' : '#22303c'; b.style.opacity = PIP2.v ? 1 : 0.4; return; } const on = +b.dataset.v === PIP2.v; b.style.background = on ? '#e9684a' : '#fffaf0'; b.style.color = on ? '#fff' : '#22303c'; }); }
function p2Count() { let m = 0, t = 0; pb.traverse((o) => { if (!o.isMesh) return; let v = true; for (let q = o; q && q !== pb; q = q.parent) if (!q.visible) v = false; if (!v) return; m++; t += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; }); PIP2.cost = { meshes: m, tris: Math.round(t) }; const el = document.getElementById('lookCost'); if (el) el.textContent = m + ' delar\n' + (t / 1000).toFixed(1) + 'k trianglar'; }
function pip2Set(v) { PIP2.v = Math.max(0, Math.min(3, v | 0)); try { localStorage.setItem('pips-look', String(PIP2.v)); } catch (e) {} buildAvatar(); p2Chips(); setTimeout(p2Count, 0); }
['pointerdown', 'mousedown', 'touchstart', 'click'].forEach((ev) => p2Bar.addEventListener(ev, (e) => { e.stopPropagation(); if (ev === 'click') { const b = e.target.closest('button'); if (b && b.dataset.f) { PIP2.felt = (PIP2.felt + 1) % 3; P2_FELT.value = [0, 1, 1.9][PIP2.felt]; try { localStorage.setItem('pips-felt', String(PIP2.felt)); } catch (er) {} p2Chips(); try { Snd.play('pop', { gain: 0.3, f: 420 + 90 * PIP2.felt }); } catch (er) {} } else if (b) { pip2Set(+b.dataset.v); try { Snd.play('pop', { gain: 0.3, f: 520 + 70 * (+b.dataset.v) }); } catch (er) {} } } }));
{ const base0 = buildAvatar; buildAvatar = function () { if (PIP2.v) buildPip2(); else { base0(); delete pb.userData.head; PIP2.refs = null; } setTimeout(p2Count, 0); }; }
if (PIP2.v) buildPip2();
p2Chips(); setTimeout(p2Count, 0);
if (window.__farmTest) window.__p2 = { felt: (k) => { PIP2.felt = k; P2_FELT.value = [0, 1, 1.9][k]; p2Chips(); }, set: (v) => pip2Set(v), av: (o) => { Object.assign(av, o); buildAvatar(); }, rain: (on) => rainGearShow(on), cost: () => PIP2.cost,
  shot: (ang, d, h, rain) => { if (rain != null) rainGearShow(!!rain); const c = new T.PerspectiveCamera(30, 1, 0.1, 100), p = pip.position; c.position.set(p.x + Math.sin(ang) * d, (h == null ? 1.0 : h) + 0.25, p.z + Math.cos(ang) * d); c.lookAt(p.x, 0.78, p.z); const r0 = pip.rotation.y; pip.rotation.y = 0; pip.updateMatrixWorld(true); const s = renderer.getSize(new T.Vector2()); c.aspect = s.x / s.y; c.updateProjectionMatrix(); renderer.render(sc, c); const u = canvas.toDataURL('image/png'); pip.rotation.y = r0; return u; } };
