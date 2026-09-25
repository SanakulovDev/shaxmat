import { Readable } from 'node:stream';
import { text } from 'node:stream/consumers';
import { createZstdDecompress, zstdCompressSync } from 'node:zlib';
import { SkipZstdSkippableFrames } from './skip-zstd-skippable-frames.js';

// Builds the pzstd layout: [skippable frame with next size][zstd frame]...
function pzstd(parts: string[]): Buffer {
  const chunks = parts.flatMap((part) => {
    const frame = zstdCompressSync(Buffer.from(part));
    const header = Buffer.alloc(12);
    header.writeUInt32LE(0x184d2a50, 0);
    header.writeUInt32LE(4, 4);
    header.writeUInt32LE(frame.length, 8);
    return [header, frame];
  });
  return Buffer.concat(chunks);
}

// Splits data into small chunks so headers straddle chunk boundaries.
function streamOf(data: Buffer, chunkSize = 5): Readable {
  const chunks: Buffer[] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.subarray(i, i + chunkSize));
  }
  return Readable.from(chunks);
}

async function decode(data: Buffer) {
  return text(
    streamOf(data)
      .pipe(new SkipZstdSkippableFrames())
      .pipe(createZstdDecompress()),
  );
}

describe('SkipZstdSkippableFrames', () => {
  it('decodes a pzstd archive with several frames', async () => {
    await expect(decode(pzstd(['PuzzleId,FEN\n', '00008,r6k\n']))).resolves.toBe(
      'PuzzleId,FEN\n00008,r6k\n',
    );
  });

  it('passes plain zstd through unchanged', async () => {
    await expect(decode(zstdCompressSync(Buffer.from('plain')))).resolves.toBe(
      'plain',
    );
  });
});
