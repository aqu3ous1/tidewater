'use strict';
// ---------------------------------------------------------------------------
// BELLWOOD ELEMENTARY — summer break. Mostly empty. Room 5 was Evan's.
//   hallway x -14..14, z 0..5; Room 5 x -13..-1, z -12..0; records x 2..9
// ---------------------------------------------------------------------------

MAPS.school = {
  name: 'BELLWOOD ELEMENTARY',
  env: (st) => interiorEnv(st, { ambient: st.day >= 8 ? [0.7, 0.7, 0.66] : [0.98, 0.96, 0.9] }),
  cam: { mode: 'follow', yaw: 0, pitch: 34, dist: 8, fov: 56, lookY: 0.9, ahead: 1 },
  music(st) { return st.day >= 7 ? null : 'school'; },
  amb() { return ['buzz', 'room']; },
  build(M, st) {
    const mem = st.day >= 8;
    // hallway
    M.floor(-14, 0, 14, 5, 'lino_green', { tile: 2 });
    M.wall(-14, 5, 14, 5, 3.2, 'wall_school', { face: 'n', solid: true });
    M.wall(-14, 0, -14, 5, 3.2, 'wall_school', { face: 'e', solid: true });
    M.wall(14, 0, 14, 5, 3.2, 'wall_school', { face: 'w', solid: true });
    const doorways = [[-7, 'room5'], [5.5, 'records']];
    let cx = -14;
    for (const [x] of doorways) { M.wall(cx, 0, x - 0.8, 0, 3.2, 'wall_school', { face: 's', solid: true }); M.wall(x - 0.8, 0, x + 0.8, 0, 0.8, 'wall_school', { face: 's', y0: 2.4 }); cx = x + 0.8; }
    M.wall(cx, 0, 14, 0, 3.2, 'wall_school', { face: 's', solid: true });
    M.light(-6, 3, 2.5, 9, '#f8fff0', 0.45); M.light(6, 3, 2.5, 9, '#f8fff0', 0.45);
    M.lockerRow(-11.2, 0.3, 's'); M.lockerRow(11, 0.3, 's'); M.lockerRow(1.2, 0.3, 's');
    M.decal('sign_room5', -7, 2.45, 0, 1.0, 0.4, 's', { off: 0.04 });
    M.decal('sign_records', 5.5, 2.45, 0, 1.2, 0.5, 's', { off: 0.04 });
    M.box(12.5, 0, 3.8, 1.1, 0.8, 0.8, 'cardboard');
    M.decal('sign_lostfound', 12.5, 0.82, 4.21, 0.8, 0.4, 's', { off: 0.02 });
    M.inter(12.5, 3.0, { r: 1.2, y: 1.3, use: async (S) => Story.schoolLostFound(S) });
    M.decal('bulletin', -2.5, 1.3, 0.02, 1.6, 1.0, 's');
    M.look(-2.5, 0.8, (s) => s.day >= 8 ? 'A bulletin board. SUMMER READING LIST. And a flyer, very old: HAVE YOU SEEN THIS BOY?' : 'A bulletin board. SUMMER READING LIST. FALL PICTURE DAY: SEPT 12.', { r: 1.2, y: 2.2 });
    if (!mem) M.decal('ev_notice', -3.6, 1.6, 0.03, 0.4, 0.5, 's');
    M.door(0, 5, 'n', { tex: 'door_school', w: 2.4, to: 'town', spawn: 'school' });
    // --- Room 5
    M.floor(-13, -12, -1, 0, 'tile_grey', { tile: 2 });
    M.wall(-13, -12, -1, -12, 3.2, 'wall_school', { face: 's', solid: true });
    M.wall(-13, -12, -13, 0, 3.2, 'wall_school', { face: 'e', solid: true });
    M.wall(-1, -12, -1, 0, 3.2, 'wall_school', { face: 'w', solid: true });
    M.light(-7, 3, -6, 10, '#fffff0', 0.4);
    M.decal(mem ? 'chalk_remember' : (st.day >= 7 ? 'chalk_text' : 'chalk_text'), -7, 1.0, -12, 5, 2.1, 's');
    M.look(-7, -11, (s) => s.day >= 8 ? 'The chalkboard says REMEMBER three times, in three different handwritings.' : 'WELCOME BACK, CLASS OF 2002!', { r: 2 });
    M.desk(-10.5, -10, 's', 1.6, 'wood');
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) M.schoolDesk(-9 + c * 2.2, -7 + r * 2.2, 'n');
    M.inter(-4.6, -2.6, { r: 1.1, y: 1.2, use: async (S) => Story.lastDesk(S) });
    M.pickup(-9, -7.8, 'fc11', { y: 0.72, cond: (s) => s.day >= 3 });
    M.floor(-12.8, -4.5, -10.2, -0.3, 'abc_carpet', { y: 0.02, tile: 2.6, surf: 'carpet' });
    M.tvCart(-12.2, -2, 'e', mem ? 'tv_you' : 'tv_title');
    M.look(-11.4, -2, (s) => Story.schoolTV(s), { r: 1.2 });
    M.shelf(-2, -11.6, 1.8, 1.8, 's', 'bookshelf');
    M.decal('win_school', -12.97, 1.2, -8, 3, 1.8, 'e');
    M.decal('dr_fish', -12.97, 1.5, -4.6, 0.8, 0.6, 'e');
    M.cam(-13, -12, -1, 0, { mode: 'follow', yaw: 0, pitch: 50, dist: 8, fov: 56, lookY: 0.7, ahead: 0.6, clamp: [-12.6, -12, -1.4, -0.5] });
    // --- records office
    M.floor(2, -8, 9, 0, 'carpet_grey', { tile: 2 });
    M.wall(2, -8, 9, -8, 3.2, 'wall_white', { face: 's', solid: true });
    M.wall(2, -8, 2, 0, 3.2, 'wall_white', { face: 'e', solid: true });
    M.wall(9, -8, 9, 0, 3.2, 'wall_white', { face: 'w', solid: true });
    const recOpen = mem;
    if (!recOpen) { M.door(5.5, 0, 's', { tex: 'door_int', w: 1.4, locked: true, lockedMsg: 'RECORDS - STAFF ONLY. It\'s locked.' }); M.solid(4.6, -0.2, 6.4, 0.2); }
    M.box(3, 0, -7.4, 1.0, 1.6, 0.8, { sides: 'metal', s: '@drawers_front', top: 'metal' }, { fit: { s: true } });
    M.box(4.1, 0, -7.4, 1.0, 1.6, 0.8, { sides: 'metal', s: '@drawers_front', top: 'metal' }, { fit: { s: true } });
    M.inter(3.5, -6.4, { r: 1.3, y: 1.8, use: async (S) => Story.records(S) });
    M.light(5.5, 3, -4, 7, '#f0f0ff', 0.3);
    M.cam(2, -8, 9, 0, { mode: 'follow', yaw: 0, pitch: 55, dist: 6.5, fov: 56, lookY: 0.6, clamp: [2.4, -8, 8.6, -0.5] });
    M.spawn('front', 0, 3.8, 'n');
  },
};
