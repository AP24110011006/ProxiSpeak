/**
 * Week 3: Unified Web Audio DSP Pipeline Integrator
 * Integrates HRTF Binaural Panner, Biquad Low-Pass Acoustic Wall Occlusion,
 * Sabine Convolver Reverb, Polar Directivity, and Multi-Channel FFT Analyzer
 * Author: Likhitha730 (likhitha branch)
 */

import { BinauralSpatialAudio } from "./binauralSpatialAudio.js";
import { AcousticReverbEngine } from "./acousticReverbEngine.js";
import { DirectionalMicrophone, POLAR_PATTERNS } from "./directionalMicrophone.js";
import { AudioSpectrumAnalyzer } from "./audioSpectrumAnalyzer.js";

export class AudioPipelineIntegrator {
  constructor(options = {}) {
    this.options = {
      sampleRate: 48000,
      enableReverb: true,
      enableOcclusion: true,
      ...options,
    };

    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.reverbEngine = null;
    this.spatialEngine = null;
    this.channels = new Map(); // peerId -> ChannelNodes
    this.listenerPos = { x: 400, y: 300, angle: 0 };
    this.ambientNoiseLevel = 35; // dB SPL baseline
  }

  /**
   * Initialize or resume Web Audio Context graph
   */
  async init() {
    if (typeof window === "undefined") return;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx({ sampleRate: this.options.sampleRate });
    }

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    // Dynamics Compressor to prevent digital clipping
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

    // Master Bus Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Reverb Engine
    this.reverbEngine = new AcousticReverbEngine(this.ctx);
    this.reverbEngine.connectToMaster(this.compressor);

    // Spatial Audio Listener
    this.spatialEngine = new BinauralSpatialAudio(this.ctx);
    this.spatialEngine.updateListener(this.listenerPos.x, this.listenerPos.y, this.listenerPos.angle);

