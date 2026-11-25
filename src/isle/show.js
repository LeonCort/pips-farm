/* ---------- the asset yard (Leon, 2026-11-25): isle.html?show=1 ----------
   A test page, not part of the game: every island asset stands in rows on an empty lawn (the first two meadow areas),
   each upgrade level side by side, with a name tag and its triangle count. A list on the right jumps Pip to any of them,
   and to the big things that stay in their real place (monuments, bridges, docks). It has its own save (pip-isle-show),
   so the real game is never touched. */
const SH = { built: 0, items: [], here: [] };
function showTris(o) { let n = 0; o.traverse((m) => { if (!m.isMesh || !m.geometry || !m.visible) return; const g = m.geometry; n += (g.index ? g.index.count : g.attributes.position ? g.attributes.position.count : 0) / 3; }); return Math.round(n); }
function showTag(name, tris, x, y, z) {
  const c = document.createElement('canvas'); c.width = 384; c.height = 112; const q = c.getContext('2d');
  q.fillStyle = 'rgba(255,246,228,0.94)'; q.strokeStyle = '#6e4426'; q.lineWidth = 5; q.beginPath(); q.roundRect(4, 4, 376, 104, 20); q.fill(); q.stroke();
  q.fillStyle = '#3a2a1e'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.font = '700 40px Fredoka, system-ui, sans-serif'; q.fillText(name, 192, 40, 356);
  q.fillStyle = tris < 300 ? '#c0392b' : tris < 1200 ? '#b9770e' : '#2e7d32'; q.font = '600 30px Fredoka, system-ui, sans-serif'; q.fillText(tris.toLocaleString('en') + ' triangles', 192, 82, 356);
  const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true, depthWrite: false })); sp.scale.set(1.5, 0.44, 1); sp.position.set(x, y, z); sc.add(sp); return sp;
}
/* put an object on the lawn at a slot and list it */
function showPut(group, name, x, z, o) {
  o = o || {}; const g = o.keep ? group : group; if (!o.keep) { g.position.set(x, o.y || 0, z); if (o.ry != null) g.rotation.y = o.ry; } if (!g.parent) sc.add(g); g.visible = true; g.scale.setScalar(o.s || 1);
  g.updateMatrixWorld(true); const b = new T.Box3().setFromObject(g), tris = o.tris != null ? o.tris : showTris(g), h = Math.max(0.7, Math.min(4.2, b.max.y));
  showTag(name, tris, x, h + 0.55, z); SH.items.push({ name, x, z: z + (o.front || 1.7), tris, grp: o.grp || 'Yard' }); return g;
}
function showBuild() {
  const I = state.isle, X0 = -16.4, DX = 3.05, sx = (k) => X0 + k * DX; let z, k;
  /* row 1: the camp's own things, every level */
  z = -20.2; k = 0;
  [1, 2, 3].forEach((lv) => { tentShape(lv); showPut(campFlame.t.clone(true), lv === 3 ? 'Hut (tent 3)' : 'Tent ' + lv, sx(k++), z, { ry: 0, grp: 'Camp' }); }); tentShape(bldLv('tent'));
  [1, 2, 3].forEach((lv) => { fireShape(lv); showPut(campFlame.g.clone(true), 'Campfire ' + lv, sx(k++), z + 0.3, { grp: 'Camp', front: 1.9 }); }); fireShape(bldLv('fire'));
  const ken = sc.children.find((c) => c.isGroup && Math.abs(c.position.x - KENNEL.x) < 0.01 && Math.abs(c.position.z - KENNEL.z) < 0.01);
  if (ken) showPut(ken.clone(true), 'Doghouse', sx(k++), z, { grp: 'Camp' });
  showPut(storeG.g.clone(true), 'Storage crate', sx(k++), z, { grp: 'Camp' });
  /* row 2: buildings */
  z = -17.0; k = 0;
  if (forgeG) showPut(forgeG.clone(true), 'Forge', sx(k++), z, { grp: 'Buildings' });
  if (ovenG) showPut(ovenG.clone(true), 'Bakery oven', sx(k++), z, { grp: 'Buildings' });
  ['mason', 'knitter', 'miner'].forEach((id) => { const P = LP.folk[id]; if (P && P.house) showPut(P.house.clone(true), id[0].toUpperCase() + id.slice(1) + ' house', sx(k++), z, { grp: 'Buildings' }); });
  [['m2', 'Old cottage (shut)'], ['h3', 'Old cottage (open)']].forEach(([id, nm]) => { const R = ruins.find((r) => r.A.id === id); if (R) { const c = R.g.clone(true); if (R.planks && !R.open) { const pl = R.planks.main.clone(); pl.position.set(0, 0, 0.98); c.add(pl); } showPut(c, nm, sx(k++), z, { ry: 0, grp: 'Buildings' }); } });
  showPut(boardG.clone(true), 'Friends board', sx(k++), z + 0.3, { ry: 0, grp: 'Buildings' });
  /* row 3: village pieces, built one by one from the same code the village uses */
  z = -14.2; k = 0;
  const piece = (name, f) => { const g = new T.Group(), L = [], x = sx(k++); f(L, g, x); if (L.length) merged(L.map((q) => (q.index ? q.toNonIndexed() : q)), MAT, g); sc.add(g); g.updateMatrixWorld(true); const b = new T.Box3().setFromObject(g); showTag(name, showTris(g), x, Math.min(4, b.max.y) + 0.55, z); SH.items.push({ name, x, z: z + 1.5, tris: showTris(g), grp: 'Village pieces' }); };
  piece('Well', (L, g, x) => wellMake(x, z, L, 3260));
  piece('Lantern', (L, g, x) => lanternMake(x, z, L).forEach((m) => g.add(m)));
  piece('Crystal lamp', (L, g, x) => crystLamp(x, z, L, g, 3970));
  piece('Signpost', (L, g, x) => signpost(x, z, L, 3200, 0.4));
  piece('Bench', (L, g, x) => benchMake(x, z, 0, L, 3370));
  piece('Flower box', (L, g, x) => flowerBox(x, z, 0, L, 3250));
  piece('Stone planter', (L, g, x) => stonePlanter(x, z, L, 3800));
  piece('Fence', (L, g, x) => fenceRun(x - 0.9, z, x + 0.9, z, L, 3460));
  /* row 4: what grows, and things found */
  z = -12.3; k = 0;
  const node = (kind, name, seed) => { const xx = sx(k++), n = makeNode(kind, xx, z, seed); n.g.updateMatrixWorld(true); const b = new T.Box3().setFromObject(n.g); showTag(name, showTris(n.g), xx, Math.min(4, b.max.y) + 0.55, z); SH.items.push({ name, x: xx, z: z + 1.6, tris: showTris(n.g), grp: 'Nature' }); };
  let sT = 1, sP = 1; while (hash(sT, 2) > 0.7) sT++; while (hash(sP, 2) <= 0.7) sP++;
  node('tree', 'Tree', sT); node('tree', 'Pine', sP); node('bush', 'Berry bush', 7); node('rock', 'Rock', 8); node('boulder', 'Boulder', 9); node('crystal', 'Crystal', 10);
  { const c = makeChest(sx(k), z, 'pick', 9999); chests.splice(chests.indexOf(c), 1); sc.remove(c.ring); c.g.scale.setScalar(1); showPut(c.g, 'Chest', sx(k++), z, { grp: 'Nature', front: 1.4 }); }
  showPut(ferryBoat.clone(true), 'Boat', sx(k++), z, { y: 0.3, grp: 'Nature', front: 1.4 });
  /* row 5: everyone, and what Pip carries */
  z = -22.4; k = 0; const who = (g, name) => { g.rotation.y = 0; showPut(g, name, X0 + k++ * 1.9, z, { grp: 'Friends', front: 1.3 }); };
  who(smithModel(), 'Smith'); who(bakerModel(), 'Baker'); ['mason', 'knitter', 'miner'].forEach((id) => who(loopFolkModel(id), id[0].toUpperCase() + id.slice(1)));
  if (typeof dog !== 'undefined' && dog && dog.g) who(dog.g.clone(true), 'Dog');
  ['log', 'stone', 'berry', 'crystal', 'coin'].forEach((t) => { const m = itemModel(t); showPut(m, t[0].toUpperCase() + t.slice(1), X0 + k++ * 1.9, z, { y: 0.25, s: 1.6, grp: 'Items', front: 1.1 }); });
  /* the big things stay where they belong */
  Object.keys(LP.mon).forEach((id) => { const S = LOOP_SITES[id]; SH.here.push({ name: { harbor: 'Harbour', windmill: 'Windmill', lighthouse: 'Lighthouse', tower: 'Star tower' }[id], x: S.x + S.sx, z: S.z + S.sz + 1.2, tris: showTris(LP.mon[id].g), grp: 'In their real place' }); });
  SH.here.push({ name: 'Camp', x: 0.8, z: 1.4, tris: 0, grp: 'In their real place' }, { name: 'Smithy street', x: 13.5, z: 1.4, tris: 0, grp: 'In their real place' }, { name: 'Village green', x: 7.5, z: 10, tris: 0, grp: 'In their real place' },
    { name: 'Bakery street', x: 0.6, z: 16.2, tris: 0, grp: 'In their real place' }, { name: 'Friends street', x: 13.5, z: 8.6, tris: 0, grp: 'In their real place' }, { name: 'Farm boat dock', x: FERRY.x + 1, z: FERRY.z + 0.8, tris: 0, grp: 'In their real place' },
    { name: 'Bridge to the meadow', x: 0.9, z: -5.2, tris: 0, grp: 'In their real place' }, { name: 'Stone island', x: -27, z: -14, tris: 0, grp: 'In their real place' }, { name: 'Winter island', x: 27, z: -18, tris: 0, grp: 'In their real place' });
  showPanel(); showGo({ x: -6, z: -9.2 });
}
function showGo(it) { pip.position.set(it.x, 0, it.z); target.set(it.x, 0, it.z); camFocus.set(it.x, 0, it.z); work = null; pip.rotation.y = Math.PI; }
function showPanel() {
  const st = document.createElement('style');
  st.textContent = '.shw{position:fixed;top:84px;right:10px;bottom:10px;width:230px;z-index:40;display:flex;flex-direction:column;font:500 14px Fredoka,system-ui,sans-serif;color:#3a2a1e}'
    + '.shw.shut{bottom:auto}.shw.shut .shwL{display:none}.shwH{background:#8a5a32;color:#fff6e4;border-radius:14px 14px 0 0;padding:8px 12px;font-weight:700;cursor:pointer;display:flex;justify-content:space-between}.shw.shut .shwH{border-radius:14px}'
    + '.shwL{overflow:auto;background:rgba(255,246,228,.95);border:3px solid #8a5a32;border-top:0;border-radius:0 0 14px 14px;padding:4px 6px 8px;-webkit-overflow-scrolling:touch}'
    + '.shwG{font-weight:700;margin:8px 4px 2px;color:#8a5a32}.shwB{display:flex;justify-content:space-between;gap:6px;width:100%;border:0;background:none;padding:5px 6px;border-radius:8px;font:inherit;color:inherit;text-align:left;cursor:pointer}.shwB:hover,.shwB:active{background:#f0dcb2}'
    + '.shwB i{font-style:normal;font-size:12px}.shwB .lo{color:#c0392b}.shwB .mid{color:#b9770e}.shwB .hi{color:#2e7d32}';
  document.head.appendChild(st);
  const d = document.createElement('div'); d.className = 'shw'; const h = document.createElement('div'); h.className = 'shwH'; h.innerHTML = '<span>Asset yard</span><span>▾</span>'; h.addEventListener('click', () => d.classList.toggle('shut')); d.appendChild(h);
  const l = document.createElement('div'); l.className = 'shwL'; d.appendChild(l); let grp = null;
  SH.items.concat(SH.here).forEach((it) => { if (it.grp !== grp) { grp = it.grp; const g = document.createElement('div'); g.className = 'shwG'; g.textContent = grp; l.appendChild(g); }
    const b = document.createElement('button'); b.type = 'button'; b.className = 'shwB'; const n = document.createElement('span'); n.textContent = it.name; b.appendChild(n);
    if (it.tris) { const t = document.createElement('i'); t.textContent = it.tris.toLocaleString('en'); t.className = it.tris < 300 ? 'lo' : it.tris < 1200 ? 'mid' : 'hi'; b.appendChild(t); }
    b.addEventListener('click', (e) => { e.stopPropagation(); showGo(it); }); l.appendChild(b); });
  ['pointerdown', 'touchstart', 'mousedown', 'wheel'].forEach((ev) => d.addEventListener(ev, (e) => e.stopPropagation()));
  document.body.appendChild(d);
}
function showStep() { if (!SHOW || SH.built) return; SH.built = 1; try { showBuild(); } catch (e) { console.error('asset yard: ' + e.message); throw e; } state.isle.en = enMax(); }
