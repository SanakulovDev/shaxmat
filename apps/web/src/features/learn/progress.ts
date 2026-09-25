import type { Stage } from '@shaxmat/content'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import { ensureSession, useAuth } from '../../auth/store'

export type ProgressSummary = {
  puzzleRating: { rating: number; rd: number; count: number }
  puzzlesSolved: number
  lessons: { lessonSlug: string; completedAt: string }[]
  bots: { level: number; games: number; wins: number; draws: number }[]
}

export function useProgress() {
  const status = useAuth((state) => state.status)
  return useQuery({
    queryKey: ['progress'],
    queryFn: () => api<ProgressSummary>('/progress'),
    enabled: status === 'authenticated',
  })
}

export async function completeLesson(slug: string) {
  await ensureSession()
  await api(`/progress/lessons/${slug}`, { method: 'PUT' })
}

export type ExamStatus = {
  bot: boolean
  puzzlesSolved: boolean | null
  puzzleRating: boolean | null
  passed: boolean
}

// Which parts of a stage exam the learner has done. null = not required.
export function examStatus(
  { exam }: Stage,
  summary: ProgressSummary | undefined,
): ExamStatus {
  const bot =
    summary?.bots.some((b) => b.level >= exam.botLevel && b.wins > 0) ?? false
  const puzzlesSolved =
    exam.puzzlesSolved === undefined
      ? null
      : (summary?.puzzlesSolved ?? 0) >= exam.puzzlesSolved
  const puzzleRating =
    exam.puzzleRating === undefined
      ? null
      : (summary?.puzzleRating.rating ?? 0) >= exam.puzzleRating
  return {
    bot,
    puzzlesSolved,
    puzzleRating,
    passed: bot && puzzlesSolved !== false && puzzleRating !== false,
  }
}
