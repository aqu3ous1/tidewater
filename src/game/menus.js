'use strict';
// ---------------------------------------------------------------------------
// Menus — the TAB menu (ITEMS / COLLECTION / GOALS / MAP), pause + options,
// and the save slot screen (which is where the disc starts to misbehave).
// ---------------------------------------------------------------------------

const Menus = (() => {
  let cur = null; // {kind, ...}
  let resolve = null;
  let t = 0;
  const TABS = ['ITEMS', 'COLLECTION', 'GOALS', 'MAP'];
  const C = () => UI.C;

  function openMenu(m) { cur = m; Sound.sfx('select', { vol: 0.6 }); const d = deferred(); resolve = d.resolve; return d; }
  function closeMenu(v) { cur = null; const r = resolve; resolve = null; if (r) r(v); }

  // ------------------------------------------------------------------ items
  function items(tab) { return openMenu({ kind: 'items', tab: tab || 0, sel: 0, scroll: 0, sub: null, cat: null, catSel: 0 }); }
  function invList() { return Game.st.inv.filter((id) => ITEMS[id]); }

  function updItems(m, dt) {
    if (m.sub) return updSub(m, dt);
    if (m.cat) return updCat(m, dt);
    if (Input.pressed('select') || Input.pressed('b')) { Input.eat('select'); Input.eat('b'); Sound.sfx('cancel'); closeMenu(); return; }
    if (Input.pressed('start')) { Input.eat('start'); closeMenu(); return; }
    if (Input.repeat('left', dt)) { m.tab = (m.tab + TABS.length - 1) % TABS.length; m.sel = 0; m.scroll = 0; Sound.sfx('move'); }
    if (Input.repeat('right', dt)) { m.tab = (m.tab + 1) % TABS.length; m.sel = 0; m.scroll = 0; Sound.sfx('move'); }
    if (m.tab === 0) {
      const list = invList();
      if (list.length) {
        if (Input.repeat('up', dt)) { m.sel = (m.sel + list.length - 1) % list.length; Sound.sfx('move'); }
        if (Input.repeat('down', dt)) { m.sel = (m.sel + 1) % list.length; Sound.sfx('move'); }
        m.sel = Math.min(m.sel, list.length - 1);
        if (Input.pressed('a')) { Input.eat('a'); openSub(m, list[m.sel]); }
      }
    } else if (m.tab === 1) {
      const cats = Object.keys(COLLECTION_CATS);
      if (Input.repeat('up', dt)) { m.sel = (m.sel + cats.length - 1) % cats.length; Sound.sfx('move'); }
      if (Input.repeat('down', dt)) { m.sel = (m.sel + 1) % cats.length; Sound.sfx('move'); }
      if (Input.pressed('a')) { Input.eat('a'); m.cat = cats[m.sel]; m.catSel = 0; Sound.sfx('select'); }
    } else if (m.tab === 3) {
      TownMap.update(m, dt);
    }
  }
  function updCat(m, dt) {
    const ids = COLLECTION_CATS[m.cat].items;
    if (Input.repeat('up', dt)) { m.catSel = (m.catSel + ids.length - 1) % ids.length; Sound.sfx('move'); }
    if (Input.repeat('down', dt)) { m.catSel = (m.catSel + 1) % ids.length; Sound.sfx('move'); }
    if (Input.pressed('b')) { Input.eat('b'); m.cat = null; Sound.sfx('cancel'); return; }
    if (Input.pressed('a')) {
      Input.eat('a');
      const id = ids[m.catSel];
      if (Game.st.found[id]) { const it = ITEMS[id]; if (it.doc && !it.photo && !it.lookFirst) UI.read(it.doc); else UI.inspect(id); }
      else Sound.sfx('wrong');
    }
  }
  function openSub(m, id) {
    const it = ITEMS[id];
    const opts = ['LOOK'];
    if (it.doc) opts.push('READ');
    const verbs = it.verbs ? it.verbs(Game.st) : [];
    for (const v of verbs) opts.push(v);
    opts.push('BACK');
    m.sub = { id, opts, sel: 0 };
    Sound.sfx('select');
  }
  function updSub(m, dt) {
    const s = m.sub;
    if (Input.repeat('up', dt)) { s.sel = (s.sel + s.opts.length - 1) % s.opts.length; Sound.sfx('move'); }
    if (Input.repeat('down', dt)) { s.sel = (s.sel + 1) % s.opts.length; Sound.sfx('move'); }
    if (Input.pressed('b')) { Input.eat('b'); m.sub = null; Sound.sfx('cancel'); return; }
    if (Input.pressed('a')) {
      Input.eat('a');
      const v = s.opts[s.sel], it = ITEMS[s.id];
      if (v === 'BACK') { m.sub = null; return; }
      if (v === 'LOOK') { UI.inspect(s.id); return; }
      if (v === 'READ') { UI.read(it.doc); return; }
      // verbs run as scripts with the menu closed
      m.sub = null; closeMenu();
      Script.run(async (S) => { await it.use(S, v); });
    }
  }
  function drawItems(ctx, m) {
    const c = C();
    UI.fill(ctx, 0, 0, 320, 240, 'rgba(6,8,20,0.82)');
    // tabs
    let x = 10;
    TABS.forEach((tb, i) => {
      const w = tb.length * 6 + 10;
      UI.panel(ctx, x, 6, w, 14, i === m.tab ? { bg: '#2a3060' } : { bg: 'rgba(12,16,40,0.9)', border: '#6a6a80', inner: 'rgba(0,0,0,0)' });
      Font.draw(ctx, tb, x + 5, 9, i === m.tab ? c.hi : c.dim);
      x += w + 4;
    });
    Font.draw(ctx, '← →', 282, 9, c.dim);
    const st = Game.st;
    if (m.tab === 0) {
      const list = invList();
      UI.panel(ctx, 8, 26, 150, 190);
      Font.draw(ctx, '$' + (st.money || 0), 118, 30, '#a8d8a0');
      if (!list.length) Font.draw(ctx, 'NOTHING.', 20, 44, c.dim);
      const vis = 10;
      if (m.sel < m.scroll) m.scroll = m.sel; if (m.sel >= m.scroll + vis) m.scroll = m.sel - vis + 1;
      list.slice(m.scroll, m.scroll + vis).forEach((id, i) => {
        const it = ITEMS[id], y = 42 + i * 17, sel = m.scroll + i === m.sel;
        if (sel) UI.fill(ctx, 12, y - 2, 142, 17, 'rgba(244,224,112,0.15)');
        UI.icon(ctx, 'icon_' + it.icon, 14, y - 1);
        const nm = typeof it.name === 'function' ? it.name(st) : it.name;
        Font.draw(ctx, nm.length > 20 ? nm.slice(0, 19) + '.' : nm, 33, y + 3, sel ? c.hi : c.text);
      });
      if (list.length) {
        const it = ITEMS[list[m.sel]];
        UI.panel(ctx, 164, 26, 148, 190);
        UI.icon(ctx, 'icon_' + it.icon, 214, 36, 3);
        const nm = typeof it.name === 'function' ? it.name(st) : it.name;
        wrapText(nm, 22).forEach((l, i) => Font.center(ctx, l, 238, 90 + i * 10, c.hi));
        const d = typeof it.desc === 'function' ? it.desc(st) : (it.desc || '');
        wrapText(UIName(d), 22).slice(0, 9).forEach((l, i) => Font.draw(ctx, l, 172, 112 + i * 10, c.text));
      }
      if (m.sub) {
        const s = m.sub, w = Math.max(...s.opts.map((o) => o.length)) * 6 + 22, h = s.opts.length * 12 + 8;
        UI.panel(ctx, 100, 60, w, h, { bg: '#141a3a' });
        s.opts.forEach((o, i) => { if (i === s.sel) Font.draw(ctx, '▶', 105, 65 + i * 12, c.hi); Font.draw(ctx, o, 114, 65 + i * 12, i === s.sel ? c.hi : c.text); });
      }
    } else if (m.tab === 1) {
      const cats = Object.keys(COLLECTION_CATS);
      UI.panel(ctx, 8, 26, 304, 190);
      if (!m.cat) {
        cats.forEach((k, i) => {
          const cat = COLLECTION_CATS[k], y = 40 + i * 20, n = cat.items.filter((id) => st.found[id]).length;
          if (i === m.sel) UI.fill(ctx, 14, y - 4, 292, 18, 'rgba(244,224,112,0.15)');
          UI.icon(ctx, 'icon_' + cat.icon, 18, y - 3);
          Font.draw(ctx, cat.name, 40, y + 1, i === m.sel ? c.hi : c.text);
          Font.draw(ctx, n + '/' + cat.items.length, 262, y + 1, n === cat.items.length ? '#a8d8a0' : c.dim);
        });
        Font.draw(ctx, 'TOTAL PLAY TIME ' + fmtTime(st.playtime), 18, 198, c.dim);
      } else {
        const cat = COLLECTION_CATS[m.cat];
        Font.draw(ctx, cat.name, 18, 32, c.hi);
        const vis = 14, ids = cat.items;
        const sc = Math.max(0, Math.min(m.catSel - 6, ids.length - vis));
        ids.slice(sc, sc + vis).forEach((id, i) => {
          const y = 46 + i * 12, idx = sc + i, f = st.found[id], it = ITEMS[id];
          if (idx === m.catSel) UI.fill(ctx, 14, y - 2, 292, 12, 'rgba(244,224,112,0.15)');
          const nm = f ? (typeof it.name === 'function' ? it.name(st) : it.name) : '???';
          Font.draw(ctx, (idx + 1 < 10 ? ' ' : '') + (idx + 1) + '. ' + nm, 20, y, f ? (idx === m.catSel ? c.hi : c.text) : '#5a5a70');
        });
      }
    } else if (m.tab === 2) {
      UI.panel(ctx, 8, 26, 304, 190);
      Font.draw(ctx, 'NOW:', 18, 34, c.dim);
      const o = st.obj;
      const cur = o ? wrapText(UIName(o.text), 44) : ['(NOTHING RIGHT NOW)'];
      cur.forEach((l, i) => Font.draw(ctx, l, 18, 46 + i * 11, o && o.voice === 'evan' ? '#e8b0b0' : c.hi, { wobble: o && o.voice === 'evan' ? i + 2 : 0 }));
      let y = 50 + cur.length * 11;
      if (st.side.length) {
        Font.draw(ctx, 'ALSO:', 18, y, c.dim); y += 12;
        for (const s of st.side) { wrapText('- ' + UIName(s.text), 46).forEach((l) => { Font.draw(ctx, l, 18, y, s.voice === 'evan' ? '#e8b0b0' : c.text); y += 11; }); }
      }
      y += 4;
      Font.draw(ctx, 'DONE:', 18, y, c.dim); y += 12;
      const hist = Story.historyView ? Story.historyView(st) : st.hist.slice().reverse();
      for (const h of hist) { if (y > 204) break; Font.draw(ctx, UIName(h).slice(0, 48), 18, y, '#7a7a90'); y += 10; }
    } else if (m.tab === 3) {
      TownMap.draw(ctx, m, t);
    }
  }
  function UIName(s) { return String(s).replace(/\{name\}/g, (Game.st && Game.st.name) || 'YOU'); }

  // ------------------------------------------------------------------ pause / options
  function pause() { return openMenu({ kind: 'pause', sel: 0, opt: null }); }
  function updPause(m, dt) {
    if (m.opt) return updOptions(m, dt);
    const opts = ['RESUME', 'OPTIONS', 'QUIT TO TITLE'];
    if (Input.repeat('up', dt)) { m.sel = (m.sel + opts.length - 1) % opts.length; Sound.sfx('move'); }
    if (Input.repeat('down', dt)) { m.sel = (m.sel + 1) % opts.length; Sound.sfx('move'); }
    if (Input.pressed('b') || Input.pressed('start')) { Input.eat('b'); Input.eat('start'); closeMenu(); return; }
    if (Input.pressed('a')) {
      Input.eat('a');
      if (m.sel === 0) closeMenu();
      else if (m.sel === 1) { m.opt = { sel: 0 }; Sound.sfx('select'); }
      else {
        closeMenu();
        Script.run(async (S) => {
          const c = await S.ask(null, 'Quit to the title screen? Unsaved progress will be lost.', ['NO', 'YES']);
          if (c === 1) Title.show(true);
        });
      }
    }
  }
  function updOptions(m, dt) {
    const meta = State.getMeta();
    const n = 4;
    if (Input.repeat('up', dt)) { m.opt.sel = (m.opt.sel + n - 1) % n; Sound.sfx('move'); }
    if (Input.repeat('down', dt)) { m.opt.sel = (m.opt.sel + 1) % n; Sound.sfx('move'); }
    const dx = Input.repeat('right', dt) ? 1 : Input.repeat('left', dt) ? -1 : 0;
    if (dx || Input.pressed('a')) {
      if (Input.pressed('a')) Input.eat('a');
      if (m.opt.sel === 0) { meta.soft = !meta.soft; R.settings.soft = meta.soft; }
      if (m.opt.sel === 1) { meta.music = clamp(Math.round((meta.music + (dx || 0.1) * 0.1) * 10) / 10, 0, 1); Sound.setVolume('music', meta.music); }
      if (m.opt.sel === 2) { meta.sfx = clamp(Math.round((meta.sfx + (dx || 0.1) * 0.1) * 10) / 10, 0, 1); Sound.setVolume('sfx', meta.sfx); }
      if (m.opt.sel === 3 && Input.held('a')) { m.opt = null; State.saveMeta(); Sound.sfx('cancel'); return; }
      Sound.sfx('move'); State.saveMeta();
    }
    if (Input.pressed('b')) { Input.eat('b'); m.opt = null; State.saveMeta(); Sound.sfx('cancel'); }
  }
  function drawPause(ctx, m) {
    const c = C();
    UI.fill(ctx, 0, 0, 320, 240, 'rgba(0,0,0,0.6)');
    if (m.opt) {
      const meta = State.getMeta();
      UI.panel(ctx, 70, 60, 180, 100);
      Font.center(ctx, 'OPTIONS', 160, 67, c.hi);
      const rows = ['SCREEN   ' + (meta.soft ? 'SOFT' : 'SHARP'), 'MUSIC    ' + bar(meta.music), 'SOUND    ' + bar(meta.sfx), 'BACK'];
      rows.forEach((r, i) => { if (i === m.opt.sel) Font.draw(ctx, '▶', 80, 86 + i * 14, c.hi); Font.draw(ctx, r, 90, 86 + i * 14, i === m.opt.sel ? c.hi : c.text); });
      return;
    }
    UI.panel(ctx, 90, 70, 140, 76);
    Font.center(ctx, 'PAUSED', 160, 77, c.hi);
    ['RESUME', 'OPTIONS', 'QUIT TO TITLE'].forEach((r, i) => { if (i === m.sel) Font.draw(ctx, '▶', 100, 96 + i * 14, c.hi); Font.draw(ctx, r, 110, 96 + i * 14, i === m.sel ? c.hi : c.text); });
    const st = Game.st;
    if (st) { Font.center(ctx, 'DAY ' + st.day + '   ' + fmtTime(st.playtime), 160, 156, c.dim); }
  }
  const bar = (v) => '[' + '#'.repeat(Math.round(v * 10)) + '-'.repeat(10 - Math.round(v * 10)) + ']';

  // ------------------------------------------------------------------ save / load slots
  function saveSlots(mode, label) { return openMenu({ kind: 'slots', mode, sel: Math.max(0, Game.st ? Game.st.slot : 0), label, confirm: null }); }
  function slotRows() {
    const saves = State.list();
    const rows = [];
    const meta = State.getMeta();
    for (let i = 0; i < 3; i++) rows.push({ slot: i, s: saves[i] });
    // the fourth slot only appears once something has written to it
    if (saves[3]) rows.push({ slot: 3, s: saves[3] });
    // other people's saves
    if (meta.phase >= 3 && !meta.trueDone) {
      rows.push({ fake: 'kaylee', s: { name: 'KAYLEE', day: 8, playtime: 42127, map: 'underneath' } });
      rows.push({ fake: 'marcus', s: { name: 'MARCUS', day: 3, playtime: 8035, map: 'aquarium' } });
    }
    return rows;
  }
  function slotLabel(r) {
    const s = r.s;
    if (!s) return ['- EMPTY -', ''];
    let nm = s.name, day = 'DAY ' + s.day;
    const meta = State.getMeta();
    if (!r.fake && Story.slotDisguise) { const d = Story.slotDisguise(s, meta); if (d) { nm = d.name || nm; day = d.day || day; } }
    const place = (MAPS[s.map] && MAPS[s.map].name) || (s.map || '').toUpperCase();
    return [nm + '   ' + day, fmtTime(s.playtime || 0) + '  ' + place];
  }
  function updSlots(m, dt) {
    const rows = slotRows();
    if (m.confirm) {
      if (Input.repeat('up', dt) || Input.repeat('down', dt)) { m.confirm.sel = 1 - m.confirm.sel; Sound.sfx('move'); }
      if (Input.pressed('b')) { Input.eat('b'); m.confirm = null; return; }
      if (Input.pressed('a')) {
        Input.eat('a');
        if (m.confirm.sel === 0) { m.confirm = null; return; }
        const r = rows[m.sel];
        m.confirm = null;
        finishSlot(m, r);
      }
      return;
    }
    if (Input.repeat('up', dt)) { m.sel = (m.sel + rows.length - 1) % rows.length; Sound.sfx('move'); }
    if (Input.repeat('down', dt)) { m.sel = (m.sel + 1) % rows.length; Sound.sfx('move'); }
    m.sel = Math.min(m.sel, rows.length - 1);
    if (Input.pressed('b')) { Input.eat('b'); Sound.sfx('cancel'); closeMenu(null); return; }
    if (Input.pressed('a')) {
      Input.eat('a');
      const r = rows[m.sel];
      if (m.mode === 'save') {
        if (r.fake) { Sound.sfx('wrong'); m.msg = 'This file belongs to someone else.'; m.msgT = 2; return; }
        if (r.s && r.s.id !== Game.st.id) { m.confirm = { sel: 0, text: 'OVERWRITE?' }; return; }
        finishSlot(m, r);
      } else {
        if (!r.s) { Sound.sfx('wrong'); return; }
        finishSlot(m, r);
      }
    }
    if (m.msgT) m.msgT -= dt;
  }
  function finishSlot(m, r) {
    if (m.mode === 'save') {
      Game.st.slot = r.slot;
      Game.saveTo(r.slot, m.label);
      Sound.sfx('save');
      closeMenu(r.slot);
    } else {
      Sound.sfx('select');
      closeMenu(r);
    }
  }
  function drawSlots(ctx, m) {
    const c = C();
    UI.fill(ctx, 0, 0, 320, 240, 'rgba(4,6,16,0.9)');
    Font.center(ctx, m.mode === 'save' ? 'SAVE' : 'CONTINUE', 160, 14, c.hi);
    const rows = slotRows();
    rows.forEach((r, i) => {
      const y = 32 + i * 30, sel = i === m.sel;
      UI.panel(ctx, 30, y, 260, 26, sel ? { bg: '#2a3060' } : r.fake ? { bg: 'rgba(30,10,14,0.9)', border: '#8a6a6a' } : null);
      const [a, b] = slotLabel(r);
      Font.draw(ctx, (r.slot != null ? 'FILE ' + (r.slot + 1) : 'FILE ?') + '  ' + a, 38, y + 5, sel ? c.hi : c.text);
      if (b) Font.draw(ctx, b, 38, y + 15, c.dim);
    });
    if (m.confirm) {
      UI.panel(ctx, 110, 180, 100, 40);
      Font.center(ctx, m.confirm.text, 160, 186, c.hi);
      ['NO', 'YES'].forEach((o, i) => Font.draw(ctx, (i === m.confirm.sel ? '▶' : ' ') + o, 126 + i * 36, 202, i === m.confirm.sel ? c.hi : c.text));
    }
    if (m.msgT > 0) Font.center(ctx, m.msg, 160, 222, '#e8a0a0');
    else Font.center(ctx, 'Z: SELECT   X: BACK', 160, 222, c.dim);
  }

  // ------------------------------------------------------------------ hooks
  function update(dt) {
    t += dt;
    if (!cur || UI.busy) return;
    if (cur.kind === 'items') updItems(cur, dt);
    else if (cur.kind === 'pause') updPause(cur, dt);
    else if (cur.kind === 'slots') updSlots(cur, dt);
  }
  function draw(ctx) {
    if (!cur) return;
    if (cur.kind === 'items') drawItems(ctx, cur);
    else if (cur.kind === 'pause') drawPause(ctx, cur);
    else if (cur.kind === 'slots') drawSlots(ctx, cur);
    // modals opened from inside menus draw on top
    if (UI.busy) UI.draw(ctx, true, true);
  }
  return { items, pause, saveSlots, update, draw, close: closeMenu, get open() { return !!cur; }, slotRows };
})();
