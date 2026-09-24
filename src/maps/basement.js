'use strict';
// ---------------------------------------------------------------------------
// AQUARIUM BASEMENT — the pump room, the maintenance tunnel, and the space
// under Tank 6 that "doesn't exist anymore".
//   pump room x -8..8, z -8..8 (stairs up along the south wall)
//   tunnel    x -1.5..1.5, z -40..-8
//   chamber   x -6..6, z -52..-40
// ---------------------------------------------------------------------------

MAPS.basement = {
  name: 'PUMP ROOM',
  env(st) {
    const dark = st.flags.lightsOut;
    return { fog: '#030406', fogNear: dark ? 3 : 8, fogFar: dark ? 18 : 30, ambient: dark ? [0.14, 0.14, 0.2] : [0.46, 0.48, 0.5], clear: '#000000', sub: 2, sat: 0.6, snap: st.day >= 8 ? 1.3 : 1, affine: 1 };
  },
  cam: { mode: 'follow', yaw: 0, pitch: 50, dist: 8, fov: 56, lookY: 0.6, ahead: 0.6 },
  music() { return null; },
  amb(st) { return st.flags.lightsOut ? ['deep', 'drips'] : ['pump', 'buzz', 'drips']; },
  build(M, st) {
    const f = st.flags;
    // ------------------------------------------------ pump room
    M.room(-8, -8, 8, 8, 3.4, { floor: 'concrete', wall: 'concrete_dark', gaps: [{ side: 'n', at: 0, w: 1.6, h: 2.4 }], trim: 'rust' });
    M.light(-3, 3.2, 0, 9, '#e8f0ff', f.lightsOut ? 0.1 : 0.7);
    M.light(4, 3.2, 3, 7, '#e8f0ff', f.lightsOut ? 0 : 0.4);
    // stairs up to the corridor (south)
    M.stairsUp(0, 6.2, 'n', 1.8, 7, 'concrete');
    M.box(-1.1, 0, 7.3, 0.12, 2.6, 2.6, 'metal', { solid: false }); M.box(1.1, 0, 7.3, 0.12, 2.6, 2.6, 'metal', { solid: false });
    M.decal('door_metal', 0, 1.75, 8, 1.3, 2.2, 'n');
    M.door(0, 5.9, 'n', { tex: false, w: 1.8, to: 'aquarium', spawn: 'corridor', sfx: 'step', locked: (s) => !!s.flags.stairsBlocked, lockedMsg: 'You can hear him at the top of the stairs.' });
    M.inter(0.9, 5.4, { r: 1.2, y: 0.8, use: async (S) => Story.pumpStairs(S) });
    M.floorDecal('stain', 0, 5.0, 2.0, 1.3, { y: 0.02, blend: true });
    // machines & pipes
    M.pumpMachine(-5, -4, 's'); M.pumpMachine(-5, 2, 's');
    M.look(-5, -2.6, (s) => s.day >= 8 ? 'The pump. It\'s louder than it should be. It sounds like breathing.' : 'A big water pump. It thrums. The whole aquarium runs through this.', { r: 1.8 });
    M.decal('pipes', -7.95, 0.2, -2, 4, 3, 'e'); M.decal('pipes', 7.95, 0.2, 2, 4, 3, 'w'); M.decal('pipes', 3, 0.4, -7.95, 4, 3, 's');
    // the main intake valve
    M.box(6.9, 0.6, -3, 0.9, 1.4, 1.6, 'rust', { solid: true });
    M.decal('valve_wheel', 6.43, 1.3, -3, 0.8, 0.8, 'w', { off: 0.02 });
    M.inter(5.8, -3, { r: 1.4, y: 2.2, use: async (S) => Story.pumpValve(S) });
    M.decal('flat_calendar', 7.95, 1.6, -5.2, 0.45, 0.55, 'w');
    M.floorDecal('drain', 2.5, -2, 1.0, 1.0, { y: 0.02 });
    M.inter(2.5, -2, { r: 1.1, y: 0.6, use: async (S) => Story.pumpDrain(S) });
    M.floorDecal('stain', 4.5, -3.5, 2.5, 1.6, { y: 0.02, blend: true });
    // the tunnel door
    M.decal('sign_tunnel', 0, 2.5, -8, 1.1, 0.6, 's', { off: 0.04 });
    const tunnelOpen = !!f.tunnelOpen;
    if (!tunnelOpen) {
      M.door(0, -8, 's', { tex: 'door_metal', w: 1.4, to: 'tunnel', use: async (S) => Story.tunnelDoor(S) });
      M.solid(-0.9, -8.3, 0.9, -7.7);
    }
    // the door your house's basement opens onto
    if (f.houseBasementOpen) M.door(-8, 5, 'e', { tex: 'door_old', to: 'house', spawn: 'basement' });
    M.cam(-8, -8, 8, 8, { mode: 'follow', yaw: 0, pitch: 50, dist: 8, fov: 56, lookY: 0.6, ahead: 0.6, clamp: [-7.5, -7.5, 7.5, 7.6] });

    // ------------------------------------------------ tunnel
    M.floor(-1.5, -40, 1.5, -8, 'concrete_dark', { tile: 2 });
    M.wall(-1.5, -40, -1.5, -8, 2.6, 'brick_old', { face: 'e', solid: true });
    M.wall(1.5, -40, 1.5, -8, 2.6, 'brick_old', { face: 'w', solid: true });
    for (let z = -12; z > -40; z -= 8) M.light(0, 2.4, z, 5, '#c8b890', f.lightsOut ? 0.05 : 0.5);
    M.cam(-1.5, -40, 1.5, -8.3, { mode: 'follow', yaw: 0, pitch: 16, dist: 5, fov: 60, lookY: 1.0, ahead: 2, lag: 3 });
    M.look(0, -24, (s) => s.flags.tunnelWalked ? null : ['The tunnel is longer than the building above it.'], { r: 1.5, cond: (s) => !s.flags.tunnelWalked });
    M.trigger(-1.5, -26, 1.5, -22, async (S) => { S.flag('tunnelWalked'); S.sfx('step', { surf: 'hard', vol: 0.4, far: true, delay: 0.2 }); S.sfx('step', { surf: 'hard', vol: 0.4, far: true, delay: 0.55 }); }, { once: true, bg: true });

    // ------------------------------------------------ the chamber under Tank 6
    M.room(-6, -52, 6, -40, 3.2, { floor: 'concrete', wall: 'concrete_dark', gaps: [{ side: 's', at: 0, w: 3, h: 2.6 }] });
    M.floor(-2.5, -49, 2.5, -44, 'concrete_new', { y: 0.015, tile: 2 });
    M.inter(0, -46.5, { r: 2.6, y: 0.8, use: async (S) => Story.chamberPatch(S) });
    M.decal('tank_back_dark', 0, 0.8, -51.95, 10, 2.4, 's', { lit: false, bright: 0.8 });
    M.light(0, 2.6, -46, 8, '#3a5a8a', 0.8);
    M.pickup(2.8, -44.2, 'shoe', { secret: true, r: 1.1, after: async (S) => Story.foundShoe(S) });
    M.look(-4.5, -50.5, 'Rebar sticks out of the wall, bent over. Someone poured this in a hurry.', { r: 1.5 });
    M.cam(-6, -52, 6, -40, { mode: 'fixed', pos: [5.4, 3.0, -41], look: [-0.5, 0, -47], fov: 62 });

    M.spawn('stairs', 0, 5.2, 'n');
    M.spawn('house', -6.5, 5, 'e');
    M.spawn('tunnel', 0, -9.2, 'n');
    M.spawn('chamber', 0, -41.5, 'n');
  },
};
