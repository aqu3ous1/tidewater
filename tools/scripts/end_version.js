module.exports = {
  query: 'debug&day=8&tod=night&map=underneath&spawn=arrive&flags=ghostMet,underneath',
  steps: [
    ['wait', 2000],
    ['tp', 0, -22], ['wait', 2500],
    ['answers', [1, 0]], ['use', 13, -37.6],
    ['wait', 4000],
    ['check', "Game.st.flags.version"],
    ['door', 'house'],
    ['wait', 6000],
    ['print', '({ mode: Game.mode, endings: State.getMeta().endings })'],
  ],
};
