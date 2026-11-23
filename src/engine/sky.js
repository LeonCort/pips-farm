
/* ---------- day, night and the seasons ---------- */
/* one day is 8 minutes; each season lasts one day: spring, summer, autumn, winter */
const DAY = 480, SEASONS = ['spring', 'summer', 'autumn', 'winter'], SEASON_SV = { spring: 'Vår', summer: 'Sommar', autumn: 'Höst', winter: 'Vinter' };
const hemi = sc.children.find((o) => o.isHemisphereLight);
const SKY_KEYS = [
  /* f: 0 is sunrise, 0.5 late afternoon, 0.62 sunset, 0.7 to 0.94 night */
  { f: 0.0, top: '#8fb3d9', hor: '#ffc9a0', sun: '#ffc08a', si: 0.52, hs: '#ffd9bc', hg: '#6f9a92', hi: 0.58, n: 0.25 },
  { f: 0.08, top: '#5d9ddb', hor: '#f8e4c8', sun: '#ffd8a4', si: 0.77, hs: '#ffefd6', hg: '#5f948a', hi: 0.72, n: 0 },
  { f: 0.52, top: '#5b9ad8', hor: '#f6dcbc', sun: '#ffc888', si: 0.79, hs: '#ffe8c8', hg: '#5f9088', hi: 0.7, n: 0 },
  { f: 0.62, top: '#6a78b8', hor: '#ff9f6e', sun: '#ff9a5c', si: 0.52, hs: '#f2bcc4', hg: '#5a7c8a', hi: 0.56, n: 0.2 },
  { f: 0.7, top: '#1c2650', hor: '#3a4478', sun: '#9fb4ff', si: 0.38, hs: '#7086c9', hg: '#3a4458', hi: 0.6, n: 1 },
  { f: 0.94, top: '#1c2650', hor: '#3a4478', sun: '#9fb4ff', si: 0.38, hs: '#7086c9', hg: '#3a4458', hi: 0.6, n: 1 },
  { f: 1.0, top: '#8fb3d9', hor: '#ffc9a0', sun: '#ffc08a', si: 0.52, hs: '#ffd9bc', hg: '#6f9a92', hi: 0.58, n: 0.25 }
];
const _ca = new T.Color(), _cb = new T.Color();
const mixHex = (a, b, q, out) => out.copy(_ca.set(a)).lerp(_cb.set(b), q);
let nightAmt = 0, isNight = false, season = 'spring', seasonShown = null;
const dayFrac = () => (state.clock % DAY) / DAY;
/* the sun crosses the sky, low with long shadows morning and evening, so the shadows show the time of day.
   Three paths to try (settings button, 'pips-sunpath'):
     lr: rises right (east), high behind the camera at midday, sets left (west)
     tb: rises at the top of the screen (north, a visible sunrise), sets behind the camera
     bt: rises behind the camera, sets at the top of the screen (a visible sunset)
   The moon then goes back the same way, so the shadows never jump at dusk or dawn. Indoors it stays where it was.
   A sun disk is drawn in the sky over the far edge of the island (clouds.js sunBall) when the path brings it on screen. */
