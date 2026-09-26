import { Chess } from 'chess.js';
import {
  canMate,
  type Clock,
  clockAfterMove,
  deadline,
  FIRST_MOVE_MS,
  timeLeft,
} from './clock.js';

const START: Clock = { white: 60_000, black: 60_000, turnStartedAt: 1_000 };

describe('clock', () => {
  it('does not run before both sides have moved', () => {
    expect(timeLeft(START, 'w', 'w', 0, 50_000)).toBe(60_000);
    expect(clockAfterMove(START, 'w', 0, 2_000, 20_000)).toEqual({
      ...START,
      turnStartedAt: 20_000,
    });
    expect(deadline(START, 'w', 0)).toEqual({
      at: 1_000 + FIRST_MOVE_MS,
      kind: 'abort',
    });
  });

  it('counts down for the side to move only', () => {
    expect(timeLeft(START, 'w', 'w', 2, 11_000)).toBe(50_000);
    expect(timeLeft(START, 'b', 'w', 2, 11_000)).toBe(60_000);
    expect(timeLeft(START, 'w', 'w', 2, 100_000)).toBe(0);
  });

  it('adds the increment after a timed move', () => {
    expect(clockAfterMove(START, 'b', 3, 2_000, 11_000)).toEqual({
      white: 60_000,
      black: 52_000,
      turnStartedAt: 11_000,
    });
  });

  it('reports a fallen flag', () => {
    expect(clockAfterMove(START, 'w', 2, 2_000, 61_000)).toBeNull();
    expect(deadline(START, 'w', 2)).toEqual({ at: 61_000, kind: 'flag' });
  });
});

describe('canMate', () => {
  it('needs more than a lone minor piece', () => {
    expect(canMate(new Chess('8/8/8/4k3/8/8/8/4KB2 w - - 0 1'), 'w')).toBe(false);
    expect(canMate(new Chess('8/8/8/4k3/8/8/8/4K3 w - - 0 1'), 'w')).toBe(false);
    expect(canMate(new Chess('8/8/8/4k3/8/8/8/3NKB2 w - - 0 1'), 'w')).toBe(true);
    expect(canMate(new Chess('8/8/8/4k3/8/8/4P3/4K3 w - - 0 1'), 'w')).toBe(true);
  });
});
