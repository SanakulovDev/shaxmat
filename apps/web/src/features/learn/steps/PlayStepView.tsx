import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Board } from '../../../chess/Board'
import { useBotGame } from '../../bot/useBotGame'
import { narrateIfAutoplay } from '../narration'
import { playTone } from '../sounds'
import { Feedback, StepLayout } from './shared'
import { orientationOf, type StepProps } from './stepUtils'

export function PlayStepView(props: StepProps<'play'>) {
  // A new key restarts the game from the step's position.
  const [round, setRound] = useState(0)
  return (
    <PlayRound key={round} {...props} onRetry={() => setRound((r) => r + 1)} />
  )
}

function PlayRound({
  step,
  onComplete,
  onRetry,
}: StepProps<'play'> & { onRetry: () => void }) {
  const { t } = useTranslation()
  const learner = step.fen.split(' ')[1] === 'b' ? 'b' : 'w'
  const game = useBotGame(step.botLevel, learner, step.fen)
  const { result } = game
  const won = result?.winner === learner && result.reason === 'checkmate'

  useEffect(() => {
    if (!result) return
    playTone(won ? 'correct' : 'wrong')
    if (won) {
      narrateIfAutoplay(t('learn.playWon'))
      onComplete()
    }
  }, [result, won, onComplete, t])

  const hintArrows = game.hintMove
    ? [
        {
          startSquare: game.hintMove.slice(0, 2),
          endSquare: game.hintMove.slice(2, 4),
          color: 'rgba(37, 99, 235, 0.8)',
        },
      ]
    : []
  const learnerToMove = !result && game.chess.turn() === learner

  return (
    <StepLayout
      board={
        <Board
          fen={game.fen}
          orientation={orientationOf(step.fen)}
          movableColor={learnerToMove ? learner : null}
          onMove={game.playerMove}
          lastMove={game.lastMove}
          arrows={hintArrows}
        />
      }
    >
      <p className="font-semibold leading-relaxed">{step.text}</p>
      {!result && (
        <p className="text-base text-muted">
          {t(learnerToMove ? 'bot.yourMove' : 'bot.botMove')}
        </p>
      )}
      {won && <Feedback kind="success">{t('learn.playWon')}</Feedback>}
      {result && !won && (
        <Feedback kind="error">
          {t(`learn.playFailed.${result.winner === null ? 'draw' : 'lost'}`)}
        </Feedback>
      )}
      <div className="flex flex-wrap gap-2">
        {!result && (
          <>
            <button
              type="button"
              onClick={() => void game.requestHint()}
              disabled={!learnerToMove}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium disabled:opacity-40"
            >
              {t('bot.hint')}
            </button>
            <button
              type="button"
              onClick={game.takeback}
              disabled={game.thinking || game.history.length === 0}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium disabled:opacity-40"
            >
              {t('bot.takeback')}
            </button>
          </>
        )}
        {(result ? !won : game.history.length > 0) && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium"
          >
            {t('learn.restart')}
          </button>
        )}
      </div>
    </StepLayout>
  )
}
