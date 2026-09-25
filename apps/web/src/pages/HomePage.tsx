import { useTranslation } from 'react-i18next'

const SECTIONS = [
  { key: 'learn', icon: '♙' },
  { key: 'bot', icon: '♞' },
  { key: 'friends', icon: '♚' },
] as const

export function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-board-dark px-6 py-12 text-center text-board-light sm:py-16">
        <h1 className="text-3xl font-bold sm:text-4xl">{t('app.name')}</h1>
        <p className="mx-auto mt-3 max-w-xl text-lg opacity-90">
          {t('app.tagline')}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {SECTIONS.map(({ key, icon }) => (
          <article
            key={key}
            className="rounded-xl border border-stone-200 bg-white p-5"
          >
            <div className="flex items-start justify-between">
              <span className="text-4xl leading-none" aria-hidden>
                {icon}
              </span>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
                {t('home.soon')}
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold">
              {t(`home.${key}.title`)}
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              {t(`home.${key}.text`)}
            </p>
          </article>
        ))}
      </section>
    </div>
  )
}
