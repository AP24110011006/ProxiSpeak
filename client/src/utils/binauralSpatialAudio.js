/**
 * Week 3: Binaural 3D Spatial Audio & HRTF Panner Engine
 * Maps avatar 2D/3D coordinates and velocity vectors into Web Audio API AudioListener and PannerNode
 * Author: Likhitha730 (likhitha branch)
 */

export class BinauralSpatialAudio {
  constructor(audioContext = null) {
    this.ctx = audioContext || (typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext)
      ? new (window.AudioContext || window.webkitAudioContext)()
      : null);

    this.panners = new Map(); // peerId -> PannerNode
  }

  /**
   * Set listener avatar position and facing orientation in 3D audio space
   * @param {number} x - X coordinate (pixels)
   * @param {number} y - Y coordinate (pixels)
   * @param {number} angleRadians - Avatar facing orientation (0 = East, PI/2 = South, etc.)
   */
  updateListener(x, y, angleRadians = 0) {
    if (!this.ctx || !this.ctx.listener) return;

    // Convert pixel coordinates to meters (~20 pixels per meter)
    const posX = x / 20;
    const posZ = y / 20;

    const listener = this.ctx.listener;
    if (listener.positionX) {
      listener.positionX.setValueAtTime(posX, this.ctx.currentTime);
      listener.positionY.setValueAtTime(1.6, this.ctx.currentTime); // 1.6m ear height
      listener.positionZ.setValueAtTime(posZ, this.ctx.currentTime);

      // Orientation vector (forward X, Z)
      const forwardX = Math.cos(angleRadians);
      const forwardZ = Math.sin(angleRadians);
      listener.forwardX.setValueAtTime(forwardX, this.ctx.currentTime);
      listener.forwardY.setValueAtTime(0, this.ctx.currentTime);
      listener.forwardZ.setValueAtTime(forwardZ, this.ctx.currentTime);
      listener.upX.setValueAtTime(0, this.ctx.currentTime);
      listener.upY.setValueAtTime(1, this.ctx.currentTime);
      listener.upZ.setValueAtTime(0, this.ctx.currentTime);
    } else if (listener.setPosition) {
      // Legacy Web Audio API fallback
      listener.setPosition(posX, 1.6, posZ);
      listener.setOrientation(Math.cos(angleRadians), 0, Math.sin(angleRadians), 0, 1, 0);
    }
  }

  /**
   * Create an HRTF PannerNode for a remote colleague stream
   */
  createPeerPanner(peerId) {
    if (!this.ctx) return null;

    const panner = this.ctx.createPanner();
    panner.panningModel = "HRTF"; // Head-Related Transfer Function
    panner.distanceModel = "inverse";
    panner.refDistance = 1.0;
    panner.maxDistance = 25.0; // ~500 pixels max hearing limit
    panner.rolloffFactor = 1.4;
    panner.coneInnerAngle = 360; // Omnidirectional vocal radiation

    this.panners.set(peerId, panner);
    return panner;
  }

  /**
   * Update colleague peer position and compute azimuth / elevation
   */
  updatePeerPosition(peerId, peerX, peerY) {
    const panner = this.panners.get(peerId);
    if (!panner || !this.ctx) return null;

    const posX = peerX / 20;
    const posZ = peerY / 20;

    if (panner.positionX) {
      panner.positionX.setValueAtTime(posX, this.ctx.currentTime);
      panner.positionY.setValueAtTime(1.6, this.ctx.currentTime);
      panner.positionZ.setValueAtTime(posZ, this.ctx.currentTime);
    } else if (panner.setPosition) {
      panner.setPosition(posX, 1.6, posZ);
    }

    return { posX, posZ };
  }

  /**
   * Compute relative azimuth angle and perceived stereo balance (-1.0 Left to +1.0 Right)
   */
  static calculateAzimuth(listenerX, listenerY, peerX, peerY, listenerFacingAngle = 0) {
    const dx = peerX - listenerX;
    const dy = peerY - listenerY;
    const distancePixels = Math.hypot(dx, dy);

    if (distancePixels === 0) return { azimuthDeg: 0, stereoPan: 0 };

    const worldAngle = Math.atan2(dy, dx);
    let relativeAngle = worldAngle - listenerFacingAngle;

    // Normalize to [-PI, PI]
    while (relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;
    while (relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;

    const azimuthDeg = Math.round((relativeAngle * 180) / Math.PI);
    const stereoPan = Math.max(-1.0, Math.min(1.0, Math.sin(relativeAngle)));

    return {
      distancePixels: Math.round(distancePixels),
      distanceMeters: Math.round((distancePixels / 20) * 10) / 10,
      azimuthDeg,
      stereoPan: Math.round(stereoPan * 100) / 100,
    };
  }

  /**
   * Cleanup peer panner
   */
  removePeer(peerId) {
    if (this.panners.has(peerId)) {
      const panner = this.panners.get(peerId);
      try { panner.disconnect(); } catch (e) { /* Safe */ }
      this.panners.delete(peerId);
    }
  }
}

export const defaultBinauralSpatial = new BinauralSpatialAudio();
