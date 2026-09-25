import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { ApiError } from '../../api/client'
import { Board } from '../../chess/Board'
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
              className={rating.change >= 0 ? 'text-green-700' : 'text-red-700'}
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
      {puzzle.isError && (
        <p className="text-muted">
          {puzzle.error instanceof ApiError && puzzle.error.status === 404
            ? t('puzzles.noneLeft')
            : t('auth.errors.unknown')}
        </p>
      )}
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
      <div className="mx-auto w-full max-w-[min(100%,calc(100dvh-16rem),36rem)]">
        <Board
          fen={solver.fen}
          orientation={solver.solverColor === 'w' ? 'white' : 'black'}
          movableColor={solver.status === 'playing' ? solver.solverColor : null}
          onMove={solver.playerMove}
          lastMove={solver.lastMove}
        />
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="font-semibold" aria-live="polite">
            {statusText(t, solver.status, solver.solverColor)}
          </p>
          {finished && (
            <p className="mt-2 text-sm text-muted">
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
              className="rounded-lg bg-accent px-4 py-2 font-semibold text-ink"
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
