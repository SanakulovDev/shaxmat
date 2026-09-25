export type StageExam = {
  // Beat a bot of this level or stronger.
  botLevel: number;
  // Solve at least this many puzzles.
  puzzlesSolved?: number;
  // Reach this puzzle rating.
  puzzleRating?: number;
};

export type Stage = {
  id: number;
  title: string;
  summary: string;
  // Approximate rating range the stage covers.
  ratingRange: string;
  exam: StageExam;
};

export const STAGES: readonly Stage[] = [
  {
    id: 0,
    title: "Asoslar",
    summary: "Taxta, donalarning yurishi, shoh, mat va maxsus qoidalar.",
    ratingRange: "0",
    exam: { botLevel: 1 },
  },
  {
    id: 1,
    title: "Boshlang'ich",
    summary:
      "Donalarning qiymati, oddiy matlar, debyut qoidalari va birinchi taktik usullar.",
    ratingRange: "0–800",
    exam: { botLevel: 3, puzzlesSolved: 20 },
  },
  {
    id: 2,
    title: "Havaskor",
    summary:
      "Taktika motivlari, piyoda endshpili va oddiy debyut repertuari.",
    ratingRange: "800–1200",
    exam: { botLevel: 5, puzzleRating: 1000 },
  },
  {
    id: 3,
    title: "O'rta daraja",
    summary:
      "O'rta o'yin rejasi, piyoda tuzilmalari, hisoblash va ruh endshpillari.",
    ratingRange: "1200–1600",
    exam: { botLevel: 6, puzzleRating: 1400 },
  },
  {
    id: 4,
    title: "Kuchli o'yinchi",
    summary: "Strategiya, profilaktika va chuqurroq debyut repertuari.",
    ratingRange: "1600–2000",
    exam: { botLevel: 8, puzzleRating: 1800 },
  },
  {
    id: 5,
    title: "Professional",
    summary:
      "Klassik partiyalar tahlili, murakkab endshpil, tayyorgarlik va psixologiya.",
    ratingRange: "2000+",
    exam: { botLevel: 9, puzzleRating: 2200 },
  },
];
