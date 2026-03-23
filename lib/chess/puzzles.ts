import type { Puzzle } from '@/types/chess';
import { emptyBoard } from './boardUtils';

export const PUZZLES: Puzzle[] = [
  {
    id: 'find-checkmate-1', title: 'Checkmate in One!',
    description: 'White to move. Can you deliver checkmate in just one move?', difficulty: 'beginner',
    boardState: { squares: (() => { const b = emptyBoard(); b[0][7] = { type: 'K', color: 'black' }; b[1][6] = { type: 'P', color: 'black' }; b[1][7] = { type: 'P', color: 'black' }; b[2][4] = { type: 'R', color: 'white' }; b[7][4] = { type: 'K', color: 'white' }; return b; })(), turn: 'white' },
    correctMove: { from: { row: 2, col: 4 }, to: { row: 0, col: 4 } },
    hint: 'Move your rook to the back rank — the 8th rank!',
    explanation: 'The rook slides all the way to the back rank. The black king is trapped in the corner by its own pawns and cannot escape. That\'s checkmate! 🎉',
  },
  {
    id: 'find-checkmate-2', title: 'Queen Checkmate!',
    description: 'White to move. Use your queen to deliver checkmate!', difficulty: 'beginner',
    boardState: { squares: (() => { const b = emptyBoard(); b[0][4] = { type: 'K', color: 'black' }; b[1][3] = { type: 'P', color: 'black' }; b[1][4] = { type: 'P', color: 'black' }; b[1][5] = { type: 'P', color: 'black' }; b[3][4] = { type: 'Q', color: 'white' }; b[7][4] = { type: 'K', color: 'white' }; return b; })(), turn: 'white' },
    correctMove: { from: { row: 3, col: 4 }, to: { row: 1, col: 6 } },
    hint: 'Think diagonally! The queen can move like a bishop too.',
    explanation: 'The queen moves diagonally — attacking the king AND covering its escape squares. The black pawns block the king from going sideways. Checkmate! ♛',
  },
  {
    id: 'capture-the-queen', title: 'Win the Queen!',
    description: 'White to move. Capture the black queen to win big material!', difficulty: 'beginner',
    boardState: { squares: (() => { const b = emptyBoard(); b[0][4] = { type: 'K', color: 'black' }; b[2][2] = { type: 'Q', color: 'black' }; b[4][0] = { type: 'R', color: 'white' }; b[7][4] = { type: 'K', color: 'white' }; return b; })(), turn: 'white' },
    correctMove: { from: { row: 4, col: 0 }, to: { row: 2, col: 0 } },
    hint: 'Your rook can slide up the a-file (left column)!',
    explanation: 'The rook slides up to the same rank as the queen, then can capture it. The rook slides to a3, putting it on the same rank — then captures the queen!',
  },
  {
    id: 'fork-attack', title: 'The Fork!',
    description: 'White to move. Use your knight to attack TWO pieces at once — that\'s a fork!', difficulty: 'beginner',
    boardState: { squares: (() => { const b = emptyBoard(); b[0][4] = { type: 'K', color: 'black' }; b[0][0] = { type: 'R', color: 'black' }; b[4][3] = { type: 'N', color: 'white' }; b[7][4] = { type: 'K', color: 'white' }; return b; })(), turn: 'white' },
    correctMove: { from: { row: 4, col: 3 }, to: { row: 2, col: 4 } },
    hint: 'Find a square where your knight attacks BOTH the king and rook!',
    explanation: 'Knight to e6! The knight now attacks the black king AND the black rook at the same time. Since the king must move out of check, White wins the rook for free! This is called a "fork." 🐴',
  },
  {
    id: 'protect-your-piece', title: 'Save Your Piece!',
    description: 'White to move. Your bishop is being attacked! Move it to safety.', difficulty: 'beginner',
    boardState: { squares: (() => { const b = emptyBoard(); b[0][4] = { type: 'K', color: 'black' }; b[3][3] = { type: 'B', color: 'white' }; b[2][4] = { type: 'R', color: 'black' }; b[7][4] = { type: 'K', color: 'white' }; return b; })(), turn: 'white' },
    correctMove: { from: { row: 3, col: 3 }, to: { row: 5, col: 1 } },
    hint: 'Move the bishop diagonally to escape the rook!',
    explanation: 'The bishop moves diagonally away from the rook\'s attack to b3. The rook can only move straight lines, so the bishop is safe on a diagonal! ⛪',
  },
  {
    id: 'pawn-promotion', title: 'Promote Your Pawn!',
    description: 'White to move. Your pawn is almost at the finish line! Move it and it becomes a queen!', difficulty: 'beginner',
    boardState: { squares: (() => { const b = emptyBoard(); b[0][4] = { type: 'K', color: 'black' }; b[1][2] = { type: 'P', color: 'white' }; b[7][4] = { type: 'K', color: 'white' }; return b; })(), turn: 'white' },
    correctMove: { from: { row: 1, col: 2 }, to: { row: 0, col: 2 } },
    hint: 'March that pawn forward one more square!',
    explanation: 'The pawn marches to the back rank and promotes to a queen! Now White has a brand new queen and a huge advantage. ♕',
  },
  {
    id: 'back-rank-checkmate', title: 'Back Rank Checkmate',
    description: 'White to move. The black king is trapped on the back rank!', difficulty: 'intermediate',
    boardState: { squares: (() => { const b = emptyBoard(); b[0][5] = { type: 'K', color: 'black' }; b[0][6] = { type: 'P', color: 'black' }; b[0][7] = { type: 'P', color: 'black' }; b[1][5] = { type: 'P', color: 'black' }; b[3][0] = { type: 'R', color: 'white' }; b[7][4] = { type: 'K', color: 'white' }; return b; })(), turn: 'white' },
    correctMove: { from: { row: 3, col: 0 }, to: { row: 0, col: 0 } },
    hint: 'Slide your rook to the back rank (the 8th rank)!',
    explanation: 'The rook slides to the back rank! The black king is trapped by its own pawns and cannot escape. This is called a "back rank checkmate" — one of the most common ways to win! 🏆',
  },
  {
    id: 'discovered-attack', title: 'Discovered Attack!',
    description: 'White to move. Move one piece to reveal an attack from another piece hiding behind it!', difficulty: 'intermediate',
    boardState: { squares: (() => { const b = emptyBoard(); b[0][4] = { type: 'K', color: 'black' }; b[4][4] = { type: 'Q', color: 'black' }; b[5][4] = { type: 'N', color: 'white' }; b[7][4] = { type: 'R', color: 'white' }; b[7][0] = { type: 'K', color: 'white' }; return b; })(), turn: 'white' },
    correctMove: { from: { row: 5, col: 4 }, to: { row: 3, col: 3 } },
    hint: 'Move your knight away from the e-file to reveal the rook\'s power!',
    explanation: 'The knight moves away, uncovering the rook\'s line of attack on the queen. The knight also attacks the king — Black can\'t save both. This is a "discovered attack with check!" ♞',
  },
];

export function getPuzzleById(id: string): Puzzle | undefined { return PUZZLES.find(p => p.id === id); }
