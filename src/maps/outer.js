'use strict';
// ---------------------------------------------------------------------------
// PAST THE EDGE OF TOWN
//   woods     the trail south of Oak Street (open from day 4). Paths through
//             the trees: the creek (it runs uphill), the abandoned search
//             camp, a hunting stand, a mailbox that shouldn't be there, a
//             ring of stones, and a dead tree with a door in it. North of the
//             stones the path goes round in a circle until day 6; after that
//             it reaches the cannery.
//   cannery   the Bellwood Canning Co., closed 1979: the yard and smokestack,
//             receiving, the canning floor (line 3), the cold room, the
//             foreman's office, the boiler room, and a model of the town.
// The woods map uses walkable rects (the paths); the trees are everywhere else.
// ---------------------------------------------------------------------------

const WOODS_PATHS = [
  [-5, -5, 5, 5],            // trailhead
  [-1.4, -28, 1.4, -5],      // the trail north
  [-5, -36, 5, -28],         // the fork
  [-30, -33.4, -5, -30.6],   // west to the creek
  [-36, -40, -30, -24],      // creek, near bank
  [-40.5, -33, -35.5, -31],  // the footbridge
  [-46, -40, -40, -24],      // creek, far bank
  [-62, -33.4, -46, -30.6],  // west to the camp
  [-76, -42, -62, -22],      // the search camp
  [-1.4, -64, 1.4, -36],     // north to the stones
  [-7, -76, 7, -64],         // the stones
  [-1.4, -118, 1.4, -76],    // north from the stones
  [-8, -126, 8, -118],       // the cannery gate
  [5, -33.4, 30, -30.6],     // east to the stand
  [30, -42, 44, -22],        // the hunting stand
  [44, -33.4, 62, -30.6],    // east again
  [62, -38, 70, -26],        // the mailbox
  [-30, -71.4, -7, -68.6],   // west from the stones
  [-40, -78, -30, -62],      // the dead tree
  [116, -4, 124, 4],         // inside the dead tree
];

