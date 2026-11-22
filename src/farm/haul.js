/* ---------- haul: the truck is always unloaded in full, the old well by the house gives water, and pens grow with babies too ----------
   Leon's play test (2026-11-22): a stall robot only took its own goods off the truck, so the milk stayed on the bed and the
   truck waited at the market until Pip came by. Now a stall robot that sees the truck parked takes everything on it and
   carries each thing to the right place: its own stall first, then any other stall with room, then the counter or the
   storage crate. Assembled before robots.js, so sleeping robots still sleep. */
const HAUL_MAX = 8;
const vanProd = () => (typeof van !== 'undefined' && van && van.st === 'there' && van.prod && van.pile.items.length ? van.prod : null);
/* where one item goes: its own stall when it has room, otherwise the counter shelf, otherwise the storage crate */
function haulDest(t) {
  const s = stalls[t]; if (s && s.shelf.items.length < SHELF_MAX) return { k: 'stall:' + t, at: sDrop(t) };
  if (shelf[t] && shelf[t].items.length < SHELF_MAX) return { k: 'counter', at: [SDROP.x, SDROP.z] };
  if (back.items.length < BACK_MAX) return { k: 'crate', at: [SBACK.x, SBACK.z + 0.8] };
  return null;
}
/* drop one item at the stop k, if anything in the pile belongs there; true if one went */
function haulDrop(h, k) {
  for (let i = h.pile.items.length - 1; i >= 0; i--) {
    const m = h.pile.items[i], t = m.userData.type, d = haulDest(t); if (!d || d.k !== k) continue;
    h.pile.take(t);
    if (k === 'counter') fly(m, () => counterG.localToWorld(tmpV.set(SHELF_X[t] || 0, 1.0, 0)), () => shelf[t].add(m));
    else if (k === 'crate') fly(m, () => backG.localToWorld(tmpV.set(0, 0.5, 0)), () => back.add(m));
    else { const s = stalls[t]; fly(m, () => s.g.localToWorld(tmpV.set(0, 1.0, 0)), () => s.shelf.add(m)); }
    return true;
  }
  return false;
}
/* the next stop for what the robot carries: its own goods first, then the nearest other stop */
function haulNext(h) {
  const own = h.pile.items.find((m) => m.userData.type === h.t), first = own ? haulDest(h.t) : null; if (first) return first;
  let best = null, bd = 1e9;
  h.pile.items.forEach((m) => { const d = haulDest(m.userData.type); if (!d) return; const r = Math.hypot(d.at[0] - h.g.position.x, d.at[1] - h.g.position.z); if (r < bd) { bd = r; best = d; } });
  return best;
}
const mixedPile = (h) => h.pile.items.some((m) => m.userData.type !== h.t);
function haulLayout(h) { if (h.mixed) return; h.mixed = true; h.pile.layout = (k) => { let y = 0.52; for (let q = 0; q < k; q++) y += ITEM_H[h.pile.items[q].userData.type] || 0.18; return [0, y, -0.28]; }; h.pile.place(); }
{
  const r0 = runStocker;
  runStocker = function (h, dt) {
    haulLayout(h);
    const vp = vanProd();
    /* idle: the truck comes first, since the farm waits for it. Several robots share a big load */
    if (h.st === 'idle' && vp) {
      const busy = Object.values(stalls).filter((s) => s.stocker && s.stocker !== h && s.stocker.vsrc === vp && (s.stocker.st === 'vgo' || s.stocker.st === 'vload')).length;
      if (busy * HAUL_MAX < vp.pile.items.length) { h.vsrc = vp; h.st = 'vgo'; }
    }
    /* carrying other goods than its own (from the truck, or woken up with them): deliver them the haul way */
    if ((h.st === 'ret' || h.st === 'drop') && mixedPile(h)) h.st = 'vret';
    if (h.st === 'vgo') {
      if (!vp || h.vsrc !== vp) { h.vsrc = null; h.st = h.pile.items.length ? 'vret' : 'idle'; }
      else if (walkTo(h.g, vp.x + 0.5, vp.z + 0.3, dt, 2.6)) { h.st = 'vload'; h.t2 = 0; }
    } else if (h.st === 'vload') {
      h.t2 -= dt; if (h.t2 <= 0) { h.t2 = 0.15;
        const src = h.vsrc && h.vsrc.pile;
        if (src && src.items.length && h.pile.items.length < HAUL_MAX) { const m = src.take(src.count(h.t) ? h.t : null); fly(m, () => h.g.localToWorld(tmpV.set(0, 0.6 + h.pile.items.length * 0.18, -0.28)), () => h.pile.add(m)); }
        else { h.vsrc = null; h.st = h.pile.items.length ? 'vret' : 'idle'; } }
    } else if (h.st === 'vret') {
      if (!h.pile.items.length) { h.st = 'idle'; h.stop = null; }
      else { const d = haulNext(h); h.stop = d;
        if (!d) { h.t2 = (h.t2 || 0) - dt; walkTo(h.g, SDROP.x - 0.8, SDROP.z + 0.6, dt, 2); } /* nowhere has room: wait by the counter */
        else if (walkTo(h.g, d.at[0] - 0.5, d.at[1], dt, 2.6)) { h.st = 'vdrop'; h.t2 = 0; } }
    } else if (h.st === 'vdrop') {
      h.t2 -= dt; if (h.t2 <= 0) { h.t2 = 0.12; if (!h.stop || !haulDrop(h, h.stop.k)) h.st = h.pile.items.length ? 'vret' : 'idle'; }
    } else { r0(h, dt); return; }
    h.g.position.y = h.st === 'vgo' || h.st === 'vret' ? Math.abs(Math.sin(time * 12 + 3)) * 0.04 : 0;
  };
}

