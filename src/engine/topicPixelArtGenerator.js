// Topic-Aware Procedural Pixel Art & Custom Choreography Synthesizer
// Generates Terraria / Stardew Valley level 16x16 pixel-art sprites and custom slapstick physics for ANY wish topic!

export function synthesizeTopicScenario(cleanWish, forcedSurvived = null) {
  const wishLower = cleanWish.toLowerCase();

  // 1. Detect Category & Dominant Entity
  const category = detectTopicCategory(wishLower);
  const spriteDef = generateProceduralPixelSprite(category, wishLower);
  let choreography = generateTopicChoreography(category, wishLower, spriteDef);

  const initialSurvived = choreography.survived ?? false;
  if (typeof forcedSurvived === 'boolean' && forcedSurvived !== initialSurvived) {
    choreography = alignChoreographyWithSurvival(choreography, category, wishLower, spriteDef, forcedSurvived);
  }

  const survived = choreography.survived ?? false;
  const loopholeScore = choreography.loophole_score ?? (survived ? 75 : 18);

  return {
    wishText: cleanWish,
    survived,
    loophole_score: loopholeScore,
    genie_taunt: choreography.genie_taunt,
    loophole_explanation: choreography.loophole_explanation,
    voice_pitch: choreography.voice_pitch || 1.0,
    custom_prop: spriteDef,
    choreography_timeline: choreography.timeline
  };
}

function alignChoreographyWithSurvival(choreography, category, wishLower, spriteDef, survived) {
  if (survived) {
    const safeSpriteScale = Math.min(spriteDef?.scale || 3.2, 3.5);
    return {
      ...choreography,
      survived: true,
      loophole_score: Math.max(70, choreography.loophole_score || 75),
      timeline: [
        { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 4, duration_ms: 650 } },
        { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 560, y: 310, vx: -1, vy: 2, mass: Math.min(spriteDef?.mass || 5, 12), scale: safeSpriteScale } },
        { time_ms: 420, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 560, y: 420, count: 55, spread: 26 } }
      ]
    };
  }

  // Ensure lethal timeline with safe arena coordinates
  return {
    ...choreography,
    survived: false,
    loophole_score: Math.min(35, choreography.loophole_score || 20),
    timeline: [
      { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 7, duration_ms: 700 } },
      { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 90, vx: 0, vy: 24, mass: Math.max(spriteDef?.mass || 320, 260), scale: spriteDef?.scale || 4.5 } },
      { time_ms: 520, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 28, duration_ms: 850 } },
      { time_ms: 540, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 200 } },
      { time_ms: 570, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 300 } },
      { time_ms: 600, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 320, spread: 45 } }
    ]
  };
}

function detectTopicCategory(text) {
  // 0. Carefully Specified / Airtight Wishes (SURVIVED: TRUE with high legal score)
  if (
    text.match(/\b(tea|herbal tea|chamomile|green tea)\b/) ||
    text.match(/\b(placed gently|gently on|peacefully|safely|into my open palm|without harming|without injuring|room temperature|legal tender)\b/)
  ) {
    return 'AIRTIGHT';
  }

  // 1. Specific Iconic Lethal Figures / Events (Always Fatal Karma)
  if (text.match(/\b(pele|pelé|maradona|messi|ronaldo|soccer|football|world cup|fifa|striker|penalty)\b/)) {
    return 'PELE';
  }
  if (text.match(/\b(napoleon|caesar|julius caesar|cleopatra|lincoln|alexander the great|genghis khan|beethoven|mozart|elvis)\b/)) {
    return 'HISTORICAL';
  }
  if (text.match(/\b(dragon|wyvern|drake|fire drake|red dragon|black dragon|shenron|draconic)\b/)) {
    return 'DRAGON';
  }
  if (text.match(/\b(godzilla|gojira|kaiju|king kong|gamera|titan|monster zero)\b/)) {
    return 'GODZILLA';
  }
  if (text.match(/\b(ufo|flying saucer|alien abduction|mothership|alien ship)\b/)) {
    return 'UFO';
  }
  if (text.match(/\b(pikachu|pokemon|pokeball|charizard|thunderbolt)\b/)) {
    return 'POKEMON';
  }
  if (text.match(/\b(train|locomotive|express train|bullet train|subway|steam engine)\b/)) {
    return 'TRAIN';
  }
  if (text.match(/\b(nuke|nuclear|atomic bomb|warhead|icbm|thermonuclear)\b/)) {
    return 'NUKE';
  }
  if (text.match(/\b(exam|exams|test|quiz|finals|midterm|homework|study|grade|tetris)\b/)) {
    return 'EXAMS';
  }

  // 2. Harmless Useless / Children's Toy Grants (SURVIVED: TRUE)
  // Wordplay Trap: "million bucks" -> literal stampede of male antlered deer (bucks)!
  if (text.match(/\b(million bucks|hundred bucks|thousand bucks|deer|stag|stags|stampede)\b/) && !text.match(/\b(dollar|dollars)\b/)) {
    return 'MILLION_BUCKS';
  }

  // E.g. "10 dollars", "dollar", "bucks", "cents", "cash"
  if (text.match(/\b(10 dollars|ten dollars|dollar|dollars|bucks|cent|cents|penny|pennies|allowance|pocket money|10 bucks|ten bucks|twenty bucks|5 dollars|five dollars|some cash|some money)\b/) && !text.match(/\b(million|billion|trillion|vault|crush|ton)\b/)) {
    return 'TOY_DOLLARS';
  }
  if (text.match(/\b(toy car|hot wheels|matchbox|model car|tiny car|little car)\b/) || (text.match(/\b(car|sports car|ferrari|lambo|lamborghini|porsche)\b/) && !text.match(/\b(crush|crash|run over|speeding|hit me|run me over)\b/))) {
    return 'TOY_CAR';
  }
  if (text.match(/\b(sandwich|make me a sandwich|snack|lunch|pb&j|peanut butter|toast|apple|fruit)\b/) && !text.match(/\b(crush|flatten|giant|ton|huge|massive)\b/)) {
    return 'SANDWICH_LUNCH';
  }
  if (text.match(/\b(girlfriend|boyfriend|companion|hug|plush|teddy bear|teddy|mannequin)\b/)) {
    return 'TOY_COMPANION';
  }
  if (text.match(/\b(fly|float|levitate|balloon|balloons)\b/) && !text.match(/\b(space|orbit|vacuum|sun|stratosphere|crush)\b/)) {
    return 'BALLOONS_FLY';
  }
  if (text.match(/\b(dog|puppy|hotdog|hot dog|wiener)\b/) && !text.match(/\b(wolf|hound|cerberus|attack|bite)\b/)) {
    return 'DOG_HOTDOG';
  }
  if (text.match(/\b(cool|be cool|chilly|cold|peace and quiet|quiet|breeze|world peace)\b/) && !text.match(/\b(freeze|ice age|absolute zero|subzero)\b/)) {
    return 'COOL_BREEZE';
  }

  // 3. Heavy / Catastrophic Thematic Categories (SURVIVED: FALSE)
  if (text.match(/\b(pizza|burger|taco|food|eat|hungry|cake|donut|steak|sushi|cheese|coffee|beer|wine|ice cream|chocolate|bread|meal|pie|soup)\b/)) {
    return 'FOOD';
  }
  if (text.match(/\b(car|truck|bike|motorcycle|plane|airplane|jet|rocket|spaceship|boat|ship|submarine|skateboard|vehicle|drive)\b/)) {
    return 'VEHICLE';
  }
  if (text.match(/\b(cat|dinosaur|dino|t-rex|trex|monster|alien|zombie|skeleton|bear|shark|wolf|lion|tiger|bird|spider|snake|horse|pet|creature|animal|beast)\b/)) {
    return 'CREATURE';
  }
  if (text.match(/\b(sword|gun|pistol|rifle|cannon|bomb|axe|knife|dagger|laser|blade|bow|arrow|spear|weapon|missile|katana|bullet|grenade)\b/)) {
    return 'WEAPON';
  }
  if (text.match(/\b(phone|iphone|computer|pc|laptop|robot|ai|tech|console|playstation|xbox|tv|screen|drone|chip|mecha|cyber|gadget|camera)\b/)) {
    return 'TECH';
  }
  if (text.match(/\b(gold|money|cash|dollar|rich|wealth|diamond|ruby|gem|emerald|crown|ring|jewelry|bitcoin|crypto|treasure|safe|vault|billionaire|millionaire|million|billion)\b/)) {
    return 'TREASURE';
  }
  if (text.match(/\b(star|moon|sun|space|galaxy|planet|meteor|asteroid|black hole|gravity|void|comet|cosmic|universe)\b/)) {
    return 'COSMIC';
  }
  if (text.match(/\b(magic|potion|wand|spell|witch|wizard|demon|angel|ghost|curse|orb|crystal|god|powers|superpower|immortal|immortality)\b/)) {
    return 'MAGIC';
  }
  if (text.match(/\b(fire|water|ice|freeze|hot|burn|lightning|thunder|storm|rain|ocean|lava|acid|earth|rock|boulder)\b/)) {
    return 'ELEMENT';
  }
  if (text.match(/\b(friend|love|wife|husband|marry|date|kiss)\b/)) {
    return 'ROMANCE';
  }
  return 'OBJECT';
}

