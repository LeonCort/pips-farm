/* ---------- the dressing room: a small cozy room shown while the wardrobe is open ----------
   The farm is not drawn while dressing; this little scene (about 30 meshes, no shadow map) is drawn instead,
   so the editor is cheaper than the farm. Pip's body (pb) moves onto the rug and back. */
const ED = { built: false, on: false, closing: false, ok: false, tab: 0, rot: 0, rotTo: 0, hop: 0, dogHop: 0, t: 0, W: 0, H: 0, off: '' };
function edTex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.anisotropy = 4; if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
/* a seeded wobble so the painted planks look the same every time */
const edR = (k) => hash(k, 4.7);
function edPlanks(ctx, w, h, o) {
  const n = o.n, bw = (o.vert ? w : h) / n;
  for (let i = 0; i < n; i++) {
    const c = new T.Color(o.col).offsetHSL((edR(i) - 0.5) * 0.02, 0, (edR(i + 9) - 0.5) * 0.06);
    ctx.fillStyle = c.getStyle();
    if (o.vert) ctx.fillRect(i * bw, 0, bw, h); else ctx.fillRect(0, i * bw, w, bw);
    /* grain lines */
    ctx.strokeStyle = 'rgba(40,22,10,0.16)'; ctx.lineWidth = 1.2;
    for (let k = 0; k < 5; k++) { ctx.beginPath(); const off = (k + 0.5 + edR(i * 7 + k) * 0.4) * bw / 5.4;
      if (o.vert) { ctx.moveTo(i * bw + off, 0); for (let y = 0; y <= h; y += 32) ctx.lineTo(i * bw + off + Math.sin(y * 0.02 + k + i) * 2.2, y); }
      else { ctx.moveTo(0, i * bw + off); for (let x = 0; x <= w; x += 32) ctx.lineTo(x, i * bw + off + Math.sin(x * 0.02 + k + i) * 2.2); }
      ctx.stroke(); }
    /* a knot or two */
    if (edR(i + 3) > 0.45) { ctx.fillStyle = 'rgba(50,26,12,0.28)'; ctx.beginPath(); const a = edR(i + 5) * (o.vert ? h : w); if (o.vert) ctx.ellipse(i * bw + bw * 0.5, a, 3, 7, 0, 0, 6.3); else ctx.ellipse(a, i * bw + bw * 0.5, 7, 3, 0, 0, 6.3); ctx.fill(); }
    /* gap and a soft highlight edge */
    ctx.fillStyle = 'rgba(25,12,6,0.65)'; if (o.vert) ctx.fillRect(i * bw, 0, 3, h); else ctx.fillRect(0, i * bw, w, 3);
    ctx.fillStyle = 'rgba(255,220,170,0.10)'; if (o.vert) ctx.fillRect(i * bw + 3, 0, 3, h); else ctx.fillRect(0, i * bw + 3, w, 3);
    /* board ends with nails */
    if (!o.vert) { const e = (edR(i + 11) * 0.6 + 0.2) * w; ctx.fillStyle = 'rgba(25,12,6,0.6)'; ctx.fillRect(e, i * bw, 3, bw); ctx.fillStyle = 'rgba(30,20,15,0.7)'; [0.3, 0.7].forEach((q) => { ctx.beginPath(); ctx.arc(e + 9, i * bw + bw * q, 2.2, 0, 6.3); ctx.arc(e - 6, i * bw + bw * q, 2.2, 0, 6.3); ctx.fill(); }); }
  }
}
function edBuild() {
  ED.built = true;
  const S = ED.sc = new T.Scene(); S.background = new T.Color('#2a1d16'); S.fog = new T.Fog('#2a1d16', 7, 13);
  ED.cam = new T.PerspectiveCamera(30, 1, 0.3, 30);
  S.add(new T.HemisphereLight(0xffe2bf, 0x4a3426, 0.75));
  const key = new T.DirectionalLight(0xffd2a0, 0.95); key.position.set(-2.5, 4, 4.5); S.add(key);
  const glow = new T.PointLight(0xffb36a, 0.9, 6.5, 2); glow.position.set(0.55, 2.3, 0.6); S.add(glow);
  const L = (map, o) => new T.MeshLambertMaterial(Object.assign({ map }, o || {}));
  const add = (geo, mat, x, y, z) => { const m = new T.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); S.add(m); return m; };
  /* floor and walls: painted planks */
  const floorT = edTex(512, 512, (c, w, h) => edPlanks(c, w, h, { n: 6, col: '#6b4a32' }), [3, 3]);
  const fl = add(new T.PlaneGeometry(12, 10), L(floorT), 0, 0, 0.5); fl.rotation.x = -Math.PI / 2;
  const wallT = edTex(512, 512, (c, w, h) => { edPlanks(c, w, h, { n: 7, vert: true, col: '#4a3326' }); }, [3, 1]);
  add(new T.PlaneGeometry(12, 4.2), L(wallT), 0, 2.1, -2.6);
  const sideT = wallT.clone(); sideT.needsUpdate = true; sideT.repeat.set(2, 1);
  const sw = add(new T.PlaneGeometry(8, 4.2), L(sideT), -4.2, 2.1, 1.2); sw.rotation.y = Math.PI / 2;
  const wood = (hex) => new T.MeshLambertMaterial({ color: hex });
  add(new T.BoxGeometry(12, 0.16, 0.08), wood('#3a271c'), 0, 0.08, -2.55);
  /* a small window with a warm evening glow */
  const winT = edTex(128, 128, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffcf8a'); g.addColorStop(1, '#f39a5a'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,245,220,0.6)'; c.beginPath(); c.arc(w * 0.7, h * 0.35, 14, 0, 6.3); c.fill(); });
  add(new T.PlaneGeometry(0.9, 0.8), new T.MeshBasicMaterial({ map: winT, fog: false }), 1.0, 2.35, -2.57);
  [[0, 0.43, 1.0, 0.08], [0, -0.43, 1.0, 0.08], [-0.47, 0, 0.08, 0.94], [0.47, 0, 0.08, 0.94], [0, 0, 0.05, 0.86], [0, 0, 0.92, 0.05]].forEach(([x, y, w, h]) => add(new T.BoxGeometry(w, h, 0.06), wood('#5a3b26'), 1.0 + x, 2.35 + y, -2.53));
  add(new T.BoxGeometry(1.1, 0.06, 0.18), wood('#5a3b26'), 1.0, 1.92, -2.48);
  /* soft contact shadows: one round decal texture used everywhere */
  const shT = edTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(0,0,0,0.62)'); g.addColorStop(0.55, 'rgba(0,0,0,0.3)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  const shM = new T.MeshBasicMaterial({ map: shT, transparent: true, depthWrite: false, fog: false });
  const shadow = (x, z, sx, sz, y) => { const m = add(new T.PlaneGeometry(1, 1), shM, x, y || 0.012, z); m.rotation.x = -Math.PI / 2; m.scale.set(sx, sz, 1); return m; };
  /* the braided rug */
  const rugT = edTex(256, 256, (c, w, h) => {
    const cx = w / 2, cy = h / 2, cols = ['#b48a5c', '#8f6a45', '#c4a47a', '#9d7a52'];
    for (let r = 126, k = 0; r > 4; r -= 9, k++) {
      c.fillStyle = cols[k % 4]; c.beginPath(); c.arc(cx, cy, r, 0, 6.3); c.fill();
      c.strokeStyle = 'rgba(70,40,18,0.45)'; c.lineWidth = 1.4; c.beginPath(); c.arc(cx, cy, r, 0, 6.3); c.stroke();
      /* the twisted braid: little slanted dashes round each ring */
      const n = Math.max(6, Math.floor(r * 0.7)); c.strokeStyle = 'rgba(80,46,20,0.38)'; c.lineWidth = 2;
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, a2 = a + 0.5 / r * 6; c.beginPath(); c.moveTo(cx + Math.cos(a) * (r - 1.5), cy + Math.sin(a) * (r - 1.5)); c.lineTo(cx + Math.cos(a2) * (r - 7.5), cy + Math.sin(a2) * (r - 7.5)); c.stroke(); }
      c.strokeStyle = 'rgba(255,236,200,0.22)'; c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, r - 3, 0, 6.3); c.stroke();
    }
  });
  shadow(0, 0, 3.0, 2.6, 0.006);
  const rug = add(new T.CircleGeometry(1.15, 40), L(rugT), 0, 0.02, 0); rug.rotation.x = -Math.PI / 2; rug.scale.set(1, 0.86, 1);
  /* the mirror: a tilted board on a stand, painted glass with a diagonal sheen (no real reflection) */
  const mir = new T.Group(); mir.position.set(-1.5, 0, -1.35); mir.rotation.y = 0.38; S.add(mir);
  const glassT = edTex(128, 256, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#c4d6dc'); g.addColorStop(0.6, '#8fa7b3'); g.addColorStop(1, '#6f8794'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.32)'; c.beginPath(); c.moveTo(w * 0.15, 0); c.lineTo(w * 0.42, 0); c.lineTo(0, h * 0.45); c.lineTo(0, h * 0.25); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.2)'; c.beginPath(); c.moveTo(w * 0.62, 0); c.lineTo(w * 0.7, 0); c.lineTo(0, h * 0.66); c.lineTo(0, h * 0.6); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.14)'; c.beginPath(); c.moveTo(w, h * 0.5); c.lineTo(w, h * 0.6); c.lineTo(w * 0.35, h); c.lineTo(w * 0.22, h); c.fill();
  });
  const frameM = wood('#7a5234'), frameD = wood('#5c3c26');
  const board = new T.Group(); board.position.set(0, 0.12, 0); board.rotation.x = -0.14; mir.add(board);
  const gl = new T.Mesh(new T.PlaneGeometry(0.86, 1.62), new T.MeshLambertMaterial({ map: glassT, emissive: 0x2a3438 })); gl.position.set(0, 0.98, 0.045); board.add(gl);
  [[0, 1.83, 1.12, 0.14], [0, 0.13, 1.12, 0.14], [-0.5, 0.98, 0.13, 1.84], [0.5, 0.98, 0.13, 1.84]].forEach(([x, y, w, h]) => { const m = new T.Mesh(new T.BoxGeometry(w, h, 0.09), frameM); m.position.set(x, y, 0.02); board.add(m); });
  { const m = new T.Mesh(new T.BoxGeometry(0.06, 1.7, 0.06), frameD); m.position.set(0, 0.8, -0.64); m.rotation.x = 0.36; mir.add(m); }
  shadow(-1.5, -1.2, 1.6, 0.9);
  /* stacked crates, a bucket and the end of a bed, as simple shapes */
  const crateT = edTex(128, 128, (c, w, h) => { edPlanks(c, w, h, { n: 4, col: '#7d5a3c' }); c.strokeStyle = '#4a3020'; c.lineWidth = 12; c.strokeRect(6, 6, w - 12, h - 12); c.lineWidth = 10; c.beginPath(); c.moveTo(12, 12); c.lineTo(w - 12, h - 12); c.stroke(); });
  const crateM = L(crateT);
  const crate = (x, y, z, s, r) => { const m = add(new T.BoxGeometry(s, s * 0.8, s), crateM, x, y + s * 0.4, z); m.rotation.y = r; return m; };
  crate(1.45, 0, -1.75, 0.8, 0.12); crate(2.25, 0, -1.55, 0.72, -0.18); crate(1.6, 0.64, -1.75, 0.66, -0.05);
  shadow(1.85, -1.6, 2.4, 1.3);
  const bucketM = new T.MeshLambertMaterial({ color: '#6f7b80' });
  { const b = add(new T.CylinderGeometry(0.24, 0.19, 0.38, 14, 1, true), new T.MeshLambertMaterial({ color: '#6f7b80', side: T.DoubleSide }), 1.0, 0.19, -1.05); add(new T.CircleGeometry(0.2, 14), bucketM, 1.0, 0.33, -1.05).rotation.x = -Math.PI / 2;
    add(new T.TorusGeometry(0.24, 0.018, 4, 18), new T.MeshLambertMaterial({ color: '#4a5357' }), 1.0, 0.38, -1.05).rotation.x = Math.PI / 2;
    const h = add(new T.TorusGeometry(0.22, 0.012, 4, 14, Math.PI), new T.MeshLambertMaterial({ color: '#3a4245' }), 1.0, 0.38, -1.05); h.rotation.y = 0.5; shadow(1.0, -1.05, 0.8, 0.7); }
  { const bedW = wood('#5a3b26'); add(new T.BoxGeometry(0.12, 1.1, 0.12), bedW, 2.95, 0.55, -0.6); add(new T.SphereGeometry(0.09, 10, 8), bedW, 2.95, 1.15, -0.6);
    add(new T.BoxGeometry(0.12, 0.8, 0.12), bedW, 2.95, 0.4, -2.2); add(new T.BoxGeometry(0.1, 0.5, 1.6), bedW, 2.95, 0.6, -1.4);
    add(new T.BoxGeometry(1.4, 0.24, 1.7), new T.MeshLambertMaterial({ color: '#e7ddc8' }), 3.75, 0.55, -1.4);
    add(new T.BoxGeometry(1.42, 0.12, 1.2), new T.MeshLambertMaterial({ color: '#3f6f86' }), 3.75, 0.7, -1.15);
    add(new T.BoxGeometry(0.5, 0.14, 0.7), new T.MeshLambertMaterial({ color: '#f3ecdc' }), 3.25, 0.74, -1.95); shadow(3.6, -1.3, 2.2, 2.2); }
  /* rotation arrows on round parchment discs on the floor: tap to spin Pip */
  const discT = (dir, full) => edTex(128, 128, (c, w, h) => {
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(w / 2 + 3, h / 2 + 5, 58, 58, 0, 0, 6.3); c.fill();
    const g = c.createRadialGradient(w / 2 - 14, h / 2 - 16, 6, w / 2, h / 2, 60); g.addColorStop(0, '#fff6e2'); g.addColorStop(1, '#e2cfa6'); c.fillStyle = g; c.beginPath(); c.arc(w / 2, h / 2, 58, 0, 6.3); c.fill();
    c.strokeStyle = '#8a6a44'; c.lineWidth = 3; c.setLineDash([7, 5]); c.beginPath(); c.arc(w / 2, h / 2, 50, 0, 6.3); c.stroke(); c.setLineDash([]);
    c.strokeStyle = '#3a2a22'; c.fillStyle = '#3a2a22'; c.lineWidth = 9; c.lineCap = 'round'; c.save(); c.translate(w / 2, h / 2); if (dir < 0) c.scale(-1, 1);
    const a0 = full ? -2.4 : -2.6, a1 = full ? 2.0 : 0.6; c.beginPath(); c.arc(0, 0, 28, a0, a1); c.stroke();
    const ex = Math.cos(a1) * 28, ey = Math.sin(a1) * 28, tx = -Math.sin(a1), ty = Math.cos(a1); c.beginPath(); c.moveTo(ex + tx * 14, ey + ty * 14); c.lineTo(ex - ty * 13 - tx * 2, ey + tx * 13 - ty * 2); c.lineTo(ex + ty * 13 - tx * 2, ey - tx * 13 - ty * 2); c.closePath(); c.fill(); c.restore();
  });
  ED.arrows = [[-1.12, 1.18, -1, false], [1.12, 1.18, 1, false], [0, 1.5, 1, true]].map(([x, z, dir, full]) => { const m = add(new T.CircleGeometry(0.3, 24), new T.MeshBasicMaterial({ map: discT(dir, full), transparent: true, fog: false }), x, 0.03, z); m.rotation.x = -Math.PI / 2; m.scale.y = 0.86; m.userData = { dir, full, base: 1 }; return m; });
  /* Pip stands here; the dog sits beside */
  ED.rig = new T.Group(); S.add(ED.rig); shadow(0, 0, 1.0, 0.8, 0.03);
  ED.dog = null; edPetClone(); shadow(-0.74, 0.24, 0.8, 0.9, 0.031);
  /* a hanging lamp bulb above, glowing */
  add(new T.SphereGeometry(0.1, 10, 8), new T.MeshBasicMaterial({ color: '#ffe0a8', fog: false }), 0.55, 2.45, 0.6);
  add(new T.CylinderGeometry(0.008, 0.008, 1.8, 4), wood('#2a1d16'), 0.55, 3.4, 0.6);
  add(new T.ConeGeometry(0.2, 0.16, 12, 1, true), new T.MeshLambertMaterial({ color: '#3f6f86', side: T.DoubleSide }), 0.55, 2.55, 0.6);
}
/* the page for each tab; each row is one shelf */
const ED_TABS = [['skin', 'hs', 'hc'], ['ts', 'sh', 'bs', 'bc'], ['ss', 'sc']];
const ED_LABEL = { skin: 'Hudfärg', hs: 'Frisyr', hc: 'Hårfärg', ts: 'Tröja', sh: 'Tröjans färg', bs: 'Byxor eller kjol', bc: 'Byxfärg', ss: 'Skor', sc: 'Skofärg' };
const ED_TOP = {
  jacka: '<path d="M17 8 L8 14 L11 23 L15 21 V40 H33 V21 L37 23 L40 14 L31 8 C29 12 19 12 17 8 Z"/><path d="M24 12 V40" fill="none" stroke-width="2.5"/><path d="M18 30 h4 M26 30 h4" fill="none" stroke-width="2"/>',
  randig: '<path d="M17 8 L8 14 L11 23 L15 21 V40 H33 V21 L37 23 L40 14 L31 8 C29 12 19 12 17 8 Z"/><path d="M15.5 22 H32.5 M15.5 29 H32.5 M15.5 36 H32.5" fill="none" stroke="#fff6e4" stroke-width="3.5"/><path d="M17 8 L8 14 L11 23 L15 21 V40 H33 V21 L37 23 L40 14 L31 8 C29 12 19 12 17 8 Z" fill="none"/>',
  luva: '<path d="M15 12 C14 2 34 2 33 12 Z"/><path d="M17 8 L8 14 L11 23 L15 21 V40 H33 V21 L37 23 L40 14 L31 8 C29 12 19 12 17 8 Z"/><path d="M18 30 H30 V36 H18 Z" fill="none" stroke-width="2.2"/><path d="M22 12 V19 M26 12 V19" fill="none" stroke="#fff6e4" stroke-width="2"/>'
};
const edG = (fill, inner) => '<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="' + fill + '" stroke="#3a2a22" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">' + inner + '</g></svg>';
const edFace = (skin, hair, hs) => '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="27" r="14" fill="' + skin + '" stroke="#3a2a22" stroke-width="2.5"/>' + (hs ? '<g fill="' + hair + '" stroke="#3a2a22" stroke-width="2.5" stroke-linejoin="round">' + HS_ICON[hs] + '</g>' : '') + '<circle cx="19" cy="28" r="1.8" fill="#3a2a22"/><circle cx="29" cy="28" r="1.8" fill="#3a2a22"/><path d="M20.5 33 Q24 36 27.5 33" fill="none" stroke="#3a2a22" stroke-width="2" stroke-linecap="round"/></svg>';
function edIcon(k, i) {
  const skin = AVO.skin[av.skin], hc = AVO.hc[av.hc], hs = AVO.hs[av.hs], ts = AVO.ts[av.ts];
  if (k === 'skin') return edFace(AVO.skin[i], hc, null);
  if (k === 'hs') return edFace(skin, hc, AVO.hs[i]);
  if (k === 'hc') return edFace(skin, AVO.hc[i], hs === 'keps' || hs === 'mossa' ? 'kort' : hs);
  if (k === 'ts') return edG(AVO.sh[av.sh], ED_TOP[AVO.ts[i]]);
  if (k === 'sh') return edG(AVO.sh[i], ED_TOP[ts]);
  if (k === 'bs') return edG(AVO.bc[av.bc], BS_ICON[AVO.bs[i]]);
  if (k === 'bc') return edG(AVO.bc[i], BS_ICON[AVO.bs[av.bs]]);
  if (k === 'ss') return edG(AVO.sc[av.sc], SS_ICON[AVO.ss[i]]);
  if (k === 'sc') return edG(AVO.sc[i], SS_ICON[AVO.ss[av.ss]]);
  return '';
}
function edRows() {
  const box = $('wardRows'); if (!box) return;
  box.innerHTML = ED_TABS[ED.tab].map((k) => '<div class="wrow" role="radiogroup" aria-label="' + ED_LABEL[k] + '">' + AVO[k].map((v, i) =>
    '<button type="button" class="sw' + (av[k] === i ? ' on' : '') + '" role="radio" aria-checked="' + (av[k] === i) + '" aria-label="' + ED_LABEL[k] + ' ' + (AV_NAMES[k] ? AV_NAMES[k][i] || i + 1 : i + 1) + '" data-k="' + k + '" data-i="' + i + '">' + edIcon(k, i) + '</button>').join('') + '</div>').join('');
  /* the tab pictures show Pip's current hair, top and shoes */
  const pics = [edFace(AVO.skin[av.skin], AVO.hc[av.hc], AVO.hs[av.hs]), edG(AVO.sh[av.sh], ED_TOP[AVO.ts[av.ts]]), edG(AVO.sc[av.sc], SS_ICON[AVO.ss[av.ss]])];
  document.querySelectorAll('.edTab').forEach((b, i) => { b.classList.toggle('on', i === ED.tab); b.setAttribute('aria-selected', i === ED.tab); const sv = b.querySelector('svg'); if (sv) sv.outerHTML = pics[i]; });
}
/* the chosen pet sits on the rug beside Pip; swapped when the child has picked another one in the pet corner */
function edPetClone() {
  if (typeof dog === 'undefined' || !dog.g) return;
  if (state.pet === 'none') { if (ED.dog) { ED.sc.remove(ED.dog.g); ED.dog = null; ED.dogKind = null; } return; }
  if (ED.dog) { if (ED.dogKind === dog.kind) return; ED.sc.remove(ED.dog.g); }
  const d = dog.g.clone(true); d.position.set(-0.74, 0, 0.3); d.rotation.set(0, 0.45, 0); d.scale.setScalar(dog.kind === 'bear' ? 1.0 : 1.15); ED.sc.add(d);
  const bi = dog.g.children.indexOf(dog.body), body = d.children[bi];
  body.rotation.x = -0.5; body.position.y = -0.08;
  const legs = dog.legs.map((l) => body.children[dog.body.children.indexOf(l)]); legs[2].rotation.x = -0.95; legs[3].rotation.x = -0.95; legs[0].rotation.x = 0.5; legs[1].rotation.x = 0.5;
  const head = body.children[dog.body.children.indexOf(dog.head)]; head.rotation.set(0.3, 0, 0);
  ED.dog = { g: d, tail: body.children[dog.body.children.indexOf(dog.tail)], head }; ED.dogKind = dog.kind;
}
function edOpen() {
  if (!ED.built) edBuild(); else edPetClone();
  ED.on = true; ED.closing = false; ED.rot = ED.rotTo = 0; ED.t = 0;
  ED.rig.add(pb); pb.rotation.y = 0;
  document.body.classList.add('dressing');
  const w = $('ward'); w.classList.remove('out'); void w.offsetWidth; w.classList.add('in');
}
/* returns true once the closing fade has finished, so closeWardrobe can hide the panel */
function edClose() {
  if (ED.ok) return true;
  if (ED.closing) return false;
  ED.closing = true; const w = $('ward'); w.classList.remove('in'); w.classList.add('out');
  setTimeout(() => { ED.on = false; pip.add(pb); pb.rotation.y = 0; document.body.classList.remove('dressing'); ED.ok = true; closeWardrobe(); ED.ok = false; ED.closing = false; w.classList.remove('out'); }, reduced ? 60 : 260);
  return false;
}
function edSpin(dir, full) { ED.rotTo += dir * (full ? Math.PI * 2 : Math.PI / 2); ED.hop = full ? 1 : 0.5; Snd.play('pop', { gain: 0.35, f: full ? 820 : 640 + dir * 60 }); }
const edRay = new T.Raycaster(), edV2 = new T.Vector2();
if ($('edStage')) {
  let drag = null;
  const st = $('edStage');
  st.addEventListener('pointerdown', (e) => { Snd.init(); drag = { x: e.clientX, y: e.clientY, r: ED.rotTo, moved: false }; try { st.setPointerCapture(e.pointerId); } catch (er) {} });
  st.addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 8) drag.moved = true; if (drag.moved) { ED.rotTo = drag.r + dx * 0.012; ED.rot = ED.rotTo; } });
  st.addEventListener('pointerup', (e) => {
    const d = drag; drag = null; if (!d || d.moved || !ED.cam) return;
    const r = renderer.domElement.getBoundingClientRect(); edV2.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); edRay.setFromCamera(edV2, ED.cam);
    const hitA = edRay.intersectObjects(ED.arrows)[0]; if (hitA) { const u = hitA.object.userData; u.base = 0.8; edSpin(u.dir, u.full); return; }
    if (ED.dog && edRay.intersectObject(ED.dog.g, true).length) { ED.dogHop = 1; petVoice(dog.kind || 'dog', 0.5); return; }
    if (edRay.intersectObject(ED.rig, true).length) edSpin(1, true);
  });
  st.addEventListener('pointercancel', () => { drag = null; });
  document.querySelectorAll('.edTab').forEach((b, i) => b.addEventListener('click', () => { if (ED.tab === i) return; ED.tab = i; edRows(); Snd.play('pop', { gain: 0.3, f: 520 + i * 90 }); }));
}
/* drawn instead of the farm while dressing */
function edRender(dt) {
  ED.t += dt;
  const sz = renderer.getSize(edV2), W = sz.x, H = sz.y, port = W < H;
  /* the panel covers one side: shift the view so Pip stands in the middle of the free part */
  const panel = $('edPanel'), pr = panel ? panel.getBoundingClientRect() : null;
  const offX = pr && !port ? Math.min(W * 0.3, (W - pr.left) / 2) : 0, offY = pr && port ? Math.min(H * 0.32, (H - pr.top) / 2) : 0;
  const key = W + ',' + H + ',' + Math.round(offX) + ',' + Math.round(offY);
  if (key !== ED.off) { ED.off = key; ED.cam.aspect = W / H; ED.cam.setViewOffset(W, H, offX, offY, W, H); ED.cam.updateProjectionMatrix(); }
  const free = port ? W / (H - offY * 2) : (W - offX * 2) / H;
  const dist = port ? 10.2 + Math.max(0, 0.9 - free) * 7 : 7.9 + Math.max(0, 0.8 - free) * 5;
  ED.cam.position.set(0.3, 1.5 + dist * 0.1, dist); ED.cam.lookAt(0, port ? 0.95 : 0.85, 0);
  /* spin toward the target; a little hop on taps */
  ED.rot += (ED.rotTo - ED.rot) * Math.min(1, dt * 7); ED.rig.rotation.y = ED.rot + (reduced ? 0 : Math.sin(ED.t * 0.7) * 0.06);
  ED.hop = Math.max(0, ED.hop - dt * 2.2); ED.rig.position.y = reduced ? 0 : Math.sin(ED.hop * Math.PI) * 0.18 * (ED.hop > 0 ? 1 : 0);
  if (ED.dog) { ED.dogHop = Math.max(0, ED.dogHop - dt * 2.5); ED.dog.g.position.y = Math.sin(ED.dogHop * Math.PI) * 0.15; ED.dog.tail.rotation.y = reduced ? 0 : Math.sin(ED.t * 9) * 0.5; ED.dog.head.rotation.z = reduced ? 0 : Math.sin(ED.t * 0.9) * 0.12; }
  ED.arrows.forEach((m, i) => { const u = m.userData; u.base += (1 - u.base) * Math.min(1, dt * 6); m.scale.set(u.base, 0.86 * u.base, 1); if (!reduced) m.position.y = 0.03; });
  renderer.render(ED.sc, ED.cam);
}
{ const st = document.createElement('style'); st.textContent = `
body.dressing > *:not(#ward):not(#scene) { visibility: hidden !important; }
.ward { background: transparent !important; display: block; z-index: 30; }
.ward[hidden] { display: none; }
.edStage { position: absolute; inset: 0; touch-action: none; }
.ward::before { content: ''; position: absolute; inset: 0; background: #1c130e; opacity: 0; pointer-events: none; z-index: 2; transition: opacity 0.26s ease; }
.ward.in::before { animation: edVeil 0.45s ease-out; } .ward.out::before { opacity: 1; }
@keyframes edVeil { from { opacity: 1; } to { opacity: 0; } }
.edPanel { position: absolute; z-index: 1; box-sizing: border-box; display: flex; flex-direction: column; padding: 10px 12px 12px; border-radius: 22px;
  right: max(14px, env(safe-area-inset-right, 0px)); top: 50%; transform: translateY(-50%); width: min(470px, 47vw); max-height: calc(100% - 24px);
  background: repeating-linear-gradient(93deg, rgba(255,220,170,0.07) 0 3px, rgba(0,0,0,0.05) 3px 7px, rgba(0,0,0,0) 7px 15px), linear-gradient(170deg, #9a6a42, #6e4426 60%, #7d5232);
  box-shadow: inset 0 2px 0 rgba(255,220,170,0.35), inset 0 -3px 0 rgba(0,0,0,0.25), 0 0 0 3px #3a2416, 0 10px 0 3px rgba(20,12,6,0.45), 0 18px 34px rgba(0,0,0,0.45); }
.ward.in .edPanel { animation: edIn 0.38s cubic-bezier(.2,1.3,.5,1); }
@keyframes edIn { from { transform: translateY(-50%) translateX(40px); opacity: 0; } }
.edTabs { display: flex; gap: 6px; padding: 0 6px; position: relative; z-index: 1; margin-bottom: -4px; }
.edTab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; height: 62px; padding: 4px 8px 6px; border-radius: 16px 16px 4px 4px; border: 3px solid #3a2416; border-bottom: 0;
  background: linear-gradient(#e2c99c, #cdb083); color: #4a2e1a; font: 700 22px Fredoka, system-ui, sans-serif; transform: translateY(6px) rotate(-1deg); box-shadow: inset 0 -6px 8px rgba(80,50,20,0.18); transition: transform 0.15s; }
.edTab:nth-child(2) { transform: translateY(6px) rotate(0.8deg); } .edTab:nth-child(3) { transform: translateY(6px) rotate(-0.5deg); }
.ward .edTab svg { width: 46px; height: 46px; margin: -4px 0; flex: none; display: block; }
.edTab.on { background: linear-gradient(#fffaf0, #fbf1dc); transform: translateY(0) rotate(0); box-shadow: none; color: #3a2416; }
.edTab:active { transform: translateY(3px); }
.edPage { position: relative; flex: 1 1 auto; min-height: 0; overflow-y: auto; border-radius: 6px 6px 14px 14px; border: 3px solid #3a2416; padding: 14px 12px 12px;
  background: radial-gradient(circle at 30% 20%, #fffaf0, #f6e8c9 60%, #ecd8ae); box-shadow: inset 0 0 0 7px rgba(255,250,240,0.0), inset 0 0 22px rgba(140,95,45,0.25); }
.edPage::before { content: ''; position: absolute; inset: 7px; border: 2.5px dashed rgba(122,82,46,0.55); border-radius: 10px; pointer-events: none; }
.ward .wardRows { display: flex; flex-direction: column; gap: 0; }
.ward .wrow { position: relative; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px 12px; padding: 12px 4px 18px; }
.ward .wrow + .wrow::before { content: ''; position: absolute; left: 4%; right: 4%; top: -5px; height: 9px; border-radius: 5px; background: linear-gradient(#b98a58, #8a5c36); box-shadow: 0 3px 0 rgba(80,50,25,0.3), inset 0 1px 0 rgba(255,225,180,0.5); }
.ward .sw { position: relative; width: 62px; height: 62px; padding: 5px; border-radius: 50%; border: 3px solid #6e4426; background: radial-gradient(circle at 40% 35%, #fffdf6, #f2e3c4); box-shadow: 0 3px 0 rgba(80,50,25,0.3); display: grid; place-items: center; transition: transform 0.12s; }
.ward .sw svg { width: 100%; height: 100%; display: block; }
.ward .sw.on { transform: scale(1.1); box-shadow: 0 0 0 3px #fffaf0, 0 4px 0 3px rgba(80,50,25,0.25); border-color: #3f7d3a; background: radial-gradient(circle at 40% 35%, #ffffff, #e8f3d6); }
/* the selected one wears a twisted rope ring with a leaf and a green check */
.ward .sw.on::before { content: ''; position: absolute; inset: -11px; border-radius: 50%; background: repeating-conic-gradient(#e0bd82 0 9deg, #a8743f 9deg 15deg, #c99a5e 15deg 20deg);
  -webkit-mask: radial-gradient(circle, transparent 0 calc(50% - 8px), #000 calc(50% - 7px) calc(50% - 1px), transparent 50%); mask: radial-gradient(circle, transparent 0 calc(50% - 8px), #000 calc(50% - 7px) calc(50% - 1px), transparent 50%); pointer-events: none; }
.ward .sw.on::after { content: ''; position: absolute; right: -9px; bottom: -7px; width: 24px; height: 24px; border-radius: 50%; border: 2.5px solid #fffaf0;
  background: #3f8f46 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 12.5 L10.5 17 L18 8' fill='none' stroke='%23fff' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/100% no-repeat; box-shadow: 0 2px 0 rgba(0,0,0,0.25); }
.ward .sw:active { transform: scale(0.92); }
.ward .wardDone { align-self: center; display: flex; align-items: center; gap: 6px; width: auto; height: 64px; margin-top: 12px; padding: 6px 30px 6px 18px; border-radius: 18px; border: 3px solid #1f4d27;
  background: repeating-linear-gradient(95deg, rgba(255,255,255,0.06) 0 4px, rgba(0,0,0,0) 4px 11px), linear-gradient(#6cc46a, #3f9a4a 55%, #2f7d3a); color: #fff6e4; font: 700 30px Fredoka, system-ui, sans-serif; text-shadow: 0 2px 0 rgba(20,60,25,0.6);
  box-shadow: inset 0 3px 0 rgba(255,255,255,0.35), 0 6px 0 #1f4d27, 0 9px 12px rgba(0,0,0,0.35); }
.ward .wardDone svg { width: 40px; height: 40px; display: block; filter: drop-shadow(0 2px 0 rgba(20,60,25,0.6)); }
.ward .wardDone:active { transform: translateY(5px); box-shadow: inset 0 3px 0 rgba(255,255,255,0.35), 0 1px 0 #1f4d27; }
@media (orientation: portrait) {
  .edPanel { left: max(10px, env(safe-area-inset-left, 0px)); right: max(10px, env(safe-area-inset-right, 0px)); top: auto; bottom: max(10px, env(safe-area-inset-bottom, 0px)); transform: none; width: auto; max-height: 56%; }
  @keyframes edIn { from { transform: translateY(40px); opacity: 0; } }
}
@media (max-height: 560px) and (orientation: landscape) {
  .edPanel { padding: 6px 8px 8px; max-height: calc(100% - 12px); }
  .edTab { height: 44px; font-size: 17px; } .edTab svg { width: 28px; height: 28px; }
  .edPage { padding: 8px 8px 6px; } .ward .wrow { gap: 8px 9px; padding: 9px 2px 13px; } .ward .sw { width: 44px; height: 44px; padding: 3px; border-width: 2.5px; }
  .ward .sw.on::before { inset: -8px; } .ward .sw.on::after { width: 18px; height: 18px; right: -6px; bottom: -5px; }
  .ward .wardDone { height: 46px; font-size: 22px; margin-top: 6px; } .ward .wardDone svg { width: 28px; height: 28px; }
}
@media (max-width: 480px) { .ward .sw { width: 48px; height: 48px; padding: 3px; } .ward .wrow { gap: 8px; } .edTab { font-size: 17px; height: 50px; } .edTab svg { width: 28px; height: 28px; } }
@media (prefers-reduced-motion: reduce) { .ward.in .edPanel, .ward.in::before { animation: none; } }
`; document.head.appendChild(st); }

if (window.__farmTest) window.__ed = { open: () => openWardrobe(), close: () => closeWardrobe(), info: () => renderer.info.render.calls, scr: (w) => { const v = new T.Vector3(); (w === 'dog' ? ED.dog.g : w === 'pip' ? ED.rig : ED.arrows[w]).getWorldPosition(v); v.project(ED.cam); const r = renderer.domElement.getBoundingClientRect(); return [(v.x + 1) / 2 * r.width + r.left, (1 - v.y) / 2 * r.height + r.top]; }, st: () => ({ rot: ED.rotTo, hop: ED.dogHop, av }) };
