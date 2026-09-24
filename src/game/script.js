'use strict';
// ---------------------------------------------------------------------------
// Script — cutscenes and interactions are plain async functions that receive
// `S`, a small API. Blocking scripts freeze the player and run one at a time.
// ---------------------------------------------------------------------------

const Script = (() => {
  let busyCount = 0;
  const queue = [];
  const timers = [];
  let camOverride = null;
  let running = false;
  let gen = 0;

  async function pump() {
    if (running) return;
    running = true;
    const g = gen;
    while (queue.length && g === gen) {
      const fn = queue.shift();
      busyCount++;
      try { await fn(S); } catch (e) { console.error('script error', e); }
      if (g === gen) busyCount--;
    }
    if (g === gen) running = false;
  }
  function run(fn) { queue.push(fn); pump(); }
  // background script: doesn't block the player
  function bg(fn) { (async () => { try { await fn(S); } catch (e) { console.error('bg script error', e); } })(); }

  function update(dt) {
    for (let i = timers.length - 1; i >= 0; i--) {
      const t = timers[i];
      t.t -= dt;
      if (t.t <= 0) { timers.splice(i, 1); t.resolve(); }
    }
  }
  function wait(sec) { const d = deferred(); timers.push({ t: sec, resolve: d.resolve }); return d; }
  function reset() { gen++; queue.length = 0; busyCount = 0; running = false; camOverride = null; }

  const st = () => Game.st;

  const S = {
    get st() { return Game.st; },
    wait,
    // --- dialogue
    say(who, text, o) { return UI.dialog(who, text, o); },
    async lines(who, arr, o) { for (const l of arr) await UI.dialog(who, l, o); },
    ask(who, text, options, o) { return UI.dialog(who, text, Object.assign({ choices: options }, o || {})); },
    choose(options, o) { return UI.choice(options, o); },
    notice(text, o) { return UI.notice(text, o); },
    // --- flags / items
    flag(k, v) { if (v === undefined) v = true; st().flags[k] = v; return v; },
    unflag(k) { delete st().flags[k]; },
    get(k) { return st().flags[k]; },
    has(id) { return st().inv.includes(id) || !!st().found[id]; },
    async give(id, o) {
      o = o || {};
      const it = ITEMS[id];
      if (!it) { console.warn('no item', id); return; }
      const coll = it.cat && COLLECTION_CATS[it.cat];
      if (coll) { if (st().found[id]) return; st().found[id] = Date.now(); if (it.inv && !st().inv.includes(id)) st().inv.push(id); }
      else { if (st().inv.includes(id)) return; st().inv.push(id); }
      if (!o.silent) {
        Sound.sfx('pickup');
        await UI.notice((it.cat && COLLECTION_CATS[it.cat] ? 'Found: ' : 'Got: ') + it.name, { icon: it.icon });
      }
      if (Story.onGive) await Story.onGive(S, id);
    },
    take(id) { const i = st().inv.indexOf(id); if (i >= 0) st().inv.splice(i, 1); delete st().found[id]; },
    money(d) { st().money = Math.max(0, (st().money || 0) + d); },
    // --- objectives
    async obj(id, text, o) {
      o = o || {};
      const cur = st().obj;
      if (cur && cur.text && !o.noHist) st().hist.push(cur.text);
      st().obj = { id, text, voice: o.voice || 'game' };
      if (!o.quiet) await UI.banner(text, o.voice || 'game', o);
    },
    done(id) { const cur = st().obj; if (cur && (id == null || cur.id === id)) { st().hist.push(cur.text); st().obj = null; } st().side = st().side.filter((s) => s.id !== id); },
    isObj(id) { return st().obj && st().obj.id === id; },
    side(id, text, o) { if (!st().side.find((s) => s.id === id)) st().side.push({ id, text, voice: (o && o.voice) || 'game' }); if (!(o && o.quiet)) Sound.sfx('objective', { vol: 0.5 }); },
    sideDone(id) { st().side = st().side.filter((s) => s.id !== id); },
    // --- world
    async go(mapId, spawn, o) {
      o = o || {};
      if (o.sfx) Sound.sfx(o.sfx);
      await UI.fade(1, o.fadeOut == null ? 0.35 : o.fadeOut, o.color);
      Game.enterMap(mapId, spawn);
      if (o.hold) await wait(o.hold);
      await UI.fade(0, o.fadeIn == null ? 0.35 : o.fadeIn, o.color);
    },
    fade(to, t, color) { return UI.fade(to, t == null ? 0.5 : t, color); },
    npc(id) { return World.npc(id); },
    walk(id, x, z, o) {
      o = o || {};
      const d = deferred();
      if (id === 'player') {
        const p = World.player;
        const pts = Array.isArray(x) ? x : [[x, z]];
        const speed = o.speed || 3.3;
        (async () => {
          for (const [tx, tz] of pts) {
            for (;;) {
              const dx = tx - p.x, dz = tz - p.z, dd = Math.hypot(dx, dz);
              if (dd < 0.08) break;
              const step = Math.min(dd, speed * (1 / 60));
              p.x += dx / dd * step; p.z += dz / dd * step; p.face = Math.atan2(dx, -dz); p.moving = true; p.anim += 0.1;
              await wait(1 / 60);
            }
          }
          p.moving = false; d.resolve();
        })();
        return d;
      }
      const n = World.npc(id);
      if (!n) { d.resolve(); return d; }
      n.path = Array.isArray(x) ? x.map((q) => q.slice()) : [[x, z]];
      if (o.speed) n.speed = o.speed;
      n.onArrive = () => d.resolve();
      if (o.noWait) d.resolve();
      return d;
    },
    face(id, target) {
      const who = id === 'player' ? World.player : World.npc(id);
      if (!who) return;
      let tx, tz;
      if (typeof target === 'number') { who.face = target; return; }
      if (target === 'player') { tx = World.player.x; tz = World.player.z; }
      else if (typeof target === 'string') { const t = World.npc(target); if (!t) return; tx = t.x; tz = t.z; }
      else { tx = target[0]; tz = target[1]; }
      who.face = Math.atan2(tx - who.x, -(tz - who.z));
    },
    cam(cfg) { camOverride = cfg; },
    camReset() { camOverride = null; },
    sfx(name, o) { Sound.sfx(name, o); },
    music(name, o) { Sound.playMusic(name, o); },
    stopMusic(t) { Sound.stopMusic(t); },
    amb(list, f) { Sound.ambience(list, f); },
    inspect(id) { return UI.inspect(id); },
    read(docId) { return UI.read(docId); },
    numpad(len, o) { return UI.numpad(len, o); },
    card(text, sub, o) { return UI.card(text, sub, o); },
    shake(a) { World.cam.shake = a; },
    async save(label) { return Game.saveMenu(label); },
    setTod(t) { Game.setTod(t); },
    reload() { Game.reloadMap(); },
  };

  return {
    run, bg, update, wait, reset, S,
    get busy() { return busyCount > 0 || queue.length > 0; },
    get camOverride() { return camOverride; },
  };
})();
