import { api } from '../../api/client'
import { ensureSession } from '../../auth/store'

export type Puzzle = {
  id: string
  fen: string
  // moves[0] is the opponent's move; the solver plays moves[1], moves[3], ...
  moves: string[]
  rating: number
  themes: string[]
}

export type AttemptResult = { rating: number; change: number }

export async function fetchNextPuzzle(theme: string | null): Promise<Puzzle> {
  await ensureSession()
  const query = theme ? `?theme=${encodeURIComponent(theme)}` : ''
  return api<Puzzle>(`/puzzles/next${query}`)
}

export function sendAttempt(id: string, solved: boolean) {
  return api<AttemptResult>(`/puzzles/${id}/attempt`, {
    method: 'POST',
    body: { solved },
  })
}
