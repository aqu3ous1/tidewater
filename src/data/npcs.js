'use strict';
// ---------------------------------------------------------------------------
// NPCs: where they are (by day / time / what has happened) and what they say.
// Walter's conversations live in story.js — they ARE the story.
// ---------------------------------------------------------------------------

const day = (st) => st.day;
const tod = (st) => st.tod;
const knowsEvan = (st) => !!st.flags.metEvan;
const daytime = (st) => st.tod === 'morning' || st.tod === 'afternoon';

async function talkOnce(S, key, fn) { if (!S.get(key)) { S.flag(key); await fn(); return true; } return false; }

const NPCS = {
  walter: {
    set: 'walter',
    where: (st) => Story.walterWhere(st),
    talk: async (S, n) => Story.walterTalk(S, n),
  },
  ghost: {
    set: 'walter_ghost',
    where: (st) => Story.ghostWhere(st),
    talk: async (S, n) => Story.ghostTalk(S, n),
    props: { slide: true, speed: 1.4 },
  },

  dana: {
    where(st) {
      if (st.flags.ghostMet && st.flags.deathCount && st.map === 'town' && st.day >= 8) return st.flags.danaYard ? null : { map: 'town', x: 15, z: 14.5, face: 'n' };
      if (st.day <= 6 && daytime(st)) return { map: 'aquarium', x: -5.5, z: 7.3, face: 's' };
      if (st.day === 7 && daytime(st)) return { map: 'town', x: -4.5, z: -64.6, face: 's' };
      return null;
    },
    async talk(S) {
      const st = S.st, D = (t) => S.say('dana', t);
      if (st.day >= 8) { await D('...I thought you were gone.'); await D('Everybody said you were gone. I saw your helmet in the window of the aquarium. Just sitting there.'); await D('Go home. Please. Lock the door.'); S.flag('danaYard'); return; }
      if (st.day === 7) {
        if (!S.get('heardNews')) return Story.danaNews(S);
        await D('They said the aquarium\'s closed until further notice. There\'s a lawyer coming from the city.');
        await D('...He was nice to me. He was always nice to me.');
        if (knowsEvan(st)) { await D('Is it bad that I keep thinking about the ghost story? The kid knocking on the glass.'); await D('I used to think it was funny.'); }
        return;
      }
      if (!st.flags.hired) {
        if (await talkOnce(S, 'dana1', async () => { await D('Oh! You\'re the new kid? Walter said you\'d come by.'); await D('He\'s in the big room. Just follow the fish noises.'); })) return;
        await D('Tickets are four dollars. For you, also four dollars. I\'m kidding. You\'re free. Walter would kill me.');
        return;
      }
      if (st.day === 1) { await D('So you\'re staff now. Welcome to the glamorous life.'); await D('The penguins will judge you. That\'s normal.'); return; }
      if (st.day >= 2 && !S.get('danaCard')) {
        S.flag('danaCard');
        await D('Hey, new kid. Here. Walter gives these to good workers. I have like fifty.');
        await S.give('fc7');
        await D('Oh, and if you find any blue shells on the beach, bring them to Walter. He\'s weird about blue shells.');
        await D('He\'ll give you stuff. I don\'t know. It\'s a Walter thing.');
        S.flag('shellQuest'); S.side('shells', 'FIND THREE BLUE SHELLS');
        return;
      }
      const lines = {
        2: ['Walter\'s in a good mood today. He\'s always in a good mood. It\'s kind of a lot.'],
        3: ['Have you seen Marmalade? He\'s usually on his cushion by now.', 'He\'ll turn up. Cats do that.'],
        4: ['Mrs. Miller came by with posters about Marmalade. Walter took one.', 'He folded it up really small and put it in his pocket. He said he\'d put it up later.'],
        5: knowsEvan(st) ? ['Walter\'s son? Yeah. That was before my time. I was like seven.', 'Kids at school used to say he\'s still in the aquarium. Like a ghost. Knocking on the glass at night.', 'Dumb, right?'] : ['Walter\'s been in his office all morning with the door locked. He does that in August.'],
        6: ['Walter yelled at the fish supplier on the phone. Walter doesn\'t yell.', 'Are you okay? You look like you didn\'t sleep.'],
      };
      for (const l of lines[st.day] || ['...']) await D(l);
    },
  },

  miller: {
    where(st) {
      const f = st.flags;
      if (st.day >= 8) return null;
      if (f.toldMiller && st.day >= 5 && !(st.day === 7)) return null;
      if (st.day === 4 && st.tod === 'morning') return { map: 'town', x: 11.2, z: 18.2, face: 'w' };
      if (st.day === 5 && st.tod === 'evening' && !f.millerKitchenDone) return { map: 'town', x: -24, z: 14.6, face: 's' };
      if (st.tod === 'morning') return { map: 'town', x: -24, z: 14.6, face: 's' };
      if (st.tod === 'night') return null;
      return { map: 'miller', x: -1.2, z: -0.4, face: 's' };
    },
    async talk(S) {
      const st = S.st, M = (t) => S.say('miller', t);
      if (st.day === 2 && st.inv.includes('umbrella')) return Story.returnUmbrella(S);
      if (st.day === 4 && st.tod === 'morning' && !S.get('millerPoster')) return Story.millerPoster(S);
      if (st.day === 5 && st.tod === 'evening' && S.get('kitchenSeen') && !S.get('millerKitchenDone')) return Story.millerKitchen(S);
      if (st.day === 1) {
        if (await talkOnce(S, 'miller1', async () => {
          await M('Oh, hello! You must be the new neighbor. I\'m Margaret Miller. Mrs. Miller to you.');
          await M('You\'re in the old Vane place? Oh, it\'s nice to see a light on in there again.');
          await M('If you need anything, sugar, flour, a phone number, I\'m right here.');
        })) return;
        await M('Welcome to Bellwood, dear. You\'ll like it here. Nothing ever happens.');
        return;
      }
      if (st.day === 7) {
        await M('Did you hear? Walter... oh, and on the fourteenth, of all days.');
        await M('Ten years to the day.');
        await M('I keep thinking about Evan. Isn\'t that strange? I keep thinking, now he\'ll never know.');
        return;
      }
      if (st.day === 5 && (knowsEvan(st) || st.inv.includes('bday_card'))) {
        if (await talkOnce(S, 'millerEvan', async () => {
          S.flag('metEvan');
          await M('That card? Oh. Oh, dear.');
          await M('Evan. Walter\'s boy. He ran away. Ten years ago this Friday.');
          await M('I haven\'t thought about that summer in years.');
          await M('He was a sweet boy. He used to sit on my porch with Marmalade.');
          await M('Marmalade was his cat, you know. Walter just kept him, after.');
        })) return;
      }
      const lines = {
        2: ['Off to work? Walter\'s a good man. He\'s done so much for this town.', 'If you see my umbrella at the aquarium, would you bring it by? I left it there Sunday.'],
        3: ['I saw you coming home last night. You walk just like... oh, never mind me.', 'Have a nice day at the aquarium, dear.'],
        4: ['He always comes for his breakfast. Seven o\'clock, every morning, for years.', 'I don\'t understand it. He\'s never missed a day.'],
        5: ['You look tired, dear. That house gets cold at night, even in August.'],
        6: ['I didn\'t sleep. I kept hearing a cat crying. It wasn\'t him. It was just the wind.'],
      };
      for (const l of lines[st.day] || ['Hello, dear.']) await M(l);
    },
  },

  hal: {
    where: (st) => (st.day <= 7 && st.tod !== 'night' ? { map: 'diner', x: 1.5, z: -4.6, face: 's', wrongFace: st.day >= 6 } : null),
    async talk(S) {
      const st = S.st, H = (t) => S.say('hal', t);
      if (st.day === 3 && S.isObj('lunch')) return Story.buyLunch(S);
      if (st.day === 7) { await H('Walter was devastated after Evan. Never the same man.'); await H('Now this. Coffee\'s on the house today. Everything\'s on the house today.'); return; }
      if (knowsEvan(st)) {
        if (await talkOnce(S, 'halEvan', async () => {
          await H('Evan? Yeah. Good kid. Always had a tape recorder going.');
          await H('He\'d come in here and interview you. "This is Radio Evan. What is your favorite pie."');
          await H('Walter was devastated when he left. Never the same.');
        })) return;
      }
      if (await talkOnce(S, 'hal1', async () => { await H('Welcome to Hal\'s. Best pie in the county. Only pie in the county.'); })) return;
      await H(st.day >= 4 ? 'You want the photo on the wall? Summer festival, \'91. Somebody scratched it up years ago. I keep meaning to take it down.' : 'Pie\'s peach. It\'s always peach.');
    },
  },

  donna: {
    where: (st) => (st.day <= 7 && st.tod !== 'night' ? { map: 'diner', x: -3.5, z: 1.5, face: 'e', wander: 2.5 } : null),
    async talk(S) {
      const st = S.st, D = (t) => S.say('donna', t);
      if (st.day === 7) { await D('I shouldn\'t say it today. But he never seemed upset. About the boy.'); await D('Not once. Not even at the start.'); return; }
      if (knowsEvan(st)) {
        await D('The Vane boy? Honestly? Walter never seemed that upset. About Evan, I mean.');
        await D('He was back at the aquarium the next morning like nothing happened. Pouring the new tank floor.');
        await D('Hal says I\'m being mean. Maybe I am.');
        return;
      }
      await D(['Sit anywhere, hon.', 'The pie of the week is peach. The pie of every week is peach. Hal just says it like it\'s news.', 'You work for Walter? He tips in quarters. Exactly fifteen percent. He counts.'][Math.min(2, st.day - 1)] || 'Sit anywhere, hon.');
    },
  },

  priya: {
    where: (st) => (st.day <= 7 && st.tod !== 'night' ? { map: 'market', x: -5, z: 2.3, face: 's', wrongFace: st.day === 7 } : null),
    async talk(S) {
      const st = S.st, P = (t) => S.say('priya', t);
      if (st.inv.includes('milk') && !S.get('paidMilk')) return Story.payMilk(S);
      if (st.day === 1 && S.isObj('milk')) { await P('Milk\'s in the back cooler, on the right. You look like a two percent person.'); await P('Am I right? I\'m always right.'); return; }
      if (st.day === 7) { await P('Everybody\'s coming in and buying things and not saying anything. It\'s so quiet.'); return; }
      if (knowsEvan(st)) {
        if (await talkOnce(S, 'priyaEvan', async () => {
          await P('I was in Evan\'s grade. He sat behind me in Room 5 and kicked my chair and made fish noises.');
          await P('I was so mad at him. Then one day he just wasn\'t there.');
        })) return;
      }
      if (st.day >= 4) { await P('Mrs. Miller put up a poster for Marmalade. He used to sleep in our front window in the winter.'); return; }
      await P('Everybody in town comes in here eventually. We\'ve got a sale on sardines. Walter buys them by the crate.');
    },
  },

  gus: {
    where(st) {
      if (st.day >= 8 || st.tod === 'night') return null;
      if (st.day === 7 && !st.flags.garageKey) return { map: 'town', x: 63, z: -33.4, face: 's' };
      return { map: 'gas', x: -2.5, z: -3.2, face: 's' };
    },
    async talk(S) {
      const st = S.st, G = (t) => S.say('gus', t);
      if (st.day === 7 && !S.get('garageKey')) {
        await G('You worked for Walter, right? His lawyer called. Says clear out the old car, they\'re selling it.');
        await G('Ten years he paid me to keep that thing in my back garage. Never drove it. Never even looked at it.');
        await G('You want to look before they tow it? Here. Garage key.');
        S.flag('garageKey'); S.flag('garageOpen'); await S.give('garage_key');
        await G('Door\'s through the shop. Take anything that\'s yours. Or his. I don\'t know.');
        return;
      }
      if (knowsEvan(st) || S.has('bus_schedule')) {
        if (await talkOnce(S, 'gusBus', async () => {
          await G('Walter always told people the boy took the bus to the city.');
          await G('I never had the heart to say it. There hasn\'t been a bus through Bellwood since \'84.');
          await G('They took the route away when the cannery closed. Everybody knows that. Everybody.');
        })) return;
      }
      if (await talkOnce(S, 'gus1', async () => { await G('Gus. I fix things. If it\'s got an engine or a leak, I\'m your man.'); })) return;
      await G('That back garage? Walter\'s been paying me to keep his old car in there. Ten years now. Never drives it. Just pays.');
    },
  },

  okafor: {
    where(st) {
      if (st.day >= 8 || st.tod === 'night' || st.tod === 'evening') return null;
      if (st.day === 7) return { map: 'church', x: 2.6, z: -2, face: 'n' };
      if (st.day >= 3) return { map: 'school', x: -9.5, z: -9.0, face: 's' };
      return null;
    },
    async talk(S) {
      const st = S.st, O = (t) => S.say('okafor', t);
      Story.explored(S, 'school');
      if (st.day === 5 && st.inv.includes('brochures')) return Story.deliverBrochures(S);
      if (st.day === 7) { await O('I\'m sorry. I know you worked for him.'); await O('...Now maybe someone will finally look.'); return; }
      if (st.day === 6 || (knowsEvan(st) && S.get('okaforEvan'))) {
        await O('I wrote a note in his file, you know. That spring. Bruises on his arm. Twice.');
        await O('Walter said bicycle. Evan didn\'t have a bicycle. I didn\'t know that until later.');
        await O('I believed him. Everybody believed Walter.');
        return;
      }
      if (await talkOnce(S, 'okafor1', async () => {
        await O('Oh! Hello. School doesn\'t start for three weeks, but I like to come in early and set up.');
        await O('You\'re new? ...You\'re working for Walter.');
        await O('Well. That\'s nice.');
        Story.explored(S, 'school');
      })) return;
      await O('Room 5 has been my room for twenty years. Every kid who ever sat in it, I remember. Every one.');
    },
  },

  ray: {
    where(st) {
      if (st.tod === 'night') return null;
      if (st.day >= 8) return { map: 'town', x: 46, z: -108.5, face: 'n', wrongFace: true, noTalkWalk: true };
      return { map: 'town', x: 46.6, z: -103, face: 'n' };
    },
    async talk(S, n) {
      const st = S.st, Rr = (t) => S.say('ray', t);
      Story.explored(S, 'pier');
      if (st.day >= 8) { n.face = 0; await S.say(null, 'He doesn\'t turn around. His line goes down into the water and doesn\'t move.'); return; }
      if (st.day === 7) { await Rr('Bottom of the basement stairs, huh.'); await Rr('...Huh.'); await Rr('River gives everything back eventually. That\'s what my father said. Almost everything.'); return; }
      if (knowsEvan(st)) {
        if (await talkOnce(S, 'rayEvan', async () => {
          await Rr('Night of the fourteenth, ten years back, I was out here past midnight. Stripers were running.');
          await Rr('Lights on in the aquarium all night. Every window.');
          await Rr('And at dawn, a Harbor Concrete truck backs right up to the side door. Seven in the morning.');
          await Rr('Paper said the boy left on the thirteenth. I never said anything.');
          await Rr('Nobody asked me.');
        })) return;
      }
      if (await talkOnce(S, 'ray1', async () => { await Rr('Tide\'s coming in. You new? Ray. I fish. Mostly I sit.'); })) return;
      if (st.flags.hired) { await Rr('You work for Walter? Huh.'); await Rr('He give you the tour? He show you Tank 6?'); await Rr('...No. I guess he wouldn\'t.'); return; }
      await Rr('Nothing\'s biting. Nothing ever bites. I just like the sound.');
    },
  },

  lou: {
    where(st) {
      if (st.day >= 7 || st.tod !== 'morning') return null;
      if (st.day === 5 && !st.flags.bdayCard) return { map: 'town', x: 19.2, z: 17.3, face: 'e' };
      return { map: 'town', x: 0, z: 16.8, face: 'e', route: true };
    },
    props: {
      update(n, dt) {
        if (!n.route || n.path.length || n.talking) return;
        const pts = [[-40, 17], [-40, -12.8], [40, -12.8], [40, 17]];
        n.ri = ((n.ri || 0) + 1) % pts.length;
        n.path = [pts[n.ri]]; n.speed = 1.6;
      },
    },
    async talk(S) {
      const st = S.st, L = (t) => S.say('lou', t);
      if (st.day === 5 && !S.get('bdayCard')) return Story.louCard(S);
      if (st.day === 6) { await L('Walter mailed a letter to himself yesterday. Aquarium to the aquarium.'); await L('People are funny.'); return; }
      await L(['Morning! Lou. I bring the mail. Rain or shine. Mostly shine.', 'Nothing for you today! Nothing for anybody. It\'s a slow week.', 'Your paper\'s in the box. I read the funnies first. Don\'t tell anybody.', 'Mrs. Miller asked me to keep an eye out for her cat. I\'m keeping an eye out.'][st.day - 1] || 'Morning!');
    },
  },

  ellis: {
    where: (st) => (st.day <= 7 && st.tod !== 'night' ? { map: 'church', x: 0.6, z: -10.6, face: 's' } : null),
    async talk(S) {
      const st = S.st, E = (t) => S.say('ellis', t);
      Story.explored(S, 'church');
      if (st.day === 7) { await E('We\'ll hold a service for Walter on Sunday. The whole town will come. He\'d have liked that.'); await E('Would you like to light a candle? They\'re just there, by the wall.'); return; }
      if (knowsEvan(st)) {
        if (await talkOnce(S, 'ellisEvan', async () => {
          await E('We prayed for Evan every August. Wherever he is.');
          await E('Walter asked us to stop, a few years ago. He said it was time to let him go.');
          await E('I told him we would keep a candle for the boy anyway. He didn\'t come for a month after that.');
        })) return;
      }
      if (await talkOnce(S, 'ellis1', async () => { await E('Welcome, welcome. All are welcome here. Even on a weekday.'); })) return;
      await E('That board is for Ruth Vane, Walter\'s wife. Taken much too young, in \'86. Walter comes every Sunday and stands right there. He never sits.');
    },
  },

  mae: {
    where: (st) => (st.day <= 7 && st.tod !== 'night' ? { map: 'laundry', x: 3.8, z: -2, face: 's' } : null),
    async talk(S) {
      const st = S.st, Ma = (t) => S.say('mae', t);
      Story.explored(S, 'laundry');
      if ((st.day === 7 || knowsEvan(st)) && !st.inv.includes('kessler_key') && S.get('maeKessler')) {
        await Ma('The Kesslers left me their spare key, for the realtor. Nobody\'s ever wanted the place.');
        await Ma('You want to look? Go on. Bring it back when you\'re done.');
        await S.give('kessler_key');
        return;
      }
      if (knowsEvan(st)) {
        if (await talkOnce(S, 'maeKessler', async () => {
          await Ma('The Vane boy? Oh, honey.');
          await Ma('The Kesslers left right after. Their boy Toby was Evan\'s best friend. Toby said some things about Walter.');
          await Ma('Nobody listened, and then the whole family was just gone. Nine Maple. It\'s been empty ever since.');
        })) return;
      }
      if (await talkOnce(S, 'mae1', async () => { await Ma('Welcome to Suds! Quarters are in the machine, soap\'s in the other machine, gossip\'s free.'); })) return;
      await Ma('Lost and found is in the corner. Take anything. Nobody\'s come back for any of it in years.');
    },
  },

  visitor1: {
    where: (st) => (st.day >= 2 && st.day <= 5 && daytime(st) ? { map: 'aquarium', x: -12.4, z: -4.8, face: 'w' } : null),
    async talk(S) { await S.say('visitor1', ['We drove three hours for this. Worth it for the octopus alone.', 'Is the big tank ever going to open? We came last year and it was closed then, too.', 'He looked right at me. The octopus. Right at me.', 'My mother brought me here when I was little. The same fish. They can\'t be the same fish.'][S.st.day - 2]); },
  },
  visitor2: {
    where: (st) => (st.day >= 2 && st.day <= 5 && daytime(st) ? { map: 'aquarium', x: 1.4, z: -6.8, face: 'n', wander: 1.2 } : null),
    async talk(S) { await S.say('visitor2', ['I touched a starfish! It felt like a wet sneaker!', 'Why is your head a fishbowl? Can fish live in it?', 'There\'s a kid in the big closed tank. My brother said. He knocks.', 'The turtle is looking at me.'][S.st.day - 2]); },
  },
  visitor3: {
    where: (st) => (st.day >= 3 && st.day <= 5 && daytime(st) ? { map: 'aquarium', x: -19.4, z: -14, face: 'w' } : null),
    async talk(S) { await S.say('visitor3', ['Pip, Squeak and Admiral. I\'ve got all three on film now.', 'I take a picture of the penguins every summer. They never look any older.', 'The owner asked me not to take pictures of the big tank. It\'s just plywood.'][S.st.day - 3]); },
  },
  bea: {
    where(st) {
      if (st.day >= 7 || !daytime(st)) return st.day >= 8 && daytime(st) && !st.flags.kidsVanished ? { map: 'town', x: -22, z: 45, face: 's', ghostKid: true } : null;
      return { map: 'town', x: -24.2, z: 40.2, face: 's' };
    },
    async talk(S) {
      const st = S.st, B = (t) => S.say('bea', t);
      Story.explored(S, 'park');
      if (st.day >= 4) { await B('Evan Evan, where\'d you go? Down where the fishes swim below.'); await B('It\'s just a song. Everybody knows it.'); return; }
      if (st.day === 1) { await B('Are you a robot? Your head is a fishbowl.'); await B('Ha ha.'); return; }
      await B('Do you work at the aquarium? Can you get me a penguin? A small one.');
    },
  },
  tommy: {
    where(st) {
      if (st.day >= 6 || !daytime(st)) return st.day >= 8 && daytime(st) && !st.flags.kidsVanished ? { map: 'town', x: -20, z: 45.6, face: 's', ghostKid: true } : null;
      return { map: 'town', x: -26.5, z: 41.3, face: 's', wander: 2 };
    },
    async talk(S) {
      const st = S.st, T = (t) => S.say('tommy', t), B = (t) => S.say('bea', t);
      Story.explored(S, 'park');
      if (st.day >= 3) {
        await T('Wanna hear a secret? If you go in the aquarium at night, you can hear a kid knocking in the big closed tank.');
        if (World.npc('bea')) await B('Tommy, stop. That\'s mean.');
        await T('It\'s true! Dana said!');
        return;
      }
      await T('Wanna see me jump off the swing? Don\'t tell my mom.');
    },
  },
};
