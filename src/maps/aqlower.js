'use strict';
// ---------------------------------------------------------------------------
// THE BELLWOOD AQUARIUM - UNDERNEATH THE STAFF SIDE
//   B1 MAINTENANCE (stairs from the storage room, open from day 3)
//     landing -4..4 x -4..4, a long corridor north, rooms both sides:
//     filtration, boiler, the chalk passage, old exhibits (west);
//     fish kitchen + walk-in, quarantine, Walter's workshop (east);
//     the freight elevator at the far end.
//   B2 THE DEEP (freight elevator, needs the freight key: day 5 on)
//     the lobby, the viewing gallery under Tank 6, the planning office,
//     records, life support, a crawlspace to Evan's hideout, and a bricked
//     up room that opens on the last day.
// ---------------------------------------------------------------------------

MAPS.aqb1 = {
  name: 'B1 - MAINTENANCE',
  env(st) {
    if (st.day >= 8) return { fog: '#040506', fogNear: 5, fogFar: 26, ambient: [0.32, 0.34, 0.36], clear: '#000000', sub: 2, sat: 0.55, snap: 1.3, affine: 1 };
    return { fog: '#06080a', fogNear: 10, fogFar: 36, ambient: [0.5, 0.54, 0.52], clear: '#000000', sub: 2, sat: 0.7 };
  },
  cam: { mode: 'follow', yaw: 0, pitch: 46, dist: 8, fov: 56, lookY: 0.8, ahead: 0.8 },
  music() { return null; },
  amb(st) { return st.day >= 8 ? ['deep', 'drips'] : ['pump', 'buzz', 'drips']; },
  onEnter(S, st) {
    if (st.flags.b1Seen) return;
    S.flag('b1Seen');
    return S.say(null, 'The door at the bottom of the stairs was propped open with a mop bucket. Somebody is expecting to come back.');
  },
  build(M, st) {
    const f = st.flags, d = st.day, late = d >= 8, H = 3.2, lk = late ? 0.3 : 0.7;
    const zone = (x0, z0, x1, z1, o) => M.cam(x0, z0, x1, z1, Object.assign({ mode: 'follow', yaw: 0, pitch: 48, dist: 7.5, fov: 56, lookY: 0.8, ahead: 0.8, clamp: [x0 + 0.6, z0 + 0.6, x1 - 0.6, z1 - 0.4] }, o || {}));
    const pipesAlong = (x0, z0, x1, z1, face) => M.decal('pipes', (x0 + x1) / 2, 1.9, (z0 + z1) / 2, Math.max(Math.abs(x1 - x0), Math.abs(z1 - z0)), 1.2, face, { off: 0.03 });

    // ---------------------------------------------------------------- landing
    M.room(-4, -4, 4, 4, H, { floor: 'concrete', wall: 'concrete_dark', trim: 'rust', gaps: [{ side: 'n', at: 0, w: 2 }] });
    M.door(0, 4, 'n', { tex: 'door_up', w: 1.6, h: 2.6, to: 'aquarium', spawn: 'fromb1', mat: null });
    M.decal('sign_b1wall', -3.98, 2.2, 0, 1.3, 0.8, 'e', { off: 0.02 });
    M.cyl(2.8, 0, 2.8, 0.35, 0.5, 'plastic_yellow', { sides: 8 });
    M.look(2.8, 2.2, (s) => s.day >= 8 ? 'The mop bucket. The water in it is perfectly clear, and very, very deep. You can\'t see the bottom.' : 'A yellow mop bucket, grey water in it. It was holding the door open.', { r: 1.0 });
    M.light(0, 3, 0, 7, '#e8f0e0', lk);
    zone(-4, -4, 4, 4);
    M.spawn('stairs', 0, 2.4, 'n');

    // ---------------------------------------------------------------- the corridor
    M.room(-2, -44, 2, -4, H, { floor: 'concrete', wall: 'wall_grey', trim: 'rust',
      gaps: [{ side: 's', at: 0, w: 2 }, { side: 'n', at: 0, w: 2 }, { side: 'w', at: -10, w: 1.8 }, { side: 'w', at: -22, w: 1.8 }, { side: 'w', at: -34, w: 1.8 }, { side: 'e', at: -10, w: 1.8 }, { side: 'e', at: -22, w: 1.8 }, { side: 'e', at: -34, w: 1.8 }] });
    pipesAlong(-2, -28, -2, -12, 'e'); pipesAlong(2, -32, 2, -24, 'w');
    for (let z = -8; z > -44; z -= 8) M.light(0, 3, z, 6, z === -32 && d >= 6 ? '#c8d8a0' : '#e8f0e0', z === -32 && d >= 6 ? lk * 0.3 : lk * 0.8);
    M.decal('sign_filter', -1.98, 2.5, -10, 1.4, 0.35, 'e', { off: 0.02 }); M.decal('sign_boiler', -1.98, 2.5, -22, 1.4, 0.55, 'e', { off: 0.02 }); M.decal('sign_exhib', -1.98, 2.5, -34, 1.5, 0.35, 'e', { off: 0.02 });
    M.decal('sign_fishk', 1.98, 2.5, -10, 1.5, 0.35, 'w', { off: 0.02 }); M.decal('sign_quar', 1.98, 2.5, -22, 1.5, 0.55, 'w', { off: 0.02 }); M.decal('sign_shop', 1.98, 2.5, -34, 1.3, 0.55, 'w', { off: 0.02 });
    // the time clock
    M.decal('timeclock', 1.98, 1.2, -6, 0.6, 0.85, 'w', { off: 0.02 });
    M.inter(1.3, -6, { r: 1.1, y: 1.4, use: async (S) => Story.timeClock(S) });
    // chalk arrows on the floor, all pointing the same way
    for (const z of [-7, -15, -26]) M.floorDecal('chalk_arrow', -0.6, z, 0.7, 0.7, { y: 0.02 });
    M.look(-0.6, -15, ['Chalk arrows on the floor, the kind kids draw for a treasure hunt. They all point deeper in.', 'They\'ve been walked over a lot. Somebody keeps drawing them back in.'], { r: 1.0 });
    M.look(0, -40, (s) => s.day >= 8 ? ['The corridor is longer going back than it was coming in.'] : null, { r: 1.2, cond: (s) => s.day >= 8 });
    zone(-2, -44, 2, -4, { pitch: 28, dist: 6.5, lookY: 1.0, ahead: 2.2, lag: 3, clamp: null });

    // ---------------------------------------------------------------- filtration (west)
    M.room(-16, -16, -2, -4, H, { floor: 'concrete', wall: 'concrete_dark', gaps: [{ side: 'e', at: -10, w: 1.8 }] });
    for (const [x, z] of [[-13, -13], [-9, -13], [-5, -13]]) {
      M.cyl(x, 0, z, 1.2, 2.6, 'plastic_blue', { sides: 10 }); M.cyl(x, 2.6, z, 0.9, 0.2, 'metal', { sides: 10, solid: false });
      M.box(x, 2.0, z + 1.2, 0.3, 0.3, 0.3, 'metal', { solid: false });
    }
    M.decal('gauge', -9, 1.6, -11.78, 0.4, 0.4, 's', { off: 0.02 });
    M.look(-9, -11, (s) => ['SAND FILTER 2. A little window in the side shows the water rushing through.', s.day >= 6 ? 'For a second something pale and small goes past the window, and then the water is just water again.' : 'It\'s cleaner than the water upstairs. Everything down here is.'], { r: 1.3 });
    M.decal('log_backwash', -15.98, 1.5, -7, 1.6, 0.9, 'e', { off: 0.02 });
    M.look(-15.2, -7, ['A BACKWASH LOG, taped to the wall. The last entries are from 1991.', '8/15 - T6 DRAINED. 8/16 - T6 REFILLED.', 'Nobody drains a 40,000 gallon tank for one day.'], { r: 1.2 });
    M.decal('pipes', -9, 0.3, -15.97, 12, 2.4, 's', { off: 0.02 });
    M.light(-9, 3, -9, 8, '#d8f0ff', lk);
    zone(-16, -16, -2, -4);

    // ---------------------------------------------------------------- boiler (west)
    M.room(-16, -28, -2, -16, H, { floor: 'concrete_dark', wall: 'brick_old', gaps: [{ side: 'e', at: -22, w: 1.8 }, { side: 'w', at: -22, w: 1.4 }] });
    M.box(-9, 0, -25.4, 4, 2.4, 2.2, { top: 'rust', sides: 'rust' }, { solid: true });
    M.cyl(-9, 2.4, -25.4, 0.4, 0.8, 'rust', { sides: 6, solid: false });
    M.box(-9, 0.3, -24.28, 1.0, 0.8, 0.05, 'black', { solid: false });
    M.decal('radiator', -9, 0.3, -24.24, 0.9, 0.7, 's', { off: 0.02, lit: false, bright: 1.4, color: '#ff9a4a' });
    M.look(-9, -23.4, (s) => s.day >= 5 ? ['The boiler. Somebody has been burning papers in it.', 'In the ash, one corner of a photograph survived: a blue and white striped sleeve.'] : ['The boiler. It\'s warm down here. It\'s the only warm place in the building.'], { r: 1.5 });
    M.movingBox(-14.5, -26.8, 0.9); M.movingBox(-13.6, -26.9, 0.6, 0.4);
    M.light(-9, 1.2, -23, 7, '#ff9a5a', late ? 0.5 : 0.9); M.light(-5, 3, -19, 6, '#f0e0c0', lk * 0.5);
    zone(-16, -28, -2, -16);

    // ---------------------------------------------------------------- the chalk passage (far west)
    M.room(-20, -40, -16, -4, 2.6, { floor: 'concrete_dark', wall: 'brick_old', gaps: [{ side: 'e', at: -22, w: 1.4 }, { side: 'e', at: -34, w: 1.4 }] });
    for (const z of [-8, -14, -28, -35]) M.floorDecal('chalk_arrow', -18, z, 0.6, 0.6, { y: 0.02 });
    M.decal('chalk_door', -18, 0.1, -39.98, 1.2, 2.0, 's', { off: 0.02 });
    M.look(-18, -39, (s) => ['Someone drew a door on the wall at the end of the passage, in chalk. It has a doorknob.', 'Written over it: SECRET WAY OUT. Under that, smaller: NOT FINISHED.', s.day >= 7 ? 'You try the doorknob. It\'s chalk. Your fingers come away white.' : null].filter(Boolean), { r: 1.2 });
    M.look(-18, -5, (s) => s.day >= 6 ? 'The dead end. Down here the arrows go in circles, round and round, like whoever drew them couldn\'t decide.' : 'A dead end, with a drain in the floor.', { r: 1.2 });
    M.floorDecal('drain', -18, -5, 0.8, 0.8, { y: 0.02 });
    M.light(-18, 2.4, -22, 5, '#c8b890', lk * 0.5); M.light(-18, 2.4, -8, 5, '#c8b890', lk * 0.4);
    zone(-20, -40, -16, -4, { pitch: 30, dist: 6, ahead: 1.6, clamp: null });

    // ---------------------------------------------------------------- old exhibits (west)
    M.room(-16, -40, -2, -28, H, { floor: 'wood_dark', wall: 'wall_navy', gaps: [{ side: 'e', at: -34, w: 1.8 }, { side: 'w', at: -34, w: 1.4 }] });
    M.billboard('diving_suit', -12, -38.6, 1.0, 2.0, { y: 0, solidR: 0.5 });
    M.inter(-12, -37.4, { r: 1.3, y: 1.4, use: async (S) => Story.divingSuit(S) });
    M.billboard('shark_fg', -6, -32, 3.2, 1.3, { y: 2.0 });
    M.look(-6, -31, 'A fiberglass shark, hung from the ceiling on chains. Most of its teeth have been painted over with white-out. One is missing.', { r: 1.4 });
    M.billboard('walter_cutout', -3.2, -38.8, 0.9, 2.0, { y: 0, solidR: 0.3 });
    M.look(-3.2, -38, (s) => s.day >= 7 ? ['A cardboard Keeper Walter. HI KIDS!', 'Someone cut the eyes out. Behind them, the wall has been painted to look like eyes.'] : ['A life-size cardboard Keeper Walter, from the seventies. HI KIDS!', 'He looks younger than you thought people could be.'], { r: 1.2 });
    for (const [x, z] of [[-14, -30], [-10, -30], [-8.6, -38.4]]) M.box(x, 0, z, 1.4, 1.2, 1.0, 'fabric_grey', { solid: true });
    M.look(-10, -31, ['Things under dust sheets. The shapes are the shapes of display cases.', 'One of the sheets is breathing. No. It\'s the air from the vent.'], { r: 1.3 });
    M.decal('poster_deep', -15.98, 1.6, -34, 1.2, 1.6, 'e', { off: 0.02, bright: 0.8 });
    M.light(-9, 3, -34, 8, '#e8d8b0', lk * 0.7);
    zone(-16, -40, -2, -28);

    // ---------------------------------------------------------------- fish kitchen (east)
    M.room(2, -16, 14, -4, H, { floor: 'tile_white', wall: 'tile_white', trim: 'metal', gaps: [{ side: 'w', at: -10, w: 1.8 }, { side: 'e', at: -12, w: 1.5 }] });
    M.counter(8, -15.3, 7, 0.9, 0.95, { top: 'metal', side: 'metal' });
    M.counter(8, -8.6, 4, 1.2, 0.95, { top: 'metal', side: 'metal', face: 's' });
    M.sink(12.8, -15.3, 's');
    M.cyl(4, 0, -14.8, 0.4, 0.6, 'plastic_yellow', { sides: 8 }); M.cyl(5, 0, -15, 0.4, 0.6, 'plastic_blue', { sides: 8 });
    M.billboard('fish1_0', 7.5, -8.6, 0.6, 0.35, { y: 1.0 }); M.billboard('fish4_0', 8.4, -8.5, 0.5, 0.3, { y: 1.0 });
    M.look(8, -7.6, (s) => s.day >= 8 ? 'Fish on a cutting board, cleaned and ready. They\'re still moving their mouths, very slowly, like they\'re saying something.' : 'Fish on a cutting board for the afternoon feed. Somebody got interrupted halfway through.', { r: 1.3 });
    M.decal('board_feed', 2.02, 1.6, -7, 1.9, 0.8, 'e', { off: 0.02 });
    M.look(2.8, -7, ['A whiteboard: FEEDING TODAY.', 'T6 just has three dashes. It has been three dashes for a very long time. The marker has soaked into the board.'], { r: 1.1 });
    M.pickup(5.6, -14.6, 'freezer_key', { y: 0.95, r: 1.2, text: 'In a drawer full of fish scissors and rubber bands: a little key on a wire loop.' });
    M.decal('sign_walkin', 13.98, 2.6, -12, 1.0, 0.3, 'w', { off: 0.02 });
    aqDoorway(M, 14, -12, 'w', !f.freezerOpen, 'Locked.', 'door_metal', (S) => Story.freezerDoor(S));
    M.light(8, 3, -10, 8, '#f0f8ff', lk);
    zone(2, -16, 14, -4);

    // the walk-in freezer
    M.room(14, -16, 20, -8, 2.8, { floor: 'grate', wall: 'metal', gaps: [{ side: 'w', at: -12, w: 1.5 }] });
    M.box(17, 0, -15.6, 5, 2.2, 0.45, { top: 'metal', sides: 'metal', s: '@shelf_goods' }, { fit: { s: true }, color: '#a8c8f0' });
    M.billboard('cake_box', 17, -15.4, 0.7, 0.5, { y: 1.55 });
    M.inter(17, -14.4, { r: 1.2, y: 1.6, use: async (S) => Story.freezerCake(S) });
    M.decal('frost_hi', 19.98, 1.1, -10, 1.0, 0.5, 'w', { off: 0.02 });
    M.look(19.2, -10, (s) => ['Frost on the wall. Written in it, with one finger: HI DAD.', s.day >= 6 ? 'It\'s fresh. The letters are still sharp.' : 'It has been written over and over, so it never quite fades.'], { r: 1.1 });
    for (let i = 0; i < 6; i++) M.ent({ type: 'sprite', region: 'bubble', x: 15 + i, y: 1 + (i % 3) * 0.5, z: -9 - (i % 4) * 1.6, w: 0.08, h: 0.08, sp: 0.2, update(e, dt) { e.y -= e.sp * dt; if (e.y < 0) e.y = 2.6; } });
    M.light(17, 2.6, -12, 6, '#a8d0ff', lk * 0.9);
    zone(14, -16, 20, -8, { pitch: 55 });

    // ---------------------------------------------------------------- quarantine (east)
    M.room(2, -28, 14, -16, H, { floor: 'tile_grey', wall: 'tile_white', gaps: [{ side: 'w', at: -22, w: 1.8 }] });
    World.fishTank(M, M.tank(5, -27.2, 2.4, 1.1, 0.9, 's', { back: 'tank_back_empty', baseH: 0.7 }), ['fish2'], 1, { scale: 0.8 });
    World.fishTank(M, M.tank(9, -27.2, 2.4, 1.1, 0.9, 's', { back: 'tank_back_empty', baseH: 0.7 }), ['fish5'], 2, { scale: 0.8 });
    M.tank(13.2, -22, 2.4, 1.1, 0.9, 'w', { back: 'tank_back_dark', baseH: 0.7, dark: true });
    M.look(12.2, -22, ['A tank labeled T6 - HOLDING. It\'s empty except for a little plastic diver at the bottom, the kind that comes with a castle.', 'He\'s lying on his back, looking up.'], { r: 1.3 });
    M.decal('quar_log', 2.02, 1.5, -18.5, 1.3, 0.8, 'e', { off: 0.02 });
    M.look(2.8, -18.5, 'QUARANTINE LOG: 8/15/91 - ALL SPECIMENS OUT OF T6. REASON: "MAINT." The quotes are in the original.', { r: 1.1 });
    M.look(7, -26, (s) => s.day >= 7 ? 'The fish in quarantine are all facing the same wall. You follow their eyes. It\'s the wall with Tank 6 behind it.' : 'Sick fish, one to a tank. A card on each: DO NOT FEED - W.V.', { r: 1.3 });
    M.light(8, 3, -22, 8, '#e0f0e8', lk * 0.8);
    zone(2, -28, 14, -16);

    // ---------------------------------------------------------------- Walter's workshop (east)
    M.room(2, -40, 16, -28, H, { floor: 'concrete', wall: 'wood', trim: 'wood_dark', gaps: [{ side: 'w', at: -34, w: 1.8 }] });
    M.table(9, -39, 4, 1.2, 0.95, 'wood_dark', 's');
    M.decal('pegboard', 9, 1.4, -39.98, 3.2, 1.9, 's', { off: 0.02 });
    M.pickup(11.4, -38.8, 'freight_key', { y: 1.35, r: 1.3, cond: (s) => s.day >= 5, text: 'Hanging on the pegboard, where a hammer used to be: a key on a heavy yellow tag.' });
    M.pickup(6.6, -39.1, 'receipt_hs', { y: 1.0, r: 1.2, cond: (s) => s.day >= 4, secret: true, text: 'Something folded very small is pushed down behind the pegboard. A receipt.' });
    M.look(9, -38, (s) => s.day >= 5 ? ['A workbench. A radio, a thermos, a pair of work gloves stiff with something grey.', 'The radio is on, very quietly, tuned between two stations.'] : ['Walter\'s workbench. A radio, a thermos, a pair of work gloves stiff with something grey.'], { r: 1.3 });
    for (let i = 0; i < 5; i++) M.billboard('concrete_bag', 14.4 - (i % 3) * 0.7, -38.9 + Math.floor(i / 3) * 0.1, 0.7, 0.9, { y: Math.floor(i / 3) * 0.75 });
    for (let i = 0; i < 4; i++) M.floorDecal('bag_empty', 13.6 - i * 0.9, -35.6 - (i % 2) * 0.5, 0.9, 0.45, { y: 0.02 + i * 0.003 });
    M.solid(12.8, -39.6, 15.4, -38.2);
    M.look(13.8, -37, ['Bags of HARBOR CONCRETE. Some full. A lot of them empty, folded flat and stacked, like somebody wanted to keep count.', 'You count them. Twelve.'], { r: 1.4 });
    M.billboard('wheelbarrow', 5, -31, 1.5, 0.85, { y: 0, solidR: 0.6 });
    M.look(5, -30, ['A wheelbarrow with a crust of old concrete in the bottom.', 'It dried in ripples, like it was poured in a hurry, in the dark.'], { r: 1.3 });
    M.light(9, 3, -34, 8, '#f0e0c0', lk * 0.8);
    zone(2, -40, 16, -28);

    // ---------------------------------------------------------------- the freight elevator
    M.room(-6, -50, 6, -44, H, { floor: 'grate', wall: 'concrete_dark', trim: 'rust', gaps: [{ side: 's', at: 0, w: 2 }] });
    M.door(0, -50, 's', { tex: 'door_freight', w: 2.6, h: 2.6, use: async (S) => Story.freightCall(S), locked: (s) => s.day >= 8, lockedMsg: 'The freight elevator\'s light is off. From far down the shaft, very faintly, the sound of a walkie-talkie: static, and a click.' });
    M.decal('sign_freight', 0, 2.85, -49.98, 1.2, 0.5, 's', { off: 0.03 });
    M.decal('door_metal', -5.98, 0, -47, 1.2, 2.2, 'e', { off: 0.02, color: '#b87a5a' });
    M.decal('sign_pump', -5.96, 2.4, -47, 1.0, 0.35, 'e', { off: 0.03 });
    M.look(-5.2, -47, (s) => s.day >= 8 ? ['PUMP ROOM. The door has rusted solid into its frame.', 'The pump on the other side has stopped. Something else is breathing instead.'] : ['PUMP ROOM. The door has rusted solid into its frame.', 'On the other side, you can hear the pump. In, and out.'], { r: 1.2 });
    M.light(0, 3, -47, 6, '#e8e0a0', lk * 0.8);
    zone(-6, -50, 6, -44, { pitch: 40 });
    M.spawn('elevator', 0, -48.4, 's');
  },
};

