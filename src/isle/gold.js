/* ---------- the seven golden gifts (Leon, 2026-11-28: a hidden world should give something special, with a moment of
   joy; "inspired by Zelda") ----------
   Each island's hidden world holds one golden gift. When Pip finds it, the game stops for a breath: Pip holds it up, the
   fanfare plays. From then on it stands on its own pedestal on the village green, beside the bell tower's place; the
   empty pedestals show a pale shape of what is still out there. state.isle.gold[id] = 1. */
const GOLD = [{ id: 'comb', isle: 'm' }, { id: 'hammer', isle: 's' }, { id: 'lily', isle: 'r' }, { id: 'sun', isle: 'w' }, { id: 'glass', isle: 'e' }, { id: 'shipbell', isle: 'c' }, { id: 'starheart', isle: 'cave' }];
const GOLD_AT = { x: 13, z: 9.7, r: 1.95 }; /* a ring round the bell tower's plot */
const GO = { g: null, items: {}, hold: null, wait: {}, cuts: [], cut: null, cutV: new T.Vector3() };
const golds = () => state.isle.gold || (state.isle.gold = {});
const goldAll = () => GOLD.every((G) => golds()[G.id]);
const goldSpot = (k) => { const a = (k - 3) * Math.PI / 4; return [GOLD_AT.x + Math.sin(a) * GOLD_AT.r, GOLD_AT.z - Math.cos(a) * GOLD_AT.r]; }; /* three quarters of a ring; the gap looks south */
const goldKeep = (x, z) => Math.hypot(x - GOLD_AT.x, z - GOLD_AT.z) < GOLD_AT.r + 0.8;
function goldGeo(id) {
  let q; const P = [];
  if (id === 'comb') { [[0, 0], [0.19, 0.11], [-0.19, 0.11], [0, 0.22], [0.19, 0.33], [-0.19, 0.33], [0, 0.44]].forEach(([x, y]) => { q = new T.CylinderGeometry(0.115, 0.115, 0.1, 6); q.rotateX(Math.PI / 2); q.rotateZ(Math.PI / 6); q.translate(x, y - 0.22, 0); P.push(q.toNonIndexed()); }); }
  else if (id === 'hammer') { q = new T.BoxGeometry(0.46, 0.24, 0.24); q.translate(0, 0.16, 0); P.push(q.toNonIndexed()); q = new T.CylinderGeometry(0.045, 0.045, 0.46, 6); q.translate(0, -0.14, 0); P.push(q.toNonIndexed()); }
  else if (id === 'lily') { for (let k = 0; k < 6; k++) { q = new T.ConeGeometry(0.1, 0.4, 4); q.translate(0, 0.2, 0); q.rotateZ(0.75); q.rotateY(k / 6 * 6.283); P.push(q.toNonIndexed()); } q = new T.SphereGeometry(0.09, 8, 6); P.push(q.toNonIndexed()); }
  else if (id === 'sun') { q = new T.SphereGeometry(0.2, 10, 8); P.push(q.toNonIndexed()); for (let k = 0; k < 8; k++) { q = new T.ConeGeometry(0.05, 0.16, 4); q.translate(0, 0.31, 0); q.rotateZ(k / 8 * 6.283); P.push(q.toNonIndexed()); } }
  else if (id === 'glass') { q = new T.SphereGeometry(0.2, 8, 6); q.scale(1, 1.25, 1); const A = q.attributes.position; for (let i = 0; i < A.count; i++) if (A.getY(i) > 0.05) A.setXYZ(i, A.getX(i) * (1 - A.getY(i) * 2.2), A.getY(i) * 1.3, A.getZ(i) * (1 - A.getY(i) * 2.2)); P.push(q.toNonIndexed()); }
  else if (id === 'shipbell') { q = new T.CylinderGeometry(0.1, 0.24, 0.34, 10, 1, true); P.push(q.toNonIndexed()); q = new T.SphereGeometry(0.1, 8, 5, 0, 6.283, 0, 1.6); q.translate(0, 0.17, 0); P.push(q.toNonIndexed()); q = new T.SphereGeometry(0.05, 6, 5); q.translate(0, -0.2, 0); P.push(q.toNonIndexed()); }
  else { q = new T.OctahedronGeometry(0.2, 0); q.scale(1, 1.5, 1); P.push(q.toNonIndexed()); for (let k = 0; k < 4; k++) { q = new T.OctahedronGeometry(0.08, 0); q.scale(1, 1.6, 1); q.translate(0.26, 0, 0); q.rotateY(k / 4 * 6.283); P.push(q.toNonIndexed()); } }
  let n = 0; P.forEach((p) => { n += p.attributes.position.count; }); const A = new Float32Array(n * 3); let o = 0; P.forEach((p) => { A.set(p.attributes.position.array, o); o += p.attributes.position.count * 3; });
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(A, 3)); g.computeVertexNormals(); return g;
}
const goldMat = new T.MeshStandardMaterial({ color: '#f6c63c', roughness: 0.3, metalness: 0.55, emissive: new T.Color('#a8741a'), emissiveIntensity: 0.55, side: T.DoubleSide });
const goldGhost = new T.MeshStandardMaterial({ color: '#8d8a84', roughness: 0.95, side: T.DoubleSide }); /* a grey stone carving of what is still out there */
function goldBuild() {
  if (GO.g || !HAS.h3) return; const g = GO.g = new T.Group(); sc.add(g); const L = []; let q;
  GOLD.forEach((G, k) => { const [x, z] = goldSpot(k);
    q = new T.CylinderGeometry(0.3, 0.36, 0.14, 8); q.translate(x, 0.07, z); L.push(fac(q.toNonIndexed(), (cx, cy, cz, i) => tone('#b5ab98', i, 0.3), 9600 + k));
    q = new T.CylinderGeometry(0.2, 0.24, 0.5, 8); q.translate(x, 0.39, z); L.push(fac(q.toNonIndexed(), (cx, cy, cz, i) => shadeY('#d6cebd', cy, 0.1, 0.7, i, 0.3), 9610 + k));
    q = new T.CylinderGeometry(0.3, 0.22, 0.1, 8); q.translate(x, 0.69, z); L.push(fac(q.toNonIndexed(), (cx, cy, cz, i) => tone('#c9c0ae', i, 0.3), 9620 + k));
    const m = new T.Mesh(goldGeo(G.id), golds()[G.id] ? goldMat : goldGhost); m.position.set(x, 1.15, z); m.castShadow = !!golds()[G.id]; g.add(m); GO.items[G.id] = m; lookFoot(x, z, 0.4, 0.4); });
  const mesh = merged(L, MAT, g); if (mesh && mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true; }
}
/* ---- "found it!" (Leon 2026-11-28: every one-time find is held up, "like it does with Zelda: Pip turns around and lifts it
   up. We celebrate the fact that we found something useful") ----
   holdUp(obj, o): the game holds its breath, Pip spins to face us, both arms go up, the thing rises over the head with rays
   of light turning behind it. Golden gifts get the long fanfare, tools, gear, keys and first finds the treasure tune.
   A second find while one is up waits its turn. */
