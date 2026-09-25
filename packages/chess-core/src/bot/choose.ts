export type Random = () => number;

// A move suggested by the engine, scored from the side to move's view.
export type Candidate = { move: string; scoreCp: number };

const MATE_SCORE_CP = 100_000;

// Converts a UCI "score mate N" into centipawns so mates sort above any
// material score. Faster mates score higher; being mated scores lowest.
export function mateToCp(mateIn: number): number {
  return mateIn > 0
    ? MATE_SCORE_CP - mateIn * 100
    : -MATE_SCORE_CP - mateIn * 100;
}

export function chooseCandidate(
  candidates: readonly Candidate[],
  params: { temperatureCp: number; blunderChance: number },
  random: Random = Math.random,
): string {
  if (candidates.length === 0) throw new Error('No candidate moves');

  if (random() < params.blunderChance) {
    return pick(candidates, random).move;
  }

  const best = Math.max(...candidates.map((c) => c.scoreCp));
  const weights = candidates.map((c) =>
    Math.exp((c.scoreCp - best) / params.temperatureCp),
  );
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let threshold = random() * total;
  for (const [index, weight] of weights.entries()) {
    threshold -= weight;
    if (threshold < 0) return candidates[index]!.move;
  }
  return candidates[candidates.length - 1]!.move;
}

export type LegalMove = { move: string; isCapture: boolean };

export function chooseRandomMove(
  moves: readonly LegalMove[],
  capturePreference: number,
  random: Random = Math.random,
): string {
  if (moves.length === 0) throw new Error('No legal moves');
  const captures = moves.filter((m) => m.isCapture);
  if (captures.length > 0 && random() < capturePreference) {
    return pick(captures, random).move;
  }
  return pick(moves, random).move;
}

function pick<T>(items: readonly T[], random: Random): T {
  return items[Math.floor(random() * items.length)]!;
}

// Deterministic generator for tests and reproducible bot games (mulberry32).
export function seededRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}
