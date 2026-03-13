import React from 'react';
import { Theme, ActivePage, Language } from '../../types/game';
import { THEME_CONFIGS } from '../../constants/game';
import { Swords, Trophy, BarChart3, Sun, Moon, Globe, User, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface TopNavbarProps {
  appIsDark: boolean;
  theme: Theme;
  text: any; // using any for translations for now to avoid large type
  activePage: ActivePage;
  setActivePage: React.Dispatch<React.SetStateAction<ActivePage>>;
  toggleDarkLight: () => void;
  lang: Language;
  setLang: React.Dispatch<React.SetStateAction<Language>>;
  setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
  playerName: string;
  showMobileSidebar: boolean;
  setShowMobileSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TopNavbar = React.memo(function TopNavbar({
  appIsDark, theme, text, activePage, setActivePage, toggleDarkLight, lang, setLang,
  setShowLogin, playerName, showMobileSidebar, setShowMobileSidebar
}: TopNavbarProps) {
  const t = THEME_CONFIGS[theme];

  return (
    <div className="relative z-20 shrink-0 p-2 md:p-4 pb-0">
      <nav className={`flex items-center justify-between p-2 md:p-3 px-4 md:px-6 rounded-2xl border shadow-sm backdrop-blur-xl ${appIsDark ? 'bg-slate-900/40 border-white/5' : 'bg-white/60 border-black/5'}`}>

        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(135deg, ${t.playerColor}, ${t.trailColor})` }}>
            <span className="text-white font-black tracking-tighter mix-blend-overlay">AH</span>
          </div>
          <span className={`font-black tracking-tight text-lg hidden sm:block ${t.text}`}>
            {text.title}
          </span>
        </div>

        <div className={`hidden md:flex items-center p-1 rounded-xl mx-4 ${appIsDark ? 'bg-black/40' : 'bg-black/5'}`}>
          <button
            onClick={() => setActivePage('Classic')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none hover:scale-105 active:scale-95 ${activePage === 'Classic'
              ? `shadow-md ${appIsDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}`
              : `opacity-60 hover:opacity-100 ${t.text}`
              }`}
            aria-label={text.classicMode}
          >
            <Swords size={16} className={activePage === 'Classic' ? t.text : ''} /> {text.classicMode?.replace('模式', '') || 'Classic'}
          </button>
          <button
            onClick={() => setActivePage('Challenge')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-pink-500 outline-none hover:scale-105 active:scale-95 ${activePage === 'Challenge'
              ? `shadow-md text-white bg-gradient-to-r ${t.gradient}`
              : `opacity-60 hover:opacity-100 ${t.text}`
              }`}
            aria-label={text.challenge}
          >
            <Trophy size={16} /> {text.challenge}
          </button>
          <button
            onClick={() => setActivePage('Leaderboard')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-amber-500 outline-none hover:scale-105 active:scale-95 ${activePage === 'Leaderboard'
              ? `shadow-md ${appIsDark ? 'bg-amber-900/40 text-amber-500 border border-amber-500/30' : 'bg-amber-100 text-amber-600'}`
              : `opacity-60 hover:opacity-100 ${t.text}`
              }`}
            aria-label={text.leaderboard}
          >
            <BarChart3 size={16} /> {text.leaderboard}
          </button>
        </div>

        {/* Center Mobile: Simple Header Router */}
        <div className={`md:hidden flex items-center p-1 rounded-xl mx-2 ${appIsDark ? 'bg-black/40' : 'bg-black/5'}`}>
           <button
            onClick={() => setActivePage('Classic')}
            className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-opacity ${activePage === 'Classic'
              ? `shadow-sm ${appIsDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}`
              : `opacity-60 hover:opacity-100 ${t.text}`
              }`}
          >
            <Swords size={14} className={activePage === 'Classic' ? t.text : ''} />
          </button>
          <button
            onClick={() => setActivePage('Challenge')}
            className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-opacity ${activePage === 'Challenge'
              ? `shadow-sm text-white bg-gradient-to-r ${t.gradient}`
              : `opacity-60 hover:opacity-100 ${t.text}`
              }`}
          >
            <Trophy size={14} />
          </button>
          <button
            onClick={() => setActivePage('Leaderboard')}
            className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-opacity ${activePage === 'Leaderboard'
              ? `shadow-sm ${appIsDark ? 'bg-amber-900/40 text-amber-500 border border-amber-500/30' : 'bg-amber-100 text-amber-600'}`
              : `opacity-60 hover:opacity-100 ${t.text}`
              }`}
          >
            <BarChart3 size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleDarkLight} 
            className={`p-2 rounded-xl transition-all hover:scale-110 active:scale-90 focus-visible:ring-2 focus-visible:ring-yellow-400 outline-none ${appIsDark ? 'bg-white/5 hover:bg-white/10 text-yellow-300' : 'bg-black/5 hover:bg-black/10 text-slate-600'}`}
            aria-label={appIsDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {appIsDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} 
            className={`p-2 rounded-xl transition-all hover:scale-110 active:scale-90 focus-visible:ring-2 focus-visible:ring-blue-400 outline-none ${appIsDark ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-black/5 hover:bg-black/10 text-slate-600'}`}
            aria-label="Toggle language"
          >
            <Globe size={18} />
          </button>
          {/* User profile / Login */}
          <div
            onClick={() => setShowLogin(true)}
            className={`px-3 h-9 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-sm cursor-pointer hover:opacity-80 transition-all hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${appIsDark ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300' : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600'}`}
            tabIndex={0}
            role="button"
            aria-label="Player Profile"
            onKeyDown={(e) => e.key === 'Enter' && setShowLogin(true)}
          >
            <User size={16} />
            <span className="hidden md:inline-block max-w-[80px] truncate">{playerName || (lang === 'zh' ? '游客' : 'Guest')}</span>
          </div>
          {/* Mobile sidebar toggle */}
          {(activePage === 'Classic' || activePage === 'Challenge') && (
            <button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              className={`lg:hidden p-2 rounded-xl transition-all ${appIsDark ? 'bg-white/5 text-white' : 'bg-black/5 text-slate-900'}`}
            >
              <ChevronRightIcon size={18} className={showMobileSidebar ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
          )}
        </div>
      </nav>
    </div>
  );
});
