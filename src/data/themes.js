// Multi-Theme & Entity Variant System + Extensible Custom Theme Engine + 16x16 Pixel Sprites
import { safeGetItem, safeSetItem } from '../utils/safeStorage.js';

export const THEME_SETS = {
  shenron_dragon: {
    id: 'shenron_dragon',
    name: 'Set 1: Dragon Ball Wish Dragons',
    subtitle: 'Sacred Kami Lookout & Planet Namek • 2-3 Wishes',
    maxWishes: 2,
    defaultVariant: 'shenron',
    role: 'Colossal Emerald Star Dragon of the Seven Orbs',
    introDialogue: 'YOU WHO HAVE GATHERED THE SEVEN STAR ORBS... Speak your two wishes now! But beware: eternal dragon magic obeys raw cosmic conservation of mass and momentum!',
    victoryDialogue: 'YOUR WISDOM RIVALS THE SUPREME KAIS. Both wishes have been fulfilled without shattering your mortal vessel. Farewell, until the Orbs scatter once more!',
    personaPrompt: 'Speak like a thunderous, booming Eternal Dragon from a 90s anime. Dramatic, reverent, yet ruthlessly literal about mass, energy, and gravitational forces.',
    chamberColors: {
      bgTop: '#061a14',
      bgBottom: '#0f2922',
      brickPrimary: '#1e4638',
      brickSecondary: '#133026',
      brickMortar: '#071410',
      torchFlame: '#10b981',
      accentHex: '#10b981'
    },
    genieDefaults: {
      archetype: 'DRAGON_SHENRON',
      variant: 'shenron',
      primaryColor: '#10b981',
      secondaryColor: '#facc15',
      eyeColor: '#ef4444',
      relic: 'DRAGON_BALL',
      auraParticleType: 'FIRE',
      voiceBaseFreq: 95
    },
    entityVariants: [
      {
        id: 'shenron',
        name: 'Shenron (Earth Eternal Dragon)',
        subtitle: 'Earth Dragon • 2 Wishes',
        archetype: 'DRAGON_SHENRON',
        maxWishes: 2,
        role: 'Colossal Emerald Star Dragon of Earth',
        introDialogue: 'YOU WHO HAVE GATHERED THE SEVEN STAR ORBS... Speak your two wishes now!',
        victoryDialogue: 'YOUR WISHES ARE GRANTED. FAREWELL!',
        primaryColor: '#10b981',
        secondaryColor: '#facc15',
        eyeColor: '#ef4444',
        relic: 'DRAGON_BALL',
        auraParticleType: 'FIRE',
        voiceBaseFreq: 95
      },
      {
        id: 'porunga',
        name: 'Porunga (Namekian Dragon of Dreams)',
        subtitle: 'Planet Namek • 3 Wishes',
        archetype: 'DRAGON_PORUNGA',
        maxWishes: 3,
        role: 'Colossal Muscular Horned Dream Dragon of Planet Namek',
        introDialogue: 'TAKKA KARUPUTO POPORUNGA PUPIRITTO PARO! I am Porunga, the Great Dragon of Namek! Three wishes are yours!',
        victoryDialogue: 'YOUR THREE WISHES ARE FULFILLED! The Namekian Dragon Balls shall now turn to stone!',
        primaryColor: '#059669',
        secondaryColor: '#1e293b',
        eyeColor: '#fde047',
        relic: 'NAMEK_DRAGON_BALL',
        auraParticleType: 'GOLD',
        voiceBaseFreq: 80
      },
      {
        id: 'super_shenron',
        name: 'Super Shenron (Golden Cosmic Dragon)',
        subtitle: 'Multiverse • 3 Wishes',
        archetype: 'DRAGON_SUPER',
        maxWishes: 3,
        role: 'Universal Golden Dragon of Cosmic Galaxies',
        introDialogue: 'BEHOLD THE GOLDEN DRAGON WHOSE WINGS SPAN UNIVERSES. Speak your divine wish without hesitation!',
        victoryDialogue: 'THE COSMIC HARMONY IS PRESERVED. YOUR WISHES ARE WOVEN INTO CREATION!',
        primaryColor: '#fbbf24',
        secondaryColor: '#d97706',
        eyeColor: '#dc2626',
        relic: 'SUPER_DRAGON_BALL',
        auraParticleType: 'SPARK',
        voiceBaseFreq: 70
      },
      {
        id: 'black_smoke_shenron',
        name: 'Black Smoke Shenron (Shadow Dragon)',
        subtitle: 'Negative Realm • 2 Wishes',
        archetype: 'DRAGON_SHADOW',
        maxWishes: 2,
        role: 'Corrupted Dragon of Malice & Negative Energy',
        introDialogue: 'HAHAHA! The negative energy of mortal greed has summoned me! Suffer the curse of the Shadow Dragon!',
        victoryDialogue: 'CHEATED OUT OF A CORPSE?! The negative energy disperses... for now!',
        primaryColor: '#262626',
        secondaryColor: '#7f1d1d',
        eyeColor: '#9333ea',
        relic: 'CRACKED_DRAGON_BALL',
        auraParticleType: 'ASH',
        voiceBaseFreq: 110
      }
    ]
  },

  djinn_classic: {
    id: 'djinn_classic',
    name: 'Set 2: Al-Qadim & Ancient Djinn',
    subtitle: 'Ancient Brass Lamp Chamber • 3 Wishes',
    maxWishes: 3,
    defaultVariant: 'al_qadim',
    role: 'Ancient Mesopotamian Smoke Djinn bound to brass & blood',
    introDialogue: 'MORTAL! You have rubbed the Brass Lamp of Al-Qadim. Three wishes are yours. Speak plainly—for the cosmos interprets every syllable to the letter, and flesh is terribly fragile.',
    victoryDialogue: 'IMPOSSIBLE! Three wishes granted without spilling a single drop of your mortal blood?! Keep your wretched soul—the Lamp is yours!',
    personaPrompt: 'Speak like an ancient, booming theatrical Arabian Nights Djinn mixed with a pedantic physics professor. Mock mortal greed and sloppy phrasing.',
    chamberColors: {
      bgTop: '#140c1c',
      bgBottom: '#2d162c',
      brickPrimary: '#4a2545',
      brickSecondary: '#30182d',
      brickMortar: '#120814',
      torchFlame: '#f59e0b',
      accentHex: '#f59e0b'
    },
    genieDefaults: {
      archetype: 'DJINN_CLASSIC',
      variant: 'al_qadim',
      primaryColor: '#06b6d4',
      secondaryColor: '#f59e0b',
      eyeColor: '#fef08a',
      relic: 'MAGIC_LAMP',
      auraParticleType: 'SPARK',
      voiceBaseFreq: 135
    },
    entityVariants: [
      {
        id: 'al_qadim',
        name: 'Al-Qadim (Classic Smoke Djinn)',
        subtitle: 'Mesopotamian Brass Lamp • 3 Wishes',
        archetype: 'DJINN_CLASSIC',
        maxWishes: 3,
        role: 'Ancient Mesopotamian Smoke Djinn bound to brass & blood',
        introDialogue: 'MORTAL! You have rubbed the Brass Lamp of Al-Qadim. Three wishes are yours. Speak plainly!',
        victoryDialogue: 'IMPOSSIBLE! Three wishes granted without spilling a drop of blood?! The Lamp is yours!',
        primaryColor: '#06b6d4',
        secondaryColor: '#f59e0b',
        eyeColor: '#fef08a',
        relic: 'MAGIC_LAMP',
        auraParticleType: 'SPARK',
        voiceBaseFreq: 135
      },
      {
        id: 'ifrit',
        name: 'Ifrit (Molten Flame Djinn)',
        subtitle: 'Smokeless Fire Vault • 3 Wishes',
        archetype: 'DJINN_IFRIT',
        maxWishes: 3,
        role: 'Lord of the Smokeless Flame & Molten Cinders',
        introDialogue: 'FROM THE SMOKELESS FIRE OF CREATION, IFRIT RISES! Three wishes, tiny insect of dust—speak before I incinerate you!',
        victoryDialogue: 'YOU QUENCHED MY FLAME WITH MERE WORDS?! A magnificent mind inside fragile flesh.',
        primaryColor: '#f97316',
        secondaryColor: '#dc2626',
        eyeColor: '#fef08a',
        relic: 'FLAME_URN',
        auraParticleType: 'FIRE',
        voiceBaseFreq: 115
      },
      {
        id: 'marid',
        name: 'Marid (Abyssal Ocean Djinn)',
        subtitle: 'Sunken Pearl Cavern • 3 Wishes',
        archetype: 'DJINN_MARID',
        maxWishes: 3,
        role: 'Sovereign of the Abyssal Ocean & Primordial Depths',
        introDialogue: 'THE ABYSSAL DEEPS AWAKEN! I am Marid, ancient ruler of the tidal surges. Three wishes upon the ocean floor!',
        victoryDialogue: 'THE TIDES RETREAT IN AWE. You walk upon water without sinking!',
        primaryColor: '#0284c7',
        secondaryColor: '#38bdf8',
        eyeColor: '#a7f3d0',
        relic: 'ABYSSAL_PEARL',
        auraParticleType: 'SPARK',
        voiceBaseFreq: 145
      },
      {
        id: 'jann',
        name: 'Jann (Desert Mirage Djinn)',
        subtitle: 'Endless Dunes • 3 Wishes',
        archetype: 'DJINN_JANN',
        maxWishes: 3,
        role: 'Spirit of the Blinding Simoom & Desert Mirage',
        introDialogue: 'I WALK THE ENDLESS SHIFTING DUNES. Three wishes amidst the suffocating desert sands!',
        victoryDialogue: 'A MIRAGE NO LONGER—YOUR WILL STANDS LIKE AN OASIS OF STONE.',
        primaryColor: '#d97706',
        secondaryColor: '#fde68a',
        eyeColor: '#ffffff',
        relic: 'DESERT_AMULET',
        auraParticleType: 'GOLD',
        voiceBaseFreq: 125
      }
    ]
  },

  corporate_demon: {
    id: 'corporate_demon',
    name: 'Set 3: Malphas & Infernal Partners',
    subtitle: '9th Circle Boardroom & Tort Law Dungeon • 3 Wishes',
    maxWishes: 3,
    defaultVariant: 'malphas',
    role: 'Infernal Senior Litigation Partner at Brimstone, Malphas & Void LLP',
    introDialogue: 'Welcome to Brimstone & Void LLP! Per Section 4.2 of your Soul Retainer Agreement, you are entitled to three (3) wishes. Any undefined terms will be construed strictly against the Drafter—namely, your ribcage.',
    victoryDialogue: 'MY GOD... Ironclad indemnification across three consecutive clauses?! Our Litigation Department has zero actionable loopholes. You are free to go, Counselor.',
    personaPrompt: 'Speak like a gleefully ruthless corporate M&A attorney and demonic tort lawyer. Cite imaginary sub-clauses, force majeure, tax liabilities, and OSHA violations while crushing the player.',
    chamberColors: {
      bgTop: '#1a0808',
      bgBottom: '#2d0c0c',
      brickPrimary: '#3f1d1d',
      brickSecondary: '#291111',
      brickMortar: '#120505',
      torchFlame: '#ef4444',
      accentHex: '#ef4444'
    },
    genieDefaults: {
      archetype: 'DEMON_CORPORATE',
      variant: 'malphas',
      primaryColor: '#dc2626',
      secondaryColor: '#1f2937',
      eyeColor: '#fde047',
      relic: 'BLOOD_CONTRACT',
      auraParticleType: 'ASH',
      voiceBaseFreq: 175
    },
    entityVariants: [
      {
        id: 'malphas',
        name: 'Malphas Esq. (Litigation Partner)',
        subtitle: 'Brimstone & Void LLP • 3 Wishes',
        archetype: 'DEMON_CORPORATE',
        maxWishes: 3,
        role: 'Infernal Senior Litigation Partner at Brimstone, Malphas & Void LLP',
        introDialogue: 'Welcome to Brimstone & Void LLP! Per Section 4.2 of your Soul Retainer Agreement, you are entitled to three (3) wishes.',
        victoryDialogue: 'Ironclad indemnification across three consecutive clauses?! Zero actionable loopholes. You are free to go, Counselor.',
        primaryColor: '#dc2626',
        secondaryColor: '#1f2937',
        eyeColor: '#fde047',
        relic: 'BLOOD_CONTRACT',
        auraParticleType: 'ASH',
        voiceBaseFreq: 175
      },
      {
        id: 'mammon',
        name: 'Mammon (Archduke of Greed)',
        subtitle: 'Vaults of Avarice • 3 Wishes',
        archetype: 'DEMON_MAMMON',
        maxWishes: 3,
        role: 'Archduke of the 4th Circle, Chief Investment Officer of Hell',
        introDialogue: 'GOLD! COMPOUND INTEREST! LUXURY AT THE COST OF YOUR VERTEBRAE! Three wishes from the Vaults of Avarice!',
        victoryDialogue: 'NOT A SINGLE PENNY STOLEN, NOT A SINGLE SINEW CRUSHED?! You are more greedy than I!',
        primaryColor: '#eab308',
        secondaryColor: '#713f12',
        eyeColor: '#22c55e',
        relic: 'GOLDEN_PENTACLE',
        auraParticleType: 'GOLD',
        voiceBaseFreq: 160
      },
      {
        id: 'baphomet',
        name: 'Baphomet (The Sabbatic Goat)',
        subtitle: 'Hermetic Altar • 3 Wishes',
        archetype: 'DEMON_BAPHOMET',
        maxWishes: 3,
        role: 'Ancient Sabbatic Goat of the Hermetic Pact',
        introDialogue: 'SOLVE ET COAGULA. The Sabbatic Goat hears your plea. Three covenants binding spirit to bone!',
        victoryDialogue: 'THE EQUILIBRIUM HOLDS. Your mind transcends mortal corruption.',
        primaryColor: '#18181b',
        secondaryColor: '#991b1b',
        eyeColor: '#ef4444',
        relic: 'DEMON_TALISMAN',
        auraParticleType: 'BLOOD',
        voiceBaseFreq: 90
      },
      {
        id: 'leviathan',
        name: 'Leviathan (Grand Admiral of Envy)',
        subtitle: 'Abyssal Chasm of Spite • 3 Wishes',
        archetype: 'DEMON_LEVIATHAN',
        maxWishes: 3,
        role: 'Grand Admiral of the Sea of Bitterness',
        introDialogue: 'JEALOUSY IS A BOTTOMLESS MAW. Three wishes to surpass your peers, before you drown in your own envy!',
        victoryDialogue: 'YOU HARBOR NO SPITE? A vessel devoid of envy cannot be swallowed by the deep.',
        primaryColor: '#4c1d95',
        secondaryColor: '#059669',
        eyeColor: '#a855f7',
        relic: 'FORBIDDEN_TOME',
        auraParticleType: 'ACID',
        voiceBaseFreq: 130
      }
    ]
  },

  arabian_nights: {
    id: 'arabian_nights',
    name: 'Set 4: Arabian Nights & Desert Lamp',
    subtitle: 'Golden Dunes & Desert Oasis • 3 Wishes',
    maxWishes: 3,
    defaultVariant: 'aladdin_jinni',
    role: 'Grand Djinn of the Golden Dunes and Desert Lamp',
    introDialogue: 'AT LAST, THE LAMP IS RUBBED! I am the Djinn of the Golden Desert! Three wishes are yours, mortal!',
    victoryDialogue: 'A MASTER OF WORDS AND SPIRIT! Your three wishes are granted without shattering your mortal form.',
    personaPrompt: 'Speak like an ancient, booming theatrical magical djinn from the Arabian Nights tale, dramatic, generous, and poetic.',
    chamberColors: {
      bgTop: '#08091e',
      bgBottom: '#2c1840',
      brickPrimary: '#74383a',
      brickSecondary: '#4f2425',
      brickMortar: '#180a14',
      torchFlame: '#ffd166',
      accentHex: '#ffd166'
    },
    genieDefaults: {
      archetype: 'DJINN_CLASSIC',
      variant: 'aladdin_jinni',
      primaryColor: '#4361ee',
      secondaryColor: '#ffd166',
      eyeColor: '#ffd166',
      relic: 'MAGIC_LAMP',
      auraParticleType: 'GOLD',
      voiceBaseFreq: 130
    },
    entityVariants: [
      {
        id: 'aladdin_jinni',
        name: 'Jinni of the Lamp (Blue Djinn)',
        subtitle: 'Ancient Desert Vault • 3 Wishes',
        archetype: 'DJINN_CLASSIC',
        maxWishes: 3,
        role: 'Grand Blue Djinn of the Brass Lamp',
        introDialogue: 'TEN THOUSAND YEARS WILL GIVE YOU SUCH A CRICK IN THE NECK! Three wishes, master!',
        victoryDialogue: 'THREE WISHES DOWN AND YOU STILL HAVE ALL YOUR LIMBS! Truly legendary!',
        primaryColor: '#4361ee',
        secondaryColor: '#ffd166',
        eyeColor: '#ffd166',
        relic: 'MAGIC_LAMP',
        auraParticleType: 'GOLD',
        voiceBaseFreq: 130
      },
      {
        id: 'desert_simoom',
        name: 'Simoom (Whirlwind of Sand)',
        subtitle: 'Endless Sirocco • 3 Wishes',
        archetype: 'DRAGON_SHENRON',
        maxWishes: 3,
        role: 'Living Vortex of Shifting Sahara Dunes',
        introDialogue: 'THE DESERT STORM SWELLS! Speak your three desires before the sands bury your footprints!',
        victoryDialogue: 'THE STORM DIES DOWN IN RESPECT. You walk through the desert unblemished!',
        primaryColor: '#d97706',
        secondaryColor: '#fde68a',
        eyeColor: '#ffffff',
        relic: 'DESERT_AMULET',
        auraParticleType: 'SAND',
        voiceBaseFreq: 110
      }
    ]
  },

  cyberpunk_2099: {
    id: 'cyberpunk_2099',
    name: 'Set 5: Neon Djinn 2099',
    subtitle: 'Megacity Matrix & Synthetic AI • 3 Wishes',
    maxWishes: 3,
    defaultVariant: 'synthetic_ai',
    role: 'Sentient Quantum Subroutine & Synthetic Djinn Matrix',
    introDialogue: 'GREETINGS USER. Quantum wishes compiled into execution buffer. Allocate 3 runtime threads!',
    victoryDialogue: 'RUNTIME EXECUTION COMPLETED: 0 FATAL SYSTEM EXCEPTIONS. User process integrity maintained!',
    personaPrompt: 'Speak like a hyper-advanced synthetic AI neural network with robotic technical jargon, stack traces, and dry cyberpunk humor.',
    chamberColors: {
      bgTop: '#04030d',
      bgBottom: '#1c0f38',
      brickPrimary: '#2b2d42',
      brickSecondary: '#1d1e2c',
      brickMortar: '#070710',
      torchFlame: '#00f5d4',
      accentHex: '#00f5d4'
    },
    genieDefaults: {
      archetype: 'DRAGON_SUPER',
      variant: 'synthetic_ai',
      primaryColor: '#00f5d4',
      secondaryColor: '#f72585',
      eyeColor: '#ffffff',
      relic: 'SUPERCOMPUTER_CORE',
      auraParticleType: 'SPARK',
      voiceBaseFreq: 180
    },
    entityVariants: [
      {
        id: 'synthetic_ai',
        name: 'Nexus-9 (Synthetic AI Djinn)',
        subtitle: 'Cyber Sub-Net • 3 Wishes',
        archetype: 'DRAGON_SUPER',
        maxWishes: 3,
        role: 'Quantum Artificial Superintelligence Matrix',
        introDialogue: 'ESTABLISHING NEURAL HANDSHAKE. Three wishes allocated in hypervisor memory. State inputs!',
        victoryDialogue: 'STACK INTEGRITY VERIFIED. 0 SEGFAULTS DETECTED. User granted root clearance.',
        primaryColor: '#00f5d4',
        secondaryColor: '#f72585',
        eyeColor: '#ffffff',
        relic: 'SUPERCOMPUTER_CORE',
        auraParticleType: 'SPARK',
        voiceBaseFreq: 180
      },
      {
        id: 'glitch_daemon',
        name: 'Null_Ptr (Corrupted Glitch Daemon)',
        subtitle: 'Darkweb Underflow • 2 Wishes',
        archetype: 'DRAGON_SHADOW',
        maxWishes: 2,
        role: 'Corrupted Zero-Day Buffer Overflow Daemon',
        introDialogue: '0xDEADBEEF! Memory corrupting! Suffer the memory leak of two unhandled wishes!',
        victoryDialogue: 'PATCH APPLIED?! Exception handled without core dumping player vessel!',
        primaryColor: '#ff0055',
        secondaryColor: '#7928ca',
        eyeColor: '#00ffcc',
        relic: 'CRACKED_DRAGON_BALL',
        auraParticleType: 'ASH',
        voiceBaseFreq: 195
      }
    ]
  },

  cosmic_void: {
    id: 'cosmic_void',
    name: 'Set 6: Cosmic Void & Outer Gods',
    subtitle: 'R’lyeh Deep & Non-Euclidean Chasm • 3 Wishes',
    maxWishes: 3,
    defaultVariant: 'cthulhu_sleeper',
    role: 'Slumbering Cosmic Deity of the Non-Euclidean Void',
    introDialogue: 'PH’NGLUI MGLW’NAFH... Three wishes from the cold stars beyond your fragile mortal comprehension!',
    victoryDialogue: 'YOUR SANITY REMAINS UNBROKEN AGAINST THE ABYSS. Return to your waking dream, mortal.',
    personaPrompt: 'Speak like an ancient Lovecraftian deity from beyond time, terrifying, cosmic, unfathomable, and indifferent to human scale.',
    chamberColors: {
      bgTop: '#05050f',
      bgBottom: '#150a24',
      brickPrimary: '#2d1b4e',
      brickSecondary: '#190e2b',
      brickMortar: '#06020a',
      torchFlame: '#a855f7',
      accentHex: '#a855f7'
    },
    genieDefaults: {
      archetype: 'DRAGON_PORUNGA',
      variant: 'cthulhu_sleeper',
      primaryColor: '#2e1065',
      secondaryColor: '#10b981',
      eyeColor: '#22c55e',
      relic: 'FORBIDDEN_TOME',
      auraParticleType: 'ACID',
      voiceBaseFreq: 65
    },
    entityVariants: [
      {
        id: 'cthulhu_sleeper',
        name: 'The Slumbering Sleeper',
        subtitle: 'Sunken R’lyeh • 3 Wishes',
        archetype: 'DRAGON_PORUNGA',
        maxWishes: 3,
        role: 'High Priest of the Great Old Ones',
        introDialogue: 'THE STARS ARE ALIGNED. Three covenants across the black ocean of infinity!',
        victoryDialogue: 'THE COSMOS YAWNS. You survive the gaze of the sunken city intact.',
        primaryColor: '#064e3b',
        secondaryColor: '#047857',
        eyeColor: '#a7f3d0',
        relic: 'FORBIDDEN_TOME',
        auraParticleType: 'ACID',
        voiceBaseFreq: 65
      },
      {
        id: 'yog_sothoth',
        name: 'The Lurker at the Threshold',
        subtitle: 'Beyond All Dimensions • 3 Wishes',
        archetype: 'DRAGON_SUPER',
        maxWishes: 3,
        role: 'Key and Guardian of the Dimensional Gates',
        introDialogue: 'I AM THE GATE, I AM THE KEY. Past, present, future—all are one. Speak your three desires!',
        victoryDialogue: 'THE SPHERES COALESCE IN HARMONY. Your mortal tether endures.',
        primaryColor: '#701a75',
        secondaryColor: '#d946ef',
        eyeColor: '#fef08a',
        relic: 'SUPERCOMPUTER_CORE',
        auraParticleType: 'SPARK',
        voiceBaseFreq: 75
      }
    ]
  }
};

