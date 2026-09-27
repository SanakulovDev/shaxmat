import { type PointerEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { MiniBoard } from '../../components/MiniBoard'
import { STAR_POINTS } from '../../components/StarMark'
import { parseFen, play } from '../../chess/scripted'
import { useInView } from '../../lib/useInView'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { OPERA_GAME } from './demos'
import { usePlayback } from './usePlayback'

// Large glyphs drifting behind the hero.
const FLOATERS = [
  { glyph: '♞', left: '4%', top: '12%', size: '7rem', duration: '19s', delay: '-4s' },
  { glyph: '♛', left: '46%', top: '6%', size: '4.5rem', duration: '23s', delay: '-11s' },
  { glyph: '♜', left: '30%', top: '72%', size: '5.5rem', duration: '17s', delay: '-7s' },
  { glyph: '♝', left: '88%', top: '14%', size: '5rem', duration: '21s', delay: '-2s' },
  { glyph: '♚', left: '92%', top: '70%', size: '6.5rem', duration: '25s', delay: '-15s' },
  { glyph: '♟', left: '12%', top: '80%', size: '4rem', duration: '16s', delay: '-9s' },
]

// Small girih stars that twinkle.
const SPARKS = [
  { left: '22%', top: '18%', size: 14, delay: '0s' },
  { left: '58%', top: '30%', size: 10, delay: '-1.5s' },
  { left: '8%', top: '52%', size: 12, delay: '-3s' },
  { left: '96%', top: '44%', size: 9, delay: '-2.2s' },
  { left: '40%', top: '90%', size: 11, delay: '-4s' },
  { left: '70%', top: '86%', size: 13, delay: '-0.8s' },
]

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_38%,rgb(224_165_38/0.2),transparent_50%),radial-gradient(ellipse_at_0%_100%,rgb(31_81_53/0.9),transparent_60%)]" />
      <div className="hero-checker absolute inset-0" />
      {FLOATERS.map(({ glyph, left, top, size, duration, delay }) => (
        <span
          key={`${glyph}-${left}`}
          className="absolute animate-drift font-symbols leading-none text-board-light/[0.06]"
          style={{ left, top, fontSize: size, animationDuration: duration, animationDelay: delay }}
        >
          {glyph}
          {'︎'}
        </span>
      ))}
      {SPARKS.map(({ left, top, size, delay }) => (
        <svg
          key={`${left}-${top}`}
          viewBox="-1.5 -1.5 27 27"
          className="absolute animate-twinkle"
          style={{ left, top, width: size, height: size, animationDelay: delay }}
        >
          <polygon points={STAR_POINTS} fill="#e0a526" />
        </svg>
      ))}
    </div>
  )
}

// The dark first screen. Its text comes from the page; the board plays the
// Opera game on the right.
export function Hero({ children }: { children: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-forest text-board-light">
      <Backdrop />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-16 lg:pb-24 lg:pt-20">
        <div className="min-w-0">{children}</div>
        <OperaBoard />
      </div>
    </section>
  )
}

// Tilts its content towards the mouse, like a board on a table.
function Tilt({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const onPointerMove = (event: PointerEvent) => {
    const element = ref.current
    if (reduced || event.pointerType !== 'mouse' || !element) return
    const box = element.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width - 0.5
    const y = (event.clientY - box.top) / box.height - 0.5
    element.style.transform = `perspective(1000px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`
  }
  const onPointerLeave = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="transition-transform duration-300 ease-out"
    >
      {children}
    </div>
  )
}

