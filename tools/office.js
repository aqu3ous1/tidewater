// Regression: day 6, Walter asleep in his office. Leaving through the doorway
// (or being inside when the office locks) must never leave you shut in.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html') + '?debug&day=6&map=aquarium&spawn=front');
  await p.waitForTimeout(1500);
  await p.addScriptTag({ path: path.resolve(__dirname, 'harness.js') });
  // 1) standing in the doorway, then stepping out into the corridor (the office locks behind you)
  await p.evaluate(() => {
    UI.clearAll(); const st = Game.st, f = st.flags;
    f.hired = true; f.officeOpen = true; f.walterSpot = 'asleep'; f.snoopStart = World.time; st.obj = { id: 'leave6', text: 'LEAVE THE OFFICE.' };
    Game.reloadMap(); World.player.x = 31.5; World.player.z = -28.0; 0;
  });
  await p.keyboard.down('ArrowDown'); await p.waitForTimeout(700); await p.keyboard.up('ArrowDown');
  await p.waitForTimeout(3500);
  const r1 = await p.evaluate(() => ({ z: World.player.z, open: !!Game.st.flags.officeOpen, obj: Game.st.obj && Game.st.obj.id }));
  const ok1 = r1.z > -27.5 && !r1.open;
  console.log((ok1 ? 'PASS' : 'FAIL') + ' leave through the doorway -> outside, office locked: ' + JSON.stringify(r1));
  // 2) somehow inside a locked office: the inside of the door lets you out
  await p.evaluate(() => { UI.clearAll(); Game.st.flags.officeOpen = false; Game.st.flags.snoopStart = null; Game.reloadMap(); World.player.x = 31.5; World.player.z = -29.6; World.player.face = Math.PI; 0; });
  await p.waitForTimeout(500);
  await p.keyboard.press('z'); await p.waitForTimeout(1500);
  const r2 = await p.evaluate(() => ({ z: World.player.z }));
  const ok2 = r2.z > -27.5;
  console.log((ok2 ? 'PASS' : 'FAIL') + ' shut inside the locked office -> can let yourself out: ' + JSON.stringify(r2));
  console.log(errs.join('\n') || 'no page errors');
  await b.close();
  process.exit(ok1 && ok2 ? 0 : 1);
})();
