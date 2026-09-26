import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PlayModule } from '../play/play.module.js';
import { GamesController } from './games.controller.js';
import { GamesService } from './games.service.js';

@Module({
  imports: [AuthModule, PlayModule],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
