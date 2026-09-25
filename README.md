# Shaxmat

Shaxmatni noldan professional darajagacha o'rgatadigan platforma: ovozli interaktiv darslar, taktik masalalar, 10 darajali bot va (keyingi fazada) do'stlar bilan real vaqtda o'yin.

## Tuzilma

```
apps/api              NestJS 12 + Prisma 7 + PostgreSQL: auth, o'yinlar, masalalar, progress
apps/web              React 19 + Vite + Tailwind 4: interfeys (o'zbek, rus, ingliz)
packages/chess-core   bot darajalari, Glicko-2 reyting, o'yin natijasi (web va api uchun umumiy)
packages/content      darslar, bosqichlar, dars validatori, audio generatori
```

## Ishga tushirish

Talablar: Node 24, pnpm 11, Docker.

```bash
pnpm install                  # umumiy paketlarni ham build qiladi
cp .env.example .env          # JWT_ACCESS_SECRET ni to'ldiring: openssl rand -base64 48
pnpm db:up                    # PostgreSQL (5442) va Redis (6389)
pnpm db:migrate               # migratsiyalar
pnpm --filter api puzzles:import -- --limit 50000   # Lichess masalalari (CC0)
pnpm dev                      # API: http://localhost:3100, web: http://localhost:5173
```

## Imkoniyatlar

- **O'rganish** (`/learn`): 0–1-bosqich, 23 ta dars. Qadam turlari: tushuntirish, test, yurish vazifasi, yulduz yig'ish, botga qarshi mat qilish mashqi, mavzuli masalalar. Har bosqich oxirida imtihon: botni yutish va masala yechish.
- **Uch til**: o'zbek (asosiy), rus, ingliz. Interfeys matnlari `apps/web/src/i18n/*.json` da, darslar tarjimasi `packages/content/src/translations/` da. Testlar har bir tilda kalitlar, qadamlar va javob variantlari to'liq ekanini tekshiradi.
- **Ovozli tushuntirish**: har bir dars matnini tanlangan tilda o'qib beradi. Yozuvlarni generatsiya qilish uchun `.env` ga Azure Speech kalitini qo'ying va `pnpm content:audio` ni ishga tushiring (`-- --dry-run` belgilar sonini ko'rsatadi, `-- --lang ru` bitta til uchun). Fayllar `apps/web/public/audio/` ga yoziladi; matn o'zgarsa, faqat o'sha qism qayta yoziladi. Rus va ingliz tillari uchun yozuv bo'lmasa, brauzer ovozi ishlatiladi.
- **Bot bilan o'yin** (`/bot`): 10 daraja. Stockfish 19 Lite brauzerda Web Worker ichida ishlaydi (`apps/web/public/stockfish`, GPL-3.0).
- **Masalalar** (`/puzzles`): Lichess bazasidan, mavzu bo'yicha filtr, Glicko-2 reyting.
- **Profil** (`/profile`): reyting, darslar, bosqichlar, so'nggi o'yinlar.
- **Auth**: email + parol, Telegram, mehmon rejimi. Mehmon ro'yxatdan o'tsa, progressi saqlanib qoladi.

## Yangi dars qo'shish

Darslar `packages/content/src/lessons/stageN.ts` fayllarida (o'zbekcha), tarjimalari `packages/content/src/translations/ru.ts` va `en.ts` da. `pnpm --filter @shaxmat/content test` har bir FEN, yechim va yulduzni `chess.js` bilan tekshiradi va tarjimada har bir dars hamda qadam borligini tekshiradi.

## Tekshiruvlar

```bash
pnpm lint
pnpm typecheck
pnpm test                     # unit testlar
pnpm --filter api test:e2e    # migratsiya qilingan bazani talab qiladi
```

## Telegram orqali kirish

`.env` da `TELEGRAM_BOT_TOKEN` va `VITE_TELEGRAM_BOT_USERNAME` ni to'ldiring, @BotFather da `/setdomain` bilan domen belgilang. Widget oddiy `localhost` da ishlamaydi — lokal sinov uchun tunnel (masalan, ngrok) kerak.
