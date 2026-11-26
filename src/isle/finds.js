/* ---------- special finds (Leon, 2026-11-25: "special finds for gear unlocking") ----------
   Four things that only turn up in one place each, and that a piece of gear or a tool level needs:
     honey   honeycomb on the meadow's bee stumps (by hand)          -> the torch
     copper  copper veins in the mine's west gallery (any pickaxe)   -> the copper tools (level 2)
     iron    iron veins on the stone island (copper pickaxe)         -> the iron tools (level 3)
     glow    star crystals in the mine's lift room (iron pickaxe)    -> the star tools (level 4)
   They are not counters and not carried: a find goes straight into the store as a small number, and shows only as a
   price on the card that needs it. Where they stand is set by hand, per area (rules.js: finds). They come back after sleeping. */
/* FINDS and FIND_NODE are in rules.js: pictures are drawn before this file is read */
const FD = { floats: [] };
Object.keys(FIND_NODE).forEach((k) => { const F = FIND_NODE[k], hand = k === 'hive';
  YIELD[k] = [F.t, F.n]; HITS[k] = hand ? 3 : 8; REGROW[k] = [1e9, 0]; LOW[k] = hand ? 0.02 : 0.35; NODE_R[k] = hand ? 0.4 : 0.55; TREASURE[k] = ['coin', 0];
  XP_FOR[k] = 6; HP_H[k] = hand ? 1.25 : 1.3; EN_COST[k] = 2; if (hand) HAND[k] = 1; else { NEED[k] = 'pick'; PICKY[k] = 1; } });

