// Plays the day-1 aquarium tour with real key presses: walk in, talk to
// Walter, follow him to every stop, accept the job. Fails if the player is
// ever stuck unable to move while the game waits for them.
//   node tools/follow.js
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 640, height: 480 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html') + '?debug&day=1&tod=afternoon&map=town&spawn=aquarium');
  await p.waitForTimeout(1500);
  await p.evaluate(() => { UI.clearAll(); Game.st.obj = { id: 'visitaq', text: 'VISIT THE BELLWOOD AQUARIUM.' }; Game.st.flags.milkInFridge = true; Game.st.flags.trashOut = true; Game.st.flags.walterIntro = true; 0; });
  const held = new Set();
  const hold = async (keys) => {
    for (const k of held) if (!keys.includes(k)) { await p.keyboard.up(k); held.delete(k); }
    for (const k of keys) if (!held.has(k)) { await p.keyboard.down(k); held.add(k); }
  };
  const state = () => p.evaluate(() => {
    const w = World.npc('walter');
    return { x: World.player.x, z: World.player.z, yaw: World.player.moveYaw != null ? World.player.moveYaw : World.cam.yaw, map: Game.st.map, ui: UI.busy, busy: Script.busy, free: Script.playerFree, obj: Game.st.obj && Game.st.obj.id, hired: !!Game.st.flags.hired, w: w ? [w.x, w.z, w.path.length] : null };
  });
  const steer = async (s, tx, tz, stopAt) => {
    const dx = tx - s.x, dz = tz - s.z, d = Math.hypot(dx, dz);
    if (d < stopAt) { await hold([]); return true; }
    const ix = (dx * Math.cos(s.yaw) + dz * Math.sin(s.yaw)) / d, iy = -(dx * Math.sin(s.yaw) - dz * Math.cos(s.yaw)) / d;
    const keys = [];
    if (ix > 0.3) keys.push('ArrowRight'); if (ix < -0.3) keys.push('ArrowLeft');
    if (iy > 0.3) keys.push('ArrowDown'); if (iy < -0.3) keys.push('ArrowUp');
    await hold(keys); return false;
  };
  // BFS over the collision grid, so we walk around walls like a player would
  await p.evaluate(() => {
    window.__path = (fx, fz, tx, tz) => {
      const S = 0.5, R = 0.3, key = (i, j) => i + ',' + j;
      const si = Math.round(fx / S), sj = Math.round(fz / S), ti = Math.round(tx / S), tj = Math.round(tz / S);
      const prev = new Map([[key(si, sj), null]]), q = [[si, sj]];
      let best = [si, sj], bd = 1e9;
      for (let h = 0; h < q.length && h < 40000; h++) {
        const [i, j] = q[h];
        const d = Math.hypot(i - ti, j - tj); if (d < bd) { bd = d; best = [i, j]; }
        if (d < 1) break;
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          const ni = i + di, nj = j + dj, k = key(ni, nj);
          if (prev.has(k) || World.blocked(ni * S, nj * S, R) || (World.map.def.walkable && !World.walkOk(ni * S, nj * S))) continue;
          if (di && dj && (World.blocked((i + di) * S, j * S, R) || World.blocked(i * S, (j + dj) * S, R))) continue;
          prev.set(k, [i, j]); q.push([ni, nj]);
        }
      }
      const out = []; let c = best;
      while (c) { out.unshift([c[0] * S, c[1] * S]); c = prev.get(key(c[0], c[1])); }
      return out.slice(1);
    };
  });
  let route = [], routeFor = null;
  const goTo = async (s, tx, tz, stopAt) => {
    if (Math.hypot(tx - s.x, tz - s.z) < stopAt) { await hold([]); route = []; return true; }
    if (!routeFor || Math.hypot(routeFor[0] - tx, routeFor[1] - tz) > 1 || !route.length) { route = await p.evaluate(([a, b, c, d]) => window.__path(a, b, c, d), [s.x, s.z, tx, tz]); routeFor = [tx, tz]; }
    while (route.length > 1 && Math.hypot(route[0][0] - s.x, route[0][1] - s.z) < 0.4) route.shift();
    const [wx, wz] = route.length ? route[0] : [tx, tz];
    await steer(s, wx, wz, 0.05); return false;
  };
  const t0 = Date.now();
  let phase = 'enter', lockedFar = 0, maxLocked = 0, followMoves = 0, last = null, result = 'timeout';
  while (Date.now() - t0 < 240000) {
    const s = await state();
    if (s.ui) { await hold([]); await p.keyboard.press('z'); await p.waitForTimeout(90); continue; }
    if (phase === 'enter') {
      if (s.map === 'aquarium') { phase = 'talk'; continue; }
      await goTo(s, -8, -69, 0.2);
    } else if (phase === 'talk') {
      if (s.obj === 'follow') { phase = 'follow'; continue; }
      if (s.w && await goTo(s, s.w[0], s.w[1] + 1.1, 0.5)) { await p.evaluate(() => { World.player.face = Math.PI * 0; 0; }); await p.keyboard.press('z'); await p.waitForTimeout(300); }
    } else if (phase === 'follow') {
      if (s.hired) { result = 'hired'; break; }
      if (s.w) {
        const d = Math.hypot(s.w[0] - s.x, s.w[1] - s.z);
        // stuck: the script is waiting on us, we're far away, and we can't move
        if (last && s.busy && !s.free && d > 4.2 && Math.hypot(s.x - last.x, s.z - last.z) < 0.001) { lockedFar++; maxLocked = Math.max(maxLocked, lockedFar); } else lockedFar = 0;
        if (lockedFar > 40) { result = 'STUCK: script waiting for player, controls locked'; break; }
        if (s.free && last && Math.hypot(s.x - last.x, s.z - last.z) > 0.01) followMoves++;
        await goTo(s, s.w[0], s.w[1] + 1.4, 1.6);
      }
    }
    last = s;
    await p.waitForTimeout(50);
  }
  await hold([]);
  const end = await state();
  const ok = result === 'hired' && end.obj === 'home1' && followMoves > 20;
  console.log((ok ? 'PASS' : 'FAIL') + ' day 1 tour by keyboard: ' + result + ', objective now ' + end.obj + ', moved on our own ' + followMoves + ' times while following, ' + ((Date.now() - t0) / 1000).toFixed(0) + 's');
  console.log(errs.join('\n') || 'no page errors');
  await b.close();
  process.exit(ok ? 0 : 1);
})();
