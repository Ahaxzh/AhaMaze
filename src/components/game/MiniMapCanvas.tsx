import React, { useEffect, useRef } from 'react';
import { Cell } from '../../utils/maze';
import { Position, Theme } from '../../types/game';
import { THEME_CONFIGS } from '../../constants/game';

interface MiniMapCanvasProps {
  maze: Cell[][];
  mazeWidth: number;
  mazeHeight: number;
  theme: Theme;
  visitedPath: Position[];
  playerPos?: Position;
  targetSize?: number;
  visible?: boolean;
}

export const MiniMapCanvas = React.memo(function MiniMapCanvas({
  maze,
  mazeWidth,
  mazeHeight,
  theme,
  visitedPath,
  playerPos,
  targetSize = 104,
  visible = true,
}: MiniMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const staticCacheRef = useRef<HTMLCanvasElement | null>(null);
  const t = THEME_CONFIGS[theme];

  const maxDim = Math.max(mazeWidth, mazeHeight);
  const cellSize = targetSize / maxDim;
  const pixelWidth = Math.round(mazeWidth * cellSize);
  const pixelHeight = Math.round(mazeHeight * cellSize);

  // 1. Render static walls once per maze/theme change
  useEffect(() => {
    if (maze.length === 0 || pixelWidth === 0 || pixelHeight === 0) return;

    if (!staticCacheRef.current) {
      staticCacheRef.current = document.createElement('canvas');
    }
    const cache = staticCacheRef.current;
    cache.width = pixelWidth;
    cache.height = pixelHeight;

    const ctx = cache.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, pixelWidth, pixelHeight);
    ctx.fillStyle = t.cellBgColor || (t.ambience === 'dark' ? '#0f172a' : '#ffffff');
    ctx.fillRect(0, 0, pixelWidth, pixelHeight);

    // End point
    ctx.fillStyle = t.endColor;
    const endX = (mazeWidth - 1) * cellSize + cellSize / 2;
    const endY = (mazeHeight - 1) * cellSize + cellSize / 2;
    ctx.beginPath();
    ctx.arc(endX, endY, Math.max(1.5, cellSize * 0.4), 0, Math.PI * 2);
    ctx.fill();

    // Walls
    ctx.strokeStyle = t.wallColor;
    ctx.lineWidth = Math.max(0.75, cellSize * 0.12);
    ctx.lineCap = 'square';
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

    // Border
    ctx.strokeRect(0.5, 0.5, pixelWidth - 1, pixelHeight - 1);
  }, [maze, mazeWidth, mazeHeight, theme, t, cellSize, pixelWidth, pixelHeight]);

  // 2. Fast Blit + Player / Path update
  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas || maze.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, pixelWidth, pixelHeight);

    // Blit background
    if (staticCacheRef.current) {
      ctx.drawImage(staticCacheRef.current, 0, 0);
    }

    // Draw compact trail with smart sampling for long paths
    const len = visitedPath.length;
    if (len > 1) {
      ctx.beginPath();
      ctx.strokeStyle = t.trailColor;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = Math.max(1, cellSize * 0.4);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(
        visitedPath[0].x * cellSize + cellSize / 2,
        visitedPath[0].y * cellSize + cellSize / 2
      );

      // Skip intermediate straight segments or step stride on massive mazes
      const step = len > 100 ? 2 : 1;
      for (let i = 1; i < len; i += step) {
        ctx.lineTo(
          visitedPath[i].x * cellSize + cellSize / 2,
          visitedPath[i].y * cellSize + cellSize / 2
        );
      }
      if (len > 1 && (len - 1) % step !== 0) {
        ctx.lineTo(
          visitedPath[len - 1].x * cellSize + cellSize / 2,
          visitedPath[len - 1].y * cellSize + cellSize / 2
        );
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw current player dot
    const curPos = playerPos || (len > 0 ? visitedPath[len - 1] : { x: 0, y: 0 });
    const px = curPos.x * cellSize + cellSize / 2;
    const py = curPos.y * cellSize + cellSize / 2;

    ctx.fillStyle = t.playerColor;
    ctx.beginPath();
    ctx.arc(px, py, Math.max(2, cellSize * 0.45), 0, Math.PI * 2);
    ctx.fill();
  }, [visitedPath, playerPos, pixelWidth, pixelHeight, cellSize, t, maze.length, visible]);

  return (
    <canvas
      ref={canvasRef}
      width={pixelWidth}
      height={pixelHeight}
      style={{
        width: pixelWidth,
        height: pixelHeight,
        display: 'block',
      }}
    />
  );
});
