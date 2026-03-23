import type { PieceInfo } from '@/types/chess';

export const PIECES: PieceInfo[] = [
  {
    id: 'king', type: 'K', name: 'King', symbol: '♔', emoji: '👑',
    tagline: 'The Most Important Piece!', pointValue: 0, color: 'white',
    shortDescription: 'The king is the most important piece. If your king is captured, you lose!',
    fullDescription: 'The king is the boss of your chess army! You MUST protect the king at all times. If the king is attacked (that\'s called "check"), you have to get it out of danger right away. If the king is trapped with no way to escape, that\'s "checkmate" — and the game is over!',
    movementDescription: 'The king can move ONE square in any direction — forward, backward, sideways, or diagonally. That\'s 8 possible squares to move to! But it can never move into danger.',
    funFact: '👑 Fun Fact: The king can never be "captured" in chess. The game ends before that happens! When the king is in checkmate, the losing player tips their king over to say "I give up."',
    startingSquares: [{ row: 7, col: 4 }, { row: 0, col: 4 }],
    demoSquare: { row: 3, col: 3 },
  },
  {
    id: 'queen', type: 'Q', name: 'Queen', symbol: '♕', emoji: '💎',
    tagline: 'The Most Powerful Piece!', pointValue: 9, color: 'white',
    shortDescription: 'The queen is the strongest piece on the board — she can move anywhere!',
    fullDescription: 'The queen is like a superpower piece! She can move in ANY direction — forward, backward, sideways, and diagonally — as many squares as she wants. She\'s worth 9 pawns, making her the most valuable piece after the king. Losing your queen early is a really big deal!',
    movementDescription: 'The queen combines the powers of the rook AND the bishop. She can slide any number of squares in all 8 directions. She\'s stopped only by other pieces — she can\'t jump over them.',
    funFact: '💎 Fun Fact: In very old chess (hundreds of years ago), the queen could only move one square at a time, like the king! Players decided to make her stronger, and now she\'s the most powerful piece on the board.',
    startingSquares: [{ row: 7, col: 3 }, { row: 0, col: 3 }],
    demoSquare: { row: 3, col: 3 },
  },
  {
    id: 'rook', type: 'R', name: 'Rook', symbol: '♖', emoji: '🏰',
    tagline: 'The Castle Piece!', pointValue: 5, color: 'white',
    shortDescription: 'The rook looks like a castle tower and moves in straight lines.',
    fullDescription: 'The rook looks like a little castle tower! It moves in perfectly straight lines — up, down, left, or right — as many squares as it wants. Rooks are really powerful when there are fewer pieces on the board and they have lots of open space to slide around. Two rooks working together are a super-strong team!',
    movementDescription: 'The rook moves any number of squares horizontally (left/right) or vertically (up/down). It cannot move diagonally. If another piece is in the way, the rook has to stop.',
    funFact: '🏰 Fun Fact: The rook is also called a "castle" by many players! There\'s also a special move called "castling" where your king and rook swap places to keep your king safe.',
    startingSquares: [{ row: 7, col: 0 }, { row: 7, col: 7 }, { row: 0, col: 0 }, { row: 0, col: 7 }],
    demoSquare: { row: 3, col: 3 },
  },
  {
    id: 'bishop', type: 'B', name: 'Bishop', symbol: '♗', emoji: '⛪',
    tagline: 'The Diagonal Slider!', pointValue: 3, color: 'white',
    shortDescription: 'The bishop glides diagonally across the board.',
    fullDescription: 'The bishop is a sneaky piece that moves diagonally! Each player starts with two bishops — one that only moves on light squares, and one that only moves on dark squares. They never change color! Bishops are great when there are open diagonals with lots of space to move around.',
    movementDescription: 'The bishop moves any number of squares diagonally — like an X shape. It can go far-far diagonally but it can NEVER move horizontally or vertically. One bishop stays on light squares forever, the other stays on dark squares forever.',
    funFact: '⛪ Fun Fact: Because each bishop is stuck on only one color, if you have one bishop and your opponent has the OTHER color bishop, it\'s often a draw — they can never attack each other!',
    startingSquares: [{ row: 7, col: 2 }, { row: 7, col: 5 }, { row: 0, col: 2 }, { row: 0, col: 5 }],
    demoSquare: { row: 3, col: 3 },
  },
  {
    id: 'knight', type: 'N', name: 'Knight', symbol: '♘', emoji: '🐴',
    tagline: 'The Jumping Piece!', pointValue: 3, color: 'white',
    shortDescription: 'The knight moves in an L-shape and can jump over other pieces!',
    fullDescription: 'The knight is the most unique piece in chess! It moves in an "L" shape — 2 squares in one direction, then 1 square sideways (or 1 square then 2 squares). The coolest part? The knight is the ONLY piece that can jump over other pieces! This makes it super useful when the board is crowded.',
    movementDescription: 'Move 2 squares forward/backward + 1 square sideways. OR 1 square forward/backward + 2 squares sideways. Think of the letter "L"! The knight always lands on the opposite color square from where it started.',
    funFact: '🐴 Fun Fact: Chess players often call the knight simply "horse" because of its shape. It\'s the hardest piece for beginners to remember how to move — but once you get it, you\'ll love using it for sneaky attacks!',
    startingSquares: [{ row: 7, col: 1 }, { row: 7, col: 6 }, { row: 0, col: 1 }, { row: 0, col: 6 }],
    demoSquare: { row: 3, col: 3 },
  },
  {
    id: 'pawn', type: 'P', name: 'Pawn', symbol: '♙', emoji: '⚔️',
    tagline: 'The Little Heroes!', pointValue: 1, color: 'white',
    shortDescription: 'Pawns march forward and capture diagonally. They can become queens!',
    fullDescription: 'Pawns are the smallest and most common piece — you start with 8 of them! They seem weak at first, but pawns have a secret superpower: if a pawn reaches the OTHER side of the board, it gets to become ANY piece it wants (usually a queen)! This is called "promotion." Never give up on your pawns!',
    movementDescription: 'Pawns move FORWARD only — they can\'t go backwards. They move 1 square at a time (or 2 squares on their very first move). They CAPTURE diagonally — one square forward-diagonal. They cannot capture straight ahead!',
    funFact: '⚔️ Fun Fact: There\'s a special pawn move called "en passant" (say it: "on pass-on"). If an enemy pawn moves 2 squares next to your pawn, you can capture it as if it had only moved 1 square. It\'s the trickiest move in chess!',
    startingSquares: [{ row: 6, col: 0 }, { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 6, col: 6 }, { row: 6, col: 7 }],
    demoSquare: { row: 4, col: 3 },
  },
];

export const PIECE_SYMBOLS: Record<string, string> = {
  'K-white': '♔', 'Q-white': '♕', 'R-white': '♖', 'B-white': '♗', 'N-white': '♘', 'P-white': '♙',
  'K-black': '♚', 'Q-black': '♛', 'R-black': '♜', 'B-black': '♝', 'N-black': '♞', 'P-black': '♟',
};

export function getPieceSymbol(type: string, color: string): string { return PIECE_SYMBOLS[`${type}-${color}`] || '?'; }
export function getPieceById(id: string): PieceInfo | undefined { return PIECES.find(p => p.id === id); }
