'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton } from '@clerk/nextjs';

const NAV_LINKS = [
  { href: '/learn', label: 'Learn', emoji: '📚' },
  { href: '/pieces', label: 'Pieces', emoji: '♟️' },
  { href: '/rules', label: 'Rules', emoji: '📜' },
  { href: '/puzzles', label: 'Puzzles', emoji: '🧩' },
  { href: '/faq', label: 'Ask Anything', emoji: '💬' },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-amber-900/20 dark:border-amber-200/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl shrink-0 group">
          <motion.span
            className="text-2xl"
            whileHover={{ rotate: [0, -15, 15, 0] }}
            transition={{ duration: 0.4 }}
          >
            ♞
          </motion.span>
          <span className="bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
            Chessmates
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map(link => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                    : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'
                }`}
              >
                <span>{link.emoji}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right side: profile + chess menu button */}
        <div className="flex items-center gap-3">
          <UserButton />

          {/* Chess pawn menu button — mobile only */}
          <motion.button
            className="md:hidden relative w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800/40 flex items-center justify-center"
            onClick={() => setMenuOpen(prev => !prev)}
            whileTap={{ scale: 0.92 }}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 45, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-lg font-bold text-amber-600 dark:text-amber-400 leading-none"
                >
                  ✕
                </motion.span>
              ) : (
                <motion.span
                  key="pawn"
                  initial={{ rotate: 45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -45, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-xl text-amber-600 dark:text-amber-400 leading-none"
                >
                  ♟
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-amber-900/10 dark:border-amber-200/10 bg-background/95 backdrop-blur-sm"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                          : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'
                      }`}
                    >
                      <span className="text-lg">{link.emoji}</span>
                      <span>{link.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
