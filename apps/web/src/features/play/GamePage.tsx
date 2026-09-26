import { deadline, type Side, timeLeft } from '@shaxmat/chess-core'
import type { TFunction } from 'i18next'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'
import { ensureSession, useAuth } from '../../auth/store'
import { Board } from '../../chess/Board'
import { MoveList } from '../../chess/MoveList'
import { replayUci } from '../../chess/uci'
import { BOT_AVATARS } from '../bot/avatars'
import {
  addFriend,
  createChallenge,
  type GameView,
  type PlayerView,
  playErrorKey,
  useFriends,
} from './api'
import { ChatPanel } from './ChatPanel'
import { challengeSummary, formatClock, formatDiff } from './format'
import { useLiveGame } from './useLiveGame'

const LOW_TIME_MS = 20_000

export function GamePage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const user = useAuth((state) => state.user)

  // A shared game link works for visitors too, as guests.
  useEffect(() => {
    void ensureSession()
  }, [])

  if (!user) return <p className="text-muted">{t('common.loading')}</p>
  return <LiveGame key={id} gameId={id} userId={user.id} isGuest={user.isGuest} />
}

// The current time on the server's clock, ticking while `running`.
function useServerNow(offset: number, running: boolean): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(timer)
  }, [running])
  return now + offset
}

