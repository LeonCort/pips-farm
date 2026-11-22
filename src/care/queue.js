/* ---------- the unlock queues: one for hearts (farm, barn, Pip's gear), one for coins (market, house, island) ----------
   Only the next thing in each queue is offered, at a price set from what an okay player earns at that point (see the
   balance doc, model in pips-balance/model2.py). Hearts can be swapped for coins at the swap pad by the store, so a child
   who only farms still gets the house and the island along. Furniture, colours and decorations stay a free shop. */
const QUEUE = {
  h: [["gear:speed1", 10], ["pig1", 12], ["hen3", 20], ["pig2", 30], ["gear:bag1", 40], ["house-hen", 45], ["help-water", 70], ["xp-stream", 95], ["gear:farm1", 85], ["hay", 115], ["duck1", 150], ["sheep1", 120], ["gear:speed2", 160], ["tractor", 175], ["cow1", 190], ["rabbit1", 210], ["gear:guests1", 250], ["goat1", 270], ["sheep2", 330], ["xp-loft", 360], ["gear:bag2", 390], ["house-pig", 430], ["xp-auto", 480], ["cow2", 540], ["xp-wheat", 600], ["gear:farm2", 650], ["xp-silo", 760], ["stall6", 840], ["hen4", 890], ["duck2", 950], ["gear:speed3", 1050], ["help-grain", 1150], ["xp-bees", 1250], ["horse1", 1350], ["xp-sprink", 1450], ["gear:guests2", 1600], ["house-sheep", 1750], ["rabbit2", 1900], ["goat2", 2100], ["xp-pump", 2300], ["gear:bag3", 2400], ["house-cow", 2650], ["duck3", 2600], ["pig3", 3250], ["xp-donkey", 3000], ["gear:farm3", 3700], ["alpaca1", 3600], ["stall8", 4650], ["horse2", 4950], ["alpaca2", 5300], ["gear:speed4", 5700], ["sheep3", 6300], ["help-hay", 7300], ["gear:guests3", 7500], ["bull1", 8100], ["gear:bag4", 8800], ["goat3", 8800], ["house-horse", 9400], ["gear:farm4", 10300], ["stall10", 11800], ["cow3", 11800], ["gear:speed5", 12700], ["help-carrot", 12700], ["house-bull", 12700], ["gear:guests4", 13500], ["stall12", 13500], ["gear:farm5", 13500], ["gear:bag6", 15100], ["gear:speed6", 16900], ["gear:guests6", 19000], ["gear:farm6", 21200], ["gear:bag7", 23800], ["gear:speed7", 26600], ["gear:guests7", 29800], ["gear:farm7", 33400], ["gear:bag8", 37400], ["gear:speed8", 41900], ["gear:guests8", 47000], ["gear:farm8", 52600]],
  c: [["tree2", 20], ["sign1", 40], ["stall-egg", 45], ["isle:garden", 45], ["tree3", 50], ["isle:square", 90], ["stock-egg", 95], ["house:kitchen", 105], ["stall-apple", 115], ["sell-egg", 125], ["helper1", 170], ["stock-apple", 185], ["isle:style1", 200], ["sign2", 220], ["isle:fountain-set", 230], ["sell-apple", 250], ["bakery", 270], ["stall-wool", 380], ["stall-milk", 580], ["house:east-wing", 860], ["cashier", 920], ["stock-milk", 1150], ["stock-wool", 1300], ["isle:style2", 1250], ["sell-milk", 1450], ["sign3", 1550], ["sell-wool", 1600], ["isle:pond-set", 1650], ["stall-cake", 1750], ["helper2", 1900], ["house:west-wing", 2050], ["stock-cake", 2200], ["sell-cake", 2350], ["isle:lighthouse-set", 2950]]
};

