'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { getPieceSymbol } from '@/lib/chess/pieces';
import type { PieceType } from '@/types/chess';

// ─── Demo board types ────────────────────────────────────────────────────────

interface DemoPiece { id: string; type: PieceType; color: 'white' | 'black'; }
interface FramePieceState { pieceId: string; row: number; col: number; }
interface DemoHighlight { row: number; col: number; color: string; }
interface DemoFrame { pieceStates: FramePieceState[]; highlights: DemoHighlight[]; caption: string; badge?: string; }
interface Demo { pieces: DemoPiece[]; frames: DemoFrame[]; }

// ─── Demo data ───────────────────────────────────────────────────────────────
// Board orientation: row 0 = rank 8 (black's back rank), row 7 = rank 1 (white's back rank)
// col 0 = a-file, col 7 = h-file

const DEMOS: Record<string, Demo> = {

  check: {
    pieces: [
      { id: 'wR', type: 'R', color: 'white' },
      { id: 'wK', type: 'K', color: 'white' },
      { id: 'bK', type: 'K', color: 'black' },
    ],
    frames: [
      {
        pieceStates: [{ pieceId: 'wR', row: 7, col: 4 }, { pieceId: 'wK', row: 7, col: 0 }, { pieceId: 'bK', row: 0, col: 4 }],
        highlights: [{ row: 7, col: 4, color: 'rgba(59,130,246,0.55)' }],
        caption: 'White plays rook to e7...',
      },
      {
        pieceStates: [{ pieceId: 'wR', row: 1, col: 4 }, { pieceId: 'wK', row: 7, col: 0 }, { pieceId: 'bK', row: 0, col: 4 }],
        highlights: [
          { row: 1, col: 4, color: 'rgba(59,130,246,0.55)' },
          { row: 0, col: 4, color: 'rgba(220,38,38,0.75)' },
          { row: 2, col: 4, color: 'rgba(220,38,38,0.1)' },
          { row: 3, col: 4, color: 'rgba(220,38,38,0.1)' },
          { row: 4, col: 4, color: 'rgba(220,38,38,0.1)' },
          { row: 5, col: 4, color: 'rgba(220,38,38,0.1)' },
          { row: 6, col: 4, color: 'rgba(220,38,38,0.1)' },
        ],
        caption: 'Check! The rook attacks the king along the e-file!',
        badge: 'CHECK',
      },
    ],
  },

  checkmate: {
    // Position: black king h8, black pawn h7 (blocks escape), white queen g6, white rook delivers on a8
    pieces: [
      { id: 'bK', type: 'K', color: 'black' },
      { id: 'bPh7', type: 'P', color: 'black' },
      { id: 'wQ', type: 'Q', color: 'white' },
      { id: 'wR', type: 'R', color: 'white' },
    ],
    frames: [
      {
        pieceStates: [{ pieceId: 'bK', row: 0, col: 7 }, { pieceId: 'bPh7', row: 1, col: 7 }, { pieceId: 'wQ', row: 2, col: 6 }, { pieceId: 'wR', row: 7, col: 0 }],
        highlights: [{ row: 7, col: 0, color: 'rgba(59,130,246,0.55)' }],
        caption: 'White rook slides to a8...',
      },
      {
        pieceStates: [{ pieceId: 'bK', row: 0, col: 7 }, { pieceId: 'bPh7', row: 1, col: 7 }, { pieceId: 'wQ', row: 2, col: 6 }, { pieceId: 'wR', row: 0, col: 0 }],
        highlights: [
          { row: 0, col: 0, color: 'rgba(59,130,246,0.55)' },
          { row: 0, col: 7, color: 'rgba(220,38,38,0.8)' },
          { row: 0, col: 6, color: 'rgba(251,146,60,0.55)' },   // g8 covered by queen
          { row: 1, col: 6, color: 'rgba(251,146,60,0.55)' },   // g7 covered by queen
          { row: 1, col: 7, color: 'rgba(100,116,139,0.45)' },  // h7 blocked by own pawn
        ],
        caption: 'Checkmate! King has nowhere to run — every escape is covered!',
        badge: 'CHECKMATE',
      },
    ],
  },

  castling: {
    pieces: [
      { id: 'wK', type: 'K', color: 'white' },
      { id: 'wR', type: 'R', color: 'white' },
    ],
    frames: [
      {
        pieceStates: [{ pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wR', row: 7, col: 7 }],
        highlights: [
          { row: 7, col: 4, color: 'rgba(59,130,246,0.5)' },
          { row: 7, col: 7, color: 'rgba(59,130,246,0.5)' },
          { row: 7, col: 5, color: 'rgba(59,130,246,0.12)' },
          { row: 7, col: 6, color: 'rgba(59,130,246,0.12)' },
        ],
        caption: 'King at e1, rook at h1 — squares between are clear...',
      },
      {
        pieceStates: [{ pieceId: 'wK', row: 7, col: 6 }, { pieceId: 'wR', row: 7, col: 5 }],
        highlights: [
          { row: 7, col: 6, color: 'rgba(34,197,94,0.6)' },
          { row: 7, col: 5, color: 'rgba(34,197,94,0.6)' },
          { row: 7, col: 4, color: 'rgba(251,191,36,0.4)' },
          { row: 7, col: 7, color: 'rgba(251,191,36,0.4)' },
        ],
        caption: 'Castled! King slides 2 squares right, rook jumps over to f1!',
      },
    ],
  },

  enpassant: {
    pieces: [
      { id: 'wP', type: 'P', color: 'white' },
      { id: 'bP', type: 'P', color: 'black' },
    ],
    frames: [
      {
        pieceStates: [{ pieceId: 'wP', row: 3, col: 4 }, { pieceId: 'bP', row: 1, col: 3 }],
        highlights: [{ row: 1, col: 3, color: 'rgba(59,130,246,0.5)' }],
        caption: 'Black pawn advances 2 squares from d7...',
      },
      {
        pieceStates: [{ pieceId: 'wP', row: 3, col: 4 }, { pieceId: 'bP', row: 3, col: 3 }],
        highlights: [
          { row: 3, col: 3, color: 'rgba(59,130,246,0.5)' },
          { row: 3, col: 4, color: 'rgba(251,191,36,0.55)' },
        ],
        caption: 'Lands right beside white\'s pawn! En passant available now!',
      },
      {
        pieceStates: [{ pieceId: 'wP', row: 2, col: 3 }], // bP captured — not in this frame
        highlights: [
          { row: 2, col: 3, color: 'rgba(34,197,94,0.6)' },
          { row: 3, col: 3, color: 'rgba(220,38,38,0.45)' },
        ],
        caption: 'White captures en passant — the black pawn is removed!',
        badge: 'EN PASSANT',
      },
    ],
  },

  promotion: {
    pieces: [
      { id: 'wPawn', type: 'P', color: 'white' },
      { id: 'wQueen', type: 'Q', color: 'white' },
      { id: 'bK', type: 'K', color: 'black' },
    ],
    frames: [
      {
        pieceStates: [{ pieceId: 'wPawn', row: 1, col: 4 }, { pieceId: 'bK', row: 0, col: 0 }],
        highlights: [
          { row: 1, col: 4, color: 'rgba(251,191,36,0.55)' },
          { row: 0, col: 4, color: 'rgba(34,197,94,0.3)' },
        ],
        caption: 'White pawn at e7 — one step from the other side!',
      },
      {
        pieceStates: [{ pieceId: 'wQueen', row: 0, col: 4 }, { pieceId: 'bK', row: 0, col: 0 }],
        highlights: [
          { row: 0, col: 4, color: 'rgba(251,191,36,0.65)' },
          { row: 1, col: 4, color: 'rgba(34,197,94,0.25)' },
        ],
        caption: 'Promoted to Queen! The pawn transforms into the most powerful piece!',
        badge: 'PROMOTED!',
      },
    ],
  },

  stalemate: {
    // Black king a8, White queen b6, White king c7 — classic stalemate
    pieces: [
      { id: 'bK', type: 'K', color: 'black' },
      { id: 'wQ', type: 'Q', color: 'white' },
      { id: 'wK', type: 'K', color: 'white' },
    ],
    frames: [
      {
        pieceStates: [{ pieceId: 'bK', row: 0, col: 0 }, { pieceId: 'wQ', row: 2, col: 1 }, { pieceId: 'wK', row: 1, col: 2 }],
        highlights: [
          { row: 0, col: 0, color: 'rgba(59,130,246,0.5)' },    // black king (not in check)
          { row: 1, col: 0, color: 'rgba(251,146,60,0.6)' },    // a7 — queen covers
          { row: 0, col: 1, color: 'rgba(251,146,60,0.6)' },    // b8 — white king covers
          { row: 1, col: 1, color: 'rgba(251,146,60,0.6)' },    // b7 — both cover
        ],
        caption: 'Black to move: every square around the king is covered!',
      },
      {
        pieceStates: [{ pieceId: 'bK', row: 0, col: 0 }, { pieceId: 'wQ', row: 2, col: 1 }, { pieceId: 'wK', row: 1, col: 2 }],
        highlights: [
          { row: 0, col: 0, color: 'rgba(147,51,234,0.65)' },
          { row: 1, col: 0, color: 'rgba(251,146,60,0.6)' },
          { row: 0, col: 1, color: 'rgba(251,146,60,0.6)' },
          { row: 1, col: 1, color: 'rgba(251,146,60,0.6)' },
        ],
        caption: 'Stalemate! Not in check, but can\'t move = automatic draw!',
        badge: 'STALEMATE',
      },
    ],
  },

  repetition: {
    pieces: [
      { id: 'wK', type: 'K', color: 'white' },
      { id: 'wR', type: 'R', color: 'white' },
      { id: 'bK', type: 'K', color: 'black' },
    ],
    frames: [
      {
        pieceStates: [{ pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wR', row: 4, col: 0 }, { pieceId: 'bK', row: 0, col: 4 }],
        highlights: [{ row: 4, col: 0, color: 'rgba(59,130,246,0.5)' }],
        caption: 'White gives check with the rook...',
      },
      {
        pieceStates: [{ pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wR', row: 0, col: 4 }, { pieceId: 'bK', row: 0, col: 4 }],
        highlights: [
          { row: 0, col: 4, color: 'rgba(220,38,38,0.75)' },
          { row: 0, col: 0, color: 'rgba(59,130,246,0.5)' },
        ],
        caption: 'Check! King must move...',
        badge: 'CHECK',
      },
      {
        pieceStates: [{ pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wR', row: 0, col: 4 }, { pieceId: 'bK', row: 0, col: 3 }],
        highlights: [{ row: 0, col: 3, color: 'rgba(59,130,246,0.35)' }],
        caption: 'King moves... White repeats the check...',
      },
      {
        pieceStates: [{ pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wR', row: 4, col: 0 }, { pieceId: 'bK', row: 0, col: 4 }],
        highlights: [
          { row: 0, col: 4, color: 'rgba(147,51,234,0.5)' },
          { row: 7, col: 4, color: 'rgba(147,51,234,0.5)' },
          { row: 4, col: 0, color: 'rgba(147,51,234,0.5)' },
        ],
        caption: 'Same position 3 times — either player claims a draw!',
        badge: 'DRAW',
      },
    ],
  },

  fiftymove: {
    pieces: [
      { id: 'wK', type: 'K', color: 'white' },
      { id: 'wB', type: 'B', color: 'white' },
      { id: 'bK', type: 'K', color: 'black' },
    ],
    frames: [
      {
        pieceStates: [{ pieceId: 'wK', row: 4, col: 4 }, { pieceId: 'wB', row: 6, col: 2 }, { pieceId: 'bK', row: 0, col: 0 }],
        highlights: [],
        caption: 'Both sides keep shuffling pieces — no captures, no pawn moves...',
      },
      {
        pieceStates: [{ pieceId: 'wK', row: 3, col: 3 }, { pieceId: 'wB', row: 4, col: 3 }, { pieceId: 'bK', row: 1, col: 2 }],
        highlights: [],
        caption: '25 moves done... still no progress...',
      },
      {
        pieceStates: [{ pieceId: 'wK', row: 4, col: 2 }, { pieceId: 'wB', row: 2, col: 5 }, { pieceId: 'bK', row: 0, col: 4 }],
        highlights: [
          { row: 4, col: 2, color: 'rgba(147,51,234,0.35)' },
          { row: 2, col: 5, color: 'rgba(147,51,234,0.35)' },
          { row: 0, col: 4, color: 'rgba(147,51,234,0.35)' },
        ],
        caption: '50 moves with no captures or pawn moves — claim a draw!',
        badge: 'DRAW',
      },
    ],
  },

  insufficient: {
    pieces: [
      { id: 'wK', type: 'K', color: 'white' },
      { id: 'wB', type: 'B', color: 'white' },
      { id: 'bK', type: 'K', color: 'black' },
    ],
    frames: [
      {
        pieceStates: [{ pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wB', row: 5, col: 2 }, { pieceId: 'bK', row: 0, col: 4 }],
        highlights: [
          { row: 7, col: 4, color: 'rgba(147,51,234,0.35)' },
          { row: 5, col: 2, color: 'rgba(147,51,234,0.35)' },
          { row: 0, col: 4, color: 'rgba(147,51,234,0.35)' },
        ],
        caption: 'King + Bishop vs King — impossible to force checkmate!',
        badge: 'AUTO DRAW',
      },
    ],
  },

  // ── Opening Demos ──────────────────────────────────────────────────────────
  italian: {
    pieces: [
      { id: 'wK', type: 'K', color: 'white' }, { id: 'wPe', type: 'P', color: 'white' },
      { id: 'wN', type: 'N', color: 'white' }, { id: 'wB', type: 'B', color: 'white' },
      { id: 'bPe', type: 'P', color: 'black' }, { id: 'bN', type: 'N', color: 'black' },
      { id: 'bK', type: 'K', color: 'black' },
    ],
    frames: [
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wPe', row: 4, col: 4 },
          { pieceId: 'wN', row: 5, col: 5 }, { pieceId: 'wB', row: 4, col: 2 },
          { pieceId: 'bPe', row: 3, col: 4 }, { pieceId: 'bN', row: 2, col: 2 },
          { pieceId: 'bK', row: 0, col: 4 },
        ],
        highlights: [
          { row: 4, col: 4, color: 'rgba(59,130,246,0.4)' },
          { row: 5, col: 5, color: 'rgba(59,130,246,0.4)' },
          { row: 4, col: 2, color: 'rgba(251,191,36,0.7)' },
        ],
        caption: '1.e4 e5 2.Nf3 Nc6 3.Bc4 — control center, develop pieces',
      },
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wPe', row: 4, col: 4 },
          { pieceId: 'wN', row: 5, col: 5 }, { pieceId: 'wB', row: 4, col: 2 },
          { pieceId: 'bPe', row: 3, col: 4 }, { pieceId: 'bN', row: 2, col: 2 },
          { pieceId: 'bK', row: 0, col: 4 },
        ],
        highlights: [
          { row: 4, col: 2, color: 'rgba(251,191,36,0.8)' },
          { row: 3, col: 3, color: 'rgba(251,191,36,0.2)' },
          { row: 2, col: 4, color: 'rgba(251,191,36,0.2)' },
          { row: 1, col: 5, color: 'rgba(220,38,38,0.6)' },
        ],
        caption: 'White\'s bishop eyes the vulnerable f7 pawn!',
        badge: 'ITALIAN',
      },
    ],
  },

  ruylopez: {
    pieces: [
      { id: 'wK', type: 'K', color: 'white' }, { id: 'wPe', type: 'P', color: 'white' },
      { id: 'wN', type: 'N', color: 'white' }, { id: 'wB', type: 'B', color: 'white' },
      { id: 'bPe', type: 'P', color: 'black' }, { id: 'bN', type: 'N', color: 'black' },
      { id: 'bK', type: 'K', color: 'black' },
    ],
    frames: [
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wPe', row: 4, col: 4 },
          { pieceId: 'wN', row: 5, col: 5 }, { pieceId: 'wB', row: 1, col: 1 },
          { pieceId: 'bPe', row: 3, col: 4 }, { pieceId: 'bN', row: 2, col: 2 },
          { pieceId: 'bK', row: 0, col: 4 },
        ],
        highlights: [
          { row: 1, col: 1, color: 'rgba(251,191,36,0.7)' },
          { row: 2, col: 2, color: 'rgba(220,38,38,0.4)' },
        ],
        caption: '1.e4 e5 2.Nf3 Nc6 3.Bb5 — the Spanish Opening',
      },
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wPe', row: 4, col: 4 },
          { pieceId: 'wN', row: 5, col: 5 }, { pieceId: 'wB', row: 1, col: 1 },
          { pieceId: 'bPe', row: 3, col: 4 }, { pieceId: 'bN', row: 2, col: 2 },
          { pieceId: 'bK', row: 0, col: 4 },
        ],
        highlights: [
          { row: 1, col: 1, color: 'rgba(251,191,36,0.8)' },
          { row: 2, col: 2, color: 'rgba(220,38,38,0.6)' },
          { row: 3, col: 4, color: 'rgba(220,38,38,0.25)' },
        ],
        caption: 'Bishop indirectly pressures the pawn on e5 by attacking its defender!',
        badge: 'RUY LÓPEZ',
      },
    ],
  },

  sicilian: {
    pieces: [
      { id: 'wK', type: 'K', color: 'white' }, { id: 'wPe', type: 'P', color: 'white' },
      { id: 'wPd', type: 'P', color: 'white' }, { id: 'wN', type: 'N', color: 'white' },
      { id: 'bPc', type: 'P', color: 'black' }, { id: 'bPd', type: 'P', color: 'black' },
      { id: 'bN', type: 'N', color: 'black' }, { id: 'bK', type: 'K', color: 'black' },
    ],
    frames: [
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wPe', row: 4, col: 4 },
          { pieceId: 'wPd', row: 6, col: 3 }, { pieceId: 'wN', row: 5, col: 5 },
          { pieceId: 'bPc', row: 3, col: 2 }, { pieceId: 'bPd', row: 2, col: 3 },
          { pieceId: 'bN', row: 2, col: 5 }, { pieceId: 'bK', row: 0, col: 4 },
        ],
        highlights: [
          { row: 3, col: 2, color: 'rgba(59,130,246,0.6)' },
          { row: 4, col: 3, color: 'rgba(59,130,246,0.2)' },
        ],
        caption: '1.e4 c5 — Black fights for d4 from the flank, not the center',
      },
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wPe', row: 4, col: 4 },
          { pieceId: 'wPd', row: 3, col: 3 }, { pieceId: 'wN', row: 3, col: 3 },
          { pieceId: 'bPc', row: 3, col: 2 }, { pieceId: 'bPd', row: 2, col: 3 },
          { pieceId: 'bN', row: 2, col: 5 }, { pieceId: 'bK', row: 0, col: 4 },
        ],
        highlights: [
          { row: 3, col: 2, color: 'rgba(59,130,246,0.5)' },
          { row: 4, col: 3, color: 'rgba(251,146,60,0.5)' },
          { row: 4, col: 4, color: 'rgba(251,146,60,0.5)' },
        ],
        caption: 'Most popular opening at all levels — creates rich, unbalanced positions!',
        badge: 'SICILIAN',
      },
    ],
  },

  french: {
    pieces: [
      { id: 'wK', type: 'K', color: 'white' }, { id: 'wPe', type: 'P', color: 'white' },
      { id: 'wPd', type: 'P', color: 'white' }, { id: 'bPe', type: 'P', color: 'black' },
      { id: 'bPd', type: 'P', color: 'black' }, { id: 'bK', type: 'K', color: 'black' },
    ],
    frames: [
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wPe', row: 4, col: 4 },
          { pieceId: 'wPd', row: 4, col: 3 }, { pieceId: 'bPe', row: 2, col: 4 },
          { pieceId: 'bPd', row: 3, col: 3 }, { pieceId: 'bK', row: 0, col: 4 },
        ],
        highlights: [
          { row: 2, col: 4, color: 'rgba(59,130,246,0.5)' },
          { row: 3, col: 3, color: 'rgba(59,130,246,0.5)' },
        ],
        caption: '1.e4 e6 2.d4 d5 — Black builds a solid pawn chain',
      },
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wPe', row: 3, col: 4 },
          { pieceId: 'wPd', row: 4, col: 3 }, { pieceId: 'bPe', row: 2, col: 4 },
          { pieceId: 'bPd', row: 3, col: 3 }, { pieceId: 'bK', row: 0, col: 4 },
        ],
        highlights: [
          { row: 3, col: 4, color: 'rgba(251,146,60,0.6)' },
          { row: 3, col: 3, color: 'rgba(220,38,38,0.4)' },
          { row: 2, col: 4, color: 'rgba(220,38,38,0.25)' },
        ],
        caption: 'White pushes to e5 — space advantage but Black is solid behind the chain!',
        badge: 'FRENCH',
      },
    ],
  },

  queensgambit: {
    pieces: [
      { id: 'wK', type: 'K', color: 'white' }, { id: 'wPd', type: 'P', color: 'white' },
      { id: 'wPc', type: 'P', color: 'white' }, { id: 'wN', type: 'N', color: 'white' },
      { id: 'bPd', type: 'P', color: 'black' }, { id: 'bN', type: 'N', color: 'black' },
      { id: 'bK', type: 'K', color: 'black' },
    ],
    frames: [
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wPd', row: 4, col: 3 },
          { pieceId: 'wPc', row: 4, col: 2 }, { pieceId: 'wN', row: 5, col: 5 },
          { pieceId: 'bPd', row: 3, col: 3 }, { pieceId: 'bN', row: 2, col: 5 },
          { pieceId: 'bK', row: 0, col: 4 },
        ],
        highlights: [
          { row: 4, col: 2, color: 'rgba(251,191,36,0.7)' },
          { row: 3, col: 3, color: 'rgba(59,130,246,0.4)' },
        ],
        caption: '1.d4 d5 2.c4 — White offers the c-pawn to control the center',
      },
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wPd', row: 4, col: 3 },
          { pieceId: 'wPc', row: 4, col: 2 }, { pieceId: 'wN', row: 5, col: 5 },
          { pieceId: 'bPd', row: 4, col: 2 }, { pieceId: 'bN', row: 2, col: 5 },
          { pieceId: 'bK', row: 0, col: 4 },
        ],
        highlights: [
          { row: 4, col: 2, color: 'rgba(34,197,94,0.6)' },
          { row: 4, col: 3, color: 'rgba(251,146,60,0.5)' },
          { row: 3, col: 3, color: 'rgba(251,146,60,0.2)' },
        ],
        caption: 'Accepted (QGA) or Declined — both lead to exciting games!',
        badge: "QUEEN'S GAMBIT",
      },
    ],
  },

  london: {
    pieces: [
      { id: 'wK', type: 'K', color: 'white' }, { id: 'wPd', type: 'P', color: 'white' },
      { id: 'wN', type: 'N', color: 'white' }, { id: 'wB', type: 'B', color: 'white' },
      { id: 'bPd', type: 'P', color: 'black' }, { id: 'bN', type: 'N', color: 'black' },
      { id: 'bK', type: 'K', color: 'black' },
    ],
    frames: [
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wPd', row: 4, col: 3 },
          { pieceId: 'wN', row: 5, col: 5 }, { pieceId: 'wB', row: 4, col: 5 },
          { pieceId: 'bPd', row: 3, col: 3 }, { pieceId: 'bN', row: 2, col: 5 },
          { pieceId: 'bK', row: 0, col: 4 },
        ],
        highlights: [
          { row: 4, col: 5, color: 'rgba(59,130,246,0.6)' },
          { row: 4, col: 3, color: 'rgba(59,130,246,0.3)' },
        ],
        caption: '1.d4 Nf6 2.Nf3 d5 3.Bf4 — solid and reliable for White',
      },
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wPd', row: 4, col: 3 },
          { pieceId: 'wN', row: 5, col: 5 }, { pieceId: 'wB', row: 4, col: 5 },
          { pieceId: 'bPd', row: 3, col: 3 }, { pieceId: 'bN', row: 2, col: 5 },
          { pieceId: 'bK', row: 0, col: 4 },
        ],
        highlights: [
          { row: 4, col: 5, color: 'rgba(251,191,36,0.7)' },
          { row: 3, col: 6, color: 'rgba(251,191,36,0.3)' },
          { row: 2, col: 7, color: 'rgba(251,191,36,0.3)' },
          { row: 5, col: 4, color: 'rgba(251,191,36,0.3)' },
          { row: 6, col: 3, color: 'rgba(251,191,36,0.3)' },
        ],
        caption: 'Bishop actively develops outside pawns — harder to trade off!',
        badge: 'LONDON',
      },
    ],
  },

  carokann: {
    pieces: [
      { id: 'wK', type: 'K', color: 'white' }, { id: 'wPe', type: 'P', color: 'white' },
      { id: 'wPd', type: 'P', color: 'white' }, { id: 'bPc', type: 'P', color: 'black' },
      { id: 'bPd', type: 'P', color: 'black' }, { id: 'bK', type: 'K', color: 'black' },
    ],
    frames: [
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wPe', row: 4, col: 4 },
          { pieceId: 'wPd', row: 4, col: 3 }, { pieceId: 'bPc', row: 2, col: 2 },
          { pieceId: 'bPd', row: 3, col: 3 }, { pieceId: 'bK', row: 0, col: 4 },
        ],
        highlights: [
          { row: 2, col: 2, color: 'rgba(59,130,246,0.5)' },
          { row: 3, col: 3, color: 'rgba(59,130,246,0.5)' },
        ],
        caption: '1.e4 c6 2.d4 d5 — Black prepares d5 solidly with c6 support',
      },
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wPe', row: 4, col: 4 },
          { pieceId: 'wPd', row: 4, col: 3 }, { pieceId: 'bPc', row: 2, col: 2 },
          { pieceId: 'bPd', row: 3, col: 3 }, { pieceId: 'bK', row: 0, col: 4 },
        ],
        highlights: [
          { row: 3, col: 3, color: 'rgba(34,197,94,0.5)' },
          { row: 2, col: 2, color: 'rgba(34,197,94,0.4)' },
          { row: 4, col: 3, color: 'rgba(220,38,38,0.25)' },
          { row: 4, col: 4, color: 'rgba(220,38,38,0.25)' },
        ],
        caption: 'More solid than the French — Black\'s light-squared bishop stays active!',
        badge: 'CARO-KANN',
      },
    ],
  },

  kingsindian: {
    pieces: [
      { id: 'wK', type: 'K', color: 'white' }, { id: 'wPd', type: 'P', color: 'white' },
      { id: 'wPc', type: 'P', color: 'white' }, { id: 'wN', type: 'N', color: 'white' },
      { id: 'bN', type: 'N', color: 'black' }, { id: 'bPg', type: 'P', color: 'black' },
      { id: 'bB', type: 'B', color: 'black' }, { id: 'bK', type: 'K', color: 'black' },
    ],
    frames: [
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wPd', row: 4, col: 3 },
          { pieceId: 'wPc', row: 4, col: 2 }, { pieceId: 'wN', row: 5, col: 2 },
          { pieceId: 'bN', row: 2, col: 5 }, { pieceId: 'bPg', row: 2, col: 6 },
          { pieceId: 'bB', row: 1, col: 6 }, { pieceId: 'bK', row: 1, col: 7 },
        ],
        highlights: [
          { row: 1, col: 6, color: 'rgba(59,130,246,0.6)' },
          { row: 2, col: 6, color: 'rgba(59,130,246,0.3)' },
        ],
        caption: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 — Black fianchettoes the kingside bishop',
      },
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wPd', row: 4, col: 3 },
          { pieceId: 'wPc', row: 4, col: 2 }, { pieceId: 'wN', row: 5, col: 2 },
          { pieceId: 'bN', row: 2, col: 5 }, { pieceId: 'bPg', row: 2, col: 6 },
          { pieceId: 'bB', row: 1, col: 6 }, { pieceId: 'bK', row: 1, col: 7 },
        ],
        highlights: [
          { row: 1, col: 6, color: 'rgba(251,191,36,0.7)' },
          { row: 2, col: 5, color: 'rgba(251,191,36,0.25)' },
          { row: 3, col: 4, color: 'rgba(251,191,36,0.25)' },
          { row: 4, col: 3, color: 'rgba(220,38,38,0.35)' },
          { row: 5, col: 2, color: 'rgba(220,38,38,0.35)' },
        ],
        caption: 'The bishop bites the center from g7 — Black counterattacks later!',
        badge: "KING'S INDIAN",
      },
    ],
  },

  // ── Phase Concept Demos ────────────────────────────────────────────────────
  opening_phase: {
    pieces: [
      { id: 'wK', type: 'K', color: 'white' }, { id: 'wPe', type: 'P', color: 'white' },
      { id: 'wPd', type: 'P', color: 'white' }, { id: 'wNg', type: 'N', color: 'white' },
      { id: 'wNb', type: 'N', color: 'white' }, { id: 'wBf', type: 'B', color: 'white' },
      { id: 'bK', type: 'K', color: 'black' }, { id: 'bPe', type: 'P', color: 'black' },
      { id: 'bN', type: 'N', color: 'black' },
    ],
    frames: [
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 4 }, { pieceId: 'wPe', row: 6, col: 4 },
          { pieceId: 'wPd', row: 6, col: 3 }, { pieceId: 'wNg', row: 7, col: 6 },
          { pieceId: 'wNb', row: 7, col: 1 }, { pieceId: 'wBf', row: 7, col: 5 },
          { pieceId: 'bK', row: 0, col: 4 }, { pieceId: 'bPe', row: 1, col: 4 },
          { pieceId: 'bN', row: 0, col: 1 },
        ],
        highlights: [
          { row: 4, col: 3, color: 'rgba(251,191,36,0.3)' },
          { row: 4, col: 4, color: 'rgba(251,191,36,0.3)' },
        ],
        caption: 'Start: pieces undeveloped, center unpopulated...',
      },
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 6 }, { pieceId: 'wPe', row: 4, col: 4 },
          { pieceId: 'wPd', row: 4, col: 3 }, { pieceId: 'wNg', row: 5, col: 5 },
          { pieceId: 'wNb', row: 5, col: 2 }, { pieceId: 'wBf', row: 5, col: 4 },
          { pieceId: 'bK', row: 0, col: 4 }, { pieceId: 'bPe', row: 3, col: 4 },
          { pieceId: 'bN', row: 2, col: 2 },
        ],
        highlights: [
          { row: 4, col: 3, color: 'rgba(34,197,94,0.5)' },
          { row: 4, col: 4, color: 'rgba(34,197,94,0.5)' },
          { row: 5, col: 5, color: 'rgba(251,191,36,0.4)' },
          { row: 5, col: 2, color: 'rgba(251,191,36,0.4)' },
          { row: 7, col: 6, color: 'rgba(251,191,36,0.5)' },
        ],
        caption: 'After good opening: center controlled, pieces out, king castled!',
        badge: 'OPENING DONE',
      },
    ],
  },

  middlegame_phase: {
    pieces: [
      { id: 'wK', type: 'K', color: 'white' }, { id: 'wN', type: 'N', color: 'white' },
      { id: 'wR', type: 'R', color: 'white' }, { id: 'bK', type: 'K', color: 'black' },
      { id: 'bQ', type: 'Q', color: 'black' }, { id: 'bR', type: 'R', color: 'black' },
    ],
    frames: [
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 6 }, { pieceId: 'wN', row: 3, col: 3 },
          { pieceId: 'wR', row: 4, col: 0 }, { pieceId: 'bK', row: 0, col: 6 },
          { pieceId: 'bQ', row: 2, col: 5 }, { pieceId: 'bR', row: 0, col: 3 },
        ],
        highlights: [
          { row: 3, col: 3, color: 'rgba(59,130,246,0.5)' },
          { row: 1, col: 4, color: 'rgba(251,146,60,0.5)' },
          { row: 1, col: 2, color: 'rgba(251,146,60,0.5)' },
        ],
        caption: 'Knight threatens a fork — look for tactics every move!',
      },
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 6 }, { pieceId: 'wN', row: 1, col: 4 },
          { pieceId: 'wR', row: 4, col: 0 }, { pieceId: 'bK', row: 0, col: 6 },
          { pieceId: 'bQ', row: 2, col: 5 }, { pieceId: 'bR', row: 0, col: 3 },
        ],
        highlights: [
          { row: 1, col: 4, color: 'rgba(34,197,94,0.6)' },
          { row: 0, col: 6, color: 'rgba(220,38,38,0.5)' },
          { row: 2, col: 5, color: 'rgba(220,38,38,0.5)' },
        ],
        caption: 'Fork! Knight attacks king AND queen simultaneously!',
        badge: 'FORK!',
      },
    ],
  },

  endgame_phase: {
    pieces: [
      { id: 'wK', type: 'K', color: 'white' }, { id: 'wP', type: 'P', color: 'white' },
      { id: 'bK', type: 'K', color: 'black' },
    ],
    frames: [
      {
        pieceStates: [
          { pieceId: 'wK', row: 7, col: 7 }, { pieceId: 'wP', row: 4, col: 4 },
          { pieceId: 'bK', row: 2, col: 2 },
        ],
        highlights: [{ row: 7, col: 7, color: 'rgba(220,38,38,0.4)' }],
        caption: 'King hiding in the corner — wasting its power!',
      },
      {
        pieceStates: [
          { pieceId: 'wK', row: 4, col: 3 }, { pieceId: 'wP', row: 2, col: 4 },
          { pieceId: 'bK', row: 0, col: 6 },
        ],
        highlights: [
          { row: 4, col: 3, color: 'rgba(34,197,94,0.6)' },
          { row: 2, col: 4, color: 'rgba(251,191,36,0.5)' },
          { row: 0, col: 4, color: 'rgba(34,197,94,0.3)' },
        ],
        caption: 'King marches forward — escorts the pawn to promotion!',
        badge: 'ACTIVATE KING',
      },
    ],
  },
};

