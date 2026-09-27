import { useQuery } from '@tanstack/react-query'
import { parsePgn } from './pgn'

// Live tournaments come from Lichess broadcasts, read straight from the
// browser: the public API allows cross-origin requests and needs no token.
const LICHESS = 'https://lichess.org'

export type BroadcastTour = {
  id: string
  name: string
  info?: {
    format?: string
    tc?: string
    location?: string
    players?: string
  }
  // Lichess ranks official events higher: 5 for the biggest.
  tier?: number
  image?: string
}

export type BroadcastRound = {
  id: string
  name: string
  ongoing?: boolean
  finished?: boolean
  startsAt?: number
}

export type RoundPlayer = {
  name: string
  title?: string
  rating?: number
  team?: string
  fed?: string
  // Centiseconds left.
  clock?: number
}

export type RoundGame = {
  id: string
  fen: string
  players: [RoundPlayer, RoundPlayer]
  lastMove?: string
  // Seconds the side to move has been thinking when the list was made.
  thinkTime?: number
  // "*" while the game goes on, else "1-0", "0-1" or "½-½".
  status: string
}

// `group` names the event when it is split into sections.
export type TopEntry = { tour: BroadcastTour; round: BroadcastRound; group?: string }

async function get<T>(path: string, as: 'json' | 'text' = 'json'): Promise<T> {
  const response = await fetch(`${LICHESS}${path}`)
  if (!response.ok) throw new Error(`Lichess ${response.status}`)
  return (as === 'json' ? response.json() : response.text()) as Promise<T>
}

// Tournaments being played now, the biggest first.
export function useLiveBroadcasts() {
  return useQuery({
    queryKey: ['broadcasts', 'top'],
    queryFn: async () => {
      const top = await get<{ active: TopEntry[] }>('/api/broadcast/top')
      return [...top.active].sort((a, b) => (b.tour.tier ?? 0) - (a.tour.tier ?? 0))
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  })
}

// Events split into sections (open and women's, say) share a group.
export type TourGroup = { id: string; name: string; tours: { id: string; name: string }[] }

export function useRound(roundId: string) {
  return useQuery({
    queryKey: ['broadcasts', 'round', roundId],
    queryFn: () =>
      get<{ round: BroadcastRound; tour: BroadcastTour; games: RoundGame[]; group?: TourGroup }>(
        `/api/broadcast/-/-/${roundId}`,
      ),
    refetchInterval: (query) => (query.state.data?.round.ongoing ? 20_000 : false),
  })
}

// A tournament with its rounds; defaultRoundId is the one Lichess would
// open: the round being played, else the latest.
export function useTour(tourId: string | undefined) {
  return useQuery({
    queryKey: ['broadcasts', 'tour', tourId],
    queryFn: () =>
      get<{ tour: BroadcastTour; rounds: BroadcastRound[]; defaultRoundId?: string }>(
        `/api/broadcast/${tourId}`,
      ),
    enabled: tourId !== undefined,
    staleTime: 60_000,
  })
}

// One game of a round, re-read every few seconds until it ends.
export function useBroadcastGame(roundId: string, gameId: string) {
  return useQuery({
    queryKey: ['broadcasts', 'game', roundId, gameId],
    queryFn: async () => parsePgn(await get<string>(`/api/study/${roundId}/${gameId}.pgn`, 'text')),
    refetchInterval: (query) => {
      const result = query.state.data?.headers.Result
      return result === undefined || result === '*' ? 10_000 : false
    },
  })
}

export function isLive(status: string | undefined) {
  return status === undefined || status === '*'
}
