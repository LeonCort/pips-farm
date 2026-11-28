/* ---------- the Bee Queen's garden (Leon, 2026-11-27: every island a mini adventure with a place that stays sealed
   until Pip returns with something from another island) ----------
   In the far corner of the meadow stands an old walled garden. Brambles have grown over its gate, and only the iron
   axe (iron comes from the stone island) cuts them. Pip sees the golden hive over the wall on the first visit and
   cannot get in. Once the brambles are cut the garden stays open: the Queen's hive gives a big comb of honey each day,
   a chest waits by the wall, and from then on every hive on the island gives double.
   state.isle.garden: 1 once the gate is cut open. GARDEN in rules.js. */
const GD = { g: null, node: null, bees: null, walls: [], open: 0 };
const gardenOpen = () => !!state.isle.garden;
const gardenKeep = (a, x, z) => a.id === GARDEN.A && x > GARDEN.x0 - 1.0 && x < GARDEN.x1 + 2.2 && z > GARDEN.z0 - 1.0 && z < GARDEN.z1 + 1.0;
const BRAMBLE_GEO = (() => { const L = []; let q;
  for (let k = 0; k < 16; k++) { const a = hash(k, 8801) * 6.28, r = 0.15 + hash(k, 8802) * 0.55, y = 0.2 + hash(k, 8803) * 1.1; q = ico(0.3 + hash(k, 8804) * 0.16, 0, 8805 + k, 0.18); q.scale(1, 0.8, 1.25); q.translate(Math.cos(a) * r * 0.5, y, Math.sin(a) * r * 1.5);
    L.push(fac(q, (cx, cy, cz, i) => tone(['#3f6b3a', '#355c34', '#4d7a41', '#2f5230'][k % 4], i, 0.35), 8805 + k)); }
  for (let k = 0; k < 9; k++) { q = new T.TorusGeometry(0.42 + hash(k, 8830) * 0.3, 0.035, 5, 12, 3.6); q.rotateY(hash(k, 8831) * 6.28); q.rotateX((hash(k, 8832) - 0.5) * 0.9); q.translate((hash(k, 8833) - 0.5) * 0.4, 0.35 + hash(k, 8834) * 0.7, (hash(k, 8835) - 0.5) * 1.3); L.push(fac(q.toNonIndexed(), (cx, cy, cz, i) => tone('#6a4a3a', i, 0.3), 8830 + k)); }
  for (let k = 0; k < 10; k++) { const a = hash(k, 8850) * 6.28; q = ico(0.075, 0, 8851 + k); q.translate(Math.cos(a) * 0.36, 0.35 + hash(k, 8852) * 1.1, Math.sin(a) * 0.95); L.push(fac(q, () => new T.Color(k % 3 ? '#e86a8a' : '#f6c1d0'), 8851 + k)); }
  return merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, new T.Group()).geometry; })();
