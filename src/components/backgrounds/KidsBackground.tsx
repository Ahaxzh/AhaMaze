import React, { useMemo } from 'react';
import { KIDS_EMOJIS } from '../../constants/game';

interface KidsElement {
  id: number;
  emoji: string;
  left: number;
  duration: number;
  delay: number;
  visualSize: number;
  drift: number;
  opacity: number;
}

export const KidsBackground = React.memo(function KidsBackground({
  isDark,
}: {
  isDark: boolean;
}) {
  // Use 8 lightweight elements with pure CSS transform translations, zero drop-shadow
  const elements = useMemo<KidsElement[]>(() => {
    return Array.from({ length: 8 }).map((_, i) => {
      const visualSize = 28 + (i % 4) * 8; // 28px - 52px
      const left = 6 + (i * 12) % 86;
      const emojiIndex = (i * 7 + 3) % KIDS_EMOJIS.length;

      return {
        id: i,
        emoji: KIDS_EMOJIS[emojiIndex].trim(),
        left,
        duration: 18 + (i % 4) * 4, // 18s - 30s gentle float
        delay: -((i * 4.5) % 20),
        visualSize,
        drift: ((i % 3) - 1) * 20, // -20px to +20px subtle drift
        opacity: 0.35 + (i % 3) * 0.1, // 0.35 - 0.55
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
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(${
            isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.8)'
          } 3px, transparent 3px)`,
          backgroundSize: '36px 36px',
        }}
      />
      {elements.map((el) => {
        return (
          <div
            key={el.id}
            className="absolute animate-kids-float select-none pointer-events-none"
            style={
              {
                left: `${el.left}vw`,
                fontSize: `${el.visualSize}px`,
                lineHeight: 1,
                top: 0,
                '--float-duration': `${el.duration}s`,
                '--float-delay': `${el.delay}s`,
                '--float-drift': `${el.drift}px`,
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

