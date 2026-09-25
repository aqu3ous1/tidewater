'use strict';
// ---------------------------------------------------------------------------
// HIDDEN BELLWOOD — places under, behind and above the town.
//   drain       the storm drain: tunnels under the whole town, from the
//               manhole on Center Ave to the beach, with a way into the
//               Kessler cellar and a living room that shouldn't be there
//   treehouse   the Tide Club, up a tree in the park (the password is a date)
//   underpier   under the pier, at low tide
//   belltower   the church tower: the stairs, the clock, the bell
//   rosas       the back of Rosa's, where it is always nearly two o'clock
//   attic       the attic of 12 Maple Street
// ---------------------------------------------------------------------------

const hidCam = (x0, z0, x1, z1, o) => Object.assign({ mode: 'follow', yaw: 0, pitch: 46, dist: 7, fov: 56, lookY: 0.7, ahead: 0.8, clamp: [x0 + 0.5, z0 + 0.5, x1 - 0.5, z1 - 0.3] }, o || {});

// ---------------------------------------------------------------- the storm drain
MAPS.drain = {
  name: 'STORM DRAIN',
  env(st) {
    const late = st.day >= 8;
    return { fog: '#020304', fogNear: late ? 3 : 5, fogFar: late ? 18 : 24, ambient: late ? [0.2, 0.22, 0.26] : [0.34, 0.38, 0.42], clear: '#000000', sub: 2, sat: 0.6, affine: 1, snap: late ? 1.4 : 1 };
  },
  cam: { mode: 'follow', yaw: 0, pitch: 40, dist: 6.5, fov: 58, lookY: 0.8, ahead: 1 },
  music() { return null; },
  amb() { return ['drips', 'deep']; },
  onEnter(S, st) {
    if (st.flags.drainSeen) return;
    S.flag('drainSeen');
    return S.say(null, 'It\'s cold down here, and louder than you\'d think. Water runs down the middle of everything, going somewhere in a hurry.');
  },
  build(M, st) {
    const d = st.day, late = d >= 8, H = 2.8, lk = late ? 0.3 : 0.55;
    const tunnel = (x0, z0, x1, z1, gaps) => {
      M.room(x0, z0, x1, z1, H, { floor: 'concrete_dark', wall: 'concrete', trim: 'rust', gaps });
      const ns = z1 - z0 > x1 - x0;
      if (ns) M.floor((x0 + x1) / 2 - 0.4, z0 + 0.2, (x0 + x1) / 2 + 0.4, z1 - 0.2, 'water_dark', { y: 0.015, tile: 2, scroll: [0, 0.3], lit: false, bright: 0.8, surface: false });
      else M.floor(x0 + 0.2, (z0 + z1) / 2 - 0.4, x1 - 0.2, (z0 + z1) / 2 + 0.4, 'water_dark', { y: 0.015, tile: 2, scroll: [0.3, 0], lit: false, bright: 0.8, surface: false });
      M.cam(x0, z0, x1, z1, ns ? { mode: 'follow', yaw: 0, pitch: 24, dist: 5.5, fov: 60, lookY: 1.0, ahead: 2, lag: 3 } : { mode: 'follow', yaw: 0, pitch: 60, dist: 6, fov: 58, lookY: 0.6, ahead: 0.4, clamp: [x0 - 20, z0 + 0.2, x1 + 20, z1 + 4] });
    };
    const chamber = (x0, z0, x1, z1, gaps, o) => { M.room(x0, z0, x1, z1, H + 0.4, { floor: 'concrete_dark', wall: 'concrete', trim: 'rust', gaps }); M.cam(x0, z0, x1, z1, hidCam(x0, z0, x1, z1, o)); };
    const arrow = (x, z, rot) => M.floorDecal('chalk_arrow', x, z, 0.6, 0.6, { y: 0.03, rot });

    // ---- the manhole
    chamber(-3, -3, 3, 3, [{ side: 'w', at: 0, w: 2.4 }, { side: 'n', at: 0, w: 2.4 }]);
    for (let y = 0.3; y < H; y += 0.45) M.box(0, y, 2.85, 0.9, 0.06, 0.1, 'rust', { solid: false });
    M.quad('light_white', [[-0.9, 0.02, 2.9], [0.9, 0.02, 2.9], [0.9, 0.02, 0.8], [-0.9, 0.02, 0.8]], [[0, 0], [1, 0], [1, 1], [0, 1]], { blend: true, lit: false, vcols: [[1, 1, 0.9, 0.35], [1, 1, 0.9, 0.35], [1, 1, 0.9, 0.05], [1, 1, 0.9, 0.05]] });
    M.door(0, 3, 'n', { tex: false, w: 1.2, to: 'town', spawn: 'manhole', sfx: 'step', noCue: true });
    M.decal('sign_drain', 2.98, 1.6, -1, 1.3, 0.55, 'w', { off: 0.02 });
    M.look(-2.2, -2.2, 'Chalk on the wall, low down: a kid\'s height chart. EVAN, TOBY, EVAN, TOBY, and then just TOBY, a few times, and then nobody.', { r: 1.1 });
    M.light(0, 2.6, 1.5, 6, '#e8e8d0', 0.7);
    M.spawn('manhole', 0, 1.6, 'n');

    // ---- west, toward Maple Street (the Kessler house)
    tunnel(-40, -1.5, -3, 1.5, [{ side: 'e', at: 0, w: 2.4 }, { side: 'w', at: 0, w: 2.4 }, { side: 's', at: -20, w: 2.2 }]);
    for (const x of [-8, -16, -28, -35]) arrow(x, -0.9, Math.PI / 2);
    M.light(-12, 2.4, 0, 6, '#c8c0a0', lk); M.light(-30, 2.4, 0, 6, '#c8c0a0', lk * 0.8);
    // a dead end under somebody's backyard
    tunnel(-22, 1.5, -18, 12, [{ side: 'n', at: -20, w: 2.2 }]);
    M.floorDecal('drain_grate', -20, 10.6, 1.8, 1.8, { y: 0.03 });
    M.quad('light_white', [[-21, 0.03, 11.5], [-19, 0.03, 11.5], [-19, 0.03, 9.5], [-21, 0.03, 9.5]], [[0, 0], [1, 0], [1, 1], [0, 1]], { blend: true, lit: false, vcols: [[1, 1, 0.8, 0.3], [1, 1, 0.8, 0.3], [1, 1, 0.8, 0.3], [1, 1, 0.8, 0.3]] });
    M.look(-20, 10, (s) => s.tod === 'night' ? ['A grate, high up. Through it: a dark backyard, a porch light, a swing moving by itself.'] : ['A grate, high up. Through it: somebody\'s backyard. A sprinkler. A dog puts its nose to the grate and looks down at you.', 'It doesn\'t bark. It just watches you go.'], { r: 1.5 });
    chamber(-46, -3, -40, 3, [{ side: 'e', at: 0, w: 2.4 }, { side: 'n', at: -43, w: 2.2 }]);
    M.look(-45, 2, 'A junction. Somebody has drawn a map on the wall in chalk: the tunnels, the streets above them, and a big X under one of the houses on Maple Street.', { r: 1.2 });
    M.light(-43, 2.6, 0, 6, '#c8c0a0', lk);
    tunnel(-44.5, -14, -41.5, -3, [{ side: 's', at: -43, w: 2.2 }, { side: 'n', at: -43, w: 2.2 }]);
    arrow(-43, -8, 0);
    chamber(-47, -20, -39, -14, [{ side: 's', at: -43, w: 2.2 }]);
    M.decal('wall_hole', -43, 0, -19.98, 1.8, 2.0, 's', { off: 0.02 });
    M.door(-43, -20, 's', { tex: false, w: 1.6, to: 'kessler', spawn: 'cellar', sfx: 'scrub' });
    M.floorDecal('stain', -42, -18, 2, 1.4, { y: 0.03, blend: true });
    for (let i = 0; i < 6; i++) M.box(-46 + i * 0.5, 0, -19 + (i % 3) * 0.3, 0.4, 0.2 + (i % 2) * 0.15, 0.3, 'brick_old', { solid: false });
    M.look(-45.5, -17, 'Bricks on the floor. Somebody knocked a hole through the wall, from this side. Behind it is a cellar.', { r: 1.3 });
    M.light(-43, 2.4, -17, 6, '#c8b890', lk);
    M.spawn('kessler', -43, -18.4, 's');

    // ---- north, toward the river
    tunnel(-1.5, -40, 1.5, -3, [{ side: 's', at: 0, w: 2.4 }, { side: 'n', at: 0, w: 2.4 }, { side: 'w', at: -20, w: 2.2 }]);
    for (const z of [-8, -15, -30, -36]) arrow(-0.9, z, 0);
    M.light(0, 2.4, -12, 6, '#c8c0a0', lk); M.light(0, 2.4, -30, 6, '#c8c0a0', lk * 0.8);
    M.look(0.8, -24, (s) => s.day >= 6 ? 'Your footsteps echo. Then a second set, a little behind, a little lighter. When you stop, they stop a moment later.' : 'Your footsteps echo down the tunnel and come back sounding smaller.', { r: 1.4 });
    // the living room that shouldn't be here
    tunnel(-16, -21.5, -1.5, -18.5, [{ side: 'e', at: -20, w: 2.2 }, { side: 'w', at: -20, w: 1.4 }]);
    M.floorDecal('mat_welcome', -14.6, -20, 1.2, 0.7, { y: 0.03, rot: Math.PI / 2 });
    M.box(-16, 0, -20.9, 0.2, 2.4, 0.2, 'wood', { solid: false }); M.box(-16, 0, -19.1, 0.2, 2.4, 0.2, 'wood', { solid: false }); M.box(-16, 2.4, -20, 0.2, 0.2, 2, 'wood', { solid: false });
    M.look(-14.4, -20.8, 'A doorway in the tunnel wall, with a doormat. WELCOME. A little brass number: 12½.', { r: 1.0 });
    M.room(-28, -26, -16, -14, 2.8, { floor: 'carpet_beige', wall: 'wallpaper_floral', trim: 'wood_dark', gaps: [{ side: 'e', at: -20, w: 1.4, h: 2.4 }] });
    M.couch(-22, -15, 3, 'n', 'fabric_brown'); M.armchair(-26.4, -18, 'e', 'fabric_green');
    M.tvStand(-22, -25.4, 's', 'tv_title');
    M.inter(-22, -24, { r: 1.5, y: 1.2, use: async (S) => Story.drainTV(S) });
    M.lamp(-26.6, -24.6, 1.5, true);
    M.table(-22, -19.6, 1.2, 0.8, 0.45, 'wood_dark');
    M.look(-22, -18.8, (s) => s.day >= 7 ? ['A plate of cookies on the coffee table. They\'re still warm.', 'There are two bites out of one of them. Small bites.'] : ['A plate of cookies on the coffee table. They\'re still warm. Down here.'], { r: 1.2 });
    for (const x of [-25, -22.5, -20]) M.decal('frame_empty', x, 1.6, -25.98, 0.6, 0.5, 's', { off: 0.02 });
    M.look(-22.5, -25, ['Framed photos on the wall. They\'re all photos of this room.', 'In the last one, there\'s somebody sitting on the couch. You look at the couch. It\'s empty.'], { r: 1.2, y: 2 });
    M.decal('clock', -16.02, 1.9, -24, 0.5, 0.5, 'w');
    M.look(-16.8, -24, 'A clock, ticking. It\'s the only clean thing in the storm drain.', { r: 1.0, y: 2 });
    M.shelf(-27.6, -14.6, 1.6, 1.4, 'e', 'bookshelf');
    M.pickup(-27.2, -15.4, 'radio5', { y: 1.4, r: 1.2, text: 'On the bookshelf, in a sandwich bag to keep it dry: a cassette tape.' });
    M.light(-24, 2.4, -20, 8, '#ffd8a0', 0.9);
    M.cam(-28, -26, -16, -14, hidCam(-28, -26, -16, -14, { pitch: 50 }));
    M.look(-27.2, -24.8, (s) => s.day >= 8 ? 'The lamp. There is no cord. It\'s lit anyway, the way things are lit in dreams.' : 'A floor lamp with a fringed shade. It isn\'t plugged into anything.', { r: 1.0 });
    chamber(-3, -46, 3, -40, [{ side: 's', at: 0, w: 2.4 }, { side: 'e', at: -43, w: 2.4 }]);
    M.light(0, 2.6, -43, 6, '#c8c0a0', lk);

    // ---- east, toward the beach
    tunnel(3, -44.5, 30, -41.5, [{ side: 'w', at: -43, w: 2.4 }, { side: 'e', at: -43, w: 2.4 }, { side: 'n', at: 16, w: 2.2 }]);
    M.decal('grafitti_te', 9, 0.8, -44.48, 1.8, 1.0, 's', { off: 0.02 });
    M.look(9, -43.6, 'Spray paint on the tunnel wall: T + E. TIDE CLUB 4 EVER. The paint ran before it dried.', { r: 1.2 });
    for (const x of [6, 21, 27]) arrow(x, -42.2, -Math.PI / 2);
    M.light(10, 2.4, -43, 6, '#c8c0a0', lk); M.light(24, 2.4, -43, 6, '#c8c0a0', lk * 0.8);
    // the cistern
    M.room(8, -60, 24, -44.5, 4.4, { floor: 'concrete_dark', wall: 'concrete', trim: 'rust', gaps: [{ side: 's', at: 16, w: 2.2 }] });
    M.floor(10, -58, 22, -50, 'water_dark', { y: 0.02, tile: 3, scroll: [0.01, 0.005], lit: false, bright: 0.7, surface: false });
    M.solid(10, -58, 22, -50);
    for (const [x, z] of [[12, -48], [20, -48], [12, -58.5], [20, -58.5]]) M.cyl(x, 0, z, 0.5, 4.4, 'concrete', { sides: 8 });
    M.look(16, -49, (s) => s.day >= 6 ? ['A big still pool under the street. You drop a pebble in. It doesn\'t make a sound.', 'The ripples go out, and come back, and go out again, and don\'t stop.'] : ['A big still pool under the street. You drop a pebble in. The echo goes on for a long time.', 'When it finally stops, it sounds a little like somebody saying your name.'], { r: 1.8 });
    M.light(16, 3.8, -52, 12, '#6a8ab0', 0.6);
    M.cam(8, -60, 24, -44.5, hidCam(8, -60, 24, -44.5, { pitch: 38, dist: 9, clamp: [9, -46, 23, -40] }));
    chamber(30, -46, 36, -40, [{ side: 'w', at: -43, w: 2.4 }, { side: 'n', at: 33, w: 2.2 }, { side: 's', at: 33, w: 2.2 }]);
    M.light(33, 2.6, -43, 6, '#c8c0a0', lk);
    // a dead end under the school
    tunnel(31.5, -40, 34.5, -24, [{ side: 'n', at: 33, w: 2.2 }]);
    M.floorDecal('drain_grate', 33, -25.2, 1.6, 1.6, { y: 0.03 });
    M.look(33, -25.8, ['A grate overhead. Kids\' voices up there, counting. ...ninety-eight. Ninety-nine. A hundred.', '"Ready or not, here I come."', 'Then nothing. Nobody comes.'], { r: 1.4 });
    // the outfall
    tunnel(31.5, -62, 34.5, -46, [{ side: 's', at: 33, w: 2.2 }, { side: 'n', at: 33, w: 2.2 }]);
    chamber(29, -70, 37, -62, [{ side: 's', at: 33, w: 2.2 }]);
    M.decal('drain_grate', 33, 0, -69.98, 2.6, 2.6, 's', { off: 0.02, lit: false, bright: 1.3 });
    M.door(33, -70, 's', { tex: false, w: 2.4, use: async (S) => Story.outfallFromInside(S) });
    M.quad('light_white', [[31.6, 0.03, -69.8], [34.4, 0.03, -69.8], [35, 0.03, -65.5], [31, 0.03, -65.5]], [[0, 0], [1, 0], [1, 1], [0, 1]], { blend: true, lit: false, vcols: [[1, 1, 0.9, 0.4], [1, 1, 0.9, 0.4], [1, 1, 0.9, 0.02], [1, 1, 0.9, 0.02]] });
    M.look(30, -64, 'Shells and bottle caps, washed up against the grate from the other side. The river is right there. You can hear gulls.', { r: 1.2 });
    M.light(33, 2.4, -67, 8, '#f0f0e0', 0.8);
    M.spawn('outfall', 33, -68.4, 's');
  },
};

