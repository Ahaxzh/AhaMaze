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

export interface ThemeColors {
  bg: string;
  bgRaw: string;
  text: string;
  wallColor: string;
  cellBgColor: string;
  playerColor: string;
  trailColor: string;
  endColor: string;
  accent: string;
  gradient: string;
  startGlow: string;
  cornerDot: string;
  containerBg: string;
  containerBorder: string;
  swatch: string;
  textureSvg: string;
  ambience: 'dark' | 'light';
}

export const THEME_CONFIGS: Record<Theme, ThemeColors> = {
  Princess: {
    bg: 'bg-[#fff0f5]', bgRaw: '#fff0f5', text: 'text-pink-600',
    wallColor: '#fb7185', cellBgColor: 'rgba(255, 255, 255, 0.9)',
    playerColor: '#ff27a0', trailColor: '#fb7185', endColor: '#f43f5e',
    accent: 'text-rose-500', gradient: 'from-pink-400 via-rose-400 to-fuchsia-400',
    startGlow: 'rgba(251, 113, 133, 0.2)', cornerDot: 'transparent',
    containerBg: 'bg-white/90', containerBorder: 'border-pink-200/80',
    swatch: '#fb7185',
    textureSvg: `<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><g fill="rgba(251,113,133,0.12)"><circle cx="30" cy="30" r="2.5"/><circle cx="0" cy="0" r="1.5"/><circle cx="60" cy="60" r="1.5"/><circle cx="0" cy="60" r="1.5"/><circle cx="60" cy="0" r="1.5"/></g></svg>`,
    ambience: 'light',
  },
  Starry: {
    bg: 'bg-[#0f0c29]', bgRaw: '#0f0c29', text: 'text-indigo-200',
    wallColor: '#8b5cf6', cellBgColor: 'rgba(15, 23, 42, 0.8)',
    playerColor: '#fcd34d', trailColor: '#c084fc', endColor: '#fde047',
    accent: 'text-purple-400', gradient: 'from-indigo-900 via-purple-900 to-slate-900',
    startGlow: 'rgba(252, 211, 77, 0.2)', cornerDot: 'transparent',
    containerBg: 'bg-[#18153d]/90', containerBorder: 'border-indigo-500/40',
    swatch: '#8b5cf6',
    textureSvg: `<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><g fill="rgba(192,132,252,0.1)"><circle cx="15" cy="15" r="1"/><circle cx="45" cy="45" r="1.5"/><path d="M30 5 L31 10 L36 11 L31 12 L30 17 L29 12 L24 11 L29 10 Z" transform="translate(-15, 20) scale(0.5)"/></g></svg>`,
    ambience: 'dark',
  },
  Neon: {
    bg: 'bg-slate-950', bgRaw: '#020617', text: 'text-slate-100',
    wallColor: '#334155', cellBgColor: 'rgba(15, 23, 42, 0.8)',
    playerColor: '#06b6d4', trailColor: '#06b6d4', endColor: '#ec4899',
    accent: 'text-cyan-400', gradient: 'from-cyan-400 via-blue-500 to-purple-600',
    startGlow: 'rgba(6, 182, 212, 0.25)', cornerDot: 'rgba(100, 116, 139, 0.6)',
    containerBg: 'bg-slate-900/90', containerBorder: 'border-white/10',
    swatch: '#06b6d4',
    textureSvg: `<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0v60" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/></pattern></defs><rect width="60" height="60" fill="url(#g)"/></svg>`,
    ambience: 'dark',
  },
  Retro: {
    bg: 'bg-[#0f172a]', bgRaw: '#0f172a', text: 'text-emerald-400',
    wallColor: '#059669', cellBgColor: 'rgba(6, 78, 59, 0.4)',
    playerColor: '#10b981', trailColor: '#10b981', endColor: '#fbbf24',
    accent: 'text-emerald-400', gradient: 'from-emerald-400 to-teal-500',
    startGlow: 'rgba(16, 185, 129, 0.25)', cornerDot: 'rgba(52, 211, 153, 0.4)',
    containerBg: 'bg-[#064e3b]/80', containerBorder: 'border-emerald-800/60',
    swatch: '#10b981',
    textureSvg: `<svg width="4" height="4" xmlns="http://www.w3.org/2000/svg"><rect width="4" height="2" fill="rgba(0,0,0,0.2)"/></svg>`,
    ambience: 'dark',
  },
  Light: {
    bg: 'bg-slate-50', bgRaw: '#f8fafc', text: 'text-slate-800',
    wallColor: '#cbd5e1', cellBgColor: '#ffffff',
    playerColor: '#3b82f6', trailColor: '#3b82f6', endColor: '#ef4444',
    accent: 'text-blue-600', gradient: 'from-blue-500 to-violet-500',
    startGlow: 'rgba(59, 130, 246, 0.15)', cornerDot: 'transparent',
    containerBg: 'bg-white/95', containerBorder: 'border-slate-200',
    swatch: '#3b82f6',
    textureSvg: `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="1" fill="rgba(148,163,184,0.15)"/></svg>`,
    ambience: 'light',
  },
  Sunset: {
    bg: 'bg-[#1a0b0e]', bgRaw: '#1a0b0e', text: 'text-orange-50',
    wallColor: '#9a3412', cellBgColor: 'rgba(67, 20, 7, 0.8)',
    playerColor: '#f97316', trailColor: '#ea580c', endColor: '#e11d48',
    accent: 'text-orange-400', gradient: 'from-orange-400 via-rose-500 to-purple-600',
    startGlow: 'rgba(249, 115, 22, 0.2)', cornerDot: 'rgba(251, 146, 60, 0.4)',
    containerBg: 'bg-[#2a1215]/90', containerBorder: 'border-rose-900/40',
    swatch: '#f97316',
    textureSvg: `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M0 40L40 0M-10 10L10 -10M30 50L50 30" stroke="rgba(251,146,60,0.05)" stroke-width="1.5"/></svg>`,
    ambience: 'dark',
  },
  Ocean: {
    bg: 'bg-[#041e3a]', bgRaw: '#041e3a', text: 'text-sky-50',
    wallColor: '#0284c7', cellBgColor: 'rgba(8, 47, 73, 0.8)',
    playerColor: '#0ea5e9', trailColor: '#0284c7', endColor: '#8b5cf6',
    accent: 'text-sky-400', gradient: 'from-sky-300 via-blue-500 to-indigo-500',
    startGlow: 'rgba(14, 165, 233, 0.2)', cornerDot: 'rgba(56, 189, 248, 0.4)',
    containerBg: 'bg-[#082f49]/90', containerBorder: 'border-sky-800/40',
    swatch: '#0ea5e9',
    textureSvg: `<svg width="100" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M0 10 Q25 0 50 10 T100 10" fill="none" stroke="rgba(56,189,248,0.05)" stroke-width="1.5"/></svg>`,
    ambience: 'dark',
  },
  Rose: {
    bg: 'bg-[#1e0a13]', bgRaw: '#1e0a13', text: 'text-pink-50',
    wallColor: '#be185d', cellBgColor: 'rgba(80, 7, 36, 0.8)',
    playerColor: '#ec4899', trailColor: '#db2777', endColor: '#a855f7',
    accent: 'text-pink-400', gradient: 'from-pink-400 via-purple-500 to-indigo-500',
    startGlow: 'rgba(236, 72, 153, 0.2)', cornerDot: 'rgba(244, 114, 182, 0.4)',
    containerBg: 'bg-[#2e101d]/90', containerBorder: 'border-pink-900/40',
    swatch: '#ec4899',
    textureSvg: `<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg"><circle cx="15" cy="15" r="12" fill="none" stroke="rgba(244,114,182,0.05)" stroke-width="1"/></svg>`,
    ambience: 'dark',
  },
  Amber: {
    bg: 'bg-[#fffbeb]', bgRaw: '#fffbeb', text: 'text-amber-900',
    wallColor: '#d97706', cellBgColor: '#ffffff',
    playerColor: '#f59e0b', trailColor: '#d97706', endColor: '#ef4444',
    accent: 'text-amber-600', gradient: 'from-amber-400 via-orange-500 to-red-500',
    startGlow: 'rgba(245, 158, 11, 0.15)', cornerDot: 'transparent',
    containerBg: 'bg-white/95', containerBorder: 'border-amber-200',
    swatch: '#f59e0b',
    textureSvg: `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 24L24 0M-6 6L6 -6M18 30L30 18" stroke="rgba(217,119,6,0.05)" stroke-width="1"/></svg>`,
    ambience: 'light',
  },
  Midnight: {
    bg: 'bg-[#020617]', bgRaw: '#020617', text: 'text-indigo-50',
    wallColor: '#4338ca', cellBgColor: 'rgba(17, 24, 39, 0.8)',
    playerColor: '#6366f1', trailColor: '#4f46e5', endColor: '#10b981',
    accent: 'text-indigo-400', gradient: 'from-indigo-400 via-purple-400 to-emerald-400',
    startGlow: 'rgba(99, 102, 241, 0.2)', cornerDot: 'rgba(129, 140, 248, 0.4)',
    containerBg: 'bg-[#0f172a]/90', containerBorder: 'border-indigo-900/40',
    swatch: '#6366f1',
    textureSvg: `<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><rect x="24" y="24" width="2" height="2" rx="1" fill="rgba(129,140,248,0.1)"/></svg>`,
    ambience: 'dark',
  },
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
    rating: 'Rating',
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
    rating: '评价',
  }
};

