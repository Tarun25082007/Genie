// 12 Offline Wish Scenarios (10 Lethal Twists + 2 Airtight Survivals) in Exact Verb & Output Schema

export const MOCK_WISHES = [
  // 1. Rich
  {
    id: 'rich',
    wishText: 'I want to be rich',
    survived: false,
    loophole_score: 12,
    genie_taunt: 'You requested unlimited physical riches without specifying mass or delivery velocity. Commencing terminal bullion delivery!',
    loophole_explanation: 'Clause 4.1: Ambiguity in delivery vector & velocity of legal tender. 1,000 tons of minted bullion dropped from altitude directly overhead.',
    voice_pitch: 1.0,
    custom_prop: {
      name: 'HEAVY_VAULT',
      width: 16,
      height: 16,
      scale: 4,
      mass: 250,
      restitution: 0.05,
      palette: {
        '.': null,
        'K': '#1f242d',
        'I': '#6c757d',
        'i': '#adb5bd',
        'G': '#ffd166'
      },
      matrix: [
        'IIIIIIIIIIIIIIII',
        'IiiiiiiiiiiiiiiK',
        'IiKKKKKKKKKKKKiK',
        'IiKiiiiiiiiiKiIK',
        'IiKiKKKKKKKiKiIK',
        'IiKiKIIIIIKiKiIK',
        'IiKiKIGGGIKiKiIK',
        'IiKiKIGGGIKiKiIK',
        'IiKiKKKKKKKiKiIK',
        'IiKiiiiiiiiiKiIK',
        'IiKKKKKKKKKKKiIK',
        'IiiiiiiiiiiiiiiK',
        'IKKKKKKKKKKKKKIK',
        'IIIIIIIIIIIIIIII',
        'KKKKKKKKKKKKKKKK',
        '................'
      ]
    },
    choreography_timeline: [
      { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'GOLD_BAR', x: 480, y: 120, vx: 0, vy: 12, mass: 40, scale: 3, count: 3, spread_x: 60 } },
      { time_ms: 500, verb: 'EMIT_PARTICLES', params: { type: 'GOLD', x: 480, y: 150, count: 200, spread: 35 } },
      { time_ms: 1100, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 90, vx: 0, vy: 26, mass: 300, scale: 4 } },
      { time_ms: 1500, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 26, duration_ms: 900 } },
      { time_ms: 1520, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 180 } },
      { time_ms: 1540, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 250 } },
      { time_ms: 1580, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 400, spread: 45 } }
    ]
  },

  // 2. Million Bucks
  {
    id: 'million_bucks',
    wishText: 'I want a million bucks',
    survived: false,
    loophole_score: 16,
    genie_taunt: 'A million bucks? Conveniently, a migrating herd of horned ungulates required right-of-way through your ribcage!',
    loophole_explanation: 'Clause 7.9: Colloquial monetary term conflated with male cervid biology. 1,000,000 antlered deer stampeding horizontally.',
    voice_pitch: 1.15,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'SPIKE_BALL', x: 90, y: 450, vx: 22, vy: 0, mass: 80, scale: 3, count: 3, spread_x: 90 } },
      { time_ms: 600, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 22, duration_ms: 800 } },
      { time_ms: 700, verb: 'APPLY_FORCE', params: { target: 'torso', fx: 0.18, fy: -0.15 } },
      { time_ms: 720, verb: 'DESTROY_JOINT', params: { joint: 'leftLeg', blood_burst: 140 } },
      { time_ms: 740, verb: 'DESTROY_JOINT', params: { joint: 'rightLeg', blood_burst: 140 } },
      { time_ms: 850, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 460, count: 350, spread: 40 } }
    ]
  },

  // 3. Sandwich
  {
    id: 'sandwich',
    wishText: 'Make me a sandwich',
    survived: false,
    loophole_score: 22,
    genie_taunt: 'Transform petitioner into sandwich? Or drop an ultra-dense 400-ton artisanal BLT directly on petitioner? Both are legally admissible!',
    loophole_explanation: 'Clause 2.3: Syntactic ambiguity between culinary creation and somatic transfiguration.',
    voice_pitch: 0.95,
    custom_prop: {
      name: 'MEGATON_BLT',
      width: 16,
      height: 16,
      scale: 5,
      mass: 350,
      restitution: 0.1,
      palette: {
        '.': null,
        'b': '#d4a373',
        'B': '#603808',
        'L': '#38b000',
        'R': '#d90429',
        'Y': '#ffd166',
        'W': '#fefae0'
      },
      matrix: [
        '.....bbbbbb.....',
        '..bbbbbbbbbbbb..',
        '.bWWbWWbbWWbWWb.',
        'bbbbbbbbbbbbbbbb',
        'LLLLLLLLLLLLLLLL',
        'RRRRRRRRRRRRRRRR',
        'YYYYYYYYYYYYYYYY',
        'BBBBBBBBBBBBBBBB',
        'BBBBBBBBBBBBBBBB',
        'YYYYYYYYYYYYYYYY',
        'RRRRRRRRRRRRRRRR',
        'LLLLLLLLLLLLLLLL',
        'bbbbbbbbbbbbbbbb',
        '.bbbbbbbbbbbbbb.',
        '..bbbbbbbbbbbb..',
        '................'
      ]
    },
    choreography_timeline: [
      { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 80, vx: 0, vy: 24, mass: 350, scale: 5 } },
      { time_ms: 650, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 24, duration_ms: 800 } },
      { time_ms: 670, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 120 } },
      { time_ms: 700, verb: 'DESTROY_JOINT', params: { joint: 'leftShoulder', blood_burst: 100 } },
      { time_ms: 720, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 300, spread: 35 } }
    ]
  },

  // 4. Fly
  {
    id: 'fly',
    wishText: 'I want to fly',
    survived: false,
    loophole_score: 18,
    genie_taunt: 'Flight initiated! Atmospheric friction, oxygen tanks, and reverse deceleration thrusters were not stipulated in your contract.',
    loophole_explanation: 'Clause 12.1: Failure to specify terminal altitude or descent mechanics. Local gravity inverted to negative 6.0G.',
    voice_pitch: 1.25,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 100, verb: 'WORLD_MODIFIER', params: { modifier: 'GRAVITY', gravity_x: 0, gravity_y: -6.0, duration_ms: 3000 } },
      { time_ms: 150, verb: 'APPLY_FORCE', params: { target: 'all', fx: 0, fy: -0.8 } },
      { time_ms: 400, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 440, count: 200, spread: 30 } },
      { time_ms: 550, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 20, duration_ms: 800 } },
      { time_ms: 600, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 150 } },
      { time_ms: 650, verb: 'DESTROY_JOINT', params: { joint: 'leftLeg', blood_burst: 120 } },
      { time_ms: 700, verb: 'DESTROY_JOINT', params: { joint: 'rightLeg', blood_burst: 120 } }
    ]
  },

  // 5. Hot
  {
    id: 'hot',
    wishText: 'I want to be hot',
    survived: false,
    loophole_score: 8,
    genie_taunt: 'Radiant, scorching, thermal excellence granted! Raising petitioner core somatic temperature to 4,000 degrees Kelvin!',
    loophole_explanation: 'Clause 6.4: Aesthetic slang interpreted strictly under thermodynamic physical law.',
    voice_pitch: 0.9,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 100, verb: 'EMIT_PARTICLES', params: { type: 'FIRE', x: 480, y: 440, count: 400, spread: 40, duration_ms: 2500 } },
      { time_ms: 300, verb: 'SPAWN_OBJECT', params: { prop_type: 'SPIKE_BALL', x: 480, y: 80, vx: 0, vy: 24, mass: 180, scale: 4 } },
      { time_ms: 600, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 25, duration_ms: 900 } },
      { time_ms: 620, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 100 } },
      { time_ms: 700, verb: 'EMIT_PARTICLES', params: { type: 'ASH', x: 480, y: 440, count: 350, spread: 45 } }
    ]
  },

  // 6. Girlfriend
  {
    id: 'girlfriend',
    wishText: 'I want a girlfriend',
    survived: false,
    loophole_score: 25,
    genie_taunt: 'A companion for life! She stands eighty feet tall, weighs sixty tons, and expresses affection via hydraulic compression!',
    loophole_explanation: 'Clause 8.2: Absence of biological mass or physical force constraints for designated romantic partner.',
    voice_pitch: 1.1,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'ANVIL', x: 480, y: 80, vx: 0, vy: 24, mass: 350, scale: 4 } },
      { time_ms: 650, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 28, duration_ms: 1000 } },
      { time_ms: 670, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 300 } },
      { time_ms: 700, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 450, spread: 50 } }
    ]
  },

  // 7. Peace and Quiet
  {
    id: 'peace_quiet',
    wishText: 'I want peace and quiet',
    survived: false,
    loophole_score: 5,
    genie_taunt: 'Silence is absolute when all vibrating baryonic matter is compressed into an infinitesimal point of infinite density!',
    loophole_explanation: 'Clause 14.5: Definition of silence satisfied via total cessation of molecular kinetic motion into a gravitational singularity.',
    voice_pitch: 0.7,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 100, verb: 'WORLD_MODIFIER', params: { modifier: 'BLACK_HOLE', x: 480, y: 270, strength: 0.02, duration_ms: 3500 } },
      { time_ms: 400, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 20, duration_ms: 1200 } },
      { time_ms: 600, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 120 } },
      { time_ms: 800, verb: 'DESTROY_JOINT', params: { joint: 'leftArm', blood_burst: 100 } },
      { time_ms: 820, verb: 'DESTROY_JOINT', params: { joint: 'rightArm', blood_burst: 100 } },
      { time_ms: 1200, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 200 } },
      { time_ms: 1300, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 270, count: 300, spread: 35 } }
    ]
  },

  // 8. Pass My Exams
  {
    id: 'pass_exams',
    wishText: 'I want to pass my exams',
    survived: false,
    loophole_score: 30,
    genie_taunt: 'Your exams shall pass you... at ninety feet per second, in the form of heavy falling geometric blocks and corrosive grading acid!',
    loophole_explanation: 'Clause 9.1: Directional preposition "pass" executed as overhead kinetic traversal.',
    voice_pitch: 1.05,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 150, verb: 'SPAWN_OBJECT', params: { prop_type: 'TETRIS_T', x: 450, y: 80, vx: 0, vy: 18, mass: 150, scale: 4 } },
      { time_ms: 350, verb: 'SPAWN_OBJECT', params: { prop_type: 'TETRIS_I', x: 510, y: 80, vx: 0, vy: 20, mass: 150, scale: 4 } },
      { time_ms: 600, verb: 'EMIT_PARTICLES', params: { type: 'ACID', x: 480, y: 200, count: 300, spread: 40 } },
      { time_ms: 700, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 22, duration_ms: 800 } },
      { time_ms: 720, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 120 } },
      { time_ms: 750, verb: 'DESTROY_JOINT', params: { joint: 'leftShoulder', blood_burst: 100 } }
    ]
  },

  // 9. Sports Car
  {
    id: 'sports_car',
    wishText: 'I want a sports car',
    survived: false,
    loophole_score: 14,
    genie_taunt: 'A twin-turbo Italian exotic supercar! Delivered via vertical air-drop directly onto your parietal lobe!',
    loophole_explanation: 'Clause 5.7: Transport vehicle delivery coordinate stipulated strictly at petitioner location with zero deceleration rigging.',
    voice_pitch: 1.15,
    custom_prop: {
      name: 'SUPERCAR',
      width: 16,
      height: 16,
      scale: 4,
      mass: 380,
      restitution: 0.15,
      palette: {
        '.': null,
        'R': '#e63946',
        'c': '#48cae4',
        'K': '#11141a',
        'W': '#ffffff'
      },
      matrix: [
        '................',
        '................',
        '....RRRRRRRR....',
        '...RccccccccR...',
        '..RccccccccccR..',
        '.RRRRRRRRRRRRRR.',
        'RRRRRRRRRRRRRRRR',
        'RRRWWWWWRRRWWWRR',
        'RRRRRRRRRRRRRRRR',
        'RRRRRRRRRRRRRRRR',
        'RRKKKRRRRRRKKKRR',
        'RKKKKKRRRRKKKKKR',
        'RKWiKKRRRRKWiKKR',
        'RKKKKKRRRRKKKKKR',
        '.RKKKRRRRRRKKKR.',
        '................'
      ]
    },
    choreography_timeline: [
      { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 80, vx: 0, vy: 26, mass: 380, scale: 4 } },
      { time_ms: 650, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 28, duration_ms: 900 } },
      { time_ms: 670, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 180 } },
      { time_ms: 700, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 250 } },
      { time_ms: 750, verb: 'EMIT_PARTICLES', params: { type: 'FIRE', x: 480, y: 440, count: 250, spread: 35 } }
    ]
  },

  // 10. Tall
  {
    id: 'tall',
    wishText: 'I want to be tall',
    survived: false,
    loophole_score: 20,
    genie_taunt: 'Dissatisfied with vertical stature? Loosening all cartilage and applying 50,000 Newtons of bilateral skeletal traction!',
    loophole_explanation: 'Clause 11.3: Request for height answered via tensile mechanical elongation beyond ultimate somatic yield point.',
    voice_pitch: 1.2,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 100, verb: 'MUTATE_PART', params: { part: 'torso', scale_x: 0.6, scale_y: 3.2, tint: '#ef4444' } },
      { time_ms: 250, verb: 'APPLY_FORCE', params: { target: 'head', fx: 0, fy: -0.4 } },
      { time_ms: 450, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 20, duration_ms: 800 } },
      { time_ms: 470, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 120 } },
      { time_ms: 550, verb: 'DESTROY_JOINT', params: { joint: 'leftLeg', blood_burst: 120 } },
      { time_ms: 570, verb: 'DESTROY_JOINT', params: { joint: 'rightLeg', blood_burst: 120 } },
      { time_ms: 650, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 350, spread: 40 } }
    ]
  },

  // 11. AIRTIGHT SURVIVAL: Herbal Tea
  {
    id: 'airtight_tea',
    wishText: 'I wish for a warm cup of herbal tea placed gently on the table',
    survived: true,
    loophole_score: 95,
    genie_taunt: 'Curse your legal precision! Volume, temperature, container, kinetic velocity, and landing surface specified with zero ambiguity. Take your tea and begone!',
    loophole_explanation: 'Clause 1.0: Hermetic contract drafting with zero operational loopholes. Kinetic velocity constrained below 0.05 m/s.',
    voice_pitch: 1.35,
    custom_prop: {
      name: 'WARM_TEA',
      width: 16,
      height: 16,
      scale: 3,
      mass: 5,
      restitution: 0.2,
      palette: {
        '.': null,
        'W': '#ffffff',
        'w': '#e2e8f0',
        'b': '#92400e',
        'c': '#38bdf8'
      },
      matrix: [
        '................',
        '....c..c..c.....',
        '.....c..c..c....',
        '....c..c..c.....',
        '..WWWWWWWWWW....',
        '..WbbbbbbbbWW...',
        '..WbbbbbbbbW.W..',
        '..WbbbbbbbbW.W..',
        '..WbbbbbbbbWW...',
        '..WWWWWWWWWW....',
        '...WWWWWWWW.....',
        '....WWWWWW......',
        '....WWWWWW......',
        '..WWWWWWWWWW....',
        '.WWWWWWWWWWWW...',
        '................'
      ]
    },
    choreography_timeline: [
      { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 350, vx: 0, vy: 1, mass: 5, scale: 3 } },
      { time_ms: 400, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 340, count: 80, spread: 20 } },
      { time_ms: 700, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 10, duration_ms: 1200 } }
    ]
  },

  // 12. AIRTIGHT SURVIVAL: One Dollar Bill
  {
    id: 'airtight_dollar',
    wishText: 'I wish for one legal tender dollar bill delivered peacefully into my open palm',
    survived: true,
    loophole_score: 92,
    genie_taunt: 'No ambiguity, no millions, no supersonic safe... just a single wrinkled banknote floating down peacefully. You win this round, mortal lawyer.',
    loophole_explanation: 'Clause 1.1: Singular currency unit specified with peaceful kinetic delivery envelope. Petitioner survived unscathed.',
    voice_pitch: 1.3,
    custom_prop: {
      name: 'DOLLAR_BILL',
      width: 16,
      height: 16,
      scale: 3,
      mass: 1,
      restitution: 0.1,
      palette: {
        '.': null,
        'L': '#38b000',
        'l': '#70e000',
        'W': '#ffffff',
        'G': '#ffb703'
      },
      matrix: [
        '................',
        'LLLLLLLLLLLLLLLL',
        'LllllllllllllllL',
        'LlLLLLLLLLLLLLlL',
        'LlLlWWlGGGLlLlLl',
        'LlLlWlLGGGlLlLlL',
        'LlLlllGGGGlllLlL',
        'LlLlllGGGGlllLlL',
        'LlLlWWlGGGLlLlLl',
        'LlLLLLLLLLLLLLlL',
        'LllllllllllllllL',
        'LLLLLLLLLLLLLLLL',
        '................',
        '................',
        '................',
        '................'
      ]
    },
    choreography_timeline: [
      { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 220, vx: 0.1, vy: 1.2, mass: 1, scale: 3 } },
      { time_ms: 500, verb: 'EMIT_PARTICLES', params: { type: 'GOLD', x: 480, y: 240, count: 60, spread: 25 } },
      { time_ms: 800, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 8, duration_ms: 1000 } }
    ]
  }
];

