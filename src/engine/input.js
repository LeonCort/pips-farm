
/* ---------- camera and input ---------- */
let aspect = 1;
function resize() { const w = Math.max(1, wrap.clientWidth), h = Math.max(1, wrap.clientHeight); renderer.setSize(w, h, false); cam.aspect = aspect = w / h; cam.updateProjectionMatrix(); }
if (window.ResizeObserver) new ResizeObserver(resize).observe(wrap); else window.addEventListener('resize', resize);
resize();
const camFocus = new T.Vector3().copy(pip.position);
const ray = new T.Raycaster(), ndc = new T.Vector2(), groundPlane = new T.Plane(new T.Vector3(0, 1, 0), 0);
let holding = false, keys = {}, joy = null;
/* two ways to steer: drag like a joystick (Pip walks while the finger is down, stops when it lifts), or tap where Pip should go */
const dragMode = () => state.ctrl !== 'tap';
const joyEl = $('joy'), JOY_R = 56;
function joyShow() { if (!joyEl) return; joyEl.hidden = false; joyEl.style.left = joy.x0 + 'px'; joyEl.style.top = joy.y0 + 'px'; joyKnob(); }
function joyKnob() { if (!joyEl) return; const l = Math.hypot(joy.dx, joy.dy), k = l > JOY_R ? JOY_R / l : 1; joyEl.firstElementChild.style.transform = 'translate(' + joy.dx * k + 'px,' + joy.dy * k + 'px)'; }
function aim(e) { const r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, cam); if (curveHit(ray.ray, tmpV)) { target.set(tmpV.x, 0, tmpV.z); onIsle(target); if (typeof routeStop === 'function') routeStop(); } }
wrap.addEventListener('pointerdown', (e) => { if (e.button && e.button !== 0) return; closeMenu(); Snd.init(); holding = true; try { wrap.setPointerCapture(e.pointerId); } catch (er) {} if (dragMode()) { joy = { x0: e.clientX, y0: e.clientY, dx: 0, dy: 0 }; joyShow(); } else aim(e); if (!state.moved) { state.moved = true; $('hint').hidden = true; } });
wrap.addEventListener('pointermove', (e) => { if (!holding) return; if (joy) { joy.dx = e.clientX - joy.x0; joy.dy = e.clientY - joy.y0; /* the stick stays where the finger first touched; lift and touch again to move it */ joyKnob(); } else aim(e); });
['pointerup', 'pointercancel'].forEach((ev) => wrap.addEventListener(ev, () => { holding = false; if (joy) { joy = null; if (joyEl) joyEl.hidden = true; target.copy(pip.position); } }));
window.addEventListener('keydown', (e) => { const k = e.key.toLowerCase(); if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) { keys[k] = true; e.preventDefault(); Snd.init(); if (!state.moved) { state.moved = true; $('hint').hidden = true; } } if (k === 'escape') closeMenu(); });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
wrap.addEventListener('contextmenu', (e) => e.preventDefault());

