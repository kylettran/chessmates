'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { PIECES, getPieceSymbol } from '@/lib/chess/pieces';
import { startingBoard, singlePieceBoard, getValidMoves, squareToLabel } from '@/lib/chess/boardUtils';
import type { PieceInfo } from '@/types/chess';

const FULL_BOARD = startingBoard().squares;

// Pick the most central white starting square for each piece
function getStartSquare(piece: PieceInfo) {
  const whites = piece.startingSquares.filter(s => s.row >= 4);
  if (whites.length === 0) return piece.startingSquares[0];
  // For pawns (8 squares), pick col 3 (d-pawn)
  const center = whites.find(s => s.col === 3) ?? whites[Math.floor(whites.length / 2)];
  return center;
}

export default function PiecesPage() {
  const [activePieceInfo, setActivePieceInfo] = useState<PieceInfo | null>(null);
  const [pieceRow, setPieceRow] = useState(0);
  const [pieceCol, setPieceCol] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [visitedSquares, setVisitedSquares] = useState<Set<string>>(new Set());

  const singleBoard = useMemo(
    () => activePieceInfo
      ? singlePieceBoard({ type: activePieceInfo.type, color: 'white' }, { row: pieceRow, col: pieceCol }).squares
      : null,
    [activePieceInfo, pieceRow, pieceCol]
  );
  const validMoves = useMemo(
    () => singleBoard ? getValidMoves(singleBoard, { row: pieceRow, col: pieceCol }) : [],
    [singleBoard, pieceRow, pieceCol]
  );
  const validSet = useMemo(
    () => new Set(validMoves.map(m => `${m.row}-${m.col}`)),
    [validMoves]
  );

  const enterPieceMode = useCallback((piece: PieceInfo) => {
    const sq = getStartSquare(piece);
    setActivePieceInfo(piece);
    setPieceRow(sq.row);
    setPieceCol(sq.col);
    setMoveHistory([]);
    setVisitedSquares(new Set([`${sq.row}-${sq.col}`]));
  }, []);

  const handleFullBoardClick = useCallback((row: number, col: number) => {
    const piece = FULL_BOARD[row][col];
    if (!piece) return;
    const info = PIECES.find(p => p.type === piece.type);
    if (info) enterPieceMode(info);
  }, [enterPieceMode]);

  const handleSingleBoardClick = useCallback((row: number, col: number) => {
    if (row === pieceRow && col === pieceCol) return;
    if (!validSet.has(`${row}-${col}`)) return;
    const from = squareToLabel({ row: pieceRow, col: pieceCol });
    const to = squareToLabel({ row, col });
    setMoveHistory(prev => [...prev, `${from}→${to}`].slice(-6));
    setVisitedSquares(prev => new Set([...prev, `${row}-${col}`]));
    setPieceRow(row);
    setPieceCol(col);
  }, [pieceRow, pieceCol, validSet]);

  const handleReset = useCallback(() => {
    setActivePieceInfo(null);
    setMoveHistory([]);
    setVisitedSquares(new Set());
  }, []);

  const currentSquare = activePieceInfo ? squareToLabel({ row: pieceRow, col: pieceCol }) : null;

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
            Click any piece on the board to learn about it and see where it can move!
          </p>
        </div>

        {/* Piece picker */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-8 flex-wrap">
          {PIECES.map(piece => (
            <motion.button
              key={piece.id}
              onClick={() => enterPieceMode(piece)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-1 px-2 sm:px-4 py-3 rounded-2xl border-2 transition-colors min-w-[64px] sm:min-w-[80px] cursor-grab active:cursor-grabbing touch-manipulation ${
                activePieceInfo?.id === piece.id
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
            <AnimatePresence mode="wait">
              {activePieceInfo ? (
                <motion.div
                  key={activePieceInfo.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-col gap-4"
                >
                  <div className="text-center">
                    <div
                      className="text-6xl sm:text-7xl leading-none mb-3"
                      style={{ filter: 'drop-shadow(0 4px 12px rgba(245,200,66,0.35))' }}
                    >
                      {activePieceInfo.symbol}
                    </div>
                    <h2 className="text-xl font-extrabold text-text-primary">{activePieceInfo.name}</h2>
                    <p className="text-amber-500 text-xs font-semibold mt-1">{activePieceInfo.tagline}</p>
                    <div className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-full px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mt-2">
                      {activePieceInfo.emoji}{' '}
                      {activePieceInfo.pointValue > 0 ? `${activePieceInfo.pointValue} points` : 'Most Important'}
                    </div>
                  </div>

                  <div className="h-px bg-amber-900/10 dark:bg-amber-200/10" />

                  <div>
                    <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">How It Moves</div>
                    <p className="text-sm text-text-secondary leading-relaxed">{activePieceInfo.movementDescription}</p>
                  </div>

                  {currentSquare && (
                    <>
                      <div className="h-px bg-amber-900/10 dark:bg-amber-200/10" />
                      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 text-center">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${currentSquare}-${validMoves.length}`}
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
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center gap-3 py-8 text-center"
                >
                  <div className="text-5xl opacity-30">♟</div>
                  <p className="text-sm text-text-secondary">
                    Click any piece on the board to learn about it!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
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

                  if (!activePieceInfo) {
                    // Full starting board — click a piece to enter single-piece mode
                    const piece = FULL_BOARD[row][col];
                    return (
                      <div
                        key={`${row}-${col}`}
                        onClick={() => handleFullBoardClick(row, col)}
                        className="group relative flex items-center justify-center select-none transition-[filter] duration-100 hover:brightness-110 touch-manipulation"
                        style={{
                          background: isLight ? '#F0D9B5' : '#B58863',
                          cursor: piece ? 'pointer' : 'default',
                        }}
                      >
                        {piece && (
                          <span
                            className="leading-none transition-transform duration-100 group-hover:scale-110"
                            style={{
                              fontSize: 'clamp(20px, 5.5vw, 40px)',
                              filter:
                                'drop-shadow(0 0 3px rgba(0,0,0,0.95)) drop-shadow(0 0 1px rgba(0,0,0,0.8)) drop-shadow(0 2px 5px rgba(0,0,0,0.6))',
                            }}
                          >
                            {getPieceSymbol(piece.type, piece.color)}
                          </span>
                        )}
                      </div>
                    );
                  }

                  // Single-piece mode
                  const isSelected = row === pieceRow && col === pieceCol;
                  const isValid = validSet.has(`${row}-${col}`);
                  return (
                    <div
                      key={`${row}-${col}`}
                      onClick={() => handleSingleBoardClick(row, col)}
                      className="relative flex items-center justify-center select-none touch-manipulation"
                      style={{
                        background: isSelected
                          ? 'rgba(29, 78, 216, 0.92)'
                          : isLight ? '#F0D9B5' : '#B58863',
                        cursor: isValid ? 'pointer' : 'default',
                      }}
                    >
                      {isSelected && (
                        <motion.span
                          key={`${activePieceInfo.id}-${pieceRow}-${pieceCol}`}
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          className="leading-none"
                          style={{
                            fontSize: 'clamp(28px, 8vw, 52px)',
                            filter:
                              'drop-shadow(0 0 4px rgba(0,0,0,0.95)) drop-shadow(0 0 2px rgba(0,0,0,0.8)) drop-shadow(0 3px 8px rgba(0,0,0,0.6))',
                          }}
                        >
                          {activePieceInfo.symbol}
                        </motion.span>
                      )}
                      {isValid && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                          <div
                            className="rounded-full"
                            style={{
                              width: '36%',
                              height: '36%',
                              background: 'rgba(29, 78, 216, 0.6)',
                            }}
                          />
                        </motion.div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <p className="text-xs text-text-muted text-center">
              {activePieceInfo && currentSquare
                ? `${validMoves.length} moves from ${currentSquare} — click a dot to move`
                : 'Click any piece to learn about it'}
            </p>
          </div>

          {/* Right panel */}
          <div className="w-full bg-background-secondary border-2 border-amber-900/20 dark:border-amber-200/10 rounded-2xl p-5 flex flex-col gap-4">

            {activePieceInfo && (
              <div>
                <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">Fun Fact</div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePieceInfo.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 text-sm text-text-secondary leading-relaxed"
                  >
                    {activePieceInfo.funFact}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {moveHistory.length > 0 && (
              <>
                {activePieceInfo && <div className="h-px bg-amber-900/10 dark:bg-amber-200/10" />}
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

            <div className={moveHistory.length > 0 || activePieceInfo ? 'h-px bg-amber-900/10 dark:bg-amber-200/10' : ''} />

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
              ↺ {activePieceInfo ? 'Back to Full Board' : 'Reset Board'}
            </motion.button>
          </div>

        </div>
      </div>
    </div>
  );
}
