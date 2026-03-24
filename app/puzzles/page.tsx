'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { getPieceSymbol } from '@/lib/chess/pieces';
import { getValidMoves } from '@/lib/chess/boardUtils';
import type { BoardGrid, Color, PieceType } from '@/types/chess';

// ─── Types ───────────────────────────────────────────────────────────────────

type Difficulty = 'easy' | 'medium' | 'hard';

interface PuzzlePiece { type: PieceType; color: Color; row: number; col: number; }
interface CorrectMove { fromRow: number; fromCol: number; toRow: number; toCol: number; }

interface Puzzle {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  pieces: PuzzlePiece[];
  turn: Color;
  correctMove: CorrectMove;
  hint: string;
  explanation: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildGrid(pieces: PuzzlePiece[]): BoardGrid {
  const grid: BoardGrid = Array.from({ length: 8 }, () => Array(8).fill(null));
  pieces.forEach(p => { grid[p.row][p.col] = { type: p.type, color: p.color }; });
  return grid;
}

// ─── Puzzle Data ─────────────────────────────────────────────────────────────
// Board coords: row 0 = rank 8, row 7 = rank 1 | col 0 = a-file, col 7 = h-file

const PUZZLES: Puzzle[] = [
  // ── EASY ──────────────────────────────────────────────────────────────────
  {
    id: 'e1',
    title: 'Back Rank Blitz',
    description: "The enemy king is hiding behind its pawns. One rook move ends it all!",
    difficulty: 'easy',
    turn: 'white',
    pieces: [
      { type: 'K', color: 'black', row: 0, col: 6 }, // Kg8
      { type: 'P', color: 'black', row: 1, col: 5 }, // Pf7
      { type: 'P', color: 'black', row: 1, col: 6 }, // Pg7
      { type: 'P', color: 'black', row: 1, col: 7 }, // Ph7
      { type: 'R', color: 'white', row: 7, col: 4 }, // Re1
      { type: 'K', color: 'white', row: 4, col: 3 }, // Kd4
    ],
    correctMove: { fromRow: 7, fromCol: 4, toRow: 0, toCol: 4 }, // Re8#
    hint: "Slide the rook all the way to the back rank.",
    explanation: "Re8 is checkmate! The rook controls the entire 8th rank — the king can't go to f8 or h8. Its own pawns on f7, g7, and h7 block every escape below.",
  },
  {
    id: 'e2',
    title: 'Corner the King',
    description: "The black king is alone in the corner. Your king and rook can finish it!",
    difficulty: 'easy',
    turn: 'white',
    pieces: [
      { type: 'K', color: 'black', row: 0, col: 0 }, // Ka8
      { type: 'K', color: 'white', row: 2, col: 1 }, // Kb6
      { type: 'R', color: 'white', row: 7, col: 1 }, // Rb1
    ],
    correctMove: { fromRow: 7, fromCol: 1, toRow: 0, toCol: 1 }, // Rb8#
    hint: "Push the rook to the back rank — your king already covers the escape squares.",
    explanation: "Rb8 is checkmate! The rook gives check on the 8th rank. The white king at b6 covers a7 and b7, so the black king is completely trapped with nowhere to go.",
  },
  {
    id: 'e3',
    title: "Queen's Corner",
    description: "The king is cornered at a1. One queen move delivers the final blow!",
    difficulty: 'easy',
    turn: 'white',
    pieces: [
      { type: 'K', color: 'black', row: 7, col: 0 }, // Ka1
      { type: 'Q', color: 'white', row: 5, col: 1 }, // Qb3
      { type: 'K', color: 'white', row: 6, col: 2 }, // Kc2
    ],
    correctMove: { fromRow: 5, fromCol: 1, toRow: 6, toCol: 0 }, // Qa2#
    hint: "Move the queen one step diagonally to trap the king completely.",
    explanation: "Qa2 is checkmate! The queen gives check on a2 and covers b1 and b2. The white king at c2 covers b1 and b2 as well — the black king has nowhere to run.",
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────
  {
    id: 'm1',
    title: 'The Knight Fork',
    description: "One knight move attacks the king AND the queen at the same time. Find it!",
    difficulty: 'medium',
    turn: 'white',
    pieces: [
      { type: 'K', color: 'black', row: 1, col: 4 }, // Ke7
      { type: 'Q', color: 'black', row: 1, col: 2 }, // Qc7
      { type: 'N', color: 'white', row: 5, col: 2 }, // Nc3
      { type: 'K', color: 'white', row: 7, col: 4 }, // Ke1
    ],
    correctMove: { fromRow: 5, fromCol: 2, toRow: 3, toCol: 3 }, // Nd5+
    hint: "Knights attack in an L-shape. Look for a square that threatens both the king and queen!",
    explanation: "Nd5! The knight jumps to d5, attacking the king at e7 AND the queen at c7 simultaneously — a fork! The king must move out of check, then white captures the queen for free.",
  },
  {
    id: 'm2',
    title: 'Queen Charges In',
    description: "The enemy king is buried behind its own pieces. Sacrifice the queen to finish!",
    difficulty: 'medium',
    turn: 'white',
    pieces: [
      { type: 'K', color: 'black', row: 0, col: 6 }, // Kg8
      { type: 'P', color: 'black', row: 1, col: 6 }, // Pg7
      { type: 'P', color: 'black', row: 1, col: 5 }, // Pf7
      { type: 'R', color: 'black', row: 0, col: 7 }, // Rh8
      { type: 'Q', color: 'white', row: 2, col: 7 }, // Qh6
      { type: 'R', color: 'white', row: 7, col: 6 }, // Rg1
      { type: 'K', color: 'white', row: 7, col: 4 }, // Ke1
    ],
    correctMove: { fromRow: 2, fromCol: 7, toRow: 1, toCol: 6 }, // Qxg7#
    hint: "The rook on g1 controls the g-file. What if the queen crashed into g7?",
    explanation: "Qxg7 is checkmate! The queen captures the pawn on g7, giving check. The king can't take back because the rook on g1 protects g7. The queen covers h7 and f8 — no escape!",
  },
  {
    id: 'm3',
    title: 'Box It In',
    description: "The black king is hemmed in by its own knight and pawn. Strike down the middle!",
    difficulty: 'medium',
    turn: 'white',
    pieces: [
      { type: 'K', color: 'black', row: 0, col: 3 }, // Kd8
      { type: 'N', color: 'black', row: 0, col: 2 }, // Nc8
      { type: 'P', color: 'black', row: 1, col: 1 }, // Pb7
      { type: 'Q', color: 'white', row: 7, col: 3 }, // Qd1
      { type: 'K', color: 'white', row: 7, col: 4 }, // Ke1
    ],
    correctMove: { fromRow: 7, fromCol: 3, toRow: 1, toCol: 3 }, // Qd7#
    hint: "The queen can slide all the way up the d-file. What happens when it reaches d7?",
    explanation: "Qd7 is checkmate! The queen gives check from d7. The knight at c8 and own pawn at b7 block the king's escape to the left. The queen covers c7, d8, and e8 — the king is completely boxed in!",
  },

  // ── HARD ──────────────────────────────────────────────────────────────────
  {
    id: 'h1',
    title: "Anastasia's Mate",
    description: "Knight and rook work together in a classic mating pattern. Find the rook move!",
    difficulty: 'hard',
    turn: 'white',
    pieces: [
      { type: 'K', color: 'black', row: 0, col: 7 }, // Kh8
      { type: 'P', color: 'black', row: 1, col: 6 }, // Pg7
      { type: 'N', color: 'white', row: 2, col: 5 }, // Nf6
      { type: 'R', color: 'white', row: 7, col: 0 }, // Ra1
      { type: 'K', color: 'white', row: 7, col: 4 }, // Ke1
    ],
    correctMove: { fromRow: 7, fromCol: 0, toRow: 7, toCol: 7 }, // Rh1#
    hint: "The knight already covers g8 and h7. What does the rook threaten on the h-file?",
    explanation: "Rh1 is checkmate — Anastasia's Mate! The rook gives check along the h-file. The knight at f6 covers g8 and h7. The black pawn on g7 blocks that escape too. The king is completely trapped!",
  },
  {
    id: 'h2',
    title: 'Smothered Mate',
    description: "The king is suffocated by its OWN pieces. A knight leap delivers the killing blow!",
    difficulty: 'hard',
    turn: 'white',
    pieces: [
      { type: 'K', color: 'black', row: 0, col: 7 }, // Kh8
      { type: 'R', color: 'black', row: 0, col: 6 }, // Rg8
      { type: 'R', color: 'black', row: 1, col: 7 }, // Rh7
      { type: 'P', color: 'black', row: 1, col: 6 }, // Pg7
      { type: 'N', color: 'white', row: 3, col: 6 }, // Ng5
      { type: 'K', color: 'white', row: 7, col: 4 }, // Ke1
    ],
    correctMove: { fromRow: 3, fromCol: 6, toRow: 1, toCol: 5 }, // Nf7#
    hint: "The king's own rooks and pawn leave it no room. Where can the knight land to deliver checkmate?",
    explanation: "Nf7 is checkmate — the Smothered Mate! The knight jumps to f7, attacking the king at h8. The king can't escape to g8 (own rook), h7 (own rook), or g7 (own pawn). The king is smothered by its own army!",
  },
  {
    id: 'h3',
    title: 'The Long Diagonal',
    description: "A queen sacrifice on the long diagonal — can you see it? The bishop is key!",
    difficulty: 'hard',
    turn: 'white',
    pieces: [
      { type: 'K', color: 'black', row: 0, col: 6 }, // Kg8
      { type: 'R', color: 'black', row: 0, col: 4 }, // Re8
      { type: 'P', color: 'black', row: 1, col: 0 }, // Pa7
      { type: 'Q', color: 'white', row: 7, col: 0 }, // Qa1
      { type: 'B', color: 'white', row: 3, col: 3 }, // Bd5
      { type: 'K', color: 'white', row: 7, col: 4 }, // Ke1
    ],
    correctMove: { fromRow: 7, fromCol: 0, toRow: 0, toCol: 7 }, // Qh8#
    hint: "The queen can travel the full diagonal to h8. The bishop secretly covers f7!",
    explanation: "Qh8 is checkmate! The queen shoots across the entire diagonal to h8, giving check. The king can't escape to f8 or g7 (queen controls those), h7 (queen covers the h-file), or f7 — the bishop on d5 guards that square. The black rook on e8 is blocked by the king at g8 and can't capture.",
  },
];

// ─── Tier config ─────────────────────────────────────────────────────────────

const TIERS: { id: Difficulty; label: string; emoji: string; color: string; border: string; badge: string; badgeText: string; }[] = [
  { id: 'easy',   label: 'Easy',   emoji: '🟢', color: 'from-emerald-400 to-green-500',   border: 'border-emerald-200 dark:border-emerald-800/40', badge: 'bg-emerald-100 dark:bg-emerald-900/40', badgeText: 'text-emerald-700 dark:text-emerald-300' },
  { id: 'medium', label: 'Medium', emoji: '🟡', color: 'from-amber-400 to-yellow-500',    border: 'border-amber-200 dark:border-amber-800/40',   badge: 'bg-amber-100 dark:bg-amber-900/40',   badgeText: 'text-amber-700 dark:text-amber-300' },
  { id: 'hard',   label: 'Hard',   emoji: '🔴', color: 'from-red-400 to-rose-500',        border: 'border-red-200 dark:border-red-800/40',       badge: 'bg-red-100 dark:bg-red-900/40',       badgeText: 'text-red-700 dark:text-red-300' },
];

// ─── Puzzle Board ─────────────────────────────────────────────────────────────

const SQ = 44;
const FILES = ['a','b','c','d','e','f','g','h'];
const RANKS = ['8','7','6','5','4','3','2','1'];

type PuzzleStatus = 'idle' | 'correct' | 'wrong' | 'hint';

function PuzzleBoard({ puzzle, onSolve }: { puzzle: Puzzle; onSolve: () => void }) {
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [status, setStatus] = useState<PuzzleStatus>('idle');
  const [showHint, setShowHint] = useState(false);
  const [wrongMove, setWrongMove] = useState<{ row: number; col: number } | null>(null);

  const grid = useMemo(() => buildGrid(puzzle.pieces), [puzzle]);

  const validMoves = useMemo(
    () => selected ? getValidMoves(grid, { row: selected.row, col: selected.col }) : [],
    [grid, selected]
  );
  const validSet = useMemo(
    () => new Set(validMoves.map(m => `${m.row}-${m.col}`)),
    [validMoves]
  );

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (status === 'correct') return;

    const piece = grid[row][col];

    // Click valid move destination
    if (selected && validSet.has(`${row}-${col}`)) {
      const { correctMove: cm } = puzzle;
      const isCorrect = selected.row === cm.fromRow && selected.col === cm.fromCol && row === cm.toRow && col === cm.toCol;
      if (isCorrect) {
        setStatus('correct');
        onSolve();
      } else {
        setStatus('wrong');
        setWrongMove({ row, col });
        setTimeout(() => { setStatus('idle'); setWrongMove(null); setSelected(null); }, 1200);
      }
      return;
    }

    // Select own piece
    if (piece && piece.color === puzzle.turn) {
      setSelected({ row, col });
      setStatus('idle');
      return;
    }

    setSelected(null);
  }, [status, grid, selected, validSet, puzzle, onSolve]);

