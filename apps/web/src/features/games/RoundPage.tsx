import { useDeferredValue, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, Navigate, useParams } from 'react-router'
import { isLive, type TourGroup, useRound, useTour } from './broadcast'
import { roundName, splitTourName } from './labels'
import { GameCard, LivePulse, LoadError } from './parts'

const PAGE = 24

export function RoundPage() {
  const { roundId = '' } = useParams()
  const { t } = useTranslation()
  const { data, dataUpdatedAt, isPending, isError, refetch } = useRound(roundId)
  const tour = useTour(data?.tour.id)
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(PAGE)
  const search = useDeferredValue(query.trim().toLowerCase())
  const filterId = useId()

  if (isPending) return <p className="text-muted">{t('common.loading')}</p>
  if (isError) return <LoadError onRetry={() => void refetch()} />

  const { round, games, group } = data
  const { event, section } = splitTourName(data.tour.name)
  const found = search
    ? games.filter((game) =>
        game.players.some((player) =>
          [player.name, player.team, player.fed].some((text) => text?.toLowerCase().includes(search)),
        ),
      )
    : games
  const live = games.filter((game) => isLive(game.status)).length

  return (
    <div className="space-y-6">
      <Link to="/games" className="text-sm font-medium text-board-dark hover:underline">
        ← {t('games.backToEvents')}
      </Link>

      <header className="space-y-2">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{event}</h1>
        {section && <p className="font-semibold text-muted">{section}</p>}
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          {data.tour.info?.location && <span>{data.tour.info.location}</span>}
          {data.tour.info?.tc && <span>{data.tour.info.tc}</span>}
        </p>
      </header>

      {group && <GroupTabs group={group} current={data.tour.id} />}

      {tour.data && tour.data.rounds.length > 1 && (
        <nav aria-label={t('games.rounds')} className="-mx-4 overflow-x-auto px-4">
          <ul className="flex gap-1.5">
            {tour.data.rounds.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={`/games/live/${item.id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
                      isActive
                        ? 'bg-board-dark text-white'
                        : item.finished || item.ongoing
                          ? 'bg-surface ring-1 ring-line hover:bg-paper'
                          : 'text-muted ring-1 ring-line hover:bg-paper'
                    }`
                  }
                >
                  {item.ongoing && <LivePulse />}
                  {roundName(t, item.name)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-semibold">{roundName(t, round.name)}</h2>
          <p className="text-sm text-muted">
            {round.ongoing
              ? t('games.roundLive', { count: live, total: games.length })
              : round.finished
                ? t('games.roundFinished', { count: games.length })
                : t('games.roundUpcoming')}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={filterId} className="text-sm font-medium">
            {t('games.filter')}
          </label>
          <input
            id={filterId}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setLimit(PAGE)
            }}
            placeholder={t('games.filterHint')}
            className="w-64 max-w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          />
        </div>
      </div>

      {found.length === 0 ? (
        <p className="text-muted">{t('games.noGames')}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {found.slice(0, limit).map((game) => (
            <li key={game.id}>
              <GameCard roundId={round.id} game={game} fetchedAt={dataUpdatedAt} />
            </li>
          ))}
        </ul>
      )}
      {found.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((shown) => shown + PAGE)}
          className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-paper"
        >
          {t('games.moreGames', { count: found.length - limit })}
        </button>
      )}
    </div>
  )
}

function GroupTabs({ group, current }: { group: TourGroup; current: string }) {
  const { t } = useTranslation()
  return (
    <nav aria-label={t('games.sections')} className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-1.5">
        {group.tours.map((tour) => (
          <li key={tour.id}>
            <Link
              to={`/games/tour/${tour.id}`}
              aria-current={tour.id === current ? 'page' : undefined}
              className={`block whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
                tour.id === current
                  ? 'bg-ink text-white'
                  : 'bg-surface text-muted ring-1 ring-line hover:bg-paper hover:text-ink'
              }`}
            >
              {tour.name.replaceAll(' | ', ' · ')}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// Opens a tournament on the round Lichess would pick.
export function TourRedirect() {
  const { tourId } = useParams()
  const { t } = useTranslation()
  const { data, isError, refetch } = useTour(tourId)
  if (isError) return <LoadError onRetry={() => void refetch()} />
  const target = data && (data.defaultRoundId ?? data.rounds.at(-1)?.id)
  if (data && !target) return <p className="text-muted">{t('games.noGames')}</p>
  if (target) return <Navigate to={`/games/live/${target}`} replace />
  return <p className="text-muted">{t('common.loading')}</p>
}
