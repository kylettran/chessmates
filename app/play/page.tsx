'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

const PLATFORMS = [
  {
    id: 'chesscom',
    emoji: '♟️',
    name: 'Chess.com',
    tagline: 'The world\'s largest chess platform',
    description: 'Play millions of players worldwide. Daily puzzles, lessons, tournaments, and live games with time controls from bullet to classical.',
    features: ['100M+ registered players', 'Live & correspondence games', 'Daily puzzles & lessons', 'Tournaments & clubs'],
    href: 'https://www.chess.com',
    color: 'emerald',
    badge: 'Most Popular',
    external: true,
  },
  {
    id: 'lichess',
    emoji: '♜',
    name: 'Lichess.org',
    tagline: 'Free, open-source, and forever',
    description: 'Completely free with no ads or subscriptions — ever. Powerful analysis tools, thousands of daily games, and an amazing community.',
    features: ['100% free — always', 'No ads, no paywalls', 'Powerful game analysis', 'Open-source & transparent'],
    href: 'https://lichess.org',
    color: 'blue',
    badge: 'Free & Open',
    external: true,
  },
  {
    id: 'chessmates-platform',
    emoji: '👑',
    name: 'Kyle\'s Platform',
    tagline: 'A custom chess experience — coming soon',
    description: 'A proprietary chess platform built from the ground up by Kyle Tran. Designed to complement your Chessmates learning journey.',
    features: ['Built by Kyle Tran', 'Integrated learning path', 'Custom game modes', 'Launching soon...'],
    href: null,
    color: 'amber',
    badge: 'Coming Soon',
    external: false,
  },
];

const COLOR_MAP: Record<string, {
  bg: string; border: string; badgeBg: string; badgeText: string;
  btn: string; btnHover: string; glow: string; icon: string;
}> = {
  emerald: {
    bg: 'bg-emerald-50/60 dark:bg-emerald-900/10',
    border: 'border-emerald-200 dark:border-emerald-700/40',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    btn: 'bg-emerald-500 hover:bg-emerald-600',
    btnHover: 'hover:shadow-emerald-200/60 dark:hover:shadow-emerald-900/60',
    glow: 'from-emerald-400/10 to-transparent',
    icon: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  },
  blue: {
    bg: 'bg-blue-50/60 dark:bg-blue-900/10',
    border: 'border-blue-200 dark:border-blue-700/40',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/50',
    badgeText: 'text-blue-700 dark:text-blue-300',
    btn: 'bg-blue-500 hover:bg-blue-600',
    btnHover: 'hover:shadow-blue-200/60 dark:hover:shadow-blue-900/60',
    glow: 'from-blue-400/10 to-transparent',
    icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  },
  amber: {
    bg: 'bg-amber-50/60 dark:bg-amber-900/10',
    border: 'border-amber-200 dark:border-amber-700/40',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
    badgeText: 'text-amber-700 dark:text-amber-300',
    btn: 'bg-amber-500 hover:bg-amber-600',
    btnHover: 'hover:shadow-amber-200/60 dark:hover:shadow-amber-900/60',
    glow: 'from-amber-400/10 to-transparent',
    icon: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  },
};

export default function PlayPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ── Hero ── */}
        <section className="text-center space-y-3 pt-2">
          <motion.div
            className="text-5xl inline-block"
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
          >
            🎮
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
            Play Chess
          </h1>
          <p className="text-text-secondary max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            You&apos;ve learned the pieces, the rules, and the strategy. Now it&apos;s time to
            apply everything against real opponents!
          </p>
        </section>

        {/* ── Journey reminder ── */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
          <span className="text-lg shrink-0">🏆</span>
          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
            This is <strong>Step 6</strong> of your Chessmates journey. If you haven&apos;t finished
            the lessons yet, that&apos;s okay — come back here when you&apos;re ready to play for real!
          </p>
        </div>

        {/* ── Platform Cards ── */}
        <section className="space-y-5">
          <h2 className="text-lg font-bold text-text-primary">Choose a Platform</h2>
          <div className="grid gap-5 sm:grid-cols-1">
            {PLATFORMS.map((platform, i) => {
              const c = COLOR_MAP[platform.color];
              const isComingSoon = !platform.href;

              return (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative rounded-2xl border-2 overflow-hidden ${c.bg} ${c.border} ${isComingSoon ? 'opacity-80' : ''}`}
                >
                  {/* Glow accent */}
                  <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${c.glow} pointer-events-none`} />

                  <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold shrink-0 ${c.icon}`}>
                      {platform.emoji}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-text-primary">{platform.name}</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badgeBg} ${c.badgeText}`}>
                              {platform.badge}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5">{platform.tagline}</p>
                        </div>
                      </div>

                      <p className="text-sm text-text-secondary leading-relaxed">{platform.description}</p>

                      {/* Features */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {platform.features.map((f) => (
                          <div key={f} className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              platform.color === 'emerald' ? 'bg-emerald-400' :
                              platform.color === 'blue' ? 'bg-blue-400' : 'bg-amber-400'
                            }`} />
                            {f}
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      {platform.href ? (
                        <motion.a
                          href={platform.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all ${c.btn} ${c.btnHover} hover:shadow-lg`}
                        >
                          Play on {platform.name}
                          <span className="text-xs opacity-80">↗</span>
                        </motion.a>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white ${c.btn} opacity-50 cursor-not-allowed`}>
                            Coming Soon
                          </div>
                          <p className="text-xs text-text-secondary italic">Stay tuned — this is going to be special.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Tips ── */}
        <section className="rounded-2xl border border-amber-200/40 dark:border-amber-800/30 bg-background-secondary p-5 space-y-4">
          <h2 className="font-bold text-text-primary flex items-center gap-2">
            <span>💡</span> Tips for Your First Real Games
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: '🧠', tip: 'Apply your opening principles every game — control the center, develop pieces, castle early.' },
              { icon: '⏳', tip: 'Start with 10+0 or 15+10 time controls. Bullet chess is fun later, but slow games help you learn.' },
              { icon: '🔍', tip: 'After each game, review your moves. Both Chess.com and Lichess have free game analysis tools.' },
              { icon: '📈', tip: "Don't stress about your rating at first. Every game — win or lose — teaches you something valuable." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                <span className="text-xl shrink-0">{item.icon}</span>
                <p className="leading-relaxed">{item.tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Back to learning ── */}
        <section className="text-center py-4 space-y-3">
          <p className="text-sm text-text-secondary">Want to sharpen your skills first?</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/puzzles"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border-2 border-amber-200 dark:border-amber-700/60 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all"
            >
              🧩 Puzzles
            </Link>
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border-2 border-amber-200 dark:border-amber-700/60 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all"
            >
              📚 Lessons
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border-2 border-amber-200 dark:border-amber-700/60 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all"
            >
              💬 Ask Anything
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}
