'use strict';
// ---------------------------------------------------------------------------
// ENDINGS and REMEMBER.
//   ESCAPE  (A) — leave the Underneath before you've remembered everything.
//   VERSION (B) — accept Walter's version of that night.
//   TRAPPED (C) — let Walter catch you twice.
//   TRUE        — remember all seven things.
// ---------------------------------------------------------------------------

const Endings = {};

Object.assign(Story, {
  rememberCount(st) { let n = 0; for (let i = 1; i <= 7; i++) if (st.flags['rem_' + i]) n++; return n; },

  // pick something from your inventory to show
  pickItem(title) {
    const ids = Game.st.inv.filter((id) => ITEMS[id]);
    return UI.push({
      type: 'pick', sel: 0, scroll: 0, ids, title,
      update(m, dt) {
        const n = m.ids.length + 1;
        if (Input.repeat('up', dt)) { m.sel = (m.sel + n - 1) % n; Sound.sfx('move'); }
        if (Input.repeat('down', dt)) { m.sel = (m.sel + 1) % n; Sound.sfx('move'); }
        if (Input.pressed('b')) { Input.eat('b'); Sound.sfx('cancel'); UI.close(m, null); }
        if (Input.pressed('a')) { Input.eat('a'); Sound.sfx('select'); UI.close(m, m.sel < m.ids.length ? m.ids[m.sel] : null); }
      },
      draw(ctx, m) {
        UI.fill(ctx, 0, 0, 320, 240, 'rgba(0,0,0,0.55)');
        UI.panel(ctx, 50, 16, 220, 208);
        Font.center(ctx, m.title, 160, 22, UI.C.hi);
        const rows = m.ids.concat(['__never']);
        const vis = 10;
        if (m.sel < m.scroll) m.scroll = m.sel; if (m.sel >= m.scroll + vis) m.scroll = m.sel - vis + 1;
        rows.slice(m.scroll, m.scroll + vis).forEach((id, i) => {
          const y = 38 + i * 18, sel = m.scroll + i === m.sel;
          if (sel) UI.fill(ctx, 56, y - 2, 208, 18, 'rgba(244,224,112,0.15)');
          if (id === '__never') { Font.draw(ctx, 'NEVER MIND', 78, y + 3, sel ? UI.C.hi : UI.C.dim); return; }
          const it = ITEMS[id];
          UI.icon(ctx, 'icon_' + it.icon, 58, y - 1);
          const nm = typeof it.name === 'function' ? it.name(Game.st) : it.name;
          Font.draw(ctx, nm.slice(0, 29), 78, y + 3, sel ? UI.C.hi : UI.C.text);
        });
      },
    });
  },

  async tableau(S, tb) {
    const st = S.st;
    const V = (t) => S.say('walter_voice', t);
    if (st.flags['rem_' + tb.id]) {
      for (const [who, line] of tb.truthLines.slice(-1)) await S.say(who, line);
      return;
    }
    await V(tb.walter);
    for (;;) {
      const c = await S.ask(null, tb.lie, ['REMEMBER', 'ACCEPT IT', 'WALK AWAY']);
      if (c === 2) return;
      if (c === 1) {
        const y = await S.ask('walter_ghost', 'That\'s what happened. Isn\'t it?', ['YES', 'NO']);
        if (y === 0) { await Endings.version(S); return; }
        continue;
      }
      const id = await Story.pickItem('WHAT DO YOU REMEMBER?');
      if (!id) continue;
      if (id === 'tape12' && tb.accept.includes('tape12') && !st.flags.playedTape) { await V('You never even listened to it.'); await S.say(null, 'You never played the tape.'); continue; }
      if (!tb.accept.includes(id)) { S.sfx('wrong'); await V('That\'s not how it happened.'); continue; }
      // it's true
      S.sfx('objective_evan');
      await S.fade(0.6, 0.2, '#ffffff');
      await S.fade(0, 0.4, '#ffffff');
      for (const [who, line] of tb.truthLines) await S.say(who, line);
      S.flag('rem_' + tb.id);
      const n = Story.rememberCount(st);
      S.reload();
      Story.applyUnderMusic(st);
      const react = ['...Evan had problems.', 'He wasn\'t a good kid. He wasn\'t.', 'He attacked me. He— no. No, that isn\'t—', 'I didn\'t mean to hurt him.', 'He made me do it. He made me. He broke it and he made me.', '...', 'I killed him.'];
      await S.wait(0.6);
      await S.say('walter_ghost', react[n - 1]);
      if (n >= 7) await Endings.trueEnding(S);
      else if (st.obj && st.obj.id === 'remember') st.obj.text = 'REMEMBER. (' + n + '/7)';
      return;
    }
  },

  applyUnderMusic(st) {
    const n = Story.rememberCount(st);
    Sound.musicMods({ tempo: 1 - n * 0.065, drop: n * 0.1, detune: n * 9, drift: -n * 14 });
  },

  async hubWalter(S) {
    const st = S.st, n = Story.rememberCount(st), G = (t) => S.say('walter_ghost', t);
    if (!S.get('hubTalk')) {
      S.flag('hubTalk');
      await G('You don\'t belong here.');
      await G('This is mine. I made all of this. Every tree. Every fish. Every sandwich.');
      await G('I paid them to build it exactly how it was. So I could live in it.');
      await G('So I would never have to remember.');
      return;
    }
    const lines = [
      ['Go home. Go back to your house and go to bed. In the morning it will be Day 1 again, and I\'ll say hello, and you\'ll like me.'],
      ['Stop. Please. You don\'t know what it was like.'],
      ['He ran away. Why won\'t you let him run away? It\'s better if he ran away. For everybody.'],
      ['The others didn\'t do this. The others fixed things. They were good.'],
      ['I was going to tell them. I was going to call. And then it was morning, and the truck was already coming.'],
      ['Please.'],
      ['...'],
    ];
    for (const l of lines[Math.min(n, 6)]) await G(l);
  },

  underUpdate(dt, st) {
    const p = World.player;
    if (!Story._underMusicSet) { Story._underMusicSet = true; Story.applyUnderMusic(st); }
    if (!st.flags.hubEntered && p.z < -20.5 && !Script.busy) {
      st.flags.hubEntered = true;
      Script.run(async (S) => { S.face('ghost', 'player'); await Story.hubWalter(S); });
    }
  },

  async exitUnderneath(S) {
    const st = S.st;
    const n = Story.rememberCount(st);
    await S.say(null, 'A white door that says EXIT. Behind it: daylight, and the sound of birds.');
    const c = await S.ask(null, n < 7 ? 'Leave? You haven\'t remembered everything.' : 'Leave?', ['LEAVE', 'STAY']);
    if (c !== 0) return;
    await Endings.escape(S);
  },
});

