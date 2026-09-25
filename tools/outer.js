// Regression: past the edge of town. The trail is chained shut until day 4;
// in the woods the path north of the stones loops back until day 6, then
// reaches the cannery. Also the search camp, the stand, the mailbox and the
// door in the dead tree.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html') + '?debug&day=3&map=town&spawn=trail');
  await p.waitForTimeout(1500);
  await p.addScriptTag({ path: path.resolve(__dirname, 'harness.js') });
  const idle = async () => { for (let i = 0; i < 200; i++) { if (await p.evaluate(() => T.idle())) return; await p.waitForTimeout(100); } };
  const run = async (fn) => { await p.evaluate(fn); await p.waitForTimeout(300); await idle(); };
  const st = () => p.evaluate(() => ({ map: Game.st.map, inv: Game.st.inv.slice(), found: Object.keys(Game.st.found), flags: Game.st.flags, x: +World.player.x.toFixed(2), z: +World.player.z.toFixed(2) }));
  const logTail = () => p.evaluate(() => T.log.slice(-6).join(' | '));
  const results = [];
  const check = (ok, what, info) => { results.push(ok); console.log((ok ? 'PASS ' : 'FAIL ') + what + (ok ? '' : '  ' + JSON.stringify(info))); };
  await run(() => { UI.clearAll(); });

  await run(() => T.doorAt(-40, 71.8));
  let s = await st(); check(s.map === 'town', 'day 3: the trail is chained shut', s);
  await run(() => { Game.st.day = 4; Game.enterMap('town', 'trail'); });
  await run(() => T.doorAt(-40, 71.8));
  s = await st(); check(s.map === 'woods', 'day 4: the chain is down, into the woods', s);
  await run(() => T.useAt(-64.6, -37.6));
  s = await st(); check(s.found.includes('search_flyer'), 'flyer at the search camp', s.found);
  await run(() => T.useAt(36.5, -31.8));
  check(/smokestack/.test(await logTail()), 'up the hunting stand', await logTail());
  await run(() => T.useAt(66, -31.6));
  check(/mailbox/.test(await logTail()), 'the mailbox in the woods', await logTail());
  // walking north from the stones brings you back to the stones
  await run(() => { World.player.x = 0; World.player.z = -99; World.player.face = 0; });
  await p.keyboard.down('ArrowUp'); await p.waitForTimeout(1600); await p.keyboard.up('ArrowUp');
  await idle(); await p.waitForTimeout(400); await idle();
  s = await st(); check(s.map === 'woods' && s.z > -66 && s.z < -55, 'day 4: north of the stones loops back to the stones', s);
  // the door in the dead tree
  await run(() => { World.player.x = -35; World.player.z = -70.8; T.doorAt(-35, -71.6); });
  s = await st(); check(s.map === 'woods' && s.x > 110, 'the dead tree\'s door opens into a bedroom', s);
  await run(() => T.door('woods', 'outtree'));
  s = await st(); check(s.map === 'woods' && s.x < -30, 'and back out into the woods', s);
  const walkOK = await p.evaluate(() => [World.walkOk(0, -30), World.walkOk(10, -10), World.walkOk(-38, -32), World.walkOk(-38, -28)]);
  check(walkOK.join() === 'true,false,true,false', 'paths are walkable, the trees and the creek are not', walkOK);

  // day 6: the path reaches the cannery
  await run(() => { Game.st.day = 6; Game.enterMap('woods', 'trail'); });
  const gate = await p.evaluate(() => World.map.doors.some((d) => d.to === 'cannery'));
  check(gate, 'day 6: a gate at the end of the north path', gate);
  await run(() => T.door('cannery', 'gate'));
  s = await st(); check(s.map === 'cannery', 'through the gate to the cannery', s);
  await run(() => T.door('cannery', 'receiving'));
  s = await st(); check(s.map === 'cannery' && s.x > 40, 'in through the loading dock', s);
  await run(() => T.useAt(55, -26));
  s = await st(); check(s.found.includes('can_label'), 'a label off the canning line', s.found);
  await run(() => T.useAt(50, -49.4));
  check(/VANE, W/.test(await logTail()), 'the foreman\'s ledger', await logTail());
  await run(() => T.door('cannery', 'dock'));
  await run(() => T.door('woods', 'gate'));
  s = await st(); check(s.map === 'woods', 'back out to the woods', s);
  await run(() => T.door('town', 'trail'));
  s = await st(); check(s.map === 'town', 'and home to town', s);

  console.log(errs.join('\n') || 'no page errors');
  await b.close();
  process.exit(results.every(Boolean) && !errs.length ? 0 : 1);
})();
