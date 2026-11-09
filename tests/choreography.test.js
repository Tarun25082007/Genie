import test from 'node:test';
import assert from 'node:assert/strict';
import { ChoreographyRunner } from '../src/engine/choreographyRunner.js';

test('ChoreographyRunner handles RED_FLASH, deterministic timeouts, and reset cleanup', () => {
  const runner = new ChoreographyRunner();
  const spawned = [];
  let completed = false;
  let startedCount = 0;

  runner.handlers.onScenarioStart = () => {
    startedCount++;
  };
  runner.handlers.onSpawnObject = (params) => {
    spawned.push(params);
  };
  runner.handlers.onWishCompleted = () => {
    completed = true;
  };

  runner.startScenario({
    survived: false,
    loophole_score: 12,
    genie_taunt: 'Burn!',
    loophole_explanation: 'Dragonfire.',
    choreography_timeline: [
      { time_ms: 0, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 92, y: 430, vx: 0, vy: 0 } },
      { time_ms: 50, verb: 'CAMERA_FX', params: { effect: 'SLOW_MOTION', duration_ms: 200 } },
      { time_ms: 50, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', duration_ms: 200 } },
      { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'RED_FLASH', intensity: 25 } },
      { time_ms: 120, verb: 'WORLD_MODIFIER', params: { modifier: 'GRAVITY', gravity_x: 0.4, gravity_y: 2.0, duration_ms: 250 } }
    ]
  });

  assert.equal(startedCount, 1);

  runner.update(0.01);
  assert.equal(spawned.length, 1);
  assert.equal(spawned[0].vx, 0);
  assert.equal(spawned[0].vy, 0);

  runner.update(0.05);
  assert.equal(runner.cameraFX.slowMotion, true);
  assert.equal(runner.cameraFX.zoomOnPlayer, true);

  // Advance past slowMo, zoom, and temporary gravity overrides cleanly
  for (let i = 0; i < 60; i++) {
    runner.update(0.03);
  }
  assert.equal(runner.cameraFX.slowMotion, false);
  assert.equal(runner.cameraFX.zoomOnPlayer, false);
  assert.equal(runner.worldModifiers.gravityActive, false);

  // Advance past 4500ms timeline completion so onWishCompleted fires
  for (let i = 0; i < 140; i++) {
    runner.update(0.03);
  }
  assert.equal(completed, true);
  assert.equal(runner.isPlaying, false);

  // Explicitly test reset mid-scenario clears all temporary FX & modifiers
  runner.startScenario({
    survived: false,
    choreography_timeline: [
      { time_ms: 0, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', duration_ms: 1500 } },
      { time_ms: 0, verb: 'WORLD_MODIFIER', params: { modifier: 'BLACK_HOLE', x: 480, y: 240, duration_ms: 1500 } }
    ]
  });
  runner.update(0.01);
  assert.equal(runner.cameraFX.zoomOnPlayer, true);
  assert.ok(runner.worldModifiers.blackHole);

  runner.reset();
  assert.equal(runner.cameraFX.zoomOnPlayer, false);
  assert.equal(runner.cameraFX.slowMotion, false);
  assert.equal(runner.worldModifiers.blackHole, null);
  assert.equal(runner.isPlaying, false);
});
