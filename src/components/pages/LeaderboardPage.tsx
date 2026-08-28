import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Clock, Footprints, Award, Swords } from 'lucide-react';
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

  const top3 = filtered.slice(0, 3);
  const restList = filtered.slice(3);

  // Reorder Top 3 for Podium: [2nd, 1st, 3rd]
  const podiumOrder = [];
  if (top3[1]) podiumOrder.push({ ...top3[1], rank: 2 });
  if (top3[0]) podiumOrder.push({ ...top3[0], rank: 1 });
  if (top3[2]) podiumOrder.push({ ...top3[2], rank: 3 });

  const getRankColor = (rank: number) => {
    if (appIsDark) {
      if (rank === 1) return 'from-yellow-500/80 via-amber-600/80 to-yellow-700/80 shadow-yellow-900/40 border-yellow-500/30';
      if (rank === 2) return 'from-slate-400/80 via-slate-500/80 to-slate-600/80 shadow-slate-900/40 border-slate-400/30';
      if (rank === 3) return 'from-orange-500/80 via-orange-600/80 to-orange-700/80 shadow-orange-900/40 border-orange-500/30';
    } else {
      if (rank === 1) return 'from-yellow-300 via-amber-400 to-yellow-500 text-yellow-900 shadow-yellow-500/30 border-yellow-200/50';
      if (rank === 2) return 'from-slate-200 via-slate-300 to-slate-400 text-slate-800 shadow-slate-400/30 border-slate-100/50';
      if (rank === 3) return 'from-orange-300 via-orange-400 to-orange-500 text-orange-950 shadow-orange-500/30 border-orange-200/50';
    }
    return '';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative z-10 p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className={`flex flex-col h-full rounded-[32px] shadow-2xl overflow-hidden border ${appIsDark ? 'bg-slate-900/95 border-slate-700/50' : 'bg-white/95 border-slate-200'}`}>
        
        {/* Header & Controls */}
        <div className={`p-6 pb-0 flex flex-col gap-6`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${appIsDark ? 'from-amber-600 to-yellow-600 text-white shadow-amber-900/50' : 'from-amber-400 to-yellow-500 text-white shadow-amber-500/30'}`}>
                <Trophy size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">{text.leaderboard}</h1>
                <p className={`text-xs md:text-sm font-semibold opacity-60 mt-0.5`}>
                  {lang === 'zh' ? '查看各个模式下的顶尖记录与荣誉榜' : 'Top puzzle solvers & speedrun champions'}
                </p>
              </div>
            </div>

            {/* Mode selection Tabs */}
            <div className={`flex p-1.5 rounded-2xl border ${appIsDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-100 border-black/5'}`}>
              <button
                onClick={() => setLeaderboardMode('Classic')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
                  leaderboardMode === 'Classic'
                    ? (appIsDark ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-900 shadow-md')
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Swords size={16} />
                {text.classicMode}
              </button>
              <button
                onClick={() => setLeaderboardMode('Challenge')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
                  leaderboardMode === 'Challenge'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Trophy size={16} />
                {text.challenge}
              </button>
            </div>
          </div>

          {/* Difficulty Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {(['Kids', 'Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setLeaderboardDiff(d)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 border ${
                  leaderboardDiff === d
                    ? (appIsDark ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-sm' : 'bg-amber-100 text-amber-800 border-amber-300 shadow-sm')
                    : (appIsDark ? 'bg-slate-800/40 border-white/5 opacity-60 hover:opacity-100' : 'bg-slate-100 border-black/5 opacity-60 hover:opacity-100')
                }`}
              >
                {text[d.toLowerCase() as 'kids' | 'easy' | 'medium' | 'hard']}
              </button>
            ))}
          </div>
        </div>

        {/* Content List & Top 3 Podium */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {filtered.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
              <Trophy size={48} className="mb-3 stroke-1" />
              <p className="font-bold text-base">{lang === 'zh' ? '暂无记录' : 'No records yet'}</p>
              <p className="text-xs mt-1">{lang === 'zh' ? '快去挑战一局刷新排行榜吧！' : 'Play a game to claim your spot!'}</p>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto flex flex-col gap-10 w-full">
              {/* TOP 3 PODIUM */}
              {podiumOrder.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-8 pb-4 max-w-lg mx-auto w-full px-2">
                  {podiumOrder.map((entry, idx) => {
                    const isFirst = entry.rank === 1;
                    const heightClass = isFirst ? 'h-40 sm:h-44' : entry.rank === 2 ? 'h-32 sm:h-36' : 'h-24 sm:h-28';
                    const rankColor = isFirst 
                      ? 'from-amber-400 to-yellow-500 border-amber-300' 
                      : entry.rank === 2 
                      ? 'from-slate-300 to-slate-400 border-slate-200' 
                      : 'from-amber-600 to-amber-700 border-amber-500';

                    return (
                      <motion.div
                        key={entry.rank}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.5, type: 'spring' }}
                        className="flex flex-col items-center"
                      >
                        {/* Avatar / Crown */}
                        <div className={`z-20 flex flex-col items-center -mb-3 origin-bottom ${isFirst ? 'scale-110 -mb-4' : ''}`}>
                          {isFirst && <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}><Trophy size={36} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] mb-2" fill="currentColor"/></motion.div>}
                          {entry.rank === 2 && <Medal size={30} className="text-slate-300 drop-shadow-md mb-2" fill="currentColor" />}
                          {entry.rank === 3 && <Medal size={30} className="text-orange-400 drop-shadow-md mb-2" fill="currentColor" />}
                          <div className={`px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-full shadow-lg truncate max-w-[100px] md:max-w-[130px] border border-white/20 relative`}>
                            {entry.name}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-white/20 rotate-45"></div>
                          </div>
                        </div>

                        {/* Pedestal */}
                        <div className={`w-full ${heightClass} rounded-t-3xl shadow-2xl flex flex-col items-center justify-center p-4 pb-2 bg-gradient-to-b ${rankColor} transition-transform hover:scale-[1.03] cursor-default border-t-2 relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                          <div className={`flex flex-col items-center z-10 ${appIsDark ? 'text-white drop-shadow-md' : 'text-slate-900 drop-shadow-sm'}`}>
                            <span className="font-mono font-black text-3xl md:text-4xl tracking-tighter">{formatTime(entry.time)}</span>
                            <div className="flex flex-col items-center opacity-90 mt-1 gap-0.5">
                              <div className="flex items-center gap-1.5">
                                <Footprints size={12} />
                                <span className="font-bold text-xs tracking-wider">{entry.moves}</span>
                              </div>
                              <span className="text-[10px] font-mono opacity-70 tracking-widest">{new Date(entry.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {/* Glass reflection highlight */}
                          <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-white/30 via-transparent to-transparent opacity-60 pointer-events-none rounded-t-3xl"></div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* List View for Rest */}
              {restList.length > 0 && (
                <div className="flex flex-col gap-3 pb-8">
                  <div className={`px-4 py-2 flex items-center text-xs font-bold uppercase tracking-wider ${appIsDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <div className="w-12 text-center">{lang === 'zh' ? '名次' : 'Rank'}</div>
                    <div className="flex-1">{lang === 'zh' ? '玩家' : 'Player'}</div>
                    <div className="w-24 text-right">{text.timer}</div>
                    <div className="w-24 text-right">{text.moves}</div>
                  </div>
                  {restList.map((entry, idx) => {
                    const rank = idx + 4;
                    const uniqueKey = `${entry.name}-${entry.time}-${entry.date}`;
                    return (
                      <motion.div key={uniqueKey} variants={itemVariants} className={`flex items-center px-4 py-3 md:py-4 rounded-2xl border transition-colors ${appIsDark ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80' : 'bg-white border-slate-100 hover:bg-slate-50 shadow-sm'}`}>
                        <div className={`w-12 text-center font-mono font-bold text-lg opacity-40 ${appIsDark ? 'text-white' : 'text-slate-900'}`}>{rank}</div>
                        <div className={`flex-1 font-bold text-base truncate pr-4 ${appIsDark ? 'text-slate-200' : 'text-slate-800'}`}>{entry.name}</div>
                        <div className={`w-24 text-right font-mono font-bold ${appIsDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{formatTime(entry.time)}</div>
                        <div className={`w-24 text-right font-mono font-bold ${appIsDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{entry.moves}</div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
});
