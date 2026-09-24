'use strict';
// ---------------------------------------------------------------------------
// Props — low-poly furniture and street furniture. Each prop is built around
// its own origin; `face` is the direction its front looks ('s' by default).
// ---------------------------------------------------------------------------

const Props = {
  atlas() {
    const P = (w, h, fn) => { const p = new Pix(w, h); fn(p); return p; };
    Atlas.add('fence_picket', P(32, 16, (p) => { for (let x = 1; x < 32; x += 4) { p.rect(x, 2, 3, 14, '#f0f0ea'); p.set(x + 1, 1, '#f0f0ea'); } p.rect(0, 5, 32, 2, '#e0e0d8'); p.rect(0, 11, 32, 2, '#e0e0d8'); }));
    Atlas.add('fence_picket_dead', P(32, 16, (p) => { for (let x = 1; x < 32; x += 4) { if (x === 13) continue; p.rect(x, 2 + (x % 3), 3, 14 - (x % 3), '#a8a498'); } p.rect(0, 5, 32, 2, '#989488'); p.rect(0, 11, 32, 2, '#989488'); }));
    Atlas.add('fence_chain', P(32, 32, (p) => { for (let i = -32; i < 32; i += 4) { p.line(i, 0, i + 32, 32, '#9a9aa0'); p.line(i + 32, 0, i, 32, '#9a9aa0'); } p.rect(0, 0, 32, 2, '#7a7a80'); }));
    Atlas.add('rail_metal', P(32, 8, (p) => { p.rect(0, 0, 32, 2, '#8a8a90'); for (let x = 0; x < 32; x += 8) p.rect(x, 0, 2, 8, '#8a8a90'); }));
    Atlas.add('rail_wood', P(32, 12, (p) => { p.rect(0, 0, 32, 3, '#8a7a62'); p.rect(0, 5, 32, 2, '#8a7a62'); for (let x = 0; x < 32; x += 10) p.rect(x, 0, 3, 12, '#6a5a44'); }));
    Atlas.add('curtain', P(16, 32, (p) => { p.fill('#c89aa0'); for (let x = 0; x < 16; x += 4) p.rect(x, 0, 1, 32, '#b08088'); }));
    Atlas.add('coral', P(32, 20, (p) => { p.ellipse(8, 16, 7, 5, '#e87a8a'); p.ellipse(22, 15, 8, 6, '#f0a050'); p.rect(14, 4, 3, 14, '#c86ab0'); p.rect(11, 8, 3, 3, '#c86ab0'); p.rect(26, 4, 2, 10, '#e8e0a0'); p.outline('#3a1a2a'); }));
    Atlas.add('kelp', P(16, 32, (p) => { for (let i = 0; i < 3; i++) for (let y = 0; y < 32; y++) p.set(3 + i * 5 + Math.round(Math.sin(y * 0.4 + i) * 1.5), y, i % 2 ? '#4a8a3a' : '#3a7a2a'); }));
    Atlas.add('tank_back_reef', P(32, 32, (p) => { for (let y = 0; y < 32; y++) p.rect(0, y, 32, 1, mixc('#3aa0d8', '#1a4a8a', y / 32)); p.ellipse(8, 30, 9, 6, '#c8b888'); p.ellipse(26, 31, 10, 5, '#c8b888'); }));
    Atlas.add('tank_back_dark', P(32, 32, (p) => { for (let y = 0; y < 32; y++) p.rect(0, y, 32, 1, mixc('#1a3a6a', '#081428', y / 32)); p.ellipse(16, 32, 18, 5, '#3a3a3a'); }));
    Atlas.add('tank_back_jelly', P(32, 32, (p) => { for (let y = 0; y < 32; y++) p.rect(0, y, 32, 1, mixc('#3a3a9a', '#1a1a4a', y / 32)); }));
    Atlas.add('tank_back_empty', P(32, 32, (p) => { p.fill('#5a6a6a'); p.speckle(makeRng(88), ['#4a5a5a', '#6a7a7a'], 0.3); }));
    Atlas.add('tarp', P(32, 32, (p) => { p.fill('#3a5a9a'); for (let i = 0; i < 32; i += 6) p.line(i, 0, i + 4, 31, '#2e4a82'); p.rect(0, 0, 32, 2, '#2a3a6a'); }));
    Atlas.add('plywood', P(32, 32, (p) => { p.fill('#c8a878'); p.speckle(makeRng(89), ['#b89868', '#d8b888', '#a88858'], 0.25); p.rect(15, 0, 1, 32, '#9a7a4a'); }));
  },
};

