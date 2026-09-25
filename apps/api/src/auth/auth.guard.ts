import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export type AccessTokenPayload = { sub: string; guest: boolean };
export type AuthUser = { id: string; isGuest: boolean };

type AuthedRequest = Request & { user?: AuthUser };

// Reads the user from an "Authorization: Bearer <token>" header, or returns
// null when the header is missing or the token is invalid.
export async function readBearerUser(
  jwt: JwtService,
  request: Request,
): Promise<AuthUser | null> {
  const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
  if (scheme !== 'Bearer' || !token) return null;
  try {
    const payload = await jwt.verifyAsync<AccessTokenPayload>(token);
    return { id: payload.sub, isGuest: payload.guest };
  } catch {
    return null;
  }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const user = await readBearerUser(this.jwt, request);
    if (!user) throw new UnauthorizedException();
    request.user = user;
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    if (!request.user) throw new UnauthorizedException();
    return request.user;
  },
);
