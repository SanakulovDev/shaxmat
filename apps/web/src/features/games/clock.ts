import { useNow } from '../../lib/useNow'

// Seconds left on a clock that showed `seconds` at `since` (ms) and has been
// running ever since.
export function clockLeft(seconds: number, since: number, now: number): number {
  return Math.max(0, seconds - Math.max(0, now - since) / 1000)
}

// Whether two FENs show the same position with the same side to move.
export function samePosition(a: string, b: string): boolean {
  return a.split(' ').slice(0, 2).join(' ') === b.split(' ').slice(0, 2).join(' ')
}

// A clock in whole seconds that counts down each second while `running`.
// Without `since` nobody knows when the move began, so it stays still.
export function useRunningClock(
  seconds: number | null,
  since: number | undefined,
  running: boolean,
): number | null {
  const ticking = running && seconds !== null && since !== undefined
  const now = useNow(ticking)
  if (seconds === null) return null
  return Math.ceil(ticking ? clockLeft(seconds, since, now) : seconds)
}
