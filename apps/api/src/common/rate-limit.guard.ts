import {
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

const WINDOW_MS = 60_000;
const LIMIT = 20;
// Expired windows are dropped once the map grows past this size.
const SWEEP_AT = 10_000;

// At most LIMIT requests per client address and route per minute. Counts
// are kept in memory, so each API instance limits on its own. Replaces
// @nestjs/throttler, a CommonJS package that cannot load the ESM-only
// @nestjs/common v12 on Vercel's Node runtime.
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly windows = new Map<string, { count: number; resetAt: number }>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const route = `${context.getClass().name}.${context.getHandler().name}`;
    const key = `${request.ip ?? 'unknown'}|${route}`;
    const now = Date.now();

    const window = this.windows.get(key);
    if (!window || window.resetAt <= now) {
      if (this.windows.size >= SWEEP_AT) this.sweep(now);
      this.windows.set(key, { count: 1, resetAt: now + WINDOW_MS });
      return true;
    }
    window.count += 1;
    if (window.count > LIMIT) {
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }

  private sweep(now: number) {
    for (const [key, window] of this.windows) {
      if (window.resetAt <= now) this.windows.delete(key);
    }
  }
}
