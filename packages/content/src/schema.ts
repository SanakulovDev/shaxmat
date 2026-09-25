import { z } from "zod";

const Square = z.string().regex(/^[a-h][1-8]$/);
// UCI move: "e2e4", or "e7e8q" for a promotion.
const Uci = z.string().regex(/^[a-h][1-8][a-h][1-8][qrbn]?$/);
const Arrow = z.tuple([Square, Square]);

// Board picture shared by several step types.
const BoardFields = {
  fen: z.string().optional(),
  arrows: z.array(Arrow).optional(),
  highlights: z.array(Square).optional(),
};

// Explanation only. Optional `speech` replaces `text` for narration, e.g. to
// spell out notation that a voice would read badly.
const TextStep = z.object({
  type: z.literal("text"),
  text: z.string().min(1),
  speech: z.string().optional(),
  ...BoardFields,
});

// The learner makes one move. It counts when it is one of `solutions`, or
// when it meets `goal`.
const MoveStep = z
  .object({
    type: z.literal("move"),
    text: z.string().min(1),
    speech: z.string().optional(),
    fen: z.string(),
    solutions: z.array(Uci).min(1).optional(),
    goal: z.enum(["check", "mate", "capture"]).optional(),
    hint: z.string().optional(),
    success: z.string().optional(),
  })
  .refine((step) => step.solutions || step.goal, {
    message: "A move step needs solutions or a goal",
  });

// The learner moves their only piece until it has visited every star.
const StarsStep = z.object({
  type: z.literal("stars"),
  text: z.string().min(1),
  speech: z.string().optional(),
  fen: z.string(),
  stars: z.array(Square).min(1),
});

const QuizStep = z.object({
  type: z.literal("quiz"),
  text: z.string().min(1),
  speech: z.string().optional(),
  options: z.array(z.string().min(1)).min(2),
  answer: z.number().int().min(0),
  explanation: z.string().min(1),
  ...BoardFields,
});

// The learner plays the position out against a bot and must give mate.
const PlayStep = z.object({
  type: z.literal("play"),
  text: z.string().min(1),
  speech: z.string().optional(),
  fen: z.string(),
  botLevel: z.number().int().min(1).max(10),
});

// Points the learner to themed puzzles for practice.
const PuzzlesStep = z.object({
  type: z.literal("puzzles"),
  text: z.string().min(1),
  speech: z.string().optional(),
  theme: z.string().regex(/^[a-zA-Z0-9]+$/),
});

export const StepSchema = z.discriminatedUnion("type", [
  TextStep,
  MoveStep,
  StarsStep,
  QuizStep,
  PlayStep,
  PuzzlesStep,
]);

export const LessonSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  stage: z.number().int().min(0),
  title: z.string().min(1),
  summary: z.string().min(1),
  steps: z.array(StepSchema).min(1),
});

export type Step = z.infer<typeof StepSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type StepType = Step["type"];
