// Persistent Wish Scenario Cache System for GENIE
// Stores LLM-generated pixel-art sprites, choreographies, taunts, and legal loopholes
// Enables instant retrieval for recurring or similar wishes without re-querying the LLM.
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/safeStorage.js';

const CACHE_STORAGE_KEY = 'genie_wish_cache_v2';
const MAX_CACHE_ENTRIES = 150;

const SAFETY_QUALIFIERS = new Set([
  'gently',
  'safely',
  'peacefully',
  'harmless',
  'harmlessly',
  'slowly',
  'legal',
  'tender',
  'tiny',
  'toy',
  'miniature',
  'plastic',
  'plush',
  'warm',
  'cold',
  'room',
  'temperature',
  'palm',
  'table',
  'open'
]);

// In-memory cache mirror
let memoryCache = null;

/**
 * Normalizes wish text to allow deterministic & token-safe matching:
 * e.g. "I want a dragon!", "Summon the dragon" -> "dragon"
 */
export function normalizeWishKey(rawWish) {
  if (!rawWish || typeof rawWish !== 'string') return '';

  let normalized = rawWish.trim().toLowerCase();

  // Strip punctuation and quotes
  normalized = normalized.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '');

  // Collapse multiple whitespaces
  normalized = normalized.replace(/\s+/g, ' ').trim();

  // Strip common conversational wish preambles
  const preambles = [
    /^i would like to have\s+/,
    /^i would like to\s+/,
    /^i would like\s+/,
    /^i want to have\s+/,
    /^i want to see\s+/,
    /^i want to be\s+/,
    /^i want to\s+/,
    /^i want\s+/,
    /^i wish for\s+/,
    /^i wish to\s+/,
    /^i wish\s+/,
    /^can i have\s+/,
    /^can you give me\s+/,
    /^please grant me\s+/,
    /^please give me\s+/,
    /^give me\s+/,
    /^make me\s+/,
    /^grant me\s+/,
    /^let me be\s+/,
    /^summon\s+/
  ];

  for (const regex of preambles) {
    if (regex.test(normalized)) {
      normalized = normalized.replace(regex, '').trim();
      break;
    }
  }

  // Strip leading English articles so "a dragon" and "the dragon" share the same key
  normalized = normalized.replace(/^(?:a|an|the)\s+/, '').trim();

  return normalized;
}

function extractNumericSignature(tokens) {
  return tokens.filter((t) => /^\d+$/.test(t)).join(',');
}

function extractSafetySignature(tokens) {
  return tokens.filter((t) => SAFETY_QUALIFIERS.has(t)).sort().join(',');
}

function isTokenCompatibleMatch(keyA, keyB) {
  if (keyA === keyB) return true;
  const tokensA = keyA.split(/\s+/).filter(Boolean);
  const tokensB = keyB.split(/\s+/).filter(Boolean);
  if (tokensA.length === 0 || tokensB.length === 0) return false;

  // Never match different numeric quantities (e.g. "10 dollars" vs "100 dollars")
  if (extractNumericSignature(tokensA) !== extractNumericSignature(tokensB)) return false;

  // Never blur safe/airtight qualifiers with bare unsafe wishes
  if (extractSafetySignature(tokensA) !== extractSafetySignature(tokensB)) return false;

  const [shorter, longer] = tokensA.length <= tokensB.length ? [tokensA, tokensB] : [tokensB, tokensA];
  if (longer.length - shorter.length > 1) return false;
  if (!shorter.some((tok) => tok.length >= 3)) return false;

  const longerSet = new Set(longer);
  return shorter.every((tok) => longerSet.has(tok));
}

/**
 * Loads the full cache from localStorage into memory, purging legacy failed fallbacks
 */
function loadCache() {
  if (memoryCache !== null) return memoryCache;

  try {
    const raw = safeGetItem(CACHE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const cleaned = {};
        let purgedLegacy = false;
        for (const [k, entry] of Object.entries(parsed)) {
          if (entry && typeof entry === 'object' && entry.source !== 'local_llm_fallback') {
            cleaned[k] = entry;
          } else {
            purgedLegacy = true;
          }
        }
        memoryCache = cleaned;
        if (purgedLegacy) persistCache();
        return memoryCache;
      }
    }
  } catch (err) {
    console.warn('Failed to load wish cache from localStorage:', err);
  }

  memoryCache = {};
  return memoryCache;
}

/**
 * Persists memory cache to localStorage with LRU eviction if quota exceeded
 */
