import type { Lesson } from '@/types/chess';
import { startingBoard, emptyBoard } from './boardUtils';

const eb = () => emptyBoard();

export const LESSONS: Lesson[] = [

  // ── 1. The Board ────────────────────────────────────────────────────────────
  {
    id: 'the-board', title: 'The Chess Board', icon: '♟️',
    description: 'Learn about the 8×8 board, squares, files, and ranks.', difficulty: 'beginner',
    steps: [
      {
        title: 'Welcome to the Chess Board!',
        content: 'Chess is played on a special board with **64 squares** arranged in 8 rows and 8 columns. The squares alternate between **light** and **dark** colors!\n\nWhen you sit down to play, make sure there\'s a **light square in the bottom-right corner** nearest to you. Remember: "Light on the right!"',
        boardState: startingBoard(),
      },
      {
        title: 'Files — the Columns',
        content: 'The **columns** going up and down are called **files**. Each file has a letter name:\n\n**a, b, c, d, e, f, g, h** — going from left to right.\n\nSo the leftmost column is the "a-file" and the rightmost is the "h-file". The **d-file** is highlighted here.',
        boardState: startingBoard(),
        highlightedSquares: [0, 1, 2, 3, 4, 5, 6, 7].map(r => ({ row: r, col: 3, type: 'selected' as const })),
      },
      {
        title: 'Ranks — the Rows',
        content: 'The **rows** going left and right are called **ranks**. Each rank has a number from **1 to 8**.\n\nRank 1 is at the bottom (where White\'s pieces start) and rank 8 is at the top (where Black\'s pieces start). The **5th rank** is highlighted.',
        boardState: startingBoard(),
        highlightedSquares: [0, 1, 2, 3, 4, 5, 6, 7].map(c => ({ row: 3, col: c, type: 'selected' as const })),
      },
      {
        title: 'The Center is Special!',
        content: 'The 4 squares in the very middle of the board are called **the center**: d4, e4, d5, and e5.\n\nControlling these squares is super important in chess! Strong players always try to put their pieces near the center early in the game.',
        boardState: { squares: eb(), turn: 'white' },
        highlightedSquares: [
          { row: 3, col: 3, type: 'valid-move' }, { row: 3, col: 4, type: 'valid-move' },
          { row: 4, col: 3, type: 'valid-move' }, { row: 4, col: 4, type: 'valid-move' },
        ],
      },
    ],
  },

  // ── 2. Meet the Pieces ───────────────────────────────────────────────────────
  {
    id: 'the-pieces', title: 'Meet the Pieces', icon: '♞',
    description: 'Learn all 6 chess pieces and how they move.', difficulty: 'beginner',
    steps: [
      {
        title: 'Your Chess Army!',
        content: 'Each player starts with **16 pieces**:\n\n- 1 **King** ♔\n- 1 **Queen** ♕\n- 2 **Rooks** ♖\n- 2 **Bishops** ♗\n- 2 **Knights** ♘\n- 8 **Pawns** ♙\n\nThe pieces start in the same position every game. **White always moves first!**',
        boardState: startingBoard(),
      },
      {
        title: 'The Pawn — Your Foot Soldiers',
        content: '**Pawns** march **forward** one square at a time. On their very first move, they can go **two squares** forward.\n\nHere\'s the tricky part: pawns **capture diagonally** — one square forward and to the side. They cannot capture straight ahead!',
        boardState: { squares: (() => { const b = eb(); b[4][3] = { type: 'P', color: 'white' }; return b; })(), turn: 'white' },
        highlightedSquares: [
          { row: 4, col: 3, type: 'selected' }, { row: 3, col: 3, type: 'valid-move' },
          { row: 2, col: 3, type: 'valid-move' }, { row: 3, col: 2, type: 'capture' }, { row: 3, col: 4, type: 'capture' },
        ],
      },
      {
        title: 'The Rook — The Straight Shooter',
        content: '**Rooks** move in **straight lines** — up, down, left, or right — as many squares as they want!\n\nRooks are most powerful when they have open files (no pawns blocking them). Two rooks working together are unstoppable!',
        boardState: { squares: (() => { const b = eb(); b[3][3] = { type: 'R', color: 'white' }; return b; })(), turn: 'white' },
        highlightedSquares: [
          { row: 3, col: 3, type: 'selected' },
          ...[0,1,2,4,5,6,7].map(c => ({ row: 3, col: c, type: 'valid-move' as const })),
          ...[0,1,2,4,5,6,7].map(r => ({ row: r, col: 3, type: 'valid-move' as const })),
        ],
      },
      {
        title: 'The Bishop — The Diagonal Slider',
        content: '**Bishops** move **diagonally** — any number of squares in a diagonal direction.\n\nEach bishop stays on the **same color square for the entire game!** This is why having bishops on opposite colors (one dark, one light) is so powerful.',
        boardState: { squares: (() => { const b = eb(); b[3][3] = { type: 'B', color: 'white' }; return b; })(), turn: 'white' },
        highlightedSquares: [
          { row: 3, col: 3, type: 'selected' },
          ...[1,2,3].map(i => ({ row: 3-i, col: 3-i, type: 'valid-move' as const })).filter(s => s.row >= 0 && s.col >= 0),
          ...[1,2,3,4].map(i => ({ row: 3+i, col: 3+i, type: 'valid-move' as const })).filter(s => s.row < 8 && s.col < 8),
          ...[1,2,3].map(i => ({ row: 3-i, col: 3+i, type: 'valid-move' as const })).filter(s => s.row >= 0 && s.col < 8),
          ...[1,2,3,4].map(i => ({ row: 3+i, col: 3-i, type: 'valid-move' as const })).filter(s => s.row < 8 && s.col >= 0),
        ],
      },
      {
        title: 'The Knight — The Jumping L-Shape',
        content: '**Knights** move in an **"L" shape**: 2 squares one direction, then 1 square sideways.\n\nThe knight is the ONLY piece that can **jump over** other pieces! This makes it invaluable in crowded positions where other pieces are stuck.',
        boardState: { squares: (() => { const b = eb(); b[3][3] = { type: 'N', color: 'white' }; return b; })(), turn: 'white' },
        highlightedSquares: [
          { row: 3, col: 3, type: 'selected' },
          { row: 1, col: 2, type: 'valid-move' }, { row: 1, col: 4, type: 'valid-move' },
          { row: 2, col: 1, type: 'valid-move' }, { row: 2, col: 5, type: 'valid-move' },
          { row: 4, col: 1, type: 'valid-move' }, { row: 4, col: 5, type: 'valid-move' },
          { row: 5, col: 2, type: 'valid-move' }, { row: 5, col: 4, type: 'valid-move' },
        ],
      },
      {
        title: 'The Queen — The Superpower Piece',
        content: '**The Queen** is the most powerful piece! She can move in **ANY direction** — straight lines AND diagonally — as far as she wants.\n\nThe queen is worth about **9 pawns**. Losing her early is a huge disadvantage. Protect her!',
        boardState: { squares: (() => { const b = eb(); b[3][3] = { type: 'Q', color: 'white' }; return b; })(), turn: 'white' },
        highlightedSquares: [
          { row: 3, col: 3, type: 'selected' },
          ...[0,1,2,4,5,6,7].map(c => ({ row: 3, col: c, type: 'valid-move' as const })),
          ...[0,1,2,4,5,6,7].map(r => ({ row: r, col: 3, type: 'valid-move' as const })),
          ...[1,2,3].map(i => ({ row: 3-i, col: 3-i, type: 'valid-move' as const })).filter(s => s.row >= 0 && s.col >= 0),
          ...[1,2,3,4].map(i => ({ row: 3+i, col: 3+i, type: 'valid-move' as const })).filter(s => s.row < 8 && s.col < 8),
          ...[1,2,3].map(i => ({ row: 3-i, col: 3+i, type: 'valid-move' as const })).filter(s => s.row >= 0 && s.col < 8),
          ...[1,2,3,4].map(i => ({ row: 3+i, col: 3-i, type: 'valid-move' as const })).filter(s => s.row < 8 && s.col >= 0),
        ],
      },
      {
        title: 'The King — Protect Him at All Costs!',
        content: '**The King** can move ONE square in any direction. He\'s slow, but he\'s the most important piece!\n\nIf your king is ever trapped with no way to escape, you lose the game — that\'s **checkmate**. Your entire strategy revolves around protecting your king while attacking your opponent\'s.',
        boardState: { squares: (() => { const b = eb(); b[3][3] = { type: 'K', color: 'white' }; return b; })(), turn: 'white' },
        highlightedSquares: [
          { row: 3, col: 3, type: 'selected' },
          { row: 2, col: 2, type: 'valid-move' }, { row: 2, col: 3, type: 'valid-move' }, { row: 2, col: 4, type: 'valid-move' },
          { row: 3, col: 2, type: 'valid-move' }, { row: 3, col: 4, type: 'valid-move' },
          { row: 4, col: 2, type: 'valid-move' }, { row: 4, col: 3, type: 'valid-move' }, { row: 4, col: 4, type: 'valid-move' },
        ],
      },
    ],
  },

  // ── 3. Your First Game ───────────────────────────────────────────────────────
  {
    id: 'your-first-game', title: 'Playing Your First Game', icon: '🎮',
    description: 'Learn how to set up, take turns, capture pieces, and play a full game.', difficulty: 'beginner',
    steps: [
      {
        title: 'Setting Up — The Starting Position',
        content: 'Before every game, pieces are placed in the same exact starting position.\n\nKey tips:\n- **Light square on the right** (when facing the board)\n- **Queens on their own color** — white queen on a light square, black queen on dark\n- Rooks in the corners, knights next to them, bishops next to knights, then queen and king\n\nMemorize this setup — it\'s the foundation of every game!',
        boardState: startingBoard(),
      },
      {
        title: 'White Moves First — Always!',
        content: 'In chess, **White always moves first**. Then Black responds. Then White again — alternating until the game ends.\n\nEach turn, you move exactly **one piece** to a new square. You cannot skip your turn or pass.\n\nA popular first move is **1.e4** — pushing the white pawn two squares to the center. This is the most popular opening move in history!',
        boardState: (() => {
          const b = startingBoard().squares.map(r => [...r]);
          b[4][4] = b[6][4]; b[6][4] = null;
          return { squares: b, turn: 'black' as const };
        })(),
        highlightedSquares: [{ row: 4, col: 4, type: 'last-move' as const }, { row: 6, col: 4, type: 'hint' as const }],
      },
      {
        title: 'Capturing — Remove Enemy Pieces!',
        content: 'To **capture** an enemy piece, move your piece onto the square it occupies — the captured piece is removed from the board!\n\n- You can never capture your **own** pieces\n- Captures are **optional** — you don\'t have to capture unless it\'s the best move\n- **Pawns capture diagonally** — here the white pawn can take either black pawn to its front-left or front-right',
        boardState: { squares: (() => {
          const b = eb();
          b[3][4] = { type: 'P', color: 'white' };
          b[2][3] = { type: 'P', color: 'black' };
          b[2][5] = { type: 'P', color: 'black' };
          b[7][4] = { type: 'K', color: 'white' };
          b[0][4] = { type: 'K', color: 'black' };
          return b;
        })(), turn: 'white' },
        highlightedSquares: [
          { row: 3, col: 4, type: 'selected' as const },
          { row: 2, col: 3, type: 'capture' as const },
          { row: 2, col: 5, type: 'capture' as const },
          { row: 2, col: 4, type: 'valid-move' as const },
        ],
      },
      {
        title: 'Three Phases of Every Game',
        content: 'Every chess game has three natural phases:\n\n- **Opening** (moves 1–15): Get your pieces out, control the center, castle your king\n- **Middlegame**: The main battle — use tactics, attack your opponent\'s weaknesses, defend your own\n- **Endgame**: Few pieces remain, pawns push toward promotion, kings become active fighters\n\nMastering all three phases is the key to becoming a complete chess player. The lessons ahead cover each one!',
        boardState: (() => {
          const b = startingBoard().squares.map(r => [...r]);
          b[4][4] = b[6][4]; b[6][4] = null;
          b[4][3] = b[6][3]; b[6][3] = null;
          b[3][4] = b[1][4]; b[1][4] = null;
          b[3][3] = b[1][3]; b[1][3] = null;
          b[5][5] = b[7][6]; b[7][6] = null;
          b[2][2] = b[0][1]; b[0][1] = null;
          return { squares: b, turn: 'white' as const };
        })(),
        highlightedSquares: [
          { row: 3, col: 3, type: 'valid-move' as const }, { row: 3, col: 4, type: 'valid-move' as const },
          { row: 4, col: 3, type: 'valid-move' as const }, { row: 4, col: 4, type: 'valid-move' as const },
        ],
      },
    ],
  },

  // ── 4. Check & Checkmate ────────────────────────────────────────────────────
  {
    id: 'how-to-win', title: 'Check & Checkmate', icon: '🏆',
    description: 'Learn about check, checkmate, stalemate, and drawing.', difficulty: 'beginner',
    steps: [
      {
        title: 'The Goal of Chess',
        content: 'The goal of chess is to **trap your opponent\'s king** so it cannot escape. This is called **CHECKMATE** — and it immediately ends the game!\n\nYou\'re not trying to capture all of their pieces. You\'re trying to trap their king. A single checkmate wins, no matter how many pieces each side has.',
        boardState: startingBoard(),
      },
      {
        title: 'What is Check?',
        content: '**Check** means your king is being attacked right now!\n\nWhen your king is in check, you MUST deal with it — no exceptions. You have three ways to escape:\n1. **Move your king** to a safe square\n2. **Block** the attack with another piece\n3. **Capture** the attacking piece',
        boardState: { squares: (() => { const b = eb(); b[7][4] = { type: 'K', color: 'white' }; b[1][4] = { type: 'Q', color: 'black' }; return b; })(), turn: 'white' },
        highlightedSquares: [{ row: 7, col: 4, type: 'check' as const }, { row: 1, col: 4, type: 'selected' as const }],
      },
      {
        title: 'What is Checkmate?',
        content: '**Checkmate** is when the king is in check AND cannot escape in any way. The game ends immediately — the player who delivers checkmate wins!\n\nHere the black queen attacks the white king, and every possible escape square is covered. White has no way out!',
        boardState: { squares: (() => {
          const b = eb();
          b[7][4] = { type: 'K', color: 'white' };
          b[7][5] = { type: 'B', color: 'white' };
          b[6][3] = { type: 'P', color: 'white' };
          b[6][4] = { type: 'P', color: 'white' };
          b[6][5] = { type: 'P', color: 'white' };
          b[4][7] = { type: 'Q', color: 'black' };
          b[0][5] = { type: 'B', color: 'black' };
          return b;
        })(), turn: 'white' },
        highlightedSquares: [{ row: 7, col: 4, type: 'check' as const }, { row: 4, col: 7, type: 'selected' as const }],
      },
      {
        title: 'What is Stalemate?',
        content: '**Stalemate** happens when it\'s your turn, your king is NOT in check, but you have **NO legal moves** at all!\n\nStalemate is a **draw** — nobody wins! This is one of chess\'s biggest traps: a winning player can accidentally give stalemate and throw away the win. Always make sure your opponent has a legal move!',
        boardState: { squares: (() => {
          const b = eb();
          b[0][7] = { type: 'K', color: 'black' };
          b[1][5] = { type: 'Q', color: 'white' };
          b[2][6] = { type: 'K', color: 'white' };
          return b;
        })(), turn: 'black' },
        highlightedSquares: [
          { row: 0, col: 7, type: 'selected' as const },
          { row: 1, col: 5, type: 'check' as const },
          { row: 2, col: 6, type: 'check' as const },
        ],
      },
    ],
  },

  // ── 5. Special Moves ─────────────────────────────────────────────────────────
  {
    id: 'special-moves', title: 'Special Moves', icon: '✨',
    description: 'Castling, en passant, and pawn promotion explained.', difficulty: 'beginner',
    steps: [
      {
        title: 'Castling — King\'s Secret Move!',
        content: '**Castling** is the only move where TWO pieces move at once — your **king** slides 2 squares toward a rook, and the rook jumps to the other side!\n\nYou CAN castle if:\n- Neither piece has moved before\n- No pieces are between them\n- The king is not in check\n- The king doesn\'t pass through an attacked square',
        boardState: { squares: (() => {
          const b = eb();
          b[7][4] = { type: 'K', color: 'white' }; b[7][7] = { type: 'R', color: 'white' };
          b[0][4] = { type: 'K', color: 'black' }; b[0][0] = { type: 'R', color: 'black' };
          return b;
        })(), turn: 'white' },
        highlightedSquares: [
          { row: 7, col: 4, type: 'selected' as const }, { row: 7, col: 6, type: 'valid-move' as const }, { row: 7, col: 7, type: 'valid-move' as const },
        ],
      },
      {
        title: 'Pawn Promotion — Become a Queen!',
        content: '**Pawn Promotion**: If your pawn reaches the other end of the board, it transforms into ANY piece you choose!\n\nAlmost everyone picks the **queen** — the most powerful piece. You can even have TWO queens at the same time!\n\nChoosing a knight instead of a queen is called **underpromotion** — rare, but sometimes the only winning move!',
        boardState: { squares: (() => {
          const b = eb();
          b[1][3] = { type: 'P', color: 'white' };
          b[7][4] = { type: 'K', color: 'white' }; b[0][4] = { type: 'K', color: 'black' };
          return b;
        })(), turn: 'white' },
        highlightedSquares: [{ row: 1, col: 3, type: 'selected' as const }, { row: 0, col: 3, type: 'valid-move' as const }],
      },
      {
        title: 'En Passant — The Sneakiest Capture!',
        content: '**En Passant** (French for "in passing") is chess\'s trickiest move!\n\nIf an enemy pawn moves **2 squares** and lands right beside your pawn on the **5th rank**, you can capture it AS IF it had only moved 1 square — diagonally behind it.\n\nBut you must do this on your VERY NEXT MOVE or the chance is gone forever!',
        boardState: { squares: (() => {
          const b = eb();
          b[3][4] = { type: 'P', color: 'white' }; b[3][5] = { type: 'P', color: 'black' };
          b[7][4] = { type: 'K', color: 'white' }; b[0][4] = { type: 'K', color: 'black' };
          return b;
        })(), turn: 'white' },
        highlightedSquares: [
          { row: 3, col: 4, type: 'selected' as const },
          { row: 3, col: 5, type: 'check' as const },
          { row: 2, col: 5, type: 'valid-move' as const },
        ],
      },
    ],
  },

  // ── 6. Opening Principles ────────────────────────────────────────────────────
  {
    id: 'opening-play', title: 'Opening Principles', icon: '🚀',
    description: 'Master the fundamental rules every great opening follows.', difficulty: 'beginner',
    steps: [
      {
        title: 'Control the Center!',
        content: 'In chess, the most important area is the **center** — the squares e4, d4, e5, and d5.\n\nPieces in the center control more squares and have more options. A pawn in the center cramps your opponent and gives your pieces room to breathe.\n\nAlways ask yourself: "Am I fighting for the center?" Your first 1-2 pawn moves should target these four squares.',
        boardState: { squares: (() => {
          const b = startingBoard().squares.map(r => [...r]);
          b[4][4] = b[6][4]; b[6][4] = null;
          return b;
        })(), turn: 'black' },
        highlightedSquares: [
          { row: 3, col: 3, type: 'valid-move' as const }, { row: 3, col: 4, type: 'valid-move' as const },
          { row: 4, col: 3, type: 'valid-move' as const }, { row: 4, col: 4, type: 'selected' as const },
        ],
      },
      {
        title: 'Develop Your Pieces!',
        content: '**Development** means moving pieces off their starting squares to active positions where they influence the game.\n\nGolden rules of development:\n- Move **knights before bishops** (they have less flexibility)\n- Don\'t move the **same piece twice** in the opening\n- Don\'t bring your **queen out too early** (it gets chased)\n- Every turn, develop a new piece!\n\nHere white has developed the knight and bishop efficiently.',
        boardState: { squares: (() => {
          const b = startingBoard().squares.map(r => [...r]);
          b[4][4] = b[6][4]; b[6][4] = null;
          b[5][5] = b[7][6]; b[7][6] = null;
          b[5][2] = b[7][5]; b[7][5] = null;
          return b;
        })(), turn: 'black' },
        highlightedSquares: [
          { row: 5, col: 5, type: 'valid-move' as const },
          { row: 5, col: 2, type: 'valid-move' as const },
        ],
      },
      {
        title: 'Castle Early — Keep Your King Safe!',
        content: 'Your **king is in danger** in the center during the opening — active pieces on open files can attack it!\n\n**Castle within the first 10 moves** to tuck your king safely behind pawns. After castling:\n- Your king is protected by 3 pawns\n- Your rook moves toward the center\n- You\'re ready for the middlegame!\n\n👑 A safe king early means a winning endgame later.',
        boardState: { squares: (() => {
          const b = eb();
          b[7][6] = { type: 'K', color: 'white' };
          b[7][5] = { type: 'R', color: 'white' };
          b[6][5] = { type: 'P', color: 'white' }; b[6][6] = { type: 'P', color: 'white' }; b[6][7] = { type: 'P', color: 'white' };
          b[0][4] = { type: 'K', color: 'black' };
          return b;
        })(), turn: 'white' },
        highlightedSquares: [
          { row: 7, col: 6, type: 'selected' as const },
          { row: 6, col: 5, type: 'valid-move' as const }, { row: 6, col: 6, type: 'valid-move' as const }, { row: 6, col: 7, type: 'valid-move' as const },
        ],
      },
      {
        title: 'The Opening Trinity',
        content: 'Every great opening follows three principles — remember these and you\'ll always start well:\n\n1. **Fight for the center** — move central pawns (e4/d4 or e5/d5)\n2. **Develop your pieces** — knights and bishops to active squares\n3. **Castle early** — get your king to safety\n\nIf your opponent breaks these rules (e.g., moves the same piece twice, brings queen out early), **punish them** by controlling more of the board! Now let\'s look at some popular openings in the Rules & Concepts section.',
        boardState: startingBoard(),
        highlightedSquares: [
          { row: 3, col: 3, type: 'valid-move' as const }, { row: 3, col: 4, type: 'valid-move' as const },
          { row: 4, col: 3, type: 'valid-move' as const }, { row: 4, col: 4, type: 'valid-move' as const },
        ],
      },
    ],
  },

  // ── 7. Middlegame Tactics ────────────────────────────────────────────────────
  {
    id: 'middlegame-tactics', title: 'Middlegame Tactics', icon: '⚡',
    description: 'Learn the four most powerful chess tactics: fork, pin, skewer, and discovered attack.', difficulty: 'intermediate',
    steps: [
      {
        title: 'The Fork — One Move, Two Threats!',
        content: 'A **fork** is when ONE piece attacks TWO (or more) enemy pieces at the same time!\n\nYour opponent can only move one piece per turn — so they can\'t defend both. You win material for free!\n\n**Knights are the best forkers** because they attack non-adjacent squares and can\'t be blocked. Here, the white knight on d5 attacks BOTH the black king (must escape!) AND the black queen — winning the queen for free!',
        boardState: { squares: (() => {
          const b = eb();
          b[3][3] = { type: 'N', color: 'white' };  // d5
          b[1][4] = { type: 'K', color: 'black' };  // e7
          b[4][5] = { type: 'Q', color: 'black' };  // f4
          b[7][0] = { type: 'K', color: 'white' };  // a1
          return b;
        })(), turn: 'white' },
        highlightedSquares: [
          { row: 3, col: 3, type: 'selected' as const },
          { row: 1, col: 4, type: 'check' as const },
          { row: 4, col: 5, type: 'capture' as const },
        ],
      },
      {
        title: 'The Pin — Frozen in Place!',
        content: 'A **pin** is when a piece can\'t move because doing so would expose a more valuable piece behind it!\n\n- **Absolute pin**: piece can\'t move at all — moving would expose the king to check (illegal!)\n- **Relative pin**: piece can move, but doing so loses something more valuable behind it\n\nHere, the white rook pins the black knight to the king on the e-file. The knight cannot move — it\'s absolutely pinned! White can attack the knight freely.',
        boardState: { squares: (() => {
          const b = eb();
          b[7][4] = { type: 'R', color: 'white' };  // e1
          b[3][4] = { type: 'N', color: 'black' };  // e5
          b[0][4] = { type: 'K', color: 'black' };  // e8
          b[7][0] = { type: 'K', color: 'white' };  // a1
          return b;
        })(), turn: 'white' },
        highlightedSquares: [
          { row: 7, col: 4, type: 'selected' as const },
          { row: 3, col: 4, type: 'capture' as const },
          { row: 0, col: 4, type: 'check' as const },
          ...[1,2,4,5,6].map(r => ({ row: r, col: 4, type: 'valid-move' as const })),
        ],
      },
      {
        title: 'The Skewer — Hit What\'s Behind!',
        content: 'A **skewer** is like a reverse pin! You attack a very **valuable piece directly** — it has to move — and then you capture the less valuable piece hiding behind it!\n\n- Attack the king → capture the queen behind it\n- Attack the queen → capture the rook behind it\n\nHere, the white rook attacks the black king on the back rank. The king MUST move — and then white captures the black rook sitting on h8!',
        boardState: { squares: (() => {
          const b = eb();
          b[0][0] = { type: 'R', color: 'white' };  // a8
          b[0][2] = { type: 'K', color: 'black' };  // c8
          b[0][7] = { type: 'R', color: 'black' };  // h8
          b[7][4] = { type: 'K', color: 'white' };  // e1
          return b;
        })(), turn: 'white' },
        highlightedSquares: [
          { row: 0, col: 0, type: 'selected' as const },
          { row: 0, col: 2, type: 'check' as const },
          { row: 0, col: 7, type: 'capture' as const },
        ],
      },
      {
        title: 'Discovered Attack — Hidden Firepower!',
        content: 'A **discovered attack** happens when you move one piece and it UNCOVERS an attack by another piece behind it!\n\nThe moved piece can create its OWN threat at the same time — a **double attack** nearly impossible to defend!\n\nHere: the white knight moves from e3 AND attacks the black queen on d5. But moving the knight also REVEALS the white bishop\'s diagonal attack on the black king at g5. Black can\'t handle both threats — White wins material!',
        boardState: { squares: (() => {
          const b = eb();
          b[7][2] = { type: 'B', color: 'white' };  // c1
          b[5][4] = { type: 'N', color: 'white' };  // e3
          b[3][6] = { type: 'K', color: 'black' };  // g5
          b[3][3] = { type: 'Q', color: 'black' };  // d5
          b[7][4] = { type: 'K', color: 'white' };  // e1
          return b;
        })(), turn: 'white' },
        highlightedSquares: [
          { row: 5, col: 4, type: 'selected' as const },
          { row: 7, col: 2, type: 'hint' as const },
          { row: 3, col: 3, type: 'capture' as const },
          { row: 3, col: 6, type: 'check' as const },
        ],
      },
    ],
  },

  // ── 8. Endgame Basics ────────────────────────────────────────────────────────
  {
    id: 'endgame-basics', title: 'Endgame Fundamentals', icon: '👑',
    description: 'King activity, pawn races, opposition, and delivering checkmate.', difficulty: 'intermediate',
    steps: [
      {
        title: 'Wake Up Your King!',
        content: 'During the opening and middlegame, **keep your king safe** — hide it behind pawns after castling.\n\nBut in the **endgame**, the king becomes a **powerful fighting piece!** With fewer pieces left, there\'s much less danger — so march your king toward the center!\n\nA centralized king controls 8 squares and helps push pawns forward or stop enemy pawns. A king hiding in the corner is wasting its potential!',
        boardState: { squares: (() => {
          const b = eb();
          b[4][4] = { type: 'K', color: 'white' };  // e4 — centralized!
          b[0][4] = { type: 'K', color: 'black' };  // e8 — passive
          return b;
        })(), turn: 'white' },
        highlightedSquares: [
          { row: 4, col: 4, type: 'selected' as const },
          ...[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
            .map(([dr,dc]) => ({ row: 4+dr, col: 4+dc, type: 'valid-move' as const }))
            .filter(s => s.row >= 0 && s.row < 8 && s.col >= 0 && s.col < 8),
        ],
      },
      {
        title: 'The Pawn Race — Who Promotes First?',
        content: 'When both sides have **passed pawns** (no enemy pawns blocking them), a race to promote begins!\n\nThe player who promotes first and gets a new queen usually wins.\n\n**The Square Rule:** Draw a square from the pawn to the promotion square. If the enemy king is inside that square, it can catch the pawn. If not, the pawn promotes!\n\nHere both pawns are racing. Count carefully — who wins?',
        boardState: { squares: (() => {
          const b = eb();
          b[2][4] = { type: 'P', color: 'white' };  // e6 — almost there!
          b[5][3] = { type: 'P', color: 'black' };  // d3 — racing down
          b[7][0] = { type: 'K', color: 'white' };
          b[0][7] = { type: 'K', color: 'black' };
          return b;
        })(), turn: 'white' },
        highlightedSquares: [
          { row: 2, col: 4, type: 'selected' as const },
          { row: 0, col: 4, type: 'valid-move' as const },
          { row: 5, col: 3, type: 'check' as const },
          { row: 7, col: 3, type: 'capture' as const },
        ],
      },
      {
        title: 'Opposition — The Invisible Force',
        content: '**Opposition** is when two kings face each other with an ODD number of squares between them on the same rank or file.\n\nThe player whose **turn it is** loses the opposition — they must step aside.\n\n**Why it matters:** In K+P endgames, having the opposition determines whether you win or draw. White\'s king on e5 faces the black king on e7 with one square (e6) between them.\n\nIf it\'s Black\'s turn: Black must step aside, White\'s pawn advances → White wins!',
        boardState: { squares: (() => {
          const b = eb();
          b[3][4] = { type: 'K', color: 'white' };  // e5
          b[1][4] = { type: 'K', color: 'black' };  // e7
          b[4][4] = { type: 'P', color: 'white' };  // e4
          return b;
        })(), turn: 'black' },
        highlightedSquares: [
          { row: 3, col: 4, type: 'selected' as const },
          { row: 1, col: 4, type: 'check' as const },
          { row: 2, col: 4, type: 'hint' as const },
        ],
      },
      {
        title: 'Delivering Checkmate with Queen',
        content: 'With **King + Queen vs lone King**, you can always force checkmate — but it takes technique!\n\nThe method:\n1. **Cut off the king** using your queen to limit its squares\n2. **Bring your king** to help corner the enemy\n3. **Deliver checkmate** with the queen while king covers escapes\n\nHere is the final position: the white queen on g8 gives check. Black\'s king is in the corner — g7 is covered by both king and queen, h7 is covered by the queen\'s diagonal. Checkmate!',
        boardState: { squares: (() => {
          const b = eb();
          b[1][5] = { type: 'K', color: 'white' };  // f7
          b[0][6] = { type: 'Q', color: 'white' };  // g8
          b[0][7] = { type: 'K', color: 'black' };  // h8
          return b;
        })(), turn: 'black' },
        highlightedSquares: [
          { row: 0, col: 7, type: 'check' as const },
          { row: 0, col: 6, type: 'selected' as const },
          { row: 1, col: 6, type: 'capture' as const },
          { row: 1, col: 7, type: 'capture' as const },
        ],
      },
    ],
  },

];

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find(l => l.id === id);
}
