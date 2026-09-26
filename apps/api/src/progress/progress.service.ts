import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RatingsService } from '../ratings/ratings.service.js';

type BotStatsRow = {
  level: number;
  games: bigint;
  wins: bigint;
  draws: bigint;
};

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ratings: RatingsService,
  ) {}

  async summary(userId: string) {
    const [puzzle, gameRatings, puzzlesSolved, lessons, botRows] = await Promise.all([
      this.ratings.get(userId, 'puzzle'),
      this.prisma.rating.findMany({
        where: { userId, category: { not: 'puzzle' } },
        select: { category: true, rating: true, rd: true, count: true },
      }),
      this.prisma.puzzleAttempt.count({ where: { userId, solved: true } }),
      this.prisma.lessonProgress.findMany({
        where: { userId },
        select: { lessonSlug: true, completedAt: true },
        orderBy: { completedAt: 'asc' },
      }),
      this.prisma.$queryRaw<BotStatsRow[]>`
        SELECT "botLevel" AS level,
               count(*) AS games,
               count(*) FILTER (
                 WHERE (result = '1-0' AND "whiteId" = ${userId}::uuid)
                    OR (result = '0-1' AND "blackId" = ${userId}::uuid)
               ) AS wins,
               count(*) FILTER (WHERE result = '1/2-1/2') AS draws
        FROM "Game"
        WHERE "botLevel" IS NOT NULL
          AND ("whiteId" = ${userId}::uuid OR "blackId" = ${userId}::uuid)
        GROUP BY "botLevel"
        ORDER BY "botLevel"`,
    ]);

    return {
      puzzleRating: {
        rating: Math.round(puzzle.rating),
        rd: Math.round(puzzle.rd),
        count: puzzle.count,
      },
      // Only categories the user has played rated games in.
      gameRatings: gameRatings.map((row) => ({
        category: row.category,
        rating: Math.round(row.rating),
        rd: Math.round(row.rd),
        count: row.count,
      })),
      puzzlesSolved,
      lessons,
      bots: botRows.map((row) => ({
        level: row.level,
        games: Number(row.games),
        wins: Number(row.wins),
        draws: Number(row.draws),
      })),
    };
  }

  async completeLesson(userId: string, lessonSlug: string) {
    await this.prisma.lessonProgress.upsert({
      where: { userId_lessonSlug: { userId, lessonSlug } },
      create: { userId, lessonSlug },
      update: {},
    });
  }
}
