import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import {
  type Clock,
  deadline,
  resultTag,
  type Side,
  updateRating,
} from '@shaxmat/chess-core';
import { Chess } from 'chess.js';
import { FriendsService } from '../friends/friends.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RatingsService } from '../ratings/ratings.service.js';
import { RealtimeService } from '../realtime/realtime.service.js';
import {
  type ActionError,
  applyAction,
  type GameAction,
  type LiveGame,
  replay,
  settle,
  turnOf,
} from './live-game.js';

// The current time in milliseconds. Tests replace it to move the clock.
export const NOW = Symbol('NOW');
export type Now = () => number;

export class PlayError extends Error {
  constructor(
    readonly code:
      | ActionError
      | 'notFound'
      | 'notPlayer'
      | 'conflict'
      | 'tooFast',
  ) {
    super(code);
  }
}

const PLAYERS = {
  white: { select: { id: true, name: true, isGuest: true } },
  black: { select: { id: true, name: true, isGuest: true } },
} satisfies Prisma.GameInclude;

type GameRow = Prisma.GameGetPayload<{ include: typeof PLAYERS }>;

type PlayerView = {
  id: string;
  name: string;
  isGuest: boolean;
  rating: number | null;
  ratingDiff: number | null;
};

export type GameView = {
  id: string;
  status: GameRow['status'];
  rated: boolean;
  category: GameRow['category'];
  botLevel: number | null;
  timeControl: { initial: number; increment: number } | null;
  white: PlayerView | null;
  black: PlayerView | null;
  moves: string[];
  clock: Clock | null;
  drawOffer: Side | null;
  takebackOffer: Side | null;
  result: string;
  termination: string | null;
  createdAt: string;
  // Lets clients line their clocks up with the server's.
  serverNow: number;
};

export type ChatLine = { userId: string; name: string; text: string; at: number };

// A few milliseconds after a deadline, so the check lands past it.
const TIMER_SLACK_MS = 20;
const CHAT_LIMIT = 50;
const CHAT_INTERVAL_MS = 1_000;
const CHAT_KEEP_AFTER_END_MS = 10 * 60_000;

