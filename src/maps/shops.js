'use strict';
// ---------------------------------------------------------------------------
// Small interiors around town.
// ---------------------------------------------------------------------------

const shopCam = (extra) => Object.assign({ mode: 'follow', yaw: 0, pitch: 42, dist: 8.5, fov: 56, lookY: 0.8, ahead: 0.8 }, extra || {});

// ---------------------------------------------------------------- Mrs. Miller
MAPS.miller = {
  name: 'MILLER HOUSE',
  env: (st) => interiorEnv(st, { ambient: st.tod === 'night' ? [0.5, 0.46, 0.5] : [0.92, 0.88, 0.84] }),
  cam: shopCam({ pitch: 48, dist: 7.5 }),
  music(st) { return st.day >= 7 ? null : 'home'; },
  amb() { return ['room']; },
  build(M, st) {
    M.room(-6, -4, 6, 5, 3, { floor: 'carpet_green', wall: 'wall_green', trim: 'wood_dark' });
    M.light(0, 2.8, 0, 8, '#ffe0b0', 0.4);
    M.armchair(-3.2, -1.2, 's', 'fabric_grey'); M.armchair(1.2, -1.2, 's', 'fabric_grey');
    M.shelf(-4.6, -3.7, 1.8, 2.2, 's', 'bookshelf'); M.shelf(4.2, -3.7, 1.8, 2.2, 's', 'bookshelf');
    M.table(-1, 1, 1.0, 1.0, 0.5, 'wood_dark');
    M.look(-1, 1.8, 'A plate of oatmeal cookies under a little glass dome. And a newspaper crossword, finished in pen.', { r: 1.1 });
    M.decal('ph_family', -1, 1.5, -4, 0.7, 0.55, 's');
    M.look(-1, -3.2, (s) => s.flags.metEvan ? ['An old photo on the wall: Walter, Ruth, and Evan with a kitten. Mrs. Miller has the same photo Walter has.'] : ['A photo on the wall. A man and a woman and a little boy holding a kitten. The man looks like a younger Walter.'], { r: 1.3, y: 2 });
    M.decal('clock', 3, 2.1, -4, 0.5, 0.5, 's');
    M.cyl(4.8, 0, 3.8, 0.3, 0.1, 'plastic_blue', { sides: 8, solid: false });
    M.look(4.8, 3.2, (s) => s.day >= 4 ? 'A cat food bowl by the door. It\'s full. It has been full for days.' : 'A cat food bowl by the door. Licked clean.', { r: 1.0 });
    M.door(0, 5, 'n', { tex: 'door_wood', to: 'town', spawn: 'miller' });
    M.spawn('front', 0, 3.8, 'n');
  },
};

// ---------------------------------------------------------------- Hal's Diner
MAPS.diner = {
  name: "HAL'S DINER",
  env: (st) => interiorEnv(st, { ambient: st.day >= 8 ? [0.6, 0.62, 0.66] : [0.98, 0.94, 0.9] }),
  cam: shopCam(),
  music(st) { return st.day >= 8 ? null : st.day === 7 ? null : 'diner'; },
  amb(st) { return st.day >= 8 ? ['buzz'] : ['room']; },
  build(M, st) {
    const mem = st.day >= 8;
    M.room(-8, -6, 8, 6, 3.2, { floor: 'lino_checker', wall: 'wall_white', trim: 'plastic_red' });
    M.light(-3, 3, 0, 8, '#fff4e0', 0.5); M.light(4, 3, 0, 8, '#fff4e0', 0.5);
    M.counter(0, -3.6, 10, 1, 1.1, { top: 'chrome', side: 'plastic_red' });
    for (let x = -4; x <= 4; x += 2) M.stool(x, -2.4);
    M.decal('menu_board', -2, 1.6, -6, 2.4, 1.2, 's');
    M.cyl(4, 1.1, -3.6, 0.35, 0.4, 'glass', { sides: 6, solid: false });
    M.look(4, -2.5, (s) => s.day >= 8 ? 'The pie case. There\'s one slice left, with a bite taken out of it.' : 'The pie case. Peach, cherry, and something that might be rhubarb.', { r: 1 });
    // booths
    for (const z of [-1.5, 1.5, 4.2]) {
      M.table(-6.6, z, 1.2, 1.2, 0.8, 'plastic_red'); M.box(-7.6, 0, z, 0.6, 0.5, 1.4, 'fabric_red', { solid: false });
      M.table(6.6, z, 1.2, 1.2, 0.8, 'plastic_red'); M.box(7.6, 0, z, 0.6, 0.5, 1.4, 'fabric_red', { solid: false });
    }
    M.decal('jukebox', 7.95, 0, -4.8, 1.0, 1.6, 'w');
    M.box(7.6, 0, -4.8, 0.7, 1.6, 1.0, 'plastic_red', { top: true });
    M.inter(7.0, -4.8, { r: 1.2, y: 1.8, use: async (S) => Story.jukebox(S) });
    M.pickup(6.9, -3.6, 'fc8', { y: 0.02 });
    // the old photograph
    const ph = mem ? (st.flags.photoHung === 'family' ? 'ph_festival_clean' : 'ph_festival_you') : 'ph_festival';
    M.decal(ph, -5.5, 1.3, -6, 1.5, 1.0, 's');
    M.look(-5.5, -5.2, (s) => Story.festivalPhoto(s), { r: 1.2, y: 2.4 });
    M.door(0, 6, 'n', { tex: 'door_glass', to: 'town', spawn: 'diner' });
    M.spawn('front', 0, 4.8, 'n');
  },
};

