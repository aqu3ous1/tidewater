'use strict';
// ---------------------------------------------------------------------------
// Debug launcher (only with ?debug in the URL). Used for testing:
//   index.html?debug&day=5&map=aquarium&spawn=front&tod=afternoon&flags=hired,metEvan&run=1
// ---------------------------------------------------------------------------
const Debug = {
  presets: {
    1: [],
    2: ['walterIntro', 'hired', 'milkInFridge', 'trashOut', 'unpacked_box1', 'unpacked_box2', 'unpacked_box3', 'trashReady'],
    3: ['danaCard', 'shellQuest', 'windowsDone', 'sawRules'],
    4: ['tank4Done', 'algae_a', 'algae_b'],
    5: ['millerPoster', 'ateSandwich', 'octoAdded'],
    6: ['bdayCard', 'metEvan', 'okaforEvan', 'kitchenSeen', 'collarFound', 'recipeFound', 'keptSecret'],
    7: ['phone6', 'walterConfront'],
    8: ['heardNews', 'walterDead', 'ghostMet', 'helping', 'backpackPlaced', 'evanRoomOpened'],
  },
  start(q) {
    const day = +(q.get('day') || 1);
    const st = State.newGame(q.get('name') || 'TESTER');
    st.day = day; st.tod = q.get('tod') || 'morning';
    for (let d = 1; d <= day; d++) for (const f of Debug.presets[d] || []) st.flags[f] = true;
    if (day >= 2) st.inv.push('key_house');
    if (day >= 2) st.found.badge = 1;
    for (const f of (q.get('flags') || '').split(',').filter(Boolean)) { const [k, v] = f.split('='); st.flags[k] = v == null ? true : (isNaN(+v) ? v : +v); }
    for (const i of (q.get('items') || '').split(',').filter(Boolean)) { if (ITEMS[i] && ITEMS[i].cat && COLLECTION_CATS[ITEMS[i].cat]) st.found[i] = 1; if (ITEMS[i] && (!ITEMS[i].cat || ITEMS[i].inv)) st.inv.push(i); }
    st.money = 60;
    Game.st = st; Game.mode = 'play';
    if (q.get('speed')) Game.debugSpeed = +q.get('speed');
    Game.enterMap(q.get('map') || 'house', q.get('spawn') || 'bed');
    if (q.get('x')) { World.player.x = +q.get('x'); World.player.z = +q.get('z'); }
    if (q.get('run')) Script.run(async (S) => { const f = Story['day' + day]; if (f) await f.call(Story, S); });
    if (q.get('obj')) { const [id, ...t] = q.get('obj').split(':'); st.obj = { id, text: t.join(':') || id, voice: 'game' }; }
  },
};
