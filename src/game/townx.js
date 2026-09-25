'use strict';
// ---------------------------------------------------------------------------
// Hidden Bellwood: the places behind, under and above the town. The storm
// drain, the Tide Club treehouse, under the pier, the church bell tower,
// Rosa's back room and the attic of your own house; and the bigger insides
// of the Miller and Kessler houses. Items, documents, scripted bits and art;
// the maps are in src/maps/hidden.js.
// ---------------------------------------------------------------------------

Object.assign(ITEMS, {
  radio5: {
    name: "TAPE: 'RADIO EVAN #5'", icon: 'tape', cat: 'hood', inv: true, desc: 'A cassette in a sandwich bag, from a dry shelf in the storm drain. RADIO EVAN #5 - LIVE FROM THE TUNNELS.',
    verbs: () => ['PLAY'], use: async (S) => Story.playRadio5(S),
  },
  club_card: { name: 'TIDE CLUB CARD', icon: 'clubcard', cat: 'hood', desc: 'A membership card for the Tide Club, cut out of a cereal box. MEMBER #1: EVAN. MEMBER #2: TOBY. MEMBER #3 is blank.' },
  bottle_note: { name: 'MESSAGE IN A BOTTLE', icon: 'bottle', cat: 'hood', desc: 'A root beer bottle with a note rolled up inside, wedged between two pier pilings.', doc: 'bottle_note' },
  ruth_letter: { name: 'LETTER FROM RUTH', icon: 'letter', cat: 'hood', desc: 'From a hatbox in your attic. The envelope was never mailed.', doc: 'ruth_letter' },
});
COLLECTION_CATS.hood.items.push('radio5', 'club_card', 'bottle_note', 'ruth_letter');
EVIDENCE.push('timecard');

Object.assign(DOCS, {
  bottle_note: {
    title: 'TO WHOEVER FINDS THIS', style: 'child',
    pages: [
      'TO WHOEVER FINDS THIS\n\nMy name is Evan and I am 9. I live at 12 Maple St in Bellwood. My dad runs the aquarium.\n\nIf you find this write back!! Put it in the river by the pier and it will come back to me because the tide goes both ways.',
      'Facts about me:\n- I have an octopus (sort of)\n- I can hold my breath for 51 seconds\n- when I grow up I am going to live under the water\n\nPS if a long time has gone by and I am a grown up now, sorry. Say hi to me anyway.',
    ],
  },
  ruth_letter: {
    title: 'DEAR WALT', style: 'hand', paper: '#f0e8f0',
    pages: [
      'March 1986\n\nWalt -\n\nI\'m writing this down because when I say it out loud you go quiet and go to the aquarium.\n\nHe is six. He knocked the net into Tank 2 because he wanted to see the fish up close. That\'s all. He wanted to be close to the thing you love.',
      'You don\'t have to be so hard with him. The fish will forgive him. So will you, if you let yourself.\n\nWhen I\'m gone (and I know, I know, don\'t say it) please be gentle. He only wants to be where you are.\n\nAll my love,\nR.',
    ],
  },
});

