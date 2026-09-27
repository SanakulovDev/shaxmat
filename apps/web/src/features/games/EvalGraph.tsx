import { type Judgement, winPercent } from '@shaxmat/chess-core'
import type { MouseEvent } from 'react'
import { JUDGEMENT_STYLE } from './judgement'

const WIDTH = 1000
const HEIGHT = 100

// White's winning chances over the game: the light area is White's share.
// A click moves to that point of the game.
export function EvalGraph({
  scores,
  judgements,
  current,
  onSelect,
  label,
}: {
  // White's score after each number of moves; index 0 is the start.
  scores: readonly (number | undefined)[]
  // One per move.
  judgements: readonly (Judgement | null)[]
  current: number
  onSelect: (ply: number) => void
  label: string
}) {
  const total = Math.max(1, scores.length - 1)
  const x = (ply: number) => (ply / total) * WIDTH
  const y = (cp: number) => HEIGHT - (winPercent(cp) / 100) * HEIGHT

  // Scores arrive first to last; the area runs as far as they go.
  const known: string[] = []
  for (const [ply, cp] of scores.entries()) {
    if (cp === undefined) break
    known.push(`${x(ply).toFixed(1)},${y(cp).toFixed(1)}`)
  }
  const lastX = x(known.length - 1).toFixed(1)
  const area =
    known.length > 1 ? `M0,${HEIGHT} L${known.join(' L')} L${lastX},${HEIGHT} Z` : ''

  function select(event: MouseEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    onSelect(Math.round(((event.clientX - box.left) / box.width) * total))
  }

  return (
    <div
      role="img"
      aria-label={label}
      onClick={select}
      className="relative h-20 cursor-pointer overflow-hidden rounded-lg bg-[#3b3833] ring-1 ring-line sm:h-24"
    >
      <svg
        aria-hidden
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
      >
        {area && <path d={area} fill="#f6f3ec" />}
        <line
          x1="0"
          x2={WIDTH}
          y1={HEIGHT / 2}
          y2={HEIGHT / 2}
          stroke="#e0a526"
          strokeOpacity="0.6"
          strokeDasharray="6 6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {judgements.map((judgement, index) => {
        const cp = scores[index + 1]
        if (!judgement || judgement === 'inaccuracy' || cp === undefined) return null
        return (
          <span
            key={index}
            aria-hidden
            className={`absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white ${JUDGEMENT_STYLE[judgement].dot}`}
            style={{ left: `${(x(index + 1) / WIDTH) * 100}%`, top: `${y(cp)}%` }}
          />
        )
      })}
      <span
        aria-hidden
        className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-accent"
        style={{ left: `${(current / total) * 100}%` }}
      />
    </div>
  )
}
