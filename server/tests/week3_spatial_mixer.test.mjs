import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";

console.log("=== Running Week 3 Spatial Audio Mixer & Multi-Channel Matrix Tests ===");

const server = http.createServer(app);

server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Test POST /api/rooms/acoustics/mix
    console.log("1. Testing multi-peer spatial mix matrix generation...");
    const mixRes = await fetch(`${baseUrl}/api/rooms/acoustics/mix`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listener: { x: 220, y: 190, facingAngle: 0 },
        earshotRadius: 160,
        peers: [
          { id: "peer_alice", name: "Alice Reception", x: 280, y: 190, isSpeaking: true },
          { id: "peer_bob", name: "Bob Dev Pod", x: 220, y: 100, isSpeaking: false },
          { id: "peer_charlie", name: "Charlie Boardroom", x: 550, y: 180, isSpeaking: true },
        ],
      }),
    });

    assert.equal(mixRes.status, 200);
    const mixData = await mixRes.json();
    assert.equal(mixData.success, true);
    assert.equal(mixData.data.totalColleaguesEvaluated, 3);
    assert.equal(mixData.data.sub20msSlaMet, true);

    const alice = mixData.data.channels.find((c) => c.peerId === "peer_alice");
    assert.ok(alice);
    assert.equal(alice.inEarshot, true);
    assert.equal(alice.distancePixels, 60);
    assert.equal(alice.azimuthDeg, 0);
    assert.equal(alice.stereoPan, 0.0);
    assert.ok(alice.gain > 0.35);
    assert.equal(alice.isOccluded, false);
    assert.equal(alice.lowpassCutoffHz, 16000);
    console.log(`✓ Alice channel verified: In earshot (60px), Pan: ${alice.stereoPan}, Gain: ${alice.gainPercent}%, Filter: ${alice.lowpassCutoffHz}Hz`);

    const bob = mixData.data.channels.find((c) => c.peerId === "peer_bob");
    assert.ok(bob);
    assert.equal(bob.inEarshot, true);
    assert.equal(bob.azimuthDeg, -90);
    assert.equal(bob.stereoPan, -1.0);
    console.log(`✓ Bob channel verified: Azimuth ${bob.azimuthDeg}°, Stereo Pan ${bob.stereoPan} (Full Left Ear)`);

    const charlie = mixData.data.channels.find((c) => c.peerId === "peer_charlie");
    assert.ok(charlie);
    assert.equal(charlie.inEarshot, false);
    assert.equal(charlie.isOccluded, true);
    assert.equal(charlie.lowpassCutoffHz, 450);
    console.log(`✓ Charlie channel verified: Soundproof occluded in Boardroom, Lowpass muffled to ${charlie.lowpassCutoffHz}Hz`);

    // 2. Test GET /api/rooms/acoustics/benchmark
    console.log("2. Testing spatial audio clustering SLA benchmark for 80 concurrent avatars...");
    const benchRes = await fetch(`${baseUrl}/api/rooms/acoustics/benchmark?count=80`);
    assert.equal(benchRes.status, 200);
    const benchData = await benchRes.json();
    assert.equal(benchData.success, true);
    assert.equal(benchData.evaluatedPeersCount, 80);
    assert.equal(benchData.sub20msSlaPassed, true);
    assert.ok(benchData.executionTimeMs < 20.0);
    console.log(`✓ Clustering benchmark passed: Evaluated 80 peers in ${benchData.executionTimeMs}ms (Target: < 20ms)`);

    console.log("🎉 ALL WEEK 3 SPATIAL AUDIO MIXER & MATRIX TESTS PASSED 100%!");
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  } finally {
    if (server.closeAllConnections) server.closeAllConnections();
    server.close();
  }
});
