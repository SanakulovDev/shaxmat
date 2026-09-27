import { useEffect } from 'react'
import { type BoardMark, MiniBoard } from '../../components/MiniBoard'
import { useInView } from '../../lib/useInView'
import { usePlayback } from './usePlayback'

// A MiniBoard that replays scripted moves while it is on screen.
export function LoopingBoard({
  fen,
  moves,
  marks = [],
  keepMarks = true,
  coordinates = false,
  label,
  className,
  pace = 1100,
  hold = 2600,
  onRound,
}: {
  fen: string
  moves: readonly string[]
  marks?: readonly BoardMark[]
  // False hides the marks once the first move is played.
  keepMarks?: boolean
  coordinates?: boolean
  label?: string
  className?: string
  pace?: number
  hold?: number
  // Called each time the moves have played through once. Keep it stable.
  onRound?: () => void
}) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const { ply, round } = usePlayback(moves.length, { playing: inView, pace, hold })

  useEffect(() => {
    if (round > 0) onRound?.()
  }, [round, onRound])

  return (
    <div ref={ref} className={className}>
      <MiniBoard
        fen={fen}
        moves={moves}
        ply={ply}
        round={round}
        marks={keepMarks || ply === 0 ? marks : []}
        coordinates={coordinates}
        label={label}
        className="w-full rounded-xl shadow-lg ring-1 ring-black/10"
      />
    </div>
  )
}
