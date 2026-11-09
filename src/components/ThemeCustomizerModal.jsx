// Theme Selector (Sets 1-3 + Custom Themes) + Entity Variant Selector (Shenron, Porunga, etc.) + Live Preview
import React, { useState, useRef, useEffect } from 'react';
import {
  THEME_SETS,
  COLOR_PALETTES,
  DEFAULT_CUSTOMIZATION,
  getAvailableThemes,
  saveCustomTheme,
  deleteCustomTheme,
  drawPixelSprite,
  PIXEL_SPRITES
} from '../data/themes';
import { audioSynth } from '../engine/audioSynth';
import {
  Palette,
  X,
  RotateCcw,
  Check,
  Sparkles,
  Plus,
  Trash2,
  Wand2,
  Flame,
  Shield,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function ThemeCustomizerModal({
  currentThemeId,
  onSelectTheme,
  customization,
  onUpdateCustomization,
  onClose
}) {
  const previewCanvasRef = useRef(null);
  const [themes, setThemes] = useState(() => getAvailableThemes());
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  const activeTheme = themes[currentThemeId] || themes.djinn_classic || THEME_SETS.djinn_classic;

  const player = customization?.player || DEFAULT_CUSTOMIZATION.player;
  const genie = customization?.genie || activeTheme.genieDefaults || DEFAULT_CUSTOMIZATION.genie;

  // Form state for creating a brand new custom theme
  const [newThemeForm, setNewThemeForm] = useState({
    id: '',
    name: 'Custom Realm: Astral Oracle',
    subtitle: 'Astral Void • 3 Wishes',
    maxWishes: 3,
    role: 'Transcendent Astral Oracle of the Forgotten Cosmos',
    archetype: 'DRAGON_PORUNGA',
    introDialogue: 'MORTAL OF DUST... The Astral Gates have parted. State your three desires!',
    victoryDialogue: 'YOUR INTELLECT PIERCES THE VOID. Your wishes are sealed forever.',
    personaPrompt: 'Speak like an enigmatic cosmic oracle with mathematical precision and ruthless physics logic.',
    bgTop: '#0d0d1a',
    bgBottom: '#1a1a33',
    brickPrimary: '#2d2d59',
    brickSecondary: '#1f1f3d',
    brickMortar: '#0a0a14',
    torchFlame: '#818cf8',
    accentHex: '#818cf8',
    primaryColor: '#6366f1',
    secondaryColor: '#c084fc',
    eyeColor: '#38bdf8',
    relic: 'NAMEK_DRAGON_BALL',
    auraParticleType: 'SPARK',
    voiceBaseFreq: 110
  });

  // Refresh themes list from localStorage
  const refreshThemes = () => {
    const updated = getAvailableThemes();
    setThemes(updated);
  };

  // Live Interactive Preview Canvas
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background preview
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, activeTheme.chamberColors?.bgTop || '#061a14');
      grad.addColorStop(1, activeTheme.chamberColors?.bgBottom || '#0f2922');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor stone slab
      ctx.fillStyle = activeTheme.chamberColors?.brickPrimary || '#1e4638';
      ctx.fillRect(0, canvas.height - 24, canvas.width, 24);

      // 1. Render Custom Hero on Right
      const heroX = canvas.width * 0.74;
      const heroY = canvas.height - 35;

      // Boots
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(heroX - 8, heroY + 8, 6, 8);
      ctx.fillRect(heroX + 2, heroY + 8, 6, 8);

      // Pants
      ctx.fillStyle = player.pantsColor;
      ctx.fillRect(heroX - 7, heroY - 8, 14, 16);

      // Shirt
      ctx.fillStyle = player.shirtColor;
      ctx.fillRect(heroX - 10, heroY - 26, 20, 18);

      // Head
      ctx.fillStyle = player.skinColor;
      ctx.beginPath();
      ctx.arc(heroX, heroY - 36, 9, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#3d2618';
      ctx.beginPath();
      ctx.arc(heroX, heroY - 39, 9, Math.PI, 0);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(heroX - 4, heroY - 37, 2, 2);
      ctx.fillRect(heroX + 2, heroY - 37, 2, 2);

      // Hat Style
      if (player.hatStyle === 'CROWN') {
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.moveTo(heroX - 8, heroY - 45);
        ctx.lineTo(heroX - 8, heroY - 51);
        ctx.lineTo(heroX - 4, heroY - 47);
        ctx.lineTo(heroX, heroY - 53);
        ctx.lineTo(heroX + 4, heroY - 47);
        ctx.lineTo(heroX + 8, heroY - 51);
        ctx.lineTo(heroX + 8, heroY - 45);
        ctx.closePath();
        ctx.fill();
      } else if (player.hatStyle === 'WIZARD') {
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.ellipse(heroX, heroY - 45, 12, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(heroX - 8, heroY - 45);
        ctx.lineTo(heroX + 4, heroY - 60);
        ctx.lineTo(heroX + 8, heroY - 45);
        ctx.closePath();
        ctx.fill();
      } else if (player.hatStyle === 'HARDHAT') {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(heroX, heroY - 45, 11, 4, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(heroX - 12, heroY - 45, 24, 2);
      }

      // 2. Render Active Relic on Ground
      const relicKey = genie.relic || activeTheme.genieDefaults?.relic || 'MAGIC_LAMP';
      drawPixelSprite(ctx, relicKey, canvas.width * 0.28 - 14, canvas.height - 40, 28);

      // 3. Render Custom Genie Entity on Left with Archetype Specifics
      const genieX = canvas.width * 0.28;
      const genieY = canvas.height * 0.42 + Math.sin(frame * 0.08) * 5;
      const archetype = genie.archetype || activeTheme.genieDefaults?.archetype || 'DJINN_CLASSIC';
      const primary = genie.primaryColor;
      const secondary = genie.secondaryColor;

      // Aura Glow
      const aura = ctx.createRadialGradient(genieX, genieY, 5, genieX, genieY, 46);
      aura.addColorStop(0, primary + '88');
      aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(genieX, genieY, 46, 0, Math.PI * 2);
      ctx.fill();

      // Tail curve
      ctx.strokeStyle = primary;
      ctx.lineWidth = archetype.includes('DRAGON') ? 10 : 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(genieX, canvas.height - 35);
      ctx.quadraticCurveTo(genieX - 25, genieY + 35, genieX, genieY + 16);
      ctx.stroke();

      // Golden Wings for Super Shenron
      if (archetype === 'DRAGON_SUPER') {
        ctx.fillStyle = primary + 'cc';
        ctx.strokeStyle = secondary;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(genieX - 8, genieY);
        ctx.bezierCurveTo(genieX - 35, genieY - 24, genieX - 48, genieY - 6, genieX - 26, genieY + 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(genieX + 8, genieY);
        ctx.bezierCurveTo(genieX + 35, genieY - 24, genieX + 48, genieY - 6, genieX + 26, genieY + 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Torso
      ctx.fillStyle = primary;
      ctx.beginPath();
      if (archetype === 'DRAGON_PORUNGA') {
        ctx.ellipse(genieX, genieY + 7, 24, 16, 0, 0, Math.PI * 2);
      } else {
        ctx.ellipse(genieX, genieY + 8, 18, 14, 0, 0, Math.PI * 2);
      }
      ctx.fill();

      // Porunga Shoulder Spikes and Pectorals
      if (archetype === 'DRAGON_PORUNGA') {
        ctx.fillStyle = '#1e293b';
        // Left spike
        ctx.beginPath();
        ctx.moveTo(genieX - 24, genieY + 4);
        ctx.lineTo(genieX - 32, genieY - 5);
        ctx.lineTo(genieX - 20, genieY - 2);
        ctx.closePath();
        ctx.fill();
        // Right spike
        ctx.beginPath();
        ctx.moveTo(genieX + 24, genieY + 4);
        ctx.lineTo(genieX + 32, genieY - 5);
        ctx.lineTo(genieX + 20, genieY - 2);
        ctx.closePath();
        ctx.fill();
        // Muscle lines
        ctx.strokeStyle = secondary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(genieX - 9, genieY + 6, 6, 0.2, Math.PI - 0.2);
        ctx.arc(genieX + 9, genieY + 6, 6, 0.2, Math.PI - 0.2);
        ctx.stroke();
      } else {
        // Crossed Arms
        ctx.strokeStyle = secondary;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(genieX, genieY + 12, 14, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }

      // Head
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.arc(genieX, genieY - 14, archetype === 'DRAGON_PORUNGA' ? 14 : 12, 0, Math.PI * 2);
      ctx.fill();

      // Archetype Horns & Adornments
      if (archetype === 'DRAGON_PORUNGA') {
        // Curved Namekian Horns
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        // Left horn
        ctx.beginPath();
        ctx.moveTo(genieX - 9, genieY - 17);
        ctx.bezierCurveTo(genieX - 26, genieY - 18, genieX - 34, genieY - 30, genieX - 28, genieY - 36);
        ctx.bezierCurveTo(genieX - 22, genieY - 28, genieX - 14, genieY - 22, genieX - 6, genieY - 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Right horn
        ctx.beginPath();
        ctx.moveTo(genieX + 9, genieY - 17);
        ctx.bezierCurveTo(genieX + 26, genieY - 18, genieX + 34, genieY - 30, genieX + 28, genieY - 36);
        ctx.bezierCurveTo(genieX + 22, genieY - 28, genieX + 14, genieY - 22, genieX + 6, genieY - 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Fin
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.moveTo(genieX - 3, genieY - 25);
        ctx.lineTo(genieX, genieY - 32);
        ctx.lineTo(genieX + 3, genieY - 25);
        ctx.closePath();
        ctx.fill();
      } else if (archetype === 'DRAGON_SHENRON' || archetype === 'DRAGON_SHADOW' || archetype === 'DRAGON') {
        // Antler Horns
        ctx.strokeStyle = secondary;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(genieX - 6, genieY - 22);
        ctx.lineTo(genieX - 16, genieY - 36);
        ctx.moveTo(genieX - 12, genieY - 30);
        ctx.lineTo(genieX - 6, genieY - 34);
        ctx.moveTo(genieX + 6, genieY - 22);
        ctx.lineTo(genieX + 16, genieY - 36);
        ctx.moveTo(genieX + 12, genieY - 30);
        ctx.lineTo(genieX + 6, genieY - 34);
        ctx.stroke();
        // Whiskers
        ctx.strokeStyle = primary;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(genieX - 6, genieY - 10);
        ctx.quadraticCurveTo(genieX - 18, genieY - 6, genieX - 24, genieY + 5);
        ctx.moveTo(genieX + 6, genieY - 10);
        ctx.quadraticCurveTo(genieX + 18, genieY - 6, genieX + 24, genieY + 5);
        ctx.stroke();
      } else if (archetype === 'DJINN_IFRIT') {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(genieX - 7, genieY - 22);
        ctx.lineTo(genieX - 14, genieY - 35);
        ctx.lineTo(genieX - 3, genieY - 26);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(genieX + 7, genieY - 22);
        ctx.lineTo(genieX + 14, genieY - 35);
        ctx.lineTo(genieX + 3, genieY - 26);
        ctx.closePath();
        ctx.fill();
      } else if (archetype === 'DEMON_BAPHOMET') {
        ctx.strokeStyle = secondary;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(genieX - 11, genieY - 14, 8, Math.PI * 0.8, Math.PI * 1.8);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(genieX + 11, genieY - 14, 8, -Math.PI * 0.8, -Math.PI * 1.8, true);
        ctx.stroke();
      } else if (archetype.includes('DEMON')) {
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.moveTo(genieX - 7, genieY - 22);
        ctx.lineTo(genieX - 13, genieY - 33);
        ctx.lineTo(genieX - 3, genieY - 25);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(genieX + 7, genieY - 22);
        ctx.lineTo(genieX + 13, genieY - 33);
        ctx.lineTo(genieX + 3, genieY - 25);
        ctx.closePath();
        ctx.fill();
      } else {
        // Turban jewel
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.arc(genieX, genieY - 24, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Eyes
      ctx.fillStyle = genie.eyeColor;
      ctx.beginPath();
      ctx.arc(genieX - 4, genieY - 14, archetype === 'DRAGON_PORUNGA' ? 3 : 2.5, 0, Math.PI * 2);
      ctx.arc(genieX + 4, genieY - 14, archetype === 'DRAGON_PORUNGA' ? 3 : 2.5, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [activeTheme, player, genie]);

  const handlePlayerChange = (field, val) => {
    onUpdateCustomization({
      ...customization,
      player: { ...player, [field]: val }
    });
  };

  const handleGenieChange = (field, val) => {
    onUpdateCustomization({
      ...customization,
      genie: { ...genie, [field]: val }
    });
  };

  // Select an entity variant within current theme (e.g. Porunga vs Shenron)
  const handleSelectVariant = (variant) => {
    audioSynth.playButton();
    const updatedGenie = {
      ...genie,
      variant: variant.id,
      archetype: variant.archetype,
      name: variant.name,
      primaryColor: variant.primaryColor,
      secondaryColor: variant.secondaryColor,
      eyeColor: variant.eyeColor,
      relic: variant.relic,
      maxWishes: variant.maxWishes,
      role: variant.role,
      introDialogue: variant.introDialogue,
      victoryDialogue: variant.victoryDialogue,
      auraParticleType: variant.auraParticleType || 'SPARK',
      voiceBaseFreq: variant.voiceBaseFreq || 120
    };

    onUpdateCustomization({
      player,
      genie: updatedGenie
    });
  };

  const handleResetDefaults = () => {
    audioSynth.playButton();
    onUpdateCustomization({
      player: { ...DEFAULT_CUSTOMIZATION.player },
      genie: { ...activeTheme.genieDefaults }
    });
  };

  // Handle saving new custom theme
  const handleCreateCustomThemeSubmit = (e) => {
    e.preventDefault();
    audioSynth.playChime();
    const cleanId = (newThemeForm.id.trim() || newThemeForm.name.toLowerCase().replace(/[^a-z0-9]/g, '_')) + '_' + Date.now().toString(36);

    const fullTheme = {
      id: cleanId,
      name: newThemeForm.name,
      subtitle: newThemeForm.subtitle,
      maxWishes: parseInt(newThemeForm.maxWishes, 10) || 3,
      role: newThemeForm.role,
      introDialogue: newThemeForm.introDialogue,
      victoryDialogue: newThemeForm.victoryDialogue,
      personaPrompt: newThemeForm.personaPrompt,
      chamberColors: {
        bgTop: newThemeForm.bgTop,
        bgBottom: newThemeForm.bgBottom,
        brickPrimary: newThemeForm.brickPrimary,
        brickSecondary: newThemeForm.brickSecondary,
        brickMortar: newThemeForm.brickMortar,
        torchFlame: newThemeForm.torchFlame,
        accentHex: newThemeForm.accentHex
      },
      genieDefaults: {
        archetype: newThemeForm.archetype,
        variant: 'custom_default',
        primaryColor: newThemeForm.primaryColor,
        secondaryColor: newThemeForm.secondaryColor,
        eyeColor: newThemeForm.eyeColor,
        relic: newThemeForm.relic,
        auraParticleType: newThemeForm.auraParticleType,
        voiceBaseFreq: parseInt(newThemeForm.voiceBaseFreq, 10) || 120
      },
      entityVariants: [
        {
          id: 'custom_default',
          name: newThemeForm.name,
          subtitle: `${newThemeForm.subtitle}`,
          archetype: newThemeForm.archetype,
          maxWishes: parseInt(newThemeForm.maxWishes, 10) || 3,
          role: newThemeForm.role,
          introDialogue: newThemeForm.introDialogue,
          victoryDialogue: newThemeForm.victoryDialogue,
          primaryColor: newThemeForm.primaryColor,
          secondaryColor: newThemeForm.secondaryColor,
          eyeColor: newThemeForm.eyeColor,
          relic: newThemeForm.relic,
          auraParticleType: newThemeForm.auraParticleType,
          voiceBaseFreq: parseInt(newThemeForm.voiceBaseFreq, 10) || 120
        }
      ]
    };

    saveCustomTheme(fullTheme);
    refreshThemes();
    onSelectTheme(cleanId);
    onUpdateCustomization({
      player,
      genie: { ...fullTheme.genieDefaults }
    });
    setIsCreatingCustom(false);
  };

  const handleDeleteTheme = (themeId, e) => {
    e.stopPropagation();
    audioSynth.playCrunch();
    if (window.confirm('Are you sure you want to delete this custom theme?')) {
      deleteCustomTheme(themeId);
      refreshThemes();
      if (currentThemeId === themeId) {
        onSelectTheme('shenron_dragon');
        onUpdateCustomization({
          player,
          genie: { ...THEME_SETS.shenron_dragon.genieDefaults }
        });
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Themes and Character Customizer"
      onClick={() => {
        audioSynth.playButton();
        onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-black/85 backdrop-blur-md select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl border-2 p-5 shadow-2xl max-h-[94vh] overflow-y-auto"
        style={{
          backgroundColor: activeTheme.chamberColors?.bgBottom || '#0f2922',
          borderColor: activeTheme.chamberColors?.accentHex || '#10b981',
          boxShadow: `0 0 35px ${activeTheme.chamberColors?.accentHex || '#10b981'}44`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5" style={{ color: activeTheme.chamberColors?.accentHex || '#10b981' }} />
            <div>
              <h2 className="font-pixel text-xs sm:text-sm md:text-base font-bold text-slate-100 uppercase">
                THEMES, ENTITY ARCHETYPES & CUSTOMIZER
              </h2>
              <p className="text-[10px] md:text-[11px] text-slate-400 font-pixel">
                Switch entity archetypes (Shenron / Porunga), create custom themes & personalize
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close themes modal"
            onClick={() => {
              audioSynth.playButton();
              onClose();
            }}
            className="p-1 rounded-lg bg-black/40 hover:bg-black/60 border border-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Theme Sets 1-3 & Custom Themes Selector Grid */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 font-pixel">ACTIVE REALM THEME</span>
            <button
              type="button"
              onClick={() => {
                audioSynth.playButton();
                setIsCreatingCustom(!isCreatingCustom);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/50 text-indigo-200 text-[10px] font-pixel transition-all"
            >
              <Plus className="w-3 h-3" />
              <span>{isCreatingCustom ? 'CLOSE CREATOR' : '+ NEW CUSTOM THEME'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {Object.values(themes).map((th) => {
              const isSelected = th.id === currentThemeId;
              const isCustom = !THEME_SETS[th.id];
              return (
                <div
                  key={th.id}
                  className={`relative rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-black/60 shadow-lg border-2'
                      : 'bg-black/30 hover:bg-black/50 border-slate-700/60 opacity-85'
                  }`}
                  style={{
                    borderColor: isSelected ? (th.chamberColors?.accentHex || '#10b981') : 'rgba(51, 65, 85, 0.6)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      audioSynth.playButton();
                      onSelectTheme(th.id);
                      onUpdateCustomization({
                        player,
                        genie: { ...th.genieDefaults }
                      });
                      const themeKey = th.id === 'shenron_dragon' ? 'shenron' : th.id === 'corporate_demon' ? 'demon' : 'djinn';
                      audioSynth.startAmbientMusic(themeKey);
                    }}
                    className="w-full p-2.5 text-left rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-1 pr-6">
                      <span className="font-pixel text-[11px] font-bold text-slate-100 truncate">
                        {th.name.split(':')[0]}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </div>
                    <div
                      className="w-full h-1.5 rounded-full mb-1"
                      style={{
                        background: `linear-gradient(to right, ${th.chamberColors?.bgTop || '#111'}, ${th.chamberColors?.accentHex || '#10b981'})`
                      }}
                    />
                    <span className="text-[10px] text-slate-300 font-pixel block truncate font-bold">
                      {th.name.includes(':') ? th.name.split(':')[1]?.trim() : th.name}
                    </span>
                    <span className="text-[9px] text-slate-400 font-pixel block">
                      {th.maxWishes} Wishes Max {isCustom && '• [Custom]'}
                    </span>
                  </button>

                  {isCustom && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTheme(th.id, e)}
                      aria-label={`Delete custom theme ${th.name}`}
                      title="Delete Custom Theme"
                      className="absolute top-2 right-2 p-1 hover:text-rose-400 text-slate-500 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Entity Archetype / Variant Selector (e.g. Shenron vs Porunga vs Super Shenron) */}
        {activeTheme.entityVariants && activeTheme.entityVariants.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-black/50 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-400 font-pixel flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SELECT ENTITY ARCHETYPE & VARIANT:</span>
              </span>
              <span className="text-[10px] text-slate-400 font-pixel">
                Changes anatomy, horn structures, relics & wish count!
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {activeTheme.entityVariants.map((variant) => {
                const isVariantActive = (genie.variant || activeTheme.defaultVariant) === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => handleSelectVariant(variant)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      isVariantActive
                        ? 'bg-amber-500/20 border-amber-400 shadow-md scale-[1.02]'
                        : 'bg-black/30 hover:bg-black/50 border-slate-700/60 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-pixel text-[10px] font-bold text-slate-100 truncate">
                        {variant.name.split('(')[0]?.trim()}
                      </span>
                      {isVariantActive && <Check className="w-3 h-3 text-amber-400" />}
                    </div>
                    <span className="text-[9px] text-slate-400 font-pixel block truncate">
                      {variant.subtitle}
                    </span>
                    <div className="flex items-center gap-1 mt-1.5">
                      <div
                        className="w-3 h-3 rounded-full border border-black/40"
                        style={{ backgroundColor: variant.primaryColor }}
                      />
                      <div
                        className="w-3 h-3 rounded-full border border-black/40"
                        style={{ backgroundColor: variant.secondaryColor }}
                      />
                      <span className="text-[8px] text-amber-300 font-pixel ml-auto">
                        {variant.maxWishes}W
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Custom Theme Creator Builder Panel */}
        {isCreatingCustom && (
          <form
            onSubmit={handleCreateCustomThemeSubmit}
            className="mb-4 p-4 rounded-xl bg-black/70 border-2 border-indigo-500/60 space-y-3 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-indigo-500/30">
              <span className="text-xs font-bold text-indigo-300 font-pixel flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" /> CREATE EXTENSIBLE REALM & ENTITY
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingCustom(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-pixel">
              <div>
                <label className="text-slate-300 block mb-1">Realm Name:</label>
                <input
                  type="text"
                  required
                  value={newThemeForm.name}
                  onChange={(e) => setNewThemeForm({ ...newThemeForm, name: e.target.value })}
                  className="w-full bg-black/80 border border-slate-700 rounded px-2 py-1 text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Subtitle / Sub-domain:</label>
                <input
                  type="text"
                  required
                  value={newThemeForm.subtitle}
                  onChange={(e) => setNewThemeForm({ ...newThemeForm, subtitle: e.target.value })}
                  className="w-full bg-black/80 border border-slate-700 rounded px-2 py-1 text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Entity Base Anatomy Archetype:</label>
                <select
                  value={newThemeForm.archetype}
                  onChange={(e) => setNewThemeForm({ ...newThemeForm, archetype: e.target.value })}
                  className="w-full bg-black/80 border border-slate-700 rounded px-2 py-1 text-slate-100"
                >
                  <option value="DRAGON_PORUNGA">Porunga (Muscular Body, Horns, Spikes)</option>
                  <option value="DRAGON_SHENRON">Shenron (Serpentine, Antlers, Whiskers)</option>
                  <option value="DRAGON_SUPER">Super Shenron (Celestial Wings)</option>
                  <option value="DRAGON_SHADOW">Black Smoke Shenron (Shadow)</option>
                  <option value="DJINN_CLASSIC">Classic Djinn (Turban, Smoke)</option>
                  <option value="DJINN_IFRIT">Ifrit (Molten Flame Horns)</option>
                  <option value="DJINN_MARID">Marid (Abyssal Ocean)</option>
                  <option value="DEMON_BAPHOMET">Baphomet (Curved Ram Horns)</option>
                  <option value="DEMON_MAMMON">Mammon (Golden Horn Crown)</option>
                  <option value="DEMON_CORPORATE">Corporate Demon (Devil Horns)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Number of Wishes (Max):</label>
                <select
                  value={newThemeForm.maxWishes}
                  onChange={(e) => setNewThemeForm({ ...newThemeForm, maxWishes: parseInt(e.target.value, 10) })}
                  className="w-full bg-black/80 border border-slate-700 rounded px-2 py-1 text-slate-100"
                >
                  <option value={1}>1 Wish</option>
                  <option value={2}>2 Wishes (Like Shenron)</option>
                  <option value={3}>3 Wishes (Like Porunga & Djinn)</option>
                  <option value={4}>4 Wishes</option>
                  <option value={5}>5 Wishes</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Relic Item Sprite:</label>
                <select
                  value={newThemeForm.relic}
                  onChange={(e) => setNewThemeForm({ ...newThemeForm, relic: e.target.value })}
                  className="w-full bg-black/80 border border-slate-700 rounded px-2 py-1 text-slate-100"
                >
                  <option value="NAMEK_DRAGON_BALL">Namek Dragon Ball (Porunga)</option>
                  <option value="DRAGON_BALL">Earth Dragon Ball (Shenron)</option>
                  <option value="SUPER_DRAGON_BALL">Super Dragon Ball (Golden)</option>
                  <option value="CRACKED_DRAGON_BALL">Cracked Shadow Ball</option>
                  <option value="MAGIC_LAMP">Mesopotamian Magic Lamp</option>
                  <option value="FLAME_URN">Flame Urn (Ifrit)</option>
                  <option value="ABYSSAL_PEARL">Abyssal Pearl (Marid)</option>
                  <option value="DESERT_AMULET">Desert Amulet (Jann)</option>
                  <option value="BLOOD_CONTRACT">Blood Contract (Malphas)</option>
                  <option value="GOLDEN_PENTACLE">Golden Pentacle (Mammon)</option>
                  <option value="DEMON_TALISMAN">Demon Talisman (Baphomet)</option>
                  <option value="FORBIDDEN_TOME">Forbidden Tome (Leviathan)</option>
                  <option value="ANVIL">Iron Anvil</option>
                  <option value="GOLD_BAR">Gold Bullion Bar</option>
                  <option value="TEA_CUP">Tea Cup</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Aura Particle Type:</label>
                <select
                  value={newThemeForm.auraParticleType}
                  onChange={(e) => setNewThemeForm({ ...newThemeForm, auraParticleType: e.target.value })}
                  className="w-full bg-black/80 border border-slate-700 rounded px-2 py-1 text-slate-100"
                >
                  <option value="SPARK">SPARK (Cosmic Energy)</option>
                  <option value="FIRE">FIRE (Flames)</option>
                  <option value="GOLD">GOLD (Treasure Grains)</option>
                  <option value="ACID">ACID (Corrosive Mist)</option>
                  <option value="ASH">ASH (Shadow Cinders)</option>
                  <option value="BLOOD">BLOOD (Crimson Gore)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Primary Entity Color:</label>
                <input
                  type="color"
                  value={newThemeForm.primaryColor}
                  onChange={(e) => setNewThemeForm({ ...newThemeForm, primaryColor: e.target.value })}
                  className="w-full h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Accent Secondary Color:</label>
                <input
                  type="color"
                  value={newThemeForm.secondaryColor}
                  onChange={(e) => setNewThemeForm({ ...newThemeForm, secondaryColor: e.target.value })}
                  className="w-full h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-300 block mb-1">Introductory Dialogue:</label>
                <input
                  type="text"
                  required
                  value={newThemeForm.introDialogue}
                  onChange={(e) => setNewThemeForm({ ...newThemeForm, introDialogue: e.target.value })}
                  className="w-full bg-black/80 border border-slate-700 rounded px-2 py-1 text-slate-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-300 block mb-1">Victory Dialogue:</label>
                <input
                  type="text"
                  required
                  value={newThemeForm.victoryDialogue}
                  onChange={(e) => setNewThemeForm({ ...newThemeForm, victoryDialogue: e.target.value })}
                  className="w-full bg-black/80 border border-slate-700 rounded px-2 py-1 text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-pixel text-xs font-bold transition-all shadow-md"
              >
                SAVE & ACTIVATE THEME
              </button>
            </div>
          </form>
        )}

        {/* 4. Live Interactive Canvas Preview */}
        <div className="mb-4 rounded-xl overflow-hidden border border-slate-700/80 bg-black/40 shadow-inner flex flex-col items-center">
          <canvas
            ref={previewCanvasRef}
            width={480}
            height={150}
            className="w-full max-w-[480px] h-[135px] pixel-perfect"
          />
          <div className="w-full px-3 py-1 bg-black/70 flex justify-between text-[10px] font-pixel text-slate-400">
            <span>
              {genie.name || activeTheme.name.split(':')[1]?.trim() || activeTheme.name} ({genie.archetype})
            </span>
            <span>
              {player.name} ({player.hatStyle} HAT)
            </span>
          </div>
        </div>

        {/* 5. Customizer Pickers Grid (Hero & Entity) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-pixel mb-4">
          {/* Player Ragdoll Customizer */}
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-2">
            <span className="text-amber-300 font-bold block mb-1">PLAYER RAGDOLL ATTIRE</span>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Name:</span>
              <input
                type="text"
                value={player.name}
                onChange={(e) => handlePlayerChange('name', e.target.value)}
                className="bg-black/60 border border-slate-700 rounded px-2 py-0.5 text-slate-200 text-xs w-32"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Skin Tone:</span>
              <input
                type="color"
                value={player.skinColor}
                onChange={(e) => handlePlayerChange('skinColor', e.target.value)}
                className="w-7 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Shirt / Tunic:</span>
              <input
                type="color"
                value={player.shirtColor}
                onChange={(e) => handlePlayerChange('shirtColor', e.target.value)}
                className="w-7 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Pants:</span>
              <input
                type="color"
                value={player.pantsColor}
                onChange={(e) => handlePlayerChange('pantsColor', e.target.value)}
                className="w-7 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Headgear / Hat:</span>
              <select
                value={player.hatStyle}
                onChange={(e) => handlePlayerChange('hatStyle', e.target.value)}
                className="bg-black/70 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
              >
                <option value="NONE">None</option>
                <option value="CROWN">Crown</option>
                <option value="WIZARD">Wizard Hat</option>
                <option value="HARDHAT">Hardhat</option>
              </select>
            </div>
          </div>

          {/* Genie Entity Customizer */}
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-2">
            <span className="text-amber-300 font-bold block mb-1">ENTITY VISUAL ATTRIBUTES</span>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Primary Color:</span>
              <input
                type="color"
                value={genie.primaryColor}
                onChange={(e) => handleGenieChange('primaryColor', e.target.value)}
                className="w-7 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Secondary Accent:</span>
              <input
                type="color"
                value={genie.secondaryColor}
                onChange={(e) => handleGenieChange('secondaryColor', e.target.value)}
                className="w-7 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Eye Glow Color:</span>
              <input
                type="color"
                value={genie.eyeColor}
                onChange={(e) => handleGenieChange('eyeColor', e.target.value)}
                className="w-7 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Relic Sprite:</span>
              <select
                value={genie.relic || activeTheme.genieDefaults?.relic || 'MAGIC_LAMP'}
                onChange={(e) => handleGenieChange('relic', e.target.value)}
                className="bg-black/70 border border-slate-700 rounded px-2 py-1 text-slate-200 text-[10px]"
              >
                <option value="DRAGON_BALL">Earth Dragon Ball</option>
                <option value="NAMEK_DRAGON_BALL">Namek Dragon Ball</option>
                <option value="SUPER_DRAGON_BALL">Super Dragon Ball</option>
                <option value="CRACKED_DRAGON_BALL">Cracked Ball</option>
                <option value="MAGIC_LAMP">Magic Lamp</option>
                <option value="FLAME_URN">Flame Urn</option>
                <option value="ABYSSAL_PEARL">Abyssal Pearl</option>
                <option value="DESERT_AMULET">Desert Amulet</option>
                <option value="BLOOD_CONTRACT">Blood Contract</option>
                <option value="GOLDEN_PENTACLE">Golden Pentacle</option>
                <option value="DEMON_TALISMAN">Demon Talisman</option>
                <option value="FORBIDDEN_TOME">Forbidden Tome</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Aura Particle:</span>
              <span className="text-amber-400 font-bold uppercase">
                {genie.auraParticleType || activeTheme.genieDefaults?.auraParticleType || 'FIRE'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> RESET TO DEFAULTS
          </button>

          <button
            type="button"
            onClick={() => {
              audioSynth.playButton();
              onClose();
            }}
            className="px-5 py-2 rounded-xl font-pixel text-xs font-bold tracking-wider uppercase transition-all shadow-md"
            style={{
              backgroundColor: activeTheme.chamberColors?.accentHex || '#10b981',
              color: '#090d1c'
            }}
          >
            APPLY & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
