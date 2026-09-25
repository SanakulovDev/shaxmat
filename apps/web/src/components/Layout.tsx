import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet } from 'react-router'
import { useAuth } from '../auth/store'
import { LanguageSwitcher } from './LanguageSwitcher'

const SECTIONS = [
  { to: '/learn', key: 'nav.learn' },
  { to: '/bot', key: 'nav.bot' },
  { to: '/puzzles', key: 'nav.puzzles' },
] as const

export function Layout() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:font-medium focus:shadow"
      >
        {t('nav.skipToContent')}
      </a>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <img src="/favicon.svg" alt="" className="h-7 w-7" />
            {t('app.name')}
          </Link>
          <nav
            aria-label={t('nav.main')}
            className="order-last flex w-full gap-1 text-sm sm:order-none sm:w-auto"
          >
            {SECTIONS.map(({ to, key }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 font-medium ${
                    isActive
                      ? 'bg-paper text-ink'
                      : 'text-muted hover:bg-paper'
                  }`
                }
              >
                {t(key)}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <LanguageSwitcher />
            {user && (
              <Link
                to="/profile"
                className="rounded-md px-3 py-1.5 font-medium hover:bg-paper"
              >
                {user.isGuest ? t('nav.guest') : user.name}
              </Link>
            )}
            {user && !user.isGuest ? (
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-md px-3 py-1.5 text-muted hover:bg-paper"
              >
                {t('nav.logout')}
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md px-3 py-1.5 text-muted hover:bg-paper"
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
          </div>
        </div>
      </header>
      {user?.isGuest && (
        <p className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
          {t('home.guestNote')}
        </p>
      )}
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto max-w-6xl px-4 py-8 outline-none"
      >
        <Outlet />
      </main>
    </div>
  )
}
