import { Chess, type Square } from "chess.js";
import { LessonSchema, type Lesson, type Step } from "./schema.js";
import { STAGES } from "./stages.js";

// Loads any lesson position, including ones without kings.
function load(fen: string): Chess {
  return new Chess(fen, { skipValidation: true });
}

function hasBothKings(chess: Chess): boolean {
  return (
    chess.findPiece({ type: "k", color: "w" }).length === 1 &&
    chess.findPiece({ type: "k", color: "b" }).length === 1
  );
}

// True when the side that is not to move is in check, which cannot happen
// in a real game.
function waitingSideInCheck(fen: string): boolean {
  const parts = fen.split(" ");
  parts[1] = parts[1] === "w" ? "b" : "w";
  parts[3] = "-";
  return load(parts.join(" ")).inCheck();
}

function legalUci(chess: Chess): string[] {
  return chess.moves({ verbose: true }).map((move) => move.lan);
}

function checkPosition(fen: string, errors: string[]) {
  let chess: Chess;
  try {
    chess = load(fen);
  } catch (error) {
    errors.push(`bad FEN "${fen}": ${(error as Error).message}`);
    return null;
  }
  if (hasBothKings(chess) && waitingSideInCheck(fen)) {
    errors.push(`side not to move is in check: "${fen}"`);
  }
  return chess;
}

// Squares the single piece can reach, moving any number of times.
function reachable(fen: string): Set<string> {
  const start = load(fen);
  const color = start.turn();
  const from = start
    .board()
    .flat()
    .find((cell) => cell?.color === color)!.square;
  const seen = new Set<string>([from]);
  const queue = [fen];
  while (queue.length > 0) {
    const chess = load(queue.shift()!);
    for (const move of chess.moves({ verbose: true })) {
      if (seen.has(move.to)) continue;
      seen.add(move.to);
      const next = load(move.after);
      next.setTurn(color);
      queue.push(next.fen());
    }
  }
  return seen;
}

function checkStep(step: Step, errors: string[]) {
  if ("fen" in step && step.fen) {
    const chess = checkPosition(step.fen, errors);
    if (!chess) return;

    if (step.type === "move") {
      const legal = legalUci(chess);
      for (const solution of step.solutions ?? []) {
        if (!legal.includes(solution)) {
          errors.push(`illegal solution ${solution} in "${step.fen}"`);
        }
      }
      if (step.goal) {
        const meetsGoal = chess.moves({ verbose: true }).filter((move) => {
          const after = load(move.after);
          if (step.goal === "check") return after.inCheck();
          if (step.goal === "mate") return after.isCheckmate();
          return move.isCapture();
        });
        if (meetsGoal.length === 0) {
          errors.push(`no move reaches goal ${step.goal} in "${step.fen}"`);
        }
        for (const solution of step.solutions ?? []) {
          if (!meetsGoal.some((move) => move.lan === solution)) {
            errors.push(`solution ${solution} misses goal ${step.goal}`);
          }
        }
      }
    }

    if (step.type === "stars") {
      const own = chess
        .board()
        .flat()
        .filter((cell) => cell?.color === chess.turn());
      if (own.length !== 1) {
        errors.push(`stars step needs exactly one piece to move: "${step.fen}"`);
        return;
      }
      if (own[0]!.type === "p") {
        errors.push(`stars step cannot use a pawn: "${step.fen}"`);
      }
      const canReach = reachable(step.fen);
      for (const star of step.stars) {
        if (star === own[0]!.square) errors.push(`star on start square ${star}`);
        if (!canReach.has(star)) errors.push(`star ${star} unreachable`);
        if (chess.get(star as Square)) errors.push(`star ${star} on a piece`);
      }
    }

    if (step.type === "play") {
      if (!hasBothKings(chess)) errors.push(`play step needs both kings`);
      if (chess.isGameOver()) errors.push(`play step starts finished`);
    }
  } else if (step.type === "move" || step.type === "stars" || step.type === "play") {
    errors.push(`${step.type} step needs a FEN`);
  }

  if (step.type === "quiz" && step.answer >= step.options.length) {
    errors.push(`quiz answer ${step.answer} out of range`);
  }
}

// Returns a list of problems; empty when the lessons are sound.
export function validateLessons(lessons: readonly Lesson[]): string[] {
  const errors: string[] = [];
  const slugs = new Set<string>();
  const stageIds = new Set(STAGES.map((stage) => stage.id));

  for (const raw of lessons) {
    const parsed = LessonSchema.safeParse(raw);
    if (!parsed.success) {
      errors.push(`${raw.slug}: ${parsed.error.message}`);
      continue;
    }
    const lesson = parsed.data;
    if (slugs.has(lesson.slug)) errors.push(`duplicate slug ${lesson.slug}`);
    slugs.add(lesson.slug);
    if (!stageIds.has(lesson.stage)) {
      errors.push(`${lesson.slug}: unknown stage ${lesson.stage}`);
    }
    lesson.steps.forEach((step, index) => {
      const stepErrors: string[] = [];
      checkStep(step, stepErrors);
      for (const message of stepErrors) {
        errors.push(`${lesson.slug} step ${index + 1}: ${message}`);
      }
    });
  }
  return errors;
}