export function analyzeHeuristicWish(rawText) {
  const clean = rawText.trim();
  const lower = clean.toLowerCase();

  const exact = MOCK_WISHES.find(
    (w) => w.wishText.toLowerCase() === lower || lower.includes(w.id)
  );
  if (exact) return { ...exact };

  const isAirtightAttempt =
    lower.includes('gently') ||
    lower.includes('without harming') ||
    lower.includes('peacefully') ||
    lower.includes('safely') ||
    lower.includes('no harm');

  if (isAirtightAttempt && (lower.includes('tea') || lower.includes('coffee') || lower.includes('dollar') || lower.includes('water'))) {
    return {
      wishText: clean,
      survived: true,
      loophole_score: 88,
      genie_taunt: 'Your defensive clauses are disgustingly thorough. Here is your item without harm... for now!',
      loophole_explanation: 'Protective rider: Kinetic force and biological trauma expressly waived in contract drafting.',
      voice_pitch: 1.3,
      custom_prop: null,
      choreography_timeline: [
        { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'GOLD_BAR', x: 480, y: 320, vx: 0, vy: 1, mass: 5, scale: 3 } },
        { time_ms: 500, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 330, count: 100, spread: 25 } },
        { time_ms: 800, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 8, duration_ms: 1000 } }
      ]
    };
  }

  // Lethal fallback
  let propType = 'ANVIL';
  if (lower.match(/\b(rich|money|gold|cash|dollar|wealth)\b/)) propType = 'GOLD_BAR';
  else if (lower.match(/\b(exam|test|study|grade)\b/)) propType = 'TETRIS_T';
  else if (lower.match(/\b(car|speed|fast)\b/)) propType = 'SPIKE_BALL';

  return {
    wishText: clean,
    survived: false,
    loophole_score: 15,
    genie_taunt: `"${clean}"? A delightfully vague wish! Let us see what happens when the cosmos resolves that ambiguity with maximum kinetic force!`,
    loophole_explanation: 'Contractual ambiguity regarding spatial velocity, delivery vector, and physical acceleration.',
    voice_pitch: 1.0,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: propType, x: 480, y: 80, vx: 0, vy: 24, mass: 250, scale: 4 } },
      { time_ms: 600, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 24, duration_ms: 800 } },
      { time_ms: 620, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 150 } },
      { time_ms: 650, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 200 } },
      { time_ms: 700, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 350, spread: 40 } }
    ]
  };
}

export const MOCK_WISH_DATABASE = MOCK_WISHES;
