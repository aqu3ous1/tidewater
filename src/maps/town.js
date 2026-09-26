'use strict';
// ---------------------------------------------------------------------------
// BELLWOOD — the town. Streets run east-west; everything faces south so the
// camera (looking north) always sees front doors.
//
//   z -140..-92  the river          z -62..-54  Harbor Road
//   z -88..-68   the aquarium        z -48..-26  shops (Main St fronts at -26)
//   z -22..-14   Main Street         z  -8..12   houses (Maple St fronts at 12)
//   z  18..26    Maple Street        z  30..56   park / school
//   z  60..68    Oak Street          x  -4..4    Center Avenue (N-S)
// ---------------------------------------------------------------------------

// time-of-day / phase lighting shared by outdoor areas
function outdoorEnv(st) {
  const tod = st.tod, day = st.day;
  if (day >= 8 && tod !== 'night') return { fog: '#d6d6c2', fogNear: 14, fogFar: 52, sky: ['#c4ccb4', '#e6e6d4', 0.5], ambient: [0.95, 0.95, 0.86], sat: 0.55, grade: [1.02, 1.0, 0.94] };
  if (day >= 8) return { fog: '#07080c', fogNear: 5, fogFar: 34, sky: ['#000000', '#0c0e14', 0.5], ambient: [0.27, 0.28, 0.38], sat: 0.6, snap: 1.6, affine: 1, wobble: 0.02 };
  if (tod === 'night') return { fog: '#10141f', fogNear: 8, fogFar: 42, sky: ['#04050a', '#161c2c', 0.5], ambient: [0.3, 0.34, 0.5] };
  if (day === 7) return { fog: '#b4b8bc', fogNear: 18, fogFar: 62, sky: ['#9aa0a8', '#c4c8cc', 0.5], ambient: [0.8, 0.82, 0.86], sat: 0.7 };
  if (tod === 'evening') return { fog: '#c89080', fogNear: 25, fogFar: 75, sky: ['#5a4a8a', '#f0a070', 0.45], ambient: [0.98, 0.76, 0.66] };
  if (tod === 'afternoon') return { fog: '#d6e4ee', fogNear: 30, fogFar: 90, sky: ['#76b0e6', '#e2eef4', 0.5], ambient: [1.05, 1.02, 0.96] };
  return { fog: '#d0dce8', fogNear: 28, fogFar: 88, sky: ['#8ec0ea', '#e0ebf2', 0.5], ambient: [1.0, 0.98, 0.93] };
}
const isNight = (st) => st.tod === 'night';
const memory = (st) => st.day >= 8;

// ---- building helpers ----------------------------------------------------------
function houseExt(M, x0, z0, x1, z1, o) {
  o = o || {};
  const h = o.h || 4.2, st = o.st;
  const dead = o.dead;
  const siding = dead ? 'siding_dead' : (o.siding || 'siding_white');
  M.box((x0 + x1) / 2, 0, (z0 + z1) / 2, x1 - x0, h, z1 - z0, siding, { top: false, back: false, sub: 3 });
  M.gable(x0, z0, x1, z1, h, o.rh || 2.6, dead ? 'roof_flat' : (o.roof || 'roof_grey'), siding);
  const dx = o.doorX == null ? (x0 + x1) / 2 : o.doorX;
  const win = (x) => M.decal(dead || o.boarded ? 'win_board' : (o.lit ? 'win_house_lit' : (isNight(st) ? 'win_dark' : 'win_house')), x, 1.3, z1, 1.3, 1.5, 's', { lit: !o.lit });
  // the windows belong to the house, not the door (the Delgados' door wanders later in the week)
  const cx = (x0 + x1) / 2;
  win(cx - 3.2); win(cx + 3.2);
  if (o.extraWin) { win(x0 + 1.6); win(x1 - 1.6); }
  M.box(dx, 0, z1 + 0.7, 2.6, 0.1, 1.4, 'wood', { solid: false });
  M.floor(dx - 0.8, z1 + 1.4, dx + 0.8, 16, 'sidewalk', { y: 0.03, tile: 2 });
  if (o.door !== false) M.door(dx, z1, 's', Object.assign({ tex: dead ? 'door_boarded' : (o.doorTex || 'door_wood') }, o.doorOpts || {}));
  // back fence so nobody walks behind the houses
  if (o.fenceBack !== false) M.hedge(x0 - 3, z0 - 2.2, x1 + 3, z0 - 1.4, 1.1);
}
function shopExt(M, x0, z0, x1, z1, o) {
  o = o || {};
  const h = o.h || 5.2;
  M.box((x0 + x1) / 2, 0, (z0 + z1) / 2, x1 - x0, h, z1 - z0, { sides: o.wall || 'brick', top: 'roof_flat' }, { back: false, sub: 3 });
  M.box((x0 + x1) / 2, h, (z0 + z1) / 2, x1 - x0 + 0.3, 0.3, z1 - z0 + 0.3, { sides: o.trim || 'wall_white', top: 'roof_flat' }, { solid: false });
  const dx = o.doorX == null ? (x0 + x1) / 2 : o.doorX;
  if (o.sign) M.decal(o.sign, dx, h - 1.55, z1, o.signW || 5.4, o.signH || 1.3, 's', { lit: false, bright: o.dark ? 0.6 : 1 });
  if (o.awning) M.box(dx, 2.8, z1 + 0.6, o.awningW || 5, 0.15, 1.2, o.awning, { solid: false });
  const wreg = o.dark ? 'win_dark' : (o.lit ? 'win_shop_lit' : 'win_shop');
  if (o.windows !== false) { M.decal(wreg, dx - 3.4, 0.6, z1, 3.4, 1.9, 's', { lit: !o.lit }); M.decal(wreg, dx + 3.4, 0.6, z1, 3.4, 1.9, 's', { lit: !o.lit }); }
  if (o.door !== false) M.door(dx, z1, 's', Object.assign({ tex: o.doorTex || 'door_glass' }, o.doorOpts || {}));
}

