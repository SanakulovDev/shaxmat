import type { Side } from '@shaxmat/chess-core'
import { Chess, type PieceSymbol } from 'chess.js'
import type { EngineLine } from '../../chess/engine'
import { uciToMove } from '../../chess/uci'

// An engine verdict on a position, from White's point of view.
export type PositionEval = {
  cp: number
  // Moves to mate, positive when White mates; 0 once the game ended in mate.
  mate: number | null
  // Best move in UCI, when the game goes on.
  best: string | null
  depth: number
}

const MATE_CP = 100_000

export function turnOf(fen: string): Side {
  return fen.split(' ')[1] === 'b' ? 'b' : 'w'
}

// Mates and dead draws need no engine: Stockfish only answers them with
// "bestmove (none)".
export function finalVerdict(fen: string): PositionEval | null {
  const chess = new Chess(fen)
  if (chess.isCheckmate()) {
    return { cp: chess.turn() === 'w' ? -MATE_CP : MATE_CP, mate: 0, best: null, depth: 0 }
  }
  if (chess.isStalemate() || chess.isInsufficientMaterial()) {
    return { cp: 0, mate: null, best: null, depth: 0 }
  }
  return null
}

// Engine scores are from the side to move; the page shows White's view.
export function toWhite(line: EngineLine, fen: string): PositionEval {
  const sign = turnOf(fen) === 'w' ? 1 : -1
  return {
    cp: line.scoreCp * sign,
    mate: line.mate === null ? null : line.mate * sign,
    best: line.move,
    depth: line.depth,
  }
}

// "+1.3", "−0.4", "#3" (White mates in 3), "#−2", or the result after mate.
export function formatEval({ cp, mate }: Pick<PositionEval, 'cp' | 'mate'>): string {
  if (mate === 0) return cp > 0 ? '1-0' : '0-1'
  if (mate !== null) return mate > 0 ? `#${mate}` : `#−${-mate}`
  const pawns = Math.abs(cp) / 100
  if (pawns < 0.05) return '0.0'
  return `${cp > 0 ? '+' : '−'}${pawns.toFixed(1)}`
}

const VALUES: Record<Exclude<PieceSymbol, 'k'>, number> = { q: 9, r: 5, b: 3, n: 3, p: 1 }
const ORDER = ['q', 'r', 'b', 'n', 'p'] as const

export type Material = {
  // Pieces each side has more of than the other, most valuable first.
  extra: Record<Side, PieceSymbol[]>
  // White's material minus Black's, in pawns.
  diff: number
}

// Equal trades cancel out, as on Lichess: what shows is who is up and by
// what.
export function material(fen: string): Material {
  const count = { w: { q: 0, r: 0, b: 0, n: 0, p: 0 }, b: { q: 0, r: 0, b: 0, n: 0, p: 0 } }
  for (const char of fen.split(' ')[0] ?? '') {
    const piece = char.toLowerCase() as PieceSymbol
    if (piece === 'k' || !(piece in VALUES)) continue
    count[char === piece ? 'b' : 'w'][piece as keyof typeof VALUES] += 1
  }
  const extra: Record<Side, PieceSymbol[]> = { w: [], b: [] }
  let diff = 0
  for (const piece of ORDER) {
    const lead = count.w[piece] - count.b[piece]
    diff += lead * VALUES[piece]
    const side: Side = lead > 0 ? 'w' : 'b'
    for (let i = 0; i < Math.abs(lead); i += 1) extra[side].push(piece)
  }
  return { extra, diff }
}

export function uciToSan(fen: string, uci: string): string | null {
  try {
    return new Chess(fen).move(uciToMove(uci)).san
  } catch {
    return null
  }
}

// An engine line as numbered SAN: "23. Nf5 Qe7 24. Rd1" or "23… Qe7 24. Rd1".
export function formatLine(fen: string, pv: readonly string[], limit = 8): string {
  const chess = new Chess(fen)
  let number = Number(fen.split(' ')[5] ?? 1)
  const parts: string[] = []
  for (const [index, uci] of pv.slice(0, limit).entries()) {
    const white = chess.turn() === 'w'
    let san: string
    try {
      san = chess.move(uciToMove(uci)).san
    } catch {
      break
    }
    if (white) parts.push(`${number}. ${san}`)
    else parts.push(index === 0 ? `${number}… ${san}` : san)
    if (!white) number += 1
  }
  return parts.join(' ')
}

// Seconds left on `side`'s clock after `ply` moves, from the clock times
// recorded with the moves; null when none was recorded.
export function clockAt(
  clocks: readonly (number | null)[],
  firstMover: Side,
  side: Side,
  ply: number,
): number | null {
  for (let index = Math.min(ply, clocks.length) - 1; index >= 0; index -= 1) {
    const mover: Side = (index % 2 === 0) === (firstMover === 'w') ? 'w' : 'b'
    if (mover === side && clocks[index] != null) return clocks[index]!
  }
  return null
}

// "1:30:38", "4:05" or "0:08".
export function formatSeconds(total: number): string {
  const whole = Math.max(0, Math.floor(total))
  const hours = Math.floor(whole / 3600)
  const minutes = Math.floor((whole % 3600) / 60)
  const seconds = String(whole % 60).padStart(2, '0')
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`
}
