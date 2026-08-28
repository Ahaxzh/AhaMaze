import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
  Sparkles,
  RefreshCw,
  Volume2,
  VolumeX,
  HelpCircle,
  Play,
} from 'lucide-react';

import {
  Difficulty,
  Theme,
  Language,
  GameMode,
  ActivePage,
  LeaderboardEntry,
} from '../types/game';
import {
  MAZE_SIZES,
  THEME_CONFIGS,
  TEXTS,
  STORY_MATCH_MAP,
} from '../constants/game';
import { KidsBackground } from './backgrounds/KidsBackground';
import { TopNavbar } from './layout/TopNavbar';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { InfoPanel } from './sidebar/InfoPanel';
import { ControlPanel } from './sidebar/ControlPanel';
import { ResultPanel } from './sidebar/ResultPanel';
import { LoginModal } from './modals/LoginModal';
import {
  MazeCanvas,
  Player,
  EndMarkerPulse,
} from './game/MazeCanvas';

import { usePlayerProfile } from '../hooks/usePlayerProfile';
import { useMazeGame } from '../hooks/useMazeGame';
import { useGamepad } from '../hooks/useGamepad';
import { useKeyboard } from '../hooks/useKeyboard';
import { useTouchSwipe } from '../hooks/useTouchSwipe';

