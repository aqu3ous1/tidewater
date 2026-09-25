'use strict';
// ---------------------------------------------------------------------------
// THE BELLWOOD AQUARIUM
//   Lobby x -10..10, z 4..16 (front door at z 16)
//   Main hall x -16..16, z -30..4. Tanks 1-3 west, 4-5 east, 6 north.
//   Penguin Point x -32..-16, z -24..-2
//   Employee corridor x 16..53, z -28..-22; rooms north of it (z -40..-28):
//     kitchen 17..26, office 27..36, storage 37..45, staff room 46..53
// ---------------------------------------------------------------------------

function aqPhase(st) {
  if (st.flags.lightsOut) return 'dark';
  if (st.day >= 8) return 'old';
  if (st.day >= 7 && st.tod === 'night') return 'empty';
  return 'normal';
}

// A doorway that is either a painted locked door, or an open gap
function aqDoorway(M, x, z, face, locked, msg, tex, onLocked) {
  if (locked) {
    M.door(x, z, face, { tex: tex || 'door_int', w: 1.5, locked: true, lockedMsg: msg, onLocked });
    if (face === 's' || face === 'n') M.solid(x - 0.9, z - 0.2, x + 0.9, z + 0.2); else M.solid(x - 0.2, z - 0.9, x + 0.2, z + 0.9);
    // a locked door can always be opened from the inside, so nobody is ever shut in
    const f = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] }[face];
    M.inter(x - f[0] * 0.9, z - f[1] * 0.9, { r: 1.2, y: 1.2, use: async (S) => {
      S.sfx('door', { vol: 0.6 });
      World.player.x = x + f[0] * 1.2; World.player.z = z + f[1] * 1.2; World.player.face = Math.atan2(f[0], -f[1]);
      await S.say(null, 'You let yourself out. The door locks again behind you.');
    } });
  }
}

