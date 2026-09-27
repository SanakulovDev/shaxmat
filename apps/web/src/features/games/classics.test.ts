import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { CLASSICS } from './classics'
import { parsePgn } from './pgn'

describe('classic games', () => {
  it.each(CLASSICS.map((game) => [game.id, game] as const))('%s replays to the end', (_, game) => {
    const moveCount = game.pgn.match(/\d+\./g)!.length
    const { moves } = parsePgn(game.pgn)
    const last = Math.ceil(moves.length / 2)
    expect(last).toBe(moveCount)
    // Every token after the last move number is a legal move.
    const tokens = game.pgn
      .replace(/\{[^}]*\}/g, '')
      .split(/\s+/)
      .filter((token) => token && !/^\d+\./.test(token) && token !== game.result)
    expect(moves).toHaveLength(tokens.length)
    if (game.pgn.includes('#')) {
      expect(new Chess(moves.at(-1)!.fen).isCheckmate()).toBe(true)
    }
  })

  it('has unique ids', () => {
    expect(new Set(CLASSICS.map((game) => game.id)).size).toBe(CLASSICS.length)
  })
})
