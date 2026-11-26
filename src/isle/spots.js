/* ---------- upgrade spots (Leon, 2026-11-25: "place the things you can buy throughout the settlement") ----------
   Everything in the hammer menu also has its own place in the camp, so a child can see what can be made better and where:
   a rope ring by the tent, one by the campfire, one by the kennel, and one for the gear (torch, coat, boots) once Pip has
   met something that needs it. Over each ring floats a bubble with the picture of the next level; when the counters hold
   enough it bounces and wears a green hammer. Standing in the ring opens that card alone. A spot goes away when there
   is nothing left to buy there. (The smith's anvil and the baker's oven already work this way.) */
const SPT = { list: [], t: 0, tex: {} };
function spotNear(x, z, r) { if (Math.hypot(SPOT_AT.gear[0] - 0.75 - x, SPOT_AT.gear[1] - 0.75 - z) < r * 0.6 + 0.5) return true; return Object.keys(SPOT_AT).some((k) => Math.hypot(SPOT_AT[k][0] - x, SPOT_AT[k][1] - z) < r * 0.6); }
function spotKeys(id) { return id === 'gear' ? Object.keys(GEAR).filter((k) => !gearHas(k) && state.isle.seen && state.isle.seen[k]) : (bldLv(id) < BLD[id].max ? [id] : []); }
function spotTex(pic, can) {
  const key = pic + (can ? '!' : ''); if (SPT.tex[key]) return SPT.tex[key];
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.beginPath(); x.arc(64, 60, 50, 0, 7); x.fillStyle = can ? '#f3ffe6' : '#fff6e4'; x.fill(); x.lineWidth = can ? 7 : 5; x.strokeStyle = can ? '#4f8a3a' : '#6e4426'; x.stroke();
  x.beginPath(); x.moveTo(52, 106); x.lineTo(64, 122); x.lineTo(76, 106); x.fillStyle = can ? '#f3ffe6' : '#fff6e4'; x.fill();
  isleIcon(x, pic, 64, 60, 1.6);
  x.beginPath(); x.arc(100, 96, 22, 0, 7); x.fillStyle = can ? '#74c05a' : '#d8cdb5'; x.fill(); x.lineWidth = 4; x.strokeStyle = can ? '#3f6a30' : '#8a7a62'; x.stroke(); isleIcon(x, 'hammer', 100, 96, 0.62);
  return (SPT.tex[key] = new T.CanvasTexture(c));
}
/* the gear bench: a little workbench with a peg board, so the place is there to be seen before there is anything to make */
function spotBench(x, z) {
  const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = 0.5; sc.add(g); const L = []; let q;
  q = new T.BoxGeometry(1.1, 0.08, 0.5); q.translate(0, 0.52, 0); L.push(fac(q, (cx, cy, cz, i) => tone('#c0935f', i, 0.3), 3300));
  [[-0.48, -0.19], [0.48, -0.19], [-0.48, 0.19], [0.48, 0.19]].forEach(([px, pz], k) => { q = new T.BoxGeometry(0.08, 0.5, 0.08); q.translate(px, 0.25, pz); L.push(fac(q, () => new T.Color('#8a5f3c'), 3301 + k)); });
  [-0.5, 0.5].forEach((px, k) => { q = new T.BoxGeometry(0.08, 1.35, 0.08); q.translate(px, 0.68, -0.26); L.push(fac(q, () => new T.Color('#7a5230'), 3306 + k)); });
  q = new T.BoxGeometry(1.12, 0.6, 0.05); q.translate(0, 1.02, -0.26); L.push(fac(q, (cx, cy, cz, i) => tone('#d9b98a', i, 0.25), 3309));
  q = new T.BoxGeometry(1.3, 0.07, 0.3); q.rotateX(0.5); q.translate(0, 1.4, -0.18); L.push(fac(q, (cx, cy, cz, i) => tone('#b5562f', i, 0.3), 3310)); /* a little roof */
  [-0.34, 0, 0.34].forEach((px, k) => { q = new T.CylinderGeometry(0.025, 0.025, 0.12, 5); q.rotateX(Math.PI / 2); q.translate(px, 1.16, -0.2); L.push(fac(q, () => new T.Color('#4a4f57'), 3311 + k)); });
  q = new T.BoxGeometry(0.26, 0.34, 0.06); q.translate(-0.34, 0.96, -0.2); L.push(fac(q, () => new T.Color('#f5c22e'), 3315)); /* a yellow coat on its peg */
  q = new T.TorusGeometry(0.1, 0.03, 5, 10); q.translate(0.34, 1.03, -0.2); L.push(fac(q, () => new T.Color('#e0bf86'), 3316)); /* a coil of rope */
  q = new T.BoxGeometry(0.22, 0.14, 0.22); q.translate(0.25, 0.63, 0.02); L.push(fac(q, () => new T.Color('#8a5f3c'), 3317));
  q = new T.CylinderGeometry(0.03, 0.03, 0.34, 6); q.rotateZ(1.2); q.translate(-0.2, 0.6, 0.06); L.push(fac(q, () => new T.Color('#a8774f'), 3318)); /* a hammer handle */
  merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g); lookFoot(x, z, 0.9, 0.6);
}
function spotInit() {
  if (SPT.list.length || SHOW) return;
  Object.keys(SPOT_AT).forEach((id) => { const [x, z] = SPOT_AT[id], ring = ropeRing(0.42, 0.56); ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.035, z); sc.add(ring);
    const sp = isleSprite(null, 0.9); sp.position.set(x, 1.5, z); sc.add(sp); lookFoot(x, z, 0.7, 0.7);
    SPT.list.push({ id, x, z, ring, sp, keys: [], k: null, can: false, in: false, still: 0 }); });
  spotBench(SPOT_AT.gear[0] - 0.75, SPOT_AT.gear[1] - 0.75);
  spotSync();
}
function spotSync() {
  SPT.list.forEach((S) => { S.keys = spotKeys(S.id); const on = S.keys.length > 0; S.ring.visible = S.sp.visible = on; if (!on) return;
    S.k = S.keys.find(bldCan) || S.keys[0]; S.can = bldCan(S.k); const tex = spotTex(BLD[S.k].pic[bldLv(S.k) + 1], S.can); if (S.sp.material.map !== tex) { S.sp.material.map = tex; S.sp.material.needsUpdate = true; } });
}
function spotStep(dt) {
  if (!SPT.list.length) return; SPT.t -= dt; if (SPT.t <= 0) { SPT.t = 0.5; spotSync(); }
  const pp = pip.position, still = Math.hypot(target.x - pp.x, target.z - pp.z) < 0.2;
  SPT.list.forEach((S, i) => { if (!S.sp.visible) { S.in = false; return; }
    const hop = S.can && !reduced ? Math.abs(Math.sin(time * 3.2 + i)) * 0.16 : (reduced ? 0 : Math.sin(time * 2 + i) * 0.04); S.sp.position.y = 1.5 + hop; S.sp.scale.setScalar(S.can ? 1.0 : 0.82);
    const inR = Math.hypot(pp.x - S.x, pp.z - S.z) < 0.5; if (!inR) { S.in = false; S.still = 0; return; }
    S.still = still ? S.still + dt : 0; if (S.in || S.still < 0.25 || enSleep || rising || !BM.menu || !BM.menu.hidden) return;
    const xu = document.querySelector('.xpUp'); if (xu && !xu.hidden) return; /* a new star's card first */
    BM.keys = S.keys.slice(); bldFill(); BM.menu.hidden = false; S.in = true; Snd.play('pop', { gain: 0.3, f: 520 }); });
}
