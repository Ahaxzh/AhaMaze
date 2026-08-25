import React from 'react';
import { HelpCircle, Play, RefreshCw, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Theme, Difficulty } from '../../types/game';
import { THEME_CONFIGS } from '../../constants/game';

interface ControlPanelProps {
  appIsDark: boolean;
  text: any;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  theme: Theme;
  isFinished: boolean;
  gameState: string;
  restartLevel: () => void;
  handleGiveUp: () => void;
  startNewLevel: () => void;
  isReplaying: boolean;
  startReplay: () => void;
  stopReplay: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (s: boolean) => void;
  onAction?: () => void;
}

export const ControlPanel = React.memo(function ControlPanel({
  appIsDark, text, difficulty, setDifficulty, theme, isFinished, gameState, 
  restartLevel, handleGiveUp, startNewLevel, isReplaying, startReplay, stopReplay, soundEnabled, setSoundEnabled,
  onAction,
}: ControlPanelProps) {
  const t = THEME_CONFIGS[theme];

  return (
    <div className={`p-4 rounded-2xl border shadow-sm backdrop-blur-md flex flex-col gap-3 ${appIsDark ? 'bg-slate-900/60 border-white/5' : 'bg-white/70 border-white'}`}>
      <div className="text-xs font-black tracking-tight opacity-70 px-1 flex items-center gap-1.5">
        <Play size={13} className={t.text} />
        <span>{text.controls}</span>
      </div>

      <div className={`flex rounded-xl p-1 gap-1 ${appIsDark ? 'bg-black/40' : 'bg-black/5'}`}>
        {(['Kids', 'Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => {
              setDifficulty(d);
              onAction?.();
            }}
            className={`flex-1 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-lg transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-400 outline-none ${difficulty === d
              ? 'text-white shadow-md scale-100'
              : appIsDark ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5 opacity-60 hover:opacity-100' : 'text-slate-500 hover:text-slate-800 hover:bg-black/5 opacity-60 hover:opacity-100'
              }`}
            style={difficulty === d ? { background: `linear-gradient(135deg, ${t.playerColor}, ${t.trailColor})` } : undefined}
            aria-label={`Difficulty: ${d}`}
            aria-pressed={difficulty === d}
          >
            {text[d.toLowerCase() as 'kids' | 'easy' | 'medium' | 'hard']}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
        <button
          onClick={() => {
            if (isFinished) restartLevel();
            else if (gameState === 'playing') handleGiveUp();
            else startNewLevel();
            onAction?.();
          }}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-offset-2 outline-none flex items-center justify-center gap-1.5 ${appIsDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}
          style={gameState === 'playing' ? undefined : { background: `linear-gradient(135deg, ${t.playerColor}, ${t.trailColor})`, color: 'white' }}
        >
          {gameState === 'playing' ? <HelpCircle size={14} /> : <Play size={14} fill="currentColor" />}
          {gameState === 'playing' ? text.giveUp : text.start || 'Start'}
        </button>
        <button
          type="button"
          onClick={() => {
            startNewLevel();
            onAction?.();
          }}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-offset-2 outline-none flex items-center justify-center gap-1.5 ${appIsDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}
        >
          <RefreshCw size={14} /> {text.newMaze}
        </button>
        <button
          type="button"
          onClick={
            isFinished && gameState === 'won'
              ? () => {
                  if (isReplaying) {
                    stopReplay();
                  } else {
                    onAction?.();
                    startReplay();
                  }
                }
              : undefined
          }
          disabled={!(isFinished && gameState === 'won')}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 hover:scale-[1.02] focus-visible:ring-2 outline-none flex items-center justify-center gap-1.5 ${isFinished && gameState === 'won' ? (appIsDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10') : 'opacity-40 cursor-not-allowed border ' + (appIsDark ? 'border-white/5' : 'border-black/5')}`}
        >
          <RotateCcw size={14} className={isReplaying ? 'animate-spin' : ''} /> {isReplaying ? text.stopReplay : text.pathReplay}
        </button>
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 hover:scale-[1.02] focus-visible:ring-2 outline-none flex items-center justify-center gap-1.5 ${appIsDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />} {text.sound}
        </button>
      </div>
    </div>
  );
});
