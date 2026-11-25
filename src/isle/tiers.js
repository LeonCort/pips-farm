/* ---------- tiers (Leon's vision for Pips Island, 2026-11-24) ----------
   Four materials only: wood, stone, berries and crystals, plus coins. Harder islands do not bring new materials, they
   give bigger piles of the same ones: a tree at home gives 2 logs, an old orchard oak 5, a winter pine 10.
   Every tree, rock, boulder and crystal has a tier from the island it grows on. The tool has to be at least that tier
   (the smith makes them: people.js). A weaker tool bounces off, and a bubble shows the tool it needs. A better tool hits
   harder, pulls the drops in from further away, and the crystal tools hit the thing next to it too.
   Things grow back after Pip has slept in the tent, not on a timer. */
const BIOME_TIER = { home: 1, rocks: 1, berry: 1, meadow: 1, orchard: 2, stone: 2, clay: 2, cave: 2, snow: 3 };
const TIER_MUL = [1, 1, 2.5, 5]; /* how big the pile is */
const HIT_MUL = [1, 1, 1.5, 2]; /* how many more hits it takes, with the right tool */
const HAND = { bush: 1, planks: 1, shroom: 1 }; /* always open: picked by hand, or a door's old boards */
const toolTier = () => bldLv('tool');
const toolKind = (k) => !HAND[k];
function nodeTier(kind, x, z) {
  if (HAND[kind]) return 1;
  const A = areaAt(x, z); let t = A ? BIOME_TIER[A.biome] || 1 : 1;
  if (kind === 'boulder' || kind === 'crystal') t = Math.max(t, 2);
  return t;
}
const nodeHits = (n) => HITS[n.kind] * HIT_MUL[n.tier || 1];
const tierYield = (n) => Math.max(1, Math.round(YIELD[n.kind][1] * TIER_MUL[n.tier || 1]));
function gated(n) { return gearGate(n) || toolKind(n.kind) && ((NEED[n.kind] && !hasTool(n.kind)) || toolTier() < (n.tier || 1)); }
function gateIcon(n) { if (gearGate(n)) return 'torch'; if (NEED[n.kind] && !hasTool(n.kind)) return 'pick'; const t = n.tier || 1; return (NEED[n.kind] ? 'pick' : 'axe') + (t > 1 ? t : ''); }
function tierPow(n) { return toolKind(n.kind) ? 1 + 1.5 * Math.max(0, toolTier() - (n.tier || 1)) : 1; }
const dropReach = () => (toolTier() >= 2 ? 4.5 : 2.2);
/* a tier-2 or tier-3 thing looks bigger: an old oak, a tall winter pine, a big crystal */
function tierInit(n) {
  n.tier = SHOW_T.tier || nodeTier(n.kind, n.x, n.z); n.hp = nodeHits(n);
  if (n.tier >= 2 && (n.kind === 'tree' || n.kind === 'rock' || n.kind === 'crystal')) { const s = n.tier === 2 ? 1.3 : 1.5; n.main.scale.multiplyScalar(s); n.full *= s; }
}
/* the crystal tools: each swing also hits the nearest thing of the same kind next to it */
function wideHit(n) {
  let best = null, bd = 1.8; nodes.forEach((m) => { if (m === n || m.kind !== n.kind || m.st !== 'ready' || gated(m)) return; const d = Math.hypot(m.x - n.x, m.z - n.z); if (d < bd) { bd = d; best = m; } });
  if (best) nodeHit(best, true);
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
function tierWake() { dogWake(); villageWake(); nodes.forEach((n) => { if (n.kind !== 'planks' && (n.st === 'gone' || n.st === 'grow' || n.st === 'fall')) nodeGrown(n); }); }
/* old saves: gems are crystals now; hay, clay, ore and pies are gone */
function tierMigrate(I) {
  const S = I.store; if (S.gem) S.crystal = (S.crystal || 0) + S.gem;
  ['gem', 'hay', 'clay', 'ore', 'pie'].forEach((t) => { delete S[t]; });
  Object.keys(I.paid || {}).forEach((k) => { ['hay', 'clay', 'ore', 'gem'].forEach((t) => { delete I.paid[k][t]; }); });
  if (I.bld && I.bld.tool > 3) I.bld.tool = 3;
  if (!I.dogV) { if (I.bld && I.bld.dog >= 4) I.bld.dog = 5; I.dogV = 2; } /* the courier trick came in as level 4; dogs that had saddlebags keep them (level 5) */
}
/* the axe, in the counter's picture style; axe2 copper, axe3 crystal */
function tiersIcon(x, t) {
  const blob = (f) => { x.fillStyle = f; x.fill(); x.stroke(); };
  x.beginPath(); x.moveTo(-10, 20); x.lineTo(8, -16); x.lineWidth = 7; x.strokeStyle = PAL.ink; x.stroke(); x.lineWidth = 3.6; x.strokeStyle = '#a8774f'; x.stroke(); x.lineWidth = 3; x.strokeStyle = PAL.ink;
  x.beginPath(); x.moveTo(2, -14); x.quadraticCurveTo(-4, -24, 6, -24); x.lineTo(20, -18); x.quadraticCurveTo(24, -6, 16, 2); x.lineTo(4, -4); x.closePath(); blob({ axe2: '#e0904f', axe3: '#7fd3ef' }[t] || '#c7ced6');
  if (t === 'axe3') { x.fillStyle = '#e9fbff'; x.beginPath(); x.arc(12, -14, 2.6, 0, 7); x.fill(); }
}