function OperaBoard() {
  const { t } = useTranslation()
  const [paused, setPaused] = useState(false)
  const [ref, inView] = useInView<HTMLElement>()
  const { moves, san } = OPERA_GAME
  const { ply, round } = usePlayback(moves.length, {
    playing: inView && !paused,
    startDelay: 1800,
    pace: 1150,
    hold: 5000,
  })
  const reduced = useReducedMotion()

  // After a check, the king of the side to move glows red.
  const last = san[ply - 1]
  const checkedKing =
    last && /[+#]$/.test(last)
      ? play(parseFen(OPERA_GAME.fen), moves.slice(0, ply)).find(
          (piece) => !piece.captured && piece.code === (ply % 2 === 1 ? 'k' : 'K'),
        )?.square
      : undefined
  const mate = ply === moves.length
  const moveNumber = Math.ceil(ply / 2)

  return (
    <figure ref={ref} className="relative mx-auto w-full max-w-sm animate-rise sm:max-w-md lg:max-w-none [animation-delay:300ms]">
      <div
        aria-hidden
        className="absolute -inset-10 -z-10 animate-glow rounded-full bg-accent/20 blur-3xl"
      />
      <div className="animate-float">
        <Tilt>
          <div className="rounded-2xl bg-forest-soft p-2.5 shadow-[0_40px_80px_-24px_rgb(0_0_0/0.7)] ring-1 ring-accent/35 sm:p-3">
            <MiniBoard
              fen={OPERA_GAME.fen}
              moves={moves}
              ply={ply}
              round={round}
              danger={checkedKing}
              drop
              coordinates
              label={t('home.hero.gameLabel')}
              className="w-full rounded-lg"
            />
            <figcaption className="flex items-center gap-3 px-1.5 pb-0.5 pt-3">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display font-semibold text-white">
                  {t('home.hero.gameTitle')}
                </span>
                <span className="block truncate text-sm text-board-light/70">
                  {t('home.hero.gameMeta')}
                </span>
              </span>
              {ply > 0 && (
                <span
                  key={ply}
                  className={`animate-rise rounded-md px-2.5 py-1 font-mono text-sm font-semibold tabular-nums [animation-duration:400ms] ${
                    mate ? 'bg-accent text-ink' : 'bg-white/10 text-white'
                  }`}
                >
                  {mate
                    ? `${moveNumber}. ${last} ${t('board.mate')}`
                    : `${moveNumber}${ply % 2 === 1 ? '.' : '…'} ${last}`}
                </span>
              )}
              {!reduced && (
                <button
                  type="button"
                  onClick={() => setPaused((value) => !value)}
                  aria-label={t(paused ? 'home.hero.play' : 'home.hero.pause')}
                  aria-pressed={paused}
                  className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/20"
                >
                  <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 fill-current">
                    {paused ? (
                      <path d="M4 2.5v11l9-5.5z" />
                    ) : (
                      <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" />
                    )}
                  </svg>
                </button>
              )}
            </figcaption>
          </div>
        </Tilt>
      </div>
    </figure>
  )
}

// A number that counts up the first time it is on screen.
export function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const { i18n } = useTranslation()
  const reduced = useReducedMotion()
  const [ref, inView] = useInView<HTMLSpanElement>({ once: true })
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (!inView || reduced) return
    let frame = 0
    const began = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / 1600)
      setShown(Math.round(value * (1 - (1 - progress) ** 3)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, reduced, value])

  const format = (n: number) => new Intl.NumberFormat(i18n.language).format(n) + suffix
  return (
    <span ref={ref}>
      <span aria-hidden className="tabular-nums">
        {format(reduced ? value : shown)}
      </span>
      <span className="sr-only">{format(value)}</span>
    </span>
  )
}

// Buttons for the dark hero.
export function HeroLink({
  to,
  primary = false,
  children,
}: {
  to: string
  primary?: boolean
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold transition active:scale-[0.97] ${
        primary
          ? 'bg-accent text-ink shadow-[0_10px_30px_-8px_rgb(224_165_38/0.6)] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-8px_rgb(224_165_38/0.7)]'
          : 'border border-board-light/25 bg-white/5 text-white hover:border-board-light/50 hover:bg-white/10'
      }`}
    >
      {children}
      <span aria-hidden className="transition-transform group-hover:translate-x-1">
        →
      </span>
    </Link>
  )
}
