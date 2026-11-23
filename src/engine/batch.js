/* ---------- still scenery is drawn in a few big pieces ----------
   The island is made of hundreds of small parts (tree trunks, crowns, rocks, fence posts, roof tiles), and every part
   used to be its own draw call, twice with the sun's shadow. That is what made full and ultra heavy on the iPad.
   This file watches the scene: a part that has not moved, changed or blinked for a couple of seconds is copied into
   one shared mesh per area and material, and the part itself is moved to a hidden layer, so it stays in the scene
   for the game (positions, visibility, raycasts) but is no longer drawn on its own.
   Every frame, before drawing, each copied part is checked again. When the game moves it, hides it, removes it or
   swaps its material, the part is taken out of its area mesh in that same frame and drawn on its own again.
   Parts that keep moving (animals, things being carried) stop being copied after a few tries.
   Trees, grass tufts and flower-bed plants sway in the wind (weather.js). They are copied in their resting pose and
   the same sway is done by the graphics card, with the same formula, so a copied tree sways exactly like before.
   Very small parts (pebbles, flower heads, nails) no longer cast their own speck of shadow once copied: the sun's
   shadow pass skips them.
   Nothing in the game needs to know: new parts are picked up by themselves. Light graphics keeps drawing part by part.
   Test page: __batch() counts, __batch().set(false) switches it off. */
