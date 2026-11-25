
let renderer; try { renderer = new T.WebGLRenderer({ canvas, antialias: true }); } catch (e) { $('nogl').hidden = false; return; }
/* battery: a lower pixel ratio and a frame cap the player picks in settings (20, 30 or 60 per second) */
const FPS_OPTS = [30, 60, 20]; let fpsCap = 30; try { const v = +localStorage.getItem('pips-fps'); if (FPS_OPTS.includes(v)) fpsCap = v; } catch (e) {}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, fpsCap === 20 ? 1 : 1.5)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
const sc = new T.Scene(); sc.background = new T.Color(PAL.haze); sc.fog = new T.Fog(PAL.haze, 28, 70);
const cam = new T.PerspectiveCamera(36, 1, 0.5, 300);
const MAT = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 });
const _h = {};
function tone(hex, key, amt) { amt = amt == null ? 1 : amt; const c = new T.Color(hex); c.getHSL(_h); c.setHSL(_h.h + (hash(key, 1.3) - 0.5) * 0.03 * amt, clamp(_h.s * (1 + (hash(key, 7.7) - 0.5) * 0.22 * amt), 0, 1), clamp(_h.l * (1 + (hash(key, 13.1) - 0.5) * 0.15 * amt), 0, 1)); return c; }
function jit(geo, amt, seed) { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const k = Math.round(p.getX(i) * 500) * 0.731 + Math.round(p.getY(i) * 500) * 1.913 + Math.round(p.getZ(i) * 500) * 3.377 + (seed || 1) * 17.17; p.setXYZ(i, p.getX(i) + (hash(k, 1) - 0.5) * 2 * amt, p.getY(i) + (hash(k, 2) - 0.5) * 2 * amt, p.getZ(i) + (hash(k, 3) - 0.5) * 2 * amt); } return geo; }
function fac(src, paint, seed) {
  const g = src.index ? src.toNonIndexed() : src, p = g.attributes.position, n = p.count, col = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 3) { const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, cy = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3; const c = typeof paint === 'function' ? paint(cx, cy, cz, i / 3) : tone(paint, cx * 31.1 + cy * 53.3 + cz * 77.7 + (seed || 0)); for (let k = 0; k < 3; k++) { col[(i + k) * 3] = c.r; col[(i + k) * 3 + 1] = c.g; col[(i + k) * 3 + 2] = c.b; } }
  g.setAttribute('color', new T.BufferAttribute(col, 3)); g.computeVertexNormals(); return smoothGeo(g);
}
/* cozy look: soft shading. Corners sharper than about 62 degrees stay crisp (boxes, roofs); rounder shapes get smooth
   normals, and the colour of neighbouring faces is blended so the mosaic turns into soft gradients. Done once at build time. */
const CREASE = Math.cos(62 * Math.PI / 180);
function smoothGeo(g) {
  const p = g.attributes.position.array, nA = g.attributes.normal.array, cA = g.attributes.color ? g.attributes.color.array : null, n = p.length / 3;
  const fn = Float32Array.from(nA), oc = cA ? Float32Array.from(cA) : null, map = new Map();
  for (let i = 0; i < n; i++) { const k = Math.round(p[i * 3] * 1000) + ',' + Math.round(p[i * 3 + 1] * 1000) + ',' + Math.round(p[i * 3 + 2] * 1000); const L = map.get(k); if (L) L.push(i); else map.set(k, [i]); }
  for (const L of map.values()) { if (L.length < 2) continue;
    for (const i of L) { let nx = 0, ny = 0, nz = 0, r = 0, gg = 0, b = 0, c = 0; const a = i * 3;
      for (const j of L) { const q = j * 3; if (fn[a] * fn[q] + fn[a + 1] * fn[q + 1] + fn[a + 2] * fn[q + 2] < CREASE) continue; nx += fn[q]; ny += fn[q + 1]; nz += fn[q + 2]; if (oc) { r += oc[q]; gg += oc[q + 1]; b += oc[q + 2]; c++; } }
      const l = Math.hypot(nx, ny, nz); if (l > 0) { nA[a] = nx / l; nA[a + 1] = ny / l; nA[a + 2] = nz / l; } if (oc && c) { cA[a] = r / c; cA[a + 1] = gg / c; cA[a + 2] = b / c; } } }
  return g;
}
function part(geo, parent, x, y, z, noShadow) { const m = new T.Mesh(geo, MAT); m.position.set(x || 0, y || 0, z || 0); m.castShadow = !noShadow; m.receiveShadow = true; parent.add(m); return m; }
const ico = (r, d, seed, j) => jit(new T.IcosahedronGeometry(r, d), j == null ? r * 0.12 : j, seed);
const ink = new T.MeshBasicMaterial({ color: PAL.ink });

