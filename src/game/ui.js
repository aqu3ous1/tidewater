'use strict';
// ---------------------------------------------------------------------------
// UI — everything drawn on the 320x240 overlay: dialogue, choices, objective
// banners, notices, item inspection, documents, keypad, menus, fades, cards.
// ---------------------------------------------------------------------------

const SPEAKERS = {
  walter: { name: 'WALTER', pitch: 150 },
  walter_ghost: { name: 'WALTER', pitch: 118, style: 'ghost' },
  walter_voice: { name: '', pitch: 110, style: 'ghost' },
  dana: { name: 'DANA', pitch: 330 },
  miller: { name: 'MRS. MILLER', pitch: 290 },
  hal: { name: 'HAL', pitch: 140 },
  donna: { name: 'DONNA', pitch: 310 },
  priya: { name: 'PRIYA', pitch: 300 },
  gus: { name: 'GUS', pitch: 125 },
  okafor: { name: 'MS. OKAFOR', pitch: 260 },
  ray: { name: 'RAY', pitch: 115 },
  lou: { name: 'LOU', pitch: 190 },
  ellis: { name: 'PASTOR ELLIS', pitch: 170 },
  mae: { name: 'MAE', pitch: 280 },
  bea: { name: 'BEA', pitch: 420 },
  tommy: { name: 'TOMMY', pitch: 400 },
  evan: { name: 'EVAN', pitch: 440, style: 'child' },
  evan_tape: { name: 'TAPE', pitch: 430, style: 'tape' },
  tape: { name: 'TAPE', pitch: 200, style: 'tape' },
  phone: { name: '???', pitch: 120 },
  you: { name: '{name}', pitch: 260 },
  kaylee: { name: 'KAYLEE', pitch: 360, style: 'ghost' },
  newkid: { name: 'NEW KID', pitch: 380 },
  sign: { name: '', pitch: 220 },
};

