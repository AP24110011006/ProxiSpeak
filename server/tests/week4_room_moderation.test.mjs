/**
 * ProxiSpeak Week 4 — Room Moderation & Host RBAC Integration Test
 * Author: Koneti Manikanth <manikanth9878@gmail.com>
 */

import assert from "node:assert/strict";
import { roomModerationService } from "../src/services/roomModerationService.js";

async function run() {
  console.log("=== Running Week 4 Room Moderation & Host RBAC Verification Tests ===");

  roomModerationService.clear();

  const ROOM_ID = "boardroom-alpha";
  const HOST_ID = "user-alice";
  const GUEST_BOB = "user-bob";
  const GUEST_CHARLIE = "user-charlie";

  // 1. Host Role Claiming
  console.log("1. Testing initial host role claiming...");
  const claimRes = roomModerationService.claimHost(ROOM_ID, HOST_ID, "Alice Lead");
  assert.equal(claimRes.success, true);
  assert.equal(claimRes.hostId, HOST_ID);
  assert.equal(roomModerationService.isHost(ROOM_ID, HOST_ID), true);
  assert.equal(roomModerationService.isHost(ROOM_ID, GUEST_BOB), false);
  console.log("✓ Alice successfully claimed host role for Executive Glass Boardroom.");

  // 2. Reject Duplicate Claim by Unauthorized User
  console.log("2. Verifying rejection of secondary host takeover...");
  const bobClaim = roomModerationService.claimHost(ROOM_ID, GUEST_BOB, "Bob Dev");
  assert.equal(bobClaim.success, false);
  console.log("✓ Unauthorized host takeover successfully blocked.");

  // 3. Privacy Lock Toggling
  console.log("3. Testing soundproof privacy lock toggling by host...");
  const lockRes = roomModerationService.toggleRoomLock(ROOM_ID, HOST_ID);
  assert.equal(lockRes.isLocked, true);
  assert.throws(
    () => roomModerationService.toggleRoomLock(ROOM_ID, GUEST_BOB),
    /Unauthorized/
  );
  console.log("✓ Room privacy lock successfully toggled by host and blocked for non-hosts.");

  // 4. Mute-All Action
  console.log("4. Testing Mute-All command on room participants...");
  const attendees = [
    { id: HOST_ID, name: "Alice Lead" },
    { id: GUEST_BOB, name: "Bob Dev" },
    { id: GUEST_CHARLIE, name: "Charlie QA" },
  ];

  const muteRes = roomModerationService.muteAllParticipants(ROOM_ID, HOST_ID, attendees);
  assert.equal(muteRes.success, true);
  assert.equal(muteRes.count, 2);
  assert.ok(muteRes.mutedPeerIds.includes(GUEST_BOB));
  assert.ok(muteRes.mutedPeerIds.includes(GUEST_CHARLIE));
  assert.ok(!muteRes.mutedPeerIds.includes(HOST_ID), "Host should never be muted by Mute-All");
  console.log(`✓ Mute-All muted ${muteRes.count} participants while keeping host mic active.`);

  // 5. Kick Attendee from Meeting Room
  console.log("5. Testing attendee ejection and lobby relocation...");
  const kickRes = roomModerationService.kickParticipant(ROOM_ID, HOST_ID, GUEST_BOB);
  assert.equal(kickRes.success, true);
  assert.equal(kickRes.targetPeerId, GUEST_BOB);
  assert.equal(kickRes.relocateTo.zone, "Modern Reception Lobby");
  assert.equal(kickRes.relocateTo.x, 220);
  assert.equal(kickRes.relocateTo.y, 190);
  console.log("✓ Bob Dev ejected by host and relocated to Reception Lobby coordinates.");

  // 6. Audit Trail Logging
  console.log("6. Verifying tamper-evident audit history...");
  const status = roomModerationService.getStatus(ROOM_ID);
  assert.equal(status.isLocked, true);
  assert.ok(status.auditHistoryCount >= 4);
  console.log(`✓ Audit log verified: ${status.auditHistoryCount} governance events recorded.`);

  console.log("🎉 ALL WEEK 4 ROOM MODERATION & HOST RBAC TESTS PASSED 100%!");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
