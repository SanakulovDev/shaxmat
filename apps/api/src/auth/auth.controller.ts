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
import { ThrottlerGuard } from '@nestjs/throttler';
import type { CookieOptions, Request, Response } from 'express';
import type { Env } from '../config/env.js';
import { type AuthUser, CurrentUser, JwtAuthGuard } from './auth.guard.js';
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
  ) {}

  @Post('register')
  @UseGuards(ThrottlerGuard)
  async register(
    @Body({ schema: RegisterSchema }) dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.respond(res, await this.auth.register(dto));
  }

  @Post('login')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  async login(
    @Body({ schema: LoginSchema }) dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.respond(res, await this.auth.login(dto));
  }

  @Post('telegram')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  async telegram(
    @Body({ schema: TelegramAuthSchema }) dto: TelegramAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.respond(res, await this.auth.loginWithTelegram(dto));
  }

  @Post('guest')
  @UseGuards(ThrottlerGuard)
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
