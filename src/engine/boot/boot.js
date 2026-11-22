/* Pips boot scene: draws the island, sky, Pip and the pet into #boot. Used by the start page and the loading screen. */
(function () {
  var INK = '#22303c';
  var AVO = {
    skin: ['#f6d3b8', '#e8b48f', '#c98b62', '#9a6440', '#6b4430'],
    hc: ['#3a2a22', '#7a4a2a', '#e0b45a', '#c4562e', '#22232a', '#d9d4cc', '#e889b5', '#6aa0e0'],
    sh: ['#e9684a', '#1f6a80', '#e0a646', '#3f7d62', '#f0907a', '#7b5ea7', '#fff6e4', '#22303c'],
    bc: ['#2e4a7a', '#7d5e4e', '#22303c', '#3f7d62', '#e889b5', '#e0a646', '#d9443a'],
    sc: ['#3a3433', '#e9684a', '#1f6a80', '#f2c14a', '#3f7d62', '#e889b5', '#fff6e4']
  };
  function readAv() {
    var a = null; try { a = JSON.parse(localStorage.getItem('pips-avatar') || 'null'); } catch (e) {}
    if (!a || typeof a !== 'object') a = {};
    var d = { skin: 1, hs: 6, hc: 1, ts: 0, sh: 0, bs: 0, bc: 0, ss: 0, sc: 0 };
    for (var k in d) if (!(a[k] >= 0)) a[k] = d[k];
    return a;
  }
  function readPet() {
    try { var s = JSON.parse(localStorage.getItem('pip-farm-care-v1') || 'null'); if (s && ['dog', 'cat', 'wolf', 'bear'].indexOf(s.pet) >= 0) return s.pet; } catch (e) {}
    return 'dog';
  }
  function pick(arr, i) { return arr[i] || arr[0]; }

  /* Pip, seen slightly from the side, walking to the right */
  function pipSVG(av, waving) {
    var skin = pick(AVO.skin, av.skin), hc = pick(AVO.hc, av.hc), sh = pick(AVO.sh, av.sh), bc = pick(AVO.bc, av.bc), sc = pick(AVO.sc, av.sc), hs = av.hs | 0;
    var s = '<svg viewBox="0 0 64 96" aria-hidden="true"><g stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">';
    /* hair that hangs behind the head */
    if (hs === 1) s += '<path d="M14 26 C12 40 14 48 19 52 H45 C50 48 52 40 50 26 Z" fill="' + hc + '"/>';
    if (hs === 2) s += '<circle cx="12" cy="30" r="6" fill="' + hc + '"/><circle cx="52" cy="30" r="6" fill="' + hc + '"/>';
    if (hs === 3) s += '<circle cx="32" cy="7" r="7" fill="' + hc + '"/>';
    if (av.ts === 2) s += '<path d="M18 40 C14 34 16 26 22 24 H42 C48 26 50 34 46 40 Z" fill="' + sh + '"/>';
    /* legs and shoes */
    if (av.bs === 1) s += '<rect x="22" y="70" width="8" height="15" rx="3" fill="' + skin + '"/><rect x="34" y="70" width="8" height="15" rx="3" fill="' + skin + '"/><path d="M19 64 H45 V75 H19 Z" fill="' + bc + '"/>';
    else if (av.bs === 2) s += '<rect x="22" y="72" width="8" height="13" rx="3" fill="' + skin + '"/><rect x="34" y="72" width="8" height="13" rx="3" fill="' + skin + '"/><path d="M20 62 H44 L48 78 H16 Z" fill="' + bc + '"/>';
    else s += '<rect x="22" y="64" width="8" height="21" rx="3" fill="' + bc + '"/><rect x="34" y="64" width="8" height="21" rx="3" fill="' + bc + '"/>';
    var boot = av.ss === 1 ? 7 : 4;
    s += '<path d="M20 ' + (87 - boot) + ' H30 V85 C33 85 35 87 35 90 H20 Z" fill="' + sc + '"/><path d="M33 ' + (87 - boot) + ' H43 V85 C46 85 48 87 48 90 H33 Z" fill="' + sc + '"/>';
    /* jacket */
    s += '<path d="M17 50 C17 44 21 41 26 41 H38 C43 41 47 44 47 50 V69 C47 71 46 72 44 72 H20 C18 72 17 71 17 69 Z" fill="' + sh + '"/>';
    if (av.ts === 1) s += '<path d="M18 52 H46 M18 59 H46 M18 66 H46" stroke="#fff6e4" stroke-width="3" opacity="0.7"/><path d="M17 50 C17 44 21 41 26 41 H38 C43 41 47 44 47 50 V69 C47 71 46 72 44 72 H20 C18 72 17 71 17 69 Z" fill="none"/>';
    else s += '<path d="M32 43 V71" stroke-width="2"/>';
    /* arms */
    s += '<path d="M18 47 C13 52 12 58 14 63" fill="none" stroke="' + INK + '" stroke-width="8"/><path d="M18 47 C13 52 12 58 14 63" fill="none" stroke="' + sh + '" stroke-width="4"/><circle cx="14" cy="65" r="3.6" fill="' + skin + '"/>';
    if (waving) s += '<g class="wave"><path d="M46 47 C52 42 54 36 54 30" fill="none" stroke="' + INK + '" stroke-width="8"/><path d="M46 47 C52 42 54 36 54 30" fill="none" stroke="' + sh + '" stroke-width="4"/><circle cx="54" cy="27" r="3.8" fill="' + skin + '"/></g>';
    else s += '<path d="M46 47 C51 52 52 58 50 63" fill="none" stroke="' + INK + '" stroke-width="8"/><path d="M46 47 C51 52 52 58 50 63" fill="none" stroke="' + sh + '" stroke-width="4"/><circle cx="50" cy="65" r="3.6" fill="' + skin + '"/>';
    /* head */
    s += '<circle cx="32" cy="25" r="17" fill="' + skin + '"/>';
    s += '<ellipse cx="25" cy="31" rx="3.4" ry="2.2" fill="#f2a08e" stroke="none" opacity="0.8"/><ellipse cx="41" cy="31" rx="3.4" ry="2.2" fill="#f2a08e" stroke="none" opacity="0.8"/>';
    s += '<circle cx="27" cy="26" r="2.2" fill="' + INK + '" stroke="none"/><circle cx="38" cy="26" r="2.2" fill="' + INK + '" stroke="none"/><path d="M29 33 Q32.5 36 36 33" fill="none" stroke-width="2.2"/>';
    /* hair or hat on top */
    if (hs === 6) s += '<path d="M16 24 C15 15 22 12 32 12 C42 12 49 15 48 24 C44 19 38 18 32 18 C26 18 20 19 16 24 Z" fill="' + hc + '"/><path d="M15 18 C15 2 49 2 49 18 Z" fill="#e0a646"/><rect x="14" y="14" width="36" height="7" rx="3.5" fill="#f2c14a"/><circle cx="32" cy="2" r="4.5" fill="#fff6e4"/>';
    else if (hs === 5) s += '<path d="M15 22 C15 7 49 7 49 22 Z" fill="' + sh + '"/><path d="M45 20 H59 C59 23 56 24 52 24 H45 Z" fill="' + sh + '"/><path d="M15 22 H49" />';
    else if (hs === 4) s += '<g fill="' + hc + '"><circle cx="18" cy="19" r="6"/><circle cx="25" cy="12" r="6.5"/><circle cx="33" cy="10" r="6.5"/><circle cx="41" cy="13" r="6.5"/><circle cx="47" cy="20" r="5.5"/></g>';
    else s += '<path d="M15 26 C12 6 52 6 49 26 C46 16 39 14 32 14 C25 14 18 17 15 26 Z" fill="' + hc + '"/>';
    return s + '</g></svg>';
  }

  /* the pet, walking to the right (or sitting on the start page) */
  var PETS = {
    dog: { c: '#e0a24a', d: '#b8772e', ear: 'flop', tail: 'up', collar: '#d9443a', muz: '#f2cf94' },
    cat: { c: '#f0a25a', d: '#c47a36', ear: 'point', tail: 'curl', collar: '#1f6a80', muz: '#fbe3c4' },
    wolf: { c: '#9aa2ae', d: '#6e7684', ear: 'point', tail: 'bush', collar: '#3f7d62', muz: '#eef0f2' },
    bear: { c: '#9a6440', d: '#6e4428', ear: 'round', tail: 'stub', collar: '#e0a646', muz: '#d8b088' }
  };
  function petSVG(kind) {
    var p = PETS[kind] || PETS.dog;
    var s = '<svg viewBox="0 0 80 58" aria-hidden="true"><g stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">';
    if (p.tail === 'up') s += '<path class="tail" d="M16 30 C8 26 6 18 9 12" fill="none" stroke="' + INK + '" stroke-width="8"/><path class="tail" d="M16 30 C8 26 6 18 9 12" fill="none" stroke="' + p.c + '" stroke-width="4"/>';
    if (p.tail === 'curl') s += '<path class="tail" d="M16 30 C4 28 4 12 12 10" fill="none" stroke="' + INK + '" stroke-width="7"/><path class="tail" d="M16 30 C4 28 4 12 12 10" fill="none" stroke="' + p.c + '" stroke-width="3.4"/>';
    if (p.tail === 'bush') s += '<path class="tail" d="M18 30 C6 32 2 24 4 18 C10 22 14 22 18 24 Z" fill="' + p.c + '"/>';
    if (p.tail === 'stub') s += '<circle cx="15" cy="30" r="4" fill="' + p.c + '"/>';
    s += '<rect x="20" y="38" width="7" height="15" rx="3" fill="' + p.d + '"/><rect x="46" y="38" width="7" height="15" rx="3" fill="' + p.d + '"/>';
    s += '<ellipse cx="36" cy="34" rx="22" ry="12" fill="' + p.c + '"/>';
    s += '<rect x="26" y="38" width="7" height="15" rx="3" fill="' + p.c + '"/><rect x="52" y="38" width="7" height="15" rx="3" fill="' + p.c + '"/>';
    /* head */
    var hx = 60, hy = 20;
    if (p.ear === 'point') s += '<path d="M' + (hx - 10) + ' ' + (hy - 6) + ' L' + (hx - 8) + ' ' + (hy - 20) + ' L' + (hx - 1) + ' ' + (hy - 10) + ' Z" fill="' + p.c + '"/><path d="M' + (hx + 3) + ' ' + (hy - 10) + ' L' + (hx + 9) + ' ' + (hy - 20) + ' L' + (hx + 12) + ' ' + (hy - 5) + ' Z" fill="' + p.c + '"/>';
    if (p.ear === 'round') s += '<circle cx="' + (hx - 8) + '" cy="' + (hy - 10) + '" r="5.5" fill="' + p.c + '"/><circle cx="' + (hx + 9) + '" cy="' + (hy - 10) + '" r="5.5" fill="' + p.c + '"/>';
    s += '<circle cx="' + hx + '" cy="' + hy + '" r="13" fill="' + p.c + '"/>';
    s += '<ellipse cx="' + (hx + 9) + '" cy="' + (hy + 5) + '" rx="8" ry="6" fill="' + p.muz + '"/><circle cx="' + (hx + 15) + '" cy="' + (hy + 3) + '" r="2.6" fill="' + INK + '"/>';
    if (p.ear === 'flop') s += '<path d="M' + (hx - 9) + ' ' + (hy - 9) + ' C' + (hx - 17) + ' ' + (hy - 4) + ' ' + (hx - 15) + ' ' + (hy + 8) + ' ' + (hx - 9) + ' ' + (hy + 10) + ' C' + (hx - 5) + ' ' + (hy + 4) + ' ' + (hx - 4) + ' ' + (hy - 4) + ' ' + (hx - 9) + ' ' + (hy - 9) + ' Z" fill="' + p.d + '"/>';
    s += '<circle cx="' + (hx + 4) + '" cy="' + (hy - 2) + '" r="2" fill="' + INK + '" stroke="none"/>';
    s += '<path d="M' + (hx - 9) + ' ' + (hy + 9) + ' Q' + (hx - 1) + ' ' + (hy + 15) + ' ' + (hx + 6) + ' ' + (hy + 11) + '" fill="none" stroke="' + p.collar + '" stroke-width="4"/>';
    return s + '</g></svg>';
  }

  var ISLE = '<svg viewBox="0 0 1000 250" aria-hidden="true"><defs><filter id="bGl" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="6"/></filter></defs>'
    + '<g stroke="#121a30" stroke-width="3" stroke-linejoin="round">'
    /* island */
    + '<path d="M30 250 C80 196 220 168 360 160 C520 150 700 152 830 170 C900 182 950 214 980 250 Z" fill="#9a8a78"/>'
    + '<path d="M60 236 C120 186 250 160 380 154 C530 146 700 146 820 162 C880 172 920 196 950 228 C820 214 560 210 300 216 C200 220 110 228 60 236 Z" fill="#2f5c48"/>'
    /* far trees */
    + '<path d="M120 196 v-24 M150 186 v-30 M880 196 v-26" stroke="#3a2a22" stroke-width="5"/>'
    + '<circle cx="120" cy="166" r="20" fill="#24493d"/><circle cx="150" cy="150" r="26" fill="#2a5444"/><circle cx="880" cy="166" r="24" fill="#24493d"/>'
    /* barn */
    + '<path d="M230 196 V146 L265 120 L300 146 V196 Z" fill="#8c3c36"/><path d="M222 150 L265 114 L308 150" fill="none" stroke="#e8dccb" stroke-width="5"/>'
    + '<rect x="252" y="164" width="26" height="32" fill="#3a2230"/><path d="M252 164 L278 196 M278 164 L252 196" stroke="#e8dccb" stroke-width="3"/>'
    /* cottage */
    + '<rect x="560" y="76" width="16" height="34" fill="#6e5a50"/>'
    + '<path d="M500 190 V128 H640 V190 Z" fill="#c9b494"/><path d="M486 134 L570 82 L654 134 Z" fill="#a8483e"/>'
    + '<rect x="555" y="152" width="26" height="38" rx="4" fill="#5a3a2e"/>'
    + '<g class="win"><rect x="515" y="144" width="26" height="22" rx="3" fill="#ffd27a" filter="url(#bGl)" stroke="none" opacity="0.9"/><rect x="598" y="144" width="26" height="22" rx="3" fill="#ffd27a" filter="url(#bGl)" stroke="none" opacity="0.9"/></g>'
    + '<rect x="515" y="144" width="26" height="22" rx="3" fill="#ffd98c"/><rect x="598" y="144" width="26" height="22" rx="3" fill="#ffd98c"/>'
    + '<path d="M528 144 V166 M515 155 H541 M611 144 V166 M598 155 H624" stroke-width="2.5"/>'
    + '<circle cx="577" cy="171" r="2" fill="#ffd27a" stroke="none"/>'
    /* apple tree */
    + '<path d="M700 192 v-34" stroke="#3a2a22" stroke-width="7"/><circle cx="700" cy="140" r="30" fill="#2f6a4a"/>'
    + '<g stroke-width="2"><circle cx="688" cy="134" r="4.5" fill="#d9443a"/><circle cx="710" cy="146" r="4.5" fill="#d9443a"/><circle cx="702" cy="124" r="4.5" fill="#d9443a"/></g>'
    /* tent */
    + '<path d="M760 200 L795 152 L830 200 Z" fill="#d9c8a4"/><path d="M795 152 V200" stroke-width="2.5"/><path d="M795 152 V136 L812 142 L795 148" fill="#e9684a"/>'
    /* fence */
    + '<path d="M330 198 H470 M330 186 H470" stroke="#b9a48a" stroke-width="4"/><path d="M340 180 v22 M370 180 v22 M400 180 v22 M430 180 v22 M460 180 v22" stroke="#b9a48a" stroke-width="5"/>'
    + '</g></svg>';

  var GROUND = '<svg viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="bGr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f5a40"/><stop offset="1" stop-color="#162a22"/></linearGradient></defs>'
    + '<path d="M0 34 C120 14 240 22 360 30 C500 40 640 18 780 22 C880 25 950 32 1000 28 V200 H0 Z" fill="url(#bGr)"/>'
    + '<path d="M0 34 C120 14 240 22 360 30 C500 40 640 18 780 22 C880 25 950 32 1000 28" fill="none" stroke="#5a8a5a" stroke-width="5"/>'
    + '<path d="M-10 154 C200 128 420 150 600 138 C760 128 900 140 1010 132 V156 C900 164 760 154 600 162 C420 174 200 152 -10 178 Z" fill="#7a644e" opacity="0.9"/>'
    + '</g></svg>';
  GROUND = GROUND.replace('</g></svg>', '</svg>');

  var LAMP = '<svg viewBox="0 0 26 78" aria-hidden="true"><g stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"><rect x="11" y="28" width="4" height="50" fill="#5a4030"/><path d="M5 10 H21 V28 H5 Z" fill="#3a3550"/><path d="M3 10 L13 2 L23 10 Z" fill="#2a2a3a"/><path d="M4 28 H22" stroke-width="3.4"/></g></svg>';
  var GATE = '<svg viewBox="0 0 80 90" aria-hidden="true"><g stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"><rect x="6" y="20" width="10" height="70" fill="#8a6a4e"/><rect x="64" y="20" width="10" height="70" fill="#8a6a4e"/><path d="M4 24 Q40 0 76 24 V30 Q40 8 4 30 Z" fill="#a8483e"/><path d="M16 50 H64 M16 70 H64 M28 50 V86 M40 50 V86 M52 50 V86" stroke="#c9a77a" stroke-width="5"/><path d="M16 50 H64 M16 70 H64" fill="none"/></g></svg>';
  var HEART = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 40 C6 28 6 12 16 10 C20 9 23 12 24 15 C25 12 28 9 32 10 C42 12 42 28 24 40 Z" fill="#e9684a" stroke="#22303c" stroke-width="3" stroke-linejoin="round"/></svg>';

  function title() {
    return '<svg viewBox="0 0 760 240" role="img" aria-label="Pips gård"><defs><linearGradient id="bTi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="0.6" stop-color="#ffe9b0"/><stop offset="1" stop-color="#f6c76a"/></linearGradient>'
      + '<path id="bArc" d="M70 200 Q380 40 690 200"/></defs>'
      + '<g font-family="Fredoka, \'Trebuchet MS\', system-ui, sans-serif" font-weight="700" font-size="124" text-anchor="middle" letter-spacing="2">'
      + '<text fill="#22303c" stroke="#22303c" stroke-width="22" stroke-linejoin="round" transform="translate(0 10)"><textPath href="#bArc" startOffset="50%">Pips gård</textPath></text>'
      + '<text fill="url(#bTi)" stroke="#22303c" stroke-width="14" stroke-linejoin="round" paint-order="stroke"><textPath href="#bArc" startOffset="50%">Pips gård</textPath></text></g>'
      /* a sprout and a little heart */
      + '<g stroke="#22303c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M380 92 V62" fill="none"/><path d="M380 72 C364 70 356 56 360 46 C372 48 380 58 380 72 Z" fill="#74a857"/><path d="M380 66 C392 60 404 46 400 36 C388 38 380 50 380 66 Z" fill="#8fc46a"/></g>'
      + '<path d="M694 70 C676 58 676 44 686 42 C690 41 693 44 694 47 C695 44 698 41 702 42 C712 44 712 58 694 70 Z" fill="#e9684a" stroke="#22303c" stroke-width="4" stroke-linejoin="round"/>'
      + '<g fill="#fff1b8"><path d="M78 70 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 z"/><path d="M640 18 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z"/></g></svg>';
  }

  /* repeatable random so the start page and the loading screen show the same stars */
  function rnd(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  function build(el, mode) {
    var r = rnd(7), h = '';
    h += '<div class="sky"></div><div class="dusk"></div><div class="stars">';
    for (var i = 0; i < 70; i++) { var c = r() < 0.12 ? ' class="b"' : r() < 0.5 ? ' class="s"' : ''; h += '<i' + c + ' style="left:' + (r() * 100).toFixed(1) + '%;top:' + (Math.pow(r(), 1.3) * 100).toFixed(1) + '%;animation-delay:-' + (r() * 3.2).toFixed(2) + 's"></i>'; }
    h += '</div><div class="moon"></div><div class="sun"></div><div class="sea">';
    for (i = 0; i < 9; i++) h += '<i class="shim" style="left:' + (5 + r() * 88).toFixed(1) + '%;top:' + (10 + r() * 55).toFixed(1) + '%;width:' + (24 + r() * 50 | 0) + 'px;animation-delay:-' + (r() * 4).toFixed(2) + 's"></i>';
    h += '</div><div class="isle">' + ISLE + '</div><div class="title">' + title() + '</div><div class="ground">' + GROUND;
    h += '<div class="flies">';
    for (i = 0; i < 9; i++) h += '<i style="left:' + (4 + r() * 92).toFixed(1) + '%;top:' + (r() * 70).toFixed(1) + '%;animation-delay:-' + (r() * 7).toFixed(2) + 's;animation-duration:' + (6 + r() * 4).toFixed(1) + 's"></i>';
    h += '</div></div>';
    el.innerHTML = h;
    return { av: readAv(), pet: readPet() };
  }

  window.PipsScene = { build: build, pipSVG: pipSVG, petSVG: petSVG, LAMP: LAMP, GATE: GATE, HEART: HEART };
})();