const SUN_HOME = new T.Vector3(-10, 10, 7.5), SUN_OFF = SUN_HOME.clone();
const SUN_PATHS = { lr: [[1, 0, 0], [0, 0, 1]], tb: [[0, 0, -1], [-1, 0, 0]], bt: [[0, 0, 1], [-1, 0, 0]] }; /* [rise direction, midday direction] */
let sunPath = 'lr'; try { const v = localStorage.getItem('pips-sunpath'); if (SUN_PATHS[v]) sunPath = v; } catch (e) {}
if (window.__farmTest) window.__sun = () => SUN_OFF.toArray().map((v) => +v.toFixed(2));
function sunArc(f) {
  const day = f < 0.64, p = day ? f / 0.64 : 1 - (f - 0.64) / 0.36, el = (18 + 37 * Math.sin(Math.PI * p)) * Math.PI / 180, d = 16;
  const [R, N] = SUN_PATHS[sunPath], c = Math.cos(Math.PI * p), sn = Math.sin(Math.PI * p), hx = R[0] * c + N[0] * sn, hz = R[2] * c + N[2] * sn;
  SUN_OFF.set(hx * Math.cos(el) * d, Math.sin(el) * d, hz * Math.cos(el) * d);
}
/* the button: a sun with an arrow showing which way it goes */
{
  const fb = document.getElementById('fpsBtn'), row = fb ? fb.parentNode : document.querySelector('#menu .sheetTop');
  if (row) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'round sunBtn'; b.id = 'sunBtn';
    const draw = () => { const r = { lr: 0, tb: 90, bt: -90 }[sunPath]; b.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="8" fill="#f2c14a" stroke="#22303c" stroke-width="2.5"/><g transform="rotate(' + r + ' 24 24)"><path d="M40 40 H10 M16 34 L10 40 L16 46" fill="none" stroke="#22303c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -4)"/></g></svg>'; b.setAttribute('aria-label', 'Sun path ' + sunPath); };
    draw(); row.appendChild(b);
    b.addEventListener('click', (e) => { e.stopPropagation(); const k = ['lr', 'tb', 'bt']; sunPath = k[(k.indexOf(sunPath) + 1) % 3]; try { localStorage.setItem('pips-sunpath', sunPath); } catch (er) {} draw(); Snd.play('pop', { gain: 0.4, f: 700 }); });
  }
}
/* a soft warm light that follows Pip at night, and one for the tractor's headlights */
const pipLamp = new T.PointLight(0xffd8a0, 0, 4.5, 2); pipLamp.position.set(0, 1.6, 0.4); pip.add(pipLamp);
const tractorLamp = new T.PointLight(0xfff0c0, 0, 6, 2); sc.add(tractorLamp);
/* glows: a soft round sprite used for windows, Pip's lamp and fireflies */
/* soft round textures computed pixel by pixel (no canvas gradients): Safari dithers canvas gradients, and where the alpha is
   nearly zero that dither turns into random colours when WebGL un-premultiplies the canvas, which showed up as rainbow
   confetti in the mist, glows and shadows. stops: [t, r, g, b, a] with t 0..1 from the centre, colours 0..255, a 0..1 */
