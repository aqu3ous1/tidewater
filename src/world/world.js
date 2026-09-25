'use strict';
// ---------------------------------------------------------------------------
// World — the live location: player, NPCs, camera, collisions, triggers,
// entities, and drawing it all.
// ---------------------------------------------------------------------------

const MAPS = {}; // id -> definition { name, build(M, st), env(st), music(st), amb(st), cam }

const World = (() => {
  const P_RADIUS = 0.3;
  const player = { x: 0, z: 0, face: Math.PI, moving: false, anim: 0, stepT: 0, set: 'player', hidden: false, speedMul: 1, run: false, frozen: false, lastMove: [0, 0], moveYaw: 0 };
  let map = null;
  let npcs = [];
  const cam = { pos: [0, 5, 10], look: [0, 0, 0], cfg: null, zone: null, yaw: 0, fov: 60, shake: 0 };
  let time = 0;
  let doorCooldown = 0;
  let lockedMsgCooldown = 0;
  let target = null; // current interactable
  const firedTriggers = new Set();

  // ------------------------------------------------------------ loading
  function load(id, spawnName, st) {
    const def = MAPS[id];
    if (!def) throw new Error('No map ' + id);
    if (map && map.mesh) R.destroyMesh(map.mesh);
    if (map && map.entMeshes) map.entMeshes.forEach((m) => R.destroyMesh(m));
    const M = new MapBuilder(id);
    const env = Object.assign({ fog: '#9ab8d0', fogNear: 25, fogFar: 70, sky: null, ambient: [1, 1, 1], clear: null }, def.env ? def.env(st) : {});
    M.ambient = env.ambient;
    M.st = st;
    if (env.sub) M.sub = env.sub;
    def.build(M, st);
    const mesh = M.bake(env);
    map = {
      id, def, env, mesh, colliders: M.colliders, inters: M.inters, doors: M.doors, spawns: M.spawns, cams: M.cams, triggers: M.triggers,
      statics: M.statics, ents: M.ents, surfaces: M.surfaces, defaultCam: def.cam ? (typeof def.cam === 'function' ? def.cam(st) : def.cam) : { mode: 'follow', yaw: 0, pitch: 28, dist: 8.5, fov: 55, lookY: 0.8 },
      entMeshes: [],
    };
    // entity meshes
    for (const e of map.ents) {
      if (e.build) { const eb = new MapBuilder(id + '_e'); eb.ambient = env.ambient; e.build(eb); e.mesh = eb.bake(env); map.entMeshes.push(e.mesh); }
      if (e.init) e.init(e);
    }
    firedTriggers.clear();
    npcs = [];
    const sp = map.spawns[spawnName] || map.spawns.default || Object.values(map.spawns)[0] || { x: 0, z: 0, face: 0 };
    player.x = sp.x; player.z = sp.z; player.face = sp.face; player.moving = false;
    player.moveYaw = null;
    doorCooldown = 0.6;
    // environment to renderer
    applyEnv();
    cam.zone = null; cam.cfg = null;
    updateCamera(0, true);
    return map;
  }

  function applyEnv() {
    const env = map.env;
    R.settings.fog = hexf(env.fog);
    R.settings.fogNear = env.fogNear; R.settings.fogFar = env.fogFar;
    R.settings.sky = env.sky ? [hexf(env.sky[0]), hexf(env.sky[1]), env.sky[2]] : null;
    R.settings.clear = env.clear ? hexf(env.clear) : null;
    R.settings.sat = env.sat == null ? 1 : env.sat;
    R.settings.grade = env.grade || [1, 1, 1];
    R.settings.snap = env.snap || 1;
    R.settings.affine = env.affine == null ? 0.85 : env.affine;
    R.settings.wobble = env.wobble || 0;
  }

  // ------------------------------------------------------------ NPCs
  function addNpc(o) {
    const n = Object.assign({ x: 0, z: 0, face: Math.PI, set: o.id, speed: 2.2, anim: 0, moving: false, visible: true, alpha: 1, r: 0.35, solid: true, path: [], waitT: 0 }, o);
    n.home = { x: n.x, z: n.z };
    npcs.push(n);
    return n;
  }
  function removeNpc(id) { npcs = npcs.filter((n) => n.id !== id); }
  function npc(id) { return npcs.find((n) => n.id === id); }

  function updateNpc(n, dt) {
    if (n.update) n.update(n, dt);
    if (n.path.length) {
      const [tx, tz] = n.path[0];
      const dx = tx - n.x, dz = tz - n.z, d = Math.hypot(dx, dz);
      if (d < 0.08) { n.path.shift(); if (!n.path.length) { n.moving = false; if (n.onArrive) { const f = n.onArrive; n.onArrive = null; f(); } } }
      else {
        const sp = Math.min(d, n.speed * dt);
        n.x += dx / d * sp; n.z += dz / d * sp;
        n.face = Math.atan2(dx, -dz);
        n.moving = true;
      }
    } else if (n.wander && !Script.busy) {
      n.waitT -= dt;
      if (n.waitT <= 0) {
        n.waitT = 2 + Math.random() * 5;
        const a = Math.random() * TAU, r = Math.random() * n.wander;
        const tx = n.home.x + Math.cos(a) * r, tz = n.home.z + Math.sin(a) * r;
        if (!blocked(tx, tz, 0.35)) n.path = [[tx, tz]];
      }
      n.moving = false;
    } else n.moving = false;
    if (n.moving) n.anim += dt * (n.speed > 3 ? 8 : 5.5);
    if (n.faceTarget) { const t = n.faceTarget === 'player' ? player : n.faceTarget; n.face = Math.atan2(t.x - n.x, -(t.z - n.z)); }
  }

  // ------------------------------------------------------------ collision
  // maps made of walkable rects (the Underneath): every corner of the player's
  // footprint must be on some rect, so overlapping rects join up seamlessly
  function walkOk(x, z) {
    const wk = map.def.walkable; if (!wk) return true;
    const on = (px, pz) => wk.some((r) => px >= r[0] && px <= r[2] && pz >= r[1] && pz <= r[3]);
    return on(x - P_RADIUS, z - P_RADIUS) && on(x + P_RADIUS, z - P_RADIUS) && on(x - P_RADIUS, z + P_RADIUS) && on(x + P_RADIUS, z + P_RADIUS);
  }
  function blocked(x, z, r) {
    for (const c of map.colliders) {
      if (c.r != null) { if (Math.hypot(x - c.cx, z - c.cz) < r + c.r) return true; }
      else if (x + r > c.x0 && x - r < c.x1 && z + r > c.z0 && z - r < c.z1) return true;
    }
    return false;
  }
  function collide(x, z, r, self) {
    for (let iter = 0; iter < 3; iter++) {
      for (const c of map.colliders) {
        if (c.off) continue;
        if (c.r != null) {
          const dx = x - c.cx, dz = z - c.cz, d = Math.hypot(dx, dz), m = r + c.r;
          if (d < m && d > 0.0001) { x = c.cx + dx / d * m; z = c.cz + dz / d * m; }
        } else if (x + r > c.x0 && x - r < c.x1 && z + r > c.z0 && z - r < c.z1) {
          const pl = x + r - c.x0, pr = c.x1 - (x - r), pt = z + r - c.z0, pb = c.z1 - (z - r);
          const m = Math.min(pl, pr, pt, pb);
          if (m === pl) x = c.x0 - r; else if (m === pr) x = c.x1 + r; else if (m === pt) z = c.z0 - r; else z = c.z1 + r;
        }
      }
      for (const n of npcs) {
        if (n === self || !n.solid || !n.visible) continue;
        const dx = x - n.x, dz = z - n.z, d = Math.hypot(dx, dz), m = r + n.r;
        if (d < m && d > 0.0001) { x = n.x + dx / d * m; z = n.z + dz / d * m; }
      }
    }
    return [x, z];
  }

  function surfaceAt(x, z) {
    let s = 'hard';
    for (const f of map.surfaces) if (x >= f.x0 && x <= f.x1 && z >= f.z0 && z <= f.z1) s = f.surf;
    return s;
  }

  // ------------------------------------------------------------ camera
  function camZone() {
    for (const c of map.cams) if (player.x >= c.x0 && player.x <= c.x1 && player.z >= c.z0 && player.z <= c.z1) return c;
    return null;
  }
  function updateCamera(dt, snap) {
    const z = Script.camOverride || camZone();
    const cfg = z || map.defaultCam;
    const changed = cfg !== cam.cfg;
    const cut = changed && (snap || (cfg.mode !== 'follow') || (cam.cfg && cam.cfg.mode !== 'follow') || cfg.cut);
    cam.cfg = cfg;
    let pos, look;
    if (cfg.mode === 'fixed') { pos = cfg.pos; look = cfg.look; }
    else if (cfg.mode === 'track') {
      pos = cfg.pos;
      const ly = cfg.lookY == null ? 0.8 : cfg.lookY;
      look = [lerp(cfg.pos[0], player.x, cfg.follow == null ? 1 : cfg.follow), ly, lerp(cfg.pos[2], player.z, cfg.follow == null ? 1 : cfg.follow)];
      if (cfg.look) look = [lerp(cfg.look[0], player.x, cfg.follow || 0.5), cfg.look[1], lerp(cfg.look[2], player.z, cfg.follow || 0.5)];
    } else {
      const yaw = (cfg.yaw || 0) * (Math.abs(cfg.yaw || 0) > TAU ? Math.PI / 180 : 1);
      const pitch = (cfg.pitch == null ? 28 : cfg.pitch) * Math.PI / 180;
      const dist = cfg.dist || 8.5;
      const fx = Math.sin(yaw), fz = -Math.cos(yaw);
      let tx = player.x + fx * (cfg.ahead || 1.2), tz = player.z + fz * (cfg.ahead || 1.2);
      if (cfg.clampX) tx = clamp(tx, cfg.clampX[0], cfg.clampX[1]);
      if (cfg.clampZ) tz = clamp(tz, cfg.clampZ[0], cfg.clampZ[1]);
      const ty = cfg.lookY == null ? 0.8 : cfg.lookY;
      look = [tx, ty, tz];
      pos = [tx - fx * dist * Math.cos(pitch), ty + dist * Math.sin(pitch), tz - fz * dist * Math.cos(pitch)];
      if (cfg.clamp) { pos[0] = clamp(pos[0], cfg.clamp[0], cfg.clamp[2]); pos[2] = clamp(pos[2], cfg.clamp[1], cfg.clamp[3]); }
    }
    if (cut || !dt) { cam.pos = pos.slice(); cam.look = look.slice(); }
    else {
      const k = 1 - Math.exp(-dt * (cfg.lag || 5));
      for (let i = 0; i < 3; i++) { cam.pos[i] = lerp(cam.pos[i], pos[i], k); cam.look[i] = lerp(cam.look[i], look[i], Math.min(1, k * 1.4)); }
    }
    cam.fov = cfg.fov || 55;
    cam.yaw = Math.atan2(cam.look[0] - cam.pos[0], -(cam.look[2] - cam.pos[2]));
  }

  // ------------------------------------------------------------ player
  function updatePlayer(dt, controllable) {
    const [ix, iy] = controllable ? Input.axis() : [0, 0];
    const mag = Math.hypot(ix, iy);
    player.moving = false;
    if (mag > 0.1 && !player.frozen) {
      // keep movement mapping stable through camera cuts until input changes
      if (player.moveYaw == null || (Math.sign(ix) !== Math.sign(player.lastMove[0]) || Math.sign(iy) !== Math.sign(player.lastMove[1]))) player.moveYaw = cam.yaw;
      player.lastMove = [ix, iy];
      const yaw = player.moveYaw;
      const fx = Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = Math.sin(yaw);
      const mx = rx * ix + fx * -iy, mz = rz * ix + fz * -iy;
      player.run = Input.held('b');
      const sp = (player.run ? 5.6 : 3.3) * player.speedMul * (Game.debugSpeed || 1);
      const nx = player.x + mx * sp * dt, nz = player.z + mz * sp * dt;
      let [cx, cz] = collide(nx, nz, P_RADIUS, null);
      if (map.def.walkable) {
        const ok = walkOk;
        if (!ok(cx, cz)) { if (ok(cx, player.z)) cz = player.z; else if (ok(player.x, cz)) cx = player.x; else { cx = player.x; cz = player.z; } }
      }
      const moved = Math.hypot(cx - player.x, cz - player.z);
      player.x = cx; player.z = cz;
      player.face = Math.atan2(mx, -mz);
      player.moving = moved > 0.001;
      if (player.moving) {
        player.anim += dt * (player.run ? 9 : 6);
        player.stepT -= dt;
        if (player.stepT <= 0) {
          player.stepT = player.run ? 0.24 : 0.34;
          Sound.sfx('step', { surf: surfaceAt(player.x, player.z), vol: 0.8 });
          if (Game.onStep) Game.onStep();
        }
      }
      checkDoors(mx, mz);
    } else { player.lastMove = [0, 0]; player.moveYaw = null; }
    if (bounds()) {
      const b = bounds();
      if (player.x < b[0] || player.x > b[2] || player.z < b[1] || player.z > b[3]) {
        player.x = clamp(player.x, b[0], b[2]); player.z = clamp(player.z, b[1], b[3]);
        if (map.def.onEdge && lockedMsgCooldown <= 0) { lockedMsgCooldown = 3; map.def.onEdge(Game.st); }
      }
    }
  }
  function bounds() { return map.def.bounds || null; }

  function checkDoors(mx, mz) {
    if (doorCooldown > 0 || Script.busy) return;
    for (const d of map.doors) {
      if (d.cond && !d.cond(Game.st)) continue;
      const along = d.fx !== 0 ? Math.abs(player.z - d.z) : Math.abs(player.x - d.x);
      const depth = d.fx !== 0 ? (player.x - d.x) * d.fx : (player.z - d.z) * d.fz;
      if (along < d.w / 2 + 0.05 && depth > -0.6 && depth < 0.35) {
        const toward = -(mx * d.fx + mz * d.fz);
        if (toward > 0.5) { useDoor(d); return; }
      }
    }
  }
  function useDoor(d) {
    doorCooldown = 0.8;
    const st = Game.st;
    const locked = typeof d.locked === 'function' ? d.locked(st) : d.locked;
    if (locked) {
      if (lockedMsgCooldown > 0) return;
      lockedMsgCooldown = 1.2;
      Sound.sfx('locked');
      const msg = typeof d.lockedMsg === 'function' ? d.lockedMsg(st) : (d.lockedMsg || 'It\'s locked.');
      Script.run(async (S) => { if (d.onLocked) await d.onLocked(S); else await S.say(null, msg); });
      return;
    }
    if (d.use) { Script.run(d.use); return; }
    if (d.to) Script.run(async (S) => { await S.go(d.to, d.spawn, { sfx: d.sfx === undefined ? 'door' : d.sfx }); });
  }

  function findTarget() {
    const fx = Math.sin(player.face), fz = -Math.cos(player.face);
    const px = player.x + fx * 0.6, pz = player.z + fz * 0.6;
    let best = null, bd = 1e9;
    const consider = (o, x, z, r) => {
      const d = Math.hypot(px - x, pz - z);
      const d2 = Math.hypot(player.x - x, player.z - z);
      if (Math.min(d, d2 + 0.25) < r && d < bd) { best = o; bd = d; }
    };
    for (const it of map.inters) { if (it.cond && !it.cond(Game.st)) continue; consider({ kind: 'inter', o: it }, it.x, it.z, it.r); }
    for (const n of npcs) { if (!n.visible || !n.talk || n.noTalk) continue; consider({ kind: 'npc', o: n }, n.x, n.z, 1.3); }
    for (const d of map.doors) { if (d.cond && !d.cond(Game.st)) continue; consider({ kind: 'door', o: d }, d.x, d.z, Math.max(0.9, d.w / 2 + 0.3)); }
    return best;
  }
  function interact() {
    if (!target) return false;
    if (target.kind === 'inter') { const it = target.o; Script.run(async (S) => { await it.use(S, it); }); return true; }
    if (target.kind === 'npc') {
      const n = target.o;
      const prevFace = n.face;
      Script.run(async (S) => {
        if (!n.fixedFace) n.face = Math.atan2(player.x - n.x, -(player.z - n.z));
        player.face = Math.atan2(n.x - player.x, -(n.z - player.z));
        const hold = n.path.slice(); n.path = []; n.talking = true;
        await n.talk(S, n);
        n.talking = false;
        if (Story.afterTalk) await Story.afterTalk(S, n);
        if (n.returnFace !== false && !n.path.length) n.face = n.keepFace ? n.face : prevFace;
        if (hold.length && !n.path.length) n.path = hold;
      });
      return true;
    }
    if (target.kind === 'door') { useDoor(target.o); return true; }
    return false;
  }

  function checkTriggers() {
    for (const t of map.triggers) {
      const key = t.id || t;
      const inside = player.x >= t.x0 && player.x <= t.x1 && player.z >= t.z0 && player.z <= t.z1;
      if (!inside) { if (!t.once) firedTriggers.delete(key); continue; }
      if (firedTriggers.has(key)) continue;
      if (t.cond && !t.cond(Game.st)) continue;
      firedTriggers.add(key);
      if (t.bg) Script.bg(t.fn); else Script.run(t.fn);
    }
  }

  // ------------------------------------------------------------ update
  function update(dt, controllable) {
    time += dt;
    doorCooldown -= dt; lockedMsgCooldown -= dt;
    updatePlayer(dt, controllable && (!Script.busy || Script.playerFree));
    for (const n of npcs) updateNpc(n, dt);
    for (const e of map.ents) updateEnt(e, dt);
    if (!Script.busy) checkTriggers();
    target = (!Script.busy && controllable) ? findTarget() : null;
    updateCamera(dt);
    if (map.def.update) map.def.update(dt, Game.st);
  }

  function updateEnt(e, dt) {
    if (e.update) e.update(e, dt);
    switch (e.type) {
      case 'fish': {
        e.t += dt;
        e.pos += e.dir * e.speed * dt;
        if (e.pos > 1) { e.pos = 1; e.dir = -1; } if (e.pos < 0) { e.pos = 0; e.dir = 1; }
        if (Math.random() < dt * 0.15) e.dir *= -1;
        break;
      }
      case 'swing': e.t += dt; break;
      case 'penguin': {
        e.t += dt; e.wait -= dt;
        if (e.target) {
          const dx = e.target[0] - e.x, dz = e.target[1] - e.z, d = Math.hypot(dx, dz);
          if (d < 0.1) e.target = null; else { e.x += dx / d * dt * 1.1; e.z += dz / d * dt * 1.1; e.face = Math.atan2(dx, -dz); }
        } else if (e.wait <= 0) { e.wait = 2 + Math.random() * 5; e.target = [lerp(e.area[0], e.area[2], Math.random()), lerp(e.area[1], e.area[3], Math.random())]; }
        break;
      }
      default: break;
    }
  }

  // ------------------------------------------------------------ draw
  const COL = [0.5, 0.5, 0.5, 1];
  function spriteFrame(set, face, moving, anim, opts) {
    const s = Sprites.sets[set] || Sprites.sets.player;
    let rel = angDiff(cam.yaw, face);
    if (opts && opts.wrong) rel = 0; // always facing away
    let dir, flip = false;
    if (Math.abs(rel) < Math.PI / 4) dir = 'n';
    else if (Math.abs(rel) > Math.PI * 3 / 4) dir = 's';
    else { dir = 'e'; flip = rel < 0; }
    const f = moving ? (Math.floor(anim) % 2 ? 1 : 2) : 0;
    return { reg: s[dir][f], flip };
  }
  function drawChar(set, x, z, face, moving, anim, opts) {
    opts = opts || {};
    const { reg, flip } = spriteFrame(set, face, moving, anim, opts);
    const k = opts.scale || 1;
    const w = 32 / 28 * k, h = 50 / 28 * k;
    const c = opts.col || COL;
    R.sprite(x, (opts.y || 0), z, w, h, reg, flip, c, { lean: 0.08 });
    if (!opts.noShadow) R.spriteFlat(x, (opts.y || 0) + 0.02, z, 0.7 * k, 0.35 * k, Atlas.get('shadow'), [0.5, 0.5, 0.5, c[3]]);
  }

  function draw() {
    R.setCamera(cam.pos, cam.look, cam.fov, 0.15, map.env.far || 140);
    R.beginFrame(R.settings.clear || R.settings.fog);
    R.drawMesh(map.mesh, { pass: 'opaque' });
    for (const e of map.ents) drawEntMesh(e);
    // sprites
    for (const s of map.statics) {
      if (s.cond && !s.cond(Game.st)) continue;
      R.sprite(s.x, s.y, s.z, s.w, s.h, Atlas.get(s.region), s.flip, s.col || COL, s.lean ? { lean: s.lean } : null);
    }
    for (const e of map.ents) drawEntSprite(e);
    for (const n of npcs) {
      if (!n.visible) continue;
      if (n.flicker && Math.random() < n.flicker) continue;
      const col = n.alpha < 1 ? [0.5, 0.5, 0.5, n.alpha] : (n.col || COL);
      drawChar(n.set, n.x, n.z, n.face, n.moving && !n.slide, n.anim, { col, wrong: n.wrongFace, scale: n.scale, y: n.y, noShadow: n.noShadow });
    }
    if (!player.hidden) drawChar(player.set, player.x, player.z, player.face, player.moving, player.anim, { col: player.col, y: player.y });
    if (target && !Script.busy && Game.showIndicator) {
      const o = target.o;
      const bob = Math.sin(time * 6) * 0.06;
      const y = target.kind === 'npc' ? 2.1 : (o.y || 1.2);
      R.sprite(target.kind === 'npc' ? o.x : o.x, y + bob, target.kind === 'npc' ? o.z : o.z, 0.25, 0.22, Atlas.get('indicator'), false, COL);
    }
    if (map.def.drawSprites) map.def.drawSprites(Game.st);
    R.flushSprites('atlas');
    // transparent (sorted back to front)
    drawBlend(map.mesh);
    for (const e of map.ents) if (e.mesh && !e.hidden) R.drawMesh(e.mesh, { pass: 'blend', model: e.model });
  }
  function drawBlend(mesh) {
    const parts = mesh.parts.filter((p) => p.blend);
    parts.sort((a, b) => Math.hypot(b.cx - cam.pos[0], b.cz - cam.pos[2]) - Math.hypot(a.cx - cam.pos[0], a.cz - cam.pos[2]));
    for (const p of parts) R.drawMesh({ parts: [p] }, { pass: 'blend' });
  }
  function drawEntMesh(e) {
    if (e.hidden) return;
    if (e.type === 'swing' && !e.mesh) {
      // built lazily
      const b = new MapBuilder('swing');
      b.ambient = map.env.ambient;
      b.box(0, -1.95, 0, 0.7, 0.08, 0.35, 'rubber', { solid: false });
      b.box(-0.33, -1.95, 0, 0.03, 1.95, 0.03, 'metal', { solid: false, top: false });
      b.box(0.33, -1.95, 0, 0.03, 1.95, 0.03, 'metal', { solid: false, top: false });
      e.mesh = b.bake(map.env); map.entMeshes.push(e.mesh);
      e.model = Mat4.create();
    }
    if (e.type === 'swing') {
      const ang = Math.sin(e.t * 1.8) * e.amp;
      Mat4.model(e.model, e.x, e.y, e.z, e.a, ang);
    }
    if (e.mesh) R.drawMesh(e.mesh, { pass: 'opaque', model: e.model });
  }
  function drawEntSprite(e) {
    if (e.hidden) return;
    if (e.cond && !e.cond(Game.st)) return;
    if (e.type === 'fish') {
      const v = e.vol;
      const rx = v.front[2], rz = -v.front[0];
      const cx = (v.x0 + v.x1) / 2, cz = (v.z0 + v.z1) / 2;
      const half = Math.abs(rx) > 0.5 ? (v.x1 - v.x0) / 2 : (v.z1 - v.z0) / 2;
      const off = (e.pos - 0.5) * 2 * half;
      const depth = e.depth;
      const x = cx + rx * off + v.front[0] * depth, z = cz + rz * off + v.front[2] * depth;
      const y = e.y + Math.sin(e.t * 1.3 + e.phase) * 0.1;
      const camR = [Math.cos(cam.yaw), Math.sin(cam.yaw)];
      const flip = (rx * e.dir * camR[0] + rz * e.dir * camR[1]) < 0;
      const f = Math.floor(e.t * 3 + e.phase) % 2;
      const reg = Atlas.get(e.kind + '_' + f) || Atlas.get(e.kind);
      R.sprite(x, y, z, e.w, e.h, reg, e.flipDefault ? !flip : flip, e.col || COL);
    } else if (e.type === 'penguin') {
      const { reg, flip } = (() => {
        const rel = angDiff(cam.yaw, e.face);
        const f = e.target ? Math.floor(e.t * 4) % 2 : 0;
        if (Math.abs(rel) > Math.PI * 3 / 4 || Math.abs(rel) < Math.PI / 4) return { reg: Atlas.get('penguin_s' + f), flip: false };
        return { reg: Atlas.get('penguin_e' + f), flip: rel < 0 };
      })();
      R.sprite(e.x, e.y || 0, e.z, 0.6, 0.82, reg, flip, COL);
    } else if (e.type === 'sprite') {
      const reg = typeof e.region === 'function' ? Atlas.get(e.region(e, time)) : Atlas.get(e.region);
      R.sprite(e.x, e.y || 0, e.z, e.w, e.h, reg, e.flip, e.col || COL, e.face != null ? { face: e.face } : null);
      if (e.sparkle && ((time * 0.7 + e.x * 0.37 + e.z * 0.21) % 2.2) < 0.22) R.sprite(e.x + 0.12, (e.y || 0) + e.h + 0.05, e.z, 0.22, 0.22, Atlas.get('sparkle'), false, COL);
    } else if (e.type === 'char') {
      drawChar(e.set, e.x, e.z, e.face, false, 0, { col: e.col, y: e.y, scale: e.scale, noShadow: e.noShadow });
    }
  }

  // ------------------------------------------------------------ misc
  function fishTank(M, vol, kinds, n, o) {
    if (!vol) return;
    o = o || {};
    const r = makeRng(Math.floor((vol.x0 + vol.z0) * 100) & 0xffff);
    for (let i = 0; i < n; i++) {
      const kind = r.pick(kinds);
      const big = { octopus: [1.4, 1.2], turtle: [1.2, 0.7], jelly: [0.45, 0.65], seahorse: [0.28, 0.45] }[kind] || [0.5, 0.32];
      const depthRange = Math.abs(vol.front[0]) > 0.5 ? (vol.x1 - vol.x0) : (vol.z1 - vol.z0);
      M.ent({
        type: 'fish', kind, vol, pos: r(), dir: r() < 0.5 ? -1 : 1, speed: (kind === 'octopus' || kind === 'turtle' ? 0.03 : kind === 'jelly' ? 0.02 : 0.08) + r() * 0.06,
        y: lerp(vol.y0, Math.max(vol.y0, vol.y1 - big[1] * 0.6), r()), depth: (r() - 0.5) * depthRange * 0.5, t: r() * 10, phase: r() * 6,
        w: big[0] * (o.scale || 1), h: big[1] * (o.scale || 1), col: o.col, cond: o.cond, id: o.id,
      });
    }
  }

  return {
    load, update, draw, addNpc, removeNpc, npc, interact, collide, blocked, walkOk, useDoor, fishTank, drawChar, applyEnv,
    get map() { return map; }, get npcs() { return npcs; }, get player() { return player; }, get cam() { return cam; },
    get target() { return target; }, get time() { return time; }, firedTriggers,
  };
})();
