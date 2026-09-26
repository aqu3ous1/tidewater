'use strict';
// ---------------------------------------------------------------------------
// MapBuilder — accumulates low-poly geometry into per-texture buckets, bakes
// per-vertex lighting (gouraud, like the old consoles did), and collects the
// colliders / doors / triggers / interactables for a location.
//
// Conventions: x = east, z = south, y = up. Camera usually looks north (-z).
// Faces are counter-clockwise when seen from their visible side.
// Texture spec: 'name' = tiling world texture; '@region' = atlas region (fit)
// ---------------------------------------------------------------------------

class MapBuilder {
  constructor(id) {
    this.id = id;
    this.buckets = new Map();
    this.verts = []; // pending vertices for lighting: {bucket, idx}
    this.colliders = [];
    this.inters = [];
    this.doors = [];
    this.spawns = {};
    this.cams = [];
    this.triggers = [];
    this.statics = [];
    this.ents = [];
    this.lights = [];
    this.surfaces = [];
    this.ambient = [1, 1, 1];
    this.sub = 3;
    this.xf = [{ x: 0, y: 0, z: 0, a: 0, c: 1, s: 0 }];
    this.bounds = null;
  }

  // ------------------------------------------------ transform stack
  get T() { return this.xf[this.xf.length - 1]; }
  push(x, z, face, y) {
    const t = this.T;
    const a = typeof face === 'number' ? face : ({ s: 0, e: Math.PI / 2, n: Math.PI, w: Math.PI * 1.5 }[face || 's'] || 0);
    const na = t.a + a;
    const [wx, wy, wz] = this.tp(x, y || 0, z);
    this.xf.push({ x: wx, y: wy, z: wz, a: na, c: Math.cos(na), s: Math.sin(na) });
    return this;
  }
  pop() { if (this.xf.length > 1) this.xf.pop(); return this; }
  at(x, z, face, fn, y) { this.push(x, z, face, y); try { fn(this); } finally { this.pop(); } return this; }
  tp(x, y, z) { const t = this.T; return [t.x + x * t.c + z * t.s, t.y + y, t.z - x * t.s + z * t.c]; }
  tn(x, y, z) { const t = this.T; return [x * t.c + z * t.s, y, -x * t.s + z * t.c]; }

  // ------------------------------------------------ textures / buckets
  _bucket(spec, opts) {
    let tex = spec, region = null;
    if (spec && spec[0] === '@') { tex = 'atlas'; region = Atlas.get(spec.slice(1)); }
    const blend = !!(opts && opts.blend);
    const scroll = opts && opts.scroll;
    const key = tex + (blend ? '|b' : '') + (scroll ? '|s' + scroll.join(',') : '') + (opts && opts.group ? '|g' + opts.group : '');
    let b = this.buckets.get(key);
    if (!b) { b = { tex, blend, scroll, data: [], lit: [], key, group: opts && opts.group }; this.buckets.set(key, b); }
    return { b, region };
  }

  // push one triangle list vertex (world coords)
  _v(b, p, uv, col, n, lit) {
    b.data.push(p[0], p[1], p[2], uv[0], uv[1], col[0], col[1], col[2], col[3]);
    b.lit.push({ p, n, lit, col: col.slice() });
  }

