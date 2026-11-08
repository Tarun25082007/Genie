// 3 Theme Sets (Djinn, Shenron, Corporate Demon) + Customizer Data & 16x16 Pixel Matrices

export const THEME_SETS = {
  djinn_classic: {
    id: 'djinn_classic',
    name: 'Set 1: Al-Qadim the Literal Djinn',
    subtitle: 'Ancient Brass Lamp Chamber • 3 Wishes',
    maxWishes: 3,
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
      archetype: 'DJINN',
      primaryColor: '#06b6d4',
      secondaryColor: '#f59e0b',
      eyeColor: '#fef08a',
      auraParticleType: 'SPARK',
      voiceBaseFreq: 135
    }
  },
  shenron_dragon: {
    id: 'shenron_dragon',
    name: 'Set 2: Shenlong the Eternal Dragon',
    subtitle: 'Sacred Kami Lookout Shrine • 2 Wishes',
    maxWishes: 2,
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
      archetype: 'DRAGON',
      primaryColor: '#10b981',
      secondaryColor: '#facc15',
      eyeColor: '#ef4444',
      auraParticleType: 'FIRE',
      voiceBaseFreq: 95
    }
  },
  corporate_demon: {
    id: 'corporate_demon',
    name: 'Set 3: Malphas Esq., Senior Partner',
    subtitle: '9th Circle Boardroom & Tort Law Dungeon • 3 Wishes',
    maxWishes: 3,
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
      archetype: 'DEMON',
      primaryColor: '#dc2626',
      secondaryColor: '#1f2937',
      eyeColor: '#fde047',
      auraParticleType: 'ASH',
      voiceBaseFreq: 175
    }
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
    primaryColor: '#06b6d4',
    secondaryColor: '#f59e0b',
    eyeColor: '#fef08a',
    auraParticleType: 'SPARK',
    voiceBaseFreq: 135
  }
};

export const COLOR_PALETTES = {
  skinTones: ['#f5cba7', '#e0a96d', '#c68b45', '#8d5524', '#f8d7da', '#d4c7b0'],
  clothing: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#1e293b', '#f4f1de', '#18181b'],
  hats: ['NONE', 'CROWN', 'WIZARD', 'HARDHAT'],
  genieAuras: ['#06b6d4', '#10b981', '#dc2626', '#8b5cf6', '#f59e0b', '#ec4899']
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
  }
};

export function drawPixelSprite(ctx, spriteKey, x, y, size = 32, flipX = false) {
  const sprite = PIXEL_SPRITES[spriteKey];
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

// Alias for backwards compatibility
export const THEMES = THEME_SETS;
