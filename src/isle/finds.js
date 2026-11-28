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
Object.keys(FIND_NODE).forEach((k) => { const F = FIND_NODE[k], hand = !!F.hand;
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
  else if (t === 'reed') { [[-10, 0.12], [0, -0.05], [10, -0.2]].forEach(([a, r]) => { x.save(); x.translate(a, 0); x.rotate(r); x.beginPath(); x.moveTo(0, 22); x.lineTo(0, -6); x.lineWidth = 6; x.strokeStyle = PAL.ink; x.stroke(); x.lineWidth = 3; x.strokeStyle = '#7fae4f'; x.stroke(); x.strokeStyle = PAL.ink;
      x.beginPath(); x.roundRect(-4.5, -22, 9, 18, 4.5); x.fillStyle = '#8a5a34'; x.fill(); x.stroke(); x.restore(); }); }
  else if (t === 'pearl') { x.beginPath(); x.moveTo(-22, 0); x.quadraticCurveTo(-18, 20, 0, 20); x.quadraticCurveTo(18, 20, 22, 0); x.closePath(); blob('#f3b8c8'); x.beginPath(); x.moveTo(-22, -2); x.quadraticCurveTo(-16, -22, 0, -20); x.quadraticCurveTo(16, -22, 22, -2); x.closePath(); blob('#f9d3dd');
    x.beginPath(); x.arc(0, 1, 9, 0, 7); blob('#ffffff'); x.fillStyle = '#dfe9f5'; x.beginPath(); x.arc(2, 3, 4, 0, 7); x.fill(); }
  else if (t === 'ember') { x.beginPath(); x.moveTo(-18, 10); x.lineTo(-15, -8); x.lineTo(-2, -16); x.lineTo(15, -9); x.lineTo(19, 9); x.lineTo(3, 16); x.closePath(); blob('#4a4038');
    x.beginPath(); x.moveTo(-10, 6); x.lineTo(-4, -4); x.lineTo(3, 3); x.lineTo(10, -6); x.lineWidth = 5; x.strokeStyle = '#ff8a3c'; x.stroke(); x.lineWidth = 2; x.strokeStyle = '#ffe07a'; x.stroke(); }
  else if (t === 'glow') { x.beginPath(); for (let q = 0; q < 8; q++) { const r = q % 2 ? 7 : 22, a = q / 8 * Math.PI * 2 - Math.PI / 2; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); blob('#ffe07a');
    x.beginPath(); x.moveTo(0, -22); x.lineTo(0, 22); x.moveTo(-22, 0); x.lineTo(22, 0); x.lineWidth = 1.6; x.strokeStyle = '#f2a13c'; x.stroke(); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(-3, -4, 3, 0, 7); x.fill(); }
}
/* ---- how they look ---- */
const findFlat = (L) => merged(L.map((q) => (q.index ? q.toNonIndexed() : q)), MAT, new T.Group()).geometry;
const FIND_GEO = {};
function findGeo(k) {
  if (FIND_GEO[k]) return FIND_GEO[k]; const L = []; let q;
  if (k.indexOf('frostflower') === 0) hollowFrostGeo(L, k); /* the winter island's frost flower (hollow.js) */
  else if (k === 'hive') { /* the honeycomb: a stack of golden six-sided cakes, dripping */
    [[0, 0.5, 0.2, 0.1], [0.03, 0.61, 0.23, 0.1], [-0.02, 0.72, 0.19, 0.1], [0.02, 0.82, 0.13, 0.08]].forEach(([x, y, r, h], i) => { q = new T.CylinderGeometry(r, r * 0.95, h, 6); q.rotateY(i * 0.5); q.translate(x, y, 0); L.push(fac(q, (cx, cy, cz, f) => tone(i % 2 ? '#f7c948' : '#f2a13c', f, 0.35), 2800 + i)); });
    [[0.17, 0.5], [-0.14, 0.58], [0.05, 0.47]].forEach(([x, y], i) => { q = ico(0.045, 1, 2810 + i); q.scale(1, 1.7, 1); q.translate(x, y, 0.14 - i * 0.12); L.push(fac(q, () => new T.Color('#ffd76a'), 2810 + i)); });
  } else if (k === 'hiveBase') { /* an old stump the bees moved into */
    q = new T.CylinderGeometry(0.27, 0.34, 0.46, 9); jit(q, 0.02, 2820); q.translate(0, 0.23, 0); L.push(fac(q, (cx, cy, cz, f) => (cy > 0.44 ? tone('#e7c48f', f, 0.3) : shadeY('#8a5f3c', cy, 0, 0.46, f, 0.5)), 2820));
    [0.9, 2.6, 4.4].forEach((a, i) => { q = ico(0.11, 0, 2822 + i); q.scale(1.5, 0.6, 1); q.translate(Math.cos(a) * 0.34, 0.05, Math.sin(a) * 0.34); L.push(fac(q, () => tone('#74a857', i, 0.5), 2822 + i)); });
  } else if (k === 'reeds') { /* cattails: tall stalks with brown heads, and long leaves */
    [[0, 0, 1.25, 0, 0], [0.16, 0.05, 1.05, 0.12, 0.05], [-0.15, 0.08, 1.12, -0.1, 0.06], [0.05, -0.16, 0.95, 0.03, -0.12], [-0.08, -0.12, 1.18, -0.05, -0.08], [0.2, -0.1, 0.88, 0.16, -0.06], [-0.22, -0.04, 0.92, -0.17, 0]].forEach(([x, z, h, rz, rx], i) => {
      q = new T.CylinderGeometry(0.016, 0.022, h, 5); q.translate(0, h / 2, 0); q.rotateZ(-rz); q.rotateX(rx); q.translate(x, 0, z); L.push(fac(q, (cx, cy, cz, f) => shadeY('#7fae4f', cy, 0, 1.2, f, 0.3), 2860 + i));
      q = new T.CylinderGeometry(0.05, 0.05, 0.24, 7); q.translate(0, h - 0.2, 0); q.rotateZ(-rz); q.rotateX(rx); q.translate(x, 0, z); L.push(fac(q, (cx, cy, cz, f) => tone('#8a5a34', f, 0.4), 2870 + i)); });
    [0.4, 1.7, 2.9, 4.1, 5.3].forEach((a, i) => { q = new T.ConeGeometry(0.05, 0.75, 3); q.scale(1, 1, 0.3); q.translate(0, 0.37, 0); q.rotateZ(0.45); q.rotateY(a); q.translate(Math.cos(a) * 0.1, 0, -Math.sin(a) * 0.1); L.push(fac(q, (cx, cy, cz, f) => shadeY('#5f9a45', cy, 0, 0.7, f, 0.4), 2880 + i)); });
  } else if (k === 'reedsBase') { /* the cut stubs left in the mud */
    [[0, 0], [0.16, 0.05], [-0.15, 0.08], [0.05, -0.16], [-0.08, -0.12]].forEach(([x, z], i) => { q = new T.CylinderGeometry(0.02, 0.024, 0.14, 5); q.translate(x, 0.07, z); L.push(fac(q, '#6f9a45', 2890 + i)); });
    q = ico(0.3, 1, 2896); q.scale(1.2, 0.12, 1.1); q.translate(0, 0.01, 0); L.push(fac(q, (cx, cy, cz, f) => tone('#6b5a3c', f, 0.4), 2896));
  } else if (k === 'clam') { /* the pearl, and the open lid of a big scallop standing up behind it */
    q = new T.CylinderGeometry(0.46, 0.46, 0.07, 14); q.scale(1, 1, 0.9); q.translate(0, 0, 0.41); q.rotateX(-2.05); q.translate(0, 0.2, -0.36); L.push(fac(q, (cx, cy, cz, f) => tone(f % 2 ? '#fbe1e8' : '#f3b8c8', f, 0.25), 2900));
    q = new T.SphereGeometry(0.16, 12, 9); q.translate(0, 0.33, 0.02); L.push(fac(q, (cx, cy, cz, f) => new T.Color(cy > 0.36 ? '#ffffff' : '#e3ecf7'), 2901));
  } else if (k === 'clamBase') { /* the lower shell, lying in the sand */
    q = new T.CylinderGeometry(0.47, 0.34, 0.2, 14); q.scale(1, 1, 0.9); q.translate(0, 0.1, 0); L.push(fac(q, (cx, cy, cz, f) => (cy > 0.19 ? new T.Color('#fbe6ec') : tone(f % 2 ? '#f3b8c8' : '#e79fb4', f, 0.3)), 2905));
  } else if (k === 'glow') { /* a star crystal: tall pale-gold spikes */
    [[0, 0, 0.78, 0, 0], [0.2, 0.08, 0.5, 0.45, 0.2], [-0.2, 0.04, 0.55, -0.4, -0.2], [0.02, -0.2, 0.42, 0.1, -0.5], [-0.08, 0.2, 0.36, -0.15, 0.5]].forEach(([x, z, h, rz, rx], i) => { q = new T.OctahedronGeometry(0.13, 0); q.scale(1, h / 0.13 * 0.5, 1); q.translate(0, h * 0.45, 0); q.rotateZ(rz); q.rotateX(rx); q.translate(x, 0, z);
      L.push(fac(q, (cx, cy, cz, f) => new T.Color(f % 3 === 0 ? '#ffffff' : i % 2 ? '#ffd76a' : '#fff3b0'), 2830 + i)); });
    q = ico(0.22, 0, 2836); q.scale(1.3, 0.5, 1.2); q.translate(0, 0.05, 0); L.push(fac(q, '#6a625a', 2836));
  } else { /* a vein: a dark rock shot through with metal, and nuggets sitting on it (the ember rock: with glowing cracks) */
    const c = k === 'copper' ? ['#e8914a', '#f6b987'] : k === 'cinder' ? ['#ff8a3c', '#ffd76a'] : ['#a9c4e6', '#eef5fc'];
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
  else { n.main = new T.Mesh(findGeo(k), k === 'frostflower' ? hollowFrostMat() : MAT); n.main.castShadow = true; n.main.receiveShadow = true; }
  n.full = k === 'reeds' ? 1.3 : FIND_NODE[k].hand ? 1 : 0.95 + hash(n.seed, 4) * 0.2; n.main.scale.setScalar(n.full); g.add(n.main);
  if (k === 'hive' || k === 'reeds' || k === 'clam' || k === 'frostflower') { const b = new T.Mesh(findGeo(k + 'Base'), MAT); b.castShadow = true; b.receiveShadow = true; g.add(b); }
}
/* the find goes straight to the store, and a picture with its number floats up where it was */
function findGot(n) {
  const t = YIELD[n.kind][0], c = hiveGives(n, YIELD[n.kind][1]); state.isle.store[t] = (state.isle.store[t] || 0) + c; xpGain(XP_FOR[n.kind]);
  const sp = new T.Sprite(new T.SpriteMaterial({ map: hamGiftTex(t, c), transparent: true, depthWrite: false })); sp.scale.set(1.5, 0.75, 1); sp.position.set(n.x, n.g.position.y + 1.5, n.z); sc.add(sp); FD.floats.push({ sp, t: 0, y: n.g.position.y });
  const F1 = state.isle.first || (state.isle.first = {}); if (!F1[t]) { F1[t] = 1; foundIt(t); } /* the first of each special find is held up */
  invDirty = true; Snd.play('sparkle', { gain: 0.45 }); burst(n.x, n.g.position.y + 1.0, n.z, 6); bldBadge(); save();
}
function findStep(dt) {
  for (let k = FD.floats.length - 1; k >= 0; k--) { const G = FD.floats[k]; G.t += dt;
    G.sp.position.y = G.y + 1.5 + Math.min(1, G.t / 0.5) * 0.7 + G.t * 0.12; G.sp.material.opacity = G.t > 1.4 ? Math.max(0, 1 - (G.t - 1.4) * 2.5) : 1;
    if (G.t > 1.8) { sc.remove(G.sp); G.sp.material.map.dispose(); FD.floats.splice(k, 1); } }
}
/* the finds an area holds, at fixed spots (rules.js) */
function findFill(A, fresh) { (A.finds || []).forEach(([k, dx, dz], q) => { const n = makeNode(k, A.cx + dx, A.cz + dz, AREAS.indexOf(A) * 997 + 900 + q); if (fresh) { n.pop = 0.001; n.g.scale.setScalar(0.01); } }); }
const findKeep = (a, x, z) => !!a.finds && a.finds.some((f) => Math.hypot(x - a.cx - f[1], z - a.cz - f[2]) < 1.5);
