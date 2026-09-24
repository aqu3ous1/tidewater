'use strict';
// ---------------------------------------------------------------------------
// Title — boot logo, title screen, name entry. The title screen quietly
// changes depending on what has happened on this disc before.
// ---------------------------------------------------------------------------

const Title = (() => {
  let phase = 'boot'; // boot | press | menu | name | options
  let t = 0, sel = 0;
  let fish = [];
  let bubbles = [];
  let nameBuf = '', gridSel = 0;
  let msg = '', msgT = 0;
  let pendingLoad = null;
  let nameIgnore = 0;
  const GRID = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ-. '.split('').concat(['DEL', 'END']);

  function init() {
    fish = [];
    const meta = State.getMeta();
    const n = meta.phase >= 2 && !meta.trueDone ? 3 : 9;
    for (let i = 0; i < n; i++) fish.push({ x: Math.random() * 320, y: 60 + Math.random() * 150, v: (10 + Math.random() * 18) * (Math.random() < 0.5 ? -1 : 1), k: Math.floor(Math.random() * 8), ph: Math.random() * 6 });
    if (meta.trueDone) fish.push({ x: -40, y: 170, v: 7, k: 'octopus', ph: 0 });
    bubbles = [];
    for (let i = 0; i < 16; i++) bubbles.push({ x: Math.random() * 320, y: Math.random() * 240, v: 8 + Math.random() * 20 });
  }

  function show(fromGame) {
    Game.mode = 'title';
    Script.reset(); UI.clearAll();
    if (Menus.open) Menus.close();
    Sound.ambience([]);
    phase = Sound.ready ? 'menu' : 'press';
    sel = 0; t = 0;
    R.settings.fade = 0;
    init();
    titleMusic();
  }
  function titleMusic() {
    const meta = State.getMeta();
    if (meta.phase >= 2 && !meta.trueDone) Sound.stopMusic(0.5);
    else Sound.playMusic('title');
  }
  function boot() { Game.mode = 'boot'; phase = 'boot'; t = 0; init(); }

  function menuOptions() {
    const meta = State.getMeta();
    const hasSave = State.list().some((s) => s);
    const opts = [];
    if (!(State.load(3) && !meta.trueDone)) opts.push('NEW GAME');
    if (hasSave) opts.push('CONTINUE');
    opts.push('OPTIONS');
    return opts;
  }

  function update(dt) {
    t += dt;
    for (const f of fish) { f.x += f.v * dt; if (f.x > 360) f.x = -40; if (f.x < -40) f.x = 360; }
    for (const b of bubbles) { b.y -= b.v * dt; if (b.y < -5) { b.y = 245; b.x = Math.random() * 320; } }
    if (msgT > 0) msgT -= dt;
    if (Menus.open) { Menus.update(dt); return; }
    if (UI.busy) return;
    if (phase === 'boot') {
      if (t > 0.3 && t < 0.35 && Sound.ready) Sound.sfx('boot');
      if (t > 4.2 || (t > 0.5 && (Input.pressed('a') || Input.pressed('start')))) { Input.eat('a'); Input.eat('start'); phase = 'press'; Game.mode = 'title'; t = 0; titleMusic(); }
      return;
    }
    if (phase === 'press') {
      if (Input.pressed('a') || Input.pressed('start')) {
        Input.eat('a'); Input.eat('start');
        Sound.unlock(); Sound.sfx('select'); titleMusic();
        phase = 'menu'; sel = 0;
      }
      return;
    }
    if (phase === 'menu') {
      const opts = menuOptions();
      if (Input.repeat('up', dt)) { sel = (sel + opts.length - 1) % opts.length; Sound.sfx('move'); }
      if (Input.repeat('down', dt)) { sel = (sel + 1) % opts.length; Sound.sfx('move'); }
      sel = Math.min(sel, opts.length - 1);
      if (Input.pressed('a') || Input.pressed('start')) {
        Input.eat('a'); Input.eat('start');
        const o = opts[sel];
        Sound.sfx('select');
        if (o === 'NEW GAME') { phase = 'name'; nameBuf = ''; gridSel = 0; Input.takeTyped(); nameIgnore = 0.3; }
        else if (o === 'CONTINUE') { Menus.saveSlots('load').then(onLoadPick); }
        else if (o === 'OPTIONS') { phase = 'options'; sel = 0; }
      }
      return;
    }
    if (phase === 'options') {
      const meta = State.getMeta();
      if (Input.repeat('up', dt)) { sel = (sel + 3) % 4; Sound.sfx('move'); }
      if (Input.repeat('down', dt)) { sel = (sel + 1) % 4; Sound.sfx('move'); }
      const dx = Input.repeat('right', dt) ? 1 : Input.repeat('left', dt) ? -1 : 0;
      const a = Input.pressed('a'); if (a) Input.eat('a');
      if (dx || a) {
        if (sel === 0) { meta.soft = !meta.soft; R.settings.soft = meta.soft; }
        if (sel === 1) { meta.music = clamp(Math.round((meta.music + (dx || 0.1) * 0.1) * 10) / 10, 0, 1); Sound.setVolume('music', meta.music); }
        if (sel === 2) { meta.sfx = clamp(Math.round((meta.sfx + (dx || 0.1) * 0.1) * 10) / 10, 0, 1); Sound.setVolume('sfx', meta.sfx); }
        if (sel === 3 && a) { phase = 'menu'; sel = 0; }
        State.saveMeta(); Sound.sfx('move');
      }
      if (Input.pressed('b')) { Input.eat('b'); phase = 'menu'; sel = 0; }
      return;
    }
    if (phase === 'name') {
      if (nameIgnore > 0) { nameIgnore -= dt; Input.takeTyped(); return; }
      const typed = Input.takeTyped();
      if (typed.length) {
        for (const ch of typed) {
          if (ch === '\b') nameBuf = nameBuf.slice(0, -1);
          else if (ch === '\n') { if (nameBuf.trim()) return startNew(); }
          else if (/[a-zA-Z .\-]/.test(ch) && nameBuf.length < 8) nameBuf += ch.toUpperCase();
        }
        Sound.sfx('click');
        Input.eat('a'); Input.eat('b'); Input.eat('up'); Input.eat('down'); Input.eat('left'); Input.eat('right');
        return;
      }
      const cols = 8;
      if (Input.repeat('left', dt)) { gridSel = (gridSel + GRID.length - 1) % GRID.length; Sound.sfx('move'); }
      if (Input.repeat('right', dt)) { gridSel = (gridSel + 1) % GRID.length; Sound.sfx('move'); }
      if (Input.repeat('up', dt)) { gridSel = (gridSel + GRID.length - cols) % GRID.length; Sound.sfx('move'); }
      if (Input.repeat('down', dt)) { gridSel = (gridSel + cols) % GRID.length; Sound.sfx('move'); }
      if (Input.pressed('b')) { Input.eat('b'); if (nameBuf.length) nameBuf = nameBuf.slice(0, -1); else { phase = 'menu'; } Sound.sfx('cancel'); }
      if (Input.pressed('a')) {
        Input.eat('a');
        const g = GRID[gridSel];
        if (g === 'DEL') nameBuf = nameBuf.slice(0, -1);
        else if (g === 'END') { if (nameBuf.trim()) return startNew(); Sound.sfx('wrong'); }
        else if (nameBuf.length < 8) nameBuf += g;
        Sound.sfx('click');
      }
    }
  }

  function startNew() {
    const nm = nameBuf.trim() || 'NEW KID';
    // pick first empty slot, else slot 1
    const saves = State.list();
    let slot = saves.findIndex((s, i) => !s && i < 3); if (slot < 0) slot = 0;
    Sound.stopMusic(0.5);
    Script.run(async () => {
      await UI.fade(1, 0.6);
      Game.newGame(nm, slot);
    });
  }

  function onLoadPick(r) {
    if (!r) return;
    if (r.fake) {
      Script.run(async (S) => {
        const c = await S.ask(null, 'This file belongs to someone else. Load it anyway?', ['NO', 'YES']);
        if (c !== 1) return;
        Sound.stopMusic(0.1);
        Game.hideTitle = true;
        await UI.fade(1, 0.3);
        await S.card('', '', { dur: 1.5 });
        if (r.fake === 'kaylee') { await S.say('kaylee', 'is someone there'); await S.say('kaylee', 'please dont finish it'); await S.say('kaylee', 'he asks you to fix things. dont fix them'); }
        else { await S.say('kaylee', '...'); await S.card('', '', { dur: 0.6 }); }
        Game.hideTitle = false;
        await UI.fade(0, 0.3);
        titleMusic();
      });
      return;
    }
    Sound.stopMusic(0.4);
    Script.run(async () => { await UI.fade(1, 0.5); Game.loadGame(State.load(r.slot)); });
  }

  // ------------------------------------------------------------------ drawing
  function draw(ctx) {
    if (Game.hideTitle) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 320, 240); return; }
    const meta = State.getMeta();
    if (phase === 'boot') {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 320, 240);
      const a = clamp(Math.min(t - 0.3, 3.6 - t), 0, 1);
      ctx.globalAlpha = a;
      // Soft Harbor logo: a little boat on waves
      ctx.fillStyle = '#e8e4d8'; ctx.fillRect(148, 92, 24, 3); ctx.fillRect(152, 95, 16, 3); ctx.fillRect(159, 74, 2, 18);
      ctx.fillStyle = '#e8743a'; ctx.beginPath(); ctx.moveTo(161, 75); ctx.lineTo(173, 88); ctx.lineTo(161, 88); ctx.fill();
      for (let x = 120; x < 200; x += 8) { ctx.fillStyle = '#3a6ab8'; ctx.fillRect(x, 101 + ((x / 8) % 2), 6, 2); }
      Font.center(ctx, 'SOFT HARBOR', 160, 112, '#e8e4d8', { scale: 2 });
      Font.center(ctx, 'EDUCATIONAL SOFTWARE', 160, 136, '#8a8a80');
      Font.center(ctx, 'IN ASSOCIATION WITH THE BELLWOOD AQUARIUM', 160, 150, '#6a6a60');
      ctx.globalAlpha = 1;
      return;
    }
    const dead = meta.phase >= 2 && !meta.trueDone;
    // water background
    for (let y = 0; y < 240; y += 4) {
      const k = y / 240;
      ctx.fillStyle = rgbStr(mixc(dead ? '#2a4a6a' : '#3aa0d8', dead ? '#060c18' : '#10285a', k));
      ctx.fillRect(0, y, 320, 4);
    }
    // light rays
    ctx.globalAlpha = dead ? 0.03 : 0.07;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) { const x = 40 + i * 80 + Math.sin(t * 0.3 + i) * 10; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 30, 0); ctx.lineTo(x + 70, 240); ctx.lineTo(x + 20, 240); ctx.fill(); }
    ctx.globalAlpha = 1;
    // sand
    ctx.fillStyle = dead ? '#4a4638' : '#d8c894'; ctx.fillRect(0, 222, 320, 18);
    for (const b of bubbles) { ctx.fillStyle = 'rgba(220,240,255,0.6)'; ctx.fillRect(Math.round(b.x), Math.round(b.y), 2, 2); }
    for (const f of fish) {
      const reg = f.k === 'octopus' ? Atlas.get('octopus_' + (Math.floor(t * 2) % 2)) : Atlas.get('fish' + f.k + '_' + (Math.floor(t * 3 + f.ph) % 2));
      const y = Math.round(f.y + Math.sin(t + f.ph) * 3);
      ctx.save();
      if (f.v < 0) { ctx.translate(Math.round(f.x) + reg.w * 2, y); ctx.scale(-1, 1); ctx.drawImage(Atlas.canvas, reg.x, reg.y, reg.w, reg.h, 0, 0, reg.w * 2, reg.h * 2); }
      else ctx.drawImage(Atlas.canvas, reg.x, reg.y, reg.w, reg.h, Math.round(f.x), y, reg.w * 2, reg.h * 2);
      ctx.restore();
    }
    // Walter standing on the sand once he's "in" the game
    if (meta.phase >= 3 && !meta.trueDone) {
      const r = Atlas.get('walter_ghost_s0');
      ctx.globalAlpha = 0.9;
      ctx.drawImage(Atlas.canvas, r.x, r.y, r.w, r.h, 270, 186, r.w * 0.8, r.h * 0.8);
      ctx.globalAlpha = 1;
    }
    // logo
    const word = 'TIDEWATER';
    for (let i = 0; i < word.length; i++) {
      const x = 160 - word.length * 9 * 3 / 2 / 1.5 + i * 18 * 1 - 0, y = 46 + Math.round(Math.sin(t * 2 + i * 0.6) * (dead ? 0 : 3));
      Font.draw(ctx, word[i], x - 1, y + 2, '#0a1a3a', { scale: 3 });
      Font.draw(ctx, word[i], x, y, dead ? '#b8c0c8' : '#f4e070', { scale: 3, shadow: dead ? '#3a4a5a' : '#c8702a' });
    }
    Font.center(ctx, 'A BELLWOOD AQUARIUM ADVENTURE', 160, 84, dead ? '#8a98a8' : '#e8f4ff', { shadow: '#0a1a3a' });
    // endings seen: little shells
    const ends = ['escape', 'version', 'trapped', 'true'];
    ends.forEach((e, i) => {
      const seen = meta.endings && meta.endings[e];
      const r = Atlas.get('icon_shell');
      ctx.globalAlpha = seen ? 1 : 0.18;
      ctx.drawImage(Atlas.canvas, r.x, r.y, r.w, r.h, 8 + i * 18, 222, 16, 16);
      ctx.globalAlpha = 1;
    });
    Font.draw(ctx, '(C)2001 SOFT HARBOR', 208, 228, dead ? '#5a6070' : '#1a3060');
    if (phase === 'press') {
      if (Math.floor(t * 2) % 2 === 0) Font.center(ctx, 'PRESS START', 160, 150, '#ffffff', { shadow: '#0a1a3a' });
      Font.center(ctx, 'ARROWS/WASD MOVE   Z ACT   X RUN/BACK', 160, 190, dead ? '#6a7a8a' : '#c8e0f4');
      Font.center(ctx, 'TAB ITEMS   ESC PAUSE', 160, 200, dead ? '#6a7a8a' : '#c8e0f4');
    } else if (phase === 'menu') {
      const opts = menuOptions();
      UI.panel(ctx, 110, 118, 100, opts.length * 14 + 12);
      opts.forEach((o, i) => { if (i === sel) Font.draw(ctx, '▶', 118, 125 + i * 14, UI.C.hi); Font.draw(ctx, o, 128, 125 + i * 14, i === sel ? UI.C.hi : UI.C.text); });
    } else if (phase === 'options') {
      UI.panel(ctx, 70, 110, 180, 80);
      const rows = ['SCREEN   ' + (meta.soft ? 'SOFT' : 'SHARP'), 'MUSIC    ' + bar(meta.music), 'SOUND    ' + bar(meta.sfx), 'BACK'];
      rows.forEach((r, i) => { if (i === sel) Font.draw(ctx, '▶', 78, 120 + i * 14, UI.C.hi); Font.draw(ctx, r, 88, 120 + i * 14, i === sel ? UI.C.hi : UI.C.text); });
    } else if (phase === 'name') {
      UI.panel(ctx, 50, 100, 220, 120);
      Font.center(ctx, "WHAT'S YOUR NAME?", 160, 107, UI.C.hi);
      UI.panel(ctx, 110, 120, 100, 16, { bg: '#0a0e20' });
      Font.draw(ctx, nameBuf + (Math.floor(t * 3) % 2 ? '_' : ' '), 116, 124, '#ffffff');
      GRID.forEach((g, i) => {
        const cx = 66 + (i % 8) * 24, cy = 144 + Math.floor(i / 8) * 14;
        Font.draw(ctx, g === ' ' ? '_' : g, cx, cy, i === gridSel ? UI.C.hi : UI.C.text);
        if (i === gridSel) Font.draw(ctx, '▶', cx - 7, cy, UI.C.hi);
      });
      Font.center(ctx, 'TYPE OR PICK LETTERS. ENTER/END TO FINISH', 160, 204, UI.C.dim);
    }
    if (msgT > 0) Font.center(ctx, msg, 160, 210, '#e8a0a0');
    if (Menus.open) Menus.draw(ctx);
  }
  const bar = (v) => '[' + '#'.repeat(Math.round(v * 10)) + '-'.repeat(10 - Math.round(v * 10)) + ']';

  return { update, draw, show, boot, init };
})();
