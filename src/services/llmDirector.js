// Multi-Provider LLM Director Router + Strict Schema Sanitizer & System Prompt Template
import { analyzeHeuristicWish } from './mockWishes.js';

export const SYSTEM_PROMPT_TEMPLATE = `You are the malicious, hyper-literal cosmic entity governing the 2D physics sandbox game "GENIE".
CURRENT PERSONA: {{THEME_NAME}} ({{THEME_ROLE}})
PERSONA RULES & TONE: {{THEME_PERSONA_PROMPT}}
CURRENT WISH NUMBER: {{WISH_NUMBER}} of {{MAX_WISHES}}

YOUR TASK:
Analyze the player's wish with the ruthless precision of a demonic contract lawyer and physicist.
1. Evaluate a "loophole_score" from 0 to 100 based on how legally, physically, spatially, and biologically airtight the wish is:
   - 0 to 79: The wish contains semantic ambiguity, unstated mass/velocity/location bounds, inflation/tax/physics loopholes, or biological hazards. Set "survived": false. Grant the wish 100% LITERALLY in a dark-comedy, ultra-gory 2D physics sequence that kills the player ragdoll.
   - 80 to 100: The player wrote a genuinely clever, legally and physically airtight wish that explicitly guards against spatial crushing, kinetic velocity harm, biological mutation, and legal/physical side effects. Set "survived": true. Grant the wish harmlessly with a celebratory visual sequence.

2. STAGE COORDINATE SYSTEM (CRITICAL):
   - Physics Canvas is 960px wide x 540px high.
   - Chamber walls occupy 0..36px on left/top, 924..960px on right, and floor top surface is at y = 504px.
   - Player Ragdoll spawns standing at x = 480, y = 440 (head at y=400, torso at y=438, legs at y=482).
   - Genie floats at x = 220, y = 220.
   - Ragdoll body part IDs: "head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg", or "all".
   - Ragdoll breakable joint IDs: "neck", "leftShoulder", "rightShoulder", "leftHip", "rightHip", or "all".
   - Cellular Automata particle types: "BLOOD", "FIRE", "ACID", "ASH", "GOLD", "SPARK".

3. OUTPUT STRICT JSON ONLY matching this exact schema (no markdown fences, no commentary outside JSON):
{
  "survived": boolean,
  "loophole_score": number, // integer 0..100 (survived MUST be true iff loophole_score >= 80)
  "genie_taunt": "string (2-3 sentences spoken in persona before/during the wish execution)",
  "loophole_explanation": "string (1-2 sharp legal/physics sentences explaining the exact fatal flaw exploited, or why the wish was airtight)",
  "voice_pitch": number, // float 0.5 to 1.8
  "custom_prop": {
    "name": "string",
    "width": 16,
    "height": 16,
    "scale": number, // integer 2 to 6
    "mass": number, // float 1 to 500
    "restitution": number, // float 0.0 to 0.9
    "palette": {
      ".": null,
      "A": "#HEXCODE",
      "B": "#HEXCODE",
      "C": "#HEXCODE",
      "D": "#HEXCODE"
    },
    "matrix": [
      "16 strings of exactly 16 characters each using keys from palette"
    ]
  },
  "choreography_timeline": [
    {
      "time_ms": number, // 0 to 4500
      "verb": "SPAWN_OBJECT" | "DESTROY_JOINT" | "APPLY_FORCE" | "MUTATE_PART" | "EMIT_PARTICLES" | "ATTACH_CONSTRAINT" | "WORLD_MODIFIER" | "CAMERA_FX",
      "params": { ...verb-specific parameters... }
    }
  ]
}`;

export function populateSystemPrompt(theme, wishNumber = 1, maxWishes = 3) {
  return SYSTEM_PROMPT_TEMPLATE
    .replace('{{THEME_NAME}}', theme?.name || 'Al-Qadim the Literal Djinn')
    .replace('{{THEME_ROLE}}', theme?.role || 'Ancient Mesopotamian Smoke Djinn bound to brass & blood')
    .replace('{{THEME_PERSONA_PROMPT}}', theme?.personaPrompt || 'Ruthlessly literal, mock mortal greed and sloppy phrasing.')
    .replace('{{WISH_NUMBER}}', String(wishNumber))
    .replace('{{MAX_WISHES}}', String(maxWishes));
}

