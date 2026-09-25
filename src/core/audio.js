'use strict';
// ---------------------------------------------------------------------------
// Audio — WebAudio synth, step sequencer, ambience beds and sound effects.
// Everything is synthesized; nothing is loaded. Music can be "damaged" at
// runtime (tempo drag, detune, dropped notes, pitch drift) for later scenes.
// ---------------------------------------------------------------------------

const Sound = (() => {
  let ctx = null, master, musicBus, sfxBus, ambBus, echo, echoGain, noiseBuf;
  let enabled = true;
  const vol = { master: 0.8, music: 0.7, sfx: 0.9 };
  const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  function midi(n) {
    if (typeof n === 'number') return n;
    const m = /^([A-G][#b]?)(-?\d)$/.exec(n);
    if (!m) return null;
    return 12 * (parseInt(m[2], 10) + 1) + NOTE[m[1]];
  }
  const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function unlock() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { enabled = false; return; }
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = vol.master;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 3;
    master.connect(comp); comp.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = vol.music; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = vol.sfx; sfxBus.connect(master);
    ambBus = ctx.createGain(); ambBus.gain.value = 1; ambBus.connect(master);
    // shared echo (feedback delay) for distance / big rooms
    echo = ctx.createDelay(1.0); echo.delayTime.value = 0.23;
    const fb = ctx.createGain(); fb.gain.value = 0.32;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
    echo.connect(lp); lp.connect(fb); fb.connect(echo);
    echoGain = ctx.createGain(); echoGain.gain.value = 0.35;
    lp.connect(echoGain); echoGain.connect(master);
    // noise buffer
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    setInterval(tick, 25);
  }

  function noiseSrc(loop) { const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = !!loop; return s; }
  function env(g, t, a, d, s, r, dur, peak) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(peak * s, 0.0002), t + a + d);
    g.gain.setValueAtTime(Math.max(peak * s, 0.0002), t + Math.max(dur, a + d));
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, a + d) + r);
    return t + Math.max(dur, a + d) + r + 0.02;
  }

  // ---- instruments ---------------------------------------------------------
  function playInst(inst, m, t, dur, vel, dest, cents) {
    if (!ctx) return;
    const f = freq(m) * Math.pow(2, (cents || 0) / 1200);
    const g = ctx.createGain(); g.connect(dest);
    let end;
    const osc = (type, fr) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = fr; return o; };
    switch (inst) {
      case 'glass': case 'bell': case 'musicbox': {
        const o = osc('sine', f), mod = osc('sine', f * (inst === 'musicbox' ? 4.0 : 2.0)), mg = ctx.createGain();
        mg.gain.setValueAtTime(f * (inst === 'bell' ? 1.2 : 0.6), t);
        mg.gain.exponentialRampToValueAtTime(1, t + 0.4);
        mod.connect(mg); mg.connect(o.frequency); o.connect(g);
        const decay = inst === 'glass' ? 1.4 : inst === 'musicbox' ? 0.9 : 1.1;
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
        end = t + decay + 0.05;
        o.start(t); mod.start(t); o.stop(end); mod.stop(end);
        break;
      }
      case 'lead': case 'square': {
        const o = osc('square', f), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1700; lp.Q.value = 0.5;
        o.connect(lp); lp.connect(g);
        end = env(g, t, 0.008, 0.12, 0.55, 0.07, dur, vel);
        o.start(t); o.stop(end);
        break;
      }
      case 'soft': {
        const o = osc('triangle', f), o2 = osc('sine', f * 2.001), g2 = ctx.createGain(); g2.gain.value = 0.25;
        o.connect(g); o2.connect(g2); g2.connect(g);
        end = env(g, t, 0.02, 0.2, 0.6, 0.15, dur, vel);
        o.start(t); o2.start(t); o.stop(end); o2.stop(end);
        break;
      }
      case 'bass': {
        const o = osc('triangle', f); o.connect(g);
        end = env(g, t, 0.005, 0.15, 0.7, 0.06, dur, vel);
        o.start(t); o.stop(end);
        break;
      }
      case 'pluck': {
        const o = osc('sawtooth', f), lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
        lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(300, t + 0.25);
        o.connect(lp); lp.connect(g);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        end = t + 0.4; o.start(t); o.stop(end);
        break;
      }
      case 'organ': {
        const o = osc('sine', f), o2 = osc('sine', f * 2), o3 = osc('sine', f * 3), gg = ctx.createGain(); gg.gain.value = 0.35;
        o.connect(g); o2.connect(gg); o3.connect(gg); gg.connect(g);
        end = env(g, t, 0.03, 0.1, 0.8, 0.2, dur, vel);
        o.start(t); o2.start(t); o3.start(t); o.stop(end); o2.stop(end); o3.stop(end);
        break;
      }
      case 'hat': {
        const n = noiseSrc(), hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
        n.connect(hp); hp.connect(g);
        g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
        end = t + 0.06; n.start(t, Math.random()); n.stop(end);
        break;
      }
      case 'kick': {
        const o = osc('sine', 120); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
        o.connect(g); g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        end = t + 0.2; o.start(t); o.stop(end);
        break;
      }
      case 'snare': {
        const n = noiseSrc(), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 0.7;
        n.connect(bp); bp.connect(g); g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        end = t + 0.14; n.start(t, Math.random()); n.stop(end);
        break;
      }
      default: return;
    }
  }

  // ---- songs ---------------------------------------------------------------
  // melody string: "A5:4 C6:4 r:8" (durations in 16th steps)
  function mel(str, inst, vel, octShift) {
    const ev = []; let s = 0;
    for (const tok of str.trim().split(/\s+/)) {
      const [n, l] = tok.split(':'); const len = parseInt(l, 10) || 1;
      if (n !== 'r') ev.push([s, midi(n) + (octShift || 0) * 12, len]);
      s += len;
    }
    return { inst, vel, ev };
  }
  function arp(chords, pattern, stepEvery, stepsPerChord, inst, vel, len, oct) {
    const ev = [];
    chords.forEach((ch, ci) => {
      const notes = ch.split(' ').map(midi);
      for (let s = 0, k = 0; s < stepsPerChord; s += stepEvery, k++) {
        const idx = pattern[k % pattern.length];
        if (idx == null || idx < 0) continue;
        ev.push([ci * stepsPerChord + s, notes[idx % notes.length] + 12 * ((oct || 0) + Math.floor(idx / notes.length)), len || stepEvery]);
      }
    });
    return { inst, vel, ev };
  }
  function hits(steps, every, offsets, inst, vel, m) {
    const ev = [];
    for (let s = 0; s < steps; s += every) for (const o of offsets) ev.push([s + o, m || 60, 1]);
    return { inst, vel, ev };
  }

  const AQ_CHORDS = ['F4 A4 C5 E5', 'E4 G4 B4 D5', 'D4 F4 A4 C5', 'C4 E4 G4 B4', 'Bb3 D4 F4 A4', 'A3 C4 E4 G4', 'G3 Bb3 D4 F4', 'C4 F4 G4 Bb4'];
  const AQ_BASS = 'F2:8 C3:6 r:2 E2:8 B2:6 r:2 D2:8 A2:6 r:2 C2:8 G2:6 r:2 Bb1:8 F2:6 r:2 A1:8 E2:6 r:2 G1:8 D2:6 r:2 C2:8 C2:6 r:2';
  const AQ_MEL = 'A5:4 C6:4 E6:8 D6:4 B5:4 G5:8 F5:4 A5:4 C6:6 A5:2 G5:12 r:4 F5:4 A5:4 D6:8 C6:4 E5:4 G5:8 Bb5:4 A5:4 G5:4 F5:4 G5:8 r:8';

  const SONGS = {
    // ---- dreams
    dream1: { // a lullaby in a cardboard box
      bpm: 66, len: 96,
      tracks: [
        mel('E5:6 D5:2 C5:4 E5:4 G5:8 E5:4 r:4 F5:6 E5:2 D5:4 F5:4 A5:8 G5:8 E5:6 D5:2 C5:4 E5:4 D5:4 B4:4 C5:8', 'musicbox', 0.07),
        mel('C3:16 A2:16 F2:16 G2:16 C3:16 G2:8 C3:8', 'bass', 0.06),
        arp(['C4 E4 G4', 'A3 C4 E4', 'F3 A3 C4', 'G3 B3 D4', 'C4 E4 G4', 'G3 B3 D4'], [0, -1, 1, -1, 2, -1, 1, -1], 2, 16, 'glass', 0.022, 2),
      ],
    },
    dream4: { // a parade, slowed down
      bpm: 76, len: 64,
      tracks: [
        mel('A2:4 E2:4 A2:4 E2:4 F2:4 C3:4 F2:4 C3:4 D3:4 A2:4 D3:4 A2:4 E2:4 B2:4 E2:4 E2:4', 'bass', 0.11),
        mel('A4:6 C5:2 E5:4 A4:4 F4:6 A4:2 C5:8 D5:6 C5:2 A4:4 F4:4 E4:8 G#4:4 E4:4', 'organ', 0.045),
        mel('r:2 A5:2 r:6 E5:2 r:4 r:2 F5:2 r:6 C5:2 r:4 r:2 D5:2 r:6 A4:2 r:4 r:2 E5:2 r:6 G#4:2 r:4', 'bell', 0.03),
        hits(64, 8, [0], 'kick', 0.06), hits(64, 8, [4], 'snare', 0.025), hits(64, 16, [14], 'snare', 0.018),
      ],
    },
    dream5: { // the town at the bottom of the sea
      bpm: 58, len: 128,
      tracks: [
        arp(['D4 F4 A4 C5', 'Bb3 D4 F4 A4', 'G3 Bb3 D4 F4', 'A3 C#4 E4 G4'], [0, 2, 1, 3], 4, 32, 'glass', 0.035, 3),
        mel('D2:32 Bb1:32 G1:32 A1:32', 'bass', 0.07),
        mel('A5:16 G5:8 F5:8 E5:16 D5:16 F5:16 E5:8 D5:8 C#5:32', 'soft', 0.04),
      ],
    },
    aquarium: {
      bpm: 80, len: 128,
      tracks: [
        arp(AQ_CHORDS, [0, 1, 2, 3, 2, 1, 2, 3], 2, 16, 'glass', 0.05, 2, 0),
        mel(AQ_BASS, 'bass', 0.13),
        mel(AQ_MEL, 'soft', 0.06),
      ],
    },
    title: {
      bpm: 88, len: 128,
      tracks: [
        arp(AQ_CHORDS, [0, 2, 1, 3, 0, 2, 1, 3], 2, 16, 'glass', 0.045, 2, 0),
        mel(AQ_BASS, 'bass', 0.12),
        mel(AQ_MEL, 'musicbox', 0.07),
        hits(128, 16, [0], 'kick', 0.06),
        hits(128, 4, [2], 'hat', 0.012),
      ],
    },
    town: {
      bpm: 116, len: 128,
      tracks: [
        mel('C3:3 r:3 G2:2 C3:3 r:1 G2:2 r:2 A2:3 r:3 E2:2 A2:3 r:1 E2:2 r:2 F2:3 r:3 C3:2 F2:3 r:1 C3:2 r:2 G2:3 r:3 D3:2 G2:3 r:1 D3:2 r:2 ' +
          'C3:3 r:3 G2:2 C3:3 r:1 G2:2 r:2 A2:3 r:3 E2:2 A2:3 r:1 E2:2 r:2 D3:3 r:3 A2:2 G2:3 r:1 D3:2 r:2 C3:3 r:3 G2:2 C3:4 r:4', 'bass', 0.14),
        arp(['C4 E4 G4', 'A3 C4 E4', 'F3 A3 C4', 'G3 B3 D4', 'C4 E4 G4', 'A3 C4 E4', 'D4 F4 A4', 'C4 E4 G4'], [-1, -1, 0, -1, -1, -1, 2, -1], 2, 16, 'pluck', 0.05, 1),
        arp(['C4 E4 G4', 'A3 C4 E4', 'F3 A3 C4', 'G3 B3 D4', 'C4 E4 G4', 'A3 C4 E4', 'D4 F4 A4', 'C4 E4 G4'], [-1, -1, 1, -1, -1, -1, 1, -1], 2, 16, 'pluck', 0.04, 1),
        mel('E5:2 G5:2 C6:4 B5:2 A5:2 G5:4 A5:2 G5:2 E5:4 C5:4 E5:4 F5:2 A5:2 C6:4 A5:2 F5:2 A5:4 G5:6 F5:2 E5:4 D5:4 ' +
          'E5:2 G5:2 C6:4 D6:2 C6:2 B5:4 A5:2 C6:2 E6:4 D6:4 C6:4 D6:4 F5:4 G5:4 B5:4 C6:8 r:8', 'lead', 0.045),
        hits(128, 8, [0], 'kick', 0.05),
        hits(128, 4, [2], 'hat', 0.015),
      ],
    },
    evening: {
      bpm: 84, len: 128,
      tracks: [
        mel('C3:16 A2:16 F2:16 G2:16 C3:16 A2:16 D3:8 G2:8 C3:16', 'bass', 0.1),
        mel('E5:2 G5:2 C6:4 B5:2 A5:2 G5:4 A5:2 G5:2 E5:4 C5:4 E5:4 F5:2 A5:2 C6:4 A5:2 F5:2 A5:4 G5:6 F5:2 E5:4 D5:4 ' +
          'E5:2 G5:2 C6:4 D6:2 C6:2 B5:4 A5:2 C6:2 E6:4 D6:4 C6:4 D6:4 F5:4 G5:4 B5:4 C6:8 r:8', 'bell', 0.05),
      ],
    },
    home: {
      bpm: 72, len: 96,
      tracks: [
        mel('C6:4 A5:4 F5:4 G5:4 E5:4 C5:4 D5:4 F5:4 A5:4 Bb5:8 A5:4 A5:4 C6:4 F6:4 E6:4 D6:4 C6:4 D6:4 Bb5:4 G5:4 F5:12', 'musicbox', 0.07),
        mel('F3:12 E3:12 D3:12 Bb2:12 F3:12 C3:12 Bb2:12 C3:12', 'bass', 0.07),
        arp(['F4 A4 C5', 'E4 G4 C5', 'D4 F4 A4', 'D4 F4 Bb4', 'F4 A4 C5', 'E4 G4 C5', 'D4 F4 Bb4', 'E4 G4 C5'], [-1, -1, -1, -1, 0, -1, -1, -1, 1, -1, 2, -1], 1, 12, 'glass', 0.025, 2),
      ],
    },
    diner: {
      bpm: 104, len: 64,
      tracks: [
        mel('G2:4 B2:4 D3:4 E3:4 C3:4 E3:4 G3:4 A3:4 G2:4 B2:4 D3:4 B2:4 D3:4 C3:4 B2:4 A2:4', 'bass', 0.14),
        arp(['G4 B4 D5', 'C4 E4 G4', 'G4 B4 D5', 'D4 F#4 A4'], [-1, -1, 0, -1, -1, -1, 1, -1, -1, -1, 2, -1, -1, -1, 1, -1], 1, 16, 'organ', 0.03, 2),
        mel('D5:3 B4:1 D5:4 E5:2 D5:2 B4:4 C5:3 E5:1 G5:4 E5:4 C5:4 D5:3 B4:1 G4:4 A4:2 B4:2 D5:4 C5:4 B4:4 A4:8', 'lead', 0.035),
        hits(64, 8, [0], 'kick', 0.05), hits(64, 8, [4], 'snare', 0.03), hits(64, 2, [0], 'hat', 0.01),
      ],
    },
    school: {
      bpm: 96, len: 64,
      tracks: [
        mel('C5:2 D5:2 E5:2 G5:2 A5:4 G5:4 E5:2 D5:2 C5:4 D5:8 C5:2 D5:2 E5:2 G5:2 A5:4 C6:4 A5:2 G5:2 E5:4 C5:8', 'musicbox', 0.06),
        mel('C3:8 A2:8 F2:8 G2:8 C3:8 A2:8 F2:8 C3:8', 'bass', 0.09),
      ],
    },
    church: {
      bpm: 60, len: 64,
      tracks: [
        mel('F3:16 C3:16 Bb2:16 C3:16', 'organ', 0.05),
        mel('A4:16 G4:16 F4:16 E4:16', 'organ', 0.035),
        mel('C5:8 D5:8 C5:8 A4:8 Bb4:8 A4:8 G4:16', 'organ', 0.03),
      ],
    },
    ending: {
      bpm: 66, len: 128,
      tracks: [
        arp(AQ_CHORDS, [0, 1, 2, 3, 2, 1, 2, 3], 2, 16, 'musicbox', 0.04, 2, 0),
        mel(AQ_MEL, 'glass', 0.05, -1),
        mel(AQ_BASS, 'bass', 0.08),
      ],
    },
    underneath: {
      bpm: 80, len: 128,
      tracks: [
        arp(AQ_CHORDS, [0, 1, 2, 3, 2, 1, 2, 3], 2, 16, 'glass', 0.05, 2, 0),
        mel(AQ_BASS, 'bass', 0.12),
        mel(AQ_MEL, 'soft', 0.06),
      ],
    },
  };

  const seq = { song: null, name: null, step: 0, next: 0, gain: null, mods: { tempo: 1, detune: 0, drop: 0, drift: 0, octave: 0 } };

  function playMusic(name, opts) {
    opts = opts || {};
    if (!ctx) { seq.pending = name; return; }
    if (seq.name === name && seq.song && !opts.restart) return;
    stopMusic(opts.fadeOut != null ? opts.fadeOut : 0.6);
    if (!name || !SONGS[name]) { seq.name = null; return; }
    seq.song = SONGS[name]; seq.name = name; seq.step = 0; seq.next = ctx.currentTime + 0.1;
    seq.gain = ctx.createGain(); seq.gain.connect(musicBus);
    seq.gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    seq.gain.gain.linearRampToValueAtTime(opts.vol != null ? opts.vol : 1, ctx.currentTime + (opts.fadeIn || 0.3));
    if (!opts.keepMods) seq.mods = { tempo: 1, detune: 0, drop: 0, drift: 0, octave: 0 };
    seq.index = seq.song.tracks.map(() => 0);
  }
  function stopMusic(fade) {
    if (!ctx || !seq.gain) { seq.song = null; seq.name = null; return; }
    const g = seq.gain;
    g.gain.cancelScheduledValues(ctx.currentTime);
    g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + (fade || 0.05));
    setTimeout(() => { try { g.disconnect(); } catch (e) { /* noop */ } }, ((fade || 0.05) + 2.5) * 1000);
    seq.song = null; seq.name = null; seq.gain = null;
  }
  function musicMods(m) { Object.assign(seq.mods, m); }

  function tick() {
    if (!ctx) return;
    if (seq.pending) { const p = seq.pending; seq.pending = null; playMusic(p); }
    if (seq.song) {
      const s = seq.song;
      while (seq.next < ctx.currentTime + 0.15) {
        const stepDur = 60 / s.bpm / 4 / Math.max(0.2, seq.mods.tempo);
        for (const tr of s.tracks) {
          for (const e of tr.ev) {
            if (e[0] !== seq.step) continue;
            if (seq.mods.drop > 0 && Math.random() < seq.mods.drop) continue;
            const cents = (Math.random() * 2 - 1) * seq.mods.detune + seq.mods.drift;
            playInst(tr.inst, e[1] + seq.mods.octave * 12, seq.next, e[2] * stepDur * 0.95, tr.vel, seq.gain, cents);
          }
        }
        seq.next += stepDur;
        seq.step = (seq.step + 1) % s.len;
      }
    }
    ambTick();
  }

  // ---- ambience ------------------------------------------------------------
  const amb = {}; // name -> {gain, nodes, target}
  let ambWanted = [];
  let ambTimers = { birds: 0, crickets: 0, drips: 0, gulls: 0, bubbles: 0 };

  function makeAmb(name) {
    const g = ctx.createGain(); g.gain.value = 0.0001; g.connect(ambBus);
    const nodes = [];
    const lvl = { wind: 0.05, pump: 0.07, buzz: 0.012, river: 0.05, room: 0.012, hum: 0.03, tape: 0.03, deep: 0.08 }[name] || 0.02;
    if (name === 'wind' || name === 'river' || name === 'room' || name === 'tape') {
      const n = noiseSrc(true), lp = ctx.createBiquadFilter(); lp.type = name === 'tape' ? 'highpass' : 'lowpass';
      lp.frequency.value = name === 'wind' ? 420 : name === 'river' ? 700 : name === 'tape' ? 3000 : 300;
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = name === 'wind' ? 0.13 : 0.3; lg.gain.value = name === 'tape' ? 0 : lp.frequency.value * 0.4;
      lfo.connect(lg); lg.connect(lp.frequency); n.connect(lp); lp.connect(g); n.start(); lfo.start(); nodes.push(n, lfo);
    } else if (name === 'pump' || name === 'hum' || name === 'deep') {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = name === 'deep' ? 38 : 55;
      const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = name === 'deep' ? 57 : 110; const g2 = ctx.createGain(); g2.gain.value = 0.3;
      const n = noiseSrc(true), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180; const ng = ctx.createGain(); ng.gain.value = 0.8;
      o.connect(g); o2.connect(g2); g2.connect(g); n.connect(lp); lp.connect(ng); ng.connect(g);
      o.start(); o2.start(); n.start(); nodes.push(o, o2, n);
    } else if (name === 'buzz') {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 60;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
      o.connect(lp); lp.connect(g); o.start(); nodes.push(o);
    }
    amb[name] = { g, nodes, lvl, cur: 0 };
    return amb[name];
  }
  function ambience(list, fade) {
    ambWanted = list || [];
    if (!ctx) return;
    const t = ctx.currentTime, f = fade == null ? 1.2 : fade;
    for (const name of ['wind', 'pump', 'buzz', 'river', 'room', 'hum', 'tape', 'deep']) {
      const want = ambWanted.includes(name);
      if (want && !amb[name]) makeAmb(name);
      const a = amb[name];
      if (!a) continue;
      a.g.gain.cancelScheduledValues(t);
      a.g.gain.setValueAtTime(Math.max(a.g.gain.value, 0.0001), t);
      a.g.gain.exponentialRampToValueAtTime(want ? a.lvl * (ambBoost[name] || 1) : 0.0001, t + f);
    }
  }
  const ambBoost = {};
  function ambLevel(name, mult, fade) {
    ambBoost[name] = mult;
    if (!ctx || !amb[name]) return;
    const a = amb[name], t = ctx.currentTime;
    a.g.gain.cancelScheduledValues(t);
    a.g.gain.setValueAtTime(Math.max(a.g.gain.value, 0.0001), t);
    a.g.gain.exponentialRampToValueAtTime(Math.max(a.lvl * mult, 0.0001), t + (fade || 0.5));
  }
  function ambTick() {
    const dt = 0.025;
    for (const k in ambTimers) ambTimers[k] -= dt;
    if (ambWanted.includes('birds') && ambTimers.birds <= 0) { ambTimers.birds = 2 + Math.random() * 6; sfx('bird', { vol: 0.35 + Math.random() * 0.3 }); }
    if (ambWanted.includes('crickets') && ambTimers.crickets <= 0) { ambTimers.crickets = 0.5 + Math.random() * 1.5; sfx('cricket', { vol: 0.3 }); }
    if (ambWanted.includes('drips') && ambTimers.drips <= 0) { ambTimers.drips = 1.5 + Math.random() * 5; sfx('drip', { vol: 0.5 }); }
    if (ambWanted.includes('gulls') && ambTimers.gulls <= 0) { ambTimers.gulls = 5 + Math.random() * 10; sfx('gull', { vol: 0.25 }); }
    if (ambWanted.includes('bubbles') && ambTimers.bubbles <= 0) { ambTimers.bubbles = 0.8 + Math.random() * 3; sfx('bubble', { vol: 0.25 }); }
  }

  // ---- sound effects -------------------------------------------------------
  function sfx(name, o) {
    if (!ctx || !enabled) return;
    o = o || {};
    const t = ctx.currentTime + (o.delay || 0);
    const v = o.vol == null ? 1 : o.vol;
    let dest = sfxBus;
    if (o.far) { // distant: lowpass + echo
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.connect(sfxBus); lp.connect(echo); dest = lp;
    } else if (o.echo) { const gg = ctx.createGain(); gg.connect(sfxBus); gg.connect(echo); dest = gg; }
    const g = ctx.createGain(); g.connect(dest);
    const osc = (type, f) => { const x = ctx.createOscillator(); x.type = type; x.frequency.value = f; return x; };
    const nz = (f1, type, q) => { const n = noiseSrc(); const f = ctx.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.value = f1; if (q) f.Q.value = q; n.connect(f); f.connect(g); return [n, f]; };
    switch (name) {
      case 'blip': {
        const x = osc('square', o.pitch || 440); x.connect(g);
        g.gain.setValueAtTime(0.03 * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
        x.start(t); x.stop(t + 0.05); break;
      }
      case 'move': {
        const x = osc('square', 660); x.connect(g); g.gain.setValueAtTime(0.03 * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04); x.start(t); x.stop(t + 0.05); break;
      }
      case 'select': {
        const x = osc('square', 880); x.frequency.setValueAtTime(880, t); x.frequency.setValueAtTime(1320, t + 0.05);
        x.connect(g); g.gain.setValueAtTime(0.035 * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); x.start(t); x.stop(t + 0.13); break;
      }
      case 'cancel': {
        const x = osc('square', 440); x.frequency.setValueAtTime(440, t); x.frequency.setValueAtTime(330, t + 0.05);
        x.connect(g); g.gain.setValueAtTime(0.03 * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); x.start(t); x.stop(t + 0.13); break;
      }
      case 'pickup': {
        [72, 76, 79, 84].forEach((m, i) => playInst('bell', m, t + i * 0.07, 0.2, 0.09 * v, g));
        g.gain.value = 1; break;
      }
      case 'objective': {
        playInst('glass', 79, t, 0.4, 0.1 * v, g); playInst('glass', 84, t + 0.14, 0.6, 0.1 * v, g); g.gain.value = 1; break;
      }
      case 'objective_evan': {
        playInst('musicbox', 76, t, 0.4, 0.07 * v, g); playInst('musicbox', 75, t + 0.3, 0.6, 0.06 * v, g); g.gain.value = 1; break;
      }
      case 'step': {
        const surf = o.surf || 'hard';
        const f = { grass: 2500, carpet: 600, wood: 900, tile: 3500, hard: 2000, sand: 1800, metal: 3000, water: 1200 }[surf] || 2000;
        const [n] = nz(f, surf === 'grass' || surf === 'sand' ? 'highpass' : 'bandpass', 1.2);
        g.gain.setValueAtTime(0.05 * v * (surf === 'carpet' ? 0.6 : 1), t); g.gain.exponentialRampToValueAtTime(0.0001, t + (surf === 'grass' ? 0.07 : 0.05));
        n.start(t, Math.random()); n.stop(t + 0.1);
        if (surf === 'wood' || surf === 'metal') { const x = osc('sine', surf === 'metal' ? 300 : 120); const gg = ctx.createGain(); x.connect(gg); gg.connect(dest); gg.gain.setValueAtTime(0.05 * v, t); gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.06); x.start(t); x.stop(t + 0.07); }
        break;
      }
      case 'door': {
        const x = osc('sine', 90); x.frequency.setValueAtTime(110, t); x.frequency.exponentialRampToValueAtTime(50, t + 0.2); x.connect(g);
        g.gain.setValueAtTime(0.18 * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); x.start(t); x.stop(t + 0.32);
        const [n] = nz(800, 'bandpass', 3); const g2 = ctx.createGain(); n.disconnect(); n.connect(g2); g2.connect(dest);
        g2.gain.setValueAtTime(0.03 * v, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.15); n.start(t); n.stop(t + 0.2);
        break;
      }
      case 'locked': {
        for (let i = 0; i < 3; i++) {
          const n = noiseSrc(), f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 4;
          const gg = ctx.createGain(); n.connect(f); f.connect(gg); gg.connect(dest);
          gg.gain.setValueAtTime(0.12 * v, t + i * 0.07); gg.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 0.04);
          n.start(t + i * 0.07, Math.random()); n.stop(t + i * 0.07 + 0.05);
        }
        break;
      }
      case 'knock': {
        const n = o.n || 3;
        for (let i = 0; i < n; i++) {
          const x = osc('sine', 85), gg = ctx.createGain(); x.connect(gg); gg.connect(dest);
          const tt = t + i * (o.gap || 0.32);
          x.frequency.setValueAtTime(140, tt); x.frequency.exponentialRampToValueAtTime(60, tt + 0.08);
          gg.gain.setValueAtTime(0.25 * v, tt); gg.gain.exponentialRampToValueAtTime(0.0001, tt + 0.15); x.start(tt); x.stop(tt + 0.16);
        }
        break;
      }
      case 'phone': {
        // one ring burst (~1.6s)
        const a = osc('sine', 440), b = osc('sine', 480), am = osc('square', 20), amg = ctx.createGain();
        amg.gain.value = 0.5; am.connect(amg); const gg = ctx.createGain(); gg.gain.value = 0.5; amg.connect(gg.gain);
        a.connect(gg); b.connect(gg); gg.connect(g);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06 * v, t + 0.02); g.gain.setValueAtTime(0.06 * v, t + 1.5); g.gain.linearRampToValueAtTime(0.0001, t + 1.6);
        [a, b, am].forEach((x) => { x.start(t); x.stop(t + 1.65); });
        break;
      }
      case 'bell': {
        // a big church bell: a low strike with inharmonic partials and a long hum
        const base = (o.pitch || 1) * 196;
        [[1, 0.5], [2.02, 0.28], [2.51, 0.2], [3.03, 0.12], [4.2, 0.07], [0.5, 0.3]].forEach(([m, a]) => {
          const x = osc('sine', base * m), xg = ctx.createGain(); x.connect(xg); xg.connect(g);
          xg.gain.setValueAtTime(0.0001, t); xg.gain.exponentialRampToValueAtTime(a, t + 0.01); xg.gain.exponentialRampToValueAtTime(0.0001, t + 4.5 / Math.sqrt(m));
          x.start(t); x.stop(t + 4.6);
        });
        g.gain.setValueAtTime(0.16 * v, t);
        break;
      }
      case 'splash': {
        const [n, f] = nz(3000, 'lowpass'); f.frequency.setValueAtTime(3500, t); f.frequency.exponentialRampToValueAtTime(300, t + 0.5);
        g.gain.setValueAtTime(0.12 * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6); n.start(t, Math.random()); n.stop(t + 0.62); break;
      }
      case 'scrub': {
        const [n, f] = nz(2200, 'bandpass', 2); f.frequency.setValueAtTime(1800 + Math.random() * 1200, t);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06 * v, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        n.start(t, Math.random()); n.stop(t + 0.2); break;
      }
      case 'eat': {
        for (let i = 0; i < 4; i++) {
          const n = noiseSrc(), f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900 + Math.random() * 800; f.Q.value = 1;
          const gg = ctx.createGain(); n.connect(f); f.connect(gg); gg.connect(dest); const tt = t + i * 0.32;
          gg.gain.setValueAtTime(0.09 * v, tt); gg.gain.exponentialRampToValueAtTime(0.0001, tt + 0.12); n.start(tt, Math.random()); n.stop(tt + 0.13);
        }
        break;
      }
      case 'bird': {
        const x = osc('sine', 3000), n = 2 + Math.floor(Math.random() * 3); x.connect(g);
        g.gain.setValueAtTime(0.0001, t);
        for (let i = 0; i < n; i++) {
          const tt = t + i * 0.12, f0 = 2600 + Math.random() * 1400;
          x.frequency.setValueAtTime(f0, tt); x.frequency.exponentialRampToValueAtTime(f0 * 1.4, tt + 0.06);
          g.gain.setValueAtTime(0.012 * v, tt); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.08);
        }
        x.start(t); x.stop(t + n * 0.12 + 0.1); break;
      }
      case 'cricket': {
        const x = osc('sine', 4400), am = osc('square', 30), amg = ctx.createGain(); amg.gain.value = 0.5;
        const gg = ctx.createGain(); gg.gain.value = 0.5; am.connect(amg); amg.connect(gg.gain); x.connect(gg); gg.connect(g);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.01 * v, t + 0.02); g.gain.linearRampToValueAtTime(0.0001, t + 0.25);
        x.start(t); am.start(t); x.stop(t + 0.26); am.stop(t + 0.26); break;
      }
      case 'drip': {
        const x = osc('sine', 1400); x.frequency.setValueAtTime(1600, t); x.frequency.exponentialRampToValueAtTime(500, t + 0.08);
        const gg = ctx.createGain(); x.connect(gg); gg.connect(dest); gg.connect(echo);
        gg.gain.setValueAtTime(0.05 * v, t); gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.1); x.start(t); x.stop(t + 0.12); break;
      }
      case 'bubble': {
        const x = osc('sine', 500); x.frequency.setValueAtTime(300 + Math.random() * 300, t); x.frequency.exponentialRampToValueAtTime(900 + Math.random() * 400, t + 0.06);
        x.connect(g); g.gain.setValueAtTime(0.03 * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07); x.start(t); x.stop(t + 0.08); break;
      }
      case 'gull': {
        const x = osc('sawtooth', 900), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 3; x.connect(bp); bp.connect(g);
        for (let i = 0; i < 3; i++) { const tt = t + i * 0.22; x.frequency.setValueAtTime(1100, tt); x.frequency.exponentialRampToValueAtTime(700, tt + 0.18); g.gain.setValueAtTime(0.03 * v, tt); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.2); }
        x.start(t); x.stop(t + 0.7); break;
      }
      case 'laugh': { // distant children's laughter-ish
        const x = osc('sawtooth', 380), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 4; x.connect(bp); bp.connect(g);
        const n = 4 + Math.floor(Math.random() * 3);
        g.gain.setValueAtTime(0.0001, t);
        for (let i = 0; i < n; i++) {
          const tt = t + i * 0.14, p = 360 + Math.random() * 80 - i * 10;
          x.frequency.setValueAtTime(p, tt); x.frequency.linearRampToValueAtTime(p * 1.15, tt + 0.05); x.frequency.linearRampToValueAtTime(p * 0.9, tt + 0.1);
          g.gain.linearRampToValueAtTime(0.03 * v, tt + 0.02); g.gain.linearRampToValueAtTime(0.0001, tt + 0.11);
        }
        x.start(t); x.stop(t + n * 0.14 + 0.1); break;
      }
      case 'thud': {
        const x = osc('sine', 70); x.frequency.setValueAtTime(90, t); x.frequency.exponentialRampToValueAtTime(35, t + 0.3); x.connect(g);
        g.gain.setValueAtTime(0.35 * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45); x.start(t); x.stop(t + 0.5); break;
      }
      case 'click': {
        const [n] = nz(4000, 'highpass'); g.gain.setValueAtTime(0.08 * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.02); n.start(t); n.stop(t + 0.03); break;
      }
      case 'switch': {
        const [n] = nz(2500, 'bandpass', 2); g.gain.setValueAtTime(0.12 * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03); n.start(t); n.stop(t + 0.04);
        const x = osc('square', 180), gg = ctx.createGain(); x.connect(gg); gg.connect(dest); gg.gain.setValueAtTime(0.03 * v, t); gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.05); x.start(t); x.stop(t + 0.06);
        break;
      }
      case 'flicker': {
        const x = osc('sawtooth', 120), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; x.connect(lp); lp.connect(g);
        g.gain.setValueAtTime(0.0001, t);
        for (let i = 0; i < 6; i++) { const tt = t + i * 0.05 + Math.random() * 0.03; g.gain.setValueAtTime(i % 2 ? 0.0001 : 0.03 * v, tt); }
        g.gain.setValueAtTime(0.0001, t + 0.4); x.start(t); x.stop(t + 0.42); break;
      }
      case 'sting': { // very quiet, low. Used sparingly.
        const a = osc('sine', 55), b = osc('sine', 58.3); a.connect(g); b.connect(g);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.12 * v, t + 1.2); g.gain.exponentialRampToValueAtTime(0.0001, t + 4);
        a.start(t); b.start(t); a.stop(t + 4.1); b.stop(t + 4.1); break;
      }
      case 'tapeclick': {
        const [n] = nz(1800, 'bandpass', 1); g.gain.setValueAtTime(0.15 * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05); n.start(t); n.stop(t + 0.06);
        break;
      }
      case 'water': { // rushing water burst
        const [n, f] = nz(900, 'lowpass'); f.frequency.setValueAtTime(400, t); f.frequency.linearRampToValueAtTime(1600, t + 1.5);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.14 * v, t + 0.6); g.gain.linearRampToValueAtTime(0.0001, t + 2.4);
        n.start(t); n.stop(t + 2.5); break;
      }
      case 'paper': {
        const [n] = nz(5000, 'highpass'); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.04 * v, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18); n.start(t, Math.random()); n.stop(t + 0.2); break;
      }
      case 'save': {
        [67, 71, 74, 79].forEach((m, i) => playInst('musicbox', m, t + i * 0.1, 0.3, 0.07 * v, g)); g.gain.value = 1; break;
      }
      case 'boot': {
        playInst('glass', 60, t, 1, 0.12 * v, g); playInst('glass', 67, t + 0.12, 1, 0.1 * v, g); playInst('glass', 72, t + 0.24, 1, 0.1 * v, g); playInst('glass', 79, t + 0.36, 1.5, 0.08 * v, g);
        g.gain.value = 1; break;
      }
      case 'wrong': {
        const x = osc('square', 180), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 800; x.connect(lp); lp.connect(g);
        g.gain.setValueAtTime(0.05 * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25); x.start(t); x.stop(t + 0.26); break;
      }
      case 'collapse': {
        const [n, f] = nz(200, 'lowpass'); f.frequency.setValueAtTime(150, t); f.frequency.linearRampToValueAtTime(900, t + 3);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.25 * v, t + 2.5); g.gain.linearRampToValueAtTime(0.0001, t + 4.5);
        n.start(t); n.stop(t + 4.6); break;
      }
      default: break;
    }
  }

  function setVolume(which, v) {
    vol[which] = v;
    if (!ctx) return;
    if (which === 'master') master.gain.value = v;
    if (which === 'music') musicBus.gain.value = v;
    if (which === 'sfx') sfxBus.gain.value = v;
  }

  return {
    unlock, playMusic, stopMusic, musicMods, ambience, ambLevel, sfx, setVolume, vol,
    get ready() { return !!ctx; }, get current() { return seq.name; }, get mods() { return seq.mods; },
  };
})();
