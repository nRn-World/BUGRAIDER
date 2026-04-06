
import React, { useState, useEffect, useRef } from 'react';
import { AppView, ScoreEntry } from '../types';
import { getJerryTaunt } from '../services/geminiService';
import { useProgress } from '../context/ProgressContext';
import { AudioEngine } from '../services/AudioEngine';

const getSeasonTheme = () => {
  const month = new Date().getMonth();
  if (month === 11 || month <= 1) return 'winter';
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  return 'autumn';
};

const SKINS: Record<string, { name: string; color: string; accent: string; unlockHint: string }> = {
  default: { name: 'Neon Blue', color: '#4169E1', accent: '#333', unlockHint: 'Default' },
  ember: { name: 'Ember', color: '#e85d2c', accent: '#4a1d0d', unlockHint: 'Defeat 60 enemies' },
  frost: { name: 'Frost', color: '#62b7ff', accent: '#27415f', unlockHint: 'Collect 300 fish' },
  shadow: { name: 'Shadow', color: '#4f5d75', accent: '#141b2d', unlockHint: 'Reach combo x10' },
  aurora: { name: 'Aurora', color: '#29b88f', accent: '#0a3d33', unlockHint: 'Beat 3 bosses' },
};

/** Stylized Cat Component for Menu that matches the in-game character **/
const CatMenuIcon: React.FC = () => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    let timeoutId: number;

    const scheduleBlink = () => {
      const nextBlinkDelay = Math.random() * 5000 + 2000;

      timeoutId = window.setTimeout(() => {
        setIsBlinking(true);
        window.setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 150);
      }, nextBlinkDelay);
    };

    scheduleBlink();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="relative size-24 md:size-32 animate-bounce-slow">
      {/* Ears - matches in-game triangle style */}
      <div className="absolute top-0 left-[5%] w-8 h-10 md:w-10 md:h-12 bg-[#333] clip-triangle -rotate-12"></div>
      <div className="absolute top-0 right-[5%] w-8 h-10 md:w-10 md:h-12 bg-[#333] clip-triangle rotate-12"></div>

      {/* Head/Body */}
      <div className="absolute inset-0 top-4 bg-[#4169E1] rounded-full shadow-2xl overflow-visible border-b-4 border-black/10">

        {/* Eyes with Blinking Logic */}
        {isBlinking ? (
          <>
            <div className="absolute top-[40%] left-[20%] w-5 md:w-7 h-[2px] bg-black/60 rounded-full"></div>
            <div className="absolute top-[40%] right-[20%] w-5 md:w-7 h-[2px] bg-black/60 rounded-full"></div>
          </>
        ) : (
          <>
            <div className="absolute top-[32%] left-[20%] size-5 md:size-7 bg-white rounded-full flex items-center justify-center">
              <div className="size-2 md:size-3 bg-green-600 rounded-full"></div>
            </div>
            <div className="absolute top-[32%] right-[20%] size-5 md:size-7 bg-white rounded-full flex items-center justify-center">
              <div className="size-2 md:size-3 bg-green-600 rounded-full"></div>
            </div>
          </>
        )}

        {/* Nose */}
        <div className="absolute top-[52%] left-1/2 -translate-x-1/2 size-3 md:size-4 bg-pink-400 rounded-full z-10"></div>

        {/* Whiskers */}
        <div className="absolute top-[58%] left-[25%] w-[45%] h-2 md:h-3 bg-black origin-right -rotate-[5deg] -translate-x-full" style={{ clipPath: 'polygon(100% 0%, 100% 100%, 0% 60%, 0% 40%)' }}></div>
        <div className="absolute top-[66%] left-[25%] w-[45%] h-2 md:h-3 bg-black origin-right -translate-x-full" style={{ clipPath: 'polygon(100% 0%, 100% 100%, 0% 60%, 0% 40%)' }}></div>
        <div className="absolute top-[74%] left-[25%] w-[45%] h-2 md:h-3 bg-black origin-right rotate-[5deg] -translate-x-full" style={{ clipPath: 'polygon(100% 0%, 100% 100%, 0% 60%, 0% 40%)' }}></div>

        <div className="absolute top-[58%] right-[25%] w-[45%] h-2 md:h-3 bg-black origin-left rotate-[5deg] translate-x-full" style={{ clipPath: 'polygon(0% 0%, 0% 100%, 100% 60%, 100% 40%)' }}></div>
        <div className="absolute top-[66%] right-[25%] w-[45%] h-2 md:h-3 bg-black origin-left translate-x-full" style={{ clipPath: 'polygon(0% 0%, 0% 100%, 100% 60%, 100% 40%)' }}></div>
        <div className="absolute top-[74%] right-[25%] w-[45%] h-2 md:h-3 bg-black origin-left -rotate-[5deg] translate-x-full" style={{ clipPath: 'polygon(0% 0%, 0% 100%, 100% 60%, 100% 40%)' }}></div>

        {/* Mouth */}
        <div className="absolute top-[62%] left-1/2 -translate-x-1/2 flex gap-0">
          <div className="w-4 md:w-6 h-3 md:h-4 border-b-2 border-black rounded-full"></div>
          <div className="w-4 md:w-6 h-3 md:h-4 border-b-2 border-black rounded-full"></div>
        </div>
      </div>

      <style>{`
        .clip-triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `}</style>
    </div>
  );
};

