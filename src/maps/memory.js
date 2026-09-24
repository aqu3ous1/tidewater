'use strict';
// ---------------------------------------------------------------------------
// THE UNDERNEATH — what is under the game. Unfinished floors floating in the
// dark, test textures, things that were never supposed to be seen. And the
// seven places where Walter keeps his version of August 14, 1991.
// ---------------------------------------------------------------------------

const TABLEAUX = [
  {
    id: 1, x: -11, z: -30, lie: 'HE RAN AWAY.', truth: 'HE WENT TO SEE MISTER EIGHT.',
    walter: 'He ran away on the thirteenth. He packed a bag and he took the evening bus to the city.',
    accept: ['feeding_log', 'toby_letter'],
    truthLines: [['evan', 'It was the fourteenth. Dad was at Rotary. I had the back door key.'], ['evan', 'I fed Mister Eight at 9:40. Two crabs. He took both. He knows it\'s me.']],
    lieProps: [['evan_n1', -0.4, 0, 0.9, 1.4, 's'], ['sign_busstop', 0.8, -0.3, 0.8, 0.8, 's', 0.9]],
    truthProps: [['evan_s0', -0.5, 0.2, 0.9, 1.4, 's'], ['flat_tank', 0.5, -0.6, 1.8, 1.2, 's', 0.1], ['octopus_0', 0.5, -0.5, 0.9, 0.8, 's', 0.3]],
  },
  {
    id: 2, x: -13, z: -39, lie: 'HE BROKE IT.', truth: 'IT WAS ALREADY BROKEN.',
    walter: 'He broke the valve. He was always breaking things. He touched everything.',
    accept: ['work_order'],
    truthLines: [['evan', 'I was doing Radio Evan. I was showing the pump room. The valve was leaking again.'], ['evan', 'I didn\'t touch it. It just cracked. The water came out so fast.'], [null, 'The work order says: REPLACE IMMEDIATELY. Deferred. W.V.']],
    lieProps: [['evan_e2', -0.5, 0, 0.9, 1.4, 's'], ['valve_wheel', 0.6, -0.3, 0.8, 0.8, 's', 0.5]],
    truthProps: [['evan_s0', -0.6, 0.3, 0.9, 1.4, 's'], ['pipes', 0.5, -0.4, 1.6, 1.6, 's'], ['valve_wheel', 0.5, -0.35, 0.8, 0.8, 's', 0.5]],
  },
  {
    id: 3, x: -9, z: -47, lie: 'HE ATTACKED ME.', truth: 'YOU GRABBED HIM.',
    walter: 'He attacked me. He came at me like an animal. I had to hold him back.',
    accept: ['tape12'],
    truthLines: [['tape', '"LOOK WHAT YOU DID. LOOK AT IT."'], ['evan_tape', '"Dad you\'re hurting my arm—"'], [null, 'You heard it. You heard all of it.']],
    lieProps: [['evan_e1', -0.5, 0, 0.9, 1.4, 's'], ['walter_s0', 0.5, -0.1, 1.1, 1.75, 's']],
    truthProps: [['walter_e1', -0.5, -0.1, 1.1, 1.75, 's'], ['evan_s0', 0.4, 0.1, 0.9, 1.4, 's']],
  },
  {
    id: 4, x: 0, z: -50, lie: 'HE SLIPPED.', truth: 'HE HIT THE STAIRS.',
    walter: 'He slipped. The floor was wet. It was an accident. Nobody pushed anybody.',
    accept: ['tooth', 'fabric'],
    truthLines: [[null, 'The third step. A torn striped sleeve. A small tooth in the crack.'], [null, 'He didn\'t slip.']],
    lieProps: [['flat_stairs', 0.4, -0.4, 1.4, 1.4, 's'], ['evan_s0', -0.5, 0.1, 0.9, 1.4, 's']],
    truthProps: [['flat_stairs', 0.4, -0.4, 1.4, 1.4, 's'], ['walter_n0', -0.6, 0, 1.1, 1.75, 's']],
    truthFloor: ['evan_e0', 0.2, 0.4, 1.2, 0.8],
  },
  {
    id: 5, x: 9, z: -47, lie: 'I CALLED FOR HELP.', truth: 'YOU CALLED NO ONE.',
    walter: 'I called for help. I called and called. Nobody came.',
    accept: ['phone_bill'],
    truthLines: [[null, '8/14: NO CALLS.'], [null, '8/15, 6:02 AM: HARBOR CONCRETE.']],
    lieProps: [['walter_s1', -0.3, 0, 1.1, 1.75, 's'], ['flat_phone', 0.6, -0.2, 0.6, 0.75, 's', 0.6]],
    truthProps: [['walter_n0', -0.3, 0, 1.1, 1.75, 's'], ['flat_phone', 0.7, -0.2, 0.6, 0.75, 's', 0.1]],
  },
  {
    id: 6, x: 13, z: -39, lie: "I DON'T KNOW WHERE HE IS.", truth: 'HE IS UNDER TANK 6.',
    walter: 'I don\'t know where he went. I looked everywhere. I never stopped looking.',
    accept: ['concrete', 'shoe'],
    truthLines: [[null, 'Delivered 8/15/91, 7:30 AM. Three cubic yards. RUSH. "No need to inspect."'], [null, 'He never went anywhere.']],
    lieProps: [['walter_s0', 0, 0, 1.1, 1.75, 's']],
    truthProps: [['flat_truck', 0.3, -0.6, 2.0, 1.2, 's']],
    truthFloor: ['shoe_flat', -0.6, 0.4, 0.5, 0.3],
  },
  {
    id: 7, x: 11, z: -30, lie: 'I TOLD THEM THE TRUTH.', truth: 'YOU WAITED THREE DAYS.',
    walter: 'I told the sheriff the truth. He ran away. He had problems. He took his inhaler with him.',
    accept: ['report', 'inhaler'],
    truthLines: [[null, 'Reported 8/17. "Last seen 8/13." "He took the bus." There was no bus.'], [null, 'His inhaler was in his backpack. In your locker. For ten years.']],
    lieProps: [['walter_s0', -0.3, 0, 1.1, 1.75, 's'], ['icon_report', 0.6, -0.2, 0.6, 0.6, 's', 0.8]],
    truthProps: [['walter_n1', -0.3, 0, 1.1, 1.75, 's'], ['flat_calendar', 0.6, -0.3, 0.6, 0.75, 's', 0.8]],
  },
];

