import { NestFactory } from '@nestjs/core';
import type { Server } from 'node:http';
import { AppModule } from './app.module.js';
import { setupApp } from './setup-app.js';

// Entry for Vercel Functions: the platform takes the HTTP server and feeds
// it requests and WebSocket upgrades, so the app is initialised but never
// listens on a port itself.
export async function createServer(): Promise<Server> {
  const app = await NestFactory.create(AppModule);
  setupApp(app);
  await app.init();
  return app.getHttpServer() as Server;
}
