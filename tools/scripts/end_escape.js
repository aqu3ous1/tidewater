module.exports = {
  query: 'debug&day=8&tod=night&map=underneath&spawn=arrive&flags=ghostMet,underneath&items=feeding_log',
  steps: [
    ['wait', 2000],
    ['shot', 'u_arrive'],
    ['tp', 0, -22], ['wait', 2500], ['shot', 'u_hub'],
    ['answers', [0, 'feeding_log']], ['use', -11, -28.6],
    ['check', "Game.st.flags.rem_1"],
    ['answers', [0]], ['use', -15.6, 0.2],
    ['wait', 14000],
    ['print', '({ mode: Game.mode, endings: State.getMeta().endings })'],
  ],
};
