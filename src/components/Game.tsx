import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { generateMaze, solveMaze, Cell } from '../utils/maze';
import { playMoveSound, playWinSound, playBumpSound } from '../utils/audio';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RefreshCw, Trophy, Play, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Settings, X, Volume2, VolumeX, Moon, Sun, Monitor } from 'lucide-react';

// --- Constants & Types ---
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Theme = 'Neon' | 'Retro' | 'Light';
type Language = 'en' | 'zh';

const DIFFICULTY_SETTINGS: Record<Difficulty, { width: number; height: number }> = {
  Easy: { width: 25, height: 25 },
  Medium: { width: 35, height: 35 },
  Hard: { width: 45, height: 45 },
};

const THEMES: Record<Theme, any> = {
  Neon: {
    bg: 'bg-slate-950',
    text: 'text-slate-200',
    cellBg: 'bg-slate-900/50',
    wall: 'bg-slate-700',
    player: 'bg-cyan-400',
    trail: 'bg-cyan-500/30',
    visited: 'bg-cyan-500/5',
    end: 'bg-pink-500',
    accent: 'text-cyan-400',
    gradient: 'from-cyan-400 to-purple-500',
    trailColor: '#22d3ee',
  },
  Retro: {
    bg: 'bg-black',
    text: 'text-green-400',
    cellBg: 'bg-green-900/20',
    wall: 'bg-green-600',
    player: 'bg-green-400',
    trail: 'bg-green-500/30',
    visited: 'bg-green-500/10',
    end: 'bg-yellow-400',
    accent: 'text-green-400',
    gradient: 'from-green-400 to-green-600',
    trailColor: '#4ade80',
  },
  Light: {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    cellBg: 'bg-white',
    wall: 'bg-slate-400',
    player: 'bg-blue-500',
    trail: 'bg-blue-500/30',
    visited: 'bg-blue-500/5',
    end: 'bg-red-500',
    accent: 'text-blue-600',
    gradient: 'from-blue-500 to-indigo-600',
    trailColor: '#3b82f6',
  },
};

const TEXTS: Record<Language, any> = {
  en: {
    title: 'MAZE',
    moves: 'MOVES',
    level: 'LVL',
    reset: 'RESET',
    settings: 'SETTINGS',
    sound: 'Sound',
    theme: 'Theme',
    language: 'Language',
    cleared: 'CLEARED',
    completedIn: 'COMPLETED IN',
    optimal: 'OPTIMAL',
    nextLevel: 'NEXT LEVEL',
    replay: 'REPLAY',
    easy: 'EASY',
    medium: 'MEDIUM',
    hard: 'HARD',
    close: 'CLOSE',
  },
  zh: {
    title: '迷宫',
    moves: '步数',
    level: '关卡',
    reset: '重置',
    settings: '设置',
    sound: '音效',
    theme: '主题',
    language: '语言',
    cleared: '通关成功',
    completedIn: '完成步数',
    optimal: '最优步数',
    nextLevel: '下一关',
    replay: '重玩本关',
    easy: '简单',
    medium: '中等',
    hard: '困难',
    close: '关闭',
  },
};

type Position = { x: number; y: number };

// --- Components ---

interface MazeCellProps {
  cell: Cell;
  size: number;
  isStart: boolean;
  isEnd: boolean;
  delay: number;
  theme: Theme;
  isOptimal: boolean;
}