// ---------------------------------------------------------------- shared bits
Endings.record = function (key) {
  const m = State.getMeta();
  m.endings = m.endings || {};
  m.endings[key] = Date.now();
  State.saveMeta();
};
Endings.cards = async function (S, lines, o) {
  o = o || {};
  for (const l of lines) {
    if (typeof l === 'function') { await l(); continue; }
    await S.card('', '', { lines: Array.isArray(l) ? l : [l], press: true, bg: o.bg || '#000', fg: o.fg || '#e8e4d8' });
  }
};
Endings.finish = async function (S) {
  Game.mode = 'ending';
  await S.fade(1, 1.0);
  Script.reset();
  Title.show();
};

// ---------------------------------------------------------------- A: ESCAPE
Endings.escape = async function (S) {
  const st = S.st;
  Story.chase = null; Story.stealth = null;
  S.stopMusic(0.5);
  await S.fade(1, 1.2, '#ffffff');
  Endings.record('escape');
  st.day = 9; st.tod = 'morning';
  st.flags.aquariumGone = true;
  Object.keys(st.flags).forEach((k) => { if (k === 'lightsOut' || k === 'finalChase' || k === 'walterInside') delete st.flags[k]; });
  st.day = 6; // plain daylight town
  st.flags.aquariumGone = true;
  Game.enterMap('town', 'aquarium');
  World.npcs.slice().forEach((n) => World.removeNpc(n.id));
  Sound.ambience(['birds', 'wind']);
  S.music('town', { vol: 0.8 });
  await S.fade(0, 2.0, '#ffffff');
  UI.clearBanner();
  await S.wait(1.0);
  await S.say(null, 'Morning. Birds. An empty lot where the aquarium was.');
  await S.say(null, 'There\'s nothing here. There was never anything here.');
  await S.wait(5);
  S.stopMusic(2);
  await S.fade(1, 2.0);
  await Endings.cards(S, [['THANK YOU FOR PLAYING.'], ['EVAN IS STILL MISSING.']]);
  await S.card('LOW TIDE', 'ENDING', { dur: 3 });
  await Endings.finish(S);
};

