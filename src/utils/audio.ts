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
      // Setup master dynamics compressor to prevent volume clipping while keeping sound loud & crisp
      compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
      compressor.knee.setValueAtTime(30, audioCtx.currentTime);
      compressor.ratio.setValueAtTime(4, audioCtx.currentTime);
      compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
      compressor.release.setValueAtTime(0.2, audioCtx.currentTime);

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.9, audioCtx.currentTime);

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
 * Synchronously resume audio context inside user gesture (crucial for iOS Safari / WebKit)
 */
export const resumeAudio = () => {
  const ctx = initAudio();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
};

let nyanStepIdx = 0;
const NYAN_STEP_FREQS = [554.37, 622.25, 739.99, 830.61, 739.99, 622.25, 554.37, 493.88];

/**
 * Play move sound:
 * - Nyan Cat mode: Iconic 8-bit chip synth melody blips
 * - Kids mode: Plump, bouncy, clearly audible bubble water pop (Pop! 🫧)
 * - Standard mode: Crisp wooden step tick
 */
export const playMoveSound = (
  enabled: boolean,
  isKids: boolean = false,
  playerEmoji?: string
) => {
  if (!enabled) return;
  const ctx = initAudio();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const isNyanCat = playerEmoji === '🌈🐱' || playerEmoji === '🐱';

  if (isNyanCat) {
    // 🐱 8-bit Nyan Cat Chiptune Blip
    const freq = NYAN_STEP_FREQS[nyanStepIdx % NYAN_STEP_FREQS.length];
    nyanStepIdx++;

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.13, now);
    gain.gain.setValueAtTime(0.13, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {}
    };

    osc.start(now);
    osc.stop(now + 0.09);
  } else if (playerEmoji === '🚀') {
    // 🚀 Rocket Jet Pulse
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

    gain.gain.setValueAtTime(0.13, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {}
    };

    osc.start(now);
    osc.stop(now + 0.08);
  } else if (playerEmoji === '🦄') {
    // 🦄 Magical Fairy Sparkle Chime
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.09);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {}
    };

    osc.start(now);
    osc.stop(now + 0.11);
  } else if (playerEmoji === '💩') {
    // 💩 Funny cartoon squishy wobble
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {}
    };

    osc.start(now);
    osc.stop(now + 0.1);
  } else if (isKids) {
    // 🫧 Plump, juicy, bouncy bubble pop that sounds great on phone speakers (~110ms)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.035);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.09);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.setValueAtTime(0.22, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {}
    };

    osc.start(now);
    osc.stop(now + 0.11);
  } else {
    // Crisp step tap (~70ms)
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {}
    };

    osc.start(now);
    osc.stop(now + 0.07);
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
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.11);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  } else {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.06);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
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
  osc.stop(now + 0.12);
};

