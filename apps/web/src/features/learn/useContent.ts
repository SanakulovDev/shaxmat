import { localizedContent } from '@shaxmat/content'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { currentLang } from '../../i18n'

// Lessons and stages in the current interface language. Re-renders when the
// language changes, because useTranslation subscribes to it.
export function useContent() {
  useTranslation()
  const lang = currentLang()
  return useMemo(() => {
    const { lessons, stages } = localizedContent(lang)
    return {
      lang,
      lessons,
      stages,
      findLesson: (slug: string) => lessons.find((l) => l.slug === slug),
      lessonsOfStage: (stage: number) => lessons.filter((l) => l.stage === stage),
    }
  }, [lang])
}