const MazeCell: React.FC<MazeCellProps> = ({ cell, size, isStart, isEnd, delay, theme, isOptimal }) => {
  const t = THEMES[theme];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className={`relative box-border ${t.cellBg}`}
      style={{
        width: size,
        height: size,
      }}
    >
      
      {/* Optimal Path (Shown on Win) */}
      {isOptimal && !isStart && !isEnd && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-yellow-400/80 z-10" 
        />
      )}

      {/* Walls */}
      {cell.walls.top && <div className={`absolute top-0 left-0 right-0 h-[2px] ${t.wall} shadow-sm`} />}
      {cell.walls.right && <div className={`absolute top-0 right-0 bottom-0 w-[2px] ${t.wall} shadow-sm`} />}
      {cell.walls.bottom && <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${t.wall} shadow-sm`} />}
      {cell.walls.left && <div className={`absolute top-0 left-0 bottom-0 w-[2px] ${t.wall} shadow-sm`} />}

      {/* Floor glow for start/end */}
      {isStart && <div className="absolute inset-1 rounded bg-emerald-500/20" />}
      
      {isEnd && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`w-1/2 h-1/2 rounded-full ${t.end} shadow-lg`}
          />
        </div>
      )}
      
      {/* Corner dots */}
      <div className={`absolute -top-[1px] -left-[1px] w-[2px] h-[2px] ${theme === 'Light' ? 'bg-slate-300' : 'bg-slate-500'} opacity-50`} />
    </motion.div>
  );
};

const Player = ({ position, size, theme }: { position: Position; size: number; theme: Theme }) => {
  const t = THEMES[theme];
  return (
    <motion.div
      className="absolute z-20 flex items-center justify-center pointer-events-none"
      initial={false}
      animate={{
        x: position.x * size,
        y: position.y * size,
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      style={{ width: size, height: size }}
    >
      <div 
        className={`rounded-full ${t.player} shadow-lg relative`}
        style={{ width: size * 0.5, height: size * 0.5 }}
      >
        <div className="absolute inset-0 rounded-full bg-white opacity-60 blur-[1px]" />
      </div>
    </motion.div>
  );
};

const Minimap = ({ maze, playerPos, visitedPath, width, height, theme }: { maze: Cell[][], playerPos: Position, visitedPath: Position[], width: number, height: number, theme: Theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / width;
    const t = THEMES[theme];
    
    // Colors based on theme
    const bg = theme === 'Light' ? '#f1f5f9' : '#0f172a';
    const wall = theme === 'Light' ? '#94a3b8' : '#334155';
    const path = theme === 'Light' ? 'rgba(59, 130, 246, 0.3)' : (theme === 'Retro' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(34, 211, 238, 0.3)');
    const player = theme === 'Light' ? '#3b82f6' : (theme === 'Retro' ? '#4ade80' : '#22d3ee');

    // Clear
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw visited path
    if (visitedPath.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = path;
      ctx.lineWidth = cellSize / 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      const start = visitedPath[0];
      ctx.moveTo(start.x * cellSize + cellSize / 2, start.y * cellSize + cellSize / 2);
      
      for (let i = 1; i < visitedPath.length; i++) {
        const p = visitedPath[i];
        ctx.lineTo(p.x * cellSize + cellSize / 2, p.y * cellSize + cellSize / 2);
      }
      ctx.stroke();
    }

    // Draw walls
    ctx.strokeStyle = wall;
    ctx.lineWidth = 1;
    maze.forEach(row => {
      row.forEach(cell => {
        const x = cell.x * cellSize;
        const y = cell.y * cellSize;
        
        ctx.beginPath();
        if (cell.walls.top) { ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); }
        if (cell.walls.right) { ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); }
        if (cell.walls.bottom) { ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize); }
        if (cell.walls.left) { ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize); }
        ctx.stroke();
      });
    });

    // Draw Player
    ctx.fillStyle = player;
    ctx.beginPath();
    ctx.arc(
      playerPos.x * cellSize + cellSize / 2,
      playerPos.y * cellSize + cellSize / 2,
      cellSize / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw End
    ctx.fillStyle = '#ec4899'; // pink-500
    ctx.beginPath();
    ctx.arc(
      (width - 1) * cellSize + cellSize / 2,
      (height - 1) * cellSize + cellSize / 2,
      cellSize / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();

  }, [maze, playerPos, visitedPath, width, height, theme]);

  return (
    <div className={`absolute top-20 right-4 md:top-auto md:bottom-8 md:right-8 z-40 p-1 rounded-lg shadow-lg border opacity-80 hover:opacity-100 transition-opacity ${theme === 'Light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
      <canvas 
        ref={canvasRef} 
        width={100} 
        height={100} 
        className={`rounded ${theme === 'Light' ? 'bg-slate-50' : 'bg-slate-900'}`}
      />
    </div>
  );
};

