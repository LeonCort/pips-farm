/* ---------- tiers (Leon's vision for Pips Island, 2026-11-24) ----------
   Four materials only: wood, stone, berries and crystals, plus coins. Harder islands do not bring new materials, they
   give bigger piles of the same ones: a tree at home gives 2 logs, an old orchard oak 5, a winter pine 10.
   Every tree, rock, boulder and crystal has a tier from the island it grows on. The tool has to be at least that tier
   (the smith makes them: people.js). A weaker tool bounces off, and a bubble shows the tool it needs. A better tool hits
   harder, pulls the drops in from further away, and the crystal tools hit the thing next to it too.
   Things grow back after Pip has slept in the tent, not on a timer. */
const BIOME_TIER = { home: 1, rocks: 1, berry: 1, meadow: 1, orchard: 2, stone: 2, clay: 2, cave: 2, marsh: 2, coral: 3, ember: 4, ash: 4, snow: 3 };
const TIER_MUL = [1, 1, 1.5, 2, 2.5]; /* how big the pile is (Leon 2026-11-28: was 1, 2.5, 5, 10, and each island went faster than the last) */
const HIT_MUL = [1, 1, 1.25, 1.5, 1.75]; /* how many more hits it takes, with the right tool */
const HAND = { bush: 1, planks: 1, shroom: 1 }; /* always open: picked by hand, or a door's old boards */
/* the axe is for trees; the pickaxe for everything else that needs a tool. A tool's level (1 to 12, build.js) gives its
   metal (the tier: 1 plain, 2 copper, 3 iron, 4 star crystal) and how sharp it is within that metal (0 to 2). */
const toolKey = (kind) => (kind === 'tree' || kind === 'axe' ? 'axe' : 'pick');
const tierOfLv = (lv) => Math.min(4, 1 + Math.floor((lv - 1) / 3)), sharpOfLv = (lv) => (lv - 1) % 3;
/* Leon 2026-11-28: getting stronger and moving up a tier are two things now. A tier is a new pair of tools, one of each
   family, forged once by a friend (TOOL_FORGE): the smith makes the copper pair (double axe and mattock), the mason the
   iron pair (bow saw and rock drill), the pearl diver the star pair (great saw and chime hammer). The axe and pick cards
   at the anvil only sharpen (levels 1 to 5), and never open anything. */