  // corners in LOCAL space: BL, BR, TR, TL. uvs: 4 pairs (world textures) or null for fit
  quad(spec, c, uvs, opts) {
    opts = opts || {};
    const { b, region } = this._bucket(spec, opts);
    const w = c.map((p) => this.tp(p[0], p[1], p[2]));
    const e1 = [w[1][0] - w[0][0], w[1][1] - w[0][1], w[1][2] - w[0][2]];
    const e2 = [w[3][0] - w[0][0], w[3][1] - w[0][1], w[3][2] - w[0][2]];
    let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const l = Math.hypot(n[0], n[1], n[2]) || 1; n = [n[0] / l, n[1] / l, n[2] / l];
    let uv = uvs;
    if (!uv || region) {
      const r = region || { u0: 0, v0: 0, u1: 1, v1: 1 };
      const f = opts.uvRect || [0, 0, 1, 1]; // sub-rect of region
      const u0 = lerp(r.u0, r.u1, f[0]), u1 = lerp(r.u0, r.u1, f[2]), v0 = lerp(r.v0, r.v1, f[1]), v1 = lerp(r.v0, r.v1, f[3]);
      uv = opts.flipU ? [[u1, v1], [u0, v1], [u0, v0], [u1, v0]] : [[u0, v1], [u1, v1], [u1, v0], [u0, v0]];
    }
    const col = opts.color ? hexf(opts.color).concat([opts.alpha == null ? 1 : opts.alpha]) : [1, 1, 1, opts.alpha == null ? 1 : opts.alpha];
    if (opts.bright) { col[0] *= opts.bright; col[1] *= opts.bright; col[2] *= opts.bright; }
    const lit = opts.lit !== false;
    const cols = opts.vcols || [col, col, col, col];
    this._v(b, w[0], uv[0], cols[0], n, lit); this._v(b, w[1], uv[1], cols[1], n, lit); this._v(b, w[2], uv[2], cols[2], n, lit);
    this._v(b, w[0], uv[0], cols[0], n, lit); this._v(b, w[2], uv[2], cols[2], n, lit); this._v(b, w[3], uv[3], cols[3], n, lit);
    return this;
  }
  tri(spec, a, bb, c, uvs, opts) {
    opts = opts || {};
    const { b, region } = this._bucket(spec, opts);
    const w = [a, bb, c].map((p) => this.tp(p[0], p[1], p[2]));
    const e1 = [w[1][0] - w[0][0], w[1][1] - w[0][1], w[1][2] - w[0][2]];
    const e2 = [w[2][0] - w[0][0], w[2][1] - w[0][1], w[2][2] - w[0][2]];
    let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const l = Math.hypot(n[0], n[1], n[2]) || 1; n = [n[0] / l, n[1] / l, n[2] / l];
    let uv = uvs;
    if (region) uv = uvs.map((q) => [lerp(region.u0, region.u1, q[0]), lerp(region.v0, region.v1, q[1])]);
    const col = opts.color ? hexf(opts.color).concat([1]) : [1, 1, 1, 1];
    for (let i = 0; i < 3; i++) this._v(b, w[i], uv[i], col, n, opts.lit !== false);
    return this;
  }

