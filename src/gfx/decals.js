'use strict';
// ---------------------------------------------------------------------------
// Decals — signs, posters, windows, doors, photographs, children's drawings,
// item icons. All painted into the atlas at boot.
// ---------------------------------------------------------------------------

const Decals = (() => {
  const P = (w, h, fn) => { const p = new Pix(w, h); fn(p); return p; };
  const add = (name, pix) => Atlas.add(name, pix);

  // Generic sign: lines of text centered, with optional border
  function sign(name, lines, o) {
    o = o || {};
    lines = Array.isArray(lines) ? lines : [lines];
    const sc = o.scale || 1;
    const maxLen = Math.max(...lines.map((l) => l.length));
    const w = o.w || Math.max(16, maxLen * 6 * sc + (o.pad == null ? 6 : o.pad) * 2);
    const h = o.h || lines.length * 10 * sc + (o.padY == null ? 5 : o.padY) * 2;
    const p = new Pix(w, h).fill(o.bg || '#f0ece0');
    if (o.border !== false) { p.frame(0, 0, w, h, o.border || '#3a3440'); if (o.double) p.frame(2, 2, w - 4, h - 4, o.border || '#3a3440'); }
    const top = Math.round((h - lines.length * 10 * sc) / 2) + (o.dy || 0);
    lines.forEach((l, i) => p.textCenter(l, w / 2, top + i * 10 * sc, Array.isArray(o.fg) ? o.fg[i] : (o.fg || '#2a2430'), sc));
    if (o.post) o.post(p);
    return add(name, p);
  }

  function paperNote(name, lines, o) {
    o = o || {};
    const w = o.w || 48, h = o.h || 40;
    const p = new Pix(w, h).fill(o.bg || '#f4f0dc');
    for (let y = 9; y < h; y += 6) for (let x = 2; x < w - 2; x++) p.set(x, y, o.lineC || '#c8d4e8');
    lines.forEach((l, i) => Font.paint(p, l, 3, 2 + i * 6 + (o.dy || 0), o.fg || '#2a3a8a', 1));
    p.frame(0, 0, w, h, '#b8b098');
    return add(name, p);
  }

  // ---------------------------------------------------------------- windows & doors
  function windows() {
    add('win_house', P(20, 24, (p) => {
      p.fill('#f4f4ee'); p.rect(2, 2, 16, 20, '#9ac4e0'); p.rect(2, 12, 16, 10, '#7aa8c8');
      p.line(3, 4, 7, 2, '#d8ecf8'); p.rect(9, 2, 2, 20, '#f4f4ee'); p.rect(2, 11, 16, 2, '#f4f4ee');
      p.rect(2, 2, 4, 20, '#e8d8b0'); p.rect(14, 2, 4, 20, '#e8d8b0');
      p.frame(0, 0, 20, 24, '#6a6a70');
    }));
    add('win_house_lit', P(20, 24, (p) => {
      p.fill('#f4f4ee'); p.rect(2, 2, 16, 20, '#f8dc80'); p.rect(2, 14, 16, 8, '#f0c860');
      p.rect(9, 2, 2, 20, '#f4f4ee'); p.rect(2, 11, 16, 2, '#f4f4ee');
      p.rect(2, 2, 4, 20, '#e8b870'); p.rect(14, 2, 4, 20, '#e8b870'); p.frame(0, 0, 20, 24, '#6a6a70');
    }));
    add('win_dark', P(20, 24, (p) => {
      p.fill('#d8d8d0'); p.rect(2, 2, 16, 20, '#2a3038'); p.rect(9, 2, 2, 20, '#d8d8d0'); p.rect(2, 11, 16, 2, '#d8d8d0'); p.frame(0, 0, 20, 24, '#5a5a60');
    }));
    add('win_board', P(20, 24, (p) => {
      p.fill('#2a2a2e'); const r = makeRng(301);
      for (let i = 0; i < 4; i++) { const y = 2 + i * 5 + r.int(2); p.rect(0, y, 20, 4, '#9a8a6a'); p.line(0, y, 19, y, '#b8a888'); p.set(2, y + 2, '#555'); p.set(17, y + 2, '#555'); }
      p.frame(0, 0, 20, 24, '#5a5048');
    }));
    add('win_shop', P(48, 24, (p) => {
      p.fill('#e8e8e0'); p.rect(2, 2, 44, 20, '#8ab4d4'); p.line(4, 18, 16, 4, '#b8d8f0'); p.line(8, 18, 20, 4, '#b8d8f0');
      p.rect(2, 16, 44, 6, '#6a8aa8'); p.frame(0, 0, 48, 24, '#5a5a60');
    }));
    add('win_shop_lit', P(48, 24, (p) => { p.fill('#e8e8e0'); p.rect(2, 2, 44, 20, '#f0dc98'); p.rect(2, 16, 44, 6, '#d8c078'); p.frame(0, 0, 48, 24, '#5a5a60'); }));
    add('win_church', P(16, 32, (p) => {
      p.fill('#8a8a84'); p.ellipse(8, 8, 7, 7, '#3a5aa8'); p.rect(1, 8, 14, 23, '#3a5aa8');
      p.rect(2, 10, 5, 8, '#c84a4a'); p.rect(9, 10, 5, 8, '#e8c040'); p.rect(2, 20, 5, 9, '#4aa04a'); p.rect(9, 20, 5, 9, '#c84a4a'); p.ellipse(8, 6, 4, 3, '#e8c040');
      p.rect(7, 2, 2, 29, '#2a2a2a'); p.rect(1, 18, 14, 2, '#2a2a2a');
    }));
    add('win_school', P(32, 20, (p) => { p.fill('#e0e0d8'); p.rect(2, 2, 28, 16, '#9ac4e0'); for (let x = 2; x < 30; x += 7) p.rect(x, 2, 1, 16, '#e0e0d8'); p.rect(2, 9, 28, 1, '#e0e0d8'); p.frame(0, 0, 32, 20, '#6a6a60'); }));
    add('win_aq_round', P(24, 24, (p) => { p.ellipse(12, 12, 12, 12, '#6a7a80'); p.ellipse(12, 12, 10, 10, '#4a8ab8'); p.line(6, 14, 12, 7, '#9ad0f0'); }));

    const door = (name, col, o) => add(name, P(o && o.w || 16, 32, (p) => {
      const w = p.w;
      p.fill(col); p.frame(0, 0, w, 32, shade(col, 0.6));
      if (o && o.glass) { p.rect(3, 3, w - 6, 14, '#9ac4e0'); p.line(4, 12, 9, 4, '#d0e8f8'); }
      else { p.frame(3, 3, w - 6, 11, shade(col, 0.8)); p.frame(3, 17, w - 6, 12, shade(col, 0.8)); }
      p.rect(w - 4, 17, 2, 2, o && o.knob || '#d8b848');
      if (o && o.win) p.rect(Math.floor(w / 2) - 2, 5, 4, 7, '#9ac4e0');
    }));
    door('door_wood', '#8a5a34');
    door('door_red', '#a83a34');
    door('door_blue', '#3a5a8a');
    door('door_green', '#3a6a4a');
    door('door_white', '#e8e4d8', { knob: '#a8a8a8' });
    door('door_int', '#d8ccb0', { knob: '#b89848' });
    door('door_glass', '#8a8a90', { glass: true, knob: '#d8d8d8' });
    door('door_metal', '#7a8088', { knob: '#c8c8c8', win: true });
    door('door_school', '#6a4a8a', { w: 32, glass: true });
    door('door_old', '#6a5a4a');
    add('door_evan', P(16, 32, (p) => {
      p.fill('#d8ccb0'); p.frame(0, 0, 16, 32, '#a89c80'); p.frame(3, 3, 10, 11, '#c0b498'); p.frame(3, 17, 10, 12, '#c0b498');
      p.rect(12, 17, 2, 2, '#b89848');
      // a fish sticker and a "KEEP OUT" sign in kid handwriting
      p.rect(3, 5, 10, 6, '#f4f0dc'); Font.paint(p, 'KEEP', 3, 5, '#c83a3a'); p.ellipse(7, 23, 3, 2, '#e8943a'); p.set(4, 23, '#e8943a');
    }));
    add('door_boarded', P(16, 32, (p) => { p.fill('#4a4038'); for (let i = 0; i < 3; i++) { p.rect(0, 4 + i * 10, 16, 4, '#9a8a6a'); p.line(0, 4 + i * 10 + (i % 2) * 3, 15, 4 + i * 10 + 3 - (i % 2) * 3, '#7a6a4a'); } }));
    add('door_garage', P(32, 28, (p) => { p.fill('#c8c4b8'); for (let y = 0; y < 28; y += 4) p.rect(0, y, 32, 1, '#a8a498'); p.rect(14, 22, 4, 2, '#6a6a6a'); p.frame(0, 0, 32, 28, '#6a6a66'); }));
    add('door_black', P(16, 32, (p) => p.fill('#050507')));
    add('door_white_light', P(16, 32, (p) => { p.fill('#fbfbf4'); p.frame(0, 0, 16, 32, '#e8e8e0'); }));
    add('door_hatch', P(24, 24, (p) => { p.fill('#8a8a84'); p.frame(0, 0, 24, 24, '#5a5a56'); p.frame(3, 3, 18, 18, '#6a6a66'); p.rect(10, 10, 4, 4, '#c8b060'); }));
  }

  // ---------------------------------------------------------------- signs
  function signs() {
    // Aquarium: big friendly sign with a fish
    add('aq_sign', P(128, 32, (p) => {
      p.fill('#2a58b8'); p.frame(0, 0, 128, 32, '#f4f0e0'); p.frame(2, 2, 124, 28, '#f4f0e0');
      p.textCenter('BELLWOOD', 72, 5, '#f4e070', 1); p.textCenter('AQUARIUM', 72, 16, '#ffffff', 1);
      p.ellipse(20, 16, 10, 7, '#e8743a'); p.tri(10, 16, 4, 9, 4, 23, '#e8743a'); p.rect(19, 9, 2, 14, '#f4f4f0'); p.set(26, 14, '#111');
      p.ellipse(113, 10, 2, 2, '#d8f0ff'); p.ellipse(118, 18, 3, 3, '#d8f0ff'); p.ellipse(112, 24, 1.5, 1.5, '#d8f0ff');
    }));
    add('aq_sign_old', P(128, 32, (p) => {
      p.fill('#3a4a6a'); p.frame(0, 0, 128, 32, '#a8a498'); p.textCenter('BELLWOOD', 72, 5, '#a89a60', 1); p.textCenter('AQUARIUM', 72, 16, '#b8b8b0', 1);
      p.ellipse(20, 16, 10, 7, '#8a5a3a'); p.tri(10, 16, 4, 9, 4, 23, '#8a5a3a'); p.set(26, 14, '#111');
      p.speckle(makeRng(302), ['#2a3a5a', '#4a5a7a'], 0.08);
    }));
    sign('sign_hals', "HAL'S DINER", { bg: '#c83a3a', fg: '#fff8e0', border: '#f4f0e0', double: true, scale: 1 });
    sign('sign_market', 'BELLWOOD MARKET', { bg: '#3a7a4a', fg: '#f8f4e0', border: '#f4f0e0' });
    sign('sign_suds', ['SUDS', 'LAUNDROMAT'], { bg: '#6ab0d8', fg: ['#ffffff', '#2a4a7a'], border: '#ffffff' });
    sign('sign_rosas', "ROSA'S", { bg: '#2a6a3a', fg: '#f8e8a0', border: '#c83a3a', double: true });
    sign('sign_rosas_note', ['BACK', 'AT 2'], { bg: '#f8f4e0', fg: '#2a2a8a', border: '#8a8a8a' });
    sign('sign_gus', ["GUS'S GAS", '& SERVICE'], { bg: '#e8e0d0', fg: ['#c83a2a', '#2a3a6a'], border: '#c83a2a' });
    sign('sign_church', ['BELLWOOD', 'COMMUNITY CHURCH'], { bg: '#f0ece0', fg: '#3a3040', border: '#6a5a4a' });
    sign('sign_church_board', ['SUNDAY 10 AM', 'ALL WELCOME'], { bg: '#2a2a2e', fg: '#f4f4f0', border: '#8a7a5a' });
    sign('sign_church_board2', ['SUNDAY 10 AM', 'SERVICE FOR', 'WALTER VANE'], { bg: '#2a2a2e', fg: '#f4f4f0', border: '#8a7a5a' });
    sign('sign_school', 'BELLWOOD ELEMENTARY', { bg: '#6a4a8a', fg: '#f4f0e0', border: '#e8d870' });
    sign('sign_open', 'OPEN', { bg: '#f8f4e0', fg: '#c83a3a', border: '#c83a3a' });
    sign('sign_closed', 'CLOSED', { bg: '#f8f4e0', fg: '#2a2a2a', border: '#2a2a2a' });
    sign('sign_aq_closed', ['CLOSED UNTIL', 'FURTHER NOTICE'], { bg: '#f8f4e0', fg: '#2a2a2a', border: '#2a2a2a' });
    const street = (n, t) => sign(n, t, { bg: '#2a7a4a', fg: '#ffffff', border: '#ffffff', padY: 2, pad: 3 });
    street('st_maple', 'MAPLE ST'); street('st_main', 'MAIN ST'); street('st_harbor', 'HARBOR RD'); street('st_oak', 'OAK ST'); street('st_center', 'CENTER AVE'); street('st_new', 'VANE WAY');
    sign('town_sign', ['WELCOME TO', 'BELLWOOD', 'POP. 1,204'], { bg: '#f0ece0', fg: ['#3a3a3a', '#2a58b8', '#3a3a3a'], border: '#6a5a4a', double: true });
    sign('town_sign2', ['WELCOME TO', 'BELLWOOD', 'POP. 1,205'], { bg: '#f0ece0', fg: ['#3a3a3a', '#2a58b8', '#3a3a3a'], border: '#6a5a4a', double: true });
    sign('sign_busstop', ['BUS', 'STOP'], { bg: '#8a6a4a', fg: '#d8d0c0', border: '#5a4a3a', post: (p) => p.speckle(makeRng(303), ['#7a5a3a', '#6a4a2a', '#9a7a5a'], 0.15) });
    sign('sign_roadclosed', ['ROAD', 'CLOSED'], { bg: '#f0a030', fg: '#1a1a1a', border: '#1a1a1a' });
    sign('sign_forsale', ['FOR', 'SALE'], { bg: '#f4f4f0', fg: '#c83a3a', border: '#c83a3a' });
    sign('mailbox_vane', 'VANE', { bg: '#3a3a40', fg: '#9a9a90', border: false, pad: 2, padY: 1, post: (p) => { for (let x = 1; x < p.w - 1; x += 1) if (x % 3) p.set(x, 5, '#e8e8e0'); p.rect(1, 3, p.w - 2, 4, [232, 232, 224, 170]); } });
    sign('mailbox_miller', 'MILLER', { bg: '#3a3a40', fg: '#e8e8e0', border: false, pad: 2, padY: 1 });

    // Aquarium interior
    sign('sign_owner', 'OWNER ONLY', { bg: '#f4f0e0', fg: '#c83a3a', border: '#c83a3a' });
    sign('sign_employees', ['EMPLOYEES', 'ONLY'], { bg: '#f4f0e0', fg: '#2a2a2a', border: '#2a2a2a' });
    sign('sign_maint', ['MAINTENANCE', 'AUTHORIZED ONLY'], { bg: '#f0c040', fg: '#1a1a1a', border: '#1a1a1a' });
    sign('sign_tunnel', ['T6', 'NO ENTRY'], { bg: '#f0c040', fg: '#1a1a1a', border: '#1a1a1a' });
    sign('sign_closed_t6', ['TANK 6 ~ THE DEEP', 'CLOSED FOR RENOVATION', 'SORRY FOR THE MESS!'], { bg: '#f4f0e0', fg: ['#2a3a8a', '#c83a3a', '#2a2a2a'], border: '#2a3a8a' });
    sign('sign_hours', ['BELLWOOD AQUARIUM', 'OPEN 9 AM - 5 PM', 'EVERY DAY'], { bg: '#2a58b8', fg: ['#f4e070', '#ffffff', '#ffffff'], border: '#ffffff' });
    sign('sign_gift', 'GIFT SHOP', { bg: '#e8743a', fg: '#ffffff', border: '#ffffff' });
    sign('sign_penguins', 'PENGUIN POINT', { bg: '#1e2230', fg: '#ffffff', border: '#e8a030' });
    sign('sign_touch', ['TOUCH POOL', 'TWO FINGERS, GENTLY!'], { bg: '#4ac08a', fg: '#ffffff', border: '#ffffff' });
    sign('sign_staffkitchen', 'KITCHEN', { bg: '#f4f0e0', border: '#2a2a2a' });
    sign('sign_storage', 'STORAGE', { bg: '#f4f0e0', border: '#2a2a2a' });
    sign('sign_break', 'STAFF ROOM', { bg: '#f4f0e0', border: '#2a2a2a' });
    sign('sign_pump', 'PUMP ROOM', { bg: '#f0c040', fg: '#1a1a1a', border: '#1a1a1a' });
    const tankLabel = (n, title, sub) => sign(n, [title, sub], { bg: '#1a2a4a', fg: ['#f4e070', '#c8d8f0'], border: '#8aa0c8', pad: 3 });
    tankLabel('label_t1', 'TANK 1', 'CORAL REEF');
    tankLabel('label_t2', 'TANK 2', 'MOON JELLIES');
    tankLabel('label_t3', 'TANK 3', 'SEAHORSES');
    tankLabel('label_t4', 'TANK 4', 'SEA TURTLES');
    tankLabel('label_t5', 'TANK 5', 'MISTER EIGHT');
    tankLabel('label_t6', 'TANK 6', 'THE DEEP');
    sign('poster_rules', ['STAFF RULES', '1. WASH YOUR HANDS', '2. DO NOT TAP GLASS', "3. DON'T FEED THE", '   OCTOPUS AFTER 6PM', '4. OWNER ONLY MEANS', '   OWNER ONLY', '       - W.V.'], { bg: '#f4f0e0', fg: '#2a2a3a', border: '#2a58b8', padY: 3 });
    sign('poster_octopus', ['MEET', 'MISTER EIGHT!', 'HE CAN OPEN JARS!'], { bg: '#e8743a', fg: ['#ffffff', '#fff0a0', '#ffffff'], border: '#ffffff', h: 44, dy: -4, post: (p) => { p.ellipse(p.w / 2, 37, 6, 3, '#c8543a'); } });
    sign('poster_reef', ['WHO LIVES', 'IN THE REEF?'], { bg: '#3ab0c8', fg: '#ffffff', border: '#ffffff', h: 44, dy: -6, post: (p) => { p.ellipse(14, 34, 5, 3, '#e8742a'); p.ellipse(32, 36, 5, 3, '#f0d040'); p.ellipse(50, 33, 4, 3, '#3a6ae0'); } });
    sign('poster_jelly', ['JELLIES HAVE', 'NO BRAINS!', 'NO HEARTS!', 'NO BONES!'], { bg: '#c86ab0', fg: '#ffffff', border: '#ffffff' });
    sign('poster_deep', ['COMING SOON', 'THE DEEP', 'SUMMER 1991'], { bg: '#0a1a3a', fg: ['#c8d8f0', '#f4e070', '#c8d8f0'], border: '#3a5a8a', h: 40 });
    sign('poster_penguin', ['PENGUINS', 'CAN NOT FLY', 'BUT THEY CAN', 'SWIM 22 MPH'], { bg: '#f4f4f0', fg: '#1e2230', border: '#1e2230' });
    sign('poster_turtle', ['SEA TURTLES', 'CAN LIVE', '100 YEARS'], { bg: '#5a8a3a', fg: '#ffffff', border: '#ffffff' });
    sign('sign_price', ['PLUSH  $6', 'SHELLS $1', 'GAME  $19'], { bg: '#f4f0e0', fg: '#2a2a2a', border: '#e8743a' });

    // Street/shop details
    sign('sign_prices', ['REG  1.39', 'PLUS 1.49', 'SUP  1.59'], { bg: '#f4f4f0', fg: '#1a1a1a', border: '#c83a2a' });
    sign('menu_board', ['TODAY', 'TUNA MELT 4.50', 'PIE OF DAY  2.00', 'COFFEE  .75'], { bg: '#2a2a2e', fg: '#f4f4f0', border: '#8a6a4a' });
    sign('sign_laundry', ['PLEASE', 'EMPTY LINT', 'TRAP. THANK', 'YOU! - MAE'], { bg: '#f4f0e0', fg: '#2a3a8a', border: '#6ab0d8' });
    sign('sign_register', 'REGISTER', { bg: '#f4f0e0', border: '#3a7a4a', fg: '#3a7a4a' });
    sign('sign_deli', 'DELI', { bg: '#c83a3a', fg: '#ffffff', border: '#ffffff' });
    sign('hymn_board', ['HYMNS', '112', '48', '301'], { bg: '#3a2a1a', fg: '#e8d8a0', border: '#8a6a3a' });
    sign('sign_records', ['RECORDS', 'STAFF ONLY'], { bg: '#f4f0e0', fg: '#2a2a2a', border: '#2a2a2a' });
    sign('sign_lostfound', ['LOST &', 'FOUND'], { bg: '#e8c040', fg: '#2a2a2a', border: '#2a2a2a' });
    sign('sign_room5', 'ROOM 5', { bg: '#f4f0e0', fg: '#2a2a2a', border: '#6a4a8a' });
    sign('chalk_text', ['WELCOME BACK', 'CLASS OF 2002!'], { bg: '#2e5a3e', fg: '#e8ece0', border: '#8a6a3a', w: 96, h: 40 });
    sign('chalk_text_old', ['WELCOME BACK', 'CLASS OF 1992!'], { bg: '#2e5a3e', fg: '#e8ece0', border: '#8a6a3a', w: 96, h: 40 });
    sign('chalk_remember', ['REMEMBER', 'REMEMBER', 'REMEMBER'], { bg: '#2e5a3e', fg: '#e8ece0', border: '#8a6a3a', w: 96, h: 40 });
    sign('sign_exit', 'EXIT', { bg: '#1a1a1a', fg: '#e84a3a', border: '#e84a3a' });
    sign('sign_exit_white', 'EXIT', { bg: '#ffffff', fg: '#9a9a9a', border: '#e0e0e0' });
    sign('bulletin', ['BAKE SALE SAT', 'LOST: RED MITTEN', 'PIANO LESSONS'], { bg: '#b8905a', fg: '#2a2a2a', border: '#6a4a2a', post: (p) => { p.rect(3, 3, 2, 2, '#c83a3a'); } });
  }

  // ---------------------------------------------------------------- props painted flat
  function props() {
    add('fridge_front', P(16, 32, (p) => { p.fill('#e8e8e0'); p.frame(0, 0, 16, 32, '#a8a8a0'); p.rect(0, 11, 16, 1, '#a8a8a0'); p.rect(12, 4, 2, 5, '#b8b8b0'); p.rect(12, 14, 2, 8, '#b8b8b0'); }));
    add('fridge_note', P(16, 32, (p) => { p.fill('#e8e8e0'); p.frame(0, 0, 16, 32, '#a8a8a0'); p.rect(0, 11, 16, 1, '#a8a8a0'); p.rect(12, 4, 2, 5, '#b8b8b0'); p.rect(12, 14, 2, 8, '#b8b8b0'); p.rect(3, 14, 7, 6, '#f4f0dc'); p.rect(5, 13, 2, 1, '#c83a3a'); }));
    add('stove_front', P(16, 16, (p) => { p.fill('#e8e4d8'); p.frame(0, 0, 16, 16, '#9a9690'); p.rect(2, 5, 12, 9, '#3a3a3a'); p.rect(3, 6, 10, 2, '#5a5a5a'); [2, 6, 10].forEach((x) => p.rect(x, 1, 2, 2, '#2a2a2a')); }));
    add('stove_top', P(16, 16, (p) => { p.fill('#e8e4d8'); [[4, 4], [11, 4], [4, 11], [11, 11]].forEach(([x, y]) => { p.ring(x, y, 3, 3, '#2a2a2a'); }); }));
    add('sink_top', P(16, 16, (p) => { p.fill('#d8d8d0'); p.rect(2, 3, 12, 10, '#a8b0b4'); p.rect(3, 4, 10, 8, '#c0c8cc'); p.rect(7, 1, 2, 3, '#8a8a8a'); }));
    add('cabinet_front', P(16, 16, (p) => { p.fill('#b89060'); p.frame(0, 0, 16, 16, '#8a6a40'); p.frame(2, 2, 12, 12, '#a07a4a'); p.rect(12, 7, 2, 2, '#d8c888'); }));
    add('drawers_front', P(16, 16, (p) => { p.fill('#b89060'); for (let y = 0; y < 16; y += 5) { p.frame(0, y, 16, 5, '#8a6a40'); p.rect(7, y + 2, 3, 1, '#d8c888'); } }));
    add('bookshelf', P(32, 32, (p) => {
      p.fill('#6a4a2a'); const r = makeRng(310);
      for (let s = 0; s < 4; s++) {
        const y = 1 + s * 8; p.rect(1, y, 30, 7, '#3a2a1a');
        for (let x = 2; x < 30;) { const w = 2 + r.int(2), h = 4 + r.int(3); if (r() < 0.12) { x += 3; continue; } p.rect(x, y + 7 - h, w, h, r.pick(['#c83a3a', '#3a6ab8', '#e8c040', '#4a9a4a', '#e8e0d0', '#8a4ac8', '#d86a3a'])); x += w; }
      }
    }));
    add('bookshelf_empty', P(32, 32, (p) => { p.fill('#6a4a2a'); for (let s = 0; s < 4; s++) p.rect(1, 1 + s * 8, 30, 7, '#3a2a1a'); }));
    add('tv_front', P(24, 20, (p) => { p.fill('#3a3a3e'); p.rect(2, 2, 16, 14, '#1a2a2a'); p.rect(3, 3, 14, 12, '#2a3a3a'); p.line(4, 5, 7, 4, '#4a5a5a'); p.rect(19, 4, 3, 2, '#8a8a8a'); p.rect(19, 8, 3, 2, '#8a8a8a'); }));
    add('tv_on', P(24, 20, (p) => { p.fill('#3a3a3e'); p.rect(2, 2, 16, 14, '#3a6ab8'); p.textCenter('~', 10, 5, '#ffffff'); p.ellipse(10, 11, 4, 2, '#e8743a'); p.rect(19, 4, 3, 2, '#8a8a8a'); p.rect(19, 8, 3, 2, '#e84a3a'); }));
    add('tv_title', P(24, 20, (p) => { p.fill('#3a3a3e'); p.rect(2, 2, 16, 14, '#1a3a8a'); p.rect(4, 6, 12, 2, '#f4e070'); p.rect(5, 10, 10, 1, '#c8d8f0'); p.ellipse(8, 13, 2, 1, '#e8743a'); p.rect(19, 8, 3, 2, '#e84a3a'); }));
    add('tv_you', P(24, 20, (p) => { p.fill('#3a3a3e'); p.rect(2, 2, 16, 14, '#7a7a7a'); p.ellipse(10, 7, 3, 3, '#d9b85a'); p.ellipse(10, 7.5, 1.6, 1.6, '#bfe4ec'); p.rect(9, 10, 3, 3, '#3b62b5'); p.rect(19, 8, 3, 2, '#e84a3a'); }));
    add('tv_static', P(24, 20, (p) => { p.fill('#3a3a3e'); const r = makeRng(311); for (let y = 2; y < 16; y++) for (let x = 2; x < 18; x++) p.set(x, y, r() < 0.5 ? '#d0d0d0' : '#404040'); }));
    add('clock', P(12, 12, (p) => { p.ellipse(6, 6, 6, 6, '#3a3a3a'); p.ellipse(6, 6, 5, 5, '#f4f4f0'); p.line(6, 6, 6, 2, '#1a1a1a'); p.line(6, 6, 9, 6, '#1a1a1a'); }));
    add('clock_stopped', P(12, 12, (p) => { p.ellipse(6, 6, 6, 6, '#3a3a3a'); p.ellipse(6, 6, 5, 5, '#f4f4f0'); p.line(6, 6, 3, 8, '#1a1a1a'); p.line(6, 6, 6, 1, '#1a1a1a'); }));
    add('phone_wall', P(8, 14, (p) => { p.fill('#e8e0c8'); p.frame(0, 0, 8, 14, '#9a9280'); p.rect(1, 1, 6, 4, '#c8c0a8'); for (let y = 6; y < 13; y += 2) for (let x = 1; x < 7; x += 2) p.set(x, y, '#6a6a6a'); }));
    add('washer_front', P(16, 16, (p) => { p.fill('#f0f0ec'); p.frame(0, 0, 16, 16, '#a8a8a4'); p.ellipse(8, 9, 5, 5, '#8a9aa8'); p.ellipse(8, 9, 4, 4, '#b8d0e0'); p.rect(2, 1, 12, 2, '#c8c8c4'); }));
    add('dryer_front', P(16, 16, (p) => { p.fill('#e8e8e4'); p.frame(0, 0, 16, 16, '#a8a8a4'); p.ellipse(8, 9, 5, 5, '#6a6a6a'); p.ellipse(8, 9, 4, 4, '#2a2a2a'); p.rect(2, 1, 12, 2, '#c8c8c4'); }));
    add('shelf_goods', P(32, 32, (p) => {
      p.fill('#d8d8d0'); const r = makeRng(312);
      for (let s = 0; s < 4; s++) { const y = s * 8; p.rect(0, y + 7, 32, 1, '#8a8a84'); for (let x = 1; x < 31; x += 3) { const h = 3 + r.int(4); p.rect(x, y + 7 - h, 2, h, r.pick(['#c83a3a', '#e8c040', '#3a6ab8', '#4a9a4a', '#e8743a', '#f4f4f0'])); } }
    }));
    add('shelf_milk', P(32, 32, (p) => { p.fill('#dfe8ee'); for (let s = 0; s < 4; s++) { const y = s * 8; p.rect(0, y + 7, 32, 1, '#8a9aa4'); for (let x = 1; x < 31; x += 4) { p.rect(x, y + 2, 3, 5, '#f8f8f4'); p.rect(x, y + 3, 3, 1, s % 2 ? '#3a6ab8' : '#c83a3a'); } } }));
    add('gift_shelf', P(32, 32, (p) => {
      p.fill('#e8dcc0'); const r = makeRng(313);
      for (let s = 0; s < 3; s++) { const y = s * 10 + 1; p.rect(0, y + 9, 32, 1, '#8a6a40'); for (let x = 2; x < 30; x += 7) { const c = r.pick(['#e8743a', '#3a6ae0', '#f0d040', '#c86ab0', '#4ac08a']); p.ellipse(x + 3, y + 6, 3, 2.5, c); p.set(x + 5, y + 5, '#111'); } }
    }));
    add('game_box', P(20, 26, (p) => {
      p.fill('#1a3a8a'); p.frame(0, 0, 20, 26, '#f4f4f0'); p.rect(0, 0, 20, 5, '#f4f4f0'); Font.paint(p, 'PS', 1, -1, '#1a1a1a');
      p.rect(3, 7, 14, 2, '#f4e070'); p.rect(4, 10, 12, 1, '#c8d8f0'); p.ellipse(10, 17, 5, 3, '#e8743a'); p.tri(5, 17, 2, 14, 2, 20, '#e8743a'); p.set(13, 16, '#111');
    }));
    add('game_box_you', P(20, 26, (p) => {
      p.fill('#1a3a8a'); p.frame(0, 0, 20, 26, '#f4f4f0'); p.rect(0, 0, 20, 5, '#f4f4f0'); Font.paint(p, 'PS', 1, -1, '#1a1a1a');
      p.rect(3, 7, 14, 2, '#f4e070'); p.ellipse(7, 16, 3, 3, '#d9b85a'); p.ellipse(7, 16.5, 1.6, 1.6, '#bfe4ec'); p.rect(6, 19, 3, 4, '#3b62b5');
      p.ellipse(14, 14, 2.5, 2.5, '#e8b894'); p.rect(12, 17, 5, 6, '#8e3b3b');
    }));
    add('gas_pump', P(16, 32, (p) => { p.fill('#c83a2a'); p.rect(2, 3, 12, 8, '#1a1a1a'); Font.paint(p, '1.39', 2, 3, '#f0d040'); p.rect(2, 14, 12, 6, '#f4f4f0'); p.rect(12, 20, 3, 8, '#3a3a3a'); p.frame(0, 0, 16, 32, '#6a1a14'); }));
    add('vending', P(16, 32, (p) => { p.fill('#2a5ab8'); p.rect(2, 3, 9, 22, '#1a2a3a'); for (let y = 4; y < 24; y += 5) for (let x = 3; x < 10; x += 3) p.rect(x, y, 2, 3, ['#c83a3a', '#f0d040', '#4a9a4a'][(x + y) % 3]); p.rect(12, 6, 3, 6, '#c8c8c8'); p.rect(2, 27, 9, 3, '#0a0a0a'); }));
    add('jukebox', P(20, 32, (p) => { p.fill('#8a3a2a'); p.ellipse(10, 9, 9, 8, '#e8a040'); p.ellipse(10, 9, 7, 6, '#f8e0a0'); p.rect(3, 16, 14, 8, '#3a2a2a'); for (let x = 4; x < 16; x += 3) p.rect(x, 18, 2, 4, '#e84a8a'); p.rect(4, 26, 12, 4, '#c8c8c8'); }));
    add('lockers', P(32, 32, (p) => {
      p.fill('#6a8a9a'); for (let i = 0; i < 4; i++) { p.frame(i * 8, 0, 8, 32, '#4a6a7a'); for (let y = 3; y < 9; y += 2) p.rect(i * 8 + 2, y, 4, 1, '#4a6a7a'); p.rect(i * 8 + 5, 15, 2, 3, '#c8c8c8'); Font.paint(p, String(i + 3), i * 8 + 2, 20, '#e8e8e8'); }
    }));
    add('pipes', P(32, 32, (p) => { p.fill([0, 0, 0, 0]); p.rect(0, 4, 32, 5, '#7a7a74'); p.rect(0, 4, 32, 1, '#9a9a94'); p.rect(0, 20, 32, 4, '#8a6a4a'); p.rect(12, 0, 4, 32, '#6a6a64'); p.rect(11, 3, 6, 7, '#5a5a54'); }));
    add('gauge', P(12, 12, (p) => { p.ellipse(6, 6, 6, 6, '#3a3a3a'); p.ellipse(6, 6, 5, 5, '#f4f0e0'); p.line(6, 6, 9, 3, '#c83a3a'); }));
    add('valve_wheel', P(14, 14, (p) => { p.ring(7, 7, 7, 7, '#c83a2a'); p.ring(7, 7, 6, 6, '#c83a2a'); p.line(1, 7, 13, 7, '#c83a2a'); p.line(7, 1, 7, 13, '#c83a2a'); p.ellipse(7, 7, 2, 2, '#8a2a1a'); }));
    add('drain', P(16, 16, (p) => { p.ellipse(8, 8, 7, 7, '#3a3a3a'); for (let i = 3; i < 14; i += 2) p.line(i, 3, i, 13, '#1a1a1a'); p.ring(8, 8, 7, 7, '#5a5a5a'); }));
    add('stain', P(24, 16, (p) => { const r = makeRng(314); for (let i = 0; i < 60; i++) { const a = r() * TAU, d = r() * 7; p.set(12 + Math.cos(a) * d * 1.4, 8 + Math.sin(a) * d * 0.8, [70, 40, 34, 140]); } }));
    add('manhole', P(16, 16, (p) => { p.ellipse(8, 8, 7.5, 7.5, '#4a4a4e'); p.ring(8, 8, 7.5, 7.5, '#3a3a3e'); for (let i = 4; i < 13; i += 3) p.rect(4, i, 8, 1, '#3a3a3e'); }));
    add('road_dash', P(8, 32, (p) => { p.rect(2, 0, 4, 32, '#e8c840'); }));
    add('crosswalk', P(32, 32, (p) => { for (let x = 0; x < 32; x += 8) p.rect(x, 0, 5, 32, '#e8e8e0'); }));
    add('hopscotch', P(16, 48, (p) => { const c = '#f4f4f0'; [[4, 40], [4, 32], [0, 24], [8, 24], [4, 16], [0, 8], [8, 8], [4, 0]].forEach(([x, y], i) => { p.frame(x, y, 8, 8, c); Font.paint(p, String(i + 1), x + 2, y, c); }); }));
    add('rug_round', P(32, 32, (p) => { p.ellipse(16, 16, 16, 16, '#8a4a4a'); p.ellipse(16, 16, 13, 13, '#c89a6a'); p.ellipse(16, 16, 9, 9, '#8a4a4a'); p.ellipse(16, 16, 5, 5, '#e8c890'); }));
    add('rug_fish', P(32, 24, (p) => { p.ellipse(16, 12, 16, 12, '#3a8ab8'); p.ellipse(14, 12, 8, 5, '#e8943a'); p.tri(22, 12, 29, 6, 29, 18, '#e8943a'); p.set(9, 10, '#111'); }));
    add('blanket_fish', P(32, 32, (p) => { p.fill('#5a8ad0'); const r = makeRng(315); for (let i = 0; i < 6; i++) { const x = 4 + r.int(24), y = 4 + r.int(24); p.ellipse(x, y, 3, 2, '#f0a040'); p.set(x - 3, y, '#f0a040'); } p.frame(0, 0, 32, 32, '#3a6ab8'); }));
    add('blanket_plain', P(32, 32, (p) => { p.fill('#c8b8a0'); for (let i = 0; i < 32; i += 8) p.rect(0, i, 32, 2, '#b0a088'); }));
    add('pillow', P(16, 8, (p) => { p.ellipse(8, 4, 8, 4, '#f4f4ee'); }));
    add('mirror', P(16, 24, (p) => { p.fill('#8a8a84'); p.rect(1, 1, 14, 22, '#9ab8c8'); p.line(3, 8, 8, 3, '#c8e0ec'); }));
    add('radiator', P(24, 12, (p) => { p.fill('#d8d8d0'); for (let x = 1; x < 24; x += 3) p.rect(x, 1, 2, 10, '#b8b8b0'); }));
    add('fireplace', P(32, 32, (p) => { p.fill('#a2503c'); for (let y = 0; y < 32; y += 4) for (let x = (y / 4 % 2) * 4; x < 32; x += 8) p.rect(x, y, 1, 4, '#b8ab98'); p.rect(6, 12, 20, 20, '#1a1414'); p.rect(4, 8, 24, 4, '#6a4a2a'); }));
    add('nail', P(4, 4, (p) => { p.rect(1, 1, 2, 2, '#4a4a4a'); }));
    add('frame_empty', P(20, 16, (p) => { p.frame(0, 0, 20, 16, '#6a4a2a'); p.frame(1, 1, 18, 14, '#8a6a3a'); p.rect(2, 2, 16, 12, '#d8d0c0'); }));
    add('fish_tank_small', P(24, 16, (p) => { p.fill('#2a2a2a'); p.rect(1, 1, 22, 14, '#1a2a2a'); p.rect(1, 12, 22, 3, '#8a7a5a'); }));
    add('fish_tank_small_full', P(24, 16, (p) => { p.fill('#2a2a2a'); p.rect(1, 1, 22, 14, '#4a90b8'); p.rect(1, 12, 22, 3, '#c8b888'); p.ellipse(8, 7, 2, 1.2, '#e8943a'); p.ellipse(16, 5, 2, 1.2, '#f0d040'); }));
    add('octopus_toy', P(16, 16, (p) => { p.ellipse(8, 6, 5, 4.5, '#8a4ac8'); for (let i = 0; i < 4; i++) p.line(4 + i * 2.5, 9, 3 + i * 3, 14, '#8a4ac8'); p.set(6, 6, '#111'); p.set(10, 6, '#111'); p.outline('#2a1a3a'); }));
    add('backpack_flat', P(16, 20, (p) => { p.rect(2, 3, 12, 16, '#3a7ad0'); p.rect(4, 10, 8, 6, '#346ec0'); p.rect(5, 0, 6, 4, '#2a5aa8'); p.outline('#1a2a4a'); }));
    add('shoe_flat', P(14, 8, (p) => { p.rect(1, 3, 12, 4, '#d83a32'); p.rect(1, 6, 13, 2, '#f4f4f0'); p.rect(2, 1, 6, 3, '#d83a32'); p.line(3, 3, 7, 3, '#f4f4f0'); p.outline('#3a1a1a'); }));
    add('flat_tank', P(48, 32, (p) => { p.fill('#3a4a5a'); p.rect(2, 2, 44, 26, '#2a6a9a'); p.line(4, 26, 12, 4, '#4a8aba'); p.rect(0, 28, 48, 4, '#5a5a5a'); }));
    add('flat_stairs', P(32, 32, (p) => { for (let i = 0; i < 6; i++) p.rect(i * 5, 26 - i * 5, 32 - i * 5, 6, i % 2 ? '#8a8a84' : '#9a9a94'); }));
    add('flat_phone', P(16, 20, (p) => { p.rect(2, 8, 12, 10, '#2a2a2a'); p.rect(0, 4, 16, 5, '#2a2a2a'); p.ellipse(8, 13, 3, 3, '#6a6a6a'); p.outline('#555'); }));
    add('flat_truck', P(48, 28, (p) => { p.rect(0, 6, 30, 16, '#8a8a84'); p.ellipse(15, 13, 12, 7, '#9a9a94'); p.rect(30, 10, 16, 12, '#c83a2a'); p.rect(34, 12, 8, 5, '#9ac4e0'); p.ellipse(8, 23, 4, 4, '#1a1a1a'); p.ellipse(38, 23, 4, 4, '#1a1a1a'); p.outline('#2a2a2a'); }));
    add('flat_chair', P(16, 24, (p) => { p.rect(2, 0, 12, 12, '#8a5a34'); p.rect(2, 12, 12, 3, '#8a5a34'); p.rect(2, 15, 2, 9, '#6a4a2a'); p.rect(12, 15, 2, 9, '#6a4a2a'); p.outline('#2a1a10'); }));
    add('flat_door', P(16, 32, (p) => { p.fill('#d8ccb0'); p.frame(0, 0, 16, 32, '#8a7a60'); p.rect(12, 17, 2, 2, '#b89848'); }));
    add('flat_bed', P(32, 20, (p) => { p.rect(0, 8, 32, 8, '#5a8ad0'); p.rect(0, 4, 8, 12, '#f4f4ee'); p.rect(0, 0, 3, 20, '#8a5a34'); p.rect(29, 6, 3, 14, '#8a5a34'); p.outline('#2a2a3a'); }));
    add('flat_calendar', P(16, 20, (p) => { p.fill('#f4f4f0'); p.rect(0, 0, 16, 5, '#c83a3a'); Font.paint(p, 'AUG', 0, -2, '#fff'); for (let y = 7; y < 20; y += 3) for (let x = 1; x < 16; x += 3) p.set(x, y, '#555'); p.ring(10, 14, 2.5, 2.5, '#c83a3a'); }));
    add('calendar', P(16, 20, (p) => { p.fill('#f4f4f0'); p.rect(0, 0, 16, 5, '#2a58b8'); Font.paint(p, 'AUG', 0, -2, '#fff'); for (let y = 7; y < 20; y += 3) for (let x = 1; x < 16; x += 3) p.set(x, y, '#555'); p.ring(7, 14, 2.5, 2.5, '#c83a3a'); }));
    add('box_ev', P(16, 16, (p) => { p.fill('#b89060'); p.rect(0, 7, 16, 2, '#c8b890'); Font.paint(p, 'E.V.', 2, 7, '#2a2a2a'); p.frame(0, 0, 16, 16, '#8a6a40'); }));
    add('box_moving', P(16, 16, (p) => { p.fill('#c09a68'); p.rect(0, 7, 16, 2, '#d8c8a0'); p.frame(0, 0, 16, 16, '#8a6a40'); Font.paint(p, '^', 5, 0, '#6a4a2a'); }));
    add('memorial_board', P(40, 32, (p) => { p.fill('#5a3a22'); p.frame(0, 0, 40, 32, '#c8a860'); p.textCenter('IN LOVING', 20, 2, '#e8d8a0'); p.textCenter('MEMORY', 20, 11, '#e8d8a0'); p.rect(4, 21, 32, 1, '#c8a860'); p.textCenter('R. VANE', 20, 22, '#e8d8a0'); }));
    add('emp_board_base', P(56, 24, (p) => { p.fill('#b8905a'); p.frame(0, 0, 56, 24, '#6a4a2a'); }));
    add('ev_notice', P(16, 20, (p) => { p.fill('#f4f4f0'); p.rect(2, 2, 12, 8, '#c8c8c0'); p.ellipse(8, 6, 3, 3, '#8a5a2a'); p.rect(2, 12, 12, 1, '#555'); p.rect(2, 15, 10, 1, '#555'); p.textCenter('?', 8, 1, '#2a2a2a'); }));
    add('poster_cat_small', P(12, 16, (p) => { p.fill('#f8f8f0'); Font.paint(p, '!', 3, -1, '#c83a3a'); p.ellipse(6, 10, 3.5, 2.5, '#e8943a'); p.set(3, 7, '#e8943a'); p.set(8, 7, '#e8943a'); p.frame(0, 0, 12, 16, '#9a9a90'); }));
    add('flag_us', P(18, 11, (p) => { for (let y = 0; y < 11; y++) p.rect(0, y, 18, 1, y % 2 ? '#f4f4f0' : '#c83a3a'); p.rect(0, 0, 8, 6, '#2a3a8a'); for (let i = 0; i < 6; i++) p.set(1 + (i % 3) * 3, 1 + Math.floor(i / 3) * 3, '#fff'); }));
    add('smudge', P(24, 16, (p) => { const r = makeRng(55); for (let i = 0; i < 5; i++) { const x = 4 + r.int(16), y = 3 + r.int(10); p.ellipse(x, y, 2.5, 3, [220, 230, 240, 120]); for (let k = 0; k < 4; k++) p.rect(x - 2 + k * 1.3, y - 5, 1, 3, [220, 230, 240, 110]); } }));
    add('algae', P(24, 16, (p) => { const r = makeRng(56); for (let i = 0; i < 70; i++) p.set(r.int(24), r.int(16), [70 + r.int(30), 120 + r.int(30), 50, 200]); }));
    add('sheet', P(16, 16, (p) => { p.fill('#e8e6de'); for (let y = 0; y < 16; y += 4) p.rect(0, y, 16, 1, '#d8d6ce'); }));
    add('coffee', P(10, 12, (p) => { p.rect(1, 2, 8, 9, '#2a2a2a'); p.rect(2, 6, 6, 4, '#8a5a3a'); p.rect(3, 0, 4, 2, '#4a4a4a'); }));
    add('dev_arrow', P(16, 16, (p) => { p.tri(8, 1, 1, 10, 15, 10, '#e8e840'); p.rect(5, 10, 6, 5, '#e8e840'); p.outline('#1a1a1a'); }));
    add('dev_spawn', P(24, 24, (p) => { p.ring(12, 12, 12, 12, '#40e840'); p.ring(12, 12, 11, 11, '#40e840'); p.line(12, 0, 12, 24, '#40e840'); p.line(0, 12, 24, 12, '#40e840'); }));
  }

  // ---------------------------------------------------------------- photographs
  // Character crop helper: take a sprite frame and paste scaled
  function charPix(set, dir, f) { return Atlas.get(set + '_' + (dir || 's') + (f || 0)).pix; }
  function photoBase(w, h, bg) { const p = new Pix(w, h); bg(p); return p; }
  function finishPhoto(p, o) {
    o = o || {};
    // aged tone + white border
    p.map((c) => { const l = (c[0] + c[1] + c[2]) / 3; const k = o.old ? 0.5 : 0.18; return [Math.round(lerp(c[0], l * 1.08 + 12, k)), Math.round(lerp(c[1], l * 1.0 + 6, k)), Math.round(lerp(c[2], l * 0.85, k)), 255]; });
    p.frame(0, 0, p.w, p.h, '#f4f0e4'); p.frame(1, 1, p.w - 2, p.h - 2, '#f4f0e4');
    return p;
  }
  function scratch(p, cx, cy, r, seed) {
    const rng = makeRng(seed || 99);
    for (let i = 0; i < 16; i++) { const a = rng() * TAU; p.line(cx + Math.cos(a) * r, cy + Math.sin(a) * r, cx - Math.cos(a) * r * rng(), cy - Math.sin(a) * r * rng(), rng() < 0.5 ? '#f4f0e8' : '#d8d4c8'); }
  }
  const bgOutside = (p) => { p.rect(0, 0, p.w, p.h, '#9ac8e8'); p.rect(0, Math.floor(p.h * 0.62), p.w, p.h, '#6a9a3c'); };
  const bgAquarium = (p) => { p.rect(0, 0, p.w, p.h, '#9ac8e8'); p.rect(0, 10, p.w, Math.floor(p.h * 0.5), '#2a58b8'); Font.paint(p, 'AQUARIUM', Math.floor(p.w / 2 - 24), 12, '#ffffff'); p.rect(0, Math.floor(p.h * 0.66), p.w, p.h, '#b8b4a8'); };
  const bgPorch = (p) => { p.rect(0, 0, p.w, p.h, '#e4e0d4'); for (let y = 0; y < p.h; y += 5) p.rect(0, y, p.w, 1, '#c8c4b8'); p.rect(0, Math.floor(p.h * 0.7), p.w, p.h, '#8a6a4a'); p.rect(6, 6, 14, 18, '#8a5a34'); };

  function photos() {
    const W = 64, H = 48;
    const put = (p, set, x, y, sc, dir, f) => { const s = charPix(set, dir, f); if (!s) return; const r = s.resized(Math.round(s.w * sc), Math.round(s.h * sc)); p.blit(r, x - Math.round(r.w / 2), y - r.h); };

    // Summer festival 1991 — five kids, one of them Evan
    const festival = (variant) => {
      const p = photoBase(96, 64, (q) => { bgOutside(q); q.rect(8, 4, 80, 9, '#f4f0e0'); q.textCenter("SUMMER '91", 48, 4, '#c83a3a'); for (let x = 8; x < 88; x += 8) q.tri(x, 13, x + 8, 13, x + 4, 18, ['#c83a3a', '#3a6ab8', '#e8c040'][(x / 8) % 3]); });
      put(p, 'toby', 16, 60, 0.9); put(p, 'bea', 32, 60, 0.9); put(p, 'tommy', 64, 60, 0.9); put(p, 'dana', 80, 62, 0.8);
      if (variant === 'you') put(p, 'player', 48, 61, 0.9);
      else put(p, 'evan', 48, 60, 0.9);
      if (variant === 'scratched') scratch(p, 48, 32, 8, 5);
      return finishPhoto(p, { old: true });
    };
    add('ph_festival', festival('scratched'));
    add('ph_festival_clean', festival('clean'));
    add('ph_festival_you', festival('you'));

    // Vane family, 1987: Walter, Ruth, Evan holding a kitten — the authentic one
    add('ph_family', (() => {
      const p = photoBase(W, H, bgPorch);
      put(p, 'walter', 16, 47, 0.8); put(p, 'miller', 48, 46, 0.78, 's');
      put(p, 'evan', 32, 47, 0.7);
      p.ellipse(32, 36, 3, 2, '#e8943a'); p.set(30, 34, '#e8943a'); p.set(33, 34, '#e8943a');
      return finishPhoto(p, { old: true });
    })());
    // recolour Ruth: replace the lavender hair with brown in ph_family
    // (painted separately so Mrs. Miller doesn't appear in the family photo)
    Atlas.replace('ph_family', (() => {
      const p = photoBase(W, H, bgPorch);
      put(p, 'walter', 16, 47, 0.8);
      const ruth = Object.assign({}, CHAR_DEFS.miller, { hair: '#6a4a2a', glasses: false, top: '#4a8a9a', inner: '#f4f0e8', skirt: '#3a5a6a', skin: '#f0d0b0', eyes: 'lashes', iris: '#5a3a2a', brows: 'arched', browC: '#4a3020', noseStyle: 'small', mouth: 'smile', lips: '#c86a6a', extras: ['earrings'], earringC: '#e8e8f0', chain: null, blushC: null });
      const rp = Sprites.paintHuman(ruth, 's', 0).resized(25, 39); p.blit(rp, 48 - 12, 47 - 39);
      put(p, 'evan', 32, 47, 0.7);
      p.ellipse(32, 37, 3.5, 2.2, '#e8943a'); p.set(30, 35, '#e8943a'); p.set(34, 35, '#e8943a'); p.set(31, 36, '#111'); p.set(33, 36, '#111');
      return finishPhoto(p, { old: true });
    })());
    // the family photo, with whoever Walter wants in it
    add('ph_family_you', (() => {
      const p = photoBase(W, H, bgPorch);
      put(p, 'walter', 16, 47, 0.8);
      const ruth = Object.assign({}, CHAR_DEFS.miller, { hair: '#6a4a2a', glasses: false, top: '#4a8a9a', inner: '#f4f0e8', skirt: '#3a5a6a', skin: '#f0d0b0', eyes: 'lashes', iris: '#5a3a2a', brows: 'arched', browC: '#4a3020', noseStyle: 'small', mouth: 'smile', lips: '#c86a6a', extras: ['earrings'], earringC: '#e8e8f0', chain: null, blushC: null });
      const rp = Sprites.paintHuman(ruth, 's', 0).resized(25, 39); p.blit(rp, 48 - 12, 47 - 39);
      put(p, 'player', 32, 47, 0.72);
      p.ellipse(32, 38, 3.5, 2.2, '#e8943a'); p.set(30, 36, '#e8943a'); p.set(34, 36, '#e8943a');
      return finishPhoto(p, { old: true });
    })());
    const ruthDef = Object.assign({}, CHAR_DEFS.miller, { hair: '#6a4a2a', glasses: false, top: '#4a8a9a', inner: '#f4f0e8', skirt: '#3a5a6a', skin: '#f0d0b0', eyes: 'lashes', iris: '#5a3a2a', brows: 'arched', browC: '#4a3020', noseStyle: 'small', mouth: 'smile', lips: '#c86a6a', extras: ['earrings'], earringC: '#e8e8f0', chain: null, blushC: null });
    CHAR_DEFS.ruth = ruthDef;

    // Photo A: Walter and YOU in front of the aquarium
    add('ph_you_walter', (() => { const p = photoBase(W, H, bgAquarium); put(p, 'walter', 22, 47, 0.8); put(p, 'player', 42, 47, 0.85); return finishPhoto(p); })());
    // Photo C: Walter alone, a gap cut beside him
    add('ph_gap', (() => { const p = photoBase(W, H, bgAquarium); put(p, 'walter', 22, 47, 0.8); p.rect(34, 14, 18, 33, '#f4f0e8'); p.line(34, 14, 34, 46, '#c8c4b8'); return finishPhoto(p); })());
    // Walter and Marmalade
    add('ph_walter_cat', (() => {
      const p = photoBase(W, H, bgPorch); put(p, 'walter', 32, 47, 0.8);
      const cat = Atlas.get('cat_sit').pix; p.blit(cat, 36, 22);
      return finishPhoto(p);
    })());
    // Staff photo 1991
    add('ph_staff_1991', (() => {
      const p = photoBase(W, H, bgAquarium); put(p, 'walter', 14, 47, 0.75);
      const teen1 = Object.assign({}, CHAR_DEFS.dana, { hair: '#1a1414', top: '#2f8a8a' });
      const teen2 = Object.assign({}, CHAR_DEFS.tommy, { h: 44, hair: '#c8a060', top: '#2f8a8a', legH: 8, bodyH: 11 });
      p.blit(Sprites.paintHuman(teen1, 's', 0).resized(24, 37), 26 - 12, 47 - 37);
      p.blit(Sprites.paintHuman(teen2, 's', 0).resized(24, 37), 40 - 12, 47 - 37);
      put(p, 'evan', 54, 47, 0.7);
      p.rect(51, 33, 6, 3, '#2f8a8a');
      return finishPhoto(p, { old: true });
    })());
    // Evan's school portrait (and a version with you)
    const portrait = (set) => { const p = photoBase(40, 48, (q) => { q.rect(0, 0, 40, 48, '#7a9ac8'); for (let y = 0; y < 48; y += 2) q.rect(0, y, 40, 1, '#7494c2'); }); const s = charPix(set, 's', 0); p.blit(s.resized(38, 59), 1, 2); return finishPhoto(p, { old: set === 'evan' }); };
    add('ph_evan_school', portrait('evan'));
    add('ph_you_school', portrait('player'));
    // Employee of the month board photos
    add('ph_emp_kaylee', portrait('helmet_kaylee'));
    add('ph_emp_marcus', portrait('helmet_marcus'));
    add('ph_emp_blank', (() => { const p = new Pix(40, 48).fill('#d8d4c8'); p.textCenter('?', 20, 20, '#8a8a84'); return finishPhoto(p); })());
    add('ph_emp_you', portrait('player'));
    // A photo of the Kessler boys' treehouse (Toby & Evan)
    add('ph_boys', (() => { const p = photoBase(W, H, bgOutside); p.rect(38, 4, 6, 40, '#6a4a30'); p.rect(30, 8, 26, 12, '#8a6a4a'); put(p, 'toby', 18, 47, 0.75); put(p, 'evan', 32, 47, 0.75); return finishPhoto(p, { old: true }); })());
  }

  // ---------------------------------------------------------------- children's drawings (crayon)
  function crayonLine(p, rng, x0, y0, x1, y1, c) {
    const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3));
    let px = x0, py = y0;
    for (let i = 1; i <= n; i++) {
      const t = i / n, x = lerp(x0, x1, t) + (rng() - 0.5) * 1.5, y = lerp(y0, y1, t) + (rng() - 0.5) * 1.5;
      p.line(px, py, x, y, c); px = x; py = y;
    }
  }
  function stick(p, rng, x, y, s, c, o) {
    o = o || {};
    p.ring(x, y, 3 * s, 3 * s, c);
    crayonLine(p, rng, x, y + 3 * s, x, y + 9 * s, c);
    const hand = o.bigHands ? 4 * s : 0;
    crayonLine(p, rng, x - 4 * s, y + 5 * s, x + 4 * s, y + 5 * s, c);
    if (hand) { p.ellipse(x - 5 * s, y + 5 * s, hand, hand, c); p.ellipse(x + 5 * s, y + 5 * s, hand, hand, c); }
    crayonLine(p, rng, x, y + 9 * s, x - 3 * s, y + 14 * s, c); crayonLine(p, rng, x, y + 9 * s, x + 3 * s, y + 14 * s, c);
  }
  function drawings() {
    const paper = (w, h) => new Pix(w, h).fill('#f6f2e4');
    add('dr_cat', (() => { const p = paper(48, 36), r = makeRng(401); stick(p, r, 14, 8, 1, '#3a6ab8'); p.ellipse(32, 24, 7, 4, '#e8943a'); p.ellipse(26, 20, 3.5, 3, '#e8943a'); p.set(24, 17, '#e8943a'); p.set(28, 17, '#e8943a'); crayonLine(p, r, 39, 24, 44, 18, '#e8943a'); p.ellipse(40, 6, 4, 4, '#f0d040'); Font.paint(p, 'ME+MARM', 2, 26, '#c83a3a'); p.frame(0, 0, 48, 36, '#d8d0b8'); return p; })());
    add('dr_octopus', (() => { const p = paper(48, 36), r = makeRng(402); p.rect(2, 2, 44, 24, '#9ad0e8'); p.ellipse(28, 11, 7, 6, '#e8743a'); for (let i = 0; i < 5; i++) crayonLine(p, r, 23 + i * 2.5, 16, 20 + i * 4, 25, '#e8743a'); p.set(26, 10, '#111'); p.set(30, 10, '#111'); stick(p, r, 10, 8, 0.9, '#3a6ab8'); Font.paint(p, 'HE KNOWS', 1, 26, '#3a3a3a'); p.frame(0, 0, 48, 36, '#d8d0b8'); return p; })());
    add('dr_dad', (() => { const p = paper(48, 36), r = makeRng(403); stick(p, r, 16, 5, 1.5, '#5a3a2a', { bigHands: true }); stick(p, r, 36, 14, 0.8, '#3a6ab8'); Font.paint(p, 'DAD', 2, 26, '#5a3a2a'); Font.paint(p, 'ME', 30, 26, '#3a6ab8'); p.frame(0, 0, 48, 36, '#d8d0b8'); return p; })());
    add('dr_house', (() => {
      const p = paper(48, 36), r = makeRng(404);
      crayonLine(p, r, 6, 16, 24, 4, '#c83a3a'); crayonLine(p, r, 24, 4, 42, 16, '#c83a3a'); p.frame(8, 16, 32, 18, '#8a5a34');
      stick(p, r, 16, 18, 0.7, '#5a3a2a'); stick(p, r, 30, 20, 0.6, '#3a6ab8');
      stick(p, r, 38, 2, 0.5, '#e8c040'); p.ring(38, 0, 3, 1, '#e8c040'); // angel mom
      p.frame(0, 0, 48, 36, '#d8d0b8'); return p;
    })());
    add('dr_tank', (() => { const p = paper(48, 36), r = makeRng(405); p.frame(4, 4, 40, 24, '#3a3a3a'); p.rect(5, 5, 38, 22, '#2a4a7a'); stick(p, r, 24, 10, 0.8, '#f0f0f0'); Font.paint(p, 'TANK 6', 6, 27, '#3a3a3a'); p.frame(0, 0, 48, 36, '#d8d0b8'); return p; })());
    add('dr_fish', (() => { const p = paper(48, 36), r = makeRng(406); for (let i = 0; i < 4; i++) { const x = 8 + i * 10, y = 10 + (i % 2) * 10; p.ellipse(x, y, 4, 2.5, ['#e8743a', '#3a6ae0', '#f0d040', '#4ac08a'][i]); crayonLine(p, r, x - 4, y, x - 7, y - 2, '#555'); } Font.paint(p, 'FISH!!', 8, 26, '#3a6ab8'); p.frame(0, 0, 48, 36, '#d8d0b8'); return p; })());
  }

  // ---------------------------------------------------------------- item icons (16x16)
  function icons() {
    const I = (name, fn) => add('icon_' + name, P(16, 16, (p) => { fn(p); p.outline('#1a1420'); }));
    const paper = (p, c) => { p.rect(3, 1, 10, 14, c || '#f4f0dc'); for (let y = 4; y < 14; y += 2) p.rect(5, y, 6, 1, '#9aa4b8'); };
    const key = (p, c) => { p.ring(5, 5, 4, 4, c); p.rect(8, 5, 7, 2, c); p.rect(12, 7, 2, 3, c); p.rect(14, 7, 1, 2, c); };
    I('key_house', (p) => key(p, '#d8b848'));
    I('key_small', (p) => key(p, '#c8a040'));
    I('key_t6', (p) => { key(p, '#a8a8a0'); p.rect(0, 10, 7, 5, '#f4f0dc'); p.set(2, 12, '#2a2a2a'); p.set(4, 12, '#2a2a2a'); });
    I('key_garage', (p) => key(p, '#9a9aa0'));
    I('milk', (p) => { p.rect(4, 4, 8, 11, '#f8f8f4'); p.tri(4, 4, 12, 4, 8, 0, '#e8e8e4'); p.rect(4, 7, 8, 3, '#3a6ab8'); });
    I('trash', (p) => { p.ellipse(8, 10, 6, 5.5, '#2a2a2e'); p.rect(6, 2, 4, 4, '#2a2a2e'); p.set(8, 1, '#e8c040'); });
    I('badge', (p) => { p.rect(2, 3, 12, 10, '#f4f4f0'); p.rect(2, 3, 12, 3, '#2a58b8'); p.rect(4, 8, 3, 3, '#d9b85a'); p.rect(8, 8, 5, 1, '#555'); p.rect(8, 10, 4, 1, '#555'); });
    I('bucket', (p) => { p.tri(3, 5, 13, 5, 11, 15, '#9aa0a8'); p.tri(3, 5, 5, 15, 11, 15, '#9aa0a8'); p.ellipse(8, 5, 5, 2, '#c0c8d0'); p.set(6, 4, '#c8d8e0'); p.set(9, 4, '#c8d8e0'); p.ring(8, 5, 6, 5, '#6a6a6a'); });
    I('filter', (p) => { p.rect(3, 2, 10, 12, '#e8e8e0'); for (let y = 3; y < 14; y += 2) p.rect(4, y, 8, 1, '#b8c0c8'); });
    I('umbrella', (p) => { p.ellipse(8, 7, 7, 5, '#9a6ac8'); p.rect(0, 7, 16, 5, [0, 0, 0, 0]); p.rect(7, 7, 2, 7, '#6a4a2a'); p.ellipse(9, 14, 2, 1.5, '#e8c040'); });
    I('cookie', (p) => { p.ellipse(8, 8, 6, 6, '#c8944a'); p.set(6, 6, '#6a4a2a'); p.set(10, 7, '#6a4a2a'); p.set(7, 10, '#6a4a2a'); });
    I('newspaper', (p) => { p.rect(1, 3, 14, 11, '#e8e4d8'); p.rect(2, 4, 12, 2, '#2a2a2a'); p.rect(2, 7, 5, 5, '#8a8a8a'); for (let y = 7; y < 12; y += 2) p.rect(8, y, 6, 1, '#6a6a6a'); });
    I('lettuce', (p) => { p.ellipse(8, 9, 6, 5, '#6ab04a'); p.ellipse(8, 8, 4, 3, '#8ac86a'); p.line(8, 5, 8, 13, '#4a8a3a'); });
    I('sandwich', (p) => { p.tri(2, 13, 14, 13, 8, 3, '#f4e8c8'); p.line(3, 11, 13, 11, '#8a5a4a'); p.line(4, 10, 12, 10, '#6ab04a'); });
    I('tuna', (p) => { p.rect(2, 5, 12, 8, '#f4f0e8'); p.rect(2, 8, 12, 2, '#e8c070'); p.line(2, 5, 13, 12, '#d8d4c8'); });
    I('paycheck', (p) => { p.rect(1, 4, 14, 9, '#f4f0dc'); p.tri(1, 4, 15, 4, 8, 9, '#e0dcc8'); });
    I('poster', (p) => { paper(p, '#f8f8f4'); p.rect(5, 3, 6, 4, '#e8943a'); p.rect(4, 1, 8, 1, '#c83a3a'); });
    I('drawing', (p) => { p.rect(1, 3, 14, 11, '#f6f2e4'); p.ring(6, 7, 2, 2, '#3a6ab8'); p.ellipse(11, 10, 3, 2, '#e8943a'); });
    I('card', (p) => { p.rect(2, 2, 12, 12, '#e8c0d0'); p.tri(2, 2, 14, 2, 8, 7, '#d8a0b8'); p.ellipse(8, 10, 2, 2, '#c83a3a'); });
    I('brochure', (p) => { p.rect(2, 2, 12, 12, '#2a58b8'); p.rect(3, 4, 10, 2, '#f4e070'); p.ellipse(8, 10, 3, 2, '#e8743a'); p.rect(6, 1, 1, 14, '#1a3a8a'); });
    I('notebook', (p) => { p.rect(3, 1, 11, 14, '#3a6ab8'); p.rect(2, 2, 2, 12, '#c8c8c8'); p.rect(6, 4, 6, 3, '#f4f0dc'); });
    I('bulbs', (p) => { p.ellipse(5, 6, 3, 3.5, '#f8f0c0'); p.rect(4, 9, 3, 3, '#9a9a9a'); p.ellipse(11, 7, 3, 3.5, '#f8f0c0'); p.rect(10, 10, 3, 3, '#9a9a9a'); });
    I('doc', (p) => paper(p));
    I('doc_old', (p) => paper(p, '#e8dcb0'));
    I('receipt', (p) => { p.rect(4, 0, 8, 16, '#f4f4ee'); for (let y = 2; y < 14; y += 2) p.rect(5, y, 5, 1, '#8a8a8a'); p.rect(5, 13, 6, 1, '#2a2a2a'); });
    I('photo', (p) => { p.rect(1, 3, 14, 11, '#f4f0e4'); p.rect(2, 4, 12, 8, '#9ac8e8'); p.rect(2, 9, 12, 3, '#6a9a3c'); p.ring(8, 7, 1.5, 1.5, '#e8b894'); });
    I('photo_old', (p) => { p.rect(1, 3, 14, 11, '#e8dcc0'); p.rect(2, 4, 12, 8, '#b8a888'); p.ring(6, 7, 1.5, 1.5, '#6a5a4a'); p.ring(10, 7, 1.5, 1.5, '#6a5a4a'); });
    I('tape', (p) => { p.rect(1, 4, 14, 9, '#2a2a2e'); p.rect(3, 5, 10, 3, '#f4f0dc'); p.ring(5, 10, 1.5, 1.5, '#e8e8e8'); p.ring(11, 10, 1.5, 1.5, '#e8e8e8'); });
    I('recorder', (p) => { p.rect(2, 3, 12, 11, '#3a3a3e'); p.rect(3, 4, 7, 5, '#6a6a6a'); p.rect(11, 4, 2, 2, '#c83a3a'); for (let x = 3; x < 13; x += 3) p.rect(x, 11, 2, 2, '#8a8a8a'); });
    I('inhaler', (p) => { p.rect(5, 2, 5, 9, '#3a8ad0'); p.rect(4, 10, 8, 4, '#e8e8e8'); p.rect(10, 11, 3, 2, '#e8e8e8'); });
    I('backpack', (p) => { p.rect(3, 3, 10, 12, '#3a7ad0'); p.rect(5, 8, 6, 5, '#346ec0'); p.rect(5, 1, 6, 3, '#2a5aa8'); });
    I('collar', (p) => { p.ring(8, 7, 6, 5, '#c83a2a'); p.ring(8, 7, 5, 4, '#c83a2a'); p.ellipse(8, 13, 2, 2, '#e8c040'); });
    I('tooth', (p) => { p.ellipse(8, 6, 3.5, 3, '#f4f0e0'); p.rect(5, 7, 2, 5, '#f4f0e0'); p.rect(9, 7, 2, 4, '#f4f0e0'); });
    I('fabric', (p) => { p.tri(2, 3, 14, 5, 6, 14, '#ecece4'); for (let y = 4; y < 14; y += 3) p.line(2, y, 14, y + 1, '#3a6ab8'); p.map((c, x, y) => (x > 7 && y > 7 ? [120, 60, 50, 255] : null)); });
    I('shoe', (p) => { p.rect(1, 7, 13, 5, '#d83a32'); p.rect(1, 11, 14, 2, '#f4f4f0'); p.rect(2, 4, 6, 4, '#d83a32'); p.line(3, 6, 7, 6, '#f4f4f0'); });
    I('shell', (p) => { p.tri(8, 2, 1, 13, 15, 13, '#5a9ae0'); for (let x = 3; x < 14; x += 3) p.line(8, 3, x, 13, '#3a6ab8'); });
    I('fishcard', (p) => { p.rect(3, 1, 10, 14, '#f4f4f0'); p.rect(4, 2, 8, 8, '#3ab0c8'); p.ellipse(8, 6, 3, 2, '#e8743a'); p.rect(4, 11, 8, 1, '#555'); });
    I('ticket', (p) => { p.rect(1, 4, 14, 8, '#e8c040'); p.rect(4, 4, 1, 8, '#c8a030'); p.rect(6, 6, 7, 1, '#6a4a2a'); p.rect(6, 9, 5, 1, '#6a4a2a'); });
    I('mitten', (p) => { p.ellipse(8, 8, 5, 6, '#c83a3a'); p.ellipse(3, 8, 2, 3, '#c83a3a'); p.rect(4, 13, 8, 3, '#f4f4f0'); });
    I('sunglasses', (p) => { p.ellipse(4, 8, 3.5, 3, '#1a1a1a'); p.ellipse(12, 8, 3.5, 3, '#1a1a1a'); p.rect(7, 7, 2, 1, '#1a1a1a'); });
    I('fossil', (p) => { p.tri(8, 1, 2, 14, 14, 14, '#c8b890'); p.line(8, 3, 8, 13, '#8a7a5a'); });
    I('postcard', (p) => { p.rect(1, 3, 14, 10, '#f4f0e0'); p.rect(2, 4, 6, 8, '#2a58b8'); p.ellipse(5, 8, 2, 1, '#e8743a'); p.rect(10, 5, 3, 3, '#c83a3a'); });
    I('toy_octo', (p) => { p.ellipse(8, 6, 5, 4.5, '#8a4ac8'); for (let i = 0; i < 4; i++) p.line(4 + i * 2.5, 9, 3 + i * 3, 14, '#8a4ac8'); p.set(6, 6, '#111'); p.set(10, 6, '#111'); });
    I('schedule', (p) => { paper(p, '#e8e0c0'); p.rect(4, 2, 8, 2, '#8a3a2a'); });
    I('letter', (p) => { p.rect(1, 4, 14, 9, '#f4f0dc'); p.line(1, 4, 8, 9, '#b8b098'); p.line(15, 4, 8, 9, '#b8b098'); });
    I('recipe', (p) => { p.rect(1, 3, 14, 10, '#f4f0dc'); p.rect(1, 5, 14, 1, '#c83a3a'); for (let y = 7; y < 12; y += 2) p.rect(3, y, 9, 1, '#5a5a8a'); });
    I('vet', (p) => { paper(p); p.rect(4, 2, 3, 3, '#c83a3a'); p.rect(5, 1, 1, 5, '#c83a3a'); p.rect(3, 3, 5, 1, '#c83a3a'); });
    I('log', (p) => { p.rect(2, 1, 12, 14, '#2a4a2a'); p.rect(4, 3, 8, 4, '#e8e0c0'); });
    I('workorder', (p) => { paper(p, '#f0e0a0'); p.rect(4, 2, 8, 2, '#c83a2a'); });
    I('phonebill', (p) => { paper(p); p.rect(4, 2, 8, 2, '#3a5a8a'); });
    I('report', (p) => { paper(p); p.ellipse(11, 12, 2.5, 2.5, '#c8a040'); });
    I('lockcode', (p) => { p.rect(3, 6, 10, 9, '#8a8a90'); p.ring(8, 6, 4, 5, '#8a8a90'); p.rect(0, 0, 16, 5, [0, 0, 0, 0]); p.rect(5, 1, 6, 1, '#8a8a90'); });
  }

  // ---------------------------------------------------------------- touch pool residents (seen from above)
  function pool() {
    const star = (name, body, dark, spots) => add(name, P(16, 16, (p) => {
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + i * Math.PI * 2 / 5, b0 = a - 0.62, b1 = a + 0.62;
        p.tri(8 + Math.cos(a) * 7.4, 8 + Math.sin(a) * 7.4, 8 + Math.cos(b0) * 2.6, 8 + Math.sin(b0) * 2.6, 8 + Math.cos(b1) * 2.6, 8 + Math.sin(b1) * 2.6, body);
      }
      p.ellipse(8, 8, 2.6, 2.6, body);
      p.speckle(makeRng(name.length * 7), [spots], 0.12, 3, 3, 10, 10);
      p.outline(dark);
    }));
    star('tp_star_orange', '#e8743a', '#7a3010', '#f8b070');
    star('tp_star_purple', '#9a4ac0', '#3a1450', '#c890e0');
    add('tp_urchin', P(16, 16, (p) => {
      for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; p.line(8, 8, 8 + Math.cos(a) * 7, 8 + Math.sin(a) * 7, '#2a1030'); }
      p.ellipse(8, 8, 3.6, 3.6, '#4a1a5a'); p.set(7, 6, '#8a5a9a'); p.set(6, 7, '#8a5a9a');
    }));
    add('tp_anemone', P(16, 16, (p) => {
      p.ellipse(8, 8, 4.5, 4.5, '#c84a78');
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; p.ellipse(8 + Math.cos(a) * 5.4, 8 + Math.sin(a) * 5.4, 1.2, 1.2, '#f4a0c0'); }
      p.ellipse(8, 8, 1.8, 1.8, '#6a1a3a'); p.outline('#5a1a30');
    }));
    add('tp_snail', P(12, 12, (p) => {
      p.ellipse(6, 6, 4.5, 4.5, '#8a6a4a'); p.ring(6, 6, 3.2, 3.2, '#c8a878'); p.ring(6, 6, 1.6, 1.6, '#c8a878'); p.rect(9, 8, 3, 2, '#a89070'); p.outline('#3a2a1a');
    }));
    add('tp_pebbles', P(24, 16, (p) => {
      const r = makeRng(55);
      for (let i = 0; i < 9; i++) { const x = 3 + r() * 18, y = 3 + r() * 10, s = 1.2 + r() * 1.8; p.ellipse(x, y, s * 1.2, s, r.pick(['#8a8a82', '#a8a49a', '#6e6c66', '#c8c0b0'])); }
    }));
  }

  // ---------------------------------------------------------------- doormats: plain rugs at the way out, no text
  function mats() {
    const mat = (name, base, edge, weave, seed, o) => add(name, P(32, 16, (p) => {
      o = o || {};
      p.fill(base);
      for (let y = 3; y < 13; y++) for (let x = 3; x < 29; x++) if ((x + y) % 4 === 0) p.set(x, y, weave);
      p.speckle(makeRng(seed), [shade(base, 0.9), shade(base, 1.08)], 0.18, 2, 2, 28, 12);
      p.frame(0, 0, 32, 16, edge); p.frame(1, 1, 30, 14, shade(edge, 1.25));
      for (let x = 2; x < 30; x++) p.set(x, 14, shade(base, 0.7));
      if (o.worn) { p.ellipse(22, 9, 5, 3, shade(base, 0.82)); p.rect(26, 2, 4, 3, shade(base, 0.7)); }
    }));
    mat('mat_welcome', '#9a6a3e', '#5a3a1e', '#b88a58', 41);
    mat('mat_dirty', '#6e604a', '#3e3426', '#7e7058', 42, { worn: true });
    mat('mat_exit', '#4a4e5a', '#2a2c34', '#5e6474', 43);
  }

  function build() {
    windows(); signs(); props(); photos(); drawings(); icons(); pool(); mats();
    // things painted by the story at runtime can use sign() too
  }
  return { build, sign, paperNote, crayonLine };
})();
