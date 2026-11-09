import test from 'node:test';
import assert from 'node:assert/strict';
import Matter from 'matter-js';
import { PlayerRagdoll } from '../src/engine/ragdoll.js';
import { createPropFromVerb } from '../src/engine/proceduralProps.js';
import { CellularGrid, CELL_TYPES } from '../src/engine/cellularAutomata.js';
import { vfxSystem } from '../src/engine/vfxSystem.js';
import { synthesizeTopicScenario } from '../src/engine/topicPixelArtGenerator.js';

const { Engine, World, Bodies } = Matter;

function createArenaWorld() {
  const engine = Engine.create({ gravity: { x: 0, y: 1.0 } });
  const wallOpts = { isStatic: true, restitution: 0.2, friction: 0.9 };
  const floor = Bodies.rectangle(480, 504 + 150, 1560, 300, wallOpts);
  const ceiling = Bodies.rectangle(480, 36 - 150, 1560, 300, wallOpts);
  const leftWall = Bodies.rectangle(36 - 150, 270, 300, 1140, wallOpts);
  const rightWall = Bodies.rectangle(924 + 150, 270, 300, 1140, wallOpts);
  World.add(engine.world, [floor, ceiling, leftWall, rightWall]);
  return engine;
}

test('PlayerRagdoll stays grounded and upright under 1G without floating or jumping randomly', () => {
  const engine = createArenaWorld();
  const ragdoll = new PlayerRagdoll(engine.world, 480, 440);

  for (let frame = 0; frame < 120; frame++) {
    Engine.update(engine, 1000 / 60);
    ragdoll.update(null, 960, 540, null);
  }

  assert.equal(ragdoll.isDead, false);
  assert.ok(ragdoll.parts.head.position.y > 350, `Head floated too high: y=${ragdoll.parts.head.position.y}`);
  assert.ok(ragdoll.parts.head.position.y < ragdoll.parts.torso.position.y, 'Ragdoll collapsed upside down');
  assert.ok(ragdoll.parts.leftLeg.position.y <= 504, 'Ragdoll sank through floor');
});

test('initRagdoll supports custom non-default coordinates cleanly', () => {
  const engine = createArenaWorld();
  const ragdoll = new PlayerRagdoll(engine.world, 360, 360);
  assert.equal(ragdoll.parts.head.position.x, 360);
  assert.equal(ragdoll.parts.head.position.y, 320);
  assert.equal(ragdoll.parts.torso.position.y, 358);
});

test('severJoint("head") aliases to neck and mutatePart guards against zero-area shrinkage', () => {
  const engine = createArenaWorld();
  const ragdoll = new PlayerRagdoll(engine.world, 480, 440);

  ragdoll.mutatePart({ part: 'torso', scale_x: 0.001, scale_y: 0.001, explode_if_scale_above: 99 });
  assert.ok(Number.isFinite(ragdoll.parts.torso.position.x));
  assert.ok(Math.abs(ragdoll.parts.torso.bounds.max.x - ragdoll.parts.torso.bounds.min.x) >= 6);

  ragdoll.severJoint('head');
  assert.equal(ragdoll.isDead, true);
  assert.equal(ragdoll.constraints.neck.isBroken, true);
});

test('createPropFromVerb preserves zero vy and clamps spawn positions inside arena bounds', () => {
  const trainScenario = synthesizeTopicScenario('I want a bullet train');
  const spawnStep = trainScenario.choreography_timeline.find((s) => s.verb === 'SPAWN_OBJECT');
  const [body] = createPropFromVerb(spawnStep.params, trainScenario.custom_prop);

  assert.equal(body.velocity.x, 30);
  assert.equal(body.velocity.y, 0);
  assert.ok(body.position.x >= 36 && body.position.x <= 924);
  assert.ok(body.position.y >= 36 && body.position.y <= 504);

  // Even extreme out-of-bounds inputs clamp inside the stone walls
  const [clamped] = createPropFromVerb({ prop_type: 'ANVIL', x: -500, y: -200, vy: 0 });
  assert.ok(clamped.position.x > 36 && clamped.position.x < 924);
  assert.ok(clamped.position.y > 36 && clamped.position.y < 504);
  assert.equal(clamped.velocity.y, 0);
});

test('resurrect + VFXSystem handles shockwave, finite motes lifecycle, and reset without NaN', () => {
  vfxSystem.reset();
  const engine = createArenaWorld();
  const ragdoll = new PlayerRagdoll(engine.world, 480, 440);

  ragdoll.severJoint('neck');
  assert.equal(ragdoll.isDead, true);

  ragdoll.resurrect(480, 440);
  assert.equal(ragdoll.isDead, false);
  assert.ok(vfxSystem.shockwaves.length >= 2);

  for (let i = 0; i < 80; i++) {
    vfxSystem.update(0.016);
  }

  for (const mote of vfxSystem.dustMotes) {
    assert.ok(Number.isFinite(mote.x), 'dustMote x must remain finite');
    assert.ok(Number.isFinite(mote.y), 'dustMote y must remain finite');
    assert.ok(Number.isFinite(mote.phase), 'dustMote phase must remain finite');
    assert.equal(mote.life, undefined, 'expired resurrection motes should be cleaned up');
  }
  vfxSystem.reset();
});

test('Cellular acid/gold indices beyond ragdoll parts never wrap onto ragdoll head', () => {
  const engine = createArenaWorld();
  const ragdoll = new PlayerRagdoll(engine.world, 480, 440);
  const cellular = new CellularGrid(320, 180);

  // Simulate non-ragdoll prop index (>= 6) returned from cellular.step activeBodies
  for (let i = 0; i < 60; i++) {
    ragdoll.onAcidContact(6, cellular);
    ragdoll.onGoldWeight(6, 0.5);
  }

  assert.equal(ragdoll.isDead, false);
  assert.equal(ragdoll.acidCorrosion.head, 0);
  assert.ok(ragdoll.parts.head);
});

test('CellularGrid.spawnCircle converts low world coordinates strictly to 320x180 grid space', () => {
  const cellular = new CellularGrid(320, 180);
  cellular.spawnCircle(90, 120, 6, CELL_TYPES.FIRE, 40, 0, 0);

  let foundNear30_40 = 0;
  let foundNear90_120 = 0;
  for (let y = 35; y <= 45; y++) {
    for (let x = 25; x <= 35; x++) {
      if (cellular.get(x, y) === CELL_TYPES.FIRE) foundNear30_40++;
    }
  }
  for (let y = 115; y <= 125; y++) {
    for (let x = 85; x <= 95; x++) {
      if (cellular.get(x, y) === CELL_TYPES.FIRE) foundNear90_120++;
    }
  }

  assert.ok(foundNear30_40 > 0, 'Expected FIRE cells mapped to grid ~(30, 40)');
  assert.equal(foundNear90_120, 0, 'Expected zero cells mistakenly placed at (90, 120)');
});
