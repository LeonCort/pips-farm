/* ---------- the market street: Pip's shop, now on the farm island ----------
   The same system as the shop game: goods come from producers (the egg crate in the farmyard, apple trees, the bakery),
   Pip carries them to the counter or a stall, animal guests buy them, and coins pay for new things on coin pads.
   Hearts (from happy animals) and coins (from selling) are kept apart. */
const VALUE = { egg: 1, apple: 2, milk: 4, cake: 8, wool: 5 };
const SHOP = MKT.shop, SDROP = { x: SHOP.x, z: SHOP.z + 1.25 }, SMONEY = { x: SHOP.x - 2.1, z: SHOP.z + 1.6 }, SBACK = { x: (SHOP.x + MKT.stalls.egg.x) / 2, z: SHOP.z + 1.75 }; /* the storage crate in the yard between the counter and the egg stall */
const BAKE = MKT.bakery, B_IN = { x: BAKE.x - 1.0, z: BAKE.z - 1.4 * BAKE.f }, B_OUT = { x: BAKE.x + 1.0, z: BAKE.z - 1.4 * BAKE.f };
const STL = MKT.stalls, STALL_T = ['egg', 'apple', 'milk', 'cake', 'wool'];
const sDrop = (t) => [STL[t].x, STL[t].z + 1.25 * STL[t].f];
const sHome = (t) => [STL[t].x + 0.65, STL[t].z + 2.1 * STL[t].f];
const sSeller = (t) => [STL[t].x + 1.1, STL[t].z - 0.1 * STL[t].f];
const sMoney = (t) => [STL[t].x + 1.4, STL[t].z + 1.35 * STL[t].f];
const SPADS = [
  { id: 'tree2', kind: 'tree', i: 1, cost: 12 }, { id: 'sign1', kind: 'sign', i: 0, cost: 25 }, { id: 'stall-egg', kind: 'stall', t: 'egg', cost: 50 },
  { id: 'tree3', kind: 'tree', i: 2, cost: 80 }, { id: 'stock-egg', kind: 'stock', t: 'egg', cost: 120 }, { id: 'stall-apple', kind: 'stall', t: 'apple', cost: 180 },
  { id: 'sell-egg', kind: 'seller', t: 'egg', cost: 240 }, { id: 'helper1', kind: 'helper', i: 0, cost: 320 }, { id: 'stock-apple', kind: 'stock', t: 'apple', cost: 420 },
  { id: 'sign2', kind: 'sign', i: 1, cost: 520 }, { id: 'sell-apple', kind: 'seller', t: 'apple', cost: 650 }, { id: 'bakery', kind: 'bakery', cost: 800 },
  { id: 'stall-milk', kind: 'stall', t: 'milk', cost: 950 }, { id: 'cashier', kind: 'cashier', cost: 1200 }, { id: 'stock-milk', kind: 'stock', t: 'milk', cost: 1450 },
  { id: 'sell-milk', kind: 'seller', t: 'milk', cost: 1800 }, { id: 'sign3', kind: 'sign', i: 2, cost: 2000 }, { id: 'stall-cake', kind: 'stall', t: 'cake', cost: 2400 },
  { id: 'helper2', kind: 'helper', i: 1, cost: 3000 }, { id: 'stock-cake', kind: 'stock', t: 'cake', cost: 3500 }, { id: 'sell-cake', kind: 'seller', t: 'cake', cost: 4200 }
];
function sPadPos(p) {
  if (p.kind === 'tree') { const s = MKT.trees[p.i]; return [s[0], s[1] + 1.3]; }
  if (p.kind === 'sign') return MKT.signs[p.i];
  if (p.kind === 'stall') return sDrop(p.t);
  if (p.kind === 'stock') return sHome(p.t);
  if (p.kind === 'seller') return sMoney(p.t);
  if (p.kind === 'helper') return MKT.helpers[p.i];
  if (p.kind === 'bakery') return [BAKE.x, BAKE.z - 1.9 * BAKE.f];
  if (p.kind === 'cashier') return [SHOP.x + 2.0, SHOP.z + 1.45];
  return [SHOP.x, SHOP.z];
}
const shop = () => state.shop;
const sOwn = (id) => !!shop().owned[id];
const nextSPad = () => { for (const p of SPADS) if (!sOwn(p.id)) return p; return null; };
const mFarm = () => 1 + 0.25 * state.lv.farm;

