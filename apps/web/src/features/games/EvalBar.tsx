import { winPercent } from '@shaxmat/chess-core'
import { formatEval, type PositionEval } from './analysis'

// White's share of the bar is its chance to win, so the bar moves most
// where the game is balanced. White's end follows the board's white side.
export function EvalBar({
  evaluation,
  orientation,
  label,
}: {
  evaluation: Pick<PositionEval, 'cp' | 'mate'> | null
  orientation: 'white' | 'black'
  label: string
}) {
  const white = evaluation ? winPercent(evaluation.cp) : 50
  const whiteAhead = white >= 50
  const whiteAtBottom = orientation === 'white'
  // The number sits at the end of the side that is ahead.
  const textAtBottom = whiteAhead === whiteAtBottom

  return (
    <div
      role="img"
      aria-label={label}
      className="relative w-4 shrink-0 overflow-hidden rounded-md bg-[#3b3833] shadow-inner sm:w-7"
    >
      <div
        className={`absolute inset-x-0 bg-[#f6f3ec] transition-[height] duration-700 ease-out motion-reduce:transition-none ${
          whiteAtBottom ? 'bottom-0' : 'top-0'
        }`}
        style={{ height: `${white}%` }}
      />
      <div aria-hidden className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-accent/80" />
      {evaluation && (
        <span
          aria-hidden
          className={`absolute inset-x-0 hidden text-center text-[9px] font-bold leading-none tabular-nums sm:block ${
            textAtBottom ? 'bottom-1.5' : 'top-1.5'
          } ${whiteAhead ? 'text-ink' : 'text-white'}`}
        >
          {formatEval(evaluation).replace(/^[+−]/, '')}
        </span>
      )}
    </div>
  )
}
