// Glicko-2 rating system, following Glickman's paper:
// http://www.glicko.net/glicko/glicko2.pdf

export type Rating = { rating: number; rd: number; volatility: number };

export type RatedResult = {
  opponent: Pick<Rating, 'rating' | 'rd'>;
  // 1 = win, 0.5 = draw, 0 = loss.
  score: 0 | 0.5 | 1;
};

// The platform targets beginners, so new players start below the usual 1500.
export const INITIAL_RATING: Rating = {
  rating: 1000,
  rd: 350,
  volatility: 0.06,
};

const SCALE = 173.7178;
const BASE = 1500;
const DEFAULT_TAU = 0.5;
const CONVERGENCE = 0.000001;
const MIN_RD = 45;
const MAX_RD = 350;

function g(phi: number): number {
  return 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI));
}

function expectedScore(mu: number, muOpponent: number, phiOpponent: number) {
  return 1 / (1 + Math.exp(-g(phiOpponent) * (mu - muOpponent)));
}

// Rates one period. With no results, only the deviation grows.
export function updateRating(
  player: Rating,
  results: readonly RatedResult[],
  tau = DEFAULT_TAU,
): Rating {
  const mu = (player.rating - BASE) / SCALE;
  const phi = player.rd / SCALE;
  const sigma = player.volatility;

  if (results.length === 0) {
    const rd = Math.sqrt(phi * phi + sigma * sigma) * SCALE;
    return { ...player, rd: clamp(rd, MIN_RD, MAX_RD) };
  }

  const games = results.map(({ opponent, score }) => {
    const muJ = (opponent.rating - BASE) / SCALE;
    const phiJ = opponent.rd / SCALE;
    return { g: g(phiJ), e: expectedScore(mu, muJ, phiJ), score };
  });

  const v =
    1 / games.reduce((sum, game) => sum + game.g ** 2 * game.e * (1 - game.e), 0);
  const delta =
    v * games.reduce((sum, game) => sum + game.g * (game.score - game.e), 0);

  const newSigma = newVolatility(phi, sigma, v, delta, tau);
  const phiStar = Math.sqrt(phi * phi + newSigma * newSigma);
  const newPhi = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
  const newMu =
    mu +
    newPhi * newPhi *
      games.reduce((sum, game) => sum + game.g * (game.score - game.e), 0);

  return {
    rating: newMu * SCALE + BASE,
    rd: clamp(newPhi * SCALE, MIN_RD, MAX_RD),
    volatility: newSigma,
  };
}

// Step 5 of the paper: the Illinois algorithm.
function newVolatility(
  phi: number,
  sigma: number,
  v: number,
  delta: number,
  tau: number,
): number {
  const a = Math.log(sigma * sigma);
  const f = (x: number) => {
    const ex = Math.exp(x);
    const denominator = phi * phi + v + ex;
    return (
      (ex * (delta * delta - phi * phi - v - ex)) /
        (2 * denominator * denominator) -
      (x - a) / (tau * tau)
    );
  };

  let lower = a;
  let upper: number;
  if (delta * delta > phi * phi + v) {
    upper = Math.log(delta * delta - phi * phi - v);
  } else {
    let k = 1;
    while (f(a - k * tau) < 0) k += 1;
    upper = a - k * tau;
  }

  let fLower = f(lower);
  let fUpper = f(upper);
  while (Math.abs(upper - lower) > CONVERGENCE) {
    const c = lower + ((lower - upper) * fLower) / (fUpper - fLower);
    const fC = f(c);
    if (fC * fUpper <= 0) {
      lower = upper;
      fLower = fUpper;
    } else {
      fLower /= 2;
    }
    upper = c;
    fUpper = fC;
  }
  return Math.exp(lower / 2);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