MAPS.woods = {
  name: 'BELLWOOD WOODS',
  env(st) {
    if (st.day >= 8) return { fog: '#d4d4cc', fogNear: 2, fogFar: 22, sky: ['#c8c8c0', '#e4e4dc', 0.5], ambient: [0.85, 0.85, 0.8], sat: 0.3, snap: 1.3, affine: 1 };
    if (st.tod === 'night') return { fog: '#020304', fogNear: 3, fogFar: 17, sky: ['#000000', '#05070a', 0.5], ambient: [0.18, 0.2, 0.26], sat: 0.6 };
    return { fog: '#1a2218', fogNear: 5, fogFar: 28, sky: ['#2a3428', '#4a5a44', 0.5], ambient: [0.5, 0.56, 0.48], sat: 0.7 };
  },
  cam: { mode: 'follow', yaw: 0, pitch: 38, dist: 8, fov: 56, lookY: 1.0, ahead: 1.6, lag: 4 },
  walkable: WOODS_PATHS,
  music() { return null; },
  amb(st) { return st.tod === 'night' ? ['wind', 'crickets'] : st.day >= 8 ? ['wind'] : ['wind', 'birds']; },
  onEnter(S, st) {
    if (st.flags.woodsSeen) return;
    S.flag('woodsSeen');
    return S.say(null, 'Once you\'re in among the trees, you can\'t hear the town at all. Not a car, not a dog. Just the wind, a long way up.');
  },
  build(M, st) {
    const d = st.day, night = st.tod === 'night', late = d >= 8;
    const ground = late ? 'grass_dead' : 'grass';
    // the forest floor, then the paths
    M.floor(-90, -140, 80, 14, ground, { tile: 5, sub: 16, color: late ? null : '#6a8a5a', surface: false });
    for (const [x0, z0, x1, z1] of WOODS_PATHS) { if (x0 > 100) continue; M.floor(x0, z0, x1, z1, 'dirt', { y: 0.02, tile: 3 }); }
    // trees everywhere near a path, but not on it
    const rng = makeRng(1991);
    const onPath = (x, z, pad) => WOODS_PATHS.some(([x0, z0, x1, z1]) => x > x0 - pad && x < x1 + pad && z > z0 - pad && z < z1 + pad);
    for (let x = -86; x < 76; x += 2.7) for (let z = -136; z < 12; z += 2.7) {
      const tx = x + (rng() - 0.5) * 1.8, tz = z + (rng() - 0.5) * 1.8;
      if (onPath(tx, tz, 1.1) || !onPath(tx, tz, 9)) continue;
      const k = late ? (rng() < 0.7 ? 'tree_dead' : 'tree_pine') : (rng() < 0.12 ? 'tree_dead' : 'tree_pine');
      const s = 0.9 + rng() * 0.6;
      M.billboard(k, tx, tz, (k === 'tree_pine' ? 2.4 : 3.2) * s, (k === 'tree_pine' ? 5 : 4.6) * s);
    }
    const lk = night ? 0.25 : late ? 0.2 : 0.5;

    // ---- the trailhead
    M.door(0, 5, 'n', { tex: false, w: 4, to: 'town', spawn: 'trail', sfx: 'step', noCue: true });
    M.postSign(-3.2, -2, 'trail_map', 1.8, 1.2, 's', { y: 0.8 });
    M.look(-3.2, -1.2, ['A trail map in a wooden frame. The trails are drawn in, and a creek, and a clearing.', 'YOU ARE HERE is a red square, right where you\'re standing.', 'There\'s another mark near the top, a red X, where no trail goes. Somebody drew it on the glass, from the inside.'], { r: 1.3 });
    M.bench(3.2, -2.4, 'w'); M.trashcan(3.4, 0.4, 'metal');
    M.look(3.4, 1.1, 'A trash can with a lid that keeps animals out. Inside: a flashlight with the batteries taken out, and put back in the wrong way round.', { r: 1.0 });
    M.spawn('trail', 0, 3, 'n');
    M.look(0, -16, (s) => s.day >= 6 ? 'Footprints in the dirt, going the same way you are. Small ones. You put your foot next to one. It\'s exactly your size.' : 'The trail is soft and quiet. Pine needles. Somebody has walked here recently, and carefully.', { r: 1.6 });

    // ---- the fork
    M.postSign(3.4, -33.8, 'sign_fork', 1.1, 1.1, 's', { y: 0.7 });
    M.look(3.4, -32.8, 'A signpost. CREEK to the left. STONES straight ahead. STAND to the right. Somebody has carved a fourth arrow, pointing back the way you came: HOME?', { r: 1.1 });

    // ---- the creek
    M.floor(-40, -46, -36, -18, 'water', { y: -0.2, tile: 2, scroll: [0, -0.15], lit: false, bright: night ? 0.3 : 0.8, surface: false });
    M.box(-38, 0, -32, 5, 0.25, 2, { top: 'wood', sides: 'wood_dark' }, { solid: false });
    for (const z of [-33.1, -30.9]) M.fence(-40.3, z, -35.7, z, { region: 'rail_wood', h: 0.9 });
    M.look(-33, -26, ['A creek, fast and clear. You watch a leaf float by.', 'It\'s floating uphill.'], { r: 1.6 });
    M.look(-43, -38, (s) => s.day >= 6 ? 'On a flat rock by the water: a pair of small sneakers, laces tied together, set down side by side. They\'re dry.' : 'A flat rock by the water, warm from the sun. Somebody used to sit here. The moss is worn off in two small patches.', { r: 1.3 });
    M.light(-38, 2, -32, 8, night ? '#6a80c0' : '#e8f0e0', lk);

    // ---- the search camp
    M.billboard('tent', -72, -38, 3.2, 2.2, { solidR: 1.4 });
    M.look(-72, -36.4, 'A green canvas tent. Inside: folded blankets, a thermos, boots lined up. Everything is ten years dusty. Nobody came back for any of it.', { r: 1.4 });
    M.cyl(-68, 0, -30, 1.0, 0.25, 'rock', { sides: 8 }); M.cyl(-68, 0.02, -30, 0.7, 0.26, 'concrete_dark', { sides: 8, solid: false, color: '#6a605a' });
    M.look(-68, -28.8, 'A ring of stones around old ashes. Somebody has arranged the burnt sticks in the ashes into letters. HERE.', { r: 1.3 });
    M.table(-66, -38, 2.2, 1.2, 0.8, 'wood'); M.floorDecal('search_map', -66, -38, 1.8, 1.0, { y: 0.83 });
    M.postSign(-63.4, -40.4, 'sign_search', 1.3, 0.7, 's', { y: 1.0 });
    M.look(-66, -36.8, ['A folding table with a map of Bellwood on it, divided into squares. SEARCH HQ.', 'Every square is crossed off in red. Every one, except the square with the aquarium in it.', 'Nobody ever searched the aquarium.'], { r: 1.3 });
    M.pickup(-64.6, -37.6, 'search_flyer', { y: 0.82, r: 1.2, text: 'A stack of flyers under a rock, swollen with rain. The top one is still readable.' });
    M.billboard('lantern', -67.2, -38.2, 0.3, 0.42, { y: 0.8 });
    M.light(-67, 1.4, -37, 7, '#ffd890', night ? 0.8 : 0.3);
    M.cam(-76, -42, -62, -22, { mode: 'follow', yaw: 0, pitch: 44, dist: 8, fov: 56, lookY: 0.9, ahead: 1, clamp: [-75.5, -41.5, -62.5, -14] });

    // ---- the hunting stand
    for (const [x, z] of [[35, -36], [38, -36], [35, -33], [38, -33]]) M.box(x, 0, z, 0.25, 3.4, 0.25, 'wood_dark', { solid: false });
    M.solid(34.8, -36.2, 38.2, -32.8);
    M.box(36.5, 3.2, -34.5, 3.6, 0.2, 3.6, 'wood', { solid: false }); M.box(36.5, 3.4, -36.2, 3.6, 1.0, 0.1, 'wood', { solid: false });
    for (let y = 0.3; y < 3.2; y += 0.45) M.box(36.5, y, -32.7, 0.8, 0.07, 0.1, 'wood', { solid: false });
    M.inter(36.5, -31.8, { r: 1.3, y: 1.4, use: async (S) => Story.huntingStand(S) });
    M.look(41, -26, 'A NO TRESPASSING sign, nailed to a tree. Somebody crossed out TRESPASSING and wrote SWIMMING.', { r: 1.3 });

    // ---- the mailbox
    M.mailbox(66, -32.6, 's', 'mailbox_vane');
    M.inter(66, -31.6, { r: 1.2, y: 1.2, use: async (S) => Story.woodsMailbox(S) });

    // ---- the stones
    for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * Math.PI * 2; M.box(Math.cos(a) * 4.6, 0, -70 + Math.sin(a) * 4.6, 0.8, 1.1 + (i % 3) * 0.3, 0.6, 'rock', { solid: true }); }
    M.box(0, 0, -70, 1.6, 0.35, 1.2, 'rock', { solid: true });
    M.look(0, -68.6, (s) => s.day >= 7 ? ['A flat stone in the middle of the ring. On it: a blue shell, a plastic diver, a juice box, and a school photo, face down.', 'Offerings. Somebody keeps bringing them.'] : ['A ring of stones, and a flat one in the middle, like a table.', 'On it: a blue shell and a plastic diver from a fish tank.'], { r: 1.4 });
    M.light(0, 3, -70, 10, night ? '#8090c8' : '#f0f0d0', lk * 1.2);
    // north of the stones the path goes round in a circle (until day 6)
    if (d < 6) M.trigger(-1.4, -104, 1.4, -100, async (S) => Story.stoneLoop(S), { once: false });
    else {
      M.fence(-8, -125.5, -1.6, -125.5, { region: 'fence_chain', h: 2.2, seg: 3 }); M.fence(1.6, -125.5, 8, -125.5, { region: 'fence_chain', h: 2.2, seg: 3 });
      M.decal('sign_cannery', 0, 2.3, -125.4, 2.6, 0.8, 's', { off: 0.05, twoSided: true });
      M.door(0, -126, 's', { tex: 'fence_chain', w: 3, h: 2.2, to: 'cannery', spawn: 'gate', sfx: 'door' });
      M.look(-5, -121, 'A chain-link fence in the trees, with a gate. The padlock is hanging open. Past it: brick buildings, and the smokestack.', { r: 1.6 });
    }
    M.spawn('gate', 0, -122, 's');

    // ---- the dead tree (with a door in it)
    M.billboard('tree_dead', -35, -73, 7, 9);
    M.solid(-36.6, -76.5, -33.4, -71.7);
    M.cutout('door_tree', -35, -71.6, 1.1, 2.0, 's', { y: 0, lit: true });
    M.door(-35, -71.6, 's', { tex: false, w: 1.1, to: 'woods', spawn: 'intree', sfx: 'door' });
    M.look(-37.5, -68, 'An enormous dead tree, split down the middle. Somebody has fitted a door into the split, painted white, with a brass knob. It\'s the door to your bedroom.', { r: 1.4 });
    M.spawn('outtree', -35, -70.2, 's');
    // inside the dead tree: your bedroom
    M.room(116, -4, 124, 4, 2.8, { floor: 'carpet_beige', wall: 'wall_mint', trim: 'wood_dark' });
    M.door(120, 4, 'n', { tex: 'door_white', w: 1.2, to: 'woods', spawn: 'outtree', sfx: 'door' });
    M.bed(122.2, -1.6, 's', { blanket: 'blanket_plain' });
    M.box(117.2, 0, -3.4, 1.2, 1.0, 0.6, { sides: 'wood', s: '@drawers_front' }, { fit: { s: true } });
    M.lamp(117, 2.8, 1.5, true);
    M.decal('win_dark', 123.95, 1.0, 0.6, 1.3, 1.5, 'w');
    M.look(121, 0, ['It\'s your bedroom. Exactly your bedroom. Your drawers, your lamp, your bed, unmade the way you left it this morning.', 'Through the window: trees, and more trees, and the dark.'], { r: 1.6 });
    M.look(123.2, 0.6, (s) => s.day >= 7 ? 'You look out the window. Far off through the trees, a little figure in a diving helmet is looking back at you from the door of a dead tree.' : 'Through the window, the woods go on forever. There\'s no town out there at all.', { r: 1.1 });
    M.light(118, 2.4, 2.4, 6, '#ffe0b0', 0.8);
    M.cam(116, -4, 124, 4, { mode: 'follow', yaw: 0, pitch: 55, dist: 6.5, fov: 55, lookY: 0.5, ahead: 0.3, clamp: [116.5, -3.5, 123.5, 8] });
    M.spawn('intree', 120, 2.8, 'n');
  },
};