/* coins fly up to the counter in the corner */
function coinToHud(wx, wy, wz, n) {
  tmpV.set(wx, wy - curveDrop(wx, wz), wz).project(cam); const r = wrap.getBoundingClientRect(), hud = $('coinIcon').getBoundingClientRect();
  const sx = (tmpV.x * 0.5 + 0.5) * r.width + r.left, sy = (-tmpV.y * 0.5 + 0.5) * r.height + r.top;
  for (let k = 0; k < Math.min(n, 6); k++) {
    const d = document.createElement('span'); d.className = 'flycoin'; d.style.left = sx + 'px'; d.style.top = sy + 'px'; document.body.appendChild(d);
    const dx = hud.left + hud.width / 2 - sx, dy = hud.top + hud.height / 2 - sy;
    requestAnimationFrame(() => { d.style.transitionDelay = (k * 0.05) + 's'; d.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(0.7)'; d.style.opacity = '0.2'; });
    setTimeout(() => d.remove(), 900);
  }
}
function earn(n) { state.coins += n; state.total += n; bump(); }
function bump() { const el = $('coins'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }

/* ---------- menu ---------- */
function openMenu() { $('menu').hidden = false; $('menuBtn').setAttribute('aria-expanded', 'true'); Snd.init(); Snd.play('pop', { gain: 0.4, f: 700 }); renderMenu(); }
function closeMenu() { if ($('menu').hidden) return; $('menu').hidden = true; $('menuBtn').setAttribute('aria-expanded', 'false'); }
$('menuBtn').addEventListener('click', () => { if ($('menu').hidden) openMenu(); else closeMenu(); });
$('menuClose').addEventListener('click', closeMenu);
$('menu').addEventListener('pointerdown', (e) => { if (e.target === $('menu')) closeMenu(); });
function flash(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
UPS.forEach((u) => {
  const b = $('up-' + u.id), need = document.createElement('span'); need.className = 'need'; need.innerHTML = '<b></b>'; b.appendChild(need);
  b.addEventListener('click', () => {
    const c = upCost(u);
    if (state.lv[u.id] >= u.max) { Snd.play('tock', { gain: 0.3, f: 300 }); return; }
    if (state.coins < c) { Snd.play('tock', { gain: 0.3, f: 300 }); flash(b, 'shake'); flash($('coins').parentNode, 'no'); return; } /* not enough coins: shake, and point at the coin counter */
    state.coins -= c; state.lv[u.id]++; Snd.play('powerup', { gain: 0.5 }); flash(b, 'got'); renderMenu(); const d = b.querySelectorAll('.dots i')[state.lv[u.id] - 1]; if (d) flash(d, 'pop'); save();
  });
});
$('soundBtn').addEventListener('click', () => { state.sound = !state.sound; Snd.init(); Snd.set(state.sound); renderMenu(); });
if ($('fpsBtn')) $('fpsBtn').addEventListener('click', () => { fpsCap = FPS_OPTS[(FPS_OPTS.indexOf(fpsCap) + 1) % FPS_OPTS.length]; try { localStorage.setItem('pips-fps', fpsCap); } catch (e) {} renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, fpsCap === 20 ? 1 : 1.5)); resize(); Snd.play('pop', { gain: 0.4, f: 400 + fpsCap * 8 }); renderMenu(); });
if ($('ctrlBtn')) $('ctrlBtn').addEventListener('click', () => { state.ctrl = dragMode() ? 'tap' : 'drag'; Snd.play('pop', { gain: 0.4, f: dragMode() ? 800 : 600 }); renderMenu(); save(); });
function renderMenu() {
  UPS.forEach((u) => {
    const b = $('up-' + u.id), lv = state.lv[u.id], c = upCost(u), maxed = lv >= u.max;
    b.querySelector('.dots').innerHTML = Array.from({ length: u.max }, (_, i) => '<i class="' + (i < lv ? 'on' : '') + '"></i>').join('');
    b.querySelector('.price b').textContent = maxed ? '★' : fmt(c);
    b.classList.toggle('poor', !maxed && state.coins < c); b.classList.toggle('can', !maxed && state.coins >= c); b.classList.toggle('maxed', maxed);
    b.querySelector('.need b').style.width = Math.min(100, state.coins / c * 100) + '%';
  });
  if ($('fpsBtn')) { $('fpsBtn').querySelector('b').textContent = fpsCap; $('fpsBtn').setAttribute('aria-label', 'Frame rate: ' + fpsCap + ' per second' + (fpsCap === 20 ? ', battery saver' : '')); $('fpsBtn').classList.toggle('eco', fpsCap < 60); }
  if ($('ctrlBtn')) { $('ctrlBtn').classList.toggle('tap', !dragMode()); $('ctrlBtn').setAttribute('aria-label', dragMode() ? 'Steering: drag with your finger' : 'Steering: tap where to go'); }
  $('soundBtn').setAttribute('aria-pressed', String(state.sound)); $('soundBtn').classList.toggle('off', !state.sound);
}

/* ---------- save ---------- */
const KEY = SAVE_KEY; /* each game saves under its own key (SAVE_KEY comes from the game) */
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
function load() { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (!s || s.v !== 1 || typeof s.coins !== 'number') return null; const b = fresh(); for (const k in b) if (!(k in s)) s[k] = b[k]; return s; } catch (e) { return null; } }

