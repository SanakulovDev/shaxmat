import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { validateEnv } from './config/env.js';
import { FriendsModule } from './friends/friends.module.js';
import { GamesModule } from './games/games.module.js';
import { HealthController } from './health.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { PlayModule } from './play/play.module.js';
import { ProgressModule } from './progress/progress.module.js';
import { PuzzlesModule } from './puzzles/puzzles.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env'],
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    GamesModule,
    PuzzlesModule,
    ProgressModule,
    FriendsModule,
    PlayModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
