import { useEffect, useState } from 'react'
import { useReducedMotion } from '../../lib/useReducedMotion'

export type Playback = {
  // Moves played so far.
  ply: number
  // Grows each time the moves start over.
  round: number
}

// Plays `length` moves one by one, holds the last position, then starts
// over. With reduced motion it shows the last position and stays there.
export function usePlayback(
  length: number,
  {
    playing = true,
    startDelay = 900,
    pace = 1000,
    hold = 3000,
  }: { playing?: boolean; startDelay?: number; pace?: number; hold?: number } = {},
): Playback {
  const reduced = useReducedMotion()
  const [state, setState] = useState<Playback>({ ply: 0, round: 0 })

  useEffect(() => {
    if (!playing || reduced) return
    const delay = state.ply >= length ? hold : state.ply === 0 ? startDelay : pace
    const timer = setTimeout(() => {
      setState(({ ply, round }) =>
        ply >= length ? { ply: 0, round: round + 1 } : { ply: ply + 1, round },
      )
    }, delay)
    return () => clearTimeout(timer)
  }, [state, length, playing, reduced, startDelay, pace, hold])

  return reduced ? { ply: length, round: 0 } : state
}