// ---------------------------------------------------------------- Bellwood Market
MAPS.market = {
  name: 'BELLWOOD MARKET',
  env: (st) => interiorEnv(st, { ambient: [1.0, 1.0, 0.96] }),
  cam: shopCam(),
  music() { return 'town'; },
  amb() { return ['buzz']; },
  build(M, st) {
    M.room(-9, -8, 9, 6, 3.4, { floor: 'tile_white', wall: 'wall_white', trim: 'plastic_green' });
    M.light(0, 3.2, -2, 12, '#f0fff0', 0.5);
    for (const x of [-5, 0]) { M.shelf(x, -3.5, 3, 1.8, 's', 'shelf_goods'); M.shelf(x, -2.9, 3, 1.8, 'n', 'shelf_goods'); }
    M.look(-5, -1.9, 'Cereal, soup, a whole shelf of sardines.', { r: 1.4 });
    M.look(0, -1.9, 'Bread, peanut butter, instant coffee. Everything is a little dusty on top.', { r: 1.4 });
    M.box(7.8, 0, -3, 1.2, 2.0, 6, { sides: 'plastic_white', w: '@shelf_milk' }, { fit: { w: true } });
    M.inter(6.8, -3, { r: 1.6, y: 1.8, use: async (S) => Story.milkCooler(S) });
    M.counter(-5, 3.2, 3, 1, 1.0, { top: 'rubber', side: 'plastic_green' });
    M.decal('sign_register', -5, 2.2, -8, 1.4, 0.5, 's');
    M.counter(4, -7, 4, 1, 1.1, { top: 'chrome', side: 'plastic_white' });
    M.decal('sign_deli', 4, 2.2, -8, 1.2, 0.5, 's');
    M.decal('bulletin', -8.97, 1.2, 0, 1.6, 1.0, 'e');
    if (st.day >= 4 && st.day <= 7) M.decal('poster_cat_small', -8.95, 1.35, 0.5, 0.35, 0.45, 'e');
    M.look(-8.3, 0, (s) => s.day >= 4 && s.day <= 7 ? ['A bulletin board. BAKE SALE SAT. LOST: RED MITTEN. PIANO LESSONS.', 'Pinned over all of it: MISSING - MARMALADE.'] : 'A bulletin board. BAKE SALE SAT. LOST: RED MITTEN. PIANO LESSONS.', { r: 1.2, y: 2 });
    M.door(0, 6, 'n', { tex: 'door_glass', to: 'town', spawn: 'market' });
    M.spawn('front', 0, 4.8, 'n');
  },
};

