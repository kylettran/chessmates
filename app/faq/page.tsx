'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { FORUM_CATEGORIES, type ForumCategory, type ForumQuestion, type ForumAnswer } from '@/lib/forumTypes';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function QuestionSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-amber-200/50 dark:border-amber-800/30 bg-background p-5 space-y-3 animate-pulse">
      <div className="h-5 bg-amber-100 dark:bg-amber-900/30 rounded-lg w-3/4" />
      <div className="h-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg w-full" />
      <div className="h-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg w-2/3" />
      <div className="flex gap-2 mt-2">
        <div className="h-6 w-16 bg-amber-100 dark:bg-amber-900/30 rounded-full" />
        <div className="h-6 w-20 bg-amber-100 dark:bg-amber-900/30 rounded-full" />
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, imageUrl, sizeClass = 'w-8 h-8' }: { name: string; imageUrl?: string; sizeClass?: string }) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 flex items-center justify-center text-xs font-bold shrink-0`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Category colors ──────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  general: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  openings: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  tactics: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  endgame: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
  'app-feedback': 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
};

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  isAdmin,
  onUpvote,
  onRefresh,
}: {
  question: ForumQuestion;
  isAdmin: boolean;
  onUpvote: (id: string) => void;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [answers, setAnswers] = useState<ForumAnswer[]>([]);
  const [answersLoaded, setAnswersLoaded] = useState(false);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [answerBody, setAnswerBody] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { isSignedIn } = useUser();

  const hasAdminAnswer = answers.some(a => a.isAdminAnswer);

  useEffect(() => {
    if (expanded && !answersLoaded) {
      setLoadingAnswers(true);
      fetch(`/api/forum/questions/${question._id}`)
        .then(r => r.json())
        .then(data => {
          setAnswers(data.answers || []);
          setAnswersLoaded(true);
          setLoadingAnswers(false);
        })
        .catch(() => setLoadingAnswers(false));
    }
  }, [expanded, answersLoaded, question._id]);

  const handleSubmitAnswer = async () => {
    if (!answerBody.trim()) return;
    setSubmittingAnswer(true);
    try {
      const res = await fetch(`/api/forum/questions/${question._id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: answerBody }),
      });
      if (res.ok) {
        const newAnswer = await res.json();
        setAnswers(prev => [...prev, newAnswer]);
        setAnswerBody('');
        onRefresh();
      }
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleTogglePin = async () => {
    setActionLoading(true);
    try {
      await fetch(`/api/forum/questions/${question._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ togglePin: true }),
      });
      onRefresh();
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAnswered = async () => {
    setActionLoading(true);
    try {
      await fetch(`/api/forum/questions/${question._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggleAnswered: true }),
      });
      onRefresh();
    } finally {
      setActionLoading(false);
    }
  };

  const catInfo = FORUM_CATEGORIES.find(c => c.id === question.category);
  const catColor = CATEGORY_COLORS[question.category] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  const answerCount = answersLoaded ? answers.length : (question.answerCount ?? 0);

  return (
    <div
      className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
        question.isPinned
          ? 'border-l-[5px] border-amber-400 dark:border-amber-500 bg-amber-50/30 dark:bg-amber-900/10'
          : 'border-amber-200/50 dark:border-amber-800/30 bg-background hover:border-amber-300/70 dark:hover:border-amber-700/50'
      }`}
    >
      {/* Clickable header */}
      <div
        className="p-4 sm:p-5 cursor-pointer select-none"
        onClick={() => setExpanded(prev => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') setExpanded(prev => !prev); }}
      >
        {/* Top row: badges + pin icon + chevron */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {question.isAnswered && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                Answered ✓
              </span>
            )}
            {question.isAnswered && hasAdminAnswer && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                👑 Kyle responded
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {question.isPinned && <span className="text-base" title="Pinned">📌</span>}
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-text-muted text-sm leading-none"
            >
              ▾
            </motion.span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-text-primary text-base leading-snug mb-1">
          {question.title}
        </h3>

        {/* Body preview */}
        <p className="text-sm text-text-secondary leading-relaxed mb-3">
          {question.body.length > 120 ? question.body.slice(0, 120) + '…' : question.body}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${catColor}`}>
            {catInfo?.emoji} {catInfo?.label ?? question.category}
          </span>
          <div className="flex items-center gap-1.5">
            <Avatar name={question.authorName} imageUrl={question.authorImageUrl} sizeClass="w-5 h-5" />
            <span className="text-xs text-text-secondary">{question.authorName}</span>
          </div>
          <span className="text-xs text-text-muted">{timeAgo(question._createdAt)}</span>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-4">
          <button
            onClick={e => { e.stopPropagation(); onUpvote(question._id); }}
            className="flex items-center gap-1 text-sm text-text-secondary hover:text-amber-500 transition-colors min-h-[44px] px-1"
            title="Upvote"
          >
            <span>👍</span>
            <span className="font-bold">{question.upvotes}</span>
          </button>
          <span className="text-sm text-text-secondary flex items-center gap-1">
            <span>💬</span>
            <span>{answerCount}</span>
          </span>
        </div>
      </div>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 border-t border-amber-200/30 dark:border-amber-800/20 pt-4 space-y-4">

              {/* Full question body */}
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {question.body}
              </p>

              {/* Admin controls */}
              {isAdmin && (
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleTogglePin}
                    disabled={actionLoading}
                    className="text-xs px-3 py-1.5 rounded-xl font-bold border-2 border-amber-300 dark:border-amber-600/60 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all disabled:opacity-50 min-h-[36px]"
                  >
                    {question.isPinned ? '📌 Unpin' : '📌 Pin'}
                  </button>
                  <button
                    onClick={handleToggleAnswered}
                    disabled={actionLoading}
                    className="text-xs px-3 py-1.5 rounded-xl font-bold border-2 border-emerald-300 dark:border-emerald-600/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all disabled:opacity-50 min-h-[36px]"
                  >
                    {question.isAnswered ? '✓ Unmark Answered' : '✓ Mark Answered'}
                  </button>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-amber-200/30 dark:border-amber-800/20" />

              {/* Answers */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-text-primary">
                  {answerCount} Answer{answerCount !== 1 ? 's' : ''}
                </h4>

                {loadingAnswers && (
                  <div className="space-y-2">
                    {[1, 2].map(i => (
                      <div key={i} className="animate-pulse h-16 rounded-xl bg-amber-100 dark:bg-amber-900/20" />
                    ))}
                  </div>
                )}

                <AnimatePresence>
                  {answers.map((answer, i) => (
                    <motion.div
                      key={answer._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`rounded-xl p-3 ${
                        answer.isAdminAnswer
                          ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40'
                          : 'bg-background-secondary'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <Avatar name={answer.authorName} imageUrl={answer.authorImageUrl} sizeClass="w-6 h-6" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-text-primary">{answer.authorName}</span>
                            {answer.isAdminAnswer && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                                👑 Admin
                              </span>
                            )}
                            <span className="text-xs text-text-muted">{timeAgo(answer._createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                        {answer.body}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {!loadingAnswers && answers.length === 0 && (
                  <p className="text-xs text-text-muted italic">No answers yet — be the first!</p>
                )}
              </div>

              {/* Post answer form */}
              {isSignedIn ? (
                <div className="space-y-2">
                  <textarea
                    value={answerBody}
                    onChange={e => setAnswerBody(e.target.value)}
                    placeholder="Write your answer…"
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border-2 border-amber-200 dark:border-amber-800/40 bg-background text-text-primary text-sm focus:border-amber-400 focus:outline-none resize-none"
                  />
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submittingAnswer || !answerBody.trim()}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    {submittingAnswer ? 'Posting…' : 'Post Answer'}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-text-secondary">
                  <a href="/sign-in" className="text-amber-500 hover:text-amber-600 font-bold underline">
                    Sign in
                  </a>{' '}
                  to post an answer
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Ask Question Modal ───────────────────────────────────────────────────────

function AskModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: { title: string; body: string; category: ForumCategory }) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<ForumCategory>('general');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ title, body, category });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-lg bg-background rounded-2xl border-2 border-amber-200 dark:border-amber-800/40 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-200/30 dark:border-amber-800/20 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">Ask the Community</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-2xl w-10 h-10 flex items-center justify-center rounded-xl hover:bg-background-secondary transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">
              Question Title <span className="text-red-400">*</span>
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What do you want to know?"
              className="w-full px-3 py-2.5 rounded-xl border-2 border-amber-200 dark:border-amber-800/40 bg-background text-text-primary text-sm focus:border-amber-400 focus:outline-none min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">
              Details <span className="text-red-400">*</span>
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Provide more context about your question…"
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-amber-200 dark:border-amber-800/40 bg-background text-text-primary text-sm focus:border-amber-400 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as ForumCategory)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-amber-200 dark:border-amber-800/40 bg-background text-text-primary text-sm focus:border-amber-400 focus:outline-none min-h-[44px]"
            >
              {FORUM_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-amber-200/30 dark:border-amber-800/20 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-amber-200 dark:border-amber-700/60 text-text-secondary hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all min-h-[44px]"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={submitting || !title.trim() || !body.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {submitting ? 'Posting…' : 'Ask Question'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FAQPage() {
  const [questions, setQuestions] = useState<ForumQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ForumCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showAskModal, setShowAskModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { isSignedIn } = useUser();
  const router = useRouter();

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.set('category', activeCategory);
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`/api/forum/questions?${params.toString()}`);
      const data = await res.json();
      setQuestions(data.questions ?? []);
      setIsAdmin(data.isAdmin ?? false);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search]);

  useEffect(() => {
    const delay = search ? 300 : 0;
    const t = setTimeout(() => fetchQuestions(), delay);
    return () => clearTimeout(t);
  }, [fetchQuestions, search]);

  const handleAskClick = () => {
    if (!isSignedIn) {
      router.push('/sign-in');
    } else {
      setShowAskModal(true);
    }
  };

  const handleSubmitQuestion = async (data: { title: string; body: string; category: ForumCategory }) => {
    const res = await fetch('/api/forum/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) await fetchQuestions();
  };

  const handleUpvote = async (id: string) => {
    await fetch(`/api/forum/questions/${id}/upvote`, { method: 'POST' });
    await fetchQuestions();
  };

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* ── Hero ── */}
        <section className="text-center space-y-3 pt-2">
          <motion.div
            className="text-5xl inline-block"
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 6 }}
          >
            💬
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
            Ask Anything
          </h1>
          <p className="text-text-secondary max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Ask the chess community anything — or get a direct answer from Kyle.
            No question is too basic.
          </p>

          {!loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-text-muted"
            >
              {questions.length} question{questions.length !== 1 ? 's' : ''} in the community
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAskClick}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200/50 dark:shadow-amber-900/50 transition-all min-h-[44px]"
          >
            ✏️ Ask a Question
          </motion.button>
        </section>

        {/* ── Filters ── */}
        <div className="space-y-3">
          {/* Category tabs — horizontal scroll on mobile */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 flex-nowrap whitespace-nowrap pb-1">
              {FORUM_CATEGORIES.map(cat => {
                const isActive = activeCategory === cat.id;
                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all shrink-0 min-h-[44px] ${
                      isActive
                        ? 'bg-amber-500 border-amber-500 text-white shadow-md'
                        : 'bg-background border-amber-200/60 dark:border-amber-800/40 text-text-secondary hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-300'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Search */}
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions…"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 dark:border-amber-800/40 bg-background text-text-primary text-sm focus:border-amber-400 focus:outline-none min-h-[44px]"
          />
        </div>

        {/* ── Questions list ── */}
        <section className="space-y-3">
          {loading ? (
            <>
              <QuestionSkeleton />
              <QuestionSkeleton />
              <QuestionSkeleton />
            </>
          ) : questions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 space-y-4"
            >
              <div className="text-6xl">♟️</div>
              <h3 className="text-xl font-bold text-text-primary">No questions yet</h3>
              <p className="text-text-secondary text-sm max-w-sm mx-auto">
                Be the first to ask the community!
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAskClick}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white transition-all min-h-[44px]"
              >
                ✏️ Ask a Question
              </motion.button>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {questions.map((q, i) => (
                <motion.div
                  key={q._id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <QuestionCard
                    question={q}
                    isAdmin={isAdmin}
                    onUpvote={handleUpvote}
                    onRefresh={fetchQuestions}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </section>
      </main>

      {/* Ask Modal */}
      <AnimatePresence>
        {showAskModal && (
          <AskModal
            onClose={() => setShowAskModal(false)}
            onSubmit={handleSubmitQuestion}
          />
        )}
      </AnimatePresence>
    </>
  );
}