/* a smaller shadow map on the farm: blurrier, softer shadow edges (and cheaper) */
const HERE_SHADOW = 640;
sc.add(new T.HemisphereLight(0xc4d6f2, 0xa8a070, 0.6));
const sun = new T.DirectionalLight(0xffd6a0, 1.05); sun.position.set(-11, 9, 7.5); sun.castShadow = true; sun.shadow.mapSize.set(HERE_SHADOW, HERE_SHADOW);
Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 12, bottom: -12, near: 1, far: 50 }); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sc.add(sun); sc.add(sun.target);
const sky = new T.Mesh(new T.SphereGeometry(150, 32, 16), new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: new T.Color('#7db7dd') }, hor: { value: new T.Color('#ffe2c4') } }, vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: 'varying vec3 vD; uniform vec3 top; uniform vec3 hor; void main(){ float y = max(normalize(vD).y, 0.0); gl_FragColor = vec4(mix(hor, top, pow(y, 0.55)), 1.0); }' })); sc.add(sky);

/* ground: a flat plateau that drops to the sea at the edges.
   The game gives the island's shape in ISLAND: an oval a by b with a wavy coast (wob: waves, size, turn), an optional
   point (cape: angle, size, width), a round plaza in the middle, an oval ring road and straight roads. */
const ISL = ISLAND, RING = ISLAND.ring, ROADS = ISLAND.roads; /* ROADS: x0, z0, x1, z1, half width, kind */
function isleD(x, z) { if (ISL.d) return ISL.d(x, z); /* a game may give its own coast (the island game's squares) */ const u = x / ISL.a, v = z / ISL.b, th = Math.atan2(v, u), c = ISL.cape; let f = 1;
  for (const w of ISL.wob) f += w[1] * Math.sin(w[0] * th + w[2]);
  if (c) { const dth = th - c[0]; f += c[1] * Math.exp(-dth * dth / c[2]); }
  return Math.hypot(u, v) / f; }
function hAt(x, z) { const d = isleD(x, z); return d < 1 ? 0 : -Math.min(1.6, (d - 1) * 12); }
/* roads: 0 grass, 1 dirt road, 2 cobbles */
function segD(x, z, x0, z0, x1, z1) { const dx = x1 - x0, dz = z1 - z0, t = clamp(((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz), 0, 1); return Math.hypot(x - x0 - dx * t, z - z0 - dz * t); }
function roadKind(x, z) {
  if (Math.hypot(x, z) < ISL.plaza) return 2;
  let k = 0; for (const r of ROADS) if (segD(x, z, r[0], r[1], r[2], r[3]) < r[4]) { if (r[5] === 2) return 2; k = 1; }
  if (k) return k;
  if (RING) { const e = Math.hypot(x / RING.rx, z / RING.rz); if (Math.abs(e - 1) * (RING.rx + RING.rz) / 2 < RING.w) return 1; }
  return 0;
}
/* keep a target point on the island */
function onIsle(v) { if (inHouse) { v.x = clamp(v.x, IN_B.x0, IN_B.x1); v.z = clamp(v.z, IN_B.z0, IN_B.z1); return v; }
  if (Math.abs(v.x - DOCK.x) < 0.6 && v.z > DOCK.edge - 1 && v.z < DOCK.z1 + 1) { v.x = clamp(v.x, DOCK.x - 0.35, DOCK.x + 0.35); v.z = Math.min(v.z, DOCK.z1 - 0.3); return v; } /* out along the dock */
  if (ISL.clamp) return ISL.clamp(v); /* a game whose island is not an oval keeps points on it itself */
  const d = isleD(v.x, v.z), lim = 0.965; if (d > lim) { v.x *= lim / d; v.z *= lim / d; } return v; }
/* the ground's size: 58 by 40 round the middle, unless the game asks for more (the island game's world of islands: ISLAND.gw, gh, gx, gz) */
const GRW = ISL.gw || 58, GRH = ISL.gh || 40, GRX = ISL.gx || 0, GRZ = ISL.gz || 0, GRX0 = GRX - GRW / 2, GRZ0 = GRZ - GRH / 2;
const tg = new T.PlaneGeometry(GRW, GRH, Math.round(GRW / 58 * 112), Math.round(GRH / 40 * 78)); tg.rotateX(-Math.PI / 2); tg.translate(GRX, 0, GRZ);
{ const p = tg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + (hash(i, 1) - 0.5) * 0.3, z = p.getZ(i) + (hash(i, 2) - 0.5) * 0.3; p.setXYZ(i, x, hAt(x, z) + (hAt(x, z) === 0 ? hash(i, 5) * 0.04 : 0), z); } }
/* cozy ground (farm): soft grass gradients in the vertex colours, and the roads, pebbles, cobbles and painted grass strokes
   in two textures made once at start, so the paths get round, overgrown edges instead of triangle steps */
