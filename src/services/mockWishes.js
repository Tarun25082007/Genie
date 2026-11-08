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
    genie_taunt: 'A companion for life! She stands eighty feet tall, weighs sixty tons of solid iron, and expresses affection via hydraulic compression!',
    loophole_explanation: 'Clause 8.2: Absence of biological mass or physical force constraints for designated romantic partner.',
    voice_pitch: 1.1,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'STATUE_FRIEND', x: 480, y: 80, vx: 0, vy: 22, mass: 450, scale: 5 } },
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

// =========================================================================
// CUSTOM DEATH CHOREOGRAPHY GENERATORS (Distinct Physics & VFX for Each Cause)
// =========================================================================

function generateCarDrivebyDeath(clean) {
  return {
    wishText: clean,
    survived: false,
    loophole_score: 14,
    genie_taunt: 'A high-speed luxury transport? Savor the 200 mile-per-hour horizontal delivery vector directly through your ribcage!',
    loophole_explanation: 'Clause 5.7: Vehicle delivery stipulated strictly on petitioner horizontal plane without braking apparatus.',
    voice_pitch: 1.15,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 10, duration_ms: 800 } },
      { time_ms: 250, verb: 'SPAWN_OBJECT', params: { prop_type: 'SPORTS_CAR', x: -80, y: 440, vx: 28, vy: 0, mass: 450, scale: 4.5 } },
      { time_ms: 450, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 30, duration_ms: 900 } },
      { time_ms: 470, verb: 'APPLY_FORCE', params: { target: 'torso', fx: 0.35, fy: -0.18 } },
      { time_ms: 480, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 200 } },
      { time_ms: 500, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 300 } },
      { time_ms: 520, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 400, spread: 45 } }
    ]
  };
}

function generateSandwichSquashDeath(clean) {
  return {
    wishText: clean,
    survived: false,
    loophole_score: 18,
    genie_taunt: 'A sandwich to die for! Here comes an ultra-dense 400-ton artisanal submarine sandwich to turn you into sandwich meat!',
    loophole_explanation: 'Clause 2.3: Failure to specify mass bounds. 400-ton multi-layer sub dropped from sub-orbit overhead.',
    voice_pitch: 0.95,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 150, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 8, duration_ms: 700 } },
      { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'DAGWOOD_SUB', x: 480, y: 70, vx: 0, vy: 24, mass: 480, scale: 5.5 } },
      { time_ms: 600, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 28, duration_ms: 900 } },
      { time_ms: 620, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 180 } },
      { time_ms: 650, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 250 } },
      { time_ms: 680, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 350, spread: 40 } }
    ]
  };
}

function generatePianoCatastropheDeath(clean) {
  return {
    wishText: clean,
    survived: false,
    loophole_score: 16,
    genie_taunt: 'Music to soothe the mortal soul! Commencing aerial delivery of a concert grand piano tuned to your final scream!',
    loophole_explanation: 'Clause 13.2: Acoustic request fulfilled via sudden atmospheric piano drop with explosive ivory dispersal.',
    voice_pitch: 1.05,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 150, verb: 'SPAWN_OBJECT', params: { prop_type: 'GRAND_PIANO', x: 480, y: 70, vx: 0, vy: 22, angularVelocity: 0.14, mass: 550, scale: 4.5 } },
      { time_ms: 600, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 26, duration_ms: 900 } },
      { time_ms: 620, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 180 } },
      { time_ms: 650, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 280 } },
      { time_ms: 700, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 440, count: 250, spread: 40 } }
    ]
  };
}

function generateMeteorStrikeDeath(clean) {
  return {
    wishText: clean,
    survived: false,
    loophole_score: 8,
    genie_taunt: 'You wish for radiant heat and celestial power? Savor the 5,000 Kelvin embrace of a direct asteroid strike!',
    loophole_explanation: 'Clause 6.4: Ambient thermal temperature raised to solar core magnitude via orbital impact.',
    voice_pitch: 0.9,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 100, verb: 'EMIT_PARTICLES', params: { type: 'FIRE', x: 480, y: 440, count: 300, spread: 40 } },
      { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'METEOR', x: 470, y: 60, vx: 2, vy: 26, mass: 380, scale: 4.5 } },
      { time_ms: 550, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 32, duration_ms: 1000 } },
      { time_ms: 570, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 300 } },
      { time_ms: 620, verb: 'EMIT_PARTICLES', params: { type: 'ASH', x: 480, y: 440, count: 400, spread: 50 } }
    ]
  };
}

