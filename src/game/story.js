'use strict';
// ---------------------------------------------------------------------------
// STORY — part 1: systems, days 1 through 6.
//
// Day 1  Aug 8   moving in                     (normal)
// Day 2  Aug 9   first day at work             (normal)
// Day 3  Aug 10  errands, the town             (tiny oddities)
// Day 4  Aug 11  the sandwich                  (something is off)
// Day 5  Aug 12  a birthday card for Evan      (the missing child)
// Day 6  Aug 13  Walter's office               (Walter is hiding something)
// Day 7  Aug 14  Walter is dead. That night, he isn't.
// Day 8  Aug 15  the memory
// ---------------------------------------------------------------------------

const DATES = { 1: 'AUGUST 8', 2: 'AUGUST 9', 3: 'AUGUST 10', 4: 'AUGUST 11', 5: 'AUGUST 12', 6: 'AUGUST 13', 7: 'AUGUST 14', 8: 'AUGUST 15' };

const Story = {
  musicOverride: undefined,
  phoneRinging: false,
  _phoneT: 0,

  // ================================================================ lifecycle
  atlas() {
    Decals.sign('lbl_sort', ['SORTING', 'CART'], { bg: '#f4f0e0', fg: '#e8743a', border: '#e8743a' });
  },

  begin() {
    const st = Game.st;
    st.day = 1; st.tod = 'morning';
    Story.musicOverride = undefined;
    Game.enterMap('town', 'intro');
    Script.run(async (S) => {
      await S.card('DAY 1', DATES[1], { dur: 2.6 });
      await S.fade(0, 0.8);
      await Story.day1Intro(S);
    });
  },

  resume() {
    const st = Game.st;
    Story.musicOverride = undefined;
    Story.phoneRinging = false;
    const m = State.getMeta();
    Game.enterMap(st.map || 'house', st.spawn || 'bed');
    if (st.pos && st.map === 'house' && st.spawn === 'bed') { /* spawn at bed is fine */ }
    Script.run(async (S) => {
      await S.fade(0, 0.8);
      if (st.checkpoint) await Story.resumeCheckpoint(S);
      else if (st.obj) await UI.banner(st.obj.text, st.obj.voice);
      if (m.quitMidGhost && st.flags.ghostMet && !st.flags.saidQuit) {
        m.quitMidGhost = false; State.saveMeta();
        st.flags.pendingQuitLine = true;
      }
    });
  },

  async startDay(S, n) {
    const st = S.st;
    st.day = n; st.tod = 'morning';
    st.flags.canSleep = false;
    Story.phoneRinging = false;
    Story.musicOverride = undefined;
    const spawn = st.flags.sleptEvanBed && n === 8 ? null : 'bed';
    if (spawn) Game.enterMap('house', 'bed'); else Game.enterMap('evanroom', 'front');
    // autosave at the start of every day
    Game.saveTo(st.slot);
    await S.card('DAY ' + n, n === 8 ? DATES[8] : DATES[n], { dur: 2.8, fg: n >= 8 ? '#c8c8b8' : '#e8e4d8' });
    await S.fade(0, 0.8);
    const f = Story['day' + n];
    if (f) await f.call(Story, S);
  },

  async sleep(S) {
    const st = S.st;
    const n = st.day;
    S.stopMusic(1.2);
    await S.fade(1, 1.4);
    Sound.ambience([], 1);
    await S.wait(0.8);
    // things that happen in the dark between days
    if (n === 3) { S.sfx('knock', { n: 3, gap: 0.5, echo: true }); await S.wait(2.4); await S.card('', '', { dur: 1.5 }); }
    if (n === 4) { S.sfx('knock', { n: 2, gap: 0.8, vol: 0.6 }); await S.wait(2); }
    if (n === 6) { await S.wait(1.5); S.sfx('thud', { far: true, vol: 0.5 }); await S.wait(2.5); }
    if (st.obj && st.obj.id && st.obj.id.startsWith('sleep') || (st.obj && st.obj.id && st.obj.id.startsWith('home'))) S.done(st.obj.id);
    const c = await S.ask(null, 'Save your game?', ['YES', 'NO']);
    if (c === 0) { st.day = n + 1; st.tod = 'morning'; st.map = 'house'; st.spawn = 'bed'; await Menus.saveSlots('save', 'DAY ' + (n + 1)); }
    await Story.startDay(S, n + 1);
  },

  onEnterMap(id) {
    const st = Game.st;
    if (!st) return;
    // phone rings when you walk into the house on certain nights
    if (id === 'house' && st.tod === 'night' && ((st.day === 5 && !st.flags.phone5) || (st.day === 6 && !st.flags.phone6))) Story.startRinging();
    if (id !== 'house') Story.phoneRinging = false;
    const hook = Story['enter_' + id];
    if (hook) Script.run((S) => hook.call(Story, S));
  },

  startRinging() { Story.phoneRinging = true; Story._phoneT = 0.5; },

  update(dt) {
    const st = Game.st;
    if (Story.phoneRinging && st.map === 'house') {
      Story._phoneT -= dt;
      if (Story._phoneT <= 0) { Story._phoneT = 3.4; Sound.sfx('phone', { vol: 0.9 }); }
    }
    if (Story.update2) Story.update2(dt);
  },

  // ================================================================ helpers
  hold(label, secs) {
    return UI.push({
      type: 'hold', t: 0, idle: 0, label, secs,
      update(m, dt) {
        if (Input.held('a')) { m.t += dt; m.idle = 0; if (Math.random() < dt * 5) Sound.sfx('scrub', { vol: 0.8 }); if (m.t >= m.secs) UI.close(m, true); }
        else { m.idle += dt; if (m.idle > 1.6 || Input.pressed('b')) { Input.eat('b'); UI.close(m, false); } }
      },
      draw(ctx, m) {
        const x = 90, y = 196, w = 140;
        UI.panel(ctx, x, y, w, 30);
        Font.center(ctx, m.label + (m.t < 0.05 ? '  (HOLD Z)' : ''), 160, y + 5, UI.C.hi);
        UI.fill(ctx, x + 10, y + 17, w - 20, 6, '#1a1e38');
        UI.fill(ctx, x + 10, y + 17, Math.round((w - 20) * clamp(m.t / m.secs, 0, 1)), 6, '#8ad0f0');
      },
    });
  },
  explored(S, key) {
    const st = S.st;
    if (st.day !== 3 || !S.isObj('explore')) return;
    if (S.get('ex_' + key)) return;
    S.flag('ex_' + key);
    const n = ['school', 'church', 'park', 'pier', 'laundry'].filter((k) => S.get('ex_' + k)).length;
    if (n >= 3) Script.run(async (S2) => { await S2.wait(0.3); await Story.endExplore(S2); });
  },
  async endExplore(S) {
    if (!S.isObj('explore')) return;
    S.done('explore');
    S.setTod('evening');
    await S.obj('home3', 'GO HOME AND GO TO SLEEP.');
    S.flag('canSleep');
  },
  walterSpot(S, spot) { S.flag('walterSpot', spot); World.removeNpc('walter'); Game.spawnNpcs(); },
  playtimeWords(sec) {
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    if (sec < 60) return 'Less than a minute. That\'s all it took';
    const hs = h === 1 ? 'one hour' : h > 1 ? h + ' hours' : '';
    const ms = m === 1 ? 'one minute' : m + ' minutes';
    return hs ? hs + ' and ' + ms : ms;
  },
  realTime() { const d = new Date(); let h = d.getHours(); const m = d.getMinutes(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return { str: h + ':' + String(m).padStart(2, '0') + ' ' + ap, late: d.getHours() < 5 || d.getHours() >= 23 }; },

  // ================================================================ music
  townMusic(st) {
    if (Story.musicOverride !== undefined) return Story.musicOverride;
    if (st.day >= 7 || st.tod === 'night') return null;
    if (st.tod === 'evening') return 'evening';
    return st.day >= 6 ? 'evening' : 'town';
  },
  houseMusic(st) { if (st.day >= 6 || st.tod === 'night') return null; return st.tod === 'evening' ? 'home' : 'home'; },
  aquariumMusic(st) {
    if (Story.musicOverride !== undefined) return Story.musicOverride;
    if (st.flags.lightsOut) return null;
    if (st.day >= 8) return 'aquarium';
    if (st.day === 7 && st.tod === 'night') return st.flags.ghostMet ? null : 'aquarium';
    if (st.day === 6) return 'aquarium';
    return 'aquarium';
  },

  // ================================================================ WALTER (alive)
  walterWhere(st) {
    const f = st.flags;
    if (st.day >= 7) return null;
    if (st.day === 1 && !f.walterIntro) return { map: 'town', x: 21, z: 19.6, face: 'w' };
    const spot = f.walterSpot;
    const spots = {
      hall: { map: 'aquarium', x: -10.5, z: -1.5, face: 'w' },
      lobby: { map: 'aquarium', x: 2.2, z: 7.8, face: 's' },
      kitchen: { map: 'aquarium', x: 23.3, z: -34.5, face: 'w' },
      office: null,
      asleep: { map: 'aquarium', x: 31.5, z: -38.25, face: 's', fixedFace: true, returnFace: false },
      penguins: { map: 'aquarium', x: -18.5, z: -11, face: 'w' },
      gone: null,
    };
    if (spot && spot in spots) return spots[spot];
    if (st.tod === 'evening' || st.tod === 'night') return null;
    if (st.day === 1 && st.tod === 'afternoon' && !f.hired) return spots.hall;
    return spots.lobby;
  },

  async onGive(S, id) {
    const st = S.st;
    if (/^shell\d$/.test(id) && ['shell1', 'shell2', 'shell3'].every((k) => st.found[k]) && !st.flags.shellsDone) {
      S.flag('shellsDone'); S.sideDone('shells');
      if (st.day <= 6) S.side('shellsWalter', 'BRING THE BLUE SHELLS TO WALTER.');
    }
  },
  async walterTalk(S, n) {
    const st = S.st, f = st.flags, W = (t) => S.say('walter', t);
    if (f.walterSpot === 'asleep') return Story.officeDesk(S);
    if (f.shellsDone && !f.shellReward && st.day >= 2) {
      S.flag('shellReward'); S.sideDone('shellsWalter');
      await W('Are those... blue shells? All three?');
      await W('Well, I\'ll be. You know, Evan used to collect those. He had a whole jar.');
      await S.wait(0.8);
      await W('...Here. You earned this.');
      await S.give('fc10');
      if (st.day < 5) S.flag('walterSlip');
      await S.wait(0.4);
    }
    if (st.day === 1) {
      if (!f.hired) return Story.tour(S);
      await W('Go on home and get some rest. Nine o\'clock tomorrow.');
      await W('And don\'t let the house scare you. Old houses make noises. That\'s all it is.');
      return;
    }
    const d = st.day;
    if (d === 2) return Story.walter2(S);
    if (d === 3) return Story.walter3(S);
    if (d === 4) return Story.walter4(S);
    if (d === 5) return Story.walter5(S);
    if (d === 6) return Story.walter6(S);
    await W('Hm? Oh. Hello.');
  },

  // ================================================================ DAY 1
  async day1Intro(S) {
    const st = S.st;
    const w = World.npc('walter');
    await S.wait(0.6);
    if (w) { await S.walk('walter', 18.8, 19.4, { speed: 1.8 }); S.face('walter', 'player'); }
    const W = (t) => S.say('walter', t);
    await W('Well, hello there! You must be {name}.');
    await W('I\'m Walter. Walter Vane. I\'m the one who rented you the house.');
    await W('Welcome to Bellwood!');
    await W('Here\'s your key. The front door sticks a little. Just give it a push.');
    await S.give('key_house');
    await W('Use the ARROW KEYS to walk around. Hold X if you\'re in a hurry.');
    await W('Press Z to talk to people or look at things. Press TAB to see what you\'re carrying.');
    await W('Your objective will be written there too, in case you forget. I forget things all the time.');
    await W('I run the aquarium down on Harbor Road. You\'ll see the big fish out front. Can\'t miss it.');
    await W('Come by when you\'re settled. I\'ve got a proposition for you.');
    S.flag('walterIntro');
    await S.obj('gohome', 'GO INSIDE YOUR NEW HOUSE.');
    if (w) { const n = World.npc('walter'); n.path = [[16, 22], [2, 22], [1, 0]]; n.speed = 2.2; n.onArrive = () => { if (World.npc('walter') === n) World.removeNpc('walter'); }; }
  },
  async enter_house(S) {
    const st = S.st, f = st.flags;
    if (f.version && S.isObj('gohome')) { S.done('gohome'); await Endings.versionHouse(S); return; }
    if (st.day === 1 && S.isObj('gohome')) {
      S.done('gohome');
      await S.wait(0.3);
      await S.say(null, 'Your new house. It smells like dust and somebody else\'s soap.');
      await S.obj('unpack', 'UNPACK YOUR BOXES (0/3)');
    }
    if (st.day === 1 && S.isObj('fridge')) { /* nothing */ }
    if (st.day === 4 && S.isObj('home4')) { S.done('home4'); await S.obj('sleep4', 'GO TO SLEEP.'); S.flag('canSleep'); }
    if (st.day === 5 && S.isObj('home5')) { S.done('home5'); S.setTod('night'); await S.obj('sleep5', 'GO TO SLEEP.'); S.flag('canSleep'); if (!S.get('phone5')) { await S.wait(2.5); Story.startRinging(); } }
    if (st.day === 6 && S.isObj('home6')) { S.done('home6'); S.setTod('night'); await S.obj('sleep6', 'GO TO SLEEP.'); S.flag('canSleep'); Story.startRinging(); }
    if (st.day === 7 && S.isObj('home7')) { S.done('home7'); await S.obj('sleep7a', 'GO TO SLEEP.'); S.flag('canSleep'); }
    if (Story.enterHouse2) await Story.enterHouse2(S);
  },
  async unpack(S, id) {
    const st = S.st;
    const text = { box1: 'Kitchen things. Plates, a pot, a single mug that says WORLD\'S OKAYEST.', box2: 'Clothes and a lamp. You put the lamp in the corner where it looks least lonely.', box3: 'Books and a clock radio. The radio only gets one station. It\'s playing the weather.' }[id];
    await S.say(null, text);
    S.sfx('paper');
    S.flag('unpacked_' + id);
    const n = ['box1', 'box2', 'box3'].filter((b) => S.get('unpacked_' + b)).length;
    S.reload();
    if (S.isObj('unpack')) {
      if (n < 3) { st.obj.text = 'UNPACK YOUR BOXES (' + n + '/3)'; UI.banner(st.obj.text); }
      else {
        S.done('unpack');
        S.flag('trashReady');
        S.reload();
        await S.say(null, 'Done. You\'re thirsty. The fridge is probably empty.');
        await S.obj('milk', 'FIND MILK.');
      }
    }
  },
  async fridge(S) {
    const st = S.st;
    if (st.inv.includes('milk') && S.isObj('fridge')) {
      S.take('milk'); S.flag('milkInFridge'); S.sfx('door', { vol: 0.4 });
      await S.say(null, 'You put the milk in the fridge. It looks very small in there.');
      S.done('fridge');
      if (!S.get('trashOut')) await S.obj('trash', 'TAKE THE TRASH OUTSIDE.');
      else await Story.afterChores(S);
      return;
    }
    if (st.day >= 8) { await S.say(null, 'The fridge. The milk is still in there. The date on it says AUG 15 1991.'); return; }
    if (S.get('milkInFridge')) { await S.say(null, 'Milk, and a box of baking soda.'); return; }
    await S.say(null, 'Empty, except for a box of baking soda. Somebody left it here a long time ago.');
    if (st.day === 1 && S.isObj('unpack')) await S.say(null, 'You should unpack first.');
  },
  async milkCooler(S) {
    const st = S.st;
    if (st.inv.includes('milk') || S.get('milkInFridge')) { await S.say(null, 'Rows of milk cartons, sweating in the cold.'); return; }
    if (st.day === 1 && S.isObj('milk')) { await S.give('milk'); S.done('milk'); await S.obj('pay', 'PAY FOR THE MILK.'); return; }
    await S.say(null, 'Rows of milk cartons, sweating in the cold. You already have milk at home.');
  },
  async payMilk(S) {
    const P = (t) => S.say('priya', t);
    await P('Just the milk? That\'s two dollars.');
    S.money(-2); S.flag('paidMilk'); S.sfx('click');
    await P('We\'ve got a sale on sardines. Walter buys them by the crate. You should see his cart.');
    await P('Welcome to Bellwood, by the way. Everybody in town comes in here eventually.');
    S.done('pay');
    await S.obj('fridge', 'PUT THE MILK IN THE FRIDGE.');
  },
  async curbBin(S) {
    const st = S.st;
    if (st.inv.includes('trash')) {
      S.take('trash'); S.flag('trashOut'); S.sfx('thud', { vol: 0.3 });
      await S.say(null, 'You drop the bag in the bin. Somewhere down the street, a dog barks once.');
      S.done('trash');
      await Story.afterChores(S);
      return;
    }
    if (S.st.day === 1 && S.isObj('trash')) { await S.say(null, 'The trash can. The bag is still inside the house.'); return; }
    await S.say(null, st.day >= 8 ? 'The trash can. It\'s full of wet newspapers. All the same day.' : 'The trash can. It says 12 on the side in white paint.');
  },
  async afterChores(S) {
    if (!S.get('milkInFridge') || !S.get('trashOut')) return;
    S.setTod('afternoon');
    await S.say(null, 'That\'s everything. Walter said to come by the aquarium when you were settled.');
    await S.obj('visitaq', 'VISIT THE BELLWOOD AQUARIUM.');
  },
  async enter_aquarium(S) {
    const st = S.st;
    if (st.day === 1 && S.isObj('visitaq')) { S.done('visitaq'); await S.obj('findwalter', 'FIND WALTER.', { quiet: true }); }
    if (Story.enterAq2) await Story.enterAq2(S);
  },
  async tour(S) {
    const W = (t) => S.say('walter', t);
    const st = S.st;
    if (S.get('touring')) return;
    S.flag('touring');
    S.done('findwalter');
    await W('There you are! Come on, I\'ll show you around. Stay close, it\'s easy to get turned around in here.');
    await S.obj('follow', 'FOLLOW WALTER.', { quiet: false });
    const stops = [
      { to: [[-11.5, -4]], lines: ['This is the reef tank. Two hundred gallons of the prettiest fish this side of the river.', 'That orange one is Pumpkin. He thinks he runs the place.'] },
      { to: [[-2, -6.2]], lines: ['The touch pool. Kids love it. Two fingers, gently. That\'s the rule.', 'We had a boy once who tried to take a sea star home in his pocket. Nearly made it, too.'] },
      { to: [[10, -17.5]], lines: ['And this is Mister Eight. Our octopus.', 'He\'s smarter than most people in this town. Don\'t tell them I said that.', 'He can open a jar from the inside. He likes some people and not others. Nobody knows why.'] },
      { to: [[3.5, -27]], lines: ['That one\'s closed. Has been for a while. Renovations.', 'Mind the tarp.'] },
      { to: [[-18.5, -9.5]], lines: ['And these are the penguins. Pip, Squeak, and Admiral. Admiral\'s the fat one.', 'They eat twice a day and they\'ll remind you if you forget.'] },
      { to: [[-4, -1]], lines: [] },
    ];
    for (const stop of stops) {
      await S.walk('walter', stop.to, { speed: 2.4 });
      // wait for the player to catch up
      for (let i = 0; i < 1200; i++) { const p = World.player, w = World.npc('walter'); if (!w || Math.hypot(p.x - w.x, p.z - w.z) < 4.2) break; await S.wait(0.1); }
      S.face('walter', 'player');
      for (const l of stop.lines) await W(l);
    }
    S.done('follow');
    await W('So. Here\'s my proposition.');
    await W('I need an extra pair of hands around here. Feeding, cleaning, errands. It pays five dollars an hour and all the fish trivia you can stand.');
    for (;;) {
      const c = await S.ask('walter', 'What do you say?', ['SURE!', 'I\'LL THINK ABOUT IT.']);
      if (c === 0) break;
      await W('Take your time. I\'ll be right here. I\'m always here.');
      await S.wait(1.2);
      await W('...Well? Have you thought about it?');
    }
    await W('Wonderful! Here, your staff badge.');
    await S.give('badge');
    await S.say(null, 'Your name is already typed on it.');
    await W('Nine o\'clock tomorrow. Don\'t be late. The penguins aren\'t patient.');
    S.flag('hired');
    Story.walterSpot(S, 'hall');
    S.setTod('evening');
    await S.obj('home1', 'GO HOME AND GO TO SLEEP.');
    S.flag('canSleep');
  },
  async catCushion(S) {
    const st = S.st;
    if (st.day <= 2) {
      if (!S.get('catPet')) { S.flag('catPet'); await S.say(null, 'An orange cat, asleep on a red cushion. His collar has a little bell.'); await S.say(null, 'You pet him. He purrs like a small motor.'); return; }
      await S.say(null, 'The cat opens one eye, decides you\'re fine, and closes it again.');
      return;
    }
    if (st.day >= 8) { await S.say(null, 'The cushion is new. Nobody has ever sat on it.'); return; }
    await S.say(null, st.day >= 5 ? 'The cushion still has orange hairs on it.' : 'The cat\'s cushion. It\'s empty.');
  },
  ticketCounter(st) {
    if (st.day >= 8) return ['The ticket counter. A roll of tickets, all printed with the same date: AUG 15 1991.'];
    if (st.day === 7) return ['Nobody is at the counter. The register drawer is open.'];
    return ['The ticket counter. ADULTS $4. KIDS $2. MEMBERS FREE. A jar of lollipops, mostly green ones.'];
  },
  async lostFound(S) {
    const st = S.st;
    if (st.day >= 5 && st.found.mitten && !S.get('sawPinkKey')) { S.flag('sawPinkKey'); await S.say(null, 'Under the socks: a house key on a pink keychain. The paper tag says 12 MAPLE ST.'); await S.say(null, 'It isn\'t yours. Your key is in your pocket.'); return; }
    if (!st.found.mitten && st.day >= 2) { await S.say(null, 'A box behind the counter: LOST & FOUND. Mostly single socks.'); await S.give('mitten'); return; }
    await S.say(null, st.day >= 8 ? 'The lost and found box is full of blue backpacks. All the same one.' : 'LOST & FOUND. A lot of single socks. Nobody ever comes back for socks.');
  },
  async giftGame(S) {
    const st = S.st;
    if (st.found.game_disc) { await S.say(null, st.day >= 8 || st.flags.ghostMet ? 'TIDEWATER. The cover shows a child in a diving helmet, holding an old man\'s hand.' : 'A stack of TIDEWATER games. You already bought one.'); return; }
    await S.say(null, st.day >= 8 || st.flags.ghostMet ? 'TIDEWATER: A BELLWOOD AQUARIUM ADVENTURE. The cover shows a child in a diving helmet, holding an old man\'s hand.' : 'TIDEWATER: A BELLWOOD AQUARIUM ADVENTURE. A video game about this aquarium. $19.');
    if (st.money >= 19) {
      const c = await S.ask(null, 'Buy it for $19?', ['YES', 'NO']);
      if (c === 0) { S.money(-19); await S.give('game_disc'); if (World.npc('dana')) await S.say('dana', 'Oh, you bought the game? Walter paid some company in the city to make it. It\'s kind of boring. You just walk around.'); }
    } else await S.say(null, 'You don\'t have enough money.');
  },
  async aqTrash(S) {
    const st = S.st;
    if (st.inv.includes('bday_card') && S.get('throwCardAsked') && !S.get('cardThrown')) {
      const c = await S.ask(null, 'Throw away the birthday card?', ['YES', 'NO']);
      if (c === 0) { S.take('bday_card'); S.flag('cardThrown'); S.sideDone('throwcard'); await S.say(null, 'You drop the card in the trash.'); }
      return;
    }
    if (S.get('cardThrown') && !st.inv.includes('bday_card')) {
      const c = await S.ask(null, 'The birthday card is still in there, on top of a lollipop wrapper. Take it back?', ['YES', 'NO']);
      if (c === 0) { await S.give('bday_card'); S.flag('cardRetrieved'); }
      return;
    }
    await S.say(null, 'A trash can shaped like a whale. Its mouth is the hole.');
  },
  async aqFrontDoor(S) {
    const st = S.st;
    if (Story.aqFrontDoor2) { const r = await Story.aqFrontDoor2(S); if (r) return; }
    await S.go('town', 'aquarium', { sfx: 'door' });
  },
  aquariumLocked(st) {
    if (st.day === 7 && st.tod !== 'night') return true;
    if (st.day === 6 && st.tod === 'night') return true;
    if (st.tod === 'night' && st.day < 7) return true;
    if (st.tod === 'evening' && st.day < 7 && st.day !== 1) return true;
    if (st.day === 8 && st.tod === 'night') return true;
    return false;
  },
  aquariumLockedMsg(st) {
    if (st.day === 7) return 'CLOSED UNTIL FURTHER NOTICE.';
    if (st.day >= 8) return 'The doors won\'t open. Through the glass, the lobby lights are on.';
    return 'CLOSED. Open 9 AM to 5 PM.';
  },

  // ================================================================ tanks & aquarium work
  tankLook(st, n) {
    if (st.day >= 8) return ['TANK 1. The fish are all facing the same direction. Toward you.'];
    return ['TANK 1: CORAL REEF. Clownfish, blue tangs, a yellow tang that hides behind the coral when you look at it.'];
  },
  async tank(S, n, part) {
    const st = S.st, f = st.flags;
    // day 2: clean the windows
    if (st.day === 2 && S.isObj('windows') && [1, 2, 3, 5].includes(n) && !f['clean_' + n]) {
      const ok = await Story.hold('SCRUBBING', 1.8);
      if (!ok) { await S.say(null, 'Hold Z to scrub the glass.'); return; }
      S.flag('clean_' + n); S.reload();
      const c = [1, 2, 3, 5].filter((k) => f['clean_' + k]).length;
      if (c < 4) { st.obj.text = 'CLEAN THE AQUARIUM WINDOWS (' + c + '/4)'; UI.banner(st.obj.text); }
      else { S.flag('windowsDone'); S.done('windows'); await S.say(null, 'The glass squeaks. You can see yourself in it now. Mostly the helmet.'); await S.obj('filter', 'REPLACE THE FILTER IN TANK 3.'); }
      return;
    }
    if (n === 3 && S.isObj('filter')) {
      if (!st.inv.includes('filter')) { await S.say(null, 'The filter panel is under the tank. You need a new filter. They\'re in the storage room.'); return; }
      const ok = await Story.hold('REPLACING FILTER', 1.6);
      if (!ok) { await S.say(null, 'Hold Z to work the old filter loose.'); return; }
      S.take('filter');
      await S.say(null, 'You pull out the old filter. It\'s slimy and gray. The new one clicks into place.');
      S.done('filter');
      await S.say(null, 'That\'s everything Walter asked for. You should tell him.');
      await S.obj('tellwalter2', 'TELL WALTER YOU\'RE DONE.');
      return;
    }
    // day 3: tank 4 algae + turtles
    if (n === 4 && st.day === 3 && S.isObj('tank4') && !f['algae_' + part]) {
      const ok = await Story.hold('SCRUBBING ALGAE', 2.2);
      if (!ok) { await S.say(null, 'Hold Z to scrub.'); return; }
      S.flag('algae_' + part); S.reload();
      if (f.algae_a && f.algae_b) {
        S.flag('tank4Done'); S.done('tank4');
        await S.say(null, 'Tank 4 is clean. A turtle swims up to the glass to inspect your work.');
        if (!st.found.fc5) { await S.say(null, 'Something was stuck to the glass under the algae. A laminated card.'); await S.give('fc5'); }
        await S.obj('turtles', 'FEED THE TURTLES.');
      }
      return;
    }
    if (n === 4 && S.isObj('turtles')) {
      if (!st.inv.includes('lettuce')) { await S.say(null, 'The turtles eat lettuce. There\'s some in the kitchen fridge.'); return; }
      S.take('lettuce'); S.sfx('splash', { vol: 0.5 });
      await S.say(null, 'You drop the lettuce in. The turtles move toward it very, very slowly.');
      S.done('turtles');
      await S.say('walter', '{name}! Could you come here a minute?');
      await S.obj('seewalter3', 'TALK TO WALTER.');
      return;
    }
    const looks = {
      2: st.day >= 8 ? ['TANK 2. The jellies pulse in time. Something like a heartbeat.'] : ['TANK 2: MOON JELLIES. They don\'t have brains. They don\'t seem to mind.'],
      3: st.day >= 8 ? ['TANK 3. The seahorses are holding on to the kelp with their tails. All of them. Very tightly.'] : ['TANK 3: SEAHORSES. The fathers carry the babies.'],
      4: st.day >= 8 ? ['TANK 4. One turtle. It is the size of a car. It hasn\'t moved since you came in.'] : ['TANK 4: SEA TURTLES. One of them is named Dennis. Nobody knows which one.'],
    };
    if (n === 3 && !st.found.fc3 && st.day >= 2) { await S.say(null, 'TANK 3: SEAHORSES.'); }
    if (n === 2 && !st.found.fc3 && st.day >= 2) { await S.say(null, 'There\'s a fish card tucked behind the label.'); await S.give('fc3'); return; }
    if (n === 5) return Story.octopus(S);
    if (n === 1) { for (const l of Story.tankLook(st, 1)) await S.say(null, l); return; }
    for (const l of looks[n] || ['A tank.']) await S.say(null, l);
  },
  async octopus(S) {
    const st = S.st;
    if (st.day >= 8) { await S.say(null, 'Mister Eight is pressed flat against the glass, right where you\'re standing. All his arms. Like he\'s trying to hold on to something.'); return; }
    if (st.day === 7 && st.flags.ghostMet) { await S.say(null, 'Mister Eight is awake. He follows you along the glass.'); await S.say(null, 'He doesn\'t do that for anybody.'); return; }
    if (st.day >= 3 && !st.found.fc6) { await S.say(null, 'Mister Eight is pressing something flat against the inside of the glass. A fish card?'); await S.say(null, 'No. It\'s on the outside, stuck to the glass. How did it get there?'); await S.give('fc6'); return; }
    await S.say(null, st.day === 1 ? 'TANK 5: MISTER EIGHT. A big red octopus, tucked into a cave. One eye is watching you.' : 'Mister Eight watches you from his cave. He changes color, very slightly, when you wave.');
  },
  async penguinHatch(S) {
    const st = S.st;
    if (S.isObj('penguins')) {
      if (!st.inv.includes('fish_bucket')) { await S.say(null, 'The feeding hatch. You need the bucket of fish from the kitchen fridge.'); return; }
      for (const e of World.map.ents) if (e.type === 'penguin') { e.target = [-22.8, -8 + (Math.random() - 0.5) * 2]; e.wait = 6; }
      await S.say(null, 'The penguins hear the bucket. They come running, if you can call it running.');
      for (let i = 0; i < 3; i++) { S.sfx('splash', { vol: 0.5 }); await S.wait(0.5); }
      await S.say(null, 'You toss the fish in, one at a time. Admiral gets most of them.');
      S.take('fish_bucket'); S.done('penguins');
      await S.obj('windows', 'CLEAN THE AQUARIUM WINDOWS (0/4)');
      return;
    }
    await S.say(null, st.day >= 8 ? 'The penguins are standing in a row at the glass. They are all looking at the door behind you.' : 'The feeding hatch. The penguins have learned what it means. They watch it all day.');
  },
  touchPool(st) {
    if (st.day >= 8) return ['The touch pool. The water is very cold. There is nothing in it.'];
    return ['The touch pool. You touch a sea star with two fingers, gently. It feels like a wet sneaker.'];
  },
  kidsTV(st) {
    if (st.flags.lightsOut) return ['The TV shows you, from above. You look up. There\'s nothing there.'];
    if (st.day >= 8) return ['Static. Behind the static, very faintly, someone is walking through the aquarium.'];
    return ['The Kids\' Corner TV. It\'s playing the title screen of a video game. TIDEWATER. The music is very quiet.'];
  },
  async hallLamp(S, i) {
    const st = S.st;
    if (st.day === 6 && S.isObj('bulbs') && !S.get('bulb_' + i)) {
      if (!st.inv.includes('bulbs')) { await S.say(null, 'The bulb is dead. Replacements are in the storage room.'); return; }
      S.sfx('switch'); S.flag('bulb_' + i); S.flag('bulbsDone', (S.get('bulbsDone') || 0) + 1); S.reload();
      const n = S.get('bulbsDone');
      if (n < 3) { st.obj.text = 'REPLACE THE LIGHT BULBS IN THE MAIN HALL (' + n + '/3)'; UI.banner(st.obj.text); }
      else { S.take('bulbs'); S.done('bulbs'); await S.say(null, 'The main hall is bright again. It looks smaller when it\'s bright.'); await Story.lunch6(S); }
      return;
    }
    await S.say(null, st.day === 6 && !S.get('bulb_' + i) ? 'This lamp is out.' : 'A display lamp. It hums.');
  },
  async tank6(S) {
    const st = S.st;
    if (Story.tank6b) { const r = await Story.tank6b(S); if (r) return; }
    if (st.day >= 5) { await S.say(null, 'TANK 6: THE DEEP. CLOSED FOR RENOVATION.'); await S.say(null, 'You put your ear to the plywood. Water, moving. Something very big, moving very slowly.'); return; }
    await S.say(null, 'TANK 6: THE DEEP. CLOSED FOR RENOVATION. SORRY FOR THE MESS!');
    await S.say(null, 'The sign is faded. The plywood is gray. The mess has been here a long time.');
  },

  // ---------------------------------------------------------------- employee rooms
  async aqFridge(S) {
    const st = S.st;
    if (S.isObj('penguins') && !st.inv.includes('fish_bucket')) {
      if (st.day === 2 && !S.get('sawDish')) { S.flag('sawDish'); await S.say(null, 'Buckets of fish on ice. On the top shelf, a covered dish with a note: W.V. - DO NOT TOUCH.'); }
      await S.give('fish_bucket'); return;
    }
    if (S.isObj('turtles') && !st.inv.includes('lettuce')) { await S.give('lettuce'); return; }
    if (S.isObj('lunch6') && !st.inv.includes('tuna') && !S.get('lunch6Taken')) { S.flag('lunch6Taken'); await S.say(null, 'A paper bag from Hal\'s with WALTER written on it.'); await S.give('tuna'); return; }
    if (st.day === 5 && !st.inv.includes('recipe') && S.isObj('kitchen5')) { await S.say(null, 'An index card is held to the fridge door with a magnet shaped like a fish.'); await S.give('recipe'); S.flag('recipeFound'); await S.read('recipe'); await Story.kitchenCheck(S); return; }
    if (st.day >= 8) { await S.say(null, 'Fish, on ice. On the top shelf, a covered dish. The note on it has been torn off.'); return; }
    if (st.day === 2 && !S.get('sawDish')) { S.flag('sawDish'); await S.say(null, 'Buckets of fish on ice. On the top shelf, a covered dish with a note: W.V. - DO NOT TOUCH.'); return; }
    if (st.day >= 4 && st.day <= 5) { await S.say(null, 'Fish, lettuce, shrimp. The covered dish on the top shelf is gone.'); return; }
    await S.say(null, 'Buckets of smelt, heads of lettuce, frozen shrimp. The fridge hums.');
  },
  kitchenStove(st) {
    if (st.day === 5 && st.obj && st.obj.id === 'kitchen5') return [async (S) => { await S.say(null, 'A big stock pot on the stove. It has been scrubbed very, very clean.'); await S.say(null, 'There\'s one short orange hair stuck to the rim.'); S.flag('potSeen'); await Story.kitchenCheck(S); }];
    if (st.day === 5) return ['A big stock pot on the stove. It has been scrubbed very, very clean.'];
    if (st.day === 4) return ['The stove. A big pot is soaking in the sink. It smells like thyme.'];
    return ['A little stove. Walter cooks his own lunch most days.'];
  },
  async kitchenTable(S) {
    const st = S.st;
    if (S.isObj('eat') && st.inv.includes('sandwich')) return Story.sandwich(S, 'EAT');
    await S.say(null, st.day >= 8 ? 'The table is set for two. One of the chairs is child-sized.' : 'The staff table. There are fish-shaped salt and pepper shakers.');
  },
  async kitchenTrash(S) {
    const st = S.st;
    if (st.day === 5 && !st.inv.includes('collar') && S.isObj('kitchen5')) {
      await S.say(null, 'You tie up the trash bag. Something small at the top of the bag jingles.');
      await S.give('collar'); S.flag('collarFound');
      await Story.kitchenCheck(S);
      return;
    }
    if (st.inv.includes('sandwich') && S.isObj('eat')) return Story.sandwich(S, 'THROW AWAY');
    await S.say(null, 'The kitchen trash can. Empty and rinsed.');
  },
  async sandwich(S, verb) {
    const st = S.st;
    if (verb === 'THROW AWAY') {
      const w = World.npc('walter');
      S.take('sandwich'); S.flag('trashedSandwich');
      await S.say(null, 'You throw the sandwich away.');
      if (w && st.map === 'aquarium') { await S.wait(0.6); await S.say(null, 'Walter watched you do it. He doesn\'t say anything.'); }
      if (S.isObj('eat')) { S.done('eat'); await Story.afterSandwich(S); }
      return;
    }
    const c = await S.ask(null, 'Eat the sandwich?', ['YES', 'NO']);
    if (c !== 0) return;
    S.take('sandwich');
    S.sfx('eat');
    await S.wait(1.4);
    await S.say(null, 'You eat the sandwich.');
    await S.say(null, 'It\'s good. It\'s still warm.');
    S.flag('ateSandwich');
    if (World.npc('walter') && st.map === 'aquarium') {
      await S.say('walter', 'Good, isn\'t it?');
      await S.say('walter', 'My mother\'s recipe. Nothing goes to waste in my kitchen.');
    }
    if (S.isObj('eat')) { S.done('eat'); await Story.afterSandwich(S); }
  },

  // ================================================================ DAY 2
  async day2(S) {
    Story.walterSpot(S, 'lobby');
    await S.obj('work', 'GO TO WORK AT THE AQUARIUM.');
  },
  async walter2(S) {
    const st = S.st, W = (t) => S.say('walter', t);
    if (S.isObj('work')) {
      S.done('work');
      await W('There they are! Right on time.');
      await W('First job: breakfast for the penguins. Fish are in the kitchen fridge.');
      await W('The staff door is on the east side of the big room. Your badge will get you in anywhere you need to go.');
      await W('Well. Almost anywhere.');
      await S.obj('penguins', 'FEED THE PENGUINS.');
      return;
    }
    if (S.isObj('tellwalter2')) {
      S.done('tellwalter2');
      await W('All done? You\'re a natural!');
      await W('Here. I give these out for good work. There are twelve. Collect the whole set.');
      await S.give('fc1');
      await W('One more thing. Margaret Miller, your neighbor, left her umbrella here last Sunday.');
      await W('Would you mind bringing it to her? She\'ll pretend she doesn\'t need it back. She does.');
      await S.give('umbrella');
      await W('That\'s all for today. You did good.');
      S.setTod('afternoon');
      await S.obj('umbrella', 'RETURN MRS. MILLER\'S UMBRELLA.');
      return;
    }
    if (S.isObj('penguins')) { await W('Fish are in the kitchen fridge. The penguins are at the far west end. Just listen for the complaining.'); return; }
    if (S.isObj('windows')) { await W('Tanks 1, 2, 3, and 5. The kids leave handprints. I don\'t mind handprints. It means somebody was looking.'); return; }
    if (S.isObj('filter')) { await W('Filters are in the storage room, second door down the staff hall.'); return; }
    await W('Go on, Margaret\'s waiting. Well. She isn\'t. But she will be.');
  },
  async storageShelf(S) {
    const st = S.st;
    if (S.isObj('filter') && !st.inv.includes('filter')) { await S.say(null, 'Filters for TANK 1 through TANK 5. None for Tank 6.'); await S.give('filter'); return; }
    if (S.isObj('bulbs') && !st.inv.includes('bulbs') && !S.get('bulbsDone')) { await S.give('bulbs'); return; }
    if (S.isObj('inventory')) {
      await S.say(null, 'You count everything on the shelves against the list on the clipboard.');
      await S.say(null, 'Filters: 11. Bulbs: 6. Fish food: 9 tubs. Mops: 2. Everything is exactly where the list says it is.');
      S.done('inventory');
      if (!S.get('sawEVBox')) await S.say(null, 'Except one box, in the corner. It isn\'t on the list at all.');
      await Story.afterInventory(S);
      return;
    }
    await S.say(null, 'Shelves of supplies. Everything is labeled. The labels are labeled.');
  },
  async evBox(S) {
    const st = S.st;
    S.flag('sawEVBox');
    if (st.day >= 8) { await S.say(null, 'The box marked E.V. The tape has been cut. Inside: a striped shirt, folded. A slinky. Nothing else. It\'s mostly empty.'); return; }
    await S.say(null, 'A cardboard box marked E.V. It\'s taped shut. Very carefully, with a lot of tape.');
    if (st.day >= 5) await S.say(null, 'You could open it. You don\'t.');
  },
  async returnUmbrella(S) {
    const M = (t) => S.say('miller', t);
    S.take('umbrella');
    await M('My umbrella! Oh, thank you, dear.');
    await M('Walter\'s always looking out for everybody. He looked out for me after my Harold passed.');
    await M('Here, take a cookie. Oatmeal. They\'re better than they look.');
    await S.give('cookie');
    S.done('umbrella');
    S.setTod('evening');
    await S.obj('home2', 'GO HOME AND GO TO SLEEP.');
    S.flag('canSleep');
  },

  // ================================================================ DAY 3
  async day3(S) {
    Story.walterSpot(S, 'lobby');
    await S.obj('paper', 'GET THE NEWSPAPER.');
  },
  async mailbox(S) {
    const st = S.st;
    if (st.day === 3 && S.isObj('paper')) { await S.give('news1'); S.done('paper'); await S.read('news1'); await S.obj('work', 'GO TO WORK.'); return; }
    if (st.day === 5 && !S.get('bdayCard')) return Story.louCard(S);
    if (st.day === 6 && S.isObj('paper6')) { await S.give('news2'); S.done('paper6'); await S.read('news2'); await S.obj('work', 'GO TO WORK.'); return; }
    if (Story.mailbox2) { const r = await Story.mailbox2(S); if (r) return; }
    await S.say(null, st.day >= 8 ? 'The mailbox. The name on it has been painted over again. Underneath, still: VANE.' : 'The mailbox. Someone painted over the name on it. You can still read it: VANE.');
  },
  async walter3(S) {
    const st = S.st, W = (t) => S.say('walter', t);
    if (S.isObj('work')) {
      S.done('work');
      await W('Morning! Big day. Tank 4 needs a scrub. The turtles have been busy, if you know what I mean.');
      await W('Algae scraper is right there on the glass. Just put some elbow into it.');
      await S.obj('tank4', 'CLEAN TANK 4.');
      return;
    }
    if (S.isObj('seewalter3')) {
      S.done('seewalter3');
      await W('Would you run down to Hal\'s and get me a tuna melt? Tell him it\'s for me. He knows.');
      await W('Here\'s five dollars. Keep the change. Don\'t tell the IRS.');
      S.money(5);
      await S.obj('lunch', 'BUY WALTER\'S LUNCH AT HAL\'S DINER.');
      Story.walterSpot(S, 'office');
      return;
    }
    if (S.isObj('tank4')) { await W('Both ends of the tank. The turtles don\'t care, but the parents do.'); return; }
    if (S.isObj('turtles')) { await W('Lettuce is in the kitchen fridge. Romaine. They won\'t touch iceberg. Snobs.'); return; }
    if (st.day === 3 && !S.get('askedCat3') && st.tod !== 'evening') {
      S.flag('askedCat3');
      const c = await S.ask('walter', 'Something on your mind?', ['WHERE\'S THE CAT?', 'NO']);
      if (c === 0) { await W('Marmalade? Oh, he wanders. He\'ll turn up.'); await W('He always turns up.'); }
      return;
    }
    await W('Go see the town! That\'s an order.');
  },
  async buyLunch(S) {
    const H = (t) => S.say('hal', t);
    await H('Tuna melt for Walter? Coming up.');
    await H('Man\'s eaten the same lunch for twenty-five years. Same stool, too, before he started eating in that office of his.');
    S.money(-4); S.sfx('click');
    await S.give('tuna');
    S.done('lunch');
    await S.obj('deliver', 'TAKE WALTER HIS LUNCH.');
  },
  officeLockedMsg(st) { return 'OWNER ONLY.'; },
  async officeKnock(S) {
    const st = S.st;
    S.sfx('knock', { n: 3 });
    await S.wait(1.0);
    if (S.isObj('deliver')) {
      S.sfx('door', { vol: 0.5 });
      await S.say('walter', 'Ah! Thank you. You\'re a lifesaver.');
      S.take('tuna');
      const c = await S.ask(null, '(The door is open a crack. Behind Walter, it\'s dark.)', ['WHAT\'S BACK THERE?', 'SAY NOTHING']);
      if (c === 0) { await S.say('walter', 'Back here? Nothing interesting back here. Paperwork. Mostly paperwork.'); }
      await S.say('walter', 'Tell you what. Take the rest of the day. Go see the town. Try Hal\'s pie, visit the school, say hi to Ray down at the pier.');
      await S.say('walter', 'And here. For the lunch run.');
      await S.give('fc2');
      S.sfx('door', { vol: 0.5 });
      S.done('deliver');
      S.setTod('afternoon');
      await S.obj('explore', 'EXPLORE BELLWOOD.');
      Story.walterSpot(S, 'gone');
      return;
    }
    if (S.isObj('paycheck')) return Story.paycheck(S);
    if (S.isObj('lunch6')) return Story.officeAjar(S);
    if (st.day >= 7) { await S.say(null, 'No one answers. Of course no one answers.'); return; }
    await S.say(null, 'You knock. No answer. You can hear a radio playing inside, very low.');
  },
  async jukebox(S) {
    const st = S.st;
    if (st.day >= 8) { S.sfx('click'); await S.say(null, 'The jukebox is playing a song you know. It takes you a second. It\'s the aquarium music. Slowed way down.'); return; }
    await S.say(null, 'A jukebox. Every song on it is from before you were born. B-7 has a handwritten label: AQUARIUM THEME (W.V.)');
  },
  festivalPhoto(st) {
    if (st.day >= 8) {
      if (st.flags.photoHung === 'family') return ['The festival photo. The scratches are gone. In the middle is a boy with a blue backpack, grinning with a missing tooth.'];
      return ['The festival photo. The scratches are gone. In the middle, where the boy was, is someone in a brass diving helmet.', 'It\'s you. Summer 1991.'];
    }
    if (st.day >= 3) return ['An old photograph: SUMMER \'91. Five kids in front of a banner.', 'One of the children\'s faces has been scratched out. Hard. The paper is almost worn through.'];
    return ['An old photo of kids at a summer festival.'];
  },
  async laundryLostFound(S) {
    const st = S.st;
    if (st.day >= 3 && !st.found.radio3) { await S.say(null, 'A box of lost things: one mitten, three socks, a paperback with the ending torn out, and a cassette tape.'); await S.give('radio3'); await S.say(null, 'The label says RADIO EVAN #3. Who\'s Evan?'); return; }
    await S.say(null, 'Socks. A paperback. A single glove. Nobody comes back for any of it.');
  },
  async playRadio3(S) {
    const T = (t) => S.say('evan_tape', t);
    S.sfx('tapeclick'); Sound.ambience(['tape'], 0.2); S.stopMusic(0.3);
    await S.wait(0.8);
    await T('"THIS IS RADIO EVAN! Episode three! Coming to you live from my room."');
    await T('"Today\'s special guest is... Marmalade! Say hi, Marmalade."');
    await S.say('tape', '[a cat, not very interested]');
    await T('"Marmalade is my cat. He\'s one year old. He likes tuna and sleeping on my homework."');
    await T('"Next week on Radio Evan: the aquarium! My dad says I can interview Mister Eight. That\'s the octopus."');
    await T('"This has been Radio Evan. Over and out."');
    S.sfx('tapeclick'); Sound.ambience([], 0.2);
    Game.applyAudio();
    S.flag('heardRadio3');
  },
  async schoolLostFound(S) {
    const st = S.st;
    Story.explored(S, 'school');
    if (st.day >= 5 && (S.get('okaforEvan') || S.get('metEvan')) && !st.inv.includes('notebook')) {
      await S.say(null, 'At the bottom of the lost and found, under a decade of jackets: a blue spiral notebook. EVAN V.');
      await S.give('notebook'); S.sideDone('lostfound');
      return;
    }
    await S.say(null, 'LOST & FOUND. Jackets, lunchboxes, one roller skate. It goes down further than a box should.');
  },
  async lastDesk(S) {
    const st = S.st;
    if (st.day >= 5 && !st.found.spelling) { await S.say(null, 'Something is wedged in the back of the last desk in the row. It\'s been there a long time.'); await S.give('spelling'); return; }
    await S.say(null, 'The last desk in the row. Somebody carved a fish into the top with a compass point.');
  },
  schoolTV(st) { return st.day >= 8 ? ['The TV shows a child in a diving helmet standing in a classroom, looking at a TV.'] : ['The TV cart. It\'s showing a title screen: TIDEWATER. A cartoon fish swims back and forth, forever.']; },
  schoolLocked(st) { return st.tod === 'night' || st.tod === 'evening' || st.day <= 2; },
  schoolLockedMsg(st) { return st.day <= 2 ? 'Locked. A sign says: SEE YOU IN SEPTEMBER!' : 'The school is locked for the night.'; },
  async records(S) { await S.say(null, 'A filing cabinet: STUDENT RECORDS 1985-1995. One folder is already sticking out.'); await S.read('records'); S.flag('readRecords'); },
  memorialBoard(st) {
    return st.flags.metEvan ? ['IN LOVING MEMORY. R. VANE. 1941-1986.', 'There is a nail under Ruth\'s name, where another plaque could hang. Nothing is hanging on it.'] : ['IN LOVING MEMORY. R. VANE. 1941-1986.'];
  },
  candles(st) {
    return async (S) => {
      if (st.day !== 7 || S.get('candleLit')) { await S.say(null, 'Little candles in red glass. A few of them are lit.'); return; }
      const c = await S.ask(null, 'Light a candle?', ['FOR WALTER', 'FOR EVAN', 'NO']);
      if (c === 2) return;
      S.flag('candleLit', c === 0 ? 'walter' : 'evan');
      S.sfx('click');
      await S.say(null, c === 0 ? 'You light a candle for Walter.' : 'You light a candle for Evan. It\'s the only one on that side.');
    };
  },

  // ================================================================ DAY 4
  async day4(S) {
    Story.walterSpot(S, 'lobby');
    await S.obj('work', 'GO TO WORK.');
  },
  async millerPoster(S) {
    const M = (t) => S.say('miller', t);
    S.flag('millerPoster');
    await M('Oh! Good morning, dear. Have you seen Marmalade? Walter\'s cat. Orange, with a little bell.');
    await M('He hasn\'t come for his breakfast. I\'ve fed him on my porch every morning for... oh, years now. Since the boy—');
    await S.wait(0.6);
    await M('Well. Since a long time.');
    await M('Here, take one of these. If you see him, just call. The number\'s on it.');
    await S.give('poster_cat');
    S.side('lookcat', 'LOOK FOR MARMALADE.');
  },
  async walter4(S) {
    const st = S.st, W = (t) => S.say('walter', t);
    if (S.isObj('work')) {
      S.done('work');
      await W('Morning, morning!');
      if (S.get('millerPoster')) {
        const c = await S.ask('walter', 'You look like you\'ve got a question.', ['MARMALADE IS MISSING.', 'NO QUESTION.']);
        if (c === 0) { await W('Margaret\'s worried about the cat? Oh, he\'s old.'); await W('Cats go off on their own when it\'s their time. That\'s nature.'); await W('No sense making a fuss.'); }
      }
      await W('Today, the gift shop. The new shipment came in and it\'s all in a heap on the cart.');
      await W('Everything goes on the shelf that matches its tag. You\'ll figure it out.');
      await S.obj('sort', 'SORT THE GIFT SHOP SHELVES.');
      return;
    }
    if (S.isObj('sort')) { await W('Match the tags. Stars with stars. It\'s not rocket science. It\'s gift shop science.'); return; }
    if (S.isObj('lunch4')) { await W('Kitchen! Go on. I\'ll be right there.'); return; }
    if (S.isObj('eat')) { await W('Go on. Eat. You\'re growing.'); return; }
    await W('Paychecks are in my office. Knock twice.');
  },
  async sortCart(S) {
    const st = S.st;
    if (!S.isObj('sort')) { await S.say(null, 'The sorting cart. Empty.'); return; }
    const items = [['PLUSH PENGUIN', 0], ['PLUSH OCTOPUS', 2], ['PLUSH CLOWNFISH', 1], ['PLUSH TURTLE', 0]];
    const tags = ['★', '○', '♥'];
    const shelves = ['STAR SHELF', 'CIRCLE SHELF', 'HEART TABLE'];
    const done = S.get('sorted') || 0;
    for (let i = done; i < items.length; i++) {
      const [nm, t] = items[i];
      for (;;) {
        const c = await S.ask(null, nm + '. The tag says ' + tags[t] + '. Where does it go?', shelves.concat(['LATER']));
        if (c === 3) return;
        if (c === t) { S.sfx('select'); S.flag('sorted', i + 1); break; }
        S.sfx('wrong'); await S.say(null, 'That\'s not where it goes.');
      }
    }
    S.done('sort');
    await S.say(null, 'The shelves look nice. The plush octopus is staring at you from the heart table.');
    await S.say('walter', '{name}! Lunch break! Come to the kitchen!');
    Story.walterSpot(S, 'kitchen');
    await S.obj('lunch4', 'GO TO THE STAFF KITCHEN.');
  },
  async enterKitchen4(S) {
    if (!S.isObj('lunch4')) return;
    S.done('lunch4');
    const W = (t) => S.say('walter', t);
    S.face('walter', 'player');
    await W('There you are! Sit, sit.');
    await W('I made you something. Slow-cooked it last night. My mother\'s recipe.');
    await S.give('sandwich');
    await W('Go on. It\'s still warm.');
    await S.obj('eat', 'EAT THE SANDWICH WALTER GAVE YOU.');
  },
  async afterSandwich(S) {
    const W = (t) => S.say('walter', t);
    await S.wait(0.5);
    await W('Right! Paychecks are in my office. Come knock when you\'re ready.');
    Story.walterSpot(S, 'office');
    await S.obj('paycheck', 'PICK UP YOUR PAYCHECK.');
  },
  async paycheck(S) {
    S.sfx('door', { vol: 0.5 });
    await S.say('walter', 'First paycheck! Don\'t spend it all on fish.');
    S.money(40); S.sfx('pickup');
    await S.notice('Got: $40');
    await S.say(null, 'Over Walter\'s shoulder, the office is dark. There\'s a fish tank glowing on the wall.');
    await S.say('walter', 'Go on home. See you tomorrow.');
    S.sfx('door', { vol: 0.5 });
    S.done('paycheck');
    Story.walterSpot(S, 'gone');
    S.setTod('evening');
    await S.obj('home4', 'GO HOME.');
    if (S.get('sawRules')) S.side('octo', 'DON\'T FEED THE OCTOPUS AFTER 6 PM.', { quiet: true });
  },
  staffRules(st) {
    return async (S) => {
      await S.read('staff_rules');
      S.flag('sawRules');
      if (st.day >= 4 && !st.side.find((s) => s.id === 'octo') && !st.flags.octoAdded) { S.flag('octoAdded'); S.side('octo', 'DON\'T FEED THE OCTOPUS AFTER 6 PM.'); }
    };
  },
  async staffBinders(S) {
    const st = S.st;
    if ((st.day >= 5 || st.flags.ghostMet) && !st.inv.includes('feeding_log')) {
      await S.say(null, 'Green binders: FEEDING LOGS, 1976 to 2001. One of them is thinner than the others. 1991.');
      await S.give('feeding_log');
      await S.read('feeding_log');
      return;
    }
    await S.say(null, 'Binders full of feeding logs. Every fish, every day, for twenty-five years.');
  },

  // ================================================================ DAY 5
  async day5(S) {
    Story.walterSpot(S, 'lobby');
    await S.obj('mail', 'GET THE MAIL.');
  },
  async louCard(S) {
    const L = (t) => S.say('lou', t);
    S.flag('bdayCard');
    await S.give('bday_card');
    await S.say(null, 'A birthday card, addressed in careful handwriting: EVAN VANE, 12 MAPLE STREET.');
    if (World.npc('lou')) {
      await L('Oh. That one. Yeah.');
      await L('Comes every year. Same day. No return address. Postmarked right here in Bellwood.');
      await L('I just... deliver it.');
    }
    S.done('mail');
    await S.obj('work', 'GO TO WORK.');
  },
  async walter5(S) {
    const st = S.st, W = (t) => S.say('walter', t);
    if (S.isObj('work')) {
      S.done('work');
      await W('Morning.');
      if (st.inv.includes('bday_card')) {
        const c = await S.ask('walter', 'What\'s that you\'ve got there?', ['SHOW HIM THE CARD', 'NOTHING']);
        if (c === 0) {
          S.flag('metEvan'); S.flag('showedCard');
          await S.wait(0.8);
          await W('...Where did you get that.');
          await W('That\'s for my son. Evan. He ran away. A long time ago.');
          await W('He was a troubled boy. Evan was troubled.');
          await W('Throw that away, would you? There\'s a can right there. No sense keeping it.');
          S.flag('throwCardAsked');
          S.side('throwcard', 'THROW AWAY THE BIRTHDAY CARD.');
        } else { await W('Alright.'); S.flag('hidCard'); }
      }
      await W('Inventory today. The storage room. Count everything and check it against the list.');
      await S.obj('inventory', 'TAKE INVENTORY IN THE STORAGE ROOM.');
      return;
    }
    if (S.isObj('back5')) {
      S.done('back5');
      await W('You were gone a long time.');
      await W('Did you go to the school?');
      const c = await S.ask('walter', 'What did she tell you?', ['SHE TALKED ABOUT EVAN.', 'NOTHING.']);
      if (c === 0) { S.flag('toldWalterSchool'); await W('...Evan had problems.'); await W('It\'s not something I like to talk about. You understand. You\'re a good kid. You understand.'); await S.wait(0.8); await W('You remind me of him, you know.'); }
      else await W('Good. She talks too much. Always did.');
      await W('Clean up the staff kitchen, would you? I cooked a big batch this week. It\'s a mess.');
      Story.walterSpot(S, 'office');
      S.setTod('afternoon');
      await S.obj('kitchen5', 'CLEAN UP THE STAFF KITCHEN.');
      return;
    }
    if (S.isObj('inventory')) { await W('Storage. Second door on the left in the staff hall. The clipboard\'s on the shelf.'); return; }
    if (S.isObj('brochures')) { await W('Ms. Okafor, Room 5. Just drop them off. No need to stay and chat.'); return; }
    await W('Hm.');
  },
  async afterInventory(S) {
    const W = (t) => S.say('walter', t);
    await S.say('walter', '{name}! Come here a second.');
    const w = World.npc('walter');
    await W('I need these brought over to the school. Ms. Okafor wants them for the fall field trip.');
    await S.give('brochures');
    await W('Room 5. Just drop them off.');
    await S.obj('brochures', 'DELIVER THE BROCHURES TO THE SCHOOL.');
  },
  async deliverBrochures(S) {
    const O = (t) => S.say('okafor', t);
    S.take('brochures');
    S.flag('okaforEvan'); S.flag('metEvan');
    await O('Oh! The aquarium brochures. Thank you. Walter sent you?');
    await O('Of course he did.');
    await S.wait(0.5);
    if (S.st.inv.includes('bday_card') || S.get('showedCard')) await O('Is that... a birthday card? For Evan?');
    else await O('You\'re living in the old Vane house, aren\'t you. On Maple.');
    await O('Evan Vane. He was in my class. Room 5, fifth grade.');
    await O('Sweet boy. Curious. He drew fish on everything. Even his math tests.');
    await O('The official story is that he ran away.');
    await O('I don\'t think Evan ever left town.');
    await S.wait(0.8);
    await O('His things are still in the lost and found, out in the hall. Nobody ever came for them.');
    S.done('brochures');
    S.side('lostfound', 'CHECK THE LOST AND FOUND.');
    await S.obj('back5', 'GO BACK TO THE AQUARIUM.');
  },
  async kitchenCheck(S) {
    const n = ['collarFound', 'recipeFound', 'potSeen'].filter((k) => S.get(k)).length;
    if (n < 2 || S.get('kitchenSeen')) return;
    S.flag('kitchenSeen');
    await S.wait(0.8);
    S.sfx('step', { surf: 'tile' }); await S.wait(0.3); S.sfx('step', { surf: 'tile' });
    Story.walterSpot(S, 'kitchen');
    const w = World.npc('walter');
    if (w) { w.x = 21.5; w.z = -28.6; await S.walk('walter', 22.4, -31.8, { speed: 1.8 }); }
    await S.wait(0.4);
    const W = (t) => S.say('walter', t);
    S.face('walter', 'player');
    await W('Oh. Don\'t mind the mess.');
    await W('I made a big batch this week. I hate wasting food.');
    await S.wait(0.6);
    await W('Don\'t mention the kitchen to Margaret. She worries.');
    S.done('kitchen5');
    await S.obj('secret', 'DON\'T TELL MRS. MILLER WHAT YOU SAW IN THE KITCHEN.');
    await W('That\'s enough for today. Go on home.');
    Story.walterSpot(S, 'gone');
    S.setTod('evening');
  },
  async millerKitchen(S) {
    const M = (t) => S.say('miller', t);
    S.flag('millerKitchenDone');
    await M('Still no sign of Marmalade. I keep leaving his bowl out.');
    const c = await S.ask('miller', 'How was work, dear?', ['TELL HER ABOUT THE KITCHEN', 'SAY NOTHING']);
    if (c === 0) {
      S.flag('toldMiller');
      await M('The kitchen? What about the kitchen?');
      await S.say(null, 'You tell her about the pot. About the card on the fridge. About the little bell.');
      await M('...A red collar? With a bell?');
      await S.wait(1.2);
      await M('No. No, Walter wouldn\'t. He loved that cat. That was Evan\'s cat.');
      await M('I have to go inside now.');
      S.sfx('door'); World.removeNpc('miller');
      await S.say(null, 'Mrs. Miller goes inside and closes the door. You hear the lock.');
    } else {
      S.flag('keptSecret');
      await M('Well. Goodnight, dear. Lock your door. It\'s getting cold at night.');
    }
    S.done('secret');
    await S.obj('home5', 'GO HOME.');
  },
  millerLocked(st) { return st.tod === 'night' || st.day >= 8 || (st.flags.toldMiller && st.day >= 5 && st.day !== 7); },
  millerLockedMsg(st) {
    if (st.day >= 8) return 'The door is boarded over. It has been for years.';
    if (st.flags.toldMiller) return 'Mrs. Miller doesn\'t answer. The curtains are closed.';
    return 'The lights are off. Mrs. Miller is asleep.';
  },
  async enter_aquarium_kitchen(S) { },

  // ================================================================ DAY 6
  async day6(S) {
    Story.walterSpot(S, 'lobby');
    await S.obj('paper6', 'GET THE NEWSPAPER.');
  },
  async walter6(S) {
    const st = S.st, W = (t) => S.say('walter', t);
    if (S.isObj('work')) {
      S.done('work');
      await W('You\'re late.');
      await S.say(null, 'You aren\'t late.');
      if (S.get('toldMiller')) { await S.wait(0.6); await W('You told Margaret.'); await S.wait(1); await W('...Never mind. Work.'); }
      if (S.get('hidCard') || (st.inv.includes('bday_card') && S.get('throwCardAsked'))) { await W('You kept the card.'); await S.wait(0.8); }
      await W('Three bulbs are out in the main hall. Replacements are in storage. Don\'t break them.');
      await S.obj('bulbs', 'REPLACE THE LIGHT BULBS IN THE MAIN HALL (0/3)');
      return;
    }
    if (S.isObj('bulbs')) { await W('Bulbs. Storage. Go.'); return; }
    await W('Not now.');
  },
  async lunch6(S) {
    await S.say(null, 'There\'s a note taped to the kitchen door: {name} - MY LUNCH IS IN THE FRIDGE. BRING IT TO THE OFFICE. - W.');
    Story.walterSpot(S, 'asleep');
    await S.obj('lunch6', 'TAKE WALTER HIS LUNCH.');
  },
  async officeAjar(S) {
    if (!S.st.inv.includes('tuna')) { await S.say(null, 'You should get Walter\'s lunch from the kitchen fridge first.'); return; }
    await S.say(null, 'No answer. The door isn\'t latched. It swings open a little when you knock.');
    await S.say(null, 'You can hear snoring.');
    S.flag('officeOpen');
    S.reload();
    await S.obj('desk6', 'PUT THE LUNCH ON WALTER\'S DESK.');
  },
  async officeDesk(S) {
    const st = S.st;
    if (S.isObj('desk6') && st.inv.includes('tuna')) {
      S.take('tuna');
      await S.say(null, 'Walter is asleep in his chair with his glasses pushed up on his forehead.');
      await S.say(null, 'You set the lunch down next to him. He doesn\'t wake up.');
      S.done('desk6');
      S.flag('snoopStart', World.time);
      await S.obj('leave6', 'LEAVE THE OFFICE.', { quiet: true });
      return;
    }
    if (S.get('walterSpot') === 'asleep') {
      if (!st.inv.includes('vet')) { await S.say(null, 'On the desk, under his elbow: a form from the Bellwood Animal Clinic.'); await S.give('vet'); await S.read('vet'); return; }
      if (!st.inv.includes('report')) { await S.say(null, 'The top drawer is open a little. A photocopy, folded into quarters, very soft from being unfolded and folded again.'); await S.give('report'); await S.read('report'); return; }
      await S.say(null, 'Walter mumbles something in his sleep. It sounds like a name.');
      return;
    }
    if (st.day >= 7) {
      if (!st.inv.includes('report')) { await S.say(null, 'The desk drawer. A folded photocopy.'); await S.give('report'); await S.read('report'); return; }
      if (!st.inv.includes('vet') && !S.get('vetSkipped')) { await S.say(null, 'A form from the animal clinic.'); await S.give('vet'); return; }
      await S.say(null, st.day >= 8 ? 'The desk is covered in blueprints for THE DEEP. The pit is drawn in red pencil, and then drawn over again, and again.' : 'Walter\'s desk. His reading glasses are folded on top of the blotter, like he just stepped out.');
      return;
    }
    await S.say(null, 'Walter\'s desk.');
  },
  async officeCabinet(S) {
    const st = S.st;
    if (!(S.get('walterSpot') === 'asleep' || st.day >= 7)) return;
    if (!st.inv.includes('phone_bill')) { await S.say(null, 'The filing cabinet. A drawer labeled 1991. Most of it is empty. One phone bill.'); await S.give('phone_bill'); await S.read('phone_bill'); return; }
    if (!st.found.memo) { await S.say(null, 'A folder marked THE DEEP. Blueprints, receipts, and a memo.'); await S.give('memo'); return; }
    await S.say(null, 'The rest of the drawers are full of fish.');
    await S.say(null, 'Paper fish. Invoices for fish. Twenty-five years of fish.');
  },
  employeeBoard(st) {
    if (st.flags.ghostMet || st.day >= 8) return ['EMPLOYEE OF THE MONTH. MARCH: MARCUS. JUNE: KAYLEE. AUGUST: {name}.', 'They are all wearing the same diving helmet as you.'];
    return ['EMPLOYEE OF THE MONTH. MARCH: MARCUS. JUNE: KAYLEE. AUGUST: (blank).', 'You don\'t recognize anyone. They\'re all wearing the same diving helmet as you.'];
  },
  async officePhotos(S) {
    const st = S.st;
    if (!st.found.photo_cat) { await S.say(null, 'Two framed photos. One of Walter with an orange cat on his shoulder. You take it down.'); await S.give('photo_cat'); }
    await S.say(null, 'The other photo: Walter, a woman, and a boy with a kitten. In this one, nobody\'s face is scratched out.');
    await S.inspect({ name: 'FAMILY PHOTO', icon: 'photo_old', photo: 'ph_family', desc: 'On the back: "Ruth, Evan & the new cat. Easter 1987."' });
  },
  officeCalendar(st) { return st.day >= 8 ? ['A calendar: AUGUST 1991. The 14th: ROTARY 7PM. The 15th: POUR 7:30 AM, circled until the pen went through the paper.'] : ['A calendar: AUGUST 2001. The 14th: ROTARY 7PM - AWARD. The 15th is blank.']; },

  // ---------------------------------------------------------------- misc town
  knock(st, who) {
    if (st.day >= 8) return 'You knock. The door swings open onto a wall.';
    if (who === 'pruitt') return st.day === 7 ? 'Nobody answers. Dana\'s bike is on the lawn.' : 'THE PRUITTS. Nobody answers.';
    if (who === 'okafor') return 'You knock. Nobody\'s home.';
    return 'You knock. A dog barks inside. Nobody comes.';
  },
  houseTV(st) {
    if (st.day >= 8 && st.tod === 'night') return ['The TV is showing this room, from the corner of the ceiling. You are in it. You don\'t look up.'];
    if (st.tod === 'night') return ['The TV only gets one channel at night. It\'s the title screen of a game. TIDEWATER.'];
    return ['The TV. One channel. A man is explaining the tides.'];
  },
  bedroomWindow(st) {
    if (st.day >= 8) return ['Outside, the street is there. It looks like a picture of a street.'];
    if (st.tod === 'night') return ['Dark out. Across the street, one window is lit. Then it isn\'t.'];
    return ['Your window looks out on Maple Street. A sprinkler goes tick-tick-tick somewhere.'];
  },
  async houseNail(S) {
    const st = S.st;
    if (S.isObj('hang')) return Story.hangPhoto(S);
    if (st.flags.photoHung || st.flags.deathPhoto) {
      await S.say(null, st.flags.photoHung === 'family' ? 'Ruth, Evan, Walter, and the new cat. It looks like it was always there.' : 'A photo of Walter and you in front of the aquarium. Walter\'s hand is on your helmet.');
      if (st.flags.deathPhoto && !st.flags.photoHung) await S.say(null, 'You don\'t remember this being taken. You don\'t remember putting it up.');
      return;
    }
    await S.say(null, 'An empty nail. Something used to hang here. There\'s a clean rectangle on the wallpaper.');
  },
  async bed(S) {
    const st = S.st;
    if (Story.bed2) { const r = await Story.bed2(S); if (r) return; }
    const canSleep = S.get('canSleep');
    const opts = canSleep ? ['SLEEP', 'SAVE', 'NEVERMIND'] : ['SAVE', 'NEVERMIND'];
    const c = await S.ask(null, canSleep ? 'Your bed.' : 'Your bed. You\'re not tired yet.', opts);
    const v = opts[c];
    if (v === 'SAVE') { await Menus.saveSlots('save', 'DAY ' + st.day); return; }
    if (v === 'SLEEP') {
      if (Story.phoneRinging) { await S.say(null, 'You can\'t sleep with the phone ringing.'); return; }
      await Story.sleep(S);
    }
  },
  async phone(S, ringing) {
    const st = S.st;
    if (!ringing) { await S.say(null, st.day >= 7 ? 'The phone. The cord is cut. Neatly, with scissors.' : 'The phone. There\'s a dial tone. You don\'t know anybody\'s number.'); return; }
    Story.phoneRinging = false;
    S.sfx('click');
    if (Story.phoneCall2) { const r = await Story.phoneCall2(S); if (r) return; }
    if (st.day === 5) {
      S.flag('phone5');
      await S.say(null, 'You pick up. Nobody says anything.');
      Sound.ambience(['tape'], 0.3);
      await S.wait(1.2); S.sfx('water', { vol: 0.5, far: true }); await S.wait(2.4);
      await S.say(null, 'Water. Just water, moving, very far away.');
      S.sfx('click'); Sound.ambience(['room'], 0.3);
      await S.say(null, 'Click.');
      return;
    }
    if (st.day === 6) {
      S.flag('phone6');
      const W = (t) => S.say('walter', t);
      await W('...It\'s me. It\'s Walter.');
      await W('I\'m sorry I snapped at you today.');
      await S.wait(0.8);
      await W('I didn\'t do anything wrong. You understand? I didn\'t do anything wrong.');
      await W('Come by tomorrow. Early. I want to show you something.');
      await S.wait(0.6);
      await W('Tank 6. I\'ll show you Tank 6.');
      S.sfx('click');
      await S.say(null, 'Click.');
      return;
    }
    await S.say(null, 'You pick up. Nobody is there.');
  },
  async evanDoor(S) {
    const st = S.st;
    if (Story.evanDoor2) { const r = await Story.evanDoor2(S); if (r) return; }
    S.sfx('locked');
    if (st.day === 1) { await S.say(null, 'This door is locked.'); if (!S.get('askedDoor')) S.flag('askedDoor'); return; }
    if (st.day >= 4 && st.day <= 6) { await S.say(null, 'Locked. There\'s a strip of light under the door. Then there isn\'t.'); return; }
    await S.say(null, 'Locked. Walter said it\'s just storage.');
  },
  async basementDoor(S) {
    const st = S.st;
    if (Story.basementDoor2) { const r = await Story.basementDoor2(S); if (r) return; }
    S.sfx('locked');
    await S.say(null, st.day >= 5 ? 'The basement door. It\'s stuck. Cold air comes out around the edges. It smells like the aquarium.' : 'The basement door. It\'s stuck.');
  },
  async houseFrontDoor(S) {
    if (Story.houseFrontDoor2) { const r = await Story.houseFrontDoor2(S); if (r) return; }
    await S.go('town', 'house', { sfx: 'door' });
  },
  async garageDoor(S) {
    const st = S.st;
    if (st.flags.garageOpen) { await S.go('gas', 'garage', { sfx: 'door' }); return; }
    S.sfx('locked');
    await S.say(null, st.day >= 3 ? 'The back garage. Padlocked. Through the gap under the door: a tire, and the smell of old gasoline.' : 'A garage door. Locked.');
  },
  garageInnerMsg(st) { return 'The door to the back garage. Locked. Gus has the key.'; },
  oldCar(st) { return ['Walter\'s old station wagon, under a thin layer of dust. The license plate expired in 1991.', 'In the back seat: a booster seat and a juice box, flattened.']; },
  async glovebox(S) {
    const st = S.st;
    if (!st.inv.includes('concrete')) { await S.say(null, 'The glovebox. Maps, a flashlight with no batteries, and a delivery ticket folded very small.'); await S.give('concrete'); await S.read('concrete'); return; }
    await S.say(null, 'Maps of the city. None of them have been unfolded.');
  },
  async trunk(S) {
    const st = S.st;
    if (!st.found.toy_octopus) { await S.say(null, 'The trunk. A tarp, a shovel with dried concrete on the blade, and under the tarp, a toy.'); await S.give('toy_octopus'); return; }
    await S.say(null, 'A tarp and a shovel. The shovel\'s blade is crusted gray.');
  },
  async tobyDesk(S) {
    const st = S.st;
    if (!st.inv.includes('toby_letter')) { await S.say(null, 'The desk drawer sticks, then opens. Inside, a note folded into a tight triangle.'); await S.give('toby_letter'); await S.read('toby_letter'); return; }
    await S.say(null, 'Pencils. A walkie-talkie with no batteries. The other half of the set is somewhere else.');
  },
  async tobyBed(S) {
    const st = S.st;
    if (!st.inv.includes('toby_diary')) { await S.say(null, 'Under the mattress, a little diary with a lock that doesn\'t work.'); await S.give('toby_diary'); await S.read('toby_diary'); return; }
    await S.say(null, 'A bare mattress. It still has the shape of a kid in it.');
  },
  async sandbox(S) {
    if (Story.sandbox2) { const r = await Story.sandbox2(S); if (r) return; }
    await S.say(null, 'The sandbox. Someone built a castle and then stepped on it.');
  },

  // ---------------------------------------------------------------- HUD & map
  drawHud(ctx) {
    if (Story.drawHud2) Story.drawHud2(ctx);
  },
  historyView(st) {
    const h = st.hist.slice().reverse();
    if (st.day < 8) return h;
    return h.map((t) => {
      if (t.startsWith('EAT THE SANDWICH')) return t + ' (WHY DID YOU)';
      if (t.startsWith('PUT IT IN EVAN')) return 'PUT IT BACK WHERE HE LEFT IT.';
      if (t.startsWith('FEED THE PENGUINS')) return 'FEED THE PENGUINS. FEED MISTER EIGHT. 9:40 PM.';
      return t;
    });
  },
  slotDisguise(s, meta) {
    if (meta.trueDone) return null;
    if (s.flags && s.flags.backpackPlaced) return { name: 'EVAN', day: s.flags.underneath ? 'DAY 1' : 'DAY ' + s.day };
    return null;
  },
};
