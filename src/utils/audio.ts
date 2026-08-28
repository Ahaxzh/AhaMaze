// High-performance, normalized Web Audio synth for AhaMaze
const AudioContextClass =
  typeof window !== 'undefined'
    ? window.AudioContext || (window as any).webkitAudioContext
    : null;

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let compressor: DynamicsCompressorNode | null = null;

const initAudio = (): AudioContext | null => {
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContextClass();
      // Setup master dynamics compressor to prevent volume clipping or sudden loud/quiet bursts
      compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-18, audioCtx.currentTime);
      compressor.knee.setValueAtTime(30, audioCtx.currentTime);
      compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
      compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
      compressor.release.setValueAtTime(0.2, audioCtx.currentTime);

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.7, audioCtx.currentTime);

      masterGain.connect(compressor);
      compressor.connect(audioCtx.destination);
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

/**
 * Play move sound:
 * - Kids mode: Delightful bubble water pop (Pop! 🫧)
 * - Standard mode: Crisp step click
 */
export const playMoveSound = (enabled: boolean, isKids: boolean = false) => {
  if (!enabled) return;
  const ctx = initAudio();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  if (isKids) {
    // Joyful Bubble Pop: Fast sine frequency sweep up and down
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.02);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.045);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {}
    };

    osc.start(now);
    osc.stop(now + 0.045);
  } else {
    // Crisp step tick
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {}
    };

    osc.start(now);
    osc.stop(now + 0.05);
  }
};

/**
 * Play wall bump sound:
 * - Kids mode: Soft cartoon spring wobble (Boing!)
 * - Standard mode: Gentle low thump
 */
export const playBumpSound = (enabled: boolean, isKids: boolean = false) => {
  if (!enabled) return;
  const ctx = initAudio();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  if (isKids) {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.03);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
  } else {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  }

  osc.connect(gain);
  gain.connect(masterGain);

  osc.onended = () => {
    try {
      osc.disconnect();
      gain.disconnect();
    } catch {}
  };

  osc.start(now);
  osc.stop(now + 0.06);
};

/**
 * Play level clear victory fanfare:
 * - Kids mode: Super Mario / Nintendo Level-Clear fanfare (Fast rising arpeggio + triumphant victory brass fanfare!)
 * - Standard mode: Elegant C-Major celebratory arpeggio with golden chimes
 */
export const playWinSound = (enabled: boolean, isKids: boolean = false) => {
  if (!enabled) return;
  const ctx = initAudio();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;

  if (isKids) {
    // 🎺 Super Mario Style Level Clear Fanfare 🎺
    // Stage 1: Fast ascending 6-note arpeggio (G4 -> C5 -> E5 -> G5 -> C6 -> E6)
    const arpNotes = [392.0, 523.25, 659.25, 783.99, 1046.5, 1318.51];
    arpNotes.forEach((freq, idx) => {
      const noteStart = now + idx * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.12, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.12);

      osc.connect(gain);
      gain.connect(masterGain!);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };

      osc.start(noteStart);
      osc.stop(noteStart + 0.12);
    });

    // Stage 2: Triumphant Fanfare Chords (Beat 1 -> Beat 2 -> Grand C-Major Finale!)
    const chordTimeStart = now + 0.38;
    const chords = [
      // 1. Ab Major staccato (Ab4, C5, Eb5)
      { notes: [415.3, 523.25, 622.25], start: chordTimeStart, duration: 0.12, gainVal: 0.1 },
      // 2. Bb Major staccato (Bb4, D5, F5)
      { notes: [466.16, 587.33, 698.46], start: chordTimeStart + 0.15, duration: 0.12, gainVal: 0.1 },
      // 3. Grand C Major Finale (C5, E5, G5, C6) with rich sustain & shimmer
      { notes: [523.25, 659.25, 783.99, 1046.5], start: chordTimeStart + 0.32, duration: 0.8, gainVal: 0.14 },
    ];

    chords.forEach((chord) => {
      chord.notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, chord.start);

        gain.gain.setValueAtTime(chord.gainVal, chord.start);
        gain.gain.exponentialRampToValueAtTime(0.001, chord.start + chord.duration);

        osc.connect(gain);
        gain.connect(masterGain!);

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        };

        osc.start(chord.start);
        osc.stop(chord.start + chord.duration);
      });
    });
  } else {
    // Standard Elegant C Major arpeggio + chime
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteStart = now + i * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.1, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3);

      osc.connect(gain);
      gain.connect(masterGain!);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };

      osc.start(noteStart);
      osc.stop(noteStart + 0.3);
    });
  }
};

