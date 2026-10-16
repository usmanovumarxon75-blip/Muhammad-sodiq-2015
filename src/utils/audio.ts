/**
 * Procedural Web Audio API sound effects for CAR PLAY
 * Polished, pleasant, soft acoustic car sound:
 * - Warm, deep, soothing engine purr (no harsh sawtooth buzz, no high whistling "viii")
 * - Pleasant soft arcade passing chime
 * - Soft muffled thud on crash
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private engineOsc: OscillatorNode | null = null;
  private engineSub: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineGain: GainNode | null = null;
  private isEngineRunning: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Soft, gentle UI click
   */
  public playClick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Pleasant, harmonious chime when successfully passing an opponent car
   */
  public playPass() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Soft gentle two-tone chime (F#5 -> B5) - uplifting and sweet
      const freqs = [587.33, 880];
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const startTime = now + idx * 0.04;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.09, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Crystal sparkle bonus coin
   */
  public playCoin() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [659.25, 880, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const start = now + idx * 0.04;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.18);
      });
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Soft muffled thud/bump on crash - not loud or jarring
   */
  public playCrash() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.stopEngine();
      const now = this.ctx.currentTime;

      // Soft bass bump
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(110, now);
      subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.3);

      subGain.gain.setValueAtTime(0.35, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.32);

      // Low frequency soft muffled thump noise
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-8 * (i / bufferSize));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 0.25);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Starts a warm, soothing, muffled car engine hum.
   * Uses low-frequency sine waves with warm low-pass filtering.
   * Completely avoids harsh sawtooth buzzing ("vaq") and high-pitch whistles ("viii").
   */
  public startEngine() {
    if (!this.enabled || this.isEngineRunning) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Deep, soothing fundamental motor tone (warm sine wave, ~48 Hz)
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sine';
      this.engineOsc.frequency.setValueAtTime(48, now);

      // Soft sub harmonic (~24 Hz) for gentle low-end presence
      this.engineSub = this.ctx.createOscillator();
      this.engineSub.type = 'triangle';
      this.engineSub.frequency.setValueAtTime(24, now);

      // Warm low-pass filter cutting off anything above 130 Hz so it's smooth and muffled
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(130, now);

      // Gentle comfortable gain level
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.05, now);

      this.engineOsc.connect(this.engineFilter);
      this.engineSub.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start(now);
      this.engineSub.start(now);

      this.isEngineRunning = true;
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Smoothly scales the engine purr with car speed (soft glide between 48Hz and 78Hz)
   */
  public updateEnginePitch(speedRatio: number, isAccelerating: boolean = false) {
    if (!this.isEngineRunning || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Warm, smooth frequency range
      const targetFreq = 48 + Math.min(speedRatio * 28, 36) + (isAccelerating ? 6 : 0);

      if (this.engineOsc) {
        this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.1);
      }
      if (this.engineSub) {
        this.engineSub.frequency.setTargetAtTime(targetFreq * 0.5, now, 0.1);
      }
      if (this.engineFilter) {
        const filterFreq = 120 + Math.min(speedRatio * 50, 60);
        this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.1);
      }
      if (this.engineGain) {
        const targetVol = 0.045 + (isAccelerating ? 0.015 : 0);
        this.engineGain.gain.setTargetAtTime(targetVol, now, 0.1);
      }
    } catch {
      // Audio error ignored
    }
  }

  public stopEngine() {
    if (!this.isEngineRunning) return;
    try {
      const now = this.ctx?.currentTime || 0;
      if (this.engineGain && this.ctx) {
        this.engineGain.gain.setTargetAtTime(0.0001, now, 0.04);
      }

      setTimeout(() => {
        try {
          this.engineOsc?.stop();
          this.engineOsc?.disconnect();
          this.engineSub?.stop();
          this.engineSub?.disconnect();
        } catch {}
        this.engineOsc = null;
        this.engineSub = null;
        this.engineFilter = null;
      }, 50);
    } catch {
      // Audio error ignored
    }
    this.isEngineRunning = false;
  }

  public toggleMute(): boolean {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopEngine();
    }
    return this.enabled;
  }
}

export const sounds = new SoundEngine();
