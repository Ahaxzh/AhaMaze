import React, { useMemo } from 'react';
import { KIDS_EMOJIS } from '../../constants/game';

interface KidsElement {
  id: number;
  emoji: string;
  left: number;
  duration: number;
  delay: number;
  visualSize: number;
  rotate: number;
  drift: number;
  opacity: number;
}

export const KidsBackground = React.memo(function KidsBackground({
  isDark,
}: {
  isDark: boolean;
}) {
  // Use 24 elements with GPU-accelerated CSS animations instead of 100 JS-animated DOM nodes
  const elements = useMemo<KidsElement[]>(() => {
    return Array.from({ length: 22 }).map((_, i) => {
      const visualSize = 28 + (i % 6) * 6; // 28px - 58px
      const left = ((i * 4.6 + (i % 3) * 2) % 94);
      const emojiIndex = (i * 7 + (i % 5)) % KIDS_EMOJIS.length;

      return {
        id: i,
        emoji: KIDS_EMOJIS[emojiIndex].trim(),
        left,
        duration: 14 + (i % 6) * 3, // 14s - 29s
        delay: -((i * 3.1) % 25), // negative delay so they are already scattered at load
        visualSize,
        rotate: ((i * 47) % 360) - 180,
        drift: ((i % 5) - 2) * 30, // -60px to +60px
        opacity: 0.45 + (i % 4) * 0.1, // 0.45 - 0.75
      };
    });
  }, []);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${
        isDark
          ? 'bg-gradient-to-br from-[#2e1025] via-[#4a1c40] to-[#2e1045]'
          : 'bg-gradient-to-br from-pink-200 via-pink-100 to-rose-200'
      }`}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(${
            isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.9)'
          } 4px, transparent 4px)`,
          backgroundSize: '40px 40px',
        }}
      />
      {elements.map((el) => {
        return (
          <div
            key={el.id}
            className="absolute animate-kids-float drop-shadow-sm select-none"
            style={
              {
                left: `${el.left}vw`,
                fontSize: `${el.visualSize}px`,
                lineHeight: 1,
                top: 0,
                '--float-duration': `${el.duration}s`,
                '--float-delay': `${el.delay}s`,
                '--float-drift': `${el.drift}px`,
                '--float-rotate': `${el.rotate}deg`,
                '--float-opacity': el.opacity,
              } as React.CSSProperties
            }
          >
            {el.emoji}
          </div>
        );
      })}
    </div>
  );
});
