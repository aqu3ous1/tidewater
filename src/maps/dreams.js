'use strict';
// ---------------------------------------------------------------------------
// Dream maps. Each dream is its own place: dreamN, spawn 'start'. You wake
// up by finding the way out (see Story.dreamWake). Logic: src/game/dreams.js
// ---------------------------------------------------------------------------

const DFACE = { s: Math.PI, n: 0, e: Math.PI / 2, w: -Math.PI / 2 };
const dreamEnv = (o) => Object.assign({ fog: '#1a1420', fogNear: 8, fogFar: 34, ambient: [0.7, 0.66, 0.72], clear: '#0a0810', sat: 0.85, snap: 1.3, affine: 1, wobble: 0.018 }, o || {});

// a character standing in a dream; talking cycles through their lines
function dchar(M, set, x, z, face, who, lines, o) {
  o = o || {};
  const e = M.ent(Object.assign({ type: 'char', set, x, z, face: typeof face === 'number' ? face : DFACE[face || 's'], col: o.col, scale: o.scale, y: o.y }, o.ent || {}));
  if (o.update) e.update = o.update;
  if (lines) {
    let i = 0;
    M.inter(x, z, { r: o.r || 1.5, y: 1.6, cond: o.cond, use: async (S) => {
      const L = typeof lines === 'function' ? lines(S) : lines;
      const page = Array.isArray(L[0]) ? L[Math.min(i++, L.length - 1)] : L;
      for (const l of page) await S.say(typeof who === 'function' ? who(S) : who, l);
      if (o.after) await o.after(S);
    } });
  }
  if (o.solid !== false) M.solidCircle(x, z, 0.35);
  return e;
}
// a thing to look at that can say different things each time
function dlook(M, x, z, lines, o) {
  o = o || {};
  let i = 0;
  M.inter(x, z, { r: o.r || 1.2, y: o.y || 1.2, cond: o.cond, tag: o.tag, use: async (S) => {
    const L = typeof lines === 'function' ? lines(S) : lines;
    const page = Array.isArray(L[0]) ? L[Math.min(i++, L.length - 1)] : L;
    for (const l of page) await S.say(o.who || null, l);
    if (o.after) await o.after(S);
  } });
}

// ============================================================ 1. the boxes
MAPS.dream1 = {
  name: 'THE BOXES', dream: 1,
  env: () => dreamEnv({ fog: '#2a1c14', fogNear: 9, fogFar: 30, ambient: [0.98, 0.84, 0.68], clear: '#140c08', sat: 0.9, wobble: 0.012 }),
  cam: { mode: 'follow', yaw: 0, pitch: 62, dist: 9, fov: 56, lookY: 0.5, ahead: 1.0 },
  music: () => 'dream1', amb: () => ['room'],
  onEnter: (S) => Dreams.enter(S, 1, { detune: 12, tempo: 0.92 }),
  build(M, st) {
    // a maze of moving boxes, the same every night
    const CW = 7, CH = 8, G = 2, X0 = -15, Z0 = -32, gw = CW * 2 + 1, gh = CH * 2 + 1;
    const grid = []; for (let y = 0; y < gh; y++) grid.push(new Array(gw).fill(1));
    const r = makeRng(812);
    const seen = new Set(['3,7']), stack = [[3, 7]]; grid[15][7] = 0;
    while (stack.length) {
      const [cx, cy] = stack[stack.length - 1];
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [cx + dx, cy + dy, dx, dy]).filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < CW && ny < CH && !seen.has(nx + ',' + ny));
      if (!nb.length) { stack.pop(); continue; }
      const [nx, ny, dx, dy] = nb[r.int(nb.length)];
      grid[cy * 2 + 1 + dy][cx * 2 + 1 + dx] = 0; grid[ny * 2 + 1][nx * 2 + 1] = 0;
      seen.add(nx + ',' + ny); stack.push([nx, ny]);
    }
    // a couple of loops so it isn't a pure tree
    for (const [gx, gy] of [[4, 5], [10, 9], [6, 11]]) grid[gy][gx] = 0;
    const wx = (gx) => X0 + gx * G + 1, wz = (gy) => Z0 + gy * G + 1;
    M.floor(X0, Z0, X0 + gw * G, Z0 + gh * G, 'wood_floor', { tile: 2 });
    M.floor(X0 - 30, Z0 - 30, X0 + gw * G + 30, Z0 + gh * G + 30, 'cardboard', { y: -0.02, tile: 3, surface: false });
    const boxTex = { top: '@box_moving', sides: 'cardboard' };
    for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
      if (!grid[gy][gx]) continue;
      const x = wx(gx), z = wz(gy), n = 1 + ((gx * 7 + gy * 3) % 3 === 0 ? 1 : 0);
      let y = 0;
      for (let k = 0; k < n; k++) {
        const s = 1.75 + r() * 0.2, h = 0.95 + r() * 0.3;
        M.at(x + (r() - 0.5) * 0.2, z + (r() - 0.5) * 0.2, (r() - 0.5) * 0.25, () => M.box(0, y, 0, s - k * 0.2, h, s - k * 0.2, boxTex, { fit: { top: true }, solid: false }));
        y += h;
      }
      M.solid(x - 1, z - 1, x + 1, z + 1);
    }
    // dead ends, farthest first
    const dist = {}; const q = [[7, 15]]; dist['7,15'] = 0;
    while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= gw || ny >= gh || grid[ny][nx] || dist[nx + ',' + ny] != null) continue; dist[nx + ',' + ny] = dist[x + ',' + y] + 1; q.push([nx, ny]); } }
    const ends = [];
    for (let gy = 1; gy < gh; gy += 2) for (let gx = 1; gx < gw; gx += 2) {
      if (grid[gy][gx] || (gx === 7 && gy === 15)) continue;
      const open = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => !grid[gy + dy][gx + dx]);
      if (open.length === 1) { const [dx, dy] = open[0]; ends.push([gx, gy, dist[gx + ',' + gy] || 0, dy > 0 ? 's' : dy < 0 ? 'n' : dx > 0 ? 'e' : 'w']); }
    }
    ends.sort((a, b) => b[2] - a[2]);
    const openBox = (x, z, label, inside, lines) => {
      M.box(x, 0, z - 0.2, 1.4, 0.9, 1.4, { sides: 'cardboard', top: false }, { solid: true });
      if (inside) M.floorDecal(inside, x, z - 0.2, 1.2, 1.2, { y: 0.5, lit: false });
      M.decal(label, x, 0.35, z + 0.5, 1.1, 0.34, 's', { off: 0.02 });
      dlook(M, x, z + 1.0, lines, { r: 1.4 });
    };
    const closedBox = (x, z, label, lines, o) => {
      o = o || {};
      const sz = o.s || 1.4;
      M.box(x, 0, z - 0.2, sz, o.h || 1.1, sz, { top: '@box_moving', sides: 'cardboard' }, { fit: { top: true }, solid: true });
      if (o.tape) M.floorDecal('dc_tape', x, z - 0.2, sz, sz, { y: (o.h || 1.1) + 0.02 });
      M.decal(label, x, 0.4, z - 0.2 + sz / 2, 1.1, label === 'dl_ev' ? 0.6 : 0.34, 's', { off: 0.02 });
      dlook(M, x, z + 1.0, lines, { r: 1.4 });
    };
    const specials = [
      (x, z) => openBox(x, z, 'dl_kitchen', 'dc_kitchen', ['Inside the box: a kitchen. A very small one.', 'The little fridge is humming. Somebody left the little light on.']),
      (x, z) => openBox(x, z, 'dl_books', 'dc_water', [['Inside: water, right up to the flaps.', 'A fish looks up at you. It seems embarrassed to be found in the BOOKS box.'], ['The fish has turned around so you can\'t see its face.']]),
      (x, z) => closedBox(x, z, 'dl_ev', [['This one is taped shut. A lot of tape. Years of tape.', 'Somebody wrote DO NOT on the side, and then stopped writing.'], ['You leave it alone.']], { tape: true }),
      (x, z) => openBox(x, z, 'dl_winter', 'dc_snow', ['Inside: it\'s snowing.', 'It is only snowing in the box.']),
      (x, z, wxz) => { M.ent({ type: 'penguin', x: wxz[0], z: wxz[1], y: 0.05, face: Math.PI, t: 0, wait: 1e9, area: [0, 0, 0, 0], target: null }); M.solidCircle(x, z, 0.4); dlook(M, x, z + 0.9, [['The penguin looks at you for a long time.', '"Not yet," it says.'], ['The penguin is pretending you aren\'t there.']], { who: null }); },
      (x, z) => openBox(x, z, 'dl_you', 'dc_helmet', ['Inside: a diving helmet, exactly your size.', 'You\'re already wearing one. You check. You are.']),
      (x, z, wxz) => { M.box(x, 0, z - 0.2, 1.4, 0.8, 1.4, boxTex, { fit: { top: true }, solid: true }); M.cutout('flat_phone', x, z, 0.7, 0.5, 's', { y: 0.8 }); st.dreamFlags = st.dreamFlags || {}; st.dreamFlags.phonePos = wxz;
        dlook(M, x, z + 1.1, [['A telephone on a box, ringing.', 'You pick up.', 'On the other end, someone is unpacking. You can hear tape being pulled off a box, very slowly.', 'They don\'t say anything. Neither do you.'], ['The line is still open. They\'re still unpacking.']], { after: async (S) => { S.st.dreamFlags.phone = true; } }); },
      (x, z) => closedBox(x, z, 'dl_basement', [['BASEMENT. It\'s too heavy to lift.', 'Something inside shifts when you push it. Then it\'s still.'], ['You don\'t push it again.']], { s: 1.8, h: 1.3 }),
      (x, z) => { M.tvCart(x, z - 0.3, 's', 'tv_title'); M.solid(x - 0.7, z - 0.9, x + 0.7, z + 0.2); dlook(M, x, z + 0.9, [['A TV, showing the title screen of a game. PRESS START.', 'You press START. Nothing happens here.', 'Somewhere else, something starts.'], ['PRESS START.']]); },
      (x, z) => openBox(x, z, 'dl_misc', 'dc_stairs', [['Inside: a staircase, going down.', 'Somebody left the light on down there.', 'You close the flaps.'], ['You don\'t open it again.']]),
      (x, z) => { M.box(x, 0, z - 0.2, 1.4, 0.9, 1.4, boxTex, { fit: { top: true }, solid: true }); M.billboard('cat_sit', x, z - 0.2, 0.9, 0.62, { y: 0.9 }); dlook(M, x, z + 1.1, [['An orange cat, sitting on a box. It lets you pet it.', 'It feels like a sweater that is breathing.'], ['The cat is asleep. Or it\'s pretending, like the penguin.']]); },
    ];
    const bedEnd = ends[0];
    ends.slice(1).forEach(([gx, gy, , face], i) => { if (specials[i]) M.at(wx(gx), wz(gy), face, () => specials[i](0, 0, [wx(gx), wz(gy)])); });
    // the bed, packed in a box, as far from the start as it can be
    M.at(wx(bedEnd[0]), wz(bedEnd[1]), bedEnd[3], () => {
      const x = 0, z = 0;
      M.bed(x, z - 0.3, 's');
      M.wall(x - 1, z + 0.75, x + 1, z + 0.75, 0.5, 'cardboard', { face: 's' });
      M.decal('dl_bed', x, 0.12, z + 0.77, 0.8, 0.3, 's', { off: 0.02 });
      M.inter(x, z + 1.0, { r: 1.6, y: 0.8, tag: 'wake', use: async (S) => {
        const c = await S.ask(null, 'Your bed. Somebody packed it in a box. Get in?', ['YES', 'NO']);
        if (c === 0) await Story.dreamWake(S, ['You get in. The box closes over you.', 'It\'s very dark, and very comfortable.']);
      } });
      M.light(x, 2.2, z, 5, '#ffe8b0', 0.9);
    });
    // bits of the living room, lost among the boxes
    M.couch(wx(7) - 1.8, wz(13), 1.6, 'n', 'fabric_green');
    M.lamp(wx(3), wz(9), 1.6, true);
    for (const [gx, gy] of [[7, 15], [3, 9], [11, 5], [5, 3], [9, 11], [13, 13], [1, 1]]) M.light(wx(gx), 2.4, wz(gy), 7, '#ffd8a0', 0.7);
    M.spawn('start', wx(7), wz(15), 'n');
  },
};

