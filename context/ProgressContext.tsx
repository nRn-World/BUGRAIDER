
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlayerProgress } from '../types';

const STORAGE_KEY = 'shadow_paw_progress_v2';
const STORAGE_BACKUP_KEY = 'shadow_paw_progress_backup_v2';

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const getTodaySeed = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const getWeekSeed = () => {
  const d = new Date();
  const dayNum = (d.getDay() + 6) % 7;
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - dayNum);
  return `${weekStart.getFullYear()}-${weekStart.getMonth() + 1}-${weekStart.getDate()}`;
};

const createDailyQuests = (seedText: string) => {
  const seed = Array.from(seedText).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return [
    { id: 'd1', description: 'Samla fiskar idag', target: 30 + Math.floor(seededRandom(seed + 1) * 40), current: 0, reward: 100, completed: false, claimed: false },
    { id: 'd2', description: 'Besegra fiender idag', target: 8 + Math.floor(seededRandom(seed + 2) * 12), current: 0, reward: 140, completed: false, claimed: false },
    { id: 'd3', description: 'Klara nivåer idag', target: 2 + Math.floor(seededRandom(seed + 3) * 3), current: 0, reward: 180, completed: false, claimed: false },
  ];
};

const createWeeklyQuests = (seedText: string) => {
  const seed = Array.from(seedText).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return [
    { id: 'w1', description: 'Vecko-jakt: samla fisk', target: 220 + Math.floor(seededRandom(seed + 7) * 180), current: 0, reward: 500, completed: false, claimed: false },
    { id: 'w2', description: 'Vecko-jakt: besegra fiender', target: 70 + Math.floor(seededRandom(seed + 11) * 60), current: 0, reward: 650, completed: false, claimed: false },
  ];
};

const defaultProgress: PlayerProgress = {
  coins: 0,
  totalCoinsEarned: 0,
  xp: 0,
  level: 1,
  unlockedSkins: ['default'],
  equippedSkin: 'default',
  upgrades: {
    maxAmmo: 5,
    jumpPower: 15,
    speed: 5,
  },
  achievements: [],
  dailyQuests: createDailyQuests(getTodaySeed()),
  weeklyQuests: createWeeklyQuests(getWeekSeed()),
  dailySeed: getTodaySeed(),
  weeklySeed: getWeekSeed(),
  settings: {
    uiScale: 1,
    textScale: 1,
    colorBlindMode: false,
    reduceMotion: false,
    debugOverlay: false,
    haptics: true,
  },
  stats: {
    totalEnemiesDefeated: 0,
    totalFishCollected: 0,
    totalDeaths: 0,
    perfectLevels: 0,
    bestCombo: 0,
    bossesDefeated: 0,
  },
};

