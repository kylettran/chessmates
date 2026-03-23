'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MascotProps {
  emotion?: 'happy' | 'excited' | 'thinking' | 'encouraging' | 'celebrating';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const rotatingTips = [
  "Hi! I'm Sir Clip! Let's learn chess together! ♟️",
  "Remember: White always moves first!",
  "The knight is the only piece that can jump!",
  "Control the center to rule the board!",
  "Always castle to keep your king safe!",
  "A pawn that reaches the end becomes a queen!",
];

const emotionEmojis = {
  happy: '♞',
  excited: '🎉',
  thinking: '🤔',
  encouraging: '💪',
  celebrating: '🏆',
};

const emotionColors = {
  happy: 'from-amber-400 to-yellow-500',
  excited: 'from-pink-400 to-purple-500',
  thinking: 'from-blue-400 to-cyan-500',
  encouraging: 'from-green-400 to-emerald-500',
  celebrating: 'from-yellow-400 to-orange-500',
};

export function Mascot({ emotion = 'happy', message, size = 'md' }: MascotProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayMessage = message || rotatingTips[currentIndex];

  useEffect(() => {
    if (!message) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % rotatingTips.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [message]);

  const sizeStyles = { sm: 'text-4xl', md: 'text-6xl', lg: 'text-8xl' };
  const bubbleWidth = { sm: 'max-w-[200px]', md: 'max-w-sm', lg: 'max-w-md' };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="relative flex items-center justify-center"
        animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className={`bg-gradient-to-br ${emotionColors[emotion]} rounded-full flex items-center justify-center shadow-lg`}
          style={{
            width: size === 'sm' ? 64 : size === 'md' ? 96 : 128,
            height: size === 'sm' ? 64 : size === 'md' ? 96 : 128,
          }}
        >
          <span className={sizeStyles[size]} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
            {emotionEmojis[emotion]}
          </span>
        </div>
        {emotion === 'celebrating' && (
          <>
            <motion.span
              className="absolute -top-1 -right-1 text-xl"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            >✨</motion.span>
            <motion.span
              className="absolute -bottom-1 -left-1 text-sm"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
            >⭐</motion.span>
          </>
        )}
      </motion.div>

      {displayMessage && (
        <div className={`quote-bubble bg-white dark:bg-background-secondary rounded-2xl px-5 py-3 shadow-md ${bubbleWidth[size]} text-center relative min-h-[56px] flex items-center justify-center border-2 border-amber-200 dark:border-amber-900/50`}>
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[10px] border-l-transparent border-r-transparent border-b-amber-200 dark:border-b-amber-900/50" />
          <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-white dark:border-b-background-secondary" />
          <AnimatePresence mode="wait">
            <motion.p
              key={currentIndex + (message || '')}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="font-medium text-sm leading-snug"
            >
              {displayMessage}
            </motion.p>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
