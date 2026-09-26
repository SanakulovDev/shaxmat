import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

export const userRoom = (userId: string) => `user:${userId}`;
export const gameRoom = (gameId: string) => `game:${gameId}`;

// Sends socket events from any service and tracks who is online. Presence is
// kept in memory, so it covers one API process.
@Injectable()
export class RealtimeService {
  private server: Server | null = null;
  private readonly connections = new Map<string, number>();

  attach(server: Server) {
    this.server = server;
  }

  toUser(userId: string, event: string, payload?: unknown) {
    this.server?.to(userRoom(userId)).emit(event, payload);
  }

  toGame(gameId: string, event: string, payload?: unknown) {
    this.server?.to(gameRoom(gameId)).emit(event, payload);
  }

  // Returns true when this is the user's first open connection.
  connected(userId: string): boolean {
    const count = (this.connections.get(userId) ?? 0) + 1;
    this.connections.set(userId, count);
    return count === 1;
  }

  // Returns true when the user's last connection closed.
  disconnected(userId: string): boolean {
    const count = (this.connections.get(userId) ?? 1) - 1;
    if (count > 0) {
      this.connections.set(userId, count);
      return false;
    }
    this.connections.delete(userId);
    return true;
  }

  isOnline(userId: string): boolean {
    return this.connections.has(userId);
  }
}
