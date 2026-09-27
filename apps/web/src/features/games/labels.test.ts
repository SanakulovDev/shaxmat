import type { TFunction } from 'i18next'
import { describe, expect, it } from 'vitest'
import { formatResult, roundName, scoreOf, splitTourName } from './labels'

const t = ((key: string, options?: { number?: number }) =>
  `${key}:${options?.number ?? ''}`) as unknown as TFunction

describe('roundName', () => {
  it('translates plain round numbers only', () => {
    expect(roundName(t, 'Round 11')).toBe('games.round:11')
    expect(roundName(t, 'Ronda 6')).toBe('Ronda 6')
  })
})

describe('splitTourName', () => {
  it('separates the event from its section', () => {
    expect(splitTourName('Olympiad 2026 | Open | Matches 1-12')).toEqual({
      event: 'Olympiad 2026',
      section: 'Open · Matches 1-12',
    })
    expect(splitTourName('Perth Open')).toEqual({ event: 'Perth Open', section: null })
  })
})

describe('results', () => {
  it("gives each side's score", () => {
    expect(scoreOf('1-0', 'w')).toBe('1')
    expect(scoreOf('0-1', 'w')).toBe('0')
    expect(scoreOf('½-½', 'b')).toBe('½')
    expect(scoreOf('1/2-1/2', 'w')).toBe('½')
    expect(scoreOf('*', 'w')).toBeNull()
  })

  it('writes results with a dash', () => {
    expect(formatResult('1-0')).toBe('1–0')
    expect(formatResult('1/2-1/2')).toBe('½–½')
  })
})
