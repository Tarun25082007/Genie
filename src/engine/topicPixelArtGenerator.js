// Topic-Aware Procedural Pixel Art & Custom Choreography Synthesizer
// Generates Terraria / Stardew Valley level 16x16 pixel-art sprites and custom slapstick physics for ANY wish topic!

export function synthesizeTopicScenario(cleanWish) {
  const wishLower = cleanWish.toLowerCase();

  // 1. Detect Category & Dominant Entity
  const category = detectTopicCategory(wishLower);
  const spriteDef = generateProceduralPixelSprite(category, wishLower);
  const choreography = generateTopicChoreography(category, wishLower, spriteDef);

  return {
    wishText: cleanWish,
    survived: false,
    loophole_score: Math.floor(Math.random() * 20) + 10,
    genie_taunt: choreography.genie_taunt,
    loophole_explanation: choreography.loophole_explanation,
    voice_pitch: choreography.voice_pitch || 1.0,
    custom_prop: spriteDef,
    choreography_timeline: choreography.timeline
  };
}

function detectTopicCategory(text) {
  // 1. Specific Iconic / Pop-Culture Entities
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

  // 2. Thematic Categories
  if (text.match(/\b(pizza|burger|taco|food|eat|hungry|sandwich|cake|donut|steak|sushi|cheese|coffee|beer|wine|ice cream|chocolate|bread|meal|snack|pie|soup|apple|fruit)\b/)) {
    return 'FOOD';
  }
  if (text.match(/\b(car|truck|bike|motorcycle|plane|airplane|jet|rocket|spaceship|boat|ship|submarine|skateboard|vehicle|ferrari|lambo|tesla|drive)\b/)) {
    return 'VEHICLE';
  }
  if (text.match(/\b(dog|cat|puppy|kitten|dinosaur|dino|t-rex|trex|monster|alien|zombie|skeleton|bear|shark|wolf|lion|tiger|bird|spider|snake|horse|pet|creature|animal|beast)\b/)) {
    return 'CREATURE';
  }
  if (text.match(/\b(sword|gun|pistol|rifle|cannon|bomb|axe|knife|dagger|laser|blade|bow|arrow|spear|weapon|missile|katana|bullet|grenade)\b/)) {
    return 'WEAPON';
  }
  if (text.match(/\b(phone|iphone|computer|pc|laptop|robot|ai|tech|console|playstation|xbox|tv|screen|drone|chip|mecha|cyber|gadget|camera)\b/)) {
    return 'TECH';
  }
  if (text.match(/\b(gold|money|cash|dollar|rich|wealth|diamond|ruby|gem|emerald|crown|ring|jewelry|bitcoin|crypto|treasure|safe|vault|billionaire|millionaire)\b/)) {
    return 'TREASURE';
  }
  if (text.match(/\b(star|moon|sun|space|galaxy|planet|meteor|asteroid|black hole|gravity|void|comet|cosmic|universe)\b/)) {
    return 'COSMIC';
  }
  if (text.match(/\b(magic|potion|wand|spell|witch|wizard|demon|angel|ghost|curse|orb|crystal|god|powers|superpower)\b/)) {
    return 'MAGIC';
  }
  if (text.match(/\b(fire|water|ice|freeze|cold|hot|burn|lightning|thunder|storm|rain|ocean|lava|acid|earth|rock|boulder)\b/)) {
    return 'ELEMENT';
  }
  if (text.match(/\b(friend|girlfriend|boyfriend|love|wife|husband|marry|date|companion|hug|kiss)\b/)) {
    return 'ROMANCE';
  }
  return 'OBJECT';
}

/**
 * Procedurally generates a full 16x16 pixel matrix + vibrant palette
 */
export function generateProceduralPixelSprite(category, wishLower) {
  switch (category) {
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
          '.KIICCCCCCCCIK.',
          '.KICCCWcWCCCCIK.',
          'KIICCCCcCCCCIIK',
          'KIICcWWWWWcCcIIK',
          'KIICcWcAcWcCcIIK',
          'KIICcWWWWWcCcIIK',
          'KIICCCCcCCCCIIK',
          '.KICCCWcWCCCCIK.',
          '.KIICCCCCCCCIK.',
          '..KIIcCCCCcIIK..',
          '...KIIIIIIIIK...',
          '....KKKKKKKK....',
          '................'
        ]
      };
    }

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
      // Universal Mythic Relic / Heavy Monolith
      return {
        name: 'PROCEDURAL_MYTHIC_TOTEM',
        width: 16,
        height: 16,
        scale: 4.5,
        mass: 400,
        restitution: 0.05,
        palette: {
          '.': null,
          'K': '#1a1423', // Obsidian rune outline
          'S': '#372549', // Dark runestone
          'P': '#774c60', // Purple amethyst vein
          'G': '#ffd166', // Golden glyph inlay
          'W': '#ffffff'  // Glyph glow
        },
        matrix: [
          '....KKKKKKKK....',
          '...KSSSSSSSSK...',
          '..KSSGGWWGGSSK..',
          '.KSSGGWWWWGGSSK.',
          '.KSGGWGGGGWGGSSK',
          'KSGGWGGGGGGWGGSS',
          'KSGGWGGGGGGWGGSS',
          'KSSGGWWWWWWGGSSK',
          'KSSGGWWWWWWGGSSK',
          'KSGGWGGGGGGWGGSS',
          'KSGGWGGGGGGWGGSS',
          '.KSGGWGGGGWGGSSK',
          '.KSSGGWWWWGGSSK.',
          '..KSSGGWWGGSSK..',
          '...KSSSSSSSSK...',
          '....KKKKKKKK....'
        ]
      };
    }
  }
}

