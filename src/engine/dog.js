/* ---------- the pet dog and its kennel, and the sleeping z's (moved here from the farm's extras.js and family.js) ---------- */
/* a soft dark spot that lies under Pip, the pets and other things, so nothing floats on the grass (polish.js, pets.js) */
const blobTex = gradTex(64, 64, [[0, 255, 255, 255, 1], [0.5, 217, 217, 217, 0.85], [1, 0, 0, 0, 0]]); /* used as an alphaMap: the green channel is the alpha */
const blobMat = new T.MeshBasicMaterial({ color: '#1c2a20', alphaMap: blobTex, transparent: true, opacity: 0.7, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
const blobGeo = new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);

/* sleeping: a little "z z" floats over sleeping animals */
const zTex = (() => { const c = document.createElement('canvas'); c.width = 96; c.height = 64; const x = c.getContext('2d'); x.font = '700 30px Fredoka, sans-serif'; x.fillStyle = '#fff6e4'; x.strokeStyle = PAL.ink; x.lineWidth = 6; x.lineJoin = 'round'; [['z', 14, 52, 26], ['z', 40, 36, 32], ['Z', 64, 22, 38]].forEach(([t, px, py, s]) => { x.font = '700 ' + s + 'px Fredoka, sans-serif'; x.strokeText(t, px, py); x.fillText(t, px, py); }); return new T.CanvasTexture(c); })();
function zzz(an, on, dt) {
  if (on && !an.zs && !an.baby) { an.zs = new T.Sprite(new T.SpriteMaterial({ map: zTex, transparent: true, depthTest: false })); an.zs.renderOrder = 6; an.zs.scale.set(0.6, 0.4, 1); sc.add(an.zs); }
  if (an.zs) { an.zs.visible = on; if (on) { const p = an.g.position; an.zs.position.set(p.x + 0.25, an.h * (an.baby ? 1 : 0.85) + 0.25 + (reduced ? 0 : Math.sin(time * 1.5 + p.x) * 0.08), p.z); } }
  const lie = on ? 1 : 0; an.lie = (an.lie || 0) + (lie - (an.lie || 0)) * Math.min(1, dt * 3);
  an.body.scale.y = 1 - an.lie * 0.22; an.body.rotation.x = an.lie * 0.05;
}

/* ---------- the dog: follows Pip around, barks now and then, sleeps in its kennel at night ----------
   The game says where the kennel is (KENNEL), and with petPlace() where Pip is: inside with the pet ('home'),
   somewhere the pet cannot follow ('away'), and where the pet should wait then ('goal', [x, z, speed]). */
{
  const kWall = (hex, y, h, key) => { const c = tone(hex, key, 0.5), q = clamp(y / h, 0, 1); return c.multiplyScalar(0.8 + 0.28 * q); };
  const g = new T.Group(); g.position.set(KENNEL.x, 0, KENNEL.z); sc.add(g);
  if (typeof propKennel === 'function') propKennel(g); /* the island draws its own doghouse (isle/props.js) */
  else {
  let q = new T.BoxGeometry(1.0, 0.62, 0.9); q.translate(0, 0.31, 0); part(fac(jit(q, 0.015, 411), (cx, cy, cz, i) => kWall(PAL.accent, cy, 0.62, i)), g);
    [-1, 1].forEach((s) => { q = new T.BoxGeometry(0.66, 0.07, 1.04); q.translate(0, 0, 0); const m = part(fac(q, PAL.trunk, 412), g, s * 0.27, 0.8, 0); m.rotation.z = -s * 0.62; });
    q = new T.CircleGeometry(0.2, 12); const door = part(fac(q, PAL.ink, 413), g, 0, 0.26, 0.452); door.scale.y = 1.25;
    q = new T.CylinderGeometry(0.2, 0.2, 0.06, 12); part(fac(q, '#d8d0c0', 414), g, 0.42, 0.03, 0.72);
  }
}
let dog = (() => {
  /* a fluffy golden retriever: round soft shapes, floppy ears, a feathery tail and a red collar with a tag */
  const g = new T.Group(), body = new T.Group(); g.add(body); sc.add(g);
  const C = '#dba65c', D = '#b9783c', L = '#f3d39c', fur = (hex, lo, hi) => (cx, cy, cz, i) => shadeY(hex, cy, lo, hi, i, 0.5);
  let q = ico(0.2, 2, 401, 0.012); q.scale(0.92, 0.82, 1.45); part(fac(q, fur(C, -0.2, 0.2)), body, 0, 0.38, -0.02);
  q = ico(0.15, 2, 409, 0.012); q.scale(1, 1.05, 0.9); part(fac(q, fur(L, -0.15, 0.15)), body, 0, 0.42, 0.2);
  const head = new T.Group(); head.position.set(0, 0.6, 0.3); body.add(head);
  q = ico(0.165, 2, 402, 0.008); q.scale(1, 0.95, 1); part(fac(q, fur(C, -0.16, 0.16)), head, 0, 0, 0);
  q = ico(0.1, 2, 403, 0.004); q.scale(0.85, 0.65, 1); part(fac(q, L), head, 0, -0.045, 0.13);
  part(fac(ico(0.032, 1, 404, 0.002).scale(1.2, 0.85, 1), '#2a2220'), head, 0, -0.01, 0.225);
  [-1, 1].forEach((s) => {
    const e = new T.Mesh(new T.SphereGeometry(0.026, 10, 8), ink); e.position.set(s * 0.07, 0.035, 0.14); head.add(e);
    const hl = new T.Mesh(new T.SphereGeometry(0.009, 6, 4), new T.MeshBasicMaterial({ color: '#ffffff' })); hl.position.set(0.008, 0.01, 0.02); e.add(hl);
    q = ico(0.075, 1, 406 + s, 0.004); q.scale(0.45, 1.25, 0.85); const ear = part(fac(q, fur(D, -0.1, 0.1)), head, s * 0.15, -0.04, -0.02); ear.rotation.z = s * 0.28;
  });
  q = new T.TorusGeometry(0.135, 0.025, 6, 16); q.rotateX(Math.PI / 2); part(fac(q, '#d8423a'), head, 0, -0.13, -0.04); head.children[head.children.length - 1].rotation.x = 0.25;
  part(fac(new T.CylinderGeometry(0.03, 0.03, 0.012, 10).rotateX(Math.PI / 2), '#f2c14a'), head, 0, -0.2, 0.09);
  const tail = new T.Group(); tail.position.set(0, 0.46, -0.28); body.add(tail);
  for (let k = 0; k < 4; k++) { q = ico(0.055 - k * 0.006, 1, 408 + k, 0.006); q.scale(0.8, 0.8, 1.3); part(fac(q, fur(k > 1 ? L : C, -0.05, 0.05)), tail, 0, k * 0.035, -0.05 - k * 0.075); }
  tail.rotation.x = -0.55;
  const legs = [[-0.1, 0.17], [0.1, 0.17], [-0.1, -0.2], [0.1, -0.2]].map(([x, z]) => { const l = new T.Group(); l.position.set(x, 0.3, z); body.add(l); const b = new T.CylinderGeometry(0.045, 0.04, 0.27, 8); b.translate(0, -0.14, 0); part(fac(b, C), l); part(fac(ico(0.048, 1, 410).scale(1, 0.6, 1.3), L), l, 0, -0.28, 0.015); return l; });
  g.position.set(KENNEL.x - 0.6, 0, KENNEL.z + 0.9);
  return { g, body, head, tail, legs, h: 0.72, chase: false, wanderT: 0, tx: KENNEL.x, tz: KENNEL.z + 1, barkT: 12, hop: 0, petT: -99, away: false, asleep: false };
})();
function bark(gain) { dog.hop = 1; petVoice(dog.kind || 'dog', gain); }
function petDog() { const d = nearPet() || (state.pet === 'none' ? null : dog); if (d) petPet(d); }
function dogStep(dt) {
  if (state.pet === 'none') return; /* no pet chosen: the town strollers (pets.js) move every pet */
  const d = dog, p = d.g.position, pp = pip.position, pl = petPlace(d), home = pl.home, away = pl.away;
  if (home !== !!d.inH) { d.inH = home; PTRAIL.length = 0; d.chase = false; const q = pl.door(home); p.set(q[0], 0, q[1]); if (home) d.g.rotation.y = Math.PI; }
  let tx, tz, sp = 1.1;
  if (d.away && !away && !isNight) { d.chase = true; bark(0.5); }
  d.away = away;
  if (home) { [tx, tz] = petTrailGoal(0.95); sp = Math.max(2.6, speed() * 1.05); }
  else if (isNight) { tx = KENNEL.x; tz = KENNEL.z + 0.75; sp = 2.2; }
  else if (pl.goal) { [tx, tz, sp] = pl.goal; }
  else {
    const dd = Math.hypot(pp.x - p.x, pp.z - p.z);
    if (dd > 24) { p.set(pp.x - 1.2, 0, pp.z - 0.8); }
    if (dd > 1.9) d.chase = true;
    if (d.chase) {
      const a = pip.rotation.y; tx = pp.x - Math.sin(a) * 0.95 + Math.cos(a) * 0.55; tz = pp.z - Math.cos(a) * 0.95 - Math.sin(a) * 0.55; sp = Math.max(2.8, speed() * 1.08);
      if (dd < 1.2) { d.chase = false; d.wanderT = 1 + Math.random() * 2; d.tx = p.x; d.tz = p.z; }
    } else {
      d.wanderT -= dt; if (d.wanderT <= 0) { d.wanderT = 2.5 + Math.random() * 4; d.tx = clamp(pp.x + (Math.random() - 0.5) * 2.6, ISL.box.x0 + 1, ISL.box.x1 - 1); d.tz = clamp(pp.z + (Math.random() - 0.5) * 2.6, ISL.box.z0 + 1, ISL.box.z1 - 1); }
      tx = d.tx; tz = d.tz;
    }
    d.barkT -= dt; if (d.barkT <= 0) { d.barkT = 16 + Math.random() * 26; if (dd < 7) bark(0.45); }
  }
  const moving = !walkTo(d.g, tx, tz, dt, sp);
  d.asleep = isNight && !moving && !home;
  if (d.kind !== 'dog') { petAnim(d, moving, sp, dt, away ? null : pp); zzz(d, d.asleep, dt); return; }
  const run = moving ? (sp > 2 ? 16 : 10) : 0;
  d.legs.forEach((l, i) => { l.rotation.x = run && !reduced ? Math.sin(time * run + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.7 : 0; });
  d.tail.rotation.y = reduced || d.asleep ? 0 : Math.sin(time * (moving ? 18 : 10)) * 0.6;
  if (d.hop > 0) d.hop = Math.max(0, d.hop - dt * 3);
  d.body.position.y = Math.sin(d.hop * Math.PI) * 0.18 + (run && !reduced ? Math.abs(Math.sin(time * run)) * 0.04 : 0);
  /* idle: look up at Pip with a little head tilt; asleep: head down */
  let hy = 0, hx = d.asleep ? 0.35 : 0, hz = 0;
  if (!moving && !d.asleep && !away) { const want = Math.atan2(pp.x - p.x, pp.z - p.z); let df = want - d.g.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); hy = clamp(df, -0.9, 0.9); hx = Math.hypot(pp.x - p.x, pp.z - p.z) < 2.2 ? -0.38 : -0.1; hz = reduced ? 0 : Math.sin(time * 1.3) * 0.12; }
  d.head.rotation.y += (hy - d.head.rotation.y) * Math.min(1, dt * 6); d.head.rotation.x += (hx - d.head.rotation.x) * Math.min(1, dt * 6); d.head.rotation.z += (hz - d.head.rotation.z) * Math.min(1, dt * 4);
  zzz(d, d.asleep, dt);
}