function persistCache() {
  if (!memoryCache || typeof localStorage === 'undefined') return;

  const payload = JSON.stringify(memoryCache);
  if (safeSetItem(CACHE_STORAGE_KEY, payload)) return;

  console.warn('localStorage quota warning in wish cache, evicting oldest entries');
  const entries = Object.entries(memoryCache);
  entries.sort((a, b) => (a[1].last_accessed || 0) - (b[1].last_accessed || 0));

  const trimmed = {};
  entries.slice(Math.floor(entries.length / 2)).forEach(([k, v]) => {
    trimmed[k] = v;
  });

  memoryCache = trimmed;
  safeSetItem(CACHE_STORAGE_KEY, JSON.stringify(memoryCache));
}

/**
 * Retrieves a cached wish scenario if present
 */
export function getCachedWish(wishText, { includeProcedural = false } = {}) {
  const cache = loadCache();
  const normalizedKey = normalizeWishKey(wishText);
  if (!normalizedKey) return null;

  const isEligible = (entry) => {
    if (!entry || !entry.scenario) return false;
    if (entry.source === 'local_llm_fallback') return false;
    if (!includeProcedural && entry.source === 'procedural') return false;
    return true;
  };

  // 1. Exact normalized match
  const exactEntry = cache[normalizedKey];
  if (isEligible(exactEntry)) {
    exactEntry.hit_count = (exactEntry.hit_count || 0) + 1;
    exactEntry.last_accessed = Date.now();
    persistCache();
    return {
      ...exactEntry.scenario,
      from_cache: true,
      cache_source: exactEntry.source,
      generation_source: exactEntry.source,
      fallback_used: false
    };
  }

  // 2. Whole-token subset match (never matches partial substrings or distinct numbers)
  for (const [k, entry] of Object.entries(cache)) {
    if (!isEligible(entry)) continue;
    if (isTokenCompatibleMatch(k, normalizedKey)) {
      entry.hit_count = (entry.hit_count || 0) + 1;
      entry.last_accessed = Date.now();
      persistCache();
      return {
        ...entry.scenario,
        from_cache: true,
        cache_source: entry.source,
        generation_source: entry.source,
        fallback_used: false
      };
    }
  }

  return null;
}

/**
 * Saves a newly generated wish scenario into cache
 */
export function saveCachedWish(wishText, scenario, source = 'local_llm') {
  if (!wishText || !scenario) return;
  if (source === 'local_llm_fallback' || source === 'procedural_fallback') return;

  const cache = loadCache();
  const normalizedKey = normalizeWishKey(wishText) || wishText.trim().toLowerCase();

  // Enforce max entries before adding using LRU eviction
  const keys = Object.keys(cache);
  if (keys.length >= MAX_CACHE_ENTRIES && !cache[normalizedKey]) {
    const oldestKey = keys.reduce((oldest, k) => {
      return (cache[k].last_accessed || 0) < (cache[oldest].last_accessed || 0) ? k : oldest;
    }, keys[0]);
    delete cache[oldestKey];
  }

  cache[normalizedKey] = {
    original_wish: wishText.trim(),
    source,
    cached_at: Date.now(),
    last_accessed: Date.now(),
    hit_count: 1,
    scenario: {
      wishText: wishText.trim(),
      survived: scenario.survived ?? false,
      loophole_score: scenario.loophole_score ?? (scenario.survived ? 75 : 20),
      genie_taunt: scenario.genie_taunt || 'Your wish has materialized.',
      loophole_explanation: scenario.loophole_explanation || 'Literal interpretation executed.',
      voice_pitch: scenario.voice_pitch || 1.0,
      custom_prop: scenario.custom_prop || null,
      choreography_timeline: scenario.choreography_timeline || []
    }
  };

  persistCache();
}

/**
 * Returns statistics about the wish cache
 */
export function getWishCacheStats() {
  const cache = loadCache();
  const entries = Object.values(cache);
  const totalHits = entries.reduce((acc, curr) => acc + (curr.hit_count || 1), 0);
  return {
    count: entries.length,
    totalHits,
    entries: entries.map((e) => ({
      wish: e.original_wish,
      source: e.source,
      hits: e.hit_count,
      survived: e.scenario?.survived,
      date: new Date(e.cached_at).toLocaleDateString()
    }))
  };
}

/**
 * Wipes the wish cache
 */
export function clearWishCache() {
  memoryCache = {};
  safeRemoveItem(CACHE_STORAGE_KEY);
}
