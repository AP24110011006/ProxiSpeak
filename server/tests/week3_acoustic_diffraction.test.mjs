import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";

console.log("=== Running Week 3 Acoustic Diffraction & Materials Tests ===");

const server = http.createServer(app);

server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Test GET /api/rooms/acoustics/materials
    console.log("1. Testing GET /api/rooms/acoustics/materials...");
    const matRes = await fetch(`${baseUrl}/api/rooms/acoustics/materials`);
    assert.equal(matRes.status, 200);
    const matData = await matRes.json();
    assert.equal(matData.success, true);
    assert.ok(matData.count >= 5);
    const glass = matData.data.find((m) => m.id === "double_glazed_glass");
    assert.ok(glass);
    assert.equal(glass.soundTransmissionClass, 42);
    assert.equal(glass.soundproofBarrierFactor, 0.95);
    console.log(`✓ Materials table verified: ${matData.count} ISO 354 acoustic materials available.`);

    // 2. Test POST /api/rooms/acoustics/raytrace (Cross-partition Boardroom -> Reception)
    console.log("2. Testing raytrace across Boardroom acoustic partition (500, 180 -> 220, 190)...");
    const rayRes1 = await fetch(`${baseUrl}/api/rooms/acoustics/raytrace`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ x1: 500, y1: 180, x2: 220, y2: 190 }),
    });
    assert.equal(rayRes1.status, 200);
    const rayData1 = await rayRes1.json();
    assert.equal(rayData1.success, true);
    assert.equal(rayData1.data.crossesAcousticPartition, true);
    assert.equal(rayData1.data.primaryMaterial, "Laminated Acoustic Glass (Boardroom)");
    assert.equal(rayData1.data.attenuation.lowpassCutoffHz, 450);
    assert.ok(rayData1.data.acousticGainFactor < 0.1);
    console.log(`✓ Cross-boundary raytrace verified: Cutoff ${rayData1.data.attenuation.lowpassCutoffHz}Hz, Gain ${Math.round(rayData1.data.acousticGainFactor * 100)}%`);

    // 3. Test POST /api/rooms/acoustics/raytrace (Intra-room Reception -> Reception)
    console.log("3. Testing intra-room raytrace in Reception (220, 190 -> 260, 210)...");
    const rayRes2 = await fetch(`${baseUrl}/api/rooms/acoustics/raytrace`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ x1: 220, y1: 190, x2: 260, y2: 210 }),
    });
    assert.equal(rayRes2.status, 200);
    const rayData2 = await rayRes2.json();
    assert.equal(rayData2.data.crossesAcousticPartition, false);
    assert.equal(rayData2.data.attenuation.lowpassCutoffHz, 12000);
    assert.ok(rayData2.data.acousticGainFactor > 0.35);
    console.log(`✓ Intra-room raytrace verified: Cutoff ${rayData2.data.attenuation.lowpassCutoffHz}Hz, High Clarity Gain ${Math.round(rayData2.data.acousticGainFactor * 100)}%`);

    console.log("🎉 ALL WEEK 3 ACOUSTIC DIFFRACTION & MATERIALS TESTS PASSED 100%!");
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  } finally {
    server.close();
  }
});
