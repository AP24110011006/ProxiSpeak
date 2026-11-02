/**
 * ProxiSpeak Week 4 — Dynamic Voice-Over-Music Audio Ducking Engine
 * Author: Leela Sai Likhitha Yekollu <sailikhitha.yekollu@gmail.com>
 *
 * Implements automated sidechain-style audio ducking in the Web Audio API.
 * When colleagues speak within earshot, background desk broadcasts and ambient
 * office soundscapes are smoothly attenuated by -12 dB (gain multiplier 0.25)
 * to maintain maximum vocal intelligibility.
 */

export class AudioDuckingProcessor {
  /**
   * @param {AudioContext} audioCtx
   * @param {Object} options
   */
  constructor(audioCtx, options = {}) {
    this.ctx = audioCtx;
    this.targetDuckingDb = options.duckingDb || -12; // -12 dB attenuation
    this.duckedGainMultiplier = Math.pow(10, this.targetDuckingDb / 20); // ~0.251
    this.normalGainMultiplier = 1.0;
    this.attackTimeSeconds = options.attackTime || 0.04; // 40ms attack
    this.releaseTimeSeconds = options.releaseTime || 0.35; // 350ms release

    // Master background ducking gain node
    this.duckingGainNode = this.ctx.createGain();
    this.duckingGainNode.gain.setValueAtTime(this.normalGainMultiplier, this.ctx.currentTime);

    // Active speaking peer registry
    this.activeSpeakers = new Set();
    this.isDucked = false;
  }

  /**
   * Connect an audio source (e.g. background broadcast or desk memo) into the ducking chain
   */
  connectSource(audioNode) {
    if (audioNode && typeof audioNode.connect === "function") {
      audioNode.connect(this.duckingGainNode);
    }
  }

  /**
   * Route the output of the ducking gain node to destination
   */
  connectDestination(destinationNode) {
    if (destinationNode && typeof destinationNode.connect === "function") {
      this.duckingGainNode.connect(destinationNode);
    }
  }

  /**
   * Update active speech presence for a coworker within earshot
   * @param {string} peerId
   * @param {boolean} isSpeaking
   */
  updateSpeakerStatus(peerId, isSpeaking) {
    if (isSpeaking) {
      this.activeSpeakers.add(peerId);
    } else {
      this.activeSpeakers.delete(peerId);
    }

    const shouldDuck = this.activeSpeakers.size > 0;
    if (shouldDuck !== this.isDucked) {
      this.isDucked = shouldDuck;
      this.applyGainEnvelope(shouldDuck);
    }
  }

  /**
   * Smooth exponential ramp using setTargetAtTime
   * @param {boolean} duck
   */
  applyGainEnvelope(duck) {
    if (!this.ctx || this.ctx.state === "closed") return;

    const target = duck ? this.duckedGainMultiplier : this.normalGainMultiplier;
    const timeConstant = duck ? this.attackTimeSeconds : this.releaseTimeSeconds;
    const now = this.ctx.currentTime;

    this.duckingGainNode.gain.cancelScheduledValues(now);
    this.duckingGainNode.gain.setTargetAtTime(target, now, timeConstant);
  }

  /**
   * Inspect current ducking state & active speaker count
   */
  getTelemetry() {
    return {
      isDucked: this.isDucked,
      activeSpeakerCount: this.activeSpeakers.size,
      currentGain: Math.round(this.duckingGainNode.gain.value * 100) / 100,
      duckingAttenuationDb: this.isDucked ? this.targetDuckingDb : 0,
      attackTimeMs: Math.round(this.attackTimeSeconds * 1000),
      releaseTimeMs: Math.round(this.releaseTimeSeconds * 1000),
    };
  }

  /**
   * Reset processor state
   */
  reset() {
    this.activeSpeakers.clear();
    this.isDucked = false;
    if (this.ctx && this.ctx.state !== "closed") {
      this.duckingGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.duckingGainNode.gain.setValueAtTime(this.normalGainMultiplier, this.ctx.currentTime);
    }
  }
}
