'use strict';
// ---------------------------------------------------------------------------
// Game — ties the world, the story and the UI together.
// ---------------------------------------------------------------------------

const Game = {
  st: null,
  mode: 'boot',
  showIndicator: true,
  sessionStart: 0,
  debugSpeed: 1,
  paused: false,
  hooks: [],

  newGame(name, slot) {
    this.st = State.newGame(name);
    this.st.slot = slot || 0;
    this.st.id = Math.random().toString(36).slice(2, 10);
    this.mode = 'play';
    Script.reset(); UI.clearAll();
    Story.begin();
  },

  loadGame(st) {
    this.st = st;
    this.mode = 'play';
    Script.reset(); UI.clearAll();
    Story.resume();
  },

  enterMap(id, spawn) {
    const st = this.st;
    st.map = id; st.spawn = spawn;
    World.load(id, spawn, st);
    World.player.set = st.flags.trapped ? 'player_ghost' : 'player';
    this.spawnNpcs();
    this.applyAudio();
    const def = MAPS[id];
    if (def.onEnter) Script.run((S) => def.onEnter(S, st));
    Story.onEnterMap(id, spawn);
  },

  // rebuild current location (after a time-of-day change etc.) keeping player position
  reloadMap() {
    const p = World.player, keep = { x: p.x, z: p.z, face: p.face };
    World.load(this.st.map, this.st.spawn, this.st);
    p.x = keep.x; p.z = keep.z; p.face = keep.face;
    this.spawnNpcs();
    this.applyAudio();
  },

  applyAudio() {
    const def = MAPS[this.st.map];
    const st = this.st;
    const song = def.music ? def.music(st) : null;
    if (Story.musicOverride !== undefined) { if (Story.musicOverride) Sound.playMusic(Story.musicOverride); else Sound.stopMusic(0.8); }
    else if (song) Sound.playMusic(song); else Sound.stopMusic(0.8);
    Sound.ambience(def.amb ? def.amb(st) : []);
  },

  spawnNpcs() {
    const st = this.st, id = st.map;
    for (const key in NPCS) {
      const d = NPCS[key];
      const w = d.where ? d.where(st) : null;
      if (!w || w.map !== id) continue;
      if (World.npc(key)) continue;
      const n = World.addNpc(Object.assign({ id: key, set: d.set || key, talk: d.talk, name: d.name }, d.props || {}, w));
      if (w.face != null && typeof w.face === 'string') n.face = { n: 0, e: Math.PI / 2, s: Math.PI, w: -Math.PI / 2 }[w.face];
    }
  },

  setTod(t) { this.st.tod = t; this.reloadMap(); },

  saveTo(slot, label) {
    const st = this.st;
    st.pos = { x: World.player.x, z: World.player.z, face: World.player.face };
    const s = State.save(slot, st, label);
    const meta = State.getMeta(); meta.lastSlot = slot; State.saveMeta();
    return s;
  },

  async saveMenu(label) { return Menus.saveSlots('save', label); },

  update(dt) {
    if (this.mode === 'play') {
      this.st.playtime += dt;
      const m = State.getMeta(); m.total = (m.total || 0) + dt;
      const blocked = UI.busy || Menus.open;
      if (!blocked && !Script.busy) {
        if (Input.pressed('start')) { Input.eat('start'); Menus.pause(); }
        else if (Input.pressed('select')) { Input.eat('select'); Menus.items(); }
        else if (Input.pressed('a')) { if (World.interact()) Input.eat('a'); }
      }
      if (!Menus.open && !this.paused) {
        World.update(dt, !blocked);
        Story.update(dt);
      }
    }
    for (const h of this.hooks) h(dt);
  },

  draw() {
    if ((this.mode === 'play' || this.mode === 'ending') && World.map && !this.hideWorld) World.draw();
    else { R.beginFrame([0, 0, 0]); }
  },

  drawHud(ctx) {
    if (Story.drawHud) Story.drawHud(ctx);
  },
};

// ------------------------------------------------------------------ main loop
const Main = (() => {
  let last = 0;
  let acc = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    Input.update();
    R.settings.time = now / 1000;
    R.settings.uvTime = now / 1000;
    Script.update(dt);
    UI.update(dt);
    if (Game.mode === 'title' || Game.mode === 'boot' || Game.mode === 'name') Title.update(dt);
    else { Menus.update(dt); Game.update(dt); }
    if (Atlas.dirty) Atlas.upload();
    Game.draw();
    const ctx = R.ui;
    if (Game.mode === 'title' || Game.mode === 'boot' || Game.mode === 'name') { ctx.clearRect(0, 0, 320, 240); Title.draw(ctx); UI.draw(ctx, true); }
    else if (Menus.open) { ctx.clearRect(0, 0, 320, 240); Menus.draw(ctx); }
    else UI.draw(ctx);
    R.endFrame();
  }
  function start() {
    requestAnimationFrame((t) => { last = t; frame(t); });
  }
  return { start };
})();
