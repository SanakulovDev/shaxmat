import { TIME_CONTROL_IDS } from '@shaxmat/chess-core';
import { z } from 'zod';

const NewChallengeSchema = z.object({
  timeControl: z.enum(TIME_CONTROL_IDS),
  // The creator's colour.
  color: z.enum(['white', 'black', 'random']),
  rated: z.boolean(),
  // Invite one friend instead of making a link anyone can open.
  friendId: z.uuid().optional(),
});

// Same opponent and time control as a finished game, colours swapped.
const RematchSchema = z.object({ rematchOf: z.uuid() });

export const CreateChallengeSchema = z.union([NewChallengeSchema, RematchSchema]);
export type CreateChallengeDto = z.infer<typeof CreateChallengeSchema>;

export const ChallengeCodeSchema = z.string().regex(/^[A-Za-z0-9]{8}$/);