// ---------------------------------------------------------------- the Tide Club treehouse
MAPS.treehouse = {
  name: 'TIDE CLUB',
  env: (st) => interiorEnv(st, { ambient: st.tod === 'night' ? [0.4, 0.42, 0.55] : [0.9, 0.9, 0.78], extra: st.day >= 8 ? { sat: 0.5 } : {} }),
  cam: { mode: 'follow', yaw: 0, pitch: 55, dist: 6, fov: 56, lookY: 0.6, ahead: 0.4 },
  music() { return null; },
  amb(st) { return st.tod === 'night' ? ['wind', 'cricket'] : ['wind', 'birds']; },
  build(M, st) {
    const d = st.day, night = st.tod === 'night';
    M.room(-3, -3, 3, 3, 2.2, { floor: 'wood_floor', wall: 'wood', trim: 'wood_dark' });
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; M.billboard('bush', Math.cos(a) * 4.6, Math.sin(a) * 4.6, 3.4, 2.4, { y: 0.4 + (i % 3) * 0.5 }); }
    M.decal(night ? 'win_dark' : 'win_house', 0, 0.9, -2.98, 1.2, 1.0, 's', { off: 0.02 });
    M.decal('club_rules', -2.98, 1.0, -1, 1.4, 1.0, 'e', { off: 0.02 });
    M.look(-2.3, -1, ['TIDE CLUB RULES. 1. NO GROWNUPS. 2. NO TELLING.', '3. IF YOU SEE THE DEEP YOU HAVE TO SAY.', 'Somebody added a 4 in pencil, later, and then rubbed it out. You can still read it: 4. DON\'T GO IN THE DEEP.'], { r: 1.2 });
    M.floorDecal('door_hatch', 0, 2.2, 1.1, 1.1, { y: 0.02 });
    M.door(0, 3, 'n', { tex: false, w: 1.2, to: 'town', spawn: 'treehouse', sfx: 'step', noCue: true });
    M.floorDecal('blanket_fish', 1.6, -1.6, 2.2, 1.6, { y: 0.02 });
    M.look(1.6, -1.2, (s) => s.day >= 7 ? 'A sleeping bag with fish on it. It\'s warm, like somebody just climbed out.' : 'A sleeping bag with fish on it, and a pillow that smells like somebody else\'s house.', { r: 1.1 });
    M.box(2.3, 0, 1.2, 0.8, 0.4, 0.6, 'cardboard', { solid: true });
    M.look(2.3, 0.4, 'A stack of comic books. AQUAMAN. SEA HUNT. On top, a dog-eared library book: THE DEEP OCEAN. Nine years overdue.', { r: 1.0 });
    M.box(-2.4, 0.9, 1.6, 0.6, 0.12, 0.6, 'wood', { solid: false }); M.cyl(-2.4, 1.02, 1.6, 0.18, 0.3, 'glass', { sides: 6, solid: false, blend: true, alpha: 0.6 });
    M.look(-2.3, 1.6, 'A jar of shells on a shelf. They\'re all blue. Every single one.', { r: 1.0 });
    M.box(0.6, 0, -2.6, 0.3, 1.4, 0.3, 'cardboard', { solid: false }); M.box(0.6, 1.4, -2.75, 0.3, 0.3, 0.6, 'cardboard', { solid: false });
    M.inter(0.6, -2.1, { r: 1.0, y: 1.2, use: async (S) => Story.periscope(S) });
    M.pickup(-1.2, -2.2, 'club_card', { text: 'A tin box with TIDE CLUB painted on the lid. Inside: a card, cut out of a cereal box.' });
    if (d >= 8) M.look(0, 0, 'Written on the ceiling in marker, where you can only read it lying down: WHERE DID YOU GO', { r: 1.2, cond: (s) => s.day >= 8 });
    M.light(0, 2, 0, 6, night ? '#8a9ad8' : '#fff4d0', night ? 0.4 : 0.7);
    M.spawn('hatch', 0, 1.2, 'n');
  },
};

