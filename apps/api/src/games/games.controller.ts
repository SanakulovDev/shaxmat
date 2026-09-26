import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { type AuthUser, CurrentUser, JwtAuthGuard } from '../auth/auth.guard.js';
import { PlayError, PlayService } from '../play/play.service.js';
import { type SaveBotGameDto, SaveBotGameSchema } from './games.schemas.js';
import { GamesService } from './games.service.js';

@Controller('games')
@UseGuards(JwtAuthGuard)
export class GamesController {
  constructor(
    private readonly games: GamesService,
    private readonly play: PlayService,
  ) {}

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

  // Declared after the fixed paths above, so "recent" is not read as an id.
  @Get(':id')
  async get(@Param('id', { schema: z.uuid() }) id: string) {
    try {
      await this.play.settle(id);
      return await this.play.view(id);
    } catch (error) {
      if (error instanceof PlayError && error.code === 'notFound') {
        throw new NotFoundException('Game not found');
      }
      throw error;
    }
  }
}
