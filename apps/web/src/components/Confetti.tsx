import type { CSSProperties } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'

const COLORS = ['#e0a526', '#1f5135', '#1e4f8a', '#df5353', '#f2c14e', '#5f7f44']
const COUNT = 32

// Spread evenly by the golden angle, with fixed variety in distance, size
// and spin, so the burst looks random but renders the same every time.
const PIECES = Array.from({ length: COUNT }, (_, i) => {
  const angle = i * 137.5 * (Math.PI / 180)
  const distance = 6 + ((i * 7) % 9)
  return {
    dx: `${(Math.cos(angle) * distance).toFixed(2)}rem`,
    // Thrown a little upwards overall, before falling.
    dy: `${(Math.sin(angle) * distance * 0.8 - 3).toFixed(2)}rem`,
    r: `${((i * 97) % 720) - 360}deg`,
    color: COLORS[i % COLORS.length]!,
    wide: i % 3 === 0,
    delay: `${(i % 5) * 30}ms`,
  }
})

// A burst of confetti from the middle of the nearest positioned parent,
// for a solved puzzle, a finished lesson or a won game.
export function Confetti() {
  const reduced = useReducedMotion()
  if (reduced) return null
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
      {PIECES.map((piece, index) => (
        <span
          key={index}
          className={`absolute left-1/2 top-1/2 animate-confetti rounded-[2px] ${
            piece.wide ? 'h-2 w-3.5' : 'h-3 w-2'
          }`}
          style={
            {
              '--dx': piece.dx,
              '--dy': piece.dy,
              '--r': piece.r,
              backgroundColor: piece.color,
              animationDelay: piece.delay,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
