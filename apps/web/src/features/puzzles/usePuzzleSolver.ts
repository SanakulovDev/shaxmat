import { Chess } from 'chess.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { BoardFlash, BoardMove } from '../../chess/Board'
import { uciToMove } from '../../chess/uci'
import type { Puzzle } from './api'
import { isCorrectMove } from './solver'

const OPPONENT_DELAY_MS = 500
const WRONG_MOVE_SHOWN_MS = 700
const SOLUTION_STEP_MS = 700

export type SolverStatus = 'intro' | 'playing' | 'wrong' | 'solved' | 'revealed'

// Plays a puzzle: the opponent's setup move, then the solver's moves checked
// against the solution, with the opponent's replies in between.
// `onFirstResult` fires once: solved with no mistakes, or failed.
export function usePuzzleSolver(
  puzzle: Puzzle,
  onFirstResult: (solved: boolean) => void,
) {
  const [chess] = useState(() => new Chess(puzzle.fen))
  const [fen, setFen] = useState(puzzle.fen)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null,
  )
  // Index in puzzle.moves of the solver's next move.
  const [step, setStep] = useState(1)
  const [status, setStatus] = useState<SolverStatus>('intro')
  // Lights the square of the solver's last move, green or red.
  const [flash, setFlash] = useState<BoardFlash | null>(null)
  const reported = useRef(false)
  const timers = useRef<number[]>([])

  const later = useCallback((action: () => void, ms: number) => {
    timers.current.push(window.setTimeout(action, ms))
  }, [])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((id) => window.clearTimeout(id))
  }, [])

  const report = useCallback(
    (solved: boolean) => {
      if (reported.current) return
      reported.current = true
      onFirstResult(solved)
    },
    [onFirstResult],
  )

  const play = useCallback(
    (uci: string) => {
      const move = chess.move(uciToMove(uci))
      setFen(chess.fen())
      setLastMove({ from: move.from, to: move.to })
    },
    [chess],
  )

  // The opponent's setup move.
  useEffect(() => {
    const id = window.setTimeout(() => {
      play(puzzle.moves[0]!)
      setStatus('playing')
    }, OPPONENT_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [play, puzzle])

  const playerMove = useCallback(
    (boardMove: BoardMove) => {
      if (status !== 'playing') return
      const expected = puzzle.moves[step]!
      const previous = lastMove
      const move = chess.move(boardMove)
      const isLastStep = step === puzzle.moves.length - 1
      setFen(chess.fen())
      setLastMove({ from: move.from, to: move.to })

      const correct = isCorrectMove({
        expected,
        played: move.lan,
        isLastStep,
        givesMate: chess.isCheckmate(),
      })
      setFlash((last) => ({
        kind: correct ? 'good' : 'bad',
        square: move.to,
        id: (last?.id ?? 0) + 1,
      }))
      if (!correct) {
        setStatus('wrong')
        report(false)
        later(() => {
          chess.undo()
          setFen(chess.fen())
          setLastMove(previous)
          setStatus('playing')
        }, WRONG_MOVE_SHOWN_MS)
        return
      }

      if (isLastStep) {
        setStatus('solved')
        report(true)
        return
      }
      setStep(step + 2)
      later(() => play(puzzle.moves[step + 1]!), OPPONENT_DELAY_MS)
    },
    [chess, lastMove, later, play, puzzle, report, status, step],
  )

  // Plays the rest of the solution; counts as a failure.
  const revealSolution = useCallback(() => {
    if (status !== 'playing') return
    report(false)
    setStatus('revealed')
    puzzle.moves.slice(step).forEach((uci, index) => {
      later(() => play(uci), SOLUTION_STEP_MS * (index + 1))
    })
  }, [later, play, puzzle, report, status, step])

  // The solver plays the side to move after the opponent's first move.
  const solverColor = puzzle.fen.split(' ')[1] === 'w' ? 'b' : 'w'

  return {
    fen,
    lastMove,
    status,
    flash,
    solverColor,
    playerMove,
    revealSolution,
  } as const
}
