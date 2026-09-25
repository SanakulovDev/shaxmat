import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { canNarrate, narrate, stopNarration, useNarration } from './narration'

// Play/stop button for the current text and the autoplay switch. Hidden
// when there is neither a recording nor an Uzbek browser voice.
export function NarrationControls({ text }: { text: string }) {
  const { t } = useTranslation()
  const { playing, autoplay, setAutoplay } = useNarration()
  const [available, setAvailable] = useState<{ text: string; ok: boolean } | null>(
    null,
  )

  const { i18n } = useTranslation()
  // Browsers load their voice list after the page, so check again then.
  const [voicesVersion, setVoicesVersion] = useState(0)
  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') return
    const onChange = () => setVoicesVersion((n) => n + 1)
    speechSynthesis.addEventListener('voiceschanged', onChange)
    return () => speechSynthesis.removeEventListener('voiceschanged', onChange)
  }, [])

  useEffect(() => {
    let cancelled = false
    void canNarrate(text).then((ok) => {
      if (!cancelled) setAvailable({ text, ok })
    })
    return () => {
      cancelled = true
    }
  }, [text, i18n.language, voicesVersion])

  if (!available?.ok || available.text !== text) return null

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => (playing ? stopNarration() : void narrate(text))}
        aria-label={t(playing ? 'learn.audio.stop' : 'learn.audio.play')}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-board-dark text-lg text-white hover:opacity-90"
      >
        {playing ? '■' : '▶'}
      </button>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={autoplay}
          onChange={(event) => setAutoplay(event.target.checked)}
          className="h-4 w-4 accent-board-dark"
        />
        {t('learn.audio.autoplay')}
      </label>
    </div>
  )
}