function gradTex(w, h, stops, lin) {
  const d = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const t = lin ? 1 - (y + 0.5) / h : Math.min(1, Math.hypot((x + 0.5) / w * 2 - 1, (y + 0.5) / h * 2 - 1)); let i = 0; while (i < stops.length - 2 && t > stops[i + 1][0]) i++;
    const A = stops[i], B = stops[i + 1], q = Math.max(0, Math.min(1, (t - A[0]) / Math.max(1e-6, B[0] - A[0]))), o = (y * w + x) * 4;
    for (let k = 0; k < 3; k++) d[o + k] = Math.round(A[k + 1] + (B[k + 1] - A[k + 1]) * q); d[o + 3] = Math.round(255 * (A[4] + (B[4] - A[4]) * q)); }
  const t = new T.DataTexture(d, w, h, T.RGBAFormat); t.magFilter = T.LinearFilter; t.minFilter = T.LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true; return t;
}
const glowTex = gradTex(64, 64, [[0, 255, 230, 160, 1], [0.35, 255, 210, 120, 0.55], [1, 255, 200, 100, 0]]);
const glowMat = new T.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0 });
const lampMat = new T.MeshBasicMaterial({ color: '#4a3a2e' });
const lampOff = new T.Color('#4a3a2e'), lampOn = new T.Color('#ffd27a');
/* windows and a porch glow on every animal house; called after a house is (re)built */
function lightHouse(g, big) {
  const s = big ? 1.5 : 1;
  [-0.3, 0.3].forEach((x) => { const w = new T.Mesh(new T.BoxGeometry(0.14 * s, 0.14 * s, 0.02), lampMat); w.position.set(x * s, 0.36 * s, 0.36 * s + 0.005); g.add(w); });
  const sp = new T.Sprite(glowMat); sp.scale.set(1.8 * s, 1.8 * s, 1); sp.position.set(0, 0.4 * s, 0.55 * s); g.add(sp);
}
/* fireflies drift over the meadow and between the trees at night */
const FLY_N = 40, flyPos = new Float32Array(FLY_N * 3), flySeed = [];
for (let i = 0; i < FLY_N; i++) { const x = (hash(i, 31) - 0.5) * 28, z = (hash(i, 37) - 0.5) * 19; flySeed.push({ x, z, a: hash(i, 41) * 6.28, s: 0.4 + hash(i, 43) * 0.6 }); }
const flyGeo = new T.BufferGeometry(); flyGeo.setAttribute('position', new T.BufferAttribute(flyPos, 3));
const flyMat = new T.PointsMaterial({ color: '#f4ff9a', size: 0.22, map: glowTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0 });
const fireflies = new T.Points(flyGeo, flyMat); fireflies.frustumCulled = false; sc.add(fireflies);
/* falling things: petals in spring, leaves in autumn, snow in winter */
const FALL_N = 160, fallPos = new Float32Array(FALL_N * 3);
for (let i = 0; i < FALL_N; i++) { fallPos[i * 3] = (hash(i, 51) - 0.5) * 26; fallPos[i * 3 + 1] = hash(i, 53) * 9; fallPos[i * 3 + 2] = (hash(i, 57) - 0.5) * 20; }
const fallGeo = new T.BufferGeometry(); fallGeo.setAttribute('position', new T.BufferAttribute(fallPos, 3));
const fallTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.beginPath(); x.arc(16, 16, 13, 0, 7); x.fill(); return new T.CanvasTexture(c); })();
const fallMat = new T.PointsMaterial({ color: '#ffffff', size: 0.12, map: fallTex, transparent: true, depthWrite: false, alphaTest: 0.3 });
const falling = new T.Points(fallGeo, fallMat); falling.frustumCulled = false; sc.add(falling);
/* winter keeps only a few stray flakes here: real snowfall is a weather spell (weather.js) */
const FALL = { spring: { c: '#f6b8c8', size: 0.1, v: 0.5, sway: 0.8, n: 70, drift: 2.6 }, summer: { c: '#fff6c8', size: 0.06, v: 0.15, sway: 0.4, n: 18, drift: 1.6 }, autumn: { c: '#e0893a', size: 0.13, v: 0.7, sway: 1.1, n: 90, drift: 2.8 }, winter: { c: '#ffffff', size: 0.11, v: 0.9, sway: 0.5, n: 14, drift: 2.0 } };
/* the wind, set by the weather: direction (x, z), strength now (g, with gusts) and on average (amt) */
const WIND = { x: 1, z: 0, g: 0, amt: 0 };
/* repaint the ground, trees and pen floors for a season (per corner, so the colours stay soft gradients) */
const _lw = new T.Color('#ffe9a0');
function leafShade(m, c, y) { const u = m.userData; if (u.y1 == null) return c; const q = clamp((y - u.y0) / (u.y1 - u.y0), 0, 1); if (season !== 'winter') c.lerp(_lyLo, 0.32 * (1 - q) * (1 - q)); c.multiplyScalar(0.54 + 0.46 * q); if (season !== 'winter') c.lerp(_lyHi, 0.3 * q * q * q); return c; }
function repaint(mesh, paint) { repaintV(mesh, (x, y, z, k) => leafShade(mesh, paint(x, y, z, k), y)); }
const GRASS = { spring: '#6fa352', summer: '#6a9f4a', autumn: '#8f9a4e', winter: '#dde6ea' };
const GRASS_WARMTH = { spring: 1, summer: 1.1, autumn: 0.8, winter: 0.04 };
const LEAF = { spring: ['#8cc46a', '#f6b8c8'], summer: ['#5d9160', '#5d9160'], autumn: ['#e0893a', '#d9b03f', '#c45a32'], winter: ['#eef3f6', '#c9d6dc'] };
const FLOOR = { spring: null, summer: null, autumn: null, winter: '#e6ecee' };
function paintSeason(s) {
  const grass = GRASS[s], path = s === 'winter' ? '#dfe5e8' : (s === 'autumn' ? '#bf9a64' : '#c9a36c'), beach = s === 'winter' ? '#e9e4d6' : PAL.sand;
  repaintV(ground, (x, y, z, k) => groundCol(x, y, z, k, grass, beach, GRASS_WARMTH[s]));
  GU.path.value.set(path); GU.cob.value.set(s === 'winter' ? '#e2e8eb' : '#c9b59a');
  leafs.forEach((m) => {
    const base = m.userData.base;
    if (m.userData.pine) repaint(m, (x, y, z, k) => tone(s === 'winter' && hash(k, m.id) > 0.45 ? '#f2f6f8' : base, k, 0.5));
    else { const l = LEAF[s]; repaint(m, (x, y, z, k) => tone(s === 'summer' ? base : s === 'spring' ? (hash(k, m.id) > 0.8 ? l[1] : l[0]) : l[Math.floor(hash(k, m.id) * l.length)], k, 0.5)); }
  });
  if (s === 'winter') snowPaint(state.wx && state.wx.cover > 0.35 ? state.wx.cover : 0.35);
  paintFloors();
}
const _fc = new T.Color();
function paintFloors() {
  const cov = season === 'winter' && state.wx ? Math.max(0.35, state.wx.cover || 0) : 0;
  for (const a in pens) { const f = pens[a].fence && pens[a].fence.children[0]; if (!f || !f.material || !f.material.color) continue; if (!f.userData.base) f.userData.base = '#' + f.material.color.getHexString();
    if (FLOOR[season]) f.material.color.set(f.userData.base).lerp(_fc.set(FLOOR[season]), 0.3 + 0.7 * cov); else f.material.color.set(f.userData.base); }
}
/* snow cover in winter: each spot of the ground and the trees turns white once the cover passes its own threshold,
   so the snow comes in soft patches that grow together. Colours are worked out once (per corner) and then only copied. */
