'use strict';
// ---------------------------------------------------------------------------
// Dreams — one every night, between the save prompt and the next morning.
// Each is a small place you can walk around in, with a way to wake up.
// They start silly and get less silly. (Maps live in src/maps/dreams.js.)
// ---------------------------------------------------------------------------

const DREAMS = {
  1: { title: 'the boxes', obj: 'FIND YOUR BED.' },
  2: { title: 'the shallow end', obj: 'FIND MISTER EIGHT.' },
  3: { title: 'the long counter', obj: 'FIND A SEAT.' },
  4: { title: 'parade', obj: 'FIND MARMALADE.' },
  5: { title: 'low tide', obj: 'FOLLOW THE BOY.' },
  6: { title: 'home movie', obj: 'WATCH.' },
  7: { title: 'downstairs', obj: 'GO DOWNSTAIRS.' },
};

Object.assign(SPEAKERS, {
  ruth: { name: 'RUTH', pitch: 270 },
  toby: { name: 'TOBY', pitch: 410 },
  penguin: { name: 'PENGUIN', pitch: 360 },
  octopus: { name: 'MISTER EIGHT', pitch: 120, style: 'ghost' },
  crowd: { name: '', pitch: 240 },
});

const Dreams = (() => {
  let t = 0, timers = {};
  const f = () => (Game.st && Game.st.dreamFlags) || {};
  const night = () => (Game.st && (Game.st.dreaming || (/^dream(\d)/.exec(Game.st.map || '') || [])[1])) | 0;
  // the second, stranger place some dreams lead into
  const NEXT = { dream2b: 'FOLLOW THE PATH.', dream3b: 'ANSWER THE PHONE.', dream5b: 'GO TO THE WHITE HOUSE.' };

  // ---------------------------------------------------------------- art
  function atlas() {
    const P = (w, h, fn) => { const p = new Pix(w, h); fn(p); return p; };
    const add = (n, p) => Atlas.add(n, p);
    // Ruth has only ever been in photographs. Tonight she walks around.
    if (CHAR_DEFS.ruth && !Sprites.sets.ruth) {
      const set = { s: [], n: [], e: [] };
      for (const dir of ['s', 'n', 'e']) for (let fr = 0; fr < 3; fr++) set[dir].push(Atlas.add('ruth_' + dir + fr, Sprites.paintHuman(CHAR_DEFS.ruth, dir, fr)));
      Sprites.sets.ruth = set;
    }
    // moving-box labels, in marker
    const box = (n, t) => Decals.sign(n, t, { bg: '#b8905a', fg: '#2a2020', border: false, pad: 3, padY: 2, post: (p) => p.speckle(makeRng(n.length), ['#a88050', '#c49c66'], 0.12) });
    box('dl_kitchen', 'KITCHEN'); box('dl_books', 'BOOKS'); box('dl_winter', 'WINTER'); box('dl_you', 'YOU'); box('dl_misc', 'MISC.');
    box('dl_basement', 'BASEMENT'); box('dl_bed', 'BED'); box('dl_ev', ['E.V.', 'DO NOT']);
    // what's inside the open boxes (seen from above)
    add('dc_kitchen', P(32, 32, (p) => { p.fill('#e8e4d4'); for (let y = 0; y < 32; y += 4) for (let x = (y / 4) % 2 * 4; x < 32; x += 8) p.rect(x, y, 4, 4, '#c8c0b0'); p.rect(2, 2, 10, 8, '#f4f4f0'); p.rect(4, 4, 2, 2, '#c83a3a'); p.rect(18, 2, 12, 6, '#8a8a8a'); for (const x of [20, 26]) p.ring(x, 5, 2, 2, '#2a2a2a'); p.rect(22, 18, 8, 10, '#f4f4f0'); p.rect(23, 19, 6, 1, '#8ad0f0'); p.rect(8, 16, 10, 8, '#a86a3a'); }));
    add('dc_water', P(32, 32, (p) => { p.fill('#3a8ab8'); for (let y = 2; y < 32; y += 5) for (let x = (y * 3) % 7; x < 32; x += 8) p.rect(x, y, 3, 1, '#8ac8e8'); p.ellipse(16, 16, 5, 3, '#e8743a'); p.tri(11, 16, 8, 13, 8, 19, '#e8743a'); p.set(19, 15, '#1a1420'); }));
    add('dc_snow', P(32, 32, (p) => { p.fill('#dde6ee'); p.speckle(makeRng(5), ['#ffffff', '#c8d4e0', '#f4f8ff'], 0.5); for (let i = 0; i < 6; i++) p.set(4 + i * 5, 6 + (i * 7) % 20, '#a8b8c8'); }));
    add('dc_helmet', P(32, 32, (p) => { p.fill('#8a6a44'); p.ellipse(16, 16, 12, 12, '#d9b85a'); p.ellipse(16, 16, 12, 12, '#d9b85a'); p.ring(16, 16, 12, 12, '#a4843a'); p.ellipse(16, 18, 6, 6, '#9ad0e8'); p.ring(16, 18, 6, 6, '#a4843a'); p.set(12, 10, '#f2dc94'); p.set(13, 9, '#f2dc94'); }));
    add('dc_stairs', P(32, 32, (p) => { p.fill('#0a0806'); for (let i = 0; i < 6; i++) p.rect(4 + i, 4 + i * 4, 24 - i * 2, 3, shade('#8a6a44', 1 - i * 0.14)); p.rect(12, 28, 8, 3, '#f4e0a0'); }));
    add('dc_tape', P(32, 32, (p) => { for (let i = 0; i < 5; i++) { p.line(0, 4 + i * 6, 31, 10 + i * 5, [200, 180, 120, 230]); p.line(0, 5 + i * 6, 31, 11 + i * 5, [200, 180, 120, 230]); } p.rect(14, 0, 4, 32, [210, 190, 130, 240]); }));
    // exhibit labels
    const lab = (n, t) => Decals.sign(n, t, { bg: '#1a2a4a', fg: '#e8e4d0', border: '#8aa0c0', pad: 3, padY: 2 });
    lab('dt_1', '#1 TOURIST'); lab('dt_2', '#2 MAILMAN'); lab('dt_3', '#3 NEIGHBOR'); lab('dt_4', '#4 GIRL, 12'); lab('dt_5', '#5 MECHANIC');
    lab('dt_6', '#6 YOU'); lab('dt_7', '#7 COOK'); lab('dt_8', '#8 (EMPTY)');
    Decals.sign('dc_nofeed', ['PLEASE DO NOT', 'FEED THE VISITORS'], { bg: '#f4f0e0', fg: '#c83a3a', border: '#c83a3a' });
    add('dc_hands', P(48, 32, (p) => {
      const hand = (x, y, s) => { p.ellipse(x, y, 3 * s, 3.5 * s, [220, 235, 245, 160]); for (let i = 0; i < 4; i++) p.rect(Math.round(x - 3 * s + i * 2 * s), Math.round(y - 7 * s), Math.max(1, Math.round(s)), Math.round(4 * s), [220, 235, 245, 150]); p.rect(Math.round(x + 3 * s), Math.round(y - 2 * s), Math.round(2 * s), 1, [220, 235, 245, 150]); };
      hand(10, 14, 1); hand(22, 20, 1.1); hand(33, 12, 0.9); hand(40, 24, 1);
      for (let i = 0; i < 6; i++) p.rect(8 + i * 6, 20 + (i % 3) * 3, 1, 5 + (i % 2) * 3, [200, 220, 235, 120]);
    }));
    // the diner
    add('dc_plate', P(24, 16, (p) => { p.ellipse(12, 8, 11, 7, '#f4f4f0'); p.ring(12, 8, 11, 7, '#c8c8c0'); p.rect(6, 5, 12, 6, '#e8c070'); p.rect(6, 7, 12, 2, '#d8a850'); p.set(16, 4, '#6ab04a'); }));
    Decals.sign('dc_pie', ['PIE OF THE DAY:', 'TUESDAY'], { bg: '#f4f0e0', fg: ['#2a2430', '#c83a3a'], border: '#c83a3a', double: true });
    add('dc_bell', P(8, 8, (p) => { p.ellipse(4, 4, 3, 3, '#e8c040'); p.rect(1, 4, 7, 1, '#a8841a'); p.set(3, 2, '#f8e8a0'); p.set(4, 7, '#6a5010'); p.outline('#3a2a10'); }));
    // the parade
    add('dc_confetti', P(32, 32, (p) => { const r = makeRng(9); for (let i = 0; i < 40; i++) p.rect(r.int(31), r.int(31), 1 + r.int(2), 1, r.pick(['#e83a3a', '#e8c040', '#3a8ae8', '#e87ab8', '#6ac850', '#f4f4f0'])); }));
    const poster = (n, draw) => add(n, P(20, 26, (p) => { p.fill('#f8f8f4'); p.rect(0, 0, 20, 5, '#c83a3a'); Closeups.tiny(p, 'MISSING', 0, 0, '#f8f8f4'); draw(p); p.frame(0, 0, 20, 26, '#8a8a80'); }));
    poster('dc_missing_you', (p) => { p.ellipse(10, 13, 6, 6, '#d9b85a'); p.ellipse(10, 14, 3, 3, '#9ad0e8'); p.rect(6, 19, 8, 5, '#3b62b5'); });
    poster('dc_missing_boy', (p) => { p.ellipse(10, 11, 4, 4, '#f0c8a0'); p.rect(7, 7, 7, 2, '#8a5a2a'); p.rect(6, 15, 8, 8, '#ecece4'); for (let y = 16; y < 23; y += 2) p.rect(6, y, 8, 1, '#3a6ab8'); p.rect(12, 20, 8, 6, [0, 0, 0, 0]); });
    poster('dc_missing_cat', (p) => { p.ellipse(10, 15, 6, 4, '#e8943a'); p.ellipse(6, 12, 3, 3, '#e8943a'); p.tri(4, 10, 5, 7, 7, 10, '#e8943a'); p.set(5, 12, '#1a1420'); });
    add('dc_party', P(12, 14, (p) => { p.tri(1, 13, 11, 13, 6, 1, '#3a8ae8'); p.line(3, 10, 8, 10, '#e8c040'); p.line(4, 6, 7, 6, '#e83a3a'); p.set(6, 0, '#f4f4f0'); p.outline('#1a1420'); }));
    add('dc_cakesandwich', P(32, 24, (p) => { p.ellipse(16, 12, 15, 11, '#f4f4f0'); p.rect(5, 5, 22, 14, '#f4e0b0'); p.frame(5, 5, 22, 14, '#c8a060'); Closeups.tiny(p, 'HAPPY', 7, 7, '#d8b020'); Closeups.tiny(p, 'B-DAY', 7, 13, '#d8b020'); }));
    for (const [n, c] of [['r', '#e83a3a'], ['b', '#3a8ae8'], ['y', '#e8c040'], ['g', '#6ac850']]) add('dc_balloon_' + n, P(10, 22, (p) => { p.ellipse(5, 5, 4.5, 5, c); p.set(3, 3, shade(c, 1.4)); p.tri(4, 10, 6, 10, 5, 12, c); p.line(5, 12, 5, 21, '#d8d8d0'); p.outline('#1a1420'); }));
    // the home movie
    Decals.sign('dc_banner', 'HAPPY BIRTHDAY EVAN!', { bg: '#f4f0e0', fg: '#c83a3a', border: '#3a6ab8', double: true });
    const cake = (n, candles) => add(n, P(32, 32, (p) => {
      p.ellipse(16, 16, 15, 15, '#f4f4f0'); p.ellipse(16, 16, 12, 12, '#f8e0e8'); p.ring(16, 16, 12, 12, '#e87ab8');
      Closeups.tiny(p, 'EVAN', 9, 14, '#3a6ab8');
      for (let i = 0; i < candles; i++) { const a = i / candles * Math.PI * 2; const x = Math.round(16 + Math.cos(a) * 9), y = Math.round(16 + Math.sin(a) * 9); p.set(x, y, '#e8c040'); p.set(x, y - 1, '#f8f0a0'); }
    }));
    cake('dc_cake10', 10); cake('dc_cake11', 11);
    add('dc_cal', P(24, 30, (p) => {
      p.fill('#f4f4f0'); p.rect(0, 0, 24, 8, '#3a6ab8'); Closeups.tiny(p, 'AUG', 6, 1, '#f4f4f0');
      for (let i = 0; i < 31; i++) { const x = 1 + (i % 7) * 3 + 0, y = 10 + Math.floor(i / 7) * 4; p.rect(x, y, 2, 2, '#9a9a9a'); }
      p.ring(1 + (11 % 7) * 3 + 1, 10 + Math.floor(11 / 7) * 4 + 1, 2.5, 2.5, '#e83a3a');
      p.frame(0, 0, 24, 30, '#8a8a80');
    }));
    add('dc_shadow', P(24, 64, (p) => { p.ellipse(12, 8, 5, 6, [10, 8, 12, 200]); p.rect(5, 13, 14, 26, [10, 8, 12, 200]); p.rect(2, 15, 4, 16, [10, 8, 12, 200]); p.rect(18, 15, 4, 16, [10, 8, 12, 200]); p.rect(15, 16, 8, 6, [10, 8, 12, 220]); p.rect(6, 39, 5, 25, [10, 8, 12, 200]); p.rect(13, 39, 5, 25, [10, 8, 12, 200]); }));
    add('dc_streamer', P(64, 8, (p) => { for (let x = 0; x < 64; x++) { const y = Math.round(3 + Math.sin(x / 5) * 2.5); p.set(x, y, x % 16 < 8 ? '#e83a3a' : '#3a8ae8'); p.set(x, y + 1, x % 16 < 8 ? '#c82a2a' : '#2a6ac8'); } }));
    add('dc_steam', P(12, 20, (p) => { for (let i = 0; i < 3; i++) { p.ellipse(6 + Math.sin(i * 2) * 2, 16 - i * 6, 3, 2.5, [230, 230, 230, 110]); } }));
    add('dc_shovel', P(10, 16, (p) => { p.rect(4, 0, 2, 9, '#8a6a44'); p.tri(1, 9, 9, 9, 5, 15, '#e83a3a'); p.rect(2, 9, 6, 2, '#e83a3a'); p.outline('#1a1420'); }));
    add('dc_bottle', P(10, 18, (p) => { p.rect(3, 0, 4, 4, '#6ab070'); p.ellipse(5, 11, 4, 6, [120, 200, 130, 220]); p.rect(3, 7, 4, 7, '#f4f0dc'); p.line(4, 9, 6, 9, '#6a6a6a'); p.line(4, 11, 6, 11, '#6a6a6a'); p.rect(4, 0, 2, 1, '#8a6a44'); p.outline('#1a3a20'); }));
    add('dc_clock2', P(20, 20, (p) => { p.ellipse(10, 10, 9, 9, '#f8f4e4'); p.ring(10, 10, 9, 9, '#3a2a4a'); p.ring(10, 10, 8, 8, '#3a2a4a'); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; p.set(Math.round(10 + Math.cos(a) * 6.5), Math.round(10 + Math.sin(a) * 6.5), '#3a2a4a'); } p.line(10, 10, 10, 4, '#1a1420'); p.line(10, 10, 14, 8, '#1a1420'); p.set(10, 10, '#e83a3a'); }));
    add('dc_stone', P(12, 8, (p) => { p.ellipse(6, 4, 5.5, 3.5, '#f4f0ec'); p.ellipse(5, 3, 3, 1.5, '#ffffff'); p.outline('#8a7a7a'); }));
    add('dc_moon', P(32, 32, (p) => { p.ellipse(16, 16, 15, 15, '#8ab4ff'); p.ellipse(11, 11, 3, 3, '#6a94e8'); p.ellipse(20, 19, 4, 3, '#6a94e8'); p.ellipse(18, 9, 2, 2, '#6a94e8'); }));
    add('dc_coat', P(16, 40, (p) => { p.rect(7, 0, 2, 40, '#3a2a1a'); p.rect(3, 38, 10, 2, '#3a2a1a'); p.tri(2, 30, 14, 30, 8, 6, '#3a3a50'); p.rect(4, 10, 8, 20, '#3a3a50'); p.ellipse(8, 5, 3, 3, '#6a5a3a'); p.rect(4, 3, 8, 2, '#6a5a3a'); }));
    add('dc_lightstrip', P(32, 4, (p) => { for (let x = 0; x < 32; x++) for (let y = 0; y < 4; y++) p.set(x, y, [255, 230, 160, 220 - y * 50]); }));
  }

  // ---------------------------------------------------------------- flow
  async function start(S, n) {
    const st = S.st;
    st.dreaming = n; st.dreamFlags = {};
    Game.enterMap('dream' + n, 'start');
    await S.card(DREAMS[n].title, '', { dur: 2.4, fg: '#a8a0c0' });
    await S.fade(0, 1.4);
    await S.obj('dream', DREAMS[n].obj);
  }
  async function wake(S, lines) {
    const st = S.st;
    const n = night() || st.day;
    for (const l of lines || []) await S.say(null, l);
    if (S.isObj('dream')) S.done('dream');
    UI.subtitle = null;
    S.stopMusic(1.4);
    await S.fade(1, 1.6);
    Sound.ambience([], 1);
    await S.wait(1.2);
    st.dreaming = null; st.dreamFlags = null;
    R.settings.wobble = 0;
    await Story.startDay(S, n + 1);
  }
  // map onEnter: music warping, and debug entry straight into a dream
  function enter(S, n, mods) {
    const st = Game.st;
    if (!st.dreaming) { st.dreaming = n; st.dreamFlags = st.dreamFlags || {}; }
    if (mods) Sound.musicMods(mods);
    t = 0; timers = {};
  }

  // ---------------------------------------------------------------- per-frame bits
  function near(x, z, r) { const p = World.player; return p && Math.hypot(p.x - x, p.z - z) < r; }
  function every(key, sec, dt) { timers[key] = (timers[key] || 0) - dt; if (timers[key] <= 0) { timers[key] = sec; return true; } return false; }
  function update(dt) {
    const st = Game.st; if (!st || !World.map) return;
    const n = /^dream(\d)(b?)$/.exec(st.map); if (!n) return;
    t += dt;
    const d = +n[1], fl = st.dreamFlags || (st.dreamFlags = {});
    if (Script.busy) return;
    if (d === 1 && fl.phonePos && !fl.phone && near(fl.phonePos[0], fl.phonePos[1], 9) && every('ring', 3.4, dt)) Sound.sfx('phone', { vol: 0.5 });
    if (d === 3) {
      if (fl.bellPos && !fl.bell && near(fl.bellPos[0], fl.bellPos[1], 2.2)) { fl.bell = true; Sound.sfx('bell', { vol: 0.6 }); }
      if (fl.phonePos && !fl.phone && near(fl.phonePos[0], fl.phonePos[1], 10) && every('ring', 3.4, dt)) Sound.sfx('phone', { vol: 0.45 });
    }
    if (d === 4 && fl.millerPos && near(fl.millerPos[0], fl.millerPos[1], 22) && every('marm', 6.5, dt)) {
      UI.subtitle = 'MRS. MILLER: Marmalade? Marma-lade?';
      setTimeout(() => { if (UI.subtitle && UI.subtitle.startsWith('MRS. MILLER')) UI.subtitle = null; }, 2600);
    }
    if (d === 7 && every('dig', 1.3 - Math.min(0.6, (fl.landing || 0) * 0.15), dt)) Sound.sfx('scrub', { vol: 0.15 + (fl.landing || 0) * 0.16, pitch: 0.5, far: (fl.landing || 0) < 3 });
  }

  // a subtle frame on dream screens; the home movie gets a camcorder overlay
  function drawHud(ctx) {
    const st = Game.st; if (!st) return;
    const m = /^dream(\d)(b?)$/.exec(st.map || ''); if (!m) return;
    const d = m[2] ? 0 : +m[1];
    for (let i = 0; i < 6; i++) { const a = 0.05 * (6 - i); ctx.fillStyle = 'rgba(0,0,0,' + a + ')'; ctx.fillRect(0, i, 320, 1); ctx.fillRect(0, 239 - i, 320, 1); ctx.fillRect(i, 0, 1, 240); ctx.fillRect(319 - i, 0, 1, 240); }
    if (d === 6) {
      const loop = (st.dreamFlags && st.dreamFlags.loop) || 0;
      if (Math.floor(t * 2) % 2) Font.draw(ctx, 'PLAY ▶', 14, 12, '#f4f4ee', { shadow: '#000' });
      const date = loop >= 2 && Math.random() < 0.3 ? 'AUG.15.1991' : 'AUG.12.1990';
      Font.draw(ctx, date, 238, 216, '#f4f4ee', { shadow: '#000' });
      Font.draw(ctx, 'SP', 14, 216, '#f4f4ee', { shadow: '#000' });
      const y = (Math.floor(t * 40) % 260) - 10;
      ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(0, y, 320, 3);
      if (Math.random() < 0.08) { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(0, 200 + Math.random() * 30, 320, 2); }
    }
  }
  // go deeper instead of waking up
  async function next(S, id, lines) {
    for (const l of lines || []) await S.say(null, l);
    UI.subtitle = null;
    await S.fade(1, 1.2);
    await S.wait(0.6);
    Game.enterMap(id, 'start');
    await S.fade(0, 1.4);
    if (S.isObj('dream')) S.done('dream');
    await S.obj('dream', NEXT[id] || 'KEEP GOING.');
  }
  return { atlas, start, wake, next, enter, update, drawHud, near, f, night };
})();

// ---------------------------------------------------------------- hooks into Story
Object.assign(Story, {
  dreamStart: (S, n) => Dreams.start(S, n),
  dreamWake: (S, lines) => Dreams.wake(S, lines),
});
{
  const u2 = Story.update2, h2 = Story.drawHud2;
  Story.update2 = function (dt) { if (u2) u2.call(Story, dt); Dreams.update(dt); };
  Story.drawHud2 = function (ctx) { if (h2) h2.call(Story, ctx); Dreams.drawHud(ctx); };
}
