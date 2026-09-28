import type { Lesson } from "../schema.js";

// Mating practice against the strongest bot: it defends as well as possible.
const DEFENDER = 10;

export const stage3: Lesson[] = [
  {
    slug: "orta-oyin-rejasi",
    stage: 3,
    title: "O'rta o'yin rejasi",
    summary: "Pozitsiyani baholash va reja tuzish.",
    steps: [
      {
        type: "text",
        text: "Debyut tugagach, reja kerak. Pozitsiyani baholash uchun to'rt narsaga qarang: material, shohlarning xavfsizligi, donalarning faolligi va piyoda tuzilmasi.",
      },
      {
        type: "text",
        text: "Reja pozitsiyadan kelib chiqadi. Raqib shohi ochiq bo'lsa — hujum qiling. Materialda oldinda bo'lsangiz — donalarni almashtiring. Raqibda zaif piyoda bo'lsa — unga bosim o'tkazing.",
      },
      {
        type: "quiz",
        text: "Siz bir ruhga ko'p bo'lsangiz, qaysi reja to'g'ri?",
        options: [
          "Donalarni almashtirib, endshpilga o'tish",
          "Donalarni almashtirmaslik",
          "Durang taklif qilish",
        ],
        answer: 0,
        explanation: "Taxtada donalar kamaygan sari ortiqcha ruhning kuchi oshadi. Donalarni almashtiring, piyodalarni esa saqlang — ular farzinga aylanishi mumkin.",
      },
      {
        type: "quiz",
        text: "Qaysi dona «yomon» hisoblanadi?",
        options: [
          "O'yinda qatnashmayotgan, kam katakni nazorat qiladigan dona",
          "Eng ko'p yurgan dona",
          "Markazda turgan dona",
        ],
        answer: 0,
        explanation: "Yomon dona — o'yinda ishtirok etmayotgan dona. Ko'pincha eng yaxshi reja — shu donani yaxshiroq katakka olib o'tish.",
      },
      {
        type: "text",
        text: "Oddiy qoida: har gal eng yomon turgan donangizni toping va uni yaxshilang. Kichik yaxshilanishlar yig'ilib, katta ustunlikka aylanadi.",
      },
    ],
  },
  {
    slug: "piyoda-tuzilmasi",
    stage: 3,
    title: "Piyoda tuzilmasi",
    summary: "Yakkalangan, qo'shaloq va o'tgan piyodalar.",
    steps: [
      {
        type: "text",
        text: "Yakkalangan piyoda — yon vertikallarida o'z piyodasi yo'q piyoda. Uni boshqa piyoda himoya qila olmaydi, oldidagi katak esa raqib donasi uchun qulay joy.",
        fen: "4k3/pp3ppp/8/3p4/8/8/PP3PPP/4K3 w - - 0 1",
        highlights: ["d5"],
      },
      {
        type: "text",
        text: "Qo'shaloq piyodalar — bitta vertikalda turgan ikki piyoda. Ular bir-birini himoya qila olmaydi va bir-biriga yo'l to'sadi.",
        fen: "4k3/pp3ppp/8/8/8/2P5/P1P2PPP/4K3 w - - 0 1",
        highlights: ["c2", "c3"],
      },
      {
        type: "text",
        text: "O'tgan piyoda — oldida ham, yon vertikallarida ham raqib piyodasi yo'q piyoda. Uni faqat donalar to'xtata oladi. Endshpilda o'tgan piyoda ko'pincha hal qiluvchi kuch.",
        fen: "4k3/6pp/8/1P6/8/8/6PP/4K3 w - - 0 1",
        highlights: ["b5"],
      },
      {
        type: "quiz",
        text: "Qaysi oq piyoda o'tgan piyoda?",
        fen: "4k3/pp4pp/8/4P3/8/8/PP4PP/4K3 w - - 0 1",
        options: ["e5", "b2", "h2"],
        answer: 0,
        explanation: "e5 piyodaning oldida ham, d va f vertikallarida ham qora piyoda yo'q. b2 va h2 ning oldida esa qora piyodalar turibdi.",
      },
      {
        type: "move",
        text: "Mashhur yorib o'tish: uchta piyoda uchtaga qarshi. Bitta piyodani qurbon qilib, o'tgan piyoda yarating.",
        fen: "6k1/ppp5/8/PPP5/8/8/8/6K1 w - - 0 1",
        solutions: ["b5b6"],
        hint: "O'rtadagi piyodani suring.",
        success: "Ajoyib! Qora qaysi piyoda bilan olmasin, oq yana bir piyodani qurbon qiladi va uchinchisi farzinga aylanadi.",
      },
      {
        type: "puzzles",
        text: "Oldinga o'tgan piyodalar bo'yicha masalalarni yeching.",
        theme: "advancedPawn",
      },
    ],
  },
  {
    slug: "hisoblash",
    stage: 3,
    title: "Hisoblash",
    summary: "Shohlar, urishlar va tahdidlar.",
    steps: [
      {
        type: "text",
        text: "Har yurishdan oldin majburiy yurishlarni tekshiring: shohlar, urishlar va tahdidlar. Ular raqibning javobini cheklaydi, shuning uchun ularni oxirigacha hisoblash oson.",
      },
      {
        type: "text",
        text: "Hisoblaganda raqib uchun eng kuchli javobni qidiring. Variantni ko'z oldingizda oxirigacha yurib chiqing va oxirgi pozitsiyani baholang. Tuzoqqa tushirish umidida yurmang.",
      },
      {
        type: "quiz",
        text: "Hisoblashni qaysi yurishlardan boshlash kerak?",
        options: ["Shohlar, urishlar va tahdidlar", "Piyoda yurishlari", "Shoh yurishlari"],
        answer: 0,
        explanation: "Majburiy yurishlar raqibga kam tanlov qoldiradi. Ular eng kuchli yurishlar orasida bo'ladi va ularni tez hisoblash mumkin.",
      },
      {
        type: "move",
        text: "Ikki yurishda mat qiling. Majburiy yurishlardan boshlang.",
        fen: "r2q1r1k/ppp1Nppp/8/5R1Q/8/8/PPP2PPP/6K1 w - - 0 1",
        solutions: ["h5h7"],
        hint: "Farzinni qurbon qiling: h7 dagi piyodani oling.",
        success: "Ajoyib hisob! Shoh farzinni oladi, ruh h5 ga o'tib mat qiladi. Bu «Anastasiya mati».",
      },
      {
        type: "puzzles",
        text: "Ikki yurishda mat masalalarini yeching. Har birini oxirigacha hisoblang.",
        theme: "mateIn2",
      },
    ],
  },
  {
    slug: "bogilgan-mat",
    stage: 3,
    title: "Bo'g'ilgan mat",
    summary: "Ot o'z donalari qamab qo'ygan shohni mat qiladi.",
    steps: [
      {
        type: "text",
        text: "Bo'g'ilgan mat — shoh qochadigan kataklarni o'z donalari band qilgan va ot mat bergan holat. Otning shohini to'sib bo'lmaydi.",
        fen: "6rk/5Npp/8/8/8/8/8/6K1 b - - 0 1",
        highlights: ["g8", "g7", "h7"],
      },
      {
        type: "move",
        text: "Ot bilan mat qiling.",
        fen: "6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1",
        goal: "mate",
        hint: "Ot qaysi katakdan h8 ga hujum qiladi?",
        success: "Bo'g'ilgan mat! Qora shohni o'z donalari qamab qo'ydi.",
      },
      {
        type: "move",
        text: "Mashhur kombinatsiya: farzinni qurbon qilib, ikki yurishda mat qiling.",
        fen: "5r1k/pp4pp/1q5N/8/2Q5/8/PP3PPP/6K1 w - - 0 1",
        solutions: ["c4g8"],
        hint: "Farzin g8 ga shoh beradi. Qora uni faqat ruh bilan ola oladi.",
        success: "Filidor mati! Ruh g8 ni egalladi va ot f7 da mat qiladi.",
      },
      {
        type: "puzzles",
        text: "Bo'g'ilgan mat bo'yicha masalalarni yeching.",
        theme: "smotheredMate",
      },
    ],
  },
  {
    slug: "lusena",
    stage: 3,
    title: "Lusena pozitsiyasi",
    summary: "Ruh endshpilida g'alaba: ko'prik qurish.",
    steps: [
      {
        type: "text",
        text: "Lusena pozitsiyasi — ruh endshpilining eng muhim pozitsiyasi. Oq piyoda aylanishiga bir qadam qoldi, lekin oq shoh uning oldida qamalib qolgan. G'alaba usuli — «ko'prik qurish».",
        fen: "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1",
      },
      {
        type: "text",
        text: "Reja: ruh bilan shoh berib, qora shohni piyodadan uzoqlashtiring. Keyin ruhni to'rtinchi qatorga qo'ying. Oq shoh chiqqach, qora ruh orqadan shoh beradi — shunda oq ruh shohni to'sib, ko'prik quradi.",
        fen: "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1",
        arrows: [
          ["c1", "d1"],
          ["d1", "d4"],
        ],
      },
      {
        type: "move",
        text: "Qora ruh orqadan shoh beryapti. Ko'prik quring!",
        fen: "8/1P2k3/8/1K6/3R4/8/8/1r6 w - - 0 1",
        solutions: ["d4b4"],
        hint: "Ruh bilan shohni to'sing — ruh to'rtinchi qatorda aynan shu uchun turibdi.",
        success: "Ko'prik tayyor! Shoh berishlar tugadi va piyoda farzinga aylanadi.",
      },
      {
        type: "play",
        text: "Endi o'zingiz: Lusena pozitsiyasini yuting va mat qiling. Bot iloji boricha himoyalanadi.",
        fen: "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1",
        botLevel: DEFENDER,
      },
      {
        type: "puzzles",
        text: "Ruh endshpili bo'yicha masalalarni yeching.",
        theme: "rookEndgame",
      },
    ],
  },
  {
    slug: "filidor",
    stage: 3,
    title: "Filidor pozitsiyasi",
    summary: "Ruh endshpilida durang usuli.",
    steps: [
      {
        type: "text",
        text: "Filidor pozitsiyasi — kuchsiz tomon uchun durang usuli. Qora shoh piyodaning oldida, qora ruh esa oltinchi qatorda turib, oq shohni oldinga o'tkazmaydi.",
        fen: "4k3/7R/r7/3KP3/8/8/8/8 b - - 0 1",
        arrows: [["a6", "h6"]],
      },
      {
        type: "quiz",
        text: "Qora ruh oltinchi qatorda nima qiladi?",
        options: [
          "Oq shohni oldinga o'tkazmaydi",
          "Piyodaga hujum qiladi",
          "Oq ruhni bog'laydi",
        ],
        answer: 0,
        explanation: "Oq shoh oltinchi qatorga chiqsa, piyodaga yo'l ochadi va qora shohga mat bilan tahdid qiladi. Qora ruh bunga yo'l qo'ymaydi.",
      },
      {
        type: "quiz",
        text: "Oq piyodani oltinchi qatorga sursa, qora nima qiladi?",
        options: [
          "Ruhni pastga tushirib, orqadan shoh beradi",
          "Ruhni oltinchi qatorda qoldiradi",
          "Shohni chetga olib ketadi",
        ],
        answer: 0,
        explanation: "Piyoda oltinchi qatorga chiqqach, oq shoh uning orqasida yashirina olmaydi. Qora ruh pastga tushib, orqadan to'xtovsiz shoh beradi — bu durang.",
      },
      {
        type: "move",
        text: "Oq piyodani e6 ga surdi. Qora bilan to'g'ri javob bering.",
        speech: "Oq piyodani e oltiga surdi. Qora bilan to'g'ri javob bering.",
        fen: "4k3/7R/r3P3/3K4/8/8/8/8 b - - 0 1",
        solutions: ["a6a1", "a6a2", "a6a3", "a6a4", "a6a5"],
        hint: "Ruhni vertikal bo'ylab pastga tushiring — oq shohga orqadan shoh berish uchun.",
        success: "To'g'ri! Endi oq shohga orqadan shoh beraverasiz va u yashirinadigan joy topolmaydi — durang.",
      },
    ],
  },
];
