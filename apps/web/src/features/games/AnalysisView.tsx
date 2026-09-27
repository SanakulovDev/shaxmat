import { advantage, type Judgement, reviewGame, type Side, winPercent } from '@shaxmat/chess-core'
import { Chess, type PieceSymbol } from 'chess.js'
import type { TFunction } from 'i18next'
import { type ReactNode, useEffect, useId, useMemo, useState } from 'react'
import type { Arrow } from 'react-chessboard'
import { useTranslation } from 'react-i18next'
import { Board, type BoardMove } from '../../chess/Board'
import type { EngineLine } from '../../chess/engine'
import { MoveList, type MoveNote } from '../../chess/MoveList'
import {
  clockAt,
  finalVerdict,
  formatEval,
  formatLine,
  formatSeconds,
  material,
  type PositionEval,
  toWhite,
  turnOf,
  uciToSan,
} from './analysis'
import { useRunningClock } from './clock'
import { EvalBar } from './EvalBar'
import { EvalGraph } from './EvalGraph'
import { JUDGEMENT_STYLE } from './judgement'
import type { ParsedGame } from './pgn'
import { useGameReview, usePositionEval } from './useAnalysis'

export type Player = {
  name: string
  title?: string
  rating?: number
  team?: string
}

type Step = { san: string; uci: string; fen: string }
// Moves tried on the board, branching off the game after `base` moves.
type Sideline = { base: number; moves: Step[] }

const BEST_ARROW = 'rgba(30, 79, 138, 0.8)'

