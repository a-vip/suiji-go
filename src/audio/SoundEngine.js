export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  getContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playStoneClick(intensity = 1) {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Noise transient (the crisp "clack" of slate/shell striking Kaya wood)
    const bufSize = Math.floor(ctx.sampleRate * 0.07);
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      const t = i / bufSize;
      channelData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 11);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1750 + Math.random() * 350, now);
    filter.Q.setValueAtTime(1.6, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.16 * intensity, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    // 2. Wood body acoustic resonance
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const fundamental = 260 + Math.random() * 40;
    osc.frequency.setValueAtTime(fundamental, now);
    osc.frequency.exponentialRampToValueAtTime(fundamental * 0.45, now + 0.12);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.24 * intensity, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playCaptureSound(count = 1) {
    if (this.muted) return;
    const clicks = Math.min(count, 5);
    for (let i = 0; i < clicks; i++) {
      setTimeout(() => {
        this.playStoneClick(0.55 - i * 0.08);
      }, i * 65);
    }
  }

  playPassSound() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.18);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  playSuccessChime() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.09;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    });
  }
}