const ControlButton = React.memo(function ControlButton({
  icon,
  onClick,
  ariaLabel,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-800/95 border border-slate-700/90 flex items-center justify-center text-slate-100 active:bg-cyan-500 active:text-slate-950 active:scale-90 active:border-cyan-300 transition-all shadow-lg touch-manipulation cursor-pointer select-none"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  );
});

// =====================
// --- Main Game ---
// =====================
export default function Game() {
  const [difficulty, setDifficulty] = useState<Difficulty>('Kids');
  const [theme, setTheme] = useState<Theme>('Princess');
  const [lang, setLang] = useState<Language>('zh');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>('Classic');
  const [activePage, setActivePage] = useState<ActivePage>('Classic');

  // Mobile sidebar toggle
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Leaderboard filters & data
  const [leaderboardMode, setLeaderboardMode] = useState<GameMode>('Classic');
  const [leaderboardDiff, setLeaderboardDiff] = useState<Difficulty>('Kids');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  // Profile hook
  const {
    playerName,
    setPlayerName,
    playerEmoji,
    setPlayerEmoji,
    showLogin,
    setShowLogin,
  } = usePlayerProfile();

  // Core Game hook
  const {
    maze,
    playerPos,
    gameState,
    level,
    moves,
    visitedPath,
    optimalPath,
    startTime,
    finalTime,
    fogCountdown,
    replayIndex,
    isReplaying,
    isFinished,
    facing,
    optLen,
    efficiency,
    rating,
    mazeWidth: MAZE_WIDTH,
    mazeHeight: MAZE_HEIGHT,
    startNewLevel,
    restartLevel,
    handleGiveUp,
    handleMove,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    startReplay,
    stopReplay,
  } = useMazeGame({
    difficulty,
    gameMode,
    theme,
    soundEnabled,
    playerName,
    onGameEnd: () => {
      // Keep mobile screen unobstructed so player can see celebration & replay
    },
  });

  // Controls hooks (event-driven, 0 CPU polling when idle/no gamepad)
  const closeMobileSidebar = useCallback(() => setShowMobileSidebar(false), []);

  const onPlayerMove = useCallback(
    (dx: number, dy: number) => {
      setShowMobileSidebar(false);
      handleMove(dx, dy);
    },
    [handleMove]
  );

  const controlsEnabled = gameState === 'playing' && !showLogin;
  useGamepad({
    enabled: controlsEnabled,
    onMove: onPlayerMove,
    onRestart: startNewLevel,
  });
  useKeyboard({
    enabled: controlsEnabled,
    onMove: onPlayerMove,
    onRestart: startNewLevel,
  });
  const { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel } = useTouchSwipe({
    enabled: controlsEnabled,
    onMove: onPlayerMove,
  });

  // Responsive maze container sizing
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateContainerSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };
    updateContainerSize();
    const observer = new ResizeObserver(updateContainerSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Synchronous cell size calculation to prevent layout jumps
  const cellSize = useMemo(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return 30;
    const isMobile = window.innerWidth < 768;
    const padWidth = isMobile ? 32 : 64;
    const padHeight = isMobile ? 280 : 120;
    const maxAvailableWidth = containerSize.width - padWidth;
    const maxAvailableHeight = containerSize.height - padHeight;
    const size = Math.min(
      maxAvailableWidth / MAZE_WIDTH,
      maxAvailableHeight / MAZE_HEIGHT,
      120
    );
    return Math.max(size, 6);
  }, [containerSize, MAZE_WIDTH, MAZE_HEIGHT]);

  const text = TEXTS[lang];
  const t = THEME_CONFIGS[theme];
  const appIsDark = useMemo(() => t.ambience === 'dark', [t.ambience]);

  // Background pattern: use SVG dots
  const textureBg = useMemo(() => {
    const color = appIsDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
    return `radial-gradient(${color} 2px, transparent 2px)`;
  }, [appIsDark]);

  // Force theme application for Kids mode
  useEffect(() => {
    if (activePage !== 'Classic' && activePage !== 'Challenge') return;
    if (difficulty === 'Kids') {
      setTheme(appIsDark ? 'Starry' : 'Princess');
    } else if (theme === 'Princess' || theme === 'Starry') {
      setTheme(appIsDark ? 'Neon' : 'Light');
    }
  }, [difficulty, appIsDark, activePage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync dark class on documentElement
  useEffect(() => {
    if (appIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appIsDark]);

  // Handle page switches
  useEffect(() => {
    if (activePage === 'Classic' || activePage === 'Challenge') {
      setGameMode(activePage);
    } else if (activePage === 'Leaderboard') {
      try {
        setLeaderboardData(JSON.parse(localStorage.getItem('ahamaze_records') || '[]'));
      } catch {
        setLeaderboardData([]);
      }
      stopReplay();
    }
  }, [activePage, stopReplay]);

  // Toggle dark/light mode
  const toggleDarkLight = useCallback(() => {
    if (difficulty === 'Kids') {
      setTheme((prev) => (prev === 'Princess' ? 'Starry' : 'Princess'));
      return;
    }
    if (appIsDark) {
      setTheme((prev) => (prev === 'Retro' ? 'Retro' : prev === 'Neon' ? 'Light' : 'Amber'));
    } else {
      setTheme((prev) => (prev === 'Light' ? 'Neon' : 'Sunset'));
    }
  }, [difficulty, appIsDark]);

  return (
    <div
      className={`fixed inset-0 flex flex-col font-sans overflow-hidden select-none ${t.bg} ${t.text}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      {/* Background texture */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {difficulty === 'Kids' ? (
          <KidsBackground isDark={appIsDark} />
        ) : (
          <div className="absolute inset-0" style={{ backgroundImage: textureBg }} />
        )}
      </div>

      {/* ========== TOP NAVBAR ========== */}
      <TopNavbar
        appIsDark={appIsDark}
        theme={theme}
        text={text}
        activePage={activePage}
        setActivePage={setActivePage}
        toggleDarkLight={toggleDarkLight}
        lang={lang}
        setLang={setLang}
        setShowLogin={setShowLogin}
        playerName={playerName}
        showMobileSidebar={showMobileSidebar}
        setShowMobileSidebar={setShowMobileSidebar}
      />

      {/* ========== MAIN CONTENT (maze + sidebar) ========== */}
      {(activePage === 'Classic' || activePage === 'Challenge') && (
        <div className="flex-1 flex overflow-hidden relative z-10 p-2 md:p-4 pb-4 gap-4 md:gap-6">
          {/* LEFT: Maze Area */}
          <div
            className="flex-1 flex flex-col items-center justify-center relative min-w-0"
            ref={containerRef}
          >
            {/* Maze container Glow - hardware accelerated radial gradient, zero blur compositing */}
            <div
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${t.playerColor} 0%, transparent 65%)`,
              }}
            />

            {/* Banner: Hint State Banner or Kids Story Pairing Banner */}
            {gameState === 'gaveUp' ? (
              <div className="mb-2 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-black text-xs md:text-sm tracking-wide shadow-sm select-none animate-pulse-soft">
                <span>🪄</span>
                <span>{lang === 'zh' ? '魔法路线已标出，跟着走就能到终点啦！' : 'Hint path revealed, follow it to the goal!'}</span>
              </div>
            ) : (
              difficulty === 'Kids' && playerEmoji && STORY_MATCH_MAP[playerEmoji] && (
                <div className="mb-2 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-300 font-black text-xs md:text-sm tracking-wide shadow-sm select-none">
                  <span className="text-base">{playerEmoji}</span>
                  <span>{lang === 'zh' ? STORY_MATCH_MAP[playerEmoji].titleZh : STORY_MATCH_MAP[playerEmoji].titleEn}</span>
                  <span className="text-base">{STORY_MATCH_MAP[playerEmoji].goal}</span>
                </div>
              )
            )}

            {/* Maze container glass frame */}
            <div
              className={`relative rounded-2xl shadow-xl border ease-out flex items-center justify-center p-2 md:p-3 ${t.containerBg} ${t.containerBorder}`}
              style={{
                width: 'fit-content',
                height: 'fit-content',
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            >
              {/* Inner bounds */}
              <div
                className={`relative overflow-hidden rounded-xl border p-1 md:p-1.5 ${
                  appIsDark ? 'border-white/5 bg-black/10' : 'border-black/5 bg-white/30'
                }`}
              >
                <div
                  className="relative"
                  style={{
                    width: MAZE_WIDTH * cellSize,
                    height: MAZE_HEIGHT * cellSize,
                  }}
                >
                  {maze.length > 0 && (
                    <>
                      <MazeCanvas
                        maze={maze}
                        cellSize={cellSize}
                        mazeWidth={MAZE_WIDTH}
                        mazeHeight={MAZE_HEIGHT}
                        theme={theme}
                        visitedPath={visitedPath}
                        optimalPath={optimalPath}
                        replayIndex={replayIndex}
                        difficulty={difficulty}
                        gameMode={gameMode}
                        fogCountdown={fogCountdown}
                        playerPos={playerPos}
                      />
                      <EndMarkerPulse
                        mazeWidth={MAZE_WIDTH}
                        mazeHeight={MAZE_HEIGHT}
                        cellSize={cellSize}
                        theme={theme}
                        isKidsMode={difficulty === 'Kids'}
                        playerEmoji={playerEmoji}
                      />
                      {!isReplaying && (
                        <Player
                          position={playerPos}
                          size={cellSize}
                          theme={theme}
                          isKidsMode={difficulty === 'Kids'}
                          playerEmoji={playerEmoji}
                          facing={facing}
                        />
                      )}
                    </>
                  )}

                  {/* Fog Countdown UI overlay on maze */}
                  {gameMode === 'Challenge' && fogCountdown > 0 && !isFinished && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
                      <motion.div
                        key={fogCountdown}
                        initial={{ opacity: 0, y: -10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`px-4 py-2 rounded-full border shadow-lg font-bold flex items-center gap-2 ${
                          appIsDark
                            ? 'bg-slate-900/95 border-rose-500/60 text-rose-400'
                            : 'bg-white/95 border-red-500/60 text-red-600'
                        }`}
                      >
                        <Clock
                          size={16}
                          className={fogCountdown <= 3 ? 'animate-pulse' : ''}
                        />
                        {text.fogWarning || 'Fog in'} {fogCountdown}s
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop keyboard hints */}
            <div
              className={`hidden lg:flex mt-6 text-sm font-mono gap-8 opacity-60 ${t.text}`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-widest uppercase opacity-80">
                  Controls
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 border border-current rounded/80 bg-black/5 dark:bg-white/5">
                  W A S D / Arrow Keys
                </span>
                <span>— Move</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 border border-current rounded/80 bg-black/5 dark:bg-white/5">
                  R
                </span>
                <span>— Generate New Maze</span>
              </div>
            </div>

            {/* Mobile Controls Section: Action Pill Bar + Spacious D-Pad */}
            <div className="lg:hidden mt-2 shrink-0 flex flex-col items-center gap-2.5 w-full max-w-sm mx-auto px-2 select-none">
              {/* 1. Quick Action Pill Bar */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 w-full">
                {/* New Maze Button */}
                <button
                  type="button"
                  onClick={() => startNewLevel()}
                  className="flex-1 py-2 px-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-500 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all touch-manipulation cursor-pointer"
                >
                  <RefreshCw size={15} />
                  <span>{difficulty === 'Kids' ? '新关卡' : '新迷宫'}</span>
                </button>

                {/* Hint Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isFinished) restartLevel();
                    else handleGiveUp();
                  }}
                  className="flex-1 py-2 px-2.5 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-500 dark:text-purple-400 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all touch-manipulation cursor-pointer"
                >
                  <HelpCircle size={15} />
                  <span>{difficulty === 'Kids' ? '帮帮我' : '提示'}</span>
                </button>

                {/* Path Replay Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isReplaying) stopReplay();
                    else if (visitedPath.length >= 2) startReplay();
                  }}
                  disabled={visitedPath.length < 2}
                  className={`flex-1 py-2 px-2.5 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all touch-manipulation cursor-pointer ${
                    isReplaying
                      ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                      : visitedPath.length >= 2
                      ? 'bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/30 text-cyan-500 dark:text-cyan-400'
                      : 'opacity-40 bg-slate-500/10 border-slate-500/20 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Play size={15} fill={isReplaying ? 'currentColor' : 'none'} className={isReplaying ? 'animate-spin' : ''} />
                  <span>{isReplaying ? '停止' : '回放'}</span>
                </button>

                {/* Sound Toggle */}
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`py-2 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all touch-manipulation cursor-pointer ${
                    soundEnabled
                      ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-500 dark:text-emerald-400'
                      : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                  }`}
                  aria-label={soundEnabled ? 'Mute' : 'Unmute'}
                  title={soundEnabled ? 'Mute' : 'Unmute'}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
              </div>

              {/* 2. Big Spacious Ergonomic D-Pad */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 p-2 rounded-3xl bg-black/25 border border-white/10 shadow-xl max-w-[230px] mx-auto">
                <div />
                <ControlButton
                  icon={<ChevronUp size={28} />}
                  onClick={() => onPlayerMove(0, -1)}
                  ariaLabel="Move Up"
                />
                <div />
                <ControlButton
                  icon={<ChevronLeft size={28} />}
                  onClick={() => onPlayerMove(-1, 0)}
                  ariaLabel="Move Left"
                />
                <ControlButton
                  icon={<ChevronDown size={28} />}
                  onClick={() => onPlayerMove(0, 1)}
                  ariaLabel="Move Down"
                />
                <ControlButton
                  icon={<ChevronRight size={28} />}
                  onClick={() => onPlayerMove(1, 0)}
                  ariaLabel="Move Right"
                />
              </div>
            </div>
          </div>

          {/* Mobile backdrop overlay */}
          {showMobileSidebar && (
            <div
              className="lg:hidden fixed inset-0 bg-black/60 z-35 transition-opacity"
              onClick={closeMobileSidebar}
              aria-label="Close sidebar backdrop"
            />
          )}

          {/* RIGHT: Sidebar / Mobile Drawer */}
          <aside
            className={`
            ${showMobileSidebar ? 'translate-x-0' : 'translate-x-[115%]'}
            lg:translate-x-0 transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)
            fixed lg:relative top-[4.5rem] lg:top-0 right-3 lg:right-0 bottom-3 lg:bottom-0 z-40 lg:z-30
            w-[calc(100vw-1.5rem)] sm:w-[380px] lg:w-[400px] max-w-[400px] shrink-0 flex flex-col
            rounded-[28px] border shadow-2xl overflow-hidden
            ${appIsDark ? 'bg-slate-900/95 border-white/10 text-white' : 'bg-white/95 border-slate-200 text-slate-800'}
          `}
          >
            {/* Mobile Drawer Header with clearance from navbar */}
            <div
              className={`lg:hidden flex items-center justify-between px-4 py-3 border-b shrink-0 ${
                appIsDark ? 'bg-slate-900/95 border-white/10' : 'bg-white/95 border-black/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} className={t.text} />
                <span className="text-sm font-black tracking-tight">
                  {lang === 'zh' ? '控制中心与数据' : 'Game Dashboard'}
                </span>
              </div>
              <button
                onClick={closeMobileSidebar}
                className={`p-1.5 rounded-full transition-colors active:scale-90 ${
                  appIsDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-black/5 text-slate-500 hover:text-slate-900'
                }`}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto overflow-x-hidden p-3 sm:p-4">
              {/* --- Victory / Hint Result (Shown prominently at top when finished) --- */}
              {isFinished && (
                <ResultPanel
                  isFinished={isFinished}
                  appIsDark={appIsDark}
                  gameState={gameState}
                  theme={theme}
                  text={text}
                  finalTime={finalTime}
                  optLen={optLen}
                  moves={moves}
                  efficiency={efficiency}
                  rating={rating}
                  lang={lang}
                  isKidsMode={difficulty === 'Kids'}
                  startReplay={startReplay}
                  stopReplay={stopReplay}
                  isReplaying={isReplaying}
                  startNewLevel={startNewLevel}
                  restartLevel={restartLevel}
                  onAction={closeMobileSidebar}
                />
              )}

              {/* --- Stats & Mini Map Panel --- */}
              <InfoPanel
                appIsDark={appIsDark}
                text={text}
                maze={maze}
                mazeWidth={MAZE_WIDTH}
                mazeHeight={MAZE_HEIGHT}
                theme={theme}
                visitedPath={visitedPath}
                optimalPath={optimalPath}
                replayIndex={replayIndex}
                difficulty={difficulty}
                startTime={startTime}
                gameState={gameState}
                moves={moves}
                visible={showMobileSidebar}
              />

              {/* --- Game Controls --- */}
              <ControlPanel
                appIsDark={appIsDark}
                text={text}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                theme={theme}
                isFinished={isFinished}
                gameState={gameState}
                restartLevel={restartLevel}
                handleGiveUp={handleGiveUp}
                startNewLevel={startNewLevel}
                isReplaying={isReplaying}
                startReplay={startReplay}
                stopReplay={stopReplay}
                soundEnabled={soundEnabled}
                setSoundEnabled={setSoundEnabled}
                onAction={closeMobileSidebar}
              />
            </div>
          </aside>
        </div>
      )}

      {/* ========== LEADERBOARD PAGE ========== */}
      {activePage === 'Leaderboard' && (
        <LeaderboardPage
          appIsDark={appIsDark}
          lang={lang}
          text={text}
          leaderboardMode={leaderboardMode}
          setLeaderboardMode={setLeaderboardMode}
          leaderboardDiff={leaderboardDiff}
          setLeaderboardDiff={setLeaderboardDiff}
          leaderboardData={leaderboardData}
        />
      )}

      {/* ========== MODALS ========== */}
      <AnimatePresence>
        {showLogin && (
          <LoginModal
            showLogin={showLogin}
            setShowLogin={setShowLogin}
            appIsDark={appIsDark}
            theme={theme}
            lang={lang}
            playerName={playerName}
            setPlayerName={setPlayerName}
            playerEmoji={playerEmoji}
            setPlayerEmoji={setPlayerEmoji}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
