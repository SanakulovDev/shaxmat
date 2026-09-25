import type { Lang } from '@shaxmat/content'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import ru from './ru.json'
import uz from './uz.json'

export const LANGS: Lang[] = ['uz', 'ru', 'en']
const STORAGE_KEY = 'shaxmat.lang'

function isLang(value: string | null | undefined): value is Lang {
  return LANGS.includes(value as Lang)
}

// Saved choice first. Otherwise Uzbek, the platform's main language, unless
// the browser's first language is Russian. Many Uzbek users run an English
// browser, so English is only used once someone picks it.
function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLang(saved)) return saved
  } catch {
    // Storage can be blocked; fall through to the browser language.
  }
  const first = navigator.languages[0]?.slice(0, 2).toLowerCase()
  return first === 'ru' ? 'ru' : 'uz'
}

export function currentLang(): Lang {
  return isLang(i18n.language) ? i18n.language : 'uz'
}

export function setLang(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // Keep the choice for this visit only.
  }
  void i18n.changeLanguage(lang)
}

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})

void i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: initialLang(),
  fallbackLng: 'uz',
  supportedLngs: LANGS,
  interpolation: { escapeValue: false },
})

export default i18n
