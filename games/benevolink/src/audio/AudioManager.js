/**
 * Procedural Web Audio synthesizer and sound effects engine.
 * Requires 0 external audio files, works completely offline, and adapts tempo dynamically.
 */
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmNode = null;
    this.bgmPlaying = false;
    this.bgmTempo = 115; // BPM
    this.nextNoteTime = 0;
    this.step = 0;
    this.timerSfxInterval = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;

    // Load mute preference
    this.isMuted = localStorage.getItem('benevolink_muted') === 'true';
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.bgmGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    localStorage.setItem('benevolink_muted', this.isMuted);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  setSpeed(multiplier) {
    this.bgmTempo = Math.min(240, Math.max(100, 115 * multiplier));
  }

  // --- Procedural Cheery Corporate BGM (Bossa Nova / Elevator Funk) ---
  startBgm() {
    this.resume();
    if (this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.step = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.scheduleBgmLoop();
  }

  stopBgm() {
    this.bgmPlaying = false;
  }

  pauseBgm() {
    this.bgmWasPlaying = this.bgmPlaying;
    this.stopBgm();
  }

  resumeBgm() {
    if (this.bgmWasPlaying) {
      this.startBgm();
    }
  }

  scheduleBgmLoop() {
    if (!this.bgmPlaying) return;

    const secondsPer16th = (60 / this.bgmTempo) / 4;

    while (this.nextNoteTime < this.ctx.currentTime + 0.15) {
      this.playBgmStep(this.step, this.nextNoteTime);
      this.step = (this.step + 1) % 32;
      this.nextNoteTime += secondsPer16th;
    }

    requestAnimationFrame(() => this.scheduleBgmLoop());
  }

  playBgmStep(step, time) {
    if (!this.ctx || this.isMuted) return;

    // Cheerful corporate chord progression: Cmaj7 - Am7 - Dm7 - G7
    // Chord frequencies
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C4, E4, G4, B4)
      [220.00, 261.63, 329.63, 392.00], // Am7 (A3, C4, E4, G4)
      [293.66, 349.23, 440.00, 523.25], // Dm7 (D4, F4, A4, C5)
      [196.00, 246.94, 293.66, 349.23]  // G7 (G3, B3, D4, F4)
    ];

    const chordIndex = Math.floor(step / 8) % chords.length;
    const currentChord = chords[chordIndex];

    // Bassline (Plays on beats 0, 3, 6 of each 8-step bar)
    const localStep = step % 8;
    if (localStep === 0 || localStep === 3 || localStep === 6) {
      const rootFreq = currentChord[0] / 2; // Octave down
      this.playSynthNote(rootFreq, time, 0.18, 'triangle', 0.25, this.bgmGain);
    }

    // Light marimba / electric piano arpeggio
    if (localStep === 0 || localStep === 2 || localStep === 4 || localStep === 7) {
      const note = currentChord[localStep % currentChord.length];
      this.playSynthNote(note, time, 0.1, 'sine', 0.15, this.bgmGain);
    }

    // Hi-hat tick
    if (step % 2 === 0) {
      this.playNoisePercussion(time, 0.03, 0.04, 8000, this.bgmGain);
    }
  }

  playSynthNote(freq, time, duration, type = 'sine', volume = 0.2, destination = null) {
    if (!this.ctx) return;
    const dest = destination || this.sfxGain;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + duration);
  }

  playNoisePercussion(time, duration, volume, filterFreq = 6000, destination = null) {
    if (!this.ctx) return;
    const dest = destination || this.sfxGain;
    const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(filterFreq, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(time);
  }

  // --- Sound Effects Library ---
  playSfx(type) {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;

    switch (type) {
      case 'click': {
        this.playSynthNote(800, now, 0.04, 'triangle', 0.2);
        break;
      }
      case 'check': {
        this.playSynthNote(587.33, now, 0.06, 'sine', 0.3); // D5
        this.playSynthNote(880.00, now + 0.05, 0.1, 'sine', 0.3); // A5
        break;
      }
      case 'uncheck': {
        this.playSynthNote(784, now, 0.05, 'triangle', 0.2);
        this.playSynthNote(523, now + 0.04, 0.06, 'triangle', 0.15);
        break;
      }
      case 'win': {
        // Triumphant corporate chime (C5 -> E5 -> G5 -> C6)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          this.playSynthNote(freq, now + idx * 0.08, 0.25, 'sine', 0.4);
        });
        break;
      }
      case 'lose': {
        // Harsh corporate buzzer / record drop
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.4);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
      case 'swish': {
        this.playNoisePercussion(now, 0.15, 0.2, 1200);
        break;
      }
      case 'quack': {
        // Comic duck quack synthesis
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }
      case 'screech': {
        // Tire screech
        this.playNoisePercussion(now, 0.25, 0.35, 3000);
        break;
      }
      case 'thud': {
        // Soft impact / foam crash
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'shred': {
        // Paper shredder or trash chute
        this.playNoisePercussion(now, 0.3, 0.3, 2000);
        this.playSynthNote(180, now, 0.2, 'sawtooth', 0.15);
        break;
      }
      case 'alien': {
        // Bubbly alien squeak
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.1);
        osc.frequency.linearRampToValueAtTime(800, now + 0.2);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'radar': {
        this.playSynthNote(987.77, now, 0.08, 'sine', 0.25);
        break;
      }
      case 'fireExtinguisher': {
        this.playNoisePercussion(now, 0.35, 0.4, 1500);
        break;
      }
      case 'pour': {
        this.playNoisePercussion(now, 0.1, 0.15, 3500);
        break;
      }
      case 'ding': {
        this.playSynthNote(1318.51, now, 0.4, 'sine', 0.4); // E6
        break;
      }
      case 'splash': {
        // Water splash (noise rush + liquid bubble)
        this.playNoisePercussion(now, 0.35, 0.45, 1200);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.3);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
      case 'dogBark': {
        // Comic dog bark / woof
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.18);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.2);
        this.playNoisePercussion(now, 0.1, 0.2, 1800);
        break;
      }
      case 'boing': {
        // Cartoon spring rebound
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.28);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.32);
        break;
      }
      case 'foghorn': {
        // Deep resonant ocean liner steam horn
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(105, now);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(158, now); // perfect fifth

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.9);
        osc2.stop(now + 0.9);
        break;
      }
      case 'iceCrunch': {
        // Scraping metal on ice crunch
        this.playNoisePercussion(now, 0.45, 0.5, 1800);
        this.playSynthNote(90, now, 0.35, 'sawtooth', 0.3);
        break;
      }
      case 'promotion': {
        // Grand corporate rank-up trumpet arpeggio
        const fanfare = [392, 523.25, 659.25, 783.99, 1046.50];
        fanfare.forEach((f, i) => {
          this.playSynthNote(f, now + i * 0.09, 0.3, 'triangle', 0.35);
        });
        break;
      }
      case 'alarm': {
        // Urgent 2-tone alarm
        this.playSynthNote(880, now, 0.1, 'square', 0.2);
        this.playSynthNote(660, now + 0.12, 0.1, 'square', 0.2);
        break;
      }
      case 'countdownTick': {
        this.playSynthNote(900, now, 0.03, 'sine', 0.25);
        break;
      }
      case 'countdownFinal': {
        this.playSynthNote(1200, now, 0.07, 'triangle', 0.35);
        break;
      }
    }
  }

  // Voice narration using Web Speech API (with toggle safety)
  speakPrompt(text) {
    if (this.isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.35;
      utterance.pitch = 1.2;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Ignore speech synth restrictions
    }
  }
}