function LiveGame({
  gameId,
  userId,
  isGuest,
}: {
  gameId: string
  userId: string
  isGuest: boolean
}) {
  const { t } = useTranslation()
  const game = useLiveGame(gameId)
  const { state, pendingMove } = game
  const [viewPly, setViewPly] = useState<number | null>(null)
  const active = state?.status === 'active'
  const now = useServerNow(game.offset, active)

  const moves = useMemo(
    () => (state ? (pendingMove ? [...state.moves, pendingMove] : state.moves) : []),
    [state, pendingMove],
  )
  const chess = useMemo(() => replayUci(moves), [moves])
  const history = useMemo(() => chess.history({ verbose: true }), [chess])
  const shownPly = viewPly ?? moves.length
  const shownFen =
    viewPly === null ? chess.fen() : (history[viewPly]?.before ?? chess.fen())
  const shownMove = history[shownPly - 1]

  // The server's view of whose clock runs; a pending move does not count.
  const serverPly = state?.moves.length ?? 0
  const serverTurn: Side = serverPly % 2 === 0 ? 'w' : 'b'
  const due = state?.clock ? deadline(state.clock, serverTurn, serverPly) : null

  // Asks the server to check once a deadline passes here. The server has
  // its own timer; this covers a lost one.
  const flaggedPly = useRef<number | null>(null)
  const { flag } = game
  useEffect(() => {
    if (!active || !due || now < due.at || flaggedPly.current === serverPly) return
    flaggedPly.current = serverPly
    flag()
  }, [active, due, now, serverPly, flag])

  if (game.joinError && game.joinError !== 'network' && !state) {
    return (
      <p className="rounded-xl border border-line bg-surface p-6">
        {t('play.game.notFound')}{' '}
        <Link to="/play" className="font-medium underline">
          {t('play.newGame')}
        </Link>
      </p>
    )
  }
  if (!state) {
    return (
      <p className="text-muted" role="status">
        {t(game.joinError === 'network' ? 'play.errors.network' : 'common.loading')}
      </p>
    )
  }

  const mySide: Side | null =
    state.white?.id === userId ? 'w' : state.black?.id === userId ? 'b' : null
  const orientation = mySide === 'b' ? 'black' : 'white'
  const topSide: Side = orientation === 'white' ? 'b' : 'w'
  const bottomSide: Side = topSide === 'w' ? 'b' : 'w'
  const opponentSide: Side | null = mySide ? (mySide === 'w' ? 'b' : 'w') : null
  const canMove =
    active && mySide !== null && viewPly === null && !pendingMove && chess.turn() === mySide

  function clockOf(side: Side): number | null {
    if (!state?.clock) return null
    if (!active) return side === 'w' ? state.clock.white : state.clock.black
    return timeLeft(state.clock, side, serverTurn, serverPly, now)
  }

  function goTo(ply: number) {
    setViewPly(ply >= moves.length ? null : Math.max(0, ply))
  }

  const firstMoveSeconds =
    active && due?.kind === 'abort' ? Math.max(0, Math.ceil((due.at - now) / 1000)) : null

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="mx-auto w-full max-w-[min(100%,calc(100dvh-14rem),36rem)]">
        <PlayerBar
          state={state}
          side={topSide}
          clock={clockOf(topSide)}
          running={active && serverTurn === topSide && due?.kind === 'flag'}
        />
        <Board
          fen={shownFen}
          orientation={orientation}
          movableColor={canMove ? mySide : null}
          onMove={game.move}
          lastMove={shownMove ? { from: shownMove.from, to: shownMove.to } : null}
          readOnly={!mySide || !active}
          footer={
            <PlayerBar
              state={state}
              side={bottomSide}
              clock={clockOf(bottomSide)}
              running={active && serverTurn === bottomSide && due?.kind === 'flag'}
            />
          }
        />
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-line bg-surface p-4">
          <h1 className="font-display text-lg font-semibold">
            {playerName(t, state, 'w')} — {playerName(t, state, 'b')}
          </h1>
          {state.timeControl && (
            <p className="text-sm text-muted">
              {challengeSummary(t, state.timeControl, state.rated)}
            </p>
          )}
          <p className="mt-3 font-semibold" aria-live="polite">
            {statusText(t, state, mySide, chess.turn(), viewPly !== null)}
          </p>
          {firstMoveSeconds !== null && (
            <p className="mt-1 text-sm text-muted">
              {t('play.game.firstMoveCountdown', { seconds: firstMoveSeconds })}
            </p>
          )}
          {game.actionError && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {t(
                ['illegal', 'notYourTurn', 'network'].includes(game.actionError)
                  ? `play.errors.${game.actionError}`
                  : 'play.errors.generic',
              )}
            </p>
          )}
        </div>

        {active && mySide && opponentSide && (
          <GameControls
            state={state}
            mySide={mySide}
            opponentSide={opponentSide}
            onAction={(action) => void game.act({ type: action })}
          />
        )}

        {!active && mySide && state.botLevel === null && (
          <AfterGame state={state} mySide={mySide} isGuest={isGuest} />
        )}

        <div className="space-y-2">
          <MoveNav ply={shownPly} total={moves.length} onGo={goTo} />
          {history.length > 0 && (
            <MoveList
              moves={history}
              label={t('play.game.moves')}
              current={shownPly}
              onSelect={goTo}
            />
          )}
        </div>

        {game.chat && (
          <ChatPanel lines={game.chat} userId={userId} onSend={game.sendChat} />
        )}
      </aside>
    </div>
  )
}

function playerOf(state: GameView, side: Side): PlayerView | null {
  return side === 'w' ? state.white : state.black
}

function playerName(t: TFunction, state: GameView, side: Side): string {
  const player = playerOf(state, side)
  if (player) return player.name
  if (state.botLevel !== null) return t(`bot.levels.${state.botLevel}.name`)
  return '?'
}

