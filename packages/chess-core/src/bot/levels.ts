// How a bot level picks its move.
export type BotStrategy =
  // Any legal move; prefers captures with the given probability.
  | { kind: 'random'; capturePreference: number }
  // Asks the engine for its top `multiPv` moves at a low depth, then picks one
  // at random: better moves are more likely (softmax with `temperatureCp`),
  // and with `blunderChance` any of the candidates is picked.
  | {
      kind: 'multipv';
      depth: number;
      multiPv: number;
      temperatureCp: number;
      blunderChance: number;
    }
  // Stockfish "Skill Level" option (0-20).
  | { kind: 'skill'; skillLevel: number; movetimeMs: number }
  // Stockfish UCI_LimitStrength + UCI_Elo. Stockfish accepts 1320-3190.
  | { kind: 'elo'; elo: number; movetimeMs: number }
  // Full strength.
  | { kind: 'full'; movetimeMs: number };

export type BotLevel = {
  level: number;
  // Approximate playing strength; calibrate with bot-vs-bot games.
  elo: number;
  // Takeback and hints are offered only against weak bots.
  helpers: boolean;
  strategy: BotStrategy;
};

export const BOT_LEVELS: readonly BotLevel[] = [
  {
    level: 1,
    elo: 250,
    helpers: true,
    strategy: { kind: 'random', capturePreference: 0.5 },
  },
  {
    level: 2,
    elo: 450,
    helpers: true,
    strategy: {
      kind: 'multipv',
      depth: 1,
      multiPv: 10,
      temperatureCp: 250,
      blunderChance: 0.35,
    },
  },
  {
    level: 3,
    elo: 650,
    helpers: true,
    strategy: {
      kind: 'multipv',
      depth: 2,
      multiPv: 8,
      temperatureCp: 150,
      blunderChance: 0.25,
    },
  },
  {
    level: 4,
    elo: 850,
    helpers: true,
    strategy: {
      kind: 'multipv',
      depth: 4,
      multiPv: 6,
      temperatureCp: 80,
      blunderChance: 0.15,
    },
  },
  {
    level: 5,
    elo: 1100,
    helpers: false,
    strategy: { kind: 'skill', skillLevel: 3, movetimeMs: 500 },
  },
  {
    level: 6,
    elo: 1350,
    helpers: false,
    strategy: { kind: 'elo', elo: 1350, movetimeMs: 800 },
  },
  {
    level: 7,
    elo: 1650,
    helpers: false,
    strategy: { kind: 'elo', elo: 1650, movetimeMs: 800 },
  },
  {
    level: 8,
    elo: 2000,
    helpers: false,
    strategy: { kind: 'elo', elo: 2000, movetimeMs: 1000 },
  },
  {
    level: 9,
    elo: 2400,
    helpers: false,
    strategy: { kind: 'elo', elo: 2400, movetimeMs: 1500 },
  },
  {
    level: 10,
    elo: 3000,
    helpers: false,
    strategy: { kind: 'full', movetimeMs: 2000 },
  },
];

export const MIN_BOT_LEVEL = 1;
export const MAX_BOT_LEVEL = BOT_LEVELS.length;

export function getBotLevel(level: number): BotLevel {
  const found = BOT_LEVELS.find((entry) => entry.level === level);
  if (!found) throw new RangeError(`Unknown bot level: ${level}`);
  return found;
}
