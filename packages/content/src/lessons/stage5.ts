import type { Lesson } from "../schema.js";

// Mating practice against the strongest bot: it defends as well as possible.
const DEFENDER = 10;

export const stage5: Lesson[] = [
  {
    slug: "opera-partiyasi",
    stage: 5,
    title: "Opera partiyasi",
    summary: "Morfining mashhur partiyasi: rivojlanish va qurbon.",
    steps: [
      {
        type: "text",
        text: "1858-yili Parij operasida Pol Morfi ikki havaskorga qarshi o'ynadi — ular maslahatlashib yurishgan. Bu partiya tez rivojlanish, ochiq vertikal va qurbonning eng yaxshi namunasi. 9 yurishdan keyin Morfining barcha donalari o'yinda, qora shoh esa hali markazda.",
        fen: "rn2kb1r/p3qppp/2p2n2/1p2p1B1/2B1P3/1QN5/PPP2PPP/R3K2R w KQkq - 0 10",
        highlights: ["e8"],
      },
      {
        type: "move",
        text: "Qurbon bilan qora shohga yo'l oching!",
        fen: "rn2kb1r/p3qppp/2p2n2/1p2p1B1/2B1P3/1QN5/PPP2PPP/R3K2R w KQkq - 0 10",
        solutions: ["c3b5"],
        hint: "Ot b5 dagi piyodani oladi. c6 piyoda uni qaytarib olsa, fil qora shohga shoh beradi.",
        success: "Morfi ham shunday o'ynadi! Qora shohga yo'llar ochilmoqda.",
      },
      {
        type: "move",
        text: "Qora d7 dagi ot shohga bog'langan va joyidan qimirlay olmaydi. Bosimni kuchaytiring!",
        fen: "3rkb1r/p2nqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR3R w k - 3 13",
        solutions: ["d1d7"],
        hint: "Ruh bilan d7 dagi otni oling. Qora qaytarib olsa, ikkinchi ruh d-vertikalga chiqadi.",
        success: "Ajoyib! Morfi ham ruhni qurbon qildi va keyin ikkinchi ruhni d1 ga olib chiqdi.",
      },
      {
        type: "move",
        text: "Final: farzinni qurbon qiling va ikki yurishda mat qiling.",
        fen: "4kb1r/p2n1ppp/4q3/4p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 16",
        solutions: ["b3b8"],
        hint: "Farzin b8 ga shoh beradi. Qora uni faqat ot bilan ola oladi.",
        success: "Farzin qurbon! Ot uni oladi va d8 katagi himoyasiz qoladi.",
      },
      {
        type: "move",
        text: "Mat qiling!",
        fen: "1n2kb1r/p4ppp/4q3/4p1B1/4P3/8/PPP2PPP/2KR4 w k - 0 17",
        goal: "mate",
        hint: "Ruh d8 ga chiqadi, g5 dagi fil esa e7 ni yopib turibdi.",
        success: "Mat! 17 yurishda tugagan mashhur Opera partiyasi.",
      },
      {
        type: "quiz",
        text: "Opera partiyasidan asosiy saboq nima?",
        options: [
          "Rivojlanishda oldinda bo'lsangiz, pozitsiyani qurbon bilan oching",
          "Farzinni debyutda erta chiqaring",
          "Material har doim eng muhim",
        ],
        answer: 0,
        explanation: "Morfining barcha donalari o'yinda edi, qoraning donalari esa joyidan qo'zg'almagan. Shunday paytda qurbonlar hujumni hal qiluvchi qiladi.",
      },
    ],
  },
  {
    slug: "fil-va-ot-bilan-mat",
    stage: 5,
    title: "Fil va ot bilan mat",
    summary: "Eng qiyin oddiy mat.",
    steps: [
      {
        type: "text",
        text: "Fil va ot bilan mat — eng qiyin oddiy mat. Mat faqat fil rangidagi burchakda bo'ladi. Bu yerda fil qora kataklarda yuradi, demak mat a1 yoki h8 burchagida.",
        speech: "Fil va ot bilan mat — eng qiyin oddiy mat. Mat faqat fil rangidagi burchakda bo'ladi. Bu yerda fil qora kataklarda yuradi, demak mat a bir yoki h sakkiz burchagida.",
        fen: "8/8/8/4k3/8/8/8/2B1KN2 w - - 0 1",
        highlights: ["a1", "h8"],
      },
      {
        type: "text",
        text: "Reja: uchala dona birgalikda raqib shohini chetga suradi. Shoh noto'g'ri burchakka qochsa, uni chet bo'ylab to'g'ri burchak tomon haydang: ot «W» harfiga o'xshash yo'l bilan yuradi, fil va shoh esa qochish kataklarini yopadi.",
      },
      {
        type: "quiz",
        text: "Fil oq kataklarda yursa, mat qaysi burchakda bo'ladi?",
        options: ["a8 yoki h1", "a1 yoki h8"],
        answer: 0,
        explanation: "a8 va h1 — oq kataklar. Mat faqat fil nazorat qila oladigan rangdagi burchakda bo'ladi.",
      },
      {
        type: "play",
        text: "Fil va ot bilan mat qiling. Bot iloji boricha himoyalanadi. Shoshmang: 50 yurish ichida mat qilish kerak.",
        fen: "8/8/8/4k3/8/8/8/2B1KN2 w - - 0 1",
        botLevel: DEFENDER,
      },
    ],
  },
  {
    slug: "sokin-yurish",
    stage: 5,
    title: "Sokin yurish",
    summary: "Shoh ham bermaydigan, dona ham olmaydigan kuchli yurish.",
    steps: [
      {
        type: "text",
        text: "Sokin yurish shoh ham bermaydi, dona ham olmaydi, lekin kuchli tahdid yaratadi yoki raqibning himoyasini buzadi. Ularni topish qiyin, chunki ko'z odatda faqat majburiy yurishlarni izlaydi.",
      },
      {
        type: "text",
        text: "Hujum to'xtab qolganday tuyulsa, so'rang: «Raqibning qaysi donasi himoyani ushlab turibdi? Uni qanday chalg'itish yoki yo'lini to'sish mumkin?» Ko'pincha javob — bitta sokin yurish.",
      },
      {
        type: "quiz",
        text: "Sokin yurishni topish uchun nima qilish kerak?",
        options: [
          "Majburiy yurishlardan tashqari, raqibning himoyasini buzadigan yurishlarni ham ko'rish",
          "Faqat shoh beradigan yurishlarni ko'rish",
          "Birinchi ko'ringan yurishni qilish",
        ],
        answer: 0,
        explanation: "Majburiy yurishlar ish bermasa, raqibning javob imkoniyatlarini cheklaydigan sokin yurishni qidiring. Kuchli o'yinchilarni aynan shunday yurishlar ajratib turadi.",
      },
      {
        type: "puzzles",
        text: "Sokin yurish bo'yicha masalalarni yeching.",
        theme: "quietMove",
      },
    ],
  },
  {
    slug: "vaqt-boshqaruvi",
    stage: 5,
    title: "Vaqtni boshqarish",
    summary: "Soat ham o'yinning bir qismi.",
    steps: [
      {
        type: "text",
        text: "Soat ham o'yinning bir qismi. Vaqtni taqsimlang: tanish debyutda tez o'ynang, murakkab o'rta o'yinda esa ko'proq o'ylang.",
      },
      {
        type: "text",
        text: "Uzoq o'ylash kerak bo'lgan paytlar: urishlar va qurbonlar bo'lganda, reja o'zgarganda yoki endshpilga o'tish haqida qaror qilinganda. Oddiy, tabiiy yurishlarga ko'p vaqt sarflamang.",
      },
      {
        type: "quiz",
        text: "Sizda 1 daqiqa qoldi, raqibda 10 daqiqa. Nima qilasiz?",
        options: [
          "Oddiy va xavfsiz yurishlarni tez qilaman",
          "Har yurishda eng yaxshisini uzoq qidiraman",
          "Tavakkal qurbon qilaman",
        ],
        answer: 0,
        explanation: "Vaqt tanqisligida eng yaxshi yurish emas, xavfsiz yurish muhim. Donalarni himoyalang, pozitsiyani sodda qiling va vaqt tugashiga yo'l qo'ymang.",
      },
      {
        type: "quiz",
        text: "Debyutda nega tez o'ynash kerak?",
        options: [
          "Tanish yurishlarga vaqt sarflamay, uni o'rta o'yinga saqlash uchun",
          "Debyutda xato bo'lmaydi",
        ],
        answer: 0,
        explanation: "Debyutda siz tayyorlangan yurishlarni qilasiz. Tejalgan vaqt keyin, pozitsiya murakkablashganda kerak bo'ladi.",
      },
    ],
  },
  {
    slug: "tayyorgarlik-va-psixologiya",
    stage: 5,
    title: "Tayyorgarlik va psixologiya",
    summary: "O'yindan oldin, o'yin davomida va o'yindan keyin.",
    steps: [
      {
        type: "text",
        text: "Muhim o'yindan oldin raqibingizni o'rganing: u qaysi debyutlarni o'ynaydi? Siz yaxshi biladigan, raqib esa noqulay his qiladigan pozitsiyalarni tanlang.",
      },
      {
        type: "text",
        text: "Xatodan keyin chuqur nafas oling va pozitsiyani qaytadan baholang. Bitta xato hali mag'lubiyat emas. O'yinlarning ko'pchiligi birinchi xatodan emas, undan keyingi vahimadan yutqaziladi.",
      },
      {
        type: "text",
        text: "O'yindan keyin har bir partiyangizni tahlil qiling. Yutqazgan o'yinlar eng yaxshi ustoz: xatolaringizni yozib boring va shu mavzudagi masalalarni yeching.",
      },
      {
        type: "quiz",
        text: "Qo'pol xato qildingiz. Eng to'g'ri harakat qaysi?",
        options: [
          "Tinchlanib, yangi pozitsiyada eng yaxshi rejani qidirish",
          "Darhol taslim bo'lish",
          "Tez-tez yurib, xatoni unutish",
        ],
        answer: 0,
        explanation: "Pozitsiya o'zgardi — endi unga yangidan qarang. Raqib ham xato qilishi mumkin, shuning uchun eng qat'iy qarshilikni ko'rsating.",
      },
      {
        type: "quiz",
        text: "Yutuq pozitsiyada nimadan ehtiyot bo'lish kerak?",
        options: [
          "Bo'shashib, raqibning tahdidlarini unutishdan",
          "Donalarni almashtirishdan",
        ],
        answer: 0,
        explanation: "Ustun pozitsiyada ko'pchilik bo'shashadi va raqibning imkoniyatlarini ko'rmay qoladi. Har yurishda raqibning tahdidlarini tekshirishda davom eting.",
      },
    ],
  },
];
