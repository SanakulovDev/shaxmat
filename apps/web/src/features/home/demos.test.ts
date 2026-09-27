import { localizedContent } from '@shaxmat/content'
import { Chess, type Square } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { parseFen, play, reach, squareIndex } from '../../chess/scripted'
import { OPERA_GAME, PIECE_DEMOS, SPECIAL_MOVES } from './demos'

// The FEN board field of our model's position after the moves.
function placement(fen: string, moves: readonly string[]): string {
  const board = Array<string>(64).fill('')
  for (const piece of play(parseFen(fen), moves)) {
    if (!piece.captured) board[piece.square] = piece.code
  }
  const rows: string[] = []
  for (let rank = 0; rank < 8; rank++) {
    let row = ''
    let empty = 0
    for (const code of board.slice(rank * 8, rank * 8 + 8)) {
      if (code) {
        row += (empty || '') + code
        empty = 0
      } else {
        empty += 1
      }
    }
    rows.push(row + (empty || ''))
  }
  return rows.join('/')
}

describe('Opera game', () => {
  it('matches its SAN, ends in mate and agrees with our board model', () => {
    const chess = new Chess(OPERA_GAME.fen)
    OPERA_GAME.san.forEach((san, index) => {
      const move = chess.move(san)
      expect(`${move.from}${move.to}${move.promotion ?? ''}`).toBe(OPERA_GAME.moves[index])
    })
    expect(chess.isCheckmate()).toBe(true)
    expect(placement(OPERA_GAME.fen, OPERA_GAME.moves)).toBe(chess.fen().split(' ')[0])
  })
})

describe('special moves', () => {
  for (const demo of SPECIAL_MOVES) {
    it(`${demo.id} is legal and agrees with our board model`, () => {
      const chess = new Chess(demo.fen)
      for (const move of demo.moves) chess.move(move)
      expect(placement(demo.fen, demo.moves)).toBe(chess.fen().split(' ')[0])
    })
  }
})

describe('piece demos', () => {
  for (const demo of PIECE_DEMOS) {
    it(`${demo.kind}: marks and moves follow the rules`, () => {
      const options = { skipValidation: true }
      const legal = new Chess(demo.fen, options)
        .moves({ square: demo.from as Square, verbose: true })
        .map((move) => squareIndex(move.to))
      const marked = reach(parseFen(demo.fen), squareIndex(demo.from)).map((r) => r.square)
      expect(marked.sort()).toEqual(legal.sort())

      // Only one side moves, so give the turn to whoever moves next.
      let fen = demo.fen
      for (const move of demo.moves) {
        const from = move.slice(0, 2) as Square
        const side = new Chess(fen, options).get(from)?.color
        expect(side, move).toBeDefined()
        const position = new Chess(fen.replace(/ [wb] /, ` ${side} `), options)
        position.move({ from, to: move.slice(2, 4) })
        fen = position.fen()
      }
      expect(fen.split(' ')[0]).toBe(placement(demo.fen, demo.moves))
    })
  }

  it('link to lessons that exist', () => {
    const slugs = new Set(localizedContent('uz').lessons.map((lesson) => lesson.slug))
    for (const { lesson } of [...PIECE_DEMOS, ...SPECIAL_MOVES]) {
      expect(slugs).toContain(lesson)
    }
  })
})
