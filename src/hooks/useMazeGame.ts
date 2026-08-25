import { useState, useRef, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { generateMaze, solveMaze, Cell } from '../utils/maze';
import { playMoveSound, playWinSound, playBumpSound } from '../utils/audio';
import { Difficulty, GameMode, Position, LeaderboardEntry, Theme } from '../types/game';
import { MAZE_SIZES, THEME_CONFIGS } from '../constants/game';

interface UseMazeGameOptions {
  difficulty: Difficulty;
  gameMode: GameMode;
  theme: Theme;
  soundEnabled: boolean;
  playerName: string;
  onGameEnd?: () => void;
}

export function useMazeGame({
  difficulty,
  gameMode,
  theme,
  soundEnabled,
  playerName,
  onGameEnd,
}: UseMazeGameOptions) {
  const { width: MAZE_WIDTH, height: MAZE_HEIGHT } = MAZE_SIZES[difficulty];

  const [maze, setMaze] = useState<Cell[][]>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'gaveUp'>('start');
  const [level, setLevel] = useState(1);
  const [moves, setMoves] = useState(0);
  const [visitedPath, setVisitedPath] = useState<Position[]>([]);
  const [optimalPath, setOptimalPath] = useState<Position[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finalTime, setFinalTime] = useState(0);
  const [fogCountdown, setFogCountdown] = useState(10);

  const [replayIndex, setReplayIndex] = useState(-1);
  const [isReplaying, setIsReplaying] = useState(false);
  const replayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs for access in callbacks without stale closures
  const playerPosRef = useRef(playerPos);
  playerPosRef.current = playerPos;
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const mazeRef = useRef(maze);
  mazeRef.current = maze;
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;
  const startTimeRef = useRef(startTime);
  startTimeRef.current = startTime;
  const movesRef = useRef(moves);
  movesRef.current = moves;
  const mazeWidthRef = useRef(MAZE_WIDTH);
  mazeWidthRef.current = MAZE_WIDTH;
  const mazeHeightRef = useRef(MAZE_HEIGHT);
  mazeHeightRef.current = MAZE_HEIGHT;
  const difficultyRef = useRef(difficulty);
  difficultyRef.current = difficulty;
  const gameModeRef = useRef(gameMode);
  gameModeRef.current = gameMode;
  const playerNameRef = useRef(playerName);
  playerNameRef.current = playerName;
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const onGameEndRef = useRef(onGameEnd);
  onGameEndRef.current = onGameEnd;

  const stopReplay = useCallback(() => {
    if (replayTimerRef.current) {
      clearInterval(replayTimerRef.current);
      replayTimerRef.current = null;
    }
    setIsReplaying(false);
    setReplayIndex(-1);
  }, []);

  const startNewLevel = useCallback(() => {
    stopReplay();
    const w = mazeWidthRef.current;
    const h = mazeHeightRef.current;
    setMaze(generateMaze(w, h));
    setPlayerPos({ x: 0, y: 0 });
    setVisitedPath([{ x: 0, y: 0 }]);
    setOptimalPath([]);
    setGameState('playing');
    setMoves(0);
    setStartTime(null);
    setFinalTime(0);
    setFogCountdown(10);
  }, [stopReplay]);

  const restartLevel = useCallback(() => {
    stopReplay();
    setPlayerPos({ x: 0, y: 0 });
    setVisitedPath([{ x: 0, y: 0 }]);
    setGameState('playing');
    setMoves(0);
    setStartTime(null);
    setFinalTime(0);
    setOptimalPath([]);
    setFogCountdown(10);
  }, [stopReplay]);

  const handleWin = useCallback(
    (currentMaze: Cell[][]) => {
      setGameState('won');
      const now = Date.now();
      const fTime = startTimeRef.current ? now - startTimeRef.current : 0;
      setFinalTime(fTime);
      playWinSound(soundEnabledRef.current);

      // Lightweight high-impact confetti burst (2 discrete bursts instead of continuous rAF loop)
      const t = THEME_CONFIGS[themeRef.current];
      const colors = [t.playerColor, t.endColor, '#fbbf24', '#f43f5e'];
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors,
        disableForReducedMotion: true,
      });
      setTimeout(() => {
        confetti({
          particleCount: 25,
          angle: 60,
          spread: 50,
          origin: { x: 0.1, y: 0.7 },
          colors,
          disableForReducedMotion: true,
        });
        confetti({
          particleCount: 25,
          angle: 120,
          spread: 50,
          origin: { x: 0.9, y: 0.7 },
          colors,
          disableForReducedMotion: true,
        });
      }, 200);

      const w = mazeWidthRef.current;
      const h = mazeHeightRef.current;
      const optPath = solveMaze(currentMaze, { x: 0, y: 0 }, { x: w - 1, y: h - 1 });
      setOptimalPath(optPath);

      // Save to leaderboard asynchronously
      setTimeout(() => {
        try {
          const mvs =
            playerPosRef.current.x === w - 1 && playerPosRef.current.y === h - 1
              ? movesRef.current
              : movesRef.current + 1;
          const records: LeaderboardEntry[] = JSON.parse(
            localStorage.getItem('ahamaze_records') || '[]'
          );
          records.push({
            name: playerNameRef.current || 'Guest',
            difficulty: difficultyRef.current,
            mode: gameModeRef.current,
            time: fTime,
            moves: mvs,
            date: new Date().toISOString(),
          });
          localStorage.setItem('ahamaze_records', JSON.stringify(records));
        } catch {
          // ignore
        }
      }, 50);

      onGameEndRef.current?.();
    },
    []
  );

  const handleGiveUp = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    stopReplay();
    setGameState('gaveUp');
    const fTime = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
    setFinalTime(fTime);

    const m = mazeRef.current;
    const w = mazeWidthRef.current;
    const h = mazeHeightRef.current;
    setOptimalPath(solveMaze(m, { x: 0, y: 0 }, { x: w - 1, y: h - 1 }));

    onGameEndRef.current?.();
  }, [stopReplay]);

  const handleMove = useCallback(
    (dx: number, dy: number) => {
      if (gameStateRef.current !== 'playing') return;
      if (!startTimeRef.current) setStartTime(Date.now());

      const pos = playerPosRef.current;
      const m = mazeRef.current;
      const w = mazeWidthRef.current;
      const h = mazeHeightRef.current;

      if (!m || m.length === 0 || !m[pos.y] || !m[pos.y][pos.x]) return;

      const currentCell = m[pos.y][pos.x];
      const newX = pos.x + dx;
      const newY = pos.y + dy;

      if (newX < 0 || newX >= w || newY < 0 || newY >= h) {
        playBumpSound(soundEnabledRef.current);
        return;
      }
      if (dx === 1 && currentCell.walls.right) {
        playBumpSound(soundEnabledRef.current);
        return;
      }
      if (dx === -1 && currentCell.walls.left) {
        playBumpSound(soundEnabledRef.current);
        return;
      }
      if (dy === 1 && currentCell.walls.bottom) {
        playBumpSound(soundEnabledRef.current);
        return;
      }
      if (dy === -1 && currentCell.walls.top) {
        playBumpSound(soundEnabledRef.current);
        return;
      }

      const newPos = { x: newX, y: newY };
      setVisitedPath((prev) => [...prev, newPos]);
      setPlayerPos(newPos);
      setMoves((prev) => {
        const next = prev + 1;
        movesRef.current = next;
        return next;
      });

      playMoveSound(soundEnabledRef.current);

      if (newX === w - 1 && newY === h - 1) {
        handleWin(m);
      }
    },
    [handleWin]
  );

  const startReplay = useCallback(() => {
    if (visitedPath.length < 2) return;
    stopReplay();
    setIsReplaying(true);
    setReplayIndex(0);

    const speed = Math.max(40, Math.min(150, 8000 / visitedPath.length));
    let idx = 0;
    replayTimerRef.current = setInterval(() => {
      idx++;
      if (idx >= visitedPath.length) {
        if (replayTimerRef.current) clearInterval(replayTimerRef.current);
        replayTimerRef.current = null;
        setIsReplaying(false);
        setReplayIndex(-1);
        return;
      }
      setReplayIndex(idx);
    }, speed);
  }, [visitedPath, stopReplay]);

  // Fog countdown timer in Challenge mode
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (gameState === 'playing' && gameMode === 'Challenge' && fogCountdown > 0) {
      timer = setInterval(() => {
        setFogCountdown((c) => Math.max(0, c - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState, gameMode, fogCountdown]);

  // Restart maze on difficulty change or mode change
  useEffect(() => {
    startNewLevel();
  }, [difficulty, gameMode, startNewLevel]);

  // Clean up replay on unmount
  useEffect(() => {
    return () => {
      if (replayTimerRef.current) {
        clearInterval(replayTimerRef.current);
      }
    };
  }, []);

  const moveUp = useCallback(() => handleMove(0, -1), [handleMove]);
  const moveDown = useCallback(() => handleMove(0, 1), [handleMove]);
  const moveLeft = useCallback(() => handleMove(-1, 0), [handleMove]);
  const moveRight = useCallback(() => handleMove(1, 0), [handleMove]);

  const optLen = optimalPath.length > 0 ? optimalPath.length - 1 : 0;
  const efficiency = optLen > 0 && moves > 0 ? Math.round((optLen / moves) * 100) : 0;
  const isFinished = gameState === 'won' || gameState === 'gaveUp';
  const rating =
    efficiency >= 95
      ? 'Perfect'
      : efficiency >= 85
      ? 'Excellent'
      : efficiency >= 70
      ? 'Good'
      : efficiency >= 50
      ? 'Fair'
      : 'Lost in Maze';

  return {
    maze,
    playerPos,
    gameState,
    level,
    setLevel,
    moves,
    visitedPath,
    optimalPath,
    startTime,
    finalTime,
    fogCountdown,
    replayIndex,
    isReplaying,
    isFinished,
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
  };
}
