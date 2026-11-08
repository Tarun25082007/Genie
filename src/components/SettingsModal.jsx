// Settings Modal: Provider Selector (Offline Mock, Groq, Gemini, Ollama) + Connection Tester + Audio/Physics
import React, { useState } from 'react';
import { audioSynth } from '../engine/audioSynth';
import { testProviderConnection } from '../services/llmDirector';
import { Settings, Volume2, VolumeX, Sliders, Cpu, Key, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

export default function SettingsModal({
  settings,
  onUpdateSettings,
  onClose,
  theme
}) {
  const [testStatus, setTestStatus] = useState(null);

  const handleProviderChange = (provider) => {
    audioSynth.playButton();
    const next = { ...settings, provider };
    onUpdateSettings(next);
    localStorage.setItem('genie_provider', provider);
    setTestStatus(null);
  };

  const handleCredentialChange = (field, val) => {
    const next = {
      ...settings,
      credentials: {
        ...settings.credentials,
        [field]: val
      }
    };
    onUpdateSettings(next);
    localStorage.setItem(`genie_${field}`, val);
  };

  const handleTestConnection = async () => {
    setTestStatus({ loading: true, message: 'Testing connection...' });
    const provider = settings.provider || 'mock';
    const creds = settings.credentials || {};

    const res = await testProviderConnection(
      provider,
      creds.apiKey,
      creds.endpoint
    );

    setTestStatus({
      loading: false,
      success: res.success,
      message: res.message
    });
  };

  const handleVolumeChange = (type, val) => {
    const num = parseFloat(val);
    if (type === 'master') {
      audioSynth.setMasterVolume(num);
      onUpdateSettings({ ...settings, masterVolume: num });
    } else if (type === 'sfx') {
      audioSynth.setSfxVolume(num);
      onUpdateSettings({ ...settings, sfxVolume: num });
    } else if (type === 'ambient') {
      audioSynth.setAmbientVolume(num);
      onUpdateSettings({ ...settings, ambientVolume: num });
    }
  };

  const handleMuteToggle = () => {
    const nextMuted = !settings.isMuted;
    audioSynth.setMuted(nextMuted);
    onUpdateSettings({ ...settings, isMuted: nextMuted });
  };

  const provider = settings.provider || 'mock';
  const creds = settings.credentials || {};
  const accent = theme?.chamberColors?.accentHex || '#ffd166';
  const bg = theme?.chamberColors?.bgBottom || '#0f1325';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div
        className="w-full max-w-xl rounded-2xl border-2 p-5 shadow-2xl max-h-[92vh] overflow-y-auto"
        style={{
          backgroundColor: bg,
          borderColor: accent,
          boxShadow: `0 0 35px ${accent}44`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" style={{ color: accent }} />
            <div>
              <h2 className="font-pixel text-sm md:text-base font-bold text-slate-100 uppercase">
                ENGINE & DIRECTOR SETTINGS
              </h2>
              <p className="text-[11px] text-slate-400 font-pixel">
                Multi-provider LLM director, audio synth & physics parameters
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

        <div className="space-y-4 text-xs font-pixel">
          {/* 1. Multi-Provider LLM Director Router */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4" /> LLM DIRECTOR ROUTER
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE: {provider.toUpperCase()}
              </span>
            </div>

            {/* Provider Radio Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'mock', label: 'Offline Mock' },
                { id: 'groq', label: 'Groq (Llama-3.3)' },
                { id: 'gemini', label: 'Gemini 2.5' },
                { id: 'ollama', label: 'Local Ollama' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleProviderChange(p.id)}
                  className={`px-2.5 py-2 rounded-lg border text-center transition-all ${
                    provider === p.id
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Credential Inputs based on Provider */}
            {provider === 'groq' && (
              <div className="space-y-1.5 pt-1">
                <label className="text-slate-300 block">Groq API Key (gsk_...):</label>
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-500 shrink-0" />
                  <input
                    type="password"
                    placeholder="gsk_..."
                    value={creds.apiKey || ''}
                    onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                    className="flex-1 bg-black/60 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {provider === 'gemini' && (
              <div className="space-y-1.5 pt-1">
                <label className="text-slate-300 block">Google Gemini API Key (AIzaSy...):</label>
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-500 shrink-0" />
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={creds.apiKey || ''}
                    onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                    className="flex-1 bg-black/60 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {provider === 'ollama' && (
              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-slate-300 block mb-1">Ollama Endpoint URL:</label>
                  <input
                    type="text"
                    placeholder="http://localhost:11434"
                    value={creds.endpoint || 'http://localhost:11434'}
                    onChange={(e) => handleCredentialChange('endpoint', e.target.value)}
                    className="w-full bg-black/60 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Model Name:</label>
                  <input
                    type="text"
                    placeholder="llama3"
                    value={creds.model || 'llama3'}
                    onChange={(e) => handleCredentialChange('model', e.target.value)}
                    className="w-full bg-black/60 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {/* Connection Tester Button & Status Banner */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus?.loading}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {testStatus?.loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                TEST CONNECTION
              </button>

              {testStatus && !testStatus.loading && (
                <span
                  className={`text-[11px] font-bold flex items-center gap-1 ${
                    testStatus.success ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {testStatus.success ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  {testStatus.message}
                </span>
              )}
            </div>
          </div>

          {/* 2. Audio Synthesizer Controls */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4" /> RETRO AUDIO SYNTHESIZER
              </span>
              <button
                onClick={handleMuteToggle}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                  settings.isMuted
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {settings.isMuted ? 'MUTED' : 'ACTIVE'}
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Master Volume</span>
                  <span>{Math.round(settings.masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.masterVolume}
                  onChange={(e) => handleVolumeChange('master', e.target.value)}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>SFX Synth Volume</span>
                  <span>{Math.round(settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => handleVolumeChange('sfx', e.target.value)}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Ambient Scale Drone</span>
                  <span>{Math.round(settings.ambientVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.ambientVolume}
                  onChange={(e) => handleVolumeChange('ambient', e.target.value)}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 3. Physics Simulation */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800 space-y-2">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4" /> MATTER.JS GRAVITY
            </span>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Vertical Gravity (G)</span>
              <span>{settings.gravity.toFixed(2)} G</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={settings.gravity}
              onChange={(e) =>
                onUpdateSettings({ ...settings, gravity: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex justify-end">
          <button
            onClick={() => {
              audioSynth.playButton();
              onClose();
            }}
            className="px-5 py-2 rounded-xl font-pixel text-xs font-bold tracking-wider uppercase transition-all shadow-md"
            style={{
              backgroundColor: accent,
              color: '#090d1c'
            }}
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}
