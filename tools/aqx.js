// Regression: the rest of the aquarium. Walks through the upper floor and both
// basement levels with the in-page harness: stairs, the projector and the film,
// the dome ladder, the walk-in freezer, the time clock, the freight elevator,
// the crawlspace, the walkie-talkie and the bricked room on the last day.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html') + '?debug&day=5&map=aquarium&spawn=front');
  await p.waitForTimeout(1500);
  await p.addScriptTag({ path: path.resolve(__dirname, 'harness.js') });
  const idle = async () => { for (let i = 0; i < 200; i++) { if (await p.evaluate(() => T.idle())) return; await p.waitForTimeout(100); } };
  const run = async (src) => { await p.evaluate(src); await p.waitForTimeout(300); await idle(); };
  const st = () => p.evaluate(() => ({ map: Game.st.map, inv: Game.st.inv.slice(), found: Object.keys(Game.st.found), flags: Game.st.flags, x: World.player.x, z: World.player.z }));
  const results = [];
  const check = (ok, what, info) => { results.push(ok); console.log((ok ? 'PASS ' : 'FAIL ') + what + (ok ? '' : '  ' + JSON.stringify(info))); };
  await run(() => { UI.clearAll(); Game.st.flags.hired = true; Game.reloadMap(); });

  // ---- upper floor
  await run(() => T.door('aq2', 'stairs'));
  let s = await st(); check(s.map === 'aq2', 'lobby stairs -> upper floor', s);
  await run(() => T.useAt(38.6, -12));
  s = await st(); check(s.found.includes('film_reel'), 'film reel in the projection booth', s.found);
  await run(() => T.useAt(36, -16.8));
  s = await st(); check(!!s.flags.filmThreaded, 'thread the projector', s.flags);
  await run(() => T.useAt(-12, -19.6));
  let log = await p.evaluate(() => T.log.join('\n'));
  check(/inspect/.test(log), 'the film plays in the theater', log.slice(-300));
  await run(() => T.useAt(35, 4.4));
  s = await st(); check(Math.hypot(s.x - 140, s.z - 1.5) < 1, 'dome ladder -> the dome (day 5)', s);
  await run(() => T.useAt(140, 2.2));
  s = await st(); check(Math.hypot(s.x - 35, s.z - 3.6) < 1, 'back down the ladder', s);
  await run(() => T.door('aquarium', 'from2f'));
  s = await st(); check(s.map === 'aquarium', 'upper floor -> lobby', s);

  // ---- B1
  await run(() => T.door('aqb1', 'stairs'));
  s = await st(); check(s.map === 'aqb1', 'storage room stairs -> B1 (day 5)', s);
  await run(() => T.useAt(1.3, -6));
  s = await st(); check(s.inv.includes('timecard'), 'time card from the time clock', s.inv);
  await run(() => T.useAt(5.6, -14.6));
  s = await st(); check(s.inv.includes('freezer_key'), 'freezer key in the fish kitchen', s.inv);
  await run(() => { World.player.x = 13.2; World.player.z = -12; T.doorAt(14, -12); });
  s = await st(); check(!!s.flags.freezerOpen, 'the key opens the walk-in', s.flags);
  const walkIn = await p.evaluate(() => { World.player.x = 13; World.player.z = -12; for (let i = 0; i < 60; i++) { World.player.x += 0.1; if (World.blocked && World.blocked(World.player.x, World.player.z)) break; } return World.player.x; });
  check(walkIn > 14.5, 'nothing blocks the open freezer doorway', walkIn);
  await run(() => T.useAt(11.4, -38.8));
  s = await st(); check(s.inv.includes('freight_key'), 'freight key on the pegboard (day 5)', s.inv);
  await run(() => T.doorAt(0, -50));
  s = await st(); check(s.map === 'aqb2', 'freight elevator -> B2', s);

  // ---- B2
  await run(() => T.useAt(-10.4, 1.9));
  s = await st(); check(s.inv.includes('blueprint'), 'blueprint in the planning office', s.inv);
  await run(() => T.useAt(14, -2.4));
  s = await st(); check(s.inv.includes('personnel'), 'personnel file in records', s.inv);
  await run(() => T.useAt(17.2, 2));
  s = await st(); check(s.x > 22 && s.x < 25, 'crawl in through the loose panel', s);
  await run(() => T.useAt(42, 3.6));
  await run(() => T.useAt(44.8, -1.6));
  s = await st(); check(s.inv.includes('walkie') && s.found.includes('keeper_badge'), 'walkie-talkie and the junior keeper badge', s);
  await run(() => { T.log.length = 0; T.use('walkie'); });
  log = await p.evaluate(() => T.log.join('\n'));
  check(/over\./.test(log), 'the walkie answers down here', log);
  await run(() => T.useAt(22.6, 1));
  s = await st(); check(s.x < 18, 'crawl back out', s);
  await run(() => T.doorAt(0, 4));
  s = await st(); check(s.map === 'aqb1', 'freight elevator -> back up to B1', s);
  await run(() => T.door('aquarium', 'fromb1'));
  s = await st(); check(s.map === 'aquarium', 'B1 stairs -> storage room', s);

  // ---- day 8: the bricked room is open
  await run(() => { Game.st.day = 8; Game.enterMap('aqb2', 'elevator'); });
  const tv = await p.evaluate(() => World.map.inters.some((it) => Math.hypot(it.x + 22, it.z + 12) < 0.5));
  check(tv, 'day 8: the bricked-up room is open', tv);
  await run(() => T.useAt(-22, -12));
  log = await p.evaluate(() => T.log.join('\n'));
  check(/not supposed to see/.test(log), 'the TV in the bricked room', log.slice(-200));

  console.log(errs.join('\n') || 'no page errors');
  await b.close();
  process.exit(results.every(Boolean) && !errs.length ? 0 : 1);
})();
