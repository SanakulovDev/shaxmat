import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Board } from '../../../chess/Board'
import { narrateIfAutoplay } from '../narration'
import { playTone } from '../sounds'
import { Feedback, StepLayout } from './shared'
import { highlightStyles, type StepProps, stepArrows } from './stepUtils'

const noop = () => {}

export function QuizStepView({ step, onComplete }: StepProps<'quiz'>) {
  const { t } = useTranslation()
  const [wrong, setWrong] = useState<number[]>([])
  const [solved, setSolved] = useState(false)

  function choose(index: number) {
    if (solved || wrong.includes(index)) return
    if (index === step.answer) {
      setSolved(true)
      playTone('correct')
      narrateIfAutoplay(step.explanation)
      onComplete()
    } else {
      setWrong([...wrong, index])
      playTone('wrong')
    }
  }

  return (
    <StepLayout
      board={
        step.fen && (
          <Board
            fen={step.fen}
            orientation="white"
            movableColor={null}
            onMove={noop}
            readOnly
            arrows={stepArrows(step.arrows)}
            squareStyles={highlightStyles(step.highlights)}
          />
        )
      }
    >
      <p className="font-semibold leading-relaxed">{step.text}</p>
      <div className="grid gap-2">
        {step.options.map((option, index) => {
          const isAnswer = solved && index === step.answer
          const isWrong = wrong.includes(index)
          return (
            <button
              key={option}
              type="button"
              onClick={() => choose(index)}
              disabled={solved || isWrong}
              className={`rounded-lg border-2 px-4 py-3 text-left text-base font-medium transition ${
                isAnswer
                  ? 'border-green-600 bg-green-50'
                  : isWrong
                    ? 'border-red-300 bg-red-50 text-red-800 line-through'
                    : 'border-line bg-surface hover:border-board-dark'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
      {solved && <Feedback kind="success">{step.explanation}</Feedback>}
      {!solved && wrong.length > 0 && (
        <Feedback kind="error">{t('learn.tryAgain')}</Feedback>
      )}
    </StepLayout>
  )
}
