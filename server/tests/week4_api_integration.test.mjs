import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';

async function run() {
  console.log('=== Running Week 4 API Integration Tests ===');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Test /api/chat/stats
    console.log('1. Testing GET /api/chat/stats...');
    const chatStatsRes = await fetch(`${baseUrl}/api/chat/stats`);
    assert.equal(chatStatsRes.status, 200);
    const chatStats = await chatStatsRes.json();
    assert.equal(chatStats.success, true);
    assert.equal(chatStats.ttlSeconds, 600);
    console.log('✓ Spatial chat stats API verified');

    // 2. Test /api/moderation/:roomId/status and /claim
    console.log('2. Testing POST /api/moderation/Boardroom/claim and status...');
    const claimRes = await fetch(`${baseUrl}/api/moderation/Boardroom/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'host-1', userName: 'Alice Host' }),
    });
    assert.equal(claimRes.status, 200);
    const claimData = await claimRes.json();
    assert.equal(claimData.success, true);
    assert.equal(claimData.hostId, 'host-1');

    const statusRes = await fetch(`${baseUrl}/api/moderation/Boardroom/status`);
    const statusData = await statusRes.json();
    assert.equal(statusData.hostId, 'host-1');
    assert.equal(statusData.isLocked, false);
    console.log('✓ Moderation claim and status API verified');

    // 3. Test /api/moderation/:roomId/lock
    console.log('3. Testing POST /api/moderation/Boardroom/lock...');
    const lockRes = await fetch(`${baseUrl}/api/moderation/Boardroom/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterId: 'host-1' }),
    });
    assert.equal(lockRes.status, 200);
    const lockData = await lockRes.json();
    assert.equal(lockData.isLocked, true);
    console.log('✓ Soundproof room lock API toggled successfully');

    // 4. Test /api/mesh/telemetry and /topology
    console.log('4. Testing POST /api/mesh/telemetry and GET /api/mesh/topology...');
    const telRes = await fetch(`${baseUrl}/api/mesh/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromId: 'peer-alpha',
        toId: 'peer-beta',
        rttMs: 32,
        jitterMs: 5,
        packetLoss: 0.005,
        bitrateKbps: 64,
        zone: 'Executive Glass Boardroom',
      }),
    });
    assert.equal(telRes.status, 200);
    const telData = await telRes.json();
    assert.equal(telData.success, true);
    assert.equal(telData.record.quality, 'EXCELLENT');

    const topoRes = await fetch(`${baseUrl}/api/mesh/topology`);
    const topoData = await topoRes.json();
    assert.equal(topoData.success, true);
    assert.ok((topoData.totalConnections >= 1 || topoData.activePeerConnections >= 1));
    console.log('✓ WebRTC mesh telemetry and topology API verified');

    // 5. Test /api/screenshare/start and /active
    console.log('5. Testing POST /api/screenshare/start and GET /api/screenshare/active...');
    const ssRes = await fetch(`${baseUrl}/api/screenshare/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: 'Executive Glass Boardroom',
        roomName: 'Executive Glass Boardroom',
        presenterId: 'pres-1',
        presenterName: 'Lead Presenter',
        resolution: '1080p',
      }),
    });
    assert.equal(ssRes.status, 201);
    const ssData = await ssRes.json();
    assert.equal(ssData.success, true);
    assert.equal(ssData.session.resolution, '1080p');

    const activeSsRes = await fetch(`${baseUrl}/api/screenshare/active`);
    const activeSsData = await activeSsRes.json();
    assert.equal(activeSsData.success, true);
    assert.ok(activeSsData.count >= 1);
    console.log('✓ Screen share presentation lifecycle API verified');

    console.log('🎉 ALL WEEK 4 API INTEGRATION TESTS PASSED 100%!');
  } finally {
    server.close();
  }
}

run().catch((err) => {
  console.error('❌ API Test failed:', err);
  process.exit(1);
});
