import type { Chess } from 'chess.js';

export type GameEndReason =
  | 'checkmate'
  | 'stalemate'
  | 'threefold'
  | 'insufficient'
  | 'fiftyMoves'
  | 'resign';

export type GameResult = {
  // null means a draw.
  winner: 'w' | 'b' | null;
  reason: GameEndReason;
};

// Result of a finished position, or null while the game goes on.
export function positionResult(chess: Chess): GameResult | null {
  if (chess.isCheckmate()) {
    return { winner: chess.turn() === 'w' ? 'b' : 'w', reason: 'checkmate' };
  }
  if (chess.isStalemate()) return { winner: null, reason: 'stalemate' };
  if (chess.isThreefoldRepetition())
    return { winner: null, reason: 'threefold' };
  if (chess.isInsufficientMaterial()) {
    return { winner: null, reason: 'insufficient' };
  }
  if (chess.isDrawByFiftyMoves()) return { winner: null, reason: 'fiftyMoves' };
  return null;
}

// PGN result tag: "1-0", "0-1" or "1/2-1/2".
export function resultTag(result: GameResult): string {
  if (result.winner === 'w') return '1-0';
  if (result.winner === 'b') return '0-1';
  return '1/2-1/2';
}