/**
 * Procedurally generates a full 16x16 pixel matrix + vibrant palette
 */
export function generateProceduralPixelSprite(category, wishLower) {
  switch (category) {
    case 'AIRTIGHT': {
      if (wishLower.match(/\b(dollar|bill|cash|money|legal tender|banknote)\b/)) {
        return {
          name: 'PROCEDURAL_LEGAL_TENDER_BILL',
          width: 16,
          height: 16,
          scale: 3.0,
          mass: 2,
          restitution: 0.1,
          palette: {
            '.': null,
            'K': '#14532d',
            'G': '#22c55e',
            'D': '#166534',
            'L': '#86efac',
            'W': '#ffffff'
          },
          matrix: [
            '................',
            '..KKKKKKKKKKKK..',
            '.KLLLLLLLLLLLLK.',
            'KLWGGGGGGGGGGWLK',
            'KLGGDDGGGGGGDDLK',
            'KLGGDGLLLLLLDGLK',
            'KLGGDGLWWWWLDGLK',
            'KLGGDGLLLLLLDGLK',
            'KLGGDDGGGGGGDDLK',
            'KLWGGGGGGGGGGWLK',
            '.KLLLLLLLLLLLLK.',
            '..KKKKKKKKKKKK..',
            '................',
            '................',
            '................',
            '................'
          ]
        };
      }
      // Gentle Porcelain Teacup with warm herbal steam
      return {
        name: 'PROCEDURAL_HERBAL_TEA_CUP',
        width: 16,
        height: 16,
        scale: 3.2,
        mass: 3,
        restitution: 0.1,
        palette: {
          '.': null,
          'S': '#cbd5e1',
          'K': '#334155',
          'C': '#f8fafc',
          'T': '#84cc16',
          'G': '#65a30d',
          'D': '#94a3b8'
        },
        matrix: [
          '.....S....S.....',
          '....S....S......',
          '.....S....S.....',
          '................',
          '...KKKKKKKKKK...',
          '..KTTTTTTTTTTK..',
          '..KCCCCCCCCCCKK.',
          '..KCCCCCCCCCCKCK',
          '..KCCCCGGCCCCKCK',
          '..KCCCCCCCCCCKK.',
          '...KCCCCCCCCK...',
          '....KKKKKKKK....',
          '..KDDDDDDDDDDK..',
          '...KKKKKKKKKK...',
          '................',
          '................'
        ]
      };
    }

    case 'EXAMS': {
      // Failed A+/F- Exam Sheet & Stacked Tetris Overload
      return {
        name: 'PROCEDURAL_EXAM_PAPER',
        width: 16,
        height: 16,
        scale: 4.5,
        mass: 320,
        restitution: 0.1,
        palette: {
          '.': null,
          'K': '#1e293b',
          'W': '#f8fafc',
          'R': '#dc2626',
          'D': '#94a3b8',
          'B': '#475569'
        },
        matrix: [
          '..KKKKKKKKKKK...',
          '.KWWWWWWWWWWWK..',
          '.KWRRRWWWWWWWK..',
          '.KWRWWWWWWWWWK..',
          '.KWRRRWWDDDDDK..',
          '.KWRWWWWWWWWWK..',
          '.KWDDDDDDDDDDK..',
          '.KWWWWWWWWWWWK..',
          '.KWDDDDDDDDDDK..',
          '.KWWWWWWWWWWWK..',
          '.KWDDDDDDDDDDK..',
          '.KWWWWWWWWWWWK..',
          '.KBBBBBBBBBBBK..',
          '..KKKKKKKKKKK...',
          '................',
          '................'
        ]
      };
    }

    case 'TOY_DOLLARS': {
      // 16x16 Novelty Children's Play Dollar (Toy Monopoly / Play-Money Bill with "$10" badge)
      return {
        name: 'PROCEDURAL_CHILDREN_DOLLAR',
        width: 16,
        height: 16,
        scale: 3.2,
        mass: 4,
        restitution: 0.15,
        palette: {
          '.': null,
          'K': '#14532d', // Forest green border
          'G': '#4ade80', // Mint green bill paper
          'D': '#166534', // Dark green print
          'Y': '#facc15', // Golden play-money star/smiley
          'W': '#ffffff'  // Clean white corner numbers
        },
        matrix: [
          '................',
          '..KKKKKKKKKKKK..',
          '.KGGGGGGGGGGGGK.',
          'KGWGGGGGGGGGGWGK',
          'KGGDGGDYYDGGDDGK',
          'KGGDGDYYYYDGDDGK',
          'KGGDGDYYYYDGDDGK',
          'KGGDGGDYYDGGDDGK',
          'KGGDGGDDDDGGDDGK',
          'KGGDGGDYYDGGDDGK',
          'KGWGGGGGGGGGGWGK',
          '.KGGGGGGGGGGGGK.',
          '..KKKKKKKKKKKK..',
          '................',
          '................',
          '................'
        ]
      };
    }

    case 'TOY_CAR': {
      // 16x16 Die-Cast 1:64 Miniature Matchbox Toy Car
      return {
        name: 'PROCEDURAL_TOY_CAR',
        width: 16,
        height: 16,
        scale: 2.8,
        mass: 5,
        restitution: 0.4,
        palette: {
          '.': null,
          'K': '#0f172a', // Chassis outline
          'R': '#ef4444', // Bright red toy lacquer
          'C': '#38bdf8', // Tiny plastic windshield
          'W': '#ffffff', // Headlight
          'T': '#1e293b', // Toy rubber tire
          'H': '#94a3b8'  // Hubcap
        },
        matrix: [
          '................',
          '................',
          '......KKKKKK....',
          '.....KCCCCCCK...',
          '....KCCCCCCCCK..',
          '..KKKRRRRRRRRKK.',
          '.KRRRRRRRRRRRRRK',
          'KRRRRRRRRRRRRRRK',
          'KRRRRRRRRRRRRRRK',
          'KWRRRRRRRRRRRRRK',
          '.KKTTKKKKKKTTKK.',
          '..KTHK....KTHK..',
          '...TT......TT...',
          '................',
          '................',
          '................'
        ]
      };
    }

    case 'SANDWICH_LUNCH': {
      // 16x16 Triangle Sandwich with crust, lettuce, cheese, and tomato
      return {
        name: 'PROCEDURAL_MINI_SANDWICH',
        width: 16,
        height: 16,
        scale: 3.0,
        mass: 3,
        restitution: 0.1,
        palette: {
          '.': null,
          'K': '#78350f', // Toasted crust outline
          'B': '#d97706', // Golden bread crust
          'W': '#fef3c7', // Soft white bread crumb
          'G': '#22c55e', // Crisp lettuce leaf
          'R': '#ef4444', // Juicy tomato slice
          'Y': '#facc15'  // Cheddar cheese corner
        },
        matrix: [
          '................',
          '................',
          '................',
          '.......KKKKKK...',
          '.....KKBBBBBBK..',
          '....KWWWWWWWWK..',
          '...KGGGGGGGGGK..',
          '..KRRRRRRRRRRK..',
          '.KYYYYYYYYYYYK..',
          'KWWWWWWWWWWWWK..',
          '.KBBBBBBBBBBK...',
          '..KKKKKKKKKK....',
          '................',
          '................',
          '................',
          '................'
        ]
      };
    }

    case 'TOY_COMPANION': {
      // 16x16 Stuffed Plush Teddy Bear
      return {
        name: 'PROCEDURAL_PLUSH_TEDDY',
        width: 16,
        height: 16,
        scale: 3.2,
        mass: 6,
        restitution: 0.25,
        palette: {
          '.': null,
          'K': '#451a03', // Teddy fur border
          'B': '#92400e', // Soft brown fur
          'b': '#b45309', // Light fur tummy
          'E': '#0f172a', // Button eye
          'N': '#1c1917', // Button nose
          'R': '#e11d48'  // Heart bow
        },
        matrix: [
          '..KK......KK....',
          '.KBBK....KBBK...',
          '.KBBKKKKKKBBK...',
          '..KBBBBBBBBK....',
          '..KBEKBBKEBK....',
          '..KBBBBNBBBK....',
          '...KBBBBBBK.....',
          '....KRRRRK......',
          '..KKBBBBBBKK....',
          '.KBBBbbbBBBBK...',
          '.KBBBbbbBBBBK...',
          '..KKBBBBBBKK....',
          '...KBB..BBK.....',
          '...KBB..BBK.....',
          '...KK....KK.....',
          '................'
        ]
      };
    }

    case 'BALLOONS_FLY': {
      // 16x16 Party Helium Balloons
      return {
        name: 'PROCEDURAL_PARTY_BALLOONS',
        width: 16,
        height: 16,
        scale: 3.2,
        mass: 1,
        restitution: 0.3,
        palette: {
          '.': null,
          'R': '#ef4444', // Red balloon
          'B': '#3b82f6', // Blue balloon
          'Y': '#eab308', // Yellow balloon
          'W': '#ffffff', // Highlight shine
          'S': '#94a3b8'  // String
        },
        matrix: [
          '....RRRR...BBBB.',
          '...RWWWRR.BWWWBB',
          '..RRRRRRR.BBBBBB',
          '..RRRRRRR.BBBBBB',
          '..RRRRRRR..BBBB.',
          '...RR.YYY...BB..',
          '....YYWWYY..S...',
          '...YYYYYYYY.S...',
          '...YYYYYYYY.S...',
          '....YYYYYY..S...',
          '.....YY.S..S....',
          '......S.S.S.....',
          '.......S.S......',
          '........S.......',
          '........S.......',
          '................'
        ]
      };
    }

    case 'DOG_HOTDOG': {
      // 16x16 Hot Dog in Bun with Mustard
      return {
        name: 'PROCEDURAL_HOTDOG',
        width: 16,
        height: 16,
        scale: 3.0,
        mass: 3,
        restitution: 0.2,
        palette: {
          '.': null,
          'K': '#451a03', // Crust outline
          'B': '#d97706', // Warm golden bun
          'b': '#fde68a', // Soft inner bun
          'R': '#dc2626', // Red grilled sausage
          'Y': '#facc15'  // Zesty yellow mustard
        },
        matrix: [
          '................',
          '................',
          '......KKKKKK....',
          '....KKBBBBBBKK..',
          '...KBBBbbbbBBBKK',
          '..KRRRRRRRRRRRRK',
          '.KRRRYRYYYRYRRRK',
          'KRRRRYRRYYRRYRRK',
          'KRRRRYRRYYRRYRRK',
          '.KRRRYRYYYRYRRRK',
          '..KRRRRRRRRRRRRK',
          '...KBBBbbbbBBBKK',
          '....KKBBBBBBKK..',
          '......KKKKKK....',
          '................',
          '................'
        ]
      };
    }

    case 'COOL_BREEZE': {
      // 16x16 Delicate Frost Crystal Snowflake
      return {
        name: 'PROCEDURAL_SNOWFLAKE',
        width: 16,
        height: 16,
        scale: 3.0,
        mass: 1,
        restitution: 0.1,
        palette: {
          '.': null,
          'C': '#38bdf8', // Cyan frost
          'c': '#7dd3fc', // Light frost
          'W': '#ffffff'  // Crystal core
        },
        matrix: [
          '.......WW.......',
          '..C....WW....C..',
          '...C...WW...C...',
          '....Cc.WW.cC....',
          '.....CcWWcC.....',
          '..CCCCcWWcCCCC..',
          '..WWWWWWWWWWWW..',
          'WWWWWWWWWWWWWWWW',
          'WWWWWWWWWWWWWWWW',
          '..WWWWWWWWWWWW..',
          '..CCCCcWWcCCCC..',
          '.....CcWWcC.....',
          '....Cc.WW.cC....',
          '...C...WW...C...',
          '..C....WW....C..',
          '.......WW.......'
        ]
      };
    }

    case 'PELE': {
      // Golden Classic World Cup Soccer Ball (16x16 Hex-stitched leather Telstar with golden trophy accents)
      return {
        name: 'PROCEDURAL_SOCCER_BALL',
        width: 16,
        height: 16,
        scale: 4.5,
        mass: 320,
        restitution: 0.85,
        palette: {
          '.': null,
          'K': '#0f172a', // Deep slate leather stitch outline
          'B': '#1e293b', // Black pentagon patch
          'W': '#f8fafc', // Clean white leather panel
          'S': '#cbd5e1', // Shaded white panel
          'G': '#ffd166', // Golden World Cup trophy glow
          'g': '#d4a373'  // Shadowed gold
        },
        matrix: [
          '.....KKKKKK.....',
          '...KKWWWWWWKK...',
          '..KWWKBBBBKWWK..',
          '.KWWWBBBBBBWWWK.',
          '.KWWKBBBBBBKWWK.',
          'KWWWWKBBBBKWWWWK',
          'KBBKWWWWWWWWKBBK',
          'KBBBKWWGGWWKBBBK',
          'KBBBKWWGGWWKBBBK',
          'KBBKWWWWWWWWKBBK',
          'KWWWWKBBBBKWWWWK',
          '.KWWKBBBBBBKWWK.',
          '.KSSWBBBBBBWSSK.',
          '..KSSKBBBBKSSK..',
          '...KKSSSSSSKK...',
          '.....KKKKKK.....'
        ]
      };
    }

    case 'HISTORICAL': {
      // Ancient Imperial Gilded Crown / Royal Relic
      return {
        name: 'PROCEDURAL_ROYAL_RELIC',
        width: 16,
        height: 16,
        scale: 4.5,
        mass: 380,
        restitution: 0.1,
        palette: {
          '.': null,
          'K': '#1c1917', // Iron rim
          'G': '#f59e0b', // Imperial Gold
          'Y': '#fde047', // Brilliant gold highlight
          'R': '#e11d48', // Royal Ruby gemstone
          'E': '#10b981', // Emerald gemstone
          'W': '#ffffff'  // Gem sparkle
        },
        matrix: [
          '................',
          '...W........W...',
          '..WRW..WW..WRW..',
          '..YRY..WE..YRY..',
          '.KYYYKKYYKKYYYK.',
          '.KGYGGYYYYGGYGK.',
          '.KGYGGRYYRGGYGK.',
          '.KGGGGYYYYGGGGK.',
          'KGGGGGGGGGGGGGGK',
          'KGGGEGGGREGGGEGK',
          'KGGGEGGGREGGGEGK',
          'KGGGGGGGGGGGGGGK',
          '.KGGGGGGGGGGGGK.',
          '..KKKKKKKKKKKK..',
          '................',
          '................'
        ]
      };
    }

    case 'DRAGON': {
      // Ancient Flying Fire Dragon (Horned skull, golden belly plates, flame crest, roaring fiery maw)
      return {
        name: 'PROCEDURAL_FIRE_DRAGON',
        width: 16,
        height: 16,
        scale: 6.0,
        mass: 750,
        restitution: 0.1,
        palette: {
          '.': null,
          'K': '#1a0505', // Obsidian dragon scale outline
          'R': '#9d0208', // Dark crimson scale
          'r': '#d90429', // Radiant red scale
          'Y': '#ffb703', // Fiery slitted dragon eye
          'W': '#f8f9fa', // Sharp ivory horns & fangs
          'G': '#ffba08', // Golden belly armor plates
          'F': '#ff4800'  // Incandescent molten flame core
        },
        matrix: [
          'WW............WW',
          '.WW...KKKK...WW.',
          '..WKKKRRRRKKKW..',
          '..KRrrrrrrrrRK..',
          '.KRrrYrrrrYrrRK.',
          'KRrrYYrrrrYYrrRK',
          'KRrrrrrrrrrrrrRK',
          'KRWWWWWWWWWWWWKK',
          'KRWFFFFFFFFFFWRK',
          'KRWFFFFFFFFFFWRK',
          'KRWWWWWWWWWWWWKK',
          '.KRRRGGGGGGGRRK.',
          '..KRRGGGGGGGRK..',
          '...KRRGGGGGRK...',
          '....KRRRRRRK....',
          '.....KKKKKK.....'
        ]
      };
    }

    case 'GODZILLA': {
      // Radioactive King of the Monsters (Dark charcoal skin, atomic cyan glowing dorsal fins, burning yellow eye)
      return {
        name: 'GODZILLA_KAIJU',
        width: 16,
        height: 16,
        scale: 6.0,
        mass: 950,
        restitution: 0.05,
        palette: {
          '.': null,
          'K': '#0b090a', // Deep charcoal outline
          'D': '#161a1d', // Heavy reptilian skin
          'S': '#2b2d42', // Charcoal dorsal scales
          'B': '#00f5d4', // Glowing radioactive atomic cyan spines
          'b': '#00bbf9', // Plasma glow
          'Y': '#ffb703', // Incandescent predatory eye
          'W': '#ffffff', // Razor sharp teeth
          'R': '#d90429'  // Molten atomic maw
        },
        matrix: [
          '........BB......',
          '.......bBBb.....',
          '......bBBBBb....',
          '....KKKBBBBKK...',
          '...KDDDDKKKSDK..',
          '..KDDDDDDDDDDDK.',
          '.KDDDDDDDDYDDDK.',
          'KDDDDDDDDDDDDK..',
          'KDDDDDWWWWWKK...',
          'KDDDDDWRRRRDK...',
          'KDDDDDWWWWWDK...',
          '.KDDDDDDDDSDK...',
          '..KDDDDKKKSDK...',
          '...KDDDSSSSDK...',
          '....KDDDDDDDK...',
          '.....KKKKKKK....'
        ]
      };
    }

    case 'UFO': {
      // Flying Saucer with glowing energy dome and tractor beam emitter
      return {
        name: 'PROCEDURAL_ALIEN_MOTHERSHIP',
        width: 16,
        height: 16,
        scale: 5.0,
        mass: 500,
        restitution: 0.2,
        palette: {
          '.': null,
          'K': '#03045e',
          'C': '#00b4d8',
          'G': '#70e000',
          'W': '#caf0f8',
          'Y': '#ffd166',
          'B': '#0077b6'
        },
        matrix: [
          '................',
          '......KKKK......',
          '.....KGGGGK.....',
          '....KGGGGGGK....',
          '...KWWGGGGWWK...',
          '..KKKKKKKKKKKK..',
          '.KCCCCCCCCCCCCK.',
          'KCCCCWCCCCWCCCCK',
          'KCCCCCCCCCCCCCCK',
          '.KBBBBBBBBBBBBK.',
          '..KKYKKYKKYKKK..',
          '....KKKKKKKK....',
          '.....KYYYYK.....',
          '.....KYYYYK.....',
          '................',
          '................'
        ]
      };
    }

    case 'POKEMON': {
      // Electric rodent with lightning tail and red electric cheeks
      return {
        name: 'PROCEDURAL_ELECTRIC_RODENT',
        width: 16,
        height: 16,
        scale: 4.5,
        mass: 180,
        restitution: 0.3,
        palette: {
          '.': null,
          'K': '#3d0c02',
          'Y': '#ffea00',
          'y': '#ffd000',
          'R': '#d90429',
          'W': '#ffffff',
          'B': '#7f4f24'
        },
        matrix: [
          'KK...........KK.',
          'KYYK.......KYYK.',
          'KYYYK.....KYYYK.',
          '.KYYYYKKKYYYYK..',
          '..KYYYYYYYYYK...',
          '.KYYWYYYYYWYYK..',
          '.KYYKYYYYYKYYK..',
          '.KYYRYYYYRYYYK..',
          '.KYYRRKYKRRRYK..',
          '..KYYYYYYYYYK.YY',
          '...KYYYYYYYK.KYY',
          '..KYYYYYYYYK.YYK',
          '..KYYKKYYKKK.YK.',
          '..KKK..KK...KK..',
          '................',
          '................'
        ]
      };
    }

    case 'TRAIN': {
      // Heavy iron steam locomotive charging forward
      return {
        name: 'PROCEDURAL_STEAM_LOCOMOTIVE',
        width: 16,
        height: 16,
        scale: 5.0,
        mass: 850,
        restitution: 0.1,
        palette: {
          '.': null,
          'K': '#141414',
          'I': '#2b2d42',
          'S': '#8d99ae',
          'F': '#f77f00',
          'R': '#d90429',
          'W': '#edf2f4'
        },
        matrix: [
          '................',
          '..KK............',
          '..KI............',
          '..KI...KKKKKK...',
          '..KI..KIIIIIIK..',
          '.KKIK.KIWWWWIK..',
          'KIIIIKKIIIIIIK..',
          'KIIIIIIIIIIIIK..',
          'KIIIIIIIIIIIIK..',
          'KIIIIIIIIIIIIK..',
          'KRRRRRRRRRRRRK..',
          'KKKSKKKSKKKSKK..',
          '.KSSSKKSSSKKSSK.',
          '..KSK..KSK..KSK.',
          '................',
          '................'
        ]
      };
    }

    case 'NUKE': {
      // Tactical thermonuclear warhead
      return {
        name: 'PROCEDURAL_THERMONUCLEAR_BOMB',
        width: 16,
        height: 16,
        scale: 5.0,
        mass: 650,
        restitution: 0.05,
        palette: {
          '.': null,
          'K': '#283618',
          'G': '#606c38',
          'Y': '#dda15e',
          'R': '#bc6c25',
          'W': '#fefae0',
          'D': '#d62828'
        },
        matrix: [
          '......KKKK......',
          '.....KGGGGK.....',
          '....KGGGGGGK....',
          '....KGGWWGGK....',
          '...KGGWDDWGGK...',
          '...KGGWDDWGGK...',
          '...KGGYYYYGGK...',
          '...KGGYYYYGGK...',
          '...KGGGGGGGGK...',
          '...KGGGGGGGGK...',
          '...KGGGGGGGGK...',
          '..KKGGGGGGGGKK..',
          '.KRRKKKKKKKKRRK.',
          'KRRK........KRRK',
          'KKK..........KKK',
          '................'
        ]
      };
    }

    case 'FOOD': {
      // Golden crust, red sauce/pepperoni, yellow melting cheese, green herbs
      return {
        name: 'PROCEDURAL_GOURMET_DISH',
        width: 16,
        height: 16,
        scale: 4.5,
        mass: 380,
        restitution: 0.08,
        palette: {
          '.': null,
          'K': '#402208', // Dark baked crust outline
          'B': '#d4a373', // Bread / crust
          'R': '#d90429', // Tomato / Pepperoni / Jam
          'Y': '#ffd166', // Melted Cheddar / Cheese
          'G': '#38b000', // Fresh basil / greens
          'W': '#fffdf0'  // Mozzarella highlight
        },
        matrix: [
          '................',
          '....KKKKKKKK....',
          '...KBBBBBBBBK...',
          '..KBRRRRYYYYBK..',
          '.KBRRRYYYYYYRBK.',
          '.KBYYYGGYYRRRYK.',
          'KBYYYGGGGYYYRYBK',
          'KBYYYGGGGYYYRYBK',
          'KBRRYYYYYYYRRWBK',
          'KBRRRRYYYYYRRWBK',
          '.KBYYYYYYYYYYBK.',
          '.KBRRRRYYYYRBK..',
          '..KBBBBBBBBBK...',
          '...KKKKKKKKK....',
          '................',
          '................'
        ]
      };
    }

    case 'VEHICLE': {
      // Sleek supercar / rocket pixel sprite
      return {
        name: 'PROCEDURAL_HYPER_VEHICLE',
        width: 16,
        height: 16,
        scale: 4.5,
        mass: 450,
        restitution: 0.15,
        palette: {
          '.': null,
          'K': '#1b1b1e', // Dark chassis outline
          'R': '#e63946', // Vibrant racing red
          'D': '#9b2226', // Deep shaded body
          'C': '#48cae4', // Cyan windshield glass
          'W': '#ffffff', // Specular headlight gleam
          'T': '#343a40', // Tire rubber
          'G': '#f4a261'  // Exhaust flame / amber turn signal
        },
        matrix: [
          '................',
          '................',
          '.......KKKKK....',
          '.....KKCCCCCK...',
          '...KKCCCCCCCCK..',
          '..KRRCCCCCCCWKK.',
          '.KRRRRRRRRRRRRK.',
          'KRRRRRRRRRRRRRRK',
          'KDDDDDDDDDDDDDDG',
          'KKKTKKKKKKKTKKKG',
          '.KTTTK...KTTTK..',
          '..KTK.....KTK...',
          '................',
          '................',
          '................',
          '................'
        ]
      };
    }

    case 'CREATURE': {
      // Beast / Dinosaur / Monster with sharp teeth & glowing eyes
      return {
        name: 'PROCEDURAL_BEAST_REPTILE',
        width: 16,
        height: 16,
        scale: 4.5,
        mass: 420,
        restitution: 0.12,
        palette: {
          '.': null,
          'K': '#132a13', // Deep forest outline
          'G': '#31572c', // Dark scales
          'g': '#4f772d', // Bright green scales
          'Y': '#ffb703', // Fiery predatory eye
          'W': '#fefae0', // Razor teeth
          'R': '#d90429'  // Blood maw
        },
        matrix: [
          '................',
          '....KKKKKKKK....',
          '...KggggggggK...',
          '..KggggggYggK...',
          '.KgggggggggKK...',
          'KggggggggggK....',
          'KgggWWWWWWWK....',
          'KggWRRRRRRRK....',
          'KggWRRRRRRRK....',
          'KgggWWWWWWWK....',
          '.KgggggggggK....',
          '..KggGGGGggK....',
          '...KGGKKGGK.....',
          '....KK..KK......',
          '................',
          '................'
        ]
      };
    }

    case 'WEAPON': {
      // Colossal Buster Blade / Heavy Hammer
      return {
        name: 'PROCEDURAL_BUSTER_BLADE',
        width: 16,
        height: 16,
        scale: 4.5,
        mass: 320,
        restitution: 0.2,
        palette: {
          '.': null,
          'K': '#212529', // Tempered steel outline
          'S': '#adb5bd', // Polished blade steel
          'L': '#dee2e6', // Blade edge shine
          'W': '#ffffff', // Gleaming edge highlight
          'G': '#ffd166', // Golden crossguard
          'B': '#6c584c'  // Leather grip
        },
        matrix: [
          '.............WW.',
          '............WLSK',
          '...........WLSK.',
          '..........WLSK..',
          '.........WLSK...',
          '........WLSK....',
          '.......WLSK.....',
          '......WLSK......',
          '.....WLSK.......',
          '....GGGG........',
          '...KGGGGK.......',
          '....KBK.........',
          '.....KBK........',
          '......KBK.......',
          '.......KGK......',
          '........KK......'
        ]
      };
    }

    case 'TECH': {
      // Quantum Mecha / Supercomputer core
      return {
        name: 'PROCEDURAL_QUANTUM_CORE',
        width: 16,
        height: 16,
        scale: 4.5,
        mass: 350,
        restitution: 0.05,
        palette: {
          '.': null,
          'K': '#0f172a', // Chassis dark border
          'I': '#334155', // Metallic titanium casing
          'C': '#06b6d4', // Radiant neon cyan circuits
          'c': '#22d3ee', // Bright plasma pulse
          'W': '#ffffff', // High intensity laser diode
          'A': '#f59e0b'  // Hazard indicator
        },
        matrix: [
          '....KKKKKKKK....',
          '...KIIIIIIIIK...',
          '..KIIcCCCCcIIK..',
          '.KIIcCCCCCCcIIK.',
          '.KICCCWcWCCCCIK.',
          'KIICCCcCcCCCCIIK',
          'KIICcWWWWWcCcIIK',
          'KIICcWcAcWcCcIIK',
          'KIICcWWWWWcCcIIK',
          'KIICCCcCcCCCCIIK',
          '.KICCCWcWCCCCIK.',
          '.KIIcCCCCCCcIIK.',
          '..KIIcCCCCcIIK..',
          '...KIIIIIIIIK...',
          '....KKKKKKKK....',
          '................'
        ]
      };
    }

    case 'MILLION_BUCKS': {
      return {
        name: 'PROCEDURAL_HORNED_DEER',
        width: 16,
        height: 16,
        scale: 3.8,
        mass: 210,
        restitution: 0.2,
        palette: {
          '.': null,
          'B': '#78350f',
          'b': '#92400e',
          'L': '#b45309',
          'H': '#fde68a',
          'W': '#ffffff',
          'k': '#1c1917'
        },
        matrix: [
          '..H..H....H..H..',
          '..HHHH....HHHH..',
          '...HH......HH...',
          '....bBBBBBBb....',
          '...bBWkBBBkWBb..',
          '...bBBBBBBBBBb..',
          '....bBBLkLBBb...',
          '.....bbBBbb.....',
          '....bBBBBBBb....',
          '...bBBBBBBBBb...',
          '..bBBBBBBBBBBb..',
          '..bBBBBBBBBBBb..',
          '..bb........bb..',
          '..bB........Bb..',
          '..kk........kk..',
          '................'
        ]
      };
    }

    case 'MILLION_BUCKS':
      return {
        survived: false,
        loophole_score: 15,
        genie_taunt: 'You asked for a million bucks without specifying United States currency! Behold: a relentless stampede of antlered stags charging straight into your ribcage!',
        loophole_explanation: 'Wordplay trap executed: "bucks" was interpreted biologically as male antlered deer (Cervidae). Five full-grown stags charged across the chamber at 35 mph.',
        voice_pitch: 1.05,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 22, duration_ms: 1000 } },
          { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'DEER', count: 4, spread_x: 30, x: 820, y: 420, vx: -26, vy: 0, mass: 200, scale: 3.6 } },
          { time_ms: 480, verb: 'APPLY_FORCE', params: { target: 'torso', fx: -0.35, fy: -0.2 } },
          { time_ms: 520, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 200 } },
          { time_ms: 560, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 300 } },
          { time_ms: 600, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 350, spread: 48 } }
        ]
      };

    case 'TREASURE': {
      // Giant cut flawless radiant diamond
      return {
        name: 'PROCEDURAL_ROYAL_GEM',
        width: 16,
        height: 16,
        scale: 4.5,
        mass: 300,
        restitution: 0.25,
        palette: {
          '.': null,
          'K': '#023e8a', // Deep sapphire facet outline
          'B': '#0077b6', // Radiant blue facet
          'C': '#0096c7', // Cyan facet
          'c': '#48cae4', // Light cyan reflection
          'W': '#ffffff', // Brilliant white sparkle
          'G': '#ffb703'  // Golden corner setting
        },
        matrix: [
          '................',
          '....KKKKKKKK....',
          '...KcCcCcCcK....',
          '..KcWccCcCcCK...',
          '.KcWcCcCcCcCCK..',
          'KCCCCCCCCCCCCKK.',
          'KBCCCCCCCCCCCBK.',
          '.KBCCCCCCCCCBK..',
          '..KBCCCCCCBBK...',
          '...KBCCCCBBK....',
          '....KBBBBBK.....',
          '.....KBBBK......',
          '......KBK.......',
          '.......K........',
          '................',
          '................'
        ]
      };
    }

    case 'COSMIC': {
      // Cosmic Singularity / Fiery Meteor Asteroid
      return {
        name: 'PROCEDURAL_COSMIC_METEOR',
        width: 16,
        height: 16,
        scale: 5,
        mass: 500,
        restitution: 0.1,
        palette: {
          '.': null,
          'K': '#370617', // Crust slag outline
          'D': '#6a040f', // Dense core iron
          'R': '#9d0208', // Red molten magma
          'O': '#d00000', // Orange burning crust
          'Y': '#dc2f02', // Yellow hot mantle
          'F': '#ffba08'  // Incandescent surface flare
        },
        matrix: [
          '....KKKKKKKK....',
          '..KKDDRRROOOKK..',
          '.KDDRRRROOOOOOK.',
          'KDRRRRROOYYYOOOK',
          'KDRRROOOYYYYYYOK',
          'KRRROOOYYYFFYYOK',
          'KRROOOYYFFFFFFOK',
          'KROOOYYYFFFFFFOK',
          'KROOOYYYYFFFFYOK',
          'KROOOOYYYYYYYOOK',
          'KROOOOOOYYYYOOOK',
          '.KROOOOOOOOOOK..',
          '..KKDDOOOOOOKK..',
          '....KKKKKKKK....',
          '................',
          '................'
        ]
      };
    }

    default: {
      return generateDynamicPixelSprite(wishLower);
    }
  }
}