Object.assign(MapBuilder.prototype, {
  table(x, z, w, d, h, tex, face) {
    h = h || 0.8; tex = tex || 'wood';
    return this.at(x, z, face || 's', () => {
      this.box(0, h - 0.08, 0, w, 0.08, d, tex, { solid: false });
      for (const [lx, lz] of [[-w / 2 + 0.08, -d / 2 + 0.08], [w / 2 - 0.08, -d / 2 + 0.08], [-w / 2 + 0.08, d / 2 - 0.08], [w / 2 - 0.08, d / 2 - 0.08]]) this.box(lx, 0, lz, 0.1, h - 0.08, 0.1, tex, { solid: false, top: false });
      this.solid(-w / 2, -d / 2, w / 2, d / 2);
    });
  },
  chair(x, z, face, tex) {
    tex = tex || 'wood';
    return this.at(x, z, face || 's', () => {
      this.box(0, 0.45, 0, 0.5, 0.08, 0.5, tex, { solid: false });
      this.box(0, 0.53, -0.22, 0.5, 0.55, 0.07, tex, { solid: false });
      for (const [lx, lz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) this.box(lx, 0, lz, 0.06, 0.45, 0.06, tex, { solid: false, top: false });
      this.solid(-0.25, -0.25, 0.25, 0.25);
    });
  },
  stool(x, z, tex) { this.cyl(x, 0, z, 0.22, 0.7, tex || 'fabric_red', { sides: 6 }); return this; },
  counter(x, z, w, d, h, o) {
    o = o || {};
    return this.at(x, z, o.face || 's', () => {
      this.box(0, 0, 0, w, h || 1.0, d, { top: o.top || 'wood_light', sides: o.side || 'wood', s: o.front || o.side || 'wood' }, { fit: o.fitFront ? { s: true } : false });
    });
  },
  bed(x, z, face, o) {
    o = o || {};
    return this.at(x, z, face || 's', () => {
      this.box(0, 0, 0, 1.3, 0.45, 2.1, { top: '@' + (o.blanket || 'blanket_plain'), sides: 'wood' }, { fit: { top: true } });
      this.box(0, 0.45, -0.75, 1.1, 0.14, 0.45, { top: '@pillow', sides: 'plastic_white' }, { fit: { top: true }, solid: false });
      this.box(0, 0, -1.08, 1.4, 1.1, 0.1, 'wood_dark', { solid: false });
    });
  },
  shelf(x, z, w, h, face, region) {
    return this.at(x, z, face || 's', () => {
      this.box(0, 0, 0, w, h, 0.45, { top: 'wood_dark', sides: 'wood_dark', s: '@' + (region || 'bookshelf') }, { fit: { s: true } });
    });
  },
  fridge(x, z, face, note) {
    return this.at(x, z, face || 's', () => this.box(0, 0, 0, 0.9, 2.0, 0.8, { top: 'plastic_white', sides: 'plastic_white', s: '@' + (note ? 'fridge_note' : 'fridge_front') }, { fit: { s: true } }));
  },
  stove(x, z, face) {
    return this.at(x, z, face || 's', () => this.box(0, 0, 0, 0.9, 1.0, 0.8, { top: '@stove_top', sides: 'plastic_white', s: '@stove_front' }, { fit: { s: true, top: true } }));
  },
  sink(x, z, face, w) {
    return this.at(x, z, face || 's', () => this.box(0, 0, 0, w || 1.0, 1.0, 0.8, { top: '@sink_top', sides: 'wood_light', s: '@cabinet_front' }, { fit: { s: true, top: true } }));
  },
  cabinets(x, z, w, face) {
    return this.at(x, z, face || 's', () => this.box(0, 0, 0, w, 1.0, 0.8, { top: 'tile_white', sides: 'wood_light', s: 'wood_light' }));
  },
  couch(x, z, w, face, tex) {
    tex = tex || 'fabric_green';
    return this.at(x, z, face || 's', () => {
      this.box(0, 0, 0.05, w, 0.45, 0.8, tex, { solid: false });
      this.box(0, 0, -0.4, w, 1.0, 0.25, tex, { solid: false });
      this.box(-w / 2 + 0.12, 0, 0, 0.25, 0.7, 0.9, tex, { solid: false });
      this.box(w / 2 - 0.12, 0, 0, 0.25, 0.7, 0.9, tex, { solid: false });
      this.solid(-w / 2, -0.5, w / 2, 0.45);
    });
  },
  armchair(x, z, face, tex) { return this.couch(x, z, 1.1, face, tex || 'fabric_grey'); },
  tvStand(x, z, face, screen) {
    return this.at(x, z, face || 's', () => {
      this.box(0, 0, 0, 1.1, 0.5, 0.55, 'wood_dark');
      this.box(0, 0.5, 0, 0.9, 0.75, 0.6, { sides: 'plastic_white', top: 'rubber', s: '@' + (screen || 'tv_front'), n: 'rubber', e: 'rubber', w: 'rubber' }, { fit: { s: true }, solid: false });
    });
  },
  tvCart(x, z, face, screen) {
    return this.at(x, z, face || 's', () => {
      this.box(0, 0.1, 0, 1.0, 0.06, 0.7, 'rubber', { solid: false }); this.box(0, 0.7, 0, 1.0, 0.06, 0.7, 'rubber', { solid: false });
      for (const [lx, lz] of [[-0.45, -0.3], [0.45, -0.3], [-0.45, 0.3], [0.45, 0.3]]) this.box(lx, 0, lz, 0.05, 0.76, 0.05, 'metal', { solid: false, top: false });
      this.box(0, 0.76, 0, 0.85, 0.72, 0.6, { sides: 'rubber', s: '@' + (screen || 'tv_front') }, { fit: { s: true }, solid: false });
      this.solid(-0.5, -0.35, 0.5, 0.35);
    });
  },
  lamp(x, z, h, lit) {
    h = h || 1.6;
    this.cyl(x, 0, z, 0.05, h, 'metal', { sides: 4, solid: false });
    this.cyl(x, h - 0.1, z, 0.28, 0.35, 'plastic_yellow', { sides: 6, solid: false, bright: lit ? 1.6 : 1, lit: !lit });
    this.solidCircle(x, z, 0.2);
    return this;
  },
  desk(x, z, face, w, tex) {
    w = w || 1.4; tex = tex || 'wood';
    return this.at(x, z, face || 's', () => {
      this.box(0, 0.72, 0, w, 0.06, 0.7, tex, { solid: false });
      this.box(w / 2 - 0.25, 0, 0, 0.45, 0.72, 0.65, { sides: tex, s: '@drawers_front', top: tex }, { fit: { s: true }, solid: false });
      this.box(-w / 2 + 0.05, 0, 0, 0.08, 0.72, 0.65, tex, { solid: false });
      this.solid(-w / 2, -0.35, w / 2, 0.35);
    });
  },
  schoolDesk(x, z, face) {
    return this.at(x, z, face || 's', () => {
      this.box(0, 0.68, 0.1, 0.8, 0.05, 0.55, 'wood_light', { solid: false });
      this.box(0, 0.4, -0.35, 0.6, 0.05, 0.45, 'plastic_green', { solid: false });
      this.box(0, 0.45, -0.58, 0.6, 0.5, 0.05, 'plastic_green', { solid: false });
      for (const [lx, lz] of [[-0.35, 0.3], [0.35, 0.3], [-0.25, -0.5], [0.25, -0.5]]) this.box(lx, 0, lz, 0.05, lz > 0 ? 0.68 : 0.4, 0.05, 'metal', { solid: false, top: false });
      this.solid(-0.4, -0.6, 0.4, 0.4);
    });
  },
  // aquarium tank. returns world-space volume {x0,x1,y0,y1,z0,z1} for fish
  tank(x, z, w, h, d, face, o) {
    o = o || {};
    let vol = null;
    this.at(x, z, face || 's', () => {
      const baseH = o.baseH == null ? 0.6 : o.baseH;
      this.box(0, 0, 0, w + 0.3, baseH, d + 0.3, { top: 'rubber', sides: 'wall_navy' }, { solid: false });
      const y0 = baseH, y1 = baseH + h;
      // back panel with painted backdrop
      this.quad('@' + (o.back || 'tank_back_reef'), [[-w / 2, y0, -d / 2], [w / 2, y0, -d / 2], [w / 2, y1, -d / 2], [-w / 2, y1, -d / 2]], null, { lit: false, bright: o.dark ? 0.6 : 1.1 });
      // side panels (dark, inward & outward)
      this.quad('wall_navy', [[-w / 2, y0, d / 2], [-w / 2, y0, -d / 2], [-w / 2, y1, -d / 2], [-w / 2, y1, d / 2]], [[0, 1], [1, 1], [1, 0], [0, 0]], {});
      this.quad('wall_navy', [[w / 2, y0, -d / 2], [w / 2, y0, d / 2], [w / 2, y1, d / 2], [w / 2, y1, -d / 2]], [[0, 1], [1, 1], [1, 0], [0, 0]], {});
      this.quad('water_tank', [[-w / 2, y0, d / 2], [-w / 2, y0, -d / 2], [-w / 2, y1, -d / 2], [-w / 2, y1, d / 2]], [[0, 1], [1, 1], [1, 0], [0, 0]], { lit: false, bright: 0.8 });
      this.quad('water_tank', [[w / 2, y0, -d / 2], [w / 2, y0, d / 2], [w / 2, y1, d / 2], [w / 2, y1, -d / 2]], [[0, 1], [1, 1], [1, 0], [0, 0]], { lit: false, bright: 0.8 });
      // gravel
      this.box(0, y0, 0, w, 0.12, d, o.floor || 'sand', { solid: false, lit: false });
      if (o.decor) this.decal(o.decor, 0, y0 + 0.1, -d / 2 + 0.2, Math.min(w * 0.9, 2.4), 1.2, 's', { lit: false, off: 0 });
      // frame on top
      this.box(0, y1, 0, w + 0.3, 0.25, d + 0.3, { top: 'rubber', sides: 'wall_navy' }, { solid: false });
      // glass front + water top (transparent)
      if (!o.noGlass) this.quad('glass', [[-w / 2, y0, d / 2], [w / 2, y0, d / 2], [w / 2, y1, d / 2], [-w / 2, y1, d / 2]], [[0, 1], [1, 1], [1, 0], [0, 0]], { blend: true, alpha: o.dirty ? 0.45 : 0.22, lit: false, color: o.glassColor || '#c8e8ff' });
      this.plane('water_tank', [-w / 2, y1 - 0.15, d / 2], [1, 0, 0], [0, 0, -1], w, d, { blend: true, alpha: 0.55, lit: false, scroll: [0.05, 0.02], tile: 2, sub: 99 });
      this.solid(-w / 2 - 0.15, -d / 2 - 0.15, w / 2 + 0.15, d / 2 + 0.15);
      const a = this.tp(-w / 2 + 0.2, y0 + 0.2, -d / 2 + 0.15), b = this.tp(w / 2 - 0.2, y1 - 0.3, d / 2 - 0.1);
      vol = { x0: Math.min(a[0], b[0]), x1: Math.max(a[0], b[0]), y0: y0 + 0.25, y1: y1 - 0.35, z0: Math.min(a[2], b[2]), z1: Math.max(a[2], b[2]), front: this.tn(0, 0, 1) };
    });
    return vol;
  },
  tree(x, z, type, o) {
    const t = type || 'tree_round';
    const sz = { tree_round: [3.6, 4.8], tree_pine: [2.4, 5.0], tree_dead: [3.6, 4.8], bush: [2.2, 1.35] }[t] || [3, 4];
    this.billboard(t, x, z, sz[0] * ((o && o.s) || 1), sz[1] * ((o && o.s) || 1), { solidR: t === 'bush' ? 0.7 : 0.35 });
    return this;
  },
  lampPost(x, z, lit) {
    this.cyl(x, 0, z, 0.08, 3.6, 'metal', { sides: 4, solid: false });
    this.box(x, 3.5, z, 0.45, 0.3, 0.45, { top: 'metal', sides: lit ? 'plastic_yellow' : 'glass' }, { solid: false, lit: !lit, bright: lit ? 1.7 : 1 });
    this.solidCircle(x, z, 0.15);
    if (lit) this.light(x, 3.2, z, 7, '#ffd890', 0.9);
    return this;
  },
  bench(x, z, face) {
    return this.at(x, z, face || 's', () => {
      this.box(0, 0.42, 0, 1.8, 0.07, 0.45, 'wood', { solid: false });
      this.box(0, 0.5, -0.24, 1.8, 0.45, 0.06, 'wood', { solid: false });
      this.box(-0.8, 0, 0, 0.08, 0.42, 0.4, 'metal', { solid: false, top: false }); this.box(0.8, 0, 0, 0.08, 0.42, 0.4, 'metal', { solid: false, top: false });
      this.solid(-0.9, -0.3, 0.9, 0.25);
    });
  },
  car(x, z, face, color) {
    const c = color || 'plastic_red';
    return this.at(x, z, face || 's', () => {
      this.box(0, 0.3, 0, 1.8, 0.7, 4.0, c, { solid: false });
      this.box(0, 1.0, 0.2, 1.6, 0.6, 2.1, { sides: 'glass_dark', top: c }, { solid: false });
      for (const [lx, lz] of [[-0.9, -1.3], [0.9, -1.3], [-0.9, 1.3], [0.9, 1.3]]) this.cyl(lx, 0, lz, 0.32, 0.25, 'rubber', { sides: 6, solid: false, cap: true });
      this.box(-0.55, 0.55, 2.01, 0.3, 0.18, 0.02, 'plastic_yellow', { solid: false, top: false }); this.box(0.55, 0.55, 2.01, 0.3, 0.18, 0.02, 'plastic_yellow', { solid: false, top: false });
      this.solid(-0.95, -2.05, 0.95, 2.05);
    });
  },
  mailbox(x, z, face, label) {
    return this.at(x, z, face || 's', () => {
      this.box(0, 0, 0, 0.1, 1.0, 0.1, 'wood', { solid: false });
      this.box(0, 1.0, 0, 0.35, 0.35, 0.55, 'plastic_blue', { solid: false });
      if (label) this.decal(label, 0.18, 1.05, 0, 0.5, 0.18, 'e', { off: 0.01 });
      this.solidCircle(0, 0, 0.25);
    });
  },
  trashcan(x, z, tex) { this.cyl(x, 0, z, 0.35, 0.95, tex || 'metal', { sides: 8 }); return this; },
  hydrant(x, z) { this.cyl(x, 0, z, 0.16, 0.7, 'plastic_red', { sides: 6 }); this.box(x, 0.4, z, 0.5, 0.12, 0.12, 'plastic_red', { solid: false }); return this; },
  // repeating flat fence from (x0,z0) to (x1,z1) (axis aligned)
  fence(x0, z0, x1, z1, o) {
    o = o || {};
    const region = o.region || 'fence_picket', h = o.h || 1.0, seg = o.seg || 2;
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / seg));
    const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0);
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n;
      const ax = lerp(x0, x1, t0), bx = lerp(x0, x1, t1), az = lerp(z0, z1, t0), bz = lerp(z0, z1, t1);
      if (o.skip && o.skip(i)) continue;
      if (alongX) this.decal(region, (ax + bx) / 2, 0, az, Math.abs(bx - ax), h, 's', { off: 0, twoSided: true });
      else this.decal(region, ax, 0, (az + bz) / 2, Math.abs(bz - az), h, 'e', { off: 0, twoSided: true });
    }
    if (o.solid !== false) {
      if (alongX) this.solid(Math.min(x0, x1), z0 - 0.15, Math.max(x0, x1), z0 + 0.15);
      else this.solid(x0 - 0.15, Math.min(z0, z1), x0 + 0.15, Math.max(z0, z1));
    }
    return this;
  },
  hedge(x0, z0, x1, z1, h) { this.box((x0 + x1) / 2, 0, (z0 + z1) / 2, Math.abs(x1 - x0), h || 1.2, Math.abs(z1 - z0), 'hedge'); return this; },
  streetSign(x, z, region, face) {
    this.cyl(x, 0, z, 0.05, 2.6, 'metal', { sides: 4, solid: false });
    this.decal(region, x, 2.3, z, 1.4, 0.35, face || 's', { off: 0, twoSided: true });
    this.solidCircle(x, z, 0.12);
    return this;
  },
  postSign(x, z, region, w, h, face, o) {
    const y = (o && o.y) || 1.0;
    this.box(x - w / 2 + 0.1, 0, z, 0.1, y + h, 0.1, 'wood', { solid: false }); this.box(x + w / 2 - 0.1, 0, z, 0.1, y + h, 0.1, 'wood', { solid: false });
    this.decal(region, x, y, z, w, h, face || 's', { off: 0.06, twoSided: true });
    this.solid(x - w / 2, z - 0.15, x + w / 2, z + 0.15);
    return this;
  },
  swingSet(x, z, face, o) {
    o = o || {};
    const seats = [];
    this.at(x, z, face || 's', () => {
      const W = 3.2, H = 2.4;
      for (const sx of [-W / 2, W / 2]) {
        this.quad('plastic_red', [[sx - 0.06, 0, 0.8], [sx + 0.06, 0, 0.8], [sx + 0.06, H, 0], [sx - 0.06, H, 0]], [[0, 1], [1, 1], [1, 0], [0, 0]], {});
        this.quad('plastic_red', [[sx + 0.06, 0, -0.8], [sx - 0.06, 0, -0.8], [sx - 0.06, H, 0], [sx + 0.06, H, 0]], [[0, 1], [1, 1], [1, 0], [0, 0]], {});
        this.quad('plastic_red', [[sx - 0.06, 0, -0.8], [sx - 0.06, 0, 0.8], [sx - 0.06, H, 0], [sx - 0.06, H, 0]], [[0, 1], [1, 1], [1, 0], [0, 0]], {});
        this.solid(sx - 0.2, -0.9, sx + 0.2, 0.9);
      }
      this.box(0, H, 0, W + 0.2, 0.1, 0.1, 'metal', { solid: false });
      const n = o.seats == null ? 2 : o.seats;
      for (let i = 0; i < n; i++) seats.push({ p: this.tp(-0.8 + i * 1.6, H, 0), a: this.T.a });
    });
    for (const s of seats) {
      const e = { type: 'swing', x: s.p[0], y: s.p[1], z: s.p[2], a: s.a, t: Math.random() * 3, amp: o.moving ? 0.25 : 0.0, id: o.id };
      this.ent(e);
    }
    return this;
  },
  slide(x, z, face) {
    return this.at(x, z, face || 's', () => {
      this.box(0, 0, -1.2, 0.8, 1.8, 0.8, { top: 'wood', sides: 'plastic_yellow' });
      this.quad('plastic_blue', [[-0.4, 0, 1.6], [0.4, 0, 1.6], [0.4, 1.8, -0.8], [-0.4, 1.8, -0.8]], [[0, 1], [1, 1], [1, 0], [0, 0]], {});
      this.quad('plastic_blue', [[0.4, 0, 1.6], [-0.4, 0, 1.6], [-0.4, 1.8, -0.8], [0.4, 1.8, -0.8]], [[0, 1], [1, 1], [1, 0], [0, 0]], {});
      this.solid(-0.5, -1.7, 0.5, 1.6);
    });
  },
  sandbox(x, z, w, d) {
    this.box(x, 0, z - d / 2, w, 0.3, 0.2, 'wood'); this.box(x, 0, z + d / 2, w, 0.3, 0.2, 'wood');
    this.box(x - w / 2, 0, z, 0.2, 0.3, d, 'wood'); this.box(x + w / 2, 0, z, 0.2, 0.3, d, 'wood');
    this.floor(x - w / 2 + 0.1, z - d / 2 + 0.1, x + w / 2 - 0.1, z + d / 2 - 0.1, 'sand', { y: 0.15 });
    return this;
  },
  movingBox(x, z, s, rot) {
    s = s || 0.6;
    return this.at(x, z, rot || 0, () => this.box(0, 0, 0, s, s * 0.85, s, { top: '@box_moving', sides: 'cardboard' }, { fit: { top: true } }));
  },
  pew(x, z, w, face) {
    return this.at(x, z, face || 's', () => {
      this.box(0, 0.42, 0, w, 0.08, 0.5, 'wood_dark', { solid: false });
      this.box(0, 0, -0.25, w, 1.0, 0.08, 'wood_dark', { solid: false });
      this.box(-w / 2, 0, 0, 0.08, 0.9, 0.55, 'wood_dark', { solid: false }); this.box(w / 2, 0, 0, 0.08, 0.9, 0.55, 'wood_dark', { solid: false });
      this.solid(-w / 2, -0.3, w / 2, 0.28);
    });
  },
  pumpMachine(x, z, face) {
    return this.at(x, z, face || 's', () => {
      this.box(0, 0, 0, 1.6, 0.3, 1.2, 'concrete_dark');
      this.cyl(0, 0.3, 0, 0.5, 1.2, 'metal', { sides: 8, solid: false });
      this.box(0.8, 0.5, 0, 0.8, 0.5, 0.5, 'rust', { solid: false });
      this.cyl(0, 1.5, 0, 0.15, 2.0, 'metal', { sides: 6, solid: false });
      this.decal('gauge', 0, 1.0, 0.51, 0.3, 0.3, 's', { off: 0.01 });
    });
  },
  stairsDown(x, z, face, w, n) {
    n = n || 6; w = w || 1.6;
    return this.at(x, z, face || 's', () => {
      for (let i = 0; i < n; i++) this.box(0, -0.25 * (i + 1), -0.4 * i, w, 0.25, 0.4, 'concrete', { solid: false });
    });
  },
  stairsUp(x, z, face, w, n, tex) {
    n = n || 8; w = w || 1.4;
    return this.at(x, z, face || 's', () => {
      for (let i = 0; i < n; i++) this.box(0, 0, -0.35 * i, w, 0.25 * (i + 1), 0.35, tex || 'wood', { solid: false });
      this.solid(-w / 2, -0.35 * n, w / 2, 0.2);
    });
  },
  gasPump(x, z, face) {
    return this.at(x, z, face || 's', () => { this.box(0, 0, 0, 0.8, 0.25, 0.8, 'concrete'); this.box(0, 0.25, 0, 0.6, 1.5, 0.5, { sides: 'plastic_red', s: '@gas_pump', n: '@gas_pump' }, { fit: { s: true, n: true }, solid: false }); });
  },
  penguinRocks(x, z, w, d) {
    const r = makeRng(Math.floor(x * 13 + z * 7));
    for (let i = 0; i < 6; i++) this.box(x - w / 2 + r() * w, 0, z - d / 2 + r() * d, 0.8 + r() * 1.4, 0.3 + r() * 0.9, 0.8 + r() * 1.2, 'rock_white', { solid: false });
    return this;
  },
  washer(x, z, face, dryer) { return this.at(x, z, face || 's', () => this.box(0, 0, 0, 0.8, 1.0, 0.75, { top: 'plastic_white', sides: 'plastic_white', s: '@' + (dryer ? 'dryer_front' : 'washer_front') }, { fit: { s: true } })); },
  lockerRow(x, z, face) { return this.at(x, z, face || 's', () => this.box(0, 0, 0, 2.4, 2.0, 0.5, { top: 'metal', sides: 'metal', s: '@lockers' }, { fit: { s: true } })); },
  pier(x0, z0, x1, z1, y) {
    y = y || 0.3;
    this.box((x0 + x1) / 2, 0, (z0 + z1) / 2, x1 - x0, y, z1 - z0, { top: 'pier', sides: 'wood_dark' }, { solid: false, tile: 2 });
    this.surface(x0, z0, x1, z1, 'wood', y);
    for (let z = z0; z < z1; z += 3) { this.cyl(x0, -1, z, 0.12, y + 1.6, 'wood_dark', { sides: 4, solid: false }); this.cyl(x1, -1, z, 0.12, y + 1.6, 'wood_dark', { sides: 4, solid: false }); }
    return this;
  },
});

