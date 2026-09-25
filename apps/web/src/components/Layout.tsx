import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router'
import { useAuth } from '../auth/store'

export function Layout() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <img src="/favicon.svg" alt="" className="h-7 w-7" />
            {t('app.name')}
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {user && !user.isGuest ? (
              <>
                <span className="font-medium">{user.name}</span>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-md px-3 py-1.5 text-stone-600 hover:bg-stone-100"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md px-3 py-1.5 text-stone-600 hover:bg-stone-100"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-board-dark px-3 py-1.5 font-medium text-white hover:opacity-90"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      {user?.isGuest && (
        <p className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
          {t('home.guestNote')}
        </p>
      )}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
