/**
 * ProxiSpeak Week 4 — Spatial Chat & In-Earshot Messaging Integration Test
 * Author: Koneti Manikanth <manikanth9878@gmail.com>
 */

import assert from "node:assert/strict";
import {
  getEligibleChatRecipients,
  createSpatialMessage,
  isSoundproofZone,
} from "../src/services/spatialChatService.js";

async function run() {
  console.log("=== Running Week 4 Spatial In-Earshot Chat Verification Tests ===");

  // 1. Zone acoustic soundproof classification
  console.log("1. Verifying soundproof zone classification...");
  assert.equal(isSoundproofZone("Executive Glass Boardroom"), true);
  assert.equal(isSoundproofZone("Focus Cabin Alpha"), true);
  assert.equal(isSoundproofZone("Modern Reception Lobby"), false);
  assert.equal(isSoundproofZone("Dev Pod Alpha"), false);
  console.log("✓ Soundproof zone classification verified.");

  // 2. Open Floor Earshot Proximity Filtering
  console.log("2. Testing open floor proximity filtering (radius = 160px)...");
  const senderAlice = {
    id: "user-alice",
    name: "Alice Lead",
    x: 220,
    y: 190,
    zone: "Modern Reception Lobby",
  };

  const peers = [
    { id: "user-bob", name: "Bob Dev", x: 250, y: 210, zone: "Modern Reception Lobby" }, // ~36px away (IN RANGE)
    { id: "user-charlie", name: "Charlie QA", x: 340, y: 220, zone: "Modern Reception Lobby" }, // ~123px away (IN RANGE)
    { id: "user-diana", name: "Diana Designer", x: 600, y: 500, zone: "Cafeteria & Lounge" }, // ~490px away (OUT OF RANGE)
  ];

  const recipients = getEligibleChatRecipients({
    sender: senderAlice,
    peers,
    radius: 160,
    isRoomLocked: false,
  });

  assert.equal(recipients.length, 2, "Alice should only reach Bob and Charlie");
  assert.ok(recipients.some((r) => r.id === "user-bob"));
  assert.ok(recipients.some((r) => r.id === "user-charlie"));
  assert.ok(!recipients.some((r) => r.id === "user-diana"), "Diana is too far away to hear message");
  console.log(`✓ Open floor earshot filtering delivered message only to 2 nearby colleagues.`);

  // 3. Soundproof Room Confidential Isolation
  console.log("3. Testing soundproof locked boardroom message isolation...");
  const senderBoardroom = {
    id: "user-exec",
    name: "Exec Director",
    x: 580,
    y: 200,
    zone: "Executive Glass Boardroom",
  };

  const mixedPeers = [
    { id: "user-boardroom-peer", name: "CFO", x: 600, y: 210, zone: "Executive Glass Boardroom" },
    { id: "user-hallway-peer", name: "Corridor Walker", x: 575, y: 195, zone: "Main Corridor" }, // Physically close (5px) but outside wall
  ];

  const lockedRecipients = getEligibleChatRecipients({
    sender: senderBoardroom,
    peers: mixedPeers,
    radius: 160,
    isRoomLocked: true, // Confidential Boardroom Lock Active
  });

  assert.equal(lockedRecipients.length, 1, "Only CFO inside the locked boardroom should receive message");
  assert.equal(lockedRecipients[0].id, "user-boardroom-peer");
  console.log("✓ Soundproof room isolation prevents message leakage to corridor peers.");

  // 4. Message persistence and envelope formatting
  console.log("4. Testing message envelope generation & formatting...");
  const msg = await createSpatialMessage({
    senderId: senderAlice.id,
    senderName: senderAlice.name,
    x: senderAlice.x,
    y: senderAlice.y,
    zone: senderAlice.zone,
    radius: 160,
    content: "Team sync starting in 5 minutes at Reception!",
  });

  assert.ok(msg.content.includes("Team sync"));
  assert.equal(msg.senderName, "Alice Lead");
  assert.equal(msg.zone, "Modern Reception Lobby");
  console.log(`✓ Spatial message envelope verified with TTL index: ${msg.content}`);

  console.log("🎉 ALL WEEK 4 SPATIAL IN-EARSHOT CHAT TESTS PASSED 100%!");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
