import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import {
  acceptChallenge,
  declineChallenge,
  playErrorKey,
  useChallenges,
} from './api'
import { challengeSummary } from './format'

// Challenges from friends, shown on every page. The live region is always
// rendered so that a new challenge is announced.
export function IncomingChallenges() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const challenges = useChallenges()
  const [error, setError] = useState<string | null>(null)
  const incoming = challenges.data?.incoming ?? []

  async function run(action: () => Promise<void>) {
    setError(null)
    try {
      await action()
    } catch (caught) {
      setError(playErrorKey(caught))
    }
    await challenges.refetch()
  }

  return (
    <div aria-live="polite">
      {incoming.map((challenge) => (
        <div
          key={challenge.code}
          className="border-b border-lapis/30 bg-lapis px-4 py-3 text-white"
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
            <p className="min-w-0 flex-1">
              {t('play.incoming.text', {
                name: challenge.creator.name,
                summary: challengeSummary(t, challenge.timeControl, challenge.rated),
              })}
            </p>
            <button
              type="button"
              onClick={() =>
                void run(async () => {
                  const { gameId } = await acceptChallenge(challenge.code)
                  await navigate(`/game/${gameId}`)
                })
              }
              className="rounded-lg bg-accent px-4 py-1.5 font-semibold text-ink"
            >
              {t('play.challenge.accept')}
            </button>
            <button
              type="button"
              onClick={() => void run(() => declineChallenge(challenge.code).then(() => {}))}
              className="rounded-lg border border-white/60 px-4 py-1.5 font-medium"
            >
              {t('play.challenge.decline')}
            </button>
          </div>
        </div>
      ))}
      {error && (
        <p role="alert" className="bg-red-50 px-4 py-2 text-center text-sm text-red-800">
          {t(error)}
        </p>
      )}
    </div>
  )
}
