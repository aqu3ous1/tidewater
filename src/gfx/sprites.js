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

// faces: eyes / brows / noseStyle / mouth / extras / glasses / facial hair (see paintHead)
const FACES = {
  walter: { eyes: 'open', iris: '#4a6a8a', brows: 'bushy', browC: '#e4e4dc', noseStyle: 'round', mouth: 'soft', mustacheStyle: 'walrus', extras: ['wrinkles', 'bags', 'bigears'], jaw: 'jowly', glasses: 'round', frameC: '#6a5a3a' },
  dana: { eyes: 'open', iris: '#5a3a20', brows: 'arched', noseStyle: 'small', mouth: 'gap', extras: ['freckles', 'bandaid'], bangs: true },
  miller: { eyes: 'lashes', iris: '#6a5a8a', brows: 'thin', browC: '#9a8aa8', noseStyle: 'hook', mouth: 'pursed', lips: '#c0587a', extras: ['wrinkles', 'earrings', 'blush', 'mole'], blushC: '#e8a8b8', earringC: '#f4f0f0', glasses: 'cat', frameC: '#7a3a7a', chain: '#e8c040' },
  hal: { eyes: 'happy', brows: 'thick', browC: '#2a1a10', noseStyle: 'round', mouth: 'grin', mustacheStyle: 'thick', extras: ['stubble'], jaw: 'square', hairStyle: 'papercap', paper: '#f4f4ee', paperStripe: '#c84a3a' },
  donna: { eyes: 'lashes', iris: '#2a6aa8', brows: 'arched', browC: '#b08a40', noseStyle: 'small', mouth: 'lips', lips: '#d83a4a', extras: ['mole', 'earrings', 'pencil'], shadowC: '#7aa8e0', earringC: '#e84a8a', hairStyle: 'beehive' },
  priya: { eyes: 'lashes', iris: '#3a2418', brows: 'thick', browC: '#1a1414', noseStyle: 'long', mouth: 'soft', lips: '#9a4a52', extras: ['stud', 'earrings'], earringC: '#e8c040', part: 'middle' },
  gus: { eyes: 'narrow', iris: '#3a2a1a', brows: 'angry', browsR: 'raised', noseStyle: 'wide', mouth: 'smirk', beardStyle: 'full', extras: ['smudge', 'bags'], capMark: '#f4f0e0', jaw: 'square' },
  okafor: { eyes: 'open', iris: '#2a1a14', brows: 'arched', browC: '#1a1414', noseStyle: 'wide', mouth: 'grin', extras: ['earrings'], earringC: '#e8c040', glasses: 'square', frameC: '#c83a3a', hairStyle: 'afro' },
  ray: { eyes: 'narrow', iris: '#5a7a8a', brows: 'bushy', browC: '#e0e0d8', noseStyle: 'round', noseC: '#d87a6a', mouth: 'flat', beardStyle: 'long', mustache: '#dcdcd4', mustacheStyle: 'walrus', extras: ['wrinkles'], lure: '#e8503a' },
  lou: { eyes: 'open', iris: '#4a3020', brows: 'thick', browsR: 'raised', noseStyle: 'long', mouth: 'smile', mustache: '#3a2a1a', mustacheStyle: 'thin', extras: ['dimple'], capMark: '#e8c040' },
  ellis: { eyes: 'tired', iris: '#4a5a6a', brows: 'worried', browC: '#9a9a98', noseStyle: 'long', mouth: 'flat', extras: ['bags', 'wrinkles'], glasses: 'half', frameC: '#8a8a90', hairStyle: 'slick', part: 'side', jaw: 'long' },
  mae: { eyes: 'lashes', iris: '#3a7a4a', brows: 'arched', browC: '#a84a2a', noseStyle: 'button', mouth: 'smile', lips: '#e0705a', extras: ['freckles', 'blush', 'earrings'], earringC: '#4ab0a8' },
  bea: { eyes: 'kid', brows: 'thin', noseStyle: 'small', mouth: 'gap', extras: ['blush'], ribbon: '#e83a6a' },
  tommy: { eyes: 'kid', brows: 'flat', noseStyle: 'button', mouth: 'tongue', extras: ['bandaidHead', 'blush', 'freckles'], hairStyle: 'buzz' },
  evan: { eyes: 'kid', iris: '#3a2418', brows: 'worried', noseStyle: 'button', mouth: 'small', extras: ['blush', 'cowlick'] },
  visitor1: { eyes: 'lashes', iris: '#3a5a2a', brows: 'arched', noseStyle: 'small', mouth: 'lips', lips: '#d05a7a', extras: ['sunglassesUp', 'earrings'], part: 'side' },
  visitor2: { eyes: 'kid', brows: 'flat', noseStyle: 'small', mouth: 'braces', extras: ['blush', 'freckles'] },
  visitor3: { eyes: 'open', iris: '#4a3a2a', brows: 'flat', noseStyle: 'long', mouth: 'flat', extras: ['stubble'], glasses: 'square', hairStyle: 'receding' },
  toby: { eyes: 'kid', iris: '#3a5a8a', brows: 'worried', noseStyle: 'button', mouth: 'teeth', extras: ['freckles', 'blush'], glasses: 'thick', frameC: '#3a3a4a', hairStyle: 'bowl' },
};
for (const k in FACES) Object.assign(CHAR_DEFS[k], FACES[k]);

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
    // --- head (see paintHead)
    paintHead(p, P, dir, opts, { cx, hw, hh, headCy, eyeCol });
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


  // ---------------------------------------------------------------- heads & faces
  // Every face is built from a small spec on the character (eyes, brows, nose,
  // mouth, extras, glasses, facial hair, hair style) so nobody looks alike.
  // Features are drawn for the left half and mirrored, so faces stay symmetric.
  const EYES = { // left eye, 3 wide (col 0 = outer, col 2 = inner), rows start at ey-1
    dot: ['.II', '.II'], kid: ['.II', '.II', '.II'], open: ['LLL', 'WIW'], lashes: ['LLL', 'WIW'],
    narrow: ['LLL', '.I.'], squint: ['...', 'LLL'], tired: ['SSS', 'LLL', 'WIW'], wide: ['.L.', 'WIW', '.W.'],
    happy: ['.L.', 'L.L'], sleepy: ['SSS', 'LIL'],
  };
  const BROWS = { // left brow, rows end at ey-3 (inner end is the last column)
    flat: ['BBB'], thick: ['BBB', 'BBB'], bushy: ['.BBB', 'BBBB'], arched: ['.BB', 'B..'], worried: ['..B', 'BB.'],
    angry: ['B..', '.BB'], thin: ['.bb'], raised: ['BBB', '...'], none: [],
  };
  const NOSES = { // 4 wide centered, rows start at ey
    none: [], button: ['....', '....', '.SS.'], small: ['....', '....', '..S.'], long: ['....', '.S..', '.S..', 'sSS.'],
    wide: ['....', '....', 'S..S', '.SS.'], round: ['....', '.RR.', 'RRRR', '.rr.'], hook: ['....', '..S.', '.S..', '.SSs'],
  };
  const MOUTHS = { // 6 wide centered, rows start at my-1
    smile: ['M....M', '.MMMM.'], soft: ['.M..M.', '..MM..'], grin: ['.MMMM.', '.MTTM.', '..MM..'], gap: ['.MMMM.', '.TMMT.', '..MM..'],
    flat: ['......', '.MMMM.'], small: ['......', '..MM..'], frown: ['..MM..', '.M..M.'], smirk: ['....M.', '.MMM..'],
    open: ['..MM..', '..dd..', '..MM..'], lips: ['.LLLL.', '..ll..'], pursed: ['..LL..', '..ll..'], teeth: ['.MMMM.', '..TT..'],
    tongue: ['.MMMM.', '..tt..'], braces: ['.MMMM.', '.TgTg.', '..MM..'],
  };

  function paintHead(p, P, dir, opts, g) {
    const { cx, hw, hh, headCy, eyeCol } = g;
    const rx = hw / 2, ry = hh / 2 + (P.jaw === 'long' ? 0.6 : 0), hcx = cx + (dir === 'e' ? 1 : 0);
    const hair = P.hair, style = P.hairStyle;
    const skin = P.skin, skinD = shade(skin, 0.86), skinDD = shade(skin, 0.72);
    const mir = (x) => 2 * hcx - 1 - x;
    const both = (x, y, c) => { p.set(x, y, c); p.set(mir(x), y, c); };
    const isC = (x, y, c) => { const a = p.get(x, y), b = hex(c); return a[3] && a[0] === b[0] && a[1] === b[1] && a[2] === b[2]; };
    const dark = (skin && (hex(skin)[0] + hex(skin)[1] + hex(skin)[2]) < 420);
    const mouthC = P.mouthC || (dark ? shade(skin, 0.55) : '#7a2e2e');
    const lipC = P.lips || mouthC;
    const ex = P.extras || [];
    const has = (e) => ex.includes(e);

    // hair behind the head
    if (style === 'long' && dir !== 'e') p.rect(hcx - rx, headCy, hw, ry + 3, hair);
    if (style === 'long' && dir === 'e') p.rect(hcx - rx, headCy - 2, rx, ry + 5, hair);
    if (style === 'bob' && dir !== 'e') p.rect(hcx - rx - 1, headCy - 2, hw + 2, ry + 1, hair);
    if (style === 'bob' && dir === 'e') p.rect(hcx - rx - 1, headCy - 3, rx + 1, ry + 2, hair);
    if (style === 'pony' && dir === 'e') p.ellipse(hcx - rx - 1, headCy + 2, 2.5, 4, hair);
    if (style === 'pony' && dir === 'n') p.rect(hcx - 1, headCy + ry - 2, 3, 5, hair);
    if (style === 'pigtails') {
      if (dir !== 'e') { p.ellipse(hcx - rx - 1, headCy + 1, 2.5, 3.5, hair); p.ellipse(hcx + rx + 1, headCy + 1, 2.5, 3.5, hair); if (P.ribbon) { p.rect(hcx - rx - 1, headCy - 3, 2, 2, P.ribbon); p.rect(hcx + rx, headCy - 3, 2, 2, P.ribbon); } }
      else { p.ellipse(hcx - rx, headCy + 1, 2.5, 3.5, hair); if (P.ribbon) p.rect(hcx - rx, headCy - 3, 2, 2, P.ribbon); }
    }
    if (style === 'bun') p.ellipse(hcx + (dir === 'e' ? -3 : 0), headCy - ry - 1, 4, 3, hair);
    if (style === 'beehive') { p.ellipse(hcx + (dir === 'e' ? -1 : 0), headCy - ry - 2, rx - 1, 5, hair); }
    if (style === 'afro') p.ellipse(hcx - (dir === 'e' ? 1 : 0), headCy - 2, rx + 2.5, ry + 0.5, hair);

    // head + jaw
    p.ellipse(hcx, headCy, rx, ry, skin);
    if (P.jaw === 'square') p.rect(Math.round(hcx - rx + 1), Math.round(headCy + 1), Math.round(hw - 2), Math.round(ry - 1.5), skin);
    if (P.jaw === 'jowly' && dir !== 'n') { p.ellipse(hcx - rx + 2.5, headCy + ry - 3, 2.5, 2.5, skin); if (dir === 's') p.ellipse(hcx + rx - 2.5, headCy + ry - 3, 2.5, 2.5, skin); }
    const ey = Math.round(headCy + hh * 0.08);
    // ears
    if (dir === 's' || dir === 'n') {
      const big = has('bigears') ? 1 : 0;
      const ex0 = Math.round(hcx - rx) - 1 - big;
      p.rect(ex0, ey - 1, 1 + big, 3 + big, skin); p.rect(mir(ex0) - big, ey - 1, 1 + big, 3 + big, skin);
      if (dir === 's') { p.set(ex0 + big, ey, skinD); p.set(mir(ex0 + big), ey, skinD); }
      if (has('earrings') && dir === 's') { const ec = P.earringC || '#e8c040'; p.set(ex0, ey + 2 + big, ec); p.set(mir(ex0), ey + 2 + big, ec); }
    }

    // hair on the head
    const capTo = (frac, dy) => {
      for (let y = Math.floor(headCy - ry - (dy || 0)); y < headCy - ry + hh * frac; y++) for (let x = Math.floor(hcx - rx); x <= Math.ceil(hcx + rx); x++) {
        const qx = (x + 0.5 - hcx) / rx, qy = (y + 0.5 - headCy) / (ry + (dy || 0));
        if (qx * qx + qy * qy <= 1) p.set(x, y, hair);
      }
    };
    if (dir === 'n') {
      if (style === 'bald' || style === 'receding') { p.ellipse(hcx, headCy + 3, rx, ry - 4, hair); p.ellipse(hcx, headCy - 2, rx - 2, ry - 3, style === 'bald' ? skin : hair); if (style === 'bald') p.set(hcx - 3, headCy - 5, shade(skin, 1.12)); }
      else if (style === 'buzz') { p.ellipse(hcx, headCy - 1, rx, ry - 1, hair); }
      else if (style !== 'afro' && style !== 'beehive') p.ellipse(hcx, headCy, rx, ry, hair);
      if (style === 'beehive') p.ellipse(hcx, headCy, rx, ry, hair);
      if (style === 'afro') p.ellipse(hcx, headCy - 1, rx + 2, ry + 1, hair);
    } else if (dir === 's') {
      const side = (h) => { p.rect(Math.round(hcx - rx), ey - 3, 2, h, hair); p.rect(mir(Math.round(hcx - rx)) - 1, ey - 3, 2, h, hair); };
      switch (style) {
        case 'bald': p.ellipse(hcx - rx + 1.5, headCy + 1, 2.5, 4, hair); p.ellipse(hcx + rx - 1.5, headCy + 1, 2.5, 4, hair); p.set(hcx - 3, headCy - ry + 2, shade(skin, 1.12)); p.set(hcx - 2, headCy - ry + 2, shade(skin, 1.12)); break;
        case 'receding': capTo(0.2); side(4); p.ellipse(hcx - rx + 2, headCy - 3, 2, 2.5, hair); p.ellipse(hcx + rx - 2, headCy - 3, 2, 2.5, hair); break;
        case 'short': case 'pony': case 'pigtails': case 'bun': capTo(0.32); side(4); break;
        case 'slick': capTo(0.3); side(3); for (let x = -3; x < 4; x += 2) p.set(hcx + x, headCy - ry + 2, shade(hair, 1.3)); break;
        case 'buzz': capTo(0.24); for (let x = -rx + 2; x < rx - 1; x += 2) p.set(Math.round(hcx + x), Math.round(headCy - ry + hh * 0.24), hair); break;
        case 'messy': capTo(0.34); p.set(hcx - 3, Math.round(headCy - ry + hh * 0.34), hair); p.set(hcx + 2, Math.round(headCy - ry + hh * 0.34), hair); p.set(hcx, Math.round(headCy - ry - 1), hair); p.set(hcx + 1, Math.round(headCy - ry - 2), hair); p.set(hcx + 3, Math.round(headCy - ry), hair); break;
        case 'bowl': capTo(0.42); side(3); for (let x = Math.round(hcx - rx + 1); x < hcx + rx - 1; x++) p.set(x, Math.round(headCy - ry + hh * 0.42), hair); break;
        case 'long': capTo(0.3); p.rect(Math.round(hcx - rx), ey - 3, 3, ry + 5, hair); p.rect(mir(Math.round(hcx - rx)) - 2, ey - 3, 3, ry + 5, hair); break;
        case 'bob': capTo(0.36); p.rect(Math.round(hcx - rx) - 1, ey - 3, 3, ry, hair); p.rect(mir(Math.round(hcx - rx)) - 1, ey - 3, 3, ry, hair); break;
        case 'curly': p.ellipse(hcx, headCy - 3, rx + 2, ry - 2, hair); p.ellipse(hcx, headCy + 3, rx - 2.5, ry - 4, skin); for (let i = -2; i <= 2; i++) p.set(hcx + i * 3, Math.round(headCy - ry - 2 + (i % 2 ? 1 : 0)), shade(hair, 1.25)); break;
        case 'afro': p.ellipse(hcx, headCy + 3, rx - 2, ry - 4, skin); break;
        case 'beehive': capTo(0.3); side(3); break;
        case 'papercap': capTo(0.3); side(4); break;
        default: break;
      }
      if (P.part === 'middle' && (style === 'long' || style === 'bob')) { p.set(hcx - 1, Math.round(headCy - ry + 1), skinD); p.set(hcx - 1, Math.round(headCy - ry + 2), skinD); }
      if (P.part === 'side') { p.set(hcx - 3, Math.round(headCy - ry + 1), skinD); p.set(hcx - 3, Math.round(headCy - ry + 2), skinD); }
      if (P.bangs) for (let x = Math.round(hcx - rx + 2); x < hcx + rx - 2; x++) { const yb = Math.round(headCy - ry + hh * 0.32) + ((x * 7) % 3 === 0 ? 1 : 0); p.set(x, yb, hair); }
      if (has('cowlick')) { p.set(hcx + 2, Math.round(headCy - ry - 2), hair); p.set(hcx + 3, Math.round(headCy - ry - 3), hair); }
    } else { // side view
      switch (style) {
        case 'bald': p.ellipse(hcx - rx + 3, headCy + 1, 3, 4, hair); p.set(hcx, Math.round(headCy - ry + 2), shade(skin, 1.12)); break;
        case 'receding': capTo(0.18); p.ellipse(hcx - rx + 3, headCy, 4, ry - 2, hair); break;
        case 'short': case 'pony': case 'pigtails': case 'bun': case 'messy': case 'slick': case 'bowl': case 'beehive': case 'papercap': case 'bob':
          capTo(style === 'bowl' ? 0.42 : 0.3); p.ellipse(hcx - rx + 3, headCy, 4, ry - 2, hair); if (style === 'bowl') p.rect(Math.round(hcx), Math.round(headCy - ry + hh * 0.3), Math.round(rx), 2, hair); break;
        case 'buzz': capTo(0.22); p.ellipse(hcx - rx + 3, headCy - 1, 3.5, ry - 3, hair); break;
        case 'long': capTo(0.3); p.ellipse(hcx - rx + 3, headCy + 1, 4.5, ry, hair); break;
        case 'curly': p.ellipse(hcx - 2, headCy - 2, rx + 1, ry - 1, hair); p.ellipse(hcx + 3, headCy + 3, rx - 4, ry - 4.5, skin); break;
        case 'afro': p.ellipse(hcx - 3, headCy - 1, rx, ry, hair); p.ellipse(hcx + 3, headCy + 3, rx - 4, ry - 4.5, skin); break;
        default: break;
      }
      if (has('cowlick')) p.set(hcx, Math.round(headCy - ry - 2), hair);
      // ear
      p.rect(hcx - 1, ey, 2, 3, shade(skin, 0.85));
      if (has('earrings')) p.set(hcx - 1, ey + 3, P.earringC || '#e8c040');
    }
    // hats
    if (style === 'cap') {
      const cc = P.cap;
      for (let y = Math.floor(headCy - ry - 1); y < headCy - ry + hh * 0.36; y++) for (let x = Math.floor(hcx - rx); x <= Math.ceil(hcx + rx); x++) {
        const qx = (x + 0.5 - hcx) / rx, qy = (y + 0.5 - headCy) / (ry + 1);
        if (qx * qx + qy * qy <= 1) p.set(x, y, cc);
      }
      const brimY = Math.round(headCy - ry + hh * 0.36);
      if (dir === 's') { p.rect(Math.round(hcx - rx + 2), brimY, Math.round(hw - 4), 2, shade(cc, 0.75)); if (P.capMark) p.rect(hcx - 1, brimY - 3, 2, 2, P.capMark); }
      if (dir === 'e') { p.rect(hcx, brimY, Math.round(rx + 4), 2, shade(cc, 0.75)); if (P.capMark) p.set(hcx + 2, brimY - 2, P.capMark); }
      if (dir === 's' || dir === 'e') for (let x = Math.round(hcx - rx + 3); x < hcx + rx - 3; x += 3) p.set(x, Math.round(headCy - ry + 1), shade(cc, 1.15));
    }
    if (style === 'hat') {
      const cc = P.hat;
      p.rect(Math.round(hcx - rx + 3), Math.round(headCy - ry - 2), Math.round(hw - 6), 7, cc);
      p.rect(Math.round(hcx - rx + 3), Math.round(headCy - ry + 2), Math.round(hw - 6), 1, shade(cc, 0.7));
      p.rect(Math.round(hcx - rx - 2), Math.round(headCy - ry + 5), Math.round(hw + 4), 2, shade(cc, 0.8));
      if (P.lure && dir !== 'n') { p.set(Math.round(hcx + rx - 4), Math.round(headCy - ry), P.lure); p.set(Math.round(hcx + rx - 4), Math.round(headCy - ry + 1), '#e8e8e0'); }
    }
    if (style === 'papercap') {
      const cc = P.paper || '#f4f4ee';
      p.rect(Math.round(hcx - rx + 2), Math.round(headCy - ry - 3), Math.round(hw - 4), 5, cc);
      p.rect(Math.round(hcx - rx + 2), Math.round(headCy - ry + 1), Math.round(hw - 4), 1, shade(cc, 0.82));
      if (P.paperStripe && dir !== 'n') p.rect(Math.round(hcx - rx + 2), Math.round(headCy - ry - 1), Math.round(hw - 4), 1, P.paperStripe);
    }

    // --- face
    if (!opts.faceless && dir === 's') {
      const x0 = Math.round(hcx - hw * 0.21) - 2; // left eye's outer column
      const my = ey + (hh >= 20 ? 6 : 5);
      const iris = opts.ghost ? eyeCol : (P.iris || eyeCol);
      const colOf = (ch) => ({ L: P.lashC || eyeCol, W: opts.ghost ? '#dfe8f8' : '#f4f2ea', I: iris, S: skinD, s: skinDD, B: P.browC || shade(hair, 0.82), b: P.browC ? shade(P.browC, 1.15) : shade(hair, 0.95), R: P.noseC || mixc(skin, '#d8605a', 0.35), r: shade(P.noseC || mixc(skin, '#d8605a', 0.35), 0.82), M: mouthC, T: '#f8f6ee', d: '#3a1418', L2: lipC, l: shade(lipC, 0.8), t: '#e0606a', g: '#9aa0a8' }[ch]);
      const stamp = (rows, xL, yT, mirror, map) => rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const ch = row[i]; if (ch === '.') continue; const c = map ? map(ch) : colOf(ch); if (!c) continue; p.set(xL + i, yT + j, c); if (mirror) p.set(mir(xL + i), yT + j, c); } });
      // extras under the features
      if (has('wrinkles')) {
        for (let x = hcx - 3; x < hcx + 3; x++) { const y1 = Math.round(headCy - ry * 0.42); if (isC(x, y1, skin)) p.set(x, y1, skinD); if (x > hcx - 3 && x < hcx + 2 && isC(x, y1 + 2, skin)) p.set(x, y1 + 2, skinD); }
        both(x0 - 1, ey, skinD); both(x0 - 1, ey + 1, skinD);
        both(hcx - 4, my - 2, skinD); both(hcx - 4, my - 1, skinD);
      }
      if (has('stubble')) for (let y = my - 2; y < headCy + ry + 1; y++) for (let x = Math.floor(hcx - rx); x < hcx + rx; x++) if (isC(x, y, skin) && (x * 5 + y * 3) % 4 === 0) p.set(x, y, skinDD);
      if (P.jaw === 'jowly' || has('jowls')) { both(Math.round(hcx - rx + 1), my, skinD); both(Math.round(hcx - rx + 2), my + 1, skinD); }
      if (has('freckles')) { const fc = mixc(skin, '#a0502a', 0.45); both(x0, ey + 2, fc); both(x0 + 2, ey + 2, fc); both(x0 + 1, ey + 3, fc); }
      if (P.blush || has('blush')) { const bc = P.blushC || '#e88a8a'; both(x0, ey + 3, bc); both(x0 + 1, ey + 3, bc); }
      if (has('bags')) { both(x0, ey + 1, skinD); both(x0 + 1, ey + 1, skinD); both(x0 + 2, ey + 1, skinD); }
      if (P.shadowC) { both(x0, ey - 2, P.shadowC); both(x0 + 1, ey - 2, P.shadowC); both(x0 + 2, ey - 2, P.shadowC); }
      // eyes (behind glasses: a light lens with the pupil inside, so frames don't read as a mask)
      const eyeStyle = P.eyes || 'dot';
      const gl0 = P.glasses === true ? 'round' : P.glasses;
      if (gl0 && gl0 !== 'half' && !opts.ghost) {
        const lens = P.lens || mixc(skin, '#e8f0f4', 0.55);
        stamp(['LLL', 'WWW', 'WWW'].map((r) => r.replace(/[LW]/g, 'X')), x0, ey - 1, true, () => lens);
        const pc = P.iris && gl0 !== 'thick' ? P.iris : eyeCol;
        both(x0 + 1, ey - 1, pc); both(x0 + 1, ey, pc);
        if (eyeStyle === 'narrow' || eyeStyle === 'happy') { both(x0, ey - 1, eyeCol); both(x0 + 2, ey - 1, eyeCol); }
        if (!opts.ghost) p.set(x0 + 1, ey - 1, '#ffffff');
      } else {
        const erows = EYES[eyeStyle] || EYES.dot;
        stamp(erows, x0, eyeStyle === 'tired' || eyeStyle === 'sleepy' ? ey - 2 : ey - 1, true);
      }
      if (eyeStyle === 'lashes' || has('lashes')) { both(x0 - 1, ey - 2, P.lashC || eyeCol); }
      if ((eyeStyle === 'dot' || eyeStyle === 'kid') && !opts.ghost) { p.set(x0 + 1, ey - 1, '#ffffff'); p.set(mir(x0 + 2), ey - 1, '#ffffff'); }
      // brows
      const brL = BROWS[P.brows || 'flat'] || BROWS.flat, brR = P.browsR ? BROWS[P.browsR] : null;
      const bTop = (rows) => (eyeStyle === 'tired' || eyeStyle === 'sleepy' ? ey - 4 : ey - 3) - rows.length + 1;
      const bx0 = brL[0] && brL[0].length === 4 ? x0 - 1 : x0;
      if (!brR) stamp(brL, bx0, bTop(brL), true);
      else {
        stamp(brL, bx0, bTop(brL), false);
        const flip = brR.map((r) => r.split('').reverse().join('')), rw = flip[0] ? flip[0].length : 3;
        const bxR = rw === 4 ? x0 - 1 : x0;
        stamp(flip, mir(bxR + rw - 1), bTop(brR) - (P.browsR === 'raised' ? 1 : 0), false);
      }
      // nose
      stamp(NOSES[P.noseStyle || (P.nose ? 'button' : 'small')] || NOSES.small, hcx - 2, ey, false);
      // facial hair, mouth
      const mouthRows = MOUTHS[P.mouth || 'soft'] || MOUTHS.soft;
      const mcol = (ch) => (ch === 'L' ? lipC : ch === 'l' ? shade(lipC, 0.8) : colOf(ch));
      if (P.beard) {
        const bst = P.beardStyle || 'full';
        for (let y = my - 2; y < headCy + ry + (bst === 'long' ? 6 : 1); y++) for (let x = Math.floor(hcx - rx + 2); x < hcx + rx - 2; x++) {
          const inside = y <= headCy + ry || Math.abs(x + 0.5 - hcx) < (headCy + ry + 6 - y) * 0.9;
          if (inside) p.set(x, y, (x + y) % 3 === 0 ? shade(P.beard, 0.88) : P.beard);
        }
        p.rect(hcx - 1, my, 2, 1, dark ? shade(skin, 0.5) : '#6a2a2a');
      } else stamp(mouthRows, hcx - 3, my - 1, false, mcol);
      if (P.mustache) {
        const ms = P.mustacheStyle || 'thick', mc = P.mustache;
        if (ms === 'walrus') { p.rect(hcx - 4, my - 2, 8, 2, mc); both(hcx - 4, my, mc); p.set(hcx - 1, my - 2, shade(mc, 0.85)); p.set(hcx, my - 2, shade(mc, 0.85)); }
        else if (ms === 'thin') p.rect(hcx - 3, my - 2, 6, 1, mc);
        else { p.rect(hcx - 3, my - 2, 6, 2, mc); both(hcx - 4, my - 1, mc); }
      }
      // extras over the top
      if (has('mole')) p.set(hcx + 3, my - 1, '#4a2a1a');
      if (has('dimple')) p.set(hcx - 1, Math.round(headCy + ry - 1), skinD);
      if (has('smudge')) { p.set(mir(x0), ey + 3, '#3a3430'); p.set(mir(x0) - 1, ey + 3, '#4a4440'); p.set(mir(x0), ey + 4, '#4a4440'); }
      if (has('bandaid')) { p.rect(mir(x0 + 2), ey + 2, 3, 2, '#e8c890'); p.set(mir(x0 + 1), ey + 2, '#d8b070'); }
      if (has('bandaidHead')) { p.rect(hcx - 4, Math.round(headCy - ry * 0.45), 4, 2, '#e8c890'); p.set(hcx - 3, Math.round(headCy - ry * 0.45), '#d8b070'); }
      if (has('stud')) p.set(hcx + 1, ey + 2, '#e8e8f0');
      if (has('pencil')) { p.line(Math.round(hcx + rx - 1), ey - 4, Math.round(hcx + rx + 1), ey - 1, '#e8c040'); p.set(Math.round(hcx + rx + 1), ey - 1, '#3a3a3a'); }
      if (has('sunglassesUp')) { p.rect(hcx - 5, Math.round(headCy - ry + 2), 4, 2, '#1a1a1e'); p.rect(hcx + 1, Math.round(headCy - ry + 2), 4, 2, '#1a1a1e'); p.set(hcx - 1, Math.round(headCy - ry + 2), '#1a1a1e'); p.set(hcx, Math.round(headCy - ry + 2), '#1a1a1e'); }
      // glasses
      const gl = P.glasses === true ? 'round' : P.glasses;
      if (gl) {
        const fc = P.frameC || '#3a3040';
        if (gl === 'round' || gl === 'thick') {
          p.ring(x0 + 1.5, ey + 0.5, 2.8, 2.6, fc); p.ring(mir(x0 + 1) + 0.5, ey + 0.5, 2.8, 2.6, fc);
          if (gl === 'thick') { p.ring(x0 + 1.5, ey + 0.5, 3.4, 3.2, fc); p.ring(mir(x0 + 1) + 0.5, ey + 0.5, 3.4, 3.2, fc); }
        } else if (gl === 'square' || gl === 'cat') {
          p.frame(x0 - 1, ey - 2, 5, 5, fc); p.frame(mir(x0 + 3), ey - 2, 5, 5, fc);
          if (gl === 'cat') { both(x0 - 2, ey - 3, fc); both(x0 - 1, ey - 3, fc); }
        } else if (gl === 'half') {
          for (let i = -1; i < 4; i++) both(x0 + i, ey + 1, fc); both(x0 - 1, ey, fc); both(x0 + 3, ey, fc);
        }
        both(hcx - 1, ey - 1, fc);
        both(Math.round(hcx - rx), ey - 1, fc);
        if (P.chain) { for (let y = ey + 1; y < headCy + ry + 3; y += 2) both(Math.round(hcx - rx) + ((y >> 1) % 2), y, P.chain); }
      }
    } else if (!opts.faceless && dir === 'e') {
      const exx = Math.round(hcx + rx * 0.5), front = Math.round(hcx + rx);
      const my = ey + (hh >= 20 ? 6 : 5);
      const eyeStyle = P.eyes || 'dot';
      const iris = opts.ghost ? eyeCol : (P.iris || eyeCol);
      if (has('wrinkles')) { p.set(exx - 2, ey, skinD); p.set(exx - 2, ey + 1, skinD); }
      if (has('stubble')) for (let y = my - 2; y < headCy + ry + 1; y++) for (let x = hcx; x < front; x++) if (isC(x, y, skin) && (x * 5 + y * 3) % 4 === 0) p.set(x, y, skinDD);
      if (has('freckles')) { const fc = mixc(skin, '#a0502a', 0.45); p.set(exx - 1, ey + 2, fc); p.set(exx + 1, ey + 3, fc); }
      if (P.blush || has('blush')) { const bc = P.blushC || '#e88a8a'; p.set(exx - 1, ey + 3, bc); p.set(exx, ey + 3, bc); }
      if (eyeStyle === 'happy') { p.set(exx, ey - 1, eyeCol); p.set(exx + 1, ey, eyeCol); p.set(exx - 1, ey, eyeCol); }
      else if (eyeStyle === 'narrow' || eyeStyle === 'squint') { p.rect(exx - 1, ey, 3, 1, eyeCol); if (eyeStyle === 'narrow') p.set(exx, ey + 1, iris); }
      else if (eyeStyle === 'open' || eyeStyle === 'lashes' || eyeStyle === 'tired' || eyeStyle === 'wide' || eyeStyle === 'sleepy') {
        p.rect(exx - 1, ey - 1, 3, 1, P.lashC || eyeCol); p.set(exx - 1, ey, opts.ghost ? '#dfe8f8' : '#f4f2ea'); p.set(exx, ey, iris); p.set(exx + 1, ey, iris);
        if (eyeStyle === 'lashes' || has('lashes')) p.set(exx + 2, ey - 2, P.lashC || eyeCol);
        if (eyeStyle === 'tired' || eyeStyle === 'sleepy') p.rect(exx - 1, ey - 2, 3, 1, skinD);
      } else { p.rect(exx, ey - 1, 2, eyeStyle === 'kid' ? 3 : 2, iris); if (!opts.ghost) p.set(exx, ey - 1, '#ffffff'); }
      if (has('bags')) p.rect(exx - 1, ey + 1, 3, 1, skinD);
      if (P.shadowC) p.rect(exx - 1, ey - 2, 3, 1, P.shadowC);
      const bs = P.brows || 'flat';
      if (bs !== 'none') { const bc = P.browC || shade(hair, 0.82); const by = eyeStyle === 'tired' ? ey - 4 : ey - 3; p.rect(exx - 1, by, bs === 'bushy' ? 4 : 3, bs === 'thick' || bs === 'bushy' ? 2 : 1, bc); if (bs === 'worried') p.set(exx + 2, by - 1, bc); if (bs === 'angry') p.set(exx + 2, by + 1, bc); }
      // nose
      const ns = P.noseStyle || (P.nose ? 'button' : 'small');
      if (ns === 'long' || ns === 'hook') { p.rect(front - 1, ey, 2, 3, skin); p.set(front + 1, ey + 2, skin); if (ns === 'hook') p.set(front + 1, ey + 3, skinD); p.set(front - 1, ey + 3, skinD); }
      else if (ns === 'round') { p.rect(front - 1, ey + 1, 3, 2, P.noseC || mixc(skin, '#d8605a', 0.35)); }
      else if (ns === 'wide') { p.rect(front - 1, ey + 1, 3, 2, skin); p.set(front, ey + 2, skinD); }
      else p.rect(front - 1, ey + 1, 2, 2, skin);
      if (has('stud')) p.set(front - 1, ey + 2, '#e8e8f0');
      // mouth / facial hair
      if (P.beard) { p.rect(hcx, my - 2, Math.round(rx), P.beardStyle === 'long' ? 8 : 5, P.beard); p.set(front - 2, my, dark ? shade(skin, 0.5) : '#6a2a2a'); }
      else {
        const m = P.mouth || 'soft', mc = m === 'lips' || m === 'pursed' ? lipC : mouthC;
        if (m === 'grin' || m === 'gap' || m === 'teeth' || m === 'braces' || m === 'tongue') { p.rect(front - 3, my - 1, 3, 1, mc); p.set(front - 2, my, m === 'tongue' ? '#e0606a' : '#f8f6ee'); }
        else if (m === 'open') { p.rect(front - 2, my - 1, 2, 2, mc); }
        else if (m === 'frown') { p.rect(front - 3, my, 2, 1, mc); p.set(front - 1, my - 1, mc); }
        else if (m === 'smile' || m === 'soft') { p.rect(front - 3, my, 2, 1, mc); p.set(front - 1, my - 1, mc); }
        else p.rect(front - 3, my, 2, 1, mc);
      }
      if (P.mustache) p.rect(front - 4, my - 2, 4, P.mustacheStyle === 'thin' ? 1 : 2, P.mustache);
      if (has('smudge')) p.set(exx - 1, ey + 3, '#3a3430');
      if (has('bandaidHead')) p.rect(exx - 1, Math.round(headCy - ry * 0.45), 3, 2, '#e8c890');
      if (has('pencil')) p.line(hcx - 2, ey - 3, hcx + 1, ey - 1, '#e8c040');
      if (has('sunglassesUp')) p.rect(exx - 1, Math.round(headCy - ry + 2), 4, 2, '#1a1a1e');
      const gl = P.glasses === true ? 'round' : P.glasses;
      if (gl) {
        const fc = P.frameC || '#3a3040';
        if (gl === 'square' || gl === 'cat') p.frame(exx - 1, ey - 2, 4, 4, fc); else if (gl === 'half') p.rect(exx - 1, ey + 1, 4, 1, fc); else p.ring(exx + 0.5, ey + 0.5, 2.6, 2.6, fc);
        p.line(exx - 2, ey - 1, hcx - 1, ey - 1, fc);
        if (P.chain) for (let y = ey + 1; y < headCy + ry + 3; y += 2) p.set(hcx - 1, y, P.chain);
      }
    }

    // hair shading: a shadow line where hair meets skin, and a few highlight strands
    const hl = shade(hair, 1.28), hd = shade(hair, 0.72);
    const x0h = Math.floor(hcx - rx - 3), x1h = Math.ceil(hcx + rx + 3), y0h = Math.floor(headCy - ry - 6), y1h = Math.ceil(headCy + ry + 6);
    const src = p.clone();
    const same = (x, y, c) => { const a = src.get(x, y), b = hex(c); return a[3] && a[0] === b[0] && a[1] === b[1] && a[2] === b[2]; };
    for (let y = y0h; y <= y1h; y++) for (let x = x0h; x <= x1h; x++) {
      if (!same(x, y, hair)) continue;
      if (same(x, y + 1, skin)) p.set(x, y, hd);
      else if (y < headCy - ry * 0.35 && x < hcx && (x * 3 + y * 5) % 7 === 0) p.set(x, y, hl);
    }
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
