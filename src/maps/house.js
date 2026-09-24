'use strict';
// ---------------------------------------------------------------------------
// 12 MAPLE STREET — your new house. It used to be the Vanes'.
// ---------------------------------------------------------------------------

function interiorEnv(st, o) {
  o = o || {};
  const night = st.tod === 'night';
  const eve = st.tod === 'evening';
  let amb = o.ambient || (night ? [0.5, 0.5, 0.62] : eve ? [0.85, 0.78, 0.72] : [0.95, 0.94, 0.9]);
  const env = { fog: o.fog || '#000000', fogNear: o.fogNear || 30, fogFar: o.fogFar || 70, ambient: amb, clear: o.clear || '#000000', sub: o.sub || 2 };
  if (st.day >= 8) { env.sat = night ? 0.5 : 0.6; if (night) { env.snap = 1.5; env.affine = 1; } }
  if (st.day === 7 && !night) env.sat = 0.75;
  return Object.assign(env, o.extra || {});
}

MAPS.house = {
  name: '12 MAPLE ST',
  env: (st) => interiorEnv(st, st.day >= 8 && st.tod === 'night' ? { ambient: [0.22, 0.22, 0.3] } : {}),
  cam: { mode: 'follow', yaw: 0, pitch: 52, dist: 7.5, fov: 55, lookY: 0.6, ahead: 0.6, lag: 6 },
  music(st) { return Story.houseMusic(st); },
  amb(st) { return st.tod === 'night' ? ['room'] : ['room', 'birds']; },
  build(M, st) {
    const d = st.day, f = st.flags, night = st.tod === 'night';
    const late = d >= 8, lnight = late && night;
    const H = 3.0;
    const paper = late ? 'wallpaper_green' : 'wallpaper_floral';
    // --- living room
    M.room(-7, 0, 7, 9, H, { floor: 'wood_floor', wall: { n: paper, s: paper, e: paper, w: paper }, gaps: [{ side: 'n', at: -4.5, w: 3, h: H }, { side: 'n', at: 0, w: 3, h: H }], trim: 'wood_dark' });
    // --- kitchen
    M.room(-7, -8, -2, 0, H, { floor: 'lino_green', wall: 'wall_yellow', gaps: [{ side: 's', at: -4.5, w: 3, h: H }] });
    // --- hallway
    M.floor(-2, -9, 2, 0, 'wood_floor', { tile: 2 });
    M.wall(-2, -9, 2, -9, H, 'wall_cream', { face: 's', solid: true });
    M.wall(2, -9, 2, -6, H, 'wall_cream', { face: 'w', solid: true }); M.wall(2, -3.6, 2, 0, H, 'wall_cream', { face: 'w', solid: true });
    M.wall(-2, -9, -2, 0, H, 'wall_cream', { face: 'e', solid: true });
    // --- your bedroom
    M.room(2, -8, 7, 0, H, { floor: 'carpet_beige', wall: 'wall_mint', gaps: [{ side: 'w', at: -4.8, w: 2.4, h: 2.4 }], trim: 'wood_dark' });

    // lights
    M.light(0, 2.8, 4.5, 8, night ? '#ffd8a0' : '#fff0d8', night ? 0.7 : 0.3);
    M.light(-4.5, 2.8, -4, 6, '#fff4d8', night ? 0.6 : 0.25);
    M.light(4.5, 2.8, -4, 6, '#ffe0b0', night ? 0.6 : 0.25);
    if (lnight) M.light(0, 2.5, -8, 5, '#6070c0', 0.6);

    // --- living room furniture
    M.couch(-1.5, 3.5, 3.2, 'e', 'fabric_green');
    M.armchair(-4.8, 6.8, 'e', 'fabric_grey');
    M.tvStand(6.3, 3.8, 'w', night && !late ? 'tv_title' : lnight ? 'tv_you' : 'tv_front');
    M.look(5.6, 3.8, (s) => Story.houseTV(s), { r: 1.2 });
    M.floorDecal('rug_round', 2.6, 4, 3.2, 3.2, { y: 0.02 });
    M.shelf(-6.7, 2, 1.8, 2.2, 'e', late ? 'bookshelf_empty' : 'bookshelf');
    M.look(-6.2, 2, (s) => s.day >= 8 ? 'The shelf is empty. There\'s a clean rectangle in the dust where each book used to be.' : 'Your books. You put them in the order you had them before. It doesn\'t look right here.', { r: 1.2 });
    M.decal('radiator', -6.95, 0.2, 7.2, 1.8, 0.9, 'e');
    M.pickup(-6.5, 7.2, 'postcard', { hidden: true, r: 1.1, cond: (s) => s.day >= 2, text: 'Something is wedged behind the radiator. You work it free.' });
    M.look(-6.5, 7.2, 'An old radiator. It clanks when nobody\'s touching it.', { r: 1.1, cond: (s) => s.day < 2 || s.found.postcard });
    M.decal('fireplace', 6.97, 0, 6.8, 1.9, 1.9, 'w');
    M.box(6.6, 0, 6.8, 0.8, 0.12, 2.0, 'brick', { solid: true });
    M.pickup(6.2, 6.8, 'burned_photo', { hidden: true, secret: true, r: 1.1, cond: (s) => s.day >= 5, text: 'In the ashes at the back of the fireplace, something didn\'t finish burning.' });
    M.look(6.2, 6.8, (s) => s.day >= 8 ? 'The fireplace. The ashes are warm.' : 'An old brick fireplace. It hasn\'t been used in years. The ashes are still in it.', { r: 1.1, cond: (s) => s.day < 5 || s.inv.includes('burned_photo') });
    M.decal('clock', 3.2, 2.1, 0, 0.5, 0.5, 's');
    M.look(3.2, 0.6, (s) => s.day >= 8 ? 'The clock says 10:12. It has always said 10:12.' : 'A clock. It\'s a little slow.', { r: 1, y: 2.4 });
    // the empty nail
    const photo = f.photoHung;
    if (f.version) M.decal('ph_family_you', 5.2, 1.4, 0, 1.2, 0.9, 's');
    else if (photo) M.decal(photo === 'you' ? 'ph_you_walter' : photo === 'family' ? 'ph_family' : 'ph_gap', 5.2, 1.4, 0, 1.2, 0.9, 's');
    else if (f.deathPhoto) M.decal('ph_you_walter', 5.2, 1.4, 0, 1.2, 0.9, 's');
    else M.decal('nail', 5.2, 1.9, 0, 0.12, 0.12, 's');
    M.inter(5.2, 0.7, { r: 1.2, y: 2.2, use: async (S) => Story.houseNail(S) });
    // moving boxes (day 1)
    const boxes = [['box1', -3.8, 6.6], ['box2', 1.6, 7.2], ['box3', 4.5, 1.4]];
    for (const [id, x, z] of boxes) {
      if (f['unpacked_' + id]) continue;
      M.movingBox(x, z, 0.8, 0.3);
      M.inter(x, z, { r: 1.2, y: 1.1, use: async (S) => Story.unpack(S, id) });
    }
    // children's drawings appear on the walls on the last day
    if (late) {
      M.decal('dr_octopus', -3, 1.2, 0, 0.9, 0.7, 's');
      M.decal('dr_fish', -5.5, 1.4, 0, 0.9, 0.7, 's');
      M.decal('dr_house', 6.95, 1.5, 7, 0.9, 0.7, 'w');
      M.look(-3, 0.8, 'Children\'s drawings, taped up at a kid\'s height. You didn\'t put these here.', { r: 1.3 });
    }
    // front door
    M.door(0, 9, 'n', { tex: 'door_wood', w: 1.4, to: 'town', use: async (S) => Story.houseFrontDoor(S) });

    // --- kitchen
    M.fridge(-6.4, -7.1, 's');
    M.inter(-6.4, -6.2, { r: 1.2, y: 1.8, use: async (S) => Story.fridge(S) });
    M.stove(-5.2, -7.5, 's');
    M.sink(-4.2, -7.5, 's');
    M.cabinets(-3, -7.5, 1.2, 's');
    M.look(-4.2, -6.7, (s) => s.day >= 8 ? 'The sink. The tap drips once every time you look away.' : 'The sink. The water comes out brown for a second, then clear.', { r: 1 });
    M.table(-4.5, -3.3, 1.6, 1.1, 0.8, 'wood');
    M.chair(-4.5, -2.3, 'n'); M.chair(-4.5, -4.4, 's');
    // basement door (stuck)
    M.door(-7, -4.5, 'e', { tex: 'door_old', to: 'basement', use: async (S) => Story.basementDoor(S) });
    M.decal('phone_wall', -2.05, 1.2, -6.5, 0.4, 0.7, 'e');
    M.inter(-2.6, -6.5, { r: 1.1, y: 1.8, cond: () => !Story.phoneRinging, use: async (S) => Story.phone(S, false) });
    M.inter(-2.6, -6.5, { r: 1.3, y: 1.8, cond: () => !!Story.phoneRinging, use: async (S) => Story.phone(S, true) });
    // trash bag appears after unpacking
    if (f.trashReady && !f.trashOut && !st.inv.includes('trash')) {
      M.box(-2.6, 0, -1, 0.6, 0.7, 0.6, 'rubber', { solid: false });
      M.inter(-2.6, -1, { r: 1.1, y: 1, use: async (S) => { await S.give('trash'); S.reload(); } });
    }

    // --- hallway
    M.decal('mirror', 1.98, 0.9, -1.8, 0.7, 1.1, 'w');
    M.box(-1.2, 2.2, -5, 0.04, 0.8, 0.04, 'rubber', { solid: false });
    M.look(-1.2, -5, (s) => s.day >= 8 && s.tod === 'night' ? ['The attic hatch is open. It\'s very dark up there.', 'Someone is sitting in the dark, very still, with their knees pulled up. It\'s a pile of boxes. It\'s only a pile of boxes.'] : s.day >= 6 ? ['A cord hangs from the ceiling: the attic hatch. It\'s painted shut.', 'Tonight, the cord is swaying a little. There\'s no draft.'] : ['A cord hangs from the ceiling: the attic hatch. It\'s painted shut.'], { r: 1.0, y: 2.8 });
    M.look(1.4, -1.8, (s) => (s.day >= 8 && s.tod === 'night') ? 'In the mirror, the hallway is shorter.' : 'A mirror. The helmet takes up most of it.', { r: 1 });
    M.door(0, -9, 's', { tex: 'door_evan', w: 1.3, to: 'evanroom', use: async (S) => Story.evanDoor(S) });
    if (d >= 4 && !f.tookDrawingCat && !st.found.drawing_cat) {
      M.floorDecal('dr_cat', 0, -8.4, 0.7, 0.5, { y: 0.03 });
    }
    if (d >= 4) M.pickup(0, -8.4, 'drawing_cat', { hidden: true, r: 1, text: 'A piece of paper has been pushed out from under the locked door.', after: async (S) => { await S.inspect('drawing_cat'); } });

    // --- bedroom
    M.bed(5.8, -6.4, 's', { blanket: 'blanket_plain' });
    M.inter(5.8, -5, { r: 1.5, y: 1.2, use: async (S) => Story.bed(S) });
    M.box(3, 0, -7.6, 1.2, 1.0, 0.6, { sides: 'wood', s: '@drawers_front' }, { fit: { s: true } });
    M.lamp(2.6, -1, 1.5, night);
    M.decal(night ? 'win_dark' : 'win_house', 6.95, 1.0, -3.5, 1.3, 1.5, 'w');
    M.look(6.4, -3.5, (s) => Story.bedroomWindow(s), { r: 1.2 });
    if (!f.unpacked_box3 && d === 1) M.movingBox(4.2, -2, 0.7, 0.4);

    // cameras
    M.cam(-2, -9, 2, -3.2, { mode: 'fixed', pos: [0, 1.3, 1.8], look: [0, 1.0, -8], fov: 60 });
    M.cam(2, -8, 7, 0, { mode: 'follow', yaw: 0, pitch: 55, dist: 6.5, fov: 55, lookY: 0.5, ahead: 0.3 });
    if (lnight) M.cam(-7, 0, 7, 9, { mode: 'track', pos: [6.6, 2.9, 8.6], lookY: 0.5, fov: 60 });

    M.spawn('front', 0, 7.8, 'n');
    M.spawn('bed', 4.2, -4.8, 'w');
    M.spawn('evan', 0, -7.9, 's');
    M.spawn('basement', -6.2, -4.5, 'e');
  },
};

