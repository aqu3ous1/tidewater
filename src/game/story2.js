'use strict';
// ---------------------------------------------------------------------------
// STORY — part 2: Walter's death, the ghost, the memory, the house.
// ---------------------------------------------------------------------------

Object.assign(Story, {

  // ================================================================ DAY 7 — the anniversary
  async day7(S) {
    Story.walterSpot(S, 'gone');
    await S.wait(0.5);
    await S.say(null, 'It\'s very quiet this morning. No birds.');
    await S.obj('work', 'GO TO WORK.');
  },
  async danaNews(S) {
    const D = (t) => S.say('dana', t);
    S.flag('heardNews'); S.flag('walterDead'); S.flag('metEvan');
    await D('Did you... you didn\'t hear.');
    await D('Walter\'s dead.');
    await S.wait(1.2);
    await D('They found him this morning. At the bottom of the basement stairs. His heart, they think.');
    await D('On the fourteenth. The same day as his... the same day Evan left. Ten years exactly.');
    await D('I don\'t know what happens now. Who feeds the penguins?');
    await D('I\'m supposed to be here. I didn\'t know where else to go.');
    const st = S.st;
    const m = State.getMeta(); m.phase = Math.max(m.phase || 0, 2); State.saveMeta();
    if (S.isObj('work')) S.done('work');
    S.setTod('afternoon');
    await S.obj('what', 'FIND OUT WHAT HAPPENED. (0/3)');
  },
  async afterTalk(S, n) {
    const st = S.st;
    if (st.day === 7 && S.isObj('what') && ['hal', 'donna', 'miller', 'ray', 'gus', 'okafor', 'ellis', 'priya', 'mae', 'lou'].includes(n.id) && !S.get('d7_' + n.id)) {
      S.flag('d7_' + n.id);
      const c = ['hal', 'donna', 'miller', 'ray', 'gus', 'okafor', 'ellis', 'priya', 'mae', 'lou'].filter((k) => S.get('d7_' + k)).length;
      if (c < 3) { st.obj.text = 'FIND OUT WHAT HAPPENED. (' + c + '/3)'; UI.banner(st.obj.text); }
      else {
        S.done('what');
        await S.wait(0.4);
        await S.say(null, 'Everybody tells it a little differently. Walter was devastated. Walter never seemed upset. Evan ran away. Evan never left.');
        S.setTod('evening');
        await S.obj('home7', 'GO HOME.');
      }
    }
  },
  async bed2(S) {
    const st = S.st;
    if (st.day === 7 && S.isObj('sleep7a')) {
      S.done('sleep7a');
      await S.say(null, 'You lie down.');
      await S.fade(1, 1.5);
      await S.wait(1.5);
      S.setTod('night');
      S.unflag('canSleep');
      await S.fade(0, 1.0);
      await S.say(null, 'You can\'t sleep.');
      await S.wait(1.5);
      Story.startRinging(); S.flag('unplugged');
      await S.wait(3);
      await S.say(null, 'The phone is ringing. The phone you unplugged when you moved in.');
      return true;
    }
    if (st.day === 7 && st.tod === 'night' && !S.get('backpackPlaced')) { await S.say(null, 'You can\'t sleep.'); return true; }
    if (st.day === 7 && S.isObj('sleep7')) {
      const c = await S.ask(null, 'Go to sleep?', ['YES', 'NO']);
      if (c === 0) { S.flag('canSleep'); await Story.sleep(S); }
      return true;
    }
    if (st.day >= 8) {
      if (st.tod === 'night') { await S.say(null, 'There\'s someone lying in your bed, facing the wall. It\'s a pile of blankets. It\'s just a pile of blankets.'); return true; }
      const c = await S.ask(null, 'You\'re not tired. You don\'t think you\'ll ever be tired again.', ['SAVE', 'NEVERMIND']);
      if (c === 0) await Menus.saveSlots('save', 'DAY 8');
      return true;
    }
    return false;
  },
  async phoneCall2(S) {
    const st = S.st;
    if (st.day === 7 && S.get('unplugged') && !S.get('phone7')) {
      S.flag('phone7');
      await S.say(null, 'You pick up.');
      S.music('aquarium', { vol: 0.35, restart: true });
      await S.wait(5);
      S.stopMusic(0.4);
      await S.say(null, 'Music. The aquarium music, very far away, like it\'s coming through water.');
      S.sfx('click');
      await S.say(null, 'Click.');
      await S.obj('aq7', 'GO TO THE AQUARIUM.');
      return true;
    }
    return false;
  },
  async enterAq2(S) {
    const st = S.st;
    if (st.day === 7 && st.tod === 'night' && S.isObj('aq7')) {
      S.done('aq7');
      await S.say(null, 'The front doors were unlocked. The lights are all on.');
      await S.say(null, 'The music is playing. There\'s nobody here.');
    }
    if (st.day === 8 && !st.flags.lightsOut && !S.get('aq8') && S.get('remembered')) {
      S.flag('aq8');
      await S.obj('tank6', 'COME SEE TANK 6.', { voice: 'walter' });
    }
    if (st.flags.lightsOut && st.checkpoint !== true) Story.stealthReset();
  },
  async ghostMeet(S) {
    const st = S.st;
    const g = World.npc('ghost');
    S.flag('ghostMet');
    const m = State.getMeta(); m.phase = Math.max(m.phase || 0, 3); State.saveMeta();
    await S.wait(0.8);
    if (g) { g.face = Math.atan2(World.player.x - g.x, -(World.player.z - g.z)); }
    await S.wait(1.2);
    const G = (t) => S.say('walter_ghost', t);
    await G('You came back.');
    Sound.musicMods({ tempo: 0.6, detune: 40 });
    await S.wait(0.9);
    Sound.stopMusic(0.2);
    Story.musicOverride = null;
    await S.wait(1.5);
    await G('Don\'t be frightened. It\'s only me.');
    await G('They think I fell. I didn\'t fall. I was only going downstairs.');
    await G('I\'ve been thinking about Evan. All day. All these years.');
    await Story.askHelp(S);
  },
  async askHelp(S) {
    const G = (t) => S.say('walter_ghost', t);
    const c = await S.ask('walter_ghost', 'Will you help me with something?', ['YES', 'NO']);
    if (c !== 0) { await G('I\'ll wait.'); await G('I\'m good at waiting.'); return; }
    S.flag('helping');
    await G('Evan had a blue backpack. He took it everywhere.');
    await G('I kept it. Somewhere safe. Here, somewhere in the building.');
    await G('I don\'t remember where. My memory isn\'t what it was.');
    await S.obj('backpack', 'FIND EVAN\'S BLUE BACKPACK.', { voice: 'walter' });
  },
  ghostWhere(st) {
    const f = st.flags;
    if (st.day === 7 && st.tod === 'night') {
      if (!f.ghostMet) return { map: 'aquarium', x: 0, z: -27.4, face: 'n', noShadow: true };
      if (!st.inv.includes('backpack') && !f.backpackPlaced) return { map: 'aquarium', x: -1.5, z: -24.5, face: 's', noShadow: true };
      return null;
    }
    if (st.day >= 8) {
      if (st.map === 'underneath') return Story.rememberCount(st) >= 7 ? null : { map: 'underneath', x: 0, z: -36, face: 's', noShadow: true, flicker: 0.02 };
      if (f.lightsOut && st.map === 'aquarium' && !f.leftAquariumFinal) return { map: 'aquarium', x: 0, z: -12, face: 's', noShadow: true, set: 'walter_blank', noTalk: true, solid: false, patrol: true, speed: 1.5 };
      if (st.map === 'aquarium' && !f.lightsOut && !f.tank6Talked && f.remembered) return { map: 'aquarium', x: 0, z: -27.2, face: 's', noShadow: true };
      if (st.map === 'town' && st.tod !== 'night' && !f.ghostTownSeen) return { map: 'town', x: -72, z: 22, face: 'e', noShadow: true, noTalk: true, far: true };
    }
    return null;
  },
  async ghostTalk(S, n) {
    const st = S.st, f = st.flags, G = (t) => S.say('walter_ghost', t);
    if (st.map === 'underneath') return Story.hubWalter(S);
    if (st.day === 8 && st.map === 'aquarium' && !f.tank6Talked) return Story.tank6b(S);
    if (st.day === 7) {
      if (!f.helping) return Story.askHelp(S);
      // remarks — each only once. He knows what you did.
      const remarks = [];
      if (f.officeOpen || f.caughtInOffice) remarks.push(['r_office', 'You opened that door. The one that said OWNER ONLY.']);
      if (f.ateSandwich) remarks.push(['r_sand', 'You ate every bite. Good. I hate wasting food.']);
      if (f.trashedSandwich) remarks.push(['r_sand2', 'You threw my sandwich away. I watched you do it.']);
      if (f.toldMiller) remarks.push(['r_miller', 'You told Margaret. She cried all night. Did you know that?']);
      if (f.cardRetrieved) remarks.push(['r_card', 'You took the card back out of the trash. I saw.']);
      if (f.readRecords) remarks.push(['r_rec', 'You\'ve been reading about my son.']);
      const pending = remarks.find(([k]) => !f[k]);
      if (pending) { S.flag(pending[0]); await G(pending[1]); return; }
      if (!st.inv.includes('backpack')) { await G('Evan used his birthday for everything. His locks. His secret clubs. The passwords for his radio show.'); await G('He\'d have kept it somewhere with a lock on it.'); return; }
      await G('Go on. Take it home.');
      return;
    }
    await G('...');
  },
  async locker(S) {
    const st = S.st;
    if (st.inv.includes('backpack') || st.flags.backpackPlaced) { await S.say(null, 'Locker 6. Empty now. There\'s a sticker on the inside of the door: a cartoon octopus.'); return; }
    if (!(st.day === 7 && st.flags.helping)) {
      await S.say(null, 'Staff lockers. Number 6 has a combination lock on it. It has never been opened while you were here.');
      if (st.day >= 6) await S.say(null, 'Locker 3 is empty. Scratched into the inside of the door, very small: DON\'T FINISH IT.');
      return;
    }
    await S.say(null, 'Locker 6. A four-number combination lock.');
    const code = await S.numpad(4, { title: 'LOCKER 6' });
    if (code == null) return;
    if (code !== '0812') {
      S.sfx('locked'); await S.say(null, 'The lock doesn\'t open.');
      S.flag('lockerTries', (S.get('lockerTries') || 0) + 1);
      if (S.get('lockerTries') === 2) { UI.subtitle = 'His birthday. He used his birthday for everything.'; await S.wait(2.5); UI.subtitle = null; }
      if (S.get('lockerTries') >= 3) { UI.subtitle = 'August. The twelfth. I always forgot it. He never let me forget.'; await S.wait(3); UI.subtitle = null; }
      return;
    }
    S.sfx('switch'); await S.wait(0.4); S.sfx('door', { vol: 0.5 });
    await S.say(null, 'The lock opens. Inside, folded up very neatly: a blue backpack.');
    await S.give('backpack');
    S.done('backpack');
    await S.wait(0.6);
    const g = World.addNpc({ id: 'ghost', set: 'walter_ghost', x: 49.5, z: -29.2, face: Math.PI, slide: true, talk: NPCS.ghost.talk, noShadow: true });
    S.face('ghost', 'player');
    const G = (t) => S.say('walter_ghost', t);
    await G('You found it.');
    await G('Don\'t open it.');
    await G('Just take it home. Take it to his room. Put it on his bed, where it goes.');
    await G('Here. The key to his room. I\'ve kept it all this time.');
    await S.give('room_key');
    await S.obj('house7', 'TAKE IT TO THE HOUSE.', { voice: 'walter' });
    World.removeNpc('ghost');
    S.sfx('flicker');
  },
  async openBackpack(S) {
    const st = S.st;
    S.flag('backpackOpened');
    await S.say(null, 'You open the backpack.');
    await S.say(null, 'A tape recorder with a cassette still in it. An inhaler. A sandwich bag of crayons. A walkie-talkie.');
    await S.give('tape12');
    await S.give('inhaler');
    if (!st.flags.warnedTape) {
      S.flag('warnedTape');
      await UI.banner('DON\'T PLAY THE TAPE.', 'walter');
      S.side('notape', 'DON\'T PLAY THE TAPE.', { voice: 'walter', quiet: true });
    }
  },
  async playTape12(S) {
    const st = S.st;
    if (st.flags.playedTape) {
      const c = await S.ask(null, 'Play it again?', ['YES', 'NO']);
      if (c !== 0) return;
    }
    S.flag('playedTape');
    S.sideDone('notape');
    const E = (t) => S.say('evan_tape', t), T = (t) => S.say('tape', t), N = (t) => S.say(null, t);
    const prevMusic = Sound.current;
    S.stopMusic(0.2);
    Sound.ambience(['tape'], 0.2);
    S.sfx('tapeclick');
    await S.wait(1.0);
    await E('"This is Radio Evan, episode twelve! Live from... the Bellwood Aquarium. At NIGHT."');
    await E('"It\'s 9:40. I just fed Mister Eight. He took both crabs. He knows it\'s me."');
    await E('"Now we\'re going to the pump room. This is where all the water goes. It\'s really loud."');
    Sound.ambience(['tape', 'pump'], 0.5);
    await E('"This is the big valve. Dad says don\'t touch it. It\'s leaking again. See?"');
    S.sfx('thud', { vol: 0.5 }); S.sfx('water', { vol: 0.9 });
    await T('[a loud crack] [rushing water]');
    await E('"Oh no. No no no—"');
    S.sfx('step', { surf: 'metal', vol: 0.8 }); await S.wait(0.2); S.sfx('step', { surf: 'metal', vol: 0.8 });
    await T('[footsteps on the stairs]');
    await T('"EVAN?"');
    await E('"Dad! I didn\'t— it just broke, I didn\'t touch it, I swear—"');
    await T('"LOOK WHAT YOU DID. LOOK AT IT."');
    await E('"Dad, you\'re hurting my arm— DAD—"');
    S.sfx('thud', { vol: 1 });
    await S.wait(1.6);
    await T('[water]');
    await S.wait(1.4);
    await T('[water]');
    await S.wait(1.8);
    await T('"...Evan?"');
    await S.wait(1.5);
    await N('The tape keeps playing for eleven more minutes. There is only water.');
    S.sfx('tapeclick');
    Sound.ambience([], 0.4);
    Game.applyAudio();
    if (st.day === 7 || st.day === 8) {
      await S.wait(0.5);
      if (!st.flags.tapeRemark) { S.flag('tapeRemark'); UI.subtitle = 'You played it.'; await S.wait(2.5); UI.subtitle = null; }
    }
  },
  async enterHouse2(S) {
    const st = S.st;
    if (st.day === 7 && S.isObj('house7')) { S.done('house7'); await S.obj('place', 'PUT IT IN EVAN\'S BEDROOM.', { voice: 'walter' }); }
    if (st.day === 8 && S.isObj('gohome8')) {
      S.done('gohome8');
      await S.wait(0.5);
      await S.obj('lock', 'LOCK THE DOOR.');
    }
  },
  async evanDoor2(S) {
    const st = S.st;
    if (st.flags.finalChase) { S.flag('underneath'); await Story.enterUnderneath(S); return true; }
    if (st.inv.includes('room_key') || st.flags.backpackPlaced) {
      if (!S.get('evanRoomOpened')) { S.flag('evanRoomOpened'); S.sfx('switch'); await S.say(null, 'The little brass key turns. The door you\'ve walked past every day opens.'); }
      await S.go('evanroom', 'front', { sfx: 'door' });
      return true;
    }
    return false;
  },
  async enter_evanroom(S) {
    const st = S.st;
    if (st.day === 7 && !S.get('sawEvanRoom')) {
      S.flag('sawEvanRoom');
      await S.say(null, 'The room is exactly how an eleven-year-old leaves a room. There\'s no dust anywhere.');
      await S.say(null, 'Somebody has been cleaning in here. For a long time.');
    }
    if (st.day === 8 && !S.get('day8Woke') && st.flags.sleptEvanBed) { S.flag('day8Woke'); await S.say(null, 'You wake up in Evan\'s bed. The blanket has fish on it. It smells like somebody else\'s soap.'); }
  },
  async leaveEvanRoom(S) {
    const st = S.st;
    if (st.day === 7 && S.isObj('place')) { await S.say(null, 'You\'re still carrying the backpack.'); return; }
    await S.go('house', 'evan', { sfx: 'door' });
  },
  async evanBed(S) {
    const st = S.st;
    if (S.isObj('place') && st.inv.includes('backpack')) {
      S.take('backpack'); S.flag('backpackPlaced');
      S.sfx('paper');
      await S.say(null, 'You set the backpack on the bed, where it goes.');
      S.done('place');
      S.reload();
      await S.wait(1.2);
      const g = World.addNpc({ id: 'ghost', set: 'walter_ghost', x: 0.1, z: 2.3, face: 0, slide: true, talk: NPCS.ghost.talk, noShadow: true });
      S.sfx('flicker');
      const G = (t) => S.say('walter_ghost', t);
      await G('There.');
      await G('That\'s better. That\'s how it should be.');
      await S.say(null, 'The photo on the desk has changed. It\'s a school portrait. It\'s you.');
      await G('It\'s late. Get some sleep.');
      await G('You can sleep in here, if you like. The bed\'s made.');
      World.removeNpc('ghost'); S.sfx('flicker');
      await S.obj('sleep7', 'GO TO SLEEP.', { voice: 'walter' });
      return;
    }
    if (st.day === 7 && S.isObj('sleep7')) {
      const c = await S.ask(null, 'Sleep in Evan\'s bed?', ['YES', 'NO']);
      if (c === 0) { S.flag('sleptEvanBed'); S.flag('canSleep'); await Story.sleep(S); }
      else await S.say(null, 'You have your own bed.');
      return;
    }
    await S.say(null, st.flags.backpackPlaced ? 'Evan\'s bed. The blue backpack is on it, where it goes.' : 'Evan\'s bed. The blanket has fish on it. It\'s tucked in very tight, like a hospital bed.');
  },
  evanPhoto(st) {
    if (st.flags.backpackPlaced || st.day >= 8) return ['A school portrait in a little frame. The kid in it is wearing a brass diving helmet.', 'It\'s you. Picture Day, 1991.'];
    return ['A school portrait in a little frame. A boy with messy brown hair and a missing front tooth, trying not to laugh.'];
  },

  // ================================================================ DAY 8 — the memory
  async day8(S) {
    const st = S.st;
    Story.musicOverride = undefined;
    await S.wait(0.8);
    if (st.flags.sleptEvanBed) { S.flag('day8Woke'); await S.say(null, 'You wake up in Evan\'s bed. The blanket has fish on it. It smells like somebody else\'s soap.'); }
    else await S.say(null, 'You wake up. Something is different. It takes you a second.');
    await S.say(null, 'Everything is a little too quiet. Like a picture of a morning.');
    await S.obj('photo', 'FIND THE PHOTOGRAPH.', { voice: 'walter' });
  },
  async mailbox2(S) {
    const st = S.st;
    if (st.day >= 8 && !st.found.news3) { await S.say(null, 'The newspaper. It\'s yellow and brittle.'); await S.give('news3'); await S.read('news3'); return true; }
    return false;
  },
  async photoChoice(S) {
    const st = S.st;
    if (S.get('photoTaken')) { await S.say(null, 'The desk.'); return; }
    const opts = ['A: WALTER AND A HELMET', 'B: A FAMILY AND A KITTEN', 'C: WALTER ALONE', 'LEAVE THEM'];
    const ids = ['photo_you', 'photo_family', 'photo_gap'];
    await S.say(null, 'Three photographs on the desk, laid out in a row. They are all the same size. Only one of them is real.');
    for (;;) {
      const c = await S.ask(null, 'Which one?', opts);
      if (c === 3) return;
      await S.inspect(ids[c]);
      const t = await S.ask(null, 'Take this one?', ['YES', 'NO']);
      if (t === 0) {
        await S.give(ids[c]);
        S.flag('photoTaken', ['you', 'family', 'gap'][c]);
        S.reload();
        S.done('photo');
        await S.obj('hang', 'PUT THE PHOTOGRAPH ON THE WALL.', { voice: 'walter' });
        return;
      }
    }
  },
  async hangPhoto(S) {
    const st = S.st;
    const which = st.flags.photoTaken;
    const id = { you: 'photo_you', family: 'photo_family', gap: 'photo_gap' }[which];
    if (!id || !st.inv.includes(id)) { await S.say(null, 'An empty nail.'); return; }
    S.take(id); S.flag('photoHung', which); S.sfx('click');
    S.reload();
    await S.say(null, 'You hang the photograph on the nail. It fits the clean rectangle on the wallpaper exactly.');
    S.done('hang');
    if (which === 'you') {
      S.flag('walterPath', (S.get('walterPath') || 0) + 1);
      await S.wait(0.6);
      UI.subtitle = 'That\'s right.'; await S.wait(2.2); UI.subtitle = null;
    } else if (which === 'family') {
      S.flag('truthPath');
      const e = World.addNpc({ id: 'evanflash', set: 'evan_ghost', x: 1.2, z: 4.6, face: Math.PI, noTalk: true, solid: false, noShadow: true });
      S.sfx('flicker');
      await S.wait(1.3);
      World.removeNpc('evanflash');
      await S.wait(0.6);
      await UI.banner('DON\'T TRUST WALTER.', 'evan', { dur: 5 });
      S.side('donttrust', 'DON\'T TRUST WALTER.', { voice: 'evan', quiet: true });
    } else {
      await S.wait(0.8);
      await S.say(null, 'Nothing happens. The hole in the photo lines up with the empty wall behind it.');
    }
    await S.obj('playground', 'GO TO THE PLAYGROUND.', { voice: 'walter' });
  },
  async sandbox2(S) {
    const st = S.st;
    if (st.day >= 8 && !st.inv.includes('key_t6')) {
      await S.say(null, 'Something small is buried in the sandbox. Right where a kid would bury something.');
      const ok = await Story.hold('DIGGING', 1.6);
      if (!ok) { await S.say(null, 'Hold Z to dig.'); return true; }
      await S.give('key_t6');
      const wasGuided = S.isObj('key') || S.isObj('playground') || S.isObj('photo') || S.isObj('hang');
      if (wasGuided) { S.done(st.obj.id); await S.obj('openbasement', 'OPEN THE BASEMENT.', { voice: 'walter' }); }
      return true;
    }
    return false;
  },
  async basementDoor2(S) {
    const st = S.st;
    if (st.day >= 8 && (st.inv.includes('key_t6') || st.flags.houseBasementOpen)) {
      if (!S.get('houseBasementOpen')) {
        S.flag('houseBasementOpen');
        S.sfx('door');
        await S.say(null, 'The basement door opens easily now. The stairs go down much further than a house\'s stairs should.');
        await S.say(null, 'At the bottom, you can hear a pump.');
      }
      if (S.isObj('openbasement')) S.done('openbasement');
      await S.go('basement', 'house', { sfx: 'door', hold: 0.6 });
      return true;
    }
    return false;
  },
  async enter_basement(S) {
    const st = S.st;
    if (st.day >= 8 && !st.flags.lightsOut && !S.get('pumpGhost')) {
      S.flag('pumpGhost');
      await S.wait(0.8);
      World.addNpc({ id: 'ghost', set: 'walter_ghost', x: 0, z: 4.2, face: 0, slide: true, talk: NPCS.ghost.talk, noShadow: true });
      S.face('ghost', 'player'); S.sfx('flicker');
      const G = (t) => S.say('walter_ghost', t);
      await G('You shouldn\'t go downstairs.');
      await S.wait(0.8);
      await G('...You\'re already downstairs. Of course you are. Evan was always curious.');
      await G('That door, there. It doesn\'t go anywhere. That room doesn\'t exist anymore.');
      World.removeNpc('ghost'); S.sfx('flicker');
      await S.wait(0.6);
      await S.obj('where', 'FIND WHERE EVAN DIED.', { voice: 'evan' });
    }
  },
  async pumpValve(S) {
    const st = S.st;
    if (!st.inv.includes('work_order') && (st.day >= 8 || (st.day === 7 && st.flags.ghostMet))) {
      await S.say(null, 'The main intake valve. The housing has been replaced. The new metal is shinier than everything around it.');
      await S.say(null, 'A clipboard hangs on a nail beside it. The top sheet is ten years old.');
      await S.give('work_order'); await S.read('work_order');
      return;
    }
    await S.say(null, 'The main intake valve. A big red wheel. The pipe underneath it sweats.');
  },
  async pumpDrain(S) {
    const st = S.st;
    if (!st.inv.includes('fabric') && (st.day >= 8 || (st.day === 7 && st.flags.ghostMet))) {
      await S.say(null, 'A floor drain. Something is caught in the grate, deep down. You work it out with two fingers.');
      await S.give('fabric');
      await S.say(null, 'Blue and white stripes.');
      return;
    }
    await S.say(null, 'A floor drain. The water in it isn\'t moving.');
  },
  async pumpStairs(S) {
    const st = S.st;
    if (st.day >= 8 || (st.day === 7 && st.flags.ghostMet)) {
      await S.say(null, 'The third step from the bottom. There\'s a dark stain on the edge. It has been scrubbed and scrubbed.');
      if (!st.inv.includes('tooth')) {
        await S.say(null, 'Something is wedged in the crack where the step meets the wall.');
        await S.give('tooth');
      }
      if (S.isObj('where')) {
        S.done('where'); S.flag('remembered');
        await S.wait(0.5);
        await S.obj('rememberwhat', 'REMEMBER WHAT HAPPENED.', { voice: 'evan' });
        await S.wait(1.5);
        await S.say(null, 'Above you, at the top of the stairs, the aquarium is quiet. It\'s waiting.');
      }
      return;
    }
    await S.say(null, 'Concrete stairs up to the staff hallway. The third step is chipped.');
  },
  basementOpen(st) { return st.day >= 8 || (st.day === 7 && st.flags.ghostMet); },
  basementLockedMsg(st) { return st.day >= 6 ? 'MAINTENANCE. Locked. The doorknob is cold.' : 'MAINTENANCE - AUTHORIZED PERSONNEL ONLY.'; },
  async tank6b(S) {
    const st = S.st;
    if (st.day < 8) return false;
    if (st.flags.tank6Talked || !World.npc('ghost')) {
      await S.say(null, 'TANK 6. THE DEEP. The plywood is gone. The water behind the glass is so dark it looks solid.');
      await S.say(null, 'At the very bottom, the floor of the tank is a slab of pale concrete.');
      return true;
    }
    S.flag('tank6Talked');
    if (S.isObj('tank6')) S.done('tank6');
    const G = (t) => S.say('walter_ghost', t);
    S.face('ghost', 'player');
    await G('There it is. The Deep. Forty thousand gallons.');
    await G('It was going to be the best tank in the world. And then everything was going to be fine.');
    await S.wait(0.8);
    await G('Some things are better left buried.');
    await G('Children don\'t understand consequences. You understand. You\'re a good kid.');
    await G('Go home now. Leave it alone.');
    World.removeNpc('ghost'); S.sfx('flicker');
    await S.obj('leaveit', 'LEAVE IT ALONE.', { voice: 'walter' });
    await S.wait(1.2);
    await UI.banner('OPEN THE DOOR WALTER TOLD YOU NOT TO OPEN.', 'evan', { dur: 5 });
    S.side('opendoor', 'OPEN THE DOOR WALTER TOLD YOU NOT TO OPEN.', { voice: 'evan', quiet: true });
    return true;
  },
  async tunnelDoor(S) {
    const st = S.st;
    if (!st.inv.includes('key_t6')) { S.sfx('locked'); await S.say(null, 'T6 - NO ENTRY. The door is locked with a heavy padlock.'); return; }
    if (!(st.day >= 8)) { S.sfx('locked'); await S.say(null, 'Locked.'); return; }
    await S.say(null, 'The key with the strange label fits the padlock.');
    const c = await S.ask(null, 'Go through? You have a feeling you won\'t be coming back.', ['GO THROUGH', 'NOT YET']);
    if (c !== 0) return;
    S.flag('tunnelOpen'); S.sideDone('opendoor'); if (S.isObj('leaveit')) S.done('leaveit');
    S.sfx('switch'); S.sfx('door');
    S.reload();
    await S.obj('findevan', 'FIND EVAN.', { voice: 'evan' });
  },
  async chamberPatch(S) {
    await S.say(null, 'A rectangle of newer concrete, lighter than the rest. Someone smoothed it very carefully with the back of a shovel.');
    await S.say(null, 'It\'s about the size of a child.');
  },
  async foundShoe(S) {
    const st = S.st;
    await S.wait(1.2);
    World.addNpc({ id: 'ghost', set: 'walter_ghost', x: 0, z: -40.6, face: Math.PI, slide: true, noShadow: true, noTalk: true });
    S.sfx('flicker');
    S.face('ghost', 'player');
    const G = (t) => S.say('walter_ghost', t);
    await G('That room doesn\'t exist anymore.');
    await G('I filled it in. I filled it all in.');
    await S.wait(1);
    await G('You know too much.');
    S.done('findevan');
    S.sfx('switch', { vol: 1.2 });
    S.flag('lightsOut');
    World.removeNpc('ghost');
    Sound.stopMusic(0.05);
    S.reload();
    S.sfx('sting');
    await S.wait(1.2);
    await S.obj('leave', 'LEAVE THE AQUARIUM.');
    await S.wait(1.0);
    await UI.banner('DON\'T LET WALTER SEE YOU.', 'evan', { dur: 5 });
    S.side('dontsee', 'DON\'T LET WALTER SEE YOU.', { voice: 'evan', quiet: true });
    Story.checkpoint(S, 'basement', 'chamber');
  },
  async aqFrontDoor2(S) {
    const st = S.st;
    if (st.day === 7 && st.tod === 'night' && st.flags.ghostMet && !st.inv.includes('backpack') && !st.flags.backpackPlaced) {
      S.sfx('locked');
      await S.say(null, 'The door won\'t open.');
      if (!st.flags.helping) await S.say(null, 'Behind you, Walter is still waiting for an answer.');
      return true;
    }
    if (st.flags.lightsOut && !st.flags.leftAquariumFinal) {
      S.flag('leftAquariumFinal');
      S.done('leave'); S.sideDone('dontsee');
      Story.stealth = null;
      await S.go('town', 'aquarium', { sfx: 'door' });
      S.setTod('night');
      await S.wait(0.8);
      await S.obj('gohome8', 'GO HOME.');
      Story.checkpoint(S, 'town', 'aquarium');
      return true;
    }
    return false;
  },

  // ---------------------------------------------------------------- stealth
  stealth: null,
  stealthReset() {
    Story.stealth = { meter: 0, wp: 0, heard: null, stepT: 0, route: [[-10, -4], [10, -4], [10, -22], [-10, -22]], lookT: 0 };
  },
  updateStealth(dt) {
    const st = Game.st;
    const g = World.npc('ghost');
    if (!g || !Story.stealth) return;
    const s = Story.stealth, p = World.player;
    if (Script.busy || UI.busy) return;
    // movement: patrol, or go investigate a noise
    if (!g.path.length) {
      if (s.heard) { g.path = [s.heard]; s.heard = null; s.lookT = 2.5; }
      else if (s.lookT > 0) { s.lookT -= dt; g.face += dt * 1.6; }
      else { s.wp = (s.wp + 1) % s.route.length; g.path = [s.route[s.wp]]; }
    }
    g.speed = 1.55;
    s.stepT -= dt;
    const d = Math.hypot(p.x - g.x, p.z - g.z);
    if (s.stepT <= 0 && g.moving) { s.stepT = 0.55; Sound.sfx('step', { surf: 'tile', vol: clamp(1.4 - d / 14, 0.05, 1), far: d > 8 }); }
    // hearing: running is loud
    if (p.moving && p.run && d < 11 && !s.heard) s.heard = [p.x, p.z];
    // sight
    const toP = Math.atan2(p.x - g.x, -(p.z - g.z));
    const inCone = Math.abs(angDiff(g.face, toP)) < 0.75 && d < 7;
    const inRoom = st.map === 'aquarium' && p.x > -32 && p.x < 16 && p.z < 16;
    if ((inCone && inRoom) || d < 1.1) s.meter += dt * (d < 3 ? 3 : 1.5); else s.meter = Math.max(0, s.meter - dt * 0.6);
    if (s.meter >= 1) { s.meter = 0; Script.run((S) => Story.caught(S)); }
  },
  drawHud2(ctx) {
    const s = Story.stealth;
    if (s && Game.st.flags.lightsOut && s.meter > 0.02 && Game.st.map === 'aquarium') {
      const a = clamp(s.meter, 0, 1);
      ctx.globalAlpha = 0.4 + a * 0.6;
      UI.fill(ctx, 146, 14, 28, 12, '#000');
      ctx.fillStyle = a > 0.6 ? '#e8e8f0' : '#8aa0c0';
      ctx.beginPath(); ctx.ellipse(160, 20, 12, 3 + a * 3, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#000'; ctx.fillRect(158, 18, 4, 4);
      ctx.globalAlpha = 1;
    }
  },

  // ---------------------------------------------------------------- death
  checkpoint(S, map, spawn) {
    const cp = State.clone(S.st);
    cp.map = map; cp.spawn = spawn; cp.checkpoint = true; cp.pos = null;
    Story._cp = cp;
  },
  async caught(S) {
    const st = S.st;
    if (Story._dying) return;
    Story._dying = true;
    Story.stealth = null;
    Sound.stopMusic(0.01); Sound.ambience([], 0.01);
    UI.clearBanner(); UI.subtitle = null;
    R.settings.fade = 1; R.settings.fadeColor = [0, 0, 0];
    S.sfx('thud', { vol: 1.2 });
    Game.paused = true;
    await S.wait(4);
    Game.paused = false;
    const meta = State.getMeta();
    meta.deaths = (meta.deaths || 0) + 1;
    State.saveMeta();
    const deaths = (st.flags.deathCount || 0) + 1;
    Story._dying = false;
    if (deaths >= 2) { await Endings.trapped(S); return; }
    const cp = Story._cp || State.clone(st);
    cp.flags.deathCount = deaths; cp.flags.deathPhoto = true; cp.checkpoint = true; cp.deaths = deaths;
    State.save(3, cp);
    Title.show();
  },
  async resumeCheckpoint(S) {
    const st = S.st;
    delete st.checkpoint;
    if (st.flags.lightsOut && st.map === 'basement') Story.stealthReset();
    if (st.obj) await UI.banner(st.obj.text, st.obj.voice);
    if (st.flags.deathCount && !st.flags.deathNoted) { st.flags.deathNoted = true; await S.wait(1.5); UI.subtitle = '...'; await S.wait(1.5); UI.subtitle = null; }
    if (st.map === 'aquarium' && st.flags.lightsOut) Story.stealthReset();
  },

  // ---------------------------------------------------------------- the house, last night
  async houseFrontDoor2(S) {
    const st = S.st;
    if (st.day >= 8 && st.tod === 'night') {
      if (S.isObj('lock')) {
        S.sfx('switch'); await S.wait(0.3); S.sfx('locked');
        await S.say(null, 'You lock the door.');
        S.done('lock'); S.flag('doorLocked');
        await S.wait(2);
        S.sfx('flicker');
        await S.wait(0.5);
        await S.obj('inside', 'HE\'S ALREADY INSIDE.', { wait: 3 });
        World.addNpc({ id: 'ghost', set: 'walter_ghost', x: -4.6, z: -6.8, face: 0, slide: true, noShadow: true, noTalk: true, solid: false });
        S.flag('walterInside');
        return true;
      }
      if (st.flags.doorLocked) { S.sfx('locked'); await S.say(null, 'The lock won\'t turn back.'); return true; }
    }
    return false;
  },
  async finalSpeech(S) {
    const st = S.st, f = st.flags, meta = State.getMeta();
    S.flag('finalSpeech');
    const G = (t) => S.say('walter_ghost', t);
    await S.wait(0.5);
    await G('Don\'t come any closer. I\'m not ready for you to see me.');
    await G('You\'ve been playing for a long time.');
    await G(Story.playtimeWords(st.playtime) + '.');
    const rt = Story.realTime();
    await G('It\'s ' + rt.str + ' where you are.');
    if (rt.late) await G('You should be asleep. Evan never went to sleep when he was told, either.');
    if (st.flags.pendingQuitLine || meta.quitMidGhost) { S.flag('saidQuit'); meta.quitMidGhost = false; State.saveMeta(); await G('You left, once. Right in the middle. And then you came back.'); await G('Why did you come back?'); }
    if (f.deathCount) await G('You already died once. Don\'t you remember? I had to put you back.');
    await G('{name}.');
    await G('That isn\'t your real name, is it.');
    await S.wait(1);
    await G('It doesn\'t matter. I\'ll give you a better one.');
    await G('You can stay. You can stay here with me. Your room is just how you left it.');
    const g = World.npc('ghost');
    if (g) { g.face = Math.atan2(World.player.x - g.x, -(World.player.z - g.z)); g.set = 'walter_ghost'; }
    S.sfx('sting');
    await S.obj('evanroom', 'GO TO EVAN\'S ROOM.', { voice: 'evan' });
    S.flag('finalChase');
    Story.chase = { t: 0 };
  },
  updateChase(dt) {
    const g = World.npc('ghost'), p = World.player;
    if (!g || !Story.chase || Script.busy || UI.busy) return;
    Story.chase.t += dt;
    const d = Math.hypot(p.x - g.x, p.z - g.z);
    const sp = 1.15 + Math.min(1.2, Story.chase.t * 0.03);
    g.path = [[p.x, p.z]]; g.speed = sp;
    if (Math.random() < dt * 0.4) Sound.sfx('flicker', { vol: 0.4 });
    const whispers = ['Evan never listened either.', 'Where are you going?', 'I made this room for you.', 'Nobody is coming.'];
    Story.chase.w = (Story.chase.w || 0) - dt;
    if (Story.chase.w <= 0) { Story.chase.w = 4; UI.subtitle = whispers[Math.floor(Math.random() * whispers.length)]; setTimeout(() => { UI.subtitle = null; }, 2200); }
    if (d < 0.9) { Story.chase = null; UI.subtitle = null; Script.run((S) => Story.caught(S)); }
  },
  async enterUnderneath(S) {
    Story.chase = null; UI.subtitle = null;
    S.sfx('door');
    await S.fade(1, 0.3, '#ffffff');
    await S.wait(0.8);
    Game.enterMap('underneath', 'arrive');
    await S.fade(0, 1.4, '#ffffff');
    await S.say(null, 'Behind the door there is no room.');
    await S.obj('remember', 'REMEMBER.', { voice: 'evan' });
    Story.checkpoint(S, 'underneath', 'arrive');
  },

  // ---------------------------------------------------------------- per-frame story logic
  update2(dt) {
    const st = Game.st, f = st.flags, p = World.player;
    if (!World.map) return;
    const map = st.map;
    // day 4: you haven't eaten your lunch
    if (st.day === 4 && map === 'aquarium' && st.obj && st.obj.id === 'eat' && p.x > 20.5 && p.x < 22.5 && p.z > -28.4 && !Script.busy) {
      p.z = -28.6;
      Script.run(async (S) => { await S.say('walter', 'You haven\'t eaten your lunch.'); });
    }
    // day 6: snooping in Walter's office
    if (st.day === 6 && map === 'aquarium' && f.snoopStart != null && f.walterSpot === 'asleep' && !Script.busy) {
      const inOffice = p.x > 27 && p.x < 36 && p.z < -28.2;
      const t = World.time - f.snoopStart;
      if (!inOffice && st.obj && st.obj.id === 'leave6') Script.run((S) => Story.leaveOffice(S, false));
      else if (inOffice && t > 75) Script.run((S) => Story.leaveOffice(S, true));
      else if (inOffice && t > 55 && Math.random() < dt * 0.6) Sound.sfx('thud', { vol: 0.15 });
    }
    // day 7 night: meeting the ghost
    if (st.day === 7 && st.tod === 'night' && map === 'aquarium' && !f.ghostMet && !Script.busy) {
      const g = World.npc('ghost');
      if (g && Math.hypot(p.x - g.x, p.z - g.z) < 5.5) Script.run((S) => Story.ghostMeet(S));
    }
    // day 8: far-away figures vanish when you get close
    if (st.day >= 8 && map === 'town') {
      for (const id of ['bea', 'tommy']) {
        const n = World.npc(id);
        if (n && Math.hypot(p.x - n.x, p.z - n.z) < 10) { World.removeNpc(id); f.kidsVanished = true; Sound.sfx('laugh', { far: true, vol: 0.6 }); }
      }
      const g = World.npc('ghost');
      if (g && g.far && Math.hypot(p.x - g.x, p.z - g.z) < 24) { World.removeNpc('ghost'); f.ghostTownSeen = true; }
      if (st.obj && st.obj.id === 'playground' && p.x > -37 && p.x < -13 && p.z > 34 && p.z < 55 && !Script.busy) {
        Script.run(async (S) => { S.done('playground'); await S.say(null, 'The merry-go-round is turning by itself.'); await S.obj('key', 'FIND THE KEY.', { voice: 'walter' }); });
      }
      if (st.tod === 'night') {
        Story._fstep = (Story._fstep || 3) - dt;
        if (Story._fstep <= 0 && p.moving) { Story._fstep = 3 + Math.random() * 4; Sound.sfx('step', { surf: 'hard', vol: 0.5, far: true }); Sound.sfx('step', { surf: 'hard', vol: 0.5, far: true, delay: 0.34 }); }
      }
    }
    // sounds with no source
    Story._amb = (Story._amb || 5) - dt;
    if (Story._amb <= 0) {
      Story._amb = 9 + Math.random() * 14;
      if (map === 'town' && st.day <= 5 && st.tod !== 'night' && Math.hypot(p.x + 25, p.z - 44) < 30) Sound.sfx('laugh', { far: true, vol: 0.5 });
      if (map === 'town' && st.day === 7 && st.tod === 'night') Sound.sfx('laugh', { far: true, vol: 0.25 });
      if (map === 'aquarium' && st.day === 7 && st.tod === 'night' && !f.ghostMet) { Sound.sfx('door', { far: true, vol: 0.5 }); }
      if (map === 'aquarium' && st.day === 7 && st.tod === 'night' && f.ghostMet && !f.backpackPlaced && Math.random() < 0.5) Sound.sfx('knock', { n: 3, far: true, vol: 0.7 });
      if (map === 'house' && st.day >= 5 && st.day <= 7 && st.tod === 'night' && !Story.phoneRinging) Sound.sfx('knock', { n: 2, far: true, vol: 0.4 });
    }
    // day 6: the pump gets very loud near Tank 6, then stops being loud
    if (st.day === 6 && map === 'aquarium' && !f.pumpLoud && p.z < -24 && Math.abs(p.x) < 8) { f.pumpLoud = true; Sound.ambLevel('pump', 6, 0.3); setTimeout(() => Sound.ambLevel('pump', 1, 1.5), 3500); }
    // day 7 night: a phone rings in Walter's empty office
    if (st.day === 7 && st.tod === 'night' && map === 'aquarium' && f.ghostMet && !f.officePhone && p.x > 16) { f.officePhone = true; for (let i = 0; i < 4; i++) setTimeout(() => Sound.sfx('phone', { vol: 0.5, far: true }), i * 3400); }
    // stealth
    if (map === 'aquarium' && f.lightsOut && !f.leftAquariumFinal) { if (!Story.stealth) Story.stealthReset(); Story.updateStealth(dt); }
    // the house, last night
    if (map === 'house' && f.walterInside && !f.finalSpeech && !Script.busy) {
      const g = World.npc('ghost');
      if (!g) World.addNpc({ id: 'ghost', set: 'walter_ghost', x: -4.6, z: -6.8, face: 0, slide: true, noShadow: true, noTalk: true, solid: false });
      else if (Math.hypot(p.x - g.x, p.z - g.z) < 7 || World.time > (Story._insideT || (Story._insideT = World.time + 6))) Script.run((S) => Story.finalSpeech(S));
    }
    if (map === 'house' && f.finalChase && !f.underneath) {
      if (!World.npc('ghost')) World.addNpc({ id: 'ghost', set: 'walter_ghost', x: -4.6, z: -6.8, face: 0, slide: true, noShadow: true, noTalk: true, solid: false });
      if (!Story.chase) Story.chase = { t: 0 };
      Story.updateChase(dt);
    }
    // the underneath
    if (map === 'underneath') Story.underUpdate(dt, st);
  },

  async leaveOffice(S, caught) {
    const st = S.st;
    if (!S.get('snoopStart') && S.get('snoopStart') !== 0) return;
    S.unflag('snoopStart');
    if (caught) {
      S.flag('caughtInOffice');
      S.sfx('thud', { vol: 0.4 });
      await S.say('walter', '...Hm? What... what are you doing in here?');
      await S.say('walter', 'You weren\'t supposed to come in here.');
      await S.walk('player', [[31.5, -30], [31.5, -25]], { speed: 3 });
    }
    S.done('leave6');
    Story.walterSpot(S, 'lobby');
    S.unflag('officeOpen');
    S.reload();
    await S.wait(0.5);
    await Story.confront(S, caught);
  },
  async confront(S, caught) {
    const W = (t) => S.say('walter', t);
    S.setTod('afternoon');
    const w = World.addNpc({ id: 'walter', set: 'walter', x: 22, z: -25, face: Math.PI, talk: NPCS.walter.talk });
    S.flag('walterSpot', 'lobby');
    S.face('walter', 'player');
    if (!caught) await W('Were you in my office?');
    await S.wait(0.6);
    const c = await S.ask('walter', 'Well?', ['ASK ABOUT EVAN', 'ASK ABOUT THE CAT', 'SAY NOTHING']);
    if (c === 0) {
      await W('Evan.');
      await W('Evan wasn\'t a good kid. He broke things. He lied. He went where he wasn\'t supposed to go.');
      await W('He attacked me, you know. The night he left. Came at me like an animal.');
      await W('I didn\'t—');
      await S.wait(1);
      await W('Go home.');
    } else if (c === 1) {
      await W('The cat was old.');
      await S.wait(1.2);
      await W('I didn\'t do anything wrong.');
      await W('Go home.');
    } else {
      await W('Good. That\'s good.');
      await W('Go home. Take the rest of the day.');
    }
    S.flag('walterConfront', c);
    Story.walterSpot(S, 'gone');
    await S.obj('home6', 'GO HOME.');
  },
});
