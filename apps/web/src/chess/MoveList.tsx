import type { Move } from 'chess.js'
import { useEffect, useRef } from 'react'

// Moves in pairs: "1. e4 e5", "2. Nf3 ...".
export function MoveList({ moves, label }: { moves: Move[]; label: string }) {
  const endRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [moves.length])

  const rows: { number: number; white?: string; black?: string }[] = []
  for (const move of moves) {
    const number = Number(move.before.split(' ')[5])
    if (move.color === 'w' || rows.length === 0) {
      rows.push({ number, [move.color === 'w' ? 'white' : 'black']: move.san })
    } else {
      rows[rows.length - 1]!.black = move.san
    }
  }

  return (
    <ol
      aria-label={label}
      className="max-h-64 overflow-y-auto rounded-lg border border-line bg-surface text-sm"
    >
      {rows.map((row) => (
        <li
          key={row.number}
          className="grid grid-cols-[3rem_1fr_1fr] px-3 py-1 odd:bg-paper"
        >
          <span className="text-muted">{row.number}.</span>
          <span className="font-medium">{row.white ?? '…'}</span>
          <span className="font-medium">{row.black ?? ''}</span>
        </li>
      ))}
      <li ref={endRef} aria-hidden />
    </ol>
  )
}
