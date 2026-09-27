import { Chess, DEFAULT_POSITION } from 'chess.js'

export type GameMove = {
  san: string
  uci: string
  // The position after the move.
  fen: string
  // Seconds left on the mover's clock after the move, when recorded.
  clock: number | null
}

export type ParsedGame = {
  headers: Record<string, string>
  startFen: string
  moves: GameMove[]
}

const TOKEN = /\{[^}]*\}|;[^\n]*|\(|\)|\$\d+|\d+\.+|1-0|0-1|1\/2-1\/2|\*|[^\s{}();]+/g

// Reads "[%clk 1:30:32]" (or "0:00:05.3") from a comment, in seconds.
export function readClock(comment: string): number | null {
  const match = /\[%clk\s+(\d+):(\d+):(\d+(?:\.\d+)?)\]/.exec(comment)
  if (!match) return null
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3])
}

// Reads one game's PGN: its headers and main line. Side lines, NAGs and
// comments other than clock times are skipped. Parsing stops at the first
// move that is not legal, keeping the moves before it.
export function parsePgn(text: string): ParsedGame {
  const headers: Record<string, string> = {}
  for (const [, key, value] of text.matchAll(/^\s*\[(\w+)\s+"((?:[^"\\]|\\.)*)"\]\s*$/gm)) {
    headers[key!] = value!.replace(/\\(.)/g, '$1')
  }
  const movetext = text.replace(/^\s*\[.*\]\s*$/gm, '')

  const startFen = headers.FEN ?? DEFAULT_POSITION
  const chess = new Chess(startFen)
  const moves: GameMove[] = []
  let depth = 0
  let broken = false

  for (const [token] of movetext.matchAll(TOKEN)) {
    if (token === '(') depth += 1
    else if (token === ')') depth = Math.max(0, depth - 1)
    else if (depth > 0 || broken) continue
    else if (token.startsWith('{')) {
      const clock = readClock(token)
      const last = moves.at(-1)
      if (clock !== null && last) last.clock = clock
    } else if (/^(\$|\d+\.|;|1-0|0-1|1\/2|\*)/.test(token)) continue
    else {
      try {
        const move = chess.move(token.replace(/[!?]+$/, ''))
        moves.push({ san: move.san, uci: move.lan, fen: move.after, clock: null })
      } catch {
        broken = true
      }
    }
  }
  return { headers, startFen, moves }
}