function generateBlackHoleSingularityDeath(clean) {
  return {
    wishText: clean,
    survived: false,
    loophole_score: 5,
    genie_taunt: 'Peace and silence? Absolute stillness is achieved when all atomic matter is collapsed into a gravitational singularity!',
    loophole_explanation: 'Clause 14.5: Definition of silence satisfied via total cessation of molecular motion into an infinite event horizon.',
    voice_pitch: 0.7,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 100, verb: 'WORLD_MODIFIER', params: { modifier: 'BLACK_HOLE', x: 480, y: 270, strength: 0.022, duration_ms: 3500 } },
      { time_ms: 400, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 22, duration_ms: 1200 } },
      { time_ms: 600, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 120 } },
      { time_ms: 800, verb: 'DESTROY_JOINT', params: { joint: 'leftArm', blood_burst: 100 } },
      { time_ms: 820, verb: 'DESTROY_JOINT', params: { joint: 'rightArm', blood_burst: 100 } },
      { time_ms: 1100, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 200 } },
      { time_ms: 1200, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 270, count: 350, spread: 45 } }
    ]
  };
}

function generateBalloonStratosphereDeath(clean) {
  return {
    wishText: clean,
    survived: false,
    loophole_score: 18,
    genie_taunt: 'Flight granted! High-buoyancy helium cluster tied to your wrists for a supersonic vertical trip to the stratosphere!',
    loophole_explanation: 'Clause 12.1: Failure to specify terminal altitude or descent mechanics. Local gravity inverted to -8.0G.',
    voice_pitch: 1.25,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 100, verb: 'WORLD_MODIFIER', params: { modifier: 'GRAVITY', gravity_x: 0, gravity_y: -8.0, duration_ms: 3000 } },
      { time_ms: 150, verb: 'APPLY_FORCE', params: { target: 'all', fx: 0, fy: -1.0 } },
      { time_ms: 350, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 440, count: 200, spread: 30 } },
      { time_ms: 500, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 22, duration_ms: 800 } },
      { time_ms: 550, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 150 } },
      { time_ms: 600, verb: 'DESTROY_JOINT', params: { joint: 'leftLeg', blood_burst: 120 } },
      { time_ms: 620, verb: 'DESTROY_JOINT', params: { joint: 'rightLeg', blood_burst: 120 } }
    ]
  };
}

function generateDeerStampedeDeath(clean) {
  return {
    wishText: clean,
    survived: false,
    loophole_score: 16,
    genie_taunt: 'A million bucks? Conveniently, a migrating herd of horned ungulates required right-of-way through your ribcage!',
    loophole_explanation: 'Clause 7.9: Colloquial monetary term conflated with male cervid biology. Wild antlered herd stampeding horizontally.',
    voice_pitch: 1.15,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 150, verb: 'SPAWN_OBJECT', params: { prop_type: 'HORNED_DEER', x: -80, y: 450, vx: 22, vy: 0, mass: 180, scale: 3.8, count: 3, spread_x: 90 } },
      { time_ms: 550, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 25, duration_ms: 800 } },
      { time_ms: 600, verb: 'APPLY_FORCE', params: { target: 'torso', fx: 0.22, fy: -0.15 } },
      { time_ms: 620, verb: 'DESTROY_JOINT', params: { joint: 'leftLeg', blood_burst: 140 } },
      { time_ms: 640, verb: 'DESTROY_JOINT', params: { joint: 'rightLeg', blood_burst: 140 } },
      { time_ms: 700, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 460, count: 350, spread: 40 } }
    ]
  };
}

function generateChurchBellDeath(clean) {
  return {
    wishText: clean,
    survived: false,
    loophole_score: 20,
    genie_taunt: 'Let the bells toll for your final hour! Commencing aerial descent of a 50-ton bronze church bell to ring your demise!',
    loophole_explanation: 'Clause 15.1: Trapped under a resonant acoustic bell; sonic concussion and kinetic compression.',
    voice_pitch: 0.95,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'GIANT_BELL', x: 480, y: 70, vx: 0, vy: 22, mass: 600, scale: 5 } },
      { time_ms: 600, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 28, duration_ms: 1000 } },
      { time_ms: 620, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 150 } },
      { time_ms: 650, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 250 } },
      { time_ms: 700, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 440, count: 300, spread: 35 } }
    ]
  };
}

