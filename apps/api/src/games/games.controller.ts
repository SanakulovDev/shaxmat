import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { type AuthUser, CurrentUser, JwtAuthGuard } from '../auth/auth.guard.js';
import { type SaveBotGameDto, SaveBotGameSchema } from './games.schemas.js';
import { GamesService } from './games.service.js';

@Controller('games')
@UseGuards(JwtAuthGuard)
export class GamesController {
  constructor(private readonly games: GamesService) {}

  @Post('bot')
  saveBotGame(
    @CurrentUser() user: AuthUser,
    @Body({ schema: SaveBotGameSchema }) dto: SaveBotGameDto,
  ) {
    return this.games.saveBotGame(user.id, dto);
  }

  @Get('recent')
  recent(@CurrentUser() user: AuthUser) {
    return this.games.recent(user.id);
  }
}
