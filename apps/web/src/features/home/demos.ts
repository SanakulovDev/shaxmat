// Scripted positions for the home page. Moves are in UCI notation;
// demos.test.ts replays them with chess.js to catch typos.

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

// Paul Morphy against the Duke of Brunswick and Count Isouard, Paris 1858:
// the "Opera game", a short classic that ends in mate.
export const OPERA_GAME = {
  fen: START_FEN,
  san: [
    'e4', 'e5', 'Nf3', 'd6', 'd4', 'Bg4', 'dxe5', 'Bxf3', 'Qxf3', 'dxe5',
    'Bc4', 'Nf6', 'Qb3', 'Qe7', 'Nc3', 'c6', 'Bg5', 'b5', 'Nxb5', 'cxb5',
    'Bxb5+', 'Nbd7', 'O-O-O', 'Rd8', 'Rxd7', 'Rxd7', 'Rd1', 'Qe6', 'Bxd7+',
    'Nxd7', 'Qb8+', 'Nxb8', 'Rd8#',
  ],
  moves: [
    'e2e4', 'e7e5', 'g1f3', 'd7d6', 'd2d4', 'c8g4', 'd4e5', 'g4f3', 'd1f3', 'd6e5',
    'f1c4', 'g8f6', 'f3b3', 'd8e7', 'b1c3', 'c7c6', 'c1g5', 'b7b5', 'c3b5', 'c6b5',
    'c4b5', 'b8d7', 'e1c1', 'a8d8', 'd1d7', 'd8d7', 'h1d1', 'e7e6', 'b5d7',
    'f6d7', 'b3b8', 'd7b8', 'd1d8',
  ],
} as const

export type PieceKind = 'k' | 'q' | 'r' | 'b' | 'n' | 'p'

export type PieceDemo = {
  kind: PieceKind
  fen: string
  // The square whose moves are marked on the board.
  from: string
  // Only one side moves, so the piece can tour its squares and come back.
  moves: readonly string[]
  // Points in the usual piece values; the king has none.
  value: number | null
  lesson: string
  // False when the piece does not come back, so its marks go stale.
  keepMarks: boolean
}

export const PIECE_DEMOS: readonly PieceDemo[] = [
  {
    kind: 'k',
    fen: '8/8/8/8/3K4/8/8/8 w - - 0 1',
    from: 'd4',
    moves: ['d4d5', 'd5e4', 'e4d3', 'd3c4', 'c4d4'],
    value: null,
    lesson: 'shoh',
    keepMarks: true,
  },
  {
    kind: 'q',
    fen: '8/8/8/8/3Q4/8/8/8 w - - 0 1',
    from: 'd4',
    moves: ['d4d8', 'd8h4', 'h4a4', 'a4d7', 'd7d4'],
    value: 9,
    lesson: 'farzin',
    keepMarks: true,
  },
  {
    kind: 'r',
    fen: '8/8/8/8/3R4/8/8/8 w - - 0 1',
    from: 'd4',
    moves: ['d4d8', 'd8d1', 'd1d4', 'd4a4', 'a4h4', 'h4d4'],
    value: 5,
    lesson: 'ruh',
    keepMarks: true,
  },
  {
    kind: 'b',
    fen: '8/8/8/8/3B4/8/8/8 w - - 0 1',
    from: 'd4',
    moves: ['d4h8', 'h8a1', 'a1d4', 'd4a7', 'a7g1', 'g1d4'],
    value: 3,
    lesson: 'fil',
    keepMarks: true,
  },
  {
    // Surrounded by its own pawns, to show that the knight jumps.
    kind: 'n',
    fen: '8/8/8/2PPP3/2PNP3/2PPP3/8/8 w - - 0 1',
    from: 'd4',
    moves: ['d4e6', 'e6d4', 'd4b3', 'b3d4', 'd4f3', 'f3d4'],
    value: 3,
    lesson: 'ot',
    keepMarks: true,
  },
  {
    // Two squares on the first move, then a diagonal capture.
    kind: 'p',
    fen: '8/3p4/8/8/8/8/4P3/8 w - - 0 1',
    from: 'e2',
    moves: ['e2e4', 'd7d5', 'e4d5'],
    value: 1,
    lesson: 'piyoda',
    keepMarks: false,
  },
]

export type SpecialMove = {
  id: 'castling' | 'enPassant' | 'promotion'
  fen: string
  moves: readonly string[]
  lesson: string
}

export const SPECIAL_MOVES: readonly SpecialMove[] = [
  {
    id: 'castling',
    fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
    moves: ['e1g1', 'e8c8'],
    lesson: 'rokirovka',
  },
  {
    id: 'enPassant',
    fen: '4k3/3p4/8/4P3/8/8/8/4K3 b - - 0 1',
    moves: ['d7d5', 'e5d6'],
    lesson: 'yolda-urish',
  },
  {
    id: 'promotion',
    fen: '4k3/1P6/8/8/8/8/8/4K3 w - - 0 1',
    moves: ['b7b8q'],
    lesson: 'piyoda-aylanishi',
  },
]
