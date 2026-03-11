import React, { useState, useEffect, useRef } from 'react';
import { Clock, Footprints } from 'lucide-react';
import { Theme, Difficulty, Position } from '../../types/game';
import { THEME_CONFIGS } from '../../constants/game';
import { MazeCanvas } from '../game/MazeCanvas';
import { Cell } from '../../utils/maze';

interface InfoPanelProps {
  appIsDark: boolean;
  text: any;
  maze: Cell[][];
  mazeWidth: number;
  mazeHeight: number;
  theme: Theme;
  visitedPath: Position[];
  optimalPath: Position[];
  replayIndex: number;
  difficulty: Difficulty;
  startTime: number | null;
  gameState: string;
  moves: number;
}

export function TimerDisplay({ startTime, gameState, className }: { startTime: number | null; gameState: string; className?: string }) {
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

export const InfoPanel = React.memo(function InfoPanel({
  appIsDark, text, maze, mazeWidth, mazeHeight, theme, visitedPath, optimalPath, replayIndex, difficulty, startTime, gameState, moves
}: InfoPanelProps) {
  const t = THEME_CONFIGS[theme];

  return (
    <div className={`p-4 rounded-2xl border shadow-sm backdrop-blur-md flex flex-col gap-3 ${appIsDark ? 'bg-slate-900/60 border-white/5' : 'bg-white/70 border-white'}`}>
      <div className="text-xs uppercase tracking-widest font-bold opacity-50 px-1">{text.stats}</div>
      <div className="flex gap-4 items-center">
        {/* Left: Mini Map */}
        <div className={`w-28 h-28 shrink-0 rounded-xl overflow-hidden border flex items-center justify-center p-1 relative ${appIsDark ? 'border-white/10 bg-black/40' : 'border-black/10 bg-black/5'}`}>
          {maze.length > 0 && (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="opacity-90">
              <MazeCanvas
                maze={maze} cellSize={112 / Math.max(mazeWidth, mazeHeight)}
                mazeWidth={mazeWidth} mazeHeight={mazeHeight} theme={theme} visitedPath={visitedPath} optimalPath={optimalPath}
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
  );
});
