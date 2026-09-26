import { Chess } from 'chess.js'
import type { BoardMove } from './Board'

// "e7e8q" -> { from: "e7", to: "e8", promotion: "q" }
export function uciToMove(uci: string): BoardMove {
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci[4],
  }
}

// Plays UCI moves from the start position.
export function replayUci(moves: readonly string[]): Chess {
  const chess = new Chess()
  for (const uci of moves) chess.move(uciToMove(uci))
  return chess
}
