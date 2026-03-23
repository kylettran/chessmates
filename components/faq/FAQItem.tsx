'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { FAQItem as FAQItemType } from '@/types/chess';
import { ChessBoard } from '@/components/chess/ChessBoard';

interface FAQItemProps {
  item: FAQItemType;
  defaultOpen?: boolean;
}

export function FAQItem({ item, defaultOpen = false }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const renderAnswer = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i} className="block mb-1">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            return <span key={j}>{part}</span>;
          })}
        </span>
      );
    });
  };

  return (
    <div className="border-2 border-amber-200 dark:border-amber-800/50 rounded-2xl overflow-hidden bg-white dark:bg-background-secondary">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl shrink-0">{item.emoji}</span>
          <div>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 block mb-0.5">{item.category}</span>
            <span className="font-semibold text-text-primary text-sm sm:text-base">{item.question}</span>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 text-text-muted">
          <ChevronDown size={20} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} style={{ overflow: 'hidden' }}>
            <div className="px-5 pb-5 pt-1">
              <div className="border-t border-amber-100 dark:border-amber-900/30 pt-4">
                <div className="text-text-secondary leading-relaxed text-sm sm:text-base whitespace-pre-line">{renderAnswer(item.answer)}</div>
                {item.boardDiagram && (
                  <div className="mt-4 flex justify-center">
                    <ChessBoard boardState={item.boardDiagram} highlightedSquares={item.highlightedSquares} size="sm" showLabels={false} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
