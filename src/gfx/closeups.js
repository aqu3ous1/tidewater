'use strict';
// ---------------------------------------------------------------------------
// Closeups — a detailed 64x48 painting of every item, for the items menu
// (1x) and for LOOK (2x). Each one has something small in it worth finding.
// Regions are 'cu_<itemId>'. Items that are photographs use their photo.
// ---------------------------------------------------------------------------

const Closeups = (() => {
  const W = 64, H = 48;
  const INK = '#1a1420';

  // a 3x5 font for fine print (labels, tags, card text)
  const MICRO = {
    A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
    G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
    M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110101101',
    S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
    Y: '101101010010010', Z: '111001010100111', 0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
    4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110',
    '.': '000000000000010', ',': '000000000010100', '-': '000000111000000', '/': '001001010100100', '#': '101111101111101', '$': '011110010011110',
    '!': '010010010000010', '?': '110001010000010', ':': '000010000010000', "'": '010010000000000', '&': '010101010101011', '%': '101001010100101',
    '+': '000010111010000', '=': '000111000111000', '(': '010100100100010', ')': '010001001001010', '*': '000101010101000', '↓': '010010010111010',
    '—': '000000111000000',
  };
  function tiny(p, str, x, y, c) {
    let cx = x;
    for (const ch of String(str).toUpperCase()) {
      const g = MICRO[ch];
      if (g) for (let i = 0; i < 15; i++) if (g[i] === '1') p.set(cx + (i % 3), y + Math.floor(i / 3), c);
      cx += 4;
    }
    return cx;
  }
  const tinyW = (s) => String(s).length * 4 - 1;
  function tinyC(p, str, cx, y, c) { tiny(p, str, Math.round(cx - tinyW(str) / 2), y, c); }

  // ---------------------------------------------------------------- finishing
  // light from the top-left: lit edges, shaded edges, then an ink outline and a soft drop shadow
  function finish(p, o) {
    o = o || {};
    const src = p.clone();
    const a = (x, y) => src.alpha(x, y) > 0;
    if (o.shade !== false) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!a(x, y)) continue;
      const c = src.get(x, y);
      if (!a(x - 1, y) || !a(x, y - 1)) p.set(x, y, shade(c, 1.14));
      else if (!a(x + 1, y) || !a(x, y + 1)) p.set(x, y, shade(c, 0.78));
    }
    if (o.outline !== false) p.outline(o.ink || INK);
    if (o.shadow !== false) {
      const s2 = p.clone();
      for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) {
        if (s2.alpha(x, y)) continue;
        if (s2.alpha(x - 2, y - 2) && s2.alpha(x - 2, y - 2) > 200) p.set(x, y, [0, 0, 0, 90]);
      }
    }
    return p;
  }
  const P = (fn, o) => { const p = new Pix(W, H); fn(p); return finish(p, o); };
  const rng = (s) => makeRng(s);

  // ---------------------------------------------------------------- helpers
  function paperSheet(p, x, y, w, h, c, o) {
    o = o || {};
    p.rect(x, y, w, h, c);
    p.speckle(rng(x * 13 + y), [shade(c, 0.96), shade(c, 1.03)], 0.25, x, y, w, h);
    if (o.lines) for (let ly = y + (o.top || 6); ly < y + h - 2; ly += o.lines) p.rect(x + 2, ly, w - 4, 1, o.lineC || '#a8b4cc');
    if (o.margin) p.rect(x + o.margin, y, 1, h, '#e8a0a0');
    if (o.fold) { p.rect(x, y + Math.floor(h / 2), w, 1, shade(c, 0.9)); p.rect(x, y + Math.floor(h / 2) + 1, w, 1, shade(c, 1.04)); }
    if (o.dogear) { p.tri(x + w - 6, y, x + w, y, x + w, y + 6, [0, 0, 0, 0]); p.tri(x + w - 6, y, x + w - 6, y + 6, x + w, y + 6, shade(c, 0.85)); }
  }
  function scribble(p, x, y, w, rows, c, seed, gap) {
    const r = rng(seed);
    for (let j = 0; j < rows; j++) { let cx = x; const ww = w - r.int(Math.max(1, w / 3)); while (cx < x + ww) { const seg = 2 + r.int(4); p.rect(cx, y + j * (gap || 3), Math.min(seg, x + ww - cx), 1, c); cx += seg + 1; } }
  }
  function key(p, x, y, c, o) {
    o = o || {};
    const d = shade(c, 0.72), l = shade(c, 1.25);
    // bow
    if (o.ornate) { p.ellipse(x + 8, y + 8, 8, 8, c); p.ellipse(x + 8, y + 8, 3, 3, [0, 0, 0, 0]); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.78; p.ellipse(x + 8 + Math.cos(a) * 6.5, y + 8 + Math.sin(a) * 6.5, 2.2, 2.2, c); } p.ring(x + 8, y + 8, 5.5, 5.5, d); }
    else { p.ellipse(x + 8, y + 8, 8, 7.5, c); p.ellipse(x + 8, y + 8, 2.8, 2.8, [0, 0, 0, 0]); p.ring(x + 8, y + 8, 6, 5.5, d); }
    p.set(x + 4, y + 4, l); p.set(x + 5, y + 3, l); p.set(x + 3, y + 5, l);
    // shaft + teeth
    const L = o.long || 26;
    p.rect(x + 15, y + 6, L, 4, c); p.rect(x + 15, y + 9, L, 1, d); p.rect(x + 16, y + 6, L - 2, 1, l);
    const teeth = o.teeth || [3, 1, 2, 3, 1];
    teeth.forEach((t, i) => p.rect(x + 15 + L - 4 - i * 4, y + 10, 3, t + 2, c));
    p.rect(x + 15 + L, y + 6, 1, 4, d);
    if (o.collar) p.rect(x + 15, y + 5, 3, 6, d);
  }
  function tag(p, x, y, text, c, o) {
    o = o || {};
    const w = o.w || Math.max(14, tinyW(text) + 6), h = 9;
    p.line(x - 4, y + 4, x, y + 4, '#9a8a6a');
    p.rect(x, y, w, h, c || '#f0e6c8'); p.tri(x - 1, y + 4, x + 3, y, x + 3, y + 8, c || '#f0e6c8');
    p.ellipse(x + 2, y + 4, 1, 1, '#8a7a5a');
    tiny(p, text, x + 5, y + 2, o.ink || '#3a3440');
    if (o.faded) p.speckle(rng(7), [c || '#f0e6c8'], 0.35, x + 4, y + 1, w - 5, h - 2);
  }
  function cassette(p, label, labelC) {
    p.rect(6, 8, 52, 33, '#2e2e34'); p.rect(7, 9, 50, 1, '#4a4a52');
    p.rect(10, 11, 44, 16, labelC || '#f4f0dc'); p.rect(10, 11, 44, 3, '#c83a3a'); p.rect(10, 14, 44, 1, '#3a6ab8');
    const [l1, l2] = label.split('|'); tiny(p, l1, 12, 15, '#2a3a8a'); if (l2) tiny(p, l2, 12, 21, '#2a3a8a');
    p.rect(18, 29, 28, 8, '#1a1a1e'); p.rect(20, 30, 24, 6, '#8a6a4a'); p.ellipse(24, 33, 2.5, 2.5, '#e8e8e0'); p.ellipse(40, 33, 2.5, 2.5, '#e8e8e0');
    p.ellipse(24, 33, 1, 1, '#2e2e34'); p.ellipse(40, 33, 1, 1, '#2e2e34');
    for (const sx of [9, 53]) p.ellipse(sx, 38, 1, 1, '#6a6a70');
    p.rect(26, 39, 12, 2, '#4a4a52');
  }
  function newspaper(p, date, headline, sub, photo, seed) {
    paperSheet(p, 4, 4, 56, 40, '#e8e2d0', { fold: false });
    p.rect(4, 4, 56, 40, [0, 0, 0, 0]); paperSheet(p, 4, 4, 56, 40, seed === 3 ? '#e0d4a8' : '#e8e2d0');
    tinyC(p, 'THE BEACON', 32, 6, '#1a1a1a'); p.rect(6, 12, 52, 1, '#1a1a1a'); tiny(p, date, 6, 14, '#4a4a4a'); tiny(p, '25C', 47, 14, '#4a4a4a');
    p.rect(6, 20, 52, 1, '#6a6a6a');
    headline.forEach((h, i) => tiny(p, h, 6, 22 + i * 6, '#1a1a1a'));
    const hy = 22 + headline.length * 6;
    if (photo) { p.rect(36, hy, 22, 14, '#8a8a88'); photo(p, 36, hy); p.frame(36, hy, 22, 14, '#4a4a4a'); }
    scribble(p, 6, hy + 1, photo ? 28 : 50, 5, '#8a8a88', seed, 3);
    if (sub) tiny(p, sub, 6, hy - 0, '#4a4a4a');
    if (seed === 3) p.speckle(rng(33), ['#c8b888', '#d4c498'], 0.08, 4, 4, 56, 40);
  }
  function fishCard(p, n, name, border, bg, fish, stats, o) {
    o = o || {};
    p.rect(8, 1, 48, 46, border); p.rect(10, 3, 44, 42, '#f4f2ea');
    tiny(p, '#' + n, 12, 5, '#3a3440'); tiny(p, 'OF 12', 33, 5, shade(border, 0.7));
    p.rect(11, 11, 42, 20, bg);
    for (let y = 11; y < 31; y++) if (y % 3 === 0) p.rect(11, y, 42, 1, shade(bg, 1.06));
    fish(p, 32, 21);
    p.frame(11, 11, 42, 20, shade(border, 0.7));
    p.rect(10, 32, 44, 7, border);
    tinyC(p, name, 32, 33, '#f8f6ee');
    for (let i = 0; i < 5; i++) { const on = i < (stats || 3); p.rect(21 + i * 5, 40, 3, 3, on ? '#e8c040' : '#c8c4b8'); if (on) p.set(22 + i * 5, 40, '#f8e8a0'); }
    if (o.holo) for (let i = 0; i < 16; i++) p.set(12 + i * 2.5, 12 + (i * 7) % 18, [255, 255, 255, 120]);
  }
  function shellSpiral(p, cx, cy, c) {
    p.ellipse(cx, cy, 16, 11, c);
    for (let i = 0; i < 4; i++) p.ring(cx - 4 + i, cy - 1, 11 - i * 2.6, 8 - i * 1.8, shade(c, 0.78));
    p.tri(cx + 12, cy - 4, cx + 22, cy - 2, cx + 13, cy + 5, c); p.line(cx + 13, cy - 3, cx + 21, cy - 2, shade(c, 1.25));
    p.ellipse(cx - 8, cy - 5, 3, 1.5, shade(c, 1.3));
  }

  // ---------------------------------------------------------------- the paintings
  const ART = {
    // ---- everyday
    key_house: (st) => P((p) => { key(p, 3, 8, '#d8b848', { long: 30, teeth: [3, 1, 3, 2, 1, 2] }); tag(p, 12, 32, 'VANE', '#efe4c4', { faded: !lateOf(st), w: 26 }); }),
    milk: () => P((p) => {
      p.rect(18, 12, 26, 33, '#f8f8f4'); p.tri(18, 12, 44, 12, 31, 3, '#ececE6'); p.rect(28, 1, 6, 3, '#f0f0ea');
      p.rect(18, 16, 26, 6, '#3a6ab8'); tinyC(p, 'MILK', 31, 17, '#f8f8f4');
      p.rect(44, 14, 10, 31, '#e4e4de'); p.tri(44, 12, 54, 14, 44, 3, '#d8d8d2');
      // the side panel
      p.rect(45, 17, 8, 22, '#f4f4f0'); tiny(p, 'HAVE', 45, 18, '#c83a3a'); p.rect(46, 25, 6, 7, '#b8b0a0'); p.ellipse(49, 27, 1.6, 1.6, '#e8c8a8'); p.rect(47, 29, 4, 2, '#3a6ab8');
      tiny(p, 'SEEN', 45, 33, '#c83a3a');
      tiny(p, 'WHOLE', 21, 26, '#3a6ab8'); tiny(p, 'VIT D', 21, 32, '#6a6a6a'); tiny(p, '1/2 GAL', 19, 38, '#6a6a6a');
      p.ellipse(24, 7, 3, 2, [220, 230, 240, 160]);
    }),
    trash: () => P((p) => { p.ellipse(32, 30, 20, 15, '#2a2a30'); p.ellipse(32, 30, 14, 10, '#34343a'); p.rect(28, 8, 8, 10, '#2a2a30'); p.rect(27, 10, 10, 2, '#e8c040'); p.line(24, 20, 30, 38, '#46464e'); p.line(40, 22, 36, 40, '#46464e'); p.ellipse(26, 24, 3, 2, '#50505a'); p.rect(40, 32, 6, 4, '#c8b890'); }),
    fish_bucket: () => P((p) => {
      p.tri(12, 14, 52, 14, 46, 44, '#9aa0a8'); p.tri(12, 14, 18, 44, 46, 44, '#9aa0a8');
      p.ellipse(32, 14, 20, 5, '#d8e8f0'); for (let i = 0; i < 6; i++) p.ellipse(18 + i * 5.5, 12 + (i % 2) * 2, 3.5, 1.4, '#b8c8d0');
      for (let i = 0; i < 4; i++) { p.ellipse(22 + i * 6, 11 - (i % 2), 4, 1.4, '#8aa0b0'); p.set(19 + i * 6, 11 - (i % 2), '#2a2a2a'); }
      p.rect(12, 24, 40, 2, '#8a9098'); p.rect(14, 34, 36, 2, '#8a9098');
      for (let a = Math.PI; a <= Math.PI * 2; a += 0.02) p.set(Math.round(32 + Math.cos(a) * 21), Math.round(14 + Math.sin(a) * 12), '#6a6a70');
      tiny(p, 'SMELT', 24, 28, '#3a3a40');
    }, { shadow: true }),
    filter: () => P((p) => {
      p.rect(14, 8, 36, 36, '#e8e4d8'); p.rect(14, 8, 36, 8, '#3a8aa8'); tinyC(p, 'FILTER', 32, 10, '#f4f4ee');
      p.rect(20, 20, 24, 18, '#f4f4ee'); for (let y = 21; y < 37; y += 2) p.rect(21, y, 22, 1, '#c8d0d8');
      tinyC(p, 'TANK 3', 32, 39, '#c83a3a'); p.rect(50, 10, 6, 34, '#d8d4c8'); p.tri(50, 8, 56, 10, 50, 10, '#d0ccc0');
    }),
    umbrella: () => P((p) => {
      p.ellipse(28, 20, 22, 12, '#8a5ab8'); p.rect(0, 20, 64, 20, [0, 0, 0, 0]);
      for (let i = 0; i < 5; i++) p.line(28, 8, 8 + i * 10, 20, '#6a3a98');
      for (let i = 0; i < 5; i++) p.tri(6 + i * 10, 20, 16 + i * 10, 20, 11 + i * 10, 22, i % 2 ? '#8a5ab8' : '#7a4aa8');
      p.rect(27, 20, 2, 18, '#5a3a2a');
      // the duck handle
      p.ellipse(33, 40, 6, 4, '#c8943a'); p.ellipse(38, 36, 3, 3, '#c8943a'); p.tri(40, 36, 44, 37, 40, 38, '#e8743a'); p.set(38, 35, '#1a1420');
    }),
    cookie: () => P((p) => {
      p.ellipse(32, 26, 20, 16, '#c8944a'); p.ellipse(32, 26, 18, 14, '#d4a458');
      const r = rng(4); for (let i = 0; i < 26; i++) p.set(16 + r.int(32), 14 + r.int(24), r.pick(['#a8783a', '#e4bc78', '#b8884a']));
      for (const [x, y] of [[24, 20], [38, 24], [28, 32], [42, 32], [33, 18]]) { p.ellipse(x, y, 1.6, 1.2, '#5a3020'); }
      p.tri(46, 14, 54, 20, 46, 22, [0, 0, 0, 0]); p.set(47, 21, '#b8884a');
    }),
    lettuce: () => P((p) => {
      for (let i = 0; i < 5; i++) { p.ellipse(22 + i * 5, 26 - (i % 2) * 3, 8, 15 - i, i % 2 ? '#6ab04a' : '#7ac058'); p.line(22 + i * 5, 12, 22 + i * 5, 40, '#c8e8a8'); }
      p.rect(18, 40, 30, 4, '#d8ecc0');
      p.set(36, 20, '#3a2a1a'); p.set(37, 20, '#3a2a1a');
    }),
    tuna: () => P((p) => {
      p.rect(8, 12, 48, 28, '#f4f0e0'); p.line(8, 12, 56, 40, '#e0dccc'); p.line(56, 12, 8, 40, '#e0dccc');
      p.rect(8, 22, 48, 8, '#e8c070'); p.rect(8, 22, 48, 2, '#d8a850'); p.rect(8, 28, 48, 2, '#f0d890');
      p.ellipse(32, 26, 9, 6, '#f4e8c8'); p.ellipse(32, 26, 7, 4.5, '#c83a3a'); tinyC(p, "HAL'S", 32, 24, '#f8f6ee');
      p.speckle(rng(9), [[255, 255, 255, 90]], 0.05, 8, 12, 48, 28);
    }),
    sandwich: () => P((p) => {
      p.rect(6, 14, 52, 28, '#f0ece0'); p.speckle(rng(8), [[255, 255, 255, 110], '#e4e0d0'], 0.08, 6, 14, 52, 28);
      p.tri(12, 38, 52, 38, 32, 16, '#f4e8c8'); p.line(12, 38, 32, 16, '#d8b880'); p.line(52, 38, 32, 16, '#d8b880');
      p.line(14, 35, 50, 35, '#8a5a4a'); p.line(15, 34, 49, 34, '#9a6a52'); p.line(16, 33, 48, 33, '#6ab04a');
      p.line(18, 32, 46, 32, '#c89a7a');
      // a single orange hair on the wax paper
      p.line(44, 18, 50, 21, '#e89a4a'); p.set(51, 22, '#e89a4a');
    }),
    brochures: () => P((p) => {
      for (let i = 3; i >= 0; i--) { p.rect(10 + i * 3, 6 + i * 2, 34, 34, i ? shade('#2a58b8', 0.85 + i * 0.03) : '#2a58b8'); }
      p.rect(12, 10, 30, 6, '#f4e070'); tinyC(p, 'COME SEE', 27, 11, '#2a58b8');
      p.ellipse(27, 28, 9, 6, '#e8743a'); p.tri(35, 28, 40, 23, 40, 33, '#e8743a'); p.set(22, 27, '#1a1420'); p.rect(20, 36, 16, 1, '#8ab0e8');
      p.rect(30, 6, 1, 34, '#1a3a8a');
    }),
    bulbs: () => P((p) => {
      p.rect(8, 22, 48, 22, '#e8c070'); tinyC(p, '60 WATT', 32, 36, '#6a4a2a'); p.rect(8, 22, 48, 3, '#d8a850');
      for (let i = 0; i < 3; i++) { const x = 18 + i * 14; p.ellipse(x, 14, 6, 7, '#f8f4d8'); p.ellipse(x - 2, 11, 2, 3, '#ffffff'); p.rect(x - 3, 20, 7, 5, '#a8a8a8'); for (let y = 21; y < 25; y += 2) p.rect(x - 3, y, 7, 1, '#8a8a8a'); p.line(x - 1, 13, x + 1, 15, '#c8a860'); }
    }),
    notebook: () => P((p) => {
      p.rect(14, 4, 38, 40, '#3a6ab8'); p.speckle(rng(12), ['#3462a8', '#4274c0'], 0.2, 14, 4, 38, 40);
      for (let y = 6; y < 44; y += 3) { p.ring(14, y, 2, 1.2, '#c8c8c8'); }
      p.rect(20, 10, 30, 9, '#f4f0dc'); p.frame(20, 10, 30, 9, '#2a4a8a'); tinyC(p, 'EVAN V.', 35, 12, '#1a1a1a');
      p.line(24, 30, 32, 26, '#e8e8e0'); p.line(32, 26, 30, 34, '#e8e8e0'); p.ellipse(40, 32, 3, 2, '#e8743a');
      p.rect(50, 4, 2, 40, '#2a5098');
    }),
    garage_key: () => P((p) => { key(p, 3, 8, '#a8a8b0', { long: 32, teeth: [2, 3, 1, 3, 2, 1] }); tag(p, 12, 32, 'W.V. CAR', '#e8a040'); }),
    kessler_key: () => P((p) => { key(p, 8, 8, '#c8a040', { long: 22, teeth: [2, 1, 2, 3] }); tag(p, 14, 32, 'KESSLER', '#f4f0e8'); }),
    room_key: () => P((p) => {
      key(p, 6, 14, '#d8a838', { long: 26, teeth: [3, 1, 2], ornate: true });
      for (const [x, y] of [[4, 8], [40, 10], [52, 30], [22, 36], [58, 16]]) { p.set(x, y, '#fff4c8'); p.set(x - 1, y, '#f8d890'); p.set(x + 1, y, '#f8d890'); p.set(x, y - 1, '#f8d890'); p.set(x, y + 1, '#f8d890'); }
    }),
    key_t6: () => P((p) => { key(p, 3, 8, '#8a8a88', { long: 30, teeth: [3, 3, 1, 3], collar: true }); p.speckle(rng(66), ['#7a6a4a', '#6a5a3a'], 0.3, 20, 14, 26, 6); tag(p, 12, 32, 'T6 ↓', '#f4f0dc', { w: 24, ink: '#c83a3a' }); }),
    backpack: () => P((p) => {
      p.ellipse(32, 26, 18, 20, '#3a7ad0'); p.rect(14, 26, 36, 18, '#3a7ad0');
      p.rect(18, 26, 28, 14, '#346ec0'); p.rect(18, 26, 28, 2, '#2a5aa8'); p.rect(30, 28, 4, 2, '#c8c8c8');
      p.line(28, 6, 26, 2, '#2a5aa8'); p.line(36, 6, 38, 2, '#2a5aa8'); p.rect(26, 1, 12, 2, '#2a5aa8');
      // keychain: a little plastic fish
      p.line(40, 28, 44, 34, '#c8c8c8'); p.ellipse(46, 37, 3, 2, '#e8743a'); p.tri(49, 37, 52, 35, 52, 39, '#e8743a'); p.set(45, 36, '#1a1420');
      // name tag, carefully written
      p.rect(20, 10, 12, 6, '#f4f0dc'); tiny(p, 'EV', 22, 11, '#2a2a2a');
    }),
    tape12: () => P((p) => { cassette(p, 'RADIO EVAN|#12  8/14'); p.line(46, 21, 52, 16, '#c83a3a'); }),
    radio3: () => P((p) => cassette(p, 'RADIO EVAN|#3', '#f0e8c8')),
    inhaler: () => P((p) => {
      p.rect(22, 4, 14, 26, '#3a8ad0'); p.rect(24, 6, 3, 22, '#5aa0e0'); p.ellipse(29, 4, 7, 2, '#3a8ad0');
      p.rect(18, 28, 26, 12, '#e8e8e8'); p.rect(40, 30, 12, 8, '#e8e8e8'); p.rect(50, 31, 2, 6, '#c8c8c8');
      p.rect(4, 14, 18, 18, '#f4f4ec'); p.rect(4, 14, 18, 3, '#c83a3a'); tiny(p, 'RX', 6, 18, '#1a1a1a'); tiny(p, 'VANE', 5, 24, '#1a1a1a'); p.rect(5, 30, 14, 1, '#8a8a8a');
    }),
    bday_card: () => P((p) => {
      p.rect(6, 10, 52, 32, '#f0e4c8'); p.tri(6, 10, 58, 10, 32, 28, '#e4d6b4'); p.line(6, 10, 32, 28, '#c8b890'); p.line(58, 10, 32, 28, '#c8b890');
      tinyC(p, 'EVAN VANE', 30, 30, '#2a2a4a'); tinyC(p, '12 MAPLE ST', 30, 36, '#2a2a4a');
      p.rect(46, 13, 9, 10, '#e8c0d0'); p.frame(46, 13, 9, 10, '#c83a3a'); p.set(50, 17, '#3a6ab8');
      p.line(40, 13, 44, 20, '#6a6a7a');
    }),

    // ---- evidence
    feeding_log: () => P((p) => {
      p.rect(8, 4, 44, 40, '#3a7a4a'); p.rect(8, 4, 6, 40, '#2e6a3e'); for (let y = 8; y < 42; y += 11) { p.rect(9, y, 4, 3, '#c8c8c8'); }
      p.rect(18, 10, 32, 13, '#f4f0dc'); tinyC(p, 'FEEDING', 34, 12, '#1a1a1a'); tinyC(p, 'LOG 1991', 34, 17, '#1a1a1a');
      p.rect(52, 6, 4, 36, '#f4f0dc'); for (let y = 8; y < 42; y += 3) p.set(53, y, '#a8b4cc');
      p.ellipse(34, 34, 6, 3, '#6a9a6a'); p.speckle(rng(21), ['#2e6a3e'], 0.1, 14, 4, 38, 40);
    }),
    work_order: () => P((p) => {
      paperSheet(p, 10, 3, 42, 42, '#f4e070');
      tiny(p, 'WORK ORDER', 13, 6, '#1a1a1a'); tiny(p, '0419', 13, 12, '#c83a3a'); p.rect(12, 18, 38, 1, '#8a7a3a');
      tiny(p, 'PUMP RM', 13, 21, '#3a3a3a'); scribble(p, 13, 28, 34, 3, '#2a3a6a', 419, 3);
      p.ellipse(42, 38, 6, 4, '#c83a3a'); p.ring(42, 38, 6, 4, '#a82a2a'); tiny(p, 'OK', 39, 36, '#f4e070');
      p.rect(28, 1, 10, 4, '#9aa0a8');
    }),
    phone_bill: () => P((p) => {
      paperSheet(p, 6, 8, 52, 34, '#f4f4ee');
      tiny(p, 'TELCO', 9, 11, '#1a3a8a'); tiny(p, 'AUG 91', 34, 11, '#3a3a3a'); p.rect(8, 17, 48, 1, '#8a8a8a');
      for (let i = 0; i < 5; i++) { tiny(p, '8/' + (10 + i), 9, 20 + i * 4, '#4a4a4a'); p.rect(28, 21 + i * 4, 16, 1, '#8a8a8a'); }
      p.rect(8, 27, 48, 4, [232, 216, 96, 150]); tiny(p, '8/14', 9, 28, '#1a1a1a');
      p.ring(49, 30, 6, 3, '#c83a3a');
    }),
    concrete: () => P((p) => {
      paperSheet(p, 8, 6, 48, 36, '#f4d8d8');
      tiny(p, 'HARBOR', 11, 9, '#8a2a2a'); tiny(p, 'CONCRETE', 11, 15, '#8a2a2a'); tiny(p, '5512', 39, 9, '#4a4a4a');
      p.rect(10, 21, 44, 1, '#b08a8a');
      tiny(p, '2 BAGS', 11, 24, '#3a3a6a'); tiny(p, 'CASH', 11, 30, '#3a3a6a'); tiny(p, '8/15', 38, 24, '#3a3a6a');
      scribble(p, 34, 34, 18, 1, '#2a2a5a', 55, 3);
      p.speckle(rng(55), ['#e8c8c8'], 0.1, 8, 6, 48, 36);
    }),
    report: () => P((p) => {
      paperSheet(p, 8, 4, 48, 40, '#ececE4', { fold: true });
      p.rect(31, 4, 1, 40, '#d4d4cc');
      p.ellipse(15, 10, 4, 4, '#b89a3a'); p.set(15, 8, '#f4e8a0'); tiny(p, 'SHERIFF', 21, 7, '#1a1a1a'); tiny(p, 'MISSING', 21, 13, '#1a1a1a');
      p.rect(11, 18, 12, 14, '#9a9a98'); p.ellipse(17, 23, 3, 3, '#c8c8c4'); p.rect(14, 27, 6, 5, '#b8b8b4');
      scribble(p, 26, 20, 26, 6, '#6a6a6a', 91, 3);
      tiny(p, 'VANE E', 11, 36, '#1a1a1a');
    }),
    toby_letter: () => P((p) => {
      p.tri(10, 38, 54, 38, 32, 8, '#f4f0dc'); p.line(10, 38, 54, 38, '#b8b098'); p.line(21, 23, 43, 23, '#dcd6c0'); p.line(32, 8, 32, 38, '#e4dec8');
      for (let y = 26; y < 37; y += 3) p.rect(18 + (37 - y) / 2, y, 28 - (37 - y), 1, '#a8b4cc');
      tiny(p, 'TOBY', 26, 28, '#2a3a8a'); tiny(p, 'TOP SECRET', 14, 40, '#c83a3a');
    }),
    tooth: () => P((p) => {
      p.ellipse(32, 30, 22, 12, '#5a2a3a'); for (let i = 0; i < 5; i++) p.line(12 + i * 9, 22, 16 + i * 9, 40, '#4a2230'); p.speckle(rng(44), ['#6a3444'], 0.12, 10, 18, 44, 24);
      p.ellipse(32, 24, 6, 5, '#f8f6ec'); p.rect(27, 26, 4, 8, '#f8f6ec'); p.rect(33, 26, 4, 7, '#f8f6ec'); p.set(30, 21, '#ffffff'); p.set(31, 20, '#ffffff');
      p.set(35, 22, '#d8d0b8'); p.set(36, 23, '#c8c0a8');
    }, { shadow: true }),
    fabric: () => P((p) => {
      p.tri(8, 10, 56, 14, 22, 44, '#ecece4'); p.tri(56, 14, 22, 44, 50, 40, '#ecece4');
      p.map((c, x, y) => (Math.floor((y - x * 0.06) / 2.5) % 2 === 0 && (y % 5) < 2 ? [58, 106, 184, 255] : null));
      p.map((c, x, y) => (x > 30 && y > 26 && (x + y * 2) % 3 ? [138, 72, 60, 255] : null));
      p.speckle(rng(3), ['#9a5a4a', '#7a3a2a'], 0.08, 28, 24, 30, 20);
      for (let x = 10; x < 54; x += 3) p.set(x, 11 + Math.floor((x - 8) / 12), [0, 0, 0, 0]);
    }),
    shoe: () => P((p) => {
      p.rect(8, 24, 46, 12, '#d83a32'); p.ellipse(50, 30, 8, 6, '#d83a32'); p.rect(10, 12, 22, 14, '#d83a32'); p.ellipse(22, 14, 12, 5, '#d83a32');
      p.rect(6, 36, 52, 5, '#f4f4f0'); p.rect(6, 40, 52, 2, '#c8c8c0'); for (let x = 8; x < 56; x += 4) p.set(x, 41, '#9a9a90');
      p.rect(24, 18, 16, 4, '#f4f4f0'); p.rect(24, 22, 16, 3, '#f4f4f0'); p.rect(38, 18, 3, 7, '#c8c8c0');
      p.rect(13, 10, 8, 6, '#f4f4f0'); tiny(p, 'E', 15, 11, '#2a2a4a');
      p.speckle(rng(81), ['#7a5a3a', '#8a6a4a', '#5a4a3a'], 0.12, 6, 30, 52, 12);
    }),

    // ---- secret
    collar: () => P((p) => {
      p.ring(30, 22, 18, 14, '#c83a2a'); p.ring(30, 22, 17, 13, '#c83a2a'); p.ring(30, 22, 16, 12, '#a82a1a');
      p.rect(10, 20, 6, 5, '#c8c8c0'); p.rect(11, 21, 4, 3, '#a8a8a0');
      p.ellipse(30, 38, 5, 5, '#e8c040'); p.rect(26, 38, 9, 1, '#a8841a'); p.set(29, 36, '#f8e8a0'); p.set(30, 41, '#6a5010');
      p.ellipse(44, 36, 5, 4, '#d8d8d0'); tiny(p, 'MA', 41, 35, '#4a4a4a');
    }),
    recipe: () => P((p) => {
      paperSheet(p, 6, 8, 52, 34, '#f8f6ee', { lines: 4, top: 12, lineC: '#a8c0e0' }); p.rect(6, 11, 52, 1, '#e88a8a');
      tiny(p, 'STEW', 9, 9, '#3a3a6a'); scribble(p, 9, 14, 40, 6, '#3a3a6a', 77, 4);
      p.ellipse(50, 10, 5, 5, '#c83a3a'); p.set(48, 8, '#f8a0a0');
      p.ellipse(20, 34, 5, 3, [180, 140, 90, 110]);
    }),
    vet: () => P((p) => {
      p.rect(10, 2, 44, 44, '#8a6a44'); p.rect(26, 1, 12, 5, '#c8c8c8');
      paperSheet(p, 13, 7, 38, 36, '#f4f4ee'); tiny(p, 'BELLWOOD', 16, 9, '#2a5a8a'); tiny(p, 'ANIMAL CL.', 16, 15, '#2a5a8a');
      tiny(p, 'MARM', 16, 22, '#1a1a1a'); tiny(p, 'CAT 14Y', 16, 28, '#1a1a1a');
      for (const [x, y] of [[42, 30], [39, 27], [42, 26], [45, 27]]) p.ellipse(x, y, 1.4, 1.4, '#6a8aa8');
      p.ellipse(42, 32, 2.5, 2, '#6a8aa8');
    }),
    burned_photo: () => P((p) => {
      p.rect(12, 6, 40, 36, '#e8e0c8');
      p.rect(16, 10, 32, 26, '#8aa0b0'); p.rect(16, 28, 32, 8, '#7a8a5a'); p.ellipse(30, 30, 5, 3, '#e8943a'); p.ellipse(26, 32, 3, 2, '#f0c8a0');
      const r = rng(5); p.map((c, x, y) => { const d = Math.min(x - 12, 52 - x, y - 6, 42 - y) + r.int(4); if (x < 26 || y < 18) { if (d + (x < 26 ? 26 - x : 0) * 0.4 + (y < 18 ? 18 - y : 0) * 0.5 > 8) return [30, 22, 18, 255]; } return d < 2 ? [60, 40, 26, 255] : null; });
      p.map((c, x, y) => (c[0] === 30 && c[1] === 22 && (x + y) % 5 ? [0, 0, 0, 0] : null));
    }),
    toby_diary: () => P((p) => {
      p.rect(14, 6, 36, 36, '#8a3a4a'); p.rect(14, 6, 5, 36, '#6a2a3a'); p.speckle(rng(30), ['#7a3444', '#9a4a5a'], 0.2, 14, 6, 36, 36);
      p.rect(46, 20, 8, 10, '#d8b848'); p.ellipse(50, 24, 1, 1.5, '#2a2a2a'); p.rect(48, 14, 2, 6, '#b89830'); p.line(50, 14, 54, 11, '#b89830');
      tiny(p, 'DIARY', 24, 12, '#e8c870'); tiny(p, 'KEEP OUT', 20, 32, '#f4f0dc');
    }),

    // ---- aquarium collection
    badge: (st) => P((p) => {
      p.rect(8, 6, 48, 36, '#f4f4f0'); p.rect(8, 6, 48, 9, '#2a58b8'); tinyC(p, 'AQUARIUM', 32, 8, '#f4f4f0');
      p.rect(12, 18, 14, 16, '#9ac4e8'); p.ellipse(19, 26, 6, 6, '#d9b85a'); p.ellipse(19, 26, 3.5, 3.5, '#9ad0e8'); p.rect(14, 31, 10, 3, '#3b62b5');
      tiny(p, 'STAFF', 30, 19, '#c83a3a'); p.rect(30, 30, 22, 1, '#8a8a8a');
      const nm = String((st && st.name) || '').toUpperCase().slice(0, 6); if (nm) tiny(p, nm, 30, 25, '#1a1a1a');
      p.rect(28, 1, 8, 6, '#c8c8c8'); p.rect(30, 3, 4, 2, '#8a8a8a');
      p.rect(8, 38, 48, 4, '#e8e4d8');
      p.speckle(rng(2), [[255, 255, 255, 120]], 0.04, 8, 6, 48, 36);
    }),
    ticket: () => P((p) => {
      p.rect(4, 12, 56, 24, '#e8c040'); for (let y = 12; y < 36; y += 2) p.set(46, y, [0, 0, 0, 0]);
      tiny(p, 'ADMIT ONE', 7, 15, '#6a3a1a'); tiny(p, 'OPENING', 7, 22, '#6a3a1a'); tiny(p, '6-12-76', 7, 28, '#8a2a1a'); tiny(p, '50C', 39, 28, '#8a2a1a');
      p.ellipse(53, 24, 4, 3, '#e8743a'); p.tri(49, 24, 46, 21, 46, 27, '#e8743a'); p.set(54, 23, '#1a1420');
      tiny(p, '0001', 48, 31, '#6a3a1a'); p.rect(4, 12, 56, 1, '#f4d870');
    }),
    brochure_old: () => P((p) => {
      p.rect(6, 6, 18, 36, '#d8c890'); p.rect(24, 6, 18, 36, '#e4d4a0'); p.rect(42, 6, 16, 36, '#d0c088');
      p.rect(8, 10, 14, 10, '#6a90a8'); p.ellipse(15, 15, 4, 2, '#e8c870'); tiny(p, 'VISIT', 26, 10, '#5a4a2a'); scribble(p, 26, 17, 14, 6, '#8a7a5a', 71, 3);
      p.ellipse(50, 19, 4, 6, '#2a2a2a'); p.ellipse(50, 21, 2.5, 4, '#f4f4f0'); p.set(51, 15, '#e8a040');
      p.rect(8, 30, 14, 8, '#8aa870'); tiny(p, 'THE', 44, 33, '#5a4a2a'); tiny(p, 'DEEP', 43, 38, '#5a4a2a');
      p.speckle(rng(71), ['#c8b880', '#b8a870'], 0.08, 6, 6, 52, 36);
    }),
    mitten: () => P((p) => {
      p.ellipse(32, 22, 14, 16, '#c83a3a'); p.ellipse(18, 26, 5, 8, '#c83a3a'); p.rect(20, 34, 24, 10, '#f4f4f0');
      for (let y = 36; y < 44; y += 2) for (let x = 20; x < 44; x += 2) p.set(x + (y % 4 ? 1 : 0), y, '#dcdcd4');
      for (let y = 10; y < 34; y += 3) for (let x = 20; x < 44; x += 3) p.set(x + ((y / 3) % 2), y, '#b02a2a');
      p.rect(34, 38, 10, 5, '#f4f0dc'); tiny(p, 'EV', 35, 38, '#2a2a4a');
      p.ellipse(32, 6, 4, 3, '#f4f4f0');
    }),
    sunglasses: () => P((p) => {
      p.ellipse(18, 24, 13, 10, '#1a1a1e'); p.ellipse(46, 24, 13, 10, '#1a1a1e'); p.rect(28, 18, 8, 3, '#e8743a');
      p.rect(2, 18, 6, 3, '#e8743a'); p.rect(56, 18, 6, 3, '#e8743a');
      p.ellipse(18, 24, 11, 8, '#2a3a4a'); p.ellipse(46, 24, 11, 8, '#2a3a4a');
      p.line(12, 20, 16, 18, '#6a8aa8'); p.line(40, 20, 44, 18, '#6a8aa8');
      // in the left lens, very small: a figure standing in a doorway
      p.rect(20, 25, 5, 7, '#4a6a8a'); p.rect(22, 27, 1, 3, '#0a0a10'); p.set(22, 26, '#0a0a10');
      p.rect(38, 26, 14, 7, '#f4f4ee'); tiny(p, '4.99', 39, 27, '#c83a3a');
    }),
    memo: () => P((p) => {
      p.rect(6, 8, 52, 36, '#d8b870'); p.rect(6, 6, 18, 4, '#d8b870'); p.rect(8, 12, 48, 30, '#c8a860');
      paperSheet(p, 12, 14, 42, 26, '#f4f4ee'); tiny(p, 'MEMO', 15, 16, '#1a1a1a'); tiny(p, 'THE DEEP', 15, 22, '#1a1a1a'); scribble(p, 15, 28, 34, 3, '#6a6a6a', 13, 3);
      p.rect(8, 9, 14, 1, '#b89850'); tiny(p, 'CONF.', 10, 3, '#c83a3a');
      p.ring(49, 13, 2, 4, '#b8b8c0');
    }),
    fossil: () => P((p) => {
      paperSheet(p, 8, 30, 48, 14, '#f4f0dc'); tinyC(p, '10 MIL YRS', 32, 36, '#5a4a2a');
      p.tri(20, 30, 44, 30, 32, 4, '#c8b890'); p.tri(22, 30, 42, 30, 32, 8, '#d8c8a0'); p.line(32, 8, 32, 28, '#a89870');
      p.rect(20, 28, 24, 4, '#8a7a5a'); p.set(28, 14, '#f0e8c8'); p.set(29, 12, '#f0e8c8'); p.speckle(rng(10), ['#b8a880'], 0.2, 22, 10, 20, 18);
    }),

    // ---- neighborhood collection
    news1: () => P((p) => newspaper(p, 'AUG 10', ['AQUARIUM TO', 'CELEBRATE 25'], null, (q, x, y) => { q.ellipse(x + 11, y + 7, 6, 4, '#aaaaaa'); q.ellipse(x + 11, y + 6, 3, 2, '#cacaca'); }, 1)),
    news2: () => P((p) => newspaper(p, 'AUG 13', ['TEN YEARS', 'NO WORD'], null, (q, x, y) => { q.ellipse(x + 11, y + 5, 3, 3, '#c8c8c8'); q.rect(x + 8, y + 8, 6, 6, '#6a6a6a'); for (let i = 0; i < 6; i++) q.rect(x + 8, y + 9 + i, 6, 1, i % 2 ? '#9a9a9a' : '#5a5a5a'); }, 2)),
    news3: () => P((p) => newspaper(p, 'AUG 15 91', ['BOY, 11,', 'MISSING'], null, (q, x, y) => { q.ellipse(x + 11, y + 5, 3, 3, '#c8c8c8'); q.rect(x + 8, y + 8, 6, 6, '#5a5a5a'); }, 3)),
    poster_cat: () => P((p) => {
      paperSheet(p, 12, 2, 40, 44, '#f8f8f4'); tinyC(p, 'MISSING', 32, 5, '#c83a3a');
      p.rect(16, 11, 32, 20, '#f4f0e8'); p.ellipse(32, 23, 9, 6, '#e8943a'); p.ellipse(24, 19, 5, 4, '#e8943a'); p.tri(20, 17, 21, 12, 24, 16, '#e8943a'); p.tri(25, 15, 27, 11, 28, 16, '#e8943a');
      p.set(22, 19, '#2a2a2a'); p.set(26, 19, '#2a2a2a'); for (let x = 27; x < 40; x += 3) p.line(x, 18, x + 1, 22, '#c8742a'); p.rect(21, 23, 6, 1, '#c83a3a'); p.set(24, 24, '#e8c040');
      tinyC(p, 'MARMALADE', 32, 33, '#1a1a1a'); tinyC(p, '5-0147', 32, 39, '#4a4a4a');
      p.rect(28, 1, 8, 3, [230, 230, 210, 180]);
    }),
    postcard: () => P((p) => {
      p.rect(4, 8, 56, 34, '#f4f0e4'); p.rect(6, 10, 52, 30, '#6ab0e0'); p.rect(6, 28, 52, 12, '#e8d8a0');
      p.rect(16, 18, 32, 12, '#eef0ee'); p.ellipse(32, 18, 7, 4, '#3e6292'); p.rect(16, 27, 32, 3, '#5a8ac8');
      tiny(p, 'GREETINGS', 8, 12, '#f8f8f4'); tiny(p, "1981", 46, 33, '#8a6a3a');
      p.rect(50, 11, 7, 8, '#f4f4f0'); p.rect(51, 12, 5, 6, '#c83a3a'); p.set(53, 14, '#f4f4f0');
    }),
    bus_schedule: () => P((p) => {
      paperSheet(p, 8, 6, 48, 38, '#e8e0c0', { dogear: true });
      tiny(p, 'ROUTE 9', 11, 9, '#1a3a6a'); p.rect(10, 15, 44, 1, '#6a6a6a');
      const times = ['7:10', '9:40', '12:15', '3:30', '6:05'];
      times.forEach((t, i) => { tiny(p, t, 11, 18 + i * 5, '#2a2a2a'); p.rect(32, 19 + i * 5, 18, 1, '#8a8a8a'); });
      p.line(10, 38, 50, 22, [200, 60, 50, 200]);
      p.rect(8, 6, 8, 3, [240, 240, 220, 170]); p.rect(48, 41, 8, 3, [240, 240, 220, 170]);
    }),
    toy_octopus: () => P((p) => {
      p.ellipse(32, 16, 14, 12, '#8a4ac8'); p.ellipse(28, 12, 4, 3, '#a870d8');
      for (let i = 0; i < 6; i++) { const x = 20 + i * 5; p.line(x, 24, x - 2 + (i % 2) * 4, 38, '#8a4ac8'); p.line(x + 1, 24, x - 1 + (i % 2) * 4, 38, '#8a4ac8'); p.ellipse(x - 2 + (i % 2) * 4, 39, 2, 1.5, '#8a4ac8'); }
      p.line(49, 22, 56, 30, '#8a4ac8'); p.line(50, 22, 57, 30, '#8a4ac8'); p.rect(55, 29, 4, 3, '#7a3ab8'); p.set(56, 30, '#6a2aa8');
      p.ellipse(26, 16, 2.5, 3, '#f4f4f0'); p.ellipse(38, 16, 2.5, 3, '#f4f4f0'); p.set(26, 17, '#1a1420'); p.set(38, 17, '#1a1420');
      p.line(29, 22, 35, 22, '#5a2a8a');
    }),
    spelling: () => P((p) => {
      paperSheet(p, 10, 3, 44, 42, '#f8f6ee', { lines: 4, top: 12, margin: 6 });
      tiny(p, 'EVAN V.', 18, 5, '#2a3a8a');
      const words = ['OCEAN', 'SECRET', 'BASEMNT', 'FORGIVE'];
      words.forEach((w, i) => tiny(p, w, 18, 13 + i * 8, '#2a3a8a'));
      p.line(44, 27, 47, 30, '#d83a32'); p.line(47, 27, 44, 30, '#d83a32');
      tiny(p, '3/4', 42, 38, '#d83a32'); p.ring(44, 40, 7, 4, '#d83a32');
    }),

    // ---- fish cards
    fc1: () => P((p) => fishCard(p, 1, 'CLOWNFISH', '#e8743a', '#5ab0d8', (q, x, y) => { q.ellipse(x, y, 9, 5, '#f07830'); q.tri(x + 8, y, x + 13, y - 4, x + 13, y + 4, '#f07830'); for (const dx of [-5, 0, 5]) q.rect(x + dx, y - 5, 2, 10, '#f8f8f4'); q.set(x - 6, y - 1, '#1a1420'); q.ellipse(x - 12, y + 6, 4, 3, '#c85a9a'); }, 3)),
    fc2: () => P((p) => fishCard(p, 2, 'BLUE TANG', '#2a58b8', '#7ac8e8', (q, x, y) => { q.ellipse(x, y, 10, 6, '#2a4ac8'); q.tri(x + 9, y, x + 14, y - 5, x + 14, y + 5, '#e8d040'); q.line(x - 6, y - 2, x + 5, y + 3, '#1a1a4a'); q.line(x - 4, y - 4, x + 6, y - 1, '#1a1a4a'); q.set(x - 7, y - 1, '#1a1420'); }, 3)),
    fc3: () => P((p) => fishCard(p, 3, 'MOON JELLY', '#9a8ad8', '#2a3a6a', (q, x, y) => { q.ellipse(x, y - 2, 9, 5, [220, 220, 255, 200]); q.rect(x - 9, y - 2, 19, 5, [0, 0, 0, 0]); q.ellipse(x, y - 2, 9, 1, [220, 220, 255, 200]); for (let i = -2; i <= 2; i++) q.ring(x + i * 2, y - 3, 1.2, 1.2, '#f8c8e8'); for (let i = -3; i <= 3; i++) q.line(x + i * 2, y, x + i * 2 + (i % 2), y + 8, [220, 220, 255, 160]); }, 2)),
    fc4: () => P((p) => fishCard(p, 4, 'SEAHORSE', '#e8c040', '#3a8aa8', (q, x, y) => { q.ellipse(x, y - 4, 3, 3, '#e8a040'); q.tri(x + 2, y - 5, x + 7, y - 4, x + 2, y - 3, '#e8a040'); q.ellipse(x - 1, y + 2, 3.5, 5, '#e8a040'); q.line(x - 2, y + 6, x + 2, y + 9, '#e8a040'); q.ring(x + 3, y + 9, 1.5, 1.5, '#e8a040'); q.set(x + 1, y - 5, '#1a1420'); for (let i = 0; i < 4; i++) q.set(x - 4, y - 2 + i * 2, '#c8802a'); }, 2)),
    fc5: () => P((p) => fishCard(p, 5, 'SEA TURTLE', '#3a8a4a', '#6ac0d0', (q, x, y) => { q.ellipse(x, y, 9, 6, '#6a7a3a'); for (const [dx, dy] of [[-3, -2], [3, -2], [0, 2], [-5, 2], [5, 2]]) q.ellipse(x + dx, y + dy, 2, 1.5, '#8a9a4a'); q.ellipse(x + 11, y - 1, 3, 2.5, '#8aa05a'); q.set(x + 12, y - 2, '#1a1420'); q.tri(x - 6, y + 4, x - 12, y + 8, x - 3, y + 6, '#8aa05a'); q.tri(x + 5, y + 4, x + 10, y + 9, x + 2, y + 6, '#8aa05a'); }, 4)),
    fc6: () => P((p) => fishCard(p, 6, 'OCTOPUS', '#8a3a5a', '#3a5a7a', (q, x, y) => { q.ellipse(x, y - 3, 6, 5, '#c85a4a'); for (let i = 0; i < 5; i++) q.line(x - 5 + i * 2.5, y + 1, x - 8 + i * 4, y + 8, '#c85a4a'); q.ellipse(x - 2, y - 3, 1.5, 1, '#f4f0e0'); q.ellipse(x + 2, y - 3, 1.5, 1, '#f4f0e0'); q.set(x - 2, y - 3, '#1a1420'); q.set(x + 2, y - 3, '#1a1420'); }, 5, { holo: true })),
    fc7: () => P((p) => fishCard(p, 7, 'PENGUIN', '#3a3a48', '#bfe8f8', (q, x, y) => { q.ellipse(x, y + 1, 5, 8, '#1a1a24'); q.ellipse(x, y + 2, 3.5, 6, '#f4f4f0'); q.ellipse(x, y - 6, 3.5, 3, '#1a1a24'); q.set(x + 1, y - 7, '#f4f4f0'); q.tri(x + 3, y - 6, x + 6, y - 5, x + 3, y - 4, '#e8a040'); q.rect(x - 3, y + 9, 2, 1, '#e8a040'); q.rect(x + 1, y + 9, 2, 1, '#e8a040'); }, 3)),
    fc8: () => P((p) => fishCard(p, 8, 'MOOR. IDOL', '#c8a040', '#4aa0c8', (q, x, y) => { q.tri(x - 6, y + 5, x + 6, y + 5, x - 2, y - 9, '#f4f0d0'); q.ellipse(x, y + 1, 7, 5, '#f4f0d0'); q.rect(x - 3, y - 6, 3, 11, '#1a1a1a'); q.rect(x + 3, y - 3, 2, 8, '#1a1a1a'); q.tri(x + 6, y + 1, x + 10, y - 2, x + 10, y + 4, '#e8d040'); q.set(x - 5, y, '#1a1420'); q.line(x - 2, y - 9, x + 8, y - 12, '#f4f0d0'); }, 2)),
    fc9: () => P((p) => fishCard(p, 9, 'HERMIT CRAB', '#c85a3a', '#e8d8a8', (q, x, y) => { shellSpiral(q, x + 2, y, '#d8b890'); q.rect(0, 0, 0, 0, '#000'); q.ellipse(x - 7, y + 3, 4, 3, '#d8542a'); q.rect(x - 11, y, 3, 2, '#d8542a'); q.set(x - 9, y - 1, '#1a1420'); q.line(x - 8, y + 6, x - 11, y + 8, '#d8542a'); }, 2)),
    fc10: () => P((p) => fishCard(p, 10, 'SEA STAR', '#d85a4a', '#4a9ab8', (q, x, y) => { for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 1.2566; q.tri(x + Math.cos(a) * 8, y + Math.sin(a) * 8, x + Math.cos(a - 0.6) * 2.5, y + Math.sin(a - 0.6) * 2.5, x + Math.cos(a + 0.6) * 2.5, y + Math.sin(a + 0.6) * 2.5, '#e8743a'); } q.ellipse(x, y, 3, 3, '#e8743a'); q.speckle(makeRng(10), ['#f8b070'], 0.3, x - 6, y - 6, 12, 12); }, 3)),
    fc11: () => P((p) => fishCard(p, 11, 'LANTERNFISH', '#2a3a5a', '#0a1428', (q, x, y) => { q.ellipse(x, y, 8, 3.5, '#4a5a7a'); q.tri(x + 7, y, x + 11, y - 3, x + 11, y + 3, '#4a5a7a'); for (let i = -2; i <= 2; i++) q.set(x + i * 3, y + 2, '#a8f0ff'); q.ellipse(x - 5, y - 1, 1.5, 1.5, '#f4f4f0'); q.set(x - 5, y - 1, '#1a1420'); for (let i = 0; i < 6; i++) q.set(x - 12 + i * 5, y - 7 + (i * 3) % 6, [160, 220, 255, 150]); }, 4)),
    fc12: () => P((p) => {
      fishCard(p, 12, 'THE DEEP', '#1a1a22', '#000004', (q, x, y) => { q.ellipse(x, y + 1, 7, 5, '#1c1c24'); q.line(x - 2, y - 4, x - 6, y - 8, '#3a3a44'); q.ellipse(x - 7, y - 9, 1.5, 1.5, '#e8f0a0'); for (let i = 0; i < 4; i++) q.set(x - 5 + i * 2, y + 3, '#d8d8c8'); q.set(x - 3, y - 1, '#a8a8a0'); }, 0);
      // misprint: the card was never finished
      p.map((c, x, y) => (x > 36 && x < 56 && y > 1 && y < 46 && (x + y) % 2 && x > 36 + (y - 2) * 0.25 ? [c[0] * 0.55 | 0, c[1] * 0.55 | 0, c[2] * 0.6 | 0, 255] : null));
      p.rect(22, 38, 20, 7, '#f4f2ea'); p.frame(22, 38, 20, 7, '#c83a3a'); tinyC(p, 'VOID', 32, 39, '#c83a3a');
    }),

    // ---- shells: three different ones
    shell1: () => P((p) => shellSpiral(p, 28, 26, '#5a9ae0')),
    shell2: () => P((p) => {
      for (let i = 0; i < 9; i++) { const a = Math.PI + i * Math.PI / 8; p.tri(32, 36, 32 + Math.cos(a - 0.2) * 20, 36 + Math.sin(a - 0.2) * 20, 32 + Math.cos(a + 0.2) * 20, 36 + Math.sin(a + 0.2) * 20, i % 2 ? '#4a8ad0' : '#5a9ae0'); }
      p.ellipse(32, 17, 20, 3, [0, 0, 0, 0]);
      p.rect(27, 36, 10, 5, '#4a8ad0'); p.tri(22, 36, 27, 36, 27, 41, '#5a9ae0'); p.tri(37, 36, 42, 36, 37, 41, '#5a9ae0');
      for (let i = 0; i < 9; i++) { const a = Math.PI + i * Math.PI / 8; p.line(32, 36, 32 + Math.cos(a) * 19, 36 + Math.sin(a) * 19, '#3a6ab0'); }
      p.tri(44, 18, 50, 20, 47, 24, [0, 0, 0, 0]);
    }),
    shell3: () => P((p) => {
      p.ellipse(32, 26, 16, 14, '#5a9ae0'); p.ellipse(34, 28, 9, 8, '#e8f0f8'); p.ellipse(35, 29, 6, 5, '#c8d8e8');
      p.ring(28, 22, 12, 11, '#3a6ab0'); p.ring(29, 23, 8, 7, '#4a7ac0');
      // scratched inside, very small: E
      p.rect(33, 27, 1, 5, '#8aa0b8'); p.rect(33, 27, 3, 1, '#8aa0b8'); p.rect(33, 29, 2, 1, '#8aa0b8'); p.rect(33, 31, 3, 1, '#8aa0b8');
    }),
  };

  // paintings that change with the game: repainted when their variant changes
  const lateOf = (st) => !!st && (st.day >= 8 || (st.flags && st.flags.ghostMet));
  const VARIANT = { badge: (st) => st.name || '', key_house: (st) => (lateOf(st) ? 'late' : 'early') };
  const painted = {};
  function build() {
    const st0 = { name: '', day: 1, flags: {} };
    for (const id in ART) {
      try { Atlas.add('cu_' + id, ART[id](st0)); painted[id] = VARIANT[id] ? VARIANT[id](st0) : ''; } catch (e) { console.error('closeup ' + id, e); }
    }
  }
  // the region to show for an item (null = use its photo or icon)
  function regionFor(id, st) {
    if (!Atlas.regions['cu_' + id]) return null;
    if (st && VARIANT[id]) { const v = VARIANT[id](st); if (v !== painted[id]) { painted[id] = v; Atlas.add('cu_' + id, ART[id](st)); } }
    return 'cu_' + id;
  }
  // other files paint their own items: fn(p, h), h = the helpers above
  const HELP = { tiny, tinyC, tinyW, key, tag, paperSheet, scribble, rng };
  function add(id, fn, o) {
    ART[id] = () => P((p) => fn(p, HELP), o);
    try { Atlas.add('cu_' + id, ART[id]()); painted[id] = ''; } catch (e) { console.error('closeup ' + id, e); }
  }
  return { build, regionFor, tiny, add };
})();
