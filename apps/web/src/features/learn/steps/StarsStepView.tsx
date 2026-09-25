import { Chess } from 'chess.js'
import { type CSSProperties, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Board, type BoardMove } from '../../../chess/Board'
import { narrateIfAutoplay } from '../narration'
import { playTone } from '../sounds'
import { Feedback, StepLayout } from './shared'
import { orientationOf, type StepProps } from './stepUtils'

const STAR_STYLE: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23e0a526' stroke='%23915f00' stroke-width='0.8' d='M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundSize: '62%',
}

// The learner keeps the move: after each move the turn goes back to them.
function keepTurn(chess: Chess, color: 'w' | 'b'): string {
  const parts = chess.fen().split(' ')
  parts[1] = color
  parts[3] = '-'
  return parts.join(' ')
}

export function StarsStepView({ step, onComplete }: StepProps<'stars'>) {
  const { t } = useTranslation()
  const learner = step.fen.split(' ')[1] === 'b' ? 'b' : 'w'
  const [fen, setFen] = useState(step.fen)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null,
  )
  const [left, setLeft] = useState(() => new Set(step.stars))
  const [moves, setMoves] = useState(0)
  const done = left.size === 0

  function onMove(move: BoardMove) {
    if (done) return
    const chess = new Chess(fen, { skipValidation: true })
    const played = chess.move(move)
    setFen(keepTurn(chess, learner))
    setLastMove({ from: played.from, to: played.to })
    setMoves((n) => n + 1)

    if (!left.has(played.to)) return
    const remaining = new Set(left)
    remaining.delete(played.to)
    setLeft(remaining)
    if (remaining.size === 0) {
      playTone('correct')
      narrateIfAutoplay(t('learn.starsDone'))
      onComplete()
    }
  }

  const squareStyles = Object.fromEntries(
    [...left].map((square) => [square, STAR_STYLE]),
  )

  return (
    <StepLayout
      board={
        <Board
          fen={fen}
          orientation={orientationOf(step.fen)}
          movableColor={done ? null : learner}
          onMove={onMove}
          lastMove={lastMove}
          squareStyles={squareStyles}
        />
      }
    >
      <p className="font-semibold leading-relaxed">{step.text}</p>
      <p className="text-base text-muted">
        {t('learn.starsLeft', { count: left.size, total: step.stars.length })}
        {' · '}
        {t('learn.moves', { count: moves })}
        {left.size > 0 && (
          <span className="sr-only">
            {'. '}
            {t('learn.starSquares', { squares: [...left].join(', ') })}
          </span>
        )}
      </p>
      {done && (
        <Feedback kind="success">
          {t('learn.starsDone')} {t('learn.movesUsed', { count: moves })}
        </Feedback>
      )}
    </StepLayout>
  )
}
