import test from 'node:test';
import assert from 'node:assert/strict';
import { getSystemHealth } from '../src/services/healthService.js';
import { presenceService } from '../src/services/presenceService.js';

test('Application Health & System Diagnostics', async (t) => {
  await t.test('returns well-formed health diagnostics schema', () => {
    const health = getSystemHealth();

    assert.strictEqual(health.success, true);
    assert.strictEqual(typeof health.status, 'string');
    assert.strictEqual(health.service, 'ProxiSpeak Geospatial Signaling Server');
    assert.ok(health.timestamp, 'Timestamp must be present');
    assert.strictEqual(typeof health.uptimeSeconds, 'number');
    assert.ok(health.uptimeSeconds >= 0, 'Uptime must be non-negative');
    assert.strictEqual(typeof health.environment, 'string');
  });

  await t.test('reports geospatial engine and listening radius configuration', () => {
    const health = getSystemHealth();

    assert.ok(health.geospatialEngine, 'Geospatial engine details must be present');
    assert.strictEqual(health.geospatialEngine.status, 'active');
    assert.strictEqual(health.geospatialEngine.defaultRadius, 100, 'Must have 100px earshot radius');
    assert.strictEqual(health.geospatialEngine.bufferRadius, 15, 'Must have 15px hysteresis buffer');
    assert.strictEqual(health.geospatialEngine.indexType, '2dsphere');
  });

  await t.test('reports database state object accurately', () => {
    const health = getSystemHealth();

    assert.ok(health.database, 'Database block must be present');
    assert.strictEqual(typeof health.database.status, 'string');
    assert.strictEqual(typeof health.database.connected, 'boolean');
  });

  await t.test('tracks real-time user presence in health metrics', () => {
    const testOfficeId = 'health_test_office';
    const testUser = {
      userId: 'test_health_u1',
      socketId: 'test_health_s1',
      username: 'diagnostics_agent',
      x: 250,
      y: 250,
    };

    presenceService.addOrUpdateUser(testOfficeId, testUser);
    const health = getSystemHealth();

    assert.ok(health.presence.activeUsers >= 1, 'Should reflect active users');
    assert.ok(health.presence.activeOffices >= 1, 'Should reflect active offices');

    // Cleanup
    presenceService.removeUser('test_health_s1');
  });

  await t.test('reports valid memory usage metrics in megabytes', () => {
    const health = getSystemHealth();

    assert.ok(health.memory, 'Memory metrics must be present');
    assert.ok(health.memory.heapUsedMB > 0, 'Heap used must be positive');
    assert.ok(health.memory.heapTotalMB >= health.memory.heapUsedMB, 'Heap total must be >= heap used');
    assert.ok(health.memory.rssMB > 0, 'RSS memory must be positive');
  });
});
