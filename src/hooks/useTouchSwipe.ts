import React, { useRef, useCallback } from 'react';

interface UseTouchSwipeOptions {
  enabled: boolean;
  onMove: (dx: number, dy: number) => void;
  threshold?: number;
}

export function useTouchSwipe({
  enabled,
  onMove,
  threshold = 30,
}: UseTouchSwipeOptions) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || !enabledRef.current) return;
      if (e.changedTouches.length === 0) return;

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };

      const dx = touchEnd.x - touchStartRef.current.x;
      const dy = touchEnd.y - touchStartRef.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) >= threshold) {
        if (absDx > absDy) {
          onMoveRef.current(dx > 0 ? 1 : -1, 0);
        } else {
          onMoveRef.current(0, dy > 0 ? 1 : -1);
        }
      }

      touchStartRef.current = null;
    },
    [threshold]
  );

  return {
    onTouchStart,
    onTouchEnd,
  };
}
