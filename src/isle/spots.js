/* ---------- upgrade spots (Leon, 2026-11-25: "place the things you can buy throughout the settlement") ----------
   Everything in the hammer menu also has its own place in the camp, so a child can see what can be made better and where:
   a rope ring by the tent, one by the campfire, one by the kennel, and one for the gear (torch, coat, boots) once Pip has
   met something that needs it. Over each ring floats a bubble with the picture of the next level; when the counters hold
   enough it bounces and wears a green hammer. Standing in the ring opens that card alone. A spot goes away when there
   is nothing left to buy there. (The smith's anvil and the baker's oven already work this way.) */
const SPT = { list: [], t: 0, tex: {} };
function spotNear(x, z, r) { return Object.keys(SPOT_AT).some((k) => Math.hypot(SPOT_AT[k][0] - x, SPOT_AT[k][1] - z) < r * 0.6); }
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
function spotInit() {
  if (SPT.list.length || SHOW) return;
  Object.keys(SPOT_AT).forEach((id) => { const [x, z] = SPOT_AT[id], ring = ropeRing(0.42, 0.56); ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.035, z); sc.add(ring);
    const sp = isleSprite(null, 0.9); sp.position.set(x, 1.5, z); sc.add(sp); lookFoot(x, z, 0.7, 0.7);
    SPT.list.push({ id, x, z, ring, sp, keys: [], k: null, can: false, in: false, still: 0 }); });
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