MAPS.town = {
  name: 'BELLWOOD',
  bounds: [-77, -111, 77, 72],
  env: outdoorEnv,
  cam: { mode: 'follow', yaw: 0, pitch: 30, dist: 10, fov: 55, lookY: 0.8, ahead: 1.5 },
  music(st) { return Story.townMusic(st); },
  amb(st) {
    if (memory(st) && isNight(st)) return [];
    if (isNight(st)) return ['crickets', 'wind'];
    if (st.day === 7) return ['wind'];
    if (memory(st)) return ['wind'];
    return ['birds', 'wind'];
  },
  onEdge(st) { Script.run(async (S) => { await S.say(null, st.day >= 8 ? 'There\'s nowhere else.' : st.day >= 7 ? 'Not yet.' : 'You just got here. There\'s nothing out that way anyway.'); }); },
  build(M, st) {
    const night = isNight(st), mem = memory(st), mnight = mem && night;
    const d = st.day, f = st.flags;
    M.sub = 4;

    // ---------------------------------------------------------------- ground
    const grass = mem ? 'grass_dead' : 'grass';
    // river + beach + far bank
    M.floor(-140, -140, 140, -92, 'water', { y: -0.4, tile: 6, scroll: [0.02, 0.01], lit: false, bright: night ? 0.35 : 1, surface: false, sub: 20 });
    M.floor(-140, -150, 140, -140, 'grass', { y: 0.3, tile: 6, sub: 20, surface: false });
    M.box(0, -0.4, -91.5, 160, 0.45, 1, 'concrete', { solid: false, top: false });
    M.solid(-160, -95, 44, -92); M.solid(48, -95, 160, -92);
    M.solid(43.2, -112, 44, -92); M.solid(48, -112, 48.8, -92); M.solid(43, -112, 49, -110.2);
    // aquarium plaza + lot + beach strip
    M.floor(-78, -92, -34, -64, 'asphalt', { tile: 4 });
    M.floor(-34, -92, 18, -64, 'sidewalk', { tile: 2 });
    M.floor(18, -92, 78, -64, 'sand', { tile: 4 });
    // Harbor Road
    M.floor(-78, -64, 78, -62, 'sidewalk', { tile: 2, y: 0.04 });
    M.floor(-78, -62, 78, -54, 'asphalt', { tile: 4, y: 0.01 });
    M.floor(-78, -54, 78, -52, 'sidewalk', { tile: 2, y: 0.04 });
    // commercial block ground
    M.floor(-78, -52, -4, -26, 'concrete', { tile: 4 });
    M.floor(6, -52, 78, -26, 'concrete', { tile: 4 });
    // Main Street
    M.floor(-78, -26, -6, -22, 'sidewalk', { tile: 2, y: 0.04 });
    M.floor(6, -26, 78, -22, 'sidewalk', { tile: 2, y: 0.04 });
    M.floor(-78, -22, 78, -14, 'asphalt', { tile: 4, y: 0.01 });
    M.floor(-78, -14, -6, -12, 'sidewalk', { tile: 2, y: 0.04 });
    M.floor(6, -14, 78, -12, 'sidewalk', { tile: 2, y: 0.04 });
    // residential block
    M.floor(-78, -12, -6, 16, grass, { tile: 4 });
    M.floor(6, -12, 78, 16, grass, { tile: 4 });
    M.floor(-78, 16, -6, 18, 'sidewalk', { tile: 2, y: 0.04 });
    M.floor(6, 16, 78, 18, 'sidewalk', { tile: 2, y: 0.04 });
    // Maple Street
    M.floor(-78, 18, 78, 26, 'asphalt', { tile: 4, y: 0.01 });
    M.floor(-78, 26, -6, 28, 'sidewalk', { tile: 2, y: 0.04 });
    M.floor(6, 26, 78, 28, 'sidewalk', { tile: 2, y: 0.04 });
    // park / school block
    // (the park grass goes round the duck pond, so the water can sit below it)
    M.floor(-78, 28, -62, 58, grass, { tile: 4 }); M.floor(-42, 28, -6, 58, grass, { tile: 4 });
    M.floor(-62, 28, -42, 34, grass, { tile: 4 }); M.floor(-62, 48, -42, 58, grass, { tile: 4 });
    M.floor(6, 28, 78, 58, grass, { tile: 4 });
    // Oak Street + south edge
    M.floor(-78, 58, -6, 60, 'sidewalk', { tile: 2, y: 0.04 });
    M.floor(6, 58, 78, 60, 'sidewalk', { tile: 2, y: 0.04 });
    M.floor(-78, 60, 78, 68, 'asphalt', { tile: 4, y: 0.01 });
    M.floor(-120, 68, 120, 110, grass, { tile: 6, sub: 12 });
    // Center Avenue
    M.floor(-6, -64, -4, 68, 'sidewalk', { tile: 2, y: 0.05 });
    M.floor(4, -64, 6, 68, 'sidewalk', { tile: 2, y: 0.05 });
    M.floor(-4, -54, 4, 110, 'asphalt', { tile: 4, y: 0.02 });
    // far ground beyond east/west
    M.floor(-160, -92, -78, 68, 'grass', { tile: 6, sub: 20, surface: false });
    M.floor(78, -92, 160, 68, 'grass', { tile: 6, sub: 20, surface: false });
    // road dashes
    for (let x = -74; x < 76; x += 6) { if (Math.abs(x) < 6) continue; M.floorDecal('road_dash', x, -58, 2.4, 0.3, { y: 0.03, rot: 'e' }); M.floorDecal('road_dash', x, -18, 2.4, 0.3, { y: 0.03, rot: 'e' }); M.floorDecal('road_dash', x, 22, 2.4, 0.3, { y: 0.03, rot: 'e' }); M.floorDecal('road_dash', x, 64, 2.4, 0.3, { y: 0.03, rot: 'e' }); }
    for (let z = -50; z < 100; z += 6) { if ([-58, -18, 22, 64].some((r) => Math.abs(z - r) < 5)) continue; M.floorDecal('road_dash', 0, z, 0.3, 2.4, { y: 0.03 }); }
    for (const z of [-58, -18, 22, 64]) M.floorDecal('crosswalk', 0, z - 5, 8, 2, { y: 0.035 });
    // the storm drain: the manhole cover is pushed aside from day 3
    M.floorDecal(d >= 3 ? 'manhole_open' : 'manhole', 1.5, 4, d >= 3 ? 2.2 : 1.4, d >= 3 ? 2.2 : 1.4, { y: 0.06 });
    M.inter(1.5, 4, { r: 1.2, y: 0.4, exit: true, use: async (S) => Story.manhole(S) });
    M.spawn('manhole', 1.5, 5.8, 's');
    // tree lines at the town edges
    for (let z = -60; z < 70; z += 7) { M.tree(-81, z, (z / 7) % 2 ? 'tree_pine' : 'tree_round'); M.tree(81, z + 3, (z / 7) % 2 ? 'tree_round' : 'tree_pine'); }
    for (let x = -70; x < 80; x += 9) M.tree(x, 76 + (x % 3), 'tree_pine');
    M.solid(-90, -92, -78, 72); M.solid(78, -92, 90, 72);
    // make the edge of town visible: bushes where you can't go on, barrels where the roads leave
    const roadsZ = [[-62, -54], [-22, -14], [18, 26], [60, 68]];
    const onRoad = (z) => roadsZ.some(([a, b]) => z > a - 1.2 && z < b + 1.2);
    for (let z = -90.5; z < 71; z += 2.6) {
      if (onRoad(z)) continue;
      M.billboard('bush', -78.3, z, 2.2, 1.35);
      M.billboard('bush', 78.3, z, 2.2, 1.35);
    }
    for (let x = -77; x < 78; x += 2.6) { if (Math.abs(x) < 6.5 || Math.abs(x + 40) < 2.6) continue; M.billboard('bush', x, 73, 2.2, 1.35); }
    // the woods trail, off the end of Oak Street (the chain comes down on day 4)
    M.floor(-41.6, 68, -38.4, 80, 'dirt', { y: 0.03, tile: 3 });
    M.postSign(-43.4, 70.6, 'sign_trail', 1.6, 0.8, 's', { y: 0.9 });
    if (d < 4) { M.box(-40, 0.6, 71.6, 3.4, 0.08, 0.08, 'rust', { solid: false }); M.postSign(-40, 71.6, 'sign_roadclosed', 1.0, 0.5, 's', { y: 0.3 }); }
    else M.floorDecal('stain', -42.2, 71.2, 0.9, 0.6, { y: 0.04, color: '#6a4a2a' });
    M.door(-40, 71.8, 'n', { tex: false, w: 3, use: async (S) => Story.trailGate(S) });
    M.spawn('trail', -40, 70.4, 'n');
    for (const [a, b] of roadsZ) { M.roadBlock(-76.7, a + 0.6, -76.7, b - 0.6, { signX: -75.6 }); M.roadBlock(76.7, a + 0.6, 76.7, b - 0.6, { signX: 75.6 }); }
    M.roadBlock(-3.4, 71.4, 3.4, 71.4, { signX: 0, signZ: 70.9 });

    // ---------------------------------------------------------------- the aquarium
    const aqX0 = -30, aqX1 = 14, aqZ0 = -88, aqZ1 = -68;
    if (!f.aquariumGone) {
      const aqOld = mem;
      M.box((aqX0 + aqX1) / 2, 0, (aqZ0 + aqZ1) / 2, aqX1 - aqX0, 7, aqZ1 - aqZ0, { sides: aqOld ? 'wall_grey' : 'tile_feature', top: 'roof_flat' }, { sub: 4 });
      M.box((aqX0 + aqX1) / 2, 7, (aqZ0 + aqZ1) / 2, aqX1 - aqX0 + 0.4, 0.5, aqZ1 - aqZ0 + 0.4, { sides: 'wall_white', top: 'roof_flat' }, { solid: false });
      // dome over the main hall
      M.cyl(-8, 7.5, -78, 7, 2.5, aqOld ? 'wall_grey' : 'glass_dark', { sides: 8, solid: false });
      M.cyl(-8, 10, -78, 4.5, 1.2, aqOld ? 'wall_grey' : 'glass_dark', { sides: 8, solid: false });
      M.decal(aqOld ? 'aq_sign_old' : 'aq_sign', -8, 3.3, aqZ1, 11, 2.75, 's', { lit: false, bright: night ? 0.7 : 1.05 });
      for (const x of [-26, -20, 4, 10]) M.decal('win_aq_round', x, 2.2, aqZ1, 2.4, 2.4, 's');
      M.box(-8, 2.75, aqZ1 + 1.0, 5, 0.18, 2.0, aqOld ? 'wall_grey' : 'plastic_blue', { solid: false });
      const aqClosed = (d === 7 && !night);
      M.door(-8, aqZ1, 's', {
        tex: 'door_glass', w: 3.2, h: 2.6, to: 'aquarium', spawn: 'front',
        locked: (s) => Story.aquariumLocked(s), lockedMsg: (s) => Story.aquariumLockedMsg(s),
      });
      if (aqClosed || (d === 6 && night) || (d === 7 && night && !f.ghostMet && false)) M.decal('sign_aq_closed', -8, 1.1, aqZ1 + 0.02, 1.8, 0.7, 's', { off: 0.05 });
      else if (!night && !mem) M.decal('sign_hours', -12.6, 1.0, aqZ1, 2.4, 1.2, 's');
      if (d >= 8 && !night) M.decal('poster_deep', -2.6, 1.0, aqZ1, 1.6, 1.4, 's');
      // fish statue on the plaza
      M.box(-19, 0, -65.2, 1.8, 1.0, 1.8, 'stone');
      M.cutout('fish0_0', -19, -65.2, 3.2, 2.1, 's', { y: 1.0, lit: true });
      M.look(-19, -64.2, (s) => s.day >= 8 ? ['A fish statue. There\'s a plaque.', '"FOR THE CHILDREN OF BELLWOOD."', 'Someone has scratched a line under CHILDREN.'] : ['A fish statue on a stone block. There\'s a plaque.', '"FOR THE CHILDREN OF BELLWOOD. 1976."'], { r: 1.8 });
      // benches + planters on the plaza
      M.bench(-25, -65, 's'); M.bench(3, -65, 's');
      M.tree(-29, -65.5, 'bush'); M.tree(10, -65.5, 'bush');
    } else {
      M.floor(-30, -88, 14, -68, 'grass_dead', { y: 0.03, tile: 4 });
      M.fence(-30, -68.5, 14, -68.5, { region: 'fence_chain', h: 1.8, seg: 3 });
      M.billboard('bush', -20, -80, 2.2, 1.35); M.billboard('bush', 4, -84, 2.2, 1.35);
      M.look(-8, -67.6, 'An empty lot behind a chain-link fence. Weeds. A rectangle of pale concrete, far back in the grass.', { r: 3 });
    }
    // parking lot
    for (let x = -74; x < -36; x += 4) M.floorDecal('road_dash', x, -78, 0.25, 5, { y: 0.03 });
    if (d <= 6 && !(d === 6 && night)) {
      M.car(-60, -79, 's', 'plastic_green');
      M.look(-60, -76.6, (s) => s.day >= 5 ? "Walter's truck. On the dashboard: a pine tree air freshener and a folded map of the city, still in its plastic." : "Walter's truck. There's a fishing hat on the passenger seat.", { r: 1.8 });
    }
    if (!mem) M.car(-48, -84, 'n', 'plastic_blue');
    M.lampPost(-40, -66, night); M.lampPost(-62, -66, night); M.lampPost(24, -66, night);
    // side of the aquarium: a back door (locked)
    if (!f.aquariumGone) M.door(aqX1, -80, 'e', { tex: 'door_metal', locked: true, lockedMsg: (s) => s.day >= 7 ? 'The back door. The lock has been changed.' : 'The back door. EMPLOYEES USE FRONT ENTRANCE.' });
    // beach, pier, shells
    M.pier(44, -110, 48, -86);
    M.bench(46, -97, 'e');
    M.pickup(46.8, -96, 'fc9', { y: 0.72 });
    for (let x = 22; x < 76; x += 11) M.billboard('reeds', x, -90, 1.2, 1.4);
    M.pickup(31, -81, 'shell1', { cond: (s) => s.flags.shellQuest || s.day >= 2 });
    M.pickup(58.5, -88.5, 'shell2', { cond: (s) => s.flags.shellQuest || s.day >= 2 });
    // the storm drain comes out on the beach
    M.box(30, 0, -91.4, 3.4, 2.8, 1.6, 'concrete', { solid: true });
    M.decal('drain_grate', 30, 0.1, -90.6, 2.6, 2.6, 's', { off: 0.02 });
    M.door(30, -90.6, 's', { tex: false, w: 2.6, use: async (S) => Story.outfallFromBeach(S) });
    M.floorDecal('stain', 30, -89.4, 3, 1.6, { y: 0.03, blend: true, color: '#4a5a6a' });
    M.spawn('outfall', 30, -89, 's');
    // where the pier meets the sand, the beach has washed out underneath
    M.floorDecal('stain', 43, -88.6, 1.8, 1.4, { y: 0.03, blend: true, color: '#3a3020' });
    M.inter(42.8, -88.6, { r: 1.2, y: 0.4, exit: true, use: async (S) => { await S.say(null, 'Where the pier meets the beach, the sand has washed out underneath. There\'s room to crawl under.'); const c = await S.ask(null, 'Crawl under the pier?', ['CRAWL UNDER', 'NO']); if (c === 0) await S.go('underpier', 'beach', { sfx: 'scrub' }); } });
    M.spawn('underpier', 42, -87.4, 's');
    M.box(62, 0, -76, 3, 0.4, 1.2, 'wood_dark', { solid: true });
    M.look(62, -74.8, 'An old rowboat, upside down in the sand. Something has been living under it.', { r: 1.6 });
    M.ent({ type: 'sprite', region: (e, t) => 'gull_' + (Math.floor(t * 3) % 2), x: 52, y: 4, z: -100, w: 0.8, h: 0.5, cond: (s) => !isNight(s) && !memory(s) });
    M.ent({ type: 'sprite', region: (e, t) => 'crab', x: 36, y: 0.02, z: -86, w: 0.5, h: 0.3, cond: (s) => !isNight(s) });

    // ---------------------------------------------------------------- shops (fronts at z = -26)
    // Church
    if (!mem) {
      M.box(-67, 0, -36, 18, 6.5, 20, { sides: 'stone', top: false }, { back: false, sub: 3 });
      M.gable(-76, -46, -58, -26, 6.5, 4, 'roof_grey', 'stone', { alongZ: true });
      M.box(-67, 6.5, -27.5, 3, 5, 3, 'stone', { solid: false });
      M.cyl(-67, 11.5, -27.5, 2.1, 3.2, 'roof_grey', { sides: 4, solid: false });
      M.decal('win_church', -72, 1.8, -26, 1.2, 2.6, 's'); M.decal('win_church', -62, 1.8, -26, 1.2, 2.6, 's');
      M.decal('sign_church', -67, 4.6, -26, 4.2, 1.2, 's');
      M.door(-67, -26, 's', { tex: 'door_red', w: 2, h: 2.8, to: 'church', spawn: 'front', locked: (s) => s.tod === 'night' || s.day >= 8, lockedMsg: 'The church is locked for the night.' });
      M.postSign(-61, -24.6, d >= 7 ? 'sign_church_board2' : 'sign_church_board', 2.2, 1.2, 's', { y: 0.6 });
      M.look(-61, -23.6, (s) => s.day >= 7 ? 'SUNDAY 10 AM. SERVICE FOR WALTER VANE.' : 'SUNDAY 10 AM. ALL WELCOME.', { r: 1.4 });
    } else {
      M.floor(-76, -46, -58, -26, 'dirt', { tile: 4, y: 0.02 });
      M.billboard('tree_dead', -70, -38, 3.6, 4.8);
      M.look(-67, -27, 'An empty lot. Weeds. The ground is flat, like nothing was ever built here.', { r: 3 });
    }
    // Market
    shopExt(M, -52, -44, -36, -26, { sign: 'sign_market', wall: mem ? 'white' : 'brick_tan', awning: 'plastic_green', lit: night, dark: mem && night, doorOpts: { to: 'market', spawn: 'front', locked: (s) => s.tod === 'night' || memory(s), lockedMsg: (s) => memory(s) ? 'The lights are on, but the door won\'t open. Nobody is inside.' : 'CLOSED. Open 7 AM to 8 PM.' } });
    // Diner
    shopExt(M, -30, -42, -14, -26, { sign: 'sign_hals', wall: 'wall_white', trim: 'plastic_red', awning: 'plastic_red', lit: night && !mem, dark: mem, doorOpts: { to: 'diner', spawn: 'front', locked: (s) => s.tod === 'night' && !memory(s), lockedMsg: 'Hal\'s is closed. The chairs are up on the tables.' } });
    // bus stop
    M.bench(-10, -24.7, 's');
    M.streetSign(-12, -24.3, 'sign_busstop', 's');
    M.pickup(-12, -23.8, 'bus_schedule', { hidden: true, r: 1.3, text: 'An old schedule is still taped to the pole. You peel it off.' });
    M.look(-12.2, -23.6, 'A rusted BUS STOP sign. The bench is newer than the sign.', { r: 1.1, cond: (s) => !!(s.found.bus_schedule) });
    M.streetSign(-6.5, -24.6, 'st_main', 'e'); M.streetSign(-6.5, -63.4, 'st_harbor', 'e');
    // Laundromat
    shopExt(M, 10, -40, 22, -26, { sign: 'sign_suds', signW: 4.4, signH: 1.6, wall: 'wall_mint', trim: 'wall_white', lit: night, dark: mem, doorOpts: { to: 'laundry', spawn: 'front', locked: (s) => s.tod === 'night' || memory(s), lockedMsg: 'SUDS is closed. A single dryer is still turning inside.' } });
    // Rosa's (closed, always)
    shopExt(M, 26, -40, 38, -26, { sign: 'sign_rosas', signW: 3.6, wall: 'brick', awning: 'plastic_green', awningW: 4, dark: true, doorTex: 'door_green', doorOpts: { locked: true, lockedMsg: 'A note in the window: BACK AT 2.' } });
    M.decal('sign_rosas_note', 32 + 1.1, 1.2, -26, 0.8, 0.6, 's', { off: 0.06 });
    // Rosa's side door, down the gap between Rosa's and Gus's
    M.door(38, -33, 'e', { tex: 'door_green', w: 1.1, h: 2.3, use: async (S) => Story.rosasBack(S) });
    M.box(41.5, 0, -38.2, 2.4, 1.4, 1.3, { top: 'metal', sides: 'plastic_green' }, { solid: true });
    M.look(41.5, -36.9, 'A dumpster. On top of it, very neatly, somebody has put a bowl of soup, still steaming.', { r: 1.3 });
    if (d >= 4) M.box(38.5, 0, -32.2, 0.4, 0.2, 0.2, 'brick', { solid: false });
    M.spawn('rosas', 39.2, -33, 'e');
    M.look(34.5, -25, (s) => s.day >= 8 ? ['BACK AT 2.', 'It has been two o\'clock for a very long time.'] : ['A note taped inside the door: BACK AT 2.', 'The chairs are stacked. There\'s dust on the menus.'], { r: 1.3 });
    // Gas station
    M.box(65, 0, -42, 18, 4.6, 12, { sides: 'wall_white', top: 'roof_flat' }, { back: false });
    M.decal('sign_gus', 70, 3.0, -36, 5, 1.4, 's');
    M.decal(night ? 'win_shop_lit' : 'win_shop', 72.6, 0.6, -36, 2.2, 1.8, 's', { lit: !night });
    M.door(69, -36, 's', { tex: 'door_glass', to: 'gas', spawn: 'front', locked: (s) => s.tod === 'night' || memory(s), lockedMsg: (s) => memory(s) ? 'The door is locked. There is a newspaper on the counter inside. It looks new.' : 'Gus\'s is closed for the night.' });
    M.decal('door_garage', 60, 0, -36, 5.6, 3.6, 's');
    M.inter(60, -35.3, { r: 2.4, y: 2, use: async (S) => Story.garageDoor(S) });
    M.box(53, 5.0, -30, 12, 0.3, 7, { sides: 'plastic_red', top: 'roof_flat', bottom: 'metal' }, { solid: false, bottom: true });
    for (const x of [48, 58]) { M.box(x, 0, -30, 0.35, 5.0, 0.35, 'metal', { solid: true }); }
    M.gasPump(52, -30, 's'); M.gasPump(58, -30, 's');
    M.decal('sign_prices', 73, 3.6, -26.2, 2, 1.2, 's', { twoSided: true, off: 0 }); M.box(73, 0, -26.3, 0.2, 3.6, 0.2, 'metal');
    M.decal('vending', 65.5, 0, -36, 1.0, 2.0, 's');
    M.look(65.5, -35.4, (s) => s.money >= 1 ? 'A soda machine. It eats your dollar and gives you nothing.' : 'A soda machine. You don\'t have any money.', { r: 1.1 });
    // alleys closed at the back of the shop row
    // (Center Ave stays open: it's the only way from Main St up to Harbor Rd and the aquarium)
    M.fence(-78, -50, -6, -50, { region: 'fence_chain', h: 2, seg: 3 });
    M.fence(6, -50, 78, -50, { region: 'fence_chain', h: 2, seg: 3 });

    // ---------------------------------------------------------------- houses (fronts at z = 12)
    // Pruitt house (Dana's)
    houseExt(M, -76, -6, -62, 12, { st, siding: 'siding_green', roof: 'roof_brown', lit: night && !mem, doorOpts: { locked: true, lockedMsg: (s) => Story.knock(s, 'pruitt') } });
    M.mailbox(-66, 15.5, 's');
    // Kessler house — abandoned
    houseExt(M, -54, -6, -40, 12, { st, siding: 'siding_yellow', dead: true, doorOpts: { to: 'kessler', spawn: 'front', locked: (s) => !s.inv.includes('kessler_key'), lockedMsg: 'The door is boarded, but the boards are loose. It\'s locked underneath.' } });
    M.floor(-54, 0, -40, 16, 'grass_dead', { y: 0.02, tile: 4 });
    M.fence(-55, 16, -39, 16, { region: 'fence_picket_dead', skip: (i) => i === 4 });
    M.postSign(-51, 14.5, 'sign_forsale', 1.4, 1.2, 's', { y: 0.5 });
    M.look(-51, 15.2, 'FOR SALE. The phone number has been painted over. The sign is older than you.', { r: 1.2 });
    M.tree(-42, 14, 'tree_dead');
    // Mrs. Miller #14
    const millerGone = mem;
    houseExt(M, -32, -6, -18, 12, { st, siding: millerGone ? 'siding_dead' : 'siding_pink', roof: 'roof_red', dead: millerGone, lit: night && !millerGone, doorOpts: { to: 'miller', spawn: 'front', locked: (s) => Story.millerLocked(s), lockedMsg: (s) => Story.millerLockedMsg(s) } });
    M.mailbox(-21.5, 15.5, 's', 'mailbox_miller');
    if (!millerGone) { M.fence(-33, 16, -26.2, 16); M.fence(-23.8, 16, -17, 16); M.billboard('flowers', -29, 13.6, 1.4, 0.7); M.billboard('flowers', -20, 13.6, 1.4, 0.7); }
    // YOUR HOUSE #12 (the old Vane house)
    houseExt(M, 10, -6, 24, 12, { st, siding: 'siding_blue', roof: 'roof_grey', lit: night, doorX: 17, doorOpts: { to: 'house', spawn: 'front', locked: (s) => !s.inv.includes('key_house'), lockedMsg: 'Locked. You need the key.' } });
    M.mailbox(20.5, 15.5, 's', 'mailbox_vane');
    M.inter(20.5, 16.2, { r: 1.3, y: 1.6, use: async (S) => Story.mailbox(S) });
    M.trashcan(12.5, 15.2, 'plastic_green');
    M.inter(12.5, 15.9, { r: 1.2, y: 1.4, use: async (S) => Story.curbBin(S) });
    M.fence(9, 16, 16.2, 16); M.fence(17.8, 16, 20, 16); M.fence(21.2, 16, 25, 16);
    M.tree(8, 4, 'tree_round');
    // Delgado house
    houseExt(M, 32, -6, 46, 12, { st, siding: 'siding_white', roof: 'roof_green', lit: night && !mem, boarded: mem && night, doorX: d >= 5 ? 44.6 : 39, doorOpts: { locked: true, lockedMsg: (s) => Story.knock(s, 'delgado') } });
    if (d < 6) M.mailbox(42.5, 15.5, 's');
    // Okafor house
    houseExt(M, 54, -6, 70, 12, { st, siding: 'siding_yellow', roof: 'roof_blue', lit: night && !mem, doorOpts: { locked: true, lockedMsg: (s) => Story.knock(s, 'okafor') } });
    M.mailbox(66, 15.5, 's');
    // gaps between houses: fenced, except the road that appears on the last day
    const vaneWay = mem;
    if (!vaneWay) M.fence(24, 8, 32, 8);
    else {
      M.floor(25, -14, 31, 18, 'asphalt', { y: 0.025, tile: 4 });
      for (let z = -10; z < 16; z += 6) M.floorDecal('road_dash', 28, z, 0.3, 2.4, { y: 0.04 });
      M.streetSign(31.8, 16.8, 'st_new', 's');
      M.look(31.8, 17.4, 'VANE WAY. There was never a road here.', { r: 1.2 });
    }
    M.fence(-62, 8, -54, 8); M.fence(-40, 8, -32, 8); M.fence(46, 8, 54, 8); M.fence(-18, 8, -6, 8); M.fence(6, 8, 10, 8); M.fence(70, 8, 77, 8);
    M.streetSign(6.5, 16.6, 'st_maple', 'w');
    M.tree(-10, -2); M.tree(50, 2); M.tree(-58, 0, 'tree_pine'); M.tree(74, -2);
    // lamp posts
    for (const x of [-60, -30, 10, 40, 70]) { M.lampPost(x, 17.3, night); M.lampPost(x + 10, -12.6, night); M.lampPost(x - 5, -52.6, night); }
    // small wrong things, a little more each day
    if (d >= 6) { M.at(0, 0, 's', () => M.mailbox(42.5, 15.5, 's'), 0.45); M.look(42.5, 16.3, 'A mailbox. It\'s not touching the ground. Not by much.', { r: 1.0, y: 2 }); }
    if (d >= 6 && d < 8) M.billboard('tree_round', 50, 2.5, 1.2, 1.6);
    if (d >= 7) M.cutout('flat_chair', 22.5, 14.2, 0.9, 1.35, 's');
    if (d >= 7) M.look(22.5, 14.9, (s) => 'A chair in the yard. It\'s flat, like a picture of a chair. It wasn\'t there yesterday.', { r: 1 });
    // missing posters on lamp posts
    if (d >= 4 && d <= 7) for (const x of [10, -30, 40]) { M.decal('poster_cat_small', x, 1.4, 17.3 + 0.1, 0.45, 0.6, 's', { off: 0.02 }); M.look(x, 18.1, 'MISSING: MARMALADE. Orange tabby. Red collar with a bell.', { r: 0.9, y: 1.8 }); }

    // ---------------------------------------------------------------- park & playground (z 30..56)
    // the duck pond: water a little below the grass, muddy banks, a ring of stones
    M.floor(-62, 34, -42, 48, 'water', { y: -0.3, tile: 4, scroll: [0.02, 0], lit: false, bright: night ? 0.35 : 0.95, color: mem ? '#6a7a7a' : '#8ad0e8', surface: false });
    M.wall(-62, 34, -42, 34, 0.7, 'dirt', { face: 's', y0: -0.7, solid: false }); M.wall(-62, 48, -42, 48, 0.7, 'dirt', { face: 'n', y0: -0.7, solid: false });
    M.wall(-62, 34, -62, 48, 0.7, 'dirt', { face: 'e', y0: -0.7, solid: false }); M.wall(-42, 34, -42, 48, 0.7, 'dirt', { face: 'w', y0: -0.7, solid: false });
    for (const [x0, z0, x1, z1] of [[-62.3, 33.7, -41.7, 34.1], [-62.3, 47.9, -41.7, 48.3], [-62.3, 34.1, -61.9, 47.9], [-42.1, 34.1, -41.7, 47.9]]) M.box((x0 + x1) / 2, 0, (z0 + z1) / 2, x1 - x0, 0.14, z1 - z0, 'rock', { solid: false });
    for (const [x, z, s] of [[-58, 38, 0.9], [-49, 44.5, 0.7], [-45, 37, 0.8]]) M.cyl(x, -0.29, z, s, 0.01, 'grass', { sides: 7, solid: false, color: '#4a8a3a' });
    M.solid(-62, 34, -42, 48);
    for (let x = -62; x < -42; x += 3.3) { M.billboard('reeds', x, 48.4, 1.1, 1.3); M.billboard('reeds', x + 1.5, 33.6, 1.1, 1.3); }
    M.pickup(-45, 49.2, 'shell3', { cond: (s) => s.flags.shellQuest || s.day >= 2 });
    M.look(-52, 49.5, (s) => memory(s) ? 'The pond is very still. You can\'t see the bottom.' : 'A little pond. There are coins at the bottom.', { r: 2 });
    M.bench(-66, 42, 'e'); M.bench(-38, 50, 'n');
    M.inter(-41.3, 41, { r: 1.2, y: 0.5, exit: true, use: async (S) => Story.pondLean(S) });
    M.spawn('pond', -40.4, 41, 'w');
    M.tree(-70, 32); M.tree(-70, 54, 'tree_pine'); M.tree(-40, 31); M.tree(-10, 34, 'tree_pine'); M.tree(-12, 55); M.tree(-66, 50, 'bush');
    // playground
    M.floor(-36, 36, -14, 54, 'sand', { y: 0.02, tile: 3 });
    M.swingSet(-25, 38.5, 's', { moving: !night, seats: mem ? 1 : 2, id: 'swings' });
    M.slide(-18, 46, 'w');
    M.sandbox(-31, 50, 4, 3);
    M.inter(-31, 50, { r: 2.2, y: 0.9, use: async (S) => Story.sandbox(S) });
    // merry-go-round (spins by itself on the last day)
    M.ent({
      type: 'merry', x: -30, z: 43, a: 0, speed: 0,
      build(b) { b.cyl(0, 0.3, 0, 1.6, 0.12, 'plastic_red', { sides: 8, solid: false, topTex: 'plastic_yellow' }); b.cyl(0, 0, 0, 0.12, 1.2, 'metal', { sides: 4, solid: false }); for (let i = 0; i < 4; i++) b.at(0, 0, i * Math.PI / 2, () => b.box(0, 0.42, 1.3, 0.06, 0.7, 0.06, 'metal', { solid: false })); },
      update(e, dt) { e.speed = memory(Game.st) ? 1.1 : lerp(e.speed, 0, dt * 0.2); e.a += e.speed * dt; if (!e.model) e.model = Mat4.create(); Mat4.model(e.model, e.x, 0, e.z, e.a); },
    });
    M.solidCircle(-30, 43, 1.6);
    M.inter(-30, 44.8, { r: 1.2, y: 1.2, use: async (S) => { if (memory(S.st)) { await S.say(null, 'It\'s turning by itself. Slowly. It doesn\'t make a sound.'); return; } const e = World.map.ents.find((q) => q.type === 'merry'); if (e) e.speed = 3; S.sfx('switch'); await S.say(null, 'You give the merry-go-round a push.'); } });
    M.floorDecal('hopscotch', -16, 38, 1.2, 3.6, { y: 0.03 });
    M.look(-16, 39, (s) => memory(s) ? 'Hopscotch. The squares go 1 through 8, and then there is a 9 drawn much later, in a different chalk.' : 'Hopscotch. Someone drew it very carefully.', { r: 1.2 });
    M.fence(-37, 34.5, -13, 34.5, { skip: (i) => i === 6 });
    // the Tide Club treehouse
    M.cyl(-73, 0, 42, 0.55, 6.5, 'bark', { sides: 6 });
    M.billboard('tree_round', -73, 41.6, 7, 8, { y: 1.5 });
    M.box(-73, 3.6, 42.3, 3.2, 1.9, 3.0, { sides: 'wood', top: 'roof_brown' }, { solid: false });
    M.decal('sign_club', -73, 4.6, 43.8, 1.4, 0.55, 's', { off: 0.02 });
    M.decal(night ? 'win_dark' : 'win_house', -74.1, 4.1, 43.8, 0.8, 0.8, 's', { off: 0.02 });
    for (let y = 0.4; y < 3.6; y += 0.45) M.box(-73, y, 42.6, 0.7, 0.08, 0.12, 'wood', { solid: false });
    M.inter(-73, 43.2, { r: 1.2, y: 1.2, exit: true, use: async (S) => Story.treeLadder(S) });
    M.spawn('treehouse', -73, 44, 's');

    // ---------------------------------------------------------------- school
    M.box(31, 0, 41, 38, 5, 18, { sides: 'brick_tan', top: 'roof_flat' }, { back: false });
    M.box(31, 5, 41, 38.4, 0.3, 18.4, { sides: 'wall_white', top: 'roof_flat' }, { solid: false });
    M.decal('sign_school', 31, 3.4, 50, 7, 1.3, 's');
    for (const x of [16, 22, 40, 46]) M.decal(night || mem ? 'win_dark' : 'win_school', x, 1.4, 50, 3.2, 2, 's', { lit: true });
    M.door(31, 50, 's', { tex: 'door_school', w: 2.6, h: 2.6, to: 'school', spawn: 'front', locked: (s) => Story.schoolLocked(s), lockedMsg: (s) => Story.schoolLockedMsg(s) });
    M.floor(12, 50, 50, 58, 'asphalt', { y: 0.02, tile: 4 });
    M.cyl(20, 0, 54, 0.08, 7, 'metal', { sides: 4 });
    M.decal('flag_us', 20.9, 5.6, 54, 1.8, 1.1, 's', { twoSided: true, off: 0 });
    M.box(44, 0, 56.5, 0.2, 3, 0.2, 'metal'); M.box(44, 3, 56.2, 1.4, 1.0, 0.1, 'plastic_white', { solid: false });
    M.tree(8, 34); M.tree(56, 36, 'tree_pine'); M.tree(60, 50); M.tree(72, 40); M.tree(66, 30, 'bush');
    M.fence(50, 50, 77, 50);

    // ---------------------------------------------------------------- south edge: town sign
    M.postSign(9, 71, mem ? 'town_sign2' : 'town_sign', 3.2, 1.6, 'n', { y: 0.8 });
    M.look(9, 70, (s) => memory(s) ? 'WELCOME TO BELLWOOD. POP. 1,205.' : 'WELCOME TO BELLWOOD. POP. 1,204.', { r: 1.8 });
    M.streetSign(6.5, 59.2, 'st_oak', 'w'); M.streetSign(-6.5, 26.8, 'st_center', 'e');
    M.hydrant(-7, 29); M.hydrant(7, -13); M.hydrant(30, 27);

    // ---------------------------------------------------------------- phase details
    if (d === 1 && !f.truckGone) {
      M.box(26.5, 0, 21.5, 2.6, 3.2, 5.8, { sides: 'plastic_white', top: 'plastic_white', s: 'plastic_white' }, {});
      M.box(26.5, 0, 25.4, 2.6, 2.2, 2.0, { sides: 'plastic_orange', top: 'plastic_orange' }, {});
      M.decal('win_shop', 26.5, 1.2, 26.41, 2.2, 0.8, 's');
      M.look(26.5, 18.2, 'The moving truck. Everything you own was in there. It didn\'t take long to unload.', { r: 2 });
    }
    if (mnight) {
      // things out of place
      M.box(-22, 2.6, 17, 0.35, 0.35, 0.55, 'plastic_blue', { solid: false });
      M.lampPost(3, 30, false);
      M.box(-1, 0, 40, 1.2, 1.2, 1.2, 'dev_checker');
      M.cutout('flat_chair', 1.5, 12, 0.9, 1.35, 's');
      M.cutout('flat_door', -4.8, -30, 1.3, 2.4, 's');
      M.billboard('walter_blank_s0', -2, -80, 1.14 * 3, 1.78 * 3, { cond: (s) => !s.flags.leftAquariumFinal });
    }
    // spawns
    M.spawn('intro', 17.5, 20.5, 'n');
    M.spawn('house', 17, 13.8, 's');
    M.spawn('miller', -25, 13.8, 's');
    M.spawn('kessler', -47, 13.8, 's');
    M.spawn('diner', -22, -24.8, 's');
    M.spawn('market', -44, -24.8, 's');
    M.spawn('laundry', 16, -24.8, 's');
    M.spawn('gas', 69, -34.8, 's');
    M.spawn('garage', 60, -34.4, 's');
    M.spawn('church', -67, -24.8, 's');
    M.spawn('school', 31, 51.2, 's');
    M.spawn('aquarium', -8, -66.5, 's');
  },
};
