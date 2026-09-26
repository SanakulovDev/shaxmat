import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { type AuthUser, CurrentUser, JwtAuthGuard } from '../auth/auth.guard.js';
import { RateLimitGuard } from '../common/rate-limit.guard.js';
import {
  ChallengeCodeSchema,
  type CreateChallengeDto,
  CreateChallengeSchema,
} from './challenges.schemas.js';
import { ChallengesService } from './challenges.service.js';

@Controller('challenges')
@UseGuards(JwtAuthGuard)
export class ChallengesController {
  constructor(private readonly challenges: ChallengesService) {}

  @Post()
  @UseGuards(RateLimitGuard)
  create(
    @CurrentUser() user: AuthUser,
    @Body({ schema: CreateChallengeSchema }) dto: CreateChallengeDto,
  ) {
    return this.challenges.create(user, dto);
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.challenges.list(user.id);
  }

  @Get(':code')
  get(@Param('code', { schema: ChallengeCodeSchema }) code: string) {
    return this.challenges.get(code);
  }

  @Post(':code/accept')
  @HttpCode(200)
  accept(
    @CurrentUser() user: AuthUser,
    @Param('code', { schema: ChallengeCodeSchema }) code: string,
  ) {
    return this.challenges.accept(user, code);
  }

  @Post(':code/decline')
  @HttpCode(204)
  async decline(
    @CurrentUser() user: AuthUser,
    @Param('code', { schema: ChallengeCodeSchema }) code: string,
  ) {
    await this.challenges.decline(user.id, code);
  }

  @Delete(':code')
  @HttpCode(204)
  async cancel(
    @CurrentUser() user: AuthUser,
    @Param('code', { schema: ChallengeCodeSchema }) code: string,
  ) {
    await this.challenges.cancel(user.id, code);
  }
}
