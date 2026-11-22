/* ---------- market look: plank stalls with scalloped awnings and props, a wooden coin tray, a friendlier truck and iron lamp posts ---------- */
/* Helpers here are called while market.js and town.js build (before this file's top level), so state lives in FL (var, see farmlook.js). */

/* a striped awning cloth with a scalloped edge, one material per colour */
function mlAwningMat(col) {
  FL = FL || {}; FL.awn = FL.awn || {}; if (FL.awn[col]) return FL.awn[col];
  const W = 256, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), n = 6, sw = W / n, sc0 = H - 34;
  for (let k = 0; k < n; k++) { x.fillStyle = k % 2 ? '#fbf1dc' : col; x.fillRect(k * sw, 0, sw, sc0);
    /* scallop under each stripe */
    x.beginPath(); x.moveTo(k * sw, sc0 - 1); x.arc(k * sw + sw / 2, sc0 - 1, sw / 2, Math.PI, 0, true); x.closePath(); x.fill(); }
  /* soft folds and a faint weave */
  for (let i = 0; i < W; i += 4) { x.fillStyle = 'rgba(0,0,0,' + (0.03 + 0.04 * (0.5 + 0.5 * Math.sin(i / W * Math.PI * n * 2))) + ')'; x.fillRect(i, 0, 2, H); }
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(0.7, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(60,30,10,0.18)'); x.globalCompositeOperation = 'source-atop'; x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'source-over'; x.strokeStyle = 'rgba(255,255,255,0.55)'; x.setLineDash([5, 5]); x.lineWidth = 2; x.beginPath(); x.moveTo(0, 10); x.lineTo(W, 10); x.stroke();
  const t = new T.CanvasTexture(c); t.anisotropy = 4;
  FL.awn[col] = new T.MeshStandardMaterial({ map: t, side: T.DoubleSide, alphaTest: 0.5, roughness: 0.95, metalness: 0 }); return FL.awn[col];
}
/* a market booth: plank body with a painted front band, a thick plank top, rough posts, a curved scalloped awning and a front beam */
function mlBooth(g, cap, o) {
  const { W, H, D, px, pz, ay, col } = o, pm = flPlankMat(), L = [], P = at(0, 0, 0, L);
  const planks = (w, h, d, vert) => { const b = new T.BoxGeometry(w, h, d); const uv = b.attributes.uv; for (let i = 0; i < uv.count; i++) { const u = uv.getX(i), v = uv.getY(i); if (vert) uv.setXY(i, v * w * 2.2, u); else uv.setXY(i, u * w * 0.9, v * Math.max(0.3, h * 3)); } return b; };
  const add = (geo, paint, x, y, z) => { const m = new T.Mesh(fac(geo, paint), pm); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); return m; };
  /* body and top */
  add(planks(W, H - 0.1, D, true), (cx, cy, cz, i) => tone('#a8714d', i, 0.5).multiplyScalar(0.78 + 0.3 * clamp((cy + H / 2) / H, 0, 1)), 0, 0.05 + (H - 0.1) / 2, 0);
  add(planks(W + 0.02, 0.2, 0.03, true), (cx, cy, cz, i) => tone(col, i, 0.4).lerp(new T.Color('#fbf1dc'), 0.15), 0, 0.3, D / 2 + 0.005);
  add(planks(W + 0.16, 0.08, D + 0.14, false), (cx, cy, cz, i) => tone('#d9b783', i, 0.4).multiplyScalar(0.92 + 0.12 * clamp(cy / 0.04, 0, 1)), 0, H + 0.02, 0.02);
  P(box(W + 0.04, 0.08, D + 0.04), '#5e3f2a', 1500, 0, 0.04, 0);
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => P(box(0.07, H, 0.07), '#7a5438', 1501, sx * W / 2, H / 2, sz * D / 2));
  /* posts and a front beam */
  [-px, px].forEach((x, k) => P(jit(box(0.08, ay + 0.05, 0.08, 1, 4, 1), 0.008, k), (cx, cy, cz, i) => tone('#7a5438', i, 0.8).multiplyScalar(0.75 + 0.35 * clamp(cy / ay, 0, 1)), 1502 + k, x, (ay + 0.05) / 2, pz));
  P(box(px * 2 + 0.16, 0.07, 0.07), '#6b4630', 1504, 0, ay - 0.04, pz + 0.04);
  merged(L, MAT, g);
  /* the awning: a bent cloth from the back high to the front beam, then the scalloped valance hanging over the front */
  const aw = new T.PlaneGeometry(px * 2 + 0.26, D + 0.4, 1, 6), p = aw.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i), t = (y + (D + 0.4) / 2) / (D + 0.4); p.setXYZ(i, p.getX(i), 0.42 * t - 0.12 * t * (1 - t) * 2, -(t - 0.5) * (D + 0.4) * 0.98 + 0.02); }
  aw.computeVertexNormals(); const uv = aw.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, 0.13 + uv.getY(i) * 0.87);
  const awm = new T.Mesh(aw, mlAwningMat(col)); awm.position.set(0, ay - 0.42 + 0.02, pz - (D + 0.4) / 2 + 0.06); awm.castShadow = true; awm.receiveShadow = true; g.add(awm);
  /* valance: uses the bottom (scalloped) strip of the texture */
  const va = new T.PlaneGeometry(px * 2 + 0.26, 0.2), vuv = va.attributes.uv; for (let i = 0; i < vuv.count; i++) vuv.setY(i, vuv.getY(i) * 0.2);
  const vm = new T.Mesh(va, mlAwningMat(col)); vm.position.set(0, ay - 0.1, pz + 0.06 + 0.04); vm.castShadow = true; g.add(vm);
  const scGeo = new T.BoxGeometry(px * 2 + 0.3, 0.04, D + 0.42); scGeo.rotateX(-0.42); snowCap(cap, scGeo, 0, ay + 0.03, pz - (D + 0.4) / 2 + 0.06);
}
/* props round a stall, by what it sells */
function mlStallProps(g, t, col) {
  const L = [], P = at(0, 0, 0, L), wood = (b) => (cx, cy, cz, i) => tone(b, i, 0.6).multiplyScalar(0.8 + 0.25 * clamp(cy / 0.4, 0, 1));
  const crate = (x, z, ry, sd) => { P(box(0.42, 0.28, 0.32), wood('#b08a5e'), sd, x, 0.14, z, { ry }); [0.05, 0.23].forEach((y) => P(box(0.44, 0.05, 0.34), '#8a6444', sd + 1, x, y, z, { ry })); };
  const basket = (x, z, sd) => { P(new T.CylinderGeometry(0.2, 0.15, 0.18, 12, 2, true), (cx, cy, cz, i) => tone(hash(Math.floor((Math.atan2(cz, cx) + 4) * 4), Math.floor(cy * 30)) > 0.5 ? '#c9a46a' : '#a8804a', i, 0.3), sd, x, 0.09, z); P(new T.CylinderGeometry(0.15, 0.15, 0.02, 12), '#8a6444', sd + 1, x, 0.01, z); P(new T.TorusGeometry(0.2, 0.02, 4, 16).rotateX(Math.PI / 2), '#8a6444', sd + 2, x, 0.18, z); };
  crate(0.98, -0.05, 0.25, 1600); crate(1.02, 0.05, -0.1, 1610); /* stacked: second one sits on the first */
  L[L.length - 1].translate(0, 0, 0); for (let k = L.length - 3; k < L.length; k++) L[k].translate(0, 0.29, 0);
  basket(-1.0, 0.25, 1620);
  const goods = { egg: () => { for (let j = 0; j < 6; j++) P(ico(0.05, 1, j).scale(0.85, 1.1, 0.85), j % 2 ? '#fffaf0' : '#e8c9a0', 1630 + j, -1.0 + ((j % 3) - 1) * 0.08, 0.2, 0.25 + (Math.floor(j / 3) - 0.5) * 0.09); },
    apple: () => { for (let j = 0; j < 7; j++) P(ico(0.06, 1, j), j % 3 ? '#d9473a' : '#8cbf4a', 1630 + j, -1.0 + Math.cos(j) * 0.08, 0.2 + (j > 4 ? 0.06 : 0), 0.25 + Math.sin(j) * 0.08); },
    milk: () => { [[-1.0, 0.25], [-1.12, -0.05]].forEach(([x, z], j) => { P(new T.CylinderGeometry(0.1, 0.12, 0.3, 12), '#d4dae0', 1630 + j, x, 0.15, z); P(new T.CylinderGeometry(0.05, 0.08, 0.08, 10), '#c4ccd4', 1640 + j, x, 0.34, z); P(new T.TorusGeometry(0.06, 0.012, 4, 10), '#8a8f98', 1650 + j, x, 0.4, z); }); },
    cake: () => { P(new T.CylinderGeometry(0.16, 0.16, 0.12, 14), '#f6e2c4', 1630, -1.0, 0.24, 0.25); P(new T.CylinderGeometry(0.165, 0.165, 0.04, 14), PAL.blush, 1631, -1.0, 0.31, 0.25); P(ico(0.035, 0), PAL.accent, 1632, -1.0, 0.35, 0.25); } };
  (goods[t] || goods.egg)();
  /* a little pot of flowers by the front post */
  P(new T.CylinderGeometry(0.1, 0.075, 0.16, 10), '#c8734a', 1660, 0.62, 0.08, 0.55); P(fluff(0.1, 1661, 5), (cx, cy, cz, i) => leafY('#5d9160', cy, -0.08, 0.12, i), 1661, 0.62, 0.24, 0.55);
  for (let j = 0; j < 3; j++) P(ico(0.03, 0, j), ['#f6b8c8', '#f2c14a', '#fffbf4'][j], 1662 + j, 0.58 + j * 0.04, 0.33, 0.55 + (j % 2) * 0.03);
  merged(L, MAT, g);
}
/* the floating sign over each stall: parchment like the speech bubbles */
function mlSignTex(t) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 160; const x = c.getContext('2d');
  x.save(); x.shadowColor = 'rgba(70,40,18,0.4)'; x.shadowBlur = 8; x.shadowOffsetY = 5; x.fillStyle = '#f3e2bf'; x.beginPath(); x.roundRect ? x.roundRect(12, 10, 232, 132, 36) : x.rect(12, 10, 232, 132); x.fill(); x.restore();
  const g = x.createRadialGradient(110, 50, 8, 128, 76, 140); g.addColorStop(0, '#fffdf6'); g.addColorStop(1, '#efdcb4'); x.fillStyle = g; x.beginPath(); x.roundRect ? x.roundRect(12, 10, 232, 132, 36) : x.rect(12, 10, 232, 132); x.fill(); x.lineWidth = 5; x.strokeStyle = '#6e4426'; x.stroke();
  x.setLineDash([7, 5]); x.lineWidth = 2.4; x.strokeStyle = 'rgba(150,105,60,0.6)'; x.beginPath(); x.roundRect ? x.roundRect(24, 22, 208, 108, 26) : x.rect(24, 22, 208, 108); x.stroke(); x.setLineDash([]);
  drawIcon(x, t, 128, 78, 1.4); return new T.CanvasTexture(c);
}
/* the money spot by a stall: a round wooden tray instead of a flat paper disc that the grass poked through */
function mlCoinTray() {
  const L = [], P = at(0, 0, 0, L);
  P(new T.CylinderGeometry(0.5, 0.52, 0.05, 20), (cx, cy, cz, i) => tone('#b08a5e', Math.floor((cx + 1) * 6) * 3.1, 0.6), 1700, 0, 0.025, 0);
  P(new T.TorusGeometry(0.5, 0.035, 5, 24).rotateX(Math.PI / 2), '#7a5438', 1701, 0, 0.05, 0);
  const m = merged(L, MAT, new T.Group()); m.castShadow = false; return m.parent;
}
/* the flatbed truck: tyres with hubs, mudguards, a grille and bumper, round headlights and plank sides on the bed */
function mlTruck(body, g) {
  const L = [], P = at(0, 0, 0, L);
  /* bonnet in front of the cab, rounded a little */
  P(jit(box(0.86, 0.34, 0.38, 2, 2, 2), 0.01, 3), (cx, cy, cz, i) => tone(PAL.sea, i, 0.4).multiplyScalar(0.85 + 0.2 * clamp((cy - 0.4) / 0.35, 0, 1)), 1800, 0, 0.55, 1.08);
  P(box(0.7, 0.2, 0.03), '#3a3f48', 1801, 0, 0.55, 1.275); for (let k = 0; k < 5; k++) P(box(0.66, 0.018, 0.035), '#c9ccd0', 1802, 0, 0.47 + k * 0.04, 1.28);
  P(box(1.02, 0.09, 0.12), '#c9ccd0', 1803, 0, 0.36, 1.31);
  [-0.32, 0.32].forEach((x) => { P(new T.CylinderGeometry(0.075, 0.075, 0.05, 12).rotateX(Math.PI / 2), '#c9ccd0', 1804, x, 0.68, 1.27); });
  /* mudguards over the wheels and a step */
  [[-0.5, 0.62], [0.5, 0.62], [-0.5, -0.6], [0.5, -0.6]].forEach(([x, z]) => { const f = new T.CylinderGeometry(0.25, 0.25, 0.16, 12, 1, true, -Math.PI / 2, Math.PI); f.rotateZ(Math.PI / 2); P(f, '#2f5f66', 1805, x * 1.02, 0.22, z); });
  [-0.5, 0.5].forEach((x) => P(box(0.1, 0.04, 0.3), '#3a3f48', 1806, x * 1.05, 0.3, 0.1));
  /* mirror */
  [-1, 1].forEach((s) => { P(box(0.02, 0.02, 0.12), '#3a3f48', 1807, s * 0.52, 0.86, 0.85); P(box(0.03, 0.1, 0.07), '#c9ccd0', 1808, s * 0.56, 0.86, 0.8); });
  merged(L, MAT, body);
  /* hubs on the tyres */
  const H = []; const Q = at(0, 0, 0, H);
  [[-0.5, 0.62], [0.5, 0.62], [-0.5, -0.6], [0.5, -0.6]].forEach(([x, z], k) => { Q(new T.CylinderGeometry(0.09, 0.09, 0.17, 10).rotateZ(Math.PI / 2), '#d9d4cc', 1810 + k, x, 0.2, z); Q(new T.CylinderGeometry(0.03, 0.03, 0.18, 6).rotateZ(Math.PI / 2), '#8a8f98', 1814 + k, x, 0.2, z); });
  merged(H, MAT, g);
}
/* iron street lamp: a stone foot, a dark green post with collars, a four-pane lantern with a little roof and finial */
function mlLamp(P) {
  const IRON = '#2f3d38', BRASS = '#c9a24a';
  P(new T.CylinderGeometry(0.16, 0.2, 0.14, 8), (cx, cy, cz, i) => tone('#b8ac9a', i, 0.6), 741, 0, 0.07, 0);
  P(new T.CylinderGeometry(0.1, 0.13, 0.22, 8), IRON, 742, 0, 0.25, 0);
  P(new T.CylinderGeometry(0.045, 0.055, 1.25, 8), (cx, cy, cz, i) => tone(IRON, i, 0.4).multiplyScalar(0.8 + 0.3 * clamp(cy / 1.5, 0, 1)), 743, 0, 0.98, 0);
  [0.42, 1.5].forEach((y) => P(new T.TorusGeometry(0.06, 0.018, 4, 10).rotateX(Math.PI / 2), BRASS, 744, 0, y, 0));
  P(new T.CylinderGeometry(0.09, 0.06, 0.06, 8), IRON, 745, 0, 1.58, 0);
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([x, z]) => P(box(0.025, 0.26, 0.025), IRON, 746, x * 0.11, 1.72, z * 0.11));
  P(box(0.26, 0.03, 0.26), IRON, 747, 0, 1.6, 0);
  P(new T.ConeGeometry(0.2, 0.14, 4).rotateY(Math.PI / 4), IRON, 748, 0, 1.92, 0); P(ico(0.035, 0), BRASS, 749, 0, 2.02, 0);
}
function marketlookStep(dt) {}
/* the farm crate's little market awning: the same scalloped cloth as the stalls */
if (typeof CRATES !== 'undefined') CRATES.forEach((c) => { const g = c.g; if (!g) return;
  g.children.filter((m) => m.isMesh && Math.abs(m.position.y - 1.02) < 0.01).forEach((m) => g.remove(m));
  const aw = new T.PlaneGeometry(1.2, 0.5, 1, 3), p = aw.attributes.position; for (let i = 0; i < p.count; i++) { const t = (p.getY(i) + 0.25) / 0.5; p.setXYZ(i, p.getX(i), 0.16 * t, -0.16 - (t - 0.5) * 0.46); }
  aw.computeVertexNormals(); const uv = aw.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, 0.13 + uv.getY(i) * 0.87);
  const m = new T.Mesh(aw, mlAwningMat(PAL.accent)); m.position.set(0, 0.92, -0.38); m.castShadow = true; g.add(m);
  const va = new T.PlaneGeometry(1.2, 0.14), vu = va.attributes.uv; for (let i = 0; i < vu.count; i++) vu.setY(i, vu.getY(i) * 0.2);
  const v = new T.Mesh(va, mlAwningMat(PAL.accent)); v.position.set(0, 0.86, -0.38 + 0.08); g.add(v); });