const TOOL_FORGE = { tool2: 'smith', tool3: 'mason', tool4: 'diver' };
const toolTierNow = () => (bldLv('tool4') > 1 ? 4 : bldLv('tool3') > 1 ? 3 : bldLv('tool2') > 1 ? 2 : 1);
const toolTier = (kind) => toolTierNow();
const toolSharp = (kind) => bldLv(toolKey(kind)) - 1;
const forgeOk = (id) => (id === 'smith' ? forgeUp() : housed(id));
/* the forging cards that can be had now: the friend lives in the settlement and the tier before is done */
const forgeKeys = () => Object.keys(TOOL_FORGE).filter((k) => bldLv(k) < 2 && forgeOk(TOOL_FORGE[k]) && (k === 'tool2' || bldLv('tool' + (+k[4] - 1)) >= 2));
/* the card pictures follow the tools Pip has: a sharper double axe is still a double axe */
function toolPics() { const t = toolTierNow(), s = t > 1 ? String(t) : ''; BLD.axe.pic = [null].concat(Array(5).fill('axe' + s)); BLD.pick.pic = [null].concat(Array(5).fill('pick' + s)); }
const toolKeys = () => (state.isle.tools && state.isle.tools.pick ? ['axe', 'pick'] : ['axe']);
const toolKind = (k) => !HAND[k];
function nodeTier(kind, x, z) {
  if (FIND_NODE[kind]) return FIND_NODE[kind].tier; /* a find's level is its own, not the island's (finds.js) */
  if (HAND[kind]) return 1;
  const A = areaAt(x, z); let t = A ? BIOME_TIER[A.biome] || 1 : 1;
  if (kind === 'boulder' || kind === 'crystal') t = Math.max(t, 2);
  return t;
}
const nodeHits = (n) => HITS[n.kind] * HIT_MUL[n.tier || 1];
/* (finds give their own fixed number: finds.js) */
/* the backpack from the chest: one more piece out of every tree, stone and bush (it used to hold coins) */
const bagMore = (n) => (state.isle.tools.bag && ['log', 'stone', 'berry'].indexOf(YIELD[n.kind][0]) >= 0 ? 1 : 0);
const tierYield = (n) => Math.max(1, Math.round(YIELD[n.kind][1] * TIER_MUL[n.tier || 1])) + bagMore(n);
function gated(n) { return gearGate(n) || toolKind(n.kind) && ((NEED[n.kind] && !hasTool(n.kind)) || toolTier(n.kind) < (n.tier || 1)); }
function gateIcon(n) { if (gearGate(n)) return 'torch'; if (NEED[n.kind] && !hasTool(n.kind)) return 'pick'; const t = n.tier || 1; return (NEED[n.kind] ? 'pick' : 'axe') + (t > 1 ? t : ''); }
function tierPow(n) { return toolKind(n.kind) ? 1 + 1.5 * Math.max(0, toolTier(n.kind) - (n.tier || 1)) + 0.2 * toolSharp(n.kind) : 1; }
const dropReach = () => (toolTier() >= 2 ? 4.5 : 2.2) + 0.7 * xpBag(); /* the level-up pick that was a bigger backpack now reaches further */
/* a tier-2 or tier-3 thing looks bigger: an old oak, a tall winter pine, a big crystal */
function tierInit(n) {
  n.tier = SHOW_T.tier || nodeTier(n.kind, n.x, n.z); n.hp = nodeHits(n);
  if (n.tier >= 2 && (n.kind === 'tree' || n.kind === 'rock' || n.kind === 'crystal')) { const s = n.tier === 2 ? 1.3 : 1.5; n.main.scale.multiplyScalar(s); n.full *= s; }
}
/* the crystal tools: each swing also hits the nearest thing of the same kind next to it */
function wideHit(n, cnt) {
  const near = []; nodes.forEach((m) => { if (m === n || m.kind !== n.kind || m.st !== 'ready' || gated(m)) return; const d = Math.hypot(m.x - n.x, m.z - n.z); if (d < 1.8) near.push([d, m]); });
  near.sort((a, b) => a[0] - b[0]).slice(0, cnt || 1).forEach((q) => nodeHit(q[1], true)); /* the star tools reach three */
}
/* a weak tool bounces off: a little shake, a dull knock, and the bubble with the tool it needs */
function tierBounce(n) { n.shake = 0.14; Snd.play('tock', { gain: 0.35, f: 150 }); isleHint(n); }
/* growing back: once Pip has slept */
const sleepRegrow = (n) => (HAND[n.kind] && n.kind !== 'bush' ? REGROW[n.kind][0] : 1e9);
/* Leon 2026-11-25: everything grows back DURING the night, so when Pip wakes it is all there, nothing left to wait for */
function nodeGrown(n) {
  n.st = 'ready'; n.grow = 1; n.t = 0; n.sleepG = 0; n.hp = nodeHits(n); n.main.visible = true; n.main.rotation.set(0, 0, 0); n.main.position.y = 0;
  if (n.kind === 'tree' && n.stump) n.stump.visible = false;
  if (n.kind === 'bush') { n.main.scale.setScalar(1); if (n.berries) { n.berries.visible = true; n.berries.children.forEach((b) => b.scale.setScalar(1)); } } else n.main.scale.setScalar(n.full);
}
/* Leon 2026-11-25 (later): but it should be SEEN growing, not pop in: as Pip falls asleep every felled tree, mined rock and
   picked bush starts growing, one after the other, and is full size before Pip crawls out (tierWake then only tidies up) */
