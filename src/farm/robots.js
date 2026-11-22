/* ---------- robots are a choice: each one sleeps until the player switches it on ----------
   Leon's daughter felt the robots took over the fun jobs, so every helper robot (farm food helpers,
   market stocking robots, market carry helpers) starts asleep, even after buying it. Walk up to a robot
   and a big switch button shows up: tap it to wake the robot (it starts working) or put it back to sleep.
   Saved per robot in state.bots ({ key: true } means on). */
function botKey(h) { if (mHelpers.includes(h)) return 'm:' + h.i; return (stalls[h.t] && stalls[h.t].stocker === h ? 's:' : 'f:') + h.t; }
function botsS() { if (!state.bots || typeof state.bots !== 'object') state.bots = {}; return state.bots; }
const botOn = (h) => !!botsS()[h.key || (h.key = botKey(h))];
function allBots() { const out = helpers.slice(); for (const t in stalls) if (stalls[t].stocker) out.push(stalls[t].stocker); mHelpers.forEach((h) => { if (h) out.push(h); }); return out; }

/* the look of a sleeping or awake robot: open or closed eyes and a little zz bubble */
const BOT_EYE = new T.MeshBasicMaterial({ color: '#8ff0ae' });
let BOT_ZZ = null;
function zzTex() {
  if (BOT_ZZ) return BOT_ZZ;
  const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d');
  x.lineCap = 'round'; x.lineJoin = 'round';
  const z = (cx, cy, s) => { x.beginPath(); x.moveTo(cx - s, cy - s); x.lineTo(cx + s, cy - s); x.lineTo(cx - s, cy + s); x.lineTo(cx + s, cy + s); x.lineWidth = s * 0.9; x.strokeStyle = '#22303c'; x.stroke(); x.lineWidth = s * 0.42; x.strokeStyle = '#fff6e4'; x.stroke(); };
  z(44, 84, 18); z(86, 40, 12);
  return (BOT_ZZ = new T.CanvasTexture(c));
}
function botDress(h) {
  if (h.dressed) return; h.dressed = true;
  h.eyes = [-0.07, 0.07].map((ex) => { const e = new T.Mesh(new T.BoxGeometry(0.05, 0.05, 0.02), BOT_EYE); e.position.set(ex, 0.385, 0.195); h.g.add(e); return e; });
  h.zz = new T.Sprite(new T.SpriteMaterial({ map: zzTex(), depthTest: false, transparent: true })); h.zz.scale.set(0.5, 0.5, 1); h.zz.position.set(0.22, 0.95, 0); h.zz.renderOrder = 5; h.g.add(h.zz);
  h.wasOn = botOn(h); botLook(h);
}
function botLook(h) { const on = botOn(h); h.eyes.forEach((e) => { e.scale.y = on ? 1 : 0.22; }); h.zz.visible = !on; }

/* while asleep a robot rolls home and naps; it keeps what it carries and carries on when it wakes */
function botSleep(h, dt) {
  const home = h.home || MKT.helpers[h.i];
  if (h.st !== 'nap') { h.st = 'nap'; h.target = null; h.src = null; }
  if (walkTo(h.g, home[0], home[1], dt, 2)) h.g.position.y = 0; else h.g.position.y = Math.abs(Math.sin(time * 12 + home[0])) * 0.04;
  if (h.zz) { h.zz.position.y = 0.95 + (reduced ? 0 : Math.sin(time * 1.6 + home[0]) * 0.05); h.zz.material.opacity = 0.65 + 0.35 * Math.sin(time * 1.6 + home[0]); }
}
function botWrap(fn, wakeSt) {
  return function (h, dt) {
    botDress(h);
    const on = botOn(h);
    if (on !== h.wasOn) { h.wasOn = on; botLook(h); if (on) h.st = wakeSt(h); }
    if (!on) { botSleep(h, dt); return; }
    if (h.hop) { h.hop = Math.max(0, h.hop - dt * 3); }
    fn(h, dt);
    if (h.hop) h.g.position.y += Math.sin(h.hop * Math.PI) * 0.35;
  };
}
runHelper = botWrap(runHelper, () => 'idle');
runStocker = botWrap(runStocker, (h) => (h.pile.items.length ? 'ret' : 'idle'));
runShopHelper = botWrap(runShopHelper, (h) => (h.pile.items.length ? 'ret' : 'idle'));

/* the switch button: a robot face above a sliding switch, green and to the right when it is on */
const BOT_ICON = {};
function botIcon(on) {
  if (BOT_ICON[on]) return BOT_ICON[on];
  const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d');
  x.lineWidth = 4; x.strokeStyle = PAL.ink;
  x.save(); x.translate(64, 44); x.fillStyle = PAL.paper; x.fillRect(-30, -24, 60, 46); x.strokeRect(-30, -24, 60, 46);
  x.fillStyle = PAL.ink; x.fillRect(-21, -12, 42, 17);
  if (on) { x.fillStyle = '#8ff0ae'; x.fillRect(-14, -8, 9, 9); x.fillRect(5, -8, 9, 9); }
  else { x.strokeStyle = '#fff6e4'; x.lineWidth = 3; x.beginPath(); x.moveTo(-14, -3); x.lineTo(-5, -3); x.moveTo(5, -3); x.lineTo(14, -3); x.stroke(); }
  x.restore();
  const y = 98, w = 84, r = 19; x.beginPath(); x.moveTo(64 - w / 2 + r, y - r); x.arc(64 + w / 2 - r, y, r, -Math.PI / 2, Math.PI / 2); x.arc(64 - w / 2 + r, y, r, Math.PI / 2, Math.PI * 1.5); x.closePath();
  x.fillStyle = on ? '#5cbf6e' : '#c9c1b4'; x.fill(); x.lineWidth = 4; x.strokeStyle = PAL.ink; x.stroke();
  const kx = on ? 64 + w / 2 - r : 64 - w / 2 + r; x.beginPath(); x.arc(kx, y, r - 5, 0, 7); x.fillStyle = '#fffaf0'; x.fill(); x.stroke();
  if (!on) { x.lineWidth = 3; x.beginPath(); x.moveTo(96, 14); x.lineTo(108, 14); x.lineTo(96, 26); x.lineTo(108, 26); x.stroke(); }
  return (BOT_ICON[on] = c.toDataURL());
}
function nearBot(r) {
  if (inHouse || trip || mount) return null; let best = null, bd = r;
  allBots().forEach((h) => { const d = Math.hypot(h.g.position.x - pip.position.x, h.g.position.z - pip.position.z); if (d < bd) { bd = d; best = h; } });
  return best;
}
function toggleBot(h) {
  const s = botsS(), on = !botOn(h); if (on) s[h.key] = true; else delete s[h.key];
  botDress(h); botLook(h);
  if (on) { h.hop = 1; Snd.play('powerup', { gain: 0.4, f: 520 }); Snd.play('sparkle', { gain: 0.3 }, 0.1, 150); }
  else Snd.play('pop', { gain: 0.4, f: 260 });
  if (typeof save === 'function') save();
}
const _botFindActs = findActs;
findActs = function () {
  const out = _botFindActs(), h = nearBot(1.4);
  if (h) { const on = botOn(h); out.unshift({ icon: botIcon(on), label: on ? 'Robot på' : 'Robot sover', run: () => toggleBot(h) }); }
  return out.slice(0, 2);
};
if (window.__farmTest) window.__bots = { helpers, allBots, stalls, mHelpers, state: () => state, acts: () => acts, addStall, addStocker, addShopHelper };
