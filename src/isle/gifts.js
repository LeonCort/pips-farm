/* Pips Island: morning presents (Leon, 2026-11-27).
   What the friends and the villages give each morning used to land by a door on some far street, or slip silently into the
   crate. Now every giver sends a wrapped present to the lawn across the path from the camp's crate: a box in the giver's
   own colour, with a round tag over it showing who it is from (a friend's face, or the village's wonder) and a heart.
   Pip walks into a box to open it: it bursts, and what was inside floats up and goes into the crate.
   A box left unopened grows a little each morning, up to five mornings' worth (state.isle.gifts[id] = { n, c }). */
const GIFTERS = ['mason', 'miner', 'fisher', 'diver', 'glass', 'windmill', 'lighthouse', 'tower'];
/* what a friend with a house sends (the villages' gifts are HAM_DEF.give, times the village's size) */
const GIFT_FOLK = { mason: { stone: 4 }, miner: { crystal: 2 }, fisher: { reed: 2 }, diver: { pearl: 1 }, glass: { ember: 1 } };
const GIFT_AT = (k) => [1.9 + k * 0.53, 0.95 + (k % 2) * 0.16]; /* one row along the lawn's edge */
const GF = { box: {}, tex: {} };
const gifts = () => state.isle.gifts || (state.isle.gifts = {});
function giftNear(x, z, r) { return x > 1.6 - r * 0.4 && x < 5.9 + r * 0.4 && z > 0.6 - r * 0.4 && z < 1.5 + r * 0.4; }
function giftAdd(id, G, mul) {
  const o = gifts()[id] || (gifts()[id] = { n: 0, c: {} }); if (o.n >= 5) return;
  o.n++; Object.keys(G).forEach((t) => { o.c[t] = (o.c[t] || 0) + G[t] * (mul || 1); });
}
function giftColor(id) { const v = VILLAGERS.find((q) => q.id === id); return v ? v.head : HAM_DEF[id].roof[0]; }
function giftTag(id) {
  if (GF.tex[id]) return GF.tex[id];
  const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d');
  x.beginPath(); x.arc(76, 80, 62, 0, 7); x.fillStyle = '#fff6e4'; x.fill(); x.lineWidth = 6; x.strokeStyle = '#6e4426'; x.stroke();
  const v = VILLAGERS.find((q) => q.id === id); if (v) boardFace(x, v, 76, 92, 0.95, 3); else isleIcon(x, id, 76, 82, 2.0);
  /* the heart: thank you */
  x.save(); x.translate(128, 36); x.beginPath(); x.moveTo(0, 20); x.bezierCurveTo(-34, -4, -16, -30, 0, -10); x.bezierCurveTo(16, -30, 34, -4, 0, 20); x.closePath(); x.fillStyle = '#e8506a'; x.fill(); x.lineWidth = 5; x.strokeStyle = '#fff6e4'; x.stroke(); x.lineWidth = 2.5; x.strokeStyle = '#6e4426'; x.stroke(); x.restore();
  return (GF.tex[id] = new T.CanvasTexture(c));
}
function giftMake(id, anim) {
  const k = GIFTERS.indexOf(id), [bx, bz] = GIFT_AT(k), g = new T.Group(); g.position.set(bx, 0, bz); g.rotation.y = (hash(k, 8801) - 0.5) * 0.7; sc.add(g);
  const col = giftColor(id), L = []; let q = new T.BoxGeometry(0.46, 0.36, 0.46); q.translate(0, 0.18, 0); L.push(fac(q, (cx, cy, cz, i) => shadeY(col, cy, 0, 0.5, i, 0.35), 8810 + k));
  q = new T.BoxGeometry(0.52, 0.1, 0.52); q.translate(0, 0.4, 0); L.push(fac(q, (cx, cy, cz, i) => tone(col, i, 0.25), 8820 + k));
  [[0.1, 0.475, 0.535], [0.535, 0.475, 0.1]].forEach(([w, h, d], n) => { q = new T.BoxGeometry(w, h, d); q.translate(0, 0.2375, 0); L.push(fac(q, '#fff0c8', 8830 + n)); });
  [-1, 1].forEach((s, n) => { q = new T.SphereGeometry(0.085, 8, 6); q.scale(1.3, 0.8, 0.7); q.rotateZ(s * 0.5); q.translate(s * 0.1, 0.53, 0); L.push(fac(q, '#ffd76a', 8840 + n)); });
  q = new T.SphereGeometry(0.05, 7, 5); q.translate(0, 0.5, 0); L.push(fac(q, '#f4b23a', 8845));
  merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g).castShadow = true;
  const tag = isleSprite(giftTag(id), 0.62); tag.position.set(0, 1.12, 0); g.add(tag);
  const B = GF.box[id] = { id, g, tag, pop: anim ? -0.5 - k * 0.3 : 1, out: 0 }; if (anim) g.visible = false; return B;
}
/* the boxes follow what waits in the save */
function giftSync(anim) { GIFTERS.forEach((id) => { const o = gifts()[id]; if (o && o.n && !GF.box[id]) giftMake(id, anim); }); }
function giftWake() {
  Object.keys(GIFT_FOLK).forEach((id) => { if (housed(id)) giftAdd(id, GIFT_FOLK[id], 1); });
  Object.keys(HAM_DEF).forEach((id) => { if (mons()[id]) giftAdd(id, HAM_DEF[id].give, hamLv(id)); });
  giftSync(true); save();
}
function giftOpen(B) {
  const o = gifts()[B.id], [bx, bz] = [B.g.position.x, B.g.position.z]; delete gifts()[B.id]; B.out = 0.001;
  Object.keys(o.c).forEach((t, k) => { state.isle.store[t] = (state.isle.store[t] || 0) + o.c[t];
    const sp = new T.Sprite(new T.SpriteMaterial({ map: hamGiftTex(t, o.c[t]), transparent: true, depthWrite: false })); sp.scale.set(1.5, 0.75, 1); sp.position.set(bx, 1.5 + k * 0.8, bz); sc.add(sp); FD.floats.push({ sp, t: 0, y: k * 0.8 }); });
  invDirty = true; burst(bx, 0.7, bz, 14); Snd.play('success', { gain: 0.45 }); Snd.play('sparkle', { gain: 0.45 }); bldBadge(); save();
}
function giftStep(dt) {
  const pp = pip.position;
  Object.keys(GF.box).forEach((id) => { const B = GF.box[id], g = B.g, o = gifts()[id], big = 1 + 0.09 * ((o ? o.n : 1) - 1);
    if (B.out) { B.out += dt; const u = B.out / 0.32; g.scale.setScalar(Math.max(0.01, u < 0.35 ? 1 + u : 1.35 * (1 - (u - 0.35) / 0.65)) * big); if (u >= 1) { sc.remove(g); delete GF.box[id]; } return; }
    if (B.pop < 1) { B.pop += dt * (B.pop < 0 ? 1 : 2.4); if (B.pop < 0) return; if (!g.visible) { g.visible = true; burst(g.position.x, 0.5, g.position.z, 5); Snd.play('pop', { gain: 0.35, f: 560 + GIFTERS.indexOf(id) * 40 }); }
      const u = Math.min(1, B.pop); g.scale.setScalar(Math.max(0.01, u < 0.7 ? u / 0.7 * 1.15 : 1.15 - (u - 0.7) / 0.3 * 0.15) * big); return; }
    g.scale.setScalar(big); B.tag.position.y = 1.12 + (reduced ? 0 : Math.sin(time * 2.2 + GIFTERS.indexOf(id) * 1.3) * 0.05);
    if (o && !enSleep && !inCave && Math.hypot(pp.x - g.position.x, pp.z - g.position.z) < 0.46) giftOpen(B); });
}