export const playWinSound = (
  enabled: boolean,
  isKids: boolean = false,
  playerEmoji?: string
) => {
  if (!enabled) return;
  const ctx = initAudio();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;
  const isNyanCat = playerEmoji === '🌈🐱' || playerEmoji === '🐱';

  // Helper to play an authentic bright 8-bit lead note
  const play8BitNote = (freq: number, startSec: number, durSec: number, vol = 0.11) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, startSec);

    gain.gain.setValueAtTime(vol, startSec);
    gain.gain.setValueAtTime(vol, startSec + durSec * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, startSec + durSec);

    osc.connect(gain);
    gain.connect(masterGain!);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {}
    };

    osc.start(startSec);
    osc.stop(startSec + durSec);
  };

  if (isNyanCat) {
    // 🐱🌈 Iconic Nyan Cat 8-Bit Victory Song Melody!
    const FS4 = 369.99, GS4 = 415.30, AS4 = 466.16, B4 = 493.88;
    const CS5 = 554.37, D5 = 587.33, DS5 = 622.25, E5 = 659.25, FS5 = 739.99, GS5 = 830.61, AS5 = 932.33, B5 = 987.77;

    const nyanMelody = [
      // Phrase 1: Nyan-nyan-nyan-nyan...
      { f: FS5, d: 0.11 }, { f: GS5, d: 0.11 }, { f: DS5, d: 0.11 }, { f: DS5, d: 0.11 },
      { f: B4,  d: 0.11 }, { f: D5,  d: 0.11 }, { f: CS5, d: 0.11 }, { f: B4,  d: 0.22 },
      { f: B4,  d: 0.11 }, { f: CS5, d: 0.11 }, { f: D5,  d: 0.11 }, { f: D5,  d: 0.11 },
      { f: CS5, d: 0.11 }, { f: B4,  d: 0.11 }, { f: CS5, d: 0.11 }, { f: DS5, d: 0.22 },
      // Phrase 2:
      { f: FS5, d: 0.11 }, { f: GS5, d: 0.11 }, { f: DS5, d: 0.11 }, { f: FS5, d: 0.11 },
      { f: CS5, d: 0.11 }, { f: DS5, d: 0.11 }, { f: B4,  d: 0.11 }, { f: CS5, d: 0.11 },
      { f: B4,  d: 0.11 }, { f: DS5, d: 0.11 }, { f: FS5, d: 0.11 }, { f: GS5, d: 0.11 },
      { f: DS5, d: 0.11 }, { f: FS5, d: 0.11 }, { f: CS5, d: 0.11 }, { f: DS5, d: 0.11 },
      // Finale High Notes:
      { f: B4,  d: 0.11 }, { f: D5,  d: 0.11 }, { f: DS5, d: 0.11 }, { f: D5,  d: 0.11 },
      { f: CS5, d: 0.11 }, { f: B4,  d: 0.11 }, { f: CS5, d: 0.11 }, { f: B5,  d: 0.60 },
    ];

    let tCursor = 0;
    nyanMelody.forEach((note) => {
      play8BitNote(note.f, now + tCursor, note.d, 0.12);
      tCursor += note.d;
    });
  } else if (isKids) {
    // 🎺 Authentic ~4.5s Super Mario Style Level Clear Victory Anthem 🎺
    const G3 = 196.0, C4 = 261.63, G4 = 392.0;
    const Ab4 = 415.3, Bb4 = 466.16, B4 = 493.88;
    const C5 = 523.25, D5 = 587.33, Eb5 = 622.25, E5 = 659.25, F5 = 698.46, G5 = 783.99, Ab5 = 830.61, Bb5 = 932.33;
    const C6 = 1046.5, E6 = 1318.51, G6 = 1567.98;

    // Helper to play a warm harmonic chord
    const playChord = (freqs: number[], startSec: number, durSec: number, vol = 0.08) => {
      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, startSec);

        gain.gain.setValueAtTime(vol, startSec);
        gain.gain.setValueAtTime(vol * 0.8, startSec + durSec * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, startSec + durSec);

        osc.connect(gain);
        gain.connect(masterGain!);

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        };

        osc.start(startSec);
        osc.stop(startSec + durSec);
      });
    };

    // 1. Ascending Intro Flourish (0.0s - 1.1s)
    const introNotes = [
      { f: G4, t: 0.0, d: 0.075 },
      { f: C5, t: 0.08, d: 0.075 },
      { f: E5, t: 0.16, d: 0.075 },
      { f: G5, t: 0.24, d: 0.075 },
      { f: C6, t: 0.32, d: 0.1 },
      { f: E6, t: 0.43, d: 0.2 },
      { f: G6, t: 0.65, d: 0.32 },
      { f: E6, t: 1.0, d: 0.25 },
    ];
    introNotes.forEach((n) => play8BitNote(n.f, now + n.t, n.d, 0.12));

    // 2. Triumphant March Phrase 1: Ab4 -> C5 -> Eb5 -> Ab5 (Held) (1.3s - 1.9s)
    play8BitNote(Ab4, now + 1.3, 0.08, 0.11);
    play8BitNote(C5, now + 1.39, 0.08, 0.11);
    play8BitNote(Eb5, now + 1.48, 0.08, 0.11);
    play8BitNote(Ab5, now + 1.57, 0.35, 0.13);
    playChord([Ab4, C5, Eb5], now + 1.57, 0.35, 0.06);

    // 3. Triumphant March Phrase 2: Bb4 -> D5 -> F5 -> Bb5 (Held) (1.95s - 2.5s)
    play8BitNote(Bb4, now + 1.95, 0.08, 0.11);
    play8BitNote(D5, now + 2.04, 0.08, 0.11);
    play8BitNote(F5, now + 2.13, 0.08, 0.11);
    play8BitNote(Bb5, now + 2.22, 0.35, 0.13);
    playChord([Bb4, D5, F5], now + 2.22, 0.35, 0.06);

    // 4. Pre-Finale Triplets: B4 -> D5 -> F5 -> G5 (2.6s - 3.0s)
    play8BitNote(B4, now + 2.6, 0.08, 0.11);
    play8BitNote(D5, now + 2.69, 0.08, 0.11);
    play8BitNote(F5, now + 2.78, 0.08, 0.11);
    play8BitNote(G5, now + 2.87, 0.18, 0.13);

    // 5. Grand Mario Finale: Dun! Dun! Dun! DAAAAN! (3.1s - 4.6s)
    const finaleHits = [
      { t: 3.12, d: 0.14 },
      { t: 3.32, d: 0.14 },
      { t: 3.52, d: 0.14 },
    ];
    finaleHits.forEach((hit) => {
      play8BitNote(C6, now + hit.t, hit.d, 0.13);
      playChord([C5, E5, G5], now + hit.t, hit.d, 0.07);
    });

    // Final Grand Chord Hold with Warm Bass (3.72s - 4.8s)
    play8BitNote(C6, now + 3.72, 1.1, 0.14);
    play8BitNote(E6, now + 3.72, 1.1, 0.09);
    playChord([C4, G4, C5, E5, G5], now + 3.72, 1.1, 0.08);
    playChord([G3, C4], now + 3.72, 1.2, 0.07); // Warm Sub-Bass
  } else {
    // Standard Elegant C Major arpeggio + chime (~2.5s)
    const notes = [
      { f: 523.25, t: 0.0, d: 0.2 },
      { f: 659.25, t: 0.12, d: 0.2 },
      { f: 783.99, t: 0.24, d: 0.2 },
      { f: 1046.5, t: 0.36, d: 0.35 },
      { f: 1318.51, t: 0.72, d: 0.6 },
      { f: 1567.98, t: 1.35, d: 1.0 },
    ];
    notes.forEach((n) => {
      const noteStart = now + n.t;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, noteStart);

      gain.gain.setValueAtTime(0.1, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + n.d);

      osc.connect(gain);
      gain.connect(masterGain!);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };

      osc.start(noteStart);
      osc.stop(noteStart + n.d);
    });
  }
};

