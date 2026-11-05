/**
 * ProxiSpeak Week 4 — Multi-Zone Acoustic Reverb & Sabine RT60 Decay Manager
 * Author: Leela Sai Likhitha Yekollu <sailikhitha.yekollu@gmail.com>
 *
 * Models physical acoustic space characteristics across Floor 4 zones.
 * Dynamically synthesizes Sabine impulse responses and crossfades Web Audio API
 * ConvolverNode wet/dry balances as avatars transition between architectural rooms.
 */

export const OFFICE_REVERB_PROFILES = {
  "Executive Glass Boardroom": {
    volumeM3: 160,
    surfaceAreaM2: 210,
    avgAbsorption: 0.28, // Double pane glass + acoustic ceiling tiles
    rt60Seconds: 0.42,
    wetDryMix: 0.20,
    description: "Controlled acoustic reflection with double-pane glass dampening",
  },
  "Modern Reception Lobby": {
    volumeM3: 650,
    surfaceAreaM2: 520,
    avgAbsorption: 0.08, // Polished ceramic tile + open high ceiling
    rt60Seconds: 1.15,
    wetDryMix: 0.40,
    description: "Bright open space with reflective floor tiles and extended tail",
  },
  "Focus Cabin Alpha": {
    volumeM3: 35,
    surfaceAreaM2: 70,
    avgAbsorption: 0.75, // Acoustic foam sound absorbing wall panels
    rt60Seconds: 0.18,
    wetDryMix: 0.05,
    description: "Dead acoustic environment for private focus and zero resonance",
  },
  "Focus Cabin Beta": {
    volumeM3: 35,
    surfaceAreaM2: 70,
    avgAbsorption: 0.75,
    rt60Seconds: 0.18,
    wetDryMix: 0.05,
    description: "Dead acoustic environment for private focus and zero resonance",
  },
  "Dev Pod Alpha": {
    volumeM3: 320,
    surfaceAreaM2: 360,
    avgAbsorption: 0.22, // Fabric partition screens + carpet
    rt60Seconds: 0.55,
    wetDryMix: 0.18,
    description: "Moderate dampening with fabric screens and carpet absorption",
  },
  "Dev Pod Beta": {
    volumeM3: 320,
    surfaceAreaM2: 360,
    avgAbsorption: 0.22,
    rt60Seconds: 0.55,
    wetDryMix: 0.18,
    description: "Moderate dampening with fabric screens and carpet absorption",
  },
  "Cafeteria & Lounge": {
    volumeM3: 480,
    surfaceAreaM2: 430,
    avgAbsorption: 0.15,
    rt60Seconds: 0.85,
    wetDryMix: 0.32,
    description: "Semi-reflective social hub with warm acoustic decay",
  },
};

export class ReverbZoneManager {
  /**
   * @param {AudioContext} audioCtx
   */
  constructor(audioCtx) {
    this.ctx = audioCtx;
    this.currentZone = "Modern Reception Lobby";
    this.convolver = null;
    this.dryGain = null;
    this.wetGain = null;
    this.impulseCache = new Map();

    if (this.ctx) {
      this._initNodes();
    }
  }

  _initNodes() {
    this.convolver = this.ctx.createConvolver();
    this.dryGain = this.ctx.createGain();
    this.wetGain = this.ctx.createGain();

    this.setZone(this.currentZone);
  }

  /**
   * Calculate RT60 decay time using Wallace Sabine's formula:
   * RT60 = 0.161 * V / (S * a)
   */
  static calculateSabineRT60(volumeM3, surfaceAreaM2, avgAbsorption) {
    const totalAbsorption = surfaceAreaM2 * avgAbsorption;
    if (totalAbsorption <= 0) return 0.5;
    return Math.round(((0.161 * volumeM3) / totalAbsorption) * 100) / 100;
  }

  /**
   * Synthesize a sterile stereo impulse response matching a target RT60
   */
  generateImpulseResponse(rt60Seconds) {
    if (!this.ctx) return null;
    if (this.impulseCache.has(rt60Seconds)) {
      return this.impulseCache.get(rt60Seconds);
    }

    const sampleRate = this.ctx.sampleRate || 48000;
    const length = Math.floor(sampleRate * rt60Seconds);
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    // Exponential decay curve: -60 dB (0.001 amplitude factor) at t = rt60
    const decayConstant = 6.9077 / rt60Seconds; // ln(1000) / rt60

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-decayConstant * t);

      // Stereo white noise decay with subtle interaural decorrelation
      left[i] = (Math.random() * 2 - 1) * envelope;
      right[i] = (Math.random() * 2 - 1) * envelope;
    }

    this.impulseCache.set(rt60Seconds, impulse);
    return impulse;
  }

  /**
   * Update the active room profile and smoothly adjust equal-power wet/dry crossfade
   */
  setZone(zoneName) {
    const profile = OFFICE_REVERB_PROFILES[zoneName] || OFFICE_REVERB_PROFILES["Modern Reception Lobby"];
    this.currentZone = zoneName;

    if (!this.ctx || !this.convolver) return profile;

    const impulse = this.generateImpulseResponse(profile.rt60Seconds);
    if (impulse) {
      this.convolver.buffer = impulse;
    }

    // Equal-power crossfade between Dry and Wet channels
    const mix = profile.wetDryMix; // 0.0 to 1.0
    const dryLevel = Math.cos(mix * 0.5 * Math.PI);
    const wetLevel = Math.sin(mix * 0.5 * Math.PI);

    const now = this.ctx.currentTime;
    this.dryGain.gain.cancelScheduledValues(now);
    this.wetGain.gain.cancelScheduledValues(now);

    // 150ms smooth transition to prevent audio clicks
    this.dryGain.gain.setTargetAtTime(dryLevel, now, 0.05);
    this.wetGain.gain.setTargetAtTime(wetLevel, now, 0.05);

    return profile;
  }

  /**
   * Route audio through the parallel Dry/Wet reverb graph
   */
  connectSource(sourceNode) {
    if (!sourceNode) return;
    sourceNode.connect(this.dryGain);
    sourceNode.connect(this.convolver);
    this.convolver.connect(this.wetGain);
  }

  /**
   * Connect dry and wet gains to destination
   */
  connectDestination(destinationNode) {
    if (!destinationNode) return;
    this.dryGain.connect(destinationNode);
    this.wetGain.connect(destinationNode);
  }

  getTelemetry() {
    const profile = OFFICE_REVERB_PROFILES[this.currentZone] || OFFICE_REVERB_PROFILES["Modern Reception Lobby"];
    return {
      currentZone: this.currentZone,
      rt60Seconds: profile.rt60Seconds,
      avgAbsorption: profile.avgAbsorption,
      wetDryMix: profile.wetDryMix,
      cachedImpulsesCount: this.impulseCache.size,
      description: profile.description,
    };
  }
}
