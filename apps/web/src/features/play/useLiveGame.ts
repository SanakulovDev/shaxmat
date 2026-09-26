import { useCallback, useEffect, useState } from 'react'
import type { BoardMove } from '../../chess/Board'
import { getSocket } from '../../realtime/socket'
import type { ChatLine, GameView } from './api'

export type GameAction =
  | { type: 'move'; uci: string }
  | {
      type:
        | 'resign'
        | 'abort'
        | 'drawOffer'
        | 'drawAccept'
        | 'drawDecline'
        | 'takebackOffer'
        | 'takebackAccept'
        | 'takebackDecline'
    }

type JoinAck = { state: GameView; chat: ChatLine[] | null } | { error: string }
type Ack = { ok: true } | { error: string }

const ACK_TIMEOUT_MS = 10_000
const CHAT_LIMIT = 50

// Follows one game over the socket. The server owns the game; this hook
// shows its latest state, plus the user's own move until the server
// confirms it.
export function useLiveGame(gameId: string) {
  const [state, setState] = useState<GameView | null>(null)
  const [chat, setChat] = useState<ChatLine[] | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)
  // Server time minus local time, for the clocks.
  const [offset, setOffset] = useState(0)
  const [pendingMove, setPendingMove] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const receive = useCallback((next: GameView) => {
    setState(next)
    setOffset(next.serverNow - Date.now())
    setPendingMove(null)
  }, [])

  useEffect(() => {
    const socket = getSocket()
    let active = true

    // Runs on every (re)connect: the server forgets rooms on disconnect.
    const join = () => {
      socket
        .timeout(ACK_TIMEOUT_MS)
        .emitWithAck('game:join', { gameId })
        .then(
          (ack: JoinAck) => {
            if (!active) return
            if ('error' in ack) {
              setJoinError(ack.error)
              return
            }
            setJoinError(null)
            receive(ack.state)
            setChat(ack.chat)
          },
          () => active && setJoinError('network'),
        )
    }
    const onState = (next: GameView) => {
      if (next.id === gameId) receive(next)
    }
    const onChat = ({ gameId: id, line }: { gameId: string; line: ChatLine }) => {
      if (id !== gameId) return
      setChat((lines) => (lines ? [...lines, line].slice(-CHAT_LIMIT) : lines))
    }

    socket.on('connect', join)
    socket.on('game:state', onState)
    socket.on('game:chat', onChat)
    if (socket.connected) join()
    return () => {
      active = false
      socket.off('connect', join)
      socket.off('game:state', onState)
      socket.off('game:chat', onChat)
      if (socket.connected) socket.emit('game:leave', { gameId })
    }
  }, [gameId, receive])

  const act = useCallback(
    async (action: GameAction) => {
      setActionError(null)
      try {
        const ack: Ack = await getSocket()
          .timeout(ACK_TIMEOUT_MS)
          .emitWithAck('game:action', { gameId, action })
        if ('error' in ack) {
          setActionError(ack.error)
          setPendingMove(null)
        }
      } catch {
        setActionError('network')
        setPendingMove(null)
      }
    },
    [gameId],
  )

  const move = useCallback(
    (boardMove: BoardMove) => {
      const uci = `${boardMove.from}${boardMove.to}${boardMove.promotion ?? ''}`
      setPendingMove(uci)
      void act({ type: 'move', uci })
    },
    [act],
  )

  // Asks the server to check the clocks when one shows zero here.
  const flag = useCallback(() => {
    getSocket().emit('game:flag', { gameId })
  }, [gameId])

  const sendChat = useCallback(
    async (text: string): Promise<string | null> => {
      try {
        const ack: Ack = await getSocket()
          .timeout(ACK_TIMEOUT_MS)
          .emitWithAck('game:chat', { gameId, text })
        return 'error' in ack ? ack.error : null
      } catch {
        return 'network'
      }
    },
    [gameId],
  )

  return {
    state,
    chat,
    joinError,
    offset,
    pendingMove,
    actionError,
    act,
    move,
    flag,
    sendChat,
  }
}
