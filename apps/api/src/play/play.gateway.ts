import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { z } from 'zod';
import type { AccessTokenPayload, AuthUser } from '../auth/auth.guard.js';
import { FriendsService } from '../friends/friends.service.js';
import {
  gameRoom,
  RealtimeService,
  userRoom,
} from '../realtime/realtime.service.js';
import { PlayError, PlayService } from './play.service.js';

const GameRefSchema = z.object({ gameId: z.uuid() });

const GameActionSchema = z.object({
  gameId: z.uuid(),
  action: z.union([
    z.object({
      type: z.literal('move'),
      uci: z.string().regex(/^[a-h][1-8][a-h][1-8][qrbn]?$/),
    }),
    z.object({
      type: z.enum([
        'resign',
        'abort',
        'drawOffer',
        'drawAccept',
        'drawDecline',
        'takebackOffer',
        'takebackAccept',
        'takebackDecline',
      ]),
    }),
  ]),
});

const ChatSchema = z.object({
  gameId: z.uuid(),
  text: z.string().trim().min(1).max(200),
});

type Ack = { ok: true } | { error: string };

// Socket.IO entry point. The client sends its access token when it
// connects; every handler answers through the acknowledgement callback.
@WebSocketGateway({ path: '/api/socket.io', serveClient: false })
export class PlayGateway
  implements OnGatewayInit<Server>, OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket>
{
  private readonly logger = new Logger(PlayGateway.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly realtime: RealtimeService,
    private readonly play: PlayService,
    private readonly friends: FriendsService,
  ) {}

  afterInit(server: Server) {
    this.realtime.attach(server);
    server.use((socket, next) => {
      this.authenticate(socket).then(
        () => next(),
        () => next(new Error('unauthorized')),
      );
    });
  }

  private async authenticate(socket: Socket) {
    const token: unknown = socket.handshake.auth.token;
    if (typeof token !== 'string') throw new Error('No token');
    const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token);
    socket.data.user = { id: payload.sub, isGuest: payload.guest } satisfies AuthUser;
  }

  async handleConnection(socket: Socket) {
    const user = userOf(socket);
    await socket.join(userRoom(user.id));
    if (this.realtime.connected(user.id)) await this.presenceChanged(user.id);
  }

  async handleDisconnect(socket: Socket) {
    const user = socket.data.user as AuthUser | undefined;
    if (user && this.realtime.disconnected(user.id)) {
      await this.presenceChanged(user.id);
    }
  }

  private async presenceChanged(userId: string) {
    for (const id of await this.friends.friendIds(userId)) {
      this.realtime.toUser(id, 'friends:changed');
    }
  }

  // Subscribes to a game's updates and returns its current state. Anyone may
  // watch; only the players can act.
  @SubscribeMessage('game:join')
  async join(@ConnectedSocket() socket: Socket, @MessageBody() body: unknown) {
    const parsed = GameRefSchema.safeParse(body);
    if (!parsed.success) return { error: 'invalid' };
    const { gameId } = parsed.data;
    try {
      await this.play.settle(gameId);
      const state = await this.play.view(gameId);
      await socket.join(gameRoom(gameId));
      const chat = await this.play.chatFor(gameId, userOf(socket).id);
      return { state, chat };
    } catch (error) {
      return this.fail(error);
    }
  }

  @SubscribeMessage('game:leave')
  async leave(@ConnectedSocket() socket: Socket, @MessageBody() body: unknown) {
    const parsed = GameRefSchema.safeParse(body);
    if (parsed.success) await socket.leave(gameRoom(parsed.data.gameId));
    return { ok: true };
  }

  @SubscribeMessage('game:action')
  async action(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: unknown,
  ): Promise<Ack> {
    const parsed = GameActionSchema.safeParse(body);
    if (!parsed.success) return { error: 'invalid' };
    const { gameId, action } = parsed.data;
    try {
      await this.play.act(userOf(socket).id, gameId, action);
      return { ok: true };
    } catch (error) {
      return this.fail(error);
    }
  }

  // A client whose clock shows zero asks the server to check.
  @SubscribeMessage('game:flag')
  async flag(@MessageBody() body: unknown): Promise<Ack> {
    const parsed = GameRefSchema.safeParse(body);
    if (!parsed.success) return { error: 'invalid' };
    try {
      await this.play.settle(parsed.data.gameId);
      return { ok: true };
    } catch (error) {
      return this.fail(error);
    }
  }

  @SubscribeMessage('game:chat')
  async chat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: unknown,
  ): Promise<Ack> {
    const parsed = ChatSchema.safeParse(body);
    if (!parsed.success) return { error: 'invalid' };
    try {
      await this.play.chat(userOf(socket).id, parsed.data.gameId, parsed.data.text);
      return { ok: true };
    } catch (error) {
      return this.fail(error);
    }
  }

  private fail(error: unknown): { error: string } {
    if (error instanceof PlayError) return { error: error.code };
    this.logger.error(error);
    return { error: 'server' };
  }
}

// The middleware rejects connections without a valid token, so every
// connected socket has a user.
function userOf(socket: Socket): AuthUser {
  return socket.data.user as AuthUser;
}
