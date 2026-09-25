import { BOT_LEVELS, getBotLevel, MAX_BOT_LEVEL } from './levels.js';

describe('BOT_LEVELS', () => {
  it('numbers levels 1..10 in order with rising strength', () => {
    expect(BOT_LEVELS.map((l) => l.level)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    for (let i = 1; i < BOT_LEVELS.length; i += 1) {
      expect(BOT_LEVELS[i]!.elo).toBeGreaterThan(BOT_LEVELS[i - 1]!.elo);
    }
    expect(MAX_BOT_LEVEL).toBe(10);
  });

  it('keeps UCI_Elo inside the range Stockfish accepts', () => {
    for (const { strategy } of BOT_LEVELS) {
      if (strategy.kind === 'elo') {
        expect(strategy.elo).toBeGreaterThanOrEqual(1320);
        expect(strategy.elo).toBeLessThanOrEqual(3190);
      }
    }
  });

  it('throws for an unknown level', () => {
    expect(getBotLevel(3).level).toBe(3);
    expect(() => getBotLevel(11)).toThrow(RangeError);
  });
});
