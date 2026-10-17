/**
 * Audio Engine using Web Audio API
 * Generates retro 8-bit sound effects and procedural chiptune background music.
 */

export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.sfxVolume = 0.7;
        this.musicVolume = 0.4;
        this.isMuted = false;
        this.currentTrack = null;
        this.musicTimer = null;
        this.musicStep = 0;
        this.activeNodes = [];
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMuted(muted) {
        this.isMuted = muted;
        if (this.isMuted) {
            this.stopAllSounds();
        }
    }

    setSfxVolume(vol) {
        this.sfxVolume = Math.max(0, Math.min(1, vol));
    }

    setMusicVolume(vol) {
        this.musicVolume = Math.max(0, Math.min(1, vol));
    }

    stopAllSounds() {
        this.activeNodes.forEach(node => {
            try { node.stop(); } catch (e) {}
            try { node.disconnect(); } catch (e) {}
        });
        this.activeNodes = [];
    }

    // ==========================================
    // SOUND EFFECTS (SFX)
    // ==========================================

    playSonarPing() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.6);

        gain.gain.setValueAtTime(this.sfxVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 1.2);
    }

    playBubble() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const startFreq = 300 + Math.random() * 200;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 2.2, now + 0.12);

        gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.13);
    }

    playCoin() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

        gain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    playHit() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.2);

        // Noise buffer for metal crunch
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.7;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(600, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
        noise.start(now);
    }

    playBoost() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(320, now + 0.25);

        gain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    playTorpedo() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.25);

        gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    playExplosion() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.45;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(80, now + 0.45);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(this.sfxVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
    }

    playMonsterRoar() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(70, now);
        osc1.frequency.linearRampToValueAtTime(120, now + 0.4);
        osc1.frequency.exponentialRampToValueAtTime(40, now + 1.2);

        osc2.frequency.setValueAtTime(73, now);
        osc2.frequency.linearRampToValueAtTime(124, now + 0.4);
        osc2.frequency.exponentialRampToValueAtTime(42, now + 1.2);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, now);
        filter.frequency.linearRampToValueAtTime(800, now + 0.35);
        filter.frequency.exponentialRampToValueAtTime(150, now + 1.2);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.65, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.2);
        osc2.stop(now + 1.2);
    }

    playLockClick() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(800, now + 0.03);

        gain.gain.setValueAtTime(this.sfxVolume * 0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    playCorrectAnswer() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteTime = now + idx * 0.08;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, noteTime);

            gain.gain.setValueAtTime(this.sfxVolume * 0.3, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(noteTime);
            osc.stop(noteTime + 0.25);
        });
    }

    playWrongAnswer() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.setValueAtTime(120, now + 0.12);

        gain.gain.setValueAtTime(this.sfxVolume * 0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    playChestOpenFanfare() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const melody = [
            { f: 440, d: 0.12 }, // A4
            { f: 554.37, d: 0.12 }, // C#5
            { f: 659.25, d: 0.12 }, // E5
            { f: 880, d: 0.35 }   // A5
        ];

        let offset = 0;
        melody.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + offset;

            osc.type = 'square';
            osc.frequency.setValueAtTime(note.f, t);

            gain.gain.setValueAtTime(this.sfxVolume * 0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + note.d);

            offset += note.d * 0.9;
        });
    }

    // ==========================================
    // PROCEDURAL CHIPTUNE MUSIC
    // ==========================================

    playMusic(trackName) {
        if (this.currentTrack === trackName) return;
        this.stopMusic();
        this.currentTrack = trackName;
        this.musicStep = 0;

        if (this.isMuted || !this.ctx) return;

        const bpm = trackName === 'chase' ? 144 : trackName === 'descent' ? 96 : 108;
        const stepInterval = (60 / bpm) / 4; // 16th notes

        this.musicTimer = setInterval(() => {
            if (this.isMuted || !this.ctx) return;
            this.playMusicStep(trackName, this.musicStep);
            this.musicStep++;
        }, stepInterval * 1000);
    }

    stopMusic() {
        if (this.musicTimer) {
            clearInterval(this.musicTimer);
            this.musicTimer = null;
        }
        this.currentTrack = null;
    }

    playTone(freq, duration, type = 'square', volScale = 1.0) {
        if (this.isMuted || !this.ctx || freq <= 0) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);

            const vol = this.musicVolume * 0.18 * volScale;
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {
            // Audio context glitch prevention
        }
    }

    playMusicStep(track, step) {
        // Step within 32-step loop
        const s = step % 32;

        if (track === 'descent') {
            // Calm, mysterious, deep sea arpeggios
            const bassline = [110, 0, 110, 0, 130.81, 0, 110, 0, 98, 0, 98, 0, 110, 0, 123.47, 0];
            const bass = bassline[s % 16];
            if (bass > 0 && s % 2 === 0) {
                this.playTone(bass, 0.22, 'triangle', 1.2);
            }

            // Arp melody (Gm / Dm atmospheric chord)
            const arp = [
                220, 261.63, 329.63, 392, 440, 392, 329.63, 261.63,
                196, 246.94, 293.66, 392, 440, 392, 293.66, 246.94
            ];
            if (s % 2 === 0) {
                this.playTone(arp[s % 16], 0.12, 'sine', 0.8);
            }
        } else if (track === 'chase') {
            // Intense, driving, fast-paced monster chase
            // Aggressive pulsing bass
            const chaseBass = [
                73.42, 73.42, 146.83, 73.42, 82.41, 73.42, 87.31, 73.42,
                73.42, 73.42, 146.83, 73.42, 98.00, 87.31, 82.41, 73.42
            ];
            const bFreq = chaseBass[s % 16];
            this.playTone(bFreq, 0.09, 'sawtooth', 0.9);

            // Driving tension lead (minor 2nds and fast stabs)
            if (s % 4 === 0 || s % 8 === 6) {
                const leadFreqs = [293.66, 311.13, 349.23, 440, 415.3, 349.23, 293.66, 311.13];
                const lead = leadFreqs[Math.floor(s / 4) % leadFreqs.length];
                this.playTone(lead, 0.14, 'square', 0.85);
            }
        } else if (track === 'vault') {
            // Puzzle chamber contemplative chime
            const chordNotes = [
                [261.63, 329.63, 392], // C
                [220, 261.63, 329.63], // Am
                [174.61, 220, 261.63], // F
                [196, 246.94, 293.66]  // G
            ];
            if (s % 8 === 0) {
                const chord = chordNotes[Math.floor(s / 8) % chordNotes.length];
                chord.forEach((freq, idx) => {
                    setTimeout(() => {
                        this.playTone(freq, 0.35, 'triangle', 0.6);
                    }, idx * 40);
                });
            }
        } else if (track === 'menu') {
            // Friendly retro adventure intro
            const melody = [
                261.63, 0, 329.63, 0, 392, 0, 523.25, 0,
                440, 0, 392, 0, 329.63, 0, 293.66, 0
            ];
            const m = melody[s % 16];
            if (m > 0 && s % 2 === 0) {
                this.playTone(m, 0.18, 'square', 0.6);
            }
        }
    }
}
