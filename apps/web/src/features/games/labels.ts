import type { Side } from '@shaxmat/chess-core'
import type { TFunction } from 'i18next'

// Lichess names most rounds "Round 7"; those are shown in the page's
// language, others as the organisers wrote them.
export function roundName(t: TFunction, name: string): string {
  const match = /^Round (\d+)$/.exec(name)
  return match ? t('games.round', { number: Number(match[1]) }) : name
}

// "46th Olympiad | Open | Matches 1-12" is an event and its section.
export function splitTourName(name: string): { event: string; section: string | null } {
  const [event = name, ...rest] = name.split(' | ')
  return { event, section: rest.length > 0 ? rest.join(' · ') : null }
}

// A side's score from a result: "1", "0", "½", or null while playing.
export function scoreOf(result: string | undefined, side: Side): string | null {
  if (result === '1-0') return side === 'w' ? '1' : '0'
  if (result === '0-1') return side === 'w' ? '0' : '1'
  if (result === '½-½' || result === '1/2-1/2') return '½'
  return null
}

// Result text for people: "1–0", "0–1" or "½–½".
export function formatResult(result: string): string {
  return result === '1/2-1/2' || result === '½-½' ? '½–½' : result.replace('-', '–')
}
