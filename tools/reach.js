// Walkability check. Every map, every day, morning and night: flood-fills
// the walkable area from each spawn point using the real colliders, the
// player's radius, bounds and walkable rects, plus any NPCs standing still.
// Reports doors and interactables that can't be reached on foot.
//   node tools/reach.js            all maps
//   node tools/reach.js town house  just these
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const only = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 640, height: 480 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html') + '?debug&day=1&map=town&spawn=house');
  await p.waitForTimeout(1500);
  const res = await p.evaluate((only) => {
    const out = [];
    const ids = only.length ? only : Object.keys(MAPS);
    // rooms the story keeps locked on purpose (map, x0, z0, x1, z1, locked while)
    const GATED = [
      ['aquarium', 27, -40, 36, -28, (st) => st.day < 6, "Walter's office: OWNER ONLY until day 6"],
      ['aquarium', 17, -40, 53, -28, (st) => !st.flags.hired, 'staff rooms: until you are hired on day 1'],
      ['school', 2, -12, 9, 0, (st) => st.day < 8, 'records room: locked until day 8'],
    ];
    const gated = (id, x, z, st) => GATED.find((g) => g[0] === id && x >= g[1] && x <= g[3] && z >= g[2] && z <= g[4] && g[5](st));
    for (const id of ids) {
      const problems = {}, expected = {};
      for (let day = 1; day <= 8; day++) for (const tod of ['morning', 'night']) {
        // flags the story has always set by this point (hired on day 1, the office opens on day 6)
        const st = Game.st; st.day = day; st.tod = tod; st.flags = day >= 2 ? { hired: true, officeOpen: day >= 6 } : {}; st.map = id;
        let m;
        try {
          const sp = Object.keys(MAPS[id].build ? (World.load(id, null, st), World.map.spawns) : {})[0];
          st.spawn = sp; World.load(id, sp, st); World.npcs.slice().forEach((n) => World.removeNpc(n.id)); Game.spawnNpcs(); m = World.map;
        } catch (e) { (problems['load error: ' + e.message] = problems['load error: ' + e.message] || []).push(day + tod[0]); continue; }
        const b = m.def.bounds, wk = m.def.walkable, R = 0.3, S = id === 'town' ? 0.5 : 0.25;
        const cols = m.colliders.filter((c) => !c.off);
        const npcs = World.npcs.filter((n) => n.solid && n.visible);
        const free = (x, z) => {
          if (b && (x < b[0] || x > b[2] || z < b[1] || z > b[3])) return false;
          if (wk && !World.walkOk(x, z)) return false;
          for (const c of cols) {
            if (c.r != null) { if (Math.hypot(x - c.cx, z - c.cz) < R + c.r) return false; }
            else if (x + R > c.x0 && x - R < c.x1 && z + R > c.z0 && z - R < c.z1) return false;
          }
          for (const n of npcs) if (Math.hypot(x - n.x, z - n.z) < R + n.r) return false;
          return true;
        };
        // grid covering everything on the map
        const xs = [], zs = [];
        const add = (x, z) => { xs.push(x); zs.push(z); };
        if (b) { add(b[0], b[1]); add(b[2], b[3]); }
        (wk || []).forEach((r) => { add(r[0], r[1]); add(r[2], r[3]); });
        Object.values(m.spawns).forEach((s) => add(s.x, s.z));
        m.doors.forEach((d) => add(d.x, d.z)); m.inters.forEach((it) => add(it.x, it.z));
        const X0 = Math.min(...xs) - 2, Z0 = Math.min(...zs) - 2, W = Math.ceil((Math.max(...xs) + 2 - X0) / S), H = Math.ceil((Math.max(...zs) + 2 - Z0) / S);
        const union = new Uint8Array(W * H);
        const flood = (sx, sz) => {
          const seen = new Uint8Array(W * H);
          let si = Math.round((sx - X0) / S), sj = Math.round((sz - Z0) / S);
          // nudge off a collider if the spawn sits right against one
          if (!free(X0 + si * S, Z0 + sj * S)) {
            let found = false;
            for (let rr = 1; rr < 6 && !found; rr++) for (let dj = -rr; dj <= rr && !found; dj++) for (let di = -rr; di <= rr && !found; di++) if (free(X0 + (si + di) * S, Z0 + (sj + dj) * S)) { si += di; sj += dj; found = true; }
            if (!found) return seen;
          }
          const q = [[si, sj]]; seen[sj * W + si] = 1;
          while (q.length) {
            const [i, j] = q.pop();
            for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const ni = i + di, nj = j + dj;
              if (ni < 0 || nj < 0 || ni >= W || nj >= H || seen[nj * W + ni]) continue;
              if (!free(X0 + ni * S, Z0 + nj * S)) { seen[nj * W + ni] = 2; continue; }
              seen[nj * W + ni] = 1; q.push([ni, nj]);
            }
          }
          return seen;
        };
        const near = (seen, x, z, r) => {
          for (let j = Math.floor((z - r - Z0) / S); j <= Math.ceil((z + r - Z0) / S); j++) for (let i = Math.floor((x - r - X0) / S); i <= Math.ceil((x + r - X0) / S); i++) {
            if (i < 0 || j < 0 || i >= W || j >= H || seen[j * W + i] !== 1) continue;
            if (Math.hypot(X0 + i * S - x, Z0 + j * S - z) < r) return true;
          }
          return false;
        };
        const doorR = (d) => Math.max(0.9, d.w / 2 + 0.3) + 0.6;
        const activeDoors = m.doors.filter((d) => !d.cond || d.cond(st));
        for (const [sn, s] of Object.entries(m.spawns)) {
          const seen = flood(s.x, s.z);
          for (let k = 0; k < seen.length; k++) if (seen[k] === 1) union[k] = 1;
          // every spawn must be able to walk to at least one way out
          if (activeDoors.length && !activeDoors.some((d) => near(seen, d.x, d.z, doorR(d)))) (problems['spawn ' + sn + ' is boxed in (no door reachable)'] = problems['spawn ' + sn + ' is boxed in (no door reachable)'] || []).push(day + tod[0]);
        }
        for (const d of activeDoors) if (!near(union, d.x, d.z, doorR(d))) { const k = 'door ' + (d.to || d.tex || '?') + ' @' + d.x.toFixed(1) + ',' + d.z.toFixed(1); (problems[k] = problems[k] || []).push(day + tod[0]); }
        for (const it of m.inters) {
          if (it.cond && !it.cond(st)) continue;
          if (!near(union, it.x, it.z, it.r + 0.6)) {
            const g = gated(id, it.x, it.z, st);
            if (g) { expected[g[6]] = true; continue; }
            const txt = it.label || it.id || it.item || (it.use && it.use.toString().replace(/\s+/g, ' ').slice(0, 60)) || '';
            const k = 'inter @' + it.x.toFixed(1) + ',' + it.z.toFixed(1) + ' ' + String(txt).slice(0, 50);
            (problems[k] = problems[k] || []).push(day + tod[0]);
          }
        }
      }
      const keys = Object.keys(problems);
      out.push(id + ': ' + (keys.length ? keys.length + ' problem(s)' : 'OK') + (Object.keys(expected).length ? '  (locked on purpose: ' + Object.keys(expected).join('; ') + ')' : ''));
      for (const k of keys) out.push('   ' + k + '   [' + problems[k].join(' ') + ']');
    }
    return out;
  }, only);
  console.log(res.join('\n'));
  console.log(errs.join('\n') || 'no page errors');
  await b.close();
  process.exit(res.some((l) => l.startsWith('   ')) ? 1 : 0);
})();
