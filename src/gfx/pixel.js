'use strict';
// ---------------------------------------------------------------------------
// Pix — a tiny pixel buffer used to paint every texture and sprite by hand.
// No anti-aliasing anywhere. Hard pixels only.
// ---------------------------------------------------------------------------

class Pix {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Uint8ClampedArray(w * h * 4); }
  set(x, y, c) {
    x = Math.floor(x); y = Math.floor(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const v = hex(c), o = (y * this.w + x) * 4;
    if (v[3] === 0) { this.d[o + 3] = 0; return; }
    this.d[o] = v[0]; this.d[o + 1] = v[1]; this.d[o + 2] = v[2]; this.d[o + 3] = v[3] == null ? 255 : v[3];
  }
  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return [0, 0, 0, 0];
    const o = (y * this.w + x) * 4; return [this.d[o], this.d[o + 1], this.d[o + 2], this.d[o + 3]];
  }
  alpha(x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0; return this.d[(y * this.w + x) * 4 + 3]; }
  fill(c) { this.rect(0, 0, this.w, this.h, c); return this; }
  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
    return this;
  }
  frame(x, y, w, h, c) {
    for (let i = 0; i < w; i++) { this.set(x + i, y, c); this.set(x + i, y + h - 1, c); }
    for (let j = 0; j < h; j++) { this.set(x, y + j, c); this.set(x + w - 1, y + j, c); }
    return this;
  }
  ellipse(cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) {
      for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1.0) this.set(x, y, c);
      }
    }
    return this;
  }
  ring(cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) {
      for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = dx * dx + dy * dy;
        const dx2 = (x + 0.5 - cx) / (rx - 1), dy2 = (y + 0.5 - cy) / (ry - 1), d2 = dx2 * dx2 + dy2 * dy2;
        if (d <= 1.0 && d2 > 1.0) this.set(x, y, c);
      }
    }
    return this;
  }
  line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return this;
  }
  tri(ax, ay, bx, by, cx, cy, c) {
    const minx = Math.floor(Math.min(ax, bx, cx)), maxx = Math.ceil(Math.max(ax, bx, cx));
    const miny = Math.floor(Math.min(ay, by, cy)), maxy = Math.ceil(Math.max(ay, by, cy));
    const e = (x0, y0, x1, y1, x, y) => (x1 - x0) * (y - y0) - (y1 - y0) * (x - x0);
    for (let y = miny; y <= maxy; y++) for (let x = minx; x <= maxx; x++) {
      const px = x + 0.5, py = y + 0.5;
      const w0 = e(bx, by, cx, cy, px, py), w1 = e(cx, cy, ax, ay, px, py), w2 = e(ax, ay, bx, by, px, py);
      if ((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0)) this.set(x, y, c);
    }
    return this;
  }
  speckle(rng, colors, density, x0, y0, w, h) {
    x0 = x0 || 0; y0 = y0 || 0; w = w || this.w; h = h || this.h;
    const n = Math.floor(w * h * density);
    for (let i = 0; i < n; i++) this.set(x0 + rng.int(w), y0 + rng.int(h), rng.pick(colors));
    return this;
  }
  // wrap-around speckle for tileable textures
  outline(c, diag) {
    const src = new Uint8ClampedArray(this.d);
    const a = (x, y) => (x < 0 || y < 0 || x >= this.w || y >= this.h) ? 0 : src[(y * this.w + x) * 4 + 3];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (a(x, y)) continue;
      if (a(x - 1, y) || a(x + 1, y) || a(x, y - 1) || a(x, y + 1) || (diag && (a(x - 1, y - 1) || a(x + 1, y - 1) || a(x - 1, y + 1) || a(x + 1, y + 1)))) this.set(x, y, c);
    }
    return this;
  }
  flipH() {
    const p = new Pix(this.w, this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const s = (y * this.w + x) * 4, d = (y * this.w + (this.w - 1 - x)) * 4;
      p.d[d] = this.d[s]; p.d[d + 1] = this.d[s + 1]; p.d[d + 2] = this.d[s + 2]; p.d[d + 3] = this.d[s + 3];
    }
    return p;
  }
  blit(src, dx, dy, opts) {
    opts = opts || {};
    for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
      const sx = opts.flip ? src.w - 1 - x : x;
      const o = (y * src.w + sx) * 4;
      if (src.d[o + 3] < 128) continue;
      let c = [src.d[o], src.d[o + 1], src.d[o + 2], 255];
      if (opts.map) c = opts.map(c);
      if (opts.scale && opts.scale > 1) this.rect(dx + x * opts.scale, dy + y * opts.scale, opts.scale, opts.scale, c);
      else this.set(dx + x, dy + y, c);
    }
    return this;
  }
  // nearest-neighbour downscale/upscale into new buffer
  resized(w, h) {
    const p = new Pix(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const sx = Math.floor(x * this.w / w), sy = Math.floor(y * this.h / h);
      const s = (sy * this.w + sx) * 4, d = (y * w + x) * 4;
      p.d[d] = this.d[s]; p.d[d + 1] = this.d[s + 1]; p.d[d + 2] = this.d[s + 2]; p.d[d + 3] = this.d[s + 3];
    }
    return p;
  }
  map(fn) {
    for (let i = 0; i < this.d.length; i += 4) {
      if (!this.d[i + 3]) continue;
      const c = fn([this.d[i], this.d[i + 1], this.d[i + 2], this.d[i + 3]], (i / 4) % this.w, Math.floor(i / 4 / this.w));
      if (!c) continue;
      this.d[i] = c[0]; this.d[i + 1] = c[1]; this.d[i + 2] = c[2]; if (c[3] != null) this.d[i + 3] = c[3];
    }
    return this;
  }
  clone() { const p = new Pix(this.w, this.h); p.d.set(this.d); return p; }
  canvas() {
    const cv = document.createElement('canvas'); cv.width = this.w; cv.height = this.h;
    const ctx = cv.getContext('2d'); const img = ctx.createImageData(this.w, this.h); img.data.set(this.d); ctx.putImageData(img, 0, 0);
    return cv;
  }
  text(str, x, y, color, scale) { return Font.paint(this, str, x, y, color, scale); }
  textCenter(str, cx, y, color, scale) { const w = String(str).length * 6 * (scale || 1) - (scale || 1); return Font.paint(this, str, Math.round(cx - w / 2), y, color, scale); }
}

