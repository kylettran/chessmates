'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mascot } from '@/components/ui/Mascot';
import { Navbar } from '@/components/layout/Navbar';

const FEATURES = [
  {
    emoji: '♟️',
    title: 'Meet the Pieces',
    description: 'Learn how each chess piece moves with fun animations! Click on any piece to see exactly where it can go.',
    href: '/pieces',
    color: 'from-amber-400 to-yellow-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800/50',
  },
  {
    emoji: '📚',
    title: 'Step-by-Step Lessons',
    description: 'Follow our beginner-friendly lessons in order! From the board itself to cool strategies — one step at a time.',
    href: '/learn',
    color: 'from-purple-400 to-indigo-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800/50',
  },
  {
    emoji: '📜',
    title: 'Rules & Concepts',
    description: 'What is check? What is stalemate? Learn all the special rules with easy explanations and board examples!',
    href: '/rules',
    color: 'from-blue-400 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800/50',
  },
  {
    emoji: '🧩',
    title: 'Solve Puzzles',
    description: 'Practice your skills with fun challenges! Find the winning move and get a big celebration from Sir Clip!',
    href: '/puzzles',
    color: 'from-green-400 to-emerald-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800/50',
  },
  {
    emoji: '💬',
    title: 'Ask Anything',
    description: "Got a chess question? Search our big list of Q&As! \"How does the knight move?\" — we've got the answer!",
    href: '/faq',
    color: 'from-pink-400 to-rose-500',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    border: 'border-pink-200 dark:border-pink-800/50',
  },
];

const QUICK_FACTS = [
  { label: 'Chess pieces', value: '6', emoji: '♟️' },
  { label: 'Board squares', value: '64', emoji: '♜' },
  { label: 'Starting pieces each', value: '16', emoji: '♞' },
  { label: 'Possible first moves', value: '20', emoji: '♗' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['♜', '♞', '♝', '♛', '♚', '♟'].map((piece, i) => (
            <motion.span
              key={i}
              className="absolute text-4xl sm:text-6xl opacity-5 select-none"
              style={{ left: `${(i * 18) + 3}%`, top: `${(i % 3) * 30 + 10}%` }}
              animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
            >
              {piece}
            </motion.span>
          ))}
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <Mascot size="lg" emotion="happy" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-7xl font-extrabold mb-4 tracking-tight"
          >
            <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
              Learn Chess
            </span>
            <br />
            <span className="text-text-primary">the Fun Way!</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl sm:text-2xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Welcome to <strong>Chessmates</strong> — where anyone can learn chess step by step!
            No experience needed. We explain everything like you are 10 years old.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/learn">
              <motion.button
                className="px-8 py-4 rounded-2xl font-bold text-lg text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #F5C842, #E0A020)' }}
                whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(245,200,66,0.4)' }}
                whileTap={{ scale: 0.97 }}
              >
                Start Learning Now!
              </motion.button>
            </Link>
            <Link href="/puzzles">
              <motion.button
                className="px-8 py-4 rounded-2xl font-bold text-lg border-2 border-amber-400 text-amber-600 dark:text-amber-400 bg-white dark:bg-background-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                Try a Puzzle
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-amber-50 dark:bg-amber-900/10 border-y border-amber-200 dark:border-amber-800/30 py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {QUICK_FACTS.map((fact, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl mb-1">{fact.emoji}</div>
              <div className="text-3xl font-extrabold text-amber-500">{fact.value}</div>
              <div className="text-xs text-text-muted">{fact.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-3">
              Everything You Need to Learn Chess!
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              Pick a section to jump right in, or follow the lessons in order!
            </p>
          </motion.div>

          <div className="feature-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.3 }}
              >
                <Link href={feature.href}>
                  <motion.div
                    className={`${feature.bg} border-2 ${feature.border} rounded-2xl p-6 cursor-pointer h-full`}
                    whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                      {feature.emoji}
                    </div>
                    <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                    <p className="text-sm leading-relaxed">{feature.description}</p>
                    <div className="mt-4 text-sm font-semibold text-amber-600 dark:text-amber-400">
                      Let&apos;s go →
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-auto py-12 px-4 bg-gradient-to-br from-amber-500 to-yellow-400">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-4">♞</div>
          <h2 className="text-3xl font-extrabold text-white mb-3">
            Ready to become a chess champion?
          </h2>
          <p className="text-amber-100 mb-6 text-lg">
            Chess is a game of skill, strategy, and creativity. And the best part? Anyone can learn it!
          </p>
          <Link href="/learn">
            <motion.button
              className="px-8 py-4 rounded-2xl bg-white text-amber-600 font-bold text-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Your First Lesson!
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  );
}
