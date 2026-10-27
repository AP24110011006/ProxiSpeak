/**
 * Week 3: Metrics Controller for WebRTC Mesh Diagnostics & Audio Health Telemetry
 */

import { audioMetricsService } from "../services/audioMetricsService.js";

export const getMeshHealth = (req, res) => {
  try {
    const health = audioMetricsService.getMeshHealth();
    return res.status(200).json(health);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPeerStats = (req, res) => {
  try {
    const stats = audioMetricsService.getAllPeerStats();
    return res.status(200).json({
      success: true,
      count: stats.length,
      peers: stats,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const reportPeerStats = (req, res) => {
  try {
    const { peerId, rttMs, jitterMs, packetsLost, bytesReceived, bytesSent, codec } = req.body;
    if (!peerId) {
      return res.status(400).json({ success: false, message: "peerId is required" });
    }

    const recorded = audioMetricsService.recordPeerStats(peerId, {
      rttMs,
      jitterMs,
      packetsLost,
      bytesReceived,
      bytesSent,
      codec,
    });

    return res.status(201).json({
      success: true,
      message: "WebRTC peer stats recorded successfully",
      data: recorded,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
