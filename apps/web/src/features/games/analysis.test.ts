import { describe, expect, it } from 'vitest'
import {
  clockAt,
  finalVerdict,
  formatEval,
  formatLine,
  formatSeconds,
  material,
  toWhite,
  uciToSan,
} from './analysis'

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

describe('finalVerdict', () => {
  it('scores a mate for the side that gave it', () => {
    // Fool's mate: White is mated.
    const fen = 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3'
    expect(finalVerdict(fen)).toMatchObject({ mate: 0, best: null })
    expect(finalVerdict(fen)!.cp).toBeLessThan(-10_000)
  })

  it('scores stalemate as a draw and leaves live positions to the engine', () => {
    expect(finalVerdict('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1')).toMatchObject({ cp: 0, mate: null })
    expect(finalVerdict(START)).toBeNull()
  })
})

describe('toWhite', () => {
  it("turns Black's scores around", () => {
    const line = { move: 'e7e5', scoreCp: 40, mate: 3, depth: 12, pv: ['e7e5'] }
    const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
    expect(toWhite(line, fen)).toEqual({ cp: -40, mate: -3, best: 'e7e5', depth: 12 })
    expect(toWhite(line, START).cp).toBe(40)
  })
})

describe('formatEval', () => {
  it('shows pawns with a sign, mates and results', () => {
    expect(formatEval({ cp: 134, mate: null })).toBe('+1.3')
    expect(formatEval({ cp: -40, mate: null })).toBe('−0.4')
    expect(formatEval({ cp: 3, mate: null })).toBe('0.0')
    expect(formatEval({ cp: 99_700, mate: 3 })).toBe('#3')
    expect(formatEval({ cp: -99_800, mate: -2 })).toBe('#−2')
    expect(formatEval({ cp: -100_000, mate: 0 })).toBe('0-1')
  })
})

describe('material', () => {
  it('is level at the start', () => {
    expect(material(START)).toEqual({ extra: { w: [], b: [] }, diff: 0 })
  })

  it('shows who is up and by what', () => {
    // White has an extra rook; Black has an extra pawn.
    const fen = '4k3/pppp4/8/8/8/8/PPP5/R3K3 w - - 0 1'
    expect(material(fen)).toEqual({ extra: { w: ['r'], b: ['p'] }, diff: 4 })
  })
})

describe('move text', () => {
  it('turns UCI into SAN', () => {
    expect(uciToSan(START, 'g1f3')).toBe('Nf3')
    expect(uciToSan(START, 'e2e5')).toBeNull()
  })

  it('numbers a line from the position', () => {
    expect(formatLine(START, ['e2e4', 'e7e5', 'g1f3'])).toBe('1. e4 e5 2. Nf3')
    const black = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
    expect(formatLine(black, ['c7c5', 'g1f3'])).toBe('1… c5 2. Nf3')
  })
})

describe('clockAt', () => {
  const clocks = [5400, 5390, 5300, null, 5200]

  it("finds each side's latest recorded time", () => {
    expect(clockAt(clocks, 'w', 'w', 5)).toBe(5200)
    // Black's second clock is missing, so the first one stands.
    expect(clockAt(clocks, 'w', 'b', 5)).toBe(5390)
    expect(clockAt(clocks, 'w', 'b', 1)).toBeNull()
  })

  it('follows a game that starts with Black', () => {
    expect(clockAt(clocks, 'b', 'b', 1)).toBe(5400)
  })
})

describe('formatSeconds', () => {
  it('shows hours only when there are some', () => {
    expect(formatSeconds(5438)).toBe('1:30:38')
    expect(formatSeconds(245.9)).toBe('4:05')
    expect(formatSeconds(-3)).toBe('0:00')
  })
})
