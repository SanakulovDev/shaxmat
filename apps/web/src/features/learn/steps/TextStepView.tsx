import { useEffect } from 'react'
import { Board } from '../../../chess/Board'
import { StepLayout } from './shared'
import { highlightStyles, type StepProps, stepArrows } from './stepUtils'

const noop = () => {}

export function TextStepView({ step, onComplete }: StepProps<'text'>) {
  useEffect(onComplete, [onComplete])

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
      <p className="leading-relaxed">{step.text}</p>
    </StepLayout>
  )
}
