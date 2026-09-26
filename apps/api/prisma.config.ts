import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ path: '../../.env', quiet: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Optional so `prisma generate` works without a database (fresh clone, CI).
    // Migrations need a direct connection; hosted Postgres such as Neon
    // offers it as DATABASE_URL_UNPOOLED next to the pooled DATABASE_URL.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  },
});
