// Akinator-Style Typewriter Dialogue with Synced Voice Blips, Loophole Meter & Non-Obstructive HUD
import React, { useState, useEffect, useRef } from 'react';
import { audioSynth } from '../engine/audioSynth';
import { safeGetItem, safeSetItem } from '../utils/safeStorage';
import {
  ShieldAlert,
  Scale,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
  X,
  Compass,
  MessageSquare
} from 'lucide-react';

export default function DialogueBox({ dialogue, theme, onDismiss, isExecuting = false }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showLegalBreakdown, setShowLegalBreakdown] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [positionMode, setPositionMode] = useState(() => {
    return safeGetItem('genie_dialogue_pos') || 'top-right';
  });

  const typingTimerRef = useRef(null);

  const speaker = dialogue?.speaker || 'The Genie';
  const fullText = dialogue?.text || '';
  const loopholeScore = dialogue?.loopholeScore ?? 95;
  const loopholeExplanation = dialogue?.loopholeExplanation || '';
  const survived = dialogue?.survived ?? (loopholeScore >= 80);
  const voicePitch = dialogue?.voicePitch || 1.0;

  // Auto-collapse and minimize dialogue during active choreography execution
  // so the player gets a 100% unobstructed view of the physics slapstick and animations
  useEffect(() => {
    if (isExecuting) {
      setShowLegalBreakdown(false);
      setIsMinimized(true);
    } else if (dialogue) {
      setIsMinimized(false);
    }
  }, [isExecuting, dialogue]);

  useEffect(() => {
    if (!fullText) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    let charIdx = 0;

    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    typingTimerRef.current = setInterval(() => {
      charIdx++;
      setDisplayedText(fullText.substring(0, charIdx));

      if (charIdx % 2 === 0 && charIdx < fullText.length) {
        audioSynth.playVoiceBlip(voicePitch * 440 + (Math.random() * 40 - 20));
      }

      if (charIdx >= fullText.length) {
        clearInterval(typingTimerRef.current);
        setIsTyping(false);
      }
    }, 22);

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [fullText, voicePitch]);

  const handleClick = () => {
    if (isTyping) {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      setDisplayedText(fullText);
      setIsTyping(false);
    }
  };

  const cyclePosition = (e) => {
    e?.stopPropagation();
    const modes = ['top-right', 'top-center', 'bottom'];
    const nextIdx = (modes.indexOf(positionMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setPositionMode(nextMode);
    safeSetItem('genie_dialogue_pos', nextMode);
  };

  if (!dialogue || !fullText) return null;

  const scoreColor = survived
    ? '#10b981'
    : loopholeScore > 65
    ? '#ef4444'
    : '#f59e0b';

  // Coordinate classes based on user position preference (minimized pill always docks top-right to preserve viewport)
  const positionClasses = isMinimized
    ? 'top-14 right-3 md:right-6 max-w-sm md:max-w-md'
    : ({
        'top-right': 'top-14 right-3 md:right-6 w-11/12 max-w-md lg:max-w-lg',
        'top-center': 'top-14 left-1/2 -translate-x-1/2 w-11/12 max-w-xl',
        'bottom': 'bottom-24 left-1/2 -translate-x-1/2 w-11/12 max-w-xl'
      }[positionMode] || 'top-14 right-3 md:right-6 w-11/12 max-w-md lg:max-w-lg');

  // Minimized Compact Pill Mode
  if (isMinimized) {
    return (
      <div
        className={`absolute ${positionClasses} z-30 select-none transition-all duration-300 animate-in fade-in`}
      >
        <div
          onClick={() => setIsMinimized(false)}
          className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border-2 backdrop-blur-md shadow-2xl cursor-pointer hover:brightness-110 transition-all"
          style={{
            backgroundColor: theme?.chamberColors?.bgBottom
              ? `${theme.chamberColors.bgBottom}dd`
              : 'rgba(15, 19, 37, 0.88)',
            borderColor: theme?.chamberColors?.accentHex || '#ffd166',
            boxShadow: `0 0 20px ${theme?.chamberColors?.accentHex ? theme.chamberColors.accentHex + '40' : 'rgba(255,209,102,0.25)'}`
          }}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <MessageSquare className="w-3.5 h-3.5 shrink-0" style={{ color: theme?.chamberColors?.accentHex || '#ffd166' }} />
            <span
              className="font-pixel text-[11px] font-bold uppercase truncate"
              style={{ color: theme?.chamberColors?.accentHex || '#ffd166' }}
            >
              {speaker}:
            </span>
            <span className="font-pixel text-[11px] text-slate-200 truncate">
              "{displayedText.slice(0, 42)}..."
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              aria-label="Expand dialogue"
              title="Expand Dialogue"
              className="p-1 rounded bg-black/40 hover:bg-black/60 text-slate-300 hover:text-white"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            {onDismiss && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
                aria-label="Dismiss dialogue"
                title="Dismiss"
                className="p-1 rounded bg-black/40 hover:bg-black/60 text-slate-300 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full Non-Obstructive Floating Dialogue Card
  return (
    <div
      onClick={handleClick}
      className={`absolute ${positionClasses} z-30 select-none transition-all duration-300`}
    >
      <div
        className="p-3.5 md:p-4 rounded-2xl shadow-2xl border-2 backdrop-blur-md transition-all relative overflow-hidden"
        style={{
          backgroundColor: theme?.chamberColors?.bgBottom
            ? `${theme.chamberColors.bgBottom}${isExecuting ? 'd0' : 'e8'}`
            : isExecuting ? 'rgba(15, 19, 37, 0.82)' : 'rgba(15, 19, 37, 0.94)',
          borderColor: theme?.chamberColors?.accentHex || '#ffd166',
          boxShadow: `0 0 30px ${theme?.chamberColors?.accentHex ? theme.chamberColors.accentHex + '33' : 'rgba(255,209,102,0.2)'}`
        }}
      >
        {/* Subtle accent corner glow */}
        <div
          className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20"
          style={{ backgroundColor: theme?.chamberColors?.accentHex || '#ffd166' }}
        />

        {/* Header Bar: Speaker, Airtight Score, Controls */}
        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-700/60 gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="font-pixel text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-black/60 border"
              style={{
                color: theme?.chamberColors?.accentHex || '#ffd166',
                borderColor: theme?.chamberColors?.accentHex || '#ffd166'
              }}
            >
              {speaker}
            </span>

            {/* Loophole Meter Tag */}
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-pixel font-bold bg-black/40 border"
              style={{ color: scoreColor, borderColor: scoreColor + '66' }}
              title="Cosmic loophole & airtightness rating"
            >
              {survived ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-3 h-3 text-rose-400" />
              )}
              <span>AIRTIGHT: {loopholeScore}/100</span>
            </div>
          </div>

          {/* Action Icons: Legal Toggle, Position Switcher, Minimize, Close */}
          <div className="flex items-center gap-1">
            {loopholeExplanation && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLegalBreakdown(!showLegalBreakdown);
                }}
                title={showLegalBreakdown ? "Hide Legal Ruling" : "View Legal Ruling"}
                className="flex items-center gap-1 text-[10px] font-pixel text-slate-300 hover:text-white bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 transition-colors"
              >
                <Scale className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">RULING</span>
                {showLegalBreakdown ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}

            {/* Cycle Position Button */}
            <button
              type="button"
              onClick={cyclePosition}
              aria-label={`Cycle dialogue dock position (${positionMode})`}
              title={`Dock Position: ${positionMode.toUpperCase()} (Click to cycle)`}
              className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Compass className="w-3 h-3" />
            </button>

            {/* Minimize to Pill Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(true);
              }}
              aria-label="Minimize dialogue"
              title="Minimize Dialogue"
              className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Minimize2 className="w-3 h-3" />
            </button>

            {/* Dismiss Button */}
            {onDismiss && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
                aria-label="Dismiss dialogue"
                title="Dismiss Dialogue"
                className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Loophole Meter Visual Progress Bar */}
        <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden mb-2.5 border border-slate-800">
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{
              width: `${Math.max(0, Math.min(100, Number(loopholeScore) || 0))}%`,
              backgroundColor: scoreColor,
              boxShadow: `0 0 8px ${scoreColor}`
            }}
          />
        </div>

        {/* Main Dialogue Text */}
        <p className="font-pixel text-xs md:text-sm leading-relaxed text-slate-100 min-h-[38px]">
          {displayedText}
          {isTyping && <span className="inline-block w-1.5 h-3.5 bg-amber-400 ml-1 animate-pulse" />}
        </p>

        {/* Legal Explanation Drawer */}
        {showLegalBreakdown && loopholeExplanation && (
          <div className="mt-2.5 pt-2 border-t border-slate-700/60 bg-black/60 p-2.5 rounded-xl border border-slate-800 text-xs font-pixel space-y-1 animate-in fade-in duration-200">
            <span className="text-amber-300 font-bold uppercase text-[10px] block">
              LEGAL & PHYSICAL POST-MORTEM:
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">{loopholeExplanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
