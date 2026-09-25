import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createGuest, createTestApp } from './helpers.js';

// Needs a migrated database: `pnpm db:up && pnpm db:migrate`.
describe('bot games and progress (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
    ({ accessToken: token } = await createGuest(app));
  });

  afterAll(async () => {
    await app.close();
  });

  function saveGame(body: object) {
    return request(app.getHttpServer())
      .post('/api/games/bot')
      .set('Authorization', `Bearer ${token}`)
      .send(body);
  }

  it('decides the result from the moves', async () => {
    const response = await saveGame({
      level: 1,
      color: 'white',
      pgn: '1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#',
      resigned: false,
    }).expect(201);
    expect(response.body).toMatchObject({
      result: '1-0',
      termination: 'checkmate',
    });
  });

  it('records a resignation as a loss', async () => {
    const response = await saveGame({
      level: 2,
      color: 'black',
      pgn: '1. e4',
      resigned: true,
    }).expect(201);
    expect(response.body).toMatchObject({ result: '1-0', termination: 'resign' });
  });

  it('rejects an unfinished game and invalid moves', async () => {
    await saveGame({
      level: 1,
      color: 'white',
      pgn: '1. e4 e5',
      resigned: false,
    }).expect(400);
    await saveGame({
      level: 1,
      color: 'white',
      pgn: '1. e5',
      resigned: false,
    }).expect(400);
    await saveGame({
      level: 11,
      color: 'white',
      pgn: '',
      resigned: true,
    }).expect(400);
  });

  it('requires a session', async () => {
    await request(app.getHttpServer()).post('/api/games/bot').send({}).expect(401);
  });

  it('sums up bot results and completed lessons', async () => {
    const server = app.getHttpServer();
    await request(server)
      .put('/api/progress/lessons/taxta')
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
    // Completing a lesson twice is fine.
    await request(server)
      .put('/api/progress/lessons/taxta')
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const response = await request(server)
      .get('/api/progress')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.body.bots).toEqual([
      { level: 1, games: 1, wins: 1, draws: 0 },
      { level: 2, games: 1, wins: 0, draws: 0 },
    ]);
    expect(response.body.lessons).toHaveLength(1);
    expect(response.body.lessons[0].lessonSlug).toBe('taxta');
    expect(response.body.puzzleRating).toMatchObject({ rating: 1000, count: 0 });
    expect(response.body.puzzlesSolved).toBe(0);
  });

  it('accepts only known lessons', async () => {
    await request(app.getHttpServer())
      .put('/api/progress/lessons/no-such-lesson')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});
