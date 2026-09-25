import {
  type BotLevel,
  chooseCandidate,
  chooseRandomMove,
  type Random,
} from '@shaxmat/chess-core'
import { Chess } from 'chess.js'
import type { Engine } from '../../chess/engine'

// The bot never answers faster than this, so its moves are easy to follow.
const MIN_THINK_MS = 500

// Returns the bot's move in UCI notation, e.g. "e7e5" or "a2a1q".
export async function pickBotMove(
  engine: Engine,
  fen: string,
  { strategy }: BotLevel,
  random: Random = Math.random,
): Promise<string> {
  const delay = new Promise((resolve) => setTimeout(resolve, MIN_THINK_MS))

  let move: Promise<string>
  switch (strategy.kind) {
    case 'random': {
      const legal = new Chess(fen).moves({ verbose: true }).map((m) => ({
        move: m.lan,
        isCapture: m.isCapture(),
      }))
      move = Promise.resolve(
        chooseRandomMove(legal, strategy.capturePreference, random),
      )
      break
    }
    case 'multipv':
      move = engine
        .search(fen, { depth: strategy.depth, multiPv: strategy.multiPv })
        .then(({ candidates, bestMove }) =>
          candidates.length > 0
            ? chooseCandidate(candidates, strategy, random)
            : bestMove,
        )
      break
    case 'skill':
      move = engine
        .search(fen, {
          skillLevel: strategy.skillLevel,
          movetimeMs: strategy.movetimeMs,
        })
        .then((result) => result.bestMove)
      break
    case 'elo':
      move = engine
        .search(fen, { elo: strategy.elo, movetimeMs: strategy.movetimeMs })
        .then((result) => result.bestMove)
      break
    case 'full':
      move = engine
        .search(fen, { movetimeMs: strategy.movetimeMs })
        .then((result) => result.bestMove)
      break
  }

  const [uci] = await Promise.all([move, delay])
  return uci
}
