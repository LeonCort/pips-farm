/* ---------- the penguin enclosure: the zoo's first animals ----------
   An oval yard of snow and ice with a pool, behind a low fence. Penguins waddle about, swim, and now and then
   want a fish (a picture bubble). Pip fetches fish from the bucket by the path and brings them to the fence;
   the hungry penguin catches it, hops, and gives a heart. No reading needed: the arrow shows where to go. */
const ENC = { x: 12.2, z: -4.6, rx: 3.0, rz: 2.3 }; /* the fence oval */
const POOL = { x: ENC.x - 0.9, z: ENC.z + 0.35, rx: 1.45, rz: 1.05 };
const BUCKET = { x: 8.9, z: -1.75 };
const FEED = { x: ENC.x - 0.6, z: ENC.z + ENC.rz + 0.55 }; /* where Pip stands to hand over fish: the front of the fence */
const FISH = [{ id: 'sill', c: '#c9d6dc', s: '#8a9ba6', f: '#d2483a', len: 0.36, w: 1 }]; /* the fish kinds (drawIcon draws them) */
PEN.penguin = { x: ENC.x, z: ENC.z, w: ENC.rx * 2, d: ENC.rz * 2 }; /* no grass grows in the yard */
const encE = (x, z, gx, gz) => Math.hypot((x - ENC.x) / (ENC.rx + (gx || 0)), (z - ENC.z) / (ENC.rz + (gz || 0)));
const inPool = (x, z) => Math.hypot((x - POOL.x) / POOL.rx, (z - POOL.z) / POOL.rz) < 1;
const penguins = [];
let poolWater = null;
const yardMat = MAT.clone(); /* the yard's snow: lit a little from within by day, so flat snow reads white and not grey */

