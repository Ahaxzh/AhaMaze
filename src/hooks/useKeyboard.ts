import { useEffect, useRef } from 'react';

interface UseKeyboardOptions {
  enabled: boolean;
  onMove: (dx: number, dy: number) => void;
  onRestart: () => void;
}

export function useKeyboard({ enabled, onMove, onRestart }: UseKeyboardOptions) {
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const onRestartRef = useRef(onRestart);
  onRestartRef.current = onRestart;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        onRestartRef.current();
        return;
      }

      if (!enabledRef.current) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          onMoveRef.current(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          onMoveRef.current(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          onMoveRef.current(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          onMoveRef.current(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
