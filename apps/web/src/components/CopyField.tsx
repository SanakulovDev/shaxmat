import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

// A read-only link with a copy button. If the clipboard is blocked, the text
// is selected so the user can copy it by hand.
export function CopyField({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation()
  const inputId = useId()
  const input = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2_000)
    return () => clearTimeout(timer)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      input.current?.select()
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      <div className="mt-1 flex gap-2">
        <input
          id={inputId}
          ref={input}
          readOnly
          value={value}
          onFocus={(event) => event.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 py-2 font-mono text-sm"
        />
        <button
          type="button"
          onClick={() => void copy()}
          className="shrink-0 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium hover:bg-paper"
        >
          {t('common.copy')}
        </button>
      </div>
      <p aria-live="polite" className="mt-1 h-5 text-sm text-green-800">
        {copied ? t('common.copied') : ''}
      </p>
    </div>
  )
}
