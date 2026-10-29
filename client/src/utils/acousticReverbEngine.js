/**
 * Week 3: Web Audio API ConvolverNode Acoustic Reverb Engine
 * Synthesizes physical room impulse responses using Sabine exponential decay envelopes
 * Author: Likhitha730 (likhitha branch)
 */

export class AcousticReverbEngine {
  constructor(audioContext = null) {
    this.ctx = audioContext || (typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext)
      ? new (window.AudioContext || window.webkitAudioContext)()
      : null);

    this.convolver = null;
    this.wetGain = null;
    this.dryGain = null;
    this.currentPreset = "boardroom";

    if (this.ctx) {
      this.convolver = this.ctx.createConvolver();
      this.wetGain = this.ctx.createGain();
      this.dryGain = this.ctx.createGain();

      this.wetGain.gain.value = 0.25;
      this.dryGain.gain.value = 0.85;

      // Initialize default boardroom impulse
      this.setRoomImpulse(0.35, 0.25);
    }
  }

  /**
   * Synthesize a physical room impulse response buffer
   * @param {number} durationSeconds - RT60 reverberation decay time (e.g. 0.35s)
   * @param {number} decayRate - Exponential decay slope
   * @param {boolean} reverse - Special reverse swell effect (false by default)
   */
  generateImpulseResponse(durationSeconds = 0.35, decayRate = 2.0, reverse = false) {
    if (!this.ctx) return null;

    const sampleRate = this.ctx.sampleRate;
    const length = Math.max(1, Math.floor(sampleRate * durationSeconds));
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = reverse ? length - i : i;
      // Exponential decay envelope: e^(-decayRate * t / T)
      const envelope = Math.pow(1 - n / length, decayRate);
      // Stereo decorrelated white noise burst
      left[i] = (Math.random() * 2 - 1) * envelope;
      right[i] = (Math.random() * 2 - 1) * envelope;
    }

    return impulse;
  }

  /**
   * Configure room impulse response for a specific zone
   * @param {number} rt60 - Reverberation time in seconds
   * @param {number} wetMix - Reverb wet volume (0.0 to 1.0)
   */
  setRoomImpulse(rt60 = 0.35, wetMix = 0.25) {
    if (!this.convolver || !this.ctx) return;

    try {
      this.convolver.buffer = this.generateImpulseResponse(rt60, 2.2);
      if (this.wetGain && this.dryGain) {
        this.wetGain.gain.setValueAtTime(Math.min(1.0, Math.max(0, wetMix)), this.ctx.currentTime);
        this.dryGain.gain.setValueAtTime(Math.min(1.0, Math.max(0, 1 - wetMix * 0.5)), this.ctx.currentTime);
      }
    } catch (err) {
      console.warn("[AcousticReverbEngine] Failed to set impulse buffer:", err.message);
    }
  }

  /**
   * Apply room preset by zone name
   */
  applyZonePreset(zoneName = "boardroom") {
    const key = zoneName.toLowerCase();
    if (key.includes("focus") || key.includes("cabin")) {
      this.currentPreset = "focus_cabins";
      this.setRoomImpulse(0.18, 0.08); // Ultra-dry acoustic booth
    } else if (key.includes("boardroom") || key.includes("meeting")) {
      this.currentPreset = "boardroom";
      this.setRoomImpulse(0.35, 0.20); // Damped conference glass
    } else if (key.includes("lobby") || key.includes("reception")) {
      this.currentPreset = "reception";
      this.setRoomImpulse(0.80, 0.45); // Spacious open lobby
    } else {
      this.currentPreset = "dev_pods";
      this.setRoomImpulse(0.50, 0.22); // Standard office room
    }
  }

  /**
   * Connect an audio source node through the dry/wet reverb convolver chain
   */
  connectSource(sourceNode, destinationNode) {
    if (!this.convolver || !this.wetGain || !this.dryGain || !sourceNode || !destinationNode) {
      return false;
    }

    try {
      // Dry path: source -> dryGain -> destination
      sourceNode.connect(this.dryGain);
      this.dryGain.connect(destinationNode);

      // Wet path: source -> convolver -> wetGain -> destination
      sourceNode.connect(this.convolver);
      this.convolver.connect(this.wetGain);
      this.wetGain.connect(destinationNode);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const defaultReverbEngine = new AcousticReverbEngine();
