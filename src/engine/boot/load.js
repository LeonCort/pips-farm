/* Loading screen: Pip walks the lantern path while the game loads. The walk is a CSS animation, so it keeps going while the big game script runs.
   The game calls PipsBoot.frame() after each drawn frame; after a few frames Pip runs to the gate and the screen fades away. */
(function () {
  var el = document.getElementById('boot'); if (!el || !window.PipsScene) return;
  var t0 = Date.now(), me = PipsScene.build(el, 'load');
  var LAMPS = [0.1, 0.3, 0.5, 0.7, 0.92];
  /* time (s) at which the CSS walk reaches track fraction f: keyframes 0->0.40 by 3.3 s, ->0.64 by 6.6 s, ->0.84 by 11 s */
  function walkT(f) { if (f <= 0.4) return f / 0.4 * 3.3; if (f <= 0.64) return 3.3 + (f - 0.4) / 0.24 * 3.3; if (f <= 0.84) return 6.6 + (f - 0.64) / 0.2 * 4.4; return -1; }
  var g = el.querySelector('.ground'), h = '<div class="track">';
  LAMPS.forEach(function (f) { h += '<div class="lamp" style="left:' + (f * 100) + '%"><span class="glow"></span>' + PipsScene.LAMP + '<span class="flame"></span></div>'; });
  h += '<div class="end"><span class="heart">' + PipsScene.HEART + '</span>' + PipsScene.GATE + '</div>';
  if (me.pet !== 'none') h += '<div class="walker walk go petw"><div class="who pet"><div class="bob">' + PipsScene.petSVG(me.pet) + '</div><span class="shadow"></span></div></div>';
  h += '<div class="walker walk go"><div class="who pip"><div class="bob">' + PipsScene.pipSVG(me.av) + '</div><span class="shadow"></span></div></div>';
  g.insertAdjacentHTML('beforeend', h + '</div>');
  var lamps = [].slice.call(el.querySelectorAll('.lamp')), walkers = [].slice.call(el.querySelectorAll('.walker'));
  void getComputedStyle(lamps[0].querySelector('.flame')).opacity;
  lamps.forEach(function (l, i) { var t = walkT(LAMPS[i]); if (t >= 0) { l.style.transitionDelay = t.toFixed(2) + 's'; l.classList.add('lit'); } });

  var frames = 0, ending = false;
  function at(w) { var m = getComputedStyle(w).transform, wd = w.offsetWidth || 1; if (!m || m === 'none') return 0; var v = m.match(/-?[\d.e]+/g); return v ? (+v[4] || 0) / wd : 0; }
  function done() {
    if (ending) return; ending = true; frames = -1;
    var wait = Math.max(0, 1100 - (Date.now() - t0));
    setTimeout(function () {
      var p = Math.min(0.99, at(walkers[walkers.length - 1])), D = Math.max(0.5, (0.95 - p) * 1.7);
      walkers.forEach(function (w, k) { var q = at(w); w.classList.remove('go'); w.style.animation = 'none'; w.style.transform = 'translateX(' + (q * 100) + '%)'; void w.offsetWidth; w.style.transition = 'transform ' + D + 's linear' + (k === 0 ? ' 0.1s' : ''); w.style.transform = 'translateX(95%)'; });
      lamps.forEach(function (l, i) { var f = l.querySelector('.flame'); if (+getComputedStyle(f).opacity > 0.05) return; l.classList.remove('lit'); void f.offsetWidth; l.style.transitionDelay = Math.max(0, (LAMPS[i] - p) / (0.95 - p) * D).toFixed(2) + 's'; l.classList.add('lit'); });
      setTimeout(function () {
        walkers.forEach(function (w) { w.classList.remove('walk'); w.classList.add('hop'); });
        el.querySelector('.heart').classList.add('pop');
        setTimeout(function () { el.classList.add('out'); setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 750); }, 650);
      }, D * 1000);
    }, wait);
  }
  window.PipsBoot = { frame: function () { if (frames >= 0 && ++frames >= 3) done(); }, done: done };
  /* safety: no 3D in this browser, or something stopped the game */
  var chk = setInterval(function () { var n = document.getElementById('nogl'); if (ending) return clearInterval(chk); if ((n && !n.hidden) || Date.now() - t0 > 40000) { clearInterval(chk); done(); } }, 1000);
})();
