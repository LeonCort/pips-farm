/* ---------- price tags that are always readable ----------
   Every buy ring on the ground (the heart pad on the farm, the coin pad in the market, the barn and loft pads, the house
   ring) gets a little sign floating over it: a picture of what you get, a heart or a coin with how many are still needed,
   and a bar that fills as you pay. The sign is drawn last and without a depth test, so the stream, rocks, trees, fences or
   Pip standing on the ring never cover it. Green means you have enough: stand on the ring. The ground rings stay as they
   were; the sign is what a child reads. Buy mode has its own tags, so the signs hide while it is open. */
const PT_W = 320, PT_H = 168, PT_Y = 2.15, PT_S = 1.8, PT_FAR = 17;
const PT = [];
function ptMake() {
  const c = document.createElement('canvas'); c.width = PT_W; c.height = PT_H; const tex = new T.CanvasTexture(c); if ('colorSpace' in tex) tex.colorSpace = T.SRGBColorSpace;
  const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, fog: false }));
  sp.renderOrder = 20; sp.scale.set(PT_S, PT_S * PT_H / PT_W, 1); sp.visible = false; sc.add(sp);
  return { sp, c, tex, key: '', b: 0 };
}
/* the drawing: picture on the left, currency and number on the right, fill bar under them, a point down to the ring */
function ptDraw(t, o) {
  const f = Math.max(0, Math.min(1, 1 - o.left / o.cost)), can = o.purse >= o.left, key = o.id + ':' + o.left + ':' + can + ':' + !!o.pic;
  if (key === t.key) return; t.key = key;
  const x = t.c.getContext('2d'); x.clearRect(0, 0, PT_W, PT_H);
  const X0 = 10, Y0 = 8, W = PT_W - 20, H = 124, R = 30;
  /* shadow, card, point */
  x.fillStyle = 'rgba(34,48,60,0.28)'; x.beginPath(); x.roundRect(X0 + 2, Y0 + 7, W, H, R); x.fill();
  x.fillStyle = can ? '#3f7d62' : '#fffaf0'; x.strokeStyle = PAL.ink; x.lineWidth = 7;
  x.beginPath(); x.roundRect(X0, Y0, W, H, R); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(PT_W / 2 - 18, Y0 + H - 2); x.lineTo(PT_W / 2, Y0 + H + 28); x.lineTo(PT_W / 2 + 18, Y0 + H - 2); x.closePath(); x.fill(); x.stroke();
  x.fillRect(PT_W / 2 - 15, Y0 + H - 8, 30, 8);
  /* the picture in a round frame */
  const pcx = X0 + 58, pcy = Y0 + H / 2;
  x.fillStyle = '#fffaf0'; x.beginPath(); x.arc(pcx, pcy, 46, 0, 7); x.fill(); x.lineWidth = 5; x.strokeStyle = can ? '#fffaf0' : '#f2c14a'; x.stroke();
  if (o.pic) { try { x.save(); x.beginPath(); x.arc(pcx, pcy, 43, 0, 7); x.clip(); const d = o.fit ? 86 : 116; x.drawImage(o.pic, pcx - d / 2, pcy - d / 2, d, d); x.restore(); } catch (e) { x.restore(); } }
  /* currency and how many are still needed */
  const nx = X0 + 120, ny = Y0 + 46;
  drawIcon(x, o.cur, nx + 22, ny, 0.9);
  x.font = '800 60px system-ui, sans-serif'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillStyle = can ? '#fffaf0' : PAL.ink; x.fillText(fmt(Math.max(0, o.left)), nx + 52, ny + 3);
  /* the fill bar */
  const bx = nx, by = Y0 + 86, bw = X0 + W - 18 - nx, bh = 22;
  x.fillStyle = can ? 'rgba(255,250,240,0.35)' : 'rgba(120,100,70,0.22)'; x.beginPath(); x.roundRect(bx, by, bw, bh, bh / 2); x.fill();
  if (f > 0) { x.fillStyle = can ? '#fffaf0' : (o.cur === 'heart' ? '#e9684a' : '#f2c14a'); x.beginPath(); x.roundRect(bx, by, Math.max(bh, bw * f), bh, bh / 2); x.fill(); }
  x.lineWidth = 4; x.strokeStyle = PAL.ink; x.beginPath(); x.roundRect(bx, by, bw, bh, bh / 2); x.stroke();
  t.tex.needsUpdate = true;
}
/* the pictures: buy mode already draws one per thing (bmIcon keeps the canvas in BM_CV) */
const ptCv = (key, make) => { make(); return BM_CV[key] || null; };
const ptIconCv = (k, icon) => ptCv('i:' + k, () => bmIcon('i:' + k, (x) => drawIcon(x, icon, 64, 66, 1.35)));
/* every ring that is out right now */
function ptList() {
  const L = [];
  if (typeof pad !== 'undefined' && pad && pad.g.parent && pad.g.visible) { const p = pad.p, q = pad.g.position;
    L.push({ id: 'p:' + p.id, x: q.x, z: q.z, cur: 'heart', cost: p.cost, left: p.cost - (state.paid[p.id] || 0), purse: state.coins, pic: ptCv('p:' + p.id, () => bmPadPic(p)) }); }
  if (typeof sPad !== 'undefined' && sPad && sPad.g.parent && sPad.g.visible) { const p = sPad.p, q = sPad.g.position;
    L.push({ id: 's:' + p.id, x: q.x, z: q.z, cur: 'coin', cost: p.cost, left: p.cost - (shop().paid[p.id] || 0), purse: shop().coins, pic: ptCv('s:' + p.id, () => bmSPadPic(p)) }); }
  if (typeof bpad !== 'undefined' && bpad.visible && inBarn && !inLoft) { const p = nextBPad(); if (p)
    L.push({ id: 'b:' + p.id, x: BPAD_AT.x, z: BPAD_AT.z, cur: 'heart', cost: p.cost, left: p.cost - (barnS().paid[p.id] || 0), purse: state.coins, pic: ptCv('b:' + p.id, () => bmBPadPic(p)) }); }
  if (typeof lpad !== 'undefined' && lpad.visible && inLoft) { const p = nextLPad(); if (p)
    L.push({ id: 'l:' + p.id, x: LPAD_AT.x, z: LPAD_AT.z, cur: 'heart', cost: p.cost, left: p.cost - (loftS().paid[p.id] || 0), purse: state.coins, pic: ptIconCv(p.a, p.a) }); }
  if (typeof hrMesh !== 'undefined' && hrMesh.visible && HRING.o) { const o = HRING.o, S = stS();
    L.push({ id: 'h:' + o.id, x: HRING.x, z: HRING.z, cur: o.gear ? 'heart' : 'coin', cost: o.cost, left: o.cost - (S.paid[o.id] || 0), purse: purse(o), pic: HRING.img, fit: true }); }
  return L;
}
function ptStep(dt) {
  const L = (typeof buyOn !== 'undefined' && buyOn) || dressing ? [] : ptList().filter((o) => o.cost > 0 && Math.hypot(o.x - pip.position.x, o.z - pip.position.z) < PT_FAR);
  while (PT.length < L.length) PT.push(ptMake());
  PT.forEach((t, i) => {
    const o = L[i]; t.sp.visible = !!o; if (!o) { t.key = ''; return; }
    ptDraw(t, o);
    const can = o.purse >= o.left, on = Math.hypot(o.x - pip.position.x, o.z - pip.position.z) < 0.9;
    t.b += dt; const bob = reduced ? 0 : can ? Math.abs(Math.sin(t.b * 3.2)) * 0.12 : Math.sin(t.b * 2) * 0.04;
    t.sp.position.set(o.x, PT_Y + bob + (on ? 0.25 : 0), o.z);
    const k = can && !reduced ? 1 + Math.sin(t.b * 6.4) * 0.03 : 1; t.sp.scale.set(PT_S * k, PT_S * k * PT_H / PT_W, 1);
  });
}
{ const e0 = extrasStep; extrasStep = function (dt) { e0(dt); ptStep(dt); }; }
if (window.__farmTest) window.__ptag = () => PT.filter((t) => t.sp.visible).map((t) => t.key + '@' + [t.sp.position.x, t.sp.position.z].map((v) => v.toFixed(1)).join(','));
