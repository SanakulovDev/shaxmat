import { type FormEvent, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router'
import { authErrorKey } from '../auth/errors'
import { type TelegramUser, useAuth } from '../auth/store'
import { TelegramLoginButton } from '../components/TelegramLoginButton'

type Mode = 'login' | 'register'

const inputClass =
  'mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-board-dark focus:outline-none focus:ring-2 focus:ring-board-dark/20'

export function AuthPage({ mode }: { mode: Mode }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, login, register, loginWithTelegram, continueAsGuest } =
    useAuth()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const run = useCallback(
    async (action: () => Promise<void>, errorKey?: string) => {
      setError(null)
      setPending(true)
      try {
        await action()
        await navigate('/')
      } catch (caught) {
        setError(errorKey ?? authErrorKey(caught))
      } finally {
        setPending(false)
      }
    },
    [navigate],
  )

  const onTelegramAuth = useCallback(
    (data: TelegramUser) =>
      void run(() => loginWithTelegram(data), 'auth.errors.telegram'),
    [run, loginWithTelegram],
  )

  if (user && !user.isGuest) return <Navigate to="/" replace />

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
    <div className="mx-auto max-w-sm rounded-2xl border border-stone-200 bg-white p-6">
      <h1 className="text-2xl font-bold">
        {t(isLogin ? 'nav.login' : 'nav.register')}
      </h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
            className={inputClass}
          />
          {!isLogin && (
            <span className="mt-1 block text-xs font-normal text-stone-500">
              {t('auth.passwordHint')}
            </span>
          )}
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {t(error)}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-board-dark py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {t(isLogin ? 'auth.submitLogin' : 'auth.submitRegister')}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-stone-400">
        <span className="h-px flex-1 bg-stone-200" />
        {t('auth.or')}
        <span className="h-px flex-1 bg-stone-200" />
      </div>

      <div className="space-y-3">
        <TelegramLoginButton onAuth={onTelegramAuth} />
        {!user && (
          <button
            type="button"
            disabled={pending}
            onClick={() => void run(continueAsGuest)}
            className="w-full rounded-lg border border-stone-300 py-2.5 text-sm font-medium hover:bg-stone-50 disabled:opacity-50"
          >
            {t('auth.guest')}
          </button>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-stone-600">
        {t(isLogin ? 'auth.noAccount' : 'auth.haveAccount')}{' '}
        <Link
          to={isLogin ? '/register' : '/login'}
          className="font-medium text-board-dark underline"
        >
          {t(isLogin ? 'nav.register' : 'nav.login')}
        </Link>
      </p>
    </div>
  )
}
