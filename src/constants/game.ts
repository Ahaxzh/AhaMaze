import { Difficulty, Theme, Language } from '../types/game';

// --- Global Constants & Configs ---
export const MAZE_SIZES: Record<Difficulty, { width: number; height: number }> = {
  Kids: { width: 10, height: 10 },
  Easy: { width: 20, height: 20 },
  Medium: { width: 40, height: 40 },
  Hard: { width: 50, height: 50 }, // Challenge is capped here to prevent lag on wide screens
};

export const MAZE_DIFFICULTY_PARAMS: Record<Difficulty, { loopFactor: number, challengePadding?: number }> = {
  Kids: { loopFactor: 0.8 }, // Extremely heavily interconnected, very forgiving
  Easy: { loopFactor: 0.4 }, // Many alternative paths to avoid frustration
  Medium: { loopFactor: 0.1 }, // Few alternative paths, mostly traditional maze
  Hard: { loopFactor: 0.0, challengePadding: 2 },  // Strict traditional maze, only one path
};

export const THEME_CONFIGS: Record<Theme, {
  bg: string;
  wallColor: string;
  playerColor: string;
  endColor: string;
  trailColor: string;
  text: string;
  gradient: string;
  shadow?: string;
  glow?: boolean;
}> = {
  Light: {
    bg: 'bg-slate-50', wallColor: '#334155', playerColor: '#3b82f6', endColor: '#ef4444', trailColor: '#93c5fd',
    text: 'text-slate-800', gradient: 'from-blue-500 to-indigo-500', shadow: 'rgba(0,0,0,0.1)'
  },
  Dark: {
    bg: 'bg-slate-950', wallColor: '#94a3b8', playerColor: '#60a5fa', endColor: '#f87171', trailColor: '#1e3a8a',
    text: 'text-slate-200', gradient: 'from-slate-700 to-slate-600', shadow: 'rgba(255,255,255,0.05)'
  },
  Neon: {
    bg: 'bg-black', wallColor: '#c026d3', playerColor: '#2dd4bf', endColor: '#facc15', trailColor: '#0f766e',
    text: 'text-fuchsia-400', gradient: 'from-fuchsia-600 to-pink-600', shadow: '#c026d3', glow: true
  },
  Matrix: {
    bg: 'bg-zinc-950', wallColor: '#15803d', playerColor: '#22c55e', endColor: '#dc2626', trailColor: '#064e3b',
    text: 'text-green-500', gradient: 'from-green-600 to-emerald-800', shadow: '#15803d', glow: true
  },
  Valentine: {
    bg: 'bg-rose-50', wallColor: '#be123c', playerColor: '#fb7185', endColor: '#e11d48', trailColor: '#ffe4e6',
    text: 'text-rose-900', gradient: 'from-rose-400 to-pink-500', shadow: 'rgba(225,29,72,0.2)'
  },
  Retro: {
    bg: 'bg-amber-50', wallColor: '#b45309', playerColor: '#d97706', endColor: '#16a34a', trailColor: '#fef3c7',
    text: 'text-amber-900', gradient: 'from-amber-600 to-orange-700', shadow: 'rgba(180,83,9,0.3)'
  },
  Ocean: {
    bg: 'bg-cyan-50', wallColor: '#0369a1', playerColor: '#06b6d4', endColor: '#0ea5e9', trailColor: '#cffafe',
    text: 'text-cyan-900', gradient: 'from-cyan-500 to-blue-600', shadow: 'rgba(6,182,212,0.2)'
  },
  Forest: {
    bg: 'bg-emerald-50', wallColor: '#065f46', playerColor: '#10b981', endColor: '#84cc16', trailColor: '#d1fae5',
    text: 'text-emerald-900', gradient: 'from-emerald-600 to-green-700', shadow: 'rgba(16,185,129,0.2)'
  },
  Cyberpunk: {
    bg: 'bg-slate-900', wallColor: '#eab308', playerColor: '#06b6d4', endColor: '#ec4899', trailColor: '#4c1d95',
    text: 'text-yellow-400', gradient: 'from-yellow-400 to-pink-600', shadow: '#eab308', glow: true
  },
  Sunset: {
    bg: 'bg-orange-50', wallColor: '#ea580c', playerColor: '#f97316', endColor: '#eab308', trailColor: '#ffedd5',
    text: 'text-orange-900', gradient: 'from-orange-500 to-yellow-500', shadow: 'rgba(234,88,12,0.2)'
  },
  Snow: {
    bg: 'bg-slate-100', wallColor: '#94a3b8', playerColor: '#38bdf8', endColor: '#818cf8', trailColor: '#e0f2fe',
    text: 'text-sky-900', gradient: 'from-sky-300 to-blue-400', shadow: 'rgba(148,163,184,0.3)'
  },
  Space: {
    bg: 'bg-indigo-950', wallColor: '#6366f1', playerColor: '#a855f7', endColor: '#ec4899', trailColor: '#312e81',
    text: 'text-indigo-300', gradient: 'from-indigo-600 to-purple-800', shadow: '#6366f1', glow: true
  },
  Desert: {
    bg: 'bg-yellow-50', wallColor: '#ca8a04', playerColor: '#eab308', endColor: '#f97316', trailColor: '#fef9c3',
    text: 'text-yellow-900', gradient: 'from-yellow-600 to-orange-500', shadow: 'rgba(202,138,4,0.2)'
  },
  Volcano: {
    bg: 'bg-red-950', wallColor: '#ef4444', playerColor: '#f97316', endColor: '#fbbf24', trailColor: '#7f1d1d',
    text: 'text-red-400', gradient: 'from-red-600 to-orange-700', shadow: '#ef4444', glow: true
  },
  Candy: {
    bg: 'bg-pink-50', wallColor: '#ec4899', playerColor: '#d946ef', endColor: '#06b6d4', trailColor: '#fce7f3',
    text: 'text-pink-900', gradient: 'from-pink-400 to-fuchsia-500', shadow: 'rgba(236,72,153,0.2)'
  },
  Steampunk: {
    bg: 'bg-stone-900', wallColor: '#a8a29e', playerColor: '#d6d3d1', endColor: '#fb923c', trailColor: '#44403c',
    text: 'text-stone-300', gradient: 'from-stone-600 to-neutral-800', shadow: '#a8a29e', glow: true
  },
  Princess: { // Exclusively for Kids Mode (Light)
    bg: 'bg-pink-50', wallColor: '#f472b6', playerColor: '#fb7185', endColor: '#e879f9', trailColor: '#fce7f3',
    text: 'text-pink-600', gradient: 'from-pink-300 to-rose-300', shadow: 'rgba(244,114,182,0.3)'
  },
  Starry: { // Exclusively for Kids Mode (Dark)
    bg: 'bg-purple-950', wallColor: '#c084fc', playerColor: '#60a5fa', endColor: '#f472b6', trailColor: '#4c1d95',
    text: 'text-purple-300', gradient: 'from-purple-500 to-blue-500', shadow: '#c084fc', glow: true
  }
};

