import { useEffect, useRef } from 'react';

interface UseGamepadOptions {
  enabled: boolean;
  onMove: (dx: number, dy: number) => void;
  onRestart: () => void;
}

export function useGamepad({ enabled, onMove, onRestart }: UseGamepadOptions) {
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const onRestartRef = useRef(onRestart);
  onRestartRef.current = onRestart;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.getGamepads) return;

    let reqId: number | null = null;
    let lastMoveTime = 0;
    let connectedCount = 0;
    const COOLDOWN = 140; // ms between consecutive stick moves
    const THRESHOLD = 0.4; // analog stick threshold

    const pollGamepad = () => {
      if (connectedCount <= 0) {
        reqId = null;
        return;
      }

      reqId = requestAnimationFrame(pollGamepad);

      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const now = performance.now();
      if (now - lastMoveTime < COOLDOWN) return;

      for (const gp of gamepads) {
        if (!gp) continue;

        // Start button (Index 9) to generate new maze
        if (gp.buttons[9]?.pressed) {
          onRestartRef.current();
          lastMoveTime = now + 500; // block inputs for half a second
          break;
        }

        if (!enabledRef.current) continue;

        let dx = 0;
        let dy = 0;

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
          onMoveRef.current(dx, dy);
          lastMoveTime = now;
          break; // Process only one directional input from the first active controller
        }
      }
    };

    const checkInitialGamepads = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      let count = 0;
      for (const gp of gamepads) {
        if (gp && gp.connected) count++;
      }
      connectedCount = count;
      if (connectedCount > 0 && reqId === null) {
        reqId = requestAnimationFrame(pollGamepad);
      }
    };

    const handleConnected = () => {
      connectedCount++;
      if (reqId === null) {
        reqId = requestAnimationFrame(pollGamepad);
      }
    };

    const handleDisconnected = () => {
      connectedCount = Math.max(0, connectedCount - 1);
      if (connectedCount === 0 && reqId !== null) {
        cancelAnimationFrame(reqId);
        reqId = null;
      }
    };

    window.addEventListener('gamepadconnected', handleConnected);
    window.addEventListener('gamepaddisconnected', handleDisconnected);

    // Initial check
    checkInitialGamepads();

    return () => {
      window.removeEventListener('gamepadconnected', handleConnected);
      window.removeEventListener('gamepaddisconnected', handleDisconnected);
      if (reqId !== null) {
        cancelAnimationFrame(reqId);
      }
    };
  }, []);
}