const Q_ISLE = { 'isle:garden': 'sg', 'isle:square': 's1', 'isle:fountain-set': 's2', 'isle:pond-set': 's3', 'isle:lighthouse-set': 's4', 'isle:style1': 'p1', 'isle:style2': 'p2' };
const Q_SIZE = { 'house:kitchen': 2, 'house:east-wing': 3, 'house:west-wing': 4 };
const Q_PRICE = {}; QUEUE.h.concat(QUEUE.c).forEach(([id, p]) => { Q_PRICE[id] = p; });
const SWAP = 2; /* hearts per coin at the swap pad */
function qOwned(id) {
  if (id.startsWith('gear:')) { const m = id.slice(5).match(/^([a-z]+)(\d+)$/); return (state.lv[m[1]] || 0) >= +m[2]; }
  if (Q_SIZE[id]) return !!stS() && stS().size >= Q_SIZE[id];
  if (Q_ISLE[id]) { const k = Q_ISLE[id], t = ISET_BY[k]; return t ? setOwn(t) : !!isleX().pk[k]; }
  if (PADS.some((p) => p.id === id)) return !!state.owned[id];
  if (BPADS.some((p) => p.id === id)) return !!barnS().owned[id];
  if (SPADS.some((p) => p.id === id)) return !!shop().owned[id];
  return true;
}
/* the next thing in a queue: the first one not owned yet (farms from before keep what they have, and pick up wherever they are) */
function qHead(tr) { for (const [id] of QUEUE[tr]) if (!qOwned(id)) return id; return null; }

/* the prices of the pads, the barn, the house and the island come from the queue */
PADS.forEach((p) => { if (Q_PRICE[p.id]) p.cost = Q_PRICE[p.id]; });
BPADS.forEach((p) => { if (Q_PRICE[p.id]) p.cost = Q_PRICE[p.id]; });
SPADS.forEach((p) => { if (Q_PRICE[p.id]) p.cost = Q_PRICE[p.id]; });
Object.keys(Q_SIZE).forEach((id) => { const n = Q_SIZE[id]; if (SIZES[n]) SIZES[n].cost = Q_PRICE[id]; });
Object.keys(Q_ISLE).forEach((id) => { const k = Q_ISLE[id], t = ISET_BY[k] || IPACKS.find((q) => q.id === k); if (t) t.cost = Q_PRICE[id]; });
/* gear: priced from the queue, paid with hearts; only the next one in the queue is on its stand */
function qGearCost(u) { const p = Q_PRICE['gear:' + u.id + ((state.lv[u.id] || 0) + 1)]; return p || null; }
const purse = (o) => o && o.gear ? state.coins : shop().coins;
function spend(o, n) { if (o && o.gear) { state.coins -= n; bump(); } else shop().coins -= n; }
function qPad(tr, list) { if (tutOn()) return null; const h = qHead(tr); return list.find((p) => p.id === h) || null; }
{ const n0 = nextPad; nextPad = function () { if (tutOn()) return null; return qPad('h', PADS); }; }
{ const o0 = offerOf; offerOf = function (s) { const o = o0(s); if (!o) return o;
  if (o.gear) { const id = 'gear:' + o.gear + o.lv; if (tutOn() ? !(tutId() === 'buy' && qHead('h') === id) : qHead('h') !== id) return null; }
  if (o.size && o.size >= 2 && qHead('c') !== 'house:' + { 2: 'kitchen', 3: 'east-wing', 4: 'west-wing' }[o.size]) return null;
  return o; }; }
{ const i0 = islePrep; islePrep = function (a) { const h = qHead('c'); if (!h || Q_ISLE[h] !== a.id) return null; return i0(a); }; }
{ const n0 = isleNext; isleNext = function () { const h = qHead('c'), k = h && Q_ISLE[h]; if (!k) return null; const t = ISET_BY[k] || IPACKS.find((q) => q.id === k); if (!t) return null; if (ISET_BY[k] ? t.tier > stS().size : !packOpen(t)) return null; return t; }; }
{ const c0 = catBuy; catBuy = function (a) { if (a && a.k === 'size' && a.n >= 2 && qHead('c') !== 'house:' + { 2: 'kitchen', 3: 'east-wing', 4: 'west-wing' }[a.n]) { Snd.play('tock', { gain: 0.3, f: 300 }); return false; } return c0(a); }; }
{ const s0 = spotOffers; spotOffers = function () { const h = qHead('c'); return s0().filter((o) => { const a = o.act || {};
  if (a.k === 'size' && a.n >= 2) return h === 'house:' + { 2: 'kitchen', 3: 'east-wing', 4: 'west-wing' }[a.n];
  if (a.k === 'isle') return Q_ISLE[h] === a.id && !o.lock; return true; }); }; }