// ─── Rule data ───────────────────────────────────────────────────────────────

type Category = 'all' | 'winning' | 'special' | 'draws' | 'openings' | 'concepts';

interface Rule {
  id: string;
  category: 'winning' | 'special' | 'draws' | 'openings' | 'concepts';
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
    id: 'check', category: 'winning', emoji: '⚠️', title: 'Check', tagline: 'The king is under attack!', color: 'red',
    shortDesc: 'When an enemy piece targets your king, it\'s "check." You MUST deal with it immediately — no other moves allowed!',
    bullets: ['Move the king to a safe square', 'Block the attack with another piece', 'Capture the attacking piece'],
    tip: 'Always scan for checks before you move. Beginners often miss that their king is in danger!',
  },
  {
    id: 'checkmate', category: 'winning', emoji: '👑', title: 'Checkmate', tagline: 'King is trapped — game over!', color: 'amber',
    shortDesc: 'Checkmate is the goal of chess! The king is in check AND has no way to escape. The player who delivers checkmate wins.',
    bullets: ['King is in check', 'Cannot move to any safe square', 'Cannot block the attack', 'Cannot capture the attacker'],
    tip: '"Checkmate" comes from the Persian "Shah Mat" — meaning "the king is helpless." The losing player tips their king over as a sign of respect.',
  },
  {
    id: 'castling', category: 'special', emoji: '🏰', title: 'Castling', tagline: 'King and rook swap places!', color: 'emerald',
    shortDesc: 'The only move where two pieces move at once. The king slides 2 squares toward a rook, and that rook jumps to the other side.',
    bullets: ['Neither the king nor rook has moved before', 'No pieces between king and rook', 'King is not currently in check', 'King does not pass through or land on an attacked square'],
    tip: 'Castle early! Keeping your king in the center as pieces develop is very dangerous.',
  },
  {
    id: 'enpassant', category: 'special', emoji: '👻', title: 'En Passant', tagline: "Chess's sneakiest capture!", color: 'purple',
    shortDesc: 'If an enemy pawn moves 2 squares and lands right beside your pawn on the 5th rank, you can capture it as if it only moved 1 square.',
    bullets: ['Your pawn must be on the 5th rank', 'Enemy pawn must have JUST moved 2 squares next to you', 'You must capture on your very next move — or the chance is gone forever!'],
    tip: 'This is the rarest move in chess! When you use it correctly, your opponent will look totally confused.',
  },
  {
    id: 'promotion', category: 'special', emoji: '⭐', title: 'Pawn Promotion', tagline: 'A pawn becomes a queen!', color: 'yellow',
    shortDesc: 'When your pawn reaches the very last rank, it transforms into any piece you choose. Almost always a queen!',
    bullets: ['Queen — almost always the best choice', 'Rook, Bishop, or Knight are also options', 'You can have TWO queens at once', 'Choosing a knight is called "underpromotion" — rare but sometimes genius!'],
    tip: 'In theory all 8 pawns could promote. That\'s 9 queens! Nobody has ever needed to do this (opponents resign long before).',
  },
  {
    id: 'stalemate', category: 'draws', emoji: '😐', title: 'Stalemate', tagline: "Stuck with nowhere to go — draw!", color: 'blue',
    shortDesc: 'If a player has NO legal moves but their king is NOT in check, it\'s a draw. One of chess\'s biggest upsets!',
    bullets: ['It is your turn to move', 'King is NOT in check', 'Every possible move would put your own king in danger'],
    tip: 'Many winning games get accidentally thrown away by giving stalemate! When winning, always check your opponent still has a legal move.',
  },
  {
    id: 'repetition', category: 'draws', emoji: '🔄', title: 'Threefold Repetition', tagline: 'Same position 3 times — draw!', color: 'cyan',
    shortDesc: 'If the exact same board position occurs three times (with the same player to move), either player can claim a draw.',
    bullets: ['Exact same pieces on exact same squares', 'Same player\'s turn each time', 'Same castling rights and en passant options', 'The three times do not have to be consecutive'],
    tip: '"Perpetual check" is a classic drawing trick — you keep giving check over and over until the position repeats 3 times!',
  },
  {
    id: 'fiftymove', category: 'draws', emoji: '⏱️', title: '50-Move Rule', tagline: 'No progress? Call a draw!', color: 'slate',
    shortDesc: 'If 50 moves pass without a pawn moving AND without any capture, either player can claim a draw.',
    bullets: ['Counter resets when any pawn moves', 'Counter resets when any piece is captured', 'Mostly applies in tricky endgames', 'In casual games, you\'ll rarely need this rule'],
    tip: 'In tournament chess, you must claim the draw BEFORE making your move — not after!',
  },
  {
    id: 'insufficient', category: 'draws', emoji: '🪶', title: 'Insufficient Material', tagline: "Not enough pieces to checkmate!", color: 'teal',
    shortDesc: 'If neither side has enough pieces to possibly deliver checkmate, the game is an automatic draw.',
    bullets: ['King vs King — automatic draw', 'King + Bishop vs King — automatic draw', 'King + Knight vs King — automatic draw', 'King + Rook vs King — CAN win, game continues'],
    tip: "Don't trade ALL your pieces even when ahead! Trading down to King + Bishop vs King just gives your opponent a free draw.",
  },

  // ── Openings ────────────────────────────────────────────────────────────────
  {
    id: 'italian', category: 'openings', emoji: '🍕', title: 'Italian Game', tagline: 'Classic center control with c3 & d3', color: 'orange',
    shortDesc: 'One of the oldest openings in chess. White builds a strong center, develops naturally, and often castles kingside for a solid position.',
    bullets: ['1.e4 e5 2.Nf3 Nc6 3.Bc4 — bishop eyes the f7 pawn', 'Follow with c3 and d3/d4 to build a strong center', 'Castle kingside early for king safety', 'Great for beginners — natural piece development'],
    tip: 'The Italian is a fantastic first opening to learn. World champions have played it for hundreds of years!',
  },
  {
    id: 'ruylopez', category: 'openings', emoji: '⚔️', title: 'Ruy López', tagline: 'Pressure the defender of e5!', color: 'red',
    shortDesc: 'Named after a Spanish bishop from the 1500s. White pins the knight that defends e5, aiming to win the center long-term.',
    bullets: ['1.e4 e5 2.Nf3 Nc6 3.Bb5 — bishop pins the knight', 'White pressures e5 and fights for lasting center control', 'One of the most studied openings at grandmaster level', 'Leads to rich strategic battles'],
    tip: 'Magnus Carlsen and most world champions have relied on the Ruy López throughout their careers!',
  },
  {
    id: 'sicilian', category: 'openings', emoji: '🗡️', title: 'Sicilian Defense', tagline: "Black's sharpest weapon against e4!", color: 'purple',
    shortDesc: 'The most popular opening response to 1.e4. Black immediately fights for center control asymmetrically — creating unbalanced, fighting positions.',
    bullets: ['1.e4 c5 — Black attacks d4 without mirroring White', 'Creates rich, double-edged positions', 'Most popular opening at all levels worldwide', 'Variations: Najdorf, Dragon, Scheveningen, Classical'],
    tip: 'Bobby Fischer called the Sicilian "best by test." If you want to fight for the win as Black, this is your weapon!',
  },
  {
    id: 'french', category: 'openings', emoji: '🥐', title: 'French Defense', tagline: 'Solid chain, counterattack later!', color: 'blue',
    shortDesc: 'Black builds a solid pawn chain with e6 and d5, accepting a slightly cramped position in exchange for a rock-solid defense.',
    bullets: ['1.e4 e6 2.d4 d5 — Black challenges the center', 'Solid and hard to break through', 'Black often counterattacks on the queenside', 'Watch out for the "bad bishop" on c8!'],
    tip: "The French is perfect if you like long, strategic battles. It's very difficult for opponents to crack!",
  },
  {
    id: 'queensgambit', category: 'openings', emoji: '♛', title: "Queen's Gambit", tagline: "Control the center with a pawn offer!", color: 'amber',
    shortDesc: "White offers the c-pawn to gain central dominance. It's not really a gambit — the pawn can almost always be regained!",
    bullets: ["1.d4 d5 2.c4 — White offers the c-pawn", 'Accepted (QGA): Black takes on c4, White regains control', 'Declined (QGD): Black keeps solid pawn structure', 'Popularized globally by Netflix\'s The Queen\'s Gambit'],
    tip: 'Even if Black accepts the pawn, White usually wins it back with good play. Focus on the center, not the pawn!',
  },
  {
    id: 'london', category: 'openings', emoji: '🎩', title: 'London System', tagline: 'Solid, flexible, and reliable!', color: 'slate',
    shortDesc: "A solid system for White that works against almost anything Black plays. White develops the bishop to f4 before closing the center.",
    bullets: ['1.d4 Nf6 2.Nf3 d5 3.Bf4 — active bishop development', 'Works against virtually any Black response', 'Great for players who prefer solid, methodical play', 'Very popular at club level and with world champions'],
    tip: "Magnus Carlsen uses the London regularly! It's deceptively simple but hides deep strategic ideas.",
  },
  {
    id: 'carokann', category: 'openings', emoji: '🛡️', title: 'Caro-Kann Defense', tagline: 'Solid c6, then d5 — no bad bishops!', color: 'cyan',
    shortDesc: 'Black responds to 1.e4 with c6, preparing d5 on the next move. More solid than the French — the light-squared bishop stays active.',
    bullets: ['1.e4 c6 2.d4 d5 — Black prepares d5 with c6 support', 'Black avoids the "bad bishop" problem of the French', 'Very solid and reliable for Black', 'Petrosian and Karpov made this famous with positional mastery'],
    tip: 'The Caro-Kann is the "mature" alternative to the Sicilian — less sharp but just as effective at the top level!',
  },
  {
    id: 'kingsindian', category: 'openings', emoji: '🔥', title: "King's Indian Defense", tagline: 'Fianchetto and counterattack!', color: 'indigo',
    shortDesc: "Black lets White build a big center, then fianchettoes the kingside bishop and launches a fierce counterattack.",
    bullets: ["1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 — bishop fianchettoed to g7", 'Black lets White have the center, then attacks it', 'Creates wild, attacking chess', 'Kasparov and Fischer both loved this opening!'],
    tip: 'The King\'s Indian is for fighters! Black deliberately lets White grab space, then counterattacks with everything.',
  },

  // ── Concepts ─────────────────────────────────────────────────────────────────
  {
    id: 'opening_phase', category: 'concepts', emoji: '🚀', title: 'The Opening Phase', tagline: 'Develop pieces, control the center, castle!', color: 'emerald',
    shortDesc: 'The first 10–15 moves of a chess game. Your three goals are simple: control the center, develop your pieces, and get your king to safety.',
    bullets: ['Control the center — place pawns on d4/e4 (or d5/e5)', 'Develop knights and bishops before rooks and queen', 'Castle early to protect your king', 'Avoid moving the same piece twice in the opening'],
    tip: 'A bad plan is better than no plan! In the opening, follow the three rules consistently and you will always get a good position.',
  },
  {
    id: 'middlegame_phase', category: 'concepts', emoji: '⚔️', title: 'The Middlegame Phase', tagline: 'Attack, defend, and find tactics!', color: 'red',
    shortDesc: 'After development is complete, the real chess begins! Look for tactical opportunities (forks, pins, skewers) and improve your worst-placed pieces.',
    bullets: ['Look for forks — one piece attacking two targets', 'Exploit pins — trapped pieces cannot move', 'Create threats your opponent must respond to', 'Trade pieces when ahead, keep pieces when behind'],
    tip: 'Every move, ask: "What is my opponent threatening?" Before you attack, make sure your own king is safe!',
  },
  {
    id: 'endgame_phase', category: 'concepts', emoji: '🏁', title: 'The Endgame Phase', tagline: 'King becomes a warrior — promote pawns!', color: 'teal',
    shortDesc: 'When most pieces are traded off, the endgame begins. Your king becomes a powerful piece — activate it! Pawns racing to promote become critical.',
    bullets: ['Activate your king — march it to the center', 'Passed pawns (no enemy pawns blocking) are very powerful', 'King + Rook vs lone King: the basic checkmate to know', 'Opposition: kings facing each other with one square between'],
    tip: 'Most beginners keep their king hiding forever. In the endgame, the king MUST come out and fight!',
  },
];

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '📜' },
  { id: 'winning', label: 'Winning', emoji: '👑' },
  { id: 'special', label: 'Special', emoji: '✨' },
  { id: 'draws', label: 'Draws', emoji: '🤝' },
  { id: 'openings', label: 'Openings', emoji: '♟️' },
  { id: 'concepts', label: 'Concepts', emoji: '🧠' },
];