export const TEXTS: Record<Language, any> = {
  en: {
    title: 'AhaMaze', home: 'Home', challenge: 'Challenge', leaderboard: 'Leaderboard',
    moves: 'MOVES', level: 'LEVEL', timer: 'TIME', difficulty: 'DIFFICULTY',
    cleared: 'LEVEL CLEARED!', gaveUp: 'GAVE UP', optimal: 'Optimal', efficiency: 'Eff.',
    solutionSteps: 'Solution Steps',
    nextLevel: 'Next Level', replay: 'Replay', giveUp: 'Hint',
    download: 'Download', pathReplay: 'Path Replay', stopReplay: 'Stop Replay',
    kids: 'Kids', easy: 'Easy', medium: 'Medium', hard: 'Hard',
    sound: 'Sound', newMaze: 'New Maze',
    stats: 'STATS & MAP', controls: 'CONTROLS',
    classicMode: 'Classic', challengeMode: 'Challenge',
    fogWarning: 'Fog Descending In',
  },
  zh: {
    title: 'AhaMaze', home: '首页', challenge: '挑战', leaderboard: '排行榜',
    moves: '步数', level: '关卡', timer: '用时', difficulty: '难度',
    cleared: '通关成功', gaveUp: '已放弃', optimal: '最优步数', efficiency: '效率',
    solutionSteps: '正解步数',
    nextLevel: '下一关', replay: '重玩', giveUp: '提示',
    download: '下载', pathReplay: '路径回放', stopReplay: '停止',
    kids: '儿童', easy: '简单', medium: '中等', hard: '困难',
    sound: '音效', newMaze: '新迷宫',
    stats: '信息与地图', controls: '游戏操作',
    classicMode: '经典', challengeMode: '挑战',
    fogWarning: '迷雾降临倒计时',
  }
};

export const KIDS_EMOJIS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵',
  '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋',
  '🐌', '🐞', '🐜', '🦟', '🪲', '🪳', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗',
  '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
  '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥',
  '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐',
  '✨', '💎', '👑', '🌈', '⭐', '🌟', '💫', '☀️', '🌤', '⛅', '🌥', '☁️', '🌦', '🌧', '⛈',
];
