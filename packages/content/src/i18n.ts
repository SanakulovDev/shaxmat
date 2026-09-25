import type { Lesson, Step } from "./schema.js";
import type { Stage } from "./stages.js";

export const LANGUAGES = ["uz", "ru", "en"] as const;
export type Lang = (typeof LANGUAGES)[number];

// Lessons are written in Uzbek. A translation replaces only the words; the
// chess data (positions, solutions, stars) always comes from the lesson.
export type StepTranslation = {
  text: string;
  speech?: string;
  options?: string[];
  explanation?: string;
  hint?: string;
  success?: string;
};

export type LessonTranslation = {
  title: string;
  summary: string;
  steps: StepTranslation[];
};

export type StageTranslation = { title: string; summary: string };

export type ContentTranslation = {
  stages: Record<number, StageTranslation>;
  lessons: Record<string, LessonTranslation>;
};

function localizeStep(step: Step, words: StepTranslation | undefined): Step {
  if (!words) return step;
  const localized = { ...step, text: words.text, speech: words.speech };
  if (localized.type === "quiz") {
    localized.options = words.options ?? localized.options;
    localized.explanation = words.explanation ?? localized.explanation;
  }
  if (localized.type === "move") {
    localized.hint = words.hint ?? localized.hint;
    localized.success = words.success ?? localized.success;
  }
  return localized;
}

export function localizeLesson(
  lesson: Lesson,
  translation: ContentTranslation | undefined,
): Lesson {
  const words = translation?.lessons[lesson.slug];
  if (!words) return lesson;
  return {
    ...lesson,
    title: words.title,
    summary: words.summary,
    steps: lesson.steps.map((step, index) => localizeStep(step, words.steps[index])),
  };
}

export function localizeStage(
  stage: Stage,
  translation: ContentTranslation | undefined,
): Stage {
  const words = translation?.stages[stage.id];
  return words ? { ...stage, ...words } : stage;
}

// Problems in a translation: missing lessons, a different number of steps
// or quiz options, or feedback texts that the lesson has but the
// translation lacks.
export function validateTranslation(
  lessons: readonly Lesson[],
  stages: readonly Stage[],
  translation: ContentTranslation,
): string[] {
  const errors: string[] = [];
  for (const stage of stages) {
    if (!translation.stages[stage.id]) errors.push(`stage ${stage.id}: missing`);
  }
  const slugs = new Set(lessons.map((lesson) => lesson.slug));
  for (const slug of Object.keys(translation.lessons)) {
    if (!slugs.has(slug)) errors.push(`${slug}: no such lesson`);
  }
  for (const lesson of lessons) {
    const words = translation.lessons[lesson.slug];
    if (!words) {
      errors.push(`${lesson.slug}: missing`);
      continue;
    }
    if (words.steps.length !== lesson.steps.length) {
      errors.push(
        `${lesson.slug}: ${words.steps.length} steps, lesson has ${lesson.steps.length}`,
      );
      continue;
    }
    lesson.steps.forEach((step, index) => {
      const at = `${lesson.slug} step ${index + 1}`;
      const w = words.steps[index]!;
      if (step.type === "quiz") {
        if (w.options?.length !== step.options.length) errors.push(`${at}: options`);
        if (!w.explanation) errors.push(`${at}: explanation`);
      }
      if (step.type === "move") {
        if (step.hint && !w.hint) errors.push(`${at}: hint`);
        if (step.success && !w.success) errors.push(`${at}: success`);
      }
    });
  }
  return errors;
}
