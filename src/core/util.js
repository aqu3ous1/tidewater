'use strict';
// ---------------------------------------------------------------------------
// TIDEWATER — shared helpers (math, rng, small matrix library)
// ---------------------------------------------------------------------------

const TAU = Math.PI * 2;

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function smoothstep(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
function angDiff(a, b) { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; }
function dist2(ax, az, bx, bz) { const dx = ax - bx, dz = az - bz; return dx * dx + dz * dz; }

// mulberry32 — deterministic textures/sprites so every "disc" looks the same.
function makeRng(seed) {
  let a = seed >>> 0;
  const r = function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.int = (n) => Math.floor(r() * n);
  r.range = (a, b) => a + r() * (b - a);
  r.pick = (arr) => arr[Math.floor(r() * arr.length)];
  return r;
}

const _hexCache = {};
function hex(c) {
  if (Array.isArray(c)) return c;
  if (_hexCache[c]) return _hexCache[c];
  const m = /^rgba?\(([^)]*)\)$/.exec(c);
  if (m) {
    const p = m[1].split(',').map(Number);
    return (_hexCache[c] = [p[0], p[1], p[2], p.length > 3 ? Math.round(p[3] * 255) : 255]);
  }
  let s = c.replace('#', '');
  if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  const v = [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16), s.length >= 8 ? parseInt(s.slice(6, 8), 16) : 255];
  _hexCache[c] = v;
  return v;
}
function hexf(c) { const v = hex(c); return [v[0] / 255, v[1] / 255, v[2] / 255]; }
function shade(c, f) { const v = hex(c); return [clamp(Math.round(v[0] * f), 0, 255), clamp(Math.round(v[1] * f), 0, 255), clamp(Math.round(v[2] * f), 0, 255), v[3]]; }
function mixc(a, b, t) { a = hex(a); b = hex(b); return [Math.round(lerp(a[0], b[0], t)), Math.round(lerp(a[1], b[1], t)), Math.round(lerp(a[2], b[2], t)), 255]; }
function rgbStr(c) { c = hex(c); return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; }

// --- Mat4 (column-major, WebGL convention) ---------------------------------
const Mat4 = {
  create() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; },
  identity(m) { m.fill(0); m[0] = m[5] = m[10] = m[15] = 1; return m; },
  perspective(out, fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    out.fill(0);
    out[0] = f / aspect; out[5] = f;
    out[10] = (far + near) * nf; out[11] = -1;
    out[14] = 2 * far * near * nf;
    return out;
  },
  lookAt(out, e, c, up) {
    let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2];
    let l = Math.hypot(zx, zy, zz) || 1; zx /= l; zy /= l; zz /= l;
    let xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
    l = Math.hypot(xx, xy, xz) || 1; xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    out[0] = xx; out[1] = yx; out[2] = zx; out[3] = 0;
    out[4] = xy; out[5] = yy; out[6] = zy; out[7] = 0;
    out[8] = xz; out[9] = yz; out[10] = zz; out[11] = 0;
    out[12] = -(xx * e[0] + xy * e[1] + xz * e[2]);
    out[13] = -(yx * e[0] + yy * e[1] + yz * e[2]);
    out[14] = -(zx * e[0] + zy * e[1] + zz * e[2]);
    out[15] = 1;
    return out;
  },
  multiply(out, a, b) {
    const r = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        r[j * 4 + i] = a[i] * b[j * 4] + a[4 + i] * b[j * 4 + 1] + a[8 + i] * b[j * 4 + 2] + a[12 + i] * b[j * 4 + 3];
      }
    }
    out.set(r);
    return out;
  },
  // translation * rotY * rotX * rotZ * scale
  model(out, x, y, z, ry, rx, rz, sx, sy, sz) {
    ry = ry || 0; rx = rx || 0; rz = rz || 0;
    sx = sx == null ? 1 : sx; sy = sy == null ? sx : sy; sz = sz == null ? sx : sz;
    const cy = Math.cos(ry), sy_ = Math.sin(ry), cx = Math.cos(rx), sx_ = Math.sin(rx), cz = Math.cos(rz), sz_ = Math.sin(rz);
    // R = Ry * Rx * Rz
    const m00 = cy * cz + sy_ * sx_ * sz_, m01 = -cy * sz_ + sy_ * sx_ * cz, m02 = sy_ * cx;
    const m10 = cx * sz_, m11 = cx * cz, m12 = -sx_;
    const m20 = -sy_ * cz + cy * sx_ * sz_, m21 = sy_ * sz_ + cy * sx_ * cz, m22 = cy * cx;
    out[0] = m00 * sx; out[1] = m10 * sx; out[2] = m20 * sx; out[3] = 0;
    out[4] = m01 * sy; out[5] = m11 * sy; out[6] = m21 * sy; out[7] = 0;
    out[8] = m02 * sz; out[9] = m12 * sz; out[10] = m22 * sz; out[11] = 0;
    out[12] = x; out[13] = y; out[14] = z; out[15] = 1;
    return out;
  },
};

// Simple promise helpers for the script system
function deferred() { let res; const p = new Promise((r) => { res = r; }); p.resolve = res; return p; }

// Word wrap for the monospace bitmap font (width measured in characters)
function wrapText(text, maxChars) {
  const out = [];
  for (const para of String(text).split('\n')) {
    const words = para.split(' ');
    let line = '';
    for (const w of words) {
      if (!line.length) { line = w; continue; }
      if ((line + ' ' + w).length > maxChars) { out.push(line); line = w; }
      else line += ' ' + w;
    }
    out.push(line);
  }
  return out;
}

function fmtTime(sec) {
  sec = Math.floor(sec);
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}