const SNOWY = [];
function snowPrep(m, bare, snow, thr) {
  const p = m.geometry.attributes.position, n = p.count, B = new Float32Array(n * 3), W = new Float32Array(n * 3), H = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = vkey(x, y, z), j = i * 3;
    let c = leafShade(m, bare(x, y, z, k), y); B[j] = c.r; B[j + 1] = c.g; B[j + 2] = c.b; c = leafShade(m, snow(x, y, z, k), y); W[j] = c.r; W[j + 1] = c.g; W[j + 2] = c.b; H[i] = thr(x, y, z, k); }
  SNOWY.push({ m, B, W, H });
}
let snowPath = 0;
function snowPaint(cover) {
  if (!SNOWY.length) {
    snowPrep(ground, (x, y, z, k) => groundCol(x, y, z, k, '#b3c09a', '#e9e4d6', 0.05), (x, y, z, k) => groundCol(x, y, z, k, '#eef3f6', '#e9e4d6', 0),
      (x, y, z, k) => clamp(0.5 + 0.32 * Math.sin(x * 0.73 + z * 0.31) * Math.sin(z * 0.91 - x * 0.27 + 1.3) + (hash(k, 61) - 0.5) * 0.16, 0.02, 0.98));
    leafs.forEach((m) => {
      if (m.userData.pine) snowPrep(m, (x, y, z, k) => tone(m.userData.base, k, 0.5), (x, y, z, k) => tone('#f2f6f8', k, 0.5), (x, y, z, k) => 1 - hash(k, m.id));
      else snowPrep(m, (x, y, z, k) => tone('#c9d6dc', k, 0.5), (x, y, z, k) => tone('#eef3f6', k, 0.5), (x, y, z, k) => hash(k, m.id));
    });
  }
  for (const o of SNOWY) { const col = o.m.geometry.attributes.color; if (!col) continue; const a = col.array, n = o.H.length;
    for (let i = 0; i < n; i++) { const S = o.H[i] < cover ? o.W : o.B, j = i * 3; a[j] = S[j]; a[j + 1] = S[j + 1]; a[j + 2] = S[j + 2]; }
    col.needsUpdate = true; }
  GU.path.value.set('#cdbf9e').lerp(_fc.set('#e2e8eb'), clamp(cover * 1.3, 0, 1));
}
/* the little sun or moon and season badge under the hearts */
const SEASON_SVG = {
  spring: '<circle cx="24" cy="24" r="6" fill="#e0a646"/><g fill="#f6b8c8" stroke="#22303c" stroke-width="2.5"><circle cx="24" cy="12" r="7"/><circle cx="36" cy="22" r="7"/><circle cx="31" cy="36" r="7"/><circle cx="17" cy="36" r="7"/><circle cx="12" cy="22" r="7"/></g><circle cx="24" cy="25" r="6" fill="#e0a646" stroke="#22303c" stroke-width="2.5"/>',
  summer: '<g stroke="#22303c" stroke-width="3" stroke-linecap="round"><path d="M24 4 v6 M24 38 v6 M4 24 h6 M38 24 h6 M10 10 l4 4 M34 34 l4 4 M10 38 l4 -4 M34 14 l4 -4"/></g><circle cx="24" cy="24" r="10" fill="#f2c14a" stroke="#22303c" stroke-width="3"/>',
  autumn: '<path d="M24 6 C34 14 40 22 36 32 C32 40 16 40 12 32 C8 22 14 14 24 6 Z" fill="#e0893a" stroke="#22303c" stroke-width="3" stroke-linejoin="round"/><path d="M24 12 V44" stroke="#22303c" stroke-width="3" stroke-linecap="round"/>',
  winter: '<g stroke="#5a8fc4" stroke-width="4" stroke-linecap="round"><path d="M24 5 V43 M8 14 L40 34 M8 34 L40 14"/><path d="M19 8 L24 13 L29 8 M19 40 L24 35 L29 40"/></g>'
};
const SUN_SVG = '<circle cx="24" cy="24" r="11" fill="#f2c14a" stroke="#22303c" stroke-width="3"/>', MOON_SVG = '<path d="M30 8 A16 16 0 1 0 40 32 A12 12 0 1 1 30 8 Z" fill="#f4ecc8" stroke="#22303c" stroke-width="3" stroke-linejoin="round"/>';
let clockShown = '';
/* the clock and season calendar in the bottom-left corner:
   a round day dial (midday at the top, night at the bottom, a hand for now, a Z where bedtime starts)
   and the four seasons in a row, today's season big with a bar that fills as the day goes, and an arrow over the next one */