const BATCH = { on: true, layer: 7, cell: 6, settle: 4, scanEvery: 0.5, maxMoves: 3, maxOuts: 6, budget: 3, tinyShadow: 0.14,
  rec: new Map(), chunks: new Map(), dirty: new Set(), sw: new Map(), scanT: 0, lastT: 0, builds: 0, frame: 0 };
{
  const HID = 1 << BATCH.layer, protoOBR = T.Object3D.prototype.onBeforeRender;
  /* raycasts still hit the hidden originals */
  ['intersectObject', 'intersectObjects'].forEach((k) => { const f = T.Raycaster.prototype[k]; T.Raycaster.prototype[k] = function (...a) { this.layers.mask |= HID; return f.apply(this, a); }; });
  /* a clone of a copied part is a new, ordinary part */
  { const c0 = T.Mesh.prototype.copy; T.Mesh.prototype.copy = function (s, r) { c0.call(this, s, r); if (this.layers.mask === HID) this.layers.mask = 1; return this; }; }

  const attrSig = (g) => Object.keys(g.attributes).sort().map((k) => k + g.attributes[k].itemSize).join(',');
  const shown = (o) => { for (let p = o; p; p = p.parent) { if (!p.visible) return false; if (p === sc) return true; } return false; };
  const matEq = (a, e) => { for (let i = 0; i < 16; i++) if (a[i] !== e[i]) return false; return true; };
  const okMat = (m) => m && !Array.isArray(m) && !m.transparent && m.visible !== false && (m.isMeshStandardMaterial || m.isMeshLambertMaterial || m.isMeshBasicMaterial || m.isMeshPhongMaterial || m.isMeshToonMaterial);
  function okMesh(o) {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || o.userData.batch || o.userData.noBatch) return false;
    if (o.onBeforeRender !== protoOBR || o.customDepthMaterial || o.customDistanceMaterial || o.renderOrder || !o.frustumCulled) return false;
    const g = o.geometry; if (!g || !g.isBufferGeometry || !g.attributes.position || !g.attributes.normal || g.morphAttributes.position) return false; /* groups only matter with a list of materials, which is left out below */
    if (g.drawRange.start !== 0 || g.drawRange.count !== Infinity) return false;
    for (const k in g.attributes) { const a = g.attributes[k]; if (a.isInterleavedBufferAttribute || a.normalized || !(a.array instanceof Float32Array) || k.startsWith('aSw')) return false; }
    return okMat(o.material);
  }
  const vers = (g) => { let v = 0; for (const k in g.attributes) v += g.attributes[k].version; return v + (g.index ? g.index.version : 0); };

  /* ----- the wind sway, as weather.js does it: a = a0*g + (sin(t*f1 + p1) + k2*sin(t*f2 + p2)) * (b0 + b1*g), turn z by -a*wx, x by a*wz ----- */
  function swayList() {
    const M = new Map(); try {
    if (typeof swayers !== 'undefined' && swayers) swayers.trees.forEach((g) => M.set(g, { g, v: [0.05, 1.6, g.userData.ph || 0, 0.018, 0.5, 0.7, (g.userData.ph || 0) * 1.7, 0.03], tx: 0, tz: 0, rx: 0, rz: 0 }));
    if (typeof tufts !== 'undefined') tufts.forEach((t) => M.set(t.g, { g: t.g, v: [0.22, 2.6, 0, 0.02, 0, 0, 0, 0.13], tx: t.x, tz: t.z, rx: 0, rz: 0 }));
    if (typeof beds !== 'undefined') beds.forEach((b, i) => { if (b.plants) b.plants.children.forEach((m, j) => M.set(m, { g: m, v: [0.1, 3.1, i + j * 0.7, 0.015, 0, 0, 0, 0.09], tx: 0, tz: 0, rx: m.userData.rx || 0, rz: m.userData.rz || 0 })); });
    } catch (e) {} BATCH.sw = M;
  }
  const swayOf = (o) => { for (let p = o; p && p !== sc; p = p.parent) { const s = BATCH.sw.get(p); if (s) return s; } return null; };
  /* the resting pose of a swaying group, and of a part inside it, in world space (no inverse, so it is the same number every frame) */
  const _e = new T.Euler(), _q = new T.Quaternion(), _l = new T.Matrix4();
  function restOf(s) {
    if (s.f === BATCH.frame) return s.rest; const g = s.g; if (!s.rest) s.rest = new T.Matrix4();
    _e.set(s.rx, g.rotation.y, s.rz, g.rotation.order); _q.setFromEuler(_e); s.rest.compose(g.position, _q, g.scale);
    if (g.parent) s.rest.premultiply(g.parent.matrixWorld); s.f = BATCH.frame; return s.rest;
  }
  const _w = new T.Matrix4();
  function worldOf(r) { /* the matrix a part is copied with: its world matrix, or its resting one when it sways */
    if (!r.sw) return r.o.matrixWorld;
    _w.copy(restOf(r.sw)); const chain = []; for (let p = r.o; p !== r.sw.g; p = p.parent) chain.push(p);
    for (let i = chain.length - 1; i >= 0; i--) _w.multiply(chain[i].matrix);
    return _w;
  }
  /* the shader side: shared uniforms, and a swaying copy of each material that needs one */
  const SWU = { uSw: { value: new T.Vector4() }, uSwOn: { value: 0 } };
  const SW_GLSL = '\nattribute vec3 aSwP; attribute vec4 aSw1; attribute vec4 aSw2; attribute vec2 aSwT; uniform vec4 uSw; uniform float uSwOn;\n'
    + 'vec3 swRot(vec3 r) { float g = uSw.y; float a = aSw1.x * g + (sin(uSw.x * aSw1.y + aSw1.z - 0.55 * dot(aSwT, uSw.zw)) + aSw2.x * sin(uSw.x * aSw2.y + aSw2.z)) * (aSw1.w + aSw2.w * g);\n'
    + '  a *= uSwOn; float ax = a * uSw.w, az = -a * uSw.z, cx = cos(ax), sx = sin(ax), cz = cos(az), sz = sin(az);\n'
    + '  r = vec3(r.x, r.y * cx - r.z * sx, r.y * sx + r.z * cx); return vec3(r.x * cz - r.y * sz, r.x * sz + r.y * cz, r.z); }\n';
  function swayPatch(sh) {
    sh.uniforms.uSw = SWU.uSw; sh.uniforms.uSwOn = SWU.uSwOn;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>' + SW_GLSL)
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nobjectNormal = swRot(objectNormal);')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed = aSwP + swRot(transformed - aSwP);');
  }
  const swMats = new Map(), swVer = new Map();
  function swayMat(base) {
    let m = swMats.get(base); if (m) return m;
    m = base.clone(); swVer.set(m, base.version);
    m.onBeforeCompile = function (sh, r) { if (base.onBeforeCompile) base.onBeforeCompile.call(this, sh, r); swayPatch(sh); };
    m.customProgramCacheKey = () => 'sway|' + base.customProgramCacheKey(); swMats.set(base, m); return m;
  }
  let swDepth = null;
  function swayDepth() {
    if (!swDepth) { swDepth = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking }); swDepth.onBeforeCompile = swayPatch; swDepth.customProgramCacheKey = () => 'swayDepth'; }
    return swDepth;
  }
  function swaySync() { /* the swaying copies follow their material (wet roughness, seasons, shadow switch) */
    swMats.forEach((m, base) => { const oc = m.onBeforeCompile, ck = m.customProgramCacheKey; m.copy(base); m.onBeforeCompile = oc; m.customProgramCacheKey = ck; if (base.version !== swVer.get(m)) { swVer.set(m, base.version); m.needsUpdate = true; } });
    try { SWU.uSw.value.set(time, WIND.g, WIND.x, WIND.z); SWU.uSwOn.value = !reduced && !inHouse ? 1 : 0; } catch (e) { SWU.uSwOn.value = 0; } /* before the game loop has started */
  }

  function keyOf(r) {
    const o = r.o, e = worldOf(r).elements, cx = Math.floor(e[12] / BATCH.cell), cz = Math.floor(e[14] / BATCH.cell), g = o.geometry;
    if (!g.boundingSphere) g.computeBoundingSphere(); const rad = g.boundingSphere.radius * o.matrixWorld.getMaxScaleOnAxis(), big = rad > 0.6 ? 'B' : 'S'; /* small parts apart, so the draw distance can still leave them out */
    return big + o.material.uuid + '|' + attrSig(o.geometry) + '|' + (o.castShadow && rad >= BATCH.tinyShadow ? 1 : 0) + (o.receiveShadow ? 1 : 0) + (r.sw ? 's' : '') + '|' + cx + ',' + cz;
  }
  function out(r, moved) { /* draw the part on its own again */
    const o = r.o; if (o.layers.mask === HID) o.layers.mask = 1;
    if (r.chunk) { BATCH.dirty.add(r.chunk); const c = BATCH.chunks.get(r.chunk); if (c) c.gone = true; }
    r.chunk = null; r.st = 0; r.outs++; if (moved) r.moves++;
  }
  /* glue a list of parts into one geometry, in world space */
  const _n = new T.Matrix3(), _v = new T.Vector3(), _p = new T.Vector3();
  function build(list, sway) {
    let nv = 0, ni = 0; for (const r of list) { const g = r.o.geometry; nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }
    const g0 = list[0].o.geometry, geo = new T.BufferGeometry(), arrs = {};
    for (const k in g0.attributes) { const a = g0.attributes[k]; arrs[k] = new Float32Array(nv * a.itemSize); }
    const SP = sway ? new Float32Array(nv * 3) : null, S1 = sway ? new Float32Array(nv * 4) : null, S2 = sway ? new Float32Array(nv * 4) : null, ST = sway ? new Float32Array(nv * 2) : null;
    const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    let vo = 0, io = 0;
    for (const r of list) {
      const o = r.o, g = o.geometry, n = g.attributes.position.count, m = worldOf(r); _n.getNormalMatrix(m);
      for (const k in g.attributes) {
        const a = g.attributes[k], s = a.itemSize, dst = arrs[k], base = vo * s;
        if (k === 'position') for (let i = 0; i < n; i++) { _v.fromBufferAttribute(a, i).applyMatrix4(m); dst[base + i * 3] = _v.x; dst[base + i * 3 + 1] = _v.y; dst[base + i * 3 + 2] = _v.z; }
        else if (k === 'normal') for (let i = 0; i < n; i++) { _v.fromBufferAttribute(a, i).applyMatrix3(_n).normalize(); dst[base + i * 3] = _v.x; dst[base + i * 3 + 1] = _v.y; dst[base + i * 3 + 2] = _v.z; }
        else dst.set(a.array.subarray(0, n * s), base);
      }
      if (sway) { const s = r.sw, v = s.v; _p.setFromMatrixPosition(restOf(s));
        for (let i = vo; i < vo + n; i++) { SP[i * 3] = _p.x; SP[i * 3 + 1] = _p.y; SP[i * 3 + 2] = _p.z; S1[i * 4] = v[0]; S1[i * 4 + 1] = v[1]; S1[i * 4 + 2] = v[2]; S1[i * 4 + 3] = v[3]; S2[i * 4] = v[4]; S2[i * 4 + 1] = v[5]; S2[i * 4 + 2] = v[6]; S2[i * 4 + 3] = v[7]; ST[i * 2] = s.tx; ST[i * 2 + 1] = s.tz; } }
      const flip = m.determinant() < 0, gi = g.index, cnt = gi ? gi.count : n;
      for (let t = 0; t < cnt; t += 3) {
        const a = gi ? gi.getX(t) : t, b = gi ? gi.getX(t + 1) : t + 1, c = gi ? gi.getX(t + 2) : t + 2;
        idx[io++] = vo + a; if (flip) { idx[io++] = vo + c; idx[io++] = vo + b; } else { idx[io++] = vo + b; idx[io++] = vo + c; }
      }
      r.pv = vers(g); vo += n;
    }
    for (const k in arrs) geo.setAttribute(k, new T.BufferAttribute(arrs[k], g0.attributes[k].itemSize));
    if (sway) { geo.setAttribute('aSwP', new T.BufferAttribute(SP, 3)); geo.setAttribute('aSw1', new T.BufferAttribute(S1, 4)); geo.setAttribute('aSw2', new T.BufferAttribute(S2, 4)); geo.setAttribute('aSwT', new T.BufferAttribute(ST, 2)); }
    geo.setIndex(new T.BufferAttribute(idx, 1)); geo.computeBoundingSphere(); geo.computeBoundingBox();
    if (sway) geo.boundingSphere.radius += 0.6; /* room for the sway */
    return geo;
  }
  const unhide = (r) => { r.chunk = null; if (r.o.layers.mask === HID) r.o.layers.mask = 1; };
  function rebuild(key) {
    const c = BATCH.chunks.get(key);
    const list = []; BATCH.rec.forEach((r) => { if (r.chunk === key || r.want === key) list.push(r); });
    if (c) { sc.remove(c.mesh); c.mesh.geometry.dispose(); BATCH.chunks.delete(key); }
    list.forEach((r) => { r.want = null; });
    const live = list.filter((r) => r.chunk === key || (r.st >= BATCH.settle && shown(r.o) && keyOf(r) === key));
    list.forEach((r) => { if (!live.includes(r) && r.chunk === key) unhide(r); });
    if (live.length < 2) { live.forEach(unhide); return; }
    const o0 = live[0].o, sway = !!live[0].sw, mesh = new T.Mesh(build(live, sway), sway ? swayMat(o0.material) : o0.material);
    if (sway) mesh.customDepthMaterial = swayDepth();
    mesh.castShadow = key.split('|')[2][0] === '1'; mesh.receiveShadow = o0.receiveShadow; mesh.matrixAutoUpdate = false; mesh.userData.batch = true; mesh.name = 'batch';
    let cr = 0; live.forEach((r) => { const g = r.o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); cr = Math.max(cr, g.boundingSphere.radius * r.o.matrixWorld.getMaxScaleOnAxis()); }); mesh.userData.cullR = cr;
    if (typeof AO !== 'undefined' && AO.done) AO.done.add(mesh.geometry); /* the corner shade is already in the copied colours */
    sc.add(mesh); mesh.updateMatrixWorld(true);
    BATCH.chunks.set(key, { mesh, n: live.length });
    live.forEach((r) => { r.chunk = key; r.o.layers.mask = HID; r.mat = r.o.material; r.geo = r.o.geometry; r.m.set(worldOf(r).elements); });
    BATCH.builds++;
  }
  function scan() {
    swayList();
    sc.traverse((o) => {
      if (!okMesh(o)) return;
      let r = BATCH.rec.get(o);
      if (!r) { r = { o, m: new Float64Array(16), st: 0, moves: 0, outs: 0, chunk: null, want: null, pv: -1, mat: null, geo: null, sw: swayOf(o) }; BATCH.rec.set(o, r); r.m.set(worldOf(r).elements); r.pv = vers(o.geometry); return; }
      if (r.chunk || r.moves >= BATCH.maxMoves || r.outs >= BATCH.maxOuts) return;
      if (o.layers.mask !== 1) return;
      r.sw = swayOf(o);
      const w = worldOf(r).elements;
      if (!matEq(r.m, w) || r.pv !== vers(o.geometry)) { r.m.set(w); r.pv = vers(o.geometry); r.st = 0; return; }
      if (!shown(o)) { r.st = 0; return; }
      if (++r.st >= BATCH.settle && !r.want) { const k = keyOf(r); r.want = k; BATCH.dirty.add(k); }
    });
    /* forget parts that left the scene for good */
    if (BATCH.rec.size > 4000) BATCH.rec.forEach((r, o) => { if (!r.chunk && !o.parent) BATCH.rec.delete(o); });
  }
  function check() { /* every frame: anything copied that the game changed goes back to being drawn on its own */
    BATCH.chunks.forEach((c) => { c.gone = false; });
    BATCH.rec.forEach((r) => {
      if (!r.chunk) return; const o = r.o;
      if (o.material !== r.mat || o.geometry !== r.geo || !matEq(r.m, worldOf(r).elements)) { out(r, true); return; }
      if (!shown(o) || o.layers.mask !== HID) { out(r, false); return; }
      if (vers(o.geometry) !== r.pv) { BATCH.dirty.add(r.chunk); r.pv = vers(o.geometry); } /* new colours (corner shade on/off, seasons): copy again */
    });
    /* a chunk that lost a part is redrawn without it right away, so nothing is ever drawn twice or left behind */
    BATCH.chunks.forEach((c, key) => { if (c.gone) rebuild(key); });
  }
  function clear() { BATCH.rec.forEach((r) => { unhide(r); r.want = null; r.st = 0; }); BATCH.chunks.forEach((c) => { sc.remove(c.mesh); c.mesh.geometry.dispose(); }); BATCH.chunks.clear(); BATCH.dirty.clear(); }
  BATCH.clear = clear;
  /* the draw distance fades small things out sooner (curve.js); an area mesh of small parts keeps that rule,
     measured from its nearest edge with the size of its biggest part */
  { const f0 = T.Frustum.prototype.intersectsObject, _s = new T.Sphere();
    T.Frustum.prototype.intersectsObject = function (o) {
      const cr = o.userData.cullR; if (cr != null && CURVE.u.strength.value) { _s.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld); const cd = _s.center.distanceTo(cam.position) - _s.radius; if (cd > CURVE.detail + cr * 8) return false; }
      return f0.call(this, o); }; }
  const ob0 = sc.onBeforeRender;
  sc.onBeforeRender = function (r, s, camera, rt) {
    if (ob0 !== protoOBR) ob0.call(this, r, s, camera, rt);
    if (camera !== cam) return; /* only the game's own view: thumbnails and shots leave the pieces as they are */
    if (!BATCH.on || (typeof gfxLow !== 'undefined' && gfxLow)) { if (BATCH.chunks.size) clear(); return; } /* light mode already draws little and leaves far small things out; it stays as it was */
    BATCH.frame++;
    const now = performance.now() / 1000, dt = BATCH.lastT ? Math.min(0.1, now - BATCH.lastT) : 0; BATCH.lastT = now;
    swaySync(); check();
    BATCH.scanT -= dt; if (BATCH.scanT <= 0) { BATCH.scanT = BATCH.scanEvery; scan(); }
    /* areas are glued for at most a few milliseconds per frame, so a big change never stalls one frame */
    const t0 = performance.now(); for (const k of BATCH.dirty) { BATCH.dirty.delete(k); rebuild(k); if (performance.now() - t0 > BATCH.budget) break; }
  };
}
if (window.__farmTest) window.__batch = () => { let parts = 0, sway = 0; BATCH.chunks.forEach((c) => { parts += c.n; if (c.mesh.customDepthMaterial) sway += c.n; }); return { on: BATCH.on, chunks: BATCH.chunks.size, parts, sway, builds: BATCH.builds, dirty: BATCH.dirty.size, set: (v) => { BATCH.on = !!v; }, budget: (v) => { BATCH.budget = v; }, pick: (i) => { let k = 0, f = null; BATCH.rec.forEach((r) => { if (r.chunk && k++ === (i || 0)) f = r.o; }); return f; }, inChunk: (o) => { const r = BATCH.rec.get(o); return !!(r && r.chunk); } }; };
if (window.__farmTest) window.__batchWhy = () => { const w = {}; sc.traverseVisible((o) => { if (!o.isMesh || o.layers.mask !== 1 || o.userData.batch) return; const r = BATCH.rec.get(o); const k = !r ? 'other' : r.moves >= BATCH.maxMoves ? 'moving' : r.outs >= BATCH.maxOuts ? 'blinking' : r.want ? 'queued' : r.sw ? 'sw-st' + r.st : 'st' + r.st; w[k] = (w[k] || 0) + 1; }); return w; };