MAPS.cannery = {
  name: 'BELLWOOD CANNING CO.',
  env(st) {
    const night = st.tod === 'night', late = st.day >= 8;
    return { fog: night ? '#030405' : '#2a2a28', fogNear: 6, fogFar: 32, sky: night ? ['#000000', '#06080c', 0.5] : ['#5a5a58', '#8a8a84', 0.5], ambient: night ? [0.22, 0.24, 0.3] : late ? [0.45, 0.45, 0.42] : [0.55, 0.54, 0.5], sat: 0.55, affine: 1 };
  },
  cam: { mode: 'follow', yaw: 0, pitch: 40, dist: 8.5, fov: 56, lookY: 1.0, ahead: 1.2 },
  bounds: [-24, -70, 90, 16],
  music() { return null; },
  amb(st) { return st.day >= 7 ? ['hum', 'drips', 'wind'] : ['wind', 'drips']; },
  onEnter(S, st) {
    if (st.flags.canneryVisited) return;
    S.flag('canneryVisited');
    return S.say(null, 'BELLWOOD CANNING CO. Closed 1979. It smells like the sea, and rust, and something sweet underneath.');
  },
  build(M, st) {
    const d = st.day, night = st.tod === 'night', late = d >= 8, running = d >= 7;
    const lk = night ? 0.4 : 0.6;
    const zone = (x0, z0, x1, z1, o) => M.cam(x0, z0, x1, z1, Object.assign({ mode: 'follow', yaw: 0, pitch: 46, dist: 8, fov: 56, lookY: 0.9, ahead: 0.8, clamp: [x0 + 0.6, z0 + 0.6, x1 - 0.6, z1 + 3] }, o || {}));

    // ---------------------------------------------------------------- the yard
    M.floor(-24, -30, 24, 16, 'concrete', { tile: 4 });
    M.floor(-60, -70, 100, 60, late ? 'grass_dead' : 'grass', { y: -0.05, tile: 6, sub: 20, surface: false, color: '#5a6a4a' });
    M.fence(-22, 14, -1.6, 14, { region: 'fence_chain', h: 2.2, seg: 3 }); M.fence(1.6, 14, 22, 14, { region: 'fence_chain', h: 2.2, seg: 3 });
    M.fence(-22, -10, -22, 14, { region: 'fence_chain', h: 2.2, seg: 3 }); M.fence(22, -10, 22, 14, { region: 'fence_chain', h: 2.2, seg: 3 });
    M.door(0, 14, 'n', { tex: false, w: 3, to: 'woods', spawn: 'gate', sfx: 'door', noCue: true });
    // the building front
    M.box(0, 0, -20, 40, 7, 20, { sides: 'brick', top: 'roof_flat' }, { sub: 4 });
    M.decal('sign_cannery_big', 0, 5.4, -9.98, 14, 1.1, 's', { off: 0.03, lit: false, bright: 0.85 });
    for (const x of [-14, -8, 8, 14]) M.decal(late || night ? 'win_dark' : 'win_board', x, 2.4, -9.98, 2.2, 2.2, 's', { off: 0.02 });
    M.door(0, -10, 's', { tex: 'door_garage', w: 4.4, h: 3.4, to: 'cannery', spawn: 'receiving', sfx: 'door' });
    // the smokestack
    M.cyl(16, 7, -18, 1.8, 18, 'brick', { sides: 10, solid: false, cap: false });
    M.cyl(16, 0, -6, 1.0, 0.8, 'rust', { sides: 8 });
    M.look(16, -4.8, (s) => s.day >= 6 ? 'The smokestack goes up and up. There\'s smoke coming out of the top. Thin and white, like breath on a cold day.' : 'The smokestack. BELLWOOD in white bricks, top to bottom. A bird is nesting on the rim.', { r: 1.4 });
    M.car(-14, 4, 'n', 'rust'); M.look(-14, 6.6, 'A delivery truck, rusted down to lace. On the door: BELLWOOD CANNING CO. - FRESH FROM THE TIDE. The keys are still in it.', { r: 1.8 });
    for (const [x, z] of [[10, 6], [11.2, 6.4], [10.6, 7.4]]) M.cyl(x, 0, z, 0.45, 1.0, 'rust', { sides: 8 });
    M.look(10.6, 8.4, 'Rusted barrels. One of them is full of rainwater, and in the rainwater, a single live fish, going round and round.', { r: 1.3 });
    M.lampPost(-6, 10, night);
    M.spawn('gate', 0, 12.4, 'n');
    M.spawn('dock', 0, -8.6, 'n');
    M.cam(-24, -10, 24, 16, { mode: 'follow', yaw: 0, pitch: 20, dist: 9, fov: 60, lookY: 2.0, ahead: 2.4, clamp: [-22, -6, 22, 30] });

    // ---------------------------------------------------------------- inside (x 40..82)
    // receiving
    M.room(44, -10, 64, 6, 4.4, { floor: 'concrete', wall: 'brick', trim: 'rust', gaps: [{ side: 'n', at: 54, w: 3, h: 3.4 }] });
    M.door(54, 6, 'n', { tex: 'door_garage', w: 4.4, h: 3.4, to: 'cannery', spawn: 'dock', sfx: 'door' });
    for (const [x, z, s] of [[47, -8, 1.2], [48.4, -8.2, 1], [47.6, -6.6, 0.9], [61, 2, 1.2], [61.2, 0.6, 1]]) M.box(x, 0, z, s, s, s, 'wood', { solid: true });
    M.box(58.5, 0, -7, 1.6, 1.2, 2.6, { top: 'plastic_yellow', sides: 'plastic_yellow' }, { solid: true }); M.box(58.5, 1.2, -7.6, 1.2, 1.2, 1.2, 'glass_dark', { solid: false });
    M.look(58.5, -5.4, 'A forklift, yellow paint gone chalky. On the seat, a lunchbox. Inside the lunchbox, a sandwich that has turned completely to dust, in the shape of a sandwich.', { r: 1.4 });
    M.decal('timeclock', 44.02, 1.2, -2, 0.6, 0.85, 'e', { off: 0.02 });
    M.look(44.8, -2, 'A time clock. Every card in the rack is punched OUT on 6/1/79. Except one, near the top, still punched IN. VANE, W.', { r: 1.2 });
    M.lockerRow(50, -9.6, 's');
    M.decal('closing_notice', 63.98, 1.6, -4, 1.6, 1.1, 'w', { off: 0.02 });
    M.look(63.2, -4, 'NOTICE: THIS PLANT WILL CLOSE PERMANENTLY ON 6/1/79. THANK YOU FOR YOUR SERVICE.', { r: 1.2 });
    M.light(54, 4, -2, 12, '#e8e0c8', lk);
    zone(44, -10, 64, 6);
    M.spawn('receiving', 54, 4.4, 'n');

    // the canning floor
    M.room(40, -40, 70, -10, 5, { floor: 'tile_grey', wall: 'brick', trim: 'rust', gaps: [{ side: 's', at: 54, w: 3, h: 3.4 }, { side: 'w', at: -25, w: 2, h: 2.6 }, { side: 'e', at: -25, w: 2, h: 2.6 }, { side: 'n', at: 50, w: 1.8, h: 2.4 }, { side: 'n', at: 64, w: 1.8, h: 2.4 }] });
    for (const x of [46, 54, 62]) {
      M.box(x, 0, -26, 1.4, 0.85, 22, { top: 'rubber', sides: 'metal' }, { solid: true });
      for (let z = -36; z < -16; z += 2) M.billboard('hook', x, z, 0.4, 1.2, { y: 3.2 });
      if (running) for (let i = 0; i < 8; i++) M.ent({ type: 'sprite', region: 'can_tide', x, y: 0.88, z: -36 + i * 2.6, w: 0.34, h: 0.4, update(e, dt) { e.z += dt * 0.9; if (e.z > -15.5) e.z -= 21; } });
      else for (let i = 0; i < 5; i++) M.billboard('can_tide', x + (i % 2) * 0.2 - 0.1, -34 + i * 4.3, 0.34, 0.4, { y: 0.88 });
    }
    M.decal('sign_line', 54, 2.6, -39.98, 1.6, 0.7, 's', { off: 0.02 });
    M.inter(55, -26, { r: 1.6, y: 1.2, use: async (S) => Story.cannedGoods(S) });
    M.look(46.9, -30, (s) => s.day >= 7 ? ['The conveyor belts are running. Nobody is here. The cans go past, one after another, very slowly.', 'The belt at the end goes into the wall and doesn\'t come out.'] : ['Three canning lines, stopped mid-shift. The belts are rotten. There are still cans on them.'], { r: 1.6 });
    for (const [x, y] of [[42, 1.2], [68, 1.4]]) M.light(x, 4.4, -25, 14, '#d8e0d0', lk * 0.9);
    zone(40, -40, 70, -10, { pitch: 42, dist: 10 });

    // the cold room
    M.room(28, -34, 40, -16, 3.2, { floor: 'grate', wall: 'metal', trim: 'rust', gaps: [{ side: 'e', at: -25, w: 2, h: 2.6 }] });
    M.decal('sign_cold', 39.98, 2.9, -25, 1.2, 0.3, 'e', { off: 0.03 });
    for (let x = 30; x < 39; x += 2) M.billboard('hook', x, -32, 0.4, 1.2, { y: 1.8 });
    M.ent({ type: 'sprite', region: 'hook', x: 34, y: 1.8, z: -24, w: 0.4, h: 1.2, t0: 0, update(e, dt) { e.t0 += dt; e.x = 34 + Math.sin(e.t0 * 1.4) * 0.25; } });
    M.look(34, -23, ['A row of empty meat hooks. One of them is swinging, back and forth, very gently.', 'There\'s no draft in here. There isn\'t any air at all.'], { r: 1.4 });
    for (const [x, z] of [[30, -18], [31.4, -18.2], [38, -33]]) M.box(x, 0, z, 1.1, 0.9, 1.1, 'glass', { solid: true, blend: true, alpha: 0.6, color: '#c8e8ff' });
    M.look(31, -19.4, 'Blocks of ice. Still ice, after all these years. Frozen inside one of them: a small plastic diver, waving.', { r: 1.2 });
    M.light(34, 2.8, -25, 8, '#a8d0ff', 0.7);
    zone(28, -34, 40, -16, { pitch: 52 });

    // the model room
    M.room(70, -34, 84, -16, 3.2, { floor: 'wood_floor_dark', wall: 'wall_cream', trim: 'wood_dark', gaps: [{ side: 'w', at: -25, w: 2, h: 2.6 }] });
    M.table(77, -25, 8, 5, 0.8, 'wood_dark');
    // a model of Bellwood made from cans and cardboard
    const MX = 77, MZ = -25, MS = 0.045;
    M.box(MX, 0.8, MZ, 7.6, 0.03, 4.6, 'grass', { solid: false });
    M.box(MX, 0.83, MZ - 2.0, 7.6, 0.02, 0.4, 'water', { solid: false });
    M.box(MX + (-8) * MS, 0.83, MZ + (-78) * MS * 0.55, 44 * MS, 0.3, 20 * MS * 0.6, 'tile_feature', { solid: false });
    M.cyl(MX + (-8) * MS, 1.13, MZ + (-78) * MS * 0.55, 0.28, 0.14, 'glass_dark', { sides: 8, solid: false });
    for (const [x, c] of [[-69, 'siding_green'], [-47, 'siding_yellow'], [-25, 'siding_pink'], [17, 'siding_blue'], [39, 'siding_white'], [62, 'siding_yellow']]) M.box(MX + x * MS, 0.83, MZ + 3 * MS, 14 * MS, 0.22, 18 * MS * 0.6, { sides: c, top: 'roof_grey' }, { solid: false });
    M.box(MX + 31 * MS, 0.83, MZ + 41 * MS * 0.55, 38 * MS, 0.18, 18 * MS * 0.55, 'brick_tan', { solid: false });
    M.cyl(MX + 16 * MS, 0.83, MZ + 0.1, 0.03, 0.12, 'plastic_yellow', { sides: 4, solid: false });
    M.look(77, -21.8, ['A model of Bellwood, on a table, made out of cans and cardboard and matchsticks. Somebody spent years on it.', 'The aquarium is a sardine tin with a glass bead for a dome. Your house is there, painted blue.', 'Standing in front of your house there is a tiny figure with a yellow head.', 'Its front door is open.'], { r: 1.8 });
    M.look(71, -32, 'Tins of paint, a jar of brushes, a magnifying lamp. Tacked to the wall, a list: STILL TO DO: THE DEEP.', { r: 1.2 });
    M.light(77, 2.8, -25, 9, '#ffe8c0', 0.8);
    zone(70, -34, 84, -16, { pitch: 55 });

    // the foreman's office
    M.room(44, -52, 56, -40, 3, { floor: 'wood_floor_dark', wall: 'wall_green', trim: 'wood_dark', gaps: [{ side: 's', at: 50, w: 1.8, h: 2.4 }] });
    M.decal('sign_office', 50, 2.6, -39.98, 1.1, 0.5, 'n', { off: 0.02 });
    M.desk(50, -50.6, 's', 1.8);
    M.inter(50, -49.4, { r: 1.3, y: 1.2, use: async (S) => Story.cannerySeat(S) });
    M.shelf(45, -51.6, 1.6, 2.2, 's', 'bookshelf_empty');
    M.look(54.6, -44, ['A photo on the wall: the cannery crew, 1957, in rubber aprons. In the front row, a skinny teenager holding a fish almost as big as he is.', 'He\'s not smiling. Everyone else is.'], { r: 1.2, y: 1.8 });
    M.decal('frame_empty', 55.98, 1.5, -44, 0.8, 0.6, 'w');
    M.light(50, 2.6, -46, 7, '#fff0c8', 0.6);
    zone(44, -52, 56, -40, { pitch: 55 });

    // the boiler room, at the foot of the smokestack
    M.room(58, -54, 70, -40, 4, { floor: 'concrete_dark', wall: 'brick_old', trim: 'rust', gaps: [{ side: 's', at: 64, w: 1.8, h: 2.4 }] });
    M.box(64, 0, -52, 4, 2.6, 2.4, 'rust', { solid: true }); M.box(64, 0.4, -50.78, 1.2, 0.8, 0.05, 'black', { solid: false });
    M.decal('radiator', 64, 0.4, -50.74, 1.1, 0.7, 's', { off: 0.02, lit: false, bright: running ? 1.4 : 0.3, color: '#ff8a3a' });
    M.look(64, -50, (s) => s.day >= 7 ? 'The boiler is lit. There\'s no fuel in it. It\'s burning anyway, low and orange, the way a pilot light waits.' : 'The boiler. Cold. The door is rusted open. Inside, ashes, and a child\'s mitten that didn\'t burn.', { r: 1.4 });
    M.quad('light_white', [[59.5, 0.03, -41.5], [62.5, 0.03, -41.5], [62.5, 0.03, -44.5], [59.5, 0.03, -44.5]], [[0, 0], [1, 0], [1, 1], [0, 1]], { blend: true, lit: false, vcols: new Array(4).fill([1, 1, 0.95, night ? 0.08 : 0.3]) });
    M.look(61, -43, ['You stand in the circle of light and look up the inside of the smokestack.', 'Very far up, a circle of sky. Something is looking down at you over the rim. It\'s a bird. It\'s probably a bird.'], { r: 1.3 });
    M.look(69.2, -46, 'Tally marks scratched into the bricks, in groups of five. Hundreds of them. The last group only has four.', { r: 1.2 });
    M.light(64, 2, -49, 8, '#ff9a5a', running ? 0.8 : 0.2); M.light(61, 3.6, -43, 5, '#f0f0e0', 0.5);
    zone(58, -54, 70, -40, { pitch: 52 });
  },
};
