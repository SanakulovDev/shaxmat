// A tiny board model for the home page animations. It plays scripted moves
// without checking legality, so the home page does not load chess.js.

// Square index 0..63 in FEN order: 0 is a8, 63 is h1.
export type BoardPiece = {
  // Stable across moves, so a piece can slide from square to square.
  id: number
  // FEN letter: uppercase for White, lowercase for Black.
  code: string
  square: number
  captured: boolean
}

export function squareIndex(name: string): number {
  const file = name.charCodeAt(0) - 97
  const rank = Number(name[1])
  return (8 - rank) * 8 + file
}

export function parseFen(fen: string): BoardPiece[] {
  const pieces: BoardPiece[] = []
  fen
    .split(' ')[0]!
    .split('/')
    .forEach((row, rank) => {
      let file = 0
      for (const char of row) {
        if (/\d/.test(char)) {
          file += Number(char)
        } else {
          pieces.push({ id: pieces.length, code: char, square: rank * 8 + file, captured: false })
          file += 1
        }
      }
    })
  return pieces
}

// Plays UCI moves ("e2e4", "e7e8q"), including castling, en passant and
// promotion. Captured pieces stay in the list, so they can fade out.
export function play(start: readonly BoardPiece[], moves: readonly string[]): BoardPiece[] {
  const pieces = start.map((piece) => ({ ...piece }))
  const at = (square: number) => pieces.find((p) => !p.captured && p.square === square)

  for (const move of moves) {
    const from = squareIndex(move.slice(0, 2))
    const to = squareIndex(move.slice(2, 4))
    const piece = at(from)
    if (!piece) throw new Error(`No piece on ${move.slice(0, 2)} for ${move}`)
    const fileStep = (to % 8) - (from % 8)
    const kind = piece.code.toLowerCase()

    const target = at(to)
    if (target) {
      target.captured = true
    } else if (kind === 'p' && fileStep !== 0) {
      // En passant: the pawn taken stands beside the start square.
      const passed = at(from + fileStep)
      if (passed) passed.captured = true
    }

    if (kind === 'k' && Math.abs(fileStep) === 2) {
      const rook = at(fileStep > 0 ? from + 3 : from - 4)
      if (rook) rook.square = from + fileStep / 2
    }

    piece.square = to
    const promotion = move[4]
    if (promotion) {
      piece.code = piece.code === piece.code.toUpperCase() ? promotion.toUpperCase() : promotion
    }
  }
  return pieces
}

const LINES: Record<string, [number, number][]> = {
  r: [[1, 0], [-1, 0], [0, 1], [0, -1]],
  b: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
  n: [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]],
}
LINES.q = [...LINES.r!, ...LINES.b!]
LINES.k = LINES.q

export type Reach = { square: number; capture: boolean }

// Squares the piece on `square` can move to. Checks and pins are ignored:
// the home page shows how a piece moves, not whole positions.
export function reach(pieces: readonly BoardPiece[], square: number): Reach[] {
  const board = new Map(pieces.filter((p) => !p.captured).map((p) => [p.square, p.code]))
  const code = board.get(square)
  if (!code) return []
  const white = code === code.toUpperCase()
  const kind = code.toLowerCase()
  const file = square % 8
  const rank = Math.floor(square / 8)
  const result: Reach[] = []
  // Returns false when the ray stops at this square.
  const visit = (f: number, r: number, canMove = true, canCapture = true): boolean => {
    if (f < 0 || f > 7 || r < 0 || r > 7) return false
    const other = board.get(r * 8 + f)
    if (other === undefined) {
      if (canMove) result.push({ square: r * 8 + f, capture: false })
      return canMove
    }
    if (canCapture && (other === other.toUpperCase()) !== white) {
      result.push({ square: r * 8 + f, capture: true })
    }
    return false
  }

  if (kind === 'p') {
    const forward = white ? -1 : 1
    const home = white ? 6 : 1
    if (visit(file, rank + forward, true, false) && rank === home) {
      visit(file, rank + 2 * forward, true, false)
    }
    visit(file - 1, rank + forward, false)
    visit(file + 1, rank + forward, false)
    return result
  }
  const slides = kind === 'r' || kind === 'b' || kind === 'q'
  for (const [df, dr] of LINES[kind] ?? []) {
    let step = 1
    while (visit(file + df * step, rank + dr * step) && slides) step += 1
  }
  return result
}
