/* ---------- the game log: errors, warnings, frame stalls and recent events, for troubleshooting ----------
   Runs as its own <script> before everything else, so it still works when the game script fails.
   The log is kept in localStorage, so after a freeze and a reload the previous session is still there.
   The settings panel has a button that copies both sessions as plain text, to paste into a chat. */
(function () {
  'use strict';
  var KEY = 'pips-log', MAX = 300, PREV_MAX = 300;
  var page = (location.pathname.split('/').pop() || 'index.html');
  var started = Date.now(), closing = false, errs = {}, buf = [], prev = null, dirty = true, frames = 0, lastTick = 0, loopDead = false, lastErr = '';
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clock(t) { var d = new Date(t || Date.now()); return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
  function day(t) { var d = new Date(t); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + clock(t); }
  function add(kind, msg) {
    msg = String(msg == null ? '' : msg).replace(/\s+/g, ' ').slice(0, 500);
    if (kind === 'ERROR') { var c = errs[msg] = (errs[msg] || 0) + 1; if (c > 3) { if (c === 4) add('info', 'the error above keeps coming; counted at the top from now on'); return; } }
    var last = buf[buf.length - 1];
    if (last && last.k === kind && last.m === msg) { last.n = (last.n || 1) + 1; last.e = clock(); }
    else { buf.push({ t: clock(), k: kind, m: msg }); if (buf.length > MAX) buf.splice(0, buf.length - MAX); }
    dirty = true;
    if (kind === 'ERROR') store();
  }
  /* the previous session, read before this one starts writing */
  try { prev = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { prev = null; }
  function store() {
    if (!dirty) return; dirty = false;
    try { localStorage.setItem(KEY, JSON.stringify({ page: page, start: started, beat: Date.now(), closed: closing, ver: ver(), lines: buf, prev: prevSummary() })); } catch (e) {}
  }
  /* one older session is kept, so a freeze is still in the log after one more reload */
  function prevSummary() { return prev && prev.lines ? { page: prev.page, start: prev.start, beat: prev.beat, closed: prev.closed, ver: prev.ver, lines: prev.lines.slice(-PREV_MAX) } : null; }
  function ver() { var m = document.querySelector('meta[name="app-ver"]'); return m ? m.content : '?'; }

  /* errors */
  window.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t !== window && (t.src || t.href)) { add('ERROR', 'could not load ' + (t.src || t.href)); return; }
    var where = e.filename ? ' @ ' + String(e.filename).split('/').pop().slice(0, 40) + ':' + e.lineno + ':' + e.colno : '';
    var st = e.error && e.error.stack ? ' | ' + String(e.error.stack).split('\n').slice(1, 4).map(function (s) { return s.trim(); }).join(' < ') : '';
    add('ERROR', (e.message || 'error') + where + st);
  }, true);
  window.addEventListener('unhandledrejection', function (e) { var r = e.reason; add('ERROR', 'promise: ' + (r && (r.stack || r.message) || r)); });
  ['error', 'warn'].forEach(function (lv) {
    var f = console[lv]; if (!f) return;
    console[lv] = function () { try { add(lv === 'error' ? 'ERROR' : 'warn', Array.prototype.map.call(arguments, function (a) { return a && a.stack ? a.stack : typeof a === 'object' ? safe(a) : String(a); }).join(' ')); } catch (x) {} return f.apply(console, arguments); };
  });
  function safe(o) { try { return JSON.stringify(o).slice(0, 200); } catch (e) { return String(o); } }

  /* the page around the game */
  document.addEventListener('visibilitychange', function () { add('page', document.hidden ? 'hidden (app in background)' : 'visible again'); skip = true; store(); });
  window.addEventListener('pagehide', function () { closing = true; add('page', 'closed'); store(); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) { closing = false; add('page', 'back from the page cache'); } });
  var rsT = 0; window.addEventListener('resize', function () { clearTimeout(rsT); rsT = setTimeout(function () { add('page', 'size ' + innerWidth + 'x' + innerHeight); }, 400); });
  window.addEventListener('online', function () { add('page', 'online'); });
  window.addEventListener('offline', function () { add('page', 'offline'); });
  /* taps on buttons, so the log shows what the player did just before something went wrong */
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('button,a,[role="button"]') : null; if (!b) return;
    add('tap', b.id || b.getAttribute('aria-label') || b.className || b.tagName);
  }, true);

  /* stalls: a watcher of its own, so a stopped game loop shows up too */
  var skip = false, lastRaf = 0, stalls = 0, worst = 0;
  function watch(now) {
    if (lastRaf && !document.hidden) {
      var gap = now - lastRaf;
      if (skip) skip = false; else if (gap > 400) { stalls++; worst = Math.max(worst, gap); add('STALL', 'screen stood still for ' + (gap / 1000).toFixed(1) + ' s'); }
      if (lastTick && !loopDead && now - lastTick > 2500) { loopDead = true; add('STALL', 'the game loop stopped running (last frame ' + ((now - lastTick) / 1000).toFixed(1) + ' s ago)' + (lastErr ? ', last error: ' + lastErr : '')); store(); }
    }
    lastRaf = now; requestAnimationFrame(watch);
  }
  requestAnimationFrame(watch);
  
  /* the game reports in: tick() every frame, probe() for numbers every 30 s, gl(canvas) for the 3D context */
  var api = {
    add: add,
    tick: function () { frames++; var n = performance.now(); if (loopDead) { loopDead = false; add('info', 'the game loop runs again'); } lastTick = n; },
    caught: function (e) { var m = (e && e.message) || String(e); var w = e && e.stack ? ' | ' + String(e.stack).split('\n').slice(0, 3).map(function (s) { return s.trim(); }).join(' < ') : ''; lastErr = m; add('ERROR', 'in a frame: ' + m + w); },
    probe: null,
    gl: function (cv) {
      if (!cv || cv.__pipsLog) return; cv.__pipsLog = 1;
      cv.addEventListener('webglcontextlost', function () { add('ERROR', '3D graphics context lost (the device took the graphics memory back)'); store(); });
      cv.addEventListener('webglcontextrestored', function () { add('info', '3D graphics context restored'); });
    },
    text: text
  };
  window.PipsLog = api;
  var fT = performance.now();
  setInterval(function () {
    var now = performance.now(), fps = frames / ((now - fT) / 1000); frames = 0; fT = now;
    var p = ''; try { p = api.probe ? api.probe() : ''; } catch (e) { p = 'probe failed: ' + e.message; }
    var mem = performance.memory ? ', heap ' + Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB' : '';
    if (!document.hidden) add('stats', 'fps ' + fps.toFixed(0) + (p ? ', ' + p : '') + mem);
  }, 30000);
  setInterval(function () { dirty = true; store(); }, 3000);
  add('info', 'start ' + page);

  function lines(L) { return (L || []).map(function (l) { return l.t + (l.n > 1 ? '-' + l.e + ' x' + l.n : '') + ' ' + l.k + ' ' + l.m; }).join('\n'); }
  function session(title, s) {
    if (!s || !s.lines) return '';
    var end = s.closed ? 'closed normally' : 'did NOT close normally (freeze, crash, or the app was killed); last sign of life ' + day(s.beat);
    return '\n== ' + title + ': ' + (s.page || '?') + ' v' + (s.ver || '?') + ', started ' + day(s.start) + ', ' + end + ' ==\n' + lines(s.lines) + '\n';
  }
  function text() {
    store();
    var gfx = ''; try { gfx = 'gfx ' + localStorage.getItem('pips-gfx') + ' (' + localStorage.getItem('pips-gfx-by') + ')'; } catch (e) {}
    var head = 'Pips log, copied ' + day(Date.now()) + '\n'
      + 'Device: ' + navigator.userAgent + '\n'
      + 'Screen ' + screen.width + 'x' + screen.height + ' @' + (window.devicePixelRatio || 1) + ', window ' + innerWidth + 'x' + innerHeight + ', ' + gfx + ', cores ' + (navigator.hardwareConcurrency || '?') + (navigator.deviceMemory ? ', memory ' + navigator.deviceMemory + ' GB' : '') + '\n'
      + 'This session: ' + stalls + ' stalls' + (worst ? ' (worst ' + (worst / 1000).toFixed(1) + ' s)' : '') + (loopDead ? ', GAME LOOP STOPPED' : '') + '\n'
      + Object.keys(errs).filter(function (m) { return errs[m] > 1; }).map(function (m) { return 'Repeated error x' + errs[m] + ': ' + m.slice(0, 200) + '\n'; }).join('');
    var older = prev && prev.prev ? prev.prev : null;
    return head + session('This session', { page: page, start: started, beat: Date.now(), closed: true, ver: ver(), lines: buf }).replace('closed normally', 'running now')
      + session('Previous session', prev) + session('Session before that', older);
  }

  /* the copy button in the settings panel */
  function copy(t, done) {
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0';
      document.body.appendChild(ta); ta.focus(); ta.select(); try { ta.setSelectionRange(0, t.length); } catch (e) {}
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); if (ok) done(true); else show(t, done);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { done(true); }, fallback);
    else fallback();
  }
  /* when the browser will not copy: show the text, selected, with its own copy and close buttons */
  function show(t, done) {
    var w = document.createElement('div'); w.className = 'logView';
    w.innerHTML = '<div class="logBox"><textarea readonly></textarea><div class="logRow"><button type="button" data-c>Kopiera</button><button type="button" data-x>Stäng</button></div></div>';
    var ta = w.querySelector('textarea'); ta.value = t; document.body.appendChild(w);
    ['pointerdown', 'touchstart', 'mousedown', 'wheel', 'keydown'].forEach(function (ev) { w.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true }); });
    setTimeout(function () { ta.focus(); ta.select(); }, 50);
    w.querySelector('[data-c]').addEventListener('click', function () { ta.focus(); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} if (ok) { done(true); w.remove(); } });
    w.querySelector('[data-x]').addEventListener('click', function () { w.remove(); done(false); });
  }
  function button() {
    var top = document.querySelector('#menu .sheetTop'); if (!top || document.getElementById('logBtn')) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'round logBtn'; b.id = 'logBtn'; b.setAttribute('aria-label', 'Kopiera loggen');
    b.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><g class="clip"><rect x="10" y="9" width="28" height="33" rx="4" fill="#fff6e4" stroke="#22303c" stroke-width="3"/><rect x="17" y="5" width="14" height="8" rx="3" fill="#e9684a" stroke="#22303c" stroke-width="3"/><path d="M16 21 h16 M16 27 h16 M16 33 h10" stroke="#22303c" stroke-width="3" stroke-linecap="round"/></g><path class="chk" d="M12 25 L21 34 L37 15" fill="none" stroke="#2f7d4f" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var up = document.getElementById('updBtn'); top.insertBefore(b, up ? up.nextSibling : document.getElementById('menuClose'));
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      copy(text(), function (ok) {
        if (!ok) return; b.classList.add('ok'); add('info', 'log copied');
        setTimeout(function () { b.classList.remove('ok'); }, 2500);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', button); else button();
})();
