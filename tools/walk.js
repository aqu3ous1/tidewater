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
  { name: 'aquarium lobby -> stairs up', q: 'day=2&flags=hired&map=aquarium&spawn=front&speed=2', pts: [[-2, 10.5], [-8.8, 10.5], [-8.8, 6.4], [-11, 6.4]], arrive: 'aq2' },
  { name: 'upper floor: stairs -> dome ladder', q: 'day=5&flags=hired&map=aq2&spawn=stairs&speed=2', pts: [[-23, -6], [35, -6], [35, 3.2]] },
  { name: 'upper floor: kelp tunnel -> balcony -> jellies', q: 'day=2&flags=hired&map=aq2&spawn=stairs&speed=2', pts: [[-23, -6], [-8, -6], [-8, 0], [-2, 0], [-8, 0], [-8, -6], [10, -6], [10, -2], [10, -6], [14, -6], [14, -14]] },
  { name: 'B1: stairs -> freight elevator', q: 'day=5&flags=hired&map=aqb1&spawn=stairs&speed=2', pts: [[0, -5], [0, -48]] },
  { name: 'B1: old exhibits -> chalk passage -> boiler', q: 'day=5&flags=hired&map=aqb1&spawn=stairs&speed=2', pts: [[0, -5], [0, -34], [-18, -34], [-18, -22], [-9, -22], [0, -22]] },
  { name: 'B2: elevator -> life support, planning', q: 'day=6&flags=hired&map=aqb2&spawn=elevator&speed=2', pts: [[0, -6], [17, -10], [24, -10], [17, -10], [-11, -6], [-11, -2], [-13, -2], [-13, 3]] },
  { name: 'storm drain: manhole -> Kessler hole', q: 'day=5&map=drain&spawn=manhole&speed=2', pts: [[0, 0], [-43, 0], [-43, -17]] },
  { name: 'storm drain: manhole -> living room -> outfall', q: 'day=5&map=drain&spawn=manhole&speed=2', pts: [[0, -1], [0, -20], [-19, -20], [-19, -17], [-25, -17], [-19, -17], [-19, -20], [0, -20], [0, -43], [33, -43], [33, -67]] },
  { name: 'Mrs. Miller: living room -> kitchen -> sewing room', q: 'day=2&map=miller&spawn=front&speed=2', pts: [[-4.8, 3.6], [-5, 1], [-5, -6], [-3, -8.5], [-5, -5], [-5, 3.6], [2.6, 3.6], [1.8, 1.5], [1.8, -6], [2.5, -9.5]] },
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