function generateGoldVaultDeath(clean) {
  return {
    wishText: clean,
    survived: false,
    loophole_score: 12,
    genie_taunt: 'Unlimited physical riches? Commencing terminal delivery of a 20-ton solid steel bank vault overflowing with bullion!',
    loophole_explanation: 'Clause 4.1: Delivery vector & velocity of legal tender unspecified. Crushed beneath vault overhead.',
    voice_pitch: 1.0,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 150, verb: 'SPAWN_OBJECT', params: { prop_type: 'GOLD_BAR', x: 480, y: 120, vx: 0, vy: 14, mass: 50, scale: 3, count: 3, spread_x: 60 } },
      { time_ms: 350, verb: 'EMIT_PARTICLES', params: { type: 'GOLD', x: 480, y: 150, count: 250, spread: 35 } },
      { time_ms: 450, verb: 'SPAWN_OBJECT', params: { prop_type: 'SAFE', x: 480, y: 80, vx: 0, vy: 24, mass: 950, scale: 4.8 } },
      { time_ms: 700, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 30, duration_ms: 900 } },
      { time_ms: 720, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 300 } },
      { time_ms: 750, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 400, spread: 45 } }
    ]
  };
}

function generateStatueHugDeath(clean) {
  return {
    wishText: clean,
    survived: false,
    loophole_score: 22,
    genie_taunt: 'A devoted companion who will never let you go? Here is a 40-ton colossal iron effigy for an eternal, bone-crushing embrace!',
    loophole_explanation: 'Clause 8.2: Biological parameters omitted. Delivered an immovable 40-ton iron statue with hydraulic grip.',
    voice_pitch: 1.1,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'STATUE_FRIEND', x: 480, y: 80, vx: 0, vy: 22, mass: 650, scale: 5 } },
      { time_ms: 650, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 28, duration_ms: 1000 } },
      { time_ms: 670, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 300 } },
      { time_ms: 700, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 450, spread: 50 } }
    ]
  };
}

function generateFloorPitDeath(clean) {
  return {
    wishText: clean,
    survived: false,
    loophole_score: 10,
    genie_taunt: 'Seeking deep understanding and grounded wisdom? Removing the ground entirely for a descent into the magma abyss!',
    loophole_explanation: 'Clause 16.4: Structural foundation dissolved; subterranean thermal pit exposure.',
    voice_pitch: 0.85,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 24, duration_ms: 1200 } },
      { time_ms: 200, verb: 'WORLD_MODIFIER', params: { modifier: 'DELETE_FLOOR' } },
      { time_ms: 400, verb: 'EMIT_PARTICLES', params: { type: 'FIRE', x: 480, y: 520, count: 350, spread: 50 } },
      { time_ms: 700, verb: 'APPLY_FORCE', params: { target: 'all', fx: 0, fy: 0.6 } },
      { time_ms: 900, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 250 } }
    ]
  };
}

function generateCeilingSpikesDeath(clean) {
  return {
    wishText: clean,
    survived: false,
    loophole_score: 15,
    genie_taunt: 'Pressing matters demand pressing solutions! Bringing the ceiling spikes down for an intimate acupuncture session!',
    loophole_explanation: 'Clause 17.1: Overhead hydraulic ceiling spike array descent with zero clearance tolerance.',
    voice_pitch: 1.0,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 100, verb: 'WORLD_MODIFIER', params: { modifier: 'CEILING_SPIKES' } },
      { time_ms: 200, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 20, duration_ms: 800 } },
      { time_ms: 350, verb: 'APPLY_FORCE', params: { target: 'all', fx: 0, fy: -0.6 } },
      { time_ms: 600, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 200 } },
      { time_ms: 650, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 300 } },
      { time_ms: 700, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 100, count: 400, spread: 50 } }
    ]
  };
}

function generateQuantumSupercomputerDeath(clean) {
  return {
    wishText: clean,
    survived: false,
    loophole_score: 25,
    genie_taunt: 'Superhuman intelligence? Delivering a 10-petaflop quantum computing core with unshielded 50,000-volt arc discharge!',
    loophole_explanation: 'Clause 18.3: Direct neural interface attempted via uninsulated high-voltage quantum processor drop.',
    voice_pitch: 1.2,
    custom_prop: null,
    choreography_timeline: [
      { time_ms: 150, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 200, count: 300, spread: 40 } },
      { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'SUPERCOMPUTER_CORE', x: 480, y: 80, vx: 0, vy: 24, mass: 500, scale: 4.5 } },
      { time_ms: 600, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 26, duration_ms: 900 } },
      { time_ms: 620, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 280 } },
      { time_ms: 680, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 440, count: 400, spread: 50 } }
    ]
  };
}

