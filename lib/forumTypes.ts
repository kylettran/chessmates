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
  isAnswered: boolean;
  isPinned: boolean;
  answerCount?: number;
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
  { id: 'all', label: 'All Questions', emoji: '💬' },
  { id: 'general', label: 'Beginner Questions', emoji: '♟️' },
  { id: 'openings', label: 'Opening Theory', emoji: '📖' },
  { id: 'tactics', label: 'Tactics & Puzzles', emoji: '🧩' },
  { id: 'endgame', label: 'Endgame', emoji: '🏁' },
  { id: 'app-feedback', label: 'App Feedback', emoji: '💡' },
];