/* the yard, fence, pool and bucket, merged into a few meshes */
(function buildEnclosure() {
  /* a flat oval split into rings, so the curved world can bend it like the ground underneath (one big fan would cut through the grass) */
  const L = [], disc = (rx, rz, segs, rings) => { const q = new T.RingGeometry(0.001, 1, segs, rings); q.scale(rx, rz, 1); q.rotateX(-Math.PI / 2); return q; };
  /* snowy floor, a little raised, with a blue-white tint toward the pool */
  let g = disc(ENC.rx - 0.05, ENC.rz - 0.05, 40, 8); g.translate(ENC.x, 0.06, ENC.z);
  merged([fac(g, (x, y, z) => tone(inPool(x, z) ? '#cfe6ee' : '#f4f6f8', vkey(x, y, z), 0.5), 701)], yardMat).castShadow = false;
  /* the pool rim: pale stones round the water */
  for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2, r = 0.13 + hash(i, 4) * 0.08; g = ico(r, 0, 720 + i); g.scale(1.3, 0.6, 1.1); g.translate(POOL.x + Math.cos(a) * (POOL.rx + 0.05), 0.08, POOL.z + Math.sin(a) * (POOL.rz + 0.05)); L.push(fac(g, tone('#d9e1e6', i, 0.6), 720 + i)); }
  /* ice rocks on the dry side, one big enough for a penguin to stand on */
  [[1.25, -0.7, 0.55, 0.42], [1.9, 0.35, 0.36, 0.3], [0.45, -1.45, 0.3, 0.24], [2.3, -0.9, 0.28, 0.5]].forEach(([dx, dz, r, h], i) => { g = ico(r, 1, 740 + i); g.scale(1.2, h / r, 1); g.translate(ENC.x + dx, h * 0.55, ENC.z + dz); L.push(fac(g, (x, y, z) => shadeY('#e8f2f6', y, 0, h * 1.2, vkey(x, y, z) + i, 0.5), 740 + i)); });
  /* the fence: posts and two rails all round */
  const N = 30, P = [];
  for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; P.push([ENC.x + Math.cos(a) * (ENC.rx + 0.12), ENC.z + Math.sin(a) * (ENC.rz + 0.12)]); }
  P.forEach(([x, z], i) => { g = new T.CylinderGeometry(0.06, 0.07, 0.62, 6); g.translate(x, 0.31, z); L.push(fac(jit(g, 0.008, 760 + i), tone('#a8774f', i, 0.8), 760 + i)); });
  P.forEach(([x, z], i) => { const [x1, z1] = P[(i + 1) % N], d = Math.hypot(x1 - x, z1 - z), ang = Math.atan2(x1 - x, z1 - z);
    [0.26, 0.5].forEach((y, k) => { g = new T.BoxGeometry(0.05, 0.07, d + 0.04); g.rotateY(ang); g.translate((x + x1) / 2, y, (z + z1) / 2); L.push(fac(g, tone('#c08a5c', i * 3 + k, 0.7), 790 + i)); }); });
  /* the fish bucket by the path: blue, with fish tails sticking out */
  g = new T.CylinderGeometry(0.3, 0.24, 0.42, 14, 1, true); g.translate(BUCKET.x, 0.21, BUCKET.z); L.push(fac(g, '#4f8fc0', 830));
  g = new T.CylinderGeometry(0.24, 0.24, 0.02, 14); g.translate(BUCKET.x, 0.02, BUCKET.z); L.push(fac(g, '#3d77a3', 831));
  g = new T.TorusGeometry(0.3, 0.03, 6, 18); g.rotateX(Math.PI / 2); g.translate(BUCKET.x, 0.42, BUCKET.z); L.push(fac(g, '#7fb3da', 832));
  [[-0.08, 0.05, 0.4], [0.1, -0.06, -0.5], [0.0, 0.1, 1.3]].forEach(([dx, dz, r], i) => { g = new T.ConeGeometry(0.07, 0.14, 4); g.rotateZ(Math.PI); g.rotateY(r); g.translate(BUCKET.x + dx, 0.5, BUCKET.z + dz); L.push(fac(g, '#d2483a', 840 + i)); });
  merged(L);
  /* the water: its own soft-blue, slightly see-through surface */
  g = disc(POOL.rx, POOL.rz, 32, 6);
  poolWater = new T.Mesh(g, new T.MeshStandardMaterial({ color: '#5fb8c8', roughness: 0.2, metalness: 0.05, transparent: true, opacity: 0.88 }));
  poolWater.position.set(POOL.x, 0.085, POOL.z); poolWater.receiveShadow = true; sc.add(poolWater);
  /* a ring on the ground at the bucket and at the front of the fence, so a child sees where to stand */
  [BUCKET, FEED].forEach((p) => { const r = new T.Mesh(new T.RingGeometry(0.5, 0.62, 28), ringMat); r.rotation.x = -Math.PI / 2; r.position.set(p.x, 0.035, p.z); sc.add(r); });
})();

