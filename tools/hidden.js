// Regression: hidden Bellwood. The storm drain (manhole in, Kessler cellar,
// out through the beach), the treehouse password, under the pier, the bell
// tower, the back of Rosa's, the attic, and the new rooms in the Miller and
// Kessler houses.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html') + '?debug&day=5&map=town&spawn=house');
  await p.waitForTimeout(1500);
  await p.addScriptTag({ path: path.resolve(__dirname, 'harness.js') });
  const idle = async () => { for (let i = 0; i < 200; i++) { if (await p.evaluate(() => T.idle())) return; await p.waitForTimeout(100); } };
  const run = async (fn, arg) => { await p.evaluate(fn, arg); await p.waitForTimeout(300); await idle(); };
  const st = () => p.evaluate(() => ({ map: Game.st.map, inv: Game.st.inv.slice(), found: Object.keys(Game.st.found), flags: Game.st.flags, x: World.player.x, z: World.player.z }));
  const logTail = () => p.evaluate(() => T.log.slice(-6).join(' | '));
  const results = [];
  const check = (ok, what, info) => { results.push(ok); console.log((ok ? 'PASS ' : 'FAIL ') + what + (ok ? '' : '  ' + JSON.stringify(info))); };
  await run(() => { UI.clearAll(); });

  // ---- the storm drain
  await run(() => T.useAt(1.5, 4));
  let s = await st(); check(s.map === 'drain', 'manhole -> storm drain (day 5)', s);
  await run(() => T.useAt(-27.2, -15.4));
  s = await st(); check(s.found.includes('radio5'), 'tape in the living room under the street', s.found);
  await run(() => { T.log.length = 0; T.use('radio5', 'PLAY'); });
  check(/TUNNELS|tunnels/.test(await logTail()), 'play RADIO EVAN #5', await logTail());
  await run(() => T.useAt(-22, -24));
  check(/TV/.test(await logTail()), 'the TV in the tunnel living room', await logTail());
  await run(() => T.doorAt(-43, -20));
  s = await st(); check(s.map === 'kessler' && s.x > 14, 'through the hole into the Kessler cellar', s);
  await run(() => { World.player.x = 23.5; World.player.z = -0.8; T.doorAt(23.5, 0); });
  s = await st(); check(s.map === 'kessler' && s.x > 14, 'cellar stairs stay bolted without the Kessler key', s);
  await run(() => T.doorAt(15, -4));
  s = await st(); check(s.map === 'drain', 'back out into the drain', s);
  await run(() => T.doorAt(33, -70));
  s = await st(); check(s.map === 'town' && !!s.flags.outfallOpen, 'out through the grate onto the beach', s);
  await run(() => T.doorAt(30, -90.6));
  s = await st(); check(s.map === 'drain', 'the beach grate is open from outside now', s);
  await run(() => T.door('town', 'manhole'));
  s = await st(); check(s.map === 'town', 'up the manhole ladder', s);

  // ---- the treehouse
  await run(() => { T.answers.push('1234'); T.useAt(-73, 43.2); });
  s = await st(); check(s.map === 'town' && !s.flags.clubIn, 'wrong treehouse password', s.flags.clubIn);
  await run(() => { T.answers.push('0812'); T.useAt(-73, 43.2); });
  s = await st(); check(s.map === 'treehouse', 'the password is his birthday', s);
  await run(() => T.useAt(-1.2, -2.2));
  s = await st(); check(s.found.includes('club_card'), 'Tide Club card', s.found);
  await run(() => T.useAt(0.6, -2.1));
  check(/periscope/.test(await logTail()), 'the periscope', await logTail());
  await run(() => T.door('town', 'treehouse'));
  s = await st(); check(s.map === 'town', 'back down the ladder', s);

  // ---- under the pier
  await run(() => T.useAt(42.8, -88.6));
  s = await st(); check(s.map === 'underpier', 'crawl under the pier', s);
  await run(() => T.useAt(-2.1, -9));
  s = await st(); check(s.found.includes('bottle_note'), 'message in a bottle', s.found);
  await run(() => T.door('town', 'underpier'));

  // ---- the bell tower
  await run(() => { Game.enterMap('church', 'front'); });
  await run(() => T.doorAt(6, 3.8));
  s = await st(); check(s.map === 'belltower', 'church -> bell tower (day 5)', s);
  await run(() => T.door('belltower', 'mid'));
  await run(() => T.door('belltower', 'loft'));
  s = await st(); check(s.map === 'belltower' && s.x > 35, 'up the tower to the bell', s);
  await run(() => T.useAt(41.3, 0.6));
  s = await st(); check(!!s.flags.bellRung, 'ring the bell', s.flags.bellRung);
  await run(() => T.door('belltower', 'midDown'));
  await run(() => T.door('belltower', 'bottomUp'));
  await run(() => T.door('church', 'tower'));
  s = await st(); check(s.map === 'church', 'all the way back down', s);

  // ---- Rosa's
  await run(() => { Game.enterMap('town', 'rosas'); });
  await run(() => T.doorAt(38, -33));
  s = await st(); check(s.map === 'rosas', 'Rosa\'s side door (day 5)', s);
  await run(() => T.door('town', 'rosas'));

  // ---- the attic
  await run(() => { Game.enterMap('house', 'front'); });
  await run(() => T.useAt(-1.2, -5));
  s = await st(); check(s.map === 'attic', 'pull the attic cord (day 5)', s);
  await run(() => T.useAt(-0.6, 2.6));
  s = await st(); check(s.found.includes('ruth_letter'), 'Ruth\'s letter in the hatbox', s.found);
  await run(() => T.door('house', 'attic'));
  s = await st(); check(s.map === 'house', 'back down to the hallway', s);

  // ---- the Miller and Kessler houses
  await run(() => { Game.enterMap('miller', 'front'); });
  await run(() => { T.log.length = 0; T.useAt(3.4, -6.8); });
  check(/quilt/.test(await logTail()), 'Mrs. Miller\'s quilt', await logTail());
  await run(() => { Game.st.inv.push('kessler_key'); Game.enterMap('kessler', 'front'); });
  await run(() => T.useAt(-4.6, -4.4));
  s = await st(); check(s.map === 'kessler' && s.x > 14, 'Kessler kitchen trapdoor -> cellar', s);
  await run(() => { World.player.x = 23.5; World.player.z = -0.8; T.doorAt(23.5, 0); });
  s = await st(); check(s.map === 'kessler' && s.x < 2, 'with the key, the cellar stairs go up to the kitchen', s);

  // ---- before day 3 the manhole is shut
  await run(() => { Game.st.day = 2; Game.enterMap('town', 'house'); });
  await run(() => T.useAt(1.5, 4));
  s = await st(); check(s.map === 'town', 'day 2: the manhole is shut', s);

  console.log(errs.join('\n') || 'no page errors');
  await b.close();
  process.exit(results.every(Boolean) && !errs.length ? 0 : 1);
})();
