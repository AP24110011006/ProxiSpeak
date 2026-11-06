import assert from 'node:assert/strict';
import { AudioDuckingProcessor } from '../src/utils/audioDuckingProcessor.js';
import { ReverbZoneManager, OFFICE_REVERB_PROFILES } from '../src/utils/reverbZoneManager.js';
import { adaptiveBandwidthManager, BITRATE_LADDER } from '../src/utils/adaptiveBandwidthManager.js';

async function run() {
  console.log('=== Running Week 4 Canvas DSP & Web Audio Tests ===');

  // 1. Audio Sidechain Ducking Processor Tests
  console.log('1. Testing Voice-over-Music sidechain audio ducking...');
  // Mock AudioContext for Node.js test environment
  const mockAudioContext = {
    currentTime: 0,
    state: 'running',
    createGain: () => ({
      gain: {
        value: 1.0,
        setValueAtTime: () => {},
        cancelScheduledValues: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      connect: () => {},
    }),
  };

  const duckingProcessor = new AudioDuckingProcessor(mockAudioContext, { duckingDb: -12 });
  assert.equal(duckingProcessor.targetDuckingDb, -12);

  // When voice activity is detected, target gain drops by 12 dB (approx 0.251 linear gain)
  assert.ok(
    Math.abs(duckingProcessor.duckedGainMultiplier - 0.251) < 0.01,
    '12 dB ducking linear gain should be ~0.251'
  );
  console.log(
    `✓ Sidechain ducking math verified: -12dB attenuation -> linear gain ${duckingProcessor.duckedGainMultiplier.toFixed(3)}`
  );

  // 2. Sabine Reverb Zone Manager Tests
  console.log('2. Testing Sabine RT60 acoustic reverb zone configurations...');
  const boardroomProfile = OFFICE_REVERB_PROFILES['Executive Glass Boardroom'];
  assert.ok(boardroomProfile, 'Boardroom profile should exist');
  assert.ok(boardroomProfile.rt60Seconds >= 0.4, 'Boardroom RT60 should be calculated');

  const cabinProfile = OFFICE_REVERB_PROFILES['Focus Cabin Alpha'];
  assert.ok(cabinProfile, 'Cabin profile should exist');
  assert.ok(cabinProfile.rt60Seconds <= 0.25, 'Focus cabin should have dead acoustic decay (<=0.25s)');
  console.log(`✓ Reverb RT60 verified: Boardroom = ${boardroomProfile.rt60Seconds}s, Focus Cabin = ${cabinProfile.rt60Seconds}s`);

  // 3. WebRTC Adaptive Bitrate Ladder Tests
  console.log('3. Testing WebRTC adaptive bandwidth estimator ladder...');
  // Baseline optimal network
  const eval1 = adaptiveBandwidthManager.evaluateNetworkMetrics({
    rttMs: 25,
    packetLoss: 0.002,
    jitterMs: 3,
  });
  assert.equal(eval1.tier, '1080p');
  assert.equal(eval1.config.maxBitrateKbps, 3500);
  console.log('✓ Optimal conditions maintain 1080p @ 3500 kbps (30 FPS)');

  // Moderate latency degradation
  const eval2 = adaptiveBandwidthManager.evaluateNetworkMetrics({
    rttMs: 85,
    packetLoss: 0.015,
    jitterMs: 14,
  });
  assert.equal(eval2.tier, '720p');
  assert.equal(eval2.config.maxBitrateKbps, 1800);
  console.log('✓ Moderate congestion automatically downgrades to 720p @ 1800 kbps');

  // Severe packet loss
  const eval3 = adaptiveBandwidthManager.evaluateNetworkMetrics({
    rttMs: 160,
    packetLoss: 0.045,
    jitterMs: 30,
  });
  assert.equal(eval3.tier, '480p');
  assert.equal(eval3.config.maxBitrateKbps, 800);
  console.log('✓ Severe congestion automatically downgrades to 480p @ 800 kbps to prevent freeze');

  console.log('🎉 ALL WEEK 4 CANVAS DSP & WEB AUDIO TESTS PASSED 100%!');
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