/* ---------- coins: their own counter next to the hearts ---------- */
{ const st = document.createElement('style'); st.textContent = '.coins.gold { transition: left 0.2s; } .coins.gold.no { animation: shake 0.4s; background: #f7c9bb; } .flycoin.gold { background: #e0a646 !important; }'; document.head.appendChild(st); }
const coinPill = document.createElement('div'); coinPill.className = 'coins gold'; coinPill.setAttribute('role', 'status'); coinPill.setAttribute('aria-label', 'Mynt');
coinPill.innerHTML = '<svg id="coinIcon2" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="16" fill="#e0a646" stroke="#22303c" stroke-width="3"/><circle cx="24" cy="24" r="9" fill="none" stroke="#b9822a" stroke-width="3"/></svg><span id="coins2">0</span>';
document.body.appendChild(coinPill);
function placeCoinPill() { const h = document.querySelector('.coins:not(.gold)'); if (!h) return; const r = h.getBoundingClientRect(); /* on a narrow screen the coins go under the hearts, so they do not cover the buttons */ if (innerWidth < 600) { coinPill.style.left = Math.round(r.left) + 'px'; coinPill.style.top = Math.round(r.bottom + 8) + 'px'; } else { coinPill.style.left = Math.round(r.right + 10) + 'px'; coinPill.style.top = ''; } }
function earnCoins(n) { shop().coins += n; shop().total += n; const el = $('coins2'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
function coinFly(wx, wy, wz, n) {
  tmpV.set(wx, wy, wz).project(cam); const r = wrap.getBoundingClientRect(), hud = $('coinIcon2').getBoundingClientRect();
  const sx = (tmpV.x * 0.5 + 0.5) * r.width + r.left, sy = (-tmpV.y * 0.5 + 0.5) * r.height + r.top;
  for (let k = 0; k < Math.min(n, 6); k++) {
    const d = document.createElement('span'); d.className = 'flycoin gold'; d.style.left = sx + 'px'; d.style.top = sy + 'px'; document.body.appendChild(d);
    const dx = hud.left + hud.width / 2 - sx, dy = hud.top + hud.height / 2 - sy;
    requestAnimationFrame(() => { d.style.transitionDelay = (k * 0.05) + 's'; d.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(0.7)'; d.style.opacity = '0.2'; });
    setTimeout(() => d.remove(), 900);
  }
}

/* ---------- producers: apple trees, the bakery, and the crates the farm animals fill ----------
   'near': the egg and milk crates stand by their stalls. 'van': the farm crate is emptied by the truck, and the truck's bed is the producer. */
const mProd = VARIANT === 'near' ? CRATES.map((c) => ({ kind: 'crate', pile: c.pile, x: c.x, z: c.z + 0.2, r: 1.05 })) : [];
const trees = [];
function appleTree(i) {
  if (trees[i]) return; const s = MKT.trees[i], g = new T.Group(); g.position.set(s[0], 0, s[1]); sc.add(g);
  let geo = new T.CylinderGeometry(0.1, 0.14, 0.8, 5); geo.translate(0, 0.4, 0); part(fac(geo, PAL.trunk, 900 + i), g);
  const crown = part(fac(fluff(0.68, 910 + i, 7), (cx, cy, cz, k) => leafY(PAL.leaf, cy, -0.6, 0.6, k)), g, 0, 1.35, 0); crown.userData = { base: PAL.leaf, y0: -0.6, y1: 0.6 }; leafs.push(crown);
  for (let k = 0; k < 6; k++) part(fac(new T.IcosahedronGeometry(0.08, 0), PAL.accent, k), g, Math.cos(k * 1.05) * 0.6, 1.1 + hash(k, i) * 0.4, Math.sin(k * 1.05) * 0.6, true);
  geo = new T.BoxGeometry(0.7, 0.18, 0.45); geo.translate(0, 0.09, 0); part(fac(geo, PAL.trunk, 920 + i), g, 0, 0, 1.0);
  const pile = new Pile(g, (k) => [-0.2 + (k % 3) * 0.2, 0.16 + Math.floor(k / 6) * 0.2, 0.92 + (Math.floor(k / 3) % 2) * 0.17]);
  const q = { kind: 'tree', pile, x: s[0], z: s[1] + 1.0, every: 5, max: 6, t: 0, r: 1.0, g }; trees[i] = q; mProd.push(q); solid(s[0], s[1], 0.45);
  if (typeof swayers !== 'undefined' && swayers) { g.rotation.order = 'ZXY'; g.userData.ph = hash(s[0], s[1]) * 6.28; swayers.trees.push(g); }
}
let bakery = null;
function makeBakery() {
  if (bakery) return; const g = new T.Group(); g.position.set(BAKE.x, 0, BAKE.z); g.rotation.y = BAKE.f > 0 ? Math.PI : 0; sc.add(g); const cap = new T.Group(); g.add(cap);
  let geo = new T.BoxGeometry(2.2, 1.3, 1.5, 3, 2, 2); geo.translate(0, 0.65, 0); part(fac(jit(geo, 0.02, 3), PAL.paper, 930), g);
  geo = new T.ConeGeometry(1.7, 0.8, 4); geo.rotateY(Math.PI / 4); geo.scale(1, 1, 0.75); geo.translate(0, 1.7, 0); part(fac(geo, PAL.accent, 931), g);
  geo = new T.ConeGeometry(1.75, 0.82, 4, 1, true); geo.rotateY(Math.PI / 4); geo.scale(1, 1, 0.75); geo.translate(0, 1.72, 0); snowCap(cap, geo);
  geo = new T.BoxGeometry(0.25, 0.6, 0.25); part(fac(geo, PAL.rock, 932), g, 0.6, 1.9, -0.2);
  const door = new T.Mesh(new T.BoxGeometry(0.45, 0.7, 0.02), ink); door.position.set(0, 0.35, 0.76); g.add(door);
  [B_IN, B_OUT].forEach((b, k) => { const t2 = new T.BoxGeometry(0.75, 0.12, 0.6); part(fac(t2, k ? PAL.ochre : PAL.trunk, 933 + k), sc, b.x, 0.06, b.z); });
  const smoke = []; for (let k = 0; k < 4; k++) { const m = part(fac(ico(0.16, 0, k), PAL.cloud, k), g, 0.6, 2.3, -0.2, true); m.userData.ph = k / 4; smoke.push(m); }
  bakery = { g, smoke, inp: new Pile(sc, (k) => [B_IN.x - 0.22 + (k % 3) * 0.22, 0.12 + Math.floor(k / 6) * 0.2, B_IN.z - 0.12 + (Math.floor(k / 3) % 2) * 0.24]), out: new Pile(sc, (k) => [B_OUT.x - 0.2 + (k % 3) * 0.2, 0.12 + Math.floor(k / 6) * 0.15, B_OUT.z - 0.12 + (Math.floor(k / 3) % 2) * 0.26]), every: 2.2, work: 0 };
  mProd.push({ kind: 'bakery', pile: bakery.out, x: B_OUT.x, z: B_OUT.z, max: 12, r: 0.9 });
  solid(BAKE.x - 0.55, BAKE.z, 0.85); solid(BAKE.x + 0.55, BAKE.z, 0.85);
}

/* 'near': the feed stations, a grain sack, a hay bale and a water barrel on a little wooden deck */
STATIONS.forEach((st, i) => {
  const g = new T.Group(); g.position.set(st.x, 0, st.z - 0.75); sc.add(g);
  let geo = new T.BoxGeometry(1.5, 0.08, 0.7); part(fac(geo, PAL.trunk, 870 + i), g, 0, 0.04, 0);
  st.foods.forEach((t, k) => { const x = -0.38 + k * 0.76;
    if (t === 'water') { geo = new T.CylinderGeometry(0.28, 0.3, 0.55, 9); geo.translate(0, 0.32, 0); part(fac(jit(geo, 0.01, 3), PAL.trunk, 872), g, x, 0, 0); const w = new T.CylinderGeometry(0.25, 0.25, 0.02, 9); part(fac(w, PAL.sea, 873), g, x, 0.6, 0); }
    if (t === 'grain') { geo = new T.CylinderGeometry(0.22, 0.3, 0.6, 7); geo.translate(0, 0.38, 0); part(fac(jit(geo, 0.02, 4), PAL.paper, 874), g, x, 0, 0); geo = new T.ConeGeometry(0.16, 0.14, 7); part(fac(geo, PAL.paper, 875), g, x, 0.75, 0); }
    if (t === 'hay') { geo = new T.BoxGeometry(0.62, 0.42, 0.5); part(fac(jit(geo, 0.02, 5), PAL.ochre, 876), g, x, 0.29, 0); } });
  ring(st.x, st.z, 0.85); solid(st.x, st.z - 0.75, 0.5);
});

/* ---------- the shop counter, its shelves and the back-stock crate ---------- */
const counterG = new T.Group(); counterG.position.set(SHOP.x, 0, SHOP.z); sc.add(counterG);
{
  const cap = new T.Group(); counterG.add(cap);
  mlBooth(counterG, cap, { W: 2.8, H: 0.75, D: 0.8, px: 1.35, pz: 0.35, ay: 1.72, col: PAL.accent }); /* plank booth, scalloped awning (marketlook.js) */
  solid(SHOP.x - 0.8, SHOP.z, 0.6); solid(SHOP.x + 0.8, SHOP.z, 0.6); solid(SHOP.x, SHOP.z, 0.6);
}
const SHELF_X = { egg: -1.0, apple: -0.5, milk: 0, cake: 0.5, wool: 1.0 }, SHELF_MAX = 16;
const shelf = {}; GOODS.forEach((t) => { shelf[t] = new Pile(counterG, (k) => [SHELF_X[t] - 0.12 + (k % 2) * 0.24, 0.82 + Math.floor(k / 4) * ITEM_H[t], -0.12 + (Math.floor(k / 2) % 2) * 0.24]); });
const BACK_MAX = 80, backG = new T.Group(); backG.position.set(SBACK.x, 0, SBACK.z); sc.add(backG);
/* the storage crate ("förråd"): a big open wooden crate that takes whatever Pip carries that no stall can take right now,
   and sends it back out to the stalls and the counter as soon as they have room */
{
  const base = new T.BoxGeometry(1.3, 0.08, 1.05); part(fac(base, PAL.trunk, 951), backG, 0, 0.04, 0);
  /* low crate walls: back and both sides, the front stays open towards the yard */
  { const w = new T.BoxGeometry(1.3, 0.5, 0.08); part(fac(jit(w, 0.01, 1), PAL.ochre, 952), backG, 0, 0.29, -0.49); }
  [[0.61, 0], [-0.61, 0]].forEach(([x, z], k) => { const w = new T.BoxGeometry(0.08, 0.5, 1.05); part(fac(jit(w, 0.01, k + 3), PAL.ochre, 954 + k), backG, x, 0.29, z); });
  { const w = new T.BoxGeometry(1.3, 0.14, 0.06); part(fac(jit(w, 0.01, 7), PAL.ochre, 956), backG, 0, 0.13, 0.5); }
  /* two posts at the back carry the picture sign */
  [-0.5, 0.5].forEach((x, k) => { const g2 = new T.BoxGeometry(0.08, 1.25, 0.08); g2.translate(0, 0.62, 0); part(fac(g2, PAL.trunk, 957 + k), backG, x, 0, -0.5); });
  { const r = new T.BoxGeometry(1.12, 0.06, 0.1); part(fac(r, PAL.trunk, 961), backG, 0, 1.25, -0.5); }
  /* the picture sign: a crate holding all four goods */
  const c = document.createElement('canvas'); c.width = 256; c.height = 160; const x = c.getContext('2d');
  x.save(); x.shadowColor = 'rgba(70,40,18,0.4)'; x.shadowBlur = 8; x.shadowOffsetY = 5; x.fillStyle = '#f3e2bf'; x.beginPath(); x.roundRect ? x.roundRect(12, 10, 232, 132, 36) : x.rect(12, 10, 232, 132); x.fill(); x.restore();
  x.fillStyle = '#fffaf0'; x.beginPath(); x.roundRect ? x.roundRect(12, 10, 232, 132, 36) : x.rect(12, 10, 232, 132); x.fill(); x.lineWidth = 5; x.strokeStyle = '#6e4426'; x.stroke();
  x.fillStyle = '#c98c4a'; x.strokeStyle = '#6e4426'; x.lineWidth = 5; x.fillRect(56, 82, 144, 46); x.strokeRect(56, 82, 144, 46); x.beginPath(); x.moveTo(56, 105); x.lineTo(200, 105); x.stroke();
  ['egg', 'apple', 'milk', 'cake'].forEach((t, k) => drawIcon(x, t, 74 + k * 36, 66, 0.62));
  const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false })); sp.scale.set(0.72, 0.45, 1); sp.position.set(0, 1.55, -0.45); sp.renderOrder = 4; backG.add(sp);
  solid(SBACK.x - 0.35, SBACK.z - 0.1, 0.5); solid(SBACK.x + 0.35, SBACK.z - 0.1, 0.5);
}
const back = new Pile(backG, (k) => [-0.48 + (k % 5) * 0.24, 0.14 + Math.floor(k / 20) * 0.2, -0.33 + (Math.floor(k / 5) % 4) * 0.22]);
/* goods no stall can take right now (no stall yet, or its shelf is full); animal food has no place in the market at all */
const stuckT = (t) => GOODS.includes(t) ? !(stalls[t] && stalls[t].shelf.items.length < SHELF_MAX) : !!SRC[t];
const SHED_R = 1.35;
function stock(m) {
  const t = m.userData.type;
  if (shelf[t].items.length < SHELF_MAX) { fly(m, () => counterG.localToWorld(tmpV.set(SHELF_X[t], 1.0, 0)), () => shelf[t].add(m)); return true; }
  if (back.items.length < BACK_MAX) { fly(m, () => backG.localToWorld(tmpV.set(0, 0.4, 0)), () => back.add(m)); return true; }
  return false;
}
ring(SDROP.x, SDROP.z, 0.9);

/* money piles: guests leave coins here until Pip picks them up */
const coinGeo = fac(new T.CylinderGeometry(0.13, 0.13, 0.05, 8), PAL.ochre, 3), mPiles = [];
function makeMoney(x, z) {
  const o = { n: 0, meshes: [], g: new T.Group(), x, z }; o.g.position.set(x, 0, z); sc.add(o.g);
  o.g.add(mlCoinTray()); /* wooden coin tray (marketlook.js) */
  o.show = () => { const show = Math.min(48, Math.ceil(o.n / Math.max(1, Math.ceil(o.n / 48)))); while (o.meshes.length < show) { const k = o.meshes.length, m = new T.Mesh(coinGeo, MAT); m.castShadow = true; m.position.set(-0.24 + (k % 3) * 0.24, 0.04 + Math.floor(k / 9) * 0.055, -0.24 + (Math.floor(k / 3) % 3) * 0.24); o.g.add(m); o.meshes.push(m); } while (o.meshes.length > show) o.g.remove(o.meshes.pop()); };
  mPiles.push(o); return o;
}
const money = makeMoney(SMONEY.x, SMONEY.z);

/* ---------- stalls, stocking robots, sellers, signs, helpers and the cashier ---------- */
const stalls = {}, STALL_COL = { egg: PAL.ochre, apple: PAL.accent, milk: PAL.sea, cake: PAL.blush, wool: '#a98fcf' };
function addStall(t) {
  if (stalls[t]) return; const a = STL[t], g = new T.Group(); g.position.set(a.x, 0, a.z); g.rotation.y = a.f > 0 ? 0 : Math.PI; sc.add(g); const cap = new T.Group(); g.add(cap);
  mlBooth(g, cap, { W: 1.6, H: 0.7, D: 0.7, px: 0.78, pz: 0.3, ay: 1.52, col: STALL_COL[t] }); mlStallProps(g, t, STALL_COL[t]); /* (marketlook.js) */
  const c = document.createElement('canvas'); c.width = 256; c.height = 160; const x = c.getContext('2d'); void x;
  const sp = new T.Sprite(new T.SpriteMaterial({ map: mlSignTex(t), depthTest: false })); sp.scale.set(0.7, 0.44, 1); sp.position.set(0, 2.1, 0); sp.renderOrder = 4; g.add(sp);
  const d = sDrop(t), mp = sMoney(t); ring(d[0], d[1], 0.8);
  stalls[t] = { t, g, shelf: new Pile(g, (k) => [-0.54 + (k % 4) * 0.36, 0.78 + Math.floor(k / 8) * ITEM_H[t], -0.14 + (Math.floor(k / 4) % 2) * 0.28]), money: makeMoney(mp[0], mp[1]), stocker: null, seller: null };
  solid(a.x - 0.5, a.z, 0.55); solid(a.x + 0.5, a.z, 0.55);
}
function addStocker(t) {
  const s = stalls[t]; if (!s || s.stocker) return; const home = sHome(t), g = robot(STALL_COL[t]); g.position.set(home[0], 0, home[1]); sc.add(g);
  const h = { g, t, home, st: 'idle', src: null, t2: 0 }; h.pile = new Pile(g, (k) => { let y = 0.52; for (let q = 0; q < k; q++) y += ITEM_H[t]; return [0, y, -0.28]; }); s.stocker = h;
}
function guestModel(kind) {
  const g = new T.Group(), col = { bunny: PAL.paper, bear: PAL.trunk, fox: PAL.accent, frog: PAL.leaf, duck: PAL.ochre }[kind];
  let geo = ico(0.26, 1, 3, 0.02); geo.scale(1, 1.15, 0.9); part(fac(geo, col, 3), g, 0, 0.36, 0);
  part(fac(ico(0.22, 1, 4, 0.015), col, 4), g, 0, 0.78, 0.02);
  if (kind === 'bunny') [-0.08, 0.08].forEach((x) => { const e = new T.CylinderGeometry(0.04, 0.05, 0.32, 5); e.translate(0, 0.16, 0); part(fac(e, col, 5), g, x, 0.92, 0); });
  if (kind === 'bear') [-0.15, 0.15].forEach((x) => part(fac(new T.IcosahedronGeometry(0.07, 0), col, 6), g, x, 0.96, 0));
  if (kind === 'fox') [-0.11, 0.11].forEach((x) => part(fac(new T.ConeGeometry(0.07, 0.16, 3), col, 7), g, x, 1.0, 0));
  if (kind === 'duck') { const b = new T.ConeGeometry(0.06, 0.16, 4); b.rotateX(Math.PI / 2); part(fac(b, PAL.accent, 8), g, 0, 0.75, 0.25); }
  if (kind === 'frog') [-0.09, 0.09].forEach((x) => part(fac(new T.IcosahedronGeometry(0.07, 0), col, 9), g, x, 0.95, 0.06));
  part(fac(new T.IcosahedronGeometry(0.08, 0), kind === 'fox' ? PAL.paper : PAL.blush, 10), g, 0, 0.73, 0.2, true);
  [-0.08, 0.08].forEach((x) => { const e = new T.Mesh(new T.SphereGeometry(0.03, 6, 4), ink); e.position.set(x, 0.84, 0.2); g.add(e); });
  return g;
}
function addSeller(t) {
  const s = stalls[t]; if (!s || s.seller) return; const kinds = { egg: 'duck', apple: 'fox', milk: 'frog', cake: 'bunny', wool: 'bear' }, p = sSeller(t), g = guestModel(kinds[t]);
  g.position.set(p[0], 0, p[1]); g.rotation.y = STL[t].f > 0 ? Math.PI + 0.5 : -0.5; sc.add(g);
  const hat = new T.CylinderGeometry(0.16, 0.2, 0.12, 8); part(fac(hat, STALL_COL[t], 3), g, 0, 1.0, 0.02); s.seller = g;
  if (s.money.n) { earnCoins(s.money.n); s.money.n = 0; s.money.show(); }
}
const mHelpers = [];
function addShopHelper(i) {
  if (mHelpers[i]) return; const s = MKT.helpers[i], g = robot(i ? PAL.sea : PAL.leaf); g.position.set(s[0], 0, s[1]); sc.add(g);
  const h = { g, st: 'idle', src: null, t: 0, i }; h.pile = new Pile(g, (k) => { let y = 0.52; for (let q = 0; q < k; q++) y += ITEM_H[h.pile.items[q].userData.type]; return [0, y, -0.28]; }); mHelpers[i] = h;
}
const signsUp = [];
function addSign(i) {
  if (signsUp[i]) return; const s = MKT.signs[i], g = new T.Group(); g.position.set(s[0], 0, s[1]); g.rotation.y = s[0] < 12 ? 0.5 : -0.5; sc.add(g); signsUp[i] = g;
  const post = new T.CylinderGeometry(0.06, 0.07, 1.4, 5); post.translate(0, 0.7, 0); part(fac(post, PAL.trunk, 2), g, 0, 0, 0);
  const board = new T.BoxGeometry(1.1, 0.7, 0.08); part(fac(board, [PAL.accent, PAL.sea, PAL.ochre][i], 3), g, 0, 1.35, 0);
  const c = document.createElement('canvas'); c.width = 256; c.height = 160; const x = c.getContext('2d'); x.fillStyle = PAL.paper; x.fillRect(0, 0, 256, 160);
  drawIcon(x, ['egg', 'apple', 'cake'][i], 80, 80, 1.5); drawIcon(x, 'coin', 176, 80, 1.3);
  const face = new T.Mesh(new T.PlaneGeometry(0.9, 0.56), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c) })); face.position.set(0, 1.35, 0.05); g.add(face);
  const bk = face.clone(); bk.rotation.y = Math.PI; bk.position.z = -0.05; g.add(bk);
}
let cashier = null;
function addCashier() { if (cashier) return; const g = guestModel('bear'); g.position.set(SHOP.x + 1.75, 0, SHOP.z + 0.25); g.rotation.y = Math.PI - 0.6; sc.add(g); const hat = new T.CylinderGeometry(0.16, 0.2, 0.12, 8); part(fac(hat, PAL.sea, 3), g, 0, 1.0, 0.02); cashier = g; }
function sBuild(p) {
  if (p.kind === 'tree') appleTree(p.i); else if (p.kind === 'bakery') makeBakery(); else if (p.kind === 'helper') addShopHelper(p.i); else if (p.kind === 'cashier') addCashier();
  else if (p.kind === 'stall') addStall(p.t); else if (p.kind === 'stock') addStocker(p.t); else if (p.kind === 'seller') addSeller(p.t); else if (p.kind === 'sign') addSign(p.i);
}

