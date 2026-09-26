import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'
import { getAccessToken, refreshSession } from '../api/client'
import { useAuth } from '../auth/store'

// A rejected token is refreshed at most this often, so a server that keeps
// refusing does not cause a refresh loop.
const REFRESH_GAP_MS = 10_000

let socket: Socket | null = null
let lastRefresh = 0

// One connection per tab. It is opened while a session exists; see
// RealtimeBridge.
export function getSocket(): Socket {
  socket ??= createSocket()
  return socket
}

function createSocket(): Socket {
  const created = io({
    path: '/api/socket.io',
    autoConnect: false,
    // Read on every connect, so a refreshed token is sent.
    auth: (send) => send({ token: getAccessToken() }),
  })
  // The server refuses an expired access token. Socket.IO does not retry
  // after a refusal, so refresh the session and connect again.
  created.on('connect_error', (error) => {
    if (error.message !== 'unauthorized') return
    if (Date.now() - lastRefresh < REFRESH_GAP_MS) return
    lastRefresh = Date.now()
    void refreshSession().then((session) => {
      if (session) created.connect()
    })
  })
  return created
}

// Calls the latest `handler` for every `event` while mounted.
export function useSocketEvent<T>(event: string, handler: (payload: T) => void) {
  const latest = useRef(handler)
  useEffect(() => {
    latest.current = handler
  })
  useEffect(() => {
    const target = getSocket()
    const listener = (payload: T) => latest.current(payload)
    target.on(event, listener)
    return () => {
      target.off(event, listener)
    }
  }, [event])
}

// Keeps the socket connected for the signed-in user and refreshes cached
// lists when the server says they changed.
export function RealtimeBridge() {
  const userId = useAuth((state) => state.user?.id ?? null)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) return
    const target = getSocket()
    target.connect()
    return () => {
      target.disconnect()
    }
  }, [userId])

  useSocketEvent('friends:changed', () => {
    void queryClient.invalidateQueries({ queryKey: ['friends'] })
  })
  useSocketEvent('challenges:changed', () => {
    void queryClient.invalidateQueries({ queryKey: ['challenges'] })
  })
  return null
}
