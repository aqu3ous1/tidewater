// Regression: loading a save made at the start of a day (the autosave, or the
// bedtime save) must replay that morning so there's something to do.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  let fails = 0;
  for (const day of [2, 3, 4, 5, 6, 7]) for (const kind of ['old save', 'new save']) {
    const p = await b.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('file://' + path.resolve(__dirname, '../index.html') + '?debug&day=' + day + '&map=house&spawn=bed');
    await p.waitForTimeout(1300);
    await p.addScriptTag({ path: path.resolve(__dirname, 'harness.js') });
    const r = await p.evaluate(async ([day, kind]) => {
      // a morning save: at home, in bed, the day's opening not run yet
      const st = Game.st; st.day = day; st.tod = 'morning'; st.map = 'house'; st.spawn = 'bed'; st.obj = null; st.side = []; st.checkpoint = null;
      if (kind === 'old save') delete st.flags.openedDay; else st.flags.openedDay = day - 1;
      State.save(2, st, 'TEST');
      Game.loadGame(State.load(2));
      await new Promise((res) => setTimeout(res, 6000));
      return { obj: Game.st.obj && Game.st.obj.text, day: Game.st.day, opened: Game.st.flags.openedDay };
    }, [day, kind]);
    const ok = !!r.obj && r.day === day && r.opened === day;
    if (!ok) fails++;
    console.log((ok ? 'PASS' : 'FAIL') + ' day ' + day + ' ' + kind + ' -> ' + JSON.stringify(r) + (errs.length ? ' errors: ' + errs.join('; ') : ''));
    await p.close();
  }
  await b.close();
  process.exit(fails ? 1 : 0);
})();