// ============================================================ 2. the shallow end
MAPS.dream2 = {
  name: 'THE SHALLOW END', dream: 2,
  env: () => dreamEnv({ fog: '#0a1a2a', fogNear: 10, fogFar: 34, ambient: [0.58, 0.72, 0.92], clear: '#040a14', sat: 0.95, wobble: 0.02 }),
  cam: { mode: 'follow', yaw: 0, pitch: 44, dist: 9, fov: 56, lookY: 0.8, ahead: 1.0 },
  music: () => 'aquarium', amb: () => ['pump', 'deep'],
  onEnter: (S) => Dreams.enter(S, 2, { tempo: 0.78, detune: 30, drift: -25 }),
  build(M, st) {
    const X0 = -15, X1 = 15, Z0 = -24, Z1 = 8;
    M.room(X0, Z0, X1, Z1, 5, { floor: 'tile_blue', wall: 'wall_navy' });
    M.plane('water', [X0, 0.1, Z1], [1, 0, 0], [0, 0, -1], X1 - X0, Z1 - Z0, { blend: true, alpha: 0.42, lit: false, scroll: [0.02, 0.01], tile: 4, sub: 99, color: '#8ad0f0' });
    M.surface(X0, Z0, X1, Z1, 'water', 0.1);
    // the fish are out of the tanks now
    World.fishTank(M, { x0: X0 + 2, x1: X1 - 2, y0: 1.0, y1: 4.2, z0: Z0 + 3, z1: Z1 - 3, front: [0, 0, 1] }, ['fish0', 'fish1', 'fish2', 'fish4', 'fish6'], 26, { scale: 1.4 });
    // ...and the people are in them
    const exhibit = (x, z, face, label, set, lines) => {
      M.at(x, z, face, () => {
        M.box(0, 0, 0, 2.6, 0.5, 1.8, { top: 'rubber', sides: 'wall_navy' }, { solid: false });
        M.quad('@tank_back_reef', [[-1.3, 0.5, -0.9], [1.3, 0.5, -0.9], [1.3, 3.2, -0.9], [-1.3, 3.2, -0.9]], null, { lit: false, bright: 0.7 });
        M.box(0, 3.2, 0, 2.6, 0.25, 1.8, { top: 'rubber', sides: 'wall_navy' }, { solid: false });
        M.quad('glass', [[-1.3, 0.5, 0.9], [1.3, 0.5, 0.9], [1.3, 3.2, 0.9], [-1.3, 3.2, 0.9]], [[0, 1], [1, 1], [1, 0], [0, 0]], { blend: true, alpha: 0.25, lit: false, color: '#c8e8ff' });
        M.decal(label, 0, 0.1, 0.92, 1.3, 0.3, 's', { off: 0.02 });
        M.solid(-1.3, -0.9, 1.3, 0.9);
      });
      if (set) dchar(M, set, x, z, face, set, lines, { y: 0.5, solid: false, r: 2.2 });
      else dlook(M, x + (face === 'e' ? 1.6 : face === 'w' ? -1.6 : 0), z + (face === 's' ? 1.6 : 0), lines, { r: 1.6 });
    };
    exhibit(-11, -21.5, 's', 'dt_1', 'visitor3', [['We\'re on vacation from being people.', 'It\'s very relaxing. They feed us twice a day.']]);
    exhibit(-6.5, -21.5, 's', 'dt_2', 'lou', [['I delivered everything. There\'s nothing left to deliver.', 'So now I wait here. It\'s nice. Nobody writes.']]);
    exhibit(6.5, -21.5, 's', 'dt_3', 'miller', [['Have you seen my — no. Never mind.', 'It\'s quiet in here. I can\'t hear anybody calling.']]);
    exhibit(11, -21.5, 's', 'dt_4', 'dana', [['Don\'t tap on the glass.', 'Seriously. It scares us.']]);
    exhibit(-12.5, -12, 'e', 'dt_5', 'gus', [['Everything leaks eventually.', 'Tanks. Cars. People. You just keep patching.']]);
    exhibit(-12.5, -4, 'e', 'dt_6', null, [['#6 YOU. The tank is empty.', 'There\'s a little stool in it, just your size, and a bowl of water.']]);
    exhibit(12.5, -12, 'w', 'dt_7', 'hal', [['Order up.', 'Nobody ever orders anything in here. I say it anyway.']]);
    exhibit(12.5, -4, 'w', 'dt_8', null, [['#8 (EMPTY). There\'s a nameplate, but it\'s been unscrewed.', 'The screw holes are very old.']]);
    // Tank 6, boarded up; something was on the other side
    M.decal('plywood', -3.3, 0.4, Z0 + 0.05, 6.6, 3.8, 's', { off: 0.02 });
    M.decal('plywood', 3.3, 0.4, Z0 + 0.05, 6.6, 3.8, 's', { off: 0.02 });
    M.decal('sign_closed_t6', 0, 2.2, Z0 + 0.1, 3.4, 1.0, 's', { off: 0.03 });
    M.decal('dc_hands', -1.2, 0.6, Z0 + 0.12, 2.4, 1.6, 's', { off: 0.04, blend: true });
    dlook(M, 0, Z0 + 1.2, [['TANK 6. The plywood is wet.', 'There are handprints on it. On the inside. They\'re small.'], ['The handprints are still wet. They don\'t dry.']], { r: 2.2 });
    // the penguins stand in the water and watch you
    for (let i = 0; i < 5; i++) M.ent({ type: 'penguin', x: -3 + i * 1.5, z: -15 + (i % 2) * 0.6, y: 0.1, face: 0, t: i, wait: 1e9, area: [0, 0, 0, 0], target: null });
    dlook(M, 0, -13.6, [['The penguins are standing in a row in the water.', 'They are all watching you. They have been watching you for a while.']], { r: 3 });
    // Mister Eight, floating in the middle of the room
    const oc = M.ent({ type: 'sprite', region: (e, tt) => 'octopus_' + (Math.floor(tt * 2) % 2), x: 0, y: 2.2, z: -7, w: 1.4, h: 1.2, t: 0, update(e, dt) { e.t += dt; e.y = 2.0 + Math.sin(e.t * 1.2) * 0.25; e.x = Math.sin(e.t * 0.3) * 0.6; } });
    M.inter(0, -6.2, { r: 2, y: 1.8, tag: 'key', use: async (S) => {
      const fl = S.st.dreamFlags;
      if (fl.key) { await S.say(null, 'Mister Eight is turning slowly in the air, like a tank with no tank.'); return; }
      await S.say(null, 'Mister Eight is floating in the middle of the room, as if the room were the tank.');
      await S.say(null, 'He holds out a key with one arm. It is shaped like a fish.');
      await S.say('octopus', 'IT OPENS THE OCEAN.');
      await S.say(null, 'He said it in Walter\'s voice.');
      fl.key = true; S.sfx('pickup');
      if (S.isObj('dream')) S.done('dream');
      await S.obj('dream', 'OPEN THE FRONT DOORS.');
    } });
    void oc;
    // Walter, at a ticket booth in the middle of the water
    M.box(4, 0, 3.2, 2.4, 1.1, 1.0, { top: 'wood', sides: 'plastic_blue' }, { solid: true });
    dchar(M, 'walter', 4, 2.4, 's', 'walter', [['Ticket? One ticket. Tank 6.', '...Oh. Sold out. Sold out for years, kiddo. Sorry.'], ['We\'re closed. We\'re always closed. Come back tomorrow.']], { r: 2 });
    M.decal('dc_nofeed', -8, 2.2, Z0 + 0.05, 2.4, 0.8, 's', { off: 0.02 });
    M.bench(-6, 1.5, 's'); dlook(M, -6, 2.4, 'The bench is floating a little. It doesn\'t go anywhere.');
    // the front doors
    M.door(0, Z1, 'n', { tex: 'door_glass', w: 3.2, h: 2.6, locked: (s) => !(s.dreamFlags && s.dreamFlags.key), lockedMsg: 'The front doors are locked. Through the glass, the parking lot is very far down, like the bottom of a well.',
      use: async (S) => Dreams.next(S, 'dream2b', ['You open the front doors with the fish.', 'The whole ocean comes in, very politely.', 'It\'s pink.']) });
    for (const [x, z] of [[-9, -16], [9, -16], [0, -2], [-9, 2], [9, 2]]) M.light(x, 4, z, 10, '#60c0ff', 0.7);
    M.spawn('start', 0, 5.5, 'n');
  },
};

