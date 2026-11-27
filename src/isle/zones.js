/* ---------- season zones (Leon's idea list, 2026-11-23) ----------
   On the island the seasons do not follow the calendar: each island has its own. Home is spring (mild), the meadow
   island is summer (hot sun, a warm shimmer), the stone island is autumn (rain), and the far island over the orchard
   bridge is winter (snow). Walking onto an island turns the season and its weather; the season dial shows where Pip is. */
const ZONE_SEASON = { home: 'spring', rocks: 'spring', berry: 'spring', cave: 'spring', marsh: 'spring', coral: 'summer', ember: 'summer', ash: 'summer', meadow: 'summer', orchard: 'summer', stone: 'autumn', clay: 'autumn', snow: 'winter' };
const ZONE_WX = { spring: ['clear', 120], summer: ['clear', 150], autumn: ['rain', 100], winter: ['snow', 100] };
let zoneSeason = 'spring';
ISLAND.seasonAt = () => zoneSeason;
const heatHaze = (() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;opacity:0;transition:opacity 1.5s;background:radial-gradient(ellipse 100% 75% at 50% 0%,rgba(255,196,96,.32),rgba(255,160,60,.1) 60%,rgba(255,140,60,0) 100%)'; document.body.appendChild(d); return d; })();
function zoneStep() {
  const A = inCave ? null : areaAt(pip.position.x, pip.position.z), z = inCave ? 'spring' : A && HAS[A.id] ? ZONE_SEASON[A.biome] || 'spring' : null; /* on a bridge: keep the season Pip came from */
  if (z && z !== zoneSeason) { zoneSeason = z; const w = ZONE_WX[z]; if (state.wx && state.wx.k !== w[0]) wxSet(w[0], w[1]); }
  if (A && HAS[A.id] && wonderCalm(A) && state.wx && state.wx.k !== 'clear') wxSet('clear', 150); /* a finished wonder keeps its island's sky clear (wonders.js) */
  heatHaze.style.opacity = zoneSeason === 'summer' && !isNight && !inCave ? '1' : '0';
}