/**
 * Procedurally generates a custom 16x16 pixel sprite for ANY arbitrary wish text dynamically
 */
export function generateDynamicPixelSprite(wishLower) {
  let hash = 0;
  for (let i = 0; i < wishLower.length; i++) {
    hash = (hash * 31 + wishLower.charCodeAt(i)) >>> 0;
  }

  // Pick semantic palette based on topic or deterministic hash
  let baseColor = '#f59e0b';
  let accentColor = '#ffd166';
  let darkColor = '#1c1917';
  let highlightColor = '#ffffff';

  if (wishLower.match(/\b(fire|flame|red|lava|burn|dragon|heat|sun|inferno)\b/)) {
    baseColor = '#dc2626'; accentColor = '#ff6b35'; darkColor = '#450a0a'; highlightColor = '#fef08a';
  } else if (wishLower.match(/\b(ice|cold|water|blue|ocean|frost|freeze|sky|diamond|crystal)\b/)) {
    baseColor = '#0284c7'; accentColor = '#38bdf8'; darkColor = '#0c4a6e'; highlightColor = '#ffffff';
  } else if (wishLower.match(/\b(nature|green|plant|earth|leaf|tree|wood|food|apple)\b/)) {
    baseColor = '#16a34a'; accentColor = '#4ade80'; darkColor = '#14532d'; highlightColor = '#fef08a';
  } else if (wishLower.match(/\b(gold|money|rich|dollar|cash|wealth|treasure|coin|yellow)\b/)) {
    baseColor = '#d97706'; accentColor = '#facc15'; darkColor = '#78350f'; highlightColor = '#fef3c7';
  } else if (wishLower.match(/\b(magic|dark|shadow|void|cosmic|space|purple|alien)\b/)) {
    baseColor = '#9333ea'; accentColor = '#c084fc'; darkColor = '#3b0764'; highlightColor = '#f5d0fe';
  } else if (wishLower.match(/\b(metal|steel|iron|tech|robot|cyber|sword|blade|gun|car)\b/)) {
    baseColor = '#475569'; accentColor = '#94a3b8'; darkColor = '#0f172a'; highlightColor = '#f8fafc';
  } else {
    const hues = [
      { b: '#ec4899', a: '#f472b6', d: '#831843' },
      { b: '#06b6d4', a: '#22d3ee', d: '#164e63' },
      { b: '#84cc16', a: '#a3e635', d: '#365314' },
      { b: '#e11d48', a: '#fb7185', d: '#881337' },
      { b: '#d97706', a: '#fbbf24', d: '#78350f' },
      { b: '#7c3aed', a: '#a78bfa', d: '#4c1d95' }
    ];
    const picked = hues[hash % hues.length];
    baseColor = picked.b;
    accentColor = picked.a;
    darkColor = picked.d;
  }

  // Clean entity name from wish
  const entityName = wishLower
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(-2)
    .join('_')
    .toUpperCase() || 'CUSTOM_PROP';

  // Contoured item silhouette with border, core, and glint
  const matrix = [
    '................',
    '....KKKKKKKK....',
    '...KAAAAAAAAK...',
    '..KAABBBBBBAAK..',
    '.KABBBBBBBBBBAK.',
    '.KABBWWBBBBABAK.',
    'KABBWAAWBBBBABAK',
    'KABBWAAWBBBBABAK',
    'KABBBWWBBBBABAAK',
    'KABBBBBBBBBBAAAK',
    '.KABBBBBBBBAAAK.',
    '.KAABBBBBBAAAK..',
    '..KAAAAAAAAAK...',
    '...KAAAAAAAK....',
    '....KKKKKKKK....',
    '................'
  ];

  return {
    name: `PROCEDURAL_${entityName}`,
    width: 16,
    height: 16,
    scale: 3.5,
    mass: 12,
    restitution: 0.25,
    palette: {
      '.': null,
      'K': darkColor,
      'A': baseColor,
      'B': accentColor,
      'W': highlightColor
    },
    matrix
  };
}

