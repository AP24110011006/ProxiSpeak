import assert from 'node:assert/strict';
import { screenShareService } from '../src/services/screenShareService.js';

async function run() {
  console.log('=== Running Week 4 Screen Share Session Service Tests ===');

  screenShareService.clear();

  // 1. Start a 1080p screen share session
  console.log('1. Starting 1080p presentation in Executive Glass Boardroom...');
  const session = await screenShareService.startSession({
    roomId: 'Executive Glass Boardroom',
    presenterId: 'user-lead-1',
    presenterName: 'Lead Architect',
    resolution: '1080p',
    maxBitrateKbps: 3500,
    hasAudio: true,
  });

  assert.ok(session.sessionId, 'Session should have a generated sessionId');
  assert.equal(session.resolution, '1080p');
  assert.equal(session.isActive, true);
  console.log(`✓ Session started: ${session.sessionId} (Resolution: ${session.resolution})`);

  // 2. Add viewers
  console.log('2. Adding viewers to active session...');
  await screenShareService.addViewer(session.sessionId, {
    userId: 'user-viewer-1',
    userName: 'Harshitha Rao',
  });
  await screenShareService.addViewer(session.sessionId, {
    userId: 'user-viewer-2',
    userName: 'Likhitha Yekollu',
  });

  const updated = await screenShareService.getActiveSessionInRoom('Executive Glass Boardroom');
  assert.equal(updated.viewers.length, 2, 'Should have 2 viewers');
  console.log(`✓ 2 Viewers added: ${updated.viewers.map((v) => v.userName).join(', ')}`);

  // 3. Adapt bitrate ladder under network pressure
  console.log('3. Adapting bitrate ladder to 720p due to packet congestion...');
  const adapted = await screenShareService.adaptBitrate(session.sessionId, {
    resolution: '720p',
    bitrateKbps: 1800,
    reason: 'Packet loss > 2.5%, scaling down for smooth playback',
  });

  assert.equal(adapted.resolution, '720p');
  assert.equal(adapted.currentBitrateKbps, 1800);
  assert.equal(adapted.bandwidthLadder.length, 2);
  console.log('✓ Bitrate adapted down to 720p @ 1800kbps smoothly');

  // 4. Unauthorized user cannot stop session
  console.log('4. Verifying non-presenter cannot terminate session...');
  await assert.rejects(
    async () => {
      await screenShareService.stopSession(session.sessionId, 'unauthorized-user');
    },
    /Unauthorized/,
    'Should throw unauthorized error'
  );
  console.log('✓ Unauthorized termination attempt successfully blocked');

  // 5. Presenter stops session
  console.log('5. Presenter terminates session...');
  const stopped = await screenShareService.stopSession(session.sessionId, 'user-lead-1');
  assert.equal(stopped.isActive, false);
  assert.ok(stopped.endedAt);
  assert.ok(stopped.totalDurationSeconds >= 0);
  console.log(`✓ Session terminated cleanly. Duration: ${stopped.totalDurationSeconds}s`);

  // 6. Verify room has no active session
  const activeNow = await screenShareService.getActiveSessionInRoom('Executive Glass Boardroom');
  assert.equal(activeNow, null);
  console.log('✓ Room active presentation cleared');

  console.log('🎉 ALL WEEK 4 SCREEN SHARE SESSION TESTS PASSED 100%!');
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
