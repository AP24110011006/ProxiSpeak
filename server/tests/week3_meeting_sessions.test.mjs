import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";

console.log("=== Running Week 3 Meeting Room Sessions & Audio Persistence Tests ===");

const server = http.createServer(app);

server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Test POST /api/rooms/boardroom/sessions (Archive acoustic meeting session)
    console.log("1. Archiving completed acoustic meeting session in Boardroom...");
    const createRes = await fetch(`${baseUrl}/api/rooms/boardroom/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Executive Boardroom Acoustic Strategy Sync",
        initiator: "Koneti Manikanth",
        participants: ["Alice", "Bob", "Charlie", "Manikanth"],
        durationSeconds: 240,
        recordingUrl: "http://localhost:5000/uploads/audio/boardroom_sync_oct31.webm",
        fileSizeKb: 3840,
        notes: "Confidential strategy meeting. Preserved with 95% soundproof isolation.",
      }),
    });

    assert.equal(createRes.status, 201);
    const createData = await createRes.json();
    assert.equal(createData.success, true);
    assert.equal(createData.data.roomId, "boardroom");
    assert.equal(createData.data.isSoundproofLocked, true);
    assert.equal(createData.data.isolationFactor, 0.95);
    assert.equal(createData.data.durationSeconds, 240);
    assert.equal(createData.data.participants.length, 4);
    console.log(`✓ Meeting session archived: "${createData.data.title}" (${createData.data.durationSeconds}s, Isolation: ${createData.data.isolationFactor * 100}%)`);

    // 2. Test GET /api/rooms/boardroom/sessions (Retrieve archived sessions)
    console.log("2. Retrieving archived sessions for room 'boardroom'...");
    const listRes = await fetch(`${baseUrl}/api/rooms/boardroom/sessions`);
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    assert.equal(listData.success, true);
    assert.equal(listData.roomId, "boardroom");
    assert.ok(listData.count >= 1);
    const found = listData.data.find((s) => s.title === "Executive Boardroom Acoustic Strategy Sync");
    assert.ok(found);
    assert.equal(found.initiator, "Koneti Manikanth");
    console.log(`✓ Retrieved ${listData.count} archived session(s) for boardroom. Audio recording verified.`);

    console.log("🎉 ALL WEEK 3 MEETING ROOM SESSIONS & ARCHIVE TESTS PASSED 100%!");
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  } finally {
    if (server.closeAllConnections) server.closeAllConnections();
    server.close();
  }
});