/** Injured Cat Visual for Game Over Screen **/
const InjuredCatVisual: React.FC = () => {
  return (
    <div className="relative w-full flex-1 flex items-center justify-center min-h-0">
      <div className="relative size-64 md:size-80 animate-dizzy">
        {/* Ears */}
        <div className="absolute top-0 left-[10%] w-16 h-20 bg-[#222] clip-triangle -rotate-12"></div>
        <div className="absolute top-0 right-[10%] w-16 h-20 bg-[#222] clip-triangle rotate-12"></div>

        {/* Head/Body */}
        <div className="absolute inset-0 top-8 bg-[#4169E1] rounded-full border-4 border-black/20 shadow-2xl flex items-center justify-center overflow-hidden">
          {/* Bandage */}
          <div className="absolute top-[10%] left-[-10%] w-[120%] h-12 bg-white/90 -rotate-12 flex items-center justify-center gap-2 border-y-2 border-gray-300 z-30">
            <div className="w-4 h-4 bg-primary-red/20 rounded-full blur-sm"></div>
            <div className="w-4 h-4 bg-primary-red/10 rounded-full blur-md"></div>
          </div>

          {/* Dazed Eyes */}
          <div className="flex gap-12 mt-4 z-20">
            {/* Left Eye: Swirly/Dizzy */}
            <div className="size-16 bg-white rounded-full relative flex items-center justify-center animate-spin-slow">
              <div className="absolute inset-0 border-4 border-black/10 rounded-full"></div>
              <div className="w-10 h-10 border-t-4 border-l-4 border-green-600 rounded-full"></div>
            </div>
            {/* Right Eye: X */}
            <div className="size-16 flex items-center justify-center relative">
              <div className="absolute w-12 h-2 bg-black/60 rotate-45 rounded-full"></div>
              <div className="absolute w-12 h-2 bg-black/60 -rotate-45 rounded-full"></div>
            </div>
          </div>

          {/* Nose */}
          <div className="absolute top-[58%] size-8 bg-pink-400 rounded-full border-b-4 border-black/10"></div>

          {/* Sad/Injured Mouth */}
          <div className="absolute top-[70%] flex gap-0">
            <div className="w-10 h-6 border-t-2 border-black rounded-full"></div>
            <div className="w-10 h-6 border-t-2 border-black rounded-full"></div>
          </div>
        </div>

        {/* Floating Stars / Dizzy Effect */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-4 animate-stars-orbit">
          <span className="material-symbols-outlined text-yellow-400 text-4xl fill-current">star</span>
          <span className="material-symbols-outlined text-yellow-400 text-3xl fill-current animate-pulse">star</span>
          <span className="material-symbols-outlined text-yellow-400 text-4xl fill-current">star</span>
        </div>
      </div>

      <style>{`
        @keyframes dizzy {
          0%, 100% { transform: rotate(-3deg) translateY(0); }
          50% { transform: rotate(3deg) translateY(-10px); }
        }
        @keyframes stars-orbit {
          0% { transform: translateX(-50%) rotate(0deg); }
          100% { transform: translateX(-50%) rotate(360deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-dizzy { animation: dizzy 4s ease-in-out infinite; }
        .animate-stars-orbit { animation: stars-orbit 6s linear infinite; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        .clip-triangle { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
      `}</style>
    </div>
  );
};

/** START MENU **/
export const StartMenuView: React.FC<{ onNavigate: (v: AppView) => void }> = ({ onNavigate }) => {
  const [tip, setTip] = useState<string>("");
  const { progress } = useProgress();

  const gameTips = [
    "Use double jump to reach higher platforms!",
    "Collect fish to get more ammo!",
    "Jump on enemies to defeat them!",
    "Watch out for hidden platforms!",
    "Use ammo wisely - collect fish for more!",
    "The cat is faster than you think!",
    "Practice your timing for perfect jumps!",
    "Navigate through the neon city without getting stuck!",
    "Don't switch lanes too often - keep your momentum!",
    "Enemies come in different patterns - learn them!",
    "Collect coins in the shop for better upgrades!",
    "Jump over holes with perfect timing!",
    "Use your ammo strategically!",
    "The higher the level, the harder it gets!",
    "Don't forget to pause if you need a break!"
  ];

  useEffect(() => {
    const randomTip = gameTips[Math.floor(Math.random() * gameTips.length)];
    setTip(randomTip);
  }, []);

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center px-4 py-10 md:py-14 animate-fade-in-up">
      <div className="mb-10 md:mb-12">
        <CatMenuIcon />
      </div>

      <div className="w-full max-w-xl text-center">
        <h1 className="text-white tracking-tight text-5xl md:text-7xl font-black leading-[0.95] uppercase">
          Shadow <span className="text-primary">Paw</span>
        </h1>
        <p className="mt-3 text-white/90 text-sm md:text-base leading-relaxed">
          A fast neon-plattformsäventyr. Enkelt att lära, svårt att bemästra.
        </p>

        {/* Quick Stats */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <span className="material-symbols-outlined text-yellow-500 text-sm">monetization_on</span>
            <span className="text-yellow-500 font-black">{progress.coins}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-sm">military_tech</span>
            <span className="text-primary font-black">Level {progress.level}</span>
          </div>
        </div>

        {/* Main Play Button - Most Prominent */}
        <div className="mt-8 mb-4">
          <button
            onClick={() => onNavigate(AppView.PLAYING)}
            className="group w-full inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-5 text-[#112218] font-black text-lg uppercase tracking-wider transition-all active:scale-[0.98] hover:scale-[1.02] border-2"
            style={{
              backgroundColor: 'rgb(43 238 121)',
              borderColor: 'rgba(43, 238, 121, 0.85)',
              boxShadow:
                '0 0 30px rgba(43,238,121,0.45), 0 0 70px rgba(43,238,121,0.22)'
            }}
          >
            <span className="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform">play_arrow</span>
            <span>Play</span>
          </button>
        </div>

        {/* Secondary Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate(AppView.SHOP)}
            className="w-full inline-flex items-center justify-center gap-3 rounded-2xl px-4 py-4 glass-card text-white font-bold uppercase tracking-wider border border-white/10 hover:border-white/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">store</span>
            Shop
          </button>
          <button
            onClick={() => onNavigate(AppView.QUESTS)}
            className="w-full inline-flex items-center justify-center gap-3 rounded-2xl px-4 py-4 glass-card text-white font-bold uppercase tracking-wider border border-white/10 hover:border-white/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">task_alt</span>
            Quests
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate(AppView.HOW_TO_PLAY)}
            className="w-full inline-flex items-center justify-center gap-3 rounded-2xl px-4 py-3 glass-card text-white/80 font-medium uppercase tracking-wider border border-white/5 hover:border-white/10 transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
            How to Play
          </button>
          <button
            onClick={() => onNavigate(AppView.LEADERBOARD)}
            className="w-full inline-flex items-center justify-center gap-3 rounded-2xl px-4 py-3 glass-card text-white/80 font-medium uppercase tracking-wider border border-white/5 hover:border-white/10 transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">emoji_events</span>
            Leaderboard
          </button>
        </div>

        <div className="mt-6 glass-card rounded-2xl border border-white/10 p-5 text-left">
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Dagens Tips</p>
          <p className="mt-2 text-white/95 text-sm leading-relaxed italic">"{tip}"</p>
        </div>

        <button
          onClick={() => onNavigate(AppView.SETTINGS)}
          className="mt-4 text-white/70 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
        >
          Settings
        </button>
      </div>
    </div>
  );
};

/** SETTINGS **/
export const SettingsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { progress, updateSettings, exportProgressCode, importProgressCode } = useProgress();
  const [music, setMusic] = useState(75);
  const [sfx, setSfx] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [importCode, setImportCode] = useState('');
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else document.exitFullscreen?.();
  };

  return (
    <div className="w-full max-w-xl mx-auto animate-fade-in-up py-8 md:py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-3">
          <span className="material-symbols-outlined text-primary text-sm">settings</span>
          <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">System</span>
        </div>
        <h1 className="text-white text-3xl md:text-4xl font-black uppercase tracking-tight">Settings</h1>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 divide-y divide-white/5">
        {/* Audio Section */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-primary">equalizer</span>
            <span className="text-white font-bold text-sm uppercase tracking-wider">Audio</span>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80 text-sm font-medium">Musicvolym</span>
                <span className="text-primary font-mono text-sm">{music}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={music}
                onChange={(e) => setMusic(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80 text-sm font-medium">Audioeffekter</span>
                <span className="text-primary font-mono text-sm">{sfx}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={sfx}
                onChange={(e) => { setSfx(Number(e.target.value)); AudioEngine.setVolume(Number(e.target.value) / 100); }}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80 text-sm font-medium">UI-skala</span>
                <span className="text-primary font-mono text-sm">{Math.round(progress.settings.uiScale * 100)}%</span>
              </div>
              <input
                type="range" min="80" max="120" value={Math.round(progress.settings.uiScale * 100)}
                onChange={(e) => updateSettings({ uiScale: Number(e.target.value) / 100 })}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80 text-sm font-medium">Textstorlek</span>
                <span className="text-primary font-mono text-sm">{Math.round(progress.settings.textScale * 100)}%</span>
              </div>
              <input
                type="range" min="90" max="130" value={Math.round(progress.settings.textScale * 100)}
                onChange={(e) => updateSettings({ textScale: Number(e.target.value) / 100 })}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              />
            </div>
          </div>
        </div>

        {/* Display Section */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">fullscreen</span>
            <span className="text-white font-bold text-sm uppercase tracking-wider">Skärm</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-white/60">open_in_full</span>
              <div className="text-left">
                <p className="text-white font-medium text-sm">Helskärmsläge</p>
                <p className="text-white/40 text-xs">Maximal inlevelse</p>
              </div>
            </div>
            <div className={`w-10 h-5 rounded-full transition-colors relative ${isFullscreen ? 'bg-primary' : 'bg-white/20'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isFullscreen ? 'left-5' : 'left-0.5'}`} />
            </div>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
            <button onClick={() => updateSettings({ colorBlindMode: !progress.settings.colorBlindMode })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white">
              Färgblind: {progress.settings.colorBlindMode ? 'På' : 'Av'}
            </button>
            <button onClick={() => updateSettings({ reduceMotion: !progress.settings.reduceMotion })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white">
              Reducera motion: {progress.settings.reduceMotion ? 'På' : 'Av'}
            </button>
            <button onClick={() => updateSettings({ debugOverlay: !progress.settings.debugOverlay })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white">
              Debug HUD: {progress.settings.debugOverlay ? 'På' : 'Av'}
            </button>
          </div>
        </div>

        {/* Save Sync Section */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">sync</span>
            <span className="text-white font-bold text-sm uppercase tracking-wider">Backup lokalt</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <button
              onClick={async () => {
                const code = exportProgressCode();
                if (code) {
                  await navigator.clipboard.writeText(code);
                  setSyncMessage('Exportkod kopierad!');
                  setTimeout(() => setSyncMessage(''), 2000);
                }
              }}
              className="px-4 py-2 rounded-lg bg-primary text-[#112218] font-black text-xs uppercase"
            >
              Exportera kod
            </button>
            <button
              onClick={() => {
                const ok = importProgressCode(importCode);
                setSyncMessage(ok ? 'Progress importerad!' : 'Ogiltig kod');
                setTimeout(() => setSyncMessage(''), 2000);
              }}
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-black text-xs uppercase"
            >
              Importera kod
            </button>
          </div>
          <textarea
            value={importCode}
            onChange={(e) => setImportCode(e.target.value)}
            placeholder="Klistra in exportkod här"
            className="w-full h-20 bg-black/30 rounded-xl border border-white/10 p-3 text-xs text-white/80"
          />
          {syncMessage && <p className="text-primary text-xs mt-2 font-bold">{syncMessage}</p>}
        </div>
      </div>

      <button
        onClick={onBack}
        className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back till menyn
      </button>
    </div>
  );
};

/** HOW TO PLAY **/
export const HowToPlayView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up py-8 md:py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-3">
          <span className="material-symbols-outlined text-primary text-sm">school</span>
          <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">How to Play</span>
        </div>
        <h1 className="text-white text-3xl md:text-4xl font-black uppercase tracking-tight">Hur man spelar</h1>
        <p className="mt-2 text-white/70 text-sm">Lär dig grunderna för att dominera neonstaden</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-2xl">flag</span>
          </div>
          <h3 className="text-white font-bold text-lg uppercase mb-2">Målet</h3>
          <p className="text-white/60 text-sm leading-relaxed">Navigate through the city, collect all fish and reach the goal. Avoid enemies and pitfalls.</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-2xl">gamepad</span>
          </div>
          <h3 className="text-white font-bold text-lg uppercase mb-2">Kontroller</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-white/10 text-white/80 text-xs font-mono">A / D</span>
              <span className="text-white/60">Move</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-white/10 text-white/80 text-xs font-mono">W / ↑</span>
              <span className="text-white/60">Jump</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-white/10 text-white/80 text-xs font-mono">Click</span>
              <span className="text-white/60">Shoot</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-2xl">stars</span>
          </div>
          <h3 className="text-white font-bold text-lg uppercase mb-2">Pro Tips</h3>
          <ul className="text-white/60 text-sm space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Dubbelhopp räddar liv</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Shoot enemies from distance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Collect all fish before goal</span>
            </li>
          </ul>
        </div>
      </div>

      <button
        onClick={onBack}
        className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-[#112218] font-black uppercase tracking-wider hover:bg-primary/90 transition-colors"
      >
        <span className="material-symbols-outlined">check</span>
        Jag förstår
      </button>
    </div>
  );
};

/** LEADERBOARD **/
export const LeaderboardView: React.FC<{ onBack: () => void, onPlay: () => void }> = ({ onBack, onPlay }) => {
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    const mockScores: ScoreEntry[] = [
      { rank: 1, name: 'ShadowNinja', score: 50400, level: 'Level 42', date: 'Oct 24', avatar: 'https://picsum.photos/seed/ShadowNinja/50/50' },
      { rank: 2, name: 'NeonHunter', score: 48200, level: 'Level 40', date: 'Oct 23', avatar: 'https://picsum.photos/seed/NeonHunter/50/50' },
      { rank: 3, name: 'CyberCat', score: 45000, level: 'Level 38', date: 'Oct 22', avatar: 'https://picsum.photos/seed/CyberCat/50/50' },
      { rank: 4, name: 'GhostPaw', score: 42100, level: 'Level 35', date: 'Oct 21', avatar: 'https://picsum.photos/seed/GhostPaw/50/50' },
    ];

    const savedScoresData = localStorage.getItem('shadow_paw_scores');
    let savedScores: { name: string; score: number; date: string }[] = [];
    if (savedScoresData) {
      try {
        savedScores = JSON.parse(savedScoresData);
      } catch {
        savedScores = [];
      }
    }

    const userScores: ScoreEntry[] = savedScores.map((s) => ({
      rank: 0,
      name: s.name,
      score: s.score,
      level: `Level ${Math.floor(s.score / 1000) || 1}`,
      date: s.date,
      avatar: `https://picsum.photos/seed/${s.name}/50/50`,
      isUser: true
    }));

    const combined = [...mockScores, ...userScores].sort((a, b) => b.score - a.score);
    const finalScores = combined.map((s, idx) => ({ ...s, rank: idx + 1 })).slice(0, 15);
    setScores(finalScores);
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in-up py-8 md:py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-3">
          <span className="material-symbols-outlined text-primary text-sm">emoji_events</span>
          <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Rangordning</span>
        </div>
        <h1 className="text-white text-3xl md:text-4xl font-black uppercase tracking-tight">Leaderboard</h1>
        <p className="mt-2 text-white/70 text-sm">Se vem som är mästaren av neonstaden</p>
      </div>

      {/* Top 3 Podium */}
      {scores.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-400 ring-4 ring-white/10 mb-2 overflow-hidden">
              <img src={scores[1].avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="w-20 h-24 glass-card rounded-t-xl border border-white/10 flex flex-col items-center justify-end pb-2">
              <span className="text-slate-400 font-black text-xl">2</span>
            </div>
          </div>
          {/* 1st Place */}
          <div className="flex flex-col items-center -mt-2">
            <div className="w-20 h-20 rounded-full bg-yellow-500 ring-4 ring-yellow-500/30 mb-2 overflow-hidden">
              <img src={scores[0].avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="w-24 h-32 glass-card rounded-t-xl border border-yellow-500/30 flex flex-col items-center justify-end pb-2 bg-yellow-500/5">
              <span className="text-yellow-500 font-black text-3xl">1</span>
            </div>
          </div>
          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-orange-700 ring-4 ring-white/10 mb-2 overflow-hidden">
              <img src={scores[2].avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="w-20 h-20 glass-card rounded-t-xl border border-white/10 flex flex-col items-center justify-end pb-2">
              <span className="text-orange-700 font-black text-xl">3</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto">
          {scores.map((s) => (
            <div
              key={`${s.name}-${s.score}-${s.date}`}
              className={`flex items-center gap-4 p-4 border-b border-white/5 ${s.isUser ? 'bg-primary/5' : 'hover:bg-white/5'} transition-colors`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${s.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                s.rank === 2 ? 'bg-slate-400/20 text-slate-400' :
                  s.rank === 3 ? 'bg-orange-700/20 text-orange-700' :
                    'bg-white/5 text-white/40'
                }`}>
                {s.rank}
              </div>
              <img src={s.avatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm truncate ${s.isUser ? 'text-primary' : 'text-white'}`}>{s.name}</p>
                <p className="text-white/40 text-xs">{s.level}</p>
              </div>
              <div className="text-right">
                <p className={`font-black text-lg ${s.isUser ? 'text-primary' : 'text-white'}`}>{s.score.toLocaleString()}</p>
                <p className="text-white/30 text-xs">{s.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onPlay}
          className="flex-1 py-3 rounded-xl bg-primary text-[#112218] font-black uppercase tracking-wider hover:bg-primary/90 transition-colors"
        >
          Play Nu
        </button>
      </div>
    </div>
  );
};

/** GAME OVER **/
export const GameOverView: React.FC<{ score: number, fishesCollected?: number, onRestart: () => void, onMenu: () => void }> = ({ score, fishesCollected = 0, onRestart, onMenu }) => {
  const [taunt, setTaunt] = useState<string>("Bättre lycka nästa gång!");
  const [name, setName] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const { progress, addCoins, addXP, applyRunResults, unlockAchievement, unlockSkin } = useProgress();
  const lastRun = (() => {
    try {
      return JSON.parse(localStorage.getItem('shadow_paw_last_run') || '{}');
    } catch {
      return {};
    }
  })();

  // Get coins: every 10 fish = 5 coins. So fish / 2
  const coinsEarned = Math.floor(fishesCollected / 2);
  const totalCoins = progress.coins;

  useEffect(() => {
    getJerryTaunt(score).then(setTaunt);
    // Save coins and XP when game ends
    if (coinsEarned > 0) {
      addCoins(coinsEarned);
    }
    addXP(Math.floor(score / 10));
    applyRunResults({
      fishesCollected,
      enemiesDefeated: lastRun.enemiesDefeated || 0,
      levelsCompleted: lastRun.levelsCompleted || 0,
      perfectLevel: !!lastRun.perfectLevel,
      bestCombo: lastRun.bestCombo || 0,
      bossDefeated: !!lastRun.bossDefeated,
      deaths: 1,
    });

    if ((lastRun.bestCombo || 0) >= 10) {
      unlockAchievement('combo_10');
      unlockSkin('shadow');
    }
    if ((progress.stats.totalEnemiesDefeated + (lastRun.enemiesDefeated || 0)) >= 60) {
      unlockAchievement('enemy_60');
      unlockSkin('ember');
    }
    if ((progress.stats.totalFishCollected + fishesCollected) >= 300) {
      unlockAchievement('fish_300');
      unlockSkin('frost');
    }
    if ((progress.stats.bossesDefeated + (lastRun.bossDefeated ? 1 : 0)) >= 3) {
      unlockAchievement('boss_3');
      unlockSkin('aurora');
    }
  }, [score, fishesCollected, coinsEarned]);

  const handleSaveScore = () => {
    if (name.trim()) {
      setIsSaved(true);
      const highScores = JSON.parse(localStorage.getItem('shadow_paw_scores') || '[]');
      highScores.push({ name: name.trim(), score, date: new Date().toLocaleDateString() });
      localStorage.setItem('shadow_paw_scores', JSON.stringify(highScores));
    }
  };

  const handleShareCard = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grd.addColorStop(0, '#08111f');
    grd.addColorStop(1, '#142b19');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#2bee79';
    ctx.font = 'bold 56px Outfit, sans-serif';
    ctx.fillText('SHADOW PAW', 48, 90);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 42px Outfit, sans-serif';
    ctx.fillText(`Score: ${score.toLocaleString()}`, 48, 180);
    ctx.fillText(`Fish: ${fishesCollected}`, 48, 240);
    ctx.fillText(`Combo: x${lastRun.bestCombo || 0}`, 48, 300);
    ctx.fillStyle = '#95a3b8';
    ctx.font = 'bold 24px Outfit, sans-serif';
    ctx.fillText('shadow-paw-game.vercel.app', 48, 430);

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `shadow-paw-score-${score}.png`;
    a.click();

    const summary = `Jag fick ${score} poäng i Shadow Paw!`; 
    await navigator.clipboard.writeText(summary);
    setShareMessage('Bild nedladdad + text kopierad!');
    setTimeout(() => setShareMessage(''), 2500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 md:py-12 px-4 animate-fade-in-up max-h-[calc(100vh-110px)] overflow-y-auto overscroll-contain pb-24">
      {/* Header Section */}
      <div className="mb-8 md:mb-10 grid grid-cols-1 md:grid-cols-[360px_1fr] gap-6 md:gap-8 items-center">
        <div className="glass-card rounded-3xl border border-white/10 overflow-hidden">
          <div className="relative aspect-square bg-gradient-to-b from-black/25 to-black/60">
            <InjuredCatVisual />
          </div>
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10">
              <span className="material-symbols-outlined text-white/60 text-base">warning</span>
              <div className="min-w-0">
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Status</p>
                <p className="text-white font-black uppercase tracking-wide truncate">Mission Failed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-red/10 border border-primary-red/20 mb-4">
            <span className="material-symbols-outlined text-primary-red text-lg">sentiment_dissatisfied</span>
            <span className="text-white text-xs font-bold uppercase tracking-widest">Mission Failed</span>
          </div>
          <h1 className="text-white text-5xl md:text-7xl font-black uppercase tracking-tight">
            Game <span className="text-primary-red">Over</span>
          </h1>
          <p className="mt-4 text-white text-base md:text-lg max-w-lg mx-auto">
            {taunt}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-5 text-center border border-white/10">
          <div className="flex items-center justify-center gap-1 text-white/40 text-xs font-bold uppercase tracking-widest mb-2">
            <span className="material-symbols-outlined text-sm">flag</span>
            Score
          </div>
          <p className="text-white text-2xl md:text-3xl font-black">{score.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center border border-white/10">
          <div className="flex items-center justify-center gap-1 text-white/40 text-xs font-bold uppercase tracking-widest mb-2">
            <span className="material-symbols-outlined text-sm">emoji_events</span>
            Bästa
          </div>
          <p className="text-white text-2xl md:text-3xl font-black">{(() => { try { const scores = JSON.parse(localStorage.getItem('shadow_paw_scores') || '[]'); return Math.max(score, ...scores.map((s: { score: number }) => s.score), 0).toLocaleString(); } catch { return score.toLocaleString(); } })()}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center border border-white/10">
          <div className="flex items-center justify-center gap-1 text-white/40 text-xs font-bold uppercase tracking-widest mb-2">
            <span className="material-symbols-outlined text-sm">set_meal</span>
            Fish
          </div>
          <p className="text-blue-400 text-2xl md:text-3xl font-black">{fishesCollected}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center border border-white/10">
          <div className="flex items-center justify-center gap-1 text-white/40 text-xs font-bold uppercase tracking-widest mb-2">
            <span className="material-symbols-outlined text-sm">attach_money</span>
            +Mynt
          </div>
          <p className="text-primary text-2xl md:text-3xl font-black">+{coinsEarned}</p>
          <p className="text-white/50 text-xs">({fishesCollected} fish ÷ 2)</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center border border-white/10">
          <div className="flex items-center justify-center gap-1 text-white/40 text-xs font-bold uppercase tracking-widest mb-2">
            <span className="material-symbols-outlined text-sm">monetization_on</span>
            Totalt
          </div>
          <p className="text-yellow-400 text-2xl md:text-3xl font-black">{totalCoins}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center border border-white/10">
          <div className="flex items-center justify-center gap-1 text-white/40 text-xs font-bold uppercase tracking-widest mb-2">
            <span className="material-symbols-outlined text-sm">military_tech</span>
            XP
          </div>
          <p className="text-white text-2xl md:text-3xl font-black">+{Math.floor(score / 10)}</p>
        </div>
      </div>

      {/* High Score Section */}
      <div className="glass-card rounded-3xl border border-white/10 p-6 md:p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <span className="text-[#112218] text-xl">🏆</span>
          </div>
          <div>
            <h3 className="text-white font-black text-lg uppercase">Nytt High Score!</h3>
            <p className="text-white/50 text-xs font-medium">Spara ditt resultat till topplistan</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">person</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaved}
              placeholder="Ange ditt namn"
              maxLength={15}
              className={`w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors ${isSaved ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
          <button
            onClick={handleSaveScore}
            disabled={isSaved || !name.trim()}
            className={`font-black px-8 py-4 rounded-xl transition-all uppercase text-sm whitespace-nowrap ${isSaved ? 'bg-primary text-[#112218]' : 'bg-white text-[#112218] hover:bg-white/90 active:scale-95'}`}
          >
            {isSaved ? 'Sparat!' : 'Spara'}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleShareCard}
          className="flex-1 glass-card border-2 border-primary/30 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors uppercase text-white"
        >
          <span className="material-symbols-outlined">ios_share</span>
          Dela Score
        </button>
        <button
          onClick={onRestart}
          className="flex-1 bg-primary-red py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform shadow-[0_0_30px_rgba(238,43,43,0.25)] uppercase text-white"
        >
          <span className="material-symbols-outlined">replay</span>
          Spela Igen
        </button>
        <button
          onClick={onMenu}
          className="flex-1 glass-card border-2 border-white/10 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:bg-white/5 transition-colors uppercase text-white"
        >
          <span className="material-symbols-outlined">home</span>
          HUVUDMENY
        </button>
      </div>
      {shareMessage && <p className="text-center text-primary text-sm font-bold mt-4">{shareMessage}</p>}
    </div>
  );
};

// AUDIO MANAGER FOR BACKGROUND MUSIC
const useBackgroundMusic = (level: number, isMuted: boolean = false) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle mute state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.3;
    }
  }, [isMuted]);

  // Handle level changes
  useEffect(() => {
    // Map any level to one of the 10 available tracks (cycles through 1-10)
    if (level >= 1) {
      const trackNumber = ((level - 1) % 10) + 1;
      const musicPath = `Sounds/Level ${trackNumber}.mp3`;

      // Create new audio element
      const audio = new Audio(musicPath);
      audio.loop = true;
      audio.volume = 0; // Start with volume 0 for fade-in

      // Play and fade in
      audio.play().catch(() => {});

      // Fade in over 3 seconds
      let currentVolume = 0;
      const targetVolume = 0.3;
      const fadeStep = targetVolume / 30; // 30 steps for 3 seconds

      fadeIntervalRef.current = setInterval(() => {
        currentVolume += fadeStep;
        if (currentVolume >= targetVolume) {
          currentVolume = targetVolume;
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
          }
        }
        audio.volume = currentVolume;
      }, 100);

      audioRef.current = audio;
    }

    return () => {
      // Cleanup: fade out and stop
      if (audioRef.current) {
        const audio = audioRef.current;

        // Fade out quickly
        let currentVolume = audio.volume;
        const fadeOutStep = currentVolume / 10;

        const fadeOutInterval = setInterval(() => {
          currentVolume -= fadeOutStep;
          if (currentVolume <= 0) {
            currentVolume = 0;
            audio.pause();
            audio.src = '';
            clearInterval(fadeOutInterval);
          }
          audio.volume = currentVolume;
        }, 50);
      }

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, [level]);
};

// LEVEL DESIGN SYSTEM - 50 unique levels with progressive difficulty
const getLevelDesign = (level: number) => {
  const designs = [
    // Levels 1-10: Tutorial & Easy
    { weather: 'SOLIGT', intensity: 'LIGHT', timeOfDay: 'DAY', theme: 'park', difficulty: 1 },
    { weather: 'SOLIGT', intensity: 'LIGHT', timeOfDay: 'DAY', theme: 'suburban', difficulty: 1.2 },
    { weather: 'SOLIGT', intensity: 'LIGHT', timeOfDay: 'NIGHT', theme: 'city', difficulty: 1.4 },
    { weather: 'REGNIGT', intensity: 'LIGHT', timeOfDay: 'DAY', theme: 'park', difficulty: 1.6 },
    { weather: 'SOLIGT', intensity: 'LIGHT', timeOfDay: 'SUNSET', theme: 'industrial', difficulty: 1.8 },
    { weather: 'DIMMIGT', intensity: 'LIGHT', timeOfDay: 'NIGHT', theme: 'downtown', difficulty: 2.0 },
    { weather: 'SOLIGT', intensity: 'LIGHT', timeOfDay: 'DAY', theme: 'beach', difficulty: 2.2 },
    { weather: 'SNÖIGT', intensity: 'LIGHT', timeOfDay: 'DAY', theme: 'mountain', difficulty: 2.4 },
    { weather: 'SOLIGT', intensity: 'LIGHT', timeOfDay: 'SUNSET', theme: 'forest', difficulty: 2.6 },
    { weather: 'STORMIGT', intensity: 'LIGHT', timeOfDay: 'NIGHT', theme: 'harbor', difficulty: 2.8 },

    // Levels 11-20: Medium
    { weather: 'REGNIGT', intensity: 'HEAVY', timeOfDay: 'NIGHT', theme: 'sewers', difficulty: 3.0 },
    { weather: 'SNÖIGT', intensity: 'HEAVY', timeOfDay: 'DAY', theme: 'alpine', difficulty: 3.3 },
    { weather: 'STORMIGT', intensity: 'HEAVY', timeOfDay: 'SUNSET', theme: 'construction', difficulty: 3.6 },
    { weather: 'DIMMIGT', intensity: 'HEAVY', timeOfDay: 'NIGHT', theme: 'rooftops', difficulty: 3.9 },
    { weather: 'REGNIGT', intensity: 'LIGHT', timeOfDay: 'DAWN', theme: 'countryside', difficulty: 4.2 },
    { weather: 'SNÖIGT', intensity: 'LIGHT', timeOfDay: 'NIGHT', theme: 'ice_cave', difficulty: 4.5 },
    { weather: 'STORMIGT', intensity: 'LIGHT', timeOfDay: 'DAY', theme: 'power_plant', difficulty: 4.8 },
    { weather: 'DIMMIGT', intensity: 'LIGHT', timeOfDay: 'SUNSET', theme: 'abandoned', difficulty: 5.1 },
    { weather: 'REGNIGT', intensity: 'HEAVY', timeOfDay: 'DAY', theme: 'highway', difficulty: 5.4 },
    { weather: 'SNÖIGT', intensity: 'HEAVY', timeOfDay: 'NIGHT', theme: 'glacier', difficulty: 5.7 },

    // Levels 21-30: Hard
    { weather: 'STORMIGT', intensity: 'HEAVY', timeOfDay: 'NIGHT', theme: 'space_station', difficulty: 6.0 },
    { weather: 'DIMMIGT', intensity: 'HEAVY', timeOfDay: 'DAWN', theme: 'volcano', difficulty: 6.4 },
    { weather: 'REGNIGT', intensity: 'HEAVY', timeOfDay: 'SUNSET', theme: 'underground', difficulty: 6.8 },
    { weather: 'SNÖIGT', intensity: 'HEAVY', timeOfDay: 'DAY', theme: 'sky_bridge', difficulty: 7.2 },
    { weather: 'STORMIGT', intensity: 'HEAVY', timeOfDay: 'NIGHT', theme: 'nuclear', difficulty: 7.6 },
    { weather: 'DIMMIGT', intensity: 'HEAVY', timeOfDay: 'DAWN', theme: 'laboratory', difficulty: 8.0 },
    { weather: 'REGNIGT', intensity: 'HEAVY', timeOfDay: 'SUNSET', theme: 'datacenter', difficulty: 8.4 },
    { weather: 'SNÖIGT', intensity: 'HEAVY', timeOfDay: 'NIGHT', theme: 'arctic_base', difficulty: 8.8 },
    { weather: 'STORMIGT', intensity: 'HEAVY', timeOfDay: 'DAY', theme: 'warzone', difficulty: 9.2 },
    { weather: 'DIMMIGT', intensity: 'HEAVY', timeOfDay: 'DAWN', theme: 'quantum', difficulty: 9.6 },

    // Levels 31-40: Very Hard
    { weather: 'STORMIGT', intensity: 'HEAVY', timeOfDay: 'NIGHT', theme: 'hell', difficulty: 10.0 },
    { weather: 'REGNIGT', intensity: 'HEAVY', timeOfDay: 'SUNSET', theme: 'nightmare', difficulty: 10.5 },
    { weather: 'SNÖIGT', intensity: 'HEAVY', timeOfDay: 'DAY', theme: 'void', difficulty: 11.0 },
    { weather: 'DIMMIGT', intensity: 'HEAVY', timeOfDay: 'NIGHT', theme: 'chaos', difficulty: 11.5 },
    { weather: 'STORMIGT', intensity: 'HEAVY', timeOfDay: 'DAWN', theme: 'inferno', difficulty: 12.0 },
    { weather: 'REGNIGT', intensity: 'HEAVY', timeOfDay: 'SUNSET', theme: 'abyss', difficulty: 12.5 },
    { weather: 'SNÖIGT', intensity: 'HEAVY', timeOfDay: 'NIGHT', theme: 'oblivion', difficulty: 13.0 },
    { weather: 'DIMMIGT', intensity: 'HEAVY', timeOfDay: 'DAY', theme: 'pandemonium', difficulty: 13.5 },
    { weather: 'STORMIGT', intensity: 'HEAVY', timeOfDay: 'NIGHT', theme: 'apocalypse', difficulty: 14.0 },
    { weather: 'REGNIGT', intensity: 'HEAVY', timeOfDay: 'DAWN', theme: 'armageddon', difficulty: 14.5 },

    // Levels 41-50: Extreme
    { weather: 'SNÖIGT', intensity: 'HEAVY', timeOfDay: 'SUNSET', theme: 'titan', difficulty: 15.0 },
    { weather: 'STORMIGT', intensity: 'HEAVY', timeOfDay: 'NIGHT', theme: 'hades', difficulty: 16.0 },
    { weather: 'DIMMIGT', intensity: 'HEAVY', timeOfDay: 'DAY', theme: 'tartarus', difficulty: 17.0 },
    { weather: 'REGNIGT', intensity: 'HEAVY', timeOfDay: 'SUNSET', theme: 'nexus', difficulty: 18.0 },
    { weather: 'SNÖIGT', intensity: 'HEAVY', timeOfDay: 'NIGHT', theme: 'omega', difficulty: 19.0 },
    { weather: 'STORMIGT', intensity: 'HEAVY', timeOfDay: 'DAWN', theme: 'infinity', difficulty: 20.0 },
    { weather: 'DIMMIGT', intensity: 'HEAVY', timeOfDay: 'SUNSET', theme: 'transcendence', difficulty: 21.0 },
    { weather: 'REGNIGT', intensity: 'HEAVY', timeOfDay: 'NIGHT', theme: 'enlightenment', difficulty: 22.0 },
    { weather: 'SNÖIGT', intensity: 'HEAVY', timeOfDay: 'DAY', theme: 'ascension', difficulty: 23.0 },
    { weather: 'STORMIGT', intensity: 'HEAVY', timeOfDay: 'DAWN', theme: 'legendary', difficulty: 25.0 }
  ];

  return designs[Math.min(level - 1, designs.length - 1)];
};

const getDifficultyProfile = (level: number, playerRank: number) => {
  const normalizedLevel = Math.min(1, Math.max(0, (level - 1) / 49));
  const normalizedRank = Math.min(1, Math.max(0, (playerRank - 1) / 49));
  const combinedDifficulty = Math.min(1, normalizedLevel + normalizedRank * 0.25);
  const variant = (level - 1) % 6;
  const variantLengthBonus = [500, 1100, 1800, 700, 1400, 2200][variant];

  return {
    levelLength: Math.floor(9800 + level * 1500 + combinedDifficulty * 2400 + variantLengthBonus),
    holeChance: Math.min(0.1, 0.008 + combinedDifficulty * 0.07),
    holeSize: Math.min(0.3, 0.11 + combinedDifficulty * 0.2),
    platformCount: Math.floor(13 + level * 1.15 + combinedDifficulty * 6),
    enemyCount: Math.floor(2 + level * 0.62 + combinedDifficulty * 4.2),
    enemySpeed: 1.35 + level * 0.07 + combinedDifficulty * 0.65,
    fishCount: Math.floor(13 + level * 1.0 + combinedDifficulty * 4.5),
    hazardCount: Math.floor(Math.max(0, level - 1) * 0.48 + combinedDifficulty * 4.2),
    variant,
  };
};

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const getWeatherForLevel = (level: number) => {
  if (level === 1) {
    return { weather: 'SOLIGT', intensity: 'LIGHT', timeOfDay: 'DAY' };
  }

  const weatherPresets = [
    { weather: 'SOLIGT', intensity: 'LIGHT', timeOfDay: 'DAY' },
    { weather: 'SOLIGT', intensity: 'LIGHT', timeOfDay: 'SUNSET' },
    { weather: 'REGNIGT', intensity: 'LIGHT', timeOfDay: 'DAY' },
    { weather: 'REGNIGT', intensity: 'HEAVY', timeOfDay: 'NIGHT' },
    { weather: 'STORMIGT', intensity: 'HEAVY', timeOfDay: 'NIGHT' },
    { weather: 'SNÖIGT', intensity: 'LIGHT', timeOfDay: 'DAY' },
    { weather: 'SNÖIGT', intensity: 'HEAVY', timeOfDay: 'NIGHT' },
    { weather: 'DIMMIGT', intensity: 'LIGHT', timeOfDay: 'DAWN' },
  ] as const;

  const index = Math.floor(seededRandom(level * 17.371) * weatherPresets.length);
  const previousIndex = Math.floor(seededRandom((level - 1) * 17.371) * weatherPresets.length);
  const safeIndex = index === previousIndex ? (index + 1) % weatherPresets.length : index;

  return weatherPresets[safeIndex];
};

// BACKGROUND ELEMENTS GENERATOR
const THEME_CONFIGS: Record<string, { buildings: string[], animals: string[], buildingColors: string[] }> = {
  park: { buildings: ['house', 'windmill', 'fountain'], animals: ['bird', 'rabbit', 'squirrel'], buildingColors: ['#a0c878', '#8fbc8f', '#7da87d'] },
  suburban: { buildings: ['house', 'fence', 'mailbox'], animals: ['cat', 'dog', 'bird'], buildingColors: ['#c8a46e', '#d4956a', '#b8935a'] },
  city: { buildings: ['skyscraper', 'apartment', 'billboard'], animals: ['pigeon', 'rat', 'stray_cat'], buildingColors: ['#3a5f8a', '#4a7aaa', '#2d4f7a'] },
  downtown: { buildings: ['skyscraper', 'office', 'neon_sign'], animals: ['pigeon', 'stray_cat', 'bat'], buildingColors: ['#2d3f6a', '#1e2f5a', '#3d4f7a'] },
  industrial: { buildings: ['factory', 'chimney', 'warehouse'], animals: ['rat', 'crow', 'fox'], buildingColors: ['#5a4a3a', '#6a5a4a', '#4a3a2a'] },
  construction: { buildings: ['crane', 'scaffold', 'barrel'], animals: ['crow', 'rat', 'pigeon'], buildingColors: ['#8a7a3a', '#7a6a2a', '#9a8a4a'] },
  beach: { buildings: ['lighthouse', 'beach_hut', 'palm'], animals: ['seagull', 'crab', 'pelican'], buildingColors: ['#f0e0a0', '#e8c870', '#f8f0b0'] },
  mountain: { buildings: ['cabin', 'peak', 'ski_lift'], animals: ['eagle', 'goat', 'bear'], buildingColors: ['#8a7060', '#9a8070', '#7a6050'] },
  forest: { buildings: ['cabin', 'treehouse', 'well'], animals: ['deer', 'owl', 'squirrel'], buildingColors: ['#4a7a3a', '#3a6a2a', '#5a8a4a'] },
  harbor: { buildings: ['lighthouse', 'dock', 'ship'], animals: ['seagull', 'pelican', 'seal'], buildingColors: ['#3a5a7a', '#2a4a6a', '#4a6a8a'] },
  sewers: { buildings: ['pipe', 'grate', 'ladder'], animals: ['rat', 'bat', 'cockroach'], buildingColors: ['#4a5a3a', '#3a4a2a', '#5a6a4a'] },
  alpine: { buildings: ['cabin', 'snow_peak', 'chapel'], animals: ['goat', 'eagle', 'fox'], buildingColors: ['#9090a8', '#a0a0b8', '#8080a0'] },
  rooftops: { buildings: ['water_tower', 'chimney', 'antenna'], animals: ['pigeon', 'bat', 'crow'], buildingColors: ['#4a5a6a', '#3a4a5a', '#5a6a7a'] },
  countryside: { buildings: ['barn', 'windmill', 'silo'], animals: ['cow', 'horse', 'rooster'], buildingColors: ['#c8a060', '#b89050', '#d8b070'] },
  space_station: { buildings: ['module', 'antenna', 'solar_panel'], animals: ['alien_creature', 'space_cat', 'robot_bird'], buildingColors: ['#3a4a6a', '#2a3a5a', '#4a5a7a'] },
  volcano: { buildings: ['lava_rock', 'ruins', 'smoke_tower'], animals: ['snake', 'lizard', 'crow'], buildingColors: ['#8a3a1a', '#7a2a0a', '#9a4a2a'] },
  default: { buildings: ['house', 'tree', 'fence'], animals: ['bird', 'rabbit', 'cat'], buildingColors: ['#607080', '#506070', '#708090'] },
};

const getThemeConfig = (theme: string) => {
  for (const key of Object.keys(THEME_CONFIGS)) {
    if (theme.includes(key)) return THEME_CONFIGS[key];
  }
  return THEME_CONFIGS.default;
};

interface BackgroundElement {
  kind: 'building' | 'animal';
  subtype: string;
  x: number;
  scale: number;
  color?: string;
  parallax: number;
  phase?: number;
  waves?: boolean;
  isSkyAnimal?: boolean;
  skyY?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GameState = any;

const generateBackgroundElements = (level: number, levelLength: number, theme: string): BackgroundElement[] => {
  const elements: BackgroundElement[] = [];
  const config = getThemeConfig(theme);
  const spacing = 600;
  const count = Math.floor(levelLength / spacing);

  for (let i = 0; i < count; i++) {
    const x = 200 + i * spacing + (Math.random() - 0.5) * 200;
    const roll = Math.random();

    // 60% buildings, 40% animals
    if (roll < 0.6) {
      const bType = config.buildings[Math.floor(Math.random() * config.buildings.length)];
      const color = config.buildingColors[Math.floor(Math.random() * config.buildingColors.length)];
      elements.push({
        kind: 'building',
        subtype: bType,
        x,
        scale: 0.5 + Math.random() * 0.5,
        color,
        parallax: 0.15 + Math.random() * 0.1,
      });
    } else {
      const aType = config.animals[Math.floor(Math.random() * config.animals.length)];
      const isSkyAnimal = ['bird', 'pigeon', 'crow', 'seagull', 'eagle', 'bat', 'pelican', 'robot_bird'].includes(aType);
      elements.push({
        kind: 'animal',
        subtype: aType,
        x,
        scale: 1.4 + Math.random() * 0.6,
        parallax: isSkyAnimal ? 0.1 + Math.random() * 0.08 : 0.25 + Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2,
        waves: ['cat', 'stray_cat', 'dog', 'rabbit', 'bear', 'alien_creature', 'cow', 'horse', 'deer'].includes(aType),
        isSkyAnimal,
        skyY: isSkyAnimal ? -(120 + Math.random() * 160) : 0, // pixels above ground
      });
    }
  }

  return elements;
};

/** ADVANCED 50-LEVEL PLAYABLE GAME VIEW **/
export const PlayingView: React.FC<{ onEnd: (score: number, fishesCollected: number) => void }> = ({ onEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [stats, setStats] = useState({ score: 0, progress: 0, collectedCount: 0, totalFish: 0, ammo: 5, weather: 'SOLIGT', intensity: 'LIGHT', timeOfDay: 'NIGHT', combo: 0, levelType: 'Classic', timer: 0, miniEvent: 'NONE' });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [isMobile, setIsMobile] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [combo, setCombo] = useState(0);
  const [seasonTheme] = useState(getSeasonTheme());
  const { progress, addCoins } = useProgress();

  const gameRef = useRef<any>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Use background music for levels 1-10
  useBackgroundMusic(currentLevel, isMuted);

  // Handle mute/unmute
  useEffect(() => {
    AudioEngine.setVolume(isMuted ? 0 : 0.5);
  }, [isMuted]);

  // Handle fullscreen and ESC key
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.fullscreenElement) {
        document.exitFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && gameContainerRef.current) {
      gameContainerRef.current.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    setIsMobile(window.innerWidth < 768);
  }, []);

  const setupLevel = (level: number, existingScore: number, existingLives: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const difficultyProfile = getDifficultyProfile(level, progress.level);
    const levelLength = difficultyProfile.levelLength;
    const baseLevelDesign = getLevelDesign(level);
    const randomWeather = getWeatherForLevel(level);
    const weather = randomWeather.weather;
    const intensity = randomWeather.intensity;
    const timeOfDay = randomWeather.timeOfDay;
    const theme = baseLevelDesign.theme;
    const skin = SKINS[progress.equippedSkin] || SKINS.default;
    const levelMode = level % 5 === 1 ? 'Classic' : (level % 5 === 2 ? 'Collection' : (level % 5 === 3 ? 'Classic' : (level % 5 === 4 ? 'Speed Run' : 'Survival')));
    const speedRunTimer = Math.max(70, 110 - level * 0.8);

    const game = {
      running: true,
      level: level,
      score: existingScore,
      lives: existingLives,
      ammo: Math.max(stats.ammo || progress.upgrades.maxAmmo, progress.upgrades.maxAmmo),
      levelLength: levelLength,
      weather: weather,
      intensity: intensity,
      timeOfDay: timeOfDay,
      scrollX: 0,
      gravity: levelMode === 'Speed Run' ? 0.75 : 0.8,
      friction: 0.85,
      levelType: levelMode,
      levelTimer: levelMode === 'Speed Run' ? speedRunTimer : 0,
      combo: 0,
      comboTimer: 0,
      bestComboInRun: 0,
      enemiesDefeatedInRun: 0,
      levelsCompletedInRun: 0,
      bossDefeatedInRun: false,
      deathsInRun: 0,
      screenShake: 0,
      hitStop: 0,
        miniEvent: {
          type: level > 2 ? ['WIND', 'LOW_GRAVITY', 'BLACKOUT'][Math.floor(seededRandom(level * 13.5) * 3)] : 'NONE',
          active: false,
          timer: 540,
          duration: 260,
        },
      flashTimer: 0,
      lightningBolts: [],
      bolts: [], // Current active lightning bolts
      weatherParticles: [] as any[],
      player: {
        x: 100, y: 150, width: 50, height: 70,
        velocityX: 0, velocityY: 0,
        speed: (4.6 + (level * 0.08)) * (progress.settings.uiScale < 0.95 ? 0.98 : 1),
        jumpPower: progress.upgrades.jumpPower,
        doubleJumpPower: progress.upgrades.jumpPower + 3,
        isJumping: false, canDoubleJump: true, hasDoubleJumped: false,
        color: skin.color, invincible: false, invincibleTimer: 0,
        accent: skin.accent,
        isBlinking: false, blinkTimer: 0,
        facing: 1 // 1 for right, -1 for left
      },
      jerry: { x: levelLength - 150, y: 350, width: 40, height: 50, rescued: false },
      platforms: [],
      holes: [],
      fishes: [],
      enemies: [],
      bullets: [],
      particles: [],
      floatingTexts: [],
      hazards: [],
      boss: null,
      keys: {} as Record<number, boolean>,
      showFishWarning: false,
      totalCollectedInLevel: 0,
      backgroundElements: [],
      lastStatUpdate: 0
    };

    // Passive perks from skill tree milestones.
    if (progress.level >= 5) game.player.speed += 0.6;
    if (progress.level >= 10) game.ammo += 2;
    if (progress.level >= 15) game.player.invincibleTimer = 20;

    // Generate background elements
    game.backgroundElements = generateBackgroundElements(level, levelLength, theme);

    // Initialize Weather Particles
    if (weather !== 'SOLIGT') {
      let pCount = 50;
      if (weather === 'SNÖIGT') pCount = intensity === 'HEAVY' ? 200 : 50;
      else if (weather === 'REGNIGT') pCount = intensity === 'HEAVY' ? 120 : 60;
      else if (weather === 'STORMIGT') pCount = 150;
      else if (weather === 'DIMMIGT') pCount = 15; // Fewer but larger clouds

      for (let i = 0; i < pCount; i++) {
        if (weather === 'DIMMIGT') {
          game.weatherParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 0.2 + Math.random() * 0.5,
            radius: 100 + Math.random() * 150,
            opacity: 0.05 + Math.random() * 0.1,
            sway: Math.random() * Math.PI * 2
          });
        } else {
          game.weatherParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: weather === 'SNÖIGT' ? (intensity === 'HEAVY' ? 1.5 + Math.random() * 2 : 1 + Math.random() * 2) : 10 + Math.random() * 5,
            length: weather === 'SNÖIGT' ? 0 : 10 + Math.random() * 20,
            radius: weather === 'SNÖIGT' ? 1.5 + Math.random() * 2.5 : 0,
            sway: Math.random() * Math.PI * 2
          });
        }
      }
    }

    const segmentWidth = 180 + difficultyProfile.variant * 10;
    const segments = Math.ceil(levelLength / segmentWidth);
    for (let i = 0; i < segments; i++) {
      // Level 1 should be very forgiving, then increase steadily by level and rank.
      const baseHoleSize = difficultyProfile.holeSize;
      const holeChance = difficultyProfile.holeChance;
      if (i > 3 && i < segments - 3 && Math.random() < holeChance) {
        // Hole size based on level
        const holeWidth = segmentWidth * baseHoleSize;
        const holeOffset = (segmentWidth - holeWidth) / 2;

        // Add hole to holes array - this is what kills the player!
        game.holes.push({ x: i * segmentWidth + holeOffset, width: holeWidth, y: canvas.height - 40 });

        // Add platform to the LEFT of the hole (before hole)
        game.platforms.push({ x: i * segmentWidth, y: canvas.height - 40, width: holeOffset, height: 40, color: '#1c3a2a', isGround: true });

        // Add platform to the RIGHT of the hole (after hole)
        game.platforms.push({ x: i * segmentWidth + holeOffset + holeWidth, y: canvas.height - 40, width: segmentWidth - holeOffset - holeWidth, height: 40, color: '#1c3a2a', isGround: true });

        // DON'T add the full segment - that's the hole!
        continue;
      }
      // Normal ground segment with no hole
      game.platforms.push({ x: i * segmentWidth, y: canvas.height - 40, width: segmentWidth, height: 40, color: '#1c3a2a', isGround: true });
    }

    // MANY MORE platforms - but ALL reachable with double jump!
    const platCount = difficultyProfile.platformCount;
    // Maximum height player can reach with double jump is about 250px
    const maxJumpHeight = 250;
    const minGap = Math.max(55, 130 - (level * 0.8));

    for (let i = 0; i < platCount; i++) {
      let attempts = 0;
      let validPos = false;
      let px = 0;
      let py = 0;
      // Vary platform widths for more interesting gameplay
      const widthVariation = Math.random();
      let pw = widthVariation > 0.7 ? 80 : (widthVariation > 0.3 ? 120 : 150);
      pw = Math.max(50, pw - (level * 0.8));
      let ph = 20;

      while (!validPos && attempts < 50) {
        attempts++;
        // Spread platforms throughout the ENTIRE level
        px = 300 + Math.random() * (levelLength - 600);

        // ALL platforms must be reachable - not too high!
        // Keep platforms in the lower section of screen so double jump can reach
        const minPy = Math.max(50, canvas.height - 280);
        py = minPy + Math.random() * (canvas.height - 100 - minPy);

        // Ensure vertical variation - but always reachable!
        if (i > 0 && Math.random() < 0.4) {
          // Only go up by max jump height
          const prevY = game.platforms[game.platforms.length - 1].y;
          py = Math.max(minPy, Math.min(prevY - 50 - Math.random() * 100, canvas.height - 100));
        }

        const bufferX = minGap;
        const bufferY = 50;
        const hasCollision = game.platforms.some(oldP => {
          return (px < oldP.x + oldP.width + bufferX && px + pw + bufferX > oldP.x && py < oldP.y + oldP.height + bufferY && py + ph + bufferY > oldP.y);
        });
        if (!hasCollision) validPos = true;
      }
      if (validPos) {
        game.platforms.push({ x: px, y: py, width: pw, height: ph, color: '#234832' });
      }
    }

    // MUCH MORE enemies - spread throughout the entire level for excitement!
    // More enemies on EVERY level, not just higher levels
    const enemyCount = levelMode === 'Survival' ? Math.floor(difficultyProfile.enemyCount * 1.3) : difficultyProfile.enemyCount;
    let enemiesPlaced = 0;
    let spawnAttempts = 0;
    const minEnemyDistance = 280;

    while (enemiesPlaced < enemyCount && spawnAttempts < 300) {
      spawnAttempts++;
      // Spread enemies throughout the ENTIRE level, not just the end
      const randomSegment = Math.floor(Math.random() * (game.platforms.length - 5)) + 3;
      const plat = game.platforms[randomSegment];

      // Skip some ground platforms but not all
      if (plat.isGround && Math.random() > 0.5) continue;

      const ex = plat.x + Math.random() * (plat.width - 40);
      // Place enemies earlier in the level too!
      if (ex < 400) continue; // Skip first 400px (start area)

      const tooClose = game.enemies.some(other => {
        return Math.abs(other.x - ex) < minEnemyDistance && Math.abs(other.y - (plat.y - 40)) < 80;
      });
      if (tooClose) continue;

      // Random enemy type
      const enemyType = Math.floor(Math.random() * 3);
      game.enemies.push({
        x: ex, y: plat.y - 40, width: 40, height: 40,
        velocityX: difficultyProfile.enemySpeed * (Math.random() > 0.5 ? 1 : -1),
        direction: 1, platform: randomSegment, type: enemyType
      });
      enemiesPlaced++;
    }

    if (level % 5 === 0) {
      const bossPlatform = game.platforms[Math.max(2, game.platforms.length - 4)];
      if (bossPlatform) {
        game.boss = {
          x: Math.min(levelLength - 360, bossPlatform.x + 20),
          y: bossPlatform.y - 70,
          width: 90,
          height: 70,
          hp: 8 + Math.floor(level * 0.35),
          maxHp: 8 + Math.floor(level * 0.35),
          velocityX: 1.8 + level * 0.03,
          platformX: bossPlatform.x,
          platformW: bossPlatform.width,
          phase: 0,
        };
      }
    }

    // MORE coins - more rewards throughout the level
    const fishCount = levelMode === 'Collection' ? Math.floor(difficultyProfile.fishCount * 1.45) : difficultyProfile.fishCount;
    let placedFish = 0;
    let fishPlacementAttempts = 0;

    // Add dynamic moving items on later levels
    // More coins - ALL reachable with double jump!
    const flyingItems = level > 3;

    while (placedFish < fishCount && fishPlacementAttempts < fishCount * 25) {
      fishPlacementAttempts++;
      const randomPlatIndex = Math.floor(Math.random() * game.platforms.length);
      const plat = game.platforms[randomPlatIndex];

      // 30% flying coins, 70% on/near platforms
      const isFlying = flyingItems && Math.random() > 0.7;

      let fx, fy;
      if (isFlying) {
        // Flying coins - but reachable with double jump!
        // Max height from ground with double jump is about 250px
        fx = 200 + Math.random() * (levelLength - 400);
        // Keep flying coins reachable - not too high!
        fy = canvas.height - 280 + Math.random() * 100;
      } else {
        // On platforms - just above the platform
        fx = plat.x + 10 + Math.random() * (plat.width - 30);
        // Just above the platform - always reachable
        fy = plat.y - 30 - Math.random() * 30;
      }

      // Keep everything reachable
      fy = Math.max(canvas.height - 300, Math.min(fy, canvas.height - 60));
      const clampedFx = Math.max(50, Math.min(fx, levelLength - 50));

      let fishCollision = false;
      const fishBounds = { x: clampedFx, y: fy, width: 24, height: 14 };

      // Check if fish would spawn inside a platform
      for (const p of game.platforms) {
        if (fishBounds.x < p.x + p.width && fishBounds.x + fishBounds.width > p.x &&
          fishBounds.y < p.y + p.height && fishBounds.y + fishBounds.height > p.y) {
          fishCollision = true;
          break;
        }
      }
      if (!fishCollision) {
        game.fishes.push({
          x: clampedFx,
          y: fy,
          width: 24,
          height: 14,
          collected: false,
          isFlying: isFlying,
          hoverOffset: Math.random() * Math.PI * 2,
          baseY: fy
        });
        placedFish++;
      }
    }

    // Add fun hazards to keep levels unique and less repetitive.
    const hazardCount = levelMode === 'Survival' ? Math.floor(difficultyProfile.hazardCount * 1.15) : difficultyProfile.hazardCount;
    let hazardAttempts = 0;
    while (game.hazards.length < hazardCount && hazardAttempts < hazardCount * 20) {
      hazardAttempts++;
      const randomPlatIndex = Math.floor(Math.random() * Math.max(1, game.platforms.length - 8)) + 4;
      const plat = game.platforms[randomPlatIndex];
      if (!plat || plat.width < 80) continue;

      const hx = plat.x + 10 + Math.random() * Math.max(10, plat.width - 70);
      if (hx < 450 || hx > levelLength - 400) continue;

      const tooClose = game.hazards.some((h: any) => Math.abs(h.x - hx) < 180);
      if (tooClose) continue;

      const hazardRoll = Math.random();
      if (difficultyProfile.variant % 2 === 0 && hazardRoll < 0.45) {
        game.hazards.push({
          type: 'movingSaw',
          x: hx,
          baseX: hx,
          y: plat.y - 24,
          width: 28,
          height: 28,
          range: 35 + Math.random() * 50,
          phase: Math.random() * Math.PI * 2,
          speed: 0.03 + Math.random() * 0.04,
        });
      } else if (hazardRoll < 0.78) {
        game.hazards.push({
          type: 'spike',
          x: hx,
          y: plat.y - 16,
          width: 46,
          height: 16,
        });
      } else if (level > 4) {
        game.hazards.push({
          type: 'laser',
          x: hx + 20,
          y: Math.max(120, plat.y - 160),
          width: 10,
          height: Math.min(220, canvas.height - plat.y + 95),
          active: Math.random() > 0.4,
          timer: 70 + Math.floor(Math.random() * 60),
          onDuration: 60 + Math.floor(Math.random() * 70),
          offDuration: 70 + Math.floor(Math.random() * 90),
        });
      }
    }

    return game;
  };

  const triggerJump = () => {
    if (!gameRef.current) return;
    const game = gameRef.current;
    if (!game.player.isJumping) {
      game.player.velocityY = -game.player.jumpPower;
      game.player.isJumping = true;
      if (progress.settings.haptics && navigator.vibrate) navigator.vibrate(12);
      AudioEngine.playJump();
    } else if (game.player.canDoubleJump && !game.player.hasDoubleJumped) {
      game.player.velocityY = -game.player.doubleJumpPower;
      game.player.hasDoubleJumped = true;
      if (progress.settings.haptics && navigator.vibrate) navigator.vibrate(9);
      AudioEngine.playJump();
    }
  };

  const registerCombo = (game: GameState, baseScore: number, x: number, y: number) => {
    game.combo = (game.combo || 0) + 1;
    game.comboTimer = 150;
    game.bestComboInRun = Math.max(game.bestComboInRun || 0, game.combo);
    const comboBonus = Math.min(100, Math.max(0, (game.combo - 1) * 6));
    if (comboBonus > 0) {
      game.score += comboBonus;
      game.floatingTexts.push({ x, y: y - 18, text: `COMBO x${game.combo} +${comboBonus}`, life: 35, color: '#7ef7c2' });
    }
    game.score += baseScore;
  };

  const persistRunSummary = (game: any, perfectLevel: boolean) => {
    localStorage.setItem('shadow_paw_last_run', JSON.stringify({
      enemiesDefeated: game.enemiesDefeatedInRun || 0,
      levelsCompleted: game.levelsCompletedInRun || 0,
      bestCombo: game.bestComboInRun || 0,
      bossDefeated: game.bossDefeatedInRun || false,
      perfectLevel,
    }));
  };

  const trackDeathCause = (cause: 'enemy' | 'hazard' | 'hole' | 'timer' | 'boss') => {
    try {
      const key = 'shadow_paw_telemetry';
      const prev = JSON.parse(localStorage.getItem(key) || '{}');
      const next = {
        ...prev,
        totalRuns: (prev.totalRuns || 0) + 1,
        deathsByCause: {
          enemy: (prev.deathsByCause?.enemy || 0) + (cause === 'enemy' ? 1 : 0),
          hazard: (prev.deathsByCause?.hazard || 0) + (cause === 'hazard' ? 1 : 0),
          hole: (prev.deathsByCause?.hole || 0) + (cause === 'hole' ? 1 : 0),
          timer: (prev.deathsByCause?.timer || 0) + (cause === 'timer' ? 1 : 0),
          boss: (prev.deathsByCause?.boss || 0) + (cause === 'boss' ? 1 : 0),
        },
      };
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignore telemetry failures
    }
  };

  const startNextLevel = () => {
    setShowLevelComplete(false);
    setCurrentLevel(prev => prev + 1);
  };

  const setKeyState = (code: number, active: boolean) => {
    if (!gameRef.current) return;
    const game = gameRef.current;
    game.keys[code] = active;
    if (active && [32, 38, 87].includes(code)) {
      triggerJump();
    }
  };

  const fireBullet = (targetX: number | null = null, targetY: number | null = null) => {
    if (!gameRef.current || !gameRef.current.running) return;
    const game = gameRef.current;
    if (game.ammo <= 0) return;
    const playerCenterX = game.player.x + game.player.width / 2;
    const playerCenterY = game.player.y + game.player.height / 2;

    let dx, dy;
    if (targetX !== null && targetY !== null) {
      dx = targetX - (playerCenterX - game.scrollX);
      dy = targetY - playerCenterY;
    } else {
      // Shoot framåt i den riktning katten tittar om ingen koordinat ges
      dx = game.player.facing * 500;
      dy = 0;
    }

    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 0.001) return;
    const bulletSpeed = 10;
    game.bullets.push({
      x: playerCenterX, y: playerCenterY, vx: (dx / distance) * bulletSpeed, vy: (dy / distance) * bulletSpeed, radius: 6, life: 100
    });
    game.ammo--;
    if (progress.settings.haptics && navigator.vibrate) navigator.vibrate(8);
    AudioEngine.playShoot();
  };

  // Helper function to generate a lightning bolt structure
  const createLightningBolt = (startX: number, canvasHeight: number) => {
    const points = [];
    let curX = startX;
    let curY = 0;
    points.push({ x: curX, y: curY });
    while (curY < canvasHeight * 0.8) {
      curX += (Math.random() - 0.5) * 60;
      curY += Math.random() * 40 + 10;
      points.push({ x: curX, y: curY });
    }
    return points;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed internal resolution 1280x720
    canvas.width = 1280;
    canvas.height = 720;

    // CSS handles all scaling - object-fit keeps aspect ratio with letterboxing
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.maxWidth = '100vw';
    canvas.style.maxHeight = '100vh';
    canvas.style.objectFit = 'contain';

    const game = setupLevel(currentLevel, totalScore, lives);
    if (!game) return;
    gameRef.current = game;

    const handleKeyDown = (e: KeyboardEvent) => setKeyState(e.keyCode, true);
    const handleKeyUp = (e: KeyboardEvent) => setKeyState(e.keyCode, false);
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
      const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
      fireBullet(mouseX, mouseY);
    };

    // Touch controls for mobile
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const touchX = (touch.clientX - rect.left) * (canvas.width / rect.width);
      const touchY = (touch.clientY - rect.top) * (canvas.height / rect.height);

      // Jump on left half of screen
      if (touchX < canvas.width / 2) {
        triggerJump();
      } else {
        // Shoot on right half of screen
        fireBullet(touchX, touchY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const touchX = (touch.clientX - rect.left) * (canvas.width / rect.width);

      // Move left/right based on touch position
      if (touchX < canvas.width * 0.3) {
        setKeyState(65, true); // A
        setKeyState(68, false); // D
      } else if (touchX > canvas.width * 0.7) {
        setKeyState(68, true); // D
        setKeyState(65, false); // A
      } else {
        setKeyState(65, false);
        setKeyState(68, false);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      setKeyState(65, false);
      setKeyState(68, false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousedown', handleMouseDown);

    // Add touch events for mobile
    if (isTouchDevice) {
      canvas.addEventListener('touchstart', handleTouchStart);
      canvas.addEventListener('touchmove', handleTouchMove);
      canvas.addEventListener('touchend', handleTouchEnd);
    }

    let animationId: number;
    const loop = () => {
      if (!game.running) return;
      if (game.hitStop > 0) {
        game.hitStop--;
        animationId = requestAnimationFrame(loop);
        return;
      }

      // Player Logic
      const gravityMod = game.miniEvent.active && game.miniEvent.type === 'LOW_GRAVITY' ? 0.65 : 1;
      game.player.velocityY += game.gravity * gravityMod;
      game.player.velocityX *= game.friction;
      if (game.miniEvent.active && game.miniEvent.type === 'WIND') {
        game.player.velocityX += Math.sin(Date.now() / 250) * 0.2;
      }
      if (game.keys[37] || game.keys[65]) {
        game.player.velocityX = -game.player.speed;
        game.player.facing = -1;
      }
      if (game.keys[39] || game.keys[68]) {
        game.player.velocityX = game.player.speed;
        game.player.facing = 1;
      }
      game.player.x += game.player.velocityX;
      game.player.y += game.player.velocityY;

      // Blinking
      if (!game.player.isBlinking) {
        if (Math.random() < 0.008) {
          game.player.isBlinking = true;
          game.player.blinkTimer = 10;
        }
      } else {
        game.player.blinkTimer--;
        if (game.player.blinkTimer <= 0) game.player.isBlinking = false;
      }

      // Bullets
      game.bullets = game.bullets.filter((b: any) => b.life > 0);
      game.bullets.forEach((b: any) => {
        b.x += b.vx; b.y += b.vy; b.life--;
        game.enemies.forEach((e: any) => {
          if (e.x < b.x + b.radius && e.x + e.width > b.x - b.radius && e.y < b.y + b.radius && e.y + e.height > b.y - b.radius) {
            e.x = -1000; b.life = 0;
            registerCombo(game, 200, e.x, e.y);
            game.enemiesDefeatedInRun = (game.enemiesDefeatedInRun || 0) + 1;
            AudioEngine.playExplosion();

            // Explosion particles
            for (let i = 0; i < 15; i++) {
              game.particles.push({
                x: e.x + e.width / 2, y: e.y + e.height / 2,
                vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
                life: 30, color: '#ff2222', size: Math.random() * 4 + 2
              });
            }
            // Floating score text
            game.floatingTexts.push({ x: e.x, y: e.y, text: '+200', life: 40, color: '#ff2222' });
          }
        });

        if (game.boss && game.boss.hp > 0) {
          const boss = game.boss;
          if (boss.x < b.x + b.radius && boss.x + boss.width > b.x - b.radius && boss.y < b.y + b.radius && boss.y + boss.height > b.y - b.radius) {
            b.life = 0;
            boss.hp--;
            game.hitStop = 2;
            game.screenShake = 10;
            game.floatingTexts.push({ x: boss.x + boss.width / 2, y: boss.y - 10, text: `BOSS HP ${boss.hp}`, life: 25, color: '#ff6b6b' });
            if (boss.hp <= 0) {
              registerCombo(game, 900, boss.x, boss.y);
              game.bossDefeatedInRun = true;
              AudioEngine.playExplosion();
            }
          }
        }
      });

      // Update Particles
      game.particles = game.particles.filter((p: any) => p.life > 0);
      game.particles.forEach((p: any) => {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.2; // gravity
        p.life--;
        p.size *= 0.95;
      });

      // Update Floating Texts
      game.floatingTexts = game.floatingTexts.filter((t: any) => t.life > 0);
      game.floatingTexts.forEach((t: any) => {
        t.y -= 1; // float up
        t.life--;
      });

      if (game.comboTimer > 0) game.comboTimer--;
      else game.combo = 0;

      if (game.levelType === 'Speed Run') {
        game.levelTimer = Math.max(0, game.levelTimer - 1 / 60);
        if (game.levelTimer <= 0) {
          game.lives--;
          game.deathsInRun = (game.deathsInRun || 0) + 1;
          game.running = false;
          trackDeathCause('timer');
          persistRunSummary(game, false);
          onEnd(game.score, game.totalCollectedInLevel);
          return;
        }
      }

      if (game.miniEvent.type !== 'NONE') {
        game.miniEvent.timer--;
        if (game.miniEvent.timer <= 0) {
          game.miniEvent.active = !game.miniEvent.active;
          game.miniEvent.timer = game.miniEvent.active ? game.miniEvent.duration : 420;
        }
      }

      // Weather Logic
      game.weatherParticles.forEach((p: any) => {
        if (game.weather === 'DIMMIGT') {
          p.sway += 0.01;
          p.x += Math.sin(p.sway) * 0.5 + p.speed;
          if (p.x > canvas.width + p.radius) p.x = -p.radius;
        } else {
          p.y += p.speed;
          if (game.weather === 'SNÖIGT') {
            p.sway += 0.05;
            p.x += Math.sin(p.sway) * 0.8;
          }
          if (p.y > canvas.height) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }
        }
      });

      if (game.weather === 'STORMIGT') {
        if (game.flashTimer > 0) game.flashTimer--;
        else game.bolts = []; // Clear bolts when flash ends

        if (Math.random() < 0.005) {
          game.flashTimer = 8;
          // Generate 1-2 bolts for the visual
          const boltCount = Math.floor(Math.random() * 2) + 1;
          game.bolts = [];
          for (let i = 0; i < boltCount; i++) {
            game.bolts.push(createLightningBolt(Math.random() * canvas.width, canvas.height));
          }
        }
      } else if (game.weather === 'REGNIGT' && game.intensity === 'HEAVY') {
        // Subtle thunder for heavy rain
        if (game.flashTimer > 0) game.flashTimer--;
        if (Math.random() < 0.002) game.flashTimer = 4;
      }

      // Hazard Logic
      game.hazards.forEach((h: any) => {
        if (h.type === 'movingSaw') {
          h.phase += h.speed;
          h.x = h.baseX + Math.sin(h.phase) * h.range;
        } else if (h.type === 'laser') {
          h.timer--;
          if (h.timer <= 0) {
            h.active = !h.active;
            h.timer = h.active ? h.onDuration : h.offDuration;
          }
        }
      });

      // Check if player is over a hole - if so, they fall through!
      let isOverHole = false;
      const playerFeetX = game.player.x + game.player.width / 2;
      const playerFeetY = game.player.y + game.player.height;

      game.holes.forEach(hole => {
        // Player center is within hole horizontal bounds AND at ground level
        if (playerFeetX > hole.x && playerFeetX < hole.x + hole.width &&
          playerFeetY >= hole.y - 5 && playerFeetY <= hole.y + 50) {
          isOverHole = true;
        }
      });

      // Platforms - with more forgiving collision detection
      // Only check if player is falling (velocityY >= 0) and near platform top
      if (!isOverHole && game.player.velocityY >= 0) {
        for (const p of game.platforms) {
          const playerBottom = game.player.y + game.player.height;
          const playerRight = game.player.x + game.player.width;
          const playerLeft = game.player.x;

          // More lenient check - player must be horizontally overlapping AND vertically close to platform top
          if (playerRight > p.x + 5 && playerLeft < p.x + p.width - 5 &&
            playerBottom >= p.y - 5 && playerBottom <= p.y + 25) {
            game.player.y = p.y - game.player.height;
            game.player.velocityY = 0;
            game.player.isJumping = false;
            game.player.hasDoubleJumped = false;
            break; // Found a platform, stop checking
          }
        }
      }

      // Enemies - with better null safety
      game.enemies.forEach(e => {
        if (e.x < -500 || !game.platforms[e.platform]) return;

        // Only move enemy if platform exists
        const p = game.platforms[e.platform];
        if (p) {
          e.x += e.velocityX;
          if (e.x < p.x || e.x + e.width > p.x + p.width) e.velocityX *= -1;
        }

        // ONLY check collision if player is NOT invincible AND there's actual overlap
        if (!game.player.invincible) {
          // More strict collision check - must have CLEAR overlap
          const overlapX = game.player.x + game.player.width > e.x + 5 && game.player.x < e.x + e.width - 5;
          const overlapY = game.player.y + game.player.height > e.y + 5 && game.player.y < e.y + e.height - 5;

          if (overlapX && overlapY) {
            const playerBottom = game.player.y + game.player.height;
            const enemyTop = e.y;
            const enemyCenterY = e.y + e.height / 2;

            // Check if player is falling AND above enemy's center - then defeat enemy
            // Otherwise, player takes damage
            const isAboveEnemy = playerBottom < enemyCenterY;
            const isFalling = game.player.velocityY > 0;

            if (isFalling && isAboveEnemy && playerBottom < enemyTop + 20) {
              // Player jumps on enemy - defeat enemy!
              const enemyCenterXBeforeRemove = e.x + e.width / 2;
              const enemyCenterYBeforeRemove = e.y + e.height / 2;
              e.x = -1000;
              registerCombo(game, 200, enemyCenterXBeforeRemove, enemyCenterYBeforeRemove);
              game.enemiesDefeatedInRun = (game.enemiesDefeatedInRun || 0) + 1;
              game.player.velocityY = -12;
              AudioEngine.playExplosion();
              for (let i = 0; i < 15; i++) {
                game.particles.push({
                  x: enemyCenterXBeforeRemove, y: enemyCenterYBeforeRemove,
                  vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
                  life: 30, color: '#ff8800', size: Math.random() * 4 + 2
                });
              }
              game.floatingTexts.push({ x: enemyCenterXBeforeRemove, y: enemyCenterYBeforeRemove, text: '+200', life: 40, color: '#ff8800' });
            } else {
              // Player touched enemy from side or below - die
              game.lives--;
              game.player.invincible = true;
              game.player.invincibleTimer = 90;
              game.player.x = Math.max(100, game.player.x - 150);
              game.player.y = Math.max(50, game.player.y - 50);
              game.player.velocityY = 0;
              game.combo = 0;
              AudioEngine.playDamage();
              if (game.lives <= 0) {
                game.running = false;
                trackDeathCause('enemy');
                persistRunSummary(game, false);
                onEnd(game.score, game.totalCollectedInLevel);
              }
            }
          }
        }
      });

      if (game.boss && game.boss.hp > 0) {
        const boss = game.boss;
        boss.phase += 0.04;
        boss.x += boss.velocityX;
        if (boss.x < boss.platformX || boss.x + boss.width > boss.platformX + boss.platformW) {
          boss.velocityX *= -1;
        }
        boss.y += Math.sin(boss.phase) * 0.6;

        if (!game.player.invincible) {
          const overlapX = game.player.x + game.player.width > boss.x && game.player.x < boss.x + boss.width;
          const overlapY = game.player.y + game.player.height > boss.y && game.player.y < boss.y + boss.height;
          if (overlapX && overlapY) {
            game.lives--;
            game.player.invincible = true;
            game.player.invincibleTimer = 110;
            game.player.x = Math.max(100, game.player.x - 190);
            game.player.y = Math.max(60, game.player.y - 45);
            game.player.velocityY = -5;
            game.combo = 0;
            game.screenShake = 14;
            if (progress.settings.haptics && navigator.vibrate) navigator.vibrate(35);
            AudioEngine.playDamage();
            if (game.lives <= 0) {
              game.running = false;
              trackDeathCause('boss');
              persistRunSummary(game, false);
              onEnd(game.score, game.totalCollectedInLevel);
            }
          }
        }
      }

      // Hazards damage player on touch
      if (!game.player.invincible) {
        for (const h of game.hazards) {
          if (h.type === 'laser' && !h.active) continue;
          const overlapX = game.player.x + game.player.width > h.x && game.player.x < h.x + h.width;
          const overlapY = game.player.y + game.player.height > h.y && game.player.y < h.y + h.height;
          if (overlapX && overlapY) {
            game.lives--;
            game.player.invincible = true;
            game.player.invincibleTimer = 90;
            game.player.x = Math.max(100, game.player.x - 170);
            game.player.y = Math.max(60, game.player.y - 45);
            game.player.velocityY = -3;
            game.combo = 0;
            if (progress.settings.haptics && navigator.vibrate) navigator.vibrate(26);
            AudioEngine.playDamage();
            if (game.lives <= 0) {
              game.running = false;
              trackDeathCause('hazard');
              persistRunSummary(game, false);
              onEnd(game.score, game.totalCollectedInLevel);
            }
            break;
          }
        }
      }

      if (game.player.invincibleTimer > 0) game.player.invincibleTimer--;
      else game.player.invincible = false;

      // Only die if falling into hole - with bigger buffer
      if (game.player.y > canvas.height + 100) {
        game.lives--;
        game.player.x = Math.max(100, game.player.x - 200);
        game.player.y = 100;
        game.player.velocityY = 0;
        if (game.lives <= 0) {
          game.running = false;
          trackDeathCause('hole');
          persistRunSummary(game, false);
          onEnd(game.score, game.totalCollectedInLevel);
        }
      }



      // Camera
      const playerScreenX = game.player.x - game.scrollX;
      if (playerScreenX > canvas.width * 0.6) game.scrollX = game.player.x - canvas.width * 0.6;
      if (playerScreenX < canvas.width * 0.4) game.scrollX = game.player.x - canvas.width * 0.4;
      game.scrollX = Math.max(0, Math.min(game.scrollX, game.levelLength - canvas.width));

      // Update coin positions and check collection
      game.fishes.forEach((f: any) => {
        if (!f.collected) {
          // Dynamic bobbing effect
          if (f.isFlying) {
            f.hoverOffset += 0.05;
            f.y = f.baseY + Math.sin(f.hoverOffset) * 15;
          } else {
            // Even static coins bob slightly
            f.hoverOffset = (f.hoverOffset || 0) + 0.03;
            f.y = f.baseY + Math.sin(f.hoverOffset) * 5;
          }

          // Check collision with player - collect coin
          if (game.player.x < f.x + f.width && game.player.x + game.player.width > f.x &&
            game.player.y < f.y + f.height && game.player.y + game.player.height > f.y) {
            f.collected = true;
            registerCombo(game, 50, f.x, f.y);
            game.totalCollectedInLevel++;

            // Every 10 fish = 5 coins + 1 ammo!
            if (game.totalCollectedInLevel % 10 === 0) {
              game.ammo += 1;
              // Add coins to progress
              addCoins(5);
              // Show message
              game.floatingTexts.push({ x: f.x, y: f.y - 30, text: '+5 MYNT! +1 SKOTT!', life: 60, color: '#ffd700' });
            }

            // Floating score text
            game.floatingTexts.push({ x: f.x, y: f.y, text: '+50', life: 40, color: '#ffd700' });
          }
        }
      });

      // --- DRAWING ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const applyScreenShake = game.screenShake > 0;
      if (applyScreenShake) {
        game.screenShake--;
        const shakeX = (Math.random() - 0.5) * 8;
        const shakeY = (Math.random() - 0.5) * 8;
        ctx.save();
        ctx.translate(shakeX, shakeY);
      }

      // Background - Simple sky gradient with clouds (Tom & Jerry style)
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      const seasonPalette: Record<string, [string, string]> = {
        winter: ['#8ab4df', '#e4f5ff'],
        spring: ['#8fd7b2', '#dff8ef'],
        summer: ['#87CEEB', '#E0F7FF'],
        autumn: ['#d19352', '#f3d6a6'],
      };
      const palette = seasonPalette[seasonTheme] || seasonPalette.summer;
      gradient.addColorStop(0, palette[0]);
      gradient.addColorStop(1, palette[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 5; i++) {
        const x = (i * 200 + game.scrollX / 3) % (canvas.width + 300) - 100;
        const y = 50 + (i * 30) % 100;

        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 25, y - 10, 25, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw background elements (buildings & animals) with parallax
      const now = Date.now();
      ctx.save();
      ctx.globalAlpha = 0.55;
      game.backgroundElements.forEach((el: any) => {
        const sx = el.x - game.scrollX * el.parallax;
        if (sx < -300 || sx > canvas.width + 300) return;
        const groundY = el.isSkyAnimal
          ? canvas.height - 40 + el.skyY   // sky animals float high up
          : canvas.height - 40;             // ground animals stand on ground
        const s = el.scale;
        ctx.save();
        ctx.translate(sx, groundY);

        if (el.kind === 'building') {
          const c = el.color;
          switch (el.subtype) {
            case 'skyscraper': {
              const w = 60 * s, h = 220 * s;
              ctx.fillStyle = c;
              ctx.fillRect(-w / 2, -h, w, h);
              ctx.fillStyle = 'rgba(255,255,180,0.5)';
              for (let wy = -h + 10 * s; wy < -10 * s; wy += 22 * s) {
                for (let wx = -w / 2 + 6 * s; wx < w / 2 - 6 * s; wx += 16 * s) {
                  ctx.fillRect(wx, wy, 8 * s, 12 * s);
                }
              }
              break;
            }
            case 'apartment': {
              const w = 80 * s, h = 120 * s;
              ctx.fillStyle = c;
              ctx.fillRect(-w / 2, -h, w, h);
              ctx.fillStyle = 'rgba(255,255,150,0.45)';
              for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 3; col++) {
                  ctx.fillRect(-w / 2 + 10 * s + col * 22 * s, -h + 15 * s + row * 26 * s, 12 * s, 16 * s);
                }
              }
              break;
            }
            case 'house': {
              const w = 70 * s, h = 60 * s;
              ctx.fillStyle = c;
              ctx.fillRect(-w / 2, -h, w, h);
              ctx.fillStyle = '#8B3A3A';
              ctx.beginPath();
              ctx.moveTo(-w / 2 - 5 * s, -h);
              ctx.lineTo(0, -h - 35 * s);
              ctx.lineTo(w / 2 + 5 * s, -h);
              ctx.closePath(); ctx.fill();
              ctx.fillStyle = 'rgba(255,255,150,0.6)';
              ctx.fillRect(-w / 2 + 10 * s, -h + 12 * s, 18 * s, 20 * s);
              ctx.fillRect(w / 2 - 28 * s, -h + 12 * s, 18 * s, 20 * s);
              ctx.fillStyle = '#5a3a1a';
              ctx.fillRect(-8 * s, -h + h - 26 * s, 16 * s, 26 * s);
              break;
            }
            case 'barn': {
              const w = 90 * s, h = 80 * s;
              ctx.fillStyle = '#a03020';
              ctx.fillRect(-w / 2, -h, w, h);
              ctx.fillStyle = '#802010';
              ctx.beginPath();
              ctx.moveTo(-w / 2, -h);
              ctx.lineTo(0, -h - 40 * s);
              ctx.lineTo(w / 2, -h);
              ctx.closePath(); ctx.fill();
              ctx.fillStyle = 'rgba(0,0,0,0.3)';
              ctx.fillRect(-15 * s, -55 * s, 30 * s, 55 * s);
              break;
            }
            case 'windmill': {
              const h = 100 * s;
              ctx.fillStyle = c;
              ctx.beginPath();
              ctx.moveTo(-12 * s, 0); ctx.lineTo(-18 * s, -h); ctx.lineTo(18 * s, -h); ctx.lineTo(12 * s, 0);
              ctx.closePath(); ctx.fill();
              ctx.fillStyle = '#c8b060';
              for (let a = 0; a < 4; a++) {
                ctx.save();
                ctx.translate(0, -h);
                ctx.rotate(a * Math.PI / 2 + now / 2000);
                ctx.fillRect(-4 * s, -35 * s, 8 * s, 35 * s);
                ctx.restore();
              }
              break;
            }
            case 'lighthouse': {
              const w = 28 * s, h = 130 * s;
              ctx.fillStyle = '#f0f0f0';
              ctx.fillRect(-w / 2, -h, w, h);
              for (let i = 0; i < 5; i++) {
                ctx.fillStyle = i % 2 === 0 ? '#cc3333' : '#f0f0f0';
                ctx.fillRect(-w / 2, -h + i * 26 * s, w, 13 * s);
              }
              ctx.fillStyle = '#ffff88';
              ctx.beginPath();
              ctx.arc(0, -h - 10 * s, 14 * s, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            case 'factory': {
              const w = 100 * s, h = 70 * s;
              ctx.fillStyle = c;
              ctx.fillRect(-w / 2, -h, w, h);
              ctx.fillStyle = '#888';
              ctx.fillRect(-w / 2 + 10 * s, -h - 60 * s, 18 * s, 60 * s);
              ctx.fillRect(w / 2 - 28 * s, -h - 45 * s, 18 * s, 45 * s);
              ctx.fillStyle = 'rgba(200,200,200,0.4)';
              ctx.beginPath();
              ctx.ellipse(-w / 2 + 19 * s, -h - 60 * s, 14 * s, 20 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            case 'crane': {
              ctx.fillStyle = '#e8b830';
              ctx.fillRect(-6 * s, -200 * s, 12 * s, 200 * s);
              ctx.fillRect(-6 * s, -200 * s, 90 * s, 10 * s);
              ctx.fillRect(60 * s, -200 * s, 8 * s, 60 * s);
              ctx.strokeStyle = '#c8a020';
              ctx.lineWidth = 2 * s;
              ctx.beginPath();
              ctx.moveTo(0, -195 * s); ctx.lineTo(65 * s, -143 * s);
              ctx.stroke();
              break;
            }
            case 'water_tower': {
              ctx.fillStyle = c;
              ctx.beginPath();
              ctx.ellipse(0, -90 * s, 30 * s, 35 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#5a4a3a';
              for (let i = -2; i <= 2; i++) {
                ctx.fillRect(i * 12 * s - 3 * s, -55 * s, 6 * s, 55 * s);
              }
              break;
            }
            case 'cabin': {
              const w = 65 * s, h = 55 * s;
              ctx.fillStyle = '#8B6340';
              ctx.fillRect(-w / 2, -h, w, h);
              ctx.fillStyle = '#5a3010';
              for (let i = 0; i < 5; i++) {
                ctx.fillRect(-w / 2, -h + i * 11 * s, w, 5 * s);
              }
              ctx.fillStyle = '#5a3a1a';
              ctx.beginPath();
              ctx.moveTo(-w / 2 - 5 * s, -h); ctx.lineTo(0, -h - 28 * s); ctx.lineTo(w / 2 + 5 * s, -h);
              ctx.closePath(); ctx.fill();
              break;
            }
            case 'billboard': {
              ctx.fillStyle = '#444';
              ctx.fillRect(-4 * s, -120 * s, 8 * s, 120 * s);
              ctx.fillStyle = '#fff';
              ctx.fillRect(-45 * s, -120 * s, 90 * s, 55 * s);
              ctx.fillStyle = ['#ff4444', '#4444ff', '#44aa44', '#ffaa00'][Math.floor(el.x / 100) % 4];
              ctx.fillRect(-40 * s, -115 * s, 80 * s, 45 * s);
              break;
            }
            default: {
              // Generic box building
              const w = 50 * s, h = 80 * s;
              ctx.fillStyle = c;
              ctx.fillRect(-w / 2, -h, w, h);
              break;
            }
          }
        } else {
          // Animals — larger scale, clear outlines, waving arm for friendly ones
          const bounce = Math.sin(now / 500 + el.phase) * 4 * s;
          const waveArm = el.waves ? Math.sin(now / 300 + el.phase) * 0.9 - 0.3 : 0;
          ctx.translate(0, bounce);

          // Helper: outline stroke for clarity
          const outline = (color: string) => { ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 2.5 * s; ctx.stroke(); ctx.fillStyle = color; ctx.fill(); };
          const outlineFill = (color: string) => { ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2 * s; ctx.stroke(); };

          switch (el.subtype) {

            case 'cat': case 'stray_cat': case 'space_cat': {
              const bc = el.subtype === 'space_cat' ? '#b0b8cc' : el.subtype === 'stray_cat' ? '#aa8866' : '#778899';
              // Body
              ctx.beginPath(); ctx.ellipse(0, -28 * s, 16 * s, 20 * s, 0, 0, Math.PI * 2); outlineFill(bc);
              // Head
              ctx.beginPath(); ctx.ellipse(0, -54 * s, 14 * s, 13 * s, 0, 0, Math.PI * 2); outlineFill(bc);
              // Ears
              ctx.beginPath(); ctx.moveTo(-12 * s, -64 * s); ctx.lineTo(-16 * s, -78 * s); ctx.lineTo(-4 * s, -64 * s); outlineFill('#cc9966');
              ctx.beginPath(); ctx.moveTo(12 * s, -64 * s); ctx.lineTo(16 * s, -78 * s); ctx.lineTo(4 * s, -64 * s); outlineFill('#cc9966');
              // Eyes
              ctx.beginPath(); ctx.arc(-5 * s, -55 * s, 4 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.beginPath(); ctx.arc(5 * s, -55 * s, 4 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = '#33cc33'; ctx.beginPath(); ctx.arc(-5 * s, -55 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#33cc33'; ctx.beginPath(); ctx.arc(5 * s, -55 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(-5 * s, -55 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(5 * s, -55 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
              // Nose + smile
              ctx.fillStyle = '#ff88aa'; ctx.beginPath(); ctx.arc(0, -51 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.arc(-3 * s, -49 * s, 3 * s, 0, Math.PI); ctx.stroke();
              ctx.beginPath(); ctx.arc(3 * s, -49 * s, 3 * s, 0, Math.PI); ctx.stroke();
              // Whiskers
              ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.2 * s;
              ctx.beginPath(); ctx.moveTo(-3 * s, -51 * s); ctx.lineTo(-18 * s, -50 * s); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(-3 * s, -51 * s); ctx.lineTo(-18 * s, -53 * s); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(3 * s, -51 * s); ctx.lineTo(18 * s, -50 * s); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(3 * s, -51 * s); ctx.lineTo(18 * s, -53 * s); ctx.stroke();
              // Left arm (static)
              ctx.beginPath(); ctx.moveTo(-14 * s, -36 * s); ctx.lineTo(-22 * s, -22 * s); ctx.lineTo(-14 * s, -18 * s); outlineFill(bc);
              // Right arm WAVING
              ctx.save(); ctx.translate(14 * s, -36 * s); ctx.rotate(waveArm);
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(16 * s, -14 * s); ctx.lineTo(10 * s, -8 * s); outlineFill(bc);
              ctx.restore();
              // Tail
              ctx.strokeStyle = bc; ctx.lineWidth = 5 * s; ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(-14 * s, -14 * s); ctx.quadraticCurveTo(-32 * s, 0 * s, -26 * s, 16 * s); ctx.stroke();
              ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.5 * s;
              ctx.beginPath(); ctx.moveTo(-14 * s, -14 * s); ctx.quadraticCurveTo(-32 * s, 0 * s, -26 * s, 16 * s); ctx.stroke();
              break;
            }

            case 'dog': {
              // Body
              ctx.beginPath(); ctx.ellipse(0, -26 * s, 18 * s, 18 * s, 0, 0, Math.PI * 2); outlineFill('#c8943a');
              // Head
              ctx.beginPath(); ctx.ellipse(0, -52 * s, 15 * s, 14 * s, 0, 0, Math.PI * 2); outlineFill('#c8943a');
              // Floppy ears
              ctx.beginPath(); ctx.ellipse(-17 * s, -52 * s, 6 * s, 12 * s, -.4, 0, Math.PI * 2); outlineFill('#a07028');
              ctx.beginPath(); ctx.ellipse(17 * s, -52 * s, 6 * s, 12 * s, .4, 0, Math.PI * 2); outlineFill('#a07028');
              // Snout
              ctx.beginPath(); ctx.ellipse(0, -47 * s, 8 * s, 6 * s, 0, 0, Math.PI * 2); outlineFill('#e8b060');
              // Nose
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.ellipse(0, -50 * s, 4 * s, 3 * s, 0, 0, Math.PI * 2); ctx.fill();
              // Eyes
              ctx.beginPath(); ctx.arc(-6 * s, -56 * s, 4.5 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.beginPath(); ctx.arc(6 * s, -56 * s, 4.5 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = '#5533aa'; ctx.beginPath(); ctx.arc(-6 * s, -56 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#5533aa'; ctx.beginPath(); ctx.arc(6 * s, -56 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(-6 * s, -56 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(6 * s, -56 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
              // Tongue
              ctx.fillStyle = '#ff6688'; ctx.beginPath(); ctx.ellipse(0, -43 * s, 4 * s, 5 * s, 0, 0, Math.PI * 2); ctx.fill();
              // Arms
              ctx.beginPath(); ctx.moveTo(-16 * s, -34 * s); ctx.lineTo(-26 * s, -18 * s); ctx.lineTo(-18 * s, -14 * s); outlineFill('#c8943a');
              // Waving arm
              ctx.save(); ctx.translate(16 * s, -34 * s); ctx.rotate(waveArm);
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(22 * s, -16 * s); ctx.lineTo(14 * s, -10 * s); outlineFill('#c8943a');
              ctx.restore();
              // Tail wagging
              const dogTailWag = Math.sin(now / 150 + el.phase) * 0.7;
              ctx.strokeStyle = '#a07028'; ctx.lineWidth = 6 * s; ctx.lineCap = 'round';
              ctx.save(); ctx.translate(-16 * s, -20 * s); ctx.rotate(dogTailWag);
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-18 * s, -10 * s, -14 * s, 8 * s); ctx.stroke();
              ctx.restore();
              break;
            }

            case 'rabbit': {
              // Body
              ctx.beginPath(); ctx.ellipse(0, -26 * s, 16 * s, 20 * s, 0, 0, Math.PI * 2); outlineFill('#e8ddd0');
              // Head
              ctx.beginPath(); ctx.ellipse(0, -52 * s, 13 * s, 13 * s, 0, 0, Math.PI * 2); outlineFill('#e8ddd0');
              // Long ears
              ctx.beginPath(); ctx.ellipse(-7 * s, -72 * s, 5 * s, 20 * s, -.15, 0, Math.PI * 2); outlineFill('#e8ddd0');
              ctx.beginPath(); ctx.ellipse(7 * s, -72 * s, 5 * s, 20 * s, .15, 0, Math.PI * 2); outlineFill('#e8ddd0');
              ctx.fillStyle = '#ffb0c0'; ctx.beginPath(); ctx.ellipse(-7 * s, -72 * s, 2.5 * s, 16 * s, -.15, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#ffb0c0'; ctx.beginPath(); ctx.ellipse(7 * s, -72 * s, 2.5 * s, 16 * s, .15, 0, Math.PI * 2); ctx.fill();
              // Eyes
              ctx.beginPath(); ctx.arc(-5 * s, -53 * s, 4 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.beginPath(); ctx.arc(5 * s, -53 * s, 4 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = '#ff3366'; ctx.beginPath(); ctx.arc(-5 * s, -53 * s, 2.3 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#ff3366'; ctx.beginPath(); ctx.arc(5 * s, -53 * s, 2.3 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(-5 * s, -53 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(5 * s, -53 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
              // Nose
              ctx.fillStyle = '#ff7799'; ctx.beginPath(); ctx.arc(0, -49 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              // Smile
              ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5 * s;
              ctx.beginPath(); ctx.arc(-2.5 * s, -47 * s, 2.5 * s, 0, Math.PI); ctx.stroke();
              ctx.beginPath(); ctx.arc(2.5 * s, -47 * s, 2.5 * s, 0, Math.PI); ctx.stroke();
              // Left arm
              ctx.beginPath(); ctx.moveTo(-14 * s, -34 * s); ctx.lineTo(-22 * s, -20 * s); ctx.lineTo(-14 * s, -16 * s); outlineFill('#e8ddd0');
              // Waving arm
              ctx.save(); ctx.translate(14 * s, -34 * s); ctx.rotate(waveArm);
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(20 * s, -16 * s); ctx.lineTo(12 * s, -8 * s); outlineFill('#e8ddd0');
              ctx.restore();
              // Fluffy tail
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(-2 * s, -8 * s, 8 * s, 0, Math.PI * 2); ctx.fill();
              ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1.5 * s; ctx.stroke();
              break;
            }

            case 'bear': {
              // Body
              ctx.beginPath(); ctx.ellipse(0, -28 * s, 22 * s, 24 * s, 0, 0, Math.PI * 2); outlineFill('#6a4020');
              // Head
              ctx.beginPath(); ctx.ellipse(0, -58 * s, 18 * s, 17 * s, 0, 0, Math.PI * 2); outlineFill('#6a4020');
              // Round ears
              ctx.beginPath(); ctx.arc(-14 * s, -73 * s, 8 * s, 0, Math.PI * 2); outlineFill('#6a4020');
              ctx.beginPath(); ctx.arc(14 * s, -73 * s, 8 * s, 0, Math.PI * 2); outlineFill('#6a4020');
              ctx.fillStyle = '#c8a080'; ctx.beginPath(); ctx.arc(-14 * s, -73 * s, 4.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#c8a080'; ctx.beginPath(); ctx.arc(14 * s, -73 * s, 4.5 * s, 0, Math.PI * 2); ctx.fill();
              // Snout
              ctx.beginPath(); ctx.ellipse(0, -53 * s, 9 * s, 7 * s, 0, 0, Math.PI * 2); outlineFill('#c8a080');
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.ellipse(0, -57 * s, 5 * s, 3.5 * s, 0, 0, Math.PI * 2); ctx.fill();
              // Eyes
              ctx.beginPath(); ctx.arc(-7 * s, -61 * s, 5 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.beginPath(); ctx.arc(7 * s, -61 * s, 5 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(-7 * s, -61 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(7 * s, -61 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(-5.5 * s, -62.5 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(8.5 * s, -62.5 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
              // Friendly smile
              ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2 * s; ctx.lineCap = 'round';
              ctx.beginPath(); ctx.arc(0, -50 * s, 5 * s, 0, Math.PI); ctx.stroke();
              // Left arm
              ctx.beginPath(); ctx.moveTo(-20 * s, -36 * s); ctx.lineTo(-30 * s, -18 * s); ctx.lineTo(-20 * s, -14 * s); outlineFill('#6a4020');
              // WAVING arm
              ctx.save(); ctx.translate(20 * s, -36 * s); ctx.rotate(waveArm);
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(26 * s, -18 * s); ctx.lineTo(18 * s, -10 * s); outlineFill('#6a4020');
              ctx.restore();
              break;
            }

            case 'deer': {
              ctx.beginPath(); ctx.ellipse(0, -26 * s, 14 * s, 18 * s, 0, 0, Math.PI * 2); outlineFill('#c87840');
              ctx.beginPath(); ctx.ellipse(0, -50 * s, 11 * s, 12 * s, 0, 0, Math.PI * 2); outlineFill('#c87840');
              // Antlers
              ctx.strokeStyle = '#7B3A10'; ctx.lineWidth = 3.5 * s; ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(-6 * s, -60 * s); ctx.lineTo(-10 * s, -78 * s); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(-10 * s, -78 * s); ctx.lineTo(-16 * s, -70 * s); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(-10 * s, -78 * s); ctx.lineTo(-5 * s, -70 * s); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(6 * s, -60 * s); ctx.lineTo(10 * s, -78 * s); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(10 * s, -78 * s); ctx.lineTo(16 * s, -70 * s); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(10 * s, -78 * s); ctx.lineTo(5 * s, -70 * s); ctx.stroke();
              // White belly
              ctx.beginPath(); ctx.ellipse(0, -28 * s, 8 * s, 12 * s, 0, 0, Math.PI * 2); outlineFill('#f0e0c8');
              // Eyes
              ctx.beginPath(); ctx.arc(-5 * s, -51 * s, 4 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.beginPath(); ctx.arc(5 * s, -51 * s, 4 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = '#4a2800'; ctx.beginPath(); ctx.arc(-5 * s, -51 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#4a2800'; ctx.beginPath(); ctx.arc(5 * s, -51 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(-4 * s, -52 * s, 1 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(6 * s, -52 * s, 1 * s, 0, Math.PI * 2); ctx.fill();
              // Nose
              ctx.fillStyle = '#cc5533'; ctx.beginPath(); ctx.arc(0, -46 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
              // WAVING arm/leg
              ctx.save(); ctx.translate(12 * s, -30 * s); ctx.rotate(waveArm);
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(18 * s, -14 * s); ctx.lineTo(12 * s, -6 * s); outlineFill('#c87840');
              ctx.restore();
              break;
            }

            case 'cow': {
              ctx.beginPath(); ctx.ellipse(0, -24 * s, 22 * s, 20 * s, 0, 0, Math.PI * 2); outlineFill('#f5f5f0');
              // Black patches
              ctx.fillStyle = '#222'; ctx.beginPath(); ctx.ellipse(-8 * s, -30 * s, 8 * s, 7 * s, -.3, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#222'; ctx.beginPath(); ctx.ellipse(10 * s, -18 * s, 7 * s, 6 * s, .2, 0, Math.PI * 2); ctx.fill();
              // Head
              ctx.beginPath(); ctx.ellipse(0, -50 * s, 14 * s, 13 * s, 0, 0, Math.PI * 2); outlineFill('#f5f5f0');
              // Ears
              ctx.beginPath(); ctx.ellipse(-16 * s, -50 * s, 5 * s, 8 * s, 0, 0, Math.PI * 2); outlineFill('#f5f5f0');
              ctx.beginPath(); ctx.ellipse(16 * s, -50 * s, 5 * s, 8 * s, 0, 0, Math.PI * 2); outlineFill('#f5f5f0');
              ctx.fillStyle = '#ffaabb'; ctx.beginPath(); ctx.ellipse(-16 * s, -50 * s, 3 * s, 5 * s, 0, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#ffaabb'; ctx.beginPath(); ctx.ellipse(16 * s, -50 * s, 3 * s, 5 * s, 0, 0, Math.PI * 2); ctx.fill();
              // Snout
              ctx.beginPath(); ctx.ellipse(0, -45 * s, 8 * s, 6 * s, 0, 0, Math.PI * 2); outlineFill('#ffccaa');
              ctx.fillStyle = '#885533'; ctx.beginPath(); ctx.arc(-3 * s, -46 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#885533'; ctx.beginPath(); ctx.arc(3 * s, -46 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
              // Eyes
              ctx.beginPath(); ctx.arc(-6 * s, -54 * s, 4.5 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.beginPath(); ctx.arc(6 * s, -54 * s, 4.5 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = '#553300'; ctx.beginPath(); ctx.arc(-6 * s, -54 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#553300'; ctx.beginPath(); ctx.arc(6 * s, -54 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(-5 * s, -55 * s, 1 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(7 * s, -55 * s, 1 * s, 0, Math.PI * 2); ctx.fill();
              // WAVING arm
              ctx.save(); ctx.translate(18 * s, -30 * s); ctx.rotate(waveArm);
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(20 * s, -14 * s); ctx.lineTo(12 * s, -8 * s); outlineFill('#f5f5f0');
              ctx.restore();
              break;
            }

            case 'horse': {
              ctx.beginPath(); ctx.ellipse(0, -26 * s, 22 * s, 18 * s, 0, 0, Math.PI * 2); outlineFill('#9B5c30');
              ctx.beginPath(); ctx.ellipse(18 * s, -44 * s, 10 * s, 18 * s, .2, 0, Math.PI * 2); outlineFill('#9B5c30');
              // Mane
              ctx.fillStyle = '#6a3010'; ctx.beginPath(); ctx.moveTo(10 * s, -55 * s); ctx.quadraticCurveTo(20 * s, -65 * s, 22 * s, -55 * s); ctx.quadraticCurveTo(18 * s, -52 * s, 14 * s, -55 * s); ctx.fill();
              // Eye
              ctx.beginPath(); ctx.arc(22 * s, -46 * s, 5 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = '#332200'; ctx.beginPath(); ctx.arc(22 * s, -46 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(23 * s, -47 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
              // Nostril
              ctx.fillStyle = '#7a3010'; ctx.beginPath(); ctx.ellipse(26 * s, -40 * s, 3 * s, 2 * s, .3, 0, Math.PI * 2); ctx.fill();
              // Tail
              ctx.strokeStyle = '#6a3010'; ctx.lineWidth = 6 * s; ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(-20 * s, -22 * s); ctx.quadraticCurveTo(-36 * s, -10 * s, -30 * s, 12 * s); ctx.stroke();
              // WAVING front leg
              ctx.save(); ctx.translate(16 * s, -26 * s); ctx.rotate(waveArm * 0.6);
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10 * s, 20 * s); ctx.lineTo(4 * s, 20 * s); outlineFill('#9B5c30');
              ctx.restore();
              break;
            }

            case 'bird': case 'pigeon': {
              const bCol = el.subtype === 'pigeon' ? '#9090a0' : '#4466aa';
              ctx.beginPath(); ctx.ellipse(0, -22 * s, 13 * s, 9 * s, 0, 0, Math.PI * 2); outlineFill(bCol);
              ctx.beginPath(); ctx.ellipse(12 * s, -26 * s, 9 * s, 8 * s, 0, 0, Math.PI * 2); outlineFill(bCol);
              // Beak
              ctx.fillStyle = '#ffaa00'; ctx.beginPath(); ctx.moveTo(20 * s, -26 * s); ctx.lineTo(28 * s, -24 * s); ctx.lineTo(20 * s, -22 * s); ctx.fill();
              // Eye
              ctx.beginPath(); ctx.arc(15 * s, -28 * s, 4 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(15 * s, -28 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(16 * s, -29 * s, 1 * s, 0, Math.PI * 2); ctx.fill();
              // Flapping wings
              const wingFlap = Math.sin(now / 180 + el.phase) * 0.7;
              ctx.save(); ctx.translate(-8 * s, -22 * s); ctx.rotate(-wingFlap);
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-22 * s, -5 * s); ctx.lineTo(-16 * s, 6 * s); outlineFill(bCol);
              ctx.restore();
              ctx.save(); ctx.translate(6 * s, -22 * s); ctx.rotate(wingFlap);
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(20 * s, -5 * s); ctx.lineTo(14 * s, 6 * s); outlineFill(bCol);
              ctx.restore();
              break;
            }

            case 'crow': {
              ctx.beginPath(); ctx.ellipse(0, -22 * s, 12 * s, 8 * s, 0, 0, Math.PI * 2); outlineFill('#1a1a2a');
              ctx.beginPath(); ctx.ellipse(11 * s, -26 * s, 8 * s, 7 * s, 0, 0, Math.PI * 2); outlineFill('#1a1a2a');
              ctx.fillStyle = '#223333'; ctx.beginPath(); ctx.moveTo(18 * s, -26 * s); ctx.lineTo(26 * s, -25 * s); ctx.lineTo(18 * s, -23 * s); ctx.fill();
              ctx.beginPath(); ctx.arc(14 * s, -28 * s, 3.5 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = '#2255ff'; ctx.beginPath(); ctx.arc(14 * s, -28 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(14 * s, -28 * s, 1 * s, 0, Math.PI * 2); ctx.fill();
              const cFlap = Math.sin(now / 200 + el.phase) * 0.6;
              ctx.save(); ctx.translate(-7 * s, -22 * s); ctx.rotate(-cFlap);
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-24 * s, -6 * s); ctx.lineTo(-18 * s, 6 * s); outlineFill('#1a1a2a');
              ctx.restore();
              break;
            }

            case 'seagull': {
              ctx.beginPath(); ctx.ellipse(0, -22 * s, 12 * s, 8 * s, 0, 0, Math.PI * 2); outlineFill('#f8f8ff');
              ctx.beginPath(); ctx.ellipse(11 * s, -26 * s, 9 * s, 8 * s, 0, 0, Math.PI * 2); outlineFill('#f8f8ff');
              ctx.fillStyle = '#ffaa00'; ctx.beginPath(); ctx.moveTo(19 * s, -25 * s); ctx.lineTo(27 * s, -23 * s); ctx.lineTo(19 * s, -21 * s); ctx.fill();
              ctx.beginPath(); ctx.arc(14 * s, -28 * s, 4 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.arc(14 * s, -28 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
              const sgFlap = Math.sin(now / 210 + el.phase) * 0.65;
              ctx.save(); ctx.translate(-8 * s, -22 * s); ctx.rotate(-sgFlap);
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-25 * s, -5 * s); ctx.lineTo(-18 * s, 6 * s); outlineFill('#e8e8ee');
              ctx.restore();
              break;
            }

            case 'owl': {
              ctx.beginPath(); ctx.ellipse(0, -28 * s, 14 * s, 20 * s, 0, 0, Math.PI * 2); outlineFill('#9a7a30');
              // Ear tufts
              ctx.beginPath(); ctx.moveTo(-10 * s, -46 * s); ctx.lineTo(-14 * s, -58 * s); ctx.lineTo(-5 * s, -46 * s); outlineFill('#7a5a20');
              ctx.beginPath(); ctx.moveTo(10 * s, -46 * s); ctx.lineTo(14 * s, -58 * s); ctx.lineTo(5 * s, -46 * s); outlineFill('#7a5a20');
              // Face disc
              ctx.beginPath(); ctx.arc(0, -34 * s, 12 * s, 0, Math.PI * 2); outlineFill('#f5e8a0');
              // Eyes — big
              ctx.beginPath(); ctx.arc(-5 * s, -35 * s, 6.5 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.beginPath(); ctx.arc(5 * s, -35 * s, 6.5 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.arc(-5 * s, -35 * s, 5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.arc(5 * s, -35 * s, 5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(-5 * s, -35 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(5 * s, -35 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(-3.5 * s, -37 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(6.5 * s, -37 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
              // Beak
              ctx.fillStyle = '#cc8800'; ctx.beginPath(); ctx.moveTo(0, -29 * s); ctx.lineTo(-3.5 * s, -25 * s); ctx.lineTo(3.5 * s, -25 * s); ctx.fill();
              // Wings open slightly
              ctx.beginPath(); ctx.moveTo(-12 * s, -28 * s); ctx.lineTo(-28 * s, -14 * s); ctx.lineTo(-18 * s, -6 * s); outlineFill('#9a7a30');
              ctx.beginPath(); ctx.moveTo(12 * s, -28 * s); ctx.lineTo(28 * s, -14 * s); ctx.lineTo(18 * s, -6 * s); outlineFill('#9a7a30');
              break;
            }

            case 'eagle': {
              ctx.beginPath(); ctx.ellipse(0, -26 * s, 16 * s, 20 * s, 0, 0, Math.PI * 2); outlineFill('#5a3010');
              ctx.beginPath(); ctx.ellipse(12 * s, -46 * s, 10 * s, 11 * s, 0, 0, Math.PI * 2); outlineFill('#5a3010');
              // White head
              ctx.beginPath(); ctx.arc(12 * s, -48 * s, 7 * s, 0, Math.PI * 2); outlineFill('#f8f8f8');
              // Hooked beak
              ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.moveTo(18 * s, -46 * s); ctx.lineTo(26 * s, -44 * s); ctx.lineTo(22 * s, -42 * s); ctx.closePath(); ctx.fill();
              // Eye
              ctx.fillStyle = '#ffff00'; ctx.beginPath(); ctx.arc(14 * s, -49 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(14 * s, -49 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(15 * s, -50 * s, 1 * s, 0, Math.PI * 2); ctx.fill();
              // Wings soaring
              const eagleWing = Math.sin(now / 400 + el.phase) * 0.25;
              ctx.save(); ctx.translate(-14 * s, -26 * s); ctx.rotate(eagleWing - 0.1);
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-38 * s, -10 * s); ctx.lineTo(-30 * s, 10 * s); outlineFill('#4a2800');
              ctx.restore();
              ctx.save(); ctx.translate(14 * s, -26 * s); ctx.rotate(-eagleWing + 0.1);
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(38 * s, -10 * s); ctx.lineTo(30 * s, 10 * s); outlineFill('#4a2800');
              ctx.restore();
              break;
            }

            case 'squirrel': {
              ctx.beginPath(); ctx.ellipse(0, -26 * s, 10 * s, 15 * s, 0, 0, Math.PI * 2); outlineFill('#c87030');
              ctx.beginPath(); ctx.ellipse(0, -44 * s, 9 * s, 10 * s, 0, 0, Math.PI * 2); outlineFill('#c87030');
              // Ears
              ctx.beginPath(); ctx.arc(-6 * s, -52 * s, 4.5 * s, 0, Math.PI * 2); outlineFill('#c87030');
              ctx.beginPath(); ctx.arc(6 * s, -52 * s, 4.5 * s, 0, Math.PI * 2); outlineFill('#c87030');
              // Eyes
              ctx.beginPath(); ctx.arc(-4 * s, -45 * s, 3.5 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.beginPath(); ctx.arc(4 * s, -45 * s, 3.5 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(-4 * s, -45 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(4 * s, -45 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(-3 * s, -46 * s, 0.8 * s, 0, Math.PI * 2); ctx.fill();
              // Nose
              ctx.fillStyle = '#cc5533'; ctx.beginPath(); ctx.arc(0, -42 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
              // Bushy tail
              ctx.fillStyle = '#c87030'; ctx.strokeStyle = '#a05820'; ctx.lineWidth = 10 * s; ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(8 * s, -22 * s); ctx.quadraticCurveTo(30 * s, -16 * s, 22 * s, 8 * s); ctx.stroke();
              ctx.strokeStyle = '#d99040'; ctx.lineWidth = 5 * s;
              ctx.beginPath(); ctx.moveTo(8 * s, -22 * s); ctx.quadraticCurveTo(30 * s, -16 * s, 22 * s, 8 * s); ctx.stroke();
              // Arm holding nut
              ctx.beginPath(); ctx.moveTo(-8 * s, -32 * s); ctx.lineTo(-14 * s, -22 * s); ctx.lineTo(-8 * s, -18 * s); outlineFill('#c87030');
              ctx.fillStyle = '#885500'; ctx.beginPath(); ctx.arc(-14 * s, -20 * s, 5 * s, 0, Math.PI * 2); ctx.fill();
              break;
            }

            case 'fox': {
              ctx.beginPath(); ctx.ellipse(0, -24 * s, 14 * s, 18 * s, 0, 0, Math.PI * 2); outlineFill('#e06820');
              ctx.fillStyle = '#f8f0e0'; ctx.beginPath(); ctx.ellipse(0, -22 * s, 7 * s, 12 * s, 0, 0, Math.PI * 2); ctx.fill();
              ctx.beginPath(); ctx.ellipse(0, -46 * s, 11 * s, 12 * s, 0, 0, Math.PI * 2); outlineFill('#e06820');
              // Triangle ears
              ctx.beginPath(); ctx.moveTo(-10 * s, -54 * s); ctx.lineTo(-14 * s, -68 * s); ctx.lineTo(-3 * s, -54 * s); outlineFill('#e06820');
              ctx.beginPath(); ctx.moveTo(10 * s, -54 * s); ctx.lineTo(14 * s, -68 * s); ctx.lineTo(3 * s, -54 * s); outlineFill('#e06820');
              ctx.fillStyle = '#cc4411'; ctx.beginPath(); ctx.moveTo(-9 * s, -55 * s); ctx.lineTo(-12 * s, -65 * s); ctx.lineTo(-4 * s, -55 * s); ctx.fill();
              ctx.fillStyle = '#cc4411'; ctx.beginPath(); ctx.moveTo(9 * s, -55 * s); ctx.lineTo(12 * s, -65 * s); ctx.lineTo(4 * s, -55 * s); ctx.fill();
              // Snout
              ctx.beginPath(); ctx.ellipse(0, -42 * s, 6 * s, 5 * s, 0, 0, Math.PI * 2); outlineFill('#f8e8d0');
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(0, -45 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              // Eyes
              ctx.beginPath(); ctx.arc(-5 * s, -49 * s, 4.5 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.beginPath(); ctx.arc(5 * s, -49 * s, 4.5 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = '#cc8800'; ctx.beginPath(); ctx.arc(-5 * s, -49 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#cc8800'; ctx.beginPath(); ctx.arc(5 * s, -49 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(-5 * s, -49 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(5 * s, -49 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();
              // Fluffy tail
              ctx.strokeStyle = '#e06820'; ctx.lineWidth = 10 * s; ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(-12 * s, -14 * s); ctx.quadraticCurveTo(-34 * s, -2 * s, -28 * s, 18 * s); ctx.stroke();
              ctx.strokeStyle = 'white'; ctx.lineWidth = 4 * s;
              ctx.beginPath(); ctx.moveTo(-26 * s, 8 * s); ctx.quadraticCurveTo(-30 * s, 14 * s, -28 * s, 18 * s); ctx.stroke();
              break;
            }

            case 'rat': {
              ctx.beginPath(); ctx.ellipse(0, -18 * s, 12 * s, 10 * s, 0, 0, Math.PI * 2); outlineFill('#8a8070');
              ctx.beginPath(); ctx.ellipse(9 * s, -30 * s, 8 * s, 8 * s, 0, 0, Math.PI * 2); outlineFill('#8a8070');
              // Big round ears
              ctx.beginPath(); ctx.arc(-3 * s, -36 * s, 6 * s, 0, Math.PI * 2); outlineFill('#b89080');
              ctx.beginPath(); ctx.arc(9 * s, -36 * s, 6 * s, 0, Math.PI * 2); outlineFill('#b89080');
              ctx.fillStyle = '#ffaabb'; ctx.beginPath(); ctx.arc(-3 * s, -36 * s, 3.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#ffaabb'; ctx.beginPath(); ctx.arc(9 * s, -36 * s, 3.5 * s, 0, Math.PI * 2); ctx.fill();
              // Eyes
              ctx.beginPath(); ctx.arc(6 * s, -31 * s, 4 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.beginPath(); ctx.arc(12 * s, -32 * s, 4 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = '#ff2244'; ctx.beginPath(); ctx.arc(6 * s, -31 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#ff2244'; ctx.beginPath(); ctx.arc(12 * s, -32 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(6 * s, -31 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(12 * s, -32 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
              // Long nose
              ctx.fillStyle = '#cc8877'; ctx.beginPath(); ctx.arc(16 * s, -29 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
              // Whiskers
              ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1 * s;
              ctx.beginPath(); ctx.moveTo(14 * s, -29 * s); ctx.lineTo(26 * s, -27 * s); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(14 * s, -29 * s); ctx.lineTo(26 * s, -31 * s); ctx.stroke();
              // Tail
              ctx.strokeStyle = '#9a8070'; ctx.lineWidth = 3 * s; ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(-11 * s, -14 * s); ctx.quadraticCurveTo(-26 * s, -2 * s, -22 * s, 12 * s); ctx.stroke();
              break;
            }

            case 'bat': {
              const batFlap = Math.sin(now / 120 + el.phase);
              ctx.beginPath(); ctx.ellipse(0, -36 * s, 10 * s, 12 * s, 0, 0, Math.PI * 2); outlineFill('#553366');
              // Ears
              ctx.beginPath(); ctx.moveTo(-7 * s, -46 * s); ctx.lineTo(-11 * s, -58 * s); ctx.lineTo(-2 * s, -46 * s); outlineFill('#442255');
              ctx.beginPath(); ctx.moveTo(7 * s, -46 * s); ctx.lineTo(11 * s, -58 * s); ctx.lineTo(2 * s, -46 * s); outlineFill('#442255');
              // Glowing eyes
              ctx.fillStyle = '#ff2222'; ctx.beginPath(); ctx.arc(-4 * s, -38 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#ff2222'; ctx.beginPath(); ctx.arc(4 * s, -38 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#ff8888'; ctx.beginPath(); ctx.arc(-4 * s, -38 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#ff8888'; ctx.beginPath(); ctx.arc(4 * s, -38 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
              // Wings
              ctx.save(); ctx.translate(-8 * s, -36 * s); ctx.rotate(-batFlap * 0.8 - 0.3);
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-32 * s, -10 * s); ctx.quadraticCurveTo(-28 * s, 5 * s, -20 * s, 6 * s); ctx.closePath(); outlineFill('#442255');
              ctx.restore();
              ctx.save(); ctx.translate(8 * s, -36 * s); ctx.rotate(batFlap * 0.8 + 0.3);
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(32 * s, -10 * s); ctx.quadraticCurveTo(28 * s, 5 * s, 20 * s, 6 * s); ctx.closePath(); outlineFill('#442255');
              ctx.restore();
              // Little fangs
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.moveTo(-3 * s, -28 * s); ctx.lineTo(-1.5 * s, -24 * s); ctx.lineTo(0, -28 * s); ctx.fill();
              ctx.beginPath(); ctx.moveTo(3 * s, -28 * s); ctx.lineTo(1.5 * s, -24 * s); ctx.lineTo(0, -28 * s); ctx.fill();
              break;
            }

            case 'crab': {
              ctx.beginPath(); ctx.ellipse(0, -14 * s, 18 * s, 12 * s, 0, 0, Math.PI * 2); outlineFill('#dd4422');
              // Eyes on stalks
              ctx.fillStyle = '#cc3311'; ctx.fillRect(-10 * s, -20 * s, 4 * s, 8 * s); ctx.fillRect(6 * s, -20 * s, 4 * s, 8 * s);
              ctx.beginPath(); ctx.arc(-8 * s, -22 * s, 5 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.beginPath(); ctx.arc(8 * s, -22 * s, 5 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(-8 * s, -22 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(8 * s, -22 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
              // Claws
              const clawSnap = Math.sin(now / 300 + el.phase) * 0.4;
              ctx.save(); ctx.translate(-22 * s, -12 * s); ctx.rotate(clawSnap - 0.3);
              ctx.beginPath(); ctx.ellipse(0, 0, 10 * s, 7 * s, 0, 0, Math.PI * 2); outlineFill('#ee5533');
              ctx.restore();
              ctx.save(); ctx.translate(22 * s, -12 * s); ctx.rotate(-clawSnap + 0.3);
              ctx.beginPath(); ctx.ellipse(0, 0, 10 * s, 7 * s, 0, 0, Math.PI * 2); outlineFill('#ee5533');
              ctx.restore();
              // Legs
              ctx.strokeStyle = '#cc3322'; ctx.lineWidth = 3 * s;
              for (let leg = -2; leg <= 2; leg++) {
                if (leg === 0) continue;
                ctx.beginPath(); ctx.moveTo(leg * 7 * s, -10 * s); ctx.lineTo(leg * 11 * s, 2 * s); ctx.stroke();
              }
              break;
            }

            case 'seal': {
              ctx.beginPath(); ctx.ellipse(0, -18 * s, 22 * s, 14 * s, .15, 0, Math.PI * 2); outlineFill('#7090a0');
              ctx.beginPath(); ctx.ellipse(18 * s, -14 * s, 10 * s, 7 * s, -.2, 0, Math.PI * 2); outlineFill('#7090a0');
              // Head
              ctx.beginPath(); ctx.ellipse(-14 * s, -28 * s, 13 * s, 12 * s, 0, 0, Math.PI * 2); outlineFill('#8898a8');
              // Big round eyes
              ctx.beginPath(); ctx.arc(-18 * s, -30 * s, 6 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.beginPath(); ctx.arc(-10 * s, -30 * s, 6 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(-18 * s, -30 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(-10 * s, -30 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(-17 * s, -32 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(-9 * s, -32 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();
              // Nose
              ctx.fillStyle = '#cc8899'; ctx.beginPath(); ctx.arc(-6 * s, -26 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
              // Whiskers
              ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.2 * s;
              ctx.beginPath(); ctx.moveTo(-6 * s, -26 * s); ctx.lineTo(6 * s, -24 * s); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(-6 * s, -26 * s); ctx.lineTo(6 * s, -28 * s); ctx.stroke();
              // Flipper WAVING
              ctx.save(); ctx.translate(-14 * s, -20 * s); ctx.rotate(waveArm * 0.7);
              ctx.beginPath(); ctx.ellipse(-12 * s, 0, 12 * s, 5 * s, -.4, 0, Math.PI * 2); outlineFill('#7090a0');
              ctx.restore();
              break;
            }

            case 'pelican': {
              ctx.beginPath(); ctx.ellipse(0, -22 * s, 16 * s, 12 * s, 0, 0, Math.PI * 2); outlineFill('#f8f4ee');
              ctx.beginPath(); ctx.ellipse(14 * s, -32 * s, 9 * s, 10 * s, 0, 0, Math.PI * 2); outlineFill('#f8f4ee');
              // Long beak
              ctx.fillStyle = '#ddaa20'; ctx.beginPath(); ctx.moveTo(20 * s, -30 * s); ctx.lineTo(40 * s, -28 * s); ctx.lineTo(38 * s, -24 * s); ctx.lineTo(20 * s, -26 * s); ctx.closePath(); ctx.fill();
              ctx.fillStyle = '#ffcc44'; ctx.beginPath(); ctx.ellipse(30 * s, -26 * s, 8 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill();
              // Eye
              ctx.beginPath(); ctx.arc(16 * s, -34 * s, 5 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = '#223300'; ctx.beginPath(); ctx.arc(16 * s, -34 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(17 * s, -35 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
              // Wing
              ctx.beginPath(); ctx.moveTo(-14 * s, -22 * s); ctx.lineTo(-30 * s, -10 * s); ctx.lineTo(-22 * s, 0); outlineFill('#e0dcd8');
              break;
            }

            case 'alien_creature': {
              // Green glowing body
              ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 12 * s;
              ctx.beginPath(); ctx.ellipse(0, -30 * s, 15 * s, 22 * s, 0, 0, Math.PI * 2); outlineFill('#22dd66');
              ctx.shadowBlur = 0;
              // Big head
              ctx.beginPath(); ctx.ellipse(0, -58 * s, 16 * s, 16 * s, 0, 0, Math.PI * 2); outlineFill('#22dd66');
              // Huge alien eyes
              ctx.beginPath(); ctx.arc(-7 * s, -60 * s, 7 * s, 0, Math.PI * 2); outlineFill('#001100');
              ctx.beginPath(); ctx.arc(7 * s, -60 * s, 7 * s, 0, Math.PI * 2); outlineFill('#001100');
              ctx.fillStyle = '#ffff00'; ctx.beginPath(); ctx.arc(-7 * s, -60 * s, 5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#ffff00'; ctx.beginPath(); ctx.arc(7 * s, -60 * s, 5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(-7 * s, -60 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(7 * s, -60 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(-5.5 * s, -62 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(8.5 * s, -62 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();
              // Antennae
              ctx.strokeStyle = '#22dd66'; ctx.lineWidth = 2.5 * s;
              ctx.beginPath(); ctx.moveTo(-6 * s, -73 * s); ctx.lineTo(-10 * s, -84 * s); ctx.stroke();
              ctx.fillStyle = '#ff44ff'; ctx.beginPath(); ctx.arc(-10 * s, -84 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
              ctx.beginPath(); ctx.moveTo(6 * s, -73 * s); ctx.lineTo(10 * s, -84 * s); ctx.stroke();
              ctx.fillStyle = '#ff44ff'; ctx.beginPath(); ctx.arc(10 * s, -84 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
              // Slit mouth
              ctx.strokeStyle = '#001100'; ctx.lineWidth = 2 * s;
              ctx.beginPath(); ctx.arc(0, -52 * s, 5 * s, 0.2, Math.PI - 0.2); ctx.stroke();
              // WAVING 3-fingered hand
              ctx.save(); ctx.translate(14 * s, -42 * s); ctx.rotate(waveArm);
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(20 * s, -14 * s); ctx.lineTo(14 * s, -8 * s); outlineFill('#22dd66');
              ctx.restore();
              break;
            }

            case 'goat': {
              ctx.beginPath(); ctx.ellipse(0, -22 * s, 16 * s, 14 * s, 0, 0, Math.PI * 2); outlineFill('#d8d0b8');
              ctx.beginPath(); ctx.ellipse(10 * s, -38 * s, 10 * s, 12 * s, 0, 0, Math.PI * 2); outlineFill('#d8d0b8');
              // Curved horns
              ctx.strokeStyle = '#8a7a60'; ctx.lineWidth = 3.5 * s; ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(6 * s, -48 * s); ctx.quadraticCurveTo(2 * s, -60 * s, 10 * s, -58 * s); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(14 * s, -48 * s); ctx.quadraticCurveTo(18 * s, -60 * s, 10 * s, -58 * s); ctx.stroke();
              // Eyes
              ctx.beginPath(); ctx.arc(7 * s, -40 * s, 4 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.beginPath(); ctx.arc(14 * s, -40 * s, 4 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = '#886600'; ctx.beginPath(); ctx.arc(7 * s, -40 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#886600'; ctx.beginPath(); ctx.arc(14 * s, -40 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(7 * s, -40 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(14 * s, -40 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
              // Beard
              ctx.fillStyle = '#e8e0c8'; ctx.beginPath(); ctx.ellipse(10 * s, -30 * s, 4 * s, 6 * s, 0, 0, Math.PI * 2); ctx.fill();
              break;
            }

            case 'snake': {
              const snakeWiggle = Math.sin(now / 300 + el.phase);
              ctx.strokeStyle = '#2a7a2a'; ctx.lineWidth = 14 * s; ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(-30 * s, -10 * s);
              ctx.quadraticCurveTo(-10 * s, -10 * s + 18 * s * snakeWiggle, 10 * s, -10 * s);
              ctx.quadraticCurveTo(22 * s, -10 * s - 14 * s * snakeWiggle, 30 * s, -10 * s);
              ctx.stroke();
              ctx.strokeStyle = '#3a9a3a'; ctx.lineWidth = 8 * s;
              ctx.beginPath();
              ctx.moveTo(-30 * s, -10 * s);
              ctx.quadraticCurveTo(-10 * s, -10 * s + 18 * s * snakeWiggle, 10 * s, -10 * s);
              ctx.quadraticCurveTo(22 * s, -10 * s - 14 * s * snakeWiggle, 30 * s, -10 * s);
              ctx.stroke();
              // Head
              ctx.beginPath(); ctx.arc(32 * s, -10 * s, 9 * s, 0, Math.PI * 2); outlineFill('#2a7a2a');
              ctx.fillStyle = '#ffff00'; ctx.beginPath(); ctx.arc(35 * s, -13 * s, 3.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(35 * s, -13 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
              // Forked tongue
              ctx.strokeStyle = '#ff2222'; ctx.lineWidth = 2 * s;
              ctx.beginPath(); ctx.moveTo(40 * s, -9 * s); ctx.lineTo(48 * s, -7 * s); ctx.moveTo(40 * s, -9 * s); ctx.lineTo(48 * s, -11 * s); ctx.stroke();
              // Pattern
              ctx.fillStyle = '#1a5a1a';
              for (let p2 = -2; p2 <= 2; p2++) {
                ctx.beginPath(); ctx.ellipse(p2 * 14 * s, -10 * s + Math.sin((p2 + el.phase) * 2) * snakeWiggle * 16 * s, 4 * s, 5 * s, 0, 0, Math.PI * 2); ctx.fill();
              }
              break;
            }

            case 'lizard': {
              ctx.beginPath(); ctx.ellipse(0, -16 * s, 16 * s, 8 * s, 0, 0, Math.PI * 2); outlineFill('#7a9a20');
              // Spiny back
              ctx.fillStyle = '#5a7a10';
              for (let sp = -3; sp <= 3; sp++) {
                ctx.beginPath(); ctx.moveTo(sp * 5 * s, -22 * s); ctx.lineTo(sp * 5 * s - 3 * s, -30 * s); ctx.lineTo(sp * 5 * s + 3 * s, -30 * s); ctx.fill();
              }
              // Head
              ctx.beginPath(); ctx.ellipse(16 * s, -18 * s, 10 * s, 7 * s, 0, 0, Math.PI * 2); outlineFill('#7a9a20');
              ctx.beginPath(); ctx.arc(22 * s, -20 * s, 4 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.arc(22 * s, -20 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(22 * s, -20 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
              // Tongue
              ctx.strokeStyle = '#ff2222'; ctx.lineWidth = 2 * s;
              ctx.beginPath(); ctx.moveTo(25 * s, -17 * s); ctx.lineTo(32 * s, -15 * s); ctx.moveTo(25 * s, -17 * s); ctx.lineTo(32 * s, -19 * s); ctx.stroke();
              // Tail
              ctx.strokeStyle = '#7a9a20'; ctx.lineWidth = 7 * s; ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(-14 * s, -14 * s); ctx.quadraticCurveTo(-28 * s, -8 * s, -24 * s, 8 * s); ctx.stroke();
              break;
            }

            case 'rooster': {
              ctx.beginPath(); ctx.ellipse(0, -28 * s, 14 * s, 20 * s, 0, 0, Math.PI * 2); outlineFill('#b84820');
              // Tail feathers
              ctx.fillStyle = '#ff6600';
              ctx.beginPath(); ctx.moveTo(-12 * s, -34 * s); ctx.quadraticCurveTo(-28 * s, -40 * s, -26 * s, -24 * s); ctx.fill();
              ctx.fillStyle = '#ffcc00';
              ctx.beginPath(); ctx.moveTo(-10 * s, -36 * s); ctx.quadraticCurveTo(-30 * s, -38 * s, -26 * s, -22 * s); ctx.fill();
              ctx.fillStyle = '#ff3300';
              ctx.beginPath(); ctx.moveTo(-14 * s, -32 * s); ctx.quadraticCurveTo(-26 * s, -44 * s, -22 * s, -26 * s); ctx.fill();
              // Head
              ctx.beginPath(); ctx.ellipse(8 * s, -48 * s, 11 * s, 11 * s, 0, 0, Math.PI * 2); outlineFill('#b84820');
              // Red comb
              ctx.fillStyle = '#ff2200';
              ctx.beginPath(); ctx.moveTo(4 * s, -58 * s); ctx.lineTo(0, -68 * s); ctx.lineTo(6 * s, -62 * s); ctx.lineTo(10 * s, -70 * s); ctx.lineTo(14 * s, -60 * s); ctx.lineTo(16 * s, -58 * s); ctx.fill();
              // Wattle
              ctx.fillStyle = '#ff3322'; ctx.beginPath(); ctx.ellipse(6 * s, -42 * s, 4 * s, 6 * s, 0, 0, Math.PI * 2); ctx.fill();
              // Beak
              ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.moveTo(16 * s, -47 * s); ctx.lineTo(24 * s, -46 * s); ctx.lineTo(16 * s, -44 * s); ctx.fill();
              // Eye
              ctx.beginPath(); ctx.arc(12 * s, -50 * s, 4 * s, 0, Math.PI * 2); outlineFill('white');
              ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.arc(12 * s, -50 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(12 * s, -50 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
              break;
            }

            case 'robot_bird': {
              ctx.shadowColor = '#00ccff'; ctx.shadowBlur = 10 * s;
              ctx.beginPath(); ctx.ellipse(0, -22 * s, 13 * s, 9 * s, 0, 0, Math.PI * 2); outlineFill('#8898b0');
              ctx.beginPath(); ctx.ellipse(12 * s, -28 * s, 11 * s, 10 * s, 0, 0, Math.PI * 2); outlineFill('#8898b0');
              ctx.shadowBlur = 0;
              // Visor
              ctx.fillStyle = '#00ccff'; ctx.beginPath(); ctx.rect(8 * s, -34 * s, 8 * s, 5 * s); ctx.fill();
              // Beak
              ctx.fillStyle = '#aabbcc'; ctx.beginPath(); ctx.moveTo(21 * s, -28 * s); ctx.lineTo(30 * s, -26 * s); ctx.lineTo(21 * s, -24 * s); ctx.fill();
              // Panel lines
              ctx.strokeStyle = '#6688aa'; ctx.lineWidth = 1.5 * s;
              ctx.beginPath(); ctx.moveTo(-5 * s, -18 * s); ctx.lineTo(-5 * s, -26 * s); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(0, -18 * s); ctx.lineTo(0, -26 * s); ctx.stroke();
              // Mechanical wings
              const mWing = Math.sin(now / 200 + el.phase) * 0.5;
              ctx.save(); ctx.translate(-10 * s, -22 * s); ctx.rotate(-mWing);
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-26 * s, -6 * s); ctx.lineTo(-22 * s, 6 * s); outlineFill('#7090a8');
              ctx.fillStyle = '#003355'; ctx.fillRect(-18 * s, -4 * s, 6 * s, 3 * s); ctx.fillRect(-12 * s, -4 * s, 6 * s, 3 * s);
              ctx.restore();
              break;
            }

            default: { break; }
          }

          // ── Universal legs / feet for ALL ground animals ──────────────────
          if (!el.isSkyAnimal) {
            const legWalk = Math.sin(now / 280 + el.phase);
            const legColor = el.subtype === 'cat' || el.subtype === 'stray_cat' || el.subtype === 'space_cat' ? '#778899'
              : el.subtype === 'dog' ? '#c8943a'
                : el.subtype === 'rabbit' ? '#e8ddd0'
                  : el.subtype === 'bear' ? '#5a3010'
                    : el.subtype === 'deer' ? '#c87840'
                      : el.subtype === 'cow' ? '#f5f5f0'
                        : el.subtype === 'horse' ? '#9B5c30'
                          : el.subtype === 'fox' ? '#e06820'
                            : el.subtype === 'squirrel' ? '#c87030'
                              : el.subtype === 'goat' ? '#d8d0b8'
                                : el.subtype === 'rooster' ? '#b84820'
                                  : el.subtype === 'alien_creature' ? '#22dd66'
                                    : el.subtype === 'rat' ? '#8a8070'
                                      : el.subtype === 'owl' ? '#9a7a30'
                                        : '#888877';

            const legW = 5 * s;
            const footW = 8 * s;
            const footH = 4 * s;

            if (['cat', 'stray_cat', 'space_cat', 'rabbit', 'squirrel', 'rat', 'alien_creature'].includes(el.subtype)) {
              // Bipedal — 2 legs
              const leftLeg = legWalk * 8 * s;
              const rightLeg = -legWalk * 8 * s;
              // Left leg
              ctx.fillStyle = legColor;
              ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5 * s;
              ctx.beginPath(); ctx.roundRect(-8 * s, -14 * s + leftLeg, legW, 14 * s, 2 * s); ctx.fill(); ctx.stroke();
              // Left foot
              ctx.beginPath(); ctx.ellipse(-6 * s, leftLeg, footW, footH, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
              // Right leg
              ctx.beginPath(); ctx.roundRect(3 * s, -14 * s + rightLeg, legW, 14 * s, 2 * s); ctx.fill(); ctx.stroke();
              // Right foot
              ctx.beginPath(); ctx.ellipse(5 * s, rightLeg, footW, footH, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

            } else if (['bear', 'cow', 'goat', 'deer'].includes(el.subtype)) {
              // Quadruped — 4 thick legs with hooves
              const fl = legWalk * 6 * s;
              const rl = -legWalk * 6 * s;
              const legH = 18 * s;
              const hoof = el.subtype === 'cow' || el.subtype === 'goat' || el.subtype === 'deer' ? '#333' : '#4a2800';
              // Front-left
              ctx.fillStyle = legColor; ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5 * s;
              ctx.beginPath(); ctx.roundRect(-16 * s, -legH + fl, legW + 2 * s, legH, 2 * s); ctx.fill(); ctx.stroke();
              ctx.fillStyle = hoof; ctx.beginPath(); ctx.ellipse(-14 * s, fl, 7 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill();
              // Front-right
              ctx.fillStyle = legColor;
              ctx.beginPath(); ctx.roundRect(-6 * s, -legH + rl, legW + 2 * s, legH, 2 * s); ctx.fill(); ctx.stroke();
              ctx.fillStyle = hoof; ctx.beginPath(); ctx.ellipse(-4 * s, rl, 7 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill();
              // Back-left
              ctx.fillStyle = legColor;
              ctx.beginPath(); ctx.roundRect(4 * s, -legH + rl, legW + 2 * s, legH, 2 * s); ctx.fill(); ctx.stroke();
              ctx.fillStyle = hoof; ctx.beginPath(); ctx.ellipse(6 * s, rl, 7 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill();
              // Back-right
              ctx.fillStyle = legColor;
              ctx.beginPath(); ctx.roundRect(14 * s, -legH + fl, legW + 2 * s, legH, 2 * s); ctx.fill(); ctx.stroke();
              ctx.fillStyle = hoof; ctx.beginPath(); ctx.ellipse(16 * s, fl, 7 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill();

            } else if (['horse'].includes(el.subtype)) {
              // Horse — 4 long legs
              const fl = legWalk * 8 * s;
              const rl = -legWalk * 8 * s;
              const legH = 26 * s;
              ctx.fillStyle = '#9B5c30'; ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5 * s;
              for (const [ox, phase] of [[-18 * s, fl], [-8 * s, rl], [6 * s, rl], [16 * s, fl]] as [number, number][]) {
                ctx.beginPath(); ctx.roundRect(ox, -legH + phase, 6 * s, legH, 2 * s); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#333'; ctx.beginPath(); ctx.ellipse(ox + 3 * s, phase, 7 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#9B5c30';
              }

            } else if (['dog', 'fox'].includes(el.subtype)) {
              // Dog/fox — 4 legs
              const fl = legWalk * 6 * s;
              const rl = -legWalk * 6 * s;
              const legH = 16 * s;
              const fc = el.subtype === 'fox' ? '#e06820' : '#c8943a';
              ctx.fillStyle = fc; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.5 * s;
              for (const [ox, phase] of [[-12 * s, fl], [-4 * s, rl], [4 * s, rl], [12 * s, fl]] as [number, number][]) {
                ctx.beginPath(); ctx.roundRect(ox, -legH + phase, 5 * s, legH, 2 * s); ctx.fill(); ctx.stroke();
                // Paw
                ctx.beginPath(); ctx.ellipse(ox + 2.5 * s, phase, 6 * s, 3.5 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                // Toes
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                for (let t = -2; t <= 2; t += 2) {
                  ctx.beginPath(); ctx.arc(ox + 2.5 * s + t * 2 * s, phase - 1 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();
                }
                ctx.fillStyle = fc;
              }

            } else if (el.subtype === 'rooster') {
              // Rooster — 2 scaly legs + claws
              const fl = legWalk * 7 * s;
              const rl = -legWalk * 7 * s;
              ctx.fillStyle = '#ddaa20'; ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5 * s;
              // Left leg (thigh + shin)
              ctx.beginPath(); ctx.roundRect(-8 * s, -16 * s + fl, 5 * s, 10 * s, 1 * s); ctx.fill(); ctx.stroke();
              ctx.beginPath(); ctx.roundRect(-9 * s, -6 * s + fl, 4 * s, 8 * s, 1 * s); ctx.fill(); ctx.stroke();
              // Left claws
              ctx.strokeStyle = '#997700'; ctx.lineWidth = 1.5 * s; ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(-8 * s, fl); ctx.lineTo(-16 * s, fl + 4 * s); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(-8 * s, fl); ctx.lineTo(-8 * s, fl + 6 * s); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(-8 * s, fl); ctx.lineTo(-2 * s, fl + 4 * s); ctx.stroke();
              // Right leg
              ctx.fillStyle = '#ddaa20'; ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5 * s;
              ctx.beginPath(); ctx.roundRect(3 * s, -16 * s + rl, 5 * s, 10 * s, 1 * s); ctx.fill(); ctx.stroke();
              ctx.beginPath(); ctx.roundRect(2 * s, -6 * s + rl, 4 * s, 8 * s, 1 * s); ctx.fill(); ctx.stroke();
              ctx.strokeStyle = '#997700'; ctx.lineWidth = 1.5 * s; ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(3 * s, rl); ctx.lineTo(-5 * s, rl + 4 * s); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(3 * s, rl); ctx.lineTo(3 * s, rl + 6 * s); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(3 * s, rl); ctx.lineTo(10 * s, rl + 4 * s); ctx.stroke();

            } else if (['owl'].includes(el.subtype)) {
              // Owl — perch talons
              ctx.fillStyle = '#cc8800'; ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5 * s;
              ctx.beginPath(); ctx.roundRect(-5 * s, -8 * s, 4 * s, 8 * s, 1 * s); ctx.fill(); ctx.stroke();
              ctx.beginPath(); ctx.roundRect(1 * s, -8 * s, 4 * s, 8 * s, 1 * s); ctx.fill(); ctx.stroke();
              ctx.strokeStyle = '#996600'; ctx.lineWidth = 2 * s; ctx.lineCap = 'round';
              for (const [bx, by] of [[-8 * s, 2 * s], [-5 * s, 4 * s], [-2 * s, 2 * s], [1 * s, 2 * s], [4 * s, 4 * s], [7 * s, 2 * s]] as [number, number][]) {
                ctx.beginPath(); ctx.moveTo(bx > 0 ? 3 * s : -3 * s, by - 2 * s); ctx.lineTo(bx, by); ctx.stroke();
              }

            } else if (['snake', 'lizard', 'crab', 'seal'].includes(el.subtype)) {
              // No legs needed — they crawl/slither/flipper
            } else {
              // Generic 2 legs fallback
              const fl = legWalk * 6 * s;
              const rl = -legWalk * 6 * s;
              ctx.fillStyle = legColor; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.5 * s;
              ctx.beginPath(); ctx.roundRect(-7 * s, -14 * s + fl, 5 * s, 14 * s, 2 * s); ctx.fill(); ctx.stroke();
              ctx.beginPath(); ctx.ellipse(-5 * s, fl, 7 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
              ctx.beginPath(); ctx.roundRect(2 * s, -14 * s + rl, 5 * s, 14 * s, 2 * s); ctx.fill(); ctx.stroke();
              ctx.beginPath(); ctx.ellipse(4 * s, rl, 7 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            }
          }
        }
        ctx.restore();
      });
      ctx.globalAlpha = 1;
      ctx.restore();

      // Platforms - Brown with grass on top (Tom & Jerry style)
      game.platforms.forEach(p => {
        if (p.x - game.scrollX + p.width > 0 && p.x - game.scrollX < canvas.width) {
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(p.x - game.scrollX, p.y, p.width, p.height);

          // Add texture
          ctx.fillStyle = '#A0522D';
          for (let i = 0; i < p.width; i += 20) {
            ctx.fillRect(p.x - game.scrollX + i, p.y, 10, p.height);
          }

          // Draw grass on top of ground platforms
          if (p.isGround) {
            ctx.fillStyle = '#228B22';
            ctx.fillRect(p.x - game.scrollX, p.y - 5, p.width, 5);
          }
        }
      });

      // Draw holes (black gaps)
      game.holes.forEach(hole => {
        if (hole.x - game.scrollX + hole.width > 0 && hole.x - game.scrollX < canvas.width) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(hole.x - game.scrollX, hole.y, hole.width, 100);

          // Add depth effect
          ctx.fillStyle = '#333333';
          ctx.fillRect(hole.x - game.scrollX, hole.y + 20, hole.width, 80);
        }
      });

      // Hazards
      game.hazards.forEach((h: any) => {
        const hx = h.x - game.scrollX;
        if (hx + h.width < -40 || hx > canvas.width + 40) return;

        if (h.type === 'spike') {
          ctx.fillStyle = '#cc2b2b';
          const spikeCount = 4;
          const spikeW = h.width / spikeCount;
          for (let i = 0; i < spikeCount; i++) {
            ctx.beginPath();
            ctx.moveTo(hx + i * spikeW, h.y + h.height);
            ctx.lineTo(hx + i * spikeW + spikeW / 2, h.y);
            ctx.lineTo(hx + (i + 1) * spikeW, h.y + h.height);
            ctx.closePath();
            ctx.fill();
          }
        } else if (h.type === 'movingSaw') {
          const cx = hx + h.width / 2;
          const cy = h.y + h.height / 2;
          const radius = h.width / 2;
          ctx.fillStyle = '#9aa3b2';
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#d7dde8';
          ctx.lineWidth = 2;
          for (let i = 0; i < 8; i++) {
            const angle = i * (Math.PI / 4) + h.phase;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * radius * 0.6, cy + Math.sin(angle) * radius * 0.6);
            ctx.lineTo(cx + Math.cos(angle) * (radius + 8), cy + Math.sin(angle) * (radius + 8));
            ctx.stroke();
          }
        } else if (h.type === 'laser') {
          ctx.fillStyle = '#2b2b2b';
          ctx.fillRect(hx - 3, h.y, 16, 8);
          if (h.active) {
            ctx.fillStyle = 'rgba(255, 40, 40, 0.7)';
            ctx.fillRect(hx, h.y + 8, h.width, h.height - 8);
            ctx.strokeStyle = '#ff8c8c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(hx + h.width / 2, h.y + 8);
            ctx.lineTo(hx + h.width / 2, h.y + h.height);
            ctx.stroke();
          }
        }
      });

      // Bullets - Bright Red color
      ctx.globalCompositeOperation = 'source-over';
      game.bullets.forEach((b: any) => {
        const bx = b.x - game.scrollX;

        // Outer red glow
        ctx.fillStyle = '#FF0000';
        ctx.beginPath(); ctx.arc(bx, b.y, b.radius * 2, 0, Math.PI * 2); ctx.fill();

        // Inner bright red
        ctx.fillStyle = '#FF4444';
        ctx.beginPath(); ctx.arc(bx, b.y, b.radius * 1.3, 0, Math.PI * 2); ctx.fill();

        // White center
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(bx, b.y, b.radius * 0.5, 0, Math.PI * 2); ctx.fill();
      });

      // Enemies - Detailed enemies (Tom & Jerry style)
      game.enemies.forEach(e => {
        if (e.x < -500) return;

        const ex = e.x - game.scrollX;
        const ey = e.y;
        const ew = e.width;
        const eh = e.height;

        if (e.type === 0) { // Dog enemy
          // Draw dog body
          ctx.fillStyle = '#8B0000';
          ctx.beginPath();
          ctx.ellipse(ex + ew / 2, ey + eh / 2, ew / 2, eh / 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Draw head
          ctx.beginPath();
          ctx.arc(ex + ew / 2, ey + eh / 4, ew / 3, 0, Math.PI * 2);
          ctx.fill();

          // Draw ears
          ctx.fillStyle = '#333';
          ctx.beginPath();
          ctx.ellipse(ex + ew / 2 - 10, ey + eh / 4 - 10, 8, 12, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(ex + ew / 2 + 10, ey + eh / 4 - 10, 8, 12, 0, 0, Math.PI * 2);
          ctx.fill();

          // Draw eyes
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(ex + ew / 2 - 8, ey + eh / 4, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ex + ew / 2 + 8, ey + eh / 4, 5, 0, Math.PI * 2);
          ctx.fill();

          // Draw pupils
          ctx.fillStyle = 'black';
          ctx.beginPath();
          ctx.arc(ex + ew / 2 - 8, ey + eh / 4, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ex + ew / 2 + 8, ey + eh / 4, 2, 0, Math.PI * 2);
          ctx.fill();

          // Draw nose
          ctx.fillStyle = 'black';
          ctx.beginPath();
          ctx.arc(ex + ew / 2, ey + eh / 4 + 10, 4, 0, Math.PI * 2);
          ctx.fill();

          // Draw mouth
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ex + ew / 2, ey + eh / 4 + 12, 3, 0, Math.PI);
          ctx.stroke();
        } else if (e.type === 1) { // Mouse enemy
          // Draw gray mouse enemy
          ctx.fillStyle = '#A9A9A9';
          ctx.beginPath();
          ctx.ellipse(ex + ew / 2, ey + eh / 2, ew / 2, eh / 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Draw ears
          ctx.fillStyle = '#666';
          ctx.beginPath();
          ctx.arc(ex + ew / 2 - 8, ey + eh / 4, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ex + ew / 2 + 8, ey + eh / 4, 6, 0, Math.PI * 2);
          ctx.fill();

          // Draw eyes (angry)
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.arc(ex + ew / 2 - 6, ey + eh / 3, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ex + ew / 2 + 6, ey + eh / 3, 3, 0, Math.PI * 2);
          ctx.fill();

          // Draw teeth
          ctx.fillStyle = 'white';
          ctx.fillRect(ex + ew / 2 - 4, ey + eh / 2, 3, 6);
          ctx.fillRect(ex + ew / 2 + 1, ey + eh / 2, 3, 6);
        } else { // Spike ball
          const radius = ew / 2;

          // Draw spike ball
          ctx.fillStyle = '#444';
          ctx.beginPath();
          ctx.arc(ex + radius, ey + radius, radius, 0, Math.PI * 2);
          ctx.fill();

          // Draw spikes
          ctx.fillStyle = '#FF0000';
          const spikeCount = 8;
          for (let i = 0; i < spikeCount; i++) {
            const angle = (i * 2 * Math.PI) / spikeCount;
            const spikeLength = radius * 0.8;

            ctx.beginPath();
            ctx.moveTo(
              ex + radius + Math.cos(angle) * radius,
              ey + radius + Math.sin(angle) * radius
            );
            ctx.lineTo(
              ex + radius + Math.cos(angle) * (radius + spikeLength),
              ey + radius + Math.sin(angle) * (radius + spikeLength)
            );
            ctx.lineTo(
              ex + radius + Math.cos(angle + Math.PI / spikeCount) * radius * 0.7,
              ey + radius + Math.sin(angle + Math.PI / spikeCount) * radius * 0.7
            );
            ctx.closePath();
            ctx.fill();
          }
        }
      });

      if (game.boss && game.boss.hp > 0) {
        const bx = game.boss.x - game.scrollX;
        const by = game.boss.y;
        const bw = game.boss.width;
        const bh = game.boss.height;

        ctx.fillStyle = '#6f1d1b';
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 14);
        ctx.fill();

        ctx.fillStyle = '#fca311';
        ctx.beginPath();
        ctx.arc(bx + 25, by + 25, 8, 0, Math.PI * 2);
        ctx.arc(bx + bw - 25, by + 25, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(bx + 25, by + 25, 3, 0, Math.PI * 2);
        ctx.arc(bx + bw - 25, by + 25, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(bx, by - 16, bw, 8);
        ctx.fillStyle = '#ff4d4d';
        ctx.fillRect(bx, by - 16, (bw * game.boss.hp) / game.boss.maxHp, 8);
      }

      // Draw Fishes (Yellow/Gold Fish) - Now drawn after background and platforms
      game.fishes.forEach((f: any) => {
        if (f.collected) return;

        const fxs = f.x - game.scrollX;

        // Skip if off screen
        if (fxs < -50 || fxs > canvas.width + 50) return;

        const fx = fxs;
        const fy = f.y;
        const fw = f.width;
        const fh = f.height;

        // Draw fish body (orange/gold like Jerry)
        ctx.fillStyle = '#FF8C00';

        // Fish body - ellipse shape
        ctx.beginPath();
        ctx.ellipse(fx + fw / 2, fy + fh / 2, fw / 2, fh / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fish tail
        ctx.beginPath();
        ctx.moveTo(fx, fy + fh / 2);
        ctx.lineTo(fx - fh / 2, fy);
        ctx.lineTo(fx - fh / 2, fy + fh);
        ctx.closePath();
        ctx.fill();

        // Fish eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(fx + fw * 0.7, fy + fh * 0.4, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(fx + fw * 0.7, fy + fh * 0.4, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Fish fin on top
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(fx + fw / 2, fy);
        ctx.lineTo(fx + fw / 2 + 5, fy - 5);
        ctx.lineTo(fx + fw / 2 - 5, fy);
        ctx.closePath();
        ctx.fill();
      });

      // Draw coins - count collected
      let collectedCountInFrame = 0;
      game.fishes.forEach((f: any) => {
        if (f.collected) collectedCountInFrame++;
      });

      // Goal Logic - check if player can complete level
      const allFishesCollected = collectedCountInFrame === game.fishes.length;
      const bossCleared = !game.boss || game.boss.hp <= 0;
      const overlapsGoal = game.player.x < game.jerry.x + game.jerry.width && game.player.x + game.player.width > game.jerry.x && game.player.y < game.jerry.y + game.jerry.height && game.player.y + game.player.height > game.jerry.y;
      if (overlapsGoal) {
        if (allFishesCollected && bossCleared) {
          game.running = false;
          const perfectLevel = game.lives === lives;
          const perfectBonus = perfectLevel ? 500 : 0;
          game.levelsCompletedInRun = (game.levelsCompletedInRun || 0) + 1;
          persistRunSummary(game, perfectLevel);
          setTotalScore(game.score + 1000 + perfectBonus);
          setShowLevelComplete(true);
        }
        else { game.showFishWarning = true; }
      } else { game.showFishWarning = false; }

      // Goal - Detailed Jerry the mouse (Tom & Jerry style)
      const jx = game.jerry.x - game.scrollX; const jy = game.jerry.y; const jw = game.jerry.width; const jh = game.jerry.height;

      // Draw Jerry as a proper mouse
      ctx.fillStyle = '#FF8C00';

      // Draw body
      ctx.beginPath();
      ctx.ellipse(jx + jw / 2, jy + jh / 2, jw / 2, jh / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw head
      ctx.beginPath();
      ctx.arc(jx + jw / 2, jy + jh / 4, jw / 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw ears
      ctx.fillStyle = '#FF4500';
      ctx.beginPath();
      ctx.arc(jx + jw / 2 - 8, jy + jh / 4 - 5, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(jx + jw / 2 + 8, jy + jh / 4 - 5, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw eyes
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(jx + jw / 2 - 5, jy + jh / 4, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(jx + jw / 2 + 5, jy + jh / 4, 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw pupils
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(jx + jw / 2 - 5, jy + jh / 4, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(jx + jw / 2 + 5, jy + jh / 4, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw nose
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(jx + jw / 2, jy + jh / 4 + 8, 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw tail
      ctx.strokeStyle = '#FF8C00';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(jx + jw, jy + jh - 5);
      ctx.bezierCurveTo(
        jx + jw + 20, jy + jh,
        jx + jw + 15, jy + jh + 10,
        jx + jw + 5, jy + jh
      );
      ctx.stroke();

      // Glow effect
      ctx.shadowBlur = 15; ctx.shadowColor = '#FF8C00'; ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.strokeRect(jx - 5, jy - 5, jw + 10, jh + 10); ctx.shadowBlur = 0;
      if (game.showFishWarning) {
        ctx.fillStyle = '#ee2b2b'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
        const needBoss = game.boss && game.boss.hp > 0;
        ctx.fillText(needBoss ? 'BESEGRA BOSS + SAMLA FISK!' : 'SAMLA ALLA FISKAR FÖRST!', jx + jw / 2, jy - 15);
      }

      // Player
      const px = game.player.x - game.scrollX; const py = game.player.y; const pw = game.player.width; const ph = game.player.height;
      ctx.save();
      if (game.player.invincible) ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() / 50);

      // Kattens svans - Ritas bakom kroppen för att se ut som en riktig svans
      const isMovingRight = game.player.facing === 1;
      const tailX = isMovingRight ? px + 5 : px + pw - 5;
      const tailDir = isMovingRight ? -1 : 1;
      const tailWiggle = Math.sin(Date.now() / 150) * 5;

      ctx.strokeStyle = game.player.color; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, py + ph * 0.7);
      ctx.bezierCurveTo(
        tailX + tailDir * 25, py + ph * 0.8 + tailWiggle,
        tailX + tailDir * 35, py + ph * 0.4 - tailWiggle,
        tailX + tailDir * 15, py + ph * 0.2
      );
      ctx.stroke();

      // Kropp (Ellipse)
      ctx.fillStyle = game.player.color; ctx.beginPath(); ctx.ellipse(px + pw / 2, py + ph / 2, pw / 2, ph / 2, 0, 0, Math.PI * 2); ctx.fill();

      // Öron (Trianglar)
      ctx.fillStyle = game.player.accent; ctx.beginPath(); ctx.moveTo(px + 5, py + 15); ctx.lineTo(px - 5, py - 10); ctx.lineTo(px + 20, py + 5); ctx.fill();
      ctx.beginPath(); ctx.moveTo(px + pw - 5, py + ph * 0.15); ctx.lineTo(px + pw + 5, py - 10); ctx.lineTo(px + pw - 20, py + 5); ctx.fill();

      // Ögon med blink-logik
      if (game.player.isBlinking) {
        ctx.strokeStyle = game.player.accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px + pw * 0.25, py + ph * 0.4); ctx.lineTo(px + pw * 0.45, py + ph * 0.4); ctx.moveTo(px + pw * 0.55, py + ph * 0.4); ctx.lineTo(px + pw * 0.75, py + ph * 0.4); ctx.stroke();
      } else {
        ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(px + pw * 0.35, py + ph * 0.4, 8, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(px + pw * 0.65, py + ph * 0.4, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'green'; ctx.beginPath(); ctx.arc(px + pw * 0.35, py + ph * 0.4, 4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(px + pw * 0.65, py + ph * 0.4, 4, 0, Math.PI * 2); ctx.fill();
      }

      // Nos
      ctx.fillStyle = 'pink'; ctx.beginPath(); ctx.arc(px + pw * 0.5, py + ph * 0.55, 6, 0, Math.PI * 2); ctx.fill();

      // Morrhår
      ctx.fillStyle = 'black';
      const wl1 = [{ x: px + pw * 0.25, y: py + ph * 0.58 - 1 }, { x: px + pw * 0.25, y: py + ph * 0.58 + 1 }, { x: px - 10, y: py + ph * 0.55 + 3 }, { x: px - 10, y: py + ph * 0.55 - 3 }];
      const wl2 = [{ x: px + pw * 0.25, y: py + ph * 0.66 - 1 }, { x: px + pw * 0.25, y: py + ph * 0.66 + 1 }, { x: px - 10, y: py + ph * 0.66 + 3 }, { x: px - 10, y: py + ph * 0.66 - 3 }];
      const wl3 = [{ x: px + pw * 0.25, y: py + ph * 0.74 - 1 }, { x: px + pw * 0.25, y: py + ph * 0.74 + 1 }, { x: px - 10, y: py + ph * 0.77 + 3 }, { x: px - 10, y: py + ph * 0.77 - 3 }];
      const wr1 = [{ x: px + pw * 0.75, y: py + ph * 0.58 - 1 }, { x: px + pw * 0.75, y: py + ph * 0.58 + 1 }, { x: px + pw + 10, y: py + ph * 0.55 + 3 }, { x: px + pw + 10, y: py + ph * 0.55 - 3 }];
      const wr2 = [{ x: px + pw * 0.75, y: py + ph * 0.66 - 1 }, { x: px + pw * 0.75, y: py + ph * 0.66 + 1 }, { x: px + pw + 10, y: py + ph * 0.66 + 3 }, { x: px + pw + 10, y: py + ph * 0.66 - 3 }];
      const wr3 = [{ x: px + pw * 0.75, y: py + ph * 0.74 - 1 }, { x: px + pw * 0.75, y: py + ph * 0.74 + 1 }, { x: px + pw + 10, y: py + ph * 0.77 + 3 }, { x: px + pw + 10, y: py + ph * 0.77 - 3 }];
      const drawPolygon = (pts: any[]) => {
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.closePath(); ctx.fill();
      };
      drawPolygon(wl1); drawPolygon(wl2); drawPolygon(wl3); drawPolygon(wr1); drawPolygon(wr2); drawPolygon(wr3);

      // Mun
      ctx.strokeStyle = 'black'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px + pw * 0.5, py + ph * 0.55 + 6); ctx.lineTo(px + pw * 0.5, py + ph * 0.65); ctx.stroke(); ctx.beginPath(); ctx.arc(px + pw * 0.4, py + ph * 0.65, 5, 0, Math.PI); ctx.stroke(); ctx.beginPath(); ctx.arc(px + pw * 0.6, py + ph * 0.65, 5, 0, Math.PI); ctx.stroke();

      ctx.fillStyle = game.player.color; ctx.fillRect(px + 10, py + ph - 5, 12, 10); ctx.fillRect(px + pw - 22, py + ph - 5, 12, 10);
      ctx.restore();

      // Draw Particles
      ctx.globalCompositeOperation = 'lighter';
      game.particles.forEach((p: any) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x - game.scrollX, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';

      // Draw Floating Texts
      ctx.font = 'bold 24px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      game.floatingTexts.forEach((t: any) => {
        ctx.fillStyle = t.color;
        ctx.globalAlpha = t.life / 40;
        ctx.fillText(t.text, t.x - game.scrollX, t.y);
      });
      ctx.globalAlpha = 1;

      // Weather Particles Rendering
      if (game.weather === 'REGNIGT' || game.weather === 'STORMIGT') {
        ctx.strokeStyle = game.timeOfDay === 'DAY' ? 'rgba(100, 100, 150, 0.4)' : 'rgba(174, 194, 224, 0.5)';
        ctx.lineWidth = 1;
        game.weatherParticles.forEach((p: any) => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 2, p.y + p.length);
          ctx.stroke();
        });
      } else if (game.weather === 'SNÖIGT') {
        ctx.fillStyle = game.timeOfDay === 'DAY' ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.9)';
        game.weatherParticles.forEach((p: any) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (game.weather === 'DIMMIGT') {
        game.weatherParticles.forEach((p: any) => {
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          const fogColor = game.timeOfDay === 'DAY' ? '255, 255, 255' : '200, 200, 200';
          grd.addColorStop(0, `rgba(${fogColor}, ${p.opacity})`);
          grd.addColorStop(1, `rgba(${fogColor}, 0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });
        // Extra overlay for haze
        ctx.fillStyle = game.timeOfDay === 'DAY' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (game.miniEvent.active && game.miniEvent.type === 'BLACKOUT') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (applyScreenShake) ctx.restore();

      // Throttle React state updates to prevent infinite loops and improve performance
      if (Date.now() - game.lastStatUpdate > 250) {
        setStats({
          score: game.score, progress: Math.min(100, Math.floor((game.player.x / game.levelLength) * 100)),
          collectedCount: collectedCountInFrame, totalFish: game.fishes.length, ammo: game.ammo,
          weather: game.weather,
          intensity: game.intensity,
          timeOfDay: game.timeOfDay,
          combo: game.combo || 0,
          levelType: game.levelType,
          timer: game.levelTimer || 0,
          miniEvent: game.miniEvent?.active ? game.miniEvent.type : 'NONE',
        });
        setLives(game.lives);
        setTotalScore(game.score);
        setCombo(game.combo || 0);
        game.lastStatUpdate = Date.now();
      }
      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousedown', handleMouseDown);

      if (isTouchDevice) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }

      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel, onEnd, isTouchDevice]);

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-start gap-3 md:gap-6 py-2 md:py-4 animate-fade-in-up px-2 overflow-hidden max-h-screen ${isFullscreen ? 'fixed inset-0 z-[100] bg-background-dark' : ''}`}
      style={{ fontSize: `${progress.settings.textScale}em`, transform: `scale(${progress.settings.uiScale})`, transformOrigin: 'top center' }}
    >
      {/* GAME AREA */}
      <div ref={gameContainerRef} className="relative w-full max-w-6xl aspect-video flex items-center justify-center glass-card rounded-2xl md:rounded-[2.5rem] border-2 border-primary/20 overflow-hidden shadow-[0_0_100px_rgba(43,238,121,0.15)] transition-all duration-500 bg-black">

        {/* HUD - alltid synlig, overlay ovanpå canvas */}
        <div className="absolute top-0 left-0 right-0 z-20 flex flex-wrap justify-center items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm border-b border-primary/20 pointer-events-auto">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-primary-red text-base">favorite</span>
            <span className="text-xs font-black text-white">{lives}</span>
          </div>
          <div className="flex items-center gap-1 border-x border-white/10 px-2">
            <span className="material-symbols-outlined text-primary text-base">set_meal</span>
            <span className={`text-xs font-black transition-colors ${stats.collectedCount === stats.totalFish ? 'text-primary' : 'text-white'}`}>
              {stats.collectedCount}/{stats.totalFish}
            </span>
          </div>
          <div className="flex items-center gap-1 border-r border-white/10 pr-2">
            <span className="material-symbols-outlined text-[#ff8888] text-base">bolt</span>
            <span className={`text-xs font-black ${stats.ammo <= 0 ? 'text-primary-red animate-pulse' : 'text-white'}`}>
              {stats.ammo}
            </span>
          </div>
          <div className="flex items-center gap-1 border-r border-white/10 pr-2">
            <span className="material-symbols-outlined text-yellow-500 text-base">monetization_on</span>
            <span className="text-xs font-black text-yellow-400">{progress.coins}</span>
          </div>
          <div className="flex items-center gap-1 border-r border-white/10 pr-2">
            <span className={`material-symbols-outlined text-base ${stats.weather === 'SOLIGT' ? (stats.timeOfDay === 'DAY' ? 'text-orange-400' : 'text-yellow-400') : (stats.weather === 'REGNIGT' ? 'text-blue-400' : (stats.weather === 'SNÖIGT' ? 'text-white' : (stats.weather === 'DIMMIGT' ? 'text-gray-400' : 'text-purple-400')))}`}>
              {stats.weather === 'SOLIGT' ? (stats.timeOfDay === 'DAY' ? 'sunny' : 'nightlight') : (stats.weather === 'REGNIGT' ? 'rainy' : (stats.weather === 'SNÖIGT' ? 'ac_unit' : (stats.weather === 'DIMMIGT' ? 'foggy' : 'thunderstorm')))}
            </span>
          </div>
          <div className="flex items-center gap-1 border-r border-white/10 pr-2">
            <span className="text-[9px] font-bold text-primary/70 uppercase">Lv{currentLevel}</span>
            <span className="text-xs font-black text-white">{stats.progress}%</span>
          </div>
          <div className="flex items-center gap-1 border-r border-white/10 pr-2">
            <span className="text-[9px] text-white/50 uppercase">{stats.levelType}</span>
            <span className="text-xs font-black text-primary">x{combo}</span>
          </div>
          {stats.levelType === 'Speed Run' && (
            <div className="flex items-center gap-1 border-r border-white/10 pr-2">
              <span className="material-symbols-outlined text-orange-300 text-base">timer</span>
              <span className="text-xs font-black text-orange-300">{Math.ceil(stats.timer)}s</span>
            </div>
          )}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center gap-1 hover:scale-110 transition-transform"
          >
            <span className={`material-symbols-outlined text-base ${isMuted ? 'text-primary-red' : 'text-white/70'}`}>
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1 hover:scale-110 transition-transform"
          >
            <span className="material-symbols-outlined text-base text-white/70">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
        </div>

        {progress.settings.debugOverlay && (
          <div className="absolute top-8 left-0 right-0 z-20 text-[10px] text-white/70 bg-black/40 px-3 py-1 pointer-events-none">
            MODE {stats.levelType} | EVENT {stats.miniEvent} | COMBO x{combo} | WEATHER {stats.weather} | THEME {seasonTheme}
          </div>
        )}

        {/* Mobile Touch Controls Overlay */}
        {isTouchDevice && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
              <div className="bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20">
                <p className="text-white/80 text-xs font-medium">Vänster: Jump</p>
                <p className="text-white/80 text-xs font-medium">Höger: Shoota</p>
                <p className="text-white/80 text-xs font-medium">Svep: Rörelse</p>
              </div>
            </div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-full max-w-full max-h-full object-contain cursor-crosshair bg-[#102217]"
          style={{ filter: progress.settings.colorBlindMode ? 'contrast(1.15) saturate(0.85)' : 'none' }}
        />

        {showLevelComplete && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in-up z-50">
            <span className="material-symbols-outlined text-5xl md:text-8xl text-primary mb-2 md:mb-4">stars</span>
            <h2 className="text-white text-3xl md:text-5xl font-black mb-1 md:mb-2 uppercase tracking-tighter text-center leading-tight">Level {currentLevel} Klar!</h2>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full max-w-xs md:max-w-md">
              <button onClick={startNextLevel} className="bg-primary text-white px-8 md:px-12 py-4 rounded-full font-black text-lg md:text-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(43,238,121,0.3)] border-2 border-primary/80 w-full">NÄSTA NIVÅ ({currentLevel + 1})</button>
              <button onClick={() => onEnd(totalScore, gameRef.current?.totalCollectedInLevel ?? 0)} className="bg-white/20 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold hover:bg-white/30 transition-all text-sm md:text-base w-full border border-white/30">Avsluta</button>
            </div>
          </div>
        )}
      </div>

      {/* TOUCH CONTROLS - UNDER spelrutan */}
      {isTouchDevice && !showLevelComplete && (
        <div className="flex w-full max-w-4xl justify-between items-center px-4 py-2 mt-auto select-none pointer-events-auto">
          {/* Vänster sida: Styrning (Move vänster/höger) */}
          <div className="flex items-center gap-3">
            <button
              className="size-14 md:size-16 bg-[#16291e]/90 backdrop-blur-md rounded-2xl flex items-center justify-center border-b-4 border-black/60 shadow-xl active:translate-y-1 active:border-b-0 active:bg-primary/40 transition-all group"
              onTouchStart={(e) => { e.preventDefault(); setKeyState(65, true); }}
              onTouchEnd={(e) => { e.preventDefault(); setKeyState(65, false); }}
            >
              <span className="material-symbols-outlined text-3xl text-white group-active:text-primary">arrow_back</span>
            </button>
            <button
              className="size-14 md:size-16 bg-[#16291e]/90 backdrop-blur-md rounded-2xl flex items-center justify-center border-b-4 border-black/60 shadow-xl active:translate-y-1 active:border-b-0 active:bg-primary/40 transition-all group"
              onTouchStart={(e) => { e.preventDefault(); setKeyState(68, true); }}
              onTouchEnd={(e) => { e.preventDefault(); setKeyState(68, false); }}
            >
              <span className="material-symbols-outlined text-3xl text-white group-active:text-primary">arrow_forward</span>
            </button>
          </div>

          {/* Höger sida: Handlingar (Jump/Shoot) */}
          <div className="flex items-center gap-3">
            {/* Hopp-knapp */}
            <button
              className="size-16 md:size-20 bg-primary/20 backdrop-blur-md rounded-full flex flex-col items-center justify-center border-4 border-primary/40 border-b-8 border-b-black/40 text-white shadow-2xl active:translate-y-2 active:border-b-0 active:bg-primary/60 transition-all group"
              onTouchStart={(e) => { e.preventDefault(); triggerJump(); }}
            >
              <span className="material-symbols-outlined text-3xl group-active:scale-110 transition-transform">arrow_upward</span>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-90">HOPPA</span>
            </button>

            {/* Shoot-knapp */}
            <button
              className="size-16 md:size-20 bg-primary-red/30 backdrop-blur-md rounded-full flex flex-col items-center justify-center border-4 border-primary-red/50 border-b-8 border-b-black/40 text-white shadow-2xl active:translate-y-2 active:border-b-0 active:bg-primary-red/60 transition-all group"
              onTouchStart={(e) => { e.preventDefault(); fireBullet(); }}
            >
              <span className="material-symbols-outlined text-3xl group-active:scale-110 transition-transform">bolt</span>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-90">SKJUT</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/** SHOP VIEW **/
export const ShopView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { progress, buyUpgrade, equipSkin } = useProgress();
  const [message, setMessage] = useState('');

  const handleBuy = (type: 'maxAmmo' | 'jumpPower' | 'speed', cost: number) => {
    if (buyUpgrade(type, cost)) {
      setMessage('Uppgradering köpt!');
    } else {
      setMessage('Inte tillräckligt med mynt!');
    }
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up py-8 md:py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
          <span className="material-symbols-outlined text-primary text-sm">store</span>
          <span className="text-primary text-[10px] font-bold uppercase tracking-widest">Shop</span>
        </div>
        <h1 className="text-white text-3xl md:text-4xl font-black uppercase tracking-tight">Uppgraderingar</h1>
        <p className="mt-2 text-white/70 text-sm">Förbättra din katt med neon-teknologi</p>
      </div>

      {/* Coins Display */}
      <div className="glass-card rounded-2xl p-4 mb-6 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-yellow-500">monetization_on</span>
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest">Dina Mynt</p>
              <p className="text-white text-xl font-black">{progress.coins}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs uppercase tracking-widest">Level</p>
            <p className="text-white text-xl font-black">{progress.level}</p>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-xl bg-primary/20 border border-primary/30 text-center text-white font-medium">
          {message}
        </div>
      )}

      {/* Skill Tree Light */}
      <div className="glass-card rounded-2xl p-5 mb-6 border border-primary/20 bg-primary/5">
        <h3 className="text-white font-bold uppercase mb-2">Skill Tree Light</h3>
        <p className="text-white/60 text-xs mb-3">Passiva perks låses upp automatiskt med din rank.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className={`rounded-lg p-3 border ${progress.level >= 5 ? 'border-primary/40 bg-primary/10 text-white' : 'border-white/10 text-white/50'}`}>Lv5: Agile Paws (+speed)</div>
          <div className={`rounded-lg p-3 border ${progress.level >= 10 ? 'border-primary/40 bg-primary/10 text-white' : 'border-white/10 text-white/50'}`}>Lv10: Ammo Saver</div>
          <div className={`rounded-lg p-3 border ${progress.level >= 15 ? 'border-primary/40 bg-primary/10 text-white' : 'border-white/10 text-white/50'}`}>Lv15: Guard Instinct</div>
        </div>
      </div>

      {/* Upgrades */}
      <div className="space-y-4">
        {/* Max Ammo */}
        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-400">battery_full</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold uppercase">Max Ammo</h3>
              <p className="text-white/50 text-xs">Fler skott innan omladdning</p>
              <p className="text-white/80 text-sm mt-1">Nuvarande: {progress.upgrades.maxAmmo.toFixed(0)}</p>
              <button
                onClick={() => handleBuy('maxAmmo', 500)}
                disabled={progress.coins < 500}
                className="mt-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/40 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-yellow-400 font-bold text-sm"
              >
                Buy (500 coins)
              </button>
            </div>
          </div>
        </div>

        {/* Jump Power */}
        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-400">rocket</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold uppercase">Jump Power</h3>
              <p className="text-white/50 text-xs">Högre hopp</p>
              <p className="text-white/80 text-sm mt-1">Nuvarande: {progress.upgrades.jumpPower.toFixed(1)}</p>
              <button
                onClick={() => handleBuy('jumpPower', 750)}
                disabled={progress.coins < 750}
                className="mt-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/40 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-yellow-400 font-bold text-sm"
              >
                Buy (750 coins)
              </button>
            </div>
          </div>
        </div>

        {/* Speed */}
        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-400">speed</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold uppercase">Speed</h3>
              <p className="text-white/50 text-xs">Snabbare rörelse</p>
              <p className="text-white/80 text-sm mt-1">Nuvarande: {progress.upgrades.speed.toFixed(1)}</p>
              <button
                onClick={() => handleBuy('speed', 1000)}
                disabled={progress.coins < 1000}
                className="mt-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/40 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-yellow-400 font-bold text-sm"
              >
                Buy (1000 coins)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Skins */}
      <div className="glass-card rounded-2xl p-5 mt-6 border border-white/10">
        <h3 className="text-white font-bold uppercase mb-3">Skins</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(SKINS).map(([id, skin]) => {
            const unlocked = progress.unlockedSkins.includes(id);
            const equipped = progress.equippedSkin === id;
            return (
              <div key={id} className={`rounded-xl p-3 border ${equipped ? 'border-primary/50 bg-primary/10' : 'border-white/10 bg-black/20'}`}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-white font-bold text-sm">{skin.name}</p>
                    <p className="text-white/50 text-xs">{unlocked ? 'Unlocked' : skin.unlockHint}</p>
                  </div>
                  <div className="w-7 h-7 rounded-full border border-white/20" style={{ backgroundColor: skin.color }} />
                </div>
                <button
                  onClick={() => unlocked && equipSkin(id)}
                  disabled={!unlocked || equipped}
                  className="mt-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white disabled:opacity-40"
                >
                  {equipped ? 'Aktiv' : 'Utrusta'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onBack}
        className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back
      </button>
    </div>
  );
};

/** QUESTS VIEW **/
export const QuestsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { progress, claimQuestReward } = useProgress();

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up py-8 md:py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
          <span className="material-symbols-outlined text-primary text-sm">task_alt</span>
          <span className="text-primary text-[10px] font-bold uppercase tracking-widest">Quests</span>
        </div>
        <h1 className="text-white text-3xl md:text-4xl font-black uppercase tracking-tight">Daily + Weekly</h1>
        <p className="mt-2 text-white/70 text-sm">Gratis challenges som roterar automatiskt</p>
      </div>

      {/* XP Progress */}
      <div className="glass-card rounded-2xl p-4 mb-6 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">military_tech</span>
            <span className="text-white font-bold">Level {progress.level}</span>
          </div>
          <span className="text-white/60 text-sm">{progress.xp} XP</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${(progress.xp % 1000) / 10}%` }}
          />
        </div>
        <p className="text-white/40 text-xs mt-2">{1000 - (progress.xp % 1000)} XP till nästa nivå</p>
      </div>

      {/* Daily Quests */}
      <h3 className="text-white/80 font-bold uppercase tracking-wider text-xs mb-3">Daily</h3>
      <div className="space-y-4">
        {progress.dailyQuests.map((quest) => (
          <div
            key={quest.id}
            className={`glass-card rounded-2xl p-5 border ${quest.completed ? 'border-primary/30 bg-primary/5' : 'border-white/10'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${quest.completed ? 'bg-primary/20' : 'bg-white/5'}`}>
                <span className={`material-symbols-outlined ${quest.completed ? 'text-primary' : 'text-white/40'}`}>
                  {quest.completed ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold">{quest.description}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
                    />
                  </div>
                  <span className="text-white/60 text-xs">{quest.current}/{quest.target}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-yellow-500 font-black">+{quest.reward} 🪙</p>
                {quest.completed && !quest.claimed && (
                  <button
                    onClick={() => claimQuestReward(quest.id)}
                    className="mt-1 px-3 py-1 rounded-lg bg-primary text-[#112218] text-xs font-bold"
                  >
                    Hämta
                  </button>
                )}
                {quest.claimed && (
                  <span className="mt-1 px-3 py-1 rounded-lg bg-white/10 text-white/40 text-xs font-bold">Hämtad</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Quests */}
      <h3 className="text-white/80 font-bold uppercase tracking-wider text-xs mt-6 mb-3">Weekly</h3>
      <div className="space-y-4">
        {progress.weeklyQuests.map((quest) => (
          <div
            key={quest.id}
            className={`glass-card rounded-2xl p-5 border ${quest.completed ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-white/10'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${quest.completed ? 'bg-yellow-500/20' : 'bg-white/5'}`}>
                <span className={`material-symbols-outlined ${quest.completed ? 'text-yellow-400' : 'text-white/40'}`}>
                  {quest.completed ? 'workspace_premium' : 'pending'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold">{quest.description}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }} />
                  </div>
                  <span className="text-white/60 text-xs">{quest.current}/{quest.target}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-yellow-500 font-black">+{quest.reward} 🪙</p>
                {quest.completed && !quest.claimed && (
                  <button onClick={() => claimQuestReward(quest.id)} className="mt-1 px-3 py-1 rounded-lg bg-yellow-400 text-[#1a1f2a] text-xs font-black">
                    Hämta
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements + skins */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 mt-6">
        <h3 className="text-white font-bold uppercase tracking-wider text-xs mb-3">Achievements & skins</h3>
        <p className="text-white/60 text-xs mb-3">Låsta upp: {progress.achievements.length} achievements, {progress.unlockedSkins.length} skins</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(SKINS).map(([id, skin]) => (
            <div key={id} className={`rounded-xl border p-3 ${progress.unlockedSkins.includes(id) ? 'border-primary/30 bg-primary/5' : 'border-white/10 bg-black/20'}`}>
              <p className="text-white font-bold text-sm">{skin.name}</p>
              <p className="text-white/60 text-xs">{progress.unlockedSkins.includes(id) ? 'Unlocked' : skin.unlockHint}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onBack}
        className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back
      </button>
    </div>
  );
};