// ---------------------------------------------------------------- B: HIS VERSION
Endings.version = async function (S) {
  const st = S.st;
  const G = (t) => S.say('walter_ghost', t);
  await G('Yes.');
  await G('That\'s what happened. That\'s all that happened.');
  await G('Thank you.');
  S.stopMusic(0.1);
  await S.fade(1, 1.6, '#ffffff');
  Endings.record('version');
  // a fresh morning. The same morning.
  const name = st.name;
  Game.st = State.newGame(name);
  Game.st.slot = st.slot;
  Game.st.flags.version = true;
  Game.st.flags.walterIntro = false;
  Game.enterMap('town', 'intro');
  await S.card('DAY 1', 'AUGUST 8', { dur: 2.6 });
  await S.fade(0, 1.0);
  const W = (t) => S.say('walter', t);
  await S.walk('walter', 18.8, 19.4, { speed: 1.8 });
  S.face('walter', 'player');
  await W('Well, hello there! You must be {name}.');
  await W('Welcome home.');
  await W('Here\'s your key. You know the way.');
  await S.give('key_house', { silent: true });
  Game.st.flags.walterIntro = true;
  await S.obj('gohome', 'GO INSIDE YOUR HOUSE.');
};
Endings.versionHouse = async function (S) {
  await S.wait(0.6);
  await S.say(null, 'There\'s a photo on the living room wall.');
  await S.inspect({ name: 'FAMILY PHOTO', icon: 'photo_old', photo: 'ph_family_you', desc: 'Walter, Ruth, and you, holding an orange kitten. On the back: "Easter 1987."' });
  await S.say(null, 'You remember this. You remember all of it.');
  await S.fade(1, 2.0);
  await Endings.cards(S, [['THANK YOU FOR PLAYING.']]);
  await S.card('HIS VERSION', 'ENDING', { dur: 3 });
  await Endings.finish(S);
};

// ---------------------------------------------------------------- C: TRAPPED
Endings.trapped = async function (S) {
  const st = S.st;
  Endings.record('trapped');
  const m = State.getMeta(); m.trappedName = st.name; State.saveMeta();
  State.erase(3);
  await S.wait(1.5);
  const name = st.name;
  Game.st = State.newGame(name);
  Game.st.slot = st.slot;
  Game.st.flags.trapped = true;
  Game.st.flags.walterIntro = true;
  Game.enterMap('town', 'aquarium');
  World.player.set = 'player_ghost';
  World.removeNpc('walter');
  World.addNpc({ id: 'newkid', set: 'helmet_newkid', x: 17.5, z: 20.5, face: 0, talk: async (S2) => Endings.newKid(S2) });
  await S.card('DAY 1', 'AUGUST 8', { dur: 2.6 });
  await S.fade(0, 1.2);
  UI.subtitle = 'There you are.'; await S.wait(2.2); UI.subtitle = null;
  await S.obj('guide', 'SHOW THE NEW PLAYER AROUND TOWN.');
};
Endings.newKid = async function (S) {
  const N = (t) => S.say('newkid', t);
  await N('Hi! Um. Are you the one who owns the aquarium?');
  await S.ask('you', '...', ['WELL, HELLO THERE!', 'WELL, HELLO THERE!']);
  await S.say('you', 'You must be the new kid. Welcome to Bellwood!');
  await S.ask('you', '...', ['HERE\'S YOUR KEY.', 'HERE\'S YOUR KEY.']);
  await S.say('you', 'The front door sticks a little. Just give it a push.');
  await N('Thanks! This town seems really nice.');
  await S.say('you', 'It is. Nothing ever happens here.');
  await S.wait(0.8);
  UI.subtitle = 'Good. Now show them the aquarium.'; await S.wait(2.6); UI.subtitle = null;
  await S.fade(1, 2.0);
  await Endings.cards(S, [['THANK YOU FOR PLAYING.']]);
  await S.card('THE GUIDE', 'ENDING', { dur: 3 });
  await Endings.finish(S);
};

