// Sleeps through all seven nights and finishes every dream the way a player
// would (teleporting between the important spots), checking each morning.
const use = (tag) => ['eval', `(() => { const it = World.map.inters.find((i) => i.tag === '${tag}'); if (!it) { T.log.push('!! no ${tag} on ' + Game.st.map); return; } T.useAt(it.x, it.z); })()`];
const sleep = (n) => [
  ['eval', `T.skipDreams = false; Game.st.day = ${n}; Game.st.tod = 'night'; Game.enterMap('house', 'bed'); 0`],
  ['answers', [1]],
  ['eval', 'Script.run((S) => Story.sleep(S))'],
  ['check', `Game.st.map === 'dream${n}' && Game.st.dreaming === ${n}`],
];
const morning = (n) => ['check', `Game.st.day === ${n} && !Game.st.dreaming && (Game.st.map === 'house' || Game.st.map === 'evanroom')`];
module.exports = {
  query: 'debug&day=1&tod=night&map=house&spawn=bed',
  steps: [
    ...sleep(1), ['answers', [0]], use('wake'), morning(2),
    ...sleep(2), ['eval', 'Game.st.dreamFlags && 0'], ['doorAt', 0, 7.5], ['check', "Game.st.map === 'dream2'"], use('key'), ['doorAt', 0, 7.5], ['check', "Game.st.map === 'dream2b'"], use('wake'), morning(3),
    ...sleep(3), use('wake'), ['check', "Game.st.map === 'dream3b'"], use('wake'), morning(4),
    ...sleep(4), ['doorAt', 40, -10], ['check', "Game.st.map === 'dream4'"], use('key'), ['doorAt', 40, -10], morning(5),
    ...sleep(5), use('wake'), ['check', "Game.st.map === 'dream5b'"], use('wake'), morning(6),
    ...sleep(6),
    ['tp', 0, -2.2], ['wait', 1500], ['check', 'Game.st.dreamFlags.loop === 1'],
    ['tp', 0, -2.2], ['wait', 1500], ['tp', 0, -2.2], ['wait', 1500], ['check', 'Game.st.dreamFlags.loop === 3'],
    ['tp', 0, -2.2], ['wait', 4000], morning(7),
    ...sleep(7),
    ['tp', 0, -5.4], ['wait', 2500], ['tp', 40, -5.4], ['wait', 2500], ['tp', 80, -5.4], ['wait', 2500], ['tp', 120, -5.4], ['wait', 2500],
    ['check', 'Math.abs(World.player.x - 160) < 1'], use('wake'), morning(8),
    ['print', '({ day: Game.st.day, map: Game.st.map, obj: Game.st.obj && Game.st.obj.text })'],
  ],
};
