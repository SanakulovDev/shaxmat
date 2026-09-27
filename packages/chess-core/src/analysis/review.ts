import type { Side } from '../play/clock.js';

// Game review from engine scores, using the formulas Lichess publishes.
// Every score here is in centipawns from White's point of view; a mate is
// any score beyond ±1000, which the formulas treat as a won game.

export type Judgement = 'inaccuracy' | 'mistake' | 'blunder';

export type Advantage = {
  // null when the position is about equal.
  side: Side | null;
  level: 'equal' | 'slight' | 'clear' | 'winning';
};

export type SideSummary = {
  // Mean move accuracy, 0-100, or null before any move is scored.
  accuracy: number | null;
  inaccuracies: number;
  mistakes: number;
  blunders: number;
};

export type Review = {
  // One entry per move; null for a good move or a move not scored yet.
  judgements: (Judgement | null)[];
  white: SideSummary;
  black: SideSummary;
};

const CAP_CP = 1000;

// Expected result for White between -1 (lost) and 1 (won).
export function winningChances(cp: number): number {
  const capped = Math.max(-CAP_CP, Math.min(CAP_CP, cp));
  return 2 / (1 + Math.exp(-0.00368208 * capped)) - 1;
}

// White's chance to win, 0-100. The evaluation bar and graph use it, so a
// pawn up matters more in a level game than in a won one.
export function winPercent(cp: number): number {
  return 50 + 50 * winningChances(cp);
}

// How much the mover's winning chances dropped: 0.1 is an inaccuracy, 0.2 a
// mistake and 0.3 a blunder.
export function judgeMove(before: number, after: number, mover: Side): Judgement | null {
  const sign = mover === 'w' ? 1 : -1;
  const drop = (winningChances(before) - winningChances(after)) * sign;
  if (drop >= 0.3) return 'blunder';
  if (drop >= 0.2) return 'mistake';
  if (drop >= 0.1) return 'inaccuracy';
  return null;
}

// 100 for a move that keeps the mover's chances, falling towards 0 as the
// win percentage drops.
export function moveAccuracy(before: number, after: number, mover: Side): number {
  const sign = mover === 'w' ? 1 : -1;
  const drop = Math.max(0, (winPercent(before) - winPercent(after)) * sign);
  const accuracy = 103.1668 * Math.exp(-0.04354 * drop) - 3.1669;
  return Math.max(0, Math.min(100, accuracy));
}

export function advantage(cp: number): Advantage {
  const size = Math.abs(cp);
  const side: Side = cp > 0 ? 'w' : 'b';
  if (size < 35) return { side: null, level: 'equal' };
  if (size < 100) return { side, level: 'slight' };
  if (size < 250) return { side, level: 'clear' };
  return { side, level: 'winning' };
}

// Scores the moves of a game. `scores[i]` is the position after i moves
// (scores[0] is the start); missing scores leave their moves unjudged.
export function reviewGame(
  scores: readonly (number | undefined)[],
  firstMover: Side = 'w',
): Review {
  const empty = (): SideSummary & { total: number; counted: number } => ({
    accuracy: null,
    inaccuracies: 0,
    mistakes: 0,
    blunders: 0,
    total: 0,
    counted: 0,
  });
  const sides = { w: empty(), b: empty() };
  const judgements: (Judgement | null)[] = [];

  for (let ply = 1; ply < scores.length; ply += 1) {
    const before = scores[ply - 1];
    const after = scores[ply];
    const mover: Side = (ply % 2 === 1) === (firstMover === 'w') ? 'w' : 'b';
    if (before === undefined || after === undefined) {
      judgements.push(null);
      continue;
    }
    const judgement = judgeMove(before, after, mover);
    judgements.push(judgement);
    const side = sides[mover];
    side.total += moveAccuracy(before, after, mover);
    side.counted += 1;
    if (judgement === 'inaccuracy') side.inaccuracies += 1;
    if (judgement === 'mistake') side.mistakes += 1;
    if (judgement === 'blunder') side.blunders += 1;
  }

  const summary = ({ total, counted, ...rest }: ReturnType<typeof empty>) => ({
    ...rest,
    accuracy: counted > 0 ? total / counted : null,
  });
  return { judgements, white: summary(sides.w), black: summary(sides.b) };
}
