import type { Chess } from 'chess.js';

export type Side = 'w' | 'b';

// Each side's first move is untimed, but must come within this time or the
// game is aborted. The clocks start once both sides have moved.
export const FIRST_MOVE_MS = 30_000;

// Remaining time of both sides, in milliseconds, as of `turnStartedAt`: the
// moment the side to move got the turn.
export type Clock = { white: number; black: number; turnStartedAt: number };

export type Deadline = { at: number; kind: 'abort' | 'flag' };

export function clockRuns(ply: number): boolean {
  return ply >= 2;
}

export function timeLeft(
  clock: Clock,
  side: Side,
  turn: Side,
  ply: number,
  now: number,
): number {
  const base = side === 'w' ? clock.white : clock.black;
  if (side !== turn || !clockRuns(ply)) return base;
  return Math.max(0, base - (now - clock.turnStartedAt));
}

// When the side to move runs out of time: its flag falls, or, before both
// sides have moved, the game is aborted.
export function deadline(clock: Clock, turn: Side, ply: number): Deadline {
  if (!clockRuns(ply)) {
    return { at: clock.turnStartedAt + FIRST_MOVE_MS, kind: 'abort' };
  }
  const base = turn === 'w' ? clock.white : clock.black;
  return { at: clock.turnStartedAt + base, kind: 'flag' };
}

// The clock after the side to move moves at `now`, or null when its time ran
// out first. The increment is added only once the clocks run.
export function clockAfterMove(
  clock: Clock,
  turn: Side,
  ply: number,
  incrementMs: number,
  now: number,
): Clock | null {
  if (!clockRuns(ply)) return { ...clock, turnStartedAt: now };
  const left = timeLeft(clock, turn, turn, ply, now);
  if (left <= 0) return null;
  const key = turn === 'w' ? 'white' : 'black';
  return { ...clock, [key]: left + incrementMs, turnStartedAt: now };
}

// Whether `side` still has pieces that could ever mate. A side with a lone
// king, or a king and one bishop or knight, cannot; running out of time
// against it is a draw.
export function canMate(chess: Chess, side: Side): boolean {
  let minors = 0;
  for (const row of chess.board()) {
    for (const piece of row) {
      if (!piece || piece.color !== side || piece.type === 'k') continue;
      if (piece.type === 'b' || piece.type === 'n') minors += 1;
      else return true;
    }
  }
  return minors >= 2;
}