/* one penguin: a round dark body with a white front, flippers, orange beak and feet */
function penguinModel(s) {
  const g = new T.Group(), body = new T.Group(); g.add(body);
  const dark = '#2f3a4a', white = '#fbf6ec', orange = '#f0a03a';
  let q = new T.SphereGeometry(0.22, 14, 10); q.scale(1, 1.35, 0.95); part(fac(q, (x, y, z) => shadeY(dark, y, -0.3, 0.3, 1, 0.3), 900), body, 0, 0.3, 0);
  q = new T.SphereGeometry(0.17, 14, 10); q.scale(1, 1.3, 0.6); part(fac(q, white, 901), body, 0, 0.27, 0.1);
  const head = new T.Group(); head.position.set(0, 0.58, 0.01); body.add(head);
  q = new T.SphereGeometry(0.15, 14, 10); part(fac(q, dark, 902), head, 0, 0, 0);
  [-1, 1].forEach((k) => { q = new T.SphereGeometry(0.06, 8, 6); q.scale(1, 1.2, 0.5); part(fac(q, white, 903), head, k * 0.065, 0.01, 0.115, true);
    const e = new T.Mesh(new T.SphereGeometry(0.022, 8, 6), ink); e.position.set(k * 0.06, 0.02, 0.14); head.add(e); });
  q = new T.ConeGeometry(0.04, 0.12, 6); q.rotateX(Math.PI / 2); part(fac(q, orange, 904), head, 0, -0.03, 0.18, true);
  const flips = [-1, 1].map((k) => { const f = new T.Group(); f.position.set(k * 0.2, 0.42, 0); body.add(f); q = new T.SphereGeometry(0.06, 8, 6); q.scale(0.35, 1.9, 0.9); part(fac(q, dark, 905), f, 0, -0.1, 0, true); f.rotation.z = k * 0.25; return f; });
  [-1, 1].forEach((k) => { q = new T.BoxGeometry(0.09, 0.03, 0.13); part(fac(q, orange, 906), body, k * 0.08, 0.015, 0.05, true); });
  g.scale.setScalar(s);
  const sp = new T.Sprite(new T.SpriteMaterial({ map: bubble('fish:sill'), depthTest: true, transparent: true })); sp.scale.set(0.58, 0.58, 1); sp.visible = false; g.add(sp);
  return { g, body, head, flips, sp };
}
function zooSpot() { /* a random spot in the yard: the pool or the dry side */
  for (let k = 0; k < 20; k++) { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.82, x = ENC.x + Math.cos(a) * ENC.rx * r, z = ENC.z + Math.sin(a) * ENC.rz * r; if (k > 15 || Math.random() < 0.35 || !inPool(x, z)) return [x, z]; }
  return [ENC.x, ENC.z];
}
function zooInit() {
  if (penguins.length) return;
  pip.position.set(7.6, 0, 0.9); target.copy(pip.position); camFocus.copy(pip.position); /* start on the path by the penguins */
  [1.3, 1.22, 1.12, 0.85].forEach((s, i) => { const m = penguinModel(s), p = zooSpot(); m.g.position.set(p[0], 0.06, p[1]); m.g.rotation.y = Math.random() * 6; sc.add(m.g);
    penguins.push(Object.assign(m, { s, tx: p[0], tz: p[1], want: false, cd: 8 + i * 9 + Math.random() * 6, wait: 0, hop: 0, coming: 0, ph: Math.random() * 6 })); });
  animals.push(...penguins.map((p) => ({ g: p.g, a: 'penguin' })));
}
const zooFish = () => { const m = new T.Group(); let q = new T.SphereGeometry(0.1, 10, 6); q.scale(1.6, 0.7, 0.6); part(fac(q, (x, y) => y > 0 ? '#8a9ba6' : '#c9d6dc', 950), m, 0, 0, 0, true);
  q = new T.ConeGeometry(0.06, 0.1, 4); q.rotateZ(Math.PI / 2); part(fac(q, '#d2483a', 951), m, 0.2, 0, 0, true); m.userData.type = 'fish'; return m; };
