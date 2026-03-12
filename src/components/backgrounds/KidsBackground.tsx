import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KIDS_EMOJIS } from '../../constants/game';

interface KidsElement {
  id: number;
  emoji: string;
  left: number;
  duration: number;
  delay: number;
  visualSize: number;
  rotate: number;
  rotateDuration: number;
  drift: number;
  opacity: number;
}

export const KidsBackground = React.memo(function KidsBackground({ isDark }: { isDark: boolean }) {
  const [elements, setElements] = useState<KidsElement[]>([]);

  useEffect(() => {
    const newElements: KidsElement[] = Array.from({ length: 70 }).map((_, i) => {
      // Visual sizes: 24px - 64px
      const visualSize = 24 + Math.random() * 40;

      // Left channel: 0vw to 18vw, Right channel: 82vw to 98vw (avoid center maze)
      const isLeft = Math.random() > 0.5;
      const left = isLeft ? Math.random() * 18 : 82 + Math.random() * 16;

      return {
        id: i,
        emoji: KIDS_EMOJIS[Math.floor(Math.random() * KIDS_EMOJIS.length)].trim(),
        left,
        duration: 35 + Math.random() * 35,
        delay: -(Math.random() * 60),
        visualSize,
        rotate: Math.random() * 360,
        rotateDuration: 15 + Math.random() * 25,
        drift: Math.random() * 8 - 4,
        // Pre-calculate opacity at init time to avoid render-time randomness
        opacity: 0.4 + Math.random() * 0.4,
      };
    });
    setElements(newElements);
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${isDark ? 'bg-gradient-to-br from-[#2e1025] via-[#4a1c40] to-[#2e1045]' : 'bg-gradient-to-br from-pink-200 via-pink-100 to-rose-200'}`}>
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `radial-gradient(${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.9)'} 4px, transparent 4px)`,
        backgroundSize: '40px 40px'
      }} />
      {elements.map((el) => {
        const renderSize = 80;
        const scale = el.visualSize / renderSize;

        return (
          <motion.div
            key={el.id}
            initial={{ y: '-15vh', x: `${el.left}vw`, rotate: el.rotate, scale, opacity: 0 }}
            animate={{
              y: '115vh',
              rotate: el.rotate + 360,
              x: [`${el.left}vw`, `${el.left + el.drift}vw`, `${el.left}vw`],
              scale,
              opacity: [0, el.opacity, el.opacity, 0]
            }}
            transition={{
              y: { duration: el.duration, repeat: Infinity, delay: el.delay, ease: "linear" },
              rotate: { duration: el.rotateDuration, repeat: Infinity, ease: "linear" },
              x: { duration: el.duration * 0.8, repeat: Infinity, delay: el.delay, ease: "easeInOut" },
              opacity: { duration: el.duration, repeat: Infinity, delay: el.delay, ease: "linear", times: [0, 0.1, 0.9, 1] }
            }}
            style={{
              position: 'absolute',
              fontSize: renderSize,
              lineHeight: 1,
              top: 0,
              transformOrigin: 'center center'
            }}
            className="drop-shadow-sm"
          >
            {el.emoji}
          </motion.div>
        );
      })}
    </div>
  );
});
