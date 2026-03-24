'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';

type Category = 'all' | 'winning' | 'special' | 'draws';

interface Rule {
  id: string;
  category: 'winning' | 'special' | 'draws';
  emoji: string;
  title: string;
  tagline: string;
  shortDesc: string;
  bullets: string[];
  tip: string;
  color: string;
}

const RULES: Rule[] = [
  {
    id: 'check',
    category: 'winning',
    emoji: '⚠️',
    title: 'Check',
    tagline: 'The king is under attack!',
    shortDesc: 'When an enemy piece targets your king, your king is in "check." You MUST deal with it immediately — no other moves allowed!',
    bullets: [
      'Move the king to a safe square',
      'Block the attack with another piece',
      'Capture the attacking piece',
    ],
    tip: 'Always scan the board for checks before you move. Beginners often miss that their king is in danger!',
    color: 'red',
  },
  {
    id: 'checkmate',
    category: 'winning',
    emoji: '👑',
    title: 'Checkmate',
    tagline: 'King is trapped — game over!',
    shortDesc: 'Checkmate is the goal of chess! The king is in check AND has absolutely no way to escape. The player who delivers checkmate wins.',
    bullets: [
      'King is currently under attack (in check)',
      'King cannot move to any safe square',
      'Cannot block the attack',
      'Cannot capture the attacker',
    ],
    tip: '"Checkmate" comes from the Persian "Shah Mat" — meaning "the king is helpless." When it happens, the losing player tips their king over as a sign of respect.',
    color: 'amber',
  },
  {
    id: 'castling',
    category: 'special',
    emoji: '🏰',
    title: 'Castling',
    tagline: 'King and rook swap places!',
    shortDesc: 'The only move in chess where two pieces move at once. The king slides 2 squares toward a rook, and that rook jumps over to the other side.',
    bullets: [
      'Neither the king nor rook has moved before',
      'No pieces between the king and rook',
      'King is not currently in check',
      'King does not pass through or land on an attacked square',
    ],
    tip: 'Castle early! Keeping your king in the center as pieces come out is very dangerous. Castling tucks your king to safety behind a wall of pawns.',
    color: 'emerald',
  },
  {
    id: 'enpassant',
    category: 'special',
    emoji: '👻',
    title: 'En Passant',
    tagline: "Chess's sneakiest capture!",
    shortDesc: 'If an enemy pawn moves 2 squares and lands right beside your pawn on the 5th rank, you can capture it as if it only moved 1 square. French for "in passing."',
    bullets: [
      'Your pawn must be on the 5th rank',
      'Enemy pawn must have JUST moved 2 squares next to you',
      'You must capture on your very next move — or lose the chance forever!',
    ],
    tip: 'This is the rarest move in chess! Many beginners don\'t even know it exists. When you use it correctly, your opponent will look totally confused.',
    color: 'purple',
  },
  {
    id: 'promotion',
    category: 'special',
    emoji: '⭐',
    title: 'Pawn Promotion',
    tagline: 'A pawn becomes a queen!',
    shortDesc: 'When your pawn reaches the very last rank (the opposite end of the board), it transforms into any piece you choose. Almost always a queen!',
    bullets: [
      'Queen — almost always the best choice',
      'Rook, Bishop, or Knight are also options',
      'You can have TWO queens on the board at the same time',
      'Choosing a knight instead is called "underpromotion" — rare but sometimes clever!',
    ],
    tip: 'In theory, all 8 of your pawns could promote. That means you could have 9 queens! Nobody has ever done this in a real game (they resign long before that).',
    color: 'yellow',
  },
  {
    id: 'stalemate',
    category: 'draws',
    emoji: '😐',
    title: 'Stalemate',
    tagline: "Stuck with nowhere to go — it's a draw!",
    shortDesc: 'If a player has NO legal moves but their king is NOT in check, the game ends in a draw. This is called stalemate — one of chess\'s biggest upsets!',
    bullets: [
      'It is your turn to move',
      'Your king is NOT in check',
      'Every move you could make would put your own king in danger',
    ],
    tip: 'Many winning games have been accidentally thrown away by giving stalemate! When you\'re winning, always check your opponent still has a legal move. And if you\'re losing badly — try to trick your opponent into stalemate!',
    color: 'blue',
  },
  {
    id: 'repetition',
    category: 'draws',
    emoji: '🔄',
    title: 'Threefold Repetition',
    tagline: 'Same position 3 times — draw!',
    shortDesc: 'If the exact same board position occurs three times in a game (with the same player to move), either player can claim a draw.',
    bullets: [
      'Exact same pieces on exact same squares',
      'Same player\'s turn each time',
      'Same castling rights and en passant options',
      'The three occurrences do not have to be consecutive',
    ],
    tip: '"Perpetual check" is a classic drawing trick — you keep giving check over and over, and your opponent can never escape. Eventually the same position repeats 3 times and it\'s a draw!',
    color: 'cyan',
  },
  {
    id: 'fiftymove',
    category: 'draws',
    emoji: '⏱️',
    title: '50-Move Rule',
    tagline: 'No progress? Call a draw!',
    shortDesc: 'If 50 moves pass without a pawn moving AND without any capture, either player can claim a draw. This prevents games from going on forever.',
    bullets: [
      'Counter resets when any pawn moves',
      'Counter resets when any piece is captured',
      'Mostly applies in tricky endgames',
      'In casual games, you\'ll rarely ever need this rule',
    ],
    tip: 'In tournament chess, you must claim the draw BEFORE making your move — not after. Keep count if you think this situation might arise!',
    color: 'slate',
  },
  {
    id: 'insufficient',
    category: 'draws',
    emoji: '🪶',
    title: 'Insufficient Material',
    tagline: "Not enough pieces to checkmate!",
    shortDesc: 'If neither side has enough pieces to possibly deliver checkmate, the game is an automatic draw — even if both players keep trying.',
    bullets: [
      'King vs King — automatic draw',
      'King + Bishop vs King — automatic draw',
      'King + Knight vs King — automatic draw',
      'King + Rook vs King — CAN win, game continues',
    ],
    tip: "Don't trade ALL your pieces away even when you're ahead! Trading down to King + Bishop vs King just gives your opponent a free draw.",
    color: 'teal',
  },
];

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'all', label: 'All Rules', emoji: '📜' },
  { id: 'winning', label: 'Winning & Losing', emoji: '👑' },
  { id: 'special', label: 'Special Moves', emoji: '✨' },
  { id: 'draws', label: 'Draw Rules', emoji: '🤝' },
];

