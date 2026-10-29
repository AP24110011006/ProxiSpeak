import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";

console.log("=== Running Week 3 Ambient Noise Floor & Voice SNR Tests ===");

const server = http.createServer(app);

server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Test GET /api/rooms/acoustics/noise-floor
    console.log("1. Testing GET /api/rooms/acoustics/noise-floor...");
    const floorRes = await fetch(`${baseUrl}/api/rooms/acoustics/noise-floor`);
    assert.equal(floorRes.status, 200);
    const floorData = await floorRes.json();
    assert.equal(floorData.success, true);
    assert.ok(floorData.count >= 5);

    const cabin = floorData.data.find((f) => f.roomId === "focus_cabins");
    assert.ok(cabin);
    assert.equal(cabin.baselineNoiseDb, 28.0);
    assert.ok(cabin.speechIntelligibilityIndex >= 0.95);
    console.log(`✓ Noise floors verified: ${floorData.count} zones measured. Focus Cabin quietest at ${cabin.baselineNoiseDb}dB.`);

    // 2. Test POST /api/rooms/acoustics/snr (Focus Cabin - Pristine Studio Grade)
    console.log("2. Testing SNR in Focus Cabin with 68dB vocal input...");
    const snrRes1 = await fetch(`${baseUrl}/api/rooms/acoustics/snr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: "focus_cabins", inputVoiceDb: 68.0 }),
    });
    assert.equal(snrRes1.status, 200);
    const snrData1 = await snrRes1.json();
    assert.equal(snrData1.success, true);
    assert.equal(snrData1.data.signalToNoiseRatioDb, 40.0);
    assert.equal(snrData1.data.qualityStatus, "Pristine Studio Grade");
    assert.equal(snrData1.data.recommendedGateThresholdDb, -52);
    console.log(`✓ Focus Cabin SNR verified: ${snrData1.data.signalToNoiseRatioDb}dB (${snrData1.data.qualityStatus})`);

    // 3. Test POST /api/rooms/acoustics/snr (Cafeteria Lounge - High Noise Bleed)
    console.log("3. Testing SNR in Cafeteria Lounge with 58dB vocal input...");
    const snrRes2 = await fetch(`${baseUrl}/api/rooms/acoustics/snr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: "lounge", inputVoiceDb: 58.0 }),
    });
    assert.equal(snrRes2.status, 200);
    const snrData2 = await snrRes2.json();
    assert.equal(snrData2.success, true);
    assert.equal(snrData2.data.signalToNoiseRatioDb, 3.0);
    assert.equal(snrData2.data.qualityStatus, "Degraded / High Noise Floor");
    assert.equal(snrData2.data.suppressionAggressiveness, "maximum");
    console.log(`✓ Lounge SNR verified: ${snrData2.data.signalToNoiseRatioDb}dB (${snrData2.data.qualityStatus})`);

    console.log("🎉 ALL WEEK 3 AMBIENT NOISE & VOICE SNR TESTS PASSED 100%!");
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  } finally {
    if (server.closeAllConnections) server.closeAllConnections();
    server.close();
  }
});
