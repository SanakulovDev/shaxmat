import type { Lang } from "./i18n.js";
import type { Step } from "./schema.js";

// The text a step's narration reads out.
export function narrationText(step: Step): string {
  return step.speech ?? step.text;
}

// Stable id of a narration text, used as the audio file name. When the text
// changes, the id changes, so an old recording is never played for new text.
// FNV-1a, 64-bit, as 16 hex digits.
export function narrationId(text: string, voice: string): string {
  let hash = 0xcbf29ce484222325n;
  const bytes = new TextEncoder().encode(`${voice}\n${text}`);
  for (const byte of bytes) {
    hash ^= BigInt(byte);
    hash = (hash * 0x100000001b3n) & 0xffffffffffffffffn;
  }
  return hash.toString(16).padStart(16, "0");
}

// Azure Speech neural voice per language.
export const VOICES: Record<Lang, string> = {
  uz: "uz-UZ-MadinaNeural",
  ru: "ru-RU-SvetlanaNeural",
  en: "en-US-JennyNeural",
};
