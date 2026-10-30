/**
 * Week 3: Spatial Audio Multi-Channel Mixer & Dynamic Acoustic Matrix Service
 * Computes real-time WebRTC audio mix matrices including 3D distance attenuation,
 * stereo pan, acoustic wall occlusion low-pass filters, and high-concurrency benchmarks.
 * Author: Koneti Manikanth (manikanth branch)
 */

import { calculateAcousticIsolation, getRoomForCoordinate } from "../controllers/meetingController.js";

export const spatialAudioMixerService = {
  /**
   * Calculate spatial audio parameters for a single speaker relative to a listener
   * @param {object} listener - { x, y, facingAngle }
   * @param {object} speaker - { id, name, x, y, isSpeaking }
   * @param {number} earshotRadius - Default 160 pixels
   */
  computePeerChannel(listener, speaker, earshotRadius = 160) {
    const dx = speaker.x - listener.x;
    const dy = speaker.y - listener.y;
    const distancePixels = Math.round(Math.hypot(dx, dy));
    const distanceMeters = Math.max(0.2, Math.round((distancePixels / 20) * 10) / 10);

    const inEarshot = distancePixels <= earshotRadius;

    // 1. Calculate Azimuth & Stereo Pan (-1.0 Left to +1.0 Right)
    const listenerAngle = listener.facingAngle || 0;
    const worldAngle = Math.atan2(dy, dx);
    let relativeAngle = worldAngle - listenerAngle;

    while (relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;
    while (relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;

    const azimuthDeg = Math.round((relativeAngle * 180) / Math.PI);
    const stereoPan = Math.max(-1.0, Math.min(1.0, Math.sin(relativeAngle)));

    // 2. Acoustic Room Wall Occlusion & Isolation
    const occlusionFactor = calculateAcousticIsolation(listener.x, listener.y, speaker.x, speaker.y);
    const isOccluded = occlusionFactor > 0.3;

    // 3. Distance Attenuation (Inverse Quadratic Rolloff)
    let rawGain = 0;
    if (inEarshot) {
      rawGain = Math.pow(Math.max(0, 1 - distancePixels / earshotRadius), 1.8);
    }

    // 4. Occlusion Attenuation & Low-Pass Filter Cutoff
    let lowpassCutoffHz = 16000; // Open air unhindered vocal range
    let finalGain = rawGain;

    if (isOccluded) {
      finalGain = rawGain * Math.max(0.02, 1 - occlusionFactor);
      lowpassCutoffHz = occlusionFactor >= 0.9 ? 450 : 850; // Deep glass/drywall muffle
    }

    const listenerRoom = getRoomForCoordinate(listener.x, listener.y)?.name || "Open Floor";
    const speakerRoom = getRoomForCoordinate(speaker.x, speaker.y)?.name || "Open Floor";

    return {
      peerId: speaker.id,
      name: speaker.name,
      inEarshot,
      distancePixels,
      distanceMeters,
      azimuthDeg,
      stereoPan: Math.round(stereoPan * 100) / 100,
      gain: Math.round(finalGain * 1000) / 1000,
      gainPercent: Math.round(finalGain * 100),
      isOccluded,
      occlusionFactor: Math.round(occlusionFactor * 100) / 100,
      lowpassCutoffHz,
      listenerRoom,
      speakerRoom,
      isSpeaking: !!speaker.isSpeaking,
    };
  },

  /**
   * Compute full spatial audio matrix for a listener given an array of remote colleagues
   * @param {object} listener - { x, y, facingAngle }
   * @param {Array} peers - Array of speaker objects { id, name, x, y, isSpeaking }
   * @param {number} earshotRadius
   */
  generateMixMatrix(listener, peers = [], earshotRadius = 160) {
    const startTime = performance.now();
    const channels = peers.map((p) => this.computePeerChannel(listener, p, earshotRadius));

    const activeStreamsInEarshot = channels.filter((c) => c.inEarshot);
    const executionMs = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      listener: {
        x: listener.x,
        y: listener.y,
        facingAngle: listener.facingAngle || 0,
        room: getRoomForCoordinate(listener.x, listener.y)?.name || "Open Floor",
      },
      earshotRadius,
      totalColleaguesEvaluated: peers.length,
      activeStreamsInEarshot: activeStreamsInEarshot.length,
      executionMs,
      sub20msSlaMet: executionMs < 20,
      channels,
    };
  },

  /**
   * High-throughput spatial audio clustering benchmark
   * Evaluates NxN matrix calculations across virtual office avatars
   * @param {number} peerCount - Number of simulated avatars (default 60)
   */
  benchmarkSpatialClustering(peerCount = 60) {
    const simulatedPeers = [];
    for (let i = 0; i < peerCount; i++) {
      simulatedPeers.push({
        id: `peer_${i}`,
        name: `Avatar ${i}`,
        x: Math.floor(Math.random() * 800) + 100,
        y: Math.floor(Math.random() * 600) + 50,
        isSpeaking: i % 4 === 0,
      });
    }

    const listener = { x: 220, y: 190, facingAngle: 0 };
    const startTime = performance.now();
    const matrix = this.generateMixMatrix(listener, simulatedPeers, 160);
    const executionMs = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      success: true,
      service: "ProxiSpeak Spatial Audio Clustering Engine",
      evaluatedPeersCount: peerCount,
      matrixCalculations: peerCount,
      executionTimeMs: executionMs,
      targetSlaMs: 20.0,
      sub20msSlaPassed: executionMs < 20.0,
      activeChannelsInRange: matrix.activeStreamsInEarshot,
      timestamp: new Date().toISOString(),
    };
  },
};
