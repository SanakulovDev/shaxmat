// Time controls offered for games between people. Times are in seconds.
export type TimeControl = { id: string; initial: number; increment: number };

export const TIME_CONTROLS = [
  { id: '1+0', initial: 60, increment: 0 },
  { id: '3+2', initial: 180, increment: 2 },
  { id: '5+0', initial: 300, increment: 0 },
  { id: '10+0', initial: 600, increment: 0 },
  { id: '15+10', initial: 900, increment: 10 },
  { id: '30+0', initial: 1800, increment: 0 },
] as const satisfies readonly TimeControl[];

export type TimeControlId = (typeof TIME_CONTROLS)[number]['id'];

export const TIME_CONTROL_IDS = TIME_CONTROLS.map((tc) => tc.id) as [
  TimeControlId,
  ...TimeControlId[],
];

export type GameCategory = 'bullet' | 'blitz' | 'rapid' | 'classical';

export function findTimeControl(id: string): TimeControl | undefined {
  return TIME_CONTROLS.find((tc) => tc.id === id);
}

// Lichess estimates a game's length as the initial time plus 40 increments
// and sorts games into rating categories by that estimate.
export function timeControlCategory(tc: {
  initial: number;
  increment: number;
}): GameCategory {
  const estimate = tc.initial + 40 * tc.increment;
  if (estimate < 180) return 'bullet';
  if (estimate < 480) return 'blitz';
  if (estimate < 1500) return 'rapid';
  return 'classical';
}

// "3+2": minutes plus increment seconds.
export function timeControlLabel(tc: {
  initial: number;
  increment: number;
}): string {
  return `${tc.initial / 60}+${tc.increment}`;
}
