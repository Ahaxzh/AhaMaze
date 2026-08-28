import React, { useEffect, useRef } from 'react';
import { Cell } from '../../utils/maze';
import { Position } from '../../types/game';
import { Theme, Difficulty, GameMode, Language } from '../../types/game';
import { THEME_CONFIGS, STORY_MATCH_MAP } from '../../constants/game';

interface MazeCanvasProps {
  maze: Cell[][];
  cellSize: number;
  mazeWidth: number;
  mazeHeight: number;
  theme: Theme;
  visitedPath: Position[];
  optimalPath: Position[];
  replayIndex: number;
  difficulty: Difficulty;
  gameMode: GameMode;
  fogCountdown: number;
  playerPos: Position;
  playerEmoji?: string;
}

export const MazeCanvas = React.memo(function MazeCanvas({
  maze,
  cellSize,
  mazeWidth,
  mazeHeight,
  theme,
  visitedPath,
  optimalPath,
  replayIndex,
  difficulty,
  gameMode,
  fogCountdown,
  playerPos,
  playerEmoji,
}: MazeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelWidth = Math.round(mazeWidth * cellSize);
  const pixelHeight = Math.round(mazeHeight * cellSize);
  const t = THEME_CONFIGS[theme];
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const canvasPadding = 2; // Extra padding to prevent border clipping
  const isKidsMode = difficulty === 'Kids';
  const isFogActive = gameMode === 'Challenge' && fogCountdown === 0;

  // Offscreen render targets for caching static layers
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
    bgCanvas.width = (pixelWidth + canvasPadding * 2) * dpr;
    bgCanvas.height = (pixelHeight + canvasPadding * 2) * dpr;

    const ctx = bgCanvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, canvasPadding * dpr + 0.5, canvasPadding * dpr + 0.5);
    ctx.clearRect(-1, -1, pixelWidth + 2, pixelHeight + 2);

    ctx.fillStyle = t.cellBgColor || t.bg;
    ctx.fillRect(0, 0, pixelWidth, pixelHeight);

    const glowOffset = cellSize * 0.1;
    const glowSize = cellSize * 0.8;
    ctx.fillStyle = t.startGlow || 'rgba(0,0,0,0.1)';
    ctx.fillRect(glowOffset, glowOffset, glowSize, glowSize);

    // End destination base tile glow
    const endX = (mazeWidth - 1) * cellSize;
    const endY = (mazeHeight - 1) * cellSize;
    ctx.fillStyle = isKidsMode
      ? 'rgba(251, 113, 133, 0.22)'
      : t.startGlow || 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(endX + glowOffset, endY + glowOffset, glowSize, glowSize);

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
        if (cell.walls.top) {
          ctx.moveTo(px, py);
          ctx.lineTo(px + cellSize, py);
        }
        if (cell.walls.right) {
          ctx.moveTo(px + cellSize, py);
          ctx.lineTo(px + cellSize, py + cellSize);
        }
        if (cell.walls.bottom) {
          ctx.moveTo(px, py + cellSize);
          ctx.lineTo(px + cellSize, py + cellSize);
        }
        if (cell.walls.left) {
          ctx.moveTo(px, py);
          ctx.lineTo(px, py + cellSize);
        }
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
  useEffect(() => {
    if (gameMode !== 'Challenge') return;
    if (pixelWidth === 0 || pixelHeight === 0) return;

    if (!fogCanvasRef.current) {
      fogCanvasRef.current = document.createElement('canvas');
    }
    fogCanvasRef.current.width = (pixelWidth + canvasPadding * 2) * dpr;
    fogCanvasRef.current.height = (pixelHeight + canvasPadding * 2) * dpr;
  }, [pixelWidth, pixelHeight, gameMode, dpr]);

  // 3. Main Fast-Render Loop (Draws cached objects and dynamic paths/fog)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || maze.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, canvasPadding * dpr + 0.5, canvasPadding * dpr + 0.5);
    ctx.clearRect(
      -canvasPadding - 1,
      -canvasPadding - 1,
      pixelWidth + canvasPadding * 2 + 2,
      pixelHeight + canvasPadding * 2 + 2
    );

    // Blit the static background (walls, colors, ends)
    if (bgCanvasRef.current) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(
        bgCanvasRef.current,
        0,
        0,
        (pixelWidth + canvasPadding * 2) * dpr,
        (pixelHeight + canvasPadding * 2) * dpr,
        0,
        0,
        (pixelWidth + canvasPadding * 2) * dpr,
        (pixelHeight + canvasPadding * 2) * dpr
      );
      ctx.restore();
    }

    const isNyanCat = playerEmoji === '🌈🐱' || playerEmoji === '🐱';

    // Dynamic Paths - Draw directly to context with sub-pixel alignment
    const pathToDraw = replayIndex >= 0 ? visitedPath.slice(0, replayIndex + 1) : visitedPath;
    const pathLen = pathToDraw.length;
    if (pathLen > 1) {
      if (isNyanCat) {
        // 🌈 Authentic 6-Stripe Nyan Cat Rainbow Ribbon 🌈
        const NYAN_STRIPES = [
          '#ff0000', // Red
          '#ff9900', // Orange
          '#ffff00', // Yellow
          '#33ff00', // Green
          '#0099ff', // Blue
          '#6633ff', // Purple
        ];
        const totalRibbonWidth = Math.max(4, cellSize * 0.46);
        const stripeThickness = totalRibbonWidth / NYAN_STRIPES.length;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
        ctx.lineWidth = stripeThickness;

        for (let sIdx = 0; sIdx < NYAN_STRIPES.length; sIdx++) {
          const color = NYAN_STRIPES[sIdx];
          const offset = (sIdx - 2.5) * stripeThickness;
          ctx.strokeStyle = color;
          ctx.beginPath();

          for (let i = 0; i < pathLen - 1; i++) {
            const p1 = pathToDraw[i];
            const p2 = pathToDraw[i + 1];
            const x1 = p1.x * cellSize + cellSize / 2;
            const y1 = p1.y * cellSize + cellSize / 2;
            const x2 = p2.x * cellSize + cellSize / 2;
            const y2 = p2.y * cellSize + cellSize / 2;

            if (p1.x !== p2.x) {
              // Horizontal movement: vertical stripe offset
              ctx.moveTo(x1, y1 + offset);
              ctx.lineTo(x2, y2 + offset);
            } else {
              // Vertical movement: horizontal stripe offset
              ctx.moveTo(x1 + offset, y1);
              ctx.lineTo(x2 + offset, y2);
            }
          }
          ctx.stroke();
        }

        // Draw sparkle stars along the rainbow trail
        ctx.font = `${Math.floor(cellSize * 0.35)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 1; i < pathLen - 1; i += 3) {
          const sp = pathToDraw[i];
          const sx = sp.x * cellSize + cellSize / 2;
          const sy = sp.y * cellSize + cellSize / 2;
          ctx.fillText('✨', sx, sy);
        }
      } else if (isKidsMode) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = Math.max(2, cellSize * 0.35);
        // Batch segments into max 10 color transitions to minimize draw calls
        const batchSize = Math.max(1, Math.ceil(pathLen / 10));
        for (let i = 1; i < pathLen; i += batchSize) {
          const endIdx = Math.min(i + batchSize, pathLen);
          const hue = (i * 18) % 360;
          ctx.strokeStyle = `hsla(${hue}, 80%, 65%, 0.7)`;
          ctx.beginPath();
          ctx.moveTo(pathToDraw[i - 1].x * cellSize + cellSize / 2, pathToDraw[i - 1].y * cellSize + cellSize / 2);
          for (let j = i; j < endIdx; j++) {
            ctx.lineTo(pathToDraw[j].x * cellSize + cellSize / 2, pathToDraw[j].y * cellSize + cellSize / 2);
          }
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.strokeStyle = t.trailColor;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = Math.max(1.5, cellSize * 0.3);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const s = pathToDraw[0];
        ctx.moveTo(s.x * cellSize + cellSize / 2, s.y * cellSize + cellSize / 2);
        for (let i = 1; i < pathLen; i++) {
          const p = pathToDraw[i];
          ctx.lineTo(p.x * cellSize + cellSize / 2, p.y * cellSize + cellSize / 2);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // Replay indicator head
    if (replayIndex >= 0 && replayIndex < visitedPath.length) {
      const head = visitedPath[replayIndex];
      const px = head.x * cellSize + cellSize / 2;
      const py = head.y * cellSize + cellSize / 2;
      if (isNyanCat) {
        ctx.font = `${Math.floor(cellSize * 0.8)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐱', px, py + cellSize * 0.05);
      } else if (isKidsMode) {
        ctx.font = `${Math.floor(cellSize * 0.7)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
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

    // Optimal Path on win/giveup
    if (optimalPath.length > 0 && replayIndex < 0) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.8)';
      const optRadius = Math.max(1.2, cellSize * 0.12);
      for (const p of optimalPath) {
        if (p.x === 0 && p.y === 0) continue;
        if (p.x === mazeWidth - 1 && p.y === mazeHeight - 1) continue;
        ctx.beginPath();
        ctx.arc(p.x * cellSize + cellSize / 2, p.y * cellSize + cellSize / 2, optRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // High-performance Fog of War (Hardware-accelerated corridor + radial spotlight)
    const isFogActive = gameMode === 'Challenge' && fogCountdown === 0;
    if (isFogActive && !!fogCanvasRef.current) {
      const fogCanvas = fogCanvasRef.current;
      const ftx = fogCanvas.getContext('2d');
      if (ftx) {
        ftx.setTransform(dpr, 0, 0, dpr, canvasPadding * dpr + 0.5, canvasPadding * dpr + 0.5);
        ftx.clearRect(
          -canvasPadding - 1,
          -canvasPadding - 1,
          pixelWidth + canvasPadding * 2 + 2,
          pixelHeight + canvasPadding * 2 + 2
        );

        // Fill fog layer
        ftx.globalCompositeOperation = 'source-over';
        ftx.fillStyle =
          t.ambience === 'dark'
            ? 'rgba(2, 6, 23, 0.98)'
            : theme === 'Princess'
            ? 'rgba(255, 240, 245, 0.98)'
            : 'rgba(255, 255, 255, 0.98)';
        ftx.fillRect(
          -canvasPadding,
          -canvasPadding,
          pixelWidth + canvasPadding * 2,
          pixelHeight + canvasPadding * 2
        );

        // Cut out smooth visibility with destination-out
        ftx.globalCompositeOperation = 'destination-out';

        // 1. Trail corridor cutouts via single fast stroked path (Ultra-lightweight on GPU)
        if (visitedPath.length > 1) {
          ftx.beginPath();
          ftx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
          ftx.lineWidth = cellSize * 2.2;
          ftx.lineCap = 'round';
          ftx.lineJoin = 'round';
          ftx.moveTo(visitedPath[0].x * cellSize + cellSize / 2, visitedPath[0].y * cellSize + cellSize / 2);
          const vLen = visitedPath.length;
          const stride = vLen > 60 ? 2 : 1;
          for (let i = 1; i < vLen; i += stride) {
            ftx.lineTo(visitedPath[i].x * cellSize + cellSize / 2, visitedPath[i].y * cellSize + cellSize / 2);
          }
          if ((vLen - 1) % stride !== 0) {
            ftx.lineTo(visitedPath[vLen - 1].x * cellSize + cellSize / 2, visitedPath[vLen - 1].y * cellSize + cellSize / 2);
          }
          ftx.stroke();
        }

        // 2. Large vision spotlight around player
        const fpx = playerPos.x * cellSize + cellSize / 2;
        const fpy = playerPos.y * cellSize + cellSize / 2;
        const playerRadius = cellSize * 3.8;
        const pGrad = ftx.createRadialGradient(fpx, fpy, cellSize * 0.8, fpx, fpy, playerRadius);
        pGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
        pGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.8)');
        pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ftx.fillStyle = pGrad;
        ftx.beginPath();
        ftx.arc(fpx, fpy, playerRadius, 0, Math.PI * 2);
        ftx.fill();

        // 3. Permanent visible spots at start & end
        const startEndRadius = cellSize * 1.6;
        const sGrad = ftx.createRadialGradient(cellSize / 2, cellSize / 2, cellSize * 0.3, cellSize / 2, cellSize / 2, startEndRadius);
        sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
        sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ftx.fillStyle = sGrad;
        ftx.beginPath();
        ftx.arc(cellSize / 2, cellSize / 2, startEndRadius, 0, Math.PI * 2);
        ftx.fill();

        const fendCx = (mazeWidth - 1) * cellSize + cellSize / 2;
        const fendCy = (mazeHeight - 1) * cellSize + cellSize / 2;
        const eGrad = ftx.createRadialGradient(fendCx, fendCy, cellSize * 0.3, fendCx, fendCy, startEndRadius);
        eGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
        eGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ftx.fillStyle = eGrad;
        ftx.beginPath();
        ftx.arc(fendCx, fendCy, startEndRadius, 0, Math.PI * 2);
        ftx.fill();

        // Reset composite mode
        ftx.globalCompositeOperation = 'source-over';
      }

      // Draw the fog mask onto main canvas
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(
        fogCanvas,
        0,
        0,
        (pixelWidth + canvasPadding * 2) * dpr,
        (pixelHeight + canvasPadding * 2) * dpr,
        0,
        0,
        (pixelWidth + canvasPadding * 2) * dpr,
        (pixelHeight + canvasPadding * 2) * dpr
      );
      ctx.restore();
    }
  }, [
    maze.length,
    pixelWidth,
    pixelHeight,
    visitedPath,
    optimalPath,
    replayIndex,
    t,
    theme,
    dpr,
    cellSize,
    mazeWidth,
    mazeHeight,
    isKidsMode,
    playerEmoji,
    gameMode,
    isFogActive,
    playerPos,
  ]);

  return (
    <canvas
      className="absolute pointer-events-none"
      ref={canvasRef}
      width={(pixelWidth + canvasPadding * 2) * dpr}
      height={(pixelHeight + canvasPadding * 2) * dpr}
      style={{
        width: pixelWidth + canvasPadding * 2,
        height: pixelHeight + canvasPadding * 2,
        left: -canvasPadding,
        top: -canvasPadding,
      }}
    />
  );
});

export const Player = React.memo(function Player({
  position,
  size,
  theme,
  isKidsMode,
  playerEmoji,
  facing = 'right',
}: {
  position: Position;
  size: number;
  theme: Theme;
  isKidsMode: boolean;
  playerEmoji: string;
  facing?: 'left' | 'right';
}) {
  const t = THEME_CONFIGS[theme];
  const isFlipped = isKidsMode && facing === 'left';

  return (
    <div
      className="absolute z-20 flex items-center justify-center pointer-events-none"
      style={{
        width: size,
        height: size,
        top: 0,
        left: 0,
        transform: `translate3d(${position.x * size}px, ${position.y * size}px, 0)`,
        transition: 'transform 48ms cubic-bezier(0.1, 0, 0.1, 1)',
        willChange: 'transform',
      }}
    >
      {isKidsMode ? (
        <div
          className="select-none flex items-center justify-center transition-transform duration-100"
          style={{
            fontSize: `${size * 0.75}px`,
            lineHeight: 1,
            transform: isFlipped ? 'scaleX(-1)' : 'scaleX(1)',
          }}
        >
          {playerEmoji}
        </div>
      ) : (
        <div
          className="rounded-full shadow-md relative"
          style={{
            width: size * 0.52,
            height: size * 0.52,
            backgroundColor: t.playerColor,
          }}
        >
          <div className="absolute inset-0 rounded-full border border-white/50" />
        </div>
      )}
    </div>
  );
});

export const EndMarkerPulse = React.memo(function EndMarkerPulse({
  mazeWidth,
  mazeHeight,
  cellSize,
  theme,
  isKidsMode,
  playerEmoji,
}: {
  mazeWidth: number;
  mazeHeight: number;
  cellSize: number;
  theme: Theme;
  isKidsMode: boolean;
  playerEmoji?: string;
}) {
  const t = THEME_CONFIGS[theme];

  // Kids mode goal icon: Match story goal from player emoji or fallback by theme
  const matchedStory = playerEmoji ? STORY_MATCH_MAP[playerEmoji] : null;
  const kidGoalEmoji =
    matchedStory?.goal ||
    (theme === 'Princess'
      ? '🏰' // Magical Castle
      : theme === 'Starry'
      ? '🌟' // Shining Super Star
      : '🏆'); // Victory Trophy

  return (
    <div
      className="absolute z-10 flex items-center justify-center pointer-events-none"
      style={{
        left: (mazeWidth - 1) * cellSize,
        top: (mazeHeight - 1) * cellSize,
        width: cellSize,
        height: cellSize,
      }}
    >
      {isKidsMode ? (
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Pulsing magical beacon aura ring */}
          <div
            className="absolute rounded-full animate-beacon-wave pointer-events-none"
            style={{
              width: cellSize * 1.1,
              height: cellSize * 1.1,
              backgroundColor: t.endColor,
              opacity: 0.35,
            }}
          />
          {/* Animated Goal Icon */}
          <div
            className="relative z-10 animate-float-gentle select-none flex items-center justify-center"
            style={{
              fontSize: `${Math.max(16, cellSize * 0.72)}px`,
              lineHeight: 1,
            }}
          >
            {kidGoalEmoji}
          </div>
        </div>
      ) : theme === 'Retro' ? (
        <div className="relative flex items-center justify-center w-full h-full">
          <div
            className="absolute rounded-full animate-beacon-wave"
            style={{
              width: cellSize * 0.9,
              height: cellSize * 0.9,
              backgroundColor: t.endColor,
              opacity: 0.4,
            }}
          />
          <div
            className="relative z-10 animate-float-gentle select-none"
            style={{ fontSize: `${Math.max(14, cellSize * 0.65)}px`, lineHeight: 1 }}
          >
            🏁
          </div>
        </div>
      ) : (
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Expanding Radar / Pulse Ring */}
          <div
            className="absolute rounded-full animate-beacon-wave"
            style={{
              width: cellSize * 0.9,
              height: cellSize * 0.9,
              backgroundColor: t.endColor,
              opacity: 0.35,
            }}
          />
          {/* Target Glowing Center Orb */}
          <div
            className="relative rounded-full animate-pulse-soft flex items-center justify-center shadow-md"
            style={{
              width: cellSize * 0.46,
              height: cellSize * 0.46,
              backgroundColor: t.endColor,
            }}
          >
            <div
              className="rounded-full bg-white opacity-85"
              style={{
                width: cellSize * 0.16,
                height: cellSize * 0.16,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export function downloadMazeImage(
  maze: Cell[][],
  visitedPath: Position[],
  optimalPath: Position[],
  theme: Theme,
  mazeWidth: number,
  mazeHeight: number,
  moves: number,
  finalTime: number,
  level: number,
  difficulty: Difficulty,
  lang: Language
) {
  const exportCellSize = 16;
  const padding = 60;
  const statsHeight = 100;
  const drawPadding = 4;
  const w = mazeWidth * exportCellSize;
  const h = mazeHeight * exportCellSize;
  const totalW = w + padding * 2 + drawPadding * 2;
  const totalH = h + padding + statsHeight + drawPadding * 2;
  const t = THEME_CONFIGS[theme];

  const canvas = document.createElement('canvas');
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = t.bgRaw || '#ffffff';
  ctx.fillRect(0, 0, totalW, totalH);
  ctx.save();
  ctx.translate(padding + drawPadding, padding + drawPadding - 20);
  ctx.fillStyle = t.playerColor;
  ctx.font = 'bold 18px Inter, sans-serif';
  ctx.fillText('AhaMaze', 0, -10);
  ctx.fillStyle = t.ambience === 'light' ? '#475569' : '#94a3b8';
  ctx.font = '12px "JetBrains Mono", monospace';
  const diffLabel =
    lang === 'zh'
      ? { Kids: '儿童', Easy: '简单', Medium: '中等', Hard: '困难' }[difficulty]
      : difficulty;
  ctx.fillText(`Level ${level} | ${diffLabel} ${mazeWidth}x${mazeHeight}`, 100, -10);
  ctx.translate(0, 20);

  ctx.fillStyle = t.cellBgColor || t.bgRaw || '#ffffff';
  ctx.fillRect(0, 0, w, h);

  if (visitedPath.length > 1) {
    if (difficulty === 'Kids') {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(2, exportCellSize * 0.35);
      for (let i = 1; i < visitedPath.length; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${(i * 12) % 360}, 80%, 65%, 0.8)`;
        ctx.moveTo(
          visitedPath[i - 1].x * exportCellSize + exportCellSize / 2,
          visitedPath[i - 1].y * exportCellSize + exportCellSize / 2
        );
        ctx.lineTo(
          visitedPath[i].x * exportCellSize + exportCellSize / 2,
          visitedPath[i].y * exportCellSize + exportCellSize / 2
        );
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.strokeStyle = t.trailColor;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = Math.max(2, exportCellSize / 4);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(
        visitedPath[0].x * exportCellSize + exportCellSize / 2,
        visitedPath[0].y * exportCellSize + exportCellSize / 2
      );
      for (let i = 1; i < visitedPath.length; i++) {
        ctx.lineTo(
          visitedPath[i].x * exportCellSize + exportCellSize / 2,
          visitedPath[i].y * exportCellSize + exportCellSize / 2
        );
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  if (optimalPath.length > 0) {
    ctx.fillStyle = 'rgba(250, 204, 21, 0.8)';
    for (const p of optimalPath) {
      if (p.x === 0 && p.y === 0) continue;
      if (p.x === mazeWidth - 1 && p.y === mazeHeight - 1) continue;
      ctx.beginPath();
      ctx.arc(
        p.x * exportCellSize + exportCellSize / 2,
        p.y * exportCellSize + exportCellSize / 2,
        2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  ctx.fillStyle = t.startGlow || 'rgba(0,0,0,0.1)';
  ctx.fillRect(1, 1, exportCellSize - 2, exportCellSize - 2);
  ctx.fillStyle = t.endColor;
  ctx.beginPath();
  ctx.arc(
    (mazeWidth - 1) * exportCellSize + exportCellSize / 2,
    (mazeHeight - 1) * exportCellSize + exportCellSize / 2,
    exportCellSize * 0.25,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.strokeStyle = t.wallColor;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'square';
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < (maze[0]?.length ?? 0); x++) {
      const cell = maze[y][x];
      const px = x * exportCellSize;
      const py = y * exportCellSize;
      if (cell.walls.top) {
        ctx.moveTo(px, py);
        ctx.lineTo(px + exportCellSize, py);
      }
      if (cell.walls.right) {
        ctx.moveTo(px + exportCellSize, py);
        ctx.lineTo(px + exportCellSize, py + exportCellSize);
      }
      if (cell.walls.bottom) {
        ctx.moveTo(px, py + exportCellSize);
        ctx.lineTo(px + exportCellSize, py + exportCellSize);
      }
      if (cell.walls.left) {
        ctx.moveTo(px, py);
        ctx.lineTo(px, py + exportCellSize);
      }
    }
  }
  ctx.stroke();

  ctx.lineWidth = 1.5;
  const borderOffset = 1.5 / 2;
  ctx.strokeRect(-borderOffset, -borderOffset, w + 1.5, h + 1.5);

  ctx.restore();

  const statsY = h + padding + 20;
  ctx.fillStyle = t.ambience === 'light' ? '#475569' : '#94a3b8';
  ctx.font = '13px "JetBrains Mono", monospace';
  const secs = Math.floor(finalTime / 1000);
  const mins = Math.floor(secs / 60);
  const secsRem = secs % 60;
  const timeStr = `${mins}:${secsRem.toString().padStart(2, '0')}`;
  const optLen = optimalPath.length > 0 ? optimalPath.length - 1 : 0;
  const eff = optLen > 0 && moves > 0 ? Math.round((optLen / moves) * 100) : 0;
  const movesLabel = lang === 'zh' ? '步数' : 'Moves';
  const optLabel = lang === 'zh' ? '最优' : 'Optimal';
  const timeLabel = lang === 'zh' ? '用时' : 'Time';
  const effLabel = lang === 'zh' ? '效率' : 'Efficiency';
  ctx.fillText(
    `${movesLabel}: ${moves}  |  ${optLabel}: ${optLen}  |  ${timeLabel}: ${timeStr}  |  ${effLabel}: ${eff}%`,
    padding,
    statsY
  );
  ctx.fillStyle = t.ambience === 'light' ? '#94a3b8' : '#475569';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillText('Generated by AhaMaze', padding, statsY + 24);

  const link = document.createElement('a');
  link.download = `ahamaze-level${level}-${difficulty.toLowerCase()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
