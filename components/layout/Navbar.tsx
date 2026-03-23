'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const NAV_LINKS = [
  { href: '/learn', label: 'Learn', emoji: '📚' },
  { href: '/pieces', label: 'Pieces', emoji: '♟️' },
  { href: '/rules', label: 'Rules', emoji: '📜' },
  { href: '/puzzles', label: 'Puzzles', emoji: '🧩' },
  { href: '/faq', label: 'Ask Anything', emoji: '💬' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-amber-900/20 dark:border-amber-200/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
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

        <div className="hidden md:flex items-center gap-1">
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
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-amber-100 dark:bg-amber-900/40 -z-10"
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      <div className="md:hidden flex overflow-x-auto gap-1 px-4 pb-2 scrollbar-none">
        {NAV_LINKS.map(link => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                  : 'text-text-secondary bg-background-secondary'
              }`}
            >
              <span>{link.emoji}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
