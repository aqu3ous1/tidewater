// Walks routes with real key presses (no teleporting) and checks you arrive.
//   node tools/walk.js
const { chromium } = require('playwright');
const path = require('path');
const ROOT = 'file://' + path.resolve(__dirname, '../index.html');

const ROUTES = [
  { name: 'front door -> aquarium (day 1)', q: 'day=1&map=town&spawn=house&speed=2', pts: [[17, 21.5], [0, 21.5], [0, -58], [-8, -58], [-8, -69]], arrive: 'aquarium' },
  { name: 'aquarium -> home (day 8 night)', q: 'day=8&tod=night&map=town&spawn=aquarium&speed=2', pts: [[-8, -58], [0, -58], [0, 21.5], [17, 21.5], [17, 11]], arrive: 'house' },
  { name: 'front door -> pier end', q: 'day=2&map=town&spawn=house&speed=2', pts: [[17, 21.5], [0, 21.5], [0, -58], [46, -58], [46, -104]] },
  { name: 'front door -> far west, behind the church', q: 'day=2&map=town&spawn=house&speed=2', pts: [[17, 21.5], [0, 21.5], [0, -58], [-74, -58], [-74, -52]] },
  { name: 'underneath: arrival -> exit platform', q: 'day=8&map=underneath&spawn=arrive&speed=2', pts: [[0, 0.1], [-15, 0.1]] },
  { name: 'underneath: arrival -> design desk', q: 'day=8&map=underneath&spawn=arrive&speed=2', pts: [[0, -11.5], [-8, -11.5]] },
  { name: 'underneath: arrival -> floating house', q: 'day=8&map=underneath&spawn=arrive&speed=2', pts: [[0, -10.8], [5, -10.8], [5, -13.5], [10, -13.5]] },
  { name: 'underneath: arrival -> hub', q: 'day=8&map=underneath&spawn=arrive&speed=2', pts: [[0, -30]] },
];

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  let fails = 0;
  for (const r of ROUTES) {
    const p = await b.newPage({ viewport: { width: 640, height: 480 } });
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(ROOT + '?debug&' + r.q);
    await p.waitForTimeout(1500);
    await p.evaluate(() => { UI.clearAll(); Script.reset && Script.reset(); 0; });
    const held = new Set();
    const hold = async (keys) => {
      for (const k of held) if (!keys.includes(k)) { await p.keyboard.up(k); held.delete(k); }
      for (const k of keys) if (!held.has(k)) { await p.keyboard.down(k); held.add(k); }
    };
    let ok = true, where = '';
    for (const [tx, tz] of r.pts) {
      const t0 = Date.now();
      let last = null, stuck = 0;
      for (;;) {
        const s = await p.evaluate(() => ({ x: World.player.x, z: World.player.z, yaw: World.player.moveYaw != null ? World.player.moveYaw : World.cam.yaw, map: Game.st.map, busy: Script.busy || UI.busy }));
        where = s.map + ' @ ' + s.x.toFixed(1) + ',' + s.z.toFixed(1);
        if (s.busy) { await hold([]); await p.evaluate(() => { UI.clearAll(); 0; }); }
        if (r.arrive && s.map === r.arrive) break;
        const dx = tx - s.x, dz = tz - s.z, d = Math.hypot(dx, dz);
        if (d < 0.35) break;
        const ix = (dx * Math.cos(s.yaw) + dz * Math.sin(s.yaw)) / d, iy = -(dx * Math.sin(s.yaw) - dz * Math.cos(s.yaw)) / d;
        const keys = [];
        if (ix > 0.3) keys.push('ArrowRight'); if (ix < -0.3) keys.push('ArrowLeft');
        if (iy > 0.3) keys.push('ArrowDown'); if (iy < -0.3) keys.push('ArrowUp');
        await hold(keys);
        if (last && Math.hypot(s.x - last.x, s.z - last.z) < 0.01) stuck++; else stuck = 0;
        last = s;
        if (stuck > 25 || Date.now() - t0 > 30000) { ok = false; break; }
        await p.waitForTimeout(40);
      }
      if (!ok) break;
    }
    await hold([]);
    if (ok && r.arrive) { await p.waitForTimeout(1500); const m = await p.evaluate(() => Game.st.map); ok = m === r.arrive; where = m; }
    console.log((ok ? 'PASS ' : 'FAIL ') + r.name + (ok ? '' : '   stuck at ' + where) + (errs.length ? '   errors: ' + errs.join('; ') : ''));
    if (!ok) fails++;
    await p.close();
  }
  await b.close();
  process.exit(fails ? 1 : 0);
})();