let raysTex = null;
function foundRays() {
  if (raysTex) return raysTex; const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.translate(128, 128);
  const g = x.createRadialGradient(0, 0, 8, 0, 0, 124); g.addColorStop(0, 'rgba(255,244,190,0.95)'); g.addColorStop(0.45, 'rgba(255,214,110,0.45)'); g.addColorStop(1, 'rgba(255,200,80,0)'); x.fillStyle = g;
  for (let k = 0; k < 12; k++) { x.rotate(Math.PI / 6); x.beginPath(); x.moveTo(0, 0); x.lineTo(-13 - (k % 2) * 6, -124); x.lineTo(13 + (k % 2) * 6, -124); x.closePath(); x.fill(); }
  x.beginPath(); x.arc(0, 0, 46, 0, 7); x.fill(); raysTex = new T.CanvasTexture(c); return raysTex;
}
function foundTex(t) { const c = document.createElement('canvas'); c.width = c.height = 160; isleIcon(c.getContext('2d'), t, 80, 82, 2.3); return new T.CanvasTexture(c); }
function holdUp(m, o) {
  o = o || {}; if (GO.hold) { (GO.q = GO.q || []).push([m, o]); return; }
  const rays = new T.Sprite(new T.SpriteMaterial({ map: foundRays(), transparent: true, depthWrite: false, blending: T.AdditiveBlending })); sc.add(rays); sc.add(m);
  GO.hold = { m, rays, t: 0, len: o.len || 2.4, s0: o.s || 1, r0: pip.rotation.y, tex: o.tex };
  Snd.play(o.snd || 'treasure', { gain: o.gain || 0.65 }); burst(pip.position.x, 2.2, pip.position.z, o.n || 12);
}
/* a tool, a piece of gear, a key or the first of a special find: t is its picture */
function foundIt(t) { const sp = isleSprite(foundTex(t), 1.15); holdUp(sp, { tex: 1, s: 1.15 }); }
/* Pip finds a golden gift: the long fanfare, and from now on it stands on its pedestal */
function goldGive(id) {
  if (golds()[id]) return; golds()[id] = 1; holdUp(new T.Mesh(goldGeo(id), goldMat), { len: 3.2, s: 1.3, snd: 'fanfare', gain: 0.7, n: 22 });
  GO.wait[id] = 1; GO.cuts.push(id); save(); /* its pedestal stays grey until the trip to the green below has set it there */
}
const goldShown = (id) => !!golds()[id] && !GO.wait[id];
/* ---- the gift goes home (Leon 2026-11-28: "after the player has lifted up the item, show the final place and how one
   item has been added, to understand that progress has been made") ----
   Once the hold-up is over, the picture dips to cream, opens on the ring of pedestals round the bell tower's plot, and
   the new gift drops out of the sky onto its own pedestal: a sparkle, a chime, the grey stone turns gold and one more dot
   on the bell sign fills. Then it dips again and we are back with Pip. No words. A gift found in the mine plays at once too
   (Leon 2026-11-28: waiting until Pip left the mine felt like a bug): behind the cream the game steps out of the mine for
   the visit (inCave off, mine dark gone) and back in after, with Pip and the dog put back exactly where they stood. One
   found before the village green is bought waits until the pedestals stand. */
