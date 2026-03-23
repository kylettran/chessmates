'use client';

import type { UserProgress } from '@/types/chess';

const STORAGE_KEY = 'chessmates_progress';

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') return { completedLessons: [], solvedPuzzles: [], visitedPieces: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completedLessons: [], solvedPuzzles: [], visitedPieces: [] };
    return JSON.parse(raw) as UserProgress;
  } catch { return { completedLessons: [], solvedPuzzles: [], visitedPieces: [] }; }
}

function saveProgress(progress: UserProgress) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function markLessonComplete(lessonId: string) {
  const progress = getProgress();
  if (!progress.completedLessons.includes(lessonId)) { progress.completedLessons.push(lessonId); saveProgress(progress); }
}

export function markPuzzleSolved(puzzleId: string) {
  const progress = getProgress();
  if (!progress.solvedPuzzles.includes(puzzleId)) { progress.solvedPuzzles.push(puzzleId); saveProgress(progress); }
}

export function markPieceVisited(pieceId: string) {
  const progress = getProgress();
  if (!progress.visitedPieces.includes(pieceId)) { progress.visitedPieces.push(pieceId); saveProgress(progress); }
}

export function isLessonComplete(lessonId: string): boolean { return getProgress().completedLessons.includes(lessonId); }
export function isPuzzleSolved(puzzleId: string): boolean { return getProgress().solvedPuzzles.includes(puzzleId); }
export function isPieceVisited(pieceId: string): boolean { return getProgress().visitedPieces.includes(pieceId); }