// Runs games between people. The database holds each game's state; one
// update per game runs at a time, and a timer ends a game whose clock runs
// out. Timers and the update queue live in this process.
@Injectable()
export class PlayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PlayService.name);
  private readonly queues = new Map<string, Promise<unknown>>();
  private readonly timers = new Map<string, NodeJS.Timeout>();
  private readonly chats = new Map<string, ChatLine[]>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly ratings: RatingsService,
    private readonly realtime: RealtimeService,
    private readonly friends: FriendsService,
    @Inject(NOW) private readonly now: Now,
  ) {}

  // Picks up the clocks of games that were running before a restart.
  async onModuleInit() {
    const rows = await this.prisma.game.findMany({
      where: { status: 'active' },
      include: PLAYERS,
    });
    for (const row of rows) this.schedule(row);
  }

  onModuleDestroy() {
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
  }

  async view(gameId: string): Promise<GameView> {
    return this.toView(await this.load(gameId));
  }

  // Called once a challenge has turned into a game.
  async started(gameId: string) {
    this.schedule(await this.load(gameId));
  }

  act(userId: string, gameId: string, action: GameAction): Promise<void> {
    return this.serial(gameId, async () => {
      const row = await this.load(gameId);
      const side = sideOf(row, userId);
      if (!side) throw new PlayError('notPlayer');
      if (row.status !== 'active') throw new PlayError('finished');
      const result = applyAction(toLive(row), side, action, this.now());
      if ('error' in result) throw new PlayError(result.error);
      await this.save(row, result.game);
    });
  }

  // Ends the game if its clock ran out. Runs on the timer, and whenever a
  // client asks, in case the timer was lost.
  settle(gameId: string): Promise<void> {
    return this.serial(gameId, async () => {
      const row = await this.load(gameId);
      if (row.status !== 'active') return;
      const next = settle(toLive(row), this.now());
      if (next) await this.save(row, next);
    });
  }

  // Chat is open only between players who are friends.
  async chat(userId: string, gameId: string, text: string) {
    const row = await this.load(gameId);
    const side = sideOf(row, userId);
    if (!side) throw new PlayError('notPlayer');
    if (!(await this.chatAllowed(row))) throw new PlayError('notAllowed');

    const lines = this.chats.get(gameId) ?? [];
    const now = this.now();
    const last = lines.findLast((line) => line.userId === userId);
    if (last && now - last.at < CHAT_INTERVAL_MS) throw new PlayError('tooFast');

    const player = side === 'w' ? row.white : row.black;
    const line = { userId, name: player?.name ?? '', text, at: now };
    this.chats.set(gameId, [...lines, line].slice(-CHAT_LIMIT));
    for (const id of [row.whiteId, row.blackId]) {
      if (id) this.realtime.toUser(id, 'game:chat', { gameId, line });
    }
  }

  // The chat so far, or null when the user cannot chat in this game.
  async chatFor(gameId: string, userId: string): Promise<ChatLine[] | null> {
    const row = await this.load(gameId);
    if (!sideOf(row, userId) || !(await this.chatAllowed(row))) return null;
    return this.chats.get(gameId) ?? [];
  }

  private chatAllowed(row: GameRow): Promise<boolean> | false {
    if (!row.whiteId || !row.blackId || row.botLevel !== null) return false;
    return this.friends.areFriends(row.whiteId, row.blackId);
  }

  private async load(gameId: string): Promise<GameRow> {
    const row = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: PLAYERS,
    });
    if (!row) throw new PlayError('notFound');
    return row;
  }

  // Chains updates of one game so they never interleave.
  private serial<T>(gameId: string, task: () => Promise<T>): Promise<T> {
    // The stored tail never rejects, so one failed update does not block
    // the next.
    const previous = this.queues.get(gameId) ?? Promise.resolve();
    const run = previous.then(task);
    const tail = run.then(
      () => undefined,
      () => undefined,
    );
    this.queues.set(gameId, tail);
    void tail.then(() => {
      if (this.queues.get(gameId) === tail) this.queues.delete(gameId);
    });
    return run;
  }

  private async save(row: GameRow, next: LiveGame) {
    const data: Prisma.GameUpdateManyMutationInput = {
      status: next.status,
      moves: next.moves,
      whiteMs: next.clock.white,
      blackMs: next.clock.black,
      turnStartedAt: new Date(next.clock.turnStartedAt),
      drawOffer: next.drawOffer,
      takebackOffer: next.takebackOffer,
      revision: { increment: 1 },
    };
    if (next.status === 'finished' && next.reason) {
      const result = resultTag({ winner: next.winner, reason: next.reason });
      data.result = result;
      data.termination = next.reason;
      data.pgn = buildPgn(row, next, result);
      data.endedAt = new Date(this.now());
    } else if (next.status === 'aborted') {
      data.termination = 'aborted';
      data.endedAt = new Date(this.now());
    }

    await this.prisma.$transaction(async (tx) => {
      // The revision check guards against a second API process.
      const { count } = await tx.game.updateMany({
        where: { id: row.id, revision: row.revision },
        data,
      });
      if (count === 0) throw new PlayError('conflict');
      if (next.status === 'finished' && row.rated) {
        await this.rate(tx, row, next.winner);
      }
    });

    const saved = await this.load(row.id);
    this.realtime.toGame(saved.id, 'game:state', this.toView(saved));
    this.schedule(saved);
    if (saved.status !== 'active') {
      setTimeout(
        () => this.chats.delete(saved.id),
        CHAT_KEEP_AFTER_END_MS,
      ).unref();
    }
  }

  private async rate(
    tx: Prisma.TransactionClient,
    row: GameRow,
    winner: Side | null,
  ) {
    const { whiteId, blackId, category } = row;
    if (!whiteId || !blackId || !category) return;
    const white = await this.ratings.get(whiteId, category, tx);
    const black = await this.ratings.get(blackId, category, tx);
    const whiteScore = winner === 'w' ? 1 : winner === 'b' ? 0 : 0.5;
    const blackScore = winner === 'b' ? 1 : winner === 'w' ? 0 : 0.5;
    const newWhite = updateRating(white, [{ opponent: black, score: whiteScore }]);
    const newBlack = updateRating(black, [{ opponent: white, score: blackScore }]);
    await this.ratings.save(whiteId, category, newWhite, tx);
    await this.ratings.save(blackId, category, newBlack, tx);
    await tx.game.update({
      where: { id: row.id },
      data: {
        whiteRatingDiff: Math.round(newWhite.rating) - Math.round(white.rating),
        blackRatingDiff: Math.round(newBlack.rating) - Math.round(black.rating),
      },
    });
  }

  private schedule(row: GameRow) {
    clearTimeout(this.timers.get(row.id));
    this.timers.delete(row.id);
    if (row.status !== 'active') return;

    const live = toLive(row);
    const due = deadline(live.clock, turnOf(live), live.moves.length);
    const delay = Math.max(0, due.at - this.now()) + TIMER_SLACK_MS;
    const timer = setTimeout(() => {
      this.timers.delete(row.id);
      this.settle(row.id).catch((error: unknown) =>
        this.logger.error(`Clock check failed for game ${row.id}`, error),
      );
    }, delay);
    timer.unref();
    this.timers.set(row.id, timer);
  }

  private toView(row: GameRow): GameView {
    return {
      id: row.id,
      status: row.status,
      rated: row.rated,
      category: row.category,
      botLevel: row.botLevel,
      timeControl:
        row.timeInitial === null
          ? null
          : { initial: row.timeInitial, increment: row.timeIncrement ?? 0 },
      white: playerView(row.white, row.whiteRating, row.whiteRatingDiff),
      black: playerView(row.black, row.blackRating, row.blackRatingDiff),
      moves: row.botLevel === null ? row.moves : pgnMoves(row.pgn),
      clock: row.whiteMs === null ? null : toLive(row).clock,
      drawOffer: asSide(row.drawOffer),
      takebackOffer: asSide(row.takebackOffer),
      result: row.result,
      termination: row.termination,
      createdAt: row.createdAt.toISOString(),
      serverNow: this.now(),
    };
  }
}

