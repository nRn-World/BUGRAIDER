
import React from 'react';
import { AppView } from '../types';
import { useProgress } from '../context/ProgressContext';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const isActive = (view: AppView) => currentView === view;
  const { progress } = useProgress();

  return (
    <header className="relative z-50 w-full border-b border-white/5 bg-[#020817]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <button 
            onClick={() => onNavigate(AppView.START)}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-primary text-lg">pets</span>
            </div>
            <div className="hidden sm:block text-left">
              <h1 className="text-white font-black text-xs uppercase tracking-wider">Created 2026 by © nRn World</h1>
            </div>
          </button>

          {/* Coins Display - Mobile/Tablet */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 shrink-0 sm:hidden">
            <span className="material-symbols-outlined text-yellow-500 text-sm">monetization_on</span>
            <span className="text-yellow-500 font-black text-sm">{progress.coins}</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavButton 
              active={isActive(AppView.START)} 
              onClick={() => onNavigate(AppView.START)}
              icon="home"
              label="Home"
            />
            <NavButton 
              active={isActive(AppView.SHOP)} 
              onClick={() => onNavigate(AppView.SHOP)}
              icon="store"
              label="Shop"
            />
            <NavButton 
              active={isActive(AppView.QUESTS)} 
              onClick={() => onNavigate(AppView.QUESTS)}
              icon="task_alt"
              label="Quests"
            />
            <NavButton 
              active={isActive(AppView.LEADERBOARD)} 
              onClick={() => onNavigate(AppView.LEADERBOARD)}
              icon="emoji_events"
              label="Leaderboard"
            />
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Coins - Desktop */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <span className="material-symbols-outlined text-yellow-500 text-sm">monetization_on</span>
              <span className="text-yellow-500 font-black text-sm">{progress.coins}</span>
            </div>

            {/* Level Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20">
              <span className="material-symbols-outlined text-primary text-xs">military_tech</span>
              <span className="text-primary font-bold text-xs">{progress.level}</span>
            </div>

            {currentView !== AppView.START && (
              <button
                onClick={() => onNavigate(AppView.PLAYING)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-[#112218] font-black text-sm uppercase tracking-wider hover:bg-primary/90 transition-all shrink-0 shadow-[0_0_15px_rgba(43,238,121,0.5)] border-2 border-primary/50"
              >
                <span className="material-symbols-outlined text-base">play_arrow</span>
                <span className="hidden sm:inline">Play</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      active 
        ? 'bg-white/10 text-white' 
        : 'text-white/60 hover:text-white hover:bg-white/5'
    }`}
  >
    <span className={`material-symbols-outlined text-lg ${active ? 'text-primary' : ''}`}>{icon}</span>
    <span className="hidden lg:inline">{label}</span>
  </button>
);

export default Header;