MAPS.aquarium = {
  name: 'BELLWOOD AQUARIUM',
  env(st) {
    const ph = aqPhase(st);
    if (ph === 'dark') return { fog: '#020308', fogNear: 3, fogFar: 22, ambient: [0.1, 0.12, 0.22], clear: '#000000', sub: 2, sat: 0.6, snap: 1.4, affine: 1 };
    if (ph === 'old') return { fog: '#0a1420', fogNear: 14, fogFar: 44, ambient: [0.5, 0.56, 0.66], clear: '#000000', sub: 2, sat: 0.55, grade: [1.0, 1.0, 0.92] };
    if (ph === 'empty') return { fog: '#08101c', fogNear: 18, fogFar: 50, ambient: [0.62, 0.68, 0.82], clear: '#000000', sub: 2 };
    return { fog: '#0a1428', fogNear: 20, fogFar: 60, ambient: st.day === 6 ? [0.58, 0.62, 0.78] : [0.64, 0.7, 0.88], clear: '#000000', sub: 2 };
  },
  cam: { mode: 'follow', yaw: 0, pitch: 40, dist: 10, fov: 55, lookY: 0.8, ahead: 1.2 },
  music(st) { return Story.aquariumMusic(st); },
  amb(st) { const ph = aqPhase(st); return ph === 'dark' ? ['pump', 'drips'] : ph === 'old' ? ['pump', 'buzz'] : ['pump', 'bubbles']; },
  build(M, st) {
    const f = st.flags, d = st.day, ph = aqPhase(st);
    const hired = !!f.hired;
    const ghostOpen = (d >= 7 && st.tod === 'night') || d >= 8;
    const old = ph === 'old' || ph === 'dark';
    const H = 4.2;

    // ---------------------------------------------------------------- lobby
    M.room(-10, 4, 10, 16, H, { floor: 'tile_aqua', wall: old ? 'wall_grey' : 'tile_feature', gaps: [{ side: 'n', at: 0, w: 8, h: H }], trim: 'wall_navy', floorTile: 2 });
    M.light(0, 3.8, 10, 10, '#f0f4ff', ph === 'dark' ? 0 : 0.5);
    M.door(0, 16, 'n', { tex: 'door_glass', w: 3.2, h: 2.6, to: 'town', use: async (S) => Story.aqFrontDoor(S) });
    // ticket counter
    M.counter(-5.5, 8.6, 4.5, 1, 1.1, { top: 'wood_light', side: old ? 'wood_dark' : 'plastic_blue' });
    M.look(-5.5, 9.8, (s) => Story.ticketCounter(s), { r: 1.6 });
    M.box(-3.8, 1.1, 8.6, 0.4, 0.4, 0.4, 'plastic_white', { solid: false });
    M.inter(-7.3, 9.8, { r: 1.2, y: 1.6, use: async (S) => Story.lostFound(S) });
    M.box(-7.3, 1.1, 8.6, 0.8, 0.45, 0.6, 'cardboard', { solid: false });
    M.decal('sign_hours', -5.5, 2.2, 4.02, 2.6, 1.3, 's');
    // cat cushion
    M.cyl(-8.8, 0, 12.5, 0.55, 0.15, 'fabric_red', { sides: 8, solid: false });
    M.inter(-8.8, 12.5, { r: 1.2, y: 0.8, use: async (S) => Story.catCushion(S) });
    // gift shop
    M.decal('sign_gift', 6.5, 3.0, 4.02, 2.4, 0.7, 's');
    M.shelf(9.6, 7.5, 2.4, 2.0, 'w', 'gift_shelf'); M.shelf(9.6, 11.5, 2.4, 2.0, 'w', 'gift_shelf');
    M.look(9, 9.5, 'Plush fish, plush penguins, a plush octopus with eight very long legs. They all have the same sewn-on smile.', { r: 1.6 });
    M.table(5.5, 11, 1.8, 1.0, 0.9, 'wood_light');
    M.cutout('game_box', 5.2, 11, 0.45, 0.58, 's', { y: 0.9 }); M.cutout('game_box', 5.8, 11, 0.45, 0.58, 's', { y: 0.9 });
    M.decal('sign_price', 5.5, 0.95, 11.55, 0.8, 0.45, 's', { off: 0.02 });
    M.inter(5.5, 12.1, { r: 1.2, y: 1.8, use: async (S) => Story.giftGame(S) });
    M.cyl(4.4, 0.9, 10.8, 0.25, 0.12, 'glass', { sides: 6, solid: false });
    M.pickup(4.4, 11.6, 'fossil', { hidden: true, r: 0.9, text: 'A bowl of shark teeth with a card: FREE! TAKE ONE!' });
    M.pickup(7.8, 13.4, 'fc4', { cond: (s) => s.day >= 2 });
    if (d === 4) {
      M.box(7.8, 0, 6.2, 1.4, 0.9, 0.8, { sides: 'metal', top: '@gift_shelf' }, { fit: { top: true } });
      M.billboard('lbl_sort', 7.8, 6.2, 1.0, 0.5, { y: 1.1 });
      M.inter(7.8, 7.1, { r: 1.3, y: 1.6, use: async (S) => Story.sortCart(S) });
    }
    // stairs up to the upper level
    M.door(-10, 6.4, 'e', { tex: 'door_up', w: 1.6, h: 2.6, to: 'aq2', spawn: 'stairs', locked: (s) => !!s.flags.lightsOut, lockedMsg: 'The stairwell is pitch black. Something on the landing is breathing, very slowly.' });
    M.decal('sign_upper', -9.98, 2.9, 6.4, 1.8, 0.4, 'e', { off: 0.02 });
    M.spawn('from2f', -8.6, 6.4, 'e');
    M.trashcan(-1.6, 14.5, 'plastic_blue');
    M.inter(-1.6, 14.5, { r: 1.1, y: 1.2, use: async (S) => Story.aqTrash(S) });
    M.pickup(-9.2, 5, 'ticket', { r: 1.0, cond: (s) => s.day >= 2, text: 'Something is stuck under the edge of the counter. An old ticket.' });

    // ---------------------------------------------------------------- main hall
    const hallWall = old ? 'wall_navy' : 'wall_blue';
    M.room(-16, -30, 16, 4, H + 0.8, { floor: old ? 'carpet_grey' : 'carpet_blue', wall: hallWall, gaps: [{ side: 'w', at: -9, w: 4, h: 3.2 }, { side: 'e', at: -25, w: 1.6, h: 2.6 }, { side: 's', at: 0, w: 8, h: H }, { side: 'n', at: 0, w: 13.4, h: 4.05 }], trim: 'rubber' });
    // Tanks (west wall, facing east)
    const t1 = M.tank(-16 + 1.2, -3, 6, 2.8, 2.0, 'e', { back: 'tank_back_reef', decor: 'coral', dirty: false });
    const t2 = M.tank(-16 + 1.2, -14.5, 5, 2.8, 2.0, 'e', { back: 'tank_back_jelly' });
    const t3 = M.tank(-16 + 1.0, -23, 4, 2.4, 1.6, 'e', { back: 'tank_back_reef', decor: 'kelp' });
    // Tanks (east wall, facing west)
    const t4 = M.tank(16 - 1.6, -7, 7, 3.0, 2.8, 'w', { back: 'tank_back_reef', floor: 'rock', decor: 'kelp' });
    const t5 = M.tank(16 - 1.3, -17.5, 5, 2.8, 2.2, 'w', { back: 'tank_back_dark', floor: 'rock' });
    World.fishTank(M, t1, ['fish0', 'fish1', 'fish2', 'fish3', 'fish4', 'fish5', 'fish6', 'fish7'], ph === 'dark' ? 5 : 14);
    World.fishTank(M, t2, ['jelly'], 7);
    World.fishTank(M, t3, ['seahorse'], 5);
    World.fishTank(M, t4, ['turtle'], 2); World.fishTank(M, t4, ['fish2', 'fish4'], 4);
    World.fishTank(M, t5, ['octopus'], 1);
    // labels
    M.decal('label_t1', -16 + 0.02, 3.6, -3, 1.6, 0.5, 'e'); M.decal('label_t2', -16 + 0.02, 3.6, -14.5, 1.6, 0.5, 'e'); M.decal('label_t3', -16 + 0.02, 3.3, -23, 1.6, 0.5, 'e');
    M.decal('label_t4', 16 - 0.02, 3.9, -7, 1.6, 0.5, 'w'); M.decal('label_t5', 16 - 0.02, 3.7, -17.5, 1.6, 0.5, 'w');
    M.look(-13.4, -3, (s) => Story.tankLook(s, 1), { r: 2.2 });
    M.inter(-13.4, -14.5, { r: 2.0, y: 2, use: async (S) => Story.tank(S, 2) });
    M.inter(-13.6, -23, { r: 1.8, y: 2, use: async (S) => Story.tank(S, 3) });
    M.inter(13.4, -4, { r: 1.8, y: 2, use: async (S) => Story.tank(S, 4, 'a') });
    M.inter(13.4, -9.5, { r: 1.8, y: 2, use: async (S) => Story.tank(S, 4, 'b') });
    M.inter(12.9, -17.5, { r: 2.2, y: 2, use: async (S) => Story.tank(S, 5) });
    M.inter(-13.4, -1.2, { r: 1.2, y: 1.6, use: async (S) => Story.tank(S, 1) });
    // smudges on the glass (day 2 job)
    if (d === 2 && !f.windowsDone) {
      const sm = (n, x, z, face) => { if (!f['clean_' + n]) M.decal('smudge', x, 1.3, z, 1.4, 0.9, face, { off: 0.05, blend: true }); };
      sm(1, -16 + 2.25, -1.5, 'e'); sm(2, -16 + 2.25, -13.8, 'e'); sm(3, -16 + 1.85, -22.4, 'e'); sm(5, 16 - 2.45, -16.8, 'w');
    }
    if (d === 3 && !f.tank4Done) for (const [n, z] of [['a', -4.2], ['b', -9.8]]) if (!f['algae_' + n]) M.decal('algae', 16 - 3.05, 1.5, z, 1.8, 1.2, 'w', { off: 0.05, blend: true });
    // Tank 6 — the Deep
    const deepOpen = !!f.deepUncovered || d >= 8;
    const t6 = M.tank(0, -32.4, 13, 3.4, 3.8, 's', { back: 'tank_back_dark', floor: 'concrete_new', dark: true, baseH: 0.4, glassColor: '#3a5a7a', noGlass: false });
    if (!deepOpen) {
      M.decal('plywood', -3.3, 0.4, -30.25, 6.6, 3.8, 's', { off: 0.02 }); M.decal('plywood', 3.3, 0.4, -30.25, 6.6, 3.8, 's', { off: 0.02 });
      M.decal('tarp', 0, 3.2, -30.2, 13.4, 1.2, 's', { off: 0.02 });
      M.decal('sign_closed_t6', 0, 1.4, -30.15, 3.4, 1.0, 's', { off: 0.03 });
    } else World.fishTank(M, t6, ['fish7'], 2, { scale: 1.4, col: [0.25, 0.3, 0.4, 1] });
    M.decal('label_t6', 6.9, 3.9, -30.0, 1.6, 0.5, 's');
    M.inter(0, -29.2, { r: 3.4, y: 3, use: async (S) => Story.tank6(S) });
    // the column tank: floor to ceiling, fish swimming all the way around
    {
      const cx = 7, cz = -14, r = 1.9, h = 4.4;
      M.cyl(cx, 0, cz, r + 0.25, 0.5, 'wall_navy', { sides: 10, topTex: 'rubber' });
      M.cyl(cx, h + 0.5, cz, r + 0.25, 0.4, 'wall_navy', { sides: 10, solid: false });
      M.cyl(cx, 0.5, cz, r * 0.35, 0.5, 'rock', { sides: 6, solid: false });
      M.cyl(cx, 0.5, cz, r, h, 'water_tank', { sides: 10, solid: false, blend: true, alpha: 0.45, lit: false, cap: false, color: old ? '#6a8aa0' : '#bfe8ff' });
      World.fishTank(M, { x0: cx - r + 0.3, x1: cx + r - 0.3, y0: 1.0, y1: h - 0.2, z0: cz - 0.2, z1: cz + 0.2, front: [0, 0, 1] }, ['fish0', 'fish1', 'fish4', 'fish6'], ph === 'dark' ? 3 : 9, { scale: 0.9 });
      M.light(cx, 2.5, cz, 7, '#60c0ff', ph === 'dark' ? 0.8 : 0.55);
      M.look(cx, cz + r + 0.9, (s) => s.day >= 8 ? 'The column tank. The fish are swimming in a circle, all in the same direction, perfectly spaced.' : 'The column tank goes all the way up to the ceiling. The fish go round and round. Kids press their faces against it.', { r: 1.5 });
    }
    // center: touch pool + kids' corner + benches
    // touch pool: a low rock basin, open on top, with sea stars and things on a sandy bottom
    {
      const X0 = -2.1, X1 = 2.1, Z0 = -10.5, Z1 = -7.5, rim = 0.32, H = 0.75, rimTex = { sides: 'rock', top: 'rubber' };
      M.box(0, 0, Z1 - rim / 2, X1 - X0, H, rim, rimTex, { solid: false });
      M.box(0, 0, Z0 + rim / 2, X1 - X0, H, rim, rimTex, { solid: false });
      M.box(X0 + rim / 2, 0, (Z0 + Z1) / 2, rim, H, Z1 - Z0 - rim * 2, rimTex, { solid: false });
      M.box(X1 - rim / 2, 0, (Z0 + Z1) / 2, rim, H, Z1 - Z0 - rim * 2, rimTex, { solid: false });
      M.solid(X0, Z0, X1, Z1);
      M.floor(X0 + rim, Z0 + rim, X1 - rim, Z1 - rim, 'rock', { y: 0.26, tile: 1.4 });
      if (!old) {
        const live = [['tp_pebbles', -1.0, -9.8, 1.1, 0.75], ['tp_pebbles', 1.1, -8.2, 1.0, 0.7], ['tp_star_orange', -1.0, -8.35, 0.85, 0.85], ['tp_star_purple', 0.95, -9.55, 0.8, 0.8],
          ['tp_star_orange', 1.4, -8.75, 0.55, 0.55], ['tp_urchin', -0.05, -9.85, 0.7, 0.7], ['tp_anemone', 0.15, -8.3, 0.72, 0.72], ['tp_anemone', -1.45, -9.35, 0.55, 0.55], ['tp_snail', 0.55, -9.0, 0.4, 0.4]];
        for (const [r, x, z, w, d] of live) M.floorDecal(r, x, z, w, d, { y: 0.28 });
        // a crab that goes about its business
        M.ent({ type: 'sprite', region: 'crab', x: -0.5, y: 0.27, z: -9.3, w: 0.52, h: 0.3, t: 0, update(e, dt) { e.t += dt; e.x = -0.5 + Math.sin(e.t * 0.45) * 1.0 + Math.sin(e.t * 1.7) * 0.08; e.z = -9.3 + Math.sin(e.t * 0.23) * 0.4; } });
      }
      M.plane('water_tank', [X0 + rim, 0.6, Z1 - rim], [1, 0, 0], [0, 0, -1], X1 - X0 - rim * 2, Z1 - Z0 - rim * 2, { blend: true, alpha: old ? 0.75 : 0.26, lit: false, scroll: [0.03, 0.012], sub: 99, color: old ? '#4a6a7a' : '#a8e4f4' });
      M.decal('sign_touch', 0, 0.12, Z1, 1.6, 0.48, 's', { off: 0.02 });
    }
    M.look(0, -6.8, (s) => Story.touchPool(s), { r: 1.6 });
    M.floor(-10, -24, -3, -17, 'abc_carpet', { y: 0.02, tile: 3.5, surf: 'carpet' });
    M.tvCart(-9, -22.3, 'e', ph === 'dark' ? 'tv_you' : old ? 'tv_static' : 'tv_title');
    M.look(-8.2, -22.3, (s) => Story.kidsTV(s), { r: 1.2 });
    M.chair(-5.5, -19, 'n', 'plastic_red'); M.chair(-4.2, -19.3, 'n', 'plastic_yellow'); M.chair(-6.8, -18.8, 'n', 'plastic_blue');
    M.bench(-3, -1, 's'); M.bench(4, -21, 's');
    M.decal(old ? 'poster_deep' : 'poster_reef', -16 + 0.02, 2.1, -8.8 + 3.2, 1.3, 1.3, 'e');
    M.decal('poster_octopus', 16 - 0.02, 2.0, -12.2, 1.3, 1.1, 'w');
    M.decal('poster_jelly', -16 + 0.02, 2.2, -18.7, 1.1, 1.0, 'e');
    M.decal('poster_turtle', 16 - 0.02, 2.3, -1.6, 1.1, 0.9, 'w');
    M.decal('sign_employees', 16 - 0.02, 2.8, -25, 1.3, 0.55, 'w');
    // hall lamps (day 6 job)
    const lamps = [[-6, -2], [7, -13], [-4, -27]];
    lamps.forEach(([x, z], i) => {
      M.cyl(x, 0, z, 0.1, 2.4, 'metal', { sides: 4, solid: true });
      const on = ph === 'normal' ? (d !== 6 || f['bulb_' + i]) : ph === 'empty' || ph === 'old';
      M.box(x, 2.4, z, 0.5, 0.4, 0.5, on ? 'plastic_yellow' : 'glass_dark', { solid: false, lit: !on, bright: on ? 1.6 : 1 });
      if (on) M.light(x, 2.6, z, 7, '#fff4d0', 0.6);
      M.inter(x, z + 0.6, { r: 1.2, y: 2.9, use: async (S) => Story.hallLamp(S, i) });
    });
    // tank glow
    const glow = ph === 'dark' ? 0.9 : 0.5;
    M.light(-13, 1.8, -3, 6, '#60b0ff', glow); M.light(-13, 1.8, -14.5, 6, '#b080ff', glow); M.light(-13, 1.6, -23, 5, '#60c0ff', glow);
    M.light(13, 1.8, -7, 7, '#60c8e0', glow); M.light(13, 1.8, -17.5, 6, '#4070c0', glow); M.light(0, 1.8, -29, 8, '#203860', glow);
    if (ph !== 'dark') M.light(0, 4.5, -12, 12, '#a0c0f0', 0.15);
    // employee door (hall -> corridor)
    aqDoorway(M, 16, -25, 'w', !hired && !ghostOpen, 'EMPLOYEES ONLY.', 'door_metal');

    // ---------------------------------------------------------------- penguin point
    M.room(-32, -24, -16, -2, H, { floor: 'tile_grey', wall: old ? 'wall_grey' : 'wall_white', gaps: [{ side: 'e', at: -9, w: 4, h: 3.2 }], trim: 'rubber' });
    M.floor(-32, -24, -22, -2, 'rock_white', { y: 0.05, tile: 3 });
    M.floor(-30, -19, -24, -9, 'water', { y: 0.08, tile: 3, scroll: [0.03, 0.01], lit: false, bright: 0.9, surface: false });
    M.penguinRocks(-27, -5.5, 8, 4);
    M.quad('glass', [[-22, 0, -24], [-22, 0, -2], [-22, 2.2, -2], [-22, 2.2, -24]], [[0, 1], [1, 1], [1, 0], [0, 0]], { blend: true, alpha: 0.2, lit: false, color: '#d0f0ff' });
    M.box(-22, 0, -13, 0.25, 0.8, 22, 'rubber', { solid: false });
    M.solid(-22.3, -24, -21.7, -2);
    M.decal('sign_penguins', -16.02, 3.0, -13, 2.6, 0.6, 'w');
    M.decal('poster_penguin', -16.02, 1.6, -19.5, 1.0, 1.0, 'w');
    M.bench(-19, -17, 'w');
    M.pickup(-19, -17.4, 'sunglasses', { y: 0.5, cond: (s) => s.day >= 2 });
    M.inter(-21.2, -8, { r: 1.5, y: 1.4, use: async (S) => Story.penguinHatch(S) });
    M.box(-21.8, 0, -8, 0.3, 1.2, 1.4, 'metal', { solid: false });
    if (!old || ph === 'old') {
      const pn = ph === 'dark' ? 0 : 3;
      for (let i = 0; i < pn; i++) M.ent({ type: 'penguin', x: -28 + i * 1.5, z: -6 + (i % 2), y: 0.05, face: 0, t: i, wait: i, area: [-31, -23, -23, -3], target: null });
    }
    M.light(-24, 3.5, -13, 12, '#e0f0ff', ph === 'dark' ? 0 : 0.4);
    M.cam(-32, -24, -16, -2, { mode: 'follow', yaw: 0, pitch: 42, dist: 9, fov: 55, lookY: 0.8, clamp: [-31.5, -24, -16.5, -2.4] });

    // ---------------------------------------------------------------- employee corridor & rooms
    M.floor(16, -28, 53, -22, 'tile_grey', { tile: 2 });
    M.wall(16, -22, 53, -22, 3, 'wall_white', { face: 'n', solid: true });
    M.wall(53, -28, 53, -22, 3, 'wall_white', { face: 'w', solid: true });
    M.wall(16, -28, 16, -25.8, 3, 'wall_white', { face: 'e' }); M.wall(16, -24.2, 16, -22, 3, 'wall_white', { face: 'e' });
    // corridor north wall with doorways
    const rooms = [
      { id: 'kitchen', x0: 17, x1: 26, door: 21.5, floor: 'lino_checker', wall: 'wall_yellow', sign: 'sign_staffkitchen' },
      { id: 'office', x0: 27, x1: 36, door: 31.5, floor: 'carpet_red', wall: 'wall_maroon', sign: 'sign_owner' },
      { id: 'storage', x0: 37, x1: 45, door: 41, floor: 'concrete', wall: 'wall_grey', sign: 'sign_storage' },
      { id: 'staff', x0: 46, x1: 53, door: 49.5, floor: 'carpet_grey', wall: 'wall_cream', sign: 'sign_break' },
    ];
    let cx = 16;
    for (const r of rooms) {
      if (r.door - 0.8 > cx) M.wall(cx, -28, r.door - 0.8, -28, 3, 'wall_white', { face: 's', solid: true });
      M.wall(r.door - 0.8, -28, r.door + 0.8, -28, 0.6, 'wall_white', { face: 's', y0: 2.4 });
      M.decal(r.sign, r.door, 2.45, -28, 1.3, 0.5, 's', { off: 0.04 });
      cx = r.door + 0.8;
      // room shell (no south wall — the corridor wall is it)
      M.floor(r.x0, -40, r.x1, -28, r.floor, { tile: 2 });
      M.wall(r.x0, -40, r.x1, -40, 3, r.wall, { face: 's', solid: true });
      M.wall(r.x0, -40, r.x0, -28, 3, r.wall, { face: 'e', solid: true });
      M.wall(r.x1, -40, r.x1, -28, 3, r.wall, { face: 'w', solid: true });
      M.light((r.x0 + r.x1) / 2, 2.8, -34, 7, '#fff4e0', ph === 'dark' ? 0 : 0.45);
      M.cam(r.x0, -40, r.x1, -28, { mode: 'follow', yaw: 0, pitch: 58, dist: 7, fov: 58, lookY: 0.6, ahead: 0.4, clamp: [r.x0 + 0.5, -40, r.x1 - 0.5, -28.6] });
    }
    if (cx < 53) M.wall(cx, -28, 53, -28, 3, 'wall_white', { face: 's', solid: true });
    M.cam(16, -28, 53, -22, { mode: 'follow', yaw: 0, pitch: 38, dist: 7.5, fov: 56, lookY: 0.8, ahead: 0.5 });
    M.light(34, 2.8, -25, 12, '#f0f0ff', ph === 'dark' ? 0.1 : 0.4);
    // doorways
    aqDoorway(M, 21.5, -28, 's', !hired && !ghostOpen, 'KITCHEN. Staff only.');
    aqDoorway(M, 31.5, -28, 's', !(f.officeOpen || ghostOpen), (s) => Story.officeLockedMsg(s), 'door_red', async (S) => Story.officeKnock(S));
    aqDoorway(M, 41, -28, 's', !hired && !ghostOpen, 'STORAGE. Staff only.');
    aqDoorway(M, 49.5, -28, 's', !hired && !ghostOpen, 'STAFF ROOM.');
    // basement door at the end of the corridor
    M.decal('sign_maint', 52.96, 2.6, -25, 1.4, 0.6, 'w', { off: 0.04 });
    M.door(53, -25, 'w', { tex: 'door_metal', w: 1.4, to: 'basement', spawn: 'stairs', locked: (s) => !Story.basementOpen(s), lockedMsg: (s) => Story.basementLockedMsg(s) });

    // --- kitchen
    M.fridge(18, -39.2, 's', d === 5);
    M.inter(18, -38.2, { r: 1.2, y: 2, use: async (S) => Story.aqFridge(S) });
    M.stove(19.4, -39.4, 's'); M.sink(20.6, -39.4, 's'); M.cabinets(21.9, -39.4, 1.4, 's');
    M.cyl(19.4, 1.0, -39.4, 0.35, 0.5, 'metal', { sides: 6, solid: false });
    M.look(19.8, -38.3, (s) => Story.kitchenStove(s), { r: 0.9 });
    M.table(22, -34.5, 2.0, 1.2, 0.8, 'wood_light');
    M.chair(22, -33.4, 'n'); M.chair(22, -35.7, 's'); M.chair(20.6, -34.5, 'e');
    M.inter(22, -33, { r: 1.3, y: 1.4, use: async (S) => Story.kitchenTable(S) });
    M.trashcan(25.4, -38.8, 'metal');
    M.inter(25.2, -38, { r: 1.1, y: 1.3, use: async (S) => Story.kitchenTrash(S) });
    M.decal('coffee', 23.6, 1.0, -39.55, 0.4, 0.5, 's');
    M.trigger(17, -36, 26, -29, async (S) => Story.enterKitchen4(S), { once: true, cond: (s) => s.day === 4 && s.obj && s.obj.id === 'lunch4' });
    // --- office
    M.desk(31.5, -37.2, 's', 2.2, 'wood_dark');
    M.chair(31.5, -38.3, 's', 'fabric_red');
    M.inter(31.5, -36.2, { r: 1.4, y: 1.6, use: async (S) => Story.officeDesk(S) });
    M.box(35, 0, -38.8, 1.0, 1.6, 0.8, { sides: 'metal', s: '@drawers_front', top: 'metal' }, { fit: { s: true } });
    M.inter(34.6, -37.8, { r: 1.2, y: 1.8, use: async (S) => Story.officeCabinet(S) });
    M.decal('emp_board_base', 28.5, 1.5, -39.97, 2.2, 1.0, 's');
    M.decal('ph_emp_marcus', 27.9, 1.6, -39.94, 0.4, 0.48, 's'); M.decal('ph_emp_kaylee', 28.5, 1.6, -39.94, 0.4, 0.48, 's');
    M.decal(ghostOpen ? 'ph_emp_you' : 'ph_emp_blank', 29.1, 1.6, -39.94, 0.4, 0.48, 's');
    M.look(28.5, -38.8, (s) => Story.employeeBoard(s), { r: 1.2, y: 2.6 });
    M.decal('ph_walter_cat', 33.4, 1.6, -39.97, 0.8, 0.6, 's');
    M.decal('ph_family', 34.4, 1.7, -39.97, 0.8, 0.6, 's');
    M.inter(33.9, -38.9, { r: 1.1, y: 2.4, use: async (S) => Story.officePhotos(S) });
    M.decal('calendar', 27.02, 1.5, -33, 0.5, 0.6, 'e');
    M.look(27.6, -33, (s) => Story.officeCalendar(s), { r: 1.0, y: 2 });
    M.shelf(35.5, -31, 1.6, 2.0, 'w', 'bookshelf');
    M.decal('fish_tank_small_full', 27.03, 0.9, -30.5, 1.0, 0.7, 'e');
    // --- storage
    M.shelf(38.2, -39.5, 2, 2.2, 's', 'shelf_goods'); M.shelf(40.6, -39.5, 2, 2.2, 's', 'shelf_goods'); M.shelf(43.2, -39.5, 2.6, 2.2, 's', 'shelf_goods');
    M.inter(39.4, -38.5, { r: 1.6, y: 2, use: async (S) => Story.storageShelf(S) });
    M.box(43.5, 0, -33, 0.9, 0.8, 0.9, { top: '@box_ev', sides: 'cardboard' }, { fit: { top: true } });
    M.inter(43.5, -32, { r: 1.2, y: 1.2, use: async (S) => Story.evBox(S) });
    M.movingBox(38.5, -31, 0.8); M.movingBox(39.2, -30.2, 0.6, 0.5);
    M.pickup(41.5, -36.2, 'brochure_old', { cond: (s) => s.flags.hired });
    M.cyl(44.2, 0, -29.5, 0.3, 0.6, 'plastic_yellow', { sides: 6 });
    // stairs down to B1
    M.door(45, -36, 'w', { tex: 'door_down', w: 1.4, h: 2.4, to: 'aqb1', spawn: 'stairs', locked: (s) => s.day < 3 || !!s.flags.lightsOut, lockedMsg: (s) => s.flags.lightsOut ? 'The stairwell door won\'t open. Something is leaning on it from the other side.' : 'STAIRS - B1 - MAINTENANCE. It\'s locked. Walter has the key.' });
    M.decal('sign_b1', 44.98, 2.6, -36, 1.4, 0.55, 'w', { off: 0.02 });
    M.spawn('fromb1', 43.8, -36, 'w');
    // --- staff room
    M.lockerRow(49.5, -39.6, 's');
    M.inter(49.5, -38.6, { r: 1.6, y: 2.2, use: async (S) => Story.locker(S) });
    M.table(49.5, -34, 1.8, 1.2, 0.8, 'wood_light'); M.chair(48.4, -34, 'e'); M.chair(50.6, -34, 'w');
    M.decal('poster_rules', 46.02, 1.2, -35.5, 1.5, 1.5, 'e');
    M.look(46.6, -35.5, (s) => Story.staffRules(s), { r: 1.2, y: 2.4 });
    M.shelf(52.6, -33, 1.4, 1.8, 'w', 'bookshelf');
    M.inter(52, -33, { r: 1.2, y: 1.8, use: async (S) => Story.staffBinders(S) });
    M.pickup(52.2, -30.2, 'photo_staff', { y: 1.4, cond: (s) => s.day >= 3, text: 'An old photo is thumbtacked to the wall, curling at the corners.' });

    // cameras for the big rooms
    M.cam(-10, 4, 10, 16, { mode: 'follow', yaw: 0, pitch: 36, dist: 8.5, fov: 56, lookY: 0.9, ahead: 1.5 });
    M.floor(-14, 16, 14, 26, 'sidewalk', { tile: 2, bright: 0.5, surface: false });
    M.cam(-16, -30, 16, 4, { mode: 'follow', yaw: 0, pitch: 34, dist: 8.5, fov: 58, lookY: 1.0, ahead: 1.2, clamp: [-15.5, -30, 15.5, 3.6] });

    M.spawn('front', 0, 14.6, 'n');
    M.spawn('corridor', 51.4, -25, 'w');
    M.spawn('hall', 0, -2, 'n');
    M.spawn('kitchen', 22, -31.5, 'n');
    M.spawn('stairs', 51.4, -25, 'w');
  },
  update(dt, st) { Story.aquariumUpdate && Story.aquariumUpdate(dt, st); },
};
