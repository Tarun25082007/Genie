import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeDirectorSchema, interpretWishWithDirector } from '../src/services/llmDirector.js';
import { synthesizeTopicScenario } from '../src/engine/topicPixelArtGenerator.js';
import { clearWishCache } from '../src/services/wishCache.js';

test('sanitizeDirectorSchema strips all lethal verbs, hazards, and extreme masses when survived is true', () => {
  const dirtyLlmResponse = JSON.stringify({
    survived: true,
    loophole_score: 88,
    genie_taunt: 'Enjoy your harmless tiny car!',
    loophole_explanation: '1:64 die-cast miniature.',
    choreography_timeline: [
      { time_ms: 100, verb: 'WORLD_MODIFIER', params: { modifier: 'DELETE_FLOOR' } },
      { time_ms: 150, verb: 'SPAWN_OBJECT', params: { prop_type: 'ANVIL', x: 480, y: 40, vx: 30, vy: 45, mass: 950, scale: 6 } },
      { time_ms: 250, verb: 'CAMERA_FX', params: { effect: 'RED_FLASH', intensity: 30, duration_ms: 800 } },
      { time_ms: 300, verb: 'APPLY_FORCE', params: { target: 'torso', fx: 0.9, fy: -0.9 } },
      { time_ms: 400, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 300 } },
      { time_ms: 500, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 400 } }
    ]
  });

  const result = sanitizeDirectorSchema(dirtyLlmResponse, 'I want a sports car');
  assert.equal(result.survived, true);
  assert.ok(result.custom_prop.mass <= 25);
  assert.ok(result.custom_prop.scale <= 3.5);

  const verbs = result.choreography_timeline.map((s) => s.verb);
  assert.equal(verbs.includes('DESTROY_JOINT'), false);
  assert.equal(verbs.includes('WORLD_MODIFIER'), false);
  assert.equal(verbs.includes('APPLY_FORCE'), false);

  const spawnStep = result.choreography_timeline.find((s) => s.verb === 'SPAWN_OBJECT');
  assert.ok(spawnStep);
  assert.ok(spawnStep.params.mass <= 20);
  assert.ok(spawnStep.params.vy <= 6);
  assert.ok(spawnStep.params.y >= 200);

  const particleStep = result.choreography_timeline.find((s) => s.verb === 'EMIT_PARTICLES');
  assert.equal(particleStep.params.type, 'SPARK');
});

test('sanitizeDirectorSchema aligns fallback timeline when LLM survived disagrees with topic default', () => {
  // Dragon defaults to survived:false, but suppose the LLM returns a benign survived:true interpretation without timeline
  const res = sanitizeDirectorSchema(
    '```json\n{"survived": true, "loophole_score": 82, "genie_taunt": "Plush dragon!", "loophole_explanation": "Plush toy"}\n```',
    'I want a dragon'
  );
  assert.equal(res.survived, true);
  assert.equal(res.choreography_timeline.some((s) => s.verb === 'DESTROY_JOINT'), false);
});

test('sanitizeDirectorSchema extracts embedded JSON and sanitizes unknown matrix characters', () => {
  const messyOutput = `Sure, here is your result:\n{\n  "survived": false,\n  "loophole_score": 14,\n  "genie_taunt": "Crushed!",\n  "loophole_explanation": "Kinetic impact.",\n  "custom_prop": {\n    "name": "weird",\n    "palette": {".": null, "X": "#ff0000"},\n    "matrix": ["ZZZZ"]\n  }\n}\nHope you like it!`;

  const res = sanitizeDirectorSchema(messyOutput, 'I want a boulder');
  assert.equal(res.survived, false);
  assert.equal(res.custom_prop.matrix.length, 16);
  for (const row of res.custom_prop.matrix) {
    assert.equal(row.length, 16);
    assert.match(row, /^[.X]{16}$/);
  }
});

test('synthesizeTopicScenario maps "I want a million bucks" to horned deer stampede', () => {
  const scenario = synthesizeTopicScenario('I want a million bucks');
  assert.equal(scenario.survived, false);
  assert.equal(scenario.custom_prop.name, 'PROCEDURAL_HORNED_DEER');
  assert.ok(scenario.choreography_timeline.some((s) => s.params?.prop_type === 'DEER'));
});

test('interpretWishWithDirector marks fallback cleanly and handles mock mode', async () => {
  clearWishCache();
  const mockRes = await interpretWishWithDirector('I want a dragon', 'mock');
  assert.equal(mockRes.generation_source, 'procedural');
  assert.equal(mockRes.fallback_used, false);

  const missingKeyRes = await interpretWishWithDirector('I want a sandwich', 'groq', { apiKey: '' });
  assert.equal(missingKeyRes.generation_source, 'procedural_fallback');
  assert.equal(missingKeyRes.fallback_used, true);
  clearWishCache();
});

test('interpretWishWithDirector marks malformed LLM JSON as procedural_fallback and avoids caching it', async () => {
  clearWishCache();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ response: 'not valid json at all!' }),
    text: async () => 'not valid json'
  });

  try {
    const res = await interpretWishWithDirector('I want a telescope', 'ollama_strong', {
      endpoint: 'http://127.0.0.1:11434',
      ollamaStrongModel: 'qwen2.5:7b'
    });
    assert.equal(res.generation_source, 'procedural_fallback');
    assert.equal(res.fallback_used, true);

    // Second call should not hit a poisoned cache entry
    const res2 = await interpretWishWithDirector('I want a telescope', 'ollama_strong', {
      endpoint: 'http://127.0.0.1:11434',
      ollamaStrongModel: 'qwen2.5:7b'
    });
    assert.equal(Boolean(res2.from_cache), false);
  } finally {
    globalThis.fetch = originalFetch;
    clearWishCache();
  }
});