const GRASS_WARM = new T.Color('#d9c45a');
function vkey(x, y, z) { return Math.round(x * 8) * 7.31 + Math.round(z * 8) * 3.17 + Math.round(y * 8) * 1.13; }
function grassAt(x, z, base, key, warm) { const c = tone(base, key, 0.35); const n = 0.5 + 0.5 * Math.sin(x * 0.23 + Math.sin(z * 0.31) * 1.7) * Math.cos(z * 0.19 - x * 0.07), m = 0.5 + 0.5 * Math.sin(x * 0.61 + z * 0.47 + Math.sin(x * 0.2) * 2);
  c.lerp(GRASS_WARM, (warm == null ? 1 : warm) * (0.04 + 0.26 * n * n)); c.multiplyScalar(0.88 + 0.14 * m); return c; }
const WET_SAND = new T.Color('#b79a70');
/* the coast: grass softens into sand over a ragged band, and the sand darkens where the waves wet it */
function groundCol(x, y, z, key, grass, beach, warm) {
  if (y < -0.6) return tone(PAL.bed, key, 0.4);
  if (ISL.beachAt) beach = ISL.beachAt(x, z) || beach; /* a game may give parts of its coast their own sand (the island game's snow and stone islands) */
  if (y < -0.05) { const c = tone(beach || PAL.sand, key, 0.4); return c.lerp(WET_SAND, 0.5 * clamp((-y - 0.08) / 0.3, 0, 1)); }
  const c = grassAt(x, z, grass || PAL.grass, key, warm); if (ISL.tint) ISL.tint(x, z, c); /* a game may tint parts of its land (the island game's islands) */
  const d = isleD(x, z) + 0.012 * Math.sin(x * 1.7 + z * 0.9) + 0.008 * Math.sin(x * 4.1 - z * 3.3), q = clamp((d - 0.925) / 0.05, 0, 1);
  return q > 0 ? c.lerp(tone(beach || PAL.sand, key, 0.4), q * q * (3 - 2 * q)) : c;
}
function repaintV(mesh, paint) { const p = mesh.geometry.attributes.position, col = mesh.geometry.attributes.color; if (!col) return; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), c = paint(x, y, z, vkey(x, y, z)); col.setXYZ(i, c.r, c.g, c.b); } col.needsUpdate = true; }
const GU = { path: { value: new T.Color(PAL.sand) }, cob: { value: new T.Color('#dcc7a2') }, mask: { value: null }, det: { value: null } };
let ground, GMASK = null; /* GMASK: road kind per mask pixel */
{
  const gm = new T.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
  gm.onBeforeCompile = (sh) => {
    sh.uniforms.gMask = GU.mask; sh.uniforms.gDet = GU.det; sh.uniforms.pathCol = GU.path; sh.uniforms.cobCol = GU.cob;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vGuv;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvGuv = vec2((position.x - (' + GRX0.toFixed(3) + ')) / ' + GRW.toFixed(3) + ', (position.z - (' + GRZ0.toFixed(3) + ')) / ' + GRH.toFixed(3) + ');');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vGuv; uniform sampler2D gMask; uniform sampler2D gDet; uniform vec3 pathCol; uniform vec3 cobCol;')
      .replace('#include <color_fragment>', 'vec4 gmk = texture2D(gMask, vGuv); vec3 gdt = texture2D(gDet, vGuv).rgb; vec3 gcl = mix(vColor, pathCol, gmk.r); gcl = mix(gcl, cobCol, gmk.g); diffuseColor.rgb *= gcl * gdt * 1.02;');
  };
  ground = new T.Mesh(fac(tg, (cx, cy, cz, i) => groundCol(cx, cy, cz, i)), gm); ground.receiveShadow = true; sc.add(ground);
  repaintV(ground, (x, y, z, k) => groundCol(x, y, z, k));
  paintGroundTex();
}
/* world (x, z) to texture pixels: the farm ground is 58 x 40 */
const GX = (x, W) => (x - GRX0) / GRW * W, GZ = (z, H) => (z - GRZ0) / GRH * H;
function paintGroundTex() {
  const GN = ISL.detN || 1, MW = ISL.maskW || 1024, MH = ISL.maskH || 512, /* a game with a bigger world asks for bigger textures and more strokes (the island game) */ mc = document.createElement('canvas'); mc.width = MW; mc.height = MH; const mx = mc.getContext('2d'), id = mx.createImageData(MW, MH), K = new Uint8Array(MW * MH);
  for (let py = 0; py < MH; py++) for (let px = 0; px < MW; px++) {
    const x = (px + 0.5) / MW * GRW + GRX0, z = (py + 0.5) / MH * GRH + GRZ0;
    const wx = x + Math.sin(z * 2.3 + x * 0.7) * 0.09 + Math.sin(z * 5.1) * 0.04, wz = z + Math.sin(x * 2.1 - z * 0.5) * 0.09 + Math.sin(x * 4.7) * 0.04;
    const k = isleD(x, z) < 0.99 ? roadKind(wx, wz) : 0, o = (py * MW + px) * 4; K[py * MW + px] = k;
    id.data[o] = k === 1 ? 255 : 0; id.data[o + 1] = k === 2 ? 255 : 0; id.data[o + 3] = 255;
  }
  mx.putImageData(id, 0, 0); GMASK = { K, W: MW, H: MH };
  /* overgrown edges: grass blades reaching from the verge onto the dirt */
  mx.strokeStyle = '#000'; mx.lineWidth = 1.3; mx.lineCap = 'round'; mx.beginPath();
  for (let i = 0; i < 26000 * GN; i++) { const px = Math.floor(hash(i, 3.1) * MW), py = Math.floor(hash(i, 5.7) * MH), k = K[py * MW + px]; if (k !== 1) continue;
    let gx = 0, gy = 0; for (const [dx, dy] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) { const qx = px + dx, qy = py + dy; if (qx >= 0 && qy >= 0 && qx < MW && qy < MH && K[qy * MW + qx] === 0) { gx += dx; gy += dy; } }
    if (!gx && !gy) continue; const l = Math.hypot(gx, gy) || 1, L = 2 + hash(i, 9.1) * 3.5, a = (hash(i, 2.2) - 0.5) * 1.2, ux = -gx / l, uy = -gy / l, ca = Math.cos(a), sa = Math.sin(a);
    mx.moveTo(px + gx / l * 1.5, py + gy / l * 1.5); mx.lineTo(px + (ux * ca - uy * sa) * L, py + (ux * sa + uy * ca) * L); }
  mx.stroke();
  const mt = new T.CanvasTexture(mc); mt.flipY = false; mt.anisotropy = 4; GU.mask.value = mt;
  /* detail: a multiplier (white = unchanged) with painted grass strokes, pebbles, cobbles and fallen leaves */
  const DW = ISL.detW || 2048, DH = ISL.detH || 1024, dc = document.createElement('canvas'); dc.width = DW; dc.height = DH; const d = dc.getContext('2d');
  d.fillStyle = '#e8e8e8'; d.fillRect(0, 0, DW, DH);
  const kAt = (px, py) => K[Math.min(MH - 1, Math.max(0, Math.floor(py / DH * MH))) * MW + Math.min(MW - 1, Math.max(0, Math.floor(px / DW * MW)))];
  /* soft blotches so big lawns are not flat */
  for (let i = 0; i < 900 * GN; i++) { const x = hash(i, 11.1) * DW, y = hash(i, 12.3) * DH, r = 14 + hash(i, 13.7) * 40, v = hash(i, 14.9) > 0.5; const g = d.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, v ? 'rgba(255,255,240,0.35)' : 'rgba(150,160,120,0.22)'); g.addColorStop(1, 'rgba(232,232,232,0)'); d.fillStyle = g; d.fillRect(x - r, y - r, r * 2, r * 2); }
  /* grass strokes, batched by shade */
  const SH = ['rgba(255,255,236,0.7)', 'rgba(250,255,225,0.55)', 'rgba(185,198,150,0.45)', 'rgba(160,176,128,0.4)'];
  SH.forEach((c, si) => { d.strokeStyle = c; d.lineWidth = si < 2 ? 1.4 : 1.6; d.lineCap = 'round'; d.beginPath();
    for (let i = 0; i < 11000 * GN; i++) { const x = hash(i, 21.3 + si) * DW, y = hash(i, 22.9 + si) * DH; if (kAt(x, y)) continue; const L = 3 + hash(i, 23.1 + si) * 6, a = -1.57 + (hash(i, 24.7 + si) - 0.5) * 1.1; d.moveTo(x, y); d.quadraticCurveTo(x + Math.cos(a) * L * 0.5 + 1.5, y + Math.sin(a) * L * 0.5, x + Math.cos(a) * L, y + Math.sin(a) * L); }
    d.stroke(); });
  /* the verge: a little darker where grass meets the path (reads like ambient shade) */
  d.fillStyle = 'rgba(120,130,90,0.16)';
  for (let i = 0; i < 30000 * GN; i++) { const x = hash(i, 31.3) * DW, y = hash(i, 32.9) * DH; if (kAt(x, y)) continue; if (kAt(x + 7, y) || kAt(x - 7, y) || kAt(x, y + 7) || kAt(x, y - 7)) { d.beginPath(); d.arc(x, y, 3 + hash(i, 33.3) * 3, 0, 6.283); d.fill(); } }
  /* dirt: speckles and pebbles */
  for (let i = 0; i < 40000 * GN; i++) { const x = hash(i, 41.3) * DW, y = hash(i, 42.9) * DH; if (kAt(x, y) !== 1) continue; const big = hash(i, 43.3) > 0.93, r = big ? 1.4 + hash(i, 44.1) * 1.6 : 0.8 + hash(i, 44.1) * 1.2;
    if (big) { d.fillStyle = 'rgba(110,95,80,0.5)'; d.beginPath(); d.ellipse(x + 0.8, y + 1, r * 1.2, r, 0, 0, 6.283); d.fill(); d.fillStyle = hash(i, 45.1) > 0.5 ? '#f6f2ee' : '#d8d4d6'; d.beginPath(); d.ellipse(x, y, r * 1.2, r, hash(i, 46.2) * 3, 0, 6.283); d.fill(); }
    else { d.fillStyle = hash(i, 45.1) > 0.5 ? 'rgba(255,255,255,0.6)' : 'rgba(150,130,110,0.4)'; d.fillRect(x, y, r, r); } }
  /* cobbles: hand-laid stones of mixed sizes and shades, fanned in rings round the plaza and in staggered rows along the street,
     with dark joints, the odd sunken or missing stone (dirt or moss showing) and a light top edge on each */
  { const C = 0.21, gX = (x) => (x - GRX0) / GRW * DW, gZ = (z) => (z - GRZ0) / GRH * DH;
    /* joints first: dark, a little brown in places and green in others */
    for (let py = 0; py < DH; py += 3) for (let px = 0; px < DW; px += 3) if (kAt(px, py) === 2) { const t = hash(Math.floor(px / 40), Math.floor(py / 40), 7);
      d.fillStyle = t > 0.8 ? 'rgba(124,136,96,0.55)' : t > 0.55 ? 'rgba(140,120,104,0.55)' : 'rgba(146,134,126,0.52)'; d.beginPath(); d.moveTo(px + 2.8, py); d.arc(px, py, 2.8, 0, 6.283); d.fill(); }
    const TONES = [[251, 246, 240], [240, 232, 224], [228, 220, 214], [246, 238, 226], [232, 234, 236], [214, 206, 198], [255, 250, 244]];
    const stone = (x, z, lx, lz, rot, i) => { if (kAt(gX(x), gZ(z)) !== 2) return; const h = hash(i, 3.3);
      if (h < 0.035) { d.fillStyle = hash(i, 4.4) > 0.5 ? 'rgba(96,112,64,0.7)' : 'rgba(118,96,78,0.7)'; ell(x, z, lx * 0.8, lz * 0.8, rot, i); return; } /* missing: moss or bare dirt */
      const tn = TONES[Math.floor(hash(i, 5.5) * TONES.length)], k = h < 0.09 ? 0.86 : 1; /* a few sunken, darker stones */
      d.fillStyle = 'rgb(' + Math.round(tn[0] * k) + ',' + Math.round(tn[1] * k) + ',' + Math.round(tn[2] * k) + ')'; ell(x, z, lx, lz, rot, i);
      d.fillStyle = 'rgba(255,255,255,0.4)'; ell(x - Math.cos(rot) * lx * 0.15, z - lz * 0.25, lx * 0.55, lz * 0.35, rot, i + 0.5);
      if (hash(i, 6.6) > 0.9) { d.fillStyle = 'rgba(120,150,80,0.5)'; ell(x + lx * 0.7, z + lz * 0.4, 0.035, 0.035, 0, i); } };
    /* a lumpy rounded outline: 7 points at uneven radii, smoothed through the midpoints */
    const ell = (x, z, lx, lz, rot, i) => { const P = []; for (let j = 0; j < 7; j++) { const a = j / 7 * 6.2832, r = 0.82 + hash(i, j, 8.8) * 0.3, u = Math.cos(a) * lx * r, v = Math.sin(a) * lz * r;
        P.push([gX(x + u * Math.cos(rot) - v * Math.sin(rot)), gZ(z + u * Math.sin(rot) + v * Math.cos(rot))]); }
      d.beginPath(); const m0 = [(P[6][0] + P[0][0]) / 2, (P[6][1] + P[0][1]) / 2]; d.moveTo(m0[0], m0[1]);
      for (let j = 0; j < 7; j++) { const q = P[j], n = P[(j + 1) % 7]; d.quadraticCurveTo(q[0], q[1], (q[0] + n[0]) / 2, (q[1] + n[1]) / 2); } d.fill(); };
    let id = 0;
    /* plaza: rings of stones round the fountain */
    for (let r = 0.5; r < 3.6; r += C * 1.05) { const n = Math.max(6, Math.round(6.2832 * r / (C * 1.1))), a0 = hash(r, 1.7) * 6.28, ws = []; let tot = 0;
      for (let j = 0; j < n; j++) { ws.push(0.6 + hash(id + j, 2.1) * 0.9); tot += ws[j]; } /* mixed lengths that still close the ring */
      let a = a0; for (let j = 0; j < n; j++) { id++; const da = ws[j] / tot * 6.2832, aa = a + da / 2, rr = r + (hash(id, 2.7) - 0.5) * 0.04; a += da;
        stone(Math.cos(aa) * rr, Math.sin(aa) * rr, da * r * 0.49, C * (0.43 + hash(id, 3.1) * 0.1), aa + 1.5708 + (hash(id, 3.7) - 0.5) * 0.25, id); } }
    /* the street and anywhere else: staggered rows of stones of mixed lengths, now and then a big flag across two rows */
    for (let z = -20 + C / 2, row = 0; z < 20; z += C, row++) { let x = -29 + hash(row, 4.1) * C;
      while (x < 29) { id++; const big = hash(id, 4.7) > 0.94, L = big ? C * (1.6 + hash(id, 4.9) * 0.5) : C * (0.6 + hash(id, 5.1) * 0.9), cx = x + L / 2, cz = z + (hash(id, 5.3) - 0.5) * C * 0.15;
        if (Math.hypot(cx, cz) > 3.45) stone(cx, cz, L * 0.48, (big ? C * 0.58 : C * 0.46) * (0.88 + hash(id, 5.7) * 0.22), (hash(id, 5.9) - 0.5) * 0.18, id);
        x += L + C * 0.05; } } }
  /* fallen leaves */
  const LV = ['#e8a050', '#d97a3a', '#e9c060', '#c8643a'];
  for (let i = 0; i < 700 * GN; i++) { const x = hash(i, 51.3) * DW, y = hash(i, 52.9) * DH; if (hash(i, 50.1) > 0.35 && !kAt(x, y)) continue; d.fillStyle = LV[i % 4]; d.save(); d.translate(x, y); d.rotate(hash(i, 53.3) * 6.283); d.beginPath(); d.ellipse(0, 0, 3.2, 1.6, 0, 0, 6.283); d.fill(); d.restore(); }
  const dt = new T.CanvasTexture(dc); dt.flipY = false; dt.anisotropy = 4; GU.det.value = dt; GU.detC = dc;
}
/* contact shade: soft dark pools painted under trees, houses and props once the world is built (a cheap stand-in for ambient occlusion) */
function groundShade(list) {
  if (!GU.detC) return; const d = GU.detC.getContext('2d'), W = GU.detC.width, H = GU.detC.height; d.save(); d.globalCompositeOperation = 'multiply';
  list.forEach(([x, z, rx, rz, k]) => { const px = GX(x, W), py = GZ(z, H), sx = rx / GRW * W, sz = rz / GRH * H, r = Math.max(sx, sz); if (r < 1) return;
    d.save(); d.translate(px, py); d.scale(sx / r, sz / r); const g = d.createRadialGradient(0, 0, r * 0.15, 0, 0, r); const a = k == null ? 0.42 : k; g.addColorStop(0, 'rgba(70,80,60,' + a + ')'); g.addColorStop(0.6, 'rgba(120,130,100,' + a * 0.45 + ')'); g.addColorStop(1, 'rgba(255,255,255,0)'); d.fillStyle = g; d.beginPath(); d.arc(0, 0, r, 0, 6.283); d.fill(); d.restore(); });
  d.restore(); GU.det.value.needsUpdate = true;
}
let wg = new T.PlaneGeometry(160, 160, 56, 56); wg.rotateX(-Math.PI / 2);
wg = fac(wg, (cx, cy, cz, i) => { const d = ISL.d ? 16 * clamp((ISL.d(cx, cz) - 1) / 1.3, 0, 2) : Math.hypot(cx / 1.6, cz) * 0.8; return tone(d < 16 ? PAL.seaShallow : d < 28 ? PAL.sea : PAL.seaDeep, i, 0.9); });
const water = new T.Mesh(wg, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.28, metalness: 0.05 })); water.position.y = -0.45; water.receiveShadow = true; sc.add(water);
const wp = wg.attributes.position, wn = wg.attributes.normal;

