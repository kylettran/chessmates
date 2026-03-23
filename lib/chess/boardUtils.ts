import type { BoardGrid, BoardState, Color, Piece, PieceType, Square } from '@/types/chess';

export function emptyBoard(): BoardGrid {
  return Array.from({ length: 8 }, () => Array(8).fill(null));
}

export function startingBoard(): BoardState {
  const squares: BoardGrid = emptyBoard();
  const backRank: PieceType[] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  backRank.forEach((type, col) => { squares[0][col] = { type, color: 'black' }; });
  for (let col = 0; col < 8; col++) { squares[1][col] = { type: 'P', color: 'black' }; }
  for (let col = 0; col < 8; col++) { squares[6][col] = { type: 'P', color: 'white' }; }
  backRank.forEach((type, col) => { squares[7][col] = { type, color: 'white' }; });
  return { squares, turn: 'white' };
}

export function singlePieceBoard(piece: Piece, square: Square): BoardState {
  const squares = emptyBoard();
  squares[square.row][square.col] = piece;
  return { squares, turn: piece.color };
}

export function getValidMoves(board: BoardGrid, from: Square): Square[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];
  const moves: Square[] = [];
  const inBounds = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const isEmpty = (r: number, c: number) => inBounds(r, c) && board[r][c] === null;
  const isEnemy = (r: number, c: number) => inBounds(r, c) && board[r][c] !== null && board[r][c]!.color !== piece.color;
  const canMoveTo = (r: number, c: number) => isEmpty(r, c) || isEnemy(r, c);
  const slide = (dr: number, dc: number) => {
    let r = from.row + dr, c = from.col + dc;
    while (inBounds(r, c)) {
      if (isEmpty(r, c)) { moves.push({ row: r, col: c }); }
      else if (isEnemy(r, c)) { moves.push({ row: r, col: c }); break; }
      else break;
      r += dr; c += dc;
    }
  };
  switch (piece.type) {
    case 'P': {
      const dir = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;
      if (isEmpty(from.row + dir, from.col)) {
        moves.push({ row: from.row + dir, col: from.col });
        if (from.row === startRow && isEmpty(from.row + 2 * dir, from.col)) moves.push({ row: from.row + 2 * dir, col: from.col });
      }
      if (isEnemy(from.row + dir, from.col - 1)) moves.push({ row: from.row + dir, col: from.col - 1 });
      if (isEnemy(from.row + dir, from.col + 1)) moves.push({ row: from.row + dir, col: from.col + 1 });
      break;
    }
    case 'R': slide(1,0); slide(-1,0); slide(0,1); slide(0,-1); break;
    case 'B': slide(1,1); slide(1,-1); slide(-1,1); slide(-1,-1); break;
    case 'Q': slide(1,0); slide(-1,0); slide(0,1); slide(0,-1); slide(1,1); slide(1,-1); slide(-1,1); slide(-1,-1); break;
    case 'K': [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc]) => { if (canMoveTo(from.row+dr, from.col+dc)) moves.push({ row: from.row+dr, col: from.col+dc }); }); break;
    case 'N': [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc]) => { if (canMoveTo(from.row+dr, from.col+dc)) moves.push({ row: from.row+dr, col: from.col+dc }); }); break;
  }
  return moves;
}

export function isInCheck(board: BoardGrid, color: Color): boolean {
  let kingRow = -1, kingCol = -1;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = board[r][c]; if (p && p.type === 'K' && p.color === color) { kingRow = r; kingCol = c; } }
  if (kingRow === -1) return false;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = board[r][c]; if (p && p.color !== color) { if (getValidMoves(board, { row: r, col: c }).some(m => m.row === kingRow && m.col === kingCol)) return true; } }
  return false;
}

export function applyMove(board: BoardGrid, from: Square, to: Square): BoardGrid {
  const newBoard = board.map(row => [...row]);
  newBoard[to.row][to.col] = newBoard[from.row][from.col];
  newBoard[from.row][from.col] = null;
  return newBoard;
}

export const FILES = ['a','b','c','d','e','f','g','h'];
export const RANKS = ['8','7','6','5','4','3','2','1'];
export function squareToLabel(sq: Square): string { return FILES[sq.col] + RANKS[sq.row]; }
