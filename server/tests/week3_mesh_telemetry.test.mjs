import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";
import { audioMetricsService } from "../src/services/audioMetricsService.js";
import { roomRecordingService } from "../src/services/roomRecordingService.js";

console.log("=== Running Week 3 WebRTC Mesh Telemetry & Room Session Tests ===");

const server = http.createServer(app);

server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 0. Reset services
    audioMetricsService.resetMetrics();
    roomRecordingService.reset();

    // 1. Test GET /api/metrics/audio default baseline
    console.log("1. Testing GET /api/metrics/audio default baseline...");
    const baseRes = await fetch(`${baseUrl}/api/metrics/audio`);
    assert.equal(baseRes.status, 200);
    const baseData = await baseRes.json();
    assert.equal(baseData.success, true);
    assert.equal(baseData.sub20msBenchmark, true);
    console.log(`✓ Baseline mesh latency: ${baseData.currentAvgLatencyMs}ms (Target: ${baseData.targetLatencyMs})`);

    // 2. Test POST /api/metrics/report ingestion from two peer connections
    console.log("2. Ingesting WebRTC peer telemetry reports via POST /api/metrics/report...");
    const report1 = await fetch(`${baseUrl}/api/metrics/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        peerId: "socket_peer_alice",
        rttMs: 14.2,
        jitterMs: 1.5,
        packetsLost: 0,
        bytesReceived: 64000,
        bytesSent: 62000,
      }),
    });
    assert.equal(report1.status, 201);

    const report2 = await fetch(`${baseUrl}/api/metrics/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        peerId: "socket_peer_bob",
        rttMs: 16.8,
        jitterMs: 2.1,
        packetsLost: 1,
        bytesReceived: 72000,
        bytesSent: 71000,
      }),
    });
    assert.equal(report2.status, 201);
    console.log("✓ Ingested WebRTC stats for peer Alice (14.2ms) and Bob (16.8ms).");

    // 3. Test GET /api/metrics/audio after reports
    console.log("3. Verifying aggregated mesh health averages...");
    const meshRes = await fetch(`${baseUrl}/api/metrics/audio`);
    const meshData = await meshRes.json();
    assert.equal(meshData.activePeerStreams, 2);
    // (14.2 + 16.8) / 2 = 15.5ms
    assert.equal(meshData.currentAvgLatencyMs, 15.5);
    assert.equal(meshData.sub20msBenchmark, true);
    console.log(`✓ Aggregated mesh average latency calculated: ${meshData.currentAvgLatencyMs}ms (< 20ms benchmark PASSED).`);

    // 4. Test GET /api/metrics/peers
    console.log("4. Testing GET /api/metrics/peers list...");
    const peersRes = await fetch(`${baseUrl}/api/metrics/peers`);
    const peersData = await peersRes.json();
    assert.equal(peersData.count, 2);
    assert.ok(peersData.peers.some((p) => p.peerId === "socket_peer_alice"));
    console.log("✓ Individual peer connection stats verified.");

    // 5. Test Meeting Room Audio Recording Lifecycle
    console.log("5. Testing Room Recording Session: start -> status -> stop...");
    const startRes = await fetch(`${baseUrl}/api/rooms/boardroom/recording/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initiator: "Koneti Manikanth" }),
    });
    assert.equal(startRes.status, 200);
    const startData = await startRes.json();
    assert.equal(startData.roomId, "boardroom");
    assert.equal(startData.session.status, "recording");
    console.log(`✓ Room recording started: Session ID ${startData.session.sessionId}`);

    // 6. Test GET room recording status
    const statusRes = await fetch(`${baseUrl}/api/rooms/boardroom/recording`);
    const statusData = await statusRes.json();
    assert.equal(statusData.isRecording, true);
    console.log("✓ Room recording active status confirmed.");

    // 7. Test POST room recording stop
    const stopRes = await fetch(`${baseUrl}/api/rooms/boardroom/recording/stop`, {
      method: "POST",
    });
    assert.equal(stopRes.status, 200);
    const stopData = await stopRes.json();
    assert.equal(stopData.recording.status, "completed");
    assert.ok(stopData.recording.durationSeconds >= 1);
    console.log(`✓ Room recording finalized: Duration ${stopData.recording.formattedDuration}, Size: ${stopData.recording.fileSizeKb} KB`);

    console.log("🎉 ALL WEEK 3 MESH TELEMETRY & ROOM SESSION TESTS PASSED 100%!");
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  } finally {
    server.close();
  }
});
