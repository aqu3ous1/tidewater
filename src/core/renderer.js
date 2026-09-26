'use strict';
// ---------------------------------------------------------------------------
// Renderer — a tiny WebGL1 renderer that behaves like 1999 hardware:
//  * renders into a 320x240 framebuffer, upscaled with nearest filtering
//  * vertex positions snap to a coarse screen grid (wobbly polygons)
//  * affine (non perspective-correct) texture mapping (swimming textures)
//  * 15-bit color with ordered dithering
//  * screen-door (dithered) transparency for sprites and ghosts
// ---------------------------------------------------------------------------

const R = (() => {
  const W = 320, H = 240;
  let gl, canvas;
  let fbo, fboTex, depthRb;
  let progWorld, progPost, progSky;
  let uiTex, uiCanvas, uiCtx, topTex, topCanvas, topCtx;
  let postBuf, skyBuf;
  let spriteBuf, spriteData, spriteCount = 0;
  const SPRITE_MAX = 6000; // quads
  const VSTRIDE = 9; // x y z u v r g b a  (plus, for meshes, a second buffer: the surface plane nx ny nz d)
  let trueDepth = false;
  const camR = [1, 0, 0], camU = [0, 1, 0], camF = [0, 0, -1], projZ = [0, 0];
  const textures = {};
  const view = Mat4.create(), proj = Mat4.create(), vp = Mat4.create(), ident = Mat4.create();
  const camPos = [0, 0, 0];
  let camRight = [1, 0, 0];
  let viewport = { x: 0, y: 0, w: 640, h: 480 };

  const settings = {
    snap: 1.0,      // 1 = normal jitter, >1 = more jitter (corruption)
    affine: 0.85,   // how much affine warping
    soft: true,     // composite-video softness
    wobble: 0,      // vertex swim (late game)
    sat: 1, grade: [1, 1, 1],
    fadeColor: [0, 0, 0], fade: 0,
    fog: [0.6, 0.7, 0.8], fogNear: 20, fogFar: 60,
    sky: null,      // [top, horizon] or null
    uvTime: 0,
    time: 0,
  };

  const VS_WORLD = `
precision highp float;
attribute vec3 aPos; attribute vec2 aUV; attribute vec4 aCol; attribute vec4 aPlane;
uniform mat4 uVP, uModel, uView;
uniform vec2 uSnap; uniform vec2 uUVOff; uniform float uWobble; uniform float uTime;
varying vec4 vCol; varying vec3 vUVA; varying vec2 vUVP; varying float vDepth; varying vec4 vPlane;
void main(){
  vec4 wp = uModel * vec4(aPos, 1.0);
  // the surface this vertex belongs to (normal, distance), in world space
  vec3 pw = (uModel * vec4(aPlane.xyz, 0.0)).xyz; float pl = length(pw);
  vPlane = pl > 0.0001 ? vec4(pw / pl, aPlane.w * pl + dot(pw / pl, uModel[3].xyz)) : vec4(0.0);
  if (uWobble > 0.0) {
    wp.xyz += uWobble * vec3(sin(uTime*1.3 + wp.y*2.1 + wp.z*0.7), sin(uTime*1.7 + wp.x*1.3)*0.4, cos(uTime*1.1 + wp.x*0.9 + wp.y));
  }
  vec4 p = uVP * wp;
  vDepth = -(uView * wp).z;
  if (p.w > 0.05) { vec2 n = p.xy / p.w; n = floor(n * uSnap + 0.5) / uSnap; p.xy = n * p.w; }
  vec2 uv = aUV + uUVOff;
  vUVA = vec3(uv * p.w, p.w);
  vUVP = uv;
  vCol = aCol;
  gl_Position = p;
}`;

  const FS_WORLD = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uTex; uniform vec3 uFogCol; uniform vec2 uFog; uniform float uAffine; uniform vec4 uTint; uniform float uBlend;
uniform vec3 uCamPos, uCamR, uCamU, uCamF; uniform vec2 uProjZ, uVpSize;
varying vec4 vCol; varying vec3 vUVA; varying vec2 vUVP; varying float vDepth; varying vec4 vPlane;
// Vertices are snapped to the pixel grid (the wobbly look), which tilts each triangle's depth a
// little. Surfaces laid over each other then fight. So the depth is worked out exactly: the ray
// through this pixel, hitting the true (unsnapped) surface.
float trueDepth(){
  float dz = gl_FragCoord.z;
  if (dot(vPlane.xyz, vPlane.xyz) > 0.25) {
    vec2 ndc = gl_FragCoord.xy / uVpSize * 2.0 - 1.0;
    vec3 dir = uCamF + ndc.x * uCamR + ndc.y * uCamU;
    float den = dot(vPlane.xyz, dir);
    if (abs(den) > 0.00001) {
      float t = (vPlane.w - dot(vPlane.xyz, uCamPos)) / den;
      if (t > 0.0) dz = clamp((uProjZ.y / t - uProjZ.x) * 0.5 + 0.5, 0.0, 1.0);
    }
  }
  return dz;
}
float bayer(vec2 f){ vec2 p = mod(floor(f), 4.0); vec2 a = mod(p, 2.0); vec2 b = floor(p / 2.0);
  float b1 = mod(2.0*a.x + 3.0*a.y, 4.0); float b2 = mod(2.0*b.x + 3.0*b.y, 4.0); return (b1*4.0 + b2 + 0.5) / 16.0; }
void main(){
  vec2 uv = mix(vUVP, vUVA.xy / vUVA.z, uAffine);
  vec4 t = texture2D(uTex, uv);
  vec4 c = t * vCol * uTint;
  c.rgb *= 2.0;
  if (uBlend < 0.5) { if (c.a < bayer(gl_FragCoord.xy)) discard; c.a = 1.0; }
  else if (c.a < 0.01) discard;
  float f = clamp((vDepth - uFog.x) / max(uFog.y - uFog.x, 0.001), 0.0, 1.0);
  c.rgb = mix(c.rgb, uFogCol, f);
  gl_FragColor = c;
#ifdef TRUE_DEPTH
  gl_FragDepthEXT = trueDepth();
#endif
}`;

  const VS_POST = `
attribute vec2 aPos; varying vec2 vUV;
void main(){ vUV = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

  const FS_POST = `
precision mediump float;
uniform sampler2D uScene, uUI, uTop; uniform vec2 uRes; uniform float uSoft; uniform vec3 uFade; uniform float uFadeA;
uniform float uSat; uniform vec3 uGrade;
varying vec2 vUV;
float bayer(vec2 f){ vec2 p = mod(floor(f), 4.0); vec2 a = mod(p, 2.0); vec2 b = floor(p / 2.0);
  float b1 = mod(2.0*a.x + 3.0*a.y, 4.0); float b2 = mod(2.0*b.x + 3.0*b.y, 4.0); return (b1*4.0 + b2 + 0.5) / 16.0; }
void main(){
  vec2 px = vec2(1.0 / uRes.x, 0.0);
  vec3 c = texture2D(uScene, vUV).rgb;
  if (uSoft > 0.0) {
    vec3 l = texture2D(uScene, vUV - px).rgb, r = texture2D(uScene, vUV + px).rgb;
    vec3 l2 = texture2D(uScene, vUV - px*2.0).rgb;
    vec3 blur = (l + 2.0*c + r) * 0.25;
    c = mix(c, blur, 0.55 * uSoft);
    // a little chroma bleed to the right, like a composite cable
    float y = dot(c, vec3(0.299, 0.587, 0.114));
    vec3 cb = mix(c, (l2 + l + c) / 3.0, 0.6);
    float yb = dot(cb, vec3(0.299, 0.587, 0.114));
    c = mix(c, vec3(y) + (cb - vec3(yb)), 0.35 * uSoft);
  }
  float g = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(g), c, uSat) * uGrade;
  vec2 fp = floor(vUV * uRes);
  float d = bayer(fp) - 0.5;
  c = clamp(floor(c * 31.0 + 0.5 + d * 0.9) / 31.0, 0.0, 1.0);
  vec4 ui = texture2D(uUI, vec2(vUV.x, 1.0 - vUV.y));
  c = mix(c, ui.rgb, ui.a);
  c = mix(c, uFade, uFadeA);
  // dialogs, menus and cards sit above the fade, so text shown in the dark can still be read
  vec4 top = texture2D(uTop, vec2(vUV.x, 1.0 - vUV.y));
  c = mix(c, top.rgb, top.a);
  gl_FragColor = vec4(c, 1.0);
}`;

  const VS_SKY = `
attribute vec2 aPos; varying float vY;
void main(){ vY = aPos.y * 0.5 + 0.5; gl_Position = vec4(aPos, 0.999, 1.0); }`;
  const FS_SKY = `
precision mediump float; uniform vec3 uTop, uHor; uniform float uHorizon; varying float vY;
void main(){ float t = smoothstep(uHorizon - 0.05, 1.0, vY); gl_FragColor = vec4(mix(uHor, uTop, t), 1.0); }`;

  function compile(vs, fs) {
    const mk = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src);
      return s;
    };
    const p = gl.createProgram();
    gl.attachShader(p, mk(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}, a = {};
    const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < nu; i++) { const info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
    const na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < na; i++) { const info = gl.getActiveAttrib(p, i); a[info.name] = gl.getAttribLocation(p, info.name); }
    return { p, u, a };
  }

  function init(cv) {
    canvas = cv;
    gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: true, preserveDrawingBuffer: false, powerPreference: 'default' });
    if (!gl) return false;
    const hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    trueDepth = !!(gl.getExtension('EXT_frag_depth') && hp && hp.precision > 0);
    progWorld = compile(VS_WORLD, (trueDepth ? '#extension GL_EXT_frag_depth : enable\n#define TRUE_DEPTH 1\n' : '') + FS_WORLD);
    progPost = compile(VS_POST, FS_POST);
    progSky = compile(VS_SKY, FS_SKY);

    fboTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fboTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    setTexParams(false, false);
    depthRb = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRb);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, W, H);
    fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTex, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, depthRb);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, W, H);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, null);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRb);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    uiCanvas = document.createElement('canvas');
    uiCanvas.width = W; uiCanvas.height = H;
    uiCtx = uiCanvas.getContext('2d');
    uiCtx.imageSmoothingEnabled = false;
    uiTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, uiTex);
    setTexParams(false, false);
    topCanvas = document.createElement('canvas');
    topCanvas.width = W; topCanvas.height = H;
    topCtx = topCanvas.getContext('2d');
    topCtx.imageSmoothingEnabled = false;
    topTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, topTex);
    setTexParams(false, false);

    postBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, postBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
    skyBuf = postBuf;

    spriteData = new Float32Array(SPRITE_MAX * 6 * VSTRIDE);
    spriteBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, spriteBuf);
    gl.bufferData(gl.ARRAY_BUFFER, spriteData.byteLength, gl.DYNAMIC_DRAW);

    // 1x1 white texture for untextured geometry
    addTexture('white', solidCanvas('#ffffff'), true);
    resize();
    return true;
  }

  function solidCanvas(c) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 4;
    const x = cv.getContext('2d'); x.fillStyle = c; x.fillRect(0, 0, 4, 4); return cv;
  }

  function setTexParams(repeat, linear) {
    const f = linear ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
    const w = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, w);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, w);
  }

  function addTexture(name, cv, repeat) {
    let t = textures[name];
    if (!t) { t = { tex: gl.createTexture(), w: cv.width, h: cv.height, name }; textures[name] = t; }
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
    setTexParams(!!repeat, false);
    t.w = cv.width; t.h = cv.height;
    return t;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.floor(window.innerWidth * dpr), ch = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    // letterbox to 4:3
    let vw = cw, vh = Math.floor(cw * 3 / 4);
    if (vh > ch) { vh = ch; vw = Math.floor(ch * 4 / 3); }
    viewport = { x: Math.floor((cw - vw) / 2), y: Math.floor((ch - vh) / 2), w: vw, h: vh };
  }

  // ---- Meshes -------------------------------------------------------------
  // parts: [{tex, blend, data(Float32Array)}] -> uploaded
  function createMesh(parts) {
    const mesh = { parts: [] };
    for (const p of parts) {
      if (!p.data.length) continue;
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      const arr = p.data instanceof Float32Array ? p.data : new Float32Array(p.data);
      gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
      let pbuf = null;
      if (p.planes) { pbuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pbuf); gl.bufferData(gl.ARRAY_BUFFER, p.planes, gl.STATIC_DRAW); }
      mesh.parts.push({ tex: p.tex, blend: !!p.blend, buf, pbuf, count: arr.length / VSTRIDE, scroll: p.scroll || null, cx: p.cx || 0, cz: p.cz || 0, untex: false, key: p.key });
    }
    return mesh;
  }
  function destroyMesh(mesh) {
    if (!mesh) return;
    for (const p of mesh.parts) { gl.deleteBuffer(p.buf); if (p.pbuf) gl.deleteBuffer(p.pbuf); }
    mesh.parts = [];
  }

  // ---- Frame --------------------------------------------------------------
  let camFov = 60;
  function setCamera(eye, target, fov, near, far) {
    camFov = fov || 60;
    Mat4.perspective(proj, camFov * Math.PI / 180, W / H, near || 0.2, far || 200);
    Mat4.lookAt(view, eye, target, [0, 1, 0]);
    Mat4.multiply(vp, proj, view);
    const ty = Math.tan(camFov * Math.PI / 360), tx = ty * W / H;
    camR[0] = view[0] * tx; camR[1] = view[4] * tx; camR[2] = view[8] * tx;
    camU[0] = view[1] * ty; camU[1] = view[5] * ty; camU[2] = view[9] * ty;
    camF[0] = -view[2]; camF[1] = -view[6]; camF[2] = -view[10];
    projZ[0] = proj[10]; projZ[1] = proj[14];
    camPos[0] = eye[0]; camPos[1] = eye[1]; camPos[2] = eye[2];
    // camera right vector on the XZ plane (for cylindrical billboards)
    const fx = target[0] - eye[0], fz = target[2] - eye[2];
    const l = Math.hypot(fx, fz) || 1;
    camRight = [-fz / l, 0, fx / l];
  }

  function bindWorldAttribs(buf, pbuf) {
    const a = progWorld.a;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(a.aPos); gl.vertexAttribPointer(a.aPos, 3, gl.FLOAT, false, VSTRIDE * 4, 0);
    gl.enableVertexAttribArray(a.aUV); gl.vertexAttribPointer(a.aUV, 2, gl.FLOAT, false, VSTRIDE * 4, 12);
    gl.enableVertexAttribArray(a.aCol); gl.vertexAttribPointer(a.aCol, 4, gl.FLOAT, false, VSTRIDE * 4, 20);
    if (a.aPlane == null) return;
    if (pbuf) { gl.bindBuffer(gl.ARRAY_BUFFER, pbuf); gl.enableVertexAttribArray(a.aPlane); gl.vertexAttribPointer(a.aPlane, 4, gl.FLOAT, false, 16, 0); }
    else { gl.disableVertexAttribArray(a.aPlane); gl.vertexAttrib4f(a.aPlane, 0, 0, 0, 0); } // sprites: plain depth
  }

  function beginFrame(clearColor) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, W, H);
    const c = clearColor || settings.fog;
    gl.clearColor(c[0], c[1], c[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    if (settings.sky) drawSky();
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.useProgram(progWorld.p);
    const u = progWorld.u;
    gl.uniformMatrix4fv(u.uVP, false, vp);
    gl.uniformMatrix4fv(u.uView, false, view);
    gl.uniformMatrix4fv(u.uModel, false, ident);
    if (u.uCamPos) { gl.uniform3fv(u.uCamPos, camPos); gl.uniform3fv(u.uCamR, camR); gl.uniform3fv(u.uCamU, camU); gl.uniform3fv(u.uCamF, camF); gl.uniform2fv(u.uProjZ, projZ); gl.uniform2f(u.uVpSize, W, H); }
    const s = 1 / settings.snap;
    gl.uniform2f(u.uSnap, 160 * s, 120 * s);
    gl.uniform1f(u.uAffine, settings.affine);
    gl.uniform1f(u.uWobble, settings.wobble);
    gl.uniform1f(u.uTime, settings.time);
    gl.uniform3fv(u.uFogCol, settings.fog);
    gl.uniform2f(u.uFog, settings.fogNear, settings.fogFar);
    gl.uniform4f(u.uTint, 1, 1, 1, 1);
    gl.uniform2f(u.uUVOff, 0, 0);
    gl.uniform1i(u.uTex, 0);
    gl.activeTexture(gl.TEXTURE0);
    spriteCount = 0;
  }

  function drawSky() {
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.useProgram(progSky.p);
    gl.bindBuffer(gl.ARRAY_BUFFER, skyBuf);
    gl.enableVertexAttribArray(progSky.a.aPos);
    gl.vertexAttribPointer(progSky.a.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(progSky.u.uTop, settings.sky[0]);
    gl.uniform3fv(progSky.u.uHor, settings.sky[1]);
    gl.uniform1f(progSky.u.uHorizon, settings.sky[2] != null ? settings.sky[2] : 0.45);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disableVertexAttribArray(progSky.a.aPos);
  }

  function texOf(name) { return textures[name] || textures.white; }

  // opts: {model, tint:[r,g,b,a], transparent: bool (only draw blend parts), untex, uvOff}
  function drawMesh(mesh, opts) {
    if (!mesh) return;
    opts = opts || {};
    const u = progWorld.u;
    gl.uniformMatrix4fv(u.uModel, false, opts.model || ident);
    if (opts.tint) gl.uniform4fv(u.uTint, opts.tint);
    const pass = opts.pass || 'opaque';
    for (const p of mesh.parts) {
      if (pass === 'opaque' && p.blend) continue;
      if (pass === 'blend' && !p.blend) continue;
      if (p.blend) { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); }
      gl.uniform1f(u.uBlend, p.blend ? 1 : 0);
      const untex = opts.untex || p.untex;
      gl.bindTexture(gl.TEXTURE_2D, untex ? textures.white.tex : texOf(p.tex).tex);
      if (p.scroll) gl.uniform2f(u.uUVOff, p.scroll[0] * settings.uvTime, p.scroll[1] * settings.uvTime);
      bindWorldAttribs(p.buf, p.pbuf);
      gl.drawArrays(gl.TRIANGLES, 0, p.count);
      if (p.scroll) gl.uniform2f(u.uUVOff, 0, 0);
      if (p.blend) { gl.disable(gl.BLEND); gl.depthMask(true); }
    }
    if (opts.tint) gl.uniform4f(u.uTint, 1, 1, 1, 1);
    if (opts.model) gl.uniformMatrix4fv(u.uModel, false, ident);
    if (progWorld.a.aPlane != null) { gl.disableVertexAttribArray(progWorld.a.aPlane); gl.vertexAttrib4f(progWorld.a.aPlane, 0, 0, 0, 0); }
  }

  // ---- Sprites (camera-facing, anchored at bottom center) -----------------
  // reg: atlas region {u0,v0,u1,v1}; w,h world units; col [r,g,b,a] (0.5 = neutral)
  function sprite(x, y, z, w, h, reg, flip, col, opts) {
    if (spriteCount >= SPRITE_MAX) return;
    let rx = camRight[0], rz = camRight[2];
    if (opts && opts.face != null) { rx = Math.cos(opts.face); rz = Math.sin(opts.face); }
    const hw = w / 2;
    const u0 = flip ? reg.u1 : reg.u0, u1 = flip ? reg.u0 : reg.u1;
    const c = col || [0.5, 0.5, 0.5, 1];
    const bl = [x - rx * hw, y, z - rz * hw], br = [x + rx * hw, y, z + rz * hw];
    let tl = [bl[0], y + h, bl[2]], tr = [br[0], y + h, br[2]];
    if (opts && opts.upright) {
      // looking down on an upright sprite squashes it (by the cosine of the angle): stretch it
      // back up so characters keep their proportions however high the camera is
      const dx = camPos[0] - x, dz = camPos[2] - z, dh = Math.hypot(dx, dz) || 1e-3;
      const th = Math.atan2(camPos[1] - (y + h * 0.5), dh);
      const k = 1 / Math.max(0.5, Math.cos(th));
      const hh = h * (1 + (k - 1) * opts.upright);
      tl = [bl[0], y + hh, bl[2]]; tr = [br[0], y + hh, br[2]];
    } else if (opts && opts.lean) { // lean top toward camera a touch so sprites read from above
      const dx = camPos[0] - x, dz = camPos[2] - z, l = Math.hypot(dx, dz) || 1;
      const k = opts.lean * h;
      tl = [tl[0] + dx / l * k, tl[1], tl[2] + dz / l * k]; tr = [tr[0] + dx / l * k, tr[1], tr[2] + dz / l * k];
    }
    let o = spriteCount * 6 * VSTRIDE;
    const put = (p, uu, vv) => {
      spriteData[o++] = p[0]; spriteData[o++] = p[1]; spriteData[o++] = p[2];
      spriteData[o++] = uu; spriteData[o++] = vv;
      spriteData[o++] = c[0]; spriteData[o++] = c[1]; spriteData[o++] = c[2]; spriteData[o++] = c[3];
    };
    put(bl, u0, reg.v1); put(br, u1, reg.v1); put(tr, u1, reg.v0);
    put(bl, u0, reg.v1); put(tr, u1, reg.v0); put(tl, u0, reg.v0);
    spriteCount++;
  }
  // horizontal quad on the ground (blob shadows, puddles)
  function spriteFlat(x, y, z, w, d, reg, col) {
    if (spriteCount >= SPRITE_MAX) return;
    const c = col || [0.5, 0.5, 0.5, 1];
    let o = spriteCount * 6 * VSTRIDE;
    const put = (px, pz, uu, vv) => {
      spriteData[o++] = px; spriteData[o++] = y; spriteData[o++] = pz; spriteData[o++] = uu; spriteData[o++] = vv;
      spriteData[o++] = c[0]; spriteData[o++] = c[1]; spriteData[o++] = c[2]; spriteData[o++] = c[3];
    };
    const x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2;
    put(x0, z1, reg.u0, reg.v1); put(x1, z1, reg.u1, reg.v1); put(x1, z0, reg.u1, reg.v0);
    put(x0, z1, reg.u0, reg.v1); put(x1, z0, reg.u1, reg.v0); put(x0, z0, reg.u0, reg.v0);
    spriteCount++;
  }
  function flushSprites(texName) {
    if (!spriteCount) return;
    const u = progWorld.u;
    gl.disable(gl.CULL_FACE);
    gl.uniform1f(u.uBlend, 0);
    gl.uniformMatrix4fv(u.uModel, false, ident);
    gl.bindTexture(gl.TEXTURE_2D, texOf(texName || 'atlas').tex);
    gl.bindBuffer(gl.ARRAY_BUFFER, spriteBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, spriteData.subarray(0, spriteCount * 6 * VSTRIDE));
    bindWorldAttribs(spriteBuf);
    gl.drawArrays(gl.TRIANGLES, 0, spriteCount * 6);
    spriteCount = 0;
    gl.enable(gl.CULL_FACE);
  }

  function endFrame() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(viewport.x, viewport.y, viewport.w, viewport.h);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    // upload UI
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, uiTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, uiCanvas);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, topTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, topCanvas);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fboTex);
    const lin = settings.soft ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, lin);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, lin);
    gl.useProgram(progPost.p);
    const u = progPost.u;
    gl.uniform1i(u.uScene, 0); gl.uniform1i(u.uUI, 1); gl.uniform1i(u.uTop, 2);
    gl.uniform2f(u.uRes, W, H);
    gl.uniform1f(u.uSoft, settings.soft ? 1 : 0);
    gl.uniform3fv(u.uFade, settings.fadeColor);
    gl.uniform1f(u.uFadeA, settings.fade);
    gl.uniform1f(u.uSat, settings.sat);
    gl.uniform3fv(u.uGrade, settings.grade);
    gl.bindBuffer(gl.ARRAY_BUFFER, postBuf);
    gl.enableVertexAttribArray(progPost.a.aPos);
    gl.vertexAttribPointer(progPost.a.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disableVertexAttribArray(progPost.a.aPos);
    gl.bindTexture(gl.TEXTURE_2D, fboTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  // project world point to UI pixel coords (for indicators)
  function project(x, y, z) {
    const m = vp;
    const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
    const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
    const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
    if (cw <= 0.01) return null;
    return [(cx / cw * 0.5 + 0.5) * W, (1 - (cy / cw * 0.5 + 0.5)) * H, cw];
  }

  return {
    W, H, init, resize, addTexture, createMesh, destroyMesh, setCamera, beginFrame, drawMesh, sprite, spriteFlat, flushSprites, endFrame,
    project, settings, textures, get ui() { return uiCtx; }, get top() { return topCtx; }, get uiCanvas() { return uiCanvas; }, get topCanvas() { return topCanvas; }, get gl() { return gl; },
    get camPos() { return camPos; }, VSTRIDE,
  };
})();
