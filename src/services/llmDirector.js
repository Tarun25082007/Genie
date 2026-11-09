// Multi-Provider LLM Director Router + Strict Schema Sanitizer & System Prompt Template
import { synthesizeTopicScenario } from '../engine/topicPixelArtGenerator.js';
import { getCachedWish, saveCachedWish } from './wishCache.js';

export const SYSTEM_PROMPT_TEMPLATE = `You are the malicious, hyper-literal Genie governing the 2D physics sandbox game "GENIE".
CURRENT PERSONA: {{THEME_NAME}} ({{THEME_ROLE}})
PERSONA RULES & TONE: {{THEME_PERSONA_PROMPT}}
CURRENT WISH NUMBER: {{WISH_NUMBER}} of {{MAX_WISHES}}

THE MANDATORY IRON LAWS:
1. NEVER SAY "YOUR WISH IS VAGUE", "NOT SPECIFIC ENOUGH", OR "LACKS BOUNDS/DEFINITION".
   - Using boilerplate phrases like "the wish is semantically vague" or "lacks bounds on mass/velocity" is STRICTLY FORBIDDEN!

2. GRANT EVERY WISH 100% LITERALLY WITH DARK COMEDY OR SITUATIONAL IRONY:
   - WISHES DO NOT ALWAYS KILL THE PLAYER — THEY HAVE A CHANCE TO SURVIVE OR DIE:

   PATH A: HARMLESS USELESS TROLL ("survived": true)
   - When a wish is mundane, money, toy, food, or everyday object (e.g. "10 dollars", "sandwich", "car", "diamond", "cat"):
     Fulfill it literally, but as a completely useless toy, miniature, or harmless item where the player SURVIVES to suffer the hilarious disappointment!
     * "10 dollars" -> Grants 10 Monopoly toy play dollars! Harmless, completely useless for buying goods. ("survived": true)
     * "car" -> Grants a 1:64 scale Matchbox toy car rolling gently. ("survived": true)
     * "sandwich" -> Drops a PB&J sandwich right on the floor. ("survived": true)
     * "companion" / "girlfriend" -> Drops an inflatable mannequin or plush teddy. ("survived": true)
     * "fly" -> Gives them two party helium balloons that float gently. ("survived": true)
     * Set "survived": true, "loophole_score": 70 to 90.

   PATH B: LETHAL LITERAL KARMIC TWIST ("survived": false)
   - When the wish is dangerous, extreme, a monster, weapon, or asks to become a deceased person:
     Use the EXACT THING wished for as the fatal weapon or karmic trap!
     * DECEASED PERSON (e.g. "become Pelé", "Napoleon", "Cleopatra"):
       Pelé passed away on Dec 29, 2022! Grant it literally: player is turned into a posthumous skeleton while a supersonic World Cup soccer ball slams into them! ("survived": false)
     * MONSTER or BEAST (e.g. "dragon", "Godzilla", "dinosaur"):
       The beast itself appears and attacks directly (dragon swoops down and breathes a torrent of fire; Godzilla stomps)! ("survived": false)
     * WEAPONS or PHYSICAL EXTREMES ("nuke", "cannonball", "sun"):
       Instant catastrophic literal physics impact! ("survived": false)
     * Set "survived": false, "loophole_score": 10 to 30.

3. LOOPHOLE EXPLANATION:
   - State the exact literal catch or historical/situational irony (e.g. "10 children's Monopoly play bills were delivered"; or "Pelé passed away in 2022, so the wish granted his posthumous skeletal form with a soccer ball").

OUTPUT STRICT VALID JSON ONLY (no markdown fences, no extra text):
{
  "survived": false,
  "loophole_score": 15,
  "genie_taunt": "sinister or mocking dialogue mentioning the exact item/entity",
  "loophole_explanation": "how the wish was granted literally with irony",
  "voice_pitch": 1.0
}`;

