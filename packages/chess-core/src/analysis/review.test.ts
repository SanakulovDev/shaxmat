import { describe, expect, it } from 'vitest';
import {
  advantage,
  judgeMove,
  moveAccuracy,
  reviewGame,
  winPercent,
  winningChances,
} from './review.js';

describe('winningChances', () => {
  it('is even at zero and symmetric', () => {
    expect(winningChances(0)).toBe(0);
    expect(winningChances(300)).toBeCloseTo(-winningChances(-300));
  });

  it('caps huge scores such as mates', () => {
    expect(winningChances(100_000)).toBe(winningChances(1000));
    expect(winPercent(100_000)).toBeGreaterThan(95);
  });
});

describe('judgeMove', () => {
  it('grades a drop in the mover’s chances', () => {
    expect(judgeMove(0, -20, 'w')).toBeNull();
    expect(judgeMove(0, -60, 'w')).toBe('inaccuracy');
    expect(judgeMove(0, -120, 'w')).toBe('mistake');
    expect(judgeMove(0, -300, 'w')).toBe('blunder');
  });

  it('reads the drop from Black’s side for Black’s moves', () => {
    expect(judgeMove(0, 300, 'b')).toBe('blunder');
    expect(judgeMove(0, -300, 'b')).toBeNull();
  });

  it('forgives moves in a game that stays lost', () => {
    expect(judgeMove(-900, -1500, 'w')).toBeNull();
  });
});

describe('moveAccuracy', () => {
  it('is 100 for a move that loses nothing', () => {
    expect(moveAccuracy(50, 50, 'w')).toBeCloseTo(100);
    expect(moveAccuracy(50, 80, 'w')).toBeCloseTo(100);
  });

  it('falls with the size of the drop', () => {
    expect(moveAccuracy(0, -100, 'w')).toBeGreaterThan(moveAccuracy(0, -400, 'w'));
    expect(moveAccuracy(0, 400, 'b')).toBeLessThan(60);
  });
});

describe('advantage', () => {
  it('names the side ahead and by how much', () => {
    expect(advantage(10)).toEqual({ side: null, level: 'equal' });
    expect(advantage(-70)).toEqual({ side: 'b', level: 'slight' });
    expect(advantage(180)).toEqual({ side: 'w', level: 'clear' });
    expect(advantage(-100_000)).toEqual({ side: 'b', level: 'winning' });
  });
});

describe('reviewGame', () => {
  it('judges each move for the side that made it', () => {
    // 1. e4 (fine) ... e5 (fine) 2. Qh5?? (drops the queen)
    const review = reviewGame([20, 30, 25, -600]);
    expect(review.judgements).toEqual([null, null, 'blunder']);
    expect(review.white.blunders).toBe(1);
    expect(review.black.blunders).toBe(0);
    expect(review.white.accuracy).toBeLessThan(review.black.accuracy!);
  });

  it('starts with Black when the position says so', () => {
    const review = reviewGame([0, 300], 'b');
    expect(review.judgements).toEqual(['blunder']);
    expect(review.black.blunders).toBe(1);
  });

  it('skips moves whose scores are missing', () => {
    const review = reviewGame([0, undefined, -600]);
    expect(review.judgements).toEqual([null, null]);
    expect(review.white.accuracy).toBeNull();
  });
});