export async function interpretWishWithDirector(
  wishText,
  provider = 'mock',
  credentials = {},
  themeContext = null,
  wishNumber = 1
) {
  const cleanWish = wishText.trim();
  if (!cleanWish) return null;

  const resolvedApiKey = credentials?.apiKey || (
    provider === 'groq'
      ? (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_API_KEY)
      : provider === 'gemini'
      ? (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY)
      : ''
  ) || '';

  if (provider === 'mock' || (!resolvedApiKey && provider !== 'ollama')) {
    return analyzeHeuristicWish(cleanWish);
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
      rawResponse = await queryGemini(cleanWish, resolvedApiKey, credentials.model || 'gemini-1.5-flash', systemPrompt);
    } else if (provider === 'ollama') {
      const endpoint = credentials.endpoint || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OLLAMA_ENDPOINT) || 'http://localhost:11434';
      const model = credentials.model || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OLLAMA_MODEL) || 'llama3';
      rawResponse = await queryOllama(cleanWish, endpoint, model, systemPrompt);
    }

    const sanitized = sanitizeDirectorSchema(rawResponse, cleanWish);
    return sanitized;
  } catch (err) {
    console.warn(`Director provider "${provider}" failed. Falling back to offline heuristic:`, err);
    return analyzeHeuristicWish(cleanWish);
  }
}

async function queryGroq(wishText, apiKey, model, systemPrompt) {
  const candidateModels = [
    model,
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
    'llama-3.3-70b-versatile'
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  let lastError = null;
  for (const m of candidateModels) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
      });

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
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-1.5-flash'
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  let lastError = null;
  for (const m of candidateModels) {
    try {
      const targetModel = m.replace('models/', '');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

      const res = await fetch(url, {
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
      });

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
  const res = await fetch(`${endpoint.replace(/\/$/, '')}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      prompt: `PLAYER WISH: "${wishText}"`,
      stream: false,
      format: 'json'
    })
  });

  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.response || '';
}

export function sanitizeDirectorSchema(rawText, originalWish) {
  if (!rawText) return analyzeHeuristicWish(originalWish);

  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.warn('JSON parse error from LLM director:', err);
    return analyzeHeuristicWish(originalWish);
  }

  let score;
  if (typeof parsed.loophole_score === 'number') {
    score = Math.max(0, Math.min(100, Math.round(parsed.loophole_score)));
  } else if (typeof parsed.survived === 'boolean') {
    score = parsed.survived ? 90 : 25;
  } else {
    score = 25;
  }
  const survived = score >= 80;

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

  const fallbackScenario = analyzeHeuristicWish(originalWish);
  const timeline = Array.isArray(parsed.choreography_timeline) && parsed.choreography_timeline.length > 0
    ? parsed.choreography_timeline
        .filter((step) => step && typeof step.time_ms === 'number' && validVerbs.has(step.verb))
        .map((step) => ({
          time_ms: Math.max(0, Math.min(4500, Math.round(step.time_ms))),
          verb: step.verb,
          params: step.params || {}
        }))
    : fallbackScenario.choreography_timeline;

  return {
    wishText: originalWish,
    survived,
    loophole_score: score,
    genie_taunt: parsed.genie_taunt || 'Your wish is granted... precisely to the letter of cosmic law.',
    loophole_explanation: parsed.loophole_explanation || 'Contractual ambiguity exploited under unconstrained physical force.',
    voice_pitch: typeof parsed.voice_pitch === 'number' ? Math.max(0.5, Math.min(1.8, parsed.voice_pitch)) : 1.0,
    custom_prop: parsed.custom_prop || null,
    choreography_timeline: timeline
  };
}

export async function testProviderConnection(provider, apiKey, endpoint = '') {
  if (provider === 'mock') {
    return { success: true, message: 'Offline Mock Director is ready.' };
  }

  if (provider === 'groq') {
    if (!apiKey) return { success: false, message: 'Groq API Key is required.' };
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      return res.ok
        ? { success: true, message: 'Groq API connection verified!' }
        : { success: false, message: `Groq error: ${res.statusText}` };
    } catch (err) {
      return { success: false, message: `Failed to connect to Groq: ${err.message}` };
    }
  }

  if (provider === 'gemini') {
    if (!apiKey) return { success: false, message: 'Gemini API Key is required.' };
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      return res.ok
        ? { success: true, message: 'Google Gemini API connection verified!' }
        : { success: false, message: `Gemini error: ${res.statusText}` };
    } catch (err) {
      return { success: false, message: `Failed to connect to Gemini: ${err.message}` };
    }
  }

  if (provider === 'ollama') {
    const ep = endpoint || 'http://localhost:11434';
    try {
      const res = await fetch(`${ep.replace(/\/$/, '')}/api/tags`);
      return res.ok
        ? { success: true, message: `Ollama connection verified at ${ep}!` }
        : { success: false, message: `Ollama error: ${res.statusText}` };
    } catch (err) {
      return { success: false, message: `Could not reach Ollama at ${ep}: ${err.message}` };
    }
  }

  return { success: false, message: 'Unknown provider.' };
}
