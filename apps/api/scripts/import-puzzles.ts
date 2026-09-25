// Imports puzzles from the Lichess puzzle database (CC0 license):
// https://database.lichess.org/#puzzles
//
//   pnpm --filter api puzzles:import -- --limit 50000
//   pnpm --filter api puzzles:import -- --file ./lichess_db_puzzle.csv.zst
//
// Without --file the archive is streamed from Lichess, and the download stops
// as soon as --limit puzzles are imported.
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { Readable } from 'node:stream';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { parseArgs } from 'node:util';
import { createZstdDecompress } from 'node:zlib';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { SkipZstdSkippableFrames } from './skip-zstd-skippable-frames.js';

const SOURCE_URL = 'https://database.lichess.org/lichess_db_puzzle.csv.zst';
const BATCH_SIZE = 1000;

const { values: args } = parseArgs({
  options: {
    file: { type: 'string' },
    limit: { type: 'string', default: '50000' },
    // Well-tested puzzles only: many plays, liked, stable rating.
    'min-plays': { type: 'string', default: '1000' },
    'min-popularity': { type: 'string', default: '80' },
    'max-deviation': { type: 'string', default: '100' },
  },
});

const limit = Number(args.limit);
const minPlays = Number(args['min-plays']);
const minPopularity = Number(args['min-popularity']);
const maxDeviation = Number(args['max-deviation']);

config({ path: '../../.env', quiet: true });
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function openSource(): Promise<Readable> {
  if (args.file) return createReadStream(args.file);
  const response = await fetch(SOURCE_URL);
  if (!response.ok || !response.body) {
    throw new Error(`Download failed: HTTP ${response.status}`);
  }
  // fetch returns the DOM stream type; Node's stream type is the same object.
  return Readable.fromWeb(response.body as NodeReadableStream);
}

type PuzzleRow = {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  ratingDeviation: number;
  popularity: number;
  plays: number;
  themes: string[];
};

// Columns: PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,
// Themes,GameUrl,OpeningTags
function parseLine(line: string): PuzzleRow | null {
  const [id, fen, moves, rating, deviation, popularity, plays, themes] =
    line.split(',');
  if (!id || !fen || !moves || id === 'PuzzleId') return null;
  return {
    id,
    fen,
    moves: moves.split(' '),
    rating: Number(rating),
    ratingDeviation: Number(deviation),
    popularity: Number(popularity),
    plays: Number(plays),
    themes: themes ? themes.split(' ') : [],
  };
}

function wanted(row: PuzzleRow): boolean {
  return (
    row.plays >= minPlays &&
    row.popularity >= minPopularity &&
    row.ratingDeviation <= maxDeviation
  );
}

async function main() {
  const source = await openSource();
  const csv = source
    .pipe(new SkipZstdSkippableFrames())
    .pipe(createZstdDecompress());
  const lines = createInterface({ input: csv, crlfDelay: Infinity });

  let imported = 0;
  let scanned = 0;
  let batch: PuzzleRow[] = [];

  const flush = async () => {
    if (batch.length === 0) return;
    const { count } = await prisma.puzzle.createMany({
      data: batch,
      skipDuplicates: true,
    });
    imported += count;
    batch = [];
    process.stdout.write(`\rscanned ${scanned}, imported ${imported}`);
  };

  for await (const line of lines) {
    scanned += 1;
    const row = parseLine(line);
    if (!row || !wanted(row)) continue;
    batch.push(row);
    if (batch.length >= BATCH_SIZE) await flush();
    if (imported + batch.length >= limit) break;
  }
  await flush();
  source.destroy();
  process.stdout.write('\n');
  console.log(`Done: ${imported} new puzzles.`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