/* the arrow: when the next hearts thing is affordable, it shows the way (a pad, the barn, or the gear stand in the store) */
function qGoalH() {
  if (tutOn() || inHouse) return null; const h = qHead('h'); if (!h || state.coins < Q_PRICE[h] - ((state.paid || {})[h] || 0)) return null;
  const p = PADS.find((q) => q.id === h); if (p) return padPos(p);
  if (BPADS.some((q) => q.id === h)) return [BDOOR.x, BDOOR.z];
  if (h.startsWith('gear:')) return [SDOOR.x, SDOOR.z];
  return null;
}
{ const g0 = goal; goal = function () { return qGoalH() || g0(); }; }
/* new heads: show the next pads as soon as something is bought */
let qKey = '', qT = 0;
function queueStep(dt) {
  qT -= dt; if (qT > 0) return; qT = 0.5; if (tutOn()) return;
  const k = qHead('h') + '|' + qHead('c'); if (k !== qKey) { qKey = k; if (typeof showPad === 'function') showPad(); showSPad(); }
  swapStep(0.5);
}
/* ---------- the swap pad: stand on it and hearts turn into coins ---------- */
const SWAP_AT = { x: STORE.x - 2.1, z: STORE.z + 3.3 };
const swapG = (() => { const g = new T.Group(); g.position.set(SWAP_AT.x, 0.04, SWAP_AT.z); sc.add(g);
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.fillStyle = 'rgba(255,246,228,0.95)'; x.beginPath(); x.arc(128, 128, 120, 0, 7); x.fill(); x.lineWidth = 10; x.strokeStyle = '#e9684a'; x.stroke();
  drawIcon(x, 'heart', 70, 118, 1.1); drawIcon(x, 'coin', 186, 118, 1.1);
  x.strokeStyle = PAL.ink; x.lineWidth = 9; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(108, 120); x.lineTo(146, 120); x.moveTo(134, 104); x.lineTo(150, 120); x.lineTo(134, 136); x.stroke();
  const d = new T.Mesh(new T.CircleGeometry(0.8, 32), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true })); d.rotation.x = -Math.PI / 2; g.add(d); g.add(flPadEdge()); g.visible = false; return g; })();
let swapT = 0;
function swapStep() {}
function swapFrame(dt) {
  swapG.visible = !tutOn() && !inHouse; if (!swapG.visible) return;
  swapG.scale.setScalar(1 + (reduced ? 0 : Math.sin(time * 3) * 0.03));
  const on = Math.hypot(pip.position.x - SWAP_AT.x, pip.position.z - SWAP_AT.z) < 0.75, still = Math.hypot(target.x - pip.position.x, target.z - pip.position.z) < 0.15;
  if (!on || !still || state.coins < SWAP) return;
  swapT -= dt; if (swapT > 0) return; swapT = 0.09;
  const n = Math.max(1, Math.min(Math.floor(state.coins / SWAP), Math.ceil(state.coins / SWAP / 25)));
  state.coins -= n * SWAP; bump(); earnCoins(n); Snd.play('coin', { gain: 0.2 }, 0, 60);
  const h = new T.Mesh(heartGeo, heartMat); h.position.set(pip.position.x, 1.4, pip.position.z); sc.add(h); fly(h, () => tmpV.set(SWAP_AT.x, 0.1, SWAP_AT.z), () => sc.remove(h), 0.3);
}
{ const e0 = extrasStep; extrasStep = function (dt) { e0(dt); queueStep(dt); swapFrame(dt); }; }
if (window.__farmTest) window.__queue = () => ({ h: qHead('h'), c: qHead('c'), ph: Q_PRICE[qHead('h')], pc: Q_PRICE[qHead('c')], pad: pad && pad.p.id, spad: sPad && sPad.p.id, isle: isleNext() && isleNext().id, swap: [SWAP_AT.x, SWAP_AT.z] });