const DIAL_BANDS = [[0.94, 1.08, '#f6b27a'], [0.08, 0.62, '#bfe3f5'], [0.62, 0.7, '#f6b27a'], [0.7, 0.94, '#2b3560']];
const dialPt = (f, r) => { const a = (f - 0.3) * Math.PI * 2; return [(50 + Math.sin(a) * r).toFixed(2), (50 - Math.cos(a) * r).toFixed(2)]; };
function dialArc(f0, f1, r) { const p0 = dialPt(f0, r), p1 = dialPt(f1, r), big = f1 - f0 > 0.5 ? 1 : 0; return 'M50 50 L' + p0[0] + ' ' + p0[1] + ' A' + r + ' ' + r + ' 0 ' + big + ' 1 ' + p1[0] + ' ' + p1[1] + ' Z'; }
let clockEls = null;
function buildClock(el) {
  const sunP = dialPt(0.3, 33), moonP = dialPt(0.82, 33), zP = dialPt(0.555, 33);
  let h = '<svg class="dial" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47" fill="#22303c"/>';
  DIAL_BANDS.forEach(([a, b, c]) => { h += '<path d="' + dialArc(a, b, 44) + '" fill="' + c + '"/>'; });
  { const p0 = dialPt(0.1, 45.5), p1 = dialPt(0.5, 45.5); h += '<path d="M' + p0[0] + ' ' + p0[1] + ' A45.5 45.5 0 0 1 ' + p1[0] + ' ' + p1[1] + '" fill="none" stroke="#e0a646" stroke-width="5" stroke-linecap="round"/>'; }
  h += '<g transform="translate(' + (sunP[0] - 9) + ' ' + (sunP[1] - 9) + ') scale(0.375)">' + SUN_SVG + '</g>';
  h += '<g transform="translate(' + (moonP[0] - 9) + ' ' + (moonP[1] - 9) + ') scale(0.375)">' + MOON_SVG + '</g>';
  h += '<text x="' + zP[0] + '" y="' + (+zP[1] + 5) + '" text-anchor="middle" class="dz">z</text>';
  h += '<g class="hand"><path d="M50 50 L50 7" stroke="#22303c" stroke-width="7" stroke-linecap="round"/><path d="M50 50 L50 7" stroke="#e9684a" stroke-width="3.5" stroke-linecap="round"/></g>';
  h += '<circle cx="50" cy="50" r="17" fill="#fff6e4" stroke="#22303c" stroke-width="3"/><g class="now" transform="translate(37 37) scale(0.54)"></g></svg>';
  h += '<div class="cal"><div class="tiles">' + SEASONS.map((k) => '<div class="tile" data-s="' + k + '"><i class="nx" aria-hidden="true"></i><svg viewBox="0 0 48 48" aria-hidden="true">' + SEASON_SVG[k] + '</svg><b><u></u></b></div>').join('') + '</div><span class="cname"></span></div>';
  el.innerHTML = h;
  clockEls = { hand: el.querySelector('.hand'), now: el.querySelector('.now'), tiles: [...el.querySelectorAll('.tile')], name: el.querySelector('.cname'), nowKey: '' };
}
function renderClock() {
  const el = $('clock'); if (!el) return; if (!clockEls) buildClock(el);
  const f = dayFrac(), si = SEASONS.indexOf(season), day = Math.floor(state.clock / DAY) + 1;
  clockEls.hand.setAttribute('transform', 'rotate(' + ((state.clock / DAY - 0.3) * 360).toFixed(1) + ' 50 50)');
  const nk = isNight ? 'n' : 'd'; if (nk !== clockEls.nowKey) { clockEls.nowKey = nk; clockEls.now.innerHTML = isNight ? MOON_SVG : SUN_SVG; }
  clockEls.tiles.forEach((t, i) => { t.classList.toggle('cur', i === si); t.classList.toggle('next', i === (si + 1) % 4); if (i === si) t.querySelector('u').style.width = (f * 100).toFixed(1) + '%'; });
  const key = season + day; if (key !== clockShown) { clockShown = key; clockEls.name.textContent = SEASON_SV[season] + ' · dag ' + day; }
  el.setAttribute('aria-label', SEASON_SV[season] + ', dag ' + day + ', ' + (isNight ? 'natt' : 'dag') + '. Nästa: ' + SEASON_SV[SEASONS[(si + 1) % 4]]);
}
function seasonToast(s) {
  const el = $('toast'); if (!el) return;
  el.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true">' + SEASON_SVG[s] + '</svg><b>' + SEASON_SV[s] + '!</b>'; el.hidden = false; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  clearTimeout(seasonToast.t); seasonToast.t = setTimeout(() => { el.hidden = true; }, 3200);
}
/* a clear blue sky down to the horizon instead of the cream haze, so the far island reads as clear air */
const SKY_ULTRA = { hor: new T.Color('#a9cbe6'), top: new T.Color('#3d84cf') };
function skyStep(dt) {
  if (typeof state.clock !== 'number') state.clock = DAY * 0.1;
  bedStep(dt);
  if (!timeHold) state.clock += dt;
  const f = dayFrac(); let i = 0; while (i < SKY_KEYS.length - 2 && f > SKY_KEYS[i + 1].f) i++;
  if (inHouse) SUN_OFF.copy(SUN_HOME); else sunArc(f);
  const a = SKY_KEYS[i], b = SKY_KEYS[i + 1], q = clamp((f - a.f) / (b.f - a.f), 0, 1), e = q * q * (3 - 2 * q);
  mixHex(a.top, b.top, e, sky.material.uniforms.top.value); mixHex(a.hor, b.hor, e, sky.material.uniforms.hor.value);
  { const dd = 1 - (a.n + (b.n - a.n) * e) * 2; if (dd > 0) { sky.material.uniforms.hor.value.lerp(SKY_ULTRA.hor, 0.6 * dd); sky.material.uniforms.top.value.lerp(SKY_ULTRA.top, 0.3 * dd); } }
  sc.background.copy(sky.material.uniforms.hor.value); sc.fog.color.copy(sky.material.uniforms.hor.value);
  mixHex(a.sun, b.sun, e, sun.color); sun.intensity = a.si + (b.si - a.si) * e;
  if (hemi) { mixHex(a.hs, b.hs, e, hemi.color); mixHex(a.hg, b.hg, e, hemi.groundColor); hemi.intensity = a.hi + (b.hi - a.hi) * e; }
  nightAmt = a.n + (b.n - a.n) * e; isNight = f > 0.68 && f < 0.95;
  lampMat.color.copy(lampOff).lerp(lampOn, clamp(nightAmt * 2.6, 0, 1)); glowMat.opacity = Math.min(0.65, nightAmt * 1.3);
  pipLamp.intensity = nightAmt * 1.1;
  if (tractor) { tractor.g.updateMatrixWorld(); tractorLamp.position.copy(tractor.g.localToWorld(tmpV.set(0, 0.8, 1.6))); tractorLamp.intensity = nightAmt * (mount && mount.kind === 'tractor' ? 1.6 : 0.5); }
  /* fireflies */
  flyMat.opacity = nightAmt * (0.7 + (reduced ? 0 : Math.sin(time * 5) * 0.2));
  if (nightAmt > 0.01) for (let k = 0; k < FLY_N; k++) { const s = flySeed[k], t = time * s.s + s.a; flyPos[k * 3] = s.x + Math.sin(t) * 1.2; flyPos[k * 3 + 1] = 0.5 + Math.sin(t * 1.7) * 0.3 + 0.3; flyPos[k * 3 + 2] = s.z + Math.cos(t * 0.8) * 1.0; }
  if (nightAmt > 0.01) flyGeo.attributes.position.needsUpdate = true;
  /* the season changes at sunrise */
  const s = SEASONS[Math.floor(state.clock / DAY) % 4];
  if (s !== season || seasonShown === null) { const first = seasonShown === null; season = s; seasonShown = s; paintSeason(s); const fl = FALL[s]; fallMat.color.set(fl.c); fallMat.size = fl.size; if (!first) { seasonToast(s); Snd.play('sparkle', { gain: 0.5 }); } }
  /* falling petals, leaves or snow drift around the camera */
  const fl = FALL[season]; falling.visible = !reduced && !inHouse;
  /* more of them come loose when it blows, and they drift sideways with the wind */
  const fn = Math.min(FALL_N, Math.round(fl.n * (1 + WIND.g * (season === 'winter' ? 0.5 : 0.9)))), wdx = WIND.x * WIND.g * fl.drift * dt, wdz = WIND.z * WIND.g * fl.drift * dt;
  if (falling.visible) for (let k = 0; k < FALL_N; k++) {
    if (k >= fn) { fallPos[k * 3 + 1] = -50; continue; }
    let y = fallPos[k * 3 + 1], x = fallPos[k * 3], z = fallPos[k * 3 + 2];
    if (y < -1) { y = hash(k, time) * 9; x = camFocus.x + (hash(k, time + 3) - 0.5) * 26; z = camFocus.z + (hash(k, time + 4) - 0.5) * 20; }
    y -= fl.v * dt * (0.7 + hash(k, 3) * 0.6);
    x += Math.sin(time * 1.3 + k) * fl.sway * dt + wdx; z += wdz;
    if (y < 0) { y = 8 + hash(k, time) * 2; x = camFocus.x + (hash(k, time + 1) - 0.5) * 26; z = camFocus.z + (hash(k, time + 2) - 0.5) * 20; }
    if (x - camFocus.x > 13) x -= 26; else if (x - camFocus.x < -13) x += 26; if (z - camFocus.z > 10) z -= 20; else if (z - camFocus.z < -10) z += 20;
    fallPos[k * 3] = x; fallPos[k * 3 + 1] = y; fallPos[k * 3 + 2] = z;
  }
  if (falling.visible) fallGeo.attributes.position.needsUpdate = true;
  skyT -= dt; if (skyT <= 0) { skyT = 1; paintFloors(); renderClock(); }
}
let skyT = 0, timeHold = false;
/* test control in the settings: a slider over the whole day (sunrise at the left, night at the right) and a button that
   stops the clock, so the light, the sun's path and the shadows can be looked at hour by hour. Stays within today, so the season is kept. */
{
  const row = document.querySelector('#menu .sheetTop');
  if (row) {
    const w = document.createElement('div'); w.id = 'timeRow';
    w.innerHTML = '<button type="button" class="round" id="timeHold" aria-label="Stop time"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="16" fill="#fffaf0" stroke="#22303c" stroke-width="3"/><path d="M24 14 V24 L31 29" fill="none" stroke="#22303c" stroke-width="3" stroke-linecap="round"/><g class="hold"><rect x="15" y="15" width="6" height="18" rx="2" fill="#c8643a" stroke="#22303c" stroke-width="2"/><rect x="27" y="15" width="6" height="18" rx="2" fill="#c8643a" stroke="#22303c" stroke-width="2"/></g></svg></button>'
      + '<input type="range" id="timeSlide" min="0" max="1000" step="1" aria-label="Time of day"><span id="timeTxt"></span>';
    row.appendChild(w);
    const sl = w.querySelector('#timeSlide'), hb = w.querySelector('#timeHold'), tx = w.querySelector('#timeTxt');
    const clockTxt = (f) => { const h = (6 + f * 24) % 24; return String(Math.floor(h)).padStart(2, '0') + ':' + String(Math.floor((h % 1) * 60)).padStart(2, '0'); }; /* f 0 = sunrise, shown as 06:00 */
    const show = () => { const f = dayFrac(); if (document.activeElement !== sl) sl.value = Math.round(f * 1000); tx.textContent = clockTxt(f); hb.classList.toggle('on', timeHold); };
    sl.addEventListener('input', () => { const day = Math.floor(state.clock / DAY); state.clock = day * DAY + (+sl.value / 1000) * DAY * 0.9999; show(); });
    hb.addEventListener('click', (e) => { e.stopPropagation(); timeHold = !timeHold; show(); Snd.play('pop', { gain: 0.4, f: timeHold ? 500 : 800 }); });
    ['pointerdown', 'pointermove', 'touchstart', 'touchmove', 'click'].forEach((ev) => w.addEventListener(ev, (e) => e.stopPropagation(), { passive: true }));
    setInterval(() => { if (!$('menu').hidden) show(); }, 250);
    const st = document.createElement('style');
    st.textContent = '#menu #timeRow{order:16;display:flex;align-items:center;gap:10px;width:min(290px,calc(86vw - 30px));margin-top:6px}#timeRow .round{position:relative;flex:none;width:54px;height:54px;padding:6px;margin:0}#timeRow .round::after{content:none!important}#timeRow .hold{display:none}#timeRow .on .hold{display:inline}#timeRow .on{background:#fff1c9}'
      + '#timeSlide{flex:1;min-width:0;height:34px;accent-color:#c8643a;background:linear-gradient(90deg,#ffc9a0,#8fc0e8 12%,#7db7dd 50%,#ff9f6e 64%,#1c2650 72%,#1c2650 94%,#ffc9a0);border-radius:17px;-webkit-appearance:none;appearance:none;border:2px solid #22303c}'
      + '#timeSlide::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#f2c14a;border:3px solid #22303c}#timeSlide::-moz-range-thumb{width:26px;height:26px;border-radius:50%;background:#f2c14a;border:3px solid #22303c}'
      + '#timeTxt{font:700 15px system-ui,sans-serif;min-width:44px;color:#22303c}';
    document.head.appendChild(st);
  }
}