function PlayerBar({
  state,
  side,
  clock,
  running,
}: {
  state: GameView
  side: Side
  clock: number | null
  running: boolean
}) {
  const { t } = useTranslation()
  const player = playerOf(state, side)
  const name = playerName(t, state, side)
  const icon =
    !player && state.botLevel !== null
      ? (BOT_AVATARS[state.botLevel] ?? '')
      : side === 'w'
        ? '♔'
        : '♚'
  const low = clock !== null && clock < LOW_TIME_MS

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="flex min-w-0 items-center gap-2">
        <span aria-hidden className="text-2xl leading-none">
          {icon}
        </span>
        <span className="truncate font-semibold">{name}</span>
        {player?.rating != null && (
          <span className="shrink-0 text-sm text-muted tabular-nums">
            {player.rating}
            {player.ratingDiff != null && (
              <span
                className={`ml-1 font-semibold ${
                  player.ratingDiff > 0
                    ? 'text-green-700'
                    : player.ratingDiff < 0
                      ? 'text-red-700'
                      : ''
                }`}
              >
                {formatDiff(player.ratingDiff)}
              </span>
            )}
          </span>
        )}
      </span>
      {clock !== null && (
        <span
          role="timer"
          className={`shrink-0 rounded-md px-3 py-1 font-mono text-xl font-semibold tabular-nums ${
            running
              ? low
                ? 'bg-red-700 text-white'
                : 'bg-board-dark text-white'
              : 'bg-surface text-ink ring-1 ring-line'
          }`}
        >
          <span className="sr-only">{t('play.game.clockOf', { name })}: </span>
          {formatClock(clock)}
        </span>
      )}
    </div>
  )
}

function statusText(
  t: TFunction,
  state: GameView,
  mySide: Side | null,
  turn: Side,
  viewingPast: boolean,
): string {
  if (state.status === 'aborted') return t('play.game.aborted')
  if (state.status === 'finished') {
    const winner = state.result === '1-0' ? 'w' : state.result === '0-1' ? 'b' : null
    const outcome =
      winner === null
        ? 'draw'
        : mySide
          ? winner === mySide
            ? 'won'
            : 'lost'
          : winner === 'w'
            ? 'whiteWon'
            : 'blackWon'
    const reason = state.termination ? ` — ${t(`bot.reason.${state.termination}`)}` : ''
    return `${t(`play.game.outcome.${outcome}`)}${reason}`
  }
  if (viewingPast) return t('play.game.viewingPast')
  if (!mySide) return t(turn === 'w' ? 'play.game.whiteToMove' : 'play.game.blackToMove')
  return t(turn === mySide ? 'play.game.yourMove' : 'play.game.opponentMove')
}

const controlButton =
  'rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium hover:bg-paper disabled:opacity-50'

