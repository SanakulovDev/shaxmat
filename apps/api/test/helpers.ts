import { INestApplication } from '@nestjs/common';
import { Test, type TestingModuleBuilder } from '@nestjs/testing';
import type { AddressInfo } from 'node:net';
import { io, type Socket } from 'socket.io-client';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/setup-app.js';

export async function createTestApp(
  configure: (builder: TestingModuleBuilder) => TestingModuleBuilder = (b) => b,
): Promise<INestApplication> {
  const moduleRef = await configure(
    Test.createTestingModule({ imports: [AppModule] }),
  ).compile();
  const app = moduleRef.createNestApplication();
  setupApp(app);
  await app.init();
  return app;
}

export type TestSession = {
  accessToken: string;
  user: { id: string; isGuest: boolean; name: string };
};

export async function createGuest(app: INestApplication) {
  const response = await request(app.getHttpServer())
    .post('/api/auth/guest')
    .expect(201);
  return response.body as TestSession;
}

export async function registerUser(app: INestApplication, name: string) {
  const response = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({
      name,
      email: `${name.toLowerCase()}-${crypto.randomUUID()}@example.com`,
      password: 'correct horse battery',
    })
    .expect(201);
  return response.body as TestSession;
}

// Sockets need a listening server; supertest alone does not open a port.
export async function listen(app: INestApplication): Promise<string> {
  await app.listen(0);
  const { port } = app.getHttpServer().address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}

export async function connect(url: string, token: string): Promise<Socket> {
  const socket = io(url, {
    path: '/api/socket.io',
    auth: { token },
    transports: ['websocket'],
    forceNew: true,
  });
  await new Promise<void>((resolve, reject) => {
    socket.once('connect', resolve);
    socket.once('connect_error', (error) => {
      socket.disconnect();
      reject(error);
    });
  });
  return socket;
}

// Emits an event and waits for the server's acknowledgement.
export function ask<T = unknown>(
  socket: Socket,
  event: string,
  payload: unknown,
): Promise<T> {
  return socket.timeout(5_000).emitWithAck(event, payload) as Promise<T>;
}

// Resolves with the next event of this name that matches.
export function next<T>(
  socket: Socket,
  event: string,
  match: (payload: T) => boolean = () => true,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`No ${event} event`)),
      5_000,
    );
    const listener = (payload: T) => {
      if (!match(payload)) return;
      clearTimeout(timer);
      socket.off(event, listener);
      resolve(payload);
    };
    socket.on(event, listener);
  });
}
