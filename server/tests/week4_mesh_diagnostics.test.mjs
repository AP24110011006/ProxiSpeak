/**
 * ProxiSpeak Week 4 — Real-time WebRTC Mesh Diagnostics Integration Test
 * Author: Koneti Manikanth <manikanth9878@gmail.com>
 */

import assert from "node:assert/strict";
import { meshDiagnosticsService } from "../src/services/meshDiagnosticsService.js";

async function run() {
  console.log("=== Running Week 4 WebRTC Mesh Diagnostics Verification Tests ===");

  meshDiagnosticsService.clear();

  // 1. Initial idle state check
  console.log("1. Verifying initial idle telemetry baseline...");
  const initial = meshDiagnosticsService.getMeshHealthSummary();
  assert.equal(initial.totalConnections, 0);
  assert.equal(initial.overallStatus, "IDLE");
  console.log("✓ Initial idle baseline verified.");

  // 2. Register low-latency peer connection (Boardroom)
  console.log("2. Recording optimal peer telemetry in Executive Glass Boardroom...");
  const peer1 = meshDiagnosticsService.recordPeerTelemetry({
    fromId: "socket-alice",
    toId: "socket-bob",
    rttMs: 24,
    jitterMs: 3,
    packetLoss: 0.002,
    bitrateKbps: 64,
    zone: "Executive Glass Boardroom",
  });

  assert.equal(peer1.quality, "EXCELLENT");
  assert.equal(peer1.rttMs, 24);
  assert.equal(peer1.packetLossPercentage, 0.2); // 0.2%
  console.log(`✓ Optimal peer connection classified as: ${peer1.quality} (RTT: ${peer1.rttMs}ms)`);

  // 3. Register fair peer connection (Dev Pod Alpha)
  console.log("3. Recording standard peer telemetry in Dev Pod Alpha...");
  const peer2 = meshDiagnosticsService.recordPeerTelemetry({
    fromId: "socket-charlie",
    toId: "socket-david",
    rttMs: 78,
    jitterMs: 14,
    packetLoss: 0.018,
    bitrateKbps: 64,
    zone: "Dev Pod Alpha",
  });

  assert.equal(peer2.quality, "GOOD");
  console.log(`✓ Standard peer connection classified as: ${peer2.quality} (RTT: ${peer2.rttMs}ms)`);

  // 4. Register degraded peer connection (high RTT & packet loss)
  console.log("4. Recording degraded connection with high jitter & packet loss...");
  const peer3 = meshDiagnosticsService.recordPeerTelemetry({
    fromId: "socket-eva",
    toId: "socket-frank",
    rttMs: 185,
    jitterMs: 32,
    packetLoss: 0.052,
    bitrateKbps: 48,
    zone: "Cafeteria & Lounge",
  });

  assert.equal(peer3.quality, "DEGRADED");
  console.log(`✓ Degraded connection identified correctly: ${peer3.quality} (RTT: ${peer3.rttMs}ms)`);

  // 5. Aggregate Mesh Health Evaluation
  console.log("5. Evaluating aggregate mesh health metrics...");
  const summary = meshDiagnosticsService.getMeshHealthSummary();
  assert.equal(summary.totalConnections, 3);
  assert.equal(summary.qualityBreakdown.EXCELLENT, 1);
  assert.equal(summary.qualityBreakdown.GOOD, 1);
  assert.equal(summary.qualityBreakdown.DEGRADED, 1);
  assert.equal(summary.overallStatus, "FAIR");
  assert.ok(summary.zoneMetrics["Executive Glass Boardroom"]);
  assert.equal(summary.zoneMetrics["Executive Glass Boardroom"].avgRtt, 24);
  console.log(
    `✓ Aggregate mesh health: Average RTT=${summary.averageRttMs}ms, Avg Loss=${summary.averagePacketLossPercentage}%, Status=${summary.overallStatus}`
  );

  // 6. Disconnect Peer Cleanup
  console.log("6. Testing peer disconnect cleanup...");
  const removed = meshDiagnosticsService.removePeerTelemetry("socket-eva");
  assert.equal(removed, 1);
  const afterRemove = meshDiagnosticsService.getMeshHealthSummary();
  assert.equal(afterRemove.totalConnections, 2);
  assert.equal(afterRemove.qualityBreakdown.DEGRADED, 0);
  console.log("✓ Disconnected peer cleanly pruned from mesh telemetry.");

  console.log("🎉 ALL WEEK 4 WEBRTC MESH DIAGNOSTICS TESTS PASSED 100%!");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
