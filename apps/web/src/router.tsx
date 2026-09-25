import { createBrowserRouter } from 'react-router'
import { Layout } from './components/Layout'
import { AuthPage } from './pages/AuthPage'
import { HomePage } from './pages/HomePage'

// Feature pages load on first visit, so the home page stays small.
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <AuthPage mode="login" /> },
      { path: '/register', element: <AuthPage mode="register" /> },
      {
        path: '/bot',
        lazy: async () => ({
          Component: (await import('./features/bot/BotLobbyPage')).BotLobbyPage,
        }),
      },
      {
        path: '/bot/play',
        lazy: async () => ({
          Component: (await import('./features/bot/BotGamePage')).BotGamePage,
        }),
      },
      {
        path: '/puzzles',
        lazy: async () => ({
          Component: (await import('./features/puzzles/PuzzlePage')).PuzzlePage,
        }),
      },
      {
        path: '/learn',
        lazy: async () => ({
          Component: (await import('./features/learn/LearnPage')).LearnPage,
        }),
      },
      {
        path: '/learn/:slug',
        lazy: async () => ({
          Component: (await import('./features/learn/LessonPage')).LessonPage,
        }),
      },
      {
        path: '/profile',
        lazy: async () => ({
          Component: (await import('./features/profile/ProfilePage')).ProfilePage,
        }),
      },
    ],
  },
])
