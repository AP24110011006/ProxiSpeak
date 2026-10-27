/**
 * Week 3: Real-Time Web Audio API Spectrum Analyzer & Voice Activity Detector (VAD)
 * Provides 32-band FFT frequency extraction, RMS decibel calculation, and vocal presence detection.
 * Author: Likhitha730 (likhitha branch)
 */

export class AudioSpectrumAnalyzer {
  constructor(audioContext = null, fftSize = 64) {
    this.ctx = audioContext || (typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext) ? new (window.AudioContext || window.webkitAudioContext)() : null);
    this.fftSize = fftSize;
    this.analyser = null;
    this.source = null;
    this.dataArray = null;
    this.isInitialized = false;

    if (this.ctx) {
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = this.fftSize;
      this.analyser.smoothingTimeConstant = 0.85;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.isInitialized = true;
    }
  }

  /**
   * Connect an incoming MediaStream (microphone or remote WebRTC peer) to the analyzer
   * @param {MediaStream} stream
   */
  connectStream(stream) {
    if (!this.ctx || !stream || !this.analyser) return false;
    try {
      if (this.source) {
        this.source.disconnect();
      }
      this.source = this.ctx.createMediaStreamSource(stream);
      this.source.connect(this.analyser);
      return true;
    } catch (err) {
      console.warn("[AudioSpectrumAnalyzer] Connection error:", err.message);
      return false;
    }
  }

  /**
   * Extract real-time normalized frequency spectrum bars (0.0 to 1.0)
   * @param {number} barCount - Default 16 frequency bands
   * @returns {number[]} Array of normalized amplitude values
   */
  getFrequencyBands(barCount = 16) {
    if (!this.analyser || !this.dataArray) {
      return new Array(barCount).fill(0);
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    const binCount = this.analyser.frequencyBinCount;
    const step = Math.max(1, Math.floor(binCount / barCount));
    const bands = [];

    for (let i = 0; i < barCount; i++) {
      let sum = 0;
      let count = 0;
      for (let j = i * step; j < (i + 1) * step && j < binCount; j++) {
        sum += this.dataArray[j];
        count++;
      }
      const avg = count > 0 ? sum / count : 0;
      bands.push(Math.round((avg / 255) * 100) / 100);
    }

    return bands;
  }

  /**
   * Calculate current audio volume level in RMS and Decibels (-100dB to 0dB)
   */
  getAudioLevel() {
    if (!this.analyser || !this.dataArray) {
      return { rms: 0, db: -100, isSpeaking: false };
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    let sumSquares = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const normalized = this.dataArray[i] / 255;
      sumSquares += normalized * normalized;
    }

    const rms = Math.sqrt(sumSquares / this.dataArray.length);
    const db = rms > 0 ? Math.max(-100, Math.round(20 * Math.log10(rms))) : -100;
    const isSpeaking = db > -52 && rms > 0.04;

    return {
      rms: Math.round(rms * 100) / 100,
      db,
      isSpeaking,
    };
  }

  /**
   * Clean up Web Audio node connections
   */
  disconnect() {
    if (this.source) {
      try {
        this.source.disconnect();
      } catch (e) {
        // Safe ignore
      }
      this.source = null;
    }
  }
}

export const defaultSpectrumAnalyzer = new AudioSpectrumAnalyzer();
