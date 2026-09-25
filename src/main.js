'use strict';
// ---------------------------------------------------------------------------
// Boot. Paint every texture and sprite, then show the title.
// ---------------------------------------------------------------------------

(function boot() {
  const cv = document.getElementById('screen');
  if (!R.init(cv)) { cv.style.display = 'none'; document.getElementById('nogl').style.display = 'block'; return; }
  window.addEventListener('resize', () => R.resize());
  Atlas.init();
  Tex.build();
  Sprites.build();
  Decals.build();
  Closeups.build();
  Props.atlas();
  if (typeof Story !== 'undefined' && Story.atlas) Story.atlas();
  Atlas.upload();
  const meta = State.getMeta();
  meta.boots = (meta.boots || 0) + 1;
  State.saveMeta();
  R.settings.soft = meta.soft !== false;
  Sound.setVolume('music', meta.music == null ? 0.7 : meta.music);
  Sound.setVolume('sfx', meta.sfx == null ? 0.9 : meta.sfx);
  // audio can only start after a user gesture
  const unlock = () => { Sound.unlock(); window.removeEventListener('keydown', unlock); window.removeEventListener('pointerdown', unlock); };
  window.addEventListener('keydown', unlock);
  window.addEventListener('pointerdown', unlock);
  cv.focus();
  window.addEventListener('pointerdown', () => cv.focus());
  // remember if the player walks away in the middle of things
  window.addEventListener('beforeunload', () => {
    if (Game.mode === 'play' && Game.st) {
      const m = State.getMeta();
      if (Game.st.flags.ghostMet && !m.trueDone) m.quitMidGhost = true;
      State.saveMeta();
    }
  });
  const q = new URLSearchParams(location.search);
  if (q.has('debug') && typeof Debug !== 'undefined') { Debug.start(q); }
  else Title.boot();
  Main.start();
})();
