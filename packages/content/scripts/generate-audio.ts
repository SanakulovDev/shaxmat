// Records narration for every lesson text, in every language, with Azure
// Speech. Azure has Uzbek neural voices (uz-UZ-MadinaNeural,
// uz-UZ-SardorNeural) as well as Russian and English ones.
//
//   AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=westeurope \
//     pnpm --filter @shaxmat/content audio
//
// Options: --dry-run (count texts and characters only), --lang uz|ru|en
// (one language only; default: all).
// Files go to apps/web/public/audio/<id>.mp3; the id is a hash of the voice
// and text, so only new or changed texts are recorded again.
import { config } from "dotenv";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import {
  type Lang,
  LANGUAGES,
  localizedContent,
  narrationId,
  narrationText,
  type Step,
  VOICES,
} from "../src/index.js";

const OUT_DIR = new URL("../../../apps/web/public/audio/", import.meta.url);
// The free tier (F0) allows 20 requests per minute.
const DELAY_MS = Number(process.env.AZURE_SPEECH_DELAY_MS ?? 3500);

config({ path: new URL("../../../.env", import.meta.url), quiet: true });

const { values: args } = parseArgs({
  options: {
    "dry-run": { type: "boolean", default: false },
    lang: { type: "string" },
  },
});
const languages: Lang[] = args.lang ? [args.lang as Lang] : [...LANGUAGES];

// AZURE_SPEECH_VOICE_UZ=uz-UZ-SardorNeural and so on replace a default voice.
function voiceFor(lang: Lang): string {
  return process.env[`AZURE_SPEECH_VOICE_${lang.toUpperCase()}`] || VOICES[lang];
}

// Everything the lesson player can read aloud for a step.
function spokenTexts(step: Step): string[] {
  const texts = [narrationText(step)];
  if (step.type === "quiz") texts.push(step.explanation);
  if (step.type === "move" && step.success) texts.push(step.success);
  return texts;
}

function escapeXml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function synthesize(text: string, lang: Lang): Promise<Buffer> {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    throw new Error("Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in .env");
  }
  const voice = voiceFor(lang);
  const ssml =
    `<speak version="1.0" xml:lang="${voice.slice(0, 5)}"><voice name="${voice}">` +
    `<prosody rate="-8%">${escapeXml(text)}</prosody></voice></speak>`;

  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
          "User-Agent": "shaxmat-content",
        },
        body: ssml,
      },
    );
    if (response.ok) return Buffer.from(await response.arrayBuffer());
    if (response.status === 429 && attempt < 5) {
      await sleep(DELAY_MS * attempt * 2);
      continue;
    }
    throw new Error(`Azure Speech: HTTP ${response.status} ${await response.text()}`);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // id -> text and language, for every language.
  const texts = new Map<string, { text: string; lang: Lang }>();
  for (const lang of languages) {
    for (const lesson of localizedContent(lang).lessons) {
      for (const step of lesson.steps) {
        for (const text of spokenTexts(step)) {
          texts.set(narrationId(text, voiceFor(lang)), { text, lang });
        }
      }
    }
  }

  const missing = [...texts].filter(
    ([id]) => !existsSync(new URL(`${id}.mp3`, OUT_DIR)),
  );
  const characters = missing.reduce((sum, [, { text }]) => sum + text.length, 0);
  console.log(
    `${texts.size} texts, ${missing.length} to record (${characters} characters), languages: ${languages.join(", ")}`,
  );
  if (args["dry-run"]) return;

  await mkdir(OUT_DIR, { recursive: true });
  for (const [index, [id, { text, lang }]] of missing.entries()) {
    const audio = await synthesize(text, lang);
    await writeFile(new URL(`${id}.mp3`, OUT_DIR), audio);
    console.log(`[${index + 1}/${missing.length}] ${id} ${text.slice(0, 50)}`);
    if (index < missing.length - 1) await sleep(DELAY_MS);
  }

  // The player reads this list to know which texts have a recording. It
  // covers all languages, so a one-language run keeps the others' entries.
  const allIds = new Set<string>();
  for (const lang of LANGUAGES) {
    for (const lesson of localizedContent(lang).lessons) {
      for (const step of lesson.steps) {
        for (const text of spokenTexts(step)) allIds.add(narrationId(text, voiceFor(lang)));
      }
    }
  }
  const available = [...allIds].filter((id) =>
    existsSync(new URL(`${id}.mp3`, OUT_DIR)),
  );
  const voices = Object.fromEntries(LANGUAGES.map((lang) => [lang, voiceFor(lang)]));
  await writeFile(
    new URL("manifest.json", OUT_DIR),
    `${JSON.stringify({ voices, ids: available.sort() }, null, 2)}\n`,
  );
  console.log(`manifest.json: ${available.length} recordings`);
}

await main();