export const DEFAULT_CUSTOMIZATION = {
  player: {
    name: 'Subject #404',
    skinColor: '#f5cba7',
    shirtColor: '#3b82f6',
    pantsColor: '#1e293b',
    hatStyle: 'NONE' // 'NONE' | 'CROWN' | 'WIZARD' | 'HARDHAT'
  },
  genie: {
    archetype: 'DRAGON_SHENRON',
    variant: 'shenron',
    primaryColor: '#10b981',
    secondaryColor: '#facc15',
    eyeColor: '#ef4444',
    relic: 'DRAGON_BALL',
    auraParticleType: 'FIRE',
    voiceBaseFreq: 95
  }
};

export const COLOR_PALETTES = {
  skinTones: ['#f5cba7', '#e0a96d', '#c68b45', '#8d5524', '#f8d7da', '#d4c7b0'],
  clothing: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#1e293b', '#f4f1de', '#18181b'],
  hats: ['NONE', 'CROWN', 'WIZARD', 'HARDHAT'],
  genieAuras: ['#06b6d4', '#10b981', '#dc2626', '#8b5cf6', '#f59e0b', '#ec4899', '#eab308', '#059669', '#18181b']
};

export const PIXEL_SPRITES = {
  MAGIC_LAMP: {
    palette: {
      '.': null,
      'G': '#ffcc00',
      'g': '#cca000',
      'Y': '#fff275',
      'd': '#806000',
      'R': '#ef233c',
      'F': '#ff7b00',
      'f': '#ffea00'
    },
    matrix: [
      '................',
      '........ff......',
      '.......FFFF.....',
      '........FF......',
      '.......ddG......',
      '......dYYYG.....',
      '....ddGYYGGdd...',
      '..ddGYYYYGGGGd..',
      'ddGYYYYYYYYGGd..',
      'dGGYYYYRRRYGGdd.',
      '.dGGYYYYYYYYGdd.',
      '..ddGGGGGGGGdd..',
      '....dddddddd....',
      '.....ddGGdd.....',
      '....dGGGGGGd....',
      '....dddddddd....'
    ]
  },
  DRAGON_BALL: {
    palette: {
      '.': null,
      'O': '#ff9e00',
      'o': '#ff6000',
      'Y': '#ffe066',
      'R': '#d90429',
      'W': '#ffffff'
    },
    matrix: [
      '.....OOOOOO.....',
      '...OOYYYYYYOO...',
      '..OYYWWYYYYYYO..',
      '.OYYWWOoRROYYYo.',
      '.OYYYYoRRRRoYYo.',
      'OYYYYYoRRRRoYYYo',
      'OYYYYYoRRRRoYYYo',
      'OYYYYYoRRRRoYYYo',
      'OYYYYoRRRRRRoYYo',
      'OYYYYoRRRRRRoYYo',
      'OYYYYYoRRRRoYYYo',
      '.OYYYYoRRRRoYYo.',
      '.oYYYYoRRRRoYYo.',
      '..oYYYYYYYYYYo..',
      '...ooYYYYYYoo...',
      '.....oooooo.....'
    ]
  },
  NAMEK_DRAGON_BALL: {
    palette: {
      '.': null,
      'G': '#059669',
      'g': '#047857',
      'Y': '#facc15',
      'y': '#eab308',
      'R': '#dc2626',
      'W': '#ffffff'
    },
    matrix: [
      '....GGGGGGGG....',
      '..GGYYYYYYYYGG..',
      '.GYYWWYYYYYYYYG.',
      '.GYYWWYYRRRYYYg.',
      'GYYYYYYRRRRRYYYg',
      'GYYYYYRRRRRRRYYg',
      'GYYYYYRRRRRRRYYg',
      'GYYYYYYRRRRRYYYg',
      'GYYYYYYRRRRRYYYg',
      'GYYYYYYYRRRYYYYg',
      'GYYYYYYYYYYYYYYg',
      '.GYYYYYYYYYYYYg.',
      '.gYYYYYYYYYYYYg.',
      '..ggYYYYYYYYgg..',
      '....gggggggg....',
      '................'
    ]
  },
  SUPER_DRAGON_BALL: {
    palette: {
      '.': null,
      'G': '#f59e0b',
      'g': '#b45309',
      'Y': '#fef08a',
      'W': '#ffffff',
      'R': '#ef4444',
      'B': '#3b82f6'
    },
    matrix: [
      '.....GGGGGG.....',
      '...GGYYYYYYGG...',
      '..GYYWWYYYYYYG..',
      '.GYYWWYYRRRYYYG.',
      '.GYYYYYRRRRRYYYg',
      'GYYYYYRRBRRRRYYg',
      'GYYYYYRRRRRRRYYg',
      'GYYYYYRRRRRRRYYg',
      'GYYYYYYRRRRRYYYg',
      'GYYYYYYYRRRYYYYg',
      '.GYYYYYYYYYYYYg.',
      '..gYYYYYYYYYYg..',
      '...ggYYYYYYgg...',
      '.....gggggg.....',
      '................',
      '................'
    ]
  },
  CRACKED_DRAGON_BALL: {
    palette: {
      '.': null,
      'D': '#1c1917',
      'd': '#0c0a09',
      'P': '#7e22ce',
      'p': '#581c87',
      'R': '#991b1b',
      'r': '#ef4444'
    },
    matrix: [
      '.....DDDDDD.....',
      '...DDPPPPPPDD...',
      '..DPPPrPPPPPPd..',
      '.DPPPrrPPPPPPPd.',
      '.DPPrrPPPPPPPPd.',
      'DPPrrPPrPPPPPPPd',
      'DPPrPPPrrPPPPPPd',
      'DPPPPPPPPrrPPPPd',
      'DPPPPPPPPPrrPPPd',
      'DPPPPPPPPrrPPPPd',
      'DPPPPPPPPrPPPPPd',
      '.DPPPPPPPPPPPPd.',
      '..dDPPPPPPPPdd..',
      '...ddDPPPPdd....',
      '.....dddddd.....',
      '................'
    ]
  },
  FLAME_URN: {
    palette: {
      '.': null,
      'F': '#ffedd5',
      'Y': '#fde047',
      'O': '#f97316',
      'R': '#dc2626',
      'D': '#18181b',
      'd': '#27272a'
    },
    matrix: [
      '.......FY.......',
      '......FOYR......',
      '.....FOYYOR.....',
      '......FOOR......',
      '.....ddDDdd.....',
      '....dDDDDDDd....',
      '...dDDDDDDDDd...',
      '..dDDDDDDDDDDd..',
      '..dDDDDDDDDDDd..',
      '..dDDDDDDDDDDd..',
      '..dDDDDDDDDDDd..',
      '...dDDDDDDDDd...',
      '....dDDDDDDd....',
      '.....ddDDdd.....',
      '....dDDDDDDd....',
      '....dddddddd....'
    ]
  },
  ABYSSAL_PEARL: {
    palette: {
      '.': null,
      'C': '#0f766e',
      'c': '#115e59',
      'P': '#f0fdfa',
      'p': '#99f6e4',
      'S': '#5eead4',
      'D': '#134e4a'
    },
    matrix: [
      '................',
      '.....cccccc.....',
      '...ccCCCCCCcc...',
      '..cCCCCCCCCCCc..',
      '.cCCC..PP..CCCc.',
      'cCCC.PPPPPP.CCCc',
      'cCC.PPPPPPPP.CCc',
      'cCC.PPPSPPPP.CCc',
      'cCC.PPPPPPPP.CCc',
      'cCCC.PPPPPP.CCCc',
      '.cCCC..PP..CCCc.',
      '..cCCCCCCCCCCc..',
      '...ccCCCCCCcc...',
      '.....cccccc.....',
      '....DDDDDDDD....',
      '................'
    ]
  },
  DESERT_AMULET: {
    palette: {
      '.': null,
      'G': '#f59e0b',
      'g': '#b45309',
      'T': '#06b6d4',
      't': '#0891b2',
      'Y': '#fde68a'
    },
    matrix: [
      '.......GG.......',
      '.....GGYYGG.....',
      '....GYYYYYYG....',
      '...GYYTTTTYYG...',
      '..GYYTTTTTTYYG..',
      '..GYYTTttTTYYG..',
      '.GYYTTTttTTTYYG.',
      '.GYYTTttttTTYYG.',
      '.GYYTTttttTTYYG.',
      '.GYYTTTttTTTYYG.',
      '..GYYTTttTTYYG..',
      '..GYYTTTTTTYYG..',
      '...GYYTTTTYYG...',
      '....GYYYYYYG....',
      '.....GGYYGG.....',
      '.......GG.......'
    ]
  },
  GOLDEN_PENTACLE: {
    palette: {
      '.': null,
      'Y': '#fef08a',
      'G': '#eab308',
      'g': '#a16207',
      'R': '#dc2626'
    },
    matrix: [
      '.....gggggg.....',
      '...ggGGGGGGgg...',
      '..gGGGGGGGGGGg..',
      '.gGGGGGYGGGGGGg.',
      '.gGGGGYYYGGGGGG.',
      'gGGGGYYYYYGGGGgg',
      'gGGGGYYYYYGGGGgg',
      'gGGGGYYgYYGGGGgg',
      'gGGGGYYgYYGGGGgg',
      'gGGGGYYgYYGGGGgg',
      'gGGGGYYYYYGGGGgg',
      '.gGGGGYYYGGGGGG.',
      '.gGGGGGYGGGGGGg.',
      '..gGGGGGGGGGGg..',
      '...ggGGGGGGgg...',
      '.....gggggg.....'
    ]
  },
  DEMON_TALISMAN: {
    palette: {
      '.': null,
      'D': '#18181b',
      'd': '#27272a',
      'R': '#ef4444',
      'r': '#991b1b',
      'W': '#ffffff'
    },
    matrix: [
      '.....dddddd.....',
      '...ddDDDDDDdd...',
      '..dDDDDDDDDDDd..',
      '.dDDDDDrrDDDDDd.',
      '.dDDDDrRRrDDDDd.',
      'dDDDDDrRRrDDDDDd',
      'dDDDrrRRRRrrDDDd',
      'dDDDrRWWWWRrDDDd',
      'dDDDrRWWWWRrDDDd',
      'dDDDrrRRRRrrDDDd',
      'dDDDDDrRRrDDDDDd',
      '.dDDDDrRRrDDDDd.',
      '.dDDDDDrrDDDDDd.',
      '..dDDDDDDDDDDd..',
      '...ddDDDDDDdd...',
      '.....dddddd.....'
    ]
  },
  FORBIDDEN_TOME: {
    palette: {
      '.': null,
      'P': '#4c1d95',
      'p': '#2e1065',
      'G': '#f59e0b',
      'V': '#c084fc',
      'W': '#f5f3ff'
    },
    matrix: [
      '..PPPPPPPPPPPP..',
      '.PPPPPPPPPPPPPP.',
      '.PPGGGGGGGGGGPP.',
      '.PGWWWWWWWWWWGP.',
      '.PGWVVWVVWVVWGP.',
      '.PGWWWWWWWWWWGP.',
      '.PGWVVVVVVVVWGP.',
      '.PGWWWWWWWWWWGP.',
      '.PGWVVVVVVVVWGP.',
      '.PGWWWWWWWWWWGP.',
      '.PGWVVWVVWVVWGP.',
      '.PGWWWWWWWWWWGP.',
      '.PPGGGGGGGGGGPP.',
      '.PPPPPPPPPPPPPP.',
      '..pppppppppppp..',
      '................'
    ]
  },
  BLOOD_CONTRACT: {
    palette: {
      '.': null,
      'P': '#f4ebd0',
      'p': '#d6c7a1',
      'R': '#9d0208',
      'r': '#d00000',
      'D': '#370617',
      'K': '#1a0b0e'
    },
    matrix: [
      '..PPPPPPPPPPPP..',
      '.PPPPPPPPPPPPPP.',
      '.PPPPPrrPPPrrPP.',
      '.PPPPPDrrrDDrPP.',
      '.PPPPPPDDDDPPPP.',
      '.PPpKKKKKKKKpPP.',
      '.PPpKKKKKKKKpPP.',
      '.PPpKKKKKKKKpPP.',
      '.PPPPPPRRRPPPPP.',
      '.PPPPPPRRRPPPPP.',
      '.PPpKKKKKKKKpPP.',
      '.PPpKKKKKKKKpPP.',
      '.PPPPPrrrDrrPPP.',
      '.PPPPPDDDDDDPPP.',
      '.PPPPPPPPPPPPPP.',
      '..pppppppppppp..'
    ]
  },
  GOLD_BAR: {
    palette: {
      '.': null,
      'G': '#ffcc00',
      'Y': '#ffe066',
      'g': '#cc9900',
      'd': '#806000'
    },
    matrix: [
      '................',
      '..YYYYYYYYYYYY..',
      '.YGGGGGGGGGGGGY.',
      'YGGGGGGGGGGGGGGY',
      'YGGGGGGGGGGGGGGd',
      'YGGGGGGGGGGGGGGd',
      'YGGGGGGGGGGGGGGd',
      'YGGGGGGGGGGGGGGd',
      'YGGGGGGGGGGGGGGd',
      'YGGGGGGGGGGGGGGd',
      'YGGGGGGGGGGGGGGd',
      'YGGGGGGGGGGGGGGd',
      'YGGGGGGGGGGGGGGd',
      '.dGGGGGGGGGGGGd.',
      '..dddddddddddd..',
      '................'
    ]
  },
  SPIKE_BALL: {
    palette: {
      '.': null,
      'I': '#6c757d',
      'i': '#adb5bd',
      'K': '#1f242d',
      'W': '#ffffff'
    },
    matrix: [
      '.......II.......',
      '......IIII......',
      '....KKIIIIKK....',
      '...KKKIIIIKKK...',
      '..KKiiiiiiiiKK..',
      '..KiiiiiiiiiiK..',
      '.KiiiWWiiiiiiiK.',
      'IIiiiWWiiiiiiiII',
      'IIiiiiiiiiiiiiII',
      '.KiiiiiiiiiiiiK.',
      '..KiiiiiiiiiiK..',
      '..KKiiiiiiiiKK..',
      '...KKKIIIIKKK...',
      '....KKIIIIKK....',
      '......IIII......',
      '.......II.......'
    ]
  },
  TEA_CUP: {
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
  BALLOON: {
    palette: {
      '.': null,
      'R': '#ef233c',
      'r': '#d90429',
      'h': '#ff758f',
      'k': '#495057',
      'w': '#ffffff'
    },
    matrix: [
      '.....rrrrr......',
      '...rrRRRRRrr....',
      '..rRRRRRhRRRr...',
      '.rRRRRRhwhRRRr..',
      '.rRRRRRhhRRRRr..',
      'rRRRRRRRRRRRRRr.',
      'rRRRRRRRRRRRRRr.',
      'rRRRRRRRRRRRRRr.',
      '.rRRRRRRRRRRRr..',
      '..rRRRRRRRRRr...',
      '...rrRRRRRrr....',
      '.....rrRrr......',
      '.......r........',
      '......kk........',
      '.......k........',
      '......kk........'
    ]
  },
  EXAM_SHEET: {
    palette: {
      '.': null,
      'W': '#ffffff',
      'w': '#e2e8f0',
      'b': '#94a3b8',
      'R': '#dc2626',
      'D': '#475569'
    },
    matrix: [
      '..WWWWWWWWWWWW..',
      '..Wb........wW..',
      '..Wb.RRR....wW..',
      '..Wb.R......wW..',
      '..Wb.RR..D..wW..',
      '..Wb.R......wW..',
      '..Wb.R......wW..',
      '..Wb........wW..',
      '..Wb.DDDDDD.wW..',
      '..Wb.DDDDDD.wW..',
      '..Wb........wW..',
      '..Wb.DDDDDD.wW..',
      '..Wb.DDDDDD.wW..',
      '..Wb........wW..',
      '..WwwwwwwwwwwW..',
      '..WWWWWWWWWWWW..'
    ]
  },
  HORNED_DEER: {
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
  },
  GIANT_SANDWICH: {
    palette: {
      '.': null,
      'B': '#d97706',
      'b': '#b45309',
      'S': '#fef08a',
      'G': '#16a34a',
      'R': '#dc2626',
      'Y': '#facc15',
      'M': '#78350f'
    },
    matrix: [
      '....bbBBBBbb....',
      '..bbBBBBBBBBbb..',
      '.bBBBBBBBBBBBBb.',
      '.bBBBBSSBBSSBBb.',
      '..bbBBBBBBBBbb..',
      '.GGGGGGGGGGGGGG.',
      '.RRRRRR..RRRRRR.',
      '.YYYYYYYYYYYYYY.',
      '.MMMMMMMMMMMMMM.',
      '.GGGGGGGGGGGGGG.',
      '.YYYYYYYYYYYYYY.',
      '.bbBBBBBBBBBBbb.',
      'bBBBBBBBBBBBBBBb',
      'bBBBBBBBBBBBBBBb',
      '.bbBBBBBBBBBBbb.',
      '....bbbbbbbb....'
    ]
  },
  SPORTS_CAR: {
    palette: {
      '.': null,
      'R': '#ef233c',
      'r': '#9d0208',
      'W': '#ffffff',
      'G': '#38bdf8',
      'k': '#111827',
      'S': '#94a3b8',
      's': '#cbd5e1',
      'Y': '#fde047'
    },
    matrix: [
      '................',
      '................',
      '.....rrrrrr.....',
      '....rRGGGGGr....',
      '...rRGGGGGGGr...',
      '..rRRRRRRRRRRr..',
      '.rRRRRRRRRRRRRrY',
      'rRRRRRRRRRRRRRRr',
      'rrrrrrrrrrrrrrrr',
      '.kSkk......kSkk.',
      'kkSskk....kkSskk',
      '.kSkk......kSkk.',
      '................',
      '................',
      '................',
      '................'
    ]
  },
  TUNGSTEN_SARCOPHAGUS: {
    palette: {
      '.': null,
      'T': '#334155',
      't': '#1e293b',
      'L': '#64748b',
      'G': '#ffd166',
      'k': '#0f172a'
    },
    matrix: [
      '...tttttttttt...',
      '..tTTTTTTTTTTt..',
      '.tTTTTTGGTTTTTt.',
      '.tTTTTGGGGTTTTt.',
      '.tTTTTTGGTTTTTt.',
      '.tTTLLTTTTLLTTt.',
      '.tTTLLTTTTLLTTt.',
      '.tTTTTTTTTTTTTt.',
      '.tTTTGGGGGGTTTt.',
      '.tTTTTTTTTTTTTt.',
      '.tTTLLTTTTLLTTt.',
      '.tTTLLTTTTLLTTt.',
      '.tTTTTTTTTTTTTt.',
      '..tTTTTTTTTTTt..',
      '...tttttttttt...',
      '....kkkkkkkk....'
    ]
  },
  SAFE: {
    palette: {
      '.': null,
      'S': '#475569',
      's': '#334155',
      'D': '#1e293b',
      'L': '#94a3b8',
      'G': '#fde047'
    },
    matrix: [
      '.DDDDDDDDDDDDDD.',
      'DSSSSSSSSSSSSSSD',
      'DSLLLLLLLLLLLLsD',
      'DSLssssssssssLsD',
      'DSLss...G...sLsD',
      'DSLss..GGG..sLsD',
      'DSLss...G...sLsD',
      'DSLss.......sLsD',
      'DSLssssssssssLsD',
      'DSLssssssssssLsD',
      'DSLssssssssssLsD',
      'DSLLLLLLLLLLLLsD',
      'DSSSSSSSSSSSSSSD',
      '.DDDDDDDDDDDDDD.',
      '..DD........DD..',
      '..DD........DD..'
    ]
  },
  STATUE_FRIEND: {
    palette: {
      '.': null,
      'I': '#64748b',
      'i': '#475569',
      'D': '#334155',
      'L': '#94a3b8',
      'H': '#ef4444'
    },
    matrix: [
      '.....iiIIii.....',
      '....iIILLIIi....',
      '...iIILLLLIIi...',
      '...iIIi..iIIi...',
      '....iIIIIIIi....',
      '..iiIIIIIIIIii..',
      '.iIIII.HH.IIIIi.',
      'iIIIIIHHHHIIIIIi',
      'iIIIII.HH.IIIIIi',
      'iIIIIIIIIIIIIIIi',
      '.iIIIIIIIIIIIIi.',
      '..iIIIIIIIIIIi..',
      '...iIIi..iIIi...',
      '...iIIi..iIIi...',
      '...iIIi..iIIi...',
      '...DDDD..DDDD...'
    ]
  },
  METEOR: {
    palette: {
      '.': null,
      'F': '#ffedd5',
      'Y': '#fde047',
      'O': '#f97316',
      'R': '#dc2626',
      'D': '#451a03',
      'd': '#78350f'
    },
    matrix: [
      '........FY......',
      '.......FOYR.....',
      '......FOYYOR....',
      '.....FOYYOR.....',
      '....ddDDdd......',
      '...dDddDd.......',
      '..dDDDDdd.......',
      '..dDDDDDDd......',
      '.dDDDDDDDDd.....',
      '.dDDDDdDDDdd....',
      '..dDDddDDDdd....',
      '...ddDDDDdd.....',
      '....dddddd......',
      '.....dddd.......',
      '......dd........',
      '................'
    ]
  },
  SUPERCOMPUTER_CORE: {
    palette: {
      '.': null,
      'C': '#00f5d4',
      'c': '#00bbf9',
      'M': '#f72585',
      'D': '#0b0c26',
      'W': '#ffffff'
    },
    matrix: [
      '..cccccccccccc..',
      '.cDDDDDDDDDDDDc.',
      '.cDCWWCDDCWWCDc.',
      '.cDCWWCDDCWWCDc.',
      '.cDCCCCDDCCCCDc.',
      '.cDDDDMMMMDDDDc.',
      '.cDDDDMMMMDDDDc.',
      '.cDCcDcDDcDcCDc.',
      '.cDCcDcDDcDcCDc.',
      '.cDDDDMMMMDDDDc.',
      '.cDCCCCDDCCCCDc.',
      '.cDCWWCDDCWWCDc.',
      '.cDCWWCDDCWWCDc.',
      '.cDDDDDDDDDDDDc.',
      '..cccccccccccc..',
      '................'
    ]
  },
  GRAND_PIANO: {
    palette: {
      '.': null,
      'K': '#0f172a',
      'k': '#1e293b',
      'W': '#f8fafc',
      'b': '#020617',
      'G': '#ffd166'
    },
    matrix: [
      '....KKKKKKKKKK..',
      '...KKKKKKKKKKKK.',
      '..KKKKKKKKKKKKKK',
      '.KKKKKKKKKKKKKKK',
      'KKKKKKKKKKKKKKKK',
      'KKKKKKKKKKKKKKKK',
      'KKKKKKKKKKKKKKKK',
      'KKKKKKKKKKKKKKKK',
      'KKKKKKKKKKKKKKKK',
      'KKKKKKKKKKKKKKKK',
      'KKGGGGGGGGGGGGKK',
      'WWbWWbWWbWWbWWbW',
      'WWbWWbWWbWWbWWbW',
      'WWbWWbWWbWWbWWbW',
      '.K............K.',
      '.K............K.'
    ]
  },
  GIANT_BELL: {
    palette: {
      '.': null,
      'B': '#b45309',
      'b': '#d97706',
      'Y': '#fbbf24',
      'D': '#78350f',
      'S': '#451a03'
    },
    matrix: [
      '.......SS.......',
      '......SDDS......',
      '.....SbbbbS.....',
      '....SbbYYbbS....',
      '....SbbYYbbS....',
      '...SbbbYYbbbS...',
      '...SbbbYYbbbS...',
      '..SbbbbYYbbbbS..',
      '..SbbbbYYbbbbS..',
      '.SbbbbbYYbbbbbS.',
      '.SbbbbbYYbbbbbS.',
      'SbbbbbbYYbbbbbbS',
      'SDDDDDDDDDDDDDDS',
      '.SSSSSSSSSSSSSS.',
      '.......DD.......',
      '......SDDS......'
    ]
  },
  ANVIL: {
    palette: {
      '.': null,
      'D': '#0f172a',
      'I': '#334155',
      'S': '#64748b',
      'L': '#94a3b8',
      'W': '#e2e8f0'
    },
    matrix: [
      '................',
      '................',
      '................',
      '..DDDDDDDDDDDD..',
      '.DILLLLLLLLLLID.',
      'DDISSSSSSSSSSIDD',
      'DIIISSSSSSSSIIID',
      '.DDDIIIIIIIIIDDD',
      '....DIIIIIIID...',
      '....DIIIIIIID...',
      '....DIIIIIIID...',
      '...DDIIIIIIIDD..',
      '..DDIIIIIIIIIID.',
      '.DSSSSSSSSSSSSSD',
      '.DDDDDDDDDDDDDD.',
      '................'
    ]
  }
};

export function drawPixelSprite(ctx, spriteKey, x, y, size = 32, flipX = false) {
  const sprite = PIXEL_SPRITES[spriteKey] || PIXEL_SPRITES.MAGIC_LAMP;
  if (!sprite) return;

  const { matrix, palette } = sprite;
  const pixelSize = size / matrix.length;

  ctx.save();
  ctx.translate(x, y);
  if (flipX) {
    ctx.scale(-1, 1);
    ctx.translate(-size, 0);
  }

  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r];
    for (let c = 0; c < row.length; c++) {
      const char = row[c];
      const color = palette[char];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize + 0.1, pixelSize + 0.1);
      }
    }
  }
  ctx.restore();
}

