// Theme Selector (Sets 1-3) + Interactive Customizer with Live Preview Canvas
import React, { useRef, useEffect } from 'react';
import { THEME_SETS, COLOR_PALETTES, DEFAULT_CUSTOMIZATION } from '../data/themes';
import { audioSynth } from '../engine/audioSynth';
import { Palette, X, RotateCcw, Check, Sparkles } from 'lucide-react';

export default function ThemeCustomizerModal({
  currentThemeId,
  onSelectTheme,
  customization,
  onUpdateCustomization,
  onClose
}) {
  const previewCanvasRef = useRef(null);
  const theme = THEME_SETS[currentThemeId] || THEME_SETS.djinn_classic;

  const player = customization?.player || DEFAULT_CUSTOMIZATION.player;
  const genie = customization?.genie || DEFAULT_CUSTOMIZATION.genie;

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
      grad.addColorStop(0, theme.chamberColors.bgTop);
      grad.addColorStop(1, theme.chamberColors.bgBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor stone
      ctx.fillStyle = theme.chamberColors.brickPrimary;
      ctx.fillRect(0, canvas.height - 24, canvas.width, 24);

      // 1. Render Custom Hero on Right
      const heroX = canvas.width * 0.72;
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

      // 2. Render Custom Genie on Left
      const genieX = canvas.width * 0.28;
      const genieY = canvas.height * 0.45 + Math.sin(frame * 0.08) * 6;

      // Aura
      const aura = ctx.createRadialGradient(genieX, genieY, 5, genieX, genieY, 40);
      aura.addColorStop(0, genie.primaryColor + '88');
      aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(genieX, genieY, 40, 0, Math.PI * 2);
      ctx.fill();

      // Torso
      ctx.fillStyle = genie.primaryColor;
      ctx.beginPath();
      ctx.ellipse(genieX, genieY + 8, 18, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Arms
      ctx.strokeStyle = genie.secondaryColor;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(genieX, genieY + 12, 14, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Head
      ctx.beginPath();
      ctx.arc(genieX, genieY - 14, 12, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = genie.eyeColor;
      ctx.beginPath();
      ctx.arc(genieX - 4, genieY - 14, 2.5, 0, Math.PI * 2);
      ctx.arc(genieX + 4, genieY - 14, 2.5, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [theme, player, genie]);

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

  const handleResetDefaults = () => {
    audioSynth.playButton();
    onUpdateCustomization({
      player: { ...DEFAULT_CUSTOMIZATION.player },
      genie: { ...theme.genieDefaults }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div
        className="w-full max-w-2xl rounded-2xl border-2 p-5 shadow-2xl max-h-[92vh] overflow-y-auto"
        style={{
          backgroundColor: theme.chamberColors.bgBottom,
          borderColor: theme.chamberColors.accentHex,
          boxShadow: `0 0 35px ${theme.chamberColors.accentHex}44`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" style={{ color: theme.chamberColors.accentHex }} />
            <div>
              <h2 className="font-pixel text-sm md:text-base font-bold text-slate-100 uppercase">
                THEME SET & CHARACTER CUSTOMIZER
              </h2>
              <p className="text-[11px] text-slate-400 font-pixel">
                Select from the 3 Theme Sets & customize Player / Genie appearance
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioSynth.playButton();
              onClose();
            }}
            className="p-1 rounded-lg bg-black/40 hover:bg-black/60 border border-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Theme Sets 1-3 Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          {Object.values(THEME_SETS).map((th) => {
            const isSelected = th.id === currentThemeId;
            return (
              <button
                key={th.id}
                onClick={() => {
                  audioSynth.playButton();
                  onSelectTheme(th.id);
                  onUpdateCustomization({
                    player,
                    genie: { ...th.genieDefaults }
                  });
                  audioSynth.startAmbientMusic(th.id === 'shenron_dragon' ? 'shenron' : th.id === 'corporate_demon' ? 'demon' : 'djinn');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-black/60 shadow-lg border-2'
                    : 'bg-black/30 hover:bg-black/50 border-slate-700/60 opacity-75'
                }`}
                style={{
                  borderColor: isSelected ? th.chamberColors.accentHex : 'rgba(51, 65, 85, 0.6)'
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-pixel text-xs font-bold text-slate-100">
                    {th.name.split(':')[0]}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div
                  className="w-full h-2 rounded-full mb-1"
                  style={{
                    background: `linear-gradient(to right, ${th.chamberColors.bgTop}, ${th.chamberColors.accentHex})`
                  }}
                />
                <span className="text-[10px] text-slate-300 font-pixel block truncate font-bold">
                  {th.name.split(':')[1]}
                </span>
                <span className="text-[9px] text-slate-400 font-pixel block">
                  {th.maxWishes} Wishes Max
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. Live Interactive Canvas Preview */}
        <div className="mb-4 rounded-xl overflow-hidden border border-slate-700/80 bg-black/40 shadow-inner flex flex-col items-center">
          <canvas
            ref={previewCanvasRef}
            width={480}
            height={150}
            className="w-full max-w-[480px] h-[135px] pixel-perfect"
          />
          <div className="w-full px-3 py-1 bg-black/70 flex justify-between text-[10px] font-pixel text-slate-400">
            <span>{theme.name.split(':')[1]}</span>
            <span>{player.name} ({player.hatStyle} HAT)</span>
          </div>
        </div>

        {/* 3. Customizer Pickers Grid */}
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
            <span className="text-amber-300 font-bold block mb-1">GENIE ENTITY VISUALS</span>

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
              <span className="text-slate-300">Aura Particle Type:</span>
              <span className="text-amber-400 font-bold uppercase">{theme.genieDefaults.auraParticleType}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> RESET TO DEFAULTS
          </button>

          <button
            onClick={() => {
              audioSynth.playButton();
              onClose();
            }}
            className="px-5 py-2 rounded-xl font-pixel text-xs font-bold tracking-wider uppercase transition-all shadow-md"
            style={{
              backgroundColor: theme.chamberColors.accentHex,
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