MAPS.aqb2 = {
  name: 'B2 - THE DEEP',
  env(st) {
    if (st.day >= 8) return { fog: '#010204', fogNear: 3, fogFar: 22, ambient: [0.18, 0.2, 0.3], clear: '#000000', sub: 2, sat: 0.5, snap: 1.4, affine: 1, wobble: 0.01 };
    return { fog: '#020408', fogNear: 7, fogFar: 30, ambient: [0.3, 0.36, 0.46], clear: '#000000', sub: 2, sat: 0.6, affine: 1 };
  },
  cam: { mode: 'follow', yaw: 0, pitch: 46, dist: 8, fov: 56, lookY: 0.8, ahead: 0.8 },
  music() { return null; },
  amb(st) { return st.day >= 8 ? ['deep'] : ['deep', 'drips', 'hum']; },
  onEnter(S, st) {
    if (st.flags.b2Seen) return;
    S.flag('b2Seen');
    return S.say(null, 'The air down here is cold and completely still. It smells like a swimming pool that nobody has used in a long time.');
  },
  build(M, st) {
    const d = st.day, late = d >= 8, H = 3.4, lk = late ? 0.25 : 0.6;
    const zone = (x0, z0, x1, z1, o) => M.cam(x0, z0, x1, z1, Object.assign({ mode: 'follow', yaw: 0, pitch: 48, dist: 7.5, fov: 56, lookY: 0.8, ahead: 0.8, clamp: [x0 + 0.6, z0 + 0.6, x1 - 0.6, z1 - 0.4] }, o || {}));

    // ---------------------------------------------------------------- elevator lobby
    M.room(-4, -4, 4, 4, H, { floor: 'grate', wall: 'concrete_dark', trim: 'rust', gaps: [{ side: 'n', at: 0, w: 2.4 }] });
    M.door(0, 4, 'n', { tex: 'door_freight', w: 2.6, h: 2.6, use: async (S) => Story.freightUp(S), mat: null, spill: ['#e8e0a0', 0.18] });
    M.decal('sign_b2', 3.98, 2.2, 0, 1.0, 0.8, 'w', { off: 0.02 });
    M.look(-3.2, 2.6, (s) => s.day >= 6 ? 'Wet footprints on the grate, going from the elevator into the dark. Small ones. None coming back.' : 'The grate floor rings under your feet. Under it, a long way down, water moves.', { r: 1.2 });
    M.light(0, 3, 0, 6, '#e8e0a0', lk * 0.8);
    zone(-4, -4, 4, 4);
    M.spawn('elevator', 0, 2.2, 'n');

    // ---------------------------------------------------------------- the viewing gallery, under Tank 6
    const gGaps = [{ side: 's', at: 0, w: 2.4 }, { side: 's', at: -11, w: 1.8 }, { side: 's', at: 11, w: 1.8 }, { side: 'e', at: -10, w: 1.8 }, { side: 'n', at: 0, w: 26, h: 3.2 }];
    if (late) gGaps.push({ side: 'w', at: -10, w: 1.6 });
    M.room(-18, -16, 18, -4, H + 0.6, { floor: 'carpet_blue', wall: 'wall_navy', trim: 'black', gaps: gGaps });
    M.decal('sign_gallery', 0, 3.55, -15.96, 4.4, 0.55, 's', { off: 0.04 });
    for (const x of [-8, 0, 8]) { M.bench(x, -8, 'n'); M.box(x, 0.45, -8, 2.0, 0.02, 0.6, 'plastic_white', { solid: false, alpha: 0.5, blend: true }); }
    M.look(-8, -7.2, 'Benches for the viewing gallery. They still have the plastic on them. Nobody ever sat here.', { r: 1.2 });
    // the tank beyond the glass
    const TZ0 = -32, TZ1 = -16, TY = -1.4;
    M.floor(-13, TZ0, 13, TZ1, 'tile_blue', { y: TY, tile: 2 });
    M.floor(-4, -27, 4, -21, 'concrete_new', { y: TY + 0.02, tile: 2 });
    M.wall(-13, TZ0, 13, TZ0, 6, 'tile_blue', { face: 's', y0: TY, lit: false, bright: 0.85, color: '#6a9ac8' });
    M.wall(-13, TZ0, -13, TZ1, 6, 'tile_blue', { face: 'e', y0: TY, lit: false, bright: 0.7, color: '#6a9ac8' });
    M.wall(13, TZ0, 13, TZ1, 6, 'tile_blue', { face: 'w', y0: TY, lit: false, bright: 0.7, color: '#6a9ac8' });
    M.wall(-13, TZ1, 13, TZ1, -TY, 'black', { face: 's', y0: TY, lit: false });
    for (const [z, a] of [[-20, 0.16], [-25, 0.18], [-30, 0.22]]) M.plane('water_dark', [-13, TY, z], [1, 0, 0], [0, 1, 0], 26, 6, { blend: true, alpha: a, lit: false, scroll: [0.01, 0.004], sub: 99, color: '#1a4a6a' });
    M.plane('water_tank', [-13, -0.1, -16.05], [1, 0, 0], [0, 1, 0], 26, 3.3, { blend: true, alpha: 0.28, lit: false, scroll: [0.004, 0.002], sub: 99, color: '#3a7aa8' });
    M.solid(-13, -16.4, 13, -15.9);
    M.light(0, 2.5, -24, 16, '#5a9ad8', late ? 0.7 : 1.1); M.light(0, 0, -24, 6, '#c8d8e0', late ? 0.4 : 0.6);
    for (let i = 0; i < (d >= 6 ? 10 : 3); i++) M.ent({ type: 'sprite', region: 'bubble', x: -0.4 + (i % 3) * 0.4, y: TY + (i * 0.5) % 4.5, z: -24 + (i % 2) * 0.4, w: 0.14, h: 0.14, sp: 0.4 + (i % 3) * 0.15, update(e, dt) { e.y += e.sp * dt; if (e.y > 4.4) e.y = TY; } });
    if (late) M.ent({ type: 'char', set: 'evan_ghost', x: 0, z: -24, y: TY, face: 0, scale: 0.8, noShadow: true });
    M.inter(0, -15, { r: 3.2, y: 1.2, use: async (S) => Story.deepWindow(S) });
    M.look(-14.5, -15, 'A little brass plaque by the glass: 40,000 GALLONS. THE DEEPEST TANK IN THE STATE. The word STATE has been scratched out and WORLD written over it.', { r: 1.1 });
    M.light(-10, 3, -10, 8, '#8ab0e0', lk * 0.7); M.light(10, 3, -10, 8, '#8ab0e0', lk * 0.7);
    zone(-18, -16, 18, -4, { pitch: 20, dist: 8, lookY: 1.6, ahead: 3, clamp: [-16.5, -13, 16.5, -1] });
    M.light(-16.5, 2.4, -10, 5, '#c8b8a0', lk * 0.8);
    // the bricked up doorway (until the very end)
    if (!late) {
      M.decal('bricks_new', -17.98, 0, -10, 1.6, 2.4, 'e', { off: 0.02 });
      M.inter(-17.2, -10, { r: 1.2, y: 1.2, use: async (S) => Story.bricks(S) });
    } else {
      M.room(-26, -14, -18, -6, 3, { floor: 'carpet_grey', wall: 'wallpaper_evan', trim: 'wood_light', gaps: [{ side: 'e', at: -10, w: 1.6 }] });
      for (let i = 0; i < 14; i++) M.floorDecal('bricks_new', -16.8 + (i % 4) * 0.5, -11.6 + Math.floor(i / 4) * 1.1, 0.5, 0.35, { y: 0.02 + i * 0.002 });
      M.chair(-22, -10.6, 'n', 'wood');
      M.tvStand(-22, -13.3, 's', 'tv_you');
      M.inter(-22, -12, { r: 1.5, y: 1.2, use: async (S) => Story.roomTV(S) });
      for (const [r, x, z] of [['dr_tank', -25.98, -12], ['dr_fish', -25.98, -9], ['dr_dad', -25.98, -7.4]]) M.decal(r, x, 1.4, z, 1.0, 0.8, 'e');
      M.look(-25.2, -9, 'Drawings, taped up all over the walls. They\'re all of this room. In every one of them there\'s a TV, and a kid watching it.', { r: 1.2 });
      M.light(-22, 1.4, -12.4, 5, '#9ab8e8', 0.8);
      zone(-26, -14, -18, -6);
    }

    // ---------------------------------------------------------------- planning office (southwest)
    M.room(-18, -4, -4, 6, H, { floor: 'carpet_grey', wall: 'wall_cream', trim: 'wood_dark', gaps: [{ side: 'n', at: -11, w: 1.8 }] });
    M.decal('sign_plan', -11, 2.7, -4.02, 1.2, 0.35, 's', { off: 0.03 });
    M.desk(-15, 4.8, 'n', 1.8);
    M.table(-9, 1, 3, 2, 0.9, 'wood_light', 's');
    // an architect's model of the aquarium, with the Deep in it
    M.box(-9, 0.9, 1, 2.4, 0.3, 1.4, { top: 'tile_aqua', sides: 'wall_white' }, { solid: false });
    M.box(-8.2, 1.2, 0.8, 0.6, 0.3, 0.6, { top: 'water_tank', sides: 'glass_dark' }, { solid: false });
    M.box(-9.6, 1.2, 1.3, 0.9, 0.2, 0.5, 'wall_white', { solid: false });
    M.look(-9, 0, ['An architect\'s model of the aquarium, with the new tank in it. Tiny people stand at the glass.', 'Under the tank, in the model, somebody has glued a tiny square of grey paper.'], { r: 1.6 });
    M.pickup(-10.4, 1.9, 'blueprint', { y: 0.92, r: 1.3, text: 'A blueprint, rolled up tight, with a rubber band around it.' });
    M.decal('cal_pour', -17.98, 1.5, 1, 0.6, 0.75, 'e');
    M.look(-17.2, 1, ['A calendar, AUGUST 1991.', 'The 12th has a cake drawn on it. The 14th says ROTARY 7PM.', 'The 15th is circled so many times the pen went through the paper. It says POUR. RUSH.'], { r: 1.1 });
    M.billboard('flat_phone', -14.4, 4.6, 0.5, 0.5, { y: 0.78 });
    M.look(-15, 4, (s) => s.day >= 7 ? 'A desk phone, off the hook. Faintly, from the earpiece: "...Harbor Concrete, can I help you? ...Hello?"' : 'A desk phone, off the hook. The dial tone gave up a long time ago.', { r: 1.3 });
    M.light(-11, 3, 1, 8, '#f0e8d0', lk);
    zone(-18, -4, -4, 6);

    // ---------------------------------------------------------------- records (southeast)
    M.room(4, -4, 18, 6, H, { floor: 'tile_grey', wall: 'wall_grey', gaps: [{ side: 'n', at: 11, w: 1.8 }] });
    M.decal('sign_vault', 11, 2.7, -4.02, 1.1, 0.35, 's', { off: 0.03 });
    for (const x of [5.4, 6.8, 8.2, 9.4, 12.6, 14, 15.4, 16.8]) M.box(x, 0, -3.4, 1.1, 1.8, 0.9, { top: 'metal', sides: 'metal', s: '@drawers_front' }, { solid: true, fit: { s: true } });
    for (const z of [0.4, 2.6]) M.box(4.6, 0, z, 0.9, 1.8, 2.0, { top: 'metal', sides: 'metal', e: '@drawers_front' }, { solid: true, fit: { e: true } });
    M.pickup(14, -2.4, 'personnel', { y: 0.9, r: 1.2, text: 'One drawer is open a crack. In it, one folder, on its own.' });
    M.table(12, 3.6, 2.4, 1.2, 0.8, 'metal', 's'); M.chair(12, 2.6, 'n', 'metal');
    M.look(12, 2.6, 'A reading table. Somebody left a magnifying glass on it, and a school photo, face down.', { r: 1.2 });
    M.decal('clip_missing', 17.98, 1.6, -1.6, 0.6, 0.75, 'w'); M.decal('clip_missing', 17.98, 1.5, -0.6, 0.55, 0.7, 'w');
    M.look(17.2, -1.1, ['Newspaper clippings pinned up in a row. BOY, 10, MISSING. SEARCH FOR VANE BOY GOES ON.', 'SEARCH CALLED OFF. Then nothing, for ten years. Then a very small one: AQUARIUM TO CLOSE.'], { r: 1.2 });
    M.movingBox(8, 3.6, 0.8);
    M.look(8, 2.8, ['A box: E.V. - DONATE. It was taped shut and then opened again, and taped again, and opened again.', 'Inside, folded very neatly: a striped shirt that\'s missing one sleeve.'], { r: 1.1, cond: (s) => s.day >= 6 });
    M.look(8, 2.8, 'A box: E.V. - DONATE. It\'s taped shut. The tape has been cut and replaced a lot of times.', { r: 1.1, cond: (s) => s.day < 6 });
    // the loose panel into the crawlspace
    M.decal('crawl_panel', 17.98, 0.05, 2, 0.8, 0.55, 'w', { off: 0.02 });
    M.inter(17.2, 2, { r: 1.1, y: 0.5, exit: true, use: async (S) => Story.crawlIn(S) });
    M.light(11, 3, 1, 8, '#e8eef0', lk * 0.9);
    zone(4, -4, 18, 6);

    // ---------------------------------------------------------------- life support (east)
    M.room(18, -16, 30, -4, H, { floor: 'concrete', wall: 'concrete_dark', trim: 'rust', gaps: [{ side: 'w', at: -10, w: 1.8 }] });
    M.decal('sign_life', 18.02, 2.6, -8, 1.3, 0.55, 'e', { off: 0.02 });
    M.pumpMachine(23, -14.4, 's'); M.pumpMachine(27, -14.4, 's');
    M.decal('pipes', 24, 1.2, -15.97, 10, 2.2, 's', { off: 0.02 });
    M.box(29.2, 0.5, -9, 1.0, 1.6, 1.6, 'rust', { solid: true });
    M.decal('valve_wheel', 28.68, 1.3, -9, 0.8, 0.8, 'w', { off: 0.02 });
    M.look(28, -9, ['A big valve: T6 DRAIN. DO NOT OPEN.', 'The wheel has been welded to the pipe, all the way round. Someone made very sure.'], { r: 1.3 });
    M.decal('gauge_t6', 25, 1.6, -15.95, 0.5, 0.5, 's', { off: 0.04 });
    M.chair(25, -11.6, 'n', 'metal');
    M.look(25, -10.6, ['A folding chair, facing the T6 gauge. On the floor around it: cigarette butts, a thermos lid, a flashlight with dead batteries.', 'Somebody sat here and watched the needle. For a lot of nights.'], { r: 1.3 });
    M.light(24, 3, -10, 8, '#a8f0a0', lk * 0.7);
    zone(18, -16, 30, -4);

    // ---------------------------------------------------------------- the crawlspace and Evan's hideout
    M.room(22, 0, 40, 2, 1.3, { floor: 'concrete_dark', wall: 'concrete_dark', gaps: [{ side: 'e', at: 1, w: 1.6 }] });
    M.inter(22.6, 1, { r: 1.0, y: 0.5, exit: true, use: async (S) => Story.crawlOut(S) });
    for (let x = 26; x < 40; x += 4) M.floorDecal('chalk_arrow', x, 1, 0.6, 0.6, { y: 0.02, rot: -Math.PI / 2 });
    M.look(31, 1, 'It\'s a tight squeeze. Along the wall, at kid height, someone has written the times tables in chalk, up to 9.', { r: 1.2 });
    M.light(30, 1, 1, 5, '#c8b890', 0.35);
    M.cam(22, 0, 40, 2, { mode: 'follow', yaw: 90, pitch: 24, dist: 4.5, fov: 60, lookY: 0.5, ahead: 1.6, lag: 3 });
    M.spawn('crawl', 23.2, 1, 'e');

    M.room(40, -4, 50, 6, 2.2, { floor: 'carpet_red', wall: 'concrete_dark', gaps: [{ side: 'w', at: 1, w: 1.6 }] });
    M.floorDecal('blanket_fish', 46.5, 3.2, 3.2, 2.4, { y: 0.02 });
    M.box(47.5, 0, 4.4, 2.4, 0.4, 1.2, 'fabric_blue', { solid: true });
    M.look(47.5, 3.4, 'A nest of blankets and couch cushions. It\'s been slept in. Not recently.', { r: 1.3 });
    M.decal('chalk_hs', 49.98, 1.1, 0, 1.8, 0.9, 'w', { off: 0.02 });
    M.look(49.2, 0, ['Chalk on the wall: HIDE AND SEEK.', 'EVAN: fourteen marks. DAD: 0.', 'Under DAD someone added, much later, in grown-up handwriting: 1.'], { r: 1.2 });
    for (const [r, x] of [['dr_octopus', 42.5], ['dr_house', 44.5], ['dr_cat', 46.5]]) M.decal(r, x, 1.2, -3.98, 0.9, 0.75, 's');
    M.look(44.5, -3.2, 'Crayon drawings taped to the concrete: an octopus, a house, a cat. The house has a fish tank where the front door should be.', { r: 1.3 });
    M.pickup(42, 3.6, 'walkie', { r: 1.2, text: 'A walkie-talkie, on top of a stack of comic books. It\'s switched on.' });
    M.pickup(44.8, -1.6, 'keeper_badge', { r: 1.1, text: 'Something laminated, face down in the blankets.' });
    M.cyl(42.6, 0, 0.4, 0.1, 0.5, 'plastic_red', { sides: 6, solid: false });
    M.look(42.6, 1.2, 'A flashlight, standing on its end like a lamp, pointed at the ceiling. It\'s still on. It shouldn\'t be.', { r: 1.0 });
    M.light(42.6, 1.8, 0.4, 6, '#ffe8a0', 0.9);
    zone(40, -4, 50, 6, { pitch: 52, dist: 6.5 });
  },
};
