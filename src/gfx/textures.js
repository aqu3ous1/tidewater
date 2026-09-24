'use strict';
// ---------------------------------------------------------------------------
// Procedural world textures (tileable, power-of-two, 3-6 colours each).
// ---------------------------------------------------------------------------

const Tex = (() => {
  const surf = {}; // texture -> footstep surface
  const list = {};

  function reg(name, pix, surface) {
    list[name] = pix;
    R.addTexture(name, pix.canvas(), true);
    if (surface) surf[name] = surface;
  }

  function noiseTex(size, base, specks, dens, seed) {
    const r = makeRng(seed || 1);
    const p = new Pix(size, size).fill(base);
    p.speckle(r, specks, dens);
    return p;
  }

  function planks(size, base, dark, light, plankH, seed) {
    const r = makeRng(seed || 3);
    const p = new Pix(size, size).fill(base);
    for (let y = 0; y < size; y += plankH) {
      for (let x = 0; x < size; x++) p.set(x, y, dark);
      const joint = r.int(size);
      for (let j = 1; j < plankH; j++) p.set(joint, y + j, dark);
      for (let i = 0; i < size * plankH * 0.08; i++) p.set(r.int(size), y + 1 + r.int(plankH - 1), r() < 0.5 ? light : shade(base, 0.9));
    }
    return p;
  }

  function siding(color, seed) {
    const r = makeRng(seed || 5);
    const p = new Pix(32, 32).fill(color);
    for (let y = 0; y < 32; y += 8) {
      for (let x = 0; x < 32; x++) { p.set(x, y + 7, shade(color, 0.72)); p.set(x, y + 6, shade(color, 0.88)); p.set(x, y, shade(color, 1.08)); }
    }
    p.speckle(r, [shade(color, 0.94), shade(color, 1.04)], 0.06);
    return p;
  }

  function bricks(base, mortar, seed) {
    const r = makeRng(seed || 7);
    const p = new Pix(32, 32).fill(mortar);
    for (let row = 0; row < 8; row++) {
      const off = row % 2 ? 4 : 0;
      for (let b = -1; b < 4; b++) {
        const bx = b * 8 + off;
        const c = shade(base, 0.85 + r() * 0.3);
        p.rect(bx + 1, row * 4 + 1, 7, 3, c);
      }
    }
    p.speckle(r, [shade(base, 0.7)], 0.03);
    return p;
  }

  function tiles(size, cell, base, grout, seed, vary) {
    const r = makeRng(seed || 9);
    const p = new Pix(size, size).fill(grout);
    for (let y = 0; y < size; y += cell) for (let x = 0; x < size; x += cell) {
      p.rect(x + 1, y + 1, cell - 1, cell - 1, vary ? shade(base, 1 - vary / 2 + r() * vary) : base);
    }
    p.speckle(r, [shade(base, 0.92)], 0.03);
    return p;
  }

  function checker(size, cell, a, b) {
    const p = new Pix(size, size);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) p.set(x, y, ((Math.floor(x / cell) + Math.floor(y / cell)) % 2) ? a : b);
    return p;
  }

  function build() {
    // --- ground ------------------------------------------------------------
    reg('grass', noiseTex(32, '#6c9a3c', ['#7cae48', '#5c8732', '#86b850', '#638f36'], 0.45, 11), 'grass');
    reg('grass_dead', noiseTex(32, '#8a8f58', ['#9a9a62', '#7a7f4c', '#a5a36e'], 0.45, 12), 'grass');
    reg('dirt', noiseTex(32, '#8a6a44', ['#7a5c3a', '#9a7a52', '#6e5234'], 0.4, 13), 'sand');
    reg('sand', noiseTex(32, '#d9c894', ['#e6d7a6', '#c9b784', '#d2c08a', '#bfae7c'], 0.4, 14), 'sand');
    {
      const r = makeRng(15), p = new Pix(32, 32).fill('#55555c');
      p.speckle(r, ['#4a4a50', '#626268', '#5b5b62', '#44444a'], 0.5);
      reg('asphalt', p, 'hard');
    }
    {
      const r = makeRng(16), p = new Pix(32, 32).fill('#bdb8ab');
      p.speckle(r, ['#b2ad9f', '#c7c2b6', '#aaa597'], 0.3);
      for (let i = 0; i < 32; i++) { p.set(i, 0, '#9c978b'); p.set(0, i, '#9c978b'); }
      reg('sidewalk', p, 'hard');
    }
    {
      const r = makeRng(17), p = new Pix(32, 32).fill('#8e8d88');
      p.speckle(r, ['#83827d', '#999893', '#7a7974', '#a09f9a'], 0.5);
      p.line(3, 5, 9, 12, '#6f6e6a'); p.line(9, 12, 11, 20, '#6f6e6a'); p.line(20, 22, 29, 25, '#76756f');
      reg('concrete', p, 'hard');
      const q = new Pix(32, 32).fill('#b4b3ad'); q.speckle(makeRng(18), ['#aeada7', '#bcbbb5'], 0.3);
      reg('concrete_new', q, 'hard');
      const d = new Pix(32, 32).fill('#6e6d68'); d.speckle(makeRng(19), ['#63625d', '#77766f', '#5a5954'], 0.5);
      d.line(0, 16, 31, 18, '#56554f');
      reg('concrete_dark', d, 'hard');
    }
    {
      const r = makeRng(20), p = new Pix(32, 32).fill('#3a6fb2');
      for (let i = 0; i < 9; i++) { const y = r.int(32), x = r.int(32), l = 3 + r.int(6); for (let k = 0; k < l; k++) p.set(x + k, y + (k > l / 2 ? 1 : 0), '#6d9fd8'); }
      p.speckle(r, ['#3265a6', '#4479bd'], 0.2);
      reg('water', p, 'water');
      const t = new Pix(32, 32).fill('#2f6d8e'); t.speckle(makeRng(21), ['#3b7d9e', '#28607e', '#4f93b0'], 0.3);
      for (let i = 0; i < 6; i++) { const y = r.int(32), x = r.int(32); p.set(x, y, '#9cd'); t.line(x, y, x + 4, y + 1, '#5aa2be'); }
      reg('water_tank', t, 'water');
      const dk = new Pix(32, 32).fill('#101c2a'); dk.speckle(makeRng(22), ['#15243a', '#0b1420'], 0.3);
      for (let i = 0; i < 4; i++) { const y = r.int(32), x = r.int(32); dk.line(x, y, x + 5, y, '#1f3450'); }
      reg('water_dark', dk, 'water');
    }
    // --- walls ---------------------------------------------------------------
    reg('siding_white', siding('#e4e0d4', 30));
    reg('siding_blue', siding('#8fb0cf', 31));
    reg('siding_yellow', siding('#e2cc7c', 32));
    reg('siding_green', siding('#9cb88a', 33));
    reg('siding_pink', siding('#dca6a6', 34));
    reg('siding_grey', siding('#9a9a94', 35));
    reg('siding_dead', (() => { const p = siding('#8d8878', 36); p.speckle(makeRng(37), ['#6c6858', '#77725f', '#5b5848'], 0.2); return p; })());
    reg('brick', bricks('#a2503c', '#b8ab98', 40));
    reg('brick_tan', bricks('#c09a6a', '#d8ccb4', 41));
    reg('brick_old', bricks('#7a4a3c', '#8a7e6e', 42));
    {
      const r = makeRng(43), p = new Pix(32, 32).fill('#9a9690');
      for (let row = 0; row < 4; row++) for (let b = 0; b < 3; b++) {
        const w = 8 + r.int(6), x = b * 11 + (row % 2) * 5;
        p.rect(x, row * 8 + 1, w, 6, shade('#a6a29a', 0.85 + r() * 0.3));
      }
      reg('stone', p, 'hard');
    }
    const paint = (name, base, specks, seed) => reg(name, noiseTex(32, base, specks, 0.12, seed));
    paint('wall_cream', '#e2d8bc', ['#d8cdb0', '#eadfc6'], 50);
    paint('wall_green', '#46583a', ['#3f5134', '#4d6041'], 51);
    paint('wall_blue', '#2c4f82', ['#284877', '#315690'], 52);
    paint('wall_navy', '#1a2c4c', ['#172742', '#1e3256'], 53);
    paint('wall_pink', '#e3b3b8', ['#d9a8ad', '#ecbec3'], 54);
    paint('wall_grey', '#a8aaa8', ['#9fa19f', '#b1b3b1'], 55);
    paint('wall_yellow', '#e8d690', ['#dfcc84', '#efdd9a'], 56);
    paint('wall_mint', '#b8dccb', ['#aed2c1', '#c2e6d5'], 57);
    paint('wall_school', '#d8d0a8', ['#cec69c', '#e0d8b2'], 58);
    paint('wall_maroon', '#6a2e32', ['#60282c', '#743438'], 59);
    paint('wall_dark', '#2a2a2e', ['#252529', '#303034'], 60);
    paint('wall_white', '#e8e8e2', ['#e0e0da', '#efefe9'], 61);
    // wallpapers
    {
      const p = new Pix(32, 32).fill('#e9dcc0');
      for (let y = 0; y < 32; y += 16) for (let x = 0; x < 32; x += 16) {
        const ox = (y / 16) % 2 ? 8 : 0;
        p.ellipse(x + ox + 4, y + 4, 2, 2, '#d88f8f'); p.set(x + ox + 4, y + 4, '#b86a6a');
        p.set(x + ox + 2, y + 7, '#8fae7c'); p.set(x + ox + 6, y + 7, '#8fae7c');
      }
      reg('wallpaper_floral', p);
      const s = new Pix(32, 32).fill('#bcd4e8');
      for (let x = 0; x < 32; x += 8) for (let y = 0; y < 32; y++) { s.set(x, y, '#9fbcd8'); s.set(x + 1, y, '#9fbcd8'); }
      // little fish between stripes
      [[4, 6], [20, 22]].forEach(([fx, fy]) => { s.ellipse(fx + 2, fy, 2, 1.2, '#e79a4a'); s.set(fx - 1, fy - 1, '#e79a4a'); s.set(fx - 1, fy + 1, '#e79a4a'); s.set(fx + 3, fy - 1, '#222'); });
      reg('wallpaper_evan', s);
      const g = new Pix(32, 32).fill('#566b4a');
      for (let y = 0; y < 32; y += 8) for (let x = 0; x < 32; x += 8) { g.set(x + 4, y + 4, '#62785a'); g.set(x + 3, y + 4, '#62785a'); g.set(x + 4, y + 3, '#62785a'); }
      reg('wallpaper_green', g);
    }
    // --- floors ----------------------------------------------------------------
    reg('wood_floor', planks(32, '#a8743e', '#7a5028', '#bd8a50', 8, 70), 'wood');
    reg('wood_floor_dark', planks(32, '#6e4a2a', '#4e3218', '#80593a', 8, 71), 'wood');
    reg('wood', planks(32, '#9a6a3a', '#7a5028', '#b07c48', 16, 72), 'wood');
    reg('wood_light', planks(32, '#c9a26e', '#a8814e', '#d8b482', 16, 73), 'wood');
    reg('wood_dark', planks(32, '#5a3a22', '#402812', '#6a4830', 16, 74), 'wood');
    reg('pier', planks(32, '#8a7a62', '#5e5040', '#9c8c72', 6, 75), 'wood');
    reg('carpet_green', noiseTex(32, '#5c7a4c', ['#526f43', '#668655', '#4c6840'], 0.5, 80), 'carpet');
    reg('carpet_beige', noiseTex(32, '#c4b494', ['#b8a888', '#cfc0a0', '#bdad8c'], 0.5, 81), 'carpet');
    reg('carpet_red', noiseTex(32, '#8e3a3a', ['#823434', '#9a4242', '#7a3030'], 0.5, 82), 'carpet');
    reg('carpet_blue', noiseTex(32, '#46609a', ['#3f578c', '#4e6aa6', '#3a5282'], 0.5, 83), 'carpet');
    reg('carpet_grey', noiseTex(32, '#8a8a90', ['#808086', '#94949a', '#7a7a80'], 0.5, 84), 'carpet');
    reg('carpet_purple', noiseTex(32, '#6c5a82', ['#625078', '#76648c'], 0.5, 85), 'carpet');
    reg('lino_checker', checker(32, 8, '#e8e4d8', '#2a2a30'), 'tile');
    reg('lino_green', checker(32, 8, '#d8dcc8', '#8aa888'), 'tile');
    reg('tile_white', tiles(32, 8, '#e6e8e6', '#b8bab8', 90), 'tile');
    reg('tile_aqua', tiles(32, 16, '#8aa8b8', '#6a8494', 91, 0.08), 'tile');
    reg('tile_blue', tiles(32, 8, '#3a64b0', '#2c4f8e', 92, 0.1), 'tile');
    reg('tile_grey', tiles(32, 16, '#b0b0aa', '#8c8c86', 93, 0.06), 'tile');
    reg('tile_mint', tiles(32, 8, '#b8e0d0', '#90b8a8', 94, 0.05), 'tile');
    {
      // aquarium feature wall: blue tiles with diagonal marks (like an old kid's-show set)
      const p = new Pix(32, 32).fill('#2f55c0');
      for (let y = 0; y < 32; y += 16) for (let x = 0; x < 32; x += 16) {
        p.frame(x, y, 16, 16, '#2448a8');
        p.line(x + 3, y + 12, x + 12, y + 3, '#4a74dc'); p.line(x + 3, y + 3, x + 6, y + 3, '#4a74dc');
      }
      reg('tile_feature', p, 'tile');
    }
    reg('ceiling_tile', tiles(32, 16, '#dcdcd4', '#b4b4ac', 95, 0.03));
    reg('rubber', noiseTex(32, '#3a3a3a', ['#333', '#444'], 0.3, 96), 'hard');
    {
      const r = makeRng(97), p = new Pix(32, 32).fill('#7c7e82');
      for (let y = 0; y < 32; y += 8) for (let x = 0; x < 32; x += 8) { p.set(x + 1, y + 1, '#a0a2a6'); p.set(x + 2, y + 2, '#5c5e62'); }
      p.speckle(r, ['#74767a', '#84868a'], 0.2);
      reg('metal', p, 'metal');
      const g = new Pix(32, 32).fill('#3c3e42');
      for (let y = 0; y < 32; y += 4) for (let x = 0; x < 32; x++) g.set(x, y, '#27292c');
      for (let x = 0; x < 32; x += 4) for (let y = 0; y < 32; y++) g.set(x, y, '#27292c');
      reg('grate', g, 'metal');
      const rs = new Pix(32, 32).fill('#7a5a44'); rs.speckle(makeRng(98), ['#8a6040', '#6a4a34', '#94704c', '#5a3e2c'], 0.5);
      reg('rust', rs, 'metal');
    }
    // roofs
    const shingles = (name, base, seed) => {
      const r = makeRng(seed), p = new Pix(32, 32).fill(base);
      for (let y = 0; y < 32; y += 6) {
        for (let x = 0; x < 32; x++) p.set(x, y, shade(base, 0.7));
        for (let x = (y / 6 % 2) * 4; x < 32; x += 8) for (let j = 0; j < 6; j++) p.set(x, y + j, shade(base, 0.8));
      }
      p.speckle(r, [shade(base, 0.9), shade(base, 1.1)], 0.1);
      reg(name, p);
    };
    shingles('roof_grey', '#5e5e66', 100);
    shingles('roof_brown', '#6e4a38', 101);
    shingles('roof_red', '#8a3a34', 102);
    shingles('roof_green', '#4a6a52', 103);
    shingles('roof_blue', '#3e5a7c', 104);
    reg('roof_flat', noiseTex(32, '#6a6862', ['#605e58', '#74726c'], 0.3, 105));
    reg('hedge', (() => { const p = noiseTex(32, '#3e6a32', ['#4a7a3a', '#335a2a', '#56883f', '#2e5226'], 0.6, 106); return p; })(), 'grass');
    reg('bark', (() => { const p = new Pix(16, 16).fill('#6a4a30'); for (let x = 0; x < 16; x += 3) p.line(x, 0, x + 1, 15, '#58391f'); return p; })());
    reg('rock', noiseTex(32, '#8c8a86', ['#7a7874', '#9e9c98', '#6a6864', '#b0aea8'], 0.5, 107), 'hard');
    reg('rock_white', noiseTex(32, '#d8dcdc', ['#c8cccc', '#e8ecec', '#b8c0c4'], 0.4, 108), 'hard');
    reg('fabric_red', noiseTex(32, '#9a3a3a', ['#8a3232', '#a44444'], 0.3, 110), 'carpet');
    reg('fabric_green', noiseTex(32, '#4e6e46', ['#46643e', '#587a50'], 0.3, 111), 'carpet');
    reg('fabric_brown', noiseTex(32, '#8a6a4a', ['#7e6042', '#967454'], 0.3, 112), 'carpet');
    reg('fabric_blue', noiseTex(32, '#4a5e8a', ['#42557e', '#526896'], 0.3, 113), 'carpet');
    reg('fabric_grey', noiseTex(32, '#8a8a8a', ['#7e7e7e', '#969696'], 0.3, 114), 'carpet');
    reg('chalk', noiseTex(32, '#2e5a3e', ['#2a5238', '#346444', '#3a6a48'], 0.3, 115));
    {
      // ABC carpet (kids' corner) — 5x5 letter squares
      const p = new Pix(64, 64).fill('#e8e0d0');
      const cols = ['#c83c3c', '#3c6ac8', '#3c9a4a', '#d8a02c', '#8a4ac8'];
      let k = 0;
      for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
        const c = cols[(i + j * 2) % cols.length];
        p.rect(i * 16, j * 16, 16, 16, '#efe8da');
        p.frame(i * 16 + 1, j * 16 + 1, 14, 14, c); p.frame(i * 16 + 2, j * 16 + 2, 12, 12, c);
        Font.paint(p, String.fromCharCode(65 + (k % 26)), i * 16 + 5, j * 16 + 3, c, 1);
        k++;
      }
      reg('abc_carpet', p, 'carpet');
    }
    reg('dev_checker', checker(32, 16, '#9a9a9a', '#c4c4c4'), 'hard');
    reg('dev_grid', (() => { const p = new Pix(32, 32).fill('#808080'); for (let i = 0; i < 32; i++) { p.set(i, 0, '#5c5c5c'); p.set(0, i, '#5c5c5c'); p.set(i, 16, '#707070'); p.set(16, i, '#707070'); } return p; })(), 'hard');
    reg('black', new Pix(8, 8).fill('#000000'));
    reg('void', new Pix(8, 8).fill('#0a0a0e'));
    reg('glass', new Pix(8, 8).fill('#a8d8f0'));
    reg('glass_dark', new Pix(8, 8).fill('#3a5870'));
    reg('red', new Pix(8, 8).fill('#b83a34'));
    reg('plastic_white', noiseTex(16, '#e8e8e4', ['#dcdcd8'], 0.1, 120));
    reg('plastic_blue', noiseTex(16, '#3a7ad0', ['#346ec0'], 0.1, 121));
    reg('plastic_yellow', noiseTex(16, '#e8c43a', ['#dab634'], 0.1, 122));
    reg('plastic_red', noiseTex(16, '#d04a3a', ['#c04234'], 0.1, 123));
    reg('plastic_green', noiseTex(16, '#4aa04a', ['#429042'], 0.1, 124));
    reg('plastic_pink', noiseTex(16, '#e89ab8', ['#dc8eac'], 0.1, 125));
    reg('plastic_orange', noiseTex(16, '#e8883a', ['#dc7c34'], 0.1, 126));
    reg('chrome', (() => { const p = new Pix(16, 16).fill('#c8ccd0'); for (let y = 0; y < 16; y++) p.set(0, y, '#fff'); p.speckle(makeRng(127), ['#b0b4b8', '#dde'], 0.2); return p; })(), 'metal');
    reg('paper', noiseTex(16, '#ecead8', ['#e2e0ce'], 0.1, 128));
    reg('cardboard', (() => { const p = noiseTex(32, '#b89060', ['#aa8454', '#c49c6c'], 0.3, 129); for (let x = 0; x < 32; x++) p.set(x, 15, '#9a7448'); return p; })(), 'wood');
  }

  return { build, surf, list };
})();