const camCut = () => (GO.cut && GO.cut.at ? GO.cutV : null); /* the engine's camera and the curve follow this point instead of Pip (loop-end.js, curve2.js) */
const goldCutFree = () => !GO.hold && !!GO.g && !caveT && !(typeof ferryBusy === 'function' && ferryBusy()) && !riding2() && !enSleep && !(typeof ED !== 'undefined' && ED.on);
function goldCutStep(dt) {
  if (!GO.cut) { if (!GO.cuts.length || !goldCutFree()) return; const id = GO.cuts.shift(); if (!GO.wait[id]) return;
    if (!GO.fade) { const f = GO.fade = document.createElement('div'); f.setAttribute('aria-hidden', 'true'); f.style.cssText = 'position:fixed;inset:0;background:#fff6e4;opacity:0;pointer-events:none;z-index:30'; document.body.appendChild(f); }
    GO.cut = { id, t: 0, at: 0, k: GOLD.findIndex((G) => G.id === id) }; Snd.play('whoosh', { gain: 0.35 }); }
  const C = GO.cut, pp = pip.position; C.t += dt; target.copy(pp); work = null;
  const [sx, sz] = goldSpot(C.k), IN = 0.35, OUT = 3.5, fall0 = 0.8, land = 1.95;
  GO.fade.style.opacity = String(C.t < IN ? C.t / IN : C.t < IN + 0.4 ? 1 - (C.t - IN) / 0.4 : C.t < OUT ? 0 : C.t < OUT + IN ? (C.t - OUT) / IN : Math.max(0, 1 - (C.t - OUT - IN) / 0.4));
  if (!C.at && !C.back && C.t >= IN) { C.at = 1; if (inCave) { C.cave = { p: pp.clone(), d: typeof dog !== 'undefined' && dog.g ? dog.g.position.clone() : null }; inCave = false; CV.da = 0; } GO.cutV.set(GOLD_AT.x + (sx - GOLD_AT.x) * 0.25, 0, GOLD_AT.z + (sz - GOLD_AT.z) * 0.25 + 0.5); GO.cutV.zoom = 0.8; camFocus.copy(GO.cutV); /* a closer look than usual, the whole ring in the picture */
    C.m = new T.Mesh(goldGeo(C.id), goldMat); C.rays = new T.Sprite(new T.SpriteMaterial({ map: foundRays(), transparent: true, depthWrite: false, blending: T.AdditiveBlending })); sc.add(C.m); sc.add(C.rays); }
  if (C.m) { const u = clamp((C.t - fall0) / (land - fall0), 0, 1), y = 1.2 + 4.6 * (1 - u * u); C.m.position.set(sx, y, sz); C.m.rotation.y = C.t * (3 + 4 * u); C.m.scale.setScalar(1.9 - 0.9 * u);
    C.rays.position.set(sx, y, sz - 0.05); C.rays.material.rotation = C.t * 0.7; C.rays.scale.setScalar(1.9 * (1 - 0.35 * u)); C.rays.renderOrder = 4;
    if (!C.whoosh && C.t > fall0) { C.whoosh = 1; Snd.play('swish', { gain: 0.4 }); }
    if (C.t >= land) { sc.remove(C.m); sc.remove(C.rays); C.rays.material.dispose(); C.m = null; delete GO.wait[C.id];
      const m = GO.items[C.id]; if (m) { m.material = goldMat; m.castShadow = true; } C.pop = 1; burst(sx, 1.3, sz, 18); Snd.play('success', { gain: 0.6 }); Snd.play('sparkle', { gain: 0.5 }); } }
  if (C.pop) { C.pop = Math.max(0, C.pop - dt * 1.6); const m = GO.items[C.id]; if (m) m.scale.setScalar(1 + 0.45 * Math.sin(C.pop * Math.PI)); }
  if (C.cave) { pp.copy(C.cave.p); target.copy(pp); if (C.cave.d) dog.g.position.copy(C.cave.d); } /* nothing up here may push Pip about while the mine is away */
  if (C.at && C.t >= OUT + IN) { C.at = 0; C.back = 1; if (C.cave) { inCave = true; CV.da = 1; C.cave = null; } camFocus.copy(pp); }
  if (C.t >= OUT + IN + 0.4) { GO.fade.style.opacity = '0'; if (C.m) { sc.remove(C.m); sc.remove(C.rays); delete GO.wait[C.id]; } GO.cut = null; }
}
/* over the middle of the ring: the bell, and seven dots that turn gold one by one */
function goldTag() {
  const n = GOLD.filter((G) => goldShown(G.id)).length; if (GO.tagN === n && GO.tag) return; GO.tagN = n;
  const c = document.createElement('canvas'); c.width = 256; c.height = 192; const x = c.getContext('2d');
  x.beginPath(); x.roundRect(8, 8, 240, 176, 44); x.fillStyle = '#fff6e4'; x.fill(); x.lineWidth = 7; x.strokeStyle = '#6e4426'; x.stroke();
  x.save(); x.translate(128, 76); x.scale(2.3, 2.3); x.lineWidth = 3; x.strokeStyle = '#3a2414'; x.lineJoin = x.lineCap = 'round'; loopIcon(x, 'belfry'); x.restore();
  for (let k = 0; k < 7; k++) { x.beginPath(); x.arc(44 + k * 28, 154, 10, 0, 7); x.fillStyle = k < n ? '#f6c63c' : '#d9cfbb'; x.fill(); x.lineWidth = 3; x.strokeStyle = '#6e4426'; x.stroke(); }
  const tex = new T.CanvasTexture(c); if (!GO.tag) { GO.tag = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); GO.tag.scale.set(1.5, 1.125, 1); GO.tag.position.set(GOLD_AT.x, 2.5, GOLD_AT.z); GO.g.add(GO.tag); } else { GO.tag.material.map.dispose(); GO.tag.material.map = tex; }
}
function goldStep(dt) {
  if (!GO.g) goldBuild();
  if (GO.g) { goldTag(); GO.tag.visible = !inCave && (!goldAll() || !!GO.cut || GOLD.some((G) => GO.wait[G.id])) && !mons().belfry; GO.tag.position.y = 2.5 + (reduced ? 0 : Math.sin(time * 1.7) * 0.05); }
  if (GO.g) GOLD.forEach((G, k) => { const m = GO.items[G.id]; const got = goldShown(G.id); if (m.material !== (got ? goldMat : goldGhost)) m.material = got ? goldMat : goldGhost; m.rotation.y = got ? time * 0.9 + k : 0; if (!(GO.cut && GO.cut.pop && GO.cut.id === G.id)) m.scale.setScalar(got ? 1 : 0.8); m.position.y = got ? 1.2 + (reduced ? 0 : Math.sin(time * 1.6 + k) * 0.05) : 1.02; m.visible = !inCave; });
  goldCutStep(dt);
  const H = GO.hold; if (!H) return; H.t += dt; const pp = pip.position, up = Math.min(1, H.t / 0.55), s = up * up * (3 - 2 * up), out = H.t > H.len ? Math.max(0.01, 1 - (H.t - H.len) / 0.4) : 1;
  if (H.t < H.len) { target.copy(pp); work = null; pip.rotation.y = (1 - s) * (H.r0 + Math.PI * 2); /* a full turn that ends facing us */
    limbs.forEach((l) => { if (l.arm) { l.g.rotation.x = -2.75 * s; l.g.rotation.z = (l.s > 0 ? -1 : 1) * (0.1 + 0.22 * s); } }); GO.arms = 1; }
  else if (GO.arms) { limbs.forEach((l) => { if (l.arm) l.g.rotation.z = l.s > 0 ? -0.1 : 0.1; }); GO.arms = 0; }
  const y = pp.y + 1.55 + s * 0.85 + (reduced ? 0 : Math.sin(H.t * 3) * 0.03);
  H.m.position.set(pp.x, y, pp.z); if (H.tex) H.m.scale.set(H.s0 * out * (0.4 + 0.6 * s), H.s0 * out * (0.4 + 0.6 * s), 1); else { H.m.rotation.y = H.t * 2.4; H.m.scale.setScalar(H.s0 * out); }
  H.rays.position.set(pp.x, y, pp.z - 0.05); H.rays.material.rotation = H.t * 0.7; H.rays.scale.setScalar(2.3 * s * out); H.rays.renderOrder = 4; H.m.renderOrder = 5;
  if (H.t > H.len + 0.4) { sc.remove(H.m); sc.remove(H.rays); H.rays.material.dispose(); if (H.tex) { H.m.material.map.dispose(); H.m.material.dispose(); } GO.hold = null; if (GO.q && GO.q.length) { const n = GO.q.shift(); holdUp(n[0], n[1]); } }
}
