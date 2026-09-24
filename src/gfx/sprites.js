'use strict';
// ---------------------------------------------------------------------------
// Sprites — characters, animals and plants, painted pixel by pixel.
// Characters: 3 directions (s = toward camera, n = away, e = right; west is
// e mirrored) x 3 frames (stand, step A, step B). Deliberately stiff.
// ---------------------------------------------------------------------------

const OUTLINE = '#1c1622';

const CHAR_DEFS = {
  walter: { h: 48, headW: 21, headH: 21, bodyW: 15, bodyH: 13, legH: 8, skin: '#e8b894', hair: '#cfcfc6', hairStyle: 'bald', glasses: true, mustache: '#d8d8d0',
    top: '#8e3b3b', topStyle: 'cardigan', inner: '#ece4cc', bottom: '#b7a079', shoes: '#553722', nose: true },
  dana: { h: 44, headW: 19, headH: 19, bodyW: 12, bodyH: 11, legH: 8, skin: '#f0c8a0', hair: '#6a3a22', hairStyle: 'pony', top: '#2f8a8a', topStyle: 'tag', bottom: '#3a3f5a', shoes: '#e8e8e8' },
  miller: { h: 42, headW: 19, headH: 19, bodyW: 13, bodyH: 11, legH: 6, skin: '#f0d2ba', hair: '#b7a9d2', hairStyle: 'bun', glasses: true, top: '#9a7ab8', topStyle: 'cardigan', inner: '#f0e8f0', skirt: '#6a5a7a', bottom: '#e8d8c8', shoes: '#4a3a3a', nose: true },
  hal: { h: 48, headW: 21, headH: 20, bodyW: 17, bodyH: 14, legH: 8, skin: '#e8b08a', hair: '#3a2a1a', hairStyle: 'short', mustache: '#3a2a1a', top: '#ecece4', topStyle: 'apron', apron: '#c84a3a', bottom: '#3a3a44', shoes: '#2a2222', nose: true },
  donna: { h: 44, headW: 19, headH: 19, bodyW: 12, bodyH: 11, legH: 8, skin: '#f0c4a4', hair: '#e8c060', hairStyle: 'bun', top: '#e89ab0', topStyle: 'apron', apron: '#f4f4f0', skirt: '#e89ab0', bottom: '#f0c4a4', shoes: '#f4f4f0' },
  priya: { h: 44, headW: 19, headH: 19, bodyW: 12, bodyH: 11, legH: 8, skin: '#b8845c', hair: '#1a1414', hairStyle: 'long', top: '#3a7a4a', topStyle: 'vest', inner: '#f0f0ea', bottom: '#3a3a4a', shoes: '#2a2a2a' },
  gus: { h: 48, headW: 21, headH: 20, bodyW: 16, bodyH: 14, legH: 8, skin: '#e0a888', hair: '#5a4a3a', hairStyle: 'cap', cap: '#c83a2a', beard: '#5a4a3a', top: '#4a5a7a', topStyle: 'plain', bottom: '#4a5a7a', shoes: '#2a2a2a', nose: true },
  okafor: { h: 46, headW: 20, headH: 20, bodyW: 13, bodyH: 12, legH: 8, skin: '#6e4632', hair: '#1a1414', hairStyle: 'curly', glasses: true, top: '#d8a040', topStyle: 'cardigan', inner: '#f4ece0', skirt: '#4a3a5a', bottom: '#6e4632', shoes: '#3a2a2a' },
  ray: { h: 46, headW: 20, headH: 20, bodyW: 15, bodyH: 13, legH: 8, skin: '#d8a888', hair: '#c8c8c0', hairStyle: 'hat', hat: '#8a8a5a', beard: '#d0d0c8', top: '#4a6a4a', topStyle: 'vest', inner: '#c8c0a8', bottom: '#5a5a4a', shoes: '#2a2a2a', nose: true },
  lou: { h: 46, headW: 20, headH: 20, bodyW: 14, bodyH: 12, legH: 8, skin: '#c89070', hair: '#3a2a1a', hairStyle: 'cap', cap: '#34467a', top: '#8aaad0', topStyle: 'bag', bag: '#6a4a2a', bottom: '#34467a', shoes: '#2a2a2a' },
  ellis: { h: 48, headW: 20, headH: 20, bodyW: 14, bodyH: 14, legH: 8, skin: '#e8c0a0', hair: '#8a8a88', hairStyle: 'short', glasses: true, top: '#2a2a32', topStyle: 'collar', bottom: '#2a2a32', shoes: '#1a1a1a', nose: true },
  mae: { h: 42, headW: 19, headH: 19, bodyW: 14, bodyH: 11, legH: 6, skin: '#f0c8a8', hair: '#c85a3a', hairStyle: 'curly', top: '#e8d85a', topStyle: 'plain', bottom: '#6a8ab0', shoes: '#f0f0f0' },
  bea: { h: 36, headW: 18, headH: 18, bodyW: 10, bodyH: 8, legH: 6, skin: '#f0c8a0', hair: '#e8b040', hairStyle: 'pigtails', top: '#e86a8a', topStyle: 'plain', skirt: '#6a8ad0', bottom: '#f0c8a0', shoes: '#e8e8e8', blush: true },
  tommy: { h: 36, headW: 18, headH: 18, bodyW: 10, bodyH: 8, legH: 6, skin: '#d8a070', hair: '#6a3a1a', hairStyle: 'short', top: '#4aa04a', topStyle: 'plain', bottom: '#3a5aa0', shoes: '#e8e8e8', blush: true },
  evan: { h: 37, headW: 18, headH: 18, bodyW: 10, bodyH: 9, legH: 6, skin: '#f0c8a0', hair: '#8a5a2a', hairStyle: 'messy', top: '#ecece4', topStyle: 'stripes', stripe: '#3a6ab8', bottom: '#5a6a8a', shoes: '#d83a32', backpack: '#3a7ad0', blush: true },
  visitor1: { h: 44, headW: 19, headH: 19, bodyW: 13, bodyH: 11, legH: 8, skin: '#e8c0a0', hair: '#8a4a2a', hairStyle: 'long', top: '#6a9ad8', topStyle: 'plain', bottom: '#e8e0d0', shoes: '#6a4a3a' },
  visitor2: { h: 35, headW: 18, headH: 18, bodyW: 10, bodyH: 8, legH: 5, skin: '#c89070', hair: '#e8c040', hairStyle: 'cap', cap: '#e8c040', top: '#c83a3a', topStyle: 'plain', bottom: '#3a5aa0', shoes: '#f0f0f0', blush: true },
  visitor3: { h: 47, headW: 20, headH: 20, bodyW: 15, bodyH: 13, legH: 8, skin: '#f0c8a8', hair: '#4a3a2a', hairStyle: 'short', glasses: true, top: '#8aa870', topStyle: 'bag', bag: '#2a2a2a', bottom: '#8a7a5a', shoes: '#4a3a2a', nose: true },
  toby: { h: 36, headW: 18, headH: 18, bodyW: 10, bodyH: 8, legH: 6, skin: '#f0d0b0', hair: '#d8b870', hairStyle: 'short', glasses: true, top: '#d88a3a', topStyle: 'plain', bottom: '#4a5a3a', shoes: '#6a4a2a', blush: true },
};

