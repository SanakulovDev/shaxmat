import { useSyncExternalStore } from 'react'

// One shared one-second tick, so every running clock on a page changes at
// the same moment instead of drifting apart on timers of their own.
const listeners = new Set<() => void>()
let now = Date.now()
let timer: ReturnType<typeof setInterval> | undefined

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (timer === undefined) {
    now = Date.now()
    timer = setInterval(() => {
      now = Date.now()
      for (const notify of listeners) notify()
    }, 1000)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

function idle() {
  return () => {}
}

// The current time in ms, updated every second while `active`.
export function useNow(active = true): number {
  return useSyncExternalStore(active ? subscribe : idle, () => now)
}
