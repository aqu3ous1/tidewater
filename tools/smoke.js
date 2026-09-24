// Headless smoke test / screenshot tool.
//   NODE_PATH=$(npm root -g) node tools/smoke.js "<query>" out.png [waitMs] [js-to-eval-after-load]
const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const [, , query, out, wait, extra] = process.argv;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 960, height: 720 } });
  const errs = [];
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n')));
  const url = 'file://' + path.resolve(__dirname, '..', 'index.html') + (query ? '?' + query : '');
  await p.goto(url);
  await p.waitForTimeout(+(wait || 1500));
  if (extra) { const r = await p.evaluate(extra); if (r !== undefined) console.log('eval:', JSON.stringify(r)); await p.waitForTimeout(600); }
  await p.screenshot({ path: out || 'shot.png' });
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
