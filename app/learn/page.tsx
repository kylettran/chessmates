'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LESSONS } from '@/lib/chess/lessons';
import { getPieceSymbol } from '@/lib/chess/pieces';
import type { BoardState, HighlightedSquare, Lesson } from '@/types/chess';

// ─── Chess Board ─────────────────────────────────────────────────────────────

const SQ = 40;
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

function squareBg(hlType: HighlightedSquare['type'] | undefined, isLight: boolean): string {
  if (hlType === 'selected')   return 'bg-amber-400/70';
  if (hlType === 'capture')    return 'bg-red-400/60';
  if (hlType === 'check')      return 'bg-red-500/70';
  if (hlType === 'last-move')  return 'bg-yellow-300/50';
  if (hlType === 'hint')       return 'bg-yellow-400/60';
  return isLight
    ? 'bg-amber-50 dark:bg-amber-100/10'
    : 'bg-amber-700/55 dark:bg-amber-900/55';
}

function LessonBoard({
  boardState,
  highlightedSquares = [],
}: {
  boardState: BoardState;
  highlightedSquares?: HighlightedSquare[];
}) {
  const hlMap = useMemo(() => {
    const m = new Map<string, HighlightedSquare['type']>();
    highlightedSquares.forEach(h => m.set(`${h.row}-${h.col}`, h.type));
    return m;
  }, [highlightedSquares]);

  return (
    <div className="flex gap-1 select-none">
      {/* Rank labels */}
      <div className="flex flex-col">
        {RANKS.map(r => (
          <div
            key={r}
            style={{ height: SQ, width: 14 }}
            className="flex items-center justify-center text-[10px] text-text-secondary/50 font-mono"
          >
            {r}
          </div>
        ))}
      </div>

      <div>
        {/* Board grid */}
        <div
          className="relative border-2 border-amber-900/25 dark:border-amber-200/15 rounded-lg overflow-hidden shadow-md"
          style={{ width: SQ * 8, height: SQ * 8 }}
        >
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 8 }, (_, col) => {
              const isLight = (row + col) % 2 === 0;
              const piece   = boardState.squares[row][col];
              const hlType  = hlMap.get(`${row}-${col}`);

              return (
                <div
                  key={`${row}-${col}`}
                  style={{ position: 'absolute', top: row * SQ, left: col * SQ, width: SQ, height: SQ }}
                  className={`relative flex items-center justify-center ${squareBg(hlType, isLight)}`}
                >
                  {/* Valid-move dot */}
                  {hlType === 'valid-move' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-3 h-3 rounded-full bg-emerald-500/65" />
                    </div>
                  )}

                  {/* Piece */}
                  {piece && (
                    <span
                      className={`text-2xl leading-none select-none relative z-10 ${
                        piece.color === 'white'
                          ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
                          : 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                      }`}
                    >
                      {getPieceSymbol(piece.type, piece.color)}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* File labels */}
        <div className="flex mt-0.5">
          {FILES.map(f => (
            <div
              key={f}
              style={{ width: SQ }}
              className="flex items-center justify-center text-[10px] text-text-secondary/50 font-mono"
            >
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Content Renderer ─────────────────────────────────────────────────────────

function parseBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i} className="font-semibold text-text-primary">
            {p.slice(2, -2)}
          </strong>
        ) : (
          p
        )
      )}
    </>
  );
}

