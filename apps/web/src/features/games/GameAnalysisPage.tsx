import type { Side } from '@shaxmat/chess-core'
import { type ReactNode, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { AnalysisView, type Player } from './AnalysisView'
import { isLive, useBroadcastGame, useRound } from './broadcast'
import { findClassic } from './classics'
import { samePosition } from './clock'
import { formatResult, roundName, splitTourName } from './labels'
import { LivePulse, LoadError } from './parts'
import { parsePgn } from './pgn'

function playerFrom(headers: Record<string, string>, side: Side): Player {
  const prefix = side === 'w' ? 'White' : 'Black'
  const rating = Number(headers[`${prefix}Elo`])
  return {
    name: headers[prefix] ?? '?',
    title: headers[`${prefix}Title`],
    rating: rating > 0 ? rating : undefined,
    team: headers[`${prefix}Team`],
  }
}

function Heading({ back, children }: { back: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-2 rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <p className="text-sm font-medium text-board-dark">{back}</p>
      {children}
    </div>
  )
}

export function BroadcastGamePage() {
  const { roundId = '', gameId = '' } = useParams()
  const { t } = useTranslation()
  const game = useBroadcastGame(roundId, gameId)
  // Usually cached from the round page; names the event and round.
  const round = useRound(roundId)
  const listed = round.data?.games.find((item) => item.id === gameId)
  const lastFen = game.data && (game.data.moves.at(-1)?.fen ?? game.data.startFen)
  const synced = listed !== undefined && lastFen !== undefined && samePosition(listed.fen, lastFen)

  // Both poll. When the round list shows another position it usually has
  // a newer move, so get the game now instead of at its next turn.
  const { refetch } = game
  const listedFen = listed?.fen
  const behind = listedFen !== undefined && lastFen !== undefined && !synced
  useEffect(() => {
    if (behind) void refetch()
  }, [behind, listedFen, refetch])

  if (game.isPending) return <p className="text-muted">{t('common.loading')}</p>
  if (game.isError) return <LoadError onRetry={() => void game.refetch()} />

  const { headers } = game.data
  const players = { w: playerFrom(headers, 'w'), b: playerFrom(headers, 'b') }
  const live = isLive(headers.Result)
  const event = splitTourName(round.data?.tour.name ?? headers.BroadcastName ?? headers.Event ?? '')

  // The round list says how long the side to move has been thinking; that
  // holds only while it shows the same position as the game.
  const lastMoveAt =
    synced && listed.thinkTime !== undefined
      ? round.dataUpdatedAt - listed.thinkTime * 1000
      : undefined

  return (
    <AnalysisView
      key={gameId}
      game={game.data}
      players={players}
      live={live}
      lastMoveAt={lastMoveAt}
    >
      <Heading
        back={
          <Link to={`/games/live/${roundId}`} className="hover:underline">
            ← {event.event}
            {round.data && ` · ${roundName(t, round.data.round.name)}`}
          </Link>
        }
      >
        <h1 className="font-display text-xl font-bold leading-snug">
          {players.w.name} – {players.b.name}
        </h1>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {live ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#c0392b]">
              <LivePulse />
              {t('games.live.now')}
            </span>
          ) : (
            <span className="rounded bg-paper px-2 py-0.5 font-mono font-bold">
              {formatResult(headers.Result ?? '*')}
            </span>
          )}
          {event.section && <span className="text-muted">{event.section}</span>}
        </p>
        {headers.Opening && (
          <p className="text-sm text-muted">
            {headers.ECO && <span className="font-mono">{headers.ECO} </span>}
            {headers.Opening}
          </p>
        )}
        {headers.GameURL && (
          <a
            href={headers.GameURL}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-xs text-muted underline underline-offset-2 hover:text-ink"
          >
            {t('games.onLichess')}
          </a>
        )}
      </Heading>
    </AnalysisView>
  )
}

export function ClassicGamePage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const classic = findClassic(id)
  const game = useMemo(() => (classic ? parsePgn(classic.pgn) : null), [classic])

  if (!classic || !game) {
    return (
      <div className="space-y-3">
        <p>{t('games.notFound')}</p>
        <Link to="/games" className="font-medium text-board-dark hover:underline">
          ← {t('games.backToEvents')}
        </Link>
      </div>
    )
  }

  return (
    <AnalysisView
      key={id}
      game={game}
      players={{ w: { name: classic.white }, b: { name: classic.black } }}
    >
      <Heading
        back={
          <Link to="/games" className="hover:underline">
            ← {t('games.classics.heading')}
          </Link>
        }
      >
        <h1 className="font-display text-2xl font-bold leading-tight">
          {t(`games.classics.${id}.title`)}
        </h1>
        <p className="font-semibold">
          {classic.white} – {classic.black}
        </p>
        <p className="text-sm text-muted">
          {t(`games.classics.${id}.place`)}, {classic.year} ·{' '}
          <span className="font-mono font-bold text-ink">{formatResult(classic.result)}</span>
        </p>
        <p className="text-[15px] leading-relaxed">{t(`games.classics.${id}.story`)}</p>
      </Heading>
    </AnalysisView>
  )
}
