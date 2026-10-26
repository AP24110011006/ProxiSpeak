import assert from "node:assert/strict";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:5000";

function createSocket() {
  return io(SERVER_URL, {
    transports: ["websocket"],
    forceNew: true,
  });
}

function waitForEvent(socket, eventName, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for event '${eventName}'`));
    }, timeout);

    socket.once(eventName, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

async function run() {
  console.log("=== Running Office Peer Presence & Sync Verification Tests ===");

  const socketA = createSocket();
  await new Promise((resolve) => socketA.on("connect", resolve));
  socketA.emit("user:identify", { name: "Alice Developer", avatar: "https://example.com/alice.png" });
  socketA.emit("user:move", { x: 300, y: 250, zone: "Dev Pod Alpha" });

  await new Promise((r) => setTimeout(r, 100));

  // 1. New user Socket B connects and should immediately receive office:users with Socket A
  console.log("1. Connecting Socket B and verifying initial office:users payload...");
  const socketB = createSocket();

  const [officeUsersB] = await Promise.all([
    waitForEvent(socketB, "office:users"),
    new Promise((resolve) => socketB.on("connect", resolve)),
  ]);

  const foundA = officeUsersB.find((p) => p.id === socketA.id);
  assert.ok(foundA, "Socket B should immediately receive Socket A in office:users");
  assert.equal(foundA.name, "Alice Developer");
  assert.equal(foundA.x, 300);
  assert.equal(foundA.y, 250);
  console.log(`✓ Socket B received existing peer: ${foundA.name} at (${foundA.x}, ${foundA.y})`);

  // 2. Socket B emits office:sync explicitly
  console.log("2. Testing explicit office:sync request from Socket B...");
  const syncPromise = waitForEvent(socketB, "office:users");
  socketB.emit("office:sync");
  const syncedUsers = await syncPromise;
  assert.ok(syncedUsers.some((p) => p.id === socketA.id), "office:sync should return Socket A");
  console.log("✓ office:sync verified successfully.");

  // 3. Socket B moves across office; Socket A should receive peer:moved
  console.log("3. Moving Socket B and verifying peer:moved broadcast to Socket A...");
  const movePromiseA = waitForEvent(socketA, "peer:moved");
  socketB.emit("user:move", { x: 450, y: 350, zone: "Executive Glass Boardroom" });
  const movedDataA = await movePromiseA;
  assert.equal(movedDataA.id, socketB.id);
  assert.equal(movedDataA.x, 450);
  assert.equal(movedDataA.y, 350);
  assert.equal(movedDataA.zone, "Executive Glass Boardroom");
  console.log(`✓ Socket A received peer:moved for Socket B at (${movedDataA.x}, ${movedDataA.y})`);

  // 4. Socket B disconnects; Socket A should receive user:left
  console.log("4. Disconnecting Socket B and verifying user:left broadcast to Socket A...");
  const socketBId = socketB.id;
  const leftPromiseA = waitForEvent(socketA, "user:left");
  socketB.disconnect();
  const leftId = await leftPromiseA;
  assert.equal(leftId, socketBId);
  console.log(`✓ Socket A received user:left for disconnected socket.`);

  socketA.disconnect();
  console.log("🎉 ALL OFFICE PEER SYNC & VISIBILITY TESTS PASSED 100%!");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