function sleepGrow() {
  nodes.forEach((n, k) => { if (n.kind === 'planks' || !(n.st === 'gone' || n.st === 'grow' || n.st === 'fall')) return;
    n.st = 'grow'; n.grow = 0.02; n.sleepG = 0.02 + hash(k, 77) * 0.8; n.main.visible = true; n.main.rotation.set(0, 0, 0); n.main.position.y = 0;
    const lo = LOW[n.kind]; n.main.scale.setScalar(n.kind === 'bush' ? 1 : n.full * (lo || 0.02));
    if (n.kind === 'tree' && n.stump) n.stump.visible = false;
    if (n.kind === 'bush' && n.berries) { n.berries.visible = true; n.berries.children.forEach((b) => b.scale.setScalar(0.02)); } });
}
function tierWake() { bakeWake(); dogWake(); villageWake(); hamWake(); giftWake(); nodes.forEach((n) => { if (n.kind !== 'planks' && (n.st === 'gone' || n.st === 'grow' || n.st === 'fall')) nodeGrown(n); }); }
/* old saves: gems are crystals now; hay, clay, ore and pies are gone */
function tierMigrate(I) {
  const S = I.store; if (S.gem) S.crystal = (S.crystal || 0) + S.gem;
  ['gem', 'hay', 'clay', 'ore', 'pie'].forEach((t) => { delete S[t]; });
  Object.keys(I.paid || {}).forEach((k) => { ['hay', 'clay', 'ore', 'gem'].forEach((t) => { delete I.paid[k][t]; }); });
  if (I.bld && I.bld.tool) { const t = Math.min(4, I.bld.tool); I.bld.axe = Math.max(I.bld.axe || 1, 1 + (t - 1) * 3); I.bld.pick = Math.max(I.bld.pick || 1, 1 + (t - 1) * 3); delete I.bld.tool; } /* one tool level became an axe and a pickaxe of that metal */
  if (I.bld && I.toolV !== 2) { /* one 12-level card per tool became a forged tier (a friend's pair of tools) and a 5-level sharpening card */
    const lv = Math.max(I.bld.axe || 1, I.bld.pick || 1), t = tierOfLv(lv); for (let k = 2; k <= t; k++) I.bld['tool' + k] = 2;
    ['axe', 'pick'].forEach((k) => { if (I.bld[k]) I.bld[k] = Math.min(5, 1 + Math.floor(((I.bld[k] || 1) - 1) * 4 / 11)); }); I.toolV = 2; }
  if (!I.dogV) { if (I.bld && I.bld.dog >= 4) I.bld.dog = 5; I.dogV = 2; } /* the courier trick came in as level 4; dogs that had saddlebags keep them (level 5) */
}
/* the axe, in the counter's picture style; axe2 copper, axe3 iron, axe4 star crystal */
function tiersIcon(x, t) {
  const blob = (f) => { x.fillStyle = f; x.fill(); x.stroke(); };
  x.beginPath(); x.moveTo(-10, 20); x.lineTo(8, -16); x.lineWidth = 7; x.strokeStyle = PAL.ink; x.stroke(); x.lineWidth = 3.6; x.strokeStyle = '#a8774f'; x.stroke(); x.lineWidth = 3; x.strokeStyle = PAL.ink;
  x.beginPath(); x.moveTo(2, -14); x.quadraticCurveTo(-4, -24, 6, -24); x.lineTo(20, -18); x.quadraticCurveTo(24, -6, 16, 2); x.lineTo(4, -4); x.closePath(); blob({ axe2: '#e0904f', axe3: '#7f93aa', axe4: '#7fd3ef' }[t] || '#c7ced6');
  if (t === 'axe4') { x.fillStyle = '#e9fbff'; x.beginPath(); x.arc(12, -14, 2.6, 0, 7); x.fill(); }
}