// ---------------------------------------------------------------- Gus's Gas & Service (shop + garage)
MAPS.gas = {
  name: "GUS'S",
  env: (st) => interiorEnv(st, { ambient: [0.9, 0.9, 0.86] }),
  cam: shopCam({ pitch: 46, dist: 7.5 }),
  music(st) { return st.day >= 7 ? null : 'town'; },
  amb() { return ['buzz']; },
  build(M, st) {
    M.room(-5, -4, 3, 4, 3, { floor: 'tile_grey', wall: 'wall_white', gaps: [{ side: 'e', at: 0, w: 1.6, h: 2.4 }] });
    M.light(-1, 2.8, 0, 7, '#f8f8ff', 0.5);
    M.counter(-2.5, -2.4, 3, 1, 1.0, { top: 'rubber', side: 'plastic_red' });
    M.shelf(-4.5, 2.2, 1.6, 1.6, 'e', 'shelf_goods');
    M.look(-3.9, 2.2, 'Motor oil, beef jerky, air fresheners shaped like pine trees.', { r: 1.1 });
    M.decal('calendar', -1, 1.5, -4, 0.5, 0.6, 's');
    // garage (east)
    M.room(3, -6, 15, 6, 4, { floor: 'concrete_dark', wall: 'concrete', gaps: [{ side: 'w', at: 0, w: 1.6, h: 2.4 }] });
    M.light(9, 3.6, 0, 10, '#e8e8d8', 0.5);
    const locked = !st.flags.garageOpen;
    if (locked) { M.door(3, 0, 'e', { tex: 'door_metal', w: 1.4, locked: true, lockedMsg: (s) => Story.garageInnerMsg(s) }); M.solid(2.8, -0.9, 3.2, 0.9); }
    M.car(9.5, -0.5, 'n', 'plastic_orange');
    M.look(8.4, 1.8, (s) => Story.oldCar(s), { r: 1.6 });
    M.inter(10.7, -1.2, { r: 1.1, y: 1.2, use: async (S) => Story.glovebox(S) });
    M.inter(9.5, 2.8, { r: 1.2, y: 1.0, use: async (S) => Story.trunk(S) });
    M.box(13.5, 0, -4.5, 2, 1, 1, 'metal');
    M.look(13.5, -3.5, 'A workbench. Wrenches hung on a pegboard, each one outlined in marker so you\'d know if one was missing.', { r: 1.2 });
    M.decal('door_garage', 9, 0, 6, 5, 3.5, 'n');
    M.door(-1, 4, 'n', { tex: 'door_glass', to: 'town', spawn: 'gas' });
    M.spawn('front', -1, 2.8, 'n');
    M.spawn('garage', 9, 4.5, 'n');
  },
};

// ---------------------------------------------------------------- SUDS Laundromat
MAPS.laundry = {
  name: 'SUDS',
  env: (st) => interiorEnv(st, { ambient: [0.96, 1.0, 1.0] }),
  cam: shopCam(),
  music() { return null; },
  amb() { return ['hum', 'buzz']; },
  build(M, st) {
    M.room(-7, -5, 7, 5, 3, { floor: 'tile_mint', wall: 'wall_mint', trim: 'wall_white' });
    M.light(0, 2.8, 0, 9, '#f0ffff', 0.5);
    for (let x = -6; x <= 1; x += 0.9) M.washer(x, -4.4, 's', x > -2);
    M.look(-3, -3.6, 'Washers and dryers. One of the dryers is turning with nothing in it.', { r: 1.6 });
    M.table(3.8, -3, 2.6, 1.2, 0.9, 'plastic_white');
    M.decal('sign_laundry', 6.97, 1.3, -1, 1.2, 1.0, 'w');
    M.box(5.8, 0, 2.8, 1.0, 0.7, 0.8, 'cardboard');
    M.decal('sign_lostfound', 5.8, 0.72, 3.21, 0.8, 0.4, 's', { off: 0.02 });
    M.inter(5.8, 3.6, { r: 1.2, y: 1.2, use: async (S) => Story.laundryLostFound(S) });
    M.chair(-4, 2.8, 'n', 'plastic_orange'); M.chair(-3, 2.8, 'n', 'plastic_orange');
    M.door(0, 5, 'n', { tex: 'door_glass', to: 'town', spawn: 'laundry' });
    M.spawn('front', 0, 3.8, 'n');
  },
};