// A game on a board with Stockfish beside it: who is better and by how
// much, the best lines, and a review of every move. Visitors can try their
// own moves; the game stays as it was.
export function AnalysisView({
  game,
  players,
  live = false,
  lastMoveAt,
  children,
}: {
  game: ParsedGame
  players: Record<Side, Player>
  // New moves keep arriving; the board follows them from the last move.
  live?: boolean
  // When the last move was made (ms), so the clock of the side to move runs.
  lastMoveAt?: number
  // The heading card: names, event, story.
  children: ReactNode
}) {
  const { t } = useTranslation()
  const fens = useMemo(() => [game.startFen, ...game.moves.map((m) => m.fen)], [game])
  const history = useMemo(() => {
    const chess = new Chess(game.startFen)
    for (const move of game.moves) chess.move(move.san)
    return chess.history({ verbose: true })
  }, [game])
  const total = game.moves.length
  const firstMover = turnOf(game.startFen)

  const [viewPly, setViewPly] = useState<number | null>(null)
  const [sideline, setSideline] = useState<Sideline | null>(null)
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [showBest, setShowBest] = useState(true)

  // null follows the last move, so a live game moves on by itself.
  const ply = Math.min(viewPly ?? total, total)
  const tip = sideline?.moves.at(-1)
  const fen = tip?.fen ?? fens[ply]!
  const lastUci = tip?.uci ?? game.moves[(sideline?.base ?? ply) - 1]?.uci

  const stored = useGameReview(fens)
  const scores = useMemo(() => fens.map((f) => stored.get(f)?.cp), [fens, stored])
  const review = useMemo(() => reviewGame(scores, firstMover), [scores, firstMover])
  const scored = scores.filter((score) => score !== undefined).length

  const search = usePositionEval(fen)
  const final = useMemo(() => finalVerdict(fen), [fen])
  const top = search?.lines[0]
  const saved = stored.get(fen)
  const evaluation: PositionEval | null =
    final ?? (top && (!saved || top.depth >= saved.depth) ? toWhite(top, fen) : (saved ?? null))

  function goTo(target: number) {
    setSideline(null)
    const clamped = Math.max(0, Math.min(total, target))
    setViewPly(clamped >= total ? null : clamped)
  }
  function back() {
    if (!sideline) return goTo(ply - 1)
    setSideline(
      sideline.moves.length > 1 ? { ...sideline, moves: sideline.moves.slice(0, -1) } : null,
    )
  }
  function forward() {
    if (!sideline) goTo(ply + 1)
  }

  function onMove(move: BoardMove) {
    let played
    try {
      played = new Chess(fen).move(move)
    } catch {
      return
    }
    // Playing the game's own next move just steps forward.
    if (!sideline && game.moves[ply]?.uci === played.lan) return goTo(ply + 1)
    const step = { san: played.san, uci: played.lan, fen: played.after }
    setSideline(
      sideline
        ? { ...sideline, moves: [...sideline.moves, step] }
        : { base: ply, moves: [step] },
    )
  }

  // Arrow keys step through the game, unless focus is in a text field.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if ((event.target as Element).closest('input, textarea, select')) return
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      if (event.key === 'ArrowLeft') back()
      else forward()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const bestMove = showBest && !final ? evaluation?.best : null
  const arrows: Arrow[] = bestMove
    ? [{ startSquare: bestMove.slice(0, 2), endSquare: bestMove.slice(2, 4), color: BEST_ARROW }]
    : []

  const notes: (MoveNote | null)[] = review.judgements.map((judgement) =>
    judgement
      ? {
          symbol: JUDGEMENT_STYLE[judgement].symbol,
          label: t(`games.analysis.judgement.${judgement}`),
          className: JUDGEMENT_STYLE[judgement].text,
        }
      : null,
  )

  const clocks = game.moves.map((m) => m.clock)
  const shownPly = sideline?.base ?? ply
  const balance = material(fen)
  const topSide: Side = orientation === 'white' ? 'b' : 'w'
  const toMove = turnOf(fen)
  const clockRuns = live && !sideline && ply === total && !final
  const strip = (side: Side) => (
    <PlayerStrip
      side={side}
      player={players[side]}
      clock={clockAt(clocks, firstMover, side, shownPly)}
      running={clockRuns && toMove === side}
      since={lastMoveAt}
      extra={balance.extra[side]}
      lead={side === 'w' ? balance.diff : -balance.diff}
    />
  )

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 [grid-template-areas:'head'_'board'_'state'_'moves'_'review'] lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_auto_auto_1fr] lg:gap-x-8 lg:[grid-template-areas:'board_head'_'board_state'_'board_moves'_'board_review']">
      <div className="[grid-area:head]">{children}</div>

      <div className="mx-auto w-full max-w-[min(100%,calc(100dvh-9rem),44rem)] space-y-3 [grid-area:board] lg:sticky lg:top-4">
        <div>
          {strip(topSide)}
          <div className="flex gap-2">
            <EvalBar
              evaluation={evaluation}
              orientation={orientation}
              label={
                evaluation
                  ? `${t('games.analysis.evaluation')}: ${formatEval(evaluation)}`
                  : t('games.analysis.thinking')
              }
            />
            <div className="min-w-0 flex-1">
              <Board
                fen={fen}
                orientation={orientation}
                movableColor={final ? null : toMove}
                onMove={onMove}
                lastMove={lastUci ? { from: lastUci.slice(0, 2), to: lastUci.slice(2, 4) } : null}
                arrows={arrows}
                readOnly
              />
            </div>
          </div>
          {strip(topSide === 'w' ? 'b' : 'w')}
        </div>

        <Controls
          ply={ply}
          total={total}
          inSideline={sideline !== null}
          onGo={goTo}
          onBack={back}
          onFlip={() => setOrientation((o) => (o === 'white' ? 'black' : 'white'))}
        />

        <div aria-live="polite">
          {sideline && (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border-2 border-lapis/40 bg-lapis/5 px-4 py-3 text-sm">
              <span className="min-w-0 flex-1">
                <span className="font-semibold text-lapis">{t('games.analysis.sideline')}: </span>
                <span className="font-mono">
                  {formatLine(fens[sideline.base]!, sideline.moves.map((m) => m.uci), 40)}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setSideline(null)}
                className="rounded-lg bg-lapis px-3 py-1.5 font-semibold text-white hover:brightness-110"
              >
                {t('games.analysis.backToGame')}
              </button>
            </p>
          )}
        </div>

        <EvalGraph
          scores={scores}
          judgements={review.judgements}
          current={shownPly}
          onSelect={goTo}
          label={t('games.analysis.graph')}
        />
      </div>

      <Situation
        fen={fen}
        evaluation={evaluation}
        final={final !== null}
        lines={search?.lines ?? []}
        depth={search?.lines[0]?.depth ?? saved?.depth ?? 0}
        done={search?.done ?? false}
        showBest={showBest}
        onShowBest={setShowBest}
        lastMove={
          !sideline && ply > 0
            ? {
                judgement: review.judgements[ply - 1] ?? null,
                number: Number(history[ply - 1]!.before.split(' ')[5]),
                side: history[ply - 1]!.color,
                san: game.moves[ply - 1]!.san,
                better: betterMove(fens[ply - 1]!, stored.get(fens[ply - 1]!), game.moves[ply - 1]!.uci),
              }
            : null
        }
      />

      <div className="space-y-2 [grid-area:moves]">
        <h2 className="font-display text-lg font-semibold">{t('games.analysis.moves')}</h2>
        {history.length > 0 ? (
          <MoveList
            moves={history}
            label={t('games.analysis.moves')}
            current={sideline ? undefined : ply}
            onSelect={goTo}
            notes={notes}
          />
        ) : (
          <p className="text-sm text-muted">{t('games.analysis.noMoves')}</p>
        )}
      </div>

      <ReviewSummary
        players={players}
        review={review}
        progress={fens.length > 0 ? scored / fens.length : 1}
      />
    </div>
  )
}