/* ---- the tool families (Leon 2026-11-28): each tier is its own tool, not a recoloured one ----
   axes: hand axe, double axe (copper), bow saw (iron), great saw (star crystal).
   picks: hand pick, mattock (copper), rock drill (iron), chime hammer (star crystal). */
{
  const W = '#a8774f', CU = '#e0904f', FE = '#8fa2b8', ST = '#7fd3ef';
  const stick = (x, a, b, c, d, w) => { x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.lineWidth = (w || 6) + 3; x.strokeStyle = '#3a2414'; x.stroke(); x.lineWidth = w || 6; x.strokeStyle = W; x.stroke(); x.lineWidth = 3; x.strokeStyle = '#3a2414'; };
  const fill = (x, c) => { x.fillStyle = c; x.fill(); x.stroke(); };
  const spark = (x, a, b) => { x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(a, b - 5); x.lineTo(a + 1.6, b - 1.6); x.lineTo(a + 5, b); x.lineTo(a + 1.6, b + 1.6); x.lineTo(a, b + 5); x.lineTo(a - 1.6, b + 1.6); x.lineTo(a - 5, b); x.lineTo(a - 1.6, b - 1.6); x.closePath(); x.fill(); };
  const teeth = (x, a, b, n, d) => { x.beginPath(); x.moveTo(a, b); for (let k = 0; k < n; k++) { x.lineTo(a + (k + 0.5) * d, b + 4); x.lineTo(a + (k + 1) * d, b); } x.stroke(); };
  ISLE_ICON.axe = (x) => { stick(x, -10, 20, 6, -14); x.beginPath(); x.moveTo(2, -12); x.quadraticCurveTo(-2, -20, 6, -20); x.lineTo(16, -15); x.quadraticCurveTo(19, -6, 13, -1); x.lineTo(4, -6); x.closePath(); fill(x, '#c7ced6'); };
  ISLE_ICON.axe2 = (x) => { stick(x, 0, 22, 0, -20);
    [-1, 1].forEach((s) => { x.beginPath(); x.moveTo(0, -16); x.quadraticCurveTo(s * 12, -26, s * 20, -22); x.quadraticCurveTo(s * 15, -10, s * 20, 2); x.quadraticCurveTo(s * 12, -2, 0, -6); x.closePath(); fill(x, CU); }); };
  ISLE_ICON.axe3 = (x) => { x.beginPath(); x.moveTo(-20, 10); x.quadraticCurveTo(-18, -22, 0, -22); x.quadraticCurveTo(18, -22, 20, 10); x.lineWidth = 9; x.strokeStyle = '#3a2414'; x.stroke(); x.lineWidth = 5.5; x.strokeStyle = W; x.stroke(); x.lineWidth = 3; x.strokeStyle = '#3a2414';
    x.beginPath(); x.rect(-22, 8, 44, 7); fill(x, FE); teeth(x, -22, 15, 8, 5.5); };
  ISLE_ICON.axe4 = (x) => { x.beginPath(); x.moveTo(-18, -6); x.lineTo(18, -10); x.quadraticCurveTo(22, 2, 18, 8); x.lineTo(-18, 10); x.closePath(); fill(x, ST); teeth(x, -18, 10, 7, 5.2);
    stick(x, -18, -12, -18, 14, 5); stick(x, 18, -16, 18, 10, 5); spark(x, 2, -2); spark(x, 11, 2); };
  /* a friend's forging card: the new axe and the new pick side by side */
  [2, 3, 4].forEach((n) => { ISLE_ICON['forge' + n] = (x) => { [['axe', -12], ['pick', 12]].forEach(([k, dx]) => { x.save(); x.translate(dx, 2); x.scale(0.68, 0.68); x.lineWidth = 3; x.strokeStyle = '#3a2414'; ISLE_ICON[k + n](x); x.restore(); }); }; });
  ISLE_ICON.pick = (x) => { stick(x, -2, -10, 3, 21); x.beginPath(); x.moveTo(-22, -4); x.quadraticCurveTo(0, -22, 22, -4); x.quadraticCurveTo(0, -12, -22, -4); x.closePath(); fill(x, '#c7ced6'); };
  ISLE_ICON.pick2 = (x) => { stick(x, 0, -12, 3, 22); x.beginPath(); x.moveTo(-24, -2); x.lineTo(-20, -14); x.lineTo(0, -18); x.lineTo(0, -10); x.closePath(); fill(x, CU);
    x.beginPath(); x.moveTo(0, -18); x.quadraticCurveTo(14, -18, 22, -4); x.quadraticCurveTo(12, -10, 0, -10); x.closePath(); fill(x, CU); };
  ISLE_ICON.pick3 = (x) => { stick(x, -16, -18, 16, -18, 6); stick(x, 0, -18, 0, 2, 6);
    x.beginPath(); x.moveTo(-6, 2); x.lineTo(6, 2); x.lineTo(0, 24); x.closePath(); fill(x, FE); for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(-5 + k * 1.6, 7 + k * 5); x.lineTo(5 - k * 1.6, 9 + k * 5); x.stroke(); } };
  ISLE_ICON.pick4 = (x) => { stick(x, -2, -6, 4, 22); x.beginPath(); x.moveTo(-20, -10); x.lineTo(-10, -20); x.lineTo(10, -20); x.lineTo(20, -10); x.lineTo(10, 0); x.lineTo(-10, 0); x.closePath(); fill(x, ST);
    x.beginPath(); x.moveTo(-10, -20); x.lineTo(-4, -10); x.lineTo(-10, 0); x.moveTo(10, -20); x.lineTo(4, -10); x.lineTo(10, 0); x.stroke(); spark(x, 0, -10);
    x.strokeStyle = '#4fb0d8'; [12, 18].forEach((r) => { x.beginPath(); x.arc(22, -10, r * 0.5, -0.9, 0.9); x.stroke(); }); x.strokeStyle = '#3a2414'; };
}
/* the tool Pip holds, by family and tier (isle.js TOOL): L is the list of pieces, tc colours a metal part */
function toolShape(kind, t, L, tc) {
  let q;
  const metal = [null, '#b9c1c9', '#e0904f', '#8fa2b8', '#7fd3ef'][t];
  if (kind === 'axe') {
    if (t <= 1) { q = new T.BoxGeometry(0.06, 0.12, 0.13); q.translate(0, -0.84, 0.06); L.push(fac(q, () => new T.Color('#8b939c'), 1702));
      q = new T.BoxGeometry(0.05, 0.22, 0.1); q.translate(0, -0.84, 0.16); L.push(fac(q, (cx, cy, cz) => new T.Color(cz > 0.19 ? '#eef2f5' : '#b9c1c9'), 1703)); return; }
    if (t === 2) { q = new T.BoxGeometry(0.07, 0.12, 0.1); q.translate(0, -0.84, 0); L.push(fac(q, () => new T.Color('#7a5a40'), 1702));
      [-1, 1].forEach((s, k) => { q = new T.CylinderGeometry(0.15, 0.15, 0.05, 12, 1, false, 0, Math.PI); q.rotateZ(Math.PI / 2); q.rotateX(s > 0 ? 0 : Math.PI); q.scale(1, 1.3, 1); q.translate(0, -0.84, s * 0.04); L.push(fac(q, (cx, cy, cz) => new T.Color(Math.abs(cz) > 0.14 ? '#ffd2a8' : metal), 1703 + k)); }); return; }
    if (t === 3) { /* the bow saw: an arched frame with the blade across its foot */
      q = new T.TorusGeometry(0.2, 0.028, 6, 14, Math.PI); q.rotateY(Math.PI / 2); q.rotateX(Math.PI); q.translate(0, -0.72, 0.2); L.push(fac(q.toNonIndexed(), () => new T.Color(W3), 1702));
      q = new T.BoxGeometry(0.02, 0.05, 0.42); q.translate(0, -0.72, 0.2); L.push(fac(q, (cx, cy) => new T.Color(cy < -0.735 ? '#eef2f5' : metal), 1703)); return; }
    /* the great saw: a long crystal blade with a handle at its far end */
    q = new T.BoxGeometry(0.025, 0.11, 0.62); q.translate(0, -0.86, 0.27); L.push(fac(q, (cx, cy) => new T.Color(cy < -0.9 ? '#e9fbff' : metal), 1702));
    q = new T.CylinderGeometry(0.03, 0.03, 0.2, 7); q.translate(0, -0.8, 0.6); L.push(fac(q, () => new T.Color('#a8774f'), 1703)); return;
  }
  if (t <= 1) { q = new T.CylinderGeometry(0.035, 0.035, 0.08, 7); q.translate(0, -0.86, 0); L.push(fac(q, () => new T.Color('#6e7680'), 1704));
    [1, -1].forEach((k) => { const c = new T.ConeGeometry(0.045, 0.26, 6); c.rotateX(k * Math.PI / 2 + k * 0.25); c.translate(0, -0.85 + 0.03, k * 0.14); L.push(fac(c, () => new T.Color('#b9c1c9'), 1705 + k)); }); return; }
  if (t === 2) { /* the mattock: a wide flat blade one way, a spike the other */
    q = new T.CylinderGeometry(0.04, 0.04, 0.09, 7); q.translate(0, -0.86, 0); L.push(fac(q, () => new T.Color('#7a5a40'), 1704));
    q = new T.BoxGeometry(0.16, 0.035, 0.22); q.translate(0, -0.87, 0.14); q.rotateX(0.12); L.push(fac(q, (cx, cy, cz) => new T.Color(cz > 0.22 ? '#ffd2a8' : metal), 1705));
    const c = new T.ConeGeometry(0.045, 0.22, 6); c.rotateX(-Math.PI / 2 - 0.25); c.translate(0, -0.84, -0.13); L.push(fac(c, () => new T.Color(metal), 1706)); return; }
  if (t === 3) { /* the rock drill: a cross handle and a twisted bit */
    q = new T.CylinderGeometry(0.035, 0.035, 0.32, 7); q.rotateZ(Math.PI / 2); q.translate(0, -0.88, 0); L.push(fac(q, () => new T.Color('#a8774f'), 1704));
    q = new T.CylinderGeometry(0.055, 0.008, 0.3, 8, 4); q.rotateX(Math.PI / 2); q.translate(0, -0.88, 0.18); L.push(fac(q, (cx, cy, cz, i) => new T.Color(i % 2 ? '#c9d4e0' : metal), 1705)); return; }
  /* the chime hammer: a crystal head that rings */
  q = new T.OctahedronGeometry(0.1, 0); q.scale(1, 0.9, 1.8); q.translate(0, -0.87, 0); L.push(fac(q, (cx, cy, cz, i) => new T.Color(i % 3 ? metal : '#e9fbff'), 1704));
}
const W3 = '#a8774f';
