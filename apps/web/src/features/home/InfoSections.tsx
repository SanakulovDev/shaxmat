import { MAX_BOT_LEVEL } from '@shaxmat/chess-core'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { STAR_POINTS } from '../../components/StarMark'
import { SPECIAL_MOVES } from './demos'
import { LoopingBoard } from './LoopingBoard'
import { Reveal, Section } from './Section'

const FEATURES = [
  { key: 'lessons', to: '/learn', glyph: '♔' },
  { key: 'bot', to: '/bot', glyph: '♖' },
  { key: 'puzzles', to: '/puzzles', glyph: '♘' },
  { key: 'friends', to: '/play', glyph: '♕' },
] as const

export function Features() {
  const { t } = useTranslation()
  return (
    <Section
      eyebrow={t('home.features.eyebrow')}
      title={t('home.features.title')}
      subtitle={t('home.features.subtitle')}
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ key, to, glyph }, index) => (
          <li key={key}>
            <Reveal delay={index * 90} className="h-full">
              <Link
                to={to}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-board-dark/30 hover:shadow-xl"
              >
                <span
                  aria-hidden
                  className="absolute -bottom-6 -right-3 font-symbols text-[8rem] leading-none text-board-dark/[0.05] transition duration-500 group-hover:-rotate-12 group-hover:text-board-dark/10"
                >
                  {glyph}
                  {'︎'}
                </span>
                <span
                  aria-hidden
                  className="mb-5 flex size-14 items-center justify-center rounded-xl bg-board-dark font-symbols text-3xl text-accent shadow-md ring-4 ring-accent/15 transition group-hover:scale-105"
                >
                  {glyph}
                  {'︎'}
                </span>
                <h3 className="text-xl font-semibold">
                  {t(`home.features.${key}.title`, { levels: MAX_BOT_LEVEL })}
                </h3>
                <p className="mt-2 flex-1 text-muted">{t(`home.features.${key}.text`)}</p>
                <span className="mt-5 inline-flex items-center gap-2 font-semibold text-board-dark">
                  {t(`home.features.${key}.link`)}
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}

export function SpecialMoves() {
  const { t } = useTranslation()
  return (
    <Section
      eyebrow={t('home.special.eyebrow')}
      title={t('home.special.title')}
      subtitle={t('home.special.subtitle')}
    >
      <ul className="grid gap-6 md:grid-cols-3">
        {SPECIAL_MOVES.map((move, index) => (
          <li key={move.id}>
            <Reveal delay={index * 120} className="h-full">
              <article className="flex h-full flex-col rounded-2xl border border-line bg-surface p-4 shadow-sm">
                <LoopingBoard
                  fen={move.fen}
                  moves={move.moves}
                  label={t(`home.special.${move.id}.title`)}
                  pace={1300}
                  hold={2800}
                />
                <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
                  <h3 className="text-xl font-semibold">{t(`home.special.${move.id}.title`)}</h3>
                  <p className="mt-2 flex-1 text-muted">{t(`home.special.${move.id}.text`)}</p>
                  <Link
                    to={`/learn/${move.lesson}`}
                    className="group mt-4 inline-flex items-center gap-2 font-semibold text-lapis hover:underline"
                  >
                    {t('home.special.lesson')}
                    <span aria-hidden className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}

const FACTS = ['afrasiab', 'timur', 'shannon'] as const

export function Facts() {
  const { t } = useTranslation()
  return (
    <section
      aria-labelledby="facts-title"
      className="relative isolate overflow-hidden bg-board-dark py-16 text-board-light sm:py-24"
    >
      <div aria-hidden className="hero-checker absolute inset-0 -z-10" />
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            {t('home.facts.eyebrow')}
          </p>
          <h2 id="facts-title" className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            {t('home.facts.title')}
          </h2>
        </Reveal>
        <ul className="grid gap-5 md:grid-cols-3">
          {FACTS.map((fact, index) => (
            <li key={fact}>
              <Reveal delay={index * 120} className="h-full">
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:bg-white/10">
                  <svg aria-hidden viewBox="-1.5 -1.5 27 27" className="mb-4 size-7">
                    <polygon
                      points={STAR_POINTS}
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="font-display text-4xl font-semibold text-accent">
                    {t(`home.facts.${fact}.value`)}
                  </p>
                  <p className="mt-3 leading-relaxed text-board-light/85">
                    {t(`home.facts.${fact}.text`)}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
