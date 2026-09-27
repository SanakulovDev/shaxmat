import { type KeyboardEvent, useCallback, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { parseFen, reach, squareIndex } from '../../chess/scripted'
import { PIECE_DEMOS, type PieceDemo } from './demos'
import { LoopingBoard } from './LoopingBoard'
import { Reveal, Section } from './Section'

const GLYPHS: Record<PieceDemo['kind'], string> = {
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
}

// One tab per piece. The tabs step forward by themselves after each demo,
// except while the pointer is over them, and stop once the visitor focuses
// or picks one.
export function PieceGuide() {
  const { t } = useTranslation()
  const [state, setState] = useState({ index: 0, auto: true })
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()
  const demo = PIECE_DEMOS[state.index]!
  const name = t(`home.pieces.${demo.kind}.name`)

  const hovering = useRef(false)
  const advance = useCallback(() => {
    if (hovering.current) return
    setState((current) =>
      current.auto ? { index: (current.index + 1) % PIECE_DEMOS.length, auto: true } : current,
    )
  }, [])
  const stopAuto = () => setState((current) => ({ ...current, auto: false }))
  const select = (index: number) => {
    setState({ index, auto: false })
    tabs.current[index]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const last = PIECE_DEMOS.length - 1
    const target = {
      ArrowRight: state.index === last ? 0 : state.index + 1,
      ArrowLeft: state.index === 0 ? last : state.index - 1,
      Home: 0,
      End: last,
    }[event.key]
    if (target === undefined) return
    event.preventDefault()
    select(target)
  }

  return (
    <Section
      eyebrow={t('home.pieces.eyebrow')}
      title={t('home.pieces.title')}
      subtitle={t('home.pieces.subtitle')}
      className="border-y border-line bg-surface"
    >
      <Reveal>
        <div
          onPointerEnter={() => {
            hovering.current = true
          }}
          onPointerLeave={() => {
            hovering.current = false
          }}
          onFocus={stopAuto}
        >
          <div
            role="tablist"
            aria-label={t('home.pieces.tabs')}
            onKeyDown={onKeyDown}
            className="mx-auto mb-8 grid max-w-3xl grid-cols-3 gap-2 sm:grid-cols-6"
          >
            {PIECE_DEMOS.map(({ kind }, index) => {
              const selected = index === state.index
              return (
                <button
                  key={kind}
                  ref={(element) => {
                    tabs.current[index] = element
                  }}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${kind}`}
                  aria-selected={selected}
                  aria-controls={`${id}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(index)}
                  className={`group flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-sm font-semibold transition ${
                    selected
                      ? 'border-board-dark bg-board-dark text-board-light shadow-lg'
                      : 'border-line bg-paper text-ink hover:-translate-y-0.5 hover:border-board-dark/40'
                  }`}
                >
                  <span
                    aria-hidden
                    className={`font-symbols text-3xl leading-none transition-transform group-hover:scale-110 ${
                      selected ? 'text-accent' : 'text-board-dark'
                    }`}
                  >
                    {GLYPHS[kind]}
                    {'︎'}
                  </span>
                  {t(`home.pieces.${kind}.name`)}
                </button>
              )
            })}
          </div>

          <div
            role="tabpanel"
            id={`${id}-panel`}
            aria-labelledby={`${id}-tab-${demo.kind}`}
            className="grid items-center gap-8 md:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] md:gap-12"
          >
            <LoopingBoard
              key={demo.kind}
              fen={demo.fen}
              moves={demo.moves}
              marks={reach(parseFen(demo.fen), squareIndex(demo.from))}
              keepMarks={demo.keepMarks}
              coordinates
              label={t('home.pieces.boardLabel', { piece: name })}
              pace={900}
              hold={1400}
              onRound={advance}
              className="mx-auto w-full max-w-sm md:max-w-none"
            />
            <div key={`${demo.kind}-text`} className="animate-rise space-y-4 [animation-duration:500ms]">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-3xl font-semibold">{name}</h3>
                <span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-semibold text-ink">
                  {demo.value === null
                    ? t('home.pieces.priceless')
                    : t('home.pieces.value', { count: demo.value })}
                </span>
              </div>
              <p className="text-lg leading-relaxed">{t(`home.pieces.${demo.kind}.moves`)}</p>
              <p className="rounded-xl border-l-4 border-accent bg-paper px-4 py-3 text-muted">
                <span className="font-semibold text-ink">{t('home.pieces.tip')}: </span>
                {t(`home.pieces.${demo.kind}.tip`)}
              </p>
              <Link
                to={`/learn/${demo.lesson}`}
                className="group inline-flex items-center gap-2 font-semibold text-lapis hover:underline"
              >
                {t('home.pieces.lesson', { piece: name })}
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
