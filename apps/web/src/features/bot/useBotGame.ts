import { type GameResult, getBotLevel, positionResult } from '@shaxmat/chess-core'
import { Chess } from 'chess.js'
import { useCallback, useEffect, useState } from 'react'
import type { BoardMove } from '../../chess/Board'
import { getEngine } from '../../chess/engine'
import { uciToMove } from '../../chess/uci'
import { pickBotMove } from './pickBotMove'

const HINT_DEPTH = 12

export type BotGame = ReturnType<typeof useBotGame>

// Plays against a bot from the start position or from `startFen`.
export function useBotGame(
  level: number,
  playerColor: 'w' | 'b',
  startFen?: string,
) {
  const botLevel = getBotLevel(level)
  const [chess] = useState(() => new Chess(startFen))
  const [fen, setFen] = useState(chess.fen())
  const [result, setResult] = useState<GameResult | null>(null)
  const [hint, setHint] = useState<{ fen: string; move: string } | null>(null)

  // Mirrors the chess.js instance into React state after every change.
  const sync = useCallback(() => {
    setFen(chess.fen())
    setResult(positionResult(chess))
  }, [chess])

  const applyUci = useCallback(
    (uci: string) => {
      chess.move(uciToMove(uci))
      sync()
    },
    [chess, sync],
  )

  // The bot moves whenever it is its turn in an unfinished game.
  useEffect(() => {
    if (result || chess.turn() === playerColor) return
    let cancelled = false
    const engine = getEngine()
    void pickBotMove(engine, fen, botLevel).then((uci) => {
      if (!cancelled) applyUci(uci)
    })
    return () => {
      cancelled = true
      engine.stop()
    }
  }, [fen, result, playerColor, botLevel, chess, applyUci])

  const playerMove = useCallback(
    (move: BoardMove) => {
      if (result || chess.turn() !== playerColor) return
      chess.move(move)
      sync()
    },
    [chess, playerColor, result, sync],
  )

  // Takes back the player's last move and the bot's answer to it.
  const takeback = useCallback(() => {
    const history = chess.history()
    const firstPlayerPly = playerColor === 'w' ? 0 : 1
    if (history.length <= firstPlayerPly) return
    do {
      chess.undo()
    } while (chess.turn() !== playerColor)
    sync()
  }, [chess, playerColor, sync])

  const requestHint = useCallback(async () => {
    const position = chess.fen()
    const { bestMove } = await getEngine().search(position, {
      depth: HINT_DEPTH,
    })
    setHint({ fen: position, move: bestMove })
  }, [chess])

  const resign = useCallback(() => {
    if (result) return
    setResult({ winner: playerColor === 'w' ? 'b' : 'w', reason: 'resign' })
  }, [playerColor, result])

  const history = chess.history({ verbose: true })
  const last = history.at(-1)

  return {
    botLevel,
    chess,
    fen,
    result,
    // The bot is thinking exactly when it is its turn in an unfinished game.
    thinking: !result && chess.turn() !== playerColor,
    history,
    lastMove: last ? { from: last.from, to: last.to } : null,
    // A hint is shown only for the position it was computed for.
    hintMove: hint?.fen === fen ? hint.move : null,
    playerMove,
    takeback,
    requestHint,
    resign,
  }
}