// ============================================================ 3. the long counter
MAPS.dream3 = {
  name: 'THE LONG COUNTER', dream: 3,
  env: () => dreamEnv({ fog: '#1a1010', fogNear: 6, fogFar: 26, ambient: [0.98, 0.86, 0.8], clear: '#0c0808', sat: 0.95, wobble: 0.015 }),
  cam: { mode: 'follow', yaw: 0, pitch: 36, dist: 8, fov: 56, lookY: 1.0, ahead: 1.6 },
  music: () => 'diner', amb: () => ['room', 'buzz'],
  onEnter: (S) => Dreams.enter(S, 3, { tempo: 0.62, detune: 25, drift: -30 }),
  build(M, st) {
    const Z0 = -130, Z1 = 6;
    M.floor(-5, Z0, 5, Z1, 'lino_checker', { tile: 2 });
    M.wall(-5, Z0, -5, Z1, 3.2, 'wall_white', { face: 'e', solid: true });
    M.wall(5, Z0, 5, Z1, 3.2, 'wall_white', { face: 'w', solid: true });
    M.wall(-5, Z0, 5, Z0, 3.2, 'wall_white', { face: 's', solid: true });
    M.wall(-4.98, Z0, -4.98, Z1, 0.35, 'plastic_red', { face: 'e', y0: 1.3 });
    M.solid(-5, Z1 - 0.2, 5, Z1 + 0.5);
    // the counter, all the way down
    M.box(-3.2, 0, (Z0 + Z1) / 2, 1.2, 1.0, Z1 - Z0, { top: 'tile_white', sides: 'plastic_red' }, { solid: true });
    const sets = ['visitor1', 'lou', 'gus', 'ray', 'visitor3', 'ellis', 'mae', 'priya', 'dana', 'okafor', 'tommy', 'bea', 'donna', 'visitor2'];
    const lines = [
      ['My sandwich is looking at me.'], ['I ordered the Tuesday. They\'re out of Tuesday.'], ['They closed the ocean for cleaning. Did you hear?'],
      ['I\'ve been waiting for my check since 1976.'], ['Don\'t eat the pickle. The pickle knows.'], ['Everybody in this town has the same dream, you know. We take turns.'],
      ['Is it still August? It\'s always August.'], ['I used to sit next to a little boy here. He always got the grilled cheese.'], ['Shh. Listen. Somebody is digging.'],
      ['Hal makes the best tuna melt in the county. He makes it every day. Forever.'], ['This isn\'t my seat. This is somebody else\'s seat. I\'m keeping it warm.'],
      ['Mm. Mm-hm. Mm.'], ['More coffee? More coffee? More coffee?'], ['I had a cat once. Or a cat had me.'],
    ];
    let k = 0;
    for (let z = 2; z > Z0 + 6; z -= 2.5) {
      M.cyl(-1.9, 0, z, 0.24, 0.72, 'plastic_red', { sides: 6, solid: false, topTex: 'fabric_red' });
      M.floorDecal('dc_plate', -3.2, z, 0.9, 0.6, { y: 1.01 });
      const idx = Math.round((2 - z) / 2.5);
      if (idx % 3 === 1 && z !== -88) { dchar(M, sets[k % sets.length], -1.9, z, 'w', null, [lines[k % lines.length], ['They keep eating. They don\'t look at you.']], { y: 0.35, r: 1.2 }); k++; }
    }
    // Hal, over and over
    for (const [i, z] of [-10, -42, -74, -106].entries()) dchar(M, 'hal', -4.4, z, 'e', 'hal', i < 2 ? [['Order up!']] : [['Order up.', 'Order up. Order up.']], { r: 2.6 });
    // booths along the other wall, and dark windows
    for (let z = -4; z > Z0 + 8; z -= 12) {
      M.box(3.6, 0, z, 1.6, 0.8, 1.4, { top: 'wood_light', sides: 'metal' }, { solid: true });
      M.box(4.3, 0, z - 1.3, 1.4, 1.1, 0.6, 'fabric_red', { solid: true }); M.box(4.3, 0, z + 1.3, 1.4, 1.1, 0.6, 'fabric_red', { solid: true });
      M.decal('win_dark', 5, 1.2, z, 2.0, 1.4, 'w', { off: 0.02 });
      M.light(3, 2.8, z, 6, '#ffe0b0', 0.55);
    }
    M.decal('dc_pie', -5, 2.0, -20, 2.4, 1.2, 'e', { off: 0.03 });
    dlook(M, -3.9, -20, ['PIE OF THE DAY: TUESDAY.', 'It has been Tuesday for a long time.'], { r: 1.6 });
    dlook(M, -2.4, -30, [['The Beacon, left on the counter. The headline says: LOCAL MAN STILL HERE.', 'There\'s no picture.'], ['LOCAL MAN STILL HERE.']], { r: 1.2 });
    // the jukebox plays it backwards
    M.box(4.3, 0, -60, 1.0, 1.8, 0.9, { top: 'plastic_red', sides: 'plastic_yellow' }, { solid: true });
    M.decal('jukebox', 3.78, 0, -60, 1.0, 1.8, 'w', { off: 0.02 });
    dlook(M, 3, -60, ['The jukebox is playing a song backwards.', 'You know the song. You can\'t remember the words forwards.'], { r: 1.6 });
    // a phone on the wall
    M.decal('flat_phone', -4.98, 1.3, -50, 0.6, 0.5, 'e', { off: 0.02 });
    st.dreamFlags = st.dreamFlags || {}; st.dreamFlags.phonePos = [-4, -50];
    dlook(M, -4, -50, [['You pick up the phone on the wall.', 'It\'s for you. It\'s the ocean.', 'It doesn\'t say anything. It breathes in, and out.'], ['Still the ocean.']], { r: 1.4, after: async (S) => { S.st.dreamFlags.phone = true; } });
    // the empty seat
    M.cyl(-1.9, 0, -88, 0.24, 0.72, 'plastic_red', { sides: 6, solid: false, topTex: 'fabric_red' });
    M.billboard('dc_bell', -2.7, -87.6, 0.2, 0.2, { y: 1.02 });
    st.dreamFlags.bellPos = [-1.9, -88];
    dlook(M, -1.4, -88, [['A tuna melt, still hot. Next to it, a little bell, like from a cat\'s collar.', 'Nobody is sitting here. The stool is warm.'], ['The stool is still warm.']], { r: 1.2 });
    // the last booth
    const bz = Z0 + 9;
    M.box(3.4, 0, bz, 1.6, 0.8, 1.4, { top: 'wood_light', sides: 'metal' }, { solid: true });
    M.floorDecal('dc_plate', 3.2, bz - 0.35, 0.8, 0.5, { y: 0.81 }); M.floorDecal('dc_plate', 3.2, bz + 0.35, 0.8, 0.5, { y: 0.81 });
    M.box(4.3, 0, bz - 1.3, 1.4, 1.1, 0.6, 'fabric_red', { solid: true }); M.box(4.3, 0, bz + 1.3, 1.4, 1.1, 0.6, 'fabric_red', { solid: true });
    dchar(M, 'walter', 3.2, bz - 1.2, 's', 'walter', null, { y: 0.3, solid: false });
    M.light(3, 2.8, bz, 6, '#fff0c0', 0.9);
    M.inter(2.2, bz + 1.4, { r: 2.2, y: 1.4, tag: 'wake', use: async (S) => {
      await S.say('walter', 'There you are. Sit down, sit down. I ordered for both of us.');
      await S.say('walter', '...Not you, kiddo. You\'re fine where you are.');
      await S.wait(0.6);
      await S.say('donna', 'Last call.');
      for (let i = 0; i < 5; i++) { S.sfx('thud', { vol: 0.35 + i * 0.1 }); await S.fade(Math.min(1, 0.2 + i * 0.2), 0.25); await S.wait(0.35); }
      await Dreams.next(S, 'dream3b', []);
    } });
    dlook(M, 0, Z1 - 1.5, 'The door you came in through isn\'t there anymore. There\'s just more diner.', { r: 2 });
    M.spawn('start', 0, 3, 'n');
  },
};

