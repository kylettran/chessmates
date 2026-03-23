'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Lesson } from '@/types/chess';

interface LessonCardProps {
  lesson: Lesson;
  completed?: boolean;
  index: number;
}

export function LessonCard({ lesson, completed, index }: LessonCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}>
      <Link href={`/learn/${lesson.id}`}>
        <motion.div className={`relative rounded-2xl p-5 cursor-pointer border-2 transition-all duration-200 ${completed ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20' : 'border-amber-200 dark:border-amber-800/50 bg-white dark:bg-background-secondary hover:border-amber-400 dark:hover:border-amber-600'}`} whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(245,200,66,0.2)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          {completed && <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><span>✓</span> Done!</div>}
          <div className="text-4xl mb-3">{lesson.icon}</div>
          <h3 className="font-bold text-lg text-text-primary mb-1">{lesson.title}</h3>
          <p className="text-sm text-text-muted mb-3">{lesson.description}</p>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${lesson.difficulty === 'beginner' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'}`}>
              {lesson.difficulty === 'beginner' ? '🌱 Beginner' : '⚡ Intermediate'}
            </span>
            <span className="text-xs text-text-muted">{lesson.steps.length} steps</span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
