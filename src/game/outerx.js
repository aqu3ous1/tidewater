'use strict';
// ---------------------------------------------------------------------------
// Past the edge of town: the woods trail (open from day 4) and the old
// Bellwood Canning Co. at the far end of it (the path only gets there from
// day 6; before that it goes round in a circle). Items, scripts and art;
// the maps are in src/maps/outer.js.
// ---------------------------------------------------------------------------

Object.assign(ITEMS, {
  search_flyer: { name: 'SEARCH FLYER', icon: 'newspaper', cat: 'hood', desc: 'From the table at the abandoned search camp in the woods. It has been rained on and dried out many times.', doc: 'search_flyer' },
  can_label: { name: 'TIDEWATER LABEL', icon: 'canlabel', cat: 'hood', desc: 'A can label from the cannery floor. TIDEWATER BRAND. There\'s a picture of a kid in a diving helmet on it.' },
});
COLLECTION_CATS.hood.items.push('search_flyer', 'can_label');

Object.assign(DOCS, {
  search_flyer: {
    title: 'HAVE YOU SEEN THIS BOY?', style: 'news', paper: '#e8e4d4',
    pages: ['HAVE YOU SEEN THIS BOY?\n\nEVAN VANE, AGE 11\nBrown hair, blue and white striped shirt.\nLast seen: 8/13/91 (per father)\n\nSEARCH PARTIES meet at the trailhead, 7 AM daily.\nBring water and a flashlight.\n\nAt the bottom, somebody has written in pen: "Why are we looking in the woods? He never went in the woods. He was scared of the woods."'],
  },
});

Object.assign(Story, {
  async trailGate(S) {
    const st = S.st;
    if (st.day < 4) {
      S.sfx('locked');
      await S.say(null, 'A chain across the trail, with a sign on it: TRAIL CLOSED - SEARCH IN PROGRESS.');
      await S.say(null, 'The sign is very old. The chain has rusted into one solid piece.');
      return;
    }
    if (!S.get('trailSeen')) { S.flag('trailSeen'); await S.say(null, 'The chain across the trail has been taken down. It\'s lying in the grass, coiled up very neatly.'); }
    await S.go('woods', 'trail', { sfx: 'step' });
  },
  async woodsMailbox(S) {
    const st = S.st;
    await S.say(null, 'A mailbox, on a post, in the middle of the woods. The name on it is VANE.');
    if (st.day >= 7) { await S.say(null, 'Inside: a postcard of the aquarium, addressed to you. Postmarked tomorrow.'); await S.say(null, 'On the back: WISH YOU WERE HERE. The handwriting is yours.'); return; }
    await S.say(null, 'Inside: a postcard of the aquarium. The back is blank, except for a stamp. The stamp is a picture of this mailbox.');
  },
  async huntingStand(S) {
    const st = S.st;
    await S.say(null, 'You climb the ladder up to the hunting stand. The boards creak.');
    await S.say(null, 'Over the trees, to the south, you can see the aquarium dome, very small. To the north, a brick smokestack.');
    if (st.day >= 6) await S.say(null, 'There\'s smoke coming out of the smokestack. The cannery has been closed since 1979.');
    else await S.say(null, 'Between you and the smokestack the trees are so thick they look like a wall.');
  },
  async stoneLoop(S) {
    const first = !S.get('loopedOnce');
    S.flag('loopedOnce');
    await S.fade(1, 0.6);
    World.player.x = 0; World.player.z = -61; World.player.face = 0;
    await S.fade(0, 0.8);
    if (first) { await S.say(null, 'The path comes out... at the stones. Again.'); await S.say(null, 'You walked in a straight line the whole way. You\'re sure of it.'); }
    else await S.say(null, 'The stones again.');
  },
  async cannerySeat(S) {
    await S.say(null, 'A ledger on the foreman\'s desk: EMPLOYEES, 1957. The ink has gone brown.');
    await S.say(null, 'Line 3: VANE, W. - AGE 16 - GUTTING. In the margin somebody has written: "good with fish. too quiet."');
    if (S.st.day >= 7) await S.say(null, 'Under it, in fresh blue ink, the same hand as the margin: "still too quiet."');
  },
  async cannedGoods(S) {
    const st = S.st;
    await S.say(null, 'Cans on the conveyor line, waiting to be labeled. Some of them already are: TIDEWATER BRAND. BELLWOOD CANNING CO.');
    await S.say(null, 'The picture on the label is a kid in a brass diving helmet, waving.');
    if (!S.has('can_label')) { await S.say(null, 'One label has peeled half off. You finish the job.'); await S.give('can_label'); }
  },
});

