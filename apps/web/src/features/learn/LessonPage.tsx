import { narrationText } from '@shaxmat/content'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useParams } from 'react-router'
import { NarrationControls } from './NarrationControls'
import { narrateIfAutoplay, stopNarration } from './narration'
import { completeLesson } from './progress'
import { StepView } from './steps/StepView'
import { useContent } from './useContent'

export function LessonPage() {
  const { slug = '' } = useParams()
  const { findLesson } = useContent()
  const lesson = findLesson(slug)
  if (!lesson) return <Navigate to="/learn" replace />
  // A new key resets the player when moving to another lesson.
  return <LessonPlayer key={lesson.slug} slug={lesson.slug} />
}

function LessonPlayer({ slug }: { slug: string }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { findLesson, lessons } = useContent()
  // Changing the language keeps the step; only the words change.
  const lesson = findLesson(slug)!
  const [index, setIndex] = useState(0)
  // Highest step index the learner has completed.
  const [completedUpTo, setCompletedUpTo] = useState(-1)
  const [finished, setFinished] = useState(false)
  const stepRef = useRef<HTMLElement>(null)
  const doneHeadingRef = useRef<HTMLHeadingElement>(null)
  const shownIndex = useRef(index)

  const step = lesson.steps[index]!
  const stepDone = completedUpTo >= index
  const isLast = index === lesson.steps.length - 1
  const nextLesson = lessons[lessons.findIndex((l) => l.slug === slug) + 1]

  const onComplete = useCallback(() => {
    setCompletedUpTo((done) => Math.max(done, index))
  }, [index])

  useEffect(() => {
    if (!finished) narrateIfAutoplay(narrationText(step))
  }, [step, finished])

  useEffect(() => stopNarration, [])

  // Keyboard and screen reader users land on the new step, not on the
  // button they pressed. The first step keeps the page's normal focus.
  useEffect(() => {
    if (shownIndex.current === index) return
    shownIndex.current = index
    stepRef.current?.focus()
  }, [index])

  useEffect(() => {
    if (finished) doneHeadingRef.current?.focus()
  }, [finished])

  async function finish() {
    stopNarration()
    setFinished(true)
    await completeLesson(slug).catch(() => undefined)
    await queryClient.invalidateQueries({ queryKey: ['progress'] })
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-md space-y-5 rounded-2xl border border-line bg-surface p-8 text-center">
        <p className="text-5xl" aria-hidden>
          🎉
        </p>
        <h1
          ref={doneHeadingRef}
          tabIndex={-1}
          className="text-2xl font-bold outline-none"
        >
          {t('learn.lessonDone')}
        </h1>
        <p className="text-muted">{lesson.title}</p>
        <div className="flex flex-col gap-2">
          {nextLesson && (
            <Link
              to={`/learn/${nextLesson.slug}`}
              className="rounded-lg bg-board-dark px-4 py-3 font-semibold text-white"
            >
              {t('learn.nextLesson')}: {nextLesson.title}
            </Link>
          )}
          <Link
            to="/learn"
            className="rounded-lg border border-line px-4 py-3 font-medium"
          >
            {t('learn.backToLessons')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/learn"
              className="text-sm text-muted hover:underline"
            >
              ← {t('learn.backToLessons')}
            </Link>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
          </div>
          <NarrationControls text={narrationText(step)} />
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-label={t('learn.progress')}
          aria-valuemin={0}
          aria-valuemax={lesson.steps.length}
          aria-valuenow={index + (stepDone ? 1 : 0)}
        >
          <div
            className="h-full rounded-full bg-board-dark motion-safe:transition-all"
            style={{
              width: `${((index + (stepDone ? 1 : 0)) / lesson.steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <section
        ref={stepRef}
        tabIndex={-1}
        aria-label={t('learn.stepLabel', {
          current: index + 1,
          total: lesson.steps.length,
        })}
        className="outline-none"
      >
        <StepView key={index} step={step} onComplete={onComplete} />
      </section>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <button
          type="button"
          onClick={() => setIndex(index - 1)}
          disabled={index === 0}
          className="rounded-lg px-4 py-2.5 font-medium text-muted hover:bg-paper disabled:invisible"
        >
          ← {t('learn.back')}
        </button>
        <span className="text-sm text-muted">
          {index + 1} / {lesson.steps.length}
        </span>
        <button
          type="button"
          onClick={() => (isLast ? void finish() : setIndex(index + 1))}
          disabled={!stepDone}
          className="rounded-lg bg-accent px-6 py-2.5 font-semibold text-ink disabled:opacity-40"
        >
          {t(isLast ? 'learn.finish' : 'learn.continue')} →
        </button>
      </div>
    </div>
  )
}
