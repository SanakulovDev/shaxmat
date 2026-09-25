import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import uz from './uz.json'

// Only Uzbek for now. Add a language by adding its JSON file here.
void i18n.use(initReactI18next).init({
  resources: { uz: { translation: uz } },
  lng: 'uz',
  fallbackLng: 'uz',
  interpolation: { escapeValue: false },
})

export default i18n
