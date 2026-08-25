import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, X, Sparkles, Dices, Check, Smile } from 'lucide-react';
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
  playerEmoji: string;
  setPlayerEmoji: React.Dispatch<React.SetStateAction<string>>;
}

const AVATAR_GROUPS = [
  {
    id: 'all',
    labelZh: '全部',
    labelEn: 'All',
  },
  {
    id: 'pets',
    labelZh: '萌宠可爱',
    labelEn: 'Cute Pets',
    emojis: ['💖', '🦄', '🐰', '🐱', '🐶', '🐼', '🦊', '🐨', '🐻', '🐯', '🦁', '🐵', '🐸', '🐧', '🐤', '🐣', '🦆', '🦉', '🐴', '🐢', '🦖', '🦕', '🐙'],
  },
  {
    id: 'magic',
    labelZh: '梦幻闪耀',
    labelEn: 'Magic',
    emojis: ['⭐', '🌟', '💫', '✨', '👑', '💎', '🌈', '🔥', '🌊', '🍀', '🚀', '🎯', '🎃', '💩', '☀️', '🌤', '⛅', '🌸', '🌹', '🌻'],
  },
  {
    id: 'food',
    labelZh: '水果甜点',
    labelEn: 'Yummy',
    emojis: ['🍓', '🍉', '🍑', '🍒', '🍌', '🍎', '🍐', '🍊', '🍋', '🍇', '🍍', '🥥', '🥑', '🥦', '🥕', '🍦', '🍩', '🍰', '🍪', '🍫', '🍭'],
  },
];

const ALL_EMOJIS = Array.from(
  new Set(
    AVATAR_GROUPS.flatMap((g) => g.emojis || []).concat([
      '💖', '🩷', '⭐', '🌟', '🦄', '🐰', '🐱', '🐶', '🐼', '🦊',
      '🐸', '🐵', '🐧', '🦁', '🐯', '🐤', '🐣', '👑', '💎', '🍓',
      '🍉', '🍑', '🌈', '🔥', '🌊', '🍀', '🎃', '💩', '🚀', '🎯',
    ])
  )
);

const RANDOM_NAMES_ZH = [
  '星光探索者', '迷宫魔法师', '彩虹小兔', '幻影骑士', '糖果精灵',
  '疾风探险家', '快乐小熊', '闪电小猫', '奇迹队长', '梦幻独角兽',
  '超级星神', '宝藏猎人', '泡泡小鸭', '勇敢小狮',
];

const RANDOM_NAMES_EN = [
  'Star Explorer', 'Maze Wizard', 'Rainbow Bunny', 'Shadow Knight', 'Candy Elf',
  'Wind Runner', 'Happy Bear', 'Lightning Cat', 'Captain Spark', 'Magic Unicorn',
  'Super Nova', 'Treasure Hunter', 'Bubble Duck', 'Brave Lion',
];

