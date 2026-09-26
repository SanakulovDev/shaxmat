import {
  TIME_CONTROLS,
  timeControlCategory,
  type TimeControlId,
} from '@shaxmat/chess-core'
import { type FormEvent, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../auth/store'
import {
  cancelChallenge,
  createChallenge,
  playErrorKey,
  useChallenges,
  useFriends,
} from './api'
import { challengeSummary } from './format'
import { FriendsPanel } from './FriendsPanel'

type ColorChoice = 'white' | 'black' | 'random'
const COLOR_CHOICES: ColorChoice[] = ['white', 'random', 'black']

// Radio inputs drawn as tiles; the tile shows the keyboard focus ring.
const tileClass =
  'flex cursor-pointer flex-col items-center rounded-xl border-2 border-line bg-surface px-2 py-3 text-center has-[:checked]:border-board-dark has-[:checked]:bg-board-dark has-[:checked]:text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-stone-900'

export function PlayPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuth((state) => state.user)
  const friends = useFriends()
  const challenges = useChallenges()
  const [timeControl, setTimeControl] = useState<TimeControlId>('5+0')
  const [color, setColor] = useState<ColorChoice>('random')
  const [rated, setRated] = useState(false)
  const [opponent, setOpponent] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submitButton = useRef<HTMLButtonElement>(null)
  const ratedHintId = useId()
  const opponentId = useId()
  const canRate = user !== null && !user.isGuest
  const friendList = friends.data?.friends ?? []

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    try {
      const challenge = await createChallenge({
        timeControl,
        color,
        rated: rated && canRate,
        friendId: opponent || undefined,
      })
      await navigate(`/c/${challenge.code}`)
    } catch (caught) {
      setError(playErrorKey(caught))
      setPending(false)
    }
  }

  function challengeFriend(friendId: string) {
    setOpponent(friendId)
    submitButton.current?.focus()
  }

  const outgoing = challenges.data?.outgoing ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{t('play.title')}</h1>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form
          onSubmit={(event) => void submit(event)}
          aria-labelledby="new-game-title"
          className="space-y-6 rounded-2xl border border-line bg-surface p-5 sm:p-6"
        >
          <h2 id="new-game-title" className="text-xl font-semibold">
            {t('play.newGame')}
          </h2>

          <fieldset>
            <legend className="mb-2 font-medium">{t('play.timeControl')}</legend>
            <div className="grid grid-cols-3 gap-2">
              {TIME_CONTROLS.map((tc) => (
                <label key={tc.id} className={tileClass}>
                  <input
                    type="radio"
                    name="timeControl"
                    value={tc.id}
                    checked={timeControl === tc.id}
                    onChange={() => setTimeControl(tc.id)}
                    className="sr-only"
                  />
                  <span className="text-xl font-semibold tabular-nums">{tc.id}</span>
                  <span className="text-sm opacity-80">
                    {t(`play.category.${timeControlCategory(tc)}`)}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted">{t('play.timeControlHint')}</p>
          </fieldset>

          <fieldset>
            <legend className="mb-2 font-medium">{t('play.yourColor')}</legend>
            <div className="grid max-w-md grid-cols-3 gap-2">
              {COLOR_CHOICES.map((choice) => (
                <label key={choice} className={tileClass}>
                  <input
                    type="radio"
                    name="color"
                    value={choice}
                    checked={color === choice}
                    onChange={() => setColor(choice)}
                    className="sr-only"
                  />
                  <span aria-hidden className="text-2xl leading-none">
                    {choice === 'white' ? '♔' : choice === 'black' ? '♚' : '⚄'}
                  </span>
                  <span className="text-sm font-medium">{t(`bot.colors.${choice}`)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label className="flex items-center gap-3 font-medium">
              <input
                type="checkbox"
                checked={rated && canRate}
                disabled={!canRate}
                onChange={(event) => setRated(event.target.checked)}
                aria-describedby={ratedHintId}
                className="h-5 w-5 accent-board-dark"
              />
              {t('play.rated')}
            </label>
            <p id={ratedHintId} className="mt-1 text-sm text-muted">
              {canRate ? (
                t('play.ratedHint')
              ) : (
                <>
                  {t('play.ratedGuest')}{' '}
                  <Link to="/register?next=/play" className="font-medium underline">
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </p>
          </div>

          {friendList.length > 0 && (
            <div>
              <label htmlFor={opponentId} className="font-medium">
                {t('play.opponent')}
              </label>
              <select
                id={opponentId}
                value={opponent}
                onChange={(event) => setOpponent(event.target.value)}
                className="mt-1 block w-full max-w-md rounded-lg border border-line bg-surface px-3 py-2"
              >
                <option value="">{t('play.anyone')}</option>
                {friendList.map((friend) => (
                  <option key={friend.id} value={friend.id}>
                    {friend.name}
                    {friend.online ? ` — ${t('play.friends.online')}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <button
              ref={submitButton}
              type="submit"
              disabled={pending}
              className="rounded-lg bg-accent px-6 py-3 font-semibold text-ink hover:brightness-105 disabled:opacity-60"
            >
              {t(opponent ? 'play.inviteFriend' : 'play.createLink')}
            </button>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {t(error)}
              </p>
            )}
          </div>
        </form>

        <aside className="space-y-4">
          {outgoing.length > 0 && (
            <section
              aria-labelledby="outgoing-title"
              className="rounded-2xl border border-line bg-surface p-4"
            >
              <h2 id="outgoing-title" className="font-semibold">
                {t('play.challenge.outgoing')}
              </h2>
              <ul className="mt-2 divide-y divide-line">
                {outgoing.map((challenge) => (
                  <li
                    key={challenge.code}
                    className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                  >
                    <Link to={`/c/${challenge.code}`} className="font-medium underline">
                      {challengeSummary(t, challenge.timeControl, challenge.rated)}
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        void cancelChallenge(challenge.code).then(() =>
                          challenges.refetch(),
                        )
                      }
                      className="rounded-md px-2 py-1 text-muted hover:bg-paper"
                    >
                      {t('play.challenge.cancel')}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <FriendsPanel onChallenge={challengeFriend} />
        </aside>
      </div>
    </div>
  )
}