Object.assign(Story, {
  // ---------------------------------------------------------------- tapes
  async playRadio5(S) {
    const T = (t) => S.say('evan_tape', t);
    S.sfx('tapeclick'); Sound.ambience(['tape', 'drips'], 0.2); S.stopMusic(0.3);
    await S.wait(0.8);
    await T('"THIS IS RADIO EVAN, episode five, coming to you LIVE from... the secret tunnels!"');
    await S.say('tape', '[a second kid, whispering] "Don\'t say where."');
    await T('"I\'m not saying where. Toby is here. Say hi Toby."');
    await S.say('tape', '"...hi."');
    await T('"The tunnels go under the whole town. We found a room down here that has a TV in it. Toby says it\'s a hobo\'s. I think it\'s a secret base."');
    await T('"If you get lost, follow the arrows. If there aren\'t any arrows, you\'re not lost yet. Over and out."');
    await S.say('tape', '[the other kid, very close to the microphone] "Evan. Evan, the TV\'s on."');
    S.sfx('tapeclick'); Sound.ambience([], 0.2);
    Game.applyAudio();
    S.flag('heardRadio5');
  },

  // ---------------------------------------------------------------- the storm drain
  async manhole(S) {
    const st = S.st;
    if (st.day < 3) { await S.say(null, 'A manhole cover: BELLWOOD STORM DRAIN 1964. It\'s very heavy.'); return; }
    if (!S.get('manholeSeen')) { S.flag('manholeSeen'); await S.say(null, 'The manhole cover has been pushed aside, just far enough for a kid to fit.'); await S.say(null, 'Chalk on the rim: an arrow, pointing down.'); }
    const c = await S.ask(null, 'Climb down into the storm drain?', ['CLIMB DOWN', 'NO']);
    if (c !== 0) return;
    await S.go('drain', 'manhole', { sfx: 'step' });
  },
  async outfallFromBeach(S) {
    const st = S.st;
    if (st.flags.outfallOpen) { await S.go('drain', 'outfall', { sfx: 'door' }); return; }
    await S.say(null, 'A big concrete pipe comes out onto the beach. There\'s a grate over the end, and a bolt, on the inside.');
    await S.say(null, 'Cold air is coming out of it. It smells like pennies.');
  },
  async outfallFromInside(S) {
    if (!S.get('outfallOpen')) { S.sfx('switch'); await S.say(null, 'You slide the bolt back. The grate swings out over the sand.'); S.flag('outfallOpen'); }
    await S.go('town', 'outfall', { sfx: 'door' });
  },
  async drainTV(S) {
    const st = S.st;
    await S.say(null, 'A TV on a crate, plugged into nothing. It\'s on.');
    if (st.day >= 7) { await S.say(null, 'It\'s showing the tunnel right outside this room. Somebody small is walking down it, towards the door, with a flashlight.'); await S.say(null, 'You look at the door. Nobody comes in.'); return; }
    await S.say(null, 'It\'s showing a program about the tides. The sound is down. The man on it keeps glancing at you.');
  },

  // ---------------------------------------------------------------- the treehouse
  async treeLadder(S) {
    const st = S.st;
    if (st.flags.clubIn) { await S.go('treehouse', 'hatch', { sfx: 'step' }); return; }
    await S.say(null, 'Boards nailed up the trunk make a ladder. At the top, a trapdoor with a sign: TIDE CLUB. MEMBERS ONLY. SAY THE PASSWORD.');
    await S.say(null, 'The password is a padlock with four numbers.');
    const code = await S.numpad(4, { title: 'PASSWORD' });
    if (code == null) return;
    if (code !== '0812') {
      S.sfx('locked'); S.flag('clubTries', (S.get('clubTries') || 0) + 1);
      await S.say(null, 'Nothing. Somewhere up in the leaves, somebody giggles. No. It\'s the wind.');
      if (S.get('clubTries') >= 2) await S.say(null, 'Scratched into the bottom board, very small: PASSWORD = MY BIRTHDAY. - E.');
      return;
    }
    S.sfx('click'); S.flag('clubIn');
    await S.say(null, 'The padlock pops open. You climb up.');
    await S.go('treehouse', 'hatch', { sfx: 'step' });
  },
  async periscope(S) {
    const st = S.st;
    await S.say(null, 'A periscope made of two milk cartons and a mirror. It points at the aquarium.');
    if (st.day >= 7) { await S.say(null, 'In the mirror, the aquarium. On the roof, in the glass dome, someone small is looking back at you through a telescope.'); return; }
    await S.say(null, 'In the mirror, the aquarium. You can just see the dome. The top of it glints.');
  },

  // ---------------------------------------------------------------- the bell tower
  async towerDoor(S) {
    const st = S.st;
    if (st.day < 3) { S.sfx('locked'); await S.say(null, 'BELL TOWER. CLOSED - LOOSE STEPS. The door is locked.'); return; }
    if (!S.get('towerSeen')) { S.flag('towerSeen'); await S.say(null, 'The little door to the bell tower is unlocked. The sign about loose steps has been taken down and put face-down on the floor.'); }
    await S.go('belltower', 'bottom', { sfx: 'door' });
  },
  async ringBell(S) {
    const st = S.st;
    if (st.day >= 8) {
      await S.say(null, 'You pull the rope. The bell swings. It doesn\'t make a sound.');
      await S.wait(1.2);
      S.sfx('bell', { far: true, pitch: 1.5, vol: 0.6 });
      await S.say(null, 'A second later, far away across town, something else rings instead. It sounds like it\'s underwater.');
      return;
    }
    const c = await S.ask(null, 'A rope hangs down from the bell. Pull it?', ['PULL', 'LEAVE IT']);
    if (c !== 0) return;
    S.sfx('bell'); World.shake && World.shake(0.3);
    await S.wait(1.6);
    if (!S.get('bellRung')) { S.flag('bellRung'); await S.say(null, 'BONNNG. The whole tower hums. Pigeons explode out of every arch.'); await S.say(null, 'Down in the town, a few people stop and look up. Then they go back to what they were doing, like nothing happened.'); return; }
    await S.say(null, 'BONNNG. Nobody looks up this time.');
  },

  // ---------------------------------------------------------------- Rosa's
  async rosasBack(S) {
    const st = S.st;
    if (st.day < 4) { S.sfx('locked'); await S.say(null, 'The back door of Rosa\'s. Locked. There\'s a brick next to it, like it\'s usually propped open.'); return; }
    if (!S.get('rosasSeen')) { S.flag('rosasSeen'); await S.say(null, 'The back door is propped open with a brick. Inside, a radio is playing.'); }
    await S.go('rosas', 'back', { sfx: 'door' });
  },

  // ---------------------------------------------------------------- the attic
  async atticCord(S) {
    const st = S.st;
    if (st.day < 5) { await S.say(null, 'A cord hangs from the ceiling: the attic hatch. It\'s painted shut.'); return; }
    if (st.flags.finalChase && !st.flags.underneath) { await S.say(null, 'The cord is swinging. There\'s no time. He\'s right behind you.'); return; }
    if (!S.get('atticOpen')) {
      await S.say(null, 'The paint around the attic hatch has cracked all the way round, like somebody pushed on it from the other side.');
      const c = await S.ask(null, 'Pull the cord?', ['PULL', 'NO']);
      if (c !== 0) return;
      S.sfx('door'); S.flag('atticOpen');
      await S.say(null, 'The hatch swings down. A folding ladder unfolds itself most of the way.');
    }
    await S.go('attic', 'hatch', { sfx: 'step' });
  },
  async atticWindow(S) {
    const st = S.st;
    if (st.tod === 'night' && st.day >= 6) { await S.say(null, 'Through the round window: the aquarium, far off, with its dome lit up.'); await S.say(null, 'Someone is standing in the dome, looking this way. When you wave, they wave, a little late.'); return; }
    await S.say(null, 'A round window, like a porthole. You can see all the way to the aquarium from here. That must be why it was put in.');
  },

  // ---------------------------------------------------------------- the pond, and the reflection under it
  async pondLean(S) {
    const st = S.st;
    if (st.day < 5) { await S.say(null, 'You lean over the pond. Your reflection leans over too, the way it should.'); return; }
    await S.say(null, 'You lean over the pond. Your reflection leans over too.');
    await S.say(null, st.day >= 7 ? 'Then it leans a little further than you do.' : 'It\'s wearing a striped shirt. You aren\'t.');
    const c = await S.ask(null, 'Lean closer?', ['CLOSER', 'STEP BACK']);
    if (c !== 0) return;
    S.sfx('splash', { vol: 0.5 });
    await S.go('reflection', 'in', { color: '#ffffff', fadeOut: 0.8, hold: 0.6, fadeIn: 1.0 });
  },
  async meetReflection(S) {
    const n = S.get('reflectionMet') || 0;
    S.flag('reflectionMet', n + 1);
    S.face('player', [-World.player.x * 2 - 0.01, World.player.z]);
    const E = (t) => S.say('evan', t);
    if (n === 0) {
      await E('Hi.');
      await E('You\'re standing on the wrong side of the water. Everybody does, the first time.');
      await E('It\'s nice down here. Nobody\'s looking for anybody.');
    } else if (n === 1) {
      await E('You came back.');
      await E('When you go up, don\'t let him tell you what happened. Make him remember it himself.');
    } else await E('Go on. They\'re waiting for you up there.');
    await S.go('town', 'pond', { color: '#ffffff', fadeOut: 1.0, hold: 0.5, fadeIn: 1.0 });
    await S.say(null, 'You\'re kneeling at the edge of the pond. Your sleeves are dry.');
  },
  // ---------------------------------------------------------------- the hallway mirror
  async hallMirror(S) {
    const st = S.st;
    if (st.day >= 8 && st.tod === 'night') { await S.say(null, 'In the mirror, the hallway is shorter.'); return; }
    if (st.day < 5 || !(st.tod === 'night' || st.tod === 'evening')) { await S.say(null, 'A mirror. The helmet takes up most of it.'); return; }
    await S.say(null, 'A mirror. The helmet takes up most of it.');
    await S.say(null, 'Behind you in the mirror, the hallway goes back much further than it does in real life. There are more doors.');
    const c = await S.ask(null, 'Step into the mirror?', ['STEP IN', 'NO']);
    if (c !== 0) return;
    S.flag('mirrorLoops', 0);
    await S.go('mirrorhall', 'in', { sfx: 'flicker', fadeOut: 0.6, fadeIn: 0.8 });
  },
  async mirrorLoop(S) {
    const n = (S.get('mirrorLoops') || 0) + 1;
    S.flag('mirrorLoops', n);
    await S.fade(1, 0.3);
    S.reload();
    World.player.x = 0; World.player.z = -1.6; World.player.face = 0;
    await S.fade(0, 0.5);
    await S.say(null, ['The hallway starts over. You\'re back at the mirror.', 'The hallway starts over again. The wallpaper is different.', 'Again. It\'s darker this time. There\'s a door at the end now.'][Math.min(n, 3) - 1]);
  },

  // ---------------------------------------------------------------- Mrs. Miller's quilt
  async millerQuilt(S) {
    const st = S.st;
    await S.say(null, 'A quilt on a big wooden frame, almost finished. Every square is cut from a child\'s shirt.');
    await S.say(null, 'Each square has a name stitched in the corner. TOBY. DANA. RAY. TOMMY. Dozens of them. Every kid in Bellwood.');
    if (st.day >= 6) { await S.say(null, 'One square is blue and white stripes, with no name on it. The needle is still in it, half-way through an E.'); return; }
    await S.say(null, 'There\'s one empty space left in the middle.');
  },
});

