// Audio feedback using Web Audio API for message events
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playSend() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      const now = this.ctx.currentTime;

      // Soft uplifting "pop"
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  playReceive() {
    this.playTone("default");
  }

  playTone(tone = "default") {
    if (!this.enabled || tone === "silent" || tone === "none") return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;

      if (tone === "pop") {
        this.playSend();
        return;
      }

      if (tone === "bell") {
        // Crystal Bell
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1046.5, now); // C6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
        return;
      }

      if (tone === "ping") {
        // Electronic Ping
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(784, now); // G5
        osc.frequency.exponentialRampToValueAtTime(1568, now + 0.08); // G6
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
        return;
      }

      if (tone === "pulse") {
        // Gentle pulse
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
        return;
      }

      // Default: Gentle double-tone chime
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.09); // A5
      gain2.gain.setValueAtTime(0.2, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.28);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  playCallerTune(tune = "ringing") {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;

      if (tune === "harmony") {
        // Melodic 3-chord arpeggio
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + i * 0.15);
          gain.gain.setValueAtTime(0.15, now + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.4);
        });
        return;
      }

      if (tune === "flute") {
        // Peaceful flute sine
        [440, 493.88, 554.37, 659.25].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + i * 0.2);
          gain.gain.setValueAtTime(0.12, now + i * 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.45);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.2);
          osc.stop(now + i * 0.2 + 0.45);
        });
        return;
      }

      if (tune === "guitar") {
        // Gentle acoustic pluck simulation
        [329.63, 392.00, 493.88, 587.33].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, now + i * 0.14);
          gain.gain.setValueAtTime(0.1, now + i * 0.14);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.14);
          osc.stop(now + i * 0.14 + 0.35);
        });
        return;
      }

      if (tune === "cosmic") {
        // Cosmic synthwave pulse
        [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(freq, now + i * 0.16);
          gain.gain.setValueAtTime(0.08, now + i * 0.16);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.16 + 0.3);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.16);
          osc.stop(now + i * 0.16 + 0.3);
        });
        return;
      }

      // Default Ringing: Traditional pleasant phone ring cadence (440Hz + 480Hz dual tone)
      const oscA = this.ctx.createOscillator();
      const oscB = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      oscA.type = "sine";
      oscB.type = "sine";
      oscA.frequency.setValueAtTime(440, now);
      oscB.frequency.setValueAtTime(480, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.setValueAtTime(0.15, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      oscA.connect(gain);
      oscB.connect(gain);
      gain.connect(this.ctx.destination);

      oscA.start(now);
      oscB.start(now);
      oscA.stop(now + 0.5);
      oscB.stop(now + 0.5);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }
}

export const soundEffects = new SoundEffects();
