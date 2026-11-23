// House radio check: walks into the cottage, onto the radio ring, picks stations, checks music state and saves.
//   python3 tools/build.py && node tests/radio.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  const SAVE = fs.readFileSync(path.join(__dirname, 'farm-save.json'), 'utf8');
  await p.addInitScript((s) => { window.__farmTest = 1; if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', 1); localStorage.clear(); localStorage.setItem('pip-farm-care-v1', s); localStorage.setItem('pips-notut', '1'); localStorage.setItem('pips-avatar', JSON.stringify({ skin: 1, hs: 6, hc: 1, sh: 0, bs: 0, bc: 0, ss: 0, sc: 0 })); } }, SAVE);
  /* served from disk through a made-up origin, so fetch() of the music works (it does not on file://) */
  const ROOT = path.join(__dirname, '..');
  await p.route('http://pips.test/**', (r) => { let f = new URL(r.request().url()).pathname.replace(/^\//, ''); if (f.startsWith('build/audio/')) f = f.slice(6); if (f === 'three.min.js' || f === 'build/three.min.js') f = 'three.min.js';
    const full = path.join(ROOT, f); if (!fs.existsSync(full)) return r.fulfill({ status: 404, body: '' }); r.fulfill({ path: full }); });
  const url = 'http://pips.test/build/test-bondgard.html';
  await p.goto(url); await p.waitForTimeout(6000);
  const R = (f, a) => p.evaluate(f, a);
  await R(() => { __snd.init(); __farmTest.clock(480 * 3 + 60); });
  await p.waitForTimeout(1500);
  const out = {}; const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
  out.outside = await R(() => __radio.state());
  ok(out.outside.mode === 'auto' && out.outside.want === out.outside.track, 'auto plays today\'s song outside');
  await R(() => __radio.goIn()); await p.waitForTimeout(1500);
  out.home = await R(() => ({ home: __radio.home(), s: __radio.state() }));
  ok(out.home.home, 'in the cottage'); ok(out.home.s.want === 'relaxed' || console.log(out.home), 'house plays the calm tune before the radio is used');
  await p.screenshot({ path: path.join(__dirname, '..', 'build', 'radio-house.png') });
  const ring = await R(() => __radio.ring()); const H = await R(() => { const p = __farmTest.pip(); return [p[0], p[1] - 3.7]; }); /* the house centre */
  await R((h) => __farmTest.go(h[0], h[1] - 5.6), H); await p.waitForTimeout(7000);
  await p.screenshot({ path: path.join(__dirname, '..', 'build', 'radio-bedroom.png') });
  await R((r) => __farmTest.go(r[0], r[1]), ring); await p.waitForTimeout(6000);
  out.atRing = await R(() => ({ pip: __farmTest.pip(), s: __radio.state() }));
  ok(out.atRing.s.open && out.atRing.s.btns === 6, 'standing on the ring opens the radio with 6 stations');
  await p.screenshot({ path: path.join(__dirname, '..', 'build', 'radio-card.png') });
  await R(() => __radio.tap('sway')); await p.waitForTimeout(150);
  await R(() => __radio.tap('whistle')); await p.waitForTimeout(100);
  await R(() => __radio.tap('warm')); await p.waitForTimeout(6000);
  out.after = await R(() => __radio.state());
  ok(out.after.mode === 'warm' && out.after.want === 'warm' && out.after.preview, 'preview plays the picked station in the house');
  ok(out.after.eff === 'warm', 'the picked station is the one heard');
  ok(!/sway:ready|whistle:ready/.test(out.after.loaded), 'stations tapped past are let go');
  ok(JSON.parse(await R(() => localStorage.getItem('pips-radio'))).mode === 'warm', 'saved');
  await R(() => __radio.close());
  await R((r) => __farmTest.go(r[0] + 1.2, r[1] + 0.6), ring); await p.waitForTimeout(2500);
  await p.screenshot({ path: path.join(__dirname, '..', 'build', 'radio-notes.png') });
  await R(() => __radio.goOut()); await p.waitForTimeout(1500);
  out.out2 = await R(() => __radio.state());
  ok(out.out2.want === 'warm' && !out.out2.preview, 'outside by day the station keeps playing');
  await R(() => __farmTest.clock(480 * 3 + 480 * 0.8)); await p.waitForTimeout(800);
  ok((await R(() => __radio.state())).want === 'relaxed', 'night still has the calm tune');
  await R(() => __radio.set('off')); await p.waitForTimeout(300);
  ok((await R(() => __radio.state())).want === null, 'off means no music');
  // auto across days: never the same twice in a row
  await R(() => __radio.set('auto'));
  const seq = await R(async () => { const o = []; for (let d = 4; d < 14; d++) { __farmTest.clock(480 * d + 60); await new Promise((r) => setTimeout(r, 120)); o.push(__radio.state().track); } return o; });
  out.seq = seq; ok(seq.every((t, i) => i === 0 || t !== seq[i - 1]), 'auto never repeats yesterday');
  // reload keeps the mode
  await R(() => __radio.set('sway')); await p.reload(); await p.waitForTimeout(6000);
  ok((await R(() => __radio.state())).mode === 'sway', 'mode survives a reload');
  console.log(JSON.stringify(out, null, 1));
  await b.close();
  console.log(fail.length ? 'FAIL: ' + fail.join('; ') : 'radio ok', errs.length ? errs : 'no page errors');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
