import type { Lesson } from "../schema.js";

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// Mating practice against the strongest bot: it defends as well as possible.
const DEFENDER = 10;

export const stage1: Lesson[] = [
  {
    slug: "donalar-qiymati",
    stage: 1,
    title: "Donalarning qiymati",
    summary: "Qaysi dona qancha turadi va qanday almashish foydali.",
    steps: [
      {
        type: "text",
        text: "Donalarning kuchi piyodalarda o'lchanadi: piyoda — 1, ot — 3, fil — 3, ruh — 5, farzin — 9. Shoh bebaho: uni yo'qotish — o'yinni yo'qotish.",
        fen: START,
      },
      {
        type: "quiz",
        text: "Ruhni berib, otni olish foydalimi?",
        options: ["Ha, foydali", "Yo'q, bu ikki piyodalik zarar"],
        answer: 1,
        explanation: "Ruh 5, ot 3 turadi. Ruhni berib otni olsangiz, 2 piyodaga teng kuch yo'qotasiz.",
      },
      {
        type: "quiz",
        text: "Farzin taxminan nechta piyodaga teng?",
        options: ["5", "9", "3"],
        answer: 1,
        explanation: "Farzin — 9. U ruh (5) va fil (3) kuchini birlashtiradi va ulardan ham kuchliroq.",
      },
      {
        type: "move",
        text: "Ot ikki donani ura oladi. Eng qimmat donani oling.",
        fen: "4k3/8/8/1p3r2/3N4/8/8/4K3 w - - 0 1",
        solutions: ["d4f5"],
        hint: "Ruh piyodadan to'rt barobar qimmat.",
        success: "To'g'ri! Ruh — 5, piyoda — atigi 1.",
      },
    ],
  },
  {
    slug: "farzin-bilan-mat",
    stage: 1,
    title: "Farzin bilan mat",
    summary: "Shoh va farzin yolg'iz shohni qanday mat qiladi.",
    steps: [
      {
        type: "text",
        text: "Shoh va farzin yolg'iz shohni oson mat qiladi. Reja: farzin bilan raqib shohini taxta chetiga siqib boring, keyin o'z shohingizni yaqinlashtiring va mat qiling.",
        fen: "8/8/8/3k4/8/8/8/2Q1K3 w - - 0 1",
      },
      {
        type: "text",
        text: "Farzinni raqib shohidan «ot yurishi» masofasida qo'ysangiz, u shohni qafasga soladi. Faqat ehtiyot bo'ling: shohga yurish uchun joy qolmasa, bu pat bo'ladi.",
        fen: "8/8/8/3k4/8/2Q5/8/4K3 b - - 0 1",
      },
      {
        type: "move",
        text: "Avval mashq: bir yurishda mat qiling.",
        fen: "3k4/8/3K4/8/8/8/8/6Q1 w - - 0 1",
        goal: "mate",
        hint: "Farzinni sakkizinchi gorizontga olib boring — shoh uni himoya qiladi.",
        success: "Mat!",
      },
      {
        type: "play",
        text: "Endi o'zingiz: farzin bilan mat qiling. Bot iloji boricha himoyalanadi.",
        fen: "8/8/8/3k4/8/8/8/2Q1K3 w - - 0 1",
        botLevel: DEFENDER,
      },
    ],
  },
  {
    slug: "ruh-bilan-mat",
    stage: 1,
    title: "Ruh bilan mat",
    summary: "Shoh va ruh birgalikda qanday mat qiladi.",
    steps: [
      {
        type: "text",
        text: "Shoh va ruh bilan mat qilish uchun ikkala dona birga ishlashi kerak: ruh raqib shohini chegaralaydi, sizning shohingiz esa uni qarama-qarshi turib chetga suradi.",
        fen: "8/8/8/4k3/8/8/8/R3K3 w - - 0 1",
      },
      {
        type: "move",
        text: "Shohlar qarama-qarshi turibdi. Bir yurishda mat qiling.",
        fen: "3k4/8/3K4/8/8/8/8/7R w - - 0 1",
        goal: "mate",
        hint: "Ruhni sakkizinchi gorizontga olib boring.",
        success: "Mat! Oq shoh qora shohning qochish kataklarini yopib turibdi.",
      },
      {
        type: "play",
        text: "Endi to'liq mashq: ruh bilan mat qiling. Bot iloji boricha himoyalanadi.",
        fen: "8/8/8/4k3/8/8/8/R3K3 w - - 0 1",
        botLevel: DEFENDER,
      },
    ],
  },
  {
    slug: "ikki-ruh-bilan-mat",
    stage: 1,
    title: "Ikki ruh bilan mat",
    summary: "«Zinapoya» usuli.",
    steps: [
      {
        type: "text",
        text: "Ikki ruh navbatma-navbat shoh berib, raqib shohini chetga «zinapoya» kabi suradi. Bir ruh shohni to'sib turadi, ikkinchisi shoh beradi. Oq shohning yordami kerak emas.",
        fen: "8/8/8/4k3/8/8/R7/1R2K3 w - - 0 1",
        arrows: [["a2", "a5"]],
      },
      {
        type: "play",
        text: "Ikki ruh bilan mat qiling. Ruhlaringizni shoh yaqiniga qo'ymang — u ularni urib olishi mumkin.",
        fen: "8/8/8/4k3/8/8/R7/1R2K3 w - - 0 1",
        botLevel: DEFENDER,
      },
    ],
  },
  {
    slug: "debyut-qoidalari",
    stage: 1,
    title: "Debyutning oltin qoidalari",
    summary: "O'yinni to'g'ri boshlash uchun uchta qoida.",
    steps: [
      {
        type: "text",
        text: "Debyutda uchta asosiy vazifa bor: markazni egallash, ot va fillarni tezda o'yinga chiqarish va rokirovka qilib shohni xavfsiz joyga olib qo'yish. Markaz — e4, d4, e5 va d5 kataklari.",
        fen: START,
        highlights: ["e4", "d4", "e5", "d5"],
      },
      {
        type: "move",
        text: "Markazni egallang: piyodani e4 yoki d4 ga suring.",
        speech: "Markazni egallang: piyodani e to'rt yoki d to'rtga suring.",
        fen: START,
        solutions: ["e2e4", "d2d4"],
        success: "To'g'ri! Piyoda markazni egalladi va donalaringizga yo'l ochdi.",
      },
      {
        type: "move",
        text: "Otni markazga qaratib rivojlantiring.",
        fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        solutions: ["g1f3", "b1c3"],
        hint: "Ot f3 yoki c3 katakda markazni nazorat qiladi.",
        success: "Yaxshi! Ot markazdagi kataklarni nazorat qilyapti.",
      },
      {
        type: "move",
        text: "Filni faol katakka chiqaring.",
        fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
        solutions: ["f1c4", "f1b5"],
        hint: "Fil c4 yoki b5 katakda faol turadi.",
        success: "Ajoyib! Endi rokirovka uchun yo'l ochiq.",
      },
      {
        type: "move",
        text: "Endi shohni xavfsiz joyga olib qo'ying.",
        fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 1 5",
        solutions: ["e1g1"],
        hint: "Qisqa rokirovka qiling.",
        success: "To'g'ri! Shoh xavfsiz, ruh esa o'yinga qo'shildi.",
      },
      {
        type: "quiz",
        text: "Debyutda farzinni erta chiqarish nega xavfli?",
        options: [
          "Raqib uni donalari bilan quvib, vaqt yutadi",
          "Farzin debyutda yura olmaydi",
          "Bu qoidaga zid",
        ],
        answer: 0,
        explanation: "Raqib farzinga hujum qilib, o'z donalarini rivojlantiradi. Siz esa farzinni qochirish bilan vaqt yo'qotasiz.",
      },
    ],
  },
  {
    slug: "vilka",
    stage: 1,
    title: "Vilka",
    summary: "Bir dona bilan ikki nishonga hujum.",
    steps: [
      {
        type: "text",
        text: "Vilka — bitta dona bir vaqtning o'zida ikki yoki undan ko'p raqib donasiga hujum qilishi. Raqib faqat bittasini qutqara oladi. Ot vilkalari ayniqsa xavfli.",
        fen: "r3k3/2N5/8/8/8/8/8/4K3 b - - 0 1",
        arrows: [
          ["c7", "e8"],
          ["c7", "a8"],
        ],
      },
      {
        type: "move",
        text: "Ot bilan vilka qiling: shohga ham, ruhga ham hujum qiling.",
        fen: "r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1",
        solutions: ["b5c7"],
        hint: "Ot c7 katakdan qaysi kataklarga hujum qiladi?",
        success: "Vilka! Shoh qochadi, keyingi yurishda ruhni olasiz.",
      },
      {
        type: "move",
        text: "Farzin bilan vilka qiling: shoh bering va ruhni ham hujum ostiga oling.",
        fen: "r5k1/8/8/8/8/8/8/3Q2K1 w - - 0 1",
        solutions: ["d1d5"],
        hint: "Farzin d5 katakdan ikki diagonalni nazorat qiladi.",
        success: "Ajoyib! Shoh qochgach, farzin a8 dagi ruhni oladi.",
      },
      {
        type: "puzzles",
        text: "Vilka bo'yicha haqiqiy o'yinlardan olingan masalalarni yeching.",
        theme: "fork",
      },
    ],
  },
  {
    slug: "boglash",
    stage: 1,
    title: "Bog'lash",
    summary: "Donani joyidan qimirlay olmaydigan qilish.",
    steps: [
      {
        type: "text",
        text: "Bog'lash — dona orqasida undan qimmatroq dona turgani uchun u joyidan qimirlay olmasligi. Agar orqada shoh tursa, bog'langan dona umuman yura olmaydi.",
        fen: "4k3/8/2n5/1B6/8/8/8/4K3 b - - 0 1",
        arrows: [["b5", "e8"]],
      },
      {
        type: "move",
        text: "Fil bilan qora otni shohga bog'lang.",
        fen: "4k3/8/2n5/8/8/8/8/4KB2 w - - 0 1",
        solutions: ["f1b5"],
        hint: "Ot va shoh bitta diagonalda turibdi.",
        success: "To'g'ri! Endi ot joyidan qimirlay olmaydi.",
      },
      {
        type: "move",
        text: "Bog'langan otga piyoda bilan hujum qiling — u qochib keta olmaydi.",
        fen: "4k3/8/2n5/1B6/3P4/8/8/4K3 w - - 0 1",
        solutions: ["d4d5"],
        hint: "Piyodani otga hujum qiladigan katakka suring.",
        success: "Barakalla! Ot qochib keta olmaydi va urib olinadi.",
      },
      {
        type: "puzzles",
        text: "Bog'lash bo'yicha masalalarni yeching.",
        theme: "pin",
      },
    ],
  },
  {
    slug: "shish",
    stage: 1,
    title: "Shish",
    summary: "Oldindagi qimmat donani qochirib, orqadagisini olish.",
    steps: [
      {
        type: "text",
        text: "Shish bog'lashning teskarisi: oldindagi qimmat dona — ko'pincha shoh — hujumdan qochishga majbur, uning orqasidagi dona esa urib olinadi.",
        fen: "4q3/8/8/4k3/8/8/8/4R1K1 b - - 0 1",
        arrows: [["e1", "e8"]],
      },
      {
        type: "move",
        text: "Fil bilan shish qiling: shoh bering, shoh qochgach, orqadagi farzinni olasiz.",
        fen: "8/1q6/8/8/4k3/8/8/5BK1 w - - 0 1",
        solutions: ["f1g2"],
        hint: "Qora shoh va farzin bitta uzun diagonalda turibdi.",
        success: "Shish! Shoh qochadi va farzin sizniki.",
      },
      {
        type: "puzzles",
        text: "Shish bo'yicha masalalarni yeching.",
        theme: "skewer",
      },
    ],
  },
  {
    slug: "himoyasiz-dona",
    stage: 1,
    title: "Himoyasiz donalar",
    summary: "Tekin donani topish va o'z donalaringizni asrash.",
    steps: [
      {
        type: "text",
        text: "Har bir yurishdan oldin ikki savolni bering: raqib qaysi donasini himoyasiz qoldirdi? Va mening donalarim himoyalanganmi?",
      },
      {
        type: "move",
        text: "Himoyasiz qora donani toping va uni oling.",
        fen: "4k3/pp3ppp/8/3b4/8/2N5/PPP2PPP/4K3 w - - 0 1",
        solutions: ["c3d5"],
        hint: "Qaysi qora donani hech kim himoya qilmayapti?",
        success: "To'g'ri! Fil himoyasiz edi.",
      },
      {
        type: "move",
        text: "Otingiz hujum ostida! Uni xavfsiz katakka olib qo'ying.",
        fen: "4k3/8/8/8/4p3/5N2/8/4K3 w - - 0 1",
        solutions: ["f3d2", "f3d4", "f3e5", "f3g1", "f3g5", "f3h2", "f3h4"],
        hint: "Qora piyoda f3 katakka hujum qilyapti. Otni boshqa joyga yuring.",
        success: "Yaxshi! Donalaringizni doim tekshirib turing.",
      },
      {
        type: "puzzles",
        text: "Himoyasiz donalar bo'yicha masalalarni yeching.",
        theme: "hangingPiece",
      },
    ],
  },
];
