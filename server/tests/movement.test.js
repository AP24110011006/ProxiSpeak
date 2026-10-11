import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEuclideanDistance, isPointInBox } from '../src/utils/distance.js';

test('Week 1 Backend: Signaling, Movement & Geospatial Validation', async (t) => {
  await t.test('calculates accurate avatar coordinates and Euclidean movement distance', () => {
    const origin = { x: 200, y: 200 };
    const destination = { x: 230, y: 240 }; // 30px X, 40px Y -> 3-4-5 triangle -> 50px

    const distance = calculateEuclideanDistance(origin, destination);
    assert.strictEqual(distance, 50, 'Distance must equal 50px');
  });

  await t.test('validates boundary clamping for office dimensions', () => {
    const officeWidth = 1600;
    const officeHeight = 1000;
    const avatarRadius = 16;

    const clampX = (x) => Math.max(avatarRadius, Math.min(officeWidth - avatarRadius, x));
    const clampY = (y) => Math.max(avatarRadius, Math.min(officeHeight - avatarRadius, y));

    // Outside left boundary
    assert.strictEqual(clampX(-50), 16);
    // Outside right boundary
    assert.strictEqual(clampX(1800), 1584);
    // Outside top boundary
    assert.strictEqual(clampY(-10), 16);
    // Outside bottom boundary
    assert.strictEqual(clampY(1050), 984);
    // Inside valid range
    assert.strictEqual(clampX(500), 500);
    assert.strictEqual(clampY(450), 450);
  });

  await t.test('detects collisions with solid obstacles (walls/desks)', () => {
    const obstacle = {
      x: 200,
      y: 150,
      width: 180,
      height: 90,
      blocksMovement: true,
    };

    // Point directly inside the desk
    const pointInside = { x: 250, y: 180 };
    assert.strictEqual(isPointInBox(pointInside, obstacle), true);

    // Point safely in the walkway
    const pointOutside = { x: 100, y: 100 };
    assert.strictEqual(isPointInBox(pointOutside, obstacle), false);
  });

  await t.test('validates GeoJSON Point schema structure for MongoDB 2dsphere index', () => {
    const userLocation = {
      type: 'Point',
      coordinates: [300, 300], // [X, Y]
    };

    assert.strictEqual(userLocation.type, 'Point');
    assert.strictEqual(Array.isArray(userLocation.coordinates), true);
    assert.strictEqual(userLocation.coordinates.length, 2);
    assert.strictEqual(typeof userLocation.coordinates[0], 'number');
    assert.strictEqual(typeof userLocation.coordinates[1], 'number');
  });
});
