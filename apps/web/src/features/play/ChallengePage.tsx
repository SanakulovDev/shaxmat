import { useQuery } from '@tanstack/react-query'
import { type ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { api, ApiError } from '../../api/client'
import { ensureSession, useAuth } from '../../auth/store'
import { CopyField } from '../../components/CopyField'
import {
  acceptChallenge,
  cancelChallenge,
  type ChallengeView,
  declineChallenge,
  playErrorKey,
} from './api'
import { challengeSummary } from './format'

// The invite link, /c/:code. The creator waits here; anyone else can accept.
export function ChallengePage() {
  const { t } = useTranslation()
  const { code = '' } = useParams()
  const navigate = useNavigate()
  const user = useAuth((state) => state.user)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  // A visitor from a shared link gets a guest session to accept with.
  useEffect(() => {
    void ensureSession()
  }, [])

  const challenge = useQuery({
    queryKey: ['challenges', code],
    queryFn: () => api<ChallengeView>(`/challenges/${code}`),
    enabled: user !== null,
    retry: (count, caught) => !(caught instanceof ApiError) && count < 3,
  })

  const data = challenge.data
  const isCreator = data?.creator.id === user?.id
  const isPlayer = isCreator || data?.destId === user?.id

  // The creator's page moves on to the game once someone accepts.
  if (data?.status === 'accepted' && data.gameId && isPlayer) {
    return <Navigate to={`/game/${data.gameId}`} replace />
  }

  if (challenge.isError) {
    return <Message text={t('play.challenge.notFound')} />
  }
  if (!data || !user) {
    return <p className="text-muted">{t('common.loading')}</p>
  }

  const summary = challengeSummary(t, data.timeControl, data.rated)

  async function run(action: () => Promise<void>) {
    setPending(true)
    setError(null)
    try {
      await action()
    } catch (caught) {
      setError(playErrorKey(caught))
      await challenge.refetch()
    } finally {
      setPending(false)
    }
  }

  if (data.status !== 'open') {
    return (
      <Message text={t(`play.challenge.closed.${data.status}`)}>
        {data.status === 'accepted' && data.gameId && (
          <Link to={`/game/${data.gameId}`} className="font-medium underline">
            {t('play.challenge.watch')}
          </Link>
        )}
      </Message>
    )
  }

  if (isCreator) {
    const link = `${window.location.origin}/c/${data.code}`
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(t('play.challenge.shareText'))}`
    return (
      <section className="mx-auto max-w-xl space-y-5 rounded-2xl border border-line bg-surface p-6">
        <div>
          <h1 className="text-2xl font-semibold">
            {data.destId ? t('play.challenge.waitingFriend') : t('play.challenge.waiting')}
          </h1>
          <p className="mt-1 text-muted">{summary}</p>
        </div>
        <p className="flex items-center gap-3" role="status">
          <span
            aria-hidden
            className="h-3 w-3 rounded-full bg-accent motion-safe:animate-pulse"
          />
          {t(data.destId ? 'play.challenge.friendHint' : 'play.challenge.shareHint')}
        </p>
        {!data.destId && (
          <>
            <CopyField label={t('play.challenge.link')} value={link} />
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-lg bg-lapis px-4 py-2 font-medium text-white hover:brightness-110"
            >
              {t('play.challenge.shareTelegram')}
            </a>
          </>
        )}
        <div>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              void run(async () => {
                await cancelChallenge(data.code)
                await navigate('/play')
              })
            }
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-paper"
          >
            {t('play.challenge.cancel')}
          </button>
        </div>
      </section>
    )
  }

  const forSomeoneElse = data.destId !== null && data.destId !== user.id
  const needsAccount = data.rated && user.isGuest
  const yourColor =
    data.color === 'random' ? 'random' : data.color === 'white' ? 'black' : 'white'

  return (
    <section className="mx-auto max-w-xl space-y-5 rounded-2xl border border-line bg-surface p-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {t('play.challenge.invitedBy', { name: data.creator.name })}
        </h1>
        <p className="mt-1 text-muted">{summary}</p>
        <p className="mt-1">{t(`play.challenge.youPlay.${yourColor}`)}</p>
      </div>
      {forSomeoneElse ? (
        <p>{t('play.errors.notForYou')}</p>
      ) : needsAccount ? (
        <p>
          {t('play.challenge.registerForRated')}{' '}
          <Link
            to={`/register?next=/c/${data.code}`}
            className="font-medium underline"
          >
            {t('nav.register')}
          </Link>
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              void run(async () => {
                const { gameId } = await acceptChallenge(data.code)
                await navigate(`/game/${gameId}`)
              })
            }
            className="rounded-lg bg-accent px-6 py-3 font-semibold text-ink hover:brightness-105 disabled:opacity-60"
          >
            {t('play.challenge.accept')}
          </button>
          {data.destId === user.id && (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                void run(async () => {
                  await declineChallenge(data.code)
                  await navigate('/play')
                })
              }
              className="rounded-lg border border-line px-4 py-3 font-medium hover:bg-paper"
            >
              {t('play.challenge.decline')}
            </button>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {t(error)}
        </p>
      )}
    </section>
  )
}

function Message({ text, children }: { text: string; children?: ReactNode }) {
  const { t } = useTranslation()
  return (
    <section className="mx-auto max-w-xl space-y-3 rounded-2xl border border-line bg-surface p-6">
      <p className="text-lg">{text}</p>
      {children}
      <p>
        <Link to="/play" className="font-medium underline">
          {t('play.newGame')}
        </Link>
      </p>
    </section>
  )
}
