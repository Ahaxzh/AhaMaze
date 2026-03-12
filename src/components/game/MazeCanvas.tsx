import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Cell } from '../../utils/maze';
import { Position } from '../../types/game';
import { Theme, Difficulty, GameMode, Language } from '../../types/game';
import { THEME_CONFIGS } from '../../constants/game';

interface MazeCanvasProps {
  maze: Cell[][]; cellSize: number; mazeWidth: number; mazeHeight: number;
  theme: Theme; visitedPath: Position[]; optimalPath: Position[]; replayIndex: number;
  difficulty: Difficulty; gameMode: GameMode; fogCountdown: number; playerPos: Position;
}

export const MazeCanvas = React.memo(function MazeCanvas({
  maze, cellSize, mazeWidth, mazeHeight, theme, visitedPath, optimalPath, replayIndex, difficulty, gameMode, fogCountdown, playerPos
}: MazeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelWidth = Math.round(mazeWidth * cellSize);
  const pixelHeight = Math.round(mazeHeight * cellSize);
  const t = THEME_CONFIGS[theme];
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const isKidsMode = difficulty === 'Kids';

  // Offscreen render targets for caching static layers to reach 120fps
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Static Layout Cache (Walls, Background, Start/End Markers)
  // Only re-runs when the maze structure or theme actually changes
  useEffect(() => {
    if (maze.length === 0 || pixelWidth === 0 || pixelHeight === 0) return;

    if (!bgCanvasRef.current) {
      bgCanvasRef.current = document.createElement('canvas');
    }
    const bgCanvas = bgCanvasRef.current;
    bgCanvas.width = pixelWidth * dpr;
    bgCanvas.height = pixelHeight * dpr;

    const ctx = bgCanvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0.5, 0.5);
    ctx.clearRect(-1, -1, pixelWidth + 2, pixelHeight + 2);

    ctx.fillStyle = t.cellBgColor || t.bg;
    ctx.fillRect(0, 0, pixelWidth, pixelHeight);

    const glowOffset = cellSize * 0.1;
    const glowSize = cellSize * 0.8;
    ctx.fillStyle = t.startGlow || 'rgba(0,0,0,0.1)';
    ctx.fillRect(glowOffset, glowOffset, glowSize, glowSize);

    if (isKidsMode) {
      ctx.save();
      const endCx = (mazeWidth - 1) * cellSize + cellSize / 2;
      const endCy = (mazeHeight - 1) * cellSize + cellSize / 2;
      ctx.translate(endCx - cellSize * 0.25, endCy - cellSize * 0.25);
      ctx.scale(cellSize * 0.05, cellSize * 0.05);
      ctx.fillStyle = t.endColor;
      ctx.beginPath();
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

    ctx.strokeStyle = t.wallColor;
    const baseLineWidth = Math.max(1, cellSize * 0.08);
    ctx.lineWidth = baseLineWidth;
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

    ctx.lineWidth = baseLineWidth;
    const offset = baseLineWidth / 2;
    ctx.strokeRect(offset, offset, pixelWidth - baseLineWidth, pixelHeight - baseLineWidth);

    if (t.cornerDot && t.cornerDot !== 'transparent') {
      ctx.fillStyle = t.cornerDot;
      const dotSize = Math.max(0.5, cellSize * 0.06);
      for (let y = 0; y <= rows; y++) {
        for (let x = 0; x <= cols; x++) {
          if ((x === 0 || x === cols) && (y === 0 || y === rows)) continue;
          ctx.fillRect(x * cellSize - dotSize / 2, y * cellSize - dotSize / 2, dotSize, dotSize);
        }
      }
    }
  }, [maze, cellSize, mazeWidth, mazeHeight, theme, t, dpr, pixelWidth, pixelHeight, isKidsMode]);

  // 2. Initialize or resize Fog Canvas once per maze size change
  // Prevents horrible GC pauses caused by creating a <canvas> 60+ times a second
  useEffect(() => {
    if (gameMode !== 'Challenge') return;
    if (pixelWidth === 0 || pixelHeight === 0) return;

    if (!fogCanvasRef.current) {
      fogCanvasRef.current = document.createElement('canvas');
    }
    fogCanvasRef.current.width = pixelWidth * dpr;
    fogCanvasRef.current.height = pixelHeight * dpr;
  }, [pixelWidth, pixelHeight, gameMode, dpr]);

  // 3. Main Fast-Render Loop (Draws cached objects and dynamic paths/fog)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || maze.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // We do NOT clear the whole canvas if we can avoid it, but we need to redraw
    // everything. However, using drawImage is extremely fast compared to loops.
    ctx.setTransform(dpr, 0, 0, dpr, 0.5, 0.5);
    ctx.clearRect(-1, -1, pixelWidth + 2, pixelHeight + 2);

    // Blit the static background (walls, colors, ends) in exactly 1 draw call
    if (bgCanvasRef.current) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to draw cached image 1:1
      ctx.drawImage(bgCanvasRef.current, 0, 0, pixelWidth * dpr, pixelHeight * dpr, 0, 0, pixelWidth * dpr + 1.5, pixelHeight * dpr + 1.5);
      ctx.restore();
    }

    // Dynamic Paths
    const pathToDraw = replayIndex >= 0 ? visitedPath.slice(0, replayIndex + 1) : visitedPath;
    if (pathToDraw.length > 1) {
      if (isKidsMode) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = Math.max(2, cellSize * 0.35);
        ctx.beginPath();
        for (let i = 1; i < pathToDraw.length; i++) {
          const hue = (i * 12) % 360;
          ctx.strokeStyle = `hsla(${hue}, 80%, 65%, 0.6)`;
          const p1 = pathToDraw[i - 1]; const p2 = pathToDraw[i];
          ctx.moveTo(p1.x * cellSize + cellSize / 2, p1.y * cellSize + cellSize / 2);
          ctx.lineTo(p2.x * cellSize + cellSize / 2, p2.y * cellSize + cellSize / 2);
          ctx.stroke();
          ctx.beginPath(); // Next segment
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

    // Dynamic Fog
    if (gameMode === 'Challenge' && fogCountdown === 0 && !!fogCanvasRef.current) {
      // We use destination-in on the main canvas so the fog cutouts reveal the maze underneath
      // But the fog needs an opaque layer over everything else. 
      // 1. We draw an opaque rect matching the ambient color.
      // Wait, if it's over everything, we can just do traditional approach but use the persistent fogCanvas.

      const fogCanvas = fogCanvasRef.current;
      const ftx = fogCanvas.getContext('2d');
      if (ftx) {
        // Fill fog with the dark/light ambiance color
        ftx.setTransform(dpr, 0, 0, dpr, 0.5, 0.5);
        ftx.clearRect(-1, -1, pixelWidth + 2, pixelHeight + 2);
        ftx.globalCompositeOperation = 'source-over';
        ftx.fillStyle = t.ambience === 'dark' ? 'rgba(0, 0, 0, 0.98)' : 'rgba(255, 255, 255, 0.98)';
        if (theme === 'Princess') ftx.fillStyle = 'rgba(255, 240, 245, 0.98)';
        ftx.fillRect(-1, -1, pixelWidth + 2, pixelHeight + 2);

        // Carve out holes with destination-out
        ftx.globalCompositeOperation = 'destination-out';
        ftx.filter = `blur(${cellSize * 1.2}px)`;

        // Important: destination-out makes pixels transparent wherever we draw. 
        // So we draw opaque black (color doesn't matter, just needs alpha 1).
        ftx.fillStyle = 'rgba(0,0,0,1)';
        ftx.strokeStyle = 'rgba(0,0,0,1)';

        if (visitedPath.length > 0) {
          ftx.beginPath();
          ftx.lineWidth = cellSize * 4.5;
          ftx.lineCap = 'round';
          ftx.lineJoin = 'round';
          ftx.moveTo(visitedPath[0].x * cellSize + cellSize / 2, visitedPath[0].y * cellSize + cellSize / 2);
          for (let i = 1; i < visitedPath.length; i++) {
            ftx.lineTo(visitedPath[i].x * cellSize + cellSize / 2, visitedPath[i].y * cellSize + cellSize / 2);
          }
          ftx.stroke();
        }

        const fpx = playerPos.x * cellSize + cellSize / 2;
        const fpy = playerPos.y * cellSize + cellSize / 2;
        ftx.beginPath();
        ftx.arc(fpx, fpy, cellSize * 3.5, 0, Math.PI * 2);
        ftx.fill();

        // Permanent small holes at start/end
        // We use standard fill style alpha since destination-out considers the alpha channel.
        ftx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ftx.beginPath(); ftx.arc(cellSize / 2, cellSize / 2, cellSize * 1.5, 0, Math.PI * 2); ftx.fill();
        const fendCx = (mazeWidth - 1) * cellSize + cellSize / 2;
        const fendCy = (mazeHeight - 1) * cellSize + cellSize / 2;
        ftx.beginPath(); ftx.arc(fendCx, fendCy, cellSize * 1.5, 0, Math.PI * 2); ftx.fill();

        // Reset composite state for next frame
        ftx.globalCompositeOperation = 'source-over';
        ftx.filter = 'none';
      }

      // Draw the fully prepared fog mask over the main canvas
      ctx.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(fogCanvas, 0, 0, pixelWidth * dpr, pixelHeight * dpr, 0, 0, pixelWidth * dpr, pixelHeight * dpr);
      ctx.restore();
    }

  }, [maze.length, pixelWidth, pixelHeight, visitedPath, optimalPath, replayIndex, t.trailColor, t.playerColor, t.ambience, t.endColor, theme, dpr, cellSize, mazeWidth, mazeHeight, isKidsMode, gameMode, fogCountdown, playerPos]);

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

export const Player = React.memo(function Player({ position, size, theme, isKidsMode, playerEmoji }: { position: Position; size: number; theme: Theme; isKidsMode: boolean; playerEmoji: string }) {
  const t = THEME_CONFIGS[theme];
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
        >{playerEmoji}</motion.div>
      ) : (
        <div className="rounded-full shadow-lg relative" style={{ width: size * 0.5, height: size * 0.5, backgroundColor: t.playerColor }}>
          <div className="absolute inset-0 rounded-full bg-white opacity-60 blur-[1px]" />
        </div>
      )}
    </motion.div>
  );
});

