import { describe, expect, it } from 'vitest'
import { clockLeft, samePosition } from './clock'

describe('clockLeft', () => {
  it('counts down from the moment the clock was read', () => {
    expect(clockLeft(600, 1_000, 31_000)).toBe(570)
  })

  it('never goes below zero or above the reading', () => {
    expect(clockLeft(10, 0, 60_000)).toBe(0)
    expect(clockLeft(10, 5_000, 1_000)).toBe(10)
  })
})

describe('samePosition', () => {
  it('compares the board and the side to move only', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
    expect(samePosition(fen, 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b - - 3 9')).toBe(true)
    expect(samePosition(fen, 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1')).toBe(false)
  })
})
