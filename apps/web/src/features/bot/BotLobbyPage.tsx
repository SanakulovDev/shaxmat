import { BOT_LEVELS } from '@shaxmat/chess-core'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { BOT_AVATARS } from './avatars'

type ColorChoice = 'white' | 'black' | 'random'

const COLOR_CHOICES: ColorChoice[] = ['white', 'random', 'black']

export function BotLobbyPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [level, setLevel] = useState(1)
  const [color, setColor] = useState<ColorChoice>('white')

  function start() {
    const playerColor =
      color === 'random' ? (Math.random() < 0.5 ? 'white' : 'black') : color
    void navigate(`/bot/play?level=${level}&color=${playerColor}`)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('bot.chooseOpponent')}</h1>

      <ul className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {BOT_LEVELS.map((bot) => (
          <li key={bot.level}>
            <button
              type="button"
              onClick={() => setLevel(bot.level)}
              aria-pressed={level === bot.level}
              className={`group w-full rounded-xl border-2 bg-surface p-4 text-left motion-safe:transition ${
                level === bot.level
                  ? '-translate-y-1 border-board-dark shadow-lg'
                  : 'border-line hover:-translate-y-0.5 hover:border-board-dark/30 hover:shadow-md'
              }`}
            >
              <span
                className={`inline-block text-4xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${
                  level === bot.level ? 'scale-110' : ''
                }`}
                aria-hidden
              >
                {BOT_AVATARS[bot.level]}
              </span>
              <span className="mt-2 block font-semibold">
                {t(`bot.levels.${bot.level}.name`)}
              </span>
              <span className="block text-sm text-muted">
                {t(`bot.levels.${bot.level}.title`)}
              </span>
              <span className="mt-1 block text-xs text-muted">
                {t('bot.level', { level: bot.level })} · ~{bot.elo}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-4">
        <div
          role="group"
          aria-label={t('bot.color')}
          className="flex overflow-hidden rounded-lg border border-line bg-surface"
        >
          {COLOR_CHOICES.map((choice) => (
            <button
              key={choice}
              type="button"
              aria-pressed={color === choice}
              onClick={() => setColor(choice)}
              className={`px-4 py-2 text-sm font-medium ${
                color === choice ? 'bg-board-dark text-white' : 'hover:bg-paper'
              }`}
            >
              {t(`bot.colors.${choice}`)}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={start}
          className="rounded-lg bg-accent px-6 py-2.5 font-semibold text-ink shadow-[0_8px_20px_-8px_rgb(224_165_38/0.8)] hover:-translate-y-0.5 hover:brightness-105 motion-safe:transition"
        >
          {t('bot.play')}
        </button>
      </div>
    </div>
  )
}
