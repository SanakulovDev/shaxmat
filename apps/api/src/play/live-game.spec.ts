import {
  applyAction,
  type GameAction,
  type LiveGame,
  settle,
} from './live-game.js';

const MINUTE = 60_000;

function newGame(overrides: Partial<LiveGame> = {}): LiveGame {
  return {
    status: 'active',
    moves: [],
    clock: { white: MINUTE, black: MINUTE, turnStartedAt: 0 },
    incrementMs: 1_000,
    drawOffer: null,
    takebackOffer: null,
    winner: null,
    reason: null,
    ...overrides,
  };
}

// Plays moves one second apart, alternating sides.
function play(game: LiveGame, moves: string[], start = 1_000): LiveGame {
  let now = start;
  for (const uci of moves) {
    const side = game.moves.length % 2 === 0 ? 'w' : 'b';
    const result = applyAction(game, side, { type: 'move', uci }, now);
    if ('error' in result) throw new Error(`${uci}: ${result.error}`);
    game = result.game;
    now += 1_000;
  }
  return game;
}

function act(game: LiveGame, side: 'w' | 'b', action: GameAction, now = 10_000) {
  return applyAction(game, side, action, now);
}

describe('live game', () => {
  it('rejects moves out of turn and illegal moves', () => {
    const game = newGame();
    expect(act(game, 'b', { type: 'move', uci: 'e7e5' })).toEqual({
      error: 'notYourTurn',
    });
    expect(act(game, 'w', { type: 'move', uci: 'e2e5' })).toEqual({
      error: 'illegal',
    });
  });

  it('ends the game on checkmate', () => {
    const game = play(newGame(), ['f2f3', 'e7e5', 'g2g4', 'd8h4']);
    expect(game).toMatchObject({
      status: 'finished',
      winner: 'b',
      reason: 'checkmate',
    });
    expect(act(game, 'w', { type: 'move', uci: 'a2a3' })).toEqual({
      error: 'finished',
    });
  });

  it('runs the clock from the third ply and adds the increment', () => {
    const game = play(newGame(), ['e2e4', 'e7e5', 'g1f3'], 1_000);
    // White's third-ply move came 1 s after Black's reply at 2 s.
    expect(game.clock).toEqual({
      white: MINUTE - 1_000 + 1_000,
      black: MINUTE,
      turnStartedAt: 3_000,
    });
  });

  it('aborts when a first move does not come in time', () => {
    const game = newGame();
    expect(settle(game, 29_000)).toBeNull();
    expect(settle(game, 30_000)).toMatchObject({ status: 'aborted' });
  });

  it('flags the side to move when its time runs out', () => {
    const game = play(newGame(), ['e2e4', 'e7e5']);
    // Black moved at 2 s; White's minute runs out at 62 s.
    expect(settle(game, 61_999)).toBeNull();
    expect(settle(game, 62_000)).toMatchObject({
      status: 'finished',
      winner: 'b',
      reason: 'timeout',
      clock: { white: 0 },
    });
  });

  it('ends a late move by the clock instead of playing it', () => {
    const game = play(newGame(), ['e2e4', 'e7e5']);
    const result = act(game, 'w', { type: 'move', uci: 'g1f3' }, 70_000);
    expect(result).toMatchObject({
      game: { status: 'finished', reason: 'timeout', moves: ['e2e4', 'e7e5'] },
    });
  });

  it('allows abort only before both sides moved, resign only after', () => {
    const game = play(newGame(), ['e2e4']);
    expect(act(game, 'w', { type: 'resign' })).toEqual({ error: 'notAllowed' });
    expect(act(game, 'b', { type: 'abort' })).toMatchObject({
      game: { status: 'aborted' },
    });

    const started = play(game, ['e7e5'], 2_000);
    expect(act(started, 'w', { type: 'abort' })).toEqual({ error: 'notAllowed' });
    expect(act(started, 'w', { type: 'resign' })).toMatchObject({
      game: { status: 'finished', winner: 'b', reason: 'resign' },
    });
  });

  it('agrees a draw after an offer', () => {
    const game = play(newGame(), ['e2e4', 'e7e5']);
    expect(act(game, 'b', { type: 'drawAccept' })).toEqual({
      error: 'notAllowed',
    });
    const offered = act(game, 'w', { type: 'drawOffer' });
    if (!('game' in offered)) throw new Error('offer failed');
    expect(offered.game.drawOffer).toBe('w');

    expect(act(offered.game, 'b', { type: 'drawAccept' })).toMatchObject({
      game: { status: 'finished', winner: null, reason: 'agreement' },
    });
    expect(act(offered.game, 'b', { type: 'drawDecline' })).toMatchObject({
      game: { status: 'active', drawOffer: null },
    });
    // Offering back is accepting.
    expect(act(offered.game, 'b', { type: 'drawOffer' })).toMatchObject({
      game: { reason: 'agreement' },
    });
  });

  it("keeps the mover's draw offer and drops the opponent's", () => {
    const game = play(newGame(), ['e2e4', 'e7e5']);
    const offered = act(game, 'w', { type: 'drawOffer' });
    if (!('game' in offered)) throw new Error('offer failed');
    const moved = play(offered.game, ['g1f3'], 5_000);
    expect(moved.drawOffer).toBe('w');
    const answered = play(moved, ['b8c6'], 6_000);
    expect(answered.drawOffer).toBeNull();
  });

  it("takes back the asker's last move and the reply to it", () => {
    const game = play(newGame(), ['e2e4', 'e7e5', 'g1f3']);
    // White asks while Black is to move: one ply goes back.
    const asked = act(game, 'w', { type: 'takebackOffer' });
    if (!('game' in asked)) throw new Error('offer failed');
    expect(act(asked.game, 'b', { type: 'takebackAccept' })).toMatchObject({
      game: { moves: ['e2e4', 'e7e5'], takebackOffer: null },
    });

    // Black asks on its own turn: its move and White's reply go back.
    const blackAsks = act(game, 'b', { type: 'takebackOffer' });
    if (!('game' in blackAsks)) throw new Error('offer failed');
    expect(act(blackAsks.game, 'w', { type: 'takebackAccept' })).toMatchObject({
      game: { moves: ['e2e4'] },
    });

    // Black has no move to take back yet.
    expect(act(play(newGame(), ['e2e4']), 'b', { type: 'takebackOffer' })).toEqual({
      error: 'notAllowed',
    });
  });
});
