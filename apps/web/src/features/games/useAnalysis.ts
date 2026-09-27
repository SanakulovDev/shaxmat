import { useEffect, useRef, useState } from 'react'
import { Engine, type EngineLine, type SearchOptions } from '../../chess/engine'
import { finalVerdict, type PositionEval, toWhite } from './analysis'

// Depth for scoring every move of a game: quick enough for 80 moves in
// about half a minute, deep enough to spot most mistakes.
const REVIEW_DEPTH = 12
// Depth for the shown position, reported as it grows.
const LIVE_DEPTH = 18
const LIVE_LINES = 3

async function evaluate(engine: Engine, fen: string, options: SearchOptions) {
  const final = finalVerdict(fen)
  if (final) return final
  const { lines } = await engine.search(fen, options)
  const top = lines[0]
  return top ? toWhite(top, fen) : { cp: 0, mate: null, best: null, depth: 0 }
}

// Scores every position of a game, first to last, with an engine of its own
// so it never waits behind the shown position. Positions added later, as in
// a live game, are scored as they arrive. Scores are keyed by FEN.
export function useGameReview(fens: readonly string[]): ReadonlyMap<string, PositionEval> {
  const [scores, setScores] = useState<ReadonlyMap<string, PositionEval>>(() => new Map())
  const wanted = useRef<readonly string[]>([])
  const wake = useRef(() => {})

  useEffect(() => {
    wanted.current = fens
    wake.current()
  }, [fens])

  useEffect(() => {
    const engine = new Engine()
    const done = new Map<string, PositionEval>()
    let alive = true
    async function run() {
      while (alive) {
        const fen = wanted.current.find((f) => !done.has(f))
        if (fen === undefined) {
          await new Promise<void>((resolve) => {
            wake.current = resolve
          })
          continue
        }
        done.set(fen, await evaluate(engine, fen, { depth: REVIEW_DEPTH }))
        if (alive) setScores(new Map(done))
      }
    }
    void run()
    return () => {
      alive = false
      wake.current()
      engine.terminate()
    }
  }, [])

  return scores
}

export type LiveEval = {
  fen: string
  // Best lines first, scores from the side to move.
  lines: EngineLine[]
  done: boolean
}

// Searches the shown position and reports each finished depth. Moving to
// another position stops the search; positions skipped past are never
// searched.
export function usePositionEval(fen: string): LiveEval | null {
  const engine = useRef<Engine | null>(null)
  const queue = useRef<Promise<unknown>>(Promise.resolve())
  const [state, setState] = useState<LiveEval | null>(null)

  useEffect(() => {
    const created = new Engine()
    engine.current = created
    queue.current = Promise.resolve()
    return () => {
      created.terminate()
      engine.current = null
    }
  }, [])

  useEffect(() => {
    const current = engine.current
    if (!current || finalVerdict(fen)) return
    let wanted = true
    queue.current = queue.current.then(async () => {
      if (!wanted) return
      const result = await current.search(fen, {
        depth: LIVE_DEPTH,
        multiPv: LIVE_LINES,
        onUpdate: (lines) => {
          if (wanted) setState({ fen, lines, done: false })
        },
      })
      if (wanted) setState({ fen, lines: result.lines, done: true })
    })
    return () => {
      wanted = false
      current.stop()
    }
  }, [fen])

  return state?.fen === fen ? state : null
}
