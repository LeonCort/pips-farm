/* ---------- the mouse pointer (Leon, 2026-11-27: "a custom mouse pointer style in the theme that varies depending on
   what you hover above: mining, cutting, picking") ----------
   A cream arrow with the game's brown outline. Over something Pip can do, a round badge beside the arrow shows the
   doing: the axe over a tree, the pickaxe over rock and ore, a hand over berries and other things picked by hand, a
   coin over a price sign, a hammer over a building ring, a heart over a friend, a sail over a dock, and a lock over
   what Pip's tool or gear is not yet good enough for. Only a mouse has a pointer; a finger never sees this. */
const CUR = { css: {}, now: '', e: null };
function curCss(t) {
  if (CUR.css[t]) return CUR.css[t];
  const make = (k) => { const c = document.createElement('canvas'); c.width = c.height = 52 * k; const x = c.getContext('2d'); x.scale(k, k); x.lineJoin = 'round'; x.lineCap = 'round';
    if (t !== 'arrow') { x.beginPath(); x.arc(33, 33, 16.5, 0, 7); x.fillStyle = t === 'lock' ? '#e9dcc4' : '#fff6e4'; x.fill(); x.lineWidth = 3; x.strokeStyle = '#8a5a32'; x.stroke();
      x.save(); if (t === 'hand' || t === 'heart') drawIcon(x, t, 33, 33.5, 0.36); else if (t === 'sail') { x.translate(33, 33.5); x.scale(0.5, 0.5); x.lineWidth = 3; x.strokeStyle = PAL.ink; loopIcon(x, 'travel'); } else isleIcon(x, t, 33, 33.5, 0.5); x.restore(); }
    x.beginPath(); x.moveTo(4, 3); x.lineTo(4, 23); x.lineTo(9.5, 18.5); x.lineTo(13.5, 26.5); x.lineTo(17.5, 24.5); x.lineTo(13.5, 16.8); x.lineTo(20.5, 16.2); x.closePath();
    x.lineWidth = 5; x.strokeStyle = '#6e4426'; x.stroke(); x.fillStyle = '#fff6e4'; x.fill(); x.lineWidth = 1.2; x.strokeStyle = '#6e4426'; x.stroke();
    return c.toDataURL(); };
  const a = make(1), b = make(2);
  return (CUR.css[t] = ['url(' + a + ') 4 3, auto', '-webkit-image-set(url(' + b + ') 2x, url(' + a + ') 1x) 4 3, auto', 'image-set(url(' + b + ') 2x, url(' + a + ') 1x) 4 3, auto']);
}
function curSet(t) { if (t === CUR.now) return; CUR.now = t; const c = curCss(t); [wrap, document.body].forEach((el) => c.forEach((v) => { el.style.cursor = v; })); } /* a value the browser does not know is ignored, so the last one it knows stays */
/* what is under the pointer, as the name of a picture */
function curWhat(x, z) {
  const near = (px, pz, r) => Math.hypot(px - x, pz - z) < r;
  for (const s of signs) if (s.x != null && near(s.x, s.z, 1.0)) return s.kind === 'person' ? 'heart' : 'coin';
  for (const c of chests) if (!c.open && near(c.x, c.z, 0.9)) return 'gem';
  for (const k in SPOT_AT) if (near(SPOT_AT[k][0], SPOT_AT[k][1], 0.85) && (!/^ham_/.test(k) || state.isle.mon && state.isle.mon[k.slice(4)])) return 'hammer';
  for (const k in DK.d) if (near(DOCKS[k].x + DOCKS[k].out[0] * 0.8, DOCKS[k].z + DOCKS[k].out[1] * 0.8, 1.6)) return 'sail';
  if (near(FERRY.x - 1.5, FERRY.z, 1.8)) return 'sail';
  for (const k in GF.box) { const g = GF.box[k].g; if (g && g.visible && near(g.position.x, g.position.z, 0.8)) return 'star'; }
  const P = [SM.g, BK.g].concat(Object.keys(LP.folk).map((k) => LP.folk[k].g)); for (const g of P) if (g && g.visible && near(g.position.x, g.position.z, 0.8)) return 'heart';
  let best = null, bd = 1e9; for (const n of nodes) { if (n.kind === 'grass' || n.kind === 'tall' || !canWork(n) || Math.abs(n.x - x) > 2) continue; const d = Math.hypot(n.x - x, n.z - z) - (NODE_R[n.kind] || 0.4); if (d < bd) { bd = d; best = n; } }
  if (best && bd < 0.45) { if (gated(best)) return 'lock'; return best.kind === 'tree' || best.kind === 'planks' ? 'axe' : toolKind(best.kind) ? 'pick' : 'hand'; }
  return 'arrow';
}
function curMove(e) {
  if (e && e.pointerType && e.pointerType !== 'mouse') return; if (e) CUR.e = { x: e.clientX, y: e.clientY }; if (!CUR.e) return;
  let t = 'arrow'; try { const r = canvas.getBoundingClientRect(); ndc.set((CUR.e.x - r.left) / r.width * 2 - 1, -(CUR.e.y - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, cam); const v = new T.Vector3(); if (curveHit(ray.ray, v) && !inHouse) t = curWhat(v.x, v.z); } catch (er) {}
  curSet(t);
}
wrap.addEventListener('pointermove', curMove); curSet('arrow');
setInterval(() => { if (CUR.e) curMove(null); }, 400); /* the world moves under a still pointer too */
{ const st = document.createElement('style'); const h = curCss('hand'); st.textContent = 'button,.trvBtn,[role=button]{cursor:' + h[0] + ';cursor:' + h[1] + ';cursor:' + h[2] + '}'; document.head.appendChild(st); }
