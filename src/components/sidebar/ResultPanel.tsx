import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Flag, Clock, Play, RefreshCw, RotateCcw, Sparkles } from 'lucide-react';
import { Theme, Language } from '../../types/game';
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
  lang?: Language;
  isKidsMode?: boolean;
  startReplay?: () => void;
  stopReplay?: () => void;
  isReplaying?: boolean;
  startNewLevel?: () => void;
  restartLevel?: () => void;
  onAction?: () => void;
}

export const ResultPanel = React.memo(function ResultPanel({
  isFinished,
  appIsDark,
  gameState,
  theme,
  text,
  finalTime,
  optLen,
  moves,
  efficiency,
  rating,
  lang = 'zh',
  isKidsMode = false,
  startReplay,
  stopReplay,
  isReplaying = false,
  startNewLevel,
  restartLevel,
  onAction,
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
      className={`p-6 rounded-2xl border shadow-xl flex flex-col gap-4 flex-1 transition-all duration-300 ${appIsDark ? 'bg-slate-900/95 border-white/10' : 'bg-white/95 border-slate-200'}`} 
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
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl text-amber-500 bg-amber-500/15 shadow-inner shrink-0">
              <Flag className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-amber-500">
                {lang === 'zh' ? '正解路径已标出' : text.gaveUp}
              </div>
              <div className="text-xs font-semibold opacity-60 mt-0.5">
                {lang === 'zh' ? '已在迷宫中高亮标出最优通关路线' : 'Optimal route highlighted on maze'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 mt-1">
            <div className={`flex justify-between items-center p-3 rounded-xl border ${appIsDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
              <span className="text-xs font-bold opacity-70 flex items-center gap-2"><Clock size={13} /> {text.timer}</span>
              <span className="font-mono text-base font-black tracking-tight">{formatTime(finalTime)}</span>
            </div>
            
            <div className={`flex flex-col gap-2 p-3 rounded-xl border border-dashed ${appIsDark ? 'border-amber-500/30 bg-amber-500/5' : 'border-amber-400/40 bg-amber-50/50'}`}>
              <div className="flex justify-between items-center text-xs font-bold opacity-80">
                <span>{text.solutionSteps}</span>
                <span className="font-mono text-amber-500 font-black">{optLen}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold opacity-80">
                <span>{text.moves}</span>
                <span className="font-mono font-black">{moves}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- Action Buttons (Watch Replay, Next Level, Replay) --- */}
      <div className="flex flex-col gap-2.5 mt-1 pt-3 border-t border-slate-500/15">
        {gameState === 'won' && startReplay && (
          <button
            type="button"
            onClick={() => {
              onAction?.();
              if (isReplaying) stopReplay?.();
              else startReplay?.();
            }}
            className={`w-full py-3 px-4 rounded-xl font-black text-sm text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
              isReplaying
                ? 'bg-rose-500 animate-pulse'
                : isKidsMode
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-95'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95'
            }`}
          >
            <Play size={18} fill="currentColor" className={isReplaying ? 'animate-spin' : ''} />
            <span>
              {isReplaying
                ? lang === 'zh'
                  ? '⏹️ 停止回放'
                  : '⏹️ Stop Replay'
                : lang === 'zh'
                ? '🎬 看看我是怎么走的 (路径回放)'
                : '🎬 Watch Path Replay'}
            </span>
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              onAction?.();
              startNewLevel?.();
            }}
            className="py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white"
          >
            <RefreshCw size={14} />
            <span>{lang === 'zh' ? '🚀 下一关' : text.nextLevel || 'Next Maze'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onAction?.();
              restartLevel?.();
            }}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
              appIsDark
                ? 'bg-white/10 text-white hover:bg-white/15'
                : 'bg-black/5 text-slate-800 hover:bg-black/10'
            }`}
          >
            <RotateCcw size={14} />
            <span>{lang === 'zh' ? '🔄 再玩一次' : text.replay || 'Replay'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
});