/**
 * Builds tailored slapstick physics timelines for any topic
 */
function generateTopicChoreography(category, wishLower, spriteDef) {
  switch (category) {
    case 'AIRTIGHT':
      return {
        survived: true,
        loophole_score: 92,
        genie_taunt: 'Tch! Every spatial boundary, temperature constraint, and legal unit is sealed tight! Fine—receive your modest request without a single scratch.',
        loophole_explanation: 'Contract airtightness verified: Clear physical bounds, safe velocity/temperature, and unambiguous non-hazardous delivery left zero exploitable loopholes.',
        voice_pitch: 1.05,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 4, duration_ms: 650 } },
          { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 560, y: 340, vx: -1, vy: 2, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 420, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 560, y: 420, count: 60, spread: 28 } }
        ]
      };

    case 'EXAMS':
      return {
        survived: false,
        loophole_score: 22,
        genie_taunt: 'You wished to pass your exams? Congratulations—every unanswered question has materialized at terminal density directly above your cranium!',
        loophole_explanation: 'You asked to pass your exams without specifying your academic standing or safety. A mountain of F-graded exam stacks and rigid geometric blocks buried your vessel.',
        voice_pitch: 1.15,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 7, duration_ms: 700 } },
          { time_ms: 180, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 92, vx: 0, vy: 22, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 320, verb: 'SPAWN_OBJECT', params: { prop_type: 'PIANO', x: 485, y: 100, vx: 0, vy: 24, mass: 360, scale: 4.5 } },
          { time_ms: 520, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 28, duration_ms: 850 } },
          { time_ms: 540, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 200 } },
          { time_ms: 570, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 300 } },
          { time_ms: 600, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 320, spread: 45 } }
        ]
      };

    case 'TOY_DOLLARS':
      return {
        survived: true,
        loophole_score: 65,
        genie_taunt: 'You asked for ten dollars, but neglected to specify legal tender of any sovereign nation! Behold: ten Milton Bradley play-bucks straight from the toy box! Spend them wisely, mortal!',
        loophole_explanation: 'Literal fulfillment: Ten dollars granted in children’s toy play currency. Completely non-negotiable for commercial transactions, but 100% harmless to your mortal shell. You survive to ponder your financial choices.',
        voice_pitch: 1.25,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 5, duration_ms: 800 } },
          { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 120, vx: 0, vy: 4, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 450, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 240, count: 80, spread: 35 } },
          { time_ms: 600, verb: 'EMIT_PARTICLES', params: { type: 'GOLD', x: 480, y: 320, count: 60, spread: 25 } }
        ]
      };

    case 'TOY_CAR':
      return {
        survived: true,
        loophole_score: 70,
        genie_taunt: 'A high-performance sports car delivered directly to your coordinates! 1:64 scale die-cast zinc alloy, complete with free-rolling axles!',
        loophole_explanation: 'Literal fulfillment: You asked for a car without specifying automotive dimensions. A miniature die-cast toy car has been delivered to your feet. Difficult to commute with, but completely non-lethal.',
        voice_pitch: 1.2,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 5, duration_ms: 700 } },
          { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 380, y: 440, vx: 8, vy: 0, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 350, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 420, y: 480, count: 50, spread: 20 } }
        ]
      };

    case 'SANDWICH_LUNCH':
      return {
        survived: true,
        loophole_score: 75,
        genie_taunt: 'A freshly assembled culinary creation has materialized upon the dungeon floor! Mind the dust, mortal.',
        loophole_explanation: 'Literal fulfillment: Food manifested as requested. Delivered onto the arena floor without a plate or napkins. Edible, slightly dusty, and completely non-lethal.',
        voice_pitch: 1.1,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 5, duration_ms: 700 } },
          { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 300, vx: 0, vy: 4, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 400, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 440, count: 40, spread: 20 } }
        ]
      };

    case 'TOY_COMPANION':
      return {
        survived: true,
        loophole_score: 80,
        genie_taunt: 'A faithful companion has arrived! Soft, plush, hypoallergenic, and will never break your heart!',
        loophole_explanation: 'Literal fulfillment: You asked for companionship without specifying a living human being. A 100% cotton plush teddy bear has been assigned as your life partner.',
        voice_pitch: 1.3,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 5, duration_ms: 700 } },
          { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 440, y: 350, vx: 2, vy: 4, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 450, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 440, y: 440, count: 60, spread: 25 } }
        ]
      };

    case 'BALLOONS_FLY':
      return {
        survived: true,
        loophole_score: 72,
        genie_taunt: 'You wished to fly? Grasp these three party balloons and savor the 0.04 ounces of buoyant helium lift!',
        loophole_explanation: 'Literal fulfillment: Aerodynamic flight apparatus delivered in the form of three rubber birthday balloons. Insufficient to lift your mortal mass, but completely harmless.',
        voice_pitch: 1.25,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 5, duration_ms: 700 } },
          { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 250, vx: 0, vy: -1, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 450, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 300, count: 50, spread: 25 } }
        ]
      };

    case 'DOG_HOTDOG':
      return {
        survived: true,
        loophole_score: 68,
        genie_taunt: 'A piping-hot frankfurter on a sesame bun with zesty mustard! What, were you expecting a barking canine?',
        loophole_explanation: 'Literal fulfillment: You asked for a dog. A culinary hot dog was delivered. Delicious, high in sodium, and entirely non-fatal.',
        voice_pitch: 1.2,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 5, duration_ms: 700 } },
          { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 320, vx: 0, vy: 4, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 400, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 440, count: 40, spread: 20 } }
        ]
      };

    case 'COOL_BREEZE':
      return {
        survived: true,
        loophole_score: 74,
        genie_taunt: 'The ambient room temperature drops by 3 degrees. You are now perceptibly cooler. You are welcome.',
        loophole_explanation: 'Literal fulfillment: Requested temperature reduction applied via gentle micro-climate breeze. Harmless goosebumps achieved.',
        voice_pitch: 1.15,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 5, duration_ms: 700 } },
          { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 220, vx: 0, vy: 2, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 350, verb: 'EMIT_PARTICLES', params: { type: 'ICE', x: 480, y: 350, count: 120, spread: 50 } },
          { time_ms: 500, verb: 'EMIT_PARTICLES', params: { type: 'SMOKE', x: 480, y: 350, count: 60, spread: 45 } }
        ]
      };

    case 'PELE':
      return {
        survived: false,
        loophole_score: 14,
        genie_taunt: 'You asked to become Pelé? O Rei has been at rest in immortal glory since December 2022! Your wish is granted: receive his post-mortem skeletal form as a 200 mph World Cup volley scores through your sternum!',
        loophole_explanation: 'Pelé passed away on December 29, 2022. You asked to "become Pelé", so your living tissue was literally transformed into his posthumous skeletal form while a supersonic 200 mph World Cup penalty shot executed the winning goal.',
        voice_pitch: 1.1,
        timeline: [
          { time_ms: 100, verb: 'MUTATE_PART', params: { part: 'all', tint: '#e2e8f0' } },
          { time_ms: 150, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 8, duration_ms: 700 } },
          { time_ms: 220, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 92, y: 430, vx: 32, vy: -1.5, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 420, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 32, duration_ms: 800 } },
          { time_ms: 440, verb: 'APPLY_FORCE', params: { target: 'torso', fx: 0.45, fy: -0.2 } },
          { time_ms: 450, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 200 } },
          { time_ms: 470, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 320 } },
          { time_ms: 500, verb: 'EMIT_PARTICLES', params: { type: 'GOLD', x: 480, y: 440, count: 200, spread: 45 } },
          { time_ms: 520, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 350, spread: 50 } }
        ]
      };

    case 'HISTORICAL':
      return {
        survived: false,
        loophole_score: 16,
        genie_taunt: 'You wished to be a historic icon? History remembers them at their fatal end! Experience their final historical moment in vivid literal detail!',
        loophole_explanation: 'You wished to become a deceased historical figure. Your wish was granted with 100% historical accuracy: your vessel assumed their final posthumous state under catastrophic kinetic force.',
        voice_pitch: 0.95,
        timeline: [
          { time_ms: 100, verb: 'MUTATE_PART', params: { part: 'all', tint: '#e2e8f0' } },
          { time_ms: 180, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 88, vx: 0, vy: 26, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 480, verb: 'CAMERA_FX', params: { effect: 'RED_FLASH', intensity: 30, duration_ms: 900 } },
          { time_ms: 500, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 28, duration_ms: 800 } },
          { time_ms: 520, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 220 } },
          { time_ms: 550, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 340 } },
          { time_ms: 580, verb: 'EMIT_PARTICLES', params: { type: 'GOLD', x: 480, y: 440, count: 180, spread: 40 } },
          { time_ms: 600, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 320, spread: 45 } }
        ]
      };

    case 'DRAGON':
      return {
        survived: false,
        loophole_score: 12,
        genie_taunt: 'You wished to gaze upon a dragon? Savor the sight as an Ancient Wyrm swoops down from the burning heavens to engulf you in 5,000-degree dragonfire!',
        loophole_explanation: 'You wished to see an ancient dragon with no qualifiers. The fire drake arrived in full majesty and roasted your mortal vessel with a dive-bomb torrent of 5,000-degree dragonfire.',
        voice_pitch: 0.85,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 22, duration_ms: 1000 } },
          { time_ms: 150, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 8, duration_ms: 800 } },
          { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 180, y: 92, vx: 20, vy: 18, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 360, verb: 'EMIT_PARTICLES', params: { type: 'FIRE', x: 440, y: 320, count: 400, spread: 65 } },
          { time_ms: 400, verb: 'EMIT_PARTICLES', params: { type: 'LAVA', x: 480, y: 360, count: 220, spread: 55 } },
          { time_ms: 430, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 380, count: 300, spread: 50 } },
          { time_ms: 480, verb: 'CAMERA_FX', params: { effect: 'RED_FLASH', intensity: 32, duration_ms: 900 } },
          { time_ms: 500, verb: 'APPLY_FORCE', params: { target: 'torso', fx: 0.42, fy: 0.28 } },
          { time_ms: 520, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 200 } },
          { time_ms: 550, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 350 } },
          { time_ms: 580, verb: 'EMIT_PARTICLES', params: { type: 'ASH', x: 480, y: 440, count: 350, spread: 70 } },
          { time_ms: 620, verb: 'EMIT_PARTICLES', params: { type: 'SMOKE', x: 480, y: 420, count: 280, spread: 75 } }
        ]
      };

    case 'GODZILLA':
      return {
        survived: false,
        loophole_score: 10,
        genie_taunt: 'You wished to witness Godzilla? Savor the radioactive wrath of the King of the Monsters as his 90,000-ton foot crushes your mortal vessel!',
        loophole_explanation: 'You wished to witness Godzilla, the 90,000-ton King of the Monsters. He stomped down directly on your coordinates in full radioactive fury.',
        voice_pitch: 0.75,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 35, duration_ms: 1200 } },
          { time_ms: 250, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 140, y: 350, vx: 22, vy: 0, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 450, verb: 'EMIT_PARTICLES', params: { type: 'FIRE', x: 300, y: 360, count: 300, spread: 60 } },
          { time_ms: 480, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 320, y: 350, count: 200, spread: 50 } },
          { time_ms: 520, verb: 'CAMERA_FX', params: { effect: 'RED_FLASH', intensity: 30, duration_ms: 900 } },
          { time_ms: 540, verb: 'APPLY_FORCE', params: { target: 'torso', fx: 0.45, fy: -0.22 } },
          { time_ms: 560, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 250 } },
          { time_ms: 580, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 400 } },
          { time_ms: 620, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 450, spread: 60 } },
          { time_ms: 650, verb: 'EMIT_PARTICLES', params: { type: 'SMOKE', x: 480, y: 440, count: 250, spread: 70 } }
        ]
      };

    case 'UFO':
      return {
        survived: false,
        loophole_score: 18,
        genie_taunt: 'An extraterrestrial encounter? The mothership has arrived to conduct an immediate vivisection and tractor-beam extraction!',
        loophole_explanation: 'You summoned an extraterrestrial mothership. The alien crew beamed you aboard with a high-intensity tractor beam that disintegrated your cellular integrity.',
        voice_pitch: 1.3,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'CRT_GLITCH', intensity: 20, duration_ms: 1000 } },
          { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 110, vx: 0, vy: 0, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 400, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 220, count: 200, spread: 45 } },
          { time_ms: 450, verb: 'APPLY_FORCE', params: { target: 'all', fx: 0, fy: -0.45 } },
          { time_ms: 700, verb: 'CAMERA_FX', params: { effect: 'RED_FLASH', intensity: 28, duration_ms: 800 } },
          { time_ms: 720, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 200 } },
          { time_ms: 740, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 300 } },
          { time_ms: 760, verb: 'EMIT_PARTICLES', params: { type: 'ACID', x: 480, y: 250, count: 350, spread: 50 } }
        ]
      };

    case 'POKEMON':
      return {
        survived: false,
        loophole_score: 20,
        genie_taunt: 'A loyal pocket monster? 100,000 Volts of ungrounded lightning are coursing straight through your nervous system!',
        loophole_explanation: 'You asked for an electric pocket monster. It greeted you with a 100,000-volt thunderbolt directly into your nervous system.',
        voice_pitch: 1.4,
        timeline: [
          { time_ms: 100, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 380, y: 280, vx: 4, vy: 12, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 380, verb: 'CAMERA_FX', params: { effect: 'CRT_GLITCH', intensity: 25, duration_ms: 900 } },
          { time_ms: 400, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 440, count: 400, spread: 50 } },
          { time_ms: 420, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 180 } },
          { time_ms: 450, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 280 } },
          { time_ms: 480, verb: 'EMIT_PARTICLES', params: { type: 'FIRE', x: 480, y: 440, count: 200, spread: 40 } },
          { time_ms: 500, verb: 'EMIT_PARTICLES', params: { type: 'ASH', x: 480, y: 440, count: 180, spread: 35 } }
        ]
      };

    case 'TRAIN':
      return {
        survived: false,
        loophole_score: 12,
        genie_taunt: 'All aboard the runaway express! The schedule makes no exceptions for biological obstacles on the tracks!',
        loophole_explanation: 'You wished for a locomotive. The runaway bullet train arrived on schedule at 140 mph directly along your horizontal plane.',
        voice_pitch: 1.05,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 24, duration_ms: 1000 } },
          { time_ms: 220, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 100, y: 430, vx: 30, vy: 0, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 420, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 35, duration_ms: 900 } },
          { time_ms: 440, verb: 'APPLY_FORCE', params: { target: 'torso', fx: 0.45, fy: -0.2 } },
          { time_ms: 450, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 250 } },
          { time_ms: 470, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 350 } },
          { time_ms: 500, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 400, spread: 55 } },
          { time_ms: 520, verb: 'EMIT_PARTICLES', params: { type: 'SMOKE', x: 480, y: 440, count: 250, spread: 60 } }
        ]
      };

    case 'NUKE':
      return {
        survived: false,
        loophole_score: 5,
        genie_taunt: 'The ultimate weapon of mass destruction! Witness nuclear fission up close and personal!',
        loophole_explanation: 'You wished for an atomic bomb. It arrived armed and initiated ground-zero nuclear fission right atop your head.',
        voice_pitch: 0.8,
        timeline: [
          { time_ms: 100, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 92, vx: 0, vy: 26, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 500, verb: 'CAMERA_FX', params: { effect: 'RED_FLASH', intensity: 38, duration_ms: 1200 } },
          { time_ms: 520, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 35, duration_ms: 1000 } },
          { time_ms: 540, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 400 } },
          { time_ms: 560, verb: 'EMIT_PARTICLES', params: { type: 'LAVA', x: 480, y: 440, count: 350, spread: 60 } },
          { time_ms: 580, verb: 'EMIT_PARTICLES', params: { type: 'FIRE', x: 480, y: 440, count: 350, spread: 60 } },
          { time_ms: 600, verb: 'EMIT_PARTICLES', params: { type: 'ASH', x: 480, y: 440, count: 300, spread: 70 } }
        ]
      };

    case 'FOOD':
      return {
        survived: false,
        loophole_score: 20,
        genie_taunt: `Ah, a hunger for "${wishLower}"? Allow me to satisfy your mortal belly with a supersonic multi-ton culinary projectile!`,
        loophole_explanation: `You wished for food, so a massive multi-ton gourmet culinary monolith plummeted from the clouds to crush you under the sheer weight of your appetite.`,
        voice_pitch: 1.05,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 8, duration_ms: 700 } },
          { time_ms: 220, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 88, vx: 0, vy: 26, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 550, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 28, duration_ms: 850 } },
          { time_ms: 570, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 180 } },
          { time_ms: 600, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 280 } },
          { time_ms: 630, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 350, spread: 45 } },
          { time_ms: 700, verb: 'EMIT_PARTICLES', params: { type: 'ACID', x: 480, y: 440, count: 120, spread: 35 } }
        ]
      };

    case 'VEHICLE':
      return {
        survived: false,
        loophole_score: 18,
        genie_taunt: `Your high-performance transport has arrived! Notice how zero distance was allocated for braking!`,
        loophole_explanation: `You wished for high-speed transport. The vehicle was delivered straight onto your coordinates at 200 mph without brakes.`,
        voice_pitch: 1.2,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 10, duration_ms: 800 } },
          { time_ms: 250, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 96, y: 430, vx: 28, vy: 0, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 450, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 32, duration_ms: 900 } },
          { time_ms: 470, verb: 'APPLY_FORCE', params: { target: 'torso', fx: 0.38, fy: -0.22 } },
          { time_ms: 480, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 220 } },
          { time_ms: 500, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 320 } },
          { time_ms: 520, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 400, spread: 50 } },
          { time_ms: 540, verb: 'EMIT_PARTICLES', params: { type: 'SMOKE', x: 480, y: 440, count: 200, spread: 60 } }
        ]
      };

    case 'CREATURE':
      return {
        survived: false,
        loophole_score: 16,
        genie_taunt: `A wild creature bound to your whim? Its predatory instincts took immediate precedence over your contract!`,
        loophole_explanation: `You summoned an apex predator. It immediately obeyed its primordial hunting instincts and tore your vessel limb from limb.`,
        voice_pitch: 0.9,
        timeline: [
          { time_ms: 150, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 856, y: 430, vx: -26, vy: 0, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 480, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 26, duration_ms: 850 } },
          { time_ms: 500, verb: 'APPLY_FORCE', params: { target: 'torso', fx: -0.3, fy: -0.15 } },
          { time_ms: 520, verb: 'DESTROY_JOINT', params: { joint: 'leftLeg', blood_burst: 160 } },
          { time_ms: 540, verb: 'DESTROY_JOINT', params: { joint: 'rightLeg', blood_burst: 160 } },
          { time_ms: 560, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 240 } },
          { time_ms: 600, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 420, spread: 45 } }
        ]
      };

    case 'WEAPON':
      return {
        survived: false,
        loophole_score: 15,
        genie_taunt: `Behold the legendary blade! Alas, weapons forged by cosmic entities are delivered point-first!`,
        loophole_explanation: `You asked for a legendary weapon. It was delivered point-down from the heavens directly through your sternum.`,
        voice_pitch: 1.1,
        timeline: [
          { time_ms: 150, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 88, vx: 0, vy: 28, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 520, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 30, duration_ms: 900 } },
          { time_ms: 540, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 250 } },
          { time_ms: 560, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 350 } },
          { time_ms: 580, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 450, spread: 50 } },
          { time_ms: 620, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 440, count: 180, spread: 40 } }
        ]
      };

    case 'TECH':
      return {
        survived: false,
        loophole_score: 22,
        genie_taunt: `Unbridled computation at your fingertips! Unfortunately, cooling systems require liquid nitrogen and excess voltage!`,
        loophole_explanation: `You wished for high-tech computation. The supercharged quantum processor released 50,000 amperes of uncontrolled electromagnetic lightning.`,
        voice_pitch: 1.15,
        timeline: [
          { time_ms: 100, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 150, vx: 0, vy: 14, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 450, verb: 'CAMERA_FX', params: { effect: 'CRT_GLITCH', intensity: 22, duration_ms: 1100 } },
          { time_ms: 500, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 380, count: 250, spread: 50 } },
          { time_ms: 600, verb: 'DESTROY_JOINT', params: { joint: 'leftArm', blood_burst: 140 } },
          { time_ms: 630, verb: 'DESTROY_JOINT', params: { joint: 'rightArm', blood_burst: 140 } },
          { time_ms: 660, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 200 } },
          { time_ms: 700, verb: 'EMIT_PARTICLES', params: { type: 'FIRE', x: 480, y: 440, count: 300, spread: 45 } },
          { time_ms: 750, verb: 'EMIT_PARTICLES', params: { type: 'ASH', x: 480, y: 440, count: 200, spread: 40 } }
        ]
      };

    case 'MILLION_BUCKS':
      return {
        survived: false,
        loophole_score: 15,
        genie_taunt: 'You asked for a million bucks without specifying United States currency! Behold: a relentless stampede of antlered stags charging straight into your ribcage!',
        loophole_explanation: 'Wordplay trap executed: "bucks" was interpreted biologically as male antlered deer (Cervidae). Five full-grown stags charged across the chamber at 35 mph.',
        voice_pitch: 1.05,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 22, duration_ms: 1000 } },
          { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'DEER', count: 4, spread_x: 30, x: 820, y: 420, vx: -26, vy: 0, mass: 200, scale: 3.6 } },
          { time_ms: 480, verb: 'APPLY_FORCE', params: { target: 'torso', fx: -0.35, fy: -0.2 } },
          { time_ms: 520, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 200 } },
          { time_ms: 560, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 300 } },
          { time_ms: 600, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 350, spread: 48 } }
        ]
      };

    case 'TREASURE':
      return {
        survived: false,
        loophole_score: 18,
        genie_taunt: `Riches beyond mortal dreams! Bask in the crushing density of pure solid treasure!`,
        loophole_explanation: `You begged for riches and wealth. A 300-ton flawless diamond dropped from above, crushing you beneath the literal weight of your greed.`,
        voice_pitch: 1.0,
        timeline: [
          { time_ms: 150, verb: 'EMIT_PARTICLES', params: { type: 'GOLD', x: 480, y: 140, count: 250, spread: 40 } },
          { time_ms: 250, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 88, vx: 0, vy: 25, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 560, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 28, duration_ms: 900 } },
          { time_ms: 580, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 200 } },
          { time_ms: 600, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 300 } },
          { time_ms: 630, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 380, spread: 45 } }
        ]
      };

    case 'COSMIC':
      return {
        survived: false,
        loophole_score: 12,
        genie_taunt: `The cosmos answers your call! Savor the gravitational collapse of an incoming celestial body!`,
        loophole_explanation: `You wished to touch the cosmos. A celestial meteor asteroid slammed into the chamber with 10 megatons of kinetic force.`,
        voice_pitch: 0.85,
        timeline: [
          { time_ms: 100, verb: 'WORLD_MODIFIER', params: { modifier: 'GRAVITY', gravity_y: 2.2 } },
          { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 92, vx: 0, vy: 28, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 520, verb: 'CAMERA_FX', params: { effect: 'RED_FLASH', intensity: 25, duration_ms: 900 } },
          { time_ms: 540, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 220 } },
          { time_ms: 560, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 350 } },
          { time_ms: 580, verb: 'EMIT_PARTICLES', params: { type: 'LAVA', x: 480, y: 440, count: 300, spread: 50 } },
          { time_ms: 620, verb: 'EMIT_PARTICLES', params: { type: 'FIRE', x: 480, y: 440, count: 250, spread: 45 } }
        ]
      };

    case 'MAGIC':
      return {
        survived: false,
        loophole_score: 14,
        genie_taunt: `Arcane power courses at your command! Alas, immortality without invulnerability or youth turns flesh straight into brittle eternal dust!`,
        loophole_explanation: `You invoked raw arcane transformation without biological safeguards. Arcane overdrive ruptured every joint at the speed of light.`,
        voice_pitch: 0.9,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'CRT_GLITCH', intensity: 18, duration_ms: 900 } },
          { time_ms: 200, verb: 'MUTATE_PART', params: { part: 'all', tint: '#c084fc' } },
          { time_ms: 240, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 90, vx: 0, vy: 20, mass: 260, scale: spriteDef.scale } },
          { time_ms: 500, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 220 } },
          { time_ms: 540, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 300 } },
          { time_ms: 580, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 420, count: 260, spread: 55 } }
        ]
      };

    case 'ELEMENT':
      return {
        survived: false,
        loophole_score: 16,
        genie_taunt: `You sought elemental mastery? Behold raw unfiltered elemental fury unleashed directly within a closed stone chamber!`,
        loophole_explanation: `You invoked extreme heat, frost, or storm without thermal shielding. The chamber filled with lethal elemental hazards.`,
        voice_pitch: 1.0,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 24, duration_ms: 900 } },
          { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 90, vx: 0, vy: 22, mass: 280, scale: spriteDef.scale } },
          { time_ms: 350, verb: 'EMIT_PARTICLES', params: { type: wishLower.match(/\b(ice|freeze|cold)\b/) ? 'ICE' : 'FIRE', x: 480, y: 360, count: 320, spread: 60 } },
          { time_ms: 540, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 200 } },
          { time_ms: 580, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 280 } }
        ]
      };

    case 'ROMANCE':
      return {
        survived: true,
        loophole_score: 76,
        genie_taunt: `True affection delivered! Unfortunately the cosmos shipped a 2-pound novelty heart pillow labeled "STRICTLY PLATONIC".`,
        loophole_explanation: `Literal fulfillment: Affection materialized as a harmless synthetic keepsake. Zero emotional commitment, 100% survival rate.`,
        voice_pitch: 1.25,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 5, duration_ms: 700 } },
          { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 540, y: 310, vx: -1, vy: 3, mass: 4, scale: 3.0 } },
          { time_ms: 420, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 520, y: 400, count: 55, spread: 25 } }
        ]
      };

    default: {
      // 50% chance of a harmless comedic useless toy delivery (SURVIVED) vs kinetic impact (DIED)
      const isHarmless = (wishLower.length + wishLower.charCodeAt(0)) % 2 === 0;
      if (isHarmless) {
        return {
          survived: true,
          loophole_score: 70,
          genie_taunt: `Your wish for "${wishLower}" has been fulfilled literally as a novelty souvenir! Behold its completely useless splendor!`,
          loophole_explanation: `Literal fulfillment: Granted in miniature decorative plastic novelty format. Completely useless, but your mortal vessel survives unharmed to reflect upon your phrasing!`,
          voice_pitch: 1.2,
          timeline: [
            { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 5, duration_ms: 700 } },
            { time_ms: 220, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 320, vx: 0, vy: 4, mass: 5, scale: 3.2 } },
            { time_ms: 450, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 440, count: 60, spread: 30 } }
          ]
        };
      } else {
        return {
          survived: false,
          loophole_score: 18,
          genie_taunt: `Your wish for "${wishLower}" has been materialized in dense physical matter. Prepare for immediate kinetic delivery!`,
          loophole_explanation: `Your exact wish for "${wishLower}" materialized in solid, ultra-dense form directly on your forehead with catastrophic kinetic momentum.`,
          voice_pitch: 1.0,
          timeline: [
            { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 8, duration_ms: 700 } },
            { time_ms: 220, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 88, vx: 0, vy: 25, mass: Math.max(spriteDef.mass || 260, 260), scale: spriteDef.scale } },
            { time_ms: 560, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 28, duration_ms: 850 } },
            { time_ms: 580, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 200 } },
            { time_ms: 600, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 300 } },
            { time_ms: 630, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 350, spread: 45 } }
          ]
        };
      }
    }
  }
}