// ---------------------------------------------------------------- under the pier
MAPS.underpier = {
  name: 'UNDER THE PIER',
  env(st) {
    const night = st.tod === 'night', late = st.day >= 8;
    return { fog: night ? '#0a0e18' : '#6a7a88', fogNear: 6, fogFar: 30, ambient: night ? [0.25, 0.3, 0.42] : late ? [0.5, 0.52, 0.5] : [0.6, 0.62, 0.66], clear: '#000000', sub: 2, sat: late ? 0.5 : 0.8 };
  },
  cam: { mode: 'follow', yaw: 0, pitch: 24, dist: 6, fov: 58, lookY: 1.0, ahead: 1.6, lag: 4 },
  music() { return null; },
  amb(st) { return st.tod === 'night' ? ['river', 'wind'] : ['river', 'gulls']; },
  build(M, st) {
    const d = st.day, night = st.tod === 'night', late = d >= 8;
    M.floor(-6, -16, 6, 2, 'sand', { tile: 3 });
    M.floor(-30, -60, 30, -16, 'water', { y: -0.25, tile: 5, scroll: [0.01, 0.02], lit: false, bright: night ? 0.35 : 0.9, surface: false, sub: 10 });
    M.solid(-30, -60, 30, -16.2); M.solid(-8, -16, -6, 3); M.solid(6, -16, 8, 3); M.solid(-8, 2, 8, 4);
    // pilings in two rows, the pier deck up above (you see its edges, and light between the boards)
    for (let z = 0; z > -30; z -= 3) for (const x of [-2.4, 2.4]) M.cyl(x, -0.5, z, 0.3, 3.3, 'wood_dark', { sides: 6, solid: z > -16 });
    for (const x of [-2.9, 2.9]) M.box(x, 2.6, -8, 0.3, 0.4, 24, 'wood_dark', { solid: false });
    for (let z = -1; z > -16; z -= 1.5) M.quad('light_white', [[-2.2, 0.03, z], [2.2, 0.03, z], [2.2, 0.03, z - 0.25], [-2.2, 0.03, z - 0.25]], [[0, 0], [1, 0], [1, 1], [0, 1]], { blend: true, lit: false, vcols: new Array(4).fill([1, 1, 0.85, night ? 0.05 : 0.3]) });
    for (let x = -6; x < 7; x += 2.5) M.billboard('bush', x, 3.4, 2.4, 1.4);
    M.door(0, 2, 'n', { tex: false, w: 3, to: 'town', spawn: 'underpier', sfx: 'step', noCue: true });
    // things caught under here
    M.floorDecal('tire', -4.2, -6, 1.4, 0.9, { y: 0.03 });
    M.look(-4.2, -5.4, 'An old tire half buried in the sand. A crab lives in it. It has lived in it a long time.', { r: 1.2 });
    for (const [r, x, z] of [['tp_star_orange', 3.8, -11], ['tp_urchin', 4.4, -12.4], ['tp_anemone', -3.6, -13], ['tp_snail', -4.6, -10.6]]) M.floorDecal(r, x, z, 0.6, 0.6, { y: 0.03 });
    M.floorDecal('stain', 4, -12, 2.4, 1.8, { y: 0.02, blend: true, color: '#3a6a8a' });
    M.look(4, -11.4, 'A tide pool. A sea star, an urchin. The water in it is warm. The river is cold.', { r: 1.3 });
    M.box(2.4, 0.4, -14, 0.62, 0.9, 0.62, 'wood_dark', { solid: false });
    M.decal('grafitti_te', 2.4, 0.6, -13.68, 0.6, 0.5, 's', { off: 0.02 });
    M.look(2.4, -13, 'Carved deep into a piling: T + E. Under it: TIDE CLUB. Under that, much newer, a third set of letters that\'s been carved over and over until you can\'t read it.', { r: 1.1 });
    M.billboard('bottle', -2.1, -9, 0.3, 0.5, { y: 0.1 });
    M.pickup(-2.1, -9, 'bottle_note', { hidden: true, r: 1.2, text: 'A root beer bottle, wedged between two pilings, with a note rolled up inside.' });
    M.look(0, -15, (s) => s.day >= 8 ? ['You look up between the boards. There are names carved into the underside of the pier. Dozens.', 'DANA. RAY. TOBY. EVAN. And yours, very neatly, in a grown-up\'s handwriting.'] : ['You look up between the boards. There are names carved into the underside of the pier, dozens of them, where nobody would ever see.', 'DANA. RAY. TOBY. EVAN.'], { r: 1.6 });
    for (let i = 0; i < 3; i++) M.ent({ type: 'sprite', region: 'crab', x: -3 + i * 3, y: 0.02, z: -4 - i * 3, w: 0.45, h: 0.28, ox: -3 + i * 3, t0: i, update(e, dt) { e.t0 += dt; e.x = e.ox + Math.sin(e.t0 * 0.7) * 0.8; }, cond: (s) => s.tod !== 'night' });
    if (late) M.look(0, -6, ['The water under the pier is perfectly still. In it, upside down, is the town.', 'In the upside-down town, the aquarium has no dome. There\'s just a hole.'], { r: 1.4 });
    M.light(0, 2, -6, 12, night ? '#6a80c0' : '#f0f4ff', night ? 0.3 : 0.5);
    M.spawn('beach', 0, 0.6, 'n');
  },
};

