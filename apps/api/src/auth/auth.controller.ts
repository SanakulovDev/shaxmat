import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { CookieOptions, Request, Response } from 'express';
import { RateLimitGuard } from '../common/rate-limit.guard.js';
import type { Env } from '../config/env.js';
import {
  type AuthUser,
  CurrentUser,
  JwtAuthGuard,
  readBearerUser,
} from './auth.guard.js';
import {
  type LoginDto,
  LoginSchema,
  type RegisterDto,
  RegisterSchema,
  type TelegramAuthDto,
  TelegramAuthSchema,
} from './auth.schemas.js';
import { type AuthResult, AuthService, REFRESH_TTL_MS } from './auth.service.js';

const REFRESH_COOKIE = 'refresh_token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService<Env, true>,
    private readonly jwt: JwtService,
  ) {}

  @Post('register')
  @UseGuards(RateLimitGuard)
  async register(
    @Body({ schema: RegisterSchema }) dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const guestId = await this.currentGuestId(req);
    return this.respond(res, await this.auth.register(dto, guestId));
  }

  @Post('login')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  async login(
    @Body({ schema: LoginSchema }) dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.respond(res, await this.auth.login(dto));
  }

  @Post('telegram')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  async telegram(
    @Body({ schema: TelegramAuthSchema }) dto: TelegramAuthDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const guestId = await this.currentGuestId(req);
    return this.respond(res, await this.auth.loginWithTelegram(dto, guestId));
  }

  @Post('guest')
  @UseGuards(RateLimitGuard)
  async guest(@Res({ passthrough: true }) res: Response) {
    return this.respond(res, await this.auth.createGuest());
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = readRefreshCookie(req);
    if (!token) throw new UnauthorizedException();
    return this.respond(res, await this.auth.refresh(token));
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = readRefreshCookie(req);
    if (token) await this.auth.logout(token);
    const { maxAge: _maxAge, ...options } = this.cookieOptions();
    res.clearCookie(REFRESH_COOKIE, options);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }

  private async currentGuestId(req: Request): Promise<string | undefined> {
    const user = await readBearerUser(this.jwt, req);
    return user?.isGuest ? user.id : undefined;
  }

  private respond(res: Response, result: AuthResult) {
    res.cookie(REFRESH_COOKIE, result.refreshToken, this.cookieOptions());
    return { accessToken: result.accessToken, user: result.user };
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get('NODE_ENV', { infer: true }) === 'production',
      path: '/api/auth',
      maxAge: REFRESH_TTL_MS,
    };
  }
}

function readRefreshCookie(req: Request): string | undefined {
  const value: unknown = req.cookies?.[REFRESH_COOKIE];
  return typeof value === 'string' ? value : undefined;
}
