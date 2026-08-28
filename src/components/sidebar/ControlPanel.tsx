import React from 'react';
import { Sliders, RefreshCw, RotateCcw } from 'lucide-react';
import { Theme, Difficulty } from '../../types/game';
import { THEME_CONFIGS } from '../../constants/game';

interface ControlPanelProps {
  appIsDark: boolean;
  text: any;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  theme: Theme;
  restartLevel: () => void;
  startNewLevel: () => void;
  onAction?: () => void;
}

export const ControlPanel = React.memo(function ControlPanel({
  appIsDark,
  text,
  difficulty,
  setDifficulty,
  theme,
  restartLevel,
  startNewLevel,
  onAction,
}: ControlPanelProps) {
  const t = THEME_CONFIGS[theme];

  return (
    <div className={`p-4 rounded-2xl border shadow-sm flex flex-col gap-3 ${appIsDark ? 'bg-slate-900/80 border-white/10' : 'bg-white/90 border-slate-200/80'}`}>
      <div className="text-xs font-black tracking-tight opacity-70 px-1 flex items-center gap-1.5">
        <Sliders size={13} className={t.text} />
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

      {/* Quick Actions (Clean and non-redundant) */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        <button
          type="button"
          onClick={() => {
            startNewLevel();
            onAction?.();
          }}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-offset-2 outline-none flex items-center justify-center gap-1.5 ${
            appIsDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-black/5 hover:bg-black/10 text-slate-800'
          }`}
        >
          <RefreshCw size={14} />
          <span>{text.newMaze}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            restartLevel();
            onAction?.();
          }}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 hover:scale-[1.02] focus-visible:ring-2 outline-none flex items-center justify-center gap-1.5 ${
            appIsDark ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-black/5 hover:bg-black/10 text-slate-700'
          }`}
        >
          <RotateCcw size={14} />
          <span>{text.replay || 'Reset'}</span>
        </button>
      </div>
    </div>
  );
});
