import { MAX_BOT_LEVEL, MIN_BOT_LEVEL } from '@shaxmat/chess-core'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useSearchParams } from 'react-router'
import { Board } from '../../chess/Board'
import { MoveList } from '../../chess/MoveList'
import type { GameResult } from '@shaxmat/chess-core'
import { BOT_AVATARS } from './avatars'
import { saveBotGame } from './saveBotGame'
import { useBotGame } from './useBotGame'

export function BotGamePage() {
  const [params] = useSearchParams()
  const level = Number(params.get('level'))
  const color = params.get('color') === 'black' ? 'black' : 'white'
  const [round, setRound] = useState(0)

  if (
    !Number.isInteger(level) ||
    level < MIN_BOT_LEVEL ||
    level > MAX_BOT_LEVEL
  ) {
    return <Navigate to="/bot" replace />
  }
  // A new key starts a new game: on a URL change or on "play again".
  return (
    <BotGame
      key={`${level}-${color}-${round}`}
      level={level}
      color={color}
      onRestart={() => setRound((r) => r + 1)}
    />
  )
}

function BotGame({
  level,
  color,
  onRestart,
}: {
  level: number
  color: 'white' | 'black'
  onRestart: () => void
}) {
  const { t } = useTranslation()
  const playerColor = color === 'white' ? 'w' : 'b'
  const game = useBotGame(level, playerColor)
  const { botLevel, result, thinking } = game
  const playerToMove = !result && game.chess.turn() === playerColor
  const queryClient = useQueryClient()
  const saved = useRef(false)

  // Saves the finished game once, for the profile and stage exams.
  useEffect(() => {
    if (!result || saved.current) return
    saved.current = true
    void saveBotGame({
      level,
      color,
      pgn: game.chess.pgn(),
      resigned: result.reason === 'resign',
    }).then(() => queryClient.invalidateQueries({ queryKey: ['progress'] }))
  }, [result, level, color, game.chess, queryClient])

  const hintArrows = game.hintMove
    ? [
        {
          startSquare: game.hintMove.slice(0, 2),
          endSquare: game.hintMove.slice(2, 4),
          color: 'rgba(37, 99, 235, 0.8)',
        },
      ]
    : []

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="mx-auto w-full max-w-[min(100%,calc(100dvh-13rem),36rem)]">
        <PlayerBar
          avatar={BOT_AVATARS[level] ?? ''}
          name={t(`bot.levels.${level}.name`)}
          detail={thinking ? t('bot.thinking') : `~${botLevel.elo}`}
        />
        <Board
          fen={game.fen}
          orientation={color}
          movableColor={playerToMove ? playerColor : null}
          onMove={game.playerMove}
          lastMove={game.lastMove}
          arrows={hintArrows}
        />
        <PlayerBar avatar="🙂" name={t('bot.you')} />
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="font-semibold" aria-live="polite">
            {result
              ? resultText(t, result, playerColor)
              : statusText(t, playerToMove)}
          </p>
          {result && (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={onRestart}
                className="rounded-lg bg-board-dark px-3 py-2 text-sm font-medium text-white"
              >
                {t('bot.again')}
              </button>
              <Link
                to="/bot"
                className="rounded-lg border border-line px-3 py-2 text-sm font-medium"
              >
                {t('bot.changeOpponent')}
              </Link>
            </div>
          )}
        </div>

        <MoveList moves={game.history} label={t('bot.moves')} />

        {!result && (
          <div className="flex flex-wrap gap-2">
            {botLevel.helpers && (
              <>
                <button
                  type="button"
                  onClick={game.takeback}
                  disabled={thinking || game.history.length === 0}
                  className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium disabled:opacity-40"
                >
                  {t('bot.takeback')}
                </button>
                <button
                  type="button"
                  onClick={() => void game.requestHint()}
                  disabled={!playerToMove}
                  className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium disabled:opacity-40"
                >
                  {t('bot.hint')}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={game.resign}
              className="rounded-lg border border-red-200 bg-surface px-3 py-2 text-sm font-medium text-red-700"
            >
              {t('bot.resign')}
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

function PlayerBar({
  avatar,
  name,
  detail,
}: {
  avatar: string
  name: string
  detail?: string
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-2xl" aria-hidden>
        {avatar}
      </span>
      <span className="font-semibold">{name}</span>
      {detail && <span className="text-sm text-muted">{detail}</span>}
    </div>
  )
}

type Translate = (key: string) => string

function statusText(t: Translate, playerToMove: boolean) {
  return t(playerToMove ? 'bot.yourMove' : 'bot.botMove')
}

function resultText(t: Translate, result: GameResult, playerColor: 'w' | 'b') {
  const outcome =
    result.winner === null
      ? 'draw'
      : result.winner === playerColor
        ? 'won'
        : 'lost'
  return `${t(`bot.outcome.${outcome}`)} — ${t(`bot.reason.${result.reason}`)}`
}
