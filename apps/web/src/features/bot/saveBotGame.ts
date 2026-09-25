import { api } from '../../api/client'
import { ensureSession } from '../../auth/store'

export async function saveBotGame(game: {
  level: number
  color: 'white' | 'black'
  pgn: string
  resigned: boolean
}) {
  await ensureSession()
  await api('/games/bot', { method: 'POST', body: game })
}
