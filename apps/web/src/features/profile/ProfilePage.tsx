import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router'
import { api } from '../../api/client'
import { useAuth } from '../../auth/store'
import { BOT_AVATARS } from '../bot/avatars'
import { formatDiff } from '../play/format'
import { examStatus, useProgress } from '../learn/progress'
import { useContent } from '../learn/useContent'

type RecentGame = {
  id: string
  whiteId: string | null
  blackId: string | null
  white: { id: string; name: string } | null
  black: { id: string; name: string } | null
  botLevel: number | null
  rated: boolean
  timeInitial: number | null
  timeIncrement: number | null
  whiteRatingDiff: number | null
  blackRatingDiff: number | null
  result: string
  termination: string
  createdAt: string
}

function outcomeFor(game: RecentGame, userId: string) {
  if (game.result === '1/2-1/2') return 'draw'
  const won =
    (game.result === '1-0' && game.whiteId === userId) ||
    (game.result === '0-1' && game.blackId === userId)
  return won ? 'won' : 'lost'
}

export function ProfilePage() {
  const { t } = useTranslation()
  const { lessons: allLessons, stages, lessonsOfStage } = useContent()
  const user = useAuth((state) => state.user)
  const progress = useProgress()
  const recent = useQuery({
    queryKey: ['games', 'recent'],
    queryFn: () => api<RecentGame[]>('/games/recent'),
    enabled: user !== null,
  })

  if (!user) return <Navigate to="/login" replace />

  const done = new Set(progress.data?.lessons.map((l) => l.lessonSlug))
  const stats = [
    {
      label: t('profile.puzzleRating'),
      value: progress.data?.puzzleRating.rating ?? '—',
    },
    { label: t('profile.puzzlesSolved'), value: progress.data?.puzzlesSolved ?? 0 },
    { label: t('profile.lessons'), value: `${done.size} / ${allLessons.length}` },
    ...(progress.data?.gameRatings ?? []).map((entry) => ({
      label: t('profile.gameRating', {
        category: t(`play.category.${entry.category}`),
      }),
      value: entry.rating,
    })),
    {
      label: t('profile.bestBot'),
      value:
        Math.max(0, ...(progress.data?.bots.filter((b) => b.wins > 0).map((b) => b.level) ?? [])) ||
        '—',
    },
  ]

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center gap-4">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="h-16 w-16 rounded-full" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-board-dark text-2xl font-bold text-white">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold">
            {user.isGuest ? t('nav.guest') : user.name}
          </h1>
          {user.isGuest ? (
            <p className="text-sm text-amber-800">
              {t('profile.guest')}{' '}
              <Link to="/register" className="font-medium underline">
                {t('nav.register')}
              </Link>
            </p>
          ) : (
            user.email && <p className="text-sm text-muted">{user.email}</p>
          )}
        </div>
      </section>

      <section className="stagger grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-line bg-surface p-4">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">{t('profile.stages')}</h2>
        <ul className="stagger space-y-2">
          {stages.map((stage) => {
            const lessons = lessonsOfStage(stage.id)
            const finished = lessons.filter((l) => done.has(l.slug)).length
            const exam = examStatus(stage, progress.data)
            return (
              <li
                key={stage.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-4 py-3"
              >
                <span className="font-medium">
                  {t('learn.stage', { number: stage.id })}. {stage.title}
                </span>
                <span className="text-sm text-muted">
                  {lessons.length > 0 &&
                    t('profile.stageLessons', { done: finished, total: lessons.length })}
                  {exam.passed && ` · 🏆 ${t('profile.examPassed')}`}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">{t('profile.recentGames')}</h2>
        {recent.data?.length ? (
          <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
            {recent.data.map((game) => {
              const outcome = outcomeFor(game, user.id)
              const isWhite = game.whiteId === user.id
              const opponent = isWhite ? game.black : game.white
              const diff = isWhite ? game.whiteRatingDiff : game.blackRatingDiff
              return (
                <li key={game.id}>
                  <Link
                    to={`/game/${game.id}`}
                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3 hover:bg-paper"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span aria-hidden>
                        {game.botLevel ? BOT_AVATARS[game.botLevel] : isWhite ? '♔' : '♚'}
                      </span>
                      <span className="min-w-0">
                        {game.botLevel
                          ? `${t(`bot.levels.${game.botLevel}.name`)} (${t('bot.level', { level: game.botLevel })})`
                          : t('profile.versus', { name: opponent?.name ?? '?' })}
                        {game.timeInitial !== null && (
                          <span className="ml-2 text-sm text-muted">
                            {game.timeInitial / 60}+{game.timeIncrement ?? 0} ·{' '}
                            {t(game.rated ? 'play.ratedShort' : 'play.casual')}
                          </span>
                        )}
                      </span>
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        outcome === 'won'
                          ? 'text-green-700'
                          : outcome === 'lost'
                            ? 'text-red-700'
                            : 'text-muted'
                      }`}
                    >
                      {t(`profile.outcome.${outcome}`)} · {t(`bot.reason.${game.termination}`)}
                      {diff !== null && ` · ${formatDiff(diff)}`}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-muted">
            {t('profile.noGames')}{' '}
            <Link to="/bot" className="underline">
              {t('nav.bot')}
            </Link>
          </p>
        )}
      </section>
    </div>
  )
}