export default function Game() {
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [theme, setTheme] = useState<Theme>('Neon');
  const [lang, setLang] = useState<Language>('zh');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const [maze, setMaze] = useState<Cell[][]>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won'>('start');
  const [level, setLevel] = useState(1);
  const [moves, setMoves] = useState(0);
  const [cellSize, setCellSize] = useState(30);
  const [trail, setTrail] = useState<Position[]>([]);
  const [visitedPath, setVisitedPath] = useState<Position[]>([]);
  const [optimalPath, setOptimalPath] = useState<Position[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { width: MAZE_WIDTH, height: MAZE_HEIGHT } = DIFFICULTY_SETTINGS[difficulty];
  const t = TEXTS[lang];
  const themeStyles = THEMES[theme];

  // Responsive Sizing
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      
      // Calculate available space by subtracting padding and borders
      // Desktop: p-8 (32px) * 2 = 64px container padding + p-3 (12px) * 2 = 24px wrapper padding + borders ~ 4px = ~92px
      // Mobile: p-2 (8px) * 2 = 16px container padding + p-1 (4px) * 2 = 8px wrapper padding + borders ~ 4px = ~28px
      // We add a bit of extra safety margin
      const isDesktop = window.innerWidth >= 768;
      const horizontalPadding = isDesktop ? 120 : 40;
      const verticalPadding = isDesktop ? 120 : 40;
      
      const availableWidth = width - horizontalPadding; 
      const availableHeight = height - verticalPadding;
      
      const size = Math.min(
        Math.floor(availableWidth / MAZE_WIDTH),
        Math.floor(availableHeight / MAZE_HEIGHT),
        50 // Max size
      );
      setCellSize(Math.max(size, 6)); // Min size reduced to fit larger grids
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [MAZE_WIDTH, MAZE_HEIGHT]);

  // Timer
  useEffect(() => {
    if (gameState === 'playing' && startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, startTime]);

  // Initialize Maze
  useEffect(() => {
    startNewLevel();
  }, [difficulty]); 

  const startNewLevel = () => {
    const newMaze = generateMaze(MAZE_WIDTH, MAZE_HEIGHT);
    setMaze(newMaze);
    setPlayerPos({ x: 0, y: 0 });
    setTrail([]);
    setVisitedPath([{ x: 0, y: 0 }]);
    setOptimalPath([]);
    setGameState('playing');
    setMoves(0);
    setStartTime(null);
    setElapsedTime(0);
  };

  const handleMove = (dx: number, dy: number) => {
    if (gameState !== 'playing') return;

    // Start timer on first move
    if (!startTime) {
      setStartTime(Date.now());
    }

    const currentCell = maze[playerPos.y][playerPos.x];
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (newX < 0 || newX >= MAZE_WIDTH || newY < 0 || newY >= MAZE_HEIGHT) {
      playBumpSound(soundEnabled);
      return;
    }

    if (dx === 1 && currentCell.walls.right) { playBumpSound(soundEnabled); return; }
    if (dx === -1 && currentCell.walls.left) { playBumpSound(soundEnabled); return; }
    if (dy === 1 && currentCell.walls.bottom) { playBumpSound(soundEnabled); return; }
    if (dy === -1 && currentCell.walls.top) { playBumpSound(soundEnabled); return; }

    const newPos = { x: newX, y: newY };
    setTrail(prev => [...prev.slice(-5), playerPos]); 
    setVisitedPath(prev => [...prev, newPos]); 
    setPlayerPos(newPos);
    setMoves((m) => m + 1);
    playMoveSound(soundEnabled);

    if (newX === MAZE_WIDTH - 1 && newY === MAZE_HEIGHT - 1) {
      handleWin(maze);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWin = (currentMaze: Cell[][]) => {
    setGameState('won');
    playWinSound(soundEnabled);
    
    // Confetti effect
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: theme === 'Neon' ? ['#22d3ee', '#e879f9'] : (theme === 'Retro' ? ['#4ade80', '#facc15'] : ['#3b82f6', '#ef4444'])
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: theme === 'Neon' ? ['#22d3ee', '#e879f9'] : (theme === 'Retro' ? ['#4ade80', '#facc15'] : ['#3b82f6', '#ef4444'])
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Calculate optimal path
    const solution = solveMaze(currentMaze, {x: 0, y: 0}, {x: MAZE_WIDTH - 1, y: MAZE_HEIGHT - 1});
    setOptimalPath(solution);
  };

  const restartLevel = () => {
    setPlayerPos({ x: 0, y: 0 });
    setTrail([]);
    setVisitedPath([{ x: 0, y: 0 }]);
    setGameState('playing');
    setMoves(0);
    setStartTime(null);
    setElapsedTime(0);
    setOptimalPath([]); // Clear optimal path on replay
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
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
  }, [playerPos, gameState, maze, soundEnabled]);

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const dx = touchEnd.x - touchStart.current.x;
    const dy = touchEnd.y - touchStart.current.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) handleMove(dx > 0 ? 1 : -1, 0);
    } else {
      if (Math.abs(dy) > 30) handleMove(0, dy > 0 ? 1 : -1);
    }
    touchStart.current = null;
  };

  return (
    <div 
      className={`fixed inset-0 flex flex-col items-center font-sans overflow-hidden select-none transition-colors duration-500 ${themeStyles.bg} ${themeStyles.text}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {theme === 'Neon' && (
          <>
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-purple-900/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-cyan-900/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </>
        )}
        {theme === 'Retro' && (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 pointer-events-none bg-[length:100%_4px,6px_100%]" />
        )}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTI4LDEyOCwxMjgsMC4xKSIvPjwvc3ZnPg==')] opacity-20" />
      </div>

      {/* Header - Optimized for Mobile */}
      <div className="z-10 w-full max-w-4xl px-4 md:px-8 pt-4 md:pt-6 pb-2 flex justify-between items-end shrink-0">
        <div>
          <h1 className={`text-xl md:text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r ${themeStyles.gradient}`}>
            {t.title}
          </h1>
          <div className="hidden md:block text-xs font-mono opacity-60 tracking-widest">PATHFINDER v1.2</div>
        </div>
        <div className="flex flex-col items-end gap-1 md:gap-2">
           <div className="flex items-center gap-2">
             <button 
              onClick={() => setShowSettings(true)}
              className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${themeStyles.text}`}
            >
              <Settings size={18} />
            </button>
            <select 
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className={`bg-transparent border border-current text-xs rounded px-2 py-1 outline-none opacity-80 hover:opacity-100 ${themeStyles.text}`}
            >
              <option value="Easy" className="text-black">{t.easy}</option>
              <option value="Medium" className="text-black">{t.medium}</option>
              <option value="Hard" className="text-black">{t.hard}</option>
            </select>
          </div>

          <div className="text-right font-mono text-xs md:text-sm flex gap-3 md:block">
            <div className={`${themeStyles.accent} font-bold`}>{t.level} {level}</div>
            <div className="opacity-70">{moves} {t.moves}</div>
            <div className="opacity-70 font-mono w-12 text-right">{formatTime(elapsedTime)}</div>
          </div>
        </div>
      </div>

      {/* Game Area - Optimized Layout */}
      <div className="flex-1 w-full flex items-center justify-center p-2 md:p-8 relative z-10 overflow-hidden" ref={containerRef}>
        <div 
          className={`relative backdrop-blur-sm rounded-xl shadow-2xl border p-1 md:p-3 transition-colors duration-300 ${theme === 'Light' ? 'bg-white/80 border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}
          style={{ width: 'fit-content', height: 'fit-content', maxWidth: '100%', maxHeight: '100%' }}
        >
          <div 
            className="relative overflow-hidden"
            style={{ width: MAZE_WIDTH * cellSize, height: MAZE_HEIGHT * cellSize }}
          >
            {maze.length > 0 && (
              <>
                {/* Visited Path Line */}
                <svg 
                  className="absolute inset-0 pointer-events-none z-10"
                  width={MAZE_WIDTH * cellSize}
                  height={MAZE_HEIGHT * cellSize}
                  style={{ overflow: 'visible' }}
                >
                  <polyline
                    points={visitedPath.map(p => `${p.x * cellSize + cellSize / 2},${p.y * cellSize + cellSize / 2}`).join(' ')}
                    fill="none"
                    stroke={themeStyles.trailColor}
                    strokeWidth={Math.max(2, cellSize / 4)}
                    strokeOpacity="0.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Trail */}
                {trail.map((pos, i) => (
                  <motion.div
                    key={`trail-${i}-${pos.x}-${pos.y}`}
                    initial={{ opacity: 0.5, scale: 0.5 }}
                    animate={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`absolute z-10 rounded-full blur-[2px] ${themeStyles.trail}`}
                    style={{
                      left: pos.x * cellSize + cellSize * 0.25,
                      top: pos.y * cellSize + cellSize * 0.25,
                      width: cellSize * 0.5,
                      height: cellSize * 0.5,
                    }}
                  />
                ))}
                
                <Player position={playerPos} size={cellSize} theme={theme} />
                {maze.map((row, y) => (
                  <div key={y} className="flex">
                    {row.map((cell, x) => (
                      <MazeCell 
                        key={`${x}-${y}`} 
                        cell={cell} 
                        size={cellSize}
                        isStart={x === 0 && y === 0}
                        isEnd={x === MAZE_WIDTH - 1 && y === MAZE_HEIGHT - 1}
                        delay={(x + y) * 0.02}
                        theme={theme}
                        isOptimal={optimalPath.some(p => p.x === x && p.y === y)}
                      />
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Win Overlay */}
          <AnimatePresence>
            {gameState === 'won' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md rounded-lg p-4"
              >
                <motion.div
                  initial={{ scale: 0.5, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="text-center w-full max-w-sm"
                >
                  <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_25px_rgba(250,204,21,0.6)]" />
                  <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">{t.cleared}</h2>
                  <p className="text-slate-400 text-sm mb-6 font-mono">{formatTime(elapsedTime)}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-8 w-full">
                    <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">{t.moves}</div>
                      <div className="text-2xl font-bold text-white">{moves}</div>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">{t.optimal}</div>
                      <div className="text-2xl font-bold text-emerald-400">{optimalPath.length - 1}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 w-full">
                    <button
                      onClick={() => {
                        setLevel(l => l + 1);
                        startNewLevel();
                      }}
                      className={`group relative w-full py-3 font-bold rounded-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg ${themeStyles.player} text-slate-900`}
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="relative flex items-center gap-2 justify-center">
                        {t.nextLevel} <Play size={18} fill="currentColor" />
                      </span>
                    </button>

                    <button
                      onClick={restartLevel}
                      className="w-full py-3 font-bold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={16} /> {t.replay}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${theme === 'Light' ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}`}
            >
              <div className="p-4 border-b border-slate-700/20 flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Settings size={20} /> {t.settings}
                </h2>
                <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-black/10 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Sound */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    <span>{t.sound}</span>
                  </div>
                  <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${soundEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {/* Theme */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Monitor size={20} />
                    <span>{t.theme}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Neon', 'Retro', 'Light'] as Theme[]).map((th) => (
                      <button
                        key={th}
                        onClick={() => setTheme(th)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${theme === th ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500' : 'border-slate-700 hover:bg-slate-800'}`}
                      >
                        {th}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span>{t.language}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setLang('en')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${lang === 'en' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500' : 'border-slate-700 hover:bg-slate-800'}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLang('zh')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${lang === 'zh' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500' : 'border-slate-700 hover:bg-slate-800'}`}
                    >
                      中文
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-slate-500/5 text-center">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-sm font-medium opacity-70 hover:opacity-100"
                >
                  {t.close}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Minimap */}
      <Minimap 
        maze={maze} 
        playerPos={playerPos} 
        visitedPath={visitedPath} 
        width={MAZE_WIDTH} 
        height={MAZE_HEIGHT} 
        theme={theme}
      />

      {/* Mobile Controls (D-Pad) - Optimized */}
      <div className="md:hidden pb-6 z-20 w-full flex justify-center shrink-0">
        <div className="grid grid-cols-3 gap-3">
          <div />
          <ControlButton icon={<ChevronUp size={24} />} onClick={() => handleMove(0, -1)} />
          <div />
          <ControlButton icon={<ChevronLeft size={24} />} onClick={() => handleMove(-1, 0)} />
          <ControlButton icon={<ChevronDown size={24} />} onClick={() => handleMove(0, 1)} />
          <ControlButton icon={<ChevronRight size={24} />} onClick={() => handleMove(1, 0)} />
        </div>
      </div>

      {/* Desktop Footer Instructions */}
      <div className={`hidden md:flex pb-6 text-xs font-mono gap-8 z-10 opacity-60 ${themeStyles.text}`}>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 border border-current rounded opacity-50">WASD</span>
          <span>TO MOVE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 border border-current rounded opacity-50">ARROWS</span>
          <span>TO MOVE</span>
        </div>
        <button 
          onClick={startNewLevel}
          className="hover:opacity-100 transition-opacity flex items-center gap-1"
        >
          <RefreshCw size={12} /> {t.reset}
        </button>
      </div>
    </div>
  );
}

const ControlButton = ({ icon, onClick }: { icon: React.ReactNode, onClick: () => void }) => (
  <button 
    className="w-14 h-14 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-300 active:bg-cyan-500 active:text-slate-900 active:border-cyan-400 transition-colors backdrop-blur-sm"
    onClick={(e) => {
      e.stopPropagation(); // Prevent touch events on container
      onClick();
    }}
  >
    {icon}
  </button>
);