// walkable areas of the underneath (everything else is the dark)
const UNDER_WALK = [
  [-4.5, -4, 4.5, 7],        // arrival
  [-1.6, -21, 1.6, -3.5],    // spine
  [-12, -16, -4, -7],        // design desk
  [-4.6, -13, -1.4, -10],    // bridge to desk
  [4, -15, 12, -6],          // floating house
  [1.4, -12, 4.6, -9.5],     // bridge to house
  [-18, -2, -8, 3],          // exit bridge + platform
  [-8.5, -1, -4.2, 1.2],
  [-17, -53, 17, -20],       // the hub
];

MAPS.underneath = {
  name: 'UNDERNEATH',
  walkable: UNDER_WALK,
  env(st) {
    const n = Story.rememberCount(st);
    return { fog: '#000000', fogNear: 10, fogFar: 42, ambient: [0.62, 0.62, 0.66], clear: '#000000', sub: 3, sat: 0.35 + n * 0.04, snap: 1.4 + n * 0.25, affine: 1, wobble: 0.015 + n * 0.012 };
  },
  cam: { mode: 'follow', yaw: 0, pitch: 38, dist: 10, fov: 56, lookY: 0.8, ahead: 1.2, lag: 3.5 },
  music(st) { return 'underneath'; },
  amb() { return ['deep']; },
  build(M, st) {
    const f = st.flags;
    const plat = (x0, z0, x1, z1, tex, y) => {
      M.floor(x0, z0, x1, z1, tex || 'dev_checker', { tile: 4, y: y || 0 });
      M.box((x0 + x1) / 2, -2, (z0 + z1) / 2, x1 - x0, 2 + (y || 0), z1 - z0, 'dev_grid', { top: false, solid: false });
    };
    // --- arrival
    plat(-4.5, -4, 4.5, 7);
    M.floorDecal('dev_spawn', 0, 4, 1.6, 1.6, { y: 0.03 });
    M.cutout('flat_door', 0, 6.4, 1.3, 2.4, 's');
    M.look(0, 5.6, 'The door you came in through. There is no room on the other side of it. Just the back of the door.', { r: 1.1 });
    Decals.sign('lbl_kaylee', 'KAYLEE', { bg: '#1a1a1a', fg: '#40e840', border: '#40e840', pad: 2, padY: 1 });
    Decals.sign('lbl_marcus', 'MARCUS', { bg: '#1a1a1a', fg: '#40e840', border: '#40e840', pad: 2, padY: 1 });
    Decals.sign('lbl_you', st.name, { bg: '#1a1a1a', fg: '#40e840', border: '#40e840', pad: 2, padY: 1 });
    Decals.sign('lbl_spawn', 'PLAYER_START', { bg: '#1a1a1a', fg: '#e8e840', border: '#e8e840', pad: 2, padY: 1 });
    Decals.sign('lbl_remember', 'REMEMBER', { bg: '#000000', fg: '#e8e4d8', border: false, pad: 2, padY: 1 });
    Atlas.upload();
    M.billboard('lbl_spawn', 0, 4, 1.8, 0.35, { y: 2.2 });
    M.ent({ type: 'char', set: 'helmet_kaylee', x: 3.6, z: -3.4, face: 0, noShadow: false });
    M.solidCircle(3.6, -3.4, 0.35);
    M.billboard('lbl_kaylee', 3.6, -3.4, 1.2, 0.3, { y: 2.2 });
    M.look(3.6, -2.8, ['She doesn\'t move. She is standing right at the edge, looking down.', 'The inside of her helmet is fogged up.'], { r: 1.2 });
    M.floorDecal('sheet', 2.6, -2.2, 0.5, 0.5, { y: 0.03 });
    M.inter(2.6, -2.2, { r: 0.9, y: 0.6, use: async (S) => S.read('note_kaylee') });
    // --- spine north, with things from the house floating around it
    plat(-1.6, -21, 1.6, -3.5);
    for (let z = -6; z > -20; z -= 4) M.floorDecal('dev_arrow', 0, z, 1.0, 1.0, { y: 0.03, rot: 'n' });
    M.at(-4, -6, 'e', () => M.couch(0, 0, 2.4, 's', 'fabric_green'), 1.6);
    M.at(4.5, -18, 'w', () => M.tvStand(0, 0, 's', 'tv_you'), 0.9);
    M.cutout('flat_chair', -2.6, -17, 0.9, 1.35, 'e', { y: 0.7 });
    M.cutout('flat_bed', 3.6, -3, 2.0, 1.25, 'w', { y: 1.4 });
    M.at(-3, -20, 's', () => M.stairsUp(0, 0, 's', 1.4, 8, 'dev_grid'), -0.5);
    // --- design desk platform (and Marcus)
    plat(-12, -16, -4, -7); plat(-4.6, -13, -1.4, -10);
    M.desk(-9, -13.6, 's', 1.8, 'dev_grid');
    M.floorDecal('sheet', -9.5, -12.2, 0.5, 0.5, { y: 0.03 }); M.floorDecal('sheet', -8.7, -12.0, 0.5, 0.5, { y: 0.03 }); M.floorDecal('sheet', -9.0, -11.3, 0.5, 0.5, { y: 0.03 });
    M.inter(-9.6, -12.2, { r: 0.8, y: 0.8, use: async (S) => S.read('design1') });
    M.inter(-8.6, -12.0, { r: 0.8, y: 0.8, use: async (S) => S.read('design2') });
    M.inter(-9.0, -11.2, { r: 0.8, y: 0.8, use: async (S) => S.read('design3') });
    M.ent({ type: 'char', set: 'helmet_marcus', x: -11.2, z: -8, face: -Math.PI / 2 });
    M.solidCircle(-11.2, -8, 0.35);
    M.billboard('lbl_marcus', -11.2, -8, 1.2, 0.3, { y: 2.2 });
    M.look(-10.6, -8, ['He is facing nothing. His hand is raised a little, like he was about to knock.'], { r: 1.2 });
    M.floorDecal('sheet', -10.2, -9.1, 0.5, 0.5, { y: 0.03 });
    M.inter(-10.2, -9.1, { r: 0.8, y: 0.6, use: async (S) => S.read('note_marcus') });
    // --- floating house bits
    plat(4, -15, 12, -6, 'wood_floor'); plat(1.4, -12, 4.6, -9.5);
    M.decal('frame_empty', 8, 1.2, -14.9, 1.2, 0.9, 's');
    M.decal(f.photoHung === 'family' ? 'ph_family' : 'ph_you_walter', 10.2, 1.2, -14.9, 1.2, 0.9, 's');
    M.box(8, 0, -15, 8, 2.4, 0.2, 'wallpaper_floral', { top: false });
    M.look(10.2, -14, (s) => s.flags.photoHung === 'family' ? 'The photo you hung. Ruth, Evan, Walter, and a kitten. Here, it\'s the only thing in color.' : 'The photo from your living room. Walter\'s hand is on your helmet. You don\'t remember it being taken.', { r: 1.2 });
    M.fridge(6, -11, 'e');
    M.look(6.8, -11, 'Your fridge. The milk is in it. It\'s still cold.', { r: 1.1 });
    // far away: you
    M.ent({ type: 'char', set: 'player', x: 26, z: -2, face: 0, noShadow: true });
    M.billboard('lbl_you', 26, -2, 1.2, 0.3, { y: 2.2 });
    // --- exit
    plat(-18, -2, -8, 3); plat(-8.5, -1, -4.2, 1.2);
    M.cutout('door_white_light', -16.5, 0.2, 1.4, 2.5, 'e');
    M.billboard('sign_exit_white', -16.5, 0.2, 1.0, 0.4, { y: 2.8 });
    M.inter(-15.6, 0.2, { r: 1.4, y: 1.6, use: async (S) => Story.exitUnderneath(S) });
    // --- the hub: the aquarium as he remembers it, before anything was built
    plat(-17, -53, 17, -20, 'dev_grid');
    M.floor(-5, -40, 5, -32, 'abc_carpet', { y: 0.02, tile: 5 });
    // blank tanks
    for (const [x, z, w, face] of [[-16, -26, 4, 'e'], [16, -26, 4, 'w'], [-6, -52.5, 5, 's'], [6, -52.5, 5, 's']]) M.at(x, z, face, () => M.box(0, 0, 0, w, 3, 1, { sides: 'white', top: 'white' }, { solid: true }));
    M.at(0, -53.2, 's', () => M.box(0, 3.6, 0, 9, 2.2, 0.2, { s: '@aq_sign_old', sides: 'dev_grid' }, { solid: false, fit: { s: true } }), 0);
    const air = { x0: -14, x1: 14, y0: 2.2, y1: 5, z0: -50, z1: -24, front: [0, 0, 1] };
    World.fishTank(M, air, ['fish0', 'fish1', 'fish2', 'fish3', 'fish4', 'fish5'], 16, { scale: 1.6 });
    World.fishTank(M, { x0: -10, x1: 10, y0: 3.5, y1: 5.5, z0: -45, z1: -30, front: [1, 0, 0] }, ['jelly'], 6, { scale: 1.4 });
    M.pickup(0, -24, 'fc12', { y: 1.4 });
    M.billboard('lbl_remember', 0, -36, 3.2, 0.7, { y: 3.4, cond: (s) => Story.rememberCount(s) < 7 });
    // tableaux
    for (const tb of TABLEAUX) {
      const done = !!f['rem_' + tb.id];
      M.box(tb.x, 0, tb.z, 3.2, 0.25, 3.2, { top: done ? 'white' : 'dev_checker', sides: 'dev_grid' }, { solid: false });
      const props = done ? tb.truthProps : tb.lieProps;
      for (const [reg, dx, dz, w, h, face, y] of props) M.cutout(reg, tb.x + dx, tb.z + dz, w, h, face, { y: 0.25 + (y || 0) });
      if (done && tb.truthFloor) { const [reg, dx, dz, w, h] = tb.truthFloor; M.floorDecal(reg, tb.x + dx, tb.z + dz, w, h, { y: 0.28, rot: 'e' }); }
      const lbl = 'tb_' + tb.id + (done ? 't' : 'l');
      Decals.sign(lbl, done ? tb.truth : tb.lie, { bg: done ? '#e8e4d8' : '#101010', fg: done ? '#1a1a1a' : '#e8e4d8', border: done ? '#1a1a1a' : '#8a8a8a', pad: 3, padY: 2 });
      M.billboard(lbl, tb.x, tb.z, Math.max(2.4, (done ? tb.truth : tb.lie).length * 0.14), 0.45, { y: 2.6 });
      M.inter(tb.x, tb.z + 1.4, { r: 1.8, y: 2.2, use: async (S) => Story.tableau(S, tb) });
    }
    Atlas.upload();
    M.spawn('arrive', 0, 3, 'n');
    M.spawn('hub', 0, -22, 'n');
  },
  update(dt, st) { if (Story.underUpdate) Story.underUpdate(dt, st); },
};

// ---------------------------------------------------------------------------
// The white room, for the end.
// ---------------------------------------------------------------------------
MAPS.whiteroom = {
  name: '',
  walkable: [[-6, -8, 6, 6]],
  env: () => ({ fog: '#f8f8f2', fogNear: 4, fogFar: 22, ambient: [1.2, 1.2, 1.2], clear: '#f8f8f2', sub: 4, sat: 0.9 }),
  cam: { mode: 'follow', yaw: 0, pitch: 25, dist: 7, fov: 55, lookY: 0.8, ahead: 1 },
  music() { return null; },
  amb() { return []; },
  build(M) {
    M.floor(-30, -40, 30, 20, 'white', { tile: 4, lit: false });
    M.floor(-2.5, -6, 2.5, -1, 'concrete_new', { y: 0.01, tile: 2 });
    M.spawn('start', 0, 4, 'n');
  },
};
