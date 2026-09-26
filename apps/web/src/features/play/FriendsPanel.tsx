import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useAuth } from '../../auth/store'
import { CopyField } from '../../components/CopyField'
import { acceptFriend, removeFriend, useFriends } from './api'

const smallButton =
  'rounded-md border border-line px-2.5 py-1 text-sm font-medium hover:bg-paper'

export function FriendsPanel({
  onChallenge,
}: {
  onChallenge: (friendId: string) => void
}) {
  const { t } = useTranslation()
  const user = useAuth((state) => state.user)
  const friends = useFriends()
  const queryClient = useQueryClient()

  async function run(action: Promise<unknown>) {
    await action
    await queryClient.invalidateQueries({ queryKey: ['friends'] })
  }

  return (
    <section
      aria-labelledby="friends-title"
      className="space-y-4 rounded-2xl border border-line bg-surface p-4"
    >
      <h2 id="friends-title" className="text-xl font-semibold">
        {t('play.friends.title')}
      </h2>

      {!user || user.isGuest ? (
        <p className="text-sm text-muted">
          {t('play.friends.guest')}{' '}
          <Link to="/register?next=/play" className="font-medium text-ink underline">
            {t('nav.register')}
          </Link>
        </p>
      ) : (
        <>
          {friends.data && friends.data.incoming.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold">{t('play.friends.requests')}</h3>
              <ul className="mt-1 space-y-2">
                {friends.data.incoming.map((person) => (
                  <li key={person.id} className="flex flex-wrap items-center gap-2">
                    <span className="min-w-0 flex-1 font-medium">{person.name}</span>
                    <button
                      type="button"
                      onClick={() => void run(acceptFriend(person.id))}
                      className={`${smallButton} border-board-dark bg-board-dark text-white hover:bg-board-dark`}
                    >
                      {t('play.friends.accept')}
                    </button>
                    <button
                      type="button"
                      onClick={() => void run(removeFriend(person.id))}
                      className={smallButton}
                    >
                      {t('play.friends.decline')}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {friends.data?.friends.length ? (
            <ul className="divide-y divide-line">
              {friends.data.friends.map((friend) => (
                <li key={friend.id} className="flex flex-wrap items-center gap-2 py-2">
                  <span
                    aria-hidden
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      friend.online ? 'bg-green-600' : 'bg-line'
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{friend.name}</span>
                    <span className="block text-xs text-muted">
                      {t(friend.online ? 'play.friends.online' : 'play.friends.offline')}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onChallenge(friend.id)}
                    className={smallButton}
                    aria-label={t('play.friends.challengeName', { name: friend.name })}
                  >
                    {t('play.friends.challenge')}
                  </button>
                  <button
                    type="button"
                    onClick={() => void run(removeFriend(friend.id))}
                    className="rounded-md px-2 py-1 text-sm text-muted hover:bg-paper"
                    aria-label={t('play.friends.removeName', { name: friend.name })}
                  >
                    {t('play.friends.remove')}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            friends.isSuccess && (
              <p className="text-sm text-muted">{t('play.friends.empty')}</p>
            )
          )}

          {friends.data && friends.data.outgoing.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold">{t('play.friends.sent')}</h3>
              <ul className="mt-1 space-y-1 text-sm">
                {friends.data.outgoing.map((person) => (
                  <li key={person.id} className="flex items-center gap-2">
                    <span className="min-w-0 flex-1">{person.name}</span>
                    <button
                      type="button"
                      onClick={() => void run(removeFriend(person.id))}
                      className="rounded-md px-2 py-1 text-muted hover:bg-paper"
                      aria-label={t('play.friends.cancelName', { name: person.name })}
                    >
                      {t('play.friends.cancel')}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <CopyField
            label={t('play.friends.inviteLink')}
            value={`${window.location.origin}/friends/add/${user.id}`}
          />
        </>
      )}
    </section>
  )
}
