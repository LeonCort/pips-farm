if (window.__farmTest) window.__farmTest = { go: (x, z) => target.set(x, 0, z), pip: () => [pip.position.x, pip.position.z], st: () => state, carry: () => carry.items.map((m) => m.userData.type).join(','), isle: () => isleTest() };
let started = false;
function start(data) {
  if (started) return; started = true;
  const hot = data && data.state && data.state.v === 1 ? data.state : null;
  state = hot || load() || fresh();
  isleInit(); { const c = document.querySelector(".coins"); if (c) c.style.display = "none"; }
  $('hint').hidden = !!state.moved; if (avNew) openWardrobe(true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  window.addEventListener('pagehide', save);
  lastT = performance.now(); requestAnimationFrame(frame);
}
const hotApi = window.claude && window.claude.hot;
if (hotApi && hotApi.snapshot) { try { hotApi.snapshot(() => ({ state })); } catch (e) {} }
if (hotApi && hotApi.ready) { try { hotApi.ready((d) => start(d || hotApi.data || {})); } catch (e) {} setTimeout(() => start({}), 1500); } else start((hotApi && hotApi.data) || {});
})();
