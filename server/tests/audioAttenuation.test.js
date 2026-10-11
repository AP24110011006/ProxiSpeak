import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDistanceAttenuation,
  calculateStereoPan,
  calculateObstacleDamping,
} from '../src/utils/distance.js';

test('Spatial Audio Calculations', async (t) => {
  await t.test('attenuates volume dynamically based on pixel distance', () => {
    // Within minimum zone (0 - 20px) -> max volume 1.0
    assert.strictEqual(calculateDistanceAttenuation(0, 100, 20), 1.0);
    assert.strictEqual(calculateDistanceAttenuation(15, 100, 20), 1.0);

    // At middle distance (60px) -> intermediate volume
    const midGain = calculateDistanceAttenuation(60, 100, 20);
    assert.ok(midGain > 0.0 && midGain < 1.0, `Expected 0 < gain < 1, got ${midGain}`);

    // At maximum boundary (100px) -> silent 0.0
    assert.strictEqual(calculateDistanceAttenuation(100, 100, 20), 0.0);

    // Beyond boundary (150px) -> silent 0.0
    assert.strictEqual(calculateDistanceAttenuation(150, 100, 20), 0.0);
  });

  await t.test('calculates 3D stereo panning (left / right ear placement)', () => {
    const listener = { x: 500, y: 500 };

    // Peer directly centered
    const centerPan = calculateStereoPan(listener, { x: 500, y: 450 }, 100);
    assert.strictEqual(centerPan, 0);

    // Peer 50px to the left
    const leftPan = calculateStereoPan(listener, { x: 450, y: 500 }, 100);
    assert.strictEqual(leftPan, -0.5);

    // Peer 100px to the right
    const rightPan = calculateStereoPan(listener, { x: 600, y: 500 }, 100);
    assert.strictEqual(rightPan, 1.0);

    // Peer far right (clamped at +1.0)
    const clampedPan = calculateStereoPan(listener, { x: 800, y: 500 }, 100);
    assert.strictEqual(clampedPan, 1.0);
  });

  await t.test('applies obstacle sound damping between listener and speaker', () => {
    const listener = { x: 100, y: 100 };
    const speaker = { x: 300, y: 100 };

    // Obstacle directly between them (wall with 0.8 sound damping)
    const obstacles = [
      {
        id: 'wall1',
        x: 190,
        y: 50,
        width: 20,
        height: 100,
        soundDamping: 0.8,
      },
    ];

    const dampingFactor = calculateObstacleDamping(listener, speaker, obstacles);
    assert.ok(Math.abs(dampingFactor - 0.2) < 0.01, `Expected damping factor 0.2, got ${dampingFactor}`);
  });
});
