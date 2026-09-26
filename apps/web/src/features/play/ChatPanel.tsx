import { type FormEvent, useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChatLine } from './api'

// Chat between two friends during and just after their game.
export function ChatPanel({
  lines,
  userId,
  onSend,
}: {
  lines: ChatLine[]
  userId: string
  onSend: (text: string) => Promise<string | null>
}) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputId = useId()
  const listEnd = useRef<HTMLLIElement>(null)

  useEffect(() => {
    listEnd.current?.scrollIntoView({ block: 'nearest' })
  }, [lines.length])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = text.trim()
    if (!message) return
    const failure = await onSend(message)
    setError(failure)
    if (!failure) setText('')
  }

  return (
    <section
      aria-labelledby="chat-title"
      className="rounded-xl border border-line bg-surface p-3"
    >
      <h2 id="chat-title" className="text-sm font-semibold">
        {t('play.chat.title')}
      </h2>
      <ol
        aria-live="polite"
        className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm"
      >
        {lines.length === 0 && <li className="text-muted">{t('play.chat.empty')}</li>}
        {lines.map((line) => (
          <li key={`${line.at}-${line.userId}`}>
            <span
              className={`font-semibold ${line.userId === userId ? 'text-lapis' : ''}`}
            >
              {line.name}:
            </span>{' '}
            {line.text}
          </li>
        ))}
        <li ref={listEnd} aria-hidden />
      </ol>
      <form onSubmit={(event) => void submit(event)} className="mt-2 flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          {t('play.chat.message')}
        </label>
        <input
          id={inputId}
          value={text}
          maxLength={200}
          autoComplete="off"
          onChange={(event) => setText(event.target.value)}
          className="min-w-0 flex-1 rounded-md border border-line px-2 py-1"
        />
        <button
          type="submit"
          className="rounded-md border border-line px-3 py-1 text-sm font-medium hover:bg-paper"
        >
          {t('play.chat.send')}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-700">
          {t(error === 'tooFast' ? 'play.chat.tooFast' : 'play.errors.generic')}
        </p>
      )}
    </section>
  )
}
