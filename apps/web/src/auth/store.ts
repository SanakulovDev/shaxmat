import { create } from 'zustand'
import {
  api,
  type AuthResponse,
  onSessionChange,
  type PublicUser,
  refreshSession,
  setSession,
} from '../api/client'

export type TelegramUser = {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

type AuthState = {
  status: 'loading' | 'authenticated' | 'anonymous'
  user: PublicUser | null
  restore: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  loginWithTelegram: (data: TelegramUser) => Promise<void>
  continueAsGuest: () => Promise<void>
  logout: () => Promise<void>
}

async function authenticate(path: string, body?: unknown) {
  const session = await api<AuthResponse>(path, {
    method: 'POST',
    body,
    retryOnUnauthorized: false,
  })
  setSession(session)
}

export const useAuth = create<AuthState>()(() => ({
  status: 'loading',
  user: null,
  // Runs once on page load: the refresh cookie, if present, restores the
  // session.
  restore: async () => {
    await refreshSession()
  },
  login: (email, password) => authenticate('/auth/login', { email, password }),
  register: (name, email, password) =>
    authenticate('/auth/register', { name, email, password }),
  loginWithTelegram: (data) => authenticate('/auth/telegram', data),
  continueAsGuest: () => authenticate('/auth/guest'),
  logout: async () => {
    try {
      await api('/auth/logout', { method: 'POST', retryOnUnauthorized: false })
    } finally {
      setSession(null)
    }
  },
}))

onSessionChange((session) => {
  useAuth.setState(
    session
      ? { status: 'authenticated', user: session.user }
      : { status: 'anonymous', user: null },
  )
})
