'use strict';
// ---------------------------------------------------------------------------
// TownMap — the MAP tab. A folded visitor's map of Bellwood, the kind the
// aquarium gift shop sells for a quarter. It is painted from the real street
// layout (1 pixel = 1 world unit) and it changes a little each day, like
// everything else. Up/down picks a place; the side panel says what it is.
// ---------------------------------------------------------------------------

const TownMap = (() => {
  // paper sheet + printed area on the 320x240 UI canvas
  const PX = 5, PY = 25, PW = 167, PH = 208;
  const VX = 9, VY = 29, VW = 160, VH = 200;
  const WX0 = -80, WZ0 = -116; // world point at the printed area's top-left
  const mx = (x) => Math.round(x - WX0), mz = (z) => Math.round(z - WZ0);
  // side panel
  const SX = 176, SY = 25, SW = 138, SH = 208, SC = SX + SW / 2;

  const INK = '#3a3040';
  const ROAD = '#8e8a86', SIDE = '#dcd6c8', CONC = '#cfc9bb', GRASS = '#a8cc84', WATER = '#7eb6d8';
  const TAG = {
    open: { txt: 'OPEN', bg: '#2e6a3e', fg: '#dcf4d8' },
    closed: { txt: 'CLOSED', bg: '#7a2a2a', fg: '#f8dcd8' },
  };
  const tag = (txt, bg, fg) => ({ txt, bg: bg || '#4a4a5a', fg: fg || '#e8e8f0' });
  const shut = (st) => st.tod === 'night' || st.day >= 8;

  // ---------------------------------------------------------------- places
  // rect is in world units [x0, z0, x1, z1]; maps are the interiors that count as "inside"
  const house = (siding, roof, o) => Object.assign({ kind: 'house', siding, roof }, o || {});
  const PLACES = [
    {
      id: 'aquarium', rect: [-30, -88, 14, -68], maps: ['aquarium', 'basement'],
      name: (st) => st.flags.aquariumGone ? 'EMPTY LOT' : 'BELLWOOD AQUARIUM',
      sign: (st) => st.flags.aquariumGone ? null : st.day >= 8 ? 'aq_sign_old' : 'aq_sign',
      pict: () => ({ kind: 'fence' }),
      status: (st) => st.flags.aquariumGone ? null : Story.aquariumLocked(st) ? TAG.closed : TAG.open,
      blurb: (st) => st.flags.aquariumGone ? 'Weeds, a fence, and a rectangle of pale concrete. There was never anything here.'
        : st.day >= 8 ? 'NOW OPEN: TANK 6!'
          : st.day === 7 ? 'CLOSED UNTIL FURTHER NOTICE.'
            : st.day >= 4 ? 'Your summer job. Employees use the front entrance.'
              : 'Home of Tank the octopus and Penguin Point! Open 9 AM to 5 PM.',
    },
    {
      id: 'pier', rect: [43, -110, 49, -86], maps: [],
      name: () => 'THE PIER', pict: () => ({ kind: 'pier' }),
      blurb: (st) => st.day >= 8 ? 'Nobody fishes here anymore.'
        : st.day >= 4 ? 'The gulls sit on the rail and watch you eat.'
          : 'Good for fishing and watching boats. Blue shells wash up on the beach.',
    },
    {
      id: 'church', rect: [-76, -46, -58, -26], maps: ['church'], cond: (st) => st.day < 8,
      name: () => 'COMMUNITY CHURCH', sign: () => 'sign_church',
      status: (st) => shut(st) ? TAG.closed : TAG.open,
      blurb: (st) => st.day >= 4 ? 'Sunday service at 10 AM. The candles by the memorial board are always lit.' : 'Sunday service at 10 AM. All welcome.',
    },
    {
      id: 'lot', rect: [-76, -46, -58, -26], maps: [], cond: (st) => st.day >= 8,
      name: () => 'EMPTY LOT', pict: () => ({ kind: 'lot' }),
      blurb: () => 'Dirt and a dead tree. The map says there should be a church here.',
    },
    {
      id: 'market', rect: [-52, -44, -36, -26], maps: ['market'],
      name: () => 'BELLWOOD MARKET', sign: () => 'sign_market',
      status: (st) => shut(st) ? TAG.closed : TAG.open,
      blurb: (st) => st.day >= 8 ? 'The lights are on, but nobody is inside.' : 'Milk, bread, a deli counter and a bulletin board. Open 7 AM to 8 PM.',
    },
    {
      id: 'diner', rect: [-30, -42, -14, -26], maps: ['diner'],
      name: () => "HAL'S DINER", sign: () => 'sign_hals',
      status: (st) => st.tod === 'night' && st.day < 8 ? TAG.closed : TAG.open,
      blurb: (st) => st.day >= 8 ? 'The jukebox is playing. Nobody put a quarter in.' : 'Tuna melts, pie, and a jukebox that only takes quarters.',
    },
    {
      id: 'laundry', rect: [10, -40, 22, -26], maps: ['laundry'],
      name: () => 'SUDS LAUNDROMAT', sign: () => 'sign_suds',
      status: (st) => shut(st) ? TAG.closed : TAG.open,
      blurb: (st) => st.day >= 8 ? 'One dryer is still turning.' : 'Coin laundry. There is a lost & found box by the door.',
    },
    {
      id: 'rosas', rect: [26, -40, 38, -26], maps: [],
      name: () => "ROSA'S", sign: () => 'sign_rosas',
      status: () => tag('BACK AT 2'),
      blurb: (st) => st.day >= 8 ? 'It has been two o\'clock for a very long time.'
        : st.day >= 5 ? 'BACK AT 2. The chairs are stacked. There is dust on the menus.' : 'A note in the window says BACK AT 2.',
    },
    {
      id: 'gas', rect: [47, -48, 74, -26], maps: ['gas'],
      name: () => "GUS'S GAS", sign: () => 'sign_gus',
      status: (st) => shut(st) ? TAG.closed : TAG.open,
      blurb: (st) => st.day >= 8 ? 'There is a newspaper on the counter. It looks new.' : 'Gas, snacks and repairs. The soda machine eats dollars.',
    },
    {
      id: 'pruitt', rect: [-76, -6, -62, 12], maps: [],
      name: () => 'THE PRUITTS', pict: () => house('#9cc48a', '#8a5a3a'),
      blurb: (st) => st.day >= 8 ? 'You knock. The door swings open onto a wall.' : "Dana's house. Her bike is usually on the lawn.",
    },
    {
      id: 'kessler', rect: [-54, -6, -40, 12], maps: ['kessler'],
      name: () => '9 MAPLE ST', pict: () => house('#b8b090', '#6a6258', { dead: true }),
      status: () => tag('VACANT'),
      blurb: (st) => st.day >= 7 ? 'Boarded up. A boy named Toby lived here once.' : 'Boarded up. Nobody has lived here for years.',
    },
    {
      id: 'miller', rect: [-32, -6, -18, 12], maps: ['miller'],
      name: () => 'MRS. MILLER', pict: (st) => st.day >= 8 ? house('#a8a094', '#6a6258', { dead: true }) : house('#e8a8b0', '#b04a3a'),
      blurb: (st) => st.day >= 8 ? 'Boarded over. It has been for years.'
        : st.day >= 4 ? 'Her cat, Marmalade, is missing. There are posters on the lamp posts.' : '14 Maple St. Mrs. Miller knows everyone on the street.',
    },
    {
      id: 'home', rect: [10, -6, 24, 12], maps: ['house', 'evanroom'],
      name: (st) => st.day >= 8 ? "EVAN'S HOUSE" : 'HOME', pict: () => house('#8ab0d8', '#6a7078', { home: true }),
      blurb: (st) => st.day >= 8 ? '12 Maple St. It was never yours.'
        : st.day === 7 ? '12 Maple St. The Vanes lived here before you did.'
          : st.day >= 4 ? "12 Maple St. There is a door in the hall you don't have a key for."
            : st.day >= 2 ? '12 Maple St. Your house.' : "12 Maple St. Your new house! The boxes won't unpack themselves.",
    },
    {
      id: 'vane', rect: [25, -14, 31, 18], maps: [], cond: (st) => st.day >= 8,
      name: () => 'VANE WAY', sign: () => 'st_new',
      blurb: () => 'There was never a road here.',
    },
    {
      id: 'delgado', rect: [32, -6, 46, 12], maps: [],
      name: () => 'THE DELGADOS', pict: () => house('#ecebe4', '#4a7a4a'),
      blurb: (st) => st.day >= 8 ? 'You knock. The door swings open onto a wall.'
        : st.day >= 5 ? "They have a dog. The front door isn't where it was." : 'They have a dog. You can hear it through the door.',
    },
    {
      id: 'okafor', rect: [54, -6, 70, 12], maps: [],
      name: () => 'THE OKAFORS', pict: () => house('#e0c070', '#4a6a9a'),
      blurb: (st) => st.day >= 8 ? 'You knock. The door swings open onto a wall.' : 'Mrs. Okafor teaches at the elementary school.',
    },
    {
      id: 'pond', rect: [-62, 34, -42, 48], maps: [],
      name: () => 'DUCK POND', pict: () => ({ kind: 'pond' }),
      blurb: (st) => st.day >= 8 ? "The pond is very still. You can't see the bottom." : 'There are coins at the bottom. Make a wish.',
    },
    {
      id: 'playground', rect: [-36, 36, -14, 54], maps: [],
      name: () => 'PLAYGROUND', pict: () => ({ kind: 'playground' }),
      blurb: (st) => st.day >= 8 ? 'The merry-go-round turns by itself.'
        : st.day >= 6 ? 'Swings, a slide and a sandbox. Kids bury things in sandboxes.' : 'Swings, a slide, a merry-go-round and a sandbox.',
    },
    {
      id: 'school', rect: [12, 32, 50, 50], maps: ['school'],
      name: () => 'BELLWOOD ELEMENTARY', sign: () => 'sign_school',
      status: (st) => Story.schoolLocked(st) ? TAG.closed : TAG.open,
      blurb: (st) => st.day >= 8 ? 'Room 5. The chalkboard says something new.'
        : st.day >= 3 ? 'Mrs. Okafor is getting the classrooms ready for September.' : 'Closed for summer. SEE YOU IN SEPTEMBER!',
    },
    {
      id: 'sign', rect: [6, 69, 12, 73], maps: [],
      name: () => 'WELCOME SIGN', sign: (st) => st.day >= 8 ? 'town_sign2' : 'town_sign',
      blurb: (st) => st.day >= 8 ? 'WELCOME TO BELLWOOD. POP. 1,205.' : 'WELCOME TO BELLWOOD. POP. 1,204.',
    },
  ];
  const byId = {}; PLACES.forEach((p) => { byId[p.id] = p; });

  // where the current objective points
  const GOALS = {
    aquarium: 'aq7 back5 bulbs deliver desk6 filter inventory kitchen5 lunch4 lunch6 penguins tank4 tank6 turtles windows work visitaq sort paycheck tellwalter2 seewalter3 findwalter follow backpack',
    home: 'gohome gohome8 home1 home2 home3 home4 home5 home6 home7 sleep4 sleep5 sleep6 sleep7 sleep7a unpack fridge trash mail paper paper6 lock inside house7 hang evanroom place photo openbasement',
    market: 'milk pay', diner: 'lunch', miller: 'umbrella', school: 'brochures', playground: 'playground key',
  };
  const goalOf = {};
  for (const k in GOALS) for (const id of GOALS[k].split(' ')) goalOf[id] = k;

  const visible = (st) => PLACES.filter((p) => !p.cond || p.cond(st));
  const center = (p) => [(p.rect[0] + p.rect[2]) / 2, (p.rect[1] + p.rect[3]) / 2];
  function mode(st) { return st.map === 'whiteroom' ? 'white' : st.map === 'underneath' ? 'under' : /^dream/.test(st.map) ? 'dream' : 'town'; }
  // which place the player is in (or nearest to, outdoors)
  function herePlace(st) {
    const list = visible(st);
    if (st.map !== 'town') return list.find((p) => p.maps.includes(st.map)) || null;
    const pl = World.player; if (!pl) return null;
    let best = null, bd = 1e9;
    for (const p of list) {
      const [x0, z0, x1, z1] = p.rect;
      const dx = Math.max(x0 - pl.x, 0, pl.x - x1), dz = Math.max(z0 - pl.z, 0, pl.z - z1), d = dx * dx + dz * dz;
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  }
  function insideOf(st, p) { return p && st.map !== 'town' && p.maps.includes(st.map); }
  function playerPos(st) {
    if (st.map === 'town' && World.player) return [World.player.x, World.player.z];
    const p = visible(st).find((q) => q.maps.includes(st.map));
    return p ? center(p) : null;
  }

  // ---------------------------------------------------------------- painting helpers
  function mulPix(p, x, y, k) { const c = p.get(x, y); if (c[3]) p.set(x, y, [c[0] * k | 0, c[1] * k | 0, c[2] * k | 0, 255]); }
  function sepia(p, amt) {
    p.map((c) => {
      const g = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
      return [lerp(c[0], g * 1.08 + 12, amt), lerp(c[1], g * 0.96 + 4, amt), lerp(c[2], g * 0.74, amt), c[3]];
    });
  }
  // a wobbly hand-drawn ellipse (pen, pencil or crayon)
  function handRing(p, cx, cy, rx, ry, c, seed, o) {
    o = o || {};
    const n = Math.ceil((rx + ry) * 4), rng = makeRng(seed);
    const ph = rng() * 6.28, over = o.over || 0.35;
    for (let i = 0; i <= n * (1 + over / 6.28); i++) {
      const a = ph + (i / n) * 6.28;
      const wob = 1 + Math.sin(a * 3 + seed) * 0.06 + (i / n) * 0.05;
      const x = cx + Math.cos(a) * rx * wob, y = cy + Math.sin(a) * ry * wob;
      if (o.gaps && Math.sin(a * 7 + seed) > 0.8) continue;
      p.set(x, y, c); if (o.thick) p.set(x + 1, y, c);
    }
  }

  // ---------------------------------------------------------------- the printed map
  function paintBase(st) {
    const p = new Pix(VW, VH);
    const f = st.flags, d = st.day, mem = d >= 8, night = st.tod === 'night';
    const rng = makeRng(1204);
    const R = (x0, z0, x1, z1, c) => p.rect(mx(x0), mz(z0), mx(x1) - mx(x0), mz(z1) - mz(z0), c);
    const dots = (x0, z0, x1, z1, cols, dens) => p.speckle(rng, cols, dens, mx(x0), mz(z0), mx(x1) - mx(x0), mz(z1) - mz(z0));

    // ground
    R(-80, -116, 80, 84, GRASS); dots(-80, -92, 80, 84, ['#98bc76', '#b6d892'], 0.06);
    R(-80, -116, 80, -92, WATER);
    // beach, plaza, parking lot
    R(18, -92, 80, -64, '#f0dca0'); dots(18, -92, 80, -64, ['#dcc488', '#f8ecc0'], 0.1);
    for (let x = mx(18); x < VW; x++) { p.set(x, mz(-92), '#5a92c0'); if ((x + 1) % 3) p.set(x, mz(-92) + 1, '#fbf6e4'); }
    for (let x = 0; x < mx(18); x++) p.set(x, mz(-92), '#5a92c0');
    R(-34, -92, 18, -64, '#e2dccc');
    for (let y = mz(-92) + 2; y < mz(-64); y += 4) for (let x = mx(-34) + 2; x < mx(18); x += 4) p.set(x, y, '#d0c8b4');
    R(-80, -92, -34, -64, ROAD);
    for (let x = -74; x < -36; x += 4) for (let z = -81; z < -75; z++) p.set(mx(x), mz(z), '#e8e4dc');
    for (let x = -74; x < -36; x += 4) for (let z = -89; z < -84; z++) p.set(mx(x), mz(z), '#e8e4dc');
    // blocks
    R(-80, -52, -4, -26, CONC); R(4, -52, 80, -26, CONC); dots(-80, -52, 80, -26, ['#c4bdae', '#d8d2c6'], 0.05);
    // sidewalks, then streets over them
    for (const [z0, z1] of [[-64, -62], [-54, -52], [-26, -22], [-14, -12], [16, 18], [26, 28], [58, 60]]) R(-80, z0, 80, z1, SIDE);
    R(-6, -64, 6, 68, SIDE);
    const streets = [[-62, -54, 'HARBOR RD', -76], [-22, -14, 'MAIN ST', 30], [18, 26, 'MAPLE ST', -58], [60, 68, 'OAK ST', 36]];
    for (const [z0, z1] of streets) R(-80, z0, 80, z1, ROAD);
    R(-4, -54, 4, 84, ROAD);
    if (mem) R(25, -14, 31, 18, ROAD);
    // center lines, leaving room for the printed street names
    const skip = [];
    for (const [z0, z1, name, lx] of streets) {
      const y = mz((z0 + z1) / 2);
      const x0 = mx(lx) - 2, x1 = mx(lx) + name.length * 6 + 1;
      skip.push([x0, x1, mz(z0), mz(z1)]);
      for (let x = 0; x < VW; x++) { if (x >= x0 && x <= x1) continue; if (x >= mx(-4) && x < mx(4)) continue; if (x % 6 < 3) p.set(x, y, '#f0d060'); }
      p.text(name, mx(lx), mz(z0) + 1, '#f4f0e4');
    }
    for (let y = mz(-54); y < VH; y++) { if (streets.some(([z0, z1]) => y >= mz(z0) && y < mz(z1))) continue; if (y % 6 < 3) p.set(mx(0), y, '#f0d060'); }
    if (mem) for (let y = mz(-14); y < mz(18); y++) if (y % 6 < 3) p.set(mx(28), y, '#f0d060');
    // crosswalks where Center Ave meets each street
    for (const [z0, z1] of streets) for (let y = mz(z0); y < mz(z1); y += 2) { p.set(mx(-6), y, '#f4f0e4'); p.set(mx(-5), y, '#f4f0e4'); p.set(mx(4), y, '#f4f0e4'); p.set(mx(5), y, '#f4f0e4'); }
    // barrels where the roads leave town
    for (const [z0, z1] of streets) for (let y = mz(z0) + 1; y < mz(z1); y += 2) { p.set(mx(-76.7), y, '#e8742a'); p.set(mx(76.7), y, '#e8742a'); }
    for (let x = mx(-3.4); x <= mx(3.4); x += 2) p.set(x, mz(71.4), '#e8742a');
    // fence behind the shops
    for (let x = 0; x < VW; x += 2) if (x < mx(-6) || x >= mx(6)) p.set(x, mz(-50), '#8a8478');

    // buildings — roofs seen from above, fronts facing south (the way the camera sees them)
    function bld(x0, z0, x1, z1, o) {
      const X0 = mx(x0), Y0 = mz(z0), X1 = mx(x1), Y1 = mz(z1), w = X1 - X0, h = Y1 - Y0, face = o.face || 3;
      for (let y = Y0 + 2; y <= Y1; y++) mulPix(p, X1, y, 0.7);
      for (let x = X0 + 2; x <= X1; x++) mulPix(p, x, Y1, 0.7);
      const roofH = h - face;
      if (o.gable) {
        const mid = Y0 + Math.floor(roofH / 2);
        p.rect(X0, Y0, w, mid - Y0, shadeStr(o.roof, 1.18));
        p.rect(X0, mid, w, Y0 + roofH - mid, o.roof);
        for (let x = X0 + 1; x < X1 - 1; x++) p.set(x, mid, shadeStr(o.roof, 1.35));
        for (let y = Y0 + 2; y < Y0 + roofH; y += 2) for (let x = X0 + 2 + (y % 4 ? 1 : 0); x < X1 - 1; x += 3) p.set(x, y, shadeStr(o.roof, y < mid ? 1.05 : 0.85));
        if (o.chimney) p.rect(X0 + w - 5, Y0 + 2, 2, 3, '#8a4a3a');
      } else {
        p.rect(X0, Y0, w, roofH, o.roof);
        p.frame(X0 + 1, Y0 + 1, w - 2, roofH - 1, shadeStr(o.roof, 1.1));
        if (o.vents) for (const [vx, vy] of o.vents) p.rect(X0 + vx, Y0 + vy, 2, 2, shadeStr(o.roof, 0.78));
      }
      p.rect(X0, Y1 - face, w, face, o.wall);
      if (o.awning) for (let x = X0 + 1; x < X1 - 1; x++) p.set(x, Y1 - face - 1, o.stripes && x % 2 ? '#f4f2ea' : o.awning);
      if (o.windows !== false) for (let x = X0 + 2; x < X1 - 2; x += 3) p.set(x, Y1 - face + 1, o.dark ? '#4a4a58' : o.dead ? '#6a5a44' : '#dceef8');
      if (o.door != null) { const dx = mx(o.door); p.rect(dx - 1, Y1 - 2, 2, 2, o.doorC || '#5a3a2a'); }
      p.frame(X0, Y0, w, h, INK);
      for (let x = X0 + 1; x < X1 - 1; x++) p.set(x, Y1 - face - (o.awning ? 2 : 1), shadeStr(o.roof, 0.6));
      if (o.dead) { p.set(X0 + 3, Y0 + 3, '#2a2420'); p.set(X0 + 4, Y0 + 3, '#2a2420'); p.set(X0 + 4, Y0 + 4, '#2a2420'); }
    }
    // the aquarium (or where it was)
    if (!f.aquariumGone) {
      const old = mem;
      bld(-30, -88, 14, -68, { roof: old ? '#c8c6c0' : '#eef0ee', wall: old ? '#9a9a98' : '#5a8ac8', face: 4, door: -8, doorC: '#9ad0f0', windows: false, vents: [[4, 3], [38, 3], [4, 12]] });
      for (const x of [-26, -20, 4, 10]) { p.set(mx(x), mz(-70), old ? '#606068' : '#dceef8'); p.set(mx(x) + 1, mz(-70), old ? '#606068' : '#dceef8'); }
      const cx = mx(-8), cy = mz(-79);
      p.ellipse(cx, cy, 8, 7, INK); p.ellipse(cx, cy, 7, 6, old ? '#8a8a88' : '#3e6292');
      p.ellipse(cx, cy, 4.5, 4, old ? '#a4a4a0' : '#5a86ba');
      for (let a = 0; a < 6.28; a += 0.785) p.line(cx, cy, cx + Math.cos(a) * 6.5, cy + Math.sin(a) * 5.5, old ? '#7a7a78' : '#35557f');
      p.ellipse(cx, cy, 2, 2, old ? '#b4b4b0' : '#8ab4dc');
      p.set(cx - 3, cy - 3, '#e8f4ff'); p.set(cx - 2, cy - 4, '#e8f4ff');
      p.rect(mx(-11), mz(-68), 6, 2, old ? '#8a8a88' : '#3a6ab0'); p.frame(mx(-11), mz(-68), 6, 2, INK);
      p.rect(mx(-20), mz(-66), 2, 2, '#9a968c'); p.set(mx(-19), mz(-66), '#f08a30');
    } else {
      R(-30, -88, 14, -68, '#b8b070'); dots(-30, -88, 14, -68, ['#a09858', '#c8c088'], 0.12);
      p.rect(mx(-20), mz(-84), 18, 10, '#d8d4c4');
      for (let x = mx(-30); x < mx(14); x += 2) p.set(x, mz(-68), '#7a7a7a');
    }
    // cars, boat, pier
    if (d <= 6 && !(d === 6 && night)) { p.rect(mx(-61), mz(-81), 3, 5, '#4a8a4a'); p.frame(mx(-61), mz(-81), 3, 5, INK); p.set(mx(-60), mz(-80), '#bfe0f0'); }
    if (!mem) { p.rect(mx(-49), mz(-86), 3, 5, '#3a6ac8'); p.frame(mx(-49), mz(-86), 3, 5, INK); p.set(mx(-48), mz(-82), '#bfe0f0'); }
    p.rect(mx(60), mz(-77), 4, 2, '#8a5a3a'); p.frame(mx(60) - 1, mz(-77) - 1, 6, 4, '#5a3a2a');
    R(44, -110, 48, -86, '#a67c52');
    for (let y = mz(-110); y < mz(-86); y += 2) for (let x = mx(44); x < mx(48); x++) p.set(x, y, '#7a5a3a');
    p.frame(mx(44), mz(-110), 4, mz(-86) - mz(-110), '#5a3a22');
    for (let x = 22; x < 76; x += 11) { p.set(mx(x), mz(-91), '#4a7a3a'); p.set(mx(x) + 1, mz(-92) + 2, '#5a8a44'); }
    // shops
    if (!mem) {
      bld(-76, -46, -58, -26, { gable: true, roof: '#5e5e74', wall: '#ecebe4', door: -67, doorC: '#a03030' });
      const sx = mx(-67); p.rect(sx - 2, mz(-35), 4, 5, '#ecebe4'); p.frame(sx - 2, mz(-35), 4, 5, INK);
      p.set(sx - 1, mz(-38), '#f4f0e0'); p.set(sx - 1, mz(-37), '#f4f0e0'); p.set(sx - 1, mz(-39), '#f4f0e0'); p.set(sx - 2, mz(-38), '#f4f0e0'); p.set(sx, mz(-38), '#f4f0e0');
    } else {
      R(-76, -46, -58, -26, '#b89a70'); dots(-76, -46, -58, -26, ['#a08058', '#c8ae88'], 0.15);
      p.line(mx(-70), mz(-40), mx(-70), mz(-36), '#5a4030'); p.line(mx(-72), mz(-40), mx(-70), mz(-38), '#5a4030'); p.line(mx(-68), mz(-41), mx(-70), mz(-38), '#5a4030');
    }
    bld(-52, -44, -36, -26, { roof: '#c4c0b4', wall: mem ? '#e8e8e4' : '#d8b888', awning: '#3a8a4a', door: -44, vents: [[3, 3], [10, 5]] });
    bld(-30, -42, -14, -26, { roof: '#d8d4cc', wall: '#f4f2ea', awning: '#c83a3a', stripes: true, door: -22, dark: mem && night });
    bld(10, -40, 22, -26, { roof: '#c8d4d0', wall: '#a8dcc8', awning: '#f4f2ea', door: 16, dark: mem });
    bld(26, -40, 38, -26, { roof: '#b8a898', wall: '#b06048', awning: '#3a8a4a', door: 32, doorC: '#2a6a3a', dark: true });
    bld(56, -48, 74, -36, { roof: '#e4e4e0', wall: '#f0f0ec', door: 69, doorC: '#9ad0f0', windows: false, vents: [[12, 3]] });
    p.rect(mx(58) - 1, mz(-38), 6, 2, '#9a9a98');
    const cy0 = mz(-33.5), cy1 = mz(-26.5);
    for (let y = cy0 + 1; y <= cy1; y++) mulPix(p, mx(59), y, 0.7);
    for (let x = mx(47) + 1; x <= mx(59); x++) mulPix(p, x, cy1, 0.7);
    p.rect(mx(47), cy0, mx(59) - mx(47), cy1 - cy0, '#c83a2a');
    for (let x = mx(47) + 1; x < mx(59) - 1; x++) p.set(x, cy0 + 3, '#f4f2ea');
    p.frame(mx(47), cy0, mx(59) - mx(47), cy1 - cy0, INK);
    // houses, with a path out to the sidewalk
    const houses = [
      [-76, 'pruitt', '#9cc48a', '#8a5a3a'], [-54, 'kessler', '#b8b090', '#6a6258', true],
      [-32, 'miller', mem ? '#a8a094' : '#e8a8b0', mem ? '#6a6258' : '#b04a3a', mem], [10, 'home', '#8ab0d8', '#6a7078'],
      [32, 'delgado', '#ecebe4', '#4a7a4a'], [54, 'okafor', '#e0c070', '#4a6a9a'],
    ];
    R(-54, 0, -40, 16, '#b8b070');
    for (const [x0, id, siding, roof, dead] of houses) {
      const x1 = id === 'okafor' ? 70 : x0 + 14;
      const door = id === 'home' ? 17 : id === 'delgado' ? (d >= 5 ? 44.6 : 39) : (x0 + x1) / 2;
      p.rect(mx(door) - 1, mz(12), 2, mz(16) - mz(12), SIDE);
      bld(x0, -6, x1, 12, { gable: true, roof, wall: siding, door, dead, chimney: id === 'home' || id === 'okafor' });
    }
    // trees
    const tree = (x, z, kind) => {
      const X = mx(x), Y = mz(z);
      if (kind === 'pine') { p.tri(X - 3, Y + 2, X + 3, Y + 2, X, Y - 4, '#2e5e3a'); p.tri(X - 2, Y + 1, X + 2, Y + 1, X, Y - 3, '#447a48'); p.set(X, Y + 3, '#5a3a22'); mulPix(p, X + 3, Y + 3, 0.7); return; }
      if (kind === 'dead') { p.line(X, Y - 3, X, Y + 2, '#5a4030'); p.line(X - 2, Y - 3, X, Y - 1, '#5a4030'); p.line(X + 2, Y - 2, X, Y, '#5a4030'); return; }
      const r = kind === 'bush' ? 1.8 : 3;
      p.ellipse(X + 1, Y + 1, r, r, shadeStr(GRASS, 0.72));
      p.ellipse(X, Y, r + 0.6, r + 0.6, '#2e5e34'); p.ellipse(X, Y, r, r, '#4e8a48');
      p.set(X - 1, Y - 1, '#7ab860'); if (r > 2) p.set(X - 1, Y - 2, '#7ab860');
    };
    for (let z = -60; z < 70; z += 7) { tree(-81, z, (z / 7) % 2 ? 'pine' : 'round'); tree(81, z + 3, (z / 7) % 2 ? 'round' : 'pine'); }
    for (let x = -70; x < 80; x += 9) tree(x, 76 + (x % 3), 'pine');
    if (!f.aquariumGone) { tree(-29, -65.5, 'bush'); tree(10, -65.5, 'bush'); } else { tree(-20, -80, 'bush'); tree(4, -84, 'bush'); }
    tree(-42, 14, 'dead'); tree(8, 4); tree(-10, -2); tree(50, 2); tree(-58, 0, 'pine'); tree(74, -2);
    // park + playground
    const P0 = [mx(-62), mz(34), mx(-42), mz(48)];
    p.rect(P0[0], P0[1], P0[2] - P0[0], P0[3] - P0[1], '#4a7aa8');
    p.rect(P0[0] + 1, P0[1] + 1, P0[2] - P0[0] - 2, P0[3] - P0[1] - 2, WATER);
    for (const [x, y] of [[P0[0], P0[1]], [P0[2] - 1, P0[1]], [P0[0], P0[3] - 1], [P0[2] - 1, P0[3] - 1]]) p.set(x, y, GRASS);
    for (let x = P0[0] + 4; x < P0[2] - 4; x += 6) { p.set(x, P0[1] + 4, '#b4dcee'); p.set(x + 1, P0[1] + 4, '#b4dcee'); p.set(x + 3, P0[1] + 9, '#b4dcee'); p.set(x + 4, P0[1] + 9, '#b4dcee'); }
    for (let x = P0[0] + 1; x < P0[2]; x += 3) { p.set(x, P0[3], '#4a7a3a'); p.set(x + 1, P0[1] - 1, '#4a7a3a'); }
    R(-36, 36, -14, 54, '#ecd8a0'); dots(-36, 36, -14, 54, ['#dcc488'], 0.08);
    for (let x = mx(-37); x < mx(-13); x += 2) if (x < mx(-26) || x > mx(-23)) p.set(x, mz(34.5), '#8a6a4a');
    p.line(mx(-28.5), mz(38.5), mx(-21.5), mz(38.5), INK); p.set(mx(-28.5), mz(38.5) + 1, INK); p.set(mx(-21.5), mz(38.5) + 1, INK);
    p.set(mx(-27), mz(39.5), '#c83a3a'); p.set(mx(-23), mz(39.5), mem ? '#ecd8a0' : '#3a6ac8');
    p.line(mx(-18), mz(44), mx(-16), mz(48), '#c83a3a'); p.line(mx(-17), mz(44), mx(-15), mz(48), '#e8a030');
    p.ellipse(mx(-30), mz(43), 2, 2, '#c83a3a'); p.set(mx(-30), mz(43), '#f4d040');
    p.rect(mx(-33), mz(48.5), 4, 3, '#f4e4b8'); p.frame(mx(-33), mz(48.5), 4, 3, '#8a6a4a');
    for (let y = mz(36.5); y < mz(40); y++) p.set(mx(-16), y, '#f8f4e8');
    [[-70, 32], [-70, 54, 'pine'], [-40, 31], [-10, 34, 'pine'], [-12, 55], [-66, 50, 'bush'], [8, 34], [56, 36, 'pine'], [60, 50], [72, 40], [66, 30, 'bush']].forEach(([x, z, k]) => tree(x, z, k || 'round'));
    // school
    R(12, 50, 50, 58, ROAD);
    for (let x = 16; x < 48; x += 4) for (let z = 55; z < 58; z++) p.set(mx(x), mz(z), '#e8e4dc');
    bld(12, 32, 50, 50, { roof: '#bca888', wall: '#d8b888', face: 4, door: 31, doorC: '#6a4a8a', vents: [[6, 4], [28, 4], [17, 8]], dark: mem || night });
    for (let x = mx(50); x < VW; x += 2) p.set(x, mz(50), '#8a8478');
    p.line(mx(20), mz(51), mx(20), mz(54), INK); p.rect(mx(20) + 1, mz(51), 3, 2, '#c83a3a'); p.set(mx(20) + 1, mz(51), '#3a5ab8');
    // welcome sign
    p.rect(mx(7), mz(70), 5, 3, '#f0ece0'); p.frame(mx(7), mz(70), 5, 3, INK); p.set(mx(9), mz(71), '#2a58b8');
    // moving truck on the first day
    if (d === 1 && !f.truckGone) { p.rect(mx(25.2), mz(18.6), 3, 6, '#f4f4f0'); p.frame(mx(25.2), mz(18.6), 3, 6, INK); p.set(mx(26.2), mz(23.4), '#bfe0f0'); p.set(mx(26.2), mz(20), '#e87a30'); }
    // Walter's version of the town is older and paler
    if (mem) sepia(p, 0.55);
    const cv = p.canvas();
    return cv;
  }
  function shadeStr(c, k) { const v = shade(c, k); return 'rgb(' + v[0] + ',' + v[1] + ',' + v[2] + ')'; }

  // things drawn on top of the print: folds, grain, compass, and what people added in pen and crayon
  function paintOver(st) {
    const p = new Pix(VW, VH);
    const d = st.day, f = st.flags, mem = d >= 8, rng = makeRng(77 + d);
    for (let i = 0; i < VW * VH * 0.07; i++) p.set(rng.int(VW), rng.int(VH), rng() < 0.6 ? 'rgba(255,250,235,0.14)' : 'rgba(70,50,30,0.1)');
    for (let y = 0; y < VH; y++) { p.set(VW / 2, y, 'rgba(255,255,255,0.3)'); p.set(VW / 2 + 1, y, 'rgba(0,0,0,0.12)'); }
    for (let x = 0; x < VW; x++) { p.set(x, VH / 2, 'rgba(255,255,255,0.3)'); p.set(x, VH / 2 + 1, 'rgba(0,0,0,0.12)'); }
    // compass rose, out on the water
    const cx = 150, cy = 15;
    p.ring(cx, cy, 4.5, 4.5, 'rgba(244,240,228,0.7)');
    for (let i = 1; i <= 5; i++) { p.set(cx, cy + i, '#f4f0e4'); p.set(cx - i, cy, '#f4f0e4'); p.set(cx + i, cy, '#f4f0e4'); }
    for (let i = 0; i <= 5; i++) { p.set(cx, cy - i, '#c83a3a'); if (i > 0 && i < 4) { p.set(cx - 1, cy - i + 1, '#c83a3a'); p.set(cx + 1, cy - i + 1, '#9a2a2a'); } }
    p.text('N', cx - 2, 1, '#f4f0e4');
    p.text('BELL RIVER', 6, 9, '#d4ecf8');
    // somebody circled your house for you (then, later, scribbled it out)
    const hx = mx(17), hy = mz(3);
    if (d <= 7 && !mem) {
      handRing(p, hx, hy, 11, 13, 'rgba(70,70,86,0.8)', 12, { gaps: true });
      if (d === 7) for (let i = -10; i < 10; i += 2) p.line(hx + i - 3, hy + 10, hx + i + 4, hy - 10, 'rgba(70,70,86,0.65)');
    }
    // crayon, a little more each day
    if (d >= 5) {
      const fx = 96, fy = 13, cr = 'rgba(240,138,48,0.9)';
      p.line(fx, fy, fx + 4, fy - 2, cr); p.line(fx, fy, fx + 4, fy + 2, cr); p.line(fx + 4, fy - 2, fx + 7, fy, cr); p.line(fx + 4, fy + 2, fx + 7, fy, cr);
      p.line(fx + 7, fy, fx + 9, fy - 2, cr); p.line(fx + 7, fy, fx + 9, fy + 2, cr); p.set(fx + 2, fy, cr);
    }
    if (d >= 6) {
      const sx = mx(-31), sy = mz(50), cr = 'rgba(40,70,200,0.85)';
      for (let o = 0; o < 2; o++) { p.line(sx - 3 + o, sy - 3, sx + 3 + o, sy + 3, cr); p.line(sx + 3 + o, sy - 3, sx - 3 + o, sy + 3, cr); }
      handRing(p, 22, 42, 6, 6, 'rgba(120,76,36,0.4)', 6, { thick: true });
      handRing(p, 22, 42, 5, 5, 'rgba(120,76,36,0.2)', 7);
    }
    // the tunnel, once you know it's there
    if (f.houseBasementOpen) {
      const a = [mx(4), mz(-70)], b = [mx(16), mz(-6)];
      for (let i = 0; i <= 60; i++) { if (i % 4 > 1) continue; const t = i / 60; p.set(lerp(a[0], b[0], t) + Math.sin(t * 9) * 1.5, lerp(a[1], b[1], t), 'rgba(150,30,30,0.85)'); }
    }
    return p.canvas();
  }

  // ---------------------------------------------------------------- places' pictures for the side panel
  function paintPict(o, st) {
    const W = 72, H = 40, p = new Pix(W, H);
    const night = st.tod === 'night', eve = st.tod === 'evening', mem = st.day >= 8;
    const sky = mem ? (night ? ['#000000', '#0c0e14'] : ['#c4ccb4', '#e6e6d4']) : night ? ['#0a0e1c', '#1e2640'] : eve ? ['#5a4a8a', '#f0a070'] : st.day === 7 ? ['#9aa0a8', '#c4c8cc'] : ['#8ec0ea', '#e0ebf2'];
    for (let y = 0; y < 28; y++) p.rect(0, y, W, 1, mixc(sky[0], sky[1], y / 27));
    const lit = night || eve;
    const groundC = o.kind === 'lot' ? '#b89a70' : o.kind === 'fence' || o.dead ? '#a8a070' : '#8cbc6a';
    p.rect(0, 28, W, 12, groundC); p.speckle(makeRng(3), [shadeStr(groundC, 0.9), shadeStr(groundC, 1.1)], 0.2, 0, 28, W, 12);
    if (o.kind === 'house') {
      p.rect(16, 30, 40, 3, 'rgba(0,0,0,0.25)');
      p.rect(18, 17, 36, 15, o.siding);
      for (let y = 19; y < 32; y += 3) p.rect(18, y, 36, 1, shadeStr(o.siding, 0.88));
      p.tri(13, 18, 59, 18, 36, 5, o.roof); p.line(13, 18, 36, 5, INK); p.line(59, 18, 36, 5, INK); p.line(13, 18, 59, 18, INK);
      if (o.home || !o.dead) p.rect(45, 6, 4, 7, '#8a4a3a');
      p.frame(18, 17, 36, 15, INK);
      const win = o.dead ? '#3a3228' : lit && !mem ? '#f4d880' : '#cfe6f4';
      for (const wx of [21, 44]) { p.rect(wx, 21, 7, 5, win); p.frame(wx - 1, 20, 9, 7, '#f4f2ea'); p.set(wx + 3, 21, '#f4f2ea'); p.set(wx + 3, 23, '#f4f2ea'); }
      p.rect(33, 23, 6, 9, o.dead ? '#4a3a2a' : '#6a3a2a'); p.set(37, 27, '#e8c060');
      if (o.dead) { for (const wx of [20, 43]) { p.line(wx, 21, wx + 8, 25, '#8a6a44'); p.line(wx, 25, wx + 8, 21, '#8a6a44'); } p.line(30, 24, 42, 28, '#8a6a44'); p.set(28, 10, '#2a2420'); p.set(29, 11, '#2a2420'); }
      p.rect(34, 32, 4, 8, '#dcd6c8');
    } else if (o.kind === 'pier') {
      p.rect(0, 22, W, 18, '#5a96c4');
      for (let y = 24; y < 40; y += 3) for (let x = (y * 7) % 6; x < W; x += 6) p.rect(x, y, 3, 1, '#8ec4e4');
      p.rect(0, 20, W, 2, '#6a8a5a');
      p.rect(20, 25, 52, 3, '#a67c52'); p.rect(20, 28, 52, 1, '#5a3a22');
      for (const x of [22, 36, 50, 64]) p.rect(x, 29, 2, 6, '#5a3a22');
      if (!mem && !night) { p.line(12, 8, 14, 10, INK); p.line(14, 10, 16, 8, INK); p.line(50, 5, 52, 7, INK); p.line(52, 7, 54, 5, INK); }
    } else if (o.kind === 'pond') {
      p.ellipse(38, 33, 26, 6, '#4a7aa8'); p.ellipse(38, 33, 25, 5, mem ? '#4a6a7a' : '#7eb6d8');
      if (!mem) { p.rect(28, 32, 3, 1, '#c4e4f4'); p.rect(44, 35, 4, 1, '#c4e4f4'); }
      for (let x = 14; x < 64; x += 5) { p.line(x, 27, x, 25, '#3a6a2a'); }
      p.rect(9, 18, 2, 10, '#5a3a22'); p.ellipse(10, 14, 7, 7, '#2e5e34'); p.ellipse(10, 14, 6, 6, '#4e8a48'); p.set(8, 11, '#7ab860');
    } else if (o.kind === 'playground') {
      p.rect(0, 28, W, 12, '#ecd8a0');
      p.line(8, 30, 16, 8, INK); p.line(24, 30, 16, 8, INK); p.line(40, 30, 48, 8, INK); p.line(56, 30, 48, 8, INK); p.line(16, 8, 48, 8, INK);
      p.line(26, 9, 26, 24, '#6a6a70'); p.line(32, 9, 32, 24, '#6a6a70'); p.rect(25, 24, 8, 2, '#c83a3a');
      if (!mem) { p.line(38, 9, 38, 24, '#6a6a70'); p.line(44, 9, 44, 24, '#6a6a70'); p.rect(37, 24, 8, 2, '#3a6ac8'); }
      p.rect(60, 16, 2, 16, '#6a6a70'); p.line(62, 16, 71, 32, '#e8a030'); p.line(62, 17, 71, 33, '#c83a3a');
    } else if (o.kind === 'lot') {
      p.line(36, 30, 36, 12, '#5a4030'); p.line(36, 18, 28, 10, '#5a4030'); p.line(36, 15, 44, 8, '#5a4030'); p.line(40, 11, 42, 5, '#5a4030');
    } else if (o.kind === 'fence') {
      for (let x = 0; x < W; x += 4) for (let y = 14; y < 32; y++) { if ((x + y) % 4 === 0) p.set(x + (y % 4), y, '#7a7a7a'); }
      p.rect(0, 13, W, 1, '#6a6a6a');
    }
    p.frame(0, 0, W, H, INK);
    if (mem) sepia(p, 0.55);
    return p.canvas();
  }

  // ---------------------------------------------------------------- cache
  let cache = { key: null, base: null, over: null }, picts = {};
  function cached(st) {
    const f = st.flags;
    const key = [st.day, st.tod === 'night', f.aquariumGone, f.houseBasementOpen, f.truckGone].join('|');
    if (cache.key !== key) { cache = { key, base: paintBase(st), over: paintOver(st) }; picts = {}; }
    return cache;
  }
  function pictFor(place, st) {
    const o = place.pict && place.pict(st); if (!o) return null;
    const key = place.id + '|' + st.day + '|' + st.tod;
    return picts[key] || (picts[key] = paintPict(o, st));
  }

  // ---------------------------------------------------------------- input
  function ensureSel(m, st) {
    const list = visible(st);
    if (m.mapSel == null || m.mapSel >= list.length) {
      const here = herePlace(st), goal = goalPlace(st);
      m.mapSel = Math.max(0, list.indexOf(here || goal || list[0]));
      m.mapAnim = null;
    }
    return list;
  }
  function update(m, dt) {
    const st = Game.st;
    if (mode(st) !== 'town') return;
    const list = ensureSel(m, st);
    if (Input.repeat('up', dt)) { m.mapSel = (m.mapSel + list.length - 1) % list.length; Sound.sfx('move'); }
    if (Input.repeat('down', dt)) { m.mapSel = (m.mapSel + 1) % list.length; Sound.sfx('move'); }
    if (Input.pressed('a')) { Input.eat('a'); Sound.sfx('paper', { vol: 0.5 }); }
  }
  function goalPlace(st) {
    const o = st.obj; if (!o) return null;
    const id = goalOf[o.id]; if (!id) return null;
    const p = byId[id]; return p && (!p.cond || p.cond(st)) ? p : null;
  }

  // ---------------------------------------------------------------- drawing
  const fill = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  function paper(ctx, st, t) {
    const mem = st.day >= 8;
    const pc = mem ? '#d8cc9c' : '#efe6cc';
    fill(ctx, PX + 2, PY + 2, PW, PH, 'rgba(0,0,0,0.45)');
    fill(ctx, PX, PY, PW, PH, pc);
    fill(ctx, PX, PY, PW, 1, INK); fill(ctx, PX, PY + PH - 1, PW, 1, INK); fill(ctx, PX, PY, 1, PH, INK); fill(ctx, PX + PW - 1, PY, 1, PH, INK);
    // printed double rule around the map
    ctx.fillStyle = mem ? '#6a5a3a' : '#3a5a8a';
    ctx.fillRect(VX - 2, VY - 2, VW + 4, 1); ctx.fillRect(VX - 2, VY + VH + 1, VW + 4, 1); ctx.fillRect(VX - 2, VY - 2, 1, VH + 4); ctx.fillRect(VX + VW + 1, VY - 2, 1, VH + 4);
    // dog-eared corner
    const cx = PX + PW - 1, cy = PY;
    for (let i = 0; i < 7; i++) { fill(ctx, cx - 6 + i, cy, 7 - i, 1, 'rgba(6,8,20,1)'); }
    for (let i = 0; i < 7; i++) { fill(ctx, cx - 6, cy + i, i + 1, 1, mem ? '#b8ac80' : '#d8ceb0'); }
    fill(ctx, cx - 6, cy, 1, 7, INK);
  }
  function drawWaves(ctx, st, t) {
    if (st.day >= 8) return; // the water in Walter's version doesn't move
    const step = Math.floor(t * 3);
    ctx.fillStyle = '#b4dcee';
    for (let row = 0; row < 4; row++) {
      const y = 3 + row * 6;
      for (let k = 0; k < 7; k++) {
        let x = (k * 25 + row * 11 + step * (row % 2 ? 1 : -1)) % (VW + 10); if (x < 0) x += VW + 10; x -= 5;
        if (x > 120 && x < 131) continue;              // pier
        if (x > 138 && y < 22) continue;               // compass
        if (x < 68 && y > 6 && y < 18) continue;       // label
        ctx.fillRect(VX + x, VY + y, 3, 1); ctx.fillRect(VX + x + 3, VY + y + 1, 1, 1); ctx.fillRect(VX + x - 1, VY + y + 1, 1, 1);
      }
    }
    // a pair of gulls drifting over the water in the daytime
    if (st.tod !== 'night') {
      ctx.fillStyle = '#3a3a48';
      for (let i = 0; i < 2; i++) {
        const gx = VX + ((t * 4 + i * 70) % (VW + 20)) - 10, gy = VY + 6 + i * 8 + Math.round(Math.sin(t * 2 + i) * 1);
        if (gx < VX || gx > VX + VW - 5) continue;
        const flap = Math.floor(t * 4 + i) % 2;
        ctx.fillRect(gx, gy + flap, 1, 1); ctx.fillRect(gx + 1, gy + 1, 1, 1); ctx.fillRect(gx + 2, gy + flap, 1, 1);
      }
    }
  }
  function ants(ctx, x, y, w, h, t) {
    const ph = Math.floor(t * 10);
    let i = 0;
    const put = (px, py) => { ctx.fillStyle = ((i++ + ph) % 4) < 2 ? '#ffffff' : '#c83a3a'; ctx.fillRect(px, py, 1, 1); };
    for (let k = 0; k < w; k++) put(x + k, y);
    for (let k = 0; k < h; k++) put(x + w - 1, y + k);
    for (let k = w - 1; k >= 0; k--) put(x + k, y + h - 1);
    for (let k = h - 1; k >= 0; k--) put(x, y + k);
  }
  function placeBox(p) {
    const [x0, z0, x1, z1] = p.rect;
    return [VX + mx(x0), VY + mz(z0), mx(x1) - mx(x0), mz(z1) - mz(z0)];
  }
  function drawGoal(ctx, st, t) {
    const g = goalPlace(st); if (!g) return;
    const [x, y, w, h] = placeBox(g);
    const cx = x + w / 2, cy = y + h / 2, voice = st.obj.voice;
    if (voice === 'walter') {
      // red pen, pressed hard
      ctx.fillStyle = '#b82828';
      const n = 70;
      for (let i = 0; i < n * 1.12; i++) {
        const a = (i / n) * 6.28 - 1.2, wob = 1 + Math.sin(a * 3) * 0.06 + i / n * 0.06;
        ctx.fillRect(Math.round(cx + Math.cos(a) * (w / 2 + 4) * wob), Math.round(cy + Math.sin(a) * (h / 2 + 4) * wob), 1, 1);
      }
    } else if (voice === 'evan') {
      ctx.fillStyle = 'rgba(40,70,200,0.9)';
      const r = Math.min(w, h) / 2 + 2;
      for (let i = -r; i <= r; i++) { const jit = Math.sin(i * 1.7) > 0.6 ? 1 : 0; ctx.fillRect(Math.round(cx + i), Math.round(cy + i + jit), 2, 1); ctx.fillRect(Math.round(cx + i), Math.round(cy - i + jit), 2, 1); }
    } else {
      const b = Math.round(Math.sin(t * 4) * 1);
      Font.draw(ctx, '★', Math.round(x + w - 4), Math.round(y - 6 + b), Math.floor(t * 3) % 2 ? '#f4c030' : '#fff0a0', { shadow: INK });
    }
  }
  function drawSelection(ctx, st, place, t, m) {
    const [x, y, w, h] = placeBox(place);
    // the cursor glides between places
    const target = [x + w / 2, y];
    if (!m.mapAnim) m.mapAnim = target.slice();
    m.mapAnim[0] = lerp(m.mapAnim[0], target[0], 0.3); m.mapAnim[1] = lerp(m.mapAnim[1], target[1], 0.3);
    ants(ctx, x - 2, y - 2, w + 4, h + 4, t);
    const ax = Math.round(m.mapAnim[0] - 3), ay = Math.max(VY - 1, Math.round(m.mapAnim[1] - 12 + Math.abs(Math.sin(t * 5)) * -2));
    Font.draw(ctx, '▼', ax, ay, '#e83a3a', { shadow: '#fff8e8' });
  }
  function drawPlayer(ctx, st, t) {
    const pos = playerPos(st); if (!pos) return;
    const x = VX + mx(pos[0]), y = VY + mz(pos[1]);
    if (x < VX || x >= VX + VW || y < VY || y >= VY + VH) return;
    const inside = st.map !== 'town';
    // expanding ring
    const r = (t * 6) % 7 + 2;
    ctx.fillStyle = inside ? 'rgba(232,58,58,0.9)' : 'rgba(255,255,255,0.9)';
    for (let a = 0; a < 6.28; a += 0.4) ctx.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r * 0.8), 1, 1);
    const b = Math.floor(t * 3) % 2;
    helmet(ctx, x - 2, y - 5 - b, st, inside && Math.floor(t * 2) % 2);
  }
  // the little helmet kid, 5x5
  function helmet(ctx, x, y, st, dim) {
    const ghost = World.player && World.player.set === 'player_ghost';
    const Y = ghost ? '#e8e8f0' : '#f4d040', B = ghost ? '#b8c0d8' : '#3a6ad8';
    fill(ctx, x - 1, y, 7, 5, INK); fill(ctx, x, y - 1, 5, 7, INK);
    fill(ctx, x + 1, y, 3, 1, Y); fill(ctx, x, y + 1, 5, 2, Y); fill(ctx, x + 1, y + 1, 1, 1, '#fff8c0');
    fill(ctx, x + 1, y + 3, 3, 1, B); fill(ctx, x + 1, y + 4, 1, 1, B); fill(ctx, x + 3, y + 4, 1, 1, B);
    if (dim) fill(ctx, x - 1, y - 1, 7, 7, 'rgba(0,0,0,0.35)');
  }
  // day 8 at night: you can only see the map where you're standing
  let darkCv = null, darkKey = null;
  function drawDark(ctx, st, t) {
    const pos = playerPos(st) || [0, 0];
    const px0 = mx(pos[0]), py0 = mz(pos[1]), key = px0 + ',' + py0;
    if (darkKey !== key) {
      darkKey = key;
      const p = new Pix(VW, VH);
      const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      for (let y = 0; y < VH; y++) for (let x = 0; x < VW; x++) {
        const d = Math.hypot(x - px0, (y - py0) * 1.1);
        const k = clamp((d - 24) / 18, 0, 1) * 16;
        p.set(x, y, k > bayer[(y % 4) * 4 + (x % 4)] ? 'rgba(4,5,10,0.88)' : 'rgba(10,14,40,0.3)');
      }
      darkCv = p.canvas();
    }
    ctx.drawImage(darkCv, VX, VY);
  }

  function drawSpecial(ctx, st, t) {
    const white = mode(st) === 'white';
    fill(ctx, PX + 2, PY + 2, PW, PH, 'rgba(0,0,0,0.45)');
    fill(ctx, PX, PY, PW, PH, white ? '#ffffff' : mode(st) === 'dream' ? '#1a1830' : '#f4f6f8');
    if (mode(st) === 'dream') {
      // a child's drawing of a map, in crayon, from memory
      const cr = (c) => { ctx.fillStyle = c; };
      const scr = (x0, y0, x1, y1, c) => { cr(c); const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) { const w = Math.sin(i * 0.7 + x0) * 0.8; ctx.fillRect(Math.round(lerp(x0, x1, i / n) + w), Math.round(lerp(y0, y1, i / n) - w), 2, 1); } };
      scr(VX + 20, VY + 30, VX + 60, VY + 28, '#6a8af0'); scr(VX + 20, VY + 30, VX + 22, VY + 60, '#6a8af0'); scr(VX + 60, VY + 28, VX + 58, VY + 60, '#6a8af0'); scr(VX + 22, VY + 60, VX + 58, VY + 60, '#6a8af0');
      scr(VX + 10, VY + 100, VX + 150, VY + 104, '#e8e070'); scr(VX + 80, VY + 70, VX + 84, VY + 190, '#e8e070');
      scr(VX + 100, VY + 130, VX + 130, VY + 128, '#e87070'); scr(VX + 100, VY + 130, VX + 104, VY + 150, '#e87070'); scr(VX + 130, VY + 128, VX + 128, VY + 150, '#e87070'); scr(VX + 104, VY + 150, VX + 128, VY + 150, '#e87070');
      Font.draw(ctx, 'ME', VX + 106, VY + 136, '#e8e4d0', { wobble: 2 });
    } else if (!white) {
      // graph paper and an unfinished pencil sketch: nobody finished drawing this part
      ctx.fillStyle = '#d4e0ee';
      for (let x = VX; x < VX + VW; x += 8) ctx.fillRect(x, VY, 1, VH);
      for (let y = VY; y < VY + VH; y += 8) ctx.fillRect(VX, y, VW, 1);
      ctx.fillStyle = 'rgba(80,80,96,0.55)';
      const seg = (x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) if (i % 9 < 7) ctx.fillRect(Math.round(lerp(x0, x1, i / n)), Math.round(lerp(y0, y1, i / n)), 1, 1); };
      seg(VX + 20, VY + 40, VX + 70, VY + 40); seg(VX + 70, VY + 40, VX + 70, VY + 58); seg(VX + 20, VY + 40, VX + 20, VY + 52);
      seg(VX + 10, VY + 80, VX + 150, VY + 80); seg(VX + 10, VY + 88, VX + 100, VY + 88); seg(VX + 80, VY + 70, VX + 80, VY + 180);
      seg(VX + 100, VY + 110, VX + 120, VY + 110); seg(VX + 100, VY + 110, VX + 100, VY + 126);
      Font.draw(ctx, 'TODO: MAP', VX + 88, VY + 150, 'rgba(80,80,96,0.7)', { wobble: 3 });
    }
    const x = VX + VW / 2, y = VY + VH / 2, b = Math.floor(t * 3) % 2;
    helmet(ctx, x - 2, y - 5 - b, st);
    if (Math.floor(t * 2) % 2 || !white) Font.center(ctx, 'YOU ARE HERE', x, y + 6, '#c83a3a');
  }

  function drawPanel(ctx, st, place, t) {
    const c = UI.C, mem = st.day >= 8, special = mode(st) !== 'town';
    UI.panel(ctx, SX, SY, SW, SH);
    Font.center(ctx, mode(st) === 'white' ? '' : mode(st) === 'under' ? '?' : mode(st) === 'dream' ? 'ZZZ' : 'BELLWOOD', SC, SY + 7, mem ? '#d8c890' : '#9ac4f4', { scale: 2, shadow: '#05060c' });
    Font.center(ctx, special ? '' : mem ? 'VISITOR MAP  POP.1,205' : 'VISITOR MAP', SC, SY + 25, c.dim);
    fill(ctx, SX + 8, SY + 36, SW - 16, 1, 'rgba(232,228,208,0.3)');
    if (special) {
      const lines = mode(st) === 'under' ? ['THIS AREA IS NOT', 'ON THE MAP.'] : mode(st) === 'dream' ? ['YOU ARE ASLEEP.', '', 'THE MAP IS', 'IN THE OTHER ROOM.'] : [];
      lines.forEach((l, i) => Font.center(ctx, l, SC, SY + 60 + i * 11, c.text));
      legend(ctx, st, false);
      return;
    }
    if (!place) return;
    // picture: the real sign if there is one, otherwise a little painting
    const boxY = SY + 40, boxH = 42;
    const sg = place.sign && place.sign(st);
    if (sg) {
      const r = Atlas.get(sg);
      const s = r.h <= 16 ? 2 : 1; // street signs are tiny; everything else reads at 1x
      ctx.drawImage(Atlas.canvas, r.x, r.y, r.w, r.h, Math.round(SC - r.w * s / 2), Math.round(boxY + (boxH - r.h * s) / 2), r.w * s, r.h * s);
    } else {
      const pc = pictFor(place, st);
      if (pc) { fill(ctx, SC - 36 + 2, boxY + 3, 72, 40, 'rgba(0,0,0,0.5)'); ctx.drawImage(pc, SC - 36, boxY + 1); }
    }
    let y = boxY + boxH + 4;
    const nm = wrapText(place.name(st), 20).slice(0, 2);
    nm.forEach((l) => { Font.center(ctx, l, SC, y, c.hi); y += 10; });
    const stt = place.status && place.status(st);
    const here = herePlace(st) === place && (st.map !== 'town' || insideOf(st, place) || isNear(st, place));
    if (stt || here) {
      const parts = [];
      if (stt) parts.push(stt);
      if (here) parts.push({ txt: st.map !== 'town' ? 'YOU ARE INSIDE' : 'YOU ARE HERE', bg: '#1a2044', fg: '#f4a0a0' });
      let tw = parts.reduce((a, p) => a + p.txt.length * 6 + 5, 0) + (parts.length - 1) * 3, tx = Math.round(SC - tw / 2);
      if (tw > SW - 8) { tx = SX + 6; }
      for (const pt of parts) {
        const w = pt.txt.length * 6 + 5;
        if (tx + w > SX + SW - 4) { tx = Math.round(SC - w / 2); y += 12; }
        fill(ctx, tx, y, w, 10, pt.bg); fill(ctx, tx, y, w, 1, 'rgba(255,255,255,0.25)');
        Font.draw(ctx, pt.txt, tx + 3, y + 1, pt.fg);
        tx += w + 3;
      }
      y += 13;
    }
    y += 2;
    const lines = wrapText(place.blurb(st), 21);
    const maxL = Math.floor((SY + SH - 30 - y) / 10);
    lines.slice(0, maxL).forEach((l, i) => Font.draw(ctx, l, SX + 7, y + i * 10, c.text));
    legend(ctx, st, true);
  }
  function isNear(st, p) {
    const pl = World.player; if (!pl || st.map !== 'town') return false;
    const [x0, z0, x1, z1] = p.rect;
    return pl.x > x0 - 8 && pl.x < x1 + 8 && pl.z > z0 - 8 && pl.z < z1 + 10;
  }
  function legend(ctx, st, arrows) {
    const c = UI.C, y = SY + SH - 24;
    fill(ctx, SX + 8, y - 4, SW - 16, 1, 'rgba(232,228,208,0.3)');
    helmet(ctx, SX + 10, y + 2, st);
    Font.draw(ctx, 'YOU', SX + 19, y + 1, c.text);
    if (goalPlace(st)) {
      const v = st.obj.voice;
      if (v === 'walter') { ctx.fillStyle = '#e04040'; for (let a = 0; a < 6.28; a += 0.5) ctx.fillRect(Math.round(SX + 56 + Math.cos(a) * 3.5), Math.round(y + 4 + Math.sin(a) * 3), 1, 1); }
      else if (v === 'evan') Font.draw(ctx, 'X', SX + 53, y + 1, '#6a8af8');
      else Font.draw(ctx, '★', SX + 53, y + 1, '#f4c030');
      Font.draw(ctx, 'GOAL', SX + 63, y + 1, c.text);
    }
    if (arrows) Font.center(ctx, '▲▼ CHOOSE A PLACE', SC, y + 11, c.dim);
  }

  function draw(ctx, m, t) {
    const st = Game.st;
    if (mode(st) !== 'town') { drawSpecial(ctx, st, t); drawPanel(ctx, st, null, t); return; }
    const list = ensureSel(m, st), place = list[m.mapSel];
    const c = cached(st);
    paper(ctx, st, t);
    ctx.drawImage(c.base, VX, VY);
    ctx.save(); ctx.beginPath(); ctx.rect(VX, VY, VW, VH); ctx.clip();
    drawWaves(ctx, st, t);
    ctx.drawImage(c.over, VX, VY);
    if (st.day >= 8 && st.tod === 'night') drawDark(ctx, st, t);
    drawGoal(ctx, st, t);
    if (place) drawSelection(ctx, st, place, t, m);
    drawPlayer(ctx, st, t);
    ctx.restore();
    drawPanel(ctx, st, place, t);
  }

  return { draw, update, PLACES, herePlace, goalPlace };
})();
