import { describe, expect, it } from 'vitest'
import { formatClock, formatDiff } from './format'

describe('formatClock', () => {
  it('shows minutes and seconds', () => {
    expect(formatClock(300_000)).toBe('5:00')
    expect(formatClock(61_999)).toBe('1:01')
    expect(formatClock(1_800_000)).toBe('30:00')
  })

  it('adds tenths below ten seconds and never goes negative', () => {
    expect(formatClock(9_870)).toBe('0:09.8')
    expect(formatClock(10_000)).toBe('0:10')
    expect(formatClock(-500)).toBe('0:00.0')
  })
})

describe('formatDiff', () => {
  it('signs rating changes', () => {
    expect(formatDiff(8)).toBe('+8')
    expect(formatDiff(-5)).toBe('−5')
    expect(formatDiff(0)).toBe('±0')
  })
})
