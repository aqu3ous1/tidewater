'use strict';
// ---------------------------------------------------------------------------
// The rest of the aquarium: the upper floor (aq2), and the two levels under
// it (aqb1, aqb2). Art, items, documents and the scripted bits live here;
// the maps are in src/maps/aqupper.js and src/maps/aqlower.js.
// ---------------------------------------------------------------------------

Object.assign(ITEMS, {
  film_reel: { name: 'FILM REEL', icon: 'reel', cat: 'aquarium', desc: 'A 16mm reel in a dented tin: OUR FRIENDS IN THE SEA (1976). The tin says PROPERTY OF BELLWOOD AQUARIUM - DO NOT REMOVE.' },
  keeper_badge: { name: 'JUNIOR KEEPER BADGE', icon: 'badge', cat: 'aquarium', desc: 'A laminated badge: BELLWOOD AQUARIUM - JUNIOR KEEPER. The name is EVAN V. The photo has been cut out.' },
  walkie: { name: 'WALKIE-TALKIE', icon: 'walkie', desc: 'A kid\'s walkie-talkie. Somebody wrote CH 12 on the back in marker. The batteries still work, somehow.', verbs: () => ['TALK'], use: async (S) => Story.walkieTalk(S) },
  freight_key: { name: 'FREIGHT KEY', icon: 'key_small', desc: 'A key on a heavy plastic tag: FREIGHT - B2.' },
  freezer_key: { name: 'FREEZER KEY', icon: 'key_small', desc: 'A small key on a loop of wire. The tag says WALK-IN.' },
  personnel: { name: 'PERSONNEL FILE', icon: 'doc_old', desc: 'A manila folder from the records vault, two floors down.', doc: 'personnel' },
  blueprint: { name: 'BLUEPRINT: THE DEEP', icon: 'blueprint', desc: 'A rolled blueprint from the planning office. It has been unrolled and rolled up again many times.', doc: 'blueprint' },
  timecard: { name: 'TIME CARD - W. VANE', icon: 'timecard', desc: 'A punch card from the time clock in B1. Week of 8/11/91. The ink has gone brown.', doc: 'timecard' },
  receipt_hs: { name: 'HARBOR SUPPLY RECEIPT', icon: 'receipt', desc: 'A receipt from the workshop in B1, folded very small and pushed behind the pegboard.', doc: 'receipt_hs' },
});
COLLECTION_CATS.aquarium.items.push('film_reel', 'keeper_badge');

Object.assign(DOCS, {
  personnel: {
    title: 'PERSONNEL - VOLUNTEER', style: 'typed', paper: '#e8dcb0',
    pages: [
      'NAME: VANE, EVAN W.\nPOSITION: JUNIOR KEEPER (UNPAID)\nAGE: 10\nSTARTED: JUNE 1990\nSUPERVISOR: W. VANE\n\nDUTIES: feeding log, penguin buckets, answering questions from visitors (he is very good at this).',
      'NOTES:\n6/90 - Eager. Knows every fish by name.\n11/90 - Talks too much during the shows.\n3/91 - Found in the service tunnel. Again.\n7/91 - Asks about THE DEEP constantly.\n\nSTATUS: ________\n\n(the status line has been left blank. It has been erased more than once.)',
    ],
  },
  blueprint: {
    title: 'THE DEEP - LEVEL B2', style: 'typed', paper: '#c8d8f0', ink: '#1a2a6a',
    pages: [
      'BELLWOOD AQUARIUM EXPANSION\nTHE DEEP - 40,000 GAL.\nSHEET 4 OF 9\n\nPIT FOOTING: pour in two stages.\nSTAGE 1 - 7/91\nSTAGE 2 - "AS NEEDED"',
      'In the corner of the sheet, somebody has drawn a small square in red pencil, right in the middle of the pit.\n\nThe square has been traced over so many times the paper is soft there.\n\nNext to it, in pencil: 8/15.',
    ],
  },
});

Object.assign(DOCS, {
  timecard: {
    title: 'TIME CARD', style: 'typed', paper: '#e8e0c8', ink: '#5a3a2a',
    pages: [
      'VANE, W.     WEEK OF 8/11/91\n\nMON 8/12   IN  6:00   OUT  2:30\n           (took the afternoon)\nTUE 8/13   IN  6:02   OUT  6:05\nWED 8/14   IN  6:00   OUT  6:40\n           IN 10:52 PM\nTHU 8/15   (no punch)   OUT  7:58 PM',
      'FRI 8/16   IN  5:31   OUT  9:40 PM\nSAT 8/17   IN  5:30   OUT 10:15 AM\n\nNo days missed.\n\nIn the margin, in pencil, very small:\n"worked the whole time"',
    ],
  },
  receipt_hs: {
    title: 'HARBOR SUPPLY CO.', style: 'typed', paper: '#f4f2ea', ink: '#3a3a4a',
    pages: ['HARBOR SUPPLY CO.\n14 WHARF RD - BELLWOOD\n\n08/15/91    06:48 AM\n\nSHOVEL, SQUARE        1\nTROWEL, FINISH        1\nWORK GLOVES           2\nBLEACH, 1 GAL         3\n\nTOTAL          $41.17\nCASH\n\nHAVE A NICE DAY'],
  },
});

