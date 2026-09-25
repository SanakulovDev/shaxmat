import type { Step } from '@shaxmat/content'
import { MoveStepView } from './MoveStepView'
import { PlayStepView } from './PlayStepView'
import { PuzzlesStepView } from './PuzzlesStepView'
import { QuizStepView } from './QuizStepView'
import { StarsStepView } from './StarsStepView'
import { TextStepView } from './TextStepView'

export function StepView({
  step,
  onComplete,
}: {
  step: Step
  onComplete: () => void
}) {
  switch (step.type) {
    case 'text':
      return <TextStepView step={step} onComplete={onComplete} />
    case 'quiz':
      return <QuizStepView step={step} onComplete={onComplete} />
    case 'move':
      return <MoveStepView step={step} onComplete={onComplete} />
    case 'stars':
      return <StarsStepView step={step} onComplete={onComplete} />
    case 'play':
      return <PlayStepView step={step} onComplete={onComplete} />
    case 'puzzles':
      return <PuzzlesStepView step={step} onComplete={onComplete} />
  }
}