Object.assign(MapBuilder.prototype, {
  // a thing lying in the world you can take. Disappears once taken.
  pickup(x, z, id, o) {
    o = o || {};
    const it = ITEMS[id];
    const region = o.region || ('icon_' + it.icon);
    const took = (st) => !!(st.found[id] || st.inv.includes(id) || st.flags['took_' + id]);
    const cond = (st) => !took(st) && (!o.cond || o.cond(st));
    const p = this.tp(x, 0, z);
    if (!o.hidden) this.ent({ type: 'sprite', region, x: p[0], y: o.y || 0.02, z: p[2], w: o.w || 0.42, h: o.h || 0.42, cond, sparkle: !o.secret, face: o.face });
    this.inter(x, z, {
      r: o.r || 1.0, y: (o.y || 0) + 0.8, cond, name: it.name,
      use: async (S) => {
        if (o.before) { const ok = await o.before(S); if (ok === false) return; }
        if (o.text) await S.say(null, o.text);
        await S.give(id, { silent: o.silent });
        S.flag('took_' + id);
        if (o.after) await o.after(S);
      },
    });
    return this;
  },
  // look at something: text may be a string, array, or fn(st) returning either (or null to skip)
  look(x, z, text, o) {
    o = o || {};
    this.inter(x, z, Object.assign({ r: o.r || 1.1, y: o.y || 1.2 }, o, {
      use: async (S) => {
        let t = typeof text === 'function' ? text(S.st, S) : text;
        if (t && typeof t.then === 'function') t = await t;
        if (!t) return;
        if (!Array.isArray(t)) t = [t];
        for (const line of t) {
          if (typeof line === 'function') await line(S);
          else await S.say(o.who || null, line);
        }
      },
    }));
    return this;
  },
});
