
export enum AppView {
  START = 'START',
  SETTINGS = 'SETTINGS',
  HOW_TO_PLAY = 'HOW_TO_PLAY',
  LEADERBOARD = 'LEADERBOARD',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  SHOP = 'SHOP',
  QUESTS = 'QUESTS'
}

export interface ScoreEntry {
  rank: number;
  name: string;
  score: number;
  level: string;
  date: string;
  avatar: string;
  isUser?: boolean;
}

export interface GameState {
  score: number;
  lives: number;
  level: string;
  timeRemaining: number;
}

export interface PlayerProgress {
  coins: number;
  totalCoinsEarned: number;
  xp: number;
  level: number;
  unlockedSkins: string[];
  equippedSkin: string;
  upgrades: {
    maxAmmo: number;
    jumpPower: number;
    speed: number;
  };
  achievements: string[];
  dailyQuests: {
    id: string;
    description: string;
    target: number;
    current: number;
    reward: number;
    completed: boolean;
    claimed: boolean;
  }[];
  weeklyQuests: {
    id: string;
    description: string;
    target: number;
    current: number;
    reward: number;
    completed: boolean;
    claimed: boolean;
  }[];
  dailySeed: string;
  weeklySeed: string;
  settings: {
    uiScale: number;
    textScale: number;
    colorBlindMode: boolean;
    reduceMotion: boolean;
    debugOverlay: boolean;
    haptics: boolean;
  };
  stats: {
    totalEnemiesDefeated: number;
    totalFishCollected: number;
    totalDeaths: number;
    perfectLevels: number;
    bestCombo: number;
    bossesDefeated: number;
  };
}
