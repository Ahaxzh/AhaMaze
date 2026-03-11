import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { THEME_CONFIGS } from '../../constants/game';

interface LoginModalProps {
  showLogin: boolean;
  setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
  appIsDark: boolean;
  theme: Theme;
  lang: Language;
  playerName: string;
  setPlayerName: React.Dispatch<React.SetStateAction<string>>;
}

export const LoginModal = React.memo(function LoginModal({
  showLogin, setShowLogin, appIsDark, theme, lang, playerName, setPlayerName
}: LoginModalProps) {
  const t = THEME_CONFIGS[theme];

  if (!showLogin) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`cursor-pointer fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm`}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`cursor-auto w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden border ${appIsDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(135deg, ${t.playerColor}, ${t.trailColor})` }}>
              <User size={20} className="text-white drop-shadow-sm" />
            </div>
            <div>
              <h3 className={`font-black text-xl tracking-tight ${appIsDark ? 'text-white' : 'text-slate-900'}`}>
                {lang === 'zh' ? '你好，玩家！' : 'Welcome, Player!'}
              </h3>
              <p className={`text-sm ${appIsDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {lang === 'zh' ? '为自己取个好听的代号吧' : 'Give yourself a cool codename'}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder={lang === 'zh' ? "留空则作为游客进入..." : "Leave blank to play as Guest..."}
              className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${appIsDark
                ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500 placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 placeholder-slate-400'
                }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = playerName.trim();
                  if (val) {
                    localStorage.setItem('ahamaze_player', val);
                  } else {
                    setPlayerName('');
                    localStorage.removeItem('ahamaze_player');
                  }
                  setShowLogin(false);
                }
              }}
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setPlayerName('');
                localStorage.removeItem('ahamaze_player');
                setShowLogin(false);
              }}
              className={`flex-1 py-3 rounded-xl font-bold transition-colors ${appIsDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
            >
              {lang === 'zh' ? '作为游客' : 'Play as Guest'}
            </button>
            <button
              onClick={() => {
                if (playerName.trim()) {
                  localStorage.setItem('ahamaze_player', playerName.trim());
                }
                setShowLogin(false);
              }}
              className="flex-1 py-3 rounded-xl font-bold text-white shadow-md transition-opacity hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${t.playerColor}, ${t.trailColor})` }}
            >
              {lang === 'zh' ? '保存进入' : 'Save & Play'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});