const CATEGORY_META: Record<string, { label: string; textColor: string }> = {
  winning: { label: 'Winning & Losing', textColor: 'text-amber-600 dark:text-amber-400' },
  special: { label: 'Special Move', textColor: 'text-purple-600 dark:text-purple-400' },
  draws: { label: 'Draw Rule', textColor: 'text-blue-600 dark:text-blue-400' },
};

const COLORS: Record<string, { bg: string; border: string; badgeBg: string; badgeText: string; dot: string }> = {
  red:     { bg: 'bg-red-50 dark:bg-red-900/20',       border: 'border-red-200 dark:border-red-800/40',       badgeBg: 'bg-red-100 dark:bg-red-900/40',       badgeText: 'text-red-700 dark:text-red-300',     dot: 'bg-red-400' },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-200 dark:border-amber-800/40',   badgeBg: 'bg-amber-100 dark:bg-amber-900/40',   badgeText: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-400' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/40', badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40', badgeText: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-400' },
  purple:  { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800/40', badgeBg: 'bg-purple-100 dark:bg-purple-900/40', badgeText: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-400' },
  yellow:  { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800/40', badgeBg: 'bg-yellow-100 dark:bg-yellow-900/40', badgeText: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-400' },
  blue:    { bg: 'bg-blue-50 dark:bg-blue-900/20',     border: 'border-blue-200 dark:border-blue-800/40',     badgeBg: 'bg-blue-100 dark:bg-blue-900/40',     badgeText: 'text-blue-700 dark:text-blue-300',   dot: 'bg-blue-400' },
  cyan:    { bg: 'bg-cyan-50 dark:bg-cyan-900/20',     border: 'border-cyan-200 dark:border-cyan-800/40',     badgeBg: 'bg-cyan-100 dark:bg-cyan-900/40',     badgeText: 'text-cyan-700 dark:text-cyan-300',   dot: 'bg-cyan-400' },
  slate:   { bg: 'bg-slate-50 dark:bg-slate-800/40',   border: 'border-slate-200 dark:border-slate-700/40',   badgeBg: 'bg-slate-100 dark:bg-slate-800/60',   badgeText: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-400' },
  teal:    { bg: 'bg-teal-50 dark:bg-teal-900/20',     border: 'border-teal-200 dark:border-teal-800/40',     badgeBg: 'bg-teal-100 dark:bg-teal-900/40',     badgeText: 'text-teal-700 dark:text-teal-300',   dot: 'bg-teal-400' },
};

function RuleCard({ rule, learned, onToggle }: { rule: Rule; learned: boolean; onToggle: () => void }) {
  const [open, setOpen] = useState(false);
  const c = COLORS[rule.color] ?? COLORS.slate;
  const meta = CATEGORY_META[rule.category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={`rounded-2xl border-2 ${c.border} ${c.bg} overflow-hidden transition-shadow ${learned ? 'opacity-70' : ''}`}
    >
      {/* Header — always visible */}
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-4 focus:outline-none"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
      >
        <span className="text-3xl mt-0.5 shrink-0">{rule.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-extrabold text-lg text-text-primary leading-tight">{rule.title}</span>
            <span className={`text-xs font-semibold ${meta.textColor}`}>{meta.label}</span>
            {learned && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                ✓ Learned
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-text-muted mb-1">{rule.tagline}</p>
          <p className="text-sm text-text-secondary leading-relaxed">{rule.shortDesc}</p>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-muted text-lg shrink-0 mt-0.5"
        >
          ▾
        </motion.span>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-black/5 dark:border-white/5">
              {/* Bullet list */}
              <ul className="space-y-1.5 mb-4">
                {rule.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {/* Tip box */}
              <div className={`rounded-xl px-4 py-3 mb-4 ${c.badgeBg} ${c.badgeText}`}>
                <p className="text-sm font-medium leading-relaxed">
                  <span className="font-bold">Tip: </span>{rule.tip}
                </p>
              </div>

              {/* Mark as learned button */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                  learned
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white dark:bg-background-secondary border-current text-text-secondary hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <span>{learned ? '✓' : '○'}</span>
                <span>{learned ? 'Marked as learned!' : 'Mark as learned'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RulesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());

  const toggleLearned = useCallback((id: string) => {
    setLearnedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const filtered = activeCategory === 'all' ? RULES : RULES.filter(r => r.category === activeCategory);
  const learnedCount = learnedIds.size;
  const progressPct = Math.round((learnedCount / RULES.length) * 100);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-12 px-4 sm:px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['♜', '♞', '♛', '♚', '♟', '♝'].map((p, i) => (
            <motion.span
              key={i}
              className="absolute text-4xl sm:text-6xl opacity-5 select-none"
              style={{ left: `${i * 17 + 3}%`, top: `${(i % 3) * 30 + 5}%` }}
              animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.6 }}
            >
              {p}
            </motion.span>
          ))}
        </div>

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl mb-4"
          >
            📜
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold text-text-primary mb-3 tracking-tight"
          >
            The{' '}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Rules
            </span>{' '}
            of Chess
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary text-lg leading-relaxed"
          >
            Everything from checkmate to stalemate — explained simply. Tap any rule to expand it!
          </motion.p>
        </div>
      </section>

      {/* Progress bar */}
      <section className="px-4 sm:px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white dark:bg-background-secondary border-2 border-amber-200 dark:border-amber-800/40 rounded-2xl px-5 py-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-text-primary">Your progress</span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {learnedCount} / {RULES.length} rules learned
              </span>
            </div>
            <div className="h-3 rounded-full bg-amber-100 dark:bg-amber-900/30 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
                animate={{ width: `${progressPct}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
            {learnedCount === RULES.length && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-2 text-center"
              >
                You know all the rules! Time to play some chess!
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Category filter */}
      <section className="px-4 sm:px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => {
              const count = cat.id === 'all' ? RULES.length : RULES.filter(r => r.category === cat.id).length;
              const isActive = activeCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                    isActive
                      ? 'bg-blue-500 border-blue-500 text-white shadow-md'
                      : 'bg-white dark:bg-background-secondary border-border text-text-secondary hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-background-secondary dark:bg-background text-text-muted'}`}>
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rule cards */}
      <section className="px-4 sm:px-6 pb-16 flex-1">
        <div className="max-w-2xl mx-auto space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((rule, i) => (
              <motion.div
                key={rule.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: i * 0.04 }}
              >
                <RuleCard
                  rule={rule}
                  learned={learnedIds.has(rule.id)}
                  onToggle={() => toggleLearned(rule.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 px-4 bg-gradient-to-br from-blue-500 to-cyan-400">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-4xl mb-3">♟️</div>
          <h2 className="text-2xl font-extrabold text-white mb-2">
            Rules down? Now practice!
          </h2>
          <p className="text-blue-100 mb-6">
            The best way to learn rules is to use them. Try solving a puzzle!
          </p>
          <a href="/puzzles">
            <motion.button
              className="px-8 py-3 rounded-2xl bg-white text-blue-600 font-bold text-base shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Try a Puzzle →
            </motion.button>
          </a>
        </div>
      </section>
    </div>
  );
}
