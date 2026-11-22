// Plays the farm test page on a fake clock with a fixed random seed and records what happens,
// so two builds can be compared.
//   [PAGE=path/to/test-bondgard.html] node tests/compare.js record <dir>   (writes <dir>/run.json and screenshots)
//   node tests/compare.js diff <dirA> <dirB>  (compares two records)
// Runs: a grown farm from a saved game (walks to grain, water and the hen pen, visits the barn
// and the market) and a brand-new farm (the first-day tutorial start).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PAGE = 'file://' + path.resolve(process.env.PAGE || path.join(__dirname, '..', 'build', 'test-bondgard.html'));
const SAVE = JSON.parse(fs.readFileSync(path.join(__dirname, 'farm-save.json'), 'utf8'));

async function run(dir, name, save) {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 640, height: 448 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.clock.install({ time: new Date('2026-11-22T12:00:00Z') });
  await p.addInitScript((save) => {
    let s = 12345; Math.random = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
    window.__farmTest = 1;
    localStorage.setItem('pips-avatar', '{"skin":1,"hs":6}');
    localStorage.setItem('pips-gfx', 'full'); localStorage.setItem('pips-gfx-by', 'hand');
    if (save) localStorage.setItem('pip-farm-care-v1', JSON.stringify(save));
  }, save);
  await p.goto(PAGE);
  const tick = async (ms) => { for (let t = 0; t < ms; t += 100) await p.clock.runFor(100); };
  await tick(3000);
  const out = { name, steps: [] };
  const snap = async (label) => {
    const r = await p.evaluate(() => {
      const T = window.__farmTest; if (!T || !T.st) return { noTestApi: true };
      const st = T.st(); const round = (v) => Math.round(v * 10) / 10;
      return { pip: T.pip().map(round), carry: T.carry(), boxes: T.boxes(), animals: T.animals(), helpers: T.helpers(), coins: st && st.coins, shopCoins: st && st.shop && st.shop.coins, keys: st ? Object.keys(st).sort().join(',') : '' };
    });
    out.steps.push({ label, ...r });
    await p.screenshot({ path: path.join(dir, name + '-' + label + '.png') });
  };
  await snap('start');
  if (save) {
    const go = async (x, z, ms) => { await p.evaluate(([x, z]) => { window.__farmTest.go(x, z); const P = window.__pip; P.position.x = x; P.position.z = z; }, [x, z]); await tick(ms); };
    await go(-10.4, -1.6, 2500); await snap('grain');
    await go(-10.4, 1.6, 2500); await snap('water');
    await go(-12.75, 0, 3000); await snap('pen');
    await go(0, 9, 3000); await snap('south');
    await go(10, -4, 3000); await snap('east');
  } else {
    await tick(4000); await snap('later');
  }
  out.errors = errs;
  await b.close();
  return out;
}

(async () => {
  const [cmd, a, bdir] = process.argv.slice(2);
  if (cmd === 'record') {
    fs.mkdirSync(a, { recursive: true });
    const res = [await run(a, 'grown', SAVE), await run(a, 'new', null)];
    fs.writeFileSync(path.join(a, 'run.json'), JSON.stringify(res, null, 1));
    const errs = res.flatMap((r) => r.errors);
    console.log('recorded', a, errs.length ? errs : 'no page errors');
    process.exit(errs.length ? 1 : 0);
  }
  if (cmd === 'diff') {
    const A = JSON.parse(fs.readFileSync(path.join(a, 'run.json'))), B = JSON.parse(fs.readFileSync(path.join(bdir, 'run.json')));
    let bad = 0;
    A.forEach((ra, i) => {
      const rb = B[i];
      if (JSON.stringify(ra.errors) !== JSON.stringify(rb.errors)) { bad++; console.log(ra.name, 'errors', ra.errors, '->', rb.errors); }
      ra.steps.forEach((sa, j) => {
        const sb = rb.steps[j];
        for (const k of Object.keys(sa)) if (JSON.stringify(sa[k]) !== JSON.stringify(sb[k])) { bad++; console.log(ra.name, sa.label, k, JSON.stringify(sa[k]), '->', JSON.stringify(sb[k])); }
        const pa = fs.readFileSync(path.join(a, ra.name + '-' + sa.label + '.png')), pb = fs.readFileSync(path.join(bdir, ra.name + '-' + sa.label + '.png'));
        console.log(ra.name, sa.label, pa.equals(pb) ? 'same picture' : 'PICTURE DIFFERS');
        if (!pa.equals(pb)) bad++;
      });
    });
    console.log(bad ? bad + ' differences' : 'no differences');
    process.exit(bad ? 1 : 0);
  }
})();
