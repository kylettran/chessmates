'use client';

import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

export function FAQSearch({ value, onChange, resultCount }: FAQSearchProps) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" placeholder='Search chess questions... (try "stalemate" or "knight")' value={value} onChange={e => onChange(e.target.value)} className="w-full pl-11 pr-10 py-3.5 rounded-2xl border-2 border-amber-200 dark:border-amber-800/50 bg-white dark:bg-background-secondary text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-400 dark:focus:border-amber-600 text-sm sm:text-base transition-colors" />
        <AnimatePresence>
          {value && (
            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => onChange('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
              <X size={16} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      {value && <p className="text-sm text-text-muted pl-1">{resultCount === 0 ? "No questions found — try different words!" : `Found ${resultCount} question${resultCount !== 1 ? 's' : ''}!`}</p>}
    </div>
  );
}