const HELMETS = {
  player: { brass: '#d9b85a', rim: '#a4843a', light: '#f2dc94', suit: '#3b62b5', sleeve: '#e6e2d4', boot: '#6a4a2a' },
  kaylee: { brass: '#e08ab0', rim: '#b0607e', light: '#f4bcd4', suit: '#8a4a9a', sleeve: '#f0e0e8', boot: '#5a3a4a' },
  marcus: { brass: '#6fb06a', rim: '#4a8446', light: '#a8d8a0', suit: '#3a5a3a', sleeve: '#e0e8d8', boot: '#3a3a2a' },
  newkid: { brass: '#e8843a', rim: '#b06028', light: '#f8b884', suit: '#7a3a2a', sleeve: '#f0e0d0', boot: '#4a2a1a' },
  pale: { brass: '#b8c4c8', rim: '#8a969a', light: '#dce4e8', suit: '#5a6a7a', sleeve: '#c8d0d8', boot: '#3a4048' },
};

const Sprites = (() => {
  const W = 32, H = 50;
  const sets = {}; // name -> {s:[r,r,r], n:[...], e:[...], w:[...]} (w = mirrored flag)

  // ---------------------------------------------------------------- humans
  function paintHuman(P, dir, frame, opts) {
    opts = opts || {};
    const p = new Pix(W, H);
    const cx = 16, footY = H - 1;
    const step = frame === 1 ? 1 : frame === 2 ? -1 : 0;
    const bob = frame === 0 ? 0 : 1;
    const legTop = footY - 2 - P.legH;
    const bodyTop = legTop - P.bodyH + bob;
    const hw = P.headW, hh = P.headH;
    const headCy = bodyTop - hh / 2 + 4;
    const bw = dir === 'e' ? P.bodyW - 4 : P.bodyW;
    const bx = Math.round(cx - bw / 2);
    const eyeCol = opts.ghost ? '#f4f8ff' : '#221a22';

    // --- legs & feet
    const legC = P.skirt ? P.bottom : P.bottom;
    if (dir === 'e') {
      if (step === 0) {
        p.rect(cx - 2, legTop, 4, P.legH, legC);
        p.rect(cx - 2, footY - 2, 6, 3, P.shoes);
      } else {
        const a = step === 1 ? 2 : -2;
        p.rect(cx - 2 - a, legTop, 3, P.legH, shade(legC, 0.85)); p.rect(cx - 2 - a, footY - 2, 5, 3, shade(P.shoes, 0.85));
        p.rect(cx - 1 + a, legTop, 3, P.legH, legC); p.rect(cx - 1 + a, footY - 2, 5, 3, P.shoes);
      }
    } else {
      const l1 = step === 1 ? 1 : 0, l2 = step === -1 ? 1 : 0;
      p.rect(cx - 4, legTop, 3, P.legH - l1, legC); p.rect(cx - 5, footY - 2 - l1, 4, 3, P.shoes);
      p.rect(cx + 1, legTop, 3, P.legH - l2, legC); p.rect(cx + 1, footY - 2 - l2, 4, 3, P.shoes);
    }
    // --- skirt
    if (P.skirt) {
      const sw = dir === 'e' ? bw + 2 : bw + 2, sh = Math.max(4, Math.floor(P.legH * 0.7));
      for (let j = 0; j < sh; j++) p.rect(Math.round(cx - sw / 2) - Math.floor(j / 3), legTop + j, sw + Math.floor(j / 3) * 2, 1, P.skirt);
    }
    // --- backpack behind (side view shows bump)
    if (P.backpack && dir === 'e') p.rect(bx - 4, bodyTop + 1, 5, P.bodyH - 2, P.backpack);
    // --- body
    p.rect(bx, bodyTop, bw, P.bodyH, P.top);
    p.set(bx, bodyTop, [0, 0, 0, 0]); p.set(bx + bw - 1, bodyTop, [0, 0, 0, 0]);
    switch (P.topStyle) {
      case 'cardigan':
        if (dir === 's') { p.rect(cx - 1, bodyTop, 3, P.bodyH, P.inner); p.set(cx - 2, bodyTop + 4, shade(P.top, 0.6)); p.set(cx - 2, bodyTop + 8, shade(P.top, 0.6)); }
        if (dir === 'e') p.rect(bx + bw - 2, bodyTop, 2, P.bodyH, P.inner);
        break;
      case 'vest':
        if (dir === 's') { p.rect(cx - 2, bodyTop, 5, P.bodyH, P.inner); }
        if (dir !== 'n') { p.rect(bx, bodyTop + 1, 1, P.bodyH - 1, shade(P.top, 0.8)); }
        break;
      case 'apron':
        if (dir !== 'n') p.rect(dir === 'e' ? bx + 2 : bx + 2, bodyTop + 3, dir === 'e' ? bw - 2 : bw - 4, P.bodyH - 2, P.apron);
        else p.rect(cx, bodyTop + 3, 1, 3, P.apron);
        break;
      case 'stripes':
        for (let y = bodyTop + 1; y < bodyTop + P.bodyH; y += 3) p.rect(bx, y, bw, 1, P.stripe);
        break;
      case 'collar':
        if (dir === 's') { p.rect(cx - 1, bodyTop, 3, 2, '#f4f4f4'); }
        if (dir === 'e') p.rect(bx + bw - 3, bodyTop, 2, 2, '#f4f4f4');
        break;
      case 'tag':
        if (dir === 's') { p.rect(bx + 2, bodyTop + 3, 3, 2, '#f4f4f0'); }
        break;
      case 'bag':
        if (dir === 's') { p.line(bx, bodyTop, bx + bw - 1, bodyTop + P.bodyH - 3, P.bag); p.rect(bx + bw - 3, bodyTop + P.bodyH - 5, 5, 6, P.bag); }
        if (dir === 'e') { p.rect(bx - 2, bodyTop + P.bodyH - 6, 6, 6, P.bag); }
        if (dir === 'n') { p.line(bx + bw - 1, bodyTop, bx, bodyTop + P.bodyH - 3, P.bag); p.rect(bx - 2, bodyTop + P.bodyH - 5, 5, 6, P.bag); }
        break;
      default: break;
    }
    if (P.backpack && dir === 's') { p.rect(bx + 1, bodyTop, 2, P.bodyH - 2, P.backpack); p.rect(bx + bw - 3, bodyTop, 2, P.bodyH - 2, P.backpack); }
    if (P.backpack && dir === 'n') { p.rect(bx, bodyTop + 1, bw, P.bodyH - 1, P.backpack); p.rect(bx + 2, bodyTop + 4, bw - 4, 3, shade(P.backpack, 0.8)); }
    // --- arms
    const armC = P.topStyle === 'apron' || P.topStyle === 'vest' || P.topStyle === 'tag' || P.topStyle === 'bag' ? P.top : P.top;
    const armLen = P.bodyH - 2;
    if (dir === 'e') {
      const sw = step * 2;
      p.rect(cx - 1 + sw, bodyTop + 2, 3, armLen - 2, shade(armC, 0.9));
      p.rect(cx - 1 + sw, bodyTop + armLen, 3, 2, P.skin);
    } else {
      const a1 = step === 1 ? -1 : 0, a2 = step === -1 ? -1 : 0;
      p.rect(bx - 2, bodyTop + 1 + a1, 2, armLen - 1, shade(armC, 0.9)); p.rect(bx - 2, bodyTop + armLen + a1, 2, 2, P.skin);
      p.rect(bx + bw, bodyTop + 1 + a2, 2, armLen - 1, shade(armC, 0.9)); p.rect(bx + bw, bodyTop + armLen + a2, 2, 2, P.skin);
    }
    // --- head
    const rx = hw / 2, ry = hh / 2, hcx = cx + (dir === 'e' ? 1 : 0);
    const hair = P.hair;
    const style = P.hairStyle;
    // hair behind head
    if (style === 'long' && dir !== 'e') p.rect(hcx - rx, headCy, hw, ry + 3, hair);
    if (style === 'long' && dir === 'e') p.rect(hcx - rx, headCy - 2, rx, ry + 5, hair);
    if (style === 'pony' && dir === 'e') p.ellipse(hcx - rx - 1, headCy + 2, 2.5, 4, hair);
    if (style === 'pony' && dir === 'n') p.rect(hcx - 1, headCy + ry - 2, 3, 5, hair);
    if (style === 'pigtails') { if (dir !== 'e') { p.ellipse(hcx - rx - 1, headCy + 1, 2.5, 3.5, hair); p.ellipse(hcx + rx + 1, headCy + 1, 2.5, 3.5, hair); } else p.ellipse(hcx - rx, headCy + 1, 2.5, 3.5, hair); }
    if (style === 'bun') p.ellipse(hcx + (dir === 'e' ? -3 : 0), headCy - ry - 1, 4, 3, hair);
    p.ellipse(hcx, headCy, rx, ry, P.skin);
    // hair on head
    const hairCap = (topFrac) => {
      for (let y = Math.floor(headCy - ry); y < headCy - ry + hh * topFrac; y++) {
        for (let x = Math.floor(hcx - rx); x <= Math.ceil(hcx + rx); x++) {
          const dx = (x + 0.5 - hcx) / rx, dy = (y + 0.5 - headCy) / ry;
          if (dx * dx + dy * dy <= 1) p.set(x, y, hair);
        }
      }
    };
    if (dir === 'n') {
      if (style === 'bald') { p.ellipse(hcx, headCy + 3, rx, ry - 4, hair); p.ellipse(hcx, headCy - 2, rx - 2, ry - 3, P.skin); }
      else if (style === 'cap' || style === 'hat') { p.ellipse(hcx, headCy, rx, ry, hair); }
      else p.ellipse(hcx, headCy, rx, ry, hair);
    } else if (dir === 's') {
      switch (style) {
        case 'bald':
          p.ellipse(hcx - rx + 1.5, headCy + 1, 2.5, 4, hair); p.ellipse(hcx + rx - 1.5, headCy + 1, 2.5, 4, hair);
          break;
        case 'short': case 'pony': case 'pigtails': case 'bun': hairCap(0.32); p.rect(hcx - rx, headCy - 2, 2, 4, hair); p.rect(hcx + rx - 2, headCy - 2, 2, 4, hair); break;
        case 'messy': hairCap(0.34); p.set(hcx - 3, headCy - ry + hh * 0.34, hair); p.set(hcx + 2, headCy - ry + hh * 0.34, hair); p.set(hcx, headCy - ry - 1, hair); p.set(hcx + 3, headCy - ry, hair); break;
        case 'long': hairCap(0.3); p.rect(hcx - rx, headCy - 3, 3, ry + 5, hair); p.rect(hcx + rx - 3, headCy - 3, 3, ry + 5, hair); break;
        case 'curly': p.ellipse(hcx, headCy - 3, rx + 2, ry - 2, hair); p.ellipse(hcx, headCy + 3, rx - 2.5, ry - 4, P.skin); break;
        default: break;
      }
    } else { // side
      switch (style) {
        case 'bald': p.ellipse(hcx - rx + 3, headCy + 1, 3, 4, hair); break;
        case 'short': case 'pony': case 'pigtails': case 'bun': case 'messy': hairCap(0.3); p.ellipse(hcx - rx + 3, headCy, 4, ry - 2, hair); break;
        case 'long': hairCap(0.3); p.ellipse(hcx - rx + 3, headCy + 1, 4.5, ry, hair); break;
        case 'curly': p.ellipse(hcx - 2, headCy - 2, rx + 1, ry - 1, hair); p.ellipse(hcx + 3, headCy + 3, rx - 4, ry - 4.5, P.skin); break;
        default: break;
      }
    }
    if (style === 'cap') {
      const cc = P.cap;
      for (let y = Math.floor(headCy - ry - 1); y < headCy - ry + hh * 0.36; y++) for (let x = Math.floor(hcx - rx); x <= Math.ceil(hcx + rx); x++) {
        const dx = (x + 0.5 - hcx) / rx, dy = (y + 0.5 - headCy) / (ry + 1);
        if (dx * dx + dy * dy <= 1) p.set(x, y, cc);
      }
      const brimY = Math.round(headCy - ry + hh * 0.36);
      if (dir === 's') p.rect(hcx - rx + 2, brimY, hw - 4, 2, shade(cc, 0.75));
      if (dir === 'e') p.rect(hcx, brimY, rx + 4, 2, shade(cc, 0.75));
    }
    if (style === 'hat') {
      const cc = P.hat;
      p.rect(hcx - rx + 3, headCy - ry - 2, hw - 6, 7, cc);
      p.rect(hcx - rx - 2, headCy - ry + 5, hw + 4, 2, shade(cc, 0.8));
    }
    // --- face
    if (dir === 's') {
      const ey = Math.round(headCy + hh * 0.08), ex = Math.round(hw * 0.21);
      if (P.glasses) { p.ring(hcx - ex - 0.5 + 0.5, ey + 0.5, 3, 3, '#3a3040'); p.ring(hcx + ex + 0.5, ey + 0.5, 3, 3, '#3a3040'); p.set(hcx, ey, '#3a3040'); }
      if (!opts.faceless) {
        p.rect(hcx - ex - 1, ey - 1, 2, 2, eyeCol); p.rect(hcx + ex, ey - 1, 2, 2, eyeCol);
        if (!opts.ghost) { p.set(hcx - ex - 1, ey - 1, '#ffffff'); p.set(hcx + ex, ey - 1, '#ffffff'); }
        if (P.nose) p.rect(hcx - 1, ey + 2, 2, 1, shade(P.skin, 0.8));
        if (P.mustache) p.rect(hcx - 3, ey + 3, 6, 2, P.mustache);
        if (P.beard) { p.rect(hcx - rx + 3, ey + 3, hw - 6, 5, P.beard); p.rect(hcx - 1, ey + 5, 3, 1, '#7a3a3a'); }
        else if (opts.ghost) { p.rect(hcx - 2, ey + 6, 4, 1, shade(P.skin, 0.55)); }
        else { p.rect(hcx - 2, ey + 6, 4, 1, '#8a3a3a'); p.set(hcx - 3, ey + 5, '#8a3a3a'); p.set(hcx + 2, ey + 5, '#8a3a3a'); }
        if (P.blush) { p.set(hcx - ex - 3, ey + 3, '#e88a8a'); p.set(hcx + ex + 2, ey + 3, '#e88a8a'); }
      }
    } else if (dir === 'e') {
      const ey = Math.round(headCy + hh * 0.08), ex = Math.round(hcx + rx * 0.5);
      if (!opts.faceless) {
        p.rect(ex, ey - 1, 2, 2, eyeCol);
        if (P.glasses) { p.ring(ex + 1, ey + 0.5, 3, 3, '#3a3040'); p.line(ex - 2, ey, hcx - 2, ey - 1, '#3a3040'); }
        if (P.nose || true) p.rect(Math.round(hcx + rx) - 1, ey + 1, 2, 2, P.skin);
        if (P.mustache) p.rect(Math.round(hcx + rx) - 4, ey + 3, 4, 2, P.mustache);
        if (P.beard) p.rect(hcx, ey + 3, rx, 5, P.beard);
        else p.rect(Math.round(hcx + rx) - 3, ey + 6, 2, 1, opts.ghost ? shade(P.skin, 0.55) : '#8a3a3a');
      }
      // ear
      p.rect(hcx - 1, ey, 2, 3, shade(P.skin, 0.85));
    }
    // --- shading: darken right edge, lighten top edge
    const src = p.clone();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!src.alpha(x, y)) continue;
      if (!src.alpha(x + 1, y) || !src.alpha(x + 2, y)) { const c = src.get(x, y); p.set(x, y, shade(c, 0.82)); }
    }
    p.outline(opts.outline || OUTLINE);
    if (opts.ghost) ghostify(p);
    return p;
  }

  function ghostify(p) {
    p.map((c) => {
      const l = (c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11) / 255;
      if (l > 0.93) return [236, 244, 255];
      const t = 0.25 + l * 0.75;
      return [Math.round(110 * t + 30), Math.round(130 * t + 34), Math.round(160 * t + 46)];
    });
    return p;
  }

  // ---------------------------------------------------------------- the helmet kid
  function paintHelmet(C, dir, frame, opts) {
    opts = opts || {};
    const p = new Pix(W, H);
    const cx = 16, footY = H - 1;
    const step = frame === 1 ? 1 : frame === 2 ? -1 : 0;
    const bob = frame === 0 ? 0 : 1;
    // boots & legs (very short)
    if (dir === 'e') {
      if (step === 0) { p.rect(cx - 2, footY - 6, 4, 4, C.suit); p.rect(cx - 2, footY - 2, 7, 3, C.boot); }
      else {
        const a = step * 2;
        p.rect(cx - 3 - a, footY - 6, 3, 4, shade(C.suit, 0.85)); p.rect(cx - 3 - a, footY - 2, 6, 3, shade(C.boot, 0.85));
        p.rect(cx - 1 + a, footY - 6, 3, 4, C.suit); p.rect(cx - 1 + a, footY - 2, 6, 3, C.boot);
      }
    } else {
      const l1 = step === 1 ? 1 : 0, l2 = step === -1 ? 1 : 0;
      p.rect(cx - 5, footY - 6, 3, 4 - l1, C.suit); p.rect(cx - 6, footY - 2 - l1, 5, 3, C.boot);
      p.rect(cx + 2, footY - 6, 3, 4 - l2, C.suit); p.rect(cx + 1, footY - 2 - l2, 5, 3, C.boot);
    }
    // body — round-bottomed overall
    const bodyTop = footY - 16 + bob;
    const bw = dir === 'e' ? 10 : 13;
    p.ellipse(cx + 0.5, bodyTop + 6, bw / 2, 6, C.suit);
    if (dir === 's') { p.rect(cx - 3, bodyTop + 2, 7, 5, shade(C.suit, 1.15)); p.set(cx - 2, bodyTop + 3, '#e8d070'); p.set(cx + 2, bodyTop + 3, '#e8d070'); }
    // arms (sleeves)
    if (dir === 'e') {
      p.rect(cx - 1 + step * 2, bodyTop + 3, 3, 6, C.sleeve); p.rect(cx - 1 + step * 2, bodyTop + 9, 3, 2, '#e8c8a8');
    } else {
      const a1 = step === 1 ? -1 : 0, a2 = step === -1 ? -1 : 0;
      p.rect(cx - bw / 2 - 2, bodyTop + 3 + a1, 3, 6, C.sleeve); p.rect(cx - bw / 2 - 2, bodyTop + 9 + a1, 3, 2, '#e8c8a8');
      p.rect(cx + bw / 2, bodyTop + 3 + a2, 3, 6, C.sleeve); p.rect(cx + bw / 2, bodyTop + 9 + a2, 3, 2, '#e8c8a8');
    }
    // collar ring
    p.rect(cx - 7, bodyTop - 1, 15, 3, C.rim);
    // helmet
    const hr = 12.5, hcy = bodyTop - 11;
    p.ellipse(cx + 0.5, hcy, hr, hr, C.brass);
    // top highlight
    p.ellipse(cx - 4, hcy - 6, 4, 2.5, C.light);
    // lower rim shading
    for (let y = Math.floor(hcy + 6); y < hcy + hr; y++) for (let x = 0; x < W; x++) if (p.alpha(x, y)) { const c = p.get(x, y); if (c[0] === hex(C.brass)[0]) p.set(x, y, shade(C.brass, 0.85)); }
    const bolt = shade(C.rim, 0.8);
    if (dir === 's') {
      p.ellipse(cx + 0.5, hcy + 1.5, 7.5, 7.5, C.rim);
      p.ellipse(cx + 0.5, hcy + 1.5, 6, 6, '#bfe4ec');
      p.ellipse(cx + 0.5, hcy + 4.5, 5, 2.5, '#a8d4de');
      if (!opts.faceless) {
        p.rect(cx - 3, hcy, 2, 3, '#1a1420'); p.rect(cx + 3, hcy, 2, 3, '#1a1420');
      }
      p.set(cx - 3, hcy - 3, '#ffffff'); p.set(cx - 2, hcy - 3, '#ffffff'); p.set(cx - 3, hcy - 2, '#ffffff');
      [[-10, -2], [11, -2], [-8, 7], [9, 7]].forEach(([bx, by]) => p.rect(cx + bx, hcy + by, 2, 2, bolt));
    } else if (dir === 'e') {
      p.ellipse(cx + 7, hcy + 1.5, 4.5, 7, C.rim);
      p.ellipse(cx + 7.5, hcy + 1.5, 3.2, 5.8, '#bfe4ec');
      if (!opts.faceless) p.rect(cx + 8, hcy, 2, 3, '#1a1420');
      p.set(cx + 7, hcy - 3, '#ffffff');
      p.rect(cx - 9, hcy - 1, 3, 3, bolt); p.rect(cx - 3, hcy - 10, 2, 2, bolt);
      // air hose nub at back
      p.rect(cx - 13, hcy + 3, 3, 3, C.rim);
    } else {
      p.ellipse(cx + 0.5, hcy + 1, 4, 4, C.rim);
      p.ellipse(cx + 0.5, hcy + 1, 2, 2, bolt);
      [[-10, -2], [11, -2], [-6, -9], [7, -9]].forEach(([bx, by]) => p.rect(cx + bx, hcy + by, 2, 2, bolt));
    }
    const src = p.clone();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!src.alpha(x, y)) continue;
      if (!src.alpha(x + 1, y)) p.set(x, y, shade(src.get(x, y), 0.8));
    }
    p.outline(OUTLINE);
    if (opts.ghost) ghostify(p);
    return p;
  }

  function registerSet(name, painter) {
    const set = { s: [], n: [], e: [] };
    for (const dir of ['s', 'n', 'e']) for (let f = 0; f < 3; f++) set[dir].push(Atlas.add(name + '_' + dir + f, painter(dir, f)));
    sets[name] = set;
  }

  // ---------------------------------------------------------------- animals / plants
  function paintSimple(w, h, fn) { const p = new Pix(w, h); fn(p); return p; }

  function fish(body, fin, stripe, frame, shape) {
    return paintSimple(14, 9, (p) => {
      if (shape === 'tall') { p.ellipse(7, 4.5, 4, 4, body); p.tri(2, 4, 0, 1, 0, 8, fin); }
      else { p.ellipse(7.5, 4.5, 5, 3, body); p.tri(3, 4.5, 0, frame ? 2 : 1, 0, frame ? 7 : 8, fin); }
      if (stripe) { p.rect(6, 1, 1, 7, stripe); p.rect(9, 2, 1, 5, stripe); }
      p.set(10, 3, '#111'); p.set(4 + (frame ? 1 : 0), 2, fin);
      p.outline('#1a2030');
    });
  }

  function build() {
    for (const name in CHAR_DEFS) {
      registerSet(name, (d, f) => paintHuman(CHAR_DEFS[name], d, f));
    }
    registerSet('walter_ghost', (d, f) => paintHuman(CHAR_DEFS.walter, d, f, { ghost: true }));
    registerSet('walter_blank', (d, f) => paintHuman(CHAR_DEFS.walter, d, f, { ghost: true, faceless: true }));
    registerSet('evan_ghost', (d, f) => paintHuman(CHAR_DEFS.evan, d, f, { ghost: true }));
    for (const hname in HELMETS) registerSet(hname === 'player' ? 'player' : 'helmet_' + hname, (d, f) => paintHelmet(HELMETS[hname], d, f));
    registerSet('player_ghost', (d, f) => paintHelmet(HELMETS.player, d, f, { ghost: true }));

    // penguin
    for (let f = 0; f < 2; f++) {
      Atlas.add('penguin_s' + f, paintSimple(16, 22, (p) => {
        p.ellipse(8, 13, 6, 8, '#1e2230'); p.ellipse(8, 14, 4, 6, '#f2f2ee'); p.ellipse(8, 5, 4.5, 4.5, '#1e2230');
        p.set(6, 5, '#fff'); p.set(10, 5, '#fff'); p.set(6, 5, '#111'); p.set(10, 5, '#111');
        p.rect(7, 7, 3, 2, '#e8a030'); p.rect(4 + f, 20, 3, 2, '#e8a030'); p.rect(10 - f, 20, 3, 2, '#e8a030');
        p.rect(1 + f, 10, 2, 6, '#1e2230'); p.rect(13 - f, 10, 2, 6, '#1e2230');
        p.outline('#0a0a10');
      }));
      Atlas.add('penguin_e' + f, paintSimple(16, 22, (p) => {
        p.ellipse(8, 13, 5, 8, '#1e2230'); p.ellipse(10, 14, 3, 6, '#f2f2ee'); p.ellipse(9, 5, 4, 4.5, '#1e2230');
        p.set(11, 4, '#fff'); p.rect(12, 6, 3, 2, '#e8a030'); p.rect(6 + f * 2, 20, 4, 2, '#e8a030');
        p.rect(5, 10 + f, 2, 6, '#161a26');
        p.outline('#0a0a10');
      }));
    }
    // aquarium fish
    const FISH = [['#e8742a', '#f4f4f0', '#f4f4f0'], ['#3a6ae0', '#f0d040', null], ['#f0d040', '#e8c030', null], ['#e8e0c0', '#303040', '#303040', 'tall'], ['#4ac08a', '#2a8a6a', null], ['#d84a6a', '#f0a0b0', null], ['#9a6ae0', '#e8c040', null], ['#c0c8d0', '#8090a0', null]];
    FISH.forEach((fd, i) => { for (let f = 0; f < 2; f++) Atlas.add('fish' + i + '_' + f, fish(fd[0], fd[1], fd[2], f, fd[3])); });
    for (let f = 0; f < 2; f++) {
      Atlas.add('jelly_' + f, paintSimple(14, 20, (p) => {
        const sq = f ? 1 : 0;
        p.ellipse(7, 5, 6 - sq, 4 + sq, '#f0b8d8'); p.ellipse(7, 5, 4 - sq, 2, '#f8d8ec');
        for (let t = 0; t < 4; t++) for (let y = 9; y < 19; y++) p.set(3 + t * 2 + ((y + f + t) % 4 < 2 ? 0 : 1), y, '#e8a0c8');
      }));
      Atlas.add('turtle_' + f, paintSimple(28, 16, (p) => {
        p.ellipse(14, 8, 9, 5, '#5a7a3a'); p.ellipse(14, 7, 7, 3.5, '#7a9a4a');
        p.frame(10, 5, 4, 3, '#4a6a2a'); p.frame(15, 5, 4, 3, '#4a6a2a');
        p.ellipse(24, 8, 3, 2.5, '#a8b878'); p.set(25, 7, '#111');
        p.tri(10, 11, 6, 15 - f * 3, 13, 12, '#98a868'); p.tri(17, 11, 20, 15 - (1 - f) * 3, 21, 11, '#98a868');
        p.tri(6, 7, 2, 4 + f * 2, 6, 9, '#98a868');
        p.outline('#1a2a10');
      }));
      Atlas.add('octopus_' + f, paintSimple(30, 26, (p) => {
        p.ellipse(15, 8, 8, 7.5, '#c8543a'); p.ellipse(13, 6, 4, 3, '#e07858');
        for (let t = 0; t < 6; t++) {
          const x0 = 7 + t * 3.2;
          for (let y = 13; y < 25; y++) { const w = Math.sin((y + t * 2 + f * 3) * 0.5) * 1.8; p.rect(Math.round(x0 + w), y, 2, 1, t % 2 ? '#b84a32' : '#c8543a'); }
        }
        p.ellipse(11, 10, 2, 2, '#f4e8c8'); p.ellipse(19, 10, 2, 2, '#f4e8c8'); p.rect(11, 10, 1, 2, '#111'); p.rect(19, 10, 1, 2, '#111');
        p.outline('#3a1410');
      }));
      Atlas.add('seahorse_' + f, paintSimple(10, 16, (p) => {
        p.ellipse(5, 3, 2.5, 2.5, '#e8c040'); p.rect(7, 2, 2, 2, '#e8c040'); p.ellipse(4, 8, 2.5, 4, '#e8c040');
        p.line(4, 11, 5 + f, 14, '#d8b030'); p.line(5 + f, 14, 3, 15, '#d8b030'); p.set(5, 2, '#111'); p.set(2, 7, '#f0d860');
        p.outline('#4a3a10');
      }));
      Atlas.add('gull_' + f, paintSimple(14, 8, (p) => {
        p.ellipse(7, 5, 3, 2, '#f0f0f0'); if (f) { p.line(1, 2, 6, 5, '#d0d0d0'); p.line(13, 2, 8, 5, '#d0d0d0'); } else { p.line(1, 6, 6, 4, '#d0d0d0'); p.line(13, 6, 8, 4, '#d0d0d0'); }
        p.set(10, 4, '#e8a030'); p.outline('#606060');
      }));
    }
    Atlas.add('crab', paintSimple(12, 7, (p) => { p.ellipse(6, 4, 4, 2.5, '#d8542a'); p.rect(1, 1, 2, 2, '#d8542a'); p.rect(9, 1, 2, 2, '#d8542a'); p.set(5, 2, '#111'); p.set(7, 2, '#111'); p.outline('#4a1a0a'); }));
    // Marmalade
    Atlas.add('cat_sleep', paintSimple(22, 12, (p) => {
      p.ellipse(11, 7, 9, 4.5, '#e8943a'); p.ellipse(5, 6, 4, 3.5, '#e8943a');
      p.tri(2, 4, 3, 0, 5, 3, '#e8943a'); p.tri(6, 3, 7, 0, 8, 4, '#e8943a');
      for (let x = 9; x < 19; x += 3) p.line(x, 3, x + 1, 6, '#c8742a');
      p.line(3, 6, 4, 6, '#5a3a1a'); p.line(6, 6, 7, 6, '#5a3a1a');
      p.line(19, 9, 21, 6, '#e8943a'); p.outline('#3a2010');
    }));
    Atlas.add('cat_sit', paintSimple(18, 20, (p) => {
      p.ellipse(9, 14, 6, 6, '#e8943a'); p.ellipse(9, 6, 5, 4.5, '#e8943a');
      p.tri(4, 4, 4, -1, 7, 2, '#e8943a'); p.tri(11, 2, 14, -1, 14, 4, '#e8943a');
      p.rect(7, 5, 1, 2, '#2a4a1a'); p.rect(11, 5, 1, 2, '#2a4a1a'); p.set(9, 8, '#d86a6a');
      p.line(6, 11, 7, 14, '#c8742a'); p.line(11, 11, 12, 14, '#c8742a');
      p.line(14, 18, 17, 13, '#e8943a'); p.rect(7, 9, 4, 1, '#c83a2a'); p.set(9, 10, '#f0d040');
      p.outline('#3a2010');
    }));
    // trees
    Atlas.add('tree_round', paintSimple(48, 64, (p) => {
      const r = makeRng(201);
      p.rect(21, 38, 6, 26, '#6a4a30'); p.rect(21, 38, 2, 26, '#7e5a3a');
      p.ellipse(24, 22, 20, 18, '#3e7a36'); p.ellipse(15, 28, 11, 9, '#3e7a36'); p.ellipse(33, 28, 11, 9, '#3e7a36');
      p.ellipse(20, 15, 10, 7, '#5a9a44'); p.ellipse(30, 20, 7, 5, '#4e8a3e');
      for (let i = 0; i < 70; i++) { const x = r.int(48), y = r.int(40); if (p.alpha(x, y)) p.set(x, y, r.pick(['#2e6428', '#4e8a3e', '#6aaa50'])); }
      p.outline('#1a3014');
    }));
    Atlas.add('tree_dead', paintSimple(48, 64, (p) => {
      p.rect(22, 30, 4, 34, '#5a4a3e');
      p.line(24, 34, 10, 14, '#5a4a3e'); p.line(24, 30, 36, 10, '#5a4a3e'); p.line(16, 22, 8, 20, '#5a4a3e'); p.line(31, 18, 40, 20, '#5a4a3e'); p.line(24, 30, 25, 6, '#5a4a3e');
      p.outline('#2a2018');
    }));
    Atlas.add('tree_pine', paintSimple(32, 64, (p) => {
      p.rect(14, 50, 4, 14, '#5a3a22');
      for (let i = 0; i < 4; i++) p.tri(16, 4 + i * 11, 3 + i * 1.5, 22 + i * 10, 29 - i * 1.5, 22 + i * 10, i % 2 ? '#2e5a32' : '#346a38');
      p.outline('#142a16');
    }));
    Atlas.add('bush', paintSimple(32, 20, (p) => {
      p.ellipse(10, 12, 9, 7, '#3e7a36'); p.ellipse(22, 12, 9, 7, '#3e7a36'); p.ellipse(16, 8, 9, 7, '#4e8a3e');
      p.speckle(makeRng(202), ['#2e6428', '#5a9a44'], 0.12, 2, 2, 28, 16);
      p.map((c, x, y) => (y > 18 ? [0, 0, 0, 0] : null));
      p.outline('#1a3014');
    }));
    Atlas.add('flowers', paintSimple(16, 8, (p) => {
      const r = makeRng(203);
      for (let i = 0; i < 6; i++) { const x = 1 + r.int(14), y = 1 + r.int(4); p.line(x, y + 1, x, 7, '#4a8a3a'); p.set(x, y, r.pick(['#e84a4a', '#f0e040', '#f0f0f0', '#c86ae0'])); }
    }));
    Atlas.add('reeds', paintSimple(16, 24, (p) => { for (let i = 0; i < 6; i++) p.line(2 + i * 2.4, 23, 1 + i * 2.6 + (i % 2), 4 + (i * 7) % 9, i % 2 ? '#6a8a3a' : '#7a9a4a'); }));
    Atlas.add('bubble', paintSimple(4, 4, (p) => { p.ring(2, 2, 2, 2, '#d8f0ff'); }));
    Atlas.add('shadow', paintSimple(16, 8, (p) => { p.ellipse(8, 4, 7.5, 3.5, [0, 0, 0, 90]); }));
    Atlas.add('sparkle', paintSimple(7, 7, (p) => { p.line(3, 0, 3, 6, '#fff8d0'); p.line(0, 3, 6, 3, '#fff8d0'); p.set(3, 3, '#ffffff'); }));
    Atlas.add('indicator', paintSimple(7, 6, (p) => { p.tri(0, 0, 7, 0, 3.5, 5, '#f8f0c0'); p.line(0, 0, 3, 5, '#6a5a30'); }));
    Atlas.add('__missing', paintSimple(8, 8, (p) => p.fill('#ff00ff')));
  }

  return { build, sets, paintHuman, paintHelmet, ghostify, W, H };
})();
