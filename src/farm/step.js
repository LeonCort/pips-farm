  skyStep(dt);
  /* animals: wander in the pen, get hungry or thirsty, come to the trough and wait */
  animals.forEach((an) => {
    if (an.ridden) { an.g.position.set(pip.position.x, 0, pip.position.z); an.g.rotation.y = pip.rotation.y; an.body.position.y = reduced ? 0 : Math.abs(Math.sin(time * 10)) * 0.06; zzz(an, false, dt); return; }
    if (barnAnimal(an, dt)) return;
    /* at night every animal walks to its house and sleeps; nobody gets hungry while asleep */
    if (isNight) {
      if (an.want) { an.want = null; an.sp.visible = false; }
      if (an.cd < 3) an.cd = 3 + Math.random() * 6;
      const s = sleepSpot(an), moving = !walkTo(an.g, s[0], s[1], dt, 1.2);
      an.asleep = !moving; if (!moving) an.g.rotation.y += (0 - an.g.rotation.y) * Math.min(1, dt * 3);
      if (an.hop > 0) an.hop = Math.max(0, an.hop - dt * 2.2);
      an.body.position.y = Math.sin(an.hop * Math.PI) * 0.3; zzz(an, an.asleep, dt); an.tx = an.g.position.x; an.tz = an.g.position.z; return;
    }
    if (an.asleep || an.lie > 0.01) { an.asleep = false; zzz(an, false, dt); }
    if (!an.want) { an.cd -= dt; if (an.cd <= 0) { const opts = DIET[an.a].filter(available); an.want = opts[Math.floor(Math.random() * opts.length)]; an.sp.material.map = bubble(an.want); an.sp.visible = true; an.wait = 0; Snd.play('blip', { gain: 0.15, f: 520 }, 0, 400); } }
    const p = penBox(an.a);
    if (an.want) { an.wait += dt; /* wait at the spot of the food it wants, side by side if several want the same */
      const q = stockAt(an.pen, an.want), same = animals.filter((o) => o.a === an.a && o.want === an.want), k = Math.max(0, same.indexOf(an)), sx = penSide(an.a);
      an.tx = an.pen.trough[0] - sx * ((an.a === 'horse' || an.a === 'cow' || an.a === 'bull' ? 0.4 : 0.12) + Math.floor(k / 2) * 0.45); an.tz = PEN[an.a].z + q[1] + (k % 2 ? 0.22 : -0.22) * (k ? 1 : 0); }
    else if (Math.hypot(an.g.position.x - an.tx, an.g.position.z - an.tz) < 0.1 && Math.random() < dt * 0.4) { an.tx = p.x + (Math.random() - 0.5) * (p.w - 1.2); an.tz = p.z + (Math.random() - 0.5) * (p.d - 1.0); }
    const away = Math.abs(an.g.position.x - p.x) > p.w / 2 || Math.abs(an.g.position.z - p.z) > p.d / 2;
    const moving = !walkTo(an.g, an.tx, an.tz, dt, away ? 2.0 : an.a === 'hen' ? 0.8 : 0.6);
    /* a hungry animal at the box eats by itself if its food is there */
    if (an.want && !moving && an.incoming <= 0 && an.pen.food.count(an.want)) { const m = an.pen.food.take(an.want); an.incoming++; fly(m, () => an.g.localToWorld(tmpV.set(0, an.h * 0.55, 0.25)), () => feed(an, m), 0.35); }
    if (!moving && an.want) an.g.rotation.y += (Math.atan2(penSide(an.a), 0) - an.g.rotation.y) * Math.min(1, dt * 4);
    if (an.hop > 0) an.hop = Math.max(0, an.hop - dt * 2.2);
    const bob = reduced ? 0 : moving ? Math.abs(Math.sin(time * 9 + an.tx)) * 0.04 : 0;
    an.body.position.y = Math.sin(an.hop * Math.PI) * 0.35 + bob; an.body.rotation.z = an.hop > 0 && !reduced ? Math.sin(an.hop * 12) * 0.12 : 0;
    if (an.want) an.sp.position.y = an.h + 0.35 + (reduced ? 0 : Math.sin(time * 3 + an.tx) * 0.05);
  });

  /* safety net: anything left sitting on Pip's back that is no longer in the basket is cleared away */
  carry.swT = (carry.swT || 0) - dt; if (carry.swT <= 0) { carry.swT = 0.5; for (let i = pip.children.length - 1; i >= 0; i--) { const o = pip.children[i]; if (o.userData && o.userData.type && carry.items.indexOf(o) < 0) pip.remove(o); } }
  /* Pip takes food from a source, and feeds animals that want what Pip carries (one item at a time) */
  xferT -= dt;
  if (xferT <= 0) {
    let did = false;
    for (const t in sources) { const s = sources[t]; if (!near(s.x, s.z, 0.95) || pickHeld()) continue;
      if (carry.items.length < cap()) { const m = mk(t); m.position.set(SRC[t].x, 0.6, SRC[t].z); sc.add(m); fly(m, () => { carry.parent.updateMatrixWorld(); return pip.localToWorld(tmpV.set(0, 0.72 + carry.items.reduce((a, b) => a + ITEM_H[b.userData.type], 0), -0.32)); }, () => carry.add(m)); Snd.play('pop', { gain: 0.45, f: 500 + carry.items.length * 60 }); did = true; }
      else { /* basket full: put back something no box has room for */ const spare = carry.items.find((m) => SRC[m.userData.type] && m.userData.type !== t && !Object.keys(pens).some((a) => DIET[a].includes(m.userData.type) && boxCount(pens[a], m.userData.type) < BOX_MAX)) || carry.items.find((m) => SRC[m.userData.type] && m.userData.type !== t && !animals.some((an) => an.want === m.userData.type)); if (spare && spare.userData.type !== t) { carry.items.splice(carry.items.indexOf(spare), 1); carry.place(); /* take this very item: take(type) would pull a different one of the same kind and leave it stuck on Pip's back */ fly(spare, () => tmpV.set(SRC[spare.userData.type].x, 0.5, SRC[spare.userData.type].z), () => sc.remove(spare)); did = true; } }
      break; }
    /* at a pen, everything its animals eat goes into the feed box */
    if (!did) for (const a in pens) { const f = feedPos(a), pen = pens[a]; if (!near(f[0], f[1], 1.0)) continue;
      const m = carry.items.slice().reverse().find((q) => DIET[a].includes(q.userData.type) && boxCount(pen, q.userData.type) < BOX_MAX);
      if (m) { carry.take(m.userData.type); boxIn(pen, m, 0.3); Snd.play('tick', { gain: 0.45, f: 900 }); did = true; }
      break; }
    if (did) xferT = 0.12;
  }
  helpers.forEach((h) => runHelper(h, dt));