// ============================================================ 4. parade
MAPS.dream4 = {
  name: 'PARADE', dream: 4,
  env: () => dreamEnv({ fog: '#0c0c1a', fogNear: 10, fogFar: 38, sky: ['#04040c', '#1a1430', 0.5], ambient: [0.55, 0.52, 0.72], clear: null, sat: 0.9, wobble: 0.016 }),
  cam: { mode: 'follow', yaw: 0, pitch: 38, dist: 9.5, fov: 56, lookY: 1.0, ahead: 1.2 },
  bounds: [-49, -12, 49, 12],
  music: () => 'dream4', amb: () => ['wind'],
  onEnter: (S) => Dreams.enter(S, 4, { detune: 10 }),
  build(M, st) {
    M.floor(-60, -30, 60, 20, 'grass', { tile: 4 });
    M.floor(-60, -4, 60, 4, 'asphalt', { y: 0.01, tile: 4 });
    M.floor(-60, -6, 60, -4, 'sidewalk', { y: 0.03, tile: 2 }); M.floor(-60, 4, 60, 6, 'sidewalk', { y: 0.03, tile: 2 });
    for (let x = -56; x < 60; x += 6) M.floorDecal('road_dash', x, 0, 2.4, 0.3, { y: 0.03, rot: 'e' });
    for (let i = 0; i < 40; i++) M.floorDecal('dc_confetti', -48 + (i * 37) % 96, -3 + (i * 13) % 7, 2, 2, { y: 0.035 });
    // houses along the north side, lit
    const houses = [[-46, 'siding_green', 'roof_brown'], [-30, 'siding_yellow', 'roof_grey'], [-14, 'siding_pink', 'roof_red'], [2, 'siding_white', 'roof_green'], [18, 'siding_yellow', 'roof_blue'], [34, 'siding_blue', 'roof_grey']];
    for (const [x0, siding, roof] of houses) houseExt(M, x0, -22, x0 + 12, -10, { st: { tod: 'night', day: 4, flags: {} }, siding, roof, lit: true, door: x0 !== 34, doorOpts: { locked: true, lockedMsg: 'You knock. Everyone inside is at the parade. So is the inside.' } });
    for (let x = -50; x < 52; x += 12) M.lampPost(x, -5.4, true);
    // your house is the last one; the party is in your yard
    const px = 40, pz = -7.6;
    M.table(px, pz, 2.4, 1.2, 0.72, 'wood_light');
    M.floorDecal('dc_cakesandwich', px, pz, 0.9, 0.7, { y: 0.74 });
    for (const [dx, dz, tex] of [[-1.5, 0, 'plastic_red'], [1.5, 0, 'plastic_blue'], [0, 1.0, 'plastic_yellow']]) M.chair(px + dx, pz + dz, dz ? 'n' : dx < 0 ? 'e' : 'w', tex);
    M.billboard('dc_party', px, pz + 1.0, 0.3, 0.35, { y: 0.95 });
    for (const [i, c] of ['r', 'b', 'y', 'g'].entries()) M.billboard('dc_balloon_' + c, px - 1.4 + i * 0.9, pz - 0.4, 0.4, 0.9, { y: 1.4 + (i % 2) * 0.3 });
    dlook(M, px, pz + 0.9, [['The cake is a sandwich.', 'Somebody wrote HAPPY B-DAY on it in mustard.'], ['Nobody has touched the cake.']], { r: 1.4 });
    dlook(M, px, pz + 1.8, [['A little party hat on an empty chair. The name card says MARMALADE.', 'He isn\'t here.'], ['He was never at the parade.']], { r: 1.2, tag: 'key', after: async (S) => { const fl = S.st.dreamFlags; if (!fl.party) { fl.party = true; if (S.isObj('dream')) S.done('dream'); await S.obj('dream', 'GO INSIDE.'); } } });
    dlook(M, px + 1.2, pz - 0.6, 'Under the table: a little bell, on its own. You don\'t pick it up.', { r: 1.0 });
    M.door(px, -10, 's', { tex: 'door_wood', noCue: true, locked: (s) => !(s.dreamFlags && s.dreamFlags.party), lockedMsg: 'Not yet. Marmalade is still out here somewhere.',
      use: async (S) => Story.dreamWake(S, ['You go inside. The parade keeps going without you.', 'You can hear it for a long time.']) });
    // Mrs. Miller, on her porch
    dchar(M, 'miller', -8, -8.6, 's', 'miller', [['Marmalade? Marma-lade?', 'Oh — hello, dear. Have you seen him? He loves a parade.'], ['Every cat in town is here. Every cat but him.']]);
    st.dreamFlags = st.dreamFlags || {}; st.dreamFlags.millerPos = [-8, -8.6];
    // the crowd: everyone came, nobody has a face
    const dark = [0.12, 0.12, 0.17, 1];
    for (let x = -48; x <= 48; x += 1.7) {
      if (Math.abs(x - px) < 3) continue;
      M.ent({ type: 'char', set: ['visitor1', 'lou', 'visitor3', 'mae', 'ray', 'priya', 'tommy', 'bea'][Math.abs(Math.round(x * 3)) % 8], x, z: 5.2 + (Math.round(x) % 2) * 0.5, face: 0, col: dark });
    }
    M.solid(-60, 4.9, 60, 6.2);
    for (const x of [-30, -6, 20]) dlook(M, x, 4.3, [['The crowd is cheering. You can hear it.', 'None of them have mouths.'], ['They\'re still cheering.']], { r: 1.4 });
    // the parade: cats with posters, a penguin band, a float
    const loop = (e, dt) => { e.x += e.speed * dt; if (e.x > 52) e.x -= 104; };
    const posters = ['dc_missing_cat', 'dc_missing_you', 'dc_missing_cat', 'dc_missing_boy', 'dc_missing_cat', 'dc_missing_cat', 'dc_missing_you', 'dc_missing_cat'];
    for (let i = 0; i < 8; i++) {
      const cat = M.ent({ type: 'sprite', region: 'cat_sit', x: -50 + i * 7, y: 0.02, z: -1.5 + (i % 2) * 1.2, w: 0.95, h: 0.66, speed: 1.1, update: loop });
      M.ent({ type: 'sprite', region: posters[i], x: cat.x, y: 0.9, z: cat.z, w: 0.6, h: 0.78, update(e) { e.x = cat.x; e.z = cat.z; } });
    }
    for (let i = 0; i < 6; i++) M.ent({ type: 'penguin', x: -10 - (i % 3) * 1.1, z: -1 + Math.floor(i / 3) * 1.4, y: 0.02, face: DFACE.e, t: i, wait: 1e9, area: [0, 0, 0, 0], target: null, speed: 1.1, update(e, dt) { e.x += 1.1 * dt; if (e.x > 52) e.x -= 104; e.t += dt * 3; } });
    M.ent({ type: 'sprite', region: 'fish0_0', x: 20, y: 0.4, z: 1.8, w: 3.6, h: 2.3, speed: 1.1, update: loop });
    for (const x of [-40, -20, 0, 20]) dlook(M, x, -3.2, [['A cat walks by on its back legs, carrying a sign that says MISSING.', 'The picture on the sign is you.'], ['Another cat. Another sign. The picture on this one is a boy in a striped shirt.', 'The date has been torn off.'], ['The parade goes by. It has gone by many times.']], { r: 2.0 });
    M.spawn('start', -40, 2.4, 'e');
  },
};