// --- Atlas: shelf packer onto one big canvas -------------------------------
const Atlas = (() => {
  const SIZE = 2048;
  let cv, ctx, x = 1, y = 1, rowH = 0;
  const regions = {};
  function init() {
    cv = document.createElement('canvas'); cv.width = SIZE; cv.height = SIZE;
    ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
  }
  function add(name, pix) {
    const src = pix instanceof Pix ? pix.canvas() : pix;
    const w = src.width, h = src.height;
    const ex = regions[name];
    if (ex && ex.w === w && ex.h === h) { ctx.clearRect(ex.x, ex.y, w, h); ctx.drawImage(src, ex.x, ex.y); ex.pix = pix instanceof Pix ? pix : null; dirty = true; return ex; }
    if (x + w + 2 > SIZE) { x = 1; y += rowH + 2; rowH = 0; }
    if (y + h + 2 > SIZE) { console.warn('atlas full'); return regions.__missing; }
    ctx.drawImage(src, x, y);
    const inset = 0.02;
    const r = { name, x, y, w, h, u0: (x + inset) / SIZE, v0: (y + inset) / SIZE, u1: (x + w - inset) / SIZE, v1: (y + h - inset) / SIZE, pix: pix instanceof Pix ? pix : null };
    regions[name] = r;
    x += w + 2; rowH = Math.max(rowH, h);
    return r;
  }
  // replace pixels of an existing region (same size)
  function replace(name, pix) {
    const r = regions[name]; if (!r) return add(name, pix);
    const src = pix instanceof Pix ? pix.canvas() : pix;
    ctx.clearRect(r.x, r.y, r.w, r.h); ctx.drawImage(src, r.x, r.y);
    r.pix = pix instanceof Pix ? pix : null;
    dirty = true;
    return r;
  }
  let dirty = false;
  function upload() { R.addTexture('atlas', cv, false); dirty = false; }
  function get(name) { return regions[name] || regions.__missing; }
  return { init, add, get, replace, upload, regions, get canvas() { return cv; }, get dirty() { return dirty; } };
})();
