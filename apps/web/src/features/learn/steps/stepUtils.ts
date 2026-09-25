import type { Step } from '@shaxmat/content'
import type { CSSProperties } from 'react'
import type { Arrow } from 'react-chessboard'

export type StepProps<T extends Step['type']> = {
  step: Extract<Step, { type: T }>
  onComplete: () => void
}

const ARROW_COLOR = 'rgba(31, 81, 53, 0.8)'
const HIGHLIGHT_STYLE: CSSProperties = {
  boxShadow: 'inset 0 0 0 4px rgba(37, 99, 235, 0.75)',
  backgroundColor: 'rgba(37, 99, 235, 0.18)',
}

export function stepArrows(arrows: [string, string][] = []): Arrow[] {
  return arrows.map(([startSquare, endSquare]) => ({
    startSquare,
    endSquare,
    color: ARROW_COLOR,
  }))
}

export function highlightStyles(squares: string[] = []) {
  return Object.fromEntries(squares.map((square) => [square, HIGHLIGHT_STYLE]))
}

// Side to move in a FEN, as a board orientation.
export function orientationOf(fen: string): 'white' | 'black' {
  return fen.split(' ')[1] === 'b' ? 'black' : 'white'
}
