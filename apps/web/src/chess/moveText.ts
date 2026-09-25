import type { Chess, Color, Move, PieceSymbol, Square } from 'chess.js'

// Makes typed moves comparable: "Nxf3+" and "nf3" both become "nf3".
function normalize(text: string): string {
  return text
    .trim()
    .replace(/0/g, 'o')
    .replace(/[+#!?x=\s-]/gi, '')
    .toLowerCase()
}

// Finds the legal move a learner typed: SAN ("e4", "Nf3", "O-O", "exd5",
// "e8=Q") or coordinates ("e2e4", "e7e8q"). Returns null when no legal move
// matches, or when the text fits more than one move.
export function findTypedMove(chess: Chess, text: string): Move | null {
  const typed = normalize(text)
  if (!typed) return null
  const legal = chess.moves({ verbose: true })

  const byCoordinates = legal.filter(
    (move) => move.lan === typed || `${move.from}${move.to}` === typed,
  )
  if (byCoordinates.length === 1) return byCoordinates[0]!
  // "e7e8" without a piece matches four promotions; the caller asks which.
  if (byCoordinates.length > 1 && byCoordinates.every((m) => m.isPromotion())) {
    return byCoordinates.find((m) => m.promotion === 'q') ?? null
  }

  const bySan = legal.filter((move) => normalize(move.san) === typed)
  return bySan.length === 1 ? bySan[0]! : null
}

// True when typed text names the promotion piece, as in "e8=Q" or "e7e8q".
export function namesPromotionPiece(text: string): boolean {
  return /[qrbn]$/i.test(text.replace(/[+#!?\s]/g, ''))
}

export type MoveFacts = {
  side: Color
  piece: PieceSymbol
  from: string
  to: string
  check: boolean
  mate: boolean
}

// What the last move was, read from the position after it. The board turns
// this into a sentence for screen readers in the current language.
export function moveFacts(
  chess: Chess,
  lastMove: { from: string; to: string },
): MoveFacts | null {
  const piece = chess.get(lastMove.to as Square)
  if (!piece) return null
  const mate = chess.isCheckmate()
  return {
    side: piece.color,
    piece: piece.type,
    from: lastMove.from,
    to: lastMove.to,
    check: !mate && chess.inCheck(),
    mate,
  }
}
