import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3100),
  DATABASE_URL: z.url(),
  // A direct (not pooled) connection for LISTEN/NOTIFY. Defaults to
  // DATABASE_URL, which is direct in local development.
  DATABASE_URL_UNPOOLED: z.url().optional(),
  JWT_ACCESS_SECRET: z.string().min(32),
  // Optional: Telegram login is disabled when the token is empty.
  TELEGRAM_BOT_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = EnvSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
