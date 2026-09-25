import { MAX_BOT_LEVEL, MIN_BOT_LEVEL } from '@shaxmat/chess-core';
import { z } from 'zod';

export const SaveBotGameSchema = z.object({
  level: z.number().int().min(MIN_BOT_LEVEL).max(MAX_BOT_LEVEL),
  color: z.enum(['white', 'black']),
  pgn: z.string().max(20_000),
  // The player resigned. Otherwise the PGN must end in a finished position.
  resigned: z.boolean(),
});
export type SaveBotGameDto = z.infer<typeof SaveBotGameSchema>;