// Master Heuristic & Semantic Intent Analyzer with Zero Anvil Default
export function analyzeHeuristicWish(rawText) {
  const clean = rawText.trim();
  const lower = clean.toLowerCase();

  // 1. Check exact matches in mock database
  const exact = MOCK_WISHES.find(
    (w) => w.wishText.toLowerCase() === lower || lower.includes(w.id)
  );
  if (exact) return { ...exact };

  // 2. Airtight Defensive Clauses (Player explicitly protects themselves)
  const isAirtightAttempt =
    lower.includes('gently') ||
    lower.includes('without harming') ||
    lower.includes('peacefully') ||
    lower.includes('safely') ||
    lower.includes('no harm') ||
    lower.includes('intact') ||
    lower.includes('survive');

  if (isAirtightAttempt && (lower.includes('tea') || lower.includes('coffee') || lower.includes('dollar') || lower.includes('water') || lower.includes('coin'))) {
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

  // 3. Extensive Category Intent Matching

  // Category: Vehicles, Speed & Travel
  if (lower.match(/\b(car|sports car|ferrari|lambo|vehicle|drive|speed|fast|race|motorcycle|truck|plane|train)\b/)) {
    return generateCarDrivebyDeath(clean);
  }

  // Category: Food, Eating & Drinks
  if (lower.match(/\b(sandwich|food|burger|sub|eat|lunch|dinner|snack|taco|pizza|hungry|cake|bread|cheese)\b/)) {
    return generateSandwichSquashDeath(clean);
  }

  // Category: Animals, Bucks & Nature
  if (lower.match(/\b(deer|buck|bucks|antler|stag|animal|dog|cat|horse|zoo|pet)\b/)) {
    return generateDeerStampedeDeath(clean);
  }

  // Category: Flight, Sky & Balloons
  if (lower.match(/\b(fly|flight|balloon|float|air|sky|levitate|wings|jump|clouds)\b/)) {
    return generateBalloonStratosphereDeath(clean);
  }

  // Category: Heat, Sun, Fire & Sexy
  if (lower.match(/\b(hot|heat|warm|summer|sun|flame|fire|burn|hell|meteor|lava|spicy|sexy)\b/)) {
    return generateMeteorStrikeDeath(clean);
  }

  // Category: Silence, Cosmic, Immortality & Peace
  if (lower.match(/\b(quiet|silence|peace|sleep|nothing|void|space|universe|black hole|immortal|live forever)\b/)) {
    return generateBlackHoleSingularityDeath(clean);
  }

  // Category: Music, Fame & Concerts
  if (lower.match(/\b(music|piano|song|guitar|sing|fame|famous|celebrity|rockstar|sound|band|concert)\b/)) {
    return generatePianoCatastropheDeath(clean);
  }

  // Category: Love, Dating & Relationships
  if (lower.match(/\b(friend|girlfriend|boyfriend|love|hug|marry|companion|wife|husband|kiss|date)\b/)) {
    return generateStatueHugDeath(clean);
  }

  // Category: Church, Religion, Peace & Bells
  if (lower.match(/\b(bell|church|god|holy|pray|ring|chime|peaceful)\b/)) {
    return generateChurchBellDeath(clean);
  }

  // Category: Money, Gold & Wealth
  if (lower.match(/\b(rich|money|gold|cash|dollar|wealth|crypto|bitcoin|vault|safe|fortune|millionaire|billionaire)\b/)) {
    return generateGoldVaultDeath(clean);
  }

  // Category: Intelligence, Knowledge, Exams & AI
  if (lower.match(/\b(exam|test|study|grade|school|pass|smart|iq|genius|brain|ai|computer|robot|tech)\b/)) {
    return generateQuantumSupercomputerDeath(clean);
  }

  // Category: Falling, Abyss & Earth
  if (lower.match(/\b(fall|drop|down|deep|earth|ground|pit|sink|hole)\b/)) {
    return generateFloorPitDeath(clean);
  }

  // Category: Trap, Walls & Pressure
  if (lower.match(/\b(trap|press|small|tiny|crush|spikes|ceiling|shrink)\b/)) {
    return generateCeilingSpikesDeath(clean);
  }

  // 4. Dynamic Semantic Hash Generator (NO ANVIL DEFAULT!)
  // For any unseen query, pick procedurally from our rich death palette based on string hash
  const dynamicPalette = [
    generatePianoCatastropheDeath,
    generateCarDrivebyDeath,
    generateMeteorStrikeDeath,
    generateSandwichSquashDeath,
    generateGoldVaultDeath,
    generateChurchBellDeath,
    generateBlackHoleSingularityDeath,
    generateStatueHugDeath,
    generateDeerStampedeDeath,
    generateQuantumSupercomputerDeath,
    generateFloorPitDeath,
    generateCeilingSpikesDeath,
    generateBalloonStratosphereDeath
  ];

  let strHash = 0;
  for (let i = 0; i < clean.length; i++) {
    strHash = (strHash * 31 + clean.charCodeAt(i)) >>> 0;
  }
  const chosenGenerator = dynamicPalette[strHash % dynamicPalette.length];
  return chosenGenerator(clean);
}

export const MOCK_WISH_DATABASE = MOCK_WISHES;
