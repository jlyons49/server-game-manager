/**
 * Realistic Deep-Sea Web Audio Engine
 * Procedurally generates realistic underwater acoustics, engine cavitation, sonar pings,
 * hydrothermal vent hisses, depth charge explosions, terrifying Leviathan roars,
 * and adaptive atmospheric ocean soundtracks without external audio files.
 */

export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.ambientGain = null;

        this.sfxVolume = 0.8;
        this.musicVolume = 0.5;
        this.isMuted = false;

        this.engineSoundNode = null;
        this.engineGain = null;
        this.engineFreq = null;

        this.currentTrack = null;
        this.musicTimer = null;
        this.musicStep = 0;
        this.activeNodes = [];
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();

            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = this.sfxVolume;
            this.sfxGain.connect(this.masterGain);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = this.musicVolume;
            this.musicGain.connect(this.masterGain);

            this.ambientGain = this.ctx.createGain();
            this.ambientGain.gain.value = 0.4;
            this.ambientGain.connect(this.masterGain);

            this.startUnderwaterAmbience();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMuted(muted) {
        this.isMuted = muted;
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05);
        }
    }

    setSfxVolume(vol) {
        this.sfxVolume = Math.max(0, Math.min(1, vol));
        if (this.sfxGain && this.ctx) {
            this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
        }
    }

    setMusicVolume(vol) {
        this.musicVolume = Math.max(0, Math.min(1, vol));
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
        }
    }

    // Continuous Deep Hydrophone Ambience (ocean rumble & pressure)
    startUnderwaterAmbience() {
        if (!this.ctx) return;
        try {
            // Pink-like filtered noise buffer for ocean current
            const bufferSize = this.ctx.sampleRate * 2;
            const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            let b0 = 0, b1 = 0, b2 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                output[i] = (b0 + b1 + b2) * 0.08;
            }

            const whiteNoise = this.ctx.createBufferSource();
            whiteNoise.buffer = noiseBuffer;
            whiteNoise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 180;

            whiteNoise.connect(filter);
            filter.connect(this.ambientGain);
            whiteNoise.start();

            // Very subtle sub-bass 48Hz drone
            const drone = this.ctx.createOscillator();
            drone.type = 'sine';
            drone.frequency.value = 48;
            const droneGain = this.ctx.createGain();
            droneGain.gain.value = 0.06;
            drone.connect(droneGain);
            droneGain.connect(this.ambientGain);
            drone.start();
        } catch (e) {
            console.warn('Ambience init issue:', e);
        }
    }

    // Real-time Submarine Engine & Cavitation Throttle sound
    updateEngineSound(speedRatio, isBoosting) {
        if (!this.ctx || this.isMuted) return;

        if (!this.engineSoundNode) {
            this.initEngineAudioNode();
        }

        if (this.engineSoundNode && this.engineGain && this.engineFreq) {
            const targetGain = 0.04 + speedRatio * 0.18 + (isBoosting ? 0.12 : 0);
            const targetFreq = 42 + speedRatio * 65 + (isBoosting ? 45 : 0);
            this.engineGain.gain.setTargetAtTime(targetGain * this.sfxVolume, this.ctx.currentTime, 0.1);
            this.engineFreq.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
        }
    }

    initEngineAudioNode() {
        try {
            const osc = this.ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.value = 45;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 220;

            const gain = this.ctx.createGain();
            gain.gain.value = 0;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);

            osc.start();
            this.engineSoundNode = osc;
            this.engineGain = gain;
            this.engineFreq = osc;
        } catch (e) {
            console.warn('Engine audio error:', e);
        }
    }

    // High-Fidelity Sonar Ping (Submarine Active Ping)
    playSonarPing() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1420, now);
        osc1.frequency.exponentialRampToValueAtTime(1080, now + 0.7);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1440, now);
        osc2.frequency.exponentialRampToValueAtTime(1100, now + 0.7);

        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 4.0;

        gain.gain.setValueAtTime(0.45 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 1.8);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.8);
        osc2.stop(now + 1.8);

        // Echo response after 0.45s
        setTimeout(() => {
            if (!this.ctx || this.isMuted) return;
            const echoNow = this.ctx.currentTime;
            const echoOsc = this.ctx.createOscillator();
            const echoGain = this.ctx.createGain();
            echoOsc.type = 'sine';
            echoOsc.frequency.setValueAtTime(1080, echoNow);
            echoOsc.frequency.exponentialRampToValueAtTime(860, echoNow + 0.8);
            echoGain.gain.setValueAtTime(0.18 * this.sfxVolume, echoNow);
            echoGain.gain.exponentialRampToValueAtTime(0.0001, echoNow + 0.8);
            echoOsc.connect(echoGain);
            echoGain.connect(this.sfxGain);
            echoOsc.start(echoNow);
            echoOsc.stop(echoNow + 0.8);
        }, 420);
    }

    // Sonic Torpedo Launch Whoosh
    playTorpedoLaunch() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + 0.5);

        gain.gain.setValueAtTime(0.5 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.5);
    }

    // Deep Underwater Explosion (Naval Mine / Torpedo Hit)
    playExplosion(intensity = 1.0) {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // White noise transient with deep resonant lowpass
        const bufferSize = Math.floor(this.ctx.sampleRate * 1.5);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.4));
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900 * intensity, now);
        filter.frequency.exponentialRampToValueAtTime(60, now + 1.4);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.85 * intensity * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        source.start(now);

        // Sub-bass shockwave impact
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(85, now);
        subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.9);
        subGain.gain.setValueAtTime(0.7 * intensity * this.sfxVolume, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

        subOsc.connect(subGain);
        subGain.connect(this.sfxGain);
        subOsc.start(now);
        subOsc.stop(now + 1.0);
    }

    // Terrifying Abyssal Leviathan Roar
    playLeviathanRoar() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';

        // Pitch envelope: rises from low depths, roars with vibrato, falls off
        osc1.frequency.setValueAtTime(65, now);
        osc1.frequency.exponentialRampToValueAtTime(145, now + 0.6);
        osc1.frequency.exponentialRampToValueAtTime(55, now + 2.2);

        osc2.frequency.setValueAtTime(70, now);
        osc2.frequency.exponentialRampToValueAtTime(155, now + 0.6);
        osc2.frequency.exponentialRampToValueAtTime(58, now + 2.2);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(220, now);
        filter.frequency.exponentialRampToValueAtTime(450, now + 0.6);
        filter.frequency.exponentialRampToValueAtTime(120, now + 2.2);
        filter.Q.value = 5.0;

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.9 * this.sfxVolume, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 2.4);
        osc2.stop(now + 2.4);
    }

    // Oxygen Vent / Bubbling Hiss
    playVentRecharge() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Warm bubble pop
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const startF = 350 + Math.random() * 200;
        osc.frequency.setValueAtTime(startF, now);
        osc.frequency.exponentialRampToValueAtTime(startF * 1.8, now + 0.12);

        gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Doubloon / Coin Pickup Chime
    playCoinPickup() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

        gain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    // Proximity Radar Warning Beep
    playProximityBeep(frequency = 880) {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, now);

        gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.09);
    }

    // Vault Lock Click (Tumbler turns)
    playLockClick() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

        gain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    // Lock Correct / Solved Chime
    playLockSuccess() {
        if (!this.ctx || this.isMuted) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const now = this.ctx.currentTime + idx * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now);
            osc.stop(now + 0.3);
        });
    }

    // Lock Error Buzz
    playLockError() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.setValueAtTime(110, now + 0.12);

        gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    // Relic Vault Opened Fanfare
    playVaultOpened() {
        if (!this.ctx || this.isMuted) return;
        const chords = [
            [261.63, 329.63, 392.00], // C
            [329.63, 392.00, 523.25], // Em
            [392.00, 493.88, 587.33], // G
            [523.25, 659.25, 783.99, 1046.50] // Cmaj
        ];
        chords.forEach((chord, step) => {
            const time = this.ctx.currentTime + step * 0.28;
            chord.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.22 * this.sfxVolume, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(time);
                osc.stop(time + 0.5);
            });
        });
    }

    // Surface Breach Victory Fanfare
    playVictoryFanfare() {
        if (!this.ctx || this.isMuted) return;
        const notes = [
            { f: 523.25, d: 0.18 }, // C5
            { f: 523.25, d: 0.18 }, // C5
            { f: 523.25, d: 0.18 }, // C5
            { f: 659.25, d: 0.45 }, // E5
            { f: 587.33, d: 0.22 }, // D5
            { f: 659.25, d: 0.22 }, // E5
            { f: 783.99, d: 0.8  }  // G5
        ];
        let t = this.ctx.currentTime;
        notes.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = note.f;
            gain.gain.setValueAtTime(0.4 * this.sfxVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + note.d);
            t += note.d * 1.1;
        });
    }

    // ==========================================
    // PROCEDURAL MUSIC SYSTEM
    // ==========================================
    playMusic(trackName) {
        if (this.currentTrack === trackName) return;
        this.stopMusic();
        this.currentTrack = trackName;
        this.musicStep = 0;

        if (trackName === 'descent') {
            this.startDescentMusic();
        } else if (trackName === 'vault') {
            this.startVaultMusic();
        } else if (trackName === 'chase') {
            this.startChaseMusic();
        }
    }

    stopMusic() {
        if (this.musicTimer) {
            clearInterval(this.musicTimer);
            this.musicTimer = null;
        }
        this.currentTrack = null;
    }

    startDescentMusic() {
        // Mysterious deep aquatic arpeggios (100 BPM)
        const scale = [196.00, 220.00, 246.94, 293.66, 329.63, 392.00, 440.00]; // G minor pentatonic/dorian
        const bassNotes = [98.00, 110.00, 87.31, 98.00];

        this.musicTimer = setInterval(() => {
            if (!this.ctx || this.isMuted) return;

            const t = this.ctx.currentTime;
            const step = this.musicStep % 16;

            // Ambient Lead Arp
            if (step % 2 === 0) {
                const note = scale[Math.floor(Math.random() * scale.length)];
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();

                osc.type = 'sine';
                osc.frequency.value = note;

                filter.type = 'lowpass';
                filter.frequency.value = 650;

                gain.gain.setValueAtTime(0.12 * this.musicVolume, t);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.musicGain);

                osc.start(t);
                osc.stop(t + 0.4);
            }

            // Warm Bass note on beat 1 and 3
            if (step % 8 === 0) {
                const bNote = bassNotes[(this.musicStep / 8) % bassNotes.length];
                const bOsc = this.ctx.createOscillator();
                const bGain = this.ctx.createGain();

                bOsc.type = 'triangle';
                bOsc.frequency.value = bNote;

                bGain.gain.setValueAtTime(0.18 * this.musicVolume, t);
                bGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

                bOsc.connect(bGain);
                bGain.connect(this.musicGain);

                bOsc.start(t);
                bOsc.stop(t + 1.2);
            }

            this.musicStep++;
        }, 150);
    }

    startVaultMusic() {
        // Contemplative Ancient Cipher music (60 BPM)
        const notes = [220.00, 261.63, 293.66, 349.23, 392.00, 440.00]; // D minor mystical
        this.musicTimer = setInterval(() => {
            if (!this.ctx || this.isMuted) return;
            const t = this.ctx.currentTime;
            const note = notes[this.musicStep % notes.length];

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = note;

            gain.gain.setValueAtTime(0.15 * this.musicVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);

            osc.connect(gain);
            gain.connect(this.musicGain);

            osc.start(t);
            osc.stop(t + 0.9);

            this.musicStep++;
        }, 320);
    }

    startChaseMusic() {
        // High-octane Leviathan Chase (144 BPM, driving 16th-note rhythm)
        const bassPattern = [65.41, 65.41, 77.78, 65.41, 87.31, 65.41, 77.78, 98.00]; // C minor punch
        this.musicTimer = setInterval(() => {
            if (!this.ctx || this.isMuted) return;
            const t = this.ctx.currentTime;
            const step = this.musicStep % 16;

            // Driving Saw Bass
            const f = bassPattern[step % bassPattern.length];
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sawtooth';
            osc.frequency.value = f;

            filter.type = 'lowpass';
            filter.frequency.value = step % 4 === 0 ? 600 : 350;

            gain.gain.setValueAtTime(0.22 * this.musicVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);

            osc.start(t);
            osc.stop(t + 0.18);

            // High tension acoustic pulse
            if (step % 4 === 2) {
                const highOsc = this.ctx.createOscillator();
                const highGain = this.ctx.createGain();
                highOsc.type = 'triangle';
                highOsc.frequency.value = 523.25; // C5
                highGain.gain.setValueAtTime(0.14 * this.musicVolume, t);
                highGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
                highOsc.connect(highGain);
                highGain.connect(this.musicGain);
                highOsc.start(t);
                highOsc.stop(t + 0.12);
            }

            this.musicStep++;
        }, 104);
    }
}
