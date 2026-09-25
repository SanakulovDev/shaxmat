import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { StepLayout } from './shared'
import { type StepProps } from './stepUtils'

export function PuzzlesStepView({ step, onComplete }: StepProps<'puzzles'>) {
  const { t } = useTranslation()
  useEffect(onComplete, [onComplete])

  return (
    <StepLayout>
      <p className="leading-relaxed">{step.text}</p>
      <Link
        to={`/puzzles?theme=${step.theme}`}
        className="inline-block rounded-lg bg-accent px-4 py-2.5 font-semibold text-ink"
      >
        {t('learn.openPuzzles', { theme: t(`puzzles.themes.${step.theme}`) })}
      </Link>
    </StepLayout>
  )
}
