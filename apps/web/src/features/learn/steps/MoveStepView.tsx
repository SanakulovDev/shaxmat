import { Chess } from 'chess.js'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Board, type BoardFlash, type BoardMove } from '../../../chess/Board'
import { narrateIfAutoplay } from '../narration'
import { playTone } from '../sounds'
import { Feedback, StepLayout } from './shared'
import { orientationOf, type StepProps } from './stepUtils'

const WRONG_MOVE_SHOWN_MS = 800
// After this many wrong tries the board shows the answer as an arrow.
const TRIES_BEFORE_ARROW = 2

type MoveStep = StepProps<'move'>['step']

function meetsTask(step: MoveStep, chess: Chess, lan: string, captured: boolean) {
  if (step.solutions && !step.solutions.includes(lan)) return false
  if (step.goal === 'check') return chess.inCheck()
  if (step.goal === 'mate') return chess.isCheckmate()
  if (step.goal === 'capture') return captured
  return true
}

export function MoveStepView({ step, onComplete }: StepProps<'move'>) {
  const { t } = useTranslation()
  const [chess] = useState(() => new Chess(step.fen, { skipValidation: true }))
  const [fen, setFen] = useState(step.fen)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null,
  )
  const [state, setState] = useState<'playing' | 'wrong' | 'done'>('playing')
  const [wrongTries, setWrongTries] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [flash, setFlash] = useState<BoardFlash | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const learner = chess.turn()

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function onMove(move: BoardMove) {
    if (state !== 'playing') return
    const played = chess.move(move)
    setFen(chess.fen())
    setLastMove({ from: played.from, to: played.to })
    const correct = meetsTask(step, chess, played.lan, played.isCapture())
    setFlash((last) => ({
      kind: correct ? 'good' : 'bad',
      square: played.to,
      id: (last?.id ?? 0) + 1,
    }))

    if (correct) {
      setState('done')
      playTone('correct')
      if (step.success) narrateIfAutoplay(step.success)
      onComplete()
      return
    }

    setState('wrong')
    setWrongTries((n) => n + 1)
    playTone('wrong')
    timer.current = window.setTimeout(() => {
      chess.undo()
      setFen(chess.fen())
      setLastMove(null)
      setState('playing')
    }, WRONG_MOVE_SHOWN_MS)
  }

  const answer = step.solutions?.[0]
  const arrows =
    state === 'playing' && answer && wrongTries >= TRIES_BEFORE_ARROW
      ? [
          {
            startSquare: answer.slice(0, 2),
            endSquare: answer.slice(2, 4),
            color: 'rgba(37, 99, 235, 0.8)',
          },
        ]
      : []

  return (
    <StepLayout
      board={
        <Board
          fen={fen}
          orientation={orientationOf(step.fen)}
          movableColor={state === 'playing' ? learner : null}
          onMove={onMove}
          lastMove={lastMove}
          arrows={arrows}
          flash={flash}
        />
      }
    >
      <p className="font-semibold leading-relaxed">{step.text}</p>
      {state === 'done' && (
        <Feedback kind="success">{step.success ?? t('learn.correct')}</Feedback>
      )}
      {state === 'wrong' && <Feedback kind="error">{t('learn.wrongMove')}</Feedback>}
      {state !== 'done' && step.hint && (
        showHint ? (
          <Feedback kind="info">{step.hint}</Feedback>
        ) : (
          <button
            type="button"
            onClick={() => setShowHint(true)}
            className="text-base font-medium text-board-dark underline"
          >
            {t('learn.showHint')}
          </button>
        )
      )}
    </StepLayout>
  )
}
