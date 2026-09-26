import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { RealtimeModule } from '../realtime/realtime.module.js';
import { FriendsController, UsersController } from './friends.controller.js';
import { FriendsService } from './friends.service.js';

@Module({
  imports: [AuthModule, RealtimeModule],
  controllers: [FriendsController, UsersController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
