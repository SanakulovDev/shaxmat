import { INITIAL_RATING, updateRating } from './glicko2.js';

describe('updateRating', () => {
  it('matches the worked example in Glickman\'s paper', () => {
    const result = updateRating({ rating: 1500, rd: 200, volatility: 0.06 }, [
      { opponent: { rating: 1400, rd: 30 }, score: 1 },
      { opponent: { rating: 1550, rd: 100 }, score: 0 },
      { opponent: { rating: 1700, rd: 300 }, score: 0 },
    ]);
    expect(result.rating).toBeCloseTo(1464.06, 1);
    expect(result.rd).toBeCloseTo(151.52, 1);
    expect(result.volatility).toBeCloseTo(0.05999, 4);
  });

  it('only widens the deviation when there are no results', () => {
    const player = { rating: 1500, rd: 200, volatility: 0.06 };
    const result = updateRating(player, []);
    expect(result.rating).toBe(1500);
    expect(result.rd).toBeGreaterThan(200);
  });

  it('raises the rating after a win and lowers it after a loss', () => {
    const opponent = { rating: 1000, rd: 80 };
    const won = updateRating(INITIAL_RATING, [{ opponent, score: 1 }]);
    const lost = updateRating(INITIAL_RATING, [{ opponent, score: 0 }]);
    expect(won.rating).toBeGreaterThan(INITIAL_RATING.rating);
    expect(lost.rating).toBeLessThan(INITIAL_RATING.rating);
  });

  it('keeps the deviation within bounds', () => {
    let player = INITIAL_RATING;
    for (let i = 0; i < 500; i += 1) {
      player = updateRating(player, [
        { opponent: { rating: player.rating, rd: 60 }, score: 0.5 },
      ]);
    }
    expect(player.rd).toBeGreaterThanOrEqual(45);
  });
});