// ---------------------------------------------------------------- the bell tower
MAPS.belltower = {
  name: 'BELL TOWER',
  env: (st) => interiorEnv(st, { ambient: [0.62, 0.58, 0.54], fogNear: 18, fogFar: 60 }),
  cam: { mode: 'follow', yaw: 0, pitch: 50, dist: 6.5, fov: 56, lookY: 0.8, ahead: 0.5 },
  music() { return null; },
  amb(st) { return ['wind', 'room']; },
  build(M, st) {
    const d = st.day, night = st.tod === 'night', late = d >= 8;
    // ---- the bottom of the stairs
    M.room(-3, -3, 3, 3, 4, { floor: 'stone', wall: 'stone', trim: 'wood_dark' });
    M.door(0, 3, 'n', { tex: 'door_int', w: 1.1, to: 'church', spawn: 'tower' });
    M.door(0, -3, 's', { tex: 'door_up', w: 1.4, h: 2.4, to: 'belltower', spawn: 'mid', sfx: 'step' });
    M.look(-2.2, 0, 'A list of bell ringers, painted on a board, going back a hundred years. The last name is W. VANE, 1958-1960.', { r: 1.2, y: 1.6 });
    M.light(0, 3, 0, 6, '#f0e0c0', 0.6);
    M.cam(-3, -3, 3, 3, hidCam(-3, -3, 3, 3));
    M.spawn('bottom', 0, 1.8, 'n');
    // ---- the clock room
    M.room(16, -4, 24, 4, 3.6, { floor: 'wood_dark', wall: 'stone', trim: 'wood_dark' });
    M.door(20, 4, 'n', { tex: 'door_down', w: 1.4, h: 2.4, to: 'belltower', spawn: 'bottomUp', sfx: 'step' });
    M.door(20, -4, 's', { tex: 'door_up', w: 1.4, h: 2.4, to: 'belltower', spawn: 'loft', sfx: 'step' });
    M.decal('gears', 23.98, 0.6, 0, 3.6, 2.4, 'w', { off: 0.02 });
    M.decal('clock_face', 16.02, 0.8, 0, 2.2, 2.2, 'e', { off: 0.02, flipU: true, lit: false, bright: 0.9 });
    M.look(16.8, 0, (s) => ['The back of the clock face. Light comes through the numbers. The hands say 9:40, backwards.', s.day >= 6 ? 'The clock stopped at 9:40 in the evening, ten years ago. Somebody has oiled the gears every week since, and never started it again.' : 'The pendulum is tied up with string, very neatly, so it can\'t swing.'], { r: 1.3 });
    M.look(23, 0, 'Gears as big as bicycle wheels. Nothing is moving. It\'s so quiet you can hear the dust.', { r: 1.4 });
    M.light(20, 3, 0, 6, '#ffe8c0', 0.6);
    M.cam(16, -4, 24, 4, hidCam(16, -4, 24, 4));
    M.spawn('mid', 20, 2.6, 'n');
    M.spawn('midDown', 20, -2.6, 's');
    // ---- the bell loft
    const LX = 41, LZ = 0;
    M.floor(LX - 5, LZ - 5, LX + 5, LZ + 5, 'wood_dark', { tile: 2 });
    for (const [x, z] of [[-5, -5], [5, -5], [-5, 5], [5, 5], [0, -5], [-5, 0], [5, 0]]) M.box(LX + x, 0, LZ + z, 0.8, 4.4, 0.8, 'stone', { solid: true });
    for (const [x0, z0, x1, z1] of [[-5, -5, 5, -5], [-5, -5, -5, 5], [5, -5, 5, 5], [-5, 5, -1, 5], [1, 5, 5, 5]]) M.box(LX + (x0 + x1) / 2, 0, LZ + (z0 + z1) / 2, Math.max(0.5, Math.abs(x1 - x0)), 1.0, Math.max(0.5, Math.abs(z1 - z0)), 'stone', { solid: true });
    const pano = '@' + (night || late ? 'dome_night' : 'dome_day');
    for (let i = 0; i < 20; i++) { const a0 = -1.5 * Math.PI + i / 20 * Math.PI * 2 + 0.6, a1 = a0 + Math.PI * 2 / 20, R0 = 30; M.quad(pano, [[LX + Math.cos(a0) * R0, -12, LZ + Math.sin(a0) * R0], [LX + Math.cos(a1) * R0, -12, LZ + Math.sin(a1) * R0], [LX + Math.cos(a1) * R0, 18, LZ + Math.sin(a1) * R0], [LX + Math.cos(a0) * R0, 18, LZ + Math.sin(a0) * R0]], null, { lit: false, uvRect: [i / 20, 0, (i + 1) / 20, 1], bright: late ? 0.5 : 1 }); }
    M.cyl(LX, -0.5, LZ, 18, 0.1, 'roof_grey', { sides: 12, solid: false });
    M.box(LX, 4.4, LZ, 1.0, 0.3, 4.6, 'wood_dark', { solid: false });
    M.billboard('bell_big', LX, LZ - 1, 2.4, 2.4, { y: 1.8 });
    M.box(LX + 0.3, 0.8, LZ - 0.4, 0.04, 1.4, 0.04, 'fabric_brown', { solid: false });
    M.inter(LX + 0.3, LZ + 0.6, { r: 1.3, y: 1.3, use: async (S) => Story.ringBell(S) });
    M.door(LX, LZ + 5, 'n', { tex: false, w: 1.8, to: 'belltower', spawn: 'midDown', sfx: 'step', noCue: true });
    M.floorDecal('door_hatch', LX, LZ + 4.2, 1.4, 1.2, { y: 0.02 });
    for (let i = 0; i < 5; i++) M.ent({ type: 'sprite', region: 'pigeon', x: LX - 4 + i * 2, y: 1.05, z: LZ - 4.9 + (i % 2) * 0.1, w: 0.5, h: 0.4, t0: i, update(e, dt) { e.t0 += dt; e.y = 1.05 + (Math.sin(e.t0 * 3) > 0.96 ? 0.05 : 0); }, cond: () => !night && !late });
    M.look(LX - 4, LZ - 3.6, (s) => s.day >= 7 ? 'From up here you can see the whole town. Every single window is looking back up at you.' : 'From up here you can see the whole town: the school, the park, the aquarium dome, your own roof.', { r: 1.5 });
    M.look(LX + 3.8, LZ + 3.2, 'Names scratched into the stone, from a hundred years of bell ringers. One set is much lower down than the others, at kid height: E.V. WAS HERE. RANG IT 3 TIMES.', { r: 1.2 });
    M.light(LX, 3.6, LZ, 10, night ? '#8090c8' : '#fff4e0', 0.7);
    M.cam(LX - 5, LZ - 5, LX + 5, LZ + 5, { mode: 'follow', yaw: 0, pitch: 34, dist: 7.5, fov: 58, lookY: 1.4, ahead: 1.2, clamp: [LX - 4.5, LZ - 4.5, LX + 4.5, LZ + 9] });
    M.spawn('loft', LX, LZ + 3.4, 'n');
    M.spawn('bottomUp', 0, -1.8, 's');
  },
};

