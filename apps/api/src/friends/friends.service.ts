import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthUser } from '../auth/auth.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RealtimeService } from '../realtime/realtime.service.js';

export type PublicUser = {
  id: string;
  name: string;
  avatarUrl: string | null;
  isGuest: boolean;
};

const PUBLIC_USER = {
  id: true,
  name: true,
  avatarUrl: true,
  isGuest: true,
} as const;

// Friends are registered users only: a guest account has no name to find
// and may disappear with a cleared browser.
@Injectable()
export class FriendsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  async publicUser(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: PUBLIC_USER,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async list(userId: string) {
    const rows = await this.prisma.friendship.findMany({
      where: { OR: [{ requesterId: userId }, { addresseeId: userId }] },
      include: {
        requester: { select: PUBLIC_USER },
        addressee: { select: PUBLIC_USER },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const friends = [];
    const incoming = [];
    const outgoing = [];
    for (const row of rows) {
      const mine = row.requesterId === userId;
      const other = mine ? row.addressee : row.requester;
      if (row.status === 'accepted') {
        friends.push({ ...other, online: this.realtime.isOnline(other.id) });
      } else if (mine) {
        outgoing.push(other);
      } else {
        incoming.push(other);
      }
    }
    // Online friends first; the query order keeps recent ones on top.
    friends.sort((a, b) => Number(b.online) - Number(a.online));
    return { friends, incoming, outgoing };
  }

  // Sends a request, or accepts the other user's pending request.
  async request(user: AuthUser, targetId: string) {
    if (user.isGuest) throw new ForbiddenException('registrationRequired');
    if (targetId === user.id) throw new BadRequestException('Cannot add yourself');
    const target = await this.publicUser(targetId);
    if (target.isGuest) throw new BadRequestException('Guests cannot have friends');

    const reverse = await this.prisma.friendship.findUnique({
      where: {
        requesterId_addresseeId: { requesterId: targetId, addresseeId: user.id },
      },
    });
    if (reverse) {
      if (reverse.status === 'pending') await this.accept(user.id, targetId);
      return;
    }
    await this.prisma.friendship.upsert({
      where: {
        requesterId_addresseeId: { requesterId: user.id, addresseeId: targetId },
      },
      create: { requesterId: user.id, addresseeId: targetId },
      update: {},
    });
    this.changed(user.id, targetId);
  }

  async accept(userId: string, requesterId: string) {
    const { count } = await this.prisma.friendship.updateMany({
      where: { requesterId, addresseeId: userId, status: 'pending' },
      data: { status: 'accepted' },
    });
    if (count === 0) throw new NotFoundException('No such request');
    this.changed(userId, requesterId);
  }

  // Removes a friend, declines a request or cancels one.
  async remove(userId: string, otherId: string) {
    await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { requesterId: userId, addresseeId: otherId },
          { requesterId: otherId, addresseeId: userId },
        ],
      },
    });
    this.changed(userId, otherId);
  }

  async areFriends(a: string, b: string): Promise<boolean> {
    const count = await this.prisma.friendship.count({
      where: {
        status: 'accepted',
        OR: [
          { requesterId: a, addresseeId: b },
          { requesterId: b, addresseeId: a },
        ],
      },
    });
    return count > 0;
  }

  async friendIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.friendship.findMany({
      where: {
        status: 'accepted',
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      select: { requesterId: true, addresseeId: true },
    });
    return rows.map((row) =>
      row.requesterId === userId ? row.addresseeId : row.requesterId,
    );
  }

  // Tells both users' open pages to reload their friend lists.
  private changed(...userIds: string[]) {
    for (const id of userIds) this.realtime.toUser(id, 'friends:changed');
  }
}
