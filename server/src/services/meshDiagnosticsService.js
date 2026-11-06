/**
 * ProxiSpeak Week 4 — Real-time WebRTC Mesh Diagnostics & Network Telemetry Service
 * Author: Koneti Manikanth <manikanth9878@gmail.com>
 *
 * Collects, aggregates, and analyzes real-time peer-to-peer WebRTC mesh telemetry
 * across Floor 4 virtual office spaces. Tracks round-trip latency (RTT), jitter buffer
 * delays, audio packet loss, and stream bitrates to ensure SLA compliance.
 */

class MeshDiagnosticsService {
  constructor() {
    // Map of active peer pairs: key `${minId}:${maxId}` -> Telemetry Record
    this.peerConnections = new Map();
  }

  _getPairKey(id1, id2) {
    return id1 < id2 ? `${id1}:${id2}` : `${id2}:${id1}`;
  }

  /**
   * Record or update real-time telemetry metrics between two peers
   */
  recordPeerTelemetry({
    fromId,
    toId,
    rttMs = 25,
    jitterMs = 4,
    packetLoss = 0.0,
    bitrateKbps = 64,
    zone = "Modern Reception Lobby",
  }) {
    const pairKey = this._getPairKey(fromId, toId);

    // Connection Quality Classification
    let quality = "EXCELLENT";
    if (rttMs > 120 || packetLoss > 0.04 || jitterMs > 25) {
      quality = "DEGRADED";
    } else if (rttMs > 60 || packetLoss > 0.015 || jitterMs > 12) {
      quality = "GOOD";
    }

    const record = {
      pairKey,
      peers: [fromId, toId],
      rttMs: Math.max(1, Math.round(rttMs)),
      jitterMs: Math.max(0, Math.round(jitterMs)),
      packetLossPercentage: Math.round(packetLoss * 1000) / 10,
      bitrateKbps: Math.round(bitrateKbps),
      zone,
      quality,
      updatedAt: new Date(),
    };

    this.peerConnections.set(pairKey, record);
    return record;
  }

  /**
   * Remove peer telemetry upon disconnection
   */
  removePeerTelemetry(peerId) {
    let removedCount = 0;
    for (const [key, record] of this.peerConnections.entries()) {
      if (record.peers.includes(peerId)) {
        this.peerConnections.delete(key);
        removedCount++;
      }
    }
    return removedCount;
  }

  /**
   * Retrieve aggregate mesh health metrics across all active office zones
   */
  getAggregateMeshHealth() { return this.getMeshHealthSummary(); }
  removePeer(id) { return this.removePeerTelemetry(id); }
  getMeshHealthSummary() {
    const totalConnections = this.peerConnections.size;
    if (totalConnections === 0) {
      return {
        totalConnections: 0,
        averageRttMs: 0,
        averageJitterMs: 0,
        averagePacketLossPercentage: 0,
        overallStatus: "IDLE",
        qualityBreakdown: { EXCELLENT: 0, GOOD: 0, DEGRADED: 0 },
        zoneMetrics: {},
      };
    }

    let sumRtt = 0;
    let sumJitter = 0;
    let sumPacketLoss = 0;
    const qualityBreakdown = { EXCELLENT: 0, GOOD: 0, DEGRADED: 0 };
    const zoneMetrics = {};

    for (const record of this.peerConnections.values()) {
      sumRtt += record.rttMs;
      sumJitter += record.jitterMs;
      sumPacketLoss += record.packetLossPercentage;
      qualityBreakdown[record.quality] = (qualityBreakdown[record.quality] || 0) + 1;

      // Group by zone
      if (!zoneMetrics[record.zone]) {
        zoneMetrics[record.zone] = {
          connections: 0,
          avgRtt: 0,
          sumRtt: 0,
        };
      }
      zoneMetrics[record.zone].connections++;
      zoneMetrics[record.zone].sumRtt += record.rttMs;
      zoneMetrics[record.zone].avgRtt = Math.round(
        zoneMetrics[record.zone].sumRtt / zoneMetrics[record.zone].connections
      );
    }

    const avgRtt = Math.round(sumRtt / totalConnections);
    const avgJitter = Math.round(sumJitter / totalConnections);
    const avgLoss = Math.round((sumPacketLoss / totalConnections) * 10) / 10;

    let overallStatus = "OPTIMAL";
    if (qualityBreakdown.DEGRADED >= totalConnections * 0.5) {
      overallStatus = "DEGRADED";
    } else if (qualityBreakdown.DEGRADED > 0 || avgRtt > 70) {
      overallStatus = "FAIR";
    }

    return {
      totalConnections,
      averageRttMs: avgRtt,
      averageJitterMs: avgJitter,
      averagePacketLossPercentage: avgLoss,
      overallStatus,
      qualityBreakdown,
      zoneMetrics,
      timestamp: new Date(),
    };
  }

  /**
   * Reset all in-memory telemetry records
   */
  clear() {
    this.peerConnections.clear();
  }
}

export const meshDiagnosticsService = new MeshDiagnosticsService();
