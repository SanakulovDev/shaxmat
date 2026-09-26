import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { findTimeControl, timeControlCategory } from '@shaxmat/chess-core';
import { randomInt } from 'node:crypto';
import type { AuthUser } from '../auth/auth.guard.js';
import { FriendsService } from '../friends/friends.service.js';
import type { Challenge, ChallengeColor, Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RatingsService } from '../ratings/ratings.service.js';
import { RealtimeService } from '../realtime/realtime.service.js';
import type { CreateChallengeDto } from './challenges.schemas.js';
import { NOW, type Now, PlayService } from './play.service.js';

// No look-alike characters, so a code read aloud or retyped still works.
const CODE_ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;
const LINK_TTL_MS = 24 * 60 * 60_000;
const DIRECT_TTL_MS = 60 * 60_000;

const CREATOR = {
  creator: { select: { id: true, name: true, avatarUrl: true, isGuest: true } },
} satisfies Prisma.ChallengeInclude;

type ChallengeRow = Prisma.ChallengeGetPayload<{ include: typeof CREATOR }>;

function newCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

@Injectable()
export class ChallengesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ratings: RatingsService,
    private readonly realtime: RealtimeService,
    private readonly friends: FriendsService,
    private readonly play: PlayService,
    @Inject(NOW) private readonly now: Now,
  ) {}

  async create(user: AuthUser, dto: CreateChallengeDto) {
    const data = await this.newChallenge(user, dto);
    const row = await this.prisma.challenge.create({
      data: {
        ...data,
        code: newCode(),
        creatorId: user.id,
        expiresAt: new Date(
          this.now() + (data.destId ? DIRECT_TTL_MS : LINK_TTL_MS),
        ),
      },
      include: CREATOR,
    });
    if (row.destId) this.changed(row.destId);
    return this.toView(row);
  }

  private async newChallenge(
    user: AuthUser,
    dto: CreateChallengeDto,
  ): Promise<
    Pick<
      Challenge,
      'destId' | 'color' | 'rated' | 'timeInitial' | 'timeIncrement'
    >
  > {
    if ('rematchOf' in dto) {
      const game = await this.prisma.game.findUnique({
        where: { id: dto.rematchOf },
      });
      const wasWhite = game?.whiteId === user.id;
      const opponent = wasWhite ? game?.blackId : game?.whiteId;
      if (
        !game ||
        !opponent ||
        (!wasWhite && game.blackId !== user.id) ||
        game.status === 'active' ||
        game.timeInitial === null
      ) {
        throw new BadRequestException('Cannot rematch this game');
      }
      return {
        destId: opponent,
        color: wasWhite ? 'black' : 'white',
        rated: game.rated,
        timeInitial: game.timeInitial,
        timeIncrement: game.timeIncrement ?? 0,
      };
    }

    // The schema only lets known time controls through.
    const tc = findTimeControl(dto.timeControl)!;
    if (dto.rated && user.isGuest) {
      throw new ForbiddenException('registrationRequired');
    }
    if (dto.friendId && !(await this.friends.areFriends(user.id, dto.friendId))) {
      throw new ForbiddenException('notFriends');
    }
    return {
      destId: dto.friendId ?? null,
      color: dto.color,
      rated: dto.rated,
      timeInitial: tc.initial,
      timeIncrement: tc.increment,
    };
  }

  async get(code: string) {
    return this.toView(await this.load(code));
  }

  // Open challenges sent to the user, and the user's own open ones.
  async list(userId: string) {
    const open = {
      status: 'open',
      expiresAt: { gt: new Date(this.now()) },
    } satisfies Prisma.ChallengeWhereInput;
    const [incoming, outgoing] = await Promise.all([
      this.prisma.challenge.findMany({
        where: { ...open, destId: userId },
        include: CREATOR,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.challenge.findMany({
        where: { ...open, creatorId: userId },
        include: CREATOR,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return {
      incoming: incoming.map((row) => this.toView(row)),
      outgoing: outgoing.map((row) => this.toView(row)),
    };
  }

  async accept(user: AuthUser, code: string) {
    const challenge = await this.load(code);
    this.assertOpen(challenge);
    if (challenge.creatorId === user.id) {
      throw new BadRequestException('ownChallenge');
    }
    if (challenge.destId && challenge.destId !== user.id) {
      throw new ForbiddenException('notForYou');
    }
    if (challenge.rated && user.isGuest) {
      throw new ForbiddenException('registrationRequired');
    }

    const creatorWhite = pickCreatorWhite(challenge.color);
    const whiteId = creatorWhite ? challenge.creatorId : user.id;
    const blackId = creatorWhite ? user.id : challenge.creatorId;
    const category = timeControlCategory({
      initial: challenge.timeInitial,
      increment: challenge.timeIncrement,
    });
    const clockMs = challenge.timeInitial * 1000;

    const gameId = await this.prisma.$transaction(async (tx) => {
      const rating = async (userId: string) =>
        challenge.rated
          ? Math.round((await this.ratings.get(userId, category, tx)).rating)
          : null;
      const game = await tx.game.create({
        data: {
          whiteId,
          blackId,
          status: 'active',
          result: '*',
          pgn: '',
          rated: challenge.rated,
          category,
          timeInitial: challenge.timeInitial,
          timeIncrement: challenge.timeIncrement,
          whiteMs: clockMs,
          blackMs: clockMs,
          turnStartedAt: new Date(this.now()),
          whiteRating: await rating(whiteId),
          blackRating: await rating(blackId),
        },
        select: { id: true },
      });
      // Only one of two people opening the same link at once gets the game.
      const { count } = await tx.challenge.updateMany({
        where: { id: challenge.id, status: 'open' },
        data: { status: 'accepted', gameId: game.id },
      });
      if (count === 0) throw new ConflictException('challengeClosed');
      return game.id;
    });

    await this.play.started(gameId);
    this.changed(challenge.creatorId);
    return { gameId };
  }

  async decline(userId: string, code: string) {
    const challenge = await this.load(code);
    if (challenge.destId !== userId) throw new ForbiddenException('notForYou');
    await this.close(challenge, 'declined');
  }

  async cancel(userId: string, code: string) {
    const challenge = await this.load(code);
    if (challenge.creatorId !== userId) throw new ForbiddenException();
    await this.close(challenge, 'cancelled');
  }

  private async close(
    challenge: ChallengeRow,
    status: 'declined' | 'cancelled',
  ) {
    await this.prisma.challenge.updateMany({
      where: { id: challenge.id, status: 'open' },
      data: { status },
    });
    this.changed(challenge.creatorId, challenge.destId);
  }

  private async load(code: string): Promise<ChallengeRow> {
    const row = await this.prisma.challenge.findUnique({
      where: { code },
      include: CREATOR,
    });
    if (!row) throw new NotFoundException('Challenge not found');
    return row;
  }

  private assertOpen(challenge: ChallengeRow) {
    if (challenge.status !== 'open' || this.expired(challenge)) {
      throw new GoneException('challengeClosed');
    }
  }

  private expired(challenge: ChallengeRow): boolean {
    return challenge.expiresAt.getTime() <= this.now();
  }

  // Tells the users' open pages to reload their challenges.
  private changed(...userIds: (string | null)[]) {
    for (const id of userIds) {
      if (id) this.realtime.toUser(id, 'challenges:changed');
    }
  }

  private toView(row: ChallengeRow) {
    return {
      code: row.code,
      creator: row.creator,
      destId: row.destId,
      color: row.color,
      rated: row.rated,
      timeControl: { initial: row.timeInitial, increment: row.timeIncrement },
      status: row.status === 'open' && this.expired(row) ? 'expired' : row.status,
      gameId: row.gameId,
      expiresAt: row.expiresAt.toISOString(),
    };
  }
}

function pickCreatorWhite(color: ChallengeColor): boolean {
  if (color === 'random') return randomInt(2) === 0;
  return color === 'white';
}