function GameControls({
  state,
  mySide,
  opponentSide,
  onAction,
}: {
  state: GameView
  mySide: Side
  opponentSide: Side
  onAction: (
    action:
      | 'resign'
      | 'abort'
      | 'drawOffer'
      | 'drawAccept'
      | 'drawDecline'
      | 'takebackOffer'
      | 'takebackAccept'
      | 'takebackDecline',
  ) => void
}) {
  const { t } = useTranslation()
  const [confirmResign, setConfirmResign] = useState(false)
  const started = state.moves.length >= 2

  return (
    <div className="space-y-3">
      {/* Offers from the opponent are announced as they arrive. */}
      <div aria-live="polite" className="space-y-2">
        {state.drawOffer === opponentSide && (
          <Offer
            text={t('play.game.opponentOffersDraw')}
            onAccept={() => onAction('drawAccept')}
            onDecline={() => onAction('drawDecline')}
          />
        )}
        {state.takebackOffer === opponentSide && (
          <Offer
            text={t('play.game.opponentAsksTakeback')}
            onAccept={() => onAction('takebackAccept')}
            onDecline={() => onAction('takebackDecline')}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {!started ? (
          <button type="button" onClick={() => onAction('abort')} className={controlButton}>
            {t('play.game.abort')}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onAction('drawOffer')}
              disabled={state.drawOffer === mySide}
              className={controlButton}
            >
              {t(state.drawOffer === mySide ? 'play.game.drawOffered' : 'play.game.offerDraw')}
            </button>
            <button
              type="button"
              onClick={() => onAction('takebackOffer')}
              disabled={state.takebackOffer === mySide}
              className={controlButton}
            >
              {t(
                state.takebackOffer === mySide
                  ? 'play.game.takebackAsked'
                  : 'play.game.takeback',
              )}
            </button>
            {confirmResign ? (
              <span className="flex flex-wrap items-center gap-2" role="group">
                <span className="text-sm font-medium">{t('play.game.confirmResign')}</span>
                <button
                  type="button"
                  onClick={() => onAction('resign')}
                  className={`${controlButton} border-red-300 text-red-700`}
                >
                  {t('play.game.yes')}
                </button>
                <button
                  type="button"
                  // Focus lands on the safe choice.
                  autoFocus
                  onClick={() => setConfirmResign(false)}
                  className={controlButton}
                >
                  {t('play.game.no')}
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmResign(true)}
                className={`${controlButton} border-red-200 text-red-700`}
              >
                {t('play.game.resign')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Offer({
  text,
  onAccept,
  onDecline,
}: {
  text: string
  onAccept: () => void
  onDecline: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="rounded-xl border-2 border-lapis bg-surface p-3">
      <p className="font-medium">{text}</p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="rounded-lg bg-lapis px-3 py-1.5 text-sm font-medium text-white"
        >
          {t('play.game.accept')}
        </button>
        <button type="button" onClick={onDecline} className={controlButton}>
          {t('play.game.decline')}
        </button>
      </div>
    </div>
  )
}

function AfterGame({
  state,
  mySide,
  isGuest,
}: {
  state: GameView
  mySide: Side
  isGuest: boolean
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const friends = useFriends()
  const [error, setError] = useState<string | null>(null)
  const [requested, setRequested] = useState(false)
  const opponent = mySide === 'w' ? state.black : state.white

  const known =
    friends.data &&
    opponent &&
    [...friends.data.friends, ...friends.data.outgoing].some((f) => f.id === opponent.id)
  const canAddFriend =
    !isGuest && opponent && !opponent.isGuest && friends.isSuccess && !known

  async function rematch() {
    setError(null)
    try {
      const challenge = await createChallenge({ rematchOf: state.id })
      await navigate(`/c/${challenge.code}`)
    } catch (caught) {
      setError(playErrorKey(caught))
    }
  }

  async function befriend() {
    if (!opponent) return
    setError(null)
    try {
      await addFriend(opponent.id)
      setRequested(true)
    } catch (caught) {
      setError(playErrorKey(caught))
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {state.timeControl && opponent && (
          <button
            type="button"
            onClick={() => void rematch()}
            className="rounded-lg bg-accent px-4 py-2 font-semibold text-ink hover:brightness-105"
          >
            {t('play.game.rematch')}
          </button>
        )}
        <Link to="/play" className={controlButton}>
          {t('play.newGame')}
        </Link>
        {canAddFriend && !requested && (
          <button type="button" onClick={() => void befriend()} className={controlButton}>
            {t('play.game.addFriend')}
          </button>
        )}
      </div>
      <p aria-live="polite" className="text-sm text-green-800">
        {requested ? t('play.game.friendRequested') : ''}
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {t(error)}
        </p>
      )}
    </div>
  )
}

function MoveNav({
  ply,
  total,
  onGo,
}: {
  ply: number
  total: number
  onGo: (ply: number) => void
}) {
  const { t } = useTranslation()
  const buttons = [
    { key: 'first', glyph: '⏮', target: 0, disabled: ply === 0 },
    { key: 'prev', glyph: '◀', target: ply - 1, disabled: ply === 0 },
    { key: 'next', glyph: '▶', target: ply + 1, disabled: ply >= total },
    { key: 'last', glyph: '⏭', target: total, disabled: ply >= total },
  ]
  return (
    <div className="grid grid-cols-4 gap-1" role="group" aria-label={t('play.game.nav.label')}>
      {buttons.map((button) => (
        <button
          key={button.key}
          type="button"
          onClick={() => onGo(button.target)}
          disabled={button.disabled}
          aria-label={t(`play.game.nav.${button.key}`)}
          className="rounded-md border border-line bg-surface py-1.5 hover:bg-paper disabled:opacity-40"
        >
          <span aria-hidden>{button.glyph}</span>
        </button>
      ))}
    </div>
  )
}
