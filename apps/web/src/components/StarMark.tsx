// The 8-pointed girih star from Central Asian tilework: two overlapping
// squares. It marks progress across the app.
export const STAR_POINTS =
  '12,0 15.51,3.52 20.49,3.52 20.48,8.49 24,12 20.48,15.51 20.49,20.49 15.51,20.48 12,24 8.49,20.48 3.52,20.49 3.52,15.51 0,12 3.52,8.49 3.52,3.52 8.49,3.52'

export type StarState = 'done' | 'current' | 'todo'

const STYLES: Record<StarState, { fill: string; stroke: string }> = {
  done: { fill: 'var(--color-accent)', stroke: 'var(--color-ink)' },
  current: { fill: 'var(--color-surface)', stroke: 'var(--color-lapis)' },
  todo: { fill: 'var(--color-surface)', stroke: 'var(--color-line)' },
}

export function StarMark({
  state,
  className = 'h-8 w-8',
  children,
}: {
  state: StarState
  className?: string
  // Text centred on the star, e.g. a lesson number.
  children?: React.ReactNode
}) {
  const { fill, stroke } = STYLES[state]
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center ${className}`}>
      <svg viewBox="-1.5 -1.5 27 27" className="absolute inset-0 h-full w-full" aria-hidden>
        <polygon points={STAR_POINTS} fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      {children !== undefined && (
        <span className="relative text-xs font-bold text-ink">{children}</span>
      )}
    </span>
  )
}
