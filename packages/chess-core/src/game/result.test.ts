import { Chess } from 'chess.js';
import { positionResult, resultTag } from './result.js';

describe('positionResult', () => {
  it('detects checkmate and the winner', () => {
    const chess = new Chess();
    for (const move of ['f3', 'e5', 'g4', 'Qh4#']) chess.move(move);
    expect(positionResult(chess)).toEqual({ winner: 'b', reason: 'checkmate' });
  });

  it('detects stalemate', () => {
    const chess = new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
    expect(positionResult(chess)).toEqual({
      winner: null,
      reason: 'stalemate',
    });
  });

  it('returns null while the game goes on', () => {
    expect(positionResult(new Chess())).toBeNull();
  });

  it('formats the PGN result tag', () => {
    expect(resultTag({ winner: 'w', reason: 'checkmate' })).toBe('1-0');
    expect(resultTag({ winner: null, reason: 'stalemate' })).toBe('1/2-1/2');
  });
});
