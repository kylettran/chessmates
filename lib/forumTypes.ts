export interface ForumQuestion {
  _id: string;
  _type: 'forumQuestion';
  _createdAt: string;
  title: string;
  body: string;
  category: ForumCategory;
  authorClerkId: string;
  authorName: string;
  authorImageUrl?: string;
  upvotes: number;
  upvoterIds?: string[];
  isAnswered: boolean;
  isPinned: boolean;
  answerCount?: number;
  hasAdminAnswer?: boolean;
}

export interface ForumAnswer {
  _id: string;
  _type: 'forumAnswer';
  _createdAt: string;
  questionId: string;
  body: string;
  authorClerkId: string;
  authorName: string;
  authorImageUrl?: string;
  isAdminAnswer: boolean;
  upvotes: number;
}

export type ForumCategory = 'general' | 'openings' | 'tactics' | 'endgame' | 'app-feedback';

export const FORUM_CATEGORIES: { id: ForumCategory | 'all'; label: string; emoji: string }[] = [
  { id: 'all',          label: 'All Questions',    emoji: '💬' },
  { id: 'general',      label: 'Beginner',         emoji: '♟️' },
  { id: 'openings',     label: 'Openings',         emoji: '📖' },
  { id: 'tactics',      label: 'Tactics',          emoji: '🧩' },
  { id: 'endgame',      label: 'Endgame',          emoji: '🏁' },
  { id: 'app-feedback', label: 'App Feedback',     emoji: '💡' },
];

export const CATEGORY_COLORS: Record<ForumCategory, { bg: string; text: string }> = {
  general:       { bg: 'bg-amber-100 dark:bg-amber-900/40',   text: 'text-amber-700 dark:text-amber-300'   },
  openings:      { bg: 'bg-blue-100 dark:bg-blue-900/40',     text: 'text-blue-700 dark:text-blue-300'     },
  tactics:       { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300' },
  endgame:       { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300' },
  'app-feedback':{ bg: 'bg-slate-100 dark:bg-slate-800/60',   text: 'text-slate-700 dark:text-slate-300'   },
};

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
