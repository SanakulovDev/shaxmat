import { type FormEvent, useCallback, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { authErrorKey } from '../auth/errors'
import { safeNext } from '../auth/next'
import { type TelegramUser, useAuth } from '../auth/store'
import { STAR_POINTS } from '../components/StarMark'
import { TelegramLoginButton } from '../components/TelegramLoginButton'
import { shake } from '../lib/motion'

type Mode = 'login' | 'register'

const inputClass =
  'mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 transition focus:border-board-dark focus:outline-none focus:ring-4 focus:ring-board-dark/15'

// Pieces drifting behind the card.
const FLOATERS = [
  { glyph: '♞', left: '2%', top: '6%', size: '6rem', duration: '19s', delay: '-4s' },
  { glyph: '♜', left: '80%', top: '2%', size: '5rem', duration: '23s', delay: '-11s' },
  { glyph: '♝', left: '10%', top: '62%', size: '5.5rem', duration: '17s', delay: '-7s' },
  { glyph: '♛', left: '84%', top: '58%', size: '6.5rem', duration: '21s', delay: '-2s' },
  { glyph: '♟', left: '44%', top: '84%', size: '3.5rem', duration: '16s', delay: '-9s' },
]

const SPARKS = [
  { left: '24%', top: '14%', size: 12, delay: '0s' },
  { left: '72%', top: '30%', size: 10, delay: '-1.8s' },
  { left: '18%', top: '44%', size: 9, delay: '-3.2s' },
  { left: '66%', top: '80%', size: 11, delay: '-2.4s' },
]

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgb(224_165_38/0.16),transparent_60%)]" />
      {FLOATERS.map(({ glyph, left, top, size, duration, delay }) => (
        <span
          key={glyph}
          className="absolute animate-drift font-symbols leading-none text-board-dark/[0.07]"
          style={{ left, top, fontSize: size, animationDuration: duration, animationDelay: delay }}
        >
          {glyph}
          {'︎'}
        </span>
      ))}
      {SPARKS.map(({ left, top, size, delay }) => (
        <svg
          key={`${left}-${top}`}
          viewBox="-1.5 -1.5 27 27"
          className="absolute animate-twinkle"
          style={{ left, top, width: size, height: size, animationDelay: delay }}
        >
          <polygon points={STAR_POINTS} fill="#e0a526" />
        </svg>
      ))}
    </div>
  )
}

function Spinner() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4 animate-spin">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function AuthPage({ mode }: { mode: Mode }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const { user, login, register, loginWithTelegram, continueAsGuest } =
    useAuth()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const errorId = useId()
  const hintId = useId()
  const card = useRef<HTMLDivElement>(null)

  const run = useCallback(
    async (action: () => Promise<void>, errorKey?: string) => {
      setError(null)
      setPending(true)
      try {
        await action()
        await navigate(next)
      } catch (caught) {
        setError(errorKey ?? authErrorKey(caught))
        shake(card.current)
      } finally {
        setPending(false)
      }
    },
    [navigate, next],
  )

  const onTelegramAuth = useCallback(
    (data: TelegramUser) =>
      void run(() => loginWithTelegram(data), 'auth.errors.telegram'),
    [run, loginWithTelegram],
  )

  if (user && !user.isGuest) return <Navigate to={next} replace />

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email'))
    const password = String(form.get('password'))
    void run(() =>
      mode === 'login'
        ? login(email, password)
        : register(String(form.get('name')), email, password),
    )
  }

  const isLogin = mode === 'login'

  return (
    <div className="relative isolate -mx-4 -my-8 px-4 py-10 sm:py-16">
      <Backdrop />
      <div
        ref={card}
        className="mx-auto max-w-sm animate-card-in rounded-2xl border border-line bg-surface/95 p-6 shadow-[0_24px_60px_-24px_rgb(31_81_53/0.35)] backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-11 animate-pop-in items-center justify-center rounded-xl bg-board-dark font-symbols text-2xl text-accent shadow-md ring-4 ring-accent/15 [animation-delay:120ms]"
          >
            ♞︎
          </span>
          <h1 className="text-2xl font-bold">
            {t(isLogin ? 'nav.login' : 'nav.register')}
          </h1>
        </div>

        <form onSubmit={onSubmit} className="stagger mt-6 space-y-4">
          {!isLogin && (
            <label className="block text-sm font-medium">
              {t('auth.name')}
              <input
                name="name"
                required
                minLength={2}
                maxLength={50}
                autoComplete="name"
                className={inputClass}
              />
            </label>
          )}
          <label className="block text-sm font-medium">
            {t('auth.email')}
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              aria-invalid={error !== null}
              aria-describedby={error ? errorId : undefined}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium">
            {t('auth.password')}
            <input
              name="password"
              type="password"
              required
              minLength={isLogin ? 1 : 8}
              maxLength={128}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              aria-invalid={error !== null}
              aria-describedby={
                [isLogin ? null : hintId, error ? errorId : null]
                  .filter(Boolean)
                  .join(' ') || undefined
              }
              className={inputClass}
            />
          </label>
          {!isLogin && (
            <p id={hintId} className="-mt-3 text-xs text-muted">
              {t('auth.passwordHint')}
            </p>
          )}

          {error && (
            <p
              id={errorId}
              role="alert"
              className="animate-pop-in rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {t(error)}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-board-dark py-2.5 font-medium text-white hover:bg-board-dark/90 hover:shadow-lg disabled:opacity-60"
          >
            {pending && <Spinner />}
            {t(isLogin ? 'auth.submitLogin' : 'auth.submitRegister')}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-line" />
          {t('auth.or')}
          <span className="h-px flex-1 bg-line" />
        </div>

        <div className="space-y-3">
          <TelegramLoginButton onAuth={onTelegramAuth} />
          {!user && (
            <button
              type="button"
              disabled={pending}
              onClick={() => void run(continueAsGuest)}
              className="w-full rounded-lg border border-line py-2.5 text-sm font-medium hover:bg-paper disabled:opacity-50"
            >
              {t('auth.guest')}
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          {t(isLogin ? 'auth.noAccount' : 'auth.haveAccount')}{' '}
          <Link
            to={`${isLogin ? '/register' : '/login'}${next === '/' ? '' : `?next=${encodeURIComponent(next)}`}`}
            className="font-medium text-board-dark underline"
          >
            {t(isLogin ? 'nav.register' : 'nav.login')}
          </Link>
        </p>
      </div>
    </div>
  )
}