const TownX = {
  atlas() {
    const P = (w, h, fn) => { const p = new Pix(w, h); fn(p); return p; };
    const add = (n, p) => Atlas.add(n, p);
    const sign = (n, t, o) => Decals.sign(n, t, o);
    sign('sign_drain', ['STORM DRAIN', 'NO SWIMMING'], { bg: '#3a4048', fg: '#e8e8e0', border: '#8a9098' });
    sign('sign_tower', ['BELL TOWER'], { bg: '#5a3a2a', fg: '#f4e8c8', border: '#c8a060' });
    sign('sign_club', ['TIDE CLUB', 'MEMBERS ONLY'], { bg: '#8a6a3a', fg: ['#f4f0d0', '#c83a3a'], border: '#4a3a1a' });
    sign('club_rules', ['TIDE CLUB RULES', '1. NO GROWNUPS', '2. NO TELLING', '3. IF YOU SEE', '   THE DEEP YOU', '   HAVE TO SAY'], { bg: '#f4f0dc', fg: ['#c83a3a', '#2a3a8a', '#2a3a8a', '#2a3a8a', '#2a3a8a', '#2a3a8a'], border: '#b8b098', w: 96 });
    sign('rosa_menu', ['TODAY', 'SOUP OF THE DAY', 'SOUP OF THE DAY', 'SOUP OF THE DAY'], { bg: '#1a2a1a', fg: ['#f4e070', '#e8e8e0', '#e8e8e0', '#e8e8e0'], border: '#8a6a3a', w: 96 });
    // the pond sign, the way it reads from underneath
    const rev = sign('sign_pond_rev', 'DUCK POND', { bg: '#f4f0e0', fg: '#3a6ab8', border: '#3a6ab8', double: true });
    if (rev && rev.pix) { const src = rev.pix, q = new Pix(src.w, src.h); for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) q.set(src.w - 1 - x, y, src.get(x, y)); Atlas.replace('sign_pond_rev', q); }
    sign('grafitti_te', ['T + E', 'TIDE CLUB', '4 EVER'], { bg: '#6a6a66', fg: ['#e84a3a', '#f4e070', '#4ab8e8'], border: false });
    // the manhole, pushed aside
    add('manhole_open', P(32, 32, (p) => {
      p.fill([0, 0, 0, 0]); p.ellipse(13, 13, 11, 11, '#8a8a84'); p.ellipse(13, 13, 9.5, 9.5, '#030304'); p.ring(13, 13, 11, 11, '#5a5a56');
      p.ellipse(22, 21, 9.5, 9.5, '#7a7a7e'); p.ring(22, 21, 9.5, 9.5, '#4a4a4e'); p.ring(22, 21, 7, 7, '#9a9a9e'); for (let i = -6; i <= 6; i += 3) p.rect(16, 21 + i, 12, 1, '#5a5a5e');
      Closeups.tiny(p, 'BSD', 17, 19, '#3a3a3e'); p.line(6, 7, 11, 4, '#f0f0e8'); p.line(6, 7, 10, 8, '#f0f0e8');
    }));
    add('wall_hole', P(32, 40, (p) => {
      p.fill([0, 0, 0, 0]); const r = makeRng(77);
      for (let y = 0; y < 40; y++) { const w = 11 + Math.sin(y * 0.4) * 2 + r() * 2 - (y < 6 ? (6 - y) * 1.5 : 0); if (w > 0) p.rect(Math.round(16 - w), y, Math.round(w * 2), 1, '#050505'); }
      for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, rr = 11 + r() * 3; p.rect(Math.round(16 + Math.cos(a) * rr) - 2, Math.round(22 + Math.sin(a) * rr * 1.4) - 1, 4, 2, mixc('#8a4a3a', '#6a3a2a', r())); }
    }));
    add('drain_grate', P(32, 32, (p) => { p.fill('#0a0c0e'); p.ring(16, 16, 15, 15, '#6a6a66'); p.ring(16, 16, 14, 14, '#5a5a56'); for (let x = 4; x < 30; x += 4) p.rect(x, 3, 2, 26, '#4a4a48'); p.rect(26, 14, 4, 4, '#8a7a5a'); }));
    add('crate_tv', P(24, 20, (p) => { p.fill('#3a3a3e'); p.rect(2, 2, 16, 14, '#6a8ab0'); p.rect(4, 5, 12, 2, '#a8c8e8'); p.rect(4, 9, 8, 1, '#a8c8e8'); p.rect(19, 8, 3, 2, '#e84a3a'); p.frame(0, 0, 24, 20, '#1a1a1e'); }));
    add('pigeon', P(12, 10, (p) => { p.ellipse(6, 6, 4.5, 3, '#8a8a98'); p.ellipse(9.5, 3.5, 2, 2, '#9a9aa8'); p.set(10, 3, '#1a1a1a'); p.rect(11, 4, 1, 1, '#e8a040'); p.rect(4, 5, 3, 1, '#6a8a7a'); p.rect(5, 9, 1, 1, '#c85a4a'); p.rect(7, 9, 1, 1, '#c85a4a'); }));
    add('bell_big', P(40, 40, (p) => {
      p.rect(18, 0, 4, 4, '#3a2a1a'); p.tri(8, 34, 32, 34, 20, 4, '#9a7a3a'); p.ellipse(20, 8, 7, 5, '#9a7a3a'); p.rect(6, 30, 28, 6, '#8a6a2a'); p.ellipse(20, 36, 14, 3, '#5a4a1a');
      for (let y = 10; y < 32; y += 5) p.line(20 - (y - 4) * 0.4, y, 20 + (y - 4) * 0.4, y, '#b8943a'); p.rect(19, 36, 2, 4, '#3a3a3a');
      p.speckle(makeRng(40), ['#6a8a5a', '#b89a4a'], 0.1, 6, 4, 28, 32); p.outline('#1a1410');
    }));
    add('gears', P(48, 32, (p) => {
      const gear = (cx, cy, r, c) => { p.ellipse(cx, cy, r, r, c); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; p.rect(Math.round(cx + Math.cos(a) * r - 1), Math.round(cy + Math.sin(a) * r - 1), 3, 3, c); } p.ellipse(cx, cy, r * 0.35, r * 0.35, '#2a2a2a'); };
      p.fill('#1a1614'); gear(14, 16, 11, '#8a7a5a'); gear(33, 12, 8, '#9a8a6a'); gear(38, 26, 5, '#7a6a4a');
    }));
    add('clock_face', P(32, 32, (p) => { p.ellipse(16, 16, 15, 15, '#e8e0c8'); p.ring(16, 16, 15, 15, '#3a2a1a'); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; p.set(Math.round(16 + Math.cos(a) * 12), Math.round(16 + Math.sin(a) * 12), '#1a1a1a'); } p.line(16, 16, 11, 9, '#1a1a1a'); p.line(16, 16, 16, 5, '#1a1a1a'); p.line(16, 16, 22, 21, '#c83a3a'); }));
    add('clock_two', P(16, 16, (p) => { p.ellipse(8, 8, 7, 7, '#f4f0e0'); p.ring(8, 8, 7, 7, '#3a3a3a'); p.line(8, 8, 8, 3, '#1a1a1a'); p.line(8, 8, 11, 6, '#1a1a1a'); }));
    add('quilt', P(48, 32, (p) => {
      const cols = ['#c83a3a', '#3a6ab8', '#e8c040', '#6ab04a', '#e87ab0', '#8a5ab8', '#e8743a', '#4ab8b8'];
      for (let y = 0; y < 4; y++) for (let x = 0; x < 6; x++) { const i = (x * 7 + y * 3) % cols.length; p.rect(x * 8, y * 8, 8, 8, cols[i]); if ((x + y) % 2) for (let k = 1; k < 8; k += 3) p.rect(x * 8, y * 8 + k, 8, 1, shade(cols[i], 0.8)); p.set(x * 8 + 6, y * 8 + 6, '#f4f0e0'); p.set(x * 8 + 5, y * 8 + 6, '#f4f0e0'); }
      p.rect(24, 16, 8, 8, '#f4f4f0'); for (let k = 17; k < 24; k += 2) p.rect(24, k, 8, 1, '#3a6ab8');
      p.frame(0, 0, 48, 32, '#6a4a2a');
    }));
    add('dummy', P(16, 40, (p) => { p.rect(7, 30, 2, 8, '#3a3a3a'); p.rect(4, 38, 8, 2, '#2a2a2a'); p.ellipse(8, 14, 6, 9, '#6a4a6a'); p.rect(2, 16, 12, 14, '#6a4a6a'); p.rect(6, 2, 4, 5, '#c8b898'); p.rect(3, 6, 10, 2, '#6a4a6a'); for (let y = 10; y < 28; y += 4) p.set(8, y, '#e8d8a0'); p.outline('#1a1418'); }));
    add('paper_helmet', P(20, 20, (p) => { p.ellipse(10, 10, 9, 9, '#d8b048'); p.ellipse(10, 10, 5, 5, '#3a4a5a'); p.ring(10, 10, 5, 5, '#8a6a2a'); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; p.set(Math.round(10 + Math.cos(a) * 7.5), Math.round(10 + Math.sin(a) * 7.5), '#6a5020'); } p.speckle(makeRng(20), ['#b89038', '#e8c868', '#f4f0e0'], 0.12); p.outline('#1a1410'); }));
    add('crib', P(32, 24, (p) => { p.rect(0, 4, 2, 20, '#e8e0d0'); p.rect(30, 4, 2, 20, '#e8e0d0'); p.rect(0, 4, 32, 2, '#e8e0d0'); p.rect(0, 16, 32, 2, '#e8e0d0'); for (let x = 4; x < 30; x += 3) p.rect(x, 6, 1, 10, '#e8e0d0'); p.rect(2, 12, 28, 4, '#a8c8e8'); p.outline('#3a3440'); }));
    add('fish_mobile', P(24, 20, (p) => { p.line(12, 0, 12, 4, '#8a8a8a'); p.line(2, 4, 22, 4, '#8a8a8a'); for (const [x, y, c] of [[3, 10, '#e8743a'], [12, 14, '#4a9ae0'], [21, 9, '#e8c040']]) { p.line(x, 4, x, y - 2, '#8a8a8a'); p.ellipse(x, y, 3, 1.6, c); p.tri(x + 2, y, x + 4, y - 2, x + 4, y + 2, c); } }));
    add('bottle', P(12, 20, (p) => { p.rect(4, 0, 4, 6, '#5a3a1a'); p.rect(2, 6, 8, 13, '#6a4a2a'); p.rect(3, 8, 5, 9, '#e8e0c8'); p.rect(4, 1, 4, 2, '#c8b890'); p.set(3, 7, '#9a7a5a'); p.outline('#1a1410'); }));
    add('icon_bottle', P(16, 16, (p) => { p.rect(7, 1, 3, 4, '#5a3a1a'); p.rect(5, 5, 7, 10, '#6a4a2a'); p.rect(6, 7, 4, 6, '#e8e0c8'); p.outline('#1a1420'); }));
    add('icon_clubcard', P(16, 16, (p) => { p.rect(1, 4, 14, 9, '#e8c040'); p.rect(2, 5, 5, 7, '#c83a3a'); p.rect(8, 6, 6, 1, '#3a3a3a'); p.rect(8, 9, 4, 1, '#3a3a3a'); p.outline('#1a1420'); }));
    add('tire', P(20, 12, (p) => { p.ellipse(10, 6, 9.5, 5.5, '#1a1a1a'); p.ellipse(10, 6, 5, 2.6, '#6a6a60'); p.ring(10, 6, 8, 4.5, '#2a2a2a'); }));
    add('jar_row', P(40, 16, (p) => { const c = ['#c83a3a', '#e8a040', '#6ab04a', '#e8d070', '#8a3a5a']; for (let i = 0; i < 5; i++) { p.rect(1 + i * 8, 3, 6, 12, c[i]); p.rect(1 + i * 8, 1, 6, 2, '#b8b8c0'); p.rect(2 + i * 8, 7, 4, 3, '#f4f0e0'); } }));
    add('fridge_art', P(20, 16, (p) => { p.fill('#f4f4f0'); p.rect(2, 10, 16, 5, '#6ab04a'); p.ellipse(10, 6, 4, 4, '#e8c040'); p.rect(4, 7, 3, 4, '#c83a3a'); p.line(14, 4, 17, 9, '#3a6ab8'); p.frame(0, 0, 20, 16, '#b8b8b0'); }));
    // close-ups
    const CU = Closeups.add;
    CU('radio5', (p, h) => {
      p.rect(8, 10, 48, 30, '#2a2a30'); p.rect(12, 14, 40, 12, '#f4f0e0'); h.tinyC(p, 'RADIO EVAN', 32, 15, '#c83a3a'); h.tinyC(p, '#5 TUNNELS', 32, 21, '#2a3a8a');
      p.ellipse(22, 32, 4, 4, '#e8e8e0'); p.ellipse(42, 32, 4, 4, '#e8e8e0'); p.ellipse(22, 32, 1.5, 1.5, '#2a2a30'); p.ellipse(42, 32, 1.5, 1.5, '#2a2a30');
      p.frame(4, 6, 56, 38, '#b8c8d8'); p.rect(4, 6, 56, 2, '#d8e4f0'); p.line(6, 10, 14, 8, '#e8f0f8'); p.line(50, 40, 58, 36, '#e8f0f8'); p.rect(26, 8, 12, 1, '#c83a3a');
    });
    CU('club_card', (p, h) => {
      p.rect(8, 8, 48, 32, '#e8c040'); p.rect(8, 8, 48, 8, '#c83a3a'); h.tinyC(p, 'TIDE CLUB', 32, 10, '#f4f0e0');
      h.tiny(p, '1 EVAN', 12, 20, '#2a2a2a'); h.tiny(p, '2 TOBY', 12, 27, '#2a2a2a'); h.tiny(p, '3', 12, 34, '#2a2a2a'); p.rect(18, 38, 20, 1, '#8a6a2a');
      p.ellipse(46, 28, 6, 6, '#4a9ae0'); p.tri(40, 28, 36, 24, 36, 32, '#4a9ae0'); p.set(48, 27, '#1a1420');
      p.speckle(h.rng(12), ['#d8b030'], 0.1, 8, 16, 48, 24);
    });
    CU('bottle_note', (p, h) => {
      p.rect(10, 18, 40, 16, '#6a4a2a'); p.rect(50, 21, 10, 10, '#5a3a1a'); p.rect(58, 22, 4, 8, '#c8b890');
      p.rect(14, 21, 30, 10, '#e8e0c8'); h.scribble(p, 16, 23, 26, 3, '#2a3a8a', 5, 3);
      p.rect(12, 19, 36, 2, [255, 255, 255, 90]); p.speckle(h.rng(21), ['#7a5a3a'], 0.05, 10, 18, 40, 16);
    });
    CU('ruth_letter', (p, h) => {
      h.paperSheet(p, 8, 4, 40, 40, '#f0e8f0', { lines: 5, top: 10 }); h.tiny(p, 'WALT -', 11, 7, '#5a3a6a'); h.scribble(p, 11, 15, 34, 5, '#5a3a6a', 8, 5);
      h.tiny(p, 'R.', 36, 38, '#5a3a6a'); p.rect(44, 20, 16, 12, '#e8dcc8'); p.tri(44, 20, 60, 20, 52, 27, '#d8ccb8'); p.ellipse(52, 26, 2, 2, '#a83a4a');
    });
  },
};
