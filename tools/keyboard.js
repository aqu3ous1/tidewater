// Real keyboard input test (no harness). NODE_PATH=$(npm root -g) node tools/keyboard.js outdir
const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2] || '.';
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 800, height: 600 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '..', 'index.html'));
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await p.reload();
  const shot = async (n) => { await p.screenshot({ path: path.join(out, 'kb_' + n + '.png') }); };
  const press = async (k, n) => { for (let i = 0; i < (n || 1); i++) { await p.keyboard.down(k); await p.waitForTimeout(70); await p.keyboard.up(k); await p.waitForTimeout(90); } };
  const hold = async (k, ms) => { await p.keyboard.down(k); await p.waitForTimeout(ms); await p.keyboard.up(k); };
  const state = () => p.evaluate(() => ({ mode: Game.mode, map: Game.st && Game.st.map, x: World.player.x.toFixed(1), z: World.player.z.toFixed(1), obj: Game.st && Game.st.obj && Game.st.obj.text, modal: UI.top && UI.top.type, menu: Menus.open }));
  await p.waitForTimeout(1500);
  await press('z'); await p.waitForTimeout(800);       // skip boot
  await shot('01_press');
  await press('Enter'); await p.waitForTimeout(500);   // PRESS START
  await shot('02_menu');
  await press('z'); await p.waitForTimeout(400);       // NEW GAME
  await p.keyboard.type('mara'); await p.waitForTimeout(200);
  await shot('03_name');
  await press('Enter'); await p.waitForTimeout(4500);  // start
  await shot('04_card');
  console.log(await state());
  // advance intro dialogue
  for (let i = 0; i < 40; i++) { const s = await state(); if (!s.modal && s.obj) break; await press('z'); await p.waitForTimeout(250); }
  await shot('05_after_intro');
  console.log(await state());
  // walk to the front door (north)
  await hold('ArrowUp', 3000); await p.waitForTimeout(1500);
  console.log(await state());
  await shot('06_door');
  for (let i = 0; i < 10; i++) { const s = await state(); if (!s.modal) break; await press('z'); await p.waitForTimeout(200); }
  await press('Tab'); await p.waitForTimeout(400); await shot('07_items');
  await press('ArrowRight'); await p.waitForTimeout(200); await shot('08_collection');
  await press('ArrowRight'); await p.waitForTimeout(200); await shot('09_goals');
  await press('ArrowRight'); await p.waitForTimeout(200); await shot('10_map');
  await press('x'); await p.waitForTimeout(300);
  await press('Escape'); await p.waitForTimeout(300); await shot('11_pause');
  await press('Escape'); await p.waitForTimeout(300);
  // walk to a box and unpack it with Z
  await hold('ArrowLeft', 900); await hold('ArrowUp', 250); await press('z'); await p.waitForTimeout(500);
  await shot('12_box');
  console.log(await state());
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await b.close();
})();
