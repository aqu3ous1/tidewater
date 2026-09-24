'use strict';
// ---------------------------------------------------------------------------
// State — the save data, the save slots, and "meta" (things the disc remembers
// across every save: endings seen, deaths, how long you've been playing...)
// ---------------------------------------------------------------------------

const State = (() => {
  const KEY = 'tidewater.';
  const SLOTS = 4; // the 4th slot should not exist
  const mem = {}; // fallback when storage is unavailable
  function lsGet(k) { try { const v = localStorage.getItem(KEY + k); return v == null ? (mem[k] == null ? null : mem[k]) : v; } catch (e) { return mem[k] == null ? null : mem[k]; } }
  function lsSet(k, v) { mem[k] = v; try { localStorage.setItem(KEY + k, v); } catch (e) { /* private mode */ } }
  function lsDel(k) { delete mem[k]; try { localStorage.removeItem(KEY + k); } catch (e) { /* noop */ } }

  function newGame(name) {
    return {
      v: 1, name: (name || 'NEW KID').toUpperCase(), day: 1, tod: 'morning', map: 'town', spawn: 'intro', pos: null,
      flags: {}, inv: [], found: {}, money: 20, obj: null, side: [], hist: [], playtime: 0, deaths: 0, slot: 0,
      created: Date.now(), saved: 0, label: '',
    };
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function save(slot, st, label) {
    const s = clone(st);
    s.slot = slot; s.saved = Date.now();
    if (label) s.label = label;
    lsSet('slot' + slot, JSON.stringify(s));
    return s;
  }
  function load(slot) {
    const raw = lsGet('slot' + slot);
    if (!raw) return null;
    try { const s = JSON.parse(raw); s.slot = slot; return s; } catch (e) { return null; }
  }
  function erase(slot) { lsDel('slot' + slot); }
  function list() {
    const out = [];
    for (let i = 0; i < SLOTS; i++) out.push(load(i));
    return out;
  }

  // ---- meta -----------------------------------------------------------------
  const defaultMeta = () => ({ endings: {}, deaths: 0, boots: 0, phase: 0, total: 0, quitMidGhost: false, soft: true, music: 0.7, sfx: 0.9, seenFourth: {}, lastSlot: -1, trappedName: null, trueDone: false });
  let meta = null;
  function getMeta() {
    if (meta) return meta;
    try { meta = Object.assign(defaultMeta(), JSON.parse(lsGet('meta') || '{}')); } catch (e) { meta = defaultMeta(); }
    return meta;
  }
  function saveMeta() { lsSet('meta', JSON.stringify(getMeta())); }

  return { newGame, save, load, erase, list, getMeta, saveMeta, clone, SLOTS };
})();
