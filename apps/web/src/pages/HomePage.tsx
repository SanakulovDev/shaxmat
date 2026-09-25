import { MAX_BOT_LEVEL } from '@shaxmat/chess-core'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useAuth } from '../auth/store'
import { MiniBoard } from '../components/MiniBoard'
import { StarMark, type StarState } from '../components/StarMark'
import { examStatus, useProgress } from '../features/learn/progress'
import { useContent } from '../features/learn/useContent'

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

// The first screen answers one question: what should I do next?
export function HomePage() {
  const { t } = useTranslation()
  const { lessons: allLessons, stages, lessonsOfStage } = useContent()
  const user = useAuth((state) => state.user)
  const progress = useProgress()

  const done = new Set(progress.data?.lessons.map((l) => l.lessonSlug))
  const next = allLessons.find((lesson) => !done.has(lesson.slug))
  const lessonNumber = next
    ? lessonsOfStage(next.stage).findIndex((l) => l.slug === next.slug) + 1
    : 0
  // The lesson's first position that has pieces; an empty board says little.
  const previewFen =
    next?.steps
      .map((step) => ('fen' in step ? step.fen : undefined))
      .find((fen) => fen !== undefined && /[a-z]/i.test(fen.split(' ')[0]!)) ??
    START_FEN

  const bestWin = Math.max(
    0,
    ...(progress.data?.bots.filter((b) => b.wins > 0).map((b) => b.level) ?? []),
  )
  const nextBot = Math.min(bestWin + 1, MAX_BOT_LEVEL)
  const started = done.size > 0

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          {user && !user.isGuest
            ? t('home.greeting', { name: user.name.split(' ')[0] })
            : t('home.welcome')}
        </h1>
        {!started && <p className="text-lg text-muted">{t('app.tagline')}</p>}
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section
          aria-labelledby="next-lesson"
          className="flex flex-col gap-6 rounded-2xl bg-board-dark p-6 text-board-light sm:flex-row sm:items-center sm:p-8"
        >
          <MiniBoard fen={previewFen} className="w-full max-w-56 self-center sm:w-56" />
          <div className="min-w-0 flex-1 space-y-3">
            {next ? (
              <>
                <p className="text-sm font-medium uppercase tracking-wider text-board-light/80">
                  {t('home.nextLesson', {
                    stage: next.stage,
                    lesson: lessonNumber,
                  })}
                </p>
                <h2 id="next-lesson" className="text-2xl font-semibold sm:text-3xl">
                  {next.title}
                </h2>
                <p className="text-board-light/85">{next.summary}</p>
                <ProgressLine done={done.size} total={allLessons.length} />
                <Link
                  to={`/learn/${next.slug}`}
                  className="inline-block rounded-lg bg-accent px-6 py-3 font-semibold text-ink hover:brightness-105"
                >
                  {t(started ? 'learn.resume' : 'home.startFirst')}
                </Link>
              </>
            ) : (
              <>
                <h2 id="next-lesson" className="text-2xl font-semibold">
                  {t('home.allDone')}
                </h2>
                <Link
                  to="/puzzles"
                  className="inline-block rounded-lg bg-accent px-6 py-3 font-semibold text-ink"
                >
                  {t('nav.puzzles')}
                </Link>
              </>
            )}
          </div>
        </section>

        <nav aria-label={t('home.practice')}>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            <ActionRow
              to="/puzzles"
              glyph="♞"
              title={t('nav.puzzles')}
              detail={
                progress.data
                  ? t('home.puzzleRating', { rating: progress.data.puzzleRating.rating })
                  : t('home.puzzlesDetail')
              }
            />
            <ActionRow
              to={`/bot`}
              glyph="♜"
              title={t('nav.bot')}
              detail={t('home.nextBot', {
                name: t(`bot.levels.${nextBot}.name`),
                level: nextBot,
              })}
            />
            <ActionRow
              glyph="♚"
              title={t('home.friends.title')}
              detail={t('home.soon')}
            />
          </ul>
        </nav>
      </div>

      <section aria-labelledby="stages-title" className="space-y-3">
        <h2 id="stages-title" className="text-xl font-semibold">
          {t('home.path')}
        </h2>
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stages.map((stage) => {
            const lessons = lessonsOfStage(stage.id)
            const finished = lessons.filter((l) => done.has(l.slug)).length
            const state: StarState =
              lessons.length > 0 &&
              finished === lessons.length &&
              examStatus(stage, progress.data).passed
                ? 'done'
                : next?.stage === stage.id
                  ? 'current'
                  : 'todo'
            return (
              <li key={stage.id}>
                <Link
                  to="/learn"
                  className="flex h-full items-center gap-3 rounded-xl border border-line bg-surface p-3 hover:border-board-dark"
                >
                  <StarMark state={state} className="h-10 w-10">
                    {stage.id}
                  </StarMark>
                  <span className="min-w-0">
                    <span className="block font-semibold leading-tight [overflow-wrap:anywhere]">
                      {stage.title}
                    </span>
                    <span className="block text-sm text-muted">
                      {lessons.length > 0
                        ? t('profile.stageLessons', { done: finished, total: lessons.length })
                        : t('home.soon')}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}

function ProgressLine({ done, total }: { done: number; total: number }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-3 text-sm">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-board-light/25"
        role="progressbar"
        aria-label={t('home.courseProgress')}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
      >
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>
      <span className="tabular-nums text-board-light/85">
        {done}/{total}
      </span>
    </div>
  )
}

function ActionRow({
  to,
  glyph,
  title,
  detail,
}: {
  to?: string
  glyph: string
  title: string
  detail: string
}) {
  const body = (
    <>
      <span
        aria-hidden
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-paper text-2xl text-board-dark"
      >
        {glyph}
        {'︎'}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-muted">{detail}</span>
      </span>
      {to && (
        <span aria-hidden className="text-muted">
          →
        </span>
      )}
    </>
  )
  return (
    <li>
      {to ? (
        <Link to={to} className="flex items-center gap-4 px-4 py-4 hover:bg-paper">
          {body}
        </Link>
      ) : (
        <div className="flex items-center gap-4 px-4 py-4 opacity-70">{body}</div>
      )}
    </li>
  )
}
