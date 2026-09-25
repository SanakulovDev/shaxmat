import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { StarMark } from '../../components/StarMark'
import { examStatus, useProgress } from './progress'
import { useContent } from './useContent'

export function LearnPage() {
  const { t } = useTranslation()
  const { lessons: allLessons, stages, lessonsOfStage } = useContent()
  const progress = useProgress()
  const done = new Set(progress.data?.lessons.map((l) => l.lessonSlug))
  const next = allLessons.find((lesson) => !done.has(lesson.slug))
  const percent = Math.round((done.size / allLessons.length) * 100)

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-board-dark p-6 text-board-light">
        <div>
          <h1 className="text-3xl font-semibold">{t('learn.title')}</h1>
          <p className="mt-1 text-board-light/85">
            {t('learn.overall', {
              done: done.size,
              total: allLessons.length,
              percent,
            })}
          </p>
        </div>
        {next && (
          <Link
            to={`/learn/${next.slug}`}
            className="rounded-lg bg-accent px-5 py-3 font-semibold text-ink"
          >
            {t(done.size === 0 ? 'learn.start' : 'learn.resume')}: {next.title}
          </Link>
        )}
      </section>

      {stages.map((stage) => {
        const lessons = lessonsOfStage(stage.id)
        const exam = examStatus(stage, progress.data)
        return (
          <section key={stage.id} className="space-y-3">
            <div className="flex flex-wrap items-baseline gap-x-3 border-b border-line pb-2">
              <h2 className="text-2xl font-semibold">
                {t('learn.stage', { number: stage.id })}. {stage.title}
              </h2>
              <span className="text-sm text-muted">
                {t('learn.rating', { range: stage.ratingRange })}
              </span>
            </div>
            <p className="text-muted">{stage.summary}</p>

            {lessons.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">
                {t('learn.stageSoon')}
              </p>
            ) : (
              <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {lessons.map((lesson, index) => {
                  const complete = done.has(lesson.slug)
                  const isNext = lesson.slug === next?.slug
                  return (
                    <li key={lesson.slug}>
                      <Link
                        to={`/learn/${lesson.slug}`}
                        aria-current={isNext ? 'step' : undefined}
                        className={`flex h-full gap-3 rounded-xl border bg-surface p-4 hover:border-board-dark motion-safe:transition ${
                          isNext ? 'border-lapis ring-2 ring-lapis/25' : 'border-line'
                        }`}
                      >
                        <StarMark
                          state={complete ? 'done' : isNext ? 'current' : 'todo'}
                          className="h-9 w-9"
                        >
                          {index + 1}
                        </StarMark>
                        <span className="min-w-0">
                          {isNext && (
                            <span className="mb-0.5 block text-xs font-semibold uppercase tracking-wider text-lapis">
                              {t('learn.nextUp')}
                            </span>
                          )}
                          <span className="block font-semibold">
                            {lesson.title}
                            {complete && (
                              <span className="sr-only">
                                {' '}
                                ({t('learn.completed')})
                              </span>
                            )}
                          </span>
                          <span className="block text-sm text-muted">
                            {lesson.summary}
                          </span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            )}

            <div className="rounded-xl border border-line bg-surface p-4 text-sm">
              <p className="flex items-center gap-2 font-semibold">
                <StarMark state={exam.passed ? 'done' : 'todo'} className="h-5 w-5" />
                {t('learn.exam.title')}
                {exam.passed && (
                  <span className="sr-only"> — {t('learn.exam.passed')}</span>
                )}
              </p>
              <ul className="mt-2 space-y-1">
                <li>
                  <ExamMark done={exam.bot} />
                  <Link to="/bot" className="underline">
                    {t('learn.exam.bot', { level: stage.exam.botLevel })}
                  </Link>
                </li>
                {stage.exam.puzzlesSolved !== undefined && (
                  <li>
                    <ExamMark done={exam.puzzlesSolved === true} />
                    <Link to="/puzzles" className="underline">
                      {t('learn.exam.puzzlesSolved', {
                        count: stage.exam.puzzlesSolved,
                        done: progress.data?.puzzlesSolved ?? 0,
                      })}
                    </Link>
                  </li>
                )}
                {stage.exam.puzzleRating !== undefined && (
                  <li>
                    <ExamMark done={exam.puzzleRating === true} />
                    <Link to="/puzzles" className="underline">
                      {t('learn.exam.puzzleRating', {
                        rating: stage.exam.puzzleRating,
                        current: progress.data?.puzzleRating.rating ?? '—',
                      })}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </section>
        )
      })}
    </div>
  )
}

function ExamMark({ done }: { done: boolean }) {
  const { t } = useTranslation()
  return (
    <>
      <span aria-hidden>{done ? '✅' : '⬜'} </span>
      <span className="sr-only">
        {t(done ? 'learn.exam.done' : 'learn.exam.notDone')}:{' '}
      </span>
    </>
  )
}