function RenderContent({ text }: { text: string }) {
  const paragraphs = text.split('\n\n');
  return (
    <div className="space-y-3">
      {paragraphs.map((para, pi) => {
        const lines = para.split('\n').map(l => l.trim()).filter(Boolean);
        return (
          <div key={pi} className="space-y-1.5">
            {lines.map((line, li) => {
              const isBullet   = line.startsWith('- ');
              const isNumbered = /^\d+\.\s/.test(line);

              if (isBullet || isNumbered) {
                const content = line.replace(/^-\s/, '').replace(/^\d+\.\s/, '');
                return (
                  <div key={li} className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed">
                    <span className="text-amber-400 mt-0.5 shrink-0 text-xs">●</span>
                    <span>{parseBold(content)}</span>
                  </div>
                );
              }
              return (
                <p key={li} className="text-sm text-text-secondary leading-relaxed">
                  {parseBold(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Progress ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'chessmates_learn_completed';

function useLearnProgress() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCompleted(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  const markComplete = useCallback((id: string) => {
    setCompleted(prev => {
      const next = new Set([...prev, id]);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  return { completed, markComplete };
}

// ─── Learning Path (visual nodes) ────────────────────────────────────────────

function LearningPath({
  lessons,
  completed,
  openLesson,
  onSelect,
}: {
  lessons: Lesson[];
  completed: Set<string>;
  openLesson: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-2 scrollbar-hide">
      {lessons.map((lesson, i) => {
        const isDone   = completed.has(lesson.id);
        const isActive = openLesson === lesson.id;

        return (
          <div key={lesson.id} className="flex items-center shrink-0">
            {/* Node */}
            <button
              onClick={() => onSelect(lesson.id)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold border-2 transition-all shadow-sm ${
                  isDone
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-600/60 text-emerald-600 dark:text-emerald-300'
                    : isActive
                    ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-500/60 text-amber-600 dark:text-amber-300 shadow-amber-200/50 dark:shadow-amber-900/50'
                    : 'bg-background border-amber-200/60 dark:border-amber-800/50 text-amber-500/70 dark:text-amber-600/60 group-hover:border-amber-300 dark:group-hover:border-amber-700/60'
                }`}
              >
                {isDone ? '✓' : lesson.icon}
              </motion.div>
              <span
                className={`text-[10px] font-medium max-w-[56px] text-center leading-tight transition-colors ${
                  isActive
                    ? 'text-amber-600 dark:text-amber-300'
                    : isDone
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-text-secondary/70'
                }`}
              >
                {lesson.title}
              </span>
            </button>

            {/* Connector line */}
            {i < lessons.length - 1 && (
              <div className="w-8 h-0.5 mx-1 mb-5 rounded-full overflow-hidden bg-amber-200/50 dark:bg-amber-800/40 shrink-0">
                {completed.has(lesson.id) && (
                  <motion.div
                    className="h-full bg-emerald-400/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Lesson Card ─────────────────────────────────────────────────────────────

function LessonCard({
  lesson,
  index,
  isOpen,
  onToggle,
  isCompleted,
  onComplete,
}: {
  lesson: Lesson;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  isCompleted: boolean;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isOpen) setStep(0);
  }, [isOpen]);

  const current = lesson.steps[step];
  const isLast  = step === lesson.steps.length - 1;

  return (
    <div
      className={`rounded-2xl border-2 overflow-hidden transition-colors duration-200 ${
        isCompleted
          ? 'border-emerald-200 dark:border-emerald-700/40 bg-emerald-50/20 dark:bg-emerald-900/5'
          : isOpen
          ? 'border-amber-300 dark:border-amber-600/50 bg-amber-50/30 dark:bg-amber-900/10'
          : 'border-amber-200/50 dark:border-amber-800/30 bg-background hover:border-amber-300/70 dark:hover:border-amber-700/50'
      }`}
    >
      {/* Header */}
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-amber-50/40 dark:hover:bg-amber-900/10 transition-colors"
        onClick={onToggle}
      >
        {/* Badge */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
            isCompleted
              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300'
              : isOpen
              ? 'bg-amber-200 dark:bg-amber-800/50 text-amber-700 dark:text-amber-200'
              : 'bg-amber-100/80 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
          }`}
        >
          {isCompleted ? '✓' : index + 1}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-base">{lesson.icon}</span>
            <span className="font-bold text-text-primary text-sm sm:text-base">
              {lesson.title}
            </span>
            {isCompleted && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                Done
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary truncate">{lesson.description}</p>
        </div>

        {/* Step count + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-text-secondary hidden sm:block">
            {lesson.steps.length} steps
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className={`text-lg leading-none transition-colors ${
              isOpen ? 'text-amber-500' : 'text-amber-400/70'
            }`}
          >
            ▾
          </motion.span>
        </div>
      </button>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-amber-200/30 dark:border-amber-800/20 px-5 py-5 space-y-5">

              {/* Step progress dots */}
              <div className="flex items-center gap-2">
                {lesson.steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`rounded-full transition-all duration-200 ${
                      i === step
                        ? 'w-6 h-2.5 bg-amber-500'
                        : i < step
                        ? 'w-2.5 h-2.5 bg-emerald-400'
                        : 'w-2.5 h-2.5 bg-amber-200 dark:bg-amber-800/60 hover:bg-amber-300 dark:hover:bg-amber-700/60'
                    }`}
                    aria-label={`Step ${i + 1}`}
                  />
                ))}
                <span className="text-xs text-text-secondary ml-1 font-mono">
                  {step + 1}/{lesson.steps.length}
                </span>
              </div>

              {/* Step content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.16 }}
                  className="flex flex-col lg:flex-row gap-6 items-start"
                >
                  {/* Text */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <h4 className="text-base font-bold text-text-primary leading-snug">
                      {current.title}
                    </h4>
                    <RenderContent text={current.content} />
                  </div>

                  {/* Board */}
                  {current.boardState && (
                    <div className="shrink-0 overflow-x-auto max-w-full">
                      <LessonBoard
                        boardState={current.boardState}
                        highlightedSquares={current.highlightedSquares}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setStep(s => s - 1)}
                  disabled={step === 0}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary bg-background-secondary hover:bg-amber-100 dark:hover:bg-amber-900/30 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                >
                  ← Back
                </button>

                {isLast ? (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { onComplete(); onToggle(); }}
                    className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-sm flex items-center gap-2"
                  >
                    <span>✓</span>
                    Complete Lesson
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setStep(s => s + 1)}
                    className="px-5 py-2 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-sm"
                  >
                    Next →
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LearnPage() {
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const { completed, markComplete } = useLearnProgress();

  const completedCount = completed.size;
  const totalLessons   = LESSONS.length;
  const pct            = Math.round((completedCount / totalLessons) * 100);

  const handleSelect = useCallback((id: string) => {
    setOpenLesson(prev => (prev === id ? null : id));
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      {/* ── Hero ── */}
      <section className="text-center space-y-3 pt-2 pb-2">
        <motion.div
          className="text-5xl inline-block"
          animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 6 }}
        >
          ♞
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
          Learn Chess
        </h1>
        <p className="text-text-secondary max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
          Build real chess knowledge from the ground up — every concept explained visually,
          step by step.
        </p>
      </section>

      {/* ── Full Journey Roadmap ── */}
      <section className="rounded-2xl border border-amber-200/50 dark:border-amber-800/30 bg-background-secondary overflow-hidden">
        <div className="px-5 pt-5 pb-1">
          <p className="text-xs font-semibold text-text-secondary/60 uppercase tracking-wider mb-1">
            Your Chess Journey — 6 Steps to Your First Real Game
          </p>
          <p className="text-xs text-text-secondary">
            Follow this path from zero to playing real games online.
          </p>
        </div>
        <div className="overflow-x-auto pb-5 pt-4 px-5 scrollbar-hide">
          <div className="flex items-start min-w-max gap-0">
            {[
              { step: 1, emoji: '♟️', label: 'Meet the Pieces', sub: 'Learn every piece', href: '/pieces', color: 'amber' },
              { step: 2, emoji: '📚', label: 'Step-by-Step Lessons', sub: 'Rules, tactics & strategy', href: '/learn', color: 'yellow', active: true },
              { step: 3, emoji: '📜', label: 'Strategy & Concepts', sub: 'Openings & game phases', href: '/rules', color: 'orange' },
              { step: 4, emoji: '🧩', label: 'Solve Puzzles', sub: 'Train your eye', href: '/puzzles', color: 'emerald' },
              { step: 5, emoji: '💬', label: 'Ask Anything', sub: 'AI chess tutor', href: '/faq', color: 'blue' },
              { step: 6, emoji: '🎮', label: 'Play Chess!', sub: 'Apply everything', href: '/play', color: 'purple' },
            ].map((item, i) => (
              <div key={item.step} className="flex items-center">
                <Link href={item.href} className="flex flex-col items-center gap-2 group w-[88px]">
                  <motion.div
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm border-2 transition-all ${
                      item.active
                        ? 'bg-amber-400 dark:bg-amber-500 border-amber-500 dark:border-amber-400 text-white shadow-amber-300/50'
                        : 'bg-background border-amber-200/60 dark:border-amber-800/50 group-hover:border-amber-300 dark:group-hover:border-amber-600/70 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20'
                    }`}
                  >
                    {item.emoji}
                  </motion.div>
                  <div className="text-center">
                    <div className={`text-[10px] font-bold leading-tight ${
                      item.active ? 'text-amber-600 dark:text-amber-400' : 'text-text-primary group-hover:text-amber-600 dark:group-hover:text-amber-400'
                    } transition-colors`}>
                      {item.label}
                    </div>
                    <div className="text-[9px] text-text-secondary/60 leading-tight mt-0.5">{item.sub}</div>
                  </div>
                  <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    item.active
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                      : 'bg-background text-text-secondary/50'
                  }`}>
                    Step {item.step}
                  </div>
                </Link>
                {i < 5 && (
                  <div className="flex items-center mb-6 mx-1 shrink-0">
                    <div className="w-6 h-0.5 bg-amber-200/70 dark:bg-amber-800/50" />
                    <span className="text-amber-300/70 dark:text-amber-700/70 text-xs">›</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Learning Path ── */}
      <section className="bg-background-secondary rounded-2xl px-5 py-4 border border-amber-200/40 dark:border-amber-800/30">
        <p className="text-xs font-semibold text-text-secondary/60 uppercase tracking-wider mb-4">
          Lesson Progress
        </p>
        <LearningPath
          lessons={LESSONS}
          completed={completed}
          openLesson={openLesson}
          onSelect={handleSelect}
        />
      </section>

      {/* ── Progress Bar ── */}
      <section className="bg-background-secondary rounded-2xl p-5 border border-amber-200/40 dark:border-amber-800/30">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-text-primary">Progress</span>
          <span className="text-sm font-bold text-amber-500">
            {completedCount} / {totalLessons} lessons
          </span>
        </div>
        <div className="h-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="mt-2.5 flex justify-between items-center">
          {completedCount === totalLessons ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold w-full text-center">
              All lessons complete — you&apos;re ready for puzzles!
            </p>
          ) : (
            <>
              <p className="text-xs text-text-secondary">
                {totalLessons - completedCount} lesson{totalLessons - completedCount !== 1 ? 's' : ''} remaining
              </p>
              <p className="text-xs font-bold text-amber-500">{pct}%</p>
            </>
          )}
        </div>
      </section>

      {/* ── Tip ── */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
        <span className="text-lg shrink-0">💡</span>
        <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
          Click any lesson to open it, then tap{' '}
          <strong>Next →</strong> to walk through each step. The chess board shows
          exactly what each concept looks like in real positions.
        </p>
      </div>

      {/* ── Lesson Cards ── */}
      <section className="space-y-3">
        {LESSONS.map((lesson, i) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            index={i}
            isOpen={openLesson === lesson.id}
            onToggle={() => handleSelect(lesson.id)}
            isCompleted={completed.has(lesson.id)}
            onComplete={() => markComplete(lesson.id)}
          />
        ))}
      </section>

      {/* ── Footer CTA ── */}
      <section className="text-center py-8 space-y-4 border-t border-amber-200/30 dark:border-amber-800/20 pt-10">
        <div className="text-4xl">
          {completedCount === totalLessons ? '🏆' : '🧩'}
        </div>
        <h2 className="text-xl font-bold text-text-primary">
          {completedCount === totalLessons
            ? "You've mastered the basics!"
            : 'Ready to practice?'}
        </h2>
        <p className="text-sm text-text-secondary max-w-sm mx-auto">
          {completedCount === totalLessons
            ? 'Put everything to the test with our interactive puzzles across three difficulty levels.'
            : 'Already know the moves? Jump straight into puzzles or review the full rule set.'}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/puzzles"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
          >
            🧩 Try Puzzles
          </Link>
          <Link
            href="/rules"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-amber-200 dark:border-amber-700/60 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all"
          >
            📜 Browse Rules
          </Link>
          <Link
            href="/play"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-purple-200 dark:border-purple-700/60 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all"
          >
            🎮 Play Chess
          </Link>
        </div>
      </section>
    </main>
  );
}
