import {
  canMate,
  type Clock,
  clockAfterMove,
  clockRuns,
  deadline,
  type GameEndReason,
  positionResult,
  type Side,
  timeLeft,
} from '@shaxmat/chess-core';
import { Chess } from 'chess.js';

// A game between people as the rules see it. The service loads it from the
// database, applies one action and saves the result.
export type LiveGame = {
  status: 'active' | 'finished' | 'aborted';
  // UCI moves from the start position.
  moves: string[];
  clock: Clock;
  incrementMs: number;
  drawOffer: Side | null;
  takebackOffer: Side | null;
  // Set when the game is finished; `winner` null means a draw.
  winner: Side | null;
  reason: GameEndReason | null;
};

export type GameAction =
  | { type: 'move'; uci: string }
  | { type: 'resign' }
  | { type: 'abort' }
  | { type: 'drawOffer' }
  | { type: 'drawAccept' }
  | { type: 'drawDecline' }
  | { type: 'takebackOffer' }
  | { type: 'takebackAccept' }
  | { type: 'takebackDecline' };

export type ActionError = 'finished' | 'notYourTurn' | 'illegal' | 'notAllowed';

export type ActionResult = { game: LiveGame } | { error: ActionError };

export function other(side: Side): Side {
  return side === 'w' ? 'b' : 'w';
}

// Games start from the standard position, so White moves on even plies.
export function turnOf(game: Pick<LiveGame, 'moves'>): Side {
  return game.moves.length % 2 === 0 ? 'w' : 'b';
}

export function replay(moves: readonly string[]): Chess {
  const chess = new Chess();
  for (const uci of moves) chess.move(uciToMove(uci));
  return chess;
}

function uciToMove(uci: string) {
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? uci.slice(4, 5) : undefined,
  };
}

// Stops the running clock at `now`, so a finished game shows the time each
// side had left.
function stopClock(game: LiveGame, now: number): Clock {
  const turn = turnOf(game);
  const ply = game.moves.length;
  const left = timeLeft(game.clock, turn, turn, ply, now);
  const key = turn === 'w' ? 'white' : 'black';
  return { ...game.clock, [key]: left, turnStartedAt: now };
}

function end(
  game: LiveGame,
  now: number,
  winner: Side | null,
  reason: GameEndReason,
): LiveGame {
  return {
    ...game,
    status: 'finished',
    clock: stopClock(game, now),
    drawOffer: null,
    takebackOffer: null,
    winner,
    reason,
  };
}

// Ends the game when the side to move ran out of time, or returns null.
// Before both sides have moved, running out of time aborts the game.
export function settle(game: LiveGame, now: number): LiveGame | null {
  if (game.status !== 'active') return null;
  const turn = turnOf(game);
  const due = deadline(game.clock, turn, game.moves.length);
  if (now < due.at) return null;
  if (due.kind === 'abort') {
    return { ...game, status: 'aborted', drawOffer: null, takebackOffer: null };
  }
  const opponent = other(turn);
  const winner = canMate(replay(game.moves), opponent) ? opponent : null;
  return end(game, now, winner, 'timeout');
}

export function applyAction(
  game: LiveGame,
  side: Side,
  action: GameAction,
  now: number,
): ActionResult {
  // A late action loses to the clock: the game ends instead.
  const settled = settle(game, now);
  if (settled) return { game: settled };
  if (game.status !== 'active') return { error: 'finished' };

  const ply = game.moves.length;
  const opponent = other(side);

  switch (action.type) {
    case 'move':
      return move(game, side, action.uci, now);

    case 'resign':
      if (!clockRuns(ply)) return { error: 'notAllowed' };
      return { game: end(game, now, opponent, 'resign') };

    case 'abort':
      if (clockRuns(ply)) return { error: 'notAllowed' };
      return {
        game: { ...game, status: 'aborted', drawOffer: null, takebackOffer: null },
      };

    case 'drawOffer':
      if (!clockRuns(ply)) return { error: 'notAllowed' };
      if (game.drawOffer === opponent) {
        return { game: end(game, now, null, 'agreement') };
      }
      return { game: { ...game, drawOffer: side } };

    case 'drawAccept':
      if (game.drawOffer !== opponent) return { error: 'notAllowed' };
      return { game: end(game, now, null, 'agreement') };

    case 'drawDecline':
      if (game.drawOffer !== opponent) return { error: 'notAllowed' };
      return { game: { ...game, drawOffer: null } };

    case 'takebackOffer': {
      // The side must have a move of its own to take back.
      const firstOwnPly = side === 'w' ? 1 : 2;
      if (ply < firstOwnPly) return { error: 'notAllowed' };
      return { game: { ...game, takebackOffer: side } };
    }

    case 'takebackAccept': {
      if (game.takebackOffer !== opponent) return { error: 'notAllowed' };
      // Take back the asker's last move, and the reply to it if there was one.
      const count = turnOf(game) === opponent ? 2 : 1;
      return {
        game: {
          ...game,
          moves: game.moves.slice(0, ply - count),
          clock: { ...stopClock(game, now), turnStartedAt: now },
          drawOffer: null,
          takebackOffer: null,
        },
      };
    }

    case 'takebackDecline':
      if (game.takebackOffer !== opponent) return { error: 'notAllowed' };
      return { game: { ...game, takebackOffer: null } };
  }
}

function move(
  game: LiveGame,
  side: Side,
  uci: string,
  now: number,
): ActionResult {
  const turn = turnOf(game);
  if (side !== turn) return { error: 'notYourTurn' };

  const chess = replay(game.moves);
  let lan: string;
  try {
    lan = chess.move(uciToMove(uci)).lan;
  } catch {
    return { error: 'illegal' };
  }

  const ply = game.moves.length;
  // settle() has already ended the game if the flag fell.
  const clock = clockAfterMove(game.clock, turn, ply, game.incrementMs, now)!;
  const next: LiveGame = {
    ...game,
    moves: [...game.moves, lan],
    clock,
    // Moving declines the opponent's draw offer; the mover's own offer
    // stays open for the opponent's reply.
    drawOffer: game.drawOffer === side ? side : null,
    takebackOffer: null,
  };
  const result = positionResult(chess);
  if (!result) return { game: next };
  return {
    game: {
      ...next,
      status: 'finished',
      winner: result.winner,
      reason: result.reason,
    },
  };
}
