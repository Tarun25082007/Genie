import test from 'node:test';
import assert from 'node:assert/strict';
import { PIXEL_SPRITES, THEME_SETS } from '../src/data/themes.js';
import { generateProceduralPixelSprite, synthesizeTopicScenario } from '../src/engine/topicPixelArtGenerator.js';

function assertValid16x16Sprite(sprite, label) {
  assert.ok(sprite, `${label}: sprite definition should exist`);
  assert.ok(Array.isArray(sprite.matrix), `${label}: matrix should be an array`);
  assert.equal(sprite.matrix.length, 16, `${label}: expected 16 rows, got ${sprite.matrix.length}`);
  assert.ok(sprite.palette && typeof sprite.palette === 'object', `${label}: palette should be an object`);

  for (let r = 0; r < sprite.matrix.length; r++) {
    const row = sprite.matrix[r];
    assert.equal(row.length, 16, `${label} row ${r}: expected length 16, got ${row.length} ("${row}")`);
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      assert.ok(
        Object.prototype.hasOwnProperty.call(sprite.palette, ch),
        `${label} row ${r} col ${c}: palette is missing symbol '${ch}'`
      );
    }
  }
}

test('All built-in PIXEL_SPRITES are exact 16x16 grids with valid palette symbols', () => {
  for (const [key, sprite] of Object.entries(PIXEL_SPRITES)) {
    assertValid16x16Sprite(sprite, `PIXEL_SPRITES.${key}`);
  }
});

test('All THEME_SETS and entityVariants reference valid relic sprites and valid wish limits', () => {
  for (const [themeId, theme] of Object.entries(THEME_SETS)) {
    assert.ok(theme.maxWishes >= 1 && theme.maxWishes <= 5, `${themeId}: invalid maxWishes`);
    const defaultRelic = theme.genieDefaults?.relic;
    assert.ok(PIXEL_SPRITES[defaultRelic], `${themeId}: missing default relic sprite ${defaultRelic}`);

    if (Array.isArray(theme.entityVariants)) {
      for (const variant of theme.entityVariants) {
        assert.ok(variant.maxWishes >= 1 && variant.maxWishes <= 5, `${themeId}.${variant.id}: invalid maxWishes`);
        assert.ok(PIXEL_SPRITES[variant.relic], `${themeId}.${variant.id}: missing relic sprite ${variant.relic}`);
      }
    }
  }
});

test('All synthesized topic sprites are exact 16x16 grids with valid palette symbols', () => {
  const sampleWishes = [
    'I wish for a warm cup of herbal tea placed gently on the table',
    'I want 10 dollars',
    'I want a sports car',
    'Make me a sandwich',
    'I want a girlfriend',
    'I want to fly with balloons',
    'I want a million bucks',
    'I want to pass my exams',
    'I want to become Pele',
    'I want to see a dragon',
    'I want to summon Godzilla',
    'I want a UFO',
    'I want Pikachu',
    'I want a bullet train',
    'I want a nuke',
    'I want pizza',
    'I want a laser sword',
    'I want a quantum computer',
    'I want diamonds',
    'I want a meteor',
    'I want immortality',
    'I want lightning powers',
    'I want true love',
    'I want a purple crystalline penguin'
  ];

  for (const wish of sampleWishes) {
    const scenario = synthesizeTopicScenario(wish);
    assertValid16x16Sprite(scenario.custom_prop, `Topic(${wish})`);
    assert.ok(Array.isArray(scenario.choreography_timeline) && scenario.choreography_timeline.length > 0);
  }
});

test('generateProceduralPixelSprite supports every explicit category', () => {
  const categories = [
    'AIRTIGHT', 'EXAMS', 'TOY_DOLLARS', 'TOY_CAR', 'SANDWICH_LUNCH',
    'TOY_COMPANION', 'BALLOONS_FLY', 'DOG_HOTDOG', 'COOL_BREEZE',
    'PELE', 'HISTORICAL', 'DRAGON', 'GODZILLA', 'UFO', 'POKEMON',
    'TRAIN', 'NUKE', 'FOOD', 'VEHICLE', 'CREATURE', 'WEAPON',
    'TECH', 'MILLION_BUCKS', 'TREASURE', 'COSMIC', 'OBJECT'
  ];
  for (const cat of categories) {
    const sprite = generateProceduralPixelSprite(cat, 'sample wish');
    assertValid16x16Sprite(sprite, `Category(${cat})`);
  }
});