const leafs = [];
/* soft, layered foliage: a merged cluster of round blobs (one mesh per crown) */
function mergeGeos(list) { list = list.map((g) => g.index ? g.toNonIndexed() : g); let n = 0; list.forEach((g) => { n += g.attributes.position.count; }); const P = new Float32Array(n * 3); let o = 0; list.forEach((g) => { const a = (g.index ? g.toNonIndexed() : g).attributes.position.array; P.set(a, o); o += a.length; }); const m = new T.BufferGeometry(); m.setAttribute('position', new T.BufferAttribute(P, 3)); return m; }
function fluff(r, seed, n, flat) {
  n = n || 6; flat = flat || 1; const L = [ico(r * 0.8, 1, seed, r * 0.05).translate(0, 0, 0)];
  for (let k = 0; k < n; k++) { const a = k / n * 6.283 + hash(seed, k) * 0.8, rr = r * (0.5 + hash(k, seed) * 0.15), sz = r * (0.42 + hash(seed, k + 9) * 0.18); L.push(ico(sz, 1, seed + k, sz * 0.07).translate(Math.cos(a) * rr, (hash(k, seed + 3) - 0.55) * r * 0.45 * flat, Math.sin(a) * rr)); }
  L.push(ico(r * 0.5, 1, seed + 40, r * 0.04).translate(r * 0.12, r * 0.55 * flat, -r * 0.08)); L.push(ico(r * 0.38, 1, seed + 41, r * 0.04).translate(-r * 0.3, r * 0.42 * flat, r * 0.25));
  return mergeGeos(L);
}
const _sy = new T.Color('#ffe9a0');
function shadeY(hex, y, y0, y1, key, amt) { const c = tone(hex, key, amt == null ? 0.6 : amt), q = clamp((y - y0) / (y1 - y0), 0, 1); c.multiplyScalar(0.62 + 0.5 * q); c.lerp(_sy, 0.18 * q * q); return c; }
/* foliage: a stronger vertical gradient than shadeY, cool deep green at the bottom of a crown and sunny yellow-green on top, so a
   cluster of round blobs reads as layers of leaves instead of one smooth plastic ball */
