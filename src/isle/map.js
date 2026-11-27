/* ---------- the map (Leon, 2026-11-25: "a map icon, pressing it to show an overhead view") ----------
   A round button under the hammer opens a drawn map of the whole world, seen from straight above. Pictures only:
   - islands in their own colours, with the thing that grows there in the corner; squares Pip does not own yet are pale
     with a padlock, and the ones that can be bought right now have a gold dashed edge;
   - bridges: planks once built; a dashed line with the key it needs while it waits;
   - the camp, every friend's face where they are now (a grey "?" where one still hides), the monuments (pale until built),
     the stairs to the cave, the boat to the farm;
   - a red marker that pulses where Pip stands.
   Tap anywhere to close. The map is a canvas drawn when it opens: it costs nothing while it is shut. */
const MP = { hint: null, hints: [], btn: null, el: null, cv: null, pip: null, S: 16, x0: -35, z0: -39, w: 70, h: 78 };
const MAP_COL = { home: '#9fd36a', rocks: '#b7c888', berry: '#86cc68', meadow: '#c4e56e', orchard: '#d9df78', stone: '#b9b7ab', clay: '#cfa880', snow: '#f4f8fd', cave: '#8a8074', marsh: '#8fbf6c', coral: '#f3e3b0', ember: '#7a675c' };
const MAP_RES = { home: 'log', rocks: 'stone', berry: 'berry', meadow: 'berry', orchard: 'log', stone: 'stone', clay: 'stone', snow: 'crystal', cave: 'crystal', marsh: 'log', coral: 'crystal', ember: 'crystal' };
function mapXY(x, z) { return [(x - MP.x0) * MP.S, (z - MP.z0) * MP.S]; }
/* the button's picture: a folded map with an island and a red pin */
function mapPic(px) {
  const c = document.createElement('canvas'); c.width = c.height = px; const x = c.getContext('2d'); x.translate(px / 2, px / 2); x.scale(px / 64, px / 64); x.lineJoin = 'round'; x.lineCap = 'round'; x.lineWidth = 3; x.strokeStyle = PAL.ink;
  x.beginPath(); x.moveTo(-22, -14); x.lineTo(-8, -19); x.lineTo(8, -14); x.lineTo(22, -19); x.lineTo(22, 14); x.lineTo(8, 19); x.lineTo(-8, 14); x.lineTo(-22, 19); x.closePath(); x.fillStyle = '#8fd0ea'; x.fill(); x.stroke();
  x.beginPath(); x.ellipse(-3, 3, 11, 8, -0.3, 0, 7); x.fillStyle = '#9fd36a'; x.fill(); x.lineWidth = 2; x.stroke();
  x.lineWidth = 1.6; x.strokeStyle = 'rgba(58,36,20,.45)'; x.beginPath(); x.moveTo(-8, -19); x.lineTo(-8, 14); x.moveTo(8, -14); x.lineTo(8, 19); x.stroke();
  x.strokeStyle = PAL.ink; x.lineWidth = 2.4; x.beginPath(); x.moveTo(7, 2); x.quadraticCurveTo(-2, -10, 7, -17); x.quadraticCurveTo(16, -10, 7, 2); x.closePath(); x.fillStyle = '#e2483d'; x.fill(); x.stroke();
  x.beginPath(); x.arc(7, -9, 2.6, 0, 7); x.fillStyle = '#fff6e4'; x.fill();
  return c;
}
function mapBadge(x, px, pz, r, fill) { x.beginPath(); x.arc(px, pz, r, 0, 7); x.fillStyle = fill || '#fff6e4'; x.fill(); x.lineWidth = 3; x.strokeStyle = '#6e4426'; x.stroke(); }
function mapDraw() {
  const S = MP.S, W = MP.w * S, H = MP.h * S, x = MP.cv.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H); x.lineJoin = 'round'; x.lineCap = 'round';
  /* the sea */
  const sea = x.createLinearGradient(0, 0, 0, H); sea.addColorStop(0, '#7fcbe8'); sea.addColorStop(1, '#5fb4dc'); x.fillStyle = sea; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = 3; for (let k = 0; k < 46; k++) { const wx = hash(k, 301) * W, wz = hash(k, 302) * H; x.beginPath(); x.moveTo(wx - 14, wz); x.quadraticCurveTo(wx - 7, wz - 7, wx, wz); x.quadraticCurveTo(wx + 7, wz + 7, wx + 14, wz); x.stroke(); }
  const buy = {}; signs.forEach((s) => { if (s.A) buy[s.A.id] = 1; });
  const sq = (A, grow, r) => { const [px, pz] = mapXY(A.cx - 6 - grow, A.cz - 6 - grow); x.beginPath(); x.roundRect(px, pz, (12 + grow * 2) * S, (12 + grow * 2) * S, r * S); };
  /* owned land: a sand rim, then the grass, so squares of one island run together */
  AREAS.forEach((A) => { if (A.cave || !HAS[A.id]) return; sq(A, 0.55, 2.4); x.fillStyle = BIOME_BEACH[A.biome] || '#f0dfae'; x.fill(); });
  AREAS.forEach((A) => { if (A.cave || !HAS[A.id]) return; sq(A, 0.55, 2.4); x.lineWidth = 3; x.strokeStyle = 'rgba(58,36,20,.5)'; x.stroke(); });
  AREAS.forEach((A) => { if (A.cave || !HAS[A.id]) return; sq(A, 0.55, 2.4); x.fillStyle = BIOME_BEACH[A.biome] || '#f0dfae'; x.fill(); });
  AREAS.forEach((A) => { if (A.cave || !HAS[A.id]) return; sq(A, 0.08, 1.6); x.fillStyle = MAP_COL[A.biome]; x.fill(); });
  /* water inside an area: the marsh's channel and pond */
  AREAS.forEach((A) => { if (!A.holes || !HAS[A.id]) return; A.holes.forEach(([a, b]) => { const [px, pz] = mapXY((A.i + a) * GS - 1.5, (A.j + b) * GS - (A.holes.length > 1 ? 2.6 : 1.5)); x.beginPath(); x.roundRect(px, pz, 3 * S, (A.holes.length > 1 ? 5.2 : 3) * S, 1.2 * S); x.fillStyle = '#6fbfe0'; x.fill(); }); });
  /* land Pip does not own yet */
  AREAS.forEach((A) => { if (A.cave || HAS[A.id]) return; sq(A, -0.35, 1.6); x.fillStyle = buy[A.id] ? 'rgba(255,246,228,.5)' : 'rgba(255,255,255,.22)'; x.fill();
    x.setLineDash([14, 12]); x.lineWidth = buy[A.id] ? 6 : 3; x.strokeStyle = buy[A.id] ? '#f4b23a' : 'rgba(255,255,255,.75)'; x.stroke(); x.setLineDash([]);
    const [px, pz] = mapXY(A.cx, A.cz); x.globalAlpha = buy[A.id] ? 1 : 0.6; isleIcon(x, 'lock', px, pz, 1.25); x.globalAlpha = 1; });
  /* what grows there */
  AREAS.forEach((A) => { if (A.cave) return; const [px, pz] = mapXY(A.cx - 4.1, A.cz - 4.2); x.globalAlpha = HAS[A.id] ? 1 : 0.55; isleIcon(x, MAP_RES[A.biome], px, pz, 0.8); x.globalAlpha = 1; });
  /* the cave hill */
  { const A = AREA_BY.cave, [px, pz] = mapXY(A.cx, A.cz), [wx] = mapXY(AREA_BY.cave3.cx, A.cz); x.beginPath(); x.roundRect(wx - 5.6 * S, pz - 5.2 * S, px - wx + 11.2 * S, 10.4 * S, 5.2 * S); x.fillStyle = '#8a8074'; x.fill(); x.lineWidth = 3; x.strokeStyle = 'rgba(58,36,20,.5)'; x.stroke();
    x.beginPath(); x.ellipse(px - 8, pz - 10, 3.6 * S, 3.2 * S, 0, 0, 7); x.fillStyle = '#9c9184'; x.fill(); isleIcon(x, 'crystal', px - 3.2 * S, pz - 2.6 * S, 0.8); }
  /* bridges */
  AREAS.forEach((A) => { const B = A.bridge; if (!B) return; const [ax, az] = mapXY(B.x0, B.z0), [bx, bz] = mapXY(B.x1, B.z1);
    if (HAS[A.id]) { x.lineCap = 'butt'; x.lineWidth = 26; x.strokeStyle = '#6e4426'; x.beginPath(); x.moveTo(ax, az); x.lineTo(bx, bz); x.stroke(); x.lineWidth = 19; x.strokeStyle = '#c99f6c'; x.setLineDash([9, 3]); x.stroke(); x.setLineDash([]); x.lineCap = 'round'; }
    else if (HAS[B.from]) { x.lineWidth = 8; x.strokeStyle = '#f4b23a'; x.setLineDash([12, 12]); x.beginPath(); x.moveTo(ax, az); x.lineTo(bx, bz); x.stroke(); x.setLineDash([]);
      const k = LOOP_KEY[A.id], mx = (ax + bx) / 2, mz = (az + bz) / 2; if (k) { mapBadge(x, mx, mz, 30); isleIcon(x, k, mx, mz, 1.0); if (!lkeys()[k]) isleIcon(x, 'lock', mx + 22, mz + 20, 0.6); } } });
  SHORTS.forEach((S) => { if (!S.on) return; const B = S.bridge, [ax, az] = mapXY(B.x0, B.z0), [bx, bz] = mapXY(B.x1, B.z1); x.lineCap = 'butt'; x.lineWidth = 26; x.strokeStyle = '#6e4426'; x.beginPath(); x.moveTo(ax, az); x.lineTo(bx, bz); x.stroke(); x.lineWidth = 19; x.strokeStyle = '#c99f6c'; x.setLineDash([9, 3]); x.stroke(); x.setLineDash([]); x.lineCap = 'round'; });
  /* the special finds: a small picture where each one is found */
  AREAS.forEach((A) => { const seen = {}; (A.finds || []).forEach((f) => { const t = FIND_NODE[f[0]].t; if (seen[t]) return; seen[t] = 1; const [px, pz] = A.cave ? mapXY(A.cx, A.cz + 2.2) : mapXY(A.cx + 4.0, A.cz - 4.2);
    x.globalAlpha = A.cave || HAS[A.id] ? 1 : 0.6; mapBadge(x, px, pz, 19); isleIcon(x, t, px, pz, 0.62); x.globalAlpha = 1; }); });
  /* the stairs down, the boat to the farm, the camp */
  if (HAS.h3 && stairsDown) { const [px, pz] = mapXY(stairsDown.x, stairsDown.z); mapBadge(x, px, pz, 24, '#3b3348'); isleIcon(x, 'stairsDown', px, pz + 2, 0.75); }
  { const [px, pz] = mapXY(FERRY.x - 2.6, FERRY.z); isleIcon(x, 'travel', px, pz, 0.9); }
  { const [px, pz] = mapXY(FIRE.x, FIRE.z - 0.6); mapBadge(x, px, pz, 34); isleIcon(x, 'camp', px - 2, pz, 1.15); }
  /* the monuments: pale until built */
  Object.keys(LOOP_SITES).forEach((id) => { const st = LOOP_SITES[id], [px, pz] = mapXY(st.x, st.z), up = !!mons()[id]; x.globalAlpha = up ? 1 : 0.4; mapBadge(x, px, pz, 34, up ? '#fff6e4' : '#e9e2d2'); isleIcon(x, id, px, pz, 1.2); x.globalAlpha = 1;
    if (up) isleIcon(x, 'star', px + 26, pz - 26, 0.6); });
  /* the friends: a face where each one is now, a "?" where one still hides */
  const hide = { smith: 'h3', baker: 'm2', mason: 's1', knitter: 'w1', fisher: 'r1', diver: 'c1', glass: 'e0' }, homeAt = { smith: SMITH_AT, baker: BAKER_AT };
  VILLAGERS.forEach((v) => { const F = folk()[v.id] || 0; let wx, wz;
    if (F >= 2) { const q = homeAt[v.id] || HOUSES[v.id]; wx = q.x; wz = q.z + (homeAt[v.id] ? 0 : 1.2); }
    else if (v.id === 'miner') { wx = CAVE_FRIEND.x; wz = CAVE_FRIEND.z; }
    else { const A = AREA_BY[hide[v.id]]; wx = A.cx + A.ruin[0]; wz = A.cz + A.ruin[1]; }
    const [px, pz] = mapXY(wx, wz); if (F) mapBadge(x, px, pz, 27); boardFace(x, v, px, pz + (F ? 3 : 0), F ? 0.5 : 0.62, F ? 3 : 0); });
  /* something to pay for here */
  signs.forEach((s) => { if (s.A || s.x == null) return; const [px, pz] = mapXY(s.x, s.z); x.beginPath(); x.arc(px, pz, 11, 0, 7); x.fillStyle = '#f4b23a'; x.fill(); x.lineWidth = 3; x.strokeStyle = '#6e4426'; x.stroke(); x.beginPath(); x.arc(px, pz, 4, 0, 7); x.fillStyle = '#fff6e4'; x.fill(); });
  /* where Pip is */
  const P = inCave ? [AREA_BY.cave.cx, AREA_BY.cave.cz] : [pip.position.x, pip.position.z], [qx, qz] = mapXY(P[0], P[1]);
  MP.pip.style.left = (qx / W * 100) + '%'; MP.pip.style.top = (qz / H * 100) + '%';
  /* the hint: big bouncing pictures where the missing thing is found, with the gear it takes beside it */
  MP.hints.forEach((el) => el.remove()); MP.hints = [];
  if (MP.hint) mapHintSpots(MP.hint).forEach((q, k) => { const [px, pz] = mapXY(q.x, q.z), el = document.createElement('div'); el.className = 'mapHint'; el.style.left = (px / W * 100) + '%'; el.style.top = (pz / H * 100) + '%'; el.style.animationDelay = (k * 0.15) + 's';
    const b = document.createElement('span'); b.appendChild(bldIco(q.t)); el.appendChild(b); if (q.need) { const n = document.createElement('span'); n.className = 'need'; n.appendChild(bldIco(q.need)); el.appendChild(n); }
    MP.cv.parentNode.appendChild(el); MP.hints.push(el); });
}
/* where a thing is found: the areas with that find (and the gear Pip still lacks to get it), or the owned land that grows it */
function mapHintSpots(t) {
  const out = [];
  if (FINDS.indexOf(t) >= 0) { AREAS.forEach((A) => { const f = (A.finds || []).find((q) => FIND_NODE[q[0]].t === t); if (!f) return; const F = FIND_NODE[f[0]];
      const need = A.cave && !gearHas('torch') ? 'torch' : !F.hand && toolTier() < F.tier ? 'pick' + F.tier : null; out.push({ t, x: A.cx, z: A.cz, need }); });
    if (out.some((q) => AREA_BY.cave2 && Math.abs(q.z - AREA_BY.cave2.cz) < 1) && !inCave && HAS.h3 && stairsDown) out.push({ t: 'stairsDown', x: stairsDown.x, z: stairsDown.z, need: null }); }
  else if (KINDS.indexOf(t) >= 0) AREAS.forEach((A) => { if (!A.cave && HAS[A.id] && MAP_RES[A.biome] === t) out.push({ t, x: A.cx, z: A.cz, need: null }); });
  return out;
}
function mapOpen(hint) { if (!MP.el || !MP.el.hidden) return; MP.hint = typeof hint === 'string' ? hint : null; if (enSleep || rising || LP.hop) return; if (BM.menu && !BM.menu.hidden) BM.menu.hidden = true; mapDraw(); MP.el.hidden = false; work = null; target.copy(pip.position); Snd.play('pop', { gain: 0.3, f: 520 }); }
function mapShut() { if (MP.el.hidden) return; MP.el.hidden = true; Snd.play('pop', { gain: 0.25, f: 380 }); }
function mapInit() {
  if (MP.btn || SHOW) return;
  const st = document.createElement('style');
  st.textContent = '.bldBtn.mapBtn{top:calc(max(10px,env(safe-area-inset-top,0px)) + 168px);animation:none}'
    + '.mapMenu{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;gap:14px;background:rgba(58,36,20,.5);z-index:22;padding:12px}.mapMenu[hidden]{display:none}'
    + '.mapPaper{position:relative;border:7px solid #8a5a32;border-radius:26px;overflow:hidden;box-shadow:0 8px 0 rgba(70,40,18,.4);line-height:0;background:#6cc0e0}'
    + '.mapPaper canvas{display:block;height:min(calc(100vh - 40px),calc((100vw - 120px) * 1.114));width:auto;aspect-ratio:70/78}'
    + '.mapPip{position:absolute;width:0;height:0;pointer-events:none}.mapPip::before{content:"";position:absolute;left:-13px;top:-13px;width:26px;height:26px;border-radius:50%;background:#e2483d;border:4px solid #fff6e4;box-sizing:border-box;box-shadow:0 0 0 3px #3a2414}'
    + '.mapPip::after{content:"";position:absolute;left:-13px;top:-13px;width:26px;height:26px;border-radius:50%;border:4px solid #e2483d;box-sizing:border-box;animation:mapPulse 1.3s ease-out infinite}'
    + '@keyframes mapPulse{from{transform:scale(1);opacity:.9}to{transform:scale(3.4);opacity:0}}@media (prefers-reduced-motion: reduce){.mapPip::after{animation:none;transform:scale(1.8);opacity:.5}}'
    + '.mapHint{position:absolute;width:0;height:0;pointer-events:none;animation:mapHop .9s ease-in-out infinite}.mapHint span{position:absolute;left:-34px;top:-34px;width:68px;height:68px;border-radius:50%;background:#fff6e4;border:5px solid #f4b23a;box-sizing:border-box;box-shadow:0 0 0 3px #6e4426,0 0 0 12px rgba(244,178,58,.4);display:flex;align-items:center;justify-content:center}'
    + '.mapHint span img{width:50px;height:50px}.mapHint span.need{left:22px;top:-50px;width:44px;height:44px;border-color:#e2483d;box-shadow:0 0 0 3px #6e4426}.mapHint span.need img{width:32px;height:32px}@keyframes mapHop{50%{transform:translateY(-9px)}}@media (prefers-reduced-motion: reduce){.mapHint{animation:none}}'
    + '.mapMenu .x{flex:none;width:64px;height:64px;border-radius:50%;border:3px solid var(--ink);background:var(--paper);font:700 34px Fredoka,sans-serif;align-self:flex-start}';
  document.head.appendChild(st);
  const b = document.createElement('button'); b.type = 'button'; b.className = 'bldBtn mapBtn'; b.setAttribute('aria-label', 'Karta'); b.appendChild(mapPic(96)); document.body.appendChild(b); MP.btn = b;
  const m = document.createElement('div'); m.className = 'mapMenu'; m.hidden = true; m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', 'Karta');
  const paper = document.createElement('div'); paper.className = 'mapPaper'; const cv = document.createElement('canvas'); cv.width = MP.w * MP.S; cv.height = MP.h * MP.S; paper.appendChild(cv);
  const dot = document.createElement('div'); dot.className = 'mapPip'; paper.appendChild(dot); m.appendChild(paper);
  const x = document.createElement('button'); x.type = 'button'; x.className = 'x'; x.setAttribute('aria-label', 'Stäng'); x.textContent = '✕'; m.appendChild(x);
  document.body.appendChild(m); MP.el = m; MP.cv = cv; MP.pip = dot;
  b.addEventListener('click', (e) => { e.stopPropagation(); mapOpen(); });
  m.addEventListener('click', (e) => { e.stopPropagation(); mapShut(); });
  ['pointerdown', 'pointerup', 'touchstart'].forEach((ev) => m.addEventListener(ev, (e) => e.stopPropagation()));
}