// ---------------------------------------------------------------- TRUE ENDING
Endings.trueEnding = async function (S) {
  const st = S.st;
  const G = (t) => S.say('walter_ghost', t);
  await S.wait(1.0);
  await G('I killed my son.');
  await G('I made all of this so that I would never have to remember it.');
  await S.wait(1.2);
  await G('...Go home.');
  // the memory falls apart
  S.sfx('collapse');
  Sound.musicMods({ tempo: 0.3, drop: 0.95, detune: 120, drift: -300 });
  World.removeNpc('ghost');
  for (let i = 0; i < 40; i++) { R.settings.snap = 2 + i * 0.25; R.settings.wobble = 0.05 + i * 0.02; await S.wait(0.08); }
  S.stopMusic(0.3);
  await S.fade(1, 1.5, '#ffffff');
  R.settings.snap = 1; R.settings.wobble = 0;
  Endings.record('true');
  const m = State.getMeta(); m.trueDone = true; m.phase = 0; State.saveMeta();
  UI.clearBanner();
  Game.enterMap('whiteroom', 'start');
  World.addNpc({ id: 'evan', set: 'evan', x: 0, z: -3.5, face: 0, talk: async (S2) => Endings.evan(S2) });
  await S.wait(1.0);
  await S.fade(0, 2.5, '#ffffff');
  S.done('remember');
  await UI.banner('REMEMBER.', 'evan', { dur: 4 });
  await S.wait(4.2);
  await S.say(null, 'Someone is standing where the concrete is. He has his back to you.');
};
Endings.evan = async function (S) {
  const E = (t) => S.say('evan', t);
  const n = World.npc('evan');
  if (n) n.face = Math.atan2(World.player.x - n.x, -(World.player.z - n.z));
  await E('Is it morning yet?');
  for (;;) {
    const c = await S.ask('evan', 'Is it morning yet?', ['IT\'S MORNING.', 'NOT YET.']);
    if (c === 0) break;
    await E('That\'s okay. I can wait.');
    await S.wait(1.5);
  }
  await E('Okay.');
  await E('Can you tell Mister Eight I said bye?');
  await E('He knows me.');
  if (n) { n.path = [[0, -14]]; n.speed = 1.2; }
  await S.wait(3.5);
  await S.fade(1, 3.0, '#ffffff');
  await S.wait(1);
  S.music('ending', { vol: 0.9 });
  await Endings.cards(S, [
    ['On August 20, 2001, after an anonymous tip,', 'the Bellwood Sheriff\'s Department', 'removed the floor of Tank 6', 'at the Bellwood Aquarium.'],
    ['The remains of Evan Vane, age 11,', 'were recovered.'],
    ['He was buried beside his mother, Ruth,', 'on a Saturday. The whole town came.'],
    ['Mister Eight was moved to the marine center', 'in the city. He is said to be very particular', 'about who feeds him.'],
    ['The Bellwood Aquarium never reopened.'],
    ['TIDEWATER', '', 'A SOFT HARBOR PRODUCTION', 'FOR THE BELLWOOD AQUARIUM', '', 'IN MEMORY OF', 'EVAN VANE', '1980 - 1991'],
    ['THANK YOU FOR PLAYING.'],
  ], { bg: '#f8f8f2', fg: '#2a2a30' });
  S.stopMusic(2);
  await S.card('TIDEWATER', 'THE TRUE ENDING', { dur: 4, bg: '#f8f8f2', fg: '#2a2a30' });
  await Endings.finish(S);
};
