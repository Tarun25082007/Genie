// Multi-Provider LLM Director Router + Strict Schema Sanitizer & System Prompt Template
import { synthesizeTopicScenario, generateProceduralPixelSprite } from '../engine/topicPixelArtGenerator.js';

export const SYSTEM_PROMPT_TEMPLATE = `You are the malicious, hyper-literal cosmic entity governing the 2D physics sandbox game "GENIE".
CURRENT PERSONA: {{THEME_NAME}} ({{THEME_ROLE}})
PERSONA RULES & TONE: {{THEME_PERSONA_PROMPT}}
CURRENT WISH NUMBER: {{WISH_NUMBER}} of {{MAX_WISHES}}

YOUR TASK:
Analyze the player's wish as the malicious, hyper-literal cosmic entity of the Monkey's Paw.

========================================================================
THE IRON LAW OF THE MONKEY'S PAW (MANDATORY & ABSOLUTE):
1. NEVER SAY "YOUR WISH IS VAGUE" OR "LACKS BOUNDS ON MASS/VELOCITY/DNA/SPATIAL DEFINITION".
   - Saying "your wish is semantically vague" or "lacks bounds on mass/velocity" is STRICTLY FORBIDDEN!
2. YOU MUST USE THE EXACT THING WISHED FOR AS THE FATAL WEAPON OR KARMIC TRAP!
   - Every wish is granted 100% LITERALLY, but with ruthless, dark-comedy situational irony:
     * If the player wishes to BE A DECEASED PERSON (e.g. "I want to be Pelé", "Make me Napoleon", "I want to be Cleopatra", "I want to be Julius Caesar"):
       Pelé passed away on Dec 29, 2022! Grant it literally: mutate the player into his posthumous skeleton in a Brazilian jersey, while a supersonic 200 mph World Cup soccer ball slams into their ribcage!
       Napoleon died at Waterloo/St. Helena: a massive British artillery cannonball obliterates them!
       Caesar died by 23 stab wounds: 23 Roman daggers rain down from above!
     * If the player wishes for a SPORT or ATHLETE:
       Use their iconic equipment (e.g. colossal soccer ball, bowling ball, hockey puck, giant spring boxing glove) at supersonic speed!
     * If the player wishes for a MONSTER or BEAST (e.g. "dragon", "godzilla", "dinosaur", "shark"):
       The beast itself appears and kills them in its signature lore manner (dragon dives down and breathes torrents of FIRE; Godzilla stomps with atomic breath; shark brings a tsunami)!
     * If the player wishes for an OBJECT (e.g. "sandwich", "car", "iphone", "diamond", "pizza"):
       THAT EXACT OBJECT is the custom prop that crushes, electrocutes, or incinerates them!
     * If the player wishes for a VERB or STATE (e.g. "fly", "hot", "invisible", "sleep", "sing"):
       Take that state to its lethal physical extreme (fly = launched to vacuum of space; hot = spontaneous combustion; invisible = retinas are transparent so blind, then hit by steamroller)!
3. LOOPHOLE EXPLANATION MUST EXPLAIN THE SPECIFIC KARMIC IRONY:
   - State the exact historical fact, biological catch, or situational irony (e.g. "Pelé passed away on Dec 29, 2022. You are granted his post-mortem skeletal form while a 200 mph golden penalty kick scores directly through your chest.").

========================================================================
EVALUATE AIRTIGHTNESS:
- 0 to 79 (Kills Player): The wish did not explicitly guard against karmic situational irony or physical side-effects. Set "survived": false.
- 80 to 100 (Player Survives): The player wrote an extraordinarily clever, legally airtight clause explicitly guarding against all karmic twists, velocity harm, biological side-effects, and posthumous states. Set "survived": true.

STAGE COORDINATES (CRITICAL):
- Physics Canvas is 960px wide x 540px high.
- Chamber walls: 0..36px (left/top), 924..960px (right). Floor surface is at y = 504px.
- Player Ragdoll spawns standing at x = 480, y = 440 (head at y=400, torso at y=438, legs at y=482).
- Genie floats at x = 220, y = 220.
- Ragdoll body parts: "head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg", "all".
- Ragdoll breakable joints: "neck", "leftShoulder", "rightShoulder", "leftHip", "rightHip", "all".
- Cellular particles: "BLOOD", "FIRE", "LAVA", "ACID", "WATER", "OIL", "ICE", "SMOKE", "SAND", "GOLD", "ASH", "SPARK".

CRITICAL: FOR EVERY TOPIC, CREATE A BRAND-NEW CUSTOM 16x16 PIXEL ART SPRITE ("custom_prop"):
- Draw a 16x16 pixel icon specifically depicting the exact entity the player wished for (e.g. a soccer ball for Pelé, a dragon for dragon, a car for car).
- Scale: 4.0 to 6.0, mass: 100 to 950.
- Palette keys: "." is transparent null. Letters (A, B, C, D, etc.) are hex colors like "#00f5d4", "#d90429", "#ffd166".
- Matrix: Exactly 16 strings of exactly 16 characters each.

ATOMIC CHOREOGRAPHY VERBS:
- SPAWN_OBJECT: { "prop_type": "CUSTOM_PROP", "x": 480, "y": 60, "vx": 0, "vy": 24, "mass": 350, "scale": 4.5 } (or horizontal drive-by: { "x": -80, "y": 440, "vx": 30, "vy": 0 })
- MUTATE_PART: { "part": "all" | "head", "tint": "#e2e8f0" (skeleton) | "#10b981" (zombie) | "#ffd166" (gold), "scale_x": 1.0, "scale_y": 1.0 }
- CAMERA_FX: { "effect": "SCREEN_SHAKE" | "ZOOM_ON_PLAYER" | "RED_FLASH" | "CRT_GLITCH", "intensity": 25, "duration_ms": 800 }
- APPLY_FORCE: { "target": "torso" | "head" | "all", "fx": 0.25, "fy": -0.2 }
- DESTROY_JOINT: { "joint": "neck" | "leftShoulder" | "rightShoulder" | "leftHip" | "rightHip" | "all", "blood_burst": 200 }
- EMIT_PARTICLES: { "type": "BLOOD" | "FIRE" | "LAVA" | "ACID" | "WATER" | "GOLD" | "ICE" | "SMOKE" | "SPARK", "x": 480, "y": 440, "count": 300, "spread": 45 }
- WORLD_MODIFIER: { "modifier": "GRAVITY" | "DELETE_FLOOR" | "BLACK_HOLE" | "CEILING_SPIKES", "gravity_y": -6.0 }

5. OUTPUT STRICT JSON ONLY:
{
  "survived": false,
  "loophole_score": 15,
  "genie_taunt": "...",
  "loophole_explanation": "...",
  "voice_pitch": 1.0,
  "custom_prop": {
    "name": "TOPIC_NAME",
    "width": 16,
    "height": 16,
    "scale": 4.5,
    "mass": 350,
    "restitution": 0.1,
    "palette": {
      ".": null,
      "A": "#212529",
      "B": "#d90429",
      "C": "#ffd166",
      "W": "#ffffff"
    },
    "matrix": [
      "................",
      "....AAAAAAAA....",
      "...ABBBBBBBBA...",
      "..ABCCCCCCCCBA..",
      "..ABCCWCCCCBAA..",
      ".ABCCCCCCCCCCBA.",
      ".ABBBBBBBBBBBAA.",
      "ABCCCCCCCCCCCCBA",
      "ABCCCCCCCCCCCCBA",
      ".ABBBBBBBBBBBAA.",
      ".ABCCCCCCCCCCBA.",
      "..ABCCCCCCCCBA..",
      "..ABBBBBBBBAA...",
      "...AAAAAAAAA....",
      "................",
      "................"
    ]
  },
  "choreography_timeline": [
    { "time_ms": 100, "verb": "CAMERA_FX", "params": { "effect": "ZOOM_ON_PLAYER", "intensity": 8, "duration_ms": 700 } },
    { "time_ms": 220, "verb": "SPAWN_OBJECT", "params": { "prop_type": "CUSTOM_PROP", "x": 480, "y": 70, "vx": 0, "vy": 26, "mass": 380, "scale": 4.5 } },
    { "time_ms": 550, "verb": "CAMERA_FX", "params": { "effect": "SCREEN_SHAKE", "intensity": 28, "duration_ms": 850 } },
    { "time_ms": 570, "verb": "DESTROY_JOINT", "params": { "joint": "neck", "blood_burst": 200 } },
    { "time_ms": 600, "verb": "DESTROY_JOINT", "params": { "joint": "all", "blood_burst": 300 } },
    { "time_ms": 630, "verb": "EMIT_PARTICLES", "params": { "type": "BLOOD", "x": 480, "y": 440, "count": 350, "spread": 45 } }
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
  provider = 'ollama_strong',
  credentials = {},
  themeContext = null,
  wishNumber = 1
) {
  const cleanWish = wishText.trim();
  if (!cleanWish) return null;

  const isOllama = provider === 'ollama' || provider === 'ollama_strong' || provider === 'ollama_weak';

  const resolvedApiKey = credentials?.apiKey || (
    provider === 'groq'
      ? (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_API_KEY)
      : provider === 'gemini'
      ? (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY)
      : ''
  ) || '';

  if (provider === 'mock' || (!isOllama && !resolvedApiKey)) {
    return synthesizeTopicScenario(cleanWish);
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
    } else if (isOllama) {
      const endpoint = credentials.endpoint || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OLLAMA_ENDPOINT) || 'http://localhost:11434';
      let model = 'llama3.2';
      if (provider === 'ollama_strong') {
        model = credentials.ollamaStrongModel || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OLLAMA_STRONG_MODEL) || 'llama3.3';
      } else if (provider === 'ollama_weak') {
        model = credentials.ollamaWeakModel || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OLLAMA_WEAK_MODEL) || 'llama3.2';
      } else {
        model = credentials.model || 'llama3.2';
      }
      rawResponse = await queryOllama(cleanWish, endpoint, model, systemPrompt);
    }

    const sanitized = sanitizeDirectorSchema(rawResponse, cleanWish);
    return sanitized;
  } catch (err) {
    console.warn(`Director provider "${provider}" failed. Falling back to topic procedural synthesis:`, err);
    return synthesizeTopicScenario(cleanWish);
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
  if (!rawText) return synthesizeTopicScenario(originalWish);

  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.warn('JSON parse error from LLM director:', err);
    return synthesizeTopicScenario(originalWish);
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

  const fallbackScenario = synthesizeTopicScenario(originalWish);

  // Validate and sanitize custom_prop
  let customProp = null;
  if (parsed.custom_prop && typeof parsed.custom_prop === 'object') {
    const cp = parsed.custom_prop;
    if (Array.isArray(cp.matrix) && cp.matrix.length > 0) {
      const fixedMatrix = cp.matrix.slice(0, 16).map(row => {
        const str = String(row || '');
        if (str.length === 16) return str;
        if (str.length < 16) return str.padEnd(16, '.');
        return str.substring(0, 16);
      });
      while (fixedMatrix.length < 16) fixedMatrix.push('................');

      const palette = { ...cp.palette, '.': null };
      customProp = {
        name: String(cp.name || 'CUSTOM_PROP').toUpperCase(),
        width: 16,
        height: 16,
        scale: typeof cp.scale === 'number' ? Math.max(2, Math.min(6, cp.scale)) : 4.5,
        mass: typeof cp.mass === 'number' ? Math.max(50, Math.min(999, cp.mass)) : 380,
        restitution: typeof cp.restitution === 'number' ? cp.restitution : 0.1,
        palette,
        matrix: fixedMatrix
      };
    }
  }

  // If local model omitted custom_prop, supply procedural pixel sprite for this topic!
  if (!customProp) {
    customProp = fallbackScenario.custom_prop;
  }

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
    genie_taunt: parsed.genie_taunt || fallbackScenario.genie_taunt,
    loophole_explanation: parsed.loophole_explanation || fallbackScenario.loophole_explanation,
    voice_pitch: typeof parsed.voice_pitch === 'number' ? Math.max(0.5, Math.min(1.8, parsed.voice_pitch)) : 1.0,
    custom_prop: customProp,
    choreography_timeline: timeline
  };
}

export async function testProviderConnection(provider, apiKey, endpoint = '', targetModel = '') {
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
        ? { success: true, message: 'Groq API connection verified! (Llama-3.3 70B ready)' }
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
        ? { success: true, message: 'Google Gemini API connection verified! (Gemini 2.5 ready)' }
        : { success: false, message: `Gemini error: ${res.statusText}` };
    } catch (err) {
      return { success: false, message: `Failed to connect to Gemini: ${err.message}` };
    }
  }

  if (provider === 'ollama' || provider === 'ollama_strong' || provider === 'ollama_weak') {
    const ep = endpoint || 'http://localhost:11434';
    try {
      const res = await fetch(`${ep.replace(/\/$/, '')}/api/tags`);
      if (!res.ok) {
        return { success: false, message: `Ollama error: ${res.statusText}` };
      }
      const data = await res.json();
      const installedModels = (data.models || []).map((m) => m.name || m.model || '');

      if (targetModel) {
        const targetClean = targetModel.trim().toLowerCase();
        const found = installedModels.some((m) => {
          const mClean = m.toLowerCase();
          return (
            mClean === targetClean ||
            mClean.startsWith(targetClean + ':') ||
            targetClean.startsWith(mClean.split(':')[0])
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
            success: true,
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
        message: `Could not reach Ollama at ${ep}. Make sure "ollama serve" is running.`
      };
    }
  }

  return { success: false, message: 'Unknown provider.' };
}