/* the day dial in the corner: compact by default (just the dial), a tap opens the season row for a few seconds */
{
  const css = `
.clock { pointer-events: auto !important; cursor: pointer; -webkit-tap-highlight-color: transparent; padding-right: 6px !important; transition: padding 0.25s ease; }
.clock .cal { max-width: 0; max-height: 0; opacity: 0; overflow: hidden; transition: max-width 0.3s ease, max-height 0.3s ease, opacity 0.2s ease; }
.clock.open { padding-right: 14px !important; }
.clock.open .cal { max-width: 320px; max-height: 120px; opacity: 1; overflow: visible; }
.clock:not(.open) { gap: 0 !important; padding: 5px !important; border-radius: 50% !important; }
.clock:active .dial { transform: scale(0.94); }
.clock .dial { transition: transform 0.12s ease; }
@media (prefers-reduced-motion: reduce) { .clock, .clock .cal, .clock .dial { transition: none; } }
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const el = $('clock');
  if (el) {
    let t = 0; const set = (open) => { el.classList.toggle('open', open); el.setAttribute('aria-expanded', String(open)); clearTimeout(t); if (open) t = setTimeout(() => set(false), 6000); };
    el.setAttribute('role', 'button'); el.tabIndex = 0; set(false);
    const tap = (e) => { e.stopPropagation(); e.preventDefault(); set(!el.classList.contains('open')); if (typeof Snd !== 'undefined') Snd.play('pop', { gain: 0.3, f: 520 }); };
    el.addEventListener('pointerdown', (e) => e.stopPropagation()); el.addEventListener('click', tap);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') tap(e); });
    FL.clockOpen = set;
  }
}
/* when a new season starts, open the season row for a moment so the change is seen */
{ const st0 = seasonToast; seasonToast = (s) => { st0(s); if (FL.clockOpen) FL.clockOpen(true); }; }
