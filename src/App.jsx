// Main Application Shell & Master Orchestrator for GENIE: The 2D Literal Monkey's Paw Sandbox
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import GameCanvas from './components/GameCanvas';
import DialogueBox from './components/DialogueBox';
import WishInputBar from './components/WishInputBar';
import ThemeCustomizerModal from './components/ThemeCustomizerModal';
import SettingsModal from './components/SettingsModal';
import { THEME_SETS, DEFAULT_CUSTOMIZATION, getAvailableThemes } from './data/themes';
import { audioSynth } from './engine/audioSynth';
import { choreographyRunner } from './engine/choreographyRunner';
import { vfxSystem } from './engine/vfxSystem';
import { interpretWishWithDirector } from './services/llmDirector';
import {
  Palette,
  Settings as SettingsIcon,
  RotateCcw,
  Volume2,
  VolumeX,
  Flame,
  Droplets,
  Layers,
  Sparkles,
  ShieldAlert,
  Hand,
  Skull,
  Award,
  Zap,
  Square,
  CheckCircle2,
  Waves,
  Snowflake,
  Wind,
  Mountain,
  Fuel,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

export default function App() {
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    return localStorage.getItem('genie_theme_id') || 'djinn_classic';
  });

  const [customization, setCustomization] = useState(() => {
    return {
      player: { ...DEFAULT_CUSTOMIZATION.player },
      genie: { ...DEFAULT_CUSTOMIZATION.genie }
    };
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Sandbox Brush Tool state
  const [activeTool, setActiveTool] = useState('none');

  // Dialogue & Choreography state
  const [currentDialogue, setCurrentDialogue] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [isCertificateMinimized, setIsCertificateMinimized] = useState(false);
  const [wishNumber, setWishNumber] = useState(1);
  const [survivedWishesCount, setSurvivedWishesCount] = useState(0);

  // Settings state
  const [settings, setSettings] = useState(() => ({
    masterVolume: 0.7,
    sfxVolume: 0.8,
    ambientVolume: 0.3,
    isMuted: false,
    gravity: 1.0,
    provider: localStorage.getItem('genie_provider') || 'mock',
    credentials: {
      apiKey: localStorage.getItem('genie_apiKey') || (
        (localStorage.getItem('genie_provider') === 'gemini'
          ? import.meta.env?.VITE_GEMINI_API_KEY
          : import.meta.env?.VITE_GROQ_API_KEY) || ''
      ),
      endpoint: localStorage.getItem('genie_endpoint') || import.meta.env?.VITE_OLLAMA_ENDPOINT || 'http://localhost:11434',
      model: localStorage.getItem('genie_model') || import.meta.env?.VITE_OLLAMA_MODEL || ''
    }
  }));

  const [themes, setThemes] = useState(() => getAvailableThemes());
  const theme = themes[currentThemeId] || themes.djinn_classic || THEME_SETS.djinn_classic;
  const maxWishes = customization?.genie?.maxWishes || theme.maxWishes || 3;

  // Initial intro dialogue on realm entry or variant switch
  useEffect(() => {
    setCurrentDialogue({
      speaker: customization?.genie?.name || theme.name.split(':')[1]?.trim() || theme.name,
      text: customization?.genie?.introDialogue || theme.introDialogue,
      loopholeScore: 100,
      loopholeExplanation: 'State your wish carefully... or your vessel will be harvested.',
      voicePitch: 1.0,
      survived: true
    });
  }, [currentThemeId, customization?.genie?.variant]);

  // Audio start on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      audioSynth.unlock();
      const themeKey = currentThemeId === 'shenron_dragon' ? 'shenron' : currentThemeId === 'corporate_demon' ? 'demon' : 'djinn';
      audioSynth.startAmbientMusic(themeKey);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      audioSynth.stopAmbientMusic();
    };
  }, [currentThemeId]);

  // Wish Submission Handler
  const handleMakeWish = async (wishText) => {
    if (isExecuting) return;

    setIsExecuting(true);
    setActiveCertificate(null);
    vfxSystem.spawnEmote(480, 400, 'QUESTION');

    setCurrentDialogue({
      speaker: customization?.player?.name || 'Player',
      text: `"${wishText}"`,
      loopholeScore: 90,
      loopholeExplanation: 'Wish submitted to the cosmic contract registrar...',
      voicePitch: 1.0,
      survived: true
    });

    try {
      const scenario = await interpretWishWithDirector(
        wishText,
        settings.provider,
        settings.credentials,
        {
          ...theme,
          name: customization?.genie?.name || theme.name,
          role: customization?.genie?.role || theme.role,
          personaPrompt: theme.personaPrompt,
          maxWishes: maxWishes
        },
        wishNumber
      );

      if (scenario) {
        choreographyRunner.startScenario(scenario);
      } else {
        setIsExecuting(false);
      }
    } catch (err) {
      console.error('Failed to interpret wish:', err);
      setIsExecuting(false);
    }
  };

  const handleWishCompleted = (scenario) => {
    setIsExecuting(false);
    setActiveCertificate(scenario);

    if (scenario.survived) {
      audioSynth.playChime();
      vfxSystem.spawnEmote(480, 400, 'HEART');
      vfxSystem.spawnFloatingText(480, 360, 'AIRTIGHT SURVIVAL!', '#10b981', 18);
      const newSurvivedCount = survivedWishesCount + 1;
      setSurvivedWishesCount(newSurvivedCount);

      // Check if all wishes completed with survival (VICTORY!)
      if (wishNumber >= maxWishes) {
        confetti({
          particleCount: 160,
          spread: 80,
          origin: { y: 0.5 }
        });
        setTimeout(() => {
          setCurrentDialogue({
            speaker: customization?.genie?.name || theme.name.split(':')[1]?.trim() || theme.name,
            text: customization?.genie?.victoryDialogue || theme.victoryDialogue,
            loopholeScore: 100,
            loopholeExplanation: 'CONGRATULATIONS: You have beaten the Monkey’s Paw with 100% legal precision!',
            voicePitch: 1.3,
            survived: true
          });
        }, 1200);
      } else {
        setWishNumber(wishNumber + 1);
      }
    } else {
      audioSynth.playLaugh();
      vfxSystem.spawnFloatingText(480, 360, 'WISH TWISTED!', '#ef233c', 18);
      setWishNumber(1);
      setSurvivedWishesCount(0);
    }
  };

  const handleResetSandbox = () => {
    audioSynth.playButton();
    choreographyRunner.reset();
    setCurrentDialogue(null);
    setActiveCertificate(null);
    setIsExecuting(false);
    setWishNumber(1);
    setSurvivedWishesCount(0);
    window.location.reload();
  };

  const handleSelectTheme = (themeId) => {
    const freshThemes = getAvailableThemes();
    setThemes(freshThemes);
    setCurrentThemeId(themeId);
    localStorage.setItem('genie_theme_id', themeId);
    setWishNumber(1);
    setSurvivedWishesCount(0);
  };

  const tools = [
    { id: 'none', label: 'Grab', icon: Hand },
    { id: 'blood', label: 'Blood', icon: Droplets, color: '#be0a19' },
    { id: 'fire', label: 'Fire', icon: Flame, color: '#ff3c14' },
    { id: 'acid', label: 'Acid', icon: Skull, color: '#70e000' },
    { id: 'water', label: 'Water', icon: Waves, color: '#38bdf8' },
    { id: 'lava', label: 'Lava', icon: Flame, color: '#f97316' },
    { id: 'oil', label: 'Oil', icon: Fuel, color: '#64748b' },
    { id: 'ice', label: 'Ice', icon: Snowflake, color: '#a5f3fc' },
    { id: 'smoke', label: 'Smoke', icon: Wind, color: '#94a3b8' },
    { id: 'sand', label: 'Sand', icon: Mountain, color: '#fde047' },
    { id: 'ash', label: 'Ash', icon: Layers, color: '#a0a5aa' },
    { id: 'gold', label: 'Gold', icon: Sparkles, color: '#ffd166' },
    { id: 'spark', label: 'Spark', icon: Zap, color: '#fff064' },
    { id: 'wall', label: 'Wall', icon: Square, color: '#64748b' }
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-slate-100 flex flex-col font-pixel select-none">
      {/* ======================================================== */}
      {/* TOP HUD BAR & TOOLBAR                                    */}
      {/* ======================================================== */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 md:px-5 py-2 bg-black/60 backdrop-blur-md border-b border-slate-800">
        {/* Title & Brand */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-3.5 h-3.5 rounded-full animate-pulse shadow-md"
            style={{ backgroundColor: theme.chamberColors.accentHex }}
          />
          <div>
            <h1
              className="text-xs md:text-sm font-bold tracking-wider uppercase text-slate-100 flex items-center gap-2"
              style={{ textShadow: `0 0 10px ${theme.chamberColors.accentHex}80` }}
            >
              <span>GENIE</span>
              <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                {theme.name}
              </span>
            </h1>
          </div>
        </div>

        {/* 320x180 Sandbox Material Brush Selector */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-slate-800/80 overflow-x-auto">
          {tools.map((t) => {
            const Icon = t.icon;
            const isSelected = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  audioSynth.playButton();
                  setActiveTool(t.id);
                }}
                title={`Tool: ${t.label}`}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-slate-800 shadow-md scale-105 border'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
                style={{
                  borderColor: isSelected ? theme.chamberColors.accentHex : 'transparent',
                  color: isSelected && t.color ? t.color : undefined
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls (Theme, Settings, Mute, Reset) */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Audio Mute Button */}
          <button
            onClick={() => {
              const nextMuted = !settings.isMuted;
              audioSynth.setMuted(nextMuted);
              setSettings({ ...settings, isMuted: nextMuted });
            }}
            title={settings.isMuted ? "Unmute" : "Mute"}
            className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {settings.isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          {/* Theme & Customizer Modal Toggle */}
          <button
            onClick={() => {
              audioSynth.playButton();
              setIsThemeModalOpen(true);
            }}
            title="Theme Sets & Character Customizer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-slate-800 text-slate-300 hover:text-white transition-colors text-xs font-bold"
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {customization?.genie?.name ? customization.genie.name.split(' ')[0].toUpperCase() : currentThemeId.split('_')[0].toUpperCase()}
            </span>
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={() => {
              audioSynth.playButton();
              setIsSettingsModalOpen(true);
            }}
            title="LLM Router & Physics Settings"
            className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Quick World Reset */}
          <button
            onClick={handleResetSandbox}
            title="Reset Sandbox"
            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN VIEWPORT: DUAL-LAYER 960x540 CANVAS                 */}
      {/* ======================================================== */}
      <main className="flex-1 w-full h-full relative flex items-center justify-center">
        <GameCanvas
          theme={theme}
          settings={settings}
          activeTool={activeTool}
          customization={customization}
          wishNumber={wishNumber}
          onDialogueUpdate={setCurrentDialogue}
          onWishCompleted={handleWishCompleted}
        />

        {/* Dialogue Box Overlay */}
        <DialogueBox
          dialogue={currentDialogue}
          theme={theme}
          onDismiss={() => setCurrentDialogue(null)}
          isExecuting={isExecuting}
        />

        {/* Wish Input Bar Overlay */}
        <WishInputBar
          onMakeWish={handleMakeWish}
          onResetSandbox={handleResetSandbox}
          isExecuting={isExecuting}
          theme={theme}
          wishNumber={wishNumber}
          maxWishes={maxWishes}
        />

        {/* ======================================================== */}
        {/* MONKEY'S PAW OUTCOME CERTIFICATE: MODAL & MINIMIZED PILL */}
        {/* ======================================================== */}
        {activeCertificate && (
          isCertificateMinimized ? (
            /* Minimized Outcome Pill (Leaves sandbox 100% interactable & visible) */
            <div
              className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 rounded-2xl border-2 backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom duration-200 select-none"
              style={{
                backgroundColor: theme.chamberColors.bgBottom ? `${theme.chamberColors.bgBottom}ee` : '#0f1325ee',
                borderColor: activeCertificate.survived ? '#10b981' : theme.chamberColors.accentHex,
                boxShadow: `0 0 25px ${activeCertificate.survived ? '#10b98144' : theme.chamberColors.accentHex + '44'}`
              }}
            >
              <div className="flex items-center gap-2 text-xs font-pixel font-bold">
                {activeCertificate.survived ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Skull className="w-4 h-4 text-rose-400" />
                )}
                <span className={activeCertificate.survived ? 'text-emerald-300' : 'text-rose-300'}>
                  {activeCertificate.survived ? 'WISH SURVIVED!' : 'RAGDOLL SLAIN!'} ({activeCertificate.loophole_score}/100)
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsCertificateMinimized(false)}
                className="px-3 py-1 rounded-xl text-xs font-pixel font-bold tracking-wider uppercase transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                style={{
                  backgroundColor: theme.chamberColors.accentHex,
                  color: '#0a0d1b'
                }}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>CERTIFICATE</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  audioSynth.playButton();
                  setActiveCertificate(null);
                }}
                title="Dismiss"
                className="p-1 rounded-lg bg-black/40 hover:bg-black/60 border border-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Full Certificate Modal with Non-Obtrusive Semi-Transparent Backdrop */
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm select-none animate-in fade-in zoom-in-95 duration-200">
              <div
                className="w-full max-w-lg rounded-2xl border-2 p-5 md:p-6 shadow-2xl relative"
                style={{
                  backgroundColor: theme.chamberColors.bgBottom ? `${theme.chamberColors.bgBottom}f6` : '#0f1325f6',
                  borderColor: theme.chamberColors.accentHex,
                  boxShadow: `0 0 45px ${theme.chamberColors.accentHex}55`
                }}
              >
                {/* Header Controls: View Arena (Minimize) & Close */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsCertificateMinimized(true)}
                    title="View Arena & Physics Playground"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 hover:bg-black/60 border border-slate-700 text-slate-300 hover:text-white text-xs font-pixel"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>VIEW ARENA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCertificate(null)}
                    className="p-1 rounded-lg bg-black/40 hover:bg-black/60 border border-slate-700 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Seal */}
                <div className="flex flex-col items-center text-center pb-3 mb-3 border-b border-slate-700/60">
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full p-2 border-2 flex items-center justify-center mb-2 bg-black/60"
                    style={{ borderColor: theme.chamberColors.accentHex }}
                  >
                    {activeCertificate.survived ? (
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <Award className="w-7 h-7" style={{ color: theme.chamberColors.accentHex }} />
                    )}
                  </div>
                  <span className="text-[10px] tracking-widest uppercase font-bold text-slate-400">
                    {theme.role}
                  </span>
                  <h2 className="text-base md:text-lg font-bold text-slate-100 mt-1 uppercase">
                    {activeCertificate.survived ? 'LOOPHOLE-FREE WISH! YOU SURVIVED!' : 'WISH GRANTED LITERALLY — YOU DIED'}
                  </h2>
                </div>

                {/* Certificate Details */}
                <div className="space-y-2.5 text-xs font-pixel">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800">
                    <span className="text-slate-400 uppercase text-[10px] block font-bold">WISH COVENANT:</span>
                    <span className="text-sm font-bold text-amber-300">
                      "{activeCertificate.wishText}"
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2.5 rounded-lg border ${activeCertificate.survived ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                      <span className={`uppercase text-[10px] block font-bold ${activeCertificate.survived ? 'text-emerald-400' : 'text-rose-400'}`}>
                        AIRTIGHT SCORE:
                      </span>
                      <span className={`font-bold text-sm ${activeCertificate.survived ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {activeCertificate.loophole_score}/100
                      </span>
                    </div>

                    <div className={`p-2.5 rounded-lg border ${activeCertificate.survived ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                      <span className={`uppercase text-[10px] block font-bold ${activeCertificate.survived ? 'text-emerald-400' : 'text-amber-400'}`}>
                        VESSEL STATUS:
                      </span>
                      <span className={`font-bold text-xs ${activeCertificate.survived ? 'text-emerald-300' : 'text-amber-300'}`}>
                        {activeCertificate.survived ? 'ALIVE & INTACT' : 'DISARTICULATED'}
                      </span>
                    </div>
                  </div>

                  {activeCertificate.loophole_explanation && (
                    <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[11px] space-y-1">
                      <span className="text-amber-300 font-bold block">LEGAL EXPLANATION:</span>
                      <p className="text-slate-300 leading-relaxed">{activeCertificate.loophole_explanation}</p>
                    </div>
                  )}

                  <div className="p-2.5 rounded-lg bg-black/70 border border-slate-700/80 text-center">
                    <p className="text-slate-300 italic text-xs">
                      "{activeCertificate.genie_taunt}"
                    </p>
                  </div>
                </div>

                {/* Action Buttons: Continue + Inspect Arena */}
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCertificateMinimized(true)}
                    className="px-4 py-2 rounded-xl font-pixel text-xs font-bold tracking-wider uppercase transition-all bg-black/50 hover:bg-black/70 border border-slate-700 text-slate-300 hover:text-white"
                  >
                    INSPECT ARENA
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      audioSynth.playButton();
                      setActiveCertificate(null);
                    }}
                    className="px-6 py-2 rounded-xl font-pixel text-xs font-bold tracking-wider uppercase transition-all shadow-lg active:scale-95"
                    style={{
                      backgroundColor: theme.chamberColors.accentHex,
                      color: '#0a0d1b'
                    }}
                  >
                    {activeCertificate.survived
                      ? (survivedWishesCount >= theme.maxWishes ? 'CLAIM VICTORY' : `PROCEED TO WISH (${wishNumber}/${theme.maxWishes})`)
                      : 'TRY AGAIN (RESET TO WISH 1)'}
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </main>

      {/* Theme Customizer Modal */}
      {isThemeModalOpen && (
        <ThemeCustomizerModal
          currentThemeId={currentThemeId}
          onSelectTheme={handleSelectTheme}
          customization={customization}
          onUpdateCustomization={(newCust) => {
            setCustomization(newCust);
            setThemes(getAvailableThemes());
          }}
          onClose={() => setIsThemeModalOpen(false)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setIsSettingsModalOpen(false)}
          theme={theme}
        />
      )}
    </div>
  );
}
