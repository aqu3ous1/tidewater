// Automated playthrough. Drives the real game logic through the harness and
// prints the dialogue transcript + any errors.
//   NODE_PATH=$(npm root -g) node tools/playthrough.js <script.json|builtin> [outdir]
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

async function main() {
  const which = process.argv[2] || 'days';
  const outdir = process.argv[3] || '.';
  const steps = require(path.resolve(__dirname, 'scripts', which + '.js'));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 960, height: 720 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' ')));
  p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  const q = steps.query || '';
  await p.goto('file://' + path.resolve(__dirname, '..', 'index.html') + (q ? '?' + q : ''));
  await p.waitForTimeout(800);
  await p.addScriptTag({ path: path.resolve(__dirname, 'harness.js') });
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  const idle = async (ms) => {
    const t0 = Date.now();
    await p.waitForTimeout(120);
    while (Date.now() - t0 < (ms || 90000)) {
      const ok = await p.evaluate(() => T.idle());
      if (ok) { await p.waitForTimeout(150); if (await p.evaluate(() => T.idle())) return true; }
      await p.waitForTimeout(100);
    }
    console.log('   (timeout waiting for idle)');
    return false;
  };
  let n = 0;
  for (const s of steps.steps) {
    n++;
    const [op, ...a] = s;
    let js = null;
    if (op === 'eval') js = a[0];
    else if (op === 'new') js = `Game.newGame(${JSON.stringify(a[0] || 'TESTER')}, 0)`;
    else if (op === 'door') js = `T.door(${JSON.stringify(a[0])}${a[1] ? ',' + JSON.stringify(a[1]) : ''})`;
    else if (op === 'doorAt') js = `T.doorAt(${a[0]}, ${a[1]})`;
    else if (op === 'use') js = `T.useAt(${a[0]}, ${a[1]})`;
    else if (op === 'talk') js = `T.talk(${JSON.stringify(a[0])})`;
    else if (op === 'item') js = `T.use(${JSON.stringify(a[0])}, ${JSON.stringify(a[1] || '')})`;
    else if (op === 'answers') js = `T.answers.push(...${JSON.stringify(a[0])})`;
    else if (op === 'tp') js = `T.tp(${a[0]}, ${a[1]})`;
    else if (op === 'wait') { await p.waitForTimeout(a[0]); continue; }
    else if (op === 'shot') { await p.waitForTimeout(400); await p.screenshot({ path: path.join(outdir, a[0] + '.png') }); continue; }
    else if (op === 'check') {
      let ok = false; try { ok = await p.evaluate(a[0]); } catch (e) { ok = false; }
      if (!ok) { const sm = await p.evaluate(() => T.summary()); console.log(`!! CHECK FAILED at step ${n}: ${a[0]}  state=${JSON.stringify(sm)}`); }
      continue;
    } else if (op === 'print') { console.log(JSON.stringify(await p.evaluate(a[0]))); continue; }
    if (js) { try { await p.evaluate(js); } catch (e) { console.log('eval error at step', n, e.message); } }
    await idle(a[a.length - 1] && typeof a[a.length - 1] === 'number' && op !== 'use' && op !== 'tp' && op !== 'doorAt' ? a[a.length - 1] : 90000);
    const log = await p.evaluate(() => { const l = T.log.slice(); T.log.length = 0; return l; });
    for (const line of log) console.log('   ' + line);
    const perr = await p.evaluate(() => { const e = T.errors.slice(); T.errors.length = 0; return e; });
    for (const e of perr) console.log('!! ERROR: ' + e);
    const sm = await p.evaluate(() => T.summary());
    console.log(`#${n} ${op} ${a.join(' ')} -> day ${sm.day} ${sm.tod} @${sm.map} | ${sm.obj || '-'}`);
    if (errs.length) { for (const e of errs.splice(0)) console.log('!! ' + e); }
  }
  await b.close();
}
main();
