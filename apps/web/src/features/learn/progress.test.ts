import { STAGES } from '@shaxmat/content'
import { describe, expect, it } from 'vitest'
import { examStatus, type ProgressSummary } from './progress'

const summary = (overrides: Partial<ProgressSummary>): ProgressSummary => ({
  puzzleRating: { rating: 1000, rd: 350, count: 0 },
  puzzlesSolved: 0,
  lessons: [],
  bots: [],
  ...overrides,
})

describe('examStatus', () => {
  const stage1 = STAGES[1]! // bot level 3 + 20 solved puzzles

  it('passes when every requirement is met', () => {
    const status = examStatus(
      stage1,
      summary({
        puzzlesSolved: 20,
        bots: [{ level: 4, games: 1, wins: 1, draws: 0 }],
      }),
    )
    expect(status).toEqual({
      bot: true,
      puzzlesSolved: true,
      puzzleRating: null,
      passed: true,
    })
  })

  it('does not count games against weaker bots or games without a win', () => {
    const status = examStatus(
      stage1,
      summary({
        puzzlesSolved: 25,
        bots: [
          { level: 2, games: 3, wins: 3, draws: 0 },
          { level: 3, games: 2, wins: 0, draws: 1 },
        ],
      }),
    )
    expect(status.bot).toBe(false)
    expect(status.passed).toBe(false)
  })

  it('is not passed without progress data', () => {
    expect(examStatus(STAGES[0]!, undefined).passed).toBe(false)
  })
})
