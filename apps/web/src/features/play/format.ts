import { timeControlCategory, timeControlLabel } from '@shaxmat/chess-core'
import type { TFunction } from 'i18next'

type TimeControl = { initial: number; increment: number }

// "3+2 · Blitz · Rated"
export function challengeSummary(t: TFunction, tc: TimeControl, rated: boolean) {
  return [
    timeControlLabel(tc),
    t(`play.category.${timeControlCategory(tc)}`),
    t(rated ? 'play.ratedShort' : 'play.casual'),
  ].join(' · ')
}

// Minutes and seconds; tenths below ten seconds, when they matter.
export function formatClock(ms: number): string {
  const safe = Math.max(0, ms)
  const minutes = Math.floor(safe / 60_000)
  const seconds = Math.floor((safe % 60_000) / 1000)
  const clock = `${minutes}:${String(seconds).padStart(2, '0')}`
  if (safe >= 10_000) return clock
  return `${clock}.${Math.floor((safe % 1000) / 100)}`
}

// "+8", "−5" or "±0" (with a real minus sign).
export function formatDiff(diff: number): string {
  if (diff > 0) return `+${diff}`
  if (diff < 0) return `−${-diff}`
  return '±0'
}
