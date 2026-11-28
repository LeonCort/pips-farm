"""Builds the start page (repo index.html): the island at dusk, Pip waving, two big picture buttons.
python3 build.py <out.html>"""
import os, sys
here = os.path.dirname(os.path.abspath(__file__))
r = lambda f: open(os.path.join(here, f)).read()
shop, farm = r('icons.txt').split('\n')
FARMJS = farm.replace("'", "\\'")
head = r('../engine/head.part')
page = head + '''<title>Pips gård</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap">
<style>
html, body { margin: 0; height: 100%; background: #1a2045; }
''' + r('../engine/boot/boot.css') + '''
/* the sandbox pick: a bit smaller, so three fit side by side on a phone */
#boot .pick.sbx .disc { width: clamp(100px, 17vh, 160px); height: clamp(100px, 17vh, 160px); background: radial-gradient(circle at 50% 35%, #fffaf0, #eaf4ff 70%, #c9def0); }
#boot .picks.three .pick + .pick + .pick { animation-delay: -0.9s; }
#boot .picks.four .pick + .pick + .pick + .pick { animation-delay: -1.5s; }
@media (orientation: portrait) {
  #boot .picks.three { gap: clamp(8px, 3vw, 40px); }
  #boot .picks.three .pick.main .disc { width: min(34vw, 24vh, 230px); height: min(34vw, 24vh, 230px); }
  #boot .picks.three .pick .disc { width: min(26vw, 18vh, 170px); height: min(26vw, 18vh, 170px); }
  /* four picks: two rows of two on a phone held upright */
  #boot .picks.four { flex-wrap: wrap; justify-content: center; margin: 0 auto; max-width: 96vw; }
  #boot .picks.four .pick.main .disc, #boot .picks.four .pick .disc { width: min(34vw, 17vh, 180px); height: min(34vw, 17vh, 180px); }
}
</style>
</head>
<body>
<div id="boot" class="isDusk isStart"></div>
<script>
''' + r('../engine/boot/boot.js') + '''
(function () {
  var FARM = \'''' + FARMJS + '''\';
  var el = document.getElementById('boot'), me = PipsScene.build(el, 'start');
  var v = ''; try { v = localStorage.getItem('pipsVer') || ''; } catch (e) {}
  var q = v ? '?v=' + encodeURIComponent(v) : '';
  var KEY = 'pip-farm-care-v1', has = false;
  try { var sv = JSON.parse(localStorage.getItem(KEY) || 'null'); has = !!(sv && sv.v === 1); } catch (e) {}
  var PLAY = '<span class="badgeP"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="#74a857" stroke="#22303c" stroke-width="4"/><path d="M19 14 L35 24 L19 34 Z" fill="#fff6e4" stroke="#22303c" stroke-width="3.5" stroke-linejoin="round"/></svg></span>';
  var SPROUT = '<svg viewBox="0 0 120 100" aria-hidden="true"><g stroke="#22303c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M22 84 C30 66 90 66 98 84 Z" fill="#8a6a4e"/><path d="M60 72 V40" fill="none"/><path d="M60 52 C42 50 32 34 36 22 C50 24 60 36 60 52 Z" fill="#74a857"/><path d="M60 44 C74 38 88 22 84 10 C70 12 60 26 60 44 Z" fill="#8fc46a"/></g><g fill="#f2c14a" stroke="#22303c" stroke-width="2.5" stroke-linejoin="round"><path d="M96 34 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z"/><path d="M24 30 l2.5 5.5 l5.5 2.5 l-5.5 2.5 l-2.5 5.5 l-2.5 -5.5 l-5.5 -2.5 l5.5 -2.5 z"/></g></svg>';
  /* the sandbox: a rainbow over a pig, a cow and a hen, the whole farm there to play with */
  var RAINBOW = '<svg viewBox="0 0 120 100" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-width="7"><path d="M14 66 A46 46 0 0 1 106 66" stroke="#e9684a"/><path d="M21 66 A39 39 0 0 1 99 66" stroke="#f2c14a"/><path d="M28 66 A32 32 0 0 1 92 66" stroke="#74a857"/><path d="M35 66 A25 25 0 0 1 85 66" stroke="#5a9fc4"/></g>'
    + '<g stroke="#22303c" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">'
    + '<path d="M44 60 L40 50 L50 55 Z M76 60 L80 50 L70 55 Z" fill="#f6b8c8"/><ellipse cx="60" cy="72" rx="20" ry="17" fill="#f6b8c8"/><ellipse cx="60" cy="78" rx="9" ry="6.5" fill="#f19aae"/>'
    + '<path d="M14 64 L8 58 M30 64 L36 58" /><ellipse cx="22" cy="76" rx="14" ry="13" fill="#fffaf0"/><path d="M14 70 Q18 64 24 68 Q22 74 16 74 Z" fill="#3a2e2a"/><ellipse cx="22" cy="84" rx="9" ry="5.5" fill="#f3c7a6"/>'
    + '<path d="M95 61 Q98 54 102 60 Q106 55 106 63" fill="#e9684a"/><circle cx="98" cy="76" r="13" fill="#fffaf0"/><path d="M108 75 L117 78 L108 81 Z" fill="#f2c14a"/></g>'
    + '<g fill="#22303c"><circle cx="53" cy="68" r="2.4"/><circle cx="67" cy="68" r="2.4"/><circle cx="57" cy="78" r="1.8"/><circle cx="63" cy="78" r="1.8"/><circle cx="18" cy="76" r="2.2"/><circle cx="27" cy="76" r="2.2"/><circle cx="101" cy="73" r="2.2"/></g>'
    + '<g fill="#f2c14a" stroke="#22303c" stroke-width="2.5" stroke-linejoin="round"><path d="M60 6 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z"/></g></svg>';
  /* the open island: islands of every kind (meadow, stone, snow, beach, volcano) round the camp tent, all lit by a big star */
  var ISLES = '<svg viewBox="0 0 120 100" aria-hidden="true"><ellipse cx="60" cy="62" rx="56" ry="34" fill="#5a9fc4"/><g stroke="#22303c" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">'
    + '<path d="M38 62 C36 50 52 44 62 46 C76 46 86 52 82 64 C78 74 46 76 38 62 Z" fill="#8fc46a"/>'
    + '<path d="M10 52 C10 44 24 42 30 46 C34 52 28 58 18 58 C12 58 10 56 10 52 Z" fill="#cfe0f6"/>'
    + '<path d="M88 44 C88 36 104 34 110 42 C112 50 100 54 94 52 C90 51 88 48 88 44 Z" fill="#a9a79c"/>'
    + '<path d="M14 76 C14 70 28 68 34 72 C36 78 28 82 20 82 C16 82 14 80 14 76 Z" fill="#f6e7bd"/>'
    + '<path d="M86 78 C86 72 98 70 104 74 C108 80 100 86 92 85 C88 84 86 82 86 78 Z" fill="#4a403a"/><path d="M92 76 L96 66 L100 76 Z" fill="#e9684a"/>'
    + '<path d="M50 62 L58 48 L66 62 Z" fill="#e9684a"/><path d="M56 62 L58 56 L60 62 Z" fill="#7a3a2a"/><path d="M98 44 L102 34 L106 44 Z" fill="#fffaf0"/><path d="M18 50 L22 40 L26 50 Z" fill="#74a857"/></g>'
    + '<g fill="#f2c14a" stroke="#22303c" stroke-width="2.5" stroke-linejoin="round"><path d="M60 4 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4 l9 -4 z"/><path d="M28 18 l2.5 5 l5 2.5 l-5 2.5 l-2.5 5 l-2.5 -5 l-5 -2.5 l5 -2.5 z"/><path d="M92 16 l2.5 5 l5 2.5 l-5 2.5 l-2.5 5 l-2.5 -5 l-5 -2.5 l5 -2.5 z"/></g></svg>';
  var RING = '<svg class="ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="#e9684a" stroke-width="7" stroke-linecap="round" stroke-dasharray="0 999" transform="rotate(-90 50 50)"/></svg>';
  var picks = has
    ? '<a class="pick main" data-go="go" href="bondgard.html' + q + '" aria-label="Forts\u00e4tt spela"><span class="disc">' + FARM + PLAY + '</span>Forts\u00e4tt</a>'
      + '<a class="pick hold" data-go="new" href="bondgard.html' + q + '" aria-label="Nytt spel: h\u00e5ll inne"><span class="disc">' + SPROUT + RING + '</span>Nytt spel</a>'
    : '<a class="pick main" data-go="new" href="bondgard.html' + q + '" aria-label="Nytt spel"><span class="disc">' + SPROUT + PLAY + '</span>Nytt spel</a>';
  /* the sandbox has its own save, so it never touches the farm above */
  picks += '<a class="pick sbx" data-go="go" href="bondgard.html?sandbox=1' + (v ? '&v=' + encodeURIComponent(v) : '') + '" aria-label="Sandl\u00e5da: allt \u00e4r redan k\u00f6pt"><span class="disc">' + RAINBOW + '</span>Sandl\u00e5da</a>';
  /* the whole island from the start: its own save too (isle.html?open=1, rules.js) */
  picks += '<a class="pick sbx" data-go="go" href="isle.html?open=1' + (v ? '&v=' + encodeURIComponent(v) : '') + '" aria-label="Hela \u00f6n: alla \u00f6ar \u00e4r redan \u00f6ppna"><span class="disc">' + ISLES + '</span>Hela \u00f6n</a>';
  el.insertAdjacentHTML('beforeend', '<div class="stand">' + (me.pet === 'none' ? '' : '<div class="who pet" style="width:clamp(60px,11vh,96px)">' + PipsScene.petSVG(me.pet) + '</div>') + '<div class="who pip" style="width:clamp(54px,10vh,86px)">' + PipsScene.pipSVG(me.av, true) + '</div></div><nav class="picks three' + (has ? ' four' : '') + '">' + picks + '</nav>');
  var going = false;
  function go(a) {
    if (going) return; going = true;
    if (a.dataset.go === 'new') { try { localStorage.removeItem(KEY); localStorage.removeItem('pips-delivery'); } catch (e) {} }
    a.classList.add('press'); el.classList.add('toNight');
    setTimeout(function () { location.href = a.href; }, 750);
  }
  el.querySelectorAll('.pick').forEach(function (a) {
    if (!a.classList.contains('hold')) { a.addEventListener('click', function (e) { e.preventDefault(); go(a); }); return; }
    /* starting over wipes the farm, so it needs a 2 second hold while a ring fills */
    var arc = a.querySelector('.ring circle'), L = 2 * Math.PI * 46, t0 = 0, raf = 0;
    var draw = function (f) { arc.setAttribute('stroke-dasharray', (f * L).toFixed(1) + ' 999'); };
    var tick = function () { if (!t0) return; var f = Math.min(1, (performance.now() - t0) / 2000); draw(f); if (f >= 1) { t0 = 0; go(a); return; } raf = requestAnimationFrame(tick); };
    var stop = function () { if (going) return; cancelAnimationFrame(raf); t0 = 0; draw(0); a.classList.remove('press'); };
    a.addEventListener('click', function (e) { e.preventDefault(); });
    a.addEventListener('pointerdown', function (e) { e.preventDefault(); if (going) return; a.classList.add('press'); t0 = performance.now(); raf = requestAnimationFrame(tick); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { a.addEventListener(ev, stop); });
    a.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(a); } });
  });
  /* coming back with the browser's back button shows the page as it was left */
  window.addEventListener('pageshow', function (e) { if (e.persisted) { going = false; el.classList.remove('toNight'); el.querySelectorAll('.press').forEach(function (a) { a.classList.remove('press'); }); } });
})();
</script>
</body>
</html>
'''
open(sys.argv[1], 'w').write(page)
print(len(page))
