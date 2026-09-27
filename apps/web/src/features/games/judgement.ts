import type { Judgement } from '@shaxmat/chess-core'

// Lichess's colours for review marks, darkened to read on the page.
export const JUDGEMENT_STYLE: Record<Judgement, { symbol: string; text: string; dot: string }> = {
  inaccuracy: { symbol: '?!', text: 'text-[#1d6fa5]', dot: 'bg-[#56b4e9]' },
  mistake: { symbol: '?', text: 'text-[#a86400]', dot: 'bg-[#e69f00]' },
  blunder: { symbol: '??', text: 'text-[#c0392b]', dot: 'bg-[#df5353]' },
}
