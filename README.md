# Shaxmat

Shaxmatni noldan professional darajagacha o'rgatadigan platforma: darslar, bot bilan o'yin (10 daraja) va do'stlar bilan real vaqtda o'yin.

## Tuzilma

```
apps/api   NestJS 12 + Prisma 7 + PostgreSQL (auth, keyinchalik o'yinlar va darslar)
apps/web   React 19 + Vite + Tailwind 4 + i18next (o'zbekcha interfeys)
```

## Ishga tushirish

Talablar: Node 24, pnpm 11, Docker.

```bash
pnpm install
cp .env.example .env          # JWT_ACCESS_SECRET ni to'ldiring: openssl rand -base64 48
pnpm db:up                    # PostgreSQL (5442) va Redis (6389)
pnpm db:migrate               # migratsiyalar
pnpm dev                      # API: http://localhost:3100, web: http://localhost:5173
```

Web `/api` so'rovlarini Vite proxy orqali API ga yuboradi.

## Tekshiruvlar

```bash
pnpm lint
pnpm typecheck
pnpm test                     # unit testlar
pnpm --filter api test:e2e    # migratsiya qilingan bazani talab qiladi
```

## Auth

- Email + parol, Telegram Login Widget, mehmon rejimi.
- Access token (JWT, 15 daqiqa) faqat xotirada saqlanadi. Refresh token — `httpOnly` cookie, bir martalik, 30 kun.
- Telegram tugmasi uchun `.env` da `TELEGRAM_BOT_TOKEN` va `VITE_TELEGRAM_BOT_USERNAME` ni to'ldiring hamda @BotFather da `/setdomain` bilan domen belgilang. Widget oddiy `localhost` da ishlamaydi — lokal sinov uchun tunnel (masalan, ngrok) kerak.
