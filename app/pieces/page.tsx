'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { PIECES } from '@/lib/chess/pieces';
import { singlePieceBoard, getValidMoves, squareToLabel } from '@/lib/chess/boardUtils';
import type { PieceInfo } from '@/types/chess';

export default function PiecesPage() {
  const [activePiece, setActivePiece] = useState<PieceInfo>(PIECES[0]);
  const [pieceRow, setPieceRow] = useState(3);
  const [pieceCol, setPieceCol] = useState(3);
  const [visitedSquares, setVisitedSquares] = useState<Set<string>>(new Set(['3-3']));
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const board = singlePieceBoard(
    { type: activePiece.type, color: 'white' },
    { row: pieceRow, col: pieceCol }
  );
  const validMoves = getValidMoves(board.squares, { row: pieceRow, col: pieceCol });
  const validSet = new Set(validMoves.map(m => `${m.row}-${m.col}`));

  const handleSelectPiece = useCallback((piece: PieceInfo) => {
    setActivePiece(piece);
    setPieceRow(3);
    setPieceCol(3);
    setVisitedSquares(new Set(['3-3']));
    setMoveHistory([]);
  }, []);

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (row === pieceRow && col === pieceCol) return;
    const from = squareToLabel({ row: pieceRow, col: pieceCol });
    const to = squareToLabel({ row, col });
    setMoveHistory(prev => [...prev, `${from}→${to}`].slice(-6));
    setVisitedSquares(prev => new Set([...prev, `${row}-${col}`]));
    setPieceRow(row);
    setPieceCol(col);
  }, [pieceRow, pieceCol]);

  const handleReset = useCallback(() => {
    setPieceRow(3);
    setPieceCol(3);
    setVisitedSquares(new Set(['3-3']));
    setMoveHistory([]);
  }, []);

  const currentSquare = squareToLabel({ row: pieceRow, col: pieceCol });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            ♟️{' '}
            <span className="bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
              Meet the Pieces
            </span>
          </h1>
          <p className="text-text-secondary text-sm">
            Pick a piece below, then click any square on the board to place it and explore where it can move!
          </p>
        </div>

        {/* Piece picker */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-8 flex-wrap">
          {PIECES.map(piece => (
            <motion.button
              key={piece.id}
              onClick={() => handleSelectPiece(piece)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-1 px-2 sm:px-4 py-3 rounded-2xl border-2 transition-colors min-w-[64px] sm:min-w-[80px] ${
                activePiece.id === piece.id
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-lg'
                  : 'border-amber-900/20 dark:border-amber-200/10 bg-background-secondary hover:border-amber-400/50'
              }`}
            >
              <span className="text-2xl sm:text-3xl leading-none">{piece.symbol}</span>
              <span className="text-xs font-bold text-text-primary">{piece.name}</span>
              <span className="text-[10px] text-amber-500 font-semibold">
                {piece.pointValue > 0 ? `${piece.pointValue} pt${piece.pointValue > 1 ? 's' : ''}` : '★ King'}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Playground — desktop: 3 col, mobile: stacked */}
        <div className="flex flex-col lg:grid lg:grid-cols-[240px_auto_240px] gap-5 items-start">

          {/* Left panel */}
          <div className="w-full bg-background-secondary border-2 border-amber-900/20 dark:border-amber-200/10 rounded-2xl p-5 flex flex-col gap-4">

            <div className="text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePiece.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.18 }}
                  className="text-6xl sm:text-7xl leading-none mb-3"
                  style={{ filter: 'drop-shadow(0 4px 12px rgba(245,200,66,0.35))' }}
                >
                  {activePiece.symbol}
                </motion.div>
              </AnimatePresence>
              <h2 className="text-xl font-extrabold text-text-primary">{activePiece.name}</h2>
              <p className="text-amber-500 text-xs font-semibold mt-1">{activePiece.tagline}</p>
              <div className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-full px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mt-2">
                {activePiece.emoji}{' '}
                {activePiece.pointValue > 0 ? `${activePiece.pointValue} points` : 'Most Important'}
              </div>
            </div>

            <div className="h-px bg-amber-900/10 dark:bg-amber-200/10" />

            <div>
              <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">How It Moves</div>
              <p className="text-sm text-text-secondary leading-relaxed">{activePiece.movementDescription}</p>
            </div>

            <div className="h-px bg-amber-900/10 dark:bg-amber-200/10" />

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${pieceRow}-${pieceCol}-${activePiece.id}`}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-extrabold text-amber-500"
                >
                  {validMoves.length}
                </motion.div>
              </AnimatePresence>
              <div className="text-xs text-text-muted mt-1">
                moves from <span className="text-amber-500 font-semibold">{currentSquare}</span>
              </div>
            </div>
          </div>

          {/* Board */}
          <div className="flex flex-col items-center gap-3 w-full">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gridTemplateRows: 'repeat(8, 1fr)',
                width: 'min(480px, calc(100vw - 40px))',
                height: 'min(480px, calc(100vw - 40px))',
                border: '3px solid #8B6534',
                borderRadius: '3px',
                overflow: 'hidden',
                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                margin: '0 auto',
              }}
            >
              {Array.from({ length: 8 }, (_, row) =>
                Array.from({ length: 8 }, (_, col) => {
                  const isLight = (row + col) % 2 === 0;
                  const isSelected = row === pieceRow && col === pieceCol;
                  const isValid = validSet.has(`${row}-${col}`);
                  return (
                    <div
                      key={`${row}-${col}`}
                      onClick={() => handleSquareClick(row, col)}
                      className="relative flex items-center justify-center cursor-pointer select-none"
                      style={{
                        background: isSelected
                          ? 'rgba(246,246,105,0.85)'
                          : isLight ? '#F0D9B5' : '#B58863',
                        transition: 'filter 0.1s',
                      }}
                    >
                      {isSelected && (
                        <motion.span
                          key={`piece-${activePiece.id}`}
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          className="leading-none"
                          style={{
                            fontSize: 'clamp(20px, 5vw, 36px)',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
                          }}
                        >
                          {activePiece.symbol}
                        </motion.span>
                      )}
                      {isValid && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                          <div
                            className="rounded-full bg-black/20"
                            style={{ width: '32%', height: '32%' }}
                          />
                        </motion.div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <p className="text-xs text-text-muted text-center">
              {validMoves.length} moves from{' '}
              <span className="text-amber-500 font-semibold">{currentSquare}</span>{' '}
              — click any square to move there
            </p>
          </div>

          {/* Right panel */}
          <div className="w-full bg-background-secondary border-2 border-amber-900/20 dark:border-amber-200/10 rounded-2xl p-5 flex flex-col gap-4">

            <div>
              <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">Fun Fact</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePiece.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 text-sm text-text-secondary leading-relaxed"
                >
                  {activePiece.funFact}
                </motion.div>
              </AnimatePresence>
            </div>

            {moveHistory.length > 0 && (
              <>
                <div className="h-px bg-amber-900/10 dark:bg-amber-200/10" />
                <div>
                  <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">
                    Move History
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {moveHistory.map((m, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-xs font-semibold px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
                      >
                        {m}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="h-px bg-amber-900/10 dark:bg-amber-200/10" />

            <div>
              <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">
                Squares Explored ({visitedSquares.size}/64)
              </div>
              <div
                className="grid gap-[2px] w-full"
                style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}
              >
                {Array.from({ length: 64 }, (_, i) => {
                  const r = Math.floor(i / 8);
                  const c = i % 8;
                  return (
                    <div
                      key={i}
                      className="aspect-square rounded-[2px] transition-colors duration-300"
                      style={{
                        background: visitedSquares.has(`${r}-${c}`)
                          ? 'rgba(245,200,66,0.5)'
                          : 'rgba(245,200,66,0.06)',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <motion.button
              onClick={handleReset}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 rounded-xl border-2 border-amber-400/30 bg-amber-50/5 text-amber-500 font-bold text-sm hover:bg-amber-50/10 transition-colors"
            >
              ↺ Reset to Center
            </motion.button>
          </div>

        </div>
      </div>
    </div>
  );
}
