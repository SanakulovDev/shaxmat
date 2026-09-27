import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { ApiError } from '../../api/client'
import { Board } from '../../chess/Board'
import { Confetti } from '../../components/Confetti'
import {
  type AttemptResult,
  fetchNextPuzzle,
  type Puzzle,
  sendAttempt,
} from './api'
import { usePuzzleSolver } from './usePuzzleSolver'

// Themes offered as filters, in the order shown. Names are in uz.json.
const PUZZLE_THEMES = [
  'mateIn1',
  'mateIn2',
  'fork',
  'pin',
  'skewer',
  'hangingPiece',
  'discoveredAttack',
  'backRankMate',
  'sacrifice',
  'endgame',
] as const

export function PuzzlePage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  // Lessons link here with ?theme=fork and so on.
  const [theme, setTheme] = useState<string | null>(params.get('theme'))
  const [round, setRound] = useState(0)
  const [rating, setRating] = useState<AttemptResult | null>(null)

  const puzzle = useQuery({
    queryKey: ['puzzle', theme, round],
    queryFn: () => fetchNextPuzzle(theme),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const next = () => setRound((r) => r + 1)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('puzzles.title')}</h1>
        {rating && (
          <p className="text-sm" aria-live="polite">
            {t('puzzles.rating')}:{' '}
            <span className="font-semibold">{rating.rating}</span>{' '}
            <span
              key={rating.rating}
              className={`inline-block animate-pop-in ${
                rating.change >= 0 ? 'text-green-700' : 'text-red-700'
              }`}
            >
              ({rating.change >= 0 ? '+' : ''}
              {rating.change})
            </span>
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {[null, ...PUZZLE_THEMES].map((value) => (
          <button
            key={value ?? 'all'}
            type="button"
            aria-pressed={theme === value}
            onClick={() => setTheme(value)}
            className={`rounded-full border px-3 py-1 text-sm ${
              theme === value
                ? 'border-board-dark bg-board-dark text-white'
                : 'border-line bg-surface hover:bg-paper'
            }`}
          >
            {t(value ? `puzzles.themes.${value}` : 'puzzles.allThemes')}
          </button>
        ))}
      </div>

      {puzzle.isPending && (
        <p className="text-muted">{t('common.loading')}</p>
      )}
      {puzzle.isError &&
        (puzzle.error instanceof ApiError && puzzle.error.status === 404 ? (
          <p className="text-muted">{t('puzzles.noneLeft')}</p>
        ) : (
          <div role="alert" className="flex flex-wrap items-center gap-3">
            <p className="text-muted">{t('auth.errors.unknown')}</p>
            <button
              type="button"
              onClick={() => void puzzle.refetch()}
              className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium hover:bg-paper"
            >
              {t('common.retry')}
            </button>
          </div>
        ))}
      {puzzle.data && (
        <PuzzleSolver
          key={puzzle.data.id}
          puzzle={puzzle.data}
          onRated={setRating}
          onNext={next}
        />
      )}
    </div>
  )
}

function PuzzleSolver({
  puzzle,
  onRated,
  onNext,
}: {
  puzzle: Puzzle
  onRated: (result: AttemptResult) => void
  onNext: () => void
}) {
  const { t } = useTranslation()
  const attempt = useMutation({
    mutationFn: (solved: boolean) => sendAttempt(puzzle.id, solved),
    onSuccess: onRated,
  })
  const { mutate } = attempt
  const onFirstResult = useCallback(
    (solved: boolean) => mutate(solved),
    [mutate],
  )
  const solver = usePuzzleSolver(puzzle, onFirstResult)
  const finished = solver.status === 'solved' || solver.status === 'revealed'

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="relative mx-auto w-full max-w-[min(100%,calc(100dvh-16rem),36rem)] animate-pop-in">
        <Board
          fen={solver.fen}
          orientation={solver.solverColor === 'w' ? 'white' : 'black'}
          movableColor={solver.status === 'playing' ? solver.solverColor : null}
          onMove={solver.playerMove}
          lastMove={solver.lastMove}
          flash={solver.flash}
        />
        {solver.status === 'solved' && <Confetti />}
      </div>

      <aside className="space-y-4">
        <div
          className={`rounded-xl border p-4 transition-colors duration-300 ${
            solver.status === 'solved'
              ? 'border-green-300 bg-green-50'
              : solver.status === 'wrong'
                ? 'border-red-200 bg-red-50'
                : 'border-line bg-surface'
          }`}
        >
          {/* The live region stays; each new status inside it slides in, and
              a wrong move shakes it. */}
          <p className="font-semibold" aria-live="polite">
            <span
              key={solver.status}
              className={`inline-block ${
                solver.status === 'wrong'
                  ? 'animate-shake text-red-800'
                  : solver.status === 'solved'
                    ? 'animate-pop-in text-green-900'
                    : 'animate-pop-in'
              }`}
            >
              {statusText(t, solver.status, solver.solverColor)}
            </span>
          </p>
          {finished && (
            <p className="mt-2 animate-pop-in text-sm text-muted">
              {t('puzzles.puzzleRating', { rating: puzzle.rating })}
              {puzzle.themes
                .filter((theme) =>
                  t(`puzzles.themes.${theme}`, { defaultValue: '' }),
                )
                .map((theme) => ` · ${t(`puzzles.themes.${theme}`)}`)
                .join('')}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {finished ? (
            <button
              type="button"
              onClick={onNext}
              className="animate-pop-in rounded-lg bg-accent px-4 py-2 font-semibold text-ink shadow-[0_8px_20px_-8px_rgb(224_165_38/0.8)] hover:brightness-105"
            >
              {t('puzzles.next')}
            </button>
          ) : (
            <button
              type="button"
              onClick={solver.revealSolution}
              disabled={solver.status !== 'playing'}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium disabled:opacity-40"
            >
              {t('puzzles.showSolution')}
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}

type Translate = (key: string) => string

function statusText(t: Translate, status: string, color: 'w' | 'b') {
  switch (status) {
    case 'intro':
      return t('puzzles.status.intro')
    case 'wrong':
      return t('puzzles.status.wrong')
    case 'solved':
      return t('puzzles.status.solved')
    case 'revealed':
      return t('puzzles.status.revealed')
    default:
      return t(
        color === 'w'
          ? 'puzzles.status.whiteToMove'
          : 'puzzles.status.blackToMove',
      )
  }
}
