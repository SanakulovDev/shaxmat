import { LESSONS, localizedContent, STAGES, TRANSLATIONS } from "./index.js";
import { validateTranslation } from "./i18n.js";
import { narrationId } from "./narration.js";
import type { Lesson } from "./schema.js";
import { validateLessons } from "./validate.js";

describe("lessons", () => {
  it("are all valid", () => {
    expect(validateLessons(LESSONS)).toEqual([]);
  });

  it("cover stages 0 and 1", () => {
    const stages = new Set(LESSONS.map((lesson) => lesson.stage));
    expect([...stages]).toEqual([0, 1]);
  });
});

describe("validateLessons", () => {
  const lesson = (steps: Lesson["steps"]): Lesson => ({
    slug: "test",
    stage: 0,
    title: "Test",
    summary: "Test",
    steps,
  });

  it("finds an illegal solution", () => {
    const errors = validateLessons([
      lesson([
        {
          type: "move",
          text: "Move",
          fen: "8/8/8/8/8/8/8/R7 w - - 0 1",
          solutions: ["a1b2"],
        },
      ]),
    ]);
    expect(errors).toEqual([
      'test step 1: illegal solution a1b2 in "8/8/8/8/8/8/8/R7 w - - 0 1"',
    ]);
  });

  it("finds a position where the waiting side is in check", () => {
    const errors = validateLessons([
      lesson([
        {
          type: "play",
          text: "Play",
          fen: "8/8/8/3k4/8/8/8/3QK3 w - - 0 1",
          botLevel: 10,
        },
      ]),
    ]);
    expect(errors[0]).toContain("side not to move is in check");
  });

  it("finds a star the piece can never reach", () => {
    const errors = validateLessons([
      lesson([
        {
          type: "stars",
          text: "Stars",
          fen: "8/8/8/8/8/8/8/2B5 w - - 0 1",
          stars: ["d3"],
        },
      ]),
    ]);
    expect(errors).toEqual(["test step 1: star d3 unreachable"]);
  });

  it("finds a missing mate", () => {
    const errors = validateLessons([
      lesson([
        {
          type: "move",
          text: "Mate",
          fen: "4k3/8/8/8/8/8/8/R3K3 w - - 0 1",
          goal: "mate",
        },
      ]),
    ]);
    expect(errors[0]).toContain("no move reaches goal mate");
  });
});

describe("narrationId", () => {
  it("is stable and depends on text and voice", () => {
    const id = narrationId("Salom", "voice-a");
    expect(id).toMatch(/^[0-9a-f]{16}$/);
    expect(narrationId("Salom", "voice-a")).toBe(id);
    expect(narrationId("Salom!", "voice-a")).not.toBe(id);
    expect(narrationId("Salom", "voice-b")).not.toBe(id);
  });
});

describe("translations", () => {
  for (const [lang, translation] of Object.entries(TRANSLATIONS)) {
    it(`${lang} covers every lesson, step and stage`, () => {
      expect(validateTranslation(LESSONS, STAGES, translation)).toEqual([]);
    });
  }

  it("replaces words but keeps the chess data", () => {
    const { lessons, stages } = localizedContent("en");
    const rook = lessons.find((lesson) => lesson.slug === "ruh")!;
    const original = LESSONS.find((lesson) => lesson.slug === "ruh")!;
    expect(rook.title).toBe("The rook");
    expect(rook.steps.map((step) => step.type)).toEqual(
      original.steps.map((step) => step.type),
    );
    expect(rook.steps[3]).toMatchObject({
      solutions: ["d1d5"],
      hint: "The knight is on the same file as the rook.",
    });
    expect(stages[0]!.title).toBe("Basics");
  });

  it("drops the Uzbek speech override when the translation has none", () => {
    const { lessons } = localizedContent("en");
    const board = lessons.find((lesson) => lesson.slug === "taxta")!;
    expect(board.steps[2]!.speech).toBeUndefined();
  });

  it("finds a translation with a missing step", () => {
    const broken = structuredClone(TRANSLATIONS.en);
    broken.lessons.ruh!.steps.pop();
    expect(validateTranslation(LESSONS, STAGES, broken)).toEqual([
      "ruh: 3 steps, lesson has 4",
    ]);
  });
});
