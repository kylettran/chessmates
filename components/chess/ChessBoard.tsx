'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { BoardState, HighlightedSquare, Square } from '@/types/chess';
import { getPieceSymbol } from '@/lib/chess/pieces';
import { getValidMoves } from '@/lib/chess/boardUtils';

interface ChessBoardProps {
  boardState: BoardState;
  highlightedSquares?: HighlightedSquare[];
  interactive?: boolean;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onMove?: (from: Square, to: Square) => void;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const highlightClasses: Record<string, string> = {
  selected: 'sq-selected',
  'valid-move': 'sq-valid-move',
  capture: 'sq-valid-move sq-capture',
  'last-move': 'sq-last-move',
  check: 'sq-check',
  hint: 'sq-hint',
};

export function ChessBoard({
  boardState,
  highlightedSquares = [],
  interactive = false,
  showLabels = true,
  size = 'md',
  onMove,
}: ChessBoardProps) {
  const [selected, setSelected] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);

  const squareSize = size === 'sm' ? 40 : size === 'md' ? 56 : 72;
  const fontSize = size === 'sm' ? '1.4rem' : size === 'md' ? '2rem' : '2.6rem';
  const labelSize = size === 'sm' ? '8px' : size === 'md' ? '11px' : '13px';

  const getHighlight = useCallback(
    (row: number, col: number): string => {
      if (selected && selected.row === row && selected.col === col) return 'sq-selected';
      if (validMoves.some(m => m.row === row && m.col === col)) {
        const target = boardState.squares[row][col];
        return target ? 'sq-valid-move sq-capture' : 'sq-valid-move';
      }
      const h = highlightedSquares.find(s => s.row === row && s.col === col);
      return h ? highlightClasses[h.type] || '' : '';
    },
    [selected, validMoves, highlightedSquares, boardState.squares]
  );

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (!interactive) return;
      const piece = boardState.squares[row][col];
      if (selected) {
        if (validMoves.some(m => m.row === row && m.col === col)) {
          onMove?.(selected, { row, col });
          setSelected(null);
          setValidMoves([]);
          return;
        }
        if (piece && piece.color === boardState.turn) {
          setSelected({ row, col });
          setValidMoves(getValidMoves(boardState.squares, { row, col }));
          return;
        }
        setSelected(null);
        setValidMoves([]);
        return;
      }
      if (piece && piece.color === boardState.turn) {
        setSelected({ row, col });
        setValidMoves(getValidMoves(boardState.squares, { row, col }));
      }
    },
    [interactive, selected, validMoves, boardState, onMove]
  );

  const handleDemoClick = useCallback(
    (row: number, col: number) => {
      if (interactive) return;
      const piece = boardState.squares[row][col];
      if (!piece) { setSelected(null); setValidMoves([]); return; }
      if (selected?.row === row && selected?.col === col) { setSelected(null); setValidMoves([]); return; }
      setSelected({ row, col });
      setValidMoves(getValidMoves(boardState.squares, { row, col }));
    },
    [interactive, boardState.squares, selected]
  );

  const boardSize = squareSize * 8;

  return (
    <div className="inline-flex flex-col items-end">
      <div
        className="relative rounded-sm overflow-hidden"
        style={{
          width: boardSize + (showLabels ? 20 : 0),
          height: boardSize + (showLabels ? 20 : 0),
          border: '3px solid #8B6534',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: showLabels ? 20 : 0,
            display: 'grid',
            gridTemplateColumns: `repeat(8, ${squareSize}px)`,
            gridTemplateRows: `repeat(8, ${squareSize}px)`,
          }}
        >
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 8 }, (_, col) => {
              const isLight = (row + col) % 2 === 0;
              const piece = boardState.squares[row][col];
              const highlightClass = getHighlight(row, col);
              return (
                <div
                  key={`${row}-${col}`}
                  className={`relative cursor-pointer select-none ${highlightClass}`}
                  style={{
                    width: squareSize,
                    height: squareSize,
                    backgroundColor: isLight ? '#F0D9B5' : '#B58863',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => interactive ? handleSquareClick(row, col) : handleDemoClick(row, col)}
                >
                  {showLabels && col === 0 && (
                    <span className="absolute top-0.5 left-0.5 font-bold leading-none" style={{ fontSize: labelSize, color: isLight ? '#B58863' : '#F0D9B5' }}>
                      {RANKS[row]}
                    </span>
                  )}
                  {showLabels && row === 7 && (
                    <span className="absolute bottom-0.5 right-1 font-bold leading-none" style={{ fontSize: labelSize, color: isLight ? '#B58863' : '#F0D9B5' }}>
                      {FILES[col]}
                    </span>
                  )}
                  {piece && (
                    <motion.span
                      style={{
                        fontSize, lineHeight: 1, cursor: 'pointer', userSelect: 'none',
                        filter: piece.color === 'white'
                          ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))'
                          : 'drop-shadow(0 1px 2px rgba(255,255,255,0.3))',
                      }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      {getPieceSymbol(piece.type, piece.color)}
                    </motion.span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      {!interactive && (
        <p className="text-xs text-text-muted mt-2 text-center" style={{ width: boardSize + (showLabels ? 20 : 0) }}>
          👆 Click any piece to see where it can move
        </p>
      )}
    </div>
  );
}
