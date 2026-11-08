// Akinator-Style Typewriter Dialogue with Synced Voice Blips, Loophole Meter & Legal Breakdown
import React, { useState, useEffect, useRef } from 'react';
import { audioSynth } from '../engine/audioSynth';
import { ShieldAlert, Scale, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function DialogueBox({ dialogue, theme, onDismiss }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showLegalBreakdown, setShowLegalBreakdown] = useState(false);
  const typingTimerRef = useRef(null);

  const speaker = dialogue?.speaker || 'The Genie';
  const fullText = dialogue?.text || '';
  const loopholeScore = dialogue?.loopholeScore ?? 95;
  const loopholeExplanation = dialogue?.loopholeExplanation || '';
  const survived = dialogue?.survived ?? (loopholeScore >= 80);
  const voicePitch = dialogue?.voicePitch || 1.0;

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
    }, 24);

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

  if (!dialogue || !fullText) return null;

  const scoreColor = survived
    ? '#10b981'
    : loopholeScore > 65
    ? '#ef4444'
    : '#f59e0b';

  return (
    <div
      onClick={handleClick}
      className="absolute bottom-20 left-1/2 -translate-x-1/2 w-11/12 max-w-2xl z-30 select-none transition-all duration-300"
    >
      <div
        className="p-4 rounded-2xl shadow-2xl border-2 backdrop-blur-md transition-colors"
        style={{
          backgroundColor: theme?.chamberColors?.bgBottom ? `${theme.chamberColors.bgBottom}f4` : 'rgba(15, 19, 37, 0.95)',
          borderColor: theme?.chamberColors?.accentHex || '#ffd166',
          boxShadow: `0 0 30px ${theme?.chamberColors?.accentHex ? theme.chamberColors.accentHex + '33' : 'rgba(255,209,102,0.2)'}`
        }}
      >
        {/* Header Bar: Speaker & Loophole Meter */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <span
              className="font-pixel text-xs font-bold tracking-widest uppercase px-2.5 py-0.5 rounded bg-black/60 border"
              style={{
                color: theme?.chamberColors?.accentHex || '#ffd166',
                borderColor: theme?.chamberColors?.accentHex || '#ffd166'
              }}
            >
              {speaker}
            </span>

            {/* Loophole Meter Tag */}
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-pixel font-bold bg-black/40 border"
              style={{ color: scoreColor, borderColor: scoreColor + '66' }}
            >
              {survived ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-3 h-3 text-rose-400" />
              )}
              <span>AIRTIGHT SCORE: {loopholeScore}/100</span>
            </div>
          </div>

          {/* Toggle Legal Explanation Drawer */}
          {loopholeExplanation && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowLegalBreakdown(!showLegalBreakdown);
              }}
              className="flex items-center gap-1 text-[10px] font-pixel text-slate-300 hover:text-white bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 transition-colors"
            >
              <Scale className="w-3 h-3 text-amber-400" />
              <span>LEGAL RULING</span>
              {showLegalBreakdown ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          )}
        </div>

        {/* Loophole Meter Visual Progress Bar */}
        <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden mb-3 border border-slate-800">
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{
              width: `${loopholeScore}%`,
              backgroundColor: scoreColor,
              boxShadow: `0 0 8px ${scoreColor}`
            }}
          />
        </div>

        {/* Main Dialogue Text */}
        <p className="font-pixel text-sm md:text-base leading-relaxed text-slate-100 min-h-[44px]">
          {displayedText}
          {isTyping && <span className="inline-block w-2 h-4 bg-amber-400 ml-1 animate-pulse" />}
        </p>

        {/* Legal Explanation Drawer */}
        {showLegalBreakdown && loopholeExplanation && (
          <div className="mt-3 pt-2 border-t border-slate-700/60 bg-black/50 p-2.5 rounded-xl border border-slate-800 text-xs font-pixel space-y-1 animate-in fade-in duration-200">
            <span className="text-amber-300 font-bold uppercase text-[10px] block">
              LEGAL & PHYSICAL POST-MORTEM:
            </span>
            <p className="text-slate-300 leading-relaxed">{loopholeExplanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
