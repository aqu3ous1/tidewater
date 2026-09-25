// In-page test harness (injected by tools/playthrough.js). Auto-answers every
// modal, records all dialogue, and offers teleport/interact helpers.
window.T = {
  auto: true, answers: [], log: [], errors: [],
  hook() {
    if (!T.auto) return;
    if (Menus.open) { Menus.close(null); return; }
    const m = UI.top;
    if (!m) return;
    const ans = () => (T.answers.length ? T.answers.shift() : 0);
    switch (m.type) {
      case 'dialog': {
        const who = m.who || '-';
        const text = m.pages.map((p) => p.join(' ')).join(' ');
        T.log.push(who + ': ' + text + (m.choices ? '  [' + m.choices.join(' | ') + ']' : ''));
        if (m.choices) { const a = ans(); T.log.push('   -> ' + m.choices[a]); UI.close(m, a); } else UI.close(m);
        break;
      }
      case 'choice': { const a = ans(); T.log.push('CHOICE [' + m.options.join(' | ') + '] -> ' + m.options[a]); UI.close(m, a); break; }
      case 'notice': T.log.push('** ' + m.text); UI.close(m); break;
      case 'card': T.log.push('== CARD: ' + (m.text || '') + ' ' + (m.sub || '') + (m.lines ? m.lines.join(' / ') : '')); UI.close(m); break;
      case 'inspect': T.log.push('[inspect ' + (typeof m.it.name === 'function' ? m.it.name(Game.st) : m.it.name) + ']'); UI.close(m); break;
      case 'doc': T.log.push('[read ' + (m.d.title || '') + ']'); UI.close(m); break;
      case 'numpad': { const a = ans(); T.log.push('NUMPAD -> ' + a); UI.close(m, a == null ? null : String(a)); break; }
      case 'hold': UI.close(m, true); break;
      case 'pick': { const a = T.answers.length ? T.answers.shift() : null; T.log.push('PICK -> ' + a); UI.close(m, a); break; }
      default: break;
    }
  },
  idle() { return !Script.busy && !UI.busy && !Menus.open && UI.fadeA < 0.05; },
  st() { return Game.st; },
  tp(x, z) { World.player.x = x; World.player.z = z; },
  nearestInter(x, z) {
    let best = null, bd = 1e9;
    for (const it of World.map.inters) { if (it.cond && !it.cond(Game.st)) continue; const d = Math.hypot(it.x - x, it.z - z); if (d < bd) { bd = d; best = it; } }
    return bd < 2.5 ? best : null;
  },
  useAt(x, z) {
    const it = T.nearestInter(x, z);
    if (!it) { T.log.push('!! no interactable near ' + x + ',' + z + ' on ' + Game.st.map); return false; }
    World.player.x = it.x; World.player.z = it.z + 0.8;
    Script.run(async (S) => { await it.use(S, it); });
    return true;
  },
  door(to, spawn) {
    const d = World.map.doors.find((q) => (q.to === to && (!spawn || q.spawn === spawn)) || (q.use && to === '*use'));
    if (!d) { T.log.push('!! no door to ' + to + ' on ' + Game.st.map); return false; }
    World.player.x = d.x + d.fx * 0.3; World.player.z = d.z + d.fz * 0.3;
    World.useDoor(d);
    return true;
  },
  doorAt(x, z) {
    let best = null, bd = 1e9;
    for (const d of World.map.doors) { const dd = Math.hypot(d.x - x, d.z - z); if (dd < bd) { bd = dd; best = d; } }
    if (!best || bd > 3) { T.log.push('!! no door near ' + x + ',' + z); return false; }
    World.useDoor(best); return true;
  },
  talk(id) {
    const n = World.npc(id);
    if (!n) { T.log.push('!! no npc ' + id + ' on ' + Game.st.map + ' (day ' + Game.st.day + ' ' + Game.st.tod + ')'); return false; }
    World.player.x = n.x; World.player.z = n.z + 1.0;
    Script.run(async (S) => { await n.talk(S, n); if (Story.afterTalk) await Story.afterTalk(S, n); });
    return true;
  },
  use(itemId, verb) { const it = ITEMS[itemId]; Script.run(async (S) => { await it.use(S, verb); }); },
  run(fnSrc) { Script.run(async (S) => { await (new Function('S', 'return (async () => {' + fnSrc + '})()'))(S); }); },
  summary() { const st = Game.st; if (!st) return { day: 0, tod: '-', map: Game.mode, obj: null, side: [], money: 0, inv: [] }; return { day: st.day, tod: st.tod, map: st.map, obj: st.obj && st.obj.text, side: st.side.map((s) => s.text), money: st.money, inv: st.inv.slice() }; },
};
Game.hooks.push(T.hook);
// scripted playthroughs go straight from night to morning; dreams have their own test (tools/dreams.js)
T.skipDreams = true;
window.addEventListener('error', (e) => T.errors.push(e.message));
const _ce = console.error; console.error = function () { T.errors.push(Array.from(arguments).map(String).join(' ')); _ce.apply(console, arguments); };
// keep the player next to whoever they are supposed to be following
Game.hooks.push(() => {
  const st = Game.st; if (!st || !st.obj) return;
  if (st.obj.id === 'follow') { const w = World.npc('walter'); if (w) { World.player.x = w.x; World.player.z = w.z + 1.2; } }
});
// optional: make Walter unable to catch you (for automated runs)
T.noStealth = false;
Game.hooks.push(() => {
  if (!T.noStealth) return;
  if (Story.stealth) Story.stealth.meter = 0;
  if (Story.chase) { const g = World.npc('ghost'); if (g) { g.x = -6; g.z = -7.5; g.path = []; } Story.chase.t = 0; }
});
