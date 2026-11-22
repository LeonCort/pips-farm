  /* riding and driving: Pip sits on top, the mount follows Pip */
  if (mount && mount.kind === 'animal') pip.position.y = mount.an.h * (mount.an.a === 'horse' ? 0.45 : 0.42);
  else if (mount && mount.kind === 'tractor') { pip.position.y = 0.5; tractor.g.position.set(pip.position.x, 0, pip.position.z); tractor.g.rotation.y = pip.rotation.y; }
  /* mowing: Pip cuts the grass right underfoot, the tractor a wide strip */
  { const r = mount && mount.kind === 'tractor' ? 1.1 : 0.42, px = pip.position.x, pz = pip.position.z;
    if (px > MEADOW.x0 - 1.5 && px < MEADOW.x1 + 1.5 && pz > MEADOW.z0 - 1.5 && pz < MEADOW.z1 + 1.5) tufts.forEach((t) => { if (t.h > 0.8 && Math.hypot(t.x - px, t.z - pz) < r) cutTuft(t); }); }
  tufts.forEach((t) => { if (t.h < 1) { t.h = Math.min(1, t.h + dt / (season === 'winter' ? 150 : 50)); t.g.scale.y = t.h; } });
  /* pick up hay bales lying in the meadow */
  for (let i = loose.length - 1; i >= 0; i--) { const m = loose[i]; if (carry.items.length < cap() && !pickHeld() && near(m.position.x, m.position.z, mount ? 1.1 : 0.7)) { loose.splice(i, 1); fly(m, () => { carry.parent.updateMatrixWorld(); return pip.localToWorld(tmpV.set(0, 0.72 + carry.items.reduce((a, b) => a + ITEM_H[b.userData.type], 0), -0.32)); }, () => carry.add(m)); Snd.play('pop', { gain: 0.4, f: 600 }); break; } }
  actT -= dt; if (actT <= 0) { actT = 0.15; renderActs(); }
  familyStep(dt); extrasStep(dt);