// ---------------------------------------------------------------- the back of Rosa's
MAPS.rosas = {
  name: "ROSA'S",
  env: (st) => interiorEnv(st, { ambient: [0.78, 0.72, 0.62], extra: { sat: 0.75, grade: [1.04, 1.0, 0.9] } }),
  cam: { mode: 'follow', yaw: 0, pitch: 48, dist: 7, fov: 56, lookY: 0.7, ahead: 0.6 },
  music() { return null; },
  amb() { return ['room', 'hum']; },
  build(M, st) {
    const d = st.day, late = d >= 8;
    // the kitchen
    M.room(-6, -4, 6, 4, 3, { floor: 'lino_checker', wall: 'tile_white', trim: 'plastic_red', gaps: [{ side: 'n', at: 0, w: 1.6, h: 2.4 }, { side: 'e', at: 0, w: 1.2, h: 2.2 }] });
    M.door(0, 4, 'n', { tex: 'door_green', w: 1.2, to: 'town', spawn: 'rosas', mat: null });
    M.stove(-4.6, -3.4, 's'); M.sink(-2.4, -3.4, 's'); M.counter(2.5, -3.4, 3, 0.8, 0.95, { top: 'metal', side: 'wood' });
    M.cyl(-4.6, 1.0, -3.4, 0.35, 0.4, 'metal', { sides: 8, solid: false });
    for (let i = 0; i < 3; i++) M.ent({ type: 'sprite', region: 'dc_steam', x: -4.6 + (i - 1) * 0.1, y: 1.5, z: -3.4, w: 0.4, h: 0.5, t0: i * 0.7, update(e, dt) { e.t0 += dt; e.y = 1.5 + (e.t0 % 2) * 0.5; } });
    M.look(-4.6, -2.6, (s) => s.day >= 7 ? ['A pot of soup on the stove, simmering. You lift the lid. It\'s full of seawater. A tiny crab is walking along the bottom.'] : ['A pot of soup on the stove, simmering. The burner isn\'t on.', 'It smells like somebody\'s grandmother\'s house. Not yours. Somebody\'s.'], { r: 1.2 });
    for (const x of [-3.6, 0, 3.6]) M.decal('clock_two', x, 2.2, -3.98, 0.45, 0.45, 's', { off: 0.02 });
    M.look(0, -3, ['There are three clocks in the kitchen. They all say two o\'clock.', 'The second hands are moving. The minute hands aren\'t.'], { r: 1.3, y: 2.4 });
    M.table(1.5, 0.6, 1.8, 1.0, 0.95, 'wood_light');
    M.look(1.5, 1.4, 'A cutting board: carrots, half chopped. The knife is lying where somebody put it down to answer the phone. The carrots are still fresh.', { r: 1.2 });
    M.box(-5.4, 1.4, 1, 0.4, 0.3, 0.6, 'plastic_red', { solid: false });
    M.look(-5, 1, (s) => ['A little red radio on a shelf, playing an old song. It\'s the same song. It has been the same song the whole time you\'ve been in here.', s.day >= 6 ? 'At the end of the song, the DJ says: "That one goes out to Rosa, who\'ll be right back."' : null].filter(Boolean), { r: 1.1 });
    M.light(0, 2.8, 0, 8, '#fff0d0', 0.7);
    M.cam(-6, -4, 6, 4, hidCam(-6, -4, 6, 4));
    // the pantry
    M.room(6, -3, 10, 3, 2.6, { floor: 'wood_dark', wall: 'wood', gaps: [{ side: 'w', at: 0, w: 1.2, h: 2.2 }] });
    for (const z of [-2.6, 2.6]) for (const y of [0.4, 1.1, 1.8]) M.decal('jar_row', 8, y, z === -2.6 ? -2.98 : 2.98, 3.4, 0.6, z === -2.6 ? 's' : 'n', { off: 0.02 });
    M.look(8, -2, ['Jars of preserves, floor to ceiling. They\'re labeled with names instead of fruit.', 'HAL. MAE. GUS. DANA. PRIYA. OKAFOR. MILLER. VANE.', 'There\'s an empty jar at the end of the shelf, clean, with a new label. It has your name on it.'], { r: 1.3 });
    M.light(8, 2.2, 0, 5, '#ffe0a0', 0.5);
    M.cam(6, -3, 10, 3, hidCam(6, -3, 10, 3, { pitch: 56 }));
    // the café, through the swing door
    M.room(-6, -16, 6, -4, 3, { floor: 'tile_mint', wall: 'wall_cream', trim: 'plastic_red', gaps: [{ side: 's', at: 0, w: 1.6, h: 2.4 }] });
    for (const [x, z] of [[-3.5, -12], [3.5, -12], [-3.5, -7.5]]) { M.table(x, z, 1.2, 1.2, 0.75, 'plastic_red'); for (const dx of [-0.3, 0.3]) M.box(x + dx, 0.75, z, 0.45, 0.9, 0.45, 'metal', { solid: false }); }
    M.table(3.5, -7.5, 1.2, 1.2, 0.75, 'plastic_red'); M.chair(3.5, -6.6, 'n', 'metal');
    M.cyl(3.5, 0.75, -7.6, 0.12, 0.14, 'plastic_white', { sides: 6, solid: false });
    M.look(3.5, -6.6, (s) => ['One table has its chair down. A cup of coffee, still steaming, and a newspaper folded to the crossword.', s.day >= 5 ? 'The newspaper is tomorrow\'s.' : 'The crossword is finished. Every answer is the same word, and you can\'t quite read it.'], { r: 1.2 });
    M.decal('rosa_menu', 0, 1.7, -15.98, 2.2, 1.2, 's', { off: 0.02 });
    M.look(0, -15, 'The menu board: TODAY. SOUP OF THE DAY. SOUP OF THE DAY. SOUP OF THE DAY.', { r: 1.2, y: 2.2 });
    M.decal(late ? 'win_dark' : 'win_shop', -3.4, 0.6, -15.98, 3.2, 1.9, 's', { off: 0.02, lit: false, bright: 1.2 }); M.decal(late ? 'win_dark' : 'win_shop', 3.4, 0.6, -15.98, 3.2, 1.9, 's', { off: 0.02, lit: false, bright: 1.2 });
    M.decal('sign_rosas_note', 0, 1.2, -15.96, 0.8, 0.6, 's', { off: 0.03 });
    M.look(-3.4, -15, (s) => s.day >= 8 ? 'Through the front window, the street is empty. Not just of people. Of everything.' : 'Through the front window: Main Street, going about its day. Nobody looks in. It\'s like they can\'t see the window.', { r: 1.4 });
    M.light(0, 2.8, -10, 10, '#fff4e0', 0.6);
    M.cam(-6, -16, 6, -4, hidCam(-6, -16, 6, -4));
    M.spawn('back', 0, 2.8, 'n');
  },
};

