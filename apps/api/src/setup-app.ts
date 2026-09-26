import { INestApplication, StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Express } from 'express';
import cookieParser from 'cookie-parser';
import type { Env } from './config/env.js';
import { PostgresIoAdapter } from './realtime/postgres-io.adapter.js';

// Shared by main.ts, the Vercel entry and e2e tests so all run the same
// pipeline.
export function setupApp(app: INestApplication) {
  const config = app.get<ConfigService<Env, true>>(ConfigService);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.useWebSocketAdapter(
    new PostgresIoAdapter(
      app,
      config.get('DATABASE_URL_UNPOOLED', { infer: true }) ??
        config.get('DATABASE_URL', { infer: true }),
    ),
  );
  // Behind Vercel's proxy the client address arrives in X-Forwarded-For;
  // rate limits need it.
  if (process.env.VERCEL) {
    (app.getHttpAdapter().getInstance() as Express).set('trust proxy', 1);
  }
  app.enableShutdownHooks();
}
