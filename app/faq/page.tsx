'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Navbar } from '@/components/layout/Navbar';
import type { ForumQuestion, ForumAnswer, ForumCategory } from '@/lib/forumTypes';
import { FORUM_CATEGORIES, CATEGORY_COLORS, timeAgo } from '@/lib/forumTypes';

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, imageUrl, size = 36 }: { name: string; imageUrl?: string; size?: number }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-amber-200 dark:bg-amber-800/60 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Answer Item ──────────────────────────────────────────────────────────────

function AnswerItem({ answer }: { answer: ForumAnswer }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 p-3 sm:p-4 rounded-xl ${
        answer.isAdminAnswer
          ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40'
          : 'bg-background-secondary'
      }`}
    >
      <Avatar name={answer.authorName} imageUrl={answer.authorImageUrl} size={32} />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-text-primary">{answer.authorName}</span>
          {answer.isAdminAnswer && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800/60 text-amber-800 dark:text-amber-200">
              👑 Kyle – Admin
            </span>
          )}
          <span className="text-xs text-text-secondary/60">{timeAgo(answer._createdAt)}</span>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap break-words">{answer.body}</p>
      </div>
    </motion.div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  isAdmin,
  currentUserId,
  onUpdate,
}: {
  question: ForumQuestion;
  isAdmin: boolean;
  currentUserId: string | null | undefined;
  onUpdate: (id: string, patch: Partial<ForumQuestion>) => void;
}) {
  const [open, setOpen]             = useState(false);
  const [answers, setAnswers]       = useState<ForumAnswer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [answerBody, setAnswerBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [upvoted, setUpvoted]       = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(question.upvotes);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadAnswers = useCallback(async () => {
    setLoadingAnswers(true);
    try {
      const res = await fetch(`/api/forum/questions/${question._id}`);
      const data = await res.json();
      setAnswers(data.answers ?? []);
    } finally {
      setLoadingAnswers(false);
    }
  }, [question._id]);

  const handleToggle = () => {
    setOpen(prev => {
      if (!prev) loadAnswers();
      return !prev;
    });
  };

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (upvoted) return;
    setUpvoted(true);
    setUpvoteCount(c => c + 1);
    await fetch(`/api/forum/questions/${question._id}/upvote`, { method: 'POST' });
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerBody.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/forum/questions/${question._id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: answerBody }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnswers(prev => [...prev, data.answer]);
        setAnswerBody('');
        onUpdate(question._id, { answerCount: (question.answerCount ?? 0) + 1 });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminToggle = async (field: 'isPinned' | 'isAnswered') => {
    const newVal = !question[field];
    await fetch(`/api/forum/questions/${question._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: newVal }),
    });
    onUpdate(question._id, { [field]: newVal });
  };

  const catColor = CATEGORY_COLORS[question.category] ?? CATEGORY_COLORS.general;
  const catInfo  = FORUM_CATEGORIES.find(c => c.id === question.category);

  return (
    <div
      className={`rounded-2xl border-2 overflow-hidden transition-colors duration-200 ${
        question.isPinned
          ? 'border-amber-300 dark:border-amber-600/60 bg-amber-50/30 dark:bg-amber-900/10'
          : open
          ? 'border-amber-200 dark:border-amber-700/50 bg-background'
          : 'border-amber-200/50 dark:border-amber-800/30 bg-background hover:border-amber-300/70 dark:hover:border-amber-700/50'
      }`}
    >
      {/* Header */}
      <button className="w-full text-left px-4 sm:px-5 py-4 hover:bg-amber-50/30 dark:hover:bg-amber-900/5 transition-colors" onClick={handleToggle}>
        <div className="flex items-start gap-3">
          <div className="shrink-0 pt-0.5">
            <Avatar name={question.authorName} imageUrl={question.authorImageUrl} size={36} />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-start gap-2">
              <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
                {question.isPinned && <span className="text-amber-500 text-sm shrink-0">📌</span>}
                <h3 className="font-bold text-text-primary text-sm sm:text-base leading-snug break-words">{question.title}</h3>
              </div>
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-amber-400/70 shrink-0 text-base leading-none mt-0.5"
              >
                ▾
              </motion.span>
            </div>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-2 break-words">
              {question.body.slice(0, 140)}{question.body.length > 140 ? '…' : ''}
            </p>

            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${catColor.bg} ${catColor.text}`}>
                {catInfo?.emoji} {catInfo?.label}
              </span>
              {question.isAnswered && (
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  Answered ✓
                </span>
              )}
              {question.hasAdminAnswer && (
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  👑 Kyle responded
                </span>
              )}
              <span className="text-[10px] sm:text-xs text-text-secondary/60 ml-auto">
                {question.authorName} · {timeAgo(question._createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-0.5">
              <button
                onClick={handleUpvote}
                className={`flex items-center gap-1 text-xs font-medium transition-colors min-h-[32px] px-2 -ml-2 rounded-lg ${
                  upvoted ? 'text-amber-600 dark:text-amber-400' : 'text-text-secondary/60 hover:text-amber-500'
                }`}
              >
                <span>{upvoted ? '▲' : '△'}</span>
                <span>{upvoteCount}</span>
              </button>
              <span className="text-xs text-text-secondary/60 flex items-center gap-1">
                <span>💬</span>
                <span>{question.answerCount ?? 0} {(question.answerCount ?? 0) === 1 ? 'answer' : 'answers'}</span>
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-amber-200/30 dark:border-amber-800/20 px-4 sm:px-5 py-5 space-y-5">

              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap break-words">{question.body}</p>

              {/* Admin controls */}
              {isAdmin && (
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleAdminToggle('isPinned')}
                    className="text-xs px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-700/50 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all font-medium min-h-[36px]"
                  >
                    {question.isPinned ? '📌 Unpin' : '📌 Pin Question'}
                  </button>
                  <button
                    onClick={() => handleAdminToggle('isAnswered')}
                    className="text-xs px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all font-medium min-h-[36px]"
                  >
                    {question.isAnswered ? '✓ Unmark Answered' : '✓ Mark as Answered'}
                  </button>
                </div>
              )}

              {/* Answers */}
              {loadingAnswers ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="h-16 rounded-xl bg-background-secondary animate-pulse" />
                  ))}
                </div>
              ) : answers.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-text-secondary/60 uppercase tracking-wider">
                    {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                  </p>
                  {answers.map(a => <AnswerItem key={a._id} answer={a} />)}
                </div>
              ) : (
                <p className="text-center py-4 text-sm text-text-secondary/60">No answers yet — be the first to help!</p>
              )}

              {/* Post answer */}
              {currentUserId ? (
                <form onSubmit={handleSubmitAnswer} className="space-y-3 pt-2 border-t border-amber-200/20 dark:border-amber-800/15">
                  <p className="text-xs font-semibold text-text-secondary/60 uppercase tracking-wider">Your Answer</p>
                  <textarea
                    ref={textareaRef}
                    value={answerBody}
                    onChange={e => setAnswerBody(e.target.value)}
                    placeholder="Share what you know…"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-amber-200/60 dark:border-amber-800/40 bg-background text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-amber-400 dark:focus:border-amber-600 transition-colors resize-none"
                  />
                  <div className="flex justify-end">
                    <motion.button
                      type="submit"
                      disabled={!answerBody.trim() || submitting}
                      whileTap={{ scale: 0.97 }}
                      className="px-5 py-2.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
                    >
                      {submitting ? 'Posting…' : 'Post Answer'}
                    </motion.button>
                  </div>
                </form>
              ) : (
                <div className="pt-2 border-t border-amber-200/20 dark:border-amber-800/15 text-center">
                  <Link href="/sign-in" className="text-sm text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                    Sign in to post an answer →
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Ask Modal ────────────────────────────────────────────────────────────────

function AskModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (q: ForumQuestion) => void }) {
  const [title, setTitle]       = useState('');
  const [body, setBody]         = useState('');
  const [category, setCategory] = useState<ForumCategory>('general');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) { setError('Please fill in both the title and details.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/forum/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, category }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return; }
      onSubmit(data.question);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="relative w-full sm:max-w-lg sm:mx-4 bg-background rounded-t-3xl sm:rounded-2xl border-2 border-amber-200/60 dark:border-amber-800/40 shadow-2xl"
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-amber-200 dark:bg-amber-800/60" />
        </div>

        <div className="px-5 sm:px-6 py-4 sm:py-5 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-text-primary">Ask the Community</h2>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-background-secondary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Question Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. When should I castle?"
                maxLength={120}
                className="w-full px-4 py-3 rounded-xl border-2 border-amber-200/60 dark:border-amber-800/40 bg-background text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-amber-400 dark:focus:border-amber-600 transition-colors min-h-[44px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ForumCategory)}
                className="w-full px-4 py-3 rounded-xl border-2 border-amber-200/60 dark:border-amber-800/40 bg-background text-sm text-text-primary focus:outline-none focus:border-amber-400 dark:focus:border-amber-600 transition-colors min-h-[44px]"
              >
                {FORUM_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Details *</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Give as much detail as you can — the more context, the better the answer!"
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-amber-200/60 dark:border-amber-800/40 bg-background text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-amber-400 dark:focus:border-amber-600 transition-colors resize-none"
              />
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="flex gap-3 pt-1 pb-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm border-2 border-amber-200 dark:border-amber-800/40 text-text-secondary hover:bg-background-secondary transition-all min-h-[44px]"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={!title.trim() || !body.trim() || submitting}
                whileTap={{ scale: 0.97 }}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
              >
                {submitting ? 'Posting…' : 'Post Question'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function QuestionSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-amber-200/30 dark:border-amber-800/20 p-4 sm:p-5 space-y-3 animate-pulse">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg w-3/4" />
          <div className="h-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg w-full" />
          <div className="h-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg w-1/2" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FaqPage() {
  const { user, isLoaded } = useUser();
  const [questions, setQuestions]           = useState<ForumQuestion[]>([]);
  const [loading, setLoading]               = useState(true);
  const [activeCategory, setActiveCategory] = useState<ForumCategory | 'all'>('all');
  const [search, setSearch]                 = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showModal, setShowModal]           = useState(false);
  const [isAdmin, setIsAdmin]               = useState(false);

  // Fetch admin status server-side so ADMIN_CLERK_USER_ID never appears in
  // the client JS bundle (it lives only in process.env on the server).
  useEffect(() => {
    if (!isLoaded || !user) return;
    fetch('/api/me')
      .then(r => r.json())
      .then(data => setIsAdmin(data.isAdmin === true))
      .catch(() => {});
  }, [isLoaded, user]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.set('category', activeCategory);
      if (debouncedSearch)          params.set('search', debouncedSearch);
      const res  = await fetch(`/api/forum/questions?${params}`);
      const data = await res.json();
      setQuestions(data.questions ?? []);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, debouncedSearch]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const handleQuestionUpdate = useCallback((id: string, patch: Partial<ForumQuestion>) => {
    setQuestions(prev => prev.map(q => q._id === id ? { ...q, ...patch } : q));
  }, []);

  const handleNewQuestion = useCallback((q: ForumQuestion) => {
    setQuestions(prev => [{ ...q, answerCount: 0, hasAdminAnswer: false }, ...prev]);
    setShowModal(false);
  }, []);

  const handleAskClick = () => {
    if (!isLoaded) return;
    if (!user) { window.location.href = '/sign-in'; return; }
    setShowModal(true);
  };

  const isEmpty = !loading && questions.length === 0;

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">

        {/* Hero */}
        <section className="text-center space-y-3 pt-2">
          <motion.div
            className="text-5xl inline-block"
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 6 }}
          >
            ♟
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
            Ask Anything
          </h1>
          <p className="text-text-secondary max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            Ask the community anything about chess — or get a direct answer from Kyle.
            No question is too basic.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap pt-1">
            {!loading && (
              <span className="text-xs text-text-secondary/60">
                {questions.length > 0
                  ? `${questions.length} question${questions.length !== 1 ? 's' : ''} in the community`
                  : 'No questions yet'}
              </span>
            )}
            <motion.button
              onClick={handleAskClick}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-md hover:shadow-lg transition-all min-h-[44px]"
            >
              + Ask a Question
            </motion.button>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
            <span>👑</span>
            <span>Kyle monitors this forum and responds personally.</span>
          </p>
        </section>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40 pointer-events-none text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions…"
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-amber-200/60 dark:border-amber-800/40 bg-background text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-amber-400 dark:focus:border-amber-600 transition-colors min-h-[44px]"
          />
        </div>

        {/* Category tabs */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 w-max">
            {FORUM_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as ForumCategory | 'all')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all min-h-[40px] border-2 ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                    : 'border-amber-200/60 dark:border-amber-800/40 text-text-secondary hover:border-amber-300 dark:hover:border-amber-700/60 bg-background'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Questions */}
        <section className="space-y-3">
          {loading ? (
            <><QuestionSkeleton /><QuestionSkeleton /><QuestionSkeleton /></>
          ) : isEmpty ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 space-y-4"
            >
              <div className="text-6xl">♟</div>
              <h3 className="text-lg font-bold text-text-primary">
                {debouncedSearch || activeCategory !== 'all' ? 'No questions match your search' : 'No questions yet'}
              </h3>
              <p className="text-sm text-text-secondary max-w-xs mx-auto">
                {debouncedSearch || activeCategory !== 'all' ? 'Try a different search or category.' : 'Be the first to ask the community something!'}
              </p>
              {!debouncedSearch && activeCategory === 'all' && (
                <motion.button
                  onClick={handleAskClick}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white transition-all min-h-[44px]"
                >
                  + Ask the First Question
                </motion.button>
              )}
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {questions.map((q, i) => (
                <motion.div
                  key={q._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <QuestionCard
                    question={q}
                    isAdmin={isAdmin}
                    currentUserId={user?.id}
                    onUpdate={handleQuestionUpdate}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </section>

        {/* Bottom CTA */}
        {!isEmpty && !loading && (
          <div className="text-center py-4">
            <motion.button
              onClick={handleAskClick}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-amber-200 dark:border-amber-700/60 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all min-h-[44px]"
            >
              + Ask Your Own Question
            </motion.button>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showModal && <AskModal onClose={() => setShowModal(false)} onSubmit={handleNewQuestion} />}
      </AnimatePresence>
    </>
  );
}
