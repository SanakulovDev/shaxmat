import { describe, expect, it } from 'vitest'
import { parsePgn, readClock } from './pgn'

describe('readClock', () => {
  it('reads hours, minutes and seconds', () => {
    expect(readClock('[%eval 0.2] [%clk 1:30:32]')).toBe(5432)
    expect(readClock('[%clk 0:00:05.3]')).toBeCloseTo(5.3)
    expect(readClock('Good move')).toBeNull()
  })
})

describe('parsePgn', () => {
  it('reads headers, moves and clocks', () => {
    const game = parsePgn(`[Event "Olymp 2026 Open"]
[White "Abdusattorov, Nodirbek"]
[Black "Caruana, Fabiano"]
[Result "*"]

1. e4 { [%clk 1:30:38] } 1... e5 { [%clk 1:30:55] } 2. Bc4 *`)
    expect(game.headers.White).toBe('Abdusattorov, Nodirbek')
    expect(game.moves.map((move) => move.uci)).toEqual(['e2e4', 'e7e5', 'f1c4'])
    expect(game.moves.map((move) => move.clock)).toEqual([5438, 5455, null])
    expect(game.moves[2]!.fen).toBe(
      'rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2',
    )
  })

  it('skips side lines, NAGs and annotations', () => {
    const game = parsePgn('1. e4 $1 (1. d4 d5) e5!? {A comment} 2. Nf3?! (2. f4 (2. d4)) Nc6 1-0')
    expect(game.moves.map((move) => move.san)).toEqual(['e4', 'e5', 'Nf3', 'Nc6'])
  })

  it('starts from a FEN header', () => {
    const game = parsePgn(`[SetUp "1"]
[FEN "4k3/8/8/8/8/8/8/R3K3 w Q - 0 1"]

1. Ra8# 1-0`)
    expect(game.startFen).toBe('4k3/8/8/8/8/8/8/R3K3 w Q - 0 1')
    expect(game.moves).toHaveLength(1)
  })

  it('stops at an illegal move', () => {
    const game = parsePgn('1. e4 e5 2. Ke3 Nc6')
    expect(game.moves.map((move) => move.san)).toEqual(['e4', 'e5'])
  })
})
