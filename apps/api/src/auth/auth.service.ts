import {
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  createHash,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from 'node:crypto';
import { Prisma, type User } from '../generated/prisma/client.js';
import type { Env } from '../config/env.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AccessTokenPayload } from './auth.guard.js';
import type { LoginDto, RegisterDto, TelegramAuthDto } from './auth.schemas.js';
import { hashPassword, verifyPassword } from './password.js';
import { verifyTelegramAuth } from './telegram.js';

export const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type PublicUser = Pick<
  User,
  'id' | 'email' | 'name' | 'avatarUrl' | 'isGuest'
>;

export type AuthResult = {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

@Injectable()
export class AuthService {
  // Checked when the email is unknown, so login takes the same time whether
  // or not the account exists.
  private readonly dummyPasswordHash = hashPassword(
    randomBytes(16).toString('hex'),
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  // A guest who registers keeps their account and progress.
  async register(dto: RegisterDto, guestId?: string): Promise<AuthResult> {
    const passwordHash = await hashPassword(dto.password);
    const data = { email: dto.email, passwordHash, name: dto.name };
    try {
      const user =
        (guestId && (await this.upgradeGuest(guestId, data))) ||
        (await this.prisma.user.create({ data }));
      return await this.issueTokens(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    const valid = await verifyPassword(
      dto.password,
      user?.passwordHash ?? (await this.dummyPasswordHash),
    );
    if (!user?.passwordHash || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueTokens(user);
  }

  // A known Telegram account logs in as itself. A new one becomes the
  // current guest account, if there is one, so the guest keeps their progress.
  async loginWithTelegram(
    dto: TelegramAuthDto,
    guestId?: string,
  ): Promise<AuthResult> {
    const botToken = this.config.get('TELEGRAM_BOT_TOKEN', { infer: true });
    if (!botToken) {
      throw new ServiceUnavailableException('Telegram login is not configured');
    }
    if (!verifyTelegramAuth(dto, botToken)) {
      throw new UnauthorizedException('Invalid Telegram signature');
    }

    const telegramId = BigInt(dto.id);
    const name = [dto.first_name, dto.last_name].filter(Boolean).join(' ');
    const profile = { name, avatarUrl: dto.photo_url };
    const existing = await this.prisma.user.findUnique({
      where: { telegramId },
    });
    if (existing) {
      const user = await this.prisma.user.update({
        where: { id: existing.id },
        data: profile,
      });
      return this.issueTokens(user);
    }

    const data = { ...profile, telegramId };
    const user =
      (guestId && (await this.upgradeGuest(guestId, data))) ||
      (await this.prisma.user.create({ data }));
    return this.issueTokens(user);
  }

  async createGuest(): Promise<AuthResult> {
    const user = await this.prisma.user.create({
      data: { name: `Mehmon-${randomInt(1000, 10000)}`, isGuest: true },
    });
    return this.issueTokens(user);
  }

  // Refresh tokens are single-use: the used session is deleted and a new one
  // is issued.
  async refresh(refreshToken: string): Promise<AuthResult> {
    const parsed = parseRefreshToken(refreshToken);
    if (!parsed) throw new UnauthorizedException();

    const session = await this.prisma.session.findUnique({
      where: { id: parsed.sessionId },
      include: { user: true },
    });
    if (
      !session ||
      session.expiresAt < new Date() ||
      !hashesEqual(session.secretHash, sha256(parsed.secret))
    ) {
      throw new UnauthorizedException();
    }

    const { count } = await this.prisma.session.deleteMany({
      where: { id: session.id },
    });
    // Another request already used this token.
    if (count === 0) throw new UnauthorizedException();

    return this.issueTokens(session.user);
  }

  async logout(refreshToken: string): Promise<void> {
    const parsed = parseRefreshToken(refreshToken);
    if (!parsed) return;
    await this.prisma.session.deleteMany({
      where: { id: parsed.sessionId, secretHash: sha256(parsed.secret) },
    });
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return toPublicUser(user);
  }

  // Turns a guest into a full account. Returns null when the user is gone or
  // is no longer a guest (for example, upgraded in another tab).
  private async upgradeGuest(
    guestId: string,
    data: Prisma.UserUpdateManyMutationInput,
  ): Promise<User | null> {
    const { count } = await this.prisma.user.updateMany({
      where: { id: guestId, isGuest: true },
      data: { ...data, isGuest: false },
    });
    if (count === 0) return null;
    return this.prisma.user.findUnique({ where: { id: guestId } });
  }

  private async issueTokens(user: User): Promise<AuthResult> {
    const secret = randomBytes(32).toString('base64url');
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        secretHash: sha256(secret),
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });
    const payload: AccessTokenPayload = { sub: user.id, guest: user.isGuest };
    return {
      accessToken: await this.jwt.signAsync(payload),
      refreshToken: `${session.id}.${secret}`,
      user: toPublicUser(user),
    };
  }
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    isGuest: user.isGuest,
  };
}

function parseRefreshToken(token: string) {
  const [sessionId, secret] = token.split('.');
  if (!sessionId || !secret || !UUID_PATTERN.test(sessionId)) return null;
  return { sessionId, secret };
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function hashesEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, 'hex');
  const bufferB = Buffer.from(b, 'hex');
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}
