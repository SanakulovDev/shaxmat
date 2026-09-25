import { mateToCp } from '@shaxmat/chess-core'
import { describe, expect, it } from 'vitest'
import { parseInfoLine } from './engine'

describe('parseInfoLine', () => {
  it('reads a centipawn score with multipv', () => {
    const line =
      'info depth 10 seldepth 14 multipv 2 score cp -35 nodes 12000 nps 400000 time 30 pv d7d5 e4d5 d8d5'
    expect(parseInfoLine(line)).toEqual({
      multipv: 2,
      move: 'd7d5',
      scoreCp: -35,
    })
  })

  it('reads a mate score and defaults multipv to 1', () => {
    const line = 'info depth 5 score mate 2 nodes 900 pv h5f7 e8e7 d1d8'
    expect(parseInfoLine(line)).toEqual({
      multipv: 1,
      move: 'h5f7',
      scoreCp: mateToCp(2),
    })
  })

  it('ignores lines without a principal variation', () => {
    expect(parseInfoLine('info string NNUE evaluation enabled')).toBeNull()
    expect(parseInfoLine('bestmove e2e4 ponder e7e5')).toBeNull()
  })
})
