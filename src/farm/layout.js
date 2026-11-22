/* ---------- the garden's water hole: once the kitchen garden is unlocked, a small pond with a stone rim, reeds and a bucket
   appears just east of its fence, so Pip can fetch water for the beds without walking back to the farm well ---------- */
const GWELL = { x: 13.45, z: -6.35 }, GW_PICK = { x: 14.55, z: -5.45 }; /* on the east bank: the apple stall moved west for the wool stall, and its robot now stands where the old ring was */
const gwell = (() => {
  const g = new T.Group(); g.position.set(GWELL.x, 0, GWELL.z); sc.add(g);
  /* a soft muddy bank, then a ring of round stones */
  const bank = new T.Mesh(new T.CircleGeometry(1.0, 22), new T.MeshStandardMaterial({ color: '#8a6a4a', roughness: 1 })); bank.rotation.x = -Math.PI / 2; bank.position.y = 0.02; bank.scale.set(1.15, 0.9, 1); bank.receiveShadow = true; g.add(bank);
  for (let k = 0; k < 13; k++) { const a = k / 13 * Math.PI * 2 + hash(k, 951) * 0.2, r = 0.86 + hash(k, 952) * 0.06, s = 0.13 + hash(k, 953) * 0.08;
    const geo = ico(s, 0, 960 + k, 0.02); geo.scale(1.2, 0.7, 1); part(fac(geo, k % 3 ? '#b9b0a4' : '#a39a8e', 960 + k), g, Math.cos(a) * r * 1.15, s * 0.45, Math.sin(a) * r * 0.9); }
  const water = new T.Mesh(new T.CircleGeometry(0.8, 22), new T.MeshStandardMaterial({ color: PAL.sea, roughness: 0.2, metalness: 0 })); water.rotation.x = -Math.PI / 2; water.position.y = 0.06; water.scale.set(1.15, 0.9, 1); water.receiveShadow = true; g.add(water);
  const shine = new T.Mesh(new T.RingGeometry(0.2, 0.26, 16), new T.MeshBasicMaterial({ color: '#d9f1f4', transparent: true, opacity: 0.5 })); shine.rotation.x = -Math.PI / 2; shine.position.set(-0.25, 0.07, -0.1); g.add(shine);
  /* a lily pad with a flower, and reeds at the back */
  const lily = new T.CircleGeometry(0.16, 9, 0.3, 5.8); lily.rotateX(-Math.PI / 2); part(fac(lily, '#5d8a4a', 970), g, 0.35, 0.075, -0.2);
  part(fac(ico(0.05, 0, 971), '#f6b8c8', 971), g, 0.38, 0.11, -0.22, true);
  for (let k = 0; k < 7; k++) { const h = 0.45 + hash(k, 972) * 0.3, c = new T.ConeGeometry(0.03, h, 4); c.translate(0, h / 2, 0); c.rotateZ((hash(k, 973) - 0.5) * 0.35); part(fac(c, k % 2 ? '#6f9a4e' : '#5d8a4a', 974 + k), g, 0.55 + (k % 3) * 0.14, 0, -0.62 + Math.floor(k / 3) * 0.12); if (k % 3 === 0) { const t = new T.CylinderGeometry(0.035, 0.035, 0.12, 6); part(fac(t, '#7a5534', 981), g, 0.55 + (k % 3) * 0.14, h - 0.02, -0.62 + Math.floor(k / 3) * 0.12); } }
  /* a little wooden bucket on the near bank */
  const b = new T.CylinderGeometry(0.16, 0.13, 0.26, 10); b.translate(0, 0.13, 0); part(fac(jit(b, 0.006, 3), '#a77a4e', 982), g, -0.72, 0, 0.5);
  const bw = new T.CircleGeometry(0.14, 10); bw.rotateX(-Math.PI / 2); part(fac(bw, PAL.seaShallow, 983), g, -0.72, 0.22, 0.5);
  const hd = new T.TorusGeometry(0.15, 0.012, 4, 10, Math.PI); part(fac(hd, '#5e3f2a', 984), g, -0.72, 0.26, 0.5);
  g.traverse((m) => { if (m.isMesh) { m.castShadow = m !== bank && m !== water && m !== shine; } });
  const rg = ring(GW_PICK.x, GW_PICK.z, 0.75);
  g.visible = rg.visible = false;
  return { g, rg, water, shine, on: false, seen: false, t: 0 };
})();
function gwellStep(dt) {
  const on = !state ? false : typeof gardenOn === 'function' ? gardenOn() : true;
  if (on !== gwell.on) { gwell.on = on; gwell.g.visible = gwell.rg.visible = on; if (on) { solid(GWELL.x, GWELL.z, 0.95); if (gwell.seen && typeof confetti === 'function') confetti(GWELL.x, 1.0, GWELL.z, 30, 3); } }
  gwell.seen = true;
  if (!on) return;
  if (!reduced) { const s = 1 + Math.sin(time * 1.3) * 0.12; gwell.shine.scale.set(s, s, 1); }
  /* Pip fills the basket with water here, one bucket at a time, just like at the farm well */
  gwell.t -= dt; if (gwell.t > 0 || inHouse || mount) return;
  if (Math.hypot(pip.position.x - GW_PICK.x, pip.position.z - GW_PICK.z) > 0.95 || (typeof pickHeld === 'function' && pickHeld())) return;
  if (carry.items.length >= cap()) return;
  const m = mk('water'); m.position.set(GWELL.x - 0.72, 0.4, GWELL.z + 0.5); sc.add(m);
  fly(m, () => { carry.parent.updateMatrixWorld(); return pip.localToWorld(tmpV.set(0, 0.72 + carry.items.reduce((a, b) => a + ITEM_H[b.userData.type], 0), -0.32)); }, () => carry.add(m));
  Snd.play('pop', { gain: 0.45, f: 500 + carry.items.length * 60 }); gwell.t = 0.12;
}
{ const s0 = storeStep; storeStep = function (dt) { s0(dt); gwellStep(dt); }; }
