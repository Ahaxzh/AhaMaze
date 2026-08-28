import React, { useRef, useCallback } from 'react';

interface UseTouchSwipeOptions {
  enabled: boolean;
  onMove: (dx: number, dy: number) => void;
  threshold?: number;
}

export function useTouchSwipe({
  enabled,
  onMove,
  threshold = 16,
}: UseTouchSwipeOptions) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchAnchorRef = useRef<{ x: number; y: number } | null>(null);
  const hasMovedRef = useRef(false);
  const lastStepTimeRef = useRef(0);

  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const STEP_COOLDOWN = 55; // 55ms (~18 steps/sec) for thrilling turbo glide through straight corridors
  const DRAG_STEP_THRESHOLD = 18; // 18px per subsequent step during drag

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: performance.now() };
      touchAnchorRef.current = { x: touch.clientX, y: touch.clientY };
      hasMovedRef.current = false;
      lastStepTimeRef.current = 0;
    }
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || !touchAnchorRef.current || !enabledRef.current || e.touches.length === 0) return;

      const touch = e.touches[0];
      const now = performance.now();

      // 1. Initial Swipe: Trigger exactly 1 step on first threshold crossing
      if (!hasMovedRef.current) {
        const dx = touch.clientX - touchStartRef.current.x;
        const dy = touch.clientY - touchStartRef.current.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (Math.max(absDx, absDy) >= threshold) {
          if (absDx > absDy) {
            onMoveRef.current(dx > 0 ? 1 : -1, 0);
          } else {
            onMoveRef.current(0, dy > 0 ? 1 : -1);
          }
          hasMovedRef.current = true;
          lastStepTimeRef.current = now;
          touchAnchorRef.current = { x: touch.clientX, y: touch.clientY };
        }
        return;
      }

      // 2. Continuous Drag Progression: strictly rate-limited with cooldown to prevent runaway dashing
      if (now - lastStepTimeRef.current < STEP_COOLDOWN) return;

      const dragDx = touch.clientX - touchAnchorRef.current.x;
      const dragDy = touch.clientY - touchAnchorRef.current.y;
      const absDragDx = Math.abs(dragDx);
      const absDragDy = Math.abs(dragDy);

      if (Math.max(absDragDx, absDragDy) >= DRAG_STEP_THRESHOLD) {
        if (absDragDx > absDragDy) {
          const dirX = dragDx > 0 ? 1 : -1;
          onMoveRef.current(dirX, 0);
          touchAnchorRef.current = { x: touch.clientX, y: touch.clientY };
        } else {
          const dirY = dragDy > 0 ? 1 : -1;
          onMoveRef.current(0, dirY);
          touchAnchorRef.current = { x: touch.clientX, y: touch.clientY };
        }
        lastStepTimeRef.current = now;
      }
    },
    [threshold]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || !enabledRef.current) {
        touchStartRef.current = null;
        touchAnchorRef.current = null;
        hasMovedRef.current = false;
        return;
      }

      // If finger was quickly released without move exceeding threshold (micro-flick)
      if (!hasMovedRef.current && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartRef.current.x;
        const dy = touch.clientY - touchStartRef.current.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const FLICK_THRESHOLD = 15;

        if (Math.max(absDx, absDy) >= FLICK_THRESHOLD) {
          if (absDx > absDy) {
            onMoveRef.current(dx > 0 ? 1 : -1, 0);
          } else {
            onMoveRef.current(0, dy > 0 ? 1 : -1);
          }
        }
      }

      touchStartRef.current = null;
      touchAnchorRef.current = null;
      hasMovedRef.current = false;
      lastStepTimeRef.current = 0;
    },
    []
  );

  const onTouchCancel = useCallback(() => {
    touchStartRef.current = null;
    touchAnchorRef.current = null;
    hasMovedRef.current = false;
    lastStepTimeRef.current = 0;
  }, []);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
  };
}


