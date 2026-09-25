'use strict';
// ---------------------------------------------------------------------------
// STRANGE PLACES IN THE REAL WORLD
//   reflection   under the surface of the duck pond (lean over it, from day 5).
//                A pink, backwards copy of the park. Your reflection walks
//                when you walk. Meet it in the middle and you're back.
//   mirrorhall   inside the hallway mirror at home (evenings and nights, from
//                day 5). The hallway goes on too long, and starts over, and
//                changes a little each time. After the third time there's a
//                door at the end.
// ---------------------------------------------------------------------------

MAPS.reflection = {
  name: 'DNOP KCUD',
  env(st) {
    if (st.tod === 'night') return { fog: '#2a1030', fogNear: 8, fogFar: 40, sky: ['#1a0a2a', '#5a2a6a', 0.5], ambient: [0.55, 0.4, 0.65], sat: 0.9 };
    return { fog: '#f0b8dc', fogNear: 12, fogFar: 55, sky: ['#f8f0a8', '#f0a0c8', 0.5], ambient: [1.05, 0.88, 1.05], sat: 1.0, grade: [1.04, 0.92, 1.08] };
  },
  cam: { mode: 'follow', yaw: 0, pitch: 42, dist: 16, fov: 56, lookY: 1.0, ahead: 0.6, clampX: [-2, 2] },
  bounds: [-16, -12, 16, 12],
  music() { return null; },
  amb() { return ['wind']; },
  onEnter(S, st) {
    S.flag('reflectionVisits', (st.flags.reflectionVisits || 0) + 1);
    if (st.flags.reflectionVisits > 1) return;
    return S.say(null, 'You lean too far. The water is warm, and then it isn\'t water. You\'re standing on it. Underneath it. Everything is the wrong way round.');
  },
  update(dt, st) {
    const p = World.player;
    if (!Script.busy && !UI.busy && Math.abs(p.x) < 0.9 && Math.abs(p.z) > 4) Script.run((S) => Story.meetReflection(S));
  },
  build(M, st) {
    const night = st.tod === 'night', d = st.day;
    const tint = night ? '#8a6aa8' : '#d8b0f0';
    M.floor(-60, -60, 60, 60, 'carpet_purple', { y: -0.08, tile: 5, sub: 12, color: tint, surface: false });
    M.floor(-16, -12, 16, 12, 'sand', { y: 0.01, tile: 4, color: night ? '#a080c0' : '#f0b8e8', surf: 'grass' });
    // the pond, from underneath: sky where the water should be
    M.floor(-5, -4, 5, 4, 'white', { y: 0.04, tile: 3, lit: false, color: night ? '#4a3a7a' : '#ffe8b0', surface: false });
    for (const [x, z, w] of [[-2.5, -1.5, 2.4], [2, 1.2, 3], [0.5, -2.6, 1.6]]) M.floorDecal('dc_stone', x, z, w, w * 0.4, { y: 0.06, color: '#ffffff' });
    M.solid(-5, -4, 5, 4);
    for (let x = -4.5; x < 5; x += 3) { M.billboard('reeds', x + 1.5, 4.4, 1.1, -1.3, { y: 1.3, col: [1, 0.8, 1, 1] }); M.billboard('reeds', x, -4.4, 1.1, -1.3, { y: 1.3, col: [1, 0.8, 1, 1] }); }
    M.look(3, 4.8, (s) => ['You look down into the pond. Down there is the sky, with the town hanging from it upside down.', s.day >= 7 ? 'In the upside-down town, somebody is standing at the edge of the pond, leaning over, looking in. It\'s you. You look very small.' : 'At the bottom of the sky, among the clouds, there are coins. All of them are dated 1991.'], { r: 1.6 });
    // the rest of the park, mirrored: the swings and the slide on the wrong sides, trees upside down
    for (const [x, z] of [[-13, -8], [-14, 7], [12, 9], [14, -8.5], [-8, 10], [7, -10]]) M.billboard('tree_round', x, z, 3.6, -4.8, { y: 4.8, col: [1, 0.85, 1, 1], solidR: 0.5 });
    M.swingSet(13, 4.5, 'w', { moving: true, seats: 2 });
    M.look(11.8, 4.5, (s) => 'The swings are going, both of them, high. Nobody is on them. They swing in time with each other, like two people holding hands.', { r: 1.6 });
    M.slide(-12.5, -2, 'e');
    M.ent({
      type: 'merry', x: 10, z: -7, a: 0, speed: 0,
      build(b) { b.cyl(0, 0.3, 0, 1.6, 0.12, 'plastic_blue', { sides: 8, solid: false, topTex: 'plastic_pink' }); b.cyl(0, 0, 0, 0.12, 1.2, 'metal', { sides: 4, solid: false }); for (let i = 0; i < 4; i++) b.at(0, 0, i * Math.PI / 2, () => b.box(0, 0.42, 1.3, 0.06, 0.7, 0.06, 'metal', { solid: false })); },
      update(e, dt) { e.a -= 0.8 * dt; if (!e.model) e.model = Mat4.create(); Mat4.model(e.model, e.x, 0, e.z, e.a); },
    });
    M.solidCircle(10, -7, 1.6);
    M.look(10, -5.2, 'The merry-go-round is turning backwards, all by itself. When you look away and back, it has turned a little further than it should have.', { r: 1.3 });
    M.bench(-10, 6.5, 's');
    M.look(-10, 7.3, ['A newspaper on the bench, printed backwards. You can read it if you tilt your head.', 'SEARCH CALLED OFF. The date is today\'s.'], { r: 1.2 });
    M.postSign(6.5, -6, 'sign_pond_rev', 2.2, 0.9, 's', { y: 0.7 });
    M.look(6.5, -5, 'DNOP KCUD. The letters are the right way round. It\'s the rest of the world that isn\'t.', { r: 1.2 });
    for (let x = -16; x <= 16; x += 2.6) { M.billboard('bush', x, -12.3, 2.2, 1.35, { col: [1, 0.8, 1, 1] }); M.billboard('bush', x, 12.3, 2.2, 1.35, { col: [1, 0.8, 1, 1] }); }
    for (let z = -12; z <= 12; z += 2.6) { M.billboard('bush', -16.3, z, 2.2, 1.35, { col: [1, 0.8, 1, 1] }); M.billboard('bush', 16.3, z, 2.2, 1.35, { col: [1, 0.8, 1, 1] }); }
    // your reflection: wherever you go, it goes the other way
    M.ent({
      type: 'char', set: 'evan', x: -12, z: 0, face: Math.PI / 2, noShadow: false,
      update(e, dt) { const p = World.player; e.x = -p.x; e.z = p.z; e.face = -p.face; e.moving = p.moving; e.anim = p.anim; },
    });
    M.inter(15.2, 0, { r: 1.4, y: 1, exit: true, use: async (S) => { await S.say(null, 'You look straight up. Far above, a ripple, and a circle of light. You reach for it.'); await S.go('town', 'pond', { color: '#ffffff', fadeOut: 0.8, fadeIn: 1.0 }); } });
    M.light(0, 4, 0, 30, night ? '#c080ff' : '#fff0f8', 0.6);
    M.spawn('in', 12, 0, 'w');
  },
};

