import { BadRequestException, Injectable } from '@nestjs/common';
import { positionResult, resultTag } from '@shaxmat/chess-core';
import { Chess } from 'chess.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { SaveBotGameDto } from './games.schemas.js';

const RECENT_LIMIT = 10;

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  // The server replays the PGN and decides the result itself, so the client
  // cannot claim a win that did not happen on the board.
  async saveBotGame(userId: string, dto: SaveBotGameDto) {
    const chess = new Chess();
    try {
      chess.loadPgn(dto.pgn);
    } catch {
      throw new BadRequestException('Invalid PGN');
    }

    const playerSide = dto.color === 'white' ? 'w' : 'b';
    const outcome = dto.resigned
      ? { winner: playerSide === 'w' ? 'b' : 'w', reason: 'resign' } as const
      : positionResult(chess);
    if (!outcome) throw new BadRequestException('Game is not finished');

    const result = resultTag(outcome);
    chess.setHeader('Event', `Bot level ${dto.level}`);
    chess.setHeader('Result', result);

    return this.prisma.game.create({
      data: {
        whiteId: playerSide === 'w' ? userId : null,
        blackId: playerSide === 'b' ? userId : null,
        botLevel: dto.level,
        result,
        termination: outcome.reason,
        pgn: chess.pgn(),
      },
      select: { id: true, result: true, termination: true },
    });
  }

  recent(userId: string) {
    return this.prisma.game.findMany({
      where: { OR: [{ whiteId: userId }, { blackId: userId }] },
      orderBy: { createdAt: 'desc' },
      take: RECENT_LIMIT,
      select: {
        id: true,
        whiteId: true,
        blackId: true,
        botLevel: true,
        result: true,
        termination: true,
        createdAt: true,
      },
    });
  }
}