export function populateSystemPrompt(theme, wishNumber = 1, maxWishes = 3) {
  return SYSTEM_PROMPT_TEMPLATE
    .replace('{{THEME_NAME}}', theme?.name || 'Al-Qadim the Literal Djinn')
    .replace('{{THEME_ROLE}}', theme?.role || 'Ancient Mesopotamian Smoke Djinn bound to brass & blood')
    .replace('{{THEME_PERSONA_PROMPT}}', theme?.personaPrompt || 'Ruthlessly literal, mock mortal greed and sloppy phrasing.')
    .replace('{{WISH_NUMBER}}', String(wishNumber))
    .replace('{{MAX_WISHES}}', String(maxWishes));
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  let timer = null;
  if (controller && !options.signal) {
    timer = setTimeout(() => controller.abort(), timeoutMs);
  }

  try {
    return await fetch(url, {
      ...options,
      signal: options.signal || controller?.signal
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)}s`);
    }
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function interpretWishWithDirector(
  wishText,
  provider = 'ollama_strong',
  credentials = {},
  themeContext = null,
  wishNumber = 1
) {
  const cleanWish = typeof wishText === 'string' ? wishText.trim() : '';
  if (!cleanWish) return null;

  const isOllama = provider === 'ollama' || provider === 'ollama_strong' || provider === 'ollama_weak';

  // 1. FAST PATH: Check persistent local wish cache first!
  const cached = getCachedWish(cleanWish, { includeProcedural: provider === 'mock' });
  if (cached) {
    console.log(`[WishCache] Instant cache hit for "${cleanWish}" (Source: ${cached.cache_source || 'cached'})`);
    return cached;
  }

  const resolvedApiKey = credentials?.apiKey || (
    provider === 'groq'
      ? (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_API_KEY)
      : provider === 'gemini'
      ? (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY)
      : ''
  ) || '';

  if (provider === 'mock' || (!isOllama && !resolvedApiKey)) {
    const procedural = synthesizeTopicScenario(cleanWish);
    const reason = provider === 'mock'
      ? null
      : `Missing ${provider === 'groq' ? 'Groq' : 'Gemini'} API key`;
    if (provider === 'mock') {
      saveCachedWish(cleanWish, procedural, 'procedural');
    }
    return {
      ...procedural,
      generation_source: provider === 'mock' ? 'procedural' : 'procedural_fallback',
      fallback_used: provider !== 'mock',
      ...(reason ? { fallback_reason: reason } : {})
    };
  }

  const systemPrompt = populateSystemPrompt(
    themeContext,
    wishNumber,
    themeContext?.maxWishes || 3
  );

  try {
    let rawResponse = '';

    if (provider === 'groq') {
      rawResponse = await queryGroq(cleanWish, resolvedApiKey, credentials.model || 'llama-3.3-70b-versatile', systemPrompt);
    } else if (provider === 'gemini') {
      rawResponse = await queryGemini(cleanWish, resolvedApiKey, credentials.model || 'gemini-2.5-flash', systemPrompt);
    } else if (isOllama) {
      const endpoint = credentials.endpoint || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OLLAMA_ENDPOINT) || 'http://localhost:11434';
      let model = 'qwen2.5:7b';
      if (provider === 'ollama_strong') {
        model = credentials.ollamaStrongModel || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OLLAMA_STRONG_MODEL) || 'qwen2.5:7b';
      } else if (provider === 'ollama_weak') {
        model = credentials.ollamaWeakModel || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OLLAMA_WEAK_MODEL) || 'llama3.2:3b';
      } else {
        model = credentials.model || 'qwen2.5:7b';
      }
      rawResponse = await queryOllama(cleanWish, endpoint, model, systemPrompt);
    }

    if (!parseJsonResponse(rawResponse)) {
      throw new Error(`Provider "${provider}" returned empty or unparseable JSON`);
    }

    const sanitized = sanitizeDirectorSchema(rawResponse, cleanWish);
    const sourceTag = isOllama ? 'local_llm' : provider;
    saveCachedWish(cleanWish, sanitized, sourceTag);
    return {
      ...sanitized,
      generation_source: sourceTag,
      fallback_used: false
    };
  } catch (err) {
    console.warn(`Director provider "${provider}" failed. Falling back to dynamic procedural synthesis:`, err);
    const fallback = synthesizeTopicScenario(cleanWish);
    return {
      ...fallback,
      generation_source: 'procedural_fallback',
      fallback_used: true,
      fallback_reason: err?.message || 'Provider unavailable'
    };
  }
}

async function queryGroq(wishText, apiKey, model, systemPrompt) {
  const candidateModels = [
    model,
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'openai/gpt-oss-120b'
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  let lastError = null;
  for (const m of candidateModels) {
    try {
      const res = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: m,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `PLAYER WISH: "${wishText}"` }
          ],
          temperature: 0.8,
          response_format: { type: 'json_object' }
        })
      }, 20000);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
      } else {
        const errText = await res.text();
        lastError = new Error(`Groq model ${m} failed (${res.status}): ${errText}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('All Groq candidate models failed');
}

async function queryGemini(wishText, apiKey, model, systemPrompt) {
  const candidateModels = [
    model,
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash'
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  let lastError = null;
  for (const m of candidateModels) {
    try {
      const targetModel = m.replace('models/', '');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nPLAYER WISH: "${wishText}"` }] }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.85
          }
        })
      }, 20000);

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const errText = await res.text();
        lastError = new Error(`Gemini model ${targetModel} failed (${res.status}): ${errText}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini candidate models failed');
}

async function queryOllama(wishText, endpoint, model, systemPrompt) {
  const res = await fetchWithTimeout(`${endpoint.replace(/\/$/, '')}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      prompt: `PLAYER WISH: "${wishText}"`,
      stream: false,
      format: 'json',
      options: {
        num_predict: 300,
        temperature: 0.6
      }
    })
  }, 25000);

  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.response || '';
}

function parseJsonResponse(rawText) {
  if (typeof rawText === 'object' && rawText !== null) return rawText;
  if (typeof rawText !== 'string' || !rawText.trim()) return null;

  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export function sanitizeDirectorSchema(rawText, originalWish) {
  const baseFallback = synthesizeTopicScenario(originalWish);
  const parsed = parseJsonResponse(rawText);
  if (!parsed || typeof parsed !== 'object') {
    return baseFallback;
  }

  let score;
  let survived;
  if (typeof parsed.survived === 'boolean') {
    survived = parsed.survived;
    score = typeof parsed.loophole_score === 'number'
      ? Math.max(0, Math.min(100, Math.round(parsed.loophole_score)))
      : (survived ? 75 : 20);
  } else if (typeof parsed.loophole_score === 'number') {
    score = Math.max(0, Math.min(100, Math.round(parsed.loophole_score)));
    survived = score >= 50;
  } else {
    survived = baseFallback.survived;
    score = baseFallback.loophole_score;
  }

  // Keep procedural fallback timeline & custom prop strictly synchronized with LLM survival verdict
  const fallbackScenario = survived === baseFallback.survived
    ? baseFallback
    : synthesizeTopicScenario(originalWish, survived);

  const validVerbs = new Set([
    'SPAWN_OBJECT',
    'DESTROY_JOINT',
    'APPLY_FORCE',
    'MUTATE_PART',
    'EMIT_PARTICLES',
    'ATTACH_CONSTRAINT',
    'WORLD_MODIFIER',
    'CAMERA_FX'
  ]);

  // Validate and sanitize custom_prop against its palette
  let customProp = null;
  if (parsed.custom_prop && typeof parsed.custom_prop === 'object') {
    const cp = parsed.custom_prop;
    if (Array.isArray(cp.matrix) && cp.matrix.length > 0) {
      const palette = {
        ...(cp.palette && typeof cp.palette === 'object' ? cp.palette : {}),
        '.': null
      };
      const allowedChars = new Set(Object.keys(palette));

      const fixedMatrix = cp.matrix.slice(0, 16).map((row) => {
        const sanitizedRow = Array.from(String(row || ''))
          .slice(0, 16)
          .map((ch) => (allowedChars.has(ch) ? ch : '.'))
          .join('');
        return sanitizedRow.padEnd(16, '.');
      });
      while (fixedMatrix.length < 16) fixedMatrix.push('................');

      const rawScale = typeof cp.scale === 'number' ? Math.max(1.5, Math.min(6, cp.scale)) : (survived ? 3.0 : 4.5);
      const rawMass = typeof cp.mass === 'number' ? Math.max(1, Math.min(999, cp.mass)) : (survived ? 6 : 380);

      customProp = {
        name: String(cp.name || 'CUSTOM_PROP').toUpperCase(),
        width: 16,
        height: 16,
        scale: survived ? Math.min(rawScale, 3.5) : rawScale,
        mass: survived ? Math.min(rawMass, 25) : rawMass,
        restitution: typeof cp.restitution === 'number' ? Math.max(0, Math.min(0.95, cp.restitution)) : 0.2,
        palette,
        matrix: fixedMatrix
      };
    }
  }

  if (!customProp) {
    customProp = fallbackScenario.custom_prop;
  } else if (survived) {
    customProp = {
      ...customProp,
      mass: Math.min(customProp.mass || 6, 25),
      scale: Math.min(customProp.scale || 3.2, 3.5)
    };
  }

  let timeline = Array.isArray(parsed.choreography_timeline) && parsed.choreography_timeline.length > 0
    ? parsed.choreography_timeline
        .filter((step) => step && typeof step.time_ms === 'number' && validVerbs.has(step.verb))
        .map((step) => ({
          time_ms: Math.max(0, Math.min(4500, Math.round(step.time_ms))),
          verb: step.verb,
          params: (step.params && typeof step.params === 'object') ? { ...step.params } : {}
        }))
    : fallbackScenario.choreography_timeline;

  if (!timeline || timeline.length === 0) {
    timeline = fallbackScenario.choreography_timeline;
  }

  // Enforce non-lethal choreography invariants whenever the verdict is survived === true
  if (survived) {
    const safeParticleMap = { BLOOD: 'SPARK', ACID: 'WATER', LAVA: 'GOLD', FIRE: 'SPARK' };
    const filtered = [];
    for (const step of timeline) {
      if (step.verb === 'DESTROY_JOINT') continue;
      if (step.verb === 'APPLY_FORCE') continue;
      if (step.verb === 'WORLD_MODIFIER') continue;
      if (step.verb === 'CAMERA_FX') {
        const eff = String(step.params?.effect || '').toUpperCase();
        if (eff === 'RED_FLASH' || eff === 'RED_GORE_FLASH') continue;
      }
      if (step.verb === 'SPAWN_OBJECT') {
        const p = step.params || {};
        filtered.push({
          ...step,
          params: {
            ...p,
            prop_type: p.prop_type || 'CUSTOM_PROP',
            mass: Math.min(Number(p.mass) || 6, 20),
            scale: Math.min(Number(p.scale) || 3.2, 3.5),
            vy: Math.max(-4, Math.min(Number(p.vy) ?? 2, 6)),
            vx: Math.max(-8, Math.min(Number(p.vx) ?? 0, 8)),
            y: Math.max(200, Math.min(Number(p.y) ?? 300, 440))
          }
        });
        continue;
      }
      if (step.verb === 'EMIT_PARTICLES') {
        const rawType = String(step.params?.type || 'SPARK').toUpperCase();
        filtered.push({
          ...step,
          params: {
            ...step.params,
            type: safeParticleMap[rawType] || rawType,
            count: Math.min(Number(step.params?.count) || 50, 90)
          }
        });
        continue;
      }
      filtered.push(step);
    }

    timeline = filtered.length > 0 ? filtered : fallbackScenario.choreography_timeline;
  }

  return {
    wishText: originalWish,
    survived,
    loophole_score: score,
    genie_taunt: typeof parsed.genie_taunt === 'string' && parsed.genie_taunt.trim()
      ? parsed.genie_taunt.trim()
      : fallbackScenario.genie_taunt,
    loophole_explanation: typeof parsed.loophole_explanation === 'string' && parsed.loophole_explanation.trim()
      ? parsed.loophole_explanation.trim()
      : fallbackScenario.loophole_explanation,
    voice_pitch: typeof parsed.voice_pitch === 'number' ? Math.max(0.5, Math.min(1.8, parsed.voice_pitch)) : 1.0,
    custom_prop: customProp,
    choreography_timeline: timeline
  };
}

export async function testProviderConnection(provider, apiKey, endpoint = '', targetModel = '') {
  if (provider === 'mock') {
    return { success: true, message: 'Offline Mock Director is ready.' };
  }

  const resolvedApiKey = apiKey || (
    provider === 'groq'
      ? (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_API_KEY)
      : provider === 'gemini'
      ? (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY)
      : ''
  ) || '';

  if (provider === 'groq') {
    if (!resolvedApiKey) return { success: false, message: 'Groq API Key is required.' };
    try {
      const res = await fetchWithTimeout('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${resolvedApiKey}` }
      }, 6000);
      return res.ok
        ? { success: true, message: 'Groq API connection verified! (Llama-3.3 70B ready)' }
        : { success: false, message: `Groq error: ${res.statusText || res.status}` };
    } catch (err) {
      return { success: false, message: `Failed to connect to Groq: ${err.message}` };
    }
  }

  if (provider === 'gemini') {
    if (!resolvedApiKey) return { success: false, message: 'Gemini API Key is required.' };
    try {
      const res = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${resolvedApiKey}`,
        {},
        6000
      );
      return res.ok
        ? { success: true, message: 'Google Gemini API connection verified! (Gemini 2.5 ready)' }
        : { success: false, message: `Gemini error: ${res.statusText || res.status}` };
    } catch (err) {
      return { success: false, message: `Failed to connect to Gemini: ${err.message}` };
    }
  }

  if (provider === 'ollama' || provider === 'ollama_strong' || provider === 'ollama_weak') {
    const ep = endpoint || 'http://localhost:11434';
    try {
      const res = await fetchWithTimeout(`${ep.replace(/\/$/, '')}/api/tags`, {}, 6000);
      if (!res.ok) {
        return { success: false, message: `Ollama error: ${res.statusText || res.status}` };
      }
      const data = await res.json();
      const installedModels = (data.models || []).map((m) => m.name || m.model || '');

      if (targetModel) {
        const targetClean = targetModel.trim().toLowerCase();
        const found = installedModels.some((m) => {
          const mClean = m.toLowerCase();
          return (
            mClean === targetClean ||
            mClean === `${targetClean}:latest` ||
            (!targetClean.includes(':') && mClean.split(':')[0] === targetClean)
          );
        });

        if (found) {
          return {
            success: true,
            message: `Ollama Online! Model "${targetModel}" is verified & ready.`
          };
        } else {
          const list = installedModels.length > 0 ? installedModels.slice(0, 3).join(', ') : 'none';
          return {
            success: false,
            message: `Ollama Online, but "${targetModel}" not installed yet. Run "ollama run ${targetModel}". (Installed: ${list})`
          };
        }
      }

      return {
        success: true,
        message: `Ollama connection verified at ${ep}! (${installedModels.length} models detected)`
      };
    } catch (err) {
      return {
        success: false,
        message: `Could not reach Ollama at ${ep}. Make sure "ollama serve" is running (${err.message}).`
      };
    }
  }

  return { success: false, message: 'Unknown provider.' };
}
