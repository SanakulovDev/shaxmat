import { INestApplication } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createGuest, createTestApp } from './helpers.js';

// Needs a migrated database: `pnpm db:up && pnpm db:migrate`.
describe('puzzles (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  // A theme only these test puzzles have, so other puzzles never match.
  const theme = `e2e${randomBytes(4).toString('hex')}`;
  const ids = [`${theme}a`, `${theme}b`];

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await prisma.puzzle.createMany({
      data: ids.map((id) => ({
        id,
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
        moves: ['h5f7'],
        rating: 1000,
        ratingDeviation: 80,
        popularity: 95,
        plays: 5000,
        themes: [theme, 'mateIn1'],
      })),
    });
    ({ accessToken: token } = await createGuest(app));
  });

  afterAll(async () => {
    await prisma.puzzle.deleteMany({ where: { id: { in: ids } } });
    await app.close();
  });

  const next = () =>
    request(app.getHttpServer())
      .get(`/api/puzzles/next?theme=${theme}`)
      .set('Authorization', `Bearer ${token}`);

  const attempt = (id: string, solved: boolean) =>
    request(app.getHttpServer())
      .post(`/api/puzzles/${id}/attempt`)
      .set('Authorization', `Bearer ${token}`)
      .send({ solved });

  it('serves unseen puzzles and rates only the first try', async () => {
    const first = await next().expect(200);
    expect(ids).toContain(first.body.id);
    expect(first.body.moves).toEqual(['h5f7']);

    const solved = await attempt(first.body.id, true).expect(200);
    expect(solved.body.change).toBeGreaterThan(0);

    const retry = await attempt(first.body.id, false).expect(200);
    expect(retry.body).toEqual({ rating: solved.body.rating, change: 0 });

    const second = await next().expect(200);
    expect(second.body.id).not.toBe(first.body.id);

    const failed = await attempt(second.body.id, false).expect(200);
    expect(failed.body.change).toBeLessThan(0);

    await next().expect(404);
  });

  it('rejects unknown puzzles and bad ids', async () => {
    await attempt('doesnotexist', true).expect(404);
    await attempt('bad-id!', true).expect(400);
  });
});
