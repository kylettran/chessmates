'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import type { ForumQuestion, ForumAnswer } from '@/lib/forumTypes';
import { CATEGORY_COLORS, FORUM_CATEGORIES, timeAgo } from '@/lib/forumTypes';

function Avatar({ name, imageUrl, size = 40 }: { name: string; imageUrl?: string; size?: number }) {
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

interface UserActivity {
  questions: ForumQuestion[];
  answers: (ForumAnswer & { questionTitle?: string })[];
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'questions' | 'answers'>('questions');

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.replace('/sign-in'); return; }

    fetch('/api/forum/user')
      .then(r => r.json())
      .then(data => setActivity(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) return null;

  const displayName = user.fullName
    || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    || user.primaryEmailAddress?.emailAddress?.split('@')[0]
    || 'Chess Player';

  const questionCount = activity?.questions.length ?? 0;
  const answerCount   = activity?.answers.length ?? 0;
  const totalUpvotes  = [
    ...(activity?.questions ?? []).map(q => q.upvotes),
    ...(activity?.answers   ?? []).map(a => a.upvotes),
  ].reduce((s, n) => s + n, 0);

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">

        {/* Profile header */}
        <section className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <Avatar name={displayName} imageUrl={user.imageUrl} size={72} />
          <div className="text-center sm:text-left space-y-1 flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary break-words">{displayName}</h1>
            <p className="text-sm text-text-secondary">{user.primaryEmailAddress?.emailAddress}</p>
            <p className="text-xs text-text-secondary/60">
              Member since {new Date(user.createdAt ?? Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Questions', value: questionCount, icon: '❓' },
            { label: 'Answers', value: answerCount, icon: '💬' },
            { label: 'Upvotes', value: totalUpvotes, icon: '▲' },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-2xl border-2 border-amber-200/50 dark:border-amber-800/30 bg-amber-50/40 dark:bg-amber-900/10 px-3 py-4 text-center space-y-1"
            >
              <div className="text-xl">{stat.icon}</div>
              <div className="text-2xl font-bold text-text-primary">
                {loading ? <span className="inline-block w-6 h-5 bg-amber-100 dark:bg-amber-900/30 rounded animate-pulse" /> : stat.value}
              </div>
              <div className="text-xs text-text-secondary/70">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2">
          {(['questions', 'answers'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border-2 min-h-[44px] ${
                tab === t
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'border-amber-200/60 dark:border-amber-800/40 text-text-secondary bg-background hover:border-amber-300 dark:hover:border-amber-700/60'
              }`}
            >
              {t === 'questions' ? `❓ Questions (${questionCount})` : `💬 Answers (${answerCount})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200/30 dark:border-amber-800/20 animate-pulse" />
              ))}
            </motion.div>
          ) : tab === 'questions' ? (
            <motion.div key="questions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {questionCount === 0 ? (
                <EmptyState
                  icon="❓"
                  title="No questions yet"
                  desc="Head over to Ask Anything and post your first question to the community."
                  cta="Ask a Question"
                  href="/faq"
                />
              ) : (
                activity!.questions.map((q, i) => (
                  <motion.div
                    key={q._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <QuestionRow question={q} />
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div key="answers" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {answerCount === 0 ? (
                <EmptyState
                  icon="💬"
                  title="No answers yet"
                  desc="Browse the forum and share your chess knowledge with the community."
                  cta="Browse Questions"
                  href="/faq"
                />
              ) : (
                activity!.answers.map((a, i) => (
                  <motion.div
                    key={a._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <AnswerRow answer={a} />
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back to forum */}
        <div className="text-center pt-2">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-amber-200 dark:border-amber-700/60 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all min-h-[44px]"
          >
            💬 Go to Ask Anything
          </Link>
        </div>
      </main>
    </>
  );
}

function QuestionRow({ question }: { question: ForumQuestion }) {
  const catColor = CATEGORY_COLORS[question.category] ?? CATEGORY_COLORS.general;
  const catInfo  = FORUM_CATEGORIES.find(c => c.id === question.category);

  return (
    <Link
      href="/faq"
      className="block rounded-2xl border-2 border-amber-200/50 dark:border-amber-800/30 bg-background hover:border-amber-300 dark:hover:border-amber-700/50 hover:bg-amber-50/20 dark:hover:bg-amber-900/5 transition-all p-4 sm:p-5 space-y-2"
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {question.isPinned && <span className="text-amber-500 text-xs">📌</span>}
            <h3 className="font-bold text-text-primary text-sm sm:text-base leading-snug break-words">{question.title}</h3>
          </div>
          <p className="text-xs text-text-secondary line-clamp-2 break-words leading-relaxed">
            {question.body.slice(0, 120)}{question.body.length > 120 ? '…' : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${catColor.bg} ${catColor.text}`}>
          {catInfo?.emoji} {catInfo?.label}
        </span>
        {question.isAnswered && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
            Answered ✓
          </span>
        )}
        <span className="text-[10px] text-text-secondary/60 ml-auto flex items-center gap-2">
          <span>▲ {question.upvotes}</span>
          <span>💬 {question.answerCount ?? 0}</span>
          <span>{timeAgo(question._createdAt)}</span>
        </span>
      </div>
    </Link>
  );
}

function AnswerRow({ answer }: { answer: ForumAnswer & { questionTitle?: string } }) {
  return (
    <Link
      href="/faq"
      className="block rounded-2xl border-2 border-amber-200/50 dark:border-amber-800/30 bg-background hover:border-amber-300 dark:hover:border-amber-700/50 hover:bg-amber-50/20 dark:hover:bg-amber-900/5 transition-all p-4 sm:p-5 space-y-2"
    >
      {answer.questionTitle && (
        <p className="text-[10px] font-semibold text-text-secondary/60 uppercase tracking-wider truncate">
          Re: {answer.questionTitle}
        </p>
      )}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 break-words">
            {answer.body}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {answer.isAdminAnswer && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300">
            👑 Admin Answer
          </span>
        )}
        <span className="text-[10px] text-text-secondary/60 ml-auto flex items-center gap-2">
          <span>▲ {answer.upvotes}</span>
          <span>{timeAgo(answer._createdAt)}</span>
        </span>
      </div>
    </Link>
  );
}

function EmptyState({ icon, title, desc, cta, href }: {
  icon: string; title: string; desc: string; cta: string; href: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12 space-y-4"
    >
      <div className="text-5xl">{icon}</div>
      <h3 className="text-lg font-bold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">{desc}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white transition-all min-h-[44px]"
      >
        {cta}
      </Link>
    </motion.div>
  );
}
