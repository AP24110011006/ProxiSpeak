import assert from "node:assert";
import http from "node:http";
import app from "../src/app.js";
import { calculateAcousticIsolation, getRoomForCoordinate } from "../src/controllers/meetingController.js";

console.log("=== Running Week 3 Meeting Room Soundproofing & Acoustic Isolation Tests ===");

// 1. Test Coordinate-to-Room Mapping
console.log("1. Testing Coordinate-to-Room Mapping...");
const receptionRoom = getRoomForCoordinate(220, 190);
assert.ok(receptionRoom, "Reception coordinate should map to Reception room");
assert.strictEqual(receptionRoom.id, "reception", "Expected room ID 'reception'");
console.log("✓ Reception coordinate (220, 190) correctly mapped to:", receptionRoom.name);

const boardroomRoom = getRoomForCoordinate(580, 200);
assert.ok(boardroomRoom, "Boardroom coordinate should map to Boardroom");
assert.strictEqual(boardroomRoom.id, "boardroom", "Expected room ID 'boardroom'");
console.log("✓ Boardroom coordinate (580, 200) correctly mapped to:", boardroomRoom.name);

// 2. Test Intra-Room Acoustic Clarity (Inside Same Room)
console.log("2. Testing Acoustic Clarity inside the same room...");
const intraBoardroomIsolation = calculateAcousticIsolation(500, 150, 600, 180);
assert.strictEqual(intraBoardroomIsolation, 0.0, "Avatars inside same room should have 0.0 acoustic isolation");
console.log("✓ Intra-room isolation is 0.0 (crystal clear audio).");

// 3. Test Cross-Room Soundproof Isolation (Boardroom to Reception)
console.log("3. Testing Soundproof Barrier from Boardroom to Reception...");
const soundproofIsolation = calculateAcousticIsolation(220, 190, 580, 200);
assert.ok(soundproofIsolation >= 0.95, "Cross-boundary into locked boardroom should have >= 0.95 acoustic barrier");
console.log(`✓ Boardroom soundproof isolation verified: ${soundproofIsolation * 100}% sound barrier.`);

// 4. Test API Endpoints via HTTP server
console.log("4. Testing HTTP /api/rooms endpoints...");
const server = http.createServer(app);
server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // Test GET /api/rooms
    const roomsRes = await fetch(`${baseUrl}/api/rooms`);
    assert.strictEqual(roomsRes.status, 200, "GET /api/rooms should return HTTP 200");
    const roomsData = await roomsRes.json();
    assert.ok(roomsData.success, "Response should be success: true");
    assert.ok(Array.isArray(roomsData.data), "data should be an array of rooms");
    console.log(`✓ GET /api/rooms returned ${roomsData.data.length} corporate rooms.`);

    // Test POST /api/rooms/boardroom/lock
    const lockRes = await fetch(`${baseUrl}/api/rooms/boardroom/lock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locked: true }),
    });
    assert.strictEqual(lockRes.status, 200, "POST /api/rooms/:id/lock should return HTTP 200");
    const lockData = await lockRes.json();
    assert.strictEqual(lockData.isLocked, true, "Room lock should be true");
    console.log("✓ POST /api/rooms/boardroom/lock verified:", lockData.message);

    // Test GET /api/rooms/isolation
    const isoRes = await fetch(`${baseUrl}/api/rooms/isolation?x1=220&y1=190&x2=580&y2=200`);
    assert.strictEqual(isoRes.status, 200, "GET /api/rooms/isolation should return HTTP 200");
    const isoData = await isoRes.json();
    assert.strictEqual(isoData.success, true);
    assert.ok(isoData.data.isSoundproofIsolated, "Expected soundproof isolation flag to be true");
    console.log(`✓ Acoustic isolation API confirmed: ${isoData.data.isolationFactor * 100}% barrier between ${isoData.data.listener.room} and ${isoData.data.speaker.room}.`);

    console.log("🎉 ALL WEEK 3 MEETING ROOM ISOLATION TESTS PASSED 100%!");
  } finally {
    server.close();
  }
});