// ============================================================ 5. low tide
const DREAM5_DOORS = ['The door is full of water. You can\'t open it against the weight.', 'Through the window: a living room, perfectly dry. Nobody home.', 'You knock. Bubbles come out of the keyhole.', 'The door is open, but there is another door right behind it. And another.'];
MAPS.dream5 = {
  name: 'LOW TIDE', dream: 5,
  env: () => dreamEnv({ fog: '#0a3040', fogNear: 4, fogFar: 32, sky: ['#04141c', '#1a5a6a', 0.5], ambient: [0.45, 0.72, 0.82], clear: null, sat: 0.85, snap: 1.6, wobble: 0.03 }),
  cam: MAPS.town.cam,
  bounds: MAPS.town.bounds,
  music: () => 'dream5', amb: () => ['deep'],
  onEnter: (S) => Dreams.enter(S, 5),
  build(M, st) {
    // the real town, at the bottom of the sea
    const fake = { day: 4, tod: 'night', flags: {}, inv: [], found: {}, side: [], map: 'dream5', name: st.name };
    MAPS.town.build(M, fake);
    M.doors.forEach((d, i) => { d.to = null; d.use = null; d.locked = true; d.lockedMsg = DREAM5_DOORS[i % DREAM5_DOORS.length]; });
    M.inters.length = 0; M.triggers.length = 0;
    // kelp in the yards, fish in the streets, bubbles going up
    const r = makeRng(55);
    for (let i = 0; i < 70; i++) { const x = -74 + r() * 148, z = -60 + r() * 128; if (Math.abs(z - 22) < 5 || Math.abs(z + 18) < 5 || Math.abs(x) < 5) continue; M.billboard('kelp', x, z, 1.2, 2.6 + r() * 2); }
    for (const [x0, x1, z0, z1] of [[-60, 60, 18, 26], [-60, 60, -22, -14], [-4, 4, -50, 60], [-40, -10, 30, 56]]) World.fishTank(M, { x0, x1, y0: 1.5, y1: 5, z0, z1, front: [0, 0, 1] }, ['fish0', 'fish2', 'fish3', 'fish5'], 14, { scale: 1.6 });
    for (let i = 0; i < 26; i++) M.ent({ type: 'sprite', region: 'bubble', x: -60 + r() * 120, y: r() * 8, z: -40 + r() * 100, w: 0.25, h: 0.25, sp: 0.6 + r() * 0.8, update(e, dt) { e.y += e.sp * dt; if (e.y > 9) e.y = 0; } });
    for (let i = 0; i < 6; i++) M.ent({ type: 'sprite', region: (e, tt) => 'jelly_' + (Math.floor(tt * 1.5) % 2), x: -40 + i * 16, y: 4, z: 10 + (i % 3) * 14, w: 1, h: 1.2, t: i, update(e, dt) { e.t += dt; e.y = 3.5 + Math.sin(e.t * 0.6) * 1.2; } });
    M.look(46, -98, ['The river is up above you now.', 'You can see the bottoms of the boats going over, very slowly.'], { r: 3 });
    M.look(-8, -66, ['The aquarium is dark. For once, everything is on the outside.'], { r: 4 });
    M.look(17, 13.6, ['Your house. Through the window you can see yourself, asleep.'], { r: 2 });
    // the boy: always a little farther away
    const path = [[6, 24], [-1, 40], [-12, 46], [-22, 40], [-30, 45]];
    const evan = M.ent({ type: 'char', set: 'evan', x: path[0][0], z: path[0][1], face: 0, i: 0, gone: false, t: 0, update(e, dt) {
      const p = World.player; if (!p || e.gone) return;
      e.t += dt;
      e.face = Math.atan2(e.x - p.x, -(e.z - p.z));
      const d = Math.hypot(p.x - e.x, p.z - e.z);
      if (d < 8) {
        if (e.i < path.length - 1) { e.i++; e.x = path[e.i][0]; e.z = path[e.i][1]; Sound.sfx('bubble', { vol: 0.6 }); }
        else if (d < 5) { e.gone = true; Sound.sfx('bubble', { vol: 0.8 }); Game.st.dreamFlags.evanGone = true; }
      }
    } });
    evan.cond = () => !evan.gone;
    M.billboard('dc_shovel', -30.6, 49.4, 0.35, 0.55, { y: 0.1 });
    M.inter(-31, 51.4, { r: 2.4, y: 1, tag: 'wake', use: async (S) => {
      await S.say(null, 'Someone has been digging in the sandbox. There\'s a little red shovel.');
      await S.say(null, 'Whatever is buried here, it isn\'t ready yet.');
      await Dreams.next(S, 'dream5b', ['The water gets very heavy, and then very light, and then it\'s gone.']);
    } });
    M.spawn('start', 17, 20.8, 's');
  },
};