interface ProgressContextType {
  progress: PlayerProgress;
  addCoins: (amount: number) => void;
  addXP: (amount: number) => void;
  completeQuest: (questId: string) => void;
  updateQuestProgress: (questId: string, increment: number) => void;
  buyUpgrade: (type: 'maxAmmo' | 'jumpPower' | 'speed', cost: number) => boolean;
  equipSkin: (skinId: string) => void;
  resetDailyQuests: () => void;
  claimQuestReward: (questId: string) => void;
  updateSettings: (updates: Partial<PlayerProgress['settings']>) => void;
  updateStats: (updates: Partial<PlayerProgress['stats']>) => void;
  unlockAchievement: (achievementId: string) => void;
  unlockSkin: (skinId: string) => void;
  applyRunResults: (results: {
    fishesCollected: number;
    enemiesDefeated: number;
    levelsCompleted: number;
    perfectLevel: boolean;
    bestCombo: number;
    bossDefeated: boolean;
    deaths: number;
  }) => void;
  exportProgressCode: () => string;
  importProgressCode: (encoded: string) => boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<PlayerProgress>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('shadow_paw_progress_v1');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...defaultProgress,
            ...parsed,
            upgrades: { ...defaultProgress.upgrades, ...(parsed.upgrades || {}) },
            settings: { ...defaultProgress.settings, ...(parsed.settings || {}) },
            stats: { ...defaultProgress.stats, ...(parsed.stats || {}) },
            dailyQuests: parsed.dailyQuests || defaultProgress.dailyQuests,
            weeklyQuests: parsed.weeklyQuests || defaultProgress.weeklyQuests,
            dailySeed: parsed.dailySeed || defaultProgress.dailySeed,
            weeklySeed: parsed.weeklySeed || defaultProgress.weeklySeed,
          };
        } catch {
          return defaultProgress;
        }
      }
    }
    return defaultProgress;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_BACKUP_KEY, localStorage.getItem(STORAGE_KEY) || '');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    const today = getTodaySeed();
    const week = getWeekSeed();
    setProgress((p) => {
      const mustResetDaily = p.dailySeed !== today;
      const mustResetWeekly = p.weeklySeed !== week;
      return {
        ...p,
        dailySeed: today,
        weeklySeed: week,
        dailyQuests: mustResetDaily ? createDailyQuests(today) : (p.dailyQuests.some((q) => q.id.startsWith('d')) ? p.dailyQuests : createDailyQuests(today)),
        weeklyQuests: mustResetWeekly ? createWeeklyQuests(week) : (p.weeklyQuests.some((q) => q.id.startsWith('w')) ? p.weeklyQuests : createWeeklyQuests(week)),
      };
    });
  }, []);

  const addCoins = (amount: number) => {
    setProgress(p => ({
      ...p,
      coins: p.coins + amount,
      totalCoinsEarned: p.totalCoinsEarned + amount,
    }));
  };

  const addXP = (amount: number) => {
    setProgress(p => {
      const newXP = p.xp + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;
      return {
        ...p,
        xp: newXP,
        level: newLevel > p.level ? newLevel : p.level,
      };
    });
  };

  const completeQuest = (questId: string) => {
    setProgress(p => ({
      ...p,
      dailyQuests: p.dailyQuests.map(q =>
        q.id === questId && !q.completed ? { ...q, completed: true } : q
      ),
    }));
  };

  const updateQuestProgress = (questId: string, increment: number) => {
    setProgress(p => ({
      ...p,
      dailyQuests: p.dailyQuests.map(q => {
        if (q.id !== questId || q.completed) return q;
        const newCurrent = q.current + increment;
        if (newCurrent >= q.target) {
          return { ...q, current: q.target, completed: true };
        }
        return { ...q, current: newCurrent };
      }),
    }));
  };

  const buyUpgrade = (type: 'maxAmmo' | 'jumpPower' | 'speed', cost: number): boolean => {
    if (progress.coins < cost) return false;
    
    setProgress(p => ({
      ...p,
      coins: p.coins - cost,
      upgrades: {
        ...p.upgrades,
        [type]: p.upgrades[type] + (type === 'maxAmmo' ? 1 : 0.5),
      },
    }));
    return true;
  };

  const equipSkin = (skinId: string) => {
    if (progress.unlockedSkins.includes(skinId)) {
      setProgress(p => ({ ...p, equippedSkin: skinId }));
    }
  };

  const resetDailyQuests = () => {
    setProgress(p => ({
      ...p,
      dailyQuests: createDailyQuests(getTodaySeed()),
      weeklyQuests: createWeeklyQuests(getWeekSeed()),
      dailySeed: getTodaySeed(),
      weeklySeed: getWeekSeed(),
    }));
  };

  const claimQuestReward = (questId: string) => {
    setProgress(p => {
      const quest = [...p.dailyQuests, ...p.weeklyQuests].find(q => q.id === questId);
      if (!quest || !quest.completed || quest.claimed) return p;
      return {
        ...p,
        coins: p.coins + quest.reward,
        totalCoinsEarned: p.totalCoinsEarned + quest.reward,
        dailyQuests: p.dailyQuests.map(q =>
          q.id === questId ? { ...q, claimed: true } : q
        ),
        weeklyQuests: p.weeklyQuests.map(q =>
          q.id === questId ? { ...q, claimed: true } : q
        ),
      };
    });
  };

  const updateSettings = (updates: Partial<PlayerProgress['settings']>) => {
    setProgress((p) => ({ ...p, settings: { ...p.settings, ...updates } }));
  };

  const updateStats = (updates: Partial<PlayerProgress['stats']>) => {
    setProgress((p) => ({ ...p, stats: { ...p.stats, ...updates } }));
  };

  const unlockAchievement = (achievementId: string) => {
    setProgress((p) => {
      if (p.achievements.includes(achievementId)) return p;
      return { ...p, achievements: [...p.achievements, achievementId] };
    });
  };

  const unlockSkin = (skinId: string) => {
    setProgress((p) => {
      if (p.unlockedSkins.includes(skinId)) return p;
      return { ...p, unlockedSkins: [...p.unlockedSkins, skinId] };
    });
  };

  const applyRunResults = (results: {
    fishesCollected: number;
    enemiesDefeated: number;
    levelsCompleted: number;
    perfectLevel: boolean;
    bestCombo: number;
    bossDefeated: boolean;
    deaths: number;
  }) => {
    setProgress((p) => {
      const daily = p.dailyQuests.map((q) => {
        if (q.id === 'd1') {
          const current = Math.min(q.target, q.current + results.fishesCollected);
          return { ...q, current, completed: current >= q.target };
        }
        if (q.id === 'd2') {
          const current = Math.min(q.target, q.current + results.enemiesDefeated);
          return { ...q, current, completed: current >= q.target };
        }
        if (q.id === 'd3') {
          const current = Math.min(q.target, q.current + results.levelsCompleted);
          return { ...q, current, completed: current >= q.target };
        }
        return q;
      });

      const weekly = p.weeklyQuests.map((q) => {
        if (q.id === 'w1') {
          const current = Math.min(q.target, q.current + results.fishesCollected);
          return { ...q, current, completed: current >= q.target };
        }
        if (q.id === 'w2') {
          const current = Math.min(q.target, q.current + results.enemiesDefeated);
          return { ...q, current, completed: current >= q.target };
        }
        return q;
      });

      return {
        ...p,
        dailyQuests: daily,
        weeklyQuests: weekly,
        stats: {
          ...p.stats,
          totalFishCollected: p.stats.totalFishCollected + results.fishesCollected,
          totalEnemiesDefeated: p.stats.totalEnemiesDefeated + results.enemiesDefeated,
          totalDeaths: p.stats.totalDeaths + results.deaths,
          perfectLevels: p.stats.perfectLevels + (results.perfectLevel ? 1 : 0),
          bestCombo: Math.max(p.stats.bestCombo, results.bestCombo),
          bossesDefeated: p.stats.bossesDefeated + (results.bossDefeated ? 1 : 0),
        },
      };
    });
  };

  const exportProgressCode = () => {
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(progress))));
    } catch {
      return '';
    }
  };

  const importProgressCode = (encoded: string) => {
    try {
      const parsed = JSON.parse(decodeURIComponent(escape(atob(encoded.trim()))));
      setProgress({
        ...defaultProgress,
        ...parsed,
        upgrades: { ...defaultProgress.upgrades, ...(parsed.upgrades || {}) },
        settings: { ...defaultProgress.settings, ...(parsed.settings || {}) },
        stats: { ...defaultProgress.stats, ...(parsed.stats || {}) },
        dailySeed: parsed.dailySeed || defaultProgress.dailySeed,
        weeklySeed: parsed.weeklySeed || defaultProgress.weeklySeed,
      });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <ProgressContext.Provider value={{
      progress,
      addCoins,
      addXP,
      completeQuest,
      updateQuestProgress,
      buyUpgrade,
      equipSkin,
      resetDailyQuests,
      claimQuestReward,
      updateSettings,
      updateStats,
      unlockAchievement,
      unlockSkin,
      applyRunResults,
      exportProgressCode,
      importProgressCode,
    }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within ProgressProvider');
  return context;
};
