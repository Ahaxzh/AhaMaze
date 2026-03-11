import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Clock, Footprints, Award } from 'lucide-react';
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
    if (rank === 1) return 'from-yellow-300 via-amber-400 to-yellow-600 text-yellow-900 shadow-yellow-500/30';
    if (rank === 2) return 'from-slate-200 via-slate-300 to-slate-400 text-slate-800 shadow-slate-400/30';
    if (rank === 3) return 'from-orange-300 via-orange-400 to-orange-600 text-orange-950 shadow-orange-500/30';
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
      <div className={`flex flex-col h-full rounded-[32px] shadow-2xl overflow-hidden border ${appIsDark ? 'bg-slate-900/80 border-slate-700/50 backdrop-blur-xl' : 'bg-white/90 border-slate-200/50 backdrop-blur-xl'}`}>
        
        {/* Header & Controls */}
        <div className={`p-6 pb-0 flex flex-col gap-6`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${appIsDark ? 'from-amber-600 to-yellow-600 text-white shadow-amber-900/50' : 'from-amber-400 to-yellow-500 text-white shadow-amber-500/30'}`}>
                <Trophy size={28} />
              </div>
              <div>
                <h3 className={`font-black tracking-tight text-3xl ${appIsDark ? 'text-white' : 'text-slate-900'}`}>
                  {lang === 'zh' ? '荣誉榜' : 'Hall of Fame'}
                </h3>
                <p className={`text-sm mt-1 font-medium ${appIsDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {lang === 'zh' ? '见证迷宫大师的诞生' : 'Witness the birth of maze masters'}
                </p>
              </div>
            </div>

            {/* Segmented Controls */}
            <div className={`flex flex-col sm:flex-row gap-3 ${appIsDark ? '' : ''}`}>
              <div className={`flex p-1.5 rounded-xl ${appIsDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                {(['Classic', 'Challenge'] as GameMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setLeaderboardMode(mode)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${leaderboardMode === mode 
                      ? (appIsDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm')
                      : (appIsDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')}`}
                  >
                    {mode === 'Classic' ? (lang === 'zh' ? '经典' : 'Classic') : (lang === 'zh' ? '挑战' : 'Challenge')}
                  </button>
                ))}
              </div>
              <div className={`flex p-1.5 rounded-xl ${appIsDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                {(['Kids', 'Easy', 'Medium', 'Hard'] as Difficulty[]).map(diff => (
                  <button
                    key={diff}
                    onClick={() => setLeaderboardDiff(diff)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${leaderboardDiff === diff 
                      ? (appIsDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm')
                      : (appIsDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')}`}
                  >
                    {text[diff.toLowerCase() as 'kids' | 'easy' | 'medium' | 'hard']}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50 absolute inset-0">
              <div className={`w-24 h-24 mb-6 rounded-3xl flex items-center justify-center rotate-12 ${appIsDark ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-300'}`}>
                <Award size={48} />
              </div>
              <div className={`text-xl font-black ${appIsDark ? 'text-slate-300' : 'text-slate-400'}`}>
                {lang === 'zh' ? '王座虚位以待' : 'The throne awaits'}
              </div>
              <div className={`text-sm mt-2 font-medium ${appIsDark ? 'text-slate-500' : 'text-slate-500'}`}>
                {lang === 'zh' ? '快去创造你的不朽传说！' : 'Go forge your immortal legend!'}
              </div>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto flex flex-col gap-10 h-full">
              
              {/* Podium for Top 3 */}
              <div className="flex items-end justify-center gap-2 md:gap-6 min-h-[220px] pt-8">
                {podiumOrder.map((entry, idx) => {
                  const isFirst = entry.rank === 1;
                  const heightClass = isFirst ? 'h-40 md:h-48' : entry.rank === 2 ? 'h-32 md:h-40' : 'h-28 md:h-32';
                  
                  return (
                    <motion.div key={idx} variants={itemVariants} className={`relative flex flex-col items-center flex-1 max-w-[180px]`}>
                      {/* Avatar / Crown */}
                      <div className={`absolute -top-12 z-20 flex flex-col items-center ${isFirst ? '-top-14 scale-110' : ''}`}>
                        {isFirst && <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}><Trophy size={32} className="text-yellow-400 drop-shadow-lg mb-1" fill="currentColor"/></motion.div>}
                        {entry.rank === 2 && <Medal size={28} className="text-slate-300 drop-shadow-md mb-1" fill="currentColor" />}
                        {entry.rank === 3 && <Medal size={28} className="text-orange-400 drop-shadow-md mb-1" fill="currentColor" />}
                        <div className={`px-3 py-1 bg-black/80 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-xl truncate max-w-[100px] md:max-w-[120px] border border-white/10`}>
                          {entry.name}
                        </div>
                      </div>

                      {/* Pedestal */}
                      <div className={`w-full ${heightClass} rounded-t-2xl shadow-xl flex flex-col items-center justify-end p-4 pb-6 bg-gradient-to-b ${getRankColor(entry.rank)} transition-transform hover:scale-[1.02] cursor-default border-t border-white/40 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity"></div>
                        <div className="flex flex-col items-center z-10">
                          <span className="font-mono font-black text-2xl md:text-3xl drop-shadow-sm">{formatTime(entry.time)}</span>
                          <div className="flex items-center gap-1 opacity-80 mt-1">
                            <Footprints size={12} />
                            <span className="font-bold text-sm tracking-wide">{entry.moves}</span>
                          </div>
                        </div>
                        <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

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
                    return (
                      <motion.div key={idx} variants={itemVariants} className={`flex items-center px-4 py-3 md:py-4 rounded-2xl border transition-colors ${appIsDark ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80' : 'bg-white border-slate-100 hover:bg-slate-50 shadow-sm'}`}>
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
