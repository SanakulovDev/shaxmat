import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { z } from 'zod';
import { type AuthUser, CurrentUser, JwtAuthGuard } from '../auth/auth.guard.js';
import { FriendsService } from './friends.service.js';

const UserIdSchema = z.uuid();

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friends: FriendsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.friends.list(user.id);
  }

  @Post(':userId')
  @HttpCode(204)
  @UseGuards(ThrottlerGuard)
  async request(
    @CurrentUser() user: AuthUser,
    @Param('userId', { schema: UserIdSchema }) userId: string,
  ) {
    await this.friends.request(user, userId);
  }

  @Post(':userId/accept')
  @HttpCode(204)
  async accept(
    @CurrentUser() user: AuthUser,
    @Param('userId', { schema: UserIdSchema }) userId: string,
  ) {
    await this.friends.accept(user.id, userId);
  }

  @Delete(':userId')
  @HttpCode(204)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('userId', { schema: UserIdSchema }) userId: string,
  ) {
    await this.friends.remove(user.id, userId);
  }
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly friends: FriendsService) {}

  // Name and avatar for an invite link.
  @Get(':id')
  get(@Param('id', { schema: UserIdSchema }) id: string) {
    return this.friends.publicUser(id);
  }
}