    return this;
  }

  /**
   * Connect an incoming remote WebRTC peer audio stream into the DSP pipeline
   * @param {string} peerId
   * @param {MediaStream} stream
   * @param {Object} initialCoords - { x, y, angle }
   */
  addPeerStream(peerId, stream, initialCoords = { x: 400, y: 300, angle: 0 }) {
    if (!this.ctx) return;
    if (this.channels.has(peerId)) {
      this.removePeerStream(peerId);
    }

    try {
      const source = this.ctx.createMediaStreamSource(stream);

      // 1. Directivity / Polar Pattern Gain
      const directivityGain = this.ctx.createGain();
      directivityGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

      // 2. Biquad Low-Pass Acoustic Wall Occlusion Filter (450Hz cutoff when blocked)
      const occlusionFilter = this.ctx.createBiquadFilter();
      occlusionFilter.type = "lowpass";
      occlusionFilter.frequency.setValueAtTime(20000, this.ctx.currentTime); // default open air
      occlusionFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

      // 3. HRTF 3D Panner Node
      const panner = this.ctx.createPanner();
      panner.panningModel = "HRTF";
      panner.distanceModel = "inverse";
      panner.refDistance = 40 / 20; // 2 meters
      panner.maxDistance = 600 / 20; // 30 meters
      panner.rolloffFactor = 1.2;
      panner.coneInnerAngle = 360;

      // 4. Peer Channel Volume & Mute Fader
      const channelGain = this.ctx.createGain();
      channelGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

      // 5. FFT Visualizer Analyser
      const analyser = this.ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;

      // 6. Reverb Send Gain
      const reverbSend = this.ctx.createGain();
      reverbSend.gain.setValueAtTime(0.15, this.ctx.currentTime);

      // Wire DSP Graph: Source -> Directivity -> Filter -> Panner -> ChannelGain -> Compressor
      source.connect(directivityGain);
      directivityGain.connect(occlusionFilter);
      occlusionFilter.connect(panner);
      panner.connect(channelGain);

      channelGain.connect(this.compressor);
      channelGain.connect(analyser);

      // Auxiliary Reverb Send: Occluded audio sends to Convolver
      if (this.reverbEngine && this.reverbEngine.convolver) {
        panner.connect(reverbSend);
        reverbSend.connect(this.reverbEngine.convolver);
      }

      const micModel = new DirectionalMicrophone({ pattern: "cardioid" });

      const channelObj = {
        source,
        directivityGain,
        occlusionFilter,
        panner,
        channelGain,
        analyser,
        reverbSend,
        micModel,
        coords: { ...initialCoords },
        isOccluded: false,
        isMuted: false,
      };

      this.channels.set(peerId, channelObj);
      this.updatePeerPosition(peerId, initialCoords.x, initialCoords.y, initialCoords.angle || 0);

      return channelObj;
    } catch (err) {
      console.warn(`[AudioPipelineIntegrator] Failed to connect stream for peer ${peerId}:`, err);
      return null;
    }
  }

  /**
   * Update listener (local avatar) position and orientation
   */
  updateListenerPosition(x, y, angle = 0) {
    this.listenerPos = { x, y, angle };
    if (this.spatialEngine) {
      this.spatialEngine.updateListener(x, y, angle);
    }

    // Refresh polar patterns and directivity for all connected peers
    this.channels.forEach((ch, peerId) => {
      this._applyDirectivity(peerId, ch);
    });
  }

  /**
   * Update peer avatar position in 3D audio space
   */
  updatePeerPosition(peerId, x, y, angle = 0) {
    const ch = this.channels.get(peerId);
    if (!ch || !this.ctx) return;

    ch.coords = { x, y, angle };

    // Panner coordinates in meters (~20px per meter)
    const posX = x / 20;
    const posZ = y / 20;

    if (ch.panner.positionX) {
      ch.panner.positionX.setValueAtTime(posX, this.ctx.currentTime);
      ch.panner.positionY.setValueAtTime(1.6, this.ctx.currentTime);
      ch.panner.positionZ.setValueAtTime(posZ, this.ctx.currentTime);
    } else {
      ch.panner.setPosition(posX, 1.6, posZ);
    }

    this._applyDirectivity(peerId, ch);
  }

  /**
   * Internal directivity attenuation calculation
   */
  _applyDirectivity(peerId, ch) {
    if (!ch || !this.ctx) return;

    const dx = this.listenerPos.x - ch.coords.x;
    const dy = this.listenerPos.y - ch.coords.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 1) return;

    // Angle of listener relative to peer's facing vector
    const angleToListener = Math.atan2(dy, dx);
    const relativeAngle = angleToListener - (ch.coords.angle || 0);

    const sensitivity = ch.micModel.calculateGain(relativeAngle);
    ch.directivityGain.gain.setTargetAtTime(sensitivity, this.ctx.currentTime, 0.05);
  }

  /**
   * Apply acoustic wall occlusion filter (e.g. glass partition or drywall)
   * @param {string} peerId
   * @param {boolean} isOccluded
   * @param {number} cutoffHz - typically 450Hz for drywall, 850Hz for glass
   */
  setPeerOcclusion(peerId, isOccluded, cutoffHz = 450) {
    const ch = this.channels.get(peerId);
    if (!ch || !this.ctx) return;

    ch.isOccluded = isOccluded;
    const targetFreq = isOccluded ? cutoffHz : 20000;
    ch.occlusionFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);

    // Increase reverb wetness when occluded in a room
    ch.reverbSend.gain.setTargetAtTime(isOccluded ? 0.4 : 0.15, this.ctx.currentTime, 0.08);
  }

  /**
   * Switch peer directional microphone pattern (omni, cardioid, supercardioid, figure8)
   */
  setPeerMicPattern(peerId, patternKey) {
    const ch = this.channels.get(peerId);
    if (!ch) return;

    ch.micModel.setPattern(patternKey);
    this._applyDirectivity(peerId, ch);
  }

  /**
   * Set peer channel volume fader (0.0 to 1.5)
   */
  setPeerGain(peerId, gain) {
    const ch = this.channels.get(peerId);
    if (!ch || !this.ctx) return;

    const clamped = Math.max(0, Math.min(1.5, gain));
    ch.channelGain.gain.setTargetAtTime(ch.isMuted ? 0 : clamped, this.ctx.currentTime, 0.05);
  }

  /**
   * Toggle mute for a specific peer
   */
  setPeerMute(peerId, isMuted) {
    const ch = this.channels.get(peerId);
    if (!ch || !this.ctx) return;

    ch.isMuted = isMuted;
    ch.channelGain.gain.setTargetAtTime(isMuted ? 0 : 1.0, this.ctx.currentTime, 0.02);
  }

  /**
   * Set room acoustic reverb preset
   */
  setReverbPreset(presetKey) {
    if (this.reverbEngine) {
      this.reverbEngine.applyPreset(presetKey);
    }
  }

  /**
   * Extract real-time frequency bars for a specific peer
   */
  getPeerVisualizerData(peerId) {
    const ch = this.channels.get(peerId);
    if (!ch || !ch.analyser) return new Array(16).fill(0);

    const data = new Uint8Array(ch.analyser.frequencyBinCount);
    ch.analyser.getByteFrequencyData(data);

    const bars = [];
    const step = Math.max(1, Math.floor(data.length / 16));
    for (let i = 0; i < 16; i++) {
      bars.push(data[i * step] / 255);
    }
    return bars;
  }

  /**
   * Remove peer channel and cleanly disconnect DSP nodes
   */
  removePeerStream(peerId) {
    const ch = this.channels.get(peerId);
    if (!ch) return;

    try {
      ch.source.disconnect();
      ch.directivityGain.disconnect();
      ch.occlusionFilter.disconnect();
      ch.panner.disconnect();
      ch.channelGain.disconnect();
      ch.analyser.disconnect();
      ch.reverbSend.disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }

    this.channels.delete(peerId);
  }

  /**
   * Close audio context and cleanup
   */
  cleanup() {
    this.channels.forEach((_, id) => this.removePeerStream(id));
    if (this.ctx && this.ctx.state !== "closed") {
      this.ctx.close();
    }
  }
}

export const audioPipeline = new AudioPipelineIntegrator();
