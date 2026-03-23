export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';
export type Color = 'white' | 'black';

export interface Piece { type: PieceType; color: Color; }
export interface Square { row: number; col: number; }
export type BoardSquareState = Piece | null;
export type BoardGrid = BoardSquareState[][];
export interface BoardState { squares: BoardGrid; turn: Color; }

export type HighlightType = 'selected' | 'valid-move' | 'capture' | 'last-move' | 'check' | 'hint';
export interface HighlightedSquare extends Square { type: HighlightType; }

export interface LessonStep {
  title: string;
  content: string;
  boardState?: BoardState;
  highlightedSquares?: HighlightedSquare[];
  animatePiece?: { from: Square; to: Square };
}
export interface Lesson {
  id: string; title: string; icon: string; description: string;
  difficulty: 'beginner' | 'intermediate'; steps: LessonStep[];
}

export interface Puzzle {
  id: string; title: string; description: string;
  difficulty: 'beginner' | 'intermediate';
  boardState: BoardState;
  correctMove: { from: Square; to: Square };
  hint: string; explanation: string;
}

export type FAQCategory = 'Piece Movement' | 'Special Rules' | 'Winning & Losing' | 'Strategy' | 'Vocabulary';
export interface FAQItem {
  id: string; question: string; answer: string;
  category: FAQCategory; emoji: string; keywords: string[];
  boardDiagram?: BoardState; highlightedSquares?: HighlightedSquare[];
}

export interface PieceInfo {
  id: string; type: PieceType; name: string; symbol: string; emoji: string;
  tagline: string; pointValue: number; color: 'white' | 'black';
  shortDescription: string; fullDescription: string;
  movementDescription: string; funFact: string;
  startingSquares: Square[]; demoSquare: Square;
}

export interface UserProgress {
  completedLessons: string[];
  solvedPuzzles: string[];
  visitedPieces: string[];
}
