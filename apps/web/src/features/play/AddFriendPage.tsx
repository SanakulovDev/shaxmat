import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { api } from '../../api/client'
import { ensureSession, useAuth } from '../../auth/store'
import { addFriend, playErrorKey, type PublicUser } from './api'

// The personal friend link, /friends/add/:userId.
export function AddFriendPage() {
  const { t } = useTranslation()
  const { userId = '' } = useParams()
  const user = useAuth((state) => state.user)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void ensureSession()
  }, [])

  const person = useQuery({
    queryKey: ['users', userId],
    queryFn: () => api<PublicUser>(`/users/${userId}`),
    enabled: user !== null,
    retry: false,
  })

  async function send() {
    setError(null)
    try {
      await addFriend(userId)
      setSent(true)
    } catch (caught) {
      setError(playErrorKey(caught))
    }
  }

  let body
  if (person.isError) {
    body = <p>{t('play.friends.add.notFound')}</p>
  } else if (!person.data || !user) {
    body = <p className="text-muted">{t('common.loading')}</p>
  } else if (person.data.id === user.id) {
    body = <p>{t('play.friends.add.self')}</p>
  } else if (user.isGuest) {
    body = (
      <p>
        {t('play.friends.guest')}{' '}
        <Link
          to={`/register?next=/friends/add/${userId}`}
          className="font-medium underline"
        >
          {t('nav.register')}
        </Link>
      </p>
    )
  } else {
    body = (
      <>
        <p className="text-lg">
          {t('play.friends.add.prompt', { name: person.data.name })}
        </p>
        {!sent && (
          <button
            type="button"
            onClick={() => void send()}
            className="rounded-lg bg-accent px-6 py-3 font-semibold text-ink hover:brightness-105"
          >
            {t('play.friends.add.button')}
          </button>
        )}
      </>
    )
  }

  return (
    <section className="mx-auto max-w-xl space-y-4 rounded-2xl border border-line bg-surface p-6">
      <h1 className="text-2xl font-semibold">{t('play.friends.add.title')}</h1>
      {body}
      <p aria-live="polite" className="text-green-800">
        {sent && person.data ? t('play.friends.add.sent', { name: person.data.name }) : ''}
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {t(error)}
        </p>
      )}
      <p>
        <Link to="/play" className="font-medium underline">
          {t('play.title')}
        </Link>
      </p>
    </section>
  )
}
