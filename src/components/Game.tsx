import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { generateMaze, solveMaze, Cell } from '../utils/maze';
import { playMoveSound, playWinSound, playBumpSound } from '../utils/audio';
import {
  RefreshCw, Trophy, Play, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Download, RotateCcw, HelpCircle, Flag, Volume2, VolumeX,
  Sun, Moon, Globe, Home, Swords, BarChart3, User, Clock, Footprints,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';

import {
  Difficulty, Theme, Language, GameMode, ActivePage, LeaderboardEntry, Position
} from '../types/game';
import {
  MAZE_SIZES, MAZE_DIFFICULTY_PARAMS, THEME_CONFIGS, TEXTS, KIDS_EMOJIS
} from '../constants/game';
import { KidsBackground } from './backgrounds/KidsBackground';
import { TopNavbar } from './layout/TopNavbar';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { InfoPanel } from './sidebar/InfoPanel';
import { ControlPanel } from './sidebar/ControlPanel';
import { ResultPanel } from './sidebar/ResultPanel';
import { LoginModal } from './modals/LoginModal';




import { MazeCanvas, Player, EndMarkerPulse, downloadMazeImage } from './game/MazeCanvas';





// --- Mobile D-pad control button ---
const ControlButton = React.memo(function ControlButton({ icon, onClick }: { icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className="w-14 h-14 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-300 active:bg-cyan-500 active:text-slate-900 active:border-cyan-400 transition-colors backdrop-blur-sm"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {icon}
    </button>
  );
});

// =====================
// --- Main Game ---
// =====================


export default function Game() {
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [theme, setTheme] = useState<Theme>('Light');
  const [lang, setLang] = useState<Language>('zh');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>('Classic');
  const [activePage, setActivePage] = useState<ActivePage>('Classic');
  const [fogCountdown, setFogCountdown] = useState(10);

  // Local Player Identity & Leaderboard
  const [playerName, setPlayerName] = useState<string>('');
  const [showLogin, setShowLogin] = useState(false);
  const [leaderboardMode, setLeaderboardMode] = useState<GameMode>('Classic');
  const [leaderboardDiff, setLeaderboardDiff] = useState<Difficulty>('Easy');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  const [maze, setMaze] = useState<Cell[][]>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'gaveUp'>('start');
  const [level, setLevel] = useState(1);
  const [moves, setMoves] = useState(0);
  const [visitedPath, setVisitedPath] = useState<Position[]>([]);
  const [optimalPath, setOptimalPath] = useState<Position[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finalTime, setFinalTime] = useState(0);

  const [replayIndex, setReplayIndex] = useState(-1);
  const [isReplaying, setIsReplaying] = useState(false);
  const replayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mobile sidebar toggle
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const playerPosRef = useRef(playerPos); playerPosRef.current = playerPos;
  const gameStateRef = useRef(gameState); gameStateRef.current = gameState;
  const mazeRef = useRef(maze); mazeRef.current = maze;
  const soundEnabledRef = useRef(soundEnabled); soundEnabledRef.current = soundEnabled;
  const startTimeRef = useRef(startTime); startTimeRef.current = startTime;
  const movesRef = useRef(moves); movesRef.current = moves; // Added movesRef

  const { width: MAZE_WIDTH, height: MAZE_HEIGHT } = MAZE_SIZES[difficulty];
  const mazeWidthRef = useRef(MAZE_WIDTH); mazeWidthRef.current = MAZE_WIDTH;
  const mazeHeightRef = useRef(MAZE_HEIGHT); mazeHeightRef.current = MAZE_HEIGHT;

  const text = TEXTS[lang];
  const t = THEME_CONFIGS[theme];
  // Determine if the current App-level requested aesthetics is dark based on the active theme
  // We use this to know which Kids mode version to show if we switch TO Kids mode.
  const appIsDark = useMemo(() => {
    // If we are IN a kids mode, we check the global body class instead
    if (theme === 'Princess' || theme === 'Starry') {
      return document.documentElement.classList.contains('dark');
    }
    return t.ambience === 'dark';
  }, [theme, t.ambience]);

  // Background pattern: use SVG dots instead of overlapping circles
  const textureBg = useMemo(() => {
    const color = appIsDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
    return `radial-gradient(${color} 2px, transparent 2px)`;
  }, [appIsDark]);

  // Handle local storage player load on boot
  useEffect(() => {
    const savedName = localStorage.getItem('ahamaze_player');
    if (savedName) {
      setPlayerName(savedName);
    } else {
      setShowLogin(true); // Prompt on very first visit
    }
  }, []);

  // Track container size for stable sizing
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

  // Force theme application for Kids mode
  useEffect(() => {
    if (activePage !== 'Classic' && activePage !== 'Challenge') return;
    if (difficulty === 'Kids') {
      setTheme(appIsDark ? 'Starry' : 'Princess');
    } else if (theme === 'Princess' || theme === 'Starry') {
      // Revert if diff changed from Kids to something else
      setTheme(appIsDark ? 'Neon' : 'Light');
    }
  }, [difficulty, appIsDark, activePage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Update body theme class to sync global dark mode toggles if needed
    if (appIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appIsDark]);

  useEffect(() => { 
    if (activePage === 'Classic' || activePage === 'Challenge') {
      setGameMode(activePage);
      startNewLevel(); 
    } else if (activePage === 'Leaderboard') {
      // Reload leaderboard data
      try {
        setLeaderboardData(JSON.parse(localStorage.getItem('ahamaze_records') || '[]'));
      } catch (e) { setLeaderboardData([]); }
      stopReplay();
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */ 
  }, [difficulty, activePage]);

  // Fog countdown timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (gameState === 'playing' && gameMode === 'Challenge' && fogCountdown > 0) {
      timer = setInterval(() => setFogCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, gameMode, fogCountdown]);

  const stopReplay = useCallback(() => {
    if (replayTimerRef.current) { clearInterval(replayTimerRef.current); replayTimerRef.current = null; }
    setIsReplaying(false); setReplayIndex(-1);
  }, []);

  const startNewLevel = useCallback(() => {
    stopReplay();
    const w = mazeWidthRef.current; const h = mazeHeightRef.current;
    setMaze(generateMaze(w, h));
    setPlayerPos({ x: 0, y: 0 }); setVisitedPath([{ x: 0, y: 0 }]); setOptimalPath([]);
    setGameState('playing'); setMoves(0); setStartTime(null); setFinalTime(0);
    setFogCountdown(10); // Reset fog timer
    setShowMobileSidebar(false);
  }, [stopReplay]);

  const handleWin = useCallback((currentMaze: Cell[][]) => {
    setGameState('won');
    const fTime = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
    setFinalTime(fTime);
    playWinSound(soundEnabledRef.current);
    const duration = 3000; const end = Date.now() + duration;
    const colors = [t.playerColor, t.endColor];
    const frame = () => {
      confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
    const w = mazeWidthRef.current; const h = mazeHeightRef.current;

    // Save Leaderboard record
    const optPath = solveMaze(currentMaze, { x: 0, y: 0 }, { x: w - 1, y: h - 1 });
    setOptimalPath(optPath);

    setTimeout(() => {
      try {
        const mvs = playerPosRef.current.x === w - 1 && playerPosRef.current.y === h - 1 ? movesRef.current : movesRef.current + 1;
        const records = JSON.parse(localStorage.getItem('ahamaze_records') || '[]');
        records.push({
          name: playerName || 'Guest',
          difficulty: difficulty,
          mode: gameMode,
          time: fTime,
          moves: mvs,
          date: new Date().toISOString()
        });
        localStorage.setItem('ahamaze_records', JSON.stringify(records));
      } catch (e) { }
    }, 100);

    setShowMobileSidebar(true);
  }, [t, playerName, difficulty, gameMode]);

  const handleMove = useCallback((dx: number, dy: number) => {
    if (gameStateRef.current !== 'playing') return;
    if (!startTimeRef.current) setStartTime(Date.now());
    const pos = playerPosRef.current; const m = mazeRef.current;
    const w = mazeWidthRef.current; const h = mazeHeightRef.current;
    const currentCell = m[pos.y][pos.x];
    const newX = pos.x + dx; const newY = pos.y + dy;
    if (newX < 0 || newX >= w || newY < 0 || newY >= h) { playBumpSound(soundEnabledRef.current); return; }
    if (dx === 1 && currentCell.walls.right) { playBumpSound(soundEnabledRef.current); return; }
    if (dx === -1 && currentCell.walls.left) { playBumpSound(soundEnabledRef.current); return; }
    if (dy === 1 && currentCell.walls.bottom) { playBumpSound(soundEnabledRef.current); return; }
    if (dy === -1 && currentCell.walls.top) { playBumpSound(soundEnabledRef.current); return; }
    const newPos = { x: newX, y: newY };
    setVisitedPath((prev) => [...prev, newPos]); setPlayerPos(newPos);
    setMoves((m) => {
      movesRef.current = m + 1;
      return m + 1;
    });
    playMoveSound(soundEnabledRef.current);
    if (newX === w - 1 && newY === h - 1) handleWin(m);
  }, [handleWin]);

  const restartLevel = useCallback(() => {
    stopReplay();
    setPlayerPos({ x: 0, y: 0 }); setVisitedPath([{ x: 0, y: 0 }]);
    setGameState('playing'); setMoves(0); setStartTime(null); setFinalTime(0); setOptimalPath([]);
    setShowMobileSidebar(false);
  }, [stopReplay]);

  const handleGiveUp = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    stopReplay(); setGameState('gaveUp');
    setFinalTime(startTimeRef.current ? Date.now() - startTimeRef.current : 0);
    const m = mazeRef.current; const w = mazeWidthRef.current; const h = mazeHeightRef.current;
    setOptimalPath(solveMaze(m, { x: 0, y: 0 }, { x: w - 1, y: h - 1 }));
    setShowMobileSidebar(true);
  }, [stopReplay]);

  const startReplay = useCallback(() => {
    if (visitedPath.length < 2) return;
    stopReplay(); setIsReplaying(true); setReplayIndex(0);
    const speed = Math.max(40, Math.min(150, 8000 / visitedPath.length));
    let idx = 0;
    replayTimerRef.current = setInterval(() => {
      idx++;
      if (idx >= visitedPath.length) {
        if (replayTimerRef.current) clearInterval(replayTimerRef.current);
        replayTimerRef.current = null; setIsReplaying(false); setReplayIndex(-1);
        return;
      }
      setReplayIndex(idx);
    }, speed);
  }, [visitedPath, stopReplay]);

  const handleDownload = useCallback(() => {
    downloadMazeImage(maze, visitedPath, optimalPath, theme, MAZE_WIDTH, MAZE_HEIGHT, moves, finalTime, level, difficulty, lang);
  }, [maze, visitedPath, optimalPath, theme, MAZE_WIDTH, MAZE_HEIGHT, moves, finalTime, level, difficulty, lang]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current !== 'playing') return;
      switch (e.key) {
        case 'ArrowUp': case 'w': handleMove(0, -1); break;
        case 'ArrowDown': case 's': handleMove(0, 1); break;
        case 'ArrowLeft': case 'a': handleMove(-1, 0); break;
        case 'ArrowRight': case 'd': handleMove(1, 0); break;
        case 'r': case 'R': startNewLevel(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, startNewLevel]);

  // Gamepad
  useEffect(() => {
    let reqId: number;
    let lastMoveTime = 0;
    const COOLDOWN = 140; // ms between consecutive stick moves
    const THRESHOLD = 0.4; // analog stick threshold

    const pollGamepad = () => {
      reqId = requestAnimationFrame(pollGamepad);

      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const now = Date.now();
      if (now - lastMoveTime < COOLDOWN) return;

      for (const gp of gamepads) {
        if (!gp) continue;

        // Start button (Index 9) to generate new maze
        if (gp.buttons[9]?.pressed) {
          startNewLevel();
          lastMoveTime = now + 500; // block inputs for half a second
          break;
        }

        if (gameStateRef.current !== 'playing') continue;

        let dx = 0, dy = 0;

        // D-pad (Standard mapping: 12=Up, 13=Down, 14=Left, 15=Right)
        if (gp.buttons[12]?.pressed) dy = -1;
        else if (gp.buttons[13]?.pressed) dy = 1;
        else if (gp.buttons[14]?.pressed) dx = -1;
        else if (gp.buttons[15]?.pressed) dx = 1;

        // Left Stick (Axes 0=X, 1=Y)
        else if (gp.axes[1] && gp.axes[1] < -THRESHOLD) dy = -1;
        else if (gp.axes[1] && gp.axes[1] > THRESHOLD) dy = 1;
        else if (gp.axes[0] && gp.axes[0] < -THRESHOLD) dx = -1;
        else if (gp.axes[0] && gp.axes[0] > THRESHOLD) dx = 1;

        if (dx !== 0 || dy !== 0) {
          handleMove(dx, dy);
          lastMoveTime = now;
          break; // Process only one directional input from the first active controller
        }
      }
    };
    reqId = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(reqId);
  }, [handleMove, startNewLevel]);

  // Touch
  const handleTouchStart = useCallback((e: React.TouchEvent) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const te = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const dx = te.x - touchStart.current.x; const dy = te.y - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) { if (Math.abs(dx) > 30) handleMove(dx > 0 ? 1 : -1, 0); }
    else { if (Math.abs(dy) > 30) handleMove(0, dy > 0 ? 1 : -1); }
    touchStart.current = null;
  }, [handleMove]);

  const moveUp = useCallback(() => handleMove(0, -1), [handleMove]);
  const moveDown = useCallback(() => handleMove(0, 1), [handleMove]);
  const moveLeft = useCallback(() => handleMove(-1, 0), [handleMove]);
  const moveRight = useCallback(() => handleMove(1, 0), [handleMove]);

  const formatTime = (ms: number) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`; };
  const optLen = optimalPath.length > 0 ? optimalPath.length - 1 : 0;
  const efficiency = optLen > 0 ? Math.round((optLen / moves) * 100) : 0;
  const isFinished = gameState === 'won' || gameState === 'gaveUp';
  const rating = efficiency >= 95 ? 'Perfect' : efficiency >= 85 ? 'Excellent' : efficiency >= 70 ? 'Good' : efficiency >= 50 ? 'Fair' : 'Lost in Maze';

  // Toggle between dark/light base on current theme
  const toggleDarkLight = () => {
    if (difficulty === 'Kids') return; // Cannot toggle theme in Kids mode
    if (appIsDark) {
      setTheme(theme === 'Retro' ? 'Retro' : (theme === 'Neon' ? 'Light' : 'Amber'));
    } else {
      setTheme(theme === 'Light' ? 'Neon' : 'Sunset');
    }
  };

  // --- Sidebar Action Button ---
  const SidebarBtn = ({ icon, label, onClick, primary, disabled: dis }: { icon: React.ReactNode; label: string; onClick: () => void; primary?: boolean; disabled?: boolean }) => (
    <button
      onClick={onClick}
      disabled={dis}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${primary
        ? 'text-white shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95'
        : dis
          ? 'opacity-40 cursor-not-allowed'
          : appIsDark ? 'bg-white/5 hover:bg-white/10 text-slate-200' : 'bg-black/5 hover:bg-black/10 text-slate-700'
        }`}
      style={primary ? { background: `linear-gradient(135deg, ${t.playerColor}, ${t.trailColor})` } : undefined}
    >
      <div className={primary ? 'opacity-90' : 'opacity-70'}>{icon}</div>
      <span className="tracking-wide">{label}</span>
    </button>
  );

  // =========================================
  // RENDER
  // =========================================
  return (
    <div
      className={`fixed inset-0 flex flex-col font-sans overflow-hidden select-none transition-colors duration-200 ${t.bg} ${t.text}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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

        {/* LEFT: Maze Area (70% - 75%) */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-w-0" ref={containerRef}>
          {/* Maze container Glow */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[70%] h-[70%] blur-[80px] opacity-20 rounded-full transition-colors duration-1000" style={{ backgroundColor: t.playerColor }} />
          </div>
          {/* Maze container glass frame */}
          <div
            className={`relative backdrop-blur-md rounded-2xl shadow-xl border transition-all duration-500 ease-out flex items-center justify-center p-2 md:p-3 ${t.containerBg} ${t.containerBorder}`}
            style={{ width: 'fit-content', height: 'fit-content', maxWidth: '100%', maxHeight: '100%' }}
          >
            {/* The inner bounds that wrap the maze, with a small padding so walls don't clip against rounded border */}
            <div
              className={`relative overflow-hidden rounded-xl border p-1 md:p-1.5 ${appIsDark ? 'border-white/5 bg-black/10' : 'border-black/5 bg-white/30'}`}
            >
              <div className="relative" style={{ width: MAZE_WIDTH * cellSize, height: MAZE_HEIGHT * cellSize }}>
                {maze.length > 0 && (
                  <>
                    <MazeCanvas maze={maze} cellSize={cellSize} mazeWidth={MAZE_WIDTH} mazeHeight={MAZE_HEIGHT}
                      theme={theme} visitedPath={visitedPath} optimalPath={optimalPath} replayIndex={replayIndex} difficulty={difficulty}
                      gameMode={gameMode} fogCountdown={fogCountdown} playerPos={playerPos} />
                    {!isFinished && (
                      <EndMarkerPulse mazeWidth={MAZE_WIDTH} mazeHeight={MAZE_HEIGHT} cellSize={cellSize} theme={theme} isKidsMode={difficulty === 'Kids'} />
                    )}
                    {!isReplaying && (
                      <Player position={playerPos} size={cellSize} theme={theme} isKidsMode={difficulty === 'Kids'} />
                    )}
                  </>
                )}

                {/* Fog Countdown UI overlay on maze */}
                {gameMode === 'Challenge' && fogCountdown > 0 && !isFinished && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
                    <motion.div
                      key={fogCountdown} // forces re-render animation each second
                      initial={{ opacity: 0, y: -10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`px-4 py-2 rounded-full backdrop-blur-md border shadow-lg font-bold flex items-center gap-2 ${appIsDark ? 'bg-slate-900/80 border-rose-500/50 text-rose-400' : 'bg-white/80 border-red-500/50 text-red-600'}`}
                    >
                      <Clock size={16} className={fogCountdown <= 3 ? 'animate-pulse' : ''} />
                      {text.fogWarning || 'Fog in'} {fogCountdown}s
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop keyboard hints */}
          <div className={`hidden lg:flex mt-6 text-sm font-mono gap-8 opacity-60 ${t.text}`}>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-widest uppercase opacity-80">Controls</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 border border-current rounded/80 bg-black/5 dark:bg-white/5">W A S D / Arrow Keys</span>
              <span>— Move</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 border border-current rounded/80 bg-black/5 dark:bg-white/5">R</span>
              <span>— Generate New Maze</span>
            </div>
          </div>

          {/* Mobile D-pad */}
          <div className="lg:hidden mt-3 shrink-0">
            <div className="grid grid-cols-3 gap-2">
              <div />
              <ControlButton icon={<ChevronUp size={22} />} onClick={moveUp} />
              <div />
              <ControlButton icon={<ChevronLeft size={22} />} onClick={moveLeft} />
              <ControlButton icon={<ChevronDown size={22} />} onClick={moveDown} />
              <ControlButton icon={<ChevronRight size={22} />} onClick={moveRight} />
            </div>
          </div>
        </div>

        {/* RIGHT: Sidebar (30%) */}
        <aside className={`
          ${showMobileSidebar ? 'translate-x-0' : 'translate-x-[110%]'}
          lg:translate-x-0 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          absolute lg:relative right-2 lg:right-0 top-0 bottom-0 z-30
          w-[360px] lg:w-[400px] shrink-0 flex flex-col py-0 md:py-1
        `}>
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto overflow-x-hidden pr-2 pb-2">

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
            />

            {/* --- Victory Result --- */}
            {isFinished && (
              <div className={`p-5 rounded-2xl border shadow-md flex flex-col gap-3 flex-1 backdrop-blur-md ${appIsDark ? 'bg-slate-900/60 border-white/5' : 'bg-white/70 border-white'}`} style={gameState === 'won' ? { boxShadow: `0 0 30px ${t.playerColor}20`, borderColor: `${t.playerColor}40` } : undefined}>
                {gameState === 'won' ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl text-yellow-500 bg-yellow-500/10">
                        <Trophy className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-xl font-black tracking-wider">{text.cleared}</div>
                      </div>
                    </div>

                    <div className="text-lg font-mono mt-1 opacity-90">{text.timer}: {formatTime(finalTime)}</div>

                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className={`flex justify-between items-center text-sm font-bold border-b pb-1.5 ${appIsDark ? 'border-white/10 text-white/70' : 'border-black/5 text-black/60'}`}>
                        <span>{text.optimal}:</span>
                        <span className="font-mono text-emerald-500">{optLen}</span>
                      </div>
                      <div className={`flex justify-between items-center text-sm font-bold border-b pb-1.5 ${appIsDark ? 'border-white/10 text-white/70' : 'border-black/5 text-black/60'}`}>
                        <span>{text.moves}:</span>
                        <span className="font-mono">{moves}</span>
                      </div>
                      <div className={`flex justify-between items-center text-sm font-bold border-b pb-1.5 ${appIsDark ? 'border-white/10 text-white/70' : 'border-black/5 text-black/60'}`}>
                        <span>{text.efficiency}:</span>
                        <span className="font-mono font-black" style={{ color: efficiency >= 90 ? '#10b981' : efficiency >= 60 ? '#f59e0b' : '#ef4444' }}>{efficiency}%</span>
                      </div>
                      <div className="flex justify-between items-center text-base font-black pt-1">
                        <span>Rating:</span>
                        <span className="uppercase tracking-widest drop-shadow-sm" style={{ color: t.playerColor }}>{rating}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl text-red-500 bg-red-500/10">
                        <Flag className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-xl font-black tracking-wider text-red-500">{text.gaveUp}</div>
                      </div>
                    </div>

                    <div className="text-lg font-mono mt-1 opacity-80">{text.timer}: {formatTime(finalTime)}</div>

                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className={`flex justify-between items-center text-sm font-bold border-b pb-1.5 ${appIsDark ? 'border-white/10 text-white/70' : 'border-black/5 text-black/60'}`}>
                        <span>{text.solutionSteps}:</span>
                        <span className="font-mono text-emerald-500">{optLen}</span>
                      </div>
                      <div className={`flex justify-between items-center text-sm font-bold border-b pb-1.5 ${appIsDark ? 'border-white/10 text-white/70' : 'border-black/5 text-black/60'}`}>
                        <span>{text.moves}:</span>
                        <span className="font-mono">{moves}</span>
                      </div>
                      <div className="flex justify-between items-center text-base font-black pt-1">
                        <span>Rating:</span>
                        <span className="uppercase tracking-widest text-red-500">Lost in Maze</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

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
        <LoginModal
          showLogin={showLogin}
          setShowLogin={setShowLogin}
          appIsDark={appIsDark}
          theme={theme}
          lang={lang}
          playerName={playerName}
          setPlayerName={setPlayerName}
        />
      </AnimatePresence>
    </div>
  );
}