/**
 * Builds tailored slapstick physics timelines for any topic
 */
function generateTopicChoreography(category, wishLower, spriteDef) {
  switch (category) {
    case 'DRAGON':
      return {
        genie_taunt: 'You wished to gaze upon a dragon? Savor the sight as an Ancient Wyrm swoops down from the burning heavens to engulf you in 5,000-degree dragonfire!',
        loophole_explanation: 'Clause 15.2: Failure to establish flight corridors, fire-suppression protocols, or thermal insulation. Dragon executed a dive-bomb strafing run with unconstrained incendiary breath.',
        voice_pitch: 0.85,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 22, duration_ms: 1000 } },
          { time_ms: 150, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 8, duration_ms: 800 } },
          { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 180, y: 70, vx: 20, vy: 18, mass: spriteDef.mass, scale: spriteDef.scale } },
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
        genie_taunt: 'You wished to witness Godzilla? Savor the radioactive wrath of the King of the Monsters as his 90,000-ton foot crushes your mortal vessel!',
        loophole_explanation: 'Clause 13.9: Failure to specify containment boundaries, spectator safe distance, or ionizing radiation shielding. Godzilla manifested directly on your coordinates.',
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
        genie_taunt: 'An extraterrestrial encounter? The mothership has arrived to conduct an immediate vivisection and tractor-beam extraction!',
        loophole_explanation: 'Clause 9.8: Interstellar contact invoked without bilateral diplomatic treaties. Alien abduction tractor beam reversed biological coherence.',
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
        genie_taunt: 'A loyal pocket monster? 100,000 Volts of ungrounded lightning are coursing straight through your nervous system!',
        loophole_explanation: 'Clause 6.2: High-voltage bio-electric discharge deployed without rubber insulation. Ragdoll fried by thunderbolt.',
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
        genie_taunt: 'All aboard the runaway express! The schedule makes no exceptions for biological obstacles on the tracks!',
        loophole_explanation: 'Clause 7.4: High-speed rail corridor projected through petitioner torso without track switching signals.',
        voice_pitch: 1.05,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 24, duration_ms: 1000 } },
          { time_ms: 220, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: -100, y: 440, vx: 34, vy: 0, mass: spriteDef.mass, scale: spriteDef.scale } },
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
        genie_taunt: 'The ultimate weapon of mass destruction! Witness nuclear fission up close and personal!',
        loophole_explanation: 'Clause 12.0: Detonation sequence initiated at ground zero. 50 megatons of thermonuclear heat vaporized petitioner.',
        voice_pitch: 0.8,
        timeline: [
          { time_ms: 100, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 60, vx: 0, vy: 26, mass: spriteDef.mass, scale: spriteDef.scale } },
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
        genie_taunt: `Ah, a hunger for "${wishLower}"? Allow me to satisfy your mortal belly with a supersonic multi-ton culinary projectile!`,
        loophole_explanation: 'Clause 2.4: Failure to specify culinary delivery mass or deceleration parameters. 380-ton gourmet creation dropped at terminal velocity.',
        voice_pitch: 1.05,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 8, duration_ms: 700 } },
          { time_ms: 220, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 70, vx: 0, vy: 26, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 550, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 28, duration_ms: 850 } },
          { time_ms: 570, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 180 } },
          { time_ms: 600, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 280 } },
          { time_ms: 630, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 350, spread: 45 } },
          { time_ms: 700, verb: 'EMIT_PARTICLES', params: { type: 'ACID', x: 480, y: 440, count: 120, spread: 35 } }
        ]
      };

    case 'VEHICLE':
      return {
        genie_taunt: `Your high-performance transport has arrived! Notice how zero distance was allocated for braking!`,
        loophole_explanation: 'Clause 5.7: Vehicle delivery stipulated strictly on petitioner horizontal plane at 200 mph.',
        voice_pitch: 1.2,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 10, duration_ms: 800 } },
          { time_ms: 250, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: -80, y: 440, vx: 30, vy: 0, mass: spriteDef.mass, scale: spriteDef.scale } },
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
        genie_taunt: `A wild creature bound to your whim? Its predatory instincts took immediate precedence over your contract!`,
        loophole_explanation: 'Clause 9.3: Biological containment failure. Apex predator entity spawned with aggressive territorial drive.',
        voice_pitch: 0.9,
        timeline: [
          { time_ms: 150, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 920, y: 440, vx: -26, vy: 0, mass: spriteDef.mass, scale: spriteDef.scale } },
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
        genie_taunt: `Behold the legendary blade! Alas, weapons forged by cosmic entities are delivered point-first!`,
        loophole_explanation: 'Clause 3.1: Failure to specify scabbard or safe handling vector. Colossal edge struck directly at vertical terminal velocity.',
        voice_pitch: 1.1,
        timeline: [
          { time_ms: 150, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 60, vx: 0, vy: 28, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 520, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 30, duration_ms: 900 } },
          { time_ms: 540, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 250 } },
          { time_ms: 560, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 350 } },
          { time_ms: 580, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 450, spread: 50 } },
          { time_ms: 620, verb: 'EMIT_PARTICLES', params: { type: 'SPARK', x: 480, y: 440, count: 180, spread: 40 } }
        ]
      };

    case 'TECH':
      return {
        genie_taunt: `Unbridled computation at your fingertips! Unfortunately, cooling systems require liquid nitrogen and excess voltage!`,
        loophole_explanation: 'Clause 8.4: Overclocked quantum processor unleashed 50,000 amperes of uncontrolled electromagnetic discharge.',
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

    case 'TREASURE':
      return {
        genie_taunt: `Riches beyond mortal dreams! Bask in the crushing density of pure solid treasure!`,
        loophole_explanation: 'Clause 4.1: Unbounded mass transfer of physical mineral assets. 300-ton gem dropped directly overhead.',
        voice_pitch: 1.0,
        timeline: [
          { time_ms: 150, verb: 'EMIT_PARTICLES', params: { type: 'GOLD', x: 480, y: 140, count: 250, spread: 40 } },
          { time_ms: 250, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 80, vx: 0, vy: 25, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 560, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 28, duration_ms: 900 } },
          { time_ms: 580, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 200 } },
          { time_ms: 600, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 300 } },
          { time_ms: 630, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 380, spread: 45 } }
        ]
      };

    case 'COSMIC':
      return {
        genie_taunt: `The cosmos answers your call! Savor the gravitational collapse of an incoming celestial body!`,
        loophole_explanation: 'Clause 11.2: Atmospheric entry without orbital decay resistance. Asteroid strike with 10 megaton kinetic force.',
        voice_pitch: 0.85,
        timeline: [
          { time_ms: 100, verb: 'WORLD_MODIFIER', params: { modifier: 'GRAVITY', gravity_y: 2.2 } },
          { time_ms: 200, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 50, vx: 0, vy: 28, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 520, verb: 'CAMERA_FX', params: { effect: 'RED_FLASH', intensity: 25, duration_ms: 900 } },
          { time_ms: 540, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 220 } },
          { time_ms: 560, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 350 } },
          { time_ms: 580, verb: 'EMIT_PARTICLES', params: { type: 'LAVA', x: 480, y: 440, count: 300, spread: 50 } },
          { time_ms: 620, verb: 'EMIT_PARTICLES', params: { type: 'FIRE', x: 480, y: 440, count: 250, spread: 45 } }
        ]
      };

    default:
      return {
        genie_taunt: `Your wish for "${wishLower}" has been materialized in dense physical matter. Prepare for immediate kinetic delivery!`,
        loophole_explanation: 'Clause 1.0: Physical manifestation executed without spatial clearance. Solid artifact materialized directly overhead.',
        voice_pitch: 1.0,
        timeline: [
          { time_ms: 100, verb: 'CAMERA_FX', params: { effect: 'ZOOM_ON_PLAYER', intensity: 8, duration_ms: 700 } },
          { time_ms: 220, verb: 'SPAWN_OBJECT', params: { prop_type: 'CUSTOM_PROP', x: 480, y: 70, vx: 0, vy: 25, mass: spriteDef.mass, scale: spriteDef.scale } },
          { time_ms: 560, verb: 'CAMERA_FX', params: { effect: 'SCREEN_SHAKE', intensity: 28, duration_ms: 850 } },
          { time_ms: 580, verb: 'DESTROY_JOINT', params: { joint: 'neck', blood_burst: 200 } },
          { time_ms: 600, verb: 'DESTROY_JOINT', params: { joint: 'all', blood_burst: 300 } },
          { time_ms: 630, verb: 'EMIT_PARTICLES', params: { type: 'BLOOD', x: 480, y: 440, count: 350, spread: 45 } }
        ]
      };
  }
}
