import type { Lang } from '@shaxmat/content'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGS, setLang } from '../i18n'

export function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { t, i18n } = useTranslation()
  const id = useId()
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {t('language.label')}
      </label>
      <select
        id={id}
        value={i18n.language}
        onChange={(event) => setLang(event.target.value as Lang)}
        className={`rounded-md border px-2 py-1.5 text-sm font-medium ${
          dark ? 'border-white/20 bg-white/5 text-board-light' : 'border-line bg-surface'
        }`}
      >
        {LANGS.map((lang) => (
          // Each language is named in itself, so anyone can find theirs.
          <option key={lang} value={lang} lang={lang} className="bg-surface text-ink">
            {t(`language.${lang}`)}
          </option>
        ))}
      </select>
    </>
  )
}
