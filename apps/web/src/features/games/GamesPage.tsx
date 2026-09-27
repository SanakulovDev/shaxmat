import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { MiniBoard } from '../../components/MiniBoard'
import { type TopEntry, useLiveBroadcasts, useRound } from './broadcast'
import { CLASSICS } from './classics'
import { formatResult, roundName, splitTourName } from './labels'
import { GameCard, LivePulse, LoadError } from './parts'
import { parsePgn } from './pgn'

// Lichess tier 4 and up are the elite events; the rest go in a short list.
const FEATURED_TIER = 4
const OTHERS_SHOWN = 8
const TOP_BOARDS = 4

export function GamesPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-12">
      <header className="max-w-2xl space-y-2">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('games.title')}</h1>
        <p className="text-lg text-muted">{t('games.subtitle')}</p>
      </header>
      <LiveEvents />
      <Classics />
    </div>
  )
}

function LiveEvents() {
  const { t } = useTranslation()
  const { data, isPending, isError, refetch } = useLiveBroadcasts()
  const [showAll, setShowAll] = useState(false)

  const featured = data?.filter((entry) => (entry.tour.tier ?? 0) >= FEATURED_TIER) ?? []
  const others = data?.filter((entry) => (entry.tour.tier ?? 0) < FEATURED_TIER) ?? []
  const shown = showAll ? others : others.slice(0, OTHERS_SHOWN)

  return (
    <section aria-labelledby="live-title" className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="live-title" className="flex items-center gap-2.5 font-display text-2xl font-semibold">
          <LivePulse />
          {t('games.live.title')}
        </h2>
        <p className="text-sm text-muted">
          {t('games.live.source')}{' '}
          <a
            href="https://lichess.org/broadcast"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-board-dark underline underline-offset-2"
          >
            lichess.org
          </a>
        </p>
      </div>

      {isPending ? (
        <p className="text-muted">{t('common.loading')}</p>
      ) : isError ? (
        <LoadError onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <p className="text-muted">{t('games.live.none')}</p>
      ) : (
        <>
          {featured.length > 0 && (
            <ul className={`stagger grid grid-cols-1 gap-4 ${featured.length > 1 ? 'md:grid-cols-2' : ''}`}>
              {featured.map((entry) => (
                <li key={entry.tour.id}>
                  <FeaturedEvent entry={entry} />
                </li>
              ))}
            </ul>
          )}
          {featured[0]?.round.ongoing && <TopBoards entry={featured[0]} />}
          {others.length > 0 && (
            <div className="space-y-3">
              <ul className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {shown.map((entry) => (
                  <li key={entry.tour.id}>
                    <EventCard entry={entry} />
                  </li>
                ))}
              </ul>
              {others.length > OTHERS_SHOWN && (
                <button
                  type="button"
                  onClick={() => setShowAll((all) => !all)}
                  aria-expanded={showAll}
                  className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-paper"
                >
                  {showAll
                    ? t('games.live.fewer')
                    : t('games.live.more', { count: others.length - OTHERS_SHOWN })}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}

// The first boards of the biggest live round, moving as the games go on.
function TopBoards({ entry }: { entry: TopEntry }) {
  const { t } = useTranslation()
  const { data, dataUpdatedAt } = useRound(entry.round.id)
  const games = data?.games.slice(0, TOP_BOARDS) ?? []
  if (games.length === 0) return null
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-semibold">
          {t('games.live.topBoards')}
          <span className="font-normal text-muted"> · {splitTourName(entry.tour.name).event}</span>
        </h3>
        <Link
          to={`/games/live/${entry.round.id}`}
          className="text-sm font-medium text-board-dark hover:underline"
        >
          {t('games.live.allGames')} →
        </Link>
      </div>
      <ul className="stagger grid grid-cols-2 gap-3 lg:grid-cols-4">
        {games.map((game) => (
          <li key={game.id}>
            <GameCard roundId={entry.round.id} game={game} fetchedAt={dataUpdatedAt} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function RoundStatus({ entry }: { entry: TopEntry }) {
  const { t, i18n } = useTranslation()
  const { round } = entry
  const name = roundName(t, round.name)
  if (round.ongoing) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c0392b]">
        <LivePulse />
        {name} · {t('games.live.now')}
      </span>
    )
  }
  const time = round.startsAt
    ? new Intl.DateTimeFormat(i18n.language, { hour: '2-digit', minute: '2-digit' }).format(
        round.startsAt,
      )
    : null
  return (
    <span className="text-sm text-muted">
      {name}
      {time && ` · ${t('games.live.startsAt', { time })}`}
    </span>
  )
}

function FeaturedEvent({ entry }: { entry: TopEntry }) {
  const { t } = useTranslation()
  const { tour, round } = entry
  const { event, section } = splitTourName(tour.name)
  return (
    <Link
      to={`/games/live/${round.id}`}
      className="group relative flex h-full min-h-56 flex-col justify-end overflow-hidden rounded-2xl bg-forest p-6 text-white shadow-lg ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      {tour.image && (
        <img
          src={tour.image}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-80 transition duration-500 group-hover:scale-105"
        />
      )}
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-forest via-forest/60 to-transparent" />
      <span className="relative space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-ink shadow">
          {round.ongoing && <LivePulse />}
          {roundName(t, round.name)}
          {round.ongoing && ` · ${t('games.live.now')}`}
        </span>
        <span className="block font-display text-2xl font-bold leading-tight">{event}</span>
        {section && <span className="block text-sm text-white/80">{section}</span>}
        {tour.info?.location && (
          <span className="block text-sm text-white/70">{tour.info.location}</span>
        )}
        {tour.info?.players && (
          <span className="block truncate text-sm text-accent">{tour.info.players}</span>
        )}
      </span>
    </Link>
  )
}

function EventCard({ entry }: { entry: TopEntry }) {
  const { tour, round } = entry
  const { event, section } = splitTourName(tour.name)
  return (
    <Link
      to={`/games/live/${round.id}`}
      className="flex h-full flex-col gap-1 rounded-xl border border-line bg-surface p-4 transition hover:border-board-dark/30 hover:shadow-md"
    >
      <span className="line-clamp-2 font-semibold leading-snug">{event}</span>
      {section && <span className="truncate text-sm text-muted">{section}</span>}
      {tour.info?.location && (
        <span className="truncate text-xs text-muted">{tour.info.location}</span>
      )}
      <span className="mt-auto pt-2">
        <RoundStatus entry={entry} />
      </span>
    </Link>
  )
}

function Classics() {
  const { t } = useTranslation()
  // Final positions for the cards; eight short games parse in a blink.
  const finals = useMemo(
    () => new Map(CLASSICS.map((game) => [game.id, parsePgn(game.pgn).moves.at(-1)?.fen])),
    [],
  )
  return (
    <section aria-labelledby="classics-title" className="space-y-5">
      <div className="max-w-2xl space-y-1">
        <h2 id="classics-title" className="font-display text-2xl font-semibold">
          {t('games.classics.heading')}
        </h2>
        <p className="text-muted">{t('games.classics.subtitle')}</p>
      </div>
      <ul className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CLASSICS.map((game) => {
          const fen = finals.get(game.id)
          return (
            <li key={game.id}>
              <Link
                to={`/games/classic/${game.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition hover:-translate-y-0.5 hover:border-board-dark/30 hover:shadow-lg"
              >
                {fen && (
                  <div className="bg-paper p-4">
                    <MiniBoard fen={fen} className="mx-auto w-full max-w-56 shadow-md" />
                  </div>
                )}
                <span className="flex flex-1 flex-col gap-1 p-4">
                  <span className="font-display text-lg font-semibold leading-snug group-hover:text-board-dark">
                    {t(`games.classics.${game.id}.title`)}
                  </span>
                  <span className="text-sm">
                    {game.white} – {game.black}
                  </span>
                  <span className="mt-auto pt-1 text-sm text-muted">
                    {t(`games.classics.${game.id}.place`)}, {game.year} ·{' '}
                    <span className="font-mono font-semibold text-ink">
                      {formatResult(game.result)}
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