// ============================================================ 6. home movie
MAPS.dream6 = {
  name: 'HOME MOVIE', dream: 6,
  env: () => dreamEnv({ fog: '#2a2018', fogNear: 10, fogFar: 30, ambient: [1.05, 0.92, 0.78], clear: '#100c08', sat: 1.15, grade: [1.05, 0.98, 0.9], wobble: 0.028 }),
  cam: { mode: 'follow', yaw: 0, pitch: 46, dist: 7.5, fov: 56, lookY: 0.8, ahead: 0.6 },
  music: () => 'home', amb: () => ['tape', 'room'],
  onEnter: (S) => {
    Dreams.enter(S, 6, { detune: 40, drift: -35, tempo: 0.9 });
    const loop = (S.st.dreamFlags && S.st.dreamFlags.loop) || 0;
    const says = [['WALTER: Say cheese, bud! Ruthie, get in the shot.'], ['WALTER: Everybody sing!'], ['WALTER: Ruth? Where\'d he go?'], ['WALTER: ...Is this thing still on?']][loop];
    (async () => { for (const l of says) { await S.wait(1.2); UI.subtitle = l; await S.wait(2.8); if (UI.subtitle === l) UI.subtitle = null; } })();
  },
  build(M, st) {
    const fl = st.dreamFlags || (st.dreamFlags = {}), loop = fl.loop || 0;
    // living room (south), dining room (north), kitchen (east), hall (west)
    M.room(-6, -2, 6, 8, 3, { floor: 'carpet_beige', wall: 'wood', trim: 'wood_dark', gaps: [{ side: 'n', at: 0, w: 2.2 }, { side: 'w', at: 3, w: 1.6 }] });
    M.room(-6, -14, 6, -2, 3, { floor: 'wood_floor', wall: 'wallpaper_floral', trim: 'wood_dark', gaps: [{ side: 's', at: 0, w: 2.2 }, { side: 'e', at: -8, w: 1.8 }] });
    M.room(6, -14, 14, -4, 3, { floor: 'lino_green', wall: 'wall_cream', trim: 'wood_dark', gaps: [{ side: 'w', at: -8, w: 1.8 }] });
    M.room(-14, -14, -6, 8, 3, { floor: 'carpet_red', wall: 'wallpaper_green', trim: 'wood_dark', gaps: [{ side: 'e', at: 3, w: 1.6 }] });
    // the party
    for (const x of [-4, 0, 4]) M.decal('dc_streamer', x, 2.5, -14, 4, 0.5, 's', { off: 0.03 });
    M.decal('dc_banner', 0, 1.9, -14, 5, 0.6, 's', { off: 0.03 });
    for (const [i, c] of ['r', 'b', 'y', 'g', 'r', 'y'].entries()) M.billboard('dc_balloon_' + c, -5 + (i % 3) * 0.6 + (i > 2 ? 9 : 0), -12.8 + (i % 2) * 0.4, 0.4, 0.9, { y: 1.6 });
    M.table(0, -8, 3.4, 1.6, 0.74, 'wood_dark');
    if (loop < 2) M.floorDecal(loop === 1 ? 'dc_cake11' : 'dc_cake10', 0, -8, 0.8, 0.8, { y: 0.76 });
    for (const x of [-1.2, 1.2]) M.floorDecal('dc_plate', x, -7.6, 0.5, 0.35, { y: 0.76 });
    M.chair(0, -6.8, 'n', 'plastic_blue'); M.chair(-2.2, -8, 'e', 'plastic_red'); M.chair(2.2, -8, 'w', 'plastic_yellow');
    dlook(M, 0, -6.4, loop === 0 ? ['HAPPY 10TH EVAN. Ten candles.'] : loop === 1 ? ['Eleven candles. There were ten a minute ago.'] : ['There isn\'t a cake. There are candles, lit, standing up by themselves.'], { r: 1.2 });
    if (loop < 2) dchar(M, 'evan', 0, -7.0, 'n', null, ['The birthday boy. He won\'t turn around.', 'It\'s his birthday. He doesn\'t have to.'], { y: 0.2, r: 1.1 });
    if (loop < 3) dchar(M, 'ruth', loop === 2 ? 0 : 2.4, loop === 2 ? -13.2 : -9.2, loop === 2 ? 'n' : 'w', 'ruth', loop === 0 ? [['Walt, you\'re going to use up the whole tape.'], ['Go on, honey. Make a wish. Don\'t tell anybody what it is.']] : loop === 1 ? [['Where\'s Toby? He was just here.'], ['Walt? Turn that off for a minute.']] : [['She\'s facing the wall. She doesn\'t answer.']], { r: 1.4 });
    if (loop === 0) dchar(M, 'toby', -2.4, -9.2, 'e', 'toby', [['I got him a walkie-talkie. Don\'t tell.'], ['We\'re gonna do a radio show. Every night. Channel 12.']], { r: 1.4 });
    // the presents
    for (const [i, c] of ['plastic_red', 'plastic_blue', 'plastic_green'].entries()) M.box(-4.8 + i * 0.7, 0, -12.8, 0.6, 0.45 + (i % 2) * 0.2, 0.6, { top: 'plastic_yellow', sides: c }, { solid: i === 1 });
    dlook(M, -4.1, -11.6, loop < 1 ? ['A present wrapped in fish paper. The tag says: TO EVAN — LOVE, MOM & DAD.'] : ['The presents are opened. The paper is folded up very neatly. Somebody saved it.'], { r: 1.3 });
    // living room
    M.couch(-3, 6.4, 2.4, 'n', 'fabric_brown'); M.tvStand(3.6, 7.3, 'n', loop >= 3 ? 'tv_you' : 'tv_static');
    dlook(M, 3.6, 6.2, loop >= 3 ? ['The TV shows a child in a diving helmet, from above.', 'You look up. There\'s only the ceiling.'] : ['Static. Somewhere under it, the music from a game.'], { r: 1.2 });
    M.decal('ph_family', -5.98, 1.6, 2, 0.8, 0.6, 'e');
    if (loop === 0) dchar(M, 'mae', -3, 5.6, 's', 'mae', [['Ten already! Where does the time go.'], ['Walter, get one of me with the birthday boy.']], { y: 0.25, r: 1.4 });
    if (loop === 1) dchar(M, 'mae', -5.2, 3.5, 'w', null, ['Mae is standing with her face in the corner.', 'She\'s laughing at something, very quietly.'], { r: 1.4 });
    if (loop >= 3) M.decal('dc_shadow', 1.5, 0, -1.98, 1.2, 3.0, 'n', { off: 0.02, blend: true });
    if (loop >= 3) dlook(M, 1.5, -0.9, ['A shadow on the wall. A tall man, holding something up to his face.', 'Nobody is standing where the shadow comes from.'], { r: 1.4 });
    // kitchen
    M.fridge(13.2, -12.8, 'w'); M.stove(13.3, -10.4, 'w'); M.sink(13.3, -8.4, 'w');
    M.decal('dc_cal', 6.02, 1.4, -10, 0.7, 0.85, 'e');
    dlook(M, 7, -10, ['A calendar. AUGUST.', 'The 12th is circled in red marker. Somebody wrote E\'s B-DAY!! next to it, in a kid\'s handwriting.'], { r: 1.2 });
    dlook(M, 12.2, -6, 'A coffee mug on the counter: WORLD\'S OKAYEST DAD. The coffee is still warm.', { r: 1.2 });
    // the hall, and the basement door
    M.decal('door_old', -13.98, 0, -8, 1.3, 2.3, 'e');
    M.floorDecal('dc_lightstrip', -13.6, -8, 1.2, 0.2, { y: 0.02, blend: true });
    dlook(M, -12.8, -8, [['The basement door. There\'s light under it.', 'The camera doesn\'t go down there.'], ['The camera doesn\'t go down there.']], { r: 1.4 });
    for (const [x, z] of [[0, 3], [0, -8], [10, -9], [-10, -3]]) M.light(x, 2.8, z, 8, '#ffe0b0', 0.55);
    // walking into the dining room skips the tape
    M.trigger(-1.1, -3.0, 1.1, -1.4, async (S) => {
      const fl2 = S.st.dreamFlags;
      S.sfx('tapeclick'); R.settings.wobble = 0.3; UI.subtitle = null;
      await S.fade(1, 0.15); await S.wait(0.35);
      fl2.loop = (fl2.loop || 0) + 1;
      if (fl2.loop > 3) { R.settings.wobble = 0; await Story.dreamWake(S, ['The tape gets eaten. It makes a sound like somebody chewing.']); return; }
      Game.enterMap('dream6', 'start');
      await S.fade(0, 0.4);
    }, { id: 'skip' });
    M.spawn('start', 0, 5.6, 'n');
  },
};

// ============================================================ 7. downstairs
MAPS.dream7 = {
  name: 'DOWNSTAIRS', dream: 7,
  env: () => dreamEnv({ fog: '#060608', fogNear: 3, fogFar: 17, ambient: [0.4, 0.37, 0.4], clear: '#030304', sat: 0.7, wobble: 0.02 }),
  cam: { mode: 'follow', yaw: 0, pitch: 48, dist: 7, fov: 56, lookY: 0.6, ahead: 0.6 },
  music: () => null, amb: () => ['deep'],
  onEnter: (S) => Dreams.enter(S, 7),
  build(M, st) {
    // five landings, each one further down; the stairs at the top of each room lead to the next
    const L = [
      { floor: 'lino_checker', wall: 'wall_cream', k: 0.7, deco: (x) => { M.fridge(x + 3.2, -3.4, 's'); M.stove(x + 1.8, -3.6, 's'); M.cabinets(x - 2.5, -3.6, 2.4, 's'); dlook(M, x + 3.2, -2.4, 'Your fridge. The milk is in it.', { r: 1 }); } },
      { floor: 'lino_green', wall: 'wall_yellow', k: 0.55, deco: (x) => { M.stove(x - 2, -3.6, 's'); M.billboard('dc_steam', x - 2, -3.4, 0.5, 0.8, { y: 1.1 }); M.table(x + 2, 0, 1.4, 1.0, 0.74, 'wood_light'); dlook(M, x - 2, -2.4, ['A pot on the stove, simmering. It smells like the staff kitchen at the aquarium.', 'You don\'t look in the pot.'], { r: 1.2 }); } },
      { floor: 'lino_checker', wall: 'wall_white', k: 0.45, deco: (x) => { M.box(x, 0, -1, 1.6, 0.8, 1.4, { top: 'wood_light', sides: 'metal' }, { solid: true }); M.floorDecal('dc_plate', x - 0.3, -1, 0.7, 0.45, { y: 0.81 }); M.floorDecal('dc_plate', x + 0.4, -1, 0.7, 0.45, { y: 0.81 }); M.billboard('dc_bell', x + 0.6, -0.6, 0.18, 0.18, { y: 0.82 }); dlook(M, x, 0.2, ['The booth from the diner. Both plates are clean.', 'Next to one, a little bell.'], { r: 1.4 }); } },
      { floor: 'carpet_blue', wall: 'wallpaper_evan', k: 0.35, deco: (x) => { M.bed(x - 2.6, -1.5, 'e'); M.box(x - 2.6, 0.55, -1.5, 1.2, 0.3, 1.6, 'fabric_blue', { solid: false }); dlook(M, x - 1.4, -1.5, ['Evan\'s bed. The blanket is pulled all the way up over something.', 'You don\'t pull it down.'], { r: 1.4 }); } },
      { floor: 'concrete_dark', wall: 'concrete_dark', k: 0.25, deco: (x) => {
        M.decal('door_metal', x, 0, -4, 1.4, 2.4, 's', { off: 0.02 });
        M.floorDecal('dc_lightstrip', x, -3.8, 1.3, 0.25, { y: 0.02, blend: true });
        M.inter(x, -3.0, { r: 1.5, y: 1.2, tag: 'wake', use: async (S) => {
          await S.say(null, 'You put your hand on the door. It\'s warm.');
          await S.say(null, 'The digging stops.');
          await S.wait(1.2);
          await S.say('walter_voice', 'Go back to bed.');
          S.sfx('thud', { vol: 0.9 });
          await Story.dreamWake(S, []);
        } });
      } },
    ];
    L.forEach((l, i) => {
      const x = i * 40;
      M.room(x - 4, -4, x + 4, 4, 3, { floor: l.floor, wall: l.wall, trim: 'wood_dark', gaps: i < 4 ? [{ side: 'n', at: x, w: 1.6 }] : [] });
      M.light(x, 2.6, 0, 7, '#ffe0b0', l.k);
      l.deco(x);
      if (i < 4) {
        // the stairs down, through a gap in the north wall
        M.floor(x - 0.8, -9, x + 0.8, -4, 'black', { y: -3.2, surface: false });
        M.stairsDown(x, -4.1, 's', 1.5, 10);
        M.wall(x - 0.8, -8, x - 0.8, -4, 3, l.wall, { face: 'e', solid: true }); M.wall(x + 0.8, -8, x + 0.8, -4, 3, l.wall, { face: 'w', solid: true });
        M.trigger(x - 0.8, -6.5, x + 0.8, -4.6, async (S) => {
          await S.fade(1, 0.6); S.sfx('step', { vol: 0.5 }); await S.wait(0.4); S.sfx('step', { vol: 0.4 }); await S.wait(0.4);
          const fl = S.st.dreamFlags; fl.landing = i + 1;
          World.player.x = (i + 1) * 40; World.player.z = 2.8; World.player.face = 0;
          await S.fade(0, 0.8);
          if (i + 1 === 4) await S.say(null, 'The stairs end. The digging is right on the other side of the wall now.');
        }, { id: 'down' + i, once: false });
      }
      M.cam(x - 5, -9, x + 5, 5, { mode: 'follow', yaw: 0, pitch: 48, dist: 7, fov: 56, lookY: 0.6, ahead: 0.6, clamp: [x - 3.4, -3.4, x + 3.4, 3.4] });
      if (i) M.spawn('landing' + i, x, 2.8, 'n');
    });
    M.spawn('start', 0, 2.6, 'n');
  },
};

