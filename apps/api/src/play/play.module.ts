import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { FriendsModule } from '../friends/friends.module.js';
import { RatingsModule } from '../ratings/ratings.module.js';
import { RealtimeModule } from '../realtime/realtime.module.js';
import { ChallengesController } from './challenges.controller.js';
import { ChallengesService } from './challenges.service.js';
import { PlayGateway } from './play.gateway.js';
import { NOW, type Now, PlayService } from './play.service.js';

@Module({
  imports: [AuthModule, FriendsModule, RatingsModule, RealtimeModule],
  controllers: [ChallengesController],
  providers: [
    PlayService,
    ChallengesService,
    PlayGateway,
    { provide: NOW, useValue: (() => Date.now()) satisfies Now },
  ],
  exports: [PlayService],
})
export class PlayModule {}
