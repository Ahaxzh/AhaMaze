export type Difficulty = 'Kids' | 'Easy' | 'Medium' | 'Hard';
export type Theme = 'Light' | 'Dark' | 'Neon' | 'Matrix' | 'Valentine' | 'Retro' | 'Ocean' | 'Forest' | 'Cyberpunk' | 'Sunset' | 'Snow' | 'Space' | 'Desert' | 'Volcano' | 'Candy' | 'Steampunk' | 'Princess' | 'Starry';
export type Language = 'en' | 'zh';
export type GameMode = 'Classic' | 'Challenge';
export type ActivePage = 'Classic' | 'Challenge' | 'Leaderboard';
export type Position = { x: number; y: number };

export interface LeaderboardEntry {
  name: string;
  time: number; // in seconds
  moves: number;
  date: string;
  difficulty: Difficulty;
  mode: GameMode;
}
