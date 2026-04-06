
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import { StartMenuView, SettingsView, HowToPlayView, LeaderboardView, GameOverView, ShopView, QuestsView, PlayingView } from './components/Views';
import { AppView } from './types';
import { ProgressProvider } from './context/ProgressContext';

const MENU_VIEWS = [AppView.START, AppView.SETTINGS, AppView.HOW_TO_PLAY, AppView.LEADERBOARD, AppView.SHOP, AppView.QUESTS, AppView.GAME_OVER];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.START);
  const [lastScore, setLastScore] = useState(0);
  const [lastFishesCollected, setLastFishesCollected] = useState(0);
  const menuMusicRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const shouldPlayMusic = MENU_VIEWS.includes(currentView);
    
    if (shouldPlayMusic && !menuMusicRef.current) {
      const audio = new Audio('Sounds/Effects/meny.mp3');
      audio.loop = true;
      audio.volume = 0;
      audio.play().catch(() => {});
      let vol = 0;
      const fadeIn = setInterval(() => {
        vol = Math.min(0.4, vol + 0.02);
        audio.volume = isMuted ? 0 : vol;
        if (vol >= 0.4) clearInterval(fadeIn);
      }, 80);
      menuMusicRef.current = audio;
    } else if (!shouldPlayMusic && menuMusicRef.current) {
      const a = menuMusicRef.current;
      let v = a.volume;
      const fadeOut = setInterval(() => {
        v = Math.max(0, v - 0.05);
        a.volume = v;
        if (v <= 0) { a.pause(); a.src = ''; clearInterval(fadeOut); }
      }, 50);
      menuMusicRef.current = null;
    } else if (menuMusicRef.current) {
      menuMusicRef.current.volume = isMuted ? 0 : 0.4;
    }
  }, [currentView, isMuted]);

  useEffect(() => {
    const isPlaying = currentView === AppView.PLAYING;
    document.body.style.overflowY = isPlaying ? 'hidden' : 'auto';
    document.body.style.overflowX = 'hidden';
    return () => {
      document.body.style.overflowY = 'auto';
      document.body.style.overflowX = 'hidden';
    };
  }, [currentView]);

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
  };

  const handleGameEnd = (score: number, fishesCollected: number) => {
    setLastScore(score);
    setLastFishesCollected(fishesCollected);
    setCurrentView(AppView.GAME_OVER);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.START:
        return <StartMenuView onNavigate={handleNavigate} />;
      case AppView.SETTINGS:
        return <SettingsView onBack={() => handleNavigate(AppView.START)} />;
      case AppView.HOW_TO_PLAY:
        return <HowToPlayView onBack={() => handleNavigate(AppView.START)} />;
      case AppView.LEADERBOARD:
        return <LeaderboardView onBack={() => handleNavigate(AppView.START)} onPlay={() => handleNavigate(AppView.PLAYING)} />;
      case AppView.PLAYING:
        return <PlayingView onEnd={handleGameEnd} />;
      case AppView.GAME_OVER:
        return <GameOverView score={lastScore} fishesCollected={lastFishesCollected} onRestart={() => handleNavigate(AppView.PLAYING)} onMenu={() => handleNavigate(AppView.START)} />;
      case AppView.SHOP:
        return <ShopView onBack={() => handleNavigate(AppView.START)} />;
      case AppView.QUESTS:
        return <QuestsView onBack={() => handleNavigate(AppView.START)} />;
      default:
        return <StartMenuView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-background-dark overflow-x-hidden">
      {/* Dynamic Background Image Overlay */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Natural Night Sky Base */}
        <div className="absolute inset-0 bg-[#020817] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020817] to-black"></div>
        
        {/* Neon City Haze & Stars */}
        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

        <img 
          alt="Night Cityscape" 
          className="w-full h-full object-cover opacity-30 pointer-events-none mix-blend-screen scale-110 animate-pulse-slow"
          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2000&auto=format&fit=crop"
        />

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020817]/80 via-transparent to-background-dark"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark/40 via-transparent to-background-dark/40"></div>
      </div>

      <Header currentView={currentView} onNavigate={handleNavigate} />

      <main className="relative z-10 flex-1 flex flex-col items-center px-4">
        {renderView()}
      </main>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.25; transform: scale(1.05); }
          50% { opacity: 0.35; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 20s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

const WrappedApp: React.FC = () => (
  <ProgressProvider>
    <App />
  </ProgressProvider>
);

export default WrappedApp;