// ---------------------------------------------------------------- the attic of 12 Maple Street
MAPS.attic = {
  name: 'ATTIC',
  env: (st) => interiorEnv(st, { ambient: st.tod === 'night' ? [0.32, 0.3, 0.38] : [0.6, 0.56, 0.5], extra: { sat: 0.7 } }),
  cam: { mode: 'follow', yaw: 0, pitch: 55, dist: 6.5, fov: 56, lookY: 0.5, ahead: 0.5 },
  music() { return null; },
  amb() { return ['wind', 'room']; },
  build(M, st) {
    const d = st.day, night = st.tod === 'night', lnight = d >= 8 && night;
    M.room(-8, -4, 8, 4, 1.6, { floor: 'wood', wall: 'wood_dark', trim: 'wood_dark' });
    for (let x = -6; x <= 6; x += 3) { M.box(x, 1.6, -3.2, 0.25, 0.25, 1.6, 'wood_dark', { solid: false }); M.box(x, 1.6, 3.2, 0.25, 0.25, 1.6, 'wood_dark', { solid: false }); }
    M.floorDecal('door_hatch', 0, 3, 1.3, 1.2, { y: 0.02 });
    M.door(0, 4, 'n', { tex: false, w: 1.3, to: 'house', spawn: 'attic', sfx: 'step', noCue: true });
    M.quad('light_white', [[-0.6, 0.03, 3.6], [0.6, 0.03, 3.6], [0.6, 0.03, 2.4], [-0.6, 0.03, 2.4]], [[0, 0], [1, 0], [1, 1], [0, 1]], { blend: true, lit: false, vcols: new Array(4).fill([1, 0.95, 0.8, 0.3]) });
    // boxes (on the last night, somebody has arranged them into a shape)
    if (lnight) {
      M.movingBox(-5, -2.4, 0.9); M.at(-5, -2.4, 0.2, () => M.movingBox(0, 0, 0.6), 0.77); M.movingBox(-4.2, -1.8, 0.5); M.movingBox(-5.8, -1.8, 0.5);
      M.look(-5, -1.6, ['A pile of boxes. They\'ve been stacked into the shape of somebody sitting with their knees pulled up.', 'It\'s only boxes. The shape turns its head to follow you anyway.'], { r: 1.4 });
    } else {
      for (const [x, z, s] of [[-6.4, -2.8, 0.9], [-5.4, -3, 0.7], [-6.8, -1.6, 0.6], [5.6, 2.6, 0.8], [6.6, 2.4, 0.6]]) M.movingBox(x, z, s);
      M.look(-6, -1.8, 'Boxes, labeled in two handwritings: XMAS. TAX 82-85. R.V. - SEWING. EVAN - BABY. And one in a third, shakier hand: DO NOT THROW OUT.', { r: 1.4 });
    }
    M.billboard('dummy', -2.4, -3.2, 0.7, 1.5, { y: 0, solidR: 0.35 });
    M.look(-2.4, -2.4, (s) => s.day >= 7 ? 'A dressmaker\'s dummy in a woman\'s purple coat. The coat is buttoned up wrong, one button off, like somebody dressed it in a hurry, in the dark.' : 'A dressmaker\'s dummy wearing a purple coat. There are still pins in the hem, ready for a fitting that never came.', { r: 1.2 });
    M.billboard('crib', 2.6, -3.1, 1.4, 1.0, { y: 0, solidR: 0.5 }); M.billboard('fish_mobile', 2.6, -3.1, 1.0, 0.8, { y: 1.1 });
    M.look(2.6, -2.2, 'A crib, painted white, with a mobile of paper fish. When you breathe near it, the fish turn.', { r: 1.2 });
    M.billboard('paper_helmet', 4.6, -2.6, 0.55, 0.55, { y: 0.05 });
    M.look(4.6, -2, ['A papier-mâché diving helmet, painted gold. A Halloween costume, for a kid.', 'Inside, in marker: EVAN - 1989.', 'It is exactly the size of your head.'], { r: 1.1 });
    M.cyl(-0.6, 0, 2.6, 0.4, 0.5, 'fabric_red', { sides: 8 });
    M.pickup(-0.6, 2.6, 'ruth_letter', { y: 0.5, r: 1.2, text: 'A hatbox. Under the hat, pressed flat: an envelope. WALT. It was never sealed.' });
    M.decal('win_aq_round', 7.98, 0.4, 0, 1.0, 1.0, 'w', { off: 0.02, lit: false, bright: night ? 0.5 : 1.2 });
    M.inter(7.2, 0, { r: 1.2, y: 0.9, use: async (S) => Story.atticWindow(S) });
    M.box(-7.2, 0, 1.8, 1.0, 0.7, 1.6, { top: 'wood_dark', sides: 'wood' }, { solid: true });
    M.look(-6.4, 1.8, (s) => ['A steamer trunk. Inside: Walter\'s keeper uniform from the seventies, folded with tissue paper.', s.day >= 6 ? 'Under it, a second, much smaller uniform. The name tag says JR. KEEPER.' : 'It smells like mothballs and the sea.'], { r: 1.2 });
    M.light(0, 1.5, 0, 9, night ? '#8a8ab0' : '#ffe8c0', night ? 0.4 : 0.6);
    if (!night) M.light(7.4, 1, 0, 5, '#fff4d0', 0.6);
    M.spawn('hatch', 0, 2.2, 'n');
  },
};
