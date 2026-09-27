import type { Move } from 'chess.js'
import { useEffect, useRef } from 'react'

type Cell = { san: string; ply: number }

// A mark after a move, like "??" for a blunder. `label` is read out instead
// of the symbol.
export type MoveNote = { symbol: string; label: string; className: string }

// Moves in pairs: "1. e4 e5", "2. Nf3 ...". With `onSelect`, each move is a
// button that shows the position after it; `current` is the shown ply.
// `notes[i]` marks move i + 1.
export function MoveList({
  moves,
  label,
  current,
  onSelect,
  notes,
}: {
  moves: Move[]
  label: string
  current?: number
  onSelect?: (ply: number) => void
  notes?: readonly (MoveNote | null | undefined)[]
}) {
  const listRef = useRef<HTMLOListElement>(null)

  // Keeps the shown move (or the newest one) in view. Only the list
  // scrolls: scrollIntoView would also scroll the page to it.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const shown = list.querySelector<HTMLElement>('[aria-current="step"]')
    if (!shown) {
      list.scrollTop = list.scrollHeight
      return
    }
    const top = shown.offsetTop
    const bottom = top + shown.offsetHeight
    if (top < list.scrollTop) list.scrollTop = top
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight
  }, [moves.length, current])

  const rows: { number: number; white?: Cell; black?: Cell }[] = []
  for (const [index, move] of moves.entries()) {
    const number = Number(move.before.split(' ')[5])
    const cell = { san: move.san, ply: index + 1 }
    if (move.color === 'w' || rows.length === 0) {
      rows.push({ number, [move.color === 'w' ? 'white' : 'black']: cell })
    } else {
      rows[rows.length - 1]!.black = cell
    }
  }

  function renderNote(ply: number) {
    const note = notes?.[ply - 1]
    if (!note) return null
    return (
      <>
        <span aria-hidden className={`ml-0.5 font-bold ${note.className}`}>
          {note.symbol}
        </span>
        <span className="sr-only"> ({note.label})</span>
      </>
    )
  }

  function renderCell(cell: Cell | undefined, placeholder: string) {
    if (!cell) return <span className="font-medium">{placeholder}</span>
    if (!onSelect) {
      return (
        <span className="font-medium">
          {cell.san}
          {renderNote(cell.ply)}
        </span>
      )
    }
    const selected = cell.ply === current
    return (
      <button
        type="button"
        onClick={() => onSelect(cell.ply)}
        aria-current={selected ? 'step' : undefined}
        className={`rounded px-1 text-left font-medium ${
          selected ? 'bg-board-dark text-white' : 'hover:bg-line'
        }`}
      >
        {cell.san}
        {renderNote(cell.ply)}
      </button>
    )
  }

  return (
    <ol
      ref={listRef}
      aria-label={label}
      className="relative max-h-64 overflow-y-auto rounded-lg border border-line bg-surface text-sm"
    >
      {rows.map((row) => (
        <li
          key={row.number}
          className="grid grid-cols-[3rem_1fr_1fr] items-center px-3 py-1 odd:bg-paper"
        >
          <span className="text-muted">{row.number}.</span>
          <span>{renderCell(row.white, '…')}</span>
          <span>{renderCell(row.black, '')}</span>
        </li>
      ))}
    </ol>
  )
}
