
/* ---------- names, babies and the sticker album ---------- */
const NAMES = {
  hen: ['Pippa', 'Gullan', 'Kajsa', 'Prickan', 'Solan', 'Grålla'],
  pig: ['Nasse', 'Fläckis', 'Brunte', 'Rosa', 'Prick', 'Mysan'],
  sheep: ['Ullis', 'Molly', 'Molnet', 'Svartis', 'Lammi'],
  horse: ['Blixten', 'Natten', 'Guldis', 'Silver', 'Pricken', 'Bruno', 'Kanel'],
  cow: ['Mumsan', 'Klöver', 'Karamell', 'Natti', 'Smulan'],
  bull: ['Bruse', 'Kolja', 'Tor', 'Gråben', 'Pelle'],
  goat: ['Bettan', 'Majken', 'Svarta', 'Silja', 'Kanel']
};
const BABY_SV = { hen: 'kyckling', pig: 'kulting', sheep: 'lamm', horse: 'föl', cow: 'kalv', bull: 'kalv', goat: 'killing' };
const KIND_SV = { hen: 'Höns', pig: 'Grisar', sheep: 'Får', horse: 'Hästar', cow: 'Kor', bull: 'Tjurar', goat: 'Getter' };
const CHICK = { b: '#f6d65a' };
const babies = [];
/* an animal's coat number: adults follow the order they arrived, babies keep their own */
const coatIdx = (an) => an.coatI != null ? an.coatI : (animals.filter((o) => o.a === an.a).indexOf(an)) % COATS[an.a].length;
function nameOf(an) { const n = NAMES[an.a][coatIdx(an) % NAMES[an.a].length]; return an.baby ? 'Lilla ' + n : n; }
/* the album: one sticker per coat, and one for a baby of each kind */
function hasSticker(a, i) { return i === 'baby' ? babies.some((b) => b.a === a) : animals.some((o) => o.a === a && coatIdx(o) === i) || babies.some((b) => b.a === a && b.coatI === i); }
function stickerCount() { let n = 0; for (const a in COATS) { COATS[a].forEach((c, i) => { if (hasSticker(a, i)) n++; }); if (hasSticker(a, 'baby')) n++; } FISH.forEach((q) => { if (state && state.fish && state.fish[q.id]) n++; }); return n; }
const STICKER_TOTAL = Object.keys(COATS).reduce((s, a) => s + COATS[a].length + 1, 0) + FISH.length;
function makeBaby(mum, coatI, quiet) {
  const a = mum.a, m = animalModel(a, coatI + 1, a === 'hen' ? CHICK : null);
  m.g.scale.setScalar(a === 'hen' ? 0.6 : 0.5); const p = mum.g.position; m.g.position.set(p.x + 0.4, 0, p.z + 0.4); sc.add(m.g);
  const b = { a, baby: true, mum, coatI, g: m.g, body: m.body, h: m.h * 0.55, hop: 0, petT: -99, sleep: null };
  babies.push(b); mum.kids = (mum.kids || 0) + 1;
  if (!quiet) { b.hop = 1; burst(p.x, mum.h, p.z, 8); Snd.play('success', { gain: 0.6, f: 'G6' }); Snd.play('sparkle', { gain: 0.5 }, 0.1); earn(3); coinToHud(p.x, mum.h, p.z, 3); showName(b, 2.4); flashAlbum(); }
  return b;
}
/* a well-fed, happy animal sometimes gets a baby; spring is the season for it */
function maybeBaby(an) {
  an.love = (an.love || 0) + 1;
  if (an.kids || babies.length >= 14 || isNight) return;
  if (an.love < (season === 'spring' ? 4 : 8)) return;
  an.love = 0;
  /* the baby gets a coat the album is still missing, if there is one */
  const n = COATS[an.a].length, miss = []; for (let i = 0; i < n; i++) if (!hasSticker(an.a, i)) miss.push(i);
  const c = miss.length ? miss[Math.floor(Math.random() * miss.length)] : Math.floor(Math.random() * n);
  makeBaby(an, c); state.babies = babies.map((b) => ({ a: b.a, m: animals.indexOf(b.mum), k: animals.filter((o) => o.a === b.a).indexOf(b.mum), c: b.coatI }));
}
function restoreBabies() { (state.babies || []).forEach((s) => { const mum = s.k != null ? animals.filter((o) => o.a === s.a)[s.k] : animals[s.m]; if (mum && mum.a === s.a && s.c >= 0 && s.c < COATS[s.a].length) makeBaby(mum, s.c, true); }); }
/* babies trot after their mum, and curl up next to her at night */
function babyStep(dt) {
  babies.forEach((b, k) => {
    const mum = b.mum, mp = mum.g.position, r = mum.a === 'hen' ? 0.35 : 0.6;
    const back = mum.g.rotation.y + Math.PI + (k % 2 ? 0.6 : -0.6), tx = mp.x + Math.sin(back) * r, tz = mp.z + Math.cos(back) * r;
    let far = Math.hypot(b.g.position.x - tx, b.g.position.z - tz); if (far > 6) { b.g.position.set(tx, 0, tz); far = 0; }
    const moving = far > 0.12 && !walkTo(b.g, tx, tz, dt, far > 1.5 ? 4.0 : mum.ridden ? 2.6 : 1.1);
    if (!moving && mum.asleep) b.g.rotation.y += (mum.g.rotation.y - b.g.rotation.y) * Math.min(1, dt * 3);
    const sleepy = !moving && mum.asleep;
    zzz(b, sleepy, dt);
    if (b.hop > 0) b.hop = Math.max(0, b.hop - dt * 2.2);
    b.body.position.y = Math.sin(b.hop * Math.PI) * 0.4 + (reduced ? 0 : moving ? Math.abs(Math.sin(time * 13 + k)) * 0.06 : 0);
  });
}
function sleepSpot(an) { const h = housePos(an.a), k = animals.filter((o) => o.a === an.a).indexOf(an), sp = an.a === 'hen' ? 0.42 : an.a === 'pig' || an.a === 'sheep' ? 0.62 : 0.8; return [h[0] + penSide(an.a) * (k % 3) * sp, h[1] + 0.85 + Math.floor(k / 3) * 0.6]; }
/* sleeping: a little "z z" floats over sleeping animals */
const zTex = (() => { const c = document.createElement('canvas'); c.width = 96; c.height = 64; const x = c.getContext('2d'); x.font = '700 30px Fredoka, sans-serif'; x.fillStyle = '#fff6e4'; x.strokeStyle = PAL.ink; x.lineWidth = 6; x.lineJoin = 'round'; [['z', 14, 52, 26], ['z', 40, 36, 32], ['Z', 64, 22, 38]].forEach(([t, px, py, s]) => { x.font = '700 ' + s + 'px Fredoka, sans-serif'; x.strokeText(t, px, py); x.fillText(t, px, py); }); return new T.CanvasTexture(c); })();
function zzz(an, on, dt) {
  if (on && !an.zs && !an.baby) { an.zs = new T.Sprite(new T.SpriteMaterial({ map: zTex, transparent: true, depthTest: false })); an.zs.renderOrder = 6; an.zs.scale.set(0.6, 0.4, 1); sc.add(an.zs); }
  if (an.zs) { an.zs.visible = on; if (on) { const p = an.g.position; an.zs.position.set(p.x + 0.25, an.h * (an.baby ? 1 : 0.85) + 0.25 + (reduced ? 0 : Math.sin(time * 1.5 + p.x) * 0.08), p.z); } }
  const lie = on ? 1 : 0; an.lie = (an.lie || 0) + (lie - (an.lie || 0)) * Math.min(1, dt * 3);
  an.body.scale.y = 1 - an.lie * 0.22; an.body.rotation.x = an.lie * 0.05;
}
/* a name tag pops up over an animal when you pet it */
const nameTex = {};
function nameSprite(txt) {
  if (nameTex[txt]) return nameTex[txt];
  const c = document.createElement('canvas'); c.width = 256; c.height = 72; const x = c.getContext('2d'); x.font = '700 34px Fredoka, sans-serif'; const w = Math.min(244, x.measureText(txt).width + 36);
  x.fillStyle = PAL.paper; x.strokeStyle = PAL.ink; x.lineWidth = 5; x.beginPath(); x.roundRect ? x.roundRect(128 - w / 2, 8, w, 54, 27) : x.rect(128 - w / 2, 8, w, 54); x.fill(); x.stroke();
  x.fillStyle = PAL.ink; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 128, 36);
  return (nameTex[txt] = new T.CanvasTexture(c));
}
const tags = [];
function showName(an, dur) {
  if (an.tag) { an.tag.t = dur; return; }
  const sp = new T.Sprite(new T.SpriteMaterial({ map: nameSprite(nameOf(an)), transparent: true, depthTest: false })); sp.renderOrder = 7; sp.scale.set(1.5, 0.42, 1); sc.add(sp);
  an.tag = { sp, t: dur }; tags.push(an);
}
function tagStep(dt) {
  for (let i = tags.length - 1; i >= 0; i--) { const an = tags[i], tg = an.tag; tg.t -= dt; const p = an.g.position; tg.sp.position.set(p.x, an.h + (an.baby ? 0.45 : 0.75), p.z); tg.sp.material.opacity = Math.min(1, tg.t * 3); if (tg.t <= 0) { sc.remove(tg.sp); an.tag = null; tags.splice(i, 1); } }
}
/* ---------- the album ---------- */
let albumShown = -1;
function flashAlbum() { const b = $('albumBtn'); if (b) { b.classList.add('new'); } }
const thumbs = {};
let thumbRT = null, thumbScene = null, thumbCam = null;
function thumb(a, i) {
  const key = a + ':' + i; if (thumbs[key]) return thumbs[key];
  if (!thumbRT) {
    thumbRT = new T.WebGLRenderTarget(160, 160); thumbScene = new T.Scene(); thumbCam = new T.PerspectiveCamera(30, 1, 0.1, 50);
    thumbScene.add(new T.HemisphereLight(0xffffff, 0xb0a890, 0.85)); const d = new T.DirectionalLight(0xfff0dd, 0.7); d.position.set(3, 5, 4); thumbScene.add(d);
  }
  const baby = i === 'baby', m = animalModel(a, baby ? 1 : i + 1, baby && a === 'hen' ? CHICK : null);
  if (baby) m.g.scale.setScalar(0.7);
  m.g.rotation.y = 0.75; thumbScene.add(m.g);
  const h = m.h * (baby ? 0.7 : 1), dist = 0.55 + h * 1.15; thumbCam.position.set(dist * 0.15, h * 0.55 + dist * 0.35, dist); thumbCam.lookAt(0, h * 0.45, 0);
  const old = renderer.getClearColor(new T.Color()).getHex(), oldA = renderer.getClearAlpha();
  renderer.setRenderTarget(thumbRT); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(thumbScene, thumbCam);
  const px = new Uint8Array(160 * 160 * 4); renderer.readRenderTargetPixels(thumbRT, 0, 0, 160, 160, px); renderer.setRenderTarget(null); renderer.setClearColor(old, oldA);
  thumbScene.remove(m.g);
  const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d'), img = x.createImageData(160, 160);
  for (let y = 0; y < 160; y++) img.data.set(px.subarray((159 - y) * 640, (160 - y) * 640), y * 640);
  x.putImageData(img, 0, 0); return (thumbs[key] = c.toDataURL());
}
function renderAlbum() {
  const box = $('albumGrid'); if (!box) return;
  let html = '';
  for (const a of ['hen', 'pig', 'sheep', 'goat', 'cow', 'horse', 'bull']) {
    html += '<div class="arow" role="group" aria-label="' + KIND_SV[a] + '">';
    COATS[a].forEach((c, i) => { const got = hasSticker(a, i); html += '<div class="stk' + (got ? ' got' : '') + '">' + (got ? '<img alt="" src="' + thumb(a, i) + '">' : '<span aria-hidden="true">?</span>') + '<em>' + (got ? NAMES[a][i] : '') + '</em></div>'; });
    const gb = hasSticker(a, 'baby'); html += '<div class="stk baby' + (gb ? ' got' : '') + '">' + (gb ? '<img alt="" src="' + thumb(a, 'baby') + '">' : '<span aria-hidden="true">?</span>') + '<em>' + (gb ? BABY_SV[a] : '') + '</em></div>';
    html += '</div>';
  }
  html += '<div class="arow" role="group" aria-label="Fiskar">';
  FISH.forEach((q) => { const got = !!(state.fish && state.fish[q.id]); html += '<div class="stk fishstk' + (got ? ' got' : '') + '">' + (got ? '<img alt="" src="' + fishPic(q.id) + '">' : '<span aria-hidden="true">?</span>') + '<em>' + (got ? q.sv + (state.fish[q.id] > 1 ? ' ×' + state.fish[q.id] : '') : '') + '</em></div>'; });
  html += '</div>';
  box.innerHTML = html; $('albumCount').textContent = stickerCount() + ' / ' + STICKER_TOTAL;
}
function openAlbum() { if (typeof closeMenu === 'function') closeMenu(); $('album').hidden = false; $('albumBtn').classList.remove('new'); Snd.init(); Snd.play('pop', { gain: 0.4, f: 640 }); renderAlbum(); }
function closeAlbum() { $('album').hidden = true; }
if ($('albumBtn')) { $('albumBtn').addEventListener('click', (e) => { e.stopPropagation(); if ($('album').hidden) openAlbum(); else closeAlbum(); }); $('albumClose').addEventListener('click', closeAlbum); $('album').addEventListener('click', (e) => { if (e.target === $('album')) closeAlbum(); }); }
/* new animals give new stickers too */
let stickersSeen = -1;
function checkStickers() { const n = stickerCount(); if (stickersSeen >= 0 && n > stickersSeen) flashAlbum(); stickersSeen = n; }

