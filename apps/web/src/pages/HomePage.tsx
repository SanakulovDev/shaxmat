import { MAX_BOT_LEVEL } from '@shaxmat/chess-core'
import type { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useAuth } from '../auth/store'
import { StarMark, type StarState } from '../components/StarMark'
import { CountUp, Hero, HeroLink } from '../features/home/Hero'
import { Facts, Features, SpecialMoves } from '../features/home/InfoSections'
import { PieceGuide } from '../features/home/PieceGuide'
import { Reveal, Section } from '../features/home/Section'
import { examStatus, useProgress } from '../features/learn/progress'
import { useContent } from '../features/learn/useContent'

// Rough size of the imported puzzle set, shown as "20 000+".
const PUZZLE_COUNT = 20000

// Newcomers get a showcase: what the site offers, how the pieces move, and
// a way in. Someone who has finished a lesson sees their next step first.
export function HomePage() {
  const { t } = useTranslation()
  const { lessons: allLessons, stages, lessonsOfStage } = useContent()
  const status = useAuth((state) => state.status)
  const user = useAuth((state) => state.user)
  const progress = useProgress()

  const done = new Set(progress.data?.lessons.map((l) => l.lessonSlug))
  const next = allLessons.find((lesson) => !done.has(lesson.slug))
  const returning = done.size > 0
  // Until the session and progress are known, the hero text waits instead of
  // flashing the newcomer version.
  const loading =
    status === 'loading' || (status === 'authenticated' && progress.isPending)

  const bestWin = Math.max(
    0,
    ...(progress.data?.bots.filter((b) => b.wins > 0).map((b) => b.level) ?? []),
  )
  const nextBot = Math.min(bestWin + 1, MAX_BOT_LEVEL)
  const firstLesson = `/learn/${allLessons[0]!.slug}`

  const path = (
    <Section
      eyebrow={t('home.pathEyebrow')}
      title={t('home.path')}
      subtitle={t('home.pathSubtitle')}
    >
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {stages.map((stage, index) => {
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
              <Reveal delay={index * 70} className="h-full">
                <Link
                  to="/learn"
                  className="flex h-full items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:border-board-dark/40 hover:shadow-lg"
                >
                  <StarMark state={state} className="h-12 w-12 shrink-0">
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
              </Reveal>
            </li>
          )
        })}
      </ol>
    </Section>
  )

  let intro: ReactNode
  if (loading) {
    intro = (
      <div aria-hidden className="space-y-5">
        <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
        <div className="h-12 w-4/5 animate-pulse rounded bg-white/10" />
        <div className="h-32 animate-pulse rounded-2xl bg-white/5" />
      </div>
    )
  } else if (!returning) {
    const stats = [
      { key: 'lessons', value: allLessons.length },
      { key: 'bots', value: MAX_BOT_LEVEL },
      { key: 'puzzles', value: PUZZLE_COUNT, suffix: '+' },
      { key: 'languages', value: 3 },
    ]
    intro = (
      <div className="space-y-7">
        <p className="inline-flex animate-rise items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-sm font-medium text-accent">
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          {t('home.hero.badge')}
        </p>
        <h1 className="animate-rise text-4xl font-semibold leading-[1.08] text-white [animation-delay:100ms] sm:text-5xl lg:text-6xl">
          <Trans i18nKey="home.hero.title" components={{ gold: <span className="text-gleam" /> }} />
        </h1>
        <p className="max-w-xl animate-rise text-lg leading-relaxed text-board-light/80 [animation-delay:200ms]">
          {t('home.hero.lede', { levels: MAX_BOT_LEVEL })}
        </p>
        <div className="flex animate-rise flex-wrap gap-3 [animation-delay:300ms]">
          <HeroLink primary to={firstLesson}>
            {t('home.hero.start')}
          </HeroLink>
          <HeroLink to="/bot">{t('home.hero.playBot')}</HeroLink>
        </div>
        <dl className="grid animate-rise grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-7 [animation-delay:400ms] sm:grid-cols-4">
          {stats.map(({ key, value, suffix }) => (
            <div key={key} className="flex flex-col-reverse gap-1">
              <dt className="text-sm text-board-light/70">
                {t(`home.stats.${key}`, { count: value })}
              </dt>
              <dd className="font-display text-3xl font-semibold text-white">
                <CountUp value={value} suffix={suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    )
  } else {
    const lessonNumber = next
      ? lessonsOfStage(next.stage).findIndex((l) => l.slug === next.slug) + 1
      : 0
    intro = (
      <div className="space-y-6">
        <h1 className="animate-rise text-4xl font-semibold text-white sm:text-5xl">
          {user && !user.isGuest
            ? t('home.greeting', { name: user.name.split(' ')[0] })
            : t('home.welcome')}
        </h1>
        {next ? (
          <>
            <div className="animate-rise space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm [animation-delay:120ms]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                {t('home.nextLesson', { stage: next.stage, lesson: lessonNumber })}
              </p>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">{next.title}</h2>
              <p className="text-board-light/80">{next.summary}</p>
              <ProgressLine done={done.size} total={allLessons.length} />
            </div>
            <div className="flex animate-rise flex-wrap gap-3 [animation-delay:240ms]">
              <HeroLink primary to={`/learn/${next.slug}`}>
                {t('learn.resume')}
              </HeroLink>
              <HeroLink to="/puzzles">{t('nav.puzzles')}</HeroLink>
            </div>
          </>
        ) : (
          <>
            <p className="animate-rise text-lg text-board-light/85 [animation-delay:120ms]">
              {t('home.allDone')}
            </p>
            <div className="flex animate-rise flex-wrap gap-3 [animation-delay:240ms]">
              <HeroLink primary to="/puzzles">
                {t('nav.puzzles')}
              </HeroLink>
              <HeroLink to="/bot">{t('nav.bot')}</HeroLink>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <Hero>{intro}</Hero>
      {returning ? (
        <>
          <Section title={t('home.practice')}>
            <ul className="grid gap-4 md:grid-cols-3">
              <PracticeCard
                to="/puzzles"
                glyph="♞"
                title={t('nav.puzzles')}
                detail={
                  progress.data
                    ? t('home.puzzleRating', { rating: progress.data.puzzleRating.rating })
                    : t('home.puzzlesDetail')
                }
              />
              <PracticeCard
                to="/bot"
                glyph="♜"
                title={t('nav.bot')}
                detail={t('home.nextBot', {
                  name: t(`bot.levels.${nextBot}.name`),
                  level: nextBot,
                })}
              />
              <PracticeCard
                to="/play"
                glyph="♚"
                title={t('home.friends.title')}
                detail={t('home.friends.detail')}
              />
            </ul>
          </Section>
          {path}
          <PieceGuide />
          <SpecialMoves />
          <Facts />
        </>
      ) : (
        <>
          <Features />
          <PieceGuide />
          <SpecialMoves />
          {path}
          <Facts />
          <FinalCall to={firstLesson} />
        </>
      )}
    </>
  )
}

function ProgressLine({ done, total }: { done: number; total: number }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-3 pt-1 text-sm">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-board-light/20"
        role="progressbar"
        aria-label={t('home.courseProgress')}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
      >
        <div
          className="h-full origin-left animate-[grow_900ms_cubic-bezier(0.2,0.7,0.2,1)_400ms_backwards] rounded-full bg-accent"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>
      <span className="tabular-nums text-board-light/85">
        {done}/{total}
      </span>
    </div>
  )
}

function PracticeCard({
  to,
  glyph,
  title,
  detail,
}: {
  to: string
  glyph: string
  title: string
  detail: string
}) {
  return (
    <li>
      <Link
        to={to}
        className="group flex h-full items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-board-dark/40 hover:shadow-lg"
      >
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-board-dark font-symbols text-2xl text-accent transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110"
        >
          {glyph}
          {'︎'}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{title}</span>
          <span className="block text-sm text-muted">{detail}</span>
        </span>
        <span aria-hidden className="text-muted transition-transform group-hover:translate-x-1">
          →
        </span>
      </Link>
    </li>
  )
}

// Closing band that repeats the main call to action.
function FinalCall({ to }: { to: string }) {
  const { t } = useTranslation()
  return (
    <section
      aria-labelledby="cta-title"
      className="relative isolate overflow-hidden bg-forest py-20 text-center text-board-light sm:py-28"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_120%,rgb(224_165_38/0.28),transparent_60%)]"
      />
      <div aria-hidden className="hero-checker absolute inset-0 -z-10" />
      <span
        aria-hidden
        className="absolute left-[8%] top-10 -z-10 animate-drift font-symbols text-8xl text-board-light/[0.06]"
      >
        ♞︎
      </span>
      <span
        aria-hidden
        className="absolute bottom-6 right-[8%] -z-10 animate-drift font-symbols text-9xl text-board-light/[0.06] [animation-delay:-6s]"
      >
        ♛︎
      </span>
      <Reveal className="mx-auto max-w-2xl space-y-5 px-4">
        <h2 id="cta-title" className="text-3xl font-semibold text-white sm:text-5xl">
          {t('home.cta.title')}
        </h2>
        <p className="text-lg text-board-light/80">{t('home.cta.text')}</p>
        <div className="pt-3">
          <HeroLink primary to={to}>
            {t('home.startFirst')}
          </HeroLink>
        </div>
      </Reveal>
    </section>
  )
}
