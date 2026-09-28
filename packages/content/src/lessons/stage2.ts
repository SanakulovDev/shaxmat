import type { Lesson } from "../schema.js";

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// Mating practice against the strongest bot: it defends as well as possible.
const DEFENDER = 10;

export const stage2: Lesson[] = [
  {
    slug: "ochiq-hujum",
    stage: 2,
    title: "Ochiq hujum",
    summary: "Bir dona yurib, orqasidagi donaga yo'l ochadi.",
    steps: [
      {
        type: "text",
        text: "Ochiq hujum — bir dona yurganda uning orqasida turgan ruh, fil yoki farzin hujumga o'tishi. Oldindagi dona ham tahdid qilsa, raqib ikkala tahdiddan birdaniga qutula olmaydi.",
        fen: "3q2k1/5pp1/7p/8/8/3B4/5PPP/3R2K1 w - - 0 1",
        arrows: [["d1", "d8"]],
      },
      {
        type: "quiz",
        text: "Oldindagi dona yurganda orqadagi dona shoh bersa, bu nima deyiladi?",
        options: ["Ochiq shoh", "Bog'lash", "Vilka"],
        answer: 0,
        explanation: "Bu ochiq shoh. Raqib shohni himoya qilishga majbur, oldindagi dona esa shu paytda istalgan joyga yurib, boshqa donani olishi mumkin.",
      },
      {
        type: "move",
        text: "Filni shoh beradigan qilib yuring — ruh qora farzinga yo'l ochadi.",
        fen: "3q2k1/5pp1/7p/8/8/3B4/5PPP/3R2K1 w - - 0 1",
        solutions: ["d3h7"],
        hint: "Fil d-vertikalni bo'shatsin va shu bilan birga shohga hujum qilsin.",
        success: "Ochiq hujum! Qora shoh bilan nima qilmasin, ruh d8 dagi farzinni oladi.",
      },
      {
        type: "puzzles",
        text: "Ochiq hujum bo'yicha masalalarni yeching.",
        theme: "discoveredAttack",
      },
    ],
  },
  {
    slug: "qosh-shoh",
    stage: 2,
    title: "Qo'sh shoh",
    summary: "Ikki dona birdaniga shoh beradi.",
    steps: [
      {
        type: "text",
        text: "Qo'sh shoh — ochiq hujumning eng kuchli turi: yurgan dona ham, orqasidan ochilgan dona ham birdaniga shoh beradi. Bitta yurish bilan ikki donani urib ham, to'sib ham bo'lmaydi.",
      },
      {
        type: "quiz",
        text: "Qo'sh shohga qanday javob berish mumkin?",
        options: [
          "Faqat shoh bilan qochib",
          "Shoh berayotgan donalardan birini urib",
          "Orasiga dona qo'yib to'sib",
        ],
        answer: 0,
        explanation: "Bir donani urib yoki to'sib olsangiz ham, ikkinchisining shohi qoladi. Shuning uchun qo'sh shohda faqat shoh yuradi.",
      },
      {
        type: "move",
        text: "Ot bilan qo'sh shoh bering — bu mat bo'ladi.",
        fen: "3qkb2/3p1ppp/8/8/4N3/8/5PPP/4R1K1 w - - 0 1",
        goal: "mate",
        hint: "Ot yurganda e-vertikal ochiladi va ruh ham shoh beradi.",
        success: "Qo'sh shoh va mat! Qora otni urib olsa ham, ruhning shohi qoladi, shohning esa qochadigan joyi yo'q.",
      },
      {
        type: "puzzles",
        text: "Qo'sh shoh bo'yicha masalalarni yeching.",
        theme: "doubleCheck",
      },
    ],
  },
  {
    slug: "oxirgi-qator",
    stage: 2,
    title: "Oxirgi qatorda mat",
    summary: "O'z piyodalari qamab qo'ygan shoh.",
    steps: [
      {
        type: "text",
        text: "Rokirovkadan keyin shoh ko'pincha o'z piyodalari orqasida qoladi. Raqib ruhi yoki farzini oxirgi qatorga chiqsa, shohning qochadigan joyi yo'q — bu mat.",
        fen: "3R2k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1",
        highlights: ["f7", "g7", "h7"],
      },
      {
        type: "move",
        text: "Bir yurishda mat qiling.",
        fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
        goal: "mate",
        hint: "Ruhni oxirgi qatorga olib chiqing.",
        success: "Mat! Qora shohni o'z piyodalari to'sib qo'ydi.",
      },
      {
        type: "quiz",
        text: "Oxirgi qatorda matdan qanday saqlanish mumkin?",
        options: [
          "Shoh oldidagi piyodalardan birini surib, «darcha» ochish",
          "Barcha piyodalarni joyida qoldirish",
          "Ruhlarni oxirgi qatordan olib ketish",
        ],
        answer: 0,
        explanation: "Bitta piyoda yurishi, masalan h3, shohga qochish katagini beradi. Bu katakni «darcha» deyishadi.",
      },
      {
        type: "move",
        text: "Qora ruhlar oxirgi qatorni himoya qilyapti, lekin ular ortiqcha yuklangan. Qurbon bilan boshlab, ikki yurishda mat qiling.",
        fen: "2rr2k1/pp3ppp/8/8/8/8/PP1Q1PPP/3R2K1 w - - 0 1",
        solutions: ["d2d8"],
        hint: "Farzin bilan d8 dagi ruhni oling. Qora uni qaytarib olsa, oxirgi qator bo'shab qoladi.",
        success: "Ajoyib! Qora ruh bilan olsa, oq ruh d8 ga chiqib mat qiladi.",
      },
      {
        type: "puzzles",
        text: "Oxirgi qatorda mat bo'yicha masalalarni yeching.",
        theme: "backRankMate",
      },
    ],
  },
  {
    slug: "kvadrat-qoidasi",
    stage: 2,
    title: "Kvadrat qoidasi",
    summary: "Shoh yolg'iz piyodani quvib yeta oladimi.",
    steps: [
      {
        type: "text",
        text: "Shoh yolg'iz piyodani ushlay oladimi? Buni hisoblamasdan bilish uchun kvadrat chizing: tomoni piyodadan aylanish katagigacha. h5 dagi piyoda uchun bu d1–h1–h5–d5 kvadrati. Shoh kvadrat ichiga kira olsa, piyodani ushlaydi.",
        speech: "Shoh yolg'iz piyodani ushlay oladimi? Buni hisoblamasdan bilish uchun kvadrat chizing: tomoni piyodadan aylanish katagigacha. h beshdagi piyoda uchun bu d bir, h bir, h besh va d besh kvadrati. Shoh kvadrat ichiga kira olsa, piyodani ushlaydi.",
        fen: "k7/8/8/7p/8/2K5/8/8 w - - 0 1",
        highlights: ["d1", "h1", "h5", "d5"],
      },
      {
        type: "move",
        text: "Oq shohni kvadratga kiriting va piyodani ushlang.",
        fen: "k7/8/8/7p/8/2K5/8/8 w - - 0 1",
        solutions: ["c3d2", "c3d3", "c3d4"],
        hint: "Kvadrat d-vertikaldan boshlanadi. Shohni d-vertikalga olib boring.",
        success: "To'g'ri! Shoh kvadrat ichida — piyoda endi qochib qutula olmaydi.",
      },
      {
        type: "quiz",
        text: "Oq yuradi. Qora shoh a5 dagi piyodani ushlay oladimi?",
        speech: "Oq yuradi. Qora shoh a beshdagi piyodani ushlay oladimi?",
        fen: "8/8/8/P3k3/8/8/8/K7 w - - 0 1",
        options: ["Ha, ushlaydi", "Yo'q, piyoda farzinga aylanadi"],
        answer: 1,
        explanation: "Piyodaning kvadrati a5–d5–d8–a8. Qora shoh e5 da, ya'ni kvadratdan tashqarida, navbat esa oqda. Piyoda a6 ga yurgach, kvadrat kichrayadi va shoh unga yetib bora olmaydi.",
      },
      {
        type: "puzzles",
        text: "Piyoda endshpili bo'yicha masalalarni yeching.",
        theme: "pawnEndgame",
      },
    ],
  },
  {
    slug: "oppozitsiya",
    stage: 2,
    title: "Oppozitsiya",
    summary: "Shohlar kurashi: kim yo'l beradi.",
    steps: [
      {
        type: "text",
        text: "Oppozitsiya — shohlar bir-biriga qarama-qarshi turishi, orada bitta katak qolishi. Shohlar bir-biriga yaqinlasha olmaydi, shuning uchun navbati kelgan tomon yo'l berishga majbur. Bu yerda qora yuradi va oq shohni o'tkazib yuboradi.",
        fen: "8/4k3/8/4K3/4P3/8/8/8 b - - 0 1",
      },
      {
        type: "move",
        text: "Oppozitsiyani egallang.",
        fen: "8/4k3/8/3K4/4P3/8/8/8 w - - 0 1",
        solutions: ["d5e5"],
        hint: "Shohingizni qora shohning ro'parasiga qo'ying — orada bitta katak qolsin.",
        success: "To'g'ri! Endi qora shoh yo'l berishi kerak va oq shoh oldinga o'tadi.",
      },
      {
        type: "move",
        text: "Qoida: shoh piyodadan oldinda yursin. Shohni oldinga olib chiqing.",
        fen: "8/4k3/8/8/4K3/4P3/8/8 w - - 0 1",
        solutions: ["e4d5", "e4e5", "e4f5"],
        hint: "Beshinchi qatorga chiqing — shoh piyodaga yo'l ochib borsin.",
        success: "Yaxshi! Shoh oldinda bo'lsa, piyoda xavfsiz yuradi.",
      },
      {
        type: "play",
        text: "Endi o'zingiz: piyodani farzinga aylantiring va mat qiling. Bot iloji boricha himoyalanadi.",
        fen: "8/4k3/8/8/4K3/4P3/8/8 w - - 0 1",
        botLevel: DEFENDER,
      },
    ],
  },
  {
    slug: "italyan-partiyasi",
    stage: 2,
    title: "Italyan partiyasi",
    summary: "Qadimiy va tushunarli birinchi debyut.",
    steps: [
      {
        type: "text",
        text: "Italyan partiyasi — eng qadimgi debyutlardan biri. U debyut qoidalariga to'liq mos: markaz, tez rivojlanish va rokirovka. Keling, uni birga o'ynaymiz.",
        fen: START,
      },
      {
        type: "move",
        text: "Qora ham markazni egalladi. Otni chiqarib, e5 piyodaga hujum qiling.",
        speech: "Qora ham markazni egalladi. Otni chiqarib, e beshdagi piyodaga hujum qiling.",
        fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        solutions: ["g1f3"],
        hint: "Ot f3 dan e5 ga hujum qiladi.",
        success: "To'g'ri! Qora piyodani ot bilan himoya qildi.",
      },
      {
        type: "move",
        text: "Filni f7 katakka qaratib chiqaring.",
        speech: "Filni f yettiga qaratib chiqaring.",
        fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
        solutions: ["f1c4"],
        hint: "f7 ni faqat qora shoh himoya qiladi. Fil c4 dan unga qaraydi.",
        success: "Bu Italyan partiyasi! Fil qora shoh yonidagi eng zaif nuqtaga qarab turibdi.",
      },
      {
        type: "move",
        text: "Qora ham filni c5 ga chiqardi. Markazni to'liq egallash uchun d4 yurishiga tayyorlaning.",
        speech: "Qora ham filni c beshga chiqardi. Markazni to'liq egallash uchun d to'rt yurishiga tayyorlaning.",
        fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
        solutions: ["c2c3"],
        hint: "c-piyodani bir katak suring: u d4 katakni qo'llab-quvvatlaydi.",
        success: "Ajoyib! Endi d4 bilan markazni egallaysiz.",
      },
      {
        type: "quiz",
        text: "Qora uchinchi yurishda otni f6 ga chiqardi, oq esa otni g5 ga sakratdi. Oq ot va fil birgalikda qaysi katakka hujum qilyapti?",
        fen: "r1bqkb1r/pppp1ppp/2n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 5 4",
        options: ["f7", "h7", "d5"],
        answer: 0,
        explanation: "Ot g5 va fil c4 ikkalasi ham f7 ga qaraydi. Qora uni aniq himoya qilishi kerak, aks holda oq f7 da hujumni boshlaydi.",
      },
      {
        type: "puzzles",
        text: "Debyutdagi taktika bo'yicha masalalarni yeching.",
        theme: "opening",
      },
    ],
  },
];