function gardenFill(A, fresh) {
  if (A.id !== GARDEN.A || GD.g) return; const G = GARDEN, g = GD.g = new T.Group(); sc.add(g); const L = []; let q;
  /* the wall: a dry-stone course of rough blocks with a mossy cap, corner posts, and a gate of two pillars in the east side */
  const course = (xa, za, xb, zb, sd) => { const len = Math.hypot(xb - xa, zb - za), n = Math.max(2, Math.round(len / 0.62)), ux = (xb - xa) / len, uz = (zb - za) / len;
    for (let k = 0; k < n; k++) for (let r = 0; r < 2; r++) { const t = (k + 0.5 + (r ? 0.5 : 0)) / n; if (t > 1) continue; q = new T.BoxGeometry(len / n * 0.96, 0.42, 0.42); { const P = q.attributes.position; for (let i = 0; i < P.count; i++) P.setXYZ(i, P.getX(i) + (hash(i + k * 9, sd + r) - 0.5) * 0.07, P.getY(i) + (hash(i + k * 5, sd + r + 1) - 0.5) * 0.06, P.getZ(i) + (hash(i + k * 3, sd + r + 2) - 0.5) * 0.08); }
      q.rotateY(Math.atan2(-uz, ux)); q.translate(xa + ux * len * t, 0.21 + r * 0.42, za + uz * len * t); L.push(fac(q.toNonIndexed(), (cx, cy, cz, i) => tone(['#c9c0ae', '#b5ab98', '#d6cebd', '#a89f8d'][(k + r * 2 + (i >> 3)) % 4], i + k, 0.4), sd + k * 2 + r)); }
    for (let k = 0; k < n; k += 2) { const t = (k + 0.6) / n; q = ico(0.2, 0, sd + 60 + k, 0.2); q.scale(1.5, 0.35, 1.1); q.translate(xa + ux * len * t, 0.86, za + uz * len * t); L.push(fac(q, (cx, cy, cz, i) => tone('#7f9a5e', i + k, 0.35), sd + 60 + k)); } };
  const gz0 = G.gate - 0.85, gz1 = G.gate + 0.85;
  course(G.x0, G.z0, G.door - 0.8, G.z0, 8900); course(G.door + 0.8, G.z0, G.x1, G.z0, 8930); course(G.x0, G.z1, G.x1, G.z1, 8960); course(G.x0, G.z0, G.x0, G.z1, 9020); course(G.x1, G.z0, G.x1, gz0, 9080); course(G.x1, gz1, G.x1, G.z1, 9140);
  [[G.x0, G.z0], [G.x1, G.z0], [G.x0, G.z1], [G.x1, G.z1], [G.x1, gz0], [G.x1, gz1]].forEach(([x, z], k) => { const tall = k > 3; q = new T.BoxGeometry(0.56, tall ? 1.7 : 1.1, 0.56); q.translate(x, tall ? 0.85 : 0.55, z); L.push(fac(q.toNonIndexed(), (cx, cy, cz, i) => shadeY(k % 2 ? '#cfc6b3' : '#bdb3a0', cy, 0, 1.7, i, 0.4), 9200 + k));
    q = ico(0.2, 0, 9210 + k); q.scale(1.2, 0.7, 1.2); q.translate(x, (tall ? 1.7 : 1.1) + 0.1, z); L.push(fac(q, (cx, cy, cz, i) => tone(tall ? '#f2c23c' : '#b5ab98', i, 0.25), 9210 + k)); });
  q = new T.BoxGeometry(0.2, 0.16, 2.0); q.translate(G.x1, 1.62, G.gate); L.push(fac(q.toNonIndexed(), (cx, cy, cz, i) => tone('#8a5f3c', i, 0.3), 9230));
  /* ivy and wild roses over the wall, flower beds along its inside, a flagstone path from the gate to the hive */
  for (let k = 0; k < 26; k++) { const s = k % 4, t = hash(k, 9240), x = s === 0 ? G.x0 + t * (G.x1 - G.x0) : s === 1 ? G.x0 + t * (G.x1 - G.x0) : s === 2 ? G.x0 : G.x1, z = s === 0 ? G.z0 : s === 1 ? G.z1 : G.z0 + t * (G.z1 - G.z0); if (s === 3 && Math.abs(z - G.gate) < 1.2) continue;
    q = ico(0.2 + hash(k, 9241) * 0.12, 0, 9242 + k, 0.2); q.scale(1.2, 0.8, 1.2); q.translate(x + (hash(k, 9243) - 0.5) * 0.3, 0.5 + hash(k, 9244) * 0.5, z + (hash(k, 9245) - 0.5) * 0.3); L.push(fac(q, (cx, cy, cz, i) => tone(k % 3 ? '#4d7a41' : '#3f6b3a', i, 0.35), 9242 + k));
    if (k % 2) { q = ico(0.07, 0, 9270 + k); q.translate(x + (hash(k, 9271) - 0.5) * 0.4, 0.75 + hash(k, 9272) * 0.3, z + (hash(k, 9273) - 0.5) * 0.4); L.push(fac(q, () => new T.Color(k % 4 === 1 ? '#e86a8a' : '#fff6e4'), 9270 + k)); } }
  for (let k = 0; k < 34; k++) { const x = G.x0 + 0.6 + hash(k, 9300) * (G.x1 - G.x0 - 1.2), top = hash(k, 9301) > 0.5, z = top ? G.z0 + 0.5 + hash(k, 9302) * 0.5 : G.z1 - 0.5 - hash(k, 9302) * 0.5, h = 0.25 + hash(k, 9303) * 0.3;
    q = new T.CylinderGeometry(0.018, 0.022, h, 4); q.translate(x, h / 2, z); L.push(fac(q.toNonIndexed(), '#5d8a48', 9304)); q = ico(0.085 + hash(k, 9305) * 0.04, 0, 9306 + k); q.scale(1, 0.6, 1); q.translate(x, h + 0.03, z); L.push(fac(q, () => new T.Color(['#f2c23c', '#e86a8a', '#b48be0', '#fff6e4', '#f29a2e'][k % 5]), 9306 + k)); }
  for (let k = 0; k < 7; k++) { const t = k / 6; q = new T.CylinderGeometry(0.3, 0.33, 0.05, 6); q.rotateY(hash(k, 9350) * 3); q.translate(G.x1 - 0.2 - t * (G.x1 - G.hive[0] - 1.2), 0.03, G.gate + Math.sin(t * 3.1) * 0.25); L.push(fac(q.toNonIndexed(), (cx, cy, cz, i) => tone(k % 2 ? '#d6cebd' : '#c2b9a6', i, 0.25), 9350 + k)); }
  const mesh = merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g); if (mesh && mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true; }
  lookFoot((G.x0 + G.x1) / 2, (G.z0 + G.z1) / 2, (G.x1 - G.x0) / 2 + 0.3, (G.z1 - G.z0) / 2 + 0.3);
  /* the hidden door in the north wall: a stone arch, and a round plug of hedge with a golden bee on it (giant.js opens it) */
  [-0.8, 0.8].forEach((dx, k) => { q = new T.BoxGeometry(0.42, 1.75, 0.5); q.translate(G.door + dx, 0.875, G.z0); L.push(fac(q.toNonIndexed(), (cx, cy, cz, i) => shadeY(k ? '#cfc6b3' : '#bdb3a0', cy, 0, 1.75, i, 0.4), 9460 + k)); });
  for (let k = 0; k < 7; k++) { const a = Math.PI * (k + 0.5) / 7; q = new T.BoxGeometry(0.4, 0.3, 0.52); q.rotateZ(a - Math.PI / 2); q.translate(G.door + Math.cos(a) * 0.82, 1.7 + Math.sin(a) * 0.5, G.z0); L.push(fac(q.toNonIndexed(), (cx, cy, cz, i) => tone(k === 3 ? '#f2c23c' : k % 2 ? '#c9c0ae' : '#b5ab98', i, 0.3), 9470 + k)); }
  if (!HAS.m5) { const P = []; for (let k = 0; k < 22; k++) { const a = hash(k, 9480) * 6.283, r = Math.sqrt(hash(k, 9481)) * 0.72; q = ico(0.26 + hash(k, 9482) * 0.1, 0, 9483 + k, 0.2); q.translate(G.door + Math.cos(a) * r * 0.85, 1.0 + Math.sin(a) * r * 1.05, G.z0 + (hash(k, 9484) - 0.5) * 0.25); P.push(fac(q, (cx, cy, cz, i) => tone(['#4d7a41', '#3f6b3a', '#5a8a4a'][k % 3], i, 0.3), 9483 + k)); }
    [[0, 0, 0.16, '#f6c63c'], [-0.13, 0.02, 0.11, '#3a2c1c'], [0.14, 0, 0.12, '#3a2c1c'], [-0.02, 0.17, 0.1, '#eaf6ff'], [0.1, 0.17, 0.1, '#eaf6ff']].forEach(([x, y, r, c], k) => { q = ico(r, 1, 9520 + k); q.scale(1, 0.85, 0.5); q.translate(G.door + x, 1.15 + y, G.z0 + 0.3); P.push(fac(q, c, 9520 + k)); });
    GD.door = merged(P, MAT, g); GD.door.castShadow = true; GD.doorTag = isleSprite(isleBubble('bee'), 0.8); GD.doorTag.position.set(G.door, 2.75, G.z0); g.add(GD.doorTag); }
  const T2 = 0.5; GD.walls = [{ x: (G.x0 + G.door - 0.8) / 2, z: G.z0, w: G.door - 0.8 - G.x0 + T2, d: T2 }, { x: (G.door + 0.8 + G.x1) / 2, z: G.z0, w: G.x1 - G.door - 0.8 + T2, d: T2 }, { x: (G.x0 + G.x1) / 2, z: G.z1, w: G.x1 - G.x0 + T2, d: T2 }, { x: G.x0, z: (G.z0 + G.z1) / 2, w: T2, d: G.z1 - G.z0 }, { x: G.x1, z: (G.z0 + gz0) / 2, w: T2, d: gz0 - G.z0 + 0.3 }, { x: G.x1, z: (gz1 + G.z1) / 2, w: T2, d: G.z1 - gz1 + 0.3 }];
  /* the Queen's hive: a tall golden skep on a stone plinth; its honey is a find like any hive's, only more of it */
  { const n = GD.hive = makeNode('hive', G.hive[0], G.hive[1], 9400); n.queen = 1; n.g.rotation.y = Math.PI / 2; const P = []; let p = new T.CylinderGeometry(0.62, 0.7, 0.3, 8); p.translate(0, 0.15, 0); P.push(fac(p.toNonIndexed(), (cx, cy, cz, i) => tone('#cfc6b3', i, 0.3), 9401));
    for (let k = 0; k < 6; k++) { const r = [0.5, 0.54, 0.5, 0.42, 0.3, 0.16][k]; p = new T.CylinderGeometry(r * 0.9, r, 0.22, 12); p.translate(0, 0.41 + k * 0.2, 0); P.push(fac(p.toNonIndexed(), (cx, cy, cz, i) => tone(k % 2 ? '#f2c23c' : '#ffd75a', i, 0.2), 9402 + k)); }
    p = new T.CylinderGeometry(0.11, 0.11, 0.06, 8); p.rotateZ(Math.PI / 2); p.translate(0.5, 0.6, 0); P.push(fac(p.toNonIndexed(), '#5a3a22', 9410));
    for (let k = 0; k < 5; k++) { p = new T.ConeGeometry(0.06, 0.16, 4); const a = k / 5 * 6.28; p.translate(Math.cos(a) * 0.12, 1.66, Math.sin(a) * 0.12); P.push(fac(p.toNonIndexed(), '#ffd75a', 9411 + k)); } /* her little crown */
    const m = merged(P, MAT, new T.Group()); m.castShadow = true; n.g.remove(n.main); while (n.g.children.length) n.g.remove(n.g.children[0]); n.main = m; n.full = 1; n.g.add(m); }
  if (!state.isle.chests.garden) makeChest(G.chest[0], G.chest[1], { coin: 30, honey: 3 }, 'garden');
  /* the brambles over the gate: an axe job, and only the iron axe bites (its picture floats over them) */
  if (!gardenOpen()) { const n = GD.node = makeNode('tree', G.x1 + 0.1, G.gate, 9450); n.gate = 'garden'; n.tier = 3; n.g.rotation.y = 0; n.g.remove(n.main); n.main = new T.Mesh(BRAMBLE_GEO, MAT); n.main.castShadow = true; n.main.scale.set(1.5, 1.35, 1.2); n.full = 1; n.g.add(n.main); n.hp = nodeHits(n) * 1.5; n.hpMax = n.hp;
    n.tag = isleSprite(isleBubble('axe3'), 0.95); n.tag.position.set(0, 2.3, 0); n.g.add(n.tag); }
  if (fresh) g.scale.setScalar(0.01), GD.pop = 0.001;
}
function gardenGateOpen(n) {
  state.isle.garden = 1; if (n.tag) { n.g.remove(n.tag); n.tag = null; } n.dead = 1; n.st = 'gone'; n.main.visible = false; if (work && work.n === n) work = null; GD.node = null; GD.open = 0.001;
  burst(n.x, 1.2, n.z, 16); Snd.play('thud', { gain: 0.5 }); Snd.play('secret', { gain: 0.6 }, 0.25); xpGain(25);
  nodes.forEach((q) => { if (q.kind === 'hive' && q.st !== 'ready') { q.t = 0.01; } }); save();
}
/* the hedge plug shrinks away: the way north is open */
function gardenDoor() { GD.doorOpen = 0.001; }
/* honey from a hive: the Queen's own gives a big comb, and once she is found every hive gives double */
const hiveGives = (n, c) => (n.kind !== 'hive' ? c : n.queen ? 5 : gardenOpen() ? c * 2 : c);
function gardenStep(dt) {
  if (!GD.g) return; const pp = pip.position;
  if (GD.pop) { GD.pop = Math.min(1, GD.pop + dt * 1.5); GD.g.scale.setScalar(GD.pop); if (GD.pop >= 1) GD.pop = 0; }
  if (GD.doorOpen) { GD.doorOpen = Math.min(1, GD.doorOpen + dt * 1.2); if (GD.door) { GD.door.scale.setScalar(Math.max(0.001, 1 - GD.doorOpen)); GD.door.position.set(GARDEN.door * GD.doorOpen, GD.doorOpen, GARDEN.z0 * GD.doorOpen); if (GD.doorOpen >= 1) { GD.g.remove(GD.door); GD.door = null; } } if (GD.doorTag) { GD.g.remove(GD.doorTag); GD.doorTag = null; } }
  if (GD.doorTag) GD.doorTag.position.y = 2.75 + (reduced ? 0 : Math.sin(time * 2) * 0.05);
  if (!inCave) { GD.walls.forEach((m) => { mesaOut(m, pp, 0.3); }); if (!HAS.m5 || GD.door) mesaOut({ x: GARDEN.door, z: GARDEN.z0, w: 1.6, d: 0.5 }, pp, 0.3); if (!gardenOpen()) mesaOut({ x: GARDEN.x1, z: GARDEN.gate, w: 0.5, d: 1.9 }, pp, 0.3); }
  /* bees: a few round the Queen always (seen over the wall), a dance out through the gate when it opens */
  if (!GD.bees) { GD.bees = []; for (let k = 0; k < 7; k++) { const b = new T.Mesh(new T.SphereGeometry(0.05, 6, 5), new T.MeshBasicMaterial({ color: k % 2 ? '#ffd75a' : '#3a2c1c' })); sc.add(b); GD.bees.push(b); } }
  if (GD.open) GD.open += dt; const out = GD.open && GD.open < 6 ? Math.sin(Math.min(1, GD.open / 6) * Math.PI) : 0;
  GD.bees.forEach((b, k) => { const a = time * (1.3 + k * 0.17) + k * 0.9, r = 0.7 + 0.3 * Math.sin(time * 0.7 + k) + out * (3 + k * 0.5); b.position.set(GARDEN.hive[0] + Math.cos(a) * r + out * 3.5, 1.3 + Math.sin(time * 2.1 + k) * 0.35 + out * 0.6, GARDEN.hive[1] + Math.sin(a) * r * 0.8); b.visible = !inCave && !reduced; });
}
