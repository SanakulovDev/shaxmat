import { Transform, type TransformCallback } from 'node:stream';

// Lichess archives are written by pzstd: every zstd frame is preceded by a
// "skippable frame" that holds the frame's size. Node's zstd decoder rejects
// skippable frames, so this stream removes them and passes the real frames
// through unchanged.
//
// Skippable frame: magic 0x184D2A50-0x184D2A5F (4 bytes LE), payload size
// (4 bytes LE), payload.
const SKIPPABLE_MAGIC_MIN = 0x184d2a50;
const SKIPPABLE_MAGIC_MAX = 0x184d2a5f;
const HEADER_SIZE = 8;

export class SkipZstdSkippableFrames extends Transform {
  private buffer = Buffer.alloc(0);
  // Bytes of the current real zstd frame still to pass through, or null
  // when frame sizes are unknown (plain zstd without skippable frames).
  private passthrough: number | null = 0;

  override _transform(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ) {
    if (this.passthrough === null) {
      callback(null, chunk);
      return;
    }
    this.buffer = Buffer.concat([this.buffer, chunk]);
    this.drain();
    callback();
  }

  override _flush(callback: TransformCallback) {
    if (this.buffer.length > 0) this.push(this.buffer);
    callback();
  }

  private drain() {
    while (this.passthrough !== null) {
      if (this.passthrough > 0) {
        if (this.buffer.length === 0) return;
        const take = Math.min(this.passthrough, this.buffer.length);
        this.push(this.buffer.subarray(0, take));
        this.buffer = this.buffer.subarray(take);
        this.passthrough -= take;
        continue;
      }

      if (this.buffer.length < HEADER_SIZE) return;
      const magic = this.buffer.readUInt32LE(0);
      if (magic < SKIPPABLE_MAGIC_MIN || magic > SKIPPABLE_MAGIC_MAX) {
        // Not pzstd: pass everything through from here on.
        this.push(this.buffer);
        this.buffer = Buffer.alloc(0);
        this.passthrough = null;
        return;
      }

      const payloadSize = this.buffer.readUInt32LE(4);
      if (this.buffer.length < HEADER_SIZE + payloadSize) return;
      // pzstd stores the next frame's compressed size in a 4-byte payload.
      const frameSize =
        payloadSize === 4 ? this.buffer.readUInt32LE(HEADER_SIZE) : null;
      this.buffer = this.buffer.subarray(HEADER_SIZE + payloadSize);
      this.passthrough = frameSize;
      if (frameSize === null) {
        this.push(this.buffer);
        this.buffer = Buffer.alloc(0);
        return;
      }
    }
  }
}
