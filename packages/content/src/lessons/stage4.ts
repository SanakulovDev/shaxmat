import type { Lesson } from "../schema.js";

// Mating practice against the strongest bot: it defends as well as possible.
const DEFENDER = 10;

export const stage4: Lesson[] = [
  {
    slug: "forpost",
    stage: 4,
    title: "Forpost",
    summary: "Kuchsiz katak va unda mustahkam turgan dona.",
    steps: [
      {
        type: "text",
        text: "Kuchsiz katak — raqib piyodalari endi hech qachon hujum qila olmaydigan katak. Har bir piyoda yurishi orqasida shunday kataklar qoldiradi, shuning uchun piyodalarni o'ylab suring.",
      },
      {
        type: "text",
        text: "Forpost — raqibning kuchsiz katagi, uni o'z piyodangiz himoya qiladi. Forpostdagi ot ayniqsa kuchli: uni piyoda bilan haydab bo'lmaydi, faqat dona bilan almashtirish mumkin.",
      },
      {
        type: "quiz",
        text: "Qaysi katak oq ot uchun forpost?",
        fen: "5rk1/pp2bppp/3p4/4p3/4P3/2N5/PPP2PPP/5RK1 w - - 0 1",
        options: ["d5", "f5", "b5"],
        answer: 0,
        explanation: "d5 ga qora piyodalar hujum qila olmaydi: c-piyoda yo'q, e-piyoda esa e5 da, undan o'tib ketgan. d5 ni e4 piyoda himoya qiladi. f5 ga g6, b5 ga a6 piyodasi hujum qila oladi.",
      },
      {
        type: "move",
        text: "Otni forpostga joylashtiring.",
        fen: "5rk1/pp2bppp/3p4/4p3/4P3/2N5/PPP2PPP/5RK1 w - - 0 1",
        solutions: ["c3d5"],
        hint: "Qaysi katakka qora piyodalar hech qachon hujum qila olmaydi?",
        success: "Ajoyib! Ot d5 da mustahkam turibdi va ikki qanotni ham nazorat qiladi.",
      },
    ],
  },
  {
    slug: "yaxshi-yomon-fil",
    stage: 4,
    title: "Yaxshi va yomon fil",
    summary: "Fil, ot va piyodalar rangi.",
    steps: [
      {
        type: "text",
        text: "Yomon fil — o'z piyodalari bilan bir xil rangdagi kataklarda yuradigan fil: piyodalar uning yo'lini to'sadi. Yaxshi fil esa piyodalardan boshqa rangdagi kataklarda erkin yuradi.",
        fen: "2b1k3/8/4p3/3pP3/3P4/3B4/8/4K3 w - - 0 1",
        highlights: ["d5", "e6"],
      },
      {
        type: "quiz",
        text: "Bu pozitsiyada qaysi fil yaxshi?",
        fen: "2b1k3/8/4p3/3pP3/3P4/3B4/8/4K3 w - - 0 1",
        options: ["Oq fil", "Qora fil"],
        answer: 0,
        explanation: "Qora piyodalar d5 va e6 oq kataklarda, qora fil ham oq kataklarda yuradi va o'z piyodalariga tiqilib qoladi. Oq piyodalar esa qora kataklarda, oq fil erkin.",
      },
      {
        type: "text",
        text: "Fil va ot: ochiq pozitsiyada, piyodalar kam va diagonallar ochiq bo'lsa, fil kuchliroq. Yopiq pozitsiyada, piyodalar zanjir bo'lib turganda, ot kuchliroq — u piyodalar ustidan sakraydi.",
      },
      {
        type: "quiz",
        text: "Yopiq pozitsiyada qaysi dona odatda kuchliroq?",
        options: ["Ot", "Fil"],
        answer: 0,
        explanation: "Yopiq pozitsiyada diagonallar piyodalar bilan to'silgan. Ot esa to'siqlardan sakrab o'tadi va kuchsiz kataklarga joylashadi.",
      },
      {
        type: "text",
        text: "Ikki fil ochiq pozitsiyada katta ustunlik beradi: ular birgalikda ikkala rangdagi kataklarni nazorat qiladi. Ikki filingiz bo'lsa, pozitsiyani ochishga harakat qiling.",
      },
    ],
  },
  {
    slug: "ochiq-chiziq",
    stage: 4,
    title: "Ochiq vertikal va ettinchi qator",
    summary: "Ruhlarni qayerga qo'yish kerak.",
    steps: [
      {
        type: "text",
        text: "Ochiq vertikal — piyodasi yo'q vertikal. Ruhlar ochiq vertikalda eng kuchli: ular u orqali raqib lageriga kirib boradi. Ochiq vertikalni birinchi egallagan tomon ustunlikka ega bo'ladi.",
      },
      {
        type: "move",
        text: "Yagona ochiq vertikalni egallang.",
        fen: "r4rk1/pp3ppp/2p1b3/4p3/4P3/2P1B3/PP3PPP/R4RK1 w - - 0 1",
        solutions: ["f1d1", "a1d1"],
        hint: "Qaysi vertikalda umuman piyoda yo'q?",
        success: "To'g'ri! Ruh d-vertikalni egalladi.",
      },
      {
        type: "text",
        text: "Ruh ettinchi qatorga chiqsa, u raqib piyodalariga yon tomondan hujum qiladi va shohni oxirgi qatorda qamab qo'yadi. Ettinchi qatordagi ikki ruh ko'pincha mat bilan tahdid qiladi.",
      },
      {
        type: "move",
        text: "Ruhni ettinchi qatorga olib chiqing.",
        fen: "5rk1/pp3ppp/2p5/4p3/4P3/2P5/PP3PPP/3R2K1 w - - 0 1",
        solutions: ["d1d7"],
        hint: "d-vertikal ochiq — undan foydalaning.",
        success: "Ajoyib! Ruh ettinchi qatorda b7 piyodaga hujum qilyapti.",
      },
    ],
  },
  {
    slug: "profilaktika",
    stage: 4,
    title: "Profilaktika",
    summary: "Raqibning rejasiga oldindan to'sqinlik qilish.",
    steps: [
      {
        type: "text",
        text: "Profilaktika — raqibning rejasini oldindan payqab, unga yo'l qo'ymaslik. Har yurishdan oldin so'rang: «Raqib keyingi yurishda nima qilmoqchi?»",
      },
      {
        type: "move",
        text: "Oq ruh a7 dagi piyodani ola oladi. Lekin avval o'ylang: qora nima bilan tahdid qilyapti?",
        speech: "Oq ruh a yettidagi piyodani ola oladi. Lekin avval o'ylang: qora nima bilan tahdid qilyapti?",
        fen: "3r2k1/pR3ppp/8/8/8/8/P4PPP/6K1 w - - 0 1",
        solutions: ["g1f1", "h2h3", "h2h4", "g2g3", "g2g4", "f2f3", "f2f4"],
        hint: "Qora ruh d1 ga chiqsa nima bo'ladi? Shohingizga qochish joyi bering.",
        success: "To'g'ri! Endi oxirgi qatorda mat xavfi yo'q. Piyodani olsangiz, qora ruh d1 ga chiqib mat qilardi.",
      },
      {
        type: "quiz",
        text: "Profilaktik yurish nima?",
        options: [
          "Raqibning rejasiga oldindan to'sqinlik qiladigan yurish",
          "Faqat shoh bilan qilinadigan yurish",
          "Doim hujum qiladigan yurish",
        ],
        answer: 0,
        explanation: "Profilaktika — raqibning eng yaxshi yurishini oldindan yo'q qilish. Bunday yurishlar sokin ko'rinadi, lekin raqibni rejasiz qoldiradi.",
      },
    ],
  },
  {
    slug: "debyut-repertuari",
    stage: 4,
    title: "Debyut repertuari",
    summary: "Sitsiliya himoyasi va Farzin gambiti.",
    steps: [
      {
        type: "text",
        text: "Repertuar — siz doim o'ynaydigan debyutlar to'plami. Oq bilan bitta birinchi yurishni tanlang, qora bilan esa e4 va d4 ga javob tayyorlang. Yurishlarni yodlamang — g'oyalarni tushuning.",
        speech: "Repertuar — siz doim o'ynaydigan debyutlar to'plami. Oq bilan bitta birinchi yurishni tanlang, qora bilan esa e to'rt va d to'rtga javob tayyorlang. Yurishlarni yodlamang — g'oyalarni tushuning.",
      },
      {
        type: "move",
        text: "Qora bilan e4 ga Sitsiliya himoyasi bilan javob bering: c-piyodani ikki katak suring.",
        speech: "Qora bilan e to'rtga Sitsiliya himoyasi bilan javob bering: c piyodani ikki katak suring.",
        fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
        solutions: ["c7c5"],
        hint: "c-piyoda d4 katakni nazorat qiladi.",
        success: "Sitsiliya himoyasi! Qora markaz uchun yon tomondan kurashadi.",
      },
      {
        type: "text",
        text: "Sitsiliyaning asosiy yo'lida oq d4 bilan markazni ochadi va qora c-piyodani d4 dagi piyodaga almashtiradi. Qora yarim ochiq c-vertikalni oladi, oq esa rivojlanishda oldinda. Pozitsiya keskin: ikki tomon ham g'alaba uchun o'ynaydi.",
        fen: "rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5",
      },
      {
        type: "move",
        text: "Oq bilan d4 o'ynadingiz, qora d5 bilan javob berdi. Farzin gambitini o'ynang: c-piyodani ikki katak suring.",
        speech: "Oq bilan d to'rt o'ynadingiz, qora d besh bilan javob berdi. Farzin gambitini o'ynang: c piyodani ikki katak suring.",
        fen: "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
        solutions: ["c2c4"],
        hint: "Piyoda c4 da d5 ga hujum qiladi.",
        success: "Farzin gambiti! Oq qora piyodani markazdan chalg'itmoqchi.",
      },
      {
        type: "text",
        text: "Qora e6 bilan d5 ni mustahkamlasa, bu rad etilgan Farzin gambiti. Qoraning pozitsiyasi mustahkam, lekin c8 dagi fil o'z piyodalari orqasida qamalib qoladi.",
        speech: "Qora e olti bilan d beshni mustahkamlasa, bu rad etilgan Farzin gambiti. Qoraning pozitsiyasi mustahkam, lekin c sakkizdagi fil o'z piyodalari orqasida qamalib qoladi.",
        fen: "rnbqk2r/ppp1bppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR w KQkq - 4 5",
        highlights: ["c8"],
      },
      {
        type: "quiz",
        text: "Qora gambitni qabul qilib, c4 dagi piyodani olsa, oq uni qaytarib ola oladimi?",
        options: ["Ha, odatda qaytarib oladi", "Yo'q, piyoda butunlay yo'qoladi"],
        answer: 0,
        explanation: "Qora c4 piyodani ushlab qola olmaydi: oq e3 va fil bilan uni qaytarib oladi. Shuning uchun Farzin gambiti haqiqiy qurbon emas.",
      },
    ],
  },
  {
    slug: "sugsvang",
    stage: 4,
    title: "Sugsvang",
    summary: "Yurish navbati zarar bo'lganda.",
    steps: [
      {
        type: "text",
        text: "Sugsvang — yurish navbati zarar keltiradigan holat: har qanday yurish pozitsiyani yomonlashtiradi, lekin yurmaslik mumkin emas. Endshpilda sugsvang ko'pincha o'yin taqdirini hal qiladi.",
      },
      {
        type: "move",
        text: "Qora shoh piyodaning oldini to'sib turibdi. Uni sugsvangga soling.",
        fen: "3k4/3P4/5K2/8/8/8/8/8 w - - 0 1",
        solutions: ["f6e6"],
        hint: "Shohni shunday qo'yingki, qora shoh faqat c7 ga yura olsin.",
        success: "Sugsvang! Qora shoh c7 ga ketishga majbur, oq shoh e7 ga chiqadi va piyoda farzinga aylanadi.",
      },
      {
        type: "quiz",
        text: "Sugsvang qaysi bosqichda eng ko'p uchraydi?",
        options: ["Endshpilda", "Debyutda"],
        answer: 0,
        explanation: "Endshpilda donalar kam, shuning uchun foydali kutish yurishlari tez tugaydi va har bir yurish muhim bo'lib qoladi.",
      },
      {
        type: "puzzles",
        text: "Sugsvang bo'yicha masalalarni yeching.",
        theme: "zugzwang",
      },
    ],
  },
  {
    slug: "ikki-fil-bilan-mat",
    stage: 4,
    title: "Ikki fil bilan mat",
    summary: "Fillar devor quradi, shoh yordam beradi.",
    steps: [
      {
        type: "text",
        text: "Ikki fil yolg'iz shohni mat qila oladi. Fillar yonma-yon diagonallarda turib «devor» quradi, shoh esa ularni himoya qiladi. Raqib shohini chetga, keyin burchakka suring va o'sha yerda mat qiling.",
        fen: "8/8/8/4k3/8/8/8/2B1KB2 w - - 0 1",
      },
      {
        type: "text",
        text: "Ehtiyot bo'ling: raqib shohida yurish qolmasa va u shohda bo'lmasa — bu pat. Shohni burchakka yaqinlashtirganda har gal uning yurishlarini sanang.",
      },
      {
        type: "play",
        text: "Ikki fil bilan mat qiling. Bot iloji boricha himoyalanadi.",
        fen: "8/8/8/4k3/8/8/8/2B1KB2 w - - 0 1",
        botLevel: DEFENDER,
      },
    ],
  },
];
