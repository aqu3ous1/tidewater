'use strict';
// ---------------------------------------------------------------------------
// THE BELLWOOD AQUARIUM - UPPER LEVEL
//   landing -26..-20 x -8..2   (stairs back down to the lobby)
//   upper hall -20..20 x -8..-4; north of it: theater, learning room, jellies;
//   south of it: kelp tunnel, balcony over the main hall
//   staff side (east, locked until hired) 20..40: tank tops, projection booth,
//   the cot room, the dome ladder. The dome itself sits apart, up the ladder.
//   Only on the ghost night: a door at the end of the staff corridor.
// ---------------------------------------------------------------------------

MAPS.aq2 = {
  name: 'BELLWOOD AQUARIUM - UPPER LEVEL',
  env: (st) => Object.assign(MAPS.aquarium.env(st), { sub: 2 }),
  cam: { mode: 'follow', yaw: 0, pitch: 44, dist: 8.5, fov: 56, lookY: 0.8, ahead: 1.0 },
  music: (st) => Story.aquariumMusic(st),
  amb: (st) => (aqPhase(st) === 'dark' ? ['pump', 'drips'] : ['pump', 'bubbles', 'hum']),
  build(M, st) {
    const f = st.flags, d = st.day, ph = aqPhase(st), old = ph === 'old' || ph === 'dark';
    const hired = !!f.hired, ghostNight = d === 7 && st.tod === 'night';
    const H = 3.4, lk = ph === 'dark' ? 0.08 : old ? 0.4 : 0.6;
    const DC = 140; // the dome's centre
    const zone = (x0, z0, x1, z1, o) => M.cam(x0, z0, x1, z1, Object.assign({ mode: 'follow', yaw: 0, pitch: 46, dist: 8, fov: 56, lookY: 0.8, ahead: 0.8, clamp: [x0 + 0.6, z0 + 0.6, x1 - 0.6, z1 - 0.4] }, o || {}));

    // ---------------------------------------------------------------- landing + stairs down
    M.room(-26, -8, -20, 2, H, { floor: 'tile_aqua', wall: old ? 'wall_grey' : 'tile_feature', trim: 'wall_navy', gaps: [{ side: 'e', at: -6, w: 1.8 }] });
    M.decal('sign_upper', -23, 2.4, -8, 2.6, 0.5, 's', { off: 0.03 });
    M.door(-23, 2, 'n', { tex: 'door_down', w: 1.8, h: 2.6, to: 'aquarium', spawn: 'from2f' });
    M.cyl(-25, 0, -7, 0.35, 0.7, 'plastic_green', { sides: 6 }); M.billboard('bush', -25, -7, 1.0, 0.9, { y: 0.6 });
    M.look(-24.6, -5.8, (s) => s.day >= 8 ? 'A plastic plant. Somebody has been watering it anyway. The pot is full of water up to the brim.' : 'A plastic plant in a pot. It has been dusted very carefully, leaf by leaf.', { r: 1 });
    M.light(-23, 3, -3, 7, '#f0f4ff', lk);
    zone(-26, -8, -20, 2);
    M.spawn('stairs', -23, 0.6, 'n');

    // ---------------------------------------------------------------- upper hall
    M.room(-20, -8, 20, -4, H, { floor: old ? 'carpet_grey' : 'carpet_blue', wall: old ? 'wall_navy' : 'wall_blue', trim: 'wall_navy',
      gaps: [{ side: 'n', at: -12, w: 1.8 }, { side: 'n', at: 2, w: 1.8 }, { side: 'n', at: 14, w: 1.8 }, { side: 's', at: -8, w: 2.2 }, { side: 's', at: 10, w: 2.2 }, { side: 'w', at: -6, w: 1.8 }, { side: 'e', at: -6, w: 1.6, h: 2.6 }] });
    M.decal('sign_theater', -12, 2.6, -8, 1.8, 0.5, 's', { off: 0.04 }); M.decal('sign_learn', 2, 2.6, -8, 2.2, 0.45, 's', { off: 0.04 }); M.decal('sign_jelly', 14, 2.6, -8, 1.6, 0.45, 's', { off: 0.04 });
    M.decal('poster_jelly', -4.5, 1.4, -8, 1.1, 1.0, 's'); M.decal('poster_octopus', 7.5, 1.4, -8, 1.3, 1.1, 's');
    M.bench(-2, -5.2, 'n'); M.bench(18, -5.2, 'n');
    M.box(-17.5, 0, -7.4, 0.6, 0.9, 0.5, { top: 'chrome', sides: 'plastic_white' }, { solid: true });
    M.look(-17.5, -6.6, (s) => s.day >= 8 ? ['A water fountain. You press the button. Sand comes out, a little at a time.'] : ['A water fountain. The water tastes like pennies and fish food.'], { r: 1 });
    for (const x of [-14, -2, 10]) M.light(x, 3, -6, 8, '#f0f4ff', lk);
    zone(-20, -8, 20, -4, { pitch: 42 });

    // ---------------------------------------------------------------- theater
    M.room(-20, -22, -4, -8, H + 0.6, { floor: 'carpet_red', wall: 'wall_maroon', trim: 'wood_dark', gaps: [{ side: 's', at: -12, w: 1.8 }] });
    for (let r = 0; r < 4; r++) for (const x of [-16, -8]) M.pew(x, -12 - r * 2.2, 5, 'n');
    M.decal('screen_title', -12, 1.0, -22, 7, 3.2, 's', { off: 0.03, lit: false, bright: f.filmThreaded ? 1.2 : 0.7 });
    M.inter(-12, -19.6, { r: 2.4, y: 2, use: async (S) => Story.theaterScreen(S) });
    if (f.filmThreaded) M.quad('light_white', [[-9, 2.6, -8.4], [-15, 2.6, -8.4], [-15.6, 3.8, -21.8], [-8.4, 3.8, -21.8]], [[0, 0], [1, 0], [1, 1], [0, 1]], { blend: true, lit: false, vcols: [[1, 1, 0.9, 0.2], [1, 1, 0.9, 0.2], [1, 1, 0.9, 0.05], [1, 1, 0.9, 0.05]] });
    M.look(-5.5, -14, (s) => s.day >= 7 ? ['Someone left a paper cup of soda on a seat. It\'s still cold. The ice hasn\'t melted.'] : ['A paper cup of soda on a seat. Warm and flat.'], { r: 1.1 });
    M.light(-12, 3.6, -15, 9, '#ffd0a0', lk * 0.6);
    zone(-20, -22, -4, -8, { pitch: 50, dist: 9 });

    // ---------------------------------------------------------------- learning room
    M.room(-4, -22, 8, -8, H, { floor: 'abc_carpet', wall: 'wall_cream', trim: 'wood_light', gaps: [{ side: 's', at: 2, w: 1.8 }] });
    for (const [x, z] of [[-1, -17], [4, -17], [-1, -12], [4, -12]]) { M.table(x, z, 1.8, 1.0, 0.5, 'plastic_yellow'); M.chair(x - 0.6, z + 0.8, 'n', 'plastic_red'); M.chair(x + 0.6, z + 0.8, 'n', 'plastic_blue'); }
    M.decal('chalk_deep', 2, 0.9, -22, 3.6, 2.2, 's', { off: 0.03 });
    M.look(2, -20.8, (s) => ['A chalkboard: WHAT LIVES IN THE DEEP?', 'The kids\' answers: ANGLERFISH. GIANT SQUID. NOBODY KNOWS.', s.day >= 5 ? 'The last answer just says EVAN. Nobody erased it.' : 'The last answer has been half erased. It started with an E.'], { r: 1.8 });
    M.decal('dr_fish', -3.98, 1.4, -18, 1.1, 0.9, 'e'); M.decal('dr_octopus', -3.98, 1.4, -15.5, 1.1, 0.9, 'e'); M.decal('dr_tank', 7.98, 1.4, -18, 1.1, 0.9, 'w');
    M.look(7, -18, ['A crayon drawing of a fish tank with a tiny person inside, waving. The label says ME.', 'It\'s signed E.V. in the corner, very neatly.'], { r: 1.2 });
    M.box(6.6, 0, -10, 1.0, 1.0, 0.8, { top: 'wood', sides: 'plastic_blue' }, { solid: true });
    M.decal('qbox_note', 6.6, 1.05, -9.58, 0.8, 0.45, 's', { off: 0.01 });
    M.look(6.6, -9, (s) => ['A box: QUESTIONS FOR THE KEEPER! One card is pinned to the front.', '"WHERE DO FISH GO WHEN THEY DIE? - E.V."', 'Under it, in grown-up handwriting: "Back to the sea. - W."', s.day >= 6 ? 'Under that, in pencil, the same kid: "ALL OF THEM?"' : 'There\'s a pencil mark under it, like someone started another question.'], { r: 1.2 });
    for (let i = 0; i < 5; i++) M.billboard('fish' + i + '_0', -2 + i * 2, -14.5, 0.7, 0.45, { y: 2.4 + (i % 2) * 0.3 });
    M.light(2, 3, -15, 9, '#fff4e0', lk);
    zone(-4, -22, 8, -8);

    // ---------------------------------------------------------------- jellies
    M.room(8, -22, 20, -8, H, { floor: 'black', wall: 'wall_navy', gaps: [{ side: 's', at: 14, w: 1.8 }] });
    for (const [x, z, c] of [[10.5, -19.5, '#ff70c8'], [14, -20.5, '#70a0ff'], [17.5, -19.5, '#c070ff'], [10.5, -13, '#70ffd0'], [17.5, -13, '#ffb070']]) {
      M.cyl(x, 0, z, 0.9, 0.4, 'metal', { sides: 8 });
      M.cyl(x, 0.4, z, 0.8, 2.6, 'water_tank', { sides: 10, solid: false, blend: true, alpha: 0.5, lit: false, cap: false, color: c });
      World.fishTank(M, { x0: x - 0.5, x1: x + 0.5, y0: 0.7, y1: 2.6, z0: z - 0.1, z1: z + 0.1, front: [0, 0, 1] }, ['jelly'], 3, { scale: 0.8 });
      M.light(x, 1.8, z, 4, c, ph === 'dark' ? 0.3 : 0.9);
    }
    M.bench(14, -15, 'n');
    M.look(14, -14.2, (s) => s.day >= 7 ? ['You sit on the bench. In the glass, your reflection sits down a second after you do.'] : ['You sit on the bench and watch the jellies. In the glass, the jellies swim straight through your reflection\'s helmet.'], { r: 1.3 });
    zone(8, -22, 20, -8, { pitch: 48 });

    // ---------------------------------------------------------------- kelp tunnel
    M.room(-18, -4, 0, 3, 3, { floor: 'tile_blue', wall: 'glass_dark', gaps: [{ side: 'n', at: -8, w: 2.2 }] });
    M.decal('sign_kelp', -8, 2.2, -4, 1.8, 0.4, 's', { off: 0.1 });
    // the outside of the tunnel: water, kelp and fish on the far side of the glass
    M.plane('water_tank', [-18, 3, 3], [1, 0, 0], [0, 0, -1], 18, 7, { blend: true, alpha: 0.35, lit: false, scroll: [0.02, 0.01], sub: 99, color: '#60b8e0' });
    for (let x = -17; x < 0; x += 1.7) { M.billboard('kelp', x, 2.4, 1.0, 2.6); M.billboard('kelp', x + 0.8, -3.4, 0.9, 2.2); }
    World.fishTank(M, { x0: -17, x1: -1, y0: 1.2, y1: 2.6, z0: -3, z1: 2.4, front: [0, 0, 1] }, ['fish0', 'fish2', 'fish3', 'fish5'], 12, { scale: 1.1 });
    M.light(-9, 2.6, 0, 10, '#40a0e0', lk * 1.2);
    M.look(-3, -0.5, (s) => s.day >= 8 ? ['A diver is standing in the kelp outside the glass, very still.', 'It\'s a statue. It wasn\'t here before.', 'Its helmet is empty.'] : ['The kelp sways like it\'s waving at you. It\'s the pump. It\'s just the pump.'], { r: 1.6 });
    M.look(-15, 1.5, 'The tunnel curves more than it looks like it should. You walk it twice to be sure.', { r: 1.4 });
    zone(-18, -4, 0, 3, { pitch: 38, dist: 7 });

    // ---------------------------------------------------------------- balcony
    M.room(0, -4, 20, 6, H, { wall: old ? 'wall_navy' : 'wall_blue', trim: 'wall_navy', gaps: [{ side: 'n', at: 10, w: 2.2 }] });
    // the floor goes around a big hole, and the main hall is far below it
    const bf = old ? 'carpet_grey' : 'carpet_blue';
    M.floor(0, -4, 20, -1, bf, { tile: 2 }); M.floor(0, 4, 20, 6, bf, { tile: 2 }); M.floor(0, -1, 5, 4, bf, { tile: 2 }); M.floor(15, -1, 20, 4, bf, { tile: 2 });
    M.wall(5, -1, 15, -1, 5.2, 'wall_blue', { face: 's', y0: -5.2, lit: false, bright: 0.4 }); M.wall(5, -1, 5, 4, 5.2, 'wall_blue', { face: 'e', y0: -5.2, lit: false, bright: 0.4 }); M.wall(15, -1, 15, 4, 5.2, 'wall_blue', { face: 'w', y0: -5.2, lit: false, bright: 0.4 });
    M.plane('water_tank', [5.4, -5, 3.6], [1, 0, 0], [0, 0, -1], 3.2, 1.2, { lit: false, bright: 1.2, sub: 99 });
    M.plane('water_tank', [10.6, -5, 3.6], [1, 0, 0], [0, 0, -1], 4, 1.4, { lit: false, bright: 1.2, sub: 99 });
    M.plane('carpet_blue', [5, -5.2, 4], [1, 0, 0], [0, 0, -1], 10, 5, { lit: false, bright: 0.5, sub: 99 });
    if (d >= 5) M.ent({ type: 'char', set: d >= 8 ? 'walter_ghost' : 'walter', x: 9.4, z: 1.2, y: -5.2, face: 0, scale: 0.7, noShadow: true });
    for (const [x0, z0, x1, z1] of [[5, -1, 15, -1], [5, 4, 15, 4]]) M.fence(x0, z0, x1, z1, { region: 'rail_metal', h: 1.0 });
    M.fence(5, -1, 5, 4, { region: 'rail_metal', h: 1.0 }); M.fence(15, -1, 15, 4, { region: 'rail_metal', h: 1.0 });
    M.solid(5, -1, 15, 4);
    M.look(10, -1.8, (s) => s.day >= 8 ? ['From up here you can see the whole main hall.', 'Walter is standing right below you, looking up. He\'s been looking up for a long time.'] : s.day >= 5 ? ['From up here you can see the whole main hall.', 'Walter is down there, looking up at the balcony. He waves, a little late.'] : ['From up here you can see the whole main hall, the tops of the tanks, the fish going round.'], { r: 1.6 });
    M.light(10, 3, 1.5, 10, '#f0f4ff', lk);
    zone(0, -4, 20, 6);

    // ---------------------------------------------------------------- staff side
    aqDoorway(M, 20, -6, 'w', !hired && !ghostNight && d < 8, 'EMPLOYEES ONLY.', 'door_int');
    M.decal('sign_employees', 20.02, 2.5, -6, 1.2, 0.5, 'w', { off: 0.02 });
    M.room(20, -8, 40, -4, H, { floor: 'grate', wall: 'wall_grey', gaps: [{ side: 'w', at: -6, w: 1.6, h: 2.6 }, { side: 'n', at: 26, w: 1.6 }, { side: 'n', at: 36, w: 1.6 }, { side: 's', at: 25, w: 1.6 }, { side: 's', at: 35, w: 1.6 }] });
    for (let x = 22; x < 40; x += 3) M.box(x, 2.9, -7.6, 3, 0.25, 0.25, 'rust', { solid: false });
    M.light(30, 3, -6, 10, '#f0f0e0', lk * 0.8);
    zone(20, -8, 40, -4, { pitch: 42 });
    // the room that doesn't exist (only tonight)
    if (ghostNight) {
      M.door(40, -6, 'w', { tex: 'door_evan', w: 1.3, to: 'aq2', spawn: 'nowhere', sfx: 'door' });
      M.look(39.2, -6, 'A door you haven\'t seen before. It looks exactly like the one to Evan\'s room.', { r: 0.9 });
    }

    // tank tops: you're above the water now
    M.room(20, -22, 32, -8, H, { floor: 'grate', wall: 'wall_grey', gaps: [{ side: 's', at: 26, w: 1.6 }] });
    for (const [x0, z0, x1, z1] of [[21, -21, 25, -16], [27, -21, 31, -16]]) {
      M.plane('water_tank', [x0, -0.2, z1], [1, 0, 0], [0, 0, -1], x1 - x0, z1 - z0, { blend: true, alpha: 0.8, lit: false, scroll: [0.03, 0.01], sub: 99 });
      World.fishTank(M, { x0: x0 + 0.3, x1: x1 - 0.3, y0: -0.6, y1: -0.3, z0: z0 + 0.3, z1: z1 - 0.3, front: [0, 0, 1] }, ['fish0', 'fish1', 'fish4'], 4, { scale: 0.9 });
      M.fence(x0, z1, x1, z1, { region: 'rail_metal', h: 0.9 }); M.solid(x0, z0, x1, z1);
    }
    M.look(23, -15.2, 'The top of Tank 1, from above. The fish look up at you, which they never do from the front.', { r: 1.2 });
    M.cyl(24, 0, -12, 0.4, 0.6, 'plastic_yellow', { sides: 8 }); M.cyl(25.2, 0, -11.6, 0.4, 0.6, 'plastic_blue', { sides: 8 });
    M.look(24.6, -11, (s) => s.day >= 4 ? 'Feeding buckets. One still has fish in it from this morning. Or some morning.' : 'Feeding buckets and long-handled nets.', { r: 1.2 });
    M.floorDecal(d >= 8 ? 'hatch_open' : 'hatch_t6', 29, -11, 2.2, 2.2, { y: 0.02 });
    M.inter(29, -11, { r: 1.6, y: 0.4, use: async (S) => {
      if (S.st.day >= 8) { await S.say(null, 'The hatch to Tank 6 is open.'); await S.say(null, 'Below: no water. Just a long way down, and a smell like wet concrete.'); return; }
      await S.say(null, 'A hatch in the floor: T6. It\'s padlocked.'); await S.say(null, 'The padlock is much newer than the hatch.');
    } });
    M.light(26, 3, -15, 9, '#a0d8ff', lk);
    zone(20, -22, 32, -8, { pitch: 55 });

    // projection booth
    M.room(32, -22, 40, -8, H, { floor: 'wood_dark', wall: 'wall_maroon', gaps: [{ side: 's', at: 36, w: 1.6 }] });
    M.box(36, 0, -18, 1.4, 1.1, 1.0, { top: 'metal', sides: 'metal' }, { solid: true });
    M.box(36, 1.1, -18.2, 0.8, 0.8, 1.2, 'rust', { solid: false }); M.cyl(36, 1.5, -19, 0.2, 0.3, 'glass_dark', { sides: 6, solid: false });
    M.decal('win_dark', 36, 1.6, -22, 0.8, 0.5, 's', { off: 0.02 });
    M.inter(36, -16.8, { r: 1.5, y: 1.4, use: async (S) => Story.projector(S) });
    M.shelf(33, -21.6, 1.6, 2, 's', 'bookshelf');
    for (let i = 0; i < 4; i++) M.billboard('film_can', 38.4, -20 + i * 0.1, 0.5, 0.25, { y: 0.1 + i * 0.25 });
    M.pickup(38.6, -12, 'film_reel', { text: 'A film reel in a dented tin, under the bench.' });
    M.look(33.6, -10, 'A sign-in sheet for the projectionist. The last name on it is W. VANE. The date is 8/14/91.', { r: 1.1 });
    M.light(36, 3, -15, 6, '#ffd8a0', lk * 0.7);
    zone(32, -22, 40, -8, { pitch: 55 });

    // the cot room
    M.room(20, -4, 30, 6, H, { floor: 'carpet_grey', wall: 'wall_cream', trim: 'wood_dark', gaps: [{ side: 'n', at: 25, w: 1.6 }] });
    M.bed(22, 3.6, 'n', { narrow: true });
    M.look(22, 2, (s) => s.day >= 7 ? ['A cot, made up very neatly. Like nobody is going to sleep in it again.'] : ['A cot. The pillow has a dent in it. Somebody has been sleeping here, on and off, for a long time.'], { r: 1.4 });
    M.box(28.4, 0, 4.6, 1.2, 0.8, 0.8, { top: 'metal', sides: 'wood' }, { solid: true });
    M.look(28.4, 3.6, 'A hot plate and a can of soup, open, with a spoon standing in it.', { r: 1.1 });
    M.decal('cal_91', 29.98, 1.3, 0, 0.6, 0.75, 'w');
    M.look(29.2, 0, 'A calendar stuck on AUGUST 1991. The days are crossed off, one at a time, up to the 14th. Then nothing.', { r: 1.1 });
    M.decal('ph_family', 20.02, 1.5, 1, 0.6, 0.45, 'e');
    M.look(20.8, 1, 'A photo taped to the wall by the cot: Walter, a woman, and a little boy holding a kitten.', { r: 1.1 });
    M.light(25, 3, 1, 7, '#ffe8c0', lk * 0.7);
    zone(20, -4, 30, 6);

    // the dome ladder
    M.room(30, -4, 40, 6, H, { floor: 'grate', wall: 'wall_grey', gaps: [{ side: 'n', at: 35, w: 1.6 }] });
    M.box(35, 0, 5.4, 1.0, H, 0.2, 'metal', { solid: true });
    for (let y = 0.3; y < H; y += 0.4) M.box(35, y, 5.2, 0.9, 0.06, 0.1, 'metal', { solid: false });
    M.inter(35, 4.4, { r: 1.4, y: 1.4, exit: true, use: async (S) => {
      const s = S.st;
      if (s.day < 5 && !(s.day === 7 && s.tod === 'night')) { await S.say(null, 'A ladder up to the dome. There\'s a padlocked cage around the bottom rungs: AUTHORIZED PERSONNEL.'); return; }
      await S.say(null, 'The cage around the ladder is open. You climb up into the dome.');
      await S.fade(1, 0.5); World.player.x = DC; World.player.z = 1.5; World.player.face = 0; await S.fade(0, 0.6);
    } });
    M.light(35, 3, 1, 6, '#f0f0e0', lk * 0.6);
    zone(30, -4, 40, 6);

    // ---------------------------------------------------------------- the dome (up the ladder)
    // it sits well away from the rest of the floor: the town panorama around it is a big ring
    // a round room: wooden floor, a rim, glass all the way round
    M.cyl(DC, -0.12, -3, 7.2, 0.12, 'wood_dark', { sides: 20, solid: false });
    M.cyl(DC, 0, -3, 7.25, 0.14, 'grate', { sides: 20, solid: false, cap: false });
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; M.box(DC + Math.cos(a) * 7.1, 0, -3 + Math.sin(a) * 7.1, 0.2, 3.5, 0.2, 'metal', { solid: false }); }
    M.cyl(DC, 0.9, -3, 7.2, 2.6, 'glass_dark', { sides: 12, solid: false, blend: true, alpha: 0.22, color: '#8ab0e0', cap: false });
    for (let i = 0; i < 16; i++) { const a0 = i / 16 * Math.PI * 2, a1 = (i + 1) / 16 * Math.PI * 2; M.fence(DC + Math.cos(a0) * 6.6, -3 + Math.sin(a0) * 6.6, DC + Math.cos(a1) * 6.6, -3 + Math.sin(a1) * 6.6, { region: 'rail_metal', h: 0.9 }); }
    M.cyl(DC, -0.45, -3, 14, 0.1, 'roof_grey', { sides: 16, solid: false, cap: true });
    // Bellwood all the way round, past the glass (the ring faces inward; the camera never sees its back)
    const pano = '@' + (st.tod === 'night' || ph === 'dark' ? 'dome_night' : 'dome_day'), PN = 24;
    for (let i = 0; i < PN; i++) {
      const a0 = -1.5 * Math.PI + i / PN * Math.PI * 2, a1 = -1.5 * Math.PI + (i + 1) / PN * Math.PI * 2, R0 = 28;
      const p0 = [DC + Math.cos(a0) * R0, -3 + Math.sin(a0) * R0], p1 = [DC + Math.cos(a1) * R0, -3 + Math.sin(a1) * R0];
      M.quad(pano, [[p0[0], -8, p0[1]], [p1[0], -8, p1[1]], [p1[0], 20, p1[1]], [p0[0], 20, p0[1]]], null, { lit: false, uvRect: [i / PN, 0, (i + 1) / PN, 1], bright: ph === 'dark' ? 0.4 : 1 });
    }
    for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2; M.solidCircle(DC + Math.cos(a) * 6.9, -3 + Math.sin(a) * 6.9, 0.6); }
    M.decal('plaque_dome', DC, 0.95, -9.55, 0.9, 0.5, 's', { off: 0.02 });
    M.look(DC, -8.8, ['A brass plaque on the railing: THE VANE OBSERVATORY. DEDICATED 1976.', 'Somebody has scratched a line through OBSERVATORY and written LOOKOUT.'], { r: 1.0 });
    M.bench(DC - 4.4, -4.6, 'e'); M.bench(DC + 4.4, -4.6, 'w');
    M.cyl(DC, 0, -6.6, 0.15, 1.3, 'chrome', { sides: 4 });
    M.box(DC + 0.3, 1.3, -6.6, 0.9, 0.22, 0.22, 'chrome', { solid: false });
    M.inter(DC, -5.4, { r: 1.5, y: 1.4, use: async (S) => Story.telescope(S) });
    M.look(DC + 5.5, -3, 'Carved into the railing: W.V. + R.V. 1976. And under it, smaller, newer: + E.', { r: 1.2 });
    M.floorDecal('hatch_open', DC, 2.6, 1.4, 1.4, { y: 0.02 });
    M.inter(DC, 2.2, { r: 1.3, y: 0.5, exit: true, use: async (S) => { await S.fade(1, 0.4); World.player.x = 35; World.player.z = 3.6; World.player.face = Math.PI; await S.fade(0, 0.5); } });
    M.look(DC - 5.5, -3, (s) => s.day >= 7 ? 'From up here the town looks like a model of a town. The river is very still. Somebody is walking along it with a flashlight.' : 'From up here you can see all of Bellwood. The river, the school, your house. Everything looks like a model of itself.', { r: 1.4 });
    M.light(DC, 3, -3, 12, st.tod === 'night' ? '#6a80c0' : '#fff8e0', ph === 'dark' ? 0.2 : 0.7);
    M.cam(DC - 8, -10, DC + 8, 4, { mode: 'follow', yaw: 0, pitch: 34, dist: 7.5, fov: 58, lookY: 1.4, ahead: 1.2, clamp: [DC - 8, -9, DC + 8, 6] });
    M.spawn('dome', DC, 1.5, 'n');

    // ---------------------------------------------------------------- the room that doesn't exist
    if (ghostNight) {
      const X = 66, Z = -6;
      M.room(X - 5, Z - 5, X + 5, Z + 5, 3, { floor: 'carpet_blue', wall: 'wallpaper_evan', trim: 'wood_light' });
      M.plane('water_tank', [X - 5, 2.9, Z + 5], [1, 0, 0], [0, 0, -1], 10, 10, { blend: true, alpha: 0.16, lit: false, scroll: [0.03, 0.02], sub: 99 });
      M.bed(X - 3.4, Z - 2.8, 'e'); M.desk(X + 3, Z - 4.2, 's');
      World.fishTank(M, { x0: X - 4, x1: X + 4, y0: 0.6, y1: 2.4, z0: Z - 4, z1: Z + 4, front: [0, 0, 1] }, ['fish0', 'fish1', 'fish3', 'fish6'], 12, { scale: 1.2 });
      for (let i = 0; i < 8; i++) M.ent({ type: 'sprite', region: 'bubble', x: X - 4 + i, y: (i * 0.4) % 2.4, z: Z - 3 + (i % 3) * 2, w: 0.18, h: 0.18, sp: 0.5 + (i % 3) * 0.2, update(e, dt) { e.y += e.sp * dt; if (e.y > 2.6) e.y = 0; } });
      M.look(X - 3.4, Z - 1.4, ['Evan\'s bed. It\'s floating an inch off the floor.', 'The room is full of water, and you can breathe it. It tastes like the aquarium.'], { r: 1.5 });
      M.look(X + 3, Z - 3, ['A desk. On it, a note in Walter\'s handwriting:', '"THAT ROOM DOESN\'T EXIST ANYMORE."'], { r: 1.3 });
      M.door(X, Z + 5, 'n', { tex: 'door_evan', w: 1.3, to: 'aq2', spawn: 'fromnowhere' });
      M.light(X, 2.4, Z, 8, '#60c0ff', 0.9);
      M.cam(X - 5, Z - 5, X + 5, Z + 5, { mode: 'follow', yaw: 0, pitch: 50, dist: 7.5, fov: 56, lookY: 0.6, ahead: 0.6, clamp: [X - 4, Z - 4, X + 4, Z + 9] });
      M.spawn('nowhere', X, Z + 3.6, 'n');
    }
    M.spawn('fromnowhere', 38.6, -6, 'w');
  },
};