Object.assign(Story, {
  // ---------------------------------------------------------------- the upper floor
  async projector(S) {
    const st = S.st;
    if (st.flags.filmThreaded) { await S.say(null, 'The projector is clicking along. Through the little window you can see the film on the screen downstairs.'); return; }
    if (!S.has('film_reel')) { await S.say(null, 'A big old film projector, pointed through a little window at the theater screen. It\'s empty.'); return; }
    const c = await S.ask(null, 'A big old film projector. Thread the film?', ['YES', 'NO']);
    if (c !== 0) return;
    S.flag('filmThreaded'); S.sfx('tapeclick');
    await S.say(null, 'You thread the film. It\'s easier than it should be, like your hands already knew how.');
    await S.say(null, 'The projector starts clicking. Through the little window, the screen lights up.');
  },
  async theaterScreen(S) {
    const st = S.st;
    if (!st.flags.filmThreaded) { await S.say(null, 'A movie screen. Painted on the wall above it: OUR FRIENDS IN THE SEA - SHOWS AT 11, 1 & 3.'); return; }
    await S.say(null, 'You sit down. The film is already playing.');
    const frames = [
      ['film_1', 'OUR FRIENDS IN THE SEA. 1976. The picture jumps. The music is a little too slow.'],
      ['film_2', 'Children press their faces against a tank. One of them waves at the camera.'],
      ['film_3', 'A young man in a brass diving helmet waves from inside the big tank. The narrator says: "Keeper Walter Vane, saying hello!"'],
      ['film_4', 'THE END.'],
    ];
    if (st.day >= 6) frames.push(['film_5', 'The film keeps going after THE END. A boy in a striped shirt, inside a tank, waving. There is no water in the tank.']);
    for (const [ph, text] of frames) await UI.inspect({ name: '', photo: ph, desc: text });
    if (st.day >= 6) await S.say(null, 'The reel flaps around and around. Nobody upstairs stops it.');
  },
  async telescope(S) {
    const st = S.st;
    await S.say(null, 'An old brass telescope, pointed out through the glass of the dome, down at the town.');
    if (st.day >= 7) { await S.say(null, 'Through it: your house. Someone is standing in your front yard, looking up at the aquarium. Looking up at you.'); await S.say(null, 'When you look again, the yard is empty.'); return; }
    await S.say(null, 'Through it: your house. A light is on in the upstairs window.');
    await S.say(null, 'Your house doesn\'t have an upstairs window.');
  },
  async walkieTalk(S) {
    const st = S.st;
    S.sfx('tapeclick');
    await S.say(null, 'You press the button. "Radio Evan, come in. Over."');
    const deep = /^aqb2|^basement/.test(st.map);
    if (deep || (st.day >= 7 && st.tod === 'night')) {
      S.sfx('tapeclick', { vol: 0.5 });
      await S.wait(1.2);
      await S.say('evan_tape', '...over.');
      if (!st.flags.walkieHeard) { S.flag('walkieHeard'); await S.say(null, 'It was very quiet. It came from somewhere below you.'); }
      return;
    }
    await S.say(null, 'Static. Channel 12 is empty.');
  },

  // ---------------------------------------------------------------- B1: maintenance
  async freezerDoor(S) {
    if (!S.st.inv.includes('freezer_key')) { S.sfx('locked'); await S.say(null, 'WALK-IN FREEZER. It\'s locked.'); await S.say(null, 'There\'s frost around the handle. It\'s August.'); return; }
    S.sfx('click'); await S.say(null, 'The little key on the wire loop fits.');
    S.flag('freezerOpen'); S.sfx('door'); S.reload();
  },
  async freezerCake(S) {
    await S.say(null, 'A bakery box on the top shelf, frozen to the metal. Inside: a birthday cake with blue icing.');
    await S.say(null, 'HAPPY 11TH EVAN. One slice is gone. The candles are still in it, burned halfway down.');
    if (S.st.day >= 6) await S.say(null, 'Somebody has written the date on the box in marker, the way you do with fish: 8/12/91. KEEP.');
  },
  async timeClock(S) {
    const st = S.st;
    if (st.inv.includes('timecard') || st.day < 4) { await S.say(null, 'A time clock. It still ticks. The rack beside it holds a few blank punch cards.'); if (st.day < 4) await S.say(null, 'One slot at the very top has a card in it, turned around backwards.'); return; }
    await S.say(null, 'A time clock and a rack of punch cards. Most slots are empty. One card has been turned around backwards.');
    await S.give('timecard'); await S.read('timecard');
  },
  async freightCall(S) {
    const st = S.st;
    if (!st.inv.includes('freight_key')) {
      await S.say(null, 'FREIGHT ELEVATOR - B1 / B2. There\'s a keyhole where the call button should be.');
      await S.say(null, 'Through the gap between the doors, the shaft goes down further than it should.');
      return;
    }
    const c = await S.ask(null, 'Turn the freight key and go down to B2?', ['GO DOWN', 'NOT YET']);
    if (c !== 0) return;
    S.sfx('switch');
    await S.go('aqb2', 'elevator', { sfx: 'thud', fadeOut: 0.6, hold: 1.6, fadeIn: 0.9 });
  },
  async freightUp(S) {
    const c = await S.ask(null, 'Take the freight elevator back up to B1?', ['GO UP', 'STAY']);
    if (c !== 0) return;
    S.sfx('switch');
    await S.go('aqb1', 'elevator', { sfx: 'thud', fadeOut: 0.6, hold: 1.2, fadeIn: 0.8 });
  },
  async divingSuit(S) {
    const st = S.st;
    await S.say(null, 'The diving suit from the old film, on a stand. Heavy canvas, lead boots, brass bolts around the collar.');
    await S.say(null, 'The helmet is missing. A card is tucked into the empty collar: HELMET - ON LOAN.');
    if (st.day >= 6) await S.say(null, 'On the back of the card, in a child\'s handwriting: TO WHO?');
  },
  // ---------------------------------------------------------------- B2: the Deep
  async deepWindow(S) {
    const st = S.st;
    await S.say(null, 'THE DEEP. From down here you\'re looking into the bottom of Tank 6.');
    await S.say(null, 'The water is dark and completely still. The floor of the tank is a slab of pale concrete, newer than everything around it.');
    if (st.day >= 8) { await S.say(null, 'Someone small is standing on the concrete, with his back to you.'); await S.say(null, 'He\'s been standing there a long time. He is waiting for somebody to find him.'); return; }
    if (st.day >= 6) { await S.say(null, 'A thin line of bubbles comes up out of the concrete. Just one line. Like breathing.'); return; }
    await S.say(null, 'There are no fish in it. There were never any fish in it.');
  },
  async crawlIn(S) {
    await S.say(null, 'A panel at the bottom of the wall is loose. Behind it, a crawlspace, just big enough for a kid.');
    const c = await S.ask(null, 'Crawl in?', ['CRAWL IN', 'NO']);
    if (c !== 0) return;
    S.sfx('scrub', { vol: 0.6 });
    await S.fade(1, 0.5); World.player.x = 23.2; World.player.z = 1; World.player.face = Math.PI / 2; await S.fade(0, 0.6);
    if (!S.get('crawled')) { S.flag('crawled'); await S.say(null, 'It smells like dust and crayons.'); }
  },
  async crawlOut(S) {
    S.sfx('scrub', { vol: 0.6 });
    await S.fade(1, 0.5); World.player.x = 16.6; World.player.z = 2; World.player.face = -Math.PI / 2; await S.fade(0, 0.6);
  },
  async bricks(S) {
    const st = S.st;
    await S.say(null, 'A doorway, bricked up. The bricks are newer than the wall around them, and not very straight.');
    await S.say(null, 'Someone scratched something into the mortar while it was still wet: SORRY.');
    if (st.day >= 6) await S.say(null, 'You put your ear to the bricks. On the other side, very quietly, a TV is on.');
  },
  async roomTV(S) {
    const st = S.st;
    await S.say(null, 'An old TV on a chair. It\'s showing a game.');
    await S.say(null, 'On the screen, a kid in a brass diving helmet is standing in a small room, in front of a TV.');
    await S.say(null, 'You wave. The kid on the screen waves back, a little late.');
    if (!S.get('tvRoomSeen')) { S.flag('tvRoomSeen'); await S.wait(0.6); await S.say('walter_voice', 'You\'re not supposed to see this part.'); }
  },
});

