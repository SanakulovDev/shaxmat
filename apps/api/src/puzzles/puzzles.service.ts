import { Injectable, NotFoundException } from '@nestjs/common';
import { updateRating } from '@shaxmat/chess-core';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RatingsService } from '../ratings/ratings.service.js';

export type PuzzleDto = {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
};

// Rating windows around the user's rating, tried in order until one has an
// unseen puzzle.
const SEARCH_WINDOWS = [100, 250, 500, 1000, 4000];

@Injectable()
export class PuzzlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ratings: RatingsService,
  ) {}

  async next(userId: string, theme?: string): Promise<PuzzleDto> {
    const { rating } = await this.ratings.get(userId, 'puzzle');
    const themeFilter = theme
      ? Prisma.sql`AND p.themes @> ARRAY[${theme}]::text[]`
      : Prisma.empty;

    for (const window of SEARCH_WINDOWS) {
      const rows = await this.prisma.$queryRaw<PuzzleDto[]>`
        SELECT p.id, p.fen, p.moves, p.rating, p.themes
        FROM "Puzzle" p
        WHERE p.rating BETWEEN ${Math.round(rating - window)}
                           AND ${Math.round(rating + window)}
          ${themeFilter}
          AND NOT EXISTS (
            SELECT 1 FROM "PuzzleAttempt" a
            WHERE a."userId" = ${userId}::uuid AND a."puzzleId" = p.id
          )
        ORDER BY random()
        LIMIT 1`;
      if (rows[0]) return rows[0];
    }
    throw new NotFoundException('No unseen puzzles');
  }

  // Rates the first try only; later tries return the current rating.
  async attempt(userId: string, puzzleId: string, solved: boolean) {
    const puzzle = await this.prisma.puzzle.findUnique({
      where: { id: puzzleId },
      select: { rating: true, ratingDeviation: true },
    });
    if (!puzzle) throw new NotFoundException('Puzzle not found');

    try {
      return await this.prisma.$transaction(async (tx) => {
        const before = await this.ratings.get(userId, 'puzzle', tx);
        const after = updateRating(before, [
          {
            opponent: { rating: puzzle.rating, rd: puzzle.ratingDeviation },
            score: solved ? 1 : 0,
          },
        ]);
        await tx.puzzleAttempt.create({
          data: {
            userId,
            puzzleId,
            solved,
            ratingBefore: before.rating,
            ratingAfter: after.rating,
          },
        });
        await this.ratings.save(userId, 'puzzle', after, tx);
        return {
          rating: Math.round(after.rating),
          change: Math.round(after.rating) - Math.round(before.rating),
        };
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const current = await this.ratings.get(userId, 'puzzle');
        return { rating: Math.round(current.rating), change: 0 };
      }
      throw error;
    }
  }
}
