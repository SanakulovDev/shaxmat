import type { Side } from '@shaxmat/chess-core'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { MiniBoard } from '../../components/MiniBoard'
import { formatSeconds } from './analysis'
import { isLive, type RoundGame, type RoundPlayer } from './broadcast'
import { useRunningClock } from './clock'
import { formatResult, scoreOf } from './labels'

// Pieces shared by the games pages.

export function LivePulse() {
  return (
    <span aria-hidden className="relative flex size-2.5">
      <span className="absolute inline-flex size-full rounded-full bg-[#df5353] opacity-75 motion-safe:animate-ping" />
      <span className="relative inline-flex size-2.5 rounded-full bg-[#df5353]" />
    </span>
  )
}

export function LoadError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation()
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl bg-paper px-4 py-3">
      <p>{t('games.loadError')}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-board-dark px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110"
      >
        {t('games.retry')}
      </button>
    </div>
  )
}

// A game of a round as a small board; `fetchedAt` is when the round list
// was read, which starts the clock of the side to move.
export function GameCard({
  roundId,
  game,
  fetchedAt,
}: {
  roundId: string
  game: RoundGame
  fetchedAt: number
}) {
  const { t } = useTranslation()
  const [white, black] = game.players
  const live = isLive(game.status)
  const toMove: Side = game.fen.split(' ')[1] === 'b' ? 'b' : 'w'
  const since = game.thinkTime === undefined ? undefined : fetchedAt - game.thinkTime * 1000
  return (
    <Link
      to={`/games/live/${roundId}/${game.id}`}
      className="@container flex h-full flex-col gap-2 rounded-2xl border border-line bg-surface p-3 transition hover:border-board-dark/30 hover:shadow-lg"
    >
      <span className="sr-only">
        {t('games.gameLabel', { white: white.name, black: black.name })},{' '}
        {live ? t('games.live.now') : formatResult(game.status)}
      </span>
      <PlayerRow
        player={black}
        side="b"
        status={game.status}
        running={live && toMove === 'b'}
        since={since}
      />
      <MiniBoard fen={game.fen} className="w-full" />
      <PlayerRow
        player={white}
        side="w"
        status={game.status}
        running={live && toMove === 'w'}
        since={since}
      />
    </Link>
  )
}

function PlayerRow({
  player,
  side,
  status,
  running,
  since,
}: {
  player: RoundPlayer
  side: Side
  status: string
  running: boolean
  since: number | undefined
}) {
  const score = scoreOf(status, side)
  const clock = useRunningClock(
    player.clock === undefined ? null : player.clock / 100,
    since,
    running,
  )
  // Narrow cards (two to a row on phones) keep only the name and the clock.
  return (
    <span aria-hidden className="flex items-center gap-1.5 text-sm">
      {player.title && (
        <span className="hidden shrink-0 rounded bg-accent/25 px-1 text-[11px] font-bold text-[#7a5200] @[12rem]:inline">
          {player.title}
        </span>
      )}
      {/* Lichess writes "Surname, Given"; cards have room for the surname. */}
      <span className="min-w-0 truncate font-semibold">{player.name.split(',')[0]}</span>
      {player.rating ? (
        <span className="hidden shrink-0 text-xs text-muted @[12rem]:inline">{player.rating}</span>
      ) : null}
      {player.fed && (
        <span className="hidden shrink-0 text-xs text-muted @[12rem]:inline">{player.fed}</span>
      )}
      <span className="ml-auto shrink-0">
        {score !== null ? (
          <span
            className={`inline-block min-w-6 rounded px-1.5 text-center font-mono font-bold ${
              score === '1' ? 'bg-board-dark text-white' : 'bg-paper'
            }`}
          >
            {score}
          </span>
        ) : clock !== null ? (
          <span
            className={`rounded px-1.5 py-0.5 font-mono text-xs tabular-nums ${
              running ? 'bg-board-dark text-white' : 'bg-paper'
            }`}
          >
            {formatSeconds(clock)}
          </span>
        ) : null}
      </span>
    </span>
  )
}
