import { type Lang, narrationId } from '@shaxmat/content'
import { create } from 'zustand'
import { currentLang } from '../../i18n'

// Written by `pnpm content:audio`: the voice used for each language and the
// ids of the texts that have a recording.
type Manifest = { voices: Partial<Record<Lang, string>>; ids: string[] }

const AUTOPLAY_KEY = 'shaxmat.narration.autoplay'

let manifest: Promise<Manifest | null> | null = null
let currentAudio: HTMLAudioElement | null = null

// Recorded narration made by `pnpm content:audio`. Missing when no
// recordings were generated yet.
function loadManifest(): Promise<Manifest | null> {
  manifest ??= fetch('/audio/manifest.json')
    .then((response) => (response.ok ? (response.json() as Promise<Manifest>) : null))
    .catch(() => null)
  return manifest
}

// A browser voice for the current language. Browsers usually have Russian
// and English voices; an Uzbek one is rare, so Uzbek relies on recordings.
function browserVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null
  const lang = currentLang()
  return (
    speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith(lang)) ?? null
  )
}

async function recordingUrl(text: string): Promise<string | null> {
  const loaded = await loadManifest()
  const voice = loaded?.voices[currentLang()]
  if (!loaded || !voice) return null
  const id = narrationId(text, voice)
  return loaded.ids.includes(id) ? `/audio/${id}.mp3` : null
}

function readAutoplay(): boolean {
  try {
    return localStorage.getItem(AUTOPLAY_KEY) !== 'off'
  } catch {
    return true
  }
}

type NarrationState = {
  autoplay: boolean
  playing: boolean
  setAutoplay: (on: boolean) => void
}

export const useNarration = create<NarrationState>()((set) => ({
  autoplay: readAutoplay(),
  playing: false,
  setAutoplay: (on) => {
    try {
      localStorage.setItem(AUTOPLAY_KEY, on ? 'on' : 'off')
    } catch {
      // Keep the choice for this visit only.
    }
    if (!on) stopNarration()
    set({ autoplay: on })
  },
}))

export async function canNarrate(text: string): Promise<boolean> {
  return (await recordingUrl(text)) !== null || browserVoice() !== null
}

export function stopNarration() {
  currentAudio?.pause()
  currentAudio = null
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
  useNarration.setState({ playing: false })
}

// Reads `text` aloud, stopping anything already playing.
export async function narrate(text: string) {
  stopNarration()
  const url = await recordingUrl(text)
  const done = () => useNarration.setState({ playing: false })

  if (url) {
    const audio = new Audio(url)
    currentAudio = audio
    audio.onended = done
    useNarration.setState({ playing: true })
    // Autoplay can be blocked before the first click on the page.
    await audio.play().catch(done)
    return
  }

  const voice = browserVoice()
  if (!voice) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.voice = voice
  utterance.lang = voice.lang
  utterance.rate = 0.95
  utterance.onend = done
  utterance.onerror = done
  useNarration.setState({ playing: true })
  speechSynthesis.speak(utterance)
}

// Narrates only when the learner keeps autoplay on.
export function narrateIfAutoplay(text: string) {
  if (useNarration.getState().autoplay) void narrate(text)
}