// ============================================================ 2b. the pink sea
MAPS.dream2b = {
  name: 'THE PINK SEA', dream: 2,
  walkable: [[-3, -2, 3, 8], [-1.6, -21, 1.6, -1], [-13, -24.5, 1.6, -19.5], [-13, -45.5, -8.4, -23.5], [-13, -48.5, 11, -43.5], [6.4, -71, 11, -47.5], [-1, -82, 17, -69]],
  env: () => dreamEnv({ fog: '#ffc8e4', fogNear: 26, fogFar: 70, sky: ['#fff8c0', '#ffe030', 0.55], ambient: [1.15, 1.05, 1.1], clear: null, sat: 1.35, wobble: 0.02, grade: [1.08, 1.0, 1.02] }),
  cam: { mode: 'follow', yaw: 0, pitch: 40, dist: 10, fov: 58, lookY: 1.0, ahead: 1.5 },
  music: () => 'evening', amb: () => ['river'],
  onEnter: (S) => Dreams.enter(S, 2, { tempo: 0.72, detune: 55, octave: 1 }),
  build(M, st) {
    M.plane('rock_white', [-120, 0, 60], [1, 0, 0], [0, 0, -1], 240, 200, { lit: false, scroll: [0.03, 0.015], tile: 5, sub: 20, color: '#ff5ab4' });
    for (const r of MAPS.dream2b.walkable) { M.floor(r[0], r[1], r[2], r[3], 'sand', { y: 0.12, tile: 3, color: '#fffaf4', lit: false }); M.box((r[0] + r[2]) / 2, -0.6, (r[1] + r[3]) / 2, r[2] - r[0] + 0.3, 0.72, r[3] - r[1] + 0.3, { sides: 'sand', top: false }, { solid: false, color: '#f4d8e8' }); }
    // fish swimming in the yellow sky
    for (let i = 0; i < 8; i++) M.ent({ type: 'sprite', region: 'fish' + (i % 6) + '_0', x: -30 + i * 9, y: 8 + (i % 3) * 3, z: -20 - i * 7, w: 4, h: 2.6, sp: 1.5 + (i % 3) * 0.5, update(e, dt) { e.x += e.sp * dt; if (e.x > 50) e.x = -50; } });
    // bottles along the path
    const bottles = [[0, -8, 'THE WATER IS WARM.'], [-8, -22, 'COME BACK.'], [-11, -36, 'I\'M STILL DOWN HERE.'], [4, -46, 'IT\'S NICE HERE. NOBODY YELLS.'], [9, -60, 'PLEASE DON\'T TELL DAD.']];
    for (const [x, z, msg] of bottles) { M.billboard('dc_bottle', x + 1, z, 0.4, 0.7, { y: 0.12 }); dlook(M, x + 1, z + 0.6, [['A bottle, washed up on the path. There\'s a note in it.', 'In a kid\'s handwriting: ' + msg], ['The note says: ' + msg]], { r: 1.2 }); }
    // a lifeguard chair with a penguin in it
    M.box(-12, 0, -30, 0.2, 2.4, 0.2, 'wood', { solid: false }); M.box(-10.8, 0, -30, 0.2, 2.4, 0.2, 'wood', { solid: false }); M.box(-11.4, 2.4, -30, 1.4, 0.2, 1.0, 'wood', { solid: false });
    M.solid(-12.2, -30.5, -10.6, -29.5);
    M.ent({ type: 'penguin', x: -11.4, z: -30, y: 2.6, face: Math.PI, t: 0, wait: 1e9, area: [0, 0, 0, 0], target: null });
    dlook(M, -10.2, -28.8, [['The penguin is the lifeguard.', 'It isn\'t watching the sea. It\'s watching you.'], ['The penguin blows a whistle. No sound comes out.']], { r: 1.5 });
    // a door, standing by itself
    M.cutout('flat_door', 0, -46, 1.2, 2.2, 's', { y: 0.12 }); M.solid(-0.7, -46.2, 0.7, -45.8);
    dlook(M, 0, -45.2, [['A door, standing by itself on the sand.', 'You open it. On the other side: the same beach, but a little pinker.', 'You close it again.'], ['You don\'t open it again. It was too pink.']], { r: 1.2 });
    // the lighthouse is a milk carton
    const lx = 8, lz = -77;
    M.box(lx, 0.1, lz, 3.6, 7, 3.6, { top: 'plastic_white', sides: 'plastic_white' }, { solid: true });
    M.decal('cu_milk', lx, 1.2, lz + 1.8, 3.4, 2.55, 's', { off: 0.03 });
    M.tri('plastic_white', [lx - 1.8, 7.1, lz + 1.8], [lx + 1.8, 7.1, lz + 1.8], [lx, 9.4, lz], [[0, 1], [1, 1], [0.5, 0]]);
    M.ent({ type: 'sprite', region: 'sparkle', x: lx, y: 9.6, z: lz, w: 1.2, h: 1.2, t: 0, update(e, dt) { e.t += dt; e.w = e.h = 1.0 + Math.abs(Math.sin(e.t * 1.5)) * 0.8; } });
    M.light(lx, 6, lz + 3, 10, '#ffffff', 0.8);
    M.inter(lx, lz + 2.8, { r: 2.2, y: 2, tag: 'wake', use: async (S) => {
      await S.say(null, 'The lighthouse is a milk carton. On the side: HAVE YOU SEEN ME?');
      await S.say(null, 'The light at the top turns slowly, and stops, pointed at you.');
      await Story.dreamWake(S, ['It\'s very bright.']);
    } });
    M.spawn('start', 0, 5, 'n');
  },
};

