import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import type { Server } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service.js';

export const userRoom = (userId: string) => `user:${userId}`;
export const gameRoom = (gameId: string) => `game:${gameId}`;

const HEARTBEAT_MS = 30_000;
// A user counts as online for this long after the last heartbeat.
const ONLINE_WINDOW_MS = 75_000;

export function isOnline(lastSeenAt: Date | null, now = Date.now()): boolean {
  return lastSeenAt !== null && now - lastSeenAt.getTime() < ONLINE_WINDOW_MS;
}

// Sends socket events from any service and keeps presence. Events reach
// every API instance through the Socket.IO adapter. Presence lives in the
// database: each instance refreshes `lastSeenAt` for the users it holds
// sockets for, because a user's sockets may sit on several instances.
@Injectable()
export class RealtimeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RealtimeService.name);
  private server: Server | null = null;
  // Open sockets per user on this instance.
  private readonly connections = new Map<string, number>();
  private heartbeat: NodeJS.Timeout | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.heartbeat = setInterval(() => void this.beat(), HEARTBEAT_MS);
    this.heartbeat.unref();
  }

  onModuleDestroy() {
    if (this.heartbeat) clearInterval(this.heartbeat);
  }

  attach(server: Server) {
    this.server = server;
  }

  toUser(userId: string, event: string, payload?: unknown) {
    this.server?.to(userRoom(userId)).emit(event, payload);
  }

  toGame(gameId: string, event: string, payload?: unknown) {
    this.server?.to(gameRoom(gameId)).emit(event, payload);
  }

  // Marks the user online. Returns true when they were offline before.
  async connected(userId: string): Promise<boolean> {
    this.connections.set(userId, (this.connections.get(userId) ?? 0) + 1);
    const before = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastSeenAt: true },
    });
    await this.prisma.user.updateMany({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });
    return !isOnline(before?.lastSeenAt ?? null);
  }

  // Returns true when the user's last socket on this instance closed. If
  // they still have a socket elsewhere, that instance's next heartbeat
  // shows them online again.
  async disconnected(userId: string): Promise<boolean> {
    const count = (this.connections.get(userId) ?? 1) - 1;
    if (count > 0) {
      this.connections.set(userId, count);
      return false;
    }
    this.connections.delete(userId);
    await this.prisma.user.updateMany({
      where: { id: userId },
      data: { lastSeenAt: null },
    });
    return true;
  }

  private async beat() {
    const ids = [...this.connections.keys()];
    if (ids.length === 0) return;
    try {
      await this.prisma.user.updateMany({
        where: { id: { in: ids } },
        data: { lastSeenAt: new Date() },
      });
    } catch (error) {
      this.logger.error('Presence heartbeat failed', error);
    }
  }
}
