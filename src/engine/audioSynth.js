// Procedural Retro Web Audio Synthesizer (100% Web Audio API - Zero External Media)

export class AudioSynth {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.ambientGain = null;

    this.isMuted = false;
    this.masterVolume = 0.7;
    this.sfxVolume = 0.8;
    this.ambientVolume = 0.3;

    this.ambientInterval = null;
    this.currentThemeId = 'djinn';
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.ambientGain = this.ctx.createGain();

    this.sfxGain.connect(this.masterGain);
    this.ambientGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.updateVolumes();
  }

  unlock() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    this.updateVolumes();
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    this.updateVolumes();
  }

  setAmbientVolume(val) {
    this.ambientVolume = Math.max(0, Math.min(1, val));
    this.updateVolumes();
  }

  setMuted(muted) {
    this.isMuted = muted;
    this.updateVolumes();
  }

  updateVolumes() {
    if (!this.masterGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    const effMaster = this.isMuted ? 0 : this.masterVolume;
    this.masterGain.gain.setValueAtTime(effMaster, now);
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, now);
    this.ambientGain.gain.setValueAtTime(this.ambientVolume, now);
  }

  createNoiseBuffer(duration = 0.5) {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // 1. Voice Blips: square wave oscillator at baseFreq * (1 + ((charIndex % 5) * 0.06)), duration 45ms, exponential decay
  playVoiceBlip(baseFreq = 135, charIndex = 0) {
    this.unlock();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freq = baseFreq * (1 + ((charIndex % 5) * 0.06));
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.048);
  }

  // 2. Gore Crunch: white noise through bandpass (900Hz -> 180Hz over 180ms) + sawtooth thud (110Hz -> 35Hz)
  playGoreCrunch() {
    this.unlock();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Sawtooth bone thud
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

    oscGain.gain.setValueAtTime(0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.19);

    // Bandpass noise crunch
    const noise = this.createNoiseBuffer(0.18);
    if (noise) {
      const src = this.ctx.createBufferSource();
      src.buffer = noise;

      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(900, now);
      bp.frequency.exponentialRampToValueAtTime(180, now + 0.18);
      bp.Q.setValueAtTime(3.0, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.6, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      src.connect(bp);
      bp.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      src.start(now);
      src.stop(now + 0.19);
    }
  }

  // 3. Blood Spray: high-passed white noise (1800Hz) with modulated amplitude envelope over 350ms
  playBloodSpray() {
    this.unlock();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const noise = this.createNoiseBuffer(0.35);
    if (!noise) return;

    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(1800, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    src.connect(hp);
    hp.connect(gain);
    gain.connect(this.sfxGain);

    src.start(now);
    src.stop(now + 0.36);
  }

  // 4. Explosion: low-passed noise burst (600Hz -> 40Hz over 750ms) + sub-bass triangle drop (90Hz -> 20Hz)
  playExplosion() {
    this.unlock();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Sub-bass triangle drop
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(90, now);
    sub.frequency.exponentialRampToValueAtTime(20, now + 0.75);

    subGain.gain.setValueAtTime(0.85, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(now);
    sub.stop(now + 0.76);

    // Lowpassed noise
    const noise = this.createNoiseBuffer(0.75);
    if (noise) {
      const src = this.ctx.createBufferSource();
      src.buffer = noise;

      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(600, now);
      lp.frequency.exponentialRampToValueAtTime(40, now + 0.75);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.9, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      src.connect(lp);
      lp.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      src.start(now);
      src.stop(now + 0.76);
    }
  }

  // 5. Laser: sawtooth oscillator sweeping 1400Hz -> 120Hz over 280ms with pitch vibrato
  playLaser() {
    this.unlock();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.28);

    // Subtle pitch modulation vibrato
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(24, now);
    lfoGain.gain.setValueAtTime(40, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.29);
    osc.stop(now + 0.29);
  }

  // 6. Demon Laugh: 5 descending staccato sawtooth notes (t + i * 0.13s) with formant filtering
  playDemonLaugh(baseFreq = 130) {
    this.unlock();
    if (!this.ctx || this.isMuted) return;

    const intervals = [1.0, 0.92, 0.84, 0.74, 0.65];
    intervals.forEach((ratio, idx) => {
      const delay = idx * 0.13;
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        const f = baseFreq * ratio;
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.exponentialRampToValueAtTime(f * 0.85, now + 0.11);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(650, now);
        filter.Q.setValueAtTime(4.0, now);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.12);
      }, delay * 1000);
    });
  }

  // 7. Wish Chime: Ascending major arpeggio (C5 -> E5 -> G5 -> C6) if survived; Dissonant tritone doom chord (C3 + F#3 + B3) if dead
  playWishChime(survived = true) {
    this.unlock();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    if (survived) {
      // Ascending C Major Arpeggio (523.25, 659.25, 783.99, 1046.50)
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.65);
      });
    } else {
      // Dissonant Tritone Doom Chord: C3 (130.81) + F#3 (185.00) + B3 (246.94)
      const doomFreqs = [130.81, 185.00, 246.94];
      doomFreqs.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 1.25);
      });
    }
  }

  // Aliases & Utility Cues
  playBoneCrunch() {
    this.playGoreCrunch();
  }

  playLaugh(baseFreq = 135) {
    this.playDemonLaugh(baseFreq);
  }

  playChime() {
    this.playWishChime(true);
  }

  playThud(intensity = 1.0) {
    this.unlock();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

    const level = Math.min(0.8, 0.45 * intensity);
    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.24);
  }

  playCoin() {
    this.unlock();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    [1975.53, 2793.83].forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f + (Math.random() * 30 - 15), now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2 / (idx + 1), now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.36);
    });
  }

  // Stampede hoofbeats for charging deer herd
  playStampede() {
    this.unlock();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.08;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 - i * 15, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.06);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.08);
    }
  }

  // Crystalline absolute zero flash freeze / glass shatter
  playFreeze() {
    this.unlock();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    [1200, 1600, 2400, 3200].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.03);
      gain.gain.setValueAtTime(0.12, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.03);
      osc.stop(now + 0.65);
    });
  }

  // Paper flutter noise for blizzard of exam papers
  playPaperFlutter() {
    this.unlock();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.2);
    if (!noise) return;

    const source = this.ctx.createBufferSource();
    source.buffer = noise;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.setValueAtTime(3, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    source.start(now);
    source.stop(now + 0.2);
  }

  // Heavy titanium safe impact
  playSafeImpact() {
    this.playThud(2.0);
    this.playBoneCrunch();
  }

  // Cartoon squashed splat sound
  playSplat() {
    this.unlock();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Boing rubber noodle stretch sound
  playBoing() {
    this.unlock();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(500, now + 0.15);
    osc.frequency.linearRampToValueAtTime(220, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  playButton() {
    this.playVoiceBlip(600, 0);
  }

  playPoof() {
    this.playExplosion();
  }

  // Divine Golden Resurrection Chime (C5 -> E5 -> G5 -> C6 Arpeggio)
  playResurrectionChime() {
    this.unlock();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.55);
    });
  }

  // Frantic Heartbeat for Insanity / Panic
  playHeartbeat() {
    this.unlock();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Lub-dub double thumping pulse
    [0, 0.12].forEach((offset) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, now + offset);
      osc.frequency.exponentialRampToValueAtTime(35, now + offset + 0.09);

      gain.gain.setValueAtTime(0.35, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.11);
    });
  }

  // Quick manic giggle for madness stage
  playInsaneLaugh() {
    this.unlock();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554, 440, 659, 880];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq + (Math.random() * 40 - 20), now + idx * 0.05);

      gain.gain.setValueAtTime(0.08, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.06);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.07);
    });
  }

  startAmbientMusic(themeId = 'djinn') {
    this.currentThemeId = themeId;
    this.stopAmbientMusic();

    const scales = {
      djinn: [146.83, 155.56, 185.0, 196.0, 220.0, 233.08, 277.18, 293.66],
      arabian: [146.83, 155.56, 185.0, 196.0, 220.0, 233.08, 277.18, 293.66],
      arabian_nights: [146.83, 155.56, 185.0, 196.0, 220.0, 233.08, 277.18, 293.66],
      cyberpunk: [110.0, 130.81, 146.83, 164.81, 196.0, 220.0],
      cyberpunk_2099: [110.0, 130.81, 146.83, 164.81, 196.0, 220.0],
      cosmic: [65.41, 69.3, 77.78, 87.31, 98.0],
      cosmic_void: [65.41, 69.3, 77.78, 87.31, 98.0],
      shenron: [164.81, 196.0, 220.0, 246.94, 293.66, 329.63, 392.0, 440.0],
      shenron_dragon: [164.81, 196.0, 220.0, 246.94, 293.66, 329.63, 392.0, 440.0],
      demon: [123.47, 130.81, 146.83, 164.81, 174.61, 196.0, 220.0, 246.94],
      corporate_demon: [123.47, 130.81, 146.83, 164.81, 174.61, 196.0, 220.0, 246.94]
    };

    let step = 0;
    this.ambientInterval = setInterval(() => {
      if (!this.ctx || this.isMuted || this.ambientVolume <= 0) return;
      if (this.ctx.state === 'suspended') return;

      const scale = scales[this.currentThemeId] || scales.djinn;
      const freq = scale[step % scale.length];
      step = (step + 1) % scale.length;

      const actualFreq = Math.random() > 0.35 ? freq : scale[Math.floor(Math.random() * scale.length)];
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = this.currentThemeId === 'demon' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(actualFreq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(this.currentThemeId === 'demon' ? 400 : 850, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      osc.start(now);
      osc.stop(now + 2.3);
    }, 1200);
  }

  stopAmbientMusic() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }
}

export const audioSynth = new AudioSynth();