// ============================================================ 3b. the green hour
const GH = [[-4, -4, 4, 4], [-4, -18, 4, -10], [-18, -18, -10, -10], [-18, -34, -10, -26], [-4, -34, 4, -26], [10, -34, 18, -26], [10, -50, 18, -42], [-4, -50, 4, -42]];
const GH_BRIDGES = [[-1, -10.5, 1, -3.5], [-10.5, -15, -3.5, -13], [-15, -26.5, -13, -17.5], [-10.5, -31, -3.5, -29], [3.5, -31, 10.5, -29], [13, -42.5, 15, -33.5], [3.5, -47, 10.5, -45]];
MAPS.dream3b = {
  name: 'THE GREEN HOUR', dream: 3,
  walkable: GH.concat(GH_BRIDGES),
  env: () => dreamEnv({ fog: '#40ff70', fogNear: 16, fogFar: 60, sky: ['#40ff70', '#ff7a1a', 0.5], ambient: [1.0, 0.9, 1.1], clear: null, sat: 1.4, wobble: 0.025 }),
  cam: { mode: 'follow', yaw: 0, pitch: 46, dist: 10, fov: 58, lookY: 0.8, ahead: 1.2 },
  music: () => 'school', amb: () => ['buzz'],
  onEnter: (S) => Dreams.enter(S, 3, { tempo: 1.25, detune: 70, drift: 40, octave: 1 }),
  build(M, st) {
    // purple checkerboard islands hanging in green nothing
    for (const r of GH) { M.floor(r[0], r[1], r[2], r[3], 'lino_checker', { tile: 2, color: '#d070ff' }); M.box((r[0] + r[2]) / 2, -1.6, (r[1] + r[3]) / 2, r[2] - r[0], 1.6, r[3] - r[1], { sides: 'plastic_pink', top: false }, { solid: false, color: '#9a40d0' }); }
    for (const r of GH_BRIDGES) M.floor(r[0], r[1], r[2], r[3], 'plastic_yellow', { y: 0.02, tile: 1 });
    M.plane('dev_grid', [-120, -14, 80], [1, 0, 0], [0, 0, -1], 240, 240, { lit: false, tile: 8, sub: 20, color: '#20c050' });
    // clocks on poles, all saying the same thing
    const clocks = [[3, 3], [-16, -12], [-12, -32], [16, -28], [12, -48]];
    for (const [x, z] of clocks) { M.cyl(x, 0, z, 0.08, 2.2, 'metal', { sides: 4, solid: false }); M.billboard('dc_clock2', x, z, 0.9, 0.9, { y: 2.2 }); M.solidCircle(x, z, 0.2); }
    dlook(M, 3, 3.9, [['A clock on a pole. It\'s two o\'clock.'], ['Still two o\'clock.'], ['BACK AT 2.']], { r: 1.3 });
    dlook(M, 16, -27.1, ['This clock says two o\'clock too. All of them do. It has been two o\'clock for a very long time.'], { r: 1.3 });
    // televisions on poles
    for (const [x, z, scr] of [[-15, -30, 'tv_static'], [15, -46, 'tv_title'], [-1.5, -45, 'tv_static']]) { M.box(x, 1.2, z, 1.2, 1.0, 0.9, 'metal', { solid: false }); M.decal(scr, x, 1.3, z + 0.46, 0.9, 0.7, 's', { off: 0.01, lit: false }); M.cyl(x, 0, z, 0.08, 1.2, 'metal', { sides: 4, solid: true }); }
    dlook(M, -15, -29, [['A TV on a pole. Static.', 'Under the static, a man is saying ORDER UP, over and over, very quietly.']], { r: 1.3 });
    // the booth from the diner, floating on its own island
    M.box(-14, 0, -14, 1.6, 0.8, 1.4, { top: 'wood_light', sides: 'metal' }, { solid: true });
    M.box(-14, 0, -15.3, 1.4, 1.1, 0.6, 'fabric_red', { solid: true }); M.box(-14, 0, -12.7, 1.4, 1.1, 0.6, 'fabric_red', { solid: true });
    M.floorDecal('dc_plate', -14.3, -14, 0.7, 0.45, { y: 0.81 });
    dlook(M, -12.6, -14, ['The booth from the diner. Walter\'s reading glasses are on the table, folded.', 'The other plate has been licked clean.'], { r: 1.4 });
    // someone standing on the far island, facing away
    M.billboard('dc_coat', 0, -30, 0.8, 2.0, { solid: false });
    dlook(M, 0, -29, [['From far away, it looked like a man standing with his back to you.', 'It\'s a coat on a coat rack. The coat is still warm.']], { r: 1.4 });
    // the phone booth
    const bx = 0, bz = -47;
    M.box(bx, 0, bz, 1.4, 2.6, 1.4, { top: 'plastic_red', sides: 'glass' }, { solid: true });
    M.box(bx, 2.6, bz, 1.5, 0.3, 1.5, 'plastic_red', { solid: false });
    M.cutout('flat_phone', bx, bz + 0.5, 0.5, 0.4, 's', { y: 1.2 });
    st.dreamFlags = st.dreamFlags || {};
    M.inter(bx, bz + 1.5, { r: 1.8, y: 1.4, tag: 'wake', use: async (S) => {
      await S.say(null, 'You pick up the phone in the booth.');
      await S.say(null, 'It\'s you. You\'re calling from the other phone. You don\'t know what to say to yourself.');
      await S.say(null, 'You both hang up at the same time.');
      await Story.dreamWake(S, []);
    } });
    M.ent({ type: 'sprite', region: 'sparkle', x: bx, y: 2.9, z: bz, w: 0.5, h: 0.5 });
    M.spawn('start', 0, 2, 'n');
  },
};

// ============================================================ 5b. the red field
MAPS.dream5b = {
  name: 'THE RED FIELD', dream: 5,
  bounds: [-34, -72, 34, 10],
  env: () => dreamEnv({ fog: '#300008', fogNear: 10, fogFar: 46, sky: ['#000000', '#5a000c', 0.45], ambient: [1.1, 0.55, 0.55], clear: null, sat: 1.1, wobble: 0.02 }),
  cam: { mode: 'follow', yaw: 0, pitch: 34, dist: 10, fov: 58, lookY: 1.2, ahead: 2.0 },
  music: () => 'dream5', amb: () => ['wind'],
  onEnter: (S) => Dreams.enter(S, 5, { tempo: 0.55, detune: 30, octave: -1 }),
  build(M, st) {
    M.floor(-80, -120, 80, 40, 'grass', { tile: 4, color: '#e02020' });
    // black trees, flat as paper
    const r = makeRng(1991);
    for (let i = 0; i < 70; i++) { const x = -34 + r() * 68, z = -72 + r() * 80; if (Math.abs(x) < 4 && z > -64) continue; M.billboard(r() < 0.5 ? 'tree_pine' : 'tree_round', x, z, 2.2, 3.6, { col: [0.02, 0.0, 0.02, 1], solidR: 0.4 }); }
    // a path of white stones to the house
    for (let z = 4; z > -58; z -= 2.4) M.floorDecal('dc_stone', (Math.sin(z * 0.3) * 1.2), z, 0.9, 0.55, { y: 0.02 });
    // the blue moon
    M.ent({ type: 'sprite', region: 'dc_moon', x: 10, y: 22, z: -110, w: 12, h: 12 });
    // a swing hanging from nothing
    M.box(-9, 2.6, -22, 1.2, 0.1, 0.4, 'wood', { solid: false });
    for (const dx of [-0.5, 0.5]) M.box(-9 + dx, 2.7, -22, 0.03, 8, 0.03, 'metal', { solid: false });
    dlook(M, -9, -21, [['A swing, hanging from nothing. The chains go up out of sight.', 'It\'s swinging a little. There\'s no wind.']], { r: 1.6 });
    // a mailbox by itself
    M.mailbox(4, -30, 's', 'mailbox_vane');
    dlook(M, 4, -29.2, [['A mailbox that says VANE. There\'s a letter inside, addressed to you.', 'The envelope is empty. It has been opened very carefully.']], { r: 1.2 });
    // a pile of blue shells
    for (let i = 0; i < 9; i++) M.billboard('icon_shell', -5 + (i % 3) * 0.4, -44 + Math.floor(i / 3) * 0.35, 0.4, 0.4, { y: 0.02 + Math.floor(i / 3) * 0.1 });
    dlook(M, -4.6, -42.8, 'A pile of blue shells. Somebody has been collecting them. Somebody always is.', { r: 1.2 });
    // the white house
    houseExt(M, -7, -66, 7, -56, { st: { tod: 'night', day: 5, flags: {} }, siding: 'siding_white', roof: 'roof_flat', lit: true, door: false });
    M.decal('door_wood', 0, 0, -56, 1.4, 2.4, 's', { off: 0.03 });
    M.box(0, 0, -54.6, 1.3, 0.8, 0.9, { top: '@icon_backpack', sides: 'fabric_blue' }, { fit: { top: true }, solid: true });
    M.light(0, 3, -53, 8, '#ffffff', 0.9);
    M.inter(0, -53.2, { r: 2, y: 1, tag: 'wake', use: async (S) => {
      await S.say(null, 'A blue backpack, left on the porch, the way you leave something for someone to find.');
      await S.say(null, 'It\'s very clean. Somebody has been taking care of it.');
      await S.say(null, 'The front door opens by itself. Inside, it\'s all white.');
      await Story.dreamWake(S, ['You go in.']);
    } });
    M.spawn('start', 0, 6, 'n');
  },
};
