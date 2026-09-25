import { useEffect, useRef } from 'react'
import type { TelegramUser } from '../auth/store'

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void
  }
}

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME

// Telegram Login Widget. The bot's domain must be set with /setdomain in
// @BotFather; the widget does not work on plain localhost.
export function TelegramLoginButton({
  onAuth,
}: {
  onAuth: (user: TelegramUser) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!BOT_USERNAME || !container) return

    window.onTelegramAuth = onAuth
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.dataset.telegramLogin = BOT_USERNAME
    script.dataset.size = 'large'
    script.dataset.radius = '8'
    script.dataset.onauth = 'onTelegramAuth(user)'
    script.dataset.requestAccess = 'write'
    container.appendChild(script)

    return () => {
      container.replaceChildren()
      delete window.onTelegramAuth
    }
  }, [onAuth])

  if (!BOT_USERNAME) return null
  return <div ref={containerRef} className="flex justify-center" />
}