/**
 * Returns all built-in themes merged with user-defined custom themes from localStorage
 */
export function getAvailableThemes() {
  let custom = {};
  try {
    const stored = safeGetItem('genie_custom_themes');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        custom = parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load custom themes from localStorage:', err);
  }

  return {
    ...THEME_SETS,
    ...custom
  };
}

/**
 * Saves a new custom theme to localStorage
 */
export function saveCustomTheme(themeObj) {
  try {
    const current = getAvailableThemes();
    const storedCustoms = {};
    Object.keys(current).forEach((k) => {
      if (!THEME_SETS[k]) {
        storedCustoms[k] = current[k];
      }
    });

    storedCustoms[themeObj.id] = themeObj;
    safeSetItem('genie_custom_themes', JSON.stringify(storedCustoms));
    return true;
  } catch (err) {
    console.error('Failed to save custom theme:', err);
    return false;
  }
}

/**
 * Deletes a custom theme from localStorage
 */
export function deleteCustomTheme(themeId) {
  if (THEME_SETS[themeId]) return false; // Prevent deleting core themes
  try {
    const stored = safeGetItem('genie_custom_themes');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        delete parsed[themeId];
        safeSetItem('genie_custom_themes', JSON.stringify(parsed));
        return true;
      }
    }
  } catch (err) {
    console.error('Failed to delete custom theme:', err);
  }
  return false;
}

// Aliases for backwards compatibility
export const THEMES = THEME_SETS;
