// Freeform Wish Input + Wish Orb Counter + Quick-Preset Chips + Action Controls
import React, { useState } from 'react';
import { audioSynth } from '../engine/audioSynth';
import { Send, RotateCcw, Sparkles, CircleDot } from 'lucide-react';

export default function WishInputBar({
  onMakeWish,
  onResetSandbox,
  isExecuting,
  theme,
  wishNumber = 1,
  maxWishes = 3
}) {
  const [wishInput, setWishInput] = useState('');

  const quickPresets = [
    { label: '💰 Rich', text: 'I want to be rich' },
    { label: '🦌 Million Bucks', text: 'I want a million bucks' },
    { label: '🥪 Sandwich', text: 'Make me a sandwich' },
    { label: '🚀 Fly', text: 'I want to fly' },
    { label: '🔥 Hot', text: 'I want to be hot' },
    { label: '💔 Girlfriend', text: 'I want a girlfriend' },
    { label: '🧊 Freeze', text: 'I want peace and quiet' },
    { label: '⚰️ Immortal', text: 'I want immortality' },
    { label: '🕊️ World Peace', text: 'I want world peace' },
    { label: '🎈 Balloons', text: 'I want to fly with balloons' },
    { label: '📝 Exams (Tetris)', text: 'I want to pass my exams' },
    { label: '🏎️ Sports Car', text: 'I want a sports car' },
    { label: '🍵 Herbal Tea (Airtight)', text: 'I wish for a warm cup of herbal tea placed gently on the table' },
    { label: '💵 $1 Bill (Airtight)', text: 'I wish for one legal tender dollar bill delivered peacefully into my open palm' }
  ];

  const handleSubmit = (e) => {
    e?.preventDefault();
    const clean = wishInput.trim();
    if (!clean || isExecuting) return;

    audioSynth.playButton();
    onMakeWish(clean);
    setWishInput('');
  };

  const handleSelectPreset = (presetText) => {
    if (isExecuting) return;
    audioSynth.playButton();
    onMakeWish(presetText);
    setWishInput('');
  };

  const remainingOrbs = Math.max(0, maxWishes - (wishNumber - 1));

  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-11/12 max-w-3xl z-40 select-none space-y-1.5">
      {/* Quick-Preset Chips Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {quickPresets.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isExecuting}
            onClick={() => handleSelectPreset(chip.text)}
            className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-pixel font-bold bg-black/60 hover:bg-black/85 border border-slate-700/80 hover:border-amber-400 text-slate-300 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Main Bar: Input + Orb Counter + Grant + Reset Controls */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 p-2 rounded-2xl border-2 backdrop-blur-md shadow-2xl transition-all"
        style={{
          backgroundColor: theme?.chamberColors?.bgBottom ? `${theme.chamberColors.bgBottom}f2` : '#0f1325f2',
          borderColor: theme?.chamberColors?.accentHex || '#ffd166',
          boxShadow: `0 0 20px ${theme?.chamberColors?.accentHex ? theme.chamberColors.accentHex + '33' : 'rgba(255,209,102,0.2)'}`
        }}
      >
        {/* Wish Orb Counter Badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/60 border border-slate-800 shrink-0"
          title={`Wish ${wishNumber} of ${maxWishes} (${remainingOrbs} remaining)`}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: theme?.chamberColors?.accentHex || '#ffd166' }} />
          <div className="flex gap-1 items-center">
            {Array.from({ length: maxWishes }).map((_, i) => (
              <CircleDot
                key={i}
                className="w-3 h-3 transition-all"
                style={{
                  color: i < remainingOrbs ? theme?.chamberColors?.accentHex || '#ffd166' : '#475569',
                  opacity: i < remainingOrbs ? 1 : 0.35
                }}
              />
            ))}
            <span className="text-[10px] text-slate-400 font-pixel ml-1 font-bold">
              {wishNumber}/{maxWishes}
            </span>
          </div>
        </div>

        {/* Text Input Field */}
        <input
          type="text"
          value={wishInput}
          onChange={(e) => setWishInput(e.target.value)}
          disabled={isExecuting}
          placeholder={isExecuting ? "Executing wish choreography..." : "Enter your wish (or pick a preset chip above)..."}
          className="flex-1 bg-black/40 border border-slate-700/60 focus:border-amber-400 rounded-xl px-4 py-2 text-xs md:text-sm font-pixel text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors disabled:opacity-50"
        />

        {/* Submit Grant Button */}
        <button
          type="submit"
          disabled={isExecuting || !wishInput.trim()}
          className="px-4 py-2 rounded-xl font-pixel text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          style={{
            backgroundColor: theme?.chamberColors?.accentHex || '#ffd166',
            color: '#090d1c'
          }}
        >
          <span>GRANT</span>
          <Send className="w-3.5 h-3.5" />
        </button>

        {/* Reset Sandbox Button */}
        <button
          type="button"
          onClick={() => {
            audioSynth.playButton();
            onResetSandbox();
          }}
          title="Reset World & Respawn Ragdoll"
          className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
