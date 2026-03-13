import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Flag, Clock } from 'lucide-react';
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
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className={`p-6 rounded-2xl border shadow-xl flex flex-col gap-4 flex-1 backdrop-blur-xl transition-all duration-500 ${appIsDark ? 'bg-slate-900/80 border-white/10' : 'bg-white/80 border-white'}`} 
      style={gameState === 'won' ? { boxShadow: `0 0 40px ${t.playerColor}30`, borderColor: `${t.playerColor}40` } : undefined}
    >
      {gameState === 'won' ? (
        <>
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ rotate: -20, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="p-3 rounded-2xl text-yellow-500 bg-yellow-500/15 shadow-inner"
            >
              <Trophy className="w-10 h-10" />
            </motion.div>
            <div>
              <div className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-yellow-400 to-amber-600">{text.cleared}</div>
              <div className="text-xs font-bold opacity-50 uppercase tracking-widest">{text.rating}: {rating}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 mt-2">
            <div className={`flex justify-between items-center p-3 rounded-xl border ${appIsDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
              <span className="text-sm font-bold opacity-70 flex items-center gap-2"><Clock size={14} /> {text.timer}</span>
              <span className="font-mono text-lg font-black tracking-tighter">{formatTime(finalTime)}</span>
            </div>
            
            <div className="flex flex-col gap-2 p-3 rounded-xl border border-dashed border-slate-500/20">
              <div className="flex justify-between items-center text-xs font-bold opacity-60">
                <span>{text.optimal}</span>
                <span className="font-mono text-emerald-500">{optLen}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold opacity-60">
                <span>{text.moves}</span>
                <span className="font-mono">{moves}</span>
              </div>
              <div className="h-2 w-full bg-slate-500/10 rounded-full overflow-hidden mt-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(efficiency, 100)}%` }}
                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: efficiency >= 90 ? '#10b981' : efficiency >= 60 ? '#f59e0b' : '#ef4444' }}
                />
              </div>
              <div className="flex justify-between items-center text-xs font-black">
                <span>{text.efficiency}</span>
                <span style={{ color: efficiency >= 90 ? '#10b981' : efficiency >= 60 ? '#f59e0b' : '#ef4444' }}>{efficiency}%</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl text-red-500 bg-red-500/15 shadow-inner">
              <Flag className="w-10 h-10" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-red-500">{text.gaveUp}</div>
              <div className="text-xs font-bold opacity-50 uppercase tracking-widest">Better luck next time</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 mt-2">
            <div className={`flex justify-between items-center p-3 rounded-xl border ${appIsDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
              <span className="text-sm font-bold opacity-70 flex items-center gap-2"><Clock size={14} /> {text.timer}</span>
              <span className="font-mono text-lg font-black tracking-tighter">{formatTime(finalTime)}</span>
            </div>
            
            <div className="flex flex-col gap-2 p-3 rounded-xl border border-dashed border-red-500/20">
              <div className="flex justify-between items-center text-xs font-bold opacity-60">
                <span>{text.solutionSteps}</span>
                <span className="font-mono text-emerald-500">{optLen}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold opacity-60">
                <span>{text.moves}</span>
                <span className="font-mono">{moves}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
});
