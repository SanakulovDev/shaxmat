import type { Clock, GameCategory, Side, TimeControlId } from '@shaxmat/chess-core'
import { useQuery } from '@tanstack/react-query'
import { api, ApiError } from '../../api/client'
import { ensureSession, useAuth } from '../../auth/store'

export type PlayerView = {
  id: string
  name: string
  isGuest: boolean
  rating: number | null
  ratingDiff: number | null
}

export type GameView = {
  id: string
  status: 'active' | 'finished' | 'aborted'
  rated: boolean
  category: GameCategory | 'puzzle' | null
  botLevel: number | null
  timeControl: { initial: number; increment: number } | null
  white: PlayerView | null
  black: PlayerView | null
  moves: string[]
  clock: Clock | null
  drawOffer: Side | null
  takebackOffer: Side | null
  result: string
  termination: string | null
  createdAt: string
  serverNow: number
}

export type ChatLine = { userId: string; name: string; text: string; at: number }

export type PublicUser = {
  id: string
  name: string
  avatarUrl: string | null
  isGuest: boolean
}

export type ChallengeView = {
  code: string
  creator: PublicUser
  destId: string | null
  // The creator's colour.
  color: 'white' | 'black' | 'random'
  rated: boolean
  timeControl: { initial: number; increment: number }
  status: 'open' | 'accepted' | 'declined' | 'cancelled' | 'expired'
  gameId: string | null
  expiresAt: string
}

export type FriendsList = {
  friends: (PublicUser & { online: boolean })[]
  incoming: PublicUser[]
  outgoing: PublicUser[]
}

export type NewChallenge =
  | {
      timeControl: TimeControlId
      color: 'white' | 'black' | 'random'
      rated: boolean
      friendId?: string
    }
  | { rematchOf: string }

export function useChallenges() {
  const status = useAuth((state) => state.status)
  return useQuery({
    queryKey: ['challenges'],
    queryFn: () =>
      api<{ incoming: ChallengeView[]; outgoing: ChallengeView[] }>('/challenges'),
    enabled: status === 'authenticated',
  })
}

export function useFriends() {
  const user = useAuth((state) => state.user)
  return useQuery({
    queryKey: ['friends'],
    queryFn: () => api<FriendsList>('/friends'),
    enabled: user !== null && !user.isGuest,
  })
}

export async function createChallenge(body: NewChallenge) {
  await ensureSession()
  return api<ChallengeView>('/challenges', { method: 'POST', body })
}

export function acceptChallenge(code: string) {
  return api<{ gameId: string }>(`/challenges/${code}/accept`, { method: 'POST' })
}

export function declineChallenge(code: string) {
  return api(`/challenges/${code}/decline`, { method: 'POST' })
}

export function cancelChallenge(code: string) {
  return api(`/challenges/${code}`, { method: 'DELETE' })
}

export function addFriend(userId: string) {
  return api(`/friends/${userId}`, { method: 'POST' })
}

export function acceptFriend(userId: string) {
  return api(`/friends/${userId}/accept`, { method: 'POST' })
}

export function removeFriend(userId: string) {
  return api(`/friends/${userId}`, { method: 'DELETE' })
}

const KNOWN_ERRORS = new Set([
  'registrationRequired',
  'challengeClosed',
  'notForYou',
  'notFriends',
  'ownChallenge',
])

// i18n key for an error from the play API. The API sends a short code as
// the message for the errors a player can run into.
export function playErrorKey(error: unknown): string {
  if (error instanceof ApiError && KNOWN_ERRORS.has(error.message)) {
    return `play.errors.${error.message}`
  }
  return 'play.errors.generic'
}
