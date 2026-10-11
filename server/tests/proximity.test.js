import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEuclideanDistance,
  isWithinRadius,
} from '../src/utils/distance.js';
import { ProximityService } from '../src/services/proximityService.js';

test('Proximity & Distance Calculations', async (t) => {
  await t.test('calculates accurate Euclidean distance (Doc Example: User A and B)', () => {
    // User A is at (100, 100), User B is at (160, 120)
    // Distance = sqrt(60^2 + 20^2) = sqrt(3600 + 400) = sqrt(4000) ~= 63.2455 px
    const userA = { x: 100, y: 100 };
    const userB = { x: 160, y: 120 };
    const distance = calculateEuclideanDistance(userA, userB);

    assert.ok(Math.abs(distance - 63.2455) < 0.01, `Expected ~63.25px, got ${distance}`);
    assert.strictEqual(isWithinRadius(userA, userB, 100), true);
  });

  await t.test('detects User C as outside listening radius (Doc Example: User C)', () => {
    // User A is at (100, 100), User C is at (350, 300)
    const userA = { x: 100, y: 100 };
    const userC = { x: 350, y: 300 };
    const distance = calculateEuclideanDistance(userA, userC);

    assert.ok(distance > 300, `Expected distance > 300px, got ${distance}`);
    assert.strictEqual(isWithinRadius(userA, userC, 100), false);
  });

  await t.test('calculates proximity deltas accurately with hysteresis buffer', () => {
    const proximityService = new ProximityService(100, 15);
    const currentUser = { userId: 'u1', x: 100, y: 100 };
    const otherUsers = [
      { userId: 'u2', socketId: 's2', displayName: 'User B', x: 160, y: 120 },
      { userId: 'u3', socketId: 's3', displayName: 'User C', x: 350, y: 300 },
    ];

    const result = proximityService.calculateProximityDeltas({
      currentUser,
      otherUsers,
      previousNearbyIds: new Set(),
    });

    assert.strictEqual(result.nearbyPeers.length, 1);
    assert.strictEqual(result.nearbyPeers[0].userId, 'u2');
    assert.strictEqual(result.enteredProximity.length, 1);
    assert.strictEqual(result.enteredProximity[0].userId, 'u2');
    assert.strictEqual(result.exitedProximity.length, 0);
  });

  await t.test('Mid-Project Review Audit: clusters 50+ concurrent users in under 20ms', () => {
    const proximityService = new ProximityService(100, 15);
    const benchmark = proximityService.benchmarkInMomoryProximity(50);

    assert.strictEqual(benchmark.userCount, 50);
    assert.ok(
      benchmark.executionTimeMs < 20,
      `Benchmark took ${benchmark.executionTimeMs}ms, which must be under 20ms!`
    );
    assert.strictEqual(benchmark.under20msTarget, true);
  });
});
