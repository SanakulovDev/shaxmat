import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { type AuthUser, CurrentUser, JwtAuthGuard } from '../auth/auth.guard.js';
import { PuzzlesService } from './puzzles.service.js';

const NextQuerySchema = z.object({
  theme: z
    .string()
    .regex(/^[a-zA-Z0-9]{1,40}$/)
    .optional(),
});

const AttemptSchema = z.object({ solved: z.boolean() });

const PuzzleIdSchema = z.string().regex(/^[a-zA-Z0-9]{1,20}$/);

@Controller('puzzles')
@UseGuards(JwtAuthGuard)
export class PuzzlesController {
  constructor(private readonly puzzles: PuzzlesService) {}

  @Get('next')
  next(
    @CurrentUser() user: AuthUser,
    @Query({ schema: NextQuerySchema }) query: z.infer<typeof NextQuerySchema>,
  ) {
    return this.puzzles.next(user.id, query.theme);
  }

  @Post(':id/attempt')
  @HttpCode(200)
  attempt(
    @CurrentUser() user: AuthUser,
    @Param('id', { schema: PuzzleIdSchema }) id: string,
    @Body({ schema: AttemptSchema }) body: z.infer<typeof AttemptSchema>,
  ) {
    return this.puzzles.attempt(user.id, id, body.solved);
  }
}