const UI = (() => {
  const W = 320, H = 240;
  const modals = [];
  let banner = null; // {text, voice, t}
  let fade = { a: 0, from: 0, to: 0, t: 0, dur: 0, res: null, color: [0, 0, 0] };
  let flash = 0;
  let subtitle = null;
  let t = 0;

  const C = { bg: 'rgba(12,16,40,0.88)', border: '#e8e4d0', text: '#f4f2ea', dim: '#9aa0b8', hi: '#f4e070', paper: '#efe9d6', ink: '#2a2440' };

  function name(s) { return String(s).replace(/\{name\}/g, (Game.st && Game.st.name) || 'YOU'); }
  function fill(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
  function frame(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1); ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h); }
  function panel(ctx, x, y, w, h, style) {
    style = style || {};
    fill(ctx, x, y, w, h, style.bg || C.bg);
    frame(ctx, x, y, w, h, style.border || C.border);
    frame(ctx, x + 2, y + 2, w - 4, h - 4, style.inner || 'rgba(232,228,208,0.35)');
  }
  function icon(ctx, name, x, y, scale) {
    const r = Atlas.get(name); if (!r || !Atlas.canvas) return;
    const s = scale || 1;
    ctx.drawImage(Atlas.canvas, r.x, r.y, r.w, r.h, x, y, r.w * s, r.h * s);
  }

  // ---------------------------------------------------------------- modal plumbing
  function push(m) { const d = deferred(); m.resolve = d.resolve; modals.push(m); return d; }
  function close(m, v) { const i = modals.indexOf(m); if (i >= 0) modals.splice(i, 1); if (m.resolve) m.resolve(v); }
  const top = () => modals[modals.length - 1];

  // ---------------------------------------------------------------- dialogue
  function dialog(who, text, o) {
    o = o || {};
    const sp = SPEAKERS[who] || (who ? { name: who.toUpperCase(), pitch: 220 } : { name: '', pitch: 200 });
    const style = o.style || sp.style || (who ? 'normal' : 'narration');
    const lines = wrapText(name(text), 48);
    const pages = [];
    for (let i = 0; i < lines.length; i += 4) pages.push(lines.slice(i, i + 4));
    return push({ type: 'dialog', who, sp, style, pages, page: 0, chars: 0, speed: o.speed || (style === 'ghost' ? 26 : 44), choices: o.choices || null, sel: 0, inChoice: false, blipT: 0, auto: o.auto, autoT: o.auto || 0, noSkip: o.noSkip });
  }
  function pageLen(m) { return m.pages[m.page].join('\n').length; }
  function updDialog(m, dt) {
    const len = pageLen(m);
    if (m.chars < len) {
      const before = Math.floor(m.chars);
      m.chars = Math.min(len, m.chars + dt * m.speed);
      const after = Math.floor(m.chars);
      if (after > before) {
        m.blipT -= after - before;
        if (m.blipT <= 0) {
          m.blipT = 2;
          const ch = m.pages[m.page].join('\n')[after - 1];
          if (ch && ch !== ' ' && m.style !== 'narration') Sound.sfx('blip', { pitch: m.sp.pitch * (m.style === 'ghost' ? 0.9 + Math.random() * 0.05 : 1 + Math.random() * 0.08), vol: m.style === 'tape' ? 0.5 : 1 });
          else if (ch && ch !== ' ') Sound.sfx('blip', { pitch: 700, vol: 0.25 });
        }
      }
      if (Input.pressed('a') && !m.noSkip) { m.chars = len; Input.eat('a'); }
      return;
    }
    if (m.auto) { m.autoT -= dt; if (m.autoT <= 0) { if (m.page < m.pages.length - 1) { m.page++; m.chars = 0; m.autoT = m.auto; } else close(m); } return; }
    if (m.inChoice) {
      if (Input.repeat('up', dt)) { m.sel = (m.sel + m.choices.length - 1) % m.choices.length; Sound.sfx('move'); }
      if (Input.repeat('down', dt)) { m.sel = (m.sel + 1) % m.choices.length; Sound.sfx('move'); }
      if (Input.pressed('a')) { Input.eat('a'); Sound.sfx('select'); close(m, m.sel); }
      return;
    }
    if (Input.pressed('a') || Input.pressed('b')) {
      Input.eat('a'); Input.eat('b');
      if (m.page < m.pages.length - 1) { m.page++; m.chars = 0; }
      else if (m.choices) { m.inChoice = true; }
      else close(m);
    }
  }
  function drawDialog(ctx, m) {
    const x = 6, y = 176, w = 308, h = 58;
    const ghost = m.style === 'ghost', paper = m.style === 'child';
    const tape = m.style === 'tape';
    panel(ctx, x, y, w, h, paper ? { bg: 'rgba(240,234,214,0.95)', border: '#8a7a5a' } : ghost ? { bg: 'rgba(10,14,24,0.9)', border: '#8aa0c0', inner: 'rgba(138,160,192,0.3)' } : tape ? { bg: 'rgba(20,20,20,0.9)', border: '#8a8a8a' } : null);
    const nm = name(m.sp.name || '');
    if (nm) {
      const nw = nm.length * 6 + 10;
      panel(ctx, x + 6, y - 11, nw, 13, paper ? { bg: '#efe9d6', border: '#8a7a5a' } : ghost ? { bg: '#0a0e18', border: '#8aa0c0' } : null);
      Font.draw(ctx, nm, x + 11, y - 10, paper ? '#8a3a3a' : ghost ? '#b8c8e0' : C.hi);
    }
    const col = paper ? '#2a3a8a' : ghost ? '#c8d8f0' : tape ? '#d8d8c8' : m.style === 'narration' ? '#dcdcd0' : C.text;
    let remaining = Math.floor(m.chars);
    m.pages[m.page].forEach((line, i) => {
      if (remaining <= 0) return;
      const n = Math.min(line.length, remaining);
      Font.draw(ctx, line, x + 9, y + 7 + i * 11, col, { max: n, wobble: paper ? i + 1 : ghost && Math.random() < 0.02 ? Math.random() * 10 : 0, shadow: paper ? null : '#05060c' });
      remaining -= line.length + 1;
    });
    if (m.chars >= pageLen(m) && !m.inChoice && !m.auto && Math.floor(t * 3) % 2) Font.draw(ctx, '▼', x + w - 14, y + h - 12, paper ? '#8a3a3a' : C.hi);
    if (m.inChoice) drawChoiceBox(ctx, m.choices, m.sel, paper ? 'paper' : ghost ? 'ghost' : null);
  }
  function drawChoiceBox(ctx, choices, sel, style) {
    const cw = Math.max(...choices.map((c) => name(c).length)) * 6 + 22;
    const ch = choices.length * 12 + 8;
    const x = 314 - cw, y = 172 - ch - 2;
    panel(ctx, x, y, cw, ch, style === 'paper' ? { bg: '#efe9d6', border: '#8a7a5a' } : style === 'ghost' ? { bg: 'rgba(10,14,24,0.95)', border: '#8aa0c0' } : null);
    choices.forEach((c, i) => {
      const col = style === 'paper' ? (i === sel ? '#8a3a3a' : '#2a3a8a') : (i === sel ? C.hi : C.text);
      if (i === sel) Font.draw(ctx, '▶', x + 5, y + 5 + i * 12, col);
      Font.draw(ctx, name(c), x + 14, y + 5 + i * 12, col);
    });
  }
  function choice(options, o) { return push({ type: 'choice', options, sel: 0, o: o || {} }); }
  function updChoice(m, dt) {
    if (Input.repeat('up', dt)) { m.sel = (m.sel + m.options.length - 1) % m.options.length; Sound.sfx('move'); }
    if (Input.repeat('down', dt)) { m.sel = (m.sel + 1) % m.options.length; Sound.sfx('move'); }
    if (Input.pressed('a')) { Input.eat('a'); Sound.sfx('select'); close(m, m.sel); }
    if (Input.pressed('b') && m.o.cancel != null) { Input.eat('b'); Sound.sfx('cancel'); close(m, m.o.cancel); }
  }

  // ---------------------------------------------------------------- banners / notices / cards
  function bannerShow(text, voice, o) {
    o = o || {};
    banner = { text: name(text), voice: voice || 'game', t: 0, dur: o.dur || 4.5, glitch: o.glitch };
    Sound.sfx(voice === 'evan' ? 'objective_evan' : 'objective', { vol: voice === 'walter' ? 0.6 : 1 });
    if (o.wait) return Script.wait(o.wait);
    return Promise.resolve();
  }
  function drawBanner(ctx) {
    if (!banner) return;
    banner.t += 1 / 60;
    if (banner.t > banner.dur) { banner = null; return; }
    const a = Math.min(1, banner.t * 4, (banner.dur - banner.t) * 2);
    if (a <= 0) return;
    ctx.globalAlpha = a;
    let text = banner.text;
    if (banner.glitch && Math.random() < 0.06) text = banner.glitch;
    const lines = wrapText(text, 44);
    const w = Math.max(...lines.map((l) => l.length)) * 6 + 20, h = lines.length * 11 + (banner.voice === 'evan' ? 10 : 20);
    const x = Math.round(160 - w / 2), y = 10;
    if (banner.voice === 'evan') {
      panel(ctx, x, y, w, h, { bg: 'rgba(240,234,214,0.96)', border: '#8a7a5a', inner: 'rgba(0,0,0,0)' });
      lines.forEach((l, i) => Font.draw(ctx, l, x + 10, y + 5 + i * 11, '#2a3a8a', { wobble: i + 3 }));
    } else {
      panel(ctx, x, y, w, h, banner.voice === 'walter' ? { bg: 'rgba(10,14,24,0.9)', border: '#8aa0c0' } : null);
      Font.center(ctx, 'OBJECTIVE', 160, y + 4, banner.voice === 'walter' ? '#8aa0c0' : '#9aa8d8');
      lines.forEach((l, i) => Font.center(ctx, l, 160, y + 14 + i * 11, banner.voice === 'walter' ? '#c8d8f0' : C.hi, { shadow: '#05060c' }));
    }
    ctx.globalAlpha = 1;
  }
  function notice(text, o) { o = o || {}; return push({ type: 'notice', text: name(text), icon: o.icon, t: 0, dur: o.dur || 2.2 }); }
  function updNotice(m, dt) { m.t += dt; if (m.t > 0.25 && (Input.pressed('a') || Input.pressed('b'))) { Input.eat('a'); Input.eat('b'); close(m); } else if (m.t > m.dur) close(m); }
  function drawNotice(ctx, m) {
    const w = m.text.length * 6 + (m.icon ? 34 : 20), h = m.icon ? 26 : 18;
    const x = Math.round(160 - w / 2), y = 120 - h / 2;
    panel(ctx, x, y, w, h);
    if (m.icon) icon(ctx, 'icon_' + m.icon, x + 7, y + 5);
    Font.draw(ctx, m.text, x + (m.icon ? 27 : 10), y + (h - 8) / 2 - 1, C.text, { shadow: '#05060c' });
  }
  // full-screen card (day titles, endings, fourth-wall moments)
  function card(text, sub, o) { o = o || {}; return push({ type: 'card', text: name(text || ''), sub: sub ? name(sub) : '', t: 0, dur: o.dur || 3, bg: o.bg || '#000', fg: o.fg || '#e8e4d8', press: o.press, lines: o.lines }); }
  function updCard(m, dt) { m.t += dt; if ((m.press && m.t > 0.8 && Input.pressed('a')) || (!m.press && m.t > m.dur)) { Input.eat('a'); close(m); } }
  function drawCard(ctx, m) {
    const a = m.press ? Math.min(1, m.t * 2) : Math.min(1, m.t * 2, (m.dur - m.t) * 2);
    fill(ctx, 0, 0, W, H, m.bg);
    ctx.globalAlpha = Math.max(0, a);
    if (m.lines) {
      const y0 = Math.round(120 - m.lines.length * 6);
      m.lines.forEach((l, i) => Font.center(ctx, name(l), 160, y0 + i * 12, m.fg));
    } else {
      Font.center(ctx, m.text, 160, m.sub ? 104 : 112, m.fg);
      if (m.sub) Font.center(ctx, m.sub, 160, 122, '#9a9a90');
    }
    if (m.press && m.t > 1.2 && Math.floor(t * 2) % 2) Font.draw(ctx, '▼', 300, 222, '#6a6a60');
    ctx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- fades
  function fadeTo(to, dur, color) {
    const d = deferred();
    fade = { a: R.settings.fade, from: R.settings.fade, to, t: 0, dur: Math.max(0.001, dur), res: d.resolve, color: color ? hexf(color) : [0, 0, 0] };
    R.settings.fadeColor = fade.color;
    return d;
  }
  function updFade(dt) {
    if (!fade.res && fade.a === fade.to) return;
    fade.t += dt;
    const k = clamp(fade.t / fade.dur, 0, 1);
    fade.a = lerp(fade.from, fade.to, k);
    R.settings.fade = fade.a;
    if (k >= 1 && fade.res) { const r = fade.res; fade.res = null; r(); }
  }

  // ---------------------------------------------------------------- inspect item / photo
  function inspect(id) {
    const it = typeof id === 'string' ? ITEMS[id] : id;
    if (!it) return Promise.resolve();
    Sound.sfx('paper', { vol: 0.6 });
    return push({ type: 'inspect', it, t: 0 });
  }
  function updInspect(m) {
    if (Input.pressed('a') || Input.pressed('b')) {
      Input.eat('a'); Input.eat('b');
      const wantRead = m.it.doc && Input.held('a');
      close(m);
      if (wantRead) read(m.it.doc);
    }
  }
  function drawInspect(ctx, m) {
    fill(ctx, 0, 0, W, H, 'rgba(0,0,0,0.55)');
    const it = m.it;
    const photo = it.photo ? (typeof it.photo === 'function' ? it.photo(Game.st) : it.photo) : null;
    const pr = photo ? Atlas.get(photo) : null;
    const desc = typeof it.desc === 'function' ? it.desc(Game.st) : (it.desc || '');
    const lines = wrapText(name(desc), 40);
    const imgH = pr ? pr.h * (pr.w > 70 ? 1.5 : 2) : 48;
    const h = Math.min(228, 30 + imgH + lines.length * 11 + (it.doc ? 14 : 0));
    const w = 260, x = 30, y = Math.round(120 - h / 2);
    panel(ctx, x, y, w, h);
    const nm = typeof it.name === 'function' ? it.name(Game.st) : it.name;
    Font.center(ctx, name(nm), 160, y + 7, C.hi);
    if (pr) { const s = pr.w > 70 ? 1.5 : 2; ctx.drawImage(Atlas.canvas, pr.x, pr.y, pr.w, pr.h, Math.round(160 - pr.w * s / 2), y + 20, pr.w * s, pr.h * s); }
    else icon(ctx, 'icon_' + it.icon, 160 - 24, y + 20, 3);
    lines.forEach((l, i) => Font.draw(ctx, l, x + 10, y + 24 + imgH + i * 11, C.text, { shadow: '#05060c' }));
    if (it.doc) Font.center(ctx, '(Z) READ', 160, y + h - 13, C.dim);
  }

  // ---------------------------------------------------------------- documents
  function read(docId) {
    const d = typeof docId === 'string' ? DOCS[docId] : docId;
    if (!d) return Promise.resolve();
    Sound.sfx('paper');
    const width = d.style === 'news' ? 38 : 34;
    const pages = (typeof d.pages === 'function' ? d.pages(Game.st) : d.pages).map((p) => wrapText(name(p), width));
    // split long pages
    const out = [];
    for (const p of pages) for (let i = 0; i < p.length; i += 15) out.push(p.slice(i, i + 15));
    return push({ type: 'doc', d, pages: out, page: 0 });
  }
  function updDoc(m, dt) {
    if (Input.repeat('right', dt) && m.page < m.pages.length - 1) { m.page++; Sound.sfx('paper', { vol: 0.5 }); }
    if (Input.repeat('left', dt) && m.page > 0) { m.page--; Sound.sfx('paper', { vol: 0.5 }); }
    if (Input.pressed('a')) { Input.eat('a'); if (m.page < m.pages.length - 1) { m.page++; Sound.sfx('paper', { vol: 0.5 }); } else close(m); }
    if (Input.pressed('b')) { Input.eat('b'); close(m); }
  }
  function drawDoc(ctx, m) {
    fill(ctx, 0, 0, W, H, 'rgba(0,0,0,0.6)');
    const d = m.d;
    const x = 44, y = 14, w = 232, h = 212;
    const paperC = d.paper || (d.style === 'news' ? '#e4e0d0' : d.style === 'child' ? '#f6f2e4' : '#efe9d6');
    fill(ctx, x, y, w, h, paperC); frame(ctx, x, y, w, h, '#8a7a5a');
    if (d.style === 'child' || d.style === 'hand') for (let ly = y + 30; ly < y + h - 8; ly += 12) fill(ctx, x + 4, ly + 9, w - 8, 1, 'rgba(90,120,200,0.25)');
    const ink = d.ink || (d.style === 'child' ? '#2a3a8a' : d.style === 'hand' ? '#1a2a5a' : '#2a2430');
    if (d.title) {
      const title = typeof d.title === 'function' ? d.title(Game.st) : d.title;
      Font.center(ctx, name(title), 160, y + 8, d.style === 'news' ? '#1a1a1a' : ink);
      fill(ctx, x + 8, y + 20, w - 16, 1, d.style === 'news' ? '#1a1a1a' : 'rgba(0,0,0,0.3)');
    }
    const wob = d.style === 'child' || d.style === 'hand';
    m.pages[m.page].forEach((l, i) => Font.draw(ctx, l, x + 12, y + 28 + i * 12, ink, { wobble: wob ? (i + 1) * (d.style === 'child' ? 3 : 0.3) : 0 }));
    if (m.pages.length > 1) Font.center(ctx, (m.page + 1) + '/' + m.pages.length, 160, y + h - 12, 'rgba(60,50,40,0.8)');
    if (m.page > 0) Font.draw(ctx, '←', x + 6, y + h - 12, '#6a5a4a');
    if (m.page < m.pages.length - 1) Font.draw(ctx, '→', x + w - 12, y + h - 12, '#6a5a4a');
  }

  // ---------------------------------------------------------------- keypad (locker dial etc)
  function numpad(len, o) { o = o || {}; return push({ type: 'numpad', len, digits: new Array(len).fill(0), pos: 0, title: o.title || 'ENTER CODE' }); }
  function updNumpad(m, dt) {
    if (Input.repeat('up', dt)) { m.digits[m.pos] = (m.digits[m.pos] + 1) % 10; Sound.sfx('click'); }
    if (Input.repeat('down', dt)) { m.digits[m.pos] = (m.digits[m.pos] + 9) % 10; Sound.sfx('click'); }
    if (Input.repeat('left', dt)) { m.pos = Math.max(0, m.pos - 1); Sound.sfx('move'); }
    if (Input.repeat('right', dt)) { m.pos = Math.min(m.len - 1, m.pos + 1); Sound.sfx('move'); }
    for (const ch of Input.takeTyped()) { if (/[0-9]/.test(ch)) { m.digits[m.pos] = +ch; m.pos = Math.min(m.len - 1, m.pos + 1); Sound.sfx('click'); } }
    if (Input.pressed('a')) { Input.eat('a'); close(m, m.digits.join('')); Sound.sfx('switch'); }
    if (Input.pressed('b')) { Input.eat('b'); close(m, null); Sound.sfx('cancel'); }
  }
  function drawNumpad(ctx, m) {
    fill(ctx, 0, 0, W, H, 'rgba(0,0,0,0.5)');
    const w = m.len * 22 + 40, h = 70, x = Math.round(160 - w / 2), y = 70;
    panel(ctx, x, y, w, h);
    Font.center(ctx, m.title, 160, y + 7, C.hi);
    m.digits.forEach((d, i) => {
      const dx = x + 20 + i * 22;
      panel(ctx, dx, y + 22, 18, 22, { bg: i === m.pos ? '#2a3050' : '#141830' });
      Font.draw(ctx, String(d), dx + 6, y + 29, i === m.pos ? C.hi : C.text);
      if (i === m.pos) { Font.draw(ctx, '^', dx + 6, y + 14, C.dim); Font.draw(ctx, 'v', dx + 6, y + 46, C.dim); }
    });
    Font.center(ctx, 'Z: OK   X: CANCEL', 160, y + 57, C.dim);
  }

  // ---------------------------------------------------------------- main loop hooks
  function update(dt) {
    t += dt;
    updFade(dt);
    if (flash > 0) flash -= dt;
    const m = top();
    if (!m) return;
    switch (m.type) {
      case 'dialog': updDialog(m, dt); break;
      case 'choice': updChoice(m, dt); break;
      case 'notice': updNotice(m, dt); break;
      case 'card': updCard(m, dt); break;
      case 'inspect': updInspect(m, dt); break;
      case 'doc': updDoc(m, dt); break;
      case 'numpad': updNumpad(m, dt); break;
      default: if (m.update) m.update(m, dt); break;
    }
  }
  function draw(ctx, keep, modalsOnly) {
    if (!keep) ctx.clearRect(0, 0, W, H);
    if ((Game.mode === 'play' || Game.mode === 'ending') && !modalsOnly) {
      if (Game.drawHud) Game.drawHud(ctx);
      drawBanner(ctx);
      if (subtitle) Font.center(ctx, subtitle, 160, 222, '#e8e4d8', { shadow: '#000' });
    }
    for (const m of modals) {
      switch (m.type) {
        case 'dialog': drawDialog(ctx, m); break;
        case 'choice': drawChoiceBox(ctx, m.options, m.sel, m.o.style); break;
        case 'notice': drawNotice(ctx, m); break;
        case 'card': drawCard(ctx, m); break;
        case 'inspect': drawInspect(ctx, m); break;
        case 'doc': drawDoc(ctx, m); break;
        case 'numpad': drawNumpad(ctx, m); break;
        default: if (m.draw) m.draw(ctx, m); break;
      }
    }
  }
  function clearAll() { while (modals.length) { const m = modals.pop(); if (m.resolve) m.resolve(null); } banner = null; subtitle = null; }

  return {
    dialog, choice, notice, card, banner: bannerShow, fade: fadeTo, inspect, read, numpad, update, draw, push, close, clearAll, panel, frame, fill, icon, C,
    get busy() { return modals.length > 0; }, get top() { return top(); }, modals,
    set subtitle(s) { subtitle = s; }, get fadeA() { return fade.a; }, clearBanner() { banner = null; },
  };
})();
