// Main Application Shell & Master Orchestrator for GENIE: The 2D Literal Monkey's Paw Sandbox
import React, { useState, useEffect, useRef } from 'react';
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
import { safeGetItem, safeSetItem } from './utils/safeStorage';
import {
  Palette,
  Settings as SettingsIcon,
  RotateCcw,
  Volume2,
  VolumeX,
  Skull,
  Award,
  CheckCircle2,
  X,
  Eye,
  Cpu,
  Zap
} from 'lucide-react';

export default function App() {
  const [themes, setThemes] = useState(() => getAvailableThemes());

  const [currentThemeId, setCurrentThemeId] = useState(() => {
    const initialThemes = getAvailableThemes();
    const saved = safeGetItem('genie_theme_id');
    return saved && initialThemes[saved] ? saved : 'djinn_classic';
  });

  const [customization, setCustomization] = useState(() => {
    const initialThemes = getAvailableThemes();
    const savedId = safeGetItem('genie_theme_id');
    const initialTheme = (savedId && initialThemes[savedId]) || initialThemes.djinn_classic || THEME_SETS.djinn_classic;
    return {
      player: { ...DEFAULT_CUSTOMIZATION.player },
      genie: { ...DEFAULT_CUSTOMIZATION.genie, ...(initialTheme.genieDefaults || {}) }
    };
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Dialogue & Choreography state
  const [currentDialogue, setCurrentDialogue] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [isCertificateMinimized, setIsCertificateMinimized] = useState(false);
  const [wishNumber, setWishNumber] = useState(1);
  const [survivedWishesCount, setSurvivedWishesCount] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);

  const victoryTimeoutRef = useRef(null);
  const lastRunOutcomeRef = useRef(null);

  // Settings state
  const [settings, setSettings] = useState(() => {
    let savedProvider = safeGetItem('genie_provider');
    if (!savedProvider || savedProvider === 'mock' || savedProvider === 'ollama') {
      savedProvider = 'ollama_strong';
      safeSetItem('genie_provider', 'ollama_strong');
    }

    let strongModel = safeGetItem('genie_ollamaStrongModel');
    if (!strongModel || strongModel === 'llama3.3') {
      strongModel = 'qwen2.5:7b';
      safeSetItem('genie_ollamaStrongModel', 'qwen2.5:7b');
    }

    let weakModel = safeGetItem('genie_ollamaWeakModel');
    if (!weakModel || weakModel === 'llama3.2') {
      weakModel = 'llama3.2:3b';
      safeSetItem('genie_ollamaWeakModel', 'llama3.2:3b');
    }

    return {
      masterVolume: 0.7,
      sfxVolume: 0.8,
      ambientVolume: 0.3,
      isMuted: false,
      gravity: 1.0,
      provider: savedProvider,
      credentials: {
        apiKey: safeGetItem('genie_apiKey') || (
          (savedProvider === 'gemini'
            ? (safeGetItem('genie_geminiApiKey') || import.meta.env?.VITE_GEMINI_API_KEY)
            : (safeGetItem('genie_groqApiKey') || import.meta.env?.VITE_GROQ_API_KEY)) || ''
        ),
        endpoint: safeGetItem('genie_endpoint') || import.meta.env?.VITE_OLLAMA_ENDPOINT || 'http://localhost:11434',
        model: safeGetItem('genie_model') || import.meta.env?.VITE_OLLAMA_MODEL || '',
        ollamaStrongModel: strongModel,
        ollamaWeakModel: weakModel
      }
    };
  });

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

  // Global Escape handler for modals & certificate overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (isSettingsModalOpen) {
        setIsSettingsModalOpen(false);
      } else if (isThemeModalOpen) {
        setIsThemeModalOpen(false);
      } else if (activeCertificate && !isCertificateMinimized) {
        setIsCertificateMinimized(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsModalOpen, isThemeModalOpen, activeCertificate, isCertificateMinimized]);

  // Clear pending victory timeout on unmount
  useEffect(() => {
    return () => {
      if (victoryTimeoutRef.current) {
        clearTimeout(victoryTimeoutRef.current);
      }
    };
  }, []);

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

  const clearVictoryTimeout = () => {
    if (victoryTimeoutRef.current) {
      clearTimeout(victoryTimeoutRef.current);
      victoryTimeoutRef.current = null;
    }
  };

  // Wish Submission Handler
  const handleMakeWish = async (wishText) => {
    if (isExecuting) return;

    clearVictoryTimeout();

    // Advance or reset wish progression cleanly if player dismissed minimized pill and typed another wish
    let effectiveWishNumber = wishNumber;
    if (lastRunOutcomeRef.current === 'died') {
      effectiveWishNumber = 1;
      setWishNumber(1);
      setSurvivedWishesCount(0);
    } else if (lastRunOutcomeRef.current === 'survived') {
      if (wishNumber >= maxWishes) {
        effectiveWishNumber = 1;
        setWishNumber(1);
        setSurvivedWishesCount(0);
      } else {
        effectiveWishNumber = wishNumber + 1;
        setWishNumber(effectiveWishNumber);
      }
    }
    lastRunOutcomeRef.current = null;

    setIsExecuting(true);
    setActiveCertificate(null);
    setIsCertificateMinimized(false);
    vfxSystem.spawnEmote(480, 400, 'QUESTION');

    const strongName = settings.credentials?.ollamaStrongModel || 'qwen2.5:7b';
    const weakName = settings.credentials?.ollamaWeakModel || 'llama3.2:3b';
    const providerLabel = settings.provider === 'ollama_strong'
      ? `Local Ollama (${strongName})`
      : settings.provider === 'ollama_weak'
      ? `Local Ollama (${weakName})`
      : settings.provider === 'groq'
      ? 'Groq Cloud (Llama-3.3)'
      : settings.provider === 'gemini'
      ? 'Gemini Cloud'
      : 'Local Director';

    setCurrentDialogue({
      speaker: customization?.player?.name || 'Player',
      text: `"${wishText}"`,
      loopholeScore: 90,
      loopholeExplanation: `[${providerLabel}] Directing synthesized choreography & custom pixel sprite...`,
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
          maxWishes
        },
        effectiveWishNumber
      );

      if (scenario) {
        if (scenario.from_cache) {
          vfxSystem.spawnFloatingText(480, 360, '⚡ CACHE HIT!', '#38bdf8', 16);
          setCurrentDialogue((prev) => ({
            ...prev,
            loopholeExplanation: `⚡ [CACHED WISH] Retrieved instantly from persistent local cache (source: ${scenario.cache_source || 'previous LLM run'})`
          }));
        } else if (scenario.fallback_used) {
          vfxSystem.spawnFloatingText(480, 360, '⚙️ PROCEDURAL SYNTH!', '#f59e0b', 16);
        } else {
          vfxSystem.spawnFloatingText(480, 360, '🧠 LLM GENERATED!', '#a855f7', 16);
        }
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
    setIsCertificateMinimized(false);
    setActiveCertificate(scenario);

    if (scenario.survived) {
      lastRunOutcomeRef.current = 'survived';
      audioSynth.playChime();
      vfxSystem.spawnEmote(480, 400, 'HEART');
      vfxSystem.spawnFloatingText(480, 360, 'AIRTIGHT SURVIVAL!', '#10b981', 18);
      setSurvivedWishesCount((prev) => prev + 1);

      // Check if final wish of this run was survived -> VICTORY!
      if (wishNumber >= maxWishes) {
        confetti({
          particleCount: 160,
          spread: 80,
          origin: { y: 0.5 }
        });
        clearVictoryTimeout();
        victoryTimeoutRef.current = setTimeout(() => {
          setCurrentDialogue({
            speaker: customization?.genie?.name || theme.name.split(':')[1]?.trim() || theme.name,
            text: customization?.genie?.victoryDialogue || theme.victoryDialogue,
            loopholeScore: 100,
            loopholeExplanation: 'CONGRATULATIONS: You have beaten the Monkey’s Paw across every wish!',
            voicePitch: 1.3,
            survived: true
          });
        }, 1200);
      }
    } else {
      lastRunOutcomeRef.current = 'died';
      audioSynth.playLaugh();
      vfxSystem.spawnFloatingText(480, 360, 'WISH TWISTED!', '#ef233c', 18);
    }
  };

  const handleResetSandbox = () => {
    clearVictoryTimeout();
    lastRunOutcomeRef.current = null;
    audioSynth.playButton();
    choreographyRunner.reset();
    setActiveCertificate(null);
    setIsCertificateMinimized(false);
    setIsExecuting(false);
    setWishNumber(1);
    setSurvivedWishesCount(0);
    setCurrentDialogue({
      speaker: customization?.genie?.name || theme.name.split(':')[1]?.trim() || theme.name,
      text: customization?.genie?.introDialogue || theme.introDialogue,
      loopholeScore: 100,
      loopholeExplanation: 'State your wish carefully... or your vessel will be harvested.',
      voicePitch: 1.0,
      survived: true
    });
    setResetTrigger((prev) => prev + 1);
  };

  const handleToggleOllama = () => {
    audioSynth.playButton();
    const nextProvider = settings.provider === 'ollama_strong' ? 'ollama_weak' : 'ollama_strong';
    const next = { ...settings, provider: nextProvider };
    setSettings(next);
    safeSetItem('genie_provider', nextProvider);
  };

  const handleSelectTheme = (themeId) => {
    clearVictoryTimeout();
    lastRunOutcomeRef.current = null;
    const freshThemes = getAvailableThemes();
    setThemes(freshThemes);
    setCurrentThemeId(themeId);
    safeSetItem('genie_theme_id', themeId);
    setActiveCertificate(null);
    setIsCertificateMinimized(false);
    setWishNumber(1);
    setSurvivedWishesCount(0);
    setResetTrigger((prev) => prev + 1);
  };

  const handleCertificateContinue = () => {
    if (!activeCertificate) return;
    audioSynth.playButton();
    clearVictoryTimeout();

    const wasSurvived = activeCertificate.survived;
    const completedAll = wasSurvived && wishNumber >= maxWishes;
    const nextWish = wasSurvived && !completedAll ? wishNumber + 1 : 1;

    lastRunOutcomeRef.current = null;
    setActiveCertificate(null);
    setIsCertificateMinimized(false);
    setIsExecuting(false);
    setWishNumber(nextWish);
    if (!wasSurvived || completedAll) {
      setSurvivedWishesCount(0);
    }

    setCurrentDialogue({
      speaker: customization?.genie?.name || theme.name.split(':')[1]?.trim() || theme.name,
      text: nextWish > 1
        ? `Wish ${nextWish} of ${maxWishes} awaits, mortal. Mind every clause of your next wish...`
        : (customization?.genie?.introDialogue || theme.introDialogue),
      loopholeScore: 100,
      loopholeExplanation: 'State your wish carefully... or your vessel will be harvested.',
      voicePitch: 1.0,
      survived: true
    });
    setResetTrigger((prev) => prev + 1);
  };

  const renderSourceBadge = (cert) => {
    if (cert.from_cache) {
      return (
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold shrink-0">
          ⚡ CACHED
        </span>
      );
    }
    if (cert.fallback_used || cert.generation_source === 'procedural_fallback' || cert.generation_source === 'procedural') {
      return (
        <span
          title={cert.fallback_reason || 'Procedural topic synthesis'}
          className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shrink-0"
        >
          ⚙️ PROCEDURAL
        </span>
      );
    }
    if (cert.generation_source === 'groq') {
      return (
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shrink-0">
          ☁️ GROQ CLOUD
        </span>
      );
    }
    if (cert.generation_source === 'gemini') {
      return (
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold shrink-0">
          ✨ GEMINI CLOUD
        </span>
      );
    }
    return (
      <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold shrink-0">
        🧠 LOCAL LLM
      </span>
    );
  };

  const strongModelDisplay = settings.credentials?.ollamaStrongModel || 'qwen2.5:7b';
  const weakModelDisplay = settings.credentials?.ollamaWeakModel || 'llama3.2:3b';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-slate-100 flex flex-col font-pixel select-none">
      {/* ======================================================== */}
      {/* TOP HUD BAR & CONTROLS                                   */}
      {/* ======================================================== */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between gap-2 px-3 md:px-5 py-2.5 bg-black/60 backdrop-blur-md border-b border-slate-800">
        {/* Title & Brand */}
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-3.5 h-3.5 rounded-full animate-pulse shadow-md shrink-0"
            style={{ backgroundColor: theme.chamberColors.accentHex }}
          />
          <div className="min-w-0">
            <h1
              className="text-xs md:text-sm font-bold tracking-wider uppercase text-slate-100 flex items-center gap-2 truncate"
              style={{ textShadow: `0 0 10px ${theme.chamberColors.accentHex}80` }}
            >
              <span>GENIE</span>
              <span className="text-[10px] text-slate-400 font-normal hidden sm:inline truncate">
                {theme.name}
              </span>
            </h1>
          </div>
        </div>

        {/* Action Controls (Mute, Theme, Ollama Switch, Settings, Reset) */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              const nextMuted = !settings.isMuted;
              audioSynth.setMuted(nextMuted);
              setSettings({ ...settings, isMuted: nextMuted });
            }}
            aria-label={settings.isMuted ? 'Unmute audio' : 'Mute audio'}
            title={settings.isMuted ? 'Unmute' : 'Mute'}
            className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {settings.isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              audioSynth.playButton();
              setIsThemeModalOpen(true);
            }}
            aria-label="Open theme sets and character customizer"
            title="Theme Sets & Character Customizer"
            className="flex items-center gap-1 px-2 md:px-2.5 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-slate-800 text-slate-300 hover:text-white transition-colors text-xs font-bold"
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {customization?.genie?.name ? customization.genie.name.split(' ')[0].toUpperCase() : currentThemeId.split('_')[0].toUpperCase()}
            </span>
          </button>

          <button
            type="button"
            onClick={handleToggleOllama}
            aria-label={`Switch local model (currently ${settings.provider})`}
            title={`Active Local Model: ${settings.provider === 'ollama_strong' ? `Strong (${strongModelDisplay})` : settings.provider === 'ollama_weak' ? `Weak (${weakModelDisplay})` : settings.provider}. Click to toggle Ollama Strong/Weak.`}
            className={`flex items-center gap-1.5 px-2 md:px-2.5 py-1.5 rounded-xl border text-[10px] font-bold tracking-wider transition-all shadow-sm ${
              settings.provider === 'ollama_strong'
                ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-300'
                : settings.provider === 'ollama_weak'
                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50 text-emerald-300'
                : 'bg-indigo-500/20 hover:bg-indigo-500/30 border-indigo-500/50 text-indigo-300'
            }`}
          >
            {settings.provider === 'ollama_strong' ? (
              <>
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span className="sm:hidden">STRONG</span>
                <span className="hidden sm:inline">STRONG ({strongModelDisplay})</span>
              </>
            ) : settings.provider === 'ollama_weak' ? (
              <>
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="sm:hidden">WEAK</span>
                <span className="hidden sm:inline">WEAK ({weakModelDisplay})</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>{settings.provider.toUpperCase()}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              audioSynth.playButton();
              setIsSettingsModalOpen(true);
            }}
            aria-label="Open LLM router and physics settings"
            title="LLM Router & Physics Settings"
            className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetSandbox}
            aria-label="Reset sandbox"
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
          customization={customization}
          wishNumber={wishNumber}
          onDialogueUpdate={setCurrentDialogue}
          onWishCompleted={handleWishCompleted}
          resetTrigger={resetTrigger}
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
            <div
              className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 rounded-2xl border-2 backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom duration-200 select-none max-w-[92vw]"
              style={{
                backgroundColor: theme.chamberColors.bgBottom ? `${theme.chamberColors.bgBottom}ee` : '#0f1325ee',
                borderColor: activeCertificate.survived ? '#10b981' : theme.chamberColors.accentHex,
                boxShadow: `0 0 25px ${activeCertificate.survived ? '#10b98144' : theme.chamberColors.accentHex + '44'}`
              }}
            >
              <div className="flex items-center gap-2 text-xs font-pixel font-bold min-w-0">
                {activeCertificate.survived ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Skull className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className={`${activeCertificate.survived ? 'text-emerald-300' : 'text-rose-300'} truncate`}>
                  {activeCertificate.survived ? 'WISH SURVIVED!' : 'RAGDOLL SLAIN!'} ({activeCertificate.loophole_score}/100)
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsCertificateMinimized(false)}
                className="px-3 py-1 rounded-xl text-xs font-pixel font-bold tracking-wider uppercase transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0"
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
                  setIsCertificateMinimized(false);
                }}
                aria-label="Dismiss outcome pill"
                title="Dismiss"
                className="p-1 rounded-lg bg-black/40 hover:bg-black/60 border border-slate-700 text-slate-400 hover:text-white shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Wish Outcome Certificate"
              onClick={() => setIsCertificateMinimized(true)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm select-none animate-in fade-in zoom-in-95 duration-200"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-2xl border-2 p-5 md:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto"
                style={{
                  backgroundColor: theme.chamberColors.bgBottom ? `${theme.chamberColors.bgBottom}f6` : '#0f1325f6',
                  borderColor: theme.chamberColors.accentHex,
                  boxShadow: `0 0 45px ${theme.chamberColors.accentHex}55`
                }}
              >
                {/* Header Controls: View Arena (Minimize) & Close */}
                <div className="flex items-center justify-end gap-1.5 mb-2">
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
                    onClick={() => {
                      setActiveCertificate(null);
                      setIsCertificateMinimized(false);
                    }}
                    aria-label="Close certificate"
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
                    {customization?.genie?.role || theme.role}
                  </span>
                  <h2 className="text-base md:text-lg font-bold text-slate-100 mt-1 uppercase">
                    {activeCertificate.survived
                      ? (activeCertificate.loophole_score >= 80 ? 'AIRTIGHT WISH — YOU SURVIVED!' : 'WISH GRANTED LITERALLY — YOU SURVIVED!')
                      : 'WISH GRANTED LITERALLY — YOU DIED'}
                  </h2>
                </div>

                {/* Certificate Details */}
                <div className="space-y-2.5 text-xs font-pixel">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-slate-400 uppercase text-[10px] block font-bold">WISH COVENANT:</span>
                      <span className="text-sm font-bold text-amber-300 break-words">
                        "{activeCertificate.wishText}"
                      </span>
                    </div>
                    {renderSourceBadge(activeCertificate)}
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
                        {activeCertificate.survived ? (activeCertificate.loophole_score >= 80 ? 'ALIVE & TRIUMPHANT' : 'ALIVE & DUPED') : 'DISARTICULATED'}
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
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCertificateMinimized(true)}
                    className="px-4 py-2 rounded-xl font-pixel text-xs font-bold tracking-wider uppercase transition-all bg-black/50 hover:bg-black/70 border border-slate-700 text-slate-300 hover:text-white"
                  >
                    INSPECT ARENA
                  </button>

                  <button
                    type="button"
                    onClick={handleCertificateContinue}
                    className="px-6 py-2 rounded-xl font-pixel text-xs font-bold tracking-wider uppercase transition-all shadow-lg active:scale-95"
                    style={{
                      backgroundColor: theme.chamberColors.accentHex,
                      color: '#0a0d1b'
                    }}
                  >
                    {activeCertificate.survived
                      ? (wishNumber >= maxWishes ? 'CLAIM VICTORY (NEW RUN)' : `PROCEED TO WISH (${wishNumber + 1}/${maxWishes})`)
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