/* ---------- crates for eggs and milk: happy animals fill them, and the goods wait there for the market ----------
   'van': one crate in the farmyard, and the truck drives it to the market.
   'near': an egg crate in front of the hen house and a milk crate in front of the cow pen, each a few steps from its stall. */
const SHIP_MAX = 16;
function makeCrate(x, z, types) {
  const g = new T.Group(); g.position.set(x, 0, z); sc.add(g);
  let geo = new T.BoxGeometry(1.2, 0.08, 0.9); part(fac(geo, PAL.trunk, 91), g, 0, 0.04, 0);
  [[0, 0.41, 1.2, 0.08], [0, -0.41, 1.2, 0.08]].forEach(([x2, z2, w, d], k) => { geo = new T.BoxGeometry(w, 0.32, d); part(fac(jit(geo, 0.01, k), PAL.ochre, 92 + k), g, x2, 0.2, z2); });
  [-0.56, 0.56].forEach((x2, k) => { geo = new T.BoxGeometry(0.08, 0.32, 0.9); part(fac(geo, PAL.ochre, 94 + k), g, x2, 0.2, 0); });
  /* a little striped awning so it reads as "for the market" */
  geo = new T.BoxGeometry(0.06, 1.0, 0.06); part(fac(geo, PAL.trunk, 96), g, -0.5, 0.5, -0.5);
  geo = new T.BoxGeometry(0.06, 1.0, 0.06); part(fac(geo, PAL.trunk, 96), g, 0.5, 0.5, -0.5);
  for (let k = 0; k < 5; k++) { geo = new T.BoxGeometry(0.22, 0.06, 0.34); geo.rotateX(0.35); part(fac(geo, k % 2 ? PAL.paper : PAL.accent, 97 + k), g, -0.44 + k * 0.22, 1.02, -0.38); }
  const pile = new Pile(g, (k) => [-0.4 + (k % 5) * 0.2, 0.1 + Math.floor(k / 15) * 0.2, -0.24 + (Math.floor(k / 5) % 3) * 0.24]);
  return { g, pile, x, z, types, inbound: 0 };
}
const CRATES = VARIANT === 'near' ? [makeCrate(12.3, 4.3, ['egg']), makeCrate(14.4, -4.4, ['milk'])] : [makeCrate(-9.3, 1.45, ['egg', 'milk'])];
const SHIP_AT = [CRATES[0].x, CRATES[0].z], shipG = CRATES[0].g, shipPile = CRATES[0].pile;
const crateFor = (t) => CRATES.find((c) => c.types.includes(t)) || CRATES[0];
/* a hen lays two eggs and a cow gives two bottles of milk when they have eaten; they fly to the crate */
function produce(an) {
  const t = an.a === 'hen' ? 'egg' : an.a === 'cow' ? 'milk' : null; if (!t) return; const cr = crateFor(t);
  for (let k = 0; k < 2; k++) {
    if (cr.pile.items.length + cr.inbound >= SHIP_MAX) return;
    const m = mk(t), p = an.g.position; m.position.set(p.x, an.h * 0.5, p.z); sc.add(m); cr.inbound++;
    fly(m, () => cr.g.localToWorld(tmpV.set(0, 0.5, 0)), () => { cr.inbound--; cr.pile.add(m); }, 0.9 + k * 0.15);
  }
}
let familyT = 0;
function familyStep(dt) {
  babyStep(dt); tagStep(dt);
  familyT -= dt; if (familyT <= 0) { familyT = 1; checkStickers(); }
}
