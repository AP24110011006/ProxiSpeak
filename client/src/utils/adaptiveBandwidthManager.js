/**
 * ProxiSpeak Week 4 — WebRTC Adaptive Bitrate & Network Quality Estimator
 * Author: Leela Sai Likhitha Yekollu <sailikhitha.yekollu@gmail.com>
 *
 * Implements client-side bandwidth estimation and automated resolution downgrading:
 * - 1080p @ 30fps (3500 kbps) -> Optimal network (RTT <= 60ms, loss <= 1.0%)
 * - 720p @ 24fps (1800 kbps)  -> Moderate congestion (RTT 60-120ms, loss 1-3%)
 * - 480p @ 15fps (800 kbps)   -> Severe packet loss (RTT > 120ms or loss > 3.0%)
 */

export const BITRATE_LADDER = {
  '1080p': {
    resolution: '1080p',
    width: 1920,
    height: 1080,
    frameRate: 30,
    maxBitrateKbps: 3500,
  },
  '720p': {
    resolution: '720p',
    width: 1280,
    height: 720,
    frameRate: 24,
    maxBitrateKbps: 1800,
  },
  '480p': {
    resolution: '480p',
    width: 854,
    height: 480,
    frameRate: 15,
    maxBitrateKbps: 800,
  },
};

export class AdaptiveBandwidthManager {
  constructor(initialTier = '1080p') {
    this.currentTier = initialTier;
    this.history = [];
  }

  /**
   * Determine optimal resolution tier based on network telemetry
   */
  evaluateNetworkMetrics({ rttMs = 30, packetLoss = 0.005, jitterMs = 4 }) {
    let targetTier = '1080p';
    let reason = 'Optimal network conditions';

    if (packetLoss > 0.03 || rttMs > 130) {
      targetTier = '480p';
      reason = `Severe congestion detected (RTT: ${rttMs}ms, Loss: ${(packetLoss * 100).toFixed(1)}%)`;
    } else if (packetLoss > 0.012 || rttMs > 70) {
      targetTier = '720p';
      reason = `Moderate latency detected (RTT: ${rttMs}ms, Loss: ${(packetLoss * 100).toFixed(1)}%)`;
    }

    const changed = targetTier !== this.currentTier;
    this.currentTier = targetTier;

    const evaluation = {
      tier: targetTier,
      config: BITRATE_LADDER[targetTier],
      changed,
      reason,
      evaluatedAt: new Date(),
    };

    this.history.push(evaluation);
    if (this.history.length > 20) this.history.shift();

    return evaluation;
  }

  getCurrentConfig() {
    return BITRATE_LADDER[this.currentTier];
  }
}

export const adaptiveBandwidthManager = new AdaptiveBandwidthManager();