const _lyLo = new T.Color('#2e5a50'), _lyHi = new T.Color('#dfe98a');
function leafY(hex, y, y0, y1, key, amt) { const c = tone(hex, key, amt == null ? 0.6 : amt), q = clamp((y - y0) / (y1 - y0), 0, 1); c.lerp(_lyLo, 0.32 * (1 - q) * (1 - q)); c.multiplyScalar(0.54 + 0.46 * q); c.lerp(_lyHi, 0.22 * q * q * q); return c; }
function tree(kind, s) {
  const g = new T.Group(); let geo; const LF = typeof leafs !== 'undefined' ? leafs : null;
  if (kind === 'pine') {
    geo = new T.CylinderGeometry(0.06, 0.1, 0.4, 7); geo.translate(0, 0.2, 0); part(fac(geo, PAL.trunk, s), g);
    const L = []; for (let i = 0; i < 4; i++) { const r = 0.58 - i * 0.115, h = 0.6 - i * 0.04, pts = [new T.Vector2(r * 0.62, 0), new T.Vector2(r * 0.92, 0.03), new T.Vector2(r, 0.09)];
      for (let k = 1; k <= 6; k++) { const t = k / 6; pts.push(new T.Vector2(r * Math.pow(1 - t, 0.85) * (1 - 0.06 * Math.sin(t * Math.PI)) + (k === 6 ? 0.0 : 0), 0.09 + (h - 0.09) * t)); }
      const c = new T.LatheGeometry(pts, 12); c.translate(0, 0.32 + i * 0.3, 0); L.push(jit(c, 0.018, s + i)); }
    const base = s % 2 ? PAL.pine : PAL.forest, y0 = 0.3, y1 = 1.85, m = part(fac(mergeGeos(L), (cx, cy, cz, i) => leafY(base, cy, y0, y1, i)), g);
    m.userData = { pine: 1, base, y0, y1 }; if (LF) LF.push(m);
  } else {
    geo = new T.CylinderGeometry(0.07, 0.13, 0.85, 7); geo.translate(0, 0.42, 0); part(fac(jit(geo, 0.012, s), PAL.trunk, s), g);
    geo = new T.CylinderGeometry(0.03, 0.05, 0.4, 5); geo.translate(0, 0.2, 0); geo.rotateZ(0.7); geo.translate(0.02, 0.6, 0); part(fac(geo, PAL.trunk, s + 1), g);
    const y0 = 0.7, y1 = 1.85, m = part(fac(fluff(0.62, s, 7), (cx, cy, cz, i) => leafY(PAL.forest, cy + 1.25, y0, y1, i)), g, 0, 1.25, 0);
    m.userData = { base: PAL.forest, y0: y0 - 1.25, y1: y1 - 1.25 }; if (LF) LF.push(m);
  }
  return g;
}
(ISL.trees || [[-6.2, -12.8, 'pine'], [7.9, -12.3, 'pine'], [-16.4, -7.6, 'pine'], [-17.6, -3.0, 'tree'], [-17.6, 3.0, 'pine'], [2.6, -13.9, 'tree'], [-7.6, 12.6, 'pine'], [-9.2, 12.0, 'pine'], [-6.0, 13.2, 'pine'], [-2.0, 13.4, 'tree'], [5.4, 12.4, 'tree'], [12.6, 9.8, 'pine'], [17.6, 9.4, 'pine'], [22.0, 3.6, 'tree'], [20.8, -6.6, 'pine'], [15.2, -9.6, 'pine'], [-5.2, -3.8, 'tree'], [5.2, 3.9, 'tree'], [-5.0, 3.6, 'pine'], [5.0, -3.9, 'pine']]).forEach((t, i) => { const m = tree(t[2], i * 7 + 3); m.position.set(t[0], hAt(t[0], t[1]), t[1]); m.rotation.y = hash(i, 4) * 6.28; m.scale.setScalar(0.85 + hash(i, 9) * 0.4); sc.add(m); });