const AqX = {
  atlas() {
    const P = (w, h, fn) => { const p = new Pix(w, h); fn(p); return p; };
    const add = (n, p) => Atlas.add(n, p);
    const sign = (n, t, o) => Decals.sign(n, t, o);
    sign('sign_upper', 'UPPER GALLERY ↑', { bg: '#1a2a5a', fg: '#f4e070', border: '#8aa0e0' });
    sign('sign_b1', ['STAIRS', 'B1 - MAINTENANCE'], { bg: '#e8c040', fg: '#1a1a1a', border: '#1a1a1a' });
    sign('sign_theater', 'THEATER', { bg: '#6a1a2a', fg: '#f4e070', border: '#e8c040', double: true });
    sign('sign_jelly', 'JELLIES', { bg: '#2a1a4a', fg: '#e8a0f0', border: '#a870d8' });
    sign('sign_learn', 'LEARNING ROOM', { bg: '#3a8a4a', fg: '#f4f4ee', border: '#f4f4ee' });
    sign('sign_kelp', 'KELP TUNNEL', { bg: '#1a5a3a', fg: '#c8f0a0', border: '#8ac870' });
    sign('screen_title', ['OUR FRIENDS', 'IN THE SEA', '1976'], { bg: '#f4f2ea', fg: ['#2a3a6a', '#2a3a6a', '#8a8a8a'], border: false, w: 96, h: 44 });
    sign('chalk_deep', ['WHAT LIVES IN THE DEEP?', '', 'ANGLERFISH', 'GIANT SQUID', 'NOBODY KNOWS', 'EVAN'], { bg: '#2a3a2a', fg: '#e8e8e0', border: '#8a6a44', w: 104, h: 64 });
    sign('plaque_dome', ['THE VANE', 'OBSERVATORY', '1976'], { bg: '#b8943a', fg: '#3a2a10', border: '#6a5020' });
    sign('qbox_note', ['WHERE DO FISH GO', 'WHEN THEY DIE?', '- E.V.'], { bg: '#f4f0dc', fg: '#2a3a8a', border: '#b8b098' });
    // stairwell doorways (you can see the steps)
    const stairsDoor = (n, up) => add(n, P(32, 48, (p) => {
      p.fill('#1a1a22'); p.frame(0, 0, 32, 48, '#6a6a70'); p.frame(1, 1, 30, 46, '#8a8a90');
      for (let i = 0; i < 8; i++) { const y = up ? 44 - i * 5 : 8 + i * 5; const w = 26 - (up ? i * 1.5 : (7 - i) * 1.5); p.rect(Math.round(16 - w / 2), y, Math.round(w), 3, shade('#8a8480', up ? 1 - i * 0.08 : 0.5 + i * 0.08)); }
      p.rect(3, 6, 2, 38, '#b8b8c0');
    }));
    stairsDoor('door_up', true); stairsDoor('door_down', false);
    // theater film frames: grainy, sepia, flickering
    const frame = (n, draw) => add(n, P(64, 48, (p) => {
      p.fill('#b8a888'); draw(p); p.speckle(makeRng(n.length * 3), ['#8a7a5a', '#d8c8a8', '#6a5a3a'], 0.08);
      p.map((c) => { const g = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11; return [g * 1.08 + 10, g * 0.96, g * 0.76, 255]; });
      p.line(20, 0, 22, 47, [60, 50, 40, 255]); p.frame(0, 0, 64, 48, '#1a1410');
    }));
    frame('film_1', (p) => { p.rect(0, 0, 64, 48, '#5a8aa8'); for (let i = 0; i < 6; i++) { p.ellipse(10 + i * 9, 14 + (i % 3) * 9, 4, 2.5, '#e8943a'); p.tri(6 + i * 9, 14 + (i % 3) * 9, 3 + i * 9, 11 + (i % 3) * 9, 3 + i * 9, 17 + (i % 3) * 9, '#e8943a'); } p.rect(0, 40, 64, 8, '#c8b890'); });
    frame('film_2', (p) => { p.rect(0, 0, 64, 30, '#5a8aa8'); p.rect(0, 30, 64, 18, '#4a4a4a'); for (let i = 0; i < 4; i++) { p.ellipse(10 + i * 14, 30, 5, 5, '#e8c8a8'); p.rect(6 + i * 14, 34, 8, 14, ['#c83a3a', '#3a6ab8', '#e8c040', '#6ac850'][i]); } p.rect(34, 24, 2, 6, '#e8c8a8'); });
    frame('film_3', (p) => { p.rect(0, 0, 64, 48, '#4a7a98'); p.ellipse(32, 20, 10, 10, '#d9b85a'); p.ellipse(32, 21, 5, 5, '#9ad0e8'); p.rect(24, 30, 16, 14, '#6a6a70'); p.rect(40, 26, 8, 3, '#6a6a70'); p.line(47, 26, 50, 20, '#6a6a70'); for (let i = 0; i < 5; i++) p.ellipse(36 + i * 3, 10 - i * 2, 1, 1, '#e8f0f8'); });
    frame('film_4', (p) => { p.rect(0, 0, 64, 48, '#2a2418'); Closeups.tiny(p, 'THE END', 18, 20, '#f4f0e0'); });
    frame('film_5', (p) => { p.rect(0, 0, 64, 48, '#3a3a3a'); p.frame(10, 6, 44, 36, '#8a8a8a'); p.rect(11, 7, 42, 34, '#4a4a4a'); p.ellipse(32, 20, 4, 4, '#e8c8a8'); p.rect(29, 16, 7, 2, '#6a4a2a'); p.rect(28, 25, 8, 12, '#ecece4'); for (let y = 26; y < 37; y += 3) p.rect(28, y, 8, 1, '#3a6ab8'); p.line(36, 26, 40, 20, '#e8c8a8'); });
    // tank tops, the hatch, film cans
    add('hatch_t6', P(32, 32, (p) => { p.fill('#5a5e64'); p.frame(0, 0, 32, 32, '#2a2c30'); p.frame(3, 3, 26, 26, '#7a7e84'); for (let i = 0; i < 4; i++) p.ellipse(4 + (i % 2) * 24, 4 + (i >> 1) * 24, 1.2, 1.2, '#2a2c30'); Closeups.tiny(p, 'T6', 12, 10, '#e8c040'); p.rect(12, 18, 8, 7, '#b8943a'); p.ring(16, 18, 3, 3, '#8a8a8a'); }));
    add('hatch_open', P(32, 32, (p) => { p.fill('#050506'); p.frame(0, 0, 32, 32, '#2a2c30'); p.frame(1, 1, 30, 30, '#5a5e64'); for (let y = 4; y < 30; y += 5) p.rect(4, y, 3, 1, '#3a3a3e'); }));
    add('film_can', P(16, 8, (p) => { p.ellipse(8, 4, 7.5, 3.5, '#8a8a90'); p.ring(8, 4, 7.5, 3.5, '#5a5a60'); p.ellipse(8, 4, 2, 1, '#3a3a40'); }));
    add('cal_91', P(24, 30, (p) => { p.fill('#f4f4f0'); p.rect(0, 0, 24, 8, '#c83a3a'); Closeups.tiny(p, 'AUG', 6, 1, '#f4f4f0'); for (let i = 0; i < 31; i++) p.rect(1 + (i % 7) * 3, 10 + Math.floor(i / 7) * 4, 2, 2, i < 14 ? '#3a3a3a' : '#b8b8b8'); for (let i = 0; i < 14; i++) p.line(1 + (i % 7) * 3, 10 + Math.floor(i / 7) * 4, 2 + (i % 7) * 3, 11 + Math.floor(i / 7) * 4, '#c83a3a'); p.frame(0, 0, 24, 30, '#8a8a80'); }));
    // the view from the dome: Bellwood all the way round (the panorama wraps)
    const pano = (n, night) => add(n, P(192, 48, (p) => {
      const rng = makeRng(night ? 91 : 76);
      for (let y = 0; y < 48; y++) p.rect(0, y, 192, 1, night ? mixc('#02030a', '#1a2440', Math.min(1, y / 30)) : mixc('#6aa4dc', '#e4ecee', Math.min(1, y / 30)));
      if (night) { for (let i = 0; i < 70; i++) p.set(Math.floor(rng() * 192), Math.floor(rng() * 24), rng() < 0.3 ? '#f4f0d0' : '#8a90b0'); p.ellipse(150, 9, 4, 4, '#e8e4c8'); p.ellipse(151.5, 8, 3.2, 3.6, '#060810'); }
      else for (let i = 0; i < 5; i++) { const cx = 20 + i * 40 + rng() * 10; p.ellipse(cx, 8 + rng() * 6, 9, 2.5, '#f4f6f8'); p.ellipse(cx + 5, 7 + rng() * 4, 6, 2.5, '#f8f8f8'); }
      // hills, then the river, then the town
      const hill = night ? '#0a1018' : '#6a8a78', far = night ? '#0e1420' : '#8aa4a0';
      for (let x = 0; x < 192; x++) { const h1 = 26 + Math.sin(x * 0.05) * 3 + Math.sin(x * 0.13 + 1) * 1.5; p.rect(x, Math.round(h1), 1, 48, far); const h2 = 30 + Math.sin(x * 0.07 + 2) * 2.5; p.rect(x, Math.round(h2), 1, 48, hill); }
      p.rect(0, 40, 192, 3, night ? '#101c30' : '#6a9ac0'); p.rect(0, 40, 192, 1, night ? '#2a3a5a' : '#a8c8e0');
      const wall = night ? ['#1a1c24', '#22242e', '#16181e'] : ['#e8e0cc', '#c8b8a0', '#d8d8d0', '#b8c8d0'];
      const roof = night ? ['#0a0a10', '#101018'] : ['#8a3a2a', '#5a5a6a', '#6a4a3a', '#3a4a5a'];
      for (let x = 2; x < 190;) {
        const w = 5 + Math.floor(rng() * 6), h = 3 + Math.floor(rng() * 4), base = 40;
        p.rect(x, base - h, w, h, wall[Math.floor(rng() * wall.length)]);
        const rc = roof[Math.floor(rng() * roof.length)]; p.tri(x - 1, base - h, x + w, base - h, x + w / 2, base - h - 3, rc);
        if (night && rng() < 0.45) p.set(x + 1 + Math.floor(rng() * (w - 2)), base - h + 1 + Math.floor(rng() * (h - 1)), rng() < 0.2 ? '#f0e0a0' : '#c8a060');
        else if (!night) p.set(x + 1 + Math.floor(rng() * (w - 2)), base - 2, '#4a5a6a');
        x += w + 1 + Math.floor(rng() * 3);
      }
      // landmarks: the water tower, the church bell tower, the school, the smokestack out past the edge of town
      const L = night ? '#0c0e14' : '#9a9a90';
      p.rect(63, 22, 1, 12, L); p.rect(69, 22, 1, 12, L); p.ellipse(66, 21, 5, 3, night ? '#14161e' : '#b8c0c0'); if (!night) Closeups.tiny(p, 'B', 65, 19, '#3a4a6a');
      p.rect(96, 20, 5, 17, night ? '#16161e' : '#d8d0c0'); p.tri(95, 20, 102, 20, 98.5, 12, night ? '#0c0c12' : '#5a4a3a'); p.rect(97, 23, 3, 3, night ? '#e8c060' : '#3a3a3a');
      p.rect(110, 30, 18, 7, night ? '#1c1a1a' : '#b86a4a'); p.rect(117, 27, 4, 3, night ? '#1c1a1a' : '#b86a4a');
      p.rect(140, 16, 3, 20, night ? '#12100e' : '#6a5a4a'); p.rect(139, 15, 5, 2, night ? '#12100e' : '#4a3a2a');
      if (!night) for (let i = 0; i < 4; i++) p.ellipse(142 + i * 2, 13 - i * 2, 2 + i * 0.5, 1.5, '#c8c8c0');
      p.speckle(makeRng(7), [night ? '#060810' : '#5a7a6a'], 0.04, 0, 34, 192, 6);
    }));
    pano('dome_day', false); pano('dome_night', true);
    add('icon_reel', P(16, 16, (p) => { p.ellipse(8, 8, 7, 7, '#9a9aa0'); for (let i = 0; i < 4; i++) p.ellipse(8 + Math.cos(i * 1.57) * 3.5, 8 + Math.sin(i * 1.57) * 3.5, 1.5, 1.5, '#3a3a40'); p.ellipse(8, 8, 1, 1, '#3a3a40'); p.outline('#1a1420'); }));
    add('icon_walkie', P(16, 16, (p) => { p.rect(5, 3, 7, 12, '#3a3a40'); p.rect(9, 0, 2, 4, '#2a2a2a'); p.rect(6, 5, 5, 4, '#6a8a6a'); for (let y = 10; y < 14; y += 2) p.rect(6, y, 5, 1, '#8a8a8a'); p.outline('#1a1420'); }));
    add('icon_blueprint', P(16, 16, (p) => { p.rect(2, 3, 12, 10, '#3a5ab8'); for (let i = 3; i < 13; i += 3) p.line(3, i + 1, 13, i + 1, '#8ab0f0'); p.rect(8, 6, 3, 3, '#e83a3a'); p.outline('#1a1420'); }));
    add('icon_timecard', P(16, 16, (p) => { p.rect(3, 1, 10, 14, '#e8e0c8'); p.rect(3, 1, 10, 3, '#c8a878'); for (let y = 6; y < 14; y += 2) { p.rect(4, y, 4, 1, '#8a6a5a'); p.rect(9, y, 3, 1, '#8a6a5a'); } p.rect(5, 10, 6, 1, '#c83a3a'); p.outline('#1a1420'); }));

    // ---------------------------------------------------------------- B1 and B2
    const yellow = { bg: '#e8c040', fg: '#1a1a1a', border: '#1a1a1a' }, steel = { bg: '#3a4048', fg: '#e8e8e0', border: '#8a9098' };
    sign('sign_b1wall', ['B1', 'MAINTENANCE'], yellow);
    sign('sign_filter', 'FILTRATION', steel);
    sign('sign_boiler', ['BOILER', 'KEEP DOOR SHUT'], { bg: '#8a2a1a', fg: '#f4e8d0', border: '#f4e8d0' });
    sign('sign_fishk', 'FISH KITCHEN', { bg: '#f4f4ee', fg: '#2a5a8a', border: '#2a5a8a' });
    sign('sign_walkin', 'WALK-IN', { bg: '#c8e0f0', fg: '#1a3a6a', border: '#1a3a6a' });
    sign('sign_quar', ['QUARANTINE', 'DO NOT FEED'], { bg: '#f4f4ee', fg: ['#c83a3a', '#2a2a2a'], border: '#c83a3a' });
    sign('sign_exhib', 'OLD EXHIBITS', { bg: '#5a4a3a', fg: '#e8d8b0', border: '#b8a070' });
    sign('sign_shop', ['WORKSHOP', 'W.V.'], steel);
    sign('sign_freight', ['FREIGHT', 'B1 - B2'], yellow);
    sign('sign_b2', ['B2', 'THE DEEP'], { bg: '#0a1a3a', fg: '#8ab0e0', border: '#4a6a9a' });
    sign('sign_gallery', ['THE DEEP - VIEWING GALLERY', 'OPENING SPRING 1992'], { bg: '#0a1a3a', fg: ['#f4e070', '#8ab0e0'], border: '#f4e070', double: true });
    sign('sign_plan', 'PLANNING', steel);
    sign('sign_vault', 'RECORDS', steel);
    sign('sign_life', ['LIFE SUPPORT', 'T6'], { bg: '#1a3a2a', fg: '#a8f0a0', border: '#6ac870' });
    sign('log_backwash', ['BACKWASH LOG', '8/13  T1-T5 OK', '8/14  T1-T5 OK', '8/15  T6 DRAINED', '8/16  T6 REFILLED'], { bg: '#f4f0e0', fg: ['#1a1a1a', '#3a3a8a', '#3a3a8a', '#c83a3a', '#3a3a8a'], border: '#8a8a80', w: 110 });
    sign('board_feed', ['FEEDING TODAY', 'T1 SMELT  T2 KRILL', 'T3 SQUID  T4 CLAMS', 'T5 CRAB   T6 ---'], { bg: '#f8f8f4', fg: ['#c83a3a', '#2a3a8a', '#2a3a8a', '#2a3a8a'], border: '#a8a8a0', w: 116 });
    sign('quar_log', ['QUARANTINE', '8/15/91', 'ALL SPECIMENS OUT', 'OF T6 - "MAINT."'], { bg: '#f4f0dc', fg: '#2a2a2a', border: '#b8b098', w: 100 });
    // the freight elevator doors
    add('door_freight', P(40, 40, (p) => {
      p.fill('#6a7078'); p.frame(0, 0, 40, 40, '#2a2c30'); p.rect(19, 2, 2, 38, '#2a2c30');
      for (let x = 0; x < 40; x += 6) p.tri(x, 34, x + 3, 34, x - 3, 40, '#1a1a1a'); p.rect(0, 33, 40, 1, '#1a1a1a');
      for (let x = 2; x < 40; x += 6) p.tri(x, 34, x + 3, 34, x, 40, '#e8c040');
      p.rect(7, 8, 8, 6, '#1a2028'); p.rect(25, 8, 8, 6, '#1a2028'); p.frame(7, 8, 8, 6, '#3a4048'); p.frame(25, 8, 8, 6, '#3a4048');
      p.speckle(makeRng(40), ['#7a8088', '#5a6068', '#8a6a4a'], 0.12, 0, 0, 40, 33);
    }));
    // a doorway bricked up by somebody who wasn't a bricklayer
    add('bricks_new', P(32, 48, (p) => {
      p.fill('#8a8478'); const r = makeRng(33);
      for (let y = 0; y < 48; y += 4) for (let x = (y / 4) % 2 ? -3 : 0; x < 32; x += 7) p.rect(x + 1 + Math.floor(r() * 2), y + 1, 5, 3, mixc('#c8a890', '#b89078', r()));
      p.frame(0, 0, 32, 48, '#5a5048'); Closeups.tiny(p, 'SORRY', 6, 30, '#6a6258');
    }));
    add('timeclock', P(20, 28, (p) => {
      p.rect(2, 0, 16, 18, '#8a7a5a'); p.frame(2, 0, 16, 18, '#3a3020'); p.ellipse(10, 7, 5, 5, '#f4f0e0'); p.ring(10, 7, 5, 5, '#3a3020'); p.line(10, 7, 10, 3, '#1a1a1a'); p.line(10, 7, 13, 8, '#1a1a1a');
      p.rect(6, 14, 8, 2, '#2a2a2a'); p.rect(0, 20, 20, 8, '#5a5048'); for (let i = 0; i < 5; i++) p.rect(1 + i * 4, 19, 3, 6, i === 0 ? '#c8a878' : '#e8e0c8');
    }));
    add('concrete_bag', P(16, 20, (p) => {
      p.rect(1, 2, 14, 17, '#c8bca0'); p.rect(0, 4, 16, 14, '#d0c4a8'); p.rect(2, 7, 12, 5, '#c83a3a'); Closeups.tiny(p, 'HC', 5, 8, '#f4f0e0');
      p.rect(3, 14, 10, 1, '#8a8068'); p.speckle(makeRng(16), ['#b8ac90', '#e0d8c0'], 0.2); p.outline('#3a3428');
    }));
    add('bag_empty', P(16, 8, (p) => { p.rect(0, 2, 16, 6, '#c8bca0'); p.rect(3, 3, 6, 3, '#c83a3a'); p.rect(10, 1, 4, 2, '#b8ac90'); p.outline('#3a3428'); }));
    add('wheelbarrow', P(28, 16, (p) => {
      p.tri(2, 3, 22, 3, 18, 11, '#3a6a4a'); p.tri(2, 3, 6, 11, 18, 11, '#3a6a4a'); p.rect(4, 3, 16, 2, '#9a9488'); p.rect(20, 5, 7, 1, '#6a5a4a');
      p.ellipse(8, 12, 3, 3, '#2a2a2a'); p.ellipse(8, 12, 1, 1, '#8a8a8a'); p.rect(15, 10, 1, 5, '#4a4a4a'); p.outline('#1a1a1a');
    }));
    add('diving_suit', P(20, 40, (p) => {
      p.rect(9, 30, 2, 8, '#4a4a4a'); p.rect(5, 38, 10, 2, '#3a3a3a');
      p.rect(5, 8, 10, 14, '#8a6a4a'); p.rect(3, 9, 3, 11, '#7a5a3a'); p.rect(14, 9, 3, 11, '#7a5a3a'); p.rect(5, 22, 4, 10, '#7a5a3a'); p.rect(11, 22, 4, 10, '#7a5a3a');
      p.rect(4, 31, 5, 3, '#5a5a60'); p.rect(11, 31, 5, 3, '#5a5a60');
      p.rect(3, 5, 14, 4, '#c8a040'); for (let x = 4; x < 17; x += 3) p.set(x, 7, '#6a5020'); p.ellipse(10, 5, 4, 1.5, '#1a1410');
      p.speckle(makeRng(20), ['#9a7a5a', '#6a4a2a'], 0.15, 3, 8, 14, 24); p.outline('#1a1410');
    }));
    add('shark_fg', P(48, 20, (p) => {
      p.ellipse(22, 11, 18, 5, '#8a9aa8'); p.ellipse(22, 13, 16, 3, '#e8e8e4'); p.tri(36, 10, 47, 3, 44, 12, '#7a8a98'); p.tri(36, 11, 44, 12, 46, 18, '#7a8a98');
      p.tri(20, 7, 26, 7, 22, 0, '#7a8a98'); p.set(8, 10, '#1a1a1a'); for (let i = 0; i < 4; i++) p.line(12 + i * 2, 9, 12 + i * 2, 12, '#6a7a88');
      p.rect(4, 12, 6, 1, '#f4f4f0'); p.speckle(makeRng(48), ['#f4f0e0', '#5a6a78'], 0.06, 4, 6, 34, 10); p.outline('#1a1a24');
    }));
    add('walter_cutout', P(20, 44, (p) => {
      p.rect(9, 40, 2, 4, '#8a7a5a');
      p.rect(5, 16, 10, 16, '#3a6a8a'); p.rect(3, 17, 3, 10, '#3a6a8a'); p.rect(14, 17, 3, 10, '#3a6a8a'); p.rect(6, 32, 3, 8, '#3a3a3a'); p.rect(11, 32, 3, 8, '#3a3a3a');
      p.ellipse(10, 11, 4, 5, '#e8c8a8'); p.rect(6, 5, 8, 3, '#5a3a2a'); p.set(8, 11, '#1a1a1a'); p.set(12, 11, '#1a1a1a'); p.rect(8, 14, 4, 1, '#8a3a3a');
      p.rect(8, 19, 4, 3, '#f4e070'); p.rect(1, 0, 18, 4, '#f4f4f0'); Closeups.tiny(p, 'HI KIDS', 2, 0, '#c83a3a');
      p.outline('#3a3020');
    }));
    add('cake_box', P(20, 14, (p) => {
      p.rect(0, 4, 20, 10, '#f4f0e8'); p.rect(0, 4, 20, 1, '#d8d0c0'); p.ellipse(10, 8, 7, 3, '#f8f8f4'); p.rect(3, 8, 14, 4, '#f8f8f4'); p.rect(3, 11, 14, 1, '#6a9ae0');
      p.tri(10, 8, 17, 7, 17, 11, '#e8e0d0'); p.rect(6, 5, 1, 3, '#e87070'); p.rect(9, 4, 1, 3, '#70a0e0'); p.rect(12, 5, 1, 3, '#e8c040');
      p.speckle(makeRng(14), [[230, 240, 255, 180]], 0.12); p.outline('#6a7a8a');
    }));
    add('frost_hi', P(32, 16, (p) => {
      p.fill('#c8dcf0'); p.speckle(makeRng(32), ['#eef4fc', '#aac0d8'], 0.4);
      const L = (x0, y0, x1, y1) => p.line(x0, y0, x1, y1, '#5a6e8c');
      L(4, 4, 4, 11); L(8, 4, 8, 11); L(4, 7, 8, 7); L(11, 4, 11, 11); L(17, 4, 17, 11); L(17, 4, 20, 6); L(20, 6, 20, 9); L(20, 9, 17, 11); L(23, 11, 25, 4); L(25, 4, 27, 11); L(24, 8, 26, 8);
    }));
    add('cal_pour', P(24, 30, (p) => {
      p.fill('#f4f4f0'); p.rect(0, 0, 24, 8, '#3a6ab8'); Closeups.tiny(p, 'AUG', 6, 1, '#f4f4f0');
      for (let i = 0; i < 31; i++) p.rect(1 + (i % 7) * 3, 10 + Math.floor(i / 7) * 4, 2, 2, '#9a9a9a');
      p.rect(13, 14, 2, 2, '#e8a0c8'); p.ring(20, 15, 2.5, 2, '#c83a3a'); p.ring(20, 15, 3, 2.5, '#c83a3a'); p.set(19, 15, '#1a1a1a');
      p.rect(19, 14, 2, 2, '#3a3a3a'); p.frame(0, 0, 24, 30, '#8a8a80');
    }));
    add('clip_missing', P(24, 30, (p) => {
      p.fill('#e4e0d0'); Closeups.tiny(p, 'BOY 10', 1, 1, '#1a1a1a'); Closeups.tiny(p, 'MISSING', 1, 7, '#1a1a1a');
      p.rect(2, 13, 9, 11, '#8a8a80'); p.ellipse(6.5, 17, 2.5, 3, '#c8c0b0'); p.rect(4, 21, 5, 3, '#5a5a5a');
      for (let y = 14; y < 28; y += 2) p.rect(13, y, 9, 1, '#9a968a'); p.rect(2, 26, 9, 1, '#9a968a');
      p.speckle(makeRng(24), ['#d4ceb8'], 0.2); p.frame(0, 0, 24, 30, '#b8b098');
    }));
    add('crawl_panel', P(20, 14, (p) => { p.fill('#8a8a84'); p.frame(0, 0, 20, 14, '#4a4a48'); for (let y = 3; y < 12; y += 2) p.rect(3, y, 14, 1, '#3a3a38'); p.rect(0, 11, 5, 3, '#1a1a1a'); p.ellipse(2, 2, 1, 1, '#5a5a58'); p.ellipse(17, 2, 1, 1, '#5a5a58'); }));
    add('pegboard', P(40, 24, (p) => {
      p.fill('#b8946a'); for (let y = 2; y < 24; y += 3) for (let x = 2; x < 40; x += 3) p.set(x, y, '#6a4a2a');
      const ghost = (x, y, w, h) => p.frame(x, y, w, h, '#8a6a4a');
      p.rect(3, 3, 2, 14, '#6a6a70'); p.rect(1, 3, 6, 3, '#8a8a90'); ghost(9, 3, 4, 16); p.rect(15, 4, 8, 2, '#c83a3a'); p.rect(18, 6, 2, 8, '#8a5a3a');
      p.ellipse(28, 8, 4, 4, '#3a3a3a'); p.ellipse(28, 8, 2, 2, '#b8946a'); p.rect(34, 3, 2, 18, '#6a5a4a'); p.rect(32, 18, 6, 4, '#8a8a90');
    }));
    add('chalk_hs', P(48, 24, (p) => {
      p.fill([0, 0, 0, 0]); const C = [230, 230, 220, 220];
      Closeups.tiny(p, 'HIDE AND SEEK', 2, 1, C); Closeups.tiny(p, 'EVAN', 2, 9, C); Closeups.tiny(p, 'DAD', 2, 17, C);
      for (let i = 0; i < 14; i++) p.rect(20 + i * 2 + Math.floor(i / 5), 9, 1, 5, C); for (let i = 0; i < 3; i++) p.line(20 + i * 11, 13, 29 + i * 11, 9, C);
      Closeups.tiny(p, '0', 20, 17, C);
    }));
    add('chalk_arrow', P(16, 16, (p) => { const C = [230, 230, 220, 200]; p.line(8, 14, 8, 2, C); p.line(8, 2, 4, 6, C); p.line(8, 2, 12, 6, C); p.line(9, 14, 9, 3, C); }));
    add('chalk_door', P(24, 40, (p) => {
      const C = [230, 230, 220, 210]; p.frame(3, 6, 18, 33, C); p.ellipse(17, 23, 1.5, 1.5, C);
      Closeups.tiny(p, 'SECRET', 0, 0, C); Closeups.tiny(p, 'WAY', 7, 12, C); Closeups.tiny(p, 'OUT', 7, 18, C); p.line(5, 30, 19, 30, C); Closeups.tiny(p, 'NOT', 7, 32, [200, 200, 190, 170]);
    }));
    add('gauge_t6', P(16, 16, (p) => { p.ellipse(8, 8, 7, 7, '#f4f0e0'); p.ring(8, 8, 7, 7, '#3a3a3a'); p.line(8, 8, 13, 5, '#c83a3a'); Closeups.tiny(p, 'T6', 3, 10, '#1a1a1a'); }));

    // ---------------------------------------------------------------- close-ups for the new items
    const CU = Closeups.add;
    CU('film_reel', (p, h) => {
      p.ellipse(28, 24, 22, 20, '#8a8a92'); p.ellipse(28, 24, 20, 18, '#a8a8b0');
      for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; p.ellipse(28 + Math.cos(a) * 11, 24 + Math.sin(a) * 10, 5, 4.5, '#3a3240'); }
      p.ellipse(28, 24, 3, 3, '#5a5a62'); p.ellipse(28, 24, 1.4, 1.4, '#1a1420');
      p.ring(28, 24, 16, 14, '#5a4a3a'); p.ring(28, 24, 17, 15, '#6a5a44');
      p.rect(44, 30, 18, 3, '#6a5a44'); for (let x = 45; x < 62; x += 3) p.set(x, 31, '#c8b890');
      h.tag(p, 42, 6, 'KEEP', '#f0e6c8', { w: 20 });
    });
    CU('keeper_badge', (p, h) => {
      p.rect(10, 6, 44, 36, '#f4f4ee'); p.rect(10, 6, 44, 9, '#2a6aa8'); h.tinyC(p, 'BELLWOOD', 32, 8, '#f4f4ee');
      p.rect(14, 18, 14, 17, '#1a1a1a'); p.frame(14, 18, 14, 17, '#8a8a8a'); p.line(14, 18, 27, 34, '#3a3a3a');
      h.tiny(p, 'JR.', 31, 19, '#2a6aa8'); h.tiny(p, 'KEEPR', 31, 25, '#2a6aa8'); h.tiny(p, 'EVAN', 31, 33, '#1a1a1a');
      p.rect(29, 2, 6, 5, '#b8b8c0'); p.ellipse(32, 3, 2, 1.4, '#6a6a70');
      p.speckle(h.rng(5), [[255, 255, 255, 120]], 0.05, 10, 6, 44, 36);
    });
    CU('walkie', (p, h) => {
      p.rect(22, 10, 20, 34, '#3a3a44'); p.rect(34, 2, 3, 9, '#2a2a2a'); p.ellipse(35.5, 2, 2, 1.4, '#c83a3a');
      p.rect(25, 13, 14, 9, '#7a9a6a'); h.tiny(p, 'CH12', 26, 15, '#2a3a2a');
      for (let y = 25; y < 40; y += 3) p.rect(25, y, 14, 1, '#5a5a66'); p.rect(19, 18, 3, 10, '#2a2a30');
      p.rect(24, 40, 16, 2, '#e8c040'); h.tiny(p, 'EV', 28, 36, '#e8c040');
    });
    CU('freight_key', (p, h) => { h.key(p, 4, 10, '#b8b8c0', { long: 22, teeth: [2, 3, 1, 3] }); p.rect(40, 24, 18, 18, '#e8c040'); p.frame(40, 24, 18, 18, '#8a6a10'); h.tinyC(p, 'FRT', 49, 28, '#1a1a1a'); h.tinyC(p, 'B2', 49, 35, '#c83a3a'); p.line(38, 16, 44, 24, '#6a6a6a'); });
    CU('freezer_key', (p, h) => { h.key(p, 6, 14, '#c8b060', { long: 18, teeth: [1, 2, 1] }); p.ring(12, 22, 8, 6, '#8a8a8a'); h.tag(p, 30, 30, 'WALK-IN', '#dfe8f0', { w: 32 }); p.speckle(h.rng(3), [[230, 240, 255, 200]], 0.06, 6, 14, 40, 12); });
    CU('personnel', (p, h) => {
      p.rect(6, 6, 50, 38, '#d8b878'); p.rect(6, 4, 20, 4, '#d8b878'); h.paperSheet(p, 10, 9, 44, 32, '#f0ead6', { lines: 4, top: 12 });
      h.tiny(p, 'VANE, E.', 12, 11, '#2a2a2a'); p.rect(40, 14, 11, 13, '#c8c0b0'); p.frame(40, 14, 11, 13, '#8a8478');
      h.tiny(p, 'STATUS', 12, 33, '#2a2a2a'); p.rect(38, 36, 14, 1, '#2a2a2a'); p.speckle(h.rng(7), ['#d8d0bc'], 0.3, 36, 32, 16, 5);
    });
    CU('blueprint', (p, h) => {
      p.rect(4, 6, 56, 36, '#2a4a9a'); for (let x = 4; x < 60; x += 6) p.rect(x, 6, 1, 36, '#3a5aaa'); for (let y = 6; y < 42; y += 6) p.rect(4, y, 56, 1, '#3a5aaa');
      p.frame(12, 12, 40, 24, '#c8d8f8'); p.frame(18, 16, 28, 16, '#c8d8f8'); p.rect(30, 22, 5, 5, '#e83a3a'); p.frame(29, 21, 7, 7, '#c82a2a');
      h.tiny(p, 'THE DEEP', 6, 36, '#c8d8f8'); h.tiny(p, '8/15', 38, 30, '#d8d8d8');
      p.ellipse(60, 24, 4, 18, '#1a3a8a'); p.ellipse(4, 24, 4, 18, '#3a5aaa');
    });
    CU('timecard', (p, h) => {
      h.paperSheet(p, 16, 2, 30, 44, '#e8e0c8'); p.rect(16, 2, 30, 6, '#c8a878'); h.tiny(p, 'VANE W', 20, 3, '#3a2a1a');
      for (let i = 0; i < 6; i++) { h.tiny(p, ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][i], 18, 11 + i * 6, '#6a5a4a'); p.rect(32, 12 + i * 6, 5, 2, '#5a3a2a'); if (i !== 3) p.rect(39, 12 + i * 6, 5, 2, '#5a3a2a'); }
      p.rect(39, 24, 5, 2, '#c83a3a'); p.rect(38, 21, 7, 1, '#c83a3a');
    });
    CU('receipt_hs', (p, h) => {
      h.paperSheet(p, 20, 2, 24, 44, '#f4f2ea', { fold: true }); for (let x = 20; x < 44; x += 3) p.tri(x, 46, x + 3, 46, x + 1.5, 44, [0, 0, 0, 0]);
      h.tinyC(p, 'HARBOR', 32, 4, '#3a3a4a'); h.tinyC(p, '8/15', 32, 11, '#3a3a4a'); h.scribble(p, 22, 18, 20, 5, '#8a8a9a', 11, 4);
      h.tinyC(p, '41.17', 32, 38, '#3a3a4a');
    });
  },
};