  // generic subdivided plane. o = BL corner (local), U = unit right, V = unit up, lengths
  plane(spec, o, U, V, lu, lv, opts) {
    opts = opts || {};
    const fit = opts.fit || (spec && spec[0] === '@');
    const sub = opts.sub || this.sub;
    const nu = fit && !opts.subFit ? 1 : Math.max(1, Math.ceil(lu / sub)), nv = fit && !opts.subFit ? 1 : Math.max(1, Math.ceil(lv / sub));
    const tile = opts.tile || 2, tu = opts.tileU || tile, tv = opts.tileV || tile;
    const uO = opts.uOff || 0, vO = opts.vOff || 0;
    const P = (s, t) => [o[0] + U[0] * s + V[0] * t, o[1] + U[1] * s + V[1] * t, o[2] + U[2] * s + V[2] * t];
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
      const s0 = lu * i / nu, s1 = lu * (i + 1) / nu, t0 = lv * j / nv, t1 = lv * (j + 1) / nv;
      const c = [P(s0, t0), P(s1, t0), P(s1, t1), P(s0, t1)];
      if (fit) {
        const f = [s0 / lu, 1 - t1 / lv, s1 / lu, 1 - t0 / lv];
        this.quad(spec, c, null, Object.assign({}, opts, { uvRect: f }));
      } else {
        const uv = [[(uO + s0) / tu, (vO - t0) / tv], [(uO + s1) / tu, (vO - t0) / tv], [(uO + s1) / tu, (vO - t1) / tv], [(uO + s0) / tu, (vO - t1) / tv]];
        this.quad(spec, c, uv, opts);
      }
    }
    return this;
  }

  // ------------------------------------------------ architecture
  floor(x0, z0, x1, z1, spec, opts) {
    opts = opts || {};
    const y = opts.y || 0;
    const [wx, , wz] = this.tp(x0, 0, z1);
    const wuv = opts.worldUV !== false;
    this.plane(spec, [x0, y, z1], [1, 0, 0], [0, 0, -1], x1 - x0, z1 - z0, Object.assign({}, opts, { uOff: wuv ? wx : 0, vOff: wuv ? wz : 0 }));
    if (opts.surface !== false && spec && spec[0] !== '@') this.surface(x0, z0, x1, z1, opts.surf || Tex.surf[spec] || 'hard', y);
    return this;
  }
  // flip vOff so the texture isn't mirrored: v should increase southward
  ceiling(x0, z0, x1, z1, y, spec, opts) {
    this.plane(spec, [x1, y, z1], [-1, 0, 0], [0, 0, -1], x1 - x0, z1 - z0, Object.assign({ tile: 2 }, opts || {}));
    return this;
  }
  // wall between two points on an axis; face = side it is visible from ('n','s','e','w')
  wall(x0, z0, x1, z1, h, spec, opts) {
    opts = opts || {};
    const y0 = opts.y0 || 0;
    const face = opts.face || 's';
    let o, U, len;
    if (face === 's') { o = [Math.min(x0, x1), y0, z0]; U = [1, 0, 0]; len = Math.abs(x1 - x0); }
    else if (face === 'n') { o = [Math.max(x0, x1), y0, z0]; U = [-1, 0, 0]; len = Math.abs(x1 - x0); }
    else if (face === 'e') { o = [x0, y0, Math.max(z0, z1)]; U = [0, 0, -1]; len = Math.abs(z1 - z0); }
    else { o = [x0, y0, Math.min(z0, z1)]; U = [0, 0, 1]; len = Math.abs(z1 - z0); }
    const wo = this.tp(o[0], o[1], o[2]), wu = this.tn(U[0], U[1], U[2]);
    const along = Math.abs(wu[0]) > 0.5 ? wo[0] * Math.sign(wu[0]) : wo[2] * Math.sign(wu[2]);
    this.plane(spec, o, U, [0, 1, 0], len, h, Object.assign({ uOff: along, vOff: -y0 }, opts));
    if (opts.solid) {
      const t = opts.thick || 0.3;
      if (face === 's' || face === 'n') this.solid(Math.min(x0, x1), z0 - t / 2, Math.max(x0, x1), z0 + t / 2);
      else this.solid(x0 - t / 2, Math.min(z0, z1), x0 + t / 2, Math.max(z0, z1));
    }
    return this;
  }

  // interior room with inward walls; doors: [{side, at, w, h}] cut gaps (for walkable openings)
  room(x0, z0, x1, z1, h, o) {
    o = o || {};
    const wt = (side) => (typeof o.wall === 'object' ? o.wall[side] : o.wall) || 'wall_cream';
    if (o.floor) this.floor(x0, z0, x1, z1, o.floor, { tile: o.floorTile || 2 });
    if (o.ceil) this.ceiling(x0, z0, x1, z1, h, o.ceil, { tile: o.ceilTile || 2 });
    const gaps = (side) => (o.gaps || []).filter((g) => g.side === side).map((g) => [g.at - (g.w || 1.6) / 2, g.at + (g.w || 1.6) / 2, g.h || 2.4]).sort((a, b) => a[0] - b[0]);
    const run = (side, a0, a1, mk) => {
      let cur = a0;
      for (const [g0, g1, gh] of gaps(side)) {
        if (g0 > cur) mk(cur, g0, 0, h, true);
        if (gh < h) mk(g0, g1, gh, h - gh, false);
        cur = g1;
      }
      if (cur < a1) mk(cur, a1, 0, h, true);
    };
    const wopts = (side, solid, y0) => Object.assign({ face: side, solid: solid && o.solid !== false, y0, tile: o.wallTile || 2 }, o.wallOpts || {});
    run('n', x0, x1, (a, b, y0, hh, solid) => this.wall(a, z0, b, z0, hh, wt('n'), wopts('s', solid, y0)));
    run('s', x0, x1, (a, b, y0, hh, solid) => this.wall(a, z1, b, z1, hh, wt('s'), wopts('n', solid, y0)));
    run('w', z0, z1, (a, b, y0, hh, solid) => this.wall(x0, a, x0, b, hh, wt('w'), wopts('e', solid, y0)));
    run('e', z0, z1, (a, b, y0, hh, solid) => this.wall(x1, a, x1, b, hh, wt('e'), wopts('w', solid, y0)));
    if (o.trim) { // baseboard strip
      const tc = o.trim;
      this.wall(x0, z0 + 0.02, x1, z0 + 0.02, 0.2, tc, { face: 's' }); this.wall(x0, z1 - 0.02, x1, z1 - 0.02, 0.2, tc, { face: 'n' });
      this.wall(x0 + 0.02, z0, x0 + 0.02, z1, 0.2, tc, { face: 'e' }); this.wall(x1 - 0.02, z0, x1 - 0.02, z1, 0.2, tc, { face: 'w' });
    }
    return this;
  }

  // box centered at x,z with bottom at y. tex: spec or {top,bottom,n,s,e,w,sides}
  box(x, y, z, w, h, d, tex, opts) {
    opts = opts || {};
    // a face set to false in the texture object is left off (e.g. { sides: 'wood', top: false })
    const t = (f) => (typeof tex === 'object' ? (tex[f] === false ? null : (tex[f] || tex.sides || tex.all)) : tex);
    const x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2, y1 = y + h;
    const fit = opts.fit;
    const fo = (f) => Object.assign({}, opts, { fit: fit === true || (fit && fit[f]), tile: opts.tile || 2, uOff: 0, vOff: 0, sub: opts.sub || 99 });
    if (opts.top !== false && t('top')) this.plane(t('top'), [x0, y1, z1], [1, 0, 0], [0, 0, -1], w, d, fo('top'));
    if (opts.bottom && t('bottom')) this.plane(t('bottom'), [x1, y, z1], [-1, 0, 0], [0, 0, -1], w, d, fo('bottom'));
    if (opts.front !== false && t('s')) this.plane(t('s'), [x0, y, z1], [1, 0, 0], [0, 1, 0], w, h, fo('s'));
    if (opts.back !== false && t('n')) this.plane(t('n'), [x1, y, z0], [-1, 0, 0], [0, 1, 0], w, h, fo('n'));
    if (t('e')) this.plane(t('e'), [x1, y, z1], [0, 0, -1], [0, 1, 0], d, h, fo('e'));
    if (t('w')) this.plane(t('w'), [x0, y, z0], [0, 0, 1], [0, 1, 0], d, h, fo('w'));
    if (opts.solid !== false && y < 1.2) this.solid(x0, z0, x1, z1);
    return this;
  }
  // low-poly cylinder (vertical)
  cyl(x, y, z, r, h, tex, opts) {
    opts = opts || {};
    const n = opts.sides || 8;
    const topTex = opts.topTex || tex;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * TAU, a1 = ((i + 1) / n) * TAU;
      const p0 = [x + Math.sin(a0) * r, z + Math.cos(a0) * r], p1 = [x + Math.sin(a1) * r, z + Math.cos(a1) * r];
      const uv = [[i / n * (opts.tileU || 2), 1], [(i + 1) / n * (opts.tileU || 2), 1], [(i + 1) / n * (opts.tileU || 2), 1 - h / (opts.tile || 2)], [i / n * (opts.tileU || 2), 1 - h / (opts.tile || 2)]];
      // front face goes counter-clockwise when seen from outside: p1 is to the right of p0 when looking from outside
      this.quad(tex, [[p0[0], y, p0[1]], [p1[0], y, p1[1]], [p1[0], y + h, p1[1]], [p0[0], y + h, p0[1]]], tex[0] === '@' ? null : uv, opts);
      if (opts.cap !== false) this.tri(topTex, [x, y + h, z], [p0[0], y + h, p0[1]], [p1[0], y + h, p1[1]], [[0.5, 0.5], [0.5 + Math.sin(a0) / 2, 0.5 + Math.cos(a0) / 2], [0.5 + Math.sin(a1) / 2, 0.5 + Math.cos(a1) / 2]], opts);
    }
    if (opts.solid !== false && y < 1.2) this.solidCircle(x, z, r);
    return this;
  }
  // gable roof over footprint, ridge along X (default) or Z
  gable(x0, z0, x1, z1, y, rh, tex, endTex, opts) {
    opts = opts || {};
    const ov = opts.overhang == null ? 0.4 : opts.overhang;
    const X0 = x0 - ov, X1 = x1 + ov, Z0 = z0 - ov, Z1 = z1 + ov;
    if (!opts.alongZ) {
      const zm = (z0 + z1) / 2;
      const slope = Math.hypot(zm - Z0, rh);
      // south slope (faces up/south): BL=(X0,y,Z1) BR=(X1,y,Z1) TR=(X1,y+rh,zm) TL=(X0,y+rh,zm)
      this.plane(tex, [X0, y, Z1], [1, 0, 0], [0, rh / slope, -(Z1 - zm) / slope], X1 - X0, slope, { tile: 2, uOff: 0, vOff: 0 });
      this.plane(tex, [X1, y, Z0], [-1, 0, 0], [0, rh / slope, (zm - Z0) / slope], X1 - X0, slope, { tile: 2, uOff: 0, vOff: 0 });
      const et = endTex || tex;
      this.tri(et, [x1, y, z1], [x1, y, z0], [x1, y + rh, zm], [[0, 1], [(z1 - z0) / 2, 1], [(z1 - z0) / 4, 1 - rh / 2]], {});
      this.tri(et, [x0, y, z0], [x0, y, z1], [x0, y + rh, zm], [[0, 1], [(z1 - z0) / 2, 1], [(z1 - z0) / 4, 1 - rh / 2]], {});
    } else {
      const xm = (x0 + x1) / 2;
      const slope = Math.hypot(xm - X0, rh);
      this.plane(tex, [X1, y, Z1], [0, 0, -1], [-(X1 - xm) / slope, rh / slope, 0], Z1 - Z0, slope, { tile: 2 });
      this.plane(tex, [X0, y, Z0], [0, 0, 1], [(xm - X0) / slope, rh / slope, 0], Z1 - Z0, slope, { tile: 2 });
      const et = endTex || tex;
      this.tri(et, [x0, y, z1], [x1, y, z1], [xm, y + rh, z1], [[0, 1], [(x1 - x0) / 2, 1], [(x1 - x0) / 4, 1 - rh / 2]], {});
      this.tri(et, [x1, y, z0], [x0, y, z0], [xm, y + rh, z0], [[0, 1], [(x1 - x0) / 2, 1], [(x1 - x0) / 4, 1 - rh / 2]], {});
    }
    return this;
  }

  // flat image on a vertical surface. (x,y,z) = bottom-center; face = direction it looks
  decal(region, x, y, z, w, h, face, opts) {
    opts = opts || {};
    face = face || 's';
    const off = opts.off == null ? 0.03 : opts.off;
    let c;
    if (face === 's') c = [[x - w / 2, y, z + off], [x + w / 2, y, z + off], [x + w / 2, y + h, z + off], [x - w / 2, y + h, z + off]];
    else if (face === 'n') c = [[x + w / 2, y, z - off], [x - w / 2, y, z - off], [x - w / 2, y + h, z - off], [x + w / 2, y + h, z - off]];
    else if (face === 'e') c = [[x + off, y, z + w / 2], [x + off, y, z - w / 2], [x + off, y + h, z - w / 2], [x + off, y + h, z + w / 2]];
    else c = [[x - off, y, z - w / 2], [x - off, y, z + w / 2], [x - off, y + h, z + w / 2], [x - off, y + h, z - w / 2]];
    this.quad('@' + region, c, null, opts);
    if (opts.twoSided) this.decal(region, x, y, z, w, h, { s: 'n', n: 's', e: 'w', w: 'e' }[face], Object.assign({}, opts, { twoSided: false, off: -off, flipU: false }));
    return this;
  }
  floorDecal(region, x, z, w, d, opts) {
    opts = opts || {};
    const y = opts.y == null ? 0.02 : opts.y;
    if (opts.rot) { this.at(x, z, opts.rot, () => this.quad('@' + region, [[-w / 2, y, d / 2], [w / 2, y, d / 2], [w / 2, y, -d / 2], [-w / 2, y, -d / 2]], null, opts)); return this; }
    this.quad('@' + region, [[x - w / 2, y, z + d / 2], [x + w / 2, y, z + d / 2], [x + w / 2, y, z - d / 2], [x - w / 2, y, z - d / 2]], null, opts);
    return this;
  }
  // camera-facing static sprite (trees, cutouts)
  billboard(region, x, z, w, h, opts) {
    const [wx, wy, wz] = this.tp(x, (opts && opts.y) || 0, z);
    this.statics.push({ region, x: wx, y: wy, z: wz, w, h, col: opts && opts.col, flip: opts && opts.flip, lean: opts && opts.lean, id: opts && opts.id, cond: opts && opts.cond });
    if (opts && opts.solidR) this.solidCircle(x, z, opts.solidR);
    return this;
  }
  // a flat cut-out standing in the world but NOT facing the camera (2D prop in 3D space)
  cutout(region, x, z, w, h, face, opts) {
    this.decal(region, x, (opts && opts.y) || 0, z, w, h, face, Object.assign({ off: 0, twoSided: true }, opts || {}));
    return this;
  }

  // ------------------------------------------------ gameplay data
  solid(x0, z0, x1, z1, tag) {
    const a = this.tp(x0, 0, z0), b = this.tp(x1, 0, z1);
    this.colliders.push({ x0: Math.min(a[0], b[0]), z0: Math.min(a[2], b[2]), x1: Math.max(a[0], b[0]), z1: Math.max(a[2], b[2]), tag });
    return this;
  }
  solidCircle(x, z, r, tag) { const p = this.tp(x, 0, z); this.colliders.push({ cx: p[0], cz: p[2], r, tag }); return this; }
  surface(x0, z0, x1, z1, surf, y) {
    const a = this.tp(x0, 0, z0), b = this.tp(x1, 0, z1);
    this.surfaces.push({ x0: Math.min(a[0], b[0]), z0: Math.min(a[2], b[2]), x1: Math.max(a[0], b[0]), z1: Math.max(a[2], b[2]), surf, y: y || 0 });
  }
  spawn(name, x, z, face) {
    const p = this.tp(x, 0, z);
    const ang = typeof face === 'number' ? face : ({ n: 0, e: Math.PI / 2, s: Math.PI, w: -Math.PI / 2 }[face || 'n']);
    this.spawns[name] = { x: p[0], z: p[2], face: ang };
    return this;
  }
  // interactable. o: {r, name, cond(st), use: async (S) => {}, y (indicator height)}
  inter(x, z, o) { const p = this.tp(x, 0, z); this.inters.push(Object.assign({ x: p[0], z: p[2], r: 1.1, y: 1.2 }, o)); return this; }
  // door painted on a wall at x,z facing `face`; walking into it (or pressing A) uses it
  door(x, z, face, o) {
    o = o || {};
    const w = o.w || 1.4, h = o.h || 2.4;
    if (o.tex !== false) this.decal(o.tex || 'door_wood', x, o.y || 0, z, w, h, face, { lit: o.lit });
    const p = this.tp(x, 0, z);
    const fv = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] }[face];
    const d = { x: p[0] + fv[0] * 0.45, z: p[2] + fv[1] * 0.45, fx: fv[0], fz: fv[1], w, face };
    this.doors.push(Object.assign(d, o));
    // indoors, the way out is on the wall the camera looks through (so it's cut away): mark it on the floor
    if (face === 'n' && this.id !== 'town' && o.tex !== false && (o.to || o.use) && !o.noCue) this.exitCue(x, z, w, o);
    return this;
  }
  // a doormat on the threshold and daylight (or lamplight) spilling in from the doorway
  exitCue(x, z, w, o) {
    const st = this.st || {}, tod = st.tod;
    const mat = o.mat !== undefined ? o.mat : ['house', 'miller', 'kessler'].includes(this.id) ? (this.id === 'kessler' ? 'mat_dirty' : 'mat_welcome') : this.id === 'evanroom' ? null : 'mat_exit';
    if (mat) this.floorDecal(mat, x, z - 0.72, w + 0.35, (w + 0.35) * 0.5, { y: 0.028 });
    const light = o.spill || (this.id === 'evanroom' ? ['#f4dca0', 0.22] : tod === 'night' ? ['#9ab0e0', 0.2] : tod === 'evening' ? ['#ffb070', 0.34] : ['#fff2c8', 0.36]);
    const [c, a] = light, v = hexf(c), depth = o.spillDepth || 3.2, spread = 0.9;
    this.quad('light_white', [[x - w / 2, 0.035, z], [x + w / 2, 0.035, z], [x + w / 2 + spread, 0.035, z - depth], [x - w / 2 - spread, 0.035, z - depth]],
      [[0, 0], [1, 0], [1, 1], [0, 1]], { blend: true, lit: false, vcols: [v.concat([a]), v.concat([a]), v.concat([0]), v.concat([0])] });
    return this;
  }
  cam(x0, z0, x1, z1, cfg) { this.cams.push(Object.assign({ x0, z0, x1, z1 }, cfg)); return this; }
  trigger(x0, z0, x1, z1, fn, o) { this.triggers.push(Object.assign({ x0, z0, x1, z1, fn, once: true }, o || {})); return this; }
  light(x, y, z, r, color, k) { const p = this.tp(x, y, z); this.lights.push({ p, r, c: hexf(color || '#ffffff'), k: k == null ? 1 : k }); return this; }
  ent(e) { this.ents.push(e); return e; }

  // ------------------------------------------------ bake
  bake(env) {
    env = env || {};
    const amb = this.ambient;
    const sun = env.sun || [0.45, 0, 0.89];
    const sunK = env.sunK == null ? 0.17 : env.sunK;
    const parts = [];
    for (const b of this.buckets.values()) {
      const out = new Float32Array(b.data);
      for (let i = 0; i < b.lit.length; i++) {
        const v = b.lit[i];
        let lr = 1, lg = 1, lb = 1;
        if (v.lit) {
          const n = v.n;
          let f;
          if (n[1] > 0.7) f = 1.0; else if (n[1] < -0.7) f = 0.62; else f = 0.8 + sunK * (n[0] * sun[0] + n[2] * sun[2]) - (n[1] < 0 ? 0.1 : 0);
          lr = amb[0] * f; lg = amb[1] * f; lb = amb[2] * f;
          for (const L of this.lights) {
            const dx = L.p[0] - v.p[0], dy = L.p[1] - v.p[1], dz = L.p[2] - v.p[2];
            const d = Math.hypot(dx, dy, dz);
            if (d >= L.r) continue;
            let a = 1 - d / L.r; a *= a;
            const nd = d > 0.001 ? (n[0] * dx + n[1] * dy + n[2] * dz) / d : 1;
            a *= 0.45 + 0.55 * Math.max(0, nd);
            lr += L.c[0] * a * L.k; lg += L.c[1] * a * L.k; lb += L.c[2] * a * L.k;
          }
        }
        const o = i * 9 + 5;
        out[o] = Math.min(1, v.col[0] * lr * 0.5);
        out[o + 1] = Math.min(1, v.col[1] * lg * 0.5);
        out[o + 2] = Math.min(1, v.col[2] * lb * 0.5);
        out[o + 3] = v.col[3];
      }
      // centre for transparent sorting
      let cx = 0, cz = 0; const nv = b.lit.length;
      for (const v of b.lit) { cx += v.p[0]; cz += v.p[2]; }
      // each vertex also carries its surface's plane, so the renderer can give it exact depth
      const planes = new Float32Array(nv * 4);
      for (let i = 0; i < nv; i++) { const v = b.lit[i], n = v.n; planes[i * 4] = n[0]; planes[i * 4 + 1] = n[1]; planes[i * 4 + 2] = n[2]; planes[i * 4 + 3] = n[0] * v.p[0] + n[1] * v.p[1] + n[2] * v.p[2]; }
      parts.push({ tex: b.tex, blend: b.blend, data: out, planes, scroll: b.scroll, cx: cx / Math.max(1, nv), cz: cz / Math.max(1, nv), key: b.key });
    }
    return R.createMesh(parts);
  }
}