MAPS.mirrorhall = {
  name: '12 MAPLE ST',
  env: (st) => interiorEnv(st, { ambient: [0.62 - (st.flags.mirrorLoops || 0) * 0.1, 0.58 - (st.flags.mirrorLoops || 0) * 0.1, 0.62], extra: { sat: 0.7 - (st.flags.mirrorLoops || 0) * 0.1, affine: 1 } }),
  cam: { mode: 'follow', yaw: 0, pitch: 12, dist: 4.6, fov: 62, lookY: 1.35, ahead: 3.4, lag: 5 },
  music() { return null; },
  amb() { return ['room']; },
  build(M, st) {
    const loops = st.flags.mirrorLoops || 0, H = 3;
    const paper = loops >= 2 ? 'wallpaper_green' : 'wallpaper_floral';
    M.room(-2, -48, 2, 0, H, { floor: 'wood_floor', wall: paper, trim: 'wood_dark' });
    M.decal('mirror', 0, 0.6, -0.02, 1.2, 1.9, 'n', { off: 0.02 });
    M.door(0, 0, 'n', { tex: false, w: 1.6, to: 'house', spawn: 'mirror', sfx: 'flicker', noCue: true });
    // doors down both sides (the same few doors, over and over)
    const DOORS = [
      ['door_int', 'Your bedroom door. Behind it, you can hear your own voice, talking to somebody. You can\'t make out the words.'],
      ['door_evan', 'EVAN\'S ROOM. It\'s locked. On the other side, somebody is trying the handle too, very gently.'],
      ['door_wood', 'The front door, here, in the middle of the hallway. You open it. Behind it is more hallway.'],
      ['door_white', 'The bathroom. The tap is running. Written in the steam on the mirror: WRONG WAY.'],
      ['door_old', 'The basement door. Cold air comes under it, and the smell of the aquarium.'],
    ];
    let k = loops;
    for (let z = -5; z > -44; z -= 6) for (const side of ['e', 'w']) {
      const [reg, text] = DOORS[k++ % DOORS.length];
      const x = side === 'e' ? -2 : 2;
      M.decal(reg, x + (side === 'e' ? 0.02 : -0.02), 0, z, 1.2, 2.3, side, { off: 0.02 });
      M.look(x + (side === 'e' ? 0.7 : -0.7), z, text, { r: 0.9 });
    }
    const photo = ['ph_family', 'ph_family_you', 'ph_gap', 'frame_empty'][Math.min(loops, 3)];
    for (let z = -8; z > -44; z -= 12) M.decal(photo, 1.98, 1.4, z, 0.7, 0.55, 'w', { off: 0.02 });
    M.look(1.3, -8, (s) => ['The family photo, from the living room. Walter, Ruth, a boy with a kitten.', 'In this one, the boy is you, holding the kitten, smiling like it was always you.', 'In this one, there\'s just a gap where the boy was, the exact shape of a boy.', 'The frame is empty. The wallpaper behind it is brighter, where a picture used to hang.'][Math.min(s.flags.mirrorLoops || 0, 3)], { r: 1.0, y: 1.8 });
    for (let z = -6; z > -46; z -= 10) M.light(0, 2.8, z, 7, '#ffe0b0', Math.max(0.15, 0.6 - loops * 0.15));
    if (loops === 2) M.ent({ type: 'char', set: 'walter_blank', x: 0, z: -46, face: Math.PI, noShadow: true, update(e) { e.hide = World.player.z < -30; e.y = e.hide ? -20 : 0; } });
    if (loops < 3) {
      M.trigger(-2, -46, 2, -43, async (S) => Story.mirrorLoop(S), { once: false });
      M.decal('mirror', 0, 0.6, -47.98, 1.2, 1.9, 's', { off: 0.02 });
    } else {
      M.door(0, -48, 's', { tex: 'door_evan', w: 1.3, to: 'mirrorhall', spawn: 'room', sfx: 'door' });
      M.look(1.2, -46.8, 'At the end of the hallway, finally, a door. It\'s Evan\'s door, but the name on it is written backwards.', { r: 1.0 });
    }
    M.spawn('in', 0, -1.4, 'n');
    // the room at the end: Evan's room, backwards
    const RX = 30;
    M.room(RX - 3.5, -3, RX + 3.5, 3, 2.9, { floor: 'carpet_blue', wall: 'wallpaper_evan', trim: 'wood_dark' });
    M.door(RX - 0.1, 3, 'n', { tex: 'door_int', w: 1.2, to: 'house', spawn: 'mirror', sfx: 'flicker' });
    M.bed(RX + 2.2, -1.6, 'w', { blanket: 'blanket_fish' });
    M.desk(RX - 2.6, -2.4, 's', 1.2, 'wood_light');
    M.decal('clock', RX, 2.0, -2.98, 0.5, 0.5, 's', { off: 0.02, flipU: true });
    M.look(RX, -2.2, 'A clock on the wall, with the numbers backwards. The second hand is going round the other way. You watch it for a while. It feels nice, like getting time back.', { r: 1.2, y: 2.2 });
    M.look(RX + 2.2, -0.4, ['Evan\'s bed, on the wrong side of the room. There\'s a note on the pillow in a kid\'s handwriting, backwards.', 'YOU FOUND THE WAY IN. THE WAY OUT IS THE SAME WAY.'], { r: 1.2 });
    M.look(RX - 2.6, -1.4, 'Evan\'s desk. On it, a drawing of a kid in a diving helmet, holding hands with a kid in a striped shirt. Both of them are waving at you.', { r: 1.1 });
    M.light(RX, 2.4, 0, 6, '#c0d8ff', 0.7);
    M.cam(RX - 3.5, -3, RX + 3.5, 3, { mode: 'follow', yaw: 0, pitch: 52, dist: 6, fov: 56, lookY: 0.6, ahead: 0.4, clamp: [RX - 3, -2.6, RX + 3, 7] });
    M.spawn('room', RX, 1.8, 'n');
  },
};
