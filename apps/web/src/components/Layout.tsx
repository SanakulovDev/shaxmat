import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useMatch,
  useNavigation,
} from 'react-router'
import { useAuth } from '../auth/store'
import { IncomingChallenges } from '../features/play/IncomingChallenges'
import { enterPage } from '../lib/motion'
import { RealtimeBridge } from '../realtime/socket'
import { LanguageSwitcher } from './LanguageSwitcher'

const SECTIONS = [
  { to: '/learn', key: 'nav.learn' },
  { to: '/bot', key: 'nav.bot' },
  { to: '/puzzles', key: 'nav.puzzles' },
  { to: '/play', key: 'nav.play' },
  { to: '/games', key: 'nav.games' },
] as const

export function Layout() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  // The home page opens on a dark hero, so its header is dark too and the
  // page runs full width.
  const isHome = useMatch('/') !== null
  const quiet = isHome
    ? 'text-board-light/75 hover:bg-white/10 hover:text-white'
    : 'text-muted hover:bg-paper'
  const { pathname } = useLocation()
  // A page's code loads on its first visit; a bar shows it is coming.
  const loading = useNavigation().state === 'loading'
  const main = useRef<HTMLElement>(null)
  const shownPath = useRef(pathname)

  // Each new page slides in. The first one does not: the home hero has
  // its own entrance.
  useEffect(() => {
    if (shownPath.current === pathname) return
    shownPath.current = pathname
    enterPage(main.current)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <RealtimeBridge />
      {loading && (
        <div
          aria-hidden
          className="fixed left-0 top-0 z-50 h-0.5 animate-loading-bar bg-accent shadow-[0_0_8px_var(--color-accent)]"
        />
      )}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:font-medium focus:shadow"
      >
        {t('nav.skipToContent')}
      </a>
      <header
        className={
          isHome
            ? 'border-b border-white/10 bg-forest text-board-light'
            : 'border-b border-line bg-surface'
        }
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <img src="/favicon.svg" alt="" className="h-7 w-7" />
            {t('app.name')}
          </Link>
          <nav
            aria-label={t('nav.main')}
            className="order-last -mx-1 flex w-full gap-1 overflow-x-auto px-1 text-sm sm:order-none sm:mx-0 sm:w-auto sm:px-0"
          >
            {SECTIONS.map(({ to, key }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors duration-200 ${
                    isActive ? (isHome ? 'bg-white/10 text-white' : 'bg-paper text-ink') : quiet
                  }`
                }
              >
                {t(key)}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <LanguageSwitcher dark={isHome} />
            {user && (
              <Link
                to="/profile"
                className={`rounded-md px-3 py-1.5 font-medium transition-colors ${isHome ? 'hover:bg-white/10' : 'hover:bg-paper'}`}
              >
                {user.isGuest ? t('nav.guest') : user.name}
              </Link>
            )}
            {user && !user.isGuest ? (
              <button
                type="button"
                onClick={() => void logout()}
                className={`rounded-md px-3 py-1.5 ${quiet}`}
              >
                {t('nav.logout')}
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`rounded-md px-3 py-1.5 transition-colors ${quiet}`}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className={`rounded-md px-3 py-1.5 font-medium transition hover:opacity-90 ${
                    isHome ? 'bg-accent text-ink' : 'bg-board-dark text-white'
                  }`}
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      {user && <IncomingChallenges />}
      {user?.isGuest && (
        <p
          className={`px-4 py-2 text-center text-sm ${
            isHome
              ? 'border-b border-white/10 bg-forest-soft text-board-light/85'
              : 'bg-amber-50 text-amber-900'
          }`}
        >
          {t('home.guestNote')}
        </p>
      )}
      <main
        ref={main}
        id="main"
        tabIndex={-1}
        className={`flex-1 outline-none ${isHome ? '' : 'mx-auto w-full max-w-6xl px-4 py-8'}`}
      >
        <Outlet />
      </main>
      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-6 text-sm text-muted">
          <p className="flex items-center gap-2">
            <img src="/favicon.svg" alt="" className="h-5 w-5" />© {new Date().getFullYear()}{' '}
            {t('app.name')}
          </p>
          <p>{t('footer.credits')}</p>
        </div>
      </footer>
    </div>
  )
}
