import React, { useRef, useCallback } from 'react';

interface UseTouchSwipeOptions {
  enabled: boolean;
  onMove: (dx: number, dy: number) => void;
  threshold?: number;
}

export function useTouchSwipe({
  enabled,
  onMove,
  threshold = 24,
}: UseTouchSwipeOptions) {
  const touchAnchorRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const stepsTakenRef = useRef(0);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      touchAnchorRef.current = { x: touch.clientX, y: touch.clientY };
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: performance.now() };
      stepsTakenRef.current = 0;
    }
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchAnchorRef.current || !enabledRef.current || e.touches.length === 0) return;

      const touch = e.touches[0];
      const dx = touch.clientX - touchAnchorRef.current.x;
      const dy = touch.clientY - touchAnchorRef.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Continuous step progression when sliding across cells
      if (Math.max(absDx, absDy) >= threshold) {
        if (absDx > absDy) {
          const dirX = dx > 0 ? 1 : -1;
          onMoveRef.current(dirX, 0);
          // Advance anchor by threshold to allow continuous gliding
          touchAnchorRef.current.x += dirX * threshold;
          touchAnchorRef.current.y = touch.clientY;
        } else {
          const dirY = dy > 0 ? 1 : -1;
          onMoveRef.current(0, dirY);
          touchAnchorRef.current.y += dirY * threshold;
          touchAnchorRef.current.x = touch.clientX;
        }
        stepsTakenRef.current += 1;
      }
    },
    [threshold]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || !enabledRef.current) {
        touchAnchorRef.current = null;
        touchStartRef.current = null;
        return;
      }

      // If no steps were triggered during move (e.g. quick micro-flick), check end displacement
      if (stepsTakenRef.current === 0 && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartRef.current.x;
        const dy = touch.clientY - touchStartRef.current.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const flickThreshold = 16; // lower threshold for quick release flicks

        if (Math.max(absDx, absDy) >= flickThreshold) {
          if (absDx > absDy) {
            onMoveRef.current(dx > 0 ? 1 : -1, 0);
          } else {
            onMoveRef.current(0, dy > 0 ? 1 : -1);
          }
        }
      }

      touchAnchorRef.current = null;
      touchStartRef.current = null;
      stepsTakenRef.current = 0;
    },
    []
  );

  const onTouchCancel = useCallback(() => {
    touchAnchorRef.current = null;
    touchStartRef.current = null;
    stepsTakenRef.current = 0;
  }, []);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
  };
}

