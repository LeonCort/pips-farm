if (window.__farmTest) window.__farmTest = { go: (x, z) => target.set(x, 0, z), pip: () => [pip.position.x, pip.position.z], st: () => state, carry: () => carry.items.map((m) => m.userData.type).join(','), animals: () => animals.map((an) => an.a + ':' + (an.want || '-')).join(' '), boxes: () => Object.fromEntries(Object.keys(pens).map((a) => [a, pens[a].food.items.map((m) => m.userData.type[0]).join('')])), helpers: () => helpers.map((h) => h.t + ':' + h.st).join(' '), add: (a) => { addAnimal(a); }, clock: (c) => { state.clock = c; }, babies: () => babies.map((b) => b.a + b.coatI).join(' '), feedAll: () => animals.forEach((an) => { an.want = an.want || DIET[an.a][0]; feed(an); }), album: () => stickerCount() };
if (window.__farmTest) Object.assign(window.__farmTest, extrasTest(), barnTest());
let started = false;
function start(data) {
  if (started) return; started = true;
  const hot = data && data.state && data.state.v === 1 ? data.state : null;
  state = hot || load() || fresh();
  addSource('grain'); addSource('water'); addSource('carrot'); addAnimal('hen'); addAnimal('hen'); /* two hens from the start; the first pig is bought (farms from before keep theirs) */
  if (!state.owned.pig1 && (state.owned.hen3 || state.owned.pig2 || (state.total || 0) > 30)) state.owned.pig1 = true;
  PADS.forEach((p) => { if (own(p.id)) build(p); });
  barnReady = true; barnInit();
  restoreBabies(); extrasInit();
  showPad(); $('hint').hidden = !!state.moved; if (avNew) openWardrobe(true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  window.addEventListener('pagehide', save);
  lastT = performance.now(); requestAnimationFrame(frame);
}
const hotApi = window.claude && window.claude.hot;
if (hotApi && hotApi.snapshot) { try { hotApi.snapshot(() => ({ state })); } catch (e) {} }
if (hotApi && hotApi.ready) { try { hotApi.ready((d) => start(d || hotApi.data || {})); } catch (e) {} setTimeout(() => start({}), 1500); } else start((hotApi && hotApi.data) || {});
})();