function sideOf(row: GameRow, userId: string): Side | null {
  if (row.whiteId === userId) return 'w';
  if (row.blackId === userId) return 'b';
  return null;
}

function asSide(value: string | null): Side | null {
  return value === 'w' || value === 'b' ? value : null;
}

function toLive(row: GameRow): LiveGame {
  return {
    status: row.status,
    moves: row.moves,
    clock: {
      white: row.whiteMs ?? 0,
      black: row.blackMs ?? 0,
      turnStartedAt: row.turnStartedAt?.getTime() ?? 0,
    },
    incrementMs: (row.timeIncrement ?? 0) * 1000,
    drawOffer: asSide(row.drawOffer),
    takebackOffer: asSide(row.takebackOffer),
    winner: null,
    reason: null,
  };
}

function playerView(
  user: GameRow['white'],
  rating: number | null,
  ratingDiff: number | null,
): PlayerView | null {
  return user ? { ...user, rating, ratingDiff } : null;
}

// UCI moves of a saved bot game.
function pgnMoves(pgn: string): string[] {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    return [];
  }
  return chess.history({ verbose: true }).map((move) => move.lan);
}

function buildPgn(row: GameRow, game: LiveGame, result: string): string {
  const chess = replay(game.moves);
  const date = row.createdAt.toISOString().slice(0, 10).replaceAll('-', '.');
  chess.setHeader('Event', row.rated ? 'Rated game' : 'Casual game');
  chess.setHeader('Site', 'Shaxmat');
  chess.setHeader('Date', date);
  chess.setHeader('White', row.white?.name ?? '?');
  chess.setHeader('Black', row.black?.name ?? '?');
  chess.setHeader('Result', result);
  if (row.whiteRating !== null) chess.setHeader('WhiteElo', String(row.whiteRating));
  if (row.blackRating !== null) chess.setHeader('BlackElo', String(row.blackRating));
  chess.setHeader('TimeControl', `${row.timeInitial}+${row.timeIncrement}`);
  chess.setHeader(
    'Termination',
    game.reason === 'timeout' ? 'time forfeit' : 'normal',
  );
  return chess.pgn();
}