export const LoginModal = React.memo(function LoginModal({
  showLogin,
  setShowLogin,
  appIsDark,
  theme,
  lang,
  playerName,
  setPlayerName,
  playerEmoji,
  setPlayerEmoji,
}: LoginModalProps) {
  const t = THEME_CONFIGS[theme];
  const [localEmoji, setLocalEmoji] = useState(playerEmoji);
  const [activeTab, setActiveTab] = useState('all');

  const displayedEmojis = useMemo(() => {
    if (activeTab === 'all') return ALL_EMOJIS;
    const group = AVATAR_GROUPS.find((g) => g.id === activeTab);
    return group?.emojis || ALL_EMOJIS;
  }, [activeTab]);

  if (!showLogin) return null;

  const handleRandomRoll = () => {
    const randomEmoji = ALL_EMOJIS[Math.floor(Math.random() * ALL_EMOJIS.length)];
    setLocalEmoji(randomEmoji);
    const namePool = lang === 'zh' ? RANDOM_NAMES_ZH : RANDOM_NAMES_EN;
    const randomName = namePool[Math.floor(Math.random() * namePool.length)];
    setPlayerName(randomName);
  };

  const handleSave = () => {
    if (playerName.trim()) {
      localStorage.setItem('ahamaze_player', playerName.trim());
    }
    localStorage.setItem('ahamaze_avatar', localEmoji);
    setPlayerEmoji(localEmoji);
    setShowLogin(false);
  };

  const handleGuest = () => {
    setPlayerName('');
    localStorage.removeItem('ahamaze_player');
    localStorage.setItem('ahamaze_avatar', localEmoji);
    setPlayerEmoji(localEmoji);
    setShowLogin(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto"
      onClick={() => setShowLogin(false)}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 16, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className={`relative w-full max-w-md my-auto rounded-[28px] shadow-2xl overflow-hidden border backdrop-blur-xl ${
          appIsDark
            ? 'bg-slate-900/95 border-white/10 text-white shadow-black/80'
            : 'bg-white/95 border-slate-200/80 text-slate-900 shadow-slate-400/30'
        }`}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Top ambient glow light */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full opacity-30 blur-2xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${t.playerColor}, ${t.trailColor})`,
          }}
        />

        {/* Modal Close Button */}
        <button
          onClick={() => setShowLogin(false)}
          className={`absolute top-4 right-4 z-20 p-2 rounded-full transition-all active:scale-90 ${
            appIsDark
              ? 'bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white'
              : 'bg-black/5 hover:bg-black/10 text-slate-500 hover:text-slate-900'
          }`}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="p-5 sm:p-6 flex flex-col gap-4">
          {/* Header & Avatar Showcase */}
          <div className="flex items-center gap-4 pt-1">
            {/* Big Interactive Avatar Stage */}
            <div className="relative group shrink-0">
              <div
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl p-0.5 shadow-lg flex items-center justify-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${t.playerColor}, ${t.trailColor})`,
                }}
              >
                <div
                  className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                    appIsDark ? 'bg-slate-900' : 'bg-white'
                  }`}
                >
                  <motion.div
                    key={localEmoji}
                    initial={{ scale: 0.6, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="text-3xl sm:text-4xl drop-shadow-md select-none"
                  >
                    {localEmoji}
                  </motion.div>
                </div>
              </div>
              <div
                className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-black shadow-md flex items-center gap-0.5"
                style={{
                  background: `linear-gradient(135deg, ${t.playerColor}, ${t.trailColor})`,
                  color: '#ffffff',
                }}
              >
                <Sparkles size={10} />
                <span>{lang === 'zh' ? '角色' : 'Hero'}</span>
              </div>
            </div>

            {/* Title Info */}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl tracking-tight truncate">
                  {lang === 'zh' ? '玩家档案与装扮' : 'Player Profile'}
                </h3>
              </div>
              <p
                className={`text-xs sm:text-sm mt-0.5 leading-relaxed ${
                  appIsDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {lang === 'zh'
                  ? '定制属于你的迷宫英雄专属形象'
                  : 'Customize your maze hero persona'}
              </p>
            </div>
          </div>

          {/* Nickname Input Section */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-0.5">
              <label
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  appIsDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <User size={13} className={t.text} />
                <span>{lang === 'zh' ? '探险者代号' : 'Codename'}</span>
              </label>
              <button
                type="button"
                onClick={handleRandomRoll}
                className={`text-xs font-bold flex items-center gap-1 px-2 py-0.5 rounded-md transition-all active:scale-95 ${
                  appIsDark
                    ? 'text-amber-400 hover:bg-amber-400/10'
                    : 'text-amber-600 hover:bg-amber-500/10'
                }`}
                title={lang === 'zh' ? '随机生成代号与角色' : 'Randomize name and avatar'}
              >
                <Dices size={13} />
                <span>{lang === 'zh' ? '随机灵感' : 'Random Roll'}</span>
              </button>
            </div>

            <div className="relative flex items-center">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.slice(0, 16))}
                placeholder={
                  lang === 'zh' ? '输入你的昵称 (留空为游客)...' : 'Enter your name (or Guest)...'
                }
                maxLength={16}
                className={`w-full pl-4 pr-16 py-2.5 sm:py-3 rounded-xl border text-sm sm:text-base font-bold outline-none transition-all ${
                  appIsDark
                    ? 'bg-slate-800/80 border-slate-700/80 text-white focus:border-cyan-400 focus:bg-slate-800 placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white placeholder-slate-400'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
              />
              <div className="absolute right-3 flex items-center gap-1.5 pointer-events-auto">
                {playerName && (
                  <button
                    type="button"
                    onClick={() => setPlayerName('')}
                    className={`p-1 rounded-full text-xs transition-colors ${
                      appIsDark
                        ? 'hover:bg-slate-700 text-slate-400'
                        : 'hover:bg-slate-200 text-slate-500'
                    }`}
                    aria-label="Clear input"
                  >
                    <X size={13} />
                  </button>
                )}
                <span
                  className={`text-[10px] font-mono opacity-50 ${
                    appIsDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {playerName.length}/16
                </span>
              </div>
            </div>
          </div>

          {/* Avatar Character Selection */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-0.5">
              <span
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  appIsDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <Smile size={13} className={t.text} />
                <span>{lang === 'zh' ? '挑选角色形象' : 'Choose Character'}</span>
              </span>
            </div>

            {/* Category Filter Tabs */}
            <div
              className={`flex p-1 rounded-xl gap-1 ${
                appIsDark ? 'bg-slate-800/80' : 'bg-slate-100'
              }`}
            >
              {AVATAR_GROUPS.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setActiveTab(group.id)}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === group.id
                      ? appIsDark
                        ? 'bg-slate-700 text-white shadow-sm'
                        : 'bg-white text-slate-900 shadow-sm'
                      : appIsDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {lang === 'zh' ? group.labelZh : group.labelEn}
                </button>
              ))}
            </div>

            {/* Emoji Grid Container */}
            <div
              className={`grid grid-cols-7 sm:grid-cols-8 gap-1.5 p-2 rounded-2xl max-h-[140px] sm:max-h-[160px] overflow-y-auto ${
                appIsDark
                  ? 'bg-slate-800/40 border border-slate-700/40'
                  : 'bg-slate-50/80 border border-slate-200/60'
              }`}
              style={{
                scrollbarWidth: 'thin',
              }}
            >
              {displayedEmojis.map((emoji) => {
                const isSelected = localEmoji === emoji;
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setLocalEmoji(emoji)}
                    className={`aspect-square flex items-center justify-center rounded-xl text-xl sm:text-2xl transition-all relative select-none ${
                      isSelected
                        ? 'scale-110 shadow-md ring-2 ring-offset-1 z-10 ' +
                          (appIsDark
                            ? 'ring-cyan-400 ring-offset-slate-900 bg-cyan-500/20'
                            : 'ring-blue-500 ring-offset-white bg-blue-50')
                        : appIsDark
                        ? 'hover:bg-slate-700/60 hover:scale-105 active:scale-95'
                        : 'hover:bg-slate-200/60 hover:scale-105 active:scale-95'
                    }`}
                    aria-label={`Select ${emoji}`}
                  >
                    <span>{emoji}</span>
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow">
                        <Check size={9} strokeWidth={3.5} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleGuest}
              className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 border ${
                appIsDark
                  ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700'
              }`}
            >
              {lang === 'zh' ? '作为游客游玩' : 'Play as Guest'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5"
              style={{
                background: `linear-gradient(135deg, ${t.playerColor}, ${t.trailColor})`,
              }}
            >
              <Sparkles size={14} />
              <span>{lang === 'zh' ? '保存并启程' : 'Save & Start'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});
