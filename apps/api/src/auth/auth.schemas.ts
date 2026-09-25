import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(2).max(50),
});
export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  password: z.string().min(1).max(128),
});
export type LoginDto = z.infer<typeof LoginSchema>;

// Loose: the signature covers every field Telegram sends, including ones
// this schema does not name, so unknown keys must be kept.
export const TelegramAuthSchema = z.looseObject({
  id: z.number().int().positive(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.url().optional(),
  auth_date: z.number().int().positive(),
  hash: z.string().regex(/^[a-f0-9]{64}$/),
});
export type TelegramAuthDto = z.infer<typeof TelegramAuthSchema>;
