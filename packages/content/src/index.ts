import { type ContentTranslation, type Lang, localizeLesson, localizeStage } from "./i18n.js";
import { stage0 } from "./lessons/stage0.js";
import { stage1 } from "./lessons/stage1.js";
import { stage2 } from "./lessons/stage2.js";
import { stage3 } from "./lessons/stage3.js";
import { stage4 } from "./lessons/stage4.js";
import { stage5 } from "./lessons/stage5.js";
import type { Lesson } from "./schema.js";
import { STAGES, type Stage } from "./stages.js";
import { en } from "./translations/en.js";
import { ru } from "./translations/ru.js";

export * from "./i18n.js";
export * from "./narration.js";
export * from "./schema.js";
export * from "./stages.js";
export * from "./validate.js";

// All lessons in learning order, in Uzbek (the source language).
export const LESSONS: readonly Lesson[] = [
  ...stage0,
  ...stage1,
  ...stage2,
  ...stage3,
  ...stage4,
  ...stage5,
];

export const TRANSLATIONS: Record<Exclude<Lang, "uz">, ContentTranslation> = { ru, en };

export function findLesson(slug: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.slug === slug);
}

export function lessonsOfStage(stage: number): Lesson[] {
  return LESSONS.filter((lesson) => lesson.stage === stage);
}

// Lessons and stages with their words in `lang`.
export function localizedContent(lang: Lang): {
  lessons: Lesson[];
  stages: Stage[];
} {
  const translation = lang === "uz" ? undefined : TRANSLATIONS[lang];
  return {
    lessons: LESSONS.map((lesson) => localizeLesson(lesson, translation)),
    stages: STAGES.map((stage) => localizeStage(stage, translation)),
  };
}