export const EndMarkerPulse = React.memo(function EndMarkerPulse({ mazeWidth, mazeHeight, cellSize, theme, isKidsMode }: { mazeWidth: number; mazeHeight: number; cellSize: number; theme: Theme; isKidsMode: boolean }) {
  const t = THEME_CONFIGS[theme];
  return (
    <div className="absolute z-10 flex items-center justify-center pointer-events-none" style={{ left: (mazeWidth - 1) * cellSize, top: (mazeHeight - 1) * cellSize, width: cellSize, height: cellSize }}>
      {isKidsMode ? (
        <motion.div animate={{ scale: [1, 1.25, 1], rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 1.2 }} className="drop-shadow-md" style={{ fontSize: cellSize * 0.6 }}>
          💖
        </motion.div>
      ) : (
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="rounded-full shadow-lg" style={{ width: cellSize * 0.5, height: cellSize * 0.5, backgroundColor: t.endColor }} />
      )}
    </div>
  );
});

export function downloadMazeImage(
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
  const t = THEME_CONFIGS[theme];

  const canvas = document.createElement('canvas');
  canvas.width = totalW; canvas.height = totalH;
  const ctx = canvas.getContext('2d')!;

  // We are missing bgRaw in THEME_CONFIGS. We can fallback or derive from bg.
  ctx.fillStyle = t.bg || '#ffffff'; ctx.fillRect(0, 0, totalW, totalH);
  ctx.save(); ctx.translate(padding, padding - 20);
  ctx.fillStyle = t.playerColor; ctx.font = 'bold 18px Inter, sans-serif';
  ctx.fillText('AhaMaze', 0, -10);
  ctx.fillStyle = t.ambience === 'light' ? '#475569' : '#94a3b8';
  ctx.font = '12px "JetBrains Mono", monospace';
  const diffLabel = lang === 'zh' ? { Kids: '儿童', Easy: '简单', Medium: '中等', Hard: '困难' }[difficulty] : difficulty;
  ctx.fillText(`Level ${level} | ${diffLabel} ${mazeWidth}x${mazeHeight}`, 100, -10);
  ctx.translate(0, 20);

  ctx.fillStyle = t.cellBgColor || t.bg; ctx.fillRect(0, 0, w, h);

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
  ctx.fillStyle = t.startGlow || 'rgba(0,0,0,0.1)'; ctx.fillRect(1, 1, exportCellSize - 2, exportCellSize - 2);
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