// ---------------------------------------------------------------- Bellwood Community Church
MAPS.church = {
  name: 'CHURCH',
  env: (st) => interiorEnv(st, { ambient: [0.78, 0.74, 0.7] }),
  cam: shopCam({ pitch: 34, dist: 10 }),
  music() { return 'church'; },
  amb() { return ['room']; },
  build(M, st) {
    M.room(-6, -14, 6, 6, 5, { floor: 'wood_floor_dark', wall: 'stone', trim: 'wood_dark' });
    M.floor(-1, -14, 1, 6, 'carpet_red', { y: 0.02, tile: 2 });
    M.light(0, 4, -10, 10, '#ffd8a0', 0.6); M.light(0, 4, 0, 10, '#ffe0c0', 0.3);
    for (let z = -8; z <= 3; z += 1.6) { M.pew(-3.5, z, 4, 'n'); M.pew(3.5, z, 4, 'n'); }
    M.box(0, 0, -12.5, 3, 1.1, 1.2, 'wood_dark');
    M.look(0, -11.3, 'The altar. A white cloth, two candles, and a Bible held open with a rock.', { r: 1.6 });
    M.decal('win_church', -5.95, 1.6, -6, 1.2, 2.6, 'e'); M.decal('win_church', 5.95, 1.6, -6, 1.2, 2.6, 'w');
    M.decal('win_church', -5.95, 1.6, 0, 1.2, 2.6, 'e'); M.decal('win_church', 5.95, 1.6, 0, 1.2, 2.6, 'w');
    M.decal('hymn_board', 4, 1.6, -14, 0.8, 1.0, 's');
    M.decal('memorial_board', -4, 1.2, -14, 1.6, 1.3, 's');
    M.look(-4, -13.2, (s) => Story.memorialBoard(s), { r: 1.3, y: 2.6 });
    M.box(-4.8, 0, -10, 0.8, 0.9, 0.5, 'wood_dark');
    M.look(-4.8, -9.3, (s) => Story.candles(s), { r: 1.1 });
    M.door(0, 6, 'n', { tex: 'door_red', w: 2, to: 'town', spawn: 'church' });
    M.spawn('front', 0, 4.8, 'n');
  },
};

// ---------------------------------------------------------------- the Kessler house (abandoned)
MAPS.kessler = {
  name: '9 MAPLE ST',
  env: (st) => interiorEnv(st, { ambient: [0.55, 0.55, 0.58], extra: { sat: 0.6 } }),
  cam: shopCam({ pitch: 50, dist: 7.5 }),
  music() { return null; },
  amb() { return ['wind', 'drips']; },
  build(M, st) {
    M.room(-6, -3, 6, 5, 3, { floor: 'wood_floor_dark', wall: 'wallpaper_green', gaps: [{ side: 'n', at: 3.5, w: 1.6, h: 2.4 }], trim: 'wood_dark' });
    M.light(0, 2.6, 1, 7, '#c8c0b0', 0.3);
    // furniture under sheets
    M.box(-3, 0, 0, 2.6, 0.9, 1.1, 'sheet'); M.box(2, 0, 1.5, 1.2, 1.0, 1.2, 'sheet'); M.box(-4.8, 0, 3.5, 1.0, 1.8, 0.8, 'sheet');
    M.look(-3, 1, 'Furniture under white sheets. It looks like people sitting very still.', { r: 1.6 });
    M.floorDecal('stain', 1, 3, 2, 1.2, { y: 0.02, blend: true });
    M.decal('win_board', -3, 1.0, 5, 1.3, 1.5, 'n');
    // Toby's room
    M.room(1.5, -10, 6, -3, 3, { floor: 'carpet_blue', wall: 'wall_cream', gaps: [{ side: 's', at: 3.5, w: 1.6, h: 2.4 }] });
    M.bed(4.8, -8.3, 's', { blanket: 'blanket_plain' });
    M.inter(4.8, -7, { r: 1.3, y: 1, use: async (S) => Story.tobyBed(S) });
    M.desk(2.6, -9.4, 's', 1.4, 'wood_light');
    M.inter(2.6, -8.4, { r: 1.2, y: 1.4, use: async (S) => Story.tobyDesk(S) });
    M.decal('ph_boys', 3.8, 1.5, -10, 0.8, 0.6, 's');
    M.look(3.8, -9.2, 'A photo tacked over the desk: two boys in front of a treehouse. One of them is Evan.', { r: 1.0, y: 2.2 });
    M.cam(1.5, -10, 6, -3, shopCam({ pitch: 55, dist: 6, clamp: [1.8, -10, 5.7, -3.4] }));
    M.door(0, 5, 'n', { tex: 'door_old', to: 'town', spawn: 'kessler' });
    M.spawn('front', 0, 3.8, 'n');
  },
};
