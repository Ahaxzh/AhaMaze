import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Language, GameMode, Difficulty, LeaderboardEntry } from '../../types/game';

interface LeaderboardPageProps {
  appIsDark: boolean;
  lang: Language;
  text: any;
  leaderboardMode: GameMode;
  setLeaderboardMode: React.Dispatch<React.SetStateAction<GameMode>>;
  leaderboardDiff: Difficulty;
  setLeaderboardDiff: React.Dispatch<React.SetStateAction<Difficulty>>;
  leaderboardData: LeaderboardEntry[];
}

export const LeaderboardPage = React.memo(function LeaderboardPage({
  appIsDark, lang, text, leaderboardMode, setLeaderboardMode, leaderboardDiff, setLeaderboardDiff, leaderboardData
}: LeaderboardPageProps) {

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const filtered = leaderboardData
    .filter(r => r.difficulty === leaderboardDiff && r.mode === leaderboardMode)
    .sort((a, b) => a.time - b.time || a.moves - b.moves)
    .slice(0, 50);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative z-10 p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className={`flex flex-col h-full rounded-[24px] shadow-2xl overflow-hidden border ${appIsDark ? 'bg-slate-900/80 border-slate-700/50 backdrop-blur-md' : 'bg-white/90 border-slate-200/50 backdrop-blur-md'}`}>
        <div className={`p-6 border-b flex items-center justify-between ${appIsDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${appIsDark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-500'}`}>
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className={`font-black tracking-tight text-2xl ${appIsDark ? 'text-white' : 'text-slate-900'}`}>
                {lang === 'zh' ? '排行榜' : 'Leaderboard'}
              </h3>
              <p className={`text-sm mt-0.5 ${appIsDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {lang === 'zh' ? '查看全球顶尖玩家的解谜记录' : 'Check out the puzzle solving records of top players worldwide'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 flex gap-3 border-b ${appIsDark ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50/50'}`}>
          <select
            value={leaderboardMode}
            onChange={(e) => setLeaderboardMode(e.target.value as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border outline-none cursor-pointer transition-colors ${appIsDark ? 'bg-slate-800 border-slate-600 text-white hover:border-slate-500' : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'}`}
          >
            <option value="Classic">{lang === 'zh' ? '经典模式' : 'Classic Mode'}</option>
            <option value="Challenge">{lang === 'zh' ? '挑战模式' : 'Challenge Mode'}</option>
          </select>
          <select
            value={leaderboardDiff}
            onChange={(e) => setLeaderboardDiff(e.target.value as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border outline-none cursor-pointer transition-colors ${appIsDark ? 'bg-slate-800 border-slate-600 text-white hover:border-slate-500' : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'}`}
          >
            <option value="Kids">{lang === 'zh' ? '儿童' : 'Kids'}</option>
            <option value="Easy">{lang === 'zh' ? '简单' : 'Easy'}</option>
            <option value="Medium">{lang === 'zh' ? '中等' : 'Medium'}</option>
            <option value="Hard">{lang === 'zh' ? '困难' : 'Hard'}</option>
          </select>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50">
              <BarChart3 size={48} className={`mb-4 ${appIsDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <div className={`text-lg font-bold ${appIsDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {lang === 'zh' ? '暂无记录' : 'No records yet'}
              </div>
              <div className={`text-sm mt-1 ${appIsDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {lang === 'zh' ? '快去挑战一局吧！' : 'Be the first to set a record!'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((r, i) => (
                <div key={i} className={`flex flex-col p-4 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg ${
                  i === 0 ? (appIsDark ? 'bg-amber-900/20 border-amber-500/30' : 'bg-amber-50 border-amber-200') : 
                  i === 1 ? (appIsDark ? 'bg-slate-800/40 border-slate-600/50' : 'bg-slate-50 border-slate-200') :
                  i === 2 ? (appIsDark ? 'bg-orange-900/20 border-orange-700/30' : 'bg-orange-50 border-orange-200') :
                  (appIsDark ? 'bg-slate-800/20 border-white/5 hover:bg-slate-800/40' : 'bg-white border-slate-100 hover:bg-slate-50')
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                        i === 0 ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 
                        i === 1 ? 'bg-slate-400 text-white shadow-md shadow-slate-400/20' : 
                        i === 2 ? 'bg-orange-400 text-white shadow-md shadow-orange-400/20' : 
                        (appIsDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500')
                      }`}>
                        #{i + 1}
                      </div>
                      <div className={`font-black text-lg truncate max-w-[120px] ${appIsDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {r.name}
                      </div>
                    </div>
                    <div className={`text-xs font-mono font-bold px-2 py-1 rounded-md ${appIsDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                      {new Date(r.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end mt-auto pt-2 border-t border-black/5 dark:border-white/5">
                    <div className="flex flex-col">
                      <span className={`text-[10px] uppercase tracking-wider font-bold opacity-50 ${appIsDark ? 'text-slate-400' : 'text-slate-500'}`}>{text.timer}</span>
                      <span className={`font-mono font-black text-xl ${appIsDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {formatTime(r.time)}
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className={`text-[10px] uppercase tracking-wider font-bold opacity-50 ${appIsDark ? 'text-slate-400' : 'text-slate-500'}`}>{text.moves}</span>
                      <span className={`font-mono font-bold text-lg ${appIsDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
                        {r.moves}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
