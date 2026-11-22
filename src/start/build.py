"""Builds the start page (repo index.html): the island at dusk, Pip waving, two big picture buttons.
python3 build.py <out.html>"""
import os, sys
here = os.path.dirname(os.path.abspath(__file__))
r = lambda f: open(os.path.join(here, f)).read()
shop, farm = r('icons.txt').split('\n')
FARMJS = farm.replace("'", "\\'")
head = r('../head.part')
page = head + '''<title>Pips gård</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap">
<style>
html, body { margin: 0; height: 100%; background: #1a2045; }
''' + r('../boot/boot.css') + '''</style>
</head>
<body>
<div id="boot" class="isDusk isStart"></div>
<script>
''' + r('../boot/boot.js') + '''
(function () {
  var FARM = \'''' + FARMJS + '''\';
  var el = document.getElementById('boot'), me = PipsScene.build(el, 'start');
  var v = ''; try { v = localStorage.getItem('pipsVer') || ''; } catch (e) {}
  var q = v ? '?v=' + encodeURIComponent(v) : '';
  var KEY = 'pip-farm-care-v1', has = false;
  try { var sv = JSON.parse(localStorage.getItem(KEY) || 'null'); has = !!(sv && sv.v === 1); } catch (e) {}
  var PLAY = '<span class="badgeP"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="#74a857" stroke="#22303c" stroke-width="4"/><path d="M19 14 L35 24 L19 34 Z" fill="#fff6e4" stroke="#22303c" stroke-width="3.5" stroke-linejoin="round"/></svg></span>';
  var SPROUT = '<svg viewBox="0 0 120 100" aria-hidden="true"><g stroke="#22303c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M22 84 C30 66 90 66 98 84 Z" fill="#8a6a4e"/><path d="M60 72 V40" fill="none"/><path d="M60 52 C42 50 32 34 36 22 C50 24 60 36 60 52 Z" fill="#74a857"/><path d="M60 44 C74 38 88 22 84 10 C70 12 60 26 60 44 Z" fill="#8fc46a"/></g><g fill="#f2c14a" stroke="#22303c" stroke-width="2.5" stroke-linejoin="round"><path d="M96 34 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z"/><path d="M24 30 l2.5 5.5 l5.5 2.5 l-5.5 2.5 l-2.5 5.5 l-2.5 -5.5 l-5.5 -2.5 l5.5 -2.5 z"/></g></svg>';
  var RING = '<svg class="ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="#e9684a" stroke-width="7" stroke-linecap="round" stroke-dasharray="0 999" transform="rotate(-90 50 50)"/></svg>';
  var picks = has
    ? '<a class="pick main" data-go="go" href="bondgard.html' + q + '" aria-label="Forts\u00e4tt spela"><span class="disc">' + FARM + PLAY + '</span>Forts\u00e4tt</a>'
      + '<a class="pick hold" data-go="new" href="bondgard.html' + q + '" aria-label="Nytt spel: h\u00e5ll inne"><span class="disc">' + SPROUT + RING + '</span>Nytt spel</a>'
    : '<a class="pick main" data-go="new" href="bondgard.html' + q + '" aria-label="Nytt spel"><span class="disc">' + SPROUT + PLAY + '</span>Nytt spel</a>';
  el.insertAdjacentHTML('beforeend', '<div class="stand"><div class="who pet" style="width:clamp(60px,11vh,96px)">' + PipsScene.petSVG(me.pet) + '</div><div class="who pip" style="width:clamp(54px,10vh,86px)">' + PipsScene.pipSVG(me.av, true) + '</div></div><nav class="picks">' + picks + '</nav>');
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