/* ---------- the coin pad: one at a time, like the heart pads on the farm ---------- */
let sPad = null;
function sPadTex(p, left) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d');
  x.fillStyle = 'rgba(255,246,228,0.92)'; x.beginPath(); x.arc(128, 128, 120, 0, 7); x.fill();
  x.lineWidth = 10; x.strokeStyle = PAL.ochre; x.beginPath(); x.arc(128, 128, 112, -Math.PI / 2, -Math.PI / 2 + 6.2832 * (1 - left / p.cost)); x.stroke();
  const icon = { tree: 'apple', bakery: 'cake', helper: 'robot', cashier: 'coin', sign: 'guest', stall: p.t, stock: 'robot', seller: 'guest' }[p.kind];
  drawIcon(x, icon, 128, 84, 1.25);
  if (p.kind === 'stock' || p.kind === 'seller') drawIcon(x, p.t, 178, 106, 0.7);
  if (p.kind === 'stall') { x.fillStyle = STALL_COL[p.t]; x.strokeStyle = PAL.ink; x.lineWidth = 4; x.fillRect(78, 28, 100, 16); x.strokeRect(78, 28, 100, 16); }
  drawIcon(x, 'coin', 76, 174, 0.8);
  x.fillStyle = PAL.ink; x.font = '700 58px Fredoka, sans-serif'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(fmt(left), 100, 178);
  return new T.CanvasTexture(c);
}
function showSPad() {
  if (sPad) { sc.remove(sPad.g); sPad = null; }
  const p = nextSPad(); if (!p) return;
  const pos = sPadPos(p), g = new T.Group(); g.position.set(pos[0], 0.04, pos[1]); sc.add(g);
  const disc = new T.Mesh(new T.CircleGeometry(0.75, 32), new T.MeshBasicMaterial({ map: sPadTex(p, p.cost - (shop().paid[p.id] || 0)), transparent: true })); disc.rotation.x = -Math.PI / 2; g.add(disc);
  g.add(flPadEdge()); /* golden rope rim (farmlook.js) */
  sPad = { p, g, disc, shown: -1, coinT: 0 };
}
function sUnlock(p) {
  shop().owned[p.id] = true; delete shop().paid[p.id]; sBuild(p);
  Snd.init(); Snd.play('success', { gain: 0.6, f: 'E6' }); Snd.play('sparkle', { gain: 0.6 }, 0.12);
  pop(sPadPos(p)); showSPad(); save();
}

