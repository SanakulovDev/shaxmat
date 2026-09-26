import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/postgres-adapter';
import pg from 'pg';
import type { Server, ServerOptions } from 'socket.io';

// Socket.IO adapter that shares rooms and broadcasts between API instances
// through Postgres LISTEN/NOTIFY. On Vercel every function instance holds
// its own sockets, so a move made on one instance must reach players
// connected to another.
export class PostgresIoAdapter extends IoAdapter {
  private pool: pg.Pool | null = null;

  constructor(
    app: INestApplicationContext,
    private readonly connectionString: string,
  ) {
    super(app);
  }

  override createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options);
    // One connection listens; the other publishes and cleans up.
    this.pool = new pg.Pool({ connectionString: this.connectionString, max: 2 });
    server.adapter(createAdapter(this.pool));
    return server;
  }

  override async close(server: Server): Promise<void> {
    await super.close(server);
    await this.pool?.end();
    this.pool = null;
  }
}