  const reset = useCallback(() => {
    setSelected(null);
    setStatus('idle');
    setShowHint(false);
    setWrongMove(null);
  }, []);

  const boardPx = SQ * 8;
  const { correctMove: cm } = puzzle;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Board */}
      <div className="relative" style={{ width: boardPx + 20, height: boardPx + 20 }}>
        {/* Rank labels */}
        {RANKS.map((r, i) => (
          <span key={r} className="absolute text-center font-bold leading-none" style={{ fontSize: 10, color: '#8B6534', left: 2, top: i * SQ + SQ / 2 - 5, width: 16 }}>{r}</span>
        ))}
        {/* File labels */}
        {FILES.map((f, i) => (
          <span key={f} className="absolute text-center font-bold leading-none" style={{ fontSize: 10, color: '#8B6534', top: boardPx + 8, left: 20 + i * SQ + SQ / 2 - 4 }}>{f}</span>
        ))}
        {/* Squares */}
        <div style={{ position: 'absolute', top: 0, left: 20, width: boardPx, height: boardPx, border: '2px solid #8B6534', borderRadius: 2, overflow: 'hidden', boxShadow: '0 6px 24px rgba(0,0,0,0.35)' }}>
          {Array.from({ length: 64 }, (_, i) => {
            const row = Math.floor(i / 8), col = i % 8;
            const isLight = (row + col) % 2 === 0;
            const isSelected = selected?.row === row && selected?.col === col;
            const isValidMove = validSet.has(`${row}-${col}`);
            const isWrong = wrongMove?.row === row && wrongMove?.col === col;
            const isCorrectDest = status === 'correct' && row === cm.toRow && col === cm.toCol;
            const isCorrectFrom = status === 'correct' && row === cm.fromRow && col === cm.fromCol;
            const isHinted = showHint && (
              (row === cm.fromRow && col === cm.fromCol) ||
              (row === cm.toRow && col === cm.toCol)
            );

            let squareColor = isLight ? '#F0D9B5' : '#B58863';
            if (isSelected) squareColor = 'rgba(59,130,246,0.85)';
            else if (isCorrectDest || isCorrectFrom) squareColor = 'rgba(34,197,94,0.8)';
            else if (isWrong) squareColor = 'rgba(220,38,38,0.75)';
            else if (isHinted) squareColor = 'rgba(251,191,36,0.75)';
            else if (isLight) squareColor = '#F0D9B5';
            else squareColor = '#B58863';

            const piece = grid[row][col];

            return (
              <div
                key={i}
                onClick={() => handleSquareClick(row, col)}
                style={{ position: 'absolute', top: row * SQ, left: col * SQ, width: SQ, height: SQ, backgroundColor: squareColor, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}
              >
                {/* Valid move dot */}
                {isValidMove && !piece && (
                  <div style={{ width: SQ * 0.28, height: SQ * 0.28, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.2)' }} />
                )}
                {isValidMove && piece && (
                  <div style={{ position: 'absolute', inset: 0, border: '3px solid rgba(0,0,0,0.35)', borderRadius: 2 }} />
                )}
                {/* Piece */}
                {piece && (
                  <motion.span
                    whileHover={status !== 'correct' ? { scale: 1.12 } : {}}
                    style={{
                      fontSize: SQ * 0.72, lineHeight: 1, zIndex: 10,
                      filter: piece.color === 'white'
                        ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.95)) drop-shadow(0 0 2px rgba(0,0,0,0.7))'
                        : 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
                    }}
                  >
                    {getPieceSymbol(piece.type, piece.color)}
                  </motion.span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status message */}
      <AnimatePresence mode="wait">
        {status === 'correct' && (
          <motion.div key="correct" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm rounded-xl bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-300 dark:border-emerald-700 px-4 py-3 text-center">
            <p className="font-bold text-emerald-700 dark:text-emerald-300 text-sm mb-1">Correct! 🎉</p>
            <p className="text-emerald-600 dark:text-emerald-400 text-xs leading-relaxed">{puzzle.explanation}</p>
          </motion.div>
        )}
        {status === 'wrong' && (
          <motion.div key="wrong" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm rounded-xl bg-red-100 dark:bg-red-900/40 border-2 border-red-300 dark:border-red-700 px-4 py-3 text-center">
            <p className="font-bold text-red-700 dark:text-red-300 text-sm">Not quite — try again!</p>
          </motion.div>
        )}
        {status === 'idle' && showHint && (
          <motion.div key="hint" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm rounded-xl bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-300 dark:border-amber-700 px-4 py-3 text-center">
            <p className="text-amber-700 dark:text-amber-300 text-sm">💡 {puzzle.hint}</p>
          </motion.div>
        )}
        {status === 'idle' && !showHint && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-text-muted text-sm">
            {selected ? 'Click a highlighted square to move' : 'Click a white piece to select it'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      {status !== 'correct' && (
        <div className="flex gap-2">
          <button onClick={reset} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-background-secondary text-text-secondary hover:text-text-primary border border-border transition-colors">
            ↺ Reset
          </button>
          <button onClick={() => setShowHint(h => !h)} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors">
            {showHint ? 'Hide hint' : '💡 Hint'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Puzzle Card ──────────────────────────────────────────────────────────────

function PuzzleCard({ puzzle, tier, solved, onSolve, isOpen, onToggle }: {
  puzzle: Puzzle; tier: typeof TIERS[number]; solved: boolean; onSolve: () => void; isOpen: boolean; onToggle: () => void;
}) {
  return (
    <div className={`rounded-2xl border-2 ${tier.border} overflow-hidden ${solved ? 'opacity-80' : ''}`}>
      <button className="w-full text-left px-5 py-4 flex items-center gap-4 focus:outline-none" onClick={onToggle}>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-sm`}>
          {solved ? '✓' : tier.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-extrabold text-text-primary">{puzzle.title}</span>
            {solved && <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Solved!</span>}
          </div>
          <p className="text-sm text-text-secondary leading-snug">{puzzle.description}</p>
        </div>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-text-muted text-lg shrink-0">▾</motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div key="board" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }} className="overflow-hidden">
            <div className="px-4 pb-6 pt-2 border-t border-black/5 dark:border-white/5 flex justify-center">
              <PuzzleBoard puzzle={puzzle} onSolve={onSolve} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PuzzlesPage() {
  const [activeTier, setActiveTier] = useState<Difficulty>('easy');
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);

  const handleSolve = useCallback((id: string) => {
    setSolvedIds(prev => new Set([...prev, id]));
  }, []);

  const tieredPuzzles = useMemo(() => PUZZLES.filter(p => p.difficulty === activeTier), [activeTier]);
  const tier = TIERS.find(t => t.id === activeTier)!;

  const totalSolved = solvedIds.size;
  const progressPct = Math.round((totalSolved / PUZZLES.length) * 100);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-12 px-4 sm:px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['♜','♞','♛','♚','♟','♝'].map((p, i) => (
            <motion.span key={i} className="absolute text-5xl opacity-5 select-none"
              style={{ left: `${i * 17 + 3}%`, top: `${(i % 3) * 30 + 5}%` }}
              animate={{ y: [0, -16, 0] }} transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.7 }}
            >{p}</motion.span>
          ))}
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-5xl mb-4">🧩</motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold text-text-primary mb-3 tracking-tight"
          >
            Chess{' '}
            <span className="bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">Puzzles</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-text-secondary text-lg">
            Find the best move in each position. Click a piece, then click where to move it!
          </motion.p>
        </div>
      </section>

      {/* Progress bar */}
      <section className="px-4 sm:px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-background-secondary border-2 border-amber-200 dark:border-amber-800/40 rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-text-primary">Puzzles solved</span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{totalSolved} / {PUZZLES.length}</span>
            </div>
            <div className="h-3 rounded-full bg-amber-100 dark:bg-amber-900/30 overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
                animate={{ width: `${progressPct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
            {totalSolved === PUZZLES.length && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-2 text-center">
                All puzzles solved! You're a chess master!
              </motion.p>
            )}
          </div>
        </div>
      </section>

      {/* Tier tabs */}
      <section className="px-4 sm:px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-2">
            {TIERS.map(t => {
              const count = PUZZLES.filter(p => p.difficulty === t.id).length;
              const solvedCount = PUZZLES.filter(p => p.difficulty === t.id && solvedIds.has(p.id)).length;
              const isActive = activeTier === t.id;
              return (
                <motion.button key={t.id} onClick={() => { setActiveTier(t.id); setOpenId(null); }} whileTap={{ scale: 0.96 }}
                  className={`rounded-2xl border-2 py-3 px-2 text-center transition-all ${isActive ? `bg-gradient-to-br ${t.color} border-transparent text-white shadow-md` : `${t.badge} ${t.border} ${t.badgeText} hover:opacity-80`}`}
                >
                  <div className="text-xl mb-0.5">{t.emoji}</div>
                  <div className="font-extrabold text-sm">{t.label}</div>
                  <div className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'opacity-70'}`}>{solvedCount}/{count} solved</div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Puzzle list */}
      <section className="px-4 sm:px-6 pb-16 flex-1">
        <div className="max-w-2xl mx-auto space-y-3">
          <AnimatePresence mode="popLayout">
            {tieredPuzzles.map((puzzle, i) => (
              <motion.div key={puzzle.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}>
                <PuzzleCard
                  puzzle={puzzle}
                  tier={tier}
                  solved={solvedIds.has(puzzle.id)}
                  onSolve={() => handleSolve(puzzle.id)}
                  isOpen={openId === puzzle.id}
                  onToggle={() => setOpenId(prev => prev === puzzle.id ? null : puzzle.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 px-4 bg-gradient-to-br from-amber-500 to-yellow-400">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-4xl mb-3">♟️</div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Want to learn more?</h2>
          <p className="text-amber-100 mb-6">Study the rules and piece movements to solve harder puzzles!</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="/rules">
              <motion.button className="px-6 py-3 rounded-2xl bg-white text-amber-600 font-bold shadow-lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                Study Rules →
              </motion.button>
            </a>
            <a href="/pieces">
              <motion.button className="px-6 py-3 rounded-2xl bg-amber-600 text-white font-bold shadow-lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                Learn Pieces →
              </motion.button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