export const KIDS_EMOJIS = [
  // Cute animals
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵',
  '🐔', '🐧', '🐦', '🐤', '🐣', '🦆', '🦅', '🦉', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞',
  '🐢', '🦖', '🦕', '🐙',
  // Hearts & sparkles
  '🩷', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '💕', '💖', '💗', '💝',
  '🩷', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '💕', '💖', '💗', '💝',
  '✨', '💎', '💎', '💎', '👑', '🌈', '⭐', '🌟', '💫',
  // Fruits & food (daughter's favorites highlighted)
  '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥',
  '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌽', '🥕',
  // Daughter's special picks
  '💸', '💰', '💩', '💩', '💩', '💩', '💩', '🎃', '🌊',
  // Weather & sky
  '☀️', '🌤', '⛅', '☁️',
];

// Available emoji avatars for the player character selector
export const AVATAR_EMOJIS = [
  '🌈🐱', '💖', '🩷', '⭐', '🌟', '🦄', '🐰', '🐱', '🐶', '🐼', '🦊',
  '🐸', '🐵', '🐧', '🦁', '🐯', '🐤', '🐣', '👑', '💎', '🍓',
  '🍉', '🍑', '🌈', '🔥', '🌊', '🍀', '🎃', '💩', '🚀', '🎯',
];

