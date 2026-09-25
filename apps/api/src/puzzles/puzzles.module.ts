import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { RatingsModule } from '../ratings/ratings.module.js';
import { PuzzlesController } from './puzzles.controller.js';
import { PuzzlesService } from './puzzles.service.js';

@Module({
  imports: [AuthModule, RatingsModule],
  controllers: [PuzzlesController],
  providers: [PuzzlesService],
})
export class PuzzlesModule {}
