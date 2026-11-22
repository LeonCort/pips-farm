// Loads a built test page headless and fails on any page error.
//   python3 tools/build.py && node tests/smoke.js [bondgard.html]
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const page = process.argv[2] || 'bondgard.html';
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__farmTest = 1; });
  await p.goto('file://' + path.resolve(process.env.PAGE || path.join(__dirname, '..', 'build', 'test-' + page)));
  await p.waitForTimeout(6000);
  const ok = await p.evaluate(() => !!window.__pip);
  await p.screenshot({ path: path.join(__dirname, '..', 'build', 'smoke-' + page.replace('.html', '.png')) });
  await b.close();
  console.log(page, ok ? 'Pip is on the island' : 'NO PIP', errs.length ? errs : 'no page errors');
  process.exit(ok && !errs.length ? 0 : 1);
})();