/* ---------- guests ---------- */
const SLOTS = [[SHOP.x - 0.95, SHOP.z - 1.75], [SHOP.x, SHOP.z - 1.75], [SHOP.x + 0.95, SHOP.z - 1.75], [SHOP.x - 0.95, SHOP.z - 2.75], [SHOP.x, SHOP.z - 2.75], [SHOP.x + 0.95, SHOP.z - 2.75]];
STALL_T.forEach((t) => { const a = STL[t]; SLOTS.push([a.x - 0.5, a.z - 1.5 * a.f], [a.x + 0.5, a.z - 1.5 * a.f]); });
const slotStall = (i) => (i >= 6 ? STALL_T[(i - 6) >> 1] : null);
const signs = () => signsUp.filter(Boolean).length;
const guestEvery = () => (2.6 + Math.random() * 1.4) / (1 + 0.6 * signs() + 0.3 * state.lv.guests + 0.45 * Object.keys(stalls).length);
const guestWalk = () => 2.6 + 0.5 * signs();
const GUESTS = ['bunny', 'bear', 'fox', 'frog', 'duck'];
const mBubbleTex = {};
function mBubble(type, n) {
  const key = type + n; if (mBubbleTex[key]) return mBubbleTex[key];
  const c = document.createElement('canvas'); c.width = 256; c.height = 160; const x = c.getContext('2d');
  x.fillStyle = PAL.paper; x.strokeStyle = PAL.ink; x.lineWidth = 6; x.beginPath(); x.roundRect ? x.roundRect(8, 8, 240, 124, 40) : x.rect(8, 8, 240, 124); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(110, 130); x.lineTo(128, 154); x.lineTo(146, 130); x.fill(); x.stroke(); x.fillStyle = PAL.paper; x.fillRect(112, 124, 32, 10);
  if (type === 'heart') drawIcon(x, 'heart', 128, 72, 1.4);
  else { drawIcon(x, type, 86, 72, 1.3); x.fillStyle = PAL.ink; x.font = '700 64px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('×' + n, 172, 76); }
  return (mBubbleTex[key] = new T.CanvasTexture(c));
}
const customers = [];
let spawnT = 1;
const haveCows = () => animals.some((an) => an.a === 'cow');
function wants() {
  const kinds = ['egg']; if (trees.some(Boolean)) kinds.push('apple'); if (haveCows() || shelf.milk.items.length + back.count('milk') > 0) kinds.push('milk'); if (bakery) kinds.push('cake'); if (animals.some((an) => an.a === 'sheep') || shelf.wool.items.length + back.count('wool') > 0) kinds.push('wool');
  const have = (k) => shelf[k].items.length + back.count(k), anyStock = kinds.some((k) => have(k) > 0);
  const w = kinds.map((k, i) => (1 + i * 0.8) * (!anyStock || have(k) > 0 ? 1 : 0.08) * (1 + Math.min(3, have(k) / 8))), sum = w.reduce((a, b) => a + b, 0); let r = Math.random() * sum;
  for (let i = 0; i < kinds.length; i++) { r -= w[i]; if (r <= 0) return kinds[i]; } return kinds[0];
}
function spawnCustomer() {
  const taken = (i) => customers.some((c) => c.slot === i);
  const counterFree = SLOTS.findIndex((s, i) => i < 3 + signs() && !taken(i));
  const opts = []; STALL_T.forEach((t, k) => { if (!stalls[t]) return; [6 + 2 * k, 7 + 2 * k].forEach((i) => { if (!taken(i)) opts.push({ i, w: stalls[t].shelf.items.length > 0 ? 3 : 0.4 }); }); });
  if (counterFree >= 0) opts.push({ i: counterFree, w: 2 });
  if (!opts.length) return; let r = Math.random() * opts.reduce((a, o) => a + o.w, 0), free = opts[0].i; for (const o of opts) { r -= o.w; if (r <= 0) { free = o.i; break; } }
  const kind = GUESTS[Math.floor(Math.random() * GUESTS.length)], g = guestModel(kind); g.position.set(MKT.entry[0], 0, MKT.entry[1]); sc.add(g);
  const type = slotStall(free) || wants(), n = 1 + Math.floor(Math.random() * Math.min(4, 1 + Math.floor(Object.keys(shop().owned).length / 4) + Math.floor(state.lv.guests / 3)));
  const sp = new T.Sprite(new T.SpriteMaterial({ map: mBubble(type, n), depthTest: false })); sp.scale.set(0.9, 0.56, 1); sp.position.y = 1.55; sp.renderOrder = 5; sp.visible = false; g.add(sp);
  const hold = new Pile(g, (k) => [0, 0.25 + k * 0.12, 0.3]);
  customers.push({ g, kind, type, n, got: 0, slot: free, st: 'in', sp, hold, t: 0, bob: Math.random() * 6, wait: 0, stall: slotStall(free) });
}

/* ---------- Pip in the market: pick up, drop off, collect coins, pay the coin pad ---------- */
const nearP = (x, z, r) => Math.hypot(pip.position.x - x, pip.position.z - z) < r;
const toBasket = (m) => fly(m, () => { carry.parent.updateMatrixWorld(); return pip.localToWorld(tmpV.set(0, 0.72 + carry.items.reduce((a, b) => a + ITEM_H[b.userData.type], 0), -0.32)); }, () => carry.add(m));
let mxT = 0, backT = 0;
function pipMarket(dt) {
  mxT -= dt; if (mxT > 0) return; let did = false;
  if (carry.items.length < cap() && !pickHeld()) for (const q of mProd) { if (q.pile.items.length && (q.near ? q.near() : nearP(q.x, q.z, q.r))) { const m = q.pile.take(); toBasket(m); Snd.play('pop', { gain: 0.45, f: 500 + carry.items.length * 60 }); did = true; break; } }
  /* 'near': the feed station by a pen hands out the food that pen's box is lowest on */
  if (!did && carry.items.length < cap() && !pickHeld()) for (const st of STATIONS) { if (!nearP(st.x, st.z, 0.95)) continue; const pen = pens[st.a];
    const opts = st.foods.filter((t) => sources[t]); if (!opts.length) break;
    const have = (a) => (pen ? boxCount(pen, a) : 0) + carry.count(a), t = opts.slice().sort((a, b) => have(a) - have(b))[0]; if (pen && have(t) >= BOX_MAX) break;
    const m = mk(t); m.position.set(st.x, 0.6, st.z - 0.7); sc.add(m); toBasket(m); Snd.play('pop', { gain: 0.45, f: 500 + carry.items.length * 60 }); did = true; break; }
  if (!did && bakery && nearP(B_IN.x, B_IN.z, 0.95) && carry.count('egg') && bakery.inp.items.length < 12) { const m = carry.take('egg'); fly(m, () => tmpV.set(B_IN.x, 0.2, B_IN.z), () => bakery.inp.add(m)); Snd.play('tick', { gain: 0.4 }); did = true; }
  if (!did) for (const t in stalls) { const d = sDrop(t), s = stalls[t]; if (nearP(d[0], d[1], 0.9) && carry.count(t) && s.shelf.items.length < SHELF_MAX) { const m = carry.take(t); fly(m, () => s.g.localToWorld(tmpV.set(0, 1.0, 0)), () => s.shelf.add(m)); Snd.play('tick', { gain: 0.45, f: 900 }); did = true; break; } }
  if (!did && nearP(SDROP.x, SDROP.z, 1.0)) { const m = carry.items.slice().reverse().find((q) => GOODS.includes(q.userData.type) && (shelf[q.userData.type].items.length < SHELF_MAX || back.items.length < BACK_MAX)); if (m) { carry.take(m.userData.type); stock(m); Snd.play('tick', { gain: 0.45, f: 900 }); did = true; } }
  /* the storage crate takes, one by one, whatever no stall can take now: goods go on the pile, animal food flies home to its shed */
  if (!did && nearP(SBACK.x, SBACK.z, SHED_R)) { const q = carry.items.slice().reverse().find((o) => stuckT(o.userData.type) && (!GOODS.includes(o.userData.type) || back.items.length < BACK_MAX));
    if (q) { const t = q.userData.type, m = carry.take(t);
      if (GOODS.includes(t)) fly(m, () => backG.localToWorld(tmpV.set(0, 0.5, 0)), () => back.add(m)); else fly(m, () => tmpV.set(SRC[t].x, 0.6, SRC[t].z), () => sc.remove(m), 0.45);
      Snd.play('tick', { gain: 0.4, f: 760 }); did = true; } }
  if (did) mxT = 0.09;
}
/* empty the basket: food goes back to its shed, goods go to the shop's crate (or back to the farm crate if that is full) */
function dumpOne(m, k) {
  const t = m.userData.type, d = 0.45 + k * 0.06;
  if (SRC[t]) fly(m, () => tmpV.set(SRC[t].x, 0.6, SRC[t].z), () => sc.remove(m), d);
  else if (back.items.length + k + 1 < BACK_MAX) fly(m, () => backG.localToWorld(tmpV.set(0, 0.4, 0)), () => back.add(m), d);
  else { const cr = crateFor(t); fly(m, () => cr.g.localToWorld(tmpV.set(0, 0.5, 0)), () => { if (cr.pile.items.length < SHIP_MAX) cr.pile.add(m); else sc.remove(m); }, d); }
}
/* after emptying, Pip picks nothing up until it walks away from that spot, so standing at a shed or crate doesn't refill the basket at once */
let dumpHold = null;
function pickHeld() { if (dumpHold && Math.hypot(pip.position.x - dumpHold.x, pip.position.z - dumpHold.z) > 1.0) dumpHold = null; return !!dumpHold; }
/* things already flying into the basket when it was emptied follow the rest instead of landing on Pip's back */
carry.add = function (m) { if (dumpHold && performance.now() - dumpHold.at < 700) { dumpOne(m, 0); return; } Pile.prototype.add.call(this, m); };
function dumpBasket() {
  let k = 0; Snd.play('whoosh', { gain: 0.35 });
  dumpHold = { x: pip.position.x, z: pip.position.z, at: performance.now() };
  while (carry.items.length) dumpOne(carry.take(), k++);
}

/* ---------- the market each frame ---------- */
let inMktT = false;
function inMarketTown() { const x = pip.position.x, z = pip.position.z, m = inMktT ? 0.6 : 0; inMktT = !inHouse && x > 8.4 - m && z > -5.2 - m && z < 6 + m; return inMktT; }
function marketStep(dt) {
  placeCoinPill(); $('coins2').textContent = fmt(shop().coins);
  /* production: apple trees grow apples, the bakery turns eggs into cakes */
  trees.forEach((q) => { if (!q) return; if (q.pile.items.length >= q.max) { q.t = 0; return; } q.t += dt * mFarm() * (season === 'winter' ? 0.5 : 1); if (q.t >= q.every) { q.t = 0; q.pile.add(mk('apple')); } });
  if (bakery) {
    if (bakery.inp.items.length && bakery.out.items.length < 12) { bakery.work += dt * mFarm(); if (bakery.work >= bakery.every) { bakery.work = 0; const e = bakery.inp.take(); bakery.inp.parent.remove(e); bakery.out.add(mk('cake')); Snd.play('ding', { gain: 0.15, f: 'G6' }, 0, 300); } }
    bakery.smoke.forEach((m) => { const q = (time * 0.4 + m.userData.ph) % 1, on = bakery.inp.items.length > 0; m.visible = on; m.position.y = 2.3 + q * 1.4; m.scale.setScalar(0.6 + q); });
  }
  if (!inHouse && !trip) pipMarket(dt);
  const moving = Math.hypot(target.x - pip.position.x, target.z - pip.position.z) > 0.15;
  if (!inHouse) mPiles.forEach((o) => { if (o.n > 0 && nearP(o.x, o.z, 0.85)) { const n = o.n; o.n = 0; o.show(); earnCoins(n); coinFly(o.x, 0.3, o.z, Math.ceil(n / 3)); Snd.play('coin', { gain: 0.6 }); } });
  if (sPad) {
    const pos = sPadPos(sPad.p), left = sPad.p.cost - (shop().paid[sPad.p.id] || 0);
    if (!inHouse && nearP(pos[0], pos[1], 0.85) && !moving) {
      if (shop().coins > 0) {
        const amt = Math.min(shop().coins, left, Math.max(1, Math.ceil(sPad.p.cost * dt / 1.2)));
        shop().coins -= amt; shop().paid[sPad.p.id] = (shop().paid[sPad.p.id] || 0) + amt; sPad.coinT -= dt;
        if (sPad.coinT <= 0) { sPad.coinT = 0.08; const m = new T.Mesh(coinGeo, MAT); m.position.set(pip.position.x, 1.4, pip.position.z); sc.add(m); fly(m, () => tmpV.set(pos[0], 0.1, pos[1]), () => sc.remove(m), 0.25); Snd.play('tick', { gain: 0.3, f: 1200 }, 0, 70); }
        if (shop().paid[sPad.p.id] >= sPad.p.cost) sUnlock(sPad.p);
      } else if (!sPad.poor) { sPad.poor = true; Snd.play('tock', { gain: 0.3, f: 300 }); flash(coinPill, 'no'); }
    } else if (sPad) sPad.poor = false;
    if (sPad) { const l2 = sPad.p.cost - (shop().paid[sPad.p.id] || 0); if (l2 !== sPad.shown) { sPad.shown = l2; sPad.disc.material.map.dispose(); sPad.disc.material.map = sPadTex(sPad.p, l2); } sPad.g.scale.setScalar(1 + (reduced ? 0 : Math.sin(time * 3) * 0.03)); }
  }
  /* the back crate refills shelves that run low */
  backT -= dt; if (backT <= 0 && back.items.length) { backT = 0.15;
    const low = Object.values(stalls).filter((s) => s.shelf.items.length < SHELF_MAX - 2 && back.count(s.t)).sort((a, b) => a.shelf.items.length - b.shelf.items.length)[0];
    if (low) { const m = back.take(low.t); fly(m, () => low.g.localToWorld(tmpV.set(0, 1.0, 0)), () => low.shelf.add(m), 0.6); } else for (const t in shelf) if (shelf[t].items.length < SHELF_MAX - 2 && back.count(t)) { const m = back.take(t); fly(m, () => counterG.localToWorld(tmpV.set(SHELF_X[t], 1.0, 0)), () => shelf[t].add(m)); break; } }
  for (const t in stalls) if (stalls[t].stocker) runStocker(stalls[t].stocker, dt);
  mHelpers.forEach((h) => { if (h) runShopHelper(h, dt); });
  guestStep(dt); vanStep(dt);
}
/* a stocking robot fetches only its own product and keeps its stall full; the cake robot also feeds eggs to the bakery */
function runStocker(h, dt) {
  const s = stalls[h.t], drop = sDrop(h.t);
  if (h.st === 'idle') { const q = mProd.filter((q) => q.pile.count(h.t)).sort((a, b) => b.pile.count(h.t) - a.pile.count(h.t))[0]; h.feed = false;
    const hq = !q && h.t === 'cake' && bakery && bakery.inp.items.length < 6 ? mProd.filter((q2) => q2.pile.count('egg')).sort((a, b) => b.pile.count('egg') - a.pile.count('egg'))[0] : null;
    if (q && s.shelf.items.length < SHELF_MAX - 2) { h.src = q; h.st = 'go'; } else if (hq && s.shelf.items.length < SHELF_MAX - 2) { h.src = hq; h.feed = true; h.st = 'go'; } else walkTo(h.g, h.home[0], h.home[1], dt, 2); }
  else if (h.st === 'go') { if (walkTo(h.g, h.src.x + 0.5, h.src.z + 0.3, dt, 2.6)) { h.st = 'load'; h.t2 = 0; } }
  else if (h.st === 'load') { h.t2 -= dt; if (h.t2 <= 0) { h.t2 = 0.15; const want = h.feed ? 'egg' : h.t; if (h.src.pile.count(want) && h.pile.items.length < 8) { const m = h.src.pile.take(want); fly(m, () => h.g.localToWorld(tmpV.set(0, 0.6 + h.pile.items.length * 0.18, -0.28)), () => h.pile.add(m)); } else { h.st = h.pile.items.length ? 'ret' : 'idle'; h.src = null; } } }
  else if (h.st === 'ret') { const to = h.feed ? [B_IN.x - 0.5, B_IN.z + 0.5] : [drop[0] - 0.5, drop[1]]; if (walkTo(h.g, to[0], to[1], dt, 2.6)) { h.st = 'drop'; h.t2 = 0; } }
  else if (h.st === 'drop') { h.t2 -= dt; if (h.t2 <= 0) { h.t2 = 0.12; if (!h.pile.items.length) h.st = 'idle'; else if (h.feed) { if (bakery.inp.items.length < 12) { const m = h.pile.take(); fly(m, () => tmpV.set(B_IN.x, 0.2, B_IN.z), () => bakery.inp.add(m)); } else h.t2 = 0.5; } else if (s.shelf.items.length < SHELF_MAX) { const m = h.pile.take(); fly(m, () => s.g.localToWorld(tmpV.set(0, 1.0, 0)), () => s.shelf.add(m)); } else h.t2 = 0.5; } }
  h.g.position.y = h.st === 'go' || h.st === 'ret' ? Math.abs(Math.sin(time * 12 + 3)) * 0.04 : 0;
}
/* shop helpers carry from the fullest producer (the farm crate too) to the counter */
function runShopHelper(h, dt) {
  const n = h.i, home = MKT.helpers[n];
  if (h.st === 'idle') { let best = null, bn = 0; mProd.forEach((q) => { const k = q.pile.items.length; if (k > bn && !mHelpers.some((o) => o && o !== h && o.src === q)) { bn = k; best = q; } }); if (best) { h.src = best; h.st = 'go'; } else walkTo(h.g, home[0], home[1], dt, 2); }
  else if (h.st === 'go') { if (walkTo(h.g, h.src.x + 0.5, h.src.z + 0.3, dt, 2.8)) { h.st = 'load'; h.t = 0; } }
  else if (h.st === 'load') { h.t -= dt; if (h.t <= 0) { h.t = 0.15; if (h.src.pile.items.length && h.pile.items.length < 6) { const m = h.src.pile.take(); fly(m, () => h.g.localToWorld(tmpV.set(0, 0.6 + h.pile.items.length * 0.18, -0.28)), () => h.pile.add(m)); } else { h.st = h.pile.items.length ? 'ret' : 'idle'; h.src = null; } } }
  else if (h.st === 'ret') { if (walkTo(h.g, SDROP.x + (n ? 0.6 : -0.6), SDROP.z + 0.2, dt, 2.8)) { h.st = 'drop'; h.t = 0; } }
  else if (h.st === 'drop') { h.t -= dt; if (h.t <= 0) { h.t = 0.12; const m = h.pile.items.length ? h.pile.items[h.pile.items.length - 1] : null; if (m && (shelf[m.userData.type].items.length < SHELF_MAX || back.items.length < BACK_MAX)) { h.pile.take(m.userData.type); stock(m); } else h.st = 'idle'; } }
  h.g.position.y = h.st === 'go' || h.st === 'ret' ? Math.abs(Math.sin(time * 12 + n)) * 0.04 : 0;
}
function guestStep(dt) {
  if (!customers.length) spawnT = Math.min(spawnT, 0.5);
  spawnT -= dt; if (spawnT <= 0) { spawnT = guestEvery(); if (marketOpen()) spawnCustomer(); } /* no new guests outside opening hours (marketOpen in hours.js) */
  for (let i = customers.length - 1; i >= 0; i--) {
    const c = customers[i];
    c.g.children[0].position.y = 0.36 + (reduced ? 0 : Math.abs(Math.sin(time * 8 + c.bob)) * 0.03);
    if (c.slot >= 3 && c.slot < 6 && !customers.some((o) => o.slot === c.slot - 3)) c.slot -= 3; /* step up to the counter */
    if (c.st === 'in') { const q = SLOTS[c.slot]; if (walkTo(c.g, q[0], q[1], dt, guestWalk()) && (c.slot < 3 || c.slot >= 6)) { c.st = 'wait'; c.wait = 0; c.g.rotation.y = c.stall && STL[c.stall].f < 0 ? Math.PI : 0; c.sp.visible = true; } else if (c.slot >= 3) c.sp.visible = true; }
    else if (c.st === 'wait') {
      /* after closing time, guests who got nothing yet go home after a short wait */
      if (!marketOpen() && c.got === 0) { c.closeT = (c.closeT || 0) + dt; if (c.closeT > 6) { c.sp.visible = false; c.st = 'out'; c.slot = -1; continue; } }
      c.t -= dt; c.sp.position.y = 1.55 + (reduced ? 0 : Math.sin(time * 3 + c.bob) * 0.04);
      const src = c.stall ? stalls[c.stall].shelf : shelf[c.type];
      if (!c.stall && !src.items.length && c.got === 0) { c.wait += dt; if (c.wait > 8) { const alt = Object.keys(shelf).filter((t) => shelf[t].items.length > 0); if (alt.length) { c.type = alt[Math.floor(Math.random() * alt.length)]; c.n = Math.min(c.n, Math.max(1, shelf[c.type].items.length)); c.sp.material.map = mBubble(c.type, c.n); c.wait = 0; Snd.play('pop', { gain: 0.3, f: 600 }); } } }
      if (c.t <= 0 && src.items.length) { c.t = 0.3; const m = src.take(); fly(m, () => c.g.localToWorld(tmpV.set(0, 0.3 + c.got * 0.12, 0.3)), () => { c.hold.add(m); }); c.got++; Snd.play('blip', { gain: 0.25 }, 0, 80); if (c.got >= c.n) { c.st = 'pay'; c.t = 0.4; } }
    } else if (c.st === 'pay') {
      c.t -= dt; if (c.t <= 0) {
        const v = VALUE[c.type] * c.n, st = c.stall && stalls[c.stall];
        if (st && !st.seller) { st.money.n += v; st.money.show(); Snd.play('coin', { gain: 0.3 }, 0, 120); }
        else if (st || cashier) { earnCoins(v); coinFly(c.g.position.x, 1, c.g.position.z, 3); Snd.play('coin', { gain: 0.35 }, 0, 120); }
        else { money.n += v; money.show(); Snd.play('coin', { gain: 0.3 }, 0, 120); }
        c.sp.material.map = mBubble('heart', 0); c.st = 'out'; c.t = 1.2; c.slot = -1;
      }
    } else if (c.st === 'out') {
      c.t -= dt; if (c.t <= 0) c.sp.visible = false;
      if (walkTo(c.g, MKT.exit[0], MKT.exit[1], dt, guestWalk())) { sc.remove(c.g); customers.splice(i, 1); }
    }
  }
}

/* ---------- where the arrow points: the market when Pip is there or carries goods, the farm otherwise ---------- */
const carriesGoods = () => carry.items.some((m) => GOODS.includes(m.userData.type));
function marketGoal() {
  const p = nextSPad(), goods = carriesGoods();
  if (p && shop().coins >= p.cost - (shop().paid[p.id] || 0)) return sPadPos(p);
  const mp = mPiles.filter((o) => o.n > 0).sort((a, b) => b.n - a.n)[0];
  if (mp && !goods) return [mp.x, mp.z];
  if (goods && carry.items.length >= cap() && carry.items.every((m) => stuckT(m.userData.type)) && back.items.length < BACK_MAX) return [SBACK.x, SBACK.z + 0.8];
  if (goods && (carry.items.length >= cap() || !mProd.some((q) => q.kind !== 'crate' && q.pile.items.length > 0 && nearP(q.x, q.z, 6)))) {
    if (bakery && carry.items.every((m) => m.userData.type === 'egg' || !GOODS.includes(m.userData.type)) && shelf.cake.items.length < 3 && bakery.inp.items.length < 4) return [B_IN.x, B_IN.z];
    return [SDROP.x, SDROP.z];
  }
  let best = null, bn = 0; mProd.forEach((q) => { const n = q.pile.items.length; if (n > bn) { bn = n; best = q; } });
  if (best) return [best.x, best.z];
  if (goods) return [SDROP.x, SDROP.z];
  if (mp) return [mp.x, mp.z];
  return null;
}
function guideGoal() {
  /* carrying goods: to the market. Otherwise the animals come first, then whatever the market needs (the truck to unload, coins to pick up) */
  /* animals that must go to the barn or back to their pen come first, even from inside the store or the house: then the arrow shows the way out */
  { const bg = barnGoal(); if (bg) { if (inStore) return [SI.x, SI.z + 4.7]; if (inHouse && !inBarn) return typeof homeExit === 'function' ? homeExit() : [HO.x, HO.z + 4.6]; return bg; } }
  if (inStore) return storeGoal();
  if (carriesGoods()) return marketGoal() || goal();
  { const sg = storeGoal(); if (sg) return sg; }
  /* 'van': when the truck waits at the market with goods, go and unload it (unless Pip is carrying animal food) */
  if (VARIANT === 'van' && (inMarketTown() || (van && van.st === 'there' && van.pile.items.length && !carry.items.some((m) => SRC[m.userData.type])))) return marketGoal() || goal();
  return goal() || marketGoal();
}
/* the picture map's market badge: coins waiting, or a guest at the counter with nothing on the shelf */
function marketNeed() {
  if (mPiles.some((o) => o.n > 0)) return actIcon('coin');
  const c = customers.find((q) => q.st === 'wait' && !q.stall && !shelf[q.type].items.length); if (c) return actIcon(c.type);
  if (sPad && shop().coins >= sPad.p.cost - (shop().paid[sPad.p.id] || 0)) return actIcon('coin');
  return null;
}
function marketInit() {
  if (!state.shop || typeof state.shop !== 'object') state.shop = { coins: 0, total: 0, owned: {}, paid: {} };
  ['owned', 'paid'].forEach((k) => { if (!state.shop[k]) state.shop[k] = {}; }); state.shop.owned.tree1 = true;
  appleTree(0); SPADS.forEach((p) => { if (sOwn(p.id)) sBuild(p); }); showSPad();
  if (VARIANT === 'van') makeVan();
}
/* ---------- 'van': the little flatbed truck ----------
   It waits by the farm crate and loads the eggs and milk by itself. When the bed is full (or the crate is empty),
   it drives round the ring road to the market and parks by the street. Pip (or the shop robots) unload it to the right stall,
   and when the bed is empty it drives home again. Farm upgrades in the house make the bed bigger. */
let van = null;
const vanCap = () => 6 + 2 * state.lv.farm, VAN_RX = 1.3, VAN_RZ = 1.8;
const vanBusy = () => !!van && van.st !== 'home';
function vanPath() {
  const p = [[-9.3, -0.1], [-8.2, 0.25]];
  /* round the south half of the ring road, then east along the lane into the yard behind the stalls */
  for (let k = 1; k <= 18; k++) { const a = Math.PI - k / 24 * Math.PI; p.push([Math.cos(a) * 8, Math.sin(a) * 7.6]); }
  p.push([8.0, 6.6], [12.0, 6.4], [14.0, 5.7], [15.4, 5.6]); return p;
}
function makeVan() {
  const g = new T.Group(); sc.add(g); const body = new T.Group(); g.add(body);
  let geo = new T.BoxGeometry(1.0, 0.16, 2.0); part(fac(geo, PAL.ink, 980), body, 0, 0.3, 0);
  geo = new T.BoxGeometry(0.95, 0.62, 0.72, 2, 2, 1); part(fac(jit(geo, 0.01, 2), PAL.sea, 981), body, 0, 0.68, 0.58);
  geo = new T.BoxGeometry(0.97, 0.06, 0.74); part(fac(geo, PAL.paper, 982), body, 0, 1.01, 0.58);
  const glass = new T.Mesh(new T.PlaneGeometry(0.78, 0.3), new T.MeshBasicMaterial({ color: '#cfe8f2' })); glass.position.set(0, 0.8, 0.945); body.add(glass);
  [-1, 1].forEach((s) => { const sw = new T.Mesh(new T.PlaneGeometry(0.42, 0.26), new T.MeshBasicMaterial({ color: '#cfe8f2', side: T.DoubleSide })); sw.rotation.y = Math.PI / 2; sw.position.set(s * 0.48, 0.82, 0.62); body.add(sw); });
  geo = new T.BoxGeometry(0.95, 0.08, 1.15); part(fac(geo, PAL.trunk, 983), body, 0, 0.42, -0.42);
  [[-0.47, 0, 0.06, 1.15], [0.47, 0, 0.06, 1.15], [0, -0.98, 0.95, 0.06]].forEach(([x, z, w, d], k) => { const s2 = new T.BoxGeometry(w, 0.22, d); const m = part(fac(s2, PAL.ochre, 984 + k), body, x, 0.55, z - (k < 2 ? 0.42 : 0)); m.material = flPlankMat(); });
  mlTruck(body, g); /* bonnet, grille, mudguards, hubs (marketlook.js) */
  [[-0.5, 0.62], [0.5, 0.62], [-0.5, -0.6], [0.5, -0.6]].forEach(([x, z], k) => { const w = new T.CylinderGeometry(0.2, 0.2, 0.16, 10); w.rotateZ(Math.PI / 2); part(fac(w, '#3a3433', 988 + k), g, x, 0.2, z); });
  [-0.3, 0.3].forEach((x) => { const l = new T.Mesh(new T.CircleGeometry(0.07, 8), lampMat); l.position.set(x, 0.55, 0.955); body.add(l); });
  const pile = new Pile(body, (k) => [-0.3 + (k % 4) * 0.2, 0.52 + Math.floor(k / 16) * 0.22, -0.82 + (Math.floor(k / 4) % 4) * 0.25]);
  const path = vanPath();
  van = { g, body, pile, path, st: 'home', i: 0, t: 0, wait: 0, prod: null };
  g.position.set(path[0][0], 0, path[0][1]); g.rotation.y = Math.PI / 2;
}
function vanStep(dt) {
  if (!van) return; const v = van, cr = CRATES[0];
  if (v.st === 'home') {
    v.t -= dt; v.wait += dt;
    if (v.t <= 0 && cr.pile.items.length && v.pile.items.length < vanCap()) { v.t = 0.18; v.wait = 0; const m = cr.pile.take(); fly(m, () => v.body.localToWorld(tmpV.set(0, 0.7, -0.4)), () => v.pile.add(m), 0.5); Snd.play('tick', { gain: 0.25, f: 700 }, 0, 60); }
    if (v.pile.items.length >= vanCap() || (v.pile.items.length && !cr.pile.items.length && v.wait > 1.5)) { v.st = 'go'; v.i = 1; Snd.play('pop', { gain: 0.35, f: 330 }); }
  } else if (v.st === 'go' || v.st === 'back') {
    const pts = v.path, k = v.st === 'go' ? v.i : pts.length - 1 - v.i, q = pts[k], p = v.g.position, dx = q[0] - p.x, dz = q[1] - p.z, d = Math.hypot(dx, dz), sp = 5.2 * dt;
    if (d > 1e-3) { const ry = Math.atan2(dx, dz); let dr = ry - v.g.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); v.g.rotation.y += dr * Math.min(1, dt * 8); }
    if (d <= sp) { p.set(q[0], 0, q[1]); v.i++; if (v.i >= pts.length) {
      if (v.st === 'go') { v.st = 'there'; v.wait = 0; Snd.play('ding', { gain: 0.35, f: 'E6' }); Snd.play('ding', { gain: 0.3, f: 'C6' }, 0.18);
        /* Pip unloads from anywhere round the truck: inside a rope ring laid round it while it is parked */
        v.prod = { kind: 'van', pile: v.pile, x: 0, z: 0, r: 1.15, near: () => { v.g.updateMatrixWorld(); const l = v.g.worldToLocal(tmpV.copy(pip.position)); return Math.abs(l.x) < VAN_RX && Math.abs(l.z) < VAN_RZ; } }; mProd.push(v.prod);
        if (!v.ring) { v.ring = flRing(p.x, p.z, VAN_RX); v.ring.scale.set(1, 1, VAN_RZ / VAN_RX); } v.ring.position.set(p.x, 0.02, p.z); v.ring.rotation.y = v.g.rotation.y; v.ring.visible = true; }
      else { v.st = 'home'; v.wait = 0; v.g.rotation.y = Math.PI / 2; } } }
    else { p.x += dx / d * sp; p.z += dz / d * sp; }
    v.body.position.y = reduced ? 0 : Math.abs(Math.sin(time * 14)) * 0.02;
  } else if (v.st === 'there') {
    /* the bed is picked from the side of the truck that faces the stalls */
    v.g.updateMatrixWorld(); const s = v.g.localToWorld(tmpV.set(1.15, 0, -0.4)); v.prod.x = s.x; v.prod.z = s.z;
    v.wait = v.pile.items.length ? 0 : v.wait + dt;
    if (v.wait > 1.2) { const j = mProd.indexOf(v.prod); if (j >= 0) mProd.splice(j, 1); v.prod = null; if (v.ring) v.ring.visible = false; v.st = 'back'; v.i = 1; Snd.play('pop', { gain: 0.35, f: 330 }); }
  }
}
function marketTest() {
  return { coins: () => shop().coins, giveCoins: (n) => { shop().coins += n; }, shop: () => JSON.stringify(shop().owned), crate: () => CRATES.map((c) => c.pile.items.map((m) => m.userData.type[0]).join('')).join('|'), fillCrate: (t, n) => { for (let k = 0; k < (n || 4); k++) crateFor(t || 'egg').pile.add(mk(t || 'egg')); }, van: () => van ? van.st + ':' + van.pile.items.length : null, src: (t) => addSource(t), stations: () => STATIONS.map((s) => [s.x, s.z]),
    shelves: () => Object.fromEntries(GOODS.map((t) => [t, shelf[t].items.length])), back: () => back.items.length, shed: () => [SBACK.x, SBACK.z], guests: () => customers.map((c) => c.slot + ':' + c.type + ':' + c.st).join(' '),
    money: () => mPiles.map((o) => o.n).join(','), stalls: () => Object.keys(stalls).join(','), sPad: () => sPad && sPad.p.id, goal: () => guideGoal(), dump: dumpBasket, inMarket: () => inMarketTown(), unlockAll: () => { SPADS.forEach((p) => { if (!sOwn(p.id)) { shop().owned[p.id] = true; sBuild(p); } }); showSPad(); } };
}
