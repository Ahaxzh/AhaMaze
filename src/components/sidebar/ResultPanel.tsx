import React from 'react';
import { Trophy, Flag } from 'lucide-react';
import { Theme } from '../../types/game';
import { THEME_CONFIGS } from '../../constants/game';

interface ResultPanelProps {
  isFinished: boolean;
  appIsDark: boolean;
  gameState: string;
  theme: Theme;
  text: any;
  finalTime: number;
  optLen: number;
  moves: number;
  efficiency: number;
  rating: string;
}

export const ResultPanel = React.memo(function ResultPanel({
  isFinished, appIsDark, gameState, theme, text, finalTime, optLen, moves, efficiency, rating
}: ResultPanelProps) {
  const t = THEME_CONFIGS[theme];

  if (!isFinished) return null;

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
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
  );
});
