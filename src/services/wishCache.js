// Persistent Wish Scenario Cache System for GENIE
// Stores LLM-generated pixel-art sprites, choreographies, taunts, and legal loopholes
// Enables instant retrieval for recurring or similar wishes without re-querying the local LLM.

const CACHE_STORAGE_KEY = 'genie_wish_cache_v2';
const MAX_CACHE_ENTRIES = 150;

// In-memory cache mirror
let memoryCache = null;

/**
 * Normalizes wish text to allow fuzzy/semantic matching:
 * e.g. "I want 10 dollars!", "i wish for 10 dollars", "give me 10 dollars" -> "10 dollars"
 */
export function normalizeWishKey(rawWish) {
  if (!rawWish || typeof rawWish !== 'string') return '';

  let normalized = rawWish.trim().toLowerCase();

  // Strip punctuation and quotes
  normalized = normalized.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '');

  // Collapse multiple whitespaces
  normalized = normalized.replace(/\s+/g, ' ');

  // Strip common conversational wish preambles
  const preambles = [
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

  return normalized;
}

/**
 * Loads the full cache from localStorage into memory
 */
function loadCache() {
  if (memoryCache !== null) return memoryCache;
  if (typeof localStorage === 'undefined') {
    memoryCache = {};
    return memoryCache;
  }

  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (raw) {
      memoryCache = JSON.parse(raw);
    } else {
      memoryCache = {};
    }
  } catch (err) {
    console.warn('Failed to load wish cache from localStorage:', err);
    memoryCache = {};
  }

  return memoryCache;
}

/**
 * Persists memory cache to localStorage with LRU eviction if quota exceeded
 */
function persistCache() {
  if (!memoryCache || typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(memoryCache));
  } catch (err) {
    console.warn('localStorage quota warning in wish cache, evicting oldest entries:', err);
    // Evict oldest entries
    const entries = Object.entries(memoryCache);
    entries.sort((a, b) => (a[1].last_accessed || 0) - (b[1].last_accessed || 0));

    // Keep only the most recent half
    const trimmed = {};
    entries.slice(Math.floor(entries.length / 2)).forEach(([k, v]) => {
      trimmed[k] = v;
    });

    memoryCache = trimmed;
    try {
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(memoryCache));
    } catch (e) {
      console.error('Failed to persist trimmed cache:', e);
    }
  }
}

/**
 * Retrieves a cached wish scenario if present
 */
export function getCachedWish(wishText) {
  const cache = loadCache();
  const normalizedKey = normalizeWishKey(wishText);
  if (!normalizedKey) return null;

  // 1. Exact normalized match
  if (cache[normalizedKey]) {
    const entry = cache[normalizedKey];
    entry.hit_count = (entry.hit_count || 0) + 1;
    entry.last_accessed = Date.now();
    persistCache();
    return { ...entry.scenario, from_cache: true, cache_source: entry.source };
  }

  // 2. Substring / Stem match for simple variations (e.g. "car" matches "sports car")
  for (const [k, entry] of Object.entries(cache)) {
    if (k === normalizedKey || (normalizedKey.length > 3 && (k.includes(normalizedKey) || normalizedKey.includes(k)))) {
      entry.hit_count = (entry.hit_count || 0) + 1;
      entry.last_accessed = Date.now();
      persistCache();
      return { ...entry.scenario, from_cache: true, cache_source: entry.source };
    }
  }

  return null;
}

/**
 * Saves a newly generated wish scenario into cache
 */
export function saveCachedWish(wishText, scenario, source = 'local_llm') {
  if (!wishText || !scenario) return;

  const cache = loadCache();
  const normalizedKey = normalizeWishKey(wishText) || wishText.trim().toLowerCase();

  // Enforce max entries before adding
  const keys = Object.keys(cache);
  if (keys.length >= MAX_CACHE_ENTRIES) {
    const oldestKey = keys.reduce((oldest, k) => {
      return (cache[k].last_accessed || 0) < (cache[oldest].last_accessed || 0) ? k : oldest;
    }, keys[0]);
    delete cache[oldestKey];
  }

  cache[normalizedKey] = {
    original_wish: wishText.trim(),
    source: source,
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
    entries: entries.map(e => ({
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
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(CACHE_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear wish cache:', err);
    }
  }
}