/* ---------- the old stone well by the house: Pip (and the water robot) fill up with water here ----------
   It stands right of the house, toward the paddocks in the north-east, so the sheep and horses get water without the walk
   to the farm well. A rope ring in front of it shows where to stand. */
const HWELL = typeof WELL !== 'undefined' && WELL ? { x: WELL[0], z: WELL[1] + 1.0, wx: WELL[0], wz: WELL[1] } : null;
const hwell = HWELL ? { rg: ring(HWELL.x, HWELL.z, 0.6), t: 0 } : null;
/* every place Pip can fill up with water right now (the pickup spot, where a robot or Pip stands) */
function waterSpots() {
  const L = [[SRC.water.x, SRC.water.z + 1.0]];
  if (HWELL) L.push([HWELL.x, HWELL.z]);
  if (typeof gwell !== 'undefined' && gwell.on) L.push([GW_PICK.x, GW_PICK.z]);
  return L;
}
/* the water spot closest to a pen's feeding fence, or null when that is the farm well anyway */
function waterFor(a) {
  const f = feedPos(a), L = waterSpots(); let best = 0, bd = 1e9;
  L.forEach((q, i) => { const d = Math.hypot(q[0] - f[0], q[1] - f[1]); if (d < bd) { bd = d; best = i; } });
  return best ? L[best] : null;
}
function hwellStep(dt) {
  if (!hwell || !state) return;
  hwell.t -= dt; if (hwell.t > 0 || inHouse || mount) return;
  if (Math.hypot(pip.position.x - HWELL.x, pip.position.z - HWELL.z) > 0.85 && Math.hypot(pip.position.x - HWELL.wx, pip.position.z - HWELL.wz) > 1.15) return;
  if ((typeof pickHeld === 'function' && pickHeld()) || carry.items.length >= cap()) return;
  const m = mk('water'); m.position.set(HWELL.wx, 0.6, HWELL.wz); sc.add(m);
  fly(m, () => { carry.parent.updateMatrixWorld(); return pip.localToWorld(tmpV.set(0, 0.72 + carry.items.reduce((a, b) => a + ITEM_H[b.userData.type], 0), -0.32)); }, () => carry.add(m));
  Snd.play('pop', { gain: 0.45, f: 500 + carry.items.length * 60 }); hwell.t = 0.12;
}
{ const s0 = storeStep; storeStep = function (dt) { s0(dt); hwellStep(dt); }; }
/* the water robot fetches from the water spot nearest the pen it is filling */
{
  const r0 = runHelper;
  runHelper = function (h, dt) {
    const w = h.t === 'water' && h.st === 'get' && h.target ? waterFor(h.target.a) : null;
    if (!w) { r0(h, dt); return; }
    const ox = SRC.water.x, oz = SRC.water.z; SRC.water.x = w[0] - 0.5; SRC.water.z = w[1] - 0.8;
    try { r0(h, dt); } finally { SRC.water.x = ox; SRC.water.z = oz; }
  };
}
/* the arrow points Pip to the nearest water too */
{ const f0 = foodSpot; foodSpot = function (t, a) { if (t === 'water' && a && sources.water && !stationFor(a, t)) { const w = waterFor(a); if (w) return w; } return f0(t, a); }; }

/* ---------- pens: a new baby makes room for itself too (penBox counts babies as half an animal) ---------- */
{ const m0 = makeBaby; makeBaby = function (mum, coatI, quiet) { const b = m0(mum, coatI, quiet); if (pens[mum.a] && !PEN[mum.a].fix) fencePen(mum.a); return b; }; }

if (window.__farmTest) window.__haul = { waterSpots, waterFor, HWELL, haulDest, vanProd, stalls: () => Object.values(stalls).map((s) => s.stocker ? s.t + ':' + s.stocker.st + ':' + s.stocker.pile.items.map((m) => m.userData.type[0]).join('') : s.t) };
