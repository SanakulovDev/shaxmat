import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/setup-app.js';

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication();
  setupApp(app);
  await app.init();
  return app;
}

export async function createGuest(app: INestApplication) {
  const response = await request(app.getHttpServer())
    .post('/api/auth/guest')
    .expect(201);
  return response.body as {
    accessToken: string;
    user: { id: string; isGuest: boolean };
  };
}
