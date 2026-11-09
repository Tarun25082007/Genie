import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeWishKey,
  getCachedWish,
  saveCachedWish,
  getWishCacheStats,
  clearWishCache
} from '../src/services/wishCache.js';

test('normalizeWishKey strips conversational preambles and articles cleanly', () => {
  assert.equal(normalizeWishKey('I want to see a dragon!'), 'dragon');
  assert.equal(normalizeWishKey('Summon the dragon'), 'dragon');
  assert.equal(normalizeWishKey('Give me an apple.'), 'apple');
  assert.equal(normalizeWishKey('I want 10 dollars?'), '10 dollars');
});

test('getCachedWish uses whole-token matching and avoids substring and number collisions', () => {
  clearWishCache();

  const carScenario = {
    survived: true,
    loophole_score: 70,
    genie_taunt: 'Tiny die-cast car!',
    loophole_explanation: 'Toy scale.',
    choreography_timeline: []
  };
  const tenDollarsScenario = {
    survived: true,
    loophole_score: 68,
    genie_taunt: 'Ten Monopoly dollars!',
    loophole_explanation: 'Play money.',
    choreography_timeline: []
  };
  const unsafeTeaScenario = {
    survived: false,
    loophole_score: 20,
    genie_taunt: 'Boiling magma tea!',
    loophole_explanation: 'No temperature limit.',
    choreography_timeline: []
  };

  saveCachedWish('I want a car', carScenario, 'local_llm');
  saveCachedWish('I want 10 dollars', tenDollarsScenario, 'local_llm');
  saveCachedWish('I want herbal tea', unsafeTeaScenario, 'local_llm');

  // Exact normalized & article variations hit cleanly
  const hit1 = getCachedWish('Summon the car');
  assert.equal(hit1?.genie_taunt, 'Tiny die-cast car!');
  assert.equal(hit1?.from_cache, true);

  // One extra descriptor word token matches cleanly
  const hit2 = getCachedWish('I want a red car');
  assert.equal(hit2?.genie_taunt, 'Tiny die-cast car!');

  // Unrelated substring words MUST NOT collide ("car" must NOT match "carrot")
  assert.equal(getCachedWish('I want a carrot'), null);

  // Different numbers MUST NOT collide ("10 dollars" must NOT match "100 dollars")
  assert.equal(getCachedWish('I want 100 dollars'), null);

  // Airtight qualifiers MUST NOT collide with cached unsafe versions
  assert.equal(getCachedWish('I want herbal tea placed gently at room temperature'), null);

  clearWishCache();
});

test('saveCachedWish ignores fallback entries so failed offline runs never poison cache', () => {
  clearWishCache();
  saveCachedWish('I want a dragon', { survived: false, genie_taunt: 'bad' }, 'local_llm_fallback');
  saveCachedWish('I want a dragon', { survived: false, genie_taunt: 'bad2' }, 'procedural_fallback');
  assert.equal(getCachedWish('I want a dragon'), null);
  assert.equal(getWishCacheStats().count, 0);
});