function findIcon(x, t) {
  const blob = (f) => { x.fillStyle = f; x.fill(); x.stroke(); };
  if (t === 'honey') { [[-9, -7], [9, -7], [0, 9]].forEach(([a, b], k) => { x.beginPath(); for (let q = 0; q < 6; q++) { const an = q / 6 * Math.PI * 2 + Math.PI / 6; x.lineTo(a + Math.cos(an) * 10.5, b + Math.sin(an) * 10.5); } x.closePath(); blob(k === 2 ? '#f2a13c' : '#f7c948'); });
    x.fillStyle = '#fff2b0'; x.beginPath(); x.arc(-12, -10, 2.6, 0, 7); x.fill(); }
  else if (t === 'copper' || t === 'iron') { const c = t === 'copper' ? ['#e0904f', '#f6c59a', '#b5622c'] : ['#8fa0b4', '#dfe7ef', '#5d6c7e'];
    x.beginPath(); x.moveTo(-18, 8); x.lineTo(-14, -8); x.lineTo(0, -15); x.lineTo(16, -8); x.lineTo(19, 8); x.lineTo(4, 15); x.closePath(); blob(c[0]);
    x.beginPath(); x.moveTo(-14, -8); x.lineTo(-2, 0); x.lineTo(16, -8); x.moveTo(-2, 0); x.lineTo(4, 15); x.lineWidth = 2; x.strokeStyle = c[2]; x.stroke();
    x.fillStyle = c[1]; x.beginPath(); x.moveTo(-8, -7); x.lineTo(0, -11); x.lineTo(4, -8); x.lineTo(-3, -4); x.closePath(); x.fill(); }
  else if (t === 'glow') { x.beginPath(); for (let q = 0; q < 8; q++) { const r = q % 2 ? 7 : 22, a = q / 8 * Math.PI * 2 - Math.PI / 2; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); blob('#ffe07a');
    x.beginPath(); x.moveTo(0, -22); x.lineTo(0, 22); x.moveTo(-22, 0); x.lineTo(22, 0); x.lineWidth = 1.6; x.strokeStyle = '#f2a13c'; x.stroke(); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(-3, -4, 3, 0, 7); x.fill(); }
}
/* ---- how they look ---- */
const findFlat = (L) => merged(L.map((q) => (q.index ? q.toNonIndexed() : q)), MAT, new T.Group()).geometry;
const FIND_GEO = {};
function findGeo(k) {
  if (FIND_GEO[k]) return FIND_GEO[k]; const L = []; let q;
  if (k === 'hive') { /* the honeycomb: a stack of golden six-sided cakes, dripping */
    [[0, 0.5, 0.2, 0.1], [0.03, 0.61, 0.23, 0.1], [-0.02, 0.72, 0.19, 0.1], [0.02, 0.82, 0.13, 0.08]].forEach(([x, y, r, h], i) => { q = new T.CylinderGeometry(r, r * 0.95, h, 6); q.rotateY(i * 0.5); q.translate(x, y, 0); L.push(fac(q, (cx, cy, cz, f) => tone(i % 2 ? '#f7c948' : '#f2a13c', f, 0.35), 2800 + i)); });
    [[0.17, 0.5], [-0.14, 0.58], [0.05, 0.47]].forEach(([x, y], i) => { q = ico(0.045, 1, 2810 + i); q.scale(1, 1.7, 1); q.translate(x, y, 0.14 - i * 0.12); L.push(fac(q, () => new T.Color('#ffd76a'), 2810 + i)); });
  } else if (k === 'hiveBase') { /* an old stump the bees moved into */
    q = new T.CylinderGeometry(0.27, 0.34, 0.46, 9); jit(q, 0.02, 2820); q.translate(0, 0.23, 0); L.push(fac(q, (cx, cy, cz, f) => (cy > 0.44 ? tone('#e7c48f', f, 0.3) : shadeY('#8a5f3c', cy, 0, 0.46, f, 0.5)), 2820));
    [0.9, 2.6, 4.4].forEach((a, i) => { q = ico(0.11, 0, 2822 + i); q.scale(1.5, 0.6, 1); q.translate(Math.cos(a) * 0.34, 0.05, Math.sin(a) * 0.34); L.push(fac(q, () => tone('#74a857', i, 0.5), 2822 + i)); });
  } else if (k === 'glow') { /* a star crystal: tall pale-gold spikes */
    [[0, 0, 0.78, 0, 0], [0.2, 0.08, 0.5, 0.45, 0.2], [-0.2, 0.04, 0.55, -0.4, -0.2], [0.02, -0.2, 0.42, 0.1, -0.5], [-0.08, 0.2, 0.36, -0.15, 0.5]].forEach(([x, z, h, rz, rx], i) => { q = new T.OctahedronGeometry(0.13, 0); q.scale(1, h / 0.13 * 0.5, 1); q.translate(0, h * 0.45, 0); q.rotateZ(rz); q.rotateX(rx); q.translate(x, 0, z);
      L.push(fac(q, (cx, cy, cz, f) => new T.Color(f % 3 === 0 ? '#ffffff' : i % 2 ? '#ffd76a' : '#fff3b0'), 2830 + i)); });
    q = ico(0.22, 0, 2836); q.scale(1.3, 0.5, 1.2); q.translate(0, 0.05, 0); L.push(fac(q, '#6a625a', 2836));
  } else { /* a vein: a dark rock shot through with metal, and nuggets sitting on it */
    const c = k === 'copper' ? ['#e8914a', '#f6b987'] : ['#a9c4e6', '#eef5fc'];
    q = ico(0.52, 1, 2840, 0.07); q.scale(1.15, 0.78, 1); q.translate(0, 0.3, 0); L.push(fac(q, (cx, cy, cz, f) => (f % 4 === 0 ? tone(c[0], f, 0.4) : shadeY('#474d57', cy, 0, 0.7, f, 0.5)), k === 'copper' ? 2840 : 2841));
    [[0.3, 0.52, 0.18], [-0.26, 0.56, -0.1], [0.02, 0.68, 0.02], [-0.36, 0.3, 0.3], [0.42, 0.26, -0.26], [0.1, 0.4, 0.44]].forEach(([x, y, z], i) => { q = ico(0.13 + (i % 3) * 0.03, 0, 2850 + i); q.translate(x, y, z); L.push(fac(q, (cx, cy, cz, f) => new T.Color(c[f % 2]), 2850 + i)); });
  }
  return (FIND_GEO[k] = findFlat(L));
}
let findGlowMat = null;
/* called by makeNode (isle.js) for the kinds above */
function findNode(n, g) {
  const k = n.kind;
  if (k === 'glow') { findGlowMat = findGlowMat || (() => { const m = crystalMat.clone(); m.emissive = new T.Color('#c9962a'); m.emissiveIntensity = 0.75; return m; })(); n.main = new T.Mesh(findGeo(k), findGlowMat); }
  else { n.main = new T.Mesh(findGeo(k), MAT); n.main.castShadow = true; n.main.receiveShadow = true; }
  n.full = k === 'hive' ? 1 : 0.95 + hash(n.seed, 4) * 0.2; n.main.scale.setScalar(n.full); g.add(n.main);
  if (k === 'hive') { const b = new T.Mesh(findGeo('hiveBase'), MAT); b.castShadow = true; b.receiveShadow = true; g.add(b); }
}
/* the find goes straight to the store, and a picture with its number floats up where it was */
function findGot(n) {
  const [t, c] = YIELD[n.kind]; state.isle.store[t] = (state.isle.store[t] || 0) + c; xpGain(XP_FOR[n.kind]);
  const sp = new T.Sprite(new T.SpriteMaterial({ map: hamGiftTex(t, c), transparent: true, depthWrite: false })); sp.scale.set(1.5, 0.75, 1); sp.position.set(n.x, n.g.position.y + 1.5, n.z); sc.add(sp); FD.floats.push({ sp, t: 0, y: n.g.position.y });
  Snd.play('sparkle', { gain: 0.45 }); burst(n.x, n.g.position.y + 1.0, n.z, 6); bldBadge(); save();
}
function findStep(dt) {
  for (let k = FD.floats.length - 1; k >= 0; k--) { const G = FD.floats[k]; G.t += dt;
    G.sp.position.y = G.y + 1.5 + Math.min(1, G.t / 0.5) * 0.7 + G.t * 0.12; G.sp.material.opacity = G.t > 1.4 ? Math.max(0, 1 - (G.t - 1.4) * 2.5) : 1;
    if (G.t > 1.8) { sc.remove(G.sp); G.sp.material.map.dispose(); FD.floats.splice(k, 1); } }
}
/* the finds an area holds, at fixed spots (rules.js) */
function findFill(A, fresh) { (A.finds || []).forEach(([k, dx, dz], q) => { const n = makeNode(k, A.cx + dx, A.cz + dz, AREAS.indexOf(A) * 997 + 900 + q); if (fresh) { n.pop = 0.001; n.g.scale.setScalar(0.01); } }); }
const findKeep = (a, x, z) => !!a.finds && a.finds.some((f) => Math.hypot(x - a.cx - f[1], z - a.cz - f[2]) < 1.5);