function betterMove(fen: string, before: PositionEval | undefined, played: string) {
  if (!before?.best || before.best === played) return null
  return uciToSan(fen, before.best)
}

const CAPTURED_GLYPHS: Record<Side, Record<string, string>> = {
  // Pieces White is up, drawn as the black pieces it took.
  w: { q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
  b: { q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
}

function PlayerStrip({
  side,
  player,
  clock,
  running,
  since,
  extra,
  lead,
}: {
  side: Side
  player: Player
  clock: number | null
  running: boolean
  since: number | undefined
  extra: PieceSymbol[]
  lead: number
}) {
  const { t } = useTranslation()
  const shown = useRunningClock(clock, since, running)
  return (
    <div className="flex min-h-11 items-center gap-2 py-1.5 text-sm">
      <span
        aria-hidden
        className={`size-3.5 shrink-0 rounded-full ring-1 ring-ink/40 ${side === 'w' ? 'bg-white' : 'bg-ink'}`}
      />
      <span className="sr-only">{t(`board.sides.${side}`)}: </span>
      {player.title && (
        <span className="shrink-0 rounded bg-accent/25 px-1 py-px text-xs font-bold text-[#7a5200]">
          {player.title}
        </span>
      )}
      <span className="min-w-0 truncate font-semibold">{player.name}</span>
      {player.rating ? (
        <span className="shrink-0 tabular-nums text-muted">{player.rating}</span>
      ) : null}
      {player.team && (
        <span className="hidden min-w-0 truncate text-muted sm:inline">· {player.team}</span>
      )}
      {(extra.length > 0 || lead > 0) && (
        <span className="flex shrink-0 items-center gap-1 text-muted">
          <span aria-hidden className="font-symbols text-base leading-none tracking-[-0.2em]">
            {extra.map((piece) => `${CAPTURED_GLYPHS[side][piece]}︎`).join('')}
          </span>
          {lead > 0 && (
            <span className="text-xs font-semibold">
              +{lead}
              <span className="sr-only"> {t('games.analysis.materialUp', { count: lead })}</span>
            </span>
          )}
        </span>
      )}
      {shown !== null && (
        <span
          className={`ml-auto shrink-0 rounded-md px-2.5 py-1 font-mono text-base font-semibold tabular-nums ${
            running ? 'bg-board-dark text-white' : 'bg-surface text-ink ring-1 ring-line'
          }`}
        >
          <span className="sr-only">{t('games.analysis.clock')}: </span>
          {formatSeconds(shown)}
        </span>
      )}
    </div>
  )
}

function Controls({
  ply,
  total,
  inSideline,
  onGo,
  onBack,
  onFlip,
}: {
  ply: number
  total: number
  inSideline: boolean
  onGo: (ply: number) => void
  onBack: () => void
  onFlip: () => void
}) {
  const { t } = useTranslation()
  const buttons = [
    { key: 'first', glyph: '⏮', action: () => onGo(0), disabled: ply === 0 && !inSideline },
    { key: 'prev', glyph: '◀', action: onBack, disabled: ply === 0 && !inSideline },
    { key: 'next', glyph: '▶', action: () => onGo(ply + 1), disabled: inSideline || ply >= total },
    { key: 'last', glyph: '⏭', action: () => onGo(total), disabled: !inSideline && ply >= total },
  ]
  const button =
    'rounded-lg border border-line bg-surface py-2 hover:bg-paper disabled:opacity-40'
  return (
    <div className="grid grid-cols-[repeat(4,1fr)_auto] gap-1.5">
      <div className="contents" role="group" aria-label={t('play.game.nav.label')}>
        {buttons.map(({ key, glyph, action, disabled }) => (
          <button
            key={key}
            type="button"
            onClick={action}
            disabled={disabled}
            aria-label={t(`play.game.nav.${key}`)}
            className={button}
          >
            <span aria-hidden>{glyph}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onFlip}
        aria-label={t('games.analysis.flip')}
        title={t('games.analysis.flip')}
        className={`${button} px-3`}
      >
        <span aria-hidden>⇅</span>
      </button>
    </div>
  )
}

type LastMove = {
  judgement: Judgement | null
  number: number
  side: Side
  san: string
  better: string | null
}

function verdict(t: TFunction, evaluation: PositionEval | null, final: boolean): string {
  if (!evaluation) return t('games.analysis.thinking')
  const side = (s: Side) => t(`games.analysis.sides.${s}`)
  if (evaluation.mate === 0) {
    return t('games.analysis.checkmate', { side: side(evaluation.cp > 0 ? 'w' : 'b') })
  }
  if (final) return t('games.analysis.drawn')
  if (evaluation.mate !== null) {
    return t('games.analysis.mateIn', {
      side: side(evaluation.mate > 0 ? 'w' : 'b'),
      count: Math.abs(evaluation.mate),
    })
  }
  const { side: leader, level } = advantage(evaluation.cp)
  if (leader === null) return t('games.analysis.level.equal')
  return t(`games.analysis.level.${level}`, { side: side(leader) })
}

function Situation({
  fen,
  evaluation,
  final,
  lines,
  depth,
  done,
  showBest,
  onShowBest,
  lastMove,
}: {
  fen: string
  evaluation: PositionEval | null
  final: boolean
  lines: EngineLine[]
  depth: number
  done: boolean
  showBest: boolean
  onShowBest: (show: boolean) => void
  lastMove: LastMove | null
}) {
  const { t, i18n } = useTranslation()
  const titleId = useId()
  const white = evaluation ? Math.round(winPercent(evaluation.cp)) : 50
  const pawns =
    evaluation && evaluation.mate === null && !final
      ? new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(
          Math.abs(evaluation.cp) / 100,
        )
      : null
  const leader = evaluation && evaluation.cp !== 0 ? (evaluation.cp > 0 ? 'w' : 'b') : null

  return (
    <section
      aria-labelledby={titleId}
      className="space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-sm [grid-area:state]"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={titleId} className="font-display text-lg font-semibold">
          {t('games.analysis.situation')}
        </h2>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          {!final && !done && (
            <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-accent" />
          )}
          {final ? '' : depth > 0 ? t('games.analysis.depth', { depth }) : t('games.analysis.thinking')}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`shrink-0 rounded-lg px-2.5 py-1.5 font-mono text-xl font-bold tabular-nums ${
            leader === 'b' ? 'bg-ink text-white' : 'bg-paper text-ink ring-1 ring-line'
          }`}
        >
          {evaluation ? formatEval(evaluation) : '…'}
        </span>
        <p className="min-w-0 font-semibold leading-snug" aria-live="polite">
          {verdict(t, evaluation, final)}
          {pawns && evaluation && Math.abs(evaluation.cp) >= 35 && (
            <span className="block text-sm font-normal text-muted">
              {t('games.analysis.pawns', { value: pawns })}
            </span>
          )}
        </p>
      </div>

      <div>
        <p className="mb-1.5 flex justify-between text-xs font-semibold">
          <span>
            {t('games.analysis.sides.w')} {white}%
          </span>
          <span className="text-muted">{t('games.analysis.chances')}</span>
          <span>
            {100 - white}% {t('games.analysis.sides.b')}
          </span>
        </p>
        <div
          aria-hidden
          className="h-2.5 overflow-hidden rounded-full bg-[#3b3833] ring-1 ring-line"
        >
          <div
            className="h-full rounded-full bg-[#f6f3ec] transition-[width] duration-700 motion-reduce:transition-none"
            style={{ width: `${white}%` }}
          />
        </div>
      </div>

      {lastMove?.judgement && (
        <p
          className={`rounded-xl border-l-4 bg-paper px-3 py-2 text-sm ${
            lastMove.judgement === 'blunder'
              ? 'border-[#df5353]'
              : lastMove.judgement === 'mistake'
                ? 'border-[#e69f00]'
                : 'border-[#56b4e9]'
          }`}
        >
          <span className="font-semibold">
            {lastMove.number}
            {lastMove.side === 'w' ? '.' : '…'} {lastMove.san}
            <span className={JUDGEMENT_STYLE[lastMove.judgement].text}>
              {JUDGEMENT_STYLE[lastMove.judgement].symbol}
            </span>{' '}
            — {t(`games.analysis.judgement.${lastMove.judgement}`)}.
          </span>{' '}
          {lastMove.better && t('games.analysis.better', { move: lastMove.better })}
        </p>
      )}

      {!final && (
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-muted">{t('games.analysis.lines')}</h3>
          {lines.length === 0 ? (
            <p className="text-sm text-muted">{t('games.analysis.thinking')}</p>
          ) : (
            <ol className="space-y-1 text-sm">
              {lines.map((line) => {
                const score = toWhite(line, fen)
                return (
                  <li key={line.pv.join(' ')} className="flex gap-2">
                    <span
                      className={`w-14 shrink-0 rounded px-1.5 py-0.5 text-center font-mono text-xs font-bold tabular-nums ${
                        score.cp < 0 ? 'bg-ink text-white' : 'bg-paper text-ink ring-1 ring-line'
                      }`}
                    >
                      {formatEval(score)}
                    </span>
                    <span className="min-w-0 truncate font-mono text-[13px]">
                      {formatLine(fen, line.pv, 10)}
                    </span>
                  </li>
                )
              })}
            </ol>
          )}
          <label className="flex items-center gap-2 pt-1 text-sm">
            <input
              type="checkbox"
              checked={showBest}
              onChange={(event) => onShowBest(event.target.checked)}
              className="size-4 accent-lapis"
            />
            {t('games.analysis.showBest')}
          </label>
        </div>
      )}
    </section>
  )
}

function ReviewSummary({
  players,
  review,
  progress,
}: {
  players: Record<Side, Player>
  review: ReturnType<typeof reviewGame>
  progress: number
}) {
  const { t } = useTranslation()
  const titleId = useId()
  const sides = [
    { side: 'w' as const, summary: review.white },
    { side: 'b' as const, summary: review.black },
  ]
  const rows = [
    { key: 'inaccuracy', count: (s: typeof review.white) => s.inaccuracies },
    { key: 'mistake', count: (s: typeof review.white) => s.mistakes },
    { key: 'blunder', count: (s: typeof review.white) => s.blunders },
  ] as const

  return (
    <section
      aria-labelledby={titleId}
      className="space-y-3 rounded-2xl border border-line bg-surface p-5 shadow-sm [grid-area:review]"
    >
      <h2 id={titleId} className="font-display text-lg font-semibold">
        {t('games.analysis.review')}
      </h2>
      {progress < 1 && (
        <div className="space-y-1">
          <p className="text-sm text-muted">
            {t('games.analysis.reviewing', { percent: Math.floor(progress * 100) })}
          </p>
          <div
            role="progressbar"
            aria-label={t('games.analysis.review')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.floor(progress * 100)}
            className="h-1.5 overflow-hidden rounded-full bg-line"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th scope="col" className="sr-only">
              {t('games.analysis.measure')}
            </th>
            {sides.map(({ side }) => (
              <th key={side} scope="col" className="w-[36%] pb-2 text-right font-semibold">
                <span className="flex items-center justify-end gap-1.5">
                  <span
                    aria-hidden
                    className={`size-2.5 shrink-0 rounded-full ring-1 ring-ink/40 ${side === 'w' ? 'bg-white' : 'bg-ink'}`}
                  />
                  <span className="truncate">{players[side].name.split(/[ ,]/)[0]}</span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          <tr>
            <th scope="row" className="whitespace-nowrap py-1.5 text-left font-normal text-muted">
              {t('games.analysis.accuracy')}
            </th>
            {sides.map(({ side, summary }) => (
              <td key={side} className="py-1.5 text-right font-mono text-base font-bold tabular-nums">
                {summary.accuracy === null ? '—' : `${Math.round(summary.accuracy)}%`}
              </td>
            ))}
          </tr>
          {rows.map(({ key, count }) => (
            <tr key={key}>
              <th scope="row" className="whitespace-nowrap py-1.5 text-left font-normal text-muted">
                <span aria-hidden className={`mr-1.5 inline-block w-5 font-bold ${JUDGEMENT_STYLE[key].text}`}>
                  {JUDGEMENT_STYLE[key].symbol}
                </span>
                {t(`games.analysis.judgements.${key}`)}
              </th>
              {sides.map(({ side, summary }) => (
                <td key={side} className="py-1.5 text-right font-mono tabular-nums">
                  {count(summary)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted">{t('games.analysis.reviewNote')}</p>
    </section>
  )
}
