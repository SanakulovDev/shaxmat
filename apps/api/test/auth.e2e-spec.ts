import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/setup-app.js';

// Needs a migrated database: `pnpm db:up && pnpm db:migrate`.
describe('auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  function refreshCookie(response: request.Response): string {
    const cookies = response.get('Set-Cookie') ?? [];
    const cookie = cookies.find((c) => c.startsWith('refresh_token='));
    if (!cookie) throw new Error('refresh_token cookie missing');
    return cookie.split(';')[0];
  }

  it('registers, reads the profile, refreshes once and logs out', async () => {
    const email = `user-${randomUUID()}@example.com`;
    const server = app.getHttpServer();

    const registered = await request(server)
      .post('/api/auth/register')
      .send({ email, password: 'secret123', name: 'Anvar' })
      .expect(201);
    expect(registered.body.user).toMatchObject({ email, isGuest: false });

    await request(server)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registered.body.accessToken}`)
      .expect(200)
      .expect((res) => expect(res.body.email).toBe(email));

    const firstCookie = refreshCookie(registered);
    const refreshed = await request(server)
      .post('/api/auth/refresh')
      .set('Cookie', firstCookie)
      .expect(200);

    // A refresh token works only once.
    await request(server)
      .post('/api/auth/refresh')
      .set('Cookie', firstCookie)
      .expect(401);

    const secondCookie = refreshCookie(refreshed);
    await request(server)
      .post('/api/auth/logout')
      .set('Cookie', secondCookie)
      .expect(204);
    await request(server)
      .post('/api/auth/refresh')
      .set('Cookie', secondCookie)
      .expect(401);
  });

  it('rejects a duplicate email and a wrong password', async () => {
    const email = `user-${randomUUID()}@example.com`;
    const server = app.getHttpServer();
    const body = { email, password: 'secret123', name: 'Anvar' };

    await request(server).post('/api/auth/register').send(body).expect(201);
    await request(server).post('/api/auth/register').send(body).expect(409);
    await request(server)
      .post('/api/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);
  });

  it('creates a guest', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/guest')
      .expect(201);
    expect(response.body.user).toMatchObject({ isGuest: true, email: null });
    expect(response.body.user.name).toMatch(/^Mehmon-\d{4}$/);
  });

  it('rejects an invalid request body', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: '1' })
      .expect(400);
  });
});