let zooT = 0;
function zooStep(dt, near) {
  const px = pip.position.x, pz = pip.position.z;
  /* Pip walks round the fence, not through it */
  const e = encE(px, pz, 0.35, 0.35); if (e < 1) { const a = Math.atan2((pz - ENC.z) / (ENC.rz + 0.35), (px - ENC.x) / (ENC.rx + 0.35)); pip.position.x = ENC.x + Math.cos(a) * (ENC.rx + 0.351); pip.position.z = ENC.z + Math.sin(a) * (ENC.rz + 0.351); }
  if (encE(target.x, target.z, 0.35, 0.35) < 1) { const a = Math.atan2((target.z - ENC.z) / (ENC.rz + 0.35), (target.x - ENC.x) / (ENC.rx + 0.35)); target.x = ENC.x + Math.cos(a) * (ENC.rx + 0.36); target.z = ENC.z + Math.sin(a) * (ENC.rz + 0.36); }
  yardMat.emissive.setScalar(0.3 * (1 - nightAmt));
  if (poolWater) poolWater.material.color.setHSL(0.53, 0.45, 0.55 + (reduced ? 0 : Math.sin(time * 1.3) * 0.02));
  /* fish from the bucket, one at a time, while the basket has room */
  zooT -= dt;
  if (zooT <= 0 && near(BUCKET.x, BUCKET.z, 0.9) && carry.items.length < cap()) { zooT = 0.18; const m = zooFish(); m.position.set(BUCKET.x, 0.5, BUCKET.z); sc.add(m);
    fly(m, () => { carry.parent.updateMatrixWorld(); return pip.localToWorld(tmpV.set(0, 0.72 + carry.items.reduce((a, b) => a + ITEM_H[b.userData.type], 0), -0.32)); }, () => carry.add(m)); Snd.play('pop', { gain: 0.45, f: 520 + carry.items.length * 60 }); }
  /* at the fence, a hungry penguin gets the next fish */
  if (zooT <= 0 && encE(px, pz, 1.0, 1.0) < 1 && carry.count('fish')) { const p = penguins.find((q) => q.want && !q.coming);
    if (p) { zooT = 0.3; p.coming = 1; const m = carry.take('fish'); fly(m, () => p.g.localToWorld(tmpV.set(0, 0.55, 0.2)), () => { sc.remove(m); zooFed(p); }, 0.45); Snd.play('tick', { gain: 0.45, f: 900 }); } }
  penguins.forEach((p, i) => {
    /* hunger: a fish bubble now and then; a hungry penguin waits at the front of the fence */
    if (!p.want) { p.cd -= dt; if (p.cd <= 0) { p.want = true; p.sp.visible = true; p.wait = 0; Snd.play('blip', { gain: 0.15, f: 760 }, 0, 400); const k = penguins.filter((q) => q.want).length - 1; p.tx = FEED.x - 0.7 + k * 0.45; p.tz = ENC.z + ENC.rz - 0.45; } }
    else p.wait += dt;
    if (!p.want && Math.hypot(p.g.position.x - p.tx, p.g.position.z - p.tz) < 0.08 && Math.random() < dt * 0.35) { const s = zooSpot(); p.tx = s[0]; p.tz = s[1]; }
    const swim = inPool(p.g.position.x, p.g.position.z), moving = !walkTo(p.g, p.tx, p.tz, dt, swim ? 1.3 : 0.55);
    if (p.hop > 0) p.hop = Math.max(0, p.hop - dt * 2.2);
    const w = reduced ? 0 : time * 9 + p.ph;
    p.body.position.y = swim ? -0.2 * p.s : Math.sin(p.hop * Math.PI) * 0.35;
    p.body.rotation.x = swim && moving ? 0.9 : 0; p.body.rotation.z = !swim && moving && !reduced ? Math.sin(w) * 0.14 : 0;
    p.flips.forEach((f, k) => { f.rotation.z = (k ? 1 : -1) * (0.25 + (p.hop > 0 || (p.want && !moving) ? Math.abs(Math.sin(w * 1.4)) * 0.6 : swim ? Math.abs(Math.sin(w * 0.6)) * 0.5 : 0)); });
    if (!moving && p.want) p.g.rotation.y += (0 - p.g.rotation.y) * Math.min(1, dt * 4); /* face Pip's side of the fence */
    p.sp.position.y = 1.05 + (reduced ? 0 : Math.sin(time * 3 + i) * 0.05);
    if (swim && moving && Math.random() < dt * 1.5) splash(p.g.position.x, 0.1, p.g.position.z, 3);
  });
}
function zooFed(p) {
  p.want = false; p.coming = 0; p.sp.visible = false; p.hop = 1; p.cd = 14 + Math.random() * 16;
  const s = zooSpot(); p.tx = s[0]; p.tz = s[1];
  Snd.play('sparkle', { gain: 0.35 }); burst(p.g.position.x, 1.0, p.g.position.z, 6);
  earn(1); coinToHud(p.g.position.x, 1.0, p.g.position.z, 1); state.zoo.fed = (state.zoo.fed || 0) + 1;
}
/* the guide arrow: to the bucket for fish, then to the fence, while a penguin is hungry */
function zooGoal() {
  if (!penguins.some((p) => p.want)) return null;
  return carry.count('fish') ? [FEED.x, FEED.z] : [BUCKET.x, BUCKET.z];
}
function zooTest() { return { penguins: penguins.map((p) => (p.want ? 'H' : '-') + (inPool(p.g.position.x, p.g.position.z) ? 'swim' : 'land')).join(' '), fed: state.zoo.fed, hungry: () => penguins.forEach((p) => { p.cd = 0; }) }; }
