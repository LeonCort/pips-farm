// Checks the automatic log sending: serves the built test page on a fake https host, catches the posts to the receiver.
//   python3 tools/build.py && node tests/logsend.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const root = path.join(__dirname, '..');
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1000, height: 700 } });
  const posts = [], errs = [];
  await ctx.route('https://pips.test/**', (r) => {
    let f = new URL(r.request().url()).pathname.replace(/^\//, '') || 'index.html';
    if (f === 'bondgard.html') f = 'build/test-bondgard.html';
    const fp = path.join(root, f);
    if (!fs.existsSync(fp)) return r.fulfill({ status: 404, body: '' });
    r.fulfill({ status: 200, body: fs.readFileSync(fp), contentType: f.endsWith('.html') ? 'text/html' : f.endsWith('.js') ? 'application/javascript' : undefined });
  });
  await ctx.route('https://pips-log-leoncorts-projects.vercel.app/**', (r) => { posts.push(JSON.parse(r.request().postData())); r.fulfill({ status: 200, body: 'ok', headers: { 'access-control-allow-origin': '*' } }); });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  // a previous session that froze
  await p.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
    localStorage.setItem('pips-log', JSON.stringify({ page: 'bondgard.html', start: 1795400000000, beat: 1795400100000, closed: false, ver: 'old', lines: [{ t: '10:00:00', k: 'STALL', m: 'the game loop stopped running', s: 1 }] }));
  });
  await p.goto('https://pips.test/bondgard.html');
  await p.waitForTimeout(10000);
  const crash = posts.filter(x => x.reason === 'crash');
  const quiet = await p.evaluate(() => window.PipsLog.send('periodic'));
  const warns = await p.evaluate(() => window.PipsLog.text().split('\n').filter(l => / (warn|ERROR|STALL) /.test(l) && !/Previous session/.test(l)).slice(0, 5));
  await p.evaluate(() => { setTimeout(() => { throw new Error('test boom'); }, 0); });
  await p.waitForTimeout(500);
  const sent = await p.evaluate(() => window.PipsLog.send('error'));
  const txt = await p.evaluate(() => window.PipsLog.text().split('\n').slice(0, 3).join(' / '));
  await p.reload(); await p.waitForTimeout(9000);
  const crash2 = posts.filter(x => x.reason === 'crash').length;
  const pip = await p.evaluate(() => !!window.__pip);
  await b.close();
  const err = posts.find(x => x.reason === 'error');
  console.log('posts', posts.map(x => x.reason + ':' + x.text.length)); const per = posts.find(x => x.reason === 'periodic'); if (per) console.log('periodic text:\n' + per.text.slice(0, 900));
  console.log('crash report', crash.length === 1 && /did NOT close/.test(crash[0].text) && crash[0].ver === 'old' ? 'OK' : 'FAIL');
  console.log('error batch', sent && err && /test boom/.test(err.text) && err.id && err.host === 'pips.test' ? 'OK' : 'FAIL');
  console.log('crash sent once', crash2 === 1 ? 'OK' : 'FAIL ' + crash2);
  // a loading-time stall alone sends nothing; this page also logs a real three.js NaN error at start, so a batch is expected then
  const hasErr = warns.some(l => / (ERROR|warn) /.test(l));
  console.log('sends only around problems', (hasErr ? quiet === true : quiet === false) ? 'OK' : 'FAIL ' + JSON.stringify(warns));
  console.log('error batch is trimmed', err && err.text.split('\n').length < 25 ? 'OK (' + err.text.split('\n').length + ' lines)' : 'FAIL');
  console.log('header:', txt);
  console.log('pip', pip, 'page errors', errs);
})();