// ---------------------------------------------------------------------------
// EVAN'S ROOM — kept "just how he left it". The camera is up in the corner.
// ---------------------------------------------------------------------------
MAPS.evanroom = {
  name: "EVAN'S ROOM",
  env: (st) => interiorEnv(st, { ambient: st.tod === 'night' ? [0.42, 0.44, 0.62] : [0.8, 0.8, 0.86] }),
  cam: { mode: 'fixed', pos: [3.1, 2.75, -2.7], look: [-1.2, 0.3, 1.4], fov: 64 },
  music() { return null; },
  amb(st) { return st.flags.ghostMet ? ['hum'] : ['room']; },
  build(M, st) {
    const f = st.flags, d = st.day;
    M.room(-3.5, -3, 3.5, 3, 2.9, { floor: 'carpet_blue', wall: 'wallpaper_evan', trim: 'wood_dark' });
    M.light(0, 2.6, 0, 6, st.tod === 'night' ? '#8090d0' : '#fff0d0', 0.5);
    // bed along the west wall, head to the north
    M.bed(-2.7, -1.2, 's', { blanket: 'blanket_fish' });
    M.inter(-1.8, -0.2, { r: 1.4, y: 1, use: async (S) => Story.evanBed(S) });
    if (f.backpackPlaced) M.cutout('backpack_flat', -2.7, -0.6, 0.6, 0.75, 'e', { y: 0.46 });
    // desk against the south wall, facing the room (and the camera)
    M.desk(1.4, 2.55, 'n', 1.6, 'wood_light');
    M.chair(1.4, 1.7, 's');
    const photoReg = f.backpackPlaced || d >= 8 ? 'ph_you_school' : 'ph_evan_school';
    M.decal(photoReg, 0.9, 0.78, 2.62, 0.35, 0.42, 'n', { off: 0.02 });
    M.look(0.9, 1.6, (s) => Story.evanPhoto(s), { r: 1.0, y: 1.5 });
    if (d >= 8 && !f.photoTaken) {
      M.decal('ph_you_walter', 1.5, 0.78, 2.3, 0.4, 0.3, 'n', { off: 0 }); M.decal('ph_family', 1.95, 0.78, 2.3, 0.4, 0.3, 'n', { off: 0 }); M.decal('ph_gap', 2.25, 0.78, 2.5, 0.4, 0.3, 'n', { off: 0 });
      M.inter(1.9, 1.5, { r: 1.2, y: 1.4, use: async (S) => Story.photoChoice(S) });
    }
    // fish tank on the west wall
    M.box(-3.1, 0, 1.6, 0.5, 0.75, 1.4, 'wood_light');
    M.decal(d >= 8 ? 'fish_tank_small_full' : 'fish_tank_small', -3.3, 0.75, 1.6, 1.2, 0.8, 'e');
    M.look(-2.4, 1.6, (s) => s.day >= 8 ? 'A fish tank. There is water in it now, and two small fish. They are swimming very carefully.' : 'A small fish tank. It\'s dry. A little plastic diver is lying on his side in the gravel.', { r: 1.1 });
    M.decal('poster_octopus', -3.45, 1.2, -0.6, 1.1, 1.0, 'e');
    M.decal('dr_octopus', -1.2, 1.3, 2.97, 0.9, 0.7, 'n');
    M.decal('dr_fish', 2.8, 1.5, 2.97, 0.9, 0.7, 'n');
    M.decal('calendar', -3.45, 1.4, 2.5, 0.5, 0.6, 'e');
    M.look(-2.9, 2.5, 'A calendar: AUGUST 1991. The 12th says MY BIRTHDAY!!! The 14th has a little octopus drawn on it.', { r: 1.0, y: 2 });
    M.floorDecal('rug_fish', 0.4, 0.2, 2.4, 1.8, { y: 0.02 });
    // toy box
    M.box(2.8, 0, -1.2, 0.8, 0.6, 1.0, { top: 'plastic_red', sides: 'plastic_blue' });
    M.look(2.2, -1.2, (s) => s.day >= 8 ? ['A toy box. Inside: a walkie-talkie. It\'s switched on.', 'Static. Then, very quietly: "...Toby? Are you there? Over."', 'Then nothing.'] : 'A toy box. Action figures, a slinky, half a walkie-talkie set.', { r: 1.1 });
    // closet
    M.decal('flat_door', -2.4, 0, 2.97, 1.1, 2.1, 'n');
    M.look(-2.4, 2.2, (s) => s.day >= 8 ? ['The closet. Clothes for an eleven year old. Striped shirts.', 'One of them has a sleeve torn off.'] : ['The closet. Clothes, all neatly folded. Somebody refolded them recently.', 'A lot of striped shirts.'], { r: 1.0 });
    M.door(0.1, 3, 'n', { tex: 'door_int', w: 1.2, to: 'house', use: async (S) => Story.leaveEvanRoom(S) });
    M.spawn('front', 0.1, 2.0, 'n');
  },
};
