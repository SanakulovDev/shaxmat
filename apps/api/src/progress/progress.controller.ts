import {
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { findLesson } from '@shaxmat/content';
import { z } from 'zod';
import { type AuthUser, CurrentUser, JwtAuthGuard } from '../auth/auth.guard.js';
import { ProgressService } from './progress.service.js';

const LessonSlugSchema = z
  .string()
  .refine((slug) => findLesson(slug) !== undefined, 'Unknown lesson');

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get()
  summary(@CurrentUser() user: AuthUser) {
    return this.progress.summary(user.id);
  }

  @Put('lessons/:slug')
  @HttpCode(204)
  async completeLesson(
    @CurrentUser() user: AuthUser,
    @Param('slug', { schema: LessonSlugSchema }) slug: string,
  ) {
    await this.progress.completeLesson(user.id, slug);
  }
}