// Kids mode: Story pair mapping (Player Avatar -> Matching Goal & Story Title)
export const STORY_MATCH_MAP: Record<string, { goal: string; titleZh: string; titleEn: string }> = {
  '🌈🐱': { goal: '🌌', titleZh: '彩虹猫遨游宇宙 🌈', titleEn: 'Nyan Cat in Space' },
  '🐰': { goal: '🥕', titleZh: '小兔找胡萝卜', titleEn: 'Bunny & Carrot' },
  '🐶': { goal: '🦴', titleZh: '小狗找骨头', titleEn: 'Puppy & Bone' },
  '🐱': { goal: '🌌', titleZh: '彩虹猫遨游宇宙 🌈', titleEn: 'Nyan Cat in Space' },
  '🐭': { goal: '🧀', titleZh: '小鼠找奶酪', titleEn: 'Mouse & Cheese' },
  '🐻': { goal: '🍯', titleZh: '小熊采蜂蜜', titleEn: 'Bear & Honey' },
  '🐼': { goal: '🎋', titleZh: '熊猫吃竹子', titleEn: 'Panda & Bamboo' },
  '🐵': { goal: '🍌', titleZh: '小猴摘香蕉', titleEn: 'Monkey & Banana' },
  '🦁': { goal: '👑', titleZh: '森林之王', titleEn: 'King of Jungle' },
  '🐯': { goal: '🥩', titleZh: '小老虎吃大肉', titleEn: 'Tiger & Meat' },
  '🦖': { goal: '🍖', titleZh: '恐龙大冒险', titleEn: 'Dino Adventure' },
  '🦕': { goal: '🌿', titleZh: '小恐龙觅食', titleEn: 'Little Dino' },
  '🦄': { goal: '🏰', titleZh: '独角兽回城堡', titleEn: 'Unicorn Castle' },
  '👑': { goal: '🏰', titleZh: '公主回城堡', titleEn: 'Princess Castle' },
  '🚀': { goal: '🪐', titleZh: '火箭探秘太空', titleEn: 'Space Explorer' },
  '🐸': { goal: '🪷', titleZh: '小青蛙跳荷花', titleEn: 'Frog & Lily' },
  '🐧': { goal: '❄️', titleZh: '企鹅回雪原', titleEn: 'Penguin & Snow' },
  '🦊': { goal: '🍇', titleZh: '狐狸摘葡萄', titleEn: 'Fox & Grapes' },
  '🐤': { goal: '🌾', titleZh: '小鸡找麦穗', titleEn: 'Chick & Grain' },
  '🐣': { goal: '🥚', titleZh: '小鸡破壳而出', titleEn: 'Chick & Egg' },
  '🍓': { goal: '🍰', titleZh: '草莓做蛋糕', titleEn: 'Strawberry Cake' },
  '🍉': { goal: '🍧', titleZh: '西瓜冰淇淋', titleEn: 'Watermelon Ice' },
  '💖': { goal: '🌟', titleZh: '爱心找星星', titleEn: 'Heart & Star' },
  '🩷': { goal: '✨', titleZh: '闪亮小魔法', titleEn: 'Sparkle Magic' },
  '⭐': { goal: '🏆', titleZh: '追寻冠军杯', titleEn: 'Star to Trophy' },
  '🌟': { goal: '🌙', titleZh: '星星伴月亮', titleEn: 'Star & Moon' },
  '💎': { goal: '👑', titleZh: '寻找宝石王冠', titleEn: 'Crown Jewel' },
  '🌈': { goal: '☀️', titleZh: '彩虹向太阳', titleEn: 'Rainbow & Sun' },
  '🔥': { goal: '🏕️', titleZh: '篝火晚会', titleEn: 'Campfire Party' },
  '🌊': { goal: '🏝️', titleZh: '海浪冲向小岛', titleEn: 'Ocean & Island' },
  '🍀': { goal: '🌈', titleZh: '幸运彩虹桥', titleEn: 'Lucky Rainbow' },
  '🎃': { goal: '🍬', titleZh: '万圣节不给糖就捣蛋', titleEn: 'Trick or Treat' },
  '💩': { goal: '🚽', titleZh: '便便冲冲冲', titleEn: 'Poop Rush' },
  '🎯': { goal: '🏆', titleZh: '百发百中', titleEn: 'Bullseye' },
};

