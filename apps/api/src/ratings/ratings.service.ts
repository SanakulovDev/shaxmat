import { Injectable } from '@nestjs/common';
import { INITIAL_RATING, type Rating } from '@shaxmat/chess-core';
import type { Prisma, RatingCategory } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  // The user's rating, or the starting rating if they have none yet.
  async get(
    userId: string,
    category: RatingCategory,
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<Rating & { count: number }> {
    const row = await db.rating.findUnique({
      where: { userId_category: { userId, category } },
    });
    return row ?? { ...INITIAL_RATING, count: 0 };
  }

  async save(
    userId: string,
    category: RatingCategory,
    rating: Rating,
    db: Prisma.TransactionClient = this.prisma,
  ) {
    const values = {
      rating: rating.rating,
      rd: rating.rd,
      volatility: rating.volatility,
    };
    await db.rating.upsert({
      where: { userId_category: { userId, category } },
      create: { userId, category, ...values, count: 1 },
      update: { ...values, count: { increment: 1 } },
    });
  }
}
