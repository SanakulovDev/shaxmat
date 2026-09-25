import { type Candidate, mateToCp } from '@shaxmat/chess-core'

export type SearchOptions = {
  depth?: number
  movetimeMs?: number
  multiPv?: number
  // Stockfish "Skill Level", 0-20. Defaults to 20 (full strength).
  skillLevel?: number
  // Enables UCI_LimitStrength with this rating (1320-3190).
  elo?: number
}

export type SearchResult = { bestMove: string; candidates: Candidate[] }

type InfoLine = { multipv: number; move: string; scoreCp: number }

// Parses a UCI "info ... multipv N score (cp X | mate Y) ... pv m1 m2 ..."
// line. Scores are from the side to move's point of view.
export function parseInfoLine(line: string): InfoLine | null {
  const tokens = line.split(' ')
  if (tokens[0] !== 'info') return null
  const pvIndex = tokens.indexOf('pv')
  const scoreIndex = tokens.indexOf('score')
  if (pvIndex === -1 || scoreIndex === -1) return null

  const move = tokens[pvIndex + 1]
  const kind = tokens[scoreIndex + 1]
  const value = Number(tokens[scoreIndex + 2])
  if (!move || Number.isNaN(value)) return null

  const multipvIndex = tokens.indexOf('multipv')
  const multipv = multipvIndex === -1 ? 1 : Number(tokens[multipvIndex + 1])
  const scoreCp = kind === 'mate' ? mateToCp(value) : value
  return { multipv, move, scoreCp }
}

const ENGINE_URL = '/stockfish/stockfish-19-lite-single.js'

// Stockfish in a Web Worker. Searches run one at a time in call order.
export class Engine {
  private readonly worker: Worker
  private onLine: ((line: string) => void) | null = null
  private queue: Promise<unknown>

  constructor(url = ENGINE_URL) {
    this.worker = new Worker(url)
    this.worker.onmessage = (event: MessageEvent) => {
      this.onLine?.(String(event.data))
    }
    this.queue = this.waitFor('uci', 'uciok')
  }

  search(fen: string, options: SearchOptions = {}): Promise<SearchResult> {
    const run = () => this.runSearch(fen, options)
    const result = this.queue.then(run, run)
    this.queue = result.catch(() => undefined)
    return result
  }

  // Ends the current search early; its promise still resolves.
  stop() {
    this.worker.postMessage('stop')
  }

  terminate() {
    this.worker.terminate()
  }

  private waitFor(command: string, doneLine: string): Promise<void> {
    return new Promise((resolve) => {
      this.onLine = (line) => {
        if (line.trim() === doneLine) {
          this.onLine = null
          resolve()
        }
      }
      this.worker.postMessage(command)
    })
  }

  private runSearch(fen: string, options: SearchOptions) {
    const send = (command: string) => this.worker.postMessage(command)
    send(`setoption name MultiPV value ${options.multiPv ?? 1}`)
    send(`setoption name Skill Level value ${options.skillLevel ?? 20}`)
    send(`setoption name UCI_LimitStrength value ${options.elo !== undefined}`)
    if (options.elo !== undefined) {
      send(`setoption name UCI_Elo value ${options.elo}`)
    }
    send(`position fen ${fen}`)

    return new Promise<SearchResult>((resolve) => {
      // Later lines (deeper search) replace earlier ones for the same rank.
      const byRank = new Map<number, Candidate>()
      this.onLine = (line) => {
        const info = parseInfoLine(line)
        if (info) {
          byRank.set(info.multipv, { move: info.move, scoreCp: info.scoreCp })
          return
        }
        if (line.startsWith('bestmove')) {
          this.onLine = null
          const candidates = [...byRank.entries()]
            .sort(([a], [b]) => a - b)
            .map(([, candidate]) => candidate)
          resolve({ bestMove: line.split(' ')[1] ?? '', candidates })
        }
      }
      send(
        options.depth !== undefined
          ? `go depth ${options.depth}`
          : `go movetime ${options.movetimeMs ?? 1000}`,
      )
    })
  }
}

let shared: Engine | null = null

// One engine per page: loading the WASM file is the slow part.
export function getEngine(): Engine {
  shared ??= new Engine()
  return shared
}
