import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { findTypedMove, moveFacts } from './moveText'

describe('findTypedMove', () => {
  const start = new Chess()

  it('reads SAN and coordinates', () => {
    expect(findTypedMove(start, 'e4')?.lan).toBe('e2e4')
    expect(findTypedMove(start, 'Nf3')?.lan).toBe('g1f3')
    expect(findTypedMove(start, 'nf3')?.lan).toBe('g1f3')
    expect(findTypedMove(start, 'e2e4')?.lan).toBe('e2e4')
    expect(findTypedMove(start, 'e2-e4')?.lan).toBe('e2e4')
  })

  it('reads castling with letters or zeros', () => {
    const chess = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1')
    expect(findTypedMove(chess, 'O-O')?.lan).toBe('e1g1')
    expect(findTypedMove(chess, '0-0-0')?.lan).toBe('e1c1')
  })

  it('reads captures and promotions', () => {
    const chess = new Chess('4k3/1P6/8/3p4/4P3/8/8/4K3 w - - 0 1')
    expect(findTypedMove(chess, 'exd5')?.lan).toBe('e4d5')
    expect(findTypedMove(chess, 'b8=N')?.lan).toBe('b7b8n')
    expect(findTypedMove(chess, 'b7b8r')?.lan).toBe('b7b8r')
    expect(findTypedMove(chess, 'b7b8')?.promotion).toBe('q')
  })

  it('returns null for illegal or unclear text', () => {
    expect(findTypedMove(start, 'e5')).toBeNull()
    expect(findTypedMove(start, '')).toBeNull()
    expect(findTypedMove(start, 'salom')).toBeNull()
  })
})

describe('moveFacts', () => {
  it('reads the mover, the squares and mate', () => {
    const chess = new Chess()
    for (const move of ['e4', 'e5', 'Qh5', 'Nc6', 'Bc4', 'Nf6', 'Qxf7#']) {
      chess.move(move)
    }
    expect(moveFacts(chess, { from: 'h5', to: 'f7' })).toEqual({
      side: 'w',
      piece: 'q',
      from: 'h5',
      to: 'f7',
      check: false,
      mate: true,
    })
  })
})
