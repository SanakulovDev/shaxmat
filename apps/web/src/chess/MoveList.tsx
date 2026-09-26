import type { Move } from 'chess.js'
import { useEffect, useRef } from 'react'

type Cell = { san: string; ply: number }

// Moves in pairs: "1. e4 e5", "2. Nf3 ...". With `onSelect`, each move is a
// button that shows the position after it; `current` is the shown ply.
export function MoveList({
  moves,
  label,
  current,
  onSelect,
}: {
  moves: Move[]
  label: string
  current?: number
  onSelect?: (ply: number) => void
}) {
  const endRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [moves.length])

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

  function renderCell(cell: Cell | undefined, placeholder: string) {
    if (!cell) return <span className="font-medium">{placeholder}</span>
    if (!onSelect) return <span className="font-medium">{cell.san}</span>
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
      </button>
    )
  }

  return (
    <ol
      aria-label={label}
      className="max-h-64 overflow-y-auto rounded-lg border border-line bg-surface text-sm"
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
      <li ref={endRef} aria-hidden />
    </ol>
  )
}