const CATEGORY_META: Record<string, { label: string; textColor: string }> = {
  winning: { label: 'Winning & Losing', textColor: 'text-amber-600 dark:text-amber-400' },
  special: { label: 'Special Move', textColor: 'text-purple-600 dark:text-purple-400' },
  draws: { label: 'Draw Rule', textColor: 'text-blue-600 dark:text-blue-400' },
  openings: { label: 'Opening', textColor: 'text-orange-600 dark:text-orange-400' },
  concepts: { label: 'Strategy Concept', textColor: 'text-indigo-600 dark:text-indigo-400' },
};

const COLORS: Record<string, { bg: string; border: string; badgeBg: string; badgeText: string; dot: string }> = {
  red:     { bg: 'bg-red-50 dark:bg-red-900/20',         border: 'border-red-200 dark:border-red-800/40',         badgeBg: 'bg-red-100 dark:bg-red-900/40',       badgeText: 'text-red-700 dark:text-red-300',     dot: 'bg-red-400' },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20',     border: 'border-amber-200 dark:border-amber-800/40',     badgeBg: 'bg-amber-100 dark:bg-amber-900/40',   badgeText: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-400' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/40', badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40', badgeText: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-400' },
  purple:  { bg: 'bg-purple-50 dark:bg-purple-900/20',   border: 'border-purple-200 dark:border-purple-800/40',   badgeBg: 'bg-purple-100 dark:bg-purple-900/40', badgeText: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-400' },
  yellow:  { bg: 'bg-yellow-50 dark:bg-yellow-900/20',   border: 'border-yellow-200 dark:border-yellow-800/40',   badgeBg: 'bg-yellow-100 dark:bg-yellow-900/40', badgeText: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-400' },
  blue:    { bg: 'bg-blue-50 dark:bg-blue-900/20',       border: 'border-blue-200 dark:border-blue-800/40',       badgeBg: 'bg-blue-100 dark:bg-blue-900/40',     badgeText: 'text-blue-700 dark:text-blue-300',   dot: 'bg-blue-400' },
  cyan:    { bg: 'bg-cyan-50 dark:bg-cyan-900/20',       border: 'border-cyan-200 dark:border-cyan-800/40',       badgeBg: 'bg-cyan-100 dark:bg-cyan-900/40',     badgeText: 'text-cyan-700 dark:text-cyan-300',   dot: 'bg-cyan-400' },
  slate:   { bg: 'bg-slate-50 dark:bg-slate-800/40',     border: 'border-slate-200 dark:border-slate-700/40',     badgeBg: 'bg-slate-100 dark:bg-slate-800/60',   badgeText: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-400' },
  teal:    { bg: 'bg-teal-50 dark:bg-teal-900/20',       border: 'border-teal-200 dark:border-teal-800/40',       badgeBg: 'bg-teal-100 dark:bg-teal-900/40',     badgeText: 'text-teal-700 dark:text-teal-300',   dot: 'bg-teal-400' },
  orange:  { bg: 'bg-orange-50 dark:bg-orange-900/20',   border: 'border-orange-200 dark:border-orange-800/40',   badgeBg: 'bg-orange-100 dark:bg-orange-900/40', badgeText: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-400' },
  indigo:  { bg: 'bg-indigo-50 dark:bg-indigo-900/20',   border: 'border-indigo-200 dark:border-indigo-800/40',   badgeBg: 'bg-indigo-100 dark:bg-indigo-900/40', badgeText: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-400' },
};

// ─── Demo Board component ─────────────────────────────────────────────────────

const SQ = 32; // px per square

function DemoBoard({ demo }: { demo: Demo }) {
  const [frameIdx, setFrameIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  // Find each piece's first appearance for initial positioning
  const initialPositions = useMemo(() => {
    const map = new Map<string, { row: number; col: number }>();
    demo.frames.forEach(f => f.pieceStates.forEach(ps => {
      if (!map.has(ps.pieceId)) map.set(ps.pieceId, { row: ps.row, col: ps.col });
    }));
    return map;
  }, [demo]);

  // Track last known positions so pieces don't snap to (0,0) when invisible
  const posTracker = useRef<Map<string, { row: number; col: number }>>(new Map(initialPositions));

  // Reset when demo changes
  useEffect(() => {
    setFrameIdx(0);
    setPaused(false);
    posTracker.current = new Map(initialPositions);
  }, [demo, initialPositions]);

  // Auto-advance frames
  useEffect(() => {
    if (paused || demo.frames.length <= 1) return;
    const id = setTimeout(() => setFrameIdx(i => (i + 1) % demo.frames.length), 2200);
    return () => clearTimeout(id);
  }, [paused, frameIdx, demo.frames.length]);

  const frame = demo.frames[frameIdx];

  // Build current visible positions and update tracker
  const visibleMap = new Map<string, { row: number; col: number }>();
  frame.pieceStates.forEach(ps => {
    visibleMap.set(ps.pieceId, { row: ps.row, col: ps.col });
    posTracker.current.set(ps.pieceId, { row: ps.row, col: ps.col });
  });

  const boardPx = SQ * 8;

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      {/* Board */}
      <div
        className="relative rounded-sm"
        style={{ width: boardPx, height: boardPx, border: '2px solid #8B6534', boxShadow: '0 4px 20px rgba(0,0,0,0.35)', overflow: 'hidden' }}
      >
        {/* Squares */}
        {Array.from({ length: 64 }, (_, i) => {
          const row = Math.floor(i / 8), col = i % 8;
          const isLight = (row + col) % 2 === 0;
          const hl = frame.highlights.find(h => h.row === row && h.col === col);
          return (
            <div key={i} style={{ position: 'absolute', top: row * SQ, left: col * SQ, width: SQ, height: SQ, backgroundColor: isLight ? '#F0D9B5' : '#B58863' }}>
              {hl && <div style={{ position: 'absolute', inset: 0, backgroundColor: hl.color }} />}
            </div>
          );
        })}

        {/* Pieces — always mounted, animate position + opacity */}
        {demo.pieces.map(piece => {
          const isVisible = visibleMap.has(piece.id);
          const pos = visibleMap.get(piece.id) ?? posTracker.current.get(piece.id) ?? { row: 0, col: 0 };
          return (
            <motion.div
              key={piece.id}
              animate={{ top: pos.row * SQ, left: pos.col * SQ, opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.15 }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              style={{
                position: 'absolute', width: SQ, height: SQ,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: SQ * 0.75, lineHeight: 1, zIndex: 10, pointerEvents: 'none',
                filter: piece.color === 'white'
                  ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.95)) drop-shadow(0 0 2px rgba(0,0,0,0.7))'
                  : 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
              }}
            >
              {getPieceSymbol(piece.type, piece.color)}
            </motion.div>
          );
        })}

        {/* Badge overlay */}
        <AnimatePresence mode="wait">
          {frame.badge && (
            <motion.div
              key={frame.badge}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md text-white text-xs font-extrabold z-20"
              style={{ background: 'rgba(0,0,0,0.72)', letterSpacing: '0.05em' }}
            >
              {frame.badge}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Caption */}
      <motion.p
        key={`${frameIdx}-caption`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-xs text-center text-text-secondary leading-snug"
        style={{ maxWidth: boardPx }}
      >
        {frame.caption}
      </motion.p>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setFrameIdx(0); setPaused(false); }}
          className="text-xs px-2 py-1 rounded-lg bg-background-secondary text-text-muted hover:text-text-primary transition-colors"
        >
          ↺ Reset
        </button>
        {demo.frames.length > 1 && (
          <button
            onClick={() => setPaused(p => !p)}
            className="text-xs px-2 py-1 rounded-lg bg-background-secondary text-text-muted hover:text-text-primary transition-colors"
          >
            {paused ? '▶ Play' : '⏸ Pause'}
          </button>
        )}
        <div className="flex gap-1.5 items-center">
          {demo.frames.map((_, i) => (
            <button
              key={i}
              onClick={() => { setFrameIdx(i); setPaused(true); }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${i === frameIdx ? 'bg-blue-500 scale-125' : 'bg-gray-300 dark:bg-gray-600'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Rule Card component ──────────────────────────────────────────────────────

function RuleCard({ rule, learned, onToggle }: { rule: Rule; learned: boolean; onToggle: () => void }) {
  const [open, setOpen] = useState(false);
  const c = COLORS[rule.color] ?? COLORS.slate;
  const meta = CATEGORY_META[rule.category];
  const demo = DEMOS[rule.id];

  return (
    <div className={`rounded-2xl border-2 ${c.border} ${c.bg} overflow-hidden ${learned ? 'opacity-70' : ''}`}>
      {/* Header */}
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
            {learned && <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">✓ Learned</span>}
          </div>
          <p className="text-xs font-semibold text-text-muted mb-1">{rule.tagline}</p>
          <p className="text-sm text-text-secondary leading-relaxed">{rule.shortDesc}</p>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-text-muted text-lg shrink-0 mt-0.5">
          ▾
        </motion.span>
      </button>

      {/* Expanded body */}
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
              {/* Animated demo board */}
              {demo && (
                <div className="mb-4 flex justify-center">
                  <div className={`rounded-xl ${c.badgeBg} px-4 py-3 inline-block`}>
                    <DemoBoard demo={demo} />
                  </div>
                </div>
              )}

              {/* Bullet list */}
              <ul className="space-y-1.5 mb-4">
                {rule.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {/* Tip */}
              <div className={`rounded-xl px-4 py-3 mb-4 ${c.badgeBg} ${c.badgeText}`}>
                <p className="text-sm font-medium leading-relaxed">
                  <span className="font-bold">Tip: </span>{rule.tip}
                </p>
              </div>

              {/* Mark as learned */}
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
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RulesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());

  const toggleLearned = useCallback((id: string) => {
    setLearnedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }, []);

  const filtered = activeCategory === 'all' ? RULES : RULES.filter(r => r.category === activeCategory);
  const progressPct = Math.round((learnedIds.size / RULES.length) * 100);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-12 px-4 sm:px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['♜', '♞', '♛', '♚', '♟', '♝'].map((p, i) => (
            <motion.span key={i} className="absolute text-4xl sm:text-6xl opacity-5 select-none"
              style={{ left: `${i * 17 + 3}%`, top: `${(i % 3) * 30 + 5}%` }}
              animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.6 }}
            >{p}</motion.span>
          ))}
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl mb-4">📜</motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold text-text-primary mb-3 tracking-tight"
          >
            The{' '}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">Rules</span>{' '}
            of Chess
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-text-secondary text-lg leading-relaxed"
          >
            Every rule explained simply — with animated examples. Tap any rule to see it in action!
          </motion.p>
        </div>
      </section>

      {/* Progress bar */}
      <section className="px-4 sm:px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white dark:bg-background-secondary border-2 border-amber-200 dark:border-amber-800/40 rounded-2xl px-5 py-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-text-primary">Your progress</span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{learnedIds.size} / {RULES.length} rules learned</span>
            </div>
            <div className="h-3 rounded-full bg-amber-100 dark:bg-amber-900/30 overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
                animate={{ width: `${progressPct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
            {learnedIds.size === RULES.length && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-2 text-center"
              >
                You know all the rules! Time to play some chess!
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Category filter */}
      <section className="pb-6">
        <div className="overflow-x-auto scrollbar-hide px-4 sm:px-6">
          <div className="max-w-2xl mx-auto flex gap-2 w-max sm:w-auto sm:flex-wrap">
            {CATEGORIES.map(cat => {
              const count = cat.id === 'all' ? RULES.length : RULES.filter(r => r.category === cat.id).length;
              const isActive = activeCategory === cat.id;
              return (
                <motion.button key={cat.id} onClick={() => setActiveCategory(cat.id)} whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all whitespace-nowrap min-h-[40px] ${
                    isActive ? 'bg-blue-500 border-blue-500 text-white shadow-md' : 'bg-white dark:bg-background-secondary border-border text-text-secondary hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
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
              <motion.div key={rule.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: i * 0.04 }}>
                <RuleCard rule={rule} learned={learnedIds.has(rule.id)} onToggle={() => toggleLearned(rule.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 px-4 bg-gradient-to-br from-blue-500 to-cyan-400">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-4xl mb-3">♟️</div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Rules down? Now practice!</h2>
          <p className="text-blue-100 mb-6">The best way to learn rules is to use them. Try solving a puzzle!</p>
          <a href="/puzzles">
            <motion.button className="px-8 py-3 rounded-2xl bg-white text-blue-600 font-bold text-base shadow-lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              Try a Puzzle →
            </motion.button>
          </a>
        </div>
      </section>
    </div>
  );
}
