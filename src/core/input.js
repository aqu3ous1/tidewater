'use strict';
// ---------------------------------------------------------------------------
// Input — keyboard + gamepad mapped onto a PlayStation-ish virtual pad.
//   up/down/left/right, a (confirm / interact), b (cancel / run),
//   start (pause), select (items)
// ---------------------------------------------------------------------------

const Input = (() => {
  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    KeyZ: 'a', Space: 'a', Enter: 'a', NumpadEnter: 'a',
    KeyX: 'b', ShiftLeft: 'b', ShiftRight: 'b', Backspace: 'b',
    Escape: 'start', KeyP: 'start',
    Tab: 'select', KeyC: 'select', KeyI: 'select',
  };
  const BUTTONS = ['up', 'down', 'left', 'right', 'a', 'b', 'start', 'select'];
  const kb = {}, pad = {}, prev = {}, now = {};
  let anyKeyCb = null;
  let typed = [];
  let lastActivity = performance.now();

  window.addEventListener('keydown', (e) => {
    const b = KEYMAP[e.code];
    if (b) { kb[b] = true; e.preventDefault(); }
    if (e.key && e.key.length === 1) typed.push(e.key);
    else if (e.key === 'Backspace') typed.push('\b');
    else if (e.key === 'Enter') typed.push('\n');
    lastActivity = performance.now();
    if (anyKeyCb) anyKeyCb(e);
  });
  window.addEventListener('keyup', (e) => {
    const b = KEYMAP[e.code];
    if (b) { kb[b] = false; e.preventDefault(); }
  });
  window.addEventListener('blur', () => { for (const k in kb) kb[k] = false; });

  function pollPad() {
    for (const b of BUTTONS) pad[b] = false;
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const g of pads) {
      if (!g) continue;
      const bt = (i) => g.buttons[i] && g.buttons[i].pressed;
      const ax = g.axes[0] || 0, ay = g.axes[1] || 0;
      if (bt(12) || ay < -0.5) pad.up = true;
      if (bt(13) || ay > 0.5) pad.down = true;
      if (bt(14) || ax < -0.5) pad.left = true;
      if (bt(15) || ax > 0.5) pad.right = true;
      if (bt(0)) pad.a = true;
      if (bt(1) || bt(2)) pad.b = true;
      if (bt(9)) pad.start = true;
      if (bt(8) || bt(3)) pad.select = true;
      pad.ax = ax; pad.ay = ay;
      if (BUTTONS.some((b) => pad[b])) lastActivity = performance.now();
    }
  }

  function update() {
    pollPad();
    for (const b of BUTTONS) { prev[b] = now[b]; now[b] = !!(kb[b] || pad[b]); }
  }

  const held = (b) => !!now[b];
  const pressed = (b) => !!now[b] && !prev[b];
  // consume a press so two systems don't both react
  const eat = (b) => { prev[b] = true; };
  function axis() {
    let x = 0, y = 0;
    if (now.left) x -= 1; if (now.right) x += 1; if (now.up) y -= 1; if (now.down) y += 1;
    if (pad.ax && Math.abs(pad.ax) > 0.25) x = pad.ax;
    if (pad.ay && Math.abs(pad.ay) > 0.25) y = pad.ay;
    const l = Math.hypot(x, y);
    if (l > 1) { x /= l; y /= l; }
    return [x, y];
  }
  function takeTyped() { const t = typed; typed = []; return t; }
  function idleTime() { return (performance.now() - lastActivity) / 1000; }
  // repeat for menus: pressed, then auto-repeat
  const rep = {};
  function repeat(b, dt) {
    if (pressed(b)) { rep[b] = 0.35; return true; }
    if (held(b)) { rep[b] -= dt; if (rep[b] <= 0) { rep[b] = 0.09; return true; } }
    return false;
  }
  return { update, held, pressed, eat, axis, takeTyped, idleTime, repeat, set onAnyKey(f) { anyKeyCb = f; } };
})();
