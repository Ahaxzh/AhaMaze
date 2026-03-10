import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { generateMaze, solveMaze, Cell } from '../utils/maze';
import { playMoveSound, playWinSound, playBumpSound } from '../utils/audio';
import {
  RefreshCw, Trophy, Play, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Download, RotateCcw, HelpCircle, Flag, Volume2, VolumeX,
  Sun, Moon, Globe, Home, Swords, BarChart3, User, Clock, Footprints,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';

// --- Constants & Types ---
type Difficulty = 'Kids' | 'Easy' | 'Medium' | 'Hard';
type Theme = 'Princess' | 'Starry' | 'Neon' | 'Retro' | 'Light' | 'Sunset' | 'Ocean' | 'Rose' | 'Amber' | 'Midnight';
type Language = 'en' | 'zh';

const DIFFICULTY_SETTINGS: Record<Difficulty, { width: number; height: number }> = {
  Kids: { width: 10, height: 10 },
  Easy: { width: 25, height: 25 },
  Medium: { width: 35, height: 35 },
  Hard: { width: 45, height: 45 },
};

interface ThemeColors {
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

const THEMES: Record<Theme, ThemeColors> = {
  Princess: {
    bg: 'bg-[#fff0f5]', bgRaw: '#fff0f5', text: 'text-pink-600',
    wallColor: '#fb7185', cellBgColor: 'rgba(255, 255, 255, 0.7)',
    playerColor: '#ff27a0', trailColor: '#fb7185', endColor: '#f43f5e',
    accent: 'text-rose-500', gradient: 'from-pink-400 via-rose-400 to-fuchsia-400',
    startGlow: 'rgba(251, 113, 133, 0.2)', cornerDot: 'transparent',
    containerBg: 'bg-white/60', containerBorder: 'border-pink-200/60',
    swatch: '#fb7185',
    textureSvg: `<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><g fill="rgba(251,113,133,0.12)"><circle cx="30" cy="30" r="2.5"/><circle cx="0" cy="0" r="1.5"/><circle cx="60" cy="60" r="1.5"/><circle cx="0" cy="60" r="1.5"/><circle cx="60" cy="0" r="1.5"/></g></svg>`,
    ambience: 'light',
  },
  Starry: {
    bg: 'bg-[#0f0c29]', bgRaw: '#0f0c29', text: 'text-indigo-200',
    wallColor: '#8b5cf6', cellBgColor: 'rgba(15, 23, 42, 0.5)',
    playerColor: '#fcd34d', trailColor: '#c084fc', endColor: '#fde047',
    accent: 'text-purple-400', gradient: 'from-indigo-900 via-purple-900 to-slate-900',
    startGlow: 'rgba(252, 211, 77, 0.2)', cornerDot: 'transparent',
    containerBg: 'bg-[#1e1b4b]/60', containerBorder: 'border-indigo-500/30',
    swatch: '#8b5cf6',
    textureSvg: `<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><g fill="rgba(192,132,252,0.1)"><circle cx="15" cy="15" r="1"/><circle cx="45" cy="45" r="1.5"/><path d="M30 5 L31 10 L36 11 L31 12 L30 17 L29 12 L24 11 L29 10 Z" transform="translate(-15, 20) scale(0.5)"/></g></svg>`,
    ambience: 'dark',
  },
  Neon: {
    bg: 'bg-slate-950', bgRaw: '#020617', text: 'text-slate-100',
    wallColor: '#334155', cellBgColor: 'rgba(15, 23, 42, 0.4)',
    playerColor: '#06b6d4', trailColor: '#06b6d4', endColor: '#ec4899',
    accent: 'text-cyan-400', gradient: 'from-cyan-400 via-blue-500 to-purple-600',
    startGlow: 'rgba(6, 182, 212, 0.25)', cornerDot: 'rgba(100, 116, 139, 0.6)',
    containerBg: 'bg-slate-900/60', containerBorder: 'border-white/10',
    swatch: '#06b6d4',
    textureSvg: `<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0v60" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/></pattern></defs><rect width="60" height="60" fill="url(#g)"/></svg>`,
    ambience: 'dark',
  },
  Retro: {
    bg: 'bg-[#0f172a]', bgRaw: '#0f172a', text: 'text-emerald-400',
    wallColor: '#059669', cellBgColor: 'rgba(6, 78, 59, 0.15)',
    playerColor: '#10b981', trailColor: '#10b981', endColor: '#fbbf24',
    accent: 'text-emerald-400', gradient: 'from-emerald-400 to-teal-500',
    startGlow: 'rgba(16, 185, 129, 0.25)', cornerDot: 'rgba(52, 211, 153, 0.4)',
    containerBg: 'bg-[#064e3b]/30', containerBorder: 'border-emerald-900/50',
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
    containerBg: 'bg-white/70', containerBorder: 'border-white/60',
    swatch: '#3b82f6',
    textureSvg: `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="1" fill="rgba(148,163,184,0.15)"/></svg>`,
    ambience: 'light',
  },
  Sunset: {
    bg: 'bg-[#1a0b0e]', bgRaw: '#1a0b0e', text: 'text-orange-50',
    wallColor: '#9a3412', cellBgColor: 'rgba(67, 20, 7, 0.5)',
    playerColor: '#f97316', trailColor: '#ea580c', endColor: '#e11d48',
    accent: 'text-orange-400', gradient: 'from-orange-400 via-rose-500 to-purple-600',
    startGlow: 'rgba(249, 115, 22, 0.2)', cornerDot: 'rgba(251, 146, 60, 0.4)',
    containerBg: 'bg-[#2a1215]/60', containerBorder: 'border-rose-900/30',
    swatch: '#f97316',
    textureSvg: `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M0 40L40 0M-10 10L10 -10M30 50L50 30" stroke="rgba(251,146,60,0.05)" stroke-width="1.5"/></svg>`,
    ambience: 'dark',
  },
  Ocean: {
    bg: 'bg-[#041e3a]', bgRaw: '#041e3a', text: 'text-sky-50',
    wallColor: '#0284c7', cellBgColor: 'rgba(8, 47, 73, 0.5)',
    playerColor: '#0ea5e9', trailColor: '#0284c7', endColor: '#8b5cf6',
    accent: 'text-sky-400', gradient: 'from-sky-300 via-blue-500 to-indigo-500',
    startGlow: 'rgba(14, 165, 233, 0.2)', cornerDot: 'rgba(56, 189, 248, 0.4)',
    containerBg: 'bg-[#082f49]/60', containerBorder: 'border-sky-800/30',
    swatch: '#0ea5e9',
    textureSvg: `<svg width="100" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M0 10 Q25 0 50 10 T100 10" fill="none" stroke="rgba(56,189,248,0.05)" stroke-width="1.5"/></svg>`,
    ambience: 'dark',
  },
  Rose: {
    bg: 'bg-[#1e0a13]', bgRaw: '#1e0a13', text: 'text-pink-50',
    wallColor: '#be185d', cellBgColor: 'rgba(80, 7, 36, 0.4)',
    playerColor: '#ec4899', trailColor: '#db2777', endColor: '#a855f7',
    accent: 'text-pink-400', gradient: 'from-pink-400 via-purple-500 to-indigo-500',
    startGlow: 'rgba(236, 72, 153, 0.2)', cornerDot: 'rgba(244, 114, 182, 0.4)',
    containerBg: 'bg-[#2e101d]/60', containerBorder: 'border-pink-900/30',
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
    containerBg: 'bg-white/70', containerBorder: 'border-white/60',
    swatch: '#f59e0b',
    textureSvg: `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 24L24 0M-6 6L6 -6M18 30L30 18" stroke="rgba(217,119,6,0.05)" stroke-width="1"/></svg>`,
    ambience: 'light',
  },
  Midnight: {
    bg: 'bg-[#020617]', bgRaw: '#020617', text: 'text-indigo-50',
    wallColor: '#4338ca', cellBgColor: 'rgba(17, 24, 39, 0.6)',
    playerColor: '#6366f1', trailColor: '#4f46e5', endColor: '#10b981',
    accent: 'text-indigo-400', gradient: 'from-indigo-400 via-purple-400 to-emerald-400',
    startGlow: 'rgba(99, 102, 241, 0.2)', cornerDot: 'rgba(129, 140, 248, 0.4)',
    containerBg: 'bg-[#0f172a]/60', containerBorder: 'border-indigo-900/30',
    swatch: '#6366f1',
    textureSvg: `<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><rect x="24" y="24" width="2" height="2" rx="1" fill="rgba(129,140,248,0.1)"/></svg>`,
    ambience: 'dark',
  },
};

const TEXTS: Record<Language, Record<string, string>> = {
  en: {
    title: 'AhaMaze', home: 'Home', challenge: 'Challenge', leaderboard: 'Leaderboard',
    moves: 'MOVES', level: 'LVL', timer: 'TIME', difficulty: 'DIFFICULTY',
    cleared: 'CLEARED', gaveUp: 'GAVE UP', optimal: 'OPTIMAL', efficiency: 'EFFICIENCY',
    solutionSteps: 'SOLUTION',
    nextLevel: 'NEXT LEVEL', replay: 'REPLAY', giveUp: 'HELP',
    download: 'DOWNLOAD', pathReplay: 'REPLAY PATH', stopReplay: 'STOP',
    kids: 'KIDS', easy: 'EASY', medium: 'MEDIUM', hard: 'HARD',
    sound: 'Sound', newMaze: 'NEW MAZE',
    stats: 'STATS & MAP', controls: 'CONTROLS',
  },
  zh: {
    title: 'AhaMaze', home: '首页', challenge: '挑战模式', leaderboard: '排行榜',
    moves: '步数', level: '关卡', timer: '用时', difficulty: '难度',
    cleared: '通关成功', gaveUp: '已放弃', optimal: '最优步数', efficiency: '效率',
    solutionSteps: '正解步数',
    nextLevel: '下一关', replay: '重玩', giveUp: '提示',
    download: '下载', pathReplay: '路径回放', stopReplay: '停止',
    kids: '儿童', easy: '简单', medium: '中等', hard: '困难',
    sound: '音效', newMaze: '新迷宫',
    stats: '信息与地图', controls: '游戏操作',
    classicMode: '经典模式', challengeMode: '挑战模式',
    fogWarning: '迷雾降临倒计时',
  },
};

type GameMode = 'Classic' | 'Challenge';
type Position = { x: number; y: number };

// --- Canvas Maze Renderer ---
interface MazeCanvasProps {
  maze: Cell[][]; cellSize: number; mazeWidth: number; mazeHeight: number;
  theme: Theme; visitedPath: Position[]; optimalPath: Position[]; replayIndex: number;
  difficulty: Difficulty; gameMode: GameMode; fogCountdown: number; playerPos: Position;
}

const MazeCanvas = React.memo(function MazeCanvas({
  maze, cellSize, mazeWidth, mazeHeight, theme, visitedPath, optimalPath, replayIndex, difficulty, gameMode, fogCountdown, playerPos
}: MazeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelWidth = Math.round(mazeWidth * cellSize);
  const pixelHeight = Math.round(mazeHeight * cellSize);
  const t = THEMES[theme];
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const isKidsMode = difficulty === 'Kids';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || maze.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Offset by 0.5px to properly render sharp 1px lines without anti-aliasing edge blur
    ctx.setTransform(dpr, 0, 0, dpr, 0.5, 0.5);
    ctx.clearRect(-1, -1, pixelWidth + 2, pixelHeight + 2);

    ctx.fillStyle = t.cellBgColor;
    ctx.fillRect(0, 0, pixelWidth, pixelHeight);

    // Dynamic sizing based on cellSize
    const glowOffset = cellSize * 0.1;
    const glowSize = cellSize * 0.8;
    ctx.fillStyle = t.startGlow;
    ctx.fillRect(glowOffset, glowOffset, glowSize, glowSize);

    // Kids mode: Animated Heart as end goal
    if (isKidsMode) {
      ctx.save();
      const endCx = (mazeWidth - 1) * cellSize + cellSize / 2;
      const endCy = (mazeHeight - 1) * cellSize + cellSize / 2;
      ctx.translate(endCx - cellSize * 0.25, endCy - cellSize * 0.25);
      // scale up the svg heart slightly
      ctx.scale(cellSize * 0.05, cellSize * 0.05);
      ctx.fillStyle = t.endColor;
      ctx.beginPath();
      // standard heart path
      ctx.moveTo(5, 3);
      ctx.bezierCurveTo(5, 3, 4.5, 0, 2.5, 0); ctx.bezierCurveTo(0, 0, 0, 3, 0, 3);
      ctx.bezierCurveTo(0, 6, 5, 9, 5, 9);
      ctx.bezierCurveTo(5, 9, 10, 6, 10, 3); ctx.bezierCurveTo(10, 3, 10, 0, 7.5, 0);
      ctx.bezierCurveTo(6, 0, 5, 3, 5, 3);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = t.endColor;
      const endCx = (mazeWidth - 1) * cellSize + cellSize / 2;
      const endCy = (mazeHeight - 1) * cellSize + cellSize / 2;
      ctx.beginPath();
      ctx.arc(endCx, endCy, cellSize * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    const pathToDraw = replayIndex >= 0 ? visitedPath.slice(0, replayIndex + 1) : visitedPath;
    if (pathToDraw.length > 1) {
      if (isKidsMode) {
        // Kids mode rainbow trail
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = Math.max(2, cellSize * 0.35);
        for (let i = 1; i < pathToDraw.length; i++) {
          ctx.beginPath();
          const hue = (i * 12) % 360;
          ctx.strokeStyle = `hsla(${hue}, 80%, 65%, 0.6)`;
          const p1 = pathToDraw[i - 1]; const p2 = pathToDraw[i];
          ctx.moveTo(p1.x * cellSize + cellSize / 2, p1.y * cellSize + cellSize / 2);
          ctx.lineTo(p2.x * cellSize + cellSize / 2, p2.y * cellSize + cellSize / 2);
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.strokeStyle = t.trailColor;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = Math.max(1.5, cellSize * 0.3);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const s = pathToDraw[0];
        ctx.moveTo(s.x * cellSize + cellSize / 2, s.y * cellSize + cellSize / 2);
        for (let i = 1; i < pathToDraw.length; i++) {
          const p = pathToDraw[i];
          ctx.lineTo(p.x * cellSize + cellSize / 2, p.y * cellSize + cellSize / 2);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    if (replayIndex >= 0 && replayIndex < visitedPath.length) {
      const head = visitedPath[replayIndex];
      const px = head.x * cellSize + cellSize / 2;
      const py = head.y * cellSize + cellSize / 2;
      if (isKidsMode) {
        ctx.font = `${Math.floor(cellSize * 0.7)}px Arial`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('💖', px, py + cellSize * 0.05);
      } else {
        ctx.fillStyle = t.playerColor;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(px, py, cellSize * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    if (optimalPath.length > 0 && replayIndex < 0) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.8)';
      const optRadius = Math.max(1, cellSize * 0.1);
      for (const p of optimalPath) {
        if (p.x === 0 && p.y === 0) continue;
        if (p.x === mazeWidth - 1 && p.y === mazeHeight - 1) continue;
        ctx.beginPath();
        ctx.arc(p.x * cellSize + cellSize / 2, p.y * cellSize + cellSize / 2, optRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.strokeStyle = t.wallColor;
    const baseLineWidth = Math.max(1, cellSize * 0.08);
    ctx.lineWidth = baseLineWidth;
    // Use 'square' to extend the lines slightly to cover corners cleanly
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    const rows = maze.length;
    const cols = maze[0]?.length ?? 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = maze[y][x];
        const px = x * cellSize;
        const py = y * cellSize;
        if (cell.walls.top) { ctx.moveTo(px, py); ctx.lineTo(px + cellSize, py); }
        if (cell.walls.right) { ctx.moveTo(px + cellSize, py); ctx.lineTo(px + cellSize, py + cellSize); }
        if (cell.walls.bottom) { ctx.moveTo(px, py + cellSize); ctx.lineTo(px + cellSize, py + cellSize); }
        if (cell.walls.left) { ctx.moveTo(px, py); ctx.lineTo(px, py + cellSize); }
      }
    }
    ctx.stroke();

    // Draw an explicit outer border to ensure outer walls don't appear thinner due to stroke clipping
    ctx.lineWidth = baseLineWidth;
    // Adjust by half the line width so the stroke bounds precisely to the edge of the pixelWidth/Height
    const offset = baseLineWidth / 2;
    ctx.strokeRect(offset, offset, pixelWidth - baseLineWidth, pixelHeight - baseLineWidth);

    if (t.cornerDot !== 'transparent') {
      ctx.fillStyle = t.cornerDot;
      const dotSize = Math.max(0.5, cellSize * 0.06);
      for (let y = 0; y <= rows; y++) {
        for (let x = 0; x <= cols; x++) {
          // Skip corners that touch the exact extreme limits to prevent clipping issues
          if ((x === 0 || x === cols) && (y === 0 || y === rows)) continue;
          ctx.fillRect(x * cellSize - dotSize / 2, y * cellSize - dotSize / 2, dotSize, dotSize);
        }
      }
    }

    // Fog of War Overlay for Challenge Mode
    if (gameMode === 'Challenge' && fogCountdown === 0) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = t.ambience === 'dark' ? 'rgba(0, 0, 0, 0.98)' : 'rgba(255, 255, 255, 0.98)';
      if (theme === 'Princess') ctx.fillStyle = 'rgba(255, 240, 245, 0.98)';

      ctx.beginPath();
      // Outer massive rect covering the whole canvas
      ctx.rect(0, 0, pixelWidth, pixelHeight);

      // 1. Carve path hole
      if (visitedPath.length > 0) {
        ctx.moveTo(visitedPath[0].x * cellSize + cellSize / 2, visitedPath[0].y * cellSize + cellSize / 2);
        for (let i = 1; i < visitedPath.length; i++) {
          ctx.lineTo(visitedPath[i].x * cellSize + cellSize / 2, visitedPath[i].y * cellSize + cellSize / 2);
        }
      }

      // 2. Carve radius around player
      const px = playerPos.x * cellSize + cellSize / 2;
      const py = playerPos.y * cellSize + cellSize / 2;
      // Note: arc drawing direction doesn't matter for evenodd if it doesn't intersect itself in a weird way,
      // but to be safe with standard path overlapping, let's just add it as a sub-path.
      ctx.moveTo(px + cellSize * 3, py);
      ctx.arc(px, py, cellSize * 3, 0, Math.PI * 2, true); // true = counter-clockwise

      // 3. Start and end markers (small holes)
      ctx.moveTo(cellSize / 2 + cellSize * 1.5, cellSize / 2);
      ctx.arc(cellSize / 2, cellSize / 2, cellSize * 1.5, 0, Math.PI * 2, true);

      const endCx = (mazeWidth - 1) * cellSize + cellSize / 2;
      const endCy = (mazeHeight - 1) * cellSize + cellSize / 2;
      ctx.moveTo(endCx + cellSize * 1.5, endCy);
      ctx.arc(endCx, endCy, cellSize * 1.5, 0, Math.PI * 2, true);

      // We need thick strokes for the path, but 'evenodd' fill only works on areas.
      // So instead of a single fill with a line, we can't carve a "line" hole with evenodd easily without stroking first.
      //
      // Best solution: Use a second offscreen canvas for the fog to use destination-out masking.
      // Or just draw everything in offscreen and drawImage.

      // Let's use the offscreen canvas approach for perfect destination-out masking:
      const fogCanvas = document.createElement('canvas');
      fogCanvas.width = pixelWidth;
      fogCanvas.height = pixelHeight;
      const ftx = fogCanvas.getContext('2d');
      if (ftx) {
        ftx.fillStyle = ctx.fillStyle;
        ftx.fillRect(0, 0, pixelWidth, pixelHeight);

        ftx.globalCompositeOperation = 'destination-out';
        ftx.filter = `blur(${cellSize * 1.2}px)`;

        if (visitedPath.length > 0) {
          ftx.beginPath();
          ftx.strokeStyle = 'rgba(0, 0, 0, 1)';
          // Wide corridor for permanent vision
          ftx.lineWidth = cellSize * 4.5;
          ftx.lineCap = 'round';
          ftx.lineJoin = 'round';
          ftx.moveTo(visitedPath[0].x * cellSize + cellSize / 2, visitedPath[0].y * cellSize + cellSize / 2);
          for (let i = 1; i < visitedPath.length; i++) {
            ftx.lineTo(visitedPath[i].x * cellSize + cellSize / 2, visitedPath[i].y * cellSize + cellSize / 2);
          }
          ftx.stroke();
        }

        // Extra wide bulb to make the player's CURRENT vision slightly larger
        const px = playerPos.x * cellSize + cellSize / 2;
        const py = playerPos.y * cellSize + cellSize / 2;
        ftx.fillStyle = 'rgba(0, 0, 0, 1)';
        ftx.beginPath();
        ftx.arc(px, py, cellSize * 3.5, 0, Math.PI * 2);
        ftx.fill();

        // Start and end markers (faint/small permanent holes so players always know general direction)
        ftx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ftx.beginPath(); ftx.arc(cellSize / 2, cellSize / 2, cellSize * 1.5, 0, Math.PI * 2); ftx.fill();
        const endCx = (mazeWidth - 1) * cellSize + cellSize / 2;
        const endCy = (mazeHeight - 1) * cellSize + cellSize / 2;
        ftx.beginPath(); ftx.arc(endCx, endCy, cellSize * 1.5, 0, Math.PI * 2); ftx.fill();

        // Reset filter
        ftx.filter = 'none';
      }

      // Draw the fog mask over the main canvas
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(fogCanvas, 0, 0);
    }
  }, [maze, cellSize, mazeWidth, mazeHeight, theme, visitedPath, optimalPath, replayIndex, t, dpr, pixelWidth, pixelHeight, isKidsMode, gameMode, fogCountdown, playerPos]);

  return (
    <canvas
      className="block"
      ref={canvasRef}
      width={pixelWidth * dpr}
      height={pixelHeight * dpr}
      style={{ width: pixelWidth, height: pixelHeight }}
    />
  );
});

// --- Player ---
const Player = React.memo(function Player({ position, size, theme, isKidsMode }: { position: Position; size: number; theme: Theme; isKidsMode: boolean }) {
  const t = THEMES[theme];
  return (
    <motion.div
      className="absolute z-20 flex items-center justify-center pointer-events-none"
      initial={false}
      animate={{ x: position.x * size, y: position.y * size }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      style={{ width: size, height: size, top: 0, left: 0 }}
    >
      {isKidsMode ? (
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          style={{ fontSize: size * 0.7, lineHeight: 1 }}
          className="drop-shadow-sm"
        >💖</motion.div>
      ) : (
        <div className="rounded-full shadow-lg relative" style={{ width: size * 0.5, height: size * 0.5, backgroundColor: t.playerColor }}>
          <div className="absolute inset-0 rounded-full bg-white opacity-60 blur-[1px]" />
        </div>
      )}
    </motion.div>
  );
});

// --- End marker pulse ---
const EndMarkerPulse = React.memo(function EndMarkerPulse({ mazeWidth, mazeHeight, cellSize, theme, isKidsMode }: { mazeWidth: number; mazeHeight: number; cellSize: number; theme: Theme; isKidsMode: boolean }) {
  const t = THEMES[theme];
  return (
    <div className="absolute z-10 flex items-center justify-center pointer-events-none" style={{ left: (mazeWidth - 1) * cellSize, top: (mazeHeight - 1) * cellSize, width: cellSize, height: cellSize }}>
      {isKidsMode ? (
        <motion.div animate={{ scale: [1, 1.25, 1], rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 1.2 }} className="drop-shadow-md text-rose-500" style={{ fontSize: cellSize * 0.6 }}>
          💖
        </motion.div>
      ) : (
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="rounded-full shadow-lg" style={{ width: cellSize * 0.5, height: cellSize * 0.5, backgroundColor: t.endColor }} />
      )}
    </div>
  );
});

// --- Timer Display ---
function TimerDisplay({ startTime, gameState, className }: { startTime: number | null; gameState: string; className?: string }) {
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (gameState === 'playing' && startTime) {
      timerRef.current = setInterval(() => {
        const now = Date.now() - startTime;
        const prevSec = Math.floor(elapsedRef.current / 1000);
        const newSec = Math.floor(now / 1000);
        elapsedRef.current = now;
        if (newSec !== prevSec) setElapsed(now);
      }, 250);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (!startTime) { setElapsed(0); elapsedRef.current = 0; }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, startTime]);

  const seconds = Math.floor(elapsed / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return <span className={className}>{mins}:{secs.toString().padStart(2, '0')}</span>;
}

// --- Download helper ---
function downloadMazeImage(
  maze: Cell[][], visitedPath: Position[], optimalPath: Position[], theme: Theme,
  mazeWidth: number, mazeHeight: number, moves: number, finalTime: number, level: number, difficulty: Difficulty, lang: Language,
) {
  const exportCellSize = 16;
  const padding = 60;
  const statsHeight = 100;
  const w = mazeWidth * exportCellSize;
  const h = mazeHeight * exportCellSize;
  const totalW = w + padding * 2;
  const totalH = h + padding + statsHeight;
  const t = THEMES[theme];

  const canvas = document.createElement('canvas');
  canvas.width = totalW; canvas.height = totalH;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = t.bgRaw; ctx.fillRect(0, 0, totalW, totalH);
  ctx.save(); ctx.translate(padding, padding - 20);
  ctx.fillStyle = t.playerColor; ctx.font = 'bold 18px Inter, sans-serif';
  ctx.fillText('AhaMaze', 0, -10);
  ctx.fillStyle = t.ambience === 'light' ? '#475569' : '#94a3b8';
  ctx.font = '12px "JetBrains Mono", monospace';
  const diffLabel = lang === 'zh' ? { Kids: '儿童', Easy: '简单', Medium: '中等', Hard: '困难' }[difficulty] : difficulty;
  ctx.fillText(`Level ${level} | ${diffLabel} ${mazeWidth}x${mazeHeight}`, 100, -10);
  ctx.translate(0, 20);

  ctx.fillStyle = t.cellBgColor; ctx.fillRect(0, 0, w, h);

  if (visitedPath.length > 1) {
    if (difficulty === 'Kids') {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(2, exportCellSize * 0.35);
      for (let i = 1; i < visitedPath.length; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${(i * 12) % 360}, 80%, 65%, 0.8)`;
        ctx.moveTo(visitedPath[i - 1].x * exportCellSize + exportCellSize / 2, visitedPath[i - 1].y * exportCellSize + exportCellSize / 2);
        ctx.lineTo(visitedPath[i].x * exportCellSize + exportCellSize / 2, visitedPath[i].y * exportCellSize + exportCellSize / 2);
        ctx.stroke();
      }
    } else {
      ctx.beginPath(); ctx.strokeStyle = t.trailColor; ctx.globalAlpha = 0.3;
      ctx.lineWidth = Math.max(2, exportCellSize / 4); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.moveTo(visitedPath[0].x * exportCellSize + exportCellSize / 2, visitedPath[0].y * exportCellSize + exportCellSize / 2);
      for (let i = 1; i < visitedPath.length; i++) {
        ctx.lineTo(visitedPath[i].x * exportCellSize + exportCellSize / 2, visitedPath[i].y * exportCellSize + exportCellSize / 2);
      }
      ctx.stroke(); ctx.globalAlpha = 1;
    }
  }
  if (optimalPath.length > 0) {
    ctx.fillStyle = 'rgba(250, 204, 21, 0.8)';
    for (const p of optimalPath) {
      if (p.x === 0 && p.y === 0) continue;
      if (p.x === mazeWidth - 1 && p.y === mazeHeight - 1) continue;
      ctx.beginPath(); ctx.arc(p.x * exportCellSize + exportCellSize / 2, p.y * exportCellSize + exportCellSize / 2, 2, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.fillStyle = t.startGlow; ctx.fillRect(1, 1, exportCellSize - 2, exportCellSize - 2);
  ctx.fillStyle = t.endColor; ctx.beginPath();
  ctx.arc((mazeWidth - 1) * exportCellSize + exportCellSize / 2, (mazeHeight - 1) * exportCellSize + exportCellSize / 2, exportCellSize * 0.25, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = t.wallColor; ctx.lineWidth = 1.5; ctx.lineCap = 'square'; ctx.lineJoin = 'miter'; ctx.beginPath();
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < (maze[0]?.length ?? 0); x++) {
      const cell = maze[y][x]; const px = x * exportCellSize; const py = y * exportCellSize;
      if (cell.walls.top) { ctx.moveTo(px, py); ctx.lineTo(px + exportCellSize, py); }
      if (cell.walls.right) { ctx.moveTo(px + exportCellSize, py); ctx.lineTo(px + exportCellSize, py + exportCellSize); }
      if (cell.walls.bottom) { ctx.moveTo(px, py + exportCellSize); ctx.lineTo(px + exportCellSize, py + exportCellSize); }
      if (cell.walls.left) { ctx.moveTo(px, py); ctx.lineTo(px, py + exportCellSize); }
    }
  }
  ctx.stroke();

  // Add the explicit outer border to the exported image as well
  ctx.lineWidth = 1.5;
  const offset = 1.5 / 2;
  ctx.strokeRect(offset, offset, w - 1.5, h - 1.5);

  ctx.restore();

  const statsY = h + padding + 20;
  ctx.fillStyle = t.ambience === 'light' ? '#475569' : '#94a3b8'; ctx.font = '13px "JetBrains Mono", monospace';
  const secs = Math.floor(finalTime / 1000); const mins = Math.floor(secs / 60); const secsRem = secs % 60;
  const timeStr = `${mins}:${secsRem.toString().padStart(2, '0')}`;
  const optLen = optimalPath.length > 0 ? optimalPath.length - 1 : 0;
  const eff = optLen > 0 ? Math.round((optLen / moves) * 100) : 0;
  const movesLabel = lang === 'zh' ? '步数' : 'Moves'; const optLabel = lang === 'zh' ? '最优' : 'Optimal';
  const timeLabel = lang === 'zh' ? '用时' : 'Time'; const effLabel = lang === 'zh' ? '效率' : 'Efficiency';
  ctx.fillText(`${movesLabel}: ${moves}  |  ${optLabel}: ${optLen}  |  ${timeLabel}: ${timeStr}  |  ${effLabel}: ${eff}%`, padding, statsY);
  ctx.fillStyle = t.ambience === 'light' ? '#94a3b8' : '#475569'; ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillText('Generated by AhaMaze', padding, statsY + 24);

  const link = document.createElement('a');
  link.download = `ahamaze-level${level}-${difficulty.toLowerCase()}.png`;
  link.href = canvas.toDataURL('image/png'); link.click();
}

// --- Mobile D-pad control button ---
const ControlButton = React.memo(function ControlButton({ icon, onClick }: { icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className="w-14 h-14 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-300 active:bg-cyan-500 active:text-slate-900 active:border-cyan-400 transition-colors backdrop-blur-sm"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {icon}
    </button>
  );
});

const KIDS_EMOJIS = [
  '🎈', '🧸', '🍭', '🎀', '🦄', '🌟', '🌸', '🍓', '🍬', '🦋', '🐰', '🐶', '🍦', '🧁',
  '🍋', '🍉', '🍇', '🍒', '🌻', '🌺', '🍀', '🍄', '🐢', '🐥', '🐧', '🐳', '🍩', '🍪',
  '🧃', '🪁', '🚗', '🚂', '🛸', '🚀', '🎨', '🧩', '🎵', '⚽', '🏀', '☀️', '☁️', '🌙',
  '💖', '💎', '✨', '👑', '🌈', '⭐'
];

const KidsBackground = React.memo(function KidsBackground({ isDark }: { isDark: boolean }) {
  const [elements, setElements] = useState<Array<{ id: number; emoji: string; left: number; duration: number; delay: number; size: number; rotate: number; rotateDuration: number; drift: number }>>([]);

  useEffect(() => {
    // Increase elements up to 35, and constrain mainly to left 65% of the screen
    const newElements = Array.from({ length: 35 }).map((_, i) => {
      const visualSize = 14 + Math.random() * 24; // 14px - 38px
      return {
        id: i,
        emoji: KIDS_EMOJIS[Math.floor(Math.random() * KIDS_EMOJIS.length)].trim(),
        left: Math.random() * 65,
        // Make duration much longer (25s to 55s) for a gentle float
        duration: 25 + Math.random() * 30,
        // Spread the delay out further so they don't all appear at once
        delay: -(Math.random() * 40),
        visualSize,
        rotate: Math.random() * 360,
        rotateDuration: 12 + Math.random() * 20, // slower rotation
        drift: Math.random() * 12 - 6
      };
    });
    setElements(newElements);
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-colors duration-1000 ${isDark ? 'bg-gradient-to-br from-[#2e1025] via-[#4a1c40] to-[#2e1045]' : 'bg-gradient-to-br from-pink-200 via-pink-100 to-rose-200'}`}>
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `radial-gradient(${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.8)'} 4px, transparent 4px)`,
        backgroundSize: '40px 40px'
      }} />
      {elements.map((el) => {
        // Render at a high fixed font size to ensure sharpness, then scale down
        const renderSize = 64;
        const scale = el.visualSize / renderSize;
        return (
          <motion.div
            key={el.id}
            initial={{ y: '-10vh', x: `${el.left}vw`, rotate: el.rotate, scale }}
            animate={{
              y: '120vh',
              rotate: el.rotate + 360,
              x: [`${el.left}vw`, `${el.left + el.drift}vw`, `${el.left}vw`],
              scale
            }}
            transition={{
              y: { duration: el.duration, repeat: Infinity, delay: el.delay, ease: "linear" },
              rotate: { duration: el.rotateDuration, repeat: Infinity, ease: "linear" },
              x: { duration: el.duration * 0.8, repeat: Infinity, delay: el.delay, ease: "easeInOut" }
            }}
            style={{
              position: 'absolute',
              fontSize: renderSize,
              lineHeight: 1,
              top: 0,
              opacity: isDark ? 0.8 : 0.9,
              transformOrigin: 'center center'
            }}
            className="drop-shadow-sm"
          >
            {el.emoji}
          </motion.div>
        );
      })}
    </div>
  );
});

// =====================
// --- Main Game ---
// =====================
interface LeaderboardEntry {
  name: string;
  difficulty: Difficulty;
  mode: GameMode;
  time: number;
  moves: number;
  date: string;
}

export default function Game() {
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [theme, setTheme] = useState<Theme>('Light');
  const [lang, setLang] = useState<Language>('zh');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>('Classic');
  const [fogCountdown, setFogCountdown] = useState(10);

  // Local Player Identity & Leaderboard
  const [playerName, setPlayerName] = useState<string>('');
  const [showLogin, setShowLogin] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardMode, setLeaderboardMode] = useState<GameMode>('Classic');
  const [leaderboardDiff, setLeaderboardDiff] = useState<Difficulty>('Easy');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  const [maze, setMaze] = useState<Cell[][]>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'gaveUp'>('start');
  const [level, setLevel] = useState(1);
  const [moves, setMoves] = useState(0);
  const [visitedPath, setVisitedPath] = useState<Position[]>([]);
  const [optimalPath, setOptimalPath] = useState<Position[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finalTime, setFinalTime] = useState(0);

  const [replayIndex, setReplayIndex] = useState(-1);
  const [isReplaying, setIsReplaying] = useState(false);
  const replayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mobile sidebar toggle
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const playerPosRef = useRef(playerPos); playerPosRef.current = playerPos;
  const gameStateRef = useRef(gameState); gameStateRef.current = gameState;
  const mazeRef = useRef(maze); mazeRef.current = maze;
  const soundEnabledRef = useRef(soundEnabled); soundEnabledRef.current = soundEnabled;
  const startTimeRef = useRef(startTime); startTimeRef.current = startTime;
  const movesRef = useRef(moves); movesRef.current = moves; // Added movesRef

  const { width: MAZE_WIDTH, height: MAZE_HEIGHT } = DIFFICULTY_SETTINGS[difficulty];
  const mazeWidthRef = useRef(MAZE_WIDTH); mazeWidthRef.current = MAZE_WIDTH;
  const mazeHeightRef = useRef(MAZE_HEIGHT); mazeHeightRef.current = MAZE_HEIGHT;

  const text = TEXTS[lang];
  const t = THEMES[theme];
  // Determine if the current App-level requested aesthetics is dark based on the active theme
  // We use this to know which Kids mode version to show if we switch TO Kids mode.
  const appIsDark = useMemo(() => {
    // If we are IN a kids mode, we check the global body class instead
    if (theme === 'Princess' || theme === 'Starry') {
      return document.documentElement.classList.contains('dark');
    }
    return t.ambience === 'dark';
  }, [theme, t.ambience]);

  // Background pattern: use SVG dots instead of overlapping circles
  const textureBg = useMemo(() => {
    const color = appIsDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
    return `radial-gradient(${color} 2px, transparent 2px)`;
  }, [appIsDark]);

  // Handle local storage player load on boot
  useEffect(() => {
    const savedName = localStorage.getItem('ahamaze_player');
    if (savedName) {
      setPlayerName(savedName);
    } else {
      setShowLogin(true); // Prompt on very first visit
    }
  }, []);

  // Track container size for stable sizing
  useEffect(() => {
    if (!containerRef.current) return;
    const updateContainerSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };
    updateContainerSize();
    const observer = new ResizeObserver(updateContainerSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Synchronous cell size calculation to prevent layout jumps
  const cellSize = useMemo(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return 30;
    const isMobile = window.innerWidth < 768;
    const padWidth = isMobile ? 32 : 64;
    const padHeight = isMobile ? 280 : 120;
    const maxAvailableWidth = containerSize.width - padWidth;
    const maxAvailableHeight = containerSize.height - padHeight;
    const size = Math.min(
      maxAvailableWidth / MAZE_WIDTH,
      maxAvailableHeight / MAZE_HEIGHT,
      120
    );
    return Math.max(size, 6);
  }, [containerSize, MAZE_WIDTH, MAZE_HEIGHT]);

  // Force theme application for Kids mode
  useEffect(() => {
    if (difficulty === 'Kids') {
      setTheme(appIsDark ? 'Starry' : 'Princess');
    } else if (theme === 'Princess' || theme === 'Starry') {
      // Revert if diff changed from Kids to something else
      setTheme(appIsDark ? 'Neon' : 'Light');
    }
  }, [difficulty, appIsDark]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Update body theme class to sync global dark mode toggles if needed
    if (appIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appIsDark]);

  useEffect(() => { startNewLevel(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [difficulty, gameMode]);

  // Fog countdown timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (gameState === 'playing' && gameMode === 'Challenge' && fogCountdown > 0) {
      timer = setInterval(() => setFogCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, gameMode, fogCountdown]);

  const stopReplay = useCallback(() => {
    if (replayTimerRef.current) { clearInterval(replayTimerRef.current); replayTimerRef.current = null; }
    setIsReplaying(false); setReplayIndex(-1);
  }, []);

  const startNewLevel = useCallback(() => {
    stopReplay();
    const w = mazeWidthRef.current; const h = mazeHeightRef.current;
    setMaze(generateMaze(w, h));
    setPlayerPos({ x: 0, y: 0 }); setVisitedPath([{ x: 0, y: 0 }]); setOptimalPath([]);
    setGameState('playing'); setMoves(0); setStartTime(null); setFinalTime(0);
    setFogCountdown(10); // Reset fog timer
    setShowMobileSidebar(false);
  }, [stopReplay]);

  const handleWin = useCallback((currentMaze: Cell[][]) => {
    setGameState('won');
    const fTime = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
    setFinalTime(fTime);
    playWinSound(soundEnabledRef.current);
    const duration = 3000; const end = Date.now() + duration;
    const colors = [t.playerColor, t.endColor];
    const frame = () => {
      confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
    const w = mazeWidthRef.current; const h = mazeHeightRef.current;

    // Save Leaderboard record
    const optPath = solveMaze(currentMaze, { x: 0, y: 0 }, { x: w - 1, y: h - 1 });
    setOptimalPath(optPath);

    setTimeout(() => {
      try {
        const mvs = playerPosRef.current.x === w - 1 && playerPosRef.current.y === h - 1 ? movesRef.current : movesRef.current + 1;
        const records = JSON.parse(localStorage.getItem('ahamaze_records') || '[]');
        records.push({
          name: playerName || 'Guest',
          difficulty: difficulty,
          mode: gameMode,
          time: fTime,
          moves: mvs,
          date: new Date().toISOString()
        });
        localStorage.setItem('ahamaze_records', JSON.stringify(records));
      } catch (e) { }
    }, 100);

    setShowMobileSidebar(true);
  }, [t, playerName, difficulty, gameMode]);

  const handleMove = useCallback((dx: number, dy: number) => {
    if (gameStateRef.current !== 'playing') return;
    if (!startTimeRef.current) setStartTime(Date.now());
    const pos = playerPosRef.current; const m = mazeRef.current;
    const w = mazeWidthRef.current; const h = mazeHeightRef.current;
    const currentCell = m[pos.y][pos.x];
    const newX = pos.x + dx; const newY = pos.y + dy;
    if (newX < 0 || newX >= w || newY < 0 || newY >= h) { playBumpSound(soundEnabledRef.current); return; }
    if (dx === 1 && currentCell.walls.right) { playBumpSound(soundEnabledRef.current); return; }
    if (dx === -1 && currentCell.walls.left) { playBumpSound(soundEnabledRef.current); return; }
    if (dy === 1 && currentCell.walls.bottom) { playBumpSound(soundEnabledRef.current); return; }
    if (dy === -1 && currentCell.walls.top) { playBumpSound(soundEnabledRef.current); return; }
    const newPos = { x: newX, y: newY };
    setVisitedPath((prev) => [...prev, newPos]); setPlayerPos(newPos);
    setMoves((m) => {
      movesRef.current = m + 1;
      return m + 1;
    });
    playMoveSound(soundEnabledRef.current);
    if (newX === w - 1 && newY === h - 1) handleWin(m);
  }, [handleWin]);

  const restartLevel = useCallback(() => {
    stopReplay();
    setPlayerPos({ x: 0, y: 0 }); setVisitedPath([{ x: 0, y: 0 }]);
    setGameState('playing'); setMoves(0); setStartTime(null); setFinalTime(0); setOptimalPath([]);
    setShowMobileSidebar(false);
  }, [stopReplay]);

  const handleGiveUp = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    stopReplay(); setGameState('gaveUp');
    setFinalTime(startTimeRef.current ? Date.now() - startTimeRef.current : 0);
    const m = mazeRef.current; const w = mazeWidthRef.current; const h = mazeHeightRef.current;
    setOptimalPath(solveMaze(m, { x: 0, y: 0 }, { x: w - 1, y: h - 1 }));
    setShowMobileSidebar(true);
  }, [stopReplay]);

  const startReplay = useCallback(() => {
    if (visitedPath.length < 2) return;
    stopReplay(); setIsReplaying(true); setReplayIndex(0);
    const speed = Math.max(40, Math.min(150, 8000 / visitedPath.length));
    let idx = 0;
    replayTimerRef.current = setInterval(() => {
      idx++;
      if (idx >= visitedPath.length) {
        if (replayTimerRef.current) clearInterval(replayTimerRef.current);
        replayTimerRef.current = null; setIsReplaying(false); setReplayIndex(-1);
        return;
      }
      setReplayIndex(idx);
    }, speed);
  }, [visitedPath, stopReplay]);

  const handleDownload = useCallback(() => {
    downloadMazeImage(maze, visitedPath, optimalPath, theme, MAZE_WIDTH, MAZE_HEIGHT, moves, finalTime, level, difficulty, lang);
  }, [maze, visitedPath, optimalPath, theme, MAZE_WIDTH, MAZE_HEIGHT, moves, finalTime, level, difficulty, lang]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current !== 'playing') return;
      switch (e.key) {
        case 'ArrowUp': case 'w': handleMove(0, -1); break;
        case 'ArrowDown': case 's': handleMove(0, 1); break;
        case 'ArrowLeft': case 'a': handleMove(-1, 0); break;
        case 'ArrowRight': case 'd': handleMove(1, 0); break;
        case 'r': case 'R': startNewLevel(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, startNewLevel]);

  // Gamepad
  useEffect(() => {
    let reqId: number;
    let lastMoveTime = 0;
    const COOLDOWN = 140; // ms between consecutive stick moves
    const THRESHOLD = 0.4; // analog stick threshold

    const pollGamepad = () => {
      reqId = requestAnimationFrame(pollGamepad);

      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const now = Date.now();
      if (now - lastMoveTime < COOLDOWN) return;

      for (const gp of gamepads) {
        if (!gp) continue;

        // Start button (Index 9) to generate new maze
        if (gp.buttons[9]?.pressed) {
          startNewLevel();
          lastMoveTime = now + 500; // block inputs for half a second
          break;
        }

        if (gameStateRef.current !== 'playing') continue;

        let dx = 0, dy = 0;

        // D-pad (Standard mapping: 12=Up, 13=Down, 14=Left, 15=Right)
        if (gp.buttons[12]?.pressed) dy = -1;
        else if (gp.buttons[13]?.pressed) dy = 1;
        else if (gp.buttons[14]?.pressed) dx = -1;
        else if (gp.buttons[15]?.pressed) dx = 1;

        // Left Stick (Axes 0=X, 1=Y)
        else if (gp.axes[1] && gp.axes[1] < -THRESHOLD) dy = -1;
        else if (gp.axes[1] && gp.axes[1] > THRESHOLD) dy = 1;
        else if (gp.axes[0] && gp.axes[0] < -THRESHOLD) dx = -1;
        else if (gp.axes[0] && gp.axes[0] > THRESHOLD) dx = 1;

        if (dx !== 0 || dy !== 0) {
          handleMove(dx, dy);
          lastMoveTime = now;
          break; // Process only one directional input from the first active controller
        }
      }
    };
    reqId = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(reqId);
  }, [handleMove, startNewLevel]);

  // Touch
  const handleTouchStart = useCallback((e: React.TouchEvent) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const te = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const dx = te.x - touchStart.current.x; const dy = te.y - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) { if (Math.abs(dx) > 30) handleMove(dx > 0 ? 1 : -1, 0); }
    else { if (Math.abs(dy) > 30) handleMove(0, dy > 0 ? 1 : -1); }
    touchStart.current = null;
  }, [handleMove]);

  const moveUp = useCallback(() => handleMove(0, -1), [handleMove]);
  const moveDown = useCallback(() => handleMove(0, 1), [handleMove]);
  const moveLeft = useCallback(() => handleMove(-1, 0), [handleMove]);
  const moveRight = useCallback(() => handleMove(1, 0), [handleMove]);

  const formatTime = (ms: number) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`; };
  const optLen = optimalPath.length > 0 ? optimalPath.length - 1 : 0;
  const efficiency = optLen > 0 ? Math.round((optLen / moves) * 100) : 0;
  const isFinished = gameState === 'won' || gameState === 'gaveUp';
  const rating = efficiency >= 95 ? 'Perfect' : efficiency >= 85 ? 'Excellent' : efficiency >= 70 ? 'Good' : efficiency >= 50 ? 'Fair' : 'Lost in Maze';

  // Toggle between dark/light base on current theme
  const toggleDarkLight = () => {
    if (difficulty === 'Kids') return; // Cannot toggle theme in Kids mode
    if (appIsDark) {
      setTheme(theme === 'Retro' ? 'Retro' : (theme === 'Neon' ? 'Light' : 'Amber'));
    } else {
      setTheme(theme === 'Light' ? 'Neon' : 'Sunset');
    }
  };

  // --- Sidebar Action Button ---
  const SidebarBtn = ({ icon, label, onClick, primary, disabled: dis }: { icon: React.ReactNode; label: string; onClick: () => void; primary?: boolean; disabled?: boolean }) => (
    <button
      onClick={onClick}
      disabled={dis}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${primary
        ? 'text-white shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95'
        : dis
          ? 'opacity-40 cursor-not-allowed'
          : appIsDark ? 'bg-white/5 hover:bg-white/10 text-slate-200' : 'bg-black/5 hover:bg-black/10 text-slate-700'
        }`}
      style={primary ? { background: `linear-gradient(135deg, ${t.playerColor}, ${t.trailColor})` } : undefined}
    >
      <div className={primary ? 'opacity-90' : 'opacity-70'}>{icon}</div>
      <span className="tracking-wide">{label}</span>
    </button>
  );

  // =========================================
  // RENDER
  // =========================================
  return (
    <div
      className={`fixed inset-0 flex flex-col font-sans overflow-hidden select-none transition-colors duration-200 ${t.bg} ${t.text}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background texture */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {difficulty === 'Kids' ? (
          <KidsBackground isDark={appIsDark} />
        ) : (
          <div className="absolute inset-0" style={{ backgroundImage: textureBg }} />
        )}
      </div>
      {/* ========== TOP NAVBAR ========== */}
      <div className="relative z-20 shrink-0 p-2 md:p-4 pb-0">
        <nav className={`flex items-center justify-between p-2 md:p-3 px-4 md:px-6 rounded-2xl border shadow-sm backdrop-blur-xl transition-colors duration-500 ${appIsDark ? 'bg-slate-900/40 border-white/5' : 'bg-white/60 border-black/5'}`}>

          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(135deg, ${t.playerColor}, ${t.trailColor})` }}>
              <span className="text-white font-black tracking-tighter mix-blend-overlay">AH</span>
            </div>
            <span className={`font-black tracking-tight text-lg hidden sm:block ${t.text}`}>
              {text.title}
            </span>
          </div>

          {/* Center: Game Mode Toggle */}
          <div className={`hidden md:flex items-center p-1 rounded-xl mx-4 transition-colors duration-500 ${appIsDark ? 'bg-black/40' : 'bg-black/5'}`}>
            <button
              onClick={() => setGameMode('Classic')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${gameMode === 'Classic'
                ? `bg-white shadow-sm text-slate-800 ${appIsDark && 'bg-slate-800 text-white'}`
                : `opacity-60 hover:opacity-100 ${t.text}`
                }`}
            >
              <Swords size={16} className={gameMode === 'Classic' ? t.text : ''} /> {text.challenge.replace('模式', '') || 'Classic'}
            </button>
            <button
              onClick={() => setGameMode('Challenge')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${gameMode === 'Challenge'
                ? `shadow-sm text-white bg-gradient-to-r ${t.gradient}`
                : `opacity-60 hover:opacity-100 ${t.text}`
                }`}
            >
              <Trophy size={16} /> {text.challenge}
            </button>
          </div>

          {/* Center Mobile: Logo + Mode */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setGameMode(gameMode === 'Classic' ? 'Challenge' : 'Classic')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${appIsDark ? 'bg-white/10 text-white' : 'bg-black/5 text-slate-900'}`}>
              {gameMode === 'Challenge' ? <><Trophy size={14} className="text-amber-500" /> {text.challenge}</> : <><Swords size={14} /> Classic</>}
            </button>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            <button onClick={toggleDarkLight} className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${appIsDark ? 'bg-white/5 hover:bg-white/10 text-yellow-300' : 'bg-black/5 hover:bg-black/10 text-slate-600'}`}>
              {appIsDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${appIsDark ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-black/5 hover:bg-black/10 text-slate-600'}`}>
              <Globe size={18} />
            </button>
            {/* Leaderboard Toggle */}
            <button
              onClick={() => {
                try {
                  setLeaderboardData(JSON.parse(localStorage.getItem('ahamaze_records') || '[]'));
                } catch (e) { setLeaderboardData([]); }
                setShowLeaderboard(true);
              }}
              className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${appIsDark ? 'bg-white/5 hover:bg-white/10 text-amber-400' : 'bg-amber-100 hover:bg-amber-200 text-amber-600'}`}
            >
              <BarChart3 size={18} />
            </button>
            {/* User profile / Login */}
            <div
              onClick={() => setShowLogin(true)}
              className={`hidden md:flex px-3 h-9 rounded-xl items-center justify-center gap-2 text-sm font-bold shadow-sm cursor-pointer hover:opacity-80 transition-opacity ${appIsDark ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300' : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600'}`}
            >
              <User size={16} />
              <span className="max-w-[80px] truncate">{playerName || (lang === 'zh' ? '游客' : 'Guest')}</span>
            </div>
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              className={`lg:hidden p-2 rounded-xl transition-all ${appIsDark ? 'bg-white/5 text-white' : 'bg-black/5 text-slate-900'}`}
            >
              <ChevronRightIcon size={18} className={showMobileSidebar ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
          </div>
        </nav>
      </div>

      {/* ========== MAIN CONTENT (maze + sidebar) ========== */}
      <div className="flex-1 flex overflow-hidden relative z-10 p-2 md:p-4 pb-4 gap-4 md:gap-6">

        {/* LEFT: Maze Area (70% - 75%) */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-w-0" ref={containerRef}>
          {/* Maze container Glow */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[70%] h-[70%] blur-[80px] opacity-20 rounded-full transition-colors duration-1000" style={{ backgroundColor: t.playerColor }} />
          </div>
          {/* Maze container glass frame */}
          <div
            className={`relative backdrop-blur-md rounded-2xl shadow-xl border transition-all duration-500 ease-out flex items-center justify-center p-2 md:p-3 ${t.containerBg} ${t.containerBorder}`}
            style={{ width: 'fit-content', height: 'fit-content', maxWidth: '100%', maxHeight: '100%' }}
          >
            {/* The inner bounds that wrap the maze, with a small padding so walls don't clip against rounded border */}
            <div
              className={`relative overflow-hidden rounded-xl border p-1 md:p-1.5 ${appIsDark ? 'border-white/5 bg-black/10' : 'border-black/5 bg-white/30'}`}
            >
              <div className="relative" style={{ width: MAZE_WIDTH * cellSize, height: MAZE_HEIGHT * cellSize }}>
                {maze.length > 0 && (
                  <>
                    <MazeCanvas maze={maze} cellSize={cellSize} mazeWidth={MAZE_WIDTH} mazeHeight={MAZE_HEIGHT}
                      theme={theme} visitedPath={visitedPath} optimalPath={optimalPath} replayIndex={replayIndex} difficulty={difficulty}
                      gameMode={gameMode} fogCountdown={fogCountdown} playerPos={playerPos} />
                    {!isFinished && (
                      <EndMarkerPulse mazeWidth={MAZE_WIDTH} mazeHeight={MAZE_HEIGHT} cellSize={cellSize} theme={theme} isKidsMode={difficulty === 'Kids'} />
                    )}
                    {!isReplaying && (
                      <Player position={playerPos} size={cellSize} theme={theme} isKidsMode={difficulty === 'Kids'} />
                    )}
                  </>
                )}

                {/* Fog Countdown UI overlay on maze */}
                {gameMode === 'Challenge' && fogCountdown > 0 && !isFinished && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
                    <motion.div
                      key={fogCountdown} // forces re-render animation each second
                      initial={{ opacity: 0, y: -10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`px-4 py-2 rounded-full backdrop-blur-md border shadow-lg font-bold flex items-center gap-2 ${appIsDark ? 'bg-slate-900/80 border-rose-500/50 text-rose-400' : 'bg-white/80 border-red-500/50 text-red-600'}`}
                    >
                      <Clock size={16} className={fogCountdown <= 3 ? 'animate-pulse' : ''} />
                      {text.fogWarning || 'Fog in'} {fogCountdown}s
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop keyboard hints */}
          <div className={`hidden lg:flex mt-6 text-sm font-mono gap-8 opacity-60 ${t.text}`}>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-widest uppercase opacity-80">Controls</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 border border-current rounded/80 bg-black/5 dark:bg-white/5">W A S D / Arrow Keys</span>
              <span>— Move</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 border border-current rounded/80 bg-black/5 dark:bg-white/5">R</span>
              <span>— Generate New Maze</span>
            </div>
          </div>

          {/* Mobile D-pad */}
          <div className="lg:hidden mt-3 shrink-0">
            <div className="grid grid-cols-3 gap-2">
              <div />
              <ControlButton icon={<ChevronUp size={22} />} onClick={moveUp} />
              <div />
              <ControlButton icon={<ChevronLeft size={22} />} onClick={moveLeft} />
              <ControlButton icon={<ChevronDown size={22} />} onClick={moveDown} />
              <ControlButton icon={<ChevronRight size={22} />} onClick={moveRight} />
            </div>
          </div>
        </div>

        {/* RIGHT: Sidebar (30%) */}
        <aside className={`
          ${showMobileSidebar ? 'translate-x-0' : 'translate-x-[110%]'}
          lg:translate-x-0 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          absolute lg:relative right-2 lg:right-0 top-0 bottom-0 z-30
          w-[360px] lg:w-[400px] shrink-0 flex flex-col py-0 md:py-1
        `}>
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto overflow-x-hidden pr-2 pb-2">

            {/* --- Stats & Mini Map Panel --- */}
            <div className={`p-4 rounded-2xl border shadow-sm backdrop-blur-md flex flex-col gap-3 ${appIsDark ? 'bg-slate-900/60 border-white/5' : 'bg-white/70 border-white'}`}>
              <div className="text-xs uppercase tracking-widest font-bold opacity-50 px-1">{text.stats}</div>
              <div className="flex gap-4 items-center">
                {/* Left: Mini Map */}
                <div className={`w-28 h-28 shrink-0 rounded-xl overflow-hidden border flex items-center justify-center p-1 relative ${appIsDark ? 'border-white/10 bg-black/40' : 'border-black/10 bg-black/5'}`}>
                  {maze.length > 0 && (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="opacity-90">
                      <MazeCanvas
                        maze={maze} cellSize={112 / Math.max(MAZE_WIDTH, MAZE_HEIGHT)}
                        mazeWidth={MAZE_WIDTH} mazeHeight={MAZE_HEIGHT} theme={theme} visitedPath={visitedPath} optimalPath={optimalPath}
                        replayIndex={replayIndex} difficulty={difficulty} gameMode='Classic' fogCountdown={10} playerPos={{ x: 0, y: 0 }}
                      />
                    </div>
                  )}
                </div>

                {/* Right: Info */}
                <div className="flex-1 flex flex-col justify-center gap-2">
                  <div className={`flex justify-between items-center px-3 py-2 rounded-lg ${appIsDark ? 'bg-white/5' : 'bg-black/5'}`}>
                    <span className="text-xs font-bold opacity-70 flex items-center gap-2"><Clock size={12} /> {text.timer}</span>
                    <TimerDisplay startTime={startTime} gameState={gameState} className="font-mono text-sm font-bold tracking-tight" />
                  </div>
                  <div className={`flex justify-between items-center px-3 py-2 rounded-lg ${appIsDark ? 'bg-white/5' : 'bg-black/5'}`}>
                    <span className="text-xs font-bold opacity-70 flex items-center gap-2"><Footprints size={12} /> {text.moves}</span>
                    <span className="font-mono text-sm font-bold">{moves}</span>
                  </div>
                  <div className={`flex justify-between items-center px-3 py-2 rounded-lg ${appIsDark ? 'bg-white/5' : 'bg-black/5'}`}>
                    <span className="text-xs font-bold opacity-70 flex items-center gap-2">{text.level}</span>
                    <span className="font-mono text-sm font-bold uppercase drop-shadow-sm" style={{ color: t.playerColor }}>
                      {text[difficulty.toLowerCase() as 'kids' | 'easy' | 'medium' | 'hard']}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Game Controls --- */}
            <div className={`p-4 rounded-2xl border shadow-sm backdrop-blur-md flex flex-col gap-3 ${appIsDark ? 'bg-slate-900/60 border-white/5' : 'bg-white/70 border-white'}`}>
              <div className="text-xs uppercase tracking-widest font-bold opacity-50 px-1">{text.controls}</div>

              <div className={`flex rounded-xl p-1 gap-1 ${appIsDark ? 'bg-black/40' : 'bg-black/5'}`}>
                {(['Kids', 'Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-lg transition-all duration-300 ${difficulty === d
                      ? 'text-white shadow-md transform scale-100'
                      : appIsDark ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5 scale-95' : 'text-slate-500 hover:text-slate-800 hover:bg-black/5 scale-95'
                      }`}
                    style={difficulty === d ? { background: `linear-gradient(135deg, ${t.playerColor}, ${t.trailColor})` } : undefined}
                  >
                    {text[d.toLowerCase() as 'kids' | 'easy' | 'medium' | 'hard']}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={isFinished ? restartLevel : (gameState === 'playing' ? handleGiveUp : startNewLevel)}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 ${appIsDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}
                  style={gameState === 'playing' ? undefined : { background: `linear-gradient(135deg, ${t.playerColor}, ${t.trailColor})`, color: 'white' }}
                >
                  {gameState === 'playing' ? <HelpCircle size={14} /> : <Play size={14} fill="currentColor" />}
                  {gameState === 'playing' ? text.giveUp : text.start || 'Start'}
                </button>
                <button
                  onClick={startNewLevel}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 ${appIsDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}
                >
                  <RefreshCw size={14} /> {text.newMaze}
                </button>
                <button
                  onClick={isFinished && gameState === 'won' ? (isReplaying ? stopReplay : startReplay) : undefined}
                  disabled={!(isFinished && gameState === 'won')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 ${isFinished && gameState === 'won' ? (appIsDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10') : 'opacity-40 cursor-not-allowed border ' + (appIsDark ? 'border-white/5' : 'border-black/5')}`}
                >
                  <RotateCcw size={14} className={isReplaying ? 'animate-spin' : ''} /> {isReplaying ? text.stopReplay : text.pathReplay}
                </button>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 ${appIsDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}
                >
                  {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />} {text.sound}
                </button>
              </div>
            </div>

            {/* --- Victory Result --- */}
            {isFinished && (
              <div className={`p-5 rounded-2xl border shadow-md flex flex-col gap-3 flex-1 backdrop-blur-md ${appIsDark ? 'bg-slate-900/60 border-white/5' : 'bg-white/70 border-white'}`} style={gameState === 'won' ? { boxShadow: `0 0 30px ${t.playerColor}20`, borderColor: `${t.playerColor}40` } : undefined}>
                {gameState === 'won' ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl text-yellow-500 bg-yellow-500/10">
                        <Trophy className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-xl font-black tracking-wider">{text.cleared}</div>
                      </div>
                    </div>

                    <div className="text-lg font-mono mt-1 opacity-90">{text.timer}: {formatTime(finalTime)}</div>

                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className={`flex justify-between items-center text-sm font-bold border-b pb-1.5 ${appIsDark ? 'border-white/10 text-white/70' : 'border-black/5 text-black/60'}`}>
                        <span>{text.optimal}:</span>
                        <span className="font-mono text-emerald-500">{optLen}</span>
                      </div>
                      <div className={`flex justify-between items-center text-sm font-bold border-b pb-1.5 ${appIsDark ? 'border-white/10 text-white/70' : 'border-black/5 text-black/60'}`}>
                        <span>{text.moves}:</span>
                        <span className="font-mono">{moves}</span>
                      </div>
                      <div className={`flex justify-between items-center text-sm font-bold border-b pb-1.5 ${appIsDark ? 'border-white/10 text-white/70' : 'border-black/5 text-black/60'}`}>
                        <span>{text.efficiency}:</span>
                        <span className="font-mono font-black" style={{ color: efficiency >= 90 ? '#10b981' : efficiency >= 60 ? '#f59e0b' : '#ef4444' }}>{efficiency}%</span>
                      </div>
                      <div className="flex justify-between items-center text-base font-black pt-1">
                        <span>Rating:</span>
                        <span className="uppercase tracking-widest drop-shadow-sm" style={{ color: t.playerColor }}>{rating}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl text-red-500 bg-red-500/10">
                        <Flag className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-xl font-black tracking-wider text-red-500">{text.gaveUp}</div>
                      </div>
                    </div>

                    <div className="text-lg font-mono mt-1 opacity-80">{text.timer}: {formatTime(finalTime)}</div>

                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className={`flex justify-between items-center text-sm font-bold border-b pb-1.5 ${appIsDark ? 'border-white/10 text-white/70' : 'border-black/5 text-black/60'}`}>
                        <span>{text.solutionSteps}:</span>
                        <span className="font-mono text-emerald-500">{optLen}</span>
                      </div>
                      <div className={`flex justify-between items-center text-sm font-bold border-b pb-1.5 ${appIsDark ? 'border-white/10 text-white/70' : 'border-black/5 text-black/60'}`}>
                        <span>{text.moves}:</span>
                        <span className="font-mono">{moves}</span>
                      </div>
                      <div className="flex justify-between items-center text-base font-black pt-1">
                        <span>Rating:</span>
                        <span className="uppercase tracking-widest text-red-500">Lost in Maze</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </aside>
      </div>
      {/* ========== MODALS ========== */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`cursor-pointer fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm`}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`cursor-auto w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden border ${appIsDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(135deg, ${t.playerColor}, ${t.trailColor})` }}>
                    <User size={20} className="text-white drop-shadow-sm" />
                  </div>
                  <div>
                    <h3 className={`font-black text-xl tracking-tight ${appIsDark ? 'text-white' : 'text-slate-900'}`}>
                      {lang === 'zh' ? '你好，玩家！' : 'Welcome, Player!'}
                    </h3>
                    <p className={`text-sm ${appIsDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {lang === 'zh' ? '为自己取个好听的代号吧' : 'Give yourself a cool codename'}
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder={lang === 'zh' ? "留空则作为游客进入..." : "Leave blank to play as Guest..."}
                    className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${appIsDark
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500 placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 placeholder-slate-400'
                      }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        localStorage.setItem('ahamaze_player', playerName.trim());
                        setShowLogin(false);
                      }
                    }}
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogin(false)}
                    className={`flex-1 py-3 rounded-xl font-bold transition-colors ${appIsDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                  >
                    {lang === 'zh' ? '作为游客' : 'Play as Guest'}
                  </button>
                  <button
                    onClick={() => {
                      if (playerName.trim()) {
                        localStorage.setItem('ahamaze_player', playerName.trim());
                      }
                      setShowLogin(false);
                    }}
                    className="flex-1 py-3 rounded-xl font-bold text-white shadow-md transition-opacity hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${t.playerColor}, ${t.trailColor})` }}
                  >
                    {lang === 'zh' ? '保存进入' : 'Save & Play'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showLeaderboard && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm`}
            onClick={() => setShowLeaderboard(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden border flex flex-col max-h-[80vh] ${appIsDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`p-5 border-b flex items-center justify-between ${appIsDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2">
                  <BarChart3 className={appIsDark ? 'text-amber-400' : 'text-amber-500'} size={20} />
                  <h3 className={`font-black tracking-tight text-lg ${appIsDark ? 'text-white' : 'text-slate-900'}`}>
                    {lang === 'zh' ? '排行榜' : 'Leaderboard'}
                  </h3>
                </div>
                <button onClick={() => setShowLeaderboard(false)} className={`p-1.5 rounded-lg ${appIsDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-black/5 text-slate-500'}`}>
                  <VolumeX size={18} />
                </button>
              </div>

              {/* Filters */}
              <div className={`p-3 flex gap-2 border-b ${appIsDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                <select
                  value={leaderboardMode}
                  onChange={(e) => setLeaderboardMode(e.target.value as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold border outline-none ${appIsDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                >
                  <option value="Classic">{lang === 'zh' ? '经典' : 'Classic'}</option>
                  <option value="Challenge">{lang === 'zh' ? '挑战' : 'Challenge'}</option>
                </select>
                <select
                  value={leaderboardDiff}
                  onChange={(e) => setLeaderboardDiff(e.target.value as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold border outline-none ${appIsDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                >
                  <option value="Kids">{lang === 'zh' ? '儿童' : 'Kids'}</option>
                  <option value="Easy">{lang === 'zh' ? '简单' : 'Easy'}</option>
                  <option value="Medium">{lang === 'zh' ? '中等' : 'Medium'}</option>
                  <option value="Hard">{lang === 'zh' ? '困难' : 'Hard'}</option>
                </select>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-2">
                {(() => {
                  const filtered = leaderboardData
                    .filter(r => r.difficulty === leaderboardDiff && r.mode === leaderboardMode)
                    .sort((a, b) => a.time - b.time || a.moves - b.moves)
                    .slice(0, 50);

                  if (filtered.length === 0) {
                    return (
                      <div className={`py-12 text-center text-sm font-mono ${appIsDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {lang === 'zh' ? '暂无记录' : 'No records yet'}
                      </div>
                    );
                  }

                  return filtered.map((r, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl mb-1 ${i === 0 ? (appIsDark ? 'bg-amber-900/20' : 'bg-amber-50') : (appIsDark ? 'hover:bg-white/5' : 'hover:bg-slate-50')
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 text-center font-black ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-400' : (appIsDark ? 'text-slate-600' : 'text-slate-400')}`}>
                          #{i + 1}
                        </div>
                        <div>
                          <div className={`font-bold text-sm ${appIsDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {r.name.substring(0, 15)}
                          </div>
                          <div className={`text-[10px] font-mono opacity-60 ${appIsDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {new Date(r.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-mono font-bold ${appIsDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          {formatTime(r.time)}
                        </div>
                        <div className={`text-[10px] font-mono ${appIsDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {r.moves} {lang === 'zh' ? '步' : 'steps'}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