const OuterX = {
  atlas() {
    const P = (w, h, fn) => { const p = new Pix(w, h); fn(p); return p; };
    const add = (n, p) => Atlas.add(n, p);
    const sign = (n, t, o) => Decals.sign(n, t, o);
    sign('sign_trail', ['BELLWOOD WOODS', 'TRAIL'], { bg: '#5a3a1a', fg: '#e8d8a0', border: '#e8d8a0' });
    sign('sign_fork', ['< CREEK', 'STONES ^', 'STAND >'], { bg: '#6a4a2a', fg: '#f0e0b0', border: '#3a2a10' });
    sign('sign_search', ['SEARCH HQ', 'CHECK IN HERE'], { bg: '#e8c040', fg: '#1a1a1a', border: '#1a1a1a' });
    sign('sign_cannery', ['BELLWOOD CANNING CO.', 'NO TRESPASSING'], { bg: '#3a2a1a', fg: ['#e8d8a0', '#c83a3a'], border: '#e8d8a0', double: true });
    sign('sign_cannery_big', ['BELLWOOD CANNING CO. - EST. 1922'], { bg: '#6a2a1a', fg: '#f4e8c8', border: '#f4e8c8', double: true });
    sign('sign_cold', 'COLD ROOM', { bg: '#c8e0f0', fg: '#1a3a6a', border: '#1a3a6a' });
    sign('sign_office', ['OFFICE', 'FOREMAN'], { bg: '#3a4048', fg: '#e8e8e0', border: '#8a9098' });
    sign('sign_line', ['LINE 3', 'KEEP HANDS CLEAR'], { bg: '#e8c040', fg: ['#1a1a1a', '#c83a3a'], border: '#1a1a1a' });
    sign('closing_notice', ['NOTICE', 'THIS PLANT WILL', 'CLOSE PERMANENTLY', 'ON 6/1/79.', 'THANK YOU FOR', 'YOUR SERVICE.'], { bg: '#f4f0e0', fg: ['#c83a3a', '#2a2a2a', '#2a2a2a', '#2a2a2a', '#2a2a2a', '#2a2a2a'], border: '#8a8a80', w: 104 });
    add('trail_map', P(48, 32, (p) => {
      p.fill('#d8c8a0'); p.frame(0, 0, 48, 32, '#5a3a1a'); const G = '#6a8a4a';
      p.speckle(makeRng(48), [G, '#7a9a5a'], 0.3, 2, 2, 44, 28);
      p.line(24, 30, 24, 4, '#8a5a2a'); p.line(24, 18, 8, 18, '#8a5a2a'); p.line(24, 18, 42, 18, '#8a5a2a'); p.rect(12, 10, 2, 16, '#4a7ab8');
      p.ellipse(24, 10, 3, 3, '#8a8a8a'); p.rect(21, 28, 6, 2, '#c83a3a'); Closeups.tiny(p, 'X', 34, 5, '#c83a3a');
    }));
    add('search_map', P(40, 32, (p) => {
      p.fill('#e8e0c8'); for (let x = 0; x < 40; x += 5) p.rect(x, 0, 1, 32, '#9a9080'); for (let y = 0; y < 32; y += 5) p.rect(0, y, 40, 1, '#9a9080');
      for (let x = 0; x < 8; x++) for (let y = 0; y < 7; y++) { if (x === 4 && y === 1) continue; p.line(x * 5 + 1, y * 5 + 1, x * 5 + 4, y * 5 + 4, '#c83a3a'); p.line(x * 5 + 4, y * 5 + 1, x * 5 + 1, y * 5 + 4, '#c83a3a'); }
      p.rect(21, 6, 3, 3, '#3a6ab8'); p.frame(0, 0, 40, 32, '#6a6050');
    }));
    add('tent', P(40, 28, (p) => { p.tri(2, 27, 38, 27, 20, 2, '#4a6a3a'); p.tri(12, 27, 28, 27, 20, 10, '#1a2014'); p.line(20, 2, 20, 27, '#3a5a2a'); p.line(2, 27, 20, 2, '#2a3a1a'); p.line(38, 27, 20, 2, '#2a3a1a'); p.speckle(makeRng(40), ['#3a5a2a', '#5a7a4a'], 0.1); }));
    add('lantern', P(10, 14, (p) => { p.rect(3, 0, 4, 2, '#3a3a3a'); p.rect(2, 2, 6, 10, '#c8a040'); p.rect(3, 3, 4, 8, '#f8e8a0'); p.rect(1, 12, 8, 2, '#3a3a3a'); }));
    add('hook', P(8, 24, (p) => { p.rect(3, 0, 2, 14, '#6a6a70'); p.line(4, 14, 4, 20, '#8a8a90'); p.line(4, 20, 7, 18, '#8a8a90'); p.line(4, 20, 2, 22, '#8a8a90'); }));
    add('can_tide', P(12, 14, (p) => { p.rect(0, 1, 12, 12, '#b8b8c0'); p.rect(0, 3, 12, 8, '#2a5a9a'); p.ellipse(6, 7, 2.5, 2.5, '#d8b048'); p.ellipse(6, 7, 1.2, 1.2, '#bfe4ec'); p.rect(0, 0, 12, 1, '#d8d8e0'); p.rect(0, 13, 12, 1, '#8a8a90'); }));
    add('icon_canlabel', P(16, 16, (p) => { p.rect(1, 3, 14, 10, '#2a5a9a'); p.ellipse(8, 8, 3, 3, '#d8b048'); p.ellipse(8, 8, 1.5, 1.5, '#bfe4ec'); p.rect(1, 3, 14, 1, '#f4f0e0'); p.rect(1, 12, 14, 1, '#f4f0e0'); p.outline('#1a1420'); }));
    add('door_tree', P(16, 28, (p) => { p.fill([0, 0, 0, 0]); p.ellipse(8, 8, 7, 7, '#4a3a2a'); p.rect(1, 8, 14, 20, '#4a3a2a'); p.ellipse(8, 9, 5.5, 5.5, '#e8e0d0'); p.rect(2.5, 9, 11, 19, '#e8e0d0'); p.ellipse(11, 18, 1, 1, '#c8a040'); p.frame(2, 26, 12, 2, '#3a2a1a'); }));
    // close-up for the label
    Closeups.add('can_label', (p, h) => {
      p.rect(4, 8, 56, 32, '#2a5a9a'); p.rect(4, 8, 56, 3, '#f4f0e0'); p.rect(4, 37, 56, 3, '#f4f0e0');
      h.tinyC(p, 'TIDEWATER', 32, 13, '#f4e070'); p.ellipse(18, 28, 7, 7, '#d8b048'); p.ellipse(18, 28, 3.5, 3.5, '#bfe4ec'); p.rect(15, 34, 6, 3, '#3b62b5'); p.line(24, 26, 28, 22, '#e8c8a8');
      h.tiny(p, 'BELLWOOD', 30, 24, '#f4f0e0'); h.tiny(p, 'CANNING', 30, 30, '#f4f0e0'); p.tri(52, 8, 60, 8, 60, 18, [0, 0, 0, 0]);
    });
  },
};
