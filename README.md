# ChessLive

Shaxmatni noldan professional darajagacha o'rgatadigan bepul platforma. Ovozli interaktiv darslar, taktik masalalar va 10 darajali bot bor. Do'st bilan real vaqtda o'ynash va katta turnirlarni jonli kuzatish ham mumkin.

**Sayt:** [chesslive.uz](https://chesslive.uz) · Tillar: o'zbek (asosiy), rus, ingliz

## Mundarija

- [Imkoniyatlar](#imkoniyatlar)
- [Texnologiyalar](#texnologiyalar)
- [Tuzilma](#tuzilma)
- [Ishga tushirish](#ishga-tushirish)
- [Muhit o'zgaruvchilari](#muhit-ozgaruvchilari)
- [Buyruqlar](#buyruqlar)
- [Yangi dars qo'shish](#yangi-dars-qoshish)
- [Deploy (Vercel)](#deploy-vercel)
- [Telegram orqali kirish](#telegram-orqali-kirish)
- [Ma'lumot manbalari va litsenziyalar](#malumot-manbalari-va-litsenziyalar)

## Imkoniyatlar

### O'rganish — `/learn`

- 0–1-bosqichlar, 23 ta dars.
- Qadam turlari: tushuntirish, test, yurish vazifasi, yulduz yig'ish, botga qarshi mat qilish mashqi, mavzuli masalalar.
- Har bosqich oxirida imtihon bor: botni yutish va masalalarni yechish.
- Ovozli tushuntirish: dars matni tanlangan tilda o'qib beriladi (Azure Speech yozuvlari). Yozuv bo'lmasa, brauzer ovozi ishlatiladi.

### Bot bilan o'yin — `/bot`

- 10 daraja: yangi boshlovchidan professionalgacha.
- Stockfish 19 Lite brauzerda, Web Worker ichida ishlaydi. Serverga yuk tushmaydi.
- Past darajalar odamga o'xshab xato qiladi: dvigatel eng yaxshi bir nechta yurishni topadi, bot ular orasidan tasodifiy tanlaydi.

### Masalalar — `/puzzles`

- Lichess bazasidagi masalalar, mavzu bo'yicha filtr (vilka, bog'lash, 1–2 yurishda mat va boshqalar).
- Glicko-2 reyting: har bir masala birinchi urinishda baholanadi.

### Do'st bilan o'yin — `/play`

- Taklif havolasi (`/c/:code`, Telegramda ulashish mumkin) yoki do'stni to'g'ridan-to'g'ri chaqirish.
- 6 ta vaqt nazorati (1+0 dan 30+0 gacha), rang tanlash, reytingli yoki o'rtoqlik o'yini.
- O'yinni server boshqaradi. Har bir yurish serverda tekshiriladi, soat serverda hisoblanadi. Vaqt tugasa, o'yin tugaydi. Birinchi yurish 30 soniya ichida qilinmasa, o'yin bekor bo'ladi.
- Durang taklifi, yurishni qaytarish, taslim bo'lish, revansh, tomosha qilish (`/game/:id`), do'stlar o'rtasida chat.

### Partiyalar — `/games`

- Jonli turnirlar Lichess broadcast'laridan olinadi. Yetakchi taxtalarda soat har soniyada yuradi. Pozitsiya har 10–20 soniyada yangilanadi.
- Har bir partiya uchun tahlil sahifasi bor. Stockfish brauzerda baho beradi. Baho chizig'i va grafik kim qancha ustunligini ko'rsatadi.
- Yurishlar baholanadi: noaniqlik (?!), xato (?) va qo'pol xato (??). Har bir tomonning aniqlik foizi hisoblanadi. Formulalar Lichess'nikiga mos.
- 8 ta klassik partiya bor: "Opera partiyasi" (Morfi, 1858), "O'lmas partiya" (Anderssen, 1851), "Asr partiyasi" (Fisher, 1956), Kasparov–Topalov (1999), Abdusattorov–Karuana (2026) va boshqalar.

### Profil va do'stlar

- Profil (`/profile`): reytinglar, darslar, bosqichlar, so'nggi o'yinlar. Har bir o'yinni qayta ko'rish mumkin.
- Do'stlar: shaxsiy havola (`/friends/add/:id`) orqali qo'shiladi. O'yindan keyin raqibni ham qo'shish mumkin. Kim onlayn ekani ko'rinadi.
- Reytingli o'yinlar faqat ro'yxatdan o'tganlar o'rtasida bo'ladi. Glicko-2 reyting bullet, blitz, rapid va classical uchun alohida.

### Kirish

- Email va parol, Telegram yoki mehmon rejimi.
- Mehmon ro'yxatdan o'tsa, progressi saqlanib qoladi.

## Texnologiyalar

| Qism | Texnologiya |
|---|---|
| Web | React 19, Vite 8, Tailwind CSS 4, React Router 8, TanStack Query, Zustand, react-i18next |
| Taxta va qoidalar | react-chessboard, chess.js |
| Dvigatel | Stockfish 19 Lite (WASM, Web Worker) |
| API | NestJS 12, Prisma 7, PostgreSQL, Socket.IO |
| Umumiy mantiq | `@shaxmat/chess-core`: bot darajalari, Glicko-2, soat, o'yin tahlili |
| Sifat | TypeScript, Vitest, oxlint |
| Hosting | Vercel (statik web + bitta Function), Neon Postgres |

## Tuzilma

```
apps/
  web/                 React ilova (uz, ru, en)
    src/features/      learn, bot, puzzles, play, games, profile, home
    src/i18n/          interfeys matnlari
    public/stockfish/  Stockfish 19 Lite (GPL-3.0)
  api/                 NestJS API
    src/               auth, friends, games, play, progress, puzzles, ratings, realtime
    prisma/            sxema va migratsiyalar
    scripts/           masalalar importi, Vercel bundle
packages/
  chess-core/          web va api uchun umumiy: bot, rating (Glicko-2), play (soat), game, analysis
  content/             darslar, bosqichlar, tarjimalar, dars validatori, audio generatori
api/index.js           Vercel Function kirish nuqtasi
docker-compose.yml     lokal PostgreSQL va Redis
vercel.json            deploy sozlamalari
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

Web dev server `/api` so'rovlarini `localhost:3100` ga uzatadi. Masalalar, profil, do'stlar va do'st bilan o'yin uchun API ishlab turishi kerak. Faqat web'ni ishga tushirsangiz (`pnpm --filter web dev`), bot, darslar va partiyalar ishlaydi, lekin API'ga bog'liq sahifalar xato ko'rsatadi.

## Muhit o'zgaruvchilari

Hammasi repo ildizidagi bitta `.env` faylida. Namuna: `.env.example`.

| O'zgaruvchi | Kerakmi | Vazifasi |
|---|---|---|
| `DATABASE_URL` | ha | PostgreSQL ulanishi |
| `DATABASE_URL_UNPOOLED` | faqat Neon | To'g'ridan-to'g'ri ulanish: migratsiyalar va Socket.IO LISTEN/NOTIFY uchun |
| `JWT_ACCESS_SECRET` | ha | Access token kaliti (`openssl rand -base64 48`) |
| `PORT` | yo'q | API porti, standart qiymati 3100 |
| `TELEGRAM_BOT_TOKEN` | yo'q | Telegram orqali kirish. Bo'sh bo'lsa, o'chiq |
| `VITE_TELEGRAM_BOT_USERNAME` | yo'q | Bot nomi, `@` siz. Bo'sh bo'lsa, Telegram tugmasi ko'rinmaydi |
| `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` | yo'q | Dars ovozlarini generatsiya qilish (`pnpm content:audio`) |
| `AZURE_SPEECH_VOICE_UZ/RU/EN` | yo'q | Har bir til uchun ovoz |

## Buyruqlar

```bash
pnpm dev                      # hamma qism watch rejimida
pnpm lint                     # oxlint
pnpm typecheck
pnpm test                     # unit testlar
pnpm --filter api test:e2e    # migratsiya qilingan bazani talab qiladi
pnpm build
pnpm content:audio            # dars ovozlari: -- --dry-run belgilar sonini ko'rsatadi, -- --lang ru bitta til uchun
```

Ovoz fayllari `apps/web/public/audio/` ga yoziladi. Matn o'zgarsa, faqat o'sha qism qayta yoziladi.

## Yangi dars qo'shish

1. Darsni `packages/content/src/lessons/stageN.ts` ga o'zbekcha yozing.
2. Tarjimasini `packages/content/src/translations/ru.ts` va `en.ts` ga qo'shing.
3. `pnpm --filter @shaxmat/content test` ni ishga tushiring. Test har bir FEN, yechim va yulduzni `chess.js` bilan tekshiradi. Har bir tarjimada har bir dars va qadam borligini ham tekshiradi.
4. Ovoz kerak bo'lsa, `pnpm content:audio` ni ishga tushiring.

Interfeys matnlari `apps/web/src/i18n/{uz,ru,en}.json` da. Testlar uchala tilda kalitlar to'liq ekanini tekshiradi.

## Deploy (Vercel)

Bitta Vercel loyihasi ishlatiladi. Web statik fayl sifatida beriladi (`apps/web/dist`). API bitta Vercel Function sifatida ishlaydi (`api/index.js`). Sozlamalar `vercel.json` da.

- **Build.** API esbuild bilan bitta faylga yig'iladi: `apps/api/scripts/bundle-vercel.mjs` natijasi `apps/api/dist-vercel/server.mjs`. Sababi ikkita. Vercel fayl kuzatuvi Nest'ning ixtiyoriy dinamik importlarini (WebSocket gateway) topmaydi. Nest yuklovchisi esa ES modullarni `require()` qila olmaydi.
- **Baza.** Neon (Vercel Storage). Vercel `DATABASE_URL` (pooler) va `DATABASE_URL_UNPOOLED` ni o'zi qo'shadi. Production build'da `prisma migrate deploy` ishlaydi.
- **Qo'shimcha env.** `JWT_ACCESS_SECRET`, `ENABLE_EXPERIMENTAL_COREPACK=1` (pnpm 11 uchun), `NODE_ENV=production`, Telegram o'zgaruvchilari.
- **Deploy tartibi.** Loyiha GitHub'ga ulangan: `main` ga push production'ni yangilaydi. Boshqa branch'lar deploy qilinmaydi (`vercel.json` dagi `git.deploymentEnabled`), chunki preview va production bitta bazadan foydalanadi. Qo'lda deploy qilsangiz, faqat `vercel deploy --prod` ishlating. CLI `.vercelignore` bo'yicha faqat manba kodni yuklaydi.
- **Real vaqt.** Socket.IO faqat WebSocket orqali ishlaydi. Har bir function instance o'z ulanishlarini ushlaydi. Xabarlar instance'lar orasida Postgres LISTEN/NOTIFY (`@socket.io/postgres-adapter`) orqali uzatiladi. Onlayn holat va chat bazada saqlanadi. Ulanish function vaqt limitida (300 s) uziladi va client o'zi qayta ulanadi.
- **Masalalar.** Production bazaga yuklash: `DATABASE_URL=... pnpm --filter api puzzles:import`.
- **Domen.** `chesslive.uz` (Let's Encrypt sertifikati, Vercel o'zi yangilaydi). `www` va `http` so'rovlari `https://chesslive.uz` ga yo'naltiriladi.

## Telegram orqali kirish

1. @BotFather da bot yarating va tokenini oling.
2. `.env` (yoki Vercel env) ga `TELEGRAM_BOT_TOKEN` va `VITE_TELEGRAM_BOT_USERNAME` ni yozing.
3. @BotFather da `/setdomain` buyrug'i bilan saytning domenini belgilang (production uchun `chesslive.uz`).

Server Telegram yuborgan ma'lumot imzosini bot tokeni bilan tekshiradi. Widget oddiy `localhost` da ishlamaydi. Lokal sinov uchun tunnel kerak (masalan, ngrok) va uning domeni @BotFather da belgilanishi kerak.

## Ma'lumot manbalari va litsenziyalar

- **Masalalar:** [Lichess puzzle bazasi](https://database.lichess.org/#puzzles), CC0.
- **Jonli turnirlar:** [Lichess Broadcast API](https://lichess.org/api#tag/Broadcasts). So'rovlar to'g'ridan-to'g'ri brauzerdan yuboriladi, token kerak emas.
- **Dvigatel:** [Stockfish](https://stockfishchess.org), GPL-3.0. O'zgartirilmagan holda alohida worker fayl sifatida beriladi (`apps/web/public/stockfish/`, litsenziya matni `COPYING.txt` da).
- **Taxta:** react-chessboard (MIT). Qoidalar: chess.js (BSD-2).
