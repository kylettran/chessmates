'use client';

import { motion } from 'framer-motion';

interface LessonProgressProps {
  total: number;
  current: number;
  onStepClick?: (index: number) => void;
}

export function LessonProgress({ total, current, onStepClick }: LessonProgressProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {Array.from({ length: total }, (_, i) => (
        <button key={i} onClick={() => onStepClick?.(i)} className="relative focus:outline-none" aria-label={`Step ${i + 1}`}>
          <motion.div className={`rounded-full transition-all duration-300 ${i < current ? 'bg-green-500' : i === current ? 'bg-amber-400 ring-2 ring-amber-400 ring-offset-2 ring-offset-background' : 'bg-gray-200 dark:bg-gray-700'}`} style={{ width: i === current ? 28 : 20, height: i === current ? 28 : 20 }} whileHover={{ scale: 1.2 }}>
            {i < current && <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">✓</span>}
            {i === current && <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">{i + 1}</span>}
          </motion.div>
        </button>
      ))}
      <span className="text-sm text-text-muted ml-1">Step {current + 1} of {total}</span>
    </div>
  );
}